/* eslint-disable @n8n/community-nodes/require-node-api-error -- Transport emits sanitized CardError; execute converts it to NodeOperationError with item context. */
import { createHash } from 'crypto';
import type { IHttpRequestOptions } from 'n8n-workflow';

export type Json = Record<string, unknown>;
export type Request = (options: IHttpRequestOptions) => Promise<unknown>;
export const API_BASE = 'https://api.dingtalk.com';
export type CardErrorCategory =
	| 'validation'
	| 'authentication'
	| 'network'
	| 'http'
	| 'business'
	| 'incomplete'
	| 'internal';
export interface CardErrorDetails {
	code: string;
	category: CardErrorCategory;
	retryable: boolean;
	mayHaveSucceeded: boolean;
	httpStatus?: number;
}

function safeCode(value: unknown): string {
	return typeof value === 'string' && /^[a-zA-Z0-9_.-]{1,100}$/.test(value)
		? value
		: 'DINGTALK_ERROR';
}

function validHttpStatus(value: unknown): number | undefined {
	const status =
		typeof value === 'number'
			? value
			: typeof value === 'string' && /^\d{3}$/.test(value)
				? Number(value)
				: undefined;
	return status !== undefined && Number.isInteger(status) && status >= 100 && status <= 599
		? status
		: undefined;
}

export class CardError extends Error {
	readonly code: string;
	readonly category: CardErrorCategory;
	readonly retryable: boolean;
	readonly mayHaveSucceeded: boolean;
	readonly httpStatus?: number;

	constructor(
		message: string,
		code = 'DINGTALK_ERROR',
		metadata: Partial<Omit<CardErrorDetails, 'code'>> = {},
	) {
		super(message);
		this.code = safeCode(code);
		this.category = metadata.category ?? 'validation';
		this.retryable = metadata.retryable ?? false;
		this.mayHaveSucceeded = metadata.mayHaveSucceeded ?? false;
		this.httpStatus = validHttpStatus(metadata.httpStatus);
	}
}
export function object(value: unknown): value is Json {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function failure(value: unknown): Json | undefined {
	if (Array.isArray(value)) {
		for (const entry of value) {
			const found = failure(entry);
			if (found) return found;
		}
	} else if (object(value)) {
		if (
			value.success === false ||
			value.result === false ||
			(value.code !== undefined &&
				![0, '0', 'OK', 'Success'].includes(value.code as string | number)) ||
			(value.errcode !== undefined && value.errcode !== 0 && value.errcode !== '0')
		)
			return value;
		for (const key of ['result', 'deliverResults']) {
			const found = failure(value[key]);
			if (found) return found;
		}
	}
	return undefined;
}
// Includes documented result.deliverResults and observed result:[{success:false}] variants.
// https://open.dingtalk.com/document/orgapp/create-and-deliver-cards
function hasPartialDelivery(value: unknown): boolean {
	if (Array.isArray(value)) {
		const hasSuccess = value.some((entry) => object(entry) && entry.success === true);
		const hasFailure = value.some((entry) => object(entry) && failure(entry) !== undefined);
		return (hasSuccess && hasFailure) || value.some((entry) => hasPartialDelivery(entry));
	}
	if (!object(value)) return false;
	return ['result', 'deliverResults'].some((key) => hasPartialDelivery(value[key]));
}

export function checkBusinessResponse(value: unknown, phase: 'token' | 'write' = 'write'): Json {
	if (!object(value))
		throw new CardError('DingTalk returned an invalid response body.', 'DINGTALK_ERROR', {
			category: 'incomplete',
			mayHaveSucceeded: phase === 'write',
		});
	const failed = failure(value);
	if (failed) {
		const code = safeCode(failed.code ?? failed.errcode);
		const invalidToken = invalidTokens.has(code);
		const partialDelivery = phase === 'write' && hasPartialDelivery(value);
		throw new CardError(
			phase === 'token'
				? `DingTalk rejected token acquisition (${code}). Check enterprise app credentials and permissions.`
				: `DingTalk rejected the request (${code}). Check app permissions, published template, target membership and payload. Some deliveries may already have succeeded; inspect the card before retrying.`,
			code,
			{
				category:
					phase === 'token' || invalidToken
						? 'authentication'
						: partialDelivery
							? 'incomplete'
							: 'business',
				retryable: phase === 'write' && invalidToken,
				mayHaveSucceeded: phase === 'write' && !invalidToken,
			},
		);
	}
	return value;
}

async function send(request: Request, options: IHttpRequestOptions): Promise<unknown> {
	try {
		return await request({ ...options, json: true, timeout: 30000, disableFollowRedirect: true });
	} catch (error) {
		// Only bounded status and documented API code survive; never retain the original error/cause.
		const e = object(error) ? error : {};
		const response = object(e.response) ? e.response : {};
		let data = response.body ?? response.data ?? e.error;
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data);
			} catch {
				data = {};
			}
		}
		const code = object(data) ? safeCode(data.code ?? data.errcode) : 'DINGTALK_ERROR';
		const status = validHttpStatus(response.status ?? response.statusCode ?? e.statusCode ?? e.httpCode);
		const tokenRequest = options.url.endsWith('/v1.0/oauth2/accessToken');
		const invalidToken = invalidTokens.has(code);
		const authenticationStatus = status === 401 || status === 403;
		const category: CardErrorCategory = invalidToken
			? 'authentication'
			: status === undefined
				? 'network'
				: authenticationStatus
					? 'authentication'
					: 'http';
		const label =
			status !== undefined
				? `HTTP ${status}`
				: 'network/timeout failure';
		throw new CardError(
			`DingTalk ${label} (${code}). Check connectivity, app credentials, API permissions and payload. ${tokenRequest ? 'Token acquisition failed before the card write.' : 'A write may have succeeded; verify before retrying.'}`,
			code,
			{
				category,
				retryable:
					(!tokenRequest && invalidToken) ||
					(tokenRequest &&
						!invalidToken &&
						(status === undefined || status === 408 || status === 429 || status >= 500)),
				mayHaveSucceeded: !tokenRequest && !invalidToken && !authenticationStatus,
				httpStatus: status,
			},
		);
	}
}

interface Token {
	value: string;
	expiresAt: number;
}
// Process-local, bounded cache keyed by a digest of app identity + secret (rotation invalidates cache).
// Never persist tokens in workflow static data or execution outputs.
const tokens = new Map<string, Token>();
const pending = new Map<string, Promise<Token>>();
const invalidTokens = new Set([
	'InvalidAuthentication',
	'InvalidAccessToken',
	'AccessTokenExpired',
	'InvalidAuthentication.AccessTokenExpired',
	'InvalidAuthentication.InvalidAccessToken',
]);
export function createClient(request: Request, appKey: string, appSecret: string, now = Date.now) {
	if (!appKey || !appSecret)
		throw new CardError(
			'Configure Client ID and Client Secret in the DingTalk Card API credential.',
			'DINGTALK_ERROR',
			{ category: 'authentication' },
		);
	const cacheKey = createHash('sha256')
		.update(JSON.stringify([appKey, appSecret]))
		.digest('hex');
	async function token(): Promise<Token> {
		const existing = tokens.get(cacheKey);
		if (existing && existing.expiresAt > now()) return existing;
		const inflight = pending.get(cacheKey);
		if (inflight) return await inflight;
		const acquisition = (async () => {
			// https://open.dingtalk.com/document/orgapp/obtain-the-access_token-of-an-internal-app
			const body = checkBusinessResponse(
				await send(request, {
					method: 'POST',
					url: `${API_BASE}/v1.0/oauth2/accessToken`,
					body: { appKey, appSecret },
				}),
				'token',
			);
			if (
				typeof body.accessToken !== 'string' ||
				!body.accessToken ||
				typeof body.expireIn !== 'number' ||
				!Number.isFinite(body.expireIn) ||
				body.expireIn <= 0
			)
				throw new CardError(
					'DingTalk token response is missing accessToken or a valid expireIn. Check enterprise app credentials.',
					'DINGTALK_ERROR',
					{ category: 'authentication' },
				);
			const entry = {
				value: body.accessToken,
				expiresAt: now() + Math.max(0, body.expireIn - 60) * 1000,
			};
			if (tokens.size >= 100) tokens.delete(tokens.keys().next().value!);
			tokens.set(cacheKey, entry);
			return entry;
		})();
		pending.set(cacheKey, acquisition);
		try {
			return await acquisition;
		} finally {
			pending.delete(cacheKey);
		}
	}
	const call = async (method: 'POST' | 'PUT', path: string, body: Json): Promise<Json> => {
		for (let attempt = 0; ; attempt++) {
			const auth = await token();
			try {
				const response = checkBusinessResponse(
					await send(request, {
						method,
						url: `${API_BASE}${path}`,
						headers: { 'x-acs-dingtalk-access-token': auth.value },
						body,
					}),
				);
				const validResult = path.endsWith('/createAndDeliver')
					? object(response.result) &&
						Array.isArray(response.result.deliverResults) &&
						response.result.deliverResults.length > 0 &&
						response.result.deliverResults.every(
							(delivery: unknown) => object(delivery) && delivery.success === true,
						)
					: response.result === true;
				if (response.success !== true || !validResult) {
					throw new CardError(
						'DingTalk returned an incomplete card response. Verify the card before retrying.',
						'DINGTALK_ERROR',
						{ category: 'incomplete', mayHaveSucceeded: true },
					);
				}
				return response;
			} catch (error) {
				// Only retry an explicit authentication rejection, preserving outTrackId/guid/payload.
				if (attempt === 0 && error instanceof CardError && invalidTokens.has(error.code)) {
					if (tokens.get(cacheKey) === auth) tokens.delete(cacheKey);
					continue;
				}
				throw error;
			}
		}
	};
	return Object.assign(call, {
		test: async () => {
			await token();
		},
	});
}

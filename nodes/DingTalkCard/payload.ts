/* eslint-disable @n8n/community-nodes/require-node-api-error -- Pure payload validation is converted to NodeOperationError at the execution boundary. */
import { randomUUID } from 'crypto';
import { CardError, object, type Json } from './transport';

export type Operation = 'createAndDeliver' | 'update' | 'stream' | 'finalize';
export function jsonObject(value: unknown, label: string): Json {
	let parsed = value;
	if (typeof value === 'string') {
		try {
			parsed = JSON.parse(value);
		} catch {
			throw new CardError(`${label} must be valid JSON.`);
		}
	}
	if (!object(parsed)) throw new CardError(`${label} must be a JSON object.`);
	return parsed;
}
function text(value: unknown, label: string): string {
	if (typeof value !== 'string' || !value.trim())
		throw new CardError(`${label} must be a non-empty string.`);
	return value;
}
export function cardData(value: unknown): Json {
	const data = jsonObject(value, 'Card Data');
	if (
		!object(data.cardParamMap) ||
		Object.values(data.cardParamMap).some((v) => typeof v !== 'string')
	)
		throw new CardError(
			'Card Data must contain cardParamMap with string values. Encode structured template values as JSON strings.',
		);
	return data;
}
export function formCardData(
	entries: Array<{ name: string; value: string; valueMode?: string }>,
): Json {
	const map: Record<string, string> = Object.create(null);
	for (const entry of entries) {
		const name = text(entry.name, 'Parameter name');
		if (Object.hasOwn(map, name)) throw new CardError('Card parameter names must be unique.');
		if (typeof entry.value !== 'string')
			throw new CardError('Card parameter values must be strings.');
		if (entry.valueMode === 'json') {
			let parsed: unknown;
			try {
				parsed = JSON.parse(entry.value);
			} catch {
				throw new CardError(`Card parameter "${name}" must contain valid JSON.`);
			}
			map[name] = JSON.stringify(parsed);
		} else map[name] = entry.value;
	}
	return { cardParamMap: map };
}
export function buildRequest(
	operation: Operation,
	input: Json,
): { method: 'POST' | 'PUT'; path: string; body: Json } {
	const body = { ...input };
	if (operation === 'createAndDeliver' && (body.outTrackId === '' || body.outTrackId === undefined))
		body.outTrackId = randomUUID();
	body.outTrackId = text(body.outTrackId, 'Out Track ID');
	if (operation === 'createAndDeliver') {
		body.cardTemplateId = text(body.cardTemplateId, 'Card Template ID');
		body.cardData = cardData(body.cardData);
		const space = text(body.openSpaceId, 'Open Space ID');
		if (!/^dtv1\.card\/\/[^.]+\..+/.test(space))
			throw new CardError('Open Space ID must use dtv1.card//SPACE_TYPE.spaceId format.');
		if (
			![
				'imGroupOpenDeliverModel',
				'imRobotOpenDeliverModel',
				'imSingleOpenDeliverModel',
				'topOpenDeliverModel',
				'docOpenDeliverModel',
			].some((k) => object(body[k]))
		)
			throw new CardError('Provide a delivery model matching Open Space ID.');
		return { method: 'POST', path: '/v1.0/card/instances/createAndDeliver', body };
	}
	if (operation === 'update') {
		if (body.cardData !== undefined) body.cardData = cardData(body.cardData);
		if (body.cardData === undefined && !object(body.privateData))
			throw new CardError('Provide Card Data or Private Data to update.');
		return { method: 'PUT', path: '/v1.0/card/instances', body };
	}
	if (operation !== 'stream' && operation !== 'finalize')
		throw new CardError('Unsupported operation.');
	body.key = text(body.key, 'Streaming Key');
	body.guid =
		body.guid === '' || body.guid === undefined ? randomUUID() : text(body.guid, 'Request GUID');
	if (typeof body.content !== 'string')
		throw new CardError('Streaming Content must be a string (empty is allowed).');
	for (const key of ['isFull', 'isFinalize', 'isError']) {
		if (body[key] !== undefined && typeof body[key] !== 'boolean')
			throw new CardError(`${key} must be a boolean.`);
	}
	body.isFull ??= true;
	body.isError ??= false;
	body.isFinalize ??= false;
	// Official API: isError enters the error state; isFinalize enters the completed state.
	// https://open.dingtalk.com/document/isvapp/api-streamingupdate
	if (operation === 'finalize') body.isFinalize = !body.isError;
	if (body.isError && body.isFinalize)
		throw new CardError('Choose either error or completed state, not both.');
	return { method: 'PUT', path: '/v1.0/card/streaming', body };
}

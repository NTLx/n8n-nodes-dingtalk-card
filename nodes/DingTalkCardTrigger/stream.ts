/* eslint-disable @n8n/community-nodes/no-restricted-globals -- Long-lived trigger timers must be cancellable. Pinned n8n-workflow 2.44.2 exports sleep but no sleepWithAbort; tracked timers are cleared on deactivation. */
import { CardError, object, type Json, type Request } from '../DingTalkCard/transport';

export const CARD_TOPIC = '/v1.0/card/instances/callback';
const activeClients = new Set<string>();
type Socket = Pick<
	WebSocket,
	'readyState' | 'send' | 'close' | 'onopen' | 'onmessage' | 'onerror' | 'onclose'
>;
interface Dependencies {
	request: Request;
	emit: (item: Json) => void;
	warn: (message: string) => void;
	includeRawData?: boolean;
	socket?: (url: string) => Socket;
	setTimer?: typeof setTimeout;
	clearTimer?: typeof clearTimeout;
}
function parse(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}
function normalizedParams(value: unknown): unknown {
	if (!object(value) || Object.keys(value).length !== 1 || typeof value.params !== 'string') return parse(value);
	const parsed = parse(value.params);
	return object(parsed) ? parsed : value;
}
export function normalizeCallback(frame: Json, receivedAt = new Date().toISOString(), includeRawData = true): Json {
	const headers = object(frame.headers) ? frame.headers : {};
	const data = parse(frame.data);
	const body = object(data) ? data : {};
	const content = parse(body.content);
	const details = object(content) ? content : {};
	const result: Json = {
		type: frame.type,
		specVersion: frame.specVersion ?? null,
		headers,
		topic: headers.topic,
		messageId: headers.messageId,
		receivedAt,
		data: data ?? null,
	};
	if (includeRawData) result.rawData = frame.data ?? null;
	if (object(content)) result.content = content;
	const directPrivate = body.cardPrivateData ?? details.cardPrivateData;
	const officialAction = body.cardActionData ?? details.cardActionData;
	const officialPrivate = object(officialAction) ? officialAction.cardPrivateData : undefined;
	const privateData = parse(directPrivate ?? officialPrivate);
	if (privateData !== undefined) result.cardPrivateData = privateData;
	const params =
		body.params ?? details.params ?? (object(privateData) ? privateData.params : undefined);
	if (params !== undefined) result.params = parse(params);
	const supplied = (key: string) => {
		if (Object.hasOwn(body, key)) return body[key];
		if (Object.hasOwn(details, key)) return details[key];
		return undefined;
	};
	const selectedPrivate = privateData;
	const normalizedInteraction: Record<string, unknown> = {};
	const interactionType = body.type ?? details.type;
	if (typeof interactionType === 'string') normalizedInteraction.type = interactionType;
	if (object(selectedPrivate) && Array.isArray(selectedPrivate.actionIds) && selectedPrivate.actionIds.every((id) => typeof id === 'string')) normalizedInteraction.actionIds = selectedPrivate.actionIds;
	if (params !== undefined) normalizedInteraction.params = normalizedParams(parse(params));
	const value = body.value ?? details.value;
	if (value !== undefined) normalizedInteraction.value = parse(value);
	const actor: Record<string, unknown> = {};
	for (const key of ['userId', 'userIdType', 'openId', 'unionId', 'operatorId', 'operatorUserId']) {
		const value = supplied(key);
		if (value !== undefined) actor[key] = value;
	}
	const card: Record<string, unknown> = {};
	const outTrackId = supplied('outTrackId');
	if (outTrackId !== undefined) card.outTrackId = outTrackId;
	const conversation: Record<string, unknown> = {};
	for (const key of ['spaceId', 'spaceType']) {
		const value = supplied(key);
		if (value !== undefined) conversation[key] = value;
	}
	const correlation: Record<string, unknown> = {};
	if (typeof headers.messageId === 'string' && headers.messageId) correlation.messageId = headers.messageId;
	if (headers.topic === CARD_TOPIC) correlation.topic = headers.topic;
	const normalized: Record<string, unknown> = { schemaVersion: '1', interaction: normalizedInteraction, actor, card, conversation, correlation };
	const eventTime = headers.time;
	if ((typeof eventTime === 'number' || (typeof eventTime === 'string' && eventTime.trim() !== '')) && Number.isFinite(Number(eventTime))) {
		const date = new Date(Number(eventTime));
		if (Number.isFinite(date.getTime())) normalized.eventTime = date.toISOString();
	}
	result.normalized = normalized;
	// Preserve source names and values. These identifiers are not interchangeable.
	for (const key of [
		'outTrackId',
		'userId',
		'userIdType',
		'openId',
		'unionId',
		'operatorId',
		'operatorUserId',
	]) {
		const value = body[key] ?? details[key];
		if (value !== undefined) result[key] = value;
	}
	return result;
}

export function createCardStream(clientId: string, clientSecret: string, deps: Dependencies) {
	if (!clientId || !clientSecret)
		throw new CardError(
			'Configure Client ID and Client Secret in the DingTalk Card API credential.',
		);
	if (activeClients.has(clientId))
		throw new CardError(
			'Another DingTalk Card Trigger is active for this Client ID in this process. Use one Stream service per Client ID.',
		);
	activeClients.add(clientId);
	const abort = new AbortController();
	const setTimer = deps.setTimer ?? setTimeout;
	const clearTimer = deps.clearTimer ?? clearTimeout;
	let stopped = false;
	let started = false;
	let socket: Socket | undefined;
	let reconnect: ReturnType<typeof setTimeout> | undefined;
	let watchdog: ReturnType<typeof setTimeout> | undefined;
	let attempts = 0;

	function clearWatchdog() {
		if (watchdog !== undefined) clearTimer(watchdog);
		watchdog = undefined;
	}
	function closeSocket() {
		clearWatchdog();
		const previous = socket;
		socket = undefined;
		if (!previous) return;
		previous.onopen = previous.onmessage = previous.onerror = previous.onclose = null;
		try {
			previous.close();
		} catch {
			// Never retain or report native errors: they can include the ticket URL.
		}
	}
	function retry() {
		closeSocket();
		if (stopped || reconnect !== undefined) return;
		const delay = Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5));
		reconnect = setTimer(() => {
			reconnect = undefined;
			void connect();
		}, delay);
	}
	function watch(ms: number) {
		clearWatchdog();
		watchdog = setTimer(() => {
			deps.warn('DingTalk Card Stream connection timed out; reconnecting.');
			retry();
		}, ms);
	}
	function acknowledge(current: Socket, messageId: string, data: unknown) {
		current.send(
			JSON.stringify({
				code: 200,
				message: 'OK',
				headers: { messageId, contentType: 'application/json' },
				data: JSON.stringify(data),
			}),
		);
	}
	async function connect() {
		try {
			// Fixed origin, no redirects; do not use the outbound error wrapper, which retains API codes.
			const gateway = await deps.request({
				method: 'POST',
				url: 'https://api.dingtalk.com/v1.0/gateway/connections/open',
				body: {
					clientId,
					clientSecret,
					subscriptions: [{ type: 'CALLBACK', topic: CARD_TOPIC }],
					ua: 'n8n-nodes-dingtalk-card/0.2.0-beta.1',
				},
				json: true,
				timeout: 30000,
				disableFollowRedirect: true,
				abortSignal: abort.signal,
			});
			if (stopped) return;
			if (
				!object(gateway) ||
				typeof gateway.endpoint !== 'string' ||
				typeof gateway.ticket !== 'string' ||
				!gateway.ticket
			)
				throw new CardError('Invalid gateway response.');
			// Validate endpoint before adding the ticket. Reject userinfo/fragments and insecure schemes.
			const url = new URL(gateway.endpoint);
			if (url.protocol !== 'wss:' || url.username || url.password || url.hash)
				throw new CardError('Invalid secure endpoint.');
			url.searchParams.set('ticket', gateway.ticket);
			const current = (deps.socket ?? ((address) => new WebSocket(address)))(url.toString());
			socket = current;
			watch(30000);
			current.onopen = () => {
				if (stopped || socket !== current) return;
				watch(120000);
			};
			current.onerror = () => {
				if (stopped || socket !== current) return;
				deps.warn('DingTalk Card Stream connection failed; reconnecting.');
				retry();
			};
			current.onclose = () => {
				if (!stopped && socket === current) retry();
			};
			current.onmessage = (event) => {
				if (stopped || socket !== current) return;
				watch(120000);
				const frame = parse(event.data);
				if (!object(frame) || !object(frame.headers)) return;
				const { topic, messageId } = frame.headers;
				if (frame.type === 'SYSTEM' && topic === 'disconnect') {
					retry();
					return;
				}
				if (typeof messageId !== 'string' || !messageId) return;
				try {
					if (frame.type === 'SYSTEM' && topic === 'ping') {
						const data = parse(frame.data);
						acknowledge(current, messageId, object(data) ? { opaque: data.opaque } : {});
						attempts = 0;
					} else if (frame.type === 'CALLBACK' && topic === CARD_TOPIC) {
						// ACK must be queued before normalization/emit, never after downstream processing.
						acknowledge(current, messageId, {});
						attempts = 0;
						deps.emit(normalizeCallback(frame, new Date().toISOString(), deps.includeRawData !== false));
					}
				} catch {
					deps.warn('DingTalk Card Stream message handling failed; reconnecting.');
					retry();
				}
			};
		} catch {
			if (stopped) return;
			deps.warn(
				'DingTalk Card Stream could not connect. Check credentials and connectivity; reconnecting.',
			);
			retry();
		}
	}
	return {
		start() {
			if (started || stopped) return;
			started = true;
			void connect();
		},
		stop() {
			if (stopped) return;
			stopped = true;
			abort.abort();
			if (reconnect !== undefined) clearTimer(reconnect);
			reconnect = undefined;
			closeSocket();
			activeClients.delete(clientId);
		},
	};
}

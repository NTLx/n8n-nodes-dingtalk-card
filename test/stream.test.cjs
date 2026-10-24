const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const {
	createCardStream,
	normalizeCallback,
	CARD_TOPIC,
} = require('../dist/nodes/DingTalkCardTrigger/stream');
const {
	DingTalkCardTrigger,
} = require('../dist/nodes/DingTalkCardTrigger/DingTalkCardTrigger.node');
const tick = () => new Promise((resolve) => setImmediate(resolve));
const ticket = 'PRIVATE-TICKET-sentinel+?&#';
const secret = 'PRIVATE-CLIENT-SECRET-sentinel';
const gateway = { endpoint: 'wss://example.invalid/connect?existing=1', ticket };
function frame(data = '{}', topic = CARD_TOPIC, type = 'CALLBACK') {
	return { type, specVersion: '1.0', headers: { topic, messageId: 'fixture-message' }, data };
}
function fixture(t, overrides = {}, clientId = randomUUID()) {
	const timers = new Map();
	const sockets = [];
	const requests = [];
	const logs = [];
	const events = [];
	const sent = [];
	const stream = createCardStream(clientId, secret, {
		request: async (o) => {
			requests.push(o);
			return gateway;
		},
		emit: (item) => events.push(['emit', item]),
		warn: (message) => logs.push(message),
		socket: (url) => {
			const s = {
				url,
				readyState: 0,
				closed: 0,
				send(data) {
					sent.push(JSON.parse(data));
					events.push(['ack']);
				},
				close() {
					this.closed++;
				},
			};
			sockets.push(s);
			return s;
		},
		setTimer: (fn, ms) => {
			const key = {};
			timers.set(key, { fn, ms });
			return key;
		},
		clearTimer: (key) => timers.delete(key),
		...overrides,
	});
	t.after(() => stream.stop());
	return {
		stream,
		timers,
		sockets,
		requests,
		logs,
		events,
		sent,
		clientId,
		fire(ms) {
			const [key, value] = [...timers].find(([, v]) => v.ms === ms) ?? [];
			assert.ok(value, `timer ${ms}`);
			timers.delete(key);
			value.fn();
		},
	};
}
function message(socket, value) {
	socket.onmessage({ data: JSON.stringify(value) });
}

test('normalizes callback JSON with content/private params and unchanged identifier names', () => {
	const data = {
		outTrackId: 'fixture-track',
		userId: 'fixture-user',
		userIdType: 1,
		content: JSON.stringify({
			cardPrivateData: { action: 'confirm' },
			params: { input: 'test' },
			operatorId: 'fixture-operator',
		}),
	};
	const f = frame(JSON.stringify(data));
	const result = normalizeCallback(f, 'fixed-time');
	assert.deepEqual(result, {
		...f,
		topic: CARD_TOPIC,
		messageId: 'fixture-message',
		receivedAt: 'fixed-time',
		data,
		rawData: f.data,
		content: JSON.parse(data.content),
		cardPrivateData: { action: 'confirm' },
		params: { input: 'test' },
		outTrackId: 'fixture-track',
		userId: 'fixture-user',
		userIdType: 1,
		operatorId: 'fixture-operator',
	});
	assert.deepEqual(
		normalizeCallback(
			frame(JSON.stringify({ content: { cardPrivateData: { params: { action: 'submit' } } } })),
		).params,
		{ action: 'submit' },
	);
	assert.equal(normalizeCallback(frame('null')).data, null);
	assert.deepEqual(
		normalizeCallback(frame({ content: { params: '{}' }, params: { own: true } })).params,
		{ own: true },
	);
	assert.equal(Object.hasOwn(normalizeCallback(frame('{')), 'content'), false);
});

test('only exact CALLBACK topic is emitted as one item, after empty 200 ACK; malformed data also ACKs', async (t) => {
	const f = fixture(t);
	f.stream.start();
	await tick();
	const s = f.sockets[0];
	s.readyState = 1;
	s.onopen();
	for (const data of ['{"outTrackId":"fixture-track"}', '{invalid-json']) {
		f.events.length = 0;
		message(s, frame(data));
		assert.deepEqual(
			f.events.map(([type]) => type),
			['ack', 'emit'],
		);
		assert.equal(f.events[1][1].rawData, data);
		assert.deepEqual(f.events[1][1].data, data.startsWith('{invalid') ? data : JSON.parse(data));
		assert.deepEqual(f.sent.at(-1), {
			code: 200,
			message: 'OK',
			headers: { messageId: 'fixture-message', contentType: 'application/json' },
			data: '{}',
		});
	}
	const count = f.events.length;
	for (const v of [
		frame('{}', CARD_TOPIC + '/extra'),
		frame('{}', CARD_TOPIC, 'EVENT'),
		frame('{}', '/v1.0/im/bot/messages/get'),
		{ ...frame(), headers: {} },
	])
		message(s, v);
	s.onmessage({ data: '{broken-envelope' });
	assert.equal(f.events.length, count);
	assert.equal(f.logs.length, 0);
});

test('gateway contract is scoped; validates endpoint before ticket and preserves URL encoding', async (t) => {
	const f = fixture(t);
	f.stream.start();
	await tick();
	assert.deepEqual(f.requests[0].body.subscriptions, [{ type: 'CALLBACK', topic: CARD_TOPIC }]);
	assert.equal(f.requests[0].body.clientSecret, secret);
	assert.equal(f.requests[0].url, 'https://api.dingtalk.com/v1.0/gateway/connections/open');
	assert.equal(f.requests[0].disableFollowRedirect, true);
	assert.equal(f.requests[0].timeout, 30000);
	const url = new URL(f.sockets[0].url);
	assert.equal(url.searchParams.get('ticket'), ticket);
	assert.equal(url.searchParams.get('existing'), '1');
	for (const endpoint of [
		'ws://example.invalid',
		'https://example.invalid',
		'wss://user:password@example.invalid',
		'wss://example.invalid/#fragment',
		ticket,
	]) {
		const invalid = fixture(t, { request: async () => ({ endpoint, ticket }) });
		invalid.stream.start();
		await tick();
		assert.equal(invalid.sockets.length, 0);
		assert.equal(invalid.logs.length, 1);
		assert.doesNotMatch(invalid.logs.join(''), /PRIVATE|password/);
	}
});

test('SYSTEM ping echoes opaque; disconnect schedules reconnect with no workflow output', async (t) => {
	const f = fixture(t);
	f.stream.start();
	await tick();
	message(f.sockets[0], frame('{"opaque":"fixture-opaque"}', 'ping', 'SYSTEM'));
	assert.equal(f.sent[0].data, '{"opaque":"fixture-opaque"}');
	assert.equal(f.sent[0].headers.messageId, 'fixture-message');
	assert.equal(f.events.filter(([type]) => type === 'emit').length, 0);
	message(f.sockets[0], frame('{}', 'disconnect', 'SYSTEM'));
	assert.equal(f.sockets[0].closed, 1);
	assert.deepEqual(
		[...f.timers.values()].map((v) => v.ms),
		[1000],
	);
});

test('unexpected close reconnects with fresh gateway lookup and bounded backoff; stop cancels queued work', async (t) => {
	const f = fixture(t);
	f.stream.start();
	await tick();
	for (const delay of [1000, 2000, 4000, 8000, 16000, 30000, 30000]) {
		f.sockets.at(-1).onclose({ reason: ticket });
		assert.deepEqual(
			[...f.timers.values()].map((v) => v.ms),
			[delay],
		);
		f.fire(delay);
		await tick();
	}
	assert.equal(f.requests.length, 8);
	f.sockets.at(-1).onclose();
	f.stream.stop();
	f.stream.stop();
	assert.equal(f.timers.size, 0);
	assert.equal(f.logs.length, 0);
});

test('stop during gateway lookup never constructs socket and releases lock without stopping new owner', async (t) => {
	let resolve;
	let signal;
	const f = fixture(t, {
		request: (options) =>
			new Promise((r) => {
				signal = options.abortSignal;
				resolve = r;
			}),
	});
	f.stream.start();
	f.stream.stop();
	assert.equal(signal.aborted, true);
	const next = fixture(t, {}, f.clientId);
	next.stream.start();
	await tick();
	resolve(gateway);
	await tick();
	assert.equal(f.sockets.length, 0);
	assert.equal(f.timers.size, 0);
	f.stream.stop();
	assert.throws(() => fixture(t, {}, f.clientId), /Another DingTalk Card Trigger/);
});

test('pending and active sockets close, detach handlers and cancel connection/idle timers on stop', async (t) => {
	for (const opened of [false, true]) {
		const f = fixture(t);
		f.stream.start();
		f.stream.start();
		await tick();
		const s = f.sockets[0];
		if (opened) {
			s.readyState = 1;
			s.onopen();
		}
		const lateMessage = s.onmessage;
		f.stream.stop();
		assert.equal(s.closed, 1);
		assert.equal(s.onmessage, null);
		assert.equal(f.timers.size, 0);
		lateMessage({ data: JSON.stringify(frame()) });
		assert.equal(f.events.length, 0);
		assert.equal(f.requests.length, 1);
	}
});

test('process-local duplicate Client ID fails before request; lock releases on close', async (t) => {
	const f = fixture(t);
	f.stream.start();
	await tick();
	assert.throws(() => fixture(t, {}, f.clientId), /Another DingTalk Card Trigger/);
	f.stream.stop();
	const next = fixture(t, {}, f.clientId);
	next.stream.start();
	await tick();
	assert.equal(next.sockets.length, 1);
});

test('constructor, gateway, send and error-event secrets never enter diagnostics or emitted items', async (t) => {
	for (const path of ['gateway', 'constructor', 'event', 'send']) {
		const overrides =
			path === 'gateway'
				? {
						request: async () => {
							throw new Error(JSON.stringify({ clientSecret: secret, ticket }));
						},
					}
				: path === 'constructor'
					? {
							socket: (url) => {
								throw new Error(`${url} ${secret}`);
							},
						}
					: {};
		const f = fixture(t, overrides);
		f.stream.start();
		await tick();
		if (path === 'event')
			f.sockets[0].onerror({ message: `${ticket} ${secret}`, error: new Error(ticket) });
		if (path === 'send') {
			f.sockets[0].send = () => {
				throw new Error(`${ticket} ${secret}`);
			};
			message(f.sockets[0], frame());
		}
		assert.equal(f.logs.length, 1);
		assert.doesNotMatch(JSON.stringify([f.logs, f.events]), /PRIVATE|ticket=|example.invalid/);
		assert.deepEqual(
			[...f.timers.values()].map((v) => v.ms),
			[1000],
		);
	}
});

test('connection and idle watchdogs reconnect and stop leaves no timers', async (t) => {
	const f = fixture(t);
	f.stream.start();
	await tick();
	f.fire(30000);
	assert.equal(f.sockets[0].closed, 1);
	f.fire(1000);
	await tick();
	f.sockets[1].onopen();
	f.fire(120000);
	assert.equal(f.sockets[1].closed, 1);
	f.stream.stop();
	assert.equal(f.timers.size, 0);
});

test('trigger registration and n8n lifecycle return cleanup while gateway is pending', async () => {
	const manifest = require('../package.json');
	assert.ok(
		manifest.n8n.nodes.includes('dist/nodes/DingTalkCardTrigger/DingTalkCardTrigger.node.js'),
	);
	const trigger = new DingTalkCardTrigger();
	assert.equal(trigger.description.name, 'dingTalkCardTrigger');
	assert.deepEqual(trigger.description.inputs, []);
	assert.equal(trigger.description.credentials[0].name, 'dingTalkCardApi');
	let resolve;
	const context = {
		getCredentials: async () => ({ appKey: randomUUID(), appSecret: secret }),
		helpers: {
			httpRequest: () =>
				new Promise((r) => {
					resolve = r;
				}),
		},
		logger: { warn: () => assert.fail('unexpected warning') },
		emit: () => assert.fail('unexpected emit'),
		getNode: () => ({ name: 'DingTalk Card Trigger' }),
	};
	const response = await trigger.trigger.call(context);
	assert.equal(typeof response.closeFunction, 'function');
	await response.closeFunction();
	resolve(gateway);
	await tick();
});

test('interaction workflow uses registered trigger and async outbound Update with callback outTrackId', () => {
	const example = require('../examples/card-interaction.workflow.json');
	const trigger = example.nodes.find((n) => n.type.endsWith('.dingTalkCardTrigger'));
	const update = example.nodes.find((n) => n.type.endsWith('.dingTalkCard'));
	assert.equal(example.active, false);
	assert.equal(trigger.typeVersion, 1);
	assert.equal(update.parameters.operation, 'update');
	assert.equal(update.parameters.outTrackId, '={{ $json.outTrackId }}');
	assert.equal(example.connections[trigger.name].main[0][0].node, update.name);
	assert.ok(example.nodes.every((node) => !node.credentials));
});

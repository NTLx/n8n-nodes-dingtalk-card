const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildRequest, formCardData, jsonObject } = require('../dist/nodes/DingTalkCard/payload');
const { presentationCardData } = require('../dist/nodes/DingTalkCard/presentation');
const { a2uiCardData } = require('../dist/nodes/DingTalkCard/a2ui');
const { createClient, checkBusinessResponse } = require('../dist/nodes/DingTalkCard/transport');
const { DingTalkCard } = require('../dist/nodes/DingTalkCard/DingTalkCard.node');
const { DingTalkCardApi } = require('../dist/credentials/DingTalkCardApi.credentials');
const { randomUUID } = require('node:crypto');
const create = () => ({
	cardTemplateId: 'template',
	outTrackId: 'track',
	cardData: { cardParamMap: { title: 'Error' } },
	openSpaceId: 'dtv1.card//IM_GROUP.group',
	imGroupOpenDeliverModel: { robotCode: 'robot' },
});
const frame = () => ({ outTrackId: 'track', key: 'content', content: 'Done' });

test('create contract and user identifier are preserved', () => {
	const r = buildRequest('createAndDeliver', create());
	assert.equal(r.method, 'POST');
	assert.equal(r.path, '/v1.0/card/instances/createAndDeliver');
	assert.deepEqual(r.body, create());
});
test('create generates unique UUID only for missing or empty outTrackId', () => {
	const a = buildRequest('createAndDeliver', { ...create(), outTrackId: '' }).body.outTrackId;
	const b = buildRequest('createAndDeliver', { ...create(), outTrackId: undefined }).body
		.outTrackId;
	assert.match(a, /^[a-f0-9-]{36}$/);
	assert.notEqual(a, b);
	for (const op of ['update', 'stream', 'finalize'])
		assert.throws(() => buildRequest(op, { ...frame(), outTrackId: '' }), /Out Track ID/);
});
test('update supports merge options and private data without altering shape', () => {
	const data = {
		outTrackId: 'track',
		cardData: { cardParamMap: { status: 'failed' } },
		cardUpdateOptions: { updateCardDataByKey: true },
		privateData: { user: { cardParamMap: { secret: 'private' } } },
		userIdType: 1,
	};
	assert.deepEqual(buildRequest('update', data), {
		method: 'PUT',
		path: '/v1.0/card/instances',
		body: data,
	});
	assert.doesNotThrow(() => buildRequest('update', { outTrackId: 'track', privateData: {} }));
	assert.throws(() => buildRequest('update', { outTrackId: 'track' }), /Provide Card Data/);
});
test('stream full and incremental frames retain caller GUID; defaults favor markdown', () => {
	const r = buildRequest('stream', frame());
	assert.equal(r.method, 'PUT');
	assert.equal(r.path, '/v1.0/card/streaming');
	assert.equal(r.body.isFull, true);
	assert.equal(r.body.isFinalize, false);
	assert.equal(r.body.isError, false);
	assert.match(r.body.guid, /^[a-f0-9-]{36}$/);
	assert.equal(
		buildRequest('stream', { ...frame(), isFull: false, guid: 'replay-id' }).body.guid,
		'replay-id',
	);
	assert.equal(buildRequest('stream', { ...frame(), isFinalize: true }).body.isFinalize, true);
});
test('finalize sets mutually exclusive completed and error states', () => {
	assert.deepEqual(buildRequest('finalize', { ...frame(), guid: 'g' }).body, {
		...frame(),
		guid: 'g',
		isFull: true,
		isError: false,
		isFinalize: true,
	});
	assert.deepEqual(
		buildRequest('finalize', {
			...frame(),
			guid: 'g',
			content: '',
			isError: true,
			isFinalize: true,
		}).body,
		{ ...frame(), guid: 'g', content: '', isFull: true, isError: true, isFinalize: false },
	);
	assert.throws(
		() => buildRequest('stream', { ...frame(), isError: true, isFinalize: true }),
		/either error or completed/,
	);
});
test('reject invalid JSON, arrays, null and invalid cardParamMap values', () => {
	for (const v of ['{', '[]', 'null', 4]) assert.throws(() => jsonObject(v, 'Input'));
	for (const v of [{}, { cardParamMap: [] }, { cardParamMap: { x: 1 } }, { cardParamMap: null }])
		assert.throws(
			() => buildRequest('createAndDeliver', { ...create(), cardData: v }),
			/cardParamMap/,
		);
	for (const v of [null, 4, ' '])
		assert.throws(() => buildRequest('createAndDeliver', { ...create(), outTrackId: v }));
	assert.throws(() => buildRequest('stream', { ...frame(), isFull: 'true' }), /boolean/);
	assert.throws(() => buildRequest('stream', { ...frame(), content: null }), /Content/);
	assert.throws(
		() => buildRequest('createAndDeliver', { ...create(), openSpaceId: 'bad' }),
		/Open Space ID/,
	);
	assert.throws(
		() => buildRequest('createAndDeliver', { ...create(), imGroupOpenDeliverModel: undefined }),
		/delivery model/,
	);
});
test('form maps strings including special keys and rejects duplicate parameter names', () => {
	const d = formCardData([
		{ name: '__proto__', value: 'literal' },
		{ name: 'content', value: '你好' },
	]);
	assert.equal(d.cardParamMap.__proto__, 'literal');
	assert.equal(d.cardParamMap.content, '你好');
	assert.throws(
		() =>
			formCardData([
				{ name: 'a', value: '1' },
				{ name: 'a', value: '2' },
			]),
		/unique/,
	);
});
test('Form card parameter string mode and missing mode preserve entered values', () => {
	const entries = [
		{ name: 'stringMode', value: '{"kept":"literal"}', valueMode: 'string' },
		{ name: 'missingMode', value: '[1,2]' },
	];
	assert.deepEqual(JSON.parse(JSON.stringify(formCardData(entries))), {
		cardParamMap: { stringMode: '{"kept":"literal"}', missingMode: '[1,2]' },
	});
});
test('Form JSON mode serializes object, array, and scalar values once', () => {
	assert.deepEqual(
		JSON.parse(
			JSON.stringify(
				formCardData([
					{ name: 'object', value: '{"nested":true}', valueMode: 'json' },
					{ name: 'array', value: '[1,"two",null]', valueMode: 'json' },
					{ name: 'number', value: '42', valueMode: 'json' },
					{ name: 'boolean', value: 'false', valueMode: 'json' },
					{ name: 'null', value: 'null', valueMode: 'json' },
					{ name: 'string', value: '"quoted"', valueMode: 'json' },
				]),
			),
		),
		{
			cardParamMap: {
				object: '{"nested":true}',
				array: '[1,"two",null]',
				number: '42',
				boolean: 'false',
				null: 'null',
				string: '"quoted"',
			},
		},
	);
});
const presentations = {
	alert: { version: '1', family: 'alert', title: 'Disk full', tone: 'danger', source: 'monitor', occurredAt: 'now' },
	status: { version: '1', family: 'status', title: 'Backup', tone: 'info', state: 'running', details: 'Uploading' },
	digest: { version: '1', family: 'digest', title: 'Daily', tone: 'neutral', items: [{ title: 'Build', summary: 'Passed', tone: 'success' }] },
	action: { version: '1', family: 'action', title: 'Review', tone: 'warning', label: 'Open details', description: 'Display only' },
	report: { version: '1', family: 'report', title: 'Report', tone: 'success', sections: [{ heading: 'Uptime', body: '99.9%' }] },
};
const a2ui = { version: '1', profile: 'universal-v1', title: 'Status', summary: 'Current', tone: 'info', blocks: [
	{ type: 'text', text: 'Ready' }, { type: 'keyValue', label: 'Queue', value: '2' },
	{ type: 'list', items: ['one', 'two'] },
], actions: [{ type: 'request', id: 'refresh:1', label: 'Refresh', params: { z: null, a: true } }] };
test('A2UI maps deterministically to only fixed template variables and plain text', () => {
	const mapped = a2uiCardData(a2ui).cardParamMap;
	assert.deepEqual(mapped, {
		a2uiVersion: '1', a2uiProfile: 'universal-v1', a2uiTitle: 'Status', a2uiSummary: 'Current',
		a2uiTone: 'info', a2uiContent: 'Ready\nQueue: 2\n• one\n• two', a2uiActionId: 'refresh:1',
		a2uiActionLabel: 'Refresh', a2uiActionParams: '{"a":true,"z":null}', a2uiActionVisible: 'true', flowStatus: '3',
	});
	const descriptor = { version: '1', profile: 'universal-v1', title: 'T', tone: 'neutral', blocks: [{ type: 'text', text: 'x' }] };
	const minimalMap = a2uiCardData(descriptor).cardParamMap;
	assert.equal(minimalMap.a2uiActionVisible, 'false');
	assert.equal(minimalMap.flowStatus, '3');
	assert.throws(() => a2uiCardData({ ...descriptor, flowStatus: '3' }), /Unknown A2UI descriptor field/);
});
test('A2UI rejects empty required display labels and preserves valid strings exactly', () => {
	for (const descriptor of [
		{ ...a2ui, title: '' },
		{ ...a2ui, title: '   ' },
		{ ...a2ui, blocks: [{ type: 'keyValue', label: '', value: 'v' }] },
		{ ...a2ui, blocks: [{ type: 'keyValue', label: '  ', value: 'v' }] },
		{ ...a2ui, actions: [{ type: 'request', id: 'go', label: '' }] },
		{ ...a2ui, actions: [{ type: 'request', id: 'go', label: '  ' }] },
	]) assert.throws(() => a2uiCardData(descriptor));
	const mapped = a2uiCardData({ ...a2ui, title: ' Status ', blocks: [{ type: 'keyValue', label: ' Queue ', value: ' 2 ' }], actions: [{ type: 'request', id: 'go', label: ' Refresh ' }] }).cardParamMap;
	assert.equal(mapped.a2uiTitle, ' Status ');
	assert.equal(mapped.a2uiContent, ' Queue :  2 ');
	assert.equal(mapped.a2uiActionLabel, ' Refresh ');
});
test('A2UI rejects unknown fields, versions, profiles, block/action types and malformed inputs', () => {
	for (const value of [null, [], 'x', { ...a2ui, extra: 1 }, { ...a2ui, version: 1 }, { ...a2ui, version: '2' }, { ...a2ui, profile: 'other' }, { ...a2ui, tone: 'purple' }, { ...a2ui, blocks: [{ type: 'html', text: '<b>x</b>' }] }, { ...a2ui, blocks: [{ type: 'text', text: 'x', html: 'bad' }] }, { ...a2ui, actions: [{ type: 'url', id: 'x', label: 'x' }] }, { ...a2ui, actions: [{ type: 'request', id: 'x', label: 'x', url: 'https://example.invalid' }] }]) assert.throws(() => a2uiCardData(value));
});
test('A2UI enforces every descriptor, block, list, action and parameter bound', () => {
	const one = (changes) => a2uiCardData({ version: '1', profile: 'universal-v1', title: 'T', tone: 'neutral', blocks: [{ type: 'text', text: 'x' }], ...changes });
	for (const make of [() => one({ title: 't'.repeat(201) }), () => one({ summary: 's'.repeat(1001) }), () => one({ blocks: [] }), () => one({ blocks: Array(13).fill({ type: 'text', text: 'x' }) }), () => one({ blocks: [{ type: 'text', text: 'x'.repeat(1001) }] }), () => one({ blocks: [{ type: 'keyValue', label: 'l'.repeat(101), value: 'v' }] }), () => one({ blocks: [{ type: 'keyValue', label: 'l', value: 'v'.repeat(1001) }] }), () => one({ blocks: [{ type: 'list', items: [] }] }), () => one({ blocks: [{ type: 'list', items: Array(21).fill('x') }] }), () => one({ blocks: [{ type: 'list', items: ['x'.repeat(301)] }] }), () => one({ actions: Array(2).fill({ type: 'request', id: 'a', label: 'a' }) }), () => one({ actions: [{ type: 'request', id: 'bad id', label: 'a' }] }), () => one({ actions: [{ type: 'request', id: 'a', label: 'l'.repeat(101) }] }), () => one({ actions: [{ type: 'request', id: 'a', label: 'a', params: Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`k${i}`, i])) }] }), () => one({ actions: [{ type: 'request', id: 'a', label: 'a', params: { 'bad key': 'x' } }] }), () => one({ actions: [{ type: 'request', id: 'a', label: 'a', params: { x: [] } }] })]) assert.throws(make);
});
test('A2UI accepts inclusive size and count maxima', () => {
	const base = { version: '1', profile: 'universal-v1', title: 't'.repeat(200), summary: 's'.repeat(1000), tone: 'danger' };
	const listDescriptor = { ...base, blocks: [{ type: 'list', items: Array(20).fill('i'.repeat(300)) }], actions: [{ type: 'request', id: 'a'.repeat(64), label: 'b'.repeat(100), params: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${String(i).padStart(2, '0')}`, i])) }] };
	assert.equal(a2uiCardData(listDescriptor).cardParamMap.a2uiContent.length, 6059);
	assert.equal(a2uiCardData({ ...base, blocks: [{ type: 'text', text: 'x'.repeat(1000) }] }).cardParamMap.a2uiContent.length, 1000);
	assert.equal(a2uiCardData({ ...base, blocks: [{ type: 'keyValue', label: 'l'.repeat(100), value: 'v'.repeat(1000) }] }).cardParamMap.a2uiContent.length, 1102);
	assert.equal(a2uiCardData({ ...listDescriptor, blocks: Array(12).fill({ type: 'text', text: '' }), actions: [] }).cardParamMap.a2uiActionVisible, 'false');
});
test('A2UI compact params preserve permitted special object keys', () => {
	const descriptor = JSON.parse('{"version":"1","profile":"universal-v1","title":"T","tone":"neutral","blocks":[{"type":"text","text":"x"}],"actions":[{"type":"request","id":"go","label":"Go","params":{"__proto__":"safe","constructor":1}}]}');
	assert.equal(a2uiCardData(descriptor).cardParamMap.a2uiActionParams, '{"__proto__":"safe","constructor":1}');
});
test('A2UI enforces aggregate content and action parameter size boundaries', () => {
	const base = { version: '1', profile: 'universal-v1', title: 'T', tone: 'neutral', blocks: [{ type: 'text', text: 'x' }] };
	const action = (params) => [{ type: 'request', id: 'go', label: 'Go', params }];
	const exactContent = Array(7).fill({ type: 'text', text: 'x'.repeat(1000) });
	exactContent.push({ type: 'text', text: 'x'.repeat(993) });
	assert.equal(a2uiCardData({ ...base, blocks: exactContent }).cardParamMap.a2uiContent.length, 8000);
	assert.throws(() => a2uiCardData({ ...base, blocks: Array(8).fill({ type: 'text', text: 'x'.repeat(1000) }) }), /rendered content.*8000/);
	assert.equal(a2uiCardData({ ...base, actions: action({ text: 'x'.repeat(1000) }) }).cardParamMap.a2uiActionParams.length, 1011);
	assert.throws(() => a2uiCardData({ ...base, actions: action({ text: 'x'.repeat(1001) }) }), /string must be at most 1000/);
	const exactParams = Object.fromEntries('abcdefgh'.split('').map((key, i) => [key, 'x'.repeat(i === 7 ? 943 : 1000)]));
	assert.equal(a2uiCardData({ ...base, actions: action(exactParams) }).cardParamMap.a2uiActionParams.length, 8000);
	const oversizedParams = { ...exactParams, h: 'x'.repeat(944) };
	assert.throws(() => a2uiCardData({ ...base, actions: action(oversizedParams) }), /serialized action params.*8000/);
});
test('presentation maps all five families into string-valued cardParamMap deterministically', () => {
	for (const [family, descriptor] of Object.entries(presentations)) {
		const first = presentationCardData(descriptor);
		assert.deepEqual(first, presentationCardData(JSON.parse(JSON.stringify(descriptor))));
		assert.equal(first.cardParamMap.presentationVersion, '1');
		assert.equal(first.cardParamMap.presentationFamily, family);
		assert.equal(first.cardParamMap.flowStatus, '3');
		assert.equal(first.cardParamMap.title, descriptor.title);
		assert.equal(first.cardParamMap.tone, descriptor.tone);
		assert.ok(Object.values(first.cardParamMap).every((value) => typeof value === 'string'));
	}
	assert.equal(presentationCardData(presentations.digest).cardParamMap.items, '[{"title":"Build","summary":"Passed","tone":"success"}]');
	assert.equal(presentationCardData(presentations.report).cardParamMap.sections, '[{"heading":"Uptime","body":"99.9%"}]');
});
test('presentation rejects unsupported versions and families, unknown fields and wrong types', () => {
	for (const descriptor of [
		{ ...presentations.alert, version: '2' },
		{ ...presentations.alert, family: 'unknown' },
		{ ...presentations.alert, surprise: true },
		{ ...presentations.alert, flowStatus: '2' },
		{ ...presentations.alert, title: 4 },
		{ ...presentations.alert, tone: 'red' },
		{ ...presentations.digest, items: [{ title: 'x', extra: 1 }] },
		{ ...presentations.report, sections: [{ heading: 'x', body: 'y', html: '<b>' }] },
	]) assert.throws(() => presentationCardData(descriptor));
	assert.throws(() => presentationCardData({ ...presentations.status, state: 'paused' }), /state/);
});
test('presentation rejects missing required fields and malformed or oversized collections', () => {
	for (const descriptor of [
		{ ...presentations.alert, title: undefined },
		{ ...presentations.status, state: undefined },
		{ ...presentations.action, label: undefined },
		{ ...presentations.digest, items: [] },
		{ ...presentations.digest, items: Array(21).fill({ title: 'x' }) },
		{ ...presentations.digest, items: 'not an array' },
		{ ...presentations.report, sections: [] },
	]) assert.throws(() => presentationCardData(descriptor));
});
test('malformed Form JSON identifies its parameter without echoing its value', () => {
	const supplied = '{"private-sentinel":';
	assert.throws(
		() => formCardData([{ name: 'templateField', value: supplied, valueMode: 'json' }]),
		(error) => {
			assert.match(error.message, /templateField/);
			assert.doesNotMatch(error.message, /private-sentinel/);
			return true;
		},
	);
});
test('duplicate Form parameter names are rejected before parsing the duplicate value', () => {
	assert.throws(
		() =>
			formCardData([
				{ name: 'same', value: 'first' },
				{ name: 'same', value: '{malformed', valueMode: 'json' },
			]),
		/unique/,
	);
});
for (const [label, body] of Object.entries({
	top: { success: false },
	resultFalse: { success: true, result: false },
	code: { code: 'Forbidden', message: 'private' },
	errcode: { errcode: 123 },
	nested: {
		success: true,
		result: { deliverResults: [{ success: true }, { success: false, errorMsg: 'private' }] },
	},
	array: { result: [{ success: false }] },
})) {
	test(`detect business failure: ${label}`, () =>
		assert.throws(() => checkBusinessResponse(body), /DingTalk rejected/));
}
test('successful documented bodies accepted and malformed bodies rejected', () => {
	for (const b of [
		{ success: true, result: true },
		{ success: true, result: { outTrackId: 'track', deliverResults: [{ success: true }] } },
		{ code: 0 },
	])
		assert.equal(checkBusinessResponse(b), b);
	for (const b of [null, [], 'html'])
		assert.throws(() => checkBusinessResponse(b), /invalid response/);
});
test('CardError normalizes validation and hostile API codes without retaining supplied data', () => {
	const validation = formCardData;
	assert.throws(() => validation([{ name: 'field', value: '{secret', valueMode: 'json' }]), (error) => {
		assert.equal(error.category, 'validation');
		assert.equal(error.retryable, false);
		assert.equal(error.mayHaveSucceeded, false);
		assert.doesNotMatch(JSON.stringify(error), /secret/);
		return true;
	});
	assert.throws(
		() => checkBusinessResponse({ success: false, code: 'BAD <script> token' }),
		(error) => {
			assert.equal(error.code, 'DINGTALK_ERROR');
			assert.equal(error.category, 'business');
			assert.equal(error.retryable, false);
			assert.equal(error.mayHaveSucceeded, true);
			assert.doesNotMatch(JSON.stringify(error), /script|secret/);
			return true;
		},
	);
	assert.throws(
		() => checkBusinessResponse({ success: false, code: 'InvalidAccessToken' }),
		(error) => {
			assert.equal(error.category, 'authentication');
			assert.equal(error.retryable, true);
			assert.equal(error.mayHaveSucceeded, false);
			return true;
		},
	);
	assert.throws(
		() => checkBusinessResponse({ success: false, code: 'Forbidden' }, 'token'),
		(error) => {
			assert.equal(error.category, 'authentication');
			assert.equal(error.retryable, false);
			assert.equal(error.mayHaveSucceeded, false);
			return true;
		},
	);
});
test('HTTP status is normalized only when it is a valid HTTP status', async () => {
	for (const [status, expected, category, mayHaveSucceeded] of [
		[503, 503, 'http', true],
		['429', 429, 'http', true],
		[401, 401, 'authentication', false],
		[99, undefined, 'network', true],
		[600, undefined, 'network', true],
	]) {
		let writes = 0;
		const api = createClient(
			async (o) => {
				if (o.url.endsWith('/accessToken')) return { accessToken: 't', expireIn: 7200 };
				writes++;
				throw { response: { status, body: { code: 'Busy', message: 'private server detail' } } };
			},
			randomUUID(),
			's',
		);
		await assert.rejects(api('PUT', '/v1.0/card/instances', { private: 'card value' }), (error) => {
			assert.equal(error.httpStatus, expected);
			assert.equal(error.category, category);
			assert.equal(error.retryable, false);
			assert.equal(error.mayHaveSucceeded, mayHaveSucceeded);
			assert.doesNotMatch(JSON.stringify(error), /private server detail|card value/);
			return true;
		});
		assert.equal(writes, 1);
	}
});
test('partial delivery and incomplete responses are ambiguous and never automatically replayed', async () => {
	for (const [response, category] of [
		[
			{
				success: true,
				result: {
					deliverResults: [
						{ success: true, spaceId: 'one' },
						{ success: false, spaceId: 'two', errorMsg: 'private delivery detail' },
					],
				},
			},
			'incomplete',
		],
		[{ success: true, result: {} }, 'incomplete'],
	]) {
		let writes = 0;
		const api = createClient(
			async (o) => {
				if (o.url.endsWith('/accessToken')) return { accessToken: 't', expireIn: 7200 };
				writes++;
				return response;
			},
			randomUUID(),
			's',
		);
		await assert.rejects(api('POST', '/v1.0/card/instances/createAndDeliver', { card: 'private' }), (error) => {
			assert.equal(error.category, category);
			assert.equal(error.retryable, false);
			assert.equal(error.mayHaveSucceeded, true);
			assert.doesNotMatch(JSON.stringify(error), /private delivery detail|private/);
			return true;
		});
		assert.equal(writes, 1);
	}
});
test('transient token acquisition failure is retryable before any write', async () => {
	let requests = 0;
	const api = createClient(
		async () => {
			requests++;
			throw new Error('credential secret and card payload');
		},
		randomUUID(),
		's',
	);
	await assert.rejects(api('PUT', '/v1.0/card/instances', {}), (error) => {
		assert.equal(error.category, 'network');
		assert.equal(error.retryable, true);
		assert.equal(error.mayHaveSucceeded, false);
		assert.equal(error.phase, 'token');
		assert.equal(error.operation, 'update');
		assert.doesNotMatch(JSON.stringify(error), /credential secret|card payload/);
		return true;
	});
	assert.equal(requests, 1);
});
test('timeout, HTTP 5xx, and business write failures are not automatically replayed', async () => {
	const failures = [
		{
			name: 'timeout',
			request: async () => {
				throw new Error('private timeout detail');
			},
			category: 'network',
		},
		{
			name: 'http 5xx',
			request: async () => {
				throw { response: { status: 503, data: { code: 'Busy', message: 'private server detail' } } };
			},
			category: 'http',
		},
		{
			name: 'business rejection',
			request: async () => ({ success: false, code: 'Forbidden', message: 'private business detail' }),
			category: 'business',
		},
	];
	for (const failure of failures) {
		let writes = 0;
		const api = createClient(
			async (options) => {
				if (options.url.endsWith('/accessToken')) return { accessToken: 't', expireIn: 7200 };
				writes++;
				return failure.request();
			},
			randomUUID(),
			's',
		);
		await assert.rejects(api('PUT', '/v1.0/card/instances', { card: 'private card value' }), (error) => {
			assert.equal(error.category, failure.category, failure.name);
			assert.equal(error.retryable, false, failure.name);
			assert.equal(error.mayHaveSucceeded, true, failure.name);
			assert.equal(error.operation, 'update', failure.name);
			assert.equal(error.phase, 'write', failure.name);
			assert.equal(error.attemptCount, 1, failure.name);
			assert.equal(error.ambiguousOutcome, true, failure.name);
			assert.doesNotMatch(JSON.stringify(error), /private timeout detail|private server detail|private business detail|private card value/);
			return true;
		});
		assert.equal(writes, 1, failure.name);
	}
});
test('Create & Deliver timeout is ambiguous, non-retryable and retains its outTrackId correlation', async () => {
	let writes = 0;
	const api = createClient(async (options) => {
		if (options.url.endsWith('/accessToken')) return { accessToken: 't', expireIn: 7200 };
		writes++;
		throw new Error('private timeout detail');
	}, randomUUID(), 'secret');
	await assert.rejects(api('POST', '/v1.0/card/instances/createAndDeliver', { outTrackId: 'stable-track' }), (error) => {
		assert.equal(error.operation, 'createAndDeliver');
		assert.equal(error.phase, 'write');
		assert.equal(error.attemptCount, 1);
		assert.equal(error.retryable, false);
		assert.equal(error.ambiguousOutcome, true);
		assert.equal(error.mayHaveSucceeded, true);
		assert.doesNotMatch(JSON.stringify(error), /private timeout detail|secret/);
		return true;
	});
	assert.equal(writes, 1);
});
test('auth acquires, caches across clients, refreshes before expiry and isolates rotated credentials', async () => {
	const requests = [];
	let now = 0;
	let tokenCount = 0;
	const key = randomUUID();
	const request = async (o) => {
		requests.push(o);
		return o.url.endsWith('/accessToken')
			? { accessToken: `token-${++tokenCount}`, expireIn: 120 }
			: { success: true, result: true };
	};
	const api = createClient(request, key, 'secret', () => now);
	await api('PUT', '/v1.0/card/instances', {});
	await createClient(request, key, 'secret', () => now)('PUT', '/v1.0/card/instances', {});
	assert.equal(tokenCount, 1);
	assert.deepEqual(requests[0].body, { appKey: key, appSecret: 'secret' });
	assert.equal(requests[0].method, 'POST');
	assert.equal(requests[0].url, 'https://api.dingtalk.com/v1.0/oauth2/accessToken');
	assert.equal(requests[1].headers['x-acs-dingtalk-access-token'], 'token-1');
	assert.equal(requests[1].disableFollowRedirect, true);
	assert.equal(requests[1].timeout, 30000);
	assert.equal(requests[1].json, true);
	now = 61000;
	await api('PUT', '/v1.0/card/instances', {});
	assert.equal(tokenCount, 2);
	await createClient(request, key, 'rotated', () => now).test();
	assert.equal(tokenCount, 3);
});
test('concurrent token requests coalesce and token failures do not poison cache', async () => {
	let count = 0;
	const api = createClient(
		async (o) => {
			if (o.url.endsWith('/accessToken')) {
				count++;
				await new Promise((r) => setImmediate(r));
				return { accessToken: 't', expireIn: 7200 };
			}
			return { success: true, result: true };
		},
		randomUUID(),
		's',
	);
	await Promise.all([
		api('PUT', '/v1.0/card/streaming', {}),
		api('PUT', '/v1.0/card/streaming', {}),
	]);
	assert.equal(count, 1);
	let fail = true;
	const retry = createClient(
		async () => {
			if (fail) {
				fail = false;
				throw Error('secret');
			}
			return { accessToken: 't', expireIn: 7200 };
		},
		randomUUID(),
		's',
	);
	await assert.rejects(retry.test(), /network/);
	await retry.test();
});
test('explicit token rejection refreshes once with identical write payload and GUID', async () => {
	let auth = 0;
	const writes = [];
	const api = createClient(
		async (o) => {
			if (o.url.endsWith('/accessToken')) return { accessToken: `t${++auth}`, expireIn: 7200 };
			writes.push(o);
			return writes.length === 1
				? { code: 'InvalidAuthentication.AccessTokenExpired' }
				: { success: true, result: true };
		},
		randomUUID(),
		's',
	);
	const b = buildRequest('stream', frame()).body;
	await api('PUT', '/v1.0/card/streaming', b);
	assert.equal(auth, 2);
	assert.equal(writes.length, 2);
	assert.deepEqual(writes[0].body, writes[1].body);
});
test('HTTP business code can trigger token refresh; repeated rejection is bounded', async () => {
	let writes = 0;
	const api = createClient(
		async (o) => {
			if (o.url.endsWith('/accessToken')) return { accessToken: 't', expireIn: 7200 };
			writes++;
			throw { response: { status: 401, data: { code: 'InvalidAccessToken', message: 'secret' } } };
		},
		randomUUID(),
		's',
	);
	await assert.rejects(api('PUT', '/v1.0/card/streaming', {}), /HTTP 401/);
	assert.equal(writes, 2);
});
test('ambiguous write failures are not retried and server secrets never enter errors', async () => {
	let writes = 0;
	const api = createClient(
		async (o) => {
			if (o.url.endsWith('/accessToken')) return { accessToken: 'secret-token', expireIn: 7200 };
			writes++;
			throw {
				message: 'secret-token secret-password',
				response: { status: 500, data: { code: 'InternalError', message: 'secret-token' } },
			};
		},
		randomUUID(),
		'secret-password',
	);
	await assert.rejects(api('PUT', '/v1.0/card/instances', {}), (e) => {
		assert.doesNotMatch(JSON.stringify(e) + e.message, /secret-token|secret-password/);
		assert.match(e.message, /InternalError/);
		return true;
	});
	assert.equal(writes, 1);
});
test('malformed token response fails before a write and leaks no response', async () => {
	for (const body of [
		{ accessToken: 'secret' },
		{ accessToken: 'secret', expireIn: -1 },
		{ success: false, message: 'secret' },
		null,
	]) {
		let count = 0;
		const api = createClient(
			async () => {
				count++;
				return body;
			},
			randomUUID(),
			's',
		);
		await assert.rejects(api.test(), (e) => !e.message.includes('secret'));
		assert.equal(count, 1);
	}
});
function context(params, request, continueOnFail = false, items = [{ json: {} }]) {
	return {
		getInputData: () => items,
		getCredentials: async () => ({ appKey: randomUUID(), appSecret: 's' }),
		helpers: { httpRequest: request },
		getNodeParameter: (k, i, fallback) => params[i]?.[k] ?? fallback,
		continueOnFail: () => continueOnFail,
		getNode: () => ({
			name: 'DingTalk Card',
			type: 'n8n-nodes-dingtalk-card.dingTalkCard',
			typeVersion: 1,
			parameters: {},
			position: [0, 0],
		}),
	};
}
function mockApi(seen) {
	return async (o) => {
		seen.push(o);
		return o.url.endsWith('/accessToken')
			? { accessToken: 't', expireIn: 7200 }
			: o.url.endsWith('/createAndDeliver')
				? {
						success: true,
						result: {
							outTrackId: o.body.outTrackId,
							deliverResults: [{ success: true, spaceType: 'IM_GROUP', spaceId: 'destination' }],
						},
					}
				: { success: true, result: true };
	};
}
test('execute guided group and robot mapping, identifiers, raw result and paired items', async () => {
	const seen = [];
	const params = ['group', 'robot'].map((target) => ({
		operation: 'createAndDeliver',
		inputMode: 'form',
		outTrackId: '',
		cardTemplateId: 'tpl',
		cardDataMode: 'form',
		'cardParameters.parameters': [{ name: 'title', value: 'Failed' }],
		target,
		spaceId: 'destination',
		robotCode: 'robot',
	}));
	const result = await new DingTalkCard().execute.call(
		context(params, mockApi(seen), false, [{ json: {} }, { json: {} }]),
	);
	assert.equal(result[0].length, 2);
	assert.equal(result[0][1].pairedItem.item, 1);
	const writes = seen.filter((o) => !o.url.endsWith('/accessToken'));
	assert.equal(writes[0].body.openSpaceId, 'dtv1.card//IM_GROUP.destination');
	assert.deepEqual(writes[0].body.imGroupOpenDeliverModel, { robotCode: 'robot' });
	assert.equal(writes[1].body.openSpaceId, 'dtv1.card//IM_ROBOT.destination');
	assert.equal(writes[1].body.imRobotOpenDeliverModel.spaceType, 'IM_ROBOT');
	assert.equal(result[0][0].json.outTrackId, writes[0].body.outTrackId);
	assert.deepEqual(result[0][0].json.correlation, { outTrackId: writes[0].body.outTrackId });
	assert.equal(result[0][0].json.raw.success, true);
});
test('guided Create & Deliver defaults Robot Code from the bound credential and preserves overrides', async () => {
	const field = new DingTalkCard().description.properties.find((p) => p.name === 'robotCode');
	assert.ok(!field.required);
	assert.equal(field.default, '');
	for (const target of ['group', 'robot']) {
		for (const robotCode of [undefined, '', ' \t ', ' explicit-robot ']) {
			const seen = [];
			const credential = { appKey: randomUUID(), appSecret: randomUUID() };
			const params = {
				operation: 'createAndDeliver',
				inputMode: 'form',
				outTrackId: 'track',
				cardTemplateId: 'tpl',
				cardDataMode: 'form',
				target,
				spaceId: 'destination',
				...(robotCode === undefined ? {} : { robotCode }),
			};
			const c = context([params], mockApi(seen));
			c.getCredentials = async (name) => {
				assert.equal(name, 'dingTalkCardApi');
				return credential;
			};
			const result = await new DingTalkCard().execute.call(c);
			const model = target === 'group' ? 'imGroupOpenDeliverModel' : 'imRobotOpenDeliverModel';
			assert.equal(
				seen[1].body[model].robotCode,
				robotCode?.trim() ? robotCode : credential.appKey,
			);
			if (target === 'robot') assert.equal(seen[1].body[model].spaceType, 'IM_ROBOT');
			for (const value of Object.values(credential))
				assert.ok(!JSON.stringify(result).includes(value));
		}
	}
});
test('JSON Create & Deliver preserves explicit Robot Code and does not default missing Robot Code', async () => {
	for (const model of [{ robotCode: 'json-robot' }, {}]) {
		const seen = [];
		const body = { ...create(), imGroupOpenDeliverModel: model };
		await new DingTalkCard().execute.call(
			context(
				[{ operation: 'createAndDeliver', inputMode: 'json', requestBody: body }],
				mockApi(seen),
			),
		);
		assert.deepEqual(seen[1].body, body);
	}
});
test('Form value mode defaults to String and guided JSON parameters reach create and update as strings', async () => {
	const properties = new DingTalkCard().description.properties;
	const cardParameters = properties.find((property) => property.name === 'cardParameters');
	const valueMode = cardParameters.options[0].values.find(
		(property) => property.name === 'valueMode',
	);
	assert.equal(valueMode.default, 'string');
	for (const operation of ['createAndDeliver', 'update']) {
		const seen = [];
		const params = {
			operation,
			inputMode: 'form',
			outTrackId: 'track',
			cardDataMode: 'form',
			'cardParameters.parameters': [
				{ name: 'object', value: '{"key":1}', valueMode: 'json' },
				{ name: 'legacy', value: '[1,2]' },
			],
			...(operation === 'createAndDeliver'
				? { cardTemplateId: 'tpl', target: 'group', spaceId: 'destination' }
				: { updateByKey: true }),
		};
		await new DingTalkCard().execute.call(context([params], mockApi(seen)));
		const write = seen.find((request) => !request.url.endsWith('/accessToken'));
		assert.deepEqual(JSON.parse(JSON.stringify(write.body.cardData)), {
			cardParamMap: { object: '{"key":1}', legacy: '[1,2]' },
		});
	}
});
test('Presentation and A2UI modes map descriptors through existing Create and Update request paths', async () => {
	for (const [cardDataMode, descriptorName, descriptor, expected] of [
		['presentation', 'presentationDescriptor', presentations.status, presentationCardData(presentations.status)],
		['a2ui', 'a2uiDescriptor', { ...a2ui, actions: undefined }, a2uiCardData({ ...a2ui, actions: undefined })],
	]) for (const operation of ['createAndDeliver', 'update']) {
		const seen = [];
		const params = {
			operation,
			inputMode: 'form',
			outTrackId: 'track',
			cardDataMode,
			[descriptorName]: JSON.stringify(descriptor),
			...(operation === 'createAndDeliver'
				? { cardTemplateId: 'tpl', target: 'group', spaceId: 'destination' }
				: { updateByKey: true }),
		};
		await new DingTalkCard().execute.call(context([params], mockApi(seen)));
		const write = seen.find((request) => !request.url.endsWith('/accessToken'));
		assert.deepEqual(
			JSON.parse(JSON.stringify(write.body.cardData)),
			JSON.parse(JSON.stringify(expected)),
		);
		assert.equal(write.body.cardData.cardParamMap.flowStatus, '3');
	}
});
test('defaulted Robot Code does not leak credential values in failures', async () => {
	for (const continueOnFail of [false, true]) {
		const credential = { appKey: randomUUID(), appSecret: randomUUID() };
		const cardValue = 'PRIVATE-CARD-VALUE-sentinel';
		const c = context(
			[
				{
					operation: 'createAndDeliver',
					inputMode: 'form',
					outTrackId: 'track',
					cardTemplateId: 'tpl',
					cardDataMode: 'json',
					cardData: JSON.stringify({ cardParamMap: { title: cardValue } }),
					target: 'group',
					spaceId: 'destination',
				},
			],
			async (o) => {
				if (o.url.endsWith('/accessToken')) return { accessToken: 't', expireIn: 7200 };
				assert.equal(o.body.imGroupOpenDeliverModel.robotCode, credential.appKey);
				throw new Error(JSON.stringify({ request: o, credential }));
			},
			continueOnFail,
		);
		c.getCredentials = async () => credential;
		const check = (value) => {
			for (const secret of Object.values(credential)) assert.ok(!value.includes(secret));
			assert.ok(!value.includes(cardValue));
		};
		if (continueOnFail) {
			const result = await new DingTalkCard().execute.call(c);
			assert.equal(result[0][0].json.success, false);
			check(JSON.stringify(result));
		} else
			await assert.rejects(new DingTalkCard().execute.call(c), (e) => {
				check(String(e) + JSON.stringify(e));
				return true;
			});
	}
});
test('streaming key defaults to msgContent for stream/finalize and remains overrideable', async () => {
	const field = new DingTalkCard().description.properties.find((p) => p.name === 'key');
	assert.equal(field.default, 'msgContent');
	assert.deepEqual(field.displayOptions.show.operation, ['stream', 'finalize']);
	for (const operation of ['stream', 'finalize']) {
		for (const key of [field.default, 'content']) {
			const seen = [];
			await new DingTalkCard().execute.call(
				context(
					[{ operation, inputMode: 'form', outTrackId: 't', key, content: 'Done' }],
					mockApi(seen),
				),
			);
			assert.deepEqual(seen[1].body, {
				outTrackId: 't',
				key,
				content: 'Done',
				guid: seen[1].body.guid,
				isFull: true,
				isError: false,
				isFinalize: operation === 'finalize',
			});
		}
	}
});
test('execute JSON update/stream/finalize and guided update/stream use expected payloads', async () => {
	for (const op of ['update', 'stream', 'finalize']) {
		const seen = [];
		const body =
			op === 'update'
				? { outTrackId: 't', cardData: { cardParamMap: { title: 'Done' } } }
				: { ...frame(), isError: op === 'finalize' };
		const result = await new DingTalkCard().execute.call(
			context(
				[{ operation: op, inputMode: 'json', requestBody: JSON.stringify(body) }],
				mockApi(seen),
			),
		);
		assert.equal(result[0][0].json.success, true);
		if (op === 'finalize') assert.equal(seen[1].body.isFinalize, false);
	}
	for (const op of ['update', 'stream', 'finalize']) {
		const seen = [];
		const p = {
			operation: op,
			inputMode: 'form',
			outTrackId: 't',
			cardDataMode: 'json',
			cardData: '{"cardParamMap":{"title":"Done"}}',
			updateByKey: true,
			key: 'content',
			content: 'Done',
			guid: 'g',
			isFull: true,
			isError: false,
			isFinalize: false,
		};
		await new DingTalkCard().execute.call(context([p], mockApi(seen)));
		assert.equal(seen[1].body.outTrackId, 't');
		if (op === 'update') assert.equal(seen[1].body.cardUpdateOptions.updateCardDataByKey, true);
		if (op === 'finalize') assert.equal(seen[1].body.isFinalize, true);
	}
});
test('continueOnFail preserves failed identifier and processes later items', async () => {
	const seen = [];
	const p = [
		{ operation: 'update', inputMode: 'json', requestBody: { outTrackId: 'bad' } },
		{ operation: 'stream', inputMode: 'json', requestBody: frame() },
	];
	const result = await new DingTalkCard().execute.call(
		context(p, mockApi(seen), true, [{ json: {} }, { json: {} }]),
	);
	assert.equal(result[0][0].json.outTrackId, 'bad');
	assert.equal(result[0][0].json.operation, 'update');
	assert.equal(result[0][0].json.success, false);
	assert.equal(typeof result[0][0].json.error, 'string');
	assert.deepEqual(result[0][0].json.errorDetails, {
		code: 'DINGTALK_ERROR',
		category: 'validation',
		retryable: false,
		mayHaveSucceeded: false,
		operation: 'update', phase: 'request', attemptCount: 1, ambiguousOutcome: false,
	});
	assert.deepEqual(result[0][0].pairedItem, { item: 0 });
	assert.equal(result[0][1].json.success, true);
});
test('unexpected non-CardError uses a safe internal fallback without write ambiguity', async () => {
	const c = context([{ operation: 'update', inputMode: 'form' }], mockApi([]), true);
	c.getNodeParameter = (name, index, fallback) => {
		if (name === 'operation') return 'update';
		if (name === 'inputMode') return 'form';
		if (name === 'outTrackId') throw new Error('private parameter error');
		return fallback;
	};
	const result = await new DingTalkCard().execute.call(c);
	assert.equal(result[0][0].json.error, 'DingTalk Card could not process this item. Check parameter types and credential configuration.');
	assert.deepEqual(result[0][0].json.errorDetails, {
		code: 'DINGTALK_ERROR',
		category: 'internal',
		retryable: false,
		mayHaveSucceeded: false,
		operation: 'update', phase: 'validation', attemptCount: 0, ambiguousOutcome: false,
	});
	assert.doesNotMatch(JSON.stringify(result), /private parameter error/);
});
test('node errors carry item index and credential test never sends cards or exposes tokens', async () => {
	const n = new DingTalkCard();
	const c = context(
		[{ operation: 'stream', inputMode: 'json', requestBody: frame() }],
		async (o) =>
			o.url.endsWith('/accessToken') ? { accessToken: 'token', expireIn: 7200 } : { result: false },
	);
	await assert.rejects(
		n.execute.call(c),
		(e) =>
			e.context.itemIndex === 0 &&
			e.description.includes('track') &&
			e.description.includes('Category: business') &&
			e.description.includes('May have succeeded: true'),
	);
	const seen = [];
	const testResult = await n.methods.credentialTest.dingTalkCardCredentialTest.call(
		{
			helpers: {
				request: async (o) => {
					seen.push(o);
					return { accessToken: 'token', expireIn: 7200 };
				},
			},
		},
		{ data: { appKey: randomUUID(), appSecret: 's' } },
	);
	assert.equal(testResult.status, 'OK');
	assert.equal(seen.length, 1);
	assert.match(seen[0].uri, /accessToken$/);
	assert.doesNotMatch(JSON.stringify(testResult), /"token"/);
	const cred = new DingTalkCardApi();
	assert.equal(cred.properties.find((p) => p.name === 'appSecret').typeOptions.password, true);
});

test('incomplete successful HTTP body does not become node success', async () => {
	for (const response of [
		{},
		{ success: true },
		{ result: true },
		{ success: true, result: null },
		{ success: true, result: {} },
	]) {
		const api = createClient(
			async (o) =>
				o.url.endsWith('/accessToken') ? { accessToken: 'token', expireIn: 7200 } : response,
			randomUUID(),
			's',
		);
		await assert.rejects(api('PUT', '/v1.0/card/instances', {}), /incomplete card response/);
	}
});
test('error workflow fixture matches registered operation and constructs a usable body', () => {
	const fs = require('node:fs');
	const fixture = JSON.parse(fs.readFileSync('examples/error-notification.workflow.json', 'utf8'));
	const sender = fixture.nodes.find((n) => n.name === 'Send Error Card');
	assert.equal(sender.type, 'n8n-nodes-dingtalk-card.dingTalkCard');
	assert.equal(fixture.active, false);
	assert.equal(sender.credentials, undefined);
	assert.equal(fixture.connections['Workflow Error'].main[0][0].node, sender.name);
	const expression = sender.parameters.requestBody.slice(3, -2).trim();
	const rendered = new Function('$json', '$execution', `return (${expression})`)(
		{
			execution: { id: '123', url: 'https://example.invalid/execution/123' },
			workflow: { name: 'Example' },
		},
		{ id: 'fallback' },
	);
	const request = buildRequest(sender.parameters.operation, JSON.parse(rendered));
	assert.equal(request.body.outTrackId, 'n8n-error-123');
	assert.equal(request.body.cardData.cardParamMap.workflowName, 'Example');
});

test('stable Create & Deliver recovery fixture uses a stable event key and verifies ambiguous outcomes', () => {
	const fs = require('node:fs');
	const fixture = JSON.parse(fs.readFileSync('examples/stable-create-and-deliver.retry.json', 'utf8'));
	assert.equal(fixture.createAndDeliver.nodeType, 'n8n-nodes-dingtalk-card.dingTalkCard');
	assert.equal(fixture.createAndDeliver.nodeErrorHandling, 'Continue On Fail');
	assert.equal(fixture.createAndDeliver.parameters.operation, 'createAndDeliver');
	assert.equal(fixture.createAndDeliver.parameters.target, 'group');
	assert.equal(fixture.createAndDeliver.parameters.spaceId, 'REPLACE_WITH_OPEN_CONVERSATION_ID');
	assert.equal(Object.hasOwn(fixture.createAndDeliver, 'credentials'), false);
	const expression = fixture.createAndDeliver.parameters.outTrackId.slice(3, -2).trim();
	assert.match(expression, /orderId/);
	assert.match(expression, /eventId/);
	assert.doesNotMatch(expression, /random|randomUUID|Date\.now/);
	const input = { orderId: 'ORDER-1042', eventId: 'PAYMENT-CAPTURED-0007' };
	const evaluate = () => new Function('$json', `return (${expression})`)(input);
	assert.equal(evaluate(), 'order-card-ORDER-1042-PAYMENT-CAPTURED-0007');
	assert.equal(evaluate(), evaluate());
	const branchNames = fixture.branches.map((branch) => branch.name);
	assert.deepEqual(branchNames, ['success', 'ambiguous write outcome', 'no write applied']);
	const ambiguous = fixture.branches.find((branch) => branch.name === 'ambiguous write outcome');
	assert.match(ambiguous.condition, /\$json\.success/);
	assert.match(ambiguous.condition, /errorDetails\?\.mayHaveSucceeded === true/);
	assert.match(ambiguous.action, /Inspect.*before considering any replay/);
	assert.equal(fixture.operatorReplay.sameIdGuaranteesDeduplication, false);
	assert.match(fixture.operatorReplay.repeatedCreateBehavior, /use Update/);
	assert.doesNotMatch(JSON.stringify(fixture), /appSecret|accessToken|PRIVATE-/);
});

test('guided STREAM callback opt-in includes STREAM only when enabled and retains robot fallback', async () => {
	const field = new DingTalkCard().description.properties.find(
		(p) => p.name === 'enableStreamCallbacks',
	);
	assert.equal(field.default, false);
	for (const enabled of [undefined, false, true]) {
		for (const target of ['group', 'robot']) {
			const seen = [];
			const c = context(
				[
					{
						operation: 'createAndDeliver',
						inputMode: 'form',
						outTrackId: 'track',
						cardTemplateId: 'tpl',
						cardDataMode: 'form',
						target,
						spaceId: 'destination',
						...(enabled === undefined ? {} : { enableStreamCallbacks: enabled }),
					},
				],
				mockApi(seen),
			);
			c.getCredentials = async () => ({ appKey: 'fixture-client', appSecret: 'fixture-secret' });
			await new DingTalkCard().execute.call(c);
			const body = seen.find((o) => o.url.endsWith('/createAndDeliver')).body;
			assert.equal(Object.hasOwn(body, 'callbackType'), enabled === true);
			if (enabled) assert.equal(body.callbackType, 'STREAM');
			assert.equal(
				body[target === 'group' ? 'imGroupOpenDeliverModel' : 'imRobotOpenDeliverModel'].robotCode,
				'fixture-client',
			);
		}
	}
});
test('A2UI action Create fails before any API request unless Stream callbacks are enabled', async () => {
	const descriptor = { ...a2ui, blocks: [{ type: 'text', text: 'Ready' }] };
	for (const enabled of [undefined, false]) {
		const seen = [];
		const params = [{ operation: 'createAndDeliver', inputMode: 'form', outTrackId: 'track', cardTemplateId: 'tpl', cardDataMode: 'a2ui', a2uiDescriptor: JSON.stringify(descriptor), target: 'group', spaceId: 'destination', ...(enabled === undefined ? {} : { enableStreamCallbacks: enabled }) }];
		const result = await new DingTalkCard().execute.call(context(params, mockApi(seen), true));
		assert.equal(seen.length, 0);
		assert.match(result[0][0].json.error, /require Enable Stream Callbacks/);
	}
	const seen = [];
	const params = [{ operation: 'createAndDeliver', inputMode: 'form', outTrackId: 'track', cardTemplateId: 'tpl', cardDataMode: 'a2ui', a2uiDescriptor: JSON.stringify(descriptor), target: 'group', spaceId: 'destination', enableStreamCallbacks: true }];
	await new DingTalkCard().execute.call(context(params, mockApi(seen)));
	assert.ok(seen.some((request) => request.url.endsWith('/createAndDeliver')));
});

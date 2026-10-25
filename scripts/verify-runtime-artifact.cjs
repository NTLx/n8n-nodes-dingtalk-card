const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const root = resolve(process.argv[2] || '.');
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const workflowManifest = JSON.parse(readFileSync(join(process.cwd(), 'node_modules/n8n-workflow/package.json'), 'utf8'));
assert.equal(workflowManifest.version, process.env.EXPECTED_N8N_WORKFLOW);
assert.equal(manifest.name, 'n8n-nodes-dingtalk-card');
assert.match(manifest.engines.node, /^>=20\.19\.0 <25$/);
assert.ok(manifest.peerDependencies['n8n-workflow']);

const registrations = [];
for (const file of [...manifest.n8n.nodes, ...manifest.n8n.credentials]) {
	const path = join(root, file);
	assert.ok(existsSync(path), `Packed registration file exists: ${file}`);
	const exports = require(path);
	assert.equal(Object.keys(exports).length, 1, `${file} has one public class`);
	const instance = new (Object.values(exports)[0])();
	const name = instance.description?.name ?? instance.name;
	registrations.push(name);
	if (name === 'dingTalkCardTrigger') {
		assert.equal(typeof instance.trigger, 'function');
		assert.deepEqual(instance.description.inputs, []);
		assert.equal(instance.description.credentials[0].name, 'dingTalkCardApi');
	}
}
assert.deepEqual(registrations, ['dingTalkCard', 'dingTalkCardTrigger', 'dingTalkCardApi']);
const stream = require(join(root, 'dist/nodes/DingTalkCardTrigger/stream.js'));
assert.equal(typeof stream.createCardStream, 'function');
assert.equal(typeof stream.normalizeCallback, 'function');
const callback = stream.normalizeCallback({
	type: 'CALLBACK',
	headers: { topic: '/v1.0/card/instances/callback', messageId: 'runtime-fixture' },
	data: '{"outTrackId":"runtime-track"}',
}, '2026-01-01T00:00:00.000Z', false);
assert.equal(callback.messageId, 'runtime-fixture');
assert.equal(callback.normalized.card.outTrackId, 'runtime-track');
console.log(`Packed runtime contract passed on Node ${process.version} with n8n-workflow ${workflowManifest.version}`);

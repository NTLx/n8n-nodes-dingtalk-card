const { execFileSync } = require('node:child_process');
const {
	mkdtempSync,
	readFileSync,
	existsSync,
	mkdirSync,
	symlinkSync,
	realpathSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const assert = require('node:assert/strict');
const destination = mkdtempSync(join(tmpdir(), 'dingtalk-card-pack-'));
const packed = JSON.parse(
	execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', destination], {
		encoding: 'utf8',
	}),
);
const pack = Array.isArray(packed) ? packed[0] : Object.values(packed)[0];
const allowed =
	/^(package\.json|README\.md|LICENSE|CHANGELOG\.md|dist\/.*\.(js|json|svg)|examples\/.*\.json|docs\/.*\.md)$/;
for (const file of pack.files)
	assert.match(file.path, allowed, `Unexpected package file: ${file.path}`);
execFileSync('tar', ['-xzf', join(destination, pack.filename), '-C', destination]);
const root = join(destination, 'package');
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
assert.equal(manifest.name, 'n8n-nodes-dingtalk-card');
assert.equal(manifest.version, '0.2.0-beta.1');
assert.ok(manifest.keywords.includes('n8n-community-node-package'));
assert.ok(
	pack.files.some(({ path }) => path === 'README.md'),
	'README.md must be published',
);
const recoveryExample = 'examples/stable-create-and-deliver.retry.json';
assert.ok(
	pack.files.some(({ path }) => path === recoveryExample),
	`${recoveryExample} must be published`,
);
assert.equal(
	JSON.parse(readFileSync(join(root, recoveryExample), 'utf8')).createAndDeliver.parameters.operation,
	'createAndDeliver',
);
assert.deepEqual(manifest.n8n.nodes, [
	'dist/nodes/DingTalkCard/DingTalkCard.node.js',
	'dist/nodes/DingTalkCardTrigger/DingTalkCardTrigger.node.js',
]);
assert.deepEqual(manifest.n8n.credentials, ['dist/credentials/DingTalkCardApi.credentials.js']);
for (const file of [...manifest.n8n.nodes, ...manifest.n8n.credentials])
	assert.ok(existsSync(join(root, file)), `Missing entry ${file}`);
// Standalone extracted artifact; only its declared n8n peer is available. No custom module loader.
mkdirSync(join(root, 'node_modules'));
symlinkSync(
	realpathSync(resolve('node_modules/n8n-workflow')),
	join(root, 'node_modules/n8n-workflow'),
	'dir',
);
const registration = execFileSync(
	process.execPath,
	[
		'-e',
		`
	const assert = require('node:assert/strict');
	const { existsSync } = require('node:fs');
	const { resolve, dirname } = require('node:path');
	const manifest = require('./package.json');
	const names = [];
	for (const file of [...manifest.n8n.nodes, ...manifest.n8n.credentials]) {
		const exports = require('./' + file);
		assert.equal(Object.keys(exports).length, 1);
		const instance = new (Object.values(exports)[0])();
		const icon = instance.description?.icon ?? instance.icon;
		for (const path of typeof icon === 'string' ? [icon] : Object.values(icon))
			assert.ok(existsSync(resolve(dirname(file), path.replace(/^file:/, ''))));
		names.push(instance.description?.name ?? instance.name);
		if (instance.description?.name === 'dingTalkCardTrigger') {
			assert.equal(typeof instance.trigger, 'function');
			assert.deepEqual(instance.description.inputs, []);
			assert.equal(instance.description.credentials[0].name, 'dingTalkCardApi');
		}
	}
	assert.deepEqual(names, ['dingTalkCard', 'dingTalkCardTrigger', 'dingTalkCardApi']);
	console.log('Standalone packed class loading/registration passed');
`,
	],
	{ cwd: root, encoding: 'utf8' },
);
console.log(registration.trim());
console.log(
	`Verified ${pack.files.length} allowlisted files; ${pack.size} bytes packed. Artifact: ${join(destination, pack.filename)}`,
);

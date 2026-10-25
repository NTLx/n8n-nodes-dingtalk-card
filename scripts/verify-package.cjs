const { execFileSync } = require('node:child_process');
const {
	mkdtempSync,
	readFileSync,
	existsSync,
	readdirSync,
	mkdirSync,
	symlinkSync,
	realpathSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const assert = require('node:assert/strict');
const { presentationCardData } = require('../dist/nodes/DingTalkCard/presentation');
const { a2uiCardData } = require('../dist/nodes/DingTalkCard/a2ui');

function jsonFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory() ? jsonFiles(path) : entry.isFile() && path.endsWith('.json') ? [path] : [];
	});
}

const examples = jsonFiles('examples');
function assertNoCredentialFields(value, path) {
	if (Array.isArray(value)) {
		value.forEach((entry, index) => assertNoCredentialFields(entry, `${path}[${index}]`));
		return;
	}
	if (value === null || typeof value !== 'object') return;
	for (const [key, entry] of Object.entries(value)) {
		assert.doesNotMatch(
			key,
			/(?:clientSecret|accessToken|apiKey|password|privateKey)/i,
			`${path}.${key} must not contain credential fields`,
		);
		assertNoCredentialFields(entry, `${path}.${key}`);
	}
}
const exampleText = examples
	.map((path) => {
		const source = readFileSync(path, 'utf8');
	const parsed = JSON.parse(source);
	assertNoCredentialFields(parsed, path);
	if (parsed.profile === 'universal-v1') a2uiCardData(parsed);
		return source;
	})
	.join('\n');
assert.doesNotMatch(
	exampleText,
	/(?:\bsk-[A-Za-z0-9_-]{16,}\b|\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bAKIA[A-Z0-9]{16}\b|\bBearer\s+\S+)/,
	'Example files must not contain obvious API secrets',
);
for (const path of jsonFiles('examples/presentation')) {
	if (path.endsWith('patterns.json')) continue;
	const example = JSON.parse(readFileSync(path, 'utf8'));
	assert.equal(
		JSON.stringify(example.cardData),
		JSON.stringify(presentationCardData(example.descriptor)),
		`${path} mapped cardData must match the Presentation v1 runtime mapper`,
	);
}
const patterns = JSON.parse(readFileSync('examples/presentation/patterns.json', 'utf8'));
const requiredPatterns = [
	'error-notification',
	'infrastructure-backup-ups-alert',
	'service-status',
	'long-running-task-progress',
	'daily-digest',
	'technical-digest',
	'github-report-source-shape',
	'rss-report-source-shape',
	'changelog-report-source-shape',
	'summary-detail-reference',
	'report-to-status-family-switch',
];
assert.deepEqual(patterns.patterns.map(({ id }) => id), requiredPatterns);
const requiredA2uiVariables = patterns.requiredTemplateVariables;
for (const pattern of patterns.patterns) {
	for (const field of ['family', 'descriptorExample', 'requiredTemplateVariables', 'create', 'update', 'stateFlow', 'callback', 'sensitivity'])
		assert.ok(pattern[field], `${pattern.id} must define ${field}`);
	assert.ok(pattern.descriptorExample.startsWith('examples/a2ui/'), `${pattern.id} must use an A2UI descriptor example`);
	assert.ok(pattern.requiredTemplateVariables.includes('a2uiContent'));
	assert.ok(pattern.requiredTemplateVariables.includes('flowStatus'));
	assert.deepEqual(pattern.requiredTemplateVariables, requiredA2uiVariables);
	assert.equal(pattern.update.operation, 'update');
	assert.equal(pattern.update.cardDataMode, 'a2ui');
	assert.equal(pattern.update.updateByKey, false, `${pattern.id} must replace card data to clear stale fields`);
	assert.equal(pattern.update.replacesPublicCardData, true);
	a2uiCardData(JSON.parse(readFileSync(pattern.descriptorExample, 'utf8')));
	if (pattern.previousDescriptorExample)
		a2uiCardData(JSON.parse(readFileSync(pattern.previousDescriptorExample, 'utf8')));
}
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
assert.equal(manifest.version, JSON.parse(readFileSync('package.json', 'utf8')).version);
assert.ok(manifest.keywords.includes('n8n-community-node-package'));
assert.ok(
	pack.files.some(({ path }) => path === 'README.md'),
	'README.md must be published',
);
const recoveryExample = 'examples/stable-create-and-deliver.retry.json';
assert.ok(
	!pack.files.some(({ path }) => path.startsWith('templates/candidates/')),
	'Template candidates must not be published',
);
assert.ok(
	pack.files.some(({ path }) => path === recoveryExample),
	`${recoveryExample} must be published`,
);
for (const file of examples) {
	const packagedPath = file.replaceAll('\\', '/');
	assert.ok(pack.files.some(({ path }) => path === packagedPath), `${packagedPath} must be published`);
}
assert.ok(
	pack.files.some(({ path }) => path === 'docs/AUTOMATION_PRESENTATION.md'),
	'Automation Presentation guidance must be published',
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

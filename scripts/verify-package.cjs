const { execFileSync } = require('node:child_process');
const { mkdtempSync, readFileSync, existsSync } = require('node:fs');
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
assert.equal(manifest.n8n.nodes.length, 1);
assert.equal(manifest.n8n.credentials.length, 1);
for (const file of [...manifest.n8n.nodes, ...manifest.n8n.credentials]) {
	assert.ok(existsSync(join(root, file)), `Missing entry ${file}`);
	// Load the actual tarball's compiled classes with the pinned n8n peer API.
	const loaded = require('node:module').createRequire(resolve('package.json'));
	const source = readFileSync(join(root, file), 'utf8');
	const Module = require('node:module');
	const m = new Module(join(root, file));
	m.filename = join(root, file);
	m.paths = Module._nodeModulePaths(process.cwd());
	m._compile(source, m.filename);
	for (const Constructor of Object.values(m.exports)) {
		const instance = new Constructor();
		const icon = instance.description?.icon ?? instance.icon;
		for (const path of typeof icon === 'string' ? [icon] : Object.values(icon))
			assert.ok(
				existsSync(resolve(root, file, '..', path.replace(/^file:/, ''))),
				`Missing icon ${path}`,
			);
	}
	assert.ok(loaded.resolve('n8n-workflow'));
}
console.log(
	`Verified ${pack.files.length} allowlisted files; ${pack.size} bytes packed. Artifact: ${join(destination, pack.filename)}`,
);

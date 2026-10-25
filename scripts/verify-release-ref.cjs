const assert = require('node:assert/strict');

const stableVersions = new Set(['0.3.0', '0.4.0']);
const betaVersion = /^0\.(?:1|2|3|4)\.0-beta\.\d+$/;
const candidateVersion = /^0\.5\.0-beta\.\d+$/;

function releaseChannel(version, tag) {
	if (stableVersions.has(version) && tag === `v${version}`) return 'latest';
	if ((betaVersion.test(version) || candidateVersion.test(version)) && tag === `v${version}`) return 'beta';
	return null;
}

function selfTest() {
	assert.equal(releaseChannel('0.4.0-beta.1', 'v0.4.0-beta.1'), 'beta');
	assert.equal(releaseChannel('0.4.0-beta.2', 'v0.4.0-beta.2'), 'beta');
	assert.equal(releaseChannel('0.5.0-beta.1', 'v0.5.0-beta.1'), 'beta');
	assert.equal(releaseChannel('0.3.0', 'v0.3.0'), 'latest');
	assert.equal(releaseChannel('0.4.0', 'v0.4.0'), 'latest');
	assert.equal(releaseChannel('0.4.1-beta.1', 'v0.4.1-beta.1'), null);
	assert.equal(releaseChannel('0.5.0', 'v0.5.0'), null);
	assert.equal(releaseChannel('0.4.0-beta.1', 'v0.4.0-beta.2'), null);
	assert.equal(releaseChannel('0.3.0', 'v0.4.0-beta.1'), null);
	console.log('Release ref policy self-test passed');
}

if (process.argv[2] === '--self-test') {
	selfTest();
} else {
	const { version } = require('../package.json');
	const channel = releaseChannel(version, process.env.GITHUB_REF_NAME);
	assert.ok(channel, `Unsupported package version/tag pair: ${version} / ${process.env.GITHUB_REF_NAME}`);
	console.log(`Verified ${version} -> ${channel}`);
}

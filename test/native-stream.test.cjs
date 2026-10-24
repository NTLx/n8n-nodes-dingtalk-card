const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawn } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const https = require('node:https');
const { createHash } = require('node:crypto');

// Actual Node runtime, trusted disposable local TLS, no network credentials or WS dependency.
test(
	'native WebSocket opens, ACKs, closes pending/active and suppresses ticket-bearing handshake errors',
	{ timeout: 15000 },
	async (t) => {
		const directory = mkdtempSync(join(tmpdir(), 'card-stream-tls-'));
		t.after(() => rmSync(directory, { recursive: true, force: true }));
		const key = join(directory, 'key.pem');
		const cert = join(directory, 'cert.pem');
		execFileSync(
			'openssl',
			[
				'req',
				'-x509',
				'-newkey',
				'rsa:2048',
				'-nodes',
				'-keyout',
				key,
				'-out',
				cert,
				'-days',
				'1',
				'-subj',
				'/CN=localhost',
				'-addext',
				'subjectAltName=DNS:localhost',
			],
			{ stdio: 'ignore' },
		);
		for (const mode of ['active', 'pending', 'reject']) {
			let acknowledged = false;
			let upgraded = false;
			const connections = new Set();
			const server = https.createServer({ key: readFileSync(key), cert: readFileSync(cert) });
			server.on('connection', (socket) => {
				connections.add(socket);
				socket.on('close', () => connections.delete(socket));
			});
			server.on('upgrade', (request, socket) => {
				upgraded = true;
				socket.on('error', () => {});
				if (mode === 'pending') return;
				if (mode === 'reject') {
					socket.end(
						`HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\nPRIVATE-TICKET-native ${request.url}`,
					);
					return;
				}
				const accept = createHash('sha1')
					.update(request.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
					.digest('base64');
				socket.write(
					`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`,
				);
				const payload = Buffer.from(
					JSON.stringify({
						type: 'CALLBACK',
						headers: { topic: '/v1.0/card/instances/callback', messageId: 'native-message' },
						data: '{malformed',
					}),
				);
				const header = Buffer.alloc(4);
				header[0] = 0x81;
				header[1] = 126;
				header.writeUInt16BE(payload.length, 2);
				socket.write(Buffer.concat([header, payload]));
				let buffered = Buffer.alloc(0);
				socket.on('data', (chunk) => {
					buffered = Buffer.concat([buffered, chunk]);
					while (buffered.length >= 6) {
						let length = buffered[1] & 127;
						let offset = 2;
						if (length === 126) {
							if (buffered.length < 8) return;
							length = buffered.readUInt16BE(2);
							offset = 4;
						}
						if (buffered.length < offset + 4 + length) return;
						const mask = buffered.subarray(offset, offset + 4);
						const data = Buffer.from(buffered.subarray(offset + 4, offset + 4 + length));
						for (let i = 0; i < length; i++) data[i] ^= mask[i % 4];
						const opcode = buffered[0] & 15;
						buffered = buffered.subarray(offset + 4 + length);
						if (opcode === 8) {
							socket.end(Buffer.from([0x88, 0]));
							return;
						}
						if (opcode === 1) {
							const ack = JSON.parse(data.toString());
							acknowledged =
								ack.code === 200 && ack.data === '{}' && ack.headers.messageId === 'native-message';
						}
					}
				});
			});
			await new Promise((r) => server.listen(0, '127.0.0.1', r));
			const modulePath = resolve('dist/nodes/DingTalkCardTrigger/DingTalkCardTrigger.node.js');
			const source = `
			const {DingTalkCardTrigger} = require(${JSON.stringify(modulePath)});
			new DingTalkCardTrigger().trigger.call({
				getCredentials: async () => ({appKey: 'native-fixture', appSecret: 'PRIVATE-CLIENT-SECRET-native'}),
				helpers: {httpRequest: async () => ({endpoint: 'wss://localhost:${server.address().port}/connect', ticket: 'PRIVATE-TICKET-native'})},
				logger: {warn: message => console.log(message)},
				emit: items => {
					require('node:assert/strict').equal(items.length, 1);
					require('node:assert/strict').equal(items[0].length, 1);
					console.log('EMITTED:' + items[0][0].json.rawData);
				},
				getNode: () => ({name: 'DingTalk Card Trigger'}),
			}).then(response => setTimeout(() => response.closeFunction(), 400));
		`;

			try {
				const child = spawn(process.execPath, ['-e', source], {
					env: { ...process.env, NODE_EXTRA_CA_CERTS: cert },
					stdio: ['ignore', 'pipe', 'pipe'],
				});
				let output = '';
				child.stdout.on('data', (v) => {
					output += v;
				});
				child.stderr.on('data', (v) => {
					output += v;
				});
				const timeout = setTimeout(() => child.kill('SIGKILL'), 3000);
				const code = await new Promise((r) => child.on('exit', r));
				clearTimeout(timeout);
				assert.equal(code, 0, `${mode}: native socket did not release resources: ${output}`);
				assert.equal(upgraded, true, `${mode}: handshake attempted`);
				assert.doesNotMatch(output, /PRIVATE-|ticket=|wss:\/\//);
				if (mode === 'active') {
					assert.equal(acknowledged, true);
					assert.match(output, /EMITTED:\{malformed/);
				}
				if (mode === 'reject') assert.match(output, /could not connect|connection failed/);
			} finally {
				for (const socket of connections) socket.destroy();
				await new Promise((r) => server.close(r));
			}
		}
	},
);

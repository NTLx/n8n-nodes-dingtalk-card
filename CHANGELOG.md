# Changelog

## 0.1.0-beta.3

Documentation and release pipeline only. The package README describes installation from the `beta` tag and reserves npm `latest` for a future stable release. The publish workflow removes the erroneous `latest` dist-tag through npm Trusted Publishing before publishing this prerelease with `--tag beta`. No DingTalk node behavior changed.

## 0.1.0-beta.2

Published to npm as `0.1.0-beta.2` with the README included, community-node metadata and registered entry paths verified, and n8n UI installation documented. The manually dispatched GitHub Actions workflow is ready for beta-only OIDC publishing after npm Trusted Publisher setup. On 2026-10-24, both `beta` and `latest` point to `0.1.0-beta.2`. Real DingTalk enterprise app/card E2E and full current-stable n8n runtime compatibility remain unverified; this is not a stable or n8n-verified release.

## 0.1.0-beta.1

First outbound Card Platform beta: enterprise app credentials with centralized token caching/refresh; guided and JSON Create & Deliver, Update, Streaming Update and Finalize; propagated outTrackId/GUID; sanitized item errors and 2xx/partial-delivery failure detection; mocked transport/payload/node tests; official n8n CLI tooling; CI and error-notification fixtures.

Live DingTalk enterprise app/card E2E and full current-stable n8n runtime compatibility remain unverified. No inbound trigger. GitHub prerelease only; no npm publication or stable v0.1.0 tag.

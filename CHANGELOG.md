# Changelog

## 0.1.0-beta.2

Prepare npm distribution: include the README in the package, document n8n UI installation, verify community-node metadata and registered entry paths in the package check, and add a manually dispatched GitHub Actions workflow for beta-only npm publishing with OIDC provenance. Initial npm publication is pending authenticated package bootstrap. Real DingTalk enterprise app/card E2E and full current-stable n8n runtime compatibility remain unverified; no stable release.

## 0.1.0-beta.1

First outbound Card Platform beta: enterprise app credentials with centralized token caching/refresh; guided and JSON Create & Deliver, Update, Streaming Update and Finalize; propagated outTrackId/GUID; sanitized item errors and 2xx/partial-delivery failure detection; mocked transport/payload/node tests; official n8n CLI tooling; CI and error-notification fixtures.

Live DingTalk enterprise app/card E2E and full current-stable n8n runtime compatibility remain unverified. No inbound trigger. GitHub prerelease only; no npm publication or stable v0.1.0 tag.

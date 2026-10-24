# Changelog

## 0.3.0 (stable)

Promotes the published v0.3.0-beta.1 package to stable without adding node behavior. Includes guided Form String/JSON card parameter values, sanitized normalized outbound `errorDetails`, stable caller-controlled `outTrackId` recovery guidance, and the existing Stream callback behavior. Reusing an ID does not guarantee Create deduplication or upsert.

Stable live acceptance on connected n8n 2.44.5 passed for Robot Direct Message and whole-body JSON Create & Deliver through Update, Streaming Update, Finalize and final JSON Update. Repeated Create using one caller-controlled `outTrackId` was accepted in the tested path; no deduplication or delivery guarantee is implied. A v0.3 interaction-card button click reached DingTalk Card Trigger through a Stream callback and its downstream asynchronous Update succeeded. The temporary test listener was unpublished after the test. Earlier user-performed Community Nodes UI uninstall/reinstall restored package, manifest and installed-version consistency. npm update-discovery reports stable `0.3.0` as latest for an installed `0.3.0-beta.1`; this does not claim that the n8n UI Update button was clicked or observed. Stable upgrade remains a user-operated supported Community Nodes UI action.

This release closes the v0.3.0 stable acceptance scope. It does not certify v1.0, other templates or form interactions, reconnect/failure behavior, or stable n8n versions beyond the tested instance. See [verification](docs/VERIFICATION.md#v030-stable-release-2026-10-24) for publication, provenance and canonical asset evidence.

## 0.2.0-beta.1 (prerelease)

Adds DingTalk Card Trigger using the shared credential and a self-contained Node 24 native WebSocket transport. Only subscribes to CALLBACK `/v1.0/card/instances/callback`. Validates secure endpoints before ticket construction, sanitizes all gateway/connection errors, handles SYSTEM ping/disconnect, reconnects with capped backoff, aborts pending gateway work and cancels sockets/timers on deactivation. A module-local Client ID lock rejects competing triggers; external processes/services remain the operator’s responsibility.

Guided Create & Deliver gains explicit Enable Stream Callbacks opt-in (`callbackType:"STREAM"`); default/false omits the field. Robot Code fallback and all outbound operations are preserved. Card callbacks receive immediate empty 200/OK ACK before one normalized n8n item; downstream updates are asynchronous. No synchronous local-update ACK or HTTP callback support. Raw malformed data is preserved safely.

Deliberately avoids the upstream `dingtalk-stream` SDK due verified ticket-bearing URL logging risk, without copying the SDK or patching global console. Adds lifecycle/protocol/secret regression tests, native TLS runtime checks and standalone packed registration checks. The tested button callback path passed the post-release live E2E below; broader callback acceptance remains open. Released through the existing Trusted Publisher/OIDC process with provenance and no npm token. While no stable version exists, both beta and latest track this prerelease. Final public artifact and attestation verification is recorded in the GitHub prerelease notes.

Post-release live E2E — 2026-10-24: on the connected self-hosted n8n 2.44.x instance using the same enterprise-app Client ID, DingTalk Card Trigger activated successfully and a request-button card with `callbackType=STREAM` was delivered. One real button click produced a `CALLBACK /v1.0/card/instances/callback` trigger execution with the expected button id/text in normalized `params`. Downstream asynchronous Update returned success, the card visibly changed, and execution completed successfully. This validates the tested button path and immediate receipt ACK transport with asynchronous downstream execution in practice, not every template/form/reconnect/failure mode. This is a documentation-only record; the tag, published package and release asset remain unchanged.

## 0.1.0-beta.6

Streaming Update and Finalize now default the guided Streaming Key to `msgContent` for the public AI template `02fcf2f4-5e02-4a85-b672-46d1f715543e.schema`. Custom keys remain overrideable; saved explicit keys and whole-body JSON are unchanged. Generic Finalize only sends a terminal streaming frame; follow with Update setting `flowStatus: "3"` for this template's visual completion. No generic flowStatus behavior was added.

Documented the real connected-instance live E2E on 2026-10-24 (n8n 2.44.x, DingTalk enterprise app, group delivery, blank Robot Code fallback). Initial streaming with `content` returned HTTP 500; the full lifecycle succeeded with `msgContent`, INPUTING, 1-second waits, terminal finalize and FINISHED update. Added a placeholder-only lifecycle payload recipe, state/spacing guidance and default/override regression coverage.

Remains a prerelease. The existing Trusted Publisher/OIDC pipeline publishes with provenance and synchronizes `beta` and `latest` while no stable version exists; after a stable release exists, beta must not rewrite `latest`. No npm token or stable release.

## 0.1.0-beta.5

Guided (Form) Create & Deliver now defaults missing, empty or whitespace-only Robot Code to the bound DingTalk Card API credential's Client ID / AppKey at execution time for the application's own enterprise robot. Applies to group and direct-message targets; explicit overrides are preserved unchanged. Robot Code is optional in the UI, with the default documented. Whole-body JSON and other operations are unchanged. Regression tests cover default/override behavior and sanitized failures.

Distributed under the npm `beta` tag. Fixes the reported n8n Community Nodes Update downgrade from beta.4 to stale `latest -> 0.1.0-beta.2` by adding the just-published beta to `latest` via Trusted Publisher/OIDC (without removing the tag). This is a temporary compatibility measure while no stable release exists, not a stable release designation. **TODO / transition:** after the first stable release, `latest` must track stable and beta must stop rewriting it; the workflow skips synchronization when any stable version exists. Real DingTalk E2E and full n8n runtime/UI compatibility remain unverified.

## 0.1.0-beta.4

Documentation and release pipeline only. Published to npm through GitHub Actions Trusted Publishing with provenance under `beta`. Public tags are `beta -> 0.1.0-beta.4` and `latest -> 0.1.0-beta.2`; the latter remains a one-time cleanup issue. No DingTalk node behavior changed.

## 0.1.0-beta.3

GitHub prerelease only; npm publication did not occur. Both attempts to remove the accidental `latest` dist-tag through npm returned `E400 Dist-tag request rejected`, so publishing was skipped. No DingTalk node behavior changed.

## 0.1.0-beta.2

Published to npm as `0.1.0-beta.2` with the README included, community-node metadata and registered entry paths verified, and n8n UI installation documented. The manually dispatched GitHub Actions workflow is ready for beta-only OIDC publishing after npm Trusted Publisher setup. On 2026-10-24, both `beta` and `latest` point to `0.1.0-beta.2`. Real DingTalk enterprise app/card E2E and full current-stable n8n runtime compatibility remain unverified; this is not a stable or n8n-verified release.

## 0.1.0-beta.1

First outbound Card Platform beta: enterprise app credentials with centralized token caching/refresh; guided and JSON Create & Deliver, Update, Streaming Update and Finalize; propagated outTrackId/GUID; sanitized item errors and 2xx/partial-delivery failure detection; mocked transport/payload/node tests; official n8n CLI tooling; CI and error-notification fixtures.

Live DingTalk enterprise app/card E2E and full current-stable n8n runtime compatibility remain unverified. No inbound trigger. GitHub prerelease only; no npm publication or stable v0.1.0 tag.

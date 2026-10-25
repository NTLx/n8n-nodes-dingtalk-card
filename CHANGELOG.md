# Changelog

## 0.6.0-beta.1 (candidate; unpublished)

- Add the template-first Controlled A2UI `universal-v1` descriptor mode for Create & Deliver and Update, mapped to fixed string variables.
- Reject unknown descriptor/block/action fields and types, invalid bounds and unsupported actions; require Stream callbacks for action-enabled Create.
- Preserve Form, JSON and Presentation modes. No importable DingTalk template is shipped because a current official NORMAL schema could not be verified; visual/live acceptance remains pending.
- This candidate has not been published or production-installed. Stable npm `latest` remains `0.5.0`.

## 0.5.0 (stable)

Promotes the production-accepted v0.5.0-beta.1 normalized Trigger envelope without runtime changes. Production acceptance covers one request-button/action-callback path, including legacy downstream expression compatibility. Form and Selection remain unverified and deferred; no broader live interaction claim is made. The npm `beta` channel remains on `0.5.0-beta.1`.

## 0.5.0-beta.1 (published beta; production acceptance complete)

- Add the v1 normalized interaction envelope and configurable raw callback serialization.
- Preserve existing top-level callback fields and callback extraction behavior.
- Production acceptance passed for the request-button/action-callback path, including the additive normalized envelope and legacy downstream expression compatibility. Form and Selection remain unverified and deferred. Beta.1 is eligible for stable promotion; see [verification](docs/VERIFICATION.md#v050-beta1-production-acceptance--2026-10-25).

## 0.4.0 (stable)

Promotes the production-accepted v0.4.0-beta.2 Presentation Contract & Template Kit to stable. No functional changes from beta.2: adds the fixed AI-host compatibility value `flowStatus: "3"` to Presentation `cardParamMap`, preserving all 13 Presentation contract fields. Production acceptance passed for true Presentation-mode status rendering and Create & Deliver across alert, status, digest, action, and report. No private identifiers are recorded. The package ships no DingTalk templates. The npm `beta` channel remains on `0.4.0-beta.2`.

## 0.4.0-beta.2 (prerelease)

Adds the fixed AI-host compatibility value `flowStatus: "3"` to Presentation `cardParamMap`, preserving all 13 Presentation contract fields. Production beta.2 acceptance is complete: a true Presentation-mode status card rendered correctly on Mac DingTalk without workflow-supplied `flowStatus` or a JSON request body, and the final live Create & Deliver regression passed for alert, status, digest, action, and report. The v0.4.0 milestone is ready for stable promotion; stable has not been published or promoted. No private identifiers are recorded. The package ships no DingTalk templates. npm `latest` remains stable at `0.3.0`.

## 0.4.0-beta.1 (published beta)

Adds opt-in Presentation Card Data Mode for Create & Deliver and Update. Version 1 descriptors cover alert, status, digest, action presentation metadata, and report families, with deterministic validation and mapping to string-valued `cardParamMap` entries. Includes template variable contract documentation and examples. Status transitions are guidance only; Action does not route or execute. On self-hosted production n8n/runners 2.44.6, supported UI install, loaded schema, valid status Presentation Update, and full Presentation-mode Create & Deliver/Streaming Update/Finalize/final whole-body JSON Update transport lifecycle passed, including legacy lifecycle compatibility. The legacy public AI template used does not satisfy the v0.4 template variable contract; visual Presentation rendering/template acceptance remains pending a user-published matching template. No DingTalk templates are shipped. The public beta is published as `beta -> 0.4.0-beta.1`; npm `latest` remains `0.3.0`. The release and production acceptance evidence are recorded in [verification](docs/VERIFICATION.md#v040-beta1-production-install-and-connected-instance-transport-acceptance-2026-10-25). v0.5 callback/action normalization and v0.6 renderer/A2UI work remain deferred.

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

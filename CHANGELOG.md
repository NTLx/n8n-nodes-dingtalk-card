# Changelog

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

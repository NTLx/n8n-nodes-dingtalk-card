# n8n-nodes-dingtalk-card

Focused n8n community nodes for the **DingTalk Card Platform lifecycle and Stream card callbacks**.

**v0.4.0 is the stable release.** It adds the Presentation Contract & Template Kit, including five descriptor families and deterministic mapping, while preserving the existing lifecycle behavior. Production acceptance is recorded in [release verification](docs/VERIFICATION.md). This does not certify v1.0 or untested platform/runtime behavior. This project is not n8n-verified and is not affiliated with DingTalk or n8n.

**v0.4.0-beta.2 remains available on the beta channel.** Its production acceptance established the functional baseline for stable v0.4.0. A true Presentation-mode status card rendered correctly in Mac DingTalk without workflow-supplied `flowStatus` or a JSON request body; the final live Create & Deliver regression passed for alert, status, digest, action, and report. The package ships no DingTalk templates. See the [presentation contract](docs/PRESENTATION.md) and [release verification](docs/VERIFICATION.md).

The npm `latest` dist-tag resolves to `0.4.0`; `beta` remains `0.4.0-beta.2`. Releases use GitHub Actions Trusted Publisher/OIDC with provenance. Beta publication leaves `latest` unchanged now that a stable version exists.

It provides **DingTalk Card**, **DingTalk Card Trigger**, and the shared **DingTalk Card API** enterprise app credential. It does not implement OA, todo, tables or general robot messaging, and does not depend on `@cryozerolabs/n8n-nodes-dingtalk`. Robot delivery fields here exist only to deliver Card Platform instances.

## Installation

Requires Node.js 24+ and a compatible n8n installation. Development compiles and loads the node against `n8n-workflow` 2.44.2 (the dependency of n8n 2.44.6). Production install and the documented connected-instance transport paths passed on self-hosted n8n/runners 2.44.6; client pixel-perfect visual inspection was not independently performed, and other runtime versions are not certified. CI uses Node 24. n8n 2.44.6 declares Node >=24; this takes precedence over older starter guidance mentioning Node 22.

Install or upgrade the package through n8n's supported **Settings > Community Nodes** lifecycle. To install, enter `n8n-nodes-dingtalk-card` (stable) or `n8n-nodes-dingtalk-card@beta` (current beta). To install or upgrade to an exact prerelease version in the UI, uninstall the package and reinstall it with the exact version, for example `n8n-nodes-dingtalk-card@0.4.0-beta.1`; n8n's standard Update action targets the latest version. Where available, the official Public API `POST /api/v1/community-packages` and `PATCH /api/v1/community-packages/{packageName}` support package management and explicit update versions; use API keys scoped to `communityPackage:list` and `communityPackage:update` as applicable. See [n8n Community Nodes installation and management](https://docs.n8n.io/integrations/community-nodes/installation-and-management/gui-installation/) and [Public API authentication and scopes](https://docs.n8n.io/api/authentication/). Community-node installation requires an Owner or Admin account and may be disabled by instance policy. Installation does not certify live DingTalk behavior. The tested live scope and remaining limits are documented below; v1.0 readiness is not certified.

## Credentials

1. Create an **enterprise internal application** in the [DingTalk developer console](https://open-dev.dingtalk.com/). Third-party suite/user OAuth credentials are not supported in this beta.
2. In Credentials & Basic Information, obtain **Client ID (AppKey)** and **Client Secret (AppSecret)**. Create a **DingTalk Card API** credential in n8n and enter them there. Never paste them into node JSON, workflow fields or bug reports.
3. Grant **互动卡片实例写权限** (interactive card instance write) for Create & Deliver and Update. For Streaming Update / Finalize, additionally grant **AI卡片流式更新权限**, permission code `Card.Streaming.Write`. Permissions and quotas must be enabled for the app/enterprise in the console. See the [official create contract](https://open.dingtalk.com/document/orgapp/create-and-deliver-cards), [update contract](https://open.dingtalk.com/document/orgapp/interactive-card-update-interface), and [streaming tutorial](https://open.dingtalk.com/document/orgapp/typewriter-effect-streaming-ai-card).
4. Enable the enterprise robot and give it access to the target group/recipient. In guided (Form) Create & Deliver, **Robot Code is optional** for both group and direct-message delivery: blank/missing (including whitespace-only) uses the bound DingTalk Card API credential's **Client ID / AppKey** at execution time for the application's own enterprise robot. Supply an explicit Robot Code to override this default when your robot scenario requires a different code. Whole-body JSON input is unchanged and receives no credential-based default. For the Form **Group Chat** target, Space ID is the group's **openConversationId**. For **Robot Direct Message**, it is the recipient's DingTalk **staff userId** (`userIdType=1`). Neither field accepts a webhook URL.
5. Create, associate with your app, save and **publish a Card Platform template**. Its variables must match your `cardParamMap`. For streaming, use an AI card with a streaming-enabled component bound to the selected variable; Markdown streaming must send full snapshots.

The credential test acquires an app token only. It does not send a card or prove card permissions/template access. Tokens are acquired centrally, cached in memory per process/app/secret digest, refreshed 60 seconds before `expireIn`, and coalesced across concurrent acquisitions. Secret rotation changes the cache identity. Tokens are never returned by the node or stored in workflow static data. Cache is bounded to 100 entries; separate n8n workers/processes acquire their own tokens. API details and tradeoffs: [API contracts](docs/API.md).

## Operations

| Operation | Behavior |
| --- | --- |
| Create & Deliver | POST a published template instance to one or more official spaces; guided group or robot direct-message fields |
| Update | PUT public/private data to an existing `outTrackId`; guided mode merges public data by key by default |
| Streaming Update | PUT one frame with `key`, `content`, `guid`, `isFull`, `isFinalize`, `isError` |
| Finalize | PUT a terminal streaming frame: success sets `isFinalize=true,isError=false`; failure sets `isError=true,isFinalize=false` |

**Form** input provides guided fields. Card Data has its own Form/JSON/Presentation selector; the JSON form is the full `{"cardParamMap":{"title":"Example"}}` object. Presentation maps the v1 alert/status/digest/action/report descriptor into string-valued template variables. Form parameters default to **String** mode, which preserves existing values; choose **JSON** mode to enter an object, array, or scalar that is serialized into the string required by `cardParamMap`. **JSON** input accepts the official request body for advanced delivery/space models, `privateData`, `cardUpdateOptions`, `userIdType`, or `callbackType: "STREAM"`. Fields pass through; you are responsible for model/space consistency. Presentation variable names are a contract for templates you publish; no platform template or component is included or verified by this package.

`outTrackId` identifies a card within DingTalk's app context and is always returned. Create generates a UUID when missing/empty; that generated ID is stable only within that execution. A rerun may generate a different ID. To refer to the same logical card across executions, derive and supply the ID from a stable business/event key, such as an order ID plus an immutable event ID; do not derive it from a random value generated on each attempt. Preserve that same caller-controlled ID for any manual replay. A repeated Create with the same ID does not guarantee deduplication or upsert and is not an Update: verify whether the card/delivery already exists, then use Update if the card exists. Store the create output before later lifecycle operations.

Streaming `guid` identifies one request for API idempotency. Empty/missing generates a UUID. A replay of the same frame should retain its GUID; a new frame needs a new GUID. Output includes it. The node sends **one frame per input item**, not an SSE subscription. Full content is the safe default; incremental frames only suit plain text. Official streaming guidance says individual content should not exceed 1 K and total content should not exceed 10 K; ensure your template/API supports your content size. The node does not split frames or truncate data.

Finalize requires the streaming key and content. With Is Full enabled, provide the **complete final content**; empty content overwrites the value. Use an empty incremental final frame only if appropriate for a plain-text component. Error is a documented terminal state, so Finalize never sets both terminal flags. This helper does not impose template-specific `flowStatus` variables or guarantee completion if the API is unreachable. Wire your workflow failure path to Finalize with **Is Error** enabled and monitor finalization failures.

Outputs contain `operation`, `outTrackId`, optional `guid`, `success` and the raw successful DingTalk body in `raw`; n8n paired-item linkage is preserved. Business failures, including partial per-space delivery failures in HTTP 2xx, raise an item-indexed n8n error. Continue On Fail returns `success:false`, the identifiers, the existing sanitized `error` string, and additive `errorDetails` (`code`, `category`, `retryable`, `mayHaveSucceeded`, and optional `httpStatus`). `retryable` means safe for automatic replay; ambiguous writes and partial deliveries are not retryable. Raw server error messages are deliberately omitted because they may contain private payloads or authentication data. Check permissions, template publication, space IDs and robot membership using the safe API code and identifier.

For a reusable stable-ID Create & Deliver node recipe and success/error branch conditions, see [stable Create & Deliver recovery example](examples/stable-create-and-deliver.retry.json). In particular, branch on `success`; when `errorDetails.mayHaveSucceeded` is true, inspect/verify the target before any replay. Only the existing one-time invalid-token refresh is automatic inside the node. Other write retries are workflow/operator decisions after verification; `errorDetails.retryable` identifies failures that are safe to replay, not a request to retry blindly.

## Card interactions with Stream

1. Add **DingTalk Card Trigger**, bind the same **DingTalk Card API** Client ID used to create the card, and activate its workflow. The listener connects on activation; no public webhook URL is required.
2. In Form **Create & Deliver**, explicitly enable **Enable Stream Callbacks**. This adds `callbackType: "STREAM"`; disabled/default omits the field and preserves existing behavior. In whole-body JSON, set `callbackType: "STREAM"` yourself. A console-level Stream setting alone does not route card interactions. Use a published template with callback-enabled button/form components.
3. Process the trigger item and use the outbound **Update** operation with its `outTrackId` for asynchronous changes. [Placeholder-only interaction workflow](examples/card-interaction.workflow.json) illustrates this wiring; configure your template parameters before activation.

DingTalk requires **one Stream service per Client ID** for card callbacks. The module-local lock rejects a second active Card Trigger with the same Client ID in this n8n process, including a manual listener competing with an active workflow. It cannot detect another n8n process, worker, replica, package copy or external Stream service. Use separate Client IDs for development and production, and a single listener service for each. See [DingTalk’s callback troubleshooting](https://github.com/open-dingtalk/dingtalk-card-examples#注意事项).

The trigger subscribes **only** to `CALLBACK /v1.0/card/instances/callback`. It immediately queues `200 / OK` with empty JSON-object data (`"{}"`) **before** emitting one item; it never waits for downstream nodes. This avoids delaying acknowledgement toward the reported ~60-second card retry window. Downstream updates are asynchronous. **No synchronous local-update ACK support in this beta.** An ACK is receipt acknowledgement, not proof of downstream success. Network retries/duplicate deliveries remain possible; make business actions idempotent. There is no persistent deduplication or replay queue; an acknowledged event can be lost if the workflow subsequently fails.

Items include `type`, `specVersion`, `headers`, `topic`, `messageId`, ISO `receivedAt`, parsed `data`, and unchanged `rawData`. JSON `content` is exposed if it is an object; `cardPrivateData`, `params` (including `content.cardPrivateData.params`), and supplied `outTrackId`, `userId`, `userIdType`, `openId`, `unionId`, `operatorId`, `operatorUserId` retain source names/values. Missing optional fields stay absent; no identifier types are inferred. Invalid data JSON still receives an ACK and is emitted as a raw string. Invalid outer envelopes, missing message IDs and other topics are ignored. Callback payloads can contain private form/user data: control execution-data access and retention.

The self-contained transport deliberately avoids the upstream `dingtalk-stream` SDK following verified ticket-bearing URL logging risk on SDK error paths. It uses Node 24+ native WebSocket, n8n’s HTTP helper, validated `wss:` endpoints and `URL.searchParams`; no SDK copy, runtime dependency or global console patch. Gateway bodies, tickets, secrets, URLs and original connection errors never enter its diagnostics. It answers SYSTEM ping with the supplied opaque value, reconnects on SYSTEM disconnect/unexpected close/errors, and watches opening (30s) and idle connections (120s). Reconnect delays are bounded at 1, 2, 4, 8, 16, 30 seconds, then 30 seconds until traffic resumes; each attempt gets a fresh ticket. Lookup/connect failures log generic diagnostics and retry while the workflow stays active. Deactivation aborts gateway lookup, closes pending/active sockets, cancels timers and releases the local lock.

The real button callback E2E on 2026-10-24 used the same enterprise-app Client ID for creation and listening. DingTalk Card Trigger activated successfully, and a request-button card with `callbackType=STREAM` was delivered. One real button click produced a `CALLBACK /v1.0/card/instances/callback` trigger execution; normalized `params` contained the expected button id/text. Downstream asynchronous Update returned success, the card visibly changed, and execution completed successfully. This validates the tested button path and immediate receipt ACK transport with asynchronous downstream execution in practice. It does not certify every template, form submission, reconnect or failure mode; synchronous local-update ACKs remain unsupported.

## Public AI template lifecycle

The public default AI template is `02fcf2f4-5e02-4a85-b672-46d1f715543e.schema`. Its streaming variable is **`msgContent`**, now the Form default for both Streaming Update and Finalize. Override Streaming Key for custom templates; saved workflows with an explicit `content` key retain it and must be edited for this public template. Whole-body JSON still requires an explicit `key`.

1. Create & Deliver with the public template and a new `outTrackId`. Guided group delivery may leave Robot Code blank to use the bound credential's Client ID / AppKey.
2. Update the same card with string parameters `flowStatus: "2"` (INPUTING) and `msgContent` before streaming.
3. Streaming Update with `key: "msgContent"` and full Markdown snapshots (`isFull: true`).
4. Finalize with the same key and complete final content. Generic Finalize **only sends the terminal streaming frame**; it does not change `flowStatus`.
5. Update with `flowStatus: "3"` (FINISHED) and final `msgContent`, merging by key, for the public template's visual completion.

The [DingTalk-Real-AI SDK contract](https://github.com/DingTalk-Real-AI/dingtalk-channel-sdk-python/blob/6f42d37ab22b0d872450148efe01c7b4b82d1e78/SPEC.zh-CN.md#5-ai-卡片协议五步) recommends about 500ms spacing around delivery/streaming/terminal frames and throttles streaming updates to at least 800ms. The successful connected-instance live E2E used **1-second waits** between lifecycle writes. The node adds no automatic delay; use Wait nodes or your harness scheduler.

[Reusable lifecycle payload](examples/public-ai-lifecycle.payload.json) lists guided node parameters and waits for a harness or manual workflow construction. Replace the destination and tracking placeholders, bind a DingTalk Card API credential to every node, and run steps sequentially. It is a payload recipe, not an importable n8n workflow. Use a new tracking ID for each new card; retain frame GUIDs only when deliberately replaying the same frame. No credentials are included.

In the real connected-instance test on 2026-10-24, Create & Deliver and Update succeeded first; the initial Streaming Update using `content` failed with HTTP 500. With `msgContent`, INPUTING, 1-second waits, a terminal frame and FINISHED update, the full lifecycle succeeded. See [verification scope](docs/VERIFICATION.md#connected-instance-live-e2e--2026-10-24).

## Error notification example

[Importable Error Trigger workflow](examples/error-notification.workflow.json) sends a public-data error card using the JSON input escape hatch. It uses placeholders for template, group and robot IDs; choose your credential after importing. Set it as another workflow's **Error Workflow**, activate/configure it as required by your n8n version, and test with a deliberate failure on a disposable workflow. An Error Trigger does not behave like a normal manual trigger. This example is a fixture, not a live-tested integration.

The corresponding [API payload](examples/error-notification.payload.json) is usable independently. Publish a template exposing string variables `title`, `workflowName`, `message` and `executionUrl`. Review and redact error messages before sending; workflow errors and execution URLs can contain sensitive information. To later stream status, preserve `outTrackId` and call Streaming Update followed by Finalize. For button/form actions back into n8n, use the Stream trigger described above.

## Security and retries

- Credentials belong exclusively in n8n's encrypted credential store. Do not commit `.env` files, tokens, exported credentials or private destination IDs.
- Requests use a fixed HTTPS origin, a 30-second timeout and disabled redirects. This package has no runtime dependencies beyond the n8n peer API. It never logs request/response credentials.
- A recognized explicit invalid/expired-token API rejection refreshes auth and retries once with the **same payload/identifiers**. There are no other automatic write retries. If `errorDetails.mayHaveSucceeded` is true, inspect/verify the card and delivery before any workflow/operator replay; use the same caller-controlled identifiers. A stable `outTrackId` still does not guarantee Create deduplication or upsert.
- n8n's own Retry On Fail reruns the node; an auto-generated `outTrackId` may change because it is stable only within one execution. Use an ID derived from a stable business/event key when replay correlation matters. Multiple items execute sequentially; partial success is possible before a later item fails.
- Card content is sent to DingTalk and successful raw responses are retained in n8n execution data. Apply suitable execution-data retention and access controls.

## Development and verification

```sh
npm ci
npm run lint
npm run typecheck
npm run build
npm test
npm run verify:package
npm audit --omit=dev --audit-level=high
```

Uses the official [n8n node CLI](https://docs.n8n.io/connect/create-nodes/build-your-node/using-the-n8n-node-tool.md) and current starter conventions, established in place without example nodes. The CLI is pinned to **0.54.2 beta** because the registry's stable 0.53.4 pins vulnerable Handlebars 4.7.9; the beta includes the patched upstream dependency without overrides. No CLI release script is provided: `n8n-node release` would publish to npm, which this beta process must not do. Tests use Node's built-in runner, mocked HTTP/sockets and real local TLS WebSocket fixtures (OpenSSL is required for tests). No live credentials are needed.

Programmatic execution is intentional: shared token handling, strict 2xx/partial-delivery failure checks, generated identifier propagation and sanitized item-level errors are implemented once, separated from pure payload builders. The current custom credential-test context in `n8n-workflow` exposes only the legacy `request` helper; that single call has a documented lint exception and sanitized error boundary. Main execution uses `httpRequest`. Pure helper errors are converted to `NodeOperationError` at the execution boundary.

See [verification record](docs/VERIFICATION.md) for release identity, public artifact digests, provenance, update-discovery evidence, exact local/CI gates, dependency findings and limitations.

## Roadmap

The direction is **Interactive-first, AI-when-needed**: use DingTalk cards for presentation and lightweight control of n8n automation, routing deterministic actions through n8n without an LLM. The version milestones, acceptance gates, non-goals and compatibility notes are in the [product and engineering roadmap](docs/ROADMAP.md).

The durable architecture, scope boundaries, controlled A2UI contract, and anti-drift decision rules are in the [design baseline](docs/DESIGN.md); the roadmap is subordinate to it.

Historical milestones: **v0.1.0-beta.1** introduced outbound Card Platform lifecycle operations; **v0.2.0-beta.1** added the narrow Stream callback trigger and explicit callback opt-in, with one real request-button path verified; **v0.3.0-beta.1** added Form String/JSON values, normalized outbound error details and stable-ID recovery guidance, and **v0.3.0** is its stable release. Stable acceptance evidence and limits are recorded in [verification](docs/VERIFICATION.md#v030-stable-release-2026-10-24).

MIT licensed. Please remove identifiers, card data and credentials before filing an issue.

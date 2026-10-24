# n8n-nodes-dingtalk-card

Focused n8n community node for **DingTalk Card Platform / interactive-card outbound lifecycle**.

**Beta with a real connected-instance live E2E on 2026-10-24.** Version `0.1.0-beta.6` includes the public AI template streaming-key default fix. On n8n 2.44.x with a DingTalk enterprise app, real group delivery and the full Create & Deliver → Update → Streaming Update → Finalize → Update(FINISHED) lifecycle succeeded using the public template below and blank Robot Code fallback. This validates that tested path, not all templates, delivery targets or runtime/UI behavior. This project is not n8n-verified and is not affiliated with DingTalk or n8n.

Install using `n8n-nodes-dingtalk-card@beta`. While no stable release exists, publishing synchronizes both `beta` and `latest` to this beta so n8n Community Nodes Update does not downgrade installations. `latest` does not currently indicate a stable release. Once a stable release exists, beta publishing must leave `latest` tracking stable; the existing workflow checks public versions before synchronization. Beta.3 is a GitHub prerelease only and was not published to npm.

It provides one **DingTalk Card** node and one **DingTalk Card API** enterprise app credential. It does not implement OA, todo, tables or general robot messaging, and does not depend on `@cryozerolabs/n8n-nodes-dingtalk`. Robot delivery fields here exist only to deliver Card Platform instances.

## Installation

Requires Node.js 24+ and a compatible n8n installation. Development compiles and loads the node against `n8n-workflow` 2.44.2 (the dependency of current stable n8n 2.44.6); full runtime/UI compatibility is not yet certified. CI uses Node 24. Current stable n8n 2.44.6 declares Node >=24; this takes precedence over older starter guidance mentioning Node 22.

Install this beta in self-hosted n8n from **Settings > Community Nodes > Install** by entering `n8n-nodes-dingtalk-card@beta`. Community-node installation requires an Owner or Admin account and may be disabled by instance policy. Use the `beta` tag explicitly. npm installation does not certify live DingTalk behavior. The tested live scope is documented below; n8n verification remains pending.

To install the tagged GitHub prerelease manually on a disposable self-hosted n8n instance:

```sh
git clone https://github.com/NTLx/n8n-nodes-dingtalk-card.git
cd n8n-nodes-dingtalk-card
git checkout v0.1.0-beta.6
npm ci
npm run build
npm test
npm pack
# Install the resulting tgz in your self-hosted n8n community-node directory:
cd ~/.n8n/nodes
npm install /absolute/path/to/n8n-nodes-dingtalk-card-0.1.0-beta.6.tgz
```

Create the community-node directory/package.json if needed, run as the n8n service account, and restart n8n after installation. Container users must install into a persistent volume accessible to n8n. For development use `npm run dev` with the official CLI; follow its prerequisites for your n8n version.

## Credentials

1. Create an **enterprise internal application** in the [DingTalk developer console](https://open-dev.dingtalk.com/). Third-party suite/user OAuth credentials are not supported in this beta.
2. In Credentials & Basic Information, obtain **Client ID (AppKey)** and **Client Secret (AppSecret)**. Create a **DingTalk Card API** credential in n8n and enter them there. Never paste them into node JSON, workflow fields or bug reports.
3. Grant **互动卡片实例写权限** (interactive card instance write) for Create & Deliver and Update. For Streaming Update / Finalize, additionally grant **AI卡片流式更新权限**, permission code `Card.Streaming.Write`. Permissions and quotas must be enabled for the app/enterprise in the console. See the [official create contract](https://open.dingtalk.com/document/orgapp/create-and-deliver-cards), [update contract](https://open.dingtalk.com/document/orgapp/interactive-card-update-interface), and [streaming tutorial](https://open.dingtalk.com/document/orgapp/typewriter-effect-streaming-ai-card).
4. Enable the enterprise robot and give it access to the target group/recipient. In guided (Form) Create & Deliver, **Robot Code is optional** for both group and direct-message delivery: blank/missing (including whitespace-only) uses the bound DingTalk Card API credential's **Client ID / AppKey** at execution time for the application's own enterprise robot. Supply an explicit Robot Code to override this default when your robot scenario requires a different code. Whole-body JSON input is unchanged and receives no credential-based default. Group space IDs are **openConversationId**, not webhook URLs or ordinary chat IDs. Direct-message guided fields use **staff userId**, with `userIdType=1`.
5. Create, associate with your app, save and **publish a Card Platform template**. Its variables must match your `cardParamMap`. For streaming, use an AI card with a streaming-enabled component bound to the selected variable; Markdown streaming must send full snapshots.

The credential test acquires an app token only. It does not send a card or prove card permissions/template access. Tokens are acquired centrally, cached in memory per process/app/secret digest, refreshed 60 seconds before `expireIn`, and coalesced across concurrent acquisitions. Secret rotation changes the cache identity. Tokens are never returned by the node or stored in workflow static data. Cache is bounded to 100 entries; separate n8n workers/processes acquire their own tokens. API details and tradeoffs: [API contracts](docs/API.md).

## Operations

| Operation | Behavior |
| --- | --- |
| Create & Deliver | POST a published template instance to one or more official spaces; guided group or robot direct-message fields |
| Update | PUT public/private data to an existing `outTrackId`; guided mode merges public data by key by default |
| Streaming Update | PUT one frame with `key`, `content`, `guid`, `isFull`, `isFinalize`, `isError` |
| Finalize | PUT a terminal streaming frame: success sets `isFinalize=true,isError=false`; failure sets `isError=true,isFinalize=false` |

**Form** input provides guided fields. Card Data has its own Form/JSON selector; the JSON form is the full `{"cardParamMap":{"title":"Example"}}` object. All map values must be **strings**; serialize arrays/objects as strings according to your template variable types. **JSON** input accepts the official request body for advanced delivery/space models, `privateData`, `cardUpdateOptions`, `userIdType`, or callback routing to an **existing external** handler. Fields pass through; you are responsible for model/space consistency. Callback configuration does not create an inbound n8n listener.

`outTrackId` uniquely identifies the card within DingTalk's app context and is always returned. Create generates a UUID when missing/empty; all subsequent operations require the same ID. To make repeated executions/retries refer to the same card, supply a deterministic ID yourself, e.g. `={{ 'n8n-error-' + $json.execution.id }}`. A repeated create with the same ID is not a general update/upsert: use Update. Store the create output before later lifecycle operations.

Streaming `guid` identifies one request for API idempotency. Empty/missing generates a UUID. A replay of the same frame should retain its GUID; a new frame needs a new GUID. Output includes it. The node sends **one frame per input item**, not an SSE subscription. Full content is the safe default; incremental frames only suit plain text. Official streaming guidance says individual content should not exceed 1 K and total content should not exceed 10 K; ensure your template/API supports your content size. The node does not split frames or truncate data.

Finalize requires the streaming key and content. With Is Full enabled, provide the **complete final content**; empty content overwrites the value. Use an empty incremental final frame only if appropriate for a plain-text component. Error is a documented terminal state, so Finalize never sets both terminal flags. This helper does not impose template-specific `flowStatus` variables or guarantee completion if the API is unreachable. Wire your workflow failure path to Finalize with **Is Error** enabled and monitor finalization failures.

Outputs contain `operation`, `outTrackId`, optional `guid`, `success` and the raw successful DingTalk body in `raw`; n8n paired-item linkage is preserved. Business failures, including partial per-space delivery failures in HTTP 2xx, raise an item-indexed n8n error. Continue On Fail returns `success:false`, the identifiers and a sanitized `error` string, then processes later items. Raw server error messages are deliberately omitted because they may contain private payloads or authentication data. Check permissions, template publication, space IDs and robot membership using the API code and identifier.

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

The corresponding [API payload](examples/error-notification.payload.json) is usable independently. Publish a template exposing string variables `title`, `workflowName`, `message` and `executionUrl`. Review and redact error messages before sending; workflow errors and execution URLs can contain sensitive information. To later stream status, preserve `outTrackId` and call Streaming Update followed by Finalize. Button/form actions back into n8n arrive in v0.2.0.

## Security and retries

- Credentials belong exclusively in n8n's encrypted credential store. Do not commit `.env` files, tokens, exported credentials or private destination IDs.
- Requests use a fixed HTTPS origin, a 30-second timeout and disabled redirects. This package has no runtime dependencies beyond the n8n peer API. It never logs request/response credentials.
- A recognized explicit invalid/expired-token API rejection refreshes auth and retries once with the **same payload/identifiers**. There are no automatic timeout, 429, 5xx or partial-delivery retries: a write might already have succeeded. Inspect the card and use the same identifiers when deliberately retrying.
- n8n's own Retry On Fail reruns the node; auto-generated IDs can change. Use explicit `outTrackId`/`guid` where replay behavior matters. Multiple items execute sequentially; partial success is possible before a later item fails.
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

Uses the official [n8n node CLI](https://docs.n8n.io/connect/create-nodes/build-your-node/using-the-n8n-node-tool.md) and current starter conventions, established in place without example nodes. The CLI is pinned to **0.54.2 beta** because the registry's stable 0.53.4 pins vulnerable Handlebars 4.7.9; the beta includes the patched upstream dependency without overrides. No CLI release script is provided: `n8n-node release` would publish to npm, which this beta process must not do. Tests use Node's built-in runner and mocked HTTP. No live credentials are needed.

Programmatic execution is intentional: shared token handling, strict 2xx/partial-delivery failure checks, generated identifier propagation and sanitized item-level errors are implemented once, separated from pure payload builders. The current custom credential-test context in `n8n-workflow` exposes only the legacy `request` helper; that single call has a documented lint exception and sanitized error boundary. Main execution uses `httpRequest`. Pure helper errors are converted to `NodeOperationError` at the execution boundary.

See [verification record](docs/VERIFICATION.md) for exact local/CI gates, dependency findings and limitations. GitHub prereleases are conditional on all non-live gates passing. No stable release is implied.

## Roadmap

- **v0.1.0-beta.1:** enterprise app credential/auth; Create & Deliver, Update, Streaming Update, Finalize; Form/JSON input; actionable errors; mocked tests/build/lint/docs/examples/CI. **Not real-DingTalk-E2E certified. No inbound interaction trigger.**
- **v0.2.0:** inbound button/form interactions via `TOPIC_CARD` / current official callback mechanism. Verify `/v1.0/card/instances/callback` and `callbackType=STREAM` against the then-current official docs; design acknowledgment, authentication and duplicate-delivery handling.
- **v0.3.0:** richer template/space helpers, normalized errors, idempotency/retry behavior, compatibility/E2E fixtures and examples.
- **v1.0.0:** only after real DingTalk enterprise app + interactive-card E2E and current stable n8n runtime compatibility are verified, with mature npm installation/release documentation. Prove group/DM creation, rendered variables, merge updates, streaming, success/error finalization, interactions and failure recovery before declaring stable.

MIT licensed. Please remove identifiers, card data and credentials before filing an issue.

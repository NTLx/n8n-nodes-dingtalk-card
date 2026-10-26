# v0.8 Automation Presentation patterns

User-facing recipes in this kit use the already production-accepted **A2UI `universal-v1`** descriptor and rendering surface. See the [pattern catalog](../examples/presentation/patterns.json) and placeholder-safe descriptors under [`examples/a2ui/`](../examples/a2ui/). Importable [Notification Hub, Report Hub, and Action Router workflows](../examples/workflows/) demonstrate workflow-layer composition; they are examples, not plugin runtime behavior or external-service connectors. Bind your own DingTalk credential after import, then provide your published template ID, group target, and caller-controlled outTrackId through the typed inputs. The Hub accepts only explicit `create` and `update` operations. It uses A2UI for both and sets Update by Key off so the full public card data is replaced. Prepare GitHub/RSS/changelog/monitor data upstream; this package does not ingest it.

The Action Router reads the canonical `normalized.interaction.actionIds` and `.params` callback fields. Its `ACK`, `SET_PRIORITY`, and `ASK_WORKER` routes are explicit allowlist entries; deterministic routes remain LLM-free. The optional intelligent route emits a generic handoff contract for an external ChatGPT Worker. Unknown action IDs have no route. These examples contain no credential or private target values.

The earlier Presentation v1 examples under [`examples/presentation/`](../examples/presentation/) remain useful for the deterministic adapter contract and diagnostics. They are **not the recommended production visual surface**: connected-instance visual evidence showed the published Presentation v1 template used for those checks is diagnostic-only and unsuitable for canonical user-facing presentation. API transport or adapter success does not prove that a template is an appropriate rendering surface.

## v1.1 candidate: wide rich notifications

The v1.1 candidate adds the opt-in **A2UI `universal-v2`** profile for desktop-friendly notification/report cards. It is intentionally additive: the stable catalog and request-action examples below remain on `universal-v1` until v1.1 connected acceptance and stable promotion are complete.

`universal-v2` replaces the flattened `a2uiContent` presentation by compiling the semantic descriptor into one validated Markdown document. The mapper emits only `content`, `flowStatus="3"`, and `config={"autoLayout":true}`. On guided Create & Deliver the node automatically performs the official AI-card lifecycle: create with empty `content`, then send one full finalized Streaming Update carrying the compiled Markdown. See [`wide-rich-digest-v2.json`](../examples/a2ui/wide-rich-digest-v2.json) and [the v1.1 plan](V1.1_PLAN.md).

The published template under connected acceptance is `bfa8586b-57c0-4840-b178-ff9c66261032.schema`, imported from DingTalk's official AI Markdown card example. Create-only execution `7056` produced the expected empty AI-card shell; Create → Stream(finalize) execution `7064` rendered a wide desktop card with Markdown hierarchy and clickable HTTP(S) links. The beta.2 node encapsulates that two-stage lifecycle so callers still perform one Create & Deliver operation.

For v2, author navigation through structured `links[]`; do not embed ad-hoc Markdown links in section/summary/footer fields. This keeps URL scheme validation deterministic. v2 clickable URLs are navigation links, not request callbacks. Continue to use `universal-v1` when a request-action callback is required until a future bounded v2 callback contract is explicitly designed and accepted.

## A2UI contract and template variables

Each user-facing descriptor is validated by the existing runtime against the frozen `universal-v1` schema. Allowed blocks are plain text, key/value, and lists; one optional action is a constrained request action. The mapper produces these fixed public template variables:

- Required: `a2uiVersion`, `a2uiProfile`, `a2uiTitle`, `a2uiTone`, `a2uiContent`, `a2uiActionVisible`.
- Optional when present: `a2uiSummary`, `a2uiActionId`, `a2uiActionLabel`, `a2uiActionParams`.
- Fixed AI-host compatibility metadata: `flowStatus: "3"` is added by the mapper and is not a descriptor field.

Tone values are semantic labels; the runtime does not impose color or styling. Use a user-published template bound to this contract. The package ships no DingTalk template and does not manage templates.

## Recipes and state flow

The pattern catalog covers error notifications; infrastructure, backup, and UPS alerts; service status; long-running progress; daily and technical digests; GitHub, RSS, and changelog data shapes; and concise summaries with a detail URL shown as text. Each catalog entry points to a valid A2UI example and states its template variables, Create/Update flow, callback boundary, and sensitivity guidance.

Create a card with a stable caller-controlled `outTrackId`. For Update, pass a complete descriptor for the target card contents and set **Update by Key** to `false`. This replaces public card data and clears fields that belonged to a previous family. The n8n workflow owns state, transition policy, persistence, and update cadence; the node does not retain business state.

The catalog includes an explicit report-to-status family switch: Create with the report descriptor, then Update the same `outTrackId` with the complete status descriptor and Update by Key disabled. This prevents report-only fields from surviving the status replacement.

The summary-detail example uses a plain text URL because `universal-v1` has no URL/link block or URL action. **Do not claim that the URL is clickable.** If clickable navigation is required, it needs a separately verified platform/template capability and a future contract decision. Keep long content outside the card and use an access-controlled HTTPS destination when appropriate.

## Actions and model boundary

Examples have no action by default. If a recipe adds an action, only the existing constrained request-button/action path is in scope: enable Stream callbacks on Create, receive the supported callback, then route and validate it deterministically in n8n before any asynchronous Update. The connected-instance evidence covers that request-button/action path. **Form submissions and Selection inputs remain unverified and deferred.** A callback ACK does not prove downstream completion.

A model may propose an A2UI descriptor when generation is useful. The runtime remains the enforcing boundary: invalid descriptors fail validation, and model output must not be treated as trusted DingTalk JSON, HTML, code, arbitrary components, URLs-as-actions, or authorization. Ordinary alerts, status changes, digests, routing, and persistence stay deterministic.

## Data sensitivity and acceptance

Minimize card data, redact secrets and private diagnostics, and consider n8n execution-data access and retention. Treat RSS and other supplied text as untrusted content. Keep credentials in n8n credentials, not examples. For connected acceptance, use a dedicated app, published matching template, test conversation, and non-consequential action. Scope rendering claims to the tested template/client; do not infer universal visual fidelity from successful API responses.

# v0.8 Automation Presentation patterns

User-facing recipes in this kit use the already production-accepted **A2UI `universal-v1`** descriptor and rendering surface. See the [pattern catalog](../examples/presentation/patterns.json) and placeholder-safe descriptors under [`examples/a2ui/`](../examples/a2ui/). These are workflow recipes, not importable workflows, DingTalk templates, or external-service connectors. Replace example values, bind credentials in n8n, and prepare GitHub/RSS/changelog/monitor data upstream; this package does not ingest it.

The earlier Presentation v1 examples under [`examples/presentation/`](../examples/presentation/) remain useful for the deterministic adapter contract and diagnostics. They are **not the recommended production visual surface**: connected-instance visual evidence showed the published Presentation v1 template used for those checks is diagnostic-only and unsuitable for canonical user-facing presentation. API transport or adapter success does not prove that a template is an appropriate rendering surface.

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

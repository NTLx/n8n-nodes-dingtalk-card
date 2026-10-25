# v0.8 Automation Presentation patterns

These are workflow recipes built from existing DingTalk Card Create & Deliver, Update, Presentation v1, and (where explicitly called for) A2UI `universal-v1` contracts. The [pattern catalog](../examples/presentation/patterns.json) is placeholder-only reference data, not an importable workflow or an external-service connector. Replace the published-template, open-conversation, stable `outTrackId`, and scenario-specific `REPLACE_*` placeholders during workflow setup; bind credentials only through n8n credentials. Prepare source data in your own n8n workflows and map it to the documented descriptor. No GitHub, RSS, changelog, monitoring, backup, or UPS ingestion is included.

## Shared contract and state flow

All Presentation patterns require `presentationVersion`, `presentationFamily`, `flowStatus`, `title`, and `tone`, plus the family fields below. Presentation v1 maps these to string-valued `cardParamMap`; `flowStatus: "3"` is fixed AI-host compatibility metadata added by the existing mapper, not a workflow state machine. A user-published template must define and bind the variables it uses. API success alone does not prove template binding or rendering. See the [Presentation contract](PRESENTATION.md).

| Pattern | Family fields | Create / Update flow |
| --- | --- | --- |
| Error notification | `summary`, `source`, `occurredAt` | Create on the error path with a stable execution-derived `outTrackId`; update the same card if a recovery workflow reports resolution. |
| Infrastructure, backup, UPS alert | `summary`, `source`, `occurredAt` | Create when an upstream monitor's threshold fires; update the correlated card when recovery is observed. |
| Service status | `summary`, `state`, optional `details` | Create for a tracked service/task; update on observed state changes using only `idle`, `running`, `success`, `failed`, or `cancelled`. |
| Long-running progress | `summary`, `state`, optional `details` | Create once at task start; update the same card with concise progress and final state. n8n owns progress state and update cadence. |
| Daily and technical digest | `summary`, `items` | Usually create one card per period; update only when intentionally revising that period's card. |
| GitHub, RSS, changelog report | `summary`, `sections` | An upstream workflow supplies prepared source-shaped data; create per reporting window or update that known report. These are data-shape variants, not ingestion integrations. |
| Summary plus detail link | `summary`, `sections`, plus user-owned `detailUrl` template variable | Create a concise report with an approved detail URL; update both together when revising the report. |

The Presentation `action` family is display metadata; it does not create a button or route an action. For a real interaction, use only the existing constrained A2UI request action with Stream callbacks enabled on Create & Deliver, then route the supported request-button/action callback through deterministic n8n validation and asynchronous Update. The connected-instance evidence covers that request-button/action path only. **Form submissions and Selection inputs remain unverified and deferred.** A callback receipt ACK is not downstream success, and workflows own durable state/idempotency.

## Required template variables

The five family examples in [`examples/presentation/`](../examples/presentation/) include a descriptor and its exact mapped `cardData`. Family variables are:

- `alert`: `source`, `occurredAt` (optional), and optional common `summary`.
- `status`: required `state`, optional `details` and `summary`.
- `digest`: `items` (compact JSON string) and optional `summary`.
- `report`: `sections` (compact JSON string) and optional `summary`.
- `action`: `label`, optional `description`; display only.

All families also need `presentationVersion`, `presentationFamily`, `title`, `tone`, and the fixed `flowStatus` field in the mapped payload. Templates choose how semantic tones are displayed; the package does not impose colors or components.

## Detail-link pattern

Presentation v1 has no URL/link field. Do not add `detailUrl` to a Presentation descriptor: the runtime correctly rejects unknown fields. For a template that supports a detail link, keep the standard report variables and add a user-owned `detailUrl` variable through the existing Form parameter map or whole-body JSON mode. Bind and verify that variable in your own published template before claiming it is clickable. Use an access-controlled destination when needed; a card audience does not automatically have access to the report. Do not place a raw long report in the card as a substitute.

## Model and data boundaries

A model may propose a Presentation or A2UI descriptor when generation is useful. The existing runtime validation and allowlists remain authoritative; reject invalid output and do not pass model-generated whole-body DingTalk JSON, HTML, code, or arbitrary components as a rendering contract. Routine alerting, status updates, digest assembly, routing, authorization, and persistence remain deterministic workflow behavior. Minimize card data, redact secrets and private diagnostics, and account for n8n execution-data access and retention.

## Placeholders and connected acceptance

Replace every `REPLACE_*` value and publish/bind your own matching template before running a recipe. Keep credentials in n8n credentials, not example JSON. For connected acceptance, use a dedicated test app, template, conversation, and non-consequential request-button action. Record template-definition/export evidence plus live transport; do not infer binding from an API success response. Do not claim Form/Selection support, pixel-perfect rendering, duplicate-delivery guarantees, or platform behavior beyond the tested template/client/runtime.

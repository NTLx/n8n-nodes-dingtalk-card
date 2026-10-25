# Compatibility, security, and operations

## Compatibility and support

See the [v0.9 support matrix and gates](V0.9_PLAN.md#evidence-based-support-matrix). The n8n Community Node support contract is Node >=24.0.0 <25 and checks `n8n-workflow` 2.44.0 and 2.44.2. Node 24 is also the contributor/build baseline. n8n 2.44.6 and the expression-runtime's `isolated-vm@7.0.1` dependency require Node >=24. n8n 2.44.6 is the production version recorded in the repository's connected-instance history; this work does not access or modify that instance. Form and Selection callback inputs remain unverified and unsupported.

Saved workflow compatibility is checked by `npm test`, specifically the inactive `examples/card-interaction.workflow.json` fixture against the built package manifest. It checks registered node identifiers and the existing callback-to-Update expression. This is a local contract fixture, not proof of every historical customer workflow or every n8n editor/runtime version.

## Credentials and data handling

- Store DingTalk `appKey` and `appSecret` only in the n8n DingTalk Card API credential. Do not put credentials in node parameters, descriptors, workflow exports, examples, card content, callback data, or logs.
- Use least-privilege DingTalk applications, limit who can edit workflows and credentials, and restrict callback-triggered workflows to authorized targets and actions.
- Callback `rawData` is retained by default for backward compatibility and can contain user input, card-private parameters, identifiers, and other sensitive content. Treat it as sensitive execution data; disable `includeRawData` unless a legacy consumer needs it, minimize execution-data retention/access, and avoid forwarding it to broad channels.
- Public card fields and A2UI descriptors should contain only information appropriate for every recipient. Prefer concise summaries and authorized detail links. Do not place secrets, personal data, internal incident details, or full job payloads in card text.
- Request actions only express an event. Validate actor, target, action ID, payload, and current business state in the workflow before consequential work. Require an explicit human approval step for destructive, financial, access-changing, or otherwise high-impact actions. Do not treat a button click as authorization by itself.
- `outTrackId`, `messageId`, and caller-supplied correlation values aid tracing; they are not credentials, durable idempotency keys, or proof of exactly-once processing. Keep durable idempotency state in workflow-owned persistent storage.

## Callback and error contract

The Trigger ACKs accepted callback frames immediately with an empty 200 response, then emits one normalized n8n item asynchronously. `messageId` and `topic` identify callback delivery context; `outTrackId` correlates the card lifecycle; optional caller correlation should be carried separately. Error objects expose bounded operation/phase/retry/ambiguity/correlation details and diagnostics must not include credentials, gateway tickets, raw callback payloads, or full remote response bodies. Keep logs to event type, safe phase, and non-sensitive correlation where operationally useful.

Duplicate suppression is bounded and process-local by DingTalk `messageId`. It does not cover restarts, multiple processes, cache eviction/expiry, or cases without a message ID. ACK means receipt, not successful downstream execution. Workflow owners must handle retries and business-level idempotency.

## Presentation accessibility and readability

For supported A2UI/Presentation outputs, lead with a short title and clear state, keep summaries brief, group details, and provide a human-readable next step. Use explicit text labels and status words; do not rely on color or tone alone. Keep contrast and text density readable on mobile, avoid long unbroken identifiers, and send long reports or sensitive details to an access-controlled detail destination. A URL rendered as text is not necessarily a clickable action. Validate rendering in each intended DingTalk client/template; this package does not claim general screen-reader or client accessibility conformance.

## Supported Community Nodes lifecycle

n8n's [official GUI installation guide](https://docs.n8n.io/integrations/community-nodes/installation-and-management/gui-installation.md) documents installing a package name with an optional version or dist-tag (for example `n8n-nodes-dingtalk-card@0.9.0-beta.1`), updating to latest with **Update**, and selecting another version by uninstalling then reinstalling with the target version. To downgrade, uninstall and reinstall the chosen older version. Dist-tags resolve to a specific version when installed. Only self-hosted n8n supports unverified npm community nodes, and n8n requires an Owner or Admin to manage them.

Use these supported UI operations for acceptance. Do not directly modify n8n database records or internal community-node directories. This v0.9 hardening task does not install or update the production instance.

For an n8n platform upgrade involving database migrations, follow n8n's own release notes and rollback instructions; package downgrade alone does not roll back an n8n database migration.

# n8n-nodes-dingtalk-card

Focused n8n community nodes for the **DingTalk Card Platform lifecycle and Stream card callbacks**.

**v1.1.0 is the current stable release.** It adds the semantic `universal-v2` A2UI profile on DingTalk's official AI Markdown streaming lifecycle, including one-call Create → Stream → Finalize, wide desktop auto-layout, validated Markdown links, clean template rendering, and continued `universal-v1` compatibility. The package provides **DingTalk Card**, **DingTalk Card Trigger**, and the shared **DingTalk Card API** enterprise-app credential. It is not n8n-verified and is not affiliated with DingTalk or n8n.

The plugin owns credential-safe transport and bounded card/callback primitives. Reusable workflows own business state, routing, persistence, authorization, and optional AI orchestration. Fixed actions should route deterministically; involve an AI Worker only when interpretation or reasoning is actually needed.

## Scope and support

- Card operations: Create & Deliver, Update, Streaming Update, and Finalize. Form and whole-body JSON inputs are supported; Form also offers deterministic Presentation and controlled A2UI card data. Stable `universal-v1` remains supported; v1.1 adds `universal-v2` for wide Markdown/KPI/link notification cards and automatically performs the official AI-card Create → Stream → Finalize lifecycle on Create & Deliver.
- Trigger: DingTalk Stream request-action callbacks, with a versioned normalized envelope alongside the existing raw/top-level fields.
- Reusable workflow assets: [Notification Hub](examples/workflows/dingtalk-notification-hub.json), [Report Hub](examples/workflows/dingtalk-report-hub.json), and [Action Router](examples/workflows/dingtalk-action-router.json). They are inactive, credential-unbound examples. Hubs accept explicit Create/Update operations and use replacement Update semantics; the Router allowlists action IDs and offers a generic external Worker handoff.
- Supported boundary: Node.js `>=24.0.0 <25` and n8n 2.44.x. CI checks packed artifacts against `n8n-workflow` 2.44.0 and 2.44.2. See [compatibility, security, and operations](docs/COMPATIBILITY_SECURITY_OPERATIONS.md).

Form submissions and Selection inputs remain deferred. Trigger duplicate suppression is bounded and process-local, not durable or distributed. Create with a repeated `outTrackId` does not guarantee deduplication or upsert; there is no exactly-once delivery guarantee. The repository includes the validated, importable [`universal-v2` DingTalk AI Markdown template](examples/templates/dingtalk-universal-v2-clean.json); import and publish it in your own DingTalk Card Platform workspace, then use the resulting template ID in Create & Deliver. The plugin never hard-codes a template ID. See [API limits](docs/API.md), [interaction contract](docs/INTERACTIONS.md), and [verification record](docs/VERIFICATION.md).

The scope is DingTalk Card Platform lifecycle and interactions. It does not provide OA, todo, tables, or general robot messaging.

## Install or update

In n8n, open **Settings → Community Nodes** and install `n8n-nodes-dingtalk-card`. Use the package's **Update** action to move to the current stable release. The optional `@beta` dist-tag installs the current beta prerelease. Community-node installation may be disabled by instance policy and requires an Owner or Admin. See n8n's [installation guide](https://docs.n8n.io/integrations/community-nodes/installation-and-management/gui-installation/).

After installation, create a DingTalk enterprise internal application, grant the required Card Platform permissions, create a **DingTalk Card API** credential in n8n, and publish/associate a template whose variables match the selected contract. Never put secrets in workflow fields or example files. A credential test checks token acquisition only; it does not test card permissions or template behavior. Detailed setup and operational limits are in [API](docs/API.md) and [operations guidance](docs/COMPATIBILITY_SECURITY_OPERATIONS.md).

## Guides and examples

- Importable [`universal-v2` DingTalk AI Markdown template](examples/templates/dingtalk-universal-v2-clean.json), plus [Controlled A2UI contracts](docs/A2UI.md), [v1.1 wide rich plan](docs/V1.1_PLAN.md), and [user-facing automation patterns](docs/AUTOMATION_PRESENTATION.md)
- [Presentation descriptor contract](docs/PRESENTATION.md)
- [Stream callback interaction contract](docs/INTERACTIONS.md)
- [Product scope and architecture](docs/DESIGN.md) and [roadmap](docs/ROADMAP.md)
- [Version 1.0 acceptance plan](docs/V1.0_PLAN.md) and [release verification](docs/VERIFICATION.md)
- Importable [card interaction](examples/card-interaction.workflow.json) and [error notification](examples/error-notification.workflow.json) fixtures; these require your credential, target, and published template configuration.

## Development

Requires Node.js 24. Run `npm ci`, then `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run verify:package`. The test suite uses Node's built-in runner and local fixtures; no live DingTalk credentials are needed. Release and package policy is documented in the repository workflows and [verification record](docs/VERIFICATION.md).

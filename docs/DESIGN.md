# Design baseline

This document is the durable design baseline for `n8n-nodes-dingtalk-card`. It records the project's purpose, architecture, boundaries, and rules for future decisions. The [roadmap](ROADMAP.md) proposes sequencing and milestones under this baseline; it does not redefine or expand the project's scope. If a roadmap item conflicts with this document, this document governs and the roadmap must be revised before the item is accepted.

## Project background and purpose

This is an n8n community plugin for the DingTalk Interactive Card Platform. Its strategic role is broader than sending attractive notifications: DingTalk cards are the polished presentation and lightweight interaction/control surface for a user's automation architecture. They present reports, status, alerts, tasks, and progress, and let people initiate structured actions that flow back into automation.

The design principle is **Interactive-first, AI-when-needed**. A card action should use deterministic automation when its meaning and outcome are known. ChatGPT or another worker is introduced only when a task genuinely needs understanding, generation, reasoning, or agent behavior.

## Architecture and ownership

```text
Human
  <-> DingTalk Interactive Cards (presentation + structured interaction)
        <-> n8n Trigger / Action Router / reusable subworkflows
              |-- deterministic orchestration, state, idempotency, retries,
              |   notifications, and observability
              |-- ChatGPT Chat/Workers for interpretation, generation,
              |   reasoning, or agent behavior when needed
              `-- ServerFS for host, repository, file, or device-agent execution
```

Each layer owns a distinct responsibility:

- **n8n** owns deterministic triggers and orchestration, workflow state, idempotency policy, retries, notifications, and observability. It decides where an event goes and records the outcome.
- **ChatGPT Chat/Workers** handle only work that benefits from language understanding, generation, reasoning, or agent behavior. They are optional branches in a workflow, not the default path for routine actions.
- **ServerFS** handles execution against the host, repositories, files, or device agents. The card plugin does not become a host execution mechanism.
- **DingTalk cards** provide human-facing presentation and interaction. They display state and collect structured inputs; workflows own the business decisions and execution.
- **This plugin** provides generic DingTalk Card Platform transport and lifecycle nodes, callback normalization, presentation/action contracts, safe rendering primitives, and correlation metadata. It is not a business workflow engine.

## Requirements and design goals

1. **Rich presentation:** support polished notification, report, status, task, and progress experiences using verified DingTalk capabilities and reusable templates.
2. **Rich interaction:** accept structured card data/actions and emit events that n8n can route, validate, and act on.
3. **Deterministic interaction loop:** ordinary actions follow `Card -> Trigger -> n8n Action Router/subworkflow -> card update`, without an LLM.
4. **Optional intelligent escalation:** an action may route to a ChatGPT Worker when interpretation, generation, reasoning, or agent behavior is needed; the workflow then presents the result through the card surface.
5. **Controlled A2UI:** upstream callers submit a constrained, versioned presentation/action descriptor. Runtime validation maps it deterministically only to verified and allowlisted DingTalk templates, components, and actions.
6. **Reusable automation patterns:** provide workflow-layer examples and assets that users can adapt without coupling the generic plugin to one owner's business systems.
7. **Verifiable claims:** specific platform features, templates, callback behaviors, and compatibility claims require current documentation and suitable acceptance evidence.

## Controlled presentation and action contract

The high-level contract is a versioned descriptor, not arbitrary UI. Validation must be deterministic and reject unknown versions, unknown fields where unsafe, unapproved components, and actions outside the allowlist. Rendering must use only verified template/component mappings and safe primitives. Invalid input needs a documented safe failure/fallback. Inputs and resulting actions should remain auditable and bounded by the contract.

No arbitrary code or HTML is accepted. No unvalidated action may be executed. Model-assisted descriptor generation may be used upstream, but generated output enters the same deterministic validation and allowlist path. Free-form model-generated executable UI or DingTalk request bodies are not a rendering contract.

Raw whole-body JSON remains a separate low-level expert escape hatch for direct Card Platform API use. It is intentionally outside the high-level descriptor contract, must remain clearly identified as expert input, and does not authorize arbitrary UI in the controlled renderer.

## Layer and scope boundaries

### Plugin layer

Keep the plugin generic and limited to reusable integration capabilities:

- DingTalk Card Platform transport and card lifecycle operations;
- callback lifecycle and normalization of source data;
- versioned presentation/action contracts and safe rendering primitives;
- correlation metadata needed to connect events and card updates;
- clear errors and lifecycle behavior consistent with n8n's supported extension APIs.

The plugin must not embed one user's business automations, business-specific routing policy, durable workflow state, or a second orchestration engine.

### Workflow and examples layer

Reusable n8n assets belong in workflows/examples: Notification Hub, Report Hub, Action Router, state/idempotency tables, and routing patterns for **deterministic**, **parameterized**, and **intelligent** actions. Examples may demonstrate error notifications; Homelab, UPS, backup, and service status; OpenAI/n8n/Claude changelogs; daily, RSS, and GitHub reports; and long-running task progress. These are illustrative patterns, not built-in integrations or commitments to a particular user's business setup.

### Explicit non-goals

- A general DingTalk suite, including OA, contacts, documents, or unrelated APIs.
- Generic robot messaging APIs; robot delivery fields exist only where needed to deliver Card Platform instances.
- An arbitrary visual builder, arbitrary component runtime, HTML/code rendering, or unrestricted generated UI.
- LLM involvement for routine deterministic actions.
- Exactly-once delivery, durable callback deduplication inside the plugin, or a plugin-owned business state store.
- Any claim that Create deduplicates or upserts on a repeated identifier. A caller-controlled `outTrackId` is correlation, not such a guarantee.

Callbacks and external APIs can be retried or ambiguously fail. Workflows should make consequential actions idempotent and verify uncertain outcomes before replay. Durable deduplication/state belongs in workflow storage. The plugin must not claim guarantees the underlying platform does not provide.

## Decision rules for future changes

Accept a feature when it strengthens the card presentation/interaction surface, is reusable across n8n workflows, fits the layer that owns the behavior, and has a deterministic contract with verifiable platform support. Prefer a workflow/example when the feature is routing, business policy, persistence, or a reusable automation recipe rather than generic DingTalk integration behavior.

Reject or defer a feature when it broadens into unrelated DingTalk products, hard-codes an owner's business process into the plugin, requires arbitrary executable UI, routes routine actions through an LLM, duplicates n8n orchestration/state facilities, or implies unsupported delivery/deduplication guarantees. If a proposed feature crosses layers, split it so the plugin exposes a generic primitive and workflows retain policy and business logic.

Before accepting a new rendering or interaction capability, establish its descriptor/version, validation and allowlist behavior, mapping to verified DingTalk behavior, failure/fallback behavior, correlation needs, privacy implications, and migration impact. Update this baseline only when the owner deliberately changes the architecture or scope; then reconcile the roadmap and examples with it.

## Development and acceptance discipline

Develop, install, upgrade, and accept the plugin through n8n's supported Community Nodes lifecycle and public extension interfaces. Never directly mutate the n8n database, internal Community Nodes directories, or third-party system internals as product acceptance. Such access requires separate authorization when used for diagnosis and does not substitute for supported lifecycle acceptance. This boundary keeps acceptance reproducible and representative of actual user operations.

Keep verification claims scoped to the exact n8n versions, DingTalk paths, templates, interactions, and failure modes exercised. Do not turn a limited live check into a general compatibility or delivery guarantee.

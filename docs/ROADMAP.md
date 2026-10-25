# Product and engineering roadmap

This roadmap is subordinate to the project's [design baseline](DESIGN.md), which governs architecture, scope, non-goals, and acceptance boundaries. Roadmap items may sequence work within those boundaries but cannot override them; resolve conflicts by updating the proposal to fit the baseline or deliberately revising the baseline first.

This roadmap starts from the published **v0.4.0** stable state. It describes intended milestones, not released capabilities. The current release and its tested limits remain documented in the [README](../README.md), [API contracts](API.md), and [verification record](VERIFICATION.md). Dates are omitted; milestones are semantic versions, not calendar commitments.

The repository candidate version is **0.6.0-beta.1**. npm `latest` remains `0.5.0`; this candidate has not been published. The v0.4.0 Presentation Contract & Template Kit is implemented and production acceptance is complete. v0.5.0 promotes the beta.1 baseline without runtime changes. Its production acceptance covers only the request-button/action-callback path; Form and Selection remain unverified and deferred. See [verification](VERIFICATION.md).

## Vision and product principle

Before 1.0, make DingTalk a polished presentation surface and a lightweight interaction/control surface for n8n automation. Notifications, status, reports, tasks, and deterministic actions should appear as rich interactive cards. Escalate to AI/ChatGPT only when understanding, generation, reasoning, or agent behavior is genuinely needed.

**Interactive-first, AI-when-needed.** A deterministic operation should follow `DingTalk Card -> Trigger -> n8n routing/subworkflow -> card update` without LLM involvement. Optional AI is a workflow choice for tasks that need it, not a requirement for ordinary acknowledgement, routing, refresh, or state changes.

## Scope and architecture

Keep two layers distinct:

- **Low-level plugin runtime:** Card Platform lifecycle transport; callback receipt, normalization, and immediate acknowledgement; safe action and presentation contracts; correlation/idempotency metadata; and controlled rendering primitives where feasible. The node should expose reliable building blocks rather than embed business automation.
- **Reusable n8n workflow layer:** a Notification Hub, Report Hub, Action Router, state/idempotency tables, and reusable subworkflows. These route deterministic work directly or optionally invoke a ChatGPT Worker when the task warrants AI.

The plugin is not a general DingTalk suite. OA, contacts, docs, and generic robot APIs remain out of scope; robot delivery fields are only in service of Card Platform instances.

## Controlled A2UI model

Adopt an A2UI-like boundary: an upstream workflow or system submits a constrained **presentation/action descriptor**, and the plugin/runtime maps it to approved DingTalk templates, components, and actions. This is not arbitrary LLM-generated DingTalk JSON and not arbitrary executable UI. Preserve deterministic validation, allowlisted primitives and actions, auditable payloads, and explicit security boundaries. Provide an expert escape hatch for whole-body JSON only in the existing low-level API layer; it does not weaken the higher-level contract.

Descriptors produced with model assistance may be considered only after deterministic validation. Do not accept code, HTML, arbitrary component definitions, or unvalidated actions. Any specific DingTalk input or component support is gated on verification against current official DingTalk Card Platform behavior before implementation. Unsupported or invalid descriptors need a documented safe fallback.

## Milestones

### v0.3.0 — stable release (released)

**Objective:** Close acceptance for the existing beta surface, remove the prerelease qualifier, and establish a reliable stable baseline. No major new product surface.

**Main deliverables:**

- Live Robot Direct Message acceptance.
- Whole-body JSON Create & Deliver acceptance.
- A real v0.3 callback-click acceptance, including the documented callback-to-trigger path.
- Characterize repeated Create behavior with the same `outTrackId`; do not promise deduplication or upsert.
- Regression coverage for existing v0.1/v0.2/v0.3 behavior and n8n UI install/update lifecycle acceptance.

**Acceptance gates (closed):** Scoped live and local evidence, release provenance, canonical artifact digest and npm update-discovery evidence are recorded in [verification](VERIFICATION.md#v030-stable-release-2026-10-24). Robot Direct Message and whole-body JSON lifecycles passed; a real v0.3 button callback reached the trigger and asynchronous Update succeeded; repeated Create with one caller-controlled `outTrackId` was accepted in the tested path without implying deduplication/upsert. A user-performed Community Nodes UI uninstall/reinstall restored package/manifest/installed-version consistency. Stable upgrade remains a user-operated supported Community Nodes UI action; the isolated update-discovery check does not claim the UI button was clicked or observed.

**Non-goals / deferrals:** No new card families, generalized interaction schema, A2UI renderer, business workflow suite, or broad DingTalk API coverage.

**Compatibility and migration:** Preserve existing Form/JSON behavior, callback opt-in, output fields, and saved workflow behavior. Same-ID Create semantics remain explicitly non-guaranteed.

### v0.4.0 — Presentation Contract & Template Kit (stable release)

**Objective:** Define how workflows describe useful card presentations independently of a particular template.

**Main deliverables (implemented):**

- Versioned presentation schema, example payloads, and a template variable contract.
- Alert, Status, Digest, Action, and Report card families.
- Design tokens and visual hierarchy guidance, with card state transitions.
- Low-level raw JSON mode retained for expert API use.

The implementation is a deterministic stateless adapter to the existing Form-mode `cardData.cardParamMap` boundary. It does not ship DingTalk templates or claim verified component support. Status transition descriptions are workflow guidance only.

**Acceptance gates (complete):** Local schema validation, family examples, mapping, compatibility, and workflow-only state guidance are documented and locally verified. Production beta.2 installation, loaded schema, adapter/API transport, and compatibility with the existing lifecycle passed on n8n/runners 2.44.6. The dedicated template definition/export established all 13 contract variables as public strings statically bound in both `editorData` and `widgetInfo`; a visual probe confirmed all 13 Presentation fields, including summary, through one BaseText path. A true Presentation-mode status card then rendered correctly in Mac DingTalk without workflow-supplied `flowStatus` or a JSON request body, demonstrating automatic AI-card completed-state host metadata. Final live Create & Deliver regression passed for all five families; all five n8n executions succeeded, with top-level DingTalk `success=true` and `deliverResults[].success=true` in every response. Temporary test workflows were archived. Stable v0.4.0 promotes this accepted beta.2 baseline without functional changes; publication evidence is recorded in [verification](VERIFICATION.md#v040-stable-release).

**Non-goals / deferrals:** No arbitrary UI or HTML, no automatic template authoring, and no A2UI runtime in this milestone.

**Compatibility and migration:** The contract is additive and versioned. Existing Form and whole-body JSON modes continue to work; no existing request body is silently reinterpreted. Beta.2 was published and production-installed through the supported UI. Transport, lifecycle, and Presentation acceptance are complete for the documented paths.

### v0.5.0 — Interaction Contract & Normalized Trigger (beta.1 production acceptance complete)

**Objective:** Give workflows a stable, safe representation of card actions.

**Main deliverables:**

- A normalized callback envelope for action ID/value, form values, actor, card, conversation, correlation, and event time, with optional raw callback data.
- Action metadata helpers and safe identity/context handling.
- Button, form, or selection inputs only where support has been verified against current official DingTalk Card Platform capabilities.
- Immediate receipt ACK remains; downstream execution remains asynchronous.
- Document a backward-compatibility strategy for current trigger items and source fields.

**Acceptance gates:** Verify each supported interaction type against official documentation and live behavior; test absent/malformed optional fields, preservation of raw data, sensitive-field handling, and compatibility with existing callback consumers. ACK must not wait for downstream workflow completion.

**Non-goals / deferrals:** No promise of synchronous local-update ACK, exactly-once delivery, durable deduplication, or inferred identity types.

**Compatibility and migration:** Add normalized fields without removing or renaming current fields such as `params`, `outTrackId`, or `rawData`. Publish a migration note before any breaking envelope change.

The beta.1 implementation is specified in [INTERACTIONS.md](INTERACTIONS.md), with phases and acceptance criteria in [V0.5_PLAN.md](V0.5_PLAN.md). Production acceptance passed for the existing request-button/action callback path, including compatibility with legacy downstream expressions. Form and selection remain unverified and deferred. Beta.1 is eligible for stable promotion; see [verification](VERIFICATION.md#v050-beta1-production-acceptance--2026-10-25).

### v0.6.0 — Controlled A2UI Runtime (beta.1 candidate)

**Objective:** Add a constrained template-first descriptor adapter without a runtime DOM. The frozen `universal-v1` contract is in [V0.6_PLAN.md](V0.6_PLAN.md) and [A2UI.md](A2UI.md).

**Main deliverables:**

- Versioned descriptor schema and deterministic validation into a fixed NORMAL template variable contract.
- Explicit block and request-action allowlists; unknown input fails closed.
- No arbitrary code or HTML. Model-generated descriptors are acceptable only after deterministic validation.
- No runtime DOM, business router/state/deduplication, or LLM behavior.

**Candidate gates:** Pure mapping and node-level action policy are locally covered. Template import and visual/live acceptance remain pending: no reliable current official schemaVersion 3.0.0 NORMAL dynamic-form/loop asset could be verified, so no fabricated template is shipped.

**Non-goals / deferrals:** No arbitrary LLM-generated DingTalk request bodies, executable UI, or general-purpose visual builder.

**Compatibility and migration:** Additive `a2ui` Card Data Mode for Create & Deliver and Update. Preserve Form/JSON/Presentation behavior and the low-level raw JSON expert path. Update does not enable callbacks.

### v0.7.0 — n8n Action & Workflow Kit

**Objective:** Make common card-to-automation loops reusable while keeping business logic in n8n.

**Main deliverables:**

- Reusable example/subworkflow contracts for Notification Hub, Report Hub, and Action Router.
- Action classes: **Direct** (deterministic, no LLM), **Parameterized** (collect/validate needed inputs), and **Intelligent** (optional ChatGPT Worker).
- Standard `outTrackId`, correlation, idempotency, and state model; acknowledgement, retry, refresh, run, ignore, and open patterns.
- Explicit confirmation and authorization patterns for destructive actions.
- Documented paths from callback to deterministic subworkflow or optional AI worker.

**Acceptance gates:** Examples make deterministic routing the default, show bounded retry and duplicate/replay handling, and avoid blind Create replay. Destructive examples require explicit confirmation/authorization. Keep the kit portable as reusable n8n assets/examples.

**Non-goals / deferrals:** Do not hard-code business automation into the node. The kit does not claim delivery guarantees beyond the underlying node/platform behavior, and does not require ChatGPT for Direct actions.

**Compatibility and migration:** Track state and idempotency explicitly in the workflow layer; do not imply the current plugin has a persistent deduplication store. Existing node identifiers and fields remain usable.

### v0.8.0 — Automation Presentation Kit

**Objective:** Demonstrate polished, reusable presentation patterns for common automation outcomes.

**Main deliverables:**

- Production-quality patterns for error notifications; infrastructure, backup, and UPS alerts; service status; daily and technical digests; GitHub, RSS, and changelog reports; and long-running task progress.
- A summary plus detail-link pattern instead of placing full long reports in cards.
- Consistent visual hierarchy and reusable card templates.
- Verified input/action round trips where supported.

**Acceptance gates:** Each pattern includes a placeholder-safe example, required template variables, state/update flow, and data-sensitivity guidance. Verify action/input round trips against supported platform capabilities before claiming them.

**Non-goals / deferrals:** These are patterns and examples, not built-in external-service integrations or a generic content ingestion suite.

**Compatibility and migration:** Build on the v0.4 presentation contract and v0.7 workflow kit. Keep existing raw JSON recipes available.

### v0.9.0 — Production Hardening

**Objective:** Establish release, compatibility, security, lifecycle, and operational confidence for a stable contract.

**Main deliverables:**

- Compatibility matrix for supported stable n8n and Node versions.
- Reconnect, deactivation, restart, and failure-mode tests; callback duplicate/replay handling guidance.
- Security review, accessibility/readability review, and observability guidance.
- Package/UI install and update end-to-end acceptance; migration and backward-compatibility documentation; complete docs.
- Upgrade acceptance through n8n's supported Community Nodes lifecycle.

**Acceptance gates:** Exercise the matrix and lifecycle paths, document unsupported combinations and limitations, and complete security and migration reviews. Acceptance procedures must use n8n's supported Community Nodes install/update lifecycle. They must not directly mutate the n8n database or internal community-node install directories; such access is permissible only if separately authorized for diagnosis, not as product acceptance.

**Non-goals / deferrals:** Do not broaden into a general DingTalk suite or claim exactly-once callback delivery. Unsupported n8n/Node versions remain clearly identified.

**Compatibility and migration:** Publish the supported matrix and upgrade path before stable release. Test saved workflows across the planned stable contract; call out any required manual migration.

### v1.0.0 — Stable presentation and interaction surface

**Objective:** Release a stable, documented contract for DingTalk card presentation and lightweight control of n8n automation.

**Main deliverables:**

- Stable presentation and interaction contracts with polished group/DM card patterns and documented lifecycle behavior.
- Supported callback interactions and controlled A2UI rendering within verified allowlists.
- Demonstrated deterministic action loops and optional AI escalation.
- Notification and Report Hubs demonstrated as reusable n8n assets.
- Clear compatibility, security, installation, upgrade, and migration documentation.

**Acceptance gates:** Complete the Definition of Done below; no beta-only caveat may stand in for an untested stable contract. Preserve scoped claims for platform and n8n compatibility.

**Non-goals / deferrals:** 1.0 does not mean general DingTalk API coverage. OA, contacts, docs, generic robot APIs, and arbitrary UI remain out of scope.

**Compatibility and migration:** Publish the supported n8n/Node matrix and stable contract changes. Provide a clear path from v0.x workflows and explain any manual changes before release.

## Cross-cutting design principles

- **Deterministic by default:** Route fixed actions through n8n logic; invoke an LLM only for genuine interpretation, generation, reasoning, or agent work.
- **Constrained rendering:** Validate descriptors, allowlist primitives/actions, version schemas, and retain auditable inputs and outputs. Keep expert raw JSON isolated at the low-level API boundary.
- **Verified platform support:** Gate each specific input, component, callback behavior, and rendering claim on current official DingTalk documentation and suitable acceptance evidence.
- **Safe event handling:** Acknowledge callbacks promptly, treat downstream work as asynchronous, preserve source context without inferring identity, and design for duplicates/replays.
- **Explicit state and correlation:** Carry caller-controlled correlation and `outTrackId`; do not confuse correlation with Create deduplication or upsert. Put durable state/idempotency in workflow storage.
- **Least surprise and compatibility:** Preserve existing request/output behavior where practical, version new contracts, and document migration before breaking changes.
- **Security and privacy:** Keep credentials out of payloads/logs, minimize sensitive card and callback data, and use explicit authorization/confirmation for consequential actions.
- **Layer discipline:** Put transport and safe primitives in the plugin; put routing, business policy, storage, and optional AI orchestration in reusable n8n workflows.
- **Readable cards:** Prefer clear status, concise summaries, and detail links. Review contrast, text density, and accessibility for supported clients.

## v1.0.0 definition of done

- [ ] Stable presentation and interaction contracts are documented, versioned, and migration-reviewed.
- [ ] Group and direct-message lifecycle paths are accepted for the supported compatibility matrix.
- [ ] Create, update, streaming/finalization where applicable, and callback interaction behavior have scoped acceptance evidence.
- [ ] Supported callback inputs and controlled A2UI primitives are verified against current official DingTalk behavior; unsupported inputs are not claimed.
- [ ] Descriptor validation, action/component allowlists, safe fallbacks, and raw JSON boundary are documented and reviewed.
- [ ] Deterministic card actions route through n8n without an LLM; optional AI escalation is demonstrated for an appropriate task.
- [ ] Notification Hub and Report Hub patterns and Action Router are usable as reusable n8n assets/examples.
- [ ] Correlation, state, retry, duplicate/replay, and destructive-action confirmation guidance is explicit; no unsupported exactly-once or Create-upsert guarantee is implied.
- [ ] Supported n8n/Node versions, install/update/upgrade lifecycle, migration, security, privacy, and troubleshooting guidance are complete.
- [ ] Reconnect, deactivation, restart, failure-mode, package/UI install/update, accessibility/readability, and regression gates pass for the stated support scope.
- [ ] 1.0 scope remains focused on DingTalk Card Platform presentation and interaction; it does not imply general DingTalk API coverage.

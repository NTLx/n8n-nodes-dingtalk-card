# Presentation descriptor v1

The Presentation Card Data Mode is a stateless adapter from a small, versioned descriptor to the existing Form-mode `cardData.cardParamMap` boundary. It does not render a card or verify DingTalk template components. The package does **not** ship DingTalk platform templates. Users must create, publish, and associate templates whose variables match the mappings below.

## Contract

Every descriptor is a JSON object with required `version: "1"`, `family`, `title`, and `tone`. `family` is one of `alert`, `status`, `digest`, `action`, or `report`. `title` is a non-empty string up to 200 characters. Optional `summary` is a non-empty string up to 1000 characters. Unknown fields are rejected at the descriptor and nested-object levels. Strings are not interpreted as HTML, code, or template fragments. No arbitrary colors, style values, or component trees are accepted.

Semantic `tone` values are `neutral`, `info`, `success`, `warning`, and `danger`. They are labels for user-authored template logic, not colors imposed by this package. Templates may choose their own visual treatment for these tokens.

All list families require 1–20 entries. Digest items have required `title` (up to 200 characters), optional `summary` (up to 1000), and optional `tone`. Report sections have required `heading` (up to 200) and `body` (up to 1000). Unknown fields or malformed entries fail validation. No external schema library is used.

## Families and exact variable mapping

Every family maps the 13 contract variables described below. Presentation mode also adds the AI-host compatibility field `flowStatus: "3"` to the public `cardParamMap`; it is not a descriptor field or part of the Presentation contract. This fixed value cannot be overridden by descriptor input. The current DingTalk AI Card builder templates (`type=im`, `schemaVersion=3.0.0`, `extendType=AI`) require completed-state `flowStatus` for `AICardContainer` to select its completed content branch. The 13 contract variables retain their existing meanings and encodings.

Every family maps these contract entries:

| Descriptor value | `cardParamMap` variable | Encoding |
| --- | --- | --- |
| Contract identity | `presentationVersion` = `"1"` | string |
| `family` | `presentationFamily` | string |
| `title` | `title` | string |
| optional `summary` | `summary` | string, omitted when absent |
| `tone` | `tone` | symbolic string |

Family-specific fields:

| Family | Descriptor fields | `cardParamMap` entries |
| --- | --- | --- |
| `alert` | optional `source` (200 chars), `occurredAt` (100 chars) | `source`, `occurredAt`, omitted when absent |
| `status` | required `state`; optional `details` | `state`, optional `details` |
| `digest` | required `items` array | `items` as compact JSON string |
| `action` | required `label` (100 chars); optional `description` | `label`, optional `description` |
| `report` | required `sections` array | `sections` as compact JSON string |

The only status states are `idle`, `running`, `success`, `failed`, and `cancelled`. Digest and report objects serialize with stable field order as shown in the schema (`title`, `summary`, `tone`; and `heading`, `body`). All resulting values are strings, as required by the existing Card Data boundary. The mapper does not reorder list entries. Thus the payload contains 13 contract variables plus one AI-host compatibility field.

### Template acceptance rule

A successful DingTalk Create & Deliver response proves transport acceptance only. It does not prove that the selected template defines or binds the supplied variables, or that the card renders them. Accept the template contract after inspecting rendered-card evidence or template-definition/export evidence showing the required variables are defined and bound, together with live transport through the selected published template. This establishes template-contract acceptance; it does not by itself claim client pixel-perfect visual inspection.

`Action` is presentation metadata only. `label` and `description` are display strings. They do not define a callback ID, route, authorization, executable action, or platform button. Workflow routing and callback contracts are outside this version.

## Status and transitions

The adapter is stateless: it validates one descriptor and maps it to one `cardData` value. It does not remember prior status or enforce transitions. As workflow guidance, a task may progress from `idle` to `running`, then to `success`, `failed`, or `cancelled`. A workflow may also update a terminal card later when its business process explicitly supports retry or correction. Choose and persist transition policy in the workflow layer; the enum only bounds presentation vocabulary.

## Examples

Placeholder-safe descriptor JSON files and their mapped card data are in [`examples/presentation`](../examples/presentation/). Their `cardParamMap` includes the fixed `flowStatus: "3"` AI-host compatibility value added by the mapper. Workflow patterns using these families are documented in [Automation Presentation](AUTOMATION_PRESENTATION.md); they are not bundled DingTalk templates or ingestion integrations.

### Alert

```json
{"version":"1","family":"alert","title":"Database unavailable","summary":"Primary database health check failed.","tone":"danger","source":"health-check","occurredAt":"2026-10-25T08:30:00Z"}
```

### Status

```json
{"version":"1","family":"status","title":"Nightly backup","summary":"Archive upload is running.","tone":"info","state":"running","details":"12 of 40 GB uploaded"}
```

### Digest

```json
{"version":"1","family":"digest","title":"Engineering digest","tone":"neutral","items":[{"title":"Build passed","summary":"Main branch","tone":"success"}]}
```

### Action

```json
{"version":"1","family":"action","title":"Review deployment","tone":"warning","label":"Open deployment details","description":"Display metadata only; workflow behavior is configured separately."}
```

### Report

```json
{"version":"1","family":"report","title":"Daily operations","summary":"Three services checked.","tone":"success","sections":[{"heading":"Availability","body":"All monitored services responded."}]}
```

## Compatibility and boundaries

Presentation mode is opt-in under Form input for Create & Deliver and Update. Its output is passed through the existing request builder. Existing Form parameters, Card Data JSON, whole-body Input Mode JSON, request construction, and output fields retain their behavior. The template ID is always user supplied for Create & Deliver; this package does not include or publish templates.

This is an adapter, not a renderer or template registry. It does not claim support for specific DingTalk components or visual behavior. v0.5 normalized callback/action contracts and v0.6 controlled A2UI/component rendering are explicitly deferred. There is no executable action routing, arbitrary HTML/code, arbitrary styling, persistent state, or general component allowlist runtime in v1.

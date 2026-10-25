# Controlled A2UI v1

`a2ui` is a bounded Card Data Mode for Create & Deliver and Update. Its frozen schema and limits are in [V0.6_PLAN.md](V0.6_PLAN.md). The plugin accepts presentation data and one optional request action; it is not a runtime DOM, visual builder, template selector, or arbitrary DingTalk JSON renderer. Raw JSON mode remains the separate expert escape hatch.

## Fixed template variable contract

Bind public string variables in a NORMAL template:

| Variable | Value |
| --- | --- |
| `a2uiVersion` | `1` |
| `a2uiProfile` | `universal-v1` |
| `a2uiTitle` | Validated title |
| `a2uiSummary` | Optional validated summary |
| `a2uiTone` | One of neutral/info/success/warning/danger |
| `a2uiContent` | Deterministically rendered plain text blocks |
| `a2uiActionVisible` | `true` or `false` string for conditional button visibility |
| `a2uiActionId` | Present only with an action; bind as request action ID |
| `a2uiActionLabel` | Present only with an action; bind as request button label |
| `a2uiActionParams` | Optional compact JSON string for the action's scalar parameters |

The fixed visual skeleton is a header bound to `a2uiTitle`, content bound to `a2uiContent` (with optional summary), and one request button conditionally bound to `a2uiActionVisible`, `a2uiActionLabel`, `a2uiActionId`, and `a2uiActionParams`. The action binding is a request action; it does not define routing or execute work. Workflow owners route callback IDs in n8n.

No importable template is shipped in this candidate. Inspection of the official [`open-dingtalk/dingtalk-card-examples`](https://github.com/open-dingtalk/dingtalk-card-examples) main tree found `app/card_templates/多 Tab 页.json` and `app/card_templates/智能回复.json`. Both use editor schemaVersion `3.0.0` but export `type: "im"`, `mode: "card"`; the former includes `Loop` and `Input` in its component map. No NORMAL asset matching this profile's fixed skeleton was found or verified. Template import, visual rendering, and live callback binding acceptance remain pending; do not treat this variable contract as evidence of a published or supported template.

For Create & Deliver, an action fails closed unless **Enable Stream Callbacks** is true. Update only changes card data: it cannot turn on callback routing for an existing card. Callback routing belongs to the originally created card. The mapper emits only the fixed string-valued variables above, never `flowStatus` or arbitrary card structure.

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

The root title, keyValue label, and request action label must be non-empty; their original strings are preserved without trimming. Rendered `a2uiContent` is limited to 8,000 UTF-16 code units (`String.length`). Each string action parameter is limited to 1,000 characters and the compact serialized `a2uiActionParams` to 8,000 characters. Oversized values fail closed before template mapping.

The fixed visual skeleton is a header bound to `a2uiTitle`, content bound to `a2uiContent` (with optional summary), and one request button conditionally bound to `a2uiActionVisible`, `a2uiActionLabel`, `a2uiActionId`, and `a2uiActionParams`. The action binding is a request action; it does not define routing or execute work. Workflow owners route callback IDs in n8n.

The official [`open-dingtalk/dingtalk-card-examples` NORMAL loop example](https://github.com/open-dingtalk/dingtalk-card-examples/blob/main/examples/%E5%BE%AA%E7%8E%AF%E6%B8%B2%E6%9F%93%E5%AE%B9%E5%99%A8%E4%B9%8B%E4%BA%A4%E4%BA%92%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%9B%B4%E6%96%B0/%E5%BE%AA%E7%8E%AF%E6%B8%B2%E6%9F%93%E5%AE%B9%E5%99%A8%E4%B9%8B%E4%BA%A4%E4%BA%92%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%9B%B4%E6%96%B0.json) is a current editor schemaVersion `3.0.0` export with `extension.extendType: NORMAL`, a root Card, and Loop/BaseText/SingleButton request-action/event-chain patterns. This proves a current NORMAL v3 source exists and informs this profile. We intentionally do not ship a transformed `universal-v1` import asset yet: the transformation has not been live-import/client/callback accepted. The variable/action binding contract above remains normative; template import, visual rendering, and a real callback click are production beta acceptance gates.

For Create & Deliver, an action fails closed unless **Enable Stream Callbacks** is true. Update only changes card data: it cannot turn on callback routing for an existing card. Callback routing belongs to the originally created card. The mapper emits only the fixed string-valued variables above, never `flowStatus` or arbitrary card structure.

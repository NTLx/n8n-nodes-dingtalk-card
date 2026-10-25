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

The mapper also adds `flowStatus: "3"` to `cardParamMap` as AI Card host compatibility metadata. It is not part of the `universal-v1` descriptor schema or variable contract; callers must not add it to the descriptor. Production evidence showed the published universal-v1 template renders correctly in Mac DingTalk only when this completed-state host value is present, matching the Presentation compatibility behavior.

The root title, keyValue label, and request action label must be non-empty; their original strings are preserved without trimming. Rendered `a2uiContent` is limited to 8,000 UTF-16 code units (`String.length`). Each string action parameter is limited to 1,000 characters and the compact serialized `a2uiActionParams` to 8,000 characters. Oversized values fail closed before template mapping.

The fixed visual skeleton is a header bound to `a2uiTitle`, content bound to `a2uiContent` (with optional summary), and one request button conditionally bound to `a2uiActionVisible`, `a2uiActionLabel`, `a2uiActionId`, and `a2uiActionParams`. The action binding is a request action; it does not define routing or execute work. Workflow owners route callback IDs in n8n.

The official [`open-dingtalk/dingtalk-card-examples` NORMAL loop example](https://github.com/open-dingtalk/dingtalk-card-examples/blob/main/examples/%E5%BE%AA%E7%8E%AF%E6%B8%B2%E6%9F%93%E5%AE%B9%E5%99%A8%E4%B9%8B%E4%BA%A4%E4%BA%92%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%9B%B4%E6%96%B0/%E5%BE%AA%E7%8E%AF%E6%B8%B2%E6%9F%93%E5%AE%B9%E5%99%A8%E4%B9%8B%E4%BA%A4%E4%BA%92%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%9B%B4%E6%96%B0.json) is a current `schemaVersion: 3.0.0`, `extendType: NORMAL` export with global string interpolation and a request `SingleButton`. The official [event-chain example](https://github.com/open-dingtalk/dingtalk-card-examples/blob/main/examples/%E4%BA%8B%E4%BB%B6%E9%93%BE%E9%85%8D%E7%BD%AE/%E4%BA%8B%E4%BB%B6%E9%93%BE%E9%85%8D%E7%BD%AE%E6%BC%94%E7%A4%BA.json) demonstrates conditional visibility on a Grid using a global variable condition. A safe importable transformation remains blocked: the wrapper carries a separate serialized `widgetInfo` render tree, and the official examples do not document how to regenerate it consistently after editing `editorData`. No candidate asset is recorded. Tone styling and arbitrary expansion of JSON params into dynamic named fields are also not established by the inspected examples. Live import, visual rendering, and callback acceptance remain production beta gates.

For Create & Deliver, an action fails closed unless **Enable Stream Callbacks** is true. Update only changes card data: it cannot turn on callback routing for an existing card. Callback routing belongs to the originally created card. The mapper emits only the fixed string-valued variables above, the fixed AI Card host metadata, and no arbitrary card structure.

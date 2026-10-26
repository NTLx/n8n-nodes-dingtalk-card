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

The official [`open-dingtalk/dingtalk-card-examples` NORMAL loop example](https://github.com/open-dingtalk/dingtalk-card-examples/blob/main/examples/%E5%BE%AA%E7%8E%AF%E6%B8%B2%E6%9F%93%E5%AE%B9%E5%99%A8%E4%B9%8B%E4%BA%A4%E4%BA%92%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%9B%B4%E6%96%B0/%E5%BE%AA%E7%8E%AF%E6%B8%B2%E6%9F%93%E5%AE%B9%E5%99%A8%E4%B9%8B%E4%BA%A4%E4%BA%92%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%9B%B4%E6%96%B0.json) is a current `schemaVersion: 3.0.0`, `extendType: NORMAL` export with global string interpolation and a request `SingleButton`. The official [event-chain example](https://github.com/open-dingtalk/dingtalk-card-examples/blob/main/examples/%E4%BA%8B%E4%BB%B6%E9%93%BE%E9%85%8D%E7%BD%AE/%E4%BA%8B%E4%BB%B6%E9%93%BE%E9%85%8D%E7%BD%AE%E6%BC%94%E7%A4%BA.json) demonstrates conditional visibility on a Grid using a global variable condition. A safe importable transformation remains blocked: the wrapper carries a separate serialized `widgetInfo` render tree, and the official examples do not document how to regenerate it consistently after editing `editorData`. No transformed source export is shipped. Tone styling and arbitrary expansion of JSON params into dynamic named fields are also not established by the inspected examples.

For Create & Deliver, an action fails closed unless **Enable Stream Callbacks** is true. Update only changes card data: it cannot turn on callback routing for an existing card. Callback routing belongs to the originally created card. The mapper emits only the fixed string-valued variables above, the fixed AI Card host metadata, and no arbitrary card structure.

The `universal-v1` descriptor and its fixed visual template surface have connected-instance acceptance recorded in [release verification](VERIFICATION.md). This is scoped to the tested published template/client and supported request-button/action callback path; it does not certify arbitrary templates or all clients. A2UI is the user-facing surface used by the stable automation patterns; Presentation v1 remains a deterministic adapter and diagnostic contract. Form and Selection inputs remain unverified and deferred.

## Controlled A2UI v2 — wide rich notification profile

v1.1 adds a second, additive profile for the published wide notification/report template. It does not replace or silently reinterpret `universal-v1`.

Use:

```json
{
  "version": "2",
  "profile": "universal-v2",
  "title": "Mail Daily",
  "summary": "2 件需要处理",
  "summaryMarkdown": "**今天的结论：** 有 2 件需要处理。",
  "tone": "success",
  "status": "SUCCESS",
  "generatedAt": "2026-10-26 08:00",
  "source": "ChatGPT Mail Daily",
  "metrics": [
    {"label":"扫描","value":"42"},
    {"label":"需处理","value":"2"},
    {"label":"值得了解","value":"1"},
    {"label":"风险","value":"0"}
  ],
  "sections": [
    {
      "title": "需要处理",
      "markdown": "1. **CI failed**",
      "links": [{"label":"查看邮件","url":"https://example.com/mail/1"}]
    }
  ],
  "links": [{"label":"查看完整报告","url":"https://example.com/report"}],
  "footer": "ChatGPT Mail Daily · Gmail / Outlook / DingTalk"
}
```

### Fixed v2 template and lifecycle contract

`universal-v2` targets the official DingTalk AI Markdown card lifecycle rather than a hand-authored NORMAL runtime tree. The validated clean export used for stable acceptance is included as [`examples/templates/dingtalk-universal-v2-clean.json`](../examples/templates/dingtalk-universal-v2-clean.json). Import that JSON into your own DingTalk Card Platform workspace and publish it there; DingTalk will assign the template ID that callers select during Create & Deliver. The plugin does not hard-code a template ID.

The bundled export preserves DingTalk's editor-generated runtime structure and exposes the lifecycle variables required by this adapter, including streaming Markdown `content`, `flowStatus`, and `config.autoLayout`. Keep the export unchanged when importing; customize a copied template only if you also preserve the required variable contract.

The mapper emits exactly three string-valued public variables:

| Variable | Meaning |
| --- | --- |
| `content` | complete validated Markdown compiled from the semantic descriptor |
| `flowStatus` | fixed completed-state compatibility value `3` |
| `config` | fixed JSON string `{"autoLayout":true}` for desktop adaptive width |

For `Create & Deliver` with `version:"2" / profile:"universal-v2"`, the node hides the two-step AI-card transport from callers:

1. Compile the semantic descriptor to complete Markdown.
2. Create and deliver the AI card with `content=""` so the official streaming component initializes correctly.
3. Immediately call the DingTalk Streaming API with `key="content"`, `isFull=true`, `isFinalize=true`, and the complete Markdown.
4. Return success only after both Create & Deliver and the final streaming write succeed; successful output includes `streamFinalized=true` and retains both raw responses.

Ordinary `Update` is rejected for `universal-v2` because `content` is a streaming variable. Existing cards continue to use the node's explicit Streaming Update / Finalize operations. `universal-v1`, Presentation, Form and raw JSON behavior remain unchanged.

### v2 validation and safety

- `title` is required and limited to 200 characters.
- `summary` is required plain text and limited to 1000 characters.
- optional `summaryMarkdown` is limited to 1000 characters; when omitted, `summary` is safely escaped for Markdown rendering.
- `tone` remains `neutral|info|success|warning|danger`.
- `status`, `generatedAt`, and `source` are bounded optional metadata. If `status` is absent, the upper-case tone is used.
- `metrics` must contain exactly four non-empty `{label,value}` objects; the compiler renders them into one wide Markdown KPI line.
- `sections` is optional and limited to eight entries. Each entry has a required title, Markdown body, and optional validated links.
- root and per-section links are limited to eight entries each. URLs must be absolute `http` or `https` URLs and may not contain embedded credentials.
- Rich Markdown strings reject HTML tags and ad-hoc Markdown links. Navigation is accepted only through structured `links[]` fields so URL validation cannot be bypassed.
- rendered body, quick-link and final Markdown surfaces have aggregate size limits and fail closed when exceeded.
- v2 currently provides clickable URL presentation. The existing `universal-v1` request action remains the accepted callback/action surface; v2 does not reinterpret Markdown URLs as request callbacks.

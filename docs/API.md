# API contracts checked 2026-10-24

Primary documentation was fetched from current DingTalk documentation pages and their published backing content at `https://icms-document.oss-cn-beijing.aliyuncs.com/zh-CN/dingtalk/{namespace}/topics/{slug}.html`. The backing URL is how the current documentation frontend renders the body; it is not an application endpoint. No live authenticated calls were made.

| Purpose | Method and path on `https://api.dingtalk.com` | Verified contract |
| --- | --- | --- |
| Enterprise internal app auth | `POST /v1.0/oauth2/accessToken` | JSON `{appKey,appSecret}`; response `{accessToken,expireIn}` (seconds). No token header on acquisition. Cache tokens per app. |
| Create & Deliver | `POST /v1.0/card/instances/createAndDeliver` | Required `cardTemplateId`, `outTrackId`, `cardData`, `openSpaceId`; matching delivery models. `cardData.cardParamMap` is string-to-string. Response `{success,result:{outTrackId,deliverResults:[{spaceType,spaceId,success,carrierId,errorMsg}]}}`. Check every delivery result. |
| Update | `PUT /v1.0/card/instances` | Required `outTrackId`; `cardData`, `privateData`, `cardUpdateOptions:{updateCardDataByKey,updatePrivateDataByKey}`, `userIdType`. Response `{success,result}` where result is boolean. |
| Streaming Update / Finalize | `PUT /v1.0/card/streaming` | Required `outTrackId`, `guid`, `key`, `content`; optional `isFull`, `isFinalize`, `isError`. Response `{success,result}` where result is boolean. |

Every card request uses **`x-acs-dingtalk-access-token`**, JSON body, and HTTPS. These are Card Platform endpoints, not the older robot interactive-card APIs.

Primary references:

- [Enterprise app token acquisition](https://open.dingtalk.com/document/orgapp/obtain-the-access_token-of-an-internal-app)
- [Create and deliver cards](https://open.dingtalk.com/document/orgapp/create-and-deliver-cards)
- [Update card](https://open.dingtalk.com/document/orgapp/interactive-card-update-interface)
- [AI streaming update API](https://open.dingtalk.com/document/isvapp/api-streamingupdate) — despite the URL namespace, the permission table explicitly includes enterprise internal apps.
- [Streaming tutorial](https://open.dingtalk.com/document/orgapp/typewriter-effect-streaming-ai-card)
- [Official Python SDK card helper](https://github.com/open-dingtalk/dingtalk-stream-sdk-python/blob/main/dingtalk_stream/card_replier.py) corroborates header, update/streaming paths and payload fields. The published Alibaba Cloud `@alicloud/dingtalk` 2.2.48 SDK `src/card_1_0/client.ts` corroborates the combined create/deliver path, response models and methods. Neither SDK is a package dependency.

`outTrackId` is supplied by the caller and uniquely identifies a card. A new template/data card needs a new ID; repeat creates with the same ID do not generally update data. `openSpaceId` follows `dtv1.card//SPACE_TYPE.spaceId` and supports semicolon-separated spaces in the official combined API. Guided group delivery maps to `IM_GROUP` + `imGroupOpenSpaceModel` + `imGroupOpenDeliverModel.robotCode`; guided direct-message delivery maps to `IM_ROBOT` + corresponding models + `spaceType=IM_ROBOT` and `userIdType=1`. Advanced fields are available through whole-body JSON, not guessed by this package.

`guid` is the streaming request's idempotency identifier. `isFull=true` replaces content, false appends; Markdown requires full, syntactically complete content. Official guidance limits content to 1 K per request and 10 K in total. The API does not expose a universal “finalize endpoint”: completion uses `isFinalize=true`, while error uses `isError=true`. The helper selects exactly one terminal flag and still supplies the required key/content/GUID. It does not force template-specific `flowStatus` values.

The documented Create & Deliver response nests failures under `result.deliverResults`. Defensive detection also handles `result:[{success:false,...}]` delivery-model responses. The latter is compatibility handling, not a claim that the combined endpoint's documented schema changed. `success:false`, `result:false`, nonzero `errcode`, or non-success `code` are errors even on 2xx. Server messages are not copied into execution errors. Some deliveries may already succeed before a partial failure; errors advise inspection rather than blind replay.

Auth cache is bounded and process-local. Workers/restarts can fetch additional tokens. Explicit recognized invalid-token codes permit one auth refresh/replay; other errors never automatically replay writes. There is no distributed retry/idempotency database, no trigger and no callback subscription in this beta. The helper boundaries are available for v0.2.0 reuse.

# Tooling decision

The [official n8n starter](https://github.com/n8n-io/n8n-nodes-starter) and [CLI guide](https://docs.n8n.io/connect/create-nodes/build-your-node/using-the-n8n-node-tool.md) were checked. The package adopts the official CLI, scripts, strict node registration, peer dependency and ESLint conventions in place. Programmatic execution serves the required centralized auth/partial-failure/error behavior; payload construction is pure and tested. There are no starter product nodes.

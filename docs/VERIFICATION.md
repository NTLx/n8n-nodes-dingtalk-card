# Release verification record — 2026-10-24

## v0.4.0-beta.1 publication and production preflight — 2026-10-25 (historical)

The v0.4.0-beta.1 package is publicly published as a beta. This section records release identity and the read-only production preflight state at that time. Its production-upgrade and live-acceptance statements are superseded by the subsequent acceptance section below.

- Tag `v0.4.0-beta.1` points to commit `3bb7e64c5a45aa78ba82ba1547c2e037e8f89655`. GitHub Actions publish run [40110742892](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40110742892) succeeded.
- Public npm dist-tags are `beta -> 0.4.0-beta.1` and `latest -> 0.3.0`. Trusted Publisher/OIDC publication and provenance succeeded.
- The canonical GitHub prerelease asset matches the public npm tarball: **54,776 bytes**, SHA-256 `d906cd7e69379841655cd2c562558cf75bff622e4284ca58e1b9680f232c8870`.
- At the time of this preflight, no live DingTalk Presentation template acceptance had occurred. The package ships no DingTalk templates.

### Connected-instance production preflight

On 2026-10-25, connected production n8n and its runners were healthy on version **2.44.6**. At this preflight point the installed `n8n-nodes-dingtalk-card` was **0.3.0** and its live node schema exposed `cardDataMode` values `form` and `json` only. The official `/api/v1/community-packages` route existed and required authentication. No confirmed existing Public API credential with both `communityPackage:list` and `communityPackage:update` scopes was available on-host, and `N8N_COMMUNITY_PACKAGES` environment management was not configured.

At that point the existing DingTalk Card E2E workflow used the earlier template-variable pattern; it was not evidence of v0.4 Presentation acceptance. Production upgrade and live template E2E were then pending. No private IDs or secrets are recorded here.

## v0.4.0-beta.1 production install and connected-instance transport acceptance — 2026-10-25

Production self-hosted n8n and runners were on **2.44.6**; healthz and readiness each returned HTTP 200. The package `n8n-nodes-dingtalk-card@0.4.0-beta.1` was installed through the supported Community Nodes UI lifecycle. The host package metadata confirmed `0.4.0-beta.1`. Live `get_node_types` exposed `cardDataMode='presentation'` and `presentationDescriptor`.

Connected-instance live acceptance passed the following transport paths:

- A valid status Presentation Update was applied to an existing test card; DingTalk Update returned success.
- The existing draft E2E's Create & Deliver and Update steps were switched to Presentation mode. The run then completed its existing Streaming Update, Finalize, and final whole-body JSON Update; the complete live execution succeeded.

This accepts the Presentation adapter mapping, DingTalk API transport, and compatibility with the legacy lifecycle on this connected instance. The E2E used the existing legacy public AI template solely for these purposes. That template does not satisfy the v0.4 `presentationVersion`/`presentationFamily`/`title`/`tone`/... variable contract documented in [PRESENTATION.md](PRESENTATION.md). Therefore no visual Presentation rendering or matching-template acceptance is claimed. Visual/template E2E remains pending until the user publishes a template matching that contract and runs it. The package ships no DingTalk templates.

The preceding prepublication development verification remains historical and records local gates only; it makes no claim of production use at that earlier point. No real organization, group, card, credential, workflow, execution, or `outTrackId` identifiers are recorded.

## v0.3.0 stable release — 2026-10-24

Stable acceptance for the existing v0.3 scope is closed and the release is published. The earlier beta-era records below are historical; this section records the final stable-release evidence and supersedes their open/remaining v0.3 acceptance statements.

On the connected n8n **2.44.5** instance, the following live paths passed:

- Robot Direct Message Create & Deliver → Update → Streaming Update → Finalize → final JSON Update.
- Whole-body JSON Create & Deliver → Update → Streaming Update → Finalize → final JSON Update.
- Repeated Create using the same caller-controlled `outTrackId` was accepted in the tested path, and both runs completed their lifecycle successfully. This does not establish deduplication, upsert, idempotency, or absence of duplicate delivery.
- A newly sent v0.3 interaction card received a real button click through the DingTalk Stream callback. DingTalk Card Trigger emitted the callback and downstream asynchronous Update succeeded; the temporary test listener was then unpublished.
- A user-performed n8n Community Nodes UI uninstall/reinstall of `0.3.0-beta.1` restored DB/manifest/installed-package version consistency. This is supported lifecycle evidence; no internal database or Community Nodes directory was directly mutated for product acceptance.

This evidence closes the v0.3.0 acceptance scope; it does not certify v1.0 or untested DingTalk templates, form interactions, reconnect and failure modes, or other n8n versions. Stable upgrade remains a user-operated supported Community Nodes UI action. No direct internal database or Community Nodes directory mutation was used as product acceptance.

### Public release identity and artifact

- Stable tag `v0.3.0` targets release commit `e1510c3b0e48b83d7bea9565c20c3c6ec536d17e`; tag CI run [40105981048](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40105981048) succeeded.
- npm Trusted Publisher/OIDC publish run [40106100176](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40106100176), attempt 1, succeeded with provenance. npm `latest` resolves to `0.3.0`; `beta` remains `0.3.0-beta.1`.
- Public stable GitHub Release: [v0.3.0](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.3.0), published (`draft=false`, `prerelease=false`), with exactly one asset matching the canonical public npm tarball bytes and digest.
- Canonical `n8n-nodes-dingtalk-card-0.3.0.tgz`: **48,313 bytes**; SHA-256 `f0776ea697f29cde5b0fe2f7b2b5574f3d029b161ee2a3c348174b1fc3f61972`; SHA-1 `c94da00b74e0af6274796b0e4242f1a457f14f8b`; SHA-512 `f47293ebe7c8c48e23cff5f86e68e3b7cf7dccba1e26c1c59c20ba40f155ba1aea60c153985d814a3f6e40ab43ad62b78f7516f8ea18da89acdc3d56624e8149`; npm integrity `sha512-9HKT6+fIxI4jz/X4bmjjt899zLoeJsHFnCC6QPFVuhrqYMFTmF2BSj9uQKtDrWK3j3UW+OoY2oms3D1WYk6BSQ==`.

### Update-discovery evidence

In a disposable `/tmp` package project using `https://registry.npmjs.org/`, `n8n-nodes-dingtalk-card` was installed with an exact `0.3.0-beta.1` dependency and `npm outdated --json` reported `current: 0.3.0-beta.1`, `wanted: 0.3.0-beta.1`, and `latest: 0.3.0`. The temporary project was removed. This confirms npm update discovery exposes stable as the latest version for that pinned beta install. It is not evidence that the n8n Community Nodes UI Update button was clicked or observed, and it did not access production n8n. The stable upgrade remains a user-operated supported Community Nodes UI action.

Local release gates passed on **Node 26.12.1 / npm 12.2.1**: clean `npm ci`; lint; typecheck; build; **56 tests passed / 0 failed / 0 skipped**; `verify:package` including standalone extracted class registration (**20 allowlisted files**); `npm audit --omit=dev --audit-level=high` (**0 production vulnerabilities**); and `git diff --check`. The clean install reports the existing development-tree advisories (**19 high, 4 moderate**), deprecations and five blocked install scripts; install completed successfully. These development advisories are outside the production package audit and were not changed as part of this release. These are prepublication gate results; the final public identity and digest are recorded above.

The prepublication `npm pack --ignore-scripts --json` inspection found **20 files** in the candidate tarball (48,024 compressed bytes): package metadata, README, changelog, license, compiled nodes/credential and icons, API/design/roadmap/verification docs, and five examples. The packed manifest version was `0.3.0`; no tests, source files, or unrelated repository files were included. This candidate inspection is historical; public registry metadata, provenance and canonical tarball identity are recorded above.

The GitHub CI workflow runs the same install/lint/typecheck/build/test/package/audit gates on Node 24 for branch pushes, pull requests and tags. The npm workflow grants only `id-token: write` for Trusted Publisher/OIDC provenance; no npm token or secret is added. Stable `v0.3.0` publishes with `latest`; beta versions publish with `beta` and may synchronize `latest` only while npm reports no stable version. Tag/version checks are exact. This describes the release process; the completed tag, workflow runs, GitHub Release and npm publication are identified above.

## v0.3.0-beta.1 release preparation — local verification (historical)

This source-only candidate combines the three completed v0.3 slices: additive Form card parameter String/JSON modes with legacy and whole-body JSON compatibility; sanitized normalized outbound `errorDetails` with conservative retryability/`mayHaveSucceeded` metadata and unchanged one-time invalid-token replay; and stable caller-controlled `outTrackId` recovery guidance with a packaged synthetic branch fixture. Existing v0.2 Stream behavior is preserved. No node runtime behavior beyond those already-implemented v0.3 outbound slices is changed in this release preparation.

Version metadata is `0.3.0-beta.1`. At the time of these local gates the candidate was untagged and unpublished; publication and production evidence are recorded in the post-release section below. This is not a stable release.

Candidate gates passed locally on Node **26.12.1 / npm 12.2.1**:

- Clean `npm ci`: exit 0; 588 packages installed. npm reports 23 total development-tree advisories (19 high, 4 moderate), deprecations, and five blocked install scripts; these existing install notices did not alter the dependency manifest or lockfile.
- `npm run lint`, `npm run typecheck`, and `npm run build`: exit 0.
- `npm test`: **56 passed, 0 failed, 0 skipped**.
- `npm run verify:package`: exit 0; **18 allowlisted files** and standalone class registration passed. Inspection of the actual packed tarball confirms manifest version `0.3.0-beta.1` and inclusion of `examples/stable-create-and-deliver.retry.json`.
- `npm audit --omit=dev --audit-level=high`: exit 0; **0 production vulnerabilities**.
- Publish workflow YAML parsed successfully. The exact `0.3.0-beta.1` version/tag pair passes its strict version expression; OIDC permission, provenance publish command, and stable-version `latest` guard remain present.
- `git diff --check`: passed. The release-preparation diff contains no node/transport/trigger runtime changes; the only script/test assertion adjustment pins package verification to the candidate version.

This historical local-gate run did not create a tag, GitHub release, npm publication or n8n installation. Later live and publication results are recorded below; current stable n8n runtime/UI compatibility and stable/v1.0 readiness remain unverified.

## Baseline and provenance

- Repository: `NTLx/n8n-nodes-dingtalk-card`; remote `git@github.com:NTLx/n8n-nodes-dingtalk-card.git`.
- Default branch: `main`. Initial HEAD: `0ad928a` (`Add initial README for n8n-nodes-dingtalk-card`). Working tree was clean; README contained only the package heading. No existing product implementation or local project instructions were found. The supplied user-level AGENTS instructions were applied.
- Initial local Node/npm: 26.12.1 / 12.2.1. Release gates target Node **24.22.1**, npm **11.19.1**, using an official nodejs.org binary checked against its published SHA-256 manifest.
- Current npm stable n8n metadata: `n8n@2.44.6`, requiring Node >=24, depending on `n8n-workflow@2.44.2`. That exact workflow API is the development dependency. Earlier Node 22 starter guidance is superseded by the current stable host's requirement. The exploratory Node 22 install emitted an engine warning and was stopped; Node 22 is not supported by this beta.

## Local gates

- Lockfile install: `npm ci` on Node 24, with lifecycle scripts enabled; successful. Native dependency/deprecation/install-script advisories are emitted by npm, but installation succeeds.
- Lint: official `n8n-node lint`, with no unresolved errors or warnings from ESLint. Two narrowly scoped helper-error exceptions document conversion to n8n errors at the execution boundary. One custom credential-test helper call uses the only helper provided by the official `ICredentialTestFunctions` type (`request`) and documents that compatibility exception. Main node execution uses `httpRequest`.
- Typecheck: `tsc --noEmit`; successful.
- Build: official `n8n-node build`; successful, including SVG asset copying.
- Tests: **26 passed**, no live HTTP. Coverage includes auth request/header, expiry/cache/coalescing/secret rotation, bounded auth rejection retry, non-retry of ambiguous failures, error sanitization, request contracts, invalid JSON/types, Form mapping, generated and explicit identifiers, partial business failures, terminal success/error frames, item pairing/Continue On Fail, credential test and error-workflow fixture construction.
- Packaging: real `npm pack` (without publishing), archive allowlist inspection, extraction and load of registered classes against the pinned n8n peer API, including icon path checks. The npm 10/11 array and npm 12 object JSON output formats are supported. Only compiled JS/SVG, package metadata, README/license/changelog, docs and example JSON are allowed. Source, tests, development scripts/config/lockfile, environment files, and starter example nodes are excluded. No secret material was added; tokens and identifiers in tests/examples are mock values or explicit placeholders.
- Dependency audit: `npm audit --audit-level=high` passes with **0 high/critical**, **10 moderate** advisory entries inherited through the development CLI's `@n8n/ai-node-sdk` dependency graph. Underlying affected libraries: `qs`, `stream-json`, `uuid`. These development dependencies are not bundled into the tarball. This is not a zero-advisory audit; no force downgrade or dependency override masks the findings. Revisit the CLI upstream before npm/stable release.
- GitHub Actions runs the same install/lint/typecheck/build/test/package/audit gates on Node 24. A successful run for the pushed beta commit is required before its annotated tag and GitHub prerelease are created. CI run links are available in GitHub's Actions tab and the release notes.

## Toolchain adjustment

The official starter conventions were adopted in place. npm's stable CLI 0.53.4 pinned Handlebars 4.7.9, with critical advisories. The official CLI **0.54.2 beta** pins fixed Handlebars 4.7.10. It is explicitly pinned in the manifest/lockfile; there are no dependency overrides. The repository does not expose the CLI's npm-publishing release command.

## npm publishing preparation — 0.1.0-beta.2

The package metadata includes `README.md`; the package check asserts the `n8n-nodes-` name, required community-node keyword, README, and exact compiled node/credential registration paths. The npm workflow is manually dispatched from a matching `v0.1.0-beta.N` tag, runs all release gates, publishes with the `beta` dist-tag, and grants GitHub OIDC permission for npm trusted publishing/provenance. The first version was published manually. npm Trusted Publisher was subsequently configured for GitHub Actions (`NTLx`, repository `n8n-nodes-dingtalk-card`, workflow `publish.yml`), as reported by the package maintainer.

On 2026-10-24, a fresh install and local gates ran on Node 26.12.1/npm 12.2.1. Lint, typecheck, build, 26 tests and tarball verification passed. `npm audit --omit=dev --audit-level=high` passed with zero production findings. The unfiltered audit reports 19 high and 4 moderate findings in the n8n development CLI/toolchain dependency graph; these dependencies are not shipped in the package, so CI and the publishing workflow gate production dependencies. This does not claim the development toolchain is advisory-free.

The public npm registry contains `n8n-nodes-dingtalk-card@0.1.0-beta.2` at `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.1.0-beta.2.tgz`. Registry metadata reports repository `git+https://github.com/NTLx/n8n-nodes-dingtalk-card.git`, keyword `n8n-community-node-package`, node `dist/nodes/DingTalkCard/DingTalkCard.node.js`, and credential `dist/credentials/DingTalkCardApi.credentials.js`. As of 2026-10-24, both `beta` and `latest` dist-tags point to `0.1.0-beta.2`. It can be installed from the n8n UI using `n8n-nodes-dingtalk-card@beta`; n8n verification and real DingTalk E2E remain pending.

The published beta.2 tarball predates this documentation status update, so its bundled README still contains the earlier unpublished-status wording. The repository README is current; refreshing the registry README requires a future package version.

## Beta.3 and beta.4 Trusted Publisher acceptance

Version `0.1.0-beta.3` has an annotated Git tag and GitHub prerelease but was not published to npm. Its initial publish run (`40077207361`, attempt 1) and one requested rerun (same run ID, attempt 2) both stopped at `npm dist-tag rm n8n-nodes-dingtalk-card latest` with `E400 400 Bad Request ... Dist-tag request rejected`. Neither run reached `npm publish`.

As of the beta.4 preparation on 2026-10-24, public npm reported `beta -> 0.1.0-beta.2` and `latest -> 0.1.0-beta.2`. The beta.4 publish workflow no longer attempts to mutate `latest`; it publishes with `--tag beta --provenance` and includes post-publish tag, metadata and tarball checks.

## Beta.4 Trusted Publisher result — 2026-10-24

- Release commit: `94d40863e4312a11226bcc924722cb0d367aa134` (`Prepare beta.4 trusted publishing`). GitHub CI run `40077599177` succeeded, including install, lint, typecheck, build, 26 tests, package verification and production audit. Annotated tag `v0.1.0-beta.4` and GitHub prerelease were created.
- GitHub Actions publish run `40077715622`, job `120824592349`, succeeded at **Publish beta with provenance**. npm reported `Signed provenance statement with source and build information from GitHub Actions` and recorded a transparency-log entry at `https://search.sigstore.dev/?logIndex=3438438337`. Public registry metadata exposes an attestation at `https://registry.npmjs.org/-/npm/v1/attestations/n8n-nodes-dingtalk-card@0.1.0-beta.4` with predicate `https://slsa.dev/provenance/v1`.
- The overall publish run concluded failure because its immediate **Verify public npm dist-tags** step read the old packument during registry processing and treated npm CLI's JSON array result as an object. The logged response still showed beta.2. No second publish was run. A subsequent fresh public query with `--prefer-online` verified `beta -> 0.1.0-beta.4` and `latest -> 0.1.0-beta.2`.
- Public package metadata reports version `0.1.0-beta.4`, tarball `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.1.0-beta.4.tgz`, integrity `sha512-IVzMIqoBiXx6qYhue2NgY/BkP+mMMJzxx3c+Pp5PItMuv/caVKiYQk/8CuvYZt6kqaAvCWHwLp2BS37nfGKkmA==`, and repository `git+https://github.com/NTLx/n8n-nodes-dingtalk-card.git`. The fetched public tarball's SHA-512 matched registry integrity; its 13 files included README, compiled node and credential entries, and its manifest version matched.
- The `latest` tag remains the one-time cleanup issue and is deliberately unchanged by the beta publishing workflow. No stable release was created. Beta.3 remains GitHub prerelease only and was not published. Real DingTalk E2E and full current-stable n8n runtime compatibility remain unverified.

## Guided Robot Code default — 2026-10-24

Inspected `DingTalkCardApi.credentials.ts` and the node execution path before changing guided Create & Deliver. The bound credential's `appKey` (Client ID / AppKey) now supplies `robotCode` at execution time when the guided field is missing, empty or whitespace-only, for both group and robot direct-message targets. Nonblank overrides are preserved exactly. The node field is optional and its help text documents the default. Whole-body JSON, endpoint/model semantics, auth handling and other operations are unchanged. The resolved credential is used only in the outbound request, without adding it to outputs, logs or errors.

Local non-live gates on Node **26.12.1**, npm **12.2.1**:

- `npm run lint`: exit 0; no ESLint errors or warnings (Node emits an environment color-setting warning).
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0; TypeScript and static assets built successfully.
- `npm test`: exit 0; **29 passed, 0 failed, 0 skipped**. Added regression coverage for both delivery targets with missing/empty/whitespace Robot Code, exact explicit overrides, unchanged JSON payloads, successful output without credential values, and sanitized thrown/Continue On Fail errors when an HTTP exception contains credential/request data.
- `npm run verify:package`: exit 0; **13 allowlisted files**, archive extraction, registered class loading and icon checks passed.
- `npm audit --omit=dev --audit-level=high`: exit 0; **0 vulnerabilities**.
- `git diff --check`: exit 0.

No live DingTalk or n8n UI validation was performed. Package version remains `0.1.0-beta.4`; this focused development change does not create a tag or publish an npm/GitHub release.

## Beta.5 release preparation — 2026-10-24

Release target `0.1.0-beta.5` includes the focused Robot Code default from `8916aea395f3604a0f104d3cb3065cb47528e8b6`. Release preparation changes manifest/lockfile versions, release documentation and the publishing workflow only.

The user reported that n8n Community Nodes Update downgraded an installed beta.4 to stale `latest -> 0.1.0-beta.2`. Beta.5 therefore adds `npm dist-tag add <package>@<published-beta> latest` after successful publishing in the same Trusted Publisher/OIDC job. No tag removal or npm token fallback is used. Before synchronization, the workflow checks public versions and skips changing `latest` if a stable version exists; malformed/failed queries or a failed dist-tag add fail the job. It verifies both `beta` and `latest` against the published version when synchronization applies. **TODO / transition:** once the first stable release exists, `latest` must track stable and beta must stop rewriting it. This temporary n8n compatibility policy does not make beta.5 stable.

The initial standalone pack inspection failed because lifecycle build output preceded JSON on stdout; no package failure was established and no release occurred. The resumed gate uses `npm pack --ignore-scripts --json` after a successful build, then inspects and loads the actual tarball with the same allowlist/class/icon checks as `verify:package`. After the workflow/docs change, all local release gates passed on Node **26.12.1** / npm **12.2.1** (exit 0): clean `npm ci`, lint, typecheck, build, **29 tests passed / 0 failed / 0 skipped**, `verify:package`, standalone pack inspection (**13 allowlisted files**, beta.5 manifest, registered class loadability and icon checks), production audit (**0 vulnerabilities**), and `git diff --check`. Workflow YAML/step ordering/OIDC permissions and all inline JavaScript syntax were validated; six mocked synchronization scenarios covered prerelease-only history, stable history, empty/malformed history, registry failure and dist-tag rejection. The clean install still reports existing development-only advisories (**19 high, 4 moderate**), deprecations and npm 12 blocked dependency install-script notices. GitHub CI must pass before annotated tag/prerelease creation. Final workflow, public registry, tarball integrity and provenance results are recorded in the GitHub prerelease notes after publication.

No live DingTalk or n8n UI validation is claimed. This remains a beta, not a stable release.

## Connected-instance live E2E — 2026-10-24

A real connected n8n **2.44.x** instance/runtime and DingTalk enterprise app completed group **Create & Deliver → Update → Streaming Update → Finalize → Update(FINISHED)** with public default AI template `02fcf2f4-5e02-4a85-b672-46d1f715543e.schema` and blank guided Robot Code fallback. Create & Deliver and Update succeeded initially. The first Streaming Update used key `content` and failed with HTTP 500. After changing to `msgContent`, setting INPUTING (`flowStatus: "2"`), using **1-second waits**, sending the terminal streaming frame and then Update with FINISHED (`flowStatus: "3"`), the full lifecycle succeeded.

The current DingTalk-Real-AI SDK contract was independently inspected at commit `6f42d37ab22b0d872450148efe01c7b4b82d1e78` ([source](https://github.com/DingTalk-Real-AI/dingtalk-channel-sdk-python/blob/6f42d37ab22b0d872450148efe01c7b4b82d1e78/SPEC.zh-CN.md#5-ai-卡片协议五步)). It corroborates the public template/key/states and approximately 500ms spacing around frames (with 800ms streaming throttling). The reusable payload recipe uses the successful 1-second pacing. Generic Finalize remains a terminal-frame helper; the subsequent template-specific FINISHED Update is required for visual completion.

Only this real group/public-template path is established. This is not certification of all templates, direct-message delivery, error finalization, quotas, failure recovery or all n8n runtime/UI behavior. No workflow/execution IDs, private org/group/robot/user identifiers or secrets are included. Earlier verification entries describe their historical scope and predate this live result.

## Beta.6 release gates — 2026-10-24

The scoped change updates the shared guided streaming/finalize key default and help text, regression coverage, public lifecycle documentation/example, and manifest/lockfile/changelog metadata. The existing OIDC publishing workflow and stable-version dist-tag guard are unchanged. Local gates passed on Node **26.12.1** / npm **12.2.1**: clean `npm ci`, lint, typecheck, build, **30 tests passed / 0 failed / 0 skipped**, `verify:package`, standalone `npm pack --ignore-scripts --json` inspection (**14 allowlisted files**, beta.6 manifest, registered class loading, icons and `msgContent` default), production audit (**0 vulnerabilities**), and `git diff --check`. The packed node also completed all five payload-recipe steps against mocked HTTP, checking blank Robot Code fallback, INPUTING, streaming key, terminal-only Finalize and FINISHED merge update. No separate live run was performed for this example.

The clean install reports existing development-toolchain advisories (**19 high, 4 moderate**), deprecations and npm 12 blocked dependency install-script notices; it exits successfully. CI on Node 24 must pass for the pushed release commit before tag/prerelease creation. The unchanged OIDC publishing job repeats release gates before publication. Post-publication CI, public dist-tags, metadata/tarball/integrity and signed provenance evidence belongs in the GitHub prerelease notes so it identifies the immutable published artifact.

## Limits and next acceptance

The `0.3.0-beta.1` beta is published; no stable release is implied. Earlier gate records above are historical. Mocked tests and tarball class loading complement the connected-instance live result but do not expand its tested scope. The v0.3 stable-ID recovery fixture uses synthetic values and placeholders; it is locally validated, not a live execution.

The post-release request-button callback E2E below passed; broader live Stream acceptance remains open before stable v0.2.0. The transport uses gateway credential authentication and immediate receipt ACK, with normalized button/form data; durable deduplication is deferred and workflows must make side effects idempotent. Before v1.0.0, verify the remaining group/DM delivery, rendering, error states and failure recovery cases, plus current-stable n8n runtime/UI compatibility. Resolve/reassess upstream development advisories before stable publication.

## v0.3.0-beta.1 connected-instance live acceptance — 2026-10-24

Acceptance ran against the connected self-hosted production n8n **2.44.5** instance. The offline `0.3.0-beta.1` candidate was temporarily installed into community-node `node_modules` with no-save, no-lockfile and no-script semantics. The parent `/home/lx/n8n/data/nodes/package.json` remained byte-identical. After restarting `n8n_service`, `/healthz` and `/healthz/readiness` each returned HTTP 200 twice consecutively under bounded readiness polling, and app-to-DB TCP connectivity succeeded. The DB and runners were neither restarted nor recreated. Startup logs contained no community-node, module or migration failures. The first attempt was rolled back after an immediate post-restart connection refusal was treated as failure; postmortem found no candidate startup defect. The second attempt passed the bounded readiness checks.

Before package acceptance, an unrelated external task-runner routing incident caused JavaScript Code executions to hang. Resetting the `n8n_service` and `n8n_runners` sessions restored execution. A disposable Manual → JavaScript Code → Python Code probe succeeded as execution **4487**; probes were then archived. This was an environment incident, not a DingTalk Card defect.

After candidate load and the `n8n_service` restart, a fresh disposable Manual Trigger → JavaScript Code probe completed successfully as execution **4503**, confirming external JavaScript task-runner execution remained operational; the probe workflow was then archived.

Live DingTalk executions on the candidate:

- **4489 passed** Group Create & Deliver → Update → Streaming Update → Finalize → final Update. It mixed legacy String values and new JSON Value Mode structured parameters; every card operation returned `success=true`, with the same `outTrackId` propagated throughout.
- **4490 passed** Continue On Fail local validation handling: `errorDetails.category=validation`, `retryable=false`, `mayHaveSucceeded=false`.
- **4491 passed** synthetic nonexistent-card Update: sanitized HTTP 400 `param.cardNotExist`, `category=http`, `retryable=false`, `mayHaveSucceeded=true`; raw response content was not leaked.
- **4492 passed** caller-controlled stable `outTrackId` end-to-end and returned the exact supplied ID. No duplicate Create replay was attempted.
- **4493 passed** the lifecycle with final Update in whole-body JSON mode, verifying request-body passthrough without duplicating the robot AppKey into the workflow.
- **4494 passed** Create & Deliver for a callback-enabled interaction card with `enableStreamCallbacks`. No button click was performed, so callback delivery was not revalidated in v0.3. The earlier v0.2 real callback E2E remains the inbound-trigger evidence; trigger code was unchanged in v0.3.

Remaining limits: Robot Direct Message was not rerun because this acceptance did not introduce a staff `userId`. Whole-body JSON Create & Deliver was not rerun because it would require explicitly duplicating robotCode/AppKey into the workflow; whole-body JSON Update was tested. Same-`outTrackId` Create deduplication/upsert is intentionally neither claimed nor tested. This evidence supports the stated v0.3 outbound beta scope; it does not establish stable/v1.0 readiness. Final publication and smoke results follow.

## v0.3.0-beta.1 post-release verification — 2026-10-24

### Public release identity

- Tag `v0.3.0-beta.1` still points to release commit `30f751a5d86961561ecebae1af80953942e77105`; tag CI run [40098428907](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40098428907) succeeded.
- npm Trusted Publisher/OIDC run [40098512847](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40098512847), attempt 1, succeeded with provenance, 56 tests, package verification and production audit. npm `beta` and `latest` both resolve to `0.3.0-beta.1`; no stable version exists. npm `gitHead` matches the release commit.
- Public provenance identifies `refs/tags/v0.3.0-beta.1`, the exact release commit, `.github/workflows/publish.yml`, and run 40098512847 attempt 1.
- The GitHub release asset now matches the public npm tarball byte-for-byte. The earlier GitHub archive differed only at the compressed archive-byte level; extracted content, file lists and tar metadata were identical before replacement. Canonical `n8n-nodes-dingtalk-card-0.3.0-beta.1.tgz`: **37,375 bytes**; SHA-256 `cc1463e9b686b4ec6923c919c33699724adf306dfe55ed43c71c29d52cf805ce`; SHA-1 `053793052108a340f7cb75cf2b7747c4a14802ba`; SHA-512 `c6d7b8c5d1ff62a627fa05d81c8a4536464df30c93d0115291dfdf9b7c98dba8ffc8ccaa406d2469e579e7b9972b955a990dc6dc47eb2eaedce383fccc190e37`; npm integrity `sha512-xte4xdH/YqYn+gXYHIpFNkZN8wyT0BFSkd/fm3yY26j/yMyqQG0kaeV557mXK5VamQ3G3EfrLq7c44P8zBkONw==`. The release contains one intended `.tgz` asset.

### Production install and lifecycle smoke

The production n8n community-node manifest and installed package are exact `0.3.0-beta.1` from public npm. Only `n8n_service` was restarted. Health and readiness each passed twice consecutively; DB and runners were unchanged. The loaded node schema includes v0.3 Value Mode. Install-time production n8n dependency resolution reported 6 audit vulnerabilities and an `isolated-vm` install-script trust notice. These install-tree findings are distinct from the package release production audit, which reported **0 vulnerabilities**; no causality is inferred.

Post-release live lifecycle smoke execution **4526** succeeded across Create & Deliver, Update, Streaming Update, Finalize and final Update, with `success=true` and the same caller-provided `outTrackId` throughout. After the smoke there were no active running, waiting or new executions.

Remaining limits are unchanged: Robot Direct Message was not rerun; whole-body JSON Create & Deliver was not rerun; no same-ID Create deduplication/upsert behavior is claimed; and a v0.3 callback click was not rerun. Earlier v0.2 callback evidence remains scoped to its documented path. This is beta evidence only, not stable/v1.0 certification.

## v0.2.0-beta.1 prerelease — local verification and remaining live acceptance

This prerelease deliberately replaces the proposed upstream SDK dependency with a narrowly scoped self-contained transport due previously verified ticket-bearing URL log risk. No SDK implementation was imported/copied and no global console monkey-patch is used. New callback behavior is not covered by the earlier outbound live result.

Final local gates passed on **Node 24.22.1 / npm 11.19.1**: clean `npm ci`, lint, typecheck, build, **44 tests passed / 0 failed / 0 skipped**, `verify:package` including fresh-process standalone packed class loading/registration (**17 allowlisted files**), production `npm audit --omit=dev --audit-level=high` (**0 vulnerabilities**), and `git diff --check`. These are the CI-equivalent Node 24 gates; remote CI status must be checked for the pushed commit. No live credentials were used. Clean install continues to report existing development-toolchain advisories (**19 high, 4 moderate**), dependency deprecations and unapproved optional install-script notices; it exits successfully. No dependency additions or unrelated audit fixes are included.

Tests cover exact CALLBACK subscription/topic filtering, normalized/raw and malformed data, private params, immediate empty ACK-before-emit, SYSTEM ping/disconnect, fresh gateway lookups and bounded backoff, opening/idle timeouts, queued timer cancellation, active/pending socket cleanup, deactivation during gateway lookup (including helpers that ignore abort), duplicate Client ID lock/release, and sentinel secret errors from gateway, WebSocket constructor/error/send paths. Native Node WebSocket subprocesses use disposable local TLS and verify real wire ACK, n8n one-item emission, handshake failure redaction and process exit after pending/active close. These tests require OpenSSL and no live credentials.

The packed verifier extracts the actual tarball to a temporary directory, links only the declared pinned n8n peer, and loads both registered node classes and the credential in a fresh Node subprocess using normal module resolution. It checks icon assets and trigger identity/registration. This complements runtime fixtures; it does not certify the full n8n UI.

The post-release button callback result below covers activation, STREAM card delivery, one click, normalized button params and successful asynchronous Update. Remaining live acceptance includes:

1. Exercise additional templates and form submissions; verify their payload mapping and rendering.
2. Measure ACK timing/retry behavior beyond the reported ~60-second retry window, and test delayed/failed downstream work. Do not assume exactly-once delivery or synchronous local-update ACK support.
3. Interrupt connectivity and restore it; verify reconnect, deactivation while opening/connected and n8n restart without lingering resources or post-stop items.
4. Exercise duplicate-client lock/release, including manual listeners; verify single-service deployment across workers/replicas/external services, which the local lock cannot detect.
5. Recheck outbound lifecycle regression and default callback omission where needed. Record only non-sensitive pass/fail evidence; never copy private identifiers, callback values or secrets into public reports.

The release uses an annotated `v0.2.0-beta.1` tag, GitHub prerelease with packed artifact, and the existing manually dispatched `.github/workflows/publish.yml` Trusted Publisher/OIDC job, with no npm token. Its tag/version allowlist now accepts v0.1.0 and v0.2.0 beta releases; OIDC permissions, repeated gates and stable-version dist-tag guard are unchanged. While public history has no stable version, both beta and latest must resolve to this version. Final commit/CI/publish-run links, public tarball digests, contents/registration checks, registry signature and SLSA provenance verification are recorded in GitHub prerelease notes after publication without changing the tagged source. The tested button callback path subsequently passed; see the post-release result below.

## v0.2.0-beta.1 release preparation

Release-only changes promote candidate wording to prerelease status and extend the existing publish tag/version allowlist to the v0.2.0 beta series. Node code, protocol semantics, credential handling, dependencies and package version are unchanged from candidate commit `9b3378cebd8c4c7a47314eef98adaf3594f23dff`, whose Node 24 CI run `40086571013` passed. The full local release gates are rerun after these wording/workflow changes, and the final release commit must pass GitHub CI before tagging. The upstream SDK safety rationale, immediate-ACK/asynchronous-update limits, single-service requirement and private-identifier hygiene remain in force. At release preparation, inbound callback live E2E was pending; the later post-release result below establishes the tested button path.

## Post-release button callback live E2E — 2026-10-24

The maintainer supplied the following successful real DingTalk E2E result for documentation closure on the connected **self-hosted n8n 2.44.x** instance, using the **same enterprise-app Client ID** for creation and listening:

- **Activation and delivery:** DingTalk Card Trigger activated successfully; a request-button card with `callbackType=STREAM` was delivered.
- **Real interaction:** one real button click produced a `CALLBACK /v1.0/card/instances/callback` trigger execution. Normalized `params` contained the expected button id/text.
- **Asynchronous update and completion:** downstream Update returned success, the card visibly changed, and execution completed successfully.

This validates the tested request-button callback path and immediate receipt ACK transport with asynchronous downstream execution in practice. It does not certify every template, form submission, reconnect or failure mode, establish exactly-once delivery, or add synchronous local-update ACK support. No measured ACK latency or untested recovery behavior is claimed.

Only the non-sensitive result is recorded. No private organization/group/robot/user/workflow/execution identifiers, message IDs, tracking IDs, corp IDs, actual callback values or secrets are included. This closure makes no new live calls and changes only repository documentation and existing GitHub prerelease notes. The annotated tag, tagged source, package version/lockfile, release asset and npm publication remain unchanged; the immutable archive's bundled documentation predates this post-release record.
# v0.4.0-beta.1 prepublication development verification — 2026-10-25 (historical)

This records local verification before publication; its unpublished status describes that point in time only. Current publication and production preflight status is recorded in [the post-release section above](#v040-beta1-publication-and-production-preflight-2026-10-25). The v0.4.0 Presentation Contract & Template Kit was implemented. Package metadata was `0.4.0-beta.1`; release preparation allowed v0.4.0 beta tags under the established beta channel and validated exact package version/tag matches; the stable `v0.3.0` guard remained the only `latest` publish path. On the repository's configured Node/npm environment, release gates passed: clean `npm ci`; `npm run lint`; `npm run typecheck`; `npm run build`; `npm test` (**60 passed, 0 failed**); `npm run verify:package` (standalone packed class loading/registration passed; **27 allowlisted files**); `npm audit --omit=dev --audit-level=high` (**0 production vulnerabilities**); release-ref policy self-tests; YAML and inline Node.js syntax validation; and `git diff --check`. The clean install reported 23 total dependency advisories across development and production dependencies.

Tests covered all five descriptor families, deterministic string mapping, contract identity fields, unknown versions/families/fields, wrong types, missing fields, invalid status values, collection bounds, and Create & Deliver/Update node mapping. Existing test coverage remained passing. No DingTalk credentials or live template were used. At prepublication verification time, no template rendering, live acceptance, npm publication, Git tag/release, or external-system mutation was claimed. The package contains no DingTalk platform templates; users must publish templates matching the documented variables.

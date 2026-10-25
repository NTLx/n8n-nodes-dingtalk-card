# Release verification record — 2026-10-24

## v0.9.0-beta.1 local production-hardening candidate — 2026-10-25

This is local candidate evidence only. Package metadata is `0.9.0-beta.1`; only the exact `v0.9.0-beta.1` ref is accepted by the candidate release-ref policy. No tag was created, npm/GitHub release was not published, and production n8n was not accessed or changed.

Node 24.22.1 is the contributor/build baseline. On Node 24.22.1 / npm 12.2.1, clean `npm ci`, lint, typecheck, build, all **75 tests**, `verify:package` (48 allowlisted package files; standalone registration passed), and `npm audit --omit=dev --audit-level=high` (**0 production vulnerabilities**) passed. Release-ref policy self-tests and exact beta.1 simulation passed; the self-test rejects beta.2. Workflow YAML parsed locally. The full install tree reported 23 audit findings (19 high, 4 moderate) and npm 12 reported blocked dependency lifecycle scripts; the production-only audit is clean.

The candidate tarball's production-only runtime matrix passed all six combinations: Node **20.19.0**, **22.23.4**, and **24.22.1**, each with `n8n-workflow` **2.44.0** and **2.44.2**. Checks installed the packed plugin without dev dependencies or lifecycle scripts and verified package registration, Trigger contract, and callback normalization. Node 20/22 installs reported `isolated-vm@7.0.1`'s `>=24.0.0` engine warning through `n8n-workflow`; Node 20's native build fails when install scripts run. The matrix skips those unrelated scripts and establishes only this plugin's loaded path, not the unrelated isolated-vm path or full n8n server. A CI run on the corrected candidate commit remains required. `git diff --check` passed on the local candidate diff.

## v0.8.0-beta.2 public prerelease — 2026-10-25

Connected-instance visual evidence from the beta.1 Automation Presentation exercise showed that the published Presentation v1 template used by those recipes is diagnostic-only and unsuitable as the canonical user-facing production surface. Adapter mapping/API transport success did not establish that visual suitability. Beta.2 corrects user-facing recipes to use the already production-accepted A2UI `universal-v1` rendering surface. Presentation v1 examples remain deterministic adapter/diagnostic contract fixtures. Every catalog Update replaces public card data (`updateByKey: false`) so switching between card families cannot retain stale fields. Summary/detail URLs are plain text because universal-v1 has no link action. No runtime/transport behavior, template-management feature, external ingestion, or Form/Selection claim was added. Only the existing request-button/action callback path is described as supported.

The annotated tag `v0.8.0-beta.2` (tag object `a6178069c8f304d27d8fc0e5f8d69cdb8874ee3d`) points to release commit `f698b734d286f1bac3b80efabe3408297c7bbf02`. Main CI [40176801321](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40176801321) and tag CI [40176880540](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40176880540) passed on that exact commit. The existing Trusted Publisher/OIDC [publish workflow](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40176938568), dispatched once on the release tag, passed npm ci, lint, typecheck, build, all 74 tests, package verification, production audit, release-ref validation, beta publication, public dist-tag verification, and published metadata/tarball verification. Stable publication was skipped.

Public npm dist-tags are `beta -> 0.8.0-beta.2` and `latest -> 0.7.0`; stable `0.8.0` is absent from the registry (query returned 404). Registry metadata reports `gitHead=f698b734d286f1bac3b80efabe3408297c7bbf02`, tarball `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.8.0-beta.2.tgz`, SHA-1 `749999e2086beb1d231b505e2a071b0f45860c7f`, and integrity `sha512-uhGZz/EeW6IF2UsYzH0tkApbcafQrAzjXEazUeEYqllvj/cH+xOUjzlZyShv5O5CfcvPpLer7iA50GMNr6gaIQ==`. Its SHA-512 hex digest is `ba1199cff11e5ba205d94b18cc7d2d900a5b71a7d0ac0ce35c46b351e118aa596f8ff707fb13948f3959c9286fe4ee427dcbcfa4b7abee2039d0630dafa81a21`.

An isolated install followed by `npm audit signatures` verified **94 registry signatures** and **6 attestations**; invalid and missing signatures were both zero. The beta.2 package's verified SLSA provenance subject matches the SHA-512 above and identifies `.github/workflows/publish.yml`, `refs/tags/v0.8.0-beta.2`, release commit `f698b734d286f1bac3b80efabe3408297c7bbf02`, and publish run `40176938568` attempt 1. Its SLSA transparency-log entry is [3455741080](https://search.sigstore.dev/?logIndex=3455741080); the npm publish signature entry is [3455759355](https://search.sigstore.dev/?logIndex=3455759355).

The [GitHub prerelease](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.8.0-beta.2) (release ID `423256076`) is published with `draft=false` and `prerelease=true`. Its canonical asset `n8n-nodes-dingtalk-card-0.8.0-beta.2.tgz` is 86,583 bytes and byte-identical to the public npm tarball. Both SHA-256 digests are `673f0cce1fde97457852f89a8e4c4176a3dc104e990f4ed08689b99f5fc549dd`.

## v0.8.0-beta.2 connected-instance acceptance — 2026-10-25

The maintainer reports that the production connected-instance visual gate workflow `060Rp2Vrynm6S5rw` execution **5766** succeeded with A2UI report Create & Deliver followed by same-card A2UI status Update on `outTrackId=51b34e84-296a-4dad-9caf-eba557f0cddb`, using replacement semantics `updateByKey=false`. Client visual evidence confirmed normal A2UI rendering and no stale report-only fields.

The request-action gate workflow `kOZB4ztPUyXjXeuT` manual execution **5788** delivered `outTrackId=049ff219-310d-44de-9440-f4546d2a6a9e`. Trigger execution **5791** succeeded with `normalized.interaction.params` exactly `{"gate":"automation-presentation","source":"v0.8.0-beta.2"}`; normalized correlation `messageId` and `topic` were present. Same-card Update succeeded, and client visual evidence confirmed the final success card. The interaction workflow was unpublished after acceptance.

These connected-instance acceptance facts were supplied by the maintainer for this release record and were not independently queried during release preparation. No production n8n configuration was changed by the repository release work.

## v0.8.0 stable release preparation — 2026-10-25

The connected-instance visual and request-action gates above complete the documented v0.8 acceptance scope. Stable promotion changes package version metadata, release-ref/publish policy, and release-status documentation only; no runtime source, dependencies, or beta behavior changes. The npm `beta` dist-tag remains on `0.8.0-beta.2` while stable `latest` moves to `0.8.0`.

## v0.8.0 stable public release — 2026-10-25

Annotated tag `v0.8.0` (tag object `bb778a8d08cbba9ab99173e838cc3c0cdb40589a`) points to stable release commit `bca5bfe79f61f5f98e6ddd068335780eea6e34bc`. Main CI [40179814639](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40179814639) and tag CI [40179896653](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40179896653) passed on that exact commit. Trusted Publisher/OIDC publish run [40179967735](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40179967735), attempt 1, passed its repeated clean install, lint, typecheck, build, all 74 tests, package verification, production audit, release-ref check, stable publication, dist-tag verification, and published metadata/tarball verification. Stable publication ran; beta publication and legacy latest synchronization were skipped.

Public npm dist-tags are `latest -> 0.8.0` and `beta -> 0.8.0-beta.2`. Registry metadata reports `gitHead=bca5bfe79f61f5f98e6ddd068335780eea6e34bc`, tarball `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.8.0.tgz`, SHA-1 `79924d786a7b42240267a41d32e8d73808de38ea`, and integrity `sha512-nw8rCxCzz++71ABr5xjGvDMc3YBqEMoAnCVv7ozdn9Xaxe4c5s/jGob+Vbi9vnR7buOphKgwcg64EvHGpMIIXw==`. Its SHA-512 hex digest is `9f0f2b0b10b3cfefbbd4006be718c6bc331cdd806a10ca009c256fee8cdd9fd5dac5ee1ce6cfe31a86fe55b8bdbe747b6ee3a984a830720eb812f1c6a4c2085f`.

An isolated install followed by `npm audit signatures` verified **94 registry signatures** and **6 attestations**; invalid and missing signatures were both zero. The stable package's verified SLSA provenance subject matches the SHA-512 above and identifies `.github/workflows/publish.yml`, `refs/tags/v0.8.0`, release commit `bca5bfe79f61f5f98e6ddd068335780eea6e34bc`, and publish run `40179967735` attempt 1. Its SLSA transparency-log entry is [3456733629](https://search.sigstore.dev/?logIndex=3456733629); the npm publish signature entry is [3456742988](https://search.sigstore.dev/?logIndex=3456742988).

The [GitHub stable release](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.8.0) (release ID `423283585`) is published with `draft=false` and `prerelease=false`. Its canonical asset `n8n-nodes-dingtalk-card-0.8.0.tgz` is 87,580 bytes and byte-identical to the public npm tarball. Both SHA-256 digests are `812574b3f669c2e54bef64991f8974e86298565567676a9f349e025aa7b21d7d`; GitHub reports the matching asset digest. The tested beta.2 workflows passed connected-instance visual and request-action acceptance before promotion. No runtime source changed and no production n8n configuration was changed by the release work.

Local gates on Node 26.12.1/npm 12.2.1 passed: clean `npm ci` (588 packages; the existing development tree reported 19 high and 4 moderate advisories, deprecations, and five blocked install scripts), lint, typecheck, build, all **74 tests**, package verification/standalone class registration (**46 allowlisted files**), `npm audit --omit=dev --audit-level=high` (**0 production vulnerabilities**), `0.8.0-beta.2` release-ref simulation and policy self-test, and `git diff --check`. Package verification parsed all JSON examples, validated universal-v1 descriptors with the built A2UI mapper, checked all catalog updates use replacement semantics, and verified intended example/docs package inclusion. No runtime source changed.

## v0.8.0-beta.1 public prerelease — 2026-10-25

The annotated tag `v0.8.0-beta.1` (tag object `87ffaf2aaeaad86ac69d73a38c02f0215a5e5f28`) points to release commit `5209238b3680a171be517fe07ad306aed4fd6646`. Main CI [40175733633](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40175733633) and tag CI [40175799515](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40175799515) passed on that exact commit. The manually dispatched [Trusted Publisher/OIDC publish workflow](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40175848493), dispatched on the release tag, passed npm ci, lint, typecheck, build, all 74 tests, package verification, production audit, release-ref validation, beta publication, dist-tag verification, and published metadata/tarball verification. Stable publishing was skipped.

Local gates on Node 26.12.1/npm 12.2.1 passed before release: clean `npm ci` (588 packages; existing development tree reported 19 high and 4 moderate advisories, deprecations, and five blocked install scripts), lint, typecheck, build, all 74 tests, package verification/standalone class registration (36 allowlisted files; 84,832 packed bytes), production-only audit (0 vulnerabilities), beta release-ref check and policy self-test, and `git diff --check`.

Public npm dist-tags are `beta -> 0.8.0-beta.1` and `latest -> 0.7.0`. Registry metadata reports `gitHead=5209238b3680a171be517fe07ad306aed4fd6646`, tarball `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.8.0-beta.1.tgz`, SHA-1 `7767f2fe147977d91f9c808547dbadc7140953a4`, and integrity `sha512-/sHIp0jLqBNgdTPqT4ymfpR2ZmrQ4tjRr+qWYKddM3JtQamyRBgFfV9nKbEQLML5NHgvfnZu3dU2dZU/UvxmgA==`. Its SHA-512 hex digest is `fec1c8a748cba813607533ea4f8ca67e9476666ad0e2d8d1afea9660a75d33726d41a9b24418057d5f6729b1102cc2f934782f7e766eddd53675953f52fc6680`. An isolated npm install verified 94 registry signatures and 6 attestations with `npm audit signatures`; invalid and missing signatures were both zero. The package's SLSA provenance subject matches the SHA-512 above and identifies `.github/workflows/publish.yml`, `refs/tags/v0.8.0-beta.1`, the release commit above, and publish run 40175848493 attempt 1. The SLSA transparency-log entry is [3455501748](https://search.sigstore.dev/?logIndex=3455501748); the npm publish signature entry is [3455512736](https://search.sigstore.dev/?logIndex=3455512736).

The [GitHub prerelease](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.8.0-beta.1) (release ID `RE_kwDOVU-7As4ZOjhj`) has `draft=false` and `prerelease=true`, with one canonical asset `n8n-nodes-dingtalk-card-0.8.0-beta.1.tgz` (asset ID `RA_kwDOVU-7As4oM8v-`). Its SHA-256 is `74eb7bca7d11b757eba4c81079c0df0fbc143e2706d01941dc2be22164417a79` and SHA-1 is `7767f2fe147977d91f9c808547dbadc7140953a4`; downloading the GitHub asset and comparing bytes against the public npm tarball passed. GitHub's asset digest matches the calculated SHA-256.

The public registry reports `latest -> 0.7.0`; querying `n8n-nodes-dingtalk-card@0.8.0` returned E404, and stable `v0.8.0` remains disabled by release policy. No production n8n instance was changed. This beta adds examples and workflow-layer pattern guidance only; it does not certify connected-instance behavior. For any later connected acceptance, install through n8n's supported Community Nodes lifecycle and test representative Create & Deliver/Update paths through a dedicated published template with binding evidence. A non-consequential request-button/action callback may be tested with Stream callbacks enabled; Form and Selection remain deferred.

## v0.7.0-beta.1 public prerelease — 2026-10-25

The annotated tag `v0.7.0-beta.1` (tag object `2b0fafa12e406b8cd829c4851ac81d8d9f87b287`) points to release commit `d598fc289c871d46f183692ae91eaee9ce4901f7`. Main CI [40173686130](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40173686130) passed on that exact commit. The repository’s manually dispatched [Trusted Publisher/OIDC publish workflow](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40173797932), dispatched on the release tag, reran npm ci, lint, typecheck, build, all 74 tests, package verification, production audit and release-ref validation before publication; all steps passed. The stable publish step was skipped. The tag push did not produce a separate CI workflow run; the same commit passed main CI and the tag-based publish run repeated the complete CI quality gates.

Public npm dist-tags are `beta -> 0.7.0-beta.1` and `latest -> 0.6.0`. Registry metadata reports `gitHead=d598fc289c871d46f183692ae91eaee9ce4901f7`, 34 files, unpacked size 257,412 bytes, tarball `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.7.0-beta.1.tgz`, SHA-1 `bfe29ec865425ae361c22348030848b85de3b371`, and integrity `sha512-rQFSeFGnwTC5b50nRBfKm3PcGxVQWBDVsCExImPBjiyaE6Pb1YRYwBT+N9d0PXlmqqlOJomw1XO2usjdeG67uQ==`. An isolated install verified 94 registry signatures and 6 attestations with `npm audit signatures`; no invalid or missing signatures were reported. The verified SLSA provenance subject SHA-512 is `ad01527851a7c130b96f9d274417ca9b73dc1b15505810d5b021312263c18e2c9a13a3dbd58458c014fe37d7743d7966aaa94e2689b0d573b6bac8dd786ebbb9`. Its predicate identifies `.github/workflows/publish.yml`, `refs/tags/v0.7.0-beta.1`, the release commit above, and publish run 40173797932 attempt 1. The transparency-log entry is [3454929240](https://search.sigstore.dev/?logIndex=3454929240).

The [GitHub prerelease](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.7.0-beta.1) (release ID `423226951`) has `draft=false` and `prerelease=true`. Its sole canonical asset `n8n-nodes-dingtalk-card-0.7.0-beta.1.tgz` is byte-identical to the public npm tarball: 77,300 bytes, SHA-256 `8a3c6d92a297e60001e5c829251dd2637396fa5b999909af092bf4d9039f827a`, SHA-1 `bfe29ec865425ae361c22348030848b85de3b371`, and npm integrity as above. GitHub reports the matching SHA-256 asset digest. Use the exact package spec `n8n-nodes-dingtalk-card@0.7.0-beta.1` for connected-instance validation. No production n8n instance was changed for this release.

## v0.7.0-beta.1 connected-instance acceptance — 2026-10-25

The maintainer reports that beta.1 was installed in production n8n. Manual Create & Deliver execution **5702** succeeded and returned `correlation.outTrackId`. The workflow was deactivated and reactivated successfully on the same active package version. After reactivation, real Trigger callback execution **5703** succeeded with `normalized.interaction.params = {"gate":"event-reliability","source":"v0.7.0-beta.1"}` and `normalized.correlation = {"messageId":"be36c1a_1572_1a125150ef8_ee37cc","topic":"/v1.0/card/instances/callback"}`. The original card update succeeded with `correlation.outTrackId = "6d7b686c-848b-440c-84b9-87cb121ad97b"`; the temporary listener was then unpublished.

The execution 5702/5703 data, workflow deactivation/reactivation state, normalized params/correlation, and update result were independently queried by the parent ChatGPT through the production n8n MCP on n8n-VPS. The screenshot was user-supplied client-side corroboration. This verifies Create & Deliver, Trigger deactivation/reactivation, a real callback after reactivation, normalized correlation, and the original card update on the connected instance. Exact-message duplicate suppression is covered by deterministic unit tests; live duplicate redelivery was not forced.

## v0.7.0 stable release preparation — 2026-10-25

Stable promotion changes package version metadata, release workflow/ref policy, and release-status documentation only. No runtime source, dependencies, or beta behavior changed. Package and lockfile versions are promoted together from `0.7.0-beta.1` to `0.7.0`; beta remains `0.7.0-beta.1` after stable publication. The connected-instance acceptance above completes the v0.7 stable gate for the tested path; duplicate redelivery remains covered only by deterministic tests.

## v0.7.0 stable public release — 2026-10-25

Annotated tag `v0.7.0` (tag object `ccff6e97a228c0cb4d44d8cd9a02701d2da7d6c3`) points to stable release commit `42d4786c251a2c5d50ac6def05c6aee7f61c2592`. Main CI [40174692180](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40174692180) and tag CI [40174759857](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40174759857) passed. Trusted Publisher/OIDC publish run [40174812014](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40174812014), attempt 1, passed the repeated stable release gates, tag/package check, stable publication, npm dist-tag verification, and published metadata/tarball verification.

Public npm dist-tags are `latest -> 0.7.0` and `beta -> 0.7.0-beta.1`. Registry metadata reports `gitHead=42d4786c251a2c5d50ac6def05c6aee7f61c2592`, 34 files, unpacked size 262,729 bytes, tarball `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.7.0.tgz`, SHA-1 `f873857e7d9d4f84cc1a5aab012fdd05352b4c7a`, and integrity `sha512-AIAJiCCYI3aFO4OZgL5sp855QdClCE0Gy2yQp5AqORWjNBczyaR1AhYmjWDZl8pjLKcFBkfoPxRUPTiNqsHbIA==`. An isolated install verified 94 registry signatures and 6 attestations with `npm audit signatures`; no invalid or missing signatures were reported. The verified SLSA provenance subject SHA-512 is `0080098820982376853b839980be6ca7ce7941d0a5084d06cb6c90a7902a3915a3341733c9a4750216268d60d997ca632ca7050647e83f14543d388daac1db20`. Its predicate identifies `.github/workflows/publish.yml`, `refs/tags/v0.7.0`, the release commit above, and publish run 40174812014 attempt 1. The transparency-log entry is [3455337440](https://search.sigstore.dev/?logIndex=3455337440).

The [GitHub stable release](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.7.0) (release ID `423235874`) has `draft=false` and `prerelease=false`. Its sole canonical asset `n8n-nodes-dingtalk-card-0.7.0.tgz` is byte-identical to the public npm tarball: 78,754 bytes, SHA-256 `3ccb0da596aecdd43af3a1fedef045666d1fe73ffb2c45c38dc63aeddb70d032`, SHA-1 `f873857e7d9d4f84cc1a5aab012fdd05352b4c7a`, and npm integrity as above. GitHub reports the matching SHA-256 asset digest. Connected-instance acceptance was independently queried through the production n8n MCP on n8n-VPS; the screenshot was user-supplied client-side corroboration. Exact-message duplicate redelivery was not forced live. No runtime files changed in stable promotion.

## v0.6.0-beta.3 candidate: serialized A2UI action params normalization — 2026-10-25

The production callback received on beta.2 exposed descriptor params as `cardPrivateData.params = {"params":"{\"source\":\"v0.6-beta.2\"}"}`, so workflows had to parse the nested string. Beta.3 changes only `normalized.interaction.params` for this exact one-key wrapper when its value parses as a JSON object. Local tests cover the observed shape, malformed JSON, JSON non-objects, additional wrapper keys, ordinary params, and preservation of top-level params and raw callback data. The change passed lint, typecheck, build, all 71 unit tests, packed-package standalone loading/registration (34 allowlisted files), and `git diff --check` at package version `0.6.0-beta.2`. No production n8n was changed. Live confirmation of the normalized result remains part of release validation.

## v0.6.0-beta.3 public prerelease — 2026-10-25

The annotated tag `v0.6.0-beta.3` (tag object `233ecc21a2e8eff6a3e2c803d59dc32b19944c3b`) points to release commit `5c765271cd01d4de9e528fe8d72b5fc2a7d61dc8`. Main CI [40170199011](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40170199011) and tag CI [40170254036](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40170254036) passed. Trusted Publisher/OIDC publish run [40170324794](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40170324794), attempt 1, passed all repeated quality gates, tag/package version check, beta publication, dist-tag convergence, and published metadata/tarball verification.

Public npm dist-tags are `beta -> 0.6.0-beta.3` and `latest -> 0.5.0`. Registry metadata reports `gitHead=5c765271cd01d4de9e528fe8d72b5fc2a7d61dc8`, 34 files, unpacked size 244,342 bytes, tarball SHA-1 `fe2dcdfa3a16b14479f52b1e9a66d7ab9a6998ae`, and integrity `sha512-FaO542B24k17Bzpqea18Ky5RMUIP/a1rQ8ENzGWEgZhboCE/WfJ9OFiKXvz+OxRoqHTE/LaHgBGDLKvFkogKGQ==`. `npm audit signatures` in an isolated install verified 94 registry signatures and 6 attestations. The SLSA provenance subject SHA-512 is `15a3b9e36076e24d7b073a6a79ad7c2b2e5131420ffdad6b43c10dcc658481985ba0213f59f27d38588a5efcfe3b1468a874c4fcb6878011832cabc592880a19`; its verified predicate identifies `.github/workflows/publish.yml`, `refs/tags/v0.6.0-beta.3`, the release commit above, and publish run 40170324794 attempt 1. Its transparency-log entry is [3453587790](https://search.sigstore.dev/?logIndex=3453587790).

The [GitHub prerelease](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.6.0-beta.3) is published with `draft=false` and `prerelease=true`. Its canonical asset `n8n-nodes-dingtalk-card-0.6.0-beta.3.tgz` is byte-identical to the public npm tarball: 73,532 bytes, SHA-256 `c99b624fb375d7478da99a2187cfde8ea6cffe3e04c316c68aa73f62556cc418`, SHA-1 `fe2dcdfa3a16b14479f52b1e9a66d7ab9a6998ae`, and npm SHA-512 integrity as above. The package fixes the serialized A2UI params wrapper observed in the beta.2 production callback. The publication-time note that live confirmation was pending is superseded by the connected-instance acceptance recorded below. No production n8n instance was changed for this release.

## v0.6.0-beta.3 connected-instance acceptance — 2026-10-25

The maintainer reports that live acceptance passed on production n8n with the installed beta.3 package. Workflow `DingTalk Card Interaction E2E` delivery execution **5640** succeeded and returned outTrackId `228c046a-6239-4613-9234-9f01fc2989f9`; callback execution **5641** succeeded. The raw DingTalk callback retained `cardPrivateData.params = {"params":"{\"source\":\"v0.6-beta.3\"}"}`, while the plugin exposed the normalized contract as `normalized.interaction.params = {"source":"v0.6-beta.3"}`. The original card A2UI Update succeeded. The temporary Stream listener was unpublished after acceptance.

This closes the beta.3 connected-instance gate for the tested action callback and A2UI Update path. It does not certify other templates, interaction types, reconnect or failure modes, or exactly-once delivery. These live details were supplied by the maintainer for this release record and were not independently queried from production. Production n8n was not modified as part of repository release preparation.

## v0.6.0 stable release preparation — 2026-10-25

Stable promotion preserves the beta.3 production-accepted runtime. Release-only changes update package version metadata and stable-status documentation, and extend the existing Trusted Publisher workflow and release-ref policy to stable `v0.6.0`; no node runtime files, dependencies, or A2UI behavior changed.

On Node **26.12.1 / npm 12.2.1**, the release gates passed: clean `npm ci`; lint; typecheck; build; all **71 tests**; package verification with standalone packed class loading/registration (**34 allowlisted files**, 74,569 bytes); production audit (**0 vulnerabilities**); release-ref self-test and `0.6.0 -> latest` check; `npm pack --dry-run` inspection (**28 package entries**); and `git diff --check`. The first parallel test attempt raced the concurrent build and failed while `dist` was being rewritten; the complete test suite passed after the build completed. GitHub CI for the pushed release commit is required before tagging. The existing publish workflow repeats all gates and publishes the stable tag through npm Trusted Publisher/OIDC with provenance.

## v0.6.0 stable public release — 2026-10-25

Annotated tag `v0.6.0` (tag object `7c860a9997bbb895b96489402c5d906083ff2825`) points to release commit `de2c79496e0e2a699b312448eff0c4de9cca8ed6`. Main CI run [40171338211](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40171338211) and tag CI run [40171408700](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40171408700) passed. The existing Trusted Publisher/OIDC publish workflow run [40171484374](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40171484374), attempt 1, passed the repeated quality gates, tag/package check, stable npm publication, dist-tag verification and published metadata/tarball verification.

Public npm dist-tags are `latest -> 0.6.0` and `beta -> 0.6.0-beta.3`. Registry metadata reports `gitHead=de2c79496e0e2a699b312448eff0c4de9cca8ed6`, 34 files, unpacked size 248,072 bytes, tarball SHA-1 `26dff4c3d9f6bce9718780c0fd9116bce81c7212`, and integrity `sha512-5ik4E4QdCVHnBp2DcSJgxHLPLqs7EZxY07QadtIIYVKJAc/90MBGHLaRFZWkQ468N4yFYj9fxQNH3GeUpLy3hw==`. An isolated install of this exact package passed `npm audit signatures` with no invalid or missing signatures/attestations; the command verified 94 registry signatures and 6 attestations across the install. The package SLSA provenance subject SHA-512 is `e6293813841d0951e7069d83712260c472cf2eab3b119c58d3b41a76d20861528901cffdd0c0461cb6911595a4438ebc378c85623f5fc50347dc6794a4bcb787`. Its verified predicate identifies `.github/workflows/publish.yml`, `refs/tags/v0.6.0`, release commit `de2c79496e0e2a699b312448eff0c4de9cca8ed6`, and publish run 40171484374 attempt 1; the transparency log entry is `3453987183`.

The [GitHub stable release](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.6.0) (release ID `423205382`) is published with `draft=false` and `prerelease=false`. Its only asset, `n8n-nodes-dingtalk-card-0.6.0.tgz`, is byte-identical to the public npm tarball: 74,770 bytes, SHA-256 `6d20e4f788db3c4762f80852e52f9fbaa820c1f1e6173d43b72db4563d176a11`, and SHA-1 `26dff4c3d9f6bce9718780c0fd9116bce81c7212`; GitHub reports the matching SHA-256 digest.

The connected-instance acceptance evidence and its scope are recorded above. This release did not modify production n8n or change the validated A2UI runtime behavior.

## v0.5.0-beta.1 local verification scope (historical, before production acceptance)

This candidate adds normalized callback fields beside the existing output contract. Local verification exercises the existing request-button/action callback path, normalization precedence, optional fields, timestamps, raw-data control, privacy-safe diagnostics, and ACK-before-emit ordering. Form and selection interactions have not been live-verified and remain deferred. No production n8n was touched for this candidate. Stable release still requires scoped live acceptance before expanding interaction claims.

## v0.5.0-beta.1 public prerelease — 2026-10-25 (historical, before production acceptance)

- Annotated tag [`v0.5.0-beta.1`](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.5.0-beta.1) points to release commit `f95b20b25a2e51956034a6b739cd51f130c841ba`. Tag CI run [40162534352](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40162534352) passed; Trusted Publisher/OIDC publish run [40162610880](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40162610880) passed all release gates and public registry checks.
- npm public dist-tags are `beta -> 0.5.0-beta.1` and `latest -> 0.4.0`. Published package metadata reports `gitHead` `f95b20b25a2e51956034a6b739cd51f130c841ba`, 30 files, and unpacked size 204,191 bytes. `npm audit signatures` verified registry signatures for all 94 packages in an isolated install and attestations for 6 packages.
- The public SLSA provenance subject is `n8n-nodes-dingtalk-card@0.5.0-beta.1` with SHA-512 `2009bcb75cd0ec3e97885d82b3853fe711d16cf015d1fdbc3da1c5ad1cf6be232cddce6a0e16b4a9605961a54ad4df3220c0c38d7f109aa40c9c46e3b44f419f`. Provenance identifies `refs/tags/v0.5.0-beta.1`, the same release commit, `.github/workflows/publish.yml`, and publish run 40162610880 attempt 1.
- The [GitHub prerelease](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.5.0-beta.1) is published with one canonical npm tarball asset. `n8n-nodes-dingtalk-card-0.5.0-beta.1.tgz` is 61,780 bytes and byte-identical to the public npm tarball; both have SHA-256 `0cd7b3f39f8ab071dbc88b1b4597797dfa07170e5d926f64ea9433719ec922a6`. SHA-1 is `7a199aabed820cae64e57863bbb80e5f2b97aefa`; npm integrity is `sha512-IAm8t1zQ7D6XiF2Cs4U/5xHRbPAV0f28PaHFrRz2viMs3c5qDha0qWBZYaVK1N8yIMDDjX8QmqQMnEbjtE9Bnw==`.
- This is an additive normalized callback v1: existing top-level output fields remain; `rawData` defaults to true and can be omitted with the optional control; immediate ACK and asynchronous downstream handling are unchanged. At publication, only the request-button/action callback path had been live-verified; Form and Selection remained unverified and deferred, and production beta acceptance was pending. No production n8n was changed during release. The pending status is superseded by the production acceptance below.

## v0.5.0-beta.1 production acceptance — 2026-10-25

Production n8n loaded the v0.5 Trigger schema, including optional `includeRawData` with default `true`. For the scoped live check, the existing legacy Interaction E2E workflow had Trigger parameters `{}` and was published temporarily. A new request-button card was delivered successfully. One real button click in Mac DingTalk produced a successful Trigger execution and downstream card update.

The callback output had `normalized.schemaVersion="1"` and `interaction.type="actionCallback"`; `actionIds`, `params`, and `value` were present and correct. Actor `userId` and `userIdType` were populated only from source facts. Card `outTrackId`, conversation `spaceId` and `spaceType`, and correlation `messageId` and `topic` were present. `eventTime` was correctly converted from the Stream header `time` millisecond epoch. Legacy top-level `params`, `outTrackId`, and `rawData` remained present. Existing downstream expressions using `messageId`, `params`, and `outTrackId` continued to work and updated the card. The temporary listener was unpublished immediately after verification.

This completes beta.1 production acceptance for the request-button/action-callback path and makes beta.1 eligible for stable promotion. Form and Selection interactions remain unverified and deferred; no live claim is made for them. This acceptance does not expand other template, reconnect, or failure-mode claims. No private IDs or secrets are recorded.

## v0.5.0 stable release — 2026-10-25

Stable promotion preserves the production-accepted v0.5.0-beta.1 runtime without adding features. Only package/release metadata and public status wording changed; request-button/action-callback remains the only live production-accepted v0.5 interaction. Form and Selection remain unverified and deferred.

- Release commit `ae52609220d4c58274eadcf41aea45787591edb7` is tagged by annotated tag object `aa94dfa46b1ef44305af8aece8c278e19d13869f` (`v0.5.0`). Main CI run [40163783528](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40163783528) and tag CI run [40163864035](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40163864035) passed the complete Node 24 gate set. Trusted Publisher/OIDC publish workflow run [40163904356](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40163904356), dispatched once against `v0.5.0`, passed all release gates and registry checks. Local verification also passed clean `npm ci`, lint, typecheck, build, all 62 tests, package verification/standalone registration, production audit (0 vulnerabilities), release-ref policy self-test and `v0.5.0`/`v0.5.0-beta.1` simulations, `npm pack` inspection, and `git diff --check`.
- Public npm dist-tags are `latest -> 0.5.0` and `beta -> 0.5.0-beta.1`. Package metadata reports `gitHead` `ae52609220d4c58274eadcf41aea45787591edb7`, tarball `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.5.0.tgz`, 30 files, and unpacked size 209,531 bytes. `npm audit signatures` verified the exact published package signature and provenance with no invalid or missing signatures/attestations.
- The SLSA provenance subject is `n8n-nodes-dingtalk-card@0.5.0` with SHA-512 `562e6b318a778bf1347f1c03ab57bdda1027f685102043448cca59c7811b8c6501f96ec355f1de30bcb70bace51042bcce71f24721083f944385327b7217f4c1`. Its verified provenance identifies `refs/tags/v0.5.0`, release commit `ae52609220d4c58274eadcf41aea45787591edb7`, `.github/workflows/publish.yml`, and publish run 40163904356 attempt 1.
- The non-prerelease [GitHub Release v0.5.0](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.5.0) (release ID `423158849`) is published with exactly one asset, `n8n-nodes-dingtalk-card-0.5.0.tgz`. It is byte-identical to the public npm tarball: 63,335 bytes, 30 files, SHA-256 `8d1c8436400dcf8c36ba4829903fee8caf79698d8def95d49dd0686ce9d2e020`, SHA-1 `5d26fc47637e0b129b099d8e31e2ac8865e5891b`, npm integrity `sha512-Vi5rMYp3i/E0fxwDq1e92hAn9oUQIENEjMpZx4EbjGUB+W7DVfHeMLy3C6zlEEK8znHyRyEIP5RDhTJ7chf0wQ==`. GitHub reports `draft=false`, `prerelease=false`, and the matching SHA-256 asset digest.

No production n8n installation was changed during stable release preparation or publication. No private identifiers or secrets are recorded.

## v0.5.0 stable production post-install acceptance — 2026-10-25

After stable publication, production n8n was upgraded through the supported Community Nodes lifecycle. The host package metadata confirmed `n8n-nodes-dingtalk-card` version **0.5.0**. The live node schema exposed Presentation mode and the Trigger `includeRawData` option with default `true`.

A temporary two-node Manual Trigger → DingTalk Card workflow ran a true Presentation-mode status Create & Deliver smoke on stable 0.5.0. The n8n execution succeeded; the DingTalk response reported top-level `success=true` and `deliverResults[].success=true`. The temporary workflow was archived after the smoke. Production n8n and external runners were both **2.44.6**; `n8n_service` and `n8n_db` were healthy, runners were running, and `/healthz` and `/healthz/readiness` both returned HTTP 200.

This is post-install smoke acceptance only. It does not repeat the beta.1 real-user-button Interaction E2E or expand the previously verified scope for Form or Selection interactions. No private template, group, card, workflow, execution, credential, outTrack, or other private identifiers are recorded.

## v0.4.0-beta.2 production regression acceptance — 2026-10-25

Production n8n was upgraded to `n8n-nodes-dingtalk-card@0.4.0-beta.2` through the supported Community Nodes lifecycle. A true Presentation-mode status card rendered correctly in Mac DingTalk with no workflow-supplied `flowStatus` and no JSON request body. This demonstrates that beta.2 automatically supplies the AI-card completed-state host metadata. The earlier visual probe using the final AI-card template showed all 13 Presentation fields, including `summary`, through one BaseText path.

The final beta.2 live Create & Deliver regression passed for all five Presentation families: alert, status, digest, action, and report. Every n8n execution succeeded; each DingTalk response had top-level `success=true` and `deliverResults[].success=true`. Temporary test workflows were archived. No private template, group, card, workflow, execution, credential, or other private identifiers are recorded.

Beta.2 production acceptance is complete and forms the exact functional baseline for stable v0.4.0. The earlier beta.1 acceptance sections below are preserved as historical records; beta.2 acceptance above records the completed regression.

## v0.4.0 stable release

Stable promotion changes package and release metadata only. The Presentation implementation is unchanged from the production-accepted v0.4.0-beta.2 baseline.

- Release commit `019b52ddb89611b32bb0c73b6390b20eeede5c37`; annotated tag `v0.4.0` points to that commit. Main CI run [40161106076](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40161106076) and tag CI run [40161166710](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40161166710) passed the complete Node 24 gate set. The Trusted Publisher/OIDC publish run [40161166763](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40161166763) also passed install, lint, typecheck, build, 60 tests, package verification, production audit, release-ref policy, npm dist-tag and public package verification.
- Public npm dist-tags are `latest -> 0.4.0` and `beta -> 0.4.0-beta.2`. Public metadata reports version `0.4.0`, `gitHead` `019b52ddb89611b32bb0c73b6390b20eeede5c37`, tarball `https://registry.npmjs.org/n8n-nodes-dingtalk-card/-/n8n-nodes-dingtalk-card-0.4.0.tgz`, and 27 files. `npm audit signatures` verified the published package signature and provenance; the package had no invalid or missing signature results.
- The public SLSA provenance identifies `refs/tags/v0.4.0`, release commit `019b52ddb89611b32bb0c73b6390b20eeede5c37`, `.github/workflows/publish.yml`, and publish run `40161166763` attempt 1.
- The non-prerelease [GitHub Release v0.4.0](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.4.0) is published and contains exactly one asset, `n8n-nodes-dingtalk-card-0.4.0.tgz`. Its 58,405 bytes match the public npm tarball; GitHub's asset digest matches the locally computed SHA-256.
- Canonical tarball SHA-256: `11dfb9f75af58766196c7f2dbaea043267e2cc346cd46f15e961124e0cb6eb87`; SHA-1: `bdb23cf0e05fe77cc02099fa1e9b8800e7aaf888`; npm integrity: `sha512-3L4Pg2HabTP+FeSPJWjfMiv6SZ6yPdUZxitJMopIHomweS0/Lchx+JoOoGqgXEwrdTGYz+oQl28iLqmIff9vhQ==`.

The local clean install, lint, typecheck, build, 60 tests, package verification, production audit (0 findings), release-ref self-test and `git diff --check` all passed. No production n8n installation was changed during this release task.

## v0.4.0 stable production post-install acceptance — 2026-10-25

After the stable release, production n8n reported the installed `n8n-nodes-dingtalk-card` package metadata as exactly **0.4.0**. Production n8n and its external runners were healthy on **2.44.6**; `/healthz` and `/healthz/readiness` both returned HTTP 200. The live node schema continued to expose `cardDataMode=presentation` and `presentationDescriptor`.

A temporary true Presentation-mode status Create & Deliver smoke workflow succeeded without workflow-supplied `flowStatus`. The n8n execution succeeded, and the DingTalk response had top-level `success=true` and `deliverResults[].success=true`. The temporary workflow was archived. This closes the stable production install and status Create & Deliver smoke acceptance; it does not extend the documented template or client-rendering claims. No private template, group, card, workflow, execution, credential, or other private identifiers are recorded.

## v0.4.0-beta.2 real Mac DingTalk visual acceptance — 2026-10-25

Real Mac DingTalk visual acceptance passed with the user's published AI-card template when `flowStatus=3` was supplied. All 13 Presentation contract fields and the summary rendered. The Presentation adapter supplies the fixed public `flowStatus: "3"` compatibility field while retaining the 13 contract variables. No private template IDs or group/card identifiers are recorded.

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

## v0.4.0-beta.1 live Presentation template-contract probe — 2026-10-25

This probe records the earlier state and is superseded by the final acceptance record below.

A user-published dedicated DingTalk test template was exercised with real Create & Deliver for all five Presentation families: `alert`, `status`, `digest`, `action`, and `report`. Each descriptor populated all common fields and every family-specific optional and required field. All five API Create & Deliver calls succeeded.

A negative-control Create & Deliver using Card Data JSON with one deliberately unknown `cardParamMap` key also succeeded. This demonstrates that DingTalk API success does **not** prove a template defines or binds the supplied variables. Transport acceptance and template-variable binding/rendering acceptance are separate checks.

Full visual/template-contract acceptance remains pending rendered-card evidence or template-definition/export evidence. No real template, group, card, workflow, execution, credential, or `outTrackId` identifiers are recorded.

## v0.4.0-beta.1 final Presentation template-contract acceptance — 2026-10-25

The Presentation mapper includes the fixed public AI-host compatibility value `flowStatus: "3"` in addition to the 13 Presentation contract variables. The current AI Card builder template configuration (`type=im`, `schemaVersion=3.0.0`, `extendType=AI`) needs completed-state `flowStatus` for `AICardContainer` to select its completed content branch. The descriptor schema and 13-variable contract remain unchanged. This host compatibility behavior is covered by local unit tests; it does not constitute visual acceptance of the user's template or client rendering.

The dedicated test template was rebuilt from the user-exported DingTalk JSON as a compact `NORMAL` template with three logical components: one Grid and two BaseText components. Its 13/13 v0.4 contract variables are defined as public strings and statically bound in both `editorData` and `widgetInfo`. The user imported and published this template.

Final live connected-instance acceptance sent all five Presentation families (`alert`, `status`, `digest`, `action`, and `report`) through the published template. Required and optional fields were populated for each family. All five n8n executions succeeded; every DingTalk response had top-level `success=true` and `deliverResults[].success=true`.

Under the documented template acceptance rule, template-definition/export evidence together with live transport through the published template is sufficient to mark the Presentation template contract **PASS**. Client pixel-perfect visual inspection was not independently performed and is not claimed. This closes v0.4.0-beta.1 acceptance; the release is ready for stable promotion. No stable release was published or relabeled as part of this acceptance. No real template, group, card, workflow, execution, credential, or `outTrackId` identifiers are recorded.

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
# v0.6.0-beta.1 candidate verification

This is an unpublished code candidate. Completed gates after a clean `npm ci`: lint, typecheck, build, `npm test` (70 passed, 0 failed), package verification with standalone registration (34 allowlisted files), production audit (`npm audit --omit=dev --audit-level=high`, 0 vulnerabilities), release-ref self-test and `v0.6.0-beta.1` simulation, `npm pack --dry-run` inspection, and `git diff --check`. No production n8n instance or DingTalk template was changed. The official `open-dingtalk/dingtalk-card-examples` repository contains `examples/循环渲染容器之交互组件的使用与服务端更新/循环渲染容器之交互组件的使用与服务端更新.json`; its current export has editor schemaVersion `3.0.0`, `extension.extendType: NORMAL`, a root Card, and Loop/BaseText/SingleButton request-action/event-chain patterns. This proves a current NORMAL v3 source exists and informs the profile. No transformed `universal-v1` import asset is shipped until the transformation has passed live import, client rendering, and callback acceptance. Those remain production beta gates.

## v0.6 universal-v1 candidate investigation — 2026-10-25

Current official `open-dingtalk/dingtalk-card-examples` sources were inspected: the NORMAL schemaVersion 3.0.0 loop/SingleButton example, event-chain example, and dynamic-visibility example. They evidence global string bindings, request button action ID/text/parameter references, and conditional visibility. They do not document how to regenerate the wrapper's separate `widgetInfo` render tree after changing `editorData`; an editor-only transformation would leave the export internally inconsistent. No candidate export was retained for that reason. Tone styling and arbitrary dynamic parameter expansion are also unsupported by the inspected evidence.

External production connected-instance evidence supplied for this record: the live node schema exposes `cardDataMode=a2ui` and `a2uiDescriptor`; a no-action A2UI Create + Update + legacy Stream + Finalize + JSON chain passed. An action attempt with callbacks disabled failed validation and returned `May have succeeded=false`. The workflow was restored to the no-action A2UI transport configuration. No private workflow, credential, group, template, or outTrack identifiers are recorded here.

No package version or npm release was changed, and production n8n was not changed by this repository task. Live template import, client rendering, and action callback acceptance remain open gates.

## v0.6.0-beta.2 release preparation — 2026-10-25

Production evidence supplied for this fix established the cause of the blank Mac DingTalk card: the published `universal-v1` template renders only when its `cardParamMap` includes `flowStatus: "3"`. This is the same AI Card host completed-state compatibility behavior already applied to Presentation. A2UI now injects that fixed host metadata for Create & Deliver and Update. It is not a `universal-v1` descriptor field or descriptor variable, and the descriptor contract remains unchanged. Action-enabled Create continues to fail closed unless Stream callbacks are explicitly enabled.

Release target is `0.6.0-beta.2`; npm `latest` remains stable at `0.5.0`, while beta publication semantics remain prerelease-only. On Node **26.12.1** / npm **12.2.1**, the local release gates passed: clean `npm ci`; lint; typecheck; build; all **70 tests**; package verification with standalone packed class loading/registration (**34 allowlisted files**); production audit (**0 vulnerabilities**); `npm pack --dry-run` inspection (**34 files**, `0.6.0-beta.2`); release-ref policy self-test and beta.2 simulation; and `git diff --check`. The clean install reported 23 existing dependency advisories (**19 high, 4 moderate**), deprecations, and blocked optional install scripts. This change does not publish npm or GitHub releases, tag a commit, or modify production n8n. Remote CI remains required before any release tag or publication.

## v0.6.0-beta.2 public prerelease — 2026-10-25

The annotated tag `v0.6.0-beta.2` (tag object `def6bb14db60a55ddeb1f6528e768d0285c90207`) points exactly to release commit `6649e7278db568b73c5099c975ab0fad8c7b8836`. The worktree was clean and `origin/main` matched this commit before tagging. Main CI run [40168918705](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40168918705) and tag CI run [40168987609](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40168987609) passed. Trusted Publisher/OIDC workflow run [40169052855](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40169052855), attempt 1, passed all repeated quality gates, the tag/package release-ref check, beta publication, public registry dist-tag verification, and public package metadata/tarball verification.

Public npm dist-tags are `beta -> 0.6.0-beta.2` and `latest -> 0.5.0`. Registry metadata reports `gitHead=6649e7278db568b73c5099c975ab0fad8c7b8836`, 34 files, and unpacked size 238,970 bytes. `npm audit signatures` in an isolated install of this exact package reported no invalid signatures or missing signatures/attestations. The published package carries SLSA provenance with subject SHA-512 `68ebe373a61a88f99cec507dae8eef3a007a26e003635955a5e6ef97c911916445c2fd62897e701744bff2e9ac96a6661f37927f8a52e7dd4960445115bd08b4`; its verified predicate identifies `.github/workflows/publish.yml`, `refs/tags/v0.6.0-beta.2`, release commit `6649e7278db568b73c5099c975ab0fad8c7b8836`, and publish run 40169052855 attempt 1.

The [GitHub prerelease](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.6.0-beta.2) (release ID `423188778`) is published with `draft=false` and `prerelease=true`. Its canonical asset `n8n-nodes-dingtalk-card-0.6.0-beta.2.tgz` is 71,955 bytes and byte-identical to the public npm tarball. Both SHA-256 digests are `e20a93f5782adf851e030aae27e2de33321b886edafd5422d5d83541d80f04f0`; SHA-1 is `932ed48ed376b3b4170179a7225f9179c05c4af9`; npm integrity is `sha512-aOvjc6YaiPmc7FB9ro7vOgB6JuADY1lVpebvl8kRkWRFwv1iiX5wF0S/8umslqZmHzeSf4pS591JYERRFb0ItA==`. The release notes preserve the remaining live template import, client rendering, Create/Update, and action callback acceptance gates. No production n8n instance was changed for this release.

## v0.6.0-beta.1 public prerelease — 2026-10-25

The annotated tag `v0.6.0-beta.1` (tag object `b81a4279eefd344125646a8e140dfb1d425071e0`) points to release commit `8b344592387c9e680deec78e9a5a60271af81ff2`. Main CI passed as run [40166046717](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40166046717), and tag CI passed as run [40166106727](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40166106727). The existing Trusted Publisher/OIDC publish workflow ran once and passed as run [40166179012](https://github.com/NTLx/n8n-nodes-dingtalk-card/actions/runs/40166179012).

Public npm dist-tags are `beta -> 0.6.0-beta.1` and `latest -> 0.5.0`. Registry metadata reports `gitHead=8b344592387c9e680deec78e9a5a60271af81ff2`. `npm audit signatures` verified the registry signature and SLSA provenance for this package. The provenance identifies `.github/workflows/publish.yml`, ref `refs/tags/v0.6.0-beta.1`, and the release commit above. `npm audit --omit=dev --audit-level=high` found 0 vulnerabilities.

The [GitHub prerelease](https://github.com/NTLx/n8n-nodes-dingtalk-card/releases/tag/v0.6.0-beta.1) is published with `draft=false` and `prerelease=true`. Its only asset, `n8n-nodes-dingtalk-card-0.6.0-beta.1.tgz`, was downloaded from the public npm registry and verified byte-identical to the npm tarball: 69,986 bytes, 34 files, SHA-256 `00bfde616fb3cfccdb0de12adcee9e55858a9bb09b22b1171d87272b62c72605`, SHA-1 `02c18b3ad02461b28b4e9c687fb59d3a0adc9c19`, and npm SHA-512 integrity `sha512-hPEIfESbEweehI+UwC8cQ69m81RJK67dVrtHqbFDhbVpp8ZcMTovgsL2ct/2ZxK53YOib8h1VdCXGXX12S1OoQ==`.

The official NORMAL schemaVersion 3.0.0 loop example is reference evidence only; it is not an accepted `universal-v1` template asset. No transformed `universal-v1` template import asset is shipped. Live template import, client rendering, Create, Update, and an action click through the callback path remain pending production beta acceptance. Production n8n was not touched for this release.
# v0.7 Event Handling & Reliability candidate

Local candidate scope: process-local duplicate callback suppression by `messageId` (10-minute TTL, 10,000-entry FIFO bound), existing native WebSocket reconnect lifecycle, 30-second bounded DingTalk HTTP requests, conservative write retry classification, and additive operation/error correlation metadata. Duplicates are acknowledged and ignored while their ID remains cached. This does not provide durable exactly-once delivery across process restart, cache eviction, multiple workers/instances, or independent package copies. Acknowledged events can still be lost after downstream failure.

Automatic write replay remains limited to one retry after DingTalk explicitly rejects the access token; the same payload and identifiers are retained. A timeout, network failure, HTTP 5xx, partial delivery or incomplete write response is not automatically retried and may have an ambiguous outcome. For Create & Deliver, verify before replay because the card may already exist; stable `outTrackId` is correlation, not a dedupe/upsert guarantee. Stream connection diagnostics remain generic and credential-safe.

Connected-instance stable gates still required: validate callback duplicate delivery/ACK behavior against a live DingTalk Stream; exercise disconnect/reconnect and Trigger deactivation on the supported n8n runtime; confirm workflow execution data retains the additive correlation/error shape and legacy top-level fields. No production instance was modified for this candidate.

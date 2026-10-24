# Beta verification record — 2026-10-24

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

## Limits and next acceptance

No DingTalk secrets, live enterprise account, card template, destination or n8n instance was provided or used. Mocked execution and tarball class loading do not establish real HTTP behavior, rendering, quotas, host UI loading or full current-stable n8n runtime compatibility. The exported workflow's graph, parameters and expression payload are checked locally, not executed on a live n8n instance.

The original **0.1.0-beta.1** baseline was a GitHub prerelease only. The current prerelease is `0.1.0-beta.2`; real DingTalk E2E and full current-stable n8n runtime compatibility remain unverified. No stable `v0.1.0` release has been made.

Before v0.2.0, implement and verify inbound interaction/callback authentication, acknowledgment timing, button/form mapping and duplicate delivery handling using current official mechanisms. Before v1.0.0, verify real enterprise app group/DM delivery, template rendering, update merging, streaming/completed/error states and failure recovery, plus current-stable n8n runtime/UI compatibility. Finish npm installation/release documentation and resolve/reassess upstream development advisories before stable publication.

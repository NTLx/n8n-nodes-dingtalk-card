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

The package metadata now includes `README.md`; the package check asserts the `n8n-nodes-` name, required community-node keyword, README, and exact compiled node/credential registration paths. The npm workflow is manually dispatched from a matching `v0.1.0-beta.N` tag, runs all release gates, publishes only with the `beta` dist-tag, and grants GitHub OIDC permission for npm trusted publishing/provenance. It cannot publish until the package exists and its npm Trusted Publisher is configured.

On 2026-10-24, a fresh install and local gates ran on Node 26.12.1/npm 12.2.1. Lint, typecheck, build, 26 tests and tarball verification passed. `npm audit --omit=dev --audit-level=high` passed with zero production findings. The unfiltered audit reports 19 high and 4 moderate findings in the n8n development CLI/toolchain dependency graph; these dependencies are not shipped in the package, so CI and the publishing workflow gate production dependencies. This does not claim the development toolchain is advisory-free.

## Limits and next acceptance

No DingTalk secrets, live enterprise account, card template, destination or n8n instance was provided or used. Mocked execution and tarball class loading do not establish real HTTP behavior, rendering, quotas, host UI loading or full current-stable n8n runtime compatibility. The exported workflow's graph, parameters and expression payload are checked locally, not executed on a live n8n instance.

The release is **0.1.0-beta.1, a GitHub prerelease only**, provided every non-live gate passes. It must explicitly say that real DingTalk E2E is pending. No stable `v0.1.0` tag and no npm publication.

Before v0.2.0, implement and verify inbound interaction/callback authentication, acknowledgment timing, button/form mapping and duplicate delivery handling using current official mechanisms. Before v1.0.0, verify real enterprise app group/DM delivery, template rendering, update merging, streaming/completed/error states and failure recovery, plus current-stable n8n runtime/UI compatibility. Finish npm installation/release documentation and resolve/reassess upstream development advisories before stable publication.

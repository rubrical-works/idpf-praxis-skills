# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.13.1] - 2026-04-23

### Changed
- **`tdd-refactor-coverage-audit` promoted to a default skill** — `Skills/tdd-refactor-coverage-audit/SKILL.md` frontmatter flips `defaultSkill: false` → `defaultSkill: true`, adding the skill to the `defaultSkills` array in `.claude/local-metadata/skill-keywords.json` (now 11 default skills). `/work` Step 6a audit (3) coverage audit now runs in IDPF projects without per-project opt-in; the previous "Skipped coverage audit: tdd-refactor-coverage-audit skill not installed." notice no longer fires when the default skill set is installed. README-DIST description annotated accordingly. (#226)
- **`engage-prism` return-side validation + citation liveness spot-check** — primary agent now rejects zero-fetch subagent returns (patterns A/B) and re-dispatches once with a directive naming a specific primary-source URL from the research plan; a second zero-fetch tags the path `evidence-fabrication-risk` (behavioral) distinctly from `degradationEvidence="unverified"` (environmental). Synthesis surfaces fabrication-risk paths under a top-of-proposal banner and excludes them from any `convergent: true` claim. A per-path URL liveness spot-check (WebFetch against one citation per subagent) confirms reachability + publish-date sanity before the proposal is written; blatant publish-date mismatches trigger the same fabrication-risk tag. `proposal-template-schema.json` extended for the `fabricationRisk` flag; docs updated to describe the behavioral-vs-environmental distinction. (#220)
- **`debate-prism` subagent web-research enforcement** — parity import of the #220 return-side validation contract: zero-fetch advocate returns rejected + re-dispatched with a named primary-source URL; second zero-fetch tags the advocate `evidence-fabrication-risk`. Judge output schema extended with `perAdvocateFabricationRisk: {for, against}` which the judge MUST reference in `confidenceRationale` whenever either flag is set. Weakening-evidence URL live-verification runs before proposal generation; dead URLs or publish-date mismatches on the load-bearing weakening citation re-dispatch the judge once, then block the proposal with an explicit error rather than writing it with an unverified citation. (#221)
- **`argument-hint` frontmatter for `/engage-prism` and `/debate-prism`** — both SKILL.md files now surface every documented flag at skill registration time. Parity tests (`tests/skills/engage-prism-argument-hint-parity.test.js`, `tests/skills/debate-prism-argument-hint-parity.test.js`) assert frontmatter ↔ body Options-table flag parity in both directions, so adding or renaming a flag fails CI until both surfaces are updated. Docs for both skills reference the argument-hint as the flag-discovery surface. (#223, #224)
- **Shared `engage-*` scripts relocated post-v0.90 hub upgrade** — `match-signals.js` + input/config schemas moved to `scripts/skills-shared/` (project-owned, outside the symlinked framework territory that the v0.90 hub upgrade overwrote). `inline-shared-scripts.js` + drift test updated to read from the new path; `engage-prism` and `engage-exocortex` SKILL.md frontmatter restored with `sharedScripts:`; `MAINTENANCE.md` "Shared scripts (build-time inlining)" section points at the new path with the v0.90 rationale. Design decision captured in `Construction/Design-Decisions/2026-04-22-shared-scripts-relocated-post-v0.90.md`. (#225)

### Documented
- **`/engage-exocortex` has no web-research enforcement by design** — docs explain why `engage-exocortex` targets code/algorithm/architecture problems where path briefs are reasoning-only and do not require citations, so the #220 return-side validation machinery does not apply. (#222)

## [0.13.0] - 2026-04-22

### Added
- **debate-prism skill — adversarial-dialectic sibling to `/engage-prism`** — new invokable skill that spins up for/against subagent paths on a question, enforces a shared citation schema (cloned from `/engage-prism` for contract parity), and terminates with a judge-output schema requiring `weakeningEvidence`, `verdict`, and `flipConditions`. For/against briefs carry a citation-overlap contract so the two sides cannot lean on the same sources. Proposal template supports conditional disclaimers and round-history sections; a `--round-two` flag triggers a second judging round when the first verdict is unresolved. Ships with two narrative worked examples (`DEBATE-acme-stock-buy-current-prices`, `DEBATE-shut-consumer-focus-enterprise`), a "when to pick which" guide in `Skills/MAINTENANCE.md` distinguishing `/debate-prism` from `/engage-prism`, and a packaged zip. (#214)
- **Shared `match-signals.js` + build-time consumer inlining** — adds `.claude/scripts/shared/lib/match-signals.js` (with `match-signals-input-schema.json` and `match-signals-config.schema.json`) as the single source of truth for fuzzy keyword-to-signal matching across `/engage-prism` and `/engage-exocortex`. Consumers declare their dependency via `sharedScripts:` in `SKILL.md` frontmatter; `inline-shared-scripts.js` runs at build time (and in a new jest `globalSetup`) to copy the authoritative file into each consumer's `scripts/` directory. The `.min-mirror/` pipeline writes inlined copies too so the dist repo stays consistent. A drift test (`tests/skills/shared-script-inlining.test.js`) asserts byte-identity; an explicit CI step (`skill-ci.yml`) runs the inliner before tests. `MAINTENANCE.md` gains a shared-scripts section documenting the contract. Design decision captured in `Construction/Design-Decisions/2026-04-22-shared-scripts-inlining-mechanism.md`. (#209)
- **`--confirm-keywords` and `--structured-routing` flags for `/engage-prism`** — both flags default off; the pre-existing mandatory `AskUserQuestion` keyword-confirmation gate (solo-review friction) and the mandatory match-signals taxonomy routing (~15-file overhead producing labeled-only diversity) are now opt-in. Default flow: primary agent names paths in one sentence each and loads taxonomy entries only when genuinely useful. Pre-v0.13.0 behavior is fully recoverable via `--confirm-keywords --structured-routing`; the backward-compat recipe is recorded in `Skills/MAINTENANCE.md`. (#213)
- **`primarySourceClass` evidence-based anti-overlap for `/engage-prism`** — new field on each path brief (e.g., `primary-filing`, `practitioner-retrospective`, `quantitative-dataset`, `adversarial-bear-source`). The anti-overlap validator rejects runs where two paths share a primary source class — path diversity is now substantive (different evidence classes), not labeled (different paradigm/structure/strategy tuples). (#213)
- **Mandatory red-team path for directional `/engage-prism` questions** — when the question contains a stated recommendation direction ("should we X"), N automatically includes a bear path whose brief requires the strongest counter-case with citations the for-path did not use. Synthesis explicitly records whether the bear survived validation. (#213)
- **`convergent` flag + disagreement-audit phase in `/engage-prism` synthesis** — before writing the recommendation, synthesis enumerates where paths disagreed. If all paths agree across validated dimensions, the run is tagged `convergent: true` and surfaced as a user-visible note so consensus vs. groupthink becomes judgable, not hidden. (#213)
- **`examples` and `domains` codified as copy-as-is subdirectories** — `.claude/scripts/framework/minimize-config.json` adds `"examples"` and `"domains"` to `copyAsIsSubdirectories`; `isCopyAsIs()` extends its always-verbatim early-return so these subdirs bypass the `.md`-vs-type-minimizable check (same semantics as `docs/`). Codifies existing observed behavior and contract-protects contract-demonstration examples (output schemas, gate behaviors, citation shapes, refusal paths) and domain-scoped reference material against silent compression drift if the orchestrator's `.md` scope is ever widened. New test `tests/scripts/framework/minimize-helper-copy-as-is.test.js` pins the contract for invokable/reference skills. `minimize-files.md` Step 2 documentation enumerates all four copy-as-is subdirectories with per-subdir rationale. (#217)
- **Force-tracked `update-release-notes.js`** — adds `.claude/scripts/shared/update-release-notes.js` + `.claude/scripts/shared/lib/input-validation.js` to `.gitignore` force-track exceptions so the deploy-dist workflow can invoke them from a fresh clone of the dist repo. New `tests/workflows/deploy-dist-tracked-paths.test.js` asserts both paths ship. README gains a "Force-Tracked Hub-Managed Scripts" section documenting the pattern. v0.12.3 stub-release-body decision recorded in `Construction/Design-Decisions/`. (#210)

### Changed
- **`/engage-prism` proposal output slimmed** — signal-analysis table collapsed to a one-line footnote; raw subagent envelope JSON offloaded to a sibling `Proposal/PRISM-{slug}.audit.json` file so the main proposal stays decision-focused. Typical proposal size target < 8KB. Docs refreshed (`getting-started.md`, `proposal-format-guide.md`, `synthesis-guide.md`) to reflect the new default flow; new worked example `examples/PRISM-default-flow-should-we-expand-jp-saas.md` demonstrates source-class diversity, the bear path, and the convergent flag in action. (#213)
- **`/engage-exocortex` and `/engage-prism` declared as `sharedScripts:` consumers** — both SKILL.md files list `match-signals.js` (and matching input schemas) in their frontmatter. The inliner copies the authoritative hub version into each skill's `scripts/` at build; `.gitignore` excludes the inlined copies so local dev pulls fresh at build. (#209)

### Fixed
- **`Skills/debate-prism/docs/` tracked in git** — empty-dir regression guard: added `docs/getting-started.md` stub so the `docs/` subdir is tracked, preventing a CI failure where the packaging pipeline expected the directory to exist. Test asserts the file exists (`tests/skills/debate-prism-scaffolding.test.js`). (#214)

## [0.12.3] - 2026-04-20

### Added
- **engage-prism: OSS / dev-tool GTM signal coverage** — 5 new signals in `cross-references.json` (`oss-monetization-design`, `developer-tool-community-growth`, `solo-maintainer-unit-economics`, `devtool-content-seo-ia`, `product-led-licensing-enforcement`) with keyword, paradigm, structure, and strategy triples. Match-signals confidence on a representative OSS/dev-tool GTM query rises from 0.15 (fallback) to 1.0. Added paradigms `comparable-benchmark` and `policy-design` and strategy `driver-tree-with-sparse-priors`. New worked example `examples/PRISM-oss-monetization-sample.md`. `docs/research-plan-guide.md` gains a "Sparse-data unit economics" section. Closes the second-audience gap for builders/founders alongside the existing finance/marketing-analytics coverage. (#200)

### Changed
- **deploy-dist workflow: populate GitHub Release body from CHANGELOG** — `.github/workflows/deploy-dist.yml` now invokes `update-release-notes.js` from `cwd=dist` after `gh release create`, replacing the `"Skills distribution release $VERSION"` stub with the full per-version CHANGELOG section (promoted heading levels, Summary block, Full Changelog compare link). Missing CHANGELOG section logs a warning and leaves the stub in place; does not fail the deploy. Resets `origin` URL to the clean `https://github.com/rubrical-works/idpf-praxis-skills.git` before the script runs so `getRepoUrl()` does not embed `DIST_REPO_TOKEN` in the public compare link. Mirrors the praxis pipeline's dist-repo release-body step. (#201)

## [0.12.2] - 2026-04-20

### Changed
- **engage-prism / engage-exocortex: fuzzier keyword matching** — `match-signals.js` now normalizes hyphens/underscores to spaces on both user and signal keywords, and applies a light suffix strip (`s`, `es`, `ing`, `ed`, `al`, `ly`) in the 0.3 substring tier only, guarded by a ≥4-char residue rule. Exact (1.0) and word-boundary (0.7) tiers unchanged. Closes the mechanical-miss class where `"agriculture"` failed to reach `"agricultural commodities"` and `"next-quarter"` failed to reach `"next quarter"`. (#191, #192)
- **engage-prism: attempted-call evidence required for degraded reports** — a subagent setting `webResearch.performed = false` must now populate `webResearch.attemptedCalls[]` with ≥1 entry documenting an actual fetch attempt. Reports with `performed=false` and empty `attemptedCalls[]` are rejected as contract violations and re-dispatched once with an explicit "attempt at least one fetch" directive; if the retry still returns zero attempts, the report is accepted but tagged `degradationEvidence="unverified"` so synthesis deprioritizes it further. Touches `report-template.json`, `brief-template.json`, `synthesis-config.json`, `SKILL.md`. (#193)
- **engage-prism: recency gate + anchor corroboration + date-qualified queries** — new configurable `freshnessClass` arg (`geopolitical | market | general`; default `general`) with thresholds 24h/24h/72h. When a path's freshest cited anchor source exceeds the threshold, the path is rejected and re-dispatched once with a "fetch a source dated within the last {threshold}h" directive. Probability weights and price levels now require ≥2 independent-domain citations before driving synthesis (single-source anchors tagged `anchorEvidence="single-source"`). Subagent briefs instruct including `YYYY-MM-DD` or `last 24h` in ≥1 search query for time-sensitive entities. Gate failure after retry emits `⚠️ Recency-gate degraded: freshest citation Xh old (threshold Yh)` in the path Report — never silent. (#194)
- **engage-prism / engage-exocortex: fail-fast Node preflight** — both `SKILL.md` files now document a Preflight step that runs `node --version` before Step 0 / any workflow step. Missing node or version < 18 halts with an explicit error and install link (https://nodejs.org/); a new `Node missing or < 18` row appears in each Error Handling table. The `engage-prism` prerequisites section now points to nodejs.org directly instead of the previously unresolved `install-node` skill referral. Language mirrors between the two skills so they degrade identically. (#196, #197)

### Added
- `tests/skills/engage-prism/match-signals-fuzzy.test.js`, `tests/skills/engage-exocortex/match-signals-fuzzy.test.js` — fuzzier-matching unit tests covering separator normalization, suffix-strip hits, ≥4-char guard, and 1.0/0.7 tier regression.
- `tests/skills/engage-prism-attempted-calls.test.js`, `tests/skills/engage-prism-recency-gate.test.js` — contract tests pinning the attempted-call and recency-gate language across `report-template.json`, `brief-template.json`, `synthesis-config.json`, and `SKILL.md`.
- `tests/skills/engage-prism-preflight.test.js`, `tests/skills/engage-exocortex-preflight.test.js` — preflight contract tests (including cross-skill consistency check).

## [0.12.1] - 2026-04-19

### Changed
- **engage-prism: licensed-advice constraint softened** — `SKILL.md` now permits the synthesis agent to name specific securities, options, or positions when the user asks, provided outputs stamp the new Disclaimer template. Trade execution / order placement guard retained. Refusing to name securities when the user has acknowledged informational framing is now itself a contract violation. (#184)
- **engage-prism: signal catalog expanded** — added 5 new signals in `cross-references.json` (`geopolitical-risk-positioning`, `commodity-shock-exposure`, `sector-rotation-thesis`, `tactical-positioning-short-horizon`, `investment-tooling-discovery`) and broadened keywords on 3 existing signals (`scenario-stress-test`, `portfolio-allocation-decision`, `macro-trend-assessment`). Closes the geopolitical / commodity-shock / tactical-trade vocabulary gap that previously produced zero matches. (#185)
- **engage-prism: risk-aware anti-overlap rule** — new `antiOverlapRule` requires at least one chosen strategy to be `ev-vs-risk-framing` or `sensitivity-analysis` when the matched signal is in the scenario/shock family. New `scripts/anti-overlap-validator.js` encodes both conditional rules as a pure function. (#186)
- **engage-prism: graceful fallback on zero signal matches** — `match-signals.js` now emits `ok: true, fallback: true, confidence: 0.15` with a default `scenario-analysis / scenario-grid / ev-vs-risk-framing` path when no signal matches but a finance/macro allowlist term is present. Hard error preserved when no allowlist hit. `SKILL.md` instructs the subagent to acknowledge the low-confidence routing and ask one refinement question before proceeding. (#187)
- **engage-prism: markdown output contract** — `SKILL.md` now declares a user-facing output contract: synthesis agent MUST render each path as markdown (heading, narrative, bulleted findings, numbered citation footnotes, markdown tables) and MUST preserve raw JSON inside a `<details>` block for audit. Raw-JSON-in-primary-narrative is an explicit contract violation. New example `PRISM-output-contract-reference.md` demonstrates the shape. (#188)

### Added
- `tests/skills/engage-prism-disclaimer-contract.test.js`, `engage-prism-anti-overlap.test.js`, `engage-prism-fallback.test.js`, `engage-prism-output-contract.test.js` — 18 new structural/unit tests pinning the four contract changes above.

## [0.12.0] - 2026-04-19

### Added
- **engage-prism skill** — analytical-reasoning sibling to `engage-exocortex`. JSON-driven parallel analytical explorer with citation-first contract (mandatory `citation-schema.json`), domain-specific paradigms/strategies/structures, and 5 per-domain end-to-end examples with schema-conformant citations (competitor teardown, equity ticker, paid-search ROI, remote-work trend, EV-charging TAM). Includes `docs/` reference material and Node.js prerequisite documentation. (#176, #182)
- **install-node skill** — safe, guided Node.js installer. Detects existing Node and version managers (nvm/fnm/volta), recommends a single vetted package-manager command per platform (winget/brew/nvm), runs dry-run by default, and requires explicit responsibility acknowledgement before any execution path. Bootstrap does not itself require Node. (#179)
- **responsibility-gate shared-pattern skill** — reusable responsibility-acknowledgement gate contract referenced by `install-node` and rolled out to 12 install-capable skills (digitalocean-app-setup, electron-cross-build, flask-setup, i18n-setup, observability-setup, playwright-setup, postgresql-integration, railway-project-setup, render-project-setup, sinatra-setup, sqlite-integration, vercel-project-setup). (#180)
- **engage-exocortex: Node.js prerequisite documentation** — SKILL.md now declares the Node.js runtime prerequisite explicitly and routes to `install-node` when missing. (#178)

### Changed
- Regenerated all skill metadata (registry, keywords, schemas, public manifest) to include the 3 new skills. `Skills/MAINTENANCE.md` registry table updated to 45 skills.
- Re-minimized and repackaged affected skills in `.min-mirror/` / `Skills/Packaged/`.

## [0.11.1] - 2026-04-06

### Fixed
- **build-skill-packages: tests/ subdir leaked into distributed zips** — `build-skill-packages.js` now reads `excludedSkillSubdirectories` from `minimize-config.json` (same source as `minimize-helper.js`) and skips matching directory names when walking each skill for companion files. Resolves a config-script desync that landed in `d023e2f` and shipped silently in v0.11.0. Adds a regression test that asserts no excluded subdir entries appear in distributed zips. (#171)
- **SKILLS-manifest.json silent drift** — added `build-skills-manifest.js` that scans `Skills/*/SKILL.md` frontmatter and writes a deterministic manifest (alphabetized, preserves `$schema`/`version`/`renamed`/`deprecated`). Supports `--check` mode for CI gates. New `tests/skills/skills-manifest.test.js` (9 tests) asserts the manifest stays in sync with `Skills/` on disk. `/prepare-release` extension now runs the builder alongside the other metadata builders. One-time correction: `tdd-refactor-coverage-audit` is now present in the manifest (was missing in v0.11.0). (#174)

## [0.11.0] - 2026-04-06

### Added
- **tdd-refactor-coverage-audit skill** — new self-contained companion to `tdd-process` that mechanically audits whether source files added during a TDD cycle have paired tests. JSON-driven language conventions for 10 languages (TypeScript, JavaScript, Svelte, Python, Go, Rust, Ruby, Elixir, Java, C#) with optional project overrides via `framework-config.json` → `testCoverageAudit`. Pure Node, zero external deps, schema-validated, advisory-only (never blocks the TDD gate). 22 unit tests (#168)
- **tdd-process: refactor phase audit integration** — refactor phase gains a `required[]` checklist item invoking `tdd-refactor-coverage-audit` and a new `deepReferences[]` array containing both `tdd-refactor-phase` and the audit skill. `tdd-checklist-schema.json` accepts both legacy `deepReference` and new `deepReferences[]` (backwards-compatible). Soft-skip when audit script is absent. 10 unit tests covering schema fixtures and probe behavior (#169)
- **engage-exocortex: semantic relevance scoring** — `match-signals.js` output gains per-match `relevance` (0-1) and top-level `confidence` field. Scoring tiers: 1.0 exact, 0.7 word-boundary, 0.3 substring-only. Lets callers tier match quality without re-deriving from model judgment. 6 new unit tests (#165)
- **engage-exocortex: tension-to-path collapse guidance** — new step 1a in adaptive mode methodology. Rank tensions by solution divergence, combine interdependent tensions, map top N as primary differentiators with remainders as secondary variables, then verify anti-overlap on primaries. Includes a 4→3 worked example for parallel code review architecture (#166)
- **engage-exocortex: operational scoring dimensions** — synthesis-config.json gains `operationalDimensions` block (extensibility, operational simplicity, user transparency, cost predictability) and a new `operational-graft` hybridization question. SKILL.md gains a worked example where the graft changes the recommendation (#167)

### Changed
- **minimize-config: excludedSkillSubdirectories** — new config field lets `minimize-config.json` exclude per-skill subdirectories by name from `.min-mirror/` and distributed packages. Initial value `["tests"]` keeps test infrastructure out of user-facing zips while preserving it in source for CI

## [0.10.0] - 2026-04-05

### Added
- **engage-exocortex: helper scripts** — `match-signals.js` for keyword-to-signal matching with weighted score aggregation and top-N path selection; `load-entries.js` for selective entry loading from paradigms/structures/strategies with token budget estimation (#158)
- **engage-exocortex: keyword confirmation gate** — mandatory `AskUserQuestion` gate between problem parsing and signal matching; handles zero/single/multi-keyword flows, adjust/rephrase loops, and text-based fallback (#159)
- **engage-exocortex: adaptive fallback methodology** — three-tier match quality classification (strong/weak/none) with graceful degradation; weak-match anchoring with closest-neighbor supplementation; no-match tension-driven path definition preserving parallel exploration structure (#162)
- **engage-exocortex: input schema validation** — colocated JSON schemas for both helper scripts with ajv validation (graceful degradation if unavailable)
- Unit tests for `match-signals.js` (14 tests) and `load-entries.js` (12 tests)

## [0.9.1] - 2026-04-04

### Added
- **engage-exocortex: Opus model default** — subagents now spawn with `model: "opus"` by default regardless of parent session model; `--model` flag allows override for cost-conscious usage
- **engage-exocortex: model requirements docs** — getting-started guide updated with Model Requirements section, component-model table, and trade-off warning

### Fixed
- **SKILLS-manifest not deployed** — `SKILLS-manifest.json` and `SKILLS-manifest-schema.json` added to deploy-dist.yml "Copy root files" step so they reach the distribution repo

## [0.9.0] - 2026-04-04

### Added
- **SKILLS-manifest.json** — centralized manifest for all distributable skills with schema validation (`SKILLS-manifest-schema.json`), rename migration support via `renamed` blocks, and deprecation tracking
- **engage-exocortex: getting-started guide** — new `docs/getting-started.md` explaining how to use the skill, example questions, expected output, and tips for effective usage

### Changed
- **hal-2026 renamed to engage-exocortex** — skill directory, SKILL.md frontmatter, all internal references (docs, resources, schemas, registry, keywords, tests, .min-mirror, README-DIST, MAINTENANCE.md, SKILL-DEVELOPMENT-GUIDE), framework-config.json, .gitignore, and packaged zip all updated. Historical artifacts (CHANGELOG, PRD, Proposal) preserved with original names. Skill version bumped to 2.0.0.

### Fixed
- skill-versioning-e2e test hardcoded `1.0.0` for all non-test skills — now compares against original registry versions to support skills at any version

## [0.8.0] - 2026-04-03

### Added
- **hal-2026: software engineering domains** — expanded from 8 algorithmic-only paradigms to 31 paradigms (8 algorithmic + 23 SE), 22 structures (8 + 14), and 22 strategies (9 + 13) covering architecture, testing, deployment, security, and more
- **hal-2026: context gathering pre-step** — optional Step 0 detects architecture/design keywords and loads up to 3 relevant skills via `skill-context-map.json` to enrich signal extraction
- **hal-2026: exploration proposal generation** — new Step 5 writes a persistent `Proposal/HAL-{slug}.md` document capturing the full exploration lifecycle (signals, paths, reports, synthesis); opt-out via `--no-proposal`

### Fixed
- hal-2026 SKILL.md frontmatter `description` field converted from multi-line to single-line for parser compatibility

## [0.7.1] - 2026-04-03

### Fixed
- **Minimization pipeline gap** (#140) — non-`.md` files in `resources/` and `docs/` directories (JSON, JS, YAML, etc.) were silently dropped during minimization. `cmdCopyCompanionFiles()` now copies non-`.md` files from `copyAsIsSubdirectories` instead of skipping those directories entirely.
- Additional non-`.md` resource files discovered and copied across multiple skills (`.py`, `.rb`, `.yaml`, `.toml`, `.yml`)

### Changed
- SKILL-DEVELOPMENT-GUIDE.md updated to document that `resources/` supports any file type with hal-2026 example

## [0.7.0] - 2026-04-03

### Added
- **hal-2026 skill** — JSON-driven parallel solution explorer with structured decision matrix, schema-validated references, and selective loading for minimal token usage
- **json-validator: .gitignore support** (#119) — file discovery now parses `.gitignore` patterns to complement hardcoded exclusions
- **json-validator: schema override** (#120) — `--schema-override` flag and SKILL.md prompt workflow when `$schema` references a missing file; also fixed latent bug where `type:'missing'` schemas with non-null resolved path fell through to validateFile
- **$schema references** (#121) — added `$schema` to all project-owned JSON files; created `minimize-config-schema.json` and `framework-config-schema.json`; updated existing schemas to allow `$schema` property
- **docs/ minimization exclusion** (#125) — `docs/` subdirectory convention for human-readable skill documentation, always copied as-is during minimization
- Unit tests for minimization quality gate thresholds, json-validator gitignore parsing, and json-validator schema override

### Changed
- **Sliding-scale quality gate** (#116) — replaced step-function thresholds with a hyperbolic curve that smoothly scales from 100% (near-minimum 2KB files) to 82% floor (50KB+ files)
- CI workflow now runs `npm ci` before tests (required for ajv dependency)

### Fixed
- json-validator `isCopyAsIs()` now always returns `true` for `docs/` paths regardless of skill type
- Test runner uses `cwd: PROJECT_ROOT` instead of `NODE_PATH` env override for cross-platform CI compatibility

## [0.6.0] - 2026-04-02

### Added
- Destructive pattern detection (Category 5) in command-spec-audit skill
- `defaultSkill: true` for command-spec-audit — auto-installed in IDPF projects
- `deepReference` field in tdd-checklist.json for conditional skill loading
- LICENSE and SECURITY.md to dist repo
- CodeQL workflow to dist-workflows

### Changed
- Reclassified 5 skills to correct types: command-spec-audit (invokable→reference), codebase-analysis (invokable→reference+defaultSkill), bdd-writing (invokable→reference), observability-setup (invokable→educational), property-based-testing (invokable→educational)
- Type-aware resource minimization — resource `.md` files for invokable/reference types now AI-minimized
- Full `.min-mirror` reset with updated minimization pipeline
- Removed `reference` from `minimizeTypes` — reference skills now copied as-is

### Fixed
- Copyright year updated to 2026 in all skill LICENSE.txt files
- MAINTENANCE.md lastUpdated dates synced with SKILL.md frontmatter
- Removed audit-commands directory (incorrectly copied from dev repo)

## [0.5.0] - 2026-04-02

### Added
- `resources/HOWTO.md` for all 11 reference skills — usage guides for non-IDPF projects
- CodeQL code scanning workflow for dist repo
- SECURITY.md vulnerability disclosure policy for dist repo
- Dependabot config for GitHub Actions scanning on dist repo
- Branch protection (force-push/deletion blocked) on dist repo main
- CodeQL badge to README-DIST.md
- HOWTO.md check in `/fw-edit-skill` type-change cascading — prompts to create stub when switching to injector or reference
- Reference skill HOWTO template in SKILL-DEVELOPMENT-GUIDE.md
- Docker Development Skill proposal transferred from idpf-praxis-dev

### Changed
- Renamed `HOW-TO.md` to `HOWTO.md` across all skills and references (standard naming convention)
- `SKILL-DEVELOPMENT-GUIDE.md` now documents HOWTO requirement for both injector and reference skill types
- `/fw-add-skill` reference template now generates HOWTO stub (separated from educational template)
- Dist repo CI workflow and deploy step added

## [0.4.2] - 2026-04-02

### Added
- Tiered minimization thresholds based on source file size (<3KB: 98%, 3-5KB: 92%, 5-10KB: 88%, >10KB: 85%)
- Summary report step in `/minimize-files` pipeline

### Fixed
- `LICENSE.txt` now copied to `.min-mirror/` for all skills — was missing from deployed unpacked directories
- Replaced `px-manager` shorthand with `Praxis Hub Manager` across all documentation

## [0.4.1] - 2026-04-02

### Added
- `json-validator` invokable skill — validates JSON files against `$schema` references using Ajv (single file, `--all`, `--dir` modes)

### Fixed
- `fw-edit-skill` edit menu exceeded `AskUserQuestion` 4-option limit — consolidated 6 options to 4
- `fw-add-skill` injector template missing `resources/HOW-TO.md` generation
- README-DIST.md rewritten for dist repo audience (language, title, framework compatibility accuracy)
- Minimization pipeline now copies companion files (`.json`, `.js`) and non-standard subdirectories (`lib/`, `scripts/`) to `.min-mirror/` and packages

### Changed
- Skill count increased from 39 to 40

## [0.4.0] - 2026-04-02

### Added
- Skill type taxonomy — all 39 skills classified as injector, invokable, reference, or educational via `type` field in frontmatter
- `tdd-process` injector skill with `tdd-checklist.json` for structured TDD enforcement (RED/GREEN/REFACTOR gates + failure recovery)
- `resources/HOW-TO.md` for all 5 injector skills — usage guides for non-IDPF projects
- Type-aware minimization pipeline — injector and educational skills copied as-is, invokable and reference AI-minimized
- `/fw-add-skill` interactive skill scaffolding command
- `/fw-edit-skill` interactive skill editing with type-aware cascading updates
- `/fw-audit-skills` command for auditing skills against development guide
- Skill metadata regeneration as pre-phase-1 extension in `/prepare-release`
- `SKILL-DEVELOPMENT-GUIDE.md` with full type taxonomy, frontmatter reference, and HOW-TO template
- `README-DIST.md` with per-type skill tables and usage examples
- Frontmatter hints added to `/minimize-files` command spec
- Publish unpackaged skill directories to dist repo

### Changed
- Default skills reduced from 10 to 7
- Skill registry reads version from `package.json` instead of hardcoding
- Removed skill-catalog files (replaced by registry)
- Build script output moved from `metadata/` to `local-metadata/`

### Fixed
- Added `type` field and removed deprecated `invocationMode` from all 39 skills
- CRLF line ending handling in frontmatter parsers

## [0.3.1] - 2026-03-31

### Fixed
- Add 4 new build scripts to `deploy-dist.yml` workflow for dist repo deployment
- Relax `skill-versioning.test.js` from exact `1.0.0` to `>= 1.0.0` for version-bumped skills
- Document root cause of MAINTENANCE.md version drift during v0.3.0 release

### Changed
- Add dependency audit and cross-OS testing to `skill-ci.yml`

## [0.3.0] - 2026-03-31

### Added
- `build-skill-keywords.js` — generates `skill-keywords.json` from registry and curated data
- `build-skill-catalog-schema.js` — generates JSON Schema for skill catalog
- `build-skill-registry-schema.js` — generates JSON Schema for skill registry
- `build-skill-keywords-schema.js` — generates JSON Schema for skill keywords
- Unit tests for all 4 new build scripts (39 tests)

### Fixed
- Separate release creation from asset upload in `deploy-dist.yml`

## [0.2.1] - 2026-03-30

### Added
- Incremental minimization via `.last-run` timestamp tracking in `minimize-helper.js`
- `stamp-run` command writes ISO 8601 timestamp after successful minimization
- `changed` command lists files modified since last run (mtime comparison)
- `/minimize-files` Step 1 now detects changed files and skips unchanged ones

## [0.2.0] - 2026-03-30

### Added
- Minimization pipeline: `minimize-config.json`, `minimize-helper.js`, `validate-minimization.js`
- AI-driven two-pass minimization in `/minimize-files` command (85% quality gate)
- `build-skill-packages.js` now sources from `.min-mirror/Skills/` when minimized versions exist
- `/add-skill` command for scaffolding new skill directories with validation
- `.claude/local-metadata/skill-requirements.json` — machine-readable skill requirements
- `.claude/local-metadata/` directory (repo-owned, px-manager upgrade-safe)
- MAINTENANCE.md auto-generation step in `/minimize-files` (Step 7)
- Selective metadata deployment — only skill-related files deployed to dist repo
- `/minimize-files` integrated as pre-phase-1 extension in `/prepare-release`
- `.gitattributes` for LF line ending normalization

### Changed
- `deploy-dist.yml` copies only skill metadata (catalog, registry, keywords + schemas) instead of all `*.json`
- `deploy-dist.yml` generates and copies `skill-registry.json` alongside catalog
- `/skill-validate` now consumes `skill-requirements.json` for field validation

### Fixed
- CRLF line ending handling in frontmatter parsers (`build-skill-registry.js`) and all test files
- Synced `command-spec-audit` SKILL.md with upstream `idpf-praxis-dev`

## [0.1.0] - 2026-03-30

### Added
- Transfer 38 skill source directories and packages from idpf-praxis-dev
- Build and validation scripts for skill registry and catalog
- `build-skill-packages.js` with CLI interface and module exports
- `build-skill-registry.js` for generating skill-registry.json from SKILL.md frontmatter
- `build-skill-catalog.js` for generating distribution catalog with download URLs
- `validate-skill-version.js` for rejecting invalid skill versions
- `generate-checksums.js` for SHA-256 file integrity manifests
- `.github/workflows/skill-ci.yml` — CI workflow with Jest tests, concurrency groups, paths-ignore, and dependency caching
- `.github/workflows/deploy-dist.yml` — Distribution deployment to rubrical-works/idpf-praxis-skills
- `.github/workflows/deploy-skill.yml` — Individual skill deployment via skill/*/v* tags
- `Skills/MAINTENANCE.md` with skill registry table and versioning policy
- Post-tag deployment verification in `/prepare-release` (Steps 4.9-4.11)
- Project charter and lifecycle structure

### Fixed
- Removed framework-level tests that depend on hub symlink modules (CI migration artifact)
- Fixed skill-versioning-e2e.test.js to generate registry if missing in CI
- Fixed test parallelism issue with --runInBand for e2e version mutation tests

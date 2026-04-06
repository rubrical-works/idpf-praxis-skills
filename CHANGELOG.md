# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

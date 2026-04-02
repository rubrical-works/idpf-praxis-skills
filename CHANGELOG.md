# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

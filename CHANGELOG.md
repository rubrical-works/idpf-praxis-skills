# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

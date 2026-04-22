# IDPF Praxis Skills

[![Skill CI](https://github.com/rubrical-works/idpf-praxis-skills/actions/workflows/skill-ci.yml/badge.svg)](https://github.com/rubrical-works/idpf-praxis-skills/actions/workflows/skill-ci.yml)
[![CodeQL](https://github.com/rubrical-works/idpf-praxis-skills/actions/workflows/codeql.yml/badge.svg)](https://github.com/rubrical-works/idpf-praxis-skills/actions/workflows/codeql.yml)
[![Latest Release](https://img.shields.io/github/v/release/rubrical-works/idpf-praxis-skills)](https://github.com/rubrical-works/idpf-praxis-skills/releases/latest)
[![Skills](https://img.shields.io/badge/skills-46-blue)](https://github.com/rubrical-works/idpf-praxis-skills#available-skills)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Ready-to-use skills for [Claude Code](https://claude.ai/code). Browse skill documentation below, then install what you need.

## How to Install

### Via Praxis Hub Manager

If you use Praxis Hub Manager, skills are installed and updated automatically as part of your project setup.

### Direct Download

1. Download the `.zip` package from [Skills/Packaged/](Skills/Packaged/) or the [Releases](https://github.com/rubrical-works/idpf-praxis-skills/releases) page
2. Extract into your project's `.claude/skills/` directory:
   ```
   .claude/skills/skill-name/
     SKILL.md
     LICENSE.txt
     resources/       (if applicable)
   ```
3. Restart your Claude Code session

### Browse First, Then Download

Each skill directory in [Skills/](Skills/) contains the full documentation. Click any skill link below to read its `SKILL.md` and resources before installing.

## Skill Types

| Type | How It Works | You Invoke It? |
|------|-------------|----------------|
| **Injector** | Carries structured config that framework commands read at runtime | No — automatic |
| **Invokable** | Guided workflow you trigger as a slash command | Yes — via `/skill-name` |
| **Reference** | Domain knowledge loaded when explicitly needed | On demand |
| **Educational** | Teaching material Claude provides in learning contexts | Automatic when relevant |

## Available Skills

### Injector Skills (5)

These require the [IDPF Praxis framework](https://github.com/rubrical-works/idpf-praxis-dev). Framework commands read their config at runtime. Each includes a `resources/HOWTO.md` explaining how to use the skill without the framework.

| Skill | Category | Description |
|-------|----------|-------------|
| [tdd-process](Skills/tdd-process/) | Testing | TDD phase enforcement checklists (RED/GREEN/REFACTOR + failure recovery) |
| [anti-pattern-analysis](Skills/anti-pattern-analysis/) | Code Quality | Anti-pattern detection checklist |
| [error-handling-patterns](Skills/error-handling-patterns/) | Development | Error handling hierarchy and API error responses |
| [electron-development](Skills/electron-development/) | Platform | Electron app development with Vite, Playwright, Windows considerations |
| [electron-cross-build](Skills/electron-cross-build/) | Platform | Cross-compile Electron apps from Linux to Windows |

### Invokable Skills (17)

Interactive guided workflows. Install and use as slash commands.

| Skill | Category | Description |
|-------|----------|-------------|
| [playwright-setup](Skills/playwright-setup/) | Testing | Playwright installation and verification |
| [playwright-explorer](Skills/playwright-explorer/) | Testing | Browser exploration and element discovery |
| [flask-setup](Skills/flask-setup/) | Web | Flask project scaffolding |
| [sinatra-setup](Skills/sinatra-setup/) | Web | Sinatra project scaffolding |
| [digitalocean-app-setup](Skills/digitalocean-app-setup/) | Deployment | DigitalOcean App Platform setup |
| [railway-project-setup](Skills/railway-project-setup/) | Deployment | Railway deployment setup |
| [render-project-setup](Skills/render-project-setup/) | Deployment | Render deployment setup |
| [vercel-project-setup](Skills/vercel-project-setup/) | Deployment | Vercel deployment setup |
| [postgresql-integration](Skills/postgresql-integration/) | Database | PostgreSQL setup and integration |
| [sqlite-integration](Skills/sqlite-integration/) | Database | SQLite setup and integration |
| [i18n-setup](Skills/i18n-setup/) | Infrastructure | Internationalization setup |
| [code-path-discovery](Skills/code-path-discovery/) | Analysis | Path analysis patterns |
| [json-validator](Skills/json-validator/) | Analysis | Validate JSON files against schemas |
| [engage-exocortex](Skills/engage-exocortex/) | Problem Solving | JSON-driven parallel solution explorer |
| [engage-prism](Skills/engage-prism/) | Analytical Reasoning | JSON-driven parallel analytical explorer with citation-first contract |
| [debate-prism](Skills/debate-prism/) | Analytical Reasoning | Adversarial for/against debate on a question with citation-overlap contract and structured judging |
| [install-node](Skills/install-node/) | Setup | Safe, guided Node.js installer with dry-run default and responsibility gate |

### Reference Skills (17)

Domain knowledge loaded on demand during relevant work.

| Skill | Category | Description |
|-------|----------|-------------|
| [drawio-generation](Skills/drawio-generation/) | Documentation | Diagram styles and structure |
| [test-scaffold](Skills/test-scaffold/) | Testing | Domain-specific test patterns |
| [api-versioning](Skills/api-versioning/) | API | Compatibility and deprecation workflows |
| [astro-development](Skills/astro-development/) | Web | Islands architecture and content collections |
| [migration-patterns](Skills/migration-patterns/) | Database | Versioning and zero-downtime patterns |
| [resilience-patterns](Skills/resilience-patterns/) | Reliability | Circuit breaker and fallback patterns |
| [mutation-testing](Skills/mutation-testing/) | Testing | Mutation testing strategies |
| [ci-cd-pipeline-design](Skills/ci-cd-pipeline-design/) | DevOps | CI/CD pipeline patterns |
| [tdd-red-phase](Skills/tdd-red-phase/) | Testing | Deep TDD RED phase guidance |
| [tdd-green-phase](Skills/tdd-green-phase/) | Testing | Deep TDD GREEN phase guidance |
| [tdd-refactor-phase](Skills/tdd-refactor-phase/) | Testing | Deep TDD REFACTOR phase guidance |
| [tdd-refactor-coverage-audit](Skills/tdd-refactor-coverage-audit/) | Testing | JSON-driven test coverage audit for new source files (advisory) |
| [tdd-failure-recovery](Skills/tdd-failure-recovery/) | Testing | TDD failure diagnosis and recovery |
| [bdd-writing](Skills/bdd-writing/) | Testing | Gherkin syntax and step definitions |
| [codebase-analysis](Skills/codebase-analysis/) | Analysis | Codebase detection mappings |
| [command-spec-audit](Skills/command-spec-audit/) | Framework | Command spec audit criteria |
| [responsibility-gate](Skills/responsibility-gate/) | Shared Pattern | Reusable responsibility-acknowledgement gate contract for install-capable skills |

### Educational Skills (7)

Teaching material Claude provides when it detects a learning context.

| Skill | Category | Description |
|-------|----------|-------------|
| [common-errors](Skills/common-errors/) | Web | Flask/Sinatra beginner mistake explanations |
| [beginner-testing](Skills/beginner-testing/) | Testing | TDD concepts for newcomers |
| [test-writing-patterns](Skills/test-writing-patterns/) | Testing | Test structure and smell identification |
| [seo-optimization](Skills/seo-optimization/) | Web | Content and technical SEO |
| [privacy-compliance](Skills/privacy-compliance/) | Compliance | Regulatory and consent management |
| [observability-setup](Skills/observability-setup/) | Infrastructure | Logging and monitoring concepts |
| [property-based-testing](Skills/property-based-testing/) | Testing | Property-based testing concepts |

## Compatibility

All skills work with Claude Code. Injector skills are designed for the IDPF Praxis framework (>= 0.60.0), where commands consume their JSON automatically — but any Claude Code project can use them by wiring up a rule that reads the JSON. Each injector skill includes a `resources/HOWTO.md` with instructions. Check individual skill frontmatter for specific version requirements.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full text.

Individual skills may include additional license terms in their `LICENSE.txt` files.

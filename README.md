# idpf-skills-dev

**Version:** v0.4.0

[![Skill CI](https://github.com/rubrical-works/idpf-skills-dev/actions/workflows/skill-ci.yml/badge.svg)](https://github.com/rubrical-works/idpf-skills-dev/actions/workflows/skill-ci.yml)

Primary development repository for Claude Code skills destined for the [idpf-praxis-skills](https://github.com/rubrical-works/idpf-praxis-skills) distribution repository.

## Purpose

This repo is where skills are developed, tested, and refined before being packaged for distribution. End users install skills from `idpf-praxis-skills` — this repo is for contributors.

## Skill Types

Skills are classified into four types based on how they are consumed:

| Type | Purpose | Claude Invokes? | Example |
|------|---------|----------------|---------|
| **Injector** | Carry JSON config read by commands at runtime (requires IDPF Praxis) | No | `tdd-process` |
| **Invokable** | Interactive guided workflows | Yes | `playwright-setup` |
| **Reference** | Domain knowledge loaded on demand | No | `drawio-generation` |
| **Educational** | Teaching material for learning contexts | Yes | `common-errors` |

See [SKILL-DEVELOPMENT-GUIDE.md](SKILL-DEVELOPMENT-GUIDE.md) for full details on each type, directory structure, and frontmatter requirements.

## Repository Structure

```
Skills/                 <- All skills live here, one directory per skill
  skill-name/
    SKILL.md            <- Frontmatter + content
    LICENSE.txt         <- License terms
    resources/          <- Supporting files
  Packaged/             <- Distribution-ready packages
Proposal/               <- Proposals for skill changes
PRD/                    <- Product requirement documents
Construction/           <- Design decisions, test plans, tech debt
Transition/             <- Deployment and user documentation
```

## Development Workflow

1. Create or modify skills in `Skills/skill-name/`
2. Test locally by symlinking into a project's `.claude/skills/`
3. Commit with issue references (`Refs #N`)
4. Package for distribution to `idpf-praxis-skills`

## Distribution

Skills flow from this repo to [idpf-praxis-skills](https://github.com/rubrical-works/idpf-praxis-skills) via the packaging and deployment process. Users install skills from the distribution repo using `praxis-hub-manager` (px-manager) or by direct download.

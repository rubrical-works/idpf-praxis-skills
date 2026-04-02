# Using test-scaffold Without IDPF Framework

Generate testing infrastructure from domain knowledge -- configs, specs, and CI workflows for accessibility, chaos, contract, performance, QA automation, and security testing.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Orchestrator that handles project detection, domain selection, artifact generation, and summary reporting |
| `resources/multi-domain-example.md` | Example showing how multiple testing domains combine in a single project |
| `domains/accessibility.md` | axe-core configs, a11y specs, Lighthouse budgets, CI scanning jobs |
| `domains/chaos.md` | Toxiproxy experiment configs, proxy setup, abort conditions, runbooks |
| `domains/contract-testing.md` | Pact consumer/provider specs, broker config, Can-I-Deploy gate |
| `domains/performance.md` | k6 load test scripts, threshold configs, CI jobs |
| `domains/qa-automation.md` | Playwright Page Objects, fixtures, spec templates, cross-browser CI |
| `domains/security.md` | Semgrep SAST, ZAP DAST, Gitleaks secret scanning, CI security gates |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/test-scaffold/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When setting up testing infrastructure, scaffolding test configs, or adding
accessibility/chaos/contract/performance/QA/security testing to this project,
read .claude/skills/test-scaffold/SKILL.md first. Follow its project detection
steps, then load the relevant domain file(s) from domains/ for the specific
testing type being set up.
```

## Customization

- Add or remove domain files in `domains/` to match the testing types relevant to your project. Each domain file is self-contained.
- Edit individual domain files to adjust tool versions, threshold defaults, or CI workflow templates to match your stack (e.g., swap Playwright for Cypress in `qa-automation.md`).
- Modify the project detection rules in `SKILL.md` Step 1 if your project uses a non-standard framework or directory layout.

## How IDPF Projects Use This

In IDPF projects, this skill is invoked when a user requests test scaffolding (e.g., "scaffold security testing"). The framework loads `SKILL.md`, runs project detection, presents domain selection, then loads the chosen `domains/*.md` files to generate artifacts. The approach above replicates that behavior for any Claude Code project.

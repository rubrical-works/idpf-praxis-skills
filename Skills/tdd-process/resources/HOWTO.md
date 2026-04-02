# Using tdd-process Without IDPF Framework

Structured TDD enforcement via `tdd-checklist.json` — a machine-readable RED/GREEN/REFACTOR checklist with phase gates and failure recovery steps.

## What's Included

| File | Purpose |
|------|---------|
| `tdd-checklist.json` | Phase checklists, gates, and failure recovery triggers/steps |
| `tdd-checklist-schema.json` | JSON Schema for validation |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/tdd-process/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When doing TDD work, read .claude/skills/tdd-process/tdd-checklist.json and enforce each phase:

- RED: Verify all red.required items. Do not write implementation until red.gate is satisfied.
- GREEN: Verify all green.required items. Do not refactor until green.gate is satisfied.
- REFACTOR: Verify all refactor.required items. Do not start next cycle until refactor.gate is satisfied.
- On unexpected test behavior matching any failure-recovery.triggers: follow failure-recovery.steps in order.
```

## Customization

The JSON is self-contained. You can:

- **Add checks** — append strings to any `required` array
- **Adjust gates** — edit the `gate` string for stricter/looser enforcement
- **Add triggers** — extend `failure-recovery.triggers` for your test stack
- **Validate changes** — use `tdd-checklist-schema.json` to verify structure

## How IDPF Projects Use This

In IDPF projects, the `/work` command reads the JSON automatically at each TDD gate. The approach above replicates that behavior for any Claude Code project.

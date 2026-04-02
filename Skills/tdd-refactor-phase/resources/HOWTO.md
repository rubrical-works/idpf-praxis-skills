# Using tdd-refactor-phase Without IDPF Framework

Guide experienced developers through the REFACTOR phase of TDD -- improving code quality while keeping all tests green.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Complete REFACTOR phase guide covering common refactorings, when to skip, rollback procedures, and anti-patterns |
| `resources/refactor-checklist.md` | Quick reference checklist for REFACTOR phase completion |
| `resources/common-refactorings.md` | Catalog of common refactoring patterns (extract variable, extract function, rename, simplify conditionals) |
| `resources/when-to-skip-refactoring.md` | Decision guide for when refactoring should be deferred or skipped entirely |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/tdd-refactor-phase/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
After a test passes (GREEN phase complete), load .claude/skills/tdd-refactor-phase/SKILL.md.
Evaluate the code for refactoring opportunities -- duplication, unclear names, complex conditionals.
Apply refactorings one at a time, running the full test suite after each change.
If any test breaks, roll back immediately. Use when-to-skip-refactoring.md to avoid premature abstraction.
```

## Customization

- Extend `common-refactorings.md` with refactoring patterns specific to your codebase (e.g., extracting shared middleware, normalizing API response shapes)
- Adjust skip criteria in `when-to-skip-refactoring.md` to reflect your team's tolerance for tech debt versus iteration speed
- Add project-specific rollback instructions (e.g., "use git stash" or "revert last commit") to the checklist

## How IDPF Projects Use This

In IDPF projects, the tdd-refactor-phase skill is a default skill loaded automatically after the GREEN phase succeeds, completing the RED-GREEN-REFACTOR cycle before the next behavior is implemented. The approach above replicates that behavior for any Claude Code project.

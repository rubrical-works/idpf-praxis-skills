# Using tdd-red-phase Without IDPF Framework
Guide experienced developers through the RED phase of TDD -- writing failing tests and verifying expected failures.
## What's Included
| File | Purpose |
|------|---------|
| `SKILL.md` | Complete RED phase guide covering test identification, failure verification, anti-patterns, and checklists |
| `resources/red-phase-checklist.md` | Quick reference checklist for RED phase completion |
| `resources/test-structure-patterns.md` | Common test structure patterns (AAA, framework-specific syntax) |
| `resources/failure-verification-guide.md` | How to verify test failures correctly and distinguish real failures from errors |
## Quick Start
1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/tdd-red-phase/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:
```
When writing new tests or starting a TDD cycle, load .claude/skills/tdd-red-phase/SKILL.md.
Always write a failing test first, run it to verify the failure, and confirm the failure message
indicates missing implementation -- not a syntax error or test setup problem.
Use the failure verification guide in resources/ to distinguish correct failures from incorrect ones.
```
## Customization
- Update `test-structure-patterns.md` to include only the test frameworks your project uses
- Adjust naming conventions in the checklist to match your team's standards
- Add project-specific test file location conventions to the structure patterns
## How IDPF Projects Use This
In IDPF projects, the tdd-red-phase skill is a default skill loaded automatically during the RED phase of TDD story implementation triggered by `/work`. The approach above replicates that behavior for any Claude Code project.

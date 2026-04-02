# Using tdd-green-phase Without IDPF Framework
## What's Included
| File | Purpose |
|------|---------|
| `SKILL.md` | Complete GREEN phase guide covering minimal implementation, YAGNI, triangulation, and anti-patterns |
| `resources/green-phase-checklist.md` | Quick reference checklist for GREEN phase completion |
| `resources/minimal-implementation-guide.md` | How to identify the minimum code needed to pass a test |
| `resources/triangulation-examples.md` | When and how to use triangulation to drive generalization |
## Quick Start
1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/tdd-green-phase/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:
```
When implementing code to make a failing test pass, load .claude/skills/tdd-green-phase/SKILL.md.
Write only the minimum code required to turn the test green. Do not add features, optimizations,
or error handling that no test currently requires. Use the minimal implementation guide in resources/
to avoid over-engineering. If uncertain how to generalize, use triangulation.
```
## Customization
- Extend `triangulation-examples.md` with examples in your project's primary language
- Adjust the minimal implementation guide's thresholds based on your team's comfort with hard-coded values as stepping stones
- Add notes about project-specific patterns (e.g., "our services always need dependency injection") to the checklist
## How IDPF Projects Use This
In IDPF projects, tdd-green-phase is a default skill loaded automatically during the GREEN phase of TDD story implementation, immediately after a RED phase test is verified as failing. The approach above replicates that behavior for any Claude Code project.

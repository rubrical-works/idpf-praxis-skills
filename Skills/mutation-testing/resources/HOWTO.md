# Using mutation-testing Without IDPF Framework
Guide developers through mutation testing to assess and improve test suite quality.
## What's Included
| File | Purpose |
|------|---------|
| `SKILL.md` | Complete mutation testing guide covering operators, score interpretation, framework setup, and best practices |
| `resources/operator-guide.md` | Detailed mutation operator reference across languages |
| `resources/score-interpretation.md` | Understanding and improving mutation scores |
| `resources/framework-examples.md` | Framework-specific setup and usage for Stryker, mutmut, PIT, and others |
## Quick Start
1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/mutation-testing/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:
```
When assessing test suite quality, evaluating test effectiveness, or setting up mutation testing,
load and follow the guidance in .claude/skills/mutation-testing/SKILL.md and its resources/.
Use the operator guide to select appropriate mutation operators for the language in use,
and refer to the score interpretation guide when analyzing results.
```
## Customization
- Adjust score thresholds in `score-interpretation.md` to match your team's quality bar
- Add or remove mutation operators in `operator-guide.md` based on your language and tooling
- Extend `framework-examples.md` with your specific tool configuration
## How IDPF Projects Use This
In IDPF projects, the mutation-testing skill is loaded as a reference skill when the developer invokes testing-related work or explicitly requests mutation testing guidance. The approach above replicates that behavior for any Claude Code project.

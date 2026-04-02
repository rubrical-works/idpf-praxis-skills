# Using anti-pattern-analysis Without IDPF Framework

Structured guidance for identifying common anti-patterns across languages, architectures, and testing practices — with code review checklists and refactoring approaches.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Detection workflow, severity classification, and review procedures |
| `resources/code-review-checklist.md` | Systematic checklist for code review sessions |
| `resources/general-anti-patterns.md` | Cross-language anti-patterns (god class, spaghetti code, etc.) |
| `resources/architecture-anti-patterns.md` | Structural and architectural anti-patterns |
| `resources/database-anti-patterns.md` | Database design and query anti-patterns |
| `resources/testing-anti-patterns.md` | Testing anti-patterns and test smell detection |
| `resources/language-specific/` | Language-specific anti-patterns (JS, Python, etc.) |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via `px-manager` or by placing it in `.claude/skills/anti-pattern-analysis/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
During code reviews, read .claude/skills/anti-pattern-analysis/SKILL.md and its resources/ directory.
Apply the detection workflow and severity classification when reviewing code:

- Use resources/code-review-checklist.md as a systematic review guide
- Check resources/general-anti-patterns.md for cross-language issues
- Check resources/architecture-anti-patterns.md for structural problems
- Check resources/testing-anti-patterns.md for test smells
- Load language-specific resources matching the project's tech stack
- Report findings with severity level and suggested refactoring approach
```

## Customization

The resources are self-contained markdown files. You can:

- **Add checklists** — create new files in `resources/` for project-specific patterns
- **Adjust severity** — modify classification thresholds in your rule text
- **Scope narrowly** — reference only the resource files relevant to your stack
- **Add language files** — extend `resources/language-specific/` for additional languages

## How IDPF Projects Use This

In IDPF projects, the `/code-review` command and review workflows automatically load this skill's resources from `.claude/skills/anti-pattern-analysis/` during code review sessions. The approach above replicates that behavior for any Claude Code project.

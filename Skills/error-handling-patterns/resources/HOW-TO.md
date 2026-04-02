# Using error-handling-patterns Without IDPF Framework

Consistent error handling guidance including error hierarchy design, API error responses, and logging integration across multiple languages.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Core principles, error audiences, and implementation workflow |
| `resources/hierarchy-patterns.md` | Error class hierarchies and custom exception design |
| `resources/api-errors.md` | API error response formats, status codes, and contracts |
| `resources/logging-integration.md` | Error logging strategies and monitoring integration |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via `px-manager` or by placing it in `.claude/skills/error-handling-patterns/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When implementing error handling, read .claude/skills/error-handling-patterns/SKILL.md and its resources/ directory.
Apply the patterns when designing or refactoring error handling:

- Use resources/hierarchy-patterns.md when creating error class hierarchies
- Use resources/api-errors.md when designing API error responses
- Use resources/logging-integration.md when setting up error logging
- Follow the core principles: fail fast, fail safely, be informative, be actionable, be consistent
```

## Customization

The resources are self-contained markdown files. You can:

- **Scope to your stack** — reference only the resource files matching your language/framework
- **Add patterns** — create new resource files for project-specific error conventions
- **Adjust API format** — adapt the API error response patterns to your existing contract
- **Extend logging** — modify the logging integration patterns for your observability stack

## How IDPF Projects Use This

In IDPF projects, framework commands automatically load this skill's resources from `.claude/skills/error-handling-patterns/` when error handling work is detected. The approach above replicates that behavior for any Claude Code project.

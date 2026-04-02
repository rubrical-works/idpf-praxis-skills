# Using api-versioning Without IDPF Framework

Guide API versioning decisions including strategy selection, deprecation workflows, backward compatibility patterns, and client migration planning.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Main guide covering versioning strategies, deprecation lifecycle, backward compatibility rules, and REST/GraphQL patterns |
| `resources/strategy-comparison.md` | Detailed analysis comparing URL path, query parameter, header, and media type versioning approaches |
| `resources/deprecation-workflow.md` | Step-by-step deprecation process with timelines, communication templates, and sunset procedures |
| `resources/compatibility-guide.md` | Backward compatibility patterns for safe vs. breaking changes with code examples |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/api-versioning/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When designing API versioning, planning breaking changes, writing deprecation
policies, or migrating clients between API versions, read
.claude/skills/api-versioning/SKILL.md first. Consult the resources/ files
for detailed strategy comparisons, deprecation workflows, and backward
compatibility patterns.
```

## Customization

- Edit `resources/deprecation-workflow.md` to match your organization's deprecation timeline (e.g., 3 months instead of 6 months notice period).
- Update `resources/strategy-comparison.md` with your team's chosen strategy and rationale so future decisions reference it.
- Add organization-specific header names or versioning conventions to `resources/compatibility-guide.md` if you use custom API headers.

## How IDPF Projects Use This

In IDPF projects, this skill is loaded on demand when working on API design issues or when a proposal/PRD involves versioned endpoints. The framework reads `SKILL.md` into context to guide strategy selection and loads the relevant resource file for deeper reference. The approach above replicates that behavior for any Claude Code project.

# Using api-versioning Without IDPF Framework
Guide API versioning decisions including strategy selection, deprecation workflows, backward compatibility patterns, and client migration planning.
## What's Included
| File | Purpose |
|------|---------|
| `SKILL.md` | Main guide: versioning strategies, deprecation lifecycle, backward compatibility, REST/GraphQL patterns |
| `resources/strategy-comparison.md` | Detailed comparison of URL path, query parameter, header, and media type approaches |
| `resources/deprecation-workflow.md` | Step-by-step deprecation process with timelines and communication templates |
| `resources/compatibility-guide.md` | Backward compatibility patterns for safe vs. breaking changes with code examples |
## Quick Start
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
- Edit `resources/deprecation-workflow.md` to match your organization's deprecation timeline
- Update `resources/strategy-comparison.md` with your team's chosen strategy and rationale
- Add organization-specific header names or versioning conventions to `resources/compatibility-guide.md`
## How IDPF Projects Use This
In IDPF projects, this skill is loaded on demand when working on API design issues or when a proposal/PRD involves versioned endpoints. The framework reads `SKILL.md` into context and loads relevant resource files for deeper reference.

# Using migration-patterns Without IDPF Framework

Guide database migration best practices including schema versioning strategies, rollback procedures, and zero-downtime migration patterns for production environments.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Main guide covering versioning strategies, migration file structure, rollback procedures, zero-downtime patterns, and ORM-agnostic guidance |
| `resources/versioning-strategies.md` | Detailed comparison of sequential, timestamp, and hybrid versioning approaches with team-size recommendations |
| `resources/rollback-guide.md` | Comprehensive rollback procedures including safe rollback patterns, data-preserving rollbacks, and rollback testing scripts |
| `resources/zero-downtime.md` | Zero-downtime migration patterns: expand-contract, large table migrations, online schema changes, and concurrent index creation |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/migration-patterns/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When planning database schema changes, writing migration files, implementing
rollback procedures, or performing production migrations, read
.claude/skills/migration-patterns/SKILL.md first. Consult the resources/ files
for detailed versioning comparisons, rollback procedures, and zero-downtime
strategies.
```

## Customization

- Edit `resources/versioning-strategies.md` to document your team's chosen naming convention and migration tool (Knex, Prisma, Flyway, etc.).
- Update `resources/rollback-guide.md` with your organization's rollback policy (e.g., forward-only vs. reversible) and approval process.
- Adjust thresholds in `resources/zero-downtime.md` for batch sizes and lock timeout limits based on your database size and traffic patterns.

## How IDPF Projects Use This

In IDPF projects, this skill is loaded on demand when working on database-related issues or when stories involve schema changes. The framework reads `SKILL.md` into context and loads the relevant resource file based on the specific migration task (versioning setup, rollback planning, or zero-downtime deployment). The approach above replicates that behavior for any Claude Code project.

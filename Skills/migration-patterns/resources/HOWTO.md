# Using migration-patterns Without IDPF Framework
Guide database migration best practices including schema versioning strategies, rollback procedures, and zero-downtime migration patterns for production environments.
## What's Included
| File | Purpose |
|------|---------|
| `SKILL.md` | Main guide: versioning strategies, migration file structure, rollback procedures, zero-downtime patterns, ORM-agnostic guidance |
| `resources/versioning-strategies.md` | Comparison of sequential, timestamp, and hybrid versioning with team-size recommendations |
| `resources/rollback-guide.md` | Rollback procedures: safe patterns, data-preserving rollbacks, testing scripts |
| `resources/zero-downtime.md` | Zero-downtime patterns: expand-contract, large table migrations, concurrent index creation |
## Quick Start
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
- Edit `resources/versioning-strategies.md` to document your team's chosen naming convention and migration tool (Knex, Prisma, Flyway, etc.)
- Update `resources/rollback-guide.md` with your organization's rollback policy and approval process
- Adjust thresholds in `resources/zero-downtime.md` for batch sizes and lock timeout limits based on your database size and traffic patterns
## How IDPF Projects Use This
In IDPF projects, this skill is loaded on demand when working on database-related issues or when stories involve schema changes. The framework reads `SKILL.md` into context and loads the relevant resource file based on the specific migration task. The approach above replicates that behavior for any Claude Code project.

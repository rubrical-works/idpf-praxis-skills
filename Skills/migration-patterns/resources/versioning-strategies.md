# Schema Versioning Strategies
**Version:** v0.4.0

Detailed comparison of migration versioning approaches.

## Strategy Comparison

| Strategy | Team Size | Merge Conflicts | Tooling Support |
|----------|-----------|-----------------|-----------------|
| Sequential | Solo/Small | High | Universal |
| Timestamp | Medium/Large | Low | Most tools |
| Hybrid | Enterprise | Low | Some tools |
| Hash-based | Any | None | Limited |

## Sequential Numbering

### Format
```
001_initial_schema.sql
002_add_users.sql
003_add_orders.sql
```

### Implementation

```bash
# Get next migration number
LAST=$(ls migrations/*.sql | tail -1 | grep -o '[0-9]*' | head -1)
NEXT=$(printf "%03d" $((LAST + 1)))
touch "migrations/${NEXT}_description.sql"
```

### When to Use
- Solo projects
- Small teams with clear communication
- Projects with infrequent migrations
- Learning environments

### Handling Conflicts
When two developers create migrations with the same number:
1. Identify which migration was merged first
2. Renumber the conflicting migration
3. Test both migrations in sequence
4. Commit with updated number

## Timestamp-Based

### Format
```
20240115120000_initial_schema.sql
20240115143022_add_users.sql
20240116091500_add_orders.sql
```

### Implementation

```bash
# Generate timestamp-based migration filename
TIMESTAMP=$(date +%Y%m%d%H%M%S)
touch "migrations/${TIMESTAMP}_description.sql"
```

### When to Use
- Team projects
- Continuous deployment environments
- Projects with frequent migrations
- Distributed teams across timezones

### Timestamp Format Options

**Full precision:**
```
20240115143022  # YYYYMMDDHHmmss
```

**Date only (single migration per day):**
```
20240115  # YYYYMMDD
```

**With sequence for same day:**
```
20240115_1, 20240115_2  # YYYYMMDD_seq
```

## Hybrid Approach

### Format
```
V1.0.0__initial_schema.sql
V1.0.1__add_users.sql
V1.1.0__add_orders.sql
V2.0.0__major_refactor.sql
```

### Versioning Rules
- MAJOR: Breaking schema changes
- MINOR: New tables, additive changes
- PATCH: Fixes, index additions

### When to Use
- Enterprise environments
- Products with formal release cycles
- Compliance-required versioning
- Long-term maintenance projects

## Hash-Based (Content Addressable)

### Format
```
a1b2c3d4_initial_schema.sql  # Hash of content
e5f6g7h8_add_users.sql
```

### Implementation

```bash
# Generate hash from migration content
HASH=$(sha256sum migration.sql | cut -c1-8)
mv migration.sql "migrations/${HASH}_description.sql"
```

### When to Use
- Advanced teams
- CI/CD with content verification
- Immutable migration requirements

### Trade-offs
- Pros: No conflicts, content integrity
- Cons: Harder to understand order, limited tool support

## Dependency-Based

### Format
```yaml
# migration.yaml
id: add_orders
depends_on:
  - add_users
  - add_products
sql_file: add_orders.sql
```

### When to Use
- Complex schema dependencies
- Parallel migration development
- Modular database design

### Implementation Considerations
- Requires custom tooling or specific frameworks
- Topological sort for execution order
- Circular dependency detection needed

## Migration Tracking Table

All strategies should use a tracking table:

```sql
CREATE TABLE schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT NOW(),
    checksum VARCHAR(64),
    execution_time_ms INTEGER
);
```

### Query Applied Migrations

```sql
SELECT version, applied_at
FROM schema_migrations
ORDER BY applied_at;
```

### Detect Missing Migrations

```sql
-- In application: compare filesystem migrations with database
SELECT version FROM schema_migrations
EXCEPT
-- (list of migration files from filesystem)
```

## Choosing a Strategy

### Decision Matrix

| Factor | Sequential | Timestamp | Hybrid |
|--------|------------|-----------|--------|
| Team size 1-2 | Best | Good | Overkill |
| Team size 3-10 | Poor | Best | Good |
| Team size 10+ | Poor | Good | Best |
| CI/CD pipeline | Good | Best | Best |
| Compliance needs | Poor | Good | Best |
| Simplicity | Best | Good | Poor |

### Migration Checklist

Before choosing:
- [ ] How large is your team?
- [ ] How often do you deploy?
- [ ] Do you need audit trails?
- [ ] What tools does your framework support?
- [ ] Do you have compliance requirements?

---

**See SKILL.md for complete migration guidance**

---
name: migration-patterns
description: Guide developers through database migration best practices including versioning, rollbacks, and zero-downtime strategies
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: database
type: reference
relevantTechStack: [sql, postgresql, mysql, migrations, knex, prisma]
disable-model-invocation: true
copyright: "Rubrical Works (c) 2026"
---
# Migration Patterns
## When to Use This Skill
- Planning database schema changes
- Setting up migration workflow for a new project
- Implementing rollback procedures
- Performing migrations in production environments
- Dealing with large table migrations
## Prerequisites
- Database server running
- Migration tool installed (language/framework appropriate)
- Version control for migration files
- Understanding of current schema
## Schema Versioning Strategies
### Sequential Numbering
```
001_create_users_table.sql
002_add_email_to_users.sql
003_create_orders_table.sql
```
Pros: Simple, clear ordering. Cons: Merge conflicts in teams.
### Timestamp-Based
```
20240115120000_create_users_table.sql
20240115143022_add_email_to_users.sql
```
Pros: Reduces merge conflicts, supports team development. Cons: Longer filenames.
**When to use each:** Solo projects: Sequential. Team projects: Timestamp-based. Enterprise: Hybrid with release versions.
## Migration File Structure
### Standard Structure
```
migrations/
├── up/
│   ├── 001_create_users.sql
│   └── 002_add_indexes.sql
├── down/
│   ├── 001_drop_users.sql
│   └── 002_drop_indexes.sql
└── seed/
    └── initial_data.sql
```
### Self-Contained Structure
```
migrations/
├── 001_create_users/
│   ├── up.sql
│   └── down.sql
└── 002_add_indexes/
    ├── up.sql
    └── down.sql
```
### Migration File Contents
**Up migration:**
```sql
-- Migration: 001_create_users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
```
**Down migration:**
```sql
-- Rollback: 001_create_users
-- WARNING: Data will be lost
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users;
```
## Rollback Procedures
### Types of Rollbacks
**Forward-only (recommended for production):** Never delete data, fix issues with new migrations, maintains audit trail.
**Reversible:** Provide down migration for each up, allows rollback to any state, requires careful testing.
### Safe Rollback Pattern
```sql
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        RAISE EXCEPTION 'Cannot rollback: users table has data';
    END IF;
END $$;
DROP TABLE users;
```
### Data-Preserving Rollback
```sql
ALTER TABLE users RENAME TO users_backup_20240115;
CREATE VIEW users AS SELECT * FROM users_backup_20240115;
```
### Rollback Testing
1. Run up migration
2. Verify schema changes
3. Run down migration
4. Verify schema restored
5. Run up migration again
6. Verify final state
## Zero-Downtime Migrations
### Expand-Contract Pattern
1. **Expand** -- Add new column/table, keep old structure working, deploy application changes
2. **Migrate** -- Copy/transform data to new structure, run in batches if large
3. **Contract** -- Remove old column/table, clean up compatibility code
### Example: Renaming a Column
**Phase 1 - Add new column:**
```sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
UPDATE users SET full_name = name;
```
**Phase 2 - Sync trigger:**
```sql
CREATE OR REPLACE FUNCTION sync_name_columns()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.name IS DISTINCT FROM OLD.name THEN
            NEW.full_name = NEW.name;
        ELSIF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
            NEW.name = NEW.full_name;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_sync_name
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_name_columns();
```
**Phase 3 - Remove old column:**
```sql
DROP TRIGGER trg_sync_name ON users;
DROP FUNCTION sync_name_columns();
ALTER TABLE users DROP COLUMN name;
```
### Large Table Migrations
```sql
CREATE TABLE users_new (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Copy data in batches
INSERT INTO users_new (id, email, full_name, created_at)
SELECT id, email, name, created_at
FROM users WHERE id > $last_processed_id
ORDER BY id LIMIT 10000;
-- Swap tables
BEGIN;
ALTER TABLE users RENAME TO users_old;
ALTER TABLE users_new RENAME TO users;
COMMIT;
DROP TABLE users_old;
```
### Adding NOT NULL Constraint (Zero-Downtime)
```sql
-- Step 1: Add check constraint (not validated)
ALTER TABLE users
ADD CONSTRAINT users_email_not_null
CHECK (email IS NOT NULL) NOT VALID;
-- Step 2: Validate constraint (allows reads)
ALTER TABLE users
VALIDATE CONSTRAINT users_email_not_null;
-- Step 3: Convert to NOT NULL (instant, constraint proven)
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users DROP CONSTRAINT users_email_not_null;
```
### Adding Index Without Locking
```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```
**Note:** CONCURRENTLY takes longer and cannot run in a transaction.
## Migration Execution
### Pre-Migration Checklist
- [ ] Migration tested in staging environment
- [ ] Rollback tested and working
- [ ] Backup taken
- [ ] Team notified
- [ ] Monitoring in place
- [ ] Expected downtime communicated (if any)
### Execution Order
1. Take database backup
2. Run migration in staging
3. Verify staging
4. Run migration in production
5. Verify production
6. Update documentation
### Post-Migration Verification
```sql
\d table_name
SELECT COUNT(*) FROM table_name;
SELECT indexname FROM pg_indexes WHERE tablename = 'table_name';
SELECT conname FROM pg_constraint WHERE conrelid = 'table_name'::regclass;
```
## ORM-Agnostic Guidance
| Action | Raw SQL | ORM Equivalent |
|--------|---------|----------------|
| Create table | CREATE TABLE | create_table |
| Drop table | DROP TABLE | drop_table |
| Add column | ALTER TABLE ADD | add_column |
| Remove column | ALTER TABLE DROP | remove_column |
| Add index | CREATE INDEX | add_index |
| Remove index | DROP INDEX | remove_index |
### ORM Migration Tips
1. **Review generated SQL** -- ORMs may generate suboptimal migrations
2. **Use raw SQL for complex migrations** -- Better control
3. **Keep ORM migrations reversible** -- Define both up and down
4. **Test migrations with production-like data** -- Performance matters
## Relationship to Other Skills
- `postgresql-integration` -- Database-specific guidance
- `sqlite-integration` -- Lighter-weight database patterns

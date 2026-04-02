# Rollback Guide
**Version:** v0.4.0

Comprehensive procedures for database migration rollbacks.

## Rollback Philosophy

### Forward-Only vs Reversible

**Forward-Only (Production Recommended):**
- Never delete data
- Fix issues with new migrations
- Maintains complete audit trail
- Simpler mental model

**Reversible (Development/Staging):**
- Each migration has up/down
- Can return to any previous state
- Requires careful maintenance
- More complex testing

## Writing Rollback Scripts

### Safe Rollback Template

```sql
-- Rollback: [migration_name]
-- Original: [up_migration_file]
-- Author: [author]
-- Date: [date]
-- WARNING: [any data loss warnings]

-- Pre-rollback checks
DO $$
BEGIN
    -- Verify rollback is safe
    -- Add custom checks here
END $$;

-- Rollback operations
-- [SQL statements]

-- Post-rollback verification
-- [Verification queries]
```

### Common Rollback Patterns

**Drop table (only if empty or data migrated):**
```sql
-- Check for data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM table_name LIMIT 1) THEN
        RAISE EXCEPTION 'Cannot drop table_name: contains data';
    END IF;
END $$;

DROP TABLE table_name;
```

**Remove column (preserve data):**
```sql
-- Backup column data first
CREATE TABLE column_backup AS
SELECT id, column_name FROM table_name;

-- Remove column
ALTER TABLE table_name DROP COLUMN column_name;
```

**Remove index:**
```sql
DROP INDEX IF EXISTS index_name;
```

**Remove constraint:**
```sql
ALTER TABLE table_name DROP CONSTRAINT IF EXISTS constraint_name;
```

## Rollback Testing

### Test Procedure

```bash
#!/bin/bash
# rollback_test.sh

set -e  # Exit on error

echo "Step 1: Apply migration"
migrate up

echo "Step 2: Verify up migration"
# Add verification queries

echo "Step 3: Apply rollback"
migrate down

echo "Step 4: Verify rollback"
# Add verification queries

echo "Step 5: Re-apply migration"
migrate up

echo "Step 6: Final verification"
# Add final verification

echo "Rollback test passed!"
```

### Verification Queries

```sql
-- Verify table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'table_name'
);

-- Verify column exists
SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'table_name'
    AND column_name = 'column_name'
);

-- Verify index exists
SELECT EXISTS (
    SELECT FROM pg_indexes
    WHERE indexname = 'index_name'
);

-- Verify constraint exists
SELECT EXISTS (
    SELECT FROM pg_constraint
    WHERE conname = 'constraint_name'
);
```

## Rollback Scenarios

### Scenario 1: Migration Failed Mid-Way

**Problem:** Migration partially applied, database in inconsistent state.

**Solution:**
1. Identify what was applied
2. Manually reverse applied changes
3. Fix migration script
4. Re-run migration

```sql
-- Check current state
SELECT * FROM schema_migrations ORDER BY applied_at DESC LIMIT 5;

-- Manually verify table/column state
\d affected_table
```

### Scenario 2: Data Corruption Detected

**Problem:** Migration corrupted existing data.

**Solution:**
1. Stop application traffic
2. Restore from backup to point-in-time
3. Fix migration script
4. Re-run migration
5. Resume traffic

```bash
# PostgreSQL point-in-time recovery
pg_restore --target-time="2024-01-15 10:00:00" backup.dump
```

### Scenario 3: Performance Degradation

**Problem:** Migration caused performance issues (bad index, missing index).

**Solution:**
1. Identify problematic change
2. Create fix migration (don't rollback)
3. Apply fix migration
4. Monitor performance

```sql
-- Example: Add missing index
CREATE INDEX CONCURRENTLY idx_fix ON table_name(column);
```

### Scenario 4: Application Incompatibility

**Problem:** Application cannot work with new schema.

**Solution:**
1. Rollback application deployment
2. Rollback migration if safe
3. Fix application code
4. Re-deploy both together

## Partial Rollbacks

### Rolling Back Specific Changes

```sql
-- Rollback only specific parts of a migration
-- Example: Keep new table, rollback column changes

-- This was added and works fine, keep it:
-- CREATE TABLE new_feature (...);

-- This caused problems, rollback:
ALTER TABLE users DROP COLUMN problematic_column;
```

### Creating Compensating Migration

```sql
-- compensating_001_fix_users.sql
-- Compensates for issues in 001_add_users.sql

-- Remove problematic constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS problematic_constraint;

-- Add correct constraint
ALTER TABLE users ADD CONSTRAINT correct_constraint ...;
```

## Production Rollback Checklist

### Before Rollback
- [ ] Confirm rollback is necessary
- [ ] Backup current database state
- [ ] Notify team of planned rollback
- [ ] Stop application traffic if needed
- [ ] Document reason for rollback

### During Rollback
- [ ] Execute rollback script
- [ ] Monitor for errors
- [ ] Verify each step completed
- [ ] Check database consistency

### After Rollback
- [ ] Verify application functionality
- [ ] Run integration tests
- [ ] Resume application traffic
- [ ] Document what happened
- [ ] Create incident report
- [ ] Plan fix for next attempt

## Rollback Limitations

### Cannot Rollback

Some changes cannot be safely rolled back:

- **Data destruction:** `DROP TABLE`, `DELETE`, `TRUNCATE`
- **Data type narrowing:** VARCHAR(100) -> VARCHAR(50)
- **Precision loss:** Decimal precision reduction

### Mitigation Strategies

1. **Never destroy data in migrations** - Use soft delete or archiving
2. **Test with production-like data** - Catch issues before production
3. **Backup before migration** - Always have recovery option
4. **Use expand-contract** - Never destructive changes

---

**See SKILL.md for complete migration guidance**

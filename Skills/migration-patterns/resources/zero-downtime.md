# Zero-Downtime Migration Patterns
**Version:** v0.4.0

Patterns for migrating database schemas without service interruption.

## Core Principle

**Never make a change that breaks the current application version.**

Each migration must be compatible with:
- Current application version (before deploy)
- New application version (after deploy)

## Expand-Contract Pattern

### Overview

```
Phase 1: EXPAND (Add)    → New structure added, old still works
Phase 2: MIGRATE         → Data moved/transformed
Phase 3: CONTRACT (Remove) → Old structure removed
```

### Timeline

```
Day 1: Deploy Expand Migration
Day 1: Deploy Application (reads both old and new)
Day 2: Run Data Migration
Day 3: Deploy Application (reads only new)
Day 3: Deploy Contract Migration
```

### Example: Splitting a Column

**Goal:** Split `full_name` into `first_name` and `last_name`

**Phase 1 - Expand:**
```sql
-- Add new columns
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);

-- Populate from existing data
UPDATE users SET
    first_name = SPLIT_PART(full_name, ' ', 1),
    last_name = SPLIT_PART(full_name, ' ', 2);

-- Application now reads from full_name, writes to both
```

**Phase 2 - Sync Trigger:**
```sql
-- Keep columns in sync during transition
CREATE OR REPLACE FUNCTION sync_name_split()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
        NEW.first_name = SPLIT_PART(NEW.full_name, ' ', 1);
        NEW.last_name = SPLIT_PART(NEW.full_name, ' ', 2);
    ELSIF NEW.first_name IS DISTINCT FROM OLD.first_name
       OR NEW.last_name IS DISTINCT FROM OLD.last_name THEN
        NEW.full_name = NEW.first_name || ' ' || NEW.last_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_names
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_name_split();
```

**Phase 3 - Contract:**
```sql
-- After application uses only new columns
DROP TRIGGER sync_names ON users;
DROP FUNCTION sync_name_split();
ALTER TABLE users DROP COLUMN full_name;
```

## Adding Non-Nullable Column

### Wrong Way (Causes Lock)

```sql
-- This locks the table!
ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
```

### Right Way (Zero-Downtime)

**Step 1: Add nullable column**
```sql
ALTER TABLE users ADD COLUMN status VARCHAR(20);
```

**Step 2: Backfill in batches**
```sql
-- Process in batches to avoid long locks
DO $$
DECLARE
    batch_size INT := 10000;
    max_id INT;
    current_id INT := 0;
BEGIN
    SELECT MAX(id) INTO max_id FROM users;

    WHILE current_id < max_id LOOP
        UPDATE users
        SET status = 'active'
        WHERE id > current_id
        AND id <= current_id + batch_size
        AND status IS NULL;

        current_id := current_id + batch_size;

        -- Small pause to reduce load
        PERFORM pg_sleep(0.1);
    END LOOP;
END $$;
```

**Step 3: Add constraint**
```sql
-- Add constraint as NOT VALID (instant)
ALTER TABLE users
ADD CONSTRAINT users_status_not_null
CHECK (status IS NOT NULL) NOT VALID;

-- Validate constraint (allows concurrent access)
ALTER TABLE users VALIDATE CONSTRAINT users_status_not_null;
```

**Step 4: Convert to NOT NULL**
```sql
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
ALTER TABLE users DROP CONSTRAINT users_status_not_null;
```

## Renaming Tables/Columns

### Renaming a Table

**Phase 1: Create new table with view**
```sql
-- Create new table
CREATE TABLE orders_new (LIKE orders INCLUDING ALL);

-- Copy data
INSERT INTO orders_new SELECT * FROM orders;

-- Rename original
ALTER TABLE orders RENAME TO orders_deprecated;

-- Create view for old name
CREATE VIEW orders AS SELECT * FROM orders_new;
```

**Phase 2: After application updated**
```sql
DROP VIEW orders;
ALTER TABLE orders_new RENAME TO orders;
DROP TABLE orders_deprecated;
```

### Renaming a Column

**Phase 1: Add alias view**
```sql
-- Add new column
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);
UPDATE users SET email_address = email;

-- Sync trigger
CREATE OR REPLACE FUNCTION sync_email()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.email IS NOT NULL AND NEW.email_address IS NULL THEN
            NEW.email_address = NEW.email;
        ELSIF NEW.email_address IS NOT NULL AND NEW.email IS NULL THEN
            NEW.email = NEW.email_address;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.email IS DISTINCT FROM OLD.email THEN
            NEW.email_address = NEW.email;
        ELSIF NEW.email_address IS DISTINCT FROM OLD.email_address THEN
            NEW.email = NEW.email_address;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_email
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_email();
```

**Phase 2: Clean up**
```sql
DROP TRIGGER trg_sync_email ON users;
DROP FUNCTION sync_email();
ALTER TABLE users DROP COLUMN email;
```

## Large Table Operations

### Online Index Creation

```sql
-- CONCURRENTLY allows reads/writes during creation
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**Limitations:**
- Cannot run in transaction
- Takes longer than regular index
- May fail and leave invalid index

**Check for invalid indexes:**
```sql
SELECT indexrelid::regclass
FROM pg_index
WHERE NOT indisvalid;
```

### Online Table Restructure

**Using pg_repack (extension):**
```sql
-- Reorganize table without exclusive lock
SELECT pg_repack.repack('users');
```

**Manual approach:**
```sql
-- Create new table
CREATE TABLE users_new (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    -- new schema
    created_at TIMESTAMP DEFAULT NOW()
);

-- Copy in batches
INSERT INTO users_new (id, email, created_at)
SELECT id, email, created_at
FROM users
WHERE id BETWEEN $start AND $end;

-- Swap tables (brief lock)
BEGIN;
ALTER TABLE users RENAME TO users_old;
ALTER TABLE users_new RENAME TO users;
COMMIT;

-- Clean up later
DROP TABLE users_old;
```

## Constraint Changes

### Adding Foreign Key

**Wrong (locks both tables):**
```sql
ALTER TABLE orders
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES users(id);
```

**Right (zero-downtime):**
```sql
-- Add constraint without validation (instant)
ALTER TABLE orders
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES users(id)
NOT VALID;

-- Validate (no exclusive lock)
ALTER TABLE orders VALIDATE CONSTRAINT fk_user;
```

### Adding Check Constraint

```sql
-- Add without validation
ALTER TABLE users
ADD CONSTRAINT chk_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
NOT VALID;

-- Validate separately
ALTER TABLE users VALIDATE CONSTRAINT chk_email_format;
```

## Monitoring During Migration

### Watch for Locks

```sql
SELECT
    pid,
    usename,
    query_start,
    state,
    wait_event_type,
    wait_event,
    query
FROM pg_stat_activity
WHERE state != 'idle'
AND pid != pg_backend_pid()
ORDER BY query_start;
```

### Check Table Bloat

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

### Monitor Replication Lag

```sql
SELECT
    client_addr,
    state,
    sent_lsn - replay_lsn AS replication_lag
FROM pg_stat_replication;
```

## Checklist for Zero-Downtime Migrations

### Before Migration
- [ ] Migration tested in staging with production-like data
- [ ] Rollback plan documented
- [ ] Monitoring dashboards ready
- [ ] Team notified

### During Migration
- [ ] Watch for lock contention
- [ ] Monitor replication lag
- [ ] Check application errors
- [ ] Verify data integrity

### After Migration
- [ ] Confirm all phases complete
- [ ] Clean up temporary objects
- [ ] Update documentation
- [ ] Monitor for 24 hours

---

**See SKILL.md for complete migration guidance**

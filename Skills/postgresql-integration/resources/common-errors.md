# PostgreSQL Common Errors
**Version:** v0.4.0

Troubleshooting guide for frequently encountered PostgreSQL errors.

## Connection Errors

### ECONNREFUSED

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causes:**
- PostgreSQL server not running
- Wrong host or port
- Firewall blocking connection

**Solutions:**
1. Start PostgreSQL server:
   ```bash
   # Linux
   sudo systemctl start postgresql

   # macOS
   brew services start postgresql
   ```

2. Verify server is listening:
   ```bash
   netstat -an | grep 5432
   ```

3. Check postgresql.conf for listen_addresses

### ETIMEDOUT

**Error:**
```
Error: connect ETIMEDOUT
```

**Causes:**
- Network connectivity issue
- Firewall rules
- Server overloaded

**Solutions:**
1. Test network connectivity:
   ```bash
   ping db-host
   telnet db-host 5432
   ```

2. Increase connection timeout:
   ```
   ?connect_timeout=30
   ```

3. Check cloud provider security groups

### Authentication Failed

**Error:**
```
FATAL: password authentication failed for user "username"
```

**Causes:**
- Wrong password
- User doesn't exist
- pg_hba.conf configuration

**Solutions:**
1. Verify credentials:
   ```bash
   psql -h host -U user -d database
   ```

2. Check user exists:
   ```sql
   SELECT usename FROM pg_user;
   ```

3. Review pg_hba.conf:
   ```
   # IPv4 local connections:
   host    all    all    127.0.0.1/32    md5
   ```

### SSL Required

**Error:**
```
FATAL: no pg_hba.conf entry for host "x.x.x.x", SSL off
```

**Causes:**
- Server requires SSL but client not using it

**Solutions:**
1. Add sslmode to connection string:
   ```
   ?sslmode=require
   ```

2. Or update pg_hba.conf to allow non-SSL (not recommended for production)

## Query Errors

### Syntax Error

**Error:**
```
ERROR: syntax error at or near "..."
```

**Causes:**
- Invalid SQL syntax
- Missing quotes or parentheses
- Reserved keyword used as identifier

**Solutions:**
1. Check SQL syntax carefully
2. Quote identifiers with double quotes:
   ```sql
   SELECT "order" FROM "table"
   ```
3. Use SQL validator/linter

### Relation Does Not Exist

**Error:**
```
ERROR: relation "tablename" does not exist
```

**Causes:**
- Table doesn't exist
- Wrong schema
- Case sensitivity issue

**Solutions:**
1. List tables:
   ```sql
   \dt
   -- or
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

2. Check current schema:
   ```sql
   SHOW search_path;
   ```

3. Use fully qualified name:
   ```sql
   SELECT * FROM schema_name.table_name;
   ```

### Column Does Not Exist

**Error:**
```
ERROR: column "columnname" does not exist
```

**Causes:**
- Typo in column name
- Column doesn't exist in table
- Case sensitivity

**Solutions:**
1. List columns:
   ```sql
   \d tablename
   -- or
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'tablename';
   ```

2. Use exact case with quotes if needed:
   ```sql
   SELECT "ColumnName" FROM table;
   ```

## Constraint Violations

### Unique Violation

**Error:**
```
ERROR: duplicate key value violates unique constraint "constraint_name"
```

**Causes:**
- Inserting duplicate value for unique column
- Race condition in concurrent inserts

**Solutions:**
1. Use ON CONFLICT:
   ```sql
   INSERT INTO users (email, name)
   VALUES ($1, $2)
   ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;
   ```

2. Check for existing record first (with proper locking)

### Foreign Key Violation

**Error:**
```
ERROR: insert or update on table "x" violates foreign key constraint "fk_y"
```

**Causes:**
- Referenced record doesn't exist
- Trying to delete parent with children

**Solutions:**
1. Ensure parent record exists:
   ```sql
   SELECT id FROM parent_table WHERE id = $1;
   ```

2. For deletes, use CASCADE or delete children first:
   ```sql
   -- Option 1: Define with CASCADE
   FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE CASCADE

   -- Option 2: Delete children first
   DELETE FROM children WHERE parent_id = $1;
   DELETE FROM parent WHERE id = $1;
   ```

### Not Null Violation

**Error:**
```
ERROR: null value in column "column" violates not-null constraint
```

**Causes:**
- Required column not provided
- NULL explicitly passed

**Solutions:**
1. Provide value for required column
2. Set default in schema:
   ```sql
   ALTER TABLE t ALTER COLUMN c SET DEFAULT 'default_value';
   ```

## Performance Issues

### Query Timeout

**Error:**
```
ERROR: canceling statement due to statement timeout
```

**Causes:**
- Query taking too long
- Missing indexes
- Lock contention

**Solutions:**
1. Analyze query:
   ```sql
   EXPLAIN ANALYZE your_query;
   ```

2. Add appropriate indexes

3. Increase timeout (temporary):
   ```sql
   SET statement_timeout = '60s';
   ```

### Too Many Connections

**Error:**
```
FATAL: too many connections for role "user"
```

**Causes:**
- Connection pool exhausted
- Connections not being released
- Too many application instances

**Solutions:**
1. Implement connection pooling
2. Ensure connections are returned to pool
3. Increase max_connections in postgresql.conf
4. Use PgBouncer for connection multiplexing

### Out of Memory

**Error:**
```
ERROR: out of memory
```

**Causes:**
- Query using too much memory
- Large result set
- Complex operations

**Solutions:**
1. Use LIMIT to reduce result size
2. Process in batches
3. Increase work_mem (carefully):
   ```sql
   SET work_mem = '256MB';
   ```
4. Optimize query to reduce memory usage

## Transaction Errors

### Serialization Failure

**Error:**
```
ERROR: could not serialize access due to concurrent update
```

**Causes:**
- Concurrent transactions modifying same rows
- Using SERIALIZABLE isolation

**Solutions:**
1. Implement retry logic
2. Use lower isolation level if acceptable
3. Reduce transaction scope/duration

### Deadlock Detected

**Error:**
```
ERROR: deadlock detected
```

**Causes:**
- Two transactions waiting for each other's locks

**Solutions:**
1. Access tables in consistent order
2. Keep transactions short
3. Implement retry logic
4. Use NOWAIT or SKIP LOCKED when appropriate

---

**See SKILL.md for complete integration guidance**

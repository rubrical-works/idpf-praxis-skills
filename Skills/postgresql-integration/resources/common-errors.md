# PostgreSQL Common Errors
**Version:** v0.12.3
## Connection Errors
### ECONNREFUSED
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Causes:** Server not running, wrong host/port, firewall blocking.
```bash
# Linux
sudo systemctl start postgresql
# macOS
brew services start postgresql
# Verify
netstat -an | grep 5432
```
Check `postgresql.conf` for `listen_addresses`.
### ETIMEDOUT
```
Error: connect ETIMEDOUT
```
**Causes:** Network issue, firewall rules, server overloaded.
```bash
ping db-host
telnet db-host 5432
```
Increase timeout: `?connect_timeout=30`. Check cloud provider security groups.
### Authentication Failed
```
FATAL: password authentication failed for user "username"
```
**Causes:** Wrong password, user doesn't exist, pg_hba.conf config.
```bash
psql -h host -U user -d database
```
```sql
SELECT usename FROM pg_user;
```
Review `pg_hba.conf`:
```
host    all    all    127.0.0.1/32    md5
```
### SSL Required
```
FATAL: no pg_hba.conf entry for host "x.x.x.x", SSL off
```
Add `?sslmode=require` to connection string.
## Query Errors
### Syntax Error
```
ERROR: syntax error at or near "..."
```
**Causes:** Invalid SQL, missing quotes/parentheses, reserved keyword as identifier.
```sql
SELECT "order" FROM "table"  -- quote reserved keywords
```
### Relation Does Not Exist
```
ERROR: relation "tablename" does not exist
```
**Causes:** Table doesn't exist, wrong schema, case sensitivity.
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
SHOW search_path;
SELECT * FROM schema_name.table_name;  -- fully qualified
```
### Column Does Not Exist
```
ERROR: column "columnname" does not exist
```
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tablename';
SELECT "ColumnName" FROM table;  -- exact case
```
## Constraint Violations
### Unique Violation
```
ERROR: duplicate key value violates unique constraint "constraint_name"
```
```sql
INSERT INTO users (email, name)
VALUES ($1, $2)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;
```
### Foreign Key Violation
```
ERROR: insert or update on table "x" violates foreign key constraint "fk_y"
```
Ensure parent record exists, or use CASCADE:
```sql
FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE CASCADE
-- Or delete children first
DELETE FROM children WHERE parent_id = $1;
DELETE FROM parent WHERE id = $1;
```
### Not Null Violation
```
ERROR: null value in column "column" violates not-null constraint
```
Provide value for required column or set default:
```sql
ALTER TABLE t ALTER COLUMN c SET DEFAULT 'default_value';
```
## Performance Issues
### Query Timeout
```
ERROR: canceling statement due to statement timeout
```
```sql
EXPLAIN ANALYZE your_query;  -- analyze
SET statement_timeout = '60s';  -- increase (temporary)
```
Add appropriate indexes.
### Too Many Connections
```
FATAL: too many connections for role "user"
```
- Implement connection pooling
- Ensure connections are returned to pool
- Increase `max_connections` in postgresql.conf
- Use PgBouncer for connection multiplexing
### Out of Memory
```
ERROR: out of memory
```
- Use LIMIT to reduce result size
- Process in batches
- Increase `work_mem` carefully: `SET work_mem = '256MB';`
- Optimize query to reduce memory usage
## Transaction Errors
### Serialization Failure
```
ERROR: could not serialize access due to concurrent update
```
- Implement retry logic
- Use lower isolation level if acceptable
- Reduce transaction scope/duration
### Deadlock Detected
```
ERROR: deadlock detected
```
- Access tables in consistent order
- Keep transactions short
- Implement retry logic
- Use NOWAIT or SKIP LOCKED when appropriate

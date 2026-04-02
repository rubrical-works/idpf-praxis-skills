---
name: postgresql-integration
description: Guide developers through PostgreSQL setup, connection configuration, query patterns, and best practices
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: database
relevantTechStack: [postgresql, sql, node, python, pg]
copyright: "Rubrical Works (c) 2026"
---
# PostgreSQL Integration
Guides developers through PostgreSQL database integration including connection setup, query patterns, transaction handling, and connection pooling.
## When to Use This Skill
- Setting up PostgreSQL connection in a new project
- Implementing database queries and operations
- Configuring connection pooling (pgbouncer, etc.)
- Handling transactions
- Troubleshooting common PostgreSQL issues
- Using PostgreSQL with ORMs (Sequelize, Prisma)
## Prerequisites
- PostgreSQL server installed and running
- Database credentials available
- Appropriate client library for your language
## Connection Setup
### Connection String Format
```
postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]
```
- `user` - Database username
- `password` - Database password (consider environment variables)
- `host` - Server hostname (default: localhost)
- `port` - Server port (default: 5432)
- `dbname` - Database name
### Security Best Practices
**NEVER hardcode credentials in source code.**
Recommended approaches:
1. Environment variables
2. Configuration files (not committed to version control)
3. Secret management services
```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```
### SSL/TLS Configuration
| Mode | Description |
|------|-------------|
| `disable` | No SSL |
| `allow` | Try SSL, fall back to non-SSL |
| `prefer` | Try SSL first (default) |
| `require` | Require SSL, no verification |
| `verify-ca` | Require SSL with CA verification |
| `verify-full` | Require SSL with full verification |
## Query Patterns
**ALWAYS use parameterized queries to prevent SQL injection.**
```
# CORRECT - Parameterized
SELECT * FROM users WHERE id = $1
# WRONG - String interpolation (vulnerable)
SELECT * FROM users WHERE id = {user_id}
```
### Common Operations
```sql
-- SELECT with filtering
SELECT column1, column2 FROM table_name
WHERE condition ORDER BY column1 LIMIT 100;
-- INSERT with returning
INSERT INTO table_name (column1, column2)
VALUES ($1, $2) RETURNING id;
-- UPDATE with conditions
UPDATE table_name
SET column1 = $1, updated_at = NOW()
WHERE id = $2 RETURNING *;
-- DELETE with confirmation
DELETE FROM table_name WHERE id = $1 RETURNING id;
```
### Batch Operations
```sql
INSERT INTO table_name (column1, column2)
VALUES ($1, $2), ($3, $4), ($5, $6);
-- Large datasets
COPY table_name FROM STDIN WITH (FORMAT csv);
```
## Transaction Handling
```sql
BEGIN;
-- operations
COMMIT;
-- or ROLLBACK; if error
```
### Transaction Isolation Levels
| Level | Dirty Read | Non-repeatable Read | Phantom Read |
|-------|------------|---------------------|--------------|
| READ UNCOMMITTED | Possible | Possible | Possible |
| READ COMMITTED | Not possible | Possible | Possible |
| REPEATABLE READ | Not possible | Not possible | Possible |
| SERIALIZABLE | Not possible | Not possible | Not possible |
**PostgreSQL default:** READ COMMITTED
```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```
### Savepoints
```sql
BEGIN;
INSERT INTO table1 ...;
SAVEPOINT my_savepoint;
INSERT INTO table2 ...;  -- might fail
ROLLBACK TO SAVEPOINT my_savepoint;
INSERT INTO table2 ...;  -- retry
COMMIT;
```
### Best Practices
1. **Keep transactions short** - Long transactions block other operations
2. **Handle errors explicitly** - Always have rollback logic
3. **Use appropriate isolation** - Higher isolation = more overhead
4. **Avoid user interaction** - Never wait for user input mid-transaction
## Connection Pooling
Opening connections is expensive (TCP handshake, authentication, memory allocation). Pools maintain open connections for reuse.
**Key parameters:**
- `min_connections` - Minimum connections to maintain
- `max_connections` - Maximum connections allowed
- `connection_timeout` - Time to wait for available connection
- `idle_timeout` - Time before closing idle connection
- `max_lifetime` - Maximum connection lifetime
### Sizing Guidelines
```
max_connections = (core_count * 2) + effective_spindle_count
# SSD: max_connections = core_count * 2
```
**Monitor:** Active connections, idle connections, wait time, connection errors, pool exhaustion events.
## Error Handling
### Common Error Categories
**Connection errors:**
- `ECONNREFUSED` - Server not running or wrong host/port
- `ETIMEDOUT` - Network issue or firewall blocking
- `authentication failed` - Wrong credentials
**Query errors:**
- `syntax error` - Invalid SQL
- `relation does not exist` - Table/view not found
- `column does not exist` - Invalid column reference
- `duplicate key` - Unique constraint violation
- `foreign key violation` - Referential integrity error
### Error Handling Pattern
```
try:
    execute query
catch connection_error:
    retry with backoff
catch constraint_violation:
    handle business logic
catch syntax_error:
    log and fix query
finally:
    return connection to pool
```
### Retry Strategy
1. Wait with exponential backoff
2. Maximum retry count (e.g., 3 attempts)
3. Log each retry attempt
4. Fail after max retries
## Performance Tips
### Indexing
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
```
Create indexes for: WHERE clauses, JOIN conditions, ORDER BY columns.
### Query Analysis
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```
Look for: sequential scans on large tables, high cost estimates, actual vs estimated row counts.
## Resources
- `resources/setup-guide.md` - Detailed setup instructions
- `resources/query-patterns.md` - Additional query examples
- `resources/common-errors.md` - Error troubleshooting guide
## Related Skills
- `sqlite-integration` - Lighter-weight alternative for simpler needs
- `migration-patterns` - Schema versioning and changes

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
Guide for PostgreSQL integration: connection setup, query patterns, transactions, and pooling.
## When to Use
- Setting up PostgreSQL in a new project
- Implementing DB queries/operations
- Configuring connection pooling (pgbouncer)
- Handling transactions
- Troubleshooting PostgreSQL issues
- Using PostgreSQL with ORMs (Sequelize, Prisma)
## Prerequisites
- PostgreSQL server running
- Credentials available
- Client library for your language
## Responsibility Acknowledgement Gate
Implements `responsibility-gate` skill (`Skills/responsibility-gate/SKILL.md`).
- **Fires before:** installing clients (`pg`, `psycopg2`) and adding connection/pooling/query code.
- **Asks:** acceptance of changes to manifest/lockfile, source files, env (e.g., `DATABASE_URL`).
- **Decline:** exit cleanly; "Declined — no changes made."
- **Persistence:** per-invocation, never persisted.
Use `AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`.
## Connection Setup
### Connection String
```
postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]
```
Defaults: host=localhost, port=5432.
### Security
**NEVER hardcode credentials.** Use: env vars, config files (not committed), secret services.
```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```
### SSL/TLS
```
?sslmode=require
?sslmode=verify-ca
?sslmode=verify-full
```
**Modes:** `disable`, `allow`, `prefer` (default), `require`, `verify-ca`, `verify-full`.
## Query Patterns
### Parameterized Queries
**ALWAYS use parameterized queries.**
```
# CORRECT
SELECT * FROM users WHERE id = $1
# WRONG (SQL injection)
SELECT * FROM users WHERE id = {user_id}
```
### Common Operations
```sql
SELECT column1, column2 FROM table_name WHERE condition ORDER BY column1 LIMIT 100;
INSERT INTO table_name (column1, column2) VALUES ($1, $2) RETURNING id;
UPDATE table_name SET column1 = $1, updated_at = NOW() WHERE id = $2 RETURNING *;
DELETE FROM table_name WHERE id = $1 RETURNING id;
```
### Batch
```sql
INSERT INTO table_name (column1, column2) VALUES ($1, $2), ($3, $4), ($5, $6);
```
Large datasets: `COPY table_name FROM STDIN WITH (FORMAT csv);`
## Transaction Handling
```sql
BEGIN;
-- operations
COMMIT;
-- or ROLLBACK;
```
### Isolation Levels
| Level | Dirty Read | Non-repeatable Read | Phantom Read |
|-------|------------|---------------------|--------------|
| READ UNCOMMITTED | Possible | Possible | Possible |
| READ COMMITTED | Not possible | Possible | Possible |
| REPEATABLE READ | Not possible | Not possible | Possible |
| SERIALIZABLE | Not possible | Not possible | Not possible |
**Default:** READ COMMITTED.
```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```
### Savepoints
```sql
BEGIN;
INSERT INTO table1 ...;
SAVEPOINT my_savepoint;
INSERT INTO table2 ...;
ROLLBACK TO SAVEPOINT my_savepoint;
INSERT INTO table2 ...;
COMMIT;
```
### Best Practices
1. Keep transactions short
2. Handle errors with rollback
3. Use appropriate isolation (higher = more overhead)
4. Never wait for user input mid-transaction
## Connection Pooling
Opening connections is expensive (TCP handshake, auth, memory). Pools reuse connections.
### Pool Parameters
- `min_connections`, `max_connections`
- `connection_timeout`, `idle_timeout`, `max_lifetime`
### Sizing
```
max_connections = (core_count * 2) + effective_spindle_count
# SSD:
max_connections = core_count * 2
```
Monitor usage, adjust for load, account for all app instances.
### Monitoring
Active/idle connections, wait time, errors, exhaustion events.
## Error Handling
### Common Errors
- **Connection:** `ECONNREFUSED` (server/host), `ETIMEDOUT` (network/firewall), `authentication failed`
- **Query:** `syntax error`, `relation does not exist`, `column does not exist`, `duplicate key`, `foreign key violation`
### Pattern
```
try:
    execute query
catch connection_error: retry with backoff
catch constraint_violation: handle business logic
catch syntax_error: log and fix
finally: return connection to pool
```
### Retry
Exponential backoff, max 3 attempts, log retries, fail after max.
## Performance
### Indexing
Index columns in WHERE, JOIN, ORDER BY.
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
```
### Query Analysis
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```
Watch for: sequential scans on large tables, high cost, actual vs estimated rows.
### Connection Tips
- Close or return to pool promptly
- Use pooling in production
- Set timeouts, monitor count
## Resources
- `resources/setup-guide.md`
- `resources/query-patterns.md`
- `resources/common-errors.md`
## Relationship to Other Skills
**Complements:** `sqlite-integration`, `migration-patterns`.
**Independent from:** TDD skills.

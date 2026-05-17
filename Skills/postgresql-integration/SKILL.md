---
name: postgresql-integration
description: Guide developers through PostgreSQL setup, connection configuration, query patterns, and best practices
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: database
relevantTechStack: [postgresql, sql, node, python, pg]
copyright: "Rubrical Works (c) 2026"
---
# PostgreSQL Integration
Guides developers through PostgreSQL database integration: connection setup, query patterns, transaction handling, connection pooling.
## Step 0 — Re-read Config (MANDATORY)
Read `resources/postgresql-integration.config.json` from disk and validate against `resources/postgresql-integration.config.schema.json` at start of every invocation. Config is source of truth for default host/port, env-var name (`DATABASE_URL`), connection-string format, SSL mode list, per-language client libraries (Node `pg`, Python `psycopg2-binary`) with install commands, ORM options, pgbouncer convention. SKILL.md must not duplicate values.
## When to Use This Skill
Invoke when:
- Setting up PostgreSQL connection in a new project
- Implementing database queries and operations
- Configuring connection pooling (pgbouncer)
- Handling transactions
- Troubleshooting common PostgreSQL issues
- Using PostgreSQL with ORMs (Sequelize, Prisma)
## Prerequisites
- PostgreSQL server installed and running
- Database credentials available
- Appropriate client library for your language
## Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before installing PostgreSQL client libraries (e.g., `pg`, `psycopg2`) and modifying the project to add database connection configuration, pooling, and query code.
- **What is asked:** acceptance of responsibility for change to package manifest/lockfile, source files (connection/query code), and environment configuration (`DATABASE_URL`).
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
## Connection Setup
### Connection String Format
`postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]`
**Components:** `user` (username), `password` (consider env vars), `host` (default: localhost), `port` (default: 5432), `dbname`.
### Security Best Practices
**NEVER hardcode credentials in source code.** Recommended: Environment variables; Configuration files (not committed); Secret management services. Example: `DATABASE_URL=postgresql://user:password@localhost:5432/mydb`
### SSL/TLS Configuration
For production: `?sslmode=require`, `?sslmode=verify-ca`, `?sslmode=verify-full`
**SSL modes:**
- `disable` - No SSL
- `allow` - Try SSL, fall back to non-SSL
- `prefer` - Try SSL first (default)
- `require` - Require SSL, no verification
- `verify-ca` - Require SSL with CA verification
- `verify-full` - Require SSL with full verification
## Query Patterns
### Parameterized Queries
**ALWAYS use parameterized queries to prevent SQL injection.**
```
# CORRECT - Parameterized
SELECT * FROM users WHERE id = $1

# WRONG - String interpolation (vulnerable to SQL injection)
SELECT * FROM users WHERE id = {user_id}
```
### Common Operations
- **SELECT with filtering:** `SELECT col1, col2 FROM table WHERE condition ORDER BY col1 LIMIT 100;`
- **INSERT with returning:** `INSERT INTO table (col1, col2) VALUES ($1, $2) RETURNING id;`
- **UPDATE with conditions:** `UPDATE table SET col1 = $1, updated_at = NOW() WHERE id = $2 RETURNING *;`
- **DELETE with confirmation:** `DELETE FROM table WHERE id = $1 RETURNING id;`
### Batch Operations
Multiple inserts: `INSERT INTO table (col1, col2) VALUES ($1,$2), ($3,$4), ($5,$6);`. Large datasets: `COPY table FROM STDIN WITH (FORMAT csv);`.
## Transaction Handling
### Transaction Basics
`BEGIN; -- operations COMMIT;` (or `ROLLBACK;` on error).
### Transaction Isolation Levels
| Level | Dirty | Non-repeatable | Phantom |
|-------|---|---|---|
| READ UNCOMMITTED | Possible | Possible | Possible |
| READ COMMITTED | No | Possible | Possible |
| REPEATABLE READ | No | No | Possible |
| SERIALIZABLE | No | No | No |
**PostgreSQL default:** READ COMMITTED. **Set:** `BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;`
### Savepoints
Partial rollbacks: `BEGIN; INSERT INTO table1 ...; SAVEPOINT my_savepoint; INSERT INTO table2 ...; ROLLBACK TO SAVEPOINT my_savepoint; INSERT INTO table2 ...; COMMIT;`
### Best Practices
1. **Keep transactions short** - Long transactions block other operations
2. **Handle errors explicitly** - Always have rollback logic
3. **Use appropriate isolation** - Higher isolation = more overhead
4. **Avoid user interaction** - Never wait for user input mid-transaction
## Connection Pooling
### Why Connection Pooling
Opening database connections is expensive (TCP handshake, authentication, memory allocation). Pools maintain open connections for reuse.
### Pool Configuration
**Key parameters:**
- `min_connections` - Minimum to maintain
- `max_connections` - Maximum allowed
- `connection_timeout` - Time to wait for available connection
- `idle_timeout` - Time before closing idle connection
- `max_lifetime` - Maximum connection lifetime
### Sizing Guidelines
**Starting point:** `max_connections = (core_count * 2) + effective_spindle_count`
For SSD-based systems: `max_connections = core_count * 2`
**Considerations:** Monitor connection usage in production; adjust based on actual load patterns; account for all application instances.
### Pool Health Monitoring
Monitor: active connections, idle connections, wait time for connections, connection errors, pool exhaustion events.
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
For transient errors: wait with exponential backoff; maximum retry count (e.g., 3); log each retry; fail after max retries.
## Performance Tips
### Indexing
Create indexes for: columns used in WHERE clauses; columns used in JOIN conditions; columns used in ORDER BY.
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
```
### Query Analysis
Use `EXPLAIN ANALYZE` to understand query execution:
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```
Look for: sequential scans on large tables (may need index); high cost estimates; actual vs estimated row counts.
### Connection Considerations
- Close connections promptly (or return to pool)
- Use connection pooling in production
- Set appropriate timeouts
- Monitor connection count
## Resources
See `resources/` directory for:
- `setup-guide.md` - Detailed setup instructions
- `query-patterns.md` - Additional query examples
- `common-errors.md` - Error troubleshooting guide
## Relationship to Other Skills
**Complements:** `sqlite-integration` (lighter alternative); `migration-patterns` (schema versioning).
**Independent from:** TDD skills — this skill focuses on database integration, not testing.
## Expected Outcome
After using this skill: PostgreSQL connection configured securely; queries use parameterized inputs; transactions handled appropriately; connection pooling configured for production; common errors can be diagnosed and resolved.
---
**End of PostgreSQL Integration Skill**

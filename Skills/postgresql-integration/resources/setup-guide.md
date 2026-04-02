# PostgreSQL Setup Guide
**Version:** v0.5.0

Detailed instructions for setting up PostgreSQL connections in different environments.

## Environment Setup

### 1. Install PostgreSQL Client Library

**Python:**
```bash
pip install psycopg2-binary
# or for async
pip install asyncpg
```

**Node.js:**
```bash
npm install pg
# or for pooling
npm install pg-pool
```

**Ruby:**
```bash
gem install pg
```

**Go:**
```bash
go get github.com/lib/pq
# or
go get github.com/jackc/pgx/v5
```

### 2. Configure Environment Variables

Create a `.env` file (add to `.gitignore`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PGUSER=myuser
PGPASSWORD=mypassword
PGHOST=localhost
PGPORT=5432
PGDATABASE=mydb
```

### 3. Verify Connection

**Command line:**
```bash
psql -h localhost -U myuser -d mydb -c "SELECT 1"
```

**Expected output:**
```
 ?column?
----------
        1
(1 row)
```

## Connection Configuration Options

### Basic Connection Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| host | Server hostname | localhost |
| port | Server port | 5432 |
| database | Database name | (required) |
| user | Username | (required) |
| password | Password | (required) |

### Advanced Parameters

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| connect_timeout | Connection timeout (seconds) | 10 |
| application_name | Identifier in pg_stat_activity | Your app name |
| options | Server options | - |
| sslmode | SSL mode | require (production) |

## Production Configuration

### SSL Certificate Setup

1. Obtain SSL certificates from your hosting provider
2. Configure paths:
```
?sslmode=verify-full&sslrootcert=/path/to/ca.crt&sslcert=/path/to/client.crt&sslkey=/path/to/client.key
```

### Connection Pooling Setup

**Recommended pool settings:**
```
min_connections: 2
max_connections: 10
idle_timeout: 30000
connection_timeout: 5000
```

**Calculate max connections:**
```
Available connections = PostgreSQL max_connections - reserved_connections
Per-instance pool = Available connections / number_of_app_instances
```

### Health Check Query

Use a simple query for connection validation:
```sql
SELECT 1
```

Or for more thorough validation:
```sql
SELECT current_database(), current_user, version()
```

## Troubleshooting Connection Issues

### Cannot Connect

1. **Check PostgreSQL is running:**
   ```bash
   # Linux
   sudo systemctl status postgresql

   # macOS
   brew services list | grep postgresql
   ```

2. **Verify pg_hba.conf allows your connection:**
   ```bash
   # Location varies by OS
   sudo cat /etc/postgresql/*/main/pg_hba.conf
   ```

3. **Check firewall rules:**
   ```bash
   # Port 5432 should be open
   telnet localhost 5432
   ```

### Authentication Failed

1. Verify username and password
2. Check user exists: `\du` in psql
3. Verify database exists: `\l` in psql
4. Check pg_hba.conf authentication method

### Connection Timeout

1. Increase connect_timeout parameter
2. Check network connectivity
3. Verify server is not overloaded
4. Check for firewall blocking

---

**See SKILL.md for complete integration guidance**

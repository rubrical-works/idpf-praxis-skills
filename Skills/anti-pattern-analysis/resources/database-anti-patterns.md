# Database Anti-Patterns
**Version:** v0.15.0

SQL, ORM, and data access issues that affect performance and maintainability.

---

## N+1 Query Problem

**Description:** Executing N additional queries to fetch related data for N results.

**Symptoms:**
- Slow page loads with many database records
- Query count grows with data size
- "Works fine in dev, slow in production"
- Hundreds/thousands of queries for simple operations

**Example (Bad):**
```python
# 1 query to get users
users = User.objects.all()

# N queries - one per user
for user in users:
    print(user.orders.count())  # Each access triggers a query
```

```sql
-- This generates:
SELECT * FROM users;
SELECT COUNT(*) FROM orders WHERE user_id = 1;
SELECT COUNT(*) FROM orders WHERE user_id = 2;
SELECT COUNT(*) FROM orders WHERE user_id = 3;
-- ... hundreds more
```

**Refactoring:**
```python
# Django - prefetch related data
users = User.objects.prefetch_related('orders').all()

# Or use annotation for counts
users = User.objects.annotate(order_count=Count('orders'))
for user in users:
    print(user.order_count)  # No additional queries
```

```python
# SQLAlchemy - eager loading
users = session.query(User).options(joinedload(User.orders)).all()
```

**Severity:** Critical

---

## SELECT * Anti-Pattern

**Description:** Fetching all columns when only some are needed.

**Symptoms:**
- Large result sets consuming memory
- Slow queries over network
- Breaking changes when columns added
- Fetching BLOBs unnecessarily

**Example (Bad):**
```sql
SELECT * FROM users WHERE status = 'active';
-- Returns 50 columns including profile_image BLOB
-- when you only need name and email
```

```python
# ORM version
users = User.objects.filter(status='active')  # Fetches all columns
```

**Refactoring:**
```sql
SELECT id, name, email FROM users WHERE status = 'active';
```

```python
# Django - only specific fields
users = User.objects.filter(status='active').only('id', 'name', 'email')

# Or values for dictionary results
users = User.objects.filter(status='active').values('id', 'name', 'email')
```

**Severity:** Medium

---

## Implicit Column Insert

**Description:** INSERT without explicit column list.

**Symptoms:**
- Breaks when table schema changes
- Order-dependent values
- Hard to read and maintain
- Silent data corruption

**Example (Bad):**
```sql
INSERT INTO users VALUES (1, 'John', 'john@example.com', 'active', NOW());
-- What if someone adds a column in position 3?
```

**Refactoring:**
```sql
INSERT INTO users (id, name, email, status, created_at)
VALUES (1, 'John', 'john@example.com', 'active', NOW());
```

**Severity:** Medium

---

## Missing Indexes

**Description:** Frequently queried columns without indexes.

**Symptoms:**
- Full table scans on large tables
- Slow WHERE/JOIN/ORDER BY operations
- Query performance degrades with data growth
- High CPU usage on database server

**Example (Bad):**
```sql
-- Table with millions of rows, no index on email
SELECT * FROM users WHERE email = 'john@example.com';
-- Full table scan every time

-- No index on foreign key
SELECT * FROM orders WHERE user_id = 123;
-- Another full table scan
```

**Detection:**
```sql
-- PostgreSQL - find missing indexes
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
-- Look for "Seq Scan" on large tables

-- MySQL
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
-- Look for type: ALL (full table scan)
```

**Refactoring:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Composite index for common query patterns
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

**Severity:** High

---

## Entity-Attribute-Value (EAV)

**Description:** Storing attributes as rows instead of columns for "flexibility."

**Symptoms:**
- Complex queries for simple data retrieval
- No type safety or constraints
- Poor query performance
- Difficult to understand schema

**Example (Bad):**
```sql
-- EAV table structure
CREATE TABLE user_attributes (
    user_id INT,
    attribute_name VARCHAR(100),
    attribute_value TEXT
);

-- Data stored as:
-- user_id | attribute_name | attribute_value
-- 1       | first_name     | John
-- 1       | last_name      | Doe
-- 1       | email          | john@example.com
-- 1       | age            | 30

-- Query to get user details:
SELECT
    MAX(CASE WHEN attribute_name = 'first_name' THEN attribute_value END) as first_name,
    MAX(CASE WHEN attribute_name = 'last_name' THEN attribute_value END) as last_name,
    MAX(CASE WHEN attribute_name = 'email' THEN attribute_value END) as email
FROM user_attributes
WHERE user_id = 1
GROUP BY user_id;
```

**Refactoring:**
```sql
-- Proper relational design
CREATE TABLE users (
    id INT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    age INT
);

-- For truly dynamic attributes, use JSON columns (PostgreSQL/MySQL 5.7+)
CREATE TABLE users (
    id INT PRIMARY KEY,
    first_name VARCHAR(100),
    email VARCHAR(255),
    custom_attributes JSONB  -- For genuinely variable data
);
```

**When EAV Might Be Acceptable:**
- User-defined custom fields
- Product variants with different attributes
- Survey/form responses

**Severity:** High

---

## Soft Deletes Everywhere

**Description:** Never actually deleting data, marking as deleted instead.

**Symptoms:**
- Every query needs `WHERE deleted_at IS NULL`
- Growing table sizes
- Complex unique constraints
- Forgotten filter in one query shows "deleted" data

**Example (Bad):**
```python
class User(Model):
    deleted_at = DateTimeField(null=True)

# Every single query must remember this
User.objects.filter(deleted_at__isnull=True, ...)
User.objects.filter(deleted_at__isnull=True, ...)
User.objects.filter(deleted_at__isnull=True, ...)
# Someone forgets, deleted users appear in reports
```

**Refactoring:**
```python
# Option 1: Custom manager with default filter
class UserManager(Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

class User(Model):
    objects = UserManager()
    all_objects = Manager()  # When you need to see deleted

# Option 2: Archive to separate table
def delete_user(user_id):
    user = User.objects.get(id=user_id)
    ArchivedUser.objects.create(**user.__dict__)
    user.delete()  # Actually delete

# Option 3: Use soft deletes only where required (compliance, audit)
# and hard deletes everywhere else
```

**Severity:** Medium

---

## God Table

**Description:** Single table with too many columns, often nullable.

**Symptoms:**
- Table with 50+ columns
- Many NULL values
- Columns like `field1`, `field2`, `extra_data`
- Different row types in same table
- Wide rows affecting performance

**Example (Bad):**
```sql
CREATE TABLE entities (
    id INT PRIMARY KEY,
    type VARCHAR(50),  -- 'user', 'company', 'product'

    -- User fields
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    password_hash VARCHAR(255),

    -- Company fields
    company_name VARCHAR(255),
    tax_id VARCHAR(50),
    industry VARCHAR(100),

    -- Product fields
    product_name VARCHAR(255),
    price DECIMAL(10,2),
    sku VARCHAR(50),

    -- Generic overflow
    extra_field1 TEXT,
    extra_field2 TEXT,
    extra_field3 TEXT,
    -- ... 30 more columns
);
```

**Refactoring:**
```sql
-- Separate tables per entity type
CREATE TABLE users (
    id INT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    password_hash VARCHAR(255)
);

CREATE TABLE companies (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    tax_id VARCHAR(50),
    industry VARCHAR(100)
);

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10,2),
    sku VARCHAR(50)
);
```

**Severity:** High

---

## String Concatenation for SQL

**Description:** Building SQL queries by concatenating strings with user input.

**Symptoms:**
- SQL injection vulnerabilities
- String building with `+` or f-strings
- No parameterized queries
- Security audit failures

**Example (Bad):**
```python
# DANGEROUS - SQL Injection vulnerability
def get_user(email):
    query = "SELECT * FROM users WHERE email = '" + email + "'"
    return db.execute(query)

# Also bad - f-strings
def get_user(email):
    query = f"SELECT * FROM users WHERE email = '{email}'"
    return db.execute(query)

# Attack: email = "'; DROP TABLE users; --"
```

**Refactoring:**
```python
# Parameterized query
def get_user(email):
    query = "SELECT * FROM users WHERE email = %s"
    return db.execute(query, (email,))

# ORM (preferred)
def get_user(email):
    return User.objects.get(email=email)

# SQLAlchemy
def get_user(email):
    return session.query(User).filter(User.email == email).first()
```

**Severity:** Critical

---

## No Transaction Management

**Description:** Multiple related operations without transaction boundaries.

**Symptoms:**
- Partial updates on failure
- Inconsistent data states
- "Half-completed" operations
- Data integrity issues

**Example (Bad):**
```python
def transfer_money(from_account, to_account, amount):
    # If this succeeds...
    from_account.balance -= amount
    from_account.save()

    # ...but this fails, money disappears!
    to_account.balance += amount
    to_account.save()  # Could fail here
```

**Refactoring:**
```python
from django.db import transaction

def transfer_money(from_account, to_account, amount):
    with transaction.atomic():
        from_account.balance -= amount
        from_account.save()

        to_account.balance += amount
        to_account.save()
        # Both succeed or both rollback
```

```python
# SQLAlchemy
def transfer_money(from_account, to_account, amount):
    try:
        from_account.balance -= amount
        to_account.balance += amount
        session.commit()
    except:
        session.rollback()
        raise
```

**Severity:** High

---

## Storing Lists as Comma-Separated Values

**Description:** Storing multiple values in a single column as delimited string.

**Symptoms:**
- Can't query individual values efficiently
- No referential integrity
- Complex parsing logic
- No foreign key relationships

**Example (Bad):**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    roles VARCHAR(255)  -- Stored as: "admin,editor,viewer"
);

-- Querying is painful
SELECT * FROM users WHERE roles LIKE '%admin%';
-- Matches "administrator" too! And no index usage.
```

**Refactoring:**
```sql
-- Proper many-to-many relationship
CREATE TABLE roles (
    id INT PRIMARY KEY,
    name VARCHAR(50) UNIQUE
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(id),
    role_id INT REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Clean query
SELECT u.* FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'admin';
```

**Severity:** High

---

## Over-Normalization

**Description:** Excessive normalization causing too many JOINs.

**Symptoms:**
- Simple queries require 5+ JOINs
- Performance issues on reads
- Overly complex data model
- Every attribute in separate table

**Example (Bad):**
```sql
-- Storing an address
SELECT
    a.id,
    sn.name as street_name,
    st.name as street_type,
    c.name as city,
    s.name as state,
    co.name as country,
    z.code as zip
FROM addresses a
JOIN street_names sn ON a.street_name_id = sn.id
JOIN street_types st ON a.street_type_id = st.id
JOIN cities c ON a.city_id = c.id
JOIN states s ON c.state_id = s.id
JOIN countries co ON s.country_id = co.id
JOIN zip_codes z ON a.zip_id = z.id;
```

**Refactoring:**
```sql
-- Denormalize where appropriate
CREATE TABLE addresses (
    id INT PRIMARY KEY,
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20)
);

-- Only normalize if:
-- 1. Data changes frequently and must stay consistent
-- 2. You need to query by that attribute often
-- 3. There's significant storage savings
```

**Severity:** Medium

---

## Database as Message Queue

**Description:** Using database tables for job queues and messaging.

**Symptoms:**
- Polling table for new "jobs"
- Lock contention on queue table
- Growing table with processed records
- Complex status management

**Example (Bad):**
```sql
CREATE TABLE job_queue (
    id INT PRIMARY KEY,
    payload TEXT,
    status VARCHAR(20),  -- 'pending', 'processing', 'done', 'failed'
    created_at TIMESTAMP,
    processed_at TIMESTAMP
);

-- Workers poll constantly
SELECT * FROM job_queue WHERE status = 'pending' LIMIT 1 FOR UPDATE;
UPDATE job_queue SET status = 'processing' WHERE id = ?;
```

**Refactoring:**
- Use proper message queue (Redis, RabbitMQ, SQS)
- If must use database, use SKIP LOCKED (PostgreSQL)
- Consider pg_notify for PostgreSQL
- Implement proper cleanup of processed jobs

```python
# Use Celery with Redis/RabbitMQ
@celery.task
def process_job(payload):
    # Process the job
    pass

# Enqueue
process_job.delay(payload)
```

**Severity:** Medium

---

## CRUD Stored Procedures for Everything

**Description:** Creating stored procedures for every basic operation.

**Symptoms:**
- `sp_InsertUser`, `sp_UpdateUser`, `sp_DeleteUser`, `sp_GetUser`
- Business logic split between app and database
- Difficult to test
- Deployment complexity

**Example (Bad):**
```sql
CREATE PROCEDURE sp_GetUserById(IN p_id INT)
BEGIN
    SELECT * FROM users WHERE id = p_id;
END;

CREATE PROCEDURE sp_InsertUser(IN p_name VARCHAR(100), IN p_email VARCHAR(255))
BEGIN
    INSERT INTO users (name, email) VALUES (p_name, p_email);
END;

-- 4 more procedures for each table...
```

**When Stored Procedures ARE Appropriate:**
- Complex reports with multiple queries
- Data migrations
- Database-level security requirements
- Performance-critical batch operations

**Refactoring:**
- Use ORM for basic CRUD
- Keep business logic in application
- Use stored procedures only for complex database operations

**Severity:** Low

---

## Detection Checklist

- [ ] Query count grows with data size (N+1)
- [ ] SELECT * in production queries
- [ ] INSERTs without column lists
- [ ] Full table scans on large tables (Missing Indexes)
- [ ] Pivot queries to extract attributes (EAV)
- [ ] `deleted_at IS NULL` in every query (Soft Deletes)
- [ ] Tables with 30+ columns (God Table)
- [ ] String concatenation building SQL (Injection Risk)
- [ ] Multiple DB operations without transaction
- [ ] Comma-separated values in columns
- [ ] 5+ JOINs for simple data (Over-Normalization)
- [ ] Polling tables for job queues

---

**End of Database Anti-Patterns**

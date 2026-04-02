# PostgreSQL Query Patterns
**Version:** v0.4.0

Common query patterns and best practices for PostgreSQL.

## CRUD Operations

### Create (INSERT)

**Single row:**
```sql
INSERT INTO users (name, email, created_at)
VALUES ($1, $2, NOW())
RETURNING id, created_at;
```

**Multiple rows:**
```sql
INSERT INTO users (name, email)
VALUES
  ($1, $2),
  ($3, $4),
  ($5, $6)
RETURNING id;
```

**Insert or update (upsert):**
```sql
INSERT INTO users (email, name, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW()
RETURNING id;
```

### Read (SELECT)

**Basic select with filtering:**
```sql
SELECT id, name, email, created_at
FROM users
WHERE status = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

**Join pattern:**
```sql
SELECT
  o.id AS order_id,
  o.total,
  u.name AS customer_name
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.created_at > $1;
```

**Aggregate with grouping:**
```sql
SELECT
  user_id,
  COUNT(*) AS order_count,
  SUM(total) AS total_spent
FROM orders
WHERE created_at >= $1
GROUP BY user_id
HAVING COUNT(*) > $2
ORDER BY total_spent DESC;
```

### Update

**Simple update:**
```sql
UPDATE users
SET
  name = $1,
  updated_at = NOW()
WHERE id = $2
RETURNING *;
```

**Conditional update:**
```sql
UPDATE orders
SET
  status = CASE
    WHEN total > 100 THEN 'priority'
    ELSE 'normal'
  END,
  updated_at = NOW()
WHERE status = 'pending';
```

### Delete

**Simple delete:**
```sql
DELETE FROM users
WHERE id = $1
RETURNING id;
```

**Delete with join condition:**
```sql
DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders
  WHERE status = 'cancelled'
  AND created_at < NOW() - INTERVAL '30 days'
);
```

## Advanced Patterns

### Pagination

**Offset-based (simple but slow for large offsets):**
```sql
SELECT * FROM items
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
```

**Cursor-based (more efficient):**
```sql
SELECT * FROM items
WHERE created_at < $1
ORDER BY created_at DESC
LIMIT $2;
```

### Full-Text Search

**Basic text search:**
```sql
SELECT *
FROM articles
WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1);
```

**With ranking:**
```sql
SELECT
  *,
  ts_rank(to_tsvector('english', title || ' ' || content), query) AS rank
FROM articles, plainto_tsquery('english', $1) query
WHERE to_tsvector('english', title || ' ' || content) @@ query
ORDER BY rank DESC;
```

### JSON Operations

**Query JSON field:**
```sql
SELECT * FROM events
WHERE data->>'type' = $1;
```

**Extract nested value:**
```sql
SELECT
  id,
  data->'user'->>'name' AS user_name
FROM events
WHERE data->'user'->>'id' = $1;
```

**Update JSON field:**
```sql
UPDATE users
SET settings = settings || '{"theme": "dark"}'::jsonb
WHERE id = $1;
```

### Common Table Expressions (CTE)

**Recursive query (e.g., organization hierarchy):**
```sql
WITH RECURSIVE org_tree AS (
  -- Base case
  SELECT id, name, parent_id, 1 AS depth
  FROM departments
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case
  SELECT d.id, d.name, d.parent_id, ot.depth + 1
  FROM departments d
  JOIN org_tree ot ON d.parent_id = ot.id
)
SELECT * FROM org_tree
ORDER BY depth, name;
```

### Batch Processing

**Process in batches:**
```sql
WITH batch AS (
  SELECT id
  FROM pending_jobs
  WHERE status = 'pending'
  ORDER BY priority DESC, created_at
  LIMIT $1
  FOR UPDATE SKIP LOCKED
)
UPDATE pending_jobs
SET status = 'processing', started_at = NOW()
WHERE id IN (SELECT id FROM batch)
RETURNING *;
```

## Query Optimization Tips

### Use EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 123
AND created_at > '2024-01-01';
```

### Index Recommendations

**Create indexes for:**
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY
- Foreign key columns

**Example:**
```sql
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC);
```

### Avoid These Patterns

**Functions on indexed columns:**
```sql
-- Bad: prevents index use
WHERE LOWER(email) = 'test@example.com'

-- Good: use expression index or store lowercase
WHERE email = 'test@example.com'
```

**Leading wildcards:**
```sql
-- Bad: full table scan
WHERE name LIKE '%smith'

-- Good: use full-text search instead
```

**OR with different columns:**
```sql
-- Bad: may not use indexes efficiently
WHERE email = $1 OR phone = $2

-- Good: use UNION
SELECT * FROM users WHERE email = $1
UNION
SELECT * FROM users WHERE phone = $2
```

---

**See SKILL.md for complete integration guidance**

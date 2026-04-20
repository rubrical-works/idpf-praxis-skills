# SQL Basics for Beginners
**Version:** v0.12.3
## What is SQL?
SQL (Structured Query Language) is the language used to talk to databases.
## The Four Main Operations (CRUD)
- **C**reate - Add new data
- **R**ead - Get existing data
- **U**pdate - Change existing data
- **D**elete - Remove data
## Basic SQL Commands
### CREATE TABLE
```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Column types:** `INTEGER` (whole numbers), `TEXT` (strings), `REAL` (decimals), `TIMESTAMP` (date/time)
**Constraints:**
- `PRIMARY KEY` - Unique identifier for each row
- `AUTOINCREMENT` - Automatically count up (1, 2, 3, ...)
- `NOT NULL` - Required field
- `DEFAULT value` - Use this value if none provided
### INSERT - Add New Data
```sql
INSERT INTO notes (text) VALUES ('Buy milk');
```
**With placeholder (safer):**
```sql
INSERT INTO notes (text) VALUES (?);
```
Pass actual text separately to prevent SQL injection.
### SELECT - Get Data
```sql
SELECT * FROM notes;                              -- Get all
SELECT id, text FROM notes;                       -- Specific columns
SELECT * FROM notes WHERE id = 5;                 -- With condition
SELECT * FROM notes ORDER BY created_at DESC;     -- Sorted (DESC=newest first, ASC=oldest first)
```
### UPDATE - Change Existing Data
```sql
UPDATE notes SET text = 'Buy bread' WHERE id = 5;
```
**Warning:** Always use WHERE or you'll update ALL rows!
### DELETE - Remove Data
```sql
DELETE FROM notes WHERE id = 5;
```
**Warning:** Without WHERE, deletes EVERYTHING!
## Common Patterns
```sql
SELECT * FROM notes WHERE text LIKE '%milk%';           -- Search (% = wildcard)
SELECT COUNT(*) FROM notes;                             -- Count rows
SELECT * FROM notes ORDER BY created_at DESC LIMIT 1;   -- Most recent
SELECT * FROM notes WHERE id = 5 OR id = 10;            -- Multiple with OR
SELECT * FROM notes WHERE text LIKE '%important%' AND created_at > '2024-01-01';  -- AND
```
## SQL Injection (Security!)
**NEVER do this:**
```python
text = request.form['note']
conn.execute(f"INSERT INTO notes (text) VALUES ('{text}')")
```
If user types `'); DROP TABLE notes; --` your table gets deleted.
**ALWAYS do this:**
```python
text = request.form['note']
conn.execute("INSERT INTO notes (text) VALUES (?)", (text,))
```
The `?` placeholder safely escapes dangerous characters.
## Common SQL Errors
| Error | Cause | Fix |
|-------|-------|-----|
| `no such table: notes` | Table doesn't exist | Run CREATE TABLE first |
| `no such column: txt` | Typo in column name | Check spelling |
| `UNIQUE constraint failed` | Duplicate in UNIQUE column | Use different value |
| `NOT NULL constraint failed` | NULL in NOT NULL column | Provide a value |
## Practice Exercises
```sql
INSERT INTO notes (text) VALUES ('My first note');  -- 1. Add
SELECT * FROM notes;                                -- 2. Read all
SELECT * FROM notes WHERE id = 1;                   -- 3. Find specific
UPDATE notes SET text = 'Updated text' WHERE id = 1; -- 4. Update
DELETE FROM notes WHERE id = 1;                      -- 5. Delete
```

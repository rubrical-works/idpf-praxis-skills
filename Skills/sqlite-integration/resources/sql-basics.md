# SQL Basics for Beginners
**Version:** v0.5.0

## What is SQL?

SQL (Structured Query Language) is the language used to talk to databases.

Think of it like this:
- **English:** How you talk to people
- **Python/Ruby:** How you talk to computers
- **SQL:** How you talk to databases

## The Four Main Operations (CRUD)

**C**reate - Add new data
**R**ead - Get existing data
**U**pdate - Change existing data
**D**elete - Remove data

## Basic SQL Commands

### CREATE TABLE - Make a New Table

```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Translation to English:**
"Make a table called 'notes' with columns for id, text, and created_at"

**Column types:**
- `INTEGER` - Whole numbers (1, 2, 3, ...)
- `TEXT` - Strings/text
- `REAL` - Decimal numbers (3.14, 2.5, ...)
- `TIMESTAMP` - Date and time

**Constraints:**
- `PRIMARY KEY` - Unique identifier for each row
- `AUTOINCREMENT` - Automatically count up (1, 2, 3, ...)
- `NOT NULL` - This field is required
- `DEFAULT value` - Use this value if none provided

### INSERT - Add New Data

```sql
INSERT INTO notes (text) VALUES ('Buy milk');
```

**Translation:** "Add a new row to notes table with text 'Buy milk'"

**With placeholder (safer):**
```sql
INSERT INTO notes (text) VALUES (?);
```
Then pass the actual text separately (prevents SQL injection)

### SELECT - Get Data

**Get everything:**
```sql
SELECT * FROM notes;
```
**Translation:** "Get all columns from all rows in notes table"

**Get specific columns:**
```sql
SELECT id, text FROM notes;
```
**Translation:** "Get only id and text columns"

**Get with condition:**
```sql
SELECT * FROM notes WHERE id = 5;
```
**Translation:** "Get all columns, but only for the row where id is 5"

**Get and sort:**
```sql
SELECT * FROM notes ORDER BY created_at DESC;
```
**Translation:** "Get all notes, sorted by creation time, newest first"
- `ASC` = Ascending (A→Z, 1→10, oldest→newest)
- `DESC` = Descending (Z→A, 10→1, newest→oldest)

### UPDATE - Change Existing Data

```sql
UPDATE notes SET text = 'Buy bread' WHERE id = 5;
```

**Translation:** "In notes table, change the text to 'Buy bread' for the row where id is 5"

**Warning:** Always use WHERE or you'll update ALL rows!

```sql
UPDATE notes SET text = 'Oops';  -- Changes ALL notes to 'Oops'!
```

### DELETE - Remove Data

```sql
DELETE FROM notes WHERE id = 5;
```

**Translation:** "Remove the row from notes table where id is 5"

**Warning:** Without WHERE, deletes EVERYTHING!

```sql
DELETE FROM notes;  -- Deletes all notes! 💥
```

## Common Patterns

### Search for text containing word

```sql
SELECT * FROM notes WHERE text LIKE '%milk%';
```
`%` is a wildcard (matches anything)
- `%milk%` - contains "milk" anywhere
- `milk%` - starts with "milk"
- `%milk` - ends with "milk"

### Count rows

```sql
SELECT COUNT(*) FROM notes;
```
Returns number of notes in table

### Get most recent

```sql
SELECT * FROM notes ORDER BY created_at DESC LIMIT 1;
```
Gets the newest note (sorts by date, takes top 1)

### Get multiple with OR

```sql
SELECT * FROM notes WHERE id = 5 OR id = 10;
```
Gets notes with id 5 or 10

### Get multiple with AND

```sql
SELECT * FROM notes WHERE text LIKE '%important%' AND created_at > '2024-01-01';
```
Gets notes containing "important" AND created after Jan 1, 2024

## SQL Injection (Security!)

**NEVER do this:**
```python
# Python example - DANGEROUS!
text = request.form['note']
conn.execute(f"INSERT INTO notes (text) VALUES ('{text}')")
```

**Why it's dangerous:**
If user types: `'); DROP TABLE notes; --`
The SQL becomes:
```sql
INSERT INTO notes (text) VALUES (''); DROP TABLE notes; --')
```
This deletes your entire table!

**ALWAYS do this:**
```python
# Python example - SAFE
text = request.form['note']
conn.execute("INSERT INTO notes (text) VALUES (?)", (text,))
```

The `?` placeholder safely escapes dangerous characters.

## Common SQL Errors

**"no such table: notes"**
- Table doesn't exist
- Run CREATE TABLE command first

**"no such column: txt"**
- Typo in column name
- Check spelling (text vs txt)

**"UNIQUE constraint failed"**
- Trying to insert duplicate value in UNIQUE column
- Usually with PRIMARY KEY

**"NOT NULL constraint failed"**
- Trying to insert NULL into NOT NULL column
- Provide a value for that column

## Practice Exercises

Start with these simple queries:

1. **Add a note:**
   ```sql
   INSERT INTO notes (text) VALUES ('My first note');
   ```

2. **See all notes:**
   ```sql
   SELECT * FROM notes;
   ```

3. **Find a specific note:**
   ```sql
   SELECT * FROM notes WHERE id = 1;
   ```

4. **Update a note:**
   ```sql
   UPDATE notes SET text = 'Updated text' WHERE id = 1;
   ```

5. **Delete a note:**
   ```sql
   DELETE FROM notes WHERE id = 1;
   ```

## Next Steps

Once comfortable with basics:
- Learn JOINs (combining tables)
- Learn indexes (making searches faster)
- Learn transactions (grouping operations)
- Learn foreign keys (linking tables)

But for beginners: Master these basic operations first!

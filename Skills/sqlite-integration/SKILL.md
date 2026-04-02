---
name: sqlite-integration
description: Add SQLite database to Flask or Sinatra app with beginner-friendly code examples and teaching comments
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: database
relevantTechStack: [sqlite, sql, flask, sinatra, python, ruby]
copyright: "Rubrical Works (c) 2026"
---
# SQLite Integration for Beginners
Teaches beginners how to add persistent data storage using SQLite to Flask or Sinatra applications.
## When to Use This Skill
- User has working app with in-memory storage (lists/arrays)
- User asks "How do I save data permanently?"
- User wants data to persist after server restart
- User mentions "database" but is a beginner
- User has 3-4 features working and is ready for persistence
- Using better-sqlite3 or other SQLite libraries
## Prerequisites Check
Before adding database, user should:
- Have working Flask or Sinatra app
- Understand routes and templates
- Have at least one feature using list/array storage
- Understand the "data disappears on restart" problem
## What is SQLite?
A database that stores data in a file. Like writing in a notebook instead of a whiteboard — data stays after server stops.
- No server setup needed, just a file in your project
- Built into Python; Ruby needs `gem install sqlite3`
- Easy to learn SQL basics; can upgrade to PostgreSQL/MySQL later
## Key Concepts
### Database = Organized Storage
Tables (like spreadsheets) with COLUMNS (data types) and ROWS (entries):
```
"notes" table:
┌────┬─────────────────┬────────────────────┐
│ id │ text            │ created_at         │
├────┼─────────────────┼────────────────────┤
│ 1  │ Buy milk        │ 2024-01-15 10:30   │
│ 2  │ Call doctor     │ 2024-01-15 11:45   │
└────┴─────────────────┴────────────────────┘
```
### SQL = Language for Databases
```
CREATE TABLE - Make new table
INSERT INTO  - Add data
SELECT       - Get data
UPDATE       - Change data
DELETE       - Remove data
```
### Connection Pattern
1. CONNECT to database file
2. DO something (add, get, update data)
3. COMMIT (save changes)
4. CLOSE connection
## Flask Implementation
**1. Import sqlite3:**
```python
import sqlite3
```
**2. Create connection function:**
```python
def get_db():
    conn = sqlite3.connect('notes.db')
    conn.row_factory = sqlite3.Row
    return conn
```
**3. Initialize database:**
```python
def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
```
**4. Update routes:**
```python
@app.route('/')
def home():
    conn = get_db()
    notes = conn.execute('SELECT * FROM notes').fetchall()
    conn.close()
    return render_template('index.html', notes=notes)
```
See `resources/flask-sqlite-example.py` for complete code.
## Sinatra Implementation
**1. Require sqlite3:**
```ruby
require 'sqlite3'
```
**2. Create database connection:**
```ruby
DB = SQLite3::Database.new 'notes.db'
DB.results_as_hash = true
```
**3. Create table:**
```ruby
DB.execute <<-SQL
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
SQL
```
**4. Update routes:**
```ruby
get '/' do
  @notes = DB.execute('SELECT * FROM notes')
  erb :index
end
```
See `resources/sinatra-sqlite-example.rb` for complete code.
## SQL Teaching Reference
**CREATE TABLE:**
```sql
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
- `IF NOT EXISTS` — safe to run multiple times
- `PRIMARY KEY AUTOINCREMENT` — unique auto-incrementing ID
- `NOT NULL` — must have a value
- `DEFAULT CURRENT_TIMESTAMP` — auto-filled with current time
**INSERT:** `INSERT INTO notes (text) VALUES (?)` — `?` is a placeholder preventing SQL injection
**SELECT:** `SELECT * FROM notes ORDER BY created_at DESC` — get all notes, newest first
## Common Questions
- **Where is the database?** In project folder as `notes.db` after first run
- **View contents?** DB Browser for SQLite (free), sqlite3 CLI, or VS Code extensions
- **Made a mistake?** Delete `notes.db`; recreates on next run (data lost)
- **Install needed?** Python: built-in. Ruby: `gem install sqlite3`
- **SQL injection?** Use `?` placeholders (prepared statements) — never put user input directly in SQL
## Testing the Database
1. Add note through form → restart server → note still there
2. Check `notes.db` file exists in project folder
3. Add several notes → restart → all persist
4. Delete `notes.db` → restart → new empty database created
## Troubleshooting
- **"no such table"** → Run `init_db()`, check `CREATE TABLE` ran
- **"Database is locked"** → Close DB Browser/other tools, restart server
- **"No such column"** → Check spelling in SQL
- **Template shows weird data** → Access dict/Row correctly per framework examples
## Resources
- `resources/flask-sqlite-example.py` — Complete Flask example
- `resources/sinatra-sqlite-example.rb` — Complete Sinatra example
- `resources/sql-basics.md` — SQL fundamentals

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
## When to Use This Skill
Invoke this Skill when:
- User has working app with in-memory storage (lists/arrays)
- User asks "How do I save data permanently?"
- User wants data to persist after server restart
- User mentions "database" but is a beginner
- User has 3-4 features working and is ready for persistence
- File-based or embedded database solutions needed
- Using better-sqlite3 or other SQLite libraries
## Prerequisites Check
Before adding database, user should:
- Have working Flask or Sinatra app
- Understand routes and templates
- Have at least one feature using list/array storage
- Understand the "data disappears on restart" problem
- Be comfortable with basic programming concepts
## What is SQLite?
```
SQLite is a database that stores data in a file.
- List/Array: Like writing on a whiteboard - disappears on restart
- SQLite: Like writing in a notebook - persists in a .db file
Perfect for beginners:
- No server setup needed
- Just a file in your project
- Built into Python
- Easy to learn SQL basics
- Can upgrade to PostgreSQL/MySQL later
```
## Key Concepts
### 1. Database = Organized Storage
```
Database has TABLES (like spreadsheets)
Each table has:
- COLUMNS: What kind of data (id, name, email)
- ROWS: Actual data entries

Example "notes" table:
+----+-----------------+--------------------+
| id | text            | created_at         |
+----+-----------------+--------------------+
| 1  | Buy milk        | 2024-01-15 10:30   |
| 2  | Call doctor     | 2024-01-15 11:45   |
+----+-----------------+--------------------+
```
### 2. SQL = Language for Databases
```
CREATE TABLE - Make new table
INSERT INTO  - Add data
SELECT       - Get data
UPDATE       - Change data
DELETE       - Remove data
```
### 3. Connection Pattern
```
1. CONNECT to database file (open it)
2. DO something (add, get, update data)
3. COMMIT (save changes)
4. CLOSE connection
```
## Implementation Steps
### Step 1: Understand the Transition
**Current code (using list):**
```python
notes = []  # Data in RAM - disappears when server stops
@app.route('/')
def home():
    return render_template('index.html', notes=notes)
@app.route('/add', methods=['POST'])
def add():
    notes.append(request.form['note'])
    return redirect('/')
```
**Problem:** Restart server -> notes disappear
**After adding SQLite:** Data saved in `notes.db` file -> persists forever
### Step 2: Choose Your Framework
- **Flask users:** See `resources/flask-sqlite-example.py`
- **Sinatra users:** See `resources/sinatra-sqlite-example.rb`
- **SQL basics:** See `resources/sql-basics.md`
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
## Teaching: SQL Statements
**CREATE TABLE:**
```sql
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
- `IF NOT EXISTS`: Safe to run multiple times
- `AUTOINCREMENT`: Auto-numbers (1, 2, 3, ...)
- `PRIMARY KEY`: Unique row identifier
- `NOT NULL`: Required field
- `DEFAULT CURRENT_TIMESTAMP`: Auto-fills with current time
**INSERT:**
```sql
INSERT INTO notes (text) VALUES (?)
```
- `?` is a placeholder (prevents SQL injection)
- Pass actual text separately
**SELECT:**
```sql
SELECT * FROM notes ORDER BY created_at DESC
```
- `*`: All columns
- `ORDER BY ... DESC`: Newest first
## Common Questions
- **Where is the database file?** In your project folder: `notes.db`
- **Can I look inside?** Yes - DB Browser for SQLite (free), sqlite3 CLI, or VS Code extensions
- **What if I make a mistake?** Delete `notes.db` - it recreates on next run (data is lost)
- **Do I need to install SQLite?** Python: built-in. Ruby: `gem install sqlite3`
- **What about SQL injection?** Use `?` placeholders (prepared statements) - never put user input directly in SQL
## Testing the Database
1. **Add a note** -> restart server -> check if note still there
2. **Check database file** -> `notes.db` should exist in project folder
3. **Multiple operations** -> add several notes, restart, all should persist
4. **Delete database** -> stop server, delete `notes.db`, start server -> new empty database
## Migration Path
1. **Basic SQLite** - Single table, simple queries, no relationships
2. **Multiple tables** - Users and notes separately, foreign keys
3. **Advanced** - Complex queries, JOINs, indexes
4. **Production database** - PostgreSQL or MySQL (same SQL concepts apply)
## Troubleshooting
- **"sqlite3.OperationalError: no such table"** -> Run `init_db()`, check if CREATE TABLE ran
- **"Database is locked"** -> Close DB Browser or other tools, restart server
- **"No such column"** -> Check spelling in SQL
- **Template shows weird data** -> Access dict/Row correctly, see framework examples
## Complete Examples
Both complete examples with teaching comments are in resources:
- `resources/flask-sqlite-example.py`
- `resources/sinatra-sqlite-example.rb`
- `resources/sql-basics.md`

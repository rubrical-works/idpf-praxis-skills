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
Teaches beginners to add persistent storage via SQLite to Flask or Sinatra apps.
## When to Use
- User has working app with in-memory storage (lists/arrays)
- Asks "How do I save data permanently?"
- Wants data to persist after server restart
- Mentions "database" but is a beginner
- Has 3-4 features working; ready for persistence
- File-based/embedded database needed
## Prerequisites
- Working Flask or Sinatra app
- Understands routes and templates
- At least one feature using list/array storage
- Understands "data disappears on restart"
- Basic programming comfort
## What is SQLite?
SQLite stores data in a file. List/Array = whiteboard notes (erased on restart). SQLite = notebook (saved to `notes.db`, persists, searchable/sortable).
For beginners: no server setup, just a file, built into Python, easy SQL, upgradable to PostgreSQL/MySQL later.
## Key Concepts
### 1. Database = Organized Storage
Tables (spreadsheet-like) with COLUMNS (kinds of data) and ROWS (entries).
```
"notes" table:
┌────┬─────────────────┬────────────────────┐
│ id │ text            │ created_at         │
├────┼─────────────────┼────────────────────┤
│ 1  │ Buy milk        │ 2024-01-15 10:30   │
│ 2  │ Call doctor     │ 2024-01-15 11:45   │
│ 3  │ Finish homework │ 2024-01-15 14:20   │
└────┴─────────────────┴────────────────────┘
```
### 2. SQL = Language for Databases
CREATE TABLE, INSERT INTO, SELECT, UPDATE, DELETE. Reads like English.
### 3. Connection Lifecycle
1. CONNECT to database file
2. DO something (add/get/update)
3. COMMIT (save)
4. CLOSE connection
## Responsibility Acknowledgement Gate
Implements the pattern in the **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When:** before modifying app source to add SQLite (edits, `sqlite3` gem for Ruby, creating `notes.db`).
- **What is asked:** responsibility for changes to app source files, Ruby gem environment (Sinatra path), filesystem (new `notes.db`).
- **On decline:** exit cleanly; "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation.
Use `AskUserQuestion` with (`"I accept responsibility — proceed"` / `"Decline — exit without changes"`).
## Implementation Steps
### Step 1: Understand the Transition
Current (list):
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
Problem: restart → notes disappear. After SQLite: stored in `notes.db` → persists.
### Step 2: Choose Framework
- Flask: `resources/flask-sqlite-example.py`
- Sinatra: `resources/sinatra-sqlite-example.rb`
- SQL basics: `resources/sql-basics.md`
## Flask Implementation
See `resources/flask-sqlite-example.py` for full commented code.
```python
import sqlite3

def get_db():
    conn = sqlite3.connect('notes.db')
    conn.row_factory = sqlite3.Row
    return conn

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

@app.route('/')
def home():
    conn = get_db()
    notes = conn.execute('SELECT * FROM notes').fetchall()
    conn.close()
    return render_template('index.html', notes=notes)
```
## Sinatra Implementation
See `resources/sinatra-sqlite-example.rb`.
```ruby
require 'sqlite3'

DB = SQLite3::Database.new 'notes.db'
DB.results_as_hash = true

DB.execute <<-SQL
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
SQL

get '/' do
  @notes = DB.execute('SELECT * FROM notes')
  erb :index
end
```
## Teaching SQL
**CREATE TABLE:**
```sql
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
- `IF NOT EXISTS` — safe to re-run.
- `id INTEGER PRIMARY KEY AUTOINCREMENT` — unique auto-incrementing row id.
- `text TEXT NOT NULL` — required text column.
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` — auto-filled creation time.
**INSERT:**
```sql
INSERT INTO notes (text) VALUES (?)
```
`?` is a placeholder (prevents SQL injection); pass text separately.
**SELECT:**
```sql
SELECT * FROM notes ORDER BY created_at DESC
```
All columns from notes; sorted newest first (DESC; ASC=oldest first).
## Common Questions
- **Where is the file?** Project folder: `notes.db`.
- **Look inside?** DB Browser for SQLite (free GUI), `sqlite3` CLI, VS Code extensions.
- **Made a mistake?** Delete `notes.db`; recreates on next run (data lost).
- **Install SQLite?** Python: built-in. Ruby: `gem install sqlite3`.
- **HTML template changes?** Minor — see examples.
- **SQL injection?** Use `?` placeholders. Never concatenate user input into SQL.
## Testing
1. Add note via form → restart → still there.
2. Check `notes.db` exists; size grows.
3. Add several → restart → all persist.
4. Delete `notes.db` → start → new empty db.
## Migration Path
- Phase 1 (start): single table, simple queries.
- Phase 2: multiple tables, foreign keys.
- Phase 3: complex queries, JOINs, indexes.
- Phase 4 (much later): PostgreSQL/MySQL — same SQL concepts.
## Troubleshooting
- `no such table` → run `init_db()`.
- `Database is locked` → close DB Browser/other tools; restart server.
- `No such column` → typo; check spelling.
- Weird template data format → access dict/Row correctly; see framework examples.
## Complete Examples
In `resources/`: `flask-sqlite-example.py`, `sinatra-sqlite-example.rb`, `sql-basics.md`. Include: full commented code, template adjustments, run/test instructions, expected output.
## Next Steps
- Add UPDATE and DELETE
- Relationships (foreign keys)
- Search/filter
- Indexes
- Migrate to PostgreSQL (production)

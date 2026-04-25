---
name: sqlite-integration
description: Add SQLite database to Flask or Sinatra app with beginner-friendly code examples and teaching comments
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: database
relevantTechStack: [sqlite, sql, flask, sinatra, python, ruby]
copyright: "Rubrical Works (c) 2026"
---

# SQLite Integration for Beginners

Teaches beginners to add persistent SQLite storage to Flask or Sinatra apps.

## Step 0 — Re-read Config (MANDATORY)

Read `resources/sqlite-integration.config.json` and validate against `resources/sqlite-integration.config.schema.json` at the start of every invocation. Config is source of truth for file-extension convention, per-language drivers (Python `sqlite3`, Ruby `sqlite3` gem, Node `better-sqlite3`) with install commands, schema conventions (primary key, timestamp), and the starter `notes` table CREATE statement. SKILL.md must not duplicate config values.

## When to Use

- Working app with in-memory storage (lists/arrays)
- "How do I save data permanently?"
- Wants persistence after server restart
- Beginner mentions "database"
- 3-4 features working, ready for persistence
- File-based/embedded DB needed; better-sqlite3 or other SQLite libs

## Prerequisites

- Working Flask or Sinatra app
- Understands routes and templates
- One feature using list/array storage
- Understands "data disappears on restart"
- Comfortable with basic programming

## What is SQLite?

SQLite stores data in a file. List/array = whiteboard (erased on restart). SQLite = notebook (persists in `notes.db`). No server setup, built into Python, easy SQL basics, can upgrade to PostgreSQL/MySQL later.

## Key Concepts

**1. Database = Organized Storage** — TABLES (like spreadsheets) with COLUMNS (id, name, email) and ROWS (entries).

**2. SQL = Language for Databases**
```
CREATE TABLE - Make new table
INSERT INTO  - Add data
SELECT       - Get data
UPDATE       - Change data
DELETE       - Remove data
```

**3. Connection = Open the Database File** — CONNECT → DO → COMMIT → CLOSE.

## Responsibility Acknowledgement Gate

Implements pattern from **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md` for full contract.

- **When this fires:** before modifying Flask/Sinatra app to add SQLite (editing source files, installing `sqlite3` gem for Ruby, creating `notes.db` on disk).
- **What is asked:** acceptance of responsibility for changes to application source files, Ruby gem environment (Sinatra path), and filesystem (new `notes.db`).
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation. Re-fires on every subsequent invocation; acceptance never persisted.

Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"`, `"Decline — exit without changes"`). See `responsibility-gate` for allowed additional options.

## Implementation Steps

### Step 1: Understand the Transition

Current code (using list):
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

Restart → notes disappear. After SQLite: data saved in `notes.db` → persists.

### Step 2: Choose Your Framework

- **Flask:** `resources/flask-sqlite-example.py`
- **Sinatra:** `resources/sinatra-sqlite-example.rb`
- **SQL basics:** `resources/sql-basics.md`

## Flask Implementation

See `resources/flask-sqlite-example.py` for complete commented code.

**1. Import sqlite3:**
```python
import sqlite3
```

**2. Create connection function:**
```python
def get_db():
    conn = sqlite3.connect('notes.db')
    conn.row_factory = sqlite3.Row  # Makes results easier to work with
    return conn
```

**3. Initialize database (create table):**
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

**4. Update routes to use database:**
```python
@app.route('/')
def home():
    conn = get_db()
    notes = conn.execute('SELECT * FROM notes').fetchall()
    conn.close()
    return render_template('index.html', notes=notes)
```

## Sinatra Implementation

See `resources/sinatra-sqlite-example.rb` for complete commented code.

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

## Teaching Approach

**CREATE TABLE:**
```sql
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
- `IF NOT EXISTS`: safe to run multiple times
- `id INTEGER PRIMARY KEY AUTOINCREMENT`: unique auto-incremented row identifier
- `text TEXT NOT NULL`: required text content
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`: auto-filled creation time

**INSERT:**
```sql
INSERT INTO notes (text) VALUES (?)
```
`?` is a placeholder; pass actual text separately to prevent SQL injection.

**SELECT:**
```sql
SELECT * FROM notes ORDER BY created_at DESC
```
`*` = all columns; `DESC` = newest first (`ASC` = oldest first).

## Common Questions

- **Where is the DB file?** Project folder: `notes.db`.
- **Can I look inside?** DB Browser for SQLite, sqlite3 CLI, VS Code extensions.
- **If I make a mistake?** Delete `notes.db`; recreates on next run (data lost).
- **Need to install SQLite?** Python: built-in. Ruby: `gem install sqlite3`.
- **Template changes?** Minor — see examples.
- **SQL injection?** Always use `?` placeholders (prepared statements). Never put user input directly in SQL.

## Testing the Database

1. **Add a note** → restart server → note still there.
2. **Check DB file** — `notes.db` exists, grows with notes.
3. **Multiple operations** — add notes, restart, all persist.
4. **Delete DB file** — stop server, delete `notes.db`, start → new empty DB created.

## Migration Path

- **Phase 1:** Single table, simple queries, no relationships.
- **Phase 2:** Multiple tables, foreign keys.
- **Phase 3:** JOINs, indexes, complex queries.
- **Phase 4:** PostgreSQL/MySQL — same SQL applies.

## Troubleshooting

- **`no such table`** — run `init_db()`; check `CREATE TABLE` ran.
- **`Database is locked`** — close DB Browser/other tools; restart server.
- **`No such column`** — check spelling.
- **Weird template data** — access dict/Row correctly; see examples.

## Complete Examples

In `resources/`:
- `flask-sqlite-example.py`
- `sinatra-sqlite-example.rb`
- `sql-basics.md`

Include full commented code, template adjustments, run/test instructions.

## Next Steps

Add UPDATE/DELETE; learn foreign keys; add search/filter; explore indexes; consider PostgreSQL migration.

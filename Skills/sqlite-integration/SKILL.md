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
Teaches beginners how to add persistent data storage using SQLite to Flask or Sinatra applications.
## Step 0 — Re-read Config (MANDATORY)
Read `resources/sqlite-integration.config.json` from disk and validate against `resources/sqlite-integration.config.schema.json` at start of every invocation. Config is source of truth for file-extension convention, per-language driver choices (Python `sqlite3`, Ruby `sqlite3` gem, Node `better-sqlite3`) with install commands, schema conventions (primary key, timestamp), starter `notes` table CREATE statement. SKILL.md must not duplicate values.
## When to Use This Skill
Invoke when:
- User has working app with in-memory storage (lists/arrays)
- User asks "How do I save data permanently?"
- User wants data to persist after server restart
- User mentions "database" but is beginner
- User has 3-4 features working and is ready for persistence
- File-based or embedded database solutions needed
- Using better-sqlite3 or other SQLite libraries
## Prerequisites Check
Before adding database, user should:
- ✓ Have working Flask or Sinatra app
- ✓ Understand routes and templates
- ✓ Have at least one feature using list/array storage
- ✓ Understand "data disappears on restart" problem
- ✓ Be comfortable with basic programming concepts
## What is SQLite?
**Beginner explanation:**
```
SQLite is a database that stores data in a file.

- List/Array: Like writing notes on a whiteboard
  - Fast and easy
  - Disappears when you turn off the server

- SQLite: Like writing in a notebook
  - Data saved to a file (notes.db)
  - Stays there even after server stops
  - Can search, sort, and organize data easily

Perfect for beginners because:
✓ No server setup needed
✓ Just a file in your project
✓ Built into Python
✓ Easy to learn SQL basics
✓ Can upgrade to PostgreSQL/MySQL later
```
## Key Concepts to Teach
### 1. Database = Organized Storage
Database has TABLES (like spreadsheets). Each table has COLUMNS (kind of data: id, name, email) and ROWS (actual entries). Example "notes" table has columns: id, text, created_at.
### 2. SQL = Language for Databases
```
CREATE TABLE - Make new table
INSERT INTO  - Add data
SELECT       - Get data
UPDATE       - Change data
DELETE       - Remove data
```
### 3. Connection = Open the Database File
```
1. CONNECT to database file (open it)
2. DO something (add, get, update data)
3. COMMIT (save changes)
4. CLOSE connection (close the file)
```
## Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before modifying the Flask or Sinatra application to add SQLite (editing source files, installing `sqlite3` gem for Ruby, and creating a `notes.db` database file on disk).
- **What is asked:** acceptance of responsibility for change to application source files, Ruby gem environment (Sinatra path), and filesystem (new `notes.db` file in project directory).
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
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
**Problem:** Restart server → notes disappear
**After adding SQLite:** Data saved in `notes.db` file → persists forever
### Step 2: Choose Your Framework
- **Flask users:** See `resources/flask-sqlite-example.py`
- **Sinatra users:** See `resources/sinatra-sqlite-example.rb`
- **SQL basics:** See `resources/sql-basics.md`
## Flask Implementation
See `resources/flask-sqlite-example.py` for complete, commented code.
**Key changes from list to SQLite:**
**1. Import sqlite3:** `import sqlite3`
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
See `resources/sinatra-sqlite-example.rb` for complete, commented code.
**1. Require sqlite3:** `require 'sqlite3'`
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
### Explain Each SQL Statement
**CREATE TABLE:**
```sql
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
**Explanation:** `CREATE TABLE notes`: make new table; `IF NOT EXISTS`: only if doesn't exist; `id INTEGER PRIMARY KEY AUTOINCREMENT`: unique number for each note, auto-increments; `text TEXT NOT NULL`: column for note content, must have value; `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`: automatically filled with current time.
**INSERT:** `INSERT INTO notes (text) VALUES (?)` — `?` is placeholder (safer than putting text directly); pass actual text separately to prevent SQL injection.
**SELECT:** `SELECT * FROM notes ORDER BY created_at DESC` — `*`: all columns; `ORDER BY created_at DESC`: sort by creation time, newest first (ASC = ascending, DESC = descending).
## Common Questions
**Q: Where is the database file?** In project folder: `notes.db`. You can see it after running app once.
**Q: Can I look inside the database?** Yes! Tools: DB Browser for SQLite (free, visual); sqlite3 command line; VS Code extensions.
**Q: What if I make a mistake?** Just delete `notes.db` file. Recreates on next run (data lost).
**Q: Do I need to install SQLite?** Python: built-in, no installation. Ruby: `gem install sqlite3`.
**Q: Will my HTML template need changes?** Minor changes - see examples for template adjustments.
**Q: What about SQL injection?** Use `?` placeholders (prepared statements) - safe. Never put user input directly in SQL!
## Testing the Database
**Test 1: Add a note** - Add note through form; restart server; check if note still there ✓
**Test 2: Check database file** - Look in project folder; `notes.db` file should exist; size grows as you add notes
**Test 3: Multiple operations** - Add several notes; restart server; all notes should persist
**Test 4: Delete database file** - Stop server; delete `notes.db`; start server; new empty database created
## Migration Path
**Phase 1: Basic SQLite (start here)** - Single table; simple queries; no relationships
**Phase 2: Multiple tables (later)** - Users and notes separately; foreign keys linking them
**Phase 3: More advanced (much later)** - Complex queries; JOIN operations; indexes for speed
**Phase 4: Production database (way later)** - PostgreSQL or MySQL; same SQL concepts apply!
## Troubleshooting
**"sqlite3.OperationalError: no such table"** - Table not created; run `init_db()`; check if `CREATE TABLE` ran
**"Database is locked"** - Another program has database open; close DB Browser; restart server
**"No such column"** - Typo in column name; check exact spelling in SQL
**Template shows weird data format** - Need to access dict/Row correctly; see framework examples for proper syntax
## Complete Examples
Both complete, working examples with all teaching comments in resources folder:
- `resources/flask-sqlite-example.py`
- `resources/sinatra-sqlite-example.rb`
- `resources/sql-basics.md`
Include: full commented code; template adjustments needed; how to run and test; what to expect at each step.
## Next Steps After SQLite
Once comfortable with SQLite: add UPDATE and DELETE operations; learn about relationships (foreign keys); add search/filter functionality; explore indexes for speed; consider migration to PostgreSQL.

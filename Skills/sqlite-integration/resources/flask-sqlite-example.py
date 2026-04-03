# Flask app with SQLite - Complete beginner-friendly example
# This file shows how to add database storage to a Flask notes app

from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

# STEP 1: Database Connection Function
def get_db():
    """
    Connect to our SQLite database file.
    If the file doesn't exist, SQLite creates it automatically.

    What this does:
    - Opens connection to notes.db file
    - Sets row_factory so results come back as dictionaries (easier to use)
    - Returns the connection object
    """
    conn = sqlite3.connect('notes.db', check_same_thread=False)
    # row_factory makes each row behave like a dictionary
    # So you can do: row['text'] instead of row[0]
    conn.row_factory = sqlite3.Row
    return conn

# STEP 2: Initialize Database (Create Table)
def init_db():
    """
    Set up the database table if it doesn't exist yet.
    This runs once when the app starts.

    The table has three columns:
    - id: Unique number for each note (auto-increments)
    - text: The actual note content
    - created_at: When the note was created (auto-fills)
    """
    conn = get_db()

    # SQL command to create table
    # IF NOT EXISTS means: only create if table doesn't already exist
    # This makes it safe to run every time the app starts
    conn.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # commit() saves the changes to the database file
    conn.commit()
    # Always close connections when done
    conn.close()

# Call init_db() when app starts (runs once)
# This creates the table if it doesn't exist
init_db()

# STEP 3: Routes Using Database

@app.route('/')
def home():
    """
    Homepage - show all notes from database.

    Process:
    1. Connect to database
    2. Get all notes (newest first)
    3. Close connection
    4. Render template with notes
    """
    conn = get_db()

    # SQL: SELECT * means "get all columns"
    #      FROM notes means "from the notes table"
    #      ORDER BY created_at DESC means "sort by date, newest first"
    # fetchall() gets all matching rows
    notes = conn.execute('SELECT * FROM notes ORDER BY created_at DESC').fetchall()

    conn.close()

    # Pass notes to template
    # Each note will have: note['id'], note['text'], note['created_at']
    return render_template('index.html', notes=notes)

@app.route('/add', methods=['POST'])
def add_note():
    """
    Add a new note to database.

    Process:
    1. Get text from form
    2. Connect to database
    3. Insert new note
    4. Save changes (commit)
    5. Close connection
    6. Redirect to home page
    """
    # Get the note text from the form
    note_text = request.form['note']

    conn = get_db()

    # SQL: INSERT INTO notes (text) VALUES (?)
    #      ? is a placeholder - safer than putting text directly
    #      We pass the actual text as second parameter (note_text,)
    # This prevents SQL injection attacks
    conn.execute('INSERT INTO notes (text) VALUES (?)', (note_text,))

    # commit() actually saves the new note to the database file
    # Without this, the note wouldn't be saved
    conn.commit()

    conn.close()

    # Redirect back to homepage to see the new note
    return redirect('/')

@app.route('/delete/<int:note_id>')
def delete_note(note_id):
    """
    Delete a note by its ID.

    Optional feature to demonstrate DELETE operation.
    """
    conn = get_db()

    # SQL: DELETE FROM notes WHERE id = ?
    #      Removes the note with matching id
    conn.execute('DELETE FROM notes WHERE id = ?', (note_id,))
    conn.commit()
    conn.close()

    return redirect('/')

# STEP 4: Start the Flask Server
if __name__ == '__main__':
    # debug=True means:
    # - Server auto-reloads when you change code
    # - Shows helpful error messages
    app.run(debug=True)

# TEMPLATE CHANGES NEEDED:
# Your index.html template needs small changes to work with database rows:
#
# OLD (with list):
# {% for note in notes %}
#     <div class="note">{{ note }}</div>
# {% endfor %}
#
# NEW (with database):
# {% for note in notes %}
#     <div class="note">
#         {{ note['text'] }}
#         <small>{{ note['created_at'] }}</small>
#         <a href="/delete/{{ note['id'] }}">Delete</a>
#     </div>
# {% endfor %}
#
# KEY CHANGES:
# - note is now a dictionary/Row object, not a string
# - Access text with note['text']
# - Can also access note['id'] and note['created_at']

# TO RUN:
# 1. Save this as app.py
# 2. Make sure Flask is installed: pip install flask
# 3. Run: python app.py
# 4. Open browser to: http://localhost:5000
# 5. Add some notes
# 6. Stop server (Ctrl+C)
# 7. Restart server
# 8. Notes are still there! (saved in notes.db)

# WHAT FILES YOU'LL HAVE:
# my-project/
# ├── app.py (this file)
# ├── notes.db (created automatically when app runs)
# └── templates/
#     └── index.html (your template, needs small changes)

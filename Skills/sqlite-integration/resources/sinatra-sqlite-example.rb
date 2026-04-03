# Sinatra app with SQLite - Complete beginner-friendly example
# This file shows how to add database storage to a Sinatra notes app

require 'sinatra'
require 'sqlite3'

# STEP 1: Create Database Connection
# This opens (or creates) the notes.db file
# We store it in a constant (DB) so it's available everywhere
DB = SQLite3::Database.new 'notes.db'

# Make results come back as hashes (Ruby's version of dictionaries)
# So you can do: note['text'] instead of note[0]
DB.results_as_hash = true

# STEP 2: Create Table if it Doesn't Exist
# This runs once when the app starts
# <<-SQL is a "heredoc" - multi-line string in Ruby
DB.execute <<-SQL
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
SQL

# Explanation of table structure:
# - id: Unique number for each note (auto-increments: 1, 2, 3...)
# - text: The actual note content (TEXT type, NOT NULL means required)
# - created_at: When note was created (auto-fills with current time)

# STEP 3: Routes Using Database

# Homepage - Show all notes
get '/' do
  # SQL: Get all notes, sorted by newest first
  # DESC = descending (newest first)
  # ASC would be ascending (oldest first)
  @notes = DB.execute('SELECT * FROM notes ORDER BY created_at DESC')

  # @notes is now an array of hashes
  # Each hash has: note['id'], note['text'], note['created_at']

  # Render the template with @notes available
  erb :index
end

# Add new note
post '/add' do
  # Get the note text from the form
  # params is a hash containing form data
  # 'note' is the name of the input field in HTML form
  note_text = params['note']

  # SQL: Insert new note into database
  # ? is a placeholder - safer than putting text directly
  # This prevents SQL injection (security!)
  DB.execute('INSERT INTO notes (text) VALUES (?)', note_text)

  # Redirect back to homepage
  # The browser will load '/' again, showing the new note
  redirect '/'
end

# Delete note (optional - demonstrates DELETE)
get '/delete/:id' do
  # :id in the route becomes params['id']
  note_id = params['id']

  # SQL: Delete the note with matching id
  DB.execute('DELETE FROM notes WHERE id = ?', note_id)

  redirect '/'
end

# TEMPLATE CHANGES NEEDED:
# Your index.erb template needs small changes to work with database hashes:
#
# OLD (with array):
# <% @notes.each do |note| %>
#   <div class="note"><%= note %></div>
# <% end %>
#
# NEW (with database):
# <% @notes.each do |note| %>
#   <div class="note">
#     <%= note['text'] %>
#     <small><%= note['created_at'] %></small>
#     <a href="/delete/<%= note['id'] %>">Delete</a>
#   </div>
# <% end %>
#
# KEY CHANGES:
# - note is now a hash, not a string
# - Access text with note['text']
# - Can also access note['id'] and note['created_at']

# HOW SQL INJECTION PREVENTION WORKS:
#
# WRONG (unsafe):
# DB.execute("INSERT INTO notes (text) VALUES ('#{note_text}')")
# If user types: '); DROP TABLE notes; --
# It would delete your entire table!
#
# RIGHT (safe):
# DB.execute('INSERT INTO notes (text) VALUES (?)', note_text)
# The ? placeholder safely escapes any dangerous characters
# User input is treated as data, not code

# TO RUN:
# 1. Save this as app.rb
# 2. Make sure sqlite3 gem is installed:
#    Add to Gemfile: gem 'sqlite3'
#    Run: bundle install
# 3. Run: ruby app.rb
#    Or: bundle exec ruby app.rb
# 4. Open browser to: http://localhost:4567
# 5. Add some notes
# 6. Stop server (Ctrl+C)
# 7. Restart server
# 8. Notes are still there! (saved in notes.db)

# WHAT FILES YOU'LL HAVE:
# my-project/
# ├── app.rb (this file)
# ├── Gemfile (with gem 'sqlite3')
# ├── notes.db (created automatically when app runs)
# └── views/
#     └── index.erb (your template, needs small changes)

# CHECKING THE DATABASE:
# You can use DB Browser for SQLite (free program) to look inside notes.db
# Or command line: sqlite3 notes.db
#                  sqlite> SELECT * FROM notes;
#                  sqlite> .quit

# COMMON OPERATIONS:
#
# Get all notes:
# notes = DB.execute('SELECT * FROM notes')
#
# Get one specific note:
# note = DB.execute('SELECT * FROM notes WHERE id = ?', note_id).first
#
# Update a note:
# DB.execute('UPDATE notes SET text = ? WHERE id = ?', new_text, note_id)
#
# Delete a note:
# DB.execute('DELETE FROM notes WHERE id = ?', note_id)
#
# Count notes:
# count = DB.execute('SELECT COUNT(*) FROM notes').first['COUNT(*)']
#
# Search notes:
# results = DB.execute("SELECT * FROM notes WHERE text LIKE ?", "%#{search_term}%")

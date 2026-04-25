# sqlite-integration Rationale

Preserved prose from the original SKILL.md. SKILL.md retains its beginner-friendly teaching content; this file captures the volatile-knob extraction decisions.

## File extension defaults

`.db` is the most common convention in beginner tutorials and the SQLite documentation; `.sqlite` and `.sqlite3` are accepted variants. Recorded as `fileNaming.extension` + `alternativeExtensions` so the skill can answer "what should I name the file?" consistently.

## Per-language drivers

Three target languages — Python, Ruby, Node — each with a `primary` driver:

- **Python**: `sqlite3` (standard library, no install)
- **Ruby**: `sqlite3` gem (`gem install sqlite3`, `gem 'sqlite3'` Gemfile entry)
- **Node**: `better-sqlite3` (synchronous, fast)

The Node choice is the most opinionated — `better-sqlite3` over the older callback-based `sqlite3` package — and the rationale is recorded inline in the config under `_note`.

## Starter `notes` table

The teaching example uses a `notes` table with id/text/created_at columns. The CREATE statement is recorded as `starterTable.createSql` so the skill can scaffold consistently across language variants. The schema conventions (`INTEGER PRIMARY KEY AUTOINCREMENT`, `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`) are SQLite idiomatic and beginner-friendly.

## Why no Connection-string complexity

SQLite uses a file path, not a connection string — so the `connectionString` block from `postgresql-integration.config.json` has no analogue here. The `defaultDbFile` field (`app.db`) is the equivalent: the path used when none is specified.

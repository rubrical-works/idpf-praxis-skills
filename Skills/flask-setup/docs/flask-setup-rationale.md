# flask-setup Rationale

Preserved prose from the original SKILL.md. SKILL.md retains its beginner-friendly step-by-step teaching structure; this file documents the volatile-knob extraction decisions.

## Why a single `language.minimumVersion`

Flask's own minimum supported Python varies between major releases. The config records the floor that this skill's instructions are tested against (currently 3.8). Bumping the floor when Flask drops support for an older Python is a JSON edit + `lastUpdated` bump in the skill — no prose changes needed.

## `python` vs `python3`

Many distros default `python` to Python 2 or to nothing at all; `python3` is needed. The config records both `createCommand` and `createCommandFallback` so the skill can try the canonical command first and fall back without inventing the fallback inline.

## Per-platform activate commands

The activate command differs across Windows PowerShell, Windows CMD, macOS, and Linux. The config records all four (`envManagement.activateCommands`) so the skill picks based on detected platform. The `promptIndicator` (`(venv)`) is the visible signal of success — also pinned in JSON because Python venv may someday change it.

## Auto-installed dependencies

`starterPackages._autoInstalled` lists the gems that pip pulls in when installing Flask (Werkzeug, Jinja2, Click, etc.). The list is informational — the skill uses it only to set the user's expectation about what they will see in `pip list`. Underscore prefix marks it as non-required by the schema.

## Wizard prose

The original SKILL.md leans heavily on beginner explanations rather than UI navigation prose. There's relatively little wizard-style content to remove. The "Open File Explorer", "Right-click", "Open your text editor" instructions in the original were already presented as anti-patterns ("DO NOT provide manual instructions like..."). Those guards are preserved in SKILL.md.

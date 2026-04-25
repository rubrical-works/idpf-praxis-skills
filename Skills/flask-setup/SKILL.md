---
name: flask-setup
description: Set up Python Flask development environment for beginners with step-by-step guidance, virtual environment creation, and troubleshooting
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [flask, python, virtualenv, pip]
copyright: "Rubrical Works (c) 2026"
---

# Flask Setup for Beginners

## Step 0 — Re-read Config (MANDATORY)

Read `resources/flask-setup.config.json` and validate against `resources/flask-setup.config.schema.json` every invocation. Config is source of truth: Python floor, per-platform venv/activate commands, starter packages, verify templates. Don't duplicate values in SKILL.md — reference field names (e.g., `envManagement.activateCommands.macos`).

## When to Use

- User wants Flask web app / Python web API / Python web server
- Beginner needs Flask environment setup
- "How do I set up Flask?" / "How do I start a Flask project?"
- Flask tutorial/learning resources needed

## Instructions for ASSISTANT

**CRITICAL:** Format ALL technical instructions as **Claude Code copy/paste blocks**. DO NOT use manual instructions ("Open File Explorer", "Navigate to folder", "Right-click", "Type in terminal").

ALWAYS format as:
```
TASK: Set up Flask project

STEP 1: Copy this entire code block (including this line)
STEP 2: Open Claude Code
STEP 3: Paste into Claude Code
STEP 4: Claude Code will execute and report results
STEP 5: Report back: What did Claude Code say?

---

[Instructions for Claude Code to execute:]

Navigate to project directory:
cd [project-location]

Create project folder:
mkdir [project-name]
cd [project-name]

Check Python installed:
python --version

Create virtual environment:
python -m venv venv

[continue with commands...]

Report:
- What results did you see?
```

## Setup Knowledge

ASSISTANT must convert this into Claude Code commands.

### Responsibility Acknowledgement Gate

Implements pattern in `Skills/responsibility-gate/SKILL.md` (full contract there).

- **Fires:** before creating venv and `pip install flask` in user's project directory.
- **Asks:** acceptance for changes to Python env, project directory, installed packages, venv folder.
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.

Use `AskUserQuestion` with required options `"I accept responsibility — proceed"` and `"Decline — exit without changes"`.

### STEP 3: Create Virtual Environment

```bash
python -m venv venv
```

Isolated Python env per project. **Wait:** 10–30s. **Verify:** new `venv` folder.

**Issues:**
- "python: command not found" → install from python.org; Windows: check "Add Python to PATH".
- "python3" instead → try `python3 -m venv venv`

### STEP 4: Activate Virtual Environment

**Windows PowerShell:**
```bash
venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**
```bash
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

**Success:** `(venv)` prefix at prompt.

```
Before: C:\Projects\my-app>
After:  (venv) C:\Projects\my-app>
```

**Issues:**
- "Execution policy error" (Windows) → run PowerShell as Administrator:
  ```bash
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- Nothing happens → confirm in project directory
- `(venv)` missing → reopen terminal

### STEP 5: Install Flask

```bash
pip install flask
```

Downloads Flask + Werkzeug, Jinja2, Click into venv. **Wait:** 30–60s. Ends with "Successfully installed flask-X.X.X".

**Issues:**
- "pip: command not found" → venv not activated (Step 4)
- Permission errors → venv not activated

### STEP 6: Create app.py File

1. Open text editor (VS Code, PyCharm Community, Sublime, Notepad++)
2. Create new file
3. Save as `app.py` in project folder (same level as `venv`)

**Layout:**
```
my-project/
├── venv/           ← Virtual environment folder
└── app.py          ← Your main Flask file (create this)
```

**Don't create app.py inside the venv folder!**

### STEP 7: Verify Installation

```bash
python --version
```
Expected: `Python 3.8.x` or higher.

```bash
pip list
```
Expected: Flask + deps:
```
Package      Version
------------ -------
click        X.X.X
Flask        X.X.X
Jinja2       X.X.X
Werkzeug     X.X.X
```

```bash
python -c "import flask; print(flask.__version__)"
```
Expected: Flask version (e.g., `3.0.0`).

### STEP 8: Report Completion

- "Setup complete! I see (venv) in my terminal and Flask is installed"
- Or: "I got stuck at step X with error: [exact error message]"

## What Happens Next

1. ASSISTANT guides creating first Flask route
2. Write "Hello World" app
3. Start Flask dev server
4. View first web page

## Resources

| File | Purpose |
|------|---------|
| `resources/flask-setup.config.json` | Volatile knobs (Python floor, venv/activate per platform, install + verify templates). Re-read every invocation. |
| `resources/flask-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/verification-checklist.md` | Detailed troubleshooting steps. |
| `docs/flask-setup-rationale.md` | Original prose rationale preserved during refurbishment. |

## Troubleshooting Quick Reference

See `resources/verification-checklist.md`.

1. Forgot to activate venv → Step 4
2. Python not in PATH → reinstall with "Add to PATH"
3. Wrong directory → `cd` to project folder
4. Permission errors → venv not activated
5. Port/firewall → addressed when running server

**Remember:** keep terminal with `(venv)` open while developing!

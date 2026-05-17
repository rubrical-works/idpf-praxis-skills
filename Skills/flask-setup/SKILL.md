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
Guides complete beginners through setting up a Flask development environment with detailed explanations and verification steps.
## Step 0 — Re-read Config (MANDATORY)
Read `resources/flask-setup.config.json` from disk and validate against `resources/flask-setup.config.schema.json` at start of every invocation. Config is source of truth for Python version floor, virtualenv create + activate commands per platform, starter package list, verification command templates. SKILL.md must not duplicate values — prose references config fields by name (e.g., `envManagement.activateCommands.macos`) so updating Python/Flask versions or per-platform commands is a JSON edit.
## When to Use This Skill
Invoke when:
- User wants to build a Flask web application
- User is beginner and needs Flask environment setup
- User asks "How do I set up Flask?" or "How do I start a Flask project?"
- Project type is web application using Flask
- Building a Python web API or Python web server
- Flask tutorial or learning resources needed
## Instructions for ASSISTANT
**CRITICAL OUTPUT FORMAT:** ASSISTANT must format ALL technical instructions as **Claude Code copy/paste blocks**.
**DO NOT provide manual instructions like:** "Open File Explorer", "Navigate to folder", "Right-click", "Type in terminal"
**ALWAYS format as:**
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
### Create Project and Verify Python
**What this does:** Opens a command line interface in your project directory
**Verify:** You should see your project folder path in the terminal
### Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before creating a Python virtualenv and running `pip install flask` in the user's project directory.
- **What is asked:** acceptance of responsibility for change to Python environment, project directory, installed packages, and virtualenv folder.
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
### STEP 3: Create Virtual Environment
**Command:** `python -m venv venv`
**What this does:** Creates a special Python environment for this project; installs packages separately from system Python; prevents conflicts between projects.
**Why:** Keeps project dependencies isolated; different projects can use different versions; makes project portable and reproducible.
**Wait time:** 10-30 seconds. **Verify:** New `venv` folder in project directory.
**Common issues:**
- "python: command not found" → Python not installed or not in PATH; install from python.org; on Windows check "Add Python to PATH"
- "python3" instead of "python" → Try `python3 -m venv venv`
### STEP 4: Activate Virtual Environment
**Windows PowerShell:** `venv\Scripts\Activate.ps1`
**Windows Command Prompt:** `venv\Scripts\activate.bat`
**Mac/Linux:** `source venv/bin/activate`
**What this does:** Switches terminal to use virtual environment's Python; packages installed go into this environment only.
**Success indicator:** `(venv)` appears at start of terminal prompt.
**Example:** Before: `C:\Projects\my-app>` / After: `(venv) C:\Projects\my-app>`
**Common issues:**
- "Execution policy error" (Windows) → Run PowerShell as Administrator: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Nothing happens → Make sure you're in project directory
- `(venv)` doesn't appear → Try closing and reopening terminal
### STEP 5: Install Flask
**Command:** `pip install flask`
**What this does:** Downloads Flask from PyPI; installs Flask and dependencies into virtual environment.
**Wait time:** 30-60 seconds. **You'll see:** Progress messages; "Successfully installed flask-X.X.X" at end.
**What gets installed:** Flask, Werkzeug (web server utilities), Jinja2 (template engine), Click (CLI), other dependencies.
**Common issues:**
- "pip: command not found" → Virtual environment not activated (see Step 4)
- Slow installation → Normal if internet is slow
- Permission errors → Make sure virtual environment activated
### STEP 6: Create app.py File
1. Open text editor (VS Code, Sublime, PyCharm, Notepad++)
2. Create new file
3. Save as `app.py` in project folder (same level as `venv` folder)
**Recommended editors:** VS Code (free, powerful, Python support); PyCharm Community (free, Python-focused); Sublime Text; Notepad++ (Windows).
**File location:**
```
my-project/
├── venv/           ← Virtual environment folder
└── app.py          ← Your main Flask file (create this)
```
**Don't create app.py inside the venv folder!**
### STEP 7: Verify Installation
**Command 1:** `python --version` → Expected: `Python 3.8.x` or higher
**Command 2:** `pip list` → Expected: Flask (and dependencies) in list:
```
Package      Version
------------ -------
click        X.X.X
Flask        X.X.X
Jinja2       X.X.X
Werkzeug     X.X.X
```
**Command 3:** `python -c "import flask; print(flask.__version__)"` → Expected: Flask version number (e.g., `3.0.0`)
**All checks pass?** Ready to start coding!
### STEP 8: Report Completion
Report: "Setup complete! I see (venv) in my terminal and Flask is installed" or "I got stuck at step X with error: [exact error message]"
## What Happens Next
After successful setup:
1. ASSISTANT guides through creating first Flask route
2. Write "Hello World" application
3. Start Flask development server
4. See first web page in browser
## Resources
| File | Purpose |
|------|---------|
| `resources/flask-setup.config.json` | Volatile knobs (Python version floor, venv commands, activate commands per platform, install + verify command templates). Re-read at every invocation. |
| `resources/flask-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/verification-checklist.md` | Detailed troubleshooting steps. |
| `docs/flask-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
## Troubleshooting Quick Reference
See `resources/verification-checklist.md` for detailed steps.
**Most common issues:**
1. **Forgot to activate virtual environment** → See Step 4
2. **Python not in PATH** → Reinstall Python with "Add to PATH" checked
3. **Wrong directory** → Use `cd` to navigate to project folder
4. **Permission errors** → Virtual environment not activated
5. **Port/firewall issues** → Will address when running server
## Next Steps
- Create first Flask route
- Learn about Flask's development server
- Understand request/response cycle
- Build first web page
---
**Remember:** Keep terminal window with `(venv)` open while developing!

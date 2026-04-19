---
name: flask-setup
description: Set up Python Flask development environment for beginners with step-by-step guidance, virtual environment creation, and troubleshooting
type: invokable
version: "1.0.1"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [flask, python, virtualenv, pip]
copyright: "Rubrical Works (c) 2026"
---
# Flask Setup for Beginners
Guides beginners through Flask environment setup with verification steps.
## When to Use
- User wants to build a Flask web app
- Beginner needs Flask environment setup
- "How do I set up Flask?" / "start a Flask project?"
- Project is a web app using Flask / Python web API / server
- Flask tutorial or learning resources needed
## Instructions for ASSISTANT
**CRITICAL:** Format ALL technical instructions as **Claude Code copy/paste blocks**.
**DO NOT provide manual instructions** (no "Open File Explorer", "Navigate", "Right-click", "Type in terminal").
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
**What:** Opens CLI in project directory
**Verify:** project folder path in terminal
### Responsibility Acknowledgement Gate
Implements `responsibility-gate` pattern. See `Skills/responsibility-gate/SKILL.md`.
- **Fires:** before creating virtualenv and `pip install flask`.
- **Asks:** accept responsibility for changes to Python env, project dir, installed packages, venv folder.
- **On decline:** exit cleanly; "Declined — no changes made."
- **Persistence:** per-invocation.
Use `AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`.
### STEP 3: Create Virtual Environment
```bash
python -m venv venv
```
**What:** creates isolated Python env; installs packages separately from system; prevents conflicts.
**Why:** isolated dependencies; per-project versions; portable/reproducible.
**Wait:** 10-30 seconds
**Verify:** new `venv` folder exists
**Common issues:**
- "python: command not found" → not installed or not in PATH; install from python.org; Windows: check "Add Python to PATH"
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
**What:** switches terminal to venv's Python; installs go into env only.
**Success:** `(venv)` prefix in prompt.
**Example:**
```
Before: C:\Projects\my-app>
After:  (venv) C:\Projects\my-app>
```
**Common issues:**
- "Execution policy error" (Windows) → run as Admin:
  ```bash
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- Nothing happens → check you're in project dir
- `(venv)` missing → close/reopen terminal
### STEP 5: Install Flask
```bash
pip install flask
```
**What:** downloads Flask from PyPI into venv; available for import.
**Wait:** 30-60 seconds
**You'll see:** download progress; "Successfully installed flask-X.X.X"
**Installed:** Flask, Werkzeug, Jinja2, Click, dependencies
**Common issues:**
- "pip: command not found" → venv not activated (Step 4)
- Slow → normal if internet slow
- Permission errors → venv not activated
### STEP 6: Create app.py File
1. Open text editor (VS Code, Sublime, PyCharm, Notepad++)
2. Create new file
3. Save as `app.py` in project folder (same level as `venv`)
**Recommended editors:** VS Code (free, Python support), PyCharm Community (free), Sublime Text, Notepad++
**Location:**
```
my-project/
├── venv/           ← Virtual environment folder
└── app.py          ← Your main Flask file (create this)
```
**Don't create app.py inside venv!**
### STEP 7: Verify Installation
**Check Python version:**
```bash
python --version
```
Expected: `Python 3.8.x`+
**Check installed packages:**
```bash
pip list
```
Expected:
```
Package      Version
------------ -------
click        X.X.X
Flask        X.X.X
Jinja2       X.X.X
Werkzeug     X.X.X
```
**Test Flask import:**
```bash
python -c "import flask; print(flask.__version__)"
```
Expected: Flask version (e.g., `3.0.0`)
### STEP 8: Report Completion
- "Setup complete! I see (venv) and Flask is installed"
- Or: "Stuck at step X with error: [exact error]"
## What Happens Next
1. Create first Flask route
2. Write "Hello World"
3. Start Flask dev server
4. View first web page
## Troubleshooting Quick Reference
See `resources/verification-checklist.md`.
**Most common issues:**
1. Forgot to activate venv → Step 4
2. Python not in PATH → reinstall with "Add to PATH"
3. Wrong directory → `cd` to project folder
4. Permission errors → venv not activated
5. Port/firewall → addressed when running server
## Next Steps
- Create first Flask route
- Learn dev server
- Understand request/response cycle
- Build first web page
**Remember:** Keep terminal with `(venv)` open while developing.

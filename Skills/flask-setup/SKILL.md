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

Guides beginners through setting up a Flask development environment.

## When to Use
- User wants to build a Flask web application
- Beginner needs Flask environment setup
- "How do I set up Flask?" / "How do I start a Flask project?"
- Project type is Flask web app
- Building Python web API/server
- Flask tutorial/learning needed

## Instructions for ASSISTANT

**CRITICAL OUTPUT FORMAT:** Format ALL technical instructions as **Claude Code copy/paste blocks**.

DO NOT provide manual instructions like "Open File Explorer", "Navigate to folder", "Right-click", "Type in terminal".

ALWAYS format as:
```
TASK: Set up Flask project

STEP 1: Copy this entire code block (including this line)
STEP 2: Open Claude Code
STEP 3: Paste into Claude Code
STEP 4: Claude Code will execute and report results
STEP 5: Report back: What did Claude Code say?

[Instructions for Claude Code to execute:]

cd [project-location]
mkdir [project-name]
cd [project-name]
python --version
python -m venv venv

[continue with commands...]

Report:
- What results did you see?
```

## Setup Knowledge

ASSISTANT must convert this into Claude Code commands.

### Create Project and Verify Python
- Opens CLI in project directory
- Verify: project folder path shown in terminal

### STEP 3: Create Virtual Environment
```bash
python -m venv venv
```
- Creates isolated Python environment for the project
- Installs packages separately from system Python
- Prevents project conflicts; portable/reproducible
- Wait: 10-30 seconds
- Verify: new `venv` folder exists

Common issues:
- "python: command not found" → Python not installed/not in PATH. Install from python.org; on Windows check "Add Python to PATH"
- "python3" instead → Try `python3 -m venv venv`

### STEP 4: Activate Virtual Environment

Windows PowerShell:
```bash
venv\Scripts\Activate.ps1
```
Windows Command Prompt:
```bash
venv\Scripts\activate.bat
```
Mac/Linux:
```bash
source venv/bin/activate
```

- Switches terminal to venv Python; installed packages stay in venv
- Success: `(venv)` appears in terminal prompt

Example:
```
Before: C:\Projects\my-app>
After:  (venv) C:\Projects\my-app>
```

Common issues:
- "Execution policy error" (Windows) → Run PowerShell as Admin:
  ```bash
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- Nothing happens → ensure in project directory
- `(venv)` doesn't appear → close/reopen terminal

### STEP 5: Install Flask
```bash
pip install flask
```
- Downloads Flask from PyPI into venv
- Wait: 30-60 seconds
- Success: "Successfully installed flask-X.X.X"
- Installs: Flask, Werkzeug, Jinja2, Click, deps

Common issues:
- "pip: command not found" → venv not activated (Step 4)
- Slow → normal on slow internet
- Permission errors → venv not activated

### STEP 6: Create app.py File
1. Open editor (VS Code, Sublime, PyCharm, Notepad++)
2. Create new file
3. Save as `app.py` in project folder (same level as `venv`)

Recommended editors: VS Code, PyCharm Community, Sublime Text, Notepad++

Layout:
```
my-project/
├── venv/           ← Virtual environment folder
└── app.py          ← Your main Flask file (create this)
```
**Don't create app.py inside the venv folder!**

### STEP 7: Verify Installation

Check Python version:
```bash
python --version
```
Expected: `Python 3.8.x` or higher

Check installed packages:
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

Test Flask import:
```bash
python -c "import flask; print(flask.__version__)"
```
Expected: Flask version (e.g., `3.0.0`)

### STEP 8: Report Completion
- "Setup complete! I see (venv) in my terminal and Flask is installed"
- Or: "I got stuck at step X with error: [exact error message]"

## What Happens Next
1. ASSISTANT guides creating first Flask route
2. Write "Hello World" application
3. Start Flask development server
4. View first web page in browser

## Troubleshooting Quick Reference

See `resources/verification-checklist.md` for details.

Most common issues:
1. Forgot to activate venv → Step 4
2. Python not in PATH → Reinstall with "Add to PATH"
3. Wrong directory → `cd` to project folder
4. Permission errors → venv not activated
5. Port/firewall issues → addressed when running server

## Next Steps
- Create first Flask route
- Learn Flask's development server
- Understand request/response cycle
- Build first web page

**Remember:** Keep terminal with `(venv)` open while developing!

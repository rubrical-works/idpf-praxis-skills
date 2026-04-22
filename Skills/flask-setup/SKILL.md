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
Guides beginners through Flask env setup with verification.
## When to Use
- Build Flask web app / Python web API or server
- Beginner needs Flask env setup
- User asks "How do I set up Flask?"
- Flask tutorial/learning needed
## Instructions for ASSISTANT
**CRITICAL:** Format ALL technical instructions as **Claude Code copy/paste blocks**.
DO NOT provide manual instructions ("Open File Explorer", "Navigate", "Right-click", "Type in terminal").
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
Convert the following into Claude Code commands:
### Create Project and Verify Python
- Opens CLI in project dir; verify project path shown in terminal.
### Responsibility Acknowledgement Gate
Implements `responsibility-gate` skill (see `Skills/responsibility-gate/SKILL.md`).
- **Fires:** before creating virtualenv and running `pip install flask` in user's project dir.
- **Asks:** acceptance of responsibility for changes to Python env, project dir, installed packages, venv folder.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation. Re-fires every run; acceptance never persisted.
Use `AskUserQuestion` with required options (`"I accept responsibility — proceed"`, `"Decline — exit without changes"`).
### STEP 3: Create Virtual Environment
```bash
python -m venv venv
```
- Creates isolated Python env; packages separate from system; prevents conflicts.
- Wait: 10-30s. Verify: new `venv` folder.
- Issues: "python: command not found" → install from python.org, check "Add Python to PATH" (Windows). Try `python3 -m venv venv`.
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
- Switches terminal to venv Python; packages install into env only.
- Success: `(venv)` prefix on prompt. Example: `(venv) C:\Projects\my-app>`.
- Issues: "Execution policy error" (Windows) →
  ```bash
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
  Nothing happens → check project dir. `(venv)` missing → reopen terminal.
### STEP 5: Install Flask
```bash
pip install flask
```
- Downloads Flask + deps (Werkzeug, Jinja2, Click) into venv.
- Wait: 30-60s. Ends with "Successfully installed flask-X.X.X".
- Issues: "pip: command not found" → venv not activated (Step 4). Permission errors → venv not activated.
### STEP 6: Create app.py File
1. Open editor (VS Code, PyCharm Community, Sublime, Notepad++)
2. Create new file
3. Save as `app.py` in project folder (same level as `venv`)
```
my-project/
├── venv/           ← Virtual environment folder
└── app.py          ← Your main Flask file (create this)
```
**Do NOT create app.py inside the venv folder.**
### STEP 7: Verify Installation
```bash
python --version
```
Expected: `Python 3.8.x` or higher.
```bash
pip list
```
Expected: Flask + deps (click, Flask, Jinja2, Werkzeug).
```bash
python -c "import flask; print(flask.__version__)"
```
Expected: Flask version (e.g., `3.0.0`).
### STEP 8: Report Completion
- "Setup complete! I see (venv) and Flask is installed", or
- "Stuck at step X with error: [exact error]"
## What Happens Next
1. Guide through first Flask route
2. Write "Hello World" app
3. Start dev server
4. View first web page
## Troubleshooting
See `resources/verification-checklist.md`.
Most common:
1. Forgot to activate venv → Step 4
2. Python not in PATH → reinstall with "Add to PATH"
3. Wrong directory → `cd` to project folder
4. Permission errors → venv not activated
5. Port/firewall → addressed at server run
## Next Steps
- First Flask route; dev server; request/response cycle; first web page.
---
**Remember:** Keep terminal with `(venv)` open while developing.

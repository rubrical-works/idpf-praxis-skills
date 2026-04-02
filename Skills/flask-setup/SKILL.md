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
Guides complete beginners through setting up a Flask development environment with detailed explanations and verification steps.
## When to Use This Skill
- User wants to build a Flask web application
- User is a beginner and needs Flask environment setup
- User asks "How do I set up Flask?" or "How do I start a Flask project?"
- Building a Python web API or Python web server
- Flask tutorial or learning resources needed
## Instructions for ASSISTANT
**CRITICAL OUTPUT FORMAT:** Format ALL technical instructions as **Claude Code copy/paste blocks**.
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
### STEP 3: Create Virtual Environment
```bash
python -m venv venv
```
- Creates isolated Python environment for this project
- Prevents conflicts between different projects
- Makes project portable and reproducible
**Wait time:** 10-30 seconds
**Verify:** New `venv` folder in project directory
**Common issues:**
- "python: command not found" -> Python not installed or not in PATH. Install from python.org, check "Add Python to PATH"
- Try `python3 -m venv venv` if `python` doesn't work
### STEP 4: Activate Virtual Environment
**Windows PowerShell:** `venv\Scripts\Activate.ps1`
**Windows Command Prompt:** `venv\Scripts\activate.bat`
**Mac/Linux:** `source venv/bin/activate`
**Success indicator:** `(venv)` appears at start of terminal prompt
**Common issues:**
- "Execution policy error" (Windows): `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Nothing happens: make sure you're in the project directory
### STEP 5: Install Flask
```bash
pip install flask
```
Installs Flask and dependencies (Werkzeug, Jinja2, Click) into virtual environment.
**Wait time:** 30-60 seconds
**Common issues:**
- "pip: command not found" -> Virtual environment not activated
- Permission errors -> Virtual environment not activated
### STEP 6: Create app.py File
```
my-project/
├── venv/           <- Virtual environment folder
└── app.py          <- Your main Flask file (create this)
```
**Don't create app.py inside the venv folder!**
### STEP 7: Verify Installation
```bash
python --version
pip list
python -c "import flask; print(flask.__version__)"
```
Expected: Python 3.8+, Flask in pip list, Flask version number prints.
## Troubleshooting Quick Reference
See `resources/verification-checklist.md` for detailed troubleshooting steps.
1. **Forgot to activate virtual environment** -> See Step 4
2. **Python not in PATH** -> Reinstall Python with "Add to PATH" checked
3. **Wrong directory** -> Use `cd` to navigate to project folder
4. **Permission errors** -> Virtual environment not activated
5. **Port/firewall issues** -> Will address when running server
## Next Steps
Once setup is complete:
- Create your first Flask route
- Learn about Flask's development server
- Understand the request/response cycle
- Build your first web page
**Remember:** Keep the terminal window with `(venv)` open while developing!

# Flask Setup Verification Checklist
**Version:** v0.12.3
## Visual Verification
### 1. Terminal Shows (venv)
```
✓ Correct:   (venv) C:\Projects\my-app>
✗ Wrong:     C:\Projects\my-app>
```
If missing, activate: Windows: `venv\Scripts\activate` | Mac/Linux: `source venv/bin/activate`
### 2. Project Folder Structure
```
my-project/
├── venv/              ✓ This folder exists
│   ├── Scripts/       ✓ (Windows) or bin/ (Mac/Linux)
│   ├── Lib/           ✓ (Windows) or lib/ (Mac/Linux)
│   └── ...
└── app.py             ✓ You created this
```
### 3. Python Version Check
```bash
python --version
```
**Expected:** Python 3.8.0 or higher. If wrong: using system Python, not venv Python.
### 4. Flask Installation Check
```bash
pip show flask
```
**Expected:** Name: Flask, Location: .../venv/lib/python3.X/site-packages
**If "Package not found":** Run `pip install flask`
## Command-by-Command Verification
### Test 1: Virtual Environment Active
```bash
which python    # Mac/Linux
where python    # Windows
```
**Expected:** Path points to project's venv folder
- ✓ Correct: `.../my-project/venv/Scripts/python.exe`
- ✗ Wrong: `C:/Python39/python.exe` (system Python)
### Test 2: Flask Importable
```bash
python -c "import flask; print('Flask works!')"
```
**Expected:** `Flask works!`
### Test 3: Pip Points to Venv
```bash
pip --version
```
**Expected:** Path shows venv location
## Common Problems and Solutions
### "python: command not found"
1. Install Python from python.org
2. Check "Add Python to PATH" during installation
3. Restart terminal after installation
4. On Mac, try `python3` instead of `python`
### "(venv) doesn't appear"
1. Ensure you're in the project directory
2. Windows PowerShell: `venv\Scripts\Activate.ps1`
3. Windows CMD: `venv\Scripts\activate.bat`
4. Mac/Linux: `source venv/bin/activate`
5. If still failing, recreate: `python -m venv venv`
### "pip install flask" uses system Python
1. Activate venv first
2. Verify `(venv)` in prompt
3. Then run `pip install flask`
### "ExecutionPolicy" error (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
### "ModuleNotFoundError: No module named 'flask'"
```bash
# Activate venv first
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
# Install Flask
pip install flask
# Verify
pip list | grep -i flask  # Mac/Linux
pip list | findstr /i flask  # Windows
```
### Files in wrong location
```
WRONG:                          CORRECT:
my-project/                     my-project/
└── venv/                       ├── venv/
    └── app.py  ← WRONG!       └── app.py  ← Same level as venv
```
## Final Verification Steps
- [ ] Terminal shows `(venv)` in prompt
- [ ] `python --version` shows 3.8 or higher
- [ ] `pip list` shows Flask
- [ ] `python -c "import flask"` runs without error
- [ ] `app.py` exists in project root (not in venv folder)
- [ ] Text editor is open and ready
## If Something Doesn't Work
Report to ASSISTANT with:
1. Which step failed (be specific)
2. Exact error message (copy/paste everything)
3. Output of: `python --version`, `pip --version`, `pip list`

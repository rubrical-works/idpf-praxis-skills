# Flask Setup Verification Checklist
**Version:** v0.4.0

Use this checklist to verify your Flask setup is correct.

## Visual Verification

### 1. Terminal Shows (venv)
```
✓ Correct:   (venv) C:\Projects\my-app>
✗ Wrong:     C:\Projects\my-app>
```

If you don't see `(venv)`, activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

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
**Expected:** Python 3.8.0 or higher
**If wrong:** Using system Python, not venv Python - activate venv!

### 4. Flask Installation Check
```bash
pip show flask
```
**Expected output:**
```
Name: Flask
Location: .../venv/lib/python3.X/site-packages
```

**If "Package not found":** Flask not installed - run `pip install flask`

## Command-by-Command Verification

### Test 1: Virtual Environment Active
```bash
which python    # Mac/Linux
where python    # Windows
```

**Expected:** Path should point to your project's venv folder
- ✓ Correct: `.../my-project/venv/Scripts/python.exe`
- ✗ Wrong: `C:/Python39/python.exe` (system Python)

### Test 2: Flask Importable
```bash
python -c "import flask; print('Flask works!')"
```

**Expected output:** `Flask works!`
**If error:** Flask not installed or venv not activated

### Test 3: Pip Points to Venv
```bash
pip --version
```

**Expected:** Path should show venv location
- ✓ Correct: `pip 23.x.x from .../my-project/venv/lib/...`
- ✗ Wrong: System-wide pip location

## Common Problems and Solutions

### Problem: "python: command not found"
**Cause:** Python not installed or not in PATH

**Solutions:**
1. Install Python from python.org
2. During installation, check "Add Python to PATH"
3. Restart terminal after installation
4. On Mac, might need `python3` instead of `python`

### Problem: "(venv) doesn't appear"
**Cause:** Virtual environment not activated

**Solutions:**
1. Make sure you're in the project directory
2. Windows PowerShell: `venv\Scripts\Activate.ps1`
3. Windows CMD: `venv\Scripts\activate.bat`
4. Mac/Linux: `source venv/bin/activate`
5. If still doesn't work, recreate venv: `python -m venv venv`

### Problem: "pip install flask" uses system Python
**Cause:** Virtual environment not activated

**Solution:**
1. Activate venv first
2. Verify `(venv)` appears in prompt
3. Then run `pip install flask`

### Problem: "ExecutionPolicy" error (Windows)
**Cause:** PowerShell script execution disabled

**Solution:**
Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating venv again.

### Problem: "ModuleNotFoundError: No module named 'flask'"
**Causes:**
1. Flask not installed
2. Virtual environment not activated
3. Running wrong Python

**Solution:**
```bash
# Activate venv first
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Verify activation
# Should see (venv) in prompt

# Install Flask
pip install flask

# Verify installation
pip list | grep -i flask  # Mac/Linux
pip list | findstr /i flask  # Windows
```

### Problem: Files in wrong location
**Wrong structure:**
```
my-project/
└── venv/
    └── app.py  ← WRONG! Not inside venv!
```

**Correct structure:**
```
my-project/
├── venv/       ← Virtual environment folder
└── app.py      ← Your code files (same level as venv)
```

**Solution:** Move app.py out of venv folder to project root

## Final Verification Steps

Before proceeding with development, ensure ALL these are true:

- [ ] Terminal shows `(venv)` in prompt
- [ ] `python --version` shows 3.8 or higher
- [ ] `pip list` shows Flask
- [ ] `python -c "import flask"` runs without error
- [ ] `app.py` exists in project root (not in venv folder)
- [ ] Text editor is open and ready

## If Everything Works

You should be able to:
1. See `(venv)` in your terminal prompt ✓
2. Import Flask without errors ✓
3. Have app.py file in correct location ✓

**You're ready to start coding!** Return to the ASSISTANT for next steps.

## If Something Doesn't Work

**Report to ASSISTANT with:**
1. Which step failed (be specific)
2. Exact error message (copy/paste everything)
3. Output of these commands:
   ```bash
   python --version
   pip --version
   pip list
   ```

The ASSISTANT will help you troubleshoot!

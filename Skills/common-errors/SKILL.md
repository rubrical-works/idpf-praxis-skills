---
name: common-errors
description: Diagnose and solve common beginner programming mistakes in Flask or Sinatra development with detailed explanations
type: educational
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: code-quality
relevantTechStack: [flask, sinatra, python, ruby]
copyright: "Rubrical Works (c) 2026"
---

# Common Beginner Coding Errors

This Skill helps beginners diagnose and fix the most common errors encountered when learning Flask or Sinatra web development.

## When to Use This Skill

Invoke this Skill when:
- Beginner reports an error message
- Code isn't working as expected
- Application behavior seems wrong
- User asks "Why isn't this working?"
- Common patterns of mistakes are detected
- Application crashes unexpectedly
- Need help reading exception messages or stack traces
- Framework-specific errors (Flask, Sinatra, Python, Ruby)

## How to Use This Skill

1. **Identify the error** from user's report
2. **Find the matching error pattern** below
3. **Apply the solution** with explanation
4. **Verify the fix** worked

## Common Errors by Category

### 1. File Management Errors

#### Error: Changes Don't Appear When Refreshing Browser

**Symptoms:**
- Modified code but browser shows old version
- Added new route but getting 404
- Changed text but still seeing old text

**Diagnosis:**
Ask the user:
1. Did you save the file? (Check for unsaved indicator: ● or *)
2. Did you restart the server? (Flask auto-reloads with debug=True, Sinatra doesn't)
3. Are you editing the correct file?

**Solutions:**

**Solution 1: File Not Saved**
```
The most common beginner mistake!

Steps to fix:
1. Look at your editor's file tab
2. See a dot (●) or asterisk (*)? File not saved!
3. Press Ctrl+S (Windows/Linux) or Cmd+S (Mac)
4. The indicator should disappear
5. Now refresh browser

Pro tip: Get in the habit - Edit → Save → Test → Repeat
```

**Solution 2: Server Not Restarted (Sinatra)**
```
Sinatra doesn't auto-reload by default.

Steps to fix:
1. Go to terminal where server is running
2. Press Ctrl+C (stops the server)
3. Run again: ruby app.rb
4. Refresh browser

Flask users: Make sure debug=True is set for auto-reload
```

**Solution 3: Browser Cache**
```
Sometimes browser shows cached (old) version.

Hard refresh:
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R
- Or: Ctrl+F5 (Windows)

This forces browser to get fresh copy.
```

#### Error: Template Not Found

**Error messages:**
- Flask: `TemplateNotFound: index.html`
- Sinatra: `Errno::ENOENT: No such file or directory @ rb_sysopen - views/index.erb`

**Cause:** Template file in wrong location or named incorrectly

**Solution:**

**Flask:**
```
Flask requires templates in specific folder structure:

Correct structure:
my-project/
├── app.py
└── templates/      ← Must be named exactly "templates"
    └── index.html  ← Your HTML files here

Common mistakes:
✗ template/    (missing 's')
✗ Templates/   (wrong capitalization)
✗ html/        (wrong folder name)
✗ index.html in project root (not in templates/)

Fix:
1. Create folder named exactly: templates
2. Move HTML files into templates/
3. Restart server
```

**Sinatra:**
```
Sinatra requires views folder:

Correct structure:
my-project/
├── app.rb
└── views/         ← Must be named exactly "views"
    └── index.erb  ← Your ERB templates here

Common mistakes:
✗ Views/       (wrong capitalization)
✗ templates/   (wrong folder name)
✗ index.erb in project root

Fix:
1. Create folder named exactly: views
2. Move .erb files into views/
3. Restart server
```

### 2. Python-Specific Errors

#### Error: IndentationError

**Error message:**
```
IndentationError: expected an indented block
IndentationError: unindent does not match any outer indentation level
```

**Cause:** Python cares about spaces/tabs at start of lines

**Explanation for beginners:**
```
Python uses indentation (spaces) to group code.
Other languages use { } braces, Python uses spaces.

Think of it like organizing an outline:
- Main topic
    - Subtopic (indented 4 spaces)
    - Another subtopic (same indent level)
```

**Examples:**

**Wrong:**
```python
def my_function():
print("hello")  # ✗ Not indented!
```

**Right:**
```python
def my_function():
    print("hello")  # ✓ Indented 4 spaces
```

**Wrong:**
```python
if user_name:
    print("Hello")
  print("Welcome")  # ✗ Wrong indent (2 spaces vs 4)
```

**Right:**
```python
if user_name:
    print("Hello")
    print("Welcome")  # ✓ Both 4 spaces
```

**Solution:**
```
1. Use 4 spaces for each indentation level (Python standard)
2. Don't mix tabs and spaces
3. Configure editor to insert 4 spaces when you press Tab
4. Check that all lines in a block have same indentation

Most editors have "Show Whitespace" option - turn it on!
```

#### Error: ModuleNotFoundError: No module named 'flask'

**Error message:**
```
ModuleNotFoundError: No module named 'flask'
ImportError: No module named flask
```

**Cause:** Flask not installed OR virtual environment not activated

**Diagnosis Steps:**
```
Ask user:
1. Do you see (venv) at start of terminal prompt?
2. If yes: Flask might not be installed
3. If no: Virtual environment not activated
```

**Solution 1: Virtual Environment Not Activated**
```
Most common cause for beginners!

Look at terminal prompt:
✗ Wrong:  C:\Projects\my-app>
✓ Correct: (venv) C:\Projects\my-app>

Fix:
Windows: venv\Scripts\activate
Mac/Linux: source venv/bin/activate

After activation, you should see (venv) appear.
Then try running your app again.
```

**Solution 2: Flask Not Installed**
```
If (venv) IS shown but still getting error:

1. Verify activation: pip --version
   Should show path inside venv folder

2. Install Flask:
   pip install flask

3. Verify installation:
   pip list | grep -i flask  (Mac/Linux)
   pip list | findstr /i flask  (Windows)

4. Should see Flask in the list now
```

**Solution 3: Running Wrong Python**
```
You might have multiple Python installations.

Check which Python you're using:
python --version
which python  (Mac/Linux)
where python  (Windows)

Should point to venv folder:
✓ .../my-project/venv/Scripts/python.exe
✗ C:/Python39/python.exe  (system Python)

If wrong Python:
1. Make sure venv activated (see Solution 1)
2. Close and reopen terminal
3. Navigate to project folder
4. Activate venv again
```

### 3. Ruby/Sinatra-Specific Errors

#### Error: uninitialized constant Sinatra (NameError)

**Error message:**
```
NameError: uninitialized constant Sinatra
```

**Cause:** Sinatra gem not installed or not loaded

**Solution:**
```
Step 1: Check if Sinatra installed
bundle list | grep sinatra

If not listed:
1. Check Gemfile exists with:
   gem 'sinatra'
2. Run: bundle install
3. Verify: bundle list shows sinatra

Step 2: Check require statement
File must start with:
require 'sinatra'

Step 3: Run with bundler
Instead of: ruby app.rb
Use: bundle exec ruby app.rb

This ensures bundler loads the correct gems.
```

### 4. Route/URL Errors

#### Error: 404 Not Found

**Symptoms:**
- Visiting route shows "Not Found" or 404 error
- URL works in one route but not another

**Common Causes:**

**Cause 1: Typo in URL**
```
Code defines:    @app.route('/about')
Browser visits:  http://localhost:5000/abotu  ← Typo!
Result:          404 Not Found

Fix: Check spelling in both code and browser
Routes are case-sensitive: /About ≠ /about
```

**Cause 2: Route Not Defined**
```
You're visiting a URL that doesn't exist in code.

Example:
- Code has: @app.route('/')
- Trying to visit: /about
- Result: 404 (because /about doesn't exist)

Fix: Add the route to your code!

Flask:
@app.route('/about')
def about():
    return "About page"

Sinatra:
get '/about' do
  "About page"
end
```

**Cause 3: Wrong HTTP Method**
```
Common with forms.

Code expects:    POST /add
Form sends:      GET /add
Result:          405 Method Not Allowed

Flask fix:
@app.route('/add', methods=['GET', 'POST'])

Sinatra fix:
post '/add' do
  # Handle POST only
end

get '/add' do
  # Handle GET only
end
```

### 5. Server Errors

#### Error: Address Already in Use

**Error messages:**
- Flask: `OSError: [Errno 48] Address already in use`
- Sinatra: `Address already in use - bind(2)`

**Cause:** Port (5000 or 4567) already being used by another process

**Explanation:**
```
Think of ports like doors:
- Only one program can use a door at a time
- If door is occupied, new program can't use it
- Flask uses door 5000, Sinatra uses 4567
```

**Solution 1: Find and Stop the Other Server**
```
You probably have the server running in another terminal.

Steps:
1. Look for other terminal windows
2. Find one with server running
3. Press Ctrl+C there to stop it
4. Try starting your server again
```

**Solution 2: Kill the Process (if you closed terminal)**

**Mac/Linux:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill it (replace PID with actual process ID)
kill <PID>
```

**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID)
taskkill /PID <PID> /F
```

**Solution 3: Use Different Port**

**Flask:**
```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Use port 5001 instead
```

**Sinatra:**
```ruby
set :port, 4568  # Use port 4568 instead
```

### 6. Function/Route Errors

#### Error: Nothing Returned from Route

**Symptoms:**
- Blank page in browser
- Error about None/nil being returned

**Cause:** Route function doesn't return anything

**Examples:**

**Flask - Wrong:**
```python
@app.route('/')
def home():
    notes = get_notes()
    # Forgot to return something!
```

**Flask - Right:**
```python
@app.route('/')
def home():
    notes = get_notes()
    return render_template('index.html', notes=notes)  # ✓ Returns template
```

**Sinatra - Wrong:**
```ruby
get '/' do
  @notes = get_notes
  # Nothing here means it returns nil
end
```

**Sinatra - Right:**
```ruby
get '/' do
  @notes = get_notes
  erb :index  # ✓ Returns template
end
```

**Explanation:**
```
Routes MUST return something to send to browser:
- HTML string
- Template rendering
- Redirect
- JSON data

If nothing returned, Flask returns None, Sinatra returns nil.
Browser gets empty response.
```

## Error Diagnosis Process

When user reports an error:

### Step 1: Get Complete Error Information
```
Ask for:
1. Exact error message (full text, not summary)
2. Which file/line number
3. What they were trying to do
4. Output from terminal
```

### Step 2: Identify Error Category
```
Look for keywords:
- "IndentationError" → Python indentation
- "TemplateNotFound" → File location
- "ModuleNotFoundError" → Import/installation
- "404" → Route/URL problem
- "Address already in use" → Port conflict
- "NameError" → Missing variable/constant
```

### Step 3: Guide to Solution
```
1. Explain what caused the error (use analogies)
2. Show exact steps to fix
3. Explain why fix works (learning opportunity)
4. Have user verify fix worked
```

### Step 4: Teach Prevention
```
After fixing, explain:
- How to avoid this error in future
- What to look for
- Best practices

Example: "To prevent this, always save files before testing"
```

## Additional Resources

For framework-specific errors:
- See `resources/flask-errors.md` for Flask-specific issues
- See `resources/sinatra-errors.md` for Sinatra-specific issues
- See `resources/general-errors.md` for language-agnostic issues

## Debugging Mindset for Beginners

Teach users this process:

```
1. Read the Error
   - Don't panic!
   - Error messages are helpful, not scary
   - They tell you exactly what's wrong

2. Find the Location
   - Error shows file and line number
   - Look at that specific line

3. Form a Hypothesis
   - What might be wrong?
   - Does code match examples?
   - Are names spelled correctly?

4. Test the Hypothesis
   - Make one small change
   - Test if it works
   - If not, try something else

5. Learn from It
   - You'll remember this error
   - You're building debugging skills
   - Every developer goes through this!
```

## Encouragement Messages

When user fixes error themselves:
```
"Excellent debugging! You found and fixed it yourself.
That's a valuable skill you're building!"
```

When user struggles:
```
"Bugs are normal - even experienced developers deal with them daily.
The process of finding and fixing errors makes you a better developer.
Let's solve this together!"
```

When same error happens again:
```
"This error again? Perfect! Now you'll remember it even better.
Repetition is how we learn. What was the fix last time?"
```

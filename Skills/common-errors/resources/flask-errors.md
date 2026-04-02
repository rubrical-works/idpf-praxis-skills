# Flask-Specific Errors
**Version:** v0.6.0

## Import/Routing Errors

### werkzeug.routing.BuildError
**Cause:** Using `url_for()` with wrong function name

**Wrong:**
```python
return redirect(url_for('homepage'))  # Function is named 'home' not 'homepage'
```

**Right:**
```python
return redirect(url_for('home'))  # Matches @app.route def home():
```

### jinja2.exceptions.UndefinedError
**Cause:** Template references variable that wasn't passed

**Wrong:**
```python
@app.route('/')
def home():
    return render_template('index.html')  # Missing 'notes' variable
```

**Fix:**
```python
return render_template('index.html', notes=notes)  # Pass all required variables
```

---

## Request Errors

### werkzeug.exceptions.BadRequest: 400
**Cause:** Accessing form data that wasn't submitted

**Wrong:**
```python
note = request.form['note']  # KeyError if 'note' not in form
```

**Right:**
```python
note = request.form.get('note', '')  # Returns empty string if missing
```

---

## Context Errors

### RuntimeError: Working outside of application context
**Cause:** Using Flask features outside a request

**Wrong:**
```python
from flask import current_app
print(current_app.config['DEBUG'])  # No active context
```

**Right:**
```python
with app.app_context():
    print(current_app.config['DEBUG'])
```

---

## Template Errors

### jinja2.exceptions.TemplateSyntaxError
**Cause:** Invalid Jinja2 syntax

**Common mistakes:**
- Missing `{% endif %}` or `{% endfor %}`
- Unclosed variable tags: `{{ var` instead of `{{ var }}`
- Using `{{ }}` for control flow instead of `{% %}`

### TypeError: 'NoneType' object is not iterable
**Cause:** Template loops over None

**Fix:**
```python
users = get_users() or []  # Default to empty list if None
return render_template('index.html', users=users)
```

---

## Static File Errors

### Static files not loading (CSS/JS)
**Cause:** Wrong path or missing static folder

**Wrong:**
```html
<link rel="stylesheet" href="style.css">
```

**Right:**
```html
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
```

**Required structure:**
```
my-project/
├── app.py
├── static/       ← Must be named "static"
│   └── style.css
└── templates/
    └── index.html
```

---

## Debug Mode Errors

### Changes not auto-reloading
**Cause:** Debug mode not enabled

**Fix:**
```python
app.run(debug=True)  # Enables auto-reload
```

**Note:** Never use `debug=True` in production!

---

## Session Errors

### RuntimeError: The session is unavailable
**Cause:** Missing SECRET_KEY

**Fix:**
```python
app = Flask(__name__)
app.secret_key = 'your-secret-key'  # Required for sessions
```

---

## Redirect Errors

### Redirect to wrong location
**Cause:** Using string instead of url_for()

**Wrong:**
```python
return redirect('home')  # Redirects to URL "/home"
```

**Right:**
```python
return redirect(url_for('home'))  # Redirects to home() route
```

### Redirect loop
**Cause:** Route redirects to itself

**Wrong:**
```python
@app.route('/')
def home():
    return redirect(url_for('home'))  # Infinite loop!
```

**Fix:** Ensure redirects point to different routes.

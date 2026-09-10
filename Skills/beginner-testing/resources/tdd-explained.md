# TDD Explained for Beginners
**Version:** v0.18.0

## The TDD Cycle in Detail

### Phase 1: RED (Write Failing Test)

**Step 1: Decide what you want to build**
Example: "I want users to be able to edit notes"

**Step 2: Write a test for that feature**
```python
def test_edit_note():
    """Test that we can edit an existing note."""
    client = app.test_client()

    # Add a note
    client.post('/add', data={'note': 'Original text'})

    # Edit it
    response = client.post('/edit/1', data={'note': 'Updated text'})

    # Check it worked
    assert response.status_code == 302  # Redirect

    # Check updated text appears
    response = client.get('/')
    assert b'Updated text' in response.data
    assert b'Original text' not in response.data
```

**Step 3: Run the test**
```
✗ FAILED - 404 Not Found
```

It fails! That's expected - we haven't written the feature yet.

This is RED ✗

### Phase 2: GREEN (Make Test Pass)

**Step 1: Write minimum code to pass test**
```python
@app.route('/edit/<int:note_id>', methods=['POST'])
def edit_note(note_id):
    new_text = request.form['note']
    conn = get_db()
    conn.execute('UPDATE notes SET text = ? WHERE id = ?', (new_text, note_id))
    conn.commit()
    conn.close()
    return redirect('/')
```

**Step 2: Run test again**
```
✓ PASSED
```

Test passes! Feature works!

This is GREEN ✓

### Phase 3: REFACTOR (Clean Up)

**Step 1: Look at code - can it be better?**

Maybe extract database logic:
```python
def update_note(note_id, text):
    """Update note text in database."""
    conn = get_db()
    conn.execute('UPDATE notes SET text = ? WHERE id = ?', (text, note_id))
    conn.commit()
    conn.close()

@app.route('/edit/<int:note_id>', methods=['POST'])
def edit_note(note_id):
    new_text = request.form['note']
    update_note(note_id, new_text)
    return redirect('/')
```

**Step 2: Run tests again**
```
✓ PASSED
```

Still passes! Code is cleaner AND working.

This is REFACTOR

### Then Repeat for Next Feature!

## Why This Order?

### Traditional Approach:
1. Write code
2. Test manually in browser
3. "It works!"
4. Later: Discover it broke something else

### TDD Approach:
1. Write test (define "working")
2. Write code to pass test
3. Test proves it works
4. All previous tests still pass (nothing broke!)

## Real Example: Building a Notes App with TDD

### Iteration 1: Homepage

**RED - Write test:**
```python
def test_homepage_exists():
    response = client.get('/')
    assert response.status_code == 200
```
Run: ✗ FAIL (route doesn't exist)

**GREEN - Make it pass:**
```python
@app.route('/')
def home():
    return "Notes App"
```
Run: ✓ PASS

**REFACTOR:**
```python
@app.route('/')
def home():
    return render_template('index.html')
```
Run: ✓ PASS (still works, now uses template)

### Iteration 2: Add Note

**RED - Write test:**
```python
def test_add_note():
    response = client.post('/add', data={'note': 'Test'})
    assert response.status_code == 302  # Redirect
```
Run: ✗ FAIL (route doesn't exist)

**GREEN - Make it pass:**
```python
notes = []

@app.route('/add', methods=['POST'])
def add_note():
    notes.append(request.form['note'])
    return redirect('/')
```
Run: ✓ PASS

**REFACTOR:** (Not needed yet, code is simple)

### Iteration 3: Display Notes

**RED - Write test:**
```python
def test_notes_display():
    client.post('/add', data={'note': 'My note'})
    response = client.get('/')
    assert b'My note' in response.data
```
Run: ✗ FAIL (template doesn't show notes)

**GREEN - Make it pass:**
```python
@app.route('/')
def home():
    return render_template('index.html', notes=notes)
```
Run: ✓ PASS

### All Tests Still Pass!

After each iteration, run ALL tests:
```
test_homepage_exists ✓
test_add_note ✓
test_notes_display ✓
```

Nothing broke! Safe to continue.

## Benefits You'll Notice

**Week 1:**
- "This is annoying, writing tests takes time"
- But you catch bugs immediately

**Week 2:**
- "Wait, I just changed something and all tests still pass!"
- Confidence building

**Week 3:**
- "I refactored the whole database layer, tests caught 2 bugs"
- Saved hours of debugging

**Week 4:**
- "I can't imagine coding without tests now"
- You're a convert!

## Common TDD Patterns

### Pattern 1: ARRANGE-ACT-ASSERT

Every test has three parts:

```python
def test_something():
    # ARRANGE - Set up test data
    note = "Test note"

    # ACT - Do the thing you're testing
    response = client.post('/add', data={'note': note})

    # ASSERT - Check it worked
    assert response.status_code == 302
```

### Pattern 2: One Assert Per Test

**Bad (multiple things):**
```python
def test_everything():
    assert homepage_loads()
    assert can_add_note()
    assert can_delete_note()
```

**Good (one thing):**
```python
def test_homepage_loads():
    assert homepage_loads()

def test_can_add_note():
    assert can_add_note()

def test_can_delete_note():
    assert can_delete_note()
```

Why? When test fails, you know exactly what broke.

### Pattern 3: Test Names Describe Behavior

**Bad:**
```python
def test_1():
def test_2():
def test_feature():
```

**Good:**
```python
def test_homepage_returns_200():
def test_adding_note_redirects_to_homepage():
def test_empty_form_shows_error():
```

## When Tests Are Hard

If a test is hard to write, your code might have problems:

**Hard to test:**
```python
def add_note():
    text = request.form['note']
    conn = sqlite3.connect('notes.db')
    conn.execute('INSERT INTO notes (text) VALUES (?)', (text,))
    conn.commit()
    if len(text) > 100:
        send_email("Long note added")
    update_cache()
    log_to_file(text)
    return redirect('/')
```

Too many responsibilities! Hard to test.

**Easy to test:**
```python
def add_note():
    text = request.form['note']
    save_note(text)  # Separate function, easy to test
    return redirect('/')

def save_note(text):
    conn = get_db()
    conn.execute('INSERT INTO notes (text) VALUES (?)', (text,))
    conn.commit()
    conn.close()
```

TDD helps you write better code!

## TDD Workflow Tips

**1. Keep tests fast**
- Use test database
- Don't access network
- No sleep() delays

**2. Run tests often**
- After every small change
- Before committing code
- Make it a habit

**3. Trust your tests**
- If tests pass, code works
- If tests fail, investigate
- Don't ignore failing tests!

**4. Write test first**
- Resist urge to code first
- Test defines "done"
- Then code to pass test

## Resources for Learning More

After mastering basics:
- Fixtures (reusable test setup)
- Mocking (fake external services)
- Test coverage (what code is tested)
- Continuous Integration (auto-run tests)
- Test databases (separate from real data)

But first: Practice RED-GREEN-REFACTOR until it feels natural!

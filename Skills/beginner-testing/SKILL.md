---
name: beginner-testing
description: Introduce test-driven development to beginners with simple Flask/Sinatra test examples and TDD concepts
type: educational
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [flask, sinatra, python, ruby, tdd]
copyright: "Rubrical Works (c) 2026"
---

# Beginner Testing Introduction

This Skill introduces beginners to automated testing and Test-Driven Development (TDD) with simple, understandable examples.

## When to Use This Skill

Invoke this Skill when:
- User has working Vibe app ready to transition to Structured Phase
- User mentions "testing" or asks about "how to test"
- Evolution Point reached (user says "Ready-to-Structure")
- User has built 3-4 features and wants to add quality assurance
- User asks "How do I know if my code works?"

## Prerequisites

User should have:
- ✓ Working Flask or Sinatra app with 3-4 features
- ✓ Understanding of routes and functions
- ✓ Comfortable with basic programming concepts
- ✓ Code that works, but no tests yet

## What is Testing?

**Simple explanation for beginners:**

```
Testing means: Writing code that checks if your code works.

Without tests:
1. Make a change to code
2. Open browser
3. Click around manually
4. Hope nothing broke
5. Repeat for every change

With tests:
1. Make a change to code
2. Run tests (one command)
3. See green ✓ or red ✗
4. Know immediately if something broke
5. Fix before users see the problem!
```

**Real-world analogy:**
```
Building a car without tests:
- Build the car
- Try to drive it
- If it crashes, figure out what's wrong
- Repeat

Building a car with tests:
- Build brake system
- Test brakes before driving (✓ works)
- Build steering
- Test steering before driving (✓ works)
- Put it all together
- Everything already tested, confident it works!
```

## What is TDD (Test-Driven Development)?

**The TDD Cycle:**

```
RED → GREEN → REFACTOR

1. RED: Write a test that fails
   (Feature doesn't exist yet, so test fails)

2. GREEN: Write just enough code to make test pass
   (Make the feature work)

3. REFACTOR: Clean up the code
   (Make it better while tests still pass)

Then repeat for next feature!
```

**Why this order seems backwards:**

```
Beginners think: Write code → Test code
TDD says: Write test → Write code

Why?
- Test defines what "working" means
- You write only code needed to pass test
- No unused code
- Test proves it works
```

## Types of Tests (Simple Version)

### 1. Unit Tests
Tests individual functions/pieces

Example: Testing `add_numbers(2, 3)` returns `5`

### 2. Route Tests (Web Apps)
Tests that web pages load correctly

Example: Visiting `/` returns status 200 (success)

### 3. Integration Tests
Tests that different parts work together

Example: Submitting form adds note to database

**For beginners: Start with route tests!** Easiest to understand.

## Your First Test (Flask)

See `resources/flask-test-example.py` for complete example.

**Simplest possible test:**

```python
# test_app.py

def test_homepage_loads():
    """Test that homepage loads without errors."""
    from app import app

    # Create test client (fake browser)
    client = app.test_client()

    # Visit homepage
    response = client.get('/')

    # Check: Did it work?
    assert response.status_code == 200  # 200 = success
```

**What this test does:**
1. Imports your app
2. Creates a "fake browser" (test client)
3. Visits the homepage (`/`)
4. Checks if it got status code 200 (success)

**How to run:**
```bash
pip install pytest    # Install testing tool
pytest                # Run all tests
```

**Output if test passes:**
```
test_app.py ✓                                    [100%]
1 passed in 0.05s
```

## Your First Test (Sinatra)

See `resources/sinatra-test-example.rb` for complete example.

**Simplest possible test:**

```ruby
# test_app.rb

require 'minitest/autorun'
require 'rack/test'
require_relative 'app'

class AppTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  def test_homepage_loads
    # Visit homepage
    get '/'

    # Check: Did it work?
    assert last_response.ok?  # ok? means status 200
  end
end
```

**How to run:**
```bash
ruby test_app.rb
```

## Common Test Assertions

**Python (pytest):**
```python
assert something == True       # Must be True
assert value == 5              # Must equal 5
assert 'text' in response.data # Must contain 'text'
assert value != 0              # Must not equal 0
assert value > 10              # Must be greater than 10
```

**Ruby (minitest):**
```ruby
assert something               # Must be truthy
assert_equal 5, value          # Must equal 5
assert_includes body, 'text'   # Must contain 'text'
refute_equal 0, value          # Must not equal 0
```

## TDD Example: Adding a Feature

**Scenario:** Add feature to delete notes

**Step 1: RED - Write failing test**
```python
def test_delete_note():
    """Test that we can delete a note."""
    client = app.test_client()

    # Add a note first
    client.post('/add', data={'note': 'Test note'})

    # Try to delete it
    response = client.get('/delete/1')

    # Should redirect to homepage
    assert response.status_code == 302
```

**Run test:** It fails! (Route doesn't exist yet) ✗ RED

**Step 2: GREEN - Make test pass**
```python
@app.route('/delete/<int:note_id>')
def delete_note(note_id):
    conn = get_db()
    conn.execute('DELETE FROM notes WHERE id = ?', (note_id,))
    conn.commit()
    conn.close()
    return redirect('/')
```

**Run test:** It passes! ✓ GREEN

**Step 3: REFACTOR - Clean up**
Maybe extract database operations to functions. Tests still pass!

## Test Organization

**Good project structure:**

```
my-project/
├── app.py              # Your code
├── test_app.py         # Your tests
├── templates/
│   └── index.html
└── notes.db
```

**Test file naming:**
- Python: `test_*.py` or `*_test.py`
- Ruby: `*_test.rb` or `test_*.rb`

Pytest and Minitest auto-discover files with these names.

## Reading Test Output

**When tests pass (Green):**
```
test_app.py::test_homepage_loads ✓
test_app.py::test_add_note ✓
test_app.py::test_delete_note ✓

3 passed in 0.12s
```

**What this means:** All features work! 🎉

**When tests fail (Red):**
```
test_app.py::test_add_note ✗

FAILED test_app.py::test_add_note - AssertionError: assert 404 == 200

Expected 200, got 404
```

**What this means:** Something broke! Route not found (404).

## Why Tests Matter

**Scenario: Without tests**
```
Day 1: Build feature A - works!
Day 2: Build feature B - works!
Day 3: Build feature C - works!
Day 4: Discover feature A broke when adding C
Day 5: Fix A, accidentally break B
Day 6: Pull out hair
```

**Scenario: With tests**
```
Day 1: Build feature A + test - ✓
Day 2: Build feature B + test - ✓ (A still works)
Day 3: Build feature C + test - ✗ (Test shows A broke!)
Day 3: Fix C until all tests ✓
Day 4: Ship with confidence!
```

## What to Test

**For beginners, test:**
✓ Routes exist (not 404)
✓ Forms submit successfully
✓ Data saves to database
✓ Data displays correctly

**Don't worry yet about:**
- Edge cases
- Error handling
- Performance
- Security (except basics)

**Start simple, add complexity later!**

## Common Testing Mistakes

### 1. Not running tests
**Problem:** Write tests but forget to run them
**Solution:** Run tests after every change

### 2. Tests depend on order
**Problem:** Test 2 only passes if Test 1 runs first
**Solution:** Each test should work independently

### 3. Testing too much at once
**Problem:** One giant test that checks everything
**Solution:** Small tests, one thing each

### 4. Not testing the right thing
**Problem:** Test passes but feature is broken
**Solution:** Actually verify the important behavior

## Benefits of TDD for Beginners

**1. Clarity**
Test defines what "working" means before you code

**2. Confidence**
Know immediately when something breaks

**3. Better Code**
Testable code is usually better organized code

**4. Documentation**
Tests show how to use your code

**5. Less Fear**
Change code without worrying about breaking things

## Complete Examples

Full working examples with explanations:
- `resources/flask-test-example.py`
- `resources/sinatra-test-example.rb`
- `resources/tdd-explained.md`

These include:
- Multiple test examples
- How to test forms and database
- Common patterns
- How to organize tests

## Next Steps After First Tests

Once comfortable with basic testing:
- Add more route tests
- Test form submissions
- Test database operations
- Test error handling
- Learn fixtures (test data setup)
- Learn mocking (fake external services)

But first: Master the basics!

## Encouragement

```
Testing feels awkward at first - that's normal!

"Why write code to test code? Isn't that twice the work?"

Actually, it saves time:
- Catch bugs early (cheaper to fix)
- Change code confidently
- Sleep better at night

After a few weeks, you'll wonder how you coded without tests!
```

## When Tests Feel Hard

```
If writing test is difficult:
→ Your code might be too complex
→ Break it into smaller pieces
→ Each piece easier to test

This is TDD helping you write better code!
```

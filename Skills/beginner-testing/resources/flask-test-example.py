# Complete Flask testing example for beginners
# This shows how to test a Flask notes app

# test_app.py - Save this file in your project folder

import pytest
from app import app, get_db, init_db
import os

# SETUP: This runs before each test
@pytest.fixture
def client():
    """
    Create a test client for our Flask app.
    This is like a fake browser that can visit routes.
    """
    # Use test database (not real one!)
    app.config['TESTING'] = True

    # Create test client
    with app.test_client() as client:
        # Initialize test database
        with app.app_context():
            init_db()
        yield client  # Tests run here
        # Cleanup happens after yield

# TEST 1: Homepage loads
def test_homepage_loads(client):
    """
    Test: Can we visit the homepage without errors?

    What this checks:
    - Route exists (not 404)
    - Returns HTML page (status 200)
    - Contains expected text
    """
    # Visit homepage
    response = client.get('/')

    # Check status code (200 = success)
    assert response.status_code == 200

    # Check page contains expected text
    assert b'Notes' in response.data  # b'' means bytes

# TEST 2: Adding a note works
def test_add_note(client):
    """
    Test: Can we add a note through the form?

    What this checks:
    - POST to /add works
    - Redirects back to homepage (status 302)
    - Note appears on homepage
    """
    # Submit form with note
    response = client.post('/add', data={
        'note': 'Test note from test'
    }, follow_redirects=True)  # Follow redirect to see final page

    # Check it worked
    assert response.status_code == 200

    # Check note appears on page
    assert b'Test note from test' in response.data

# TEST 3: Empty form is handled
def test_add_empty_note(client):
    """
    Test: What happens if form is submitted empty?

    This is "edge case" testing.
    """
    # Submit empty form
    response = client.post('/add', data={
        'note': ''
    }, follow_redirects=True)

    # Should still work (or handle gracefully)
    assert response.status_code == 200

# TEST 4: Multiple notes work
def test_multiple_notes(client):
    """
    Test: Can we add multiple notes?
    """
    # Add first note
    client.post('/add', data={'note': 'First note'})

    # Add second note
    client.post('/add', data={'note': 'Second note'})

    # Get homepage
    response = client.get('/')

    # Both notes should appear
    assert b'First note' in response.data
    assert b'Second note' in response.data

# TEST 5: Delete note works (if you have delete route)
def test_delete_note(client):
    """
    Test: Can we delete a note?
    """
    # Add a note first
    client.post('/add', data={'note': 'Note to delete'})

    # Delete it (assuming you have /delete/<id> route)
    response = client.get('/delete/1', follow_redirects=True)

    # Check it's gone
    assert b'Note to delete' not in response.data

# HOW TO RUN THESE TESTS:
#
# 1. Install pytest:
#    pip install pytest
#
# 2. Run all tests:
#    pytest
#
# 3. Run with more details:
#    pytest -v
#
# 4. Run specific test:
#    pytest test_app.py::test_homepage_loads
#
# 5. See print statements:
#    pytest -s

# WHAT YOU'LL SEE:
#
# If all pass:
# test_app.py::test_homepage_loads ✓
# test_app.py::test_add_note ✓
# test_app.py::test_add_empty_note ✓
# test_app.py::test_multiple_notes ✓
# test_app.py::test_delete_note ✓
#
# 5 passed in 0.25s
#
# If one fails:
# test_app.py::test_homepage_loads ✓
# test_app.py::test_add_note ✗
#
# FAILED test_app.py::test_add_note
# AssertionError: assert 404 == 200
# [Shows where and why it failed]

# COMMON PATTERNS:
#
# Test GET route:
# response = client.get('/about')
# assert response.status_code == 200
#
# Test POST with data:
# response = client.post('/add', data={'key': 'value'})
#
# Follow redirects to see final page:
# response = client.get('/', follow_redirects=True)
#
# Check response contains text:
# assert b'text' in response.data
#
# Check response is JSON:
# data = response.get_json()
# assert data['key'] == 'value'

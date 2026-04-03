# Complete Sinatra testing example for beginners
# This shows how to test a Sinatra notes app

# test_app.rb - Save this file in your project folder

require 'minitest/autorun'
require 'rack/test'
require_relative 'app'  # Your app.rb file

class AppTest < Minitest::Test
  include Rack::Test::Methods

  # This method tells tests which app to test
  def app
    Sinatra::Application
  end

  # TEST 1: Homepage loads
  def test_homepage_loads
    # Visit homepage
    get '/'

    # Check it worked (ok? means status 200)
    assert last_response.ok?

    # Check page contains expected text
    assert_includes last_response.body, 'Notes'
  end

  # TEST 2: Adding a note works
  def test_add_note
    # Submit form with note
    post '/add', note: 'Test note from test'

    # Should redirect (status 302)
    assert last_response.redirect?

    # Follow redirect to see result
    follow_redirect!

    # Check note appears
    assert_includes last_response.body, 'Test note from test'
  end

  # TEST 3: Empty form is handled
  def test_add_empty_note
    # Submit empty form
    post '/add', note: ''

    # Should redirect (or handle gracefully)
    assert last_response.redirect?
  end

  # TEST 4: Multiple notes work
  def test_multiple_notes
    # Add first note
    post '/add', note: 'First note'

    # Add second note
    post '/add', note: 'Second note'

    # Get homepage
    get '/'

    # Both notes should appear
    assert_includes last_response.body, 'First note'
    assert_includes last_response.body, 'Second note'
  end

  # TEST 5: Delete note works
  def test_delete_note
    # Add a note first
    post '/add', note: 'Note to delete'

    # Delete it (get note ID somehow, assuming first note is ID 1)
    get '/delete/1'

    # Should redirect
    assert last_response.redirect?

    # Follow redirect
    follow_redirect!

    # Check note is gone
    refute_includes last_response.body, 'Note to delete'
  end
end

# HOW TO RUN THESE TESTS:
#
# 1. Make sure rack-test is installed:
#    Add to Gemfile: gem 'rack-test'
#    Run: bundle install
#
# 2. Run tests:
#    ruby test_app.rb
#
# 3. Or with more details:
#    ruby test_app.rb --verbose

# WHAT YOU'LL SEE:
#
# If all pass:
# Run options: --seed 12345
#
# # Running:
#
# .....
#
# Finished in 0.123s, 40.65 runs/s
# 5 runs, 8 assertions, 0 failures, 0 errors, 0 skips
#
# If one fails:
# # Running:
#
# ..F..
#
# Failure:
# AppTest#test_add_note [test_app.rb:25]:
# Expected response to include 'Test note'
# actual: "<html>...</html>"

# MINITEST ASSERTIONS:
#
# assert something                    # Must be truthy
# refute something                    # Must be falsy
# assert_equal expected, actual       # Must be equal
# refute_equal not_this, actual       # Must not equal
# assert_includes collection, item    # Must contain
# refute_includes collection, item    # Must not contain
# assert_nil value                    # Must be nil
# refute_nil value                    # Must not be nil
# assert_empty collection             # Must be empty
# refute_empty collection             # Must not be empty

# RACK-TEST HELPERS:
#
# get '/path'                         # Visit URL with GET
# post '/path', key: 'value'          # Submit POST data
# last_response                       # The response object
# last_response.ok?                   # Status 200?
# last_response.redirect?             # Status 3xx?
# last_response.status                # Get status code
# last_response.body                  # Get HTML response
# follow_redirect!                    # Follow a redirect

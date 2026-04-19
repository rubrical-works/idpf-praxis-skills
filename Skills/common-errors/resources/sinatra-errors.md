# Sinatra-Specific Errors
**Version:** v0.12.0

## Routing Errors

### undefined method `get' for main:Object
**Cause:** Forgot to require 'sinatra'

**Fix:**
```ruby
# Add at top of app.rb
require 'sinatra'
```

### Route not found (404)
**Cause:** Route not defined or typo in URL

**Common mistakes:**
- Case sensitivity: `/About` ≠ `/about`
- Missing leading slash: `get 'home'` should be `get '/home'`
- Wrong HTTP method: Form uses POST but route uses GET

**Fix:**
```ruby
get '/about' do  # Note: lowercase, leading slash
  erb :about
end
```

### Route handler returning nil
**Cause:** Block doesn't return a value

**Wrong:**
```ruby
get '/' do
  @notes = Notes.all
  # Nothing returned
end
```

**Right:**
```ruby
get '/' do
  @notes = Notes.all
  erb :index  # Return template
end
```

---

## Template Errors

### Errno::ENOENT: No such file or directory
**Cause:** Template file missing or in wrong location

**Required structure:**
```
my-project/
├── app.rb
└── views/        ← Must be named "views"
    └── index.erb
```

**Common mistakes:**
- `Views/` (wrong capitalization)
- `templates/` (wrong folder name)
- `.erb` file in project root

### undefined method for nil:NilClass in template
**Cause:** Using variable that wasn't set in route

**Wrong:**
```ruby
get '/' do
  erb :index  # Template uses @notes but it's not set
end
```

**Right:**
```ruby
get '/' do
  @notes = []  # Set all variables template needs
  erb :index
end
```

### SyntaxError in ERB template
**Cause:** Invalid Ruby syntax in `<% %>` tags

**Common mistakes:**
```erb
<% if user %>        <!-- Missing 'end' -->
  <p>Hello</p>

<%= user.name        <!-- Missing closing %> -->
```

**Fix:** Ensure all `<% %>` blocks are properly closed and `<% if/each %>` have matching `<% end %>`.

---

## Gem/Bundler Errors

### LoadError: cannot load such file -- sinatra
**Cause:** Sinatra gem not installed

**Fix:**
```bash
# If using Bundler:
bundle install

# Or install directly:
gem install sinatra
```

### Bundler::GemNotFound
**Cause:** Gem in code but not in Gemfile

**Fix:**
```ruby
# Add to Gemfile:
gem 'sinatra'
gem 'sinatra-contrib'  # If using reloader

# Then run:
bundle install
```

### Run with bundler
**Best practice:** Always use `bundle exec`

```bash
# Instead of:
ruby app.rb

# Use:
bundle exec ruby app.rb
```

---

## Server Errors

### Address already in use - bind(2)
**Cause:** Port 4567 already in use

**Solutions:**

1. Find and stop other server:
```bash
# Find process
lsof -i :4567

# Kill it
kill <PID>
```

2. Use different port:
```ruby
set :port, 4568
```

### Server not auto-reloading
**Cause:** Sinatra doesn't auto-reload by default

**Solution:** Add sinatra-reloader:
```ruby
# Gemfile
gem 'sinatra-contrib'

# app.rb
require 'sinatra/reloader' if development?
```

---

## Static File Errors

### CSS/JS files not loading
**Cause:** Files not in public/ folder

**Required structure:**
```
my-project/
├── app.rb
├── public/       ← Static files here
│   ├── style.css
│   └── script.js
└── views/
```

**In template:**
```erb
<link rel="stylesheet" href="/style.css">
```

---

## Form/Params Errors

### params is empty
**Cause:** Form method doesn't match route

**Wrong:**
```html
<form action="/add" method="post">
```
```ruby
get '/add' do  # Expects GET, form sends POST
```

**Right:**
```ruby
post '/add' do  # Matches form method
  params[:name]
end
```

### NoMethodError: undefined method `[]' for nil
**Cause:** Accessing nested params that don't exist

**Wrong:**
```ruby
params[:user][:name]  # Fails if params[:user] is nil
```

**Right:**
```ruby
params.dig(:user, :name)  # Returns nil safely
# Or:
params[:user]&.fetch(:name, '')
```

---

## Session Errors

### Sessions not persisting
**Cause:** Sessions not enabled

**Fix:**
```ruby
enable :sessions

get '/' do
  session[:user] = 'john'  # Now works
end
```


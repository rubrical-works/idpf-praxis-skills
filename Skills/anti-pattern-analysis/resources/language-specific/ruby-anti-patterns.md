# Ruby Anti-Patterns
**Version:** v0.9.0

Common anti-patterns specific to Ruby development.

---

## Monkey Patching Core Classes

**Description:** Reopening and modifying built-in Ruby classes (String, Array, Hash, etc.).

**Symptoms:**
- Unexpected behavior in unrelated code
- Gem conflicts (two gems patch the same method)
- Hard to debug — behavior changes globally
- Breaks upgrades when Ruby changes internals

**Example (Bad):**
```ruby
class String
  def to_boolean
    self == 'true'
  end
end

"true".to_boolean  # Works, but affects ALL strings everywhere
```

**Example (Good):**
```ruby
module BooleanParser
  def self.parse(value)
    value == 'true'
  end
end

BooleanParser.parse("true")
# Or use refinements (Ruby 2.0+)
```

**Detection:** `class String`, `class Array`, `class Hash` reopened outside stdlib.

---

## N+1 Queries in ActiveRecord

**Description:** Lazy loading associations in loops, generating one query per iteration.

**Symptoms:**
- Slow page loads
- Database connection exhaustion
- Log full of similar SELECT statements
- Performance degrades with data growth

**Example (Bad):**
```ruby
# Controller
@users = User.all

# View
@users.each do |user|
  user.posts.count  # SELECT for each user!
end
```

**Example (Good):**
```ruby
@users = User.includes(:posts).all
# Or for counts specifically:
@users = User.left_joins(:posts)
             .select('users.*, COUNT(posts.id) AS posts_count')
             .group('users.id')
```

**Detection:** ActiveRecord queries inside `.each` blocks. Use `bullet` gem for automated detection.

---

## Rescue Exception

**Description:** Catching `Exception` instead of `StandardError`.

**Symptoms:**
- Swallows `SystemExit`, `Interrupt`, `NoMemoryError`
- Ctrl+C doesn't work
- Program can't be killed gracefully
- Memory errors silently ignored

**Example (Bad):**
```ruby
begin
  do_something
rescue Exception => e  # Catches EVERYTHING including Ctrl+C
  log(e.message)
end
```

**Example (Good):**
```ruby
begin
  do_something
rescue StandardError => e  # Only catches application errors
  log(e.message)
end

# Or just rescue without class (defaults to StandardError)
begin
  do_something
rescue => e
  log(e.message)
end
```

**Detection:** `rescue Exception` in code that isn't explicitly handling system signals.

---

## God Object / Fat Model

**Description:** ActiveRecord models with hundreds of methods and mixed concerns.

**Symptoms:**
- Model file >500 lines
- Callbacks trigger unrelated side effects
- Hard to test in isolation
- Changes in one area break another

**Example (Bad):**
```ruby
class User < ApplicationRecord
  # Authentication, profile, billing, notifications,
  # reporting, admin, search... all in one class
  # 800+ lines
end
```

**Example (Good):**
```ruby
class User < ApplicationRecord
  include Authentication
  include Billable
  include Notifiable
  # Each concern in its own module, testable independently
end
```

**Detection:** Model files >300 lines, models with >15 public methods, callbacks with cross-cutting effects.

---

## Using `eval` / `send` for Dynamic Dispatch

**Description:** Using `eval`, `class_eval`, or `send` when safer alternatives exist.

**Symptoms:**
- Security vulnerabilities (code injection via eval)
- Hard to trace method calls
- IDE/tooling can't follow references
- Debugging is difficult

**Example (Bad):**
```ruby
def process(action, data)
  eval("#{action}_handler(data)")  # Code injection risk!
end
```

**Example (Good):**
```ruby
HANDLERS = {
  'create' => method(:create_handler),
  'update' => method(:update_handler),
}.freeze

def process(action, data)
  handler = HANDLERS[action]
  raise ArgumentError, "Unknown action: #{action}" unless handler
  handler.call(data)
end
```

**Detection:** `eval` with string interpolation, `send` with user input, `define_method` in loops.

---

## Resources

- [Ruby Style Guide](https://rubystyle.guide/) - Community style conventions
- [Rails Best Practices](https://rails-bestpractices.com/) - Common Rails anti-patterns

---

**End of Ruby Anti-Patterns**

# Sinatra Setup Verification Checklist
**Version:** v0.4.0

Use this checklist to verify your Sinatra setup is correct.

## Visual Verification

### 1. Project Folder Structure
```
my-project/
├── Gemfile        ✓ You created this
├── Gemfile.lock   ✓ Bundle created this
└── app.rb         ✓ You created this
```

### 2. Gemfile Contents
Open Gemfile and verify it contains:
```ruby
source 'https://rubygems.org'

gem 'sinatra'
```

✓ Must have `source` line
✓ Must have `gem 'sinatra'` line
✓ File named exactly "Gemfile" (no .txt or other extension)

### 3. Ruby Version Check
```bash
ruby --version
```
**Expected:** ruby 3.0.0 or higher
**If lower:** Consider updating Ruby

### 4. Bundler Version Check
```bash
bundle --version
```
**Expected:** Bundler version 2.0.0 or higher

## Command-by-Command Verification

### Test 1: Ruby Installed and Accessible
```bash
which ruby    # Mac/Linux
where ruby    # Windows
```

**Expected:** Path to Ruby executable
- ✓ Correct: `/usr/bin/ruby` or `C:\Ruby32\bin\ruby.exe`
- ✗ Wrong: "command not found"

### Test 2: Sinatra Gem Installed
```bash
bundle list | grep sinatra    # Mac/Linux
bundle list | findstr sinatra # Windows
```

**Expected output:** `* sinatra (X.X.X)`
**If not listed:** Sinatra not installed - run `bundle install`

### Test 3: Sinatra Loadable
```bash
ruby -e "require 'sinatra'; puts Sinatra::VERSION"
```

**Expected output:** Sinatra version number (e.g., `3.0.6`)
**If error:** Sinatra not installed or require path issue

### Test 4: All Gems Installed
```bash
bundle check
```

**Expected output:** `The Gemfile's dependencies are satisfied`
**If not satisfied:** Run `bundle install`

## Common Problems and Solutions

### Problem: "ruby: command not found"
**Cause:** Ruby not installed or not in PATH

**Solutions:**
1. **Windows:**
   - Install from https://rubyinstaller.org/
   - Choose Ruby+Devkit version
   - Check "Add Ruby to PATH" during install

2. **Mac:**
   - Ruby pre-installed, but may be old
   - Install latest: `brew install ruby`

3. **Linux:**
   ```bash
   sudo apt-get update
   sudo apt-get install ruby-full
   ```

4. Verify after install: `ruby --version`

### Problem: "Could not locate Gemfile"
**Cause:** Not in project directory or Gemfile doesn't exist

**Solutions:**
1. Check current directory: `pwd` (Mac/Linux) or `cd` (Windows)
2. Navigate to project: `cd path/to/your/project`
3. Verify Gemfile exists: `ls` (Mac/Linux) or `dir` (Windows)
4. Create Gemfile if missing (see main Skill.md)

### Problem: "Permission denied" during bundle install
**Cause:** Don't have write permission to system gem location

**Solutions:**
1. **Best solution:** Install to project directory
   ```bash
   bundle install --path vendor/bundle
   ```

2. **Alternative:** Use sudo (Mac/Linux only, not recommended)
   ```bash
   sudo bundle install
   ```

3. **Long-term:** Use rbenv or rvm for Ruby version management

### Problem: Gemfile.lock shows old versions
**Cause:** Gemfile.lock exists from previous install with old versions

**Solution:**
```bash
# Remove lock file
rm Gemfile.lock   # Mac/Linux
del Gemfile.lock  # Windows

# Reinstall fresh
bundle install
```

### Problem: "LoadError: cannot load such file -- sinatra"
**Causes:**
1. Sinatra not installed
2. Not using bundler to run code
3. Wrong Ruby version

**Solutions:**
```bash
# Verify Sinatra installed
bundle list | grep sinatra

# If not installed
bundle install

# Run app with bundler
bundle exec ruby app.rb
```

### Problem: Network/download errors during bundle install
**Causes:**
1. No internet connection
2. Firewall blocking rubygems.org
3. Proxy configuration needed

**Solutions:**
1. Check internet: Try browsing to https://rubygems.org
2. Configure proxy (if needed):
   ```bash
   bundle config set http_proxy http://proxy.company.com:port
   ```
3. Try different network (mobile hotspot, home vs work)
4. Use cached gems if available:
   ```bash
   bundle install --local
   ```

### Problem: Old Ruby version (< 3.0)
**Cause:** System Ruby is outdated

**Solutions:**
1. **Mac:** Use Homebrew
   ```bash
   brew install ruby
   ```

2. **Windows:** Download latest from rubyinstaller.org

3. **Linux:**
   ```bash
   # Using rbenv (recommended)
   rbenv install 3.2.2
   rbenv global 3.2.2
   ```

4. Verify: `ruby --version`

## Final Verification Steps

Before proceeding with development, ensure ALL these are true:

- [ ] `ruby --version` shows 3.0 or higher
- [ ] `bundle --version` shows 2.0 or higher
- [ ] `bundle list` shows sinatra
- [ ] `bundle check` says dependencies satisfied
- [ ] Gemfile exists in project root
- [ ] Gemfile.lock exists (created by bundle install)
- [ ] app.rb exists in project root
- [ ] Text editor is open and ready

## Quick Start Test

Create a minimal test to verify everything works:

**1. Create test file:** `test.rb`
```ruby
require 'sinatra'

get '/' do
  'Sinatra works!'
end
```

**2. Run it:**
```bash
ruby test.rb
```

**3. Expected output:**
```
== Sinatra (vX.X.X) has taken the stage on 4567
...
```

**4. Test in browser:**
- Open browser
- Go to http://localhost:4567
- Should see "Sinatra works!"

**5. Stop server:**
- Press Ctrl+C in terminal

**If this works:** Your setup is perfect! ✓

**If this fails:** Report exact error to ASSISTANT

## If Everything Works

You should be able to:
1. See Ruby version 3.0+ ✓
2. Run `bundle list` and see sinatra ✓
3. Create and run basic Sinatra app ✓

**You're ready to start coding!** Return to the ASSISTANT for next steps.

## If Something Doesn't Work

**Report to ASSISTANT with:**
1. Which step failed (be specific)
2. Exact error message (copy/paste everything)
3. Output of these commands:
   ```bash
   ruby --version
   bundle --version
   bundle list
   pwd  # or cd on Windows (show current directory)
   ```

The ASSISTANT will help you troubleshoot!

## Gemfile Best Practices

**Good Gemfile:**
```ruby
source 'https://rubygems.org'

gem 'sinatra'
gem 'sinatra-contrib'  # Optional: helpful utilities
```

**Gemfile with version pinning:**
```ruby
source 'https://rubygems.org'

gem 'sinatra', '~> 3.0'  # Any 3.x version
```

**After adding gems:**
```bash
bundle install  # Install new gems
```

**To update all gems:**
```bash
bundle update  # Update to latest compatible versions
```

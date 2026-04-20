# Sinatra Setup Verification Checklist
**Version:** v0.12.2
## Visual Verification
### 1. Project Folder Structure
```
my-project/
├── Gemfile        - You created this
├── Gemfile.lock   - Bundle created this
└── app.rb         - You created this
```
### 2. Gemfile Contents
```ruby
source 'https://rubygems.org'

gem 'sinatra'
```
- Must have `source` line
- Must have `gem 'sinatra'` line
- File named exactly "Gemfile" (no .txt or other extension)
### 3. Ruby Version Check
```bash
ruby --version
```
**Expected:** ruby 3.0.0 or higher
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
**Expected:** Path to Ruby executable (e.g., `/usr/bin/ruby` or `C:\Ruby32\bin\ruby.exe`)
### Test 2: Sinatra Gem Installed
```bash
bundle list | grep sinatra    # Mac/Linux
bundle list | findstr sinatra # Windows
```
**Expected:** `* sinatra (X.X.X)`
### Test 3: Sinatra Loadable
```bash
ruby -e "require 'sinatra'; puts Sinatra::VERSION"
```
**Expected:** Sinatra version number (e.g., `3.0.6`)
### Test 4: All Gems Installed
```bash
bundle check
```
**Expected:** `The Gemfile's dependencies are satisfied`
## Common Problems and Solutions
### Problem: "ruby: command not found"
**Cause:** Ruby not installed or not in PATH
**Solutions:**
1. **Windows:** Install from https://rubyinstaller.org/ - Choose Ruby+Devkit, check "Add Ruby to PATH"
2. **Mac:** `brew install ruby`
3. **Linux:** `sudo apt-get update && sudo apt-get install ruby-full`
4. Verify: `ruby --version`
### Problem: "Could not locate Gemfile"
**Cause:** Not in project directory or Gemfile doesn't exist
**Solutions:**
1. Check current directory: `pwd` (Mac/Linux) or `cd` (Windows)
2. Navigate to project: `cd path/to/your/project`
3. Verify Gemfile exists: `ls` (Mac/Linux) or `dir` (Windows)
4. Create Gemfile if missing (see main SKILL.md)
### Problem: "Permission denied" during bundle install
**Solutions:**
1. **Best:** `bundle install --path vendor/bundle`
2. **Alternative:** `sudo bundle install` (Mac/Linux only, not recommended)
3. **Long-term:** Use rbenv or rvm for Ruby version management
### Problem: Gemfile.lock shows old versions
```bash
rm Gemfile.lock   # Mac/Linux
del Gemfile.lock  # Windows
bundle install
```
### Problem: "LoadError: cannot load such file -- sinatra"
```bash
bundle list | grep sinatra  # Verify installed
bundle install              # If not installed
bundle exec ruby app.rb     # Run with bundler
```
### Problem: Network/download errors during bundle install
1. Check internet: browse to https://rubygems.org
2. Configure proxy: `bundle config set http_proxy http://proxy.company.com:port`
3. Try different network
4. Use cached gems: `bundle install --local`
### Problem: Old Ruby version (< 3.0)
- **Mac:** `brew install ruby`
- **Windows:** Download latest from rubyinstaller.org
- **Linux:** `rbenv install 3.2.2 && rbenv global 3.2.2`
## Final Verification Checklist
- [ ] `ruby --version` shows 3.0 or higher
- [ ] `bundle --version` shows 2.0 or higher
- [ ] `bundle list` shows sinatra
- [ ] `bundle check` says dependencies satisfied
- [ ] Gemfile exists in project root
- [ ] Gemfile.lock exists (created by bundle install)
- [ ] app.rb exists in project root
- [ ] Text editor is open and ready
## Quick Start Test
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
**3. Expected:** `== Sinatra (vX.X.X) has taken the stage on 4567`
**4. Test:** Open browser to http://localhost:4567 - should see "Sinatra works!"
**5. Stop:** Press Ctrl+C in terminal
## Gemfile Best Practices
```ruby
source 'https://rubygems.org'

gem 'sinatra'
gem 'sinatra-contrib'  # Optional: helpful utilities
```
**With version pinning:**
```ruby
source 'https://rubygems.org'

gem 'sinatra', '~> 3.0'  # Any 3.x version
```
**After adding gems:** `bundle install`
**To update all gems:** `bundle update`

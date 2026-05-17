---
name: sinatra-setup
description: Set up Ruby Sinatra development environment for beginners with step-by-step guidance, Bundler setup, and troubleshooting
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [sinatra, ruby, bundler, gem]
copyright: "Rubrical Works (c) 2026"
---
# Sinatra Setup for Beginners
Guides complete beginners through setting up a Sinatra development environment with detailed explanations and verification steps.
## Step 0 — Re-read Config (MANDATORY)
Read `resources/sinatra-setup.config.json` from disk and validate against `resources/sinatra-setup.config.schema.json` at start of every invocation. Config is source of truth for Ruby version floor, per-platform Ruby install commands/URLs, Bundler install commands (with sudo and local-path fallbacks), starter Gemfile template, verification command templates. SKILL.md must not duplicate values — prose references config fields by name (e.g., `platformInstall.macos.command`, `verify.runApp`) so updating Ruby/Sinatra versions is a JSON edit.
## When to Use This Skill
Invoke when:
- User wants to build a Sinatra web application
- User is beginner and needs Sinatra environment setup
- User asks "How do I set up Sinatra?" or "How do I start a Sinatra project?"
- Project type is web application using Sinatra/Ruby
- Building Ruby web API or Ruby web server
- Sinatra tutorial or learning resources needed
## Instructions for ASSISTANT
**CRITICAL OUTPUT FORMAT:** ASSISTANT must format ALL technical instructions as **Claude Code copy/paste blocks**.
**DO NOT provide manual instructions like:** "Open File Explorer", "Navigate to folder", "Right-click"
**ALWAYS format as:**
```
TASK: Set up Sinatra project

STEP 1: Copy this entire code block (including this line)
STEP 2: Open Claude Code
STEP 3: Paste into Claude Code
STEP 4: Claude Code will execute and report results
STEP 5: Report back: What did Claude Code say?

---

[Instructions for Claude Code to execute:]

Navigate to project directory:
cd [project-location]

Create project folder:
mkdir [project-name]
cd [project-name]

Verify Ruby installed:
ruby --version

[continue with commands...]

Report:
- What results did you see?
```
## Setup Knowledge
### STEP 1: Create Project and Verify Ruby
**Command:** `ruby --version`
**Expected output:** `ruby 3.0.0` or higher (e.g., `ruby 3.2.2`)
**What this checks:** Ruby installed; accessible from command line; which version.
**If Ruby is NOT installed:**
**Windows:** Download RubyInstaller from https://rubyinstaller.org/; choose "Ruby+Devkit 3.2.X"; run installer with default settings; check "Add Ruby to PATH"; restart terminal.
**Mac:** Ruby comes pre-installed (might be old). For latest: `brew install ruby` or use rbenv for version management.
**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ruby-full
```
**After installing Ruby, verify again:** `ruby --version`
### Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before running `gem install bundler` and `bundle install` to install Sinatra and its dependencies.
- **What is asked:** acceptance of responsibility for change to Ruby gem environment, project directory, and installed gems (Bundler, Sinatra, dependencies).
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
### STEP 4: Install Bundler
**Command:** `gem install bundler`
**What this does:** Installs Bundler, Ruby's package manager; manages gem dependencies for project; similar to pip for Python or npm for JavaScript.
**Why we need Bundler:** Manages gem versions consistently; ensures everyone has same dependencies; makes project portable and reproducible.
**Wait time:** 10-30 seconds. **Success message:** "Successfully installed bundler-X.X.X"
**Verify:** `bundler --version` → Expected: `Bundler version 2.X.X`
**Common issues:**
- "Permission denied" → Use `sudo gem install bundler` (Mac/Linux)
- "gem: command not found" → Ruby not installed properly
### STEP 5: Create Gemfile
**What is a Gemfile?** Lists all Ruby gems project needs. Like requirements.txt for Python or package.json for Node.js.
1. Open text editor
2. Create new file
3. Save as `Gemfile` (no extension! Just "Gemfile")
4. Save in project folder
**File location:**
```
my-project/
└── Gemfile  ← Create this file
```
**Content to put in Gemfile:**
```ruby
source 'https://rubygems.org'

gem 'sinatra'
```
**Explanation:** `source 'https://rubygems.org'` - where to download gems from; `gem 'sinatra'` - Sinatra gem we want to install.
**Important:** File must be named exactly `Gemfile` (capital G, no extension); must be in project root; use straight quotes (''), not curly quotes.
### STEP 6: Install Sinatra and Dependencies
**Command:** `bundle install`
**What this does:** Reads Gemfile; downloads Sinatra and dependencies; installs them in project; creates `Gemfile.lock` (don't edit).
**Wait time:** 30-90 seconds.
**You'll see:**
```
Fetching gem metadata from https://rubygems.org/
Resolving dependencies...
Installing rack X.X.X
Installing tilt X.X.X
Installing rack-protection X.X.X
Installing sinatra X.X.X
Bundle complete!
```
**What gets installed:** Sinatra (web framework); Rack (web server interface); Rack Protection (security middleware); Tilt (template engine interface).
**After installation:**
```
my-project/
├── Gemfile        ← You created this
└── Gemfile.lock   ← Bundle created this (version lock file)
```
**Common issues:**
- "Could not locate Gemfile" → Make sure in project directory
- "Permission denied" → Use `bundle install --path vendor/bundle`
- Network errors → Check internet connection
### STEP 7: Create app.rb File
1. Open text editor
2. Create new file
3. Save as `app.rb` in project folder
**Recommended editors:** VS Code; RubyMine; Sublime Text; Atom.
**File location:** `my-project/{Gemfile, Gemfile.lock, app.rb ← create this}`
### STEP 8: Verify Installation
**Command 1:** `ruby --version` → Expected: `ruby 3.0.0` or higher
**Command 2:** `bundle --version` → Expected: `Bundler version 2.X.X`
**Command 3:** `bundle list` → Expected:
```
Gems included by the bundle:
  * sinatra (X.X.X)
  * rack (X.X.X)
  * rack-protection (X.X.X)
  * tilt (X.X.X)
```
**Command 4:** `ruby -e "require 'sinatra'; puts 'Sinatra works!'"` → Expected: `Sinatra works!`
**All checks pass?** Ready to start coding!
### STEP 9: Report Completion
Report: "Setup complete! Bundle installed successfully and I can see Sinatra in my gem list" or "I got stuck at step X with error: [exact error message]"
## What Happens Next
After successful setup:
1. ASSISTANT guides through creating first Sinatra route
2. Write "Hello World" application
3. Start Sinatra server
4. See first web page in browser
## Resources
| File | Purpose |
|------|---------|
| `resources/sinatra-setup.config.json` | Volatile knobs (Ruby version floor, per-platform install commands/URLs, Bundler commands, Gemfile template, verify commands). Re-read at every invocation. |
| `resources/sinatra-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/verification-checklist.md` | Detailed troubleshooting steps. |
| `docs/sinatra-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
## Troubleshooting Quick Reference
See `resources/verification-checklist.md` for detailed steps.
**Most common issues:**
1. **Ruby not installed** → Follow Step 3 installation
2. **Gemfile in wrong location** → Must be in project root
3. **Permission errors** → Use `bundle install --path vendor/bundle`
4. **Network/firewall issues** → Check internet connection
5. **Old Ruby version** → Update Ruby to 3.0+
## Project Structure Summary
After setup:
```
my-project/
├── Gemfile           ← Gem dependencies (you created)
├── Gemfile.lock      ← Version lock (bundle created)
└── app.rb            ← Your code (you created)
```
Later you'll add:
```
my-project/
├── Gemfile
├── Gemfile.lock
├── app.rb
├── views/            ← Templates (.erb files)
│   └── index.erb
└── public/           ← Static files (CSS, images, JS)
    └── style.css
```
## Next Steps
- Create first Sinatra route
- Learn about Sinatra's DSL (Domain Specific Language)
- Understand request/response cycle
- Build first web page
---
**Remember:** Run `bundle exec ruby app.rb` to start your Sinatra app (bundle exec ensures correct gem versions)

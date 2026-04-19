---
name: sinatra-setup
description: Set up Ruby Sinatra development environment for beginners with step-by-step guidance, Bundler setup, and troubleshooting
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [sinatra, ruby, bundler, gem]
copyright: "Rubrical Works (c) 2026"
---
# Sinatra Setup for Beginners
Guides complete beginners through Sinatra environment setup with verification.
## When to Use
- User wants to build a Sinatra web application
- Beginner needs Sinatra environment setup
- Asks "How do I set up Sinatra?" / "start a Sinatra project?"
- Project type is Sinatra/Ruby web app
- Building Ruby web API or web server
## Instructions for ASSISTANT
**CRITICAL OUTPUT FORMAT:** Format ALL technical instructions as **Claude Code copy/paste blocks**. Do NOT provide manual instructions ("Open File Explorer", "Navigate", "Right-click"). Always format as:
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
ASSISTANT must convert this into Claude Code commands.
### STEP 1: Create Project and Verify Ruby
```bash
ruby --version
```
Expected: `ruby 3.0.0` or higher. Checks Ruby installed, on PATH, and version.
**If Ruby NOT installed:**
- **Windows:** Download RubyInstaller (https://rubyinstaller.org/), choose "Ruby+Devkit 3.2.X", default settings, check "Add Ruby to PATH", restart terminal.
- **Mac:** Pre-installed (may be old). Latest: `brew install ruby` or use rbenv.
- **Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ruby-full
```
After install, re-verify: `ruby --version`.
### Responsibility Acknowledgement Gate
Implements the pattern in the **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md` for the full contract.
- **When:** before `gem install bundler` and `bundle install`.
- **What is asked:** responsibility for changes to the Ruby gem environment, project directory, and installed gems (Bundler, Sinatra, dependencies).
- **On decline:** exit cleanly; "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; re-fires on every run.
Use `AskUserQuestion` with the two required options (`"I accept responsibility — proceed"` / `"Decline — exit without changes"`).
### STEP 4: Install Bundler
```bash
gem install bundler
```
Installs Bundler (Ruby's package manager — like pip or npm). Manages gem versions for reproducible projects.
Wait: 10-30s. Success: "Successfully installed bundler-X.X.X".
Verify:
```bash
bundler --version
```
Expected: `Bundler version 2.X.X`.
**Common issues:**
- "Permission denied" → `sudo gem install bundler` (Mac/Linux)
- "gem: command not found" → Ruby not installed properly
### STEP 5: Create Gemfile
A Gemfile lists gems the project needs (like requirements.txt or package.json).
Create file exactly named `Gemfile` (capital G, no extension) in project root:
```ruby
source 'https://rubygems.org'

gem 'sinatra'
```
- `source` — where to download gems.
- `gem 'sinatra'` — the gem to install.
Use straight quotes, not curly quotes.
### STEP 6: Install Sinatra and Dependencies
```bash
bundle install
```
Reads Gemfile, downloads+installs Sinatra and deps, creates `Gemfile.lock` (don't edit).
Wait: 30-90s. Output:
```
Fetching gem metadata from https://rubygems.org/
Resolving dependencies...
Installing rack X.X.X
Installing tilt X.X.X
Installing rack-protection X.X.X
Installing sinatra X.X.X
Bundle complete!
```
Installs: Sinatra (framework), Rack (server interface), Rack Protection (security), Tilt (templates). After: project has `Gemfile` + `Gemfile.lock`.
**Common issues:**
- "Could not locate Gemfile" → Not in project directory.
- "Permission denied" → `bundle install --path vendor/bundle`.
- Network errors → check connection.
### STEP 7: Create app.rb File
Create `app.rb` in project folder. Editors: VS Code, RubyMine, Sublime Text, Atom.
Layout:
```
my-project/
├── Gemfile
├── Gemfile.lock
└── app.rb
```
### STEP 8: Verify Installation
```bash
ruby --version
bundle --version
bundle list
ruby -e "require 'sinatra'; puts 'Sinatra works!'"
```
Expected: Ruby 3.0+, Bundler 2.X.X, `bundle list` shows sinatra/rack/rack-protection/tilt, final command prints `Sinatra works!`.
### STEP 9: Report Completion
"Setup complete! Bundle installed and Sinatra in gem list" or "Stuck at step X with error: [exact error]".
## What Happens Next
1. Create first Sinatra route
2. Write "Hello World"
3. Start Sinatra server
4. View first page in browser
## Troubleshooting
See `resources/verification-checklist.md`.
1. Ruby not installed → Follow Step 3.
2. Gemfile in wrong location → project root.
3. Permission errors → `bundle install --path vendor/bundle`.
4. Network/firewall → check connection.
5. Old Ruby → update to 3.0+.
## Project Structure
After setup:
```
my-project/
├── Gemfile
├── Gemfile.lock
└── app.rb
```
Later:
```
my-project/
├── Gemfile
├── Gemfile.lock
├── app.rb
├── views/
│   └── index.erb
└── public/
    └── style.css
```
## Next Steps
- Create first Sinatra route
- Learn Sinatra's DSL
- Understand request/response cycle
- Build first web page
**Remember:** `bundle exec ruby app.rb` to start (ensures correct gem versions).

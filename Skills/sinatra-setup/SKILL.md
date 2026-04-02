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
Guides complete beginners through setting up a Sinatra development environment with verification steps.
## When to Use This Skill
- User wants to build a Sinatra web application
- User is a beginner and needs Sinatra environment setup
- User asks "How do I set up Sinatra?" or "How do I start a Sinatra project?"
- Project type is web application using Sinatra/Ruby
- Building a Ruby web API or Ruby web server
## Instructions for ASSISTANT
**CRITICAL OUTPUT FORMAT:**
Format ALL technical instructions as **Claude Code copy/paste blocks**.
**DO NOT provide manual instructions like:**
- "Open File Explorer", "Navigate to folder", "Right-click"
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
ASSISTANT must convert the following into Claude Code commands:
### STEP 1: Create Project and Verify Ruby
```bash
ruby --version
```
**Expected:** `ruby 3.0.0` or higher
- Checks Ruby is installed, accessible, and which version
**If Ruby is NOT installed:**
- **Windows:** Download RubyInstaller from https://rubyinstaller.org/ — choose "Ruby+Devkit 3.2.X", check "Add Ruby to PATH", restart terminal
- **Mac:** `brew install ruby` (or use rbenv)
- **Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ruby-full
```
### STEP 4: Install Bundler
```bash
gem install bundler
```
- Installs Bundler, Ruby's package manager for gem dependencies
- **Success:** "Successfully installed bundler-X.X.X"
- **Verify:** `bundler --version` → `Bundler version 2.X.X`
- **Issues:** "Permission denied" → `sudo gem install bundler` (Mac/Linux); "gem: command not found" → Ruby not installed properly
### STEP 5: Create Gemfile
Create `Gemfile` (capital G, no extension) in project root:
```ruby
source 'https://rubygems.org'

gem 'sinatra'
```
- Use straight quotes (''), not curly quotes
### STEP 6: Install Sinatra and Dependencies
```bash
bundle install
```
- Reads Gemfile, downloads Sinatra and dependencies, creates `Gemfile.lock`
- **Wait:** 30-90 seconds
- Installs: Sinatra, Rack, Rack Protection, Tilt
- **Issues:** "Could not locate Gemfile" → wrong directory; "Permission denied" → `bundle install --path vendor/bundle`
### STEP 7: Create app.rb File
Create `app.rb` in your project folder.
### STEP 8: Verify Installation
```bash
ruby --version          # ruby 3.0.0+
bundle --version        # Bundler version 2.X.X
bundle list             # Should show sinatra, rack, etc.
ruby -e "require 'sinatra'; puts 'Sinatra works!'"
```
### STEP 9: Report Completion
Report to ASSISTANT: "Setup complete!" or "I got stuck at step X with error: [message]"
## Troubleshooting Quick Reference
See `resources/verification-checklist.md` for detailed troubleshooting.
1. **Ruby not installed** → Follow Step 1 installation instructions
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
Later additions:
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
Run `bundle exec ruby app.rb` to start your Sinatra app.

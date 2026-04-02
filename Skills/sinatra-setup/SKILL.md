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
## When to Use This Skill
Invoke this Skill when:
- User wants to build a Sinatra web application
- User is a beginner and needs Sinatra environment setup
- User asks "How do I set up Sinatra?" or "How do I start a Sinatra project?"
- Project type is determined to be web application using Sinatra/Ruby
- Building a Ruby web API or Ruby web server
- Sinatra tutorial or learning resources needed
## Instructions for ASSISTANT
**CRITICAL OUTPUT FORMAT:**
When using this Skill's content, the ASSISTANT must format ALL technical instructions as **Claude Code copy/paste blocks**.
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
The following content provides setup knowledge. ASSISTANT must convert this into Claude Code commands:
### STEP 1: Create Project and Verify Ruby
```bash
ruby --version
```
**Expected output:** `ruby 3.0.0` or higher (e.g., `ruby 3.2.2`)
**If Ruby is NOT installed:**
- **Windows:** Download RubyInstaller from https://rubyinstaller.org/ - Choose "Ruby+Devkit 3.2.X", check "Add Ruby to PATH"
- **Mac:** `brew install ruby` or use rbenv
- **Linux:** `sudo apt-get update && sudo apt-get install ruby-full`
**Verify:** `ruby --version`
### STEP 4: Install Bundler
```bash
gem install bundler
```
- Installs Bundler, Ruby's package manager (like pip for Python or npm for JavaScript)
- Manages gem versions consistently and ensures reproducible dependencies
**Verify:** `bundler --version` (Expected: `Bundler version 2.X.X`)
**Common issues:**
- "Permission denied" -> Use `sudo gem install bundler` (Mac/Linux)
- "gem: command not found" -> Ruby not installed properly
### STEP 5: Create Gemfile
Create file named exactly `Gemfile` (capital G, no extension) in project root:
```ruby
source 'https://rubygems.org'

gem 'sinatra'
```
### STEP 6: Install Sinatra and Dependencies
```bash
bundle install
```
- Reads Gemfile, downloads Sinatra and dependencies, creates `Gemfile.lock`
- Installs: Sinatra, Rack, Rack Protection, Tilt
**Common issues:**
- "Could not locate Gemfile" -> Make sure you're in project directory
- "Permission denied" -> Use `bundle install --path vendor/bundle`
- Network errors -> Check internet connection
### STEP 7: Create app.rb File
Create `app.rb` in your project folder.
### STEP 8: Verify Installation
```bash
ruby --version          # Expected: ruby 3.0.0 or higher
bundle --version        # Expected: Bundler version 2.X.X
bundle list             # Expected: sinatra, rack, rack-protection, tilt
ruby -e "require 'sinatra'; puts 'Sinatra works!'"  # Expected: Sinatra works!
```
## Project Structure Summary
After setup:
```
my-project/
├── Gemfile           <- Gem dependencies (you created)
├── Gemfile.lock      <- Version lock (bundle created)
└── app.rb            <- Your code (you created)
```
Later additions:
```
my-project/
├── Gemfile
├── Gemfile.lock
├── app.rb
├── views/            <- Templates (.erb files)
│   └── index.erb
└── public/           <- Static files (CSS, images, JS)
    └── style.css
```
## Troubleshooting Quick Reference
See `resources/verification-checklist.md` for detailed troubleshooting steps.
1. **Ruby not installed** -> Follow Step 1 installation instructions
2. **Gemfile in wrong location** -> Must be in project root
3. **Permission errors** -> Use `bundle install --path vendor/bundle`
4. **Network/firewall issues** -> Check internet connection
5. **Old Ruby version** -> Update Ruby to 3.0+
**Remember:** Run `bundle exec ruby app.rb` to start your Sinatra app (bundle exec ensures correct gem versions)

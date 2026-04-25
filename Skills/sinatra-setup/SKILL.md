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

Guides beginners through setting up a Sinatra development environment with verification steps.

## Step 0 — Re-read Config (MANDATORY)

Read `resources/sinatra-setup.config.json` and validate against `resources/sinatra-setup.config.schema.json` at the start of every invocation. Config is source of truth for Ruby version floor, per-platform install commands/URLs, Bundler commands (with sudo and local-path fallbacks), Gemfile template, and verification command templates. SKILL.md must not duplicate config values — prose references config fields by name (e.g., `platformInstall.macos.command`, `verify.runApp`).

## When to Use This Skill

- User wants to build a Sinatra web application
- Beginner needs Sinatra environment setup
- "How do I set up Sinatra?" / "How do I start a Sinatra project?"
- Project type is Sinatra/Ruby web app
- Building a Ruby web API or web server
- Sinatra tutorial/learning resources needed

## Instructions for ASSISTANT

**CRITICAL OUTPUT FORMAT:** Format ALL technical instructions as **Claude Code copy/paste blocks**.

**DO NOT** provide manual instructions like "Open File Explorer", "Navigate to folder", "Right-click".

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

ASSISTANT must convert this into Claude Code commands:

### STEP 1: Create Project and Verify Ruby

```bash
ruby --version
```

**Expected:** `ruby 3.0.0` or higher (e.g., `ruby 3.2.2`)

**If Ruby is NOT installed:**

**Windows:**
- Download RubyInstaller from https://rubyinstaller.org/
- Choose "Ruby+Devkit 3.2.X"
- Run installer with default settings; check "Add Ruby to PATH"
- Restart terminal after installation

**Mac:**
- Pre-installed but may be old. For latest:
  ```bash
  brew install ruby
  ```
- Or use rbenv for version management

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ruby-full
```

**After installing, verify again:** `ruby --version`

### Responsibility Acknowledgement Gate

Implements the pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md` for the full contract.

- **When this fires:** before running `gem install bundler` and `bundle install`.
- **What is asked:** acceptance of responsibility for changes to the Ruby gem environment, project directory, and installed gems (Bundler, Sinatra, dependencies).
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation. Re-fires every subsequent invocation; never persisted.

Use `AskUserQuestion` with the two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`). See `responsibility-gate` for allowed additional options.

### STEP 4: Install Bundler

```bash
gem install bundler
```

**What:** Installs Bundler, Ruby's package manager (like pip / npm).

**Wait time:** 10-30 seconds. **Success:** "Successfully installed bundler-X.X.X"

**Verify:**
```bash
bundler --version
```
**Expected:** `Bundler version 2.X.X`

**Common issues:**
- "Permission denied" → `sudo gem install bundler` (Mac/Linux)
- "gem: command not found" → Ruby not installed properly

### STEP 5: Create Gemfile

A Gemfile lists Ruby gems your project needs (like requirements.txt / package.json).

**Instructions:**
1. Open your text editor
2. Create a new file
3. Save it as `Gemfile` (no extension! Just "Gemfile")
4. Save it in your project folder

**File location:**
```
my-project/
└── Gemfile  ← Create this file
```

**Content:**
```ruby
source 'https://rubygems.org'

gem 'sinatra'
```

**Important:**
- File must be named exactly `Gemfile` (capital G, no extension)
- Must be in project root
- Use straight quotes (''), not curly quotes ('')

### STEP 6: Install Sinatra and Dependencies

```bash
bundle install
```

**What:** Reads Gemfile, downloads Sinatra and dependencies, creates `Gemfile.lock` (don't edit!).

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

**Installed:** Sinatra (framework), Rack (server interface), Rack Protection (security middleware), Tilt (template engine).

**After installation:**
```
my-project/
├── Gemfile        ← You created this
└── Gemfile.lock   ← Bundle created this
```

**Common issues:**
- "Could not locate Gemfile" → Make sure you're in project directory
- "Permission denied" → `bundle install --path vendor/bundle`
- Network errors → Check internet connection

### STEP 7: Create app.rb File

1. Open your text editor
2. Create a new file
3. Save it as `app.rb` in your project folder

**Recommended editors:** VS Code, RubyMine, Sublime Text, Atom.

**File location:**
```
my-project/
├── Gemfile
├── Gemfile.lock
└── app.rb       ← Your main Sinatra file
```

### STEP 8: Verify Installation

**Command 1: Ruby version**
```bash
ruby --version
```
**Expected:** `ruby 3.0.0` or higher

**Command 2: Bundler**
```bash
bundle --version
```
**Expected:** `Bundler version 2.X.X`

**Command 3: Installed gems**
```bash
bundle list
```
**Expected output includes:**
```
Gems included by the bundle:
  * sinatra (X.X.X)
  * rack (X.X.X)
  * rack-protection (X.X.X)
  * tilt (X.X.X)
```

**Command 4: Test Sinatra import**
```bash
ruby -e "require 'sinatra'; puts 'Sinatra works!'"
```
**Expected output:** `Sinatra works!`

### STEP 9: Report Completion

- "Setup complete! Bundle installed successfully and I can see Sinatra in my gem list"
- Or if issues: "I got stuck at step X with error: [exact error message]"

## What Happens Next

1. ASSISTANT guides through creating first Sinatra route
2. Write "Hello World" application
3. Start the Sinatra server
4. See your first web page in a browser

## Resources

| File | Purpose |
|------|---------|
| `resources/sinatra-setup.config.json` | Volatile knobs (Ruby version floor, per-platform install commands/URLs, Bundler commands, Gemfile template, verify commands). Re-read every invocation. |
| `resources/sinatra-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/verification-checklist.md` | Detailed troubleshooting steps. |
| `docs/sinatra-setup-rationale.md` | Original prose rationale preserved during refurbishment. |

## Troubleshooting Quick Reference

See `resources/verification-checklist.md` for details.

**Most common issues:**
1. **Ruby not installed** → Follow Step 3 installation instructions
2. **Gemfile in wrong location** → Must be in project root
3. **Permission errors** → `bundle install --path vendor/bundle`
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

Later add:
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

- Create your first Sinatra route
- Learn Sinatra's DSL
- Understand request/response cycle
- Build your first web page

---

**Remember:** Run `bundle exec ruby app.rb` to start your Sinatra app (bundle exec ensures correct gem versions)

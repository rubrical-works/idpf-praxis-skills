# sinatra-setup Rationale

Preserved prose from the original SKILL.md. SKILL.md retains its beginner-friendly step-by-step teaching structure; this file documents the volatile-knob extraction decisions.

## Why per-platform install commands

Ruby installation differs sharply across platforms — Windows uses RubyInstaller (a downloaded executable), macOS uses brew, Linux uses the distro package manager. The config records each as a separate entry under `platformInstall.<platform>` with its own template. The Windows entry carries the URL since there is no command-line installer; the others carry shell commands.

## Why a `gemfileTemplate` instead of inline prose

The Gemfile boilerplate (`source 'https://rubygems.org'` + `gem 'sinatra'`) drifts when RubyGems changes its canonical source URL or when a new version of Sinatra requires additional gems. Pinning the template in JSON (`starterGem.gemfileTemplate`) means a Gemfile-content change is a JSON edit, not a hunt through prose.

## Auto-installed gems

`starterGem._autoInstalled` lists the gems Bundler pulls in when installing Sinatra (rack, rack-protection, tilt). The skill uses this only to set user expectations about what `bundle list` will show. Underscore prefix marks it as non-required by the schema.

## `bundle exec ruby app.rb`

The recommended run command is `bundle exec ruby app.rb` rather than `ruby app.rb` — `bundle exec` ensures the gem versions resolved by Bundler are the ones actually used at runtime. Recorded as `verify.runApp` so the skill can reference it without re-explaining.

## Why no separate sudo/permission fallback for `bundle install`

The original SKILL.md showed `bundle install --path vendor/bundle` as the permission-error workaround. This is a per-project fix (not sudo) and is recorded as `envManagement.bundleInstallLocalPathFallback`. Sudo is recorded separately for `gem install bundler` (`bundlerInstallSudoFallback`) where it is the right escape hatch.

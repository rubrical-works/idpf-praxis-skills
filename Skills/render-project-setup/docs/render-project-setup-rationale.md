# render-project-setup Rationale

Preserved prose from the original SKILL.md. SKILL.md now references `resources/render-project-setup.config.json` for volatile values.

## Why CLI is optional

Render's primary deploy path is GitHub-native: connect a repo through the Render dashboard, push to deploy. The CLI (`@render-cli/cli`) exists for users who prefer scripted control or who want to query service state from CI. The config marks `cli._optional: true` so Step 0's validator doesn't complain when CLI is absent — only the API path is required for automation.

## Why the deploy trigger is a `curl` command, not a GitHub Action

There is no widely-adopted official Render GitHub Action. The community uses a one-line `curl` against the API. Encoding the curl template (`api.deployTriggerCommand`) in the config means: when Render publishes an official action, swap the template here and every consumer follows.

## Default port 10000

Render assigns port 10000 by default and injects it as `$PORT`. Apps that hardcode another port silently fail health checks. Recorded in `defaults.httpPort`.

## Free-tier idle behavior

Free instances spin down after 15 minutes of inactivity (`defaults.freeTierIdleMinutes`). Documented in the config so the skill can warn about cold-start surprises during demos.

## Wizard prose removal

UI navigation paths like "Dashboard > Account > GitHub" and "Service > Settings > Preview Environments > Enable" were removed per the anti-hallucination rule and replaced with prompts that ask the user what they see. The dashboard layout is unstable enough that scripting paths is a liability.

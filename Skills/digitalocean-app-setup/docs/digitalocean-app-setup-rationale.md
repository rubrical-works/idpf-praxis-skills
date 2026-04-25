# digitalocean-app-setup Rationale

Preserved prose from the original SKILL.md before refurbishment to the JSON-driven config pattern. SKILL.md now references `resources/digitalocean-app-setup.config.json` for volatile values; this file is for human readers maintaining the skill.

## Why doctl + GitHub Actions

DigitalOcean App Platform supports two deployment paths: native GitHub auto-deploy (configure in the App Platform UI, deploys on every push to a configured branch) and explicit `doctl` calls from CI. The skill documents both because they serve different needs:

- **Native auto-deploy** is the lowest-ceremony path — connect a repo once, push to deploy. No CI changes.
- **`doctl` from GitHub Actions** is needed when the team wants explicit deployment gates (manual approval, multi-stage promotion, deploy from non-default branches with conditions).

The config pins `digitalocean/action-doctl@v2` because v2 is the current major; bumping to v3 will require revisiting the inputs documented here.

## Why `--scope=user` is not the default for doctl install

Unlike Node where `--scope=user` is the safer default, `doctl` install via `brew`/`snap`/`scoop` is per-user by default on each platform — no override needed. The config's `cli.install` entries reflect the per-platform native default.

## Required Secret: `DIGITALOCEAN_ACCESS_TOKEN`

The secret name is the convention DigitalOcean uses across all its tooling and the official `digitalocean/action-doctl@v2` action expects it. Renaming it would break copy-pasted workflow templates from DO documentation. The config records it as the single required secret.

## Default Port 8080

App Platform's reverse proxy expects HTTP traffic on port 8080. Apps that bind to a different port silently fail health checks. The config records `defaults.httpPort: 8080` so the skill can warn when a user-supplied app spec binds elsewhere.

## Wizard Prose Removal

The original SKILL.md described UI navigation paths like "Dashboard > Apps > Create App > Select GitHub" and "Settings > Review Apps > Enable". These were removed per the SKILL-DEVELOPMENT-GUIDE anti-hallucination rule (cannot describe UIs we cannot see) and replaced with prompts like "ask the user what they see in the App Platform dashboard." The auth flow and the `doctl` commands remain in JSON because those are scriptable surfaces we can verify.

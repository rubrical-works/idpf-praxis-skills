---
name: digitalocean-app-setup
description: Configure automated preview, staging, and production deployments with DigitalOcean App Platform
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [digitalocean, docker, node, python]
copyright: "Rubrical Works (c) 2026"
---

# Skill: digitalocean-app-setup

**Purpose:** Guide DigitalOcean App Platform deployments with GitHub integration
**Audience:** Developers deploying web apps, APIs, static sites to DigitalOcean
**Related Skills:** `ci-cd-pipeline-design`

## Step 0 — Re-read Config (MANDATORY)

Read `resources/digitalocean-app-setup.config.json` from disk at every invocation. Validate against `resources/digitalocean-app-setup.config.schema.json`. Config is source of truth for `doctl` install commands, doctl subcommand templates, GitHub Action version, required secret name, default HTTP port. SKILL.md must not duplicate config values. If a needed value is not in the config, refuse and report — do not invent.

## Overview

App Platform uses `app-spec.yaml` (IaC), supports review apps for PRs, native GitHub integration with auto-deploys.

## Initial Setup

## Responsibility Acknowledgement Gate

Implements the **`responsibility-gate`** skill pattern. See `Skills/responsibility-gate/SKILL.md`.

- **Fires before:** any `cli.install.*`, `cli.auth.command` (`doctl auth init`), or `appCommands.create` from config.
- **Asks:** acceptance for changes to system package managers, local doctl auth state, DigitalOcean account (new App Platform resources).
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted across runs.

Use `AskUserQuestion` with required options (`"I accept responsibility — proceed"`, `"Decline — exit without changes"`).

### Prerequisites

- DigitalOcean account
- `doctl` CLI installed — pick from `cli.install` per detected platform
- GitHub repository connected to DigitalOcean

### Installing doctl

Detect platform; run matching `cli.install.<platform>`. Then run `cli.auth.command` to authenticate (prompts for API token from DigitalOcean account API page).

### Creating an App

Run `appCommands.create`, substituting `{specPath}` (default: `specFiles.appSpec`). Subcommand template lives in config; updates are JSON edits.

For dashboard-based creation, ask the user what they see — dashboard layout changes without notice.

## Environment Configuration

### Required Secrets

Configure secrets named in `secrets.required[].name` in GitHub repo secrets. Each entry includes source and description.

### App-Level Environment Variables

Set in app spec or dashboard:

- **App-level**: shared across all components
- **Component-level**: scoped to a single service/worker

See `resources/env-setup.md`.

## GitHub Integration

### Auto-Deploy on Push

DigitalOcean auto-deploys on push. Ask user to follow App Platform UI's "create app from repo" flow — navigation labels not stable enough to script.

### Review Apps (Preview Deployments)

Isolated per-PR environments with unique URLs; destroyed when PR closes. Enable in App Platform UI app settings; ask user what they see.

### GitHub Actions Deployment

Use action at `githubAction.uses`. Token input name is `githubAction.tokenInput`; populating secret is the entry in `secrets.required` with `name == cli.auth.envVar`.

```yaml
# See resources/deploy.yml for the complete workflow.
# The action reference and token input come from the config.
```

## Deployment Strategies

### Production via Branch Deploy

```
main branch → Production app (automatic)
```

### Staging via Separate App

Second app with staging-specific spec, using `appCommands.create` with `{specPath}` set to staging spec.

### Manual Deployment

Use `appCommands.createDeployment` (substitute `{appId}`). List with `appCommands.listDeployments`.

### Rollback

Use `appCommands.rollback` substituting `{appId}` and `{deploymentId}`. Find target id via `appCommands.listDeployments`.

## Monitoring and Debugging

### Logs

- **Runtime:** `appCommands.logs` (substitute `{appId}`)
- **Build:** `appCommands.buildLogs`

### Dashboard Metrics

Built-in monitoring (CPU, memory, HTTP rate, latency, error rate, bandwidth, container restarts). Surface via dashboard, do not script.

### Health Checks

Configure in app spec:

```yaml
services:
  - name: web
    health_check:
      http_path: /api/health
      initial_delay_seconds: 10
      period_seconds: 30
```

## Common Pitfalls and Troubleshooting

### Build Issues

- **Buildpack detection failure**: ensure standard project files exist (`package.json`, `requirements.txt`, etc.) or use Dockerfile
- **Build timeout**: use `.doignore` to exclude unnecessary files
- **Node.js version**: set `engines.node` in `package.json` or `NODEJS_VERSION` env var

### Deployment Issues

- **Port binding**: defaults to `defaults.httpPort` (config). Set `HTTP_PORT` in spec or use `$PORT`
- **Static site routing**: configure catch-all routes for SPAs
- **Database connections**: use connection pools and DigitalOcean Managed Databases for production

### Review App Issues

- **Cost**: review apps count as separate instances
- **Database isolation**: review apps share production DB by default; use separate dev DBs
- **Env var conflicts**: review app env vars inherit from main app; override per-component

## App Spec Reference

`app-spec.yaml` defines infrastructure. See `specFiles.appSpec` for reference covering: service definitions (web, worker, job), database provisioning, environment variables, build/run commands, domain configuration, health checks.

## Related Skills

- **`ci-cd-pipeline-design`** — CI/CD architecture patterns, stage design, security

## Resources

| File | Purpose |
|------|---------|
| `resources/digitalocean-app-setup.config.json` | Volatile knobs (CLI install commands, doctl subcommand templates, GitHub Action version, secret names, default port). Re-read at every invocation. |
| `resources/digitalocean-app-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/app-spec.yaml` | Reference DigitalOcean App Platform spec. |
| `resources/deploy.yml` | GitHub Actions workflow for DigitalOcean deployment. |
| `resources/env-setup.md` | Environment variable setup guide. |
| `docs/digitalocean-app-setup-rationale.md` | Original prose rationale preserved during refurbishment. |

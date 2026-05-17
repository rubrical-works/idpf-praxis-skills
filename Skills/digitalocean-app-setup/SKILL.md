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
**Purpose:** Guide developers through setting up DigitalOcean App Platform deployments with GitHub integration
**Audience:** Developers deploying web applications, APIs, and static sites to DigitalOcean
**Related Skills:** `ci-cd-pipeline-design`
## Step 0 — Re-read Config (MANDATORY)
Read `resources/digitalocean-app-setup.config.json` from disk at start of every invocation. Validate against `resources/digitalocean-app-setup.config.schema.json`. Config is source of truth for `doctl` install commands, doctl subcommand templates, GitHub Action version, required secret name, default HTTP port. SKILL.md must not duplicate values.
When a step needs a value not in the config (e.g., a freshly invented `doctl` subcommand), refuse and report — do not invent inline.
## Overview
App Platform uses app spec (`app-spec.yaml`) for IaC, supports review apps for PRs, offers native GitHub integration with automatic deployments.
## Initial Setup
## Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before running any of `cli.install.*` (DigitalOcean CLI installer per platform), `cli.auth.command` (`doctl auth init`), or `appCommands.create` (creating App Platform resources) from the config.
- **What is asked:** acceptance of responsibility for change to system package managers, local doctl authentication state, and DigitalOcean account (newly created App Platform resources).
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation. Gate re-fires every subsequent invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
### Prerequisites
- DigitalOcean account
- `doctl` CLI installed — pick from `cli.install` based on detected platform
- GitHub repository connected to DigitalOcean
### Installing doctl
Detect platform and run matching `cli.install.<platform>` from config. After install, run `cli.auth.command` to authenticate. Auth prompts for API token; tokens issued from DigitalOcean account API page.
### Creating an App
Run `appCommands.create` from config, substituting `{specPath}` with path to your app spec (default: `specFiles.appSpec`). Bumping doctl release = JSON edit.
For dashboard-based creation, ask user what they see rather than describing a navigation path — dashboard layout changes without notice.
## Environment Configuration
### Required Secrets
Configure secrets named in `secrets.required[].name` from config in GitHub repository's secrets page. Each entry includes source and description.
### App-Level Environment Variables
Set in app spec or via dashboard:
- **App-level**: Shared across all components
- **Component-level**: Scoped to single service/worker
See `resources/env-setup.md`.
## GitHub Integration
### Auto-Deploy on Push
DigitalOcean connects directly to GitHub and auto-deploys on push. Ask user to follow App Platform UI's "create app from repo" flow — exact navigation labels not stable enough to script.
### Review Apps (Preview Deployments)
Review apps create isolated environments for PRs. Each PR gets unique URL; destroyed when PR closes. Enable through App Platform UI's app settings; ask user what they see.
### GitHub Actions Deployment
Use GitHub Action declared at `githubAction.uses` in config. Token input name is `githubAction.tokenInput`; secret to populate it is the entry in `secrets.required` with `name == cli.auth.envVar`.
```yaml
# See resources/deploy.yml for the complete workflow.
# The action reference and token input come from the config.
```
## Deployment Strategies
### Production via Branch Deploy
App Platform auto-deploys from configured branch:
```
main branch → Production app (automatic)
```
### Staging via Separate App
Create second app with staging-specific app spec, using `appCommands.create` with `{specPath}` set to staging spec.
### Manual Deployment
Use `appCommands.createDeployment` from config (substituting `{appId}`). List with `appCommands.listDeployments`.
### Rollback
Use `appCommands.rollback` from config, substituting `{appId}` and `{deploymentId}`. Find target via `appCommands.listDeployments`.
## Monitoring and Debugging
### Logs
- **Stream runtime logs:** `appCommands.logs` (substitute `{appId}`)
- **Build logs:** `appCommands.buildLogs`
### Dashboard Metrics
Built-in monitoring (CPU, memory, HTTP request rate, latency, error rate, bandwidth, container restart count). Surface via dashboard rather than scripting retrieval.
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
- **Buildpack detection failure**: Ensure standard project files exist (`package.json`, `requirements.txt`) or use Dockerfile
- **Build timeout**: Optimize with `.doignore`
- **Node.js version**: Set `engines.node` in `package.json` or use `NODEJS_VERSION` env var
### Deployment Issues
- **Port binding**: App Platform expects HTTP on `defaults.httpPort` by default. Set `HTTP_PORT` in app spec or use `$PORT`
- **Static site routing**: For SPAs, configure catch-all routes in app spec
- **Database connections**: Use connection pools and DigitalOcean Managed Databases for production
### Review App Issues
- **Cost awareness**: Review apps count as separate app instances. Monitor usage
- **Database isolation**: Review apps share production database by default. Use separate dev databases
- **Environment variable conflicts**: Review app env vars inherit from main app. Override per-component in spec
## App Spec Reference
`app-spec.yaml` defines app's infrastructure. See `specFiles.appSpec` for reference configuration covering service definitions (web, worker, job), database provisioning, env vars, build/run commands, domain configuration, health checks.
## Related Skills
- **`ci-cd-pipeline-design`** — Architecture patterns for CI/CD pipelines
## Resources
| File | Purpose |
|------|---------|
| `resources/digitalocean-app-setup.config.json` | Volatile knobs (CLI install commands, doctl subcommand templates, GitHub Action version, secret names, default port). Re-read at every invocation. |
| `resources/digitalocean-app-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/app-spec.yaml` | Reference DigitalOcean App Platform spec. |
| `resources/deploy.yml` | GitHub Actions workflow for DigitalOcean deployment. |
| `resources/env-setup.md` | Environment variable setup guide. |
| `docs/digitalocean-app-setup-rationale.md` | Original prose rationale preserved during refurbishment. |

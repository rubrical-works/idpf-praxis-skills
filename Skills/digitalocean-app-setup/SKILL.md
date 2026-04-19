---
name: digitalocean-app-setup
description: Configure automated preview, staging, and production deployments with DigitalOcean App Platform
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [digitalocean, docker, node, python]
copyright: "Rubrical Works (c) 2026"
---
# Skill: digitalocean-app-setup
**Purpose:** Guide DigitalOcean App Platform deployments with GitHub integration
**Audience:** Developers deploying web apps, APIs, static sites to DigitalOcean
**Related:** `ci-cd-pipeline-design`
## Overview
App Platform uses an app spec (`app-spec.yaml`) for IaC, supports review apps for PRs, and offers native GitHub auto-deploy.
## Responsibility Acknowledgement Gate
Implements `responsibility-gate` pattern. See `Skills/responsibility-gate/SKILL.md`.
- **Fires:** before `brew/snap install doctl`, `doctl auth init`, or `doctl apps create`.
- **Asks:** accept responsibility for changes to package managers (brew/snap), doctl auth state, and DigitalOcean account resources.
- **On decline:** exit cleanly; "Declined — no changes made."
- **Persistence:** per-invocation.
Use `AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`.
### Prerequisites
- DigitalOcean account
- `doctl` CLI: `brew install doctl` or `snap install doctl`
- GitHub repo connected to DigitalOcean
### Installing doctl
```bash
# macOS
brew install doctl
# Linux
snap install doctl
# Authenticate
doctl auth init
```
### Creating an App
```bash
# From app spec file
doctl apps create --spec resources/app-spec.yaml
# Or via Dashboard
# https://cloud.digitalocean.com/apps → Create App → Select GitHub repo
```
## Environment Configuration
### Required Secrets
Configure in GitHub (Settings > Secrets and variables > Actions):
| Secret | Source | Description |
|--------|--------|-------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DO Dashboard > API > Tokens | Personal access token |
### App-Level Environment Variables
Set in app spec or Dashboard:
- **App-level**: Shared across all components
- **Component-level**: Scoped to single service/worker
See `resources/env-setup.md`.
## GitHub Integration
### Auto-Deploy on Push
1. Dashboard > Apps > Create App
2. Select GitHub as source
3. Choose repository and branch
4. App Platform detects framework and configures build
### Review Apps (Preview Deployments)
1. App > Settings > Review Apps > Enable
2. Each PR gets unique URL
3. Destroyed when PR closes
### GitHub Actions Deployment
```yaml
# See resources/deploy.yml for complete workflow
- uses: digitalocean/action-doctl@v2
  with:
    token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
- run: doctl apps create-deployment ${{ vars.DO_APP_ID }}
```
## Deployment Strategies
### Production via Branch Deploy
```
main branch → Production app (automatic)
```
### Staging via Separate App
```bash
doctl apps create --spec staging-app-spec.yaml
```
### Manual Deployment
```bash
doctl apps create-deployment <app-id>
doctl apps list-deployments <app-id>
```
### Rollback
```bash
doctl apps list-deployments <app-id> --format ID,Phase,Progress
doctl apps create-deployment <app-id> --revision <deployment-id>
```
## Monitoring and Debugging
### Logs
```bash
doctl apps logs <app-id> --follow
doctl apps logs <app-id> --type build
```
### Dashboard Metrics
- CPU/memory per component
- HTTP request rate, latency, error rate
- Bandwidth, container restarts
### Health Checks
```yaml
services:
  - name: web
    health_check:
      http_path: /api/health
      initial_delay_seconds: 10
      period_seconds: 30
```
## Common Pitfalls
### Build Issues
- **Buildpack detection failure**: ensure `package.json`/`requirements.txt` exist or use Dockerfile
- **Build timeout**: use `.doignore` to exclude files
- **Node.js version**: set `engines.node` or `NODEJS_VERSION` env
### Deployment Issues
- **Port binding**: expects HTTP on 8080; use `HTTP_PORT` or `$PORT`
- **Static site routing**: configure catch-all routes for SPAs
- **Database connections**: use pools and Managed Databases in production
### Review App Issues
- **Cost**: review apps count as separate instances
- **Database isolation**: shares production DB by default; use separate dev DBs
- **Env var conflicts**: inherit from main app; override per-component
## App Spec Reference
See `resources/app-spec.yaml` covering: service definitions (web, worker, job), database provisioning, env vars, build/run commands, domain config, health checks.
## Related Skills
- **`ci-cd-pipeline-design`** — CI/CD architecture patterns
## Resources
- `resources/app-spec.yaml` — Reference spec
- `resources/deploy.yml` — GitHub Actions workflow
- `resources/env-setup.md` — Env variable setup

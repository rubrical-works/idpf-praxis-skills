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
**Purpose:** Guide developers through setting up DigitalOcean App Platform deployments with GitHub integration
**Audience:** Developers deploying web applications, APIs, and static sites to DigitalOcean
**Related Skills:** `ci-cd-pipeline-design` -- for broader CI/CD pipeline architecture
## Initial Setup
### Prerequisites
- DigitalOcean account
- `doctl` CLI installed: `brew install doctl` or `snap install doctl`
- GitHub repository connected to DigitalOcean
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
# Or via Dashboard: https://cloud.digitalocean.com/apps -> Create App -> Select GitHub repo
```
## Environment Configuration
### Required Secrets
Configure in GitHub repository settings (Settings > Secrets and variables > Actions):
| Secret | Source | Description |
|--------|--------|-------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DO Dashboard > API > Tokens | Personal access token |
### App-Level Environment Variables
Set in the app spec or Dashboard (App > Settings > App-Level Environment Variables):
- **App-level**: Shared across all components
- **Component-level**: Scoped to a single service/worker
See `resources/env-setup.md` for a complete guide.
## GitHub Integration
### Auto-Deploy on Push
1. Dashboard > Apps > Create App
2. Select GitHub as source
3. Choose repository and branch
4. App Platform detects framework and configures build automatically
### Review Apps (Preview Deployments)
1. App > Settings > Review Apps > Enable
2. Each PR gets a unique URL for testing
3. Review apps are destroyed when the PR is closed
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
main branch -> Production app (automatic)
```
### Staging via Separate App
```bash
doctl apps create --spec staging-app-spec.yaml
```
### Manual Deployment
```bash
# Trigger a new deployment
doctl apps create-deployment <app-id>
# List recent deployments
doctl apps list-deployments <app-id>
```
### Rollback
```bash
# List deployments to find the target
doctl apps list-deployments <app-id> --format ID,Phase,Progress
# Rollback to a specific deployment
doctl apps create-deployment <app-id> --revision <deployment-id>
```
## Monitoring and Debugging
### Logs
```bash
# Stream runtime logs
doctl apps logs <app-id> --follow
# View build logs for a specific deployment
doctl apps logs <app-id> --type build
```
### Dashboard Metrics
- CPU and memory usage per component
- HTTP request rate, latency, and error rate
- Bandwidth consumption
- Container restart count
### Health Checks
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
- **Buildpack detection failure**: Ensure standard project files exist (`package.json`, `requirements.txt`, etc.) or use a Dockerfile
- **Build timeout**: Optimize with `.doignore` to exclude unnecessary files
- **Node.js version**: Set `engines.node` in `package.json` or use `NODEJS_VERSION` env var
### Deployment Issues
- **Port binding**: App Platform expects HTTP on port 8080 by default. Set `HTTP_PORT` in app spec or use `$PORT` env var
- **Static site routing**: For SPAs, configure catch-all routes in the app spec
- **Database connections**: Use connection pools and DigitalOcean Managed Databases for production
### Review App Issues
- **Cost awareness**: Review apps count as separate app instances
- **Database isolation**: Review apps share the production database by default. Use separate dev databases
- **Environment variable conflicts**: Review app env vars inherit from the main app. Override per-component in the spec
## App Spec Reference
The `app-spec.yaml` file defines your app's infrastructure. See `resources/app-spec.yaml` for a reference configuration covering:
- Service definitions (web, worker, job)
- Database provisioning
- Environment variables
- Build and run commands
- Domain configuration
- Health checks
## Resources
- `resources/app-spec.yaml` -- Reference DigitalOcean App Platform spec
- `resources/deploy.yml` -- GitHub Actions workflow for DigitalOcean deployment
- `resources/env-setup.md` -- Environment variable setup guide

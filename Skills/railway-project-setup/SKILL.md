---
name: railway-project-setup
description: Configure automated preview, staging, and production deployments with Railway
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [railway, docker, node, python, deployment]
copyright: "Rubrical Works (c) 2026"
---
# Skill: railway-project-setup
**Purpose:** Guide developers through setting up Railway deployments with GitHub Actions integration
**Audience:** Developers deploying web applications and services to Railway
**Related Skills:** `ci-cd-pipeline-design`
## Initial Setup
### Prerequisites
- Railway account (free tier or Pro plan for team features)
- Railway CLI installed: `npm install -g @railway/cli`
- GitHub repository with push access
### Linking Your Project
```bash
railway login
railway link
# Or initialize a new project
railway init
```
### Project Structure
- **Project**: Top-level container (e.g., "my-app")
- **Service**: Individual deployable unit (e.g., "web", "api", "worker")
- **Environment**: Deployment target (e.g., "production", "staging", "pr-123")
## Environment Configuration
### Required Secrets
Configure in GitHub repository settings (Settings > Secrets and variables > Actions):
| Secret | Source | Description |
|--------|--------|-------------|
| `RAILWAY_TOKEN` | Railway Dashboard > Account > Tokens | API authentication token |
### Environment Variables
Set per-service in Railway Dashboard (Service > Variables tab):
- Variables scoped to environments (production, staging, PR)
- Use shared variables for cross-service configuration
- Railway auto-injects `PORT`, `RAILWAY_ENVIRONMENT`, `RAILWAY_SERVICE_NAME`
See `resources/env-setup.md` for complete guide.
## GitHub Integration
### Native GitHub Integration
1. Connect GitHub repo in Railway Dashboard (Project > Settings > Source)
2. Select branch for production deploys
3. Enable PR environments for preview deployments
### GitHub Actions Deployment
```yaml
- name: Deploy to Railway
  run: railway up --service ${{ vars.RAILWAY_SERVICE }}
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```
## PR Environments (Preview Deployments)
### Enabling PR Environments
1. Railway Dashboard: Project > Settings > Environments
2. Enable "PR Environments"
3. Each PR gets a full environment with its own service instances, database instances (cloned from staging/production), and environment variables
### Automatic Cleanup
PR environments are automatically destroyed when the PR is closed or merged.
### Limitations
- PR environments share the project's resource limits
- Database cloning may increase costs on large datasets
- Some external services may need manual configuration per PR
## Deployment Strategies
### Production via Branch Deploy
```
main branch -> Production environment (automatic)
```
### Staging Environment
1. Railway Dashboard > Project > Environments > New Environment
2. Name it "staging"
3. Configure branch trigger (e.g., `develop`)
### Manual Deployment
```bash
railway up --service web
railway up --service web --environment staging
```
### Rollback
```bash
railway deployments
railway rollback
```
## Monitoring and Debugging
### Deployment Logs
```bash
railway logs --service web
railway logs --deployment-id <id>
```
### Railway Dashboard
- **Metrics**: CPU, memory, and network usage per service
- **Logs**: Real-time log streaming with search and filtering
- **Deployments**: History with build logs and status
### Health Checks
```toml
[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
```
## Common Pitfalls and Troubleshooting
### Build Issues
- **Nixpacks detection failure**: Ensure standard config files (`package.json`, `requirements.txt`, etc.) or specify a custom Dockerfile
- **Build timeout**: Optimize with `.railwayignore` to exclude unnecessary files
- **Missing dependencies**: Railway uses Nixpacks by default; declare all system dependencies
### Deployment Issues
- **Port binding**: Listen on `process.env.PORT` or `0.0.0.0:$PORT`
- **Database connection drops**: Use connection pooling; configure `PGBOUNCER_URL` for PostgreSQL
- **Cold starts**: Pro plan keeps services running; free tier may sleep after inactivity
### CI/CD Issues
- **Token scoping**: Ensure `RAILWAY_TOKEN` has access to target project
- **Service targeting**: Always specify `--service` for multi-service projects
- **Environment isolation**: PR env vars default to staging values unless overridden
## Configuration Reference
### railway.toml
See `resources/railway.toml` for reference configuration covering build settings, deploy settings, health checks, replicas, and environment-specific overrides.
## Resources
- `resources/railway.toml` — Reference Railway configuration
- `resources/deploy.yml` — GitHub Actions workflow for Railway deployment
- `resources/env-setup.md` — Environment variable setup guide

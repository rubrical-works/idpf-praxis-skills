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
# railway-project-setup
Configure Railway deployments with GitHub Actions integration for preview (PR), staging, and production environments.
**Related Skills:** `ci-cd-pipeline-design` — broader CI/CD pipeline architecture
## Initial Setup
### Prerequisites
- Railway account (free tier or Pro plan for team features)
- Railway CLI: `npm install -g @railway/cli`
- GitHub repository with push access
### Linking Your Project
```bash
railway login
railway link         # Link existing project
railway init         # Or initialize new project
```
### Project Structure
- **Project**: Top-level container (e.g., "my-app")
- **Service**: Individual deployable unit (e.g., "web", "api", "worker")
- **Environment**: Deployment target (e.g., "production", "staging", "pr-123")
## Environment Configuration
### Required Secrets
Configure in GitHub repo settings (Settings > Secrets and variables > Actions):
| Secret | Source | Description |
|--------|--------|-------------|
| `RAILWAY_TOKEN` | Railway Dashboard > Account > Tokens | API authentication token |
### Environment Variables
- Variables scoped to environments (production, staging, PR)
- Use shared variables for cross-service configuration
- Railway auto-injects `PORT`, `RAILWAY_ENVIRONMENT`, `RAILWAY_SERVICE_NAME`
See `resources/env-setup.md` for complete guide.
## GitHub Integration
### Native Integration
1. Connect GitHub repo in Railway Dashboard (Project > Settings > Source)
2. Select branch for production deploys
3. Enable PR environments for preview deployments
### GitHub Actions Deployment
```yaml
# See resources/deploy.yml for complete workflow
- name: Deploy to Railway
  run: railway up --service ${{ vars.RAILWAY_SERVICE }}
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```
## PR Environments (Preview Deployments)
1. Railway Dashboard: Project > Settings > Environments > Enable "PR Environments"
2. Each PR gets a full environment with its own service instances, database instances, and environment variables
3. PR environments automatically destroyed when PR is closed or merged
**Limitations:** Share project resource limits; database cloning may increase costs; some external services need manual config per PR.
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
railway up --service web                        # Deploy to specific service
railway up --service web --environment staging   # Deploy to specific environment
```
### Rollback
```bash
railway deployments    # List recent deployments
railway rollback       # Rollback to previous deployment
```
## Monitoring and Debugging
```bash
railway logs --service web                 # Stream logs
railway logs --deployment-id <id>          # Logs from specific deployment
```
**Dashboard:** Metrics (CPU, memory, network), real-time logs with search, deployment history with build logs.
### Health Checks
```toml
[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
```
## Common Pitfalls
### Build Issues
- **Nixpacks detection failure**: Ensure standard config files (`package.json`, `requirements.txt`) or specify custom Dockerfile
- **Build timeout**: Optimize with `.railwayignore` to exclude unnecessary files
- **Missing dependencies**: Ensure all system dependencies declared for Nixpacks
### Deployment Issues
- **Port binding**: Listen on `process.env.PORT` or `0.0.0.0:$PORT`
- **Database connection drops**: Use connection pooling and `PGBOUNCER_URL` for PostgreSQL
- **Cold starts**: Pro plan keeps services running; free tier may sleep after inactivity
### CI/CD Issues
- **Token scoping**: Ensure `RAILWAY_TOKEN` has access to target project
- **Service targeting**: Always specify `--service` for multi-service projects
- **Environment isolation**: PR env vars default to staging values unless overridden
## Configuration Reference
See `resources/railway.toml` for reference configuration covering build settings, deploy settings, health checks, replicas, and environment overrides.
## Resources
- `resources/railway.toml` — Reference Railway configuration
- `resources/deploy.yml` — GitHub Actions workflow
- `resources/env-setup.md` — Environment variable setup guide

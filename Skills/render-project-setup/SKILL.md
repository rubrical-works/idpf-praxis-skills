---
name: render-project-setup
description: Configure automated preview, staging, and production deployments with Render
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [render, docker, node, python, deployment]
copyright: "Rubrical Works (c) 2026"
---
# render-project-setup
Configure Render deployments with GitHub integration for preview, staging, and production environments. Render uses Infrastructure as Code via `render.yaml` blueprints with zero-configuration deploys.
**Related Skills:** `ci-cd-pipeline-design` — broader CI/CD pipeline architecture
## Initial Setup
### Prerequisites
- Render account (free tier available)
- GitHub repository connected to Render
- Render CLI (optional): `npm install -g @render-cli/cli`
### Connecting GitHub
1. Sign in at https://render.com with GitHub account
2. Grant repository access in Dashboard > Account > GitHub
3. Create new service: Dashboard > New > Web Service
4. Select repository and branch
### Blueprint (Infrastructure as Code)
```yaml
# See resources/render.yaml for complete blueprint
services:
  - type: web
    name: my-app
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```
## Environment Configuration
### Environment Variables
Configure in Dashboard (Service > Environment tab) or via `render.yaml`:
| Variable | Scope | Description |
|----------|-------|-------------|
| `RENDER_API_KEY` | GitHub Actions | API key for deploy triggers |
| `DATABASE_URL` | Service | Database connection (auto-set for Render databases) |
| `PORT` | Auto-injected | Render assigns port 10000 by default |
### Environment Groups
1. Dashboard > Environment Groups > New
2. Add shared variables across services
3. Reference in `render.yaml`: `envVarGroups: [{ name: shared-config }]`
See `resources/env-setup.md` for complete guide.
## GitHub Integration
### Auto-Deploy on Push
Enable in Service > Settings > Build & Deploy. Auto-deploys on commits to configured branch.
### Preview Environments
1. Service > Settings > Preview Environments > Enable
2. Each PR gets unique URL: `https://my-app-pr-{number}.onrender.com`
3. Same build/start commands as production
4. Destroyed automatically when PR is closed
### GitHub Actions Deployment
```yaml
# See resources/deploy.yml for complete workflow
- name: Trigger Render Deploy
  run: |
    curl -X POST "https://api.render.com/v1/services/${{ vars.RENDER_SERVICE_ID }}/deploys"
      -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```
## Deployment Strategies
### Production via Branch Deploy
```
main branch -> Production service (automatic)
```
### Staging via Separate Service
1. Dashboard > New > Web Service
2. Select same repo, different branch (e.g., `develop`)
3. Configure staging-specific environment variables
### Blue-Green Deployments
Render performs zero-downtime deployments by default:
- New version built alongside running version
- Health check passes -> traffic switches
- Old version terminated
### Rollback
Via Dashboard: Service > Deploys > select previous deploy > Rollback
Via API:
```bash
curl -X POST "https://api.render.com/v1/services/{service-id}/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY"
```
## Monitoring and Debugging
- **Logs**: Dashboard (Service > Logs) — build logs, runtime logs, filtering by time/search
- **Metrics**: CPU, memory, HTTP request rate/latency, bandwidth
### Health Checks
```yaml
services:
  - type: web
    healthCheckPath: /api/health
```
Render checks health endpoint after deployment and rolls back if it fails.
## Common Pitfalls
### Build Issues
- **Build timeout**: Default 30-minute limit. Optimize build steps or use build caching
- **Node.js version**: Specify in `engines` field in `package.json` or `RENDER_NODE_VERSION` env var
- **Missing native deps**: Use `render.yaml` `preDeployCommand` to install system packages
### Deployment Issues
- **Port binding**: Always use `process.env.PORT` (Render expects port 10000)
- **Cold starts on free tier**: Free instances spin down after 15 minutes of inactivity
- **Static site routing**: For SPAs, set rewrite rules to redirect all routes to `index.html`
### Preview Environment Issues
- **Database sharing**: Previews share production database by default — use separate databases for isolation
- **Env var conflicts**: Previews inherit from main service — override specific variables in preview settings
- **Cost awareness**: Each preview is a separate service instance
## Resources
- `resources/render.yaml` — Reference Render blueprint configuration
- `resources/deploy.yml` — GitHub Actions workflow
- `resources/env-setup.md` — Environment variable setup guide

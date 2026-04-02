---
name: vercel-project-setup
description: Configure automated preview, staging, and production deployments with Vercel
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [vercel, next, react, node, deployment]
copyright: "Rubrical Works (c) 2026"
---
# Skill: vercel-project-setup
**Purpose:** Guide developers through setting up Vercel deployments with GitHub Actions integration
**Audience:** Developers deploying web applications to Vercel
**Related Skills:** `ci-cd-pipeline-design`
## Initial Setup
### Prerequisites
- Vercel account (free tier available)
- Vercel CLI installed: `npm install -g vercel`
- GitHub repository with push access
### Linking Your Project
```bash
vercel login
vercel link
# Or create a new project
vercel
```
This creates a `.vercel/` directory with `project.json` containing your org and project IDs.
## Environment Configuration
### Required Secrets
Configure in GitHub repository settings (Settings > Secrets and variables > Actions):

| Secret | Source | Description |
|--------|--------|-------------|
| `VERCEL_TOKEN` | Vercel Dashboard > Settings > Tokens | API authentication token |
| `VERCEL_ORG_ID` | `.vercel/project.json` -> `orgId` | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` -> `projectId` | Your Vercel project ID |
### Environment Variables
Set environment-specific variables in Vercel Dashboard (Project > Settings > Environment Variables):
- **Production**: Variables available only in production deployments
- **Preview**: Variables available in preview/PR deployments
- **Development**: Variables available during `vercel dev`
See `resources/env-setup.md` for a complete environment variable setup guide.
## GitHub Integration
### Automated Preview Deployments
Preview deployments create a unique URL for every pull request.
```yaml
# See resources/deploy.yml for complete workflow
on:
  pull_request:
    types: [opened, synchronize]

steps:
  - uses: amondnet/vercel-action@v25
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
      vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```
### Production Deployments
Triggered when pushing to main or creating a release tag:
```yaml
on:
  push:
    branches: [main]

steps:
  - uses: amondnet/vercel-action@v25
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-args: '--prod'
```
## Custom Configuration
### vercel.json
Key configuration areas:
- **Build settings**: Framework detection, build command, output directory
- **Routes**: URL rewrites, redirects, custom headers
- **Functions**: Serverless function configuration (runtime, memory, timeout)
- **Crons**: Scheduled serverless function invocation
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "nextjs",
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]
}
```
## Deployment Strategies
### Preview per PR
Every pull request gets its own deployment: `https://{project}-{hash}-{scope}.vercel.app`
### Staging Environment
```yaml
on:
  push:
    branches: [develop]
```
### Production with Approval
```yaml
jobs:
  deploy:
    environment: production  # Requires approval in GitHub settings
```
### Instant Rollback
```bash
vercel ls
vercel rollback [deployment-url]
```
## Monitoring and Debugging
### Deployment Logs
```bash
vercel logs [deployment-url]
vercel inspect [deployment-url]
```
### Runtime Logs
Access via Vercel Dashboard (Project > Deployments > Functions tab) or CLI:
```bash
vercel logs [deployment-url] --follow
```
### Health Checks
```yaml
- name: Health Check
  run: |
    DEPLOY_URL="${{ steps.deploy.outputs.preview-url }}"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/health")
    if [ "$STATUS" != "200" ]; then
      echo "Health check failed (status: $STATUS)"
      exit 1
    fi
```
## Common Pitfalls and Troubleshooting
### Build Failures
- **Missing environment variables**: Ensure all required env vars are set for the correct environment scope
- **Node.js version mismatch**: Set `engines.node` in `package.json` or configure in Vercel project settings
- **Build command not found**: Verify `buildCommand` in `vercel.json` matches `package.json` scripts
### Deployment Issues
- **404 on client-side routes**: Add rewrite rule for SPA routing:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **API routes not working**: Ensure serverless functions are in `/api` directory
- **Large deployment size**: Check `.vercelignore` to exclude unnecessary files
### CI/CD Issues
- **Token expired**: Regenerate in Dashboard > Settings > Tokens
- **Rate limiting**: Use `paths-ignore` to skip documentation changes
- **Concurrent deployments**: Consider GitHub concurrency groups to cancel superseded runs
## Resources
- `resources/vercel.json` -- Reference Vercel project configuration
- `resources/deploy.yml` -- GitHub Actions workflow for preview and production deployments
- `resources/env-setup.md` -- Environment variable setup guide

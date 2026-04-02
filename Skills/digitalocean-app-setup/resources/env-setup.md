# DigitalOcean Environment Variable Setup
## Required GitHub Repository Secrets
### DIGITALOCEAN_ACCESS_TOKEN
**Where to get it:** DigitalOcean Dashboard > API > Tokens
1. Go to https://cloud.digitalocean.com/account/api/tokens
2. Click "Generate New Token"
3. Give it a name and select Read/Write scope
4. Copy the token immediately (shown only once)
**Add to GitHub:** Repository > Settings > Secrets and variables > Actions > New repository secret
## GitHub Actions Variables (non-secret)
Set in Repository > Settings > Secrets and variables > Actions > Variables tab:
| Variable | Description | Example |
|----------|-------------|---------|
| `DO_APP_ID` | App ID for deployment API calls | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `DO_PRODUCTION_URL` | Production URL for health checks | `https://my-app-xxxxx.ondigitalocean.app` |
## App-Level Environment Variables
Set in DigitalOcean Dashboard (App > Settings > App-Level Environment Variables):
| Variable | Scope | Description |
|----------|-------|-------------|
| `NODE_ENV` | App-level | Runtime environment |
| `DATABASE_URL` | Component | Database connection string |
| `PORT` | Auto-injected | Default: 8080 |
## Tips
- Use app-level env vars for values shared across all components
- Component-level vars override app-level vars with the same key
- Encrypt sensitive values by setting `type: SECRET` in the app spec
- Environment variables can be managed via `doctl` CLI or the app spec YAML
- Review apps inherit env vars from the main app; override per-component in the spec

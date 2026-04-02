# Vercel Environment Variable Setup
## Required GitHub Repository Secrets
### 1. VERCEL_TOKEN
**Where to get it:** https://vercel.com/account/tokens
1. Click "Create" to generate a new token
2. Name it (e.g., "GitHub Actions")
3. Set scope to your team or personal account
4. Copy the token immediately (it won't be shown again)
**Add to GitHub:** Repository > Settings > Secrets and variables > Actions > New repository secret
### 2. VERCEL_ORG_ID
**Where to get it:** `.vercel/project.json` after running `vercel link`
```json
{
  "orgId": "team_xxxxxxxxxxxx",  // <- This value
  "projectId": "prj_xxxxxxxxxxxx"
}
```
### 3. VERCEL_PROJECT_ID
**Where to get it:** `.vercel/project.json` after running `vercel link`
```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"  // <- This value
}
```
## Environment-Specific Variables
Set in Vercel Dashboard (Project > Settings > Environment Variables):
| Variable | Production | Preview | Development | Description |
|----------|:----------:|:-------:|:-----------:|-------------|
| `DATABASE_URL` | Yes | Yes | Yes | Database connection string |
| `API_KEY` | Yes | Yes | No | External API key |
| `NEXT_PUBLIC_API_URL` | Yes | Yes | Yes | Public API endpoint |
| `SENTRY_DSN` | Yes | Yes | No | Error tracking |
## Tips
- Use different database instances for production vs. preview environments
- Prefix client-side variables with `NEXT_PUBLIC_` (Next.js) or `VITE_` (Vite)
- Preview environment variables apply to all PR deployments
- Use `vercel env pull .env.local` to sync variables locally

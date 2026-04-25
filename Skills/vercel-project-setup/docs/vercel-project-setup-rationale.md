# vercel-project-setup Rationale

Preserved prose from the original SKILL.md. SKILL.md now references `resources/vercel-project-setup.config.json` for volatile values.

## Why `amondnet/vercel-action@v25`

Vercel itself does not maintain a first-party GitHub Action — the community-maintained `amondnet/vercel-action` is the de-facto standard. The major version `@v25` is pinned in the config; bump there when you upgrade. The three input names (`vercel-token`, `vercel-org-id`, `vercel-project-id`) are the action's stable input contract.

## Three required secrets

Unlike most platforms (one token), Vercel requires three: token, org id, project id. The org and project ids come from `.vercel/project.json` after running `vercel link`. The config's `secrets.required` schema enforces `minItems: 3` so a future edit cannot accidentally drop one.

## CLI commands moved into config

`vercel ls`, `vercel rollback`, `vercel logs`, `vercel inspect`, `vercel dev` — all subcommand templates live in `deployCommands`/`cli`. Vercel CLI changes shape between major versions (e.g., the meaning of bare `vercel` shifted in v23+); pinning the templates here means a CLI major bump is a JSON edit + version-tested in this skill's test, not a hunt-and-replace through prose.

## Wizard prose removal

Dashboard navigation ("Settings > Environment Variables", "Project > Deployments > Functions tab", "Settings > Tokens") was removed and replaced with prompts that ask the user what they see. The Vercel dashboard reorganizes frequently.

## Production flag isolated

The `--prod` flag is recorded as `deployCommands.deployProductionFlag` rather than baked into a deploy command template. This is a deliberate isolation — the same base deploy command serves preview and production, and the only difference is whether `--prod` is appended.

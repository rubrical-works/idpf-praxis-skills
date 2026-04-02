# Using astro-development Without IDPF Framework
Architectural decision patterns for Astro — Islands hydration directives, Content Collections with type-safe schemas, multi-framework integration, and deployment adapter selection.
## What's Included
| File | Purpose |
|------|---------|
| `SKILL.md` | Islands Architecture overview, Content Collections API, rendering modes, quick-reference decision table |
| `resources/islands-architecture.md` | Hydration directives with decision flowchart and performance trade-offs |
| `resources/content-collections.md` | Schema design patterns with Zod validation, querying strategies, cross-collection references |
| `resources/integration-and-deployment.md` | Multi-framework integration, rendering mode selection, deployment adapter configuration |
## Quick Start
1. Install the skill (e.g., via Praxis Hub Manager or place in `.claude/skills/astro-development/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md`:
```
This is an Astro project. When making architectural decisions about hydration
directives, Content Collection schemas, rendering modes, or deployment adapters,
read .claude/skills/astro-development/SKILL.md first. Load the relevant resource
file from resources/ for detailed guidance on Islands architecture, content
collections, or integration/deployment.
```
## Customization
- Update `resources/islands-architecture.md` for project-specific hydration rules
- Extend `resources/content-collections.md` with your actual collection schemas and custom Zod validators
- Edit `resources/integration-and-deployment.md` to document your chosen deployment adapter and hosting platform
## How IDPF Projects Use This
In IDPF projects, this skill loads on demand when working on Astro-based applications. The framework detects `astro` in the tech stack and makes it available for architectural decisions. The approach above replicates that behavior for any Claude Code project.

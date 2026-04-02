---
name: astro-development
description: Architectural decision patterns for Astro web framework — Islands hydration, Content Collections, multi-framework integration, and deployment
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [astro, javascript, typescript, react, vue, svelte]
copyright: "Rubrical Works (c) 2026"
---
# Astro Development
Architectural decision patterns for Astro: when/why to use specific features. Requires Node.js 18+, Astro project, HTML/CSS/JS/TS familiarity, one component framework.
**Target:** Astro v4.x+ | **Verified:** 2026-03-01 | Review on major upgrades
## When to Use
- Choosing hydration directives for interactive components
- Designing Content Collection schemas with type-safe frontmatter
- Mixing UI frameworks (React, Vue, Svelte) in one project
- Choosing static, server, or hybrid rendering
- Selecting deployment adapters
- Optimizing with zero-JS defaults, image optimization, View Transitions
## Quick Reference
| Decision | Guide | Resource |
|----------|-------|----------|
| Hydration directive? | Match loading priority to UX impact | [islands-architecture.md](resources/islands-architecture.md) |
| Content type safety? | Schema-first with Zod | [content-collections.md](resources/content-collections.md) |
| Mix React + Svelte? | Yes, isolated configs | [integration-and-deployment.md](resources/integration-and-deployment.md) |
| Static/server/hybrid? | Default static; SSR per-route | [integration-and-deployment.md](resources/integration-and-deployment.md) |
| Deploy adapter? | Match to platform | [integration-and-deployment.md](resources/integration-and-deployment.md) |
## Islands Architecture
Pages render as static HTML. Interactive "islands" hydrate independently, loading JS only where needed. Most pages ship zero client JS.
| Directive | Loads When | Use For |
|-----------|-----------|---------|
| `client:load` | Immediately | Critical elements (buy buttons, nav) |
| `client:idle` | Browser idle | Non-critical (comments, chat) |
| `client:visible` | Scrolls into viewport | Below-fold (carousels, accordions) |
| `client:media` | CSS media query matches | Responsive-only (mobile menu) |
| `client:only` | Immediately, no SSR | Cannot server-render (canvas, WebGL) |
| No directive | Never (static HTML) | No interactivity needed |
**Default to no directive.** Add `client:*` only when genuinely needed. See [islands-architecture.md](resources/islands-architecture.md).
## Content Collections
Organize content (blog, docs, products) with schema validation and TS type safety. Define in `src/content.config.ts` with loader + Zod schema.
**Key APIs:**
- `getCollection('blog')` -- all entries with type inference
- `getEntry('blog', 'my-post')` -- single entry by ID
- `render()` -- Markdown/MDX to HTML
- `reference('authors')` -- type-safe cross-collection refs
See [content-collections.md](resources/content-collections.md).
## Rendering Modes
| Mode | Default | Server Required | Best For |
|------|---------|-----------------|----------|
| Static | Yes | No | Blogs, docs, marketing |
| Hybrid | -- | Yes (adapter) | Mostly static + some dynamic |
| Server | -- | Yes (adapter) | Auth, real-time, personalization |
**Start static.** Opt routes into SSR with `export const prerender = false`. See [integration-and-deployment.md](resources/integration-and-deployment.md).

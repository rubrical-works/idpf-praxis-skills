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
Architectural decision-making patterns for Astro, focusing on when and why to use specific features.
## When to Use
- Deciding which hydration directive to use for interactive components
- Designing Content Collection schemas with type-safe frontmatter
- Mixing multiple UI frameworks (React, Vue, Svelte) in a single project
- Choosing between static, server, and hybrid rendering modes
- Selecting deployment adapters for hosting platforms
- Optimizing performance with zero-JS defaults, image optimization, or View Transitions
## Prerequisites
- Node.js 18+ and npm (or pnpm/yarn)
- An existing Astro project or `npm create astro@latest`
- Familiarity with HTML, CSS, and JavaScript/TypeScript
- Basic understanding of at least one component framework (React, Vue, or Svelte)
## Version Applicability
- **Target:** Astro v4.x+
- **Last verified:** 2026-03-01
- **Maintenance:** Major Astro version upgrades should trigger a content review pass
## Quick Reference
| Decision | Guide | Resource |
|----------|-------|----------|
| Which hydration directive? | Match loading priority to UX impact | [islands-architecture.md](resources/islands-architecture.md) |
| How to structure content with type safety? | Schema-first design with Zod validation | [content-collections.md](resources/content-collections.md) |
| Can I mix React and Svelte? | Yes, with isolated integration configs | [integration-and-deployment.md](resources/integration-and-deployment.md) |
| Static, server, or hybrid rendering? | Default static; opt in to SSR per-route | [integration-and-deployment.md](resources/integration-and-deployment.md) |
| Which deployment adapter? | Match to hosting platform | [integration-and-deployment.md](resources/integration-and-deployment.md) |
## Core Concept: Islands Architecture
Astro renders pages as static HTML by default. Interactive components are isolated "islands" that hydrate independently, loading JavaScript only where needed. Most pages ship zero client-side JavaScript.
**The fundamental question:** For each interactive component, *when* should the browser load its JavaScript?
| Directive | Loads When | Use For |
|-----------|-----------|---------|
| `client:load` | Immediately on page load | Critical interactive elements (buy buttons, navigation) |
| `client:idle` | After page load, when browser is idle | Non-critical interactivity (comments, chat widgets) |
| `client:visible` | When component scrolls into viewport | Below-fold content (carousels, accordions) |
| `client:media` | When CSS media query matches | Responsive-only features (mobile menu) |
| `client:only` | Immediately, client-render only (no SSR) | Components that cannot server-render (canvas, WebGL) |
| No directive | Never (static HTML only) | Content that doesn't need interactivity |
**Default to no directive.** Only add `client:*` when the component genuinely needs browser interactivity. See [islands-architecture.md](resources/islands-architecture.md) for decision flowchart and examples.
## Core Concept: Content Collections
Content Collections organize related content with schema validation and TypeScript type safety. Define collections in `src/content.config.ts` with a loader and Zod schema.
**Key APIs:**
- `getCollection('blog')` — query all entries with full type inference
- `getEntry('blog', 'my-post')` — fetch single entry by ID
- `render()` — transform Markdown/MDX content to HTML
- `reference('authors')` — type-safe cross-collection references
See [content-collections.md](resources/content-collections.md) for schema design patterns and querying strategies.
## Core Concept: Rendering Modes
| Mode | Default | Server Required | Best For |
|------|---------|-----------------|----------|
| Static | Yes | No | Blogs, docs, marketing sites |
| Hybrid | — | Yes (adapter) | Mixed: mostly static with some dynamic routes |
| Server | — | Yes (adapter) | Apps with auth, real-time data, personalization |
**Start static.** Opt individual routes into SSR with `export const prerender = false` (hybrid) rather than switching the entire site to server mode. See [integration-and-deployment.md](resources/integration-and-deployment.md).

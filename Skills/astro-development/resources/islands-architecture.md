# Islands Architecture Decision Guide

## Decision Flowchart

For each component on a page, ask these questions in order:

```
Does this component need browser interactivity?
  │
  ├─ NO → Use no directive (renders as static HTML, zero JS shipped)
  │
  └─ YES → Does it need to work immediately on page load?
              │
              ├─ YES → Does it require client-only rendering (no SSR)?
              │          │
              │          ├─ YES → client:only="framework"
              │          │        (canvas, WebGL, browser-only APIs)
              │          │
              │          └─ NO  → client:load
              │                   (buy buttons, critical navigation, auth forms)
              │
              └─ NO  → Is it below the fold (user must scroll to see it)?
                         │
                         ├─ YES → client:visible
                         │        (carousels, accordions, image galleries)
                         │
                         └─ NO  → Is it conditional on screen size?
                                    │
                                    ├─ YES → client:media="(query)"
                                    │        (mobile hamburger menu, sidebar toggle)
                                    │
                                    └─ NO  → client:idle
                                             (comment sections, chat, analytics)
```

## Directive Deep Dive

### `client:load` — Immediate Priority

Hydrates the component immediately on page load. The component renders server-side HTML first, then JavaScript takes over.

```astro
---
import BuyButton from '../components/BuyButton.jsx';
---
<!-- Critical: user may click immediately -->
<BuyButton client:load productId="abc-123" />
```

**When to use:**
- Above-the-fold interactive elements
- Elements users interact with in the first few seconds
- Auth/login forms that must be ready immediately

**When NOT to use:**
- Content below the fold — use `client:visible` instead
- Non-critical widgets — use `client:idle` instead
- Every component "just to be safe" — defeats the purpose of Islands

### `client:idle` — Deferred Priority

Hydrates after the page finishes loading and the browser fires `requestIdleCallback`. The component appears as static HTML until the browser has spare cycles.

```astro
---
import CommentSection from '../components/CommentSection.jsx';
---
<!-- Non-critical: can wait for browser idle -->
<CommentSection client:idle postId="123" />
```

**Optional timeout:** Guarantee hydration within a maximum time:
```astro
<CommentSection client:idle={{timeout: 3000}} postId="123" />
```

**When to use:**
- Visible but non-urgent interactivity (comments, reactions, share buttons)
- Analytics or tracking widgets
- Secondary navigation elements

### `client:visible` — Viewport Priority

Hydrates only when the component scrolls into the user's viewport using `IntersectionObserver`.

```astro
---
import ImageGallery from '../components/ImageGallery.svelte';
---
<!-- Below fold: no JS until user scrolls here -->
<ImageGallery client:visible images={galleryData} />
```

**Optional rootMargin:** Start loading before the component is fully visible:
```astro
<ImageGallery client:visible={{rootMargin: "200px"}} images={galleryData} />
```

**When to use:**
- Below-the-fold content (carousels, galleries, accordions)
- Heavy components that are expensive to hydrate
- Content at the bottom of long pages

### `client:media` — Conditional Priority

Hydrates only when a CSS media query matches. If the query never matches, the JavaScript is never loaded.

```astro
---
import MobileMenu from '../components/MobileMenu.jsx';
---
<!-- Only loads JS on mobile viewports -->
<MobileMenu client:media="(max-width: 768px)" />
```

**When to use:**
- Mobile-only components (hamburger menus, bottom navigation)
- Components that only matter at specific viewport sizes
- Features behind responsive breakpoints

**Important:** The component still renders its HTML on all viewports — only the JavaScript hydration is conditional.

### `client:only` — Client-Side Only

Renders entirely on the client. No server-side HTML is generated. You must specify the framework name as a string.

```astro
---
import CanvasEditor from '../components/CanvasEditor.jsx';
---
<!-- Cannot server-render: uses browser Canvas API -->
<CanvasEditor client:only="react" />
```

**Fallback content:** Provide content to show before hydration:
```astro
<CanvasEditor client:only="react">
  <p slot="fallback">Loading editor...</p>
</CanvasEditor>
```

**When to use:**
- Components using browser-only APIs (Canvas, WebGL, Web Audio)
- Third-party widgets that assume a DOM environment
- Components that break during server-side rendering

**When NOT to use:**
- Standard interactive components — use `client:load` instead for better SEO and initial paint

## Common Mistakes

### Mistake 1: Hydrating Everything

```astro
<!-- BAD: Every component gets client:load -->
<Header client:load />
<Hero client:load />
<Features client:load />
<Footer client:load />

<!-- GOOD: Only interactive parts get directives -->
<Header />  <!-- Static HTML is fine -->
<Hero />
<Features>
  <FeatureDemo client:visible />  <!-- Only the demo needs JS -->
</Features>
<Footer />
```

### Mistake 2: Using `client:load` for Below-Fold Content

```astro
<!-- BAD: Loads JS immediately for content user hasn't seen -->
<TestimonialCarousel client:load />

<!-- GOOD: Defer until visible -->
<TestimonialCarousel client:visible />
```

### Mistake 3: Forgetting Framework Name with `client:only`

```astro
<!-- BAD: Missing framework identifier -->
<Widget client:only />

<!-- GOOD: Framework specified as string -->
<Widget client:only="react" />
```

## Performance Impact

Each `client:load` directive adds to the initial page JavaScript bundle. Measure the impact:

| Directive | Initial JS Impact | Time to Interactive Impact |
|-----------|-------------------|---------------------------|
| No directive | 0 KB | None |
| `client:idle` | Deferred | Minimal |
| `client:visible` | Deferred until scroll | Minimal |
| `client:media` | Conditional | None if query doesn't match |
| `client:load` | Immediate | Proportional to component size |
| `client:only` | Immediate + no SSR HTML | Largest (no static fallback) |

**Rule of thumb:** If fewer than 20% of your page's components use `client:load`, you're using Islands effectively.

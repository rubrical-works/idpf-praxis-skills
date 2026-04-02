# Content Optimization Reference

Quick-reference for structuring content so search engines understand hierarchy, meaning, and relationships between pages.

---

## Heading Hierarchy

### The Rules

1. **Exactly one `<h1>` per page** — represents the page's primary topic
2. **Never skip levels** — `<h1>` → `<h2>` → `<h3>`, never `<h1>` → `<h3>`
3. **Headings form an outline** — reading only the headings should convey the page structure
4. **Keywords are natural** — include relevant terms without keyword stuffing

### Correct Hierarchy

```html
<h1>Complete Guide to Web Performance</h1>
  <h2>Why Performance Matters</h2>
    <h3>User Experience Impact</h3>
    <h3>SEO Ranking Factor</h3>
  <h2>Measuring Performance</h2>
    <h3>Core Web Vitals</h3>
    <h3>Lighthouse Audits</h3>
  <h2>Optimization Techniques</h2>
    <h3>Image Optimization</h3>
    <h3>Code Splitting</h3>
    <h3>Caching Strategies</h3>
```

### Common Mistakes

| Mistake | Why It Hurts |
|---------|-------------|
| Multiple `<h1>` tags | Confuses search engines about the page's primary topic |
| Skipping levels (`<h1>` → `<h3>`) | Breaks the logical outline; crawlers may misinterpret structure |
| Using headings for styling | Use CSS for font size; headings convey **meaning**, not appearance |
| Empty headings | Crawlers index empty headings as meaningless content |
| Keyword stuffing in headings | Search engines penalize unnatural keyword density |

---

## Semantic HTML

### Why Semantic Elements Matter for SEO

Semantic elements tell search engines **what role** each piece of content plays. A `<nav>` is navigation, an `<article>` is self-contained content, a `<main>` is the primary content area. Without semantics, crawlers see a flat collection of `<div>` elements with no structural meaning.

### Element Reference

| Element | SEO Role | Usage |
|---------|----------|-------|
| `<main>` | Primary content area (one per page) | Wrap the page's main content |
| `<article>` | Self-contained, independently distributable content | Blog posts, news articles, forum posts |
| `<section>` | Thematic grouping with its own heading | Chapters, tabbed content, topic groups |
| `<nav>` | Navigation block | Site nav, breadcrumbs, table of contents |
| `<header>` | Introductory content | Page header, article header with metadata |
| `<footer>` | Footer content | Copyright, related links, author info |
| `<aside>` | Tangentially related content | Sidebars, pull quotes, related articles |
| `<figure>` / `<figcaption>` | Illustrations with captions | Images, charts, code samples with labels |
| `<time>` | Machine-readable date/time | Publication dates, event times |
| `<address>` | Contact information | Author contact, business address |

### Semantic Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Article Title — Site Name</title>
  <meta name="description" content="Article description here.">
  <link rel="canonical" href="https://example.com/article">
</head>
<body>

<header>
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/blog">Blog</a>
    <a href="/about">About</a>
  </nav>
</header>

<main>
  <article>
    <header>
      <h1>Article Title</h1>
      <time datetime="2026-01-15">January 15, 2026</time>
      <address>By <a href="/authors/name">Author Name</a></address>
    </header>

    <section>
      <h2>Introduction</h2>
      <p>Opening paragraph with key information front-loaded.</p>
    </section>

    <section>
      <h2>Main Content Section</h2>
      <p>Detailed content with supporting evidence.</p>

      <figure>
        <img src="/images/diagram.png" alt="Descriptive alt text explaining the diagram">
        <figcaption>Figure 1: Diagram showing the content structure</figcaption>
      </figure>
    </section>
  </article>

  <aside>
    <h2>Related Articles</h2>
    <ul>
      <li><a href="/related-article">Related Article Title</a></li>
    </ul>
  </aside>
</main>

<footer>
  <p>&copy; 2026 Site Name</p>
  <nav aria-label="Footer navigation">
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
  </nav>
</footer>

</body>
</html>
```

### Anti-Patterns

```html
<!-- BAD: div soup with no semantic meaning -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="content">
  <div class="article">...</div>
</div>

<!-- GOOD: semantic elements convey structure -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
```

---

## Content Structure

### The Inverted Pyramid

Front-load the most important information. Users scan, and search engines weight content near the top of the page.

```
┌─────────────────────────────────┐
│  Most Important (key takeaway)  │  ← First paragraph
├─────────────────────────────────┤
│  Supporting Details             │  ← Expand on the key points
├─────────────────────────────────┤
│  Background / Context           │  ← Additional depth
└─────────────────────────────────┘
```

### Content Best Practices

| Practice | Guideline |
|----------|-----------|
| Paragraph length | 2-3 sentences; walls of text hurt readability |
| Lists | Use `<ul>` / `<ol>` for scannable information |
| Descriptive link text | "Read the deployment guide" not "click here" |
| Image alt text | Describe every `<img>` for accessibility and image search |
| Bold key phrases | Use `<strong>` for emphasis (not `<b>`) |
| Table of contents | Add for long-form content (>1500 words) |

### Link Text Rules

```html
<!-- GOOD: Descriptive, keyword-relevant -->
<a href="/guides/seo">Read the complete SEO implementation guide</a>

<!-- BAD: Generic, no context -->
<a href="/guides/seo">Click here</a>

<!-- BAD: URL as text -->
<a href="/guides/seo">https://example.com/guides/seo</a>

<!-- GOOD: Natural context -->
<p>For more details, see our
  <a href="/guides/deployment">deployment best practices</a>.</p>
```

### Image Optimization for SEO

```html
<!-- Complete image implementation -->
<figure>
  <img
    src="/images/architecture-diagram.webp"
    alt="System architecture showing three microservices connected via message queue"
    width="800"
    height="600"
    loading="lazy"
  >
  <figcaption>Figure 1: Microservice architecture overview</figcaption>
</figure>
```

| Attribute | SEO Purpose |
|-----------|-------------|
| `alt` | Describes image for search engines and screen readers |
| `width` / `height` | Prevents layout shift (CLS); improves Core Web Vitals |
| `loading="lazy"` | Defers off-screen images; improves page load speed |
| `<figcaption>` | Additional context for search engines |

---

## Internal Linking

### Why Internal Links Matter

Internal links serve three purposes:
1. **Crawlability** — Help search engine bots discover all your pages
2. **Link equity distribution** — Pass ranking authority between pages
3. **User navigation** — Guide users to related content

### Hub-and-Spoke Model

Create topic "hub" pages that link to related detail pages:

```
                    ┌─────────────────┐
                    │   Hub Page:     │
                    │ "SEO Guide"     │
                    └────────┬────────┘
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Technical │ │  Content  │ │ Keywords  │
        │    SEO    │ │   Optim   │ │ Research  │
        └───────────┘ └───────────┘ └───────────┘
```

Hub pages rank for broad terms; spoke pages rank for specific terms. Both benefit from the linking relationship.

### Internal Linking Checklist

- [ ] Every page is reachable within 3 clicks from the homepage
- [ ] No orphan pages (0 internal links pointing to them)
- [ ] Anchor text is descriptive and relevant (not "click here")
- [ ] Links are contextual (within content, not just navigation)
- [ ] No excessive links per page (aim for under 100)
- [ ] Broken internal links audited regularly (404 checks)
- [ ] Important pages have the most internal links pointing to them

### Breadcrumbs

Breadcrumbs improve both navigation and SEO through structured paths:

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/guides">Guides</a></li>
    <li aria-current="page">Technical SEO</li>
  </ol>
</nav>
```

Add BreadcrumbList structured data (JSON-LD) alongside the HTML for rich results in search.

---

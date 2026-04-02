# Content Collections Patterns

## When to Use Content Collections

| Scenario | Use Collections? | Why |
|----------|:-:|-----|
| Blog posts with consistent frontmatter | Yes | Schema validates all posts, TypeScript catches missing fields |
| Product catalog with shared attributes | Yes | Type-safe queries, cross-references to categories |
| Documentation with structured metadata | Yes | Enforced structure, generated nav from collection queries |
| Single standalone page | No | No benefit — just use a `.astro` page |
| Static assets (images, PDFs) | No | Use `public/` or `src/assets/` instead |
| Data requiring real-time updates | No | Collections are build-time; use API endpoints for live data |

## Collection Definition

Define collections in `src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    author: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
  }),
});

export const collections = { blog };
```

## Schema Design Patterns

### Pattern 1: Progressive Required Fields

Start with few required fields, expand as your content model matures:

```typescript
// Phase 1: Minimal
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
  }),
});

// Phase 2: Add optional fields (non-breaking)
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    category: z.enum(['guide', 'reference', 'tutorial']).optional(),
    lastReviewed: z.coerce.date().optional(),
  }),
});
```

**Why:** Adding optional fields is non-breaking. Making a field required later forces you to update all existing content.

### Pattern 2: Discriminated Unions

Different content types sharing a collection with type-safe branching:

```typescript
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('landing'),
      hero: z.string(),
      cta: z.string(),
    }),
    z.object({
      type: z.literal('article'),
      author: z.string(),
      pubDate: z.coerce.date(),
    }),
    z.object({
      type: z.literal('product'),
      price: z.number(),
      sku: z.string(),
    }),
  ]),
});
```

**When to use:** Content that shares a collection but has fundamentally different shapes (e.g., landing pages vs. blog posts vs. product pages).

### Pattern 3: Cross-Collection References

Link related entries across collections with type-safe references:

```typescript
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    author: reference('authors'),  // Type-safe link
    relatedPosts: z.array(reference('blog')).default([]),
  }),
});

export const collections = { authors, blog };
```

**Querying referenced data:**
```typescript
const post = await getEntry('blog', 'my-post');
const author = await getEntry(post.data.author);
// author is fully typed as Authors collection entry
```

### Pattern 4: Computed Fields via Transform

Derive fields from existing data:

```typescript
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    wordCount: z.number().optional(),
  }).transform((data) => ({
    ...data,
    isRecent: data.pubDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  })),
});
```

## Querying Patterns

### Filter and Sort

```typescript
import { getCollection } from 'astro:content';

// Published posts, newest first
const posts = (await getCollection('blog', ({ data }) => {
  return !data.draft;
})).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
```

### Paginate

```typescript
// In src/pages/blog/[...page].astro
export async function getStaticPaths({ paginate }) {
  const posts = await getCollection('blog');
  return paginate(posts.sort((a, b) =>
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  ), { pageSize: 10 });
}
```

### Group by Tag

```typescript
const posts = await getCollection('blog');
const tags = [...new Set(posts.flatMap(post => post.data.tags))];

const postsByTag = Object.fromEntries(
  tags.map(tag => [
    tag,
    posts.filter(post => post.data.tags.includes(tag)),
  ])
);
```

### Render Content

```typescript
// In a .astro page
const post = await getEntry('blog', 'hello-world');
const { Content, headings } = await render(post);
```

```astro
<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

## Common Mistakes

### Mistake 1: Over-Validating

```typescript
// BAD: Too strict — breaks when content doesn't have every field
schema: z.object({
  title: z.string().min(10).max(60),
  description: z.string().min(50).max(160),
  // Every field required, no defaults
})

// GOOD: Reasonable defaults, optional where appropriate
schema: z.object({
  title: z.string(),
  description: z.string().max(160).default(''),
  draft: z.boolean().default(false),
})
```

### Mistake 2: One Giant Collection

```typescript
// BAD: Everything in one collection
const content = defineCollection({
  schema: z.object({
    type: z.enum(['blog', 'docs', 'product', 'author', 'page']),
    // Union of all possible fields...
  }),
});

// GOOD: Separate collections per content type
const blog = defineCollection({ /* blog schema */ });
const docs = defineCollection({ /* docs schema */ });
const products = defineCollection({ /* product schema */ });
```

### Mistake 3: Not Using Draft Filtering

```typescript
// BAD: Draft posts appear in production
const posts = await getCollection('blog');

// GOOD: Filter drafts in production
const posts = await getCollection('blog', ({ data }) => {
  return import.meta.env.PROD ? !data.draft : true;
});
```

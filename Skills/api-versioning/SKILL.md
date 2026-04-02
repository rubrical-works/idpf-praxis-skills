---
name: api-versioning
description: Guide developers through API versioning strategies, deprecation workflows, and backward compatibility patterns
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: api
relevantTechStack: [rest, graphql, api, node, express]
copyright: "Rubrical Works (c) 2026"
---
# API Versioning
## When to Use This Skill
- Designing a new API that will evolve over time
- Planning breaking changes to an existing API
- Establishing deprecation policies
- Migrating clients between API versions
- Choosing between versioning strategies
## Versioning Strategies
### 1. URL Path Versioning
```
/api/v1/users
/api/v2/users
```
- **Pros:** Highly visible, easy to route/cache, simple client implementation
- **Cons:** URL pollution, can't version individual resources differently
- **Best for:** Public APIs, major version changes
### 2. Query Parameter Versioning
```
/api/users?version=1
/api/users?api-version=2024-01-01
```
- **Pros:** Optional (can default), single URL structure
- **Cons:** Easy to miss, can interfere with caching
- **Best for:** Optional versioning, date-based versions
### 3. Header Versioning
```
GET /api/users
Accept-Version: v1
```
- **Pros:** Clean URLs, follows HTTP semantics
- **Cons:** Harder to test in browser, less visible
- **Best for:** Internal APIs, fine-grained versioning
### 4. Content Negotiation (Media Type)
```
GET /api/users
Accept: application/vnd.company.users.v2+json
```
- **Pros:** RESTful approach, can version representations separately
- **Cons:** Complex implementation, harder for clients
- **Best for:** Strict REST, enterprise environments
## Decision Matrix
| Factor | URL Path | Query Param | Header | Media Type |
|--------|----------|-------------|--------|------------|
| Visibility | High | Medium | Low | Low |
| Simplicity | High | High | Medium | Low |
| RESTful | Medium | Low | Medium | High |
| Caching | Easy | Medium | Complex | Complex |
| Testing | Easy | Easy | Medium | Hard |
**Recommendations:** Public APIs -> URL path. Internal APIs -> Header. Enterprise -> Media type. Simple APIs -> Query parameter.
## Version Numbering
### Semantic Versioning
```
MAJOR.MINOR.PATCH
MAJOR: Breaking changes
MINOR: Backward-compatible additions
PATCH: Backward-compatible fixes
```
### Date-Based Versioning
```
YYYY-MM-DD or YYYY-MM
```
Use for frequent releases, rolling deprecation windows, Azure/AWS style APIs.
### Simple Major Versioning
```
v1, v2, v3
```
Use for infrequent major changes, simple lifecycle.
## Backward Compatibility
**Safe changes (compatible):**
- Adding new endpoints, optional parameters, new response fields, new enum values
**Breaking changes (require new version):**
- Removing endpoints/fields, changing field types, renaming fields, changing required parameters, changing authentication
### Compatibility Patterns
**Additive changes:**
```json
// v1 response
{"id": 1, "name": "Alice"}
// v1.1 response (compatible - added field)
{"id": 1, "name": "Alice", "email": "alice@example.com"}
```
**Optional fields:**
```json
{
  "id": 1,
  "name": "Alice",
  "profile": null  // Optional, may not exist in v1 clients
}
```
## Deprecation Workflow
### Lifecycle
```
Active -> Deprecated -> Sunset -> Removed
1. Active: Fully supported
2. Deprecated: Announced, still works, migration encouraged
3. Sunset: Warning period, reduced support
4. Removed: No longer available
```
### Communication
- Documentation updates, API response headers, email/changelog notifications
- Minimum notice period (e.g., 6 months)
**Deprecation header:**
```
Deprecation: true
Sunset: Sat, 01 Jun 2025 00:00:00 GMT
Link: <https://api.example.com/docs/migration>; rel="deprecation"
```
### Migration Support
1. Provide migration guide
2. Offer parallel versions
3. Log deprecated endpoint usage
4. Send notifications to heavy users
5. Provide tooling if complex
### Timeline Example
```
Month 0:  Announce v1 deprecation, v2 released
Month 1:  Add deprecation headers to v1
Month 3:  Start warning notifications
Month 6:  Enter sunset period
Month 9:  Remove v1 (or extend if needed)
```
## Client Migration Guide Template
```markdown
# Migration Guide: v1 to v2
## Overview
- v2 released: [date]
- v1 sunset: [date]
- v1 removal: [date]
## Breaking Changes
1. [Change description]
   - Before: [v1 behavior]
   - After: [v2 behavior]
   - Migration: [steps]
## New Features in v2
- [Feature 1]
## Step-by-Step Migration
1. [Step 1]
2. [Step 2]
```
## REST API Patterns
**Version the API, not resources:**
```
/api/v1/users      yes
/api/v1/products   yes
/api/users/v1      no (inconsistent)
```
**Envelope pattern:**
```json
{
  "data": { ... },
  "meta": {
    "version": "1.2.0",
    "deprecated": false
  }
}
```
## GraphQL Patterns
GraphQL naturally supports additive changes:
```graphql
type User {
  id: ID!
  name: String! @deprecated(reason: "Use fullName instead")
  fullName: String!
  email: String  # New optional field
}
```
For breaking changes: `/graphql` (current), `/graphql/v2` (new version).
## Implementation Checklist
### Before Releasing Versioned API
- [ ] Versioning strategy chosen
- [ ] Version numbering scheme defined
- [ ] Documentation includes version information
- [ ] Deprecation policy documented
- [ ] Client SDKs version-aware
### When Deprecating
- [ ] Deprecation announced
- [ ] Migration guide written
- [ ] Deprecation headers added
- [ ] Sunset date set
- [ ] Usage monitoring in place
### When Removing
- [ ] All clients migrated (or accepted)
- [ ] Logs show minimal traffic
- [ ] Final notifications sent
- [ ] Old version documentation archived
- [ ] Redirects or error messages in place
## Resources
See `resources/` directory for:
- `strategy-comparison.md` - Detailed strategy analysis
- `deprecation-workflow.md` - Step-by-step deprecation process
- `compatibility-guide.md` - Backward compatibility patterns
## Relationship to Other Skills
**Complements:** `error-handling-patterns`, `postgresql-integration`

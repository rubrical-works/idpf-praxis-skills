---
name: code-path-discovery
description: Scan TypeScript/JavaScript source files for behavioral paths and return candidates in 6-category format for /paths turn-based discovery
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [javascript, typescript]
defaultSkill: false
copyright: "Rubrical Works (c) 2026"
---
# Code Path Discovery
Scans TypeScript/JavaScript source code within a specified directory to detect behavioral patterns and map them to the 6-category path format used by `/paths`. Returns candidate scenarios as `{ shortLabel, description }` objects per category for turn-based collaborative discovery.
## Invocation
Primary: `/paths --from-code [path]` (called by `/paths` Step 3b). Also usable for manual codebase behavioral flow analysis.
## Parameters
| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `path` | Yes | string | Source directory to scan |
| `issueTitle` | Yes | string | Issue title for context |
| `issueBody` | No | string | Issue body for additional context |
## How to Use
1. Receive `path`, `issueTitle`, `issueBody` from `/paths` Step 3b
2. Load skill instructions from `resources/skill-instructions.md`
3. Follow scanning and mapping workflow in skill instructions
4. Return results as structured output for `/paths` Step 5
## Output Format
Returns object with 6 category keys, each containing candidate scenario arrays:
```json
{
  "nominalPath": [
    { "shortLabel": "User login flow", "description": "POST /login validates credentials and returns JWT token" }
  ],
  "alternativePaths": [
    { "shortLabel": "OAuth redirect", "description": "GET /auth/callback handles third-party authentication" }
  ],
  "exceptionPaths": [
    { "shortLabel": "Database connection error", "description": "catch block in db.connect() returns 503 Service Unavailable" }
  ],
  "edgeCases": [
    { "shortLabel": "Empty request body", "description": "Guard clause returns 400 when req.body is null/undefined" }
  ],
  "cornerCases": [
    { "shortLabel": "Concurrent session limit", "description": "Auth guard + session count check reject login when max sessions reached" }
  ],
  "negativeTestScenarios": [
    { "shortLabel": "Invalid token format", "description": "JWT validation middleware rejects malformed tokens with 401" }
  ]
}
```
Each `shortLabel`/`description` maps to `/paths` Step 5a `AskUserQuestion` `options[].label`/`options[].description`.
## Resources
[Skill Instructions](resources/skill-instructions.md) — Pattern scanning rules and category mapping logic
## Known Limitations
Validated against `.claude/scripts/shared/` (36 JS files, CLI utilities).
False positives: guard clause detection (`if (!x)`) may match non-boundary conditions; `module.exports` as nominal path marks API surface not user flows; catch blocks in utility code may not represent meaningful exception paths. User validation in `/paths` Step 5b mitigates these.
Not detected: implicit error flows via callbacks, promise chain errors without `.catch()`, configuration-driven behavior not visible in code structure.
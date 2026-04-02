---
name: json-validator
description: Validate JSON files against companion JSON Schema definitions
type: invokable
argument-hint: "[file.json] [--all] [--dir path]"
allowed-tools: Read, Grep, Glob, Bash
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-02"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [json, json-schema, ajv, validation]
copyright: "Rubrical Works (c) 2026"
---
# JSON Validator
Validate JSON files against `$schema` references.
## Arguments
| Argument | Description |
|----------|-------------|
| `[file.json]` | Validate single file |
| `--all` | Scan project for all JSON with `$schema` |
| `--dir path` | Scan specific directory |
No arguments: prompt user.
## Workflow
**Step 1: Discover** — Single file: verify exists. `--all`: Glob `**/*.json`, exclude `node_modules/`, `.git/`, `package-lock.json`. `--dir`: Glob under path.
**Step 2: Filter** — Read each file, check root `$schema` field. Present: queue. Absent: skip. Report `Found {N} JSON, {M} with $schema`. None found: STOP.
**Step 3: Resolve** — Parse `$schema`: relative path resolves from file dir, absolute as-is, URL via WebFetch (warn+skip if unavailable). Missing schema: warn+skip.
**Step 4: Validate** — Read file+schema. Check: `required`, `type`, `enum`, `additionalProperties`, nested `properties`, `pattern`, `minimum`/`maximum`, `minItems`/`maxItems`. Collect violations per file.
**Step 5: Report**
```
{file-path} | Schema: {schema-path} | PASS/FAIL
  {violations if FAIL}
Summary: {passed}/{total} passed.
```

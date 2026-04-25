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
Validate JSON files against their `$schema` references.
## Arguments
| Argument | Description |
|----------|-------------|
| `[file.json]` | Validate a single JSON file |
| `--all` | Scan project and subdirectories for all JSON files with `$schema` references |
| `--dir path` | Scan a specific directory and subdirectories |
If no arguments provided, prompt the user to choose a mode.
## Workflow
### Step 1: Discover Files
- Single file: verify path exists; if not, report error and STOP.
- `--all`: Glob `**/*.json` from project root. Exclude `node_modules/`, `.git/`, `package-lock.json`, generated files.
- `--dir path`: Glob `**/*.json` under given directory.
### Step 2: Check for Schema References
For each file: 1) Read 2) Check root-level `$schema` 3) If present, queue; if absent, skip.
Report: `Found {N} JSON files, {M} with $schema references.`
If none have `$schema`, report and STOP.
### Step 3: Resolve Schemas
For each queued file, parse `$schema`:
1. Relative path (e.g., `"my-schema.json"`): resolve relative to JSON file's directory
2. Absolute path: use as-is
3. URL (e.g., `https://json-schema.org/...`): fetch via WebFetch if available, otherwise warn and skip
4. If schema not found:
   - Ask: "Schema `{$schema value}` not found for `{file}`. Provide schema path, or skip?"
   - If user provides path: re-run with `--schema-override "file=schemaPath"`
   - If "skip": proceed without validating that file
### Step 4: Validate
For each file with resolved schema, read both and check:
- `required` fields present
- `type` constraints satisfied
- `enum` values match
- `additionalProperties` constraints
- Nested `properties` recursively
- `pattern` on strings
- `minimum`/`maximum` on numbers
- `minItems`/`maxItems` on arrays
Collect violations per file.
### Step 5: Report Results
```
JSON Schema Validation Results
------------------------------
{file-path}
  Schema: {schema-path}
  Status: PASS | FAIL
  {violation details if FAIL}

Summary: {passed}/{total} files passed validation.
```
If all pass, report success. If any fail, list violations grouped by file.

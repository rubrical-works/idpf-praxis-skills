---
name: json-validator
description: Validate JSON files against companion JSON Schema definitions
type: invokable
argument-hint: "[file.json] [--all] [--dir path] [--inline]"
allowed-tools: Read, Grep, Glob, Bash
version: "1.0.1"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-05-15"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [json, json-schema, ajv, validation]
copyright: "Rubrical Works (c) 2026"
---
# JSON Validator
Validate JSON files against their `$schema` references.
## Runtime Requirements
Applies the **No-Runtime Fallback Pattern** (`SKILL-DEVELOPMENT-GUIDE.md` → No-Runtime Fallback Pattern) with a *scoped fallback*. Two paths, chosen by preflight:
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node 18+ AND `ajv` installed | Full JSON Schema validation via `ajv` — Draft 7 / 2020-12 features, `$ref` resolution, format validators, all constraint checking. |
| **Scoped fallback (`--inline`)** | None (runs in Claude inline) | Parse-only structural check: valid JSON syntax + top-level `type` matches `$schema`-declared type if trivially derivable. **No constraint checking, no `$ref` resolution, no format validators.** |
The fallback is deliberately narrower: JSON Schema is too large to approximate inline. It gives hosts without `ajv` some validation (malformed JSON, top-level type mismatches) rather than none.
## Arguments
| Argument | Description |
|----------|-------------|
| `[file.json]` | Validate a single JSON file |
| `--all` | Scan project and subdirectories for all JSON files with `$schema` references |
| `--dir path` | Scan a specific directory and subdirectories |
| `--inline` | Force the scoped fallback path (parse-only structural check, no `ajv` required). Use when Node + `ajv` are unavailable, or for a parse sanity check only. |
No arguments → prompt the user to choose a mode.
## Workflow
### Step 0: Preflight (Pattern 4)
1. **`--inline` passed:** skip to Step 1; the script runs the scoped fallback.
2. **Otherwise (primary path):** invoke the script normally. If `ajv` is missing the script exits with a Pattern 4 diagnostic (deliverable → fallback → install path); surface it verbatim and offer to re-invoke with `--inline`.
Diagnostic shape:
- **what the skill would have done:** "Validate JSON files against JSON Schema using `ajv` (Draft 7 / 2020-12, `$ref` resolution, format validators)."
- **fallback:** "Re-invoke with `--inline` for parse-only structural checks. The fallback does NOT perform schema validation."
- **install path:** "Or install Node 18+ and run: `npm install ajv`"
### Step 1: Discover Files
- **Single file:** verify the path exists; if not, report error and STOP.
- **`--all`:** Glob `**/*.json` from project root, excluding `node_modules/`, `.git/`, `package-lock.json` and other generated files.
- **`--dir path`:** Glob `**/*.json` under the directory.
### Step 2: Check for Schema References
For each file: read it; check for a root-level `$schema`; present → add to validation queue; absent → skip.
```
Found {N} JSON files, {M} with $schema references.
```
No files with `$schema` → report and STOP.
### Step 3: Resolve Schemas
For each queued file:
1. Parse the `$schema` value
2. **Relative path** (e.g., `"my-schema.json"`): resolve relative to the JSON file's directory
3. **Absolute path**: use as-is
4. **URL** (e.g., `https://json-schema.org/...`): fetch via WebFetch if available, otherwise warn and skip
5. Schema not found: ask "Schema `{$schema value}` not found for `{file}`. Provide schema path, or skip?" — path given → re-run with `--schema-override "file=schemaPath"`; skip → proceed without validating that file
### Step 4: Validate
For each file with a resolved schema, read both and check: `required` fields present; `type` constraints; `enum` values; `additionalProperties`; nested `properties` recursively; `pattern` on strings; `minimum`/`maximum` on numbers; `minItems`/`maxItems` on arrays. Collect all violations per file.
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
All pass → report success. Any fail → list violations grouped by file.
## Fallback Mode (`--inline`)
Runs the **scoped fallback**: for hosts without Node + `ajv`, or a parse sanity check only.
**Does:** parse each file (catches malformed JSON); if the schema declares a trivially derivable top-level `type` (no `$ref` resolution), assert the file's top-level type matches.
**Does NOT:** resolve `$ref`; run format validators (`date-time`, `uri`, `email`, …); check constraints beyond top-level type (no `required`, `enum`, `pattern`/`minimum`/`maximum`, nested `properties`, `additionalProperties`); traverse schemas recursively.
**Output marker:** the JSON envelope carries `mode: "inline"` and a `note` stating "Structural check only; schema validation not performed."; per-file results also carry `mode: "inline"` so consumers can detect the scope gap programmatically.
A file passing `--inline` is confirmed only as valid JSON with a matching top-level type, **not** against the full schema. For full validation install Node 18+ and `ajv` (`npm install ajv`) and re-run without `--inline`.

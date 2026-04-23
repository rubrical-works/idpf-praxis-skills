---
name: tdd-refactor-coverage-audit
description: Audit newly added source files for paired tests during the TDD refactor phase. JSON-driven language conventions (TypeScript, JavaScript, Svelte, Python, Go, Rust, Ruby, Elixir, Java, C#) with optional project overrides. Advisory only — never blocks the TDD gate.
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-23"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---

# TDD Refactor Coverage Audit

Companion to `tdd-process` and `tdd-refactor-phase`. Mechanically audits whether source files added since a reference commit have paired tests, using a bundled JSON conventions file. Output is **advisory only**.

## When to Use
- During REFACTOR phase of a TDD cycle, after the GREEN gate
- Deterministic check: "did this cycle add source files without tests?"
- Extend test pairing conventions for a new language without writing code

## Self-Contained
```
.claude/skills/tdd-refactor-coverage-audit/
├── SKILL.md
├── LICENSE.txt
├── resources/
│   ├── test-coverage-conventions.json          # language conventions
│   └── test-coverage-conventions-schema.json   # JSON Schema (Draft 2020-12)
├── scripts/
│   └── test-coverage-audit.js                  # pure Node, zero deps
└── tests/
    ├── fixtures/{valid,invalid}-conventions.json
    └── test-coverage-audit.test.js
```
Does **not** depend on `.claude/scripts/shared/`, `.claude/metadata/`, or any framework-hub path. Drop into any project's `.claude/skills/` and it works.

## Invocation
```bash
node .claude/skills/tdd-refactor-coverage-audit/scripts/test-coverage-audit.js \
  --since-commit <sha>
```

| Flag | Description |
|------|-------------|
| `--since-commit <sha>` | Compare against this commit (required unless `--config-only`) |
| `--config-only` | Print resolved config (conventions + overrides) and exit |
| `--project-root <path>` | Override project root (default: `git rev-parse --show-toplevel`) |
| `-h`, `--help` | Show usage |

## Output
JSON to stdout:
```json
{
  "ok": true,
  "newSources": 4,
  "pairedSources": 3,
  "missingTests": [
    {
      "file": "src/lib/foo.ts",
      "language": "typescript",
      "expected": ["src/lib/foo.test.ts", "src/lib/__tests__/foo.ts"]
    }
  ],
  "coverage": 0.75,
  "minTestCoverageRatio": 0
}
```

| Field | Meaning |
|-------|---------|
| `ok` | `true` if audit ran cleanly. `false` only on schema/git errors. |
| `newSources` | Count of newly added source files matched by some language. |
| `pairedSources` | Count with at least one matching test file. |
| `missingTests[]` | Per-file warnings with patterns checked. |
| `coverage` | `pairedSources / newSources` (1.0 when no new sources). |
| `minTestCoverageRatio` | Optional project floor (advisory). |

The audit **never returns non-zero exit because of missing tests**. Exit `2` reserved for schema validation failures and usage errors.

## How It Works
1. Loads `resources/test-coverage-conventions.json` and validates against bundled JSON Schema.
2. Resolves project root (`git rev-parse --show-toplevel`) and optionally reads `framework-config.json` → `testCoverageAudit`. If present, schema-validated and merged over bundled conventions.
3. Runs `git diff --name-status --diff-filter=A <sha>..HEAD` to enumerate newly added files.
4. For each new file:
   - Skips files matching `ignoredSourcePatterns`.
   - Detects language by extension; skips files matching language's `excludePatterns`.
   - Substitutes `{stem}` (filename without extension) and `{dir}` (relative directory) into each `testPatterns` entry.
   - Checks if any expanded pattern matches an existing file.
   - For languages with `inlineTests: true` (Rust), additionally checks source file itself for inline `#[cfg(test)]` block before reporting missing tests.
5. Emits JSON above. Caller (e.g., `tdd-process`) surfaces warnings.

## Pattern Substitution
| Token | Meaning | Example for `src/lib/foo.ts` |
|-------|---------|------------------------------|
| `{stem}` | filename without extension | `foo` |
| `{dir}` | relative directory of source file | `src/lib` |

Example: `{dir}/__tests__/{stem}.ts` → `src/lib/__tests__/foo.ts`.

## Adding a Language
Edit `resources/test-coverage-conventions.json`, add entry under `languages`:
```json
"kotlin": {
  "sourceExtensions": [".kt"],
  "testPatterns": [
    "{dir}/{stem}Test.kt",
    "src/test/kotlin/**/{stem}Test.kt"
  ]
}
```
Required: `sourceExtensions` (each must start with `.`) and `testPatterns` (≥1 pattern). Optional: `excludePatterns`, `inlineTests`.

## Project Override
Optional. Add `testCoverageAudit` block to `framework-config.json`:
```json
{
  "testCoverageAudit": {
    "additionalLanguages": {
      "myDsl": {
        "sourceExtensions": [".mydsl"],
        "testPatterns": ["spec/{stem}.spec.mydsl"]
      }
    },
    "ignoredSourcePatterns": ["**/legacy/**"],
    "minTestCoverageRatio": 0.8
  }
}
```

| Field | Behavior |
|-------|----------|
| `additionalLanguages` | Merged into bundled `languages` (project entries override bundled with same key). |
| `ignoredSourcePatterns` | Concatenated with bundled patterns. |
| `minTestCoverageRatio` | Reported in output; audit does not enforce. |

Override fully optional. Skill works without `framework-config.json`.

## Interpreting Warnings
A `missingTests[]` entry is **not a failure**. Resolutions:
- Add a test at one of the `expected` paths.
- Add file to `ignoredSourcePatterns` if structurally untestable (e.g., `*.config.ts`).
- Add directory to project override if entire area excluded (e.g., legacy code).

## Integration with `tdd-process`
`tdd-process` invokes this skill from refactor phase as a `required[]` checklist item. Orchestrator surfaces `missingTests[]` warnings inline but does not block the gate. If skill not installed, `tdd-process` skips checklist item with one-line notice. **No code coupling**: `tdd-process` only knows this skill by name and invocation path.

## Testing
```bash
node .claude/skills/tdd-refactor-coverage-audit/tests/test-coverage-audit.test.js
```
Covers: arg parsing, glob translation, language detection (with excludes), `{stem}`/`{dir}` substitution, override merging, inline-test detection (Rust), schema validation against valid + invalid fixtures.

## Limitations
- File-pairing only — does not measure line, branch, or statement coverage.
- Audits only **newly added** files since `<sha>`. Modifications out of scope.
- Glob support intentionally minimal (`*`, `**`, literal). No brace expansion or character classes.
- `testFileExists` walks project tree up to depth 8, skipping `node_modules`, `.git`, `dist`, `build`.

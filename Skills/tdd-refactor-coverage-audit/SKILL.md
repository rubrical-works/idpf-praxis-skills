---
name: tdd-refactor-coverage-audit
description: Audit newly added source files for paired tests during the TDD refactor phase. JSON-driven language conventions (TypeScript, JavaScript, Svelte, Python, Go, Rust, Ruby, Elixir, Java, C#) with optional project overrides. Advisory only — never blocks the TDD gate.
type: reference
disable-model-invocation: true
version: "1.0.1"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-05-15"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# TDD Refactor Coverage Audit
Companion to `tdd-process` and `tdd-refactor-phase`. Mechanically audits whether source files added since a reference commit have paired tests, using bundled JSON conventions file. Output is **advisory only** — warnings reported but never block TDD gate.
## Runtime Requirements
Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md`). Two paths, chosen by preflight:
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node 18+ on `PATH` | Invokes `scripts/test-coverage-audit.js` — deterministic, sub-second, exact convention-JSON-driven pairing check. |
| **Fallback** | None (runs in Claude inline) | Claude reads `resources/test-coverage-conventions.json`, runs `git diff --name-status --diff-filter=A <sha>..HEAD` via Bash tool, applies same pairing rules procedurally, emits equivalent advisory warnings. |
Both paths preserve **advisory-output contract**: warnings emit; audit never halts or fails TDD gate. Fallback's output may have slight prose-formatting differences from script, but structural fields (`newSources`, `pairedSources`, `missingTests[]`, `coverage`) and advisory-only semantics identical.
### Preflight
Caller decides which path to invoke:
1. **Check Node:** `node --version` available?
2. **If yes (primary path):** invoke script as documented under "Invocation" below. Done.
3. **If no (fallback path):** Surface Pattern 4 diagnostic — *"This audit pairs newly added source files with their expected test files using language conventions. The Node script is the primary path; without Node, Claude can perform the same pairing inline by reading the convention JSON + running `git diff` via the Bash tool. The result is structurally equivalent and remains advisory. Or install Node 18+ for the deterministic primary path."* Then execute **Fallback Procedure** below.
### Fallback Procedure
When Node unavailable, perform audit inline:
1. **Read convention JSON** from `Skills/tdd-refactor-coverage-audit/resources/test-coverage-conventions.json`. Defines `languages` (language → `sourceExtensions[]`, `testPatterns[]`, optional `excludePatterns`, `inlineTests`), `ignoredSourcePatterns[]`, `minTestCoverageRatio` (default 0).
2. **Read project override (if present)** from `framework-config.json`. If `testCoverageAudit` block exists, merge over bundled: `additionalLanguages` added to `languages`; `ignoredSourcePatterns` unioned; `minTestCoverageRatio` overridden.
3. **Enumerate added source files.** Run `git diff --name-status --diff-filter=A <since-commit>..HEAD` via Bash. Leading `A\t` indicates added files; collect paths.
4. **For each added file:** skip if matches `ignoredSourcePatterns`; detect language by extension against `sourceExtensions` (skip if no match); skip if matches language's `excludePatterns`; for each `testPatterns` entry, substitute `{stem}` (filename without extension) and `{dir}` (relative directory), check if any expanded path exists on disk; for languages with `inlineTests: true` (Rust), additionally read source and check for inline `#[cfg(test)]` block (counts as paired); if no test file found and no inline block, append to `missingTests[]` with file path, language, patterns checked.
5. **Emit equivalent output.** Report `newSources`, `pairedSources`, `missingTests[]`, `coverage` (`pairedSources / newSources`, or `1.0` when zero), `minTestCoverageRatio`. Advisory only — do not halt workflow.
Fallback's output may differ stylistically but structural fields and advisory-only contract preserved.
## When to Use
- During REFACTOR phase of TDD cycle, after GREEN gate
- When you want deterministic check that "did this cycle add source files without tests?"
- When you want to extend test pairing conventions for a new language without writing code
## Self-Contained
Bundles SKILL.md, LICENSE.txt, `resources/test-coverage-conventions.json` + schema (Draft 2020-12), `scripts/test-coverage-audit.js` (pure Node, zero deps), `tests/` fixtures and tests. Does **not** depend on `.claude/scripts/shared/`, `.claude/metadata/`, or any framework-hub path. Drop directory into any project's `.claude/skills/` and it works.
## Invocation
`node .claude/skills/tdd-refactor-coverage-audit/scripts/test-coverage-audit.js --since-commit <sha>`
Flags: `--since-commit <sha>` (required unless `--config-only`); `--config-only` (print resolved config + exit); `--project-root <path>` (default: `git rev-parse --show-toplevel`); `-h`/`--help`.
## Output
JSON to stdout: `{ok, newSources, pairedSources, missingTests: [{file, language, expected[]}], coverage, minTestCoverageRatio}`. Example: `{ok:true, newSources:4, pairedSources:3, missingTests:[{file:"src/lib/foo.ts", language:"typescript", expected:["src/lib/foo.test.ts","src/lib/__tests__/foo.ts"]}], coverage:0.75, minTestCoverageRatio:0}`.
| Field | Meaning |
|-------|---------|
| `ok` | `true` if audit ran cleanly. `false` only on schema/git errors. |
| `newSources` | Count of newly added source files matched by some language. |
| `pairedSources` | Count with at least one matching test file. |
| `missingTests[]` | Per-file warnings with patterns checked. |
| `coverage` | `pairedSources / newSources` (1.0 when no new sources). |
| `minTestCoverageRatio` | Optional project floor (advisory; informational). |
Audit **never returns non-zero exit because of missing tests**. Exit `2` reserved for schema validation failures and usage errors.
## How It Works
1. Loads `resources/test-coverage-conventions.json` and validates against bundled JSON Schema.
2. Resolves project root (`git rev-parse --show-toplevel`); optionally reads + schema-validates + merges `framework-config.json` → `testCoverageAudit`.
3. Runs `git diff --name-status --diff-filter=A <sha>..HEAD` to enumerate newly added files.
4. For each new file: skip `ignoredSourcePatterns`; detect language by extension; skip language's `excludePatterns`; substitute `{stem}`/`{dir}` into each `testPatterns`; check if any expanded pattern matches existing file; for `inlineTests: true` (Rust) also check source for `#[cfg(test)]` block.
5. Emits JSON. Caller (e.g., `tdd-process`) responsible for surfacing warnings.
## Pattern Substitution
`{stem}` = filename without extension; `{dir}` = relative directory of source file. For `src/lib/foo.ts`: `{stem}=foo`, `{dir}=src/lib`. Example: `{dir}/__tests__/{stem}.ts` → `src/lib/__tests__/foo.ts`.
## Adding a Language
Edit `resources/test-coverage-conventions.json` and add entry under `languages`. Example: `"kotlin": {"sourceExtensions": [".kt"], "testPatterns": ["{dir}/{stem}Test.kt", "src/test/kotlin/**/{stem}Test.kt"]}`. Required: `sourceExtensions` (each starts with `.`) and `testPatterns` (≥1). Optional: `excludePatterns`, `inlineTests`. Entire change — one PR, no script edits.
## Project Override
Optional. Add `testCoverageAudit` block to `framework-config.json` at project root with `additionalLanguages` (merged into bundled), `ignoredSourcePatterns` (concatenated), `minTestCoverageRatio` (reported). Example: `{testCoverageAudit:{additionalLanguages:{myDsl:{sourceExtensions:[".mydsl"], testPatterns:["spec/{stem}.spec.mydsl"]}}, ignoredSourcePatterns:["**/legacy/**"], minTestCoverageRatio:0.8}}`.
| Field | Behavior |
|-------|----------|
| `additionalLanguages` | Merged into bundled `languages` (project entries override bundled with same key). |
| `ignoredSourcePatterns` | Concatenated with bundled patterns. |
| `minTestCoverageRatio` | Reported in output for downstream callers; audit itself does not enforce. |
Override fully optional. Skill works without `framework-config.json`.
## Interpreting Warnings
A `missingTests[]` entry is **not a failure**. Prompt to consider whether new source file is intentionally untested (config, types, glue, generated code) or whether test is genuinely missing. Common resolutions:
- Add test at one of `expected` paths.
- Add file to `ignoredSourcePatterns` if structurally untestable (e.g., `*.config.ts`).
- Add directory to project override if entire area excluded (e.g., legacy code).
## Integration with `tdd-process`
`tdd-process` invokes this skill from refactor phase as `required[]` checklist item. Orchestrator surfaces `missingTests[]` warnings inline but does not block gate. If this skill not installed, `tdd-process` skips checklist item with one-line notice.
**No code coupling** between two skills: `tdd-process` only knows this skill by name and invocation path.
## Testing
```bash
node .claude/skills/tdd-refactor-coverage-audit/tests/test-coverage-audit.test.js
```
Covers: arg parsing, glob translation, language detection (with excludes), `{stem}`/`{dir}` substitution, override merging, inline-test detection (Rust), schema validation against valid + invalid fixtures.
## Limitations
- File-pairing only — does not measure line/branch/statement coverage.
- Audits only **newly added** files since `<sha>`. Modifications to existing files out of scope.
- Glob support minimal (`*`, `**`, literal); no brace expansion or character classes.
- `testFileExists` walks project tree up to depth 8, skipping `node_modules`, `.git`, `dist`, `build`.

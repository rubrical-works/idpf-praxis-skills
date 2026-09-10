---
name: tdd-refactor-coverage-audit
description: Audit newly added source files for paired tests during the TDD refactor phase. JSON-driven language conventions (TypeScript, JavaScript, Svelte, Python, Go, Rust, Ruby, Elixir, Java, C#) with optional project overrides. Advisory only — never blocks the TDD gate.
type: reference
disable-model-invocation: true
version: "1.1.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-09-09"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# TDD Refactor Coverage Audit
Companion to `tdd-process` and `tdd-refactor-phase`. Audits whether source files added since a reference commit have paired tests. **Advisory only** — never blocks the TDD gate.
## Runtime Requirements
Applies the **No-Runtime Fallback Pattern** (`SKILL-DEVELOPMENT-GUIDE.md`):
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node 18+ on `PATH` | Invokes `scripts/test-coverage-audit.js` — deterministic, convention-JSON-driven pairing check. |
| **Fallback** | None (Claude inline) | Reads `resources/test-coverage-conventions.json`, runs `git diff --name-status --diff-filter=A <sha>..HEAD` via Bash, applies the same rules, emits equivalent warnings. |
Both preserve the **advisory-output contract**. Structural fields (`newSources`, `pairedSources`, `missingTests[]`, `undetermined[]`, `undeterminedCount`, `coverage`, `diagnostics.unrecognizedExtensions`) and advisory-only semantics are identical; only prose formatting may differ.
### Preflight
1. `node --version` available?
2. **Yes (primary):** invoke per "Invocation". Done.
3. **No (fallback):** surface the Pattern 4 diagnostic — *"This audit pairs newly added source files with their expected test files using language conventions. The Node script is the primary path; without Node, Claude can perform the same pairing inline by reading the convention JSON + running `git diff` via the Bash tool. The result is structurally equivalent and remains advisory. Or install Node 18+ for the deterministic primary path."* Then run the **Fallback Procedure**.
### Fallback Procedure
1. **Read the convention JSON:** `Skills/tdd-refactor-coverage-audit/resources/test-coverage-conventions.json`. Defines `languages` (→ `sourceExtensions[]`, `testPatterns[]`, optional `excludePatterns`, `inlineTests`), `ignoredSourcePatterns[]`, `minTestCoverageRatio` (default 0).
2. **Read the project override:** `framework-config.json` at project root. If a `testCoverageAudit` block exists, merge over the bundled convention — `additionalLanguages` added to `languages`, `ignoredSourcePatterns` unioned, `minTestCoverageRatio` overridden when present.
3. **Enumerate added files:** `git diff --name-status --diff-filter=A <since-commit>..HEAD` via Bash. Leading `A\t` marks added files.
4. **For each added file:**
   - Skip if it matches any `ignoredSourcePatterns` glob.
   - Detect language by extension against `sourceExtensions`. Skip if no match.
   - Skip if it matches the language's `excludePatterns`.
   - Skip if the file is **itself a test**: substitute `{dir}` with its own directory and `{stem}` with `*` in each `testPatterns` entry, then glob-match the file against the results. A match means it is a test, excluded from the source set before being counted. `{stem}` must stay open — a fully expanded candidate can never match, since the stem of `foo.test.js` is `foo.test`, yielding `foo.test.test.js`.
   - Substitute `{stem}` (filename without extension) and `{dir}` (relative directory) into each `testPatterns` entry; check whether any expanded path exists (Bash `test -f` or Read).
   - For `inlineTests: true` (Rust), also read the source and check for an inline `#[cfg(test)]` block; if present, count as paired.
   - If nothing pairs, choose between two findings. Search the project for any file matching the language's test-shape globs — `testPatterns` with `{dir}` replaced by any directory and `{stem}` by any filename. None anywhere → the layout is not expressible by these conventions: append to `undetermined[]` with file, language, and the candidates `checked`. Otherwise the convention is in use and this source simply lacks a test: append to `missingTests[]` with file, language, and the `expected` patterns. Search once per language, not once per file.
5. **Emit output:** `newSources`, `pairedSources`, `missingTests[]`, `undetermined[]`, `undeterminedCount`, `diagnostics.unrecognizedExtensions` (extension → count for files no language entry claimed, `"(none)"` for extensionless, `{}` when none), `coverage` (`pairedSources / (pairedSources + missingTests.length)`, or `1.0` when that denominator is `0` — undetermined excluded), `minTestCoverageRatio`. JSON or prose; advisory only — do not halt the workflow.
## When to Use
- REFACTOR phase of a TDD cycle, after the GREEN gate
- A deterministic check for "did this cycle add source files without tests?"
- Extending pairing conventions for a new language without writing code
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
No dependency on `.claude/scripts/shared/`, `.claude/metadata/`, or any framework-hub path. Drop into any project's `.claude/skills/`.
## Invocation
```bash
node .claude/skills/tdd-refactor-coverage-audit/scripts/test-coverage-audit.js \
  --since-commit <sha>
```
| Flag | Description |
|------|-------------|
| `--since-commit <sha>` | Compare against this commit (required unless `--config-only`) |
| `--config-only` | Print resolved config and exit |
| `--project-root <path>` | Override project root (default: `git rev-parse --show-toplevel`) |
| `-h`, `--help` | Show usage |
## Output
```json
{
  "ok": true,
  "newSources": 5,
  "pairedSources": 3,
  "missingTests": [
    {
      "file": "src/lib/foo.ts",
      "language": "typescript",
      "expected": ["src/lib/foo.test.ts", "src/lib/__tests__/foo.ts"]
    }
  ],
  "undetermined": [
    {
      "file": "src/pkg/loader.py",
      "language": "python",
      "checked": ["src/pkg/test_loader.py", "tests/test_loader.py"]
    }
  ],
  "undeterminedCount": 1,
  "coverage": 0.75,
  "minTestCoverageRatio": 0,
  "diagnostics": {
    "unrecognizedExtensions": { ".vue": 82, "(none)": 3 }
  }
}
```
| Field | Meaning |
|-------|---------|
| `ok` | `true` if the audit ran cleanly; `false` only on schema/git errors. |
| `newSources` | Newly added source files matched by some language. |
| `pairedSources` | Count with at least one matching test file. |
| `missingTests[]` | Per-file warnings with the patterns checked. |
| `undetermined[]` | Per-file `{ file, language, checked }` where the language was detected but no `testPatterns` entry can express the layout. **Not** a missing test. |
| `undeterminedCount` | Length of `undetermined[]`. |
| `coverage` | `pairedSources / (pairedSources + missingTests.length)` — 1.0 when that denominator is 0. Undetermined sources are excluded, so the ratio describes only files the audit understood. |
| `minTestCoverageRatio` | Optional project floor (advisory). |
| `diagnostics` | Container for what the audit could **not** account for. Always present. |
| `diagnostics.unrecognizedExtensions` | Extension → count for changed files whose extension matched no language entry. Extensionless files count under `"(none)"`. Always present; `{}` when all recognized. |
| `diagnostics.unreachableLanguageEntries` | `{ name, shadowedBy }` per language entry no file can reach, every extension being claimed ahead of it. Always present; `[]` when none. See **Which entry claims a file**. |
> **What decides `undetermined` (#295).** Judged on **location**, not test naming. Rule: files shaped like this language's tests exist **and** no source of this language paired anywhere in the project. Both halves matter — a project pairing somewhere understands its own layout, so an unpaired source there is genuinely missing a test. Previously the check asked only whether a test-shaped file existed anywhere; `{dir}` opens to `**`, so nine of ten bundled languages yield a location-blind glob (`**/*.test.js`) and a mirror-layout project reported `coverage: 0.0` while a project with no tests reported `1.0` — each population got the other's verdict. Only `elixir`, carrying no `{dir}`, was unaffected. Known imprecision: a monorepo pairing in one package and not another reports `missingTests` for the unreachable package; sharpening needs per-subtree classification.
> **`coverage` changed meaning (#285).** Formerly `pairedSources / newSources`. A project whose layout the bundled patterns cannot express now reports `1.0` alongside a non-empty `undetermined[]` instead of a depressed figure and impossible expected paths. Callers comparing `coverage` to a floor must also read `undeterminedCount`: a perfect score beside a non-empty `undetermined[]` means the layout was not understood, not that the project is fully tested.
> **`unrecognizedExtensions` is the other half of reading `coverage` honestly (#299).** `undeterminedCount` guards a falsely *low* score; this guards a falsely *high* one. A file whose extension matches no language entry never enters `newSources`, `pairedSources` or the `coverage` denominator, so a Vue project with 80 untested components and 2 tested utilities reports `coverage: 1.0`. **Callers comparing `coverage` to a floor must read both** — a perfect score means "of the files I understood". It is also the language backlog ordered by evidence: `".vue": 82` says what to add next.
> **Everything unrecognized is reported; nothing suppressed (#299 AC7).** A suppression list for known-non-source extensions (`.md`, `.json`, `.lock`, `.png`) was considered and **rejected** — it goes stale and can only hide a row someone wanted. Two skips are **not** reported, both recorded decisions rather than gaps: `ignoredSourcePatterns` matches, and files a language claims but whose `excludePatterns` reject. Reporting `src/types.d.ts` as an unrecognized `.ts` would claim the audit has no TypeScript entry.
Never exits non-zero for missing tests. Exit `2` is reserved for schema validation failures and usage errors.
## How It Works
1. Loads the conventions JSON and validates it against the bundled schema.
2. Resolves project root (`git rev-parse --show-toplevel`); optionally reads `framework-config.json` → `testCoverageAudit`, which is schema-validated and merged over the bundled conventions.
3. Runs `git diff --name-status --diff-filter=A <sha>..HEAD`.
4. Per new file: skips `ignoredSourcePatterns`; detects language by extension and skips `excludePatterns`; skips any file **itself a test** (matched by substituting `{stem}` with `*` and glob-matching — deliberately separate from `expandTestPatterns`, which the pairing path shares); substitutes `{stem}`/`{dir}` into `testPatterns` and checks for an existing file; for `inlineTests: true` (Rust) checks for an inline `#[cfg(test)]` block. When nothing pairs, reports **undetermined** rather than missing if the project contains no file anywhere matching that language's test-shape globs — scanned once per language, not once per file.
5. Emits the JSON above; the caller (e.g. `tdd-process`) surfaces warnings.
## Pattern Substitution
| Token | Meaning | Example for `src/lib/foo.ts` |
|-------|---------|------------------------------|
| `{stem}` | filename without extension | `foo` |
| `{dir}` | relative directory of source file | `src/lib` |
`{dir}/__tests__/{stem}.ts` → `src/lib/__tests__/foo.ts`.
## Adding a Language
Add an entry under `languages` in `resources/test-coverage-conventions.json`:
```json
"kotlin": {
  "sourceExtensions": [".kt"],
  "testPatterns": [
    "{dir}/{stem}Test.kt",
    "src/test/kotlin/**/{stem}Test.kt"
  ]
}
```
Required: `sourceExtensions` (each starting with `.`) and `testPatterns` (at least one). Optional: `excludePatterns`, `inlineTests`. One PR, no script edits.
## Project Override
Optional `testCoverageAudit` block in `framework-config.json`:
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
| `additionalLanguages` | Merged into bundled `languages`. Same key overrides, **replacing wholesale** — every pattern you still want must be restated. |
| `additionalLanguages` — extension collision | A project entry is consulted **before** any bundled entry claiming the same extension (#301). A new key declaring `.js` takes effect without touching bundled `javascript`, which keeps its other extensions. |
| `ignoredSourcePatterns` | Concatenated with bundled patterns. |
| `minTestCoverageRatio` | Reported for downstream callers; not enforced here. |
### Worked example: sources under a dot-directory
The `myDsl` case is easy — a new extension, test root derived from the source's directory. The awkward case is a **dot-directory** source root with a test root that does **not** mirror the source path (`.claude/project-scripts/` → `tests/project-scripts/`):
```json
{
  "testCoverageAudit": {
    "additionalLanguages": {
      "projectScripts": {
        "sourceExtensions": [".js"],
        "testPatterns": ["tests/project-scripts/{stem}.test.js"]
      }
    }
  }
}
```
Two things this shows that `myDsl` does not:
- **The test root is fixed, not derived from `{dir}`.** `.claude/project-scripts/foo.js` is expected at `tests/project-scripts/foo.test.js`. **Any pattern omitting `{dir}` is anchored at the repository root.**
- **`{stem}` and `{dir}` substitute inside override `testPatterns` exactly as in the bundled conventions** — same tokens, same meanings. `{stem}` is the filename without extension (`foo`), `{dir}` the source's relative directory (`.claude/project-scripts`).
It declares `.js`, which bundled `javascript` already claims. Deliberate and it works: project entries are consulted first, so `projectScripts` wins for every `.js` file. Before 1.1.0 it did not — the entry validated, merged and was never reached (#301).
> **You may not need this example.** Since 1.1.0 bundled `javascript` carries `tests/**/{stem}.test.js` (#291), reaching `tests/project-scripts/foo.test.js` on its own. Reach for an override when your test root is somewhere the bundled patterns do not go, or to pin pairing to one root rather than anywhere under `tests/`. The example shows the mechanism, not a requirement.
### Which entry claims a file
Entries are consulted in order; the **first** claiming the file's extension wins, so order is precedence. Override-declared entries come first, then bundled. Two consequences:
- **You do not have to replace a bundled language to extend it.** Before #301, reaching a `.js` layout meant overriding the `javascript` key itself and restating every bundled pattern by hand — the staleness trap the table warns about. A new key declaring `.js` now works instead.
- **An entry nothing can reach is reported, not silently ignored.** When every extension of an entry is claimed ahead of it, it appears in `diagnostics.unreachableLanguageEntries` as `{ name, shadowedBy }`. A property of **position, not origin**: it catches two project entries colliding, and a bundled entry a broad project entry has fully shadowed. An entry keeping even one unclaimed extension is still reachable and is not reported.
> **Upgrading to 1.1.0 can change your `coverage` with nothing in your diff to explain it (#301).** A project carrying an `additionalLanguages` entry whose extension a bundled entry claimed has been running with it **inert**. This release makes it live, so `coverage` can move either direction on the first run after upgrade. Called out rather than shipped silently because the discontinuity is otherwise unattributable: run `--config-only` for the resolved language order and read `diagnostics.unreachableLanguageEntries`. Leaving precedence broken to avoid the jump preserves a state where the documented mechanism does not work at all.
Validated against the **lenient** schema entry point (`#/$defs/override`), which shares the conventions file's property shapes but requires no fields; the conventions file uses the strict root, which still requires `languages`. Separate because `mergeConfig` reads only the three keys above — requiring `languages` on an override would mandate a field the consumer discards.
## Interpreting Warnings
A `missingTests[]` entry is **not a failure** — it prompts a decision on whether the file is intentionally untested (config, types, glue, generated code):
- Add a test at one of the `expected` paths.
- Add it to `ignoredSourcePatterns` if structurally untestable (e.g. `*.config.ts`).
- Add the directory to the project override if an entire area is excluded (e.g. legacy code).
## Integration with `tdd-process`
Invoked from the refactor phase as a `required[]` checklist item; warnings surface inline without blocking the gate. If absent, `tdd-process` skips the item with a one-line notice. **No code coupling** — only name and invocation path.
## Testing
```bash
node .claude/skills/tdd-refactor-coverage-audit/tests/test-coverage-audit.test.js
```
Covers arg parsing, glob translation, language detection with excludes, `{stem}`/`{dir}` substitution, override merging, Rust inline-test detection, and schema validation against valid + invalid fixtures.
## Limitations
- File-pairing only — no line, branch, or statement coverage.
- Only **newly added** files since `<sha>`; modifications are out of scope.
- Minimal glob support (`*`, `**`, literal) — no brace expansion or character classes.
- `testFileExists` walks to depth 8, skipping `node_modules`, `.git`, `dist`, `build`.

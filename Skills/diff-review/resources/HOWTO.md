# Using diff-review Without IDPF Framework

A lightweight, unanchored per-diff code review: a reviewer agent reads one commit range against an issue's acceptance criteria and your project charter, within a declared read budget, and returns a single JSON findings document with exactly one verdict. The skill is two JSON files and this guide; the reviewer is whatever read-only agent you spawn with the prompt below.

## What's Included

| File | Purpose |
|------|---------|
| `review-criteria.json` | The criteria the reviewer evaluates (id, severity, check, evidence), the read budget caps, the per-criterion findings policy, the verdict rule, and the opt-in `anti-pattern-analysis` extension |
| `review-criteria-schema.json` | JSON Schema (draft-07) that `review-criteria.json` validates against. Run any draft-07 validator with this schema over the criteria file after editing it; the criteria file's `$schema` names the draft-07 meta-schema, not this file |
| `output-schema.json` | JSON Schema (draft-07) for the findings document the reviewer returns. Self-contained, so any draft-07 validator can check a review before you act on it |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (for example by placing it at `.claude/skills/diff-review/`).
2. When a branch is ready to merge, spawn a **read-only** agent with the prompt in the Worked Example below, filling in the commit range, the issue's acceptance criteria and the charter path. Give it nothing else: no summary of the change, no description from the implementer, no prior review.
3. Parse the agent's final message as JSON and validate it against `.claude/skills/diff-review/output-schema.json`.
4. Act on `verdict`: `fail` blocks the merge, `warn` merges with the findings attached, `pass` merges. Route each `findings[]` entry by its `criterion` id.

The reviewer reads `review-criteria.json` itself at review time, so changing a criterion or a budget cap never requires changing the prompt.

## Worked Example

The reviewer prompt for issue #142 on a branch `work/142` cut from `main`:

```text
You are a read-only code reviewer. Review ONLY the commit range main..work/142.

Inputs:
- Issue: #142. Acceptance criteria:
  - [ ] POST /sessions returns 201 with a session id for valid credentials
  - [ ] POST /sessions returns 401 for invalid credentials, without a stack trace in the body
  - [ ] Unit tests cover both responses
  Files to modify: src/routes/sessions.js, src/auth/verify.js, tests/routes/sessions.test.js
- Charter: CHARTER.md
- Domain ids: none

Not inputs: you have not been given the implementer's summary, and you must not
ask for it or infer one from commit messages. Judge the diff against the
acceptance criteria and the charter only.

Procedure:
1. Read .claude/skills/diff-review/review-criteria.json from disk.
2. Count first: run git diff --numstat main...work/142 (three dots: merge-base form) and
   git log --oneline main..work/142 (two dots: the commit range).
   Record the file list, line counts and commits in the budget block before reading any hunk.
   A numstat row of - - is a binary file: list it in budget.binaryFiles, count it as 0 lines,
   never invent a count for it.
3. Read hunks within budget.filesReadInFull and budget.diffLinesReadInFull, in budget.readOrder.
   List any file you could not read in full in budget.countedNotRead. Never drop one silently.
4. Evaluate every entry in criteria[]. Emit at least one finding per criterion: one pass
   finding when it holds, one finding per violation otherwise, at the criterion's severity.
5. Derive the verdict from the verdict rule in review-criteria.json.

Output: your final message is ONE JSON document valid against
.claude/skills/diff-review/output-schema.json, and nothing else. No prose before or after it.
```

The findings document the reviewer returned:

```json
{
  "issue": 142,
  "range": "main..work/142",
  "reviewedAt": "2026-10-18T14:05:00Z",
  "budget": {
    "filesListed": 4,
    "filesReadInFull": 4,
    "diffLinesListed": 186,
    "diffLinesRead": 186,
    "countedNotRead": [],
    "binaryFiles": []
  },
  "findings": [
    { "criterion": "hunk-maps-to-ac", "file": "src/routes/sessions.js", "line": 18, "status": "pass", "evidence": "Hunks at lines 18-44 implement the 201 and 401 responses (AC1, AC2)." },
    { "criterion": "hunk-maps-to-ac", "file": "src/auth/verify.js", "line": 9, "status": "pass", "evidence": "Credential check used by both responses (AC1, AC2)." },
    { "criterion": "hunk-maps-to-ac", "file": "src/routes/health.js", "line": 3, "status": "warn", "evidence": "unrelated: adds a version string to the health endpoint; no AC asks for it." },
    { "criterion": "scope-declared", "file": "src/routes/health.js", "line": null, "status": "fail", "evidence": "Changed file is absent from Files to modify (src/routes/sessions.js, src/auth/verify.js, tests/routes/sessions.test.js)." },
    { "criterion": "tests-present", "file": "tests/routes/sessions.test.js", "line": 12, "status": "pass", "evidence": "Tests 'returns 201 with a session id' and 'returns 401 without a stack trace' cover AC1 and AC2." },
    { "criterion": "tests-authentic", "file": "tests/routes/sessions.test.js", "line": 31, "status": "pass", "evidence": "Both tests drive the route through the HTTP layer and assert on the response body, not on verify() internals." },
    { "criterion": "charter-conventions", "file": null, "line": null, "status": "pass", "evidence": "Express and Jest only; both are in the charter Tech Stack." },
    { "criterion": "security-obvious", "file": "src/routes/sessions.js", "line": 40, "status": "pass", "evidence": "401 body is the fixed string 'invalid credentials'; the caught error is logged, not returned." },
    { "criterion": "commit-refs", "file": null, "line": null, "status": "pass", "evidence": "3 commits (a1f09c2, 7be4d10, c93e5a7) each carry Refs #142." },
    { "criterion": "spelling-policy", "file": null, "line": null, "status": "pass", "evidence": "No spelling policy declared in CHARTER.md." },
    { "criterion": "no-debug-leftovers", "file": "src/auth/verify.js", "line": 22, "status": "warn", "evidence": "console.log('verify', username) left in the credential path." },
    { "criterion": "error-path-outcome", "file": "src/routes/sessions.js", "line": 38, "status": "pass", "evidence": "The catch around verify() responds 401 and returns; no path after a failed verify sends 201." },
    { "criterion": "edge-input", "file": "src/auth/verify.js", "line": 9, "status": "pass", "evidence": "Rejects a missing, null or empty username or password before comparing; credentials are compared whole, never by substring." },
    { "criterion": "path-containment", "file": null, "line": null, "status": "pass", "evidence": "No path in the range is built from external input." },
    { "criterion": "state-composition", "file": "src/routes/sessions.js", "line": 30, "status": "pass", "evidence": "Creates a new session entry; does not rewrite the session store or any shared structure." },
    { "criterion": "external-contract", "file": null, "line": null, "status": "pass", "evidence": "No external CLI or API is called in the range." }
  ],
  "verdict": "fail"
}
```

The gate blocks the merge on the `scope-declared` fail, and the two warnings travel with it: the unrelated health-endpoint hunk and the leftover `console.log`. Nothing in the document needs a human to read prose to act on it.

## Correctness Criteria Examples

Five criteria ask whether the changed logic is correct, not only whether it is in scope and tested. Each example below is a short diff showing a defect the criterion catches, and the findings document it produces. To keep them short, each document is trimmed to the finding being illustrated. A real review still emits at least one finding for every criterion, as the Worked Example above does.

### `error-path-outcome`

A copy step whose failure is logged but still reported as a clean success:

```diff
--- a/src/upgrade/copy-rules.js
+++ b/src/upgrade/copy-rules.js
@@ -12,5 +12,9 @@ function copyRules(files, dest) {
   for (const file of files) {
-    fs.copyFileSync(file, path.join(dest, path.basename(file)));
+    try {
+      fs.copyFileSync(file, path.join(dest, path.basename(file)));
+    } catch (err) {
+      log.warn(`could not copy ${file}: ${err.message}`);
+    }
   }
   return { success: true, copied: files.length };
 }
```

```json
{
  "issue": 201,
  "range": "main..work/201",
  "budget": { "filesListed": 1, "filesReadInFull": 1, "diffLinesListed": 6, "diffLinesRead": 6, "countedNotRead": [], "binaryFiles": [] },
  "findings": [
    { "criterion": "error-path-outcome", "file": "src/upgrade/copy-rules.js", "line": 15, "status": "fail", "evidence": "The catch logs the failed copy and continues; the function still returns { success: true, copied: files.length }, so a failed copy is reported as a clean upgrade." }
  ],
  "verdict": "fail"
}
```

### `edge-input`

A tech-stack detector that matches a substring where a whole word is meant:

```diff
--- a/src/charter/detect-stack.js
+++ b/src/charter/detect-stack.js
@@ -4,3 +4,3 @@ const LANGUAGES = ['java', 'go', 'rust', 'python'];
 function detectLanguages(text) {
-  return LANGUAGES.filter((lang) => text.split(/\s+/).includes(lang));
+  return LANGUAGES.filter((lang) => text.toLowerCase().includes(lang));
 }
```

```json
{
  "issue": 202,
  "range": "main..work/202",
  "budget": { "filesListed": 1, "filesReadInFull": 1, "diffLinesListed": 2, "diffLinesRead": 2, "countedNotRead": [], "binaryFiles": [] },
  "findings": [
    { "criterion": "edge-input", "file": "src/charter/detect-stack.js", "line": 5, "status": "warn", "evidence": "includes() is a substring match: 'JavaScript' yields java and 'Django' yields go. The lowercase comparison is wanted, but the match must be whole-word." }
  ],
  "verdict": "warn"
}
```

### `path-containment`

Rule paths read from a downloaded manifest and joined onto the project root unchecked:

```diff
--- a/src/hub/setup-rules.js
+++ b/src/hub/setup-rules.js
@@ -20,2 +20,5 @@ function installRules(manifest, projectRoot) {
-  // rules are copied by the hub installer
+  for (const rule of manifest.rules) {
+    const target = path.join(projectRoot, rule.path);
+    fs.writeFileSync(target, rule.content);
+  }
 }
```

```json
{
  "issue": 203,
  "range": "main..work/203",
  "budget": { "filesListed": 1, "filesReadInFull": 1, "diffLinesListed": 5, "diffLinesRead": 5, "countedNotRead": [], "binaryFiles": [] },
  "findings": [
    { "criterion": "path-containment", "file": "src/hub/setup-rules.js", "line": 21, "status": "fail", "evidence": "rule.path comes from the downloaded manifest and is joined onto projectRoot with no check; a value such as ../../.ssh/config or an absolute path writes outside the project." }
  ],
  "verdict": "fail"
}
```

### `state-composition`

A pull that writes every hub command over the project's copy, including commands the project owns:

```diff
--- a/src/hub/pull-commands.js
+++ b/src/hub/pull-commands.js
@@ -8,6 +8,4 @@ function pullCommands(hubDir, projectDir) {
   for (const name of fs.readdirSync(hubDir)) {
-    if (isManaged(path.join(projectDir, name))) {
-      fs.copyFileSync(path.join(hubDir, name), path.join(projectDir, name));
-    }
+    fs.copyFileSync(path.join(hubDir, name), path.join(projectDir, name));
   }
 }
```

```json
{
  "issue": 204,
  "range": "main..work/204",
  "budget": { "filesListed": 1, "filesReadInFull": 1, "diffLinesListed": 4, "diffLinesRead": 4, "countedNotRead": [], "binaryFiles": [] },
  "findings": [
    { "criterion": "state-composition", "file": "src/hub/pull-commands.js", "line": 9, "status": "warn", "evidence": "The isManaged() guard is removed, so the pull replaces project-owned command files whole; the project's own edits to an extensible command are reverted on every pull." }
  ],
  "verdict": "warn"
}
```

### `external-contract`

A bare `npm` spawned without a shell, which Windows does not resolve:

```diff
--- a/src/project/install.js
+++ b/src/project/install.js
@@ -3,4 +3,4 @@ const { spawnSync } = require('child_process');
 function installDependencies(cwd) {
-  return spawnSync('npm.cmd', ['ci'], { cwd, shell: false });
+  return spawnSync('npm', ['ci'], { cwd, shell: false });
 }
```

```json
{
  "issue": 205,
  "range": "main..work/205",
  "budget": { "filesListed": 1, "filesReadInFull": 1, "diffLinesListed": 2, "diffLinesRead": 2, "countedNotRead": [], "binaryFiles": [] },
  "findings": [
    { "criterion": "external-contract", "file": "src/project/install.js", "line": 4, "status": "warn", "evidence": "spawnSync('npm') without a shell assumes the executable is named npm; on Windows it is npm.cmd, so the call fails with ENOENT. No test or recorded output in the range shows the name was checked per platform." }
  ],
  "verdict": "warn"
}
```

## Customization

The JSON is self-contained. You can:

- **Add a criterion** — append an entry to `criteria[]` with a unique `id`, a `severity` of `fail` or `warn`, and a `check` and `evidence` line. Validate the result against `review-criteria-schema.json`.
- **Change a severity** — edit the criterion's `severity`. The verdict rule reads severities, so no other change is needed.
- **Resize the read budget** — edit `budget.filesReadInFull` and `budget.diffLinesReadInFull`, or pass overrides in the prompt.
- **Add an extension** — add an entry under `extensions` naming a `domainId`, the checklist `path` and a `criterionPrefix`; it stays opt-in unless you set `loadedByDefault` to `true`.
- **Validate a review** — check the returned document against `output-schema.json` before acting on it; a document that fails validation is a reviewer failure, not a verdict.

## How IDPF Projects Use This

In IDPF projects the Merge-Back Review Gate of concurrent `/work --nonstop` spawns the reviewer Agent with a prompt built from this template, reads `.claude/skills/diff-review/review-criteria.json` at review time, validates the returned document against `.claude/skills/diff-review/output-schema.json`, and acts on `verdict` before a member's worktree branch is merged back. The approach above replicates that for any Claude Code project.

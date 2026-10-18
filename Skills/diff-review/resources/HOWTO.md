# Using diff-review Without IDPF Framework

A lightweight, unanchored per-diff code review: a reviewer agent reads one commit range against an issue's acceptance criteria and your project charter, within a declared read budget, and returns a single JSON findings document with exactly one verdict. The skill is two JSON files and this guide; the reviewer is whatever read-only agent you spawn with the prompt below.

## What's Included

| File | Purpose |
|------|---------|
| `review-criteria.json` | The criteria the reviewer evaluates (id, severity, check, evidence), the read budget caps, the per-criterion findings policy, the verdict rule, and the opt-in `anti-pattern-analysis` extension |
| `review-criteria-schema.json` | JSON Schema (draft-07) for `review-criteria.json` |
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
2. Count first: run git diff --numstat main..work/142 and git log --oneline main..work/142.
   Record the file list, line counts and commits in the budget block before reading any hunk.
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
    "countedNotRead": []
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
    { "criterion": "no-debug-leftovers", "file": "src/auth/verify.js", "line": 22, "status": "warn", "evidence": "console.log('verify', username) left in the credential path." }
  ],
  "verdict": "fail"
}
```

The gate blocks the merge on the `scope-declared` fail, and the two warnings travel with it: the unrelated health-endpoint hunk and the leftover `console.log`. Nothing in the document needs a human to read prose to act on it.

## Customization

The JSON is self-contained. You can:

- **Add a criterion** — append an entry to `criteria[]` with a unique `id`, a `severity` of `fail` or `warn`, and a `check` and `evidence` line. Validate the result against `review-criteria-schema.json`.
- **Change a severity** — edit the criterion's `severity`. The verdict rule reads severities, so no other change is needed.
- **Resize the read budget** — edit `budget.filesReadInFull` and `budget.diffLinesReadInFull`, or pass overrides in the prompt.
- **Add an extension** — add an entry under `extensions` naming a `domainId`, the checklist `path` and a `criterionPrefix`; it stays opt-in unless you set `loadedByDefault` to `true`.
- **Validate a review** — check the returned document against `output-schema.json` before acting on it; a document that fails validation is a reviewer failure, not a verdict.

## How IDPF Projects Use This

In IDPF projects the Merge-Back Review Gate of concurrent `/work --nonstop` spawns the reviewer Agent with a prompt built from this template, reads `.claude/skills/diff-review/review-criteria.json` at review time, validates the returned document against `.claude/skills/diff-review/output-schema.json`, and acts on `verdict` before a member's worktree branch is merged back. The approach above replicates that for any Claude Code project.

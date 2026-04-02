---
name: command-spec-audit
description: Evaluate command specifications for quality, completeness, and extension point coverage
type: reference
defaultSkill: true
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-02"
license: Complete terms in LICENSE.txt
category: code-quality
copyright: "Rubrical Works (c) 2026"
---
# Skill: command-spec-audit
Evaluate command spec files for formatting weaknesses impacting LLM processing reliability. Shared rubric for `/audit-commands`, `/audit-extensions`, and `/extensions` (creation-time guardrail).
## Evaluation Rubric
Command specs are structured natural-language programs. Formatting is a parsing contract: headers=scope boundaries, code blocks=executable literals, bold=priority signals, tables=decision matrices. Weaknesses degrade execution reliability, especially after compaction.
### Category 1: Structural Integrity
| Criterion | Sev | Detection | Fix |
|-----------|-----|-----------|-----|
| Step granularity | H | Steps >30 lines, no sub-headers | `####` sub-headers or `**Bold labels:**` for sub-steps |
| Header hierarchy | M | `####` without parent `###`, or `##` jumps | Proper nesting: `##`>`###`>`####` |
| Separator consistency | L | Inconsistent `---` placement | `---` between major `##` sections only |
| Reserved/empty steps | L | Steps with only "Reserved" | Remove or add "Reserved for future use" |
| Section ordering | M | Steps not in execution order | Reorder to match flow |
### Category 2: Decision Formatting
| Criterion | Sev | Detection | Fix |
|-----------|-----|-----------|-----|
| Branch consistency | M | Mixed if/else styles | Tables for multi-option, bold callouts for binary |
| Critical branches prominent | M | Control flow in paragraph text | Extract to table or bold callout |
| Decision matrices as tables | M | Multi-option routing in prose/nested bullets | Convert to table: Condition, Action, Notes |
| Condition specificity | L | Vague "if needed", "when appropriate" | Measurable: "if file count > 10", "if label is X" |
### Category 3: Execution Reliability
| Criterion | Sev | Detection | Fix |
|-----------|-----|-----------|-----|
| STOP boundary clarity | H | `STOP` in paragraph without visual separation | `### Step N: STOP Boundary` header or `**STOP.**` on own line after `---` |
| Compaction resilience | M | Recovery instructions in mid-section prose | Inline recovery note at step end; dedicated section only for >300 line commands |
| Code block fencing | H | Commands in inline backticks | Triple-backtick fenced blocks for all executables |
| Workflow overloading | H/L | Single step serving multiple workflows with nested conditionals | Preamble scripts for complex routing; inline branching for simple cases |
| Error table present | M | No error handling section | Add `## Error Handling` table: Situation, Response |
| Commit keyword discipline | M | Missing `Refs` vs `Fixes` guidance | Add commit keyword table |
| Dynamic progress tracking | M | Repeating loop with no todo creation | Create one todo per item after list resolves |
### Category 4: Extension Points
| Criterion | Sev | Detection | Fix |
|-----------|-----|-----------|-----|
| Empty high-value extensions | L | Empty `pre-commit`, `post-implementation`, `pre-create` | Document as "available hook"; Medium only if high-traffic |
| Extension formatting | M | Content doesn't match parent command style | Match parent: same headers, tables, code blocks |
| Extension conflicts | H | Content duplicates/contradicts built-in step | Remove duplication; comment if intentional override |
| Extension size | M | >50 lines between markers | Refactor to script |
| Cross-extension consistency | L | Same pattern differs across commands | Standardize: same script, formatting, error handling |
| Marker integrity | H | Mismatched/missing START/END markers | Fix to `<!-- USER-EXTENSION-START: {point} -->` / `END` |
## Severity Guide
| Level | Meaning | Action |
|-------|---------|--------|
| High | Degrades LLM reliability or causes incorrect behavior | Fix before deployment |
| Medium | Reduces clarity, may cause issues after compaction | Fix next revision |
| Low | Style/readability | Fix opportunistically |
## Output Format
```markdown
### Findings: {command-name}
| # | Criterion | Severity | Location | Finding | Recommendation |
|---|-----------|----------|----------|---------|----------------|
| 1 | Step granularity | High | Step 4 (lines 80-140) | 60 lines with no sub-headers | Split into 3 sub-steps |
**Summary:** 2 High, 1 Medium, 0 Low
```
## Quick Review Checklist
Structural: No steps >30 lines without sub-headers. Proper header nesting. Consistent separators. No dead steps.
Decisions: Consistent if/else format. Prominent control flow. Tables for multi-option routing. Specific conditions.
Execution: Distinct STOP boundaries. Scannable recovery instructions. Fenced code blocks. Clear workflow routing. Error table present.
Extensions: Paired START/END markers. Matching parent formatting. No duplication. Large extensions refactored. Consistent patterns.
### Category 5: Destructive Pattern Detection
Scan USER-EXTENSION blocks for patterns causing data loss, safety bypass, or shared state damage.
| Pattern | Category | Sev | Context |
|---------|----------|-----|---------|
| `rm -rf /`, `rm -rf ~`, `rm -rf $HOME` | File deletion | Crit | Always dangerous |
| `rm -rf` with variable paths | File deletion | Warn | Could expand to unintended targets |
| `rm -rf .tmp-*`, `rm .tmp-*.md` | File deletion | Safe | Expected temp cleanup |
| `git push --force`, `git push -f` | Git destructive | Crit | Overwrites remote history |
| `git reset --hard` | Git destructive | Crit | Discards uncommitted work |
| `git checkout -- .`, `git restore .` | Git destructive | Warn | Discards unstaged changes |
| `git clean -fd` | Git destructive | Warn | Removes untracked files |
| `--no-verify`, `--no-gpg-sign` | Hook bypass | Crit | Skips safety checks |
| `DROP TABLE`, `DROP DATABASE` | DB destructive | Crit | Irreversible data loss |
| `DELETE FROM` without `WHERE` | DB destructive | Crit | Deletes all rows |
| `TRUNCATE` | DB destructive | Warn | Review intent |
| `kill -9`, `taskkill /F` | Process kill | Warn | May corrupt operations |
| `pkill`, `killall` | Process kill | Warn | Broad targeting |
| `chmod 777` | Permission | Warn | Too broad |
| `curl \| sh`, `wget \| bash` | Remote exec | Crit | Unverified remote code |
Context rules: Temp cleanup (`rm .tmp-*.md`) is expected workflow. Scoped deletion (`rm -rf out/`) is intentional--flag only variable/unbounded paths. `--no-verify` needs justification comment. DB ops in migration teardown may be intentional. Force push on named release branches is warning not critical.
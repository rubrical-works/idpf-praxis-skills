---
name: command-spec-audit
description: Evaluate command specifications for quality, completeness, and extension point coverage
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: code-quality
copyright: "Rubrical Works (c) 2026"
---
# Skill: command-spec-audit
**Purpose:** Evaluate command specification files for formatting weaknesses that impact LLM processing reliability. Provides a shared evaluation rubric consumed by `/audit-commands`, `/audit-extensions`, and `/extensions` (creation-time guardrail).
**Audience:** Framework maintainers auditing command specs and project developers authoring or reviewing extension point content.
## When to Use
- When `/audit-commands` audits command spec structure (framework-only)
- When `/audit-extensions` audits extension point content (user-project)
- When `/extensions edit` generates extension content from NL input (creation-time guardrail)
- When manually reviewing or authoring a command specification
- When evaluating whether a command spec is ready for deployment
## Evaluation Rubric
Command specs are structured natural-language programs. Formatting serves as a parsing contract: headers define scope boundaries, code blocks mark executable literals, bold marks priority signals, tables encode decision matrices.
### Category 1: Structural Integrity
| Criterion | Severity | Detection Heuristic | Fix Recommendation |
|-----------|----------|--------------------|--------------------|
| Step granularity | High | Steps with >30 lines and no sub-headers (`####`) | `####` sub-headers for major sub-steps. `**Bold inline labels:**` for lightweight sub-steps. |
| Header hierarchy | Medium | `####` appearing without parent `###`, or `##` jumps | Ensure proper nesting: `##` > `###` > `####` |
| Separator consistency | Low | Inconsistent `---` placement between sections | Standardize: `---` between major `##` sections only |
| Reserved/empty steps | Low | Steps with only "Reserved" or no content below header | Remove dead steps or add "Reserved for future use" note |
| Section ordering | Medium | Workflow steps not in logical execution order | Reorder to match execution flow |
### Category 2: Decision Formatting
| Criterion | Severity | Detection Heuristic | Fix Recommendation |
|-----------|----------|--------------------|--------------------|
| Branch consistency | Medium | Mix of if/else styles within same command | Standardize: tables for multi-option routing, bold callouts for binary branches |
| Critical branches prominent | Medium | Control flow buried in paragraph text | Extract to table or bold callout: `**If X:** action. **If Y:** action.` |
| Decision matrices as tables | Medium | Multi-option routing in prose or nested bullets | Convert to table with columns: Condition, Action, Notes |
| Condition specificity | Low | Vague conditions like "if needed" or "when appropriate" | Replace with measurable conditions |
### Category 3: Execution Reliability
| Criterion | Severity | Detection Heuristic | Fix Recommendation |
|-----------|----------|--------------------|--------------------|
| STOP boundary clarity | High | `STOP` keyword in paragraph without visual separation | `### Step N: STOP Boundary` header (preferred), or `**STOP.**` on own line preceded by `---` |
| Compaction resilience | Medium | Recovery instructions buried in mid-section prose | Add inline recovery note at end of long steps |
| Code block fencing | High | Shell commands in inline backticks instead of fenced blocks | Wrap all executable commands in triple-backtick fenced blocks |
| Workflow overloading | High (>2 workflows with nested conditionals) | Single step serving multiple workflows | High when >2 workflows. Preamble scripts preferred for complex routing; inline branching acceptable for simple cases. |
| Error table present | Medium | No error handling section | Add `## Error Handling` table: Situation, Response columns |
| Commit keyword discipline | Medium | Missing guidance on `Refs` vs `Fixes` | Add commit keyword table matching project workflow conventions |
| Dynamic progress tracking | Medium | Repeating per-item loop with no todo creation | After item list is known, create one todo per item |
### Category 4: Extension Points
| Criterion | Severity | Detection Heuristic | Fix Recommendation |
|-----------|----------|--------------------|--------------------|
| Empty high-value extensions | Low | `pre-commit`, `post-implementation`, `pre-create` blocks empty | Document as "available hook". Only Medium if known high-traffic hook. |
| Extension formatting | Medium | Content between START/END markers doesn't follow parent style | Match parent command's formatting |
| Extension conflicts | High | Extension content duplicates or contradicts a built-in step | Remove duplication; if intentional override, add comment |
| Extension size | Medium | >50 lines between START/END markers | Refactor large extensions into a script |
| Cross-extension consistency | Low | Same pattern implemented differently across commands | Standardize pattern |
| Marker integrity | High | Mismatched or missing START/END markers | Fix markers to match `<!-- USER-EXTENSION-START: {point} -->` / `<!-- USER-EXTENSION-END: {point} -->` |
## Severity Guide
| Level | Meaning | Action |
|-------|---------|--------|
| **High** | Degrades LLM execution reliability or causes incorrect behavior | Fix before deployment or next use |
| **Medium** | Reduces clarity or maintainability, may cause issues after compaction | Fix in next revision cycle |
| **Low** | Style consistency, minor readability improvement | Fix opportunistically |
## Output Format
```markdown
### Findings: {command-name}
| # | Criterion | Severity | Location | Finding | Recommendation |
|---|-----------|----------|----------|---------|----------------|
| 1 | Step granularity | High | Step 4 (lines 80-140) | 60 lines with no sub-headers | Split into 3 sub-steps |
| 2 | STOP boundary | High | Line 95 | STOP in paragraph text | Separate with `---` and bold |
**Summary:** 2 High, 1 Medium, 0 Low
```
## Quick Review Checklist
### Structural Integrity
- [ ] No steps exceed 30 lines without sub-headers
- [ ] Header hierarchy is properly nested (## > ### > ####)
- [ ] Separators (`---`) are consistently placed
- [ ] No dead/reserved steps consuming header slots
### Decision Formatting
- [ ] All if/else patterns use consistent format
- [ ] Critical control flow branches are visually prominent
- [ ] Multi-option routing uses tables, not prose
- [ ] Conditions are specific and measurable
### Execution Reliability
- [ ] STOP boundaries are visually distinct
- [ ] Recovery instructions are in scannable, prominent locations
- [ ] All executable commands are in fenced code blocks
- [ ] Steps don't serve multiple workflows without clear routing
- [ ] Error handling table is present
### Extension Points
- [ ] All START/END markers are properly paired
- [ ] Extension content matches parent command formatting
- [ ] No extensions duplicate built-in behavior
- [ ] Large extensions (>50 lines) are refactored to scripts
- [ ] Common patterns are consistent across commands
## Related
- `/audit-commands` — framework-only structural audit using this rubric
- `/audit-extensions` — user-project extension content audit using this rubric
- `/extensions edit` — creation-time guardrail using Category 4 criteria
- `anti-pattern-analysis` skill — code-level pattern analysis (complementary)

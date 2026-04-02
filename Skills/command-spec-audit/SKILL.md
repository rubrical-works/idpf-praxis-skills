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
# command-spec-audit
Evaluate command spec files for formatting weaknesses impacting LLM processing reliability. Shared rubric for `/audit-commands`, `/audit-extensions`, `/extensions`.
## When to Use
- `/audit-commands` audits command spec structure (framework-only)
- `/audit-extensions` audits extension point content (user-project)
- `/extensions edit` generates extension content (creation-time guardrail)
- Manually reviewing or authoring a command spec
## Evaluation Rubric
Headers define scope boundaries, code blocks mark executable literals, bold marks priority signals, tables encode decision matrices.
### Cat 1: Structural Integrity
| Criterion | Sev | Detection | Fix |
|-----------|-----|-----------|-----|
| Step granularity | High | Steps >30 lines, no `####` | Add `####` for major sub-steps, `**Bold:**` for minor |
| Header hierarchy | Med | `####` without parent `###`, `##` jumps | Ensure `##`>`###`>`####` nesting |
| Separator consistency | Low | Inconsistent `---` placement | `---` between major `##` sections only |
| Reserved/empty steps | Low | Only "Reserved" or no content | Remove or add "Reserved for future use" |
| Section ordering | Med | Steps not in execution order | Reorder to match flow |
### Cat 2: Decision Formatting
| Criterion | Sev | Detection | Fix |
|-----------|-----|-----------|-----|
| Branch consistency | Med | Mixed if/else styles in same command | Tables for multi-option, bold for binary |
| Critical branches | Med | Control flow buried in prose | Extract to table or `**If X:** action` |
| Decision matrices | Med | Multi-option in prose/bullets | Convert to table: Condition, Action, Notes |
| Condition specificity | Low | Vague "if needed" | Measurable: "if file count > 10" |
### Cat 3: Execution Reliability
| Criterion | Sev | Detection | Fix |
|-----------|-----|-----------|-----|
| STOP clarity | High | `STOP` in paragraph text | `### Step N: STOP Boundary` header or `**STOP.**` on own line |
| Compaction resilience | Med | Recovery buried mid-section | Inline recovery note at step end. Dedicated section only >300 lines. |
| Code block fencing | High | Commands in inline backticks | Wrap in fenced code blocks |
| Workflow overloading | High/Low | Step serves multiple workflows | High >2 nested conditionals. Preamble scripts for complex routing. |
| Error table | Med | No error handling section | Add `## Error Handling` table |
| Commit keywords | Med | Missing `Refs` vs `Fixes` guidance | Add commit keyword table |
| Progress tracking | Med | Loop with no todo creation | Create one todo per item after list resolves |
### Cat 4: Extension Points
| Criterion | Sev | Detection | Fix |
|-----------|-----|-----------|-----|
| Empty extensions | Low | `pre-commit` etc empty | Normal for simple commands. Med only for high-traffic hooks. |
| Extension formatting | Med | Doesn't match parent style | Match parent header levels, table style, code blocks |
| Extension conflicts | High | Duplicates/contradicts built-in | Remove duplication; comment if intentional |
| Extension size | Med | >50 lines in markers | Refactor to script |
| Cross-extension consistency | Low | Same pattern differs across commands | Standardize script, formatting, error handling |
| Marker integrity | High | Mismatched START/END markers | Fix to `<!-- USER-EXTENSION-START: {point} -->` / `END` |
## Severity Guide
| Level | Meaning | Action |
|-------|---------|--------|
| **High** | Degrades LLM reliability or causes incorrect behavior | Fix before deployment |
| **Medium** | Reduces clarity, may cause issues after compaction | Fix in next revision |
| **Low** | Style consistency, minor readability | Fix opportunistically |
## Output Format
```markdown
### Findings: {command-name}

| # | Criterion | Severity | Location | Finding | Recommendation |
|---|-----------|----------|----------|---------|----------------|
| 1 | Step granularity | High | Step 4 (lines 80-140) | 60 lines with no sub-headers | Split into 3 sub-steps |
| 2 | STOP boundary | High | Line 95 | STOP in paragraph text | Separate with `---` and bold |

**Summary:** 2 High, 1 Medium, 0 Low
```
## Checklist
- [ ] No steps >30 lines without sub-headers
- [ ] Header hierarchy properly nested
- [ ] Separators consistently placed
- [ ] No dead/reserved steps
- [ ] If/else patterns consistent
- [ ] Critical branches visually prominent
- [ ] Multi-option routing uses tables
- [ ] Conditions specific and measurable
- [ ] STOP boundaries visually distinct
- [ ] Recovery instructions scannable
- [ ] All commands in fenced code blocks
- [ ] No multi-workflow steps without routing
- [ ] Error handling table present
- [ ] START/END markers properly paired
- [ ] Extension content matches parent formatting
- [ ] No extensions duplicate built-in behavior
- [ ] Large extensions (>50 lines) refactored to scripts
## Related
- `/audit-commands` -- framework-only structural audit
- `/audit-extensions` -- user-project extension audit
- `/extensions edit` -- creation-time guardrail (Cat 4)
- `anti-pattern-analysis` -- code-level pattern analysis

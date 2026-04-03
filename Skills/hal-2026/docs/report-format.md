# Subagent Report Schema

Each subagent must return a report in exactly this structure.
The primary agent will parse these reports for synthesis.

---

```markdown
## Approach: [Approach Name]

### Core Idea
[1–3 sentences. The key algorithmic insight. Why does this work?]

### Walkthrough
**Example input:** [concrete small input]

[Step-by-step trace — show intermediate state at each meaningful step.
Be specific: show what data structure looks like, what values change, etc.]

**Result:** [expected output and confirmation it's correct]

### Complexity
| Dimension | Complexity | Justification |
|---|---|---|
| Time | O(...) | [1 sentence — not just the label, explain why] |
| Space | O(...) | [1 sentence] |
| [Preprocessing, if any] | O(...) | [1 sentence] |

### Edge Cases
1. **[Edge case name]** — [what happens, how the approach handles it]
2. **[Edge case name]** — [what happens, how the approach handles it]
3. **[Edge case name]** — [what happens, how the approach handles it]
[Add more if genuinely distinct]

### Implementation Considerations
- [Non-obvious choice 1 — e.g., "Off-by-one in boundary conditions when..."]
- [Non-obvious choice 2]
- [Non-obvious choice 3]
[Minimum 3. These should be things a developer would actually trip over.]

### Strengths
- [Strength 1]
- [Strength 2]

### Weaknesses
- [Weakness 1]
- [Weakness 2]

### Fit Score (self-assessed)
[One of: Excellent / Good / Marginal / Poor]
Reason: [1 sentence — how well does this fit the problem's specific constraints?]
```

---

## Notes for the primary agent

- The **Fit Score** is the subagent's self-assessment. Treat it as a signal, not ground truth.
  A subagent assigned to explore an approach will naturally find reasons it works.
  Weight your own synthesis over the self-assessed score.
- If a subagent returns a malformed or incomplete report, note the gap in your synthesis
  output rather than silently patching it. Missing sections are meaningful data.

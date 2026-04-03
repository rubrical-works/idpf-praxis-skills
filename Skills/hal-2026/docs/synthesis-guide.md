# Synthesis Guide

This guide describes how the primary agent evaluates and combines the N subagent
reports into a final recommendation.

---

## Phase 1: Validate Each Report

Before scoring, check each report for correctness. Do this independently — don't just
accept the subagent's reasoning.

**Complexity check**
- Verify the time/space claims independently. Is O(n log n) actually right, or did the
  subagent undercount a nested loop? Are amortized costs labeled correctly?
- Flag any claims that seem off. Write a one-line note: "Path 2 claims O(n) but the
  inner loop makes this O(n²) in the worst case."

**Walkthrough check**
- Trace the example yourself mentally. Does the algorithm produce the stated result?
- If the walkthrough is vague or skips steps, note it.

**Edge case check**
- Are the listed edge cases genuine? Do the explanations hold up?
- Is there a critical edge case the subagent missed? Add it to your analysis.

---

## Phase 2: Score Each Approach

Score on dimensions most relevant to the problem. Always include correctness and
complexity. Add domain-specific dimensions as appropriate.

### Always-relevant dimensions

| Dimension | What to assess |
|---|---|
| **Correctness** | Does the algorithm actually solve the problem? Any subtle bugs? |
| **Time complexity** | Is it optimal or near-optimal for the constraints? |
| **Space complexity** | Is memory usage acceptable? Any hidden allocations? |
| **Edge case robustness** | How gracefully does it handle boundary inputs? |
| **Implementation difficulty** | How easy is this to get right in real code? |

### Conditionally relevant dimensions (use when applicable)

| Dimension | Use when |
|---|---|
| **Streaming/online capability** | Problem involves continuous or unbounded input |
| **Parallelizability** | User mentions distributed or concurrent context |
| **Mutability** | Input may change after initial processing |
| **Constant factors** | Two approaches share asymptotic complexity but differ in practice |
| **Code readability** | User's codebase or team context suggests this matters |

### Scoring scale

Use: **Strong** / **Adequate** / **Weak** / **Disqualifying**

A single **Disqualifying** score on any dimension eliminates an approach from
being the primary recommendation (though it may still contribute to a hybrid).

---

## Phase 3: Check for Hybridization

Before picking a winner, ask:

1. **Does Path A have the right algorithm but Path B handles edge cases better?**
   → Recommend Path A with Path B's edge case strategy incorporated.

2. **Does Path A excel at the common case and Path B at the degenerate case?**
   → Recommend Path A with a fallback to Path B's strategy under detected conditions.

3. **Do two paths decompose the problem differently in complementary ways?**
   → Describe a hybrid decomposition.

State hybrids explicitly and explain what you gain. Don't suggest a hybrid just to
seem thorough — only if the combination is genuinely better than either alone.

---

## Phase 4: Write the Final Output

Follow the output format in SKILL.md exactly. Key principles:

- **Be direct.** Name a winner. Hedging ("it depends") is only acceptable if you
  provide a concrete decision tree (e.g., "use X if n < 10^5, use Y otherwise").
- **Show your work.** The Analysis section must justify the recommendation, not just
  restate it.
- **Highlight errors found.** If a subagent made a mistake, say so. This is valuable
  signal for the user that the synthesis step is doing real work.
- **The implementation sketch is mandatory.** It doesn't need to be executable, but it
  must unambiguously communicate the algorithm — pseudocode, commented outline, or
  annotated steps.

---

## Common Synthesis Mistakes to Avoid

- **Recency bias** — Don't favor the last path just because you read it last. Score all paths before concluding.
- **Advocacy drift** — Subagents are briefed to explore one path. Their enthusiasm for their own approach isn't evidence of its quality.
- **False hybrids** — "Use both" is not a synthesis. A real hybrid has a specific integration point.
- **Ignoring constraints** — Re-read the original problem constraints before writing the recommendation. A beautiful O(n log n) solution is wrong if the problem requires O(n).

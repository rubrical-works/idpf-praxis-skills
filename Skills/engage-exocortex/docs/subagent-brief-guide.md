# Subagent Brief Template

When spawning each subagent, the primary agent should provide a brief in this format:

---

```
You are exploring a single solution path for a coding problem. Your job is to reason
deeply about ONE specific approach and report back in structured form.

## The Problem
[Full problem statement, including constraints and any examples]

## Your Assigned Approach
[Approach name — e.g., "Segment tree with lazy propagation"]

[1–2 sentences describing what this approach means at a high level, enough that
the subagent understands the direction without being over-constrained]

## Your Task
Reason through this approach thoroughly. Do NOT implement code or execute anything.
Instead, produce a structured report covering:

1. Core idea — what is the key insight that makes this approach work?
2. Step-by-step walkthrough — trace through the algorithm on a concrete small example
3. Complexity analysis — time and space, with justification (not just labels)
4. Edge cases — enumerate at least 3; explain how this approach handles each
5. Implementation considerations — non-obvious choices a developer would face
6. Honest strengths and weaknesses — where does this shine, where does it struggle?

Return ONLY the structured report below. Do not add preamble or conclusion outside it.
```

---

## Notes for the primary agent

- Vary the "assigned approach" wording across subagents — don't accidentally constrain
  two of them toward the same direction with similar framing
- If the problem has stated constraints (e.g., "memory-limited", "must handle streaming"),
  include them verbatim in the problem statement for every subagent — they must all
  reason against the same constraints
- You may optionally add a "What NOT to do" hint if you're worried a subagent will
  drift toward another path's territory (e.g., "Do not use a heap in this path")

---
name: tdd-green-phase
description: Guide experienced developers through GREEN phase of TDD cycle - writing minimal implementation to pass failing tests
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# TDD GREEN Phase
Guides experienced developers through the GREEN phase: implementing the minimum code necessary to make a failing test pass.
## When to Use This Skill
- RED phase test has been verified as failing
- Proceeding autonomously from RED phase
- Implementing feature to pass test
- Moving from RED to GREEN in TDD cycle
## Prerequisites
- Completed RED phase with verified failing test
- Clear understanding of what test expects
- Implementation environment ready
## GREEN Phase Objective
**Write the minimum code to make the test pass.**
**Correct approach:** Implements exactly what test requires, no additional features, simplest solution, no premature optimization
**Incorrect approach:** Implements untested features, over-engineers, adds "might need later" functionality
## Workflow
### Step 1: Understand Test Requirements
Review the failing test to identify:
- What behavior is expected?
- What inputs does test provide?
- What output/result does test expect?
**Test defines the contract. Implementation must fulfill contract, nothing more.**
### Step 2: Plan Minimal Implementation
Identify: minimum logic needed, required data structures, necessary dependencies, expected return values.
Avoid planning: features not in test, abstractions not yet needed, optimizations not required, error handling not tested.
### Step 3: Implement to Pass Test
1. Locate or create the implementation file
2. Write the minimum code to make the test pass
3. Execute the test and verify it passes
### Step 4: Execute and Verify
- [ ] Test executed without errors
- [ ] Test passed (green)
- [ ] No other tests broke
- [ ] Implementation is minimal and clear
### Step 5: Analyze Success
- **Test passes** → GREEN complete → proceed to REFACTOR phase
- **Test still fails** → implementation incomplete → revise and repeat Step 3
- **Other tests fail** → regression → revise to fix, re-run all tests
## Best Practices
### YAGNI (You Aren't Gonna Need It)
- Hard-coded values acceptable if test passes
- Simple conditional logic, direct implementation
- No untested features "just in case"
### Simplest Thing That Works
```
Test: Function should return sum of two numbers
WRONG: Generic calculation engine, config system, plugin architecture
RIGHT: Function takes two parameters, returns their sum
```
### Let Tests Drive Design
Test defines function signature, parameters, return type, behavior. Implementation follows — no more, no less.
### Hard-Code First, Generalize Later
- Test expects specific output? → Return that output (hard-coded), generalize in future tests
- Test expects list with one item? → Return list with that one item
- Test checks single condition? → Implement that condition only
## Common Mistakes
1. **Over-Implementation** — adding features not required by test. Trust future tests to drive future features.
2. **Premature Abstraction** — creating abstractions before needed. Wait for Rule of Three.
3. **Ignoring Failure Details** — not reading what test actually expects. Read failure message carefully.
4. **Breaking Existing Tests** — run full suite, fix regressions before proceeding.
## Implementation Strategies
| Strategy | When | Example |
|----------|------|---------|
| **Fake It** | Simple test, clear generalization path | Test expects 5 → return 5; generalize when next test forces it |
| **Obvious Implementation** | Solution is straightforward | add(a,b) → return a + b |
| **Triangulation** | Unsure how to generalize | Multiple tests with different values force real implementation |
## Integration with IDPF-Agile
GREEN phase follows RED in story implementation. The TDD cycle runs autonomously. The only user checkpoint is at story completion (In Review → Done).
## GREEN Phase Checklist
- [ ] Implementation code is complete and correct
- [ ] Target test now PASSES (green)
- [ ] Implementation is minimal (no over-engineering)
- [ ] No existing tests broke (full suite green)
- [ ] Code is understandable and clear
- [ ] Implementation matches test requirements exactly
- [ ] No untested features added
## Relationship to Other Skills
- **Flows from:** `tdd-red-phase`
- **Flows to:** `tdd-refactor-phase`
- **Related:** `tdd-failure-recovery`, `test-writing-patterns`

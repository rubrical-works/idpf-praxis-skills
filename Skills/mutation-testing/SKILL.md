---
name: mutation-testing
description: Guide developers through mutation testing to assess and improve test suite quality
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: testing
type: reference
relevantTechStack: [stryker, mutation-testing, javascript, typescript]
disable-model-invocation: true
copyright: "Rubrical Works (c) 2026"
---
# Mutation Testing
This Skill guides developers through mutation testing -- a technique for evaluating test suite quality by introducing small changes (mutations) to code and checking if tests catch them.
## When to Use This Skill
- Assessing test suite quality beyond code coverage
- Identifying weak spots in test coverage
- Evaluating whether tests are meaningful
- Improving test effectiveness
- Making decisions about test maintenance
## What is Mutation Testing?
### Core Concept
1. **Mutate:** Make small changes to source code
2. **Test:** Run test suite against mutated code
3. **Evaluate:** Check if tests detect (kill) the mutations
### Key Terms
- **Mutant:** Modified version of original code with one small change
- **Mutation Operator:** Rule defining how to modify code (e.g., `+` to `-`)
- **Killed Mutant:** Detected by at least one failing test
- **Survived Mutant:** Not detected by any test (tests still pass)
- **Equivalent Mutant:** Behaves identically to original (cannot be killed)
- **Mutation Score:** `killed / (total - equivalent)` as percentage
## Why Mutation Testing?
```python
# 100% code coverage, but weak test
def calculate_discount(price, is_member):
    if is_member:
        return price * 0.9
    return price

def test_discount():
    assert calculate_discount(100, True) is not None  # Passes, but weak!

# Mutation: change 0.9 to 0.8 -- weak test still passes, mutant SURVIVES
# Reveals the test doesn't check the actual discount value
```
## Mutation Operators
### Arithmetic Operators
| Original | Mutated | Example |
|----------|---------|---------|
| `+` | `-` | `a + b` -> `a - b` |
| `-` | `+` | `a - b` -> `a + b` |
| `*` | `/` | `a * b` -> `a / b` |
| `/` | `*` | `a / b` -> `a * b` |
| `%` | `*` | `a % b` -> `a * b` |
### Relational Operators
| Original | Mutated | Example |
|----------|---------|---------|
| `<` | `<=` | `x < y` -> `x <= y` |
| `<=` | `<` | `x <= y` -> `x < y` |
| `>` | `>=` | `x > y` -> `x >= y` |
| `>=` | `>` | `x >= y` -> `x > y` |
| `==` | `!=` | `x == y` -> `x != y` |
| `!=` | `==` | `x != y` -> `x == y` |
### Logical Operators
| Original | Mutated | Example |
|----------|---------|---------|
| `and` | `or` | `a and b` -> `a or b` |
| `or` | `and` | `a or b` -> `a and b` |
| `not` | (removed) | `not x` -> `x` |
### Constant Mutations
| Original | Mutated | Example |
|----------|---------|---------|
| `0` | `1` | `return 0` -> `return 1` |
| `1` | `0` | `x = 1` -> `x = 0` |
| `true` | `false` | `return true` -> `return false` |
| `""` | `"mutant"` | `s = ""` -> `s = "mutant"` |
### Statement Mutations
| Type | Description | Example |
|------|-------------|---------|
| Statement deletion | Remove a statement | Delete `x = x + 1` |
| Return value | Change return | `return x` -> `return 0` |
| Void call removal | Remove void method call | Delete `log(msg)` |
## Understanding Mutation Score
| Score | Interpretation |
|-------|----------------|
| 90-100% | Excellent test suite |
| 75-89% | Good test suite |
| 60-74% | Acceptable, room for improvement |
| Below 60% | Weak test suite, needs attention |
### Score Context
- **High-risk code** (payment, auth, validation): Aim for 90%+
- **Standard code** (business logic, APIs): Aim for 75%+
- **Low-risk code** (logging, debug utilities): 60% may be acceptable
**Why not 100%?** Equivalent mutants, diminishing returns, maintenance cost.
## Analyzing Survived Mutants
1. **Review the mutant** -- what changed and on which line?
2. **Understand impact** -- what behavior changes? Is this case tested?
3. **Decide action** -- add test for boundary case, mark as equivalent, or accept risk
### Common Survival Patterns
- **Missing boundary tests:** `count > 0` -> `count >= 0` survives. Fix: test `count == 0`
- **Missing error case tests:** removed throw statement survives. Fix: test that expects exception
- **Missing assertion:** return value changed survives. Fix: assert on return value
## Equivalent Mutants
Mutants that produce identical behavior to the original code.
```python
def max(a, b):
    if a > b:      # Original
        return a
    return b

def max(a, b):
    if a >= b:     # EQUIVALENT MUTANT (same behavior when a == b)
        return a
    return b
```
**Handling:** Manual review and mark in tool, configure tool to skip known patterns, account for in score interpretation.
## Integration Workflow
**CI Pipeline:** On PRs (subset/changed files only), nightly full runs, before releases.
**Local Development:** On specific modules being worked on, before marking feature complete.
### Performance Optimization
1. **Limit scope:** Test only changed code
2. **Parallel execution:** Run mutants in parallel
3. **Incremental analysis:** Skip unchanged files
4. **Sampling:** Test subset of mutants
### Configuration Example
```yaml
mutation:
  target: src/
  tests: tests/
  timeout_factor: 2.0
  parallel: 4
  skip_patterns:
    - "**/generated/**"
    - "**/migrations/**"
  operators:
    - arithmetic
    - relational
    - logical
```
## Framework-Specific Guidance
### Python (mutmut)
```bash
pip install mutmut
mutmut run
mutmut results
mutmut show 42
```
### JavaScript (Stryker)
```bash
npm install @stryker-mutator/core
npx stryker init
npx stryker run
```
### Java (PIT/Pitest)
```xml
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <version>1.15.0</version>
</plugin>
```
```bash
mvn org.pitest:pitest-maven:mutationCoverage
```
### Other Frameworks
| Language | Tool | Notes |
|----------|------|-------|
| Python | mutmut | Simple CLI, good integration |
| JavaScript/TypeScript | Stryker | Feature-rich, good reporting |
| Java | PIT | Industry standard for Java |
| C# | Stryker.NET | .NET port of Stryker |
| Ruby | mutant | Semantic mutations |
| Go | go-mutesting | Go support |
## Best Practices
1. **Start small** -- begin with critical modules, expand gradually, focus on high-risk code first
2. **Set realistic goals** -- start with current score, set incremental targets, track progress
3. **Address survivors systematically** -- equivalent? mark it. Test missing? add it. Acceptable risk? document why.
4. **Integrate with CI** -- run on PRs (limited scope), block on score regression, provide clear feedback
5. **Balance cost and value** -- prioritize critical code, use sampling for large codebases, accept diminishing returns
## Common Pitfalls
- **Running on everything** -- full mutation testing takes hours. Target specific modules, use incremental analysis.
- **Ignoring equivalent mutants** -- score seems stuck below 80%. Review survivors, mark equivalents.
- **Adding tests without understanding** -- tests added just to kill mutants. Understand what behavior changes.
- **Over-testing to kill mutants** -- hundreds of tests for edge cases. Focus on meaningful mutations.
## Resources
See `resources/` directory for:
- `operator-guide.md` - Detailed mutation operator reference
- `score-interpretation.md` - Understanding and improving scores
- `framework-examples.md` - Framework-specific setup and usage
## Relationship to Other Skills
**Complements:** `property-based-testing`, `test-writing-patterns`, `tdd-refactor-phase`
**Independent from:** Beginner skills -- assumes testing experience

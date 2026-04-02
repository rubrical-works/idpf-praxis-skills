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
Guide developers through mutation testing -- evaluating test suite quality by introducing small code changes (mutations) and checking if tests catch them.
## When to Use
- Assessing test suite quality beyond code coverage
- Identifying weak spots in test coverage
- Evaluating whether tests are meaningful
- Improving test effectiveness
- Making decisions about test maintenance
## Core Concept
1. **Mutate:** Make small changes to source code
2. **Test:** Run test suite against mutated code
3. **Evaluate:** Check if tests detect (kill) the mutations
## Key Terms
- **Mutant:** Modified version of original code with one small change
- **Mutation Operator:** Rule defining how to modify code (e.g., `+` to `-`)
- **Killed Mutant:** Detected by at least one failing test
- **Survived Mutant:** Not detected by any test (tests still pass)
- **Equivalent Mutant:** Behaves identically to original (cannot be killed)
- **Mutation Score:** `killed / (total - equivalent) * 100%`
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
- **High-risk code (90%+):** Payment processing, authentication, data validation
- **Standard code (75%+):** Business logic, API endpoints, data transformations
- **Low-risk code (60%+):** Logging, debug utilities, simple getters/setters
### Why Not 100%?
- Equivalent mutants don't change behavior
- Diminishing returns past a point
- More tests = more maintenance
## Analyzing Survived Mutants
1. **Review the mutant** -- what changed, what line
2. **Understand the impact** -- what behavior changes
3. **Decide on action** -- add test, mark equivalent, or accept risk
### Common Survival Patterns
- **Missing boundary tests:** `count > 0` -> `count >= 0` survives. Fix: test `count == 0`
- **Missing error case tests:** removed throw survives. Fix: test that expects exception
- **Missing assertion:** return value changed survives. Fix: assert on return value
## Equivalent Mutants
Mutants that produce identical behavior to original code.
```python
# Equivalent mutant (same behavior when a == b)
def max(a, b):
    if a >= b:  # EQUIVALENT -- original was a > b
        return a
    return b
```
Handling: manual review and mark, configure tool to skip known patterns, account in score interpretation.
## Integration Workflow
**CI Pipeline:** On PRs (subset/changed files), nightly full runs, before releases
**Local:** On specific modules, before marking feature complete
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
1. **Start Small:** Begin with critical modules, expand gradually
2. **Set Realistic Goals:** Start with current score, set incremental targets
3. **Address Survivors Systematically:** Equivalent? Mark it. Missing test? Add it. Acceptable risk? Document why.
4. **Integrate with CI:** Run on PRs (limited scope), block on score regression
5. **Balance Cost and Value:** Prioritize critical code, use sampling for large codebases
## Common Pitfalls
- **Running on everything:** Target specific modules, use incremental analysis
- **Ignoring equivalent mutants:** Review survivors, mark equivalents properly
- **Adding tests without understanding:** Understand what behavior mutant changes, test that behavior
- **Over-testing to kill mutants:** Focus on meaningful mutations, accept some survivors
## Resources
See `resources/` directory for:
- `operator-guide.md` - Detailed mutation operator reference
- `score-interpretation.md` - Understanding and improving scores
- `framework-examples.md` - Framework-specific setup and usage
## Relationship to Other Skills
**Complements:** `property-based-testing`, `test-writing-patterns`, `tdd-refactor-phase`
## Expected Outcome
- Mutation testing configured for project
- Initial mutation score established
- Survived mutants analyzed
- Tests improved to kill meaningful mutants
- CI integration planned or implemented

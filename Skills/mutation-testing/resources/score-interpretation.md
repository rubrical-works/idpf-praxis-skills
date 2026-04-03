# Mutation Score Interpretation
**Version:** v0.8.0
Understanding mutation testing results and improving scores.
## Understanding Your Score
### Score Formula
```
Mutation Score = (Killed Mutants) / (Total Mutants - Equivalent Mutants) x 100%
```
### Example
```
Total: 100 | Killed: 72 | Survived: 25 | Equivalent: 3
Score = 72 / (100 - 3) = 72 / 97 = 74.2%
```
## Score Benchmarks
| Score Range | Quality Assessment | Action |
|-------------|-------------------|--------|
| 90-100% | Excellent | Maintain, review occasionally |
| 80-89% | Very Good | Minor improvements possible |
| 70-79% | Good | Review survived mutants |
| 60-69% | Acceptable | Targeted improvements needed |
| 50-59% | Weak | Significant testing gaps |
| Below 50% | Poor | Major test suite issues |
### Context-Based Targets
- **Critical code (90%+):** Authentication, payment processing, data validation, security
- **Core business logic (80%+):** Domain models, business rules, API endpoints
- **Standard code (70%+):** CRUD operations, configuration handling
- **Low-risk code (60%+):** Logging utilities, debug helpers, simple getters/setters
## Categories of Survived Mutants
**1. Missing Test Case**
```
Mutant: if (x > 0) -> if (x >= 0)
Why survived: No test for x == 0
Action: Add boundary test
```
**2. Weak Assertion**
```
Mutant: return price * 0.9 -> return price * 0.8
Why survived: Test only checks return is not null
Action: Assert on actual value
```
**3. Equivalent Mutant**
```
Mutant: if (x > 0 && y > 0) -> if (y > 0 && x > 0)
Why survived: Same behavior (commutative)
Action: Mark as equivalent
```
**4. Dead Code**
```
Mutant: Unreachable statement changed
Action: Remove dead code
```
**5. Acceptable Risk**
```
Mutant: Log message changed
Action: Document as acceptable
```
### Prioritizing Survivors
- **High Priority:** Survivors in critical code paths, missing assertions, frequently changed code
- **Medium Priority:** Business logic survivors, missing boundary tests, error handling gaps
- **Low Priority:** Logging/debug code, equivalent mutants, acceptable risk areas
## Improving Your Score
### Strategy 1: Address High-Value Survivors
1. Sort survivors by code criticality
2. Focus on relational operator survivors (often boundary issues)
3. Add specific tests for each
4. Re-run mutation testing
### Strategy 2: Strengthen Assertions
```python
# Before (weak)
def test_calculate_discount():
    result = calculate_discount(100, True)
    assert result is not None

# After (strong)
def test_calculate_discount():
    result = calculate_discount(100, True)
    assert result == 90  # 10% discount
```
### Strategy 3: Add Boundary Tests
```python
# Before
def test_is_adult():
    assert is_adult(25) == True
    assert is_adult(10) == False

# After
def test_is_adult():
    assert is_adult(25) == True   # Well over
    assert is_adult(10) == False  # Well under
    assert is_adult(18) == True   # Boundary: exactly 18
    assert is_adult(17) == False  # Boundary: just under
```
### Strategy 4: Test Error Paths
```python
# Before
def test_divide():
    assert divide(10, 2) == 5

# After
def test_divide():
    assert divide(10, 2) == 5
    with pytest.raises(ValueError):
        divide(10, 0)  # Error case
```
## Score Trends
| Metric | Good Trend | Warning Sign |
|--------|------------|--------------|
| Score | Stable or increasing | Decreasing |
| New survivors | Few per release | Many per release |
| Time to kill | Stable | Increasing significantly |
### CI Integration
```yaml
mutation_testing:
  threshold: 75
  fail_on_regression: true
  allow_decrease: 2%
```
## Common Score Issues
### Score Won't Rise Above 80%
- Many equivalent mutants -- review and mark equivalents
- Testing implementation, not behavior -- focus on behavior-driven tests
- Missing integration tests -- add end-to-end tests for complex flows
### Score Drops After Refactoring
- Tests too coupled to implementation -- update to focus on behavior
- New code paths not tested -- add tests for new code
- Existing tests became obsolete -- remove obsolete tests
### High Score But Bugs Still Found
- Tests don't cover integration points -- add integration tests
- Mutation operators don't cover all bug types -- consider property-based testing
- Tests have hidden dependencies -- review test isolation
## Setting Score Goals
### New Projects
```
Start: Establish baseline
Month 1: +5% improvement
Month 2: +5% improvement
Month 3: Reach target (e.g., 75%)
Ongoing: Maintain, prevent regression
```
### Legacy Projects
```
Start: Establish baseline (may be low)
Phase 1: Cover critical paths (50% -> 60%)
Phase 2: Cover business logic (60% -> 70%)
Phase 3: Comprehensive coverage (70% -> 80%)
Maintenance: Prevent regression
```

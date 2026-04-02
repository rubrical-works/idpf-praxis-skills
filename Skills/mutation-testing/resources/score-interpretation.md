# Mutation Score Interpretation
**Version:** v0.4.0

Understanding mutation testing results and improving scores.

## Understanding Your Score

### Score Formula

```
Mutation Score = (Killed Mutants) / (Total Mutants - Equivalent Mutants) × 100%
```

### Example

```
Total mutants generated: 100
Killed (test failed): 72
Survived (test passed): 25
Equivalent (same behavior): 3

Score = 72 / (100 - 3) = 72 / 97 = 74.2%
```

## Score Benchmarks

### Industry Guidance

| Score Range | Quality Assessment | Action |
|-------------|-------------------|--------|
| 90-100% | Excellent | Maintain, review occasionally |
| 80-89% | Very Good | Minor improvements possible |
| 70-79% | Good | Review survived mutants |
| 60-69% | Acceptable | Targeted improvements needed |
| 50-59% | Weak | Significant testing gaps |
| Below 50% | Poor | Major test suite issues |

### Context Matters

**Critical code (90%+ recommended):**
- Authentication/Authorization
- Payment processing
- Data validation
- Security-sensitive code

**Core business logic (80%+):**
- Domain models
- Business rules
- API endpoints
- Data transformations

**Standard code (70%+):**
- CRUD operations
- Configuration handling
- Standard workflows

**Low-risk code (60%+):**
- Logging utilities
- Debug helpers
- Simple getters/setters

## Analyzing Results

### Categories of Survived Mutants

**1. Missing Test Case**
```
Mutant: if (x > 0) → if (x >= 0)
Why survived: No test for x == 0
Action: Add boundary test
```

**2. Weak Assertion**
```
Mutant: return price * 0.9 → return price * 0.8
Why survived: Test only checks return is not null
Action: Assert on actual value
```

**3. Equivalent Mutant**
```
Mutant: if (x > 0 && y > 0) → if (y > 0 && x > 0)
Why survived: Same behavior (commutative)
Action: Mark as equivalent
```

**4. Dead Code**
```
Mutant: Unreachable statement changed
Why survived: Code never executes
Action: Remove dead code
```

**5. Acceptable Risk**
```
Mutant: Log message changed
Why survived: Logging not tested
Action: Document as acceptable
```

### Prioritizing Survivors

**High Priority (fix first):**
- Survivors in critical code paths
- Survivors indicating missing assertions
- Survivors in frequently changed code

**Medium Priority:**
- Survivors in business logic
- Missing boundary tests
- Error handling gaps

**Low Priority:**
- Logging/debug code
- Equivalent mutants
- Acceptable risk areas

## Improving Your Score

### Strategy 1: Address High-Value Survivors

```
1. Sort survivors by code criticality
2. Focus on relational operator survivors (often boundary issues)
3. Add specific tests for each
4. Re-run mutation testing
```

### Strategy 2: Strengthen Assertions

**Before (weak):**
```python
def test_calculate_discount():
    result = calculate_discount(100, True)
    assert result is not None
```

**After (strong):**
```python
def test_calculate_discount():
    result = calculate_discount(100, True)
    assert result == 90  # 10% discount
```

### Strategy 3: Add Boundary Tests

**Before:**
```python
def test_is_adult():
    assert is_adult(25) == True
    assert is_adult(10) == False
```

**After:**
```python
def test_is_adult():
    assert is_adult(25) == True   # Well over
    assert is_adult(10) == False  # Well under
    assert is_adult(18) == True   # Boundary: exactly 18
    assert is_adult(17) == False  # Boundary: just under
```

### Strategy 4: Test Error Paths

**Before:**
```python
def test_divide():
    assert divide(10, 2) == 5
```

**After:**
```python
def test_divide():
    assert divide(10, 2) == 5
    with pytest.raises(ValueError):
        divide(10, 0)  # Error case
```

## Score Trends

### Tracking Over Time

| Metric | Good Trend | Warning Sign |
|--------|------------|--------------|
| Score | Stable or increasing | Decreasing |
| New survivors | Few per release | Many per release |
| Time to kill | Stable | Increasing significantly |

### CI Integration

```yaml
# Example: Fail if score drops
mutation_testing:
  threshold: 75
  fail_on_regression: true
  allow_decrease: 2%  # Allow small fluctuation
```

## Common Score Issues

### Issue: Score Won't Rise Above 80%

**Possible causes:**
1. Many equivalent mutants
2. Testing implementation, not behavior
3. Missing integration tests

**Solutions:**
1. Review and mark equivalents
2. Focus on behavior-driven tests
3. Add end-to-end tests for complex flows

### Issue: Score Drops After Refactoring

**Possible causes:**
1. Tests were too coupled to implementation
2. New code paths not tested
3. Existing tests became obsolete

**Solutions:**
1. Update tests to focus on behavior
2. Add tests for new code
3. Remove obsolete tests

### Issue: High Score But Bugs Still Found

**Possible causes:**
1. Tests don't cover integration points
2. Mutation operators don't cover all bug types
3. Tests have hidden dependencies

**Solutions:**
1. Add integration tests
2. Consider property-based testing
3. Review test isolation

## Report Analysis

### Key Report Sections

**1. Summary**
```
Mutation Score: 76%
Total Mutants: 150
Killed: 114
Survived: 32
Equivalent: 4
```

**2. Survivors by File**
```
src/calculator.py: 12 survivors
src/validator.py: 8 survivors
src/utils.py: 12 survivors
```

**3. Survivors by Operator**
```
RelationalOperator: 15 survivors
ArithmeticOperator: 10 survivors
LogicalOperator: 7 survivors
```

### Using Report to Prioritize

1. Focus on files with most survivors
2. Address common operator survivors
3. Review highest-criticality modules first

## Setting Score Goals

### For New Projects

```
Start: Establish baseline
Month 1: +5% improvement
Month 2: +5% improvement
Month 3: Reach target (e.g., 75%)
Ongoing: Maintain target, prevent regression
```

### For Legacy Projects

```
Start: Establish baseline (may be low)
Phase 1: Cover critical paths (50% → 60%)
Phase 2: Cover business logic (60% → 70%)
Phase 3: Comprehensive coverage (70% → 80%)
Maintenance: Prevent regression
```

---

**See SKILL.md for complete mutation testing guidance**

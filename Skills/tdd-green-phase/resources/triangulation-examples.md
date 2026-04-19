# Triangulation Examples
**Version:** v0.12.0
## What is Triangulation?
Triangulation uses multiple specific tests to guide toward a general implementation.
1. Write first test -> implement with hardcoded value
2. Write second test -> hardcoded no longer works
3. Generalize implementation to pass both tests
## Example 1: Addition Function
### Step 1: First Test
```python
def test_adds_two_and_three():
    assert add(2, 3) == 5
```
**Fake implementation:**
```python
def add(a, b):
    return 5  # Hardcoded
```
### Step 2: Second Test (Triangulate)
```python
def test_adds_one_and_one():
    assert add(1, 1) == 2
```
Now hardcoded `5` fails this test.
### Step 3: Generalize
```python
def add(a, b):
    return a + b  # Must generalize
```
Both tests pass. Implementation is correct.
## Example 2: FizzBuzz
```python
# Step 1: Plain number
def test_returns_number_as_string():
    assert fizzbuzz(1) == "1"
def fizzbuzz(n):
    return "1"  # Hardcoded
# Step 2: Another plain number -> forces generalization
def test_returns_two_as_string():
    assert fizzbuzz(2) == "2"
def fizzbuzz(n):
    return str(n)  # Generalized
# Step 3: Divisible by 3
def test_returns_fizz_for_three():
    assert fizzbuzz(3) == "Fizz"
def fizzbuzz(n):
    if n % 3 == 0:
        return "Fizz"
    return str(n)
```
Continue pattern for Buzz (5), FizzBuzz (15), etc.
## Example 3: List Processing
```python
# Step 1: Single item
def test_sum_single_item():
    assert sum_list([5]) == 5
def sum_list(items):
    return 5  # Hardcoded
# Step 2: Different single item -> forces generalization
def test_sum_single_item_seven():
    assert sum_list([7]) == 7
def sum_list(items):
    return items[0]  # Return first item
# Step 3: Multiple items -> forces full generalization
def test_sum_two_items():
    assert sum_list([3, 4]) == 7
def sum_list(items):
    return sum(items)  # Generalize to sum all
```
## When to Use Triangulation
| Situation | Approach |
|-----------|----------|
| Solution is obvious | Implement directly |
| Solution unclear | Triangulate |
| Complex algorithm | Triangulate step by step |
| Simple utility | Implement directly |
**Signs you need more tests:** Implementation feels too specific, hardcoded values remain, edge cases not covered, you're "guessing" the algorithm.
## Triangulation Workflow
```
Test 1 -> Fake It (hardcode)
    |
Test 2 -> Forces generalization
    |
Test 3 -> Confirms pattern
    |
Implementation complete
```
## Common Patterns
- **Edge to Center:** Test simplest case (empty, zero, one) -> basic case -> complex case
- **Happy to Sad:** Test success case -> another success -> error case
## Quick Reference
| Tests | Implementation |
|-------|----------------|
| 1 test | Can hardcode |
| 2 tests | Must start generalizing |
| 3+ tests | Should be general |
> "As tests get more specific, code gets more generic." -- Robert C. Martin

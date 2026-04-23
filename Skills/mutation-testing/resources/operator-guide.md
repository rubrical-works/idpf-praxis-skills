# Mutation Operator Guide
**Version:** v0.13.1
Comprehensive reference for mutation operators across languages.
## Operator Categories
### 1. Arithmetic Operator Replacement (AOR)
| Original | Mutations |
|----------|-----------|
| `+` | `-`, `*`, `/`, `%` |
| `-` | `+`, `*`, `/`, `%` |
| `*` | `+`, `-`, `/`, `%` |
| `/` | `+`, `-`, `*`, `%` |
| `%` | `+`, `-`, `*`, `/` |
### 2. Relational Operator Replacement (ROR)
| Original | Mutations |
|----------|-----------|
| `<` | `<=`, `>`, `>=`, `==`, `!=` |
| `<=` | `<`, `>`, `>=`, `==`, `!=` |
| `>` | `<`, `<=`, `>=`, `==`, `!=` |
| `>=` | `<`, `<=`, `>`, `==`, `!=` |
| `==` | `<`, `<=`, `>`, `>=`, `!=` |
| `!=` | `<`, `<=`, `>`, `>=`, `==` |
### 3. Logical Operator Replacement (LOR)
| Original | Mutations |
|----------|-----------|
| `and` / `&&` | `or` / `||` |
| `or` / `||` | `and` / `&&` |
### 4. Logical Negation Insertion (LNI)
| Original | Mutation |
|----------|----------|
| `x` | `not x` |
| `not x` | `x` |
### 5. Conditional Operator Replacement (COR)
| Original | Mutations |
|----------|-----------|
| `condition ? a : b` | `true ? a : b`, `false ? a : b`, `condition ? b : a` |
### 6. Statement Deletion (SDL)
| Type | Example |
|------|---------|
| Assignment | Remove `x = 5` |
| Method call | Remove `validate()` |
| Return statement | Remove `return x` |
### 7. Constant Replacement (CR)
| Original | Mutations |
|----------|-----------|
| `0` | `1`, `-1` |
| `1` | `0`, `2`, `-1` |
| `true` | `false` |
| `false` | `true` |
| `""` | `"mutant"` |
| `null` | Non-null value |
### 8. Increment/Decrement Replacement (IDR)
| Original | Mutations |
|----------|-----------|
| `++x` | `--x`, `x` |
| `x++` | `x--`, `x` |
| `--x` | `++x`, `x` |
| `x--` | `x++`, `x` |
### 9. Return Value Replacement (RVR)
| Return Type | Mutations |
|-------------|-----------|
| `int` | `0`, `1`, `-1` |
| `boolean` | `true`, `false`, `!original` |
| `object` | `null` |
| `string` | `""`, `"mutant"` |
### 10. Void Method Call Removal (VMC)
Remove calls to void methods (e.g., `log()`, `validate()`, `notify()`).
## Language-Specific Operators
### Python-Specific
| Operator | Description | Example |
|----------|-------------|---------|
| Decorator removal | Remove `@decorator` | `@cache` -> removed |
| Exception handling | Change exception type | `except ValueError` -> `except Exception` |
| Comprehension | Modify list comprehension | `[x for x in items]` -> `[x for x in items if False]` |
### JavaScript-Specific
| Operator | Description | Example |
|----------|-------------|---------|
| `===` to `==` | Strict to loose equality | `a === b` -> `a == b` |
| `!==` to `!=` | Strict to loose inequality | `a !== b` -> `a != b` |
| Optional chaining | Remove `?.` | `obj?.prop` -> `obj.prop` |
| Nullish coalescing | Change `??` | `a ?? b` -> `a || b` |
### Java-Specific
| Operator | Description | Example |
|----------|-------------|---------|
| Access modifier | Change visibility | `private` -> `public` |
| Static removal | Remove static | `static method` -> `method` |
| Final removal | Remove final | `final x` -> `x` |
## Operator Selection Strategy
**Start with:** Relational operators (most effective), logical operators (common logic errors), constant replacement (off-by-one errors)
**Add gradually:** Arithmetic operators, statement deletion, return value replacement
**Use sparingly:** Increment/decrement (many equivalents), void method removal (often equivalents)
## Operator Effectiveness
| Operator | Effectiveness | Common Finding |
|----------|---------------|----------------|
| ROR | Very High | Missing boundary tests |
| LOR | High | Logic errors |
| CR | High | Off-by-one errors |
| AOR | Medium | Arithmetic bugs |
| SDL | Medium | Missing assertions |
| RVR | Medium | Return value testing |
## Reducing Equivalent Mutants
**Operators prone to equivalents:** Statement deletion (especially logging), increment/decrement in loops, return value changes in dead code.
```yaml
# Focus on high-value operators
operators:
  - relational
  - logical
  - conditional
exclude_operators:
  - increment_decrement  # Many equivalents
```

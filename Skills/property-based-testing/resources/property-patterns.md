# Property Patterns
**Version:** v0.4.0

Additional property patterns for common testing scenarios.

## Data Structure Properties

### List/Array Properties

**Length preservation:**
```
len(reverse(xs)) == len(xs)
len(sort(xs)) == len(xs)
len(filter(p, xs)) <= len(xs)
len(map(f, xs)) == len(xs)
```

**Element preservation:**
```
set(reverse(xs)) == set(xs)
sorted(sort(xs)) == sorted(xs)  # idempotent
x in xs implies x in reverse(xs)
```

**Ordering:**
```
is_sorted(sort(xs))
is_sorted(reverse(sort(xs)), descending=True)
```

**Concatenation:**
```
len(xs + ys) == len(xs) + len(ys)
(xs + ys) + zs == xs + (ys + zs)  # associative
xs + [] == xs  # identity
```

### Map/Dictionary Properties

**Lookup after insert:**
```
get(insert(m, k, v), k) == v
```

**Delete removes key:**
```
k not in keys(delete(m, k))
```

**Size consistency:**
```
len(keys(m)) == len(values(m))
len(insert(m, k, v)) <= len(m) + 1
```

### Set Properties

**Union:**
```
x in union(a, b) iff (x in a or x in b)
union(a, b) == union(b, a)  # commutative
union(a, empty) == a  # identity
```

**Intersection:**
```
x in intersect(a, b) iff (x in a and x in b)
intersect(a, b) == intersect(b, a)  # commutative
intersect(a, a) == a  # idempotent
```

**Difference:**
```
x in diff(a, b) iff (x in a and x not in b)
diff(a, empty) == a
diff(a, a) == empty
```

## Numeric Properties

### Arithmetic

**Addition:**
```
a + b == b + a  # commutative
(a + b) + c == a + (b + c)  # associative
a + 0 == a  # identity
a + (-a) == 0  # inverse
```

**Multiplication:**
```
a * b == b * a  # commutative
(a * b) * c == a * (b * c)  # associative
a * 1 == a  # identity
a * 0 == 0  # annihilator
```

**Division:**
```
b != 0 implies (a / b) * b approximately equals a
b != 0 implies a // b <= a / b (integer division)
```

### Comparison

**Transitivity:**
```
(a < b and b < c) implies a < c
(a <= b and b <= c) implies a <= c
```

**Trichotomy:**
```
exactly one of: a < b, a == b, a > b
```

**Reflexivity:**
```
a == a
a <= a
```

## String Properties

**Concatenation:**
```
len(s + t) == len(s) + len(t)
s + "" == s
(s + t) + u == s + (t + u)
```

**Substring:**
```
s in (s + t)
s in (t + s)
"" in s  # empty string in any string
```

**Case conversion:**
```
lower(lower(s)) == lower(s)  # idempotent
upper(upper(s)) == upper(s)  # idempotent
len(lower(s)) == len(s)
```

**Split and join:**
```
join(sep, split(sep, s)) == s  # for simple cases
```

## Encoding/Serialization Properties

### Roundtrip

**Basic roundtrip:**
```
decode(encode(x)) == x
deserialize(serialize(x)) == x
decompress(compress(x)) == x
decrypt(encrypt(x, key), key) == x
```

**Partial roundtrip (lossy):**
```
parse(format(x)) approximately equals x  # for floats
fromJSON(toJSON(x)) structurally equals x
```

### Format preservation

**Length bounds:**
```
len(compress(x)) <= len(x) + overhead
len(base64encode(x)) == ceiling(len(x) * 4 / 3)
```

## State Machine Properties

### Invariants

**Balance:**
```
for all operations: balance >= 0
for all operations: total_in - total_out == balance
```

**Capacity:**
```
for all states: count <= max_capacity
for all operations on full: count unchanged on add
```

### Operation Properties

**Idempotent operations:**
```
close(close(resource)) == close(resource)
stop(stop(process)) == stop(process)
```

**Reversible operations:**
```
undo(do(state, action), action) == state
```

## API/Protocol Properties

### REST API

**GET is safe:**
```
state_after(GET(resource)) == state_before
GET(resource) == GET(resource)  # idempotent
```

**PUT is idempotent:**
```
state_after(PUT(r, data)) == state_after(PUT(r, data); PUT(r, data))
```

**DELETE is idempotent:**
```
DELETE(r); DELETE(r) has same effect as DELETE(r)
```

### Request/Response

**Status codes:**
```
valid_request implies status in [200, 201, 204]
invalid_request implies status in [400, 422]
not_found implies status == 404
```

## Fuzzing-Oriented Properties

### Parser Properties

**No crashes:**
```
for all input: parse(input) returns result or error, never crashes
```

**Deterministic:**
```
parse(input) == parse(input)  # same result every time
```

**Error consistency:**
```
parse(input) == Error implies parse(input) == Error  # consistent errors
```

### Sanitization

**Idempotent:**
```
sanitize(sanitize(input)) == sanitize(input)
```

**Safe output:**
```
sanitize(any_input) contains no dangerous patterns
```

## Test Oracle Patterns

### Reference Implementation

```
optimized_impl(x) == reference_impl(x)
new_code(x) == old_code(x)  # for refactoring
```

### Metamorphic Relations

**Scaling:**
```
sort(scale(xs, 2)) == scale(sort(xs), 2)
mean(scale(xs, k)) == scale(mean(xs), k)
```

**Permutation:**
```
sum(permute(xs)) == sum(xs)
len(permute(xs)) == len(xs)
```

---

**See SKILL.md for complete property-based testing guidance**

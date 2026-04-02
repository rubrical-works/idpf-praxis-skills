# Go Anti-Patterns
**Version:** v0.4.1

Common anti-patterns specific to Go development.

---

## Ignoring Errors

**Description:** Discarding error returns without handling them.

**Symptoms:**
- Silent failures
- Nil pointer panics downstream
- Data corruption without warning

**Example (Bad):**
```go
result, _ := doSomething()  // Error silently ignored
file, _ := os.Open(path)    // File might not exist
json.Unmarshal(data, &obj)   // Return value not checked
```

**Example (Good):**
```go
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doSomething failed: %w", err)
}
```

**Detection:** Look for `_` on error returns, or function calls without error capture.

---

## Goroutine Leaks

**Description:** Starting goroutines that never terminate.

**Symptoms:**
- Memory grows over time
- CPU usage increases
- Channel deadlocks
- Program hangs on shutdown

**Example (Bad):**
```go
func process() {
    ch := make(chan int)
    go func() {
        val := <-ch  // Blocks forever if nothing sends
        fmt.Println(val)
    }()
    // ch is never written to, goroutine leaks
}
```

**Example (Good):**
```go
func process(ctx context.Context) {
    ch := make(chan int)
    go func() {
        select {
        case val := <-ch:
            fmt.Println(val)
        case <-ctx.Done():
            return  // Goroutine exits when context cancelled
        }
    }()
}
```

**Detection:** Goroutines without cancellation mechanisms (context, done channels, timeouts).

---

## Naked Returns in Long Functions

**Description:** Using named return values with naked returns in functions longer than a few lines.

**Symptoms:**
- Unclear what values are being returned
- Hard to trace return flow
- Bugs from accidental shadowing of named returns

**Example (Bad):**
```go
func calculate(input int) (result int, err error) {
    // ... 50 lines of logic ...
    if something {
        result = 42
    }
    // ... more logic ...
    return  // What is result here? Hard to tell.
}
```

**Example (Good):**
```go
func calculate(input int) (int, error) {
    // ... logic ...
    return 42, nil  // Explicit return values
}
```

**Detection:** Named returns with naked `return` in functions >10 lines.

---

## init() Abuse

**Description:** Overusing `init()` functions for complex initialization.

**Symptoms:**
- Import side effects
- Hard to test (can't control initialization order)
- Circular dependency issues
- Panics during startup

**Example (Bad):**
```go
func init() {
    db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
    if err != nil {
        panic(err)  // Crashes on startup
    }
    globalDB = db
}
```

**Example (Good):**
```go
func NewApp(dbURL string) (*App, error) {
    db, err := sql.Open("postgres", dbURL)
    if err != nil {
        return nil, fmt.Errorf("database connection: %w", err)
    }
    return &App{db: db}, nil
}
```

**Detection:** `init()` functions with error handling, network calls, or complex logic.

---

## interface{} Everywhere

**Description:** Using empty interfaces (`interface{}` / `any`) instead of typed parameters.

**Symptoms:**
- Lost type safety
- Runtime panics from type assertions
- Unclear API contracts
- Excessive type switching

**Example (Bad):**
```go
func process(data interface{}) interface{} {
    // Type assertions everywhere
    switch v := data.(type) {
    case string: // ...
    case int: // ...
    }
}
```

**Example (Good):**
```go
func processString(data string) string { ... }
func processInt(data int) int { ... }
// Or use generics (Go 1.18+)
func process[T comparable](data T) T { ... }
```

**Detection:** Functions with `interface{}` or `any` parameters that could be typed.

---

## Resources

- [Effective Go](https://go.dev/doc/effective_go) - Official style guide
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments) - Common review feedback

---

**End of Go Anti-Patterns**

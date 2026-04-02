# Code Path Discovery — Skill Instructions
## Scanning Workflow
### Step 1: Discover Source Files
Use `Glob` to find all supported source files within the specified `path`:
```
Patterns: **/*.ts, **/*.tsx, **/*.js, **/*.jsx
Exclude: **/node_modules/**, **/*.test.*, **/*.spec.*, **/__tests__/**
```
### Step 2: Scan for Code Patterns
For each source file, use `Read` and `Grep` to identify the following constructs:
#### 2a: Route Definitions and Entry Points
| Pattern | Examples |
|---------|----------|
| Express-style routes | `app.get(`, `app.post(`, `router.get(`, `router.use(` |
| Decorator routes | `@Get(`, `@Post(`, `@Controller(`, `@Route(` |
| Next.js/file-based routes | `export default function`, `export async function GET` |
| Event handlers | `on('event'`, `addEventListener(`, `ipcMain.handle(` |
| CLI entry points | `program.command(`, `.action(`, `yargs.command(` |
**Maps to:** Nominal Path
#### 2b: Controllers and Handler Functions
| Pattern | Examples |
|---------|----------|
| Exported async functions | `export async function`, `export const handler` |
| Class methods | `async methodName(`, `handle(` |
| Main function bodies | Sequential operations (read -> process -> respond) |
**Maps to:** Nominal Path
#### 2c: Conditional Branches and Feature Flags
| Pattern | Examples |
|---------|----------|
| If/else chains | `if (condition) { ... } else { ... }` |
| Switch statements | `switch (type) { case ... }` |
| Ternary operators | `condition ? a : b` |
| Feature flags | `if (featureEnabled(`, `process.env.FEATURE_` |
| Configuration-driven branches | `if (config.mode ===`, `options.strategy` |
**Maps to:** Alternative Paths
#### 2d: Error Handlers
| Pattern | Examples |
|---------|----------|
| Try-catch blocks | `try { ... } catch (error) { ... }` |
| Throw statements | `throw new Error(`, `throw new HttpException(` |
| Error middleware | `(err, req, res, next)`, `.catch(` |
| Promise rejection | `.catch(error =>`, `reject(` |
| Error response codes | `res.status(4`, `res.status(5`, `statusCode: 4` |
**Maps to:** Exception Paths
#### 2e: Guard Clauses and Boundary Checks
| Pattern | Examples |
|---------|----------|
| Null/undefined guards | `if (!x) return`, `if (x === null)`, `if (x == null)` |
| Empty collection checks | `if (arr.length === 0)`, `if (!items.length)` |
| Type guards | `if (typeof x !== 'string')`, `instanceof` checks |
| Range checks | `if (value < 0)`, `if (index >= arr.length)` |
| Existence checks | `if (!fs.existsSync(`, `if (!file)` |
**Maps to:** Edge Cases
#### 2f: Combined Guards and Concurrent Checks
| Pattern | Examples |
|---------|----------|
| Compound conditions | `if (a && b && c)`, `if (x \|\| y)` |
| Nested guards | Guard inside a conditional block |
| State machine transitions | `if (state === 'X' && event === 'Y')` |
| Race condition guards | `if (locked && pending)` |
| Multi-resource checks | `if (db.connected && cache.ready)` |
**Maps to:** Corner Cases
#### 2g: Validation and Auth Logic
| Pattern | Examples |
|---------|----------|
| Input validation | `validate(`, `schema.parse(`, `Joi.`, `zod.` |
| Auth checks | `isAuthenticated(`, `requireAuth(`, `authorize(` |
| Permission guards | `hasPermission(`, `checkRole(`, `canAccess(` |
| Rate limiting | `rateLimit(`, `throttle(` |
| CORS/security middleware | `cors(`, `helmet(`, `csrf(` |
**Maps to:** Negative Test Scenarios
### Step 3: Build Candidate Scenarios
For each detected pattern, create a candidate scenario object:
```json
{
  "shortLabel": "<concise name derived from code context>",
  "description": "<what the code does, referencing file:line where found>"
}
```
**Label generation rules:**
- Use the function/route name when available
- For anonymous handlers, use the route path or event name
- Keep labels under 50 characters
- Include the HTTP method for routes (e.g., "POST /users create")
**Description generation rules:**
- Describe the behavioral flow, not the code structure
- Reference the source file and approximate location
- Keep under 120 characters
### Step 4: Deduplicate and Rank
- Remove duplicate candidates within each category
- Rank by specificity (specific routes/handlers before generic middleware)
- Limit to 5 candidates per category (prioritize most distinctive patterns)
### Step 5: Return Structured Output
Return the 6-category object as defined in SKILL.md output format. Categories with no detected patterns return empty arrays.
## Scope Control
### Broad Scope Detection
If the scanned path contains more than 50 source files, emit a warning:
```
Broad scope may produce noisy results. Consider scoping to a feature directory.
```
### File Limit
Process a maximum of 100 source files. If more are found, prioritize:
1. Files in the top-level of `path`
2. Files in `src/`, `lib/`, `app/` subdirectories
3. Remaining files alphabetically
## Language Support
**Current:** TypeScript (`.ts`, `.tsx`), JavaScript (`.js`, `.jsx`)
The regex patterns in this document are designed for these languages. Additional language support would require new pattern sets.

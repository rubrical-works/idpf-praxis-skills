# JavaScript Anti-Patterns
**Version:** v0.7.0

Common anti-patterns specific to JavaScript and TypeScript development.

---

## Callback Hell

**Description:** Deeply nested callbacks making code hard to read and maintain.

**Symptoms:**
- Pyramid-shaped code
- Difficult error handling
- Hard to follow execution flow
- "Christmas tree" indentation

**Example (Bad):**
```javascript
getUser(userId, function(err, user) {
    if (err) {
        handleError(err);
    } else {
        getOrders(user.id, function(err, orders) {
            if (err) {
                handleError(err);
            } else {
                getOrderDetails(orders[0].id, function(err, details) {
                    if (err) {
                        handleError(err);
                    } else {
                        updateInventory(details, function(err, result) {
                            if (err) {
                                handleError(err);
                            } else {
                                // Finally do something
                            }
                        });
                    }
                });
            }
        });
    }
});
```

**Refactoring:**
```javascript
// Using async/await
async function processUserOrder(userId) {
    try {
        const user = await getUser(userId);
        const orders = await getOrders(user.id);
        const details = await getOrderDetails(orders[0].id);
        const result = await updateInventory(details);
        return result;
    } catch (err) {
        handleError(err);
    }
}

// Or Promise chaining
getUser(userId)
    .then(user => getOrders(user.id))
    .then(orders => getOrderDetails(orders[0].id))
    .then(details => updateInventory(details))
    .catch(handleError);
```

**Severity:** High

---

## Implicit Type Coercion Reliance

**Description:** Depending on JavaScript's loose equality and type coercion.

**Symptoms:**
- Using `==` instead of `===`
- Truthy/falsy checks that fail on edge cases
- Unexpected comparisons passing

**Example (Bad):**
```javascript
// Loose equality surprises
if (value == null) { }      // Matches null AND undefined
if (value == false) { }     // Matches 0, '', [], false
if ([] == false) { }        // true!
if ([] == ![]) { }          // true!

// Falsy checks that go wrong
function getItems(items) {
    if (!items) {
        return [];
    }
    return items;
}
getItems(0);   // Returns [] but 0 might be valid
getItems('');  // Returns [] but '' might be valid

// Type coercion in operations
'5' + 3;   // '53' (string)
'5' - 3;   // 2 (number)
```

**Refactoring:**
```javascript
// Strict equality
if (value === null || value === undefined) { }
if (value === false) { }

// Explicit type checks
function getItems(items) {
    if (items === undefined || items === null) {
        return [];
    }
    return items;
}

// Or with nullish coalescing
function getItems(items) {
    return items ?? [];
}

// TypeScript for compile-time safety
function getItems(items: Item[] | undefined): Item[] {
    return items ?? [];
}
```

**Severity:** Medium

---

## Polluting Global Scope

**Description:** Variables and functions leaking into global scope.

**Symptoms:**
- Variables without `let`, `const`, or `var`
- Name collisions between files
- "Variable is not defined" in some contexts
- Hard to track variable origins

**Example (Bad):**
```javascript
// Missing declaration
function processData() {
    result = [];  // Implicit global!
    for (i = 0; i < 10; i++) {  // i is global too!
        result.push(i);
    }
}

// IIFE not used in legacy code
var myApp = myApp || {};
myApp.utils = {};  // Pollutes global

// Script without module scope
// file1.js
var config = { api: 'v1' };

// file2.js
var config = { debug: true };  // Overwrites!
```

**Refactoring:**
```javascript
// Always declare variables
function processData() {
    const result = [];
    for (let i = 0; i < 10; i++) {
        result.push(i);
    }
    return result;
}

// Use modules
// config.js
export const config = { api: 'v1' };

// app.js
import { config } from './config.js';

// Enable strict mode
'use strict';
result = [];  // ReferenceError: result is not defined

// ESLint no-implicit-globals rule
```

**Severity:** High

---

## Memory Leaks

**Description:** Objects retained in memory longer than needed.

**Symptoms:**
- Growing memory usage over time
- Slow performance after extended use
- Event listeners accumulating
- Closures holding references

**Example (Bad):**
```javascript
// Event listener not removed
class Component {
    constructor() {
        window.addEventListener('resize', this.handleResize);
    }
    // No cleanup method - listener persists after component removed
}

// Closure holding reference
function createHandler(element) {
    const hugeData = new Array(1000000).fill('x');

    return function onClick() {
        // hugeData is retained even if never used
        console.log('clicked');
    };
}

// Growing array
const cache = [];
function addToCache(item) {
    cache.push(item);  // Never cleared
}

// Detached DOM nodes
let element = document.getElementById('myElement');
document.body.removeChild(element);
// element still holds reference to detached DOM
```

**Refactoring:**
```javascript
// Clean up event listeners
class Component {
    constructor() {
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
    }
}

// Don't capture unnecessary data
function createHandler(element) {
    return function onClick() {
        console.log('clicked');
    };
}

// Use WeakMap/WeakSet for object caches
const cache = new WeakMap();
function addToCache(key, value) {
    cache.set(key, value);  // Automatically cleared when key is GC'd
}

// Clear references
let element = document.getElementById('myElement');
document.body.removeChild(element);
element = null;  // Allow garbage collection
```

**Severity:** High

---

## Blocking the Event Loop

**Description:** Synchronous operations blocking the main thread.

**Symptoms:**
- UI freezes during operations
- "Script taking too long" warnings
- Unresponsive page
- Delayed event handling

**Example (Bad):**
```javascript
// Synchronous file operations (Node.js)
const data = fs.readFileSync('/huge/file.json');  // Blocks!

// CPU-intensive loop
function processLargeArray(items) {
    for (const item of items) {
        // Heavy computation
        JSON.parse(JSON.stringify(item));
    }
}
processLargeArray(millionItems);  // Blocks for seconds

// Synchronous XHR (browser, deprecated)
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', false);  // false = synchronous
xhr.send();  // Blocks entire page
```

**Refactoring:**
```javascript
// Async file operations
const data = await fs.promises.readFile('/huge/file.json');

// Chunk processing
async function processLargeArray(items) {
    const chunkSize = 1000;
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        chunk.forEach(item => {
            // Process
        });
        // Yield to event loop
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

// Web Workers for CPU-intensive tasks
const worker = new Worker('processor.js');
worker.postMessage(items);
worker.onmessage = (e) => {
    const result = e.data;
};

// Always use async requests
const response = await fetch('/api/data');
const data = await response.json();
```

**Severity:** High

---

## Promise Anti-Patterns

**Description:** Incorrect or inefficient Promise usage.

**Symptoms:**
- Unhandled promise rejections
- Nested promises when chaining would work
- `async` function not awaited
- Promise constructor anti-pattern

**Example (Bad):**
```javascript
// Promise constructor anti-pattern
function getUser(id) {
    return new Promise((resolve, reject) => {
        fetchUser(id).then(user => {
            resolve(user);  // Unnecessary wrapping
        }).catch(err => {
            reject(err);
        });
    });
}

// Nested promises
getUser(id).then(user => {
    getOrders(user.id).then(orders => {
        // Nested instead of chained
    });
});

// Forgetting await
async function processData() {
    const data = fetchData();  // Missing await!
    return data.items;  // data is a Promise, not the result
}

// Not handling rejections
fetchData().then(process);  // No .catch()

// Sequential when parallel is possible
const user = await getUser(id);
const settings = await getSettings(id);  // Could run in parallel
```

**Refactoring:**
```javascript
// Don't wrap existing promises
function getUser(id) {
    return fetchUser(id);  // Already returns a Promise
}

// Chain instead of nest
getUser(id)
    .then(user => getOrders(user.id))
    .then(orders => processOrders(orders))
    .catch(handleError);

// Always await async operations
async function processData() {
    const data = await fetchData();
    return data.items;
}

// Handle rejections
fetchData()
    .then(process)
    .catch(handleError);

// Or with async/await
try {
    await fetchData().then(process);
} catch (err) {
    handleError(err);
}

// Parallel execution
const [user, settings] = await Promise.all([
    getUser(id),
    getSettings(id)
]);
```

**Severity:** High

---

## this Binding Issues

**Description:** Losing `this` context in callbacks and event handlers.

**Symptoms:**
- `undefined is not a function`
- `Cannot read property of undefined`
- Methods not working as callbacks
- Unexpected `this` values

**Example (Bad):**
```javascript
class Counter {
    constructor() {
        this.count = 0;
    }

    increment() {
        this.count++;
    }
}

const counter = new Counter();
button.addEventListener('click', counter.increment);  // this is button, not counter!

setTimeout(counter.increment, 1000);  // this is undefined/window

[1, 2, 3].forEach(counter.increment);  // this is undefined
```

**Refactoring:**
```javascript
// Arrow function in class field (recommended)
class Counter {
    count = 0;

    increment = () => {
        this.count++;
    };
}

// Bind in constructor
class Counter {
    constructor() {
        this.count = 0;
        this.increment = this.increment.bind(this);
    }

    increment() {
        this.count++;
    }
}

// Arrow wrapper at call site
button.addEventListener('click', () => counter.increment());
setTimeout(() => counter.increment(), 1000);

// .bind() at call site
button.addEventListener('click', counter.increment.bind(counter));
```

**Severity:** Medium

---

## Mutation of Shared State

**Description:** Modifying objects that are passed around or shared.

**Symptoms:**
- Unexpected side effects
- Hard to track data changes
- Race conditions
- Debugging nightmares

**Example (Bad):**
```javascript
// Mutating function parameter
function addDefaults(config) {
    config.timeout = config.timeout || 5000;
    config.retries = config.retries || 3;
    return config;
}

const myConfig = { timeout: 1000 };
const result = addDefaults(myConfig);
console.log(myConfig.retries);  // 3 - original was mutated!

// Array mutation
function getFirst(arr) {
    return arr.shift();  // Mutates original array!
}

// Redux-style state mutation
function reducer(state, action) {
    state.count++;  // Mutation! Should return new state
    return state;
}
```

**Refactoring:**
```javascript
// Create new objects instead of mutating
function addDefaults(config) {
    return {
        timeout: 5000,
        retries: 3,
        ...config  // User values override defaults
    };
}

// Non-mutating array operations
function getFirst(arr) {
    return arr[0];  // Or arr.slice(0, 1)
}

// Immutable state updates
function reducer(state, action) {
    return {
        ...state,
        count: state.count + 1
    };
}

// Use Object.freeze for immutability
const config = Object.freeze({
    timeout: 5000,
    retries: 3
});
config.timeout = 1000;  // Silently fails (or throws in strict mode)

// Immer for complex immutable updates
import produce from 'immer';
const nextState = produce(state, draft => {
    draft.nested.value = 'new';  // Looks mutable but isn't
});
```

**Severity:** High

---

## Inefficient DOM Operations

**Description:** Excessive or poorly batched DOM manipulations.

**Symptoms:**
- Slow rendering
- Layout thrashing
- Choppy animations
- High CPU during scrolling

**Example (Bad):**
```javascript
// Multiple DOM updates causing reflows
for (let i = 0; i < 1000; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    container.appendChild(div);  // 1000 reflows!
}

// Reading then writing in loop (layout thrashing)
for (const el of elements) {
    const height = el.offsetHeight;  // Forces layout
    el.style.height = (height + 10) + 'px';  // Invalidates layout
}

// innerHTML in loop
for (const item of items) {
    container.innerHTML += `<div>${item}</div>`;  // Parses entire HTML each time
}
```

**Refactoring:**
```javascript
// Batch DOM updates with DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    fragment.appendChild(div);
}
container.appendChild(fragment);  // Single reflow

// Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight);  // All reads
elements.forEach((el, i) => {
    el.style.height = (heights[i] + 10) + 'px';  // All writes
});

// Build HTML string then set once
const html = items.map(item => `<div>${item}</div>`).join('');
container.innerHTML = html;

// Use virtual DOM library for complex UIs
// React, Vue, etc. handle this automatically
```

**Severity:** Medium

---

## typeof null Trap

**Description:** Not accounting for `typeof null === 'object'`.

**Symptoms:**
- Null pointer exceptions after type check
- Objects detected when value is null
- Validation logic failing

**Example (Bad):**
```javascript
function processObject(value) {
    if (typeof value === 'object') {
        return value.property;  // TypeError if value is null!
    }
}

processObject(null);  // Crashes
```

**Refactoring:**
```javascript
// Check for null explicitly
function processObject(value) {
    if (typeof value === 'object' && value !== null) {
        return value.property;
    }
}

// Or use truthiness (if null/undefined should be excluded)
function processObject(value) {
    if (value && typeof value === 'object') {
        return value.property;
    }
}

// TypeScript with strict null checks
function processObject(value: object | null) {
    if (value !== null) {
        return value.property;  // TS knows it's not null
    }
}

// Optional chaining
function processObject(value) {
    return value?.property;
}
```

**Severity:** Medium

---

## Detection Checklist

- [ ] Deeply nested callbacks (>3 levels)
- [ ] `==` instead of `===` comparisons
- [ ] Variables without `let`/`const`/`var` declaration
- [ ] Event listeners never removed
- [ ] Synchronous operations blocking main thread
- [ ] Promises without `.catch()` or try/catch
- [ ] Methods used as callbacks without binding
- [ ] Objects/arrays mutated instead of cloned
- [ ] DOM operations inside loops
- [ ] Type checks not accounting for `null`

---

**End of JavaScript Anti-Patterns**

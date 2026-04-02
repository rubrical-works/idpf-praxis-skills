# Fail-Safe File Reading Pattern

## Problem

Reading configuration files can fail in many ways (missing file, invalid JSON, wrong permissions). Apps need a defensive pattern that never throws.

## Solution

Use synchronous file reading with fail-safe null returns for file access. Return typed objects with `found` boolean.

## Pattern

### Module Structure

```typescript
// src/main/config.ts
import * as fs from 'fs';
import * as path from 'path';

export interface ConfigInfo {
  version: string | null;
  name: string | null;
  path: string;
  found: boolean;
}

export function getConfigInfo(configPath: string): ConfigInfo {
  if (!configPath || configPath.trim() === '') {
    return { version: null, name: null, path: '', found: false };
  }

  const manifestPath = path.join(configPath, 'manifest.json');

  try {
    if (!fs.existsSync(manifestPath)) {
      return { version: null, name: null, path: configPath, found: false };
    }

    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    return {
      version: manifest.version || null,
      name: manifest.name || null,
      path: configPath,
      found: true,
    };
  } catch {
    return { version: null, name: null, path: configPath, found: false };
  }
}
```

### IPC Integration

```typescript
// main.ts
ipcMain.handle('config:getInfo', (_event, configPath: string) => {
  return getConfigInfo(configPath);
});
```

## Error Handling Strategy

| Condition | Return |
|-----------|--------|
| Empty path | `{ found: false }` |
| Path doesn't exist | `{ found: false }` |
| Config file doesn't exist | `{ found: false }` |
| Invalid JSON | `{ found: false }` |
| Valid config | `{ found: true, version: "x.y.z" }` |

## Rationale

- **Synchronous:** Config files are small; sync read is simpler and fast enough
- **Fail-safe:** Always returns a valid object, never throws
- **Defensive:** Checks for empty paths, missing files, invalid JSON
- **Typed:** Returns structured object with `found` boolean for UI logic

## UI Display Logic

```typescript
const info = await window.electronAPI.getConfigInfo(path);

if (info.found && info.version) {
  display.textContent = `v${info.version}`;
  display.classList.add('found');
} else {
  display.textContent = 'Not Found';
  display.classList.add('not-found');
}
```

## Generic Version

```typescript
export function readJsonFile<T>(filePath: string): { found: boolean; data?: T } {
  try {
    if (!fs.existsSync(filePath)) {
      return { found: false };
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content) as T;
    return { found: true, data };
  } catch {
    return { found: false };
  }
}
```

## Consequences

- Renderer must handle "Not Found" state gracefully
- Updates require re-fetching (no file watching)
- All errors are silent (logged to console if needed)
- Caller never needs try/catch

# electron-store Settings Persistence

## Overview

Use `electron-store` for cross-platform settings persistence in Electron apps.

## Installation

```bash
npm install electron-store
```

## Basic Usage

### Main Process

```typescript
// src/main/settings.ts
import Store from 'electron-store';

interface Settings {
  setupCompleted: boolean;
  frameworkPath: string;
  repoUrl: string;
  theme: 'light' | 'dark' | 'system';
}

const store = new Store<Settings>({
  name: 'app-settings',  // Creates app-settings.json
  defaults: {
    setupCompleted: false,
    frameworkPath: '',
    repoUrl: '',
    theme: 'system',
  },
});

export function getSettings(): Settings {
  return store.store;  // Returns all settings
}

export function saveSettings(settings: Partial<Settings>): void {
  Object.entries(settings).forEach(([key, value]) => {
    store.set(key, value);
  });
}

export function clearSettings(): void {
  store.clear();
}

export function isFirstRun(): boolean {
  return !store.get('setupCompleted');
}
```

### IPC Integration

```typescript
// main.ts
import { ipcMain } from 'electron';
import { getSettings, saveSettings, isFirstRun, clearSettings } from './main/settings';

ipcMain.handle('settings:get', () => getSettings());
ipcMain.handle('settings:save', (_event, settings) => {
  saveSettings(settings);
  return { success: true };
});
ipcMain.handle('settings:isFirstRun', () => isFirstRun());

// For testing
if (process.env.CLEAR_CONFIG === 'true') {
  clearSettings();
}
```

### Preload

```typescript
// preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  isFirstRun: () => ipcRenderer.invoke('settings:isFirstRun'),
});
```

## Storage Locations

| Platform | Path |
|----------|------|
| Windows | `%APPDATA%/{productName}/app-settings.json` |
| macOS | `~/Library/Application Support/{productName}/app-settings.json` |
| Linux | `~/.config/{productName}/app-settings.json` |

The `productName` comes from package.json.

## Schema Validation (Optional)

```typescript
const store = new Store<Settings>({
  schema: {
    frameworkPath: {
      type: 'string',
      default: '',
    },
    theme: {
      type: 'string',
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
  },
});
```

## Migration Support

```typescript
const store = new Store<Settings>({
  migrations: {
    '1.0.0': (store) => {
      // Migrate from old format
      if (store.has('oldKey')) {
        store.set('newKey', store.get('oldKey'));
        store.delete('oldKey');
      }
    },
  },
});
```

## Best Practices

1. **Type your store:** Use TypeScript interface for settings
2. **Provide defaults:** All settings should have sensible defaults
3. **Use getters/setters:** Wrap store access in functions
4. **Expose via IPC:** Never import electron-store in renderer

## Consequences

- Settings persist across app restarts
- No database needed for simple settings
- JSON format readable by users
- Clear path for migration as app evolves

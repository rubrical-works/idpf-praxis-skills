# electron-store Settings Persistence
## Overview
Cross-platform settings persistence for Electron apps with `electron-store`.
## Installation
```bash
npm install electron-store
```
**Requirements (electron-store v12):**
- **ESM-only.** Native ESM since v9 with no CommonJS export, so `require('electron-store')` fails. Either the main process is ESM, or it is bundled (the Electron Forge Vite plugin's main build resolves the ESM import into the bundle). For an unbundled CommonJS main process, pin an older major.
- **Electron 35 or later.** v12 requires it; on older Electron, pin a compatible major.
- **Main process only.** Importing from a renderer or preload script fails; reach it through IPC.
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
`productName` comes from package.json.
## Schema Validation (Optional)
Since v10 the `schema` option is validated as JSON Schema **draft 2020-12** (previously draft-07). Keywords that changed between drafts — `definitions` → `$defs`, array-form `items` → `prefixItems` — must use the 2020-12 form.
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
electron-store v12 is built on **conf 16**, which changed migration handling, `.get()` key validation and how `name`/`cwd` are resolved. Check the conf 16 release notes before upgrading a store that already has migrations.
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
1. **Type your store:** TypeScript interface for settings
2. **Provide defaults:** every setting has a sensible default
3. **Use getters/setters:** wrap store access in functions
4. **Expose via IPC:** never import electron-store in the renderer
## Consequences
Settings persist across restarts; no database needed for simple settings; JSON readable by users; clear migration path as the app evolves.

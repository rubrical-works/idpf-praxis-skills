# Electron IPC Communication Pattern

## Pattern Overview

Use the three-layer IPC pattern for secure main-renderer communication:

1. `ipcMain.handle()` in main process
2. `contextBridge.exposeInMainWorld()` in preload
3. Type declarations in `preload.d.ts`

## Implementation

### Main Process (main.ts)

```typescript
import { ipcMain } from 'electron';
import { getSettings, saveSettings } from './main/settings';

ipcMain.handle('settings:get', () => getSettings());
ipcMain.handle('settings:save', (_event, settings) => {
  saveSettings(settings);
  return { success: true };
});
```

### Preload Script (preload.ts)

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Partial<AppSettings>): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('settings:save', settings),
});
```

### Type Declarations (preload.d.ts)

```typescript
export interface ElectronAPI {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

### Renderer Usage (index.ts)

```typescript
import './preload.d.ts';  // Import for type checking

const settings = await window.electronAPI.getSettings();
await window.electronAPI.saveSettings({ frameworkPath: '/path' });
```

## Channel Naming Convention

Use namespaced channels: `{domain}:{action}`

- `settings:get`, `settings:save`, `settings:isFirstRun`
- `dialog:selectDirectory`
- `app:getVersion`

## Benefits

- **Security:** contextBridge prevents direct IPC exposure
- **Type Safety:** Declaration file provides full IntelliSense
- **Separation:** Business logic stays in main process modules
- **Testability:** Main process modules can be unit tested independently

## Consequences

- Requires maintaining type declarations alongside preload
- All renderer-to-main communication must go through exposed API
- Enables sandbox mode for enhanced security

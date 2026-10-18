# Vite Renderer Output Path
## Problem
With Electron Forge + Vite and `root` in `vite.renderer.config.ts` set to a subdirectory (e.g., `src/renderer`), build output goes to the wrong location.
**Symptom:** packaged app shows a blank window — renderer files not included in the ASAR.
## Root Cause
Vite's `root` affects where output is placed. With `root: 'src/renderer'`, output goes to `src/renderer/.vite/` instead of the project root's `.vite/` where Electron Forge expects it.
## Solution
Set `build.outDir` to an absolute path explicitly:
```typescript
// vite.renderer.config.ts
import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
  root: 'src/renderer',
  build: {
    outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
    emptyOutDir: true,
  },
});
```
## Detection Pattern
If `vite.renderer.config.ts` has `root:` set to a non-project-root path, verify:
1. `build.outDir` is also explicitly set
2. It points to the correct absolute path
3. Electron Forge's expected output location matches
## Verification
After packaging, check the ASAR contents:
```bash
npx @electron/asar list out/YourApp-win32-x64/resources/app.asar | grep -i renderer
```
Use `@electron/asar` — the unscoped `asar` package is deprecated and frozen at 3.2.0 (same CLI, renamed package). Output should list renderer files like `index.html` and bundled JS.

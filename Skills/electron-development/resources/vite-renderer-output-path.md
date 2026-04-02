# Vite Renderer Output Path

## Problem

When using Electron Forge with Vite and setting `root` in `vite.renderer.config.ts` to a subdirectory (e.g., `src/renderer`), the build output goes to the wrong location.

**Symptom:** Packaged app shows blank window - renderer files not included in ASAR.

## Root Cause

Vite's `root` setting affects where output is placed. With `root: 'src/renderer'`, output goes to `src/renderer/.vite/` instead of the project root's `.vite/` where Electron Forge expects it.

## Solution

Explicitly set `build.outDir` to an absolute path:

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

If your `vite.renderer.config.ts` has `root:` set to a non-project-root path, verify:
1. `build.outDir` is also explicitly set
2. It points to the correct absolute path
3. Electron Forge's expected output location matches

## Verification

After packaging, check the ASAR contents:

```bash
npx asar list out/YourApp-win32-x64/resources/app.asar | grep -i renderer
```

Should show renderer files like `index.html`, bundled JS, etc.

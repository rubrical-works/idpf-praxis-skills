# Electron App Naming Conventions
## Problem
App names with spaces cause issues on Windows when Playwright launches the packaged executable, Git Bash commands reference the path, or CI scripts parse paths.
## Symptoms
- Playwright `electron.launch()` hangs or fails silently
- Git Bash commands fail with path parsing errors
**Not a naming symptom:** `DEP0190: Passing args to a child process with shell option true` is a Node 24+ deprecation raised whenever `child_process.spawn`/`execFile` is called with an `args` array and `shell: true`, whatever the path. Playwright's Electron launcher does this on Windows, so renaming the app does not remove it.
## Solution
Separate executable and display names:
| Name Type | Convention | Example |
|-----------|------------|---------|
| Executable | No spaces, PascalCase or kebab-case | `PraxisManager` |
| Display | Full name with spaces | `Praxis Project Manager` |
## Configuration
**package.json:**
```json
{
  "name": "my-app",
  "productName": "MyApp"
}
```
**forge.config.ts:**
```typescript
packagerConfig: {
  name: 'MyApp',  // Executable name (no spaces)
},
```
**HTML title (display name):**
```html
<title>My App Name</title>
```
## Result
| Location | Shows |
|----------|-------|
| Executable file | `MyApp.exe` |
| Window title bar | `My App Name` |
| Taskbar/Dock | `My App Name` (from HTML title) |
| Output directory | `out/MyApp-<platform>-<arch>/` (e.g. `out/MyApp-win32-x64/`, `out/MyApp-darwin-arm64/`) |
## Detection Pattern
If the app name in `package.json` or `forge.config.ts` contains spaces, warn about Playwright E2E tests, CI scripts and Git Bash commands.
## E2E Test Path Helper
```typescript
const APP_EXECUTABLE_NAME = 'MyApp';  // No spaces

function getExecutablePath(): string {
  // Forge names the folder <name>-<platform>-<arch>, arch defaulting to the host's
  const outDir = path.join(__dirname, '..', 'out', `${APP_EXECUTABLE_NAME}-${process.platform}-${process.arch}`);

  if (process.platform === 'win32') {
    return path.join(outDir, `${APP_EXECUTABLE_NAME}.exe`);
  } else if (process.platform === 'darwin') {
    return path.join(outDir, `${APP_EXECUTABLE_NAME}.app`, 'Contents', 'MacOS', APP_EXECUTABLE_NAME);
  } else {
    return path.join(outDir, APP_EXECUTABLE_NAME.toLowerCase());
  }
}
```

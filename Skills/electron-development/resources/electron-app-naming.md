# Electron App Naming Conventions

## Problem

Electron app names with spaces cause issues on Windows when:
- Playwright tries to launch the packaged executable
- Git Bash commands reference the path
- CI scripts parse paths

## Symptoms

- Playwright `electron.launch()` hangs or fails silently
- Git Bash commands fail with path parsing errors
- Deprecation warning: `DEP0190: Passing args to a child process with shell option true`

## Solution

Use separate names for executable and display:

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
| Output directory | `out/MyApp-win32-x64/` |

## Detection Pattern

If app name in `package.json` or `forge.config.ts` contains spaces, warn about potential issues with:
- Playwright E2E tests
- CI scripts
- Git Bash commands

## E2E Test Path Helper

```typescript
const APP_EXECUTABLE_NAME = 'MyApp';  // No spaces

function getExecutablePath(): string {
  const basePath = path.join(__dirname, '..', 'out');

  if (process.platform === 'win32') {
    return path.join(basePath, `${APP_EXECUTABLE_NAME}-win32-x64`, `${APP_EXECUTABLE_NAME}.exe`);
  } else if (process.platform === 'darwin') {
    return path.join(basePath, `${APP_EXECUTABLE_NAME}-darwin-x64`,
      `${APP_EXECUTABLE_NAME}.app`, 'Contents', 'MacOS', APP_EXECUTABLE_NAME);
  } else {
    return path.join(basePath, `${APP_EXECUTABLE_NAME}-linux-x64`,
      APP_EXECUTABLE_NAME.toLowerCase());
  }
}
```

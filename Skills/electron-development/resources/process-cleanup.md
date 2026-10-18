# Process Cleanup Before Rebuild
## Problem
A running Electron app — the packaged build or the `Electron` dev binary — holds file handles on its install directory and build output. Removing `.vite/` or `out/` while it runs fails, and the failure looks like a filesystem problem rather than a process problem.
The fix is the same on every host: stop the app, wait briefly for handles to release, then clean. What differs is the kill command and the quoting it needs.
## Detection
Build or clean fails with:
- `cannot remove '...app.asar': Device or resource busy`
- `cannot remove '...v8_context_snapshot.bin': Device or resource busy`
- `EBUSY: resource busy or locked` (Windows, from Node)
- `EPERM: operation not permitted` on a file you own (Windows)
Any of these means a process is still running with the file open.
## Recommended Sequence
```bash
# 1. Stop the packaged app (use your productName)
# 2. Stop any stray dev-binary processes
# 3. Wait for handles to release
sleep 2
# 4. Clean build directories one at a time
rm -rf .vite
rm -rf out
```
Steps 1 and 2 are per-OS below. Step 4 is one directory per command because Git Bash on Windows handles multi-path `rm -rf` badly; keeping the habit everywhere costs nothing.
## Windows
Git Bash rewrites Windows command syntax before the command runs. Use PowerShell with **single quotes** so the string reaches PowerShell verbatim.
```bash
powershell -Command 'Stop-Process -Name "YourAppName" -Force -ErrorAction SilentlyContinue'
powershell -Command 'Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue'
```
`-Name` takes the process name without `.exe`. `-ErrorAction SilentlyContinue` makes the command a no-op when nothing is running, so it is safe in scripts.
### What fails in Git Bash
| Attempt | Problem |
|---------|---------|
| `taskkill /F /IM "electron.exe"` | Git Bash interprets `/F` as a path (`F:/`) |
| `cmd //c 'taskkill ...'` | Spaces in process name not handled |
| `taskkill /F /FI "IMAGENAME eq ..."` | Git Bash mangles filter syntax |
| `powershell -Command "... $_.Name ..."` | Git Bash expands `$_` before PowerShell sees it |
**Why single quotes matter:** with double quotes Git Bash processes the string first, expanding `$variables`; with single quotes it passes through untouched.
## macOS
```bash
pkill -x "YourAppName" || true   # packaged app
pkill -x "Electron" || true      # dev binary from node_modules/electron
```
- `pkill -x` matches the whole process name; `pkill -f electron` matches the full command line and also catches an unrelated process whose path contains `electron`.
- `killall "YourAppName"` is equivalent to `pkill -x` here.
- The packaged app is a bundle; the process name is the executable inside `YourAppName.app/Contents/MacOS/`, which is your `productName`.
- `|| true` keeps a script going when nothing was running (`pkill` exits 1 then).
## Linux
```bash
pkill -x "yourappname" || true   # packaged app — often lowercased by the packager
pkill -f electron || true        # dev binary
```
- Check the actual executable name in `out/YourAppName-linux-<arch>/` before relying on a casing; Electron Forge commonly lowercases it, electron-builder uses `executableName` or `name`.
- If installed from a `.deb`, the process name is the package's executable name, not the project directory name.
- `fuser -v .vite out` (from `psmisc`) lists any process still holding files under those paths if a kill did not release them.
## In an npm Script
Pick the command by platform rather than shipping three scripts:
```json
{
  "scripts": {
    "clean:procs": "node scripts/kill-app.js"
  }
}
```
```javascript
// scripts/kill-app.js
const { spawnSync } = require('node:child_process');
const name = 'YourAppName';

if (process.platform === 'win32') {
  spawnSync('powershell', ['-Command', `Stop-Process -Name "${name}" -Force -ErrorAction SilentlyContinue`], { stdio: 'inherit' });
  spawnSync('powershell', ['-Command', 'Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue'], { stdio: 'inherit' });
} else {
  spawnSync('pkill', ['-x', process.platform === 'darwin' ? name : name.toLowerCase()], { stdio: 'inherit' });
  spawnSync('pkill', ['-x', process.platform === 'darwin' ? 'Electron' : 'electron'], { stdio: 'inherit' });
}
```
An argument array keeps the PowerShell command intact without the Git Bash quoting problem: no shell sits between Node and PowerShell.

# Windows Process Kill Pattern

## Problem

Electron processes on Windows lock files, causing rebuild failures. Standard Windows commands don't work in Git Bash.

## What Fails in Git Bash

| Attempt | Problem |
|---------|---------|
| `taskkill /F /IM "electron.exe"` | Git Bash interprets `/F` as a path (`F:/`) |
| `cmd //c 'taskkill ...'` | Spaces in process name not handled |
| `taskkill /F /FI "IMAGENAME eq ..."` | Git Bash mangles filter syntax |
| `powershell -Command "... $_.Name ..."` | Git Bash expands `$_` before PowerShell sees it |

## Solution

Use PowerShell with **single quotes** to pass command verbatim:

```bash
powershell -Command 'Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue'
```

**Why single quotes matter:**
- Double quotes: Git Bash processes the string first, expanding `$variables`
- Single quotes: String passed verbatim to PowerShell

## Recommended Cleanup Sequence

```bash
# 1. Kill app processes (use your app name)
powershell -Command 'Stop-Process -Name "YourAppName" -Force -ErrorAction SilentlyContinue'

# 2. Kill any stray Electron processes
powershell -Command 'Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue'

# 3. Wait briefly for file handles to release
sleep 2

# 4. Clean build directories ONE AT A TIME
rm -rf .vite
rm -rf out
```

## macOS/Linux Alternative

```bash
pkill -f electron || true
sleep 2
rm -rf .vite out
```

## Detection

Build fails with:
- `cannot remove '...app.asar': Device or resource busy`
- `cannot remove '...v8_context_snapshot.bin': Device or resource busy`

These errors mean processes are still running holding file handles.

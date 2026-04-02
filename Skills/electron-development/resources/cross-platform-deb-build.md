# Cross-Platform .deb Build from Windows

## Problem

Electron apps targeting Linux need `.deb` packages, but the packaging toolchain (`fpm`, a Ruby gem) isn't available natively on Windows. Running `electron-builder --linux deb` on Windows fails:

```
Error: Cannot find "fpm"
```

## What Fails on Windows

| Attempt | Problem |
|---------|---------|
| `npx electron-builder --linux deb` | `fpm` not available — Linux-only toolchain |
| `docker run -v "$(pwd):/project" ...` | Git Bash mangles `$(pwd)` into a Windows path |
| Docker with `-w /project` | MSYS2 rewrites `/project` to `C:/Program Files/Git/project` |

## Solution: Docker-Based Build (Recommended)

Use a standard Node.js Docker image — electron-builder auto-downloads `fpm` inside the Linux container:

```bash
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$(pwd):/project" \
  -w /project \
  node:22 \
  npx electron-builder --linux deb --config electron-builder.yml
```

**Key details:**
- `MSYS_NO_PATHCONV=1` — Prevents Git Bash from rewriting `/project` as a Windows path
- `--rm` — Removes the container after the build completes
- `-v "$(pwd):/project"` — Bind-mounts the project directory into the container
- `node:22` — Base image (~1 GB); electron-builder auto-downloads `fpm` 1.17.0 at build time
- First run pulls the `node:22` image and caches it; subsequent runs reuse it
- Output lands in `dist/` on the host via the bind mount (e.g., `your-app_1.0.0_amd64.deb`, ~91 MB)

**Alternative image:** `electronuserland/builder:wine` bundles `fpm`, `wine`, and Linux build tools pre-installed (larger image, no auto-download step).

## Alternative: WSL-Based Build

If Docker isn't available, use WSL (Windows Subsystem for Linux):

```bash
# From WSL terminal (not Git Bash)
cd /mnt/e/Projects/your-app
npx electron-builder --linux deb --config electron-builder.yml
```

**Prerequisites in WSL:**
- Node.js and npm installed inside WSL
- `fpm` gem: `sudo apt-get install ruby-dev build-essential && sudo gem install fpm`
- Project dependencies installed: `npm install`

## Alternative: GitHub Actions CI Build

Offload Linux packaging to CI where native tooling is available:

```yaml
# .github/workflows/build-linux.yml
name: Build Linux
on:
  push:
    tags: ['v*']

jobs:
  build-deb:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx electron-builder --linux deb --config electron-builder.yml
      - uses: actions/upload-artifact@v4
        with:
          name: linux-deb
          path: dist/*.deb
```

## Pre-Commit / Local CI Integration

When integrating .deb builds into a local build script or pre-commit hook on Windows:

**Before (naive — silently skips):**
```bash
# Runs electron-builder directly, fails on Windows, treats failure as acceptable skip
npx electron-builder --linux deb --config electron-builder.yml || echo "Skipped (fpm not found)"
```

**After (Docker-aware — graceful fallback):**
```bash
# Runs inside Docker where fpm is available; skips only if Docker itself is unavailable
if command -v docker &>/dev/null; then
  MSYS_NO_PATHCONV=1 docker run --rm \
    -v "$(pwd):/project" -w /project node:22 \
    npx electron-builder --linux deb --config electron-builder.yml
else
  echo "Skipped .deb build (Docker not available)"
fi
```

**Key difference:** The skip condition changes from "fpm not found" (always true on Windows) to "Docker not available" (only true when Docker Desktop isn't running). This means the .deb build actually runs on Windows machines that have Docker.

## Common Pitfalls

| Pitfall | Cause | Fix |
|---------|-------|-----|
| Docker path error `C:/Program Files/Git/project` | MSYS2 auto-converts `/` paths | Set `MSYS_NO_PATHCONV=1` |
| Symlink errors in Docker | Windows volume mounts don't support Linux symlinks | Use `--config` flag to avoid symlink-dependent features |
| Permission errors on `.deb` contents | Windows filesystem has no Unix permissions | Docker build handles this; for WSL, ensure files are on Linux filesystem |
| Native dependency mismatch | `node_modules` built for Windows | Run `npm install` inside Docker/WSL, not on Windows host |

## Testing the .deb Output

```bash
# In WSL or Linux VM
sudo dpkg -i dist/your-app_1.0.0_amd64.deb
your-app  # Launch to verify

# Or in Docker
docker run --rm -v "E:/Projects/your-app/dist:/dist" ubuntu:22.04 \
  bash -c "dpkg -i /dist/*.deb && dpkg -l | grep your-app"
```

## Detection

Build fails with any of:
- `Cannot find "fpm"` — Missing Linux packaging tool
- `is invalid, it needs to be an absolute path` — Docker path mangling
- `ENOENT: no such file or directory` during packaging — Native dependency mismatch

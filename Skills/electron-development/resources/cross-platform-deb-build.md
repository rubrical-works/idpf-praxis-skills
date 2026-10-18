# Linux .deb Build from a Windows Host
Covers **one host/target pairing: a Windows development host building a Linux `.deb` target.** On a Linux host `electron-builder --linux deb` runs natively; on macOS the Docker and CI routes below work unchanged, minus the Git Bash path caveats. Other pairings (Windows installers from Linux or macOS, macOS targets from anywhere) belong to the `electron-cross-build` skill.
## Problem
`.deb` packaging needs `fpm` (a Ruby gem) that isn't available natively on Windows, so `electron-builder --linux deb` fails:
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
A standard Node.js image — electron-builder auto-downloads `fpm` inside the Linux container:
```bash
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$(pwd):/project" \
  -w /project \
  node:22 \
  npx electron-builder --linux deb --config electron-builder.yml
```
- `MSYS_NO_PATHCONV=1` — prevents Git Bash rewriting `/project` as a Windows path
- `--rm` — removes the container after the build
- `-v "$(pwd):/project"` — bind-mounts the project directory
- `node:22` — base image (~1 GB); electron-builder auto-downloads `fpm` 1.17.0 at build time; first run pulls and caches the image
- Output lands in `dist/` on the host via the bind mount (e.g., `your-app_1.0.0_amd64.deb`, ~91 MB)
**Alternative image:** `electronuserland/builder:wine` bundles `fpm`, `wine`, and Linux build tools (larger image, no auto-download step).
## Alternative: WSL-Based Build
```bash
# From WSL terminal (not Git Bash)
cd /mnt/e/Projects/your-app
npx electron-builder --linux deb --config electron-builder.yml
```
**Prerequisites in WSL:** Node.js and npm inside WSL; `fpm` gem (`sudo apt-get install ruby-dev build-essential && sudo gem install fpm`); `npm install` run there.
## Alternative: GitHub Actions CI Build
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
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
      - run: npm ci
      - run: npx electron-builder --linux deb --config electron-builder.yml
      - uses: actions/upload-artifact@v7
        with:
          name: linux-deb
          path: dist/*.deb
```
The v7 majors run on the Node 24 action runtime; v4 declared `node20`, which GitHub-hosted runners removed on 2026-09-23. `node-version: 24` is the active LTS (22 is in maintenance until 2027-04-30; Node 20 reached end of life on 2026-03-24). The Docker examples use `node:22`, also supported.
## Pre-Commit / Local CI Integration
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
The skip condition changes from "fpm not found" (always true on Windows) to "Docker not available", so the build actually runs on Windows machines with Docker.
## Common Pitfalls
| Pitfall | Cause | Fix |
|---------|-------|-----|
| Docker path error `C:/Program Files/Git/project` | MSYS2 auto-converts `/` paths | Set `MSYS_NO_PATHCONV=1` |
| Symlink errors in Docker | Windows volume mounts don't support Linux symlinks | Use `--config` flag to avoid symlink-dependent features |
| Permission errors on `.deb` contents | Windows filesystem has no Unix permissions | Docker build handles this; for WSL, keep files on the Linux filesystem |
| Native dependency mismatch | `node_modules` built for Windows | Run `npm install` inside Docker/WSL, not on the Windows host |
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
Build fails with: `Cannot find "fpm"` (missing Linux packaging tool); `is invalid, it needs to be an absolute path` (Docker path mangling); `ENOENT: no such file or directory` during packaging (native dependency mismatch).

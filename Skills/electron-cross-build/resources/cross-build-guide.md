# Cross-Build Guide: Linux to Windows Electron Builds

This guide covers the complete workflow for building Windows Electron executables from a Linux host.

---

## 1. Toolchain Setup

### Wine Installation

Wine is required for NSIS installer generation and code signing on Linux.

```bash
# Ubuntu/Debian
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine wine32 wine64

# Initialize Wine prefix
wineboot --init
```

Verify installation:
```bash
wine --version
```

### Docker-Based Builds

Docker eliminates host dependency management. Use the official `electronuserland/builder` images:

```bash
# Basic build with Wine support
docker run --rm \
  -v "$(pwd):/project" \
  -w /project \
  electronuserland/builder:wine \
  bash -c "npm ci && npx electron-builder --win --x64"

# Multi-platform build
docker run --rm \
  -v "$(pwd):/project" \
  -w /project \
  electronuserland/builder:wine \
  bash -c "npm ci && npx electron-builder --linux --win"
```

Available Docker images:
| Image | Use Case |
|-------|----------|
| `electronuserland/builder:wine` | Windows builds from Linux |
| `electronuserland/builder:wine-mono` | Windows builds with .NET support |
| `electronuserland/builder:wine-chrome` | Includes Chrome for testing |

### NSIS Installation

NSIS (Nullsoft Scriptable Install System) is needed for generating `.exe` installers:

```bash
# Ubuntu/Debian
sudo apt install -y nsis

# Verify
makensis -VERSION
```

electron-builder can also auto-download NSIS, but a system installation is more reliable for CI environments.

---

## 2. electron-builder Configuration

### Basic Cross-Platform Config

```yaml
# electron-builder.yml
appId: com.example.myapp
productName: MyApp

linux:
  target:
    - AppImage
    - deb
  category: Utility

win:
  target:
    - target: nsis
      arch:
        - x64
        - ia32
  icon: build/icon.ico
  publisherName: "Your Company"

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
```

### Build Commands

```bash
# Build only Windows from Linux
npx electron-builder --win --x64

# Build both Linux and Windows
npx electron-builder --linux --win

# Build with specific config
npx electron-builder --win --x64 --config electron-builder.yml
```

### Platform-Specific Files

Place platform-specific resources in the `build/` directory:

```
build/
  icon.icns          # macOS
  icon.ico           # Windows
  icon.png           # Linux (256x256 minimum)
  background.png     # DMG background
  installerSidebar.bmp  # NSIS sidebar (164x314)
```

---

## 3. Electron Forge Configuration

### Makers for Windows from Linux

```javascript
// forge.config.js
module.exports = {
  packagerConfig: {
    icon: './build/icon', // No extension - Forge adds per platform
  },
  makers: [
    // ZIP maker works on all platforms without Wine
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'linux'],
    },
    // Squirrel maker requires Wine on Linux
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'MyApp',
        setupIcon: './build/icon.ico',
      },
      platforms: ['win32'],
    },
  ],
};
```

### Build Commands

```bash
# Package for Windows
npx electron-forge package --platform=win32 --arch=x64

# Make distributables for Windows
npx electron-forge make --platform=win32 --arch=x64
```

**Limitation:** Electron Forge's Squirrel.Windows maker has limited Linux support. For full installer generation from Linux, electron-builder with NSIS is more reliable.

---

## 4. Native Module Handling

### The Problem

Native Node.js modules compiled with node-gyp are platform-specific. A module compiled on Linux will not work on Windows.

### Solution: prebuild-install

Modules that ship prebuilt binaries (via `prebuild` or `prebuild-install`) are downloaded for the target platform automatically during packaging.

```json
{
  "dependencies": {
    "better-sqlite3": "^9.0.0"
  }
}
```

electron-builder and Electron Forge handle downloading the correct prebuilt binary for the target platform.

### Solution: Rebuild for Target

If prebuilds are not available, use electron-rebuild with target platform flags:

```bash
# Rebuild native modules for Windows x64
npx electron-rebuild --platform=win32 --arch=x64
```

For electron-builder, native module rebuilding is automatic when the `electronVersion` is specified.

### Common Native Modules

| Module | Prebuilds Available? | Notes |
|--------|---------------------|-------|
| `better-sqlite3` | Yes | Works cross-platform |
| `node-pty` | Yes | Prebuilds for major platforms |
| `keytar` | Yes | Credential storage |
| `sharp` | Yes | Image processing |
| `serialport` | Yes | Serial port access |
| Custom C++ addons | No | Must cross-compile or use Docker |

---

## 5. Windows Installer Generation (NSIS)

### NSIS from Linux

electron-builder uses NSIS to create Windows installers. On Linux, this requires:
1. The `nsis` system package (or electron-builder's bundled NSIS)
2. Wine (for some NSIS plugins)

### Configuration

```yaml
# electron-builder.yml
nsis:
  oneClick: false
  perMachine: false
  allowElevation: true
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: "My Application"
  installerIcon: build/installerIcon.ico
  uninstallerIcon: build/uninstallerIcon.ico
  installerSidebar: build/installerSidebar.bmp
  license: LICENSE
```

### Custom NSIS Script

For advanced installer behavior, provide a custom NSIS include script:

```yaml
nsis:
  include: build/installer.nsh
```

```nsis
; build/installer.nsh
!macro customInstall
  ; Add custom registry entries, file associations, etc.
  WriteRegStr HKCU "Software\MyApp" "InstallPath" "$INSTDIR"
!macroend
```

---

## 6. Code Signing

### The Challenge

Windows code signing typically requires `signtool.exe`, a Windows-only tool. From Linux, there are several approaches.

### Option A: signtool via Wine

```bash
# Install signtool in Wine prefix
winetricks dotnet48

# Sign with PFX certificate
wine signtool.exe sign /f certificate.pfx /p password /t http://timestamp.digicert.com /fd sha256 "path/to/app.exe"
```

electron-builder supports this natively:

```yaml
# electron-builder.yml
win:
  signingHashAlgorithms:
    - sha256
  certificateFile: certificate.pfx
  certificatePassword: ${WIN_CSC_KEY_PASSWORD}
```

```bash
# Set environment variables
export CSC_LINK=certificate.pfx
export CSC_KEY_PASSWORD=your-password
npx electron-builder --win
```

### Option B: Cloud Signing Services

Cloud-based signing avoids Wine entirely and keeps private keys secure.

**SSL.com eSigner:**
```yaml
# electron-builder.yml
win:
  sign: ./sign.js  # Custom sign script
```

```javascript
// sign.js
exports.default = async function (configuration) {
  const { execSync } = require('child_process');
  execSync(`CodeSignTool sign \
    -credential_id="${process.env.SSL_COM_CREDENTIAL_ID}" \
    -username="${process.env.SSL_COM_USERNAME}" \
    -password="${process.env.SSL_COM_PASSWORD}" \
    -totp_secret="${process.env.SSL_COM_TOTP}" \
    -input_file_path="${configuration.path}"`, { stdio: 'inherit' });
};
```

**Azure SignTool (azuresigntool):**
```bash
# Install .NET tool
dotnet tool install --global AzureSignTool

# Sign
azuresigntool sign \
  --azure-key-vault-url https://your-vault.vault.azure.net \
  --azure-key-vault-client-id $AZURE_CLIENT_ID \
  --azure-key-vault-client-secret $AZURE_CLIENT_SECRET \
  --azure-key-vault-tenant-id $AZURE_TENANT_ID \
  --azure-key-vault-certificate $CERT_NAME \
  --timestamp-rfc3161 http://timestamp.digicert.com \
  --file-digest sha256 \
  "path/to/app.exe"
```

### Option C: osslsigncode (Linux-native)

`osslsigncode` is a Linux-native tool for Authenticode signing:

```bash
# Install
sudo apt install -y osslsigncode

# Sign with PFX
osslsigncode sign \
  -pkcs12 certificate.pfx \
  -pass "password" \
  -t http://timestamp.digicert.com \
  -h sha256 \
  -in app-unsigned.exe \
  -out app.exe
```

---

## 7. CI/CD Pipeline Example

### GitHub Actions: Linux to Windows Build

```yaml
name: Build Windows from Linux

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install system dependencies
        run: |
          sudo dpkg --add-architecture i386
          sudo apt-get update
          sudo apt-get install -y wine64 wine32 nsis

      - name: Install project dependencies
        run: npm ci

      - name: Build Windows installer
        env:
          CSC_LINK: ${{ secrets.WIN_CERTIFICATE_BASE64 }}
          CSC_KEY_PASSWORD: ${{ secrets.WIN_CERTIFICATE_PASSWORD }}
        run: npx electron-builder --win --x64

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: dist/*.exe
```

### Docker-Based CI Pipeline

```yaml
name: Build with Docker

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest

    container:
      image: electronuserland/builder:wine

    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Build all platforms
        run: |
          npx electron-builder --linux --x64
          npx electron-builder --win --x64

      - name: Upload Windows artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: dist/*.exe

      - name: Upload Linux artifacts
        uses: actions/upload-artifact@v4
        with:
          name: linux-build
          path: |
            dist/*.AppImage
            dist/*.deb
```

---

## 8. Testing Strategies

### Wine-Based Smoke Testing

Run the built Windows executable under Wine for basic smoke tests:

```bash
# Run the portable executable
wine ./dist/MyApp-1.0.0.exe --smoke-test

# Check exit code
if [ $? -eq 0 ]; then
  echo "Smoke test passed"
else
  echo "Smoke test failed"
  exit 1
fi
```

**Limitations:**
- Wine does not perfectly emulate Windows; some APIs behave differently
- GPU-accelerated rendering may not work
- Windows-specific system calls may fail
- Suitable for startup verification, not full functional testing

### VM-Based Testing

For thorough testing, use Windows VMs:

```bash
# Using QEMU
qemu-system-x86_64 \
  -m 4096 \
  -drive file=windows.qcow2,format=qcow2 \
  -cdrom virtio-win.iso \
  -net nic -net user,hostfwd=tcp::5985-:5985

# Copy installer to VM and run tests via WinRM
```

### CI with Windows Runners

For full integration testing, use a separate Windows job:

```yaml
test-windows:
  needs: build-windows
  runs-on: windows-latest

  steps:
    - name: Download installer
      uses: actions/download-artifact@v4
      with:
        name: windows-installer

    - name: Install application
      run: |
        Start-Process -Wait -FilePath "MyApp-Setup-1.0.0.exe" -ArgumentList "/S"
      shell: powershell

    - name: Run smoke tests
      run: |
        & "C:\Program Files\MyApp\MyApp.exe" --smoke-test
      shell: powershell
```

---

## Troubleshooting

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| `Cannot find module 'node-gyp'` | Native module rebuild failed | Install build tools: `apt install build-essential` |
| `wine: command not found` | Wine not installed | `apt install wine` |
| `makensis: not found` | NSIS not installed | `apt install nsis` |
| `Error: Exit code: 1. Command failed: wine` | Wine configuration issue | Run `wineboot --init` and `winetricks` |
| Installer shows garbled text | Missing Windows fonts in Wine | `winetricks corefonts` |
| Code signing fails with "certificate not found" | PFX path or password incorrect | Verify `CSC_LINK` and `CSC_KEY_PASSWORD` env vars |
| Build succeeds but exe crashes on Windows | Native module platform mismatch | Verify `prebuild-install` downloads correct binary |
| ASAR integrity check fails | Files modified after packaging | Ensure no post-processing modifies ASAR contents |

---

**End of Cross-Build Guide**

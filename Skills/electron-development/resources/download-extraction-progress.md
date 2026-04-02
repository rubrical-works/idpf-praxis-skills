# Framework Download and Extraction Pattern

## Problem

Downloading files in Electron needs progress tracking and reliable extraction.

## Solution

Use Electron's `net` module for downloading with `adm-zip` for extraction, with progress tracking via IPC events.

## Pattern

### Download with Progress Tracking

```typescript
import { net } from 'electron';
import * as fs from 'fs';

export async function downloadFile(
  url: string,
  destPath: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = net.request({ url, method: 'GET' });
    const chunks: Buffer[] = [];

    request.on('response', (response) => {
      // Handle GitHub redirects (302 to S3)
      if (response.statusCode >= 300 && response.statusCode < 400) {
        const redirectUrl = response.headers.location as string;
        downloadFile(redirectUrl, destPath, onProgress).then(resolve).catch(reject);
        return;
      }

      const contentLength = parseInt(response.headers['content-length'] as string, 10) || 0;
      let bytesDownloaded = 0;

      response.on('data', (chunk) => {
        chunks.push(chunk);
        bytesDownloaded += chunk.length;
        onProgress?.({
          bytesDownloaded,
          totalBytes: contentLength,
          percentage: contentLength ? Math.round((bytesDownloaded / contentLength) * 100) : 0,
        });
      });

      response.on('end', () => {
        fs.writeFileSync(destPath, Buffer.concat(chunks));
        resolve();
      });
    });

    request.on('error', reject);
    request.end();
  });
}
```

### Progress via IPC Events

```typescript
// Main process
ipcMain.handle('download:file', async (event, url, targetDir) => {
  const onProgress = (progress: DownloadProgress) => {
    event.sender.send('download:progress', {
      percentage: progress.percentage,
      bytesDownloaded: progress.bytesDownloaded,
      totalBytes: progress.totalBytes,
    });
  };
  return downloadFile(url, targetDir, onProgress);
});

// Preload
contextBridge.exposeInMainWorld('electronAPI', {
  downloadFile: (url, dest) => ipcRenderer.invoke('download:file', url, dest),
  onDownloadProgress: (callback) => {
    const handler = (_event, progress) => callback(progress);
    ipcRenderer.on('download:progress', handler);
    return () => ipcRenderer.removeListener('download:progress', handler);
  },
});
```

### Zip Extraction with adm-zip

```typescript
import AdmZip from 'adm-zip';

export async function extractZip(zipPath: string, targetDir: string): Promise<void> {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(targetDir, true); // true = overwrite
}
```

## Rationale

- **Electron net module:** Respects system proxy, handles HTTPS, built-in to Electron
- **IPC events for progress:** Non-blocking, allows UI updates during download
- **adm-zip:** Pure JavaScript, no native dependencies, works cross-platform
- **Redirect handling:** GitHub releases use S3 redirects (302) for asset downloads

## GitHub Release Asset Pattern

```typescript
// Fetch release info
const release = await fetchLatestRelease(owner, repo);

// Find zip asset
const zipAsset = release.assets.find(a => a.name.endsWith('.zip'));
const downloadUrl = zipAsset.browser_download_url;

// Download follows redirect chain: GitHub -> S3
```

## Error Handling

| Error | Handling |
|-------|----------|
| Network failure | Return error result, log to console |
| No zip asset | Return "No zip asset found" error |
| Invalid URL | Return "Invalid GitHub URL" error |
| Extraction failure | Return error, clean up temp files |

## Console Logging Pattern

```typescript
function logToConsole(message: string, level: 'info' | 'success' | 'error' | 'warning'): void {
  const timestamp = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.className = `console-line ${level}`;
  line.innerHTML = `<span class="console-timestamp">[${timestamp}]</span>${message}`;
  consoleContent.appendChild(line);
  consoleContent.parentElement?.scrollTo(0, consoleContent.parentElement.scrollHeight);
}
```

## Consequences

- Requires `adm-zip` dependency (adds ~100KB)
- Download happens in main process (not renderer)
- Progress updates limited by chunk size from network
- Extraction is synchronous (blocks for large zips)
- Temp files cleaned up on success, may remain on crash

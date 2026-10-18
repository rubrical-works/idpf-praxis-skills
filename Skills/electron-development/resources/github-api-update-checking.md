# GitHub API Update Checking Pattern
## Problem
Electron apps need to check for updates without bundling a full auto-update framework.
## Solution
Electron's `net` module with the GitHub Releases API, with graceful error handling.
## Pattern
### Version Comparison
```typescript
export function compareVersions(local: string, remote: string): number {
  const localParts = local.replace(/^v/, '').split('.').map(Number);
  const remoteParts = remote.replace(/^v/, '').split('.').map(Number);

  // Pad to same length
  const maxLength = Math.max(localParts.length, remoteParts.length);
  while (localParts.length < maxLength) localParts.push(0);
  while (remoteParts.length < maxLength) remoteParts.push(0);

  for (let i = 0; i < maxLength; i++) {
    if (localParts[i] < remoteParts[i]) return -1;
    if (localParts[i] > remoteParts[i]) return 1;
  }
  return 0;
}
```
### Using Electron's net Module
```typescript
import { net } from 'electron';

async function fetchWithElectron(url: string) {
  return new Promise((resolve, reject) => {
    const request = net.request({ url, method: 'GET' });
    request.setHeader('Accept', 'application/vnd.github+json');
    request.setHeader('X-GitHub-Api-Version', '2026-03-10'); // pin a supported REST API version
    request.setHeader('User-Agent', 'my-app');

    let data = '';
    request.on('response', (response) => {
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        resolve({
          ok: response.statusCode < 300,
          status: response.statusCode,
          json: () => JSON.parse(data)
        });
      });
    });
    request.on('error', reject);
    request.end();
  });
}
```
## Rationale
- **Electron net module:** respects system proxy settings (unlike Node's fetch)
- **GitHub Releases API:** standard endpoint, no auth required for public repos
- **Pinned API version:** GitHub versions the REST API with the `X-GitHub-Api-Version` header (the old `vnd.github.v3` media type is no longer how versioning works). Unpinned requests default to `2022-11-28`, which reaches end of support on 2028-03-10
- **Semantic versioning:** handles major.minor.patch with variable lengths
- **Graceful degradation:** app works offline, shows "check failed"
## Update Status States
| State | Badge Color | When |
|-------|-------------|------|
| `checking` | Blue | Request in progress |
| `update-available` | Orange | Remote > local version |
| `up-to-date` | Green | Remote == local version |
| `error` | Red | Network failure, API error, invalid URL |
## Error Handling
```typescript
const result = await checkForUpdates(version, repoUrl);

switch (result.status) {
  case 'update-available':
    // Show orange badge with new version
    break;
  case 'up-to-date':
    // Show green "Up to date" badge
    break;
  case 'error':
    // Show red badge, tooltip with error
    break;
}
```
## API Response Parsing
```json
{
  "tag_name": "v0.30.0",
  "html_url": "https://github.com/owner/repo/releases/tag/v0.30.0"
}
```
Strip the `v` prefix for comparison; store the download URL for the update action.
## Rate Limiting
Unauthenticated: 60 requests/hour. Cache results for the session; check only on app launch or user action.
## Consequences
- Requires network access
- Rate limited by GitHub (60 requests/hour unauthenticated)
- Checks the latest release only (not pre-releases)
- Update badge refreshes each time the main screen is shown

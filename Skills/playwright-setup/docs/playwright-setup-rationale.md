# playwright-setup Rationale

Preserved prose from the original SKILL.md. SKILL.md now references `resources/playwright-setup.config.json` for volatile values.

## The three-step install

`npm install` alone is not enough — Playwright needs three steps:

1. Install the package (`install.installPackageCommand`)
2. Download browser binaries (~500 MB, `install.installBrowsersCommand`)
3. (Linux only) Install system libraries (`install.installSystemDepsCommand`)

The single most common Playwright support question is "Executable doesn't exist" — almost always missing step 2. The config keeps each step as an independently named template so the skill can reference them by purpose, not by command.

## `--with-deps` for CI

`install.installWithDepsCommand` (`npx playwright install --with-deps`) collapses steps 2 and 3 in one shot. Documented separately because CI almost always wants the combined form, while local dev usually does not (sudo prompt).

## Browser cache locations

Recorded per platform (`browserCacheLocations`) so the skill can answer "where are my browsers installed?" without guessing. These paths are stable but version-controlled per platform.

## CI action versions

`actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4` are pinned in the config under `ci.githubActions`. Bump these via JSON edit when upstream releases v5+ — same pattern as Vercel's `amondnet/vercel-action` pin.

## Node minimum

Playwright requires Node 18+. Recorded as `prerequisites.nodeMinimumMajor` so the skill can integrate with `install-node` ("you need Node 18+ for Playwright; install via `install-node`").

## Wizard prose removal

The original SKILL.md was largely reference material with embedded commands; very little wizard-style UI prose. The CI job examples remain in SKILL.md because they're scriptable artifacts, not navigation paths.

---
name: react-native-android-setup
description: Check and set up the host toolchain a React Native + Android + Maestro project needs (JDK 17, Android SDK and emulators, Maestro, user environment variables, tool folders, OS settings), with a tool root the user chooses, per-step consent, and a separate admin phase that survives a reboot. Use when preparing a machine for React Native Android work, or when a build or Maestro run fails with a JDK, SDK, emulator, port or temp-folder symptom.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-10-17"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [react-native, android, android-sdk, android-emulator, maestro, jdk, gradle, windows]
keywords: [react native android setup, android sdk setup, android emulator setup, jdk 17 toolchain, maestro setup, maestro temp folder, avd relocation, metro port 8081, gradlew.bat not found, host environment profile]
copyright: "Rubrical Works (c) 2026"
---
# React Native Android Setup
Checks a machine against a **host environment profile** (tools, user env vars, folders, OS settings for React Native + Android + Maestro), reports what is missing, applies each missing item only with consent.
Profile: `resources/react-native-android-setup.config.json`, per the **External-Orchestration Config Pattern** (`SKILL-DEVELOPMENT-GUIDE.md`). Every pinned version, download location, package ID and command lives in the config; this file names fields, never values. On disagreement the config wins.
Every install or modify path is preceded by the **`responsibility-gate`** (Step 4).
## Step 0 — Re-read Config (MANDATORY)
Every invocation:
1. Read `resources/react-native-android-setup.config.json` from disk.
2. Validate against `resources/react-native-android-setup.config.schema.json`.
3. Validation fails → report errors and **stop**; no fallback to remembered values.
4. Use only parsed config values in later steps; never memory or earlier sessions.
## When to Use
- Preparing Windows, macOS or Linux for a React Native project targeting Android, tested with Maestro.
- A template's hello-world proposal or charter focus line points here.
- A symptom matches an item `summary`: Gradle failure naming a JVM vendor/toolchain, emulator lacking acceleration, Metro unable to bind its port, `run-android` not finding `gradlew.bat`, system drive filling with emulator images or Maestro driver files.
Out of scope: project code, Maestro flows, app-level guidance (photo pickers, media on older Android, copying a phone's display values into an AVD).
## Profile Layout
| Config field | Holds |
|---|---|
| `source` | Evidence source and pilot stack |
| `toolRoot` | Tool-root question; **no default** |
| `paths` | SDK, AVD, Maestro, tool-temp paths, derived from tool root with forward slashes |
| `items[]` | Setup items: `id`, `kind`, `lessons`, `summary`, optional `dependsOn`, `platforms` |
| `practices[]` | Runtime practices (Step 8), same shape |
| `platforms.<os>` | Per-OS `check`, `apply`, `requiresAdmin`, `requiresReboot`, `status` (`verified` / `declared-but-untested`) |
| `sdkPackages` | SDK packages and where versions come from |
| `cliSyntax` | Argument syntax for the SDK package and AVD managers |
| `downloads` | Archive locations for command-line tools and Maestro |
| `metro` | Default and alternative ports |
| `resume` | Where progress is recorded across a reboot, and what |
Placeholders: `{toolRoot}`, `{paths.<key>}`, `{home}`, `{value}`, `{entry}` (one PATH entry), `{packages}`, `{port}`, `{jdk17Home}` (resolved per `env-java-home.valueFrom`).
## Step 1 — Detect Platform and Resume State
1. Map host OS to `windows`, `macos` or `linux`.
2. `resume.stateFile` exists → a prior run stopped for a reboot: read recorded `toolRoot` and `pendingAdminItems`; after Step 2 go to **Step 7**.
3. Item with no entry for this OS → not applicable; skip in all later steps.
## Step 2 — Tool Root (No Default)
Where SDK, AVD images, Maestro and tool temp folders go. **No default** (pilot decision: the default filled the system drive).
- No recorded answer: ask `toolRoot.question` via `AskUserQuestion`, **no** pre-filled or suggested path.
- Recorded answer in `resume.stateFile`: show it; user confirms or replaces it. Confirming their own answer, not a default.
- Normalise per `toolRoot.normalize` (backslash → forward slash, no trailing slash); derive every `paths` value.
- Never write a backslash into a derived path (one reached Java from Git Bash with its separator stripped and wrote into the project tree).
## Step 3 — Check Every Item (Read-Only)
Run each item's `platforms.<os>.check` in `items[]` order. Read-only: no gate.
Report:
| Item | Lessons | Result | Needs admin | Needs reboot | Evidence on this OS |
|---|---|---|---|---|---|
- **Result**: `present`, `missing`, or `wrong` (e.g. JDK not `requiredVersion`, env var with a backslash path).
- **Evidence**: entry `status`; for `declared-but-untested` say the step has not run on this OS yet.
- `sdk-packages` resolves first per `sdkPackages`: `sdkPackages.always`; platform and build-tools versions from the file in `sdkPackages.resolveFrom`; one system image per wanted AVD. Absent/silent project file → **ask**; no fallback version.
Nothing missing or wrong → host ready; go to Step 8.
## Step 4 — Responsibility Acknowledgement Gate
Implements the **`responsibility-gate`** skill. Full contract: `Skills/responsibility-gate/SKILL.md`.
- **When:** before each execution path that changes the machine — before the user phase (Step 5) and again before the admin phase (Step 6) if it has work. Never for Step 3 checks.
- **Asked:** responsibility for that phase's changes from the Step 3 report — installs and downloads, user env vars and shell profile lines, folders and moved emulator images under the tool root, and (admin phase) elevated system settings and a reboot.
- **Decline:** exit cleanly; report "Declined — no changes made."; no changes, no retry, no alternative path.
- **Persistence:** per-invocation; re-fires every run, including after a reboot. Never written to `resume.stateFile` or anywhere.
`AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`. Unavailable → apply nothing; report missing items and that the gate could not fire.
## Step 5 — Apply: User Phase
Items with `requiresAdmin: false`, in dependency order (`dependsOn` first, then `items[]` order). For each missing or wrong item:
1. Show `summary` and the exact `apply` for this OS, placeholders substituted; every step of a list.
2. Ask consent for that step via `AskUserQuestion`, separate from the Step 4 gate; offer skip.
3. Apply, re-run `check`, report.
4. On failure stop the phase, report failure and check output, skip dependents.
**Deferred items**: a non-admin item whose `dependsOn` names a still-missing item needing admin on this OS (e.g. `env-java-home`, `maestro-cli` on `jdk-17`) is listed as deferred, skipped here, applied at the end of Step 6 once its dependency checks present.
Rules:
- **SDK syntax**: `cliSyntax.sdkmanager.packageSeparator` for the SDK manager; `cliSyntax.avdmanager` (separator, PowerShell stop-parsing token) for AVDs.
- **Downloads**: locations from `downloads`; verify against published checksums where named; unpack per `installLayout` / `flatten`.
- **Env vars**: user-level only, never machine-level. Reach new shells only — tell the user to open a new terminal (and restart the IDE).
- **AVD relocation** (`avd-relocation`): close running emulators first; moving folders and rewriting each `.ini` `path=` keeps quick-boot snapshots.
- **Non-admin alternatives**: an admin item's `alternative` (e.g. `metro-port-exclusion` → `metro-alternative-port`) is offered here to users skipping the admin phase.
## Step 6 — Apply: Admin Phase (Elevation and Reboot)
Separate, labelled phase for `requiresAdmin: true` items, after the user phase, never interleaved.
1. **Announce**: list admin items, why each needs elevation, which have `requiresReboot: true`. **Name the reboot up front**: "This phase ends with a reboot of this machine; the skill resumes after it."
2. **Gate**: Step 4 gate again for this phase.
3. **Record progress before changes**: write `resume.stateFile` with `resume.records` (tool root, OS, pending admin items, reboot required, completed items); create its folder if needed.
4. **Apply** each with per-step consent as Step 5. User runs from an elevated shell (Windows: terminal as Administrator; macOS/Linux: commands carry `sudo`). Re-run `check` where visible pre-reboot; else record applied-pending-reboot.
5. **Deferred items**: each Step 5 deferral whose admin dependency now checks present → apply as Step 5 (per-step consent; covered by this invocation's user-phase gate). Dependency effective only after reboot → dependents stay deferred, recorded in `resume.stateFile`.
6. **Reboot**: any applied item with `requiresReboot: true` → set `rebootRequired: true` in `resume.stateFile`, tell the user to reboot now and invoke the skill again; it will **resume** at Step 7. Never reboot yourself.
7. No reboot needed → delete `resume.stateFile`, go to Step 8.
## Step 7 — Resume After Reboot
From Step 1 when `resume.stateFile` exists.
1. Confirm recorded tool root (Step 2).
2. Re-run Step 3 checks for **every** item (a reboot can reveal a change that did not take).
3. Anything missing → Step 4 (gate fires again), then Steps 5–6 as needed.
4. All present → delete `resume.stateFile`, go to Step 8.
## Step 8 — Runtime Practices
Report each `practices[]` entry for this OS as guidance for running the app; not applied by this skill:
- `metro-detached` — start Metro so it survives its launching shell, on `metro.defaultPort` or, if reserved, `metro.alternativePort` passed to `run-android` too.
- `wake-avd` — wake a snapshot-restored emulator and dismiss its keyguard before screenshots.
Summarise: present, applied this run, skipped or failed, reboot outstanding.
## Platform Evidence
Per-OS `status`: **`verified`** = observed and fixed on that OS in the pilot (`source.evidence`); **`declared-but-untested`** = written for that OS, not yet run there. Pilot evidence is Windows-only: Windows entries `verified`, macOS/Linux `declared-but-untested`. When a run confirms one, update its `status`, record evidence in `source`, bump `lastUpdated`.
## Resources
| Resource | Description |
|---|---|
| `resources/react-native-android-setup.config.json` | Host environment profile: tool root rule, paths, items, practices, downloads, SDK resolution, resume state. Re-read every invocation. |
| `resources/react-native-android-setup.config.schema.json` | JSON Schema, validated in Step 0 and by the skill's test. |
## Related Skills
- **responsibility-gate** — consent contract for Step 4.
- **install-node** — Node.js, needed by React Native tooling; not installed here.
- **playwright-setup**, **electron-cross-build** — setup skills on the same config pattern.
## Behavior Note
Decline at the responsibility gate exits cleanly with no system changes.

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
Checks a machine against a **host environment profile** (tools, user environment variables, folders and OS settings a React Native + Android + Maestro project needs), reports what is missing, and applies each missing item only with consent.
The profile is `resources/react-native-android-setup.config.json` (**External-Orchestration Config Pattern**, `SKILL-DEVELOPMENT-GUIDE.md`): every pinned version, download location, package identifier and command lives there. This document names config fields and never repeats their values; the config wins on any disagreement.
Every install or modify path is preceded by the **`responsibility-gate`** (Step 4).
## Step 0 — Re-read Config (MANDATORY)
At the start of every invocation:
1. Read `resources/react-native-android-setup.config.json` from disk.
2. Validate it against `resources/react-native-android-setup.config.schema.json`.
3. If validation fails, report the errors and **stop** — do not fall back to remembered values.
4. Use only values from the parsed config in every later step; never memory or values from earlier sessions.
## When to Use This Skill
- Preparing a Windows, macOS or Linux machine for a React Native project targeting Android and testing with Maestro
- A template's hello-world proposal or charter focus line directs the user here
- A symptom matches an item's `summary` in the config: a Gradle failure naming a JVM vendor or toolchain, the emulator refusing to start for lack of acceleration, Metro unable to bind its port, `run-android` unable to find `gradlew.bat`, the system drive filling with emulator images or Maestro driver files
Out of scope: project code, Maestro flows, and app-level guidance (photo pickers, media on older Android, copying a phone's display values into an AVD).
## How the Profile Is Organised
| Config field | What it holds |
|---|---|
| `source` | Where the evidence comes from and the pilot stack it was observed on |
| `toolRoot` | The tool-root question, and the rule that it has **no default** |
| `paths` | Every SDK, AVD, Maestro and tool-temp path, each derived from the tool root with forward slashes |
| `items[]` | Host setup items. Each has an `id`, a `kind`, the `lessons` it carries, a `summary`, optional `dependsOn`, and `platforms` |
| `practices[]` | Runtime practices the user follows after setup (Step 8), same shape as items |
| `platforms.<os>` | Per-OS `check`, `apply`, `requiresAdmin`, `requiresReboot` and `status` (`verified` or `declared-but-untested`) |
| `sdkPackages` | Which SDK packages to install and where their versions come from |
| `cliSyntax` | Argument-syntax rules for the SDK's package and AVD managers |
| `downloads` | Archive locations for the command-line tools and Maestro |
| `metro` | Metro's default and alternative ports |
| `resume` | Where progress is recorded across a reboot, and what is recorded |
Placeholders in config strings: `{toolRoot}`, `{paths.<key>}`, `{home}` (user's home folder), `{value}` (the item's `value`), `{entry}` (one PATH entry), `{packages}` (resolved SDK packages), `{port}` (the Metro port in use), `{jdk17Home}` (resolved at apply time per `env-java-home.valueFrom`).
## Step 1 — Detect Platform and Resume State
1. Determine the host OS and map it to a `platforms` key: `windows`, `macos` or `linux`.
2. Look for `resume.stateFile`. If it exists, a previous run stopped for a reboot: read the recorded `toolRoot` and `pendingAdminItems` and go to **Step 7** after Step 2.
3. An item with no entry for this OS in `platforms` does not apply — list it as not applicable and skip it in every later step.
## Step 2 — Tool Root (No Default)
Where the SDK, AVD images, Maestro and tool temp folders go. **No default**, by the pilot's decision — the default location is what filled the system drive.
- **No recorded answer:** ask `toolRoot.question` with `AskUserQuestion`, offering **no** pre-filled or suggested path; the user types the folder.
- **Recorded answer from `resume.stateFile`:** show it and ask the user to confirm or change it (their own earlier answer, not a default).
- Normalise per `toolRoot.normalize` (backslashes → forward slashes, no trailing slash), then derive every `paths` value by substituting `{toolRoot}`.
- Never write a backslash into a derived path: one reached Java from Git Bash with its separator stripped and wrote files into the project tree.
## Step 3 — Check Every Item (Read-Only)
Run each item's `platforms.<os>.check` for this OS, in `items[]` order. Checks are read-only: no gate is needed or shown.
Report one table:
| Item | Lessons | Result | Needs admin | Needs reboot | Evidence on this OS |
|---|---|---|---|---|---|
- **Result** is `present`, `missing` or `wrong` (present but not matching the config — e.g. a JDK not at `requiredVersion`, or an environment variable with a backslash path).
- **Evidence** is the entry's `status`; for `declared-but-untested`, say plainly the step has not been run on this OS and its output should be read carefully.
- `sdk-packages` resolves its package list first, per `sdkPackages`: always `sdkPackages.always`; platform and build-tools versions from the project file named in `sdkPackages.resolveFrom`; one system image per AVD the user wants. Project file absent or without a version → **ask**; there is no fallback version.
Nothing missing or wrong → report the host ready and go to Step 8.
## Step 4 — Responsibility Acknowledgement Gate
Implements the **`responsibility-gate`** skill pattern; see `Skills/responsibility-gate/SKILL.md` for the full contract.
- **When this fires:** before each execution path that changes the machine — before the user phase (Step 5) and again before the admin phase (Step 6) if it has work. Never for Step 3's read-only checks.
- **What is asked:** acceptance of responsibility for the changes in the Step 3 report for that phase — installs and downloads, user environment variables and shell profile lines, folders and moved emulator images under the tool root, and (admin phase) system settings needing elevation and a reboot.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes; no retry or alternative path.
- **Persistence:** per-invocation; re-fires on every later run, including the resume after a reboot. Acceptance is never written to `resume.stateFile` or anywhere else.
Use `AskUserQuestion` with the two required options (`"I accept responsibility — proceed"`, `"Decline — exit without changes"`). If unavailable, apply nothing: report the missing items and that the gate could not fire.
## Step 5 — Apply: User Phase
Items with `platforms.<os>.requiresAdmin: false`, in dependency order (`dependsOn` first, then `items[]` order). For each missing or wrong item:
1. Show the item's `summary` and the exact `apply` for this OS with placeholders substituted (every step, for a list).
2. Ask consent for that step with `AskUserQuestion`, separately from the Step 4 gate; offer to skip the item.
3. Apply it, re-run its `check`, report the result.
4. On failure, stop the phase, report the failure and check output, and skip items that depend on it.
**Deferred items.** A non-admin item whose `dependsOn` names an item still missing and needing admin on this OS (e.g. `env-java-home`, `maestro-cli` → `jdk-17`) cannot run yet: list it as deferred, skip it, apply it at the end of Step 6 once its dependency checks present.
Profile rules for this phase:
- **SDK package syntax** — `cliSyntax.sdkmanager.packageSeparator` for the SDK manager; `cliSyntax.avdmanager` (separator, PowerShell stop-parsing token) when creating AVDs.
- **Downloads** — locations from `downloads`; verify against published checksums where named; unpack per `installLayout` or `flatten`.
- **Environment variables** — user-level only, never machine-level. New values reach new shells only: tell the user to open a new terminal (and restart the IDE) after this phase.
- **AVD relocation** (`avd-relocation`) — close every running emulator first; moving the folders and rewriting each `.ini` `path=` line keeps quick-boot snapshots.
- **Non-admin alternatives** — where an admin item has an `alternative` (e.g. `metro-port-exclusion` → `metro-alternative-port`), offer it here for a user who will not run the admin phase.
## Step 6 — Apply: Admin Phase (Elevation and Reboot)
A separate, labelled phase for items with `platforms.<os>.requiresAdmin: true`, run after the user phase, never interleaved.
1. **Announce the phase.** List each admin item, why it needs elevation, and which have `requiresReboot: true`. **Name the reboot up front:** "This phase ends with a reboot of this machine; the skill resumes after it."
2. **Gate.** Present the Step 4 gate again.
3. **Record progress before anything changes.** Write `resume.stateFile` with the `resume.records` fields — tool root, OS, pending admin items, whether a reboot is required, completed items. Create its folder if needed.
4. **Apply each admin item** with per-step consent as in Step 5, from an elevated shell (Windows: a terminal started as Administrator; macOS/Linux: the commands carry `sudo`). Re-run each `check` where it can see the change before a reboot; otherwise record applied-pending-reboot.
5. **Deferred items.** Apply each item Step 5 deferred whose admin dependency now checks present, as in Step 5 (per-step consent; covered by the user-phase gate already accepted). A dependency that only takes effect after the reboot leaves its dependents deferred, recorded in `resume.stateFile`.
6. **Reboot.** If any applied item has `requiresReboot: true`, update `resume.stateFile` (`rebootRequired: true`), tell the user to reboot now and invoke this skill again — it **resumes** from Step 7. Never reboot the machine yourself.
7. No reboot needed → delete `resume.stateFile`, continue to Step 8.
## Step 7 — Resume After Reboot
Entered from Step 1 when `resume.stateFile` exists.
1. Confirm the recorded tool root (Step 2).
2. Re-run Step 3's checks for **every** item, not only pending ones — a reboot can reveal a change that did not take.
3. Anything still missing → Step 4 (the gate fires again; acknowledgement never carries across invocations), then Steps 5 and 6 as needed.
4. Every item present → delete `resume.stateFile`, continue to Step 8.
## Step 8 — Runtime Practices
Report each `practices[]` entry for this OS as guidance for running the app — not setup changes, not applied by this skill:
- `metro-detached` — start Metro so it survives the shell that launched it, on `metro.defaultPort` or, where reserved, `metro.alternativePort` with the same port passed to `run-android`.
- `wake-avd` — wake a snapshot-restored emulator and dismiss its keyguard before taking screenshots.
Close with a summary: items present, applied this run, skipped or failed, and whether a reboot is still outstanding.
## Platform Evidence
Per-OS `status` on every entry: **`verified`** (observed and fixed on that OS during the pilot in `source.evidence`) or **`declared-but-untested`** (written for that OS, not run there). All pilot evidence is from Windows, so Windows entries are `verified` and macOS/Linux entries `declared-but-untested`. When a macOS or Linux run confirms an entry, change its `status` in the config, record the evidence in `source`, and bump `lastUpdated`.
## Resources
| Resource | Description |
|---|---|
| `resources/react-native-android-setup.config.json` | The host environment profile (tool root rule, derived paths, items, practices, downloads, SDK package resolution, resume state); re-read every invocation |
| `resources/react-native-android-setup.config.schema.json` | JSON Schema for the profile, validated in Step 0 and by the skill's test |
## Related Skills
- **responsibility-gate** — the consent contract Step 4 implements
- **install-node** — Node.js, which React Native's tooling needs and this skill does not install
- **playwright-setup**, **electron-cross-build** — setup skills on the same config pattern
## Behavior Note
Decline at the responsibility gate exits cleanly with no system changes.

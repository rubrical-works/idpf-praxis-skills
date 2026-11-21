---
name: godot-mobile-setup
description: Check and set up the host a Godot mobile game needs — the Godot editor build matching GDScript or C#, its export templates, and for Android the JDK, Android SDK, build tools, NDK and the editor's export paths — under a tool root the user chooses, with per-step consent, then verify the install. Use when preparing a machine for Godot mobile development, or when a Godot export fails for missing templates, a missing JDK or Android SDK, or an editor that does not start.
type: invokable
version: "1.1.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-11-20"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [godot, gdscript, csharp, dotnet, android, android-sdk, jdk, windows]
keywords: [godot setup, godot mobile setup, godot export templates, godot android export, godot csharp setup, godot dotnet editor, android sdk for godot, jdk 17 for godot, godot headless verify, host environment profile]
copyright: "Rubrical Works (c) 2026"
---
# Godot Mobile Setup
Checks the machine against a **host environment profile** (Godot editor, export templates, and for Android the Java/Android toolchain), reports what is missing, applies each missing item only with consent, and verifies the result.
Profile: `resources/godot-mobile-setup.config.json`, per the **External-Orchestration Config Pattern** (`SKILL-DEVELOPMENT-GUIDE.md`): every version, download location, package ID and command lives in the config; this document names fields, never values. On disagreement the config wins.
Every install or modify path is preceded by the **`responsibility-gate`** (Step 4).
## Step 0 — Re-read Config (MANDATORY)
1. Read `resources/godot-mobile-setup.config.json` from disk.
2. Validate it against `resources/godot-mobile-setup.config.schema.json`.
3. On validation failure, report the errors and **stop** — no fallback to remembered values.
4. Use only parsed config values in later steps; never memory or earlier sessions.
## When to Use
- Preparing a Windows, macOS or Linux machine for a Godot game exporting to Android or iOS.
- A project template's host step selects this skill (via the `hostSetup` metadata it publishes in the skill catalog).
- A symptom matches an item's `summary`: templates missing for the editor's version, a Java/Android SDK path the editor rejects, a C# project the editor cannot build, an editor that does not start.
Out of scope: creating the project, export presets and Android build template; release keystores, signing, store submission; desktop and web exports.
## Profile Fields
| Config field | What it holds |
|---|---|
| `source` | Documentation, release and source evidence; the evidence-status rule |
| `toolRoot` | Tool-root Host question; **no default** |
| `projectAnswers` | `godotLanguage`, `gamePlatform`: from the project's answers file, or asked |
| `hostSetup` | Catalog metadata: Host keys, automated, left to user, verified/untested OSes |
| `godot` | Editor version, release location, checksum file |
| `builds.<language>` | Editor archive per OS, export-template archive, template folder name |
| `paths` | Downloads, editor, editor data, templates, Android SDK — from the tool root, forward slashes |
| `selfContained` | Marker file keeping editor data, settings and templates beside the editor |
| `dotnet` | Minimum .NET SDK major for C# |
| `sdkPackages` | Android SDK packages, per OS in that OS's `sdkmanager` id form |
| `downloads` | Android command-line tools archives |
| `items[]` | `id`, `kind`, `summary`, `when` (selecting answers), optional `dependsOn`, `platforms` |
| `platforms.<os>` | `check`, `apply`, `requiresAdmin`, `requiresReboot`, `status` (`verified`/`declared-but-untested`) |
| `verify.checks[]` | Per-OS `run` and the `pass` condition |
Placeholders: `{toolRoot}`, `{paths.<key>}`, `{godot.<key>}`, `{editorArchive}`, `{exportTemplates}`, `{templateFolder}` (from `builds.<godotLanguage>`), `{editorExe}` (located per `builds._editorExecutable`), `{editorConsoleExe}` (binary scripted checks run, per `builds._editorConsoleExecutable`), `{value}`, `{packages}` (`sdkPackages.packages.<os>`, each quoted), `{jdk17Home}` (home of the JDK `jdk-17` installed or found).
## Step 1 — Detect Platform and Project Answers
1. Map the host OS to `windows`, `macos` or `linux`.
2. Read `godotLanguage` and `gamePlatform` from the project's answers file; otherwise ask each `projectAnswers.<key>.question` with `AskUserQuestion`, offering its `values`.
3. Select items whose `when` matches (empty `when` always applies). No `platforms` entry for this OS → not applicable; list it.
4. **iOS:** when `gamePlatform` includes iOS, state that iOS export needs macOS with Xcode, which this skill does not install; not possible from Windows or Linux. Continue.
## Step 2 — Tool Root (No Default)
- **No recorded answer:** ask `toolRoot.question` with `AskUserQuestion`, **no** pre-filled or suggested path.
- **Answer in the project's answers file:** show it and ask the user to confirm (their own answer, not a default).
- Normalise per `toolRoot.normalize`, derive every `paths` value from `{toolRoot}`. Never write a backslash into a derived path.
## Step 3 — Check Every Selected Item (Read-Only)
Run each selected item's `platforms.<os>.check` in `items[]` order; no gate. Report:
| Item | Result | Needs admin | Needs reboot | Evidence on this OS |
|---|---|---|---|---|
- **Result:** `present`, `missing` or `wrong` (another editor version, templates for another version, a JDK that is not 17).
- **Evidence:** the entry's `status`; for `declared-but-untested`, say the step has not run on this OS yet and its output needs careful reading.
Nothing missing or wrong → Step 7.
## Step 4 — Responsibility Acknowledgement Gate
Implements the **`responsibility-gate`** skill pattern.
- **Fires:** before each machine-changing path — before Step 5, and again before Step 6 if it has work. Never for Step 3 checks or Step 7 verification.
- **Asks:** acceptance of responsibility for that phase's Step 3 changes — downloads and archives under the tool root, user environment variables and shell profile lines, (admin) system-wide installs.
- **Decline:** exit cleanly; report "Declined — no changes made."; no changes, no retry, no rerouting.
- **Persistence:** per-invocation; never recorded.
Use `AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`. If unavailable, apply nothing: report missing items and that the gate could not fire.
## Step 5 — Apply: User Phase
Items with `requiresAdmin: false`, in dependency order (`dependsOn` first, then `items[]` order). For each missing or wrong item:
1. Show its `summary` and exact `apply` for this OS, placeholders substituted; every step of a list.
2. Ask consent for that step with `AskUserQuestion`, separately from Step 4; offer to skip.
3. Apply, re-run its `check`, report.
4. On failure, stop the phase, report failure and check output, skip dependents.
Rules:
- **Checksums** — compare every Godot archive with its line in `godot.checksums` before unpacking; a mismatch stops the item.
- **One build per tool root** — editor archive and templates both from `builds.<godotLanguage>`; never mix standard and .NET.
- **Self-contained mode** — create `selfContained.markerFile` before the editor's first launch.
- **Environment variables** — user-level only; new values reach new shells only.
- **Editor Android paths** (`editor-android-paths`) — first launch only from a terminal opened after `JAVA_HOME` and `ANDROID_HOME` were set. If the settings already hold other values, tell the user to set Java SDK Path and Android SDK Path in Editor Settings, with the exact values.
**Deferred items:** a non-admin item depending on a still-missing admin item (e.g. `env-java-home` on `jdk-17`) is listed as deferred and applied at the end of Step 6 once its dependency checks present.
## Step 6 — Apply: Admin Phase
Separate, labelled phase for `requiresAdmin: true` items (JDK, .NET SDK), after the user phase, never interleaved.
1. **Announce:** list each admin item and why it needs elevation. None needs a reboot now; if one declares `requiresReboot: true`, name the reboot before anything changes.
2. **Gate:** present Step 4 again.
3. **Apply** each with per-step consent as in Step 5, from an elevated shell (Windows: Administrator terminal; macOS/Linux: `sudo` or the package manager asks).
4. **Deferred items:** apply those whose admin dependency now checks present.
5. Tell the user to open a new terminal before Step 7.
## Step 7 — Verify the Install
Run every `verify.checks[]` entry whose `when` matches (absent `when` always applies) with its `platforms.<os>.run`; read-only. Report:
| Check | Result | Evidence |
|---|---|---|
- **Result:** `pass` when output meets the check's `pass` condition, else `fail`; quote the deciding output.
- **Verified** only when every check passes; otherwise name each failing check and the item it points to, and offer to return to Step 3.
Close with: items present, applied this run, skipped or failed; what is left to the user (`hostSetup.leavesToUser`, including iOS export on a non-macOS host); the verification result.
## Platform Evidence
- **`verified`** — run and confirmed on that OS, evidence in `source`.
- **`declared-but-untested`** — written for that OS, not yet run there.
Every Windows entry is `verified` by a manual Windows install, evidence in `source`; every macOS and Linux entry is `declared-but-untested`. When a macOS or Linux run confirms an entry, change its `status`, move the OS in `hostSetup.os` once every entry on it is verified, record evidence in `source`, bump `lastUpdated`.
## Resources
| Resource | Description |
|---|---|
| `resources/godot-mobile-setup.config.json` | Host environment profile: tool root rule, project answers, catalog metadata, builds, paths, items, verification. Re-read every invocation. |
| `resources/godot-mobile-setup.config.schema.json` | JSON Schema, validated in Step 0 and by the skill's test. |
## Related Skills
- **responsibility-gate** — consent contract for Step 4.
- **react-native-android-setup** — the host-setup skill this follows; source of the JDK, command-line tools and environment-variable items.
Decline at the responsibility gate exits cleanly with no system changes.

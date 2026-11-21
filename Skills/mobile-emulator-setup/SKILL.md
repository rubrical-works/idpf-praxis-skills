---
name: mobile-emulator-setup
description: Check and set up a mobile emulator host — for Android the JDK, command-line tools, emulator, a system image, one virtual device (AVD) kept under a tool root the user chooses and the hardware acceleration it needs; for iOS on macOS a report of whether Xcode and a Simulator runtime are installed — with per-step consent, then verify the device boots. Use when a mobile project (Godot, React Native or any other stack) needs to run a debug build on an emulator, or when an emulator will not start, has no acceleration, or keeps its images on the system drive.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-11-20"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [android, android-sdk, android-emulator, avd, jdk, ios-simulator, xcode, windows]
keywords: [android emulator setup, avd setup, android virtual device, emulator hardware acceleration, emulator boot check, ios simulator check, xcode check, mobile emulator, android system image, host environment profile]
copyright: "Rubrical Works (c) 2026"
---
# Mobile Emulator Setup
Checks the machine against a **host environment profile** — for Android the Java/Android tooling, one virtual device and its hardware acceleration; for iOS, Xcode and a Simulator runtime on macOS — reports what is missing, applies each missing Android item only with consent, and verifies the device boots. iOS is report-only. Independent of the project's stack (Godot, React Native, other).
Profile: `resources/mobile-emulator-setup.config.json`, per the **External-Orchestration Config Pattern** (`SKILL-DEVELOPMENT-GUIDE.md`): every version, download location, package ID, device name and command lives in the config; this document names fields, never values. On disagreement the config wins.
Every install or modify path is preceded by the **`responsibility-gate`** (Step 4).
## Step 0 — Re-read Config (MANDATORY)
1. Read `resources/mobile-emulator-setup.config.json` from disk.
2. Validate it against `resources/mobile-emulator-setup.config.schema.json`.
3. On validation failure, report the errors and **stop** — no fallback to remembered values.
4. Use only parsed config values in later steps; never memory or earlier sessions.
## When to Use
- A mobile project needs an Android emulator or iOS Simulator for its debug build.
- A project template's host step selects this skill (via the `hostSetup` metadata it publishes in the skill catalog).
- A symptom matches an item's `summary`: no hardware acceleration, an AVD that cannot be created for lack of a JDK, AVD images filling the system drive, no iOS Simulator runtime.
Out of scope: physical devices; the project's build toolchain (the stack's own host-setup skill); signing and store submission; installing Xcode.
## Profile Fields
| Config field | What it holds |
|---|---|
| `source` | Evidence for each value; the evidence-status rule |
| `toolRoot` | Tool-root Host question; **no default** |
| `projectAnswers` | `targets` (android, ios, both): from the answers file, or asked |
| `hostSetup` | Catalog metadata: Host keys, automates, leavesToUser, verified/untested OSes |
| `paths` | Downloads, SDK, AVD folders from the tool root, forward slashes |
| `sdkPackages` | Android packages per OS, in that OS's `sdkmanager` id form |
| `avd` | Name, device profile, system image per OS, boot timeout |
| `downloads` | Command-line tools archives |
| `items[]` | `id`, `kind`, `summary`, `when`, optional `dependsOn`, optional `leftToUser`, `platforms` |
| `platforms.<os>` | `check`, `apply`, `requiresAdmin`, `requiresReboot`, `status` (`verified`/`declared-but-untested`) |
| `verify.checks[]` | Per-OS `run` and the `pass` condition |
Placeholders: `{toolRoot}`, `{paths.<key>}`, `{downloads.<key>}`, `{packages}` (`sdkPackages.packages.<os>`, each quoted), `{avd.name}`, `{avd.device}`, `{avd.bootTimeoutSeconds}`, `{avd.systemImage}` (`avd.systemImage.<os>`), `{value}`, `{entry}` (each missing PATH entry), `{jdk17Home}` (home of the JDK `jdk-17` installed or found).
## Step 1 — Platform and Project Answers
1. Map the host OS to `windows`, `macos` or `linux`.
2. Read `targets` from the answers file (a template may name it `gamePlatform`, same values); otherwise ask `projectAnswers.targets.question` with `AskUserQuestion`, offering its `values`.
3. Select items and checks whose `when` matches. An item with no entry for this OS is not applicable — list it so.
4. **iOS off macOS:** say plainly the iOS Simulator needs macOS with Xcode; continue with Android if selected.
## Step 2 — Tool Root (No Default)
Holds the SDK, emulator, system images, AVDs and downloads. **No default**; not needed when only iOS items apply.
- **No recorded answer:** ask `toolRoot.question` with `AskUserQuestion`, **no** pre-filled or suggested path.
- **Answer in the answers file:** show it and ask the user to confirm (their answer, not a default).
- Normalise per `toolRoot.normalize`; derive every `paths` value. Never write a backslash into a derived path.
## Step 3 — Check Selected Items (Read-Only)
Run each selected item's `platforms.<os>.check`, in `items[]` order. No gate.
| Item | Result | Needs admin | Needs reboot | Evidence on this OS |
|---|---|---|---|---|
- **Result:** `present`, `missing`, or `wrong` (present but not matching — JDK not 17, AVD home outside the tool root, no usable accelerator).
- **Evidence:** the entry's `status`; for `declared-but-untested`, say the step has not run through this skill on this OS and its output needs careful reading.
- A `leftToUser: true` item is reported, never applied; when missing, show its `apply` text as what the user must do.
Nothing applicable missing or wrong → Step 7.
## Step 4 — Responsibility Acknowledgement Gate
Implements the **`responsibility-gate`** skill pattern.
- **Fires** before each machine-changing path: before Step 5, and again before Step 6 if it has work. Never for Step 3 or Step 7.
- **Asks** acceptance for that phase's changes from Step 3 — downloads and archives under the tool root, user variables and shell profile lines, the AVD (user phase); system-wide installs and OS features (admin phase).
- **On decline:** exit cleanly, report "Declined — no changes made.", change nothing; no retry or rerouting.
- **Persistence:** per-invocation; never recorded.
`AskUserQuestion` with the two required options (`"I accept responsibility — proceed"`, `"Decline — exit without changes"`). If unavailable, apply nothing: report the missing items and that the gate could not fire.
## Step 5 — Apply: User Phase
Items with `requiresAdmin` `false` and not `leftToUser`, in dependency order (`dependsOn` first, then `items[]` order). Per missing or wrong item:
1. Show `summary` and the exact `apply` for this OS, placeholders substituted; every step of a list.
2. Ask consent for that step with `AskUserQuestion`, separately from the gate; offer to skip.
3. Apply, re-run `check`, report.
4. On failure, stop the phase, report failure and check output; skip dependants.
Rules:
- **Package ids** — pass `sdkPackages.packages` for this OS exactly as written; the form differs by OS (see its `_note`).
- **Environment variables** — user-level only, never machine-level; they reach new shells only, so create the AVD from a new terminal.
- **The AVD** — `avd-create` takes device profile and system image from `avd`; pass its arguments as written, including the Windows stop-parsing token and the custom-hardware answer.
**Deferred items:** a non-admin item whose `dependsOn` names a still-missing admin item on this OS (e.g. `env-java-home` → `jdk-17`) is deferred with its dependants and applied at the end of Step 6 once the dependency checks present.
## Step 6 — Apply: Admin Phase
Separate, labelled phase for `requiresAdmin` `true` items (JDK, hardware acceleration), after the user phase, never interleaved.
1. **Announce:** each admin item and why it needs elevation; name every `requiresReboot` `true` item and when the reboot is needed, before anything changes.
2. **Gate:** the Step 4 gate again.
3. **Apply** each with per-step consent as in Step 5, from an elevated shell (Windows: terminal run as Administrator; macOS/Linux: `sudo` or the package manager asks).
4. **Deferred items:** apply each Step 5 deferral whose admin dependency now checks present.
5. Tell the user to open a new terminal — rebooting first if an applied item required it — before Step 7.
## Step 7 — Verify the Install
Run every `verify.checks[]` entry whose `when` matches and that has an entry for this OS, via its `platforms.<os>.run`. Read-only, except the boot check starts and stops the AVD.
| Check | Result | Evidence |
|---|---|---|
- **Result:** `pass` when output meets `pass`, else `fail`; quote the deciding output, and for the boot check the reported value and seconds taken.
- **Verified** only when every check passes; otherwise name each failing check and its item, and offer to return to Step 3.
Close with a summary: items present, applied this run, skipped or failed; what is left to the user (`hostSetup.leavesToUser`, iOS off macOS, any missing `leftToUser` item); the verification result.
## Platform Evidence
Per-OS `status`: **`verified`** — run through this skill and confirmed on that OS, evidence in `source`; **`declared-but-untested`** — written but not yet run there through this skill.
Every Windows entry is `verified` by an install through this sequence on a Windows host, evidence in `source`; every macOS and Linux entry is `declared-but-untested`. When a macOS or Linux run confirms an entry: change its `status`, move that OS in `hostSetup.os` once every entry on it is verified, record evidence in `source`, bump `lastUpdated`.
## Resources
| Resource | Description |
|---|---|
| `resources/mobile-emulator-setup.config.json` | Host environment profile: tool root rule, answers, catalog metadata, packages, AVD, items, checks. Re-read every invocation. |
| `resources/mobile-emulator-setup.config.schema.json` | JSON Schema, validated in Step 0 and by the skill's test. |
## Related Skills
- **responsibility-gate** — the consent contract Step 4 implements.
- **react-native-android-setup** — keeps its own emulator items for its React Native profile; this skill's Android items began as copies and are maintained separately.
- **godot-mobile-setup** — Godot editor and Android toolchain; pair with this skill when an emulator is needed.
## Behavior Note
Decline at the responsibility gate exits cleanly with no system changes.
**End of Mobile Emulator Setup Skill**

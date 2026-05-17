# CODEX — TV pilot: grief island

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-codex
- **Format:** tv-pilot
- **Paths Explored:** 3 (harmon-circle / save-the-cat / kishōtenketsu)
- **Recommended Path:** Path 1 — harmon-circle scene outline

---

## Story Brief

A 60-minute drama pilot for a streaming platform. Premise: after her mother's sudden death, a forty-something architect inherits a small island off the Maine coast that her mother never mentioned. She arrives to find the island already occupied by a community of women her mother gathered there — none of whom knew about her, and none of whom plan to leave. The pilot must contain its first episode while opening a season's worth of questions. Tone: literary, slow-burn, occasional dry humor. Protagonist's want: sell the island and return to her life. Protagonist's need: discover what her mother was protecting on this island, and decide whether she's a person who builds or a person who walks away.

---

## Paradigms Explored

| Path | Paradigm | Artefact Type | Rationale |
|---|---|---|---|
| 1 | harmon-circle | scene-outline | 8-station circle fits a contained pilot whose protagonist returns to her starting point (literally — boat in, boat out... or not). |
| 2 | save-the-cat | beat-sheet | 15-beat template scaled to 60-minute pilot — tight tempo for streaming retention. |
| 3 | kishōtenketsu | beat-sheet | Four-act re-framing structure lets the pilot end on a meaning-shift rather than a confrontation peak — appropriate for the slow-burn tone. |

---

## Artefacts

### Path 1 — harmon-circle scene outline

```json
{
  "artefactType": "scene-outline",
  "title": "Grief Island — pilot scene outline (Harmon circle)",
  "scenes": [
    { "sceneNumber": 1, "slugline": "EXT. MAINLAND DOCK — DAWN", "summary": "Architect Eli arrives with a single suitcase and a real-estate agent's contact. She is here to assess and sell.", "beatPurpose": "you (zone of comfort: efficient, transactional, returning home Friday)", "characters": ["Eli"], "conflict": "Logistical (she expects this to take a weekend)", "outcome": "She boards the boat alone." },
    { "sceneNumber": 2, "slugline": "EXT. BOAT — MORNING", "summary": "The captain mentions 'the others' on the island. Eli is confused; the realtor said nothing about others.", "beatPurpose": "need (the absence becomes felt — she doesn't know what's there)", "characters": ["Eli", "Captain"], "conflict": "Information asymmetry", "outcome": "She is uneasy as the island appears." },
    { "sceneNumber": 3, "slugline": "EXT. ISLAND DOCK — DAY", "summary": "Three women meet the boat. They've been expecting someone — they did not know it would be the daughter.", "beatPurpose": "go (crossing the threshold from her life into her mother's secret)", "characters": ["Eli", "Margaret (oldest)", "Yara", "Pia"], "conflict": "Eli's plan vs. their established life", "outcome": "Eli walks up to the main house, the women in tow." },
    { "sceneNumber": 4, "slugline": "INT. MAIN HOUSE — DAY", "summary": "Eli explores. The house is fully lived-in: a community kitchen, shared bedrooms, evidence of years of inhabitation.", "beatPurpose": "search (gathering evidence about her mother's life)", "characters": ["Eli", "Margaret"], "conflict": "Eli's transactional frame vs. their lived experience", "outcome": "Margaret hands her a letter from her mother." },
    { "sceneNumber": 5, "slugline": "INT. KITCHEN — EVENING", "summary": "Over dinner, the women tell Eli pieces of why they came to the island. Each piece is small; none names the larger pattern.", "beatPurpose": "find (the truth she sought, partially)", "characters": ["Eli", "Margaret", "Yara", "Pia"], "conflict": "Trust vs. transaction", "outcome": "Eli does not eat with them." },
    { "sceneNumber": 6, "slugline": "EXT. CLIFF — NIGHT", "summary": "Eli walks alone with the letter. The letter is two pages. She reads. We see her face but not the words.", "beatPurpose": "take (paying the price — confronting her mother's withheld self)", "characters": ["Eli"], "conflict": "Inheritance (claimed) vs. self-understanding (lost)", "outcome": "She does not weep. She walks back." },
    { "sceneNumber": 7, "slugline": "EXT. ISLAND DOCK — MORNING", "summary": "The boat returns. The captain waits. Eli walks down with her suitcase. The women watch from the porch.", "beatPurpose": "return (back to the start, transformed)", "characters": ["Eli", "Captain", "Margaret"], "conflict": "Leave (planned) vs. stay (becoming possible)", "outcome": "She turns at the dock." },
    { "sceneNumber": 8, "slugline": "EXT. ISLAND PORCH — MORNING", "summary": "Eli walks back to the porch. She sits down beside Margaret and asks one question: 'Tell me her name. Not my mother. Her name.' Margaret answers. Cut to black.", "beatPurpose": "change (she does not return to the mainland — she returns to the community)", "characters": ["Eli", "Margaret"], "conflict": "The closed self (architect, transactional) opens", "outcome": "She stays. The pilot ends on a name that has been withheld from her her entire life." }
  ]
}
```

**Rationale (path 1):** Harmon-circle's contained 8-station structure maps cleanly onto a 60-minute pilot. The "return" and "change" stations land the inversion — Eli intends to leave, but the pilot's emotional climax is her choice to stay. Strongest move: the mother's withheld first name as the pilot's final beat. Most contestable assumption: that the slow-burn tone will hold streaming retention without an act-1 hook beyond mild mystery. **What would change this:** an earlier reveal (a body, a missing person, something procedural) would shift toward Save-the-Cat tempo; a stronger external pursuit would push toward three-act.

### Path 2 — save-the-cat beat sheet

```json
{
  "artefactType": "beat-sheet",
  "title": "Grief Island — Save-the-Cat 15-beat (pilot-scaled)",
  "paradigm": "save-the-cat",
  "beats": [
    { "beatId": "opening-image", "label": "Eli at her firm, signing off on a project", "summary": "Tight cold open showing the closed, transactional Eli.", "approxPosition": "minute 0-1" },
    { "beatId": "theme-stated", "label": "Realtor on the phone", "summary": "'You'll just need to spend the weekend. Then it's yours to sell.' Theme: inheritance as transaction.", "approxPosition": "minute 2" },
    { "beatId": "setup", "label": "Travel to the island", "summary": "Mainland dock, boat, first sight of the island.", "approxPosition": "minutes 0-8" },
    { "beatId": "catalyst", "label": "Three women meet the boat", "summary": "She is not alone here.", "approxPosition": "minute 9" },
    { "beatId": "debate", "label": "Leave or stay the weekend", "summary": "She considers calling the boat back; chooses to stay because she needs to see what her mother kept here.", "approxPosition": "minutes 9-15" },
    { "beatId": "break-into-2", "label": "Walks into the main house", "summary": "Crosses the literal threshold.", "approxPosition": "minute 15" },
    { "beatId": "b-story", "label": "Margaret as oblique mentor", "summary": "Margaret offers the letter — but does not press.", "approxPosition": "minute 18" },
    { "beatId": "fun-and-games", "label": "Exploration montage", "summary": "Eli walks the island. Finds a workshop, a garden, a small chapel. Each space holds evidence of her mother's life.", "approxPosition": "minutes 18-30" },
    { "beatId": "midpoint", "label": "Dinner with the community", "summary": "She is invited to the kitchen. She refuses to eat. The midpoint forces her to choose how she relates.", "approxPosition": "minute 30" },
    { "beatId": "bad-guys-close-in", "label": "Realtor calls — buyer ready", "summary": "External pressure: sign by Sunday or the deal collapses.", "approxPosition": "minute 38" },
    { "beatId": "all-is-lost", "label": "She reads the letter", "summary": "Cliffside. The letter undoes her transactional frame.", "approxPosition": "minute 45" },
    { "beatId": "dark-night-of-the-soul", "label": "Considers her mother's silence", "summary": "Wanders the island at night. The community sleeps.", "approxPosition": "minutes 45-52" },
    { "beatId": "break-into-3", "label": "Boards the boat at dawn", "summary": "Decision to leave.", "approxPosition": "minute 52" },
    { "beatId": "finale", "label": "Turns at the dock; walks back", "summary": "Asks Margaret for her mother's first name.", "approxPosition": "minutes 55-58" },
    { "beatId": "final-image", "label": "Inverse opening", "summary": "She sits in the kitchen. The community eats around her. She eats.", "approxPosition": "minute 60" }
  ]
}
```

**Rationale (path 2):** Save-the-Cat's 15-beat template scaled to 60 minutes gives the pilot a streaming-friendly retention shape — midpoint at minute 30, "All Is Lost" at 45, finale at 55-58. Strongest move: the realtor-pressure thread as the "Bad Guys Close In" beat externalizes the protagonist's internal pressure. Most contestable assumption: that a literary slow-burn tone survives 15 marked beats per hour. **What would change this:** a less external-pressure-driven plot; a shift to half-hour-comedy tempo.

### Path 3 — kishōtenketsu beat sheet

```json
{
  "artefactType": "beat-sheet",
  "title": "Grief Island — kishōtenketsu four-act",
  "paradigm": "kishotenketsu",
  "beats": [
    { "beatId": "ki", "label": "Arrival and the women", "summary": "Eli arrives, meets the community, learns the basic facts of the place.", "approxPosition": "minutes 0-15" },
    { "beatId": "sho", "label": "Living with the community for one cycle", "summary": "She stays the weekend. Goes through the house, the workshop, the garden. Eats one meal. Has one conversation with each woman.", "approxPosition": "minutes 15-30" },
    { "beatId": "ten", "label": "Re-framing twist: the island is a hospice", "summary": "Mid-pilot reveal: the women are all terminally ill. Her mother gathered them so they could die in peace, on land that asks nothing of them. The protagonist's frame (inheritance / transaction) is re-framed: the island is not for her to sell. It is for them to use.", "approxPosition": "minutes 30-45" },
    { "beatId": "ketsu", "label": "Eli accepts a role she did not seek", "summary": "She does not leave. She does not sell. She does not declare. She picks up where her mother left off, in the kitchen, the next morning.", "approxPosition": "minutes 45-60" }
  ]
}
```

**Rationale (path 3):** Kishōtenketsu's `ten` (re-framing twist) places the hospice reveal at the structural fulcrum of the pilot. Strongest move: a protagonist whose transactional frame is dissolved rather than overcome through conflict — fits the literary tone better than three-act or Save-the-Cat. Most contestable assumption: that streaming audiences accept a four-beat pilot that does not climax in conflict. **What would change this:** if the platform demanded a procedural hook; if the tone shifted from literary to genre.

---

## Synthesis Comparison Table

| Path | Paradigm | Artefact | Strengths | Weaknesses | Best-served story shape |
|---|---|---|---|---|---|
| 1 | harmon-circle | scene-outline | Returns-and-changes structure lands the pilot's emotional climax; 8 scenes match 60-minute runtime. | Slow-burn mid-section may lose retention without a stronger act-1 hook. | Streaming dramas with a contained pilot that opens a season's worth of questions; slow-burn literary tone. |
| 2 | save-the-cat | beat-sheet | Streaming-friendly retention tempo; explicit external pressure (realtor call); audience-aligned beat positions. | 15 beats per hour can fight a literary tone; may feel formulaic. | Commercial streaming dramas; network procedurals; pilots that need to land hard hooks. |
| 3 | kishōtenketsu | beat-sheet | The `ten` re-framing puts the hospice reveal exactly where the structure asks for it; literary tone naturally supported. | Four-beat structure may feel under-eventful for first-time audiences; risks reading as a short film. | Festival-circuit pilots; literary-prestige drama; pilots whose meaning is in the re-framing, not the confrontation. |

**Recommendation:** Path 1 — harmon-circle scene outline. The contained pilot + return-and-change shape matches the brief's want/need inversion (wants to leave, needs to stay). Save-the-Cat fights the tone; kishōtenketsu lands the meaning but risks under-eventfulness for episodic-TV.

---

## Narrative Critique

### Path 1 — harmon-circle scene outline

**pacing valleys:** Findings.

- **Scenes 4-5 (search → find):** Two scenes for the entire exploration and dinner sequence — possibly too compressed for the tone. Remediation: split scene 4 into a workshop scene and a garden scene; let exploration breathe.

**unset-up payoffs:** Findings.

- **Scene 8 (change beat — asking for the mother's first name):** The "I never knew her first name" is not planted earlier — viewers haven't been told the protagonist only ever called her "Mom." Remediation: plant in scene 2 (boat conversation) — Eli refers to her mother only as "my mother" while the captain says a first name; Eli does not register the name.

**character-motivation gaps:** Clean.

**tonal shifts:** Clean.

### Path 2 — save-the-cat beat sheet

**pacing valleys:** Clean — 15 beats per hour keeps tempo.

**unset-up payoffs:** Clean.

**character-motivation gaps:** Findings.

- **Beat: catalyst (three women meet the boat):** Eli's choice to stay rather than turn around is under-motivated for someone we've shown as transactional and efficient. Remediation: have Margaret deliver one specific detail (her mother's voice, a specific date) that Eli cannot ignore.

**tonal shifts:** Findings.

- **Beat: bad-guys-close-in (realtor pressure):** The realtor-pressure beat brings a procedural-thriller tempo into a literary pilot. Remediation: soften the external pressure to an emotional pressure (the buyer is a developer who'll demolish, not just any buyer).

### Path 3 — kishōtenketsu beat sheet

**pacing valleys:** Clean.

**unset-up payoffs:** Findings.

- **Beat: ten (hospice reveal):** The hospice reveal must be physically planted earlier (medications visible, a hospital bed, fatigue signs in dialogue) so it feels earned, not author-imposed. Remediation: plant ≥2 specific physical details in `shō`.

**character-motivation gaps:** Clean.

**tonal shifts:** Clean.

---

## What Would Change This Recommendation

- If the platform required a procedural hook in act 1 (a body, a missing person, a deadline), Save-the-Cat's tighter 15-beat structure would absorb the hook without losing the pilot's heart.
- If the brief allowed a 30-minute slot rather than 60 minutes, kishōtenketsu would become the recommendation — four beats fit a short-form drama better than 8 scenes or 15 beats.
- If the protagonist were younger or less professionally established, the want/need inversion would need a different shape — possibly hero's journey with the island as the "special world."

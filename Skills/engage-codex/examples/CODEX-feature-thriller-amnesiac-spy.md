# CODEX — Feature thriller: amnesiac spy

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-codex
- **Format:** feature-screenplay
- **Paths Explored:** 3 (three-act / save-the-cat / harmon-circle)
- **Recommended Path:** Path 1 — three-act beat sheet

---

## Story Brief

A 110-page feature thriller. Premise: a covert operative wakes in a hotel room with no memory, a stranger's body on the floor, and forty-eight hours before her handlers declare her compromised. As she pieces together the previous week, she discovers the body is a friend she killed during a mission she does not remember authorizing. Tone: paranoid, propulsive, occasional grim humor. Protagonist's want: clear her name. Protagonist's need: accept that the person she was before the amnesia is someone she would not recognize as herself.

---

## Paradigms Explored

| Path | Paradigm | Artefact Type | Rationale |
|---|---|---|---|
| 1 | three-act | beat-sheet | Audience expects feature-thriller three-act rhythm with midpoint reversal placing the body's identity reveal. |
| 2 | save-the-cat | beat-sheet | 15-beat commercial template tightens pacing; "All Is Lost" lands at a specific page expectation. |
| 3 | harmon-circle | scene-outline | Cyclical "you-need-go-search-find-take-return-change" structure foregrounds the protagonist's identity discovery. |

---

## Artefacts

### Path 1 — three-act beat sheet

```json
{
  "artefactType": "beat-sheet",
  "title": "Amnesiac Spy — three-act feature outline",
  "paradigm": "three-act",
  "beats": [
    { "beatId": "opening-image", "label": "Wake in hotel room with body", "summary": "Cold open: protagonist wakes blood-streaked beside a stranger. Phone shows 48-hour countdown from handlers.", "approxPosition": "pages 1-3" },
    { "beatId": "inciting-incident", "label": "Recognize the body", "summary": "Going through pockets, she finds an ID — her own friend Bo. The body is someone she knew.", "approxPosition": "pages 10-12" },
    { "beatId": "plot-point-1", "label": "Cross into investigation", "summary": "She torches the room and goes to ground, choosing to investigate rather than turn herself in.", "approxPosition": "pages 25-28" },
    { "beatId": "midpoint", "label": "Reveal: she authorized the kill", "summary": "She recovers a recording of herself authorizing Bo's elimination — the amnesia is hiding her own choice.", "approxPosition": "pages 55-58" },
    { "beatId": "plot-point-2", "label": "Handler trap", "summary": "She walks into a meeting expecting Bo's killer; the handler reveals Bo was the killer she stopped.", "approxPosition": "pages 80-85" },
    { "beatId": "climax", "label": "Confrontation in the safehouse", "summary": "She faces her former self via documents and recordings; chooses to surface the operation.", "approxPosition": "pages 95-105" },
    { "beatId": "denouement", "label": "Press leak from a hotel-room window", "summary": "She publishes the file. The 48-hour deadline expires. She is exposed — and free.", "approxPosition": "pages 105-110" }
  ]
}
```

**Rationale (path 1):** Three-act structure puts the audience's identification with the protagonist at the midpoint reversal — the moment we learn she's the agent of the killing she's been investigating. Strongest move: making the midpoint a self-discovery rather than an external reveal. Most contestable assumption: that audiences accept a protagonist whose past self is the antagonist. **What would change this:** if the brief specified a less morally compromised protagonist; if the tone constraint relaxed to allow flashback structure; if the runtime were 90 minutes (compresses the second act).

### Path 2 — save-the-cat beat sheet

```json
{
  "artefactType": "beat-sheet",
  "title": "Amnesiac Spy — Save-the-Cat 15-beat",
  "paradigm": "save-the-cat",
  "beats": [
    { "beatId": "opening-image", "label": "Wake with body", "summary": "As three-act path.", "approxPosition": "page 1" },
    { "beatId": "theme-stated", "label": "Hotel mirror line", "summary": "She speaks to her reflection: 'Whoever you were, you brought me here.' Theme of identity-as-action.", "approxPosition": "page 5" },
    { "beatId": "setup", "label": "Trace the previous 48 hours", "summary": "Phone records, key-card stubs, hotel security footage.", "approxPosition": "pages 1-10" },
    { "beatId": "catalyst", "label": "ID the body", "summary": "Friend Bo. Personal stake.", "approxPosition": "page 12" },
    { "beatId": "debate", "label": "Run or investigate", "summary": "Considers surfacing to authorities; rejects after recognizing the handler's name on her phone log.", "approxPosition": "pages 12-25" },
    { "beatId": "break-into-2", "label": "Goes to ground", "summary": "Burner-phone procurement scene.", "approxPosition": "page 25" },
    { "beatId": "b-story", "label": "Reconnects with Bo's sister", "summary": "Source of moral grounding and information.", "approxPosition": "page 30" },
    { "beatId": "fun-and-games", "label": "Investigation montage", "summary": "Three try/fail cycles tracking the handler's network.", "approxPosition": "pages 30-55" },
    { "beatId": "midpoint", "label": "Recording reveals her own voice", "summary": "Mid-runtime self-discovery.", "approxPosition": "page 55" },
    { "beatId": "bad-guys-close-in", "label": "Handler triangulates her phone", "summary": "Active pursuit raises tempo.", "approxPosition": "pages 55-70" },
    { "beatId": "all-is-lost", "label": "Bo's sister is taken", "summary": "Lowest point: the moral grounding character is in jeopardy because of the protagonist.", "approxPosition": "page 75" },
    { "beatId": "dark-night-of-the-soul", "label": "Considers surrender", "summary": "Re-watches her own authorization recording, accepts she did it.", "approxPosition": "pages 75-85" },
    { "beatId": "break-into-3", "label": "Decides to surface the operation", "summary": "Pivots from 'clear name' to 'expose'.", "approxPosition": "page 85" },
    { "beatId": "finale", "label": "Safehouse confrontation + press release", "summary": "As three-act climax + denouement.", "approxPosition": "pages 95-108" },
    { "beatId": "final-image", "label": "Walks out the hotel front door", "summary": "Mirror to opening: exits the same building she woke in, now visible.", "approxPosition": "page 110" }
  ]
}
```

**Rationale (path 2):** Save-the-Cat tightens the pacing with mid-runtime stake-raising — "Bad Guys Close In" + "All Is Lost" cover the second-act-runs-out problem. Strongest move: the B-story (Bo's sister) gives the protagonist a moral anchor we can read against her amnesiac self. Most contestable assumption: that audiences want the 15-beat rhythm rather than a more elliptical structure. **What would change this:** if Bo's sister felt like a beat-machine character; if the recording reveal could be moved to act III for a bigger swing.

### Path 3 — harmon-circle scene outline

```json
{
  "artefactType": "scene-outline",
  "title": "Amnesiac Spy — Harmon-circle scene outline",
  "scenes": [
    { "sceneNumber": 1, "slugline": "INT. HOTEL ROOM — DAWN", "summary": "Wake. Body. Phone countdown.", "beatPurpose": "you (zone of comfort, ironic — a kill scene IS her zone)", "characters": ["Protagonist", "Bo (corpse)"], "conflict": "Identity vs. evidence", "outcome": "She decides to investigate." },
    { "sceneNumber": 2, "slugline": "INT. HOTEL HALLWAY — DAWN", "summary": "Exit avoiding cameras.", "beatPurpose": "need (the felt absence of memory)", "characters": ["Protagonist"], "conflict": "Visibility vs. anonymity", "outcome": "She gets out clean." },
    { "sceneNumber": 3, "slugline": "EXT. CITY STREETS — DAY", "summary": "Burner-phone procurement.", "beatPurpose": "go (crossing the threshold from victim to investigator)", "characters": ["Protagonist", "Vendor"], "conflict": "Trust vs. exposure", "outcome": "She has tools." },
    { "sceneNumber": 4, "slugline": "INT. BO'S APARTMENT — DAY", "summary": "Searches Bo's place. Finds her own letters there.", "beatPurpose": "search (gathering evidence)", "characters": ["Protagonist"], "conflict": "Memory vs. artifact", "outcome": "She learns Bo was her friend." },
    { "sceneNumber": 5, "slugline": "INT. SAFEHOUSE — NIGHT", "summary": "Audio file plays her authorization order.", "beatPurpose": "find (the truth she sought)", "characters": ["Protagonist"], "conflict": "Self vs. self", "outcome": "She knows she did it." },
    { "sceneNumber": 6, "slugline": "EXT. WAREHOUSE — NIGHT", "summary": "Confronts the handler. Sister hostage.", "beatPurpose": "take (paying for the find)", "characters": ["Protagonist", "Handler", "Bo's sister"], "conflict": "Conscience vs. survival", "outcome": "She gets the operation file." },
    { "sceneNumber": 7, "slugline": "INT. HOTEL ROOM — DAWN", "summary": "Returns to the room. Publishes the file.", "beatPurpose": "return (back to the start, but with the elixir)", "characters": ["Protagonist"], "conflict": "Concealment vs. surfacing", "outcome": "She publishes." },
    { "sceneNumber": 8, "slugline": "EXT. HOTEL ENTRANCE — DAWN", "summary": "Walks out the front. Cameras catch her clearly.", "beatPurpose": "change (the protagonist is changed — she is visible)", "characters": ["Protagonist"], "conflict": "Anonymity (lost) vs. moral clarity (gained)", "outcome": "She is exposed and free." }
  ]
}
```

**Rationale (path 3):** Harmon circle gives the story an explicit cyclic structure — beginning and end happen in the same hotel room, but the protagonist who exits is not the protagonist who entered. Strongest move: framing the opening kill as the protagonist's "zone of comfort" inverts standard hero-journey expectations. Most contestable assumption: that 8 scenes can carry feature runtime (typical feature has 40-60 scenes). **What would change this:** the scene count would expand 5x in production; the cyclic mirror would need to be visible in dialogue, not just structure; the "change" station might land bittersweet rather than triumphant.

---

## Synthesis Comparison Table

| Path | Paradigm | Artefact | Strengths | Weaknesses | Best-served story shape |
|---|---|---|---|---|---|
| 1 | three-act | beat-sheet | Audience-aligned midpoint reversal carries the identity-discovery moment. | Risks a flat first act before the body-ID beat. | Feature thrillers with a single protagonist pursuing one external goal that masks an internal reckoning. |
| 2 | save-the-cat | beat-sheet | Tight commercial pacing; B-story moral anchor; explicit "Bad Guys Close In" rhythm. | The 15-beat density can feel formulaic in arthouse thriller territory. | Commercial thrillers with strong audience-expectation hooks (genre-faithful). |
| 3 | harmon-circle | scene-outline | Cyclic structure foregrounds identity discovery; opening/closing locations mirror. | 8 scenes is undersized for feature; commercial audiences may find the structure unfamiliar. | Indie/arthouse thrillers; pilot-as-feature pitches; festival-circuit features. |

**Recommendation:** Path 1 — three-act beat sheet. The audience's relationship to a paranoid-thriller protagonist depends on the midpoint reversal carrying the identity discovery; three-act places that beat where commercial-thriller audiences expect it without the rigidity of Save-the-Cat's 15-slot template.

---

## Narrative Critique

### Path 1 — three-act beat sheet

**pacing valleys:** Findings.

- **Beat: opening-image → inciting-incident span:** 10 pages from wake to body-ID is too long for a thriller cold open. Remediation: collapse to 5 pages; move the ID reveal forward.

**unset-up payoffs:** Findings.

- **Beat: plot-point-2 (handler trap):** The reveal that Bo was the killer she stopped requires earlier planting — currently the audience has not been given evidence that Bo had a darker arc. Remediation: plant a Bo-shaped detail in beats 2-3 (a weapon Bo shouldn't have; a contact name).

**character-motivation gaps:** Clean.

**tonal shifts:** Clean.

### Path 2 — save-the-cat beat sheet

**pacing valleys:** Clean. The 15-beat template enforces consistent tempo.

**unset-up payoffs:** Findings.

- **Beat: bad-guys-close-in (handler triangulates phone):** The handler's ability to track her phone is not established earlier — she got a burner in the setup. Remediation: have the burner come from a vendor the handler also pays; reveal the vendor's allegiance at the triangulation moment.

**character-motivation gaps:** Findings.

- **Beat: b-story (Bo's sister):** The B-story relationship arrives too quickly; we accept the sister as moral anchor without earning the protagonist's trust in her. Remediation: add a scene where the sister tests the protagonist before opening up.

**tonal shifts:** Clean.

### Path 3 — harmon-circle scene outline

**pacing valleys:** Findings.

- **Scene 4 → Scene 5 span (search → find):** Two scenes for the bulk of the investigation undercuts the thriller mode. Remediation: this scene-count is feature-undersized; in production, expand search into 6-10 scenes.

**unset-up payoffs:** Clean.

**character-motivation gaps:** Clean.

**tonal shifts:** Findings.

- **Scene 8 (change station):** The "exposed and free" beat reads triumphant; the rest of the script is grim. Tonal mismatch. Remediation: end on bittersweet ambiguity — visible but not safe.

---

## What Would Change This Recommendation

- If the production budget required compressing to a 90-minute runtime, Save-the-Cat's tighter 15-beat template would become the recommendation (compresses second act).
- If the tone constraint shifted to literary/arthouse rather than commercial thriller, Harmon-circle's cyclic structure would become more appealing — the structural unfamiliarity becomes a feature.
- If the protagonist's morally-compromised past were softened (e.g., she was coerced into the authorization, not freely choosing), three-act's midpoint reversal would lose its weight and a different paradigm — perhaps hero's journey with a clearer mentor figure — would serve better.

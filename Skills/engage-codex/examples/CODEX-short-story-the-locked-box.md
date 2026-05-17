# CODEX — Short story: the locked box

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-codex
- **Format:** short-story
- **Paths Explored:** 3 (kishōtenketsu / freytag-pyramid / hero-journey)
- **Recommended Path:** Path 1 — kishōtenketsu beat sheet

---

## Story Brief

A literary short story, 4000 words. Premise: a woman in her thirties cleaning out her childhood bedroom finds a locked metal box in her closet — a box her father gave her at age seven, with the key to be opened "on her wedding day." She has never married. Her father has been dead eleven years. She must decide what to do with the box. Tone: contemplative, image-driven, sentence-level. Protagonist's want: open the box. Protagonist's need: choose whether her relationship to her father is a thing she can still author, or a thing he closed when he died.

---

## Paradigms Explored

| Path | Paradigm | Artefact Type | Rationale |
|---|---|---|---|
| 1 | kishōtenketsu | beat-sheet | Four-act re-framing structure fits literary short story whose meaning is in the shift, not the confrontation. |
| 2 | freytag-pyramid | beat-sheet | Five-act dramatic structure with falling action carrying its own weight — the aftermath of opening (or not) is the story's actual subject. |
| 3 | hero-journey | character-arc-grid | Internal monomyth — protagonist's psychic journey through threshold, ordeal, and return. |

---

## Artefacts

### Path 1 — kishōtenketsu beat sheet

```json
{
  "artefactType": "beat-sheet",
  "title": "The Locked Box — kishōtenketsu four-act outline",
  "paradigm": "kishotenketsu",
  "beats": [
    { "beatId": "ki", "label": "The box found", "summary": "Mira finds the box in the back of her childhood closet while clearing the room before her mother sells the house. She remembers being seven and her father saying, 'On your wedding day.' She is thirty-four and not married. The box weighs more than she remembers.", "approxPosition": "0-25%" },
    { "beatId": "sho", "label": "The week with the box", "summary": "Mira takes the box home. For a week it sits on her kitchen counter. She does not open it. She thinks about who she would have been to open it on a wedding day, and who she is now to open it on a Tuesday. She finds the key her father gave her, taped to the underside of her old jewelry tray.", "approxPosition": "25-50%" },
    { "beatId": "ten", "label": "The realization (re-framing twist)", "summary": "On the seventh day Mira understands that her father did not give her a box for her wedding day. He gave her a way to be in conversation with him on a day she would have wanted him there. The wedding-day instruction was an alibi for the gift. She has been refusing the conversation by waiting for an event that does not have to happen.", "approxPosition": "50-75%" },
    { "beatId": "ketsu", "label": "She opens it", "summary": "Mira opens the box. The contents are described once, simply, without commentary: a folded handkerchief, a photograph of her father at twenty, a key (not labeled), a sealed letter. She does not read the letter today. She places everything back in the box and closes it without locking it. She puts the box on her dresser. She makes dinner.", "approxPosition": "75-100%" }
  ]
}
```

**Rationale (path 1):** Kishōtenketsu's `ten` lands the realization at the structural fulcrum without requiring a dramatic confrontation. The story's meaning is the re-framing — that the box was never about a wedding, it was about a conversation. Strongest move: the `ketsu` describes the box's contents without commentary, leaving interpretation to the reader. Most contestable assumption: that a 4000-word story can afford a week-long `shō` of inaction. **What would change this:** a tighter word count would compress `shō` toward summary; a more dramatic premise would push toward freytag.

### Path 2 — freytag-pyramid beat sheet

```json
{
  "artefactType": "beat-sheet",
  "title": "The Locked Box — Freytag five-act",
  "paradigm": "freytag-pyramid",
  "beats": [
    { "beatId": "exposition", "label": "The discovery", "summary": "Mira finds the box. Memory of her father's instruction at seven. Description of the box's weight, finish, the lock.", "approxPosition": "0-15%" },
    { "beatId": "rising-action", "label": "The waiting", "summary": "Mira takes the box home. For days she does not open it. She finds the key. The waiting becomes its own narrative — what she does instead of opening; whom she does not tell; what she eats; what she avoids.", "approxPosition": "15-40%" },
    { "beatId": "climax", "label": "She decides to open it", "summary": "The midpoint decision. Mira sits at her table with the box and the key. She opens it. The contents are revealed: handkerchief, photograph, key, sealed letter.", "approxPosition": "40-55%" },
    { "beatId": "falling-action", "label": "What she does with what she found", "summary": "Mira reads the letter. The letter is short. It does not say what she expected. She writes her father a letter in reply, knowing he will not read it. She seals her letter in an envelope and puts it in the box.", "approxPosition": "55-85%" },
    { "beatId": "denouement", "label": "The box on the dresser", "summary": "Mira places the box on her dresser. She does not lock it. She makes dinner. The box is no longer a thing she is keeping; it is a thing she is living with.", "approxPosition": "85-100%" }
  ]
}
```

**Rationale (path 2):** Freytag's symmetric pyramid lets the falling action carry its own weight — what Mira does after opening the box is the story's actual subject. Strongest move: making the falling action (Mira writing back) the structural mirror of the rising action (Mira waiting). Most contestable assumption: that 4000 words have room for symmetric act lengths. **What would change this:** a longer word count would let the symmetry breathe more; a shorter word count would compress to three acts.

### Path 3 — hero-journey character-arc grid

```json
{
  "artefactType": "character-arc-grid",
  "title": "The Locked Box — hero-journey arc grid for Mira",
  "characters": [
    {
      "name": "Mira",
      "want": "Open the box",
      "need": "Author her relationship to her father instead of inheriting it",
      "wound": "Father died when she was twenty-three; she has been waiting for a moment to deserve him ever since",
      "arcDirection": "positive",
      "trajectory": [
        { "beatRef": "ordinary-world", "emotion": "task-focused (clearing the room)", "stateChange": "baseline — she is in a logistical mode" },
        { "beatRef": "call-to-adventure", "emotion": "stilled by recognition (the box)", "stateChange": "memory of her father intrudes on the logistics" },
        { "beatRef": "refusal-of-call", "emotion": "ambivalent — keeps it but does not open", "stateChange": "carries the box home, lets it sit" },
        { "beatRef": "threshold-crossing", "emotion": "deliberate", "stateChange": "decides to open it on a non-wedding-day Tuesday" },
        { "beatRef": "ordeal", "emotion": "grief surfacing", "stateChange": "reads the letter; receives what her father actually meant to say" },
        { "beatRef": "reward", "emotion": "quiet", "stateChange": "she has the contents; she has the meaning" },
        { "beatRef": "return-with-elixir", "emotion": "settled", "stateChange": "writes back; puts the box on the dresser; does not lock it" }
      ]
    }
  ]
}
```

**Rationale (path 3):** Hero-journey character-arc grid makes the protagonist's emotional trajectory visible — the seven stages map cleanly onto a single character's internal monomyth. Strongest move: the "refusal of call" station as the week of waiting. Most contestable assumption: that hero-journey's external-action grammar transfers to a contemplative story where nothing leaves Mira's apartment. **What would change this:** a more action-driven story would benefit more from the hero-journey scaffolding.

---

## Synthesis Comparison Table

| Path | Paradigm | Artefact | Strengths | Weaknesses | Best-served story shape |
|---|---|---|---|---|---|
| 1 | kishōtenketsu | beat-sheet | Re-framing twist (`ten`) lands the story's meaning without requiring confrontation; literary tone naturally supported. | Risks under-eventfulness for readers expecting plot-driven shape. | Literary short stories whose meaning is in the shift, not the confrontation. |
| 2 | freytag-pyramid | beat-sheet | Symmetric pyramid lets the falling action (writing back) carry weight equal to the rising action (waiting). | Five acts in 4000 words may feel beat-heavy at sentence-level. | Literary stories with a clear central event whose aftermath matters as much as the event. |
| 3 | hero-journey | character-arc-grid | Makes Mira's internal trajectory legible as a series of states. | Hero-journey vocabulary (ordeal, threshold) sits uneasily on a contemplative story. | Character-driven literary fiction whose protagonist's emotional journey is the subject. |

**Recommendation:** Path 1 — kishōtenketsu beat sheet. The story's heart is the re-framing twist (the box was never about a wedding) — kishōtenketsu places that beat exactly where the structure asks for it. Freytag splits the meaning across rising and falling action, diluting the twist; hero-journey's external-action grammar fights the contemplative tone.

---

## Narrative Critique

### Path 1 — kishōtenketsu beat sheet

**pacing valleys:** Clean.

**unset-up payoffs:** Findings.

- **Beat: ten (the realization):** The re-framing twist must be earned by specific sentence-level details in `ki` and `shō` — currently the outline describes the realization abstractly. Remediation: plant ≥3 concrete details in `ki`/`shō` whose meaning shifts under the `ten` re-framing (a phrase her father used; a specific date; an object).

**character-motivation gaps:** Clean.

**tonal shifts:** Clean.

### Path 2 — freytag-pyramid beat sheet

**pacing valleys:** Findings.

- **Beat: rising-action (the waiting):** A 25% block of waiting risks reading as filler unless each sentence is earning the wait. Remediation: structure the rising action as numbered days, each day carrying one image or memory that builds toward the climax decision.

**unset-up payoffs:** Clean.

**character-motivation gaps:** Clean.

**tonal shifts:** Findings.

- **Beat: climax (opening the box):** The discrete event of opening may produce a tonal spike inappropriate to the story's contemplative register. Remediation: write the opening as a continuous, low-volume action — no sentence-level drama around the act itself.

### Path 3 — hero-journey character-arc grid

**pacing valleys:** Clean.

**unset-up payoffs:** Clean.

**character-motivation gaps:** Findings.

- **Trajectory: ordeal (reading the letter):** The grid places emotion at the ordeal but does not specify what the letter says — leaving the most load-bearing moment under-specified. Remediation: this is a grid, not a beat sheet; the writer must specify the letter's content in the actual prose.

**tonal shifts:** Findings.

- **Trajectory: return-with-elixir (settled):** "Settled" as a final emotional state risks closing the story too cleanly for a literary register. Remediation: end on an ambiguous emotion (settled-but-also-grieving; settled-but-also-changed-and-unsure) — name two states held simultaneously.

---

## What Would Change This Recommendation

- If the word count compressed to 1500 words, kishōtenketsu's four-act structure would still hold but `shō` would need to be a single page rather than a week-long span.
- If the brief specified a clear confrontation (Mira discovers something in the box that demands action), freytag's symmetric pyramid would absorb the confrontation + its aftermath naturally.
- If the protagonist were the active inheritor of an estate dispute, hero-journey's external-action grammar would fit; the contemplative tone is what disqualifies it here.

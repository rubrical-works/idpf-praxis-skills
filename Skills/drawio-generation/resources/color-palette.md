# Color Palette Reference

Material Design color palette for `.drawio.svg` diagram generation. Each color purpose defines a **fill** (light background) and **stroke** (dark border) pair. Use consistently across all diagram types.

---

## Semantic Colors

### Primary — Main Actions and Entities

| Role | Hex | Material Design |
|------|-----|-----------------|
| Fill | `#E3F2FD` | Blue 50 |
| Stroke | `#1976D2` | Blue 700 |

**When to use:** Default color for primary workflow steps, main use cases, and core entities. Use Primary when the element represents the standard or expected path through a diagram. Most shapes in a diagram should use Primary unless they need semantic distinction.

**Examples:** Activity nodes on the happy path, primary use cases, standard process steps.

---

### Secondary — Supporting and Success

| Role | Hex | Material Design |
|------|-----|-----------------|
| Fill | `#E8F5E9` | Green 50 |
| Stroke | `#388E3C` | Green 700 |

**When to use:** Supporting actions, successful outcomes, symlink/integration targets, and secondary workflow branches. Use Secondary to distinguish helper steps from the main flow or to highlight positive outcomes.

**Examples:** Symlink target directories, supporting use cases, success states, secondary process branches.

---

### Warning — Optional and Deployment

| Role | Hex | Material Design |
|------|-----|-----------------|
| Fill | `#FFF3E0` | Orange 50 |
| Stroke | `#F57C00` | Orange 700 |

**When to use:** Optional steps, deployment actions, and elements that require caution. Use Warning for steps that may be skipped or that have side effects the user should be aware of.

**Examples:** Optional deployment steps, project installer components, conditional branches.

---

### Danger — Errors and Destructive Actions

| Role | Hex | Material Design |
|------|-----|-----------------|
| Fill | `#FFEBEE` | Red 50 |
| Stroke | `#D32F2F` | Red 700 |

**When to use:** Error states, destructive operations, failure paths, and abort conditions. Use Danger sparingly — only for elements that represent genuine error or risk.

**Examples:** Error handling nodes, abort/cancel paths, validation failure states, destructive operations.

---

### Info — Decisions and Configuration

| Role | Hex | Material Design |
|------|-----|-----------------|
| Fill | `#FFF9C4` | Yellow 100 |
| Stroke | `#F9A825` | Yellow 800 |

**When to use:** Decision diamonds, registry/configuration operations, and elements that represent branching logic. The yellow color draws attention to decision points where the flow diverges.

**Examples:** Decision diamonds (always), registry operations, configuration checks, conditional gates.

---

### Neutral — Legends, Boundaries, and Disabled

| Role | Hex | Material Design |
|------|-----|-----------------|
| Fill | `#F5F5F5` | Grey 100 |
| Stroke | `#BDBDBD` | Grey 400 |

**When to use:** Legend boxes, system boundaries, disabled/inactive elements, and purely structural shapes that should not draw attention. Use Neutral for chrome elements that support the diagram but aren't part of the data flow.

**Examples:** Color legend boxes, annotation containers, disabled states, background groupings.

---

## Additional Colors

### External Tool — Third-Party Integration

| Role | Hex | Material Design |
|------|-----|-----------------|
| Fill | `#F3E5F5` | Purple 50 |
| Stroke | `#7B1FA2` | Purple 700 |

**When to use:** Components and actions involving external tools (draw.io, GitHub, npm). Distinguishes third-party interactions from internal framework operations.

### Disabled — Inactive Elements

| Role | Hex | Material Design |
|------|-----|-----------------|
| Fill | `#ECEFF1` | Blue Grey 50 |
| Stroke | `#607D8B` | Blue Grey 500 |

**When to use:** Grayed-out or inactive elements that exist in the model but are not currently active.

### Start/End States

| Role | Hex | Notes |
|------|-----|-------|
| Fill | `#333333` | UML standard dark fill |
| Stroke | `#333333` | Matches fill for solid appearance |

**When to use:** Always use for UML start (filled circle) and end (bull's-eye) state nodes.

### Text

| Role | Hex | Notes |
|------|-----|-------|
| Primary text | *(default black)* | Shape labels |
| Subtitle text | `#666666` | Secondary labels, annotations |

---

## Quick Reference Table

| Purpose | Fill | Stroke | Typical Shapes |
|---------|------|--------|----------------|
| **Primary** | `#E3F2FD` | `#1976D2` | Activity, Use Case, Process |
| **Secondary** | `#E8F5E9` | `#388E3C` | Supporting steps, Success |
| **Warning** | `#FFF3E0` | `#F57C00` | Optional, Deployment |
| **Danger** | `#FFEBEE` | `#D32F2F` | Error, Abort, Failure |
| **Info** | `#FFF9C4` | `#F9A825` | Decision, Registry, Config |
| **Neutral** | `#F5F5F5` | `#BDBDBD` | Legend, Boundary, Disabled |
| **External** | `#F3E5F5` | `#7B1FA2` | Third-party tools |
| **Disabled** | `#ECEFF1` | `#607D8B` | Inactive elements |
| **Start/End** | `#333333` | `#333333` | State circles |

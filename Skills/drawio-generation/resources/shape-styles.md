# Shape Style Catalog

Quick-reference for mxCell `style` attribute values used in `.drawio.svg` generation. Each entry shows the complete style string. Colors reference the [Color Palette](color-palette.md).

---

## Shapes

### Actor (UML Stick Figure)

```
shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;
```

| Property | Value | Notes |
|----------|-------|-------|
| `shape` | `umlActor` | Built-in draw.io stick figure |
| `verticalLabelPosition` | `bottom` | Name appears below the figure |
| `verticalAlign` | `top` | Aligns label to top of label area |
| `outlineConnect` | `0` | Connectors attach to shape outline |

**Geometry:** `width="30" height="55"` (standard actor size)

---

### Use Case (Ellipse)

```
ellipse;whiteSpace=wrap;html=1;fillColor=#E3F2FD;strokeColor=#1976D2;strokeWidth=2;
```

| Property | Value | Notes |
|----------|-------|-------|
| `ellipse` | *(flag)* | Renders as ellipse shape |
| `fillColor` | `#E3F2FD` | Blue 50 (primary) |
| `strokeColor` | `#1976D2` | Blue 700 (primary) |
| `strokeWidth` | `2` | Standard border weight |

**Geometry:** `width="200" height="80"` (standard use case size)

**Semantic variants:**

| Purpose | fillColor | strokeColor |
|---------|-----------|-------------|
| Primary | `#E3F2FD` | `#1976D2` |
| Supporting | `#E8F5E9` | `#388E3C` |
| Decision/Registry | `#FFF9C4` | `#F9A825` |
| Optional | `#FFF3E0` | `#F57C00` |
| External tool | `#F3E5F5` | `#7B1FA2` |

---

### Activity (Rounded Rectangle)

```
rounded=1;whiteSpace=wrap;html=1;fillColor=#E3F2FD;strokeColor=#1976D2;strokeWidth=2;
```

| Property | Value | Notes |
|----------|-------|-------|
| `rounded` | `1` | Rounds rectangle corners |
| `fillColor` | `#E3F2FD` | Blue 50 (primary action) |
| `strokeColor` | `#1976D2` | Blue 700 (primary action) |
| `strokeWidth` | `2` | Standard border weight |

**Geometry:** `width="280" height="60"` (standard activity size)

**Semantic variants:**

| Purpose | fillColor | strokeColor |
|---------|-----------|-------------|
| Primary action | `#E3F2FD` | `#1976D2` |
| Supporting action | `#E8F5E9` | `#388E3C` |
| Registry/config | `#FFF9C4` | `#F9A825` |
| Error/danger | `#FFEBEE` | `#D32F2F` |
| Optional/deploy | `#FFF3E0` | `#F57C00` |
| External tool | `#F3E5F5` | `#7B1FA2` |
| Disabled/warning | `#ECEFF1` | `#607D8B` |

---

### Decision (Diamond / Rhombus)

```
rhombus;whiteSpace=wrap;html=1;fillColor=#FFF9C4;strokeColor=#F9A825;strokeWidth=2;
```

| Property | Value | Notes |
|----------|-------|-------|
| `rhombus` | *(flag)* | Renders as diamond shape |
| `fillColor` | `#FFF9C4` | Yellow 100 — decision emphasis |
| `strokeColor` | `#F9A825` | Yellow 800 — decision emphasis |
| `strokeWidth` | `2` | Standard border weight |

**Geometry:** `width="120" height="80"` (standard decision size)

---

### Start (Filled Circle)

```
ellipse;html=1;shape=startState;fillColor=#333333;strokeColor=#333333;
```

| Property | Value | Notes |
|----------|-------|-------|
| `ellipse` | *(flag)* | Base ellipse shape |
| `shape` | `startState` | Renders as solid filled circle |
| `fillColor` | `#333333` | Dark gray fill |
| `strokeColor` | `#333333` | Matches fill for solid appearance |

**Geometry:** `width="30" height="30"` (small circle)

---

### End (Bull's-Eye Circle)

```
ellipse;html=1;shape=endState;fillColor=#333333;strokeColor=#333333;
```

| Property | Value | Notes |
|----------|-------|-------|
| `ellipse` | *(flag)* | Base ellipse shape |
| `shape` | `endState` | Renders as circle with inner ring |
| `fillColor` | `#333333` | Dark gray fill |
| `strokeColor` | `#333333` | Matches fill for solid appearance |

**Geometry:** `width="30" height="30"` (small circle)

---

### Component (Styled Rectangle)

```
rounded=1;whiteSpace=wrap;html=1;fillColor=#F3E5F5;strokeColor=#7B1FA2;strokeWidth=2;verticalAlign=top;fontStyle=1;
```

| Property | Value | Notes |
|----------|-------|-------|
| `rounded` | `1` | Rounds corners |
| `fillColor` | `#F3E5F5` | Purple 50 (component default) |
| `strokeColor` | `#7B1FA2` | Purple 700 (component default) |
| `verticalAlign` | `top` | Title sits at top of box |
| `fontStyle` | `1` | Bold title text |

**Geometry:** `width="300" height="200"` (container-sized for sub-elements)

**Semantic variants:**

| Purpose | fillColor | strokeColor |
|---------|-----------|-------------|
| Framework files | `#F3E5F5` | `#7B1FA2` |
| Project installers | `#FFF3E0` | `#F57C00` |
| Symlink targets | `#E8F5E9` | `#388E3C` |
| Registry/preserved | `#FFF9C4` | `#F9A825` |

---

### Association (Connector — No Arrow)

```
edgeStyle=none;endArrow=none;endFill=0;
```

| Property | Value | Notes |
|----------|-------|-------|
| `edgeStyle` | `none` | Straight line (no routing) |
| `endArrow` | `none` | No arrowhead |
| `endFill` | `0` | No fill on arrow tip |

**Use for:** Actor-to-use-case connections, undirected relationships.

**Dashed variant (include/extend):**

```
edgeStyle=none;html=1;dashed=1;endArrow=open;endFill=0;
```

| Property | Value | Notes |
|----------|-------|-------|
| `dashed` | `1` | Dashed line |
| `endArrow` | `open` | Open arrowhead (UML include/extend) |

---

### Flow (Connector — Directed Arrow)

```
edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=1;
```

| Property | Value | Notes |
|----------|-------|-------|
| `edgeStyle` | `orthogonalEdgeStyle` | Right-angle routing |
| `endArrow` | `block` | Solid triangular arrowhead |
| `endFill` | `1` | Filled arrowhead |

**Use for:** Activity flows, sequence arrows, directed transitions.

---

## Supporting Shapes

### System Boundary (Dashed Container)

```
rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#666666;strokeWidth=2;dashed=1;verticalAlign=top;fontStyle=1;fontSize=14;
```

**Use for:** Grouping use cases within a system or subsystem.

### Legend Box

```
rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#BDBDBD;
```

**Use for:** Color legend or annotation blocks.

### Title Text

```
text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;fontStyle=1;fontSize=16;
```

### Subtitle Text

```
text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;fontSize=12;fontColor=#666666;
```

---

## Style Composition Rules

1. **Properties are semicolon-delimited** — each property ends with `;`
2. **Flag properties** have no `=value` (e.g., `ellipse;rounded=1;` — `ellipse` is a flag, `rounded` has a value)
3. **Order does not matter** — draw.io parses style properties by name, not position
4. **`html=1`** — include on all shapes to enable HTML label rendering (line breaks via `&#10;`)
5. **`whiteSpace=wrap`** — include on shapes with text to enable word wrapping

# Shape Style Catalog
Quick-reference for mxCell `style` attribute values used in `.drawio.svg` generation. Colors reference the [Color Palette](color-palette.md).
## Shapes
### Actor (UML Stick Figure)
```
shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;
```
**Geometry:** `width="30" height="55"`
### Use Case (Ellipse)
```
ellipse;whiteSpace=wrap;html=1;fillColor=#E3F2FD;strokeColor=#1976D2;strokeWidth=2;
```
**Geometry:** `width="200" height="80"`
**Semantic variants:**
| Purpose | fillColor | strokeColor |
|---------|-----------|-------------|
| Primary | `#E3F2FD` | `#1976D2` |
| Supporting | `#E8F5E9` | `#388E3C` |
| Decision/Registry | `#FFF9C4` | `#F9A825` |
| Optional | `#FFF3E0` | `#F57C00` |
| External tool | `#F3E5F5` | `#7B1FA2` |
### Activity (Rounded Rectangle)
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#E3F2FD;strokeColor=#1976D2;strokeWidth=2;
```
**Geometry:** `width="280" height="60"`
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
### Decision (Diamond / Rhombus)
```
rhombus;whiteSpace=wrap;html=1;fillColor=#FFF9C4;strokeColor=#F9A825;strokeWidth=2;
```
**Geometry:** `width="120" height="80"`
### Start (Filled Circle)
```
ellipse;html=1;shape=startState;fillColor=#333333;strokeColor=#333333;
```
**Geometry:** `width="30" height="30"`
### End (Bull's-Eye Circle)
```
ellipse;html=1;shape=endState;fillColor=#333333;strokeColor=#333333;
```
**Geometry:** `width="30" height="30"`
### Component (Styled Rectangle)
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#F3E5F5;strokeColor=#7B1FA2;strokeWidth=2;verticalAlign=top;fontStyle=1;
```
**Geometry:** `width="300" height="200"`
**Semantic variants:**
| Purpose | fillColor | strokeColor |
|---------|-----------|-------------|
| Framework files | `#F3E5F5` | `#7B1FA2` |
| Project installers | `#FFF3E0` | `#F57C00` |
| Symlink targets | `#E8F5E9` | `#388E3C` |
| Registry/preserved | `#FFF9C4` | `#F9A825` |
### Association (Connector — No Arrow)
```
edgeStyle=none;endArrow=none;endFill=0;
```
**Use for:** Actor-to-use-case connections, undirected relationships.
**Dashed variant (include/extend):**
```
edgeStyle=none;html=1;dashed=1;endArrow=open;endFill=0;
```
### Flow (Connector — Directed Arrow)
```
edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=1;
```
**Use for:** Activity flows, sequence arrows, directed transitions.
## Supporting Shapes
### System Boundary (Dashed Container)
```
rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#666666;strokeWidth=2;dashed=1;verticalAlign=top;fontStyle=1;fontSize=14;
```
### Legend Box
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#BDBDBD;
```
### Title Text
```
text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;fontStyle=1;fontSize=16;
```
### Subtitle Text
```
text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;fontSize=12;fontColor=#666666;
```
## Style Composition Rules
1. **Properties are semicolon-delimited** — each property ends with `;`
2. **Flag properties** have no `=value` (e.g., `ellipse;` is a flag)
3. **Order does not matter** — draw.io parses by name, not position
4. **`html=1`** — include on all shapes for HTML label rendering
5. **`whiteSpace=wrap`** — include on shapes with text for word wrapping

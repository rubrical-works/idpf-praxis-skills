---
name: drawio-generation
description: Generate valid .drawio.svg diagrams with editable mxGraphModel structure
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: documentation
relevantTechStack: [drawio, diagrams, svg, uml, documentation]
defaultSkill: false
copyright: "Rubrical Works (c) 2026"
---
# DrawIO Generation Skill
**Purpose:** Complete technical specification for generating `.drawio.svg` files — dual-representation format that renders as SVG in browsers/GitHub while remaining editable in draw.io.
**Audience:** Any command, extension, or workflow that needs to produce UML or architectural diagrams.
**Load with:** `Skills/drawio-generation/SKILL.md`
## When to Use This Skill
- Generating UML diagrams (use case, activity, sequence, class, component, state)
- Creating architectural diagrams for PRDs or design documents
- Producing any `.drawio.svg` file that must open and edit correctly in draw.io
- Validating existing `.drawio.svg` files for completeness
## File Format: Dual SVG + mxGraphModel Representation
A `.drawio.svg` file is a standard SVG with an embedded `mxfile` XML structure in the `<svg>` element's `content` attribute:
- **SVG layer** — renders visually in browsers, GitHub preview, and image viewers
- **mxGraphModel layer** — stores the editable graph structure that draw.io reads
Both layers must describe the **same diagram**.
### File Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="600" height="400" viewBox="0 0 600 400"
     content="&lt;mxfile ...&gt;...HTML-encoded mxGraphModel XML...&lt;/mxfile&gt;"
     style="background-color: rgb(255, 255, 255);">
  <defs/>
  <g>
    <!-- SVG shapes and lines that visually match the mxGraphModel -->
  </g>
</svg>
```
**Key points:**
- The `content` attribute contains the **entire mxfile XML**, HTML-encoded (`<` → `&lt;`, `"` → `&quot;`)
- The `width`, `height`, and `viewBox` on `<svg>` should match the `dx`/`dy` on `<mxGraphModel>`
- SVG elements inside `<g>` are the visual rendering; the `content` attribute is the editable model
## mxGraphModel Structure
```
mxfile
 └── diagram (id, name)
      └── mxGraphModel (dx, dy, grid, gridSize, ...)
           └── root
                ├── mxCell id="0"              ← root container (always present)
                ├── mxCell id="1" parent="0"   ← default layer (always present)
                ├── mxCell id="..." vertex="1" ← shape cells
                ├── mxCell id="..." edge="1"   ← edge cells
                └── ...
```
### Required Root Cells
Every mxGraphModel must start with:
```xml
<mxCell id="0"/>
<mxCell id="1" parent="0"/>
```
### Shape mxCell (vertex)
```xml
<mxCell id="step1"
        value="Step 1: Build Model"
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#E3F2FD;strokeColor=#1976D2;"
        vertex="1" parent="1">
  <mxGeometry x="110" y="90" width="280" height="80" as="geometry"/>
</mxCell>
```
| Attribute | Purpose |
|-----------|---------|
| `id` | Unique identifier (referenced by edges) |
| `value` | Display text (use `&#10;` for line breaks) |
| `style` | Semicolon-delimited style properties |
| `vertex="1"` | Marks this as a shape |
| `parent="1"` | Belongs to the default layer |
### Edge mxCell (edge)
```xml
<mxCell id="e1"
        value=""
        style="edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;"
        edge="1" parent="1"
        source="step1" target="step2">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```
| Attribute | Purpose |
|-----------|---------|
| `id` | Unique identifier |
| `value` | Edge label (empty string for unlabeled) |
| `style` | Edge style (orthogonal, curved, endArrow type) |
| `edge="1"` | Marks this as an edge |
| `source` | ID of the source shape |
| `target` | ID of the target shape |
Edge `mxGeometry` uses `relative="1"`. To add a label, set the `value` attribute.
## Critical Requirement: SVG ↔ mxGraphModel Synchronization
> **Every SVG visual element must have a corresponding mxCell in the mxGraphModel, and vice versa.**
Violations cause:
- **Missing mxCell for SVG arrow** — arrow renders but is not editable (ghost element)
- **Missing SVG for mxCell** — element exists in editor but invisible in rendered SVG
- **Mismatched coordinates** — shape appears in one place visually but elsewhere in editor
### Synchronization Checklist
| Check | Verify |
|-------|--------|
| Shape count | `vertex="1"` mxCells = SVG shapes (`<rect>`, `<ellipse>`, `<polygon>`) |
| Edge count | `edge="1"` mxCells = SVG lines/paths (`<line>`, `<path>`) |
| Coordinates | `mxGeometry x,y` matches SVG element `x,y` (or `cx,cy` for ellipses) |
| Labels | `mxCell value` matches SVG `<text>` content |
| Connections | Every `source`/`target` references a valid shape ID |
### Common Anti-Pattern
```
WRONG: Draw SVG arrows first, then add edge mxCells later
RIGHT: Build the mxGraphModel first, then generate matching SVG (model-first approach)
```
## Generation Pattern: Model-First Approach
Generate `.drawio.svg` files in three sequential steps. Never skip or reorder.
### Step 1: Build mxGraphModel
1. **Create shape mxCells** — one `vertex="1"` mxCell per visual element
2. **Create edge mxCells** — one `edge="1"` mxCell per connection, with `source` and `target` referencing shape IDs
3. **Assign unique IDs** — use semantic names (e.g., `step1`, `decision`, `e1`) not GUIDs
4. **Calculate geometry** — set `x`, `y`, `width`, `height` on each `mxGeometry`; use 10px grid increments
### Step 2: Generate SVG
| mxCell Type | SVG Element | Coordinate Source |
|-------------|-------------|-------------------|
| `vertex="1"` with `rounded=1` | `<rect rx="10" ry="10">` | `mxGeometry x, y, width, height` |
| `vertex="1"` with `ellipse` style | `<ellipse>` | `cx = x + width/2`, `cy = y + height/2` |
| `vertex="1"` with `rhombus` style | `<polygon>` (4 points) | Derived from `mxGeometry` center and size |
| `vertex="1"` with `shape=umlActor` | `<circle>` + `<line>` (stick figure) | Head at `(x + width/2, y + 10)` |
| `edge="1"` | `<line>` or `<path>` | Calculated from source/target positions |
| `mxCell value` text | `<text>` | Centered in shape geometry |
SVG element positions must match `mxGeometry` coordinates exactly.
### Step 3: Validate Synchronization
1. **Count matching** — compare `vertex="1"` mxCells to SVG shapes; `edge="1"` mxCells to SVG lines/paths
2. **Edge reference verification** — every `source`/`target` must reference an existing shape `id`
3. **Label matching** — `mxCell value` text should appear in corresponding SVG `<text>`
4. **Coordinate spot-check** — verify at least first and last shape positions match
If validation fails, fix the **mxGraphModel first**, then regenerate SVG.
> **Never write SVG elements without first creating the mxGraphModel equivalent.**
## UML Diagram Type Conventions
### Use Case Diagram
| Element | mxCell Style | Layout |
|---------|-------------|--------|
| Actor | `shape=umlActor;` | Left side, 80px apart vertically |
| Use Case | `ellipse;whiteSpace=wrap;` | Center, grouped by feature area |
| System Boundary | `rounded=1;dashed=1;` | Rectangle enclosing all use cases |
| Association | `endArrow=none;` | Actor → Use Case |
| Include | `dashed=1;endArrow=open;` + label `<<include>>` | Use Case → Use Case |
| Extend | `dashed=1;endArrow=open;` + label `<<extend>>` | Use Case → Use Case |
### Activity Diagram
| Element | mxCell Style | Layout |
|---------|-------------|--------|
| Start | `ellipse;fillColor=#000000;` (30x30) | Top center |
| End | `ellipse;fillColor=#000000;strokeColor=#000000;` with inner circle | Bottom center |
| Action | `rounded=1;whiteSpace=wrap;` | Vertical flow, 120px spacing |
| Decision | `rhombus;whiteSpace=wrap;` | Center, Yes/No labeled edges |
| Fork/Join bar | `shape=line;strokeWidth=3;` (200x5) | Full width |
| Swim Lane | `shape=swimlane;startSize=30;` | Vertical columns per actor |
### Sequence Diagram
| Element | mxCell Style | Layout |
|---------|-------------|--------|
| Lifeline | `shape=umlLifeline;` | Top row, 150px apart horizontally |
| Sync Message | `endArrow=block;endFill=1;` | Left-to-right solid arrow |
| Async Message | `endArrow=open;endFill=0;` | Left-to-right open arrow |
| Return Message | `dashed=1;endArrow=open;` | Right-to-left dashed arrow |
| Activation Box | `fillColor=#E3F2FD;` (narrow rect) | Overlaid on lifeline |
| Alt/Loop fragment | `dashed=1;rounded=0;` + label | Enclosing rectangle |
### Class Diagram
| Element | mxCell Style | Layout |
|---------|-------------|--------|
| Class box | `shape=classShape;` or 3-section rect | Grid layout, 200px spacing |
| Interface | Same as class + `<<interface>>` label | Above implementing classes |
| Inheritance | `endArrow=block;endFill=0;` (hollow triangle) | Child → Parent |
| Implementation | `dashed=1;endArrow=block;endFill=0;` | Class → Interface |
| Association | `endArrow=open;` | Between related classes |
| Composition | `endArrow=diamond;endFill=1;` (filled) | Whole → Part |
| Aggregation | `endArrow=diamond;endFill=0;` (hollow) | Whole → Part |
### Color Scheme
| Purpose | Fill Color | Stroke Color |
|---------|-----------|-------------|
| Primary action/entity | `#E3F2FD` | `#1976D2` |
| Decision/branch | `#FFF3E0` | `#F57C00` |
| Start/End | `#000000` | `#000000` |
| Actor | `#FFFFFF` | `#333333` |
| System boundary | `#F5F5F5` | `#9E9E9E` |
| Error/exception path | `#FFEBEE` | `#D32F2F` |
| Success/happy path | `#E8F5E9` | `#388E3C` |
### Layout Best Practices
1. **Grid alignment** — use 10px grid increments
2. **Minimum spacing** — 60px between shapes, 120px between rows
3. **Label positioning** — center text in shapes; edge labels at midpoint
4. **Consistent sizing** — action boxes 280x60, decisions 120x80, actors 40x60
5. **Flow direction** — top-to-bottom for activity/sequence, left-to-right for use case
## Token Budget Considerations
1. **One diagram per tool call** — never batch multiple `.drawio.svg` writes in a single response
2. **Complex diagram threshold** — diagrams with ~15+ nodes can approach output token limits; consider splitting into sub-diagrams
3. **Separate skill reads from diagram writes** — read this skill in a separate tool call from diagram generation
4. **Multi-diagram sequences** — write each diagram in its own response cycle
## Validation Checklist
### 1. mxGraphModel Completeness
- [ ] Root cells present: `<mxCell id="0"/>` and `<mxCell id="1" parent="0"/>`
- [ ] Every shape has `vertex="1"` and child `<mxGeometry>` with `x`, `y`, `width`, `height`
- [ ] Every edge has `edge="1"` with `source` and `target` attributes
- [ ] Every `source`/`target` references a valid shape `id`
- [ ] Every edge `mxGeometry` has `relative="1"`
- [ ] All `id` values are unique
- [ ] All cells have `parent="1"` (or appropriate parent for grouped elements)
### 2. SVG ↔ mxGraphModel Synchronization
- [ ] Shape count matches: `vertex="1"` mxCells = SVG shapes
- [ ] Edge count matches: `edge="1"` mxCells = SVG lines/paths
- [ ] Coordinates aligned: `mxGeometry x,y` matches SVG element positioning
- [ ] Labels match: `mxCell value` appears in corresponding SVG `<text>`
- [ ] `<svg>` dimensions match `<mxGraphModel>` `dx`, `dy`
- [ ] `content` attribute contains complete HTML-encoded mxfile XML
### 3. Story Traceability (PRD diagrams only)
- [ ] Use case diagrams: each user story maps to a use case ellipse with story reference
- [ ] Activity diagrams: acceptance criteria steps map to activity nodes
- [ ] Story IDs embedded in element labels or annotations
- [ ] Diagram title references the epic or feature
### 4. Editability Verification
- [ ] File opens in draw.io without errors
- [ ] Shapes are selectable and movable
- [ ] Connectors re-route when shapes are moved
- [ ] Text labels are editable by double-clicking
- [ ] Adding new shapes/connectors works without breaking existing elements

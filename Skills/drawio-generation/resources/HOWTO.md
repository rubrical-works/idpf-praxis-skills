# Using drawio-generation Without IDPF Framework

Generate valid `.drawio.svg` diagrams with editable mxGraphModel structure, producing files that render as SVG in browsers and GitHub while remaining fully editable in draw.io.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Complete technical specification for generating `.drawio.svg` files, including mxGraphModel structure, UML diagram conventions, and validation checklists |
| `resources/color-palette.md` | Standard color schemes for diagram elements (primary, decision, error, success paths) |
| `resources/shape-styles.md` | mxCell style strings for common shapes (rectangles, ellipses, diamonds, actors, edges) |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/drawio-generation/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When generating .drawio.svg diagrams, UML diagrams, or architectural diagrams,
read .claude/skills/drawio-generation/SKILL.md first. Follow the model-first
generation approach and use the color palette and shape styles from the resources/
directory to ensure consistent, editable output.
```

## Customization

- Edit `resources/color-palette.md` to match your organization's brand colors or design system tokens.
- Modify `resources/shape-styles.md` to add custom shape types or adjust default dimensions for your diagram conventions.
- Add new UML diagram type sections to `SKILL.md` if you use diagram types beyond those already covered (use case, activity, sequence, class, component, state).

## How IDPF Projects Use This

In IDPF projects, this skill is loaded on demand when commands like `/create-prd` need to produce UML or architectural diagrams. The framework reads `SKILL.md` into context before generating any `.drawio.svg` file, ensuring the model-first approach and SVG/mxGraphModel synchronization rules are followed. The approach above replicates that behavior for any Claude Code project.

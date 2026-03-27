---
name: frontend-design
description: >
  Production-grade, visually distinctive frontend interfaces. Use when building
  a landing page, creating a dashboard, designing a React component, making a
  website, building something visually striking, creating a UI, designing a
  poster, or when the user says "build me a site", "make this look good",
  "design a page", "create a frontend", "visually striking", "beautiful UI",
  "modern design", or any task where the primary deliverable is a rendered
  interface. Also fires when /copilot reaches a milestone whose files include
  index.html, .jsx, .tsx, .css, or .scss.
  Do NOT trigger when: user asks to review existing UI (use code-reviewer),
  request is code-only with no visual deliverable, or a strict brand guide
  already defines all visual decisions.
tags: [frontend, ui, design, react, landing, dashboard, visual]
---

# Frontend Design Skill

<instructions>
Produces interfaces that are visually distinctive and production-ready.
The core constraint: every design choice must be intentional, not default.

## Step 0: Context Detection

Before writing any code, read three sources.

**1. Project stack and domain**
Read `CLAUDE.md` — find `Domain:` and `Stack:` fields.
If stack contains React/Next/Vue/Svelte: use component file structure.
If stack is plain HTML: single index.html with embedded or linked CSS/JS.

**2. Existing design system or brand guide**
```bash
ls .claude/constitution.md 2>/dev/null
find . -name "design-tokens*" -o -name "brand-guide*" -o -name "theme.*" 2>/dev/null | head -5
```
If `constitution.md` exists: read `## Visual Identity` section — it is non-negotiable.
If design tokens exist: import them. Do not invent conflicting values.

**3. Prior aesthetic decisions**
```bash
grep -i "font\|color\|aesthetic\|palette" .claude/memory/decisions.md 2>/dev/null | head -10
```
If prior decisions exist: stay consistent with them unless the user explicitly wants a change.

---

## Step 1: Pick an Aesthetic Direction

Choose ONE direction before writing any code.
Intentionality beats intensity — a minimal design executed with conviction beats a
maximalist design that hedges.

See `references/aesthetic-directions.md` for fonts, colors, and techniques per direction.

| Direction | Core signal |
|-----------|-------------|
| Brutally Minimal | Extreme whitespace, single weight, silence as design element |
| Maximalist Chaos | Layers, collisions, overflow, density as aesthetic |
| Retro-Futuristic | CRT nostalgia meets speculative UI — scanlines, phosphor glow |
| Organic/Natural | Irregular shapes, earth palette, no mechanical grids |
| Luxury/Refined | Restraint, gold/cream/black, editorial spacing |
| Playful/Toy-like | Rounded, saturated, bouncy, tactile affordances |
| Editorial/Magazine | Strong typographic hierarchy, column grids, pull quotes |
| Brutalist/Raw | Exposed structure, default-looking-but-intentional, harsh juxtapositions |
| Art Deco/Geometric | Symmetry, chevrons, gilt details, high contrast geometry |
| Soft/Pastel | Muted saturation, gentle gradients, airy spacing |
| Industrial/Utilitarian | Monospace, grid lines, data-forward, no decoration |
| Cyberpunk/Dark | Dark base, neon accent, glitch effects, terminal aesthetics |

State the chosen direction explicitly before proceeding. Example:
`Direction: Retro-Futuristic — scanline overlays, phosphor green on near-black, monospace headline`

---

## Step 2: Implement

### Typography rules
- NEVER use: Inter, Roboto, Arial, Helvetica, system fonts without intentional treatment
- NEVER use: Space Grotesk (convergence signal — indicates no aesthetic thinking)
- DO use: characterful fonts from Google Fonts matched to the chosen direction
- Set: `font-display: swap` on all imported fonts

### Color rules
- NEVER use: purple-to-pink gradient on white
- NEVER use: evenly distributed hues without hierarchy
- NEVER use: high-saturation rainbow palettes
- DO use: 1 dominant + 1-2 accent colors, committed to the direction
- DO use: a defined background treatment (texture, grain overlay, gradient mesh) — not flat solid color

### Layout rules
- NEVER use: centered hero + 3-column feature grid without modification
- NEVER use: standard nav with no customization
- DO use: asymmetry, overlap, diagonal flow, or grid-breaking elements
- DO use: visual hierarchy that guides the eye in a deliberate path

### Motion rules
- Prefer CSS transitions over JS animation libraries
- Scroll-triggered animations must serve comprehension, not decorate it
- Hover states must be thoughtful — not just opacity change
- Glassmorphism only if the direction calls for it (Luxury, Cyberpunk) — never as default

### Detail rules
- Rounded corners only where intentional — not applied globally by default
- Micro-interactions must have a reason: confirm action, guide attention, indicate state
- Every spacing value must belong to a scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)

---

## Step 3: Complexity Budget

Match animation/visual code ratio to the chosen direction.

| Direction type | Animation/visual code | Semantic structure |
|---|---|---|
| Maximalist (Chaos, Retro, Cyberpunk) | 60-70% | 30-40% |
| Minimalist (Minimal, Luxury, Soft) | 20-30% | 70-80% |
| Mid-complexity (Editorial, Deco, Industrial) | 40-50% | 50-60% |

Do not apply maximalist code budget to a minimalist direction. The restraint IS the design.

---

## Ambiguity Protocol

If the request is vague (no content, no purpose stated):
→ Ask: "What does this interface do, and who uses it? One sentence."

If no framework is specified and CLAUDE.md has no stack:
→ Default to vanilla HTML/CSS/JS. State this assumption before writing.

If the user asks for "something beautiful" with no further constraint:
→ Pick a direction from the aesthetic table, state it explicitly ("Going with Brutally Minimal — here's why"), then proceed. Do not ask for permission.

If a request conflicts with constitution.md visual constraints:
→ Flag the conflict: "constitution.md restricts X — I'll use Y instead." Do not silently override.

---

## Step 4: Production Requirements

- Entry file: `index.html` (always — even for React, the build output target is index.html)
- Cross-browser: test mental model against Chrome, Firefox, Safari rendering differences for any CSS used
- Mobile-responsive: no horizontal scroll on 375px viewport, tap targets >= 44px
- No broken links, placeholder `#` hrefs without intent, or `TODO` comments in shipped code
- Images: use aspect-ratio, width/height attributes, or explicit dimensions to prevent layout shift
</instructions>

---

## Completion

When done, output:

<output_format>
```
Direction: {chosen direction}
Entry file: {absolute path to index.html}
Line count: {wc -l output}
Files created: {list}
```

Run:
```bash
wc -l index.html
```

Show the actual line count. Do not estimate.
</output_format>

## References

For the full aesthetic directions reference: `references/aesthetic-directions.md`

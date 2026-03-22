# Aesthetic Directions — Quick Reference

12 directions for the frontend-design skill. Pick one before writing code.

| Direction | Vibe | Key Techniques | Example Fonts | Example Colors |
|-----------|------|---------------|---------------|----------------|
| **Brutally Minimal** | Silence as design. One element per screen. Every pixel earns its place. | Extreme whitespace, single typeface weight, monochrome or near-monochrome, no decoration | Garamond, Cormorant, DM Serif Display | #FFFFFF + #0A0A0A, or #F5F0EB + #1A1A1A |
| **Maximalist Chaos** | Density, layering, visual noise as deliberate statement. | Overlapping elements, competing type sizes, mixed media, bleed-to-edge images, stacked layers | Bebas Neue + handwritten mix, Display + body contrast | Saturated contrasting hues — no single dominant |
| **Retro-Futuristic** | Nostalgia for a future that never arrived. CRT terminals, tape decks, space-age UI. | Scanline overlays, phosphor glow, CRT curve, terminal cursor blink, VHS distortion | Share Tech Mono, VT323, Orbitron | #0D1B0D (near-black) + #00FF41 (phosphor green) or amber #FFB300 |
| **Organic/Natural** | Nature-sourced — irregular, warm, living. Rejects the mechanical grid. | Blob shapes, hand-drawn SVG borders, irregular column widths, grain textures, leaf/soil palette | Playfair Display, Lora, Newsreader | #3D2B1F, #8B7355, #E8DCC8, #4A7C59 |
| **Luxury/Refined** | Restraint that signals expense. Negative space is the product. | Wide letter-spacing on display type, rule lines instead of borders, gold/cream/black palette, no rounded corners | Cormorant Garamond, Bodoni Moda, Cinzel | #1A1208, #C9A84C (gold), #F5F0E8 (cream) |
| **Playful/Toy-like** | Tactile, bouncy, joyful. Designed to invite touch. | High border-radius, drop shadows with color, spring/bounce animations, illustrated elements, sticker-style badges | Nunito, Fredoka One, Baloo 2 | #FF6B6B, #4ECDC4, #FFE66D, #FFFFFF |
| **Editorial/Magazine** | Type IS the design. Grid discipline with deliberate breaks. | Strong typographic hierarchy, 12-column grid, pull quotes, dropcaps, ruled sections, photo crops | Libre Baskerville + Source Sans, Playfair + Inter (editorial exception), Fraunces | #F4F1EC (paper), #1C1C1C, red accent #D62828 |
| **Brutalist/Raw** | Deliberately anti-polished. The exposed skeleton is the aesthetic. | Default-looking elements styled with intent, visible borders, stark backgrounds, aggressive whitespace or none | Courier New (intentional), Times New Roman (reclaimed), monospace | #FFFFFF + #000000 + primary color blocks |
| **Art Deco/Geometric** | Symmetry, repetition, gilt geometry. Machine-age glamour. | Chevron patterns, radial symmetry, thin geometric ornaments, fan motifs, high contrast | Poiret One, Josefin Sans, Italiana | #1A1209, #C9A84C (gold), #F5E6C8, #1A2639 |
| **Soft/Pastel** | Gentle, airy, approachable. Saturation turned below 50%. | Muted gradients (analogous hues), cloud-like shapes, generous padding, soft shadows | Poppins (light weight only), Nunito Light, DM Sans | #F2E8FF, #E8F4F8, #FFF4E8, #E8F5E9 |
| **Industrial/Utilitarian** | Function first. Decoration is a bug. Data is the interface. | Monospace typefaces, visible grid lines, data tables as primary UI, tight spacing, no gradients | JetBrains Mono, IBM Plex Mono, Roboto Mono | #1A1A1A, #2D2D2D, #4A4A4A, #00CC66 (status green) |
| **Cyberpunk/Dark** | Dark base, neon accent, the city at 3am. Glitch is a feature. | Dark near-black base, neon accent (1 color only), glitch text effect, scanlines optional, terminal feel | Rajdhani, Exo 2, Orbitron | #0A0A0F, #FF2D78 (neon pink) or #00F5FF (cyan), #1A1A2E |

## Usage Notes

- Pick exactly one direction per project. Mixing directions without a deliberate concept produces visual noise.
- The font column lists examples — always verify availability on Google Fonts before using.
- Color values are starting points. Adjust lightness to pass WCAG AA contrast (4.5:1 for body text).
- Maximalist directions (Chaos, Retro, Cyberpunk) allow more motion budget — see SKILL.md Step 3.
- Brutalist/Raw requires the most discipline: it looks like no thought went into it, which requires the most thought.

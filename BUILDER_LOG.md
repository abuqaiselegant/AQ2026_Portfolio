# Builder Log

Running notes on what was built, why, and what a future me needs to know.
Newest entries first.

---

## 2026-08-04 — Animated ASCII header on the homepage

**What:** New `src/components/sections/ascii-header.tsx`, mounted above `<Intro />` in
`src/app/(main)/page.tsx`. A full-width banner that renders the "Ink Garden" ASCII-art
effect from [21st.dev/community/ascii](https://21st.dev/community/ascii) on Canvas2D,
with a centered quote (Abelson & Sussman, SICP) sitting over the art.

**How it works.** The effect is reimplemented from scratch — none of the 21st.dev editor
code is used. The exported `INK_GARDEN` preset object holds the full parameter JSON and
the pipeline reads from it, so re-tuning the header means editing the preset, not the
render code.

1. Source is drawn once into a `cols × rows` scratch canvas, so one pixel *is* one cell
   average (`cellSize: 9`). Re-sampled only on resize, not per frame.
2. Color adjustments applied in preset order — brightness → contrast (158) → saturation
   → grayscale → tint (multiply). Baked in at sample time since they never vary per frame.
3. `renderMode: "dither"` — ordered 8×8 Bayer threshold per cell. Mark size and alpha
   scale with how far the cell's luminance clears its threshold. `density: 20` sets mark
   weight; `coverage` and `invert` are honored.
4. `animStyle: "pulse"` at speed 100 / intensity 60 — a sinusoidal breathe on luminance
   that makes the dither pattern bloom in and out. This is the only per-frame work.
5. `bgMode: "none"`, so the page shows through. Ink color is read from the inherited
   `--foreground` CSS var (refreshed every ~30 frames), which is what makes it work in
   both light and dark themes without a theme hook.

**Scope call — only the preset's active branches are implemented.** Every `pfx` effect,
plus `lights`, `mask`, and `blurType`, are disabled in the preset, and `renderMode` is
`"dither"`. Shipping the other ~25 render modes and 9 post-effects would be dead bundle
weight. All preset keys exist and are read; the unused branches just aren't written yet.
Fill them in if the header ever needs to switch modes from config alone.

**The source photo does not exist — read this before touching the component.**
The preset references `/ascii-editor/demos/generated/ref-029.webp`, which is a path
inside the 21st.dev editor sandbox. It is not in this repo and not on the machine.
So `drawInkGarden()` procedurally draws a grayscale garden (bezier stems, leaves, seed
heads, undergrowth haze, seeded PRNG for a stable result) as the default source. Only
luminance matters — the dither pass turns it into ink.
To use a real photo instead: drop it in `public/` and pass `<AsciiHeader src="/photo.webp" />`.
The sampler cover-fits any image and silently falls back to the generated garden if the
file 404s.

**Tuning notes.** First pass was too diffuse — the stems dissolved into scattered dots.
Fixed by lowering the ambient glow (stray ink in the "sky"), giving each stem a soft halo
*plus* a bright core stroke so it survives the dither as a line, enlarging the leaves, and
raising the undergrowth gradient so the growth roots into a dense base.

**Perf / a11y.** rAF loop pauses via `IntersectionObserver` when scrolled out of view.
`prefers-reduced-motion` draws a single static frame — which is why `resize()` and the
photo `onload` both call `draw(0)` when static, since without the rAF loop nothing else
would repaint a canvas that a resize just cleared. Canvas is `aria-hidden`; the quote is
real selectable text with a radial background wash behind it for legibility.

**Verified.** `bun run lint`, `tsc --noEmit`, and `bun run build` all pass. Rendering
confirmed in headless Chrome at desktop and mobile widths. Note: headless screenshots at
narrow window sizes clip the right edge on *every* page (`/blogs` included) — that's a
screenshot viewport artifact, not layout overflow.

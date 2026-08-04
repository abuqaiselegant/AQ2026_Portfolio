"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * "Ink Garden" — the ASCII-art effect from https://21st.dev/community/ascii,
 * reimplemented on Canvas2D. Every knob below comes from the preset; the render
 * pipeline reads from it rather than hard-coding values, so tweaking the preset
 * is enough to re-tune the header.
 *
 * The preset's source photo (/ascii-editor/demos/generated/ref-029.webp) lives in
 * the 21st.dev editor sandbox, not in this repo. Pass `src` to point at a real
 * photo in /public; without one the header samples a procedurally drawn ink
 * garden of the same character (see drawInkGarden).
 */
export const INK_GARDEN = {
  renderMode: "dither",
  bgMode: "none",
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 9,
  coverage: 100,
  invert: false,
  styleBlend: "source-over",
  charSet: "standard",
  customChars: "",
  brightness: 0,
  contrast: 158,
  edgeEmphasis: 0,
  density: 20,
  tint: "#3ca6ff",
  tintOpacity: 0,
  overlayBlend: "multiply",
  saturation: 100,
  grayscale: 0,
  blurType: "off",
  blurAmount: 35,
  animated: true,
  animStyle: "pulse",
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
  lights: { enabled: false, points: [] as { x: number; y: number; radius: number; intensity: number }[] },
  mask: { enabled: false, invert: false, dataUrl: null as string | null },
  pfx: {
    vignette: { enabled: false, intensity: 38 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: false, intensity: 25 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
  },
};

/** Ordered 8x8 Bayer matrix — the threshold map behind renderMode "dither". */
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

/** Small deterministic PRNG so the generated garden is identical every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bezier(p: number[], t: number) {
  const u = 1 - t;
  const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
  const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
  const dx = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
  const dy = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
  return { x, y, angle: Math.atan2(dy, dx) };
}

/**
 * Stand-in for the preset's source photo: a grayscale garden of stems, leaves and
 * seed heads. Only luminance matters — the dither pass turns it into ink.
 */
function drawInkGarden(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rand = mulberry32(20260803);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  // Ambient light the growth sits in. Kept low so the sky stays free of stray ink.
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.86, 0, w * 0.5, h * 0.8, Math.max(w, h) * 0.6);
  glow.addColorStop(0, "rgba(255,255,255,0.3)");
  glow.addColorStop(0.55, "rgba(255,255,255,0.08)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const stems = Math.max(9, Math.round(w / 42));
  const supportsFilter = "filter" in ctx;

  for (let i = 0; i < stems; i++) {
    const x0 = w * ((i + 0.5) / stems) + (rand() - 0.5) * (w / stems) * 0.7;
    const len = h * (0.5 + rand() * 0.48);
    const sway = (rand() - 0.5) * w * 0.13;
    const p = [
      x0, h * 1.02,
      x0 + sway * 0.3, h - len * 0.42,
      x0 + sway, h - len * 0.78,
      x0 + sway * 1.25, h - len,
    ];

    if (supportsFilter) ctx.filter = "blur(1.2px)";
    ctx.lineCap = "round";
    // Soft halo plus a bright core, so a stem survives the dither as a line.
    ctx.strokeStyle = `rgba(255,255,255,${0.28 + rand() * 0.22})`;
    ctx.lineWidth = 3.5 + rand() * 3;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.7 + rand() * 0.3})`;
    ctx.lineWidth = 1.4 + rand() * 1.4;
    ctx.stroke();

    // Leaves paired along the upper half of each stem.
    const leaves = 3 + Math.floor(rand() * 4);
    for (let l = 0; l < leaves; l++) {
      const t = 0.3 + (l / leaves) * 0.62 + rand() * 0.06;
      const at = bezier(p, t);
      const side = l % 2 === 0 ? 1 : -1;
      const leafLen = (16 + rand() * 26) * (1 - t * 0.4);
      ctx.save();
      ctx.translate(at.x, at.y);
      ctx.rotate(at.angle + side * (0.5 + rand() * 0.5));
      ctx.fillStyle = `rgba(255,255,255,${0.45 + rand() * 0.45})`;
      ctx.beginPath();
      ctx.ellipse(leafLen * 0.5, 0, leafLen, leafLen * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Seed head crowning some of the stems.
    if (rand() > 0.3) {
      const tip = bezier(p, 1);
      const r = 9 + rand() * 16;
      const head = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, r);
      head.addColorStop(0, "rgba(255,255,255,0.95)");
      head.addColorStop(0.4, "rgba(255,255,255,0.45)");
      head.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (supportsFilter) ctx.filter = "none";
  }

  // Undergrowth haze so the growth roots into a dense base.
  const soil = ctx.createLinearGradient(0, h * 0.6, 0, h);
  soil.addColorStop(0, "rgba(255,255,255,0)");
  soil.addColorStop(0.7, "rgba(255,255,255,0.3)");
  soil.addColorStop(1, "rgba(255,255,255,0.62)");
  ctx.fillStyle = soil;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function coverFit(sw: number, sh: number, dw: number, dh: number) {
  const s = Math.max(dw / sw, dh / sh);
  const w = sw * s;
  const h = sh * s;
  return { x: (dw - w) / 2, y: (dh - h) / 2, w, h };
}

export function AsciiHeader({ src, className }: { src?: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const p = INK_GARDEN;
    const cell = Math.max(2, p.cellSize);
    const tint = hexToRgb(p.tint);
    const tintOpacity = p.tintOpacity / 100;
    const contrast = p.contrast / 100;
    const brightness = p.brightness * 2.55;
    const saturation = p.saturation / 100;
    const grayscale = p.grayscale / 100;
    const coverage = p.coverage / 100;
    const dotScale = 0.5 + (p.density / 100) * 0.5;
    const speed = p.animSpeed.enabled ? p.animSpeed.intensity / 100 : 0;
    const amp = p.animIntensity.enabled ? p.animIntensity.intensity / 100 : 0;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scratch = document.createElement("canvas");
    const sctx = scratch.getContext("2d", { willReadFrequently: true })!;

    let raf = 0;
    let visible = true;
    let cssW = 0;
    let cssH = 0;
    let cols = 0;
    let rows = 0;
    let cells: Float32Array | null = null;
    let photo: HTMLImageElement | null = null;
    let ink = "#111111";
    let inkAge = 0;

    /**
     * Steps 1-2 of the pipeline: draw the source at grid resolution (one pixel per
     * cell is the cell average) and bake in the colour adjustments of step 4 —
     * they don't change per frame, so only the animation runs in the loop.
     */
    function sample() {
      if (!cssW || !cssH) return;
      cols = Math.ceil(cssW / cell);
      rows = Math.ceil(cssH / cell);
      scratch.width = cols;
      scratch.height = rows;
      sctx.clearRect(0, 0, cols, rows);

      if (photo) {
        const fit = coverFit(photo.naturalWidth, photo.naturalHeight, cols, rows);
        sctx.drawImage(photo, fit.x, fit.y, fit.w, fit.h);
      } else {
        // Draw the garden at display scale, then let drawImage box-filter it down.
        const full = document.createElement("canvas");
        full.width = Math.round(cssW);
        full.height = Math.round(cssH);
        const fctx = full.getContext("2d");
        if (!fctx) return;
        drawInkGarden(fctx, full.width, full.height);
        sctx.drawImage(full, 0, 0, cols, rows);
      }

      const px = sctx.getImageData(0, 0, cols, rows).data;
      const out = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        let r = px[i * 4];
        let g = px[i * 4 + 1];
        let b = px[i * 4 + 2];
        const a = px[i * 4 + 3] / 255;

        r = r * a + brightness;
        g = g * a + brightness;
        b = b * a + brightness;
        r = (r - 128) * contrast + 128;
        g = (g - 128) * contrast + 128;
        b = (b - 128) * contrast + 128;

        let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (saturation !== 1) {
          r = lum + (r - lum) * saturation;
          g = lum + (g - lum) * saturation;
          b = lum + (b - lum) * saturation;
        }
        if (grayscale > 0) {
          r += (lum - r) * grayscale;
          g += (lum - g) * grayscale;
          b += (lum - b) * grayscale;
        }
        if (tintOpacity > 0) {
          // overlayBlend "multiply"
          r += ((r * tint.r) / 255 - r) * tintOpacity;
          g += ((g * tint.g) / 255 - g) * tintOpacity;
          b += ((b * tint.b) / 255 - b) * tintOpacity;
        }
        lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        out[i] = Math.min(1, Math.max(0, p.invert ? 1 - lum : lum));
      }
      cells = out;
    }

    function resize() {
      const rect = host!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (!rect.width || !rect.height) return;
      cssW = rect.width;
      cssH = rect.height;
      canvas!.width = Math.round(cssW * dpr);
      canvas!.height = Math.round(cssH * dpr);
      canvas!.style.width = `${cssW}px`;
      canvas!.style.height = `${cssH}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      sample();
      // Without the rAF loop nothing else would repaint the resized canvas.
      if (isStatic()) draw(0);
    }

    function isStatic() {
      return reduceMotion.matches || !p.animated;
    }

    /** Step 3: one dithered mark per cell, breathing on the "pulse" animation. */
    function draw(time: number) {
      if (!cells) return;
      // bgMode "none" — nothing behind the marks, so the page shows through.
      ctx!.clearRect(0, 0, cssW, cssH);
      ctx!.globalCompositeOperation = p.styleBlend as GlobalCompositeOperation;

      if (inkAge-- <= 0) {
        ink = getComputedStyle(canvas!).color || ink;
        inkAge = 30;
      }
      ctx!.fillStyle = ink;

      const pulse = p.animated && speed > 0 ? 1 + amp * 0.28 * Math.sin(time * 0.0016 * speed) : 1;

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          if (coverage < 1) {
            const h = Math.sin(cx * 12.9898 + cy * 78.233) * 43758.5453;
            if (h - Math.floor(h) > coverage) continue;
          }
          const lum = cells[cy * cols + cx] * pulse;
          const threshold = (BAYER8[(cy & 7) * 8 + (cx & 7)] + 0.5) / 64;
          const v = lum - threshold;
          if (v <= 0) continue;

          const size = cell * dotScale * (0.55 + 0.45 * Math.min(1, v * 2.2));
          const off = (cell - size) / 2;
          ctx!.globalAlpha = Math.min(1, 0.45 + v * 2);
          ctx!.fillRect(cx * cell + off, cy * cell + off, size, size);
        }
      }
      ctx!.globalAlpha = 1;
    }

    function loop(time: number) {
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(raf);
      if (isStatic()) draw(0);
      else raf = requestAnimationFrame(loop);
    }

    if (src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        photo = img;
        sample();
        if (isStatic()) draw(0);
      };
      // Falls back to the generated garden if the photo is missing.
      img.src = src;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    resize();
    start();
    reduceMotion.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      reduceMotion.removeEventListener("change", start);
    };
  }, [src]);

  return (
    <header className={cn("relative mt-2 overflow-hidden rounded-lg border border-border/60", className)}>
      <div className="relative h-[240px] w-full text-foreground md:h-[300px]">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 58% at 50% 46%, var(--background) 0%, color-mix(in oklab, var(--background) 82%, transparent) 45%, transparent 78%)",
          }}
        />
        <figure className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <blockquote className="max-w-md text-balance text-sm leading-relaxed font-medium tracking-tight md:text-base">
            &ldquo;Programs must be written for people to read, and only incidentally for machines to
            execute.&rdquo;
          </blockquote>
          <figcaption className="text-muted-foreground text-xs">Abelson &amp; Sussman, SICP</figcaption>
        </figure>
      </div>
    </header>
  );
}

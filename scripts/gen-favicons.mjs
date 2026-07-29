/**
 * Generate favicon/app-icon PNGs from app/icon.svg.
 * Run: bun run gen:favicons   (uses Node under the hood for sharp/libvips)
 *
 * The source SVG paints its own dark rounded background so the lime glyph stays
 * legible on light surfaces (browser tabs, bookmarks, Google results) — a bare
 * transparent glyph washed out against white.
 *
 * `square: true` flattens the rounded corners onto the same dark, because those
 * targets get masked by the platform: iOS rounds apple-icon itself (a rounded
 * source would be double-rounded) and PWA installers composite `purpose: "any"`
 * icons on their own surface.
 */
import { readFile } from "node:fs/promises";
import sharp from "sharp";

/** Brand ink — matches the manifest `background_color` / `theme_color`. */
const BG = "#0b0d12";

const svg = await readFile("app/icon.svg");

const targets = [
  { path: "app/apple-icon.png", size: 180, square: true },
  { path: "app/icon.png", size: 48, square: false },
  { path: "public/brand/icon-192.png", size: 192, square: true },
  { path: "public/brand/icon-512.png", size: 512, square: true },
];

for (const { path, size, square } of targets) {
  const img = sharp(svg, { density: 384 }).resize(size, size, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  await (square ? img.flatten({ background: BG }) : img).png().toFile(path);
  console.log("✓", path, `${size}×${size}`, square ? "(square)" : "(rounded)");
}

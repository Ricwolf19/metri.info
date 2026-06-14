/**
 * Generate transparent-background favicon/app-icon PNGs from app/icon.svg.
 * Run: bun run gen:favicons   (uses Node under the hood for sharp/libvips)
 */
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("app/icon.svg");

const targets = [
  ["app/apple-icon.png", 180],
  ["app/icon.png", 48],
  ["public/brand/icon-192.png", 192],
  ["public/brand/icon-512.png", 512],
];

for (const [path, size] of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path);
  console.log("✓", path, `${size}×${size}`);
}

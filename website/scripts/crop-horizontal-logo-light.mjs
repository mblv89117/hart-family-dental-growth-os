/**
 * Derives light-UI horizontal lockup from approved brand asset.
 *
 * Source: public/brand/hart-family-dental-logo-horizontal.png (1200×600, white canvas)
 * Output:
 *   - hart-family-dental-logo-horizontal-light.png (tight crop, white→transparent)
 *   - hart-family-dental-logo-horizontal-light-880.png (retina-friendly width)
 *
 * Does not invent a new mark — crops padding only.
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brand = path.join(__dirname, "../public/brand");
const src = path.join(brand, "hart-family-dental-logo-horizontal.png");

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
let minx = w,
  miny = h,
  maxx = 0,
  maxy = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const lum = (r + g + b) / 3;
    const colorful = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) > 12;
    if (lum > 248 && !colorful) continue;
    if (x < minx) minx = x;
    if (y < miny) miny = y;
    if (x > maxx) maxx = x;
    if (y > maxy) maxy = y;
  }
}
const pad = 12;
minx = Math.max(0, minx - pad);
miny = Math.max(0, miny - pad);
maxx = Math.min(w - 1, maxx + pad);
maxy = Math.min(h - 1, maxy + pad);
const cw = maxx - minx + 1;
const ch = maxy - miny + 1;

const cropped = await sharp(src)
  .extract({ left: minx, top: miny, width: cw, height: ch })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.from(cropped.data);
for (let i = 0; i < out.length; i += 4) {
  const r = out[i],
    g = out[i + 1],
    b = out[i + 2];
  const lum = (r + g + b) / 3;
  const colorful = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) > 10;
  if (lum >= 245 && !colorful) {
    const t = Math.min(1, Math.max(0, (252 - lum) / 7));
    out[i + 3] = Math.round(255 * t);
  }
}

const base = await sharp(out, {
  raw: { width: cropped.info.width, height: cropped.info.height, channels: 4 },
}).png()
  .toBuffer();

const full = path.join(brand, "hart-family-dental-logo-horizontal-light.png");
const sm = path.join(brand, "hart-family-dental-logo-horizontal-light-880.png");
await sharp(base).png({ compressionLevel: 9 }).toFile(full);
await sharp(full).resize({ width: 880, withoutEnlargement: true }).png().toFile(sm);
console.log("Wrote", full, `(${cw}×${ch} from pad crop)`);
console.log("Wrote", sm);

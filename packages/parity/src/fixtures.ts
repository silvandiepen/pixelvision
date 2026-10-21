import type { Fixture } from "./fixtures.model";
import { seededRandom } from "./random";

/**
 * Builds an RGBA fixture by evaluating a colour per pixel.
 *
 * @param name - Fixture name, shown in test titles.
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param colour - Returns `[r, g, b, a]` for a pixel.
 * @returns The fixture.
 */
const paint = (
  name: string,
  width: number,
  height: number,
  colour: (x: number, y: number) => readonly [number, number, number, number],
): Fixture => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set(colour(x, y), (y * width + x) * 4);
    }
  }
  return { name, width, height, data };
};

/**
 * Uniform colour noise; every channel independent.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param seed - Random seed.
 * @returns The fixture.
 */
export const noise = (width: number, height: number, seed = 1): Fixture => {
  const random = seededRandom(seed);
  const byte = () => Math.floor(random() * 256);
  return paint(`noise ${width}x${height} #${seed}`, width, height, () => [
    byte(),
    byte(),
    byte(),
    byte(),
  ]);
};

/**
 * Smooth horizontal and vertical colour ramps.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @returns The fixture.
 */
export const gradient = (width: number, height: number): Fixture =>
  paint(`gradient ${width}x${height}`, width, height, (x, y) => [
    Math.round((x / Math.max(1, width - 1)) * 255),
    Math.round((y / Math.max(1, height - 1)) * 255),
    Math.round(((x + y) / Math.max(1, width + height - 2)) * 255),
    255,
  ]);

/**
 * Flat shapes with hard edges: a bright rectangle, a dark disc and a
 * diagonal band on a mid-gray background.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @returns The fixture.
 */
export const shapes = (width: number, height: number): Fixture => {
  const cx = width * 0.7;
  const cy = height * 0.6;
  const radius = Math.min(width, height) * 0.2;
  return paint(`shapes ${width}x${height}`, width, height, (x, y) => {
    if (x > width * 0.1 && x < width * 0.45 && y > height * 0.15 && y < height * 0.5) {
      return [240, 230, 210, 255];
    }
    if ((x - cx) ** 2 + (y - cy) ** 2 < radius ** 2) return [20, 40, 90, 255];
    if (Math.abs(x - y) < 3) return [200, 30, 30, 255];
    return [120, 120, 120, 255];
  });
};

/**
 * A light card with rounded corners, slightly rotated, on a noisy dark
 * surface: the scene document detection has to handle.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param seed - Random seed for the surface texture.
 * @returns The fixture.
 */
export const card = (width: number, height: number, seed = 7): Fixture => {
  const random = seededRandom(seed);
  const angle = 0.08;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const halfW = width * 0.32;
  const halfH = halfW / 1.586;
  const radius = halfH * 0.12;
  return paint(`card ${width}x${height} #${seed}`, width, height, (x, y) => {
    const dx = x - width / 2;
    const dy = y - height / 2;
    const u = Math.abs(dx * cos + dy * sin);
    const v = Math.abs(-dx * sin + dy * cos);
    const qx = Math.max(u - (halfW - radius), 0);
    const qy = Math.max(v - (halfH - radius), 0);
    const inside = u < halfW && v < halfH && qx * qx + qy * qy < radius * radius;
    const grain = Math.floor(random() * 40);
    return inside
      ? [225 - grain / 4, 220 - grain / 4, 205, 255]
      : [40 + grain, 35 + grain, 30 + grain, 255];
  });
};

/**
 * Random colours drawn from a skin-tone palette next to random noise, so
 * both sides of every skin-detection rule are exercised.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param seed - Random seed.
 * @returns The fixture.
 */
export const skinTones = (width: number, height: number, seed = 13): Fixture => {
  const random = seededRandom(seed);
  const around = (centre: number, spread: number) =>
    Math.max(0, Math.min(255, Math.round(centre + (random() - 0.5) * spread)));
  return paint(`skin tones ${width}x${height} #${seed}`, width, height, (x) =>
    x % 2 === 0
      ? [around(190, 120), around(130, 120), around(100, 120), 255]
      : [around(128, 256), around(128, 256), around(128, 256), 255],
  );
};

/**
 * The standard fixture set: every algorithm is checked against all of
 * these, including sizes that aren't multiples of 4 and 1-pixel edges.
 */
export const standardFixtures: readonly Fixture[] = [
  noise(64, 48, 1),
  noise(33, 17, 2),
  noise(1, 1, 3),
  noise(7, 1, 4),
  noise(1, 9, 5),
  gradient(80, 60),
  shapes(96, 72),
  card(160, 120),
  card(161, 97, 11),
  skinTones(40, 30),
];

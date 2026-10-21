import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { ImageLike, Matrix } from "../core/matrix.model";
import { roundHalfEven, saturateU8 } from "../core/round";

// The 8-bit conversions below follow OpenCV's (Apache-2.0) `cvtColor` for
// `CV_8U` step by step, including its single-precision arithmetic, so the
// results are identical to OpenCV's.

const f32 = Math.fround;
const INV_255 = f32(1 / 255);

const SHIFT = 12;
const HALF = 1 << (SHIFT - 1);
// OpenCV's integer division tables for 8-bit RGB → HSV.
const SDIV = Int32Array.from({ length: 256 }, (_, i) => (i ? Math.round((255 << SHIFT) / i) : 0));
const HDIV = Int32Array.from({ length: 256 }, (_, i) =>
  i ? Math.round((180 << SHIFT) / (6 * i)) : 0,
);

/** Hue step per stored unit, from 0–179 to sixths of the wheel. */
const HUE_TO_SECTOR = f32(6 / 180);
/** Which of the four candidate values feed B, G and R in each sixth of the wheel. */
const SECTORS = [
  [1, 3, 0],
  [1, 0, 2],
  [3, 0, 1],
  [0, 2, 1],
  [0, 1, 3],
  [2, 1, 0],
] as const;

/**
 * Checks that an image holds enough data for its size and returns its
 * channel count.
 *
 * @param fn - Calling function, for the error message.
 * @param image - The image.
 * @returns Values per pixel (4 for `ImageData`).
 * @throws {RangeError} When the data is shorter than its size needs.
 */
function rgbChannels(fn: string, image: ImageLike): number {
  const channels = image.channels ?? 4;
  const needed = image.width * image.height * channels;
  if (image.data.length < needed || channels < 3) {
    throw new RangeError(
      `${fn}: image needs 3 or more channels and ${needed} values, got ${channels} channel(s) and ${image.data.length} values`,
    );
  }
  return channels;
}

/**
 * Runs a per-pixel colour conversion from RGB(A) pixels to a 3-channel
 * matrix.
 *
 * @param fn - Calling function, for the error message.
 * @param image - RGBA pixels or a 3- or 4-channel matrix in RGB order.
 * @param out - Optional output matrix.
 * @param convert - Writes the converted pixel at `o` from R, G and B.
 * @returns The 3-channel `u8` matrix.
 */
function fromRgb(
  fn: string,
  image: ImageLike,
  out: Matrix<"u8"> | undefined,
  convert: (r: number, g: number, b: number, dst: Uint8Array, o: number) => void,
): Matrix<"u8"> {
  const channels = rgbChannels(fn, image);
  const { width, height, data } = image;
  const result = prepareOutput(out, "u8", width, height, 3);
  const pixels = width * height;
  for (let p = 0, i = 0, o = 0; p < pixels; p++, i += channels, o += 3) {
    convert(data[i], data[i + 1], data[i + 2], result.data, o);
  }
  return result;
}

/**
 * Runs a per-pixel colour conversion from a 3-channel matrix back to RGB.
 *
 * @param fn - Calling function, for the error message.
 * @param image - 3-channel `u8` matrix.
 * @param out - Optional output matrix.
 * @param convert - Writes R, G, B at `o` from the three input values.
 * @returns The 3-channel RGB `u8` matrix.
 */
function toRgb(
  fn: string,
  image: Matrix<"u8">,
  out: Matrix<"u8"> | undefined,
  convert: (a: number, b: number, c: number, dst: Uint8Array, o: number) => void,
): Matrix<"u8"> {
  assertType(fn, image, "u8");
  assertChannels(fn, image, 3);
  const { width, height, data } = image;
  const result = prepareOutput(out, "u8", width, height, 3);
  const length = width * height * 3;
  for (let i = 0; i < length; i += 3) convert(data[i], data[i + 1], data[i + 2], result.data, i);
  return result;
}

/**
 * Converts colour pixels to HSV the way OpenCV does for 8-bit images
 * (`COLOR_RGB2HSV`): hue 0–179 (degrees / 2), saturation and value 0–255.
 * Use it with {@link inRange} to select colours regardless of brightness.
 *
 * @param image - RGBA pixels (`ImageData`), or a 3- or 4-channel `u8` matrix in RGB order.
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of H, S, V.
 * @throws {RangeError} When the data is shorter than its size needs or has fewer than 3 channels.
 *
 * @example
 * const hsv = rgbToHsv(context.getImageData(0, 0, width, height));
 */
export function rgbToHsv(image: ImageLike, out?: Matrix<"u8">): Matrix<"u8"> {
  return fromRgb("rgbToHsv", image, out, (r, g, b, dst, o) => {
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const s = (diff * SDIV[v] + HALF) >> SHIFT;
    let h = v === r ? g - b : v === g ? b - r + 2 * diff : r - g + 4 * diff;
    h = (h * HDIV[diff] + HALF) >> SHIFT;
    if (h < 0) h += 180;
    dst[o] = h;
    dst[o + 1] = s;
    dst[o + 2] = v;
  });
}

/**
 * Converts HSV pixels back to RGB, as OpenCV's `COLOR_HSV2RGB` for 8-bit
 * images: hue 0–179 (degrees / 2), saturation and value 0–255. Hue 180 and
 * above wraps round the wheel.
 *
 * @param image - 3-channel `u8` matrix of H, S, V (e.g. from {@link rgbToHsv}).
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of R, G, B.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it doesn't have 3 channels.
 *
 * @example
 * // Shift every hue by 30° and convert back.
 * const hsv = rgbToHsv(frame);
 * for (let i = 0; i < hsv.data.length; i += 3) hsv.data[i] = (hsv.data[i] + 15) % 180;
 * const shifted = hsvToRgb(hsv);
 */
export function hsvToRgb(image: Matrix<"u8">, out?: Matrix<"u8">): Matrix<"u8"> {
  return toRgb("hsvToRgb", image, out, (hue, sat, val, dst, o) => {
    const s = f32(sat * INV_255);
    const v = f32(val * INV_255);
    let b = v;
    let g = v;
    let r = v;
    if (s !== 0) {
      let h = f32(hue * HUE_TO_SECTOR);
      const sector = Math.floor(h);
      h = f32(h - sector);
      const tab = [
        v,
        f32(v * f32(1 - s)),
        f32(v * f32(1 - f32(s * h))),
        f32(v * f32(1 - f32(s * f32(1 - h)))),
      ];
      const pick = SECTORS[sector % 6];
      b = tab[pick[0]];
      g = tab[pick[1]];
      r = tab[pick[2]];
    }
    dst[o] = saturateU8(f32(r * 255));
    dst[o + 1] = saturateU8(f32(g * 255));
    dst[o + 2] = saturateU8(f32(b * 255));
  });
}

/**
 * Converts colour pixels to HLS as OpenCV's `COLOR_RGB2HLS` does for 8-bit
 * images: hue 0–179 (degrees / 2), lightness and saturation 0–255.
 * Lightness is the midpoint of the brightest and darkest channel, so white
 * is 255 and every pure hue is 128.
 *
 * @param image - RGBA pixels (`ImageData`), or a 3- or 4-channel `u8` matrix in RGB order.
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of H, L, S.
 * @throws {RangeError} When the data is shorter than its size needs or has fewer than 3 channels.
 *
 * @example
 * const hls = rgbToHls(context.getImageData(0, 0, width, height));
 * const lightness = hls.data[(y * hls.width + x) * 3 + 1];
 */
export function rgbToHls(image: ImageLike, out?: Matrix<"u8">): Matrix<"u8"> {
  return fromRgb("rgbToHls", image, out, (red, green, blue, dst, o) => {
    const r = f32(red * INV_255);
    const g = f32(green * INV_255);
    const b = f32(blue * INV_255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let diff = f32(max - min);
    const sum = f32(max + min);
    const l = f32(sum * 0.5);
    let h = 0;
    let s = 0;
    if (diff > 0) {
      s = l < 0.5 ? f32(diff / sum) : f32(diff / f32(f32(2 - max) - min));
      diff = f32(60 / diff);
      if (max === r) h = f32(f32(g - b) * diff);
      else if (max === g) h = f32(f32(f32(b - r) * diff) + 120);
      else h = f32(f32(f32(r - g) * diff) + 240);
      if (h < 0) h = f32(h + 360);
    }
    dst[o] = saturateU8(f32(h * 0.5));
    dst[o + 1] = saturateU8(f32(l * 255));
    dst[o + 2] = saturateU8(f32(s * 255));
  });
}

/**
 * Converts HLS pixels back to RGB, as OpenCV's `COLOR_HLS2RGB` for 8-bit
 * images: hue 0–179 (degrees / 2), lightness and saturation 0–255.
 *
 * @param image - 3-channel `u8` matrix of H, L, S (e.g. from {@link rgbToHls}).
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of R, G, B.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it doesn't have 3 channels.
 *
 * @example
 * // Lighten every pixel by 20 levels of lightness.
 * const hls = rgbToHls(frame);
 * for (let i = 1; i < hls.data.length; i += 3) hls.data[i] = Math.min(255, hls.data[i] + 20);
 * const lighter = hlsToRgb(hls);
 */
export function hlsToRgb(image: Matrix<"u8">, out?: Matrix<"u8">): Matrix<"u8"> {
  return toRgb("hlsToRgb", image, out, (hue, light, sat, dst, o) => {
    const l = f32(light * INV_255);
    const s = f32(sat * INV_255);
    let b = l;
    let g = l;
    let r = l;
    if (s !== 0) {
      const p2 = l <= 0.5 ? f32(l * f32(1 + s)) : f32(f32(l + s) - f32(l * s));
      const p1 = f32(f32(2 * l) - p2);
      let h = f32(hue * HUE_TO_SECTOR);
      const sector = Math.floor(h);
      h = f32(h - sector);
      const tab = [
        p2,
        p1,
        f32(p1 + f32(f32(p2 - p1) * f32(1 - h))),
        f32(p1 + f32(f32(p2 - p1) * h)),
      ];
      const pick = SECTORS[sector % 6];
      b = tab[pick[0]];
      g = tab[pick[1]];
      r = tab[pick[2]];
    }
    dst[o] = saturateU8(f32(r * 255));
    dst[o + 1] = saturateU8(f32(g * 255));
    dst[o + 2] = saturateU8(f32(b * 255));
  });
}

/** RGB → YCrCb luma weights and chroma scales, fixed point with 14 fraction bits. */
const Y_SHIFT = 14;
const Y_ROUND = 1 << (Y_SHIFT - 1);
const R2Y = 4899;
const G2Y = 9617;
const B2Y = 1868;
const Y2CR = 11682;
const Y2CB = 9241;
const CHROMA_OFFSET = 128 << Y_SHIFT;
const CR2R = 22987;
const CR2G = -11698;
const CB2G = -5636;
const CB2B = 29049;

/**
 * Converts colour pixels to YCrCb (the JPEG colour space) as OpenCV's
 * `COLOR_RGB2YCrCb` for 8-bit images: Y is the luma, Cr and Cb the red and
 * blue difference centred on 128. Skin tones fall in a compact Cr/Cb range
 * whatever their brightness.
 *
 * @param image - RGBA pixels (`ImageData`), or a 3- or 4-channel `u8` matrix in RGB order.
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of Y, Cr, Cb.
 * @throws {RangeError} When the data is shorter than its size needs or has fewer than 3 channels.
 *
 * @example
 * const ycrcb = rgbToYCrCb(frame);
 * const skin = inRange(ycrcb, [0, 133, 77], [255, 173, 127]);
 */
export function rgbToYCrCb(image: ImageLike, out?: Matrix<"u8">): Matrix<"u8"> {
  return fromRgb("rgbToYCrCb", image, out, (r, g, b, dst, o) => {
    const y = (r * R2Y + g * G2Y + b * B2Y + Y_ROUND) >> Y_SHIFT;
    dst[o] = y;
    dst[o + 1] = saturateU8(((r - y) * Y2CR + CHROMA_OFFSET + Y_ROUND) >> Y_SHIFT);
    dst[o + 2] = saturateU8(((b - y) * Y2CB + CHROMA_OFFSET + Y_ROUND) >> Y_SHIFT);
  });
}

/**
 * Converts YCrCb pixels back to RGB, as OpenCV's `COLOR_YCrCb2RGB` for
 * 8-bit images.
 *
 * @param image - 3-channel `u8` matrix of Y, Cr, Cb (e.g. from {@link rgbToYCrCb}).
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of R, G, B.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it doesn't have 3 channels.
 *
 * @example
 * // Equalise only the brightness, then convert back.
 * const ycrcb = rgbToYCrCb(frame);
 * const rgb = yCrCbToRgb(ycrcb);
 */
export function yCrCbToRgb(image: Matrix<"u8">, out?: Matrix<"u8">): Matrix<"u8"> {
  return toRgb("yCrCbToRgb", image, out, (y, crIn, cbIn, dst, o) => {
    const cr = crIn - 128;
    const cb = cbIn - 128;
    dst[o] = saturateU8(y + ((cr * CR2R + Y_ROUND) >> Y_SHIFT));
    dst[o + 1] = saturateU8(y + ((cb * CB2G + cr * CR2G + Y_ROUND) >> Y_SHIFT));
    dst[o + 2] = saturateU8(y + ((cb * CB2B + Y_ROUND) >> Y_SHIFT));
  });
}

/** Lookup tables of OpenCV's bit-exact 8-bit Lab conversion. */
interface LabTables {
  /** sRGB byte → linear light, 0–2040 (8 × 255). */
  gamma: Uint16Array;
  /** Linear 0–3071 (/2040) → Lab's f(t), fixed point with 15 fraction bits. */
  cbrt: Uint16Array;
  /** Linear 0–4095 (/4096) → sRGB byte. */
  inverseGamma: Uint16Array;
  /** L byte → [Y, f(Y)], fixed point with 14 fraction bits. */
  lToY: Uint16Array;
  /** f(t) in fixed point (offset by {@link AB_MIN}) → t, fixed point with 14 fraction bits. */
  fToXz: Int32Array;
}

const LAB_SHIFT = 12;
const LAB_SHIFT2 = 15;
const LUT_BASE = 1 << 14;
/** Smallest f(t) in fixed point that a/b bytes can produce. */
const AB_MIN = -8145;
// sRGB → XYZ (D65), divided by the white point, fixed point with 12 fraction bits.
const RGB_TO_XYZ = [1777, 1541, 778, 871, 2929, 296, 73, 448, 3575];
// XYZ → sRGB, times the white point, fixed point with 12 fraction bits.
const XYZ_TO_RGB = [12615, -6296, -2223, -3773, 7684, 185, 217, -836, 4715];
const L_SCALE = 296; // round(116 · 255 / 100)
const L_OFFSET = -1336934; // −16 · 255 / 100 in 15-bit fixed point

let labTables: LabTables | undefined;

/**
 * sRGB companding: encoded value (0–1) to linear light.
 *
 * @param x - Encoded value.
 * @returns Linear value.
 */
const applyGamma = (x: number): number =>
  x <= 809 / 20000 ? x / (323 / 25) : Math.pow((x + 11 / 200) / (1 + 11 / 200), 12 / 5);

/**
 * Inverse sRGB companding: linear light (0–1) to encoded value.
 *
 * @param x - Linear value.
 * @returns Encoded value.
 */
const applyInverseGamma = (x: number): number =>
  x <= 7827 / 2500000 ? x * (323 / 25) : Math.pow(x, 1 / (12 / 5)) * (1 + 11 / 200) - 11 / 200;

const bits = new DataView(new ArrayBuffer(8));

/**
 * Cube root of a positive single-precision number, computed as OpenCV's
 * `cv::cbrt(softfloat)`: a rational polynomial on the mantissa, whose
 * result is truncated (not rounded) to single precision. The Lab tables
 * are built with it, so it has to match bit for bit.
 *
 * @param x - A positive number (already single precision).
 * @returns Its cube root.
 */
function cbrtF32(x: number): number {
  bits.setFloat32(0, x);
  const word = bits.getUint32(0);
  const exponent = ((word >>> 23) & 0xff) - 127;
  let shift = exponent % 3;
  if (shift >= 0) shift -= 3;
  const rootExponent = (exponent - shift) / 3 - 1;
  // 0.125 <= fr < 1
  const fr = (1 + (word & 0x7fffff) / 0x800000) * 2 ** shift;
  const root =
    ((((45.2548339756803 * fr + 192.2798368355061) * fr + 119.16548242855816) * fr +
      13.432501390862399) *
      fr +
      0.16361612265857542) /
    ((((14.808840932191346 * fr + 151.97140510444356) * fr + 168.52544141015682) * fr +
      33.99059413502156) *
      fr +
      1);
  bits.setFloat64(0, root);
  const mantissa = ((bits.getUint32(0) & 0xfffff) << 3) | (bits.getUint32(4) >>> 29);
  return (1 + mantissa / 0x800000) * 2 ** rootExponent;
}

/**
 * Builds the Lab tables once, in single precision as OpenCV builds them.
 *
 * @returns The tables.
 */
function getLabTables(): LabTables {
  if (labTables) return labTables;
  const gamma = new Uint16Array(256);
  for (let i = 0; i < 256; i++) gamma[i] = roundHalfEven(f32(2040 * f32(applyGamma(f32(i / 255)))));

  const threshold = f32(216 / 24389);
  const slope = f32(841 / 108);
  const bias = f32(16 / 116);
  const step = f32(1 / 2040);
  const cbrt = new Uint16Array(3072);
  for (let i = 0; i < cbrt.length; i++) {
    const x = f32(step * i);
    const fx = x < threshold ? f32(x * slope + bias) : cbrtF32(x);
    cbrt[i] = roundHalfEven(32768 * fx);
  }

  const inverseGamma = new Uint16Array(4096);
  for (let i = 0; i < 4096; i++) {
    inverseGamma[i] = roundHalfEven(f32(255 * f32(applyInverseGamma(i / 4096))));
  }

  const lToY = new Uint16Array(512);
  for (let i = 0; i < 256; i++) {
    let y: number;
    let fy: number;
    if (i <= 20) {
      y = roundHalfEven(f32(f32(i * LUT_BASE * 180) / (17 * 24389)));
      fy = roundHalfEven(LUT_BASE * f32(f32(16 / 116) + f32(f32(i * 5) / (3 * 17 * 29))));
    } else {
      const t = f32(f32(f32(i * 100 * LUT_BASE) / (255 * 116)) + f32((16 * LUT_BASE) / 116));
      fy = roundHalfEven(t);
      y = roundHalfEven(f32(f32(f32(t * t) * t) / (LUT_BASE * LUT_BASE)));
    }
    lToY[i * 2] = y;
    lToY[i * 2 + 1] = fy;
  }

  const fToXz = new Int32Array((LUT_BASE * 9) / 4);
  const offset = Math.trunc((Math.trunc((LUT_BASE * 16) / 116) * 108) / 841);
  for (let i = AB_MIN; i < fToXz.length + AB_MIN; i++) {
    fToXz[i - AB_MIN] =
      i <= 3390
        ? Math.trunc((i * 108) / 841) - offset
        : Math.trunc((Math.trunc((i * i) / LUT_BASE) * i) / LUT_BASE);
  }
  labTables = { gamma, cbrt, inverseGamma, lToY, fToXz };
  return labTables;
}

/**
 * Converts colour pixels to CIE L*a*b* as OpenCV's `COLOR_RGB2Lab` does for
 * 8-bit images (sRGB, D65 white): L is scaled to 0–255 (L* · 255 / 100),
 * a and b are offset by 128. Distances in Lab follow perceived colour
 * difference far better than in RGB.
 *
 * @param image - RGBA pixels (`ImageData`), or a 3- or 4-channel `u8` matrix in RGB order.
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of L, a, b.
 * @throws {RangeError} When the data is shorter than its size needs or has fewer than 3 channels.
 *
 * @example
 * const lab = rgbToLab(frame);
 * // L* of the first pixel, 0–100:
 * const lightness = (lab.data[0] * 100) / 255;
 */
export function rgbToLab(image: ImageLike, out?: Matrix<"u8">): Matrix<"u8"> {
  const { gamma, cbrt } = getLabTables();
  const [c0, c1, c2, c3, c4, c5, c6, c7, c8] = RGB_TO_XYZ;
  const round1 = 1 << (LAB_SHIFT - 1);
  const round2 = 1 << (LAB_SHIFT2 - 1);
  const abOffset = (128 << LAB_SHIFT2) + round2;
  return fromRgb("rgbToLab", image, out, (red, green, blue, dst, o) => {
    const r = gamma[red];
    const g = gamma[green];
    const b = gamma[blue];
    const fx = cbrt[(r * c0 + g * c1 + b * c2 + round1) >> LAB_SHIFT];
    const fy = cbrt[(r * c3 + g * c4 + b * c5 + round1) >> LAB_SHIFT];
    const fz = cbrt[(r * c6 + g * c7 + b * c8 + round1) >> LAB_SHIFT];
    dst[o] = saturateU8((L_SCALE * fy + L_OFFSET + round2) >> LAB_SHIFT2);
    dst[o + 1] = saturateU8((500 * (fx - fy) + abOffset) >> LAB_SHIFT2);
    dst[o + 2] = saturateU8((200 * (fy - fz) + abOffset) >> LAB_SHIFT2);
  });
}

/**
 * Converts L*a*b* pixels back to RGB, as OpenCV's `COLOR_Lab2RGB` for 8-bit
 * images (sRGB, D65 white). Lab colours outside the sRGB gamut are clipped.
 *
 * @param image - 3-channel `u8` matrix of L, a, b (e.g. from {@link rgbToLab}).
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of R, G, B.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it doesn't have 3 channels.
 *
 * @example
 * // Raise the contrast of the lightness only, keeping the colours.
 * const lab = rgbToLab(frame);
 * const rgb = labToRgb(lab);
 */
export function labToRgb(image: Matrix<"u8">, out?: Matrix<"u8">): Matrix<"u8"> {
  const { inverseGamma, lToY, fToXz } = getLabTables();
  const [c0, c1, c2, c3, c4, c5, c6, c7, c8] = XYZ_TO_RGB;
  const shift = LAB_SHIFT + 2;
  const round = 1 << (shift - 1);
  const clamp = (v: number) => (v < 0 ? 0 : v > 4095 ? 4095 : v);
  const aOffset = Math.trunc((128 * LUT_BASE) / 500);
  const bOffset = Math.trunc((128 * LUT_BASE) / 200) - 1;
  return toRgb("labToRgb", image, out, (l, a, bIn, dst, o) => {
    const y = lToY[l * 2];
    const fy = lToY[l * 2 + 1];
    // a / 500 and b / 200 in fixed point, as OpenCV approximates them.
    const adiv = ((5 * a * 53687 + (1 << 7)) >> 13) - aOffset;
    const bdiv = ((bIn * 41943 + (1 << 4)) >> 9) - bOffset;
    const x = fToXz[fy + adiv - AB_MIN];
    const z = fToXz[fy - bdiv - AB_MIN];
    dst[o] = inverseGamma[clamp((c0 * x + c1 * y + c2 * z + round) >> shift)];
    dst[o + 1] = inverseGamma[clamp((c3 * x + c4 * y + c5 * z + round) >> shift)];
    dst[o + 2] = inverseGamma[clamp((c6 * x + c7 * y + c8 * z + round) >> shift)];
  });
}

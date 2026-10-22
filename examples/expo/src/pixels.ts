import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { decode } from "jpeg-js";
import type { ImageSource, Photo } from "./pixels.model";

/** Photos are scaled down to at most this many pixels on their longer side. */
export const MAX_SIZE = 1280;

/**
 * Decodes JPEG bytes to RGBA pixels, in plain JavaScript (no DOM, no native
 * code), so it runs the same in Hermes and in Node.
 *
 * @param bytes - The JPEG file's bytes.
 * @returns Its RGBA pixels.
 * @throws {Error} When the bytes aren't a JPEG it can read.
 */
export function decodeJpeg(bytes: Uint8Array): Photo["image"] {
  const { width, height, data } = decode(bytes, { useTArray: true, formatAsRGBA: true });
  return { width, height, data };
}

/**
 * The size an image is scaled to: unchanged when it fits in
 * {@link MAX_SIZE}, otherwise scaled down to fit.
 *
 * @param width - Its width.
 * @param height - Its height.
 * @returns The width and height to use.
 */
export function fitSize(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, MAX_SIZE / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Reads a photo: scales it down to {@link MAX_SIZE}, saves it as a JPEG
 * (which also turns HEIC and PNG into one format), and decodes the JPEG.
 *
 * @param source - The image and its size.
 * @returns The JPEG's URI and its pixels.
 * @throws {Error} When the image can't be read or decoded.
 */
export async function readPhoto(source: ImageSource): Promise<Photo> {
  const context = ImageManipulator.manipulate(source.uri);
  try {
    const rendered = await context.resize(fitSize(source.width, source.height)).renderAsync();
    try {
      const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
      const bytes = new Uint8Array(await new File(saved.uri).arrayBuffer());
      return { uri: saved.uri, image: decodeJpeg(bytes) };
    } finally {
      rendered.release();
    }
  } finally {
    context.release();
  }
}

/**
 * Finds a bundled image on disk, copying it out of the app bundle (or from
 * the development server) when needed.
 *
 * @param asset - The asset id from `import`ing the image.
 * @returns The image's local URI and size.
 * @throws {Error} When the asset can't be loaded.
 */
export async function bundledImage(asset: number): Promise<ImageSource> {
  const loaded = await Asset.fromModule(asset).downloadAsync();
  if (!loaded.localUri || !loaded.width || !loaded.height) {
    throw new Error("The sample image couldn't be loaded.");
  }
  return { uri: loaded.localUri, width: loaded.width, height: loaded.height };
}

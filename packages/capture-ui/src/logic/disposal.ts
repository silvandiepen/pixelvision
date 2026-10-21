import type { BlobUrlApi, BlobUrls, ImageTarget, SizedSurface } from "./disposal.model";

/**
 * Frees a canvas's pixels by setting its size to zero. Browsers release the backing store, and
 * the captured image can no longer be read back from it.
 *
 * @param canvas - The canvas, or undefined.
 */
export function zeroCanvas(canvas: SizedSurface | undefined): void {
  if (!canvas) return;
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Creates a registry of Blob URLs: every URL made through it can be revoked at once.
 *
 * @param api - Where `createObjectURL` and `revokeObjectURL` come from (default `URL`).
 * @returns The registry.
 *
 * @example
 * const urls = createBlobUrls();
 * img.src = urls.create(blob);
 * // later, on dispose:
 * urls.revokeAll();
 */
export function createBlobUrls(api: BlobUrlApi = URL): BlobUrls {
  const alive = new Set<string>();
  return {
    create(blob) {
      const url = api.createObjectURL(blob);
      alive.add(url);
      return url;
    },
    revoke(url) {
      if (!alive.delete(url)) return;
      api.revokeObjectURL(url);
    },
    revokeAll() {
      alive.forEach((url) => api.revokeObjectURL(url));
      alive.clear();
    },
    get size() {
      return alive.size;
    },
  };
}

/**
 * Shows a blob in an image and revokes its Blob URL as soon as the image has loaded or failed,
 * so no URL to the capture outlives the moment it is decoded. The decoded picture stays visible
 * until the image's `src` is removed.
 *
 * @param image - The `<img>`.
 * @param blob - The encoded image.
 * @param urls - The registry the URL is created in.
 * @param signal - Aborting it stops waiting (the URL is revoked then too).
 * @returns True once the image shows the blob; false when it failed to decode or was aborted.
 */
export function showBlobImage(
  image: ImageTarget,
  blob: Blob,
  urls: BlobUrls,
  signal?: AbortSignal,
): Promise<boolean> {
  if (signal?.aborted) return Promise.resolve(false);
  const url = urls.create(blob);
  return new Promise<boolean>((resolve) => {
    const finish = (shown: boolean) => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
      urls.revoke(url);
      resolve(shown);
    };
    function onLoad() {
      finish(true);
    }
    function onError() {
      image.removeAttribute("src");
      finish(false);
    }
    function onAbort() {
      finish(false);
    }
    image.addEventListener("load", onLoad);
    image.addEventListener("error", onError);
    signal?.addEventListener("abort", onAbort);
    image.src = url;
  });
}

import bundledSource from "haar-worker:inline";

/**
 * Starts the built-in detection worker from a Blob URL, so it works
 * without bundler configuration. Returns undefined where workers or Blob
 * URLs aren't available (server rendering, very old browsers), and the
 * element then detects on the main thread. A Content Security Policy that
 * blocks Blob workers makes the worker fail on its first frame; the
 * elements then fall back to the main thread as well.
 *
 * @param workerSource - The worker's code (default the bundled worker).
 * @returns The worker, or undefined.
 */
export function createInlineWorker(workerSource: string = bundledSource): Worker | undefined {
  if (!workerSource || typeof Worker === "undefined" || typeof Blob === "undefined") {
    return undefined;
  }
  try {
    const url = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(url, { type: "module" });
    // The worker has fetched its script long before this; revoke the URL then.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return worker;
  } catch {
    return undefined;
  }
}

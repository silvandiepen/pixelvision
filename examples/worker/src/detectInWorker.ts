import type { DetectResponse, DetectResult } from "./detect.model";

const worker = new Worker(new URL("./detect.worker.ts", import.meta.url), { type: "module" });
const pending = new Map<number, (response: DetectResponse) => void>();
let nextId = 0;

worker.addEventListener("message", (event: MessageEvent<DetectResponse>) => {
  pending.get(event.data.id)?.(event.data);
  pending.delete(event.data.id);
});

/**
 * Finds the edges and the document in a photo, in the worker. The photo's
 * pixels are moved to the worker, so don't use `image` afterwards.
 *
 * @param image - The photo's RGBA pixels.
 * @returns The edge map, and the document's corners or null.
 * @throws {Error} When detection fails in the worker.
 */
export function detectInWorker(image: ImageData): Promise<DetectResult> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, (response) =>
      response.error === undefined ? resolve(response.result) : reject(new Error(response.error)),
    );
    worker.postMessage({ id, image }, [image.data.buffer]);
  });
}

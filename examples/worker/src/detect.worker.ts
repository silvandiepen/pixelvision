import { detect } from "./detect";
import type { DetectRequest, DetectResponse } from "./detect.model";

/**
 * Sends a reply to the page.
 *
 * @param response - The reply.
 * @param transfer - Buffers to move instead of copy.
 */
function reply(response: DetectResponse, transfer: ArrayBuffer[] = []): void {
  postMessage(response, { transfer });
}

addEventListener("message", (event: MessageEvent<DetectRequest>) => {
  const { id, image } = event.data;
  try {
    const result = detect(image);
    // The edges are freshly allocated, so their buffer is an `ArrayBuffer` (never shared).
    reply({ id, result }, [result.edges.data.buffer as ArrayBuffer]);
  } catch (error) {
    reply({ id, error: error instanceof Error ? error.message : String(error) });
  }
});

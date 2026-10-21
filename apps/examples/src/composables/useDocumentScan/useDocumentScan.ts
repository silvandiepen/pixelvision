import { onBeforeUnmount, ref, shallowRef } from "vue";
import { createDocumentTracker, findDocument } from "pixelvision";
import type { Point } from "pixelvision";
import { useCamera } from "../useCamera";
import type {
  DocumentScanState,
  UseDocumentScan,
  UseDocumentScanOptions,
} from "./useDocumentScan.model";

const FRAME_INTERVAL = 100; // about 10 detections a second
const FRAME_BOX = { width: 640, height: 480 };
const CAPTURE_BOX = { width: 2400, height: 2400 };
const STABLE_FRAMES = 8;

/**
 * Runs the back camera, looks for a document about 10 times a second and
 * captures the frame once the corners have held still for 8 detections.
 * Bind `camera.video` to a `<video>` element.
 *
 * @param options - What to do with the capture.
 * @returns The loop's state and controls.
 */
export function useDocumentScan({ onCapture }: UseDocumentScanOptions): UseDocumentScan {
  const camera = useCamera();
  const state = ref<DocumentScanState>("idle");
  const liveCorners = shallowRef<readonly Point[] | null>(null);
  const frameSize = ref<{ width: number; height: number } | null>(null);
  const held = ref(0);
  const tracker = createDocumentTracker({ holdFrames: STABLE_FRAMES });
  let timer = 0;

  function tick(): void {
    const frame = camera.frame(FRAME_BOX);
    if (frame) {
      frameSize.value = { width: frame.width, height: frame.height };
      const { status, corners, progress } = tracker.update(findDocument(frame)?.corners ?? null);
      liveCorners.value = corners;
      held.value = Math.round(progress * STABLE_FRAMES);
      state.value = corners ? "holding" : "looking";
      if (status === "steady" && corners) {
        // Straighten from the full-resolution frame, not the detection frame.
        const photo = camera.frame(CAPTURE_BOX) ?? frame;
        const scale = photo.width / frame.width;
        state.value = "captured";
        camera.stop();
        onCapture({ photo, corners: corners.map((p) => ({ x: p.x * scale, y: p.y * scale })) });
        return;
      }
    }
    timer = window.setTimeout(tick, FRAME_INTERVAL);
  }

  async function start(): Promise<boolean> {
    window.clearTimeout(timer);
    tracker.reset();
    held.value = 0;
    liveCorners.value = null;
    if (!(await camera.start("environment"))) {
      state.value = "idle";
      return false;
    }
    state.value = "looking";
    tick();
    return true;
  }

  /** Stops the camera and the loop. */
  function stop(): void {
    window.clearTimeout(timer);
    camera.stop();
    if (state.value !== "captured") state.value = "idle";
  }

  onBeforeUnmount(() => window.clearTimeout(timer));
  return { camera, state, liveCorners, frameSize, held, stableFrames: STABLE_FRAMES, start, stop };
}

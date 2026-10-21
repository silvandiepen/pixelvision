import { onBeforeUnmount, ref, shallowRef } from "vue";
import { findDocument } from "pixelvision";
import type { Point } from "pixelvision";
import { useCamera } from "../useCamera";
import type { CornerHistoryEntry } from "../../examples/scan-document/demo.model";
import { isStable } from "../../examples/scan-document/stability";
import type {
  DocumentScanState,
  UseDocumentScan,
  UseDocumentScanOptions,
} from "./useDocumentScan.model";

const FRAME_INTERVAL = 100; // about 10 detections a second
const FRAME_BOX = { width: 640, height: 480 };
const STABLE_FRAMES = 8;
const TOLERANCE = 6;

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
  const history: CornerHistoryEntry[] = [];
  let timer = 0;

  /** Looks for the document in the current frame and captures when it's stable. */
  function tick(): void {
    const frame = camera.frame(FRAME_BOX);
    if (frame) {
      frameSize.value = { width: frame.width, height: frame.height };
      const found = findDocument(frame);
      liveCorners.value = found?.corners ?? null;
      history.push(found?.corners ?? null);
      if (history.length > STABLE_FRAMES) history.shift();
      let run = 0;
      for (let i = history.length - 1; i >= 0 && history[i]; i--) run++;
      held.value = run;
      state.value = found ? "holding" : "looking";
      if (found && isStable(history, { frames: STABLE_FRAMES, tolerance: TOLERANCE })) {
        state.value = "captured";
        camera.stop();
        onCapture({ photo: frame, corners: found.corners.map((p) => ({ x: p.x, y: p.y })) });
        return;
      }
    }
    timer = window.setTimeout(tick, FRAME_INTERVAL);
  }

  /**
   * Starts the back camera and the loop.
   *
   * @returns Whether the camera started.
   */
  async function start(): Promise<boolean> {
    window.clearTimeout(timer);
    history.length = 0;
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

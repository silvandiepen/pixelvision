import type { FindDocumentOptions, FoundDocument } from "pixelvision";
import type {
  DetectionWorkerRequest,
  DetectionWorkerResponse,
  DocumentFinder,
  FaceObservation,
  FrameImage,
  HaarPoseSourceOptions,
  PoseSource,
  WorkerLike,
  WorkerTask,
} from "./source.model";

/** Talks to a detection worker: one request per frame, answered by id. */
export interface DetectionWorkerClient {
  /** Sends a frame; resolves with the worker's answer. */
  request: <T>(task: WorkerTask, frame: FrameImage) => Promise<T>;
  /** Sends setup (cascades, options). */
  init: (message: Omit<Extract<DetectionWorkerRequest, { type: "init" }>, "type">) => void;
  /** Rejects pending requests and terminates the worker. */
  dispose: () => void;
}

/**
 * Wraps a worker running this package's `haar-worker` script. Each
 * frame's pixels are copied once and the copy is transferred, so the
 * caller's frame stays usable.
 *
 * @param worker - The worker.
 * @returns The client.
 *
 * @example
 * const client = createWorkerClient(worker);
 * const found = await client.request("document", frame);
 */
export function createWorkerClient(worker: WorkerLike): DetectionWorkerClient {
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  let nextId = 1;
  let failure: Error | undefined;

  const failAll = (error: Error) => {
    failure = error;
    pending.forEach(({ reject }) => reject(error));
    pending.clear();
  };

  worker.addEventListener("message", (event) => {
    const message = event.data as DetectionWorkerResponse;
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.type === "result") entry.resolve(message.result);
    else entry.reject(new Error(message.message));
  });
  worker.addEventListener("error", (event) => {
    failAll(new Error((event as unknown as { message?: string }).message || "Worker failed"));
  });

  return {
    request<T>(task: WorkerTask, frame: FrameImage) {
      if (failure) return Promise.reject(failure);
      const id = nextId++;
      const data = new Uint8ClampedArray(frame.data);
      const request: DetectionWorkerRequest = {
        type: "detect",
        task,
        id,
        width: frame.width,
        height: frame.height,
        data,
      };
      return new Promise<T>((resolve, reject) => {
        pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
        worker.postMessage(request, [data.buffer]);
      });
    },
    init(message) {
      const request: DetectionWorkerRequest = { type: "init", ...message };
      worker.postMessage(request);
    },
    dispose() {
      failAll(new Error("Worker disposed"));
      worker.terminate();
    },
  };
}

/**
 * Runs HAAR head-pose detection in a Web Worker, so the preview and
 * overlay keep animating at the display rate while a frame is analysed.
 *
 * `<pv-face-capture>` starts a built-in worker on its own when you set
 * `cascades`; use this to bring your own (for example under a Content
 * Security Policy that blocks Blob URL workers).
 *
 * @param worker - A worker running the `@pixelvision/capture-ui/haar-worker` script.
 * @param options - Cascades and `detectHeadPose` options, sent once.
 * @returns The pose source; `dispose()` terminates the worker.
 *
 * @example
 * const worker = new Worker(new URL("@pixelvision/capture-ui/haar-worker", import.meta.url), { type: "module" });
 * element.source = workerPoseSource(worker, { cascades: { frontal: frontalFace, profile: profileFace } });
 */
export function workerPoseSource(worker: WorkerLike, options: HaarPoseSourceOptions): PoseSource {
  const { cascades, ...poseOptions } = options;
  const client = createWorkerClient(worker);
  client.init({ cascades, poseOptions });
  return {
    directional: false,
    detect: (frame) => client.request<FaceObservation>("face", frame),
    dispose: client.dispose,
  };
}

/**
 * Runs `findDocument` in a Web Worker.
 *
 * @param worker - A worker running the `@pixelvision/capture-ui/haar-worker` script.
 * @param options - `findDocument` options, sent once.
 * @returns The finder; `dispose()` terminates the worker.
 *
 * @example
 * scanner.finder = workerDocumentFinder(new Worker(workerUrl, { type: "module" }));
 */
export function workerDocumentFinder(
  worker: WorkerLike,
  options: FindDocumentOptions = {},
): DocumentFinder {
  const client = createWorkerClient(worker);
  client.init({ documentOptions: options });
  return {
    find: (frame) => client.request<FoundDocument | null>("document", frame),
    dispose: client.dispose,
  };
}

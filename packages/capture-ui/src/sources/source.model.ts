import type {
  FindDocumentOptions,
  FoundDocument,
  HeadPose,
  HeadPoseCascades,
  HeadPoseOptions,
  ImageLike,
  Point,
} from "pixelvision";
import type { Box } from "../logic/geometry.model";
import type { RunToken } from "../logic/runToken.model";

/** What a pose source found in one frame, in that frame's pixels. */
export interface FaceObservation {
  /** The pose of the face in `box`. */
  pose: HeadPose;
  /** The face box: the face `pose`, `landmarks`, `score` and `yaw` describe. */
  box?: Box;
  /**
   * Every face found, `box` included, so `<pv-face-capture>` can tell when
   * more than one person is in view. Optional: without it, `box` is the
   * only face.
   */
  faces?: Box[];
  /** Landmarks to draw, e.g. eyes, nose tip and mouth corners. */
  landmarks?: Point[];
  /** Detector confidence, 0–1. */
  score?: number;
  /**
   * How far the head is turned, in degrees, positive towards the person's
   * own left. Only sources with landmarks report it (the neural source).
   */
  yaw?: number;
}

/** RGBA frame pixels handed to a pose source. */
export type FrameImage = ImageData | { width: number; height: number; data: Uint8ClampedArray };

/** Finds the face and its pose in a frame. May be async (a worker, a neural network). */
export type DetectFace = (
  frame: FrameImage,
) => FaceObservation | null | undefined | Promise<FaceObservation | null | undefined>;

/** A pluggable face detector for `<pv-face-capture>`. */
export interface PoseSource {
  detect: DetectFace;
  /** A short name for the debug readout, e.g. "yunet". */
  name?: string;
  /** Turn angle in degrees at which a turn counts, for the turn gauge (with `yaw`). */
  turnThreshold?: number;
  /** Reports `"turned-left"` / `"turned-right"`, so instructions can name the side. */
  directional?: boolean;
  /** Reports `"looking-up"` / `"looking-down"`, so a challenge can ask for them. */
  vertical?: boolean;
  /** Forgets what it learned about the person; called when a run starts. */
  reset?: () => void;
  /** Frees resources (a worker) when the element stops. */
  dispose?: () => void;
}

/** The parts of a `@pixelvision/face-neural` face this package reads. */
export interface NeuralFaceLike {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  landmarks: {
    rightEye: Point;
    leftEye: Point;
    noseTip: Point;
    mouthRight: Point;
    mouthLeft: Point;
  };
}

/** The parts of a `@pixelvision/face-neural` detector this package uses. */
export interface NeuralDetectorLike {
  detect: (image: ImageLike, options?: { maxFaces?: number }) => Promise<NeuralFaceLike[]>;
}

/** Options for {@link neuralPoseSource}. */
export interface NeuralPoseSourceOptions {
  /** From `createFaceDetector`. */
  detector: NeuralDetectorLike;
  /** `headPoseFromFace` from `@pixelvision/face-neural`. */
  headPoseFromFace: (
    face: NeuralFaceLike | undefined,
    options?: { threshold?: number; mirrored?: boolean },
  ) => HeadPose;
  /** Turn angle in degrees from which the head counts as turned (default 18). */
  threshold?: number;
  /**
   * `estimateHeadYaw` from `@pixelvision/face-neural`; when given, each
   * observation reports `yaw` for a live turn gauge.
   */
  estimateHeadYaw?: (face: NeuralFaceLike) => number;
  /**
   * `createHeadPoseTracker` from `@pixelvision/face-neural`; when given, the
   * source also reports looking up and down (it learns the person's frontal
   * face first), so a challenge can ask for them.
   */
  createHeadPoseTracker?: (options?: { threshold?: number }) => HeadPoseTrackerLike;
}

/** The parts of a `@pixelvision/face-neural` head pose tracker this package uses. */
export interface HeadPoseTrackerLike {
  update: (face: NeuralFaceLike | undefined) => HeadPose;
  reset: () => void;
}

/** The parts of `@pixelvision/face-neural` that {@link loadNeuralPoseSource} uses. */
export interface FaceNeuralModuleLike {
  createFaceDetector: (options: {
    ort: unknown;
    model: string | Uint8Array | ArrayBuffer;
    sessionOptions?: object;
  }) => Promise<NeuralDetectorLike>;
  headPoseFromFace: NeuralPoseSourceOptions["headPoseFromFace"];
  estimateHeadYaw: (face: NeuralFaceLike) => number;
  createHeadPoseTracker?: NeuralPoseSourceOptions["createHeadPoseTracker"];
}

/** Options for {@link loadNeuralPoseSource}. */
export interface LoadNeuralPoseSourceOptions {
  /** The onnxruntime module, e.g. `await import("onnxruntime-web")`. */
  ort: unknown;
  /** The YuNet model: a URL, or its bytes. */
  model: string | Uint8Array | ArrayBuffer;
  /** Passed to `InferenceSession.create`. */
  sessionOptions?: object;
  /** Turn angle in degrees from which the head counts as turned (default 18). */
  threshold?: number;
  /**
   * The `@pixelvision/face-neural` module. Defaults to importing it, so it
   * is only downloaded when precise detection is used.
   */
  faceNeural?: FaceNeuralModuleLike;
}

/** Options for {@link haarPoseSource} and {@link workerPoseSource}. */
export interface HaarPoseSourceOptions extends HeadPoseOptions {
  cascades: HeadPoseCascades;
}

/** What the detection worker can do. */
export type WorkerTask = "face" | "document";

/** Messages to the detection worker. */
export type DetectionWorkerRequest =
  | {
      type: "init";
      cascades?: HeadPoseCascades;
      poseOptions?: HeadPoseOptions;
      documentOptions?: FindDocumentOptions;
    }
  | {
      type: "detect";
      task: WorkerTask;
      id: number;
      width: number;
      height: number;
      data: Uint8ClampedArray;
    };

/** Messages from the detection worker. */
export type DetectionWorkerResponse =
  | { type: "result"; id: number; result: FaceObservation | FoundDocument | null }
  | { type: "error"; id: number; message: string };

/** Finds a document in a frame. May be async (a worker). */
export interface DocumentFinder {
  find: (frame: FrameImage) => FoundDocument | null | Promise<FoundDocument | null>;
  /** Frees resources (a worker) when the element stops. */
  dispose?: () => void;
}

/** The parts of a `Worker` the worker client uses. */
export interface WorkerLike {
  postMessage(message: unknown, transfer: Transferable[]): void;
  postMessage(message: unknown): void;
  addEventListener(type: "message" | "error", listener: (event: MessageEvent) => void): void;
  terminate(): void;
}

/** Options for {@link createDefaultPoseSource}. */
export interface DefaultPoseSourceOptions {
  /** The run the source is built for; nothing is created once it is no longer current. */
  token: RunToken;
  /** Cascades to use; when absent they are loaded with `loadCascades`. */
  cascades?: HeadPoseCascades;
  /** Loads the frontal and profile cascades. */
  loadCascades: () => Promise<HeadPoseCascades>;
  /** Starts a detection worker, or returns undefined to detect on the main thread. */
  createWorker?: () => WorkerLike | undefined;
}

/** A default pose source and how it runs, for the debug readout. */
export interface BuiltPoseSource {
  source: PoseSource;
  kind: "haar (worker)" | "haar (main thread)";
}

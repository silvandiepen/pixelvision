import type { ImageLike, Point } from "pixelvision";

/** Five facial landmarks, named from the person's point of view. */
export interface FaceLandmarks {
  rightEye: Point;
  leftEye: Point;
  noseTip: Point;
  mouthRight: Point;
  mouthLeft: Point;
}

/** A face found by {@link FaceDetector.detect}, in image pixels. */
export interface NeuralFace {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Confidence, 0–1. */
  score: number;
  landmarks: FaceLandmarks;
}

/** Options for {@link FaceDetector.detect}. */
export interface DetectFacesOptions {
  /** Minimum confidence, 0–1 (default 0.7). */
  scoreThreshold?: number;
  /** Overlap (IoU) above which the weaker of two faces is dropped (default 0.3). */
  nmsThreshold?: number;
  /** Return at most this many faces, best first (default 10). */
  maxFaces?: number;
}

/** A tensor as onnxruntime returns it; `data` is checked to be numeric before use. */
export interface OrtTensorLike {
  readonly data: unknown;
  readonly dims: readonly number[];
}

/** An inference session as onnxruntime returns it. */
export interface OrtSessionLike {
  run(feeds: Record<string, unknown>): Promise<Record<string, OrtTensorLike>>;
}

/**
 * The parts of an onnxruntime module the detector uses, so you can pass
 * `onnxruntime-web`, `onnxruntime-node` or `onnxruntime-react-native` as is.
 */
export interface OrtLike {
  InferenceSession: {
    create(uri: string, options?: object): Promise<OrtSessionLike>;
    create(buffer: Uint8Array, options?: object): Promise<OrtSessionLike>;
  };
  Tensor: new (type: "float32", data: Float32Array, dims: readonly number[]) => unknown;
}

/** Options for {@link createFaceDetector}. */
export interface CreateFaceDetectorOptions {
  /** The onnxruntime module, e.g. `import * as ort from "onnxruntime-web"`. */
  ort: OrtLike;
  /**
   * The YuNet model: a URL or file path, or its bytes. Defaults to the
   * bundled `@pixelvision/face-neural/models/yunet.onnx`, which your bundler
   * or server must make reachable at that path.
   */
  model: string | Uint8Array | ArrayBuffer;
  /** Passed to `InferenceSession.create`, e.g. `{ executionProviders: ["wasm"] }`. */
  sessionOptions?: object;
}

/** A loaded face detector. */
export interface FaceDetector {
  /** Finds faces and their landmarks in an image. */
  detect: (image: ImageLike, options?: DetectFacesOptions) => Promise<NeuralFace[]>;
}

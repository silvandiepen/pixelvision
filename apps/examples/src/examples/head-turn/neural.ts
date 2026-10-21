import type { NeuralBackend } from "./neural.model";

/**
 * Loads the optional neural face detector: onnxruntime-web, the YuNet model
 * (about 230 KB) and the runtime's WebAssembly file. Everything is imported
 * on demand, so pages that don't use it don't download it. The `.wasm` file
 * is served from this site, not a CDN.
 *
 * @returns A ready detector and the head-pose helpers.
 * @throws {Error} When the runtime or the model can't be loaded.
 */
export async function loadNeuralBackend(): Promise<NeuralBackend> {
  const [ort, neural, model, wasm] = await Promise.all([
    import("onnxruntime-web/wasm"),
    import("@pixelvision/face-neural"),
    import("@pixelvision/face-neural/models/yunet.onnx?url"),
    import("onnxruntime-web/ort-wasm-simd-threaded.wasm?url"),
  ]);
  ort.env.wasm.wasmPaths = { wasm: wasm.default };
  // Threads need a cross-origin-isolated page; one thread is fast enough for YuNet.
  ort.env.wasm.numThreads = 1;
  const detector = await neural.createFaceDetector({
    ort,
    model: model.default,
    sessionOptions: { executionProviders: ["wasm"] },
  });
  return {
    detector,
    estimateHeadYaw: neural.estimateHeadYaw,
    headPoseFromFace: neural.headPoseFromFace,
  };
}

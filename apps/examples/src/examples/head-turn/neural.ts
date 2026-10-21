import type { OrtLike } from "@pixelvision/face-neural";
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
  // face-neural's OrtLike declares `create` and `run` with single signatures, while
  // onnxruntime declares overloads, so the module itself doesn't type-check as OrtLike.
  // This adapter calls the matching overloads and checks the outputs are float32.
  const runtime: OrtLike = {
    InferenceSession: {
      create: async (source, options) => {
        const session =
          typeof source === "string"
            ? await ort.InferenceSession.create(source, options)
            : await ort.InferenceSession.create(
                source instanceof Uint8Array ? source : new Uint8Array(source),
                options,
              );
        return {
          run: async (feeds) => {
            const inputs: Record<string, InstanceType<typeof ort.Tensor>> = {};
            for (const [name, value] of Object.entries(feeds)) {
              if (!(value instanceof ort.Tensor))
                throw new TypeError(`Input ${name} isn't a tensor`);
              inputs[name] = value;
            }
            const outputs = await session.run(inputs);
            return Object.fromEntries(
              Object.entries(outputs).map(([name, tensor]) => {
                if (!(tensor.data instanceof Float32Array)) {
                  throw new TypeError(`Output ${name} isn't float32`);
                }
                return [name, { data: tensor.data, dims: tensor.dims }];
              }),
            );
          },
        };
      },
    },
    Tensor: ort.Tensor,
  };
  const detector = await neural.createFaceDetector({
    ort: runtime,
    model: model.default,
    sessionOptions: { executionProviders: ["wasm"] },
  });
  return {
    detector,
    estimateHeadYaw: neural.estimateHeadYaw,
    headPoseFromFace: neural.headPoseFromFace,
  };
}

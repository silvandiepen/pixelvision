`@pixelvision/face-neural` is an optional package for neural face detection. It runs the YuNet face detector on onnxruntime and returns each face with five landmarks: both eyes, the nose tip and the mouth corners. From those it estimates how far the head is turned.

pixelvision itself stays dependency-free. Use this package when Haar cascades aren't enough, for example to tell a head turned 20° to the left from one turned to the right. The [head-turn check](/head-turn) can use either.

|               | Built-in (`detectHaar`, `detectHeadPose`)        | `@pixelvision/face-neural`                                 |
| ------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| Download      | Nothing extra (cascades are part of pixelvision) | YuNet model, 230 KB, plus the onnxruntime WebAssembly file |
| Head turns    | Only a nearly full profile counts                | About 18–20° counts                                        |
| Left or right | Not known                                        | Known, from the person's point of view                     |
| Landmarks     | None                                             | Eyes, nose tip, mouth corners                              |

## Install

The package doesn't bundle onnxruntime. Install the runtime for your platform next to it:

```sh
npm install @pixelvision/face-neural onnxruntime-web    # browsers
npm install @pixelvision/face-neural onnxruntime-node   # Node
```

## In the browser

```ts
import * as ort from "onnxruntime-web/wasm";
import { createFaceDetector, headPoseFromFace, estimateHeadYaw } from "@pixelvision/face-neural";
import modelUrl from "@pixelvision/face-neural/models/yunet.onnx?url";
import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";

ort.env.wasm.wasmPaths = { wasm: wasmUrl };

const detector = await createFaceDetector({ ort, model: modelUrl });

const faces = await detector.detect(context.getImageData(0, 0, width, height));
const face = faces[0];
if (face) {
  console.log(estimateHeadYaw(face)); // degrees; positive when the nose points to the image's right
  console.log(headPoseFromFace(face)); // "frontal", "turned-left" or "turned-right"
}
```

The `?url` imports are how Vite hands you the address of a file in a package; other bundlers have their own way. onnxruntime-web has to be able to fetch its `.wasm` file: point `ort.env.wasm.wasmPaths` at wherever you serve it.

Load all of this with a dynamic `import()` when it's needed, so pages that don't use it stay small. The [head-turn check](/head-turn) only loads it when you pick the neural detector.

Feed the detector the frame as the camera took it. If the preview is mirrored, mirror only the preview, and keep `mirrored: false` (the default) in `headPoseFromFace`. Pass `mirrored: true` only when the pixels themselves are mirrored.

## In Node

```ts
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import * as ort from "onnxruntime-node";
import { createFaceDetector } from "@pixelvision/face-neural";

const require = createRequire(import.meta.url);
const model = await readFile(require.resolve("@pixelvision/face-neural/models/yunet.onnx"));
const detector = await createFaceDetector({ ort, model: new Uint8Array(model) });

const faces = await detector.detect({ width, height, data }); // RGBA, e.g. from sharp
```

## In React Native

Pass the onnxruntime module your app uses (for example `onnxruntime-react-native`) as `ort`, and the model as bytes. This hasn't been tested on devices yet.

## TypeScript

Pass the onnxruntime module itself as `ort`; no adapter is needed. The [head-turn example's loader](https://github.com/silvandiepen/pixelvision/blob/main/apps/examples/src/examples/head-turn/neural.ts) shows the full set-up, including where the `.wasm` file comes from.

## The model and its licence

The YuNet model (`face_detection_yunet_2023mar.onnx`) comes unmodified from the OpenCV Zoo. It's MIT-licensed, copyright (c) 2020 Shiqi Yu, and described in Wu, Peng and Yu, "YuNet: A Tiny Millisecond-level Face Detector" (Machine Intelligence Research, 2023). The full licence ships in the package as `MODELS.md`.

## What it isn't

Like the head-turn check itself, a turned head is a liveness signal, not proof. It stops printed photos and still screens; a video replay or a deepfake could follow the steps. For identity checks, send the capture to a certified liveness service.

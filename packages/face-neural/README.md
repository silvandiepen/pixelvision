# @pixelvision/face-neural

Optional neural face detection for [pixelvision](https://www.npmjs.com/package/pixelvision): faces
with five landmarks (eyes, nose tip, mouth corners), the head's turn angle, and head poses for
pixelvision's head-turn challenge. Uses YuNet (OpenCV Zoo, MIT, 230 KB, bundled) on
onnxruntime, which you bring yourself so the package fits browsers, Node and React Native.

```sh
npm install @pixelvision/face-neural pixelvision onnxruntime-web
```

```ts
import * as ort from "onnxruntime-web";
import { createFaceDetector, estimateHeadYaw, headPoseFromFace } from "@pixelvision/face-neural";
import modelUrl from "@pixelvision/face-neural/models/yunet.onnx?url"; // Vite; other bundlers: copy the file

const detector = await createFaceDetector({ ort, model: modelUrl });
const [face] = await detector.detect(context.getImageData(0, 0, width, height));
if (face) {
  console.log(face.landmarks.noseTip, estimateHeadYaw(face)); // degrees, + = nose to image right
  const pose = headPoseFromFace(face); // "frontal" | "turned-left" | "turned-right"
}
```

In Node use `onnxruntime-node` and pass the model as a path or its bytes; in React Native use
`onnxruntime-react-native`.

`onnxruntime-node` sends usage telemetry by default. Set `ORT_DISABLE_TELEMETRY=1` in the
environment before it loads when you process faces on a server.

## Looking up and down

Five landmarks can't tell a tilted head from a face that is just shaped differently, so up and
down are judged against the person's own frontal face. `createHeadPoseTracker` learns it from the
first few frames facing the camera, then reports `"looking-up"` and `"looking-down"` as well as
turns:

```ts
import { createFaceChallenge } from "pixelvision";
import { createHeadPoseTracker } from "@pixelvision/face-neural";

const tracker = createHeadPoseTracker();
const challenge = createFaceChallenge({ steps: "head-circle" }); // frontal, left, up, right, down, frontal
onFrame(async (frame) => {
  const [face] = await detector.detect(frame);
  const state = challenge.update(tracker.update(face));
});
```

The thresholds were set on one AI-generated person at about 15° and 30° of tilt (the photos in
`fixtures/faces`, see `MODELS.md`): looking up shows clearly, looking down needs a clear nod.
Check them on your own users before you rely on them.

pixelvision's built-in HAAR detection keeps working without this package; this is an upgrade for
accuracy, for telling left from right, and for up and down.

## License

MIT. The bundled YuNet model is MIT-licensed by Shiqi Yu; see `MODELS.md`.

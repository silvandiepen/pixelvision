# pixelvision

Typed, tested computer vision for JavaScript and TypeScript: image processing, edges and lines,
keypoints and descriptors, optical flow, motion estimation, face detection, document scanning and the
everyday OpenCV filters. No dependencies, no WebAssembly, no DOM: the same code runs in browsers,
Web Workers, Node and React Native (Hermes).

It covers everything [jsfeat](https://github.com/inspirit/jsfeat) does, with a simpler API and fixes
for its bugs, and is checked against jsfeat and OpenCV.js by more than 700 parity tests.

```sh
npm install pixelvision
```

```ts
import { canny, findDocument, extractDocument, gaussianBlur, grayscale } from "pixelvision";

const frame = context.getImageData(0, 0, canvas.width, canvas.height);

// Edges
const edges = canny(gaussianBlur(grayscale(frame), { kernelSize: 5 }), { low: 20, high: 60 });

// Find a document in the photo and straighten it
const found = findDocument(frame);
if (found) {
  const flat = extractDocument(frame, found.corners, { aspectRatio: 85.6 / 53.98 });
}
```

Face detection cascades are separate imports, so you only download the ones you use:

```ts
import { detectHaar, equalizeHistogram } from "pixelvision";
import { frontalFace } from "pixelvision/cascades/frontal-face";

const faces = detectHaar(equalizeHistogram(gray), frontalFace, { minNeighbors: 2 });
```

Documentation, live examples and the API reference: https://github.com/silvandiepen/pixelvision

## Related packages

- [`@pixelvision/face-neural`](https://www.npmjs.com/package/@pixelvision/face-neural): optional
  neural face detection with landmarks (YuNet on onnxruntime).

## License

MIT. Ports algorithms from jsfeat (MIT); bundled cascades keep their original licences, listed in
`THIRD_PARTY_NOTICES.md`.

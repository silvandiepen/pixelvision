<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-light.svg">
    <img src="assets/logo.svg" alt="pixelvision" width="96">
  </picture>
</p>

<h1 align="center">pixelvision</h1>

<p align="center">Typed, tested computer vision for JavaScript and TypeScript.</p>

---

pixelvision is computer vision for JavaScript on plain typed arrays. It has no dependencies, no
WebAssembly and no DOM requirement, so the same code runs in the browser, in a Web Worker, in Node
and in React Native (Hermes).

- **Image processing:** grayscale, blurs (box, Gaussian, median), resizing and pyramids, Sobel and
  Scharr derivatives, Canny edges, Hough lines, thresholds, morphology, histogram equalisation and
  perspective or affine warps.
- **Features:** FAST, YAPE and YAPE06 keypoints, ORB descriptors and descriptor matching.
- **Tracking and motion:** pyramidal Lucas-Kanade optical flow, and robust affine and homography
  estimation with RANSAC or LMEDS.
- **Detection:** Viola-Jones (HAAR) and BBF cascades, with bundled frontal-face, profile-face, eye
  and upper-body cascades, plus skin detection.
- **Document scanning:** find a document in a photo, straighten it, and track it across frames.
- **Face and head-turn capture:** head-pose detection and a head-turn challenge (a client-side
  signal, not liveness proof); optional neural face detection with landmarks in
  `@pixelvision/face-neural`.
- **Shape analysis:** contours, polygon approximation, convex hulls, moments, bounding and rotated
  rectangles, and connected components.
- **Linear algebra:** LU, Cholesky, SVD, eigen-decomposition and least-squares solves.

Every function is typed, documented and tested against reference implementations, with 100% test
coverage.

> **Status:** early development.

## Install

```sh
npm install pixelvision
```

## Usage

```ts
import { canny, gaussianBlur, grayscale } from "pixelvision";

const frame = context.getImageData(0, 0, canvas.width, canvas.height);
const gray = grayscale(frame);
const edges = canny(gaussianBlur(gray, { kernelSize: 5 }), { low: 20, high: 60 });
```

Every function returns a new matrix. Pass `out` to reuse one instead, for example frame after frame
from a camera:

```ts
import { createMatrix, grayscale } from "pixelvision";

const gray = createMatrix(0, 0);

const onFrame = (frame: ImageData) => {
  grayscale(frame, { out: gray });
};
```

## Repository

| Path                   | What                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `packages/pixelvision` | The library, published to npm as `pixelvision`                                                 |
| `packages/face-neural` | Optional neural face detection (YuNet on onnxruntime), published as `@pixelvision/face-neural` |
| `packages/parity`      | Tests against reference implementations (private)                                              |
| `packages/compat`      | Runs the same pipeline in Node and Hermes (React Native) and compares the results (private)    |
| `apps/examples`        | Documentation site: guides, API reference and a live, tested example for every function        |
| `examples/*`           | Small starter apps (Vanilla, Vue, React, Svelte, Web Worker, Node) that use the built package  |

```sh
pnpm install
pnpm check            # format, lint, typecheck, test, build
pnpm test:e2e         # docs site and starter apps in Chromium, Firefox and WebKit
pnpm check:packages   # publint and type checks on the packed packages
```

Coming from jsfeat? See [Migrating from jsfeat](docs/jsfeat-differences.md).

## License

MIT. Algorithms ported from jsfeat by Eugene Zatepyakin, MIT; see [LICENSE](LICENSE).

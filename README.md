<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-light.svg">
    <img src="assets/logo.svg" alt="pixelvision" width="96">
  </picture>
</p>

<h1 align="center">pixelvision</h1>

<p align="center">Typed, tested computer vision for JavaScript and TypeScript.</p>

---

pixelvision does image processing, feature detection, tracking and object detection on plain
typed arrays. It has no dependencies and no DOM requirement, so the same code runs in the browser,
in a Web Worker, in Node and in React Native.

It's a modern replacement for [jsfeat](https://github.com/inspirit/jsfeat): the same algorithms
with a simpler API, full TypeScript types, and tests that prove its output matches jsfeat's.

> **Status:** early development. The parity table below tracks what has been ported.

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

## jsfeat parity

pixelvision covers what jsfeat does with its own, simpler API; it isn't a drop-in replacement.
Each ported function is checked against jsfeat 0.0.8 on the same seeded images in
[`packages/parity`](packages/parity): integer output must be identical. Where jsfeat is wrong,
pixelvision fixes it and the difference is listed in
[docs/jsfeat-differences.md](docs/jsfeat-differences.md).

| jsfeat                           | pixelvision                                   | Parity                                                               |
| -------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `matrix_t`, `data_t`, `cache`    | `createMatrix`, `cloneMatrix`, optional `out` | — (replaced)                                                         |
| —                                | `fromImageData`, `toImageData`                | new                                                                  |
| `math.get_gaussian_kernel`       | `gaussianKernel`                              | identical                                                            |
| `imgproc.grayscale`              | `grayscale`                                   | identical                                                            |
| `imgproc.resample`               | `resample`                                    | identical when shrinking 1 channel; fixed for colour, adds enlarging |
| `imgproc.box_blur_gray`          | `boxBlur`, `boxSum`                           | identical; fixed for large radii; any channels                       |
| `imgproc.gaussian_blur`          | `gaussianBlur`                                | identical; any channels                                              |
| `imgproc.pyrdown`                | `pyrDown`                                     | identical; any channels                                              |
| `imgproc.sobel_derivatives`      | `sobelDerivatives`                            | identical; fixed for 1-pixel-tall images                             |
| `imgproc.scharr_derivatives`     | `scharrDerivatives`                           | identical; fixed for 1-pixel-tall images                             |
| `imgproc.compute_integral_image` | `integralImage`                               | identical; no overflow                                               |
| `imgproc.equalize_histogram`     | `equalizeHistogram`                           | identical                                                            |
| `imgproc.canny`                  | `canny`                                       | identical except the bottom-row fix                                  |
| `imgproc.warp_perspective`       | `warpPerspective`                             | identical inside the image; fixed edges; any channels                |
| `imgproc.warp_affine`            | `warpAffine`                                  | identical inside the image; fixed edges; any channels                |
| `imgproc.skindetector`           | `detectSkin`                                  | identical                                                            |
| `imgproc.hough_transform`        | `houghLines`                                  | jsfeat's throws; tested on known lines                               |

## Repository

| Path                   | What                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `packages/pixelvision` | The library, published to npm as `pixelvision`                                                 |
| `packages/face-neural` | Optional neural face detection (YuNet on onnxruntime), published as `@pixelvision/face-neural` |
| `packages/parity`      | Parity tests against jsfeat and OpenCV.js (private)                                            |
| `packages/compat`      | Runs the same pipeline in Node and Hermes (React Native) and compares the results (private)    |
| `apps/examples`        | Documentation site: guides, API reference and a live, tested example for every function        |

```sh
pnpm install
pnpm check            # format, lint, typecheck, test, build
pnpm test:e2e         # examples site in Chromium, Firefox and WebKit
pnpm check:packages   # publint and type checks on the packed packages
```

## License

MIT. Algorithms ported from jsfeat by Eugene Zatepyakin, MIT; see [LICENSE](LICENSE).

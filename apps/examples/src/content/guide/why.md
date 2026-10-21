## Small, with nothing to install alongside

pixelvision has no dependencies. All {{functionCount}} functions come to {{gzipKb}} KB gzipped, measured on the published module when this site was built. The Haar cascades for face detection are separate entry points, so you only download the ones you import.

OpenCV.js is OpenCV compiled to WebAssembly. It can do far more, and it's correspondingly large: the `@techstark/opencv-js` package (5.0.0-release.1) unpacks to 14.7 MB.

## Plain data

Images and results are plain objects over typed arrays: `{ type, width, height, channels, data }`. There are no classes to construct and nothing to free; the garbage collector handles memory, and you can pass `out` to reuse a matrix frame after frame. OpenCV.js `Mat` objects live in WebAssembly memory and have to be freed with `delete()`.

## Typed and documented

pixelvision is written in TypeScript. Every public function has TSDoc with its parameters, return value, the errors it throws and an example, and the [API reference](/api) is generated from exactly that. Options are named, so a call reads like what it does: `canny(gray, { low: 40, high: 100 })`.

## Tested three ways

- **Unit tests** cover every function, with a 100% coverage threshold.
- **Reference tests** run pixelvision and established reference implementations on the same seeded images; integer output must be identical, so results are predictable down to the last pixel.
- **This site is a test suite.** Every function's example page runs in Chromium, Firefox and WebKit on every change, and checks its result against known values.

## Runs where JavaScript runs

There's no DOM and no Node API in the library, so the same code runs in browsers, Web Workers, Node 22 and later, and React Native on Hermes (not yet tested on devices). See the [guides](/guide/camera).

## Where it stops

pixelvision covers the classic toolkit: filters, edges, lines, warps, features, optical flow, Haar detection, document finding and the linear algebra behind them. It doesn't do neural networks, except for the optional [face detector](/guide/face-neural), and it runs on one thread. If you need deep learning models, stereo, camera calibration or OpenCV's breadth, use OpenCV.js.

## Compared

|              | pixelvision                                                                     | OpenCV.js                                |
| ------------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| Dependencies | None                                                                            | None, one large WebAssembly build        |
| Download     | {{gzipKb}} KB gzipped                                                           | `@techstark/opencv-js`: 14.7 MB unpacked |
| Types        | Written in TypeScript                                                           | Depends on the package                   |
| Memory       | Garbage collected; optional `out` reuse                                         | `Mat` objects freed with `delete()`      |
| API          | Named options; results are returned                                             | OpenCV's C++ API                         |
| Coverage     | Image processing, features, tracking, Haar detection, documents, linear algebra | Most of OpenCV                           |
| Status       | In development, not yet on npm                                                  | Actively maintained                      |
| Runs in      | Browsers, workers, Node, React Native                                           | Browsers, workers, Node                  |

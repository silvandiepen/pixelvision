pixelvision does image processing, feature detection, tracking and object detection on plain typed arrays. It has no dependencies and doesn't need a DOM, so the same code runs in the browser, in a Web Worker, in Node and in React Native.

## Install

```sh
npm install pixelvision
```

Everything is a named export of `pixelvision`. The Haar cascades for `detectHaar` are large, so each one has its own entry point and is only bundled when you import it:

```ts
import { detectHaar, equalizeHistogram, grayscale } from "pixelvision";
import { frontalFace } from "pixelvision/cascades/frontal-face";
```

## A first example

Find the edges in whatever is drawn on a canvas, and draw them back:

```ts
import { canny, gaussianBlur, grayscale, toImageData } from "pixelvision";

const context = canvas.getContext("2d");
const frame = context.getImageData(0, 0, canvas.width, canvas.height);

const gray = grayscale(frame);
const smooth = gaussianBlur(gray, { kernelSize: 5 });
const edges = canny(smooth, { low: 40, high: 100 });

const rgba = toImageData(edges);
context.putImageData(new ImageData(rgba.data, rgba.width, rgba.height), 0, 0);
```

Every step returns a new matrix, so you can look at each one. The [edge detection example](/edge-detection) runs exactly this, with sliders.

## ImageData in, ImageData out

Canvas pixels come as `ImageData`: RGBA bytes, row by row. Functions that start from a photo accept it directly, as does anything shaped like it (`{ width, height, data }`, such as a decoded PNG): `grayscale`, `detectSkin`, `findDocument`, `extractDocument` and `fromImageData`.

Everything else works on a `Matrix`. Most pipelines start with `grayscale`. When you need the colour image as a matrix, for example to warp or resize it, use `fromImageData`; it copies the pixels into a 4-channel `u8` matrix.

To draw a result, `toImageData` turns any 8-bit matrix with 1, 3 or 4 channels into RGBA pixels for `putImageData`. Results that aren't pixels, such as gradients or integral images, need scaling to 0–255 first; the examples show how.

## Reuse matrices with `out`

Every function that returns a matrix takes an optional `out`. Pass the same matrix every frame and no new memory is allocated, which matters in a camera loop:

```ts
import { canny, createMatrix, gaussianBlur, grayscale } from "pixelvision";

const gray = createMatrix(0, 0);
const smooth = createMatrix(0, 0);
const edges = createMatrix(0, 0);

function onFrame(frame: ImageData) {
  grayscale(frame, { out: gray });
  gaussianBlur(gray, { kernelSize: 5, out: smooth });
  canny(smooth, { low: 40, high: 100, out: edges });
}
```

`out` is reshaped to the size of the result. Its array only grows when it's too small, so `data` can be longer than `width * height * channels`; always use the size fields, not `data.length`. `out` must have the element type the function returns, or it throws a `TypeError`.

## Next

- [Concepts](/guide/concepts): matrices, pixel types, channels, coordinates and rounding.
- [Camera and video frames](/guide/camera): running a pipeline on every frame.
- [API reference](/api): every function and option.

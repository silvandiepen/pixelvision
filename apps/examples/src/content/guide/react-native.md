pixelvision uses no DOM and no Node APIs, only JavaScript and typed arrays, so it runs in React Native on Hermes as it is. What React Native doesn't give you is a canvas: getting pixels in is up to your camera or image library.

## Getting pixels in

Camera libraries that expose raw frames hand you an `ArrayBuffer` and tell you its pixel format. Check the format before you wrap it:

- **RGBA or BGRA.** Wrap it as an image and pass the channel order:

  ```ts
  import { grayscale } from "pixelvision";

  const gray = grayscale({ width, height, data: new Uint8Array(buffer) }, { order: "bgra" });
  ```

- **YUV (for example NV21 or 420 planar).** The first `width * height` bytes are the luma (Y) plane, which is already a gray image, so you can skip `grayscale`:

  ```ts
  import { createMatrix } from "pixelvision";

  const gray = createMatrix(width, height, { data: new Uint8Array(buffer, 0, width * height) });
  ```

  Some cameras pad each row. If the library reports a row stride larger than the width, copy the rows into a tight array first.

For still images, decode to RGBA with an image library and pass `{ width, height, data }` like any `ImageData`.

## Keep it fast

Frames on a phone are large. Shrink them first with `resample` or `pyrDown`, reuse matrices with `out`, and run heavy detectors a few times a second rather than on every frame. Camera libraries that run frame processors off the JavaScript thread let you keep the interface smooth; whether pixelvision can run there depends on the library, so check its documentation.

## Status

The library has no React Native-specific code and its tests run in Node. It hasn't been tested on devices yet; if you try it, please report what you find.

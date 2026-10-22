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

## Still images in Expo

React Native has no canvas to decode a photo with, but two Expo modules and a pure-JavaScript JPEG decoder are enough, with no native code of your own:

```ts
import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { decode } from "jpeg-js";

async function readPixels(uri: string, width: number, height: number) {
  // Scale down and save as JPEG: this also turns HEIC and PNG photos into one format.
  const context = ImageManipulator.manipulate(uri);
  const rendered = await context.resize({ width, height }).renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
  rendered.release();
  context.release();

  const bytes = new Uint8Array(await new File(saved.uri).arrayBuffer());
  const image = decode(bytes, { useTArray: true, formatAsRGBA: true });
  return { width: image.width, height: image.height, data: image.data };
}
```

The result goes straight into `grayscale`, `findDocument` or any other function. The [Expo example](https://github.com/silvandiepen/pixelvision/tree/main/examples/expo) does this on a picked photo, finds the document in it and draws the outline with plain views.

## Keep it fast

Frames on a phone are large. Shrink them first with `resample` or `pyrDown`, reuse matrices with `out`, and run heavy detectors a few times a second rather than on every frame. Camera libraries that run frame processors off the JavaScript thread let you keep the interface smooth; whether pixelvision can run there depends on the library, so check its documentation.

## Status

The library has no React Native-specific code. On every change, CI bundles a pipeline (grayscale, blur, Canny, FAST corners, `findDocument`, Lucas–Kanade flow and SVD) for Hermes and for Node, runs it in both and requires the same output. The Expo example's Jest test runs the document detection on its sample photo with the app's own decoder.

The Expo example runs on the iOS simulator, both in Expo Go and as a development build. It hasn't been tested on physical devices or on Android yet; if you try it there, please report what you find.

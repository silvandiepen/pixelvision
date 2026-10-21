In Node, pixelvision works on pixels you decode yourself. Any decoder that gives you RGBA bytes and a size works; two common ones are shown here.

## With sharp

[sharp](https://sharp.pixelplumbing.com) decodes JPEG, PNG, WebP and more to raw pixels:

```ts
import sharp from "sharp";
import { canny, gaussianBlur, grayscale } from "pixelvision";

const { data, info } = await sharp("photo.jpg")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const gray = grayscale({ width: info.width, height: info.height, data });
const edges = canny(gaussianBlur(gray, { kernelSize: 5 }), { low: 40, high: 100 });

await sharp(Buffer.from(edges.data.buffer, 0, edges.width * edges.height), {
  raw: { width: edges.width, height: edges.height, channels: 1 },
})
  .png()
  .toFile("edges.png");
```

`ensureAlpha()` makes sure there are four channels, so the pixels are laid out like `ImageData`. Without it, pass the 3-channel buffer with `grayscale(image, { order: "rgb" })`.

## With pngjs

[pngjs](https://github.com/pngjs/pngjs) is pure JavaScript and reads PNG only:

```ts
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import { findDocument } from "pixelvision";

const png = PNG.sync.read(readFileSync("scan.png")); // { width, height, data } in RGBA
const found = findDocument(png);
console.log(found?.corners);
```

## Notes

- Results are typed arrays; wrap them with `Buffer.from(array.buffer, offset, length)` to write them without copying, and use `width * height * channels` as the length, not `data.length` (a reused `out` matrix can be longer).
- pixelvision is ESM and CommonJS, and needs Node 22 or later.
- For a lot of images, run them in `worker_threads` to use more than one core.

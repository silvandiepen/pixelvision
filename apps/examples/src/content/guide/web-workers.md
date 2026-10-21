pixelvision doesn't touch the DOM, so it runs in a Web Worker unchanged. Move processing there when it takes long enough to make the page stutter, such as face detection or document finding on large frames.

## The worker

```ts
// vision.worker.ts
import { canny, gaussianBlur, grayscale } from "pixelvision";

self.onmessage = (event: MessageEvent<{ width: number; height: number; pixels: ArrayBuffer }>) => {
  const { width, height, pixels } = event.data;
  const frame = { width, height, data: new Uint8ClampedArray(pixels) };

  const edges = canny(gaussianBlur(grayscale(frame), { kernelSize: 5 }), { low: 40, high: 100 });

  const result = edges.data.slice(0, width * height);
  self.postMessage({ width, height, edges: result.buffer }, [result.buffer]);
};
```

## The page

```ts
const worker = new Worker(new URL("./vision.worker.ts", import.meta.url), { type: "module" });

worker.onmessage = (event) => {
  const { width, height, edges } = event.data;
  draw(new Uint8Array(edges), width, height);
  busy = false;
};

let busy = false;
function onFrame(frame: ImageData) {
  if (busy) return; // drop frames while the worker is still working
  busy = true;
  worker.postMessage({ width: frame.width, height: frame.height, pixels: frame.data.buffer }, [
    frame.data.buffer,
  ]);
}
```

## Notes

- **Transfer, don't copy.** Passing the buffers in the transfer list (the second argument of `postMessage`) hands them over without copying. The sender can't use a transferred buffer any more, so read a fresh frame each time.
- **Drop frames while busy.** Send the next frame only when the previous result is back, otherwise messages queue up and the output lags further and further behind.
- **Keep matrices in the worker.** Create them once there and pass `out` on every frame, as in [Camera and video frames](/guide/camera).
- **`OffscreenCanvas`** lets a worker draw and read frames itself, where the browser supports it.
- `new URL("./vision.worker.ts", import.meta.url)` is the form Vite, webpack and other bundlers recognise for bundling a worker.

Running a pipeline on every camera frame is the most common way to use pixelvision. The pattern is: get the camera into a `<video>`, copy each frame to a canvas, read its pixels, process them, and reuse every matrix.

## Get the camera

```ts
const video = document.querySelector("video");
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
  audio: false,
});
video.srcObject = stream;
await video.play();
```

Use `facingMode: "user"` for the selfie camera. The camera needs a secure page (`https` or `localhost`). Stop it when you're done: `stream.getTracks().forEach((track) => track.stop())`.

## Read frames and reuse matrices

```ts
import { canny, createMatrix, gaussianBlur, grayscale } from "pixelvision";

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d", { willReadFrequently: true });
const gray = createMatrix(0, 0);
const smooth = createMatrix(0, 0);
const edges = createMatrix(0, 0);

function onFrame() {
  canvas.width = 320;
  canvas.height = 240;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height);

  grayscale(frame, { out: gray });
  gaussianBlur(gray, { kernelSize: 5, out: smooth });
  canny(smooth, { low: 40, high: 100, out: edges });
  draw(edges);

  video.requestVideoFrameCallback(onFrame);
}
video.requestVideoFrameCallback(onFrame);
```

`requestVideoFrameCallback` runs once per new video frame. Where it isn't available, use `requestAnimationFrame`.

## Keep it fast

- **Work on small frames.** Drawing the video into a 320 x 240 canvas is a cheap resize, and most detectors don't need more. Scale results back up by the same factor.
- **Reuse matrices** with `out`, as above, so the garbage collector stays quiet.
- **Throttle heavy steps.** Filters and Canny are fast enough for every frame. Face detection (`detectHaar`, `detectHeadPose`) and `findDocument` take tens of milliseconds, so run them a few times a second with a timer and keep the last result on screen in between.
- **Track instead of re-detecting.** Find points once with `detectFast`, then follow them from frame to frame with `trackPoints`, which is much cheaper. Pass pyramids from `buildPyramid` to reuse them between frames.
- **Move work off the main thread** when it gets heavy: see [Web Workers](/guide/web-workers).

## Mirroring

People expect a selfie preview to behave like a mirror. Mirror the `<video>` with CSS (`transform: scaleX(-1)`) and give the detector the frame as the camera took it, then mirror any boxes you draw by drawing them inside the same mirrored element. The [head-turn check](/head-turn) does this.

## See it working

- [Scan a document with the camera](/scan-document): `findDocument` about 10 times a second, with auto-capture once the corners are still.
- [Head-turn liveness check](/head-turn): `detectHeadPose` about 8 times a second.
- Every image example has a Webcam input.

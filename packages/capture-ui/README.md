# @pixelvision/capture-ui

Camera capture components for [pixelvision](../pixelvision), as framework-agnostic Web
Components. They work in plain HTML, Vue, React, Svelte and Angular.

- **`<pv-face-capture>`**: a selfie flow with an oval face guide, a progress ring, a smoothed face
  tracker and a head-turn challenge. It captures the sharpest frontal frame.
- **`<pv-document-scanner>`**: finds a document with the back camera, outlines it, captures it
  once it is held still, and straightens it. The person can then pick a shape, drag the corners,
  retake or confirm.

Everything you see can be themed with CSS custom properties and `::part()`. Every text can be
replaced through the `labels` property, and English and Dutch are built in. The components respect
`prefers-reduced-motion`, announce instructions to screen readers, and can be used with a
keyboard.

> **Not a liveness or identity check.** The head-turn challenge runs in the browser and shows
> only that the camera feed turned as asked. It is not presentation-attack detection (PAD): a
> replayed video, a virtual camera, an injected stream or a modified page can complete it, and
> anything the browser sends can be forged. `metadata.challengePassed` is a client-side challenge
> result for capture quality and guidance, never an authorization input. Likewise, the document
> scanner crops a photo; it does not verify the document. A KYC or identity decision belongs on a
> server, with independently evaluated PAD, document validation and checks on the uploaded media.

## Install

```sh
npm install @pixelvision/capture-ui pixelvision
```

`pixelvision` is the only dependency you need. `@pixelvision/face-neural` is an optional peer: add
it when you want landmark-based detection (see [Detectors](#detectors)).

Importing the package registers both elements. The package has no framework runtime.

## Usage

### Plain HTML

```html
<pv-face-capture autostart style="height: 100dvh"></pv-face-capture>

<script type="module">
  import "@pixelvision/capture-ui";

  const selfie = document.querySelector("pv-face-capture");
  selfie.addEventListener("pv-step", (e) => console.log(e.detail.step));
  selfie.addEventListener("pv-capture", async (e) => {
    const { blob, metadata } = e.detail;
    await fetch("/selfie", { method: "POST", body: blob });
  });
  selfie.addEventListener("pv-error", (e) => console.warn(e.detail.code));
</script>
```

`pv-capture` stays on the element: it doesn't bubble or cross shadow roots, so listen on the
element itself, not on `document` or a parent.

```html
<pv-document-scanner aspect="id-card" autostart></pv-document-scanner>
```

### Vue

Tell Vue that `pv-*` tags are custom elements:

```ts
// vite.config.ts
vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("pv-") } } });
```

```vue
<script setup lang="ts">
import "@pixelvision/capture-ui";
import type { FaceCaptureDetail } from "@pixelvision/capture-ui";

const onCapture = (event: CustomEvent<FaceCaptureDetail>) => upload(event.detail.blob);
</script>

<template>
  <pv-face-capture
    autostart
    guide-shape="oval"
    :labels.prop="{ start: 'Begin' }"
    @pv-capture="onCapture"
  />
</template>
```

### React

React 19 passes properties and `on…` event listeners to custom elements:

```tsx
import "@pixelvision/capture-ui";

export function Selfie() {
  return (
    <pv-face-capture
      autostart
      guide-shape="circle"
      onpv-capture={(e: CustomEvent) => upload(e.detail.blob)}
    />
  );
}
```

With React 18, use a ref:

```tsx
const ref = useRef<HTMLElement>(null);
useEffect(() => {
  const el = ref.current!;
  const onCapture = (e: Event) => upload((e as CustomEvent).detail.blob);
  el.addEventListener("pv-capture", onCapture);
  return () => el.removeEventListener("pv-capture", onCapture);
}, []);
return <pv-face-capture ref={ref} autostart />;
```

### Svelte and Angular

Svelte supports custom elements as they are (`<pv-face-capture on:pv-capture={…} />`). In
Angular, add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas` and bind with
`(pv-capture)="onCapture($event)"`.

### Iframes

The camera only works in an iframe when the embedding page allows it:

```html
<iframe src="https://example.com/verify" allow="camera"></iframe>
```

Same-origin iframes have the camera by default. Cross-origin iframes need `allow="camera"`. When
the camera is blocked by the frame, the component says so: "This page is embedded in another page
that doesn't allow the camera." It then fires `pv-error` with `code: "blocked-frame"`. The page also
needs https (or `localhost`).

## Detectors

### Default: HAAR cascades

When you set no `source`, `<pv-face-capture>` uses pixelvision's frontal and profile HAAR
cascades with `detectHeadPose`. It loads them on first start with
`import("pixelvision/cascades/frontal-face")` and `profile-face`, so they are only downloaded when
used. To bundle them yourself, set `cascades`:

```ts
import { frontalFace } from "pixelvision/cascades/frontal-face";
import { profileFace } from "pixelvision/cascades/profile-face";
selfie.cascades = { frontal: frontalFace, profile: profileFace };
```

HAAR can tell a frontal face from a profile, but not which side the head turned to. The
instructions therefore say "one side" and "the other side", with arrows on both sides.

**Off the main thread.** Detection runs in a Web Worker by default, so the preview and overlay
keep animating at the display rate. The worker is bundled into the package and started from a
Blob URL, so there is nothing to configure. If a Content Security Policy blocks Blob workers, the
first frame fails and the element switches to the main thread. To serve the worker as a file
instead, use the `haar-worker` entry:

```ts
import { workerPoseSource, workerDocumentFinder } from "@pixelvision/capture-ui";
const worker = new Worker(new URL("@pixelvision/capture-ui/haar-worker", import.meta.url), {
  type: "module",
});
selfie.source = workerPoseSource(worker, { cascades });
scanner.finder = workerDocumentFinder(worker);
```

Set `worker="off"` to always detect on the main thread.

**Strict Content Security Policy.** The built-in worker needs `blob:` in `worker-src`. Don't add
it; serve the `haar-worker` entry from your own origin instead, and give the elements a worker
source as above. The entry is a browser-only ES module (`import` only, no types), and it bundles
everything it needs, so this policy is enough for the worker:

```http
Content-Security-Policy: default-src 'none'; script-src 'self'; worker-src 'self'; img-src 'self' blob: data:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self'
```

`img-src blob:` is for the captured still, whose Blob URL is revoked as soon as it has decoded,
and `data:` for the generated SVG mask around the face guide and the document outline;
`media-src blob:` covers browsers that treat the camera preview as a Blob source. The elements'
styles live in their shadow roots as `<style>` elements, hence `style-src 'unsafe-inline'`. Model
or WASM loading for `@pixelvision/face-neural` and your upload endpoint need their own directives.
Without a worker source and without `blob:`, the built-in worker fails on its first frame and the
elements detect on the main thread.

### Neural: `@pixelvision/face-neural`

YuNet is more robust than HAAR. It gives five landmarks to draw and knows the turn direction, so
the instructions say "Slowly turn your head to your left" and "Now turn your head to your right".
It also reports the turn angle, which drives a small gauge over the turn illustration that fills
towards the asked side. A turn counts from 18°.

`loadNeuralPoseSource` imports `@pixelvision/face-neural` on demand. Pass it onnxruntime and the
model, so nothing is downloaded until someone asks for it. Offer it as "Use precise detection"
through `preciseSource`: while the default HAAR detector is used, a button with that label
appears once a step stalls. Pressing it loads the source and starts the steps over.

```ts
import { loadNeuralPoseSource } from "@pixelvision/capture-ui";
import modelUrl from "@pixelvision/face-neural/models/yunet.onnx?url";

const precise = async () =>
  loadNeuralPoseSource({ ort: await import("onnxruntime-web"), model: modelUrl });

selfie.preciseSource = precise; // offered when a step stalls
selfie.source = await precise(); // or switch straight away
```

`neuralPoseSource({ detector, headPoseFromFace, estimateHeadYaw })` wraps a detector you
created yourself. onnxruntime-web and the model together are about 14 MB.

### Your own

`source` takes any function, or a `{ detect, directional?, turnThreshold?, name?, dispose? }`
object. It receives the RGBA frame and returns `{ pose, box?, landmarks?, score?, yaw? }` in that
frame's pixels, or a promise of it. `yaw` is in degrees, positive towards the person's left. `pose` is a pixelvision `HeadPose`. `<pv-document-scanner>` takes a `finder` with
`find(frame)` in the same way.

## `<pv-face-capture>`

### Attributes

| Attribute            | Default | What it does                                                                                                                 |
| -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `autostart`          | off     | Start the camera when connected. Without it, an intro panel with a start button shows first                                  |
| `guide-shape`        | `oval`  | `oval`, `circle` or `rect`                                                                                                   |
| `guide-aspect`       | `0.78`  | Width / height of the guide, as `0.75`, `3/4` or `3:4` (ignored for `circle`)                                                |
| `mirrored`           | on      | Mirror the preview like a mirror. The capture is never mirrored                                                              |
| `steps`              | on      | Run the head-turn check. `steps="off"` captures once the face is aligned and still                                           |
| `auto-capture`       | on      | Capture when the flow finishes. When off, a "Take photo" button appears instead                                              |
| `hold-frames`        | `3`     | Matching detections a step (or the alignment) needs                                                                          |
| `window-frames`      | `6`     | Recent detections with a face considered for `hold-frames`. A stray or missed detection slows a step instead of resetting it |
| `smooth-frames`      | `8`     | Detections the face box is median-smoothed over before guidance is derived                                                   |
| `accept-pause`       | `900`   | Milliseconds the acceptance moment (full ring, check mark) lasts after each step                                             |
| `hint-delay`         | `700`   | Milliseconds a positional hint must persist before it shows. "Keep your face in the oval" waits at least 1200                |
| `hint-hold`          | `1500`  | Minimum milliseconds a hint, or a guide colour, stays on screen                                                              |
| `message-hold`       | `1500`  | Minimum milliseconds each main instruction stays on screen                                                                   |
| `timeout`            | `45000` | Milliseconds before giving up (`pv-error` with `timeout`). `0` disables it                                                   |
| `first-turn`         | `left`  | The side asked for first, with a directional source                                                                          |
| `show-landmarks`     | off     | Draw the detector's landmarks (eyes, nose tip, mouth corners)                                                                |
| `show-debug`         | off     | Show detector, phase, step, pose, guidance, sharpness and detection rate                                                     |
| `detect-size`        | `480`   | Longest side of the frame handed to the detector                                                                             |
| `detect-interval`    | `120`   | Minimum milliseconds between detections. One frame is analysed at a time, so a slow detector lowers the rate instead         |
| `worker`             | on      | Run the built-in detector in a worker                                                                                        |
| `max-pixels`         | 2764800 | Most pixels a capture may have (1920 × 1440). A larger camera frame is scaled down. Kept between 320 × 240 and 4096 × 4096   |
| `include-image-data` | off     | Also put the raw `ImageData` in `pv-capture`. Off, the capture is only the JPEG                                              |
| `start-timeout`      | `10000` | Milliseconds the camera gets to deliver its first frame size before `pv-error` with `start-timeout`                          |
| `lang`               | page    | Language of the built-in texts (`en`, `nl`). If not set, the closest `lang` attribute is used                                |

On/off attributes accept `on`/`off`, `true`/`false` and `1`/`0`. An attribute without a value is
on.

### Properties and methods

| Member                 | What it is                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `labels`               | `Partial<CaptureLabels>`: texts to replace                                                 |
| `source`               | The face detector (see [Detectors](#detectors))                                            |
| `preciseSource`        | `() => Promise<PoseSource>`: offered as "Use precise detection" when a step stalls on HAAR |
| `usePreciseSource()`   | Switches to `preciseSource` now                                                            |
| `cascades`             | `{ frontal, profile }` for the default detector                                            |
| `stream`               | A `MediaStream` to use instead of opening the camera (your own device picker)              |
| `state`                | The flow's current state (read-only)                                                       |
| `maxPixels`            | The `max-pixels` attribute as a number                                                     |
| `includeImageData`     | The `include-image-data` attribute as a boolean                                            |
| `start()`              | Opens the camera and starts the flow                                                       |
| `stop()`               | Stops the camera and detection                                                             |
| `reset()`              | Clears the capture and starts over. The camera keeps running if it was                     |
| `capture()`            | Captures now and finishes. Resolves with the `pv-capture` detail                           |
| `clearSensitiveData()` | Revokes Blob URLs, zeroes canvases and drops every capture the element holds               |
| `dispose()`            | `stop()` and `clearSensitiveData()`. Runs on its own when the element is removed           |

### Events

Status events bubble and cross the shadow root. `pv-capture`, the only event with image data,
does neither: listen on the element.

| Event         | `detail`                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pv-ready`    | `{ width, height, facingMode }`: the camera runs                                                                                                                                                                                                             |
| `pv-pose`     | `{ pose, guidance, phase, box?, landmarks?, score?, yaw? }`: each detection, in camera pixels                                                                                                                                                                |
| `pv-detector` | `{ name }`: the detector was switched through "Use precise detection"                                                                                                                                                                                        |
| `pv-step`     | `{ step, stepsDone, totalSteps, progress }`: a head-turn step started, or `step: "done"`                                                                                                                                                                     |
| `pv-capture`  | `{ blob, image?, metadata }`: a JPEG, its `ImageData` with `include-image-data`, and `{ width, height, sharpness, box, pose, challengePassed, durationMs, capturedAt, mirrored: false }`. On the element only                                                |
| `pv-complete` | `{ durationMs, stepsDone }`: the flow is finished                                                                                                                                                                                                            |
| `pv-error`    | `{ code, message, cause? }`. `code` is one of `denied`, `blocked-frame`, `unavailable`, `in-use`, `insecure`, `unknown`, `timeout`, `detector`, `no-video` (the stream has no live video track), `ended` (the track ended), `media-error` or `start-timeout` |

### How it behaves

The flow is built to stay calm with a detector that is wrong now and then:

- **The face box is smoothed.** Guidance comes from the median of the last `smooth-frames`
  boxes, for every detector. A box far from that median is ignored, together with its pose,
  until it repeats in the same place. Up to three detections without a face keep the last box.
- **Progress counts a window, not a streak.** A step completes once `hold-frames` of the last
  `window-frames` detections with a face match it. Detections without a face are neutral.
- **One main instruction per step.** It cross-fades only when the step changes, and stays at least
  `message-hold` ms.
- **Positional hints are secondary.** "Move a little closer", "Move back a little", "Centre your
  face in the oval" and "Keep your face in the oval" appear as a smaller line. Each shows only
  after it has persisted for `hint-delay`, and then stays at least `hint-hold`. Centring isn't
  mentioned during turns. The guide colour settles in the same way.
- **The ring shows the current check.** It fills as the step (or the alignment) holds, eased so
  that it never jumps back, and drains slowly when the face is lost.
- **Each accepted step has its own moment.** The ring completes, turns the accept colour and
  pulses once, and a check mark draws in. The step's instruction stays for `accept-pause` ms before
  the next one fades in. Each step also gives a short vibration where the device supports it.
- **Turn steps show a head illustration** that turns towards the side to turn to, with an arrow
  and chevrons by the oval. With a source that reports yaw, an arc over the illustration fills as
  the head turns towards the target angle.
- **A step that stalls shows one helper.** After 6 s without progress, a single helper line
  appears, such as "Turn a bit further, then hold for a moment". On HAAR, the "Use precise
  detection" offer appears with it.
- **The capture is the sharpest frontal frame.** While the face is frontal and aligned, the
  sharpest frame is kept; sharpness is the variance of the Laplacian over the face. When the flow
  ends, that frame is captured and the camera stops.

The face tracker eases towards the smoothed box at the display rate, and holds still through
brief gaps instead of blinking.

With `prefers-reduced-motion`, the pulse, the turn animation and the arrow nudge are switched
off. The check mark and the colour change remain.

### Calmness

`src/logic/calmness.test.ts` runs a simulated person through one minute at 5 detections a
second. The person follows each instruction after a one-second reaction time. A share of the
detections is wrong: a missed face, a box elsewhere, or the wrong pose. Text that follows every
detection, as before, changes 27, 80 and 104 times a minute at 10%, 20% and 30% wrong detections.
With the smoothing and settling, the main instruction changes 6 times in total (the first
instruction, one per step and the final one), no hints flap, and the flow finishes in about 9 s.
Run it with `CALM_REPORT=1` to print the numbers.

## `<pv-document-scanner>`

### Attributes

| Attribute            | Default | What it does                                                                                 |
| -------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `autostart`          | off     | Start the camera when connected                                                              |
| `aspect`             | `auto`  | `auto` (as seen), `id-card` (85.6 × 53.98 mm) or `a4`. It follows the document's orientation |
| `auto-capture`       | on      | Capture once the document holds still. The shutter button is always there                    |
| `hold-frames`        | `8`     | Steady detections needed before capturing                                                    |
| `review`             | on      | Show the review (shape, adjust, retake, confirm). When off, `pv-capture` fires right away    |
| `mirrored`           | off     | Mirror the preview                                                                           |
| `show-debug`         | off     | Show finder, phase, area and hold progress                                                   |
| `detect-size`        | `480`   | Longest side of the frame handed to `findDocument`                                           |
| `detect-interval`    | `120`   | Minimum milliseconds between detections                                                      |
| `worker`             | on      | Run `findDocument` in a worker                                                               |
| `max-pixels`         | 2764800 | Most pixels of the photo the document is straightened from (1920 × 1440)                     |
| `include-image-data` | off     | Also put the straightened `ImageData` in `pv-capture`                                        |
| `start-timeout`      | `10000` | Milliseconds the camera gets to deliver its first frame size                                 |
| `lang`               | page    | Language of the built-in texts                                                               |

### Properties and methods

`labels`, `stream`, `finder` (a `DocumentFinder`), `aspect`, `corners` (the smoothed outline,
read-only), `maxPixels`, `includeImageData`, `start()`, `stop()`, `reset()`, `capture()`,
`clearSensitiveData()` and `dispose()`, as for `<pv-face-capture>`.

### Events

| Event        | `detail`                                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pv-ready`   | `{ width, height, facingMode }`                                                                                                                                                              |
| `pv-detect`  | `{ corners, area?, progress, stable }`: each detection. `corners` is null when no document was found                                                                                         |
| `pv-capture` | `{ blob, image?, corners, aspect, aspectRatio?, source: { width, height } }`: the straightened JPEG, its pixels with `include-image-data`, and the corners in the photo. On the element only |
| `pv-error`   | As above                                                                                                                                                                                     |

### How it behaves

Detections go through pixelvision's `createDocumentTracker`: the outline is the median of the
last few detections, a detection that jumps away is ignored until it repeats, and a few missed
frames keep the outline. The outline is drawn with rounded corners and handles. It eases between
detections, and the surround outside it dims. A ring at the top fills while the outline stays
within 5% of the document's diagonal, and drains when it moves, so a hand-held document gets
there. Then the frame is captured at full resolution (up to `max-pixels`), the corners are scaled
from the detection frame to it, and it is straightened with `extractDocument`. In the review, the person
can switch between Auto, ID card and A4. They can also drag the four corners on the still frame:
each corner is a button that moves with the arrow keys (Shift moves faster). "Use this scan" fires
`pv-capture`.

## Captured data

The captures are biometric and identity-document images. The elements keep them short-lived:

- `pv-capture` is dispatched on the element only, so page-wide listeners (analytics, tag
  managers, other scripts listening on `document`) don't receive it.
- Captures are bounded to `max-pixels`, and carry the raw `ImageData` only with
  `include-image-data`.
- Once a capture is handed off, the element keeps no reference to it: working canvases are set to
  zero size, and the preview's Blob URL is revoked as soon as the image has decoded. The decoded
  preview stays on screen until retake, `reset()`, `clearSensitiveData()` or removal.
- Removing the element, `reset()`, errors and `dispose()` clear everything, including the
  preview. Call `clearSensitiveData()` yourself after uploading if the preview should go too.

JavaScript can't guarantee that memory is erased, and your own references (the event detail, the
`capture()` result) are yours to drop. Don't put captures in logs, analytics, storage or caches.

## Theming

Set custom properties on the element or on any ancestor:

```css
pv-face-capture {
  --pv-accent: oklch(0.62 0.17 285);
  --pv-radius-action: 12px;
  --pv-guide-stroke-width: 4px;
}
pv-face-capture::part(instruction) {
  font-size: 1.125rem;
}
```

The defaults follow a calm, monochrome style on the dark camera view. The ink is the accent,
signal colours are used only for success and error, and plain `ease` motion runs at 150, 200 or
300 ms.

| Property                                                       | Default                         | Used for                                      |
| -------------------------------------------------------------- | ------------------------------- | --------------------------------------------- |
| `--pv-font`                                                    | system UI stack                 | All text                                      |
| `--pv-page`, `--pv-surface`, `--pv-pressed`                    | `#121316`, `#1c1d20`, `#26282a` | Backgrounds, panels, secondary buttons        |
| `--pv-ink`, `--pv-secondary`                                   | `#f9fafb`, `#abacaf`            | Text                                          |
| `--pv-accent`, `--pv-on-accent`                                | ink, page                       | Aligned guide, ring, primary buttons, outline |
| `--pv-success`, `--pv-error`                                   | `#7fd49a`, `#f2b8b5`            | Done and failed states                        |
| `--pv-overlay`, `--pv-overlay-blur`                            | 64% page, `12px`                | Darkened, blurred surround of the face guide  |
| `--pv-document-overlay`                                        | 45% page                        | Dimmed surround of a found document           |
| `--pv-guide-idle`, `--pv-guide-found`                          | 50% and 85% ink                 | Guide colour before alignment                 |
| `--pv-guide-stroke-width`                                      | `3px`                           | Guide and document outline                    |
| `--pv-ring-width`, `--pv-ring-gap`, `--pv-ring-track`          | `6px`, `12px`, 16% ink          | Progress ring around the guide                |
| `--pv-tracker`, `--pv-landmark`                                | 75% ink, accent                 | Face tracker brackets and landmark dots       |
| `--pv-radius`, `--pv-radius-action`, `--pv-radius-sheet`       | `16px`, `28px`, `34px`          | Images, buttons and pills, panels             |
| `--pv-space`                                                   | `16px`                          | Edge spacing                                  |
| `--pv-motion-fast`, `--pv-motion-duration`, `--pv-motion-slow` | `150ms`, `200ms`, `300ms`       | Transitions                                   |
| `--pv-motion-calm`                                             | `600ms`                         | Guide and tracker colour changes              |
| `--pv-accept`, `--pv-accept-pulse`                             | success, `700ms`                | Acceptance moment colour and pulse length     |
| `--pv-easing`                                                  | `ease`                          | Transitions                                   |
| `--pv-sheet-shadow`                                            | `0 18px 68px rgb(0 0 0 / 0.4)`  | Panels                                        |

The element is `display: block`, fills its container and has a `min-height` of 420px. Give it a
height, for example `height: 100dvh` for a full-screen flow.

### Parts

| Part                                                                                        | Element                                                                            |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `root`, `video`, `still`, `overlay`                                                         | Container, camera preview, captured still, dimmed surround                         |
| `instruction`, `steps`                                                                      | Instruction pill and its step dots                                                 |
| `panel`, `title`, `body`                                                                    | Intro and error panel                                                              |
| `button`, `button-primary`                                                                  | Every button, and the primary ones                                                 |
| `guide`, `ring`, `tracker`, `landmarks`, `hint`, `success`                                  | Face guide, progress ring, tracker, landmarks, turn arrows, check badge            |
| `hint-text`, `precise`, `turn-guide`, `turn-gauge`                                          | Secondary hint line, "Use precise detection" button, head illustration, turn gauge |
| `shutter`, `retake`                                                                         | Buttons in the face and document views                                             |
| `viewfinder`, `quad`, `handle`, `hold-ring`                                                 | Document view                                                                      |
| `review`, `result-image`, `aspect`, `aspect-option`, `adjust`, `apply`, `confirm`, `corner` | Document review and corner adjustment                                              |
| `debug`                                                                                     | Debug readout                                                                      |

## Text and languages

The built-in texts are in English (default) and Dutch. Choose with `lang`, or let the element use
the closest `lang` attribute on the page. Replace any text with `labels`:

```ts
selfie.labels = { noFace: "Put your face in the frame", start: "Begin" };
```

`englishLabels` and `dutchLabels` are exported as a starting point for a new language. The
`CaptureLabels` type lists every key.

## Accessibility

- Instructions are read out through a polite live region, and the step number is included during
  the head-turn check.
- Every control is a real `<button>` with a visible focus ring. The shape choice is a radio group
  that works with the arrow keys. Document corners can be moved with the keyboard.
- The guide's colour never carries meaning alone, because every state has an instruction.
- Under `prefers-reduced-motion`, the arrow nudge and entrance animations are switched off, and
  the remaining transitions shorten to 150 ms.
- In forced-colours mode, the guide, ring and outline use system colours.

## Building your own UI

The logic behind the elements is exported, and it has no DOM:

- `createFaceFlow`: the state machine of the selfie flow.
- `createBoxSmoother`, `createSettledValue` and `createEasedNumber`: the calming pieces.
- `turnProgress`: the turn gauge.
- `assessFace` and `guideFor`: the guidance maths.
- `createPointsTracker`: smoothing.
- `createStabilityTracker`: hold-still detection.
- `sharpness`: the sharpness score.
- `createDocumentFlow` and `resolveAspect`: the document flow and its shape presets.
- `coverTransform`, `toView` and `fromView`: frame-to-view mapping.

You can use these to build the same behaviour in React Native or a canvas UI.

## Demo

```sh
pnpm --filter @pixelvision/capture-ui build
pnpm --filter @pixelvision/capture-ui demo   # http://localhost:4321/capture-ui/demo/
```

The demo is plain HTML with an import map, so it also shows how to use the package without a
bundler. It has options for shape, language, accent, landmarks, debug and steps. A "Synthetic
document" switch feeds the scanner a drawn card, so you can try it without a document.
`demo/frame.html` embeds the demo in a cross-origin iframe without `allow="camera"` to show the
blocked state.

## Tests

```sh
pnpm --filter @pixelvision/capture-ui test
```

`src/logic`, `src/sources` and `src/camera` (except `frames.ts`) are held to 100% coverage. They
contain every decision the elements make: guidance, smoothing, stability, sharpness, both flows,
aspect presets, camera error classification, the worker protocol and labels.

The browser glue (`src/elements`, `src/camera/frames.ts`, the worker entry) is not counted towards
the threshold. It needs a real camera, video frames, a 2D canvas, pointer capture and a worker
scope. The elements have happy-dom tests for registration, panels, languages, labels and
attributes, and for their lifecycle with a stand-in stream and canvas: start validation and
timeouts, stopping and disconnecting during startup and while the detector loads, cleanup of
canvases and Blob URLs, event boundaries and capture size.

```sh
pnpm --filter @pixelvision/capture-ui test:e2e
```

runs the built package in Chromium, Firefox and WebKit with a fake camera (`e2e/`): start, stop
and disconnect, the real built-in worker and its termination, cleanup, event boundaries, and the
`haar-worker` entry under a strict CSP without `blob:`.

## Limitations

- HAAR turns are not directional, and the profile cascade only fires on clear turns. People have
  to turn well to the side. The window and the stall helper make this more forgiving, but precise
  detection remains the better experience. With `@pixelvision/face-neural`, turns are directional and fire at a
  set angle (18° by default).
- HAAR detection (three cascade passes) takes about 150–300 ms per frame on a laptop, so the
  detection rate is around 3–6 per second. The worker keeps the preview and overlay smooth in the
  meantime.
- iOS Safari has no Vibration API, so there are no haptics there.
- The capture is a JPEG at 92% quality. Set `include-image-data` and use `detail.image`
  (`ImageData`) for another format.

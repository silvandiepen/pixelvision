# @pixelvision/verify

The server side of a face check with [pixelvision](https://www.npmjs.com/package/pixelvision):
your server picks what the person must do, and afterwards checks the frames itself instead of
trusting what the browser reports.

```sh
npm install @pixelvision/verify pixelvision
```

## How it works

1. `createChallenge` issues the steps (a new random order by default), a one-time code and an
   expiry, signed with a secret that never leaves your server.
2. `<pv-face-capture challenge-url="/challenge">` from `@pixelvision/capture-ui` fetches it, asks
   the person for those steps, and keeps every detection frame from the first face to the end.
3. Its `pv-evidence` event hands you the challenge, the frames and the photo. Post them with
   `evidenceForm`.
4. `verifyEvidence` checks the signature and expiry, spends the code (one attempt per challenge,
   pass or fail), checks the frames' count, size and timing, and runs the face detection again:
   the frames must complete every step in order, mostly not be exact repeats (a frozen or looped
   picture), and keep one face that doesn't jump across the frame (spliced footage).
5. Your app acts on `result.passed`, and on nothing the browser said.

```ts
// Request/Response handlers, as in Next.js, Hono, Remix, Bun or Deno.
import {
  createChallenge,
  createMemoryCodeStore,
  readEvidenceForm,
  verifyEvidence,
} from "@pixelvision/verify";

const secret = process.env.CHALLENGE_SECRET; // 32+ random characters
const codes = createMemoryCodeStore(); // use a shared store with several servers

export async function GET() {
  return Response.json(await createChallenge({ secret }));
}

export async function POST(request: Request) {
  const evidence = await readEvidenceForm(await request.formData());
  const result = await verifyEvidence(evidence, { secret, codes });
  return Response.json(result); // { passed, reasons, stepsDone, stepsTotal, framesChecked }
}
```

For a plain Node `http` server, see `examples/verify-server`.

```html
<pv-face-capture challenge-url="/challenge"></pv-face-capture>
<script type="module">
  import { evidenceForm } from "@pixelvision/capture-ui";

  const selfie = document.querySelector("pv-face-capture");
  selfie.addEventListener("pv-evidence", async (event) => {
    const result = await (
      await fetch("/verify", { method: "POST", body: evidenceForm(event.detail) })
    ).json();
  });
</script>
```

`examples/verify-server` in the repository is a complete Node server with both endpoints and a
test that posts recorded frames to it.

## Challenges

By default a challenge is random: frontal, then three steps, then frontal again. Without
`directions`, the steps are side turns (`side`, then `other-side`) and natural movement
(`move`), which pixelvision's built-in HAAR detector can check. With `directions: true` they are
`left`, `right`, `up` and `down` in a random order, which need a pose source that tells
directions:

```ts
import * as ort from "onnxruntime-node";
import { createFaceDetector, createHeadPoseTracker } from "@pixelvision/face-neural";

const detector = await createFaceDetector({
  ort,
  model: "path/to/face_detection_yunet_2023mar.onnx",
});

// A new tracker for every check: it learns this person's frontal face from the first frames.
const directionSource = () => {
  const tracker = createHeadPoseTracker();
  return async (frame) => {
    const [face] = await detector.detect(frame);
    return face ? { pose: tracker.update(face), face } : { pose: tracker.update(undefined) };
  };
};

const result = await verifyEvidence(evidence, { secret, codes, poseSource: directionSource() });
```

A pose source is a function from a frame (RGBA pixels) to `{ pose, face }`.

## Cost

A check decodes the frames and runs the face detection on each one until every step is done:
with the default HAAR pose source, about 85 ms per frame on a laptop, so roughly 5 s of CPU for
a seven-second head turn (the browser sends 8 frames a second). Exact repeats of a frame are
counted as frozen without being looked at again. Run checks off the request thread (a worker
or a queue) when many can arrive at once, and limit how often one user can ask for a challenge.

## Why a check fails

| Reason                   | Meaning                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `bad-signature`          | The challenge wasn't signed with this secret, or was changed       |
| `expired`                | The evidence came after the challenge expired                      |
| `code-used`              | This challenge was tried before; each can be tried once            |
| `needs-direction-source` | The challenge has directions and no pose source that tells them    |
| `too-few-frames`         | Fewer frames than the steps need                                   |
| `too-many-frames`        | More frames than `maxFrames`                                       |
| `frame-too-large`        | A frame over `maxFrameBytes` or `maxFrameSide`                     |
| `bad-frame`              | A frame that isn't a JPEG that decodes                             |
| `frames-differ`          | Frames of different sizes: not one camera                          |
| `bad-timing`             | Frame times that don't increase, or span longer than the challenge |
| `frozen-frames`          | Over a quarter of the frames repeat the one before exactly         |
| `face-jumps`             | The face jumps across the frame between frames                     |
| `steps-not-done`         | The frames don't complete every step in order                      |

## What it proves, and what it doesn't

A pass shows that someone produced frames, just now, that do what your server asked, in an
order they couldn't know in advance. That stops a page that lies about its result and replaying
a recording of an earlier check.

It doesn't show that the frames came from a real camera with a real person in front of it: a
virtual camera or a real-time deepfake can follow the steps live. Nothing here has been tested
by an independent lab. For identity verification (KYC), use a certified liveness service as
well; see the [security levels](https://pixelvision.hakobs.com/guide/security).

## License

MIT. Uses [jpeg-js](https://github.com/jpeg-js/jpeg-js) (BSD-3-Clause) to decode frames.

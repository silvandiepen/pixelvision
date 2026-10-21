What people build with pixelvision, and which functions do the work. Each section links to pages you can try.

## ID and KYC capture

Capture a clean, straight photo of an ID card and check that a real person is in front of the camera, in the browser, before anything is uploaded.

- Find and straighten the card in the camera feed with `findDocument` and `extractDocument`, at the ID card's 85.6 : 53.98 proportions. Try [Scan a document with the camera](/scan-document).
- Ask the person to turn their head with `createHeadTurnChallenge` and `detectHeadPose`. Try the [head-turn check](/head-turn).
- A head turn is a liveness signal, not proof: it stops printed photos and still screens, not a video replay. For identity checks, send the capture to a certified liveness service as well.

## Document scanning

Receipts, forms, book pages and whiteboards, straightened and cleaned up without a server.

- `findDocument` locates the page; `extractDocument` straightens it to A4 or any ratio.
- `threshold` with an automatic `otsuLevel` turns it into crisp black and white, and `equalizeHistogram` rescues dull photos.
- Run it on a camera loop with auto-capture, as [the scanner](/scan-document) does, or on uploaded photos.

## AR markers and tracking

Find a known flat image (a poster, a marker, a product box) in the camera feed and follow it.

- Describe the reference image once with `detectFast` and `describeOrb`, match each frame against it with `matchDescriptors`, and fit the match with `estimateHomography`, which ignores wrong matches.
- Between detections, follow the points with `trackPoints`; it's much cheaper than matching every frame.
- Draw content onto the found plane with `warpPerspective` or by transforming its corners with `transformPoint`.

## Accessibility

Camera input for people who can't use a touch screen or keyboard easily.

- Head position and turns from `detectHeadPose`, or from the optional [neural detector](/guide/face-neural), can drive switch-style input.
- Straighten and clean up a photographed page before it goes to text recognition or a screen reader.
- Everything runs on the device, so the camera image doesn't have to leave it.

## Education

Classic computer vision, one readable step at a time.

- Every function has a [live page](/examples) with an explanation of the algorithm, sliders for its parameters, and the exact code that runs.
- The source is short, typed TypeScript, checked against jsfeat and against known results, so it's safe to read and modify.

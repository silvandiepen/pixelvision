pixelvision runs in the browser or app of the person being checked. Whatever runs there can be changed by that person: the page, the camera feed, the results. How much you can trust a face or document capture depends on what you add around it. This page sets out five levels, what each one stops, what it doesn't, and how to set it up.

Each level builds on the one before. Pick the lowest level that covers the risk you actually have: every level adds work and asks more of the person being checked.

**Status.** Level 0 is available today and level 1 partly. Levels 2 and 3 are being built; their API below is the planned one and may still change. Level 4 is an integration with a separate, certified service, which pixelvision prepares the data for but doesn't replace.

## The short version

| Level | What it is                             | Stops                                                               | Doesn't stop                                                 | Status      |
| ----- | -------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ | ----------- |
| 0     | Capture aid                            | Bad photos: blurred, dark, off-centre, two people                   | Anyone who wants to cheat                                    | Available   |
| 1     | Hardened page                          | Other scripts on the page reading the photos; a still photo held up | A changed page, a recording, a virtual camera                | Partly      |
| 2     | Server challenge and server check      | A page that lies about its result; replaying a recording            | A live deepfake or puppet; a virtual camera with a live face | Planned     |
| 3     | Stronger evidence                      | Simple screen and print attacks; injected streams in a native app   | Skilled, prepared attacks; masks                             | Planned     |
| 4     | Certified liveness and identity checks | Tested against a defined set of attacks, to a measured error rate   | Whatever the certification didn't test; coercion             | Integration |

**Only level 4 is suitable for an identity decision (KYC).** Levels 0 to 3 make cheating harder and the result more trustworthy, but none of them has been independently tested against attacks, so none of them should approve or reject a person on its own.

## What a challenge adds

The selfie flow can ask the person to do something: turn their head, move it in a circle, or just be there and move naturally. Which challenge you choose changes how the check feels; whether it adds security depends on who chooses it.

| Challenge     | Asks the person to                                       | Needs                      |
| ------------- | -------------------------------------------------------- | -------------------------- |
| `none`        | Look at the camera                                       | Any detector               |
| `motion`      | Look at the camera for a moment; checks natural movement | Any detector               |
| `head-turn`   | Look, turn to one side, turn to the other, look back     | Any detector               |
| `head-circle` | Turn left, up, right and down                            | `@pixelvision/face-neural` |
| A sequence    | Your own order, such as `left,up,right`                  | `face-neural` for up/down  |

A challenge chosen in the page is known in advance: someone who wants to cheat records it once and replays it. It helps the person take a good photo and stops a still picture, nothing more. A challenge chosen by your server, in a new random order each time, with a time limit, is what makes a recording useless (level 2).

## Level 0: capture aid

The capture components guide the person to a usable photo: the face in the oval, sharp, lit and alone, or the document flat, still and fully in view. They report what they saw, such as `challengePassed`, but that report comes from the page and proves nothing.

**Use it for** profile photos, scanning receipts and forms, and as the capture step in front of any of the levels below.

```html
<pv-face-capture></pv-face-capture>
<!-- runs the head-turn challenge; steps="off" captures without one -->
```

The `challenge` attribute with the choices above is planned; today the flow has the head turn, on or off.

## Level 1: hardened page

Keep the photos away from everything else on the page and catch the crudest tricks.

- Serve the capture from its own origin (a subdomain is enough) with no analytics, tag managers, session replay or advertising scripts.
- Set a strict Content Security Policy and Permissions Policy. The [security review](https://github.com/silvandiepen/pixelvision/blob/main/docs/security-review-kyc.md#required-production-architecture) has a starting point.
- Use the standalone worker (`@pixelvision/capture-ui/haar-worker`), so the policy needn't allow `blob:` workers.
- Listen for `pv-capture` on the element itself: it doesn't bubble, so scripts elsewhere on the page don't receive the photo.
- Upload the photo straight away and call `dispose()`, which stops the camera and clears the photo from the component's memory.
- Keep the head turn on (or use the planned `motion` challenge): a printed photo held up to the camera can't complete it.

**Still open.** Someone can change the page, play a recording, or use a virtual camera, and the page will report success.

## Level 2: server challenge and server check (planned)

Your server decides what the person must do, and checks afterwards that it happened. The page's own result is no longer trusted at all.

1. Your server creates a challenge: a random order of steps, a one-time code and an expiry of a minute or two, signed with a secret only the server knows.
2. The capture component fetches it, asks for those steps, and keeps a few frames from each one.
3. At the end it hands you the evidence: the frames, the final photo and the signed challenge. You upload it to your server.
4. Your server runs the same pixelvision detection on the frames. pixelvision gives the same result in Node as in the browser (tested in CI), so the server reaches the same answer the page should have. It checks that every step happened in the order asked, within the time limit, with one face throughout, and that the code hasn't been used before.
5. Your app acts on the server's answer only.

```html
<pv-face-capture challenge-url="/api/liveness/challenge"></pv-face-capture>
<script type="module">
  const capture = document.querySelector("pv-face-capture");
  capture.addEventListener("pv-evidence", async (event) => {
    await fetch("/api/liveness/verify", { method: "POST", body: event.detail.form });
  });
</script>
```

```ts
// Server (Node), with @pixelvision/verify
import { createChallenge, verifyEvidence } from "@pixelvision/verify";

app.get("/api/liveness/challenge", (req, res) => {
  res.json(
    createChallenge({ secret: process.env.CHALLENGE_SECRET, steps: 3, expiresInMs: 90_000 }),
  );
});

app.post("/api/liveness/verify", async (req, res) => {
  const result = await verifyEvidence(await readEvidence(req), {
    secret: process.env.CHALLENGE_SECRET,
    usedCodes, // a store that remembers spent codes
  });
  res.json(result); // { passed, reasons, steps }
});
```

**Stops** a changed page claiming success (the server checks the frames itself) and a replayed recording (the order is new every time, and the clock runs on the server).

**Still open.** A virtual camera or a real-time deepfake can show a face doing what's asked, live. The server sees convincing frames.

## Level 3: stronger evidence (planned)

More and better evidence, so that a fake has to be good in more ways at once.

- **A continuous clip** instead of a few frames. The server follows points from frame to frame (`trackPoints`) and rejects cuts, loops and frozen frames.
- **A screen colour challenge.** The screen shows a short random sequence of colours. A real face lit by the screen reflects them in that order; a recording doesn't, and a screen held up to the camera reflects them differently.
- **Screen and print signs.** Moiré patterns, visible screen edges and flat, even lighting are signs of a photo or screen held up to the camera.
- **Device attestation in native apps.** In a React Native app, Apple's App Attest and Google's Play Integrity let your server check that the request comes from your untouched app on a real device. Browsers have no equivalent, which is why the strongest checks belong in an app.

**Stops** simple screen and print attacks, and injected streams in a native app that attestation detects.

**Still open.** A prepared attacker with a good mask, or a deepfake tuned to beat these checks. Nothing at this level has been tested by an independent lab, so nobody can tell you how often it is fooled.

## Level 4: certified liveness and identity checks

For identity verification (KYC, age checks with legal weight, account recovery), use a service whose presentation attack detection (PAD) has been independently tested to ISO/IEC 30107-3, for example by iBeta at level 1 or 2. NIST SP 800-63A-4 asks for this when biometrics are collected remotely, with fewer than 7% of attacks getting through.

A complete check is more than liveness:

1. **Liveness (PAD):** a real person is present now.
2. **Document verification:** the document is genuine, unaltered, valid and readable (MRZ, barcode, security features).
3. **Face match:** the live face matches the photo on the document.
4. **Risk and review:** attempt limits, fraud signals, and a trained person for unclear cases, with a way for the applicant to appeal.

**pixelvision's part** is the capture: guiding the person to good frames and packaging them with the challenge (levels 0 to 3), then handing the evidence to the service. Many certified services require their own capture SDK on the device; check this before you design around pixelvision's components. Where a service accepts uploaded media, pixelvision can stay the capture front end, and its own server check (level 2) can run first to turn away obvious fakes before you pay for a certified check.

## Choosing a level

- **A profile photo or a document scan for convenience:** level 0, plus level 1 if the images are sensitive.
- **Stopping casual abuse, such as duplicate sign-ups or sharing an account:** level 2.
- **Higher-value accounts without a legal identity requirement:** level 3, ideally in a native app.
- **Identity verification with legal or financial consequences:** level 4. Levels 0 to 3 are the capture in front of it.

Whatever the level: process only what you need, keep photos out of logs and analytics, delete them on a schedule, and treat face images as biometric data under the GDPR where they are used to identify someone. The [security review](https://github.com/silvandiepen/pixelvision/blob/main/docs/security-review-kyc.md) lists the full requirements.

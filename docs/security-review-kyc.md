# KYC security review

**Review date:** 2026-10-21  
**Repository commit:** `bf2da2679db54066f38ab19089ccec8472321a26`, plus the uncommitted
`capture-ui` and examples work present during the review  
**Scope:** `pixelvision`, `@pixelvision/face-neural`, `@pixelvision/capture-ui`, examples, build and
release configuration  
**Status:** **Not approved as a KYC identity-proofing or liveness decision component**

This is a source review and threat assessment, not a certification, penetration test of a deployed
service, legal opinion, or ISO conformity assessment. The reviewed code is useful client-side
capture and image-processing infrastructure. It does not, by itself, establish identity, document
authenticity, genuine sensor capture, or presentation-attack resistance.

## Executive decision

Do not use any client-produced value from this repository to approve or reject a KYC applicant.
In particular, do not trust `metadata.liveness`, `capturedAt`, face boxes, poses, document corners,
or image bytes as evidence that:

- a live person was present;
- media came from a physical camera rather than a virtual camera, replay, emulator, injected
  `MediaStream`, browser automation, or modified client;
- the person matches the portrait on an identity document;
- a document is authentic, unaltered, unexpired, or belongs to the applicant; or
- the client ran the published code at all.

The current head-turn sequence is explicitly replayable. The repository README correctly says it
is not certified presentation-attack detection (PAD), but the emitted API currently labels the
result `liveness: true`. That mismatch is unsafe for KYC integrations and is a release blocker.

A production KYC system must treat this package as an untrusted capture UI and perform identity
proofing, document validation, biometric comparison, PAD, media-injection analysis, policy, rate
limiting, audit, and final decisioning in a separately secured service.

## Frontend-only security target

This package can be substantially improved while remaining frontend-only. Its defensible role is a
secure, privacy-conscious capture and image-quality component that returns untrusted media and
diagnostic signals to its consumer. It must not claim to verify identity, document authenticity,
genuine presence, or liveness.

Improvements that belong in this package include:

- rename `liveness` to `headTurnChallengeCompleted` or another non-verdict term and document it as a
  replayable capture-guidance signal;
- distinguish `captureQuality`, `challengeCompleted`, and `warnings` from any downstream verification
  result;
- accept an externally supplied, expiring challenge and return a challenge transcript, while clearly
  stating that the client cannot make the challenge or transcript authoritative;
- cancel in-progress startup and detection work, validate live tracks, enforce timeouts, and reliably
  terminate workers and camera tracks;
- minimize sensitive data by returning a `Blob` by default, making raw pixels opt-in, bounding image
  dimensions and byte size, revoking URLs, clearing canvases, and exposing an explicit disposal API;
- avoid bubbling or composed events containing face images, document images, or raw pixels;
- report non-authoritative integrity warnings such as frozen or repeated frames, stream replacement,
  visibility interruption, unexpected resolution changes, and caller-supplied streams;
- improve face and document capture quality checks, including multiple faces, framing, blur, glare,
  exposure, occlusion, crop completeness, effective resolution, and cross-frame consistency;
- validate model hashes and neural input/output names, shapes, lengths, channel counts, dimensions, and
  finite numeric values before allocation or use;
- ship and test a same-origin standalone worker compatible with a restrictive Content Security Policy;
  and
- test packaged artifacts in real browsers, including cancellation, cleanup, payload isolation,
  hostile inputs, memory bounds, CSP behavior, and repeated start/stop cycles.

These changes reduce accidental disclosure, misuse, denial of service, integration errors, and some
low-effort capture attacks. They cannot make a browser result authoritative: modified clients can
still fabricate media, events, timestamps, challenge results, and integrity warnings. Certified PAD,
document verification, biometric matching, replay protection, policy, and the final KYC decision
therefore remain outside this package's security boundary.

## What was checked

- Manual review of camera acquisition and shutdown, frame capture, face/document flows, workers,
  events, Blob URL lifetime, neural-model loading, public package exports, examples, CI, and tests.
- Threat modeling for replay, deepfake, virtual-camera and custom-stream injection, client
  tampering, malicious/oversized inputs, data leakage, third-party scripts, denial of service,
  dependency compromise, and model replacement.
- `pnpm audit --json`: 435 total dependencies, with 0 critical, high, moderate, low, or informational
  advisories at review time.
- Pattern-based secret scan of the working tree and Git history for common private keys and major
  provider token formats: no matches. This was not an entropy-based scan and does not replace a
  dedicated secret scanner in CI.
- Model provenance check: the shipped YuNet file has SHA-256
  `8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4`, matching the hash published
  by the upstream OpenCV model repository.
- Package validation: the main `capture-ui` entry passes `publint`; `attw` reports problems for its
  `haar-worker` subpath.
- A synthetic sequence of 12 pose strings (`frontal`, left, right, `frontal`, three times each)
  completed the head-turn challenge without camera or image input. This is expected from the API,
  but demonstrates why challenge completion is not a liveness verdict.
- Unit, type, lint, format, build, package, and browser checks described under [Validation](#validation).

## Threat model

### Assets

- Full-resolution face photographs and identity-document images.
- Raw `ImageData`, intermediate canvases, JPEG blobs, Blob URLs, face landmarks and boxes.
- Identity attributes extracted later by a consuming KYC system.
- KYC decision integrity, audit trail, model files, application bundle and capture session.

### Adversaries

- An applicant presenting a print, screen, mask, replayed video, face swap, deepfake, forged
  document, or image edited before injection.
- Malware, browser extensions, analytics/tag-manager scripts, compromised dependencies, or XSS
  running in the same origin.
- A modified browser/client that fabricates events and metadata or bypasses the package entirely.
- Automated enrollment farms and bots.
- An attacker replacing a model, worker, application bundle, upload, or server response.
- Accidental exposure through logs, telemetry, browser memory, crash reports, caches, or retention.

### Trust boundaries

Everything executing in the applicant's browser is untrusted. Browser camera permission proves
only that the origin received a stream; it does not authenticate a physical sensor or the media.
The `stream`, `source`, `finder`, labels, attributes, clock and all event data are client-controlled.
A secure design must establish trust again at an authenticated backend boundary.

## Findings

### KYC-01 — Critical — `liveness: true` is not a defensible liveness verdict

`FaceCaptureElement.capture()` sets `metadata.liveness` to `done && this.steps` after completing a
head-turn state machine (`packages/capture-ui/src/elements/faceCapture.ts`, around lines 563-590).
The public type calls this field `liveness` (`elements/events.model.ts`, around lines 48-72).

The challenge has a predictable four-step order and accepts pose classifications supplied by any
configured source. A replayed video, virtual camera, custom `MediaStream`, scripted detector,
modified client or deepfake can produce the required sequence. The implementation does not test
texture, depth, reflection, moire, screen borders, mask cues, challenge freshness, sensor
authenticity, or media injection. It has no measured attack-presentation performance.

The README warning at `packages/capture-ui/README.md`, lines 17-20 is accurate, but an API field
named `liveness` is more likely to be consumed than that warning.

**Required before KYC use:**

1. Rename the field to `headTurnChallengeCompleted` or `captureChallengeCompleted`. Do not retain a
   deprecated alias named `liveness`.
2. State in TSDoc, emitted types, README and examples that this value is a capture-quality signal,
   not PAD, genuine-presence evidence, or an authorization input.
3. Require independently evaluated PAD for remote biometric collection. NIST SP 800-63A-4 calls
   for ISO/IEC 30107-3-conformant PAD and an IAPAR below 0.07 when collecting and comparing
   biometrics remotely.
4. Publish the exact certified component, version, operating point, tested attack instruments,
   IAPAR/APCER/BPCER or applicable metrics, demographic evaluation, and integration assumptions.

### KYC-02 — Critical — no trusted capture, session binding, or anti-injection control

The component accepts a caller-supplied `MediaStream`, detector, and document finder. Events are
plain client-created `CustomEvent` objects. `capturedAt` comes from the client clock. There is no
server nonce, unpredictable server challenge, signed transcript, device attestation, virtual-camera
detection, emulator/root/jailbreak signal, frame continuity proof, or authenticated sensor channel.

An attacker does not need to defeat the algorithms: they can fabricate the upload and metadata or
patch the JavaScript. A client assertion must never authorize a KYC outcome.

**Required architecture:**

- Create an authenticated, short-lived server capture session with a high-entropy nonce.
- Bind every upload and PAD/document-validation result to that session, applicant, policy version,
  provider version and expiration time.
- Generate unpredictable challenges server-side where active PAD is used. Reject reused,
  reordered, stale, implausibly fast, or incomplete transcripts.
- Analyze submitted media for replay, editing, deepfake and injection indicators. Add device and
  sensor integrity signals where the target platform supports them.
- Make the backend authoritative. Never accept `liveness`, `capturedAt`, face/document geometry or
  a success event as proof.
- Rate-limit sessions and attempts; add bot/fraud controls and manual review/escalation paths.

### KYC-03 — Critical if misused — document scanning is not document verification

`<pv-document-scanner>` finds a quadrilateral, captures it, allows manual corner changes, and
performs a perspective transform. It does not determine whether the document is genuine, altered,
expired, stolen, photocopied, displayed on a screen, or issued by an authoritative source. Manual
corner editing also means geometry is intentionally not evidentiary.

**Required:** describe the feature everywhere as document capture/cropping, not verification. A KYC
backend must separately perform document classification, OCR/MRZ/barcode consistency, expiry and
issuer rules, tamper/forgery analysis, physical-security-feature checks where possible, authoritative
source validation, and portrait-to-live-face comparison. High-risk or ambiguous results need trained
manual review and user redress.

### KYC-04 — High — sensitive images remain in memory and Blob URLs after completion/removal

Face capture retains the result Blob, full `ImageData`, best-frame canvas and still-image Blob URL.
Document capture retains source canvas pixels, transformed `ImageData`, Blob and Blob URL until a
later reset. `disconnectedCallback()` calls `stop()` but does not clear completed results or revoke
completed-image URLs. If application code retains the element, sensitive data remains reachable.

The API also returns both encoded images and raw full-resolution pixels, duplicating biometric and
identity-document data in JavaScript memory.

**Required:**

- Add an idempotent `clearSensitiveData()`/`dispose()` method and call it on disconnect, reset,
  upload completion, error and cancellation.
- Revoke every Blob URL and clear canvases by setting dimensions to zero; remove image sources and
  release references to blobs, `ImageData`, best frames and results.
- Make raw `ImageData` opt-in. Default to one encoded output with bounded dimensions and quality.
- Document precise client and server retention. Do not put images in logs, analytics, session
  replay, crash reports, local/session storage, service-worker caches, or general telemetry.
- Test cleanup with weak references where practical and with observable Blob URL revocation.

JavaScript cannot guarantee immediate physical memory erasure, so minimization and short lifetime
are essential.

### KYC-05 — High — capture data is broadcast as bubbling, composed DOM events

`CaptureElement.emit()` sends all events with `bubbles: true` and `composed: true`
(`captureElement.ts`, lines 457-465). `pv-capture` contains the face or document Blob and raw
`ImageData`. Any same-origin script can listen at `document` or `window` and copy the data. A script
already executing in the origin is powerful, but broadcasting highly sensitive data unnecessarily
widens accidental and third-party collection paths.

**Required:** make sensitive capture events non-bubbling and non-composed by default, or expose the
result through an explicit callback/promise capability. Keep progress events separate from image
payloads. For KYC deployments, use a dedicated origin or tightly sandboxed capture frame with no
advertising, tag managers, session replay, unrelated analytics or unnecessary third-party scripts.

### KYC-06 — High — no PAD, biometric matching, or fairness performance evidence

YuNet is used only for face detection/landmarks and head direction. HAAR is a weaker alternative.
Neither is a face-recognition matcher or PAD model. The repository has functional fixtures, but no
attack corpus, bona fide/presentation corpus, demographic evaluation, false-match/false-non-match
measurement, IAPAR/APCER/BPCER measurement, environmental operating envelope, or threshold study.

**Required:** do not market this package as KYC liveness. Commission independent testing of the
actual end-to-end biometric/PAD system under ISO/IEC 30107-3 and biometric performance standards,
including replay, print, mask, injection and deepfake attacks and relevant demographic groups.
Publish limitations and an operational monitoring/re-evaluation plan.

### KYC-07 — High — asynchronous stop can create an orphan detector worker

The default face source awaits dynamic cascade imports before assigning `activeSource`
(`faceCapture.ts`, around lines 426-442). If `stop()` or disconnect occurs during that await,
`onStopped()` sees no source to dispose. The resumed operation can then create a worker and run
detection on an already-grabbed frame before checking the generation around line 468. That worker
can remain alive until another stop cycle.

This violates the expectation that stop ends processing and is particularly undesirable for camera
and biometric data.

**Required:** pass an abort/generation token through source construction and detection; re-check it
immediately after every await; dispose any newly created stale source before returning. Add a browser
test that disconnects during cascade loading and proves no detection, worker, frame, Blob URL or
stream survives.

### KYC-08 — Medium — camera startup can remain pending with an attached stream

After attaching the stream, `start()` waits only for `loadedmetadata` when `videoWidth` is zero
(`captureElement.ts`, lines 243-273). An empty, ended or invalid external stream may never fire that
event. The promise and listener remain, and the stream can stay attached until an explicit stop.

**Required:** validate that a live video track exists, listen for track end and media errors, use an
abortable startup timeout, and remove all listeners in every completion path. Test missing tracks,
ended tracks, metadata timeout, disconnect during start, repeated start/stop, and permission races.

### KYC-09 — Medium — capture size and neural inputs are insufficiently bounded/validated

Detection frames are bounded, but final capture uses the stream's full `videoWidth` and
`videoHeight`, creates canvases, blobs and raw pixel copies, and document processing creates further
full copies. A hostile or unexpectedly large external stream can cause severe memory pressure.

`letterbox()` documents 1, 3 or 4 channels but does not reject other channel counts, zero sizes,
short buffers or non-finite dimensions. Detector thresholds and `maxFaces` are not range-checked.
Model outputs are checked only for `Float32Array`, not required tensor names, dimensions, lengths or
finite values. An incorrect or replaced model can cause exceptions, excessive work, NaNs or invalid
geometry.

**Required:** enforce finite positive dimensions, allowed channels, exact minimum buffer lengths,
maximum source pixels/bytes, maximum output dimensions, finite thresholds and bounded counts. Verify
every required ONNX output name, shape, element count and finite value before decoding. Fail closed
with typed errors and test malformed inputs.

### KYC-10 — Medium — strict-CSP worker path is broken and inline workers encourage `blob:`

The default worker is generated from a Blob URL (`sources/inlineWorker.ts`). Deployments must allow
`blob:` in `worker-src` or fall back to main-thread detection. The documented strict-CSP alternative,
`@pixelvision/capture-ui/haar-worker`, has an unconditional ESM export. `attw` reports no declaration
and CommonJS-to-ESM resolution problems. The repository package checker omits `capture-ui`, so CI
does not detect this.

**Required:** repair the worker export as an import-only browser entry, add appropriate types or an
intentional validation exclusion, add `capture-ui` to package checks, and provide a CSP deployment
example using `worker-src 'self'` without `blob:`.

### KYC-11 — Medium — browser security-critical paths are excluded from coverage

The `capture-ui` coverage configuration excludes elements, camera frame/canvas code and the real
worker. Its comment says these are exercised end-to-end in Chrome, but the package has no
`test:e2e` script and the examples application does not import the Web Components package.

**Required:** add real-browser tests in Chromium, Firefox and WebKit for the packaged artifacts:
permissions, start/stop/disconnect, real worker and strict-CSP worker, CSP failure fallback, cleanup,
event boundaries, external streams, malformed detector responses, pointer adjustment, timeout,
visibility changes, and concurrent starts. Run them in CI against the packed tarball.

### KYC-12 — Medium — parity checks are currently unsound

Two OpenCV tests call a numeric-bound helper with a callback as the third argument
(`packages/parity/test/opencv.parity.test.ts`, around lines 233-300). JavaScript comparisons against
the function and missing upper bound are false, so the checks pass without validating pixels.
TypeScript flags both calls.

This does not directly create a KYC exploit, but it undermines the project's strongest correctness
claim for blur and perspective warp, which are used in capture/document processing.

**Required:** fix the comparison API, prove each parity test fails against a deliberately broken
implementation, and require type-check before or as part of parity execution.

### KYC-13 — Medium — supply-chain controls need hardening

Positive results: npm advisory data was clean at review time; pnpm install scripts are explicitly
allowlisted/blocked; the YuNet bytes match upstream; published code uses no runtime dependency in the
core package.

Gaps:

- CI actions use mutable major tags rather than commit SHAs.
- CI has no dependency review, scheduled audit, SBOM/provenance generation, artifact signing,
  secret scanner, SAST, or model-hash check.
- `check-packages.mjs` omits the new public `capture-ui` package.
- `MODELS.md` states provenance but does not record or automatically verify the model hash.
- The build publishes source maps, which may be acceptable for an open-source package but should be
  an explicit deployment decision for the KYC application.
- ONNX Runtime is supplied by the consuming application; its exact version, WASM assets and CSP are
  outside this repository's control.

**Required:** pin actions by full commit SHA, enable dependency review and scheduled advisory scans,
generate an SBOM and signed provenance for releases, verify the model SHA-256 in CI, scan secrets and
source, validate every packed entry point, and define a supported/patched ONNX Runtime matrix.

### KYC-14 — Low — test telemetry creates an unignored identifier file

An ONNX test created `packages/face-neural/:memory:.ses`, accompanied by a runtime warning that a
telemetry device identifier could not be persisted normally. The file is not ignored. Prevent the
runtime from creating telemetry state in the repository, redirect it to an isolated temporary
directory, or ignore the exact artifact. Confirm telemetry is disabled or documented for production
biometric processing.

## Required production architecture

At minimum, a KYC deployment should use this flow:

1. An authenticated backend creates a one-use capture session with nonce, policy version, expiry,
   attempt count and allowed origin/device context.
2. A dedicated capture origin loads only reviewed, integrity-pinned first-party assets. It uses a
   restrictive CSP and Permissions Policy, no tag manager/session replay, and the standalone worker.
3. The browser captures bounded media and immediately uploads it over TLS to the session endpoint.
   Client metadata is treated as untrusted hints.
4. A certified/independently evaluated service performs PAD and injection/forgery analysis on the
   original capture or required frame sequence.
5. A document service validates type, security features, MRZ/barcode/OCR consistency, expiry,
   tampering and authoritative-source data.
6. A separately evaluated 1:1 matcher compares the live sample with the validated document portrait
   at a fixed, documented operating point.
7. A server-side risk engine combines authoritative results, attempt history, device/bot signals and
   policy. Borderline cases go to trained manual review. Applicants have an accessible fallback and
   redress path.
8. Raw media and derived biometric data are encrypted, access-controlled, audited, minimized and
   deleted under a documented retention schedule. Logs contain identifiers and outcomes, not images.

Suggested browser policy starting point, to be adapted and tested by the deploying application:

```http
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self' https://kyc-api.example; worker-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=(), usb=()
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
```

Do not copy this blindly: model/WASM loading, framing requirements and upload destinations affect the
necessary directives. Prefer a dedicated origin and avoid adding broad third-party or `blob:` script
allowances.

## Privacy and governance requirements

Facial images and identity-document images are personal data. When technical processing is used to
uniquely identify or verify a person, biometric data can be special-category data under GDPR/UK
GDPR. Before production use:

- identify controller, processor and subprocessor roles and execute appropriate contracts;
- establish both an Article 6 lawful basis and an applicable Article 9 condition where required;
- complete a DPIA before processing, including necessity, proportionality and less intrusive
  alternatives;
- document purposes, data flows, fields, recipients, countries, transfer safeguards, retention and
  deletion;
- provide clear notice and an accessible non-biometric/manual alternative where required;
- implement least privilege, encryption in transit and at rest, key separation, audited access,
  breach response, deletion verification and data-subject request procedures;
- assess automated-decision, discrimination and demographic-performance risks and provide human
  review/redress; and
- prohibit production images from development, analytics and model training unless separately
  justified, consented/lawful, minimized and governed.

## Release-blocking checklist

The following must all be complete before describing a deployment as KYC-ready:

- [ ] Remove/rename the `liveness` verdict and migrate all consumers.
- [ ] Integrate independently tested PAD and media-injection/forgery detection.
- [ ] Implement server sessions, nonce/challenge binding, replay protection and attempt limits.
- [ ] Implement genuine document validation and authoritative checks, not only cropping.
- [ ] Implement separately evaluated 1:1 face matching where the policy requires it.
- [ ] Add sensitive-data disposal and prove cleanup in browser tests.
- [ ] Isolate capture from third-party scripts and stop broadcasting image payloads.
- [ ] Fix stop/start cancellation races and worker cleanup.
- [ ] Add strict input/output/model validation and capture resource limits.
- [ ] Repair and validate the strict-CSP worker package entry.
- [ ] Add packed-artifact E2E tests across the three browser engines.
- [ ] Fix vacuous parity comparisons and make all repository checks pass.
- [ ] Pin and verify model, dependency, CI action and release provenance.
- [ ] Complete DPIA, retention policy, incident response, accessibility fallback and redress design.
- [ ] Obtain legal/compliance review for every jurisdiction and regulated use case.
- [ ] Perform an independent penetration test of the deployed system and remediate findings.

## Validation snapshot

The repository was actively changing during review, so this is a dated snapshot rather than a clean
release attestation.

- Production builds completed successfully.
- Core `pixelvision`: 353 unit tests passed with 100% configured coverage.
- `face-neural`: 15 tests passed with 100% configured coverage.
- `capture-ui`: 147 tests passed with 100% coverage only after its substantial browser glue
  exclusions.
- Dependency audit: 0 known advisories across 435 reported dependencies.
- `pnpm check` did not pass: formatting, lint and parity type errors were observed during review.
- The full examples E2E run ended with 304/363 passing. Most failures were caused by the examples
  registry changing while the preview server was already running; two WebKit failures were missing
  Playwright trace artifacts. This result is not a clean browser release signal.
- `capture-ui` main package entry passed `publint`; its worker subpath failed `attw` checks.
- No source files were changed by the review except this document. A temporary audit-created
  `.pnpm-store` directory was removed.

## Positive controls already present

- The README and core TSDoc explicitly warn that head-turn completion is not certified PAD.
- Browser camera access relies on the platform permission model and secure-context requirement.
- Camera tracks opened internally are stopped on the ordinary stop path.
- Frames are processed locally by default; the package itself does not upload captures.
- User-facing label overrides use `textContent`, not HTML injection.
- Detection work is serialized rather than queued without limit.
- Detection size and timing attributes are clamped.
- Worker frame buffers are copied before transfer.
- Blob URLs are revoked on ordinary retake/reset paths.
- The core library avoids DOM/Node APIs and runtime dependencies.
- Unit coverage and deterministic jsfeat parity infrastructure are unusually strong once the
  identified gaps are corrected.

## Standards and authoritative references

- [NIST SP 800-63A-4, Enrollment and Identity Proofing](https://pages.nist.gov/800-63-4/sp800-63a.html),
  including digital injection, forged media and remote proofing controls.
- [NIST SP 800-63A-4, general identity-proofing requirements](https://pages.nist.gov/800-63-4/sp800-63a/ial-general/),
  including remote biometric PAD and performance requirements.
- [ISO/IEC 30107-3:2023](https://www.iso.org/standard/79520.html), PAD testing and reporting.
- [GDPR, Regulation (EU) 2016/679](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679),
  including Articles 4, 5, 9, 25, 32 and 35.
- [ICO biometric compliance guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-demonstrate-our-compliance-with-our-data-protection-obligations/),
  including privacy by design and DPIAs.
- [ICO biometric data security guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-keep-biometric-data-secure/).
- [OWASP ASVS 5.0](https://asvs.owasp.org/) and
  [ASVS file upload/content requirements](https://cornucopia.owasp.org/taxonomy/asvs-5.0/05-file-handling/02-file-upload-and-content).
- [Upstream YuNet model artifact](https://huggingface.co/opencv/face_detection_yunet/blob/main/face_detection_yunet_2023mar.onnx),
  including the published SHA-256 used for the provenance comparison.

import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ChallengeStep } from "pixelvision";
import { createChallenge, hasValidSignature, isChallenge, randomSteps } from "./challenge";
import type { SignedChallenge } from "./challenge.model";
import { createMemoryCodeStore } from "./codes";
import { readEvidenceForm } from "./form";
import { haarPoseSource, jpegSize, verifyEvidence } from "./verify";
import type { Evidence, EvidenceFrame, VerifyOptions } from "./verify.model";

const secret = "a-test-secret-that-is-long-enough-to-sign";

/**
 * Frames of a sample clip (one AI-generated person; see apps/examples/public/media),
 * 8 a second, as a browser would send them.
 *
 * @param clip - The fixture folder.
 * @returns The frames.
 */
const clip = (clip: string): EvidenceFrame[] => {
  const folder = new URL(`../fixtures/${clip}/`, import.meta.url);
  return readdirSync(folder)
    .sort()
    .map((file, i) => ({
      time: i * 125,
      jpeg: new Uint8Array(readFileSync(new URL(file, folder))),
    }));
};

/** Options with a fresh code store. */
const options = (extra: Partial<VerifyOptions> = {}): VerifyOptions => ({
  secret,
  codes: createMemoryCodeStore(),
  ...extra,
});

/** A challenge with these steps, issued now. */
const issue = (steps: readonly ChallengeStep[] | "head-turn" | "motion") =>
  createChallenge({ secret, steps });

describe("createChallenge", () => {
  it("signs the steps, a one-time code and an expiry", async () => {
    const challenge = await createChallenge({ secret, steps: "head-turn", now: () => 1000 });
    expect(challenge).toMatchObject({
      steps: ["frontal", "side", "other-side", "frontal"],
      issuedAt: 1000,
      expiresAt: 121_000,
    });
    expect(challenge.id).toMatch(/^[0-9a-f]{32}$/);
    expect(await hasValidSignature(challenge, secret)).toBe(true);
    expect(await hasValidSignature({ ...challenge, steps: ["frontal"] }, secret)).toBe(false);
    expect(await hasValidSignature(challenge, `${secret}!`)).toBe(false);
    // A signature of another length, compared without an early exit.
    expect(await hasValidSignature({ ...challenge, signature: "x" }, secret)).toBe(false);
    expect(await hasValidSignature({ ...challenge, signature: "x".repeat(60) }, secret)).toBe(
      false,
    );
  });

  it("makes a new random order by default", async () => {
    const challenge = await createChallenge({ secret });
    expect(challenge.steps[0]).toBe("frontal");
    expect(challenge.steps.at(-1)).toBe("frontal");
    expect(challenge.steps.length).toBeGreaterThanOrEqual(5);
  });

  it("refuses a short secret, a bad length and a bad expiry", async () => {
    await expect(createChallenge({ secret: "short" })).rejects.toThrow(RangeError);
    await expect(createChallenge({ secret, length: 0 })).rejects.toThrow(RangeError);
    await expect(createChallenge({ secret, expiresInMs: 0 })).rejects.toThrow(RangeError);
  });
});

describe("randomSteps", () => {
  it("never repeats a direction in a row, and uses all four before repeating", () => {
    for (let run = 0; run < 50; run++) {
      const steps = randomSteps(6, true);
      expect(steps).toHaveLength(8);
      const middle = steps.slice(1, -1);
      for (let i = 1; i < middle.length; i++) expect(middle[i]).not.toBe(middle[i - 1]);
      expect(new Set(middle.slice(0, 4)).size).toBe(4);
    }
  });

  it("without directions, pairs each side with the other side", () => {
    for (let run = 0; run < 50; run++) {
      const middle = randomSteps(5, false).slice(1, -1);
      expect(middle.length).toBe(5);
      middle.forEach((step, i) => {
        if (step === "side") expect(middle[i + 1]).toBe("other-side");
        if (step === "other-side") expect(middle[i - 1]).toBe("side");
      });
    }
  });
});

describe("isChallenge", () => {
  it("checks the shape", async () => {
    expect(isChallenge(await issue("head-turn"))).toBe(true);
    expect(isChallenge(null)).toBe(false);
    expect(isChallenge({ id: "x", steps: "frontal" })).toBe(false);
  });
});

describe("verifyEvidence on a recorded head turn", () => {
  it("passes when the frames do what the challenge asked", async () => {
    const challenge = await issue("head-turn");
    const result = await verifyEvidence({ challenge, frames: clip("head-turn") }, options());
    expect(result).toMatchObject({ passed: true, reasons: [], stepsDone: 4, stepsTotal: 4 });
    // It stops once every step is done: the last frontal frames can't change the outcome.
    expect(result.framesChecked).toBeGreaterThan(40);
    expect(result.framesChecked).toBeLessThan(68);
  });

  it("passes the motion challenge on a live-looking face", async () => {
    const challenge = await issue("motion");
    const result = await verifyEvidence({ challenge, frames: clip("motion") }, options());
    expect(result.reasons).toEqual([]);
  });

  it("fails a different challenge the same recording doesn't do", async () => {
    // A recording of a head turn has no natural movement step between the turns.
    const challenge = await issue([
      "frontal",
      "side",
      "other-side",
      "frontal",
      "side",
      "other-side",
      "frontal",
    ]);
    const result = await verifyEvidence({ challenge, frames: clip("head-turn") }, options());
    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("steps-not-done");
  });

  it("fails a frozen picture", async () => {
    const challenge = await issue("motion");
    const [first] = clip("motion");
    const frames = Array.from({ length: 40 }, (_, i) => ({ ...first, time: i * 125 }));
    const result = await verifyEvidence({ challenge, frames }, options());
    expect(result.reasons).toEqual(expect.arrayContaining(["frozen-frames", "steps-not-done"]));
  });

  it("fails spliced footage where the face jumps", async () => {
    const challenge = await issue("head-turn");
    const frames = clip("head-turn");
    // Swap in a frame with the face moved far across: crop-shifted by flipping the order isn't
    // enough, so use a pose source that reports a face jumping halfway through.
    let n = 0;
    const result = await verifyEvidence(
      { challenge, frames },
      options({
        poseSource: () => {
          n++;
          return {
            pose: "frontal",
            face: { x: n === 30 ? 200 : 10, y: 10, width: 60, height: 60 },
          };
        },
      }),
    );
    expect(result.reasons).toContain("face-jumps");
  });
});

describe("verifyEvidence refuses", () => {
  const frames = clip("head-turn");

  it("a changed or unsigned challenge", async () => {
    const challenge = await issue("head-turn");
    const changed = { ...challenge, steps: ["frontal"] as ChallengeStep[] };
    expect((await verifyEvidence({ challenge: changed, frames }, options())).reasons).toEqual([
      "bad-signature",
    ]);
    const junk = { id: 1 } as unknown as SignedChallenge;
    expect((await verifyEvidence({ challenge: junk, frames }, options())).reasons).toEqual([
      "bad-signature",
    ]);
  });

  it("an expired challenge", async () => {
    const challenge = await createChallenge({ secret, steps: "head-turn", expiresInMs: 10 });
    const later = options({ now: () => challenge.expiresAt + 1 });
    expect((await verifyEvidence({ challenge, frames }, later)).reasons).toEqual(["expired"]);
  });

  it("a second attempt with the same code, pass or fail", async () => {
    const challenge = await issue("head-turn");
    const shared = options();
    await verifyEvidence({ challenge, frames: frames.slice(0, 2) }, shared);
    expect((await verifyEvidence({ challenge, frames }, shared)).reasons).toEqual(["code-used"]);
  });

  it("directions without a pose source that tells them", async () => {
    const challenge = await issue(["frontal", "left"]);
    expect((await verifyEvidence({ challenge, frames }, options())).reasons).toEqual([
      "needs-direction-source",
    ]);
  });

  it("too few and too many frames", async () => {
    const challenge = await issue("head-turn");
    expect(
      (await verifyEvidence({ challenge, frames: frames.slice(0, 3) }, options())).reasons,
    ).toEqual(["too-few-frames"]);
    const other = await issue("head-turn");
    expect(
      (await verifyEvidence({ challenge: other, frames }, options({ maxFrames: 10 }))).reasons,
    ).toEqual(["too-many-frames"]);
  });

  it("frames that are too large, in bytes or pixels", async () => {
    const one = await issue("head-turn");
    expect(
      (await verifyEvidence({ challenge: one, frames }, options({ maxFrameBytes: 100 }))).reasons,
    ).toEqual(["frame-too-large"]);
    const two = await issue("head-turn");
    expect(
      (await verifyEvidence({ challenge: two, frames }, options({ maxFrameSide: 100 }))).reasons,
    ).toEqual(["frame-too-large"]);
  });

  it("a frame that isn't a JPEG", async () => {
    const challenge = await issue("head-turn");
    const broken = [...frames];
    broken[5] = { time: broken[5].time, jpeg: new Uint8Array([1, 2, 3]) };
    expect((await verifyEvidence({ challenge, frames: broken }, options())).reasons).toEqual([
      "bad-frame",
    ]);
  });

  it("frames of different sizes", async () => {
    const challenge = await issue("motion");
    const mixed = [...frames.slice(0, 10)];
    // A frame from a differently sized source, appended last.
    const small = new Uint8Array(readFileSync(new URL("../fixtures/small.jpg", import.meta.url)));
    mixed.push({ time: 99_999, jpeg: small });
    expect((await verifyEvidence({ challenge, frames: mixed }, options())).reasons).toEqual([
      "frames-differ",
    ]);
  });

  it("times that go back or span longer than the challenge lived", async () => {
    const one = await issue("head-turn");
    const back = frames.map((frame, i) => ({ ...frame, time: i === 10 ? 0 : frame.time }));
    expect((await verifyEvidence({ challenge: one, frames: back }, options())).reasons).toEqual([
      "bad-timing",
    ]);
    const two = await issue("head-turn");
    const long = frames.map((frame, i) => ({ ...frame, time: i * 10_000 }));
    expect((await verifyEvidence({ challenge: two, frames: long }, options())).reasons).toEqual([
      "bad-timing",
    ]);
  });
});

describe("createMemoryCodeStore", () => {
  it("accepts a code once, and forgets it after its challenge expires", () => {
    let t = 0;
    const codes = createMemoryCodeStore(() => t);
    expect(codes.use("a", 100)).toBe(true);
    expect(codes.use("a", 100)).toBe(false);
    t = 101;
    expect(codes.use("b", 200)).toBe(true);
    expect(codes.use("a", 300)).toBe(true);
  });
});

describe("readEvidenceForm", () => {
  it("reads the fields evidenceForm writes", async () => {
    const challenge = await issue("head-turn");
    const form = new FormData();
    form.set("challenge", JSON.stringify(challenge));
    form.set("times", JSON.stringify([0, 125]));
    form.append("frame", new Blob([new Uint8Array([1])]));
    form.append("frame", new Blob([new Uint8Array([2])]));
    form.set("photo", new Blob([new Uint8Array([3])]));
    const evidence: Evidence = await readEvidenceForm(form);
    expect(evidence.challenge).toEqual(challenge);
    expect(evidence.frames.map((f) => [f.time, f.jpeg[0]])).toEqual([
      [0, 1],
      [125, 2],
    ]);
    expect(evidence.photo?.[0]).toBe(3);
    form.delete("photo");
    expect((await readEvidenceForm(form)).photo).toBeUndefined();
  });

  it("refuses missing, malformed or mismatched fields", async () => {
    const form = new FormData();
    await expect(readEvidenceForm(form)).rejects.toThrow(TypeError);
    form.set("challenge", "{");
    form.set("times", "[]");
    await expect(readEvidenceForm(form)).rejects.toThrow("must be JSON");
    form.set("challenge", "{}");
    form.set("times", "[0]");
    await expect(readEvidenceForm(form)).rejects.toThrow("Every frame");
  });
});

describe("jpegSize", () => {
  it("reads the size from the frame header", () => {
    const [frame] = clip("head-turn");
    expect(jpegSize(frame.jpeg)).toEqual({ width: 320, height: 214 });
  });

  it("gives null for a file without a frame header or with broken markers", () => {
    expect(jpegSize(new Uint8Array([1, 2, 3]))).toBeNull();
    expect(jpegSize(new Uint8Array([0xff, 0xd8, 0x00, 0x00, 0, 0, 0, 0, 0, 0, 0]))).toBeNull();
    // A JPEG with only an application segment, and no frame.
    expect(
      jpegSize(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xd9, 0])),
    ).toBeNull();
  });
});

describe("haarPoseSource", () => {
  it("reports none and no face on an empty frame", () => {
    const blank = { width: 64, height: 48, data: new Uint8ClampedArray(64 * 48 * 4).fill(128) };
    expect(haarPoseSource(blank)).toEqual({ pose: "none" });
  });
});

describe("verifyEvidence with odd frames", () => {
  it("calls a frame with a valid header but broken data bad", async () => {
    const challenge = await issue("head-turn");
    const frames = clip("head-turn");
    frames[3] = { time: frames[3].time, jpeg: frames[3].jpeg.subarray(0, 400) };
    expect((await verifyEvidence({ challenge, frames }, options())).reasons).toEqual(["bad-frame"]);
  });

  it("decodes a frame of the same length that differs, rather than counting it as a repeat", async () => {
    const challenge = await issue("motion");
    const frames = clip("motion").slice(0, 12);
    // Same length as the frame before, one byte different near the end of the image data.
    const changed = Uint8Array.from(frames[0].jpeg);
    changed[changed.length - 10] ^= 1;
    frames[1] = { time: frames[1].time, jpeg: changed };
    // It was decoded, not taken as a repeat: and the changed byte breaks the file.
    expect(await verifyEvidence({ challenge, frames }, options())).toMatchObject({
      reasons: ["bad-frame"],
      framesChecked: 2,
    });
  });

  it("checks frames where no face is found", async () => {
    const challenge = await issue("head-turn");
    const result = await verifyEvidence(
      { challenge, frames: clip("head-turn") },
      options({ poseSource: () => ({ pose: "none" }) }),
    );
    expect(result.reasons).toEqual(["steps-not-done"]);
  });
});

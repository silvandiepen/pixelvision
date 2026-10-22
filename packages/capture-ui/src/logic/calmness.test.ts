import { describe, expect, it } from "vitest";
import type { HeadPose } from "pixelvision";
import { createBoxSmoother } from "./boxSmoother";
import { createFaceFlow } from "./faceFlow";
import { assessFace, guideFor } from "./geometry";
import type { Box, FaceGuidance } from "./geometry.model";

/** A small seeded random generator, so the noisy sequence is the same every run. */
const random = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const guide = guideFor(400, 800);
const steady: Box = {
  x: guide.cx - guide.rx * 0.7,
  y: guide.cy - guide.rx * 0.7,
  width: guide.rx * 1.4,
  height: guide.rx * 1.4,
};
const GUIDANCE_TEXT: Record<FaceGuidance, string> = {
  "no-face": "noFace",
  "too-far": "tooFar",
  "too-close": "tooClose",
  "off-centre": "offCentre",
  aligned: "holdStill",
};

interface Frame {
  pose: HeadPose;
  box?: Box;
}

const POSE_FOR: Record<string, HeadPose> = {
  frontal: "frontal",
  side: "profile",
  "other-side": "mirrored-profile",
};

/**
 * A person who holds still in the oval and follows each instruction after
 * a one-second reaction time, seen by a detector at 5 Hz that gets `rate`
 * of the detections wrong (a missed face, a box somewhere else, or the
 * wrong pose).
 */
function detect(rate: number, rnd: () => number, intended: HeadPose): Frame {
  const jitter = (n: number) => n + (rnd() - 0.5) * 8;
  const box = { ...steady, x: jitter(steady.x), y: jitter(steady.y) };
  if (rnd() >= rate) return { pose: intended, box };
  const kind = rnd();
  if (kind < 0.5) return { pose: "none" };
  if (kind < 0.75)
    return { pose: intended, box: { ...box, x: box.x + 160, width: box.width * 0.5 } };
  return { pose: intended === "frontal" ? "profile" : "frontal", box };
}

/** Text changes when the text follows every detection (the earlier behaviour). */
function rawChanges(frames: Frame[]): number {
  let last = "";
  let changes = 0;
  for (const f of frames) {
    const text = GUIDANCE_TEXT[assessFace(f.box, guide)];
    if (text !== last) changes++;
    last = text;
  }
  return changes;
}

/**
 * Runs a noisy minute through the smoother and the flow.
 *
 * @returns The frames seen, and the changes of the main instruction and the hint line.
 */
function calmMinute(rate: number, seed = 7) {
  const rnd = random(seed);
  let t = 0;
  const flow = createFaceFlow({ now: () => t });
  const smoother = createBoxSmoother();
  const frames: Frame[] = [];
  let message = "";
  let hint: string | undefined;
  let messages = 0;
  let hints = 0;
  let doneAt: number | undefined;
  let step = "";
  let reactAt = 0;
  let intended: HeadPose = "frontal";
  for (let i = 0; i < 300; i++) {
    t += 200;
    const asked = flow.state.accepted ? step : (flow.state.step ?? "frontal");
    if (asked !== step) {
      step = asked;
      reactAt = t + 1000;
    }
    if (t >= reactAt) intended = POSE_FOR[step];
    const f = detect(rate, rnd, intended);
    frames.push(f);
    const smoothed = smoother.update(f.box);
    const state = flow.update({
      pose: smoothed.outlier ? "none" : f.pose,
      guidance: assessFace(smoothed.box, guide),
    });
    if (state.message !== message) messages++;
    if (state.hint !== hint) hints++;
    message = state.message;
    hint = state.hint;
    if (state.phase === "done") doneAt ??= t;
  }
  return { frames, messages, hints, doneAt };
}

describe("calmness on a noisy sequence", () => {
  it("changes the text far less than following every detection, and still finishes", () => {
    for (const rate of [0.1, 0.2, 0.3]) {
      const { frames, ...after } = calmMinute(rate);
      const before = rawChanges(frames);
      if (process.env.CALM_REPORT) console.log(JSON.stringify({ rate, before, ...after }));
      // The first instruction, one per step and the final one: 6 in all, and no hint flapping.
      expect(after.doneAt).toBeLessThan(20_000);
      expect(after.messages).toBeLessThanOrEqual(6);
      expect(after.hints).toBeLessThanOrEqual(2);
      expect(before).toBeGreaterThan(20);
    }
  });
});

import { frontalFace } from "pixelvision/cascades/frontal-face";
import { profileFace } from "pixelvision/cascades/profile-face";
import { describe, expect, it } from "vitest";
import { detectWithHaar } from "../sources/haar";
import type { FaceObservation } from "../sources/source.model";
import { createFaceFlow } from "./faceFlow";
import type { FaceFlowOptions, FaceFlowState } from "./faceFlow.model";
import { followFace } from "./faces";
import { assessFace, guideFor } from "./geometry";
import { guidanceScenes, toFrame } from "./testScenes";
import type { GuidanceCase } from "./testScenes";

// The guidance states on drawn faces, found by pixelvision's HAAR cascades and followed as
// <pv-face-capture> does: every face, the main one picked, its guidance, then the flow.
const guide = guideFor(480, 360);
const scenes = guidanceScenes();
const cascades = { frontal: frontalFace, profile: profileFace };
const observations = new Map<GuidanceCase, FaceObservation>();

/**
 * Detects the faces in a fixture, once: the same pixels always give the same result.
 *
 * @param name - The fixture.
 * @returns What the HAAR source finds.
 */
const observe = (name: GuidanceCase): FaceObservation => {
  let observation = observations.get(name);
  if (!observation) {
    observation = detectWithHaar(toFrame(scenes[name]), { cascades, minFaceSize: 0.1 });
    observations.set(name, observation);
  }
  return observation;
};

/**
 * Runs the flow on fixtures, one detection every 200 ms, with the default hint timing.
 *
 * @param frames - The fixture of each detection.
 * @param options - Flow options.
 * @returns Every state, in order.
 */
const run = (frames: GuidanceCase[], options: FaceFlowOptions = {}): FaceFlowState[] => {
  let t = 0;
  const flow = createFaceFlow({ acceptPauseMs: 0, now: () => t, ...options });
  return frames.map((name) => {
    t += 200;
    const observation = observe(name);
    const followed = followFace(observation, { guide, toView: (box) => box });
    return flow.update({
      pose: followed.own ? observation.pose : "none",
      guidance: assessFace(followed.viewBox, guide),
      faceCount: followed.count,
    });
  });
};

/**
 * The last state after one fixture repeated.
 *
 * @param name - The fixture.
 * @param times - Detections.
 * @param options - Flow options.
 * @returns The state.
 */
const settle = (name: GuidanceCase, times = 12, options: FaceFlowOptions = {}) =>
  run(Array<GuidanceCase>(times).fill(name), options).at(-1)!;

describe("face guidance on drawn faces", () => {
  it("finds what each fixture shows", () => {
    expect(observe("none")).toEqual({ pose: "none" });
    expect(observe("frontal").faces).toHaveLength(1);
    // The tiny face is found; only its size keeps it from counting as a second person.
    expect(observe("tiny").faces).toHaveLength(2);
    expect(observe("two").faces).toHaveLength(2);
  });

  it("frontal and centred: no hint, and the steps progress", () => {
    const states = run(Array<GuidanceCase>(12).fill("frontal"));
    expect(states.every((s) => s.hint === undefined || s.hint === "holdStill")).toBe(true);
    expect(states.at(-1)).toMatchObject({
      phase: "challenge",
      step: "turn-one-side",
      stepsDone: 1,
    });
  });

  it("offset: asks to centre the face", () => {
    expect(settle("offset")).toMatchObject({ phase: "aligning", hint: "offCentre", hold: 0 });
  });

  it("small: asks to come closer", () => {
    expect(settle("small")).toMatchObject({ phase: "aligning", hint: "tooFar", hold: 0 });
  });

  it("too large: asks to move back", () => {
    expect(settle("large")).toMatchObject({ phase: "aligning", hint: "tooClose", hold: 0 });
  });

  it("two people: asks for one, doesn't progress and doesn't finish", () => {
    const state = settle("two", 30, { steps: false });
    expect(state).toMatchObject({
      phase: "aligning",
      hint: "severalFaces",
      hold: 0,
      frontal: false,
    });
  });

  it("a tiny face far behind: finishes as with one face", () => {
    expect(settle("tiny", 3, { steps: false }).phase).toBe("done");
    expect(settle("tiny")).toMatchObject({ phase: "challenge", stepsDone: 1 });
  });

  it("none: says where to put the face, with no secondary hint", () => {
    expect(settle("none")).toMatchObject({ phase: "searching", message: "noFace" });
    expect(settle("none").hint).toBeUndefined();
  });

  it("a second person seen briefly neither shows the hint nor stops the flow", () => {
    const frames: GuidanceCase[] = ["frontal", "two", "two", "frontal", "frontal", "frontal"];
    const states = run(frames, { steps: false, holdFrames: 3, windowFrames: 6 });
    expect(states.map((s) => s.hint)).not.toContain("severalFaces");
    expect(states.at(-1)!.phase).toBe("done");
  });
});

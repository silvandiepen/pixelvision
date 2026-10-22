import { describe, expect, it } from "vitest";
import type { FaceObservation } from "./faceChallenge.model";
import type { HeadPose } from "./headPose.model";
import {
  CHALLENGE_PRESETS,
  challengeSteps,
  createFaceChallenge,
  needsDirection,
} from "./faceChallenge";

type Challenge = ReturnType<typeof createFaceChallenge>;
const feed = (challenge: Challenge, frames: (HeadPose | FaceObservation)[]) =>
  frames.map((frame) => challenge.update(frame)).at(-1)!;
const times = <T>(frame: T, n: number): T[] => new Array(n).fill(frame);

describe("createFaceChallenge", () => {
  it("runs the head-turn preset by default, with HAAR's undirected profiles", () => {
    const challenge = createFaceChallenge({ holdFrames: 2 });
    expect(challenge.steps).toEqual(["frontal", "side", "other-side", "frontal"]);
    feed(challenge, times("frontal", 2));
    expect(feed(challenge, times("mirrored-profile", 2))).toMatchObject({
      step: "other-side",
      side: "mirrored-profile",
    });
    // The same side again doesn't count.
    expect(feed(challenge, times("mirrored-profile", 4)).step).toBe("other-side");
    feed(challenge, times("profile", 2));
    expect(feed(challenge, times("frontal", 2))).toMatchObject({
      step: "done",
      progress: 4,
      total: 4,
      holdProgress: 1,
    });
  });

  it("runs a head circle with directional poses", () => {
    const challenge = createFaceChallenge({ steps: "head-circle", holdFrames: 1 });
    const poses: HeadPose[] = [
      "frontal",
      "turned-left",
      "looking-up",
      "turned-right",
      "looking-down",
      "frontal",
    ];
    expect(feed(challenge, poses).step).toBe("done");
  });

  it("needs each direction as asked, in order", () => {
    const challenge = createFaceChallenge({ steps: ["left", "up"], holdFrames: 1 });
    expect(feed(challenge, ["turned-right", "looking-up", "looking-down"]).step).toBe("left");
    expect(feed(challenge, ["turned-left", "looking-up"]).step).toBe("done");
  });

  it("mirrors a directional side for other-side", () => {
    const challenge = createFaceChallenge({ steps: ["side", "other-side"], holdFrames: 1 });
    feed(challenge, ["turned-right"]);
    expect(feed(challenge, ["turned-right", "profile"]).step).toBe("other-side");
    expect(challenge.update("turned-left").step).toBe("done");
  });

  it("remembers the side seen most during a mixed side step", () => {
    const challenge = createFaceChallenge({ steps: ["side", "other-side"], holdFrames: 3 });
    expect(feed(challenge, ["profile", "mirrored-profile", "mirrored-profile"])).toMatchObject({
      step: "other-side",
      side: "mirrored-profile",
    });
  });

  it("finishes the motion preset only on frames that change", () => {
    const challenge = createFaceChallenge({ steps: "motion", holdFrames: 2, moveFrames: 4 });
    feed(challenge, times("frontal", 2));
    // A frozen picture: a face, but nothing changes.
    expect(feed(challenge, times({ pose: "frontal", motion: 0 }, 20))).toMatchObject({
      step: "move",
      holdProgress: 0,
    });
    // Without a motion measure, the move step can't complete either.
    expect(feed(challenge, times("frontal", 5)).step).toBe("move");
    expect(feed(challenge, times({ pose: "frontal", motion: 0.01 }, 4)).step).toBe("done");
  });

  it("treats frames without a face as neutral", () => {
    const challenge = createFaceChallenge({ steps: ["frontal"], holdFrames: 3 });
    expect(feed(challenge, ["frontal", "none", "none", "frontal"])).toMatchObject({
      step: "frontal",
      holdProgress: 2 / 3,
    });
    expect(challenge.update("frontal").step).toBe("done");
  });

  it("is done at once without steps", () => {
    expect(createFaceChallenge({ steps: "none" }).state).toMatchObject({ step: "done", total: 0 });
  });

  it("fails after the timeout and starts over on reset", () => {
    let t = 0;
    const challenge = createFaceChallenge({ timeoutMs: 1000, now: () => t });
    t = 1001;
    expect(challenge.update("frontal").step).toBe("failed");
    // Once failed, frames change nothing.
    expect(challenge.update({ pose: "frontal", motion: 0.1 })).toMatchObject({
      step: "failed",
      holdProgress: 0,
    });
    challenge.reset();
    expect(challenge.state).toMatchObject({ step: "frontal", progress: 0 });
  });

  it("rejects unknown presets and steps", () => {
    expect(() => challengeSteps("spin" as never)).toThrow(RangeError);
    expect(() => createFaceChallenge({ steps: ["frontal", "spin" as never] })).toThrow(RangeError);
  });

  it("knows which challenges need direction", () => {
    expect(needsDirection("head-turn")).toBe(false);
    expect(needsDirection("motion")).toBe(false);
    expect(needsDirection("head-circle")).toBe(true);
    expect(needsDirection(["frontal", "down"])).toBe(true);
    expect(Object.keys(CHALLENGE_PRESETS)).toEqual(["none", "motion", "head-turn", "head-circle"]);
  });
});

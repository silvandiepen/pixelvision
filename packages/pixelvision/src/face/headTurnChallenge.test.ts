import { describe, expect, it } from "vitest";
import type { HeadPose } from "./headPose.model";
import { createHeadTurnChallenge } from "./headTurnChallenge";

const feed = (challenge: ReturnType<typeof createHeadTurnChallenge>, poses: HeadPose[]) =>
  poses.map((pose) => challenge.update(pose)).at(-1)!;
const times = (pose: HeadPose, n: number): HeadPose[] => new Array(n).fill(pose);

describe("createHeadTurnChallenge", () => {
  it("passes when the person faces the camera, turns both ways and looks back", () => {
    const challenge = createHeadTurnChallenge({ holdFrames: 2 });

    expect(challenge.state).toMatchObject({ step: "face-camera", progress: 0 });
    expect(feed(challenge, times("frontal", 2))).toMatchObject({
      step: "turn-one-side",
      progress: 1,
    });
    expect(feed(challenge, times("mirrored-profile", 2))).toMatchObject({
      step: "turn-other-side",
      firstSide: "mirrored-profile",
    });
    expect(feed(challenge, times("profile", 2)).step).toBe("face-camera-again");
    const done = feed(challenge, times("frontal", 2));
    expect(done).toMatchObject({ step: "done", progress: 4, instruction: "Done" });
    expect(challenge.update("none").step).toBe("done");
  });

  it("accepts landmark-based left and right turns", () => {
    const challenge = createHeadTurnChallenge({ holdFrames: 1 });

    expect(feed(challenge, ["frontal", "turned-right", "turned-left", "frontal"]).step).toBe(
      "done",
    );
  });

  it("needs the other side, not the same one twice", () => {
    const challenge = createHeadTurnChallenge({ holdFrames: 1 });
    feed(challenge, ["frontal", "profile"]);

    expect(feed(challenge, times("profile", 5)).step).toBe("turn-other-side");
  });

  it("ignores frames without a face and tolerates a stray pose", () => {
    const challenge = createHeadTurnChallenge({ holdFrames: 3 });

    // "none" is neutral; one stray profile doesn't reset progress.
    expect(feed(challenge, ["frontal", "none", "none", "profile", "frontal"])).toMatchObject({
      step: "face-camera",
      holdProgress: 2 / 3,
    });
    expect(challenge.update("frontal")).toMatchObject({ step: "turn-one-side", holdProgress: 0 });
  });

  it("only counts matches within the recent window", () => {
    const challenge = createHeadTurnChallenge({ holdFrames: 2, windowFrames: 3 });

    // The first frontal leaves the 3-frame window before the second arrives.
    expect(feed(challenge, ["frontal", "profile", "profile", "profile", "frontal"]).step).toBe(
      "face-camera",
    );
    expect(challenge.update("frontal").step).toBe("turn-one-side");
  });

  it("picks the side seen most often as the first side", () => {
    const challenge = createHeadTurnChallenge({ holdFrames: 2, windowFrames: 4 });
    feed(challenge, ["frontal", "frontal"]);

    expect(feed(challenge, ["turned-left", "turned-right", "turned-left"]).firstSide).toBe(
      "turned-left",
    );
  });

  it("fails after the timeout and can be reset", () => {
    let clock = 0;
    const challenge = createHeadTurnChallenge({ timeoutMs: 1000, now: () => clock });
    clock = 1500;

    expect(challenge.update("frontal")).toMatchObject({ step: "failed" });
    expect(challenge.update("frontal").step).toBe("failed");
    challenge.reset();
    expect(challenge.state.step).toBe("face-camera");
  });
});

import { describe, expect, it } from "vitest";
import type { HeadPose } from "pixelvision";
import { createFaceFlow, turnProgress } from "./faceFlow";
import type { FaceFlow, FaceFlowInput, FaceFlowOptions, FaceFlowState } from "./faceFlow.model";
import type { FaceGuidance } from "./geometry.model";

/** A flow on a fake clock that advances 200 ms per detection (5 Hz, like HAAR). */
const make = (options: FaceFlowOptions = {}) => {
  let t = 0;
  const flow = createFaceFlow({
    holdFrames: 2,
    acceptPauseMs: 0,
    hintDelayMs: 800,
    hintHoldMs: 1200,
    now: () => t,
    ...options,
  });
  const feed = (
    pose: HeadPose,
    times = 1,
    guidance: FaceGuidance = pose === "none" ? "no-face" : "aligned",
    dt = 200,
  ): FaceFlowState => {
    let state = flow.state;
    for (let i = 0; i < times; i++) {
      t += dt;
      state = flow.update({ pose, guidance });
    }
    return state;
  };
  return { flow, feed, advance: (ms: number) => (t += ms) };
};

/** Runs alignment and the first look-at-camera step. */
const toFirstTurn = (feed: ReturnType<typeof make>["feed"]) => feed("frontal", 3);

describe("turnProgress", () => {
  it("measures towards the asked side", () => {
    expect(turnProgress(9, "left")).toBe(0.5);
    expect(turnProgress(-9, "left")).toBe(0);
    expect(turnProgress(-36, "right")).toBe(1);
    expect(turnProgress(-9, "either", 9)).toBe(1);
  });

  it("is undefined without yaw, a turn or a threshold", () => {
    expect(turnProgress(undefined, "left")).toBeUndefined();
    expect(turnProgress(10, undefined)).toBeUndefined();
    expect(turnProgress(10, "left", 0)).toBeUndefined();
  });
});

describe("createFaceFlow", () => {
  it("starts searching with the main instruction", () => {
    expect(make().flow.state).toEqual({
      phase: "searching",
      stepsDone: 0,
      totalSteps: 4,
      progress: 0,
      hold: 0,
      message: "noFace",
      accepted: false,
      stalled: false,
      tone: "idle",
      frontal: false,
    });
  });

  it("shows positional hints only once they persist, as a secondary line", () => {
    const { feed } = make();
    let s = feed("frontal", 3, "too-far");
    expect(s).toMatchObject({ phase: "aligning", message: "noFace", tone: "idle" });
    expect(s.hint).toBeUndefined();
    s = feed("frontal", 1, "too-far");
    expect(s.tone).toBe("found");
    expect(s.hint).toBeUndefined();
    s = feed("frontal", 1, "too-far");
    expect(s.hint).toBe("tooFar");
    expect(s.message).toBe("noFace");
    // A brief change doesn't replace it, and it stays for at least the hold time.
    s = feed("frontal", 1, "too-close");
    expect(s.hint).toBe("tooFar");
    s = feed("frontal", 4, "too-close");
    expect(s.hint).toBe("tooFar");
    s = feed("frontal", 1, "too-close");
    expect(s.hint).toBe("tooClose");
    s = feed("frontal", 8, "off-centre");
    expect(s.hint).toBe("offCentre");
  });

  it("says hold still while aligned but not yet held", () => {
    const { feed } = make({ holdFrames: 10 });
    expect(feed("frontal", 4).hint).toBeUndefined();
    const s = feed("frontal", 1);
    expect(s).toMatchObject({ hint: "holdStill", tone: "hold", frontal: true, hold: 0.5 });
  });

  it("treats frames without a face as neutral during alignment", () => {
    const { feed } = make();
    feed("frontal");
    feed("none");
    const s = feed("frontal");
    expect(s).toMatchObject({ phase: "challenge", step: "frontal" });
  });

  it("completes the steps despite flickering detections", () => {
    const { feed } = make();
    let s = toFirstTurn(feed);
    expect(s).toMatchObject({
      step: "side",
      stepsDone: 1,
      message: "turnOneSide",
      turn: "either",
    });
    // A profile, a stray frontal and a lost face: still counts.
    s = feed("profile");
    expect(s.hold).toBe(0.5);
    expect(s.progress).toBeCloseTo(1.5 / 4);
    feed("frontal");
    feed("none");
    s = feed("profile");
    expect(s).toMatchObject({
      step: "other-side",
      message: "turnOtherSide",
      turn: "either",
      stepsDone: 2,
    });
    s = feed("profile", 3);
    expect(s.stepsDone).toBe(2);
    s = feed("mirrored-profile", 2);
    expect(s).toMatchObject({
      step: "frontal",
      message: "faceCameraAgain",
      turn: undefined,
    });
    s = feed("frontal", 2);
    expect(s).toMatchObject({
      phase: "done",
      message: "faceDone",
      tone: "success",
      progress: 1,
      stepsDone: 4,
    });
    expect(s.hint).toBeUndefined();
    expect(feed("none").phase).toBe("done");
  });

  it("pauses on each accepted step, keeping its instruction, then moves on", () => {
    const { feed } = make({ acceptPauseMs: 900 });
    let s = toFirstTurn(feed);
    expect(s).toMatchObject({
      accepted: true,
      message: "faceCamera",
      step: "side",
      stepsDone: 1,
      hold: 1,
      progress: 0.25,
      tone: "hold",
      turn: undefined,
    });
    expect(s.hint).toBeUndefined();
    // Detections during the pause are ignored.
    s = feed("profile", 4);
    expect(s).toMatchObject({ accepted: true, stepsDone: 1 });
    s = feed("profile");
    expect(s).toMatchObject({ accepted: false, message: "turnOneSide", hold: 0.5 });
    s = feed("profile");
    expect(s).toMatchObject({ accepted: true, message: "turnOneSide", stepsDone: 2 });
    s = feed("mirrored-profile", 6);
    expect(s).toMatchObject({ accepted: true, stepsDone: 3, message: "turnOtherSide" });
    s = feed("frontal", 7);
    expect(s).toMatchObject({ phase: "done", accepted: true });
  });

  it("uses its default timings", () => {
    const { feed } = make({
      acceptPauseMs: undefined,
      hintDelayMs: undefined,
      hintHoldMs: undefined,
    });
    toFirstTurn(feed);
    expect(feed("profile", 2).accepted).toBe(true);
    expect(feed("frontal", 3, "too-close").hint).toBeUndefined();
    expect(feed("frontal", 4, "too-close").hint).toBe("tooClose");
  });

  it("keeps the main instruction while the face flickers in and out", () => {
    const { feed } = make();
    toFirstTurn(feed);
    const messages = new Set<string>();
    for (let i = 0; i < 3; i++) {
      messages.add(feed("none").message);
      messages.add(feed("frontal").message);
    }
    expect([...messages]).toEqual(["turnOneSide"]);
  });

  it("never shows a lost face for brief gaps, but does for longer ones", () => {
    const { feed } = make();
    toFirstTurn(feed);
    expect(feed("none", 5).hint).toBeUndefined();
    feed("frontal");
    expect(feed("none", 6).hint).toBeUndefined();
    const s = feed("none");
    expect(s).toMatchObject({ hint: "faceLost", tone: "found" });
  });

  it("doesn't nag about centring during turns, but does about distance", () => {
    const { feed } = make();
    toFirstTurn(feed);
    expect(feed("frontal", 10, "off-centre").hint).toBeUndefined();
    expect(feed("frontal", 5, "too-close").hint).toBe("tooClose");
    // Once the face is back in place, the hint clears (after its hold time).
    expect(feed("frontal", 2).hint).toBe("tooClose");
    expect(feed("frontal", 5).hint).toBeUndefined();
  });

  it("shows one helper hint when a step stalls, until it progresses", () => {
    const { feed } = make();
    toFirstTurn(feed);
    let s = feed("frontal", 29);
    expect(s).toMatchObject({ stalled: false, hint: undefined });
    s = feed("frontal");
    expect(s).toMatchObject({ stalled: true, hint: "turnFurther" });
    s = feed("profile");
    expect(s).toMatchObject({ stalled: false, hint: undefined });
  });

  it("has helpers for the other steps and for alignment", () => {
    const align = make();
    expect(align.feed("none", 31)).toMatchObject({
      phase: "searching",
      stalled: true,
      hint: "alignHelp",
    });
    const facing = make();
    facing.feed("frontal");
    facing.feed("frontal");
    expect(facing.feed("profile", 30)).toMatchObject({
      step: "frontal",
      hint: "faceCameraHelp",
    });
  });

  it("has helpers for tilting and for the motion step", () => {
    const circle = make({ directional: true, steps: ["up"] });
    circle.feed("frontal", 2);
    expect(circle.feed("frontal", 31)).toMatchObject({ step: "up", hint: "tiltFurther" });
    const moving = make({ steps: ["move"] });
    moving.feed("frontal", 2);
    expect(moving.feed("frontal", 31)).toMatchObject({ step: "move", hint: "moveHelp" });
  });

  it("takes true as the head turn, and mirrors a named side without a directional source", () => {
    const { flow, feed } = make({ steps: true });
    expect(flow.steps).toEqual(["frontal", "side", "other-side", "frontal"]);
    toFirstTurn(feed);
    expect(feed("turned-left", 2)).toMatchObject({ step: "other-side", turn: "right" });
    const right = make({ steps: ["side", "other-side"] });
    right.feed("frontal", 2);
    expect(right.feed("turned-right", 2)).toMatchObject({ step: "other-side", turn: "left" });
  });

  it("names the side with a directional source and ignores the wrong first turn", () => {
    const { flow, feed } = make({ directional: true });
    expect(flow.steps).toEqual(["frontal", "left", "right", "frontal"]);
    let s = toFirstTurn(feed);
    expect(s).toMatchObject({ step: "left", message: "turnLeft", turn: "left" });
    s = feed("turned-right", 3);
    expect(s.step).toBe("left");
    s = feed("turned-left", 2);
    expect(s).toMatchObject({ step: "right", message: "turnRight", turn: "right" });
    s = feed("turned-right", 2);
    expect(s).toMatchObject({ step: "frontal", message: "faceCameraAgain" });
  });

  it("can ask for the right side first", () => {
    const { flow, feed } = make({ directional: true, firstTurn: "right" });
    toFirstTurn(feed);
    expect(flow.state).toMatchObject({ message: "turnRightFirst", turn: "right" });
    feed("turned-right", 2);
    expect(flow.state).toMatchObject({ message: "turnLeftNow", turn: "left" });
  });

  it("doesn't count an undirected profile when the source names sides", () => {
    const { feed } = make({ directional: true });
    toFirstTurn(feed);
    expect(feed("profile", 4)).toMatchObject({ step: "left", turn: "left" });
  });

  it("runs a head circle, asking to tilt up and down", () => {
    const { feed } = make({ directional: true, steps: "head-circle" });
    let s = toFirstTurn(feed);
    expect(s).toMatchObject({ step: "left", totalSteps: 6 });
    s = feed("turned-left", 2);
    expect(s).toMatchObject({ step: "up", message: "lookUp", turn: "up" });
    s = feed("looking-up", 2);
    expect(s).toMatchObject({ step: "right", message: "turnRight", turn: "right" });
    s = feed("turned-right", 2);
    expect(s).toMatchObject({ step: "down", message: "lookDown", turn: "down" });
    s = feed("looking-down", 2);
    expect(s).toMatchObject({ step: "frontal", message: "faceCameraAgain" });
  });

  it("finishes the motion challenge only while the face moves", () => {
    const { flow, feed } = make({ steps: "motion", moveFrames: 3 });
    toFirstTurn(feed);
    expect(flow.state).toMatchObject({ step: "move", message: "moveNaturally", frontal: true });
    const update = (motion: number) =>
      flow.update({ pose: "frontal", guidance: "aligned", motion });
    for (let i = 0; i < 10; i++) update(0);
    expect(flow.state.step).toBe("move");
    for (let i = 0; i < 3; i++) update(0.01);
    expect(flow.state.phase).toBe("done");
  });

  it("finishes once aligned when steps are off", () => {
    const { feed } = make({ steps: false });
    const s = feed("frontal");
    expect(s.progress).toBe(0.5);
    expect(s.totalSteps).toBe(0);
    expect(feed("frontal")).toMatchObject({ phase: "done", stepsDone: 0, totalSteps: 0 });
  });

  it("times out and resets", () => {
    const { flow, feed, advance } = make({ timeoutMs: 1000 });
    toFirstTurn(feed);
    advance(1000);
    const s = feed("frontal");
    expect(s).toMatchObject({
      phase: "failed",
      message: "timeoutTitle",
      tone: "error",
      hint: undefined,
    });
    expect(feed("frontal").phase).toBe("failed");
    flow.reset();
    expect(flow.state.phase).toBe("searching");
    expect(feed("frontal").phase).toBe("aligning");
  });

  it("never times out with a timeout of 0, and uses defaults", () => {
    const { feed, advance } = make({ timeoutMs: 0 });
    advance(1e9);
    expect(feed("frontal").phase).toBe("aligning");
    const flow: FaceFlow = createFaceFlow();
    expect(flow.state.phase).toBe("searching");
    expect(flow.update({ pose: "frontal", guidance: "aligned" }).phase).toBe("aligning");
  });
});

describe("createFaceFlow with quality", () => {
  /** A flow on a fake clock fed full inputs, 200 ms apart. */
  const makeGated = (options: FaceFlowOptions = {}) => {
    let t = 0;
    const flow = createFaceFlow({
      holdFrames: 2,
      acceptPauseMs: 0,
      hintDelayMs: 800,
      hintHoldMs: 1200,
      now: () => t,
      ...options,
    });
    const feed = (input: FaceFlowInput, times = 1): FaceFlowState => {
      let state = flow.state;
      for (let i = 0; i < times; i++) {
        t += 200;
        state = flow.update(input);
      }
      return state;
    };
    return { flow, feed, advance: (ms: number) => (t += ms) };
  };
  const good: FaceFlowInput = { pose: "frontal", guidance: "aligned", quality: null };

  it("never offers a frame with a quality issue to keep, and names the issue once it persists", () => {
    const { feed } = makeGated({ steps: false });
    let s = feed({ ...good, quality: "dark", kept: false });
    expect(s).toMatchObject({ phase: "aligning", frontal: false });
    expect(s.hint).toBeUndefined();
    s = feed({ ...good, quality: "dark", kept: false }, 4);
    expect(s).toMatchObject({ phase: "finishing", hint: "faceTooDark", frontal: false });
    expect(feed({ ...good, quality: "flat", kept: false }, 8).hint).toBe("faceLowContrast");
    expect(feed({ ...good, quality: "bright", kept: false }, 8).hint).toBe("faceTooBright");
    expect(feed({ ...good, quality: "blurry", kept: false }, 8).hint).toBe("faceBlurry");
  });

  it("puts positional hints before quality hints", () => {
    const { feed } = makeGated();
    expect(feed({ ...good, guidance: "too-far", quality: "dark" }, 6).hint).toBe("tooFar");
  });

  it("doesn't call a turning head blurry, but does ask for light during turns", () => {
    const { feed } = makeGated();
    let s = feed(good, 3);
    expect(s.step).toBe("side");
    feed({ pose: "profile", guidance: "aligned", quality: "blurry" }, 1);
    s = feed({ pose: "none", guidance: "aligned", quality: "blurry" }, 6);
    expect(s.hint).toBeUndefined();
    s = feed({ pose: "none", guidance: "aligned", quality: "dark" }, 6);
    expect(s.hint).toBe("faceTooDark");
  });

  it("waits after the steps for a good frame, then finishes once one is kept", () => {
    const { feed } = makeGated();
    feed(good, 3);
    feed({ ...good, pose: "profile" }, 2);
    let s = feed({ ...good, pose: "mirrored-profile" }, 2);
    expect(s.step).toBe("frontal");
    // Every frontal frame was too dark: nothing was kept.
    s = feed({ ...good, quality: "dark", kept: false }, 2);
    expect(s).toMatchObject({
      phase: "finishing",
      stepsDone: 4,
      progress: 1,
      message: "faceCamera",
      frontal: false,
    });
    s = feed({ pose: "none", guidance: "no-face", kept: false }, 1);
    expect(s).toMatchObject({ phase: "finishing", frontal: false });
    s = feed({ ...good, kept: false });
    expect(s).toMatchObject({ phase: "finishing", frontal: true });
    expect(feed({ ...good, kept: true }).phase).toBe("done");
  });

  it("still times out while waiting for a good frame", () => {
    const { feed, advance } = makeGated({ steps: false, timeoutMs: 2000 });
    expect(feed({ ...good, quality: "blurry", kept: false }, 2).phase).toBe("finishing");
    advance(2000);
    expect(feed({ ...good, quality: "blurry", kept: false }).phase).toBe("failed");
  });

  it("finishes straight away when a good frame was kept", () => {
    const { feed } = makeGated({ steps: false });
    expect(feed({ ...good, kept: true }, 2).phase).toBe("done");
  });
});

describe("createFaceFlow with several faces", () => {
  /** A flow on a fake clock fed full inputs, 200 ms apart, with the default hint timing. */
  const makeCrowded = (options: FaceFlowOptions = {}) => {
    let t = 0;
    const flow = createFaceFlow({ holdFrames: 2, acceptPauseMs: 0, now: () => t, ...options });
    const feed = (input: FaceFlowInput, times = 1): FaceFlowState => {
      let state = flow.state;
      for (let i = 0; i < times; i++) {
        t += 200;
        state = flow.update(input);
      }
      return state;
    };
    return { flow, feed };
  };
  const alone: FaceFlowInput = { pose: "frontal", guidance: "aligned", faceCount: 1 };
  const two: FaceFlowInput = { ...alone, faceCount: 2 };

  it("doesn't align with two people in view, and asks for one once it persists", () => {
    const { feed } = makeCrowded();
    let s = feed(two, 3);
    expect(s).toMatchObject({ phase: "aligning", hold: 0, frontal: false });
    expect(s.hint).toBeUndefined();
    s = feed(two, 20);
    expect(s).toMatchObject({
      phase: "aligning",
      hold: 0,
      hint: "severalFaces",
      tone: "found",
      frontal: false,
    });
    // Once alone, the flow goes on.
    expect(feed(alone, 2)).toMatchObject({ phase: "challenge", step: "frontal" });
  });

  it("puts the several-faces hint before positional and quality hints", () => {
    const { feed } = makeCrowded();
    expect(feed({ ...two, guidance: "too-far", quality: "dark" }, 6).hint).toBe("severalFaces");
  });

  it("neither flashes the hint nor stops for a second face seen briefly", () => {
    const { feed } = makeCrowded({ holdFrames: 3, windowFrames: 6 });
    feed(alone);
    let s = feed(two, 2);
    expect(s.hint).toBeUndefined();
    s = feed(alone, 2);
    expect(s.hint).toBeUndefined();
    expect(s).toMatchObject({ phase: "challenge", step: "frontal" });
  });

  it("holds the head turns while two people are in view", () => {
    const { feed } = makeCrowded();
    let s = feed(alone, 3);
    expect(s.step).toBe("side");
    s = feed({ ...two, pose: "profile" }, 20);
    expect(s).toMatchObject({ step: "side", stepsDone: 1, hold: 0, hint: "severalFaces" });
    expect(s.tone).toBe("found");
    s = feed({ ...alone, pose: "profile" }, 2);
    expect(s).toMatchObject({ step: "other-side", stepsDone: 2 });
  });

  it("never finishes, even with a frame kept, until the other person has gone", () => {
    const { feed } = makeCrowded({ steps: false });
    // Aligned alone, but nothing good enough kept yet: the flow waits for a frame.
    expect(feed({ ...alone, kept: false }, 2).phase).toBe("finishing");
    let s = feed({ ...two, kept: true }, 10);
    expect(s).toMatchObject({ phase: "finishing", frontal: false, hint: "severalFaces" });
    expect(s.tone).toBe("found");
    s = feed({ ...alone, kept: true });
    expect(s.phase).toBe("done");
  });

  it("treats a missing count as one face", () => {
    const { feed } = makeCrowded({ steps: false });
    expect(feed({ pose: "frontal", guidance: "aligned" }, 2).phase).toBe("done");
  });
});

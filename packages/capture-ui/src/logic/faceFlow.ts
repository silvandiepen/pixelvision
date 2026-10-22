import { challengeSteps, createFaceChallenge } from "pixelvision";
import type { ChallengeStep, FaceChallengeState, HeadPose } from "pixelvision";
import type {
  FaceFlow,
  FaceFlowInput,
  FaceFlowOptions,
  FaceFlowState,
  GuideTone,
  TurnHint,
} from "./faceFlow.model";
import type { LabelKey } from "./labels.model";
import { qualityHint } from "./quality";
import { createSettledValue } from "./settle";

/** The opposite of a person's-point-of-view side. */
const opposite = (side: "left" | "right"): "left" | "right" => (side === "left" ? "right" : "left");

/** Person's-point-of-view side of a directional pose. */
const sideOf = (pose: HeadPose | undefined): "left" | "right" | undefined =>
  pose === "turned-left" ? "left" : pose === "turned-right" ? "right" : undefined;

/** Steps that ask the head to turn or tilt. */
const TURN_STEPS: ReadonlySet<ChallengeStep | undefined> = new Set([
  "left",
  "right",
  "up",
  "down",
  "side",
  "other-side",
]);

/** Whether a step asks the head to turn or tilt. */
const isTurnStep = (step: ChallengeStep | undefined): boolean => TURN_STEPS.has(step);

/**
 * Resolves the flow's `steps` option to a list of steps. With a directional
 * source, undirected sides become the first turn and its opposite, so the
 * instructions can name them.
 *
 * @param steps - The option.
 * @param directional - Whether the source reports left and right.
 * @param firstTurn - The side to ask for first.
 * @returns The steps.
 */
function resolveSteps(
  steps: FaceFlowOptions["steps"],
  directional: boolean,
  firstTurn: "left" | "right",
): ChallengeStep[] {
  const list = challengeSteps(steps === true ? "head-turn" : steps === false ? "none" : steps!);
  if (!directional) return [...list];
  return list.map((step) =>
    step === "side" ? firstTurn : step === "other-side" ? opposite(firstTurn) : step,
  );
}

/**
 * How far a head is turned towards the asked side, for a live turn gauge.
 *
 * @param yaw - Degrees, positive towards the person's left (as
 *   `estimateHeadYaw` reports on an unmirrored frame).
 * @param turn - The asked side.
 * @param threshold - Degrees at which the turn counts (default 18).
 * @returns 0–1, or undefined without a yaw or a turn to make.
 *
 * @example
 * gauge.fill(turnProgress(observation.yaw, state.turn) ?? 0);
 */
export function turnProgress(
  yaw: number | undefined,
  turn: TurnHint | undefined,
  threshold = 18,
): number | undefined {
  if (yaw === undefined || turn === undefined || threshold <= 0) return undefined;
  const towards = turn === "left" ? yaw : turn === "right" ? -yaw : Math.abs(yaw);
  return Math.min(1, Math.max(0, towards / threshold));
}

/**
 * Creates the selfie flow: find a face, guide it into the oval, then run
 * pixelvision's head-turn challenge (look at the camera, turn to one side,
 * the other side, look back).
 *
 * It is built to stay calm with a detector that flickers a few times a
 * second: progress counts matching detections in a sliding window, so a
 * stray or missed detection slows a step instead of resetting it; the
 * main instruction changes only when the step does; positional hints and
 * the guide colour only change once a condition has persisted, and stay
 * for a while once shown. A step that stalls shows one helper hint.
 *
 * With a directional pose source (`@pixelvision/face-neural`), the first
 * turn must be `firstTurn` and the instructions name the side.
 *
 * A detection can carry a quality issue (`checkQuality` on the face
 * region): such a frame never counts as `frontal`, the frame to keep, and
 * the issue shows as a settled hint ("Find a bit more light"). When the
 * steps finish while no good frame has been kept (`kept: false`), the
 * flow waits in the `finishing` phase for one instead of finishing, and
 * the timeout still applies.
 *
 * A detection can also report several faces of a meaningful size
 * (`faceCount` above 1, from `selectMainFace`): such a frame counts
 * towards no step and is never `frontal`, the flow doesn't finish on it,
 * and "Make sure only you are in the frame" shows as a settled hint, so a
 * second face seen for a moment neither flashes the hint nor stops a
 * capture that is otherwise ready.
 *
 * @param options - Hold and window frames, timeout, steps, direction, hint timing, clock.
 * @returns The flow.
 *
 * @example
 * const flow = createFaceFlow({ directional: true });
 * const state = flow.update({ pose, guidance: assessFace(box, guide) });
 * show(labels[state.message], state.hint && labels[state.hint]);
 */
export function createFaceFlow(options: FaceFlowOptions = {}): FaceFlow {
  const {
    holdFrames = 3,
    timeoutMs = 45_000,
    steps: stepsOption = "head-turn",
    directional = false,
    firstTurn = "left",
    stallMs = 6000,
    acceptPauseMs = 900,
    hintDelayMs = 700,
    hintHoldMs = 1500,
    now = Date.now,
  } = options;
  const frames = Math.max(1, Math.round(holdFrames));
  const windowSize = Math.max(frames, Math.round(options.windowFrames ?? frames * 2));
  const steps = resolveSteps(stepsOption, directional, firstTurn);
  const challenge = createFaceChallenge({
    steps,
    holdFrames: frames,
    windowFrames: windowSize,
    moveFrames: options.moveFrames,
    timeoutMs: Infinity,
    now,
  });
  const hint = createSettledValue<LabelKey | undefined>(undefined, {
    delayMs: (value) =>
      value === undefined
        ? hintDelayMs / 2
        : value === "faceLost"
          ? Math.max(1200, hintDelayMs)
          : hintDelayMs,
    minHoldMs: hintHoldMs,
  });
  const tone = createSettledValue<GuideTone>("idle", {
    delayMs: hintDelayMs * 0.75,
    minHoldMs: hintHoldMs * 0.75,
  });

  let startedAt = now();
  // Alignment: whether each recent detection with a face was aligned (and alone).
  let recent: boolean[] = [];
  let seenFace = false;
  // Stall detection: when the current step last made progress.
  let stage = "";
  let bestHold = 0;
  let progressAt = startedAt;
  let pausedUntil = -Infinity;
  let current: FaceFlowState;

  const totalSteps = steps.length;

  const turnHint = (
    step: ChallengeStep,
    side: FaceChallengeState["side"],
  ): TurnHint | undefined => {
    switch (step) {
      case "left":
      case "right":
      case "up":
      case "down":
        return step;
      case "side":
        return "either";
      case "other-side": {
        const first = sideOf(side);
        return first ? opposite(first) : "either";
      }
      default:
        return undefined;
    }
  };

  /** Whether a step at this index comes after a turn, so its instruction says "now". */
  const afterTurn = (index: number): boolean => steps.slice(0, index).some(isTurnStep);

  const stepMessage = (step: ChallengeStep, index: number): LabelKey => {
    switch (step) {
      case "frontal":
        return index === 0 ? "faceCamera" : "faceCameraAgain";
      case "left":
        return afterTurn(index) ? "turnLeftNow" : "turnLeft";
      case "right":
        return afterTurn(index) ? "turnRight" : "turnRightFirst";
      case "up":
        return "lookUp";
      case "down":
        return "lookDown";
      case "side":
        return "turnOneSide";
      case "other-side":
        return "turnOtherSide";
      default:
        return "moveNaturally";
    }
  };

  /** Whether more than one face of a meaningful size is in view. */
  const several = (input: FaceFlowInput): boolean => (input.faceCount ?? 1) > 1;

  /** The several-faces, positional or quality hint this detection asks for, before settling. */
  const rawHint = (
    input: FaceFlowInput,
    step: ChallengeStep | undefined,
    holding: boolean,
  ): LabelKey | undefined => {
    const { guidance, quality } = input;
    if (several(input)) return "severalFaces";
    switch (guidance) {
      case "no-face":
        // Before the challenge the main instruction already says where to put the face.
        return step ? ("faceLost" as const) : undefined;
      case "too-far":
        return "tooFar" as const;
      case "too-close":
        return "tooClose" as const;
      case "off-centre":
        // A turning head's box shifts sideways; don't nag about it during turns.
        return isTurnStep(step) ? undefined : ("offCentre" as const);
      default:
        // A turning head blurs; only light is worth a word during turns.
        if (quality && !(quality === "blurry" && isTurnStep(step))) {
          return qualityHint(quality, "face");
        }
        return !step && holding ? ("holdStill" as const) : undefined;
    }
  };

  const helperFor = (step: ChallengeStep | undefined): LabelKey => {
    if (!step) return "alignHelp";
    if (step === "up" || step === "down") return "tiltFurther";
    if (step === "move") return "moveHelp";
    return isTurnStep(step) ? "turnFurther" : "faceCameraHelp";
  };

  /** Tracks progress within a stage, and whether it has stalled. */
  const trackStall = (key: string, hold: number, t: number): boolean => {
    if (key !== stage) {
      stage = key;
      bestHold = hold;
      progressAt = t;
    } else if (hold > bestHold) {
      bestHold = hold;
      progressAt = t;
    }
    return t - progressAt >= stallMs;
  };

  const initial = (): FaceFlowState => ({
    phase: "searching",
    stepsDone: 0,
    totalSteps,
    progress: 0,
    hold: 0,
    message: "noFace",
    accepted: false,
    stalled: false,
    tone: "idle",
    frontal: false,
  });

  const finish = (t: number): FaceFlowState => {
    hint.reset(undefined);
    return {
      phase: "done",
      stepsDone: totalSteps,
      totalSteps,
      progress: 1,
      hold: 1,
      message: "faceDone",
      accepted: true,
      stalled: false,
      tone: tone.force("success", t),
      frontal: false,
    };
  };

  /** Combines the settled positional or quality hint with a stall helper. */
  const secondary = (
    input: FaceFlowInput,
    step: ChallengeStep | undefined,
    holding: boolean,
    stalled: boolean,
    t: number,
  ): LabelKey | undefined =>
    hint.update(rawHint(input, step, holding), t) ?? (stalled ? helperFor(step) : undefined);

  /** A frame worth keeping as the capture: one face, facing the camera, aligned, and good enough. */
  const isGood = (input: FaceFlowInput): boolean =>
    input.pose === "frontal" && input.guidance === "aligned" && !input.quality && !several(input);

  /**
   * The steps are done: finish when a good frame was kept and only one
   * face is in view, otherwise wait with a calm hint, still bound by the
   * timeout.
   */
  const complete = (input: FaceFlowInput, t: number): FaceFlowState => {
    if (input.kept !== false && !several(input)) return finish(t);
    const good = isGood(input);
    return {
      phase: "finishing",
      stepsDone: totalSteps,
      totalSteps,
      progress: 1,
      hold: 1,
      message: "faceCamera",
      hint: secondary(input, undefined, good, false, t),
      accepted: false,
      stalled: false,
      tone: tone.update(input.guidance === "no-face" || several(input) ? "found" : "hold", t),
      frontal: good,
    };
  };

  const runChallenge = (input: FaceFlowInput, t: number): FaceFlowState => {
    const before = challenge.state.progress;
    // With several people in view, nobody's turn counts.
    const after = challenge.update(
      several(input) ? "none" : { pose: input.pose, motion: input.motion },
    );
    if (after.step === "done") return complete(input, t);
    const step = after.step as ChallengeStep;
    if (after.progress > before && acceptPauseMs > 0 && current.phase === "challenge") {
      // The acceptance moment: the finished step's instruction stays, the ring is full.
      pausedUntil = t + acceptPauseMs;
      hint.reset(undefined);
      return {
        ...current,
        step,
        stepsDone: after.progress,
        progress: after.progress / totalSteps,
        hold: 1,
        hint: undefined,
        accepted: true,
        stalled: false,
        tone: tone.force("hold", t),
        turn: undefined,
        frontal: false,
      };
    }
    const hold = after.holdProgress;
    const turn = turnHint(step, after.side);
    // Keyed by index: a challenge can ask for the same step twice.
    const stalled = trackStall(`step-${after.index}`, hold, t);
    const facing = step === "frontal" || step === "move";
    const raw: GuideTone =
      input.guidance === "no-face" || several(input) ? "found" : hold > 0 ? "hold" : "aligned";
    return {
      phase: "challenge",
      step,
      stepsDone: after.progress,
      totalSteps,
      progress: (after.progress + hold) / totalSteps,
      hold,
      message: stepMessage(step, after.index),
      hint: secondary(input, step, hold > 0, stalled, t),
      accepted: false,
      stalled,
      tone: tone.update(raw, t),
      turn,
      frontal: facing && isGood(input),
    };
  };

  const align = (input: FaceFlowInput, t: number): FaceFlowState => {
    const hasFace = input.guidance !== "no-face";
    const aligned = input.guidance === "aligned" && !several(input);
    if (hasFace) {
      seenFace = true;
      // Frames without a face are neutral: they neither count nor break the hold.
      recent = [...recent, aligned].slice(-windowSize);
    }
    const count = recent.filter(Boolean).length;
    if (count >= frames) {
      recent = [];
      if (totalSteps === 0) return complete(input, t);
      return runChallenge(input, t);
    }
    const hold = Math.min(1, count / frames);
    const stalled = trackStall("align", hold, t);
    const raw: GuideTone = !hasFace ? (seenFace ? "found" : "idle") : aligned ? "hold" : "found";
    return {
      ...initial(),
      phase: seenFace ? "aligning" : "searching",
      hold,
      progress: totalSteps ? 0 : hold,
      hint: secondary(input, undefined, aligned, stalled, t),
      stalled,
      tone: tone.update(raw, t),
      frontal: isGood(input),
    };
  };

  current = initial();

  return {
    steps,
    update(input) {
      if (current.phase === "done" || current.phase === "failed") return current;
      const t = now();
      if (timeoutMs > 0 && t - startedAt > timeoutMs) {
        hint.reset(undefined);
        current = {
          ...current,
          phase: "failed",
          message: "timeoutTitle",
          hint: undefined,
          tone: tone.force("error", t),
          turn: undefined,
          frontal: false,
        };
        return current;
      }
      if (t < pausedUntil) return current;
      current =
        current.phase === "challenge"
          ? runChallenge(input, t)
          : current.phase === "finishing"
            ? complete(input, t)
            : align(input, t);
      return current;
    },
    get state() {
      return current;
    },
    reset() {
      challenge.reset();
      startedAt = now();
      recent = [];
      seenFace = false;
      stage = "";
      bestHold = 0;
      progressAt = startedAt;
      pausedUntil = -Infinity;
      hint.reset(undefined);
      tone.reset("idle");
      current = initial();
    },
  };
}

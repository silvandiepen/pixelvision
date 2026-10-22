import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import {
  CHALLENGE_PRESETS,
  createFaceChallenge,
  detectHeadPose,
  grayscale,
  measureMotion,
  needsDirection,
  regionPatch,
} from "pixelvision";
import type {
  ChallengeStep,
  FaceChallenge,
  FaceChallengeState,
  HeadPose,
  Point,
  RegionPatch,
  RGBAImage,
} from "pixelvision";
import type { HeadPoseTracker } from "@pixelvision/face-neural";
import { useCamera } from "../useCamera";
import type { VideoSource } from "../useCamera/useCamera.model";
import type { HeadPoseResources } from "../../examples/detect-head-pose/demo.model";
import { loadNeuralBackend } from "../../examples/head-turn/neural";
import type { NeuralBackend } from "../../examples/head-turn/neural.model";
import type {
  CheckState,
  DemoChallenge,
  FaceBackend,
  FaceBox,
  FrontalPhoto,
  PoseSource,
  UseHeadTurn,
  UseHeadTurnOptions,
} from "./useHeadTurn.model";

const FRAME_INTERVAL = 125; // about 8 detections a second
/**
 * The sample video moves on this far per detection: each pose in the clip lasts 1.5–2 s, so
 * every step still gets 6 or more frames, on a slow device too.
 */
const SAMPLE_STEP = 0.25;
const FRAME_BOX = { width: 640, height: 480 };
/** How long a positional hint must persist before it's shown (or cleared). */
const HINT_DELAY = 800;
/** A face narrower than this share of the frame is too far away. */
const MIN_FACE_SHARE = 0.18;

/**
 * The sample video of each challenge: one AI-generated person (see
 * `public/media/README.md`), as VP9 and H.264, so every browser can play one.
 *
 * @param challenge - The challenge.
 * @returns The clip's sources.
 */
const sampleSources = (challenge: DemoChallenge): VideoSource[] => [
  { src: `/media/${challenge}.webm`, type: 'video/webm; codecs="vp9"' },
  { src: `/media/${challenge}.mp4`, type: 'video/mp4; codecs="avc1.640028"' },
];

/**
 * What to ask for a step.
 *
 * @param step - The step.
 * @param index - Its place in the challenge.
 * @param side - The side the last `side` step was done to.
 * @returns The instruction.
 */
function instructionFor(
  step: FaceChallengeState["step"],
  index: number,
  side: FaceChallengeState["side"],
): string {
  switch (step) {
    case "frontal":
      return index === 0 ? "Look straight at the camera" : "Look straight at the camera again";
    case "left":
      return "Turn your head to your left";
    case "right":
      return "Turn your head to your right";
    case "up":
      return "Tilt your head up";
    case "down":
      return "Tilt your head down";
    case "side":
      return "Slowly turn your head to one side";
    case "other-side":
      return side === "turned-left"
        ? "Now turn your head to your right"
        : side === "turned-right"
          ? "Now turn your head to your left"
          : "Now turn your head to the other side";
    case "move":
      return "Keep looking at the camera, and move your head a little";
    case "done":
      return "Done";
    default:
      return "Time's up. Let's try again";
  }
}

/**
 * Runs a face challenge (a head turn, a head circle or natural motion) on
 * the selfie camera or a sample video: a face detector (the built-in
 * cascades, or the optional neural one) about 8 times a second, and
 * `createFaceChallenge` on the poses. Keeps the last frontal frame as the
 * photo. Bind `camera.video` to a `<video>` element.
 *
 * @param options - Frames to hold, the cascades, and a callback per frame.
 * @returns The check's state and controls.
 */
export function useHeadTurn({
  holdFrames,
  loadCascades,
  onUpdate,
}: UseHeadTurnOptions): UseHeadTurn {
  const camera = useCamera();
  const source = ref<PoseSource>("idle");
  const challengeName = ref<DemoChallenge>("head-turn");
  const cascades = shallowRef<HeadPoseResources | null>(null);
  const cascadesState = ref<"loading" | "ready" | "error">("loading");
  const backend = ref<FaceBackend>("haar");
  const neural = shallowRef<NeuralBackend | null>(null);
  const neuralState = ref<"idle" | "loading" | "ready" | "error">("idle");
  const pose = ref<HeadPose | "—">("—");
  const face = shallowRef<FaceBox | null>(null);
  const landmarks = shallowRef<Point[]>([]);
  const yaw = ref<number | null>(null);
  const frameSize = ref<{ width: number; height: number } | null>(null);
  const detectionTime = ref<number | null>(null);
  const photo = shallowRef<FrontalPhoto | null>(null);
  const message = ref<string | null>(null);
  const hint = ref<string | null>(null);
  let hintCandidate: string | null = null;
  let hintSince = 0;
  let challenge: FaceChallenge = createChallenge();
  let tracker: HeadPoseTracker | null = null;
  let lastPatch: RegionPatch | undefined;
  const state = shallowRef<CheckState>(withInstruction(challenge.state));
  let timer = 0;

  const ready = computed(() =>
    backend.value === "haar" ? cascadesState.value === "ready" : neuralState.value === "ready",
  );
  const finished = computed(() => ["done", "failed"].includes(state.value.step));

  /**
   * A new challenge of the chosen kind.
   *
   * @returns The challenge.
   */
  function createChallenge(): FaceChallenge {
    // The sample plays at the detector's pace, so only the camera is timed.
    return createFaceChallenge({
      steps: challengeName.value,
      holdFrames,
      timeoutMs: source.value === "sample" ? Infinity : 30_000,
    });
  }

  /**
   * Adds the instruction to a state.
   *
   * @param next - The challenge's state.
   * @returns It, with the instruction.
   */
  function withInstruction(next: FaceChallengeState): CheckState {
    return { ...next, instruction: instructionFor(next.step, next.index, next.side) };
  }

  /**
   * Feeds one frame to the challenge.
   *
   * @param next - The pose seen in this frame.
   * @param motion - How much the face moved since the last frame.
   */
  function advance(next: HeadPose, motion?: number): void {
    pose.value = next;
    state.value = withInstruction(challenge.update({ pose: next, motion }));
    onUpdate?.(state.value, source.value);
  }

  /** Starts a new challenge. */
  function restart(): void {
    window.clearTimeout(timer);
    challenge = createChallenge();
    tracker = neural.value?.createHeadPoseTracker() ?? null;
    lastPatch = undefined;
    state.value = withInstruction(challenge.state);
    face.value = null;
    landmarks.value = [];
    yaw.value = null;
    pose.value = "—";
    photo.value = null;
    message.value = null;
    hint.value = null;
    hintCandidate = null;
  }

  /**
   * Works out where the person should move, from this frame alone.
   *
   * @param frame - The frame's size.
   * @returns The hint, or `null` when the face is fine.
   */
  function rawHint(frame: { width: number }): string | null {
    const step = state.value.step;
    const facing = step === "frontal" || step === "move";
    // Turned far, the detectors often lose the face; that's expected, not a problem.
    if (!face.value) return facing ? "Fit your face in the oval" : null;
    if (face.value.width < frame.width * MIN_FACE_SHARE) return "Move a little closer";
    return null;
  }

  /**
   * Shows a hint only once it has held for {@link HINT_DELAY}, so a single
   * missed detection doesn't flash a message.
   *
   * @param next - This frame's hint.
   */
  function settleHint(next: string | null): void {
    const now = performance.now();
    if (next !== hintCandidate) {
      hintCandidate = next;
      hintSince = now;
    }
    if (now - hintSince >= HINT_DELAY) hint.value = hintCandidate;
  }

  /**
   * Finds the pose in a frame with the chosen detector.
   *
   * @param frame - The frame as taken (not mirrored).
   * @returns The pose.
   */
  async function detectPose(frame: RGBAImage): Promise<HeadPose> {
    if (backend.value === "neural" && neural.value) {
      const [best] = await neural.value.detector.detect(frame);
      face.value = best ?? null;
      landmarks.value = best ? Object.values(best.landmarks) : [];
      yaw.value = best ? neural.value.estimateHeadYaw(best) : null;
      tracker ??= neural.value.createHeadPoseTracker();
      return tracker.update(best);
    }
    if (!cascades.value) return "none";
    const result = detectHeadPose(grayscale(frame), cascades.value);
    face.value = result.face ?? null;
    landmarks.value = [];
    yaw.value = null;
    return result.pose;
  }

  /** Detects the pose in the current frame and advances the challenge. */
  async function tick(): Promise<void> {
    const frame = camera.frame(FRAME_BOX);
    if (frame) {
      frameSize.value = { width: frame.width, height: frame.height };
      const started = performance.now();
      // The preview is mirrored with CSS; the detector gets the frame as the camera took it.
      const next = await detectPose(frame);
      detectionTime.value = performance.now() - started;
      if (source.value === "idle") return;
      settleHint(rawHint(frame));
      // How much the face region changed since the last frame, for the motion check.
      const patch = face.value ? regionPatch(grayscale(frame), face.value) : undefined;
      const motion = measureMotion(lastPatch, patch);
      lastPatch = patch;
      if (next === "frontal" && face.value) {
        photo.value = { frame, face: face.value, mirrored: source.value === "camera" };
      }
      advance(next, motion);
    }
    if (finished.value) {
      camera.stop();
      return;
    }
    if (source.value === "sample") {
      // Step through the clip at the detector's pace; after the end, its last frame stays.
      await camera.stepVideo(SAMPLE_STEP);
      timer = window.setTimeout(() => void tick(), 40);
      return;
    }
    timer = window.setTimeout(() => void tick(), FRAME_INTERVAL);
  }

  /**
   * Switches the face detector, loading the neural one the first time.
   *
   * @param choice - The detector.
   */
  async function chooseBackend(choice: FaceBackend): Promise<void> {
    if (source.value !== "idle") stop();
    backend.value = choice;
    if (choice !== "neural" || neural.value) return;
    neuralState.value = "loading";
    try {
      neural.value = await loadNeuralBackend();
      neuralState.value = "ready";
    } catch (caught) {
      neuralState.value = "error";
      message.value = `The neural detector couldn't load: ${caught instanceof Error ? caught.message : String(caught)}`;
    }
  }

  /**
   * Switches the challenge, and to the neural detector when it asks for directions.
   *
   * @param choice - The challenge.
   */
  async function chooseChallenge(choice: DemoChallenge): Promise<void> {
    if (source.value !== "idle") stop();
    challengeName.value = choice;
    restart();
    if (needsDirection(choice) && backend.value !== "neural") await chooseBackend("neural");
  }

  /**
   * Starts the frames from the camera or the sample video, and a new check.
   *
   * @param from - Where the frames come from.
   * @returns Whether it started.
   */
  async function begin(from: Exclude<PoseSource, "idle">): Promise<boolean> {
    // The source first: it decides whether the new challenge is timed.
    source.value = from;
    restart();
    const started =
      from === "camera"
        ? await camera.start("user")
        : await camera.startVideo(sampleSources(challengeName.value));
    if (!started) {
      source.value = "idle";
      message.value = camera.error.value;
      return false;
    }
    void tick();
    return true;
  }

  /** Stops the camera or video and the check. */
  function stop(): void {
    window.clearTimeout(timer);
    camera.stop();
    source.value = "idle";
    restart();
  }

  onMounted(() => {
    loadCascades()
      .then((loaded) => {
        cascades.value = loaded;
        cascadesState.value = "ready";
      })
      .catch((caught: unknown) => {
        cascadesState.value = "error";
        message.value = `The face cascades didn't load: ${caught instanceof Error ? caught.message : String(caught)}`;
      });
  });
  onBeforeUnmount(() => window.clearTimeout(timer));

  return {
    camera,
    source,
    challenge: challengeName,
    state,
    cascadesState,
    backend,
    neuralState,
    ready,
    finished,
    pose,
    face,
    landmarks,
    yaw,
    frameSize,
    detectionTime,
    photo,
    message,
    hint,
    chooseBackend,
    chooseChallenge,
    start: () => begin("camera"),
    playSample: () => begin("sample"),
    stop,
  };
}

const STEP_LABELS: Record<ChallengeStep, string> = {
  frontal: "Face the camera",
  left: "Turn left",
  right: "Turn right",
  up: "Look up",
  down: "Look down",
  side: "Turn one way",
  "other-side": "Turn the other way",
  move: "Move a little",
};

/**
 * Short labels for a challenge's steps, for a progress bar.
 *
 * @param challenge - The challenge.
 * @returns One label per step.
 */
export function stepLabels(challenge: DemoChallenge): string[] {
  return CHALLENGE_PRESETS[challenge].map((step, index) =>
    step === "frontal" && index > 0 ? "Face the camera again" : STEP_LABELS[step],
  );
}

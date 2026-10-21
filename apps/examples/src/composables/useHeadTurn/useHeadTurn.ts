import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { createHeadTurnChallenge, detectHeadPose, grayscale } from "pixelvision";
import type { HeadPose, HeadTurnState, Point, RGBAImage } from "pixelvision";
import { useCamera } from "../useCamera";
import type { HeadPoseResources } from "../../examples/detect-head-pose/demo.model";
import { loadNeuralBackend } from "../../examples/head-turn/neural";
import type { NeuralBackend } from "../../examples/head-turn/neural.model";
import { scriptedPoses } from "../../examples/head-turn/script";
import type {
  FaceBackend,
  FaceBox,
  FrontalPhoto,
  PoseSource,
  UseHeadTurn,
  UseHeadTurnOptions,
} from "./useHeadTurn.model";

const FRAME_INTERVAL = 125; // about 8 detections a second
const SCRIPT_INTERVAL = 150;
const FRAME_BOX = { width: 640, height: 480 };
/** How long a positional hint must persist before it's shown (or cleared). */
const HINT_DELAY = 800;
/** A face narrower than this share of the frame is too far away. */
const MIN_FACE_SHARE = 0.18;

/**
 * Runs the head-turn liveness check: the selfie camera, a face detector
 * (the built-in cascades, or the optional neural one) about 8 times a
 * second, and `createHeadTurnChallenge` on the poses. Keeps the last
 * frontal frame as the photo. Bind `camera.video` to a `<video>` element.
 *
 * @param options - Frames to hold, the cascades, and a callback per pose.
 * @returns The check's state and controls.
 */
export function useHeadTurn({
  holdFrames,
  loadCascades,
  onUpdate,
}: UseHeadTurnOptions): UseHeadTurn {
  const camera = useCamera();
  const source = ref<PoseSource>("idle");
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
  let challenge = createHeadTurnChallenge({ holdFrames });
  const state = shallowRef<HeadTurnState>(challenge.state);
  let timer = 0;

  const ready = computed(() =>
    backend.value === "haar" ? cascadesState.value === "ready" : neuralState.value === "ready",
  );
  const finished = computed(() => ["done", "failed"].includes(state.value.step));

  /**
   * Feeds one pose to the challenge.
   *
   * @param next - The pose seen in this frame.
   */
  function advance(next: HeadPose): void {
    pose.value = next;
    state.value = challenge.update(next);
    onUpdate?.(state.value, source.value);
  }

  /** Starts a new challenge. */
  function restart(): void {
    window.clearTimeout(timer);
    challenge = createHeadTurnChallenge({ holdFrames });
    state.value = challenge.state;
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
    const facing = step === "face-camera" || step === "face-camera-again";
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
   * @param frame - The camera frame as taken (not mirrored).
   * @returns The pose.
   */
  async function detectPose(frame: RGBAImage): Promise<HeadPose> {
    if (backend.value === "neural" && neural.value) {
      const [best] = await neural.value.detector.detect(frame);
      face.value = best ?? null;
      landmarks.value = best ? Object.values(best.landmarks) : [];
      yaw.value = best ? neural.value.estimateHeadYaw(best) : null;
      return neural.value.headPoseFromFace(best, { mirrored: false });
    }
    if (!cascades.value) return "none";
    const result = detectHeadPose(grayscale(frame), cascades.value);
    face.value = result.face ?? null;
    landmarks.value = [];
    yaw.value = null;
    return result.pose;
  }

  /** Detects the pose in the current camera frame and advances the challenge. */
  async function tick(): Promise<void> {
    const frame = camera.frame(FRAME_BOX);
    if (frame) {
      frameSize.value = { width: frame.width, height: frame.height };
      const started = performance.now();
      // The preview is mirrored with CSS; the detector gets the frame as the camera took it.
      const next = await detectPose(frame);
      detectionTime.value = performance.now() - started;
      if (source.value !== "camera") return;
      settleHint(rawHint(frame));
      if (next === "frontal" && face.value) {
        photo.value = { frame, face: face.value, mirrored: true };
      }
      advance(next);
    }
    if (finished.value) {
      camera.stop();
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
    if (source.value === "camera") stop();
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
   * Starts the selfie camera and a new check.
   *
   * @returns Whether the camera started.
   */
  async function start(): Promise<boolean> {
    restart();
    source.value = "camera";
    if (!(await camera.start("user"))) {
      source.value = "idle";
      message.value = camera.error.value;
      return false;
    }
    void tick();
    return true;
  }

  /** Stops the camera and the check. */
  function stop(): void {
    window.clearTimeout(timer);
    camera.stop();
    source.value = "idle";
    restart();
  }

  /**
   * Plays the scripted sequence of poses through the same challenge.
   *
   * @param scriptedPhoto - The photo to show when it passes.
   */
  function playScripted(scriptedPhoto?: FrontalPhoto): void {
    camera.stop();
    restart();
    source.value = "scripted";
    const poses = scriptedPoses(holdFrames);
    const step = (index: number) => {
      if (poses[index] === "frontal" && scriptedPhoto) photo.value = scriptedPhoto;
      advance(poses[index]);
      if (index + 1 < poses.length)
        timer = window.setTimeout(() => step(index + 1), SCRIPT_INTERVAL);
    };
    step(0);
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
    start,
    stop,
    playScripted,
  };
}

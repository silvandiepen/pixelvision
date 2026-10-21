// @vitest-environment happy-dom
import { frontalFace } from "pixelvision/cascades/frontal-face";
import { profileFace } from "pixelvision/cascades/profile-face";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import "../index";
import type { FaceCaptureElement } from "../index";
import { FrameGrabber } from "../camera/frames";
import { guidanceScenes, toFrame } from "../logic/testScenes";
import type { GuidanceCase } from "../logic/testScenes";
import { haarPoseSource } from "../sources/haar";
import type { FaceObservation, PoseSource } from "../sources/source.model";
import type { FaceCaptureDetail, PoseDetail } from "./events.model";
import { FakeTrack, fakeCanvas, fakeStream, videoWithSize, wait } from "./testHarness";

// The guidance states through <pv-face-capture>: drawn frames are injected into the detection
// loop, and pixelvision's HAAR cascades find the faces in them.
const WIDTH = 480;
const HEIGHT = 360;
const scenes = guidanceScenes();
const frames = Object.fromEntries(
  Object.entries(scenes).map(([name, image]) => [name, toFrame(image)]),
) as Record<GuidanceCase, ImageData>;

/**
 * The HAAR source, remembering its answer per frame: the fixtures repeat, and the same pixels
 * always give the same result.
 *
 * @returns The source.
 */
const fixtureSource = (): PoseSource => {
  const haar = haarPoseSource({
    cascades: { frontal: frontalFace, profile: profileFace },
    minFaceSize: 0.1,
  });
  const seen = new Map<unknown, FaceObservation>();
  return {
    detect(frame) {
      if (!seen.has(frame)) seen.set(frame, haar.detect(frame) as FaceObservation);
      return seen.get(frame);
    },
  };
};

beforeAll(() => {
  // A view the size of the camera frame, so frame and view pixels match.
  globalThis.ResizeObserver = class {
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe() {
      this.callback(
        [{ contentRect: { width: WIDTH, height: HEIGHT } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      );
    }
    disconnect() {}
    unobserve() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

/**
 * Waits until a condition holds, or the time is up.
 *
 * @param check - The condition.
 * @param ms - Longest wait.
 */
const until = async (check: () => boolean, ms = 4000) => {
  const end = performance.now() + ms;
  while (!check() && performance.now() < end) await wait(20);
};

/**
 * Starts a selfie on fixture frames: each grab takes the fixture for its index.
 *
 * @param frame - The fixture of each detection.
 * @param attributes - Attributes.
 * @returns The element, its captures, `pv-pose` details, the flow's hint at each detection,
 *   and the hint and instruction on screen.
 */
const run = async (frame: (index: number) => GuidanceCase, attributes: string) => {
  fakeCanvas();
  let index = 0;
  vi.spyOn(FrameGrabber.prototype, "grab").mockImplementation(() => ({
    image: frames[frame(index++)],
    scale: 1,
  }));
  document.body.innerHTML = `<pv-face-capture detect-interval="0" accept-pause="0" hint-hold="0" ${attributes}></pv-face-capture>`;
  await wait();
  const el = document.body.firstElementChild as FaceCaptureElement;
  el.source = fixtureSource();
  el.stream = fakeStream(new FakeTrack());
  videoWithSize(el, WIDTH, HEIGHT);
  const list: FaceCaptureDetail[] = [];
  const poses: PoseDetail[] = [];
  const hints: Array<string | undefined> = [];
  el.addEventListener("pv-capture", (e) => list.push((e as CustomEvent<FaceCaptureDetail>).detail));
  el.addEventListener("pv-pose", (e) => {
    poses.push((e as CustomEvent<PoseDetail>).detail);
    hints.push(el.state?.hint);
  });
  await el.start();
  const text = (selector: string) => el.shadowRoot!.querySelector(selector)!.textContent;
  return {
    el,
    list,
    poses,
    hints,
    hint: () => text(".instruction-hint"),
    instruction: () => text(".instruction-text"),
  };
};

/**
 * Runs one fixture over and over, with hints shown as soon as they are asked for.
 *
 * @param name - The fixture.
 * @param attributes - More attributes.
 * @returns See {@link run}.
 */
const show = (name: GuidanceCase, attributes = "") =>
  run(() => name, `hold-frames="2" hint-delay="0" ${attributes}`);

describe("<pv-face-capture> guidance on drawn faces", () => {
  it("frontal and centred: no positional hint, and the steps progress", async () => {
    const { el, hints, poses } = await show("frontal");
    await until(() => (el.state?.stepsDone ?? 0) >= 1);

    expect(el.state).toMatchObject({ phase: "challenge", stepsDone: 1 });
    expect(hints.filter((h) => h && h !== "holdStill")).toEqual([]);
    expect(poses.at(-1)).toMatchObject({ pose: "frontal", guidance: "aligned", faceCount: 1 });
  });

  it("offset: Centre your face in the oval", async () => {
    const { el, hint } = await show("offset");
    await until(() => hint() === "Centre your face in the oval");

    expect(hint()).toBe("Centre your face in the oval");
    expect(el.state!.phase).toBe("aligning");
  });

  it("small: Move a little closer", async () => {
    const { hint } = await show("small");
    await until(() => hint() === "Move a little closer");

    expect(hint()).toBe("Move a little closer");
  });

  it("too large: Move back a little", async () => {
    const { hint } = await show("large");
    await until(() => hint() === "Move back a little");

    expect(hint()).toBe("Move back a little");
  });

  it("two people: asks for one, without progress or a capture", async () => {
    const { el, hint, list, poses } = await show("two", 'steps="off"');
    await until(() => hint() === "Make sure only you are in the frame");
    // Many more detections pass.
    await wait(400);

    expect(hint()).toBe("Make sure only you are in the frame");
    expect(el.state).toMatchObject({ phase: "aligning", hold: 0 });
    expect(list).toEqual([]);
    expect(poses.length).toBeGreaterThan(10);
    expect(poses.every((p) => p.faceCount === 2)).toBe(true);
  });

  it("two people, in Dutch", async () => {
    const { hint } = await show("two", 'lang="nl"');
    await until(() => hint() === "Zorg dat alleen jij in beeld bent");

    expect(hint()).toBe("Zorg dat alleen jij in beeld bent");
  });

  it("a tiny face far behind: captures as with one face", async () => {
    const { list, poses, hints } = await show("tiny", 'steps="off"');
    await until(() => list.length > 0);

    expect(list).toHaveLength(1);
    expect(poses.every((p) => p.faceCount === 1)).toBe(true);
    expect(hints).not.toContain("severalFaces");
  });

  it("counts the tiny face too with a lower several-faces-ratio", async () => {
    const { el, hint, list } = await show("tiny", 'steps="off" several-faces-ratio="0.3"');
    await until(() => hint() === "Make sure only you are in the frame");
    await wait(400);

    expect(hint()).toBe("Make sure only you are in the frame");
    expect(el.state!.phase).toBe("aligning");
    expect(list).toEqual([]);
  });

  it("none: Position your face in the oval", async () => {
    const { el, hint, instruction, poses } = await show("none");
    await until(() => poses.length > 10);

    expect(instruction()).toBe("Position your face in the oval");
    expect(hint()).toBe("");
    expect(el.state!.phase).toBe("searching");
    expect(poses.at(-1)).toMatchObject({ pose: "none", guidance: "no-face", faceCount: 0 });
  });

  it("a second person seen briefly doesn't flash the hint or stop the capture", async () => {
    const { list, hints, poses } = await run(
      (i) => (i === 2 || i === 3 ? "two" : "frontal"),
      'steps="off" hold-frames="3"',
    );
    await until(() => list.length > 0);

    expect(poses.map((p) => p.faceCount).slice(0, 5)).toEqual([1, 1, 2, 2, 1]);
    expect(list).toHaveLength(1);
    expect(hints).not.toContain("severalFaces");
  });
});

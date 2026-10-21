// @vitest-environment happy-dom
import type { HeadPoseCascades } from "pixelvision";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import "../index";
import type { FaceCaptureElement } from "../index";
import type * as FaceSourceModule from "../sources/faceSource";
import {
  FakeTrack,
  fakeFrames,
  fakeStream,
  installResizeObserver,
  videoWithSize,
  wait,
} from "./testHarness";

const cascades = { frontal: {}, profile: {} } as unknown as HeadPoseCascades;

/** Holds cascade loading open until a test releases it. */
const gate = vi.hoisted(() => {
  const state = { release: (): void => undefined, loads: 0 };
  return state;
});

/** Every worker the element started, with what it was sent and whether it was terminated. */
const workers = vi.hoisted(
  () => [] as Array<{ posted: unknown[]; terminated: boolean; listeners: number }>,
);

vi.mock("../sources/faceSource", async (importOriginal) => {
  const actual = await importOriginal<typeof FaceSourceModule>();
  return {
    ...actual,
    loadCascades: () => {
      gate.loads++;
      return new Promise<HeadPoseCascades>((resolve) => {
        gate.release = () => resolve(cascades);
      });
    },
  };
});

vi.mock("../sources/inlineWorker", () => ({
  createInlineWorker: () => {
    const worker = {
      posted: [] as unknown[],
      terminated: false,
      listeners: 0,
      postMessage(message: unknown) {
        worker.posted.push(message);
      },
      addEventListener() {
        worker.listeners++;
      },
      terminate() {
        worker.terminated = true;
      },
    };
    workers.push(worker);
    return worker;
  },
}));

beforeAll(installResizeObserver);

afterEach(() => {
  document.body.replaceChildren();
  workers.length = 0;
  gate.loads = 0;
  vi.restoreAllMocks();
});

/**
 * Mounts a face capture on a fake stream and starts it.
 *
 * @returns The element and its stream's track.
 */
const startFace = async () => {
  document.body.innerHTML = "<pv-face-capture></pv-face-capture>";
  await wait();
  const el = document.querySelector("pv-face-capture") as FaceCaptureElement;
  const track = new FakeTrack();
  el.stream = fakeStream(track);
  videoWithSize(el, 640, 480);
  await el.start();
  return { el, track };
};

describe("<pv-face-capture> stopping while the detector loads", () => {
  it("runs no detection and starts no worker when disconnected during cascade loading", async () => {
    const grab = fakeFrames();
    const { el } = await startFace();
    const poses: unknown[] = [];
    el.addEventListener("pv-pose", (e) => poses.push(e.detail));
    await wait();
    expect(gate.loads).toBe(1);
    expect(grab).toHaveBeenCalledTimes(1);

    el.remove();
    gate.release();
    await wait(300);

    expect(workers).toHaveLength(0);
    expect(poses).toEqual([]);
    // The loop ended with the run: no further frames were grabbed.
    expect(grab).toHaveBeenCalledTimes(1);
  });

  it("terminates the worker it started when disconnected while detecting", async () => {
    fakeFrames();
    const { el } = await startFace();
    await wait();
    gate.release();
    await wait();
    expect(workers).toHaveLength(1);
    expect(workers[0].posted.some((m) => (m as { type: string }).type === "detect")).toBe(true);

    el.remove();

    expect(workers[0].terminated).toBe(true);
  });
});

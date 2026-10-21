// @vitest-environment happy-dom
import type { Matrix } from "pixelvision";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import "../index";
import type { DocumentScannerElement, FaceCaptureElement } from "../index";
import { FrameGrabber } from "../camera/frames";
import { blurred, documentScene, exposed, faceScene, toFrame } from "../logic/testScenes";
import type { DocumentCaptureDetail, FaceCaptureDetail } from "./events.model";
import { FakeTrack, fakeCanvas, fakeStream, videoWithSize, wait } from "./testHarness";

const WIDTH = 480;
const HEIGHT = 360;

beforeAll(() => {
  // A ResizeObserver that reports a view the size of the camera frame, so the face guide is laid
  // out and frame and view pixels match.
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
 * Feeds the detection loop drawn frames: each grab takes the next one, the last repeats.
 *
 * @param frames - Gray frames, or a function of the grab count.
 */
const feedFrames = (frames: (index: number) => Matrix<"u8">) => {
  let index = 0;
  vi.spyOn(FrameGrabber.prototype, "grab").mockImplementation(() => ({
    image: toFrame(frames(index++)),
    scale: 1,
  }));
};

/**
 * Mounts an element and waits for its DOM.
 *
 * @param html - The element's markup.
 * @returns The element.
 */
const mount = async <T extends HTMLElement>(html: string): Promise<T> => {
  document.body.innerHTML = html;
  await wait();
  return document.body.firstElementChild as T;
};

/**
 * Collects `pv-capture` details.
 *
 * @param el - The element.
 * @returns The list, filled as captures happen.
 */
const captures = <T>(el: HTMLElement): T[] => {
  const list: T[] = [];
  el.addEventListener("pv-capture", (e) => list.push((e as CustomEvent<T>).detail));
  return list;
};

/**
 * Waits until a condition holds, or the time is up.
 *
 * @param check - The condition.
 * @param ms - Longest wait.
 */
const until = async (check: () => boolean, ms = 3000) => {
  const end = performance.now() + ms;
  while (!check() && performance.now() < end) await wait(20);
};

describe("<pv-face-capture> quality gate", () => {
  // A face the size the oval asks for, centred on the guide (frame and view are the same size).
  const scale = 1.2;
  const scene = faceScene(WIDTH, HEIGHT, scale, { x: WIDTH / 2, y: HEIGHT * 0.44 - 5 * scale });
  const sharp = scene.image;
  const blurry = blurred(sharp, 3); // the face gate catches a clean blur from sigma 3
  const dark = exposed(sharp, 0.25);

  /**
   * Starts a selfie without the head turns, on the given frames, with a face found in each.
   *
   * @param frames - The frames.
   * @param attributes - Extra attributes.
   * @returns The element and its captures.
   */
  const run = async (frames: (index: number) => Matrix<"u8">, attributes = "") => {
    fakeCanvas();
    feedFrames(frames);
    const el = await mount<FaceCaptureElement>(
      `<pv-face-capture steps="off" hold-frames="2" hint-delay="0" hint-hold="0" detect-interval="0" ${attributes}></pv-face-capture>`,
    );
    el.source = () => ({ pose: "frontal", box: scene.box });
    el.stream = fakeStream(new FakeTrack());
    videoWithSize(el, WIDTH, HEIGHT);
    const list = captures<FaceCaptureDetail>(el);
    await el.start();
    return { el, list, hint: () => el.shadowRoot!.querySelector(".instruction-hint")!.textContent };
  };

  it("captures a sharp, well-lit face, with its quality", async () => {
    const { list } = await run(() => sharp);
    await until(() => list.length > 0);

    expect(list).toHaveLength(1);
    const { quality, sharpness } = list[0].metadata;
    expect(quality!.sharpness).toBeGreaterThan(580);
    expect(quality!.brightness).toBeGreaterThan(80);
    expect(sharpness).toBe(quality!.sharpness);
  });

  it("never captures a blurred face, and asks the person to hold still", async () => {
    const { el, list, hint } = await run(() => blurry);
    await until(() => hint() === "Hold still for a moment");
    await wait(400);

    expect(hint()).toBe("Hold still for a moment");
    expect(el.state!.phase).toBe("finishing");
    expect(list).toEqual([]);
  });

  it("never captures a dark face, and asks for more light", async () => {
    const { el, list, hint } = await run(() => dark);
    await until(() => hint() === "Find a bit more light");
    await wait(400);

    expect(hint()).toBe("Find a bit more light");
    expect(el.state!.phase).toBe("finishing");
    expect(list).toEqual([]);
  });

  it("captures the first good frame once the light improves", async () => {
    const { list } = await run((i) => (i < 12 ? dark : sharp));
    await until(() => list.length > 0);

    expect(list).toHaveLength(1);
    expect(list[0].metadata.quality!.brightness).toBeGreaterThan(80);
  });

  it("takes its thresholds from attributes and properties", async () => {
    const { el, list } = await run(() => blurry, 'min-sharpness="0"');
    await until(() => list.length > 0);
    expect(list).toHaveLength(1);

    expect(el.qualityThresholds).toEqual({
      minSharpness: 0,
      minBrightness: 80,
      maxBrightness: 212,
      minContrast: 22,
    });
    el.minSharpness = 100;
    el.minBrightness = 40;
    el.maxBrightness = 300;
    el.minContrast = 10;
    expect([el.minSharpness, el.minBrightness, el.maxBrightness, el.minContrast]).toEqual([
      100, 40, 255, 10,
    ]);
    expect(el.getAttribute("max-brightness")).toBe("300");
  });

  it("times out when no good frame comes", async () => {
    const { el } = await run(() => dark, 'timeout="400"');
    const codes: string[] = [];
    el.addEventListener("pv-error", (e) => codes.push((e as CustomEvent).detail.code));
    await until(() => codes.length > 0);
    expect(codes).toEqual(["timeout"]);
  });
});

describe("<pv-document-scanner> quality gate", () => {
  const scene = documentScene(WIDTH, HEIGHT);
  const sharp = scene.image;
  const blurry = blurred(sharp, 2);
  const dark = exposed(sharp, 0.25);

  /**
   * Starts a scanner without review on the given frames, with the document found in each.
   *
   * @param frames - The frames.
   * @returns The element, its captures and its instruction.
   */
  const run = async (frames: (index: number) => Matrix<"u8">) => {
    fakeCanvas();
    feedFrames(frames);
    const el = await mount<DocumentScannerElement>(
      '<pv-document-scanner review="off" hold-frames="2" hint-delay="0" hint-hold="0" detect-interval="0"></pv-document-scanner>',
    );
    el.finder = { find: () => ({ corners: scene.corners!, area: 0.4 }) };
    el.stream = fakeStream(new FakeTrack());
    videoWithSize(el, WIDTH, HEIGHT);
    const list = captures<DocumentCaptureDetail>(el);
    await el.start();
    const instruction = () => el.shadowRoot!.querySelector(".instruction-text")!.textContent;
    return { el, list, instruction };
  };

  it("captures a sharp, well-lit document, with its quality", async () => {
    const { list } = await run(() => sharp);
    await until(() => list.length > 0);

    expect(list).toHaveLength(1);
    expect(list[0].quality!.sharpness).toBeGreaterThan(230);
    expect(list[0].quality!.brightness).toBeGreaterThan(85);
  });

  it("never captures a blurred document, and asks to hold still", async () => {
    const { list, instruction } = await run(() => blurry);
    await until(() => instruction() === "Hold still so the text is sharp");
    await wait(400);

    expect(instruction()).toBe("Hold still so the text is sharp");
    expect(list).toEqual([]);
  });

  it("never captures a dark document, and asks for more light", async () => {
    const { el, list, instruction } = await run(() => dark);
    await until(() => instruction() === "Find a bit more light");
    await wait(400);

    expect(instruction()).toBe("Find a bit more light");
    expect(el.shadowRoot!.querySelector<HTMLElement>(".root")!.dataset.phase).toBe("holding");
    expect(list).toEqual([]);
  });

  it("captures once the light improves", async () => {
    const { list } = await run((i) => (i < 12 ? dark : sharp));
    await until(() => list.length > 0);

    expect(list).toHaveLength(1);
    expect(list[0].quality!.brightness).toBeGreaterThan(85);
  });
});

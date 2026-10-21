// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import "../index";
import type { DocumentScannerElement, FaceCaptureElement } from "../index";
import type { DocumentCaptureDetail, ErrorDetail, FaceCaptureDetail } from "./events.model";
import {
  FakeTrack,
  fakeCanvas,
  fakeFrames,
  fakeStream,
  installResizeObserver,
  provideCamera,
  videoWithSize,
  wait,
} from "./testHarness";

beforeAll(installResizeObserver);

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

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
 * Collects the codes of `pv-error` events.
 *
 * @param el - The element.
 * @returns The list, filled as errors happen.
 */
const errorCodes = (el: HTMLElement) => {
  const codes: string[] = [];
  el.addEventListener("pv-error", (e) => codes.push((e as CustomEvent<ErrorDetail>).detail.code));
  return codes;
};

/**
 * Records Blob URLs created and revoked.
 *
 * @returns The created and revoked URLs.
 */
const recordBlobUrls = () => {
  const created: string[] = [];
  const revoked: string[] = [];
  vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
    const url = `blob:test/${created.length + 1}`;
    created.push(url);
    return url;
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation((url) => {
    revoked.push(url);
  });
  return { created, revoked };
};

describe("starting the camera", () => {
  it("refuses a stream without a live video track", async () => {
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    const codes = errorCodes(el);
    const ended = new FakeTrack();
    ended.readyState = "ended";
    const ready = vi.fn();
    el.addEventListener("pv-ready", ready);

    el.stream = fakeStream();
    await el.start();
    el.stream = fakeStream(ended);
    await el.start();

    expect(codes).toEqual(["no-video", "no-video"]);
    expect(ready).not.toHaveBeenCalled();
    expect(el.shadowRoot!.querySelector("video")!.srcObject).toBeNull();
  });

  it("stops a camera it opened when that stream has no live video", async () => {
    const track = new FakeTrack();
    track.readyState = "ended";
    provideCamera(fakeStream(track));
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    const codes = errorCodes(el);

    await el.start();

    expect(codes).toEqual(["no-video"]);
    expect(track.stopped).toBe(true);
  });

  it("gives up when no frame size arrives in time, removing its listeners", async () => {
    const track = new FakeTrack();
    provideCamera(fakeStream(track));
    const el = await mount<FaceCaptureElement>(
      '<pv-face-capture start-timeout="100"></pv-face-capture>',
    );
    const codes = errorCodes(el);

    await el.start();

    expect(codes).toEqual(["start-timeout"]);
    expect(track.stopped).toBe(true);
    expect(track.listeners).toBe(0);
  });

  it("fails when the track ends during startup", async () => {
    const track = new FakeTrack();
    provideCamera(fakeStream(track));
    const el = await mount<DocumentScannerElement>("<pv-document-scanner></pv-document-scanner>");
    const codes = errorCodes(el);

    const starting = el.start();
    await wait();
    track.end();
    await starting;

    expect(codes).toEqual(["ended"]);
    expect(track.listeners).toBe(0);
  });

  it("settles quietly and turns the camera off when disconnected during startup", async () => {
    const track = new FakeTrack();
    provideCamera(fakeStream(track));
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    const codes = errorCodes(el);
    const ready = vi.fn();
    el.addEventListener("pv-ready", ready);

    const starting = el.start();
    await wait();
    el.remove();
    await starting;

    expect(codes).toEqual([]);
    expect(ready).not.toHaveBeenCalled();
    expect(track.stopped).toBe(true);
    expect(track.listeners).toBe(0);
  });

  it("can start and stop repeatedly, leaving no listeners on the track", async () => {
    fakeFrames();
    const track = new FakeTrack();
    const el = await mount<FaceCaptureElement>('<pv-face-capture worker="off"></pv-face-capture>');
    el.cascades = { frontal: {}, profile: {} } as never;
    el.source = () => ({ pose: "none" });
    el.stream = fakeStream(track);
    videoWithSize(el, 640, 480);
    const ready = vi.fn();
    el.addEventListener("pv-ready", ready);

    for (let i = 0; i < 3; i++) {
      await el.start();
      expect(track.listeners).toBe(1);
      el.stop();
      expect(track.listeners).toBe(0);
    }

    expect(ready).toHaveBeenCalledTimes(3);
    // An external stream belongs to the page: the element never stops it.
    expect(track.stopped).toBe(false);
  });

  it("reports a track that ends while running and stops", async () => {
    fakeFrames();
    const track = new FakeTrack();
    provideCamera(fakeStream(track));
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    el.source = () => ({ pose: "none" });
    videoWithSize(el, 640, 480);
    const codes = errorCodes(el);

    await el.start();
    track.end();

    expect(codes).toEqual(["ended"]);
    expect(el.shadowRoot!.querySelector("video")!.srcObject).toBeNull();
  });
});

describe("<pv-face-capture> capture", () => {
  /**
   * Starts a face capture on a fake 1280 x 960 camera.
   *
   * @param attributes - Extra attributes.
   * @returns The element.
   */
  const running = async (attributes = "") => {
    fakeFrames();
    const el = await mount<FaceCaptureElement>(`<pv-face-capture ${attributes}></pv-face-capture>`);
    el.source = () => ({ pose: "none" });
    el.stream = fakeStream(new FakeTrack());
    videoWithSize(el, 1280, 960);
    await el.start();
    return el;
  };

  it("keeps the capture on the element: pv-capture doesn't bubble or cross the shadow root", async () => {
    fakeCanvas();
    const el = await running();
    const onDocument: string[] = [];
    for (const type of ["pv-capture", "pv-complete", "pv-ready"]) {
      document.addEventListener(type, () => onDocument.push(type));
    }
    const onElement: FaceCaptureDetail[] = [];
    el.addEventListener("pv-capture", (e) =>
      onElement.push((e as CustomEvent<FaceCaptureDetail>).detail),
    );

    const detail = await el.capture();

    expect(onElement).toEqual([detail]);
    expect(onDocument).toEqual(["pv-complete"]);
  });

  it("leaves raw pixels out unless asked, and names the challenge result plainly", async () => {
    fakeCanvas();
    const plain = await (await running()).capture();
    expect(plain!.blob.type).toBe("image/jpeg");
    expect("image" in plain!).toBe(false);
    expect(plain!.metadata.challengePassed).toBe(false);
    expect("liveness" in plain!.metadata).toBe(false);

    const withPixels = await (await running("include-image-data")).capture();
    expect(withPixels!.image).toMatchObject({ width: 1280, height: 960 });
  });

  it("scales a large frame down to max-pixels", async () => {
    fakeCanvas();
    const el = await running('max-pixels="76800"');
    expect(el.maxPixels).toBe(76_800);

    const detail = await el.capture();

    expect(detail!.metadata).toMatchObject({ width: 320, height: 240 });
    el.maxPixels = 1;
    expect(el.maxPixels).toBe(320 * 240);
    el.removeAttribute("max-pixels");
    expect(el.maxPixels).toBe(1920 * 1440);
  });

  it("frees its canvases and keeps no Blob URL once the capture is handed off", async () => {
    const canvases = fakeCanvas();
    const urls = recordBlobUrls();
    const el = await running("include-image-data");

    await el.capture();
    const still = el.shadowRoot!.querySelector<HTMLImageElement>(".still")!;
    expect(still.getAttribute("src")).toBe("blob:test/1");
    still.dispatchEvent(new Event("load"));
    await wait();

    expect(urls.revoked).toEqual(urls.created);
    expect(canvases.canvases.filter((c) => c.width || c.height)).toEqual([]);
    expect(still.hidden).toBe(false);
  });

  it("clears the still, revoking a URL still loading, on dispose, repeatedly", async () => {
    fakeCanvas();
    const urls = recordBlobUrls();
    const el = await running();
    await el.capture();
    const still = el.shadowRoot!.querySelector<HTMLImageElement>(".still")!;

    el.dispose();
    el.dispose();
    el.clearSensitiveData();

    expect(urls.revoked).toEqual(["blob:test/1"]);
    expect(still.hasAttribute("src")).toBe(false);
    expect(still.hidden).toBe(true);
  });

  it("clears the capture on reset and on disconnect", async () => {
    fakeCanvas();
    const urls = recordBlobUrls();
    const el = await running();
    await el.capture();
    const still = el.shadowRoot!.querySelector<HTMLImageElement>(".still")!;

    el.reset();
    expect(still.hasAttribute("src")).toBe(false);
    expect(urls.revoked).toEqual(["blob:test/1"]);

    el.stream = fakeStream(new FakeTrack());
    await el.start();
    await el.capture();
    el.remove();
    expect(still.hasAttribute("src")).toBe(false);
    expect(urls.revoked).toEqual(["blob:test/1", "blob:test/2"]);
  });

  it("clears the capture on error", async () => {
    fakeCanvas();
    const urls = recordBlobUrls();
    const el = await running();
    await el.capture();
    const still = el.shadowRoot!.querySelector<HTMLImageElement>(".still")!;
    const track = new FakeTrack();
    track.readyState = "ended";
    el.stream = fakeStream(track);

    await el.start();

    expect(still.hasAttribute("src")).toBe(false);
    expect(urls.revoked).toEqual(["blob:test/1"]);
  });

  it("captures nothing once stopped", async () => {
    fakeCanvas();
    const el = await running();
    el.stop();
    expect(await el.capture()).toBeUndefined();
  });

  it("toggles include-image-data through its property", async () => {
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    expect(el.includeImageData).toBe(false);
    el.includeImageData = true;
    expect(el.includeImageData).toBe(true);
    el.includeImageData = false;
    expect(el.getAttribute("include-image-data")).toBe("off");
  });
});

describe("<pv-document-scanner> capture", () => {
  /**
   * Starts a document scanner without review on a fake camera.
   *
   * @param attributes - Extra attributes.
   * @returns The element.
   */
  const running = async (attributes = "") => {
    fakeFrames();
    const el = await mount<DocumentScannerElement>(
      `<pv-document-scanner review="off" auto-capture="off" ${attributes}></pv-document-scanner>`,
    );
    el.finder = { find: () => null };
    el.stream = fakeStream(new FakeTrack());
    videoWithSize(el, 1600, 1200);
    await el.start();
    return el;
  };

  it("keeps the capture on the element, without pixels unless asked, and frees the photo", async () => {
    const canvases = fakeCanvas();
    const urls = recordBlobUrls();
    const el = await running('max-pixels="120000"');
    const onDocument = vi.fn();
    document.addEventListener("pv-capture", onDocument);
    const captures: DocumentCaptureDetail[] = [];
    el.addEventListener("pv-capture", (e) =>
      captures.push((e as CustomEvent<DocumentCaptureDetail>).detail),
    );

    await el.capture();
    await wait();

    expect(onDocument).not.toHaveBeenCalled();
    expect(captures).toHaveLength(1);
    expect("image" in captures[0]).toBe(false);
    expect(captures[0].source).toEqual({ width: 400, height: 300 });
    const result = el.shadowRoot!.querySelector<HTMLImageElement>(".review img")!;
    result.dispatchEvent(new Event("load"));
    await wait();
    expect(urls.revoked).toEqual(urls.created);
    expect(canvases.canvases.filter((c) => c.width || c.height)).toEqual([]);

    el.reset();
    expect(result.hasAttribute("src")).toBe(false);
  });

  it("adds the straightened pixels when asked, and clears on disconnect", async () => {
    fakeCanvas();
    const urls = recordBlobUrls();
    const el = await running("include-image-data");
    const captures: DocumentCaptureDetail[] = [];
    el.addEventListener("pv-capture", (e) =>
      captures.push((e as CustomEvent<DocumentCaptureDetail>).detail),
    );

    await el.capture();
    await wait();
    el.remove();

    expect(captures[0].image).toBeDefined();
    expect(urls.revoked).toEqual(urls.created);
  });
});

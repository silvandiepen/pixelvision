import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type * as CaptureUi from "../src/index";

/** What a page-level record of Blob URLs, workers and CSP violations holds. */
interface PageRecord {
  documentEvents: string[];
  blobUrls: Array<{ url: string; type: string; revoked: boolean }>;
  workers: Array<{ url: string; terminated: boolean }>;
  violations: string[];
}

/** The parts of a capture element the tests call. */
interface TestElement extends HTMLElement {
  stream: MediaStream | undefined;
  source: unknown;
  start(): Promise<void>;
  stop(): void;
  capture(): Promise<unknown>;
}

/** What `page.js` and {@link mount} put on `window`. */
interface PageWindow {
  captureUi: typeof CaptureUi;
  loadCascades: () => Promise<unknown>;
  grayStream: () => MediaStream;
  streams: MediaStream[];
  record: PageRecord;
  el: TestElement;
  events: string[];
}

/**
 * Opens a test page once its module has loaded.
 *
 * @param page - The page.
 * @param path - `index.html`, or `strict.csp.html` for the strict Content Security Policy.
 */
async function open(page: Page, path = "index.html"): Promise<void> {
  await page.goto(`/capture-ui/e2e/${path}`);
  await page.waitForFunction(() => "record" in window);
}

/**
 * Adds an element and records the events it receives itself on `window.events`.
 *
 * @param page - The page.
 * @param html - The element's markup.
 */
async function mount(page: Page, html: string): Promise<void> {
  await page.evaluate(async (markup) => {
    const w = window as unknown as PageWindow;
    document.body.insertAdjacentHTML("beforeend", markup);
    const el = document.body.lastElementChild as TestElement;
    w.el = el;
    w.events = [];
    for (const type of ["pv-ready", "pv-pose", "pv-detect", "pv-capture", "pv-error"]) {
      el.addEventListener(type, (event) => {
        const code = type === "pv-error" ? `:${(event as CustomEvent).detail.code}` : "";
        w.events.push(type + code);
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }, html);
}

/**
 * Starts the mounted element.
 *
 * @param page - The page.
 */
async function start(page: Page): Promise<void> {
  await page.evaluate(() => (window as unknown as PageWindow).el.start());
}

/**
 * Reads the page's records.
 *
 * @param page - The page.
 * @returns Events seen on `document`, Blob URLs, workers and CSP violations.
 */
function records(page: Page): Promise<PageRecord> {
  return page.evaluate(() => (window as unknown as PageWindow).record);
}

/**
 * Reads the events the element itself received.
 *
 * @param page - The page.
 * @returns Event names in order; errors as `pv-error:<code>`.
 */
function elementEvents(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as PageWindow).events);
}

/**
 * Removes the mounted element from the page.
 *
 * @param page - The page.
 */
async function remove(page: Page): Promise<void> {
  await page.evaluate(() => (window as unknown as PageWindow).el.remove());
}

test.describe("<pv-face-capture>", () => {
  test("detects in the built-in worker and stops everything on disconnect", async ({ page }) => {
    await open(page);
    await mount(page, "<pv-face-capture></pv-face-capture>");
    await start(page);
    await expect.poll(async () => (await elementEvents(page)).includes("pv-pose")).toBe(true);
    let seen = await records(page);
    expect(seen.workers).toHaveLength(1);
    expect(seen.workers[0].url.startsWith("blob:")).toBe(true);

    await remove(page);

    seen = await records(page);
    expect(seen.workers[0].terminated).toBe(true);
    const tracks = await page.evaluate(() =>
      (window as unknown as PageWindow).streams.map((s) => s.getVideoTracks()[0].readyState),
    );
    expect(tracks).toEqual(["ended"]);
    // Status events still reach the page.
    expect(seen.documentEvents).toContain("pv-ready");
    expect(seen.documentEvents).toContain("pv-pose");
  });

  test("keeps the capture on the element, bounded and without pixels, and cleans up", async ({
    page,
  }) => {
    await open(page);
    await mount(page, '<pv-face-capture max-pixels="76800"></pv-face-capture>');
    await start(page);
    const detail = await page.evaluate(async () => {
      const result = (await (window as unknown as PageWindow).el.capture()) as {
        blob: Blob;
        metadata: { width: number; height: number; challengePassed: boolean };
      };
      return { type: result.blob.type, hasImage: "image" in result, metadata: result.metadata };
    });

    expect(detail).toMatchObject({
      type: "image/jpeg",
      hasImage: false,
      metadata: { width: 320, height: 240, challengePassed: false },
    });
    expect(await elementEvents(page)).toContain("pv-capture");
    // The still's Blob URL is revoked once it has decoded, and the still stays visible.
    await expect
      .poll(async () => (await records(page)).blobUrls.filter((u) => u.type === "image/jpeg"))
      .toEqual([expect.objectContaining({ revoked: true })]);
    const still = () =>
      page.evaluate(() => {
        const img = (window as unknown as PageWindow).el.shadowRoot!.querySelector(
          ".still",
        ) as HTMLImageElement;
        return { hidden: img.hidden, width: img.naturalWidth, src: img.hasAttribute("src") };
      });
    expect(await still()).toEqual({ hidden: false, width: 320, src: true });

    await remove(page);

    const seen = await records(page);
    expect(seen.documentEvents).not.toContain("pv-capture");
    expect(seen.documentEvents).toContain("pv-complete");
    expect(seen.workers.every((w) => w.terminated)).toBe(true);
    expect(await still()).toMatchObject({ hidden: true, src: false });
  });

  test("includes raw pixels only when asked", async ({ page }) => {
    await open(page);
    await mount(page, "<pv-face-capture include-image-data></pv-face-capture>");
    await start(page);
    const size = await page.evaluate(async () => {
      const result = (await (window as unknown as PageWindow).el.capture()) as {
        image: ImageData;
      };
      return [result.image.width, result.image.height];
    });
    expect(size).toEqual([640, 480]);
  });

  test("runs no detection and starts no worker when removed while the cascades load", async ({
    page,
  }) => {
    let release = () => {};
    const released = new Promise<void>((resolve) => (release = resolve));
    let requested = false;
    await page.route("**/pixelvision/dist/cascades/frontal-face.js", async (route) => {
      requested = true;
      await released;
      await route.continue();
    });
    await open(page);
    await mount(page, "<pv-face-capture></pv-face-capture>");
    await start(page);
    await expect.poll(() => requested).toBe(true);

    await remove(page);
    release();
    // Long enough for the cascades to load and several detection intervals to pass.
    await page.waitForTimeout(1500);

    const seen = await records(page);
    expect(seen.workers).toEqual([]);
    expect(await elementEvents(page)).toEqual(["pv-ready"]);
    expect(seen.documentEvents.filter((type) => type === "pv-pose")).toEqual([]);
  });

  test("refuses a stream without a live video track", async ({ page }) => {
    await open(page);
    await mount(page, "<pv-face-capture></pv-face-capture>");
    await page.evaluate(async () => {
      const w = window as unknown as PageWindow;
      const stream = w.grayStream();
      stream.getVideoTracks()[0].stop();
      w.el.stream = stream;
      await w.el.start();
      w.el.stream = new MediaStream();
      await w.el.start();
    });
    expect(await elementEvents(page)).toEqual(["pv-error:no-video", "pv-error:no-video"]);
  });

  test("reports a track that ends while running and turns the camera off", async ({
    page,
    browserName,
  }) => {
    // Firefox delivers no synthetic events to MediaStreamTrack listeners (not even ones dispatched
    // on the track itself), and a canvas track can't be ended by the browser on demand. Chromium,
    // WebKit and the happy-dom lifecycle test cover this path.
    test.skip(browserName === "firefox", "synthetic track events aren't delivered in Firefox");
    await open(page);
    await mount(page, "<pv-face-capture></pv-face-capture>");
    await start(page);
    await page.evaluate(() => {
      const track = (window as unknown as PageWindow).streams[0].getVideoTracks()[0];
      // What the browser fires when a camera is unplugged or its permission revoked.
      track.dispatchEvent(new Event("ended"));
    });

    expect(await elementEvents(page)).toContain("pv-error:ended");
    const state = await page.evaluate(() => {
      const w = window as unknown as PageWindow;
      return {
        track: w.streams[0].getVideoTracks()[0].readyState,
        attached: w.el.shadowRoot!.querySelector("video")!.srcObject !== null,
      };
    });
    expect(state).toEqual({ track: "ended", attached: false });
  });

  test("survives repeated start and stop", async ({ page }) => {
    await open(page);
    await mount(page, "<pv-face-capture></pv-face-capture>");
    await page.evaluate(async () => {
      const el = (window as unknown as PageWindow).el;
      for (let i = 0; i < 3; i++) {
        void el.start();
        el.stop();
        await el.start();
        el.stop();
      }
    });
    const tracks = await page.evaluate(() =>
      (window as unknown as PageWindow).streams.map((s) => s.getVideoTracks()[0].readyState),
    );
    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks.every((state) => state === "ended")).toBe(true);
    expect((await records(page)).workers.every((w) => w.terminated)).toBe(true);
  });
});

test.describe("<pv-document-scanner>", () => {
  test("keeps the capture on the element and frees it on disconnect", async ({ page }) => {
    await open(page);
    await mount(
      page,
      '<pv-document-scanner review="off" auto-capture="off"></pv-document-scanner>',
    );
    await start(page);
    await expect.poll(async () => (await elementEvents(page)).includes("pv-detect")).toBe(true);
    await page.evaluate(() => (window as unknown as PageWindow).el.capture());

    await expect.poll(async () => (await elementEvents(page)).includes("pv-capture")).toBe(true);
    await expect
      .poll(async () => (await records(page)).blobUrls.filter((u) => u.type === "image/jpeg"))
      .toEqual([expect.objectContaining({ revoked: true })]);
    await remove(page);

    const seen = await records(page);
    expect(seen.documentEvents).not.toContain("pv-capture");
    expect(seen.documentEvents).toContain("pv-detect");
    expect(seen.workers.length).toBeGreaterThan(0);
    expect(seen.workers.every((w) => w.terminated)).toBe(true);
  });
});

test.describe("strict Content Security Policy", () => {
  test("the haar-worker entry detects with worker-src 'self' and no blob:", async ({ page }) => {
    await open(page, "strict.csp.html");
    await mount(page, "<pv-face-capture></pv-face-capture>");
    await page.evaluate(async () => {
      const w = window as unknown as PageWindow;
      const worker = new Worker(new URL("../dist/haar-worker.js", location.href), {
        type: "module",
      });
      w.el.source = w.captureUi.workerPoseSource(worker, {
        cascades: (await w.loadCascades()) as never,
      });
      await w.el.start();
    });

    await expect.poll(async () => (await elementEvents(page)).includes("pv-pose")).toBe(true);
    const seen = await records(page);
    expect(seen.violations).toEqual([]);
    expect(seen.workers.map((w) => new URL(w.url).pathname)).toEqual([
      "/capture-ui/dist/haar-worker.js",
    ]);
    expect(seen.blobUrls).toEqual([]);
  });

  test("the built-in worker is refused and detection falls back to the main thread", async ({
    page,
  }) => {
    await open(page, "strict.csp.html");
    await mount(page, "<pv-face-capture></pv-face-capture>");
    await start(page);

    await expect.poll(async () => (await elementEvents(page)).includes("pv-pose")).toBe(true);
    expect(await elementEvents(page)).not.toContain("pv-error:detector");
  });
});

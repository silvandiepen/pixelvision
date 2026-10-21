// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { defineCaptureElements, DocumentScannerElement, FaceCaptureElement } from "../index";
import type { ErrorDetail } from "./events.model";

/** Lets queued microtasks (the elements build their DOM in one) run. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeAll(() => {
  // happy-dom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    disconnect() {}
    unobserve() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

const mount = async <T extends HTMLElement>(html: string): Promise<T> => {
  document.body.innerHTML = html;
  await tick();
  return document.body.firstElementChild as T;
};

const panel = (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>(".panel")!;

describe("registration", () => {
  it("defines both elements on import", () => {
    expect(customElements.get("pv-face-capture")).toBe(FaceCaptureElement);
    expect(customElements.get("pv-document-scanner")).toBe(DocumentScannerElement);
  });

  it("defines custom tag names", () => {
    defineCaptureElements({ face: "acme-selfie", document: "acme-scanner" });
    expect(new (customElements.get("acme-selfie")!)()).toBeInstanceOf(FaceCaptureElement);
    expect(new (customElements.get("acme-scanner")!)()).toBeInstanceOf(DocumentScannerElement);
    expect(() => defineCaptureElements({ face: "acme-selfie" })).not.toThrow();
  });
});

describe("<pv-face-capture>", () => {
  it("shows the intro with a start button and the guide", async () => {
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    const p = panel(el);
    expect(p.hidden).toBe(false);
    expect(p.querySelector("h2")!.textContent).toBe("Take a selfie");
    expect(p.querySelector("button")!.textContent).toBe("Start camera");
    expect(el.shadowRoot!.querySelector(".guide")).not.toBeNull();
    expect(el.shadowRoot!.querySelector('[role="status"]')).not.toBeNull();
    expect(el.shadowRoot!.querySelector(".root")!.classList.contains("mirrored")).toBe(true);
  });

  it("follows the lang attribute and label overrides", async () => {
    const el = await mount<FaceCaptureElement>('<pv-face-capture lang="nl"></pv-face-capture>');
    expect(panel(el).querySelector("h2")!.textContent).toBe("Maak een selfie");
    el.labels = { faceIntroTitle: "Selfie" };
    expect(panel(el).querySelector("h2")!.textContent).toBe("Selfie");
    expect(el.labels).toEqual({ faceIntroTitle: "Selfie" });
    el.setAttribute("lang", "en");
    expect(panel(el).querySelector("button")!.textContent).toBe("Start camera");
    el.labels = undefined;
    expect(el.labels).toEqual({});
  });

  it("inherits the page language", async () => {
    document.body.innerHTML = '<div lang="nl"><pv-face-capture></pv-face-capture></div>';
    await tick();
    const el = document.querySelector("pv-face-capture")!;
    expect(panel(el).querySelector("h2")!.textContent).toBe("Maak een selfie");
  });

  it("reports a denied camera with an explanation and a retry", async () => {
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    const denied = Object.assign(new Error("denied"), { name: "NotAllowedError" });
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: () => Promise.reject(denied) },
      configurable: true,
    });
    const errors: ErrorDetail[] = [];
    el.addEventListener("pv-error", (e) => errors.push(e.detail));
    await el.start();
    expect(errors).toEqual([{ code: "denied", message: "Camera access is off", cause: denied }]);
    expect(panel(el).dataset.tone).toBe("error");
    expect(panel(el).querySelector("button")!.textContent).toBe("Try again");
    expect(el.shadowRoot!.querySelector('[role="status"]')!.textContent).toContain(
      "Camera access is off",
    );
    el.setAttribute("lang", "nl");
    expect(panel(el).querySelector("h2")!.textContent).toBe("Cameratoegang staat uit");
  });

  it("reports an insecure page", async () => {
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    Object.defineProperty(window, "isSecureContext", { value: false, configurable: true });
    const codes: string[] = [];
    el.addEventListener("pv-error", (e) => codes.push(e.detail.code));
    await el.start();
    expect(codes).toEqual(["insecure"]);
  });

  it("accepts a detect function as its source and exposes cascades", async () => {
    const el = await mount<FaceCaptureElement>("<pv-face-capture></pv-face-capture>");
    const detect = () => ({ pose: "none" as const });
    el.source = detect;
    expect(el.source).toEqual({ detect });
    const cascades = { frontal: {}, profile: {} } as never;
    el.cascades = cascades;
    expect(el.cascades).toBe(cascades);
    expect(el.state).toBeUndefined();
    expect("result" in el).toBe(false);
  });

  it("returns to the intro on reset and stops cleanly", async () => {
    const el = await mount<FaceCaptureElement>('<pv-face-capture steps="off"></pv-face-capture>');
    el.reset();
    expect(panel(el).hidden).toBe(false);
    el.stop();
    expect(el.shadowRoot!.querySelector(".root")!.getAttribute("data-state")).toBe("intro");
    expect(await el.capture()).toBeUndefined();
  });

  it("can be unmirrored and debugged", async () => {
    const el = await mount<FaceCaptureElement>(
      '<pv-face-capture mirrored="false" show-debug guide-shape="circle"></pv-face-capture>',
    );
    expect(el.shadowRoot!.querySelector(".root")!.classList.contains("mirrored")).toBe(false);
    expect(el.shadowRoot!.querySelector<HTMLElement>(".debug")!.hidden).toBe(false);
    el.setAttribute("mirrored", "");
    expect(el.shadowRoot!.querySelector(".root")!.classList.contains("mirrored")).toBe(true);
  });
});

describe("<pv-document-scanner>", () => {
  it("shows its intro, aspect options and corner handles", async () => {
    const el = await mount<DocumentScannerElement>(
      '<pv-document-scanner aspect="id-card"></pv-document-scanner>',
    );
    expect(panel(el).querySelector("h2")!.textContent).toBe("Scan your document");
    const options = Array.from(el.shadowRoot!.querySelectorAll('[role="radio"]'));
    expect(options.map((o) => o.textContent)).toEqual(["Auto", "ID card", "A4"]);
    expect(options.map((o) => o.getAttribute("aria-checked"))).toEqual(["false", "true", "false"]);
    const corners = Array.from(el.shadowRoot!.querySelectorAll(".corner"));
    expect(corners.map((c) => c.getAttribute("aria-label"))).toEqual([
      "Top-left corner",
      "Top-right corner",
      "Bottom-right corner",
      "Bottom-left corner",
    ]);
    expect(el.shadowRoot!.querySelector(".root")!.classList.contains("mirrored")).toBe(false);
  });

  it("switches aspect by click and arrow keys", async () => {
    const el = await mount<DocumentScannerElement>("<pv-document-scanner></pv-document-scanner>");
    expect(el.aspect).toBe("auto");
    const a4 = el.shadowRoot!.querySelector<HTMLButtonElement>('[data-value="a4"]')!;
    a4.click();
    expect(el.getAttribute("aspect")).toBe("a4");
    expect(a4.getAttribute("aria-checked")).toBe("true");
    a4.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(el.aspect).toBe("auto");
    a4.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(el.aspect).toBe("a4");
    a4.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(el.aspect).toBe("a4");
    el.aspect = "id-card";
    expect(el.getAttribute("aspect")).toBe("id-card");
  });

  it("reports a camera that is in use", async () => {
    const el = await mount<DocumentScannerElement>("<pv-document-scanner></pv-document-scanner>");
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: () =>
          Promise.reject(Object.assign(new Error(), { name: "NotReadableError" })),
      },
      configurable: true,
    });
    const codes: string[] = [];
    el.addEventListener("pv-error", (e) => codes.push(e.detail.code));
    await el.start();
    expect(codes).toEqual(["in-use"]);
    expect(panel(el).querySelector("h2")!.textContent).toBe("The camera is in use");
  });

  it("takes a custom finder and has no corners before detecting", async () => {
    const el = await mount<DocumentScannerElement>("<pv-document-scanner></pv-document-scanner>");
    const finder = { find: () => null };
    el.finder = finder;
    expect(el.finder).toBe(finder);
    expect(el.corners).toBeUndefined();
    el.reset();
  });
});

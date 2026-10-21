import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import type { Download, Page } from "@playwright/test";
import type { PublishedResult } from "../src/results.model";
import { collectErrors } from "./helpers";
import {
  CANVAS_CAMERA_SKIP,
  blankCamera,
  canvasCameraUnsupported,
  denyCamera,
  fakeCameraWithScene,
  scenePng,
} from "./scene";

/**
 * Reads what a landing-page section published.
 *
 * @param page - The page.
 * @param key - `home-scan` or `home-liveness`.
 * @returns Its values.
 */
async function published(page: Page, key: string) {
  const result = (await page.evaluate((k) => window.__pixelvisionResults?.[k], key)) as
    PublishedResult | undefined;
  return result?.values ?? {};
}

/**
 * Clicks a download button and reads the file it saves.
 *
 * @param page - The page.
 * @param format - `png`, `jpeg` or `pdf`.
 * @returns The suggested file name and the bytes.
 */
async function downloadFile(page: Page, format: string): Promise<{ name: string; bytes: Buffer }> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(`[data-download="${format}"]`).click(),
  ]);
  const path = await (download as Download).path();
  return { name: download.suggestedFilename(), bytes: await readFile(path) };
}

test.describe("landing page: scan a document", () => {
  test("an uploaded photo becomes a straightened file to download", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    const section = page.locator("[data-home-scan]");
    await expect(section).toHaveAttribute("data-scan-state", "scanning");
    await section.locator("[data-capture-upload]").setInputFiles({
      name: "scene.png",
      mimeType: "image/png",
      buffer: await scenePng(page),
    });

    await expect(section).toHaveAttribute("data-scan-state", "success");
    await expect(section.locator("[data-success-mark]")).toBeVisible();
    await expect(section.locator("[data-scan-output]")).toBeVisible();
    const { width, height } = await published(page, "home-scan");
    expect(Number(width)).toBeGreaterThan(200);

    // PNG: the signature, then the width and height in the IHDR chunk.
    const png = await downloadFile(page, "png");
    expect(png.name).toBe("document.png");
    expect(png.bytes.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    expect(png.bytes.subarray(12, 16).toString("latin1")).toBe("IHDR");
    expect(png.bytes.readUInt32BE(16)).toBe(width);
    expect(png.bytes.readUInt32BE(20)).toBe(height);

    // A4 straightens to 210:297 and the PDF is an A4 page with a JPEG of that size.
    await section.locator('[data-choice="aspect-a4"]').click();
    await expect.poll(async () => (await published(page, "home-scan")).aspect).toBe("a4");
    const a4 = await published(page, "home-scan");
    expect(Number(a4.width) / Number(a4.height)).toBeCloseTo(210 / 297, 2);
    await expect(section.locator("[data-scan-size]")).toContainText(`${a4.width} × ${a4.height}`);

    const pdf = await downloadFile(page, "pdf");
    expect(pdf.name).toBe("document.pdf");
    const text = pdf.bytes.toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text.trimEnd().endsWith("%%EOF")).toBe(true);
    expect(text).toContain(`/Width ${a4.width} /Height ${a4.height}`);
    expect(text).toContain("/MediaBox [0 0 595.28 841.89]");
    const stream = text.indexOf("stream\n") + "stream\n".length;
    expect(pdf.bytes.subarray(stream, stream + 2)).toEqual(Buffer.from([0xff, 0xd8]));

    const jpeg = await downloadFile(page, "jpeg");
    expect(jpeg.name).toBe("document.jpg");
    expect(jpeg.bytes.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));

    await section.locator("[data-scan-again]").click();
    await expect(section).toHaveAttribute("data-scan-state", "scanning");
    await expect(section.locator("[data-capture-upload]")).toBeAttached();
    expect(errors).toEqual([]);
  });

  test("the camera captures on its own once the document is still", async ({
    page,
    browserName,
  }) => {
    test.skip(canvasCameraUnsupported(browserName), CANVAS_CAMERA_SKIP);
    await fakeCameraWithScene(page);
    await page.goto("/");
    const section = page.locator("[data-home-scan]");
    await section.locator("[data-capture-camera]").click();
    await expect(section.locator('[data-capture-state="holding"]')).toBeVisible({
      timeout: 10_000,
    });
    await expect(section).toHaveAttribute("data-scan-state", "success", { timeout: 15_000 });
    expect((await published(page, "home-scan")).captured).toBe(true);
    await expect(section.locator('[data-download="png"]')).toBeVisible();
  });

  test("says what's wrong when a photo has no document", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("[data-home-scan]");
    const blank = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#777";
        context.fillRect(0, 0, 320, 240);
      }
      return canvas.toDataURL("image/png").split(",")[1];
    });
    await section.locator("[data-capture-upload]").setInputFiles({
      name: "blank.png",
      mimeType: "image/png",
      buffer: Buffer.from(blank, "base64"),
    });
    await expect(section.locator("[data-capture-error]")).toContainText("No document found");
    await expect(section).toHaveAttribute("data-scan-state", "scanning");
  });
});

test.describe("landing page: liveness check", () => {
  test("the demo run passes and shows the photo it kept", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    const section = page.locator("[data-home-liveness]");
    await section.locator("[data-challenge-scripted]").click();
    await expect(section.locator('[data-capture-state="running"]')).toBeVisible();
    // The ring fills as a step holds, rather than jumping from step to step.
    await expect
      .poll(async () =>
        Number(await section.locator("[data-hold-ring]").getAttribute("data-hold-progress")),
      )
      .toBeGreaterThan(0);
    await expect(section).toHaveAttribute("data-liveness-state", "success", { timeout: 15_000 });
    await expect(section.locator("[data-success-mark]")).toBeVisible();
    await expect(section.locator("[data-liveness-photo]")).toBeVisible();
    const result = await published(page, "home-liveness");
    expect(result.source).toBe("scripted");
    expect(result.photo).toMatch(/^\d+x\d+$/);

    await section.locator("[data-liveness-again]").click();
    await expect(section).toHaveAttribute("data-liveness-state", "checking");
    await expect(section.locator("[data-challenge-start]")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("asks for a face only once none has been seen for a moment", async ({
    page,
    browserName,
  }) => {
    test.skip(canvasCameraUnsupported(browserName), CANVAS_CAMERA_SKIP);
    await blankCamera(page);
    await page.goto("/");
    const section = page.locator("[data-home-liveness]");
    await expect(section.locator("[data-challenge-start]")).toBeEnabled();
    await section.locator("[data-challenge-start]").click();
    await expect(section.locator("[data-challenge-instruction]")).toHaveText(
      "Look straight at the camera",
    );
    const started = Date.now();
    await expect(section.locator("[data-challenge-hint]")).toHaveText("Fit your face in the oval", {
      timeout: 10_000,
    });
    expect(Date.now() - started).toBeGreaterThanOrEqual(700);
    await expect(section.locator("[data-challenge-instruction]")).toHaveText(
      "Look straight at the camera",
    );
  });

  test("explains when the camera isn't available", async ({ page }) => {
    await denyCamera(page);
    await page.goto("/");
    const section = page.locator("[data-home-liveness]");
    await expect(section.locator("[data-challenge-start]")).toBeEnabled();
    await section.locator("[data-challenge-start]").click();
    await expect(section.locator("[data-capture-error]")).toContainText("Camera access is blocked");
  });
});

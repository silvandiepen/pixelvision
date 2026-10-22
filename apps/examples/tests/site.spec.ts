import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import * as pixelvision from "pixelvision";
import type { PublishedResult } from "../src/results.model";
import { collectErrors } from "./helpers";
import {
  SCENE_CORNERS,
  blankCamera,
  denyCamera,
  fakeCameraWithScene,
  parseCorners,
  scenePng,
  CANVAS_CAMERA_SKIP,
  canvasCameraUnsupported,
} from "./scene";

const GUIDES = [
  "getting-started",
  "concepts",
  "camera",
  "web-workers",
  "node",
  "react-native",
  "face-neural",
  "security",
  "why",
  "use-cases",
  "from-jsfeat",
  "from-opencv",
];

/**
 * Reads what a live demo published.
 *
 * @param page - The page.
 * @param slug - The example.
 * @returns Its values.
 */
async function published(page: Page, slug: string) {
  return page.evaluate((key) => window.__pixelvisionResults?.[key], slug) as Promise<
    PublishedResult | undefined
  >;
}

test.describe("layout", () => {
  test("the stylesheet is applied", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/examples");
    const styles = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const sidebar = document.querySelector(".app__sidebar");
      return {
        token: root.getPropertyValue("--auno-space-m").trim(),
        background: getComputedStyle(document.body).backgroundColor,
        sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : 0,
        sidebarSticky: sidebar ? getComputedStyle(sidebar).position : "",
        headerHeight: document.querySelector(".app-header")?.getBoundingClientRect().height ?? 0,
      };
    });
    expect(styles.token).toBe("16px");
    expect(styles.background).toBe("rgb(249, 250, 251)");
    expect(styles.sidebarWidth).toBe(272);
    expect(styles.sidebarSticky).toBe("sticky");
    expect(styles.headerHeight).toBe(64);
  });

  test("the sidebar highlights the current page", async ({ page }) => {
    await page.goto("/canny");
    const current = page.locator(".side-nav__link--current");
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText("canny");
  });

  test("on a phone the sidebar opens from the menu button", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/canny");
    const sidebar = page.locator("#app-sidebar");
    await expect(sidebar).toBeHidden();
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(sidebar).toBeVisible();
    await sidebar.getByRole("link", { name: "houghLines", exact: true }).click();
    await expect(page).toHaveURL(/\/hough-lines$/);
    await expect(sidebar).toBeHidden();
  });

  test("the theme can be switched", async ({ page }) => {
    await page.goto("/examples");
    await page.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe("rgb(18, 19, 22)");
  });
});

test.describe("landing page", () => {
  test("shows the live edge demo, the numbers and the ways in", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Computer vision for JavaScript");
    // The sample photo loads first.
    await expect
      .poll(() =>
        page.locator("[data-hero-output]").evaluate((canvas: HTMLCanvasElement) => canvas.width),
      )
      .toBe(640);
    const edges = await page.locator("[data-hero-output]").evaluate((canvas: HTMLCanvasElement) => {
      const data =
        canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height).data ?? [];
      let white = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i] === 255) white++;
      return { width: canvas.width, white };
    });
    expect(edges.width).toBe(640);
    expect(edges.white).toBeGreaterThan(500);
    // Every number on the page is filled in, none left as a placeholder.
    await expect(page.locator(".home-view")).not.toContainText("{{");
    await expect(page.locator(".home-view__fact-value").first()).toContainText("KB");
    await page.getByRole("link", { name: "Get started" }).first().click();
    await expect(page).toHaveURL(/\/guide\/getting-started$/);
    expect(errors).toEqual([]);
  });

  test("the sidebar is hidden on the landing page and shown on docs", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator("#app-sidebar")).toBeHidden();
    await page.goto("/guide/why");
    await expect(page.locator("#app-sidebar")).toBeVisible();
    await expect(page.locator(".guide-view__prose")).not.toContainText("{{");
  });
});

test.describe("documentation", () => {
  for (const slug of GUIDES) {
    test(`guide ${slug} renders`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/guide/${slug}`);
      await expect(page.locator(`[data-guide="${slug}"] h1`)).toBeVisible();
      expect(await page.locator(".guide-view__prose").innerText()).not.toBe("");
      expect(errors).toEqual([]);
    });
  }

  test("the jsfeat guide shows the parity table and the differences", async ({ page }) => {
    await page.goto("/guide/from-jsfeat");
    const prose = page.locator(".guide-view__prose");
    await expect(prose.locator("td", { hasText: "imgproc.canny" })).toBeVisible();
    await expect(prose.locator("h2", { hasText: "Fixed behaviour" })).toBeVisible();
    // Function names link to their example pages.
    await prose
      .locator("a", { hasText: /^canny$/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/canny$/);
  });

  test("the API reference documents every exported function", async ({ page }) => {
    await page.goto("/api");
    const documented = await page
      .locator("[data-api-entry]")
      .evaluateAll((entries) => entries.map((entry) => entry.getAttribute("data-api-entry")));
    const exported = Object.entries(pixelvision)
      .filter(([, value]) => typeof value === "function")
      .map(([name]) => name);
    expect(exported.filter((name) => !documented.includes(name))).toEqual([]);
    await expect(page.locator('[data-api-entry="canny"]')).toContainText("TypeError");
  });
});

test.describe("document scanner", () => {
  test("finds and straightens an uploaded photo", async ({ page }) => {
    await page.goto("/scan-document");
    await expect(page.locator('[data-slug="scan-document"]')).toHaveAttribute(
      "data-demo-status",
      "ready",
    );
    await page.locator("[data-scanner-upload]").setInputFiles({
      name: "scene.png",
      mimeType: "image/png",
      buffer: await scenePng(page),
    });
    // Wait for the upload's result, not the default sample's.
    await expect.poll(async () => (await published(page, "scan-document"))?.defaults).toBe(false);
    expect((await published(page, "scan-document"))?.values.found).toBe(true);
    const result = await published(page, "scan-document");
    const corners = parseCorners(String(result?.values.corners));
    corners.forEach((corner, i) => {
      expect(
        Math.hypot(corner.x - SCENE_CORNERS[i].x, corner.y - SCENE_CORNERS[i].y),
      ).toBeLessThanOrEqual(4);
    });
    // ID card proportions by default: width / height ≈ 85.6 / 53.98.
    const ratio = Number(result?.values.width) / Number(result?.values.height);
    expect(ratio).toBeCloseTo(85.6 / 53.98, 1);
  });

  test("asks to move back when the document runs off the frame", async ({ page, browserName }) => {
    test.skip(canvasCameraUnsupported(browserName), CANVAS_CAMERA_SKIP);
    // The right-hand corners lie beyond the 640 px wide frame.
    await fakeCameraWithScene(page, [
      { x: 300, y: 110 },
      { x: 720, y: 130 },
      { x: 720, y: 380 },
      { x: 280, y: 360 },
    ]);
    await page.goto("/scan-document");
    await page.locator("[data-scanner-camera]").click();

    await expect(page.locator("[data-scanner-status]")).toHaveText(
      "Move back so the whole document is in view.",
      { timeout: 10_000 },
    );
    await page.waitForTimeout(2_000);
    await expect(page.locator('[data-slug="scan-document"]')).not.toHaveAttribute(
      "data-scanner-state",
      "captured",
    );
  });

  test("captures from the camera once the document is still", async ({ page, browserName }) => {
    test.skip(canvasCameraUnsupported(browserName), CANVAS_CAMERA_SKIP);
    await fakeCameraWithScene(page);
    await page.goto("/scan-document");
    await page.locator("[data-scanner-camera]").click();
    const scanner = page.locator('[data-slug="scan-document"]');
    await expect(scanner).toHaveAttribute("data-scanner-state", "captured", { timeout: 15_000 });
    const result = await published(page, "scan-document");
    expect(result?.values.captured).toBe(true);
    const corners = parseCorners(String(result?.values.corners));
    corners.forEach((corner, i) => {
      expect(
        Math.hypot(corner.x - SCENE_CORNERS[i].x, corner.y - SCENE_CORNERS[i].y),
      ).toBeLessThanOrEqual(4);
    });
    await expect(page.getByRole("button", { name: "Retake" })).toBeVisible();
  });
});

test.describe("live effects", () => {
  test("starts with the sketch preset on the sample", async ({ page }) => {
    await page.goto("/live-effects");
    const demo = page.locator('[data-slug="live-effects"]');
    await expect(demo).toHaveAttribute("data-demo-status", "ready");
    await expect(demo).toHaveAttribute("data-demo-defaults", "true");
    await expect(page.locator("[data-layer]")).toHaveCount(4);
    const result = await published(page, "live-effects");
    expect(result?.values.sameSize).toBe(true);
  });

  test("adds an effect by pressing it and by dragging it, then takes a photo", async ({ page }) => {
    // Tall enough for the palette and the stack to be in view together while dragging.
    await page.setViewportSize({ width: 1280, height: 1400 });
    await page.goto("/live-effects");
    await page.locator('[data-add-effect="smooth"]').click();
    await expect(page.locator('[data-layer="smooth"]')).toHaveCount(1);
    // Dropped on a layer, an effect goes in above it.
    await page.locator('[data-add-effect="mirror"]').dragTo(page.locator('[data-layer="thicken"]'));
    await expect(page.locator('[data-layer="mirror"]')).toHaveCount(1);
    await page.getByRole("button", { name: "Remove Negative" }).click();

    await page.locator("[data-effects-capture]").click();
    await expect(page.locator("[data-effects-photo]")).toBeVisible();
    const result = await published(page, "live-effects");
    expect(result?.values.effects).toBe("blur,edges,mirror,thicken,smooth");
    expect(result?.values.photo).toMatch(/^\d+x\d+$/);
  });

  test("runs the stack on the camera and takes a full-size photo", async ({
    page,
    browserName,
  }) => {
    test.skip(canvasCameraUnsupported(browserName), CANVAS_CAMERA_SKIP);
    await fakeCameraWithScene(page);
    await page.goto("/live-effects");
    await page.locator("[data-effects-camera]").click();
    await expect(page.getByRole("button", { name: "Stop the camera" })).toBeVisible();
    await page.locator("[data-effects-capture]").click();
    await expect(page.locator("[data-effects-photo]")).toBeVisible();
    const result = await published(page, "live-effects");
    expect(result?.values.source).toBe("camera");
    expect(result?.values.photo).toBe("640x480");
  });
});

test.describe("head-turn check", () => {
  test("the sample video passes the head turn with the built-in detector", async ({ page }) => {
    // The clip steps at the detector's pace, which is slow in some headless browsers.
    test.setTimeout(120_000);
    await page.goto("/head-turn?demo=sample");
    const check = page.locator('[data-slug="head-turn"]');
    await expect(check).toHaveAttribute("data-challenge-step", "done", { timeout: 100_000 });
    await expect(page.locator(".head-turn-check__step--done")).toHaveCount(4);
    const result = await published(page, "head-turn");
    expect(result?.values).toMatchObject({ progress: 4, source: "sample", challenge: "head-turn" });
  });

  test("the motion sample passes, and the head circle switches to YuNet and passes", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.goto("/head-turn");
    const check = page.locator('[data-slug="head-turn"]');
    await page.locator('[data-challenge="motion"]').click();
    await page.locator("[data-challenge-sample]").click();
    await expect(check).toHaveAttribute("data-challenge-step", "done", { timeout: 80_000 });

    await page.locator('[data-challenge="head-circle"]').click();
    await expect(page.locator('[data-backend="neural"]')).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("[data-challenge-sample]")).toBeEnabled({ timeout: 30_000 });
    await page.locator("[data-challenge-sample]").click();
    await expect(check).toHaveAttribute("data-challenge-step", "done", { timeout: 80_000 });
    await expect(page.locator(".head-turn-check__step--done")).toHaveCount(6);
  });

  test("the neural detector loads and finds no face in a blank frame", async ({
    page,
    browserName,
  }) => {
    test.skip(canvasCameraUnsupported(browserName), CANVAS_CAMERA_SKIP);
    const errors = collectErrors(page);
    await blankCamera(page);
    await page.goto("/head-turn");
    await page.locator('[data-backend="neural"]').click();
    await expect(page.locator("[data-backend-status]")).toContainText("YuNet loaded", {
      timeout: 30_000,
    });
    await page.locator("[data-challenge-start]").click();
    await expect(page.locator("[data-challenge-pose]")).toContainText("none", { timeout: 15_000 });
    await expect(page.locator("[data-challenge-pose]")).toContainText(" ms");
    await expect(page.locator('[data-slug="head-turn"]')).toHaveAttribute(
      "data-challenge-step",
      "frontal",
    );
    expect(errors).toEqual([]);
  });

  test("explains when the camera isn't available", async ({ page }) => {
    await denyCamera(page);
    await page.goto("/head-turn");
    await expect(page.locator('[data-slug="head-turn"]')).toHaveAttribute(
      "data-demo-status",
      "ready",
    );
    await page.locator("[data-challenge-start]").click();
    await expect(page.locator('[data-slug="head-turn"] [role="alert"]')).toContainText(
      "Camera access is blocked",
    );
  });
});

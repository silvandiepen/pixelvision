import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { EXAMPLES } from "../examples";
import { SCENE_CORNERS, fakeCameraWithScene, parseCorners, scenePng } from "./scene";

/**
 * Waits for the example to find the document, then checks every corner is
 * within 4 px of where the scene drew it.
 *
 * @param page - The example's page.
 */
async function expectSceneCorners(page: Page): Promise<void> {
  const result = page.locator("[data-result]");
  await expect(result).toHaveAttribute("data-found", "true", { timeout: 15_000 });
  await expect(page.locator("[data-status]")).toHaveText("Found a document.");
  const corners = parseCorners((await result.getAttribute("data-corners")) ?? "");
  expect(corners).toHaveLength(4);
  corners.forEach((corner, i) => {
    expect(
      Math.hypot(corner.x - SCENE_CORNERS[i].x, corner.y - SCENE_CORNERS[i].y),
    ).toBeLessThanOrEqual(4);
  });
  // The edge map is drawn at the photo's size.
  expect(
    await result.evaluate((canvas: HTMLCanvasElement) => [canvas.width, canvas.height]),
  ).toEqual([640, 480]);
}

for (const { name, port } of EXAMPLES) {
  test.describe(name, () => {
    test.use({ baseURL: `http://localhost:${port}` });

    test("finds the document in an uploaded photo", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");
      await page.locator("[data-upload]").setInputFiles({
        name: "scene.png",
        mimeType: "image/png",
        buffer: await scenePng(page),
      });
      await expectSceneCorners(page);
      expect(errors).toEqual([]);
    });

    test("finds the document in a camera frame", async ({ page }) => {
      await fakeCameraWithScene(page);
      await page.goto("/");
      await page.locator("[data-camera]").click();
      await expectSceneCorners(page);
    });
  });
}

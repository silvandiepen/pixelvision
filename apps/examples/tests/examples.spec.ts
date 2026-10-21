import { expect, test } from "@playwright/test";
import * as pixelvision from "pixelvision";
import { checkExpectation, describeExpectation } from "../src/examples/define";
import type { Expectation } from "../src/examples/example.model";
import { PAGES_PENDING } from "../src/examples/pending";
import type { PublishedResult } from "../src/results.model";
import { canvasChecksums, collectErrors, exampleSlugs } from "./helpers";

const slugs = exampleSlugs();

test.describe("gallery", () => {
  test("lists every example", async ({ page }) => {
    await page.goto("/examples");
    const listed = await page
      .locator("[data-example-slug]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("data-example-slug")));
    expect([...listed].sort()).toEqual(slugs);
  });

  test("has a page for every function pixelvision exports", async ({ page }) => {
    await page.goto("/examples");
    const primary = await page
      .locator("[data-functions]")
      .evaluateAll((links) =>
        links.map((link) => (link.getAttribute("data-functions") ?? "").split(",")[0]),
      );
    const exported = Object.entries(pixelvision)
      .filter(([, value]) => typeof value === "function")
      .map(([name]) => name);
    const missing = exported.filter(
      (name) => !primary.includes(name) && !PAGES_PENDING.includes(name),
    );
    expect(missing, "exported functions without an example page").toEqual([]);
  });
});

for (const slug of slugs) {
  test(`${slug}: demo passes its checks on the default input`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/${slug}`);

    const demo = page.locator(`[data-slug="${slug}"]`);
    await expect(demo).toHaveAttribute("data-demo-status", /ready|error/);
    const result = (await page.evaluate((key) => window.__pixelvisionResults?.[key], slug)) as
      PublishedResult | undefined;
    expect(result?.error ?? null, "the demo threw").toBeNull();
    expect(result?.status).toBe("ready");
    expect(result?.defaults, "ran on the default sample and options").toBe(true);

    // Every check the page documents under "How to test it".
    const expectations = (await page
      .locator("[data-expectation]")
      .evaluateAll((items) =>
        items.map((item) => JSON.parse(item.getAttribute("data-expectation") ?? "{}")),
      )) as Expectation[];
    expect(expectations.length).toBeGreaterThan(0);
    for (const expectation of expectations) {
      const outcome = checkExpectation(expectation, result?.values ?? {});
      expect(
        outcome.pass,
        `${describeExpectation(expectation)}, got ${String(outcome.actual)}`,
      ).toBe(true);
    }

    // What the canvases show is exactly what the demo computed.
    const canvases = await canvasChecksums(page);
    for (const canvas of canvases) {
      expect(canvas.width * canvas.height).toBeGreaterThan(0);
      expect(canvas.actual, "canvas pixels match the computed output").toBe(canvas.expected);
    }

    await expect(page.locator(".code-block__code").first()).toContainText("export function demo");
    expect(errors, "console errors").toEqual([]);
  });
}

test.describe("interaction", () => {
  test("changing a control re-runs the demo", async ({ page }) => {
    await page.goto("/canny");
    const demo = page.locator('[data-slug="canny"]');
    await expect(demo).toHaveAttribute("data-demo-status", "ready");
    const edgesAt = () =>
      page.evaluate(() => Number(window.__pixelvisionResults?.canny?.values.edgePixels));
    const before = await edgesAt();

    await page.locator('[data-control="low"] input').fill("300");
    await page.locator('[data-control="high"] input').fill("800");
    await expect(demo).toHaveAttribute("data-demo-defaults", "false");
    await expect.poll(edgesAt).toBeLessThan(before);

    await page.getByRole("button", { name: "Reset to defaults" }).click();
    await expect(demo).toHaveAttribute("data-demo-defaults", "true");
    await expect.poll(edgesAt).toBe(before);
  });

  test("an invalid input shows the library's error", async ({ page }) => {
    await page.goto("/invert3x3");
    const cells = page.locator('[data-control="m"] input');
    // Make the third row equal to the first: a singular matrix.
    for (const [index, value] of [4, 7, 2].entries()) {
      await cells.nth(6 + index).fill(String(value));
      await cells.nth(6 + index).blur();
    }
    await expect(page.locator("[data-demo-error]")).toContainText("RangeError");
    await expect(page.locator('[data-slug="invert3x3"]')).toHaveAttribute(
      "data-demo-status",
      "error",
    );
  });

  test("the corners of the straighten pipeline can be dragged", async ({ page }) => {
    await page.goto("/straighten-document");
    const demo = page.locator('[data-slug="straighten-document"]');
    await expect(demo).toHaveAttribute("data-demo-status", "ready");
    const handle = page.locator('[data-demo-input] [data-handle="0"]');
    await handle.scrollIntoViewIfNeeded();
    const box = await handle.boundingBox();
    if (!box) throw new Error("The first corner handle isn't visible");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 40, { steps: 5 });
    await page.mouse.up();
    await expect(demo).toHaveAttribute("data-demo-defaults", "false");
    const corner = page.locator('[data-control="corners"] input').first();
    await expect(corner).not.toHaveValue("84");
  });
});

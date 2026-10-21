import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

const examplesDirectory = fileURLToPath(new URL("../src/examples", import.meta.url));

/**
 * Lists the example slugs from the source tree: every folder in
 * `src/examples` with a `demo.ts`. The gallery test checks the built app
 * lists exactly these.
 *
 * @returns The slugs, sorted.
 */
export function exampleSlugs(): string[] {
  return readdirSync(examplesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(`${examplesDirectory}/${entry.name}/demo.ts`))
    .map((entry) => entry.name)
    .sort();
}

/**
 * Collects console errors and uncaught exceptions on a page.
 *
 * @param page - The page.
 * @returns The list, filled as errors happen.
 */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/**
 * Hashes the pixels each output canvas holds, in the browser, with the
 * same FNV-1a the app uses for `data-checksum`.
 *
 * @param page - The page.
 * @returns For each canvas: the expected and the actual hash, and its size.
 */
export function canvasChecksums(
  page: Page,
): Promise<{ expected: string; actual: string; width: number; height: number }[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLCanvasElement>("canvas[data-checksum]"), (canvas) => {
      const context = canvas.getContext("2d");
      const data = context?.getImageData(0, 0, canvas.width, canvas.height).data ?? [];
      let hash = 0x811c9dc5;
      for (let i = 0; i < data.length; i++) {
        hash ^= data[i] & 0xff;
        hash = Math.imul(hash, 0x01000193);
      }
      return {
        expected: canvas.dataset.checksum ?? "",
        actual: (hash >>> 0).toString(16).padStart(8, "0"),
        width: canvas.width,
        height: canvas.height,
      };
    }),
  );
}

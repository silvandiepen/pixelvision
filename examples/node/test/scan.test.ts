import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Point } from "pixelvision";
import { afterAll, describe, expect, it } from "vitest";
import type * as Pgm from "../src/pgm.cjs";
import type * as Scan from "../src/scan.mjs";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = join(root, "fixtures/scene.pgm");
// The tests run the compiled output (`pnpm build`), the way Node runs it.
const { decodePgm } = require(join(root, "dist/pgm.cjs")) as typeof Pgm;
const outputs = mkdtempSync(join(tmpdir(), "pixelvision-node-"));
afterAll(() => rmSync(outputs, { recursive: true, force: true }));

/** Corners of the document in `fixtures/scene.pgm` (320 x 240). */
const FIXTURE_CORNERS = [
  { x: 75, y: 45 },
  { x: 250, y: 60 },
  { x: 235, y: 200 },
  { x: 60, y: 180 },
];

/**
 * Checks that found corners are within 4 px of the fixture's.
 *
 * @param corners - Found corners.
 */
function expectFixtureCorners(corners: readonly Point[]): void {
  expect(corners).toHaveLength(4);
  corners.forEach((corner, i) => {
    const expected = FIXTURE_CORNERS[i];
    expect(Math.hypot(corner.x - expected.x, corner.y - expected.y)).toBeLessThanOrEqual(4);
  });
}

describe.each([
  {
    system: "import (ESM)",
    load: async (): Promise<typeof Scan> => import(pathToFileURL(join(root, "dist/scan.mjs")).href),
  },
  {
    system: "require (CommonJS)",
    load: async (): Promise<typeof Scan> => require(join(root, "dist/scan.cjs")),
  },
])("scanFile via $system", ({ system, load }) => {
  it("finds the document and writes it straightened", async () => {
    const { scanFile } = await load();
    const output = join(outputs, `${system.split(" ")[0]}.pgm`);

    const result = await scanFile(fixture, output);

    expect(result).not.toBeNull();
    expectFixtureCorners(result?.corners ?? []);
    const written = decodePgm(readFileSync(output));
    expect(written.width).toBe(result?.width);
    expect(written.height).toBe(result?.height);
    // The document is light: the straightened crop is mostly paper.
    const mean = written.data.reduce((sum, value) => sum + value, 0) / written.data.length;
    expect(mean).toBeGreaterThan(200);
  });
});

describe("package resolution", () => {
  it("resolves pixelvision to the CommonJS build for require", () => {
    expect(require.resolve("pixelvision")).toMatch(/[\\/]dist[\\/]index\.cjs$/);
  });

  it("resolves pixelvision to the ESM build for import, in plain Node", () => {
    const resolved = execFileSync(
      process.execPath,
      ["--input-type=module", "-e", 'console.log(import.meta.resolve("pixelvision"))'],
      { cwd: root, encoding: "utf8" },
    );
    expect(resolved.trim()).toMatch(/\/dist\/index\.js$/);
  });
});

describe("command line", () => {
  it("prints the corners and writes the document", () => {
    const output = join(outputs, "cli.pgm");
    const printed = execFileSync(process.execPath, ["dist/cli.mjs", fixture, output], {
      cwd: root,
      encoding: "utf8",
    });
    expectFixtureCorners(JSON.parse(printed).corners);
    expect(decodePgm(readFileSync(output)).width).toBeGreaterThan(0);
  });
});

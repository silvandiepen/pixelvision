import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { measureMotion, regionPatch } from "./motion";

/** A gray frame filled by a function of x and y. */
const frame = (fill: (x: number, y: number) => number) => {
  const m = createMatrix(64, 64);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) m.data[y * 64 + x] = fill(x, y);
  return m;
};
const box = { x: 8, y: 8, width: 48, height: 48 };

describe("regionPatch", () => {
  it("averages the region into cells", () => {
    const patch = regionPatch(
      frame((x) => (x < 32 ? 0 : 200)),
      box,
      4,
    )!;
    expect(Array.from(patch.cells.slice(0, 4))).toEqual([0, 0, 200, 200]);
  });

  it("gives nothing for a region smaller than the grid", () => {
    expect(
      regionPatch(
        frame(() => 0),
        { x: 0, y: 0, width: 8, height: 8 },
        16,
      ),
    ).toBeUndefined();
  });

  it("clips the region to the frame", () => {
    expect(
      regionPatch(
        frame(() => 50),
        { x: -20, y: -20, width: 60, height: 60 },
      ),
    ).toBeDefined();
  });
});

describe("measureMotion", () => {
  const still = regionPatch(
    frame((x, y) => (x * 3 + y) % 256),
    box,
  );

  it("is 0 for a frozen frame", () => {
    expect(
      measureMotion(
        still,
        regionPatch(
          frame((x, y) => (x * 3 + y) % 256),
          box,
        ),
      ),
    ).toBe(0);
  });

  it("grows with the change", () => {
    const shifted = regionPatch(
      frame((x, y) => (x * 3 + y + 6) % 256),
      box,
    );
    const motion = measureMotion(still, shifted)!;
    expect(motion).toBeGreaterThan(0.004);
    expect(motion).toBeLessThan(1);
  });

  it("is undefined without two patches", () => {
    expect(measureMotion(undefined, still)).toBeUndefined();
  });
});

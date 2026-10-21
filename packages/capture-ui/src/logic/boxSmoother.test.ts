import { describe, expect, it } from "vitest";
import { createBoxSmoother, isOutlierBox, median, medianBox } from "./boxSmoother";

const box = (x: number, y = 0, s = 100) => ({ x, y, width: s, height: s });

describe("median helpers", () => {
  it("takes medians", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(medianBox([box(0), box(10), box(1000)])).toEqual(box(10));
  });

  it("spots outliers by position and by size", () => {
    expect(isOutlierBox(box(20), box(0), 0.5)).toBe(false);
    expect(isOutlierBox(box(80), box(0), 0.5)).toBe(true);
    expect(isOutlierBox(box(-25, -25, 150), box(0), 0.5)).toBe(false);
    expect(isOutlierBox(box(-30, -30, 160), box(0), 0.5)).toBe(true);
    expect(isOutlierBox(box(0), { x: 0, y: 0, width: 0, height: 0 }, 0.5)).toBe(true);
  });
});

describe("createBoxSmoother", () => {
  it("returns the running median", () => {
    const s = createBoxSmoother({ windowFrames: 3 });
    expect(s.update(box(0))).toEqual({ box: box(0), outlier: false, held: false });
    s.update(box(10));
    expect(s.update(box(40)).box).toEqual(box(10));
    s.update(box(40));
    // The window drops the oldest box.
    expect(s.update(box(40)).box).toEqual(box(40));
  });

  it("ignores a one-off jump", () => {
    const s = createBoxSmoother();
    s.update(box(0));
    s.update(box(5));
    expect(s.update(box(500))).toEqual({ box: box(2.5), outlier: true, held: false });
    expect(s.update(box(4)).outlier).toBe(false);
  });

  it("believes a jump that persists in one place", () => {
    const s = createBoxSmoother({ persistFrames: 2 });
    s.update(box(0));
    expect(s.update(box(500)).outlier).toBe(true);
    // A different jump restarts the count.
    expect(s.update(box(900)).outlier).toBe(true);
    const moved = s.update(box(905));
    expect(moved).toEqual({ box: box(902.5), outlier: false, held: false });
  });

  it("bridges brief gaps, then lets go", () => {
    const s = createBoxSmoother({ gapFrames: 2 });
    expect(s.update(undefined)).toEqual({ outlier: false, held: false });
    s.update(box(0));
    expect(s.update(undefined)).toEqual({ box: box(0), outlier: false, held: true });
    expect(s.update(undefined).held).toBe(true);
    expect(s.update(undefined)).toEqual({ outlier: false, held: false });
    // After letting go, the next box starts afresh.
    expect(s.update(box(300)).box).toEqual(box(300));
  });

  it("resets and clamps the window", () => {
    const s = createBoxSmoother({ windowFrames: 0 });
    s.update(box(0));
    expect(s.update(box(10)).box).toEqual(box(10));
    s.reset();
    expect(s.update(undefined).box).toBeUndefined();
  });
});

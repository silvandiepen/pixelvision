import { describe, expect, it } from "vitest";
import { createStabilityTracker } from "./stability";

const quad = (dx = 0) => [
  { x: 0 + dx, y: 0 },
  { x: 100 + dx, y: 0 },
  { x: 100 + dx, y: 100 },
  { x: 0 + dx, y: 100 },
];

describe("createStabilityTracker", () => {
  it("counts steady detections up to stable", () => {
    const s = createStabilityTracker({ holdFrames: 2 });
    expect(s.update(quad())).toEqual({ stable: false, progress: 0, count: 0 });
    expect(s.update(quad(1))).toEqual({ stable: false, progress: 0.5, count: 1 });
    expect(s.update(quad(2))).toEqual({ stable: true, progress: 1, count: 2 });
    expect(s.update(quad(2)).progress).toBe(1);
  });

  it("restarts on movement, loss or a different shape", () => {
    const s = createStabilityTracker({ holdFrames: 2, tolerance: 0.01 });
    s.update(quad());
    s.update(quad());
    expect(s.update(quad(50)).count).toBe(0);
    s.update(quad(50));
    expect(s.update(undefined)).toEqual({ stable: false, progress: 0, count: 0 });
    s.update(quad());
    expect(s.update(quad().slice(0, 3)).count).toBe(0);
    expect(s.update([]).count).toBe(0);
  });

  it("uses a given reference size", () => {
    const s = createStabilityTracker({ holdFrames: 1, tolerance: 0.1 });
    s.update(quad(), 1000);
    expect(s.update(quad(50), 1000).stable).toBe(true);
  });

  it("uses defaults and resets", () => {
    const s = createStabilityTracker();
    for (let i = 0; i < 8; i++) s.update(quad());
    expect(s.update(quad()).stable).toBe(true);
    s.reset();
    expect(s.update(quad()).count).toBe(0);
  });

  it("holds at least one frame", () => {
    const s = createStabilityTracker({ holdFrames: 0 });
    s.update(quad());
    expect(s.update(quad()).stable).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  createEasedNumber,
  createPointsTracker,
  lerp,
  lerpPoint,
  maxDistance,
  smoothingFactor,
  spread,
} from "./smoothing";

describe("lerp", () => {
  it("interpolates numbers and points", () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
    expect(lerpPoint({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 });
  });
});

describe("smoothingFactor", () => {
  it("covers half the way in one half-life", () => {
    expect(smoothingFactor(100, 100)).toBeCloseTo(0.5);
    expect(smoothingFactor(200, 100)).toBeCloseTo(0.75);
  });

  it("is frame-rate independent", () => {
    const once = smoothingFactor(32, 80);
    const half = smoothingFactor(16, 80);
    expect(1 - (1 - half) * (1 - half)).toBeCloseTo(once);
  });

  it("snaps without a half-life and stays put without time", () => {
    expect(smoothingFactor(16, 0)).toBe(1);
    expect(smoothingFactor(0, 80)).toBe(0);
  });
});

describe("maxDistance and spread", () => {
  it("measures", () => {
    expect(
      maxDistance(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        [
          { x: 3, y: 4 },
          { x: 1, y: 1 },
        ],
      ),
    ).toBe(5);
    expect(
      spread([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ]),
    ).toBe(5);
    expect(spread([])).toBe(0);
  });
});

describe("createPointsTracker", () => {
  const box = (x: number) => [
    { x, y: 0 },
    { x: x + 100, y: 100 },
  ];

  it("returns nothing before a target", () => {
    const t = createPointsTracker();
    expect(t.step(0)).toBeUndefined();
    expect(t.settled).toBe(true);
  });

  it("snaps to the first target and fades in", () => {
    const t = createPointsTracker({ fadeMs: 100 });
    t.setTarget(box(10));
    expect(t.step(0)).toEqual({ points: box(10), opacity: 0 });
    expect(t.step(50)!.opacity).toBe(0.5);
    expect(t.step(150)!.opacity).toBe(1);
    expect(t.settled).toBe(true);
  });

  it("glides towards a nearby target", () => {
    const t = createPointsTracker({ halfLifeMs: 100, fadeMs: 0 });
    t.setTarget(box(0));
    t.step(0);
    t.step(16);
    t.setTarget(box(20));
    const shown = t.step(116)!;
    expect(shown.points[0].x).toBeCloseTo(10);
    expect(t.settled).toBe(false);
    t.step(5000);
    expect(t.settled).toBe(true);
  });

  it("snaps on a large jump or a changed point count", () => {
    const t = createPointsTracker({ fadeMs: 0 });
    t.setTarget(box(0));
    t.step(0);
    t.step(16);
    t.setTarget(box(1000));
    expect(t.step(32)!.points[0].x).toBe(1000);
    t.setTarget([...box(1000), { x: 1, y: 1 }]);
    expect(t.step(48)!.points).toHaveLength(3);
  });

  it("fades out and forgets when the target disappears", () => {
    const t = createPointsTracker({ fadeMs: 100 });
    t.setTarget(box(0));
    t.step(0);
    t.step(100);
    t.setTarget(undefined);
    expect(t.settled).toBe(false);
    expect(t.step(150)!.opacity).toBe(0.5);
    expect(t.step(250)).toBeUndefined();
    expect(t.settled).toBe(true);
    // Coming back after fading out snaps instead of gliding from the old place.
    t.setTarget(box(30));
    expect(t.step(260)!.points[0].x).toBe(30);
  });

  it("snaps again when re-targeted while hidden", () => {
    const t = createPointsTracker({ fadeMs: 100 });
    t.setTarget(box(0));
    t.step(0);
    t.setTarget(box(5));
    expect(t.step(0)!.points[0].x).toBe(5);
  });

  it("supports instant fades", () => {
    const t = createPointsTracker({ fadeMs: 0 });
    t.setTarget(box(0));
    expect(t.step(0)!.opacity).toBe(1);
    t.setTarget(undefined);
    expect(t.step(1)).toBeUndefined();
  });

  it("resets", () => {
    const t = createPointsTracker();
    t.setTarget(box(0));
    t.step(0);
    t.reset();
    expect(t.step(10)).toBeUndefined();
  });
});

describe("createPointsTracker with holdMs", () => {
  const box = (x: number) => [
    { x, y: 0 },
    { x: x + 100, y: 100 },
  ];

  it("freezes through a brief gap, then fades", () => {
    const t = createPointsTracker({ fadeMs: 100, holdMs: 300 });
    t.setTarget(box(0));
    t.step(0);
    t.step(100);
    t.setTarget(undefined);
    t.setTarget(undefined);
    expect(t.step(200)).toEqual({ points: box(0), opacity: 1 });
    expect(t.settled).toBe(true);
    expect(t.step(400)!.opacity).toBe(1);
    expect(t.step(450)!.opacity).toBe(0.5);
    expect(t.step(600)).toBeUndefined();
  });

  it("glides on when the target comes back during the gap", () => {
    const t = createPointsTracker({ fadeMs: 0, halfLifeMs: 100, holdMs: 300 });
    t.setTarget(box(0));
    t.step(0);
    t.setTarget(undefined);
    t.step(100);
    t.setTarget(box(20));
    expect(t.step(200)!.points[0].x).toBeCloseTo(10);
    // A second loss starts a fresh hold.
    t.setTarget(undefined);
    t.step(250);
    expect(t.step(500)!.opacity).toBe(1);
  });
});

describe("createEasedNumber", () => {
  it("eases towards the target and settles", () => {
    const n = createEasedNumber({ halfLifeMs: 100 });
    n.set(1);
    expect(n.target).toBe(1);
    expect(n.step(0)).toBe(0);
    expect(n.step(100)).toBeCloseTo(0.5);
    expect(n.step(10_000)).toBe(1);
  });

  it("snaps, and snaps on a zero half-life", () => {
    const n = createEasedNumber({ initial: 0.2 });
    n.snap(0.8);
    expect(n.step(0)).toBe(0.8);
    const instant = createEasedNumber({ halfLifeMs: 0 });
    instant.set(0.4);
    expect(instant.step(5)).toBe(0.4);
  });

  it("drains with its own half-life", () => {
    const n = createEasedNumber({ halfLifeMs: 100, fallHalfLifeMs: 400, initial: 1 });
    n.set(0);
    n.step(0);
    expect(n.step(400)).toBeCloseTo(0.5);
  });

  it("uses defaults", () => {
    const n = createEasedNumber();
    n.set(1);
    n.step(0);
    expect(n.step(150)).toBeCloseTo(0.5);
  });
});

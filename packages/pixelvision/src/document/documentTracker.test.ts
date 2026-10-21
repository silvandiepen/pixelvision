import { describe, expect, it } from "vitest";
import type { Quad } from "./document.model";
import { createDocumentTracker } from "./documentTracker";

/** A 400×300 page at (x, y), each corner nudged by `wobble`. */
const page = (x = 100, y = 80, wobble = 0): Quad => [
  { x: x + wobble, y: y - wobble },
  { x: x + 400 - wobble, y: y + wobble },
  { x: x + 400 + wobble, y: y + 300 - wobble },
  { x: x - wobble, y: y + 300 + wobble },
];

describe("createDocumentTracker", () => {
  it("starts searching and follows a page to steady", () => {
    const tracker = createDocumentTracker({ holdFrames: 4 });
    expect(tracker.state).toEqual({ status: "searching", corners: null, progress: 0 });

    expect(tracker.update(page()).status).toBe("tracking");
    const progress: number[] = [];
    for (let i = 0; i < 4; i++) progress.push(tracker.update(page()).progress);

    expect(progress).toEqual([0.25, 0.5, 0.75, 1]);
    expect(tracker.state.status).toBe("steady");
    expect(tracker.state.corners).toEqual(page());
  });

  it("reaches steady with a hand's few-pixel wobble", () => {
    const tracker = createDocumentTracker();
    let frames = 0;
    while (tracker.state.status !== "steady" && frames < 30) {
      tracker.update(page(100, 80, [3, -4, 2, -3, 5, -2][frames % 6]));
      frames++;
    }

    expect(tracker.state.status).toBe("steady");
    expect(frames).toBeLessThan(15);
  });

  it("ignores one stray detection and keeps the outline", () => {
    const tracker = createDocumentTracker({ holdFrames: 4 });
    for (let i = 0; i < 3; i++) tracker.update(page());
    const before = tracker.state;

    const after = tracker.update(page(300, 200));

    expect(after.corners).toEqual(before.corners);
    expect(after.progress).toBe(before.progress);
    // Back at the page, the stray one is forgotten.
    tracker.update(page());
    expect(tracker.state.progress).toBeGreaterThan(before.progress);
  });

  it("moves to a new place once it repeats", () => {
    const tracker = createDocumentTracker({ confirmFrames: 3 });
    for (let i = 0; i < 4; i++) tracker.update(page());

    tracker.update(page(300, 200));
    tracker.update(page(300, 200));
    expect(tracker.state.corners).toEqual(page());

    const moved = tracker.update(page(300, 200));
    expect(moved.corners).toEqual(page(300, 200));
    expect(moved.progress).toBe(0);
  });

  it("restarts the confirmation when stray detections disagree", () => {
    const tracker = createDocumentTracker({ confirmFrames: 2 });
    tracker.update(page());

    tracker.update(page(300, 200));
    tracker.update(page(0, 400));
    expect(tracker.state.corners).toEqual(page());

    tracker.update(page(0, 400));
    expect(tracker.state.corners).toEqual(page(0, 400));
  });

  it("loses steadiness quickly on a real move", () => {
    const tracker = createDocumentTracker({ holdFrames: 4, jump: 1 });
    for (let i = 0; i < 5; i++) tracker.update(page());
    expect(tracker.state.progress).toBe(1);

    tracker.update(page(160, 80));
    tracker.update(page(220, 80));
    tracker.update(page(280, 80));

    expect(tracker.state.progress).toBe(0);
  });

  it("keeps the outline through a few misses, then searches again", () => {
    const tracker = createDocumentTracker({ holdFrames: 4, maxMisses: 2 });
    for (let i = 0; i < 3; i++) tracker.update(page());
    const held = tracker.state.progress;

    expect(tracker.update(null)).toMatchObject({ corners: page(), progress: held });
    expect(tracker.update(null).status).toBe("tracking");
    expect(tracker.update(null)).toEqual({ status: "searching", corners: null, progress: 0 });
  });

  it("searches while nothing is found and starts over on reset", () => {
    const tracker = createDocumentTracker();
    expect(tracker.update(null).status).toBe("searching");

    tracker.update(page());
    tracker.reset();

    expect(tracker.state).toEqual({ status: "searching", corners: null, progress: 0 });
  });

  it("rejects counts and fractions that can't work", () => {
    expect(() => createDocumentTracker({ holdFrames: 0 })).toThrow(RangeError);
    expect(() => createDocumentTracker({ windowFrames: 1.5 })).toThrow(RangeError);
    expect(() => createDocumentTracker({ tolerance: 0 })).toThrow(RangeError);
    expect(() => createDocumentTracker({ jump: Number.NaN })).toThrow(RangeError);
  });
});

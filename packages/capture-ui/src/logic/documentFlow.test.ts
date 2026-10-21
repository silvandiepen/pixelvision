import { describe, expect, it } from "vitest";
import type { Quad } from "pixelvision";
import {
  A4_ASPECT,
  ID_CARD_ASPECT,
  createDocumentFlow,
  defaultQuad,
  moveCorner,
  parseAspect,
  resolveAspect,
  scaleQuad,
} from "./documentFlow";

const rect = (w: number, h: number): Quad => [
  { x: 0, y: 0 },
  { x: w, y: 0 },
  { x: w, y: h },
  { x: 0, y: h },
];

describe("createDocumentFlow", () => {
  it("searches, holds and gets ready", () => {
    const flow = createDocumentFlow({ holdFrames: 2 });
    expect(flow.update(undefined)).toEqual({
      phase: "searching",
      progress: 0,
      message: "docSearching",
    });
    expect(flow.update(rect(100, 60))).toMatchObject({
      phase: "holding",
      progress: 0,
      message: "docHoldStill",
    });
    expect(flow.update(rect(100, 60)).progress).toBe(0.5);
    expect(flow.update(rect(100, 60))).toMatchObject({
      phase: "ready",
      progress: 1,
      message: "docFound",
    });
    flow.reset();
    expect(flow.update(rect(100, 60)).progress).toBe(0);
  });

  it("uses defaults", () => {
    const flow = createDocumentFlow();
    let state = flow.update(rect(10, 10));
    for (let i = 0; i < 8; i++) state = flow.update(rect(10, 10));
    expect(state.phase).toBe("ready");
  });
});

describe("resolveAspect", () => {
  it("keeps auto", () => {
    expect(resolveAspect("auto", rect(100, 60))).toBeUndefined();
  });

  it("follows the document's orientation", () => {
    expect(resolveAspect("id-card", rect(100, 60))).toBeCloseTo(ID_CARD_ASPECT);
    expect(resolveAspect("id-card", rect(60, 100))).toBeCloseTo(1 / ID_CARD_ASPECT);
    expect(resolveAspect("a4", rect(60, 100))).toBeCloseTo(A4_ASPECT);
    expect(resolveAspect("a4", rect(100, 60))).toBeCloseTo(1 / A4_ASPECT);
  });
});

describe("quad helpers", () => {
  it("scales", () => {
    expect(scaleQuad(rect(10, 20), 2)).toEqual(rect(20, 40));
  });

  it("moves a corner inside the image without changing the input", () => {
    const q = rect(10, 10);
    const moved = moveCorner(q, 2, { x: 50, y: -5 }, 20, 20);
    expect(moved[2]).toEqual({ x: 20, y: 0 });
    expect(q[2]).toEqual({ x: 10, y: 10 });
    expect(moveCorner(q, 0, { x: -3, y: 30 }, 20, 20)[0]).toEqual({ x: 0, y: 20 });
  });

  it("makes an inset default quad", () => {
    expect(defaultQuad(100, 50)).toEqual([
      { x: 10, y: 5 },
      { x: 90, y: 5 },
      { x: 90, y: 45 },
      { x: 10, y: 45 },
    ]);
    expect(defaultQuad(100, 100, 0)[2]).toEqual({ x: 100, y: 100 });
  });

  it("parses aspect presets", () => {
    expect(parseAspect("id-card")).toBe("id-card");
    expect(parseAspect("a4")).toBe("a4");
    expect(parseAspect("letter")).toBe("auto");
    expect(parseAspect(null)).toBe("auto");
  });
});

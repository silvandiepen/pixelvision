import { describe, expect, it } from "vitest";
import { followFace, observedFaces, selectMainFace } from "./faces";
import { guideFor } from "./geometry";
import type { Box } from "./geometry.model";

// A 480 x 360 view: the guide's centre is at (240, 158.4).
const guide = guideFor(480, 360);

/**
 * A face box around a centre.
 *
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param width - Width; the height is 1.2 times it.
 * @returns The box.
 */
const face = (cx: number, cy: number, width: number): Box => ({
  x: cx - width / 2,
  y: cy - width * 0.6,
  width,
  height: width * 1.2,
});

describe("observedFaces", () => {
  it("puts the source's own face first, once", () => {
    const own = face(240, 160, 100);
    const other = face(400, 160, 90);
    expect(observedFaces({ pose: "frontal", box: own, faces: [other, { ...own }] })).toEqual([
      own,
      other,
    ]);
  });

  it("lists the box alone, or the faces alone", () => {
    const own = face(240, 160, 100);
    expect(observedFaces({ pose: "frontal", box: own })).toEqual([own]);
    expect(observedFaces({ pose: "none", faces: [own] })).toEqual([own]);
    expect(observedFaces({ pose: "none" })).toEqual([]);
  });
});

describe("selectMainFace", () => {
  it("has no main face without faces", () => {
    expect(selectMainFace([], guide)).toEqual({ index: -1, count: 0 });
  });

  it("follows a lone face wherever it is", () => {
    expect(selectMainFace([face(60, 60, 50)], guide)).toEqual({ index: 0, count: 1 });
  });

  it("counts two people of similar size, and follows the one nearest the guide", () => {
    const faces = [face(100, 160, 120), face(260, 170, 110)];
    expect(selectMainFace(faces, guide)).toEqual({ index: 1, count: 2 });
  });

  it("ignores a face under 40% of the largest one's width", () => {
    // The small face is nearer the centre, but too small to be a second person.
    const faces = [face(330, 170, 150), face(240, 150, 55)];
    expect(selectMainFace(faces, guide)).toEqual({ index: 0, count: 1 });
    expect(selectMainFace([face(330, 170, 150), face(240, 150, 60)], guide)).toEqual({
      index: 1,
      count: 2,
    });
  });

  it("takes the ratio from its options, kept between 0 and 1", () => {
    const faces = [face(330, 170, 150), face(240, 150, 20)];
    expect(selectMainFace(faces, guide, { ratio: 0 })).toEqual({ index: 1, count: 2 });
    expect(selectMainFace(faces, guide, { ratio: -1 })).toEqual({ index: 1, count: 2 });
    const similar = [face(330, 170, 150), face(240, 150, 140)];
    expect(selectMainFace(similar, guide, { ratio: 1 })).toEqual({ index: 0, count: 1 });
    expect(selectMainFace(similar, guide, { ratio: 5 })).toEqual({ index: 0, count: 1 });
  });

  it("prefers the first face on a tie", () => {
    const faces = [face(200, 158.4, 100), face(280, 158.4, 100)];
    expect(selectMainFace(faces, guide)).toEqual({ index: 0, count: 2 });
  });
});

describe("followFace", () => {
  const toView = (b: Box): Box => ({ ...b, x: b.x * 2, y: b.y * 2 });

  it("follows the source's own face, mapped to the view", () => {
    const own = face(120, 80, 60);
    expect(followFace({ pose: "frontal", box: own }, { guide, toView })).toEqual({
      box: own,
      viewBox: toView(own),
      count: 1,
      own: true,
    });
  });

  it("follows another face nearer the guide, without the source's pose", () => {
    const own = face(40, 80, 60);
    const other = face(120, 80, 60);
    expect(
      followFace({ pose: "frontal", box: own, faces: [own, other] }, { guide, toView }),
    ).toEqual({ box: other, viewBox: toView(other), count: 2, own: false });
  });

  it("passes the ratio on", () => {
    const own = face(120, 80, 60);
    const small = face(200, 40, 10);
    const observation = { pose: "frontal" as const, box: own, faces: [own, small] };
    expect(followFace(observation, { guide, toView }).count).toBe(1);
    expect(followFace(observation, { guide, toView, ratio: 0 }).count).toBe(2);
  });

  it("reports faces without a box as not the source's own, and nothing without faces", () => {
    const other = face(120, 80, 60);
    expect(followFace({ pose: "none", faces: [other] }, { guide, toView }).own).toBe(false);
    expect(followFace({ pose: "none" }, { guide, toView })).toEqual({ count: 0, own: false });
  });
});

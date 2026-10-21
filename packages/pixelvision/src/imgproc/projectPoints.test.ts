import { describe, expect, it } from "vitest";
import { projectCameraPoint, projectPoints, readIntrinsics } from "./projectPoints";

const camera = [800, 0, 320, 0, 780, 240, 0, 0, 1];

describe("projectPoints", () => {
  it("projects with the pinhole model: focal length times x / z, plus the centre", () => {
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 5 },
    ];
    expect(projectPoints(points, [0, 0, 0], [0, 0, 5], camera)).toEqual([
      { x: 320, y: 240 },
      { x: 480, y: 240 },
      { x: 320, y: 240 - 78 },
    ]);
  });

  it("rotates before translating", () => {
    // A quarter turn about z sends (1, 0, 0) to (0, 1, 0).
    const [p] = projectPoints([{ x: 1, y: 0, z: 0 }], [0, 0, Math.PI / 2], [0, 0, 4], camera);
    expect(p.x).toBeCloseTo(320, 10);
    expect(p.y).toBeCloseTo(240 + 780 / 4, 10);
  });

  it("applies radial distortion", () => {
    // At x / z = 0.5: r² = 0.25, factor 1 + 0.1 · 0.25 + 0.01 · 0.0625.
    const [p] = projectPoints([{ x: 1, y: 0, z: 0 }], [0, 0, 0], [0, 0, 2], camera, {
      distortion: { k1: 0.1, k2: 0.01 },
    });
    expect(p.x).toBeCloseTo(320 + 800 * 0.5 * (1 + 0.025 + 0.000625), 10);
    const [q] = projectPoints([{ x: 1, y: 0, z: 0 }], [0, 0, 0], [0, 0, 2], camera, {
      distortion: { k1: 0.1 },
    });
    expect(q.x).toBeCloseTo(320 + 800 * 0.5 * 1.025, 10);
  });

  it("computes the Jacobian of a camera-space point", () => {
    const intrinsics = readIntrinsics("test", camera, { k1: -0.2, k2: 0.05 });
    const jacobian = new Float64Array(6);
    const at = [0.3, -0.4, 2.5];
    projectCameraPoint(intrinsics, at[0], at[1], at[2], jacobian);
    const h = 1e-6;
    for (let k = 0; k < 3; k++) {
      const plus = [...at];
      const minus = [...at];
      plus[k] += h;
      minus[k] -= h;
      const a = projectCameraPoint(intrinsics, plus[0], plus[1], plus[2]);
      const b = projectCameraPoint(intrinsics, minus[0], minus[1], minus[2]);
      expect(jacobian[k]).toBeCloseTo((a.x - b.x) / (2 * h), 5);
      expect(jacobian[3 + k]).toBeCloseTo((a.y - b.y) / (2 * h), 5);
    }
  });

  it("rejects an invalid camera", () => {
    const p = [{ x: 0, y: 0, z: 1 }];
    expect(() => projectPoints(p, [0, 0, 0], [0, 0, 1], [1, 0, 0])).toThrow(RangeError);
    expect(() => projectPoints(p, [0, 0, 0], [0, 0, 1], [0, 0, 0, 0, 1, 0, 0, 0, 1])).toThrow(
      RangeError,
    );
    expect(() => projectPoints(p, [0, 0, 0], [0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 1])).toThrow(
      RangeError,
    );
    expect(() =>
      projectPoints(p, [0, 0, 0], [0, 0, 1], camera, { distortion: { k1: Number.NaN } }),
    ).toThrow(RangeError);
  });
});

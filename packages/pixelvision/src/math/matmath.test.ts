import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import {
  determinant3x3,
  identity,
  invert3x3,
  matrixFromRows,
  matrixToRows,
  multiply,
  transpose,
} from "./matmath";

const a = matrixFromRows([
  [1, 2, 3],
  [4, 5, 6],
]);

describe("matrixFromRows / matrixToRows", () => {
  it("round-trips rows", () => {
    expect(a).toMatchObject({ type: "f64", width: 3, height: 2 });
    expect(matrixToRows(a)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(matrixToRows(matrixFromRows([]))).toEqual([]);
  });

  it("rejects ragged rows", () => {
    expect(() => matrixFromRows([[1, 2], [3]])).toThrow(RangeError);
  });
});

describe("identity", () => {
  it("puts the value on the diagonal", () => {
    expect(matrixToRows(identity(2))).toEqual([
      [1, 0],
      [0, 1],
    ]);
    expect(matrixToRows(identity(2, 5))).toEqual([
      [5, 0],
      [0, 5],
    ]);
  });
});

describe("transpose", () => {
  it("swaps rows and columns", () => {
    expect(matrixToRows(transpose(a))).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });
});

describe("multiply", () => {
  const b = matrixFromRows([
    [1, 0],
    [0, 1],
    [2, 2],
  ]);

  it("multiplies", () => {
    expect(matrixToRows(multiply(a, b))).toEqual([
      [7, 8],
      [16, 17],
    ]);
  });

  it("uses transposes without copying them", () => {
    expect(matrixToRows(multiply(a, a, { transposeB: true }))).toEqual([
      [14, 32],
      [32, 77],
    ]);
    expect(matrixToRows(multiply(a, a, { transposeA: true }))).toEqual([
      [17, 22, 27],
      [22, 29, 36],
      [27, 36, 45],
    ]);
    expect(matrixToRows(multiply(b, a, { transposeA: true, transposeB: true }))).toEqual(
      matrixToRows(transpose(multiply(a, b))),
    );
  });

  it("accepts f32 matrices", () => {
    const single = createMatrix(1, 1, { type: "f32", data: new Float32Array([3]) });

    expect(matrixToRows(multiply(single, single))).toEqual([[9]]);
  });

  it("rejects mismatched sizes", () => {
    expect(() => multiply(a, a)).toThrow(/inner dimensions/);
  });
});

describe("3x3 helpers", () => {
  const m = matrixFromRows([
    [2, 0, 1],
    [1, 3, 0],
    [0, 1, 4],
  ]);

  it("computes the determinant", () => {
    expect(determinant3x3(m)).toBe(25);
  });

  it("inverts so that M · M⁻¹ = I", () => {
    const product = matrixToRows(multiply(m, invert3x3(m)));

    product.forEach((row, i) =>
      row.forEach((value, j) => expect(value).toBeCloseTo(i === j ? 1 : 0, 12)),
    );
  });

  it("rejects singular and non-3x3 matrices", () => {
    const singular = matrixFromRows([
      [1, 2, 3],
      [2, 4, 6],
      [0, 1, 1],
    ]);
    expect(() => invert3x3(singular)).toThrow(/singular/);
    expect(() => determinant3x3(a)).toThrow(/3x3/);
  });
});

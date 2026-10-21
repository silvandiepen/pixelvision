import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { choleskySolve, eigenSymmetric, luSolve, pseudoInverse, svd, svdSolve } from "./linalg";
import { matrixFromRows, matrixToRows, multiply, transpose } from "./matmath";

const close = (actual: ArrayLike<number>, expected: number[], digits = 9) =>
  expected.forEach((value, i) => expect(actual[i]).toBeCloseTo(value, digits));

describe("luSolve", () => {
  it("solves a square system without modifying the inputs", () => {
    const a = matrixFromRows([
      [0, 2],
      [1, 3],
    ]);
    const b = [4, 5];

    close(luSolve(a, b), [-1, 2]);
    expect(matrixToRows(a)).toEqual([
      [0, 2],
      [1, 3],
    ]);
    expect(b).toEqual([4, 5]);
  });

  it("solves a larger system that needs no row swaps", () => {
    const a = matrixFromRows([
      [10, 1, 2],
      [1, 8, 1],
      [2, 1, 9],
    ]);
    const x = [1, -2, 3];
    const b = Array.from(multiply(a, matrixFromRows(x.map((v) => [v]))).data);

    close(luSolve(a, b), x);
  });

  it("rejects singular and mismatched systems", () => {
    expect(() =>
      luSolve(
        matrixFromRows([
          [1, 2],
          [2, 4],
        ]),
        [1, 2],
      ),
    ).toThrow(/singular/);
    expect(() => luSolve(matrixFromRows([[1, 2]]), [1])).toThrow(/square/);
    expect(() => luSolve(matrixFromRows([[1]]), [1, 2])).toThrow(/b has/);
  });
});

describe("choleskySolve", () => {
  it("solves a positive-definite system", () => {
    close(
      choleskySolve(
        matrixFromRows([
          [4, 2],
          [2, 3],
        ]),
        [2, 1],
      ),
      [0.5, 0],
    );
  });

  it("rejects matrices that aren't positive-definite", () => {
    expect(() =>
      choleskySolve(
        matrixFromRows([
          [1, 2],
          [2, 1],
        ]),
        [1, 1],
      ),
    ).toThrow(/positive-definite/);
    expect(() =>
      choleskySolve(
        matrixFromRows([
          [0, 0],
          [0, 1],
        ]),
        [1, 1],
      ),
    ).toThrow(/positive-definite/);
  });
});

describe("svd", () => {
  const reconstruct = (a: ReturnType<typeof matrixFromRows>) => {
    const { values, u, v } = svd(a);
    const sigma = createMatrix(a.width, a.height, { type: "f64" });
    values.forEach((value, i) => (sigma.data[i * a.width + i] = value));
    return multiply(multiply(u, sigma), v, { transposeB: true });
  };
  const orthonormal = (m: ReturnType<typeof matrixFromRows>) => {
    const product = matrixToRows(multiply(m, m, { transposeA: true }));
    product.forEach((row, i) =>
      row.forEach((value, j) => expect(value).toBeCloseTo(i === j ? 1 : 0, 9)),
    );
  };

  it.each([
    [
      "tall",
      [
        [3, 0],
        [0, -2],
        [0, 0],
      ],
    ],
    [
      "wide",
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
    ],
    [
      "square",
      [
        [2, 1],
        [1, 2],
      ],
    ],
    [
      "rank-deficient",
      [
        [1, 2],
        [2, 4],
        [3, 6],
      ],
    ],
    [
      "zero",
      [
        [0, 0],
        [0, 0],
      ],
    ],
  ])("reconstructs a %s matrix with orthonormal U and V", (_, rows) => {
    const a = matrixFromRows(rows as number[][]);
    const { u, v, values } = svd(a);

    close(reconstruct(a).data, Array.from(a.data));
    orthonormal(u);
    orthonormal(v);
    expect([...values]).toEqual([...values].sort((x, y) => y - x));
  });

  it("sorts singular values that come out of order", () => {
    // Orthogonal columns need no rotation, so only the sort reorders them.
    close(
      svd(
        matrixFromRows([
          [1, 0],
          [0, 3],
        ]),
      ).values,
      [3, 1],
    );
  });

  it("finds known singular values", () => {
    close(
      svd(
        matrixFromRows([
          [3, 0],
          [0, -2],
          [0, 0],
        ]),
      ).values,
      [3, 2],
    );
  });

  it("completes U for a tall matrix with a large null space", () => {
    const tall = matrixFromRows(Array.from({ length: 80 }, (_, i) => [i % 3, 1]));

    orthonormal(svd(tall).u);
  });

  it("handles an empty matrix", () => {
    expect(svd(matrixFromRows([])).values.length).toBe(0);
  });
});

describe("svdSolve and pseudoInverse", () => {
  it("fits an overdetermined system exactly when it's consistent", () => {
    // jsfeat returned [-0.144, 1.050] here.
    const a = matrixFromRows([
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ]);

    close(svdSolve(a, [2, -1, 1, 3]), [2, -1]);
  });

  it("fits a least-squares line", () => {
    // y = 1 + 2x plus noise [+0.5, -0.5, -0.5, +0.5], which sums to zero and
    // is uncorrelated with x, so the best fit is exactly (1, 2).
    const a = matrixFromRows([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ]);

    close(svdSolve(a, [1.5, 2.5, 4.5, 7.5]), [1, 2]);
  });

  it("returns the minimum-norm solution of an underdetermined system", () => {
    close(svdSolve(matrixFromRows([[1, 1]]), [2]), [1, 1]);
  });

  it("satisfies A · A⁺ · A = A", () => {
    const a = matrixFromRows([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);

    close(multiply(multiply(a, pseudoInverse(a)), a).data, Array.from(a.data));
  });

  it("handles an empty matrix", () => {
    expect(pseudoInverse(matrixFromRows([])).data.length).toBe(0);
  });

  it("ignores zero singular values", () => {
    close(
      pseudoInverse(
        matrixFromRows([
          [0, 0],
          [0, 0],
        ]),
      ).data,
      [0, 0, 0, 0],
    );
  });

  it("rejects a right-hand side of the wrong length", () => {
    expect(() => svdSolve(matrixFromRows([[1, 0]]), [1, 2])).toThrow(/b has/);
  });
});

describe("eigenSymmetric", () => {
  it("finds eigenvalues largest first with matching eigenvectors", () => {
    const a = matrixFromRows([
      [2, 1, 0],
      [1, 2, 0],
      [0, 0, 5],
    ]);

    const { values, vectors } = eigenSymmetric(a);

    close(values, [5, 3, 1]);
    // A · v = λ · v for every row v.
    const av = multiply(a, vectors, { transposeB: true });
    for (let i = 0; i < 3; i++) {
      for (let r = 0; r < 3; r++)
        expect(av.data[r * 3 + i]).toBeCloseTo(values[i] * vectors.data[i * 3 + r], 9);
    }
    // Eigenvectors are orthonormal.
    close(multiply(vectors, transpose(vectors)).data, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });

  it("diagonalises a larger random symmetric matrix", () => {
    let seed = 7;
    const next = () => ((seed = (seed * 48271) % 2147483647) / 2147483647) * 10 - 5;
    const n = 6;
    const rows = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) rows[i][j] = rows[j][i] = next();
    }
    const a = matrixFromRows(rows);

    const { values, vectors } = eigenSymmetric(a);

    expect([...values]).toEqual([...values].sort((x, y) => y - x));
    const av = multiply(a, vectors, { transposeB: true });
    for (let i = 0; i < n; i++) {
      for (let r = 0; r < n; r++) {
        expect(av.data[r * n + i]).toBeCloseTo(values[i] * vectors.data[i * n + r], 8);
      }
    }
  });

  it("handles 1x1 and diagonal matrices", () => {
    close(eigenSymmetric(matrixFromRows([[7]])).values, [7]);
    close(
      eigenSymmetric(
        matrixFromRows([
          [1, 0],
          [0, 4],
        ]),
      ).values,
      [4, 1],
    );
  });

  it("rejects non-square matrices", () => {
    expect(() => eigenSymmetric(matrixFromRows([[1, 2]]))).toThrow(/square/);
  });
});

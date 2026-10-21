import { describe, expect, it } from "vitest";
import { cloneMatrix, createMatrix, prepareOutput } from "./matrix";

describe("createMatrix", () => {
  it("creates a zero-filled single-channel u8 matrix by default", () => {
    const matrix = createMatrix(3, 2);

    expect(matrix).toMatchObject({ type: "u8", width: 3, height: 2, channels: 1 });
    expect(matrix.data).toBeInstanceOf(Uint8Array);
    expect(Array.from(matrix.data)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it.each([
    ["u8", Uint8Array],
    ["i32", Int32Array],
    ["f32", Float32Array],
    ["f64", Float64Array],
  ] as const)("backs %s with the matching typed array", (type, constructor) => {
    const matrix = createMatrix(2, 2, { type, channels: 2 });

    expect(matrix.data).toBeInstanceOf(constructor);
    expect(matrix.data.length).toBe(8);
  });

  it("wraps given storage without copying", () => {
    const data = new Uint8Array([1, 2, 3, 4]);

    const matrix = createMatrix(2, 2, { data });

    expect(matrix.data).toBe(data);
  });

  it("allows an empty matrix", () => {
    expect(createMatrix(0, 0).data.length).toBe(0);
  });

  it.each([
    [-1, 1, 1, "width"],
    [1, 1.5, 1, "height"],
    [1, 1, Number.NaN, "channels"],
  ])("rejects an invalid size (%s x %s x %s)", (width, height, channels, name) => {
    expect(() => createMatrix(width, height, { channels })).toThrow(new RegExp(name));
  });

  it("rejects storage that is too short", () => {
    expect(() => createMatrix(2, 2, { data: new Uint8Array(3) })).toThrow(RangeError);
  });
});

describe("cloneMatrix", () => {
  it("copies values into new storage of the used length", () => {
    const source = createMatrix(2, 1, { data: new Uint8Array([7, 8, 9]) });

    const copy = cloneMatrix(source);
    source.data[0] = 0;

    expect(Array.from(copy.data)).toEqual([7, 8]);
    expect(copy).toMatchObject({ type: "u8", width: 2, height: 1, channels: 1 });
  });
});

describe("prepareOutput", () => {
  it("creates a matrix when none is given", () => {
    expect(prepareOutput(undefined, "f32", 2, 3, 2)).toMatchObject({
      type: "f32",
      width: 2,
      height: 3,
      channels: 2,
    });
  });

  it("reuses storage that is large enough", () => {
    const out = createMatrix(4, 4);
    const storage = out.data;

    const result = prepareOutput(out, "u8", 2, 2, 1);

    expect(result).toBe(out);
    expect(result.data).toBe(storage);
    expect(result).toMatchObject({ width: 2, height: 2, channels: 1 });
  });

  it("grows storage that is too small", () => {
    const out = createMatrix(1, 1);

    prepareOutput(out, "u8", 3, 3, 2);

    expect(out.data.length).toBe(18);
  });

  it("rejects a matrix of another element type", () => {
    expect(() => prepareOutput(createMatrix(1, 1, { type: "f32" }), "u8", 1, 1, 1)).toThrow(
      TypeError,
    );
  });
});

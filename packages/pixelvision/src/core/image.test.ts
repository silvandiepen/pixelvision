import { describe, expect, it } from "vitest";
import { createMatrix } from "./matrix";
import { fromImageData, toImageData } from "./image";

describe("fromImageData", () => {
  it("copies RGBA pixels into a 4-channel matrix", () => {
    const data = new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8]);

    const matrix = fromImageData({ width: 2, height: 1, data });
    data[0] = 99;

    expect(matrix).toMatchObject({ type: "u8", width: 2, height: 1, channels: 4 });
    expect(Array.from(matrix.data)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("rejects data that is too short", () => {
    expect(() => fromImageData({ width: 2, height: 2, data: new Uint8Array(15) })).toThrow(
      RangeError,
    );
  });
});

describe("toImageData", () => {
  it("spreads gray over RGB with opaque alpha", () => {
    const gray = createMatrix(2, 1, { data: new Uint8Array([10, 200]) });

    expect(Array.from(toImageData(gray).data)).toEqual([10, 10, 10, 255, 200, 200, 200, 255]);
  });

  it("keeps RGB and adds opaque alpha", () => {
    const rgb = createMatrix(1, 1, { channels: 3, data: new Uint8Array([1, 2, 3]) });

    expect(Array.from(toImageData(rgb).data)).toEqual([1, 2, 3, 255]);
  });

  it("keeps RGBA as is", () => {
    const rgba = createMatrix(1, 1, { channels: 4, data: new Uint8Array([1, 2, 3, 4]) });

    const image = toImageData(rgba);

    expect(image).toMatchObject({ width: 1, height: 1 });
    expect(image.data).toBeInstanceOf(Uint8ClampedArray);
    expect(Array.from(image.data)).toEqual([1, 2, 3, 4]);
  });

  it("rejects other channel counts", () => {
    expect(() => toImageData(createMatrix(1, 1, { channels: 2 }))).toThrow(RangeError);
  });
});

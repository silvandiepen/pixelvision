import { describe, expect, it } from "vitest";
import { INPUT_SIZE } from "./decode";
import { FaceNeuralError } from "./errors";
import { letterbox } from "./preprocess";

describe("letterbox", () => {
  const area = INPUT_SIZE * INPUT_SIZE;

  it("scales to fit, converts RGB to BGR planes and pads with 0", () => {
    const rgba = {
      width: 2,
      height: 1,
      data: Uint8ClampedArray.of(10, 20, 30, 255, 10, 20, 30, 255),
    };

    const { data, scale } = letterbox(rgba);

    expect(scale).toBe(320);
    // Inside the image: B, G, R planes.
    expect([data[0], data[area], data[2 * area]]).toEqual([30, 20, 10]);
    // Below the image (row 400): padding.
    expect(data[400 * INPUT_SIZE]).toBe(0);
  });

  it("reads gray and RGB matrices", () => {
    const gray = { width: 1, height: 1, channels: 1, data: [77] };
    const rgb = { width: 1, height: 1, channels: 3, data: [1, 2, 3] };

    expect(letterbox(gray).data[area]).toBe(77);
    expect(letterbox(rgb).data[0]).toBe(3);
  });

  it("interpolates between pixels", () => {
    const ramp = { width: 2, height: 2, channels: 1, data: [0, 100, 0, 100] };

    const { data } = letterbox(ramp);

    expect(data[160]).toBeGreaterThan(0);
    expect(data[160]).toBeLessThan(100);
  });

  it.each([
    ["a zero width", { width: 0, height: 1, data: [] }],
    ["a negative height", { width: 1, height: -1, data: [0, 0, 0, 0] }],
    ["a NaN width", { width: NaN, height: 1, data: [0, 0, 0, 0] }],
    ["an infinite height", { width: 1, height: Infinity, data: [0, 0, 0, 0] }],
    ["a fractional width", { width: 1.5, height: 1, data: [0, 0, 0, 0, 0, 0, 0, 0] }],
  ])("rejects %s", (_, image) => {
    expect(() => letterbox(image)).toThrow(/positive integers/);
  });

  it.each([0, 2, 5, NaN])("rejects %s channels", (channels) => {
    const image = { width: 1, height: 1, channels, data: new Array(8).fill(0) };

    expect(() => letterbox(image)).toThrow(/1, 3 or 4 channels/);
  });

  it("rejects a buffer shorter than the sizes say, or none", () => {
    const short = { width: 2, height: 2, data: new Uint8ClampedArray(15) };
    const missing = { width: 1, height: 1, data: undefined as unknown as number[] };

    expect(() => letterbox(short)).toThrow(/needs 16 values, got 15/);
    expect(() => letterbox(missing)).toThrow(/needs 4 values, got none/);
  });

  it("throws a typed error", () => {
    let caught: unknown;
    try {
      letterbox({ width: 1, height: 1, channels: 2, data: [0, 0] });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(FaceNeuralError);
    expect(caught).toMatchObject({ name: "FaceNeuralError", code: "invalid-image" });
  });
});

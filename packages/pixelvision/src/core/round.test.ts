import { describe, expect, it } from "vitest";
import { roundHalfEven, saturateU8 } from "./round";

describe("roundHalfEven", () => {
  it("sends halves to the even neighbour and everything else to the nearest", () => {
    expect([0.5, 1.5, 2.5, 3.5, -0.5, -1.5, -2.5].map(roundHalfEven)).toEqual([
      0, 2, 2, 4, -0, -2, -2,
    ]);
    expect([1.2, 1.7, -1.2, -1.7].map(roundHalfEven)).toEqual([1, 2, -1, -2]);
  });
});

describe("saturateU8", () => {
  it("rounds half to even and clamps to a byte", () => {
    expect([-3, 0, 127.5, 128.5, 254.6, 300].map(saturateU8)).toEqual([0, 0, 128, 128, 255, 255]);
  });
});

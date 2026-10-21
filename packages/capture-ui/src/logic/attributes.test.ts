import { describe, expect, it } from "vitest";
import { parseBoolean, parseNumber, parseRatio, parseShape } from "./attributes";

describe("parseBoolean", () => {
  it("reads on and off values", () => {
    for (const v of ["", "true", "on", "1", "yes", "anything"])
      expect(parseBoolean(v, false)).toBe(true);
    for (const v of ["false", "OFF", " 0 ", "no"]) expect(parseBoolean(v, true)).toBe(false);
  });

  it("falls back when absent", () => {
    expect(parseBoolean(null, true)).toBe(true);
    expect(parseBoolean(undefined, false)).toBe(false);
  });
});

describe("parseNumber", () => {
  it("parses and clamps", () => {
    expect(parseNumber("5", 1)).toBe(5);
    expect(parseNumber("500", 1, 0, 10)).toBe(10);
    expect(parseNumber("-5", 1, 0, 10)).toBe(0);
  });

  it("falls back on missing or invalid values", () => {
    expect(parseNumber(null, 3)).toBe(3);
    expect(parseNumber(undefined, 3)).toBe(3);
    expect(parseNumber(" ", 3)).toBe(3);
    expect(parseNumber("abc", 3)).toBe(3);
    expect(parseNumber("Infinity", 3)).toBe(3);
  });
});

describe("parseRatio", () => {
  it("reads fractions, colons and decimals", () => {
    expect(parseRatio("3/4", 1)).toBe(0.75);
    expect(parseRatio("3:4", 1)).toBe(0.75);
    expect(parseRatio("0.8", 1)).toBe(0.8);
  });

  it("falls back on bad input", () => {
    expect(parseRatio(null, 1)).toBe(1);
    expect(parseRatio("", 1)).toBe(1);
    expect(parseRatio("1/0", 1)).toBe(1);
    expect(parseRatio("-1", 1)).toBe(1);
    expect(parseRatio("1/2/3", 1)).toBe(1);
    expect(parseRatio("x", 1)).toBe(1);
  });
});

describe("parseShape", () => {
  it("reads shapes", () => {
    expect(parseShape("circle")).toBe("circle");
    expect(parseShape("rect")).toBe("rect");
    expect(parseShape("oval")).toBe("oval");
    expect(parseShape(null)).toBe("oval");
  });
});

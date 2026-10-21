import * as pixelvision from "pixelvision";
import { describe, expect, it } from "vitest";
import {
  generateApiReference,
  inlineLinks,
  locatePixelvision,
  measure,
  splitTag,
} from "./apiReference";

describe("API reference", () => {
  const { declarations, version } = locatePixelvision();
  const reference = generateApiReference(declarations, version);
  const byName = new Map(reference.entries.map((entry) => [entry.name, entry]));
  const functions = Object.entries(pixelvision)
    .filter(([, value]) => typeof value === "function")
    .map(([name]) => name);

  it("documents every exported function", () => {
    for (const name of functions) {
      const entry = byName.get(name);
      expect(entry?.kind, name).toBe("function");
      expect(entry?.summary, name).not.toBe("");
      expect(entry?.signatures.length, name).toBeGreaterThan(0);
    }
  });

  it("reads parameters, returns, throws and examples", () => {
    const canny = byName.get("canny");
    expect(canny?.params.map((param) => param.name)).toEqual(["image", "options"]);
    expect(canny?.returns).toContain("255 on edges");
    expect(canny?.throws.map((thrown) => thrown.name)).toEqual(["TypeError", "RangeError"]);
    expect(canny?.examples[0]).toContain("canny(");
    expect(canny?.signatures[0]).toMatch(/^function canny\(/);
  });

  it("lists interface properties with their docs", () => {
    const options = byName.get("CannyOptions");
    expect(options?.kind).toBe("interface");
    expect(options?.members.find((member) => member.name === "low")?.doc).toContain(
      "never an edge",
    );
  });

  it("turns {@link} into inline code", () => {
    expect(inlineLinks("Blur first (e.g. {@link gaussianBlur})")).toBe(
      "Blur first (e.g. `gaussianBlur`)",
    );
    expect(reference.entries.some((entry) => entry.summary.includes("{@link"))).toBe(false);
  });

  it("measures the package entry", () => {
    const size = measure(locatePixelvision().entry);
    expect(size.bytes).toBeGreaterThan(size.gzipBytes);
    expect(size.gzipBytes).toBeGreaterThan(1000);
  });

  it("splits tags", () => {
    expect(splitTag("image - Gray image.")).toEqual({ name: "image", text: "Gray image." });
    expect(splitTag("{RangeError} When it's empty.")).toEqual({
      name: "RangeError",
      text: "When it's empty.",
    });
  });
});

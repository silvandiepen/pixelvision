import { describe, expect, it } from "vitest";
import { builtInLabels, dutchLabels, englishLabels, formatLabel, resolveLabels } from "./labels";

describe("labels", () => {
  it("has the same keys in every language, none empty", () => {
    const keys = Object.keys(englishLabels).sort();
    for (const labels of Object.values(builtInLabels)) {
      expect(Object.keys(labels).sort()).toEqual(keys);
      for (const value of Object.values(labels)) expect(value.trim()).not.toBe("");
    }
  });

  it("uses calm copy without exclamation marks", () => {
    for (const labels of Object.values(builtInLabels)) {
      for (const value of Object.values(labels)) expect(value).not.toContain("!");
    }
  });

  it("resolves by primary subtag and falls back to English", () => {
    expect(resolveLabels("nl-BE")).toEqual(dutchLabels);
    expect(resolveLabels("NL")).toEqual(dutchLabels);
    expect(resolveLabels("fr")).toEqual(englishLabels);
    expect(resolveLabels(null)).toEqual(englishLabels);
    expect(resolveLabels(undefined)).toEqual(englishLabels);
  });

  it("applies overrides", () => {
    expect(resolveLabels("en", { start: "Begin" }).start).toBe("Begin");
  });

  it("formats placeholders", () => {
    expect(formatLabel("Step {step} of {total}", { step: 2, total: 4 })).toBe("Step 2 of 4");
    expect(formatLabel("Hi {name}", {})).toBe("Hi {name}");
  });
});

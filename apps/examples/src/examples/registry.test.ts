import * as pixelvision from "pixelvision";
import { beforeAll, describe, expect, it } from "vitest";
import { loadSample } from "../samples/samples";
import { checkExpectation, defaultValues } from "./define";
import { PAGES_PENDING } from "./pending";
import type { DemoOutput } from "./example.model";
import { EXAMPLES } from "./registry";

const exportedFunctions = Object.entries(pixelvision)
  .filter(([, value]) => typeof value === "function")
  .map(([name]) => name)
  .sort();

describe("registry", () => {
  it("has a page for every function pixelvision exports", () => {
    const primary = new Set(EXAMPLES.map((example) => example.functions[0]));
    const missing = exportedFunctions.filter(
      (name) => !primary.has(name) && !PAGES_PENDING.includes(name),
    );
    expect(missing).toEqual([]);
  });

  it("lists no function as pending that already has a page", () => {
    const primary = new Set(EXAMPLES.map((example) => example.functions[0]));
    expect(PAGES_PENDING.filter((name) => primary.has(name))).toEqual([]);
  });

  it("only names functions pixelvision exports", () => {
    const named = EXAMPLES.flatMap((example) => example.functions);
    expect(named.filter((name) => !exportedFunctions.includes(name))).toEqual([]);
  });

  it("has unique slugs that are safe in a URL", () => {
    const slugs = EXAMPLES.map((example) => example.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("gives every example text, code and at least one check", () => {
    for (const example of EXAMPLES) {
      expect(example.description, example.slug).not.toBe("");
      expect(example.howItWorks.length, example.slug).toBeGreaterThan(0);
      expect(example.howToTest, example.slug).not.toBe("");
      expect(example.code, example.slug).toContain("export function demo");
      expect(example.expectations.length, example.slug).toBeGreaterThan(0);
      if (example.input === "image") expect(example.sample, example.slug).toBeDefined();
    }
  });
});

describe.each(EXAMPLES.map((example) => [example.slug, example] as const))("%s", (_, example) => {
  let output: DemoOutput = { values: {} };
  beforeAll(async () => {
    const image = await loadSample(example.sample ?? "shapes");
    const resources = await example.loadResources?.();
    output = example.run(image, defaultValues(example.controls), { previous: null, resources });
  });

  it("produces every value it checks", () => {
    for (const { key } of example.expectations) expect(output.values).toHaveProperty(key);
  });

  it.each(example.expectations.map((expectation) => [expectation.label, expectation] as const))(
    "%s",
    (__, expectation) => {
      const result = checkExpectation(expectation, output.values);
      expect(result.pass, `${expectation.key} = ${String(result.actual)}`).toBe(true);
    },
  );
});

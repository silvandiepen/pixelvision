import { describe, expect, it } from "vitest";
import { EXAMPLES } from "../examples/registry";
import { ICONS, TOPIC_ICONS, iconFor } from "./icons";

const slugs = EXAMPLES.map((example) => example.slug);
const ALLOWED_PAINT = new Set(["currentColor", "none"]);

/**
 * Checks that every element in some markup is closed, in order.
 *
 * @param markup - SVG markup.
 * @returns `true` when the tags balance.
 */
function balanced(markup: string): boolean {
  const stack: string[] = [];
  for (const [, closing, name, selfClosing] of markup.matchAll(/<(\/?)([a-z]+)\b[^>]*?(\/?)>/g)) {
    if (selfClosing) continue;
    if (closing) {
      if (stack.pop() !== name) return false;
    } else {
      stack.push(name);
    }
  }
  return stack.length === 0;
}

describe("icons", () => {
  it("every example page has an icon", () => {
    expect(slugs.filter((slug) => !iconFor(slug))).toEqual([]);
  });

  it("every icon belongs to an example page", () => {
    expect(Object.keys(ICONS).filter((slug) => !slugs.includes(slug))).toEqual([]);
  });

  it.each([...Object.entries(ICONS), ...Object.entries(TOPIC_ICONS)])(
    "%s uses only the current ink and balanced markup",
    (_, markup) => {
      expect(markup).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/i);
      for (const [, paint] of markup.matchAll(/\b(?:fill|stroke)="([^"]+)"/g)) {
        expect(ALLOWED_PAINT.has(paint), paint).toBe(true);
      }
      expect(markup).not.toContain("<svg");
      expect(balanced(markup)).toBe(true);
      expect(markup).not.toMatch(/NaN|undefined/);
    },
  );
});

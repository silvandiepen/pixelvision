import type { TextPart } from "./text.model";

/**
 * Splits text with `backtick` code spans into plain and code parts.
 *
 * @param text - Text using single backticks for inline code.
 * @returns The parts in order; empty parts are dropped.
 */
export function splitInlineCode(text: string): TextPart[] {
  return text
    .split("`")
    .map((part, index) => ({ text: part, code: index % 2 === 1 }))
    .filter((part) => part.text !== "");
}

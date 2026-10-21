import facts from "virtual:package-facts";
import readme from "../../../../README.md?raw";
import { markdownSection } from "./guides";
import type { SiteFacts } from "./facts.model";

/**
 * Counts the rows of the README's jsfeat parity table, and how many of them
 * say the output is identical.
 *
 * @param markdown - The README.
 * @returns Rows that map a jsfeat function, and the identical ones.
 */
export function parityCounts(markdown: string): { rows: number; identical: number } {
  const rows = markdownSection(markdown, "jsfeat parity")
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|\s*-/.test(line))
    .slice(1)
    .map((line) => line.split("|").map((cell) => cell.trim()));
  const ported = rows.filter((cells) => cells[1] && cells[1] !== "—");
  return {
    rows: ported.length,
    identical: ported.filter((cells) => cells[3]?.startsWith("identical")).length,
  };
}

const parity = parityCounts(readme);

/** The numbers the marketing pages quote. */
export const SITE_FACTS: SiteFacts = {
  version: facts.version,
  gzipKb: Math.round(facts.size.gzipBytes / 102.4) / 10,
  functionCount: facts.functionCount,
  jsfeatRows: parity.rows,
  jsfeatIdentical: parity.identical,
};

/**
 * Replaces `{{name}}` placeholders in page text with the measured facts.
 *
 * @param text - Text with placeholders such as `{{gzipKb}}`.
 * @returns The text with numbers filled in.
 */
export function fillFacts(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in SITE_FACTS ? String(SITE_FACTS[key as keyof SiteFacts]) : match,
  );
}

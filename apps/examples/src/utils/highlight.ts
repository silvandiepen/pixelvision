import type { CodeHighlighter, CodeLanguage } from "./highlight.model";

/** Names a code fence or file may use, mapped to the language that highlights them. */
const ALIASES: Record<string, CodeLanguage> = {
  ts: "typescript",
  typescript: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "typescript",
  js: "javascript",
  javascript: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  sh: "bash",
  bash: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  terminal: "bash",
  json: "json",
};

let loading: Promise<CodeHighlighter> | undefined;

/**
 * Finds the language for a code fence's info string, a file extension, or a
 * file name such as `demo.ts` or `Terminal`.
 *
 * @param name - The fence language, extension or file name.
 * @returns The language, or `undefined` when it isn't one the site highlights.
 */
export function languageOf(name: string | undefined): CodeLanguage | undefined {
  if (!name) return undefined;
  const lower = name.trim().toLowerCase();
  return ALIASES[lower] ?? ALIASES[lower.slice(lower.lastIndexOf(".") + 1)];
}

/**
 * Lists the highlightable languages of the fenced code blocks in Markdown.
 *
 * @param markdown - The Markdown.
 * @returns Each language once, in order of first use.
 */
export function fenceLanguages(markdown: string): CodeLanguage[] {
  const found = [...markdown.matchAll(/^ {0,3}(?:```|~~~)\s*([\w-]+)/gm)].map((match) =>
    languageOf(match[1]),
  );
  return [...new Set(found.filter((language) => language !== undefined))];
}

/**
 * Loads the highlighter the first time it's asked for, in its own chunk, and
 * shares it after that, along with the grammars for the given languages.
 *
 * @param languages - Languages the caller is about to highlight.
 * @returns The highlighter, with those languages ready.
 * @throws When a chunk can't be loaded; the next call tries again.
 */
export async function loadHighlighter(
  languages: readonly CodeLanguage[] = [],
): Promise<CodeHighlighter> {
  loading ??= import("./highlighter")
    .then((module) => module.createCodeHighlighter())
    .catch((error: unknown) => {
      loading = undefined;
      throw error;
    });
  const highlighter = await loading;
  await highlighter.load(languages);
  return highlighter;
}

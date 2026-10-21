/** The languages the site highlights. Anything else is shown as plain text. */
export type CodeLanguage = "typescript" | "javascript" | "bash" | "json";

/** One coloured run of text on a line of highlighted code. */
export interface CodeToken {
  content: string;
  /** A CSS colour, always one of the `--pv-code-*` custom properties. */
  color?: string;
  italic: boolean;
  bold: boolean;
}

/**
 * A loaded highlighter. Each language's grammar loads separately, so only the
 * ones a page shows are downloaded; `tokens` and `html` need it loaded first.
 */
export interface CodeHighlighter {
  /** Loads the grammars for these languages, once each. */
  load(languages: readonly CodeLanguage[]): Promise<void>;
  /** Whether a language's grammar has loaded. */
  has(language: CodeLanguage): boolean;
  /** Splits code into lines of coloured tokens, for components that draw their own markup. */
  tokens(code: string, language: CodeLanguage): CodeToken[][];
  /** Renders code as a highlighted `<pre>`, for HTML made from Markdown. */
  html(code: string, language: CodeLanguage): string;
}

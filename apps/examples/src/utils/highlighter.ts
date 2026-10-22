// The Shiki setup. Loaded on demand through `loadHighlighter` in `./highlight`,
// so none of this is in the bundle that paints the first page.
import { createHighlighterCore } from "@shikijs/core";
import type { LanguageRegistration, ThemeRegistration } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import type { CodeHighlighter, CodeLanguage, CodeTokenName } from "./highlight.model";

const THEME_NAME = "pixelvision";

/** Shiki's font style bit flags (its `FontStyle` enum is type-only). */
const ITALIC = 1;
const BOLD = 2;

/** Each grammar in its own chunk, loaded the first time a page needs it. */
const GRAMMARS: Record<CodeLanguage, () => Promise<{ default: LanguageRegistration[] }>> = {
  typescript: () => import("@shikijs/langs/typescript"),
  javascript: () => import("@shikijs/langs/javascript"),
  bash: () => import("@shikijs/langs/bash"),
  json: () => import("@shikijs/langs/json"),
};

/**
 * Each token colour of the code theme, as the name of its `--pv-code-*`
 * custom property, with the TextMate scopes it colours. Where scopes overlap,
 * the more specific one wins, so `keyword.operator` is punctuation even
 * though `keyword` is a keyword.
 */
export const CODE_TOKEN_SCOPES: Record<CodeTokenName, readonly string[]> = {
  comment: ["comment", "punctuation.definition.comment"],
  keyword: [
    "keyword",
    "keyword.control",
    "keyword.operator.new",
    "keyword.operator.expression",
    "storage.type",
    "storage.modifier",
    "variable.language",
  ],
  punctuation: [
    "keyword.operator",
    "punctuation",
    "meta.brace",
    "storage.type.function.arrow",
    "punctuation.definition.template-expression",
  ],
  string: ["string", "string.template", "punctuation.definition.string"],
  number: ["constant.numeric"],
  literal: ["constant.language", "support.constant"],
  function: [
    "entity.name.function",
    "support.function",
    "meta.function-call entity.name.function",
    "entity.name.command",
  ],
  type: [
    "entity.name.type",
    "entity.name.class",
    "entity.other.inherited-class",
    "support.type",
    "support.class",
  ],
  property: [
    "support.type.property-name",
    "meta.object-literal.key",
    "variable.other.property",
    "variable.other.object.property",
  ],
};

/**
 * Names a `--pv-code-*` custom property.
 *
 * @param name - The token or editor colour name.
 * @returns The CSS `var()` reference.
 */
function tone(name: string): string {
  return `var(--pv-code-${name})`;
}

/**
 * Builds the code theme. Every colour is a `--pv-code-*` custom property,
 * defined in `styles/main.scss` once for light and once for dark mode, so one
 * theme covers both.
 *
 * @returns The theme.
 */
export function codeTheme(): ThemeRegistration {
  const tokenColors = Object.entries(CODE_TOKEN_SCOPES).map(([name, scope]) => ({
    scope: [...scope],
    settings: {
      foreground: tone(name),
      fontStyle: name === "comment" ? "italic" : name === "keyword" ? "bold" : "",
    },
  }));
  return {
    name: THEME_NAME,
    type: "light",
    colors: {
      "editor.foreground": tone("foreground"),
      "editor.background": tone("background"),
    },
    fg: tone("foreground"),
    bg: tone("background"),
    tokenColors: [
      ...tokenColors,
      // Code inside a template string's `${}` is code, and a shell command's
      // unquoted arguments are plain words: neither is a string.
      {
        scope: ["meta.template.expression", "string.unquoted.argument"],
        settings: { foreground: tone("foreground") },
      },
    ],
  };
}

/**
 * Creates the site's highlighter: Shiki core with the JavaScript regex engine
 * (no WebAssembly) and one theme. Grammars load through `load`.
 *
 * @returns The highlighter, synchronous once a language is loaded.
 */
export async function createCodeHighlighter(): Promise<CodeHighlighter> {
  const shiki = await createHighlighterCore({
    themes: [codeTheme()],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
  const loaded = new Map<CodeLanguage, Promise<void>>();

  return {
    async load(languages: readonly CodeLanguage[]) {
      await Promise.all(
        languages.map((language) => {
          let loading = loaded.get(language);
          if (!loading) {
            loading = GRAMMARS[language]()
              .then((grammar) => shiki.loadLanguage(grammar.default))
              .catch((error: unknown) => {
                loaded.delete(language);
                throw error;
              });
            loaded.set(language, loading);
          }
          return loading;
        }),
      );
    },
    has(language: CodeLanguage) {
      return shiki.getLoadedLanguages().includes(language);
    },
    tokens(code: string, language: CodeLanguage) {
      return shiki.codeToTokensBase(code, { lang: language, theme: THEME_NAME }).map((line) =>
        line.map((token) => ({
          content: token.content,
          color: token.color,
          italic: Boolean((token.fontStyle ?? 0) & ITALIC),
          bold: Boolean((token.fontStyle ?? 0) & BOLD),
        })),
      );
    },
    html(code: string, language: CodeLanguage) {
      return shiki.codeToHtml(code, { lang: language, theme: THEME_NAME });
    },
  };
}

// The Shiki setup. Loaded on demand through `loadHighlighter` in `./highlight`,
// so none of this is in the bundle that paints the first page.
import { createHighlighterCore } from "@shikijs/core";
import type { LanguageRegistration, ThemeRegistration } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import type { CodeHighlighter, CodeLanguage } from "./highlight.model";

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
 * Builds the code theme. Every colour is a `--pv-code-*` custom property,
 * defined in `styles/main.scss` as a tone between page and ink, so one theme
 * covers light, dark and any contrast setting.
 *
 * @returns The theme.
 */
function codeTheme(): ThemeRegistration {
  const tone = (name: string): string => `var(--pv-code-${name})`;
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
      {
        scope: ["comment", "punctuation.definition.comment"],
        settings: { foreground: tone("comment"), fontStyle: "italic" },
      },
      {
        scope: [
          "keyword",
          "storage.type",
          "storage.modifier",
          "keyword.control",
          "variable.language",
        ],
        settings: { foreground: tone("keyword"), fontStyle: "bold" },
      },
      {
        scope: ["keyword.operator", "punctuation", "meta.brace"],
        settings: { foreground: tone("punctuation"), fontStyle: "" },
      },
      {
        scope: ["string", "string.template", "punctuation.definition.string"],
        settings: { foreground: tone("string") },
      },
      {
        scope: ["constant.numeric", "constant.language", "support.constant"],
        settings: { foreground: tone("constant") },
      },
      {
        scope: ["entity.name.function", "support.function", "entity.name.command"],
        settings: { foreground: tone("function") },
      },
      {
        scope: ["entity.name.type", "support.type", "support.class", "entity.name.class"],
        settings: { foreground: tone("type") },
      },
      {
        scope: ["support.type.property-name", "meta.object-literal.key", "variable.parameter"],
        settings: { foreground: tone("property") },
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

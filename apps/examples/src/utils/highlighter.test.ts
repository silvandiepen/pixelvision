import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadHighlighter } from "./highlight";
import { CODE_TOKEN_SCOPES, codeTheme } from "./highlighter";

const STYLES = readFileSync(new URL("../styles/main.scss", import.meta.url), "utf8");

const TOKENS = Object.keys(CODE_TOKEN_SCOPES);

describe("code theme", () => {
  it("maps each token scope to a colour variable", () => {
    const rules = codeTheme().tokenColors ?? [];
    for (const name of TOKENS) {
      const rule = rules.find((entry) => entry.settings.foreground === `var(--pv-code-${name})`);
      expect(rule, name).toBeDefined();
      expect(rule?.scope, name).toEqual(CODE_TOKEN_SCOPES[name as keyof typeof CODE_TOKEN_SCOPES]);
    }
    for (const rule of rules) {
      expect(rule.settings.foreground).toMatch(/^var\(--pv-code-[a-z]+\)$/);
    }
  });

  it("defines every token colour for light and for dark mode", () => {
    for (const name of TOKENS) {
      const definitions = STYLES.match(new RegExp(`--pv-code-${name}: #[0-9a-f]{6};`, "g"));
      expect(definitions, name).toHaveLength(2);
    }
  });

  it("gives each kind of token its colour", async () => {
    const highlighter = await loadHighlighter(["typescript"]);
    const code = [
      "// note",
      'export const size: number = scale(3, { width: "wide", on: true, off: null });',
      "frame.width = `${size}`;",
    ].join("\n");
    const colourOf = (text: string): string | undefined =>
      highlighter
        .tokens(code, "typescript")
        .flat()
        .find((token) => token.content.trim() === text)?.color;

    expect(colourOf("// note")).toBe("var(--pv-code-comment)");
    expect(colourOf("export")).toBe("var(--pv-code-keyword)");
    expect(colourOf("const")).toBe("var(--pv-code-keyword)");
    expect(colourOf("number")).toBe("var(--pv-code-type)");
    expect(colourOf("scale")).toBe("var(--pv-code-function)");
    expect(colourOf("3")).toBe("var(--pv-code-number)");
    expect(colourOf('"wide"')).toBe("var(--pv-code-string)");
    expect(colourOf("true")).toBe("var(--pv-code-literal)");
    expect(colourOf("null")).toBe("var(--pv-code-literal)");
    expect(colourOf("width")).toBe("var(--pv-code-property)");
    expect(colourOf("=")).toBe("var(--pv-code-punctuation)");
    expect(colourOf("size")).toBe("var(--pv-code-foreground)");
  });

  it("colours a shell command but not its plain arguments", async () => {
    const highlighter = await loadHighlighter(["bash"]);
    const [line] = highlighter.tokens('npm install pixelvision # "note"', "bash");
    expect(line[0]).toMatchObject({ content: "npm", color: "var(--pv-code-function)" });
    expect(line.find((token) => token.content.includes("install"))?.color).toBe(
      "var(--pv-code-foreground)",
    );
  });
});

import { describe, expect, it } from "vitest";
import { GUIDES } from "../content/guides";
import { fenceLanguages, languageOf, loadHighlighter } from "./highlight";
import { headingId, renderMarkdown } from "./markdown";

const PAGES = new Map([["canny", "canny"]]);

describe("renderMarkdown", () => {
  it("links function names, ids headings and resolves repository links", async () => {
    const html = await renderMarkdown(
      "## What it isn't\n\nUse `canny` or `blur`. See [the notes](docs/notes.md), [up](#top) and [site](/api).",
      PAGES,
    );
    expect(html).toContain('<h2 id="what-it-isn-t">');
    expect(html).toContain('<a href="/canny"><code>canny</code></a>');
    expect(html).toContain("<code>blur</code>");
    expect(html).toContain(
      'href="https://github.com/silvandiepen/pixelvision/blob/main/docs/notes.md"',
    );
    expect(html).toContain('href="#top"');
    expect(html).toContain('href="/api"');
  });

  it("renders tables", async () => {
    const html = await renderMarkdown("| a | b |\n| --- | --- |\n| `canny` | 2 |", PAGES);
    expect(html).toContain("<table>");
    expect(html).toContain('<td><a href="/canny"><code>canny</code></a></td>');
  });

  it("leaves double braces as written, in text and in code", async () => {
    const markdown = [
      "Placeholders look like {{ name }} and {{{ raw }}}.",
      "",
      "```ts",
      "const style = { color: `{{ value }}` };",
      "```",
    ].join("\n");
    const plain = await renderMarkdown(markdown, PAGES);
    expect(plain).toContain("{{ name }}");
    expect(plain).toContain("{{{ raw }}}");
    expect(plain).toContain("{{ value }}");

    const highlighted = await renderMarkdown(
      markdown,
      PAGES,
      await loadHighlighter(["typescript"]),
    );
    expect(highlighted).toContain("{{ name }}");
    expect(highlighted.replace(/<[^>]+>/g, "")).toContain("{{ value }}");
  });

  it("highlights fenced code in a known language and leaves the rest plain", async () => {
    const html = await renderMarkdown(
      "```ts\nconst a = 1;\n```\n\n```\nplain\n```\n\n```json\n{}\n```",
      PAGES,
      await loadHighlighter(["typescript"]),
    );
    expect(html).toContain('class="shiki pixelvision"');
    expect(html).toContain("var(--pv-code-keyword)");
    expect(html).toContain("<pre><code>plain");
    // JSON wasn't loaded, so it falls back to plain text rather than failing.
    expect(html).toContain('<pre><code class="language-json">{}');
  });

  it("renders every guide", async () => {
    for (const guide of GUIDES) {
      const highlighter = await loadHighlighter(fenceLanguages(guide.markdown));
      const html = await renderMarkdown(guide.markdown, PAGES, highlighter);
      expect(html.length, guide.slug).toBeGreaterThan(200);
    }
  });
});

describe("highlight", () => {
  it("finds the language from a fence, an extension or a file name", () => {
    expect(languageOf("ts")).toBe("typescript");
    expect(languageOf("sh")).toBe("bash");
    expect(languageOf("canny/demo.ts")).toBe("typescript");
    expect(languageOf("Terminal")).toBe("bash");
    expect(languageOf("package.json")).toBe("json");
    expect(languageOf("python")).toBeUndefined();
    expect(languageOf(undefined)).toBeUndefined();
  });

  it("lists the languages of a document's code fences once each", () => {
    expect(
      fenceLanguages("```ts\na\n```\n\n```sh\nb\n```\n\n```ts\nc\n```\n\n```\nd\n```"),
    ).toEqual(["typescript", "bash"]);
  });

  it("splits code into styled tokens", async () => {
    const highlighter = await loadHighlighter(["typescript"]);
    const lines = highlighter.tokens("// note\nconst a = 1;", "typescript");
    expect(lines).toHaveLength(2);
    expect(lines[0][0]).toMatchObject({ italic: true, color: "var(--pv-code-comment)" });
    expect(lines[1][0]).toMatchObject({ content: "const", bold: true });
  });

  it("makes heading ids", () => {
    expect(headingId("Compared <code>x</code> &amp; y")).toBe("compared-x-y");
  });
});

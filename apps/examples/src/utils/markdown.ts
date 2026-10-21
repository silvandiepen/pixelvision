import { Marked } from "marked";

/** Where relative links in the repository's own Markdown point. */
const REPOSITORY = "https://github.com/silvandiepen/pixelvision/blob/main/";

/**
 * Turns heading text into an anchor id.
 *
 * @param text - Heading text.
 * @returns A URL-safe id.
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Renders documentation Markdown to HTML. Inline code naming a function
 * that has an example page links to it, headings get anchor ids, and
 * relative links into the repository point to GitHub.
 *
 * @param markdown - The Markdown.
 * @param pages - Function name → example slug.
 * @returns HTML.
 */
export function renderMarkdown(markdown: string, pages: ReadonlyMap<string, string>): string {
  const marked = new Marked({
    gfm: true,
    renderer: {
      codespan({ text }) {
        const slug = pages.get(text);
        return slug ? `<a href="/${slug}"><code>${text}</code></a>` : `<code>${text}</code>`;
      },
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        return `<h${depth} id="${headingId(html)}">${html}</h${depth}>\n`;
      },
      link({ href, tokens }) {
        const html = this.parser.parseInline(tokens);
        const external = /^https?:/.test(href);
        const target =
          external || href.startsWith("/") || href.startsWith("#") ? href : REPOSITORY + href;
        return `<a href="${target}">${html}</a>`;
      },
    },
  });
  return marked.parse(markdown, { async: false });
}

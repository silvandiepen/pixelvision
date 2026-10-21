import { useNizel } from "nizel";
import type { NizelInlineNode, NizelNode, NizelProcessor, NizelRootNode } from "nizel";
import { gfmPlugin } from "nizel-plugin-gfm";
import { shikiPlugin } from "nizel-plugin-shiki";
import { languageOf } from "./highlight";
import type { CodeHighlighter } from "./highlight.model";

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
 * Points a link into the repository at GitHub, and leaves absolute, site
 * and in-page links as they are.
 *
 * @param href - The link target as written.
 * @returns The target to render.
 */
function linkTarget(href: string): string {
  const kept = /^https?:/.test(href) || href.startsWith("/") || href.startsWith("#");
  return kept ? href : REPOSITORY + href;
}

/**
 * Rewrites inline nodes: code naming a function with an example page becomes
 * a link to it, and link targets are resolved.
 *
 * @param nodes - Inline nodes of one block.
 * @param pages - Function name → example slug.
 * @returns The rewritten nodes.
 */
function rewriteInline(
  nodes: NizelInlineNode[],
  pages: ReadonlyMap<string, string>,
): NizelInlineNode[] {
  return nodes.map((node): NizelInlineNode => {
    if (node.type === "inlineCode") {
      const slug = pages.get(node.code);
      return slug ? { type: "link", href: `/${slug}`, children: [node] } : node;
    }
    if (node.type === "link") {
      return {
        ...node,
        href: linkTarget(node.href),
        children: rewriteInline(node.children, pages),
      };
    }
    if ("children" in node) return { ...node, children: rewriteInline(node.children, pages) };
    return node;
  });
}

/**
 * Walks the tree once: headings get the site's anchor ids, and inline content
 * is rewritten by `rewriteInline`. Code blocks are left alone, so braces and
 * backticks in examples stay exactly as written.
 *
 * @param node - A node to rewrite in place.
 * @param pages - Function name → example slug.
 */
function rewrite(node: NizelNode, pages: ReadonlyMap<string, string>): void {
  if (node.type === "heading") node.id = headingId(node.text);
  if (node.type === "paragraph" || node.type === "heading" || node.type === "tableCell") {
    node.children = rewriteInline(node.children, pages);
    return;
  }
  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children as NizelNode[]) rewrite(child, pages);
  }
}

/**
 * Creates the Markdown processor. Nizel's `{{ name }}` templates are turned
 * off: the site fills its own `{{fact}}` placeholders before rendering, and
 * guide code may contain literal double braces that must survive as written.
 *
 * @param pages - Function name → example slug.
 * @param highlighter - Highlights fenced code when loaded.
 * @returns The processor.
 */
function processor(
  pages: ReadonlyMap<string, string>,
  highlighter: CodeHighlighter | undefined,
): NizelProcessor {
  return useNizel({
    template: false,
    frontmatter: false,
    anchors: false,
    toc: false,
    plugins: [
      gfmPlugin({ alerts: false }),
      shikiPlugin({
        highlighter: (code, { lang }) => {
          const language = languageOf(lang);
          return language && highlighter?.has(language)
            ? highlighter.html(code, language)
            : undefined;
        },
      }),
    ],
    transforms: [
      (ast: NizelRootNode) => {
        rewrite(ast, pages);
      },
    ],
  });
}

/**
 * Renders documentation Markdown to HTML. Inline code naming a function that
 * has an example page links to it, headings get anchor ids, relative links
 * into the repository point to GitHub, and fenced code in a known language is
 * highlighted when a highlighter is given.
 *
 * @param markdown - The Markdown.
 * @param pages - Function name → example slug.
 * @param highlighter - The loaded highlighter; without it, code renders as plain text.
 * @returns HTML.
 */
export function renderMarkdown(
  markdown: string,
  pages: ReadonlyMap<string, string>,
  highlighter?: CodeHighlighter,
): Promise<string> {
  return processor(pages, highlighter).html(markdown);
}

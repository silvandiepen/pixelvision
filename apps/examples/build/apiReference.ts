import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { gzipSync } from "node:zlib";
import ts from "typescript";
import type { Plugin } from "vite";
import type {
  ApiEntry,
  ApiMember,
  ApiReference,
  ApiTag,
  PackageFacts,
} from "./apiReference.model.ts";

const VIRTUAL_ID = "virtual:api-reference";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const FACTS_ID = "virtual:package-facts";
const RESOLVED_FACTS_ID = `\0${FACTS_ID}`;

/**
 * Finds the built type declarations of the `pixelvision` package this app
 * depends on.
 *
 * @returns Path of `dist/index.d.ts` and the package version.
 */
export function locatePixelvision(): { declarations: string; entry: string; version: string } {
  const require = createRequire(import.meta.url);
  const manifest = require.resolve("pixelvision/package.json");
  const { version } = JSON.parse(readFileSync(manifest, "utf8")) as { version: string };
  return {
    declarations: join(dirname(manifest), "dist", "index.d.ts"),
    entry: join(dirname(manifest), "dist", "index.js"),
    version,
  };
}

/**
 * Measures a built file as it would be downloaded.
 *
 * @param file - Path of the file.
 * @returns Its size, and its size gzipped.
 */
export function measure(file: string): { bytes: number; gzipBytes: number } {
  const contents = readFileSync(file);
  return { bytes: contents.length, gzipBytes: gzipSync(contents).length };
}

/**
 * Turns TSDoc `{@link name}` references into inline code, which the site
 * links to the function's page.
 *
 * @param text - TSDoc text.
 * @returns The text with links as `` `name` ``.
 */
export function inlineLinks(text: string): string {
  return text.replace(/\{@link\s+([^}\s|]+)[^}]*\}/g, "`$1`");
}

/**
 * Splits a `@param` or `@throws` text into its name and description.
 *
 * @param text - E.g. `image - Gray image.` or `{RangeError} When …`.
 * @returns The name (or error type) and the description.
 */
export function splitTag(text: string): ApiTag {
  const thrown = /^\{([^}]+)\}\s*(.*)$/s.exec(text);
  if (thrown) return { name: thrown[1], text: thrown[2].trim() };
  const param = /^(\S+)\s*(?:-\s*)?(.*)$/s.exec(text);
  return param ? { name: param[1], text: param[2].trim() } : { name: "", text };
}

/**
 * Reads the TSDoc and declarations of every export from a `.d.ts` file.
 *
 * @param declarations - Path of the entry `.d.ts`.
 * @param version - Package version to record.
 * @param size - Size of the package entry to record.
 * @returns The reference, exports sorted by name.
 * @throws {Error} When the file can't be read as a module.
 */
export function generateApiReference(
  declarations: string,
  version: string,
  size: ApiReference["size"] = { bytes: 0, gzipBytes: 0 },
): ApiReference {
  const program = ts.createProgram([declarations], {
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(declarations);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`Can't read ${declarations} as a module`);

  const entries: ApiEntry[] = [];
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const symbol =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declarationsOf = symbol.getDeclarations() ?? [];
    const first = declarationsOf[0];
    if (!first) continue;

    let kind: ApiEntry["kind"];
    if (ts.isFunctionDeclaration(first)) kind = "function";
    else if (ts.isInterfaceDeclaration(first)) kind = "interface";
    else if (ts.isTypeAliasDeclaration(first)) kind = "type";
    else kind = "const";

    const tags = symbol.getJsDocTags(checker).map((tag) => ({
      name: tag.name,
      text: inlineLinks(ts.displayPartsToString(tag.text)),
    }));
    const members: ApiMember[] = [];
    if (ts.isInterfaceDeclaration(first)) {
      for (const member of first.members) {
        if (!ts.isPropertySignature(member) || !member.type) continue;
        const memberSymbol = checker.getSymbolAtLocation(member.name);
        members.push({
          name: member.name.getText(),
          type: member.type.getText(),
          optional: Boolean(member.questionToken),
          doc: memberSymbol
            ? inlineLinks(ts.displayPartsToString(memberSymbol.getDocumentationComment(checker)))
            : "",
        });
      }
    }

    entries.push({
      name: exported.getName(),
      kind,
      summary: inlineLinks(ts.displayPartsToString(symbol.getDocumentationComment(checker))),
      signatures: declarationsOf.map((declaration) =>
        declaration
          .getText()
          .replace(/^declare /, "")
          .replace(/\s+\n/g, "\n"),
      ),
      params: tags.filter((tag) => tag.name === "param").map((tag) => splitTag(tag.text)),
      returns: tags.find((tag) => tag.name === "returns")?.text ?? "",
      throws: tags.filter((tag) => tag.name === "throws").map((tag) => splitTag(tag.text)),
      examples: tags.filter((tag) => tag.name === "example").map((tag) => tag.text.trim()),
      members,
    });
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  return { version, size, entries };
}

/**
 * Vite plugin serving `virtual:api-reference` (and the small
 * `virtual:package-facts`): the API reference generated
 * from the built `pixelvision` declarations at build (and dev) time, so the
 * reference page always matches the package the examples import.
 *
 * @returns The plugin.
 */
export function apiReferencePlugin(): Plugin {
  return {
    name: "pixelvision-api-reference",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return id === FACTS_ID ? RESOLVED_FACTS_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID && id !== RESOLVED_FACTS_ID) return undefined;
      const { declarations, entry, version } = locatePixelvision();
      this.addWatchFile(declarations);
      this.addWatchFile(entry);
      const reference = generateApiReference(declarations, version, measure(entry));
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(reference)};`;
      const facts: PackageFacts = {
        version,
        size: reference.size,
        functionCount: reference.entries.filter((e) => e.kind === "function").length,
      };
      return `export default ${JSON.stringify(facts)};`;
    },
  };
}

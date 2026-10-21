import type { XmlElement } from "./xml.model";

const ENTITIES: Record<string, string> = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };

/**
 * Replaces the five predefined entities and numeric character references.
 *
 * @param text - Raw text or attribute value.
 * @returns The decoded text.
 * @throws {SyntaxError} When an entity is unknown.
 */
const decodeEntities = (text: string): string =>
  text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (_, entity: string) => {
    if (entity[0] === "#") {
      return String.fromCodePoint(
        entity[1] === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10),
      );
    }
    const value = ENTITIES[entity];
    if (value === undefined) throw new SyntaxError(`XML: unknown entity &${entity};`);
    return value;
  });

/**
 * Finds the end of a construct that must be closed.
 *
 * @param xml - The document.
 * @param from - Where to start searching.
 * @param terminator - The closing text, e.g. `"-->"`.
 * @param what - Name of the construct, for the error.
 * @returns The index just past the terminator.
 * @throws {SyntaxError} When the terminator is missing.
 */
const skipPast = (xml: string, from: number, terminator: string, what: string): number => {
  const end = xml.indexOf(terminator, from);
  if (end === -1) throw new SyntaxError(`XML: unterminated ${what}`);
  return end + terminator.length;
};

/**
 * Parses an XML document into a tree of elements. A small reader for
 * well-formed, data-style XML such as OpenCV's `opencv_storage` files:
 * elements, attributes, text, CDATA, comments, processing instructions and
 * the predefined and numeric entities. DTDs are skipped, not applied.
 *
 * @param xml - The document.
 * @returns The root element.
 * @throws {SyntaxError} When the document is not well formed, or has no or several root elements.
 *
 * @example
 * parseXml("<size>20 20</size>").text; // "20 20"
 */
export function parseXml(xml: string): XmlElement {
  const stack: { element: XmlElement; text: string[] }[] = [];
  let root: XmlElement | undefined;
  let i = 0;
  const n = xml.length;

  while (i < n) {
    const lt = xml.indexOf("<", i);
    const textEnd = lt === -1 ? n : lt;
    if (textEnd > i) {
      const text = xml.slice(i, textEnd);
      if (stack.length) stack[stack.length - 1].text.push(decodeEntities(text));
      else if (text.trim()) throw new SyntaxError("XML: text outside the root element");
    }
    if (lt === -1) break;

    if (xml.startsWith("<!--", lt)) {
      i = skipPast(xml, lt + 4, "-->", "comment");
    } else if (xml.startsWith("<![CDATA[", lt)) {
      const end = skipPast(xml, lt + 9, "]]>", "CDATA section");
      if (!stack.length) throw new SyntaxError("XML: text outside the root element");
      stack[stack.length - 1].text.push(xml.slice(lt + 9, end - 3));
      i = end;
    } else if (xml.startsWith("<?", lt)) {
      i = skipPast(xml, lt + 2, "?>", "processing instruction");
    } else if (xml.startsWith("<!", lt)) {
      i = skipPast(xml, lt + 2, ">", "declaration");
    } else if (xml[lt + 1] === "/") {
      const end = skipPast(xml, lt + 2, ">", "closing tag");
      const name = xml.slice(lt + 2, end - 1).trim();
      const open = stack.pop();
      if (!open || open.element.name !== name) {
        throw new SyntaxError(`XML: unexpected </${name}>`);
      }
      open.element.text = open.text.join("").trim();
      i = end;
    } else {
      const end = skipPast(xml, lt + 1, ">", "tag");
      const selfClosing = xml[end - 2] === "/";
      const body = xml.slice(lt + 1, selfClosing ? end - 2 : end - 1);
      const name = /^[^\s/>]+/.exec(body)?.[0];
      if (!name) throw new SyntaxError("XML: tag without a name");
      const attributes: Record<string, string> = {};
      const rest = body.slice(name.length);
      const attribute = /\s*([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/y;
      let at = 0;
      while (rest.slice(at).trim()) {
        attribute.lastIndex = at;
        const match = attribute.exec(rest);
        if (!match) throw new SyntaxError(`XML: malformed attributes in <${name}>`);
        attributes[match[1]] = decodeEntities(match[3] ?? match[4]);
        at = attribute.lastIndex;
      }
      const element: XmlElement = { name, attributes, children: [], text: "" };
      if (stack.length) stack[stack.length - 1].element.children.push(element);
      else if (root) throw new SyntaxError("XML: more than one root element");
      else root = element;
      if (!selfClosing) stack.push({ element, text: [] });
      i = end;
    }
  }
  if (stack.length)
    throw new SyntaxError(`XML: <${stack[stack.length - 1].element.name}> is not closed`);
  if (!root) throw new SyntaxError("XML: no root element");
  return root;
}

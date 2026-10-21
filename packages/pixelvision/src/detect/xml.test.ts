import { describe, expect, it } from "vitest";
import { parseXml } from "./xml";

describe("parseXml", () => {
  it("reads elements, attributes and text", () => {
    const root = parseXml(
      `<?xml version="1.0"?>
      <!DOCTYPE storage>
      <!-- a comment -->
      <storage kind="a &amp; b" other='single'>
        <size>20 20</size>
        <empty/>
        <empty2 flag="1" />
        <list><_>1</_><_>2</_></list>
      </storage>`,
    );

    expect(root.name).toBe("storage");
    expect(root.attributes).toEqual({ kind: "a & b", other: "single" });
    expect(root.children.map((c) => c.name)).toEqual(["size", "empty", "empty2", "list"]);
    expect(root.children[0].text).toBe("20 20");
    expect(root.children[1]).toEqual({ name: "empty", attributes: {}, children: [], text: "" });
    expect(root.children[2].attributes).toEqual({ flag: "1" });
    expect(root.children[3].children.map((c) => c.text)).toEqual(["1", "2"]);
  });

  it("decodes entities and CDATA and joins text around children", () => {
    const root = parseXml(
      "<a>x &lt;&gt;&quot;&apos;&#65;&#x42; <b/>y<![CDATA[<raw> & ]]><!-- c --></a>",
    );

    expect(root.text).toBe(`x <>"'AB y<raw> &`);
  });

  it("allows whitespace, but no text, after the root element", () => {
    expect(parseXml("<a>1</a>\n  ").text).toBe("1");
    expect(() => parseXml("<a/> trailing")).toThrow("text outside the root element");
  });

  it("rejects malformed documents", () => {
    expect(() => parseXml("")).toThrow("no root element");
    expect(() => parseXml("<a>")).toThrow("<a> is not closed");
    expect(() => parseXml("<a></b>")).toThrow("unexpected </b>");
    expect(() => parseXml("</a>")).toThrow("unexpected </a>");
    expect(() => parseXml("<a/><b/>")).toThrow("more than one root element");
    expect(() => parseXml("text<a/>")).toThrow("text outside the root element");
    expect(() => parseXml("<![CDATA[x]]><a/>")).toThrow("text outside the root element");
    expect(() => parseXml("<a><!-- open</a>")).toThrow("unterminated comment");
    expect(() => parseXml("<a><![CDATA[open</a>")).toThrow("unterminated CDATA section");
    expect(() => parseXml("<?xml <a/>")).toThrow("unterminated processing instruction");
    expect(() => parseXml("<!DOCTYPE")).toThrow("unterminated declaration");
    expect(() => parseXml("<a></a")).toThrow("unterminated closing tag");
    expect(() => parseXml("<a")).toThrow("unterminated tag");
    expect(() => parseXml("< a/>")).toThrow("tag without a name");
    expect(() => parseXml('<a b="1" c/>')).toThrow("malformed attributes in <a>");
    expect(() => parseXml("<a>&nope;</a>")).toThrow("unknown entity &nope;");
    expect(() => parseXml("<a>&nope;</a>")).toThrow(SyntaxError);
  });
});

import { describe, expect, it } from "vitest";
import { documentPageSize } from "../examples/scan-document/paper";
import { cropImage, portraitBox } from "./export";
import { imagePdf } from "./pdf";

const latin1 = (bytes: Uint8Array) => Array.from(bytes, (b) => String.fromCharCode(b)).join("");

describe("imagePdf", () => {
  // Stand-in JPEG bytes: the writer copies them as they are.
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
  const pdf = imagePdf(jpeg, { width: 300, height: 200, pageWidth: 595.28, pageHeight: 396.85 });
  const text = latin1(pdf);

  it("is a PDF that ends where it should", () => {
    expect(text.startsWith("%PDF-1.4\n")).toBe(true);
    expect(text.endsWith("%%EOF\n")).toBe(true);
  });

  it("points every cross-reference entry at its object", () => {
    const xref = Number(/startxref\n(\d+)\n/.exec(text)?.[1]);
    expect(text.slice(xref, xref + 4)).toBe("xref");
    const entries = [...text.slice(xref).matchAll(/(\d{10}) 00000 n /g)].map((m) => Number(m[1]));
    expect(entries).toHaveLength(5);
    entries.forEach((offset, i) =>
      expect(text.slice(offset).startsWith(`${i + 1} 0 obj`)).toBe(true),
    );
  });

  it("embeds the JPEG unchanged, with its size and the page size", () => {
    const start = text.indexOf("stream\n") + "stream\n".length;
    expect(Array.from(pdf.subarray(start, start + jpeg.length))).toEqual(Array.from(jpeg));
    expect(text).toContain(`/Width 300 /Height 200`);
    expect(text).toContain(`/Length ${jpeg.length}`);
    expect(text).toContain("/MediaBox [0 0 595.28 396.85]");
  });

  it("refuses an empty size", () => {
    expect(() => imagePdf(jpeg, { width: 0, height: 1, pageWidth: 1, pageHeight: 1 })).toThrow();
  });
});

describe("documentPageSize", () => {
  it("uses the real sizes of A4 and ID cards, in points", () => {
    const a4 = documentPageSize("a4", 210, 297);
    expect(a4.width).toBeCloseTo(595.28, 1);
    expect(a4.height).toBeCloseTo(841.89, 1);
    const card = documentPageSize("id-card", 856, 540);
    expect(card.width).toBeCloseTo(242.65, 1);
    expect(card.height).toBeCloseTo(153.01, 1);
  });

  it("keeps a free document's proportions at A4 width", () => {
    const page = documentPageSize("auto", 400, 200);
    expect(page.width / page.height).toBeCloseTo(2, 6);
  });
});

describe("cropImage", () => {
  const image = { width: 4, height: 3, data: new Uint8ClampedArray(48).map((_, i) => i) };

  it("cuts out the rectangle", () => {
    const cut = cropImage(image, { x: 1, y: 1, width: 2, height: 2 });
    expect(cut.width).toBe(2);
    expect(cut.height).toBe(2);
    expect(Array.from(cut.data.subarray(0, 4))).toEqual([20, 21, 22, 23]);
    expect(Array.from(cut.data.subarray(8, 12))).toEqual([36, 37, 38, 39]);
  });

  it("clamps to the image", () => {
    const cut = cropImage(image, { x: -2, y: 2, width: 10, height: 10 });
    expect([cut.width, cut.height]).toEqual([4, 1]);
    expect(cut.data[0]).toBe(32);
  });

  it("centres a square around a face", () => {
    expect(portraitBox({ x: 10, y: 20, width: 40, height: 50 }, 2)).toEqual({
      x: -20,
      y: -5,
      width: 100,
      height: 100,
    });
  });
});

import type { ImagePdfOptions } from "./pdf.model";

const encoder = new TextEncoder();

/**
 * Writes a one-page PDF that shows one JPEG image, stretched over the whole
 * page. The JPEG goes in as is (`/DCTDecode`), so nothing is re-encoded and
 * no PDF library is needed.
 *
 * @param jpeg - The JPEG file's bytes (baseline, RGB).
 * @param options - The image's size in pixels and the page's size in points.
 * @returns The PDF file's bytes.
 * @throws {Error} When a size isn't positive.
 */
export function imagePdf(jpeg: Uint8Array, options: ImagePdfOptions): Uint8Array<ArrayBuffer> {
  const { width, height, pageWidth, pageHeight } = options;
  if (!(width > 0 && height > 0 && pageWidth > 0 && pageHeight > 0)) {
    throw new Error("The image and the page need a positive width and height.");
  }
  const w = pageWidth.toFixed(2);
  const h = pageHeight.toFixed(2);
  const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (body: string) => {
    offsets.push(length);
    push(`${offsets.length} 0 obj\n${body}\nendobj\n`);
  };

  // The binary comment marks the file as binary for tools that guess.
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  object("<< /Type /Catalog /Pages 2 0 R >>");
  object("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] ` +
      "/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>",
  );
  offsets.push(length);
  push(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  push(jpeg);
  push("\nendstream\nendobj\n");
  object(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xref = length;
  push(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`);
  for (const offset of offsets) push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const file = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    file.set(chunk, at);
    at += chunk.length;
  }
  return file;
}

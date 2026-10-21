import { grayscale, readQrCode } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { QR_SYMBOL, squareCorners } from "../../samples/samples";

/**
 * Finds and decodes the QR code in the image.
 *
 * @param input - The image.
 * @returns The image with the code's outline, its text and details.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const code = readQrCode(grayscale(image));

  // The sample's symbol was drawn as a 125-pixel square turned 8° about
  // (160, 120): its corners, top-left first.
  const drawn = squareCorners(QR_SYMBOL);
  const cornerError = code
    ? Math.max(...code.corners.map((c, k) => Math.hypot(c.x - drawn[k].x, c.y - drawn[k].y)))
    : -1;
  return {
    images: [
      {
        label: code ? "Code found" : "No code found",
        image,
        overlay: code ? { polygons: [code.corners], points: [code.corners[0]] } : undefined,
      },
    ],
    tables: [
      {
        label: "Decoded",
        rows: code
          ? [
              ["text", code.text],
              [
                "version",
                `${code.version} (${17 + 4 * code.version} x ${17 + 4 * code.version} modules)`,
              ],
              ["error correction", code.errorCorrectionLevel],
              ["bytes", code.bytes.length],
              ...code.corners.map((c, k): [string, string] => [
                ["top-left", "top-right", "bottom-right", "bottom-left"][k],
                `${round(c.x, 1)}, ${round(c.y, 1)}`,
              ]),
            ]
          : [["text", "-"]],
      },
    ],
    values: {
      text: code?.text ?? "",
      version: code?.version ?? 0,
      level: code?.errorCorrectionLevel ?? "",
      cornerError: round(cornerError, 2),
    },
  };
}

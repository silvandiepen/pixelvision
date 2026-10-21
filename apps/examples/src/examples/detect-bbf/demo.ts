import { detectBbf, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { PORTRAIT_FACE } from "../../samples/samples";
import type { BbfResources, DetectBbfDemoOptions } from "./demo.model";

/**
 * Finds faces with the BBF face cascade.
 *
 * @param input - The image and detector settings; `resources` is the cascade
 *   (`import { bbfFace } from "pixelvision/cascades/bbf-face"`).
 * @returns The image with a box around every face.
 */
export function demo({
  image,
  options,
  resources,
}: DemoInput<DetectBbfDemoOptions, BbfResources>): DemoOutput {
  const faces = detectBbf(grayscale(image), resources, {
    interval: options.interval,
    minNeighbors: options.minNeighbors,
  });

  const boxes = faces.map(({ x, y, width, height }) => [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ]);
  const first = faces[0];
  return {
    images: [{ label: `${faces.length} found`, image, overlay: { polygons: boxes } }],
    tables: [
      {
        label: "Faces",
        columns: ["x", "y", "width", "height", "neighbours"],
        rows: faces.map((f) => [
          Math.round(f.x),
          Math.round(f.y),
          Math.round(f.width),
          Math.round(f.height),
          f.neighbors,
        ]),
      },
    ],
    values: {
      count: faces.length,
      // Distance from the first face's centre to the drawn face's centre.
      centreOffset: first
        ? Math.round(
            Math.hypot(
              first.x + first.width / 2 - PORTRAIT_FACE.x,
              first.y + first.height / 2 - PORTRAIT_FACE.y,
            ),
          )
        : -1,
    },
  };
}

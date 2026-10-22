import { detectHaar, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { PHOTO_FACE } from "../../samples/samples";
import type { Cascades, DetectHaarDemoOptions } from "./demo.model";

/**
 * Finds faces (or eyes, profiles, upper bodies) with a Haar cascade.
 *
 * @param input - The image, the chosen cascade and the detector settings;
 *   `resources` holds the loaded cascades.
 * @returns The image with a box around every detection.
 */
export function demo({
  image,
  options,
  resources,
}: DemoInput<DetectHaarDemoOptions, Cascades>): DemoOutput {
  // e.g. import { frontalFace } from "pixelvision/cascades/frontal-face";
  const cascade = resources[options.cascade];
  const detections = detectHaar(grayscale(image), cascade, {
    scaleFactor: options.scaleFactor,
    minNeighbors: options.minNeighbors,
    edgeDensity: options.skipFlat ? 0.07 : false,
  });

  const boxes = detections.map(({ x, y, width, height }) => [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ]);
  const first = detections[0];
  return {
    images: [{ label: `${detections.length} found`, image, overlay: { polygons: boxes } }],
    tables: [
      {
        label: "Detections",
        columns: ["x", "y", "width", "height", "neighbours"],
        rows: detections.map((d) => [d.x, d.y, d.width, d.height, d.neighbors]),
      },
    ],
    values: {
      count: detections.length,
      // Distance from the first detection's centre to the centre of the face labelled by hand.
      centreOffset: first
        ? Math.round(
            Math.hypot(
              first.x + first.width / 2 - (PHOTO_FACE.x + PHOTO_FACE.width / 2),
              first.y + first.height / 2 - (PHOTO_FACE.y + PHOTO_FACE.height / 2),
            ),
          )
        : -1,
      width: first?.width ?? 0,
    },
  };
}

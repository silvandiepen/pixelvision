import { detectArucoMarkers, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { MARKERS, squareCorners } from "../../samples/samples";
import type { DetectArucoMarkersDemoOptions } from "./demo.model";

/**
 * Finds the ArUco markers in the image.
 *
 * @param input - The image and the dictionary to look for.
 * @returns The image with each marker outlined, its id and corners.
 */
export function demo({ image, options }: DemoInput<DetectArucoMarkersDemoOptions>): DemoOutput {
  const markers = detectArucoMarkers(grayscale(image), { dictionary: options.dictionary });

  // How far each corner is from where the sample drew that marker's corner.
  const errors = markers.flatMap(({ id, corners }) => {
    const drawn = MARKERS.find((m) => m.id === id);
    if (!drawn) return [];
    const truth = squareCorners(drawn);
    return corners.map((c, k) => Math.hypot(c.x - truth[k].x, c.y - truth[k].y));
  });
  return {
    images: [
      {
        label: `${markers.length} found`,
        image,
        // The first corner of each is its own top-left, however it is turned.
        overlay: {
          polygons: markers.map((m) => m.corners),
          points: markers.map((m) => m.corners[0]),
        },
      },
    ],
    tables: [
      {
        label: "Markers, by id",
        columns: ["id", "top-left", "top-right", "bottom-right", "bottom-left"],
        rows: markers.map(({ id, corners }) => [
          id,
          ...corners.map((c) => `${round(c.x, 1)}, ${round(c.y, 1)}`),
        ]),
      },
    ],
    values: {
      count: markers.length,
      ids: markers.map((m) => m.id).join(", "),
      cornerError: errors.length ? round(Math.max(...errors), 2) : -1,
    },
  };
}

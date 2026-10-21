import { groupRectangles } from "pixelvision";
import type { Detection } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { blankImage } from "../../utils/visualize";
import type { GroupRectanglesDemoOptions } from "./demo.model";

/**
 * Merges overlapping raw detections into groups.
 *
 * @param input - Raw rectangles (`x, y, width, height` per row) and the minimum group size.
 * @returns Raw rectangles as thin lines, groups as filled boxes.
 */
export function demo({ options }: OptionsInput<GroupRectanglesDemoOptions>): DemoOutput {
  const raw: Detection[] = options.rectangles.map(([x, y, width, height]) => ({
    x,
    y,
    width,
    height,
    neighbors: 1,
    confidence: 1,
  }));
  const groups = groupRectangles(raw, options.minNeighbors);

  const corners = ({ x, y, width, height }: Detection) => [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
  return {
    images: [
      {
        label: `${raw.length} raw, ${groups.length} grouped`,
        image: blankImage(320, 240),
        overlay: {
          lines: raw.flatMap((r) =>
            corners(r).map((p, i, all) => ({ from: p, to: all[(i + 1) % 4] })),
          ),
          polygons: groups.map(corners),
        },
      },
    ],
    tables: [
      {
        label: "Groups",
        columns: ["x", "y", "width", "height", "neighbours"],
        rows: groups.map((g) => [g.x, g.y, g.width, g.height, g.neighbors]),
      },
    ],
    values: {
      groupCount: groups.length,
      groups: groups.map((g) => `${g.x},${g.y},${g.width},${g.height}/${g.neighbors}`).join(";"),
    },
  };
}

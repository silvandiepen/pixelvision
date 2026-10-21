import { camShift, createMatrix } from "pixelvision";
import type { Rect } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round } from "../../utils/format";
import { rectPolygon } from "../../utils/geometry";
import type { CamShiftDemoOptions } from "./demo.model";

/**
 * Tracks a tilted ellipse on a probability image, feeding each result's
 * window into the next call as a video tracker would.
 *
 * @param input - The ellipse's tilt in degrees and the number of frames.
 * @returns The probability image with the box and window, and the box.
 */
export function demo({ options }: OptionsInput<CamShiftDemoOptions>): DemoOutput {
  // An ellipse with half-axes 60 and 25 around (160, 120), its long axis
  // tilted by `angle`, at full probability.
  const probability = createMatrix(320, 240);
  const t = (options.angle * Math.PI) / 180;
  for (let y = 0; y < 240; y++) {
    for (let x = 0; x < 320; x++) {
      const u = (x - 160) * Math.cos(t) + (y - 120) * Math.sin(t);
      const v = -(x - 160) * Math.sin(t) + (y - 120) * Math.cos(t);
      if ((u / 60) ** 2 + (v / 25) ** 2 <= 1) probability.data[y * 320 + x] = 255;
    }
  }

  // Start small and off-centre; the window grows to the object over the frames.
  let window: Rect = { x: 140, y: 95, width: 30, height: 30 };
  let result = camShift(probability, window);
  for (let frame = 1; frame < options.frames; frame++) {
    window = result.window;
    result = camShift(probability, window);
  }
  const { box } = result;

  return {
    images: [
      {
        label: "Box and next window",
        image: probability,
        overlay: { polygons: [box.corners, rectPolygon(result.window)], points: [box.center] },
      },
    ],
    tables: [
      {
        label: "Box",
        columns: ["centre", "width", "height", "angle (°)"],
        rows: [
          [
            `${round(box.center.x, 3)}, ${round(box.center.y, 3)}`,
            round(box.width, 3),
            round(box.height, 3),
            round(box.angle, 3),
          ],
        ],
      },
    ],
    values: {
      centre: `${round(box.center.x, 6)},${round(box.center.y, 6)}`,
      longAxis: round(box.height, 3),
      shortAxis: round(box.width, 3),
      angle: round(box.angle, 3),
    },
  };
}

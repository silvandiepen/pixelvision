import { canny, gaussianBlur, grayscale, houghLines } from "pixelvision";
import type { DemoInput, DemoOutput, Segment } from "../example.model";
import { round } from "../../utils/format";
import { lineThrough, sameLine } from "../../utils/geometry";
import { houghLineToSegment } from "../../utils/visualize";
import { DESK_CARD_CORNERS } from "../../samples/samples";
import type { FindLinesDemoOptions } from "./demo.model";

/**
 * Gray → blur → Canny → Hough: finds the straight lines in a photo and
 * draws them over it.
 *
 * @param input - The image, the vote threshold and the line limit.
 * @returns The photo with the lines.
 */
export function demo({ image, options }: DemoInput<FindLinesDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const edges = canny(gaussianBlur(gray, { kernelSize: 5 }), { low: 40, high: 100 });
  const lines = houghLines(edges, { threshold: options.threshold, maxLines: options.maxLines });

  const segments = lines
    .map((line) => houghLineToSegment(line, image.width, image.height))
    .filter((segment): segment is Segment => segment !== null);

  // Which of the card's four sides (known from the sample) were found?
  const cardSidesFound = DESK_CARD_CORNERS.filter((corner, i) => {
    const side = lineThrough(corner, DESK_CARD_CORNERS[(i + 1) % 4]);
    return lines.some((line) => sameLine(line, side, 3, (2 * Math.PI) / 180));
  }).length;

  return {
    images: [
      { label: "Edges", image: edges },
      { label: "Lines", image, overlay: { lines: segments } },
    ],
    tables: [
      {
        label: "Lines, strongest first",
        columns: ["rho (px)", "theta (°)", "votes"],
        rows: lines.map((line) => [
          round(line.rho, 1),
          round((line.theta * 180) / Math.PI, 1),
          line.votes,
        ]),
      },
    ],
    values: { lineCount: lines.length, cardSidesFound },
  };
}

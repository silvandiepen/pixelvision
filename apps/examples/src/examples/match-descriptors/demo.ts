import {
  describeOrb,
  detectFast,
  fromImageData,
  gaussianBlur,
  grayscale,
  matchDescriptors,
  toImageData,
  transformPoint,
  warpAffine,
} from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { sideBySide, strongest } from "../../utils/points";
import type { MatchDescriptorsDemoOptions } from "./demo.model";

/**
 * Matches ORB descriptors between the image and a rotated, scaled copy, and
 * checks each match against where the point really went.
 *
 * @param input - The image, the copy's rotation and scale, and the match filters.
 * @returns Both images side by side with lines between matches.
 */
export function demo({ image, options }: DemoInput<MatchDescriptorsDemoOptions>): DemoOutput {
  const cx = image.width / 2;
  const cy = image.height / 2;
  const t = (options.rotation * Math.PI) / 180;
  const c = Math.cos(t) * options.scale;
  const s = Math.sin(t) * options.scale;
  // Original → copy, and the inverse the warp needs (copy → original).
  const forward = [c, -s, cx - c * cx + s * cy, s, c, cy - s * cx - c * cy, 0, 0, 1];
  const d = c * c + s * s;
  const inverse = [
    c / d,
    s / d,
    cx - (c * cx + s * cy) / d,
    -s / d,
    c / d,
    cy - (-s * cx + c * cy) / d,
  ];
  const copy = toImageData(warpAffine(fromImageData(image), inverse));

  const describe = (rgba: typeof image) => {
    const gray = gaussianBlur(grayscale(rgba), { kernelSize: 5 });
    const points = strongest(detectFast(gray, { threshold: 10 }), 300);
    return { points, descriptors: describeOrb(gray, points) };
  };
  const a = describe(image);
  const b = describe(copy);
  const matches = matchDescriptors(a.descriptors, b.descriptors, {
    ratio: options.ratio,
    crossCheck: options.crossCheck,
  });

  // A match is correct when the copy's point is within 3 px of where the original point went.
  const correct = matches.filter((m) => {
    const expected = transformPoint(forward, a.points[m.query]);
    const found = b.points[m.train];
    return Math.hypot(expected.x - found.x, expected.y - found.y) <= 3;
  }).length;

  return {
    images: [
      {
        label: `${matches.length} matches, ${correct} correct`,
        image: sideBySide(image, copy),
        overlay: {
          lines: matches.map((m) => ({
            from: a.points[m.query],
            to: { x: b.points[m.train].x + image.width, y: b.points[m.train].y },
          })),
        },
      },
    ],
    values: {
      matchCount: matches.length,
      correctShare: matches.length ? round(correct / matches.length, 3) : 0,
      sortedByDistance: matches.every((m, i) => i === 0 || matches[i - 1].distance <= m.distance),
    },
  };
}

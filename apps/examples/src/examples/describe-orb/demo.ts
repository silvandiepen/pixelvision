import {
  createMatrix,
  describeOrb,
  detectFast,
  gaussianBlur,
  grayscale,
  hammingDistance,
  median,
  transformPoint,
  warpAffine,
} from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { strongest } from "../../utils/points";
import type { DescribeOrbDemoOptions } from "./demo.model";

/**
 * Describes the strongest corners with ORB, then describes the same points
 * in a rotated copy of the image and compares the two sets of descriptors.
 *
 * @param input - The image, how many corners and the rotation in degrees.
 * @returns The descriptors as a bit image, and how alike they are.
 */
export function demo({ image, options }: DemoInput<DescribeOrbDemoOptions>): DemoOutput {
  const gray = gaussianBlur(grayscale(image), { kernelSize: 5 });
  const corners = strongest(detectFast(gray, { threshold: 20 }), options.count);
  const descriptors = describeOrb(gray, corners); // 32 bytes (256 bits) per corner

  // Rotate around the centre; the same points move to new places.
  const cx = gray.width / 2;
  const cy = gray.height / 2;
  const t = (options.rotation * Math.PI) / 180;
  const [cos, sin] = [Math.cos(t), Math.sin(t)];
  const toInput = [cos, sin, cx - cos * cx - sin * cy, -sin, cos, cy + sin * cx - cos * cy];
  const toOutput = [
    cos,
    -sin,
    cx - cos * cx + sin * cy,
    sin,
    cos,
    cy - sin * cx - cos * cy,
    0,
    0,
    1,
  ];
  const rotated = warpAffine(gray, toInput);
  const moved = corners.map((corner) => ({
    ...transformPoint(toOutput, corner),
    score: corner.score,
  }));
  const rotatedDescriptors = describeOrb(rotated, moved);

  const same = corners.map((_, i) => hammingDistance(descriptors, i, rotatedDescriptors, i));
  const other = corners.map((_, i) =>
    hammingDistance(descriptors, i, rotatedDescriptors, (i + 1) % corners.length),
  );

  // One row of 256 black or white pixels per descriptor.
  const bits = createMatrix(256, corners.length);
  for (let row = 0; row < corners.length; row++) {
    for (let bit = 0; bit < 256; bit++) {
      const byte = descriptors.data[row * 32 + (bit >> 3)];
      bits.data[row * 256 + bit] = (byte >> (bit & 7)) & 1 ? 255 : 0;
    }
  }

  return {
    images: [
      { label: "Corners", image: gray, overlay: { points: corners } },
      { label: "Rotated, same points", image: rotated, overlay: { points: moved } },
      { label: "Descriptors, one row each", image: bits },
    ],
    values: {
      width: descriptors.width,
      rows: descriptors.height,
      sameMedian: median(same),
      otherMedian: median(other),
    },
  };
}

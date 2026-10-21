import { gaussianBlur, grayscale, laplacian } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { normalizeToGray } from "../../utils/visualize";
import type { SharpnessDemoOptions } from "./demo.model";

/**
 * Scores how sharp a photo is: the variance of its Laplacian. Blurs it by
 * more and more to show the score falling.
 *
 * @param input - The photo, and how much to blur the copy shown.
 * @returns The score for each amount of blur.
 */
export function demo({ image, options }: DemoInput<SharpnessDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const sharpness = (m: Matrix<"u8">) => {
    const { data } = laplacian(m);
    let sum = 0;
    let squares = 0;
    for (const value of data) {
      sum += value;
      squares += value * value;
    }
    const mean = sum / data.length;
    return squares / data.length - mean * mean;
  };

  const kernels = [1, 3, 5, 7, 9, 13];
  const scores = kernels.map((k) =>
    sharpness(k === 1 ? gray : gaussianBlur(gray, { kernelSize: k })),
  );
  const blurred = options.blur > 1 ? gaussianBlur(gray, { kernelSize: options.blur }) : gray;
  const shownLaplacian = laplacian(blurred);

  return {
    images: [
      { label: `Blurred ${options.blur} x ${options.blur}`, image: blurred },
      {
        label: `|Laplacian|, sharpness ${round(sharpness(blurred), 1)}`,
        image: normalizeToGray(shownLaplacian.data.map(Math.abs), blurred.width, blurred.height),
      },
    ],
    charts: [
      { label: "Sharpness by blur (none, 3, 5, 7, 9, 13)", values: scores.map((s) => round(s, 1)) },
    ],
    values: {
      sharp: round(scores[0], 1),
      // Even a 3 x 3 blur costs more than half the score.
      lightBlurShare: round(scores[1] / scores[0], 3),
      falling: scores.every((s, i) => i === 0 || s < scores[i - 1]),
    },
  };
}

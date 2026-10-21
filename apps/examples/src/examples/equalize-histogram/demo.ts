import { equalizeHistogram, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { histogram, minMax, standardDeviation } from "../../utils/stats";

/**
 * Spreads the gray levels of a dull image over the full range.
 *
 * @param input - The image.
 * @returns Before and after, with their histograms.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const gray = grayscale(image);
  const equalized = equalizeHistogram(gray);
  const [inputMin, inputMax] = minMax(gray);
  const [outputMin, outputMax] = minMax(equalized);

  return {
    images: [
      { label: "Gray", image: gray },
      { label: "Equalised", image: equalized },
    ],
    charts: [
      { label: "Histogram before", values: histogram(gray) },
      { label: "Histogram after", values: histogram(equalized) },
    ],
    values: {
      inputMin,
      inputMax,
      outputMin,
      outputMax,
      contrastGain: round(standardDeviation(equalized) / standardDeviation(gray), 2),
    },
  };
}

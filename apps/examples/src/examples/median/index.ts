import { defineExample } from "../define";
import { demo } from "./demo";
import type { MedianDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const medianExample = defineExample<MedianDemoOptions>({
  slug: "median",
  title: "median",
  functions: ["median"],
  category: "math",
  description:
    "Returns the median of a list of numbers: the middle value, which, unlike the mean, isn't dragged around by a few outliers. Optical-flow and tracking code uses it to filter bad matches.",
  howItWorks: [
    "It copies the values and finds the middle with quickselect (partial sorting), so on average it's linear time. For an even count it returns the mean of the two middle values. Your array is never reordered.",
  ],
  howToTest:
    "Takes the eight default values, sorted 1, 2, 3, 5, 6, 7, 8, 9, and checks the median is (5 + 6) / 2 = 5.5 and the input array wasn't reordered.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "values",
      label: "Values",
      description: "The numbers.",
      default: [[7, 1, 9, 3, 5, 8, 2, 6]],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "median", label: "Mean of the two middle values", equals: 5.5 },
    { key: "inputUnchanged", label: "Input not reordered", equals: true },
  ],
});

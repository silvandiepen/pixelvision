import { defineExample } from "../define";
import { demo } from "./demo";
import type { HoughLinesDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const houghLinesExample = defineExample<HoughLinesDemoOptions>({
  slug: "hough-lines",
  title: "houghLines",
  functions: ["houghLines"],
  category: "image",
  description:
    "Finds straight lines in an edge image with the Hough transform, strongest first. Feed it the output of `canny`.",
  howItWorks: [
    "A line is written in normal form, `x cos θ + y sin θ = ρ`: `θ` is the angle of its normal and `ρ` its distance from the top-left corner. Every edge pixel votes for every `(ρ, θ)` line through it, in an accumulator with one cell per `rhoStep` pixels and `thetaStep` radians.",
    "Cells that are local maxima with at least `threshold` votes become lines, sorted by votes. A horizontal line has θ = 90°, a vertical one θ = 0°. Finer steps find angles more precisely but split the votes over more cells; so does noise that makes an edge wobble between two rows, which is why the red rectangle's sides score lower than the triangle's.",
  ],
  howToTest:
    "Runs on the edges of the shapes sample and compares the lines with the blue triangle's three sides, computed from the corners the sample was drawn with: each side must match a detected line within 3 pixels and 2°.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "threshold",
      label: "Votes",
      description: "Minimum number of edge pixels on a line.",
      min: 10,
      max: 200,
      step: 1,
      default: 60,
    },
    {
      type: "select",
      key: "thetaStep",
      label: "Angle step",
      description: "Angle resolution of the accumulator, in degrees.",
      options: [
        { label: "0.5°", value: 0.5 },
        { label: "1°", value: 1 },
        { label: "2°", value: 2 },
      ],
      default: 1,
    },
    {
      type: "range",
      key: "maxLines",
      label: "Max lines",
      description: "Return at most this many lines.",
      min: 1,
      max: 30,
      step: 1,
      default: 10,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "lineCount", label: "Finds several lines", min: 4, max: 10 },
    { key: "triangleSidesFound", label: "All three triangle sides found", equals: 3 },
  ],
});

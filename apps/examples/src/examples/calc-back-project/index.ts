import { defineExample } from "../define";
import { demo } from "./demo";
import type { CalcBackProjectDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const calcBackProjectExample = defineExample<CalcBackProjectDemoOptions>({
  slug: "calc-back-project",
  title: "calcBackProject",
  functions: ["calcBackProject", "calcHist", "rgbToHsv"],
  category: "image",
  description:
    "Lights up the pixels whose colour matches a histogram: learn the hue of an object once, then find it in every frame. The result feeds `meanShift` and `camShift`.",
  howItWorks: [
    "Each pixel's value in the chosen channel is put in its histogram bin, exactly as `calcHist` bins it, and replaced by that bin's count times `scale`, rounded and clamped to 0–255. Values outside the histogram's range become 0.",
    "Hue (channel 0 of `rgbToHsv`, 0–179) ignores brightness, so a hue histogram finds an object in light and shade. Gray pixels have hue 0, which is also red's, so learn from a mask that holds only the object. Scaling by 255 over the largest count makes the best-matching bin 255. Results are identical to OpenCV's `calcBackProject`.",
  ],
  howToTest:
    "Learns the hue of the green circle in the shapes sample (centre 220, 70, radius 44) from a disc of radius 40 inside it: every learnt pixel has the same hue, so that bin holds all of them and back-projects to 255. The gray background and the red rectangle have hue 0 and the blue triangle hue 110, none in the green bin, so they become 0. The lit pixels are the circle: between π · (44 − 0.71)² ≈ 5,890 (pixels fully inside) and π · (44 + 0.71)² ≈ 6,278 (pixels touching it).",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "bins",
      label: "Hue bins",
      description: "Number of equal slices of 0–179.",
      options: [
        { label: "8", value: 8 },
        { label: "16", value: 16 },
        { label: "30", value: 30 },
        { label: "180", value: 180 },
      ],
      default: 16,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "circleCentre", label: "Circle: the best bin, 255", equals: 255 },
    { key: "background", label: "Background: 0", equals: 0 },
    { key: "rectangle", label: "Red rectangle: 0", equals: 0 },
    { key: "triangle", label: "Blue triangle: 0", equals: 0 },
    { key: "litPixels", label: "Only the circle lit", min: 5890, max: 6278 },
  ],
});

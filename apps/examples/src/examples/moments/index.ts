import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const momentsExample = defineExample<Record<string, never>>({
  slug: "moments",
  title: "moments",
  functions: ["moments"],
  category: "shape",
  description:
    "Computes a shape's moments: sums over its area that give its area, its centre of mass and which way it points, and that feed shape matching (see `huMoments`).",
  howItWorks: [
    "The spatial moment m_pq adds up x^p · y^q over every point inside the shape. m00 is the area and (m10 / m00, m01 / m00) is the centroid. For a polygon these integrals have exact formulas over its edges (Green's theorem), so it doesn't fill pixels. Like OpenCV, it gives the same result for clockwise and anticlockwise outlines.",
    "The central moments mu_pq are the same sums about the centroid, so they don't change when the shape moves; ½ atan2(2·mu11, mu20 − mu02) is the direction of its long axis. The normalised moments nu_pq divide by a power of the area, so they don't change with size either.",
  ],
  howToTest:
    "The shapes sample's triangle has corners (40, 212), (110, 118) and (180, 212). Its area must be ½ x 140 x 94 = 6,580, its centroid the average of its corners, (110, 180.67), and, being symmetric about x = 110 and wider than tall, its orientation 0°. The traced outline's centroid must be within a pixel of the drawn one.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "area", label: "½ x 140 x 94", equals: 6580 },
    { key: "centroidX", label: "Centroid x = 110", equals: 110 },
    { key: "centroidY", label: "Centroid y = (212 + 118 + 212) / 3", equals: 180.67 },
    { key: "orientation", label: "Lies flat", equals: 0 },
    { key: "tracedOffset", label: "Traced centroid within a pixel", max: 1 },
  ],
});

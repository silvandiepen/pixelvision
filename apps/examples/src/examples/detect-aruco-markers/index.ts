import { defineExample } from "../define";
import { demo } from "./demo";
import type { DetectArucoMarkersDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const detectArucoMarkersExample = defineExample<DetectArucoMarkersDemoOptions>({
  slug: "detect-aruco-markers",
  title: "detectArucoMarkers",
  functions: ["detectArucoMarkers", "grayscale"],
  category: "detection",
  description:
    "Finds ArUco markers, the square black-and-white fiducials used for camera pose and augmented reality, and returns each one's id and corners, top-left corner first however it is turned. Print a marker from the generateArucoMarker page and show it to the webcam.",
  howItWorks: [
    "The gray image is thresholded against its local mean at three window sizes (3, 13 and 23 pixels, darker by 7). Outlines that simplify to convex quadrilaterals of a plausible size, away from the image edge, become candidates; the same outline found at several window sizes is read once.",
    "Each candidate is unwarped to a square of 4 x 4 pixels per cell, split at Otsu's level, and every cell set by majority. The black border must be (nearly) all black; the inner bits are compared with every marker of the dictionary at all four rotations, and the first close enough wins. The rotation tells which corner is the marker's top-left.",
    "This is OpenCV's ArucoDetector with its default parameters: ids and corners are identical to OpenCV's. Corners are pixels of the marker's outline; they aren't refined to subpixel accuracy.",
  ],
  howToTest:
    "The sample has DICT_4X4_50 markers 3, 17 and 42, drawn as squares of 72, 64 and 60 pixels about (70, 75), (232, 72) and (160, 178), turned 0°, 30° and -15°. All three must be found with those ids, and every corner within 2 pixels of the drawn corner it belongs to (outline pixels sit up to a pixel inside the drawn edge).",
  input: "image",
  sample: "markers",
  controls: [
    {
      type: "select",
      key: "dictionary",
      label: "Dictionary",
      description: "Which markers to look for: 4 x 4 bits (50 markers) or 6 x 6 bits (250).",
      options: [
        { label: "DICT_4X4_50", value: "4x4_50" },
        { label: "DICT_6X6_250", value: "6x6_250" },
      ],
      default: "4x4_50",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "count", label: "Three markers", equals: 3 },
    { key: "ids", label: "Ids 3, 17 and 42", equals: "3, 17, 42" },
    { key: "cornerError", label: "Corners within 2 px of the drawn ones", min: 0, max: 2 },
  ],
});

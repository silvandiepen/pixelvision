import { defineExample } from "../define";
import { demo } from "./demo";
import type { GenerateArucoMarkerDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const generateArucoMarkerExample = defineExample<GenerateArucoMarkerDemoOptions>({
  slug: "generate-aruco-marker",
  title: "generateArucoMarker",
  functions: ["generateArucoMarker", "detectArucoMarkers", "createMatrix"],
  category: "detection",
  description:
    "Draws a marker of a predefined ArUco dictionary, ready to print or show on screen: a black border around a grid of black and white cells. Leave a white margin around it.",
  howItWorks: [
    "Each marker is stored as its bits, row by row. The marker is built with one pixel per cell (the black border, then the bits, 1 as white) and scaled to `size` with nearest pixels, as OpenCV's `generateImageMarker` does, so a size that isn't a multiple of the cells gives some cells one pixel more. The pixels are identical to OpenCV's.",
    "The dictionaries are OpenCV's DICT_4X4_50 (50 markers of 4 x 4 bits) and DICT_6X6_250 (250 markers of 6 x 6 bits). A wider border (`borderBits`) is easier to find from afar.",
  ],
  howToTest:
    "DICT_4X4_50 marker 0 is stored as the bytes 0xB5 0x32: rows 1011, 0101, 0011 and 0010. At the default 120 pixels and a border of 1 the image is 120 x 120, its first inner row reads 1011, and 8 of its 36 cells are white (3 + 2 + 2 + 1). Put on a white page, detectArucoMarkers must read it back as marker 0.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "id",
      label: "Id",
      description: "Index of the marker in the dictionary.",
      min: 0,
      max: 49,
      step: 1,
      default: 0,
    },
    {
      type: "select",
      key: "dictionary",
      label: "Dictionary",
      description: "Marker family.",
      options: [
        { label: "DICT_4X4_50", value: "4x4_50" },
        { label: "DICT_6X6_250", value: "6x6_250" },
      ],
      default: "4x4_50",
    },
    {
      type: "select",
      key: "size",
      label: "Size",
      description: "Width and height of the image in pixels.",
      options: [
        { label: "60 px", value: 60 },
        { label: "120 px", value: 120 },
        { label: "200 px", value: 200 },
      ],
      default: 120,
    },
    {
      type: "range",
      key: "borderBits",
      label: "Border",
      description: "Width of the black border, in cells.",
      min: 1,
      max: 3,
      step: 1,
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "size", label: "120 x 120 pixels", equals: 120 },
    { key: "topInnerRow", label: "First inner row 1011", equals: "1011" },
    { key: "whiteCells", label: "8 white cells", equals: 8 },
    { key: "readBack", label: "Detected as marker 0", equals: 0 },
  ],
});

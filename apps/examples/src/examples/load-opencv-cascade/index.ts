import { defineExample } from "../define";
import { demo } from "./demo";
import type { LoadOpenCvCascadeDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const loadOpenCvCascadeExample = defineExample<LoadOpenCvCascadeDemoOptions>({
  slug: "load-opencv-cascade",
  title: "loadOpenCvCascade",
  functions: ["loadOpenCvCascade", "detectHaar", "grayscale"],
  category: "detection",
  description:
    "Reads an OpenCV Haar cascade (a haarcascade_*.xml file) so detectHaar can run it: the faces, eyes, smiles, bodies or licence plates OpenCV ships cascades for, or one you trained. Here a tiny hand-written cascade finds dark blobs.",
  howItWorks: [
    "A small built-in XML reader parses the `opencv_storage` file; nothing else is needed. Both of OpenCV's layouts are read: the current one (`opencv_traincascade`, OpenCV 3 and later) and the older `opencv-haar-classifier` one, including tilted (45°) features and trees with more than one split. Other files, LBP or HOG cascades and cascades whose stages form a tree are rejected with an error that says why.",
    "The cascade is marked to be scored as OpenCV scores it: each window's mean and deviation come from inside a one-pixel border, and at larger sizes each rectangle's weight follows its rounded area. A window at the cascade's own size scores exactly as in OpenCV; at other sizes detectHaar scales the features and OpenCV the image, so the merged detections agree within OpenCV's grouping tolerance.",
    "This cascade has one stage of two features, both `the middle is darker than around it`, one upright and one tilted. Both must fire, so it finds dark, roughly round blobs: the sample's pebbles.",
  ],
  howToTest:
    "The XML has a 24 x 24 window, one stage, two trees and a tilted feature; the parsed cascade must say so. On the pebbles sample (17 dark stones on a light table, none touching) it must find each stone once with the default settings: 17 detections, every one centred on a stone.",
  input: "image",
  sample: "pebbles",
  controls: [
    {
      type: "range",
      key: "scaleFactor",
      label: "Scale step",
      description: "How much larger each search size is than the last.",
      min: 1.05,
      max: 1.5,
      step: 0.05,
      default: 1.1,
    },
    {
      type: "range",
      key: "minNeighbors",
      label: "Min neighbours",
      description: "Raw hits a detection needs; 0 shows them ungrouped.",
      min: 0,
      max: 10,
      step: 1,
      default: 3,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "window", label: "24 x 24 window", equals: "24 x 24" },
    { key: "stages", label: "One stage", equals: 1 },
    { key: "trees", label: "Two trees", equals: 2 },
    { key: "tilted", label: "A tilted feature", equals: true },
    { key: "found", label: "All 17 pebbles", equals: 17 },
    { key: "offPebble", label: "Every detection on a pebble", equals: 0 },
  ],
});

import { defineExample } from "../define";
import { demo } from "./demo";
import type { MatchDescriptorsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const matchDescriptorsExample = defineExample<MatchDescriptorsDemoOptions>({
  slug: "match-descriptors",
  title: "matchDescriptors",
  functions: ["matchDescriptors"],
  category: "features",
  description:
    "Pairs up keypoints between two images by their descriptors: the basis of finding a known object in a photo, stitching panoramas, or following a scene as the camera moves.",
  howItWorks: [
    "For every descriptor in `query` it computes the Hamming distance to every descriptor in `train` and keeps the nearest (brute force). Matches further than `maxDistance` bits are dropped.",
    "Two optional filters remove ambiguous matches. The ratio test (Lowe's) keeps a match only when the best distance is clearly smaller than the second best: `best < ratio × second`. The cross-check keeps it only when the two descriptors are each other's nearest. Results are sorted by distance, best first. Some wrong matches always remain; `estimateHomography` and `estimateAffine` are built to ignore them.",
  ],
  howToTest:
    "Matches the card photo against a copy rotated 20° and scaled 0.9 around its centre. Because the transform is known, each match can be checked: most of the matches (with the ratio test and cross-check on) must land within 3 pixels of where the point really went.",
  input: "image",
  sample: "card-photo",
  webcam: false,
  controls: [
    {
      type: "range",
      key: "rotation",
      label: "Rotation (°)",
      description: "Rotation of the copy.",
      min: -180,
      max: 180,
      step: 1,
      default: 20,
    },
    {
      type: "range",
      key: "scale",
      label: "Scale",
      description: "Scale of the copy.",
      min: 0.5,
      max: 1.5,
      step: 0.05,
      default: 0.9,
    },
    {
      type: "range",
      key: "ratio",
      label: "Ratio",
      description: "Lowe's ratio test: 1 turns it off, lower keeps only clear matches.",
      min: 0.5,
      max: 1,
      step: 0.01,
      default: 0.8,
    },
    {
      type: "toggle",
      key: "crossCheck",
      label: "Cross-check",
      description: "Keep a match only when it's also the best match the other way round.",
      default: true,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "matchCount", label: "Enough matches", min: 10 },
    { key: "correctShare", label: "Most matches are correct", min: 0.7 },
    { key: "sortedByDistance", label: "Best first", equals: true },
  ],
});

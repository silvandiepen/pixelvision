import readme from "../../../../README.md?raw";
import differences from "../../../../docs/jsfeat-differences.md?raw";
import camera from "./guide/camera.md?raw";
import concepts from "./guide/concepts.md?raw";
import faceNeural from "./guide/face-neural.md?raw";
import fromJsfeat from "./guide/from-jsfeat.md?raw";
import fromOpencv from "./guide/from-opencv.md?raw";
import gettingStarted from "./guide/getting-started.md?raw";
import node from "./guide/node.md?raw";
import useCases from "./guide/use-cases.md?raw";
import why from "./guide/why.md?raw";
import reactNative from "./guide/react-native.md?raw";
import webWorkers from "./guide/web-workers.md?raw";
import type { Guide } from "./guides.model";

/**
 * Cuts one `## ` section out of a Markdown document.
 *
 * @param markdown - The document.
 * @param heading - The section's heading text, without the hashes.
 * @returns The section, heading included, or an empty string when it's missing.
 */
export function markdownSection(markdown: string, heading: string): string {
  const start = markdown.indexOf(`\n## ${heading}\n`);
  if (start === -1) return "";
  const end = markdown.indexOf("\n## ", start + 4);
  return markdown.slice(start + 1, end === -1 ? undefined : end).trim();
}

/**
 * Drops a document's first-level title, so the page can show its own.
 *
 * @param markdown - The document.
 * @returns The document without its `# ` line.
 */
export function withoutTitle(markdown: string): string {
  return markdown.replace(/^# .*\n+/, "");
}

/** Every documentation page, in sidebar order. */
export const GUIDES: readonly Guide[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    section: "start",
    description:
      "Install pixelvision, run a first pipeline, and get pixels in and out of a canvas.",
    markdown: gettingStarted,
  },
  {
    slug: "concepts",
    title: "Concepts",
    section: "start",
    description: "Matrices, pixel types, channels, coordinates and rounding.",
    markdown: concepts,
  },
  {
    slug: "why",
    title: "Why pixelvision",
    section: "start",
    description: "Small, plain, typed and tested, and where it stops.",
    markdown: why,
  },
  {
    slug: "use-cases",
    title: "Use cases",
    section: "start",
    description: "ID capture, document scanning, AR tracking, accessibility and teaching.",
    markdown: useCases,
  },
  {
    slug: "camera",
    title: "Camera and video frames",
    section: "guides",
    description: "Run a pipeline on every camera frame without stutter.",
    markdown: camera,
  },
  {
    slug: "web-workers",
    title: "Web Workers",
    section: "guides",
    description: "Move heavy processing off the main thread.",
    markdown: webWorkers,
  },
  {
    slug: "node",
    title: "Node with image files",
    section: "guides",
    description: "Decode images with sharp or pngjs and process them in Node.",
    markdown: node,
  },
  {
    slug: "react-native",
    title: "React Native",
    section: "guides",
    description: "Get camera pixels into pixelvision on Hermes.",
    markdown: reactNative,
  },
  {
    slug: "face-neural",
    title: "Neural face detection",
    section: "guides",
    description:
      "The optional @pixelvision/face-neural package: YuNet faces, landmarks and head turns.",
    markdown: faceNeural,
  },
  {
    slug: "from-jsfeat",
    title: "Coming from jsfeat",
    section: "guides",
    description: "What maps to what, and every place pixelvision behaves differently.",
    markdown: [
      fromJsfeat,
      markdownSection(readme, "jsfeat parity").replace("## jsfeat parity", "## What maps to what"),
      withoutTitle(differences),
    ].join("\n\n"),
  },
  {
    slug: "from-opencv",
    title: "Coming from OpenCV.js",
    section: "guides",
    description: "The OpenCV.js calls you know, and their pixelvision equivalents.",
    markdown: fromOpencv,
  },
];

/**
 * Finds a guide by slug.
 *
 * @param slug - The slug.
 * @returns The guide, or `undefined`.
 */
export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

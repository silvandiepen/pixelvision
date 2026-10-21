import { detectHaar, grayscale, loadOpenCvCascade } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { PEBBLES } from "../../samples/samples";
import type { LoadOpenCvCascadeDemoOptions } from "./demo.model";

// A tiny cascade in OpenCV's XML (the older opencv_haartraining layout):
// one stage of two features, both "the middle is darker than around it",
// one upright and one tilted 45°. Real cascades are the same, only longer:
// e.g. fetch("haarcascade_frontalface_default.xml").then((r) => r.text()).
const XML = `<?xml version="1.0"?>
<opencv_storage>
<dark_blob type_id="opencv-haar-classifier">
  <size>24 24</size>
  <stages>
    <_>
      <trees>
        <_>
          <!-- the middle square darker than the whole window -->
          <_>
            <feature>
              <rects>
                <_>0 0 24 24 1.</_>
                <_>6 6 12 12 -4.</_></rects>
              <tilted>0</tilted></feature>
            <threshold>0.8</threshold>
            <left_val>-1.</left_val>
            <right_val>1.</right_val></_></_>
        <_>
          <!-- the middle diamond darker than the diamond around it -->
          <_>
            <feature>
              <rects>
                <_>12 0 12 12 1.</_>
                <_>12 6 6 6 -4.</_></rects>
              <tilted>1</tilted></feature>
            <threshold>0.8</threshold>
            <left_val>-1.</left_val>
            <right_val>1.</right_val></_></_></trees>
      <stage_threshold>1.5</stage_threshold>
      <parent>-1</parent>
      <next>-1</next></_></stages></dark_blob>
</opencv_storage>`;

/**
 * Loads an OpenCV cascade from its XML and runs it.
 *
 * @param input - The image, scale step and grouping threshold.
 * @returns The image with a box around every detection, and the cascade's shape.
 */
export function demo({ image, options }: DemoInput<LoadOpenCvCascadeDemoOptions>): DemoOutput {
  const cascade = loadOpenCvCascade(XML);
  const detections = detectHaar(grayscale(image), cascade, {
    scaleFactor: options.scaleFactor,
    minNeighbors: options.minNeighbors,
    edgeDensity: false,
  });

  // Every detection's centre must be on one of the sample's pebbles.
  const onPebble = detections.filter(({ x, y, width, height }) => {
    const cx = x + width / 2;
    const cy = y + height / 2;
    return PEBBLES.some((p) => ((cx - p.x) / p.rx) ** 2 + ((cy - p.y) / p.ry) ** 2 <= 1);
  });
  const trees = cascade.complexClassifiers.reduce((sum, s) => sum + s.simpleClassifiers.length, 0);
  return {
    images: [
      {
        label: `${detections.length} found`,
        image,
        overlay: {
          polygons: detections.map(({ x, y, width, height }) => [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height },
          ]),
        },
      },
    ],
    tables: [
      {
        label: "Cascade",
        rows: [
          ["window", `${cascade.size[0]} x ${cascade.size[1]}`],
          ["stages", cascade.complexClassifiers.length],
          ["trees", trees],
          ["tilted features", cascade.tilted ? "yes" : "no"],
        ],
      },
      {
        label: "Detections",
        columns: ["x", "y", "width", "height", "neighbours"],
        rows: detections.map((d) => [d.x, d.y, d.width, d.height, d.neighbors]),
      },
    ],
    values: {
      window: `${cascade.size[0]} x ${cascade.size[1]}`,
      stages: cascade.complexClassifiers.length,
      trees,
      tilted: cascade.tilted === true,
      found: detections.length,
      offPebble: detections.length - onPebble.length,
    },
  };
}

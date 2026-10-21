import { detectFast, grayscale, median, trackPoints, warpAffine } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { strongest } from "../../utils/points";
import type { TrackPointsDemoOptions } from "./demo.model";

/**
 * Tracks corners from one frame to the next. With the webcam, the frames
 * are the previous and the current frame; otherwise the next frame is a
 * shifted copy of the image.
 *
 * @param input - The frame(s), the shift for the copy, and the tracker settings.
 * @returns The next frame with a motion vector per tracked point.
 */
export function demo({ image, previous, options }: DemoInput<TrackPointsDemoOptions>): DemoOutput {
  const next = grayscale(image);
  // Without a previous frame, make one: the image moved back by (dx, dy).
  const before = previous
    ? grayscale(previous)
    : warpAffine(next, [1, 0, options.dx, 0, 1, options.dy]);

  const corners = strongest(detectFast(before, { threshold: 20 }), 150);
  const moved = trackPoints(before, next, corners, {
    windowSize: options.windowSize,
    levels: options.levels,
  });

  const kept = moved
    .map((p, i) => ({ from: corners[i], to: p, tracked: p.tracked }))
    .filter((m) => m.tracked);
  return {
    images: [
      {
        label: `${kept.length} of ${corners.length} points tracked`,
        image,
        overlay: { lines: kept, points: kept.map((m) => m.to) },
      },
    ],
    values: {
      trackedShare: corners.length ? round(kept.length / corners.length, 3) : 0,
      medianDx: round(median(kept.map((m) => m.to.x - m.from.x)), 2),
      medianDy: round(median(kept.map((m) => m.to.y - m.from.y)), 2),
    },
  };
}

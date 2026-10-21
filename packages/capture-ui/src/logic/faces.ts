import type { FaceObservation } from "../sources/source.model";
import type {
  FaceSelection,
  FaceSelectionOptions,
  FollowFaceOptions,
  FollowedFace,
} from "./faces.model";
import type { Box, Guide } from "./geometry.model";

/** Default for {@link FaceSelectionOptions.ratio}. */
export const SEVERAL_FACES_RATIO = 0.4;

/**
 * Every face a pose source reported, its own face (`box`, which `pose` and
 * `landmarks` describe) first. A source that reports only `box` gives a
 * list of one.
 *
 * @param observation - What the source found.
 * @returns The face boxes, in the frame's pixels.
 *
 * @example
 * const faces = observedFaces(await source.detect(frame));
 */
export function observedFaces(observation: FaceObservation): Box[] {
  const { box, faces = [] } = observation;
  if (!box) return [...faces];
  const same = (f: Box) =>
    f.x === box.x && f.y === box.y && f.width === box.width && f.height === box.height;
  return [box, ...faces.filter((f) => !same(f))];
}

/**
 * Picks the face the selfie flow follows: the largest face nearest the
 * guide's centre. Faces narrower than `ratio` times the largest face's
 * width don't count; of the faces that do, the one whose centre is nearest
 * the guide's centre is the main face (the first one on a tie). With one
 * person in view that is the largest face, and `count` is 1; more than one
 * counted face means several people are in view.
 *
 * @param faces - Face boxes, in the guide's (view) pixels.
 * @param guide - The face guide.
 * @param options - The size ratio from which a face counts.
 * @returns The main face's index and the number of counted faces.
 *
 * @example
 * const { index, count } = selectMainFace(faces, guide);
 * if (count > 1) show("Make sure only you are in the frame");
 */
export function selectMainFace(
  faces: readonly Box[],
  guide: Guide,
  options: FaceSelectionOptions = {},
): FaceSelection {
  const ratio = Math.min(1, Math.max(0, options.ratio ?? SEVERAL_FACES_RATIO));
  const largest = Math.max(0, ...faces.map((f) => f.width));
  let index = -1;
  let count = 0;
  let nearest = Infinity;
  faces.forEach((face, i) => {
    if (face.width < ratio * largest) return;
    count++;
    const distance = Math.hypot(
      face.x + face.width / 2 - guide.cx,
      face.y + face.height / 2 - guide.cy,
    );
    if (distance < nearest) {
      nearest = distance;
      index = i;
    }
  });
  return { index, count };
}

/**
 * Picks the face to follow in one detection, as `<pv-face-capture>` does:
 * every face the source reported, mapped to view pixels, and the main
 * face chosen by {@link selectMainFace}.
 *
 * @param observation - What the source found, in its frame's pixels.
 * @param options - The guide, the frame-to-view mapping and the size ratio.
 * @returns The followed face in frame and view pixels, the face count, and
 *   whether the source's pose describes it.
 *
 * @example
 * const followed = followFace(observation, { guide, toView: (b) => boxToView(b, t) });
 * flow.update({
 *   pose: followed.own ? observation.pose : "none",
 *   guidance: assessFace(followed.viewBox, guide),
 *   faceCount: followed.count,
 * });
 */
export function followFace(observation: FaceObservation, options: FollowFaceOptions): FollowedFace {
  const { guide, toView, ratio } = options;
  const faces = observedFaces(observation);
  const inView = faces.map(toView);
  const { index, count } = selectMainFace(inView, guide, { ratio });
  if (index < 0) return { count, own: false };
  return {
    box: faces[index],
    viewBox: inView[index],
    count,
    own: index === 0 && observation.box !== undefined,
  };
}

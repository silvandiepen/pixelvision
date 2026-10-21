import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import { detectHaar } from "../detect/haar";
import type { Detection } from "../detect/haar.model";
import { equalizeHistogram } from "../imgproc/equalizeHistogram";
import { flip } from "../imgproc/flip";
import { resample } from "../imgproc/resample";
import type { HeadPoseCascades, HeadPoseOptions, HeadPoseResult } from "./headPose.model";

/**
 * Tells whether a face looks at the camera or is turned to one side, from
 * one gray frame: the frontal cascade, the profile cascade, and the profile
 * cascade on the mirrored frame (it's trained for one side only). The
 * detection with the most support wins.
 *
 * The profile cascade only fires on clear turns (it was trained on
 * near-full side views); moderate turns read as `"none"` in between.
 *
 * @param image - Single-channel `u8` matrix (gray camera frame).
 * @param cascades - Frontal and profile cascades.
 * @param options - Working size, minimum face size, grouping strength.
 * @returns The pose and face box (in the input's pixels).
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * import { frontalFace } from "pixelvision/cascades/frontal-face";
 * import { profileFace } from "pixelvision/cascades/profile-face";
 * const { pose } = detectHeadPose(gray, { frontal: frontalFace, profile: profileFace });
 */
export function detectHeadPose(
  image: Matrix<"u8">,
  cascades: HeadPoseCascades,
  options: HeadPoseOptions = {},
): HeadPoseResult {
  assertType("detectHeadPose", image, "u8");
  assertChannels("detectHeadPose", image, 1);
  const {
    maxSize = 320,
    minFaceSize = 0.2,
    minNeighbors = 2,
    profileMinNeighbors = 1,
    scaleFactor = 1.1,
  } = options;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const small =
    scale < 1
      ? resample(image, {
          width: Math.max(1, Math.round(image.width * scale)),
          height: Math.max(1, Math.round(image.height * scale)),
        })
      : image;
  const prepared = equalizeHistogram(small);
  const minSide = Math.min(prepared.width, prepared.height) * minFaceSize;
  const detect = (frame: Matrix<"u8">, cascade: HeadPoseCascades["frontal"], neighbors: number) =>
    detectHaar(frame, cascade, {
      minNeighbors: neighbors,
      scaleFactor,
      minScale: Math.max(1, minSide / cascade.size[0]),
    })[0];

  const candidates: Array<[HeadPoseResult["pose"], Detection | undefined]> = [
    ["frontal", detect(prepared, cascades.frontal, minNeighbors)],
    ["profile", detect(prepared, cascades.profile, profileMinNeighbors)],
  ];
  const mirrored = detect(flip(prepared), cascades.profile, profileMinNeighbors);
  candidates.push([
    "mirrored-profile",
    mirrored && { ...mirrored, x: prepared.width - mirrored.x - mirrored.width },
  ]);

  let best: HeadPoseResult = { pose: "none" };
  for (const [pose, face] of candidates) {
    if (face && (!best.face || face.neighbors > best.face.neighbors)) best = { pose, face };
  }
  if (best.face && scale < 1) {
    const f = best.face;
    best.face = {
      ...f,
      x: f.x / scale,
      y: f.y / scale,
      width: f.width / scale,
      height: f.height / scale,
    };
  }
  return best;
}

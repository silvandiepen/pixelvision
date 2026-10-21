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
 * `faces` lists every face found, so a caller can tell when more than one
 * person is in view: the chosen face first, then every other frontal face
 * (profiles beyond the chosen one are left out, as the profile cascade
 * accepts single, sometimes stray, hits). Detections whose centres are
 * within half a box of each other count as one face.
 *
 * @param image - Single-channel `u8` matrix (gray camera frame).
 * @param cascades - Frontal and profile cascades.
 * @param options - Working size, minimum face size, grouping strength.
 * @returns The pose, the chosen face box and every face found (in the input's pixels).
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * import { frontalFace } from "pixelvision/cascades/frontal-face";
 * import { profileFace } from "pixelvision/cascades/profile-face";
 * const { pose, faces } = detectHeadPose(gray, { frontal: frontalFace, profile: profileFace });
 * if (faces.length > 1) show("Make sure only you are in the frame");
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
    edgeDensity = false,
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
      edgeDensity,
      minScale: Math.max(1, minSide / cascade.size[0]),
    });

  const frontal = detect(prepared, cascades.frontal, minNeighbors);
  const mirrored = detect(flip(prepared), cascades.profile, profileMinNeighbors)[0];
  const candidates: Array<[HeadPoseResult["pose"], Detection | undefined]> = [
    ["frontal", frontal[0]],
    ["profile", detect(prepared, cascades.profile, profileMinNeighbors)[0]],
    [
      "mirrored-profile",
      mirrored && { ...mirrored, x: prepared.width - mirrored.x - mirrored.width },
    ],
  ];

  let pose: HeadPoseResult["pose"] = "none";
  let face: Detection | undefined;
  for (const [candidate, found] of candidates) {
    if (found && (!face || found.neighbors > face.neighbors)) [pose, face] = [candidate, found];
  }
  // Every face: the chosen one first, then the other frontal faces that aren't the same person.
  const faces: Detection[] = [];
  if (face) {
    for (const found of [face, ...frontal]) {
      if (!faces.some((kept) => sameFace(kept, found))) faces.push(found);
    }
  }
  const toInput = (d: Detection): Detection =>
    scale < 1
      ? { ...d, x: d.x / scale, y: d.y / scale, width: d.width / scale, height: d.height / scale }
      : d;
  const result: HeadPoseResult = { pose, faces: faces.map(toInput) };
  if (face) result.face = result.faces[0];
  return result;
}

/**
 * Whether two detections are the same face: their centres are within half
 * the larger box's width and height of each other.
 *
 * @param a - A detection.
 * @param b - Another detection.
 * @returns Whether they are one face.
 */
function sameFace(a: Detection, b: Detection): boolean {
  const dx = Math.abs(a.x + a.width / 2 - (b.x + b.width / 2));
  const dy = Math.abs(a.y + a.height / 2 - (b.y + b.height / 2));
  return dx <= Math.max(a.width, b.width) / 2 && dy <= Math.max(a.height, b.height) / 2;
}

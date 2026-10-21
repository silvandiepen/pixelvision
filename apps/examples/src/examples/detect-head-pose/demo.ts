import { detectHeadPose, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { DetectHeadPoseDemoOptions, HeadPoseResources } from "./demo.model";

/**
 * Tells whether the face in the frame looks at the camera or is turned.
 *
 * @param input - The frame, the options and the frontal and profile cascades.
 * @returns The frame with the face box, and the pose.
 */
export function demo({
  image,
  options,
  resources,
}: DemoInput<DetectHeadPoseDemoOptions, HeadPoseResources>): DemoOutput {
  const gray = grayscale(image);
  const { pose, face } = detectHeadPose(gray, resources, {
    minFaceSize: options.minFaceSize,
    minNeighbors: options.minNeighbors,
  });

  const box = face && [
    { x: face.x, y: face.y },
    { x: face.x + face.width, y: face.y },
    { x: face.x + face.width, y: face.y + face.height },
    { x: face.x, y: face.y + face.height },
  ];
  return {
    images: [{ label: `Pose: ${pose}`, image, overlay: box ? { polygons: [box] } : undefined }],
    values: { pose, faceFound: face !== undefined },
  };
}

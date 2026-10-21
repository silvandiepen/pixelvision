export type {
  CreateFaceDetectorOptions,
  DetectFacesOptions,
  FaceDetector,
  FaceLandmarks,
  NeuralFace,
  OrtLike,
  OrtSessionLike,
  OrtTensorLike,
} from "./faceDetector.model";
export { createFaceDetector, MAX_FACES_LIMIT } from "./faceDetector";
export type { FaceNeuralErrorCode } from "./errors.model";
export { FaceNeuralError } from "./errors";
export type { HeadPoseFromFaceOptions } from "./headYaw.model";
export { estimateHeadYaw, headPoseFromFace } from "./headYaw";

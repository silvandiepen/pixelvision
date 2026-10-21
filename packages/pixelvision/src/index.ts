export type {
  CreateMatrixOptions,
  ImageLike,
  Matrix,
  PixelArrays,
  PixelType,
  RGBAImage,
} from "./core/matrix.model";
export { cloneMatrix, createMatrix } from "./core/matrix";
export { fromImageData, toImageData } from "./core/image";
export type { ChannelOrder, GrayscaleOptions } from "./imgproc/grayscale.model";
export { grayscale } from "./imgproc/grayscale";

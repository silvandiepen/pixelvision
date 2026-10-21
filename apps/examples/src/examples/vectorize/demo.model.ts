export interface VectorizeDemoOptions {
  /** `"otsu"`, `"adaptive"` or a fixed gray level. */
  threshold: string | number;
  tolerance: number;
  corners: number;
  curves: boolean;
  snapLines: boolean;
  /** Recognise circles, ellipses, rectangles and polygons. */
  shapes: boolean;
  /** Number of colours, or 0 for black and white. */
  colors: number;
}

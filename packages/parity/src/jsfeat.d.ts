// Types for the parts of jsfeat 0.0.8 the parity tests call. jsfeat ships
// no types of its own; this grows as more modules are ported.
declare module "jsfeat" {
  export type JsfeatData = Uint8Array | Int32Array | Float32Array | Float64Array;

  export interface JsfeatMatrix {
    cols: number;
    rows: number;
    channel: number;
    type: number;
    data: JsfeatData;
  }

  interface Jsfeat {
    U8_t: number;
    S32_t: number;
    F32_t: number;
    F64_t: number;
    C1_t: number;
    C2_t: number;
    C3_t: number;
    C4_t: number;
    U8C1_t: number;
    S32C1_t: number;
    S32C2_t: number;
    F32C1_t: number;
    F32C2_t: number;
    COLOR_RGBA2GRAY: number;
    COLOR_RGB2GRAY: number;
    COLOR_BGRA2GRAY: number;
    COLOR_BGR2GRAY: number;
    BOX_BLUR_NOSCALE: number;
    matrix_t: new (cols: number, rows: number, type: number) => JsfeatMatrix;
    keypoint_t: new (
      x?: number,
      y?: number,
      score?: number,
      level?: number,
      angle?: number,
    ) => {
      x: number;
      y: number;
      score: number;
      level: number;
      angle: number;
    };
    fast_corners: {
      set_threshold: (threshold: number) => number;
      detect: (
        image: JsfeatMatrix,
        corners: Array<{ x: number; y: number; score: number }>,
        border?: number,
      ) => number;
    };
    yape06: {
      laplacian_threshold: number;
      min_eigen_value_threshold: number;
      detect: (
        image: JsfeatMatrix,
        points: Array<{ x: number; y: number; score: number }>,
        border?: number,
      ) => number;
    };
    yape: {
      tau: number;
      level_tables: Array<{ scores: Int32Array; radius: number }>;
      init: (width: number, height: number, radius: number, levels?: number) => void;
      detect: (
        image: JsfeatMatrix,
        points: Array<{ x: number; y: number; score: number }>,
        border?: number,
      ) => number;
    };
    pyramid_t: new (levels: number) => {
      levels: number;
      data: JsfeatMatrix[];
      allocate: (width: number, height: number, type: number) => void;
      build: (input: JsfeatMatrix, skipFirstLevel?: boolean) => void;
    };
    optical_flow_lk: {
      track: (
        previous: { levels: number; data: JsfeatMatrix[] },
        current: { levels: number; data: JsfeatMatrix[] },
        previousXY: { [index: number]: number },
        currentXY: { [index: number]: number },
        count: number,
        windowSize: number,
        maxIterations?: number,
        status?: Uint8Array,
        epsilon?: number,
        minEigenvalue?: number,
      ) => void;
    };
    ransac_params_t: new (
      size: number,
      threshold: number,
      eps: number,
      probability: number,
    ) => {
      size: number;
      thresh: number;
      eps: number;
      prob: number;
    };
    motion_model: {
      affine2d: new () => object;
      homography2d: new () => object;
    };
    motion_estimator: {
      ransac: (
        params: object,
        kernel: object,
        from: Array<{ x: number; y: number }>,
        to: Array<{ x: number; y: number }>,
        count: number,
        model: JsfeatMatrix,
        mask: JsfeatMatrix,
        maxIterations?: number,
      ) => boolean;
      lmeds: (
        params: object,
        kernel: object,
        from: Array<{ x: number; y: number }>,
        to: Array<{ x: number; y: number }>,
        count: number,
        model: JsfeatMatrix,
        mask: JsfeatMatrix,
        maxIterations?: number,
      ) => boolean;
    };
    bbf: {
      prepare_cascade: (cascade: object) => void;
      build_pyramid: (
        image: JsfeatMatrix,
        minWidth: number,
        minHeight: number,
        interval?: number,
      ) => { levels: number; data: JsfeatMatrix[] };
      detect: (
        pyramid: { levels: number; data: JsfeatMatrix[] },
        cascade: object,
      ) => Array<{ x: number; y: number; width: number; height: number; confidence: number }>;
    };
    haar: {
      edges_density: number;
      detect_single_scale: (
        sum: ArrayLike<number>,
        squares: ArrayLike<number>,
        tilted: ArrayLike<number> | null,
        edges: ArrayLike<number> | null,
        width: number,
        height: number,
        scale: number,
        classifier: object,
      ) => Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        neighbor: number;
        confidence: number;
      }>;
      group_rectangles: (
        rects: Array<{ x: number; y: number; width: number; height: number; confidence: number }>,
        minNeighbors?: number,
      ) => Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        neighbors: number;
        confidence: number;
      }>;
    };
    orb: {
      describe: (
        image: JsfeatMatrix,
        corners: Array<{ x: number; y: number; angle: number }>,
        count: number,
        descriptors: JsfeatMatrix,
      ) => void;
    };
    linalg: {
      lu_solve: (a: JsfeatMatrix, b: JsfeatMatrix) => number;
      cholesky_solve: (a: JsfeatMatrix, b: JsfeatMatrix) => number;
      svd_decompose: (
        a: JsfeatMatrix,
        w: JsfeatMatrix,
        u: JsfeatMatrix,
        v: JsfeatMatrix,
        options?: number,
      ) => void;
      svd_solve: (a: JsfeatMatrix, x: JsfeatMatrix, b: JsfeatMatrix) => void;
      svd_invert: (inverse: JsfeatMatrix, a: JsfeatMatrix) => void;
      eigenVV: (a: JsfeatMatrix, vectors: JsfeatMatrix, values: JsfeatMatrix) => void;
    };
    matmath: {
      transpose: (at: JsfeatMatrix, a: JsfeatMatrix) => void;
      multiply: (c: JsfeatMatrix, a: JsfeatMatrix, b: JsfeatMatrix) => void;
      multiply_ABt: (c: JsfeatMatrix, a: JsfeatMatrix, b: JsfeatMatrix) => void;
      multiply_AtB: (c: JsfeatMatrix, a: JsfeatMatrix, b: JsfeatMatrix) => void;
      multiply_AAt: (c: JsfeatMatrix, a: JsfeatMatrix) => void;
      multiply_AtA: (c: JsfeatMatrix, a: JsfeatMatrix) => void;
      invert_3x3: (from: JsfeatMatrix, to: JsfeatMatrix) => void;
      mat3x3_determinant: (m: JsfeatMatrix) => number;
    };
    math: {
      median: (values: { [index: number]: number }, low: number, high: number) => number;
      perspective_4point_transform: (model: JsfeatMatrix, ...coordinates: number[]) => void;
      get_gaussian_kernel: (
        size: number,
        sigma: number,
        kernel: Int32Array | Float32Array,
        dataType: number,
      ) => void;
    };
    imgproc: {
      grayscale: (
        source: ArrayLike<number>,
        width: number,
        height: number,
        destination: JsfeatMatrix,
        code?: number,
      ) => void;
      resample: (
        source: JsfeatMatrix,
        destination: JsfeatMatrix,
        width: number,
        height: number,
      ) => void;
      box_blur_gray: (
        source: JsfeatMatrix,
        destination: JsfeatMatrix,
        radius: number,
        options?: number,
      ) => void;
      gaussian_blur: (
        source: JsfeatMatrix,
        destination: JsfeatMatrix,
        kernelSize: number,
        sigma?: number,
      ) => void;
      pyrdown: (source: JsfeatMatrix, destination: JsfeatMatrix, sx?: number, sy?: number) => void;
      scharr_derivatives: (source: JsfeatMatrix, destination: JsfeatMatrix) => void;
      sobel_derivatives: (source: JsfeatMatrix, destination: JsfeatMatrix) => void;
      compute_integral_image: (
        source: JsfeatMatrix,
        sum?: JsfeatData,
        squares?: JsfeatData,
        tilted?: JsfeatData,
      ) => void;
      equalize_histogram: (source: JsfeatMatrix, destination: JsfeatMatrix) => void;
      canny: (source: JsfeatMatrix, destination: JsfeatMatrix, low: number, high: number) => void;
      warp_perspective: (
        source: JsfeatMatrix,
        destination: JsfeatMatrix,
        transform: JsfeatMatrix,
        fill?: number,
      ) => void;
      warp_affine: (
        source: JsfeatMatrix,
        destination: JsfeatMatrix,
        transform: JsfeatMatrix,
        fill?: number,
      ) => void;
      skindetector: (
        source: { width: number; height: number; data: ArrayLike<number> },
        destination: { [index: number]: number },
      ) => void;
    };
  }

  const jsfeat: Jsfeat;
  export default jsfeat;
}

import { createRequire } from "node:module";
import type { Matrix } from "pixelvision";

const require = createRequire(import.meta.url);

/** The parts of OpenCV.js the tests use; typed loosely on purpose. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OpenCv = any;

let loaded: Promise<{ cv: OpenCv }> | undefined;

/**
 * Loads OpenCV.js (WebAssembly) once per test run.
 *
 * The module object is a thenable whose `then` resolves with itself, so
 * returning it from an async function or awaiting it loops forever. It is
 * returned wrapped, after polling until the runtime is ready.
 *
 * @returns `{ cv }`, ready to use.
 */
export const loadOpenCv = (): Promise<{ cv: OpenCv }> => {
  loaded ??= new Promise((resolve, reject) => {
    const cv = require("@techstark/opencv-js");
    const started = Date.now();
    const poll = () => {
      if (typeof cv.Mat === "function") resolve({ cv });
      else if (Date.now() - started > 30_000)
        reject(new Error("OpenCV.js did not initialise within 30 s"));
      else setTimeout(poll, 20);
    };
    poll();
  });
  return loaded;
};

/**
 * Copies a `u8` matrix with 1 to 4 channels into an OpenCV `Mat` (caller
 * deletes it).
 *
 * @param cv - OpenCV namespace.
 * @param matrix - The matrix.
 * @returns A `CV_8UC1` to `CV_8UC4` Mat.
 */
export const toMat = (cv: OpenCv, matrix: Matrix<"u8">): OpenCv => {
  const mat = new cv.Mat(
    matrix.height,
    matrix.width,
    [cv.CV_8UC1, cv.CV_8UC2, cv.CV_8UC3, cv.CV_8UC4][matrix.channels - 1],
  );
  mat.data.set(matrix.data.subarray(0, matrix.width * matrix.height * matrix.channels));
  return mat;
};

/**
 * Runs `use` with fresh Mats and deletes them afterwards, so the WebAssembly
 * heap doesn't leak between tests.
 *
 * @param mats - Mats to delete when done.
 * @param use - The work.
 * @returns What `use` returns.
 */
export const withMats = <T>(mats: OpenCv[], use: () => T): T => {
  try {
    return use();
  } finally {
    for (const mat of mats) mat.delete();
  }
};

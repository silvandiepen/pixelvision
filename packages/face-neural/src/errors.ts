import type { FaceNeuralErrorCode } from "./errors.model";

/**
 * The error `@pixelvision/face-neural` throws for invalid images, options and model outputs.
 * Check `code` to tell them apart; the message names the value that failed.
 *
 * @example
 * try {
 *   await detector.detect(image);
 * } catch (error) {
 *   if (error instanceof FaceNeuralError && error.code === "invalid-output") reportModelProblem();
 * }
 */
export class FaceNeuralError extends Error {
  /** What kind of value was rejected. */
  readonly code: FaceNeuralErrorCode;

  /**
   * Creates the error.
   *
   * @param code - What kind of value was rejected.
   * @param message - What exactly is wrong.
   */
  constructor(code: FaceNeuralErrorCode, message: string) {
    super(message);
    this.name = "FaceNeuralError";
    this.code = code;
  }
}

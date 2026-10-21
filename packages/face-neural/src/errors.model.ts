/**
 * Why `@pixelvision/face-neural` rejected an input, an option or a model output:
 *
 * - `invalid-image`: the image has non-finite or zero sizes, an unsupported channel count, or a
 *   pixel buffer that is too short.
 * - `invalid-option`: a detection threshold or `maxFaces` is out of range.
 * - `invalid-output`: the model's outputs are missing, mis-shaped or hold non-finite values,
 *   which happens with a different, damaged or replaced model.
 */
export type FaceNeuralErrorCode = "invalid-image" | "invalid-option" | "invalid-output";

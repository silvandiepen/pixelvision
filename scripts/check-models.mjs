// Verifies that every bundled model is byte for byte the upstream file
// recorded in its MODELS.md, so a replaced or corrupted model fails CI.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import console from "node:console";
import process from "node:process";

const models = [
  {
    file: "packages/face-neural/models/face_detection_yunet_2023mar.onnx",
    // https://huggingface.co/opencv/face_detection_yunet, LFS object of the same name.
    sha256: "8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4",
  },
];

let failed = false;
for (const { file, sha256 } of models) {
  const actual = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (actual === sha256) {
    console.log(`ok  ${file}`);
  } else {
    console.error(`BAD ${file}: expected sha256 ${sha256}, got ${actual}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);

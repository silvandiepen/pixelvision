// Loads the installed tarballs through ESM, the way an app would, and runs a
// small real task on each entry point.
import assert from "node:assert/strict";
import console from "node:console";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDocumentTracker, findDocument, grayscale } from "pixelvision";
import { frontalFace } from "pixelvision/cascades/frontal-face";
import { estimateHeadYaw } from "@pixelvision/face-neural";
import * as captureUi from "@pixelvision/capture-ui";
import { scene, CORNERS } from "./scene.mjs";

const image = scene();
assert.equal(grayscale(image).channels, 1);
const found = findDocument(image);
assert.ok(found, "findDocument finds the drawn page");
found.corners.forEach((p, i) => assert.ok(Math.hypot(p.x - CORNERS[i].x, p.y - CORNERS[i].y) <= 4));
assert.equal(createDocumentTracker().update(found.corners).status, "tracking");
assert.ok(frontalFace.complexClassifiers.length > 0, "the frontal-face cascade loads");
assert.equal(typeof estimateHeadYaw, "function");
assert.ok(
  existsSync(fileURLToPath(import.meta.resolve("@pixelvision/face-neural/models/yunet.onnx"))),
);
assert.ok(existsSync(fileURLToPath(import.meta.resolve("@pixelvision/capture-ui/haar-worker"))));
assert.ok(Object.keys(captureUi).length > 0, "capture-ui imports without a DOM");
console.log("ok  ESM: pixelvision, cascades, face-neural, model file, capture-ui, haar-worker");

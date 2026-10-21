// Loads the installed tarballs through require, the way a CommonJS app would.
const assert = require("node:assert/strict");
const console = require("node:console");
const { findDocument } = require("pixelvision");
const { frontalFace } = require("pixelvision/cascades/frontal-face");
const { estimateHeadYaw } = require("@pixelvision/face-neural");

import("./scene.mjs").then(({ scene }) => {
  assert.ok(findDocument(scene()), "findDocument finds the drawn page");
  assert.ok(frontalFace.complexClassifiers.length > 0, "the frontal-face cascade loads");
  assert.equal(typeof estimateHeadYaw, "function");
  console.log("ok  CJS: pixelvision, cascades, face-neural");
});

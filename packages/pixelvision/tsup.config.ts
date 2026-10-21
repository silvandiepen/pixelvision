import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "cascades/frontal-face": "src/cascades/frontal-face.ts",
    "cascades/profile-face": "src/cascades/profile-face.ts",
    "cascades/eye": "src/cascades/eye.ts",
    "cascades/upper-body": "src/cascades/upper-body.ts",
    "cascades/bbf-face": "src/cascades/bbf-face.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
});

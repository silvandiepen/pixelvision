import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // tsup builds the worker into the bundle; tests get an empty source instead.
      "haar-worker:inline": fileURLToPath(
        new URL("./src/sources/inlineWorker.stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.model.ts",
        "src/**/*.d.ts",
        "src/index.ts",
        "src/sources/inlineWorker.stub.ts",
        // Browser glue: needs a real camera, video frames, 2D canvas, pointer capture and a
        // Worker scope. The elements have happy-dom tests for what doesn't need those, and
        // are exercised end to end in Chrome through the demo. All decisions they make live
        // in src/logic and src/sources, which are held to 100%.
        "src/elements/**",
        "src/camera/frames.ts",
        "src/sources/haar.worker.ts",
      ],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});

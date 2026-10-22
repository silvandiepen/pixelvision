import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // Document finding and the detectors run on whole images; with coverage on a shared 4-core
    // CI runner they take several times longer than locally.
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.model.ts",
        "src/index.ts",
        "src/test-utils.ts",
        "src/test-images.ts",
        "src/test-qr.ts",
        "src/test-svg.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});

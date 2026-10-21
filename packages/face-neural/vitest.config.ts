import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // onnxruntime-node sends usage telemetry and, when it can't store its device
    // identifier, leaves a `:memory:.ses` file in the working directory.
    env: { ORT_DISABLE_TELEMETRY: "1" },
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.model.ts", "src/index.ts"],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});

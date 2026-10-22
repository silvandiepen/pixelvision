import { defineConfig } from "vitest/config";
import { apiReferencePlugin } from "./build/apiReference.ts";

export default defineConfig({
  plugins: [apiReferencePlugin()],
  test: {
    include: ["src/**/*.test.ts", "build/**/*.test.ts"],
    // Decoding the sample photos and running every demo on them is slow on a shared CI runner.
    testTimeout: 30_000,
    environment: "node",
  },
});

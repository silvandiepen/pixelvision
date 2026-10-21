import { defineConfig } from "vitest/config";
import { apiReferencePlugin } from "./build/apiReference.ts";

export default defineConfig({
  plugins: [apiReferencePlugin()],
  test: {
    include: ["src/**/*.test.ts", "build/**/*.test.ts"],
    environment: "node",
  },
});

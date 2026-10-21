import { defineConfig } from "vite";

export default defineConfig({
  // Bundle the worker as an ES module, to match `{ type: "module" }` in `new Worker()`.
  worker: {
    format: "es",
  },
  preview: {
    port: 4325,
    strictPort: true,
  },
});

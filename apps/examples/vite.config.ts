import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { apiReferencePlugin } from "./build/apiReference.ts";

export default defineConfig({
  plugins: [vue(), apiReferencePlugin()],
  // onnxruntime-web finds its WebAssembly next to itself; pre-bundling moves it.
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
  preview: {
    port: 4317,
    strictPort: true,
  },
});

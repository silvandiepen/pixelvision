import { defineConfig } from "tsup";
import type { Options } from "tsup";

type EsbuildPlugin = NonNullable<Options["esbuildPlugins"]>[number];

const WORKER_ENTRY = "src/sources/haar.worker.ts";

/**
 * Resolves `haar-worker:inline` to the detection worker bundled as a
 * string, so the elements can start it from a Blob URL without any
 * bundler configuration in the app.
 */
const inlineWorker: EsbuildPlugin = {
  name: "inline-worker",
  setup(build) {
    build.onResolve({ filter: /^haar-worker:inline$/ }, (args) => ({
      path: args.path,
      namespace: "inline-worker",
    }));
    build.onLoad({ filter: /.*/, namespace: "inline-worker" }, async () => {
      const result = await build.esbuild.build({
        entryPoints: [WORKER_ENTRY],
        bundle: true,
        format: "esm",
        platform: "browser",
        target: "es2022",
        minify: true,
        write: false,
      });
      return {
        contents: `export default ${JSON.stringify(result.outputFiles[0].text)};`,
        loader: "js",
        watchFiles: [WORKER_ENTRY],
      };
    });
  },
};

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    treeshake: true,
    target: "es2022",
    external: ["pixelvision", "@pixelvision/face-neural"],
    esbuildPlugins: [inlineWorker],
  },
  {
    // The standalone worker for apps that load it by URL (a strict CSP): self-contained.
    entry: { "haar-worker": WORKER_ENTRY },
    format: ["esm"],
    sourcemap: true,
    target: "es2022",
    platform: "browser",
    minify: true,
    noExternal: ["pixelvision"],
  },
]);

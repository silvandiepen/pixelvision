// Bundles src/smoke.ts for each engine, runs it, and requires identical output.
import { execFileSync } from "node:child_process";
import console from "node:console";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const out = join(root, ".out");
mkdirSync(out, { recursive: true });

// Hermes runs a script, not a module; ES2019 matches what React Native's
// Babel preset hands to Hermes.
await build({
  entryPoints: [join(root, "src/smoke.ts")],
  bundle: true,
  format: "iife",
  target: "es2019",
  outfile: join(out, "smoke.hermes.js"),
  logLevel: "error",
});
await build({
  entryPoints: [join(root, "src/smoke.ts")],
  bundle: true,
  format: "esm",
  platform: "neutral",
  outfile: join(out, "smoke.node.mjs"),
  logLevel: "error",
});

const platformDir = { darwin: "osx-bin", linux: "linux64-bin", win32: "win64-bin" }[
  process.platform
];
const hermes = join(
  dirname(require.resolve("hermes-engine-cli/package.json")),
  platformDir,
  "hermes",
);

const run = (command, args) => execFileSync(command, args, { encoding: "utf8" }).trim();
const node = run(process.execPath, [join(out, "smoke.node.mjs")]);
const hermesOutput = run(hermes, [join(out, "smoke.hermes.js")]);

console.log("node:\n" + node);
if (node !== hermesOutput) {
  console.error("hermes differs:\n" + hermesOutput);
  process.exit(1);
}
console.log("hermes: identical");

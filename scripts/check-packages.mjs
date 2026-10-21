// Packs every published package and checks it the way npm users will get it:
// publint (package.json and files) and Are the types wrong? (types for every
// entry point in every module mode).
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

const packages = [
  {
    dir: "packages/pixelvision",
    entrypoints: [
      ".",
      "cascades/frontal-face",
      "cascades/profile-face",
      "cascades/eye",
      "cascades/upper-body",
      "cascades/bbf-face",
    ],
  },
  // The model is a data file, so it has no types to check.
  { dir: "packages/face-neural", exclude: ["models/yunet.onnx"] },
  // `haar-worker` is a browser-only ES module worker script, loaded by URL with
  // `new Worker(new URL("@pixelvision/capture-ui/haar-worker", import.meta.url), { type: "module" })`.
  // It exports nothing and is exported for `import` only, so it has no types and no
  // CommonJS entry by design; publint still checks it.
  { dir: "packages/capture-ui", exclude: ["haar-worker"] },
];

// Temporary folders, removed when the script ends, whether it passes or fails.
const scratch = [];
process.on("exit", () => scratch.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

const out = mkdtempSync(join(tmpdir(), "pixelvision-packs-"));
scratch.push(out);
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });

const tarballs = [];
for (const { dir, entrypoints, exclude } of packages) {
  run("pnpm", ["exec", "publint"], dir);
  const before = new Set(readdirSync(out));
  run("pnpm", ["pack", "--pack-destination", out], dir);
  const tarball = readdirSync(out).find((file) => !before.has(file));
  tarballs.push(join(out, tarball));
  const args = [join(out, tarball)];
  if (entrypoints) args.push("--entrypoints", ...entrypoints);
  if (exclude) args.push("--exclude-entrypoints", ...exclude);
  run("pnpm", ["exec", "attw", ...args], process.cwd());
}

// Install the tarballs into an empty project with npm, as a user would, and
// load every entry point through ESM and CommonJS.
const app = mkdtempSync(join(tmpdir(), "pixelvision-consumer-"));
scratch.push(app);
writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", private: true }));
run(
  "npm",
  ["install", "--offline", "--no-audit", "--no-fund", "--ignore-scripts", ...tarballs],
  app,
);
for (const file of ["esm.mjs", "cjs.cjs", "scene.mjs"]) {
  copyFileSync(join("scripts/package-smoke", file), join(app, file));
}
run("node", ["esm.mjs"], app);
run("node", ["cjs.cjs"], app);

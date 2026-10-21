// Packs every published package and checks it the way npm users will get it:
// publint (package.json and files) and Are the types wrong? (types for every
// entry point in every module mode).
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync } from "node:fs";
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

const out = mkdtempSync(join(tmpdir(), "pixelvision-packs-"));
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });

for (const { dir, entrypoints, exclude } of packages) {
  run("pnpm", ["exec", "publint"], dir);
  const before = new Set(readdirSync(out));
  run("pnpm", ["pack", "--pack-destination", out], dir);
  const tarball = readdirSync(out).find((file) => !before.has(file));
  const args = [join(out, tarball)];
  if (entrypoints) args.push("--entrypoints", ...entrypoints);
  if (exclude) args.push("--exclude-entrypoints", ...exclude);
  run("pnpm", ["exec", "attw", ...args], process.cwd());
}

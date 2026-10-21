import tseslint from "typescript-eslint";
import root from "../../eslint.config";

const readonly = (names: string[]) =>
  Object.fromEntries(names.map((name) => [name, "readonly" as const]));

// ESLint uses the config nearest to each file, so this one applies inside
// packages/capture-ui: the repository rules, plus the globals of the plain
// JavaScript demo (a browser page and a Node static server).
export default tseslint.config(...root, {
  files: ["demo/**/*.js", "demo/**/*.mjs"],
  languageOptions: {
    globals: readonly([
      "console",
      "document",
      "Event",
      "location",
      "performance",
      "process",
      "requestAnimationFrame",
      "URL",
      "URLSearchParams",
    ]),
  },
});

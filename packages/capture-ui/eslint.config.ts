import tseslint from "typescript-eslint";
import root from "../../eslint.config";

const readonly = (names: string[]) =>
  Object.fromEntries(names.map((name) => [name, "readonly" as const]));

// ESLint uses the config nearest to each file, so this one applies inside
// packages/capture-ui: the repository rules, plus the globals of the plain
// JavaScript demo and end-to-end pages (browser pages and Node static servers).
export default tseslint.config(...root, {
  files: ["demo/**/*.js", "demo/**/*.mjs", "e2e/**/*.js", "e2e/**/*.mjs"],
  languageOptions: {
    globals: readonly([
      "clearInterval",
      "console",
      "document",
      "Event",
      "location",
      "navigator",
      "performance",
      "process",
      "requestAnimationFrame",
      "setInterval",
      "URL",
      "URLSearchParams",
      "window",
    ]),
  },
});

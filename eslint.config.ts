import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Cascades are generated data (converted classifier tables), not code.
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.angular/**",
      "**/.out/**",
      "packages/pixelvision/src/cascades/*.ts",
      "!packages/pixelvision/src/cascades/*.test.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    // CommonJS files load modules with `require`; that is what they exist for.
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { require: "readonly", module: "writable", exports: "writable" },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);

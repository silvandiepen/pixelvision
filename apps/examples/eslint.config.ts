import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import root from "../../eslint.config";

// ESLint uses the config nearest to each file, so this one applies inside
// apps/examples: the repository rules, plus Vue single-file components.
export default tseslint.config(
  ...root,
  {
    ignores: ["test-results/**", "playwright-report/**", "blob-report/**"],
  },
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    // TypeScript (vue-tsc) checks undefined names, as typescript-eslint
    // recommends; its recommended config only turns this off for .ts files.
    rules: { "no-undef": "off" },
  },
  {
    // Formatting is Prettier's job.
    files: ["**/*.vue"],
    rules: {
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
      "vue/html-indent": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/multiline-html-element-content-newline": "off",
    },
  },
);

import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import root from "../../eslint.config";

// ESLint uses the config nearest to each file, so this one applies inside
// examples/vue: the repository rules, plus Vue single-file components.
// "essential" leaves formatting to Prettier.
export default tseslint.config(...root, ...pluginVue.configs["flat/essential"], {
  files: ["**/*.vue"],
  languageOptions: {
    parserOptions: { parser: tseslint.parser },
  },
  // TypeScript (vue-tsc) checks undefined names, as typescript-eslint
  // recommends; its recommended config only turns this off for .ts files.
  rules: { "no-undef": "off" },
});

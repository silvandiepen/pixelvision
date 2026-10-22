// Metro in a pnpm monorepo: watch the whole repository (pixelvision is linked
// from packages/pixelvision), resolve packages from this app's node_modules
// first and the root's second, and follow pnpm's symlinks. pixelvision is
// resolved through its `exports`, so the app gets the built `dist`, like a
// package from npm.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

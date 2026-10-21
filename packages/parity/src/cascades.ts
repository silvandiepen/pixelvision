import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const directory = join(dirname(require.resolve("jsfeat")), "..", "cascades");

/**
 * Loads one of jsfeat's cascade files (they assign onto `jsfeat.haar` /
 * `jsfeat.bbf`) without touching the real jsfeat object.
 *
 * @param name - File name without `.js`, e.g. `"frontalface"`.
 * @returns The cascade object.
 */
export const loadCascade = <T = unknown>(name: string): T => {
  const target: { haar: Record<string, unknown>; bbf: Record<string, unknown> } = {
    haar: {},
    bbf: {},
  };
  new Function("jsfeat", readFileSync(join(directory, `${name}.js`), "utf8"))(target);
  return (Object.values(target.haar)[0] ?? Object.values(target.bbf)[0]) as T;
};

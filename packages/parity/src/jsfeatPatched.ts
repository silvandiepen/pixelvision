import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import jsfeat from "jsfeat";

const require = createRequire(import.meta.url);
const source = join(dirname(require.resolve("jsfeat")), "..", "src", "jsfeat_bbf.js");

const DRIFT = `                            u8o[0] += paddings[0];
                            u8o[1] += paddings[1];
                            u8o[2] += paddings[2];`;
const EXACT = `                            u8o[0] = dx[q]*bpp2 + dy[q]*(pyr[i4].cols*bpp2) + (y+1)*pyr[i4].cols*bpp4;
                            u8o[1] = dx[q]*bpp + dy[q]*(pyr[i4+(next<<2)].cols*bpp) + (y+1)*pyr[i4+(next<<2)].cols*bpp2;
                            u8o[2] = (y+1)*pyr[i4+(next<<3)].cols*bpp;`;

/**
 * jsfeat's BBF with one change: each row's sample offsets are computed from
 * the row number instead of accumulated. jsfeat's "skip the next window"
 * after a hit in the last column pushes the offsets past the row end, and
 * the per-row padding then carries that drift into every later row.
 * Comparing against this proves the drift is the only difference.
 *
 * @returns A `bbf` module bound to the real jsfeat otherwise.
 */
export const jsfeatBbfWithoutDrift = (): typeof jsfeat.bbf => {
  // jsfeat's sources use CRLF line endings.
  const code = readFileSync(source, "utf8").replace(/\r\n/g, "\n");
  if (!code.includes(DRIFT)) throw new Error("jsfeat_bbf.js changed: drift lines not found");
  const sandbox = Object.create(jsfeat) as typeof jsfeat;
  new Function("jsfeat", code.replace(DRIFT, EXACT))(sandbox);
  return sandbox.bbf;
};

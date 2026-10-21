// Usage: node dist/cli.mjs <input.pgm> <output.pgm>
import console from "node:console";
import process from "node:process";
import { scanFile } from "./scan.mjs";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node dist/cli.mjs <input.pgm> <output.pgm>");
  process.exit(2);
}

const result = await scanFile(input, output);
if (!result) {
  console.error(`No document found in ${input}`);
  process.exit(1);
}
console.log(JSON.stringify(result));

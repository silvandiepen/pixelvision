// A realistic pipeline over a synthetic scene; prints one checksum per step
// so engines can be compared exactly. No DOM, no Node APIs: it must run in
// any JavaScript engine pixelvision supports.
import {
  canny,
  createMatrix,
  detectFast,
  findDocument,
  gaussianBlur,
  grayscale,
  matrixFromRows,
  svd,
  trackPoints,
  warpAffine,
} from "pixelvision";

// Hermes has `print`; Node has `console`.
const engine = globalThis as {
  print?: (line: string) => void;
  console?: { log: (line: string) => void };
};
const write = (line: string) => (engine.print ? engine.print(line) : engine.console!.log(line));

/** FNV-1a over values, so results compare as short strings. */
const checksum = (values: ArrayLike<number>): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < values.length; i++) {
    hash ^= Math.round(values[i] * 1000) | 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16);
};

const width = 200;
const height = 150;
const rgba = { width, height, data: new Uint8ClampedArray(width * height * 4) };
let seed = 7;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const inside = x > 50 && x < 150 && y > 35 && y < 110;
    const v = inside ? 210 + (seed >>> 28) : 40 + (seed >>> 26);
    rgba.data.set([v, v, v, 255], (y * width + x) * 4);
  }
}

const gray = grayscale(rgba);
const blurred = gaussianBlur(gray, { kernelSize: 5 });
const edges = canny(blurred, { low: 20, high: 60 });
const corners = detectFast(blurred, { threshold: 20 });
const document = findDocument(rgba);
const moved = warpAffine(blurred, [1, 0, -3, 0, 1, -2]);
const tracked = trackPoints(blurred, moved, [{ x: 100, y: 70 }], { windowSize: 15, levels: 2 });
const decomposition = svd(
  matrixFromRows([
    [4, 1],
    [2, 3],
    [0, 5],
  ]),
);
createMatrix(1, 1);

write(`grayscale ${checksum(gray.data)}`);
write(`gaussianBlur ${checksum(blurred.data)}`);
write(`canny ${checksum(edges.data)}`);
write(`fast ${corners.length} ${checksum(corners.flatMap((c) => [c.x, c.y, c.score]))}`);
write(`document ${document ? checksum(document.corners.flatMap((p) => [p.x, p.y])) : "none"}`);
write(`track ${checksum(tracked.flatMap((p) => [p.x, p.y, p.tracked ? 1 : 0]))}`);
write(`svd ${checksum(decomposition.values)}`);

import { describe, expect, it } from "vitest";
import { parityCounts } from "./facts";

describe("parityCounts", () => {
  it("counts ported rows and identical ones, skipping new functions", () => {
    const readme = [
      "# x",
      "",
      "## jsfeat parity",
      "",
      "| jsfeat | pixelvision | Parity |",
      "| --- | --- | --- |",
      "| `a` | `a` | identical |",
      "| — | `b` | new |",
      "| `c` | `c` | identical; fixed |",
      "| `d` | `d` | rewritten |",
      "",
      "## Next",
    ].join("\n");
    expect(parityCounts(readme)).toEqual({ rows: 3, identical: 2 });
  });
});

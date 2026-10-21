import { describe, expect, it } from "vitest";
import { createRunCounter } from "./runToken";

describe("createRunCounter", () => {
  it("keeps only the newest run current", () => {
    const runs = createRunCounter();
    const first = runs.begin();
    expect(first.current).toBe(true);
    expect(first.signal.aborted).toBe(false);

    const second = runs.begin();

    expect(first.current).toBe(false);
    expect(first.signal.aborted).toBe(true);
    expect(second.current).toBe(true);
  });

  it("ends the current run on cancel, repeatedly and before any run", () => {
    const runs = createRunCounter();
    runs.cancel();
    const token = runs.begin();

    runs.cancel();
    runs.cancel();

    expect(token.current).toBe(false);
    expect(runs.begin().current).toBe(true);
  });
});

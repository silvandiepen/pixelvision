import { describe, expect, it } from "vitest";
import { createSettledValue } from "./settle";

describe("createSettledValue", () => {
  it("shows a change only after it persists", () => {
    const v = createSettledValue("a", { delayMs: 500, minHoldMs: 0 });
    expect(v.update("b", 0)).toBe("a");
    expect(v.update("b", 400)).toBe("a");
    expect(v.update("b", 500)).toBe("b");
    expect(v.value).toBe("b");
  });

  it("restarts the wait when the reported value flickers", () => {
    const v = createSettledValue("a", { delayMs: 500, minHoldMs: 0 });
    v.update("b", 0);
    v.update("c", 300);
    expect(v.update("b", 600)).toBe("a");
    expect(v.update("a", 700)).toBe("a");
    expect(v.update("b", 1000)).toBe("a");
    expect(v.update("b", 1500)).toBe("b");
  });

  it("keeps a shown value for at least minHoldMs", () => {
    const v = createSettledValue("a", { delayMs: 100, minHoldMs: 1000 });
    v.update("b", 0);
    expect(v.update("b", 100)).toBe("b");
    v.update("c", 200);
    expect(v.update("c", 900)).toBe("b");
    expect(v.update("c", 1100)).toBe("c");
  });

  it("uses a delay per value", () => {
    const v = createSettledValue<string | undefined>(undefined, {
      delayMs: (value) => (value === "slow" ? 1000 : 100),
      minHoldMs: 0,
    });
    v.update("slow", 0);
    expect(v.update("slow", 500)).toBeUndefined();
    expect(v.update("slow", 1000)).toBe("slow");
    v.update("fast", 1100);
    expect(v.update("fast", 1200)).toBe("fast");
  });

  it("forces and resets", () => {
    const v = createSettledValue("a");
    expect(v.force("x", 0)).toBe("x");
    expect(v.update("y", 100)).toBe("x");
    v.reset("z");
    expect(v.value).toBe("z");
    v.update("q", 0);
    expect(v.update("q", 800)).toBe("q");
  });
});

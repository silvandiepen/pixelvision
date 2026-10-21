import { describe, expect, it, vi } from "vitest";
import { HAPTICS, vibrate } from "./haptics";

describe("vibrate", () => {
  it("vibrates when supported", () => {
    const nav = { vibrate: vi.fn(() => true) };
    expect(vibrate(HAPTICS.step, nav)).toBe(true);
    expect(vibrate(HAPTICS.success, nav)).toBe(true);
    expect(nav.vibrate).toHaveBeenLastCalledWith([16, 60, 24]);
  });

  it("waits for the person to have interacted with the page", () => {
    const nav = { vibrate: vi.fn(() => true), userActivation: { hasBeenActive: false } };
    expect(vibrate(10, nav)).toBe(false);
    expect(nav.vibrate).not.toHaveBeenCalled();
    nav.userActivation.hasBeenActive = true;
    expect(vibrate(10, nav)).toBe(true);
  });

  it("does nothing without support", () => {
    expect(vibrate(10, undefined)).toBe(false);
    expect(vibrate(10, {})).toBe(false);
  });

  it("never throws", () => {
    const nav = {
      vibrate: () => {
        throw new Error("blocked");
      },
    };
    expect(vibrate(HAPTICS.error, nav)).toBe(false);
  });

  it("uses the global navigator by default", () => {
    expect(typeof vibrate(1)).toBe("boolean");
  });
});

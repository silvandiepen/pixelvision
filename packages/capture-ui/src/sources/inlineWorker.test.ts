import { afterEach, describe, expect, it, vi } from "vitest";
import { createInlineWorker } from "./inlineWorker";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("createInlineWorker", () => {
  it("returns undefined without a bundled source (tests) or without Worker", () => {
    expect(createInlineWorker()).toBeUndefined();
    vi.stubGlobal("Worker", undefined);
    expect(createInlineWorker("code")).toBeUndefined();
  });

  it("starts a module worker from a Blob URL and revokes it later", () => {
    vi.useFakeTimers();
    const created: Array<[string, WorkerOptions]> = [];
    vi.stubGlobal(
      "Worker",
      class {
        constructor(url: string, options: WorkerOptions) {
          created.push([url, options]);
        }
      },
    );
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:worker");
    expect(createInlineWorker("self.x = 1")).toBeDefined();
    expect(created).toEqual([["blob:worker", { type: "module" }]]);
    vi.advanceTimersByTime(10_000);
    expect(revoke).toHaveBeenCalledWith("blob:worker");
  });

  it("returns undefined without Blob", () => {
    vi.stubGlobal("Worker", class {});
    vi.stubGlobal("Blob", undefined);
    expect(createInlineWorker("code")).toBeUndefined();
  });

  it("returns undefined when the worker can't be created", () => {
    vi.stubGlobal(
      "Worker",
      class {
        constructor() {
          throw new Error("blocked");
        }
      },
    );
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:x");
    expect(createInlineWorker("code")).toBeUndefined();
  });
});

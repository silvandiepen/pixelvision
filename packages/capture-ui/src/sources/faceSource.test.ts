import type { HeadPoseCascades } from "pixelvision";
import { describe, expect, it, vi } from "vitest";
import { createRunCounter } from "../logic/runToken";
import { createDefaultPoseSource, loadCascades } from "./faceSource";
import type { WorkerLike } from "./source.model";

const cascades = { frontal: {}, profile: {} } as unknown as HeadPoseCascades;

/**
 * A promise with its resolver, to hold an async step open.
 *
 * @returns The promise and `resolve`.
 */
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

/** A worker stand-in that records what it was sent and whether it was terminated. */
const fakeWorker = () => {
  const worker = {
    posted: [] as unknown[],
    terminated: false,
    postMessage(message: unknown) {
      worker.posted.push(message);
    },
    addEventListener() {},
    terminate() {
      worker.terminated = true;
    },
  };
  return worker;
};

describe("createDefaultPoseSource", () => {
  it("builds a worker source with the given cascades", async () => {
    const worker = fakeWorker();
    const loader = vi.fn();
    const built = await createDefaultPoseSource({
      token: createRunCounter().begin(),
      cascades,
      loadCascades: loader,
      createWorker: () => worker as WorkerLike,
    });

    expect(built?.kind).toBe("haar (worker)");
    expect(loader).not.toHaveBeenCalled();
    expect(worker.posted).toEqual([{ type: "init", cascades, poseOptions: {} }]);
    built!.source.dispose!();
    expect(worker.terminated).toBe(true);
  });

  it("falls back to the main thread without a worker", async () => {
    const built = await createDefaultPoseSource({
      token: createRunCounter().begin(),
      loadCascades: async () => cascades,
      createWorker: () => undefined,
    });
    expect(built?.kind).toBe("haar (main thread)");
    const mainThread = await createDefaultPoseSource({
      token: createRunCounter().begin(),
      cascades,
      loadCascades: async () => cascades,
    });
    expect(mainThread?.kind).toBe("haar (main thread)");
  });

  it("starts no worker when the run is stopped while the cascades load", async () => {
    const runs = createRunCounter();
    const loading = deferred<HeadPoseCascades>();
    const createWorker = vi.fn(() => fakeWorker() as WorkerLike);

    const pending = createDefaultPoseSource({
      token: runs.begin(),
      loadCascades: () => loading.promise,
      createWorker,
    });
    runs.cancel();
    loading.resolve(cascades);

    expect(await pending).toBeUndefined();
    expect(createWorker).not.toHaveBeenCalled();
  });

  it("builds nothing for a run that already ended", async () => {
    const runs = createRunCounter();
    const token = runs.begin();
    runs.cancel();
    const loader = vi.fn(async () => cascades);

    expect(await createDefaultPoseSource({ token, loadCascades: loader })).toBeUndefined();
    expect(loader).not.toHaveBeenCalled();
  });
});

describe("loadCascades", () => {
  it("loads the frontal and profile cascades", async () => {
    const loaded = await loadCascades();
    expect(loaded.frontal).toBeDefined();
    expect(loaded.profile).toBeDefined();
  });
});

import type { HeadPoseCascades } from "pixelvision";
import { haarPoseSource } from "./haar";
import type { BuiltPoseSource, DefaultPoseSourceOptions } from "./source.model";
import { workerPoseSource } from "./worker";

/**
 * Loads pixelvision's frontal and profile cascades on demand, so they're only downloaded when
 * the default detector is used.
 *
 * @returns The cascades.
 */
export async function loadCascades(): Promise<HeadPoseCascades> {
  const [{ frontalFace }, { profileFace }] = await Promise.all([
    import("pixelvision/cascades/frontal-face"),
    import("pixelvision/cascades/profile-face"),
  ]);
  return { frontal: frontalFace, profile: profileFace };
}

/**
 * Builds the default HAAR pose source for one run: in a worker when `createWorker` gives one,
 * otherwise on the main thread. The run token is checked after loading the cascades, so a run
 * that was stopped meanwhile gets nothing, and no worker is started for it.
 *
 * @param options - The run token, cascades or a loader, and a worker factory.
 * @returns The source and how it runs, or undefined when the run ended while loading.
 *
 * @example
 * const built = await createDefaultPoseSource({ token, loadCascades, createWorker });
 * if (!built) return; // stopped while loading
 */
export async function createDefaultPoseSource(
  options: DefaultPoseSourceOptions,
): Promise<BuiltPoseSource | undefined> {
  const { token, createWorker } = options;
  if (!token.current) return undefined;
  const cascades = options.cascades ?? (await options.loadCascades());
  if (!token.current) return undefined;
  const worker = createWorker?.();
  if (worker) return { source: workerPoseSource(worker, { cascades }), kind: "haar (worker)" };
  return { source: haarPoseSource({ cascades }), kind: "haar (main thread)" };
}

import type { HeadPoseResources } from "./demo.model";

/**
 * Loads the frontal and profile face cascades. They're a few hundred
 * kilobytes each, so they're imported only when a page needs them.
 *
 * @returns Both cascades.
 */
export async function loadHeadPoseCascades(): Promise<HeadPoseResources> {
  const [{ frontalFace }, { profileFace }] = await Promise.all([
    import("pixelvision/cascades/frontal-face"),
    import("pixelvision/cascades/profile-face"),
  ]);
  return { frontal: frontalFace, profile: profileFace };
}

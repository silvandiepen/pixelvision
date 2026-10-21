import type { Cascades } from "./demo.model";

/**
 * Loads the four bundled cascades. They are separate entry points of
 * pixelvision, so the bundler splits them out of the main chunk.
 *
 * @returns The cascades by name.
 */
export async function loadCascades(): Promise<Cascades> {
  const [frontal, profile, eyes, body] = await Promise.all([
    import("pixelvision/cascades/frontal-face"),
    import("pixelvision/cascades/profile-face"),
    import("pixelvision/cascades/eye"),
    import("pixelvision/cascades/upper-body"),
  ]);
  return {
    frontalFace: frontal.frontalFace,
    profileFace: profile.profileFace,
    eye: eyes.eye,
    upperBody: body.upperBody,
  };
}

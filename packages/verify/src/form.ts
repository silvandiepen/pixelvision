import type { SignedChallenge } from "./challenge.model";
import type { Evidence } from "./verify.model";

/**
 * Reads the evidence a browser posted as `multipart/form-data`, as
 * `evidenceForm` in `@pixelvision/capture-ui` builds it: a `challenge` field
 * (the signed challenge as JSON), a `times` field (each frame's time as a
 * JSON array), a `frame` file per frame in order, and an optional `photo`.
 *
 * It only reads the fields; {@link verifyEvidence} checks them. Limit the
 * request body size in your server as well.
 *
 * @param form - The posted form, e.g. `await request.formData()`.
 * @returns The evidence.
 * @throws {TypeError} When a field is missing or malformed.
 *
 * @example
 * const evidence = await readEvidenceForm(await request.formData());
 */
export async function readEvidenceForm(form: FormData): Promise<Evidence> {
  const challengeText = form.get("challenge");
  const timesText = form.get("times");
  if (typeof challengeText !== "string" || typeof timesText !== "string") {
    throw new TypeError("The form needs a challenge and times field");
  }
  let challenge: SignedChallenge;
  let times: unknown;
  try {
    challenge = JSON.parse(challengeText) as SignedChallenge;
    times = JSON.parse(timesText);
  } catch {
    throw new TypeError("The challenge and times fields must be JSON");
  }
  const files = form.getAll("frame");
  if (
    !Array.isArray(times) ||
    times.length !== files.length ||
    !times.every((time) => Number.isFinite(time)) ||
    !files.every((file) => file instanceof Blob)
  ) {
    throw new TypeError("Every frame needs a file and a time");
  }
  const frames = await Promise.all(
    (files as Blob[]).map(async (file, i) => ({
      time: times[i] as number,
      jpeg: new Uint8Array(await file.arrayBuffer()),
    })),
  );
  const photo = form.get("photo");
  return photo instanceof Blob
    ? { challenge, frames, photo: new Uint8Array(await photo.arrayBuffer()) }
    : { challenge, frames };
}

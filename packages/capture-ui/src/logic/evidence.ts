import type { EvidenceDetail } from "../elements/events.model";
import type { ServerChallenge } from "./evidence.model";

/**
 * Whether a server's response has the shape of a signed challenge. Only the
 * shape: the server checks the signature when the evidence comes back.
 *
 * @param value - The parsed response.
 * @returns Whether it does.
 */
export function isServerChallenge(value: unknown): value is ServerChallenge {
  const c = value as ServerChallenge | null;
  return (
    typeof c === "object" &&
    c !== null &&
    typeof c.id === "string" &&
    Array.isArray(c.steps) &&
    c.steps.length > 0 &&
    c.steps.every((step) => typeof step === "string") &&
    Number.isFinite(c.issuedAt) &&
    Number.isFinite(c.expiresAt) &&
    typeof c.signature === "string"
  );
}

/**
 * Packs a `pv-evidence` event's detail into a form to post to your server,
 * in the shape `readEvidenceForm` in `@pixelvision/verify` reads: the
 * signed challenge as JSON, each frame's time, a `frame` file per frame in
 * order, and the photo.
 *
 * @param evidence - The event's detail.
 * @returns The form.
 *
 * @example
 * selfie.addEventListener("pv-evidence", async (event) => {
 *   const response = await fetch("/verify", { method: "POST", body: evidenceForm(event.detail) });
 * });
 */
export function evidenceForm(evidence: EvidenceDetail): FormData {
  const form = new FormData();
  form.set("challenge", JSON.stringify(evidence.challenge));
  form.set("times", JSON.stringify(evidence.frames.map((frame) => frame.time)));
  evidence.frames.forEach((frame, i) => form.append("frame", frame.blob, `frame-${i}.jpg`));
  form.set("photo", evidence.photo, "photo.jpg");
  return form;
}

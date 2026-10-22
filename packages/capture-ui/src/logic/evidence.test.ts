import { describe, expect, it } from "vitest";
import { evidenceForm, isServerChallenge } from "./evidence";

const challenge = {
  id: "abc",
  steps: ["frontal", "left"],
  issuedAt: 1,
  expiresAt: 2,
  signature: "sig",
};

describe("isServerChallenge", () => {
  it("accepts the shape of a signed challenge", () => {
    expect(isServerChallenge(challenge)).toBe(true);
  });

  it("refuses anything else", () => {
    expect(isServerChallenge(null)).toBe(false);
    expect(isServerChallenge("x")).toBe(false);
    expect(isServerChallenge({ ...challenge, steps: [] })).toBe(false);
    expect(isServerChallenge({ ...challenge, steps: [1] })).toBe(false);
    expect(isServerChallenge({ ...challenge, expiresAt: "soon" })).toBe(false);
    expect(isServerChallenge({ ...challenge, signature: undefined })).toBe(false);
  });
});

describe("evidenceForm", () => {
  it("packs the challenge, the frame times, the frames and the photo", async () => {
    const form = evidenceForm({
      challenge: challenge as never,
      frames: [
        { time: 0, blob: new Blob(["a"]) },
        { time: 125, blob: new Blob(["b"]) },
      ],
      photo: new Blob(["p"]),
    });
    expect(JSON.parse(form.get("challenge") as string)).toEqual(challenge);
    expect(JSON.parse(form.get("times") as string)).toEqual([0, 125]);
    const frames = form.getAll("frame") as File[];
    expect(await Promise.all(frames.map((f) => f.text()))).toEqual(["a", "b"]);
    expect(frames[0].name).toBe("frame-0.jpg");
    expect(await (form.get("photo") as File).text()).toBe("p");
  });
});

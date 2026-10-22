import { readdirSync, readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { evidenceForm } from "@pixelvision/capture-ui";
import type { ServerChallenge } from "@pixelvision/capture-ui";
import type { VerifyResult } from "@pixelvision/verify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createVerifyServer } from "../src/server.ts";

const secret = "an-example-secret-that-is-long-enough!!";
// Frames of the sample head-turn clip (an AI-generated person), 8 a second.
const folder = new URL("../../../packages/verify/fixtures/head-turn/", import.meta.url);
const frames = readdirSync(folder)
  .sort()
  .map((file, i) => ({
    time: i * 125,
    blob: new Blob([readFileSync(new URL(file, folder))], { type: "image/jpeg" }),
  }));

const server = createVerifyServer({ secret, steps: "head-turn" });
let base = "";
beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});
afterAll(() => {
  server.close();
});

/**
 * Posts evidence as a browser would.
 *
 * @param challenge - The challenge the server issued.
 * @returns The server's answer.
 */
const post = async (challenge: ServerChallenge): Promise<VerifyResult> => {
  const body = evidenceForm({ challenge, frames, photo: frames[0].blob });
  return (await fetch(`${base}/verify`, { method: "POST", body })).json() as Promise<VerifyResult>;
};

describe("the example verify server", () => {
  it("issues a challenge and passes evidence that does it, once", async () => {
    const challenge = (await (await fetch(`${base}/challenge`)).json()) as ServerChallenge;
    expect(challenge.steps).toEqual(["frontal", "side", "other-side", "frontal"]);

    const first = await post(challenge);
    expect(first).toMatchObject({ passed: true, stepsDone: 4 });
    // The same evidence again: the challenge was good for one attempt.
    expect(await post(challenge)).toMatchObject({ passed: false, reasons: ["code-used"] });
  }, 60_000);

  it("rejects a challenge the browser changed", async () => {
    const challenge = (await (await fetch(`${base}/challenge`)).json()) as ServerChallenge;
    const easier = { ...challenge, steps: ["frontal"] as ServerChallenge["steps"] };
    expect(await post(easier)).toMatchObject({ passed: false, reasons: ["bad-signature"] });
  });

  it("answers 400 to a broken form, 413 to an oversized one and 404 elsewhere", async () => {
    const broken = await fetch(`${base}/verify`, { method: "POST", body: "nonsense" });
    expect(broken.status).toBe(400);
    const small = createVerifyServer({ secret, maxBytes: 10 });
    await new Promise<void>((resolve) => small.listen(0, resolve));
    const port = (small.address() as AddressInfo).port;
    const big = await fetch(`http://localhost:${port}/verify`, {
      method: "POST",
      body: "x".repeat(100),
    });
    expect(big.status).toBe(413);
    small.close();
    expect((await fetch(`${base}/elsewhere`)).status).toBe(404);
  });
});

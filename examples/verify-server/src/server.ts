import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import {
  createChallenge,
  createMemoryCodeStore,
  readEvidenceForm,
  verifyEvidence,
} from "@pixelvision/verify";
import type { CreateChallengeOptions } from "@pixelvision/verify";

/** Options for {@link createVerifyServer}. */
export interface VerifyServerOptions {
  /** Signs the challenges: at least 32 characters, kept on the server. */
  secret: string;
  /** Which steps to ask for (default: a random order each time). */
  steps?: CreateChallengeOptions["steps"];
  /** Largest evidence upload, in bytes (default 8 MB). */
  maxBytes?: number;
}

/**
 * Reads a request body, stopping at a size limit.
 *
 * @param request - The request.
 * @param maxBytes - The limit.
 * @returns The body, or null when it's too large.
 */
async function readBody(request: IncomingMessage, maxBytes: number): Promise<Buffer | null> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += (chunk as Buffer).length;
    if (size > maxBytes) return null;
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

/**
 * Sends a JSON response.
 *
 * @param response - The response.
 * @param status - HTTP status.
 * @param body - What to send.
 */
function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
}

/**
 * A server with the two endpoints a face check needs:
 *
 * - `GET /challenge` issues a signed, one-time challenge for
 *   `<pv-face-capture challenge-url="/challenge">`.
 * - `POST /verify` takes the evidence the browser posts (`evidenceForm` of
 *   the `pv-evidence` event) and answers whether the frames do what the
 *   challenge asked. Your app acts on this answer, not on anything the
 *   browser reports.
 *
 * @param options - Secret, steps, upload limit.
 * @returns The server, not yet listening.
 */
export function createVerifyServer(options: VerifyServerOptions): Server {
  const { secret, steps, maxBytes = 8_000_000 } = options;
  const codes = createMemoryCodeStore();
  return createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/challenge") {
      json(response, 200, await createChallenge({ secret, steps }));
      return;
    }
    if (request.method === "POST" && request.url === "/verify") {
      const body = await readBody(request, maxBytes);
      if (!body) return json(response, 413, { error: "The evidence is too large" });
      let evidence;
      try {
        const form = await new Request("http://localhost/verify", {
          method: "POST",
          headers: { "content-type": request.headers["content-type"] ?? "" },
          body: new Uint8Array(body),
        }).formData();
        evidence = await readEvidenceForm(form);
      } catch {
        return json(response, 400, { error: "The evidence isn't a valid form" });
      }
      json(response, 200, await verifyEvidence(evidence, { secret, codes }));
      return;
    }
    json(response, 404, { error: "Not found" });
  });
}

import { describe, expect, it, vi } from "vitest";
import type { DetectionWorkerRequest, WorkerLike } from "./source.model";
import { createWorkerClient, workerDocumentFinder, workerPoseSource } from "./worker";

/** A worker stand-in that records messages and lets the test answer them. */
function fakeWorker() {
  const listeners: Record<string, Array<(event: MessageEvent) => void>> = {
    message: [],
    error: [],
  };
  const posted: Array<{ message: DetectionWorkerRequest; transfer?: Transferable[] }> = [];
  const terminate = vi.fn<() => void>();
  const worker: WorkerLike = {
    postMessage: (message: unknown, transfer?: Transferable[]) => {
      posted.push({ message: message as DetectionWorkerRequest, transfer });
    },
    addEventListener: (type, listener) => listeners[type].push(listener),
    terminate,
  };
  const fire = (type: "message" | "error", data: unknown) =>
    listeners[type].forEach((l) => l(data as MessageEvent));
  return { worker, posted, fire, terminate };
}

const frame = () => ({ width: 2, height: 1, data: new Uint8ClampedArray(8).fill(7) });

describe("createWorkerClient", () => {
  it("sends frames with a transferred copy and resolves by id", async () => {
    const { worker, posted, fire } = fakeWorker();
    const client = createWorkerClient(worker);
    const input = frame();
    const a = client.request<string>("face", input);
    const b = client.request<string>("document", input);
    const [first, second] = posted;
    expect(first.message).toMatchObject({
      type: "detect",
      task: "face",
      id: 1,
      width: 2,
      height: 1,
    });
    expect(second.message).toMatchObject({ task: "document", id: 2 });
    const sent = first.message as Extract<DetectionWorkerRequest, { type: "detect" }>;
    expect(sent.data).not.toBe(input.data);
    expect(first.transfer).toEqual([sent.data.buffer]);
    fire("message", { data: { type: "result", id: 2, result: "B" } });
    fire("message", { data: { type: "error", id: 1, message: "bad" } });
    fire("message", { data: { type: "result", id: 99, result: "ignored" } });
    await expect(b).resolves.toBe("B");
    await expect(a).rejects.toThrow("bad");
  });

  it("sends init messages", () => {
    const { worker, posted } = fakeWorker();
    createWorkerClient(worker).init({ documentOptions: { minArea: 0.3 } });
    expect(posted[0].message).toEqual({ type: "init", documentOptions: { minArea: 0.3 } });
  });

  it("fails pending and later requests when the worker errors", async () => {
    const { worker, fire } = fakeWorker();
    const client = createWorkerClient(worker);
    const pending = client.request("face", frame());
    fire("error", { message: "CSP blocked" });
    await expect(pending).rejects.toThrow("CSP blocked");
    await expect(client.request("face", frame())).rejects.toThrow("CSP blocked");
  });

  it("uses a generic message for errors without one", async () => {
    const { worker, fire } = fakeWorker();
    const client = createWorkerClient(worker);
    fire("error", {});
    await expect(client.request("face", frame())).rejects.toThrow("Worker failed");
  });

  it("disposes", async () => {
    const { worker, terminate } = fakeWorker();
    const client = createWorkerClient(worker);
    const pending = client.request("face", frame());
    client.dispose();
    await expect(pending).rejects.toThrow("Worker disposed");
    expect(terminate).toHaveBeenCalled();
  });
});

describe("workerPoseSource and workerDocumentFinder", () => {
  it("send their setup and route requests", async () => {
    const cascades = { frontal: {}, profile: {} } as never;
    const face = fakeWorker();
    const source = workerPoseSource(face.worker, { cascades, maxSize: 200 });
    expect(source.directional).toBe(false);
    expect(face.posted[0].message).toEqual({
      type: "init",
      cascades,
      poseOptions: { maxSize: 200 },
    });
    const pose = source.detect(frame());
    expect(face.posted[1].message).toMatchObject({ task: "face" });
    face.fire("message", { data: { type: "result", id: 1, result: { pose: "frontal" } } });
    await expect(pose).resolves.toEqual({ pose: "frontal" });
    source.dispose!();
    expect(face.terminate).toHaveBeenCalled();

    const doc = fakeWorker();
    const finder = workerDocumentFinder(doc.worker);
    expect(doc.posted[0].message).toEqual({ type: "init", documentOptions: {} });
    const found = finder.find(frame());
    expect(doc.posted[1].message).toMatchObject({ task: "document" });
    doc.fire("message", { data: { type: "result", id: 1, result: null } });
    await expect(found).resolves.toBeNull();
    workerDocumentFinder(fakeWorker().worker, { minArea: 0.5 }).dispose!();
  });
});

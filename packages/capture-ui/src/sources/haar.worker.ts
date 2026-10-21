/// <reference lib="webworker" />
import { findDocument } from "pixelvision";
import type { FindDocumentOptions, HeadPoseCascades, HeadPoseOptions } from "pixelvision";
import { detectWithHaar } from "./haar";
import type { DetectionWorkerRequest, DetectionWorkerResponse } from "./source.model";

// Detection off the main thread: HAAR head pose and document finding. See createWorkerClient.
let cascades: HeadPoseCascades | undefined;
let poseOptions: HeadPoseOptions = {};
let documentOptions: FindDocumentOptions = {};

self.addEventListener("message", (event: MessageEvent<DetectionWorkerRequest>) => {
  const message = event.data;
  if (message.type === "init") {
    cascades = message.cascades ?? cascades;
    poseOptions = message.poseOptions ?? poseOptions;
    documentOptions = message.documentOptions ?? documentOptions;
    return;
  }
  let response: DetectionWorkerResponse;
  try {
    const frame = { width: message.width, height: message.height, data: message.data };
    let result;
    if (message.task === "document") {
      result = findDocument(frame, documentOptions);
    } else {
      if (!cascades) throw new Error("The worker received a frame before its cascades");
      result = detectWithHaar(frame, { ...poseOptions, cascades });
    }
    response = { type: "result", id: message.id, result };
  } catch (error) {
    response = { type: "error", id: message.id, message: (error as Error).message };
  }
  (self as unknown as Worker).postMessage(response);
});

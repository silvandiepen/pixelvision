import { detectInWorker } from "./detectInWorker";
import { drawResult, formatCorners, readCameraFrame, readImageFile } from "./pixels";
import "./style.css";

/**
 * Looks up an element the page must have.
 *
 * @param selector - CSS selector.
 * @returns The element.
 * @throws {Error} When it's missing.
 */
function element<T extends Element>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
}

const upload = element<HTMLInputElement>("[data-upload]");
const camera = element<HTMLButtonElement>("[data-camera]");
const status = element<HTMLParagraphElement>("[data-status]");
const canvas = element<HTMLCanvasElement>("[data-result]");

/**
 * Reads a photo, finds the document in it and shows the result.
 *
 * @param read - Gets the photo's pixels.
 */
async function scan(read: () => Promise<ImageData>): Promise<void> {
  status.textContent = "Looking for a document…";
  canvas.removeAttribute("data-found");
  try {
    const result = await detectInWorker(await read());
    drawResult(canvas, result);
    canvas.dataset.found = String(Boolean(result.corners));
    canvas.dataset.corners = result.corners ? formatCorners(result.corners) : "";
    status.textContent = result.corners ? "Found a document." : "No document found.";
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
  }
}

upload.addEventListener("change", () => {
  const file = upload.files?.[0];
  if (file) void scan(() => readImageFile(file));
});
camera.addEventListener("click", () => void scan(readCameraFrame));

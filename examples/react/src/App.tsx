import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { detect } from "./detect";
import { drawResult, formatCorners, readCameraFrame, readImageFile } from "./pixels";

/**
 * Upload a photo (or take one with the camera), find the document in it,
 * and draw the edges and the document's outline.
 *
 * @returns The page.
 */
export function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Choose a photo or use the camera.");
  const [found, setFound] = useState<boolean>();
  const [corners, setCorners] = useState("");

  /**
   * Reads a photo, finds the document in it and shows the result.
   *
   * @param read - Gets the photo's pixels.
   */
  async function scan(read: () => Promise<ImageData>): Promise<void> {
    setStatus("Looking for a document…");
    setFound(undefined);
    try {
      const result = detect(await read());
      if (canvas.current) drawResult(canvas.current, result);
      setFound(Boolean(result.corners));
      setCorners(result.corners ? formatCorners(result.corners) : "");
      setStatus(result.corners ? "Found a document." : "No document found.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Scans the file the person picked.
   *
   * @param event - The file input's change event.
   */
  function onUpload(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) void scan(() => readImageFile(file));
  }

  return (
    <main>
      <h1>pixelvision · React</h1>
      <p>Upload a photo of a document, or take one with the camera.</p>
      <div className="controls">
        <input type="file" accept="image/*" aria-label="Photo" data-upload onChange={onUpload} />
        <button type="button" data-camera onClick={() => void scan(readCameraFrame)}>
          Use camera
        </button>
      </div>
      <p role="status" data-status>
        {status}
      </p>
      <canvas ref={canvas} data-result data-found={found} data-corners={corners} />
    </main>
  );
}

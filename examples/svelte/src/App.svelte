<script lang="ts">
  import { detect } from "./detect";
  import { drawResult, formatCorners, readCameraFrame, readImageFile } from "./pixels";

  let canvas: HTMLCanvasElement;
  let status = $state("Choose a photo or use the camera.");
  let found = $state<boolean>();
  let corners = $state("");

  /**
   * Reads a photo, finds the document in it and shows the result.
   *
   * @param read - Gets the photo's pixels.
   */
  async function scan(read: () => Promise<ImageData>): Promise<void> {
    status = "Looking for a document…";
    found = undefined;
    try {
      const result = detect(await read());
      drawResult(canvas, result);
      found = Boolean(result.corners);
      corners = result.corners ? formatCorners(result.corners) : "";
      status = result.corners ? "Found a document." : "No document found.";
    } catch (error) {
      status = error instanceof Error ? error.message : String(error);
    }
  }

  /**
   * Scans the file the person picked.
   *
   * @param event - The file input's change event.
   */
  function onUpload(event: Event & { currentTarget: HTMLInputElement }): void {
    const file = event.currentTarget.files?.[0];
    if (file) void scan(() => readImageFile(file));
  }
</script>

<main>
  <h1>pixelvision · Svelte</h1>
  <p>Upload a photo of a document, or take one with the camera.</p>
  <div class="controls">
    <input type="file" accept="image/*" aria-label="Photo" data-upload onchange={onUpload} />
    <button type="button" data-camera onclick={() => scan(readCameraFrame)}>Use camera</button>
  </div>
  <p role="status" data-status>{status}</p>
  <canvas bind:this={canvas} data-result data-found={found} data-corners={corners}></canvas>
</main>

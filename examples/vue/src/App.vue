<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { detect } from "./detect";
import { drawResult, formatCorners, readCameraFrame, readImageFile } from "./pixels";

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const status = ref("Choose a photo or use the camera.");
const found = ref<boolean>();
const corners = ref("");

/**
 * Reads a photo, finds the document in it and shows the result.
 *
 * @param read - Gets the photo's pixels.
 */
async function scan(read: () => Promise<ImageData>): Promise<void> {
  status.value = "Looking for a document…";
  found.value = undefined;
  try {
    const result = detect(await read());
    if (canvas.value) drawResult(canvas.value, result);
    found.value = Boolean(result.corners);
    corners.value = result.corners ? formatCorners(result.corners) : "";
    status.value = result.corners ? "Found a document." : "No document found.";
  } catch (error) {
    status.value = error instanceof Error ? error.message : String(error);
  }
}

/**
 * Scans the file the person picked.
 *
 * @param event - The file input's change event.
 */
function onUpload(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) void scan(() => readImageFile(file));
}
</script>

<template>
  <main>
    <h1>pixelvision · Vue</h1>
    <p>Upload a photo of a document, or take one with the camera.</p>
    <div class="controls">
      <input type="file" accept="image/*" aria-label="Photo" data-upload @change="onUpload" />
      <button type="button" data-camera @click="scan(readCameraFrame)">Use camera</button>
    </div>
    <p role="status" data-status>{{ status }}</p>
    <canvas ref="canvas" data-result :data-found="found" :data-corners="corners"></canvas>
  </main>
</template>

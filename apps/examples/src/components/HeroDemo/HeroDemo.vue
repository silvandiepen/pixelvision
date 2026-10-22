<template>
  <figure :class="bemm()" :data-hero-source="source">
    <div :class="bemm('views')">
      <div :class="bemm('view')">
        <video
          v-show="source === 'camera'"
          ref="video"
          :class="bemm('video')"
          playsinline
          muted
        ></video>
        <canvas
          v-show="source === 'sample'"
          ref="input"
          :class="bemm('canvas')"
          aria-label="Input"
        ></canvas>
      </div>
      <div :class="bemm('view')">
        <canvas
          ref="output"
          :class="bemm('canvas', ['', source === 'camera' ? 'mirrored' : ''])"
          aria-label="Edges found by canny"
          data-hero-output
        ></canvas>
      </div>
    </div>
    <figcaption :class="bemm('caption')">
      <code :class="bemm('code')"
        >canny(gaussianBlur(grayscale(frame), {{ "{" }} kernelSize: 5 {{ "}" }}), {{ "{" }} low:
        {{ low }}, high: {{ low * 2.5 }} {{ "}" }})</code
      >
      <span :class="bemm('timing')">{{ timing }}</span>
    </figcaption>
    <div :class="bemm('controls')">
      <label :class="bemm('label')">
        Threshold
        <input
          v-model.number="low"
          :class="bemm('range')"
          type="range"
          min="10"
          max="150"
          step="5"
        />
      </label>
      <AppButton
        v-if="source === 'sample'"
        variant="secondary"
        data-hero-camera
        @click="startCamera"
      >
        Use your camera
      </AppButton>
      <AppButton v-else variant="secondary" @click="useSample">Back to the sample</AppButton>
    </div>
    <p v-if="camera.error.value" :class="bemm('message')" role="alert">{{ camera.error.value }}</p>
  </figure>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { useBemm } from "bemm";
import { canny, createMatrix, gaussianBlur, grayscale } from "pixelvision";
import type { Matrix, RGBAImage } from "pixelvision";
import AppButton from "../AppButton";
import { useCamera } from "../../composables/useCamera";
import { loadSample } from "../../samples/samples";
import { toDisplayPixels } from "../../utils/display";
import type { HeroSource } from "./HeroDemo.model";

const bemm = useBemm("hero-demo", { includeBaseClass: true });
const camera = useCamera();
const { video } = camera;
const input = useTemplateRef<HTMLCanvasElement>("input");
const output = useTemplateRef<HTMLCanvasElement>("output");

const source = ref<HeroSource>("sample");
const low = ref(60);
const timing = ref("");
// The sample photo, once it has loaded.
let sample: RGBAImage | null = null;
// Reused on every frame, so the camera loop allocates nothing.
const gray = createMatrix(0, 0);
const smooth = createMatrix(0, 0);
const edges = createMatrix(0, 0);
let frameRequest = 0;

/**
 * Draws RGBA pixels onto a canvas, resizing it to fit.
 *
 * @param canvas - The canvas.
 * @param image - The pixels.
 */
function draw(canvas: HTMLCanvasElement | null, image: Matrix<"u8"> | RGBAImage): void {
  if (!canvas) return;
  canvas.width = image.width;
  canvas.height = image.height;
  const { data, width, height } = toDisplayPixels(image);
  canvas.getContext("2d")?.putImageData(new ImageData(data, width, height), 0, 0);
}

/**
 * Finds the edges in one frame and draws them.
 *
 * @param frame - The frame.
 */
function process(frame: RGBAImage): void {
  const started = performance.now();
  grayscale(frame, { out: gray });
  gaussianBlur(gray, { kernelSize: 5, out: smooth });
  canny(smooth, { low: low.value, high: low.value * 2.5, out: edges });
  timing.value = `${(performance.now() - started).toFixed(1)} ms per ${frame.width} x ${frame.height} frame`;
  draw(output.value, edges);
}

/** Processes camera frames until the camera stops. */
function loop(): void {
  const frame = camera.frame({ width: 320, height: 240 });
  if (frame) process(frame);
  if (source.value === "camera") frameRequest = requestAnimationFrame(loop);
}

/** Switches to the camera. */
async function startCamera(): Promise<void> {
  if (!(await camera.start("user"))) return;
  source.value = "camera";
  loop();
}

/** Switches back to the sample. */
function useSample(): void {
  cancelAnimationFrame(frameRequest);
  camera.stop();
  source.value = "sample";
  if (sample) process(sample);
}

watch(low, () => {
  if (source.value === "sample" && sample) process(sample);
});
onMounted(() => {
  void loadSample("card-photo").then((image) => {
    sample = image;
    if (source.value !== "sample") return;
    draw(input.value, image);
    process(image);
  });
});
onBeforeUnmount(() => cancelAnimationFrame(frameRequest));
</script>

<style lang="scss">
.hero-demo {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-s);

  &__views {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--auno-space-xs);
  }

  &__view {
    overflow: hidden;
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
    line-height: 0;
  }

  &__canvas,
  &__video {
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }

  &__video,
  &__canvas--mirrored {
    transform: scaleX(-1);
  }

  &__caption {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--auno-space-xs);
    color: var(--auno-secondary);
    font-size: var(--auno-text-caption);
  }

  &__code {
    overflow-wrap: anywhere;
  }

  &__timing {
    font-variant-numeric: tabular-nums;
  }

  &__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--auno-space-s);
  }

  &__label {
    display: flex;
    align-items: center;
    gap: var(--auno-space-xs);
    font-size: var(--auno-text-small);
    font-weight: 600;
  }

  &__range {
    accent-color: var(--auno-ink);
  }

  &__message {
    color: var(--auno-refuse);
    font-size: var(--auno-text-small);
  }
}
</style>

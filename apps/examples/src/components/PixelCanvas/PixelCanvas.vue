<template>
  <canvas
    ref="canvas"
    :class="bemm('', ['', mirrored ? 'mirrored' : '', fit === 'cover' ? 'cover' : ''])"
    :width="pixels.width"
    :height="pixels.height"
    :data-checksum="pixels.checksum"
    :aria-label="label"
    role="img"
  ></canvas>
</template>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef, watch } from "vue";
import { useBemm } from "bemm";
import { toDisplayPixels } from "../../utils/display";
import type { PixelCanvasProps } from "./PixelCanvas.model";

const props = withDefaults(defineProps<PixelCanvasProps>(), { mirrored: false, fit: "width" });
const bemm = useBemm("pixel-canvas", { includeBaseClass: true });
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const pixels = computed(() => toDisplayPixels(props.image));

/** Draws the pixels onto the canvas. */
function draw(): void {
  const { width, height, data } = pixels.value;
  canvas.value?.getContext("2d")?.putImageData(new ImageData(data, width, height), 0, 0);
}

onMounted(draw);
watch(pixels, draw, { flush: "post" });
</script>

<style lang="scss">
.pixel-canvas {
  display: block;
  width: 100%;
  height: auto;

  &--cover {
    height: 100%;
    object-fit: cover;
  }

  &--mirrored {
    transform: scaleX(-1);
  }
}
</style>

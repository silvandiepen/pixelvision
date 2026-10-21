<template>
  <figure :class="bemm()">
    <figcaption :class="bemm('caption')">{{ label }}</figcaption>
    <div :class="bemm('frame', ['', pixelated ? 'pixelated' : ''])">
      <canvas
        ref="canvas"
        :class="bemm('canvas')"
        :width="pixels.width"
        :height="pixels.height"
        :data-checksum="pixels.checksum"
        :aria-label="label"
        role="img"
      ></canvas>
      <svg
        v-if="hasOverlay"
        ref="svg"
        :class="bemm('overlay')"
        :viewBox="`0 0 ${pixels.width} ${pixels.height}`"
        @pointermove="drag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
      >
        <polygon
          v-for="(polygon, index) in overlay?.polygons ?? []"
          :key="`polygon-${index}`"
          :class="bemm('shape')"
          :points="toSvgPoints(polygon)"
          :stroke-width="stroke"
        />
        <line
          v-for="(line, index) in overlay?.lines ?? []"
          :key="`line-${index}`"
          :class="bemm('line')"
          :x1="line.from.x"
          :y1="line.from.y"
          :x2="line.to.x"
          :y2="line.to.y"
          :stroke-width="stroke"
        />
        <circle
          v-for="(point, index) in overlay?.points ?? []"
          :key="`point-${index}`"
          :class="bemm('point')"
          :cx="point.x"
          :cy="point.y"
          :r="stroke * 2"
        />
        <template v-if="points">
          <polygon :class="bemm('shape')" :points="toSvgPoints(points)" :stroke-width="stroke" />
          <circle
            v-for="(point, index) in points"
            :key="`handle-${index}`"
            :class="bemm('handle')"
            :cx="point.x"
            :cy="point.y"
            :r="stroke * 5"
            :stroke-width="stroke"
            :data-handle="index"
            @pointerdown="startDrag($event, index)"
          />
        </template>
      </svg>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { useBemm } from "bemm";
import type { Point } from "pixelvision";
import { toDisplayPixels } from "../../utils/display";
import type { ImageViewEmits, ImageViewProps } from "./ImageView.model";

const props = defineProps<ImageViewProps>();
const emit = defineEmits<ImageViewEmits>();
const bemm = useBemm("image-view", { includeBaseClass: true });

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const svg = useTemplateRef<SVGSVGElement>("svg");
const dragging = ref<number | null>(null);

const pixels = computed(() => toDisplayPixels(props.image));
const pixelated = computed(() => pixels.value.width < 200);
const hasOverlay = computed(() => Boolean(props.overlay || props.points));
// Overlay strokes scale with the image so they look the same at any size.
const stroke = computed(() => Math.max(1, Math.max(pixels.value.width, pixels.value.height) / 300));

/** Draws the pixels onto the canvas. */
function draw(): void {
  const context = canvas.value?.getContext("2d");
  if (!context) return;
  const { width, height, data } = pixels.value;
  context.putImageData(new ImageData(data, width, height), 0, 0);
}

/**
 * Formats points for an SVG `points` attribute.
 *
 * @param points - The points.
 * @returns `"x,y x,y …"`.
 */
function toSvgPoints(points: readonly Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

/**
 * Converts a pointer position to image coordinates.
 *
 * @param event - The pointer event.
 * @returns The point in image pixels, clamped to the image.
 */
function toImagePoint(event: PointerEvent): Point {
  const box = svg.value?.getBoundingClientRect();
  if (!box) return { x: 0, y: 0 };
  const x = ((event.clientX - box.left) / box.width) * pixels.value.width;
  const y = ((event.clientY - box.top) / box.height) * pixels.value.height;
  return {
    x: Math.round(Math.min(Math.max(x, 0), pixels.value.width)),
    y: Math.round(Math.min(Math.max(y, 0), pixels.value.height)),
  };
}

/**
 * Starts dragging a handle.
 *
 * @param event - The pointer event.
 * @param index - Which point is dragged.
 */
function startDrag(event: PointerEvent, index: number): void {
  dragging.value = index;
  svg.value?.setPointerCapture(event.pointerId);
  event.preventDefault();
}

/**
 * Moves the dragged handle.
 *
 * @param event - The pointer event.
 */
function drag(event: PointerEvent): void {
  if (dragging.value === null || !props.points) return;
  const next = props.points.map((point) => ({ ...point }));
  next[dragging.value] = toImagePoint(event);
  emit("update:points", next);
}

/** Stops dragging. */
function endDrag(): void {
  dragging.value = null;
}

onMounted(draw);
watch(pixels, draw, { flush: "post" });
</script>

<style lang="scss">
.image-view {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-2xs);
  min-width: 0;

  &__caption {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__frame {
    position: relative;
    overflow: hidden;
    border-radius: var(--auno-radius-s);
    background: var(--auno-surface);
    line-height: 0;

    &--pixelated {
      image-rendering: pixelated;
    }
  }

  &__canvas {
    width: 100%;
    height: auto;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  &__shape {
    fill: color-mix(in srgb, var(--pv-overlay), transparent 85%);
    stroke: var(--pv-overlay);
  }

  &__line {
    stroke: var(--pv-overlay);
  }

  &__point {
    fill: var(--pv-overlay);
  }

  &__handle {
    fill: color-mix(in srgb, var(--pv-overlay), transparent 40%);
    stroke: var(--auno-on-ink);
    cursor: grab;
  }
}
</style>

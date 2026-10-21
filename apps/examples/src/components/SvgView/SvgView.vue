<template>
  <figure :class="bemm()">
    <figcaption :class="bemm('caption')">
      <span>{{ svg.label }}</span>
      <span :class="bemm('size')">{{ size }}</span>
    </figcaption>
    <div :class="bemm('frame')">
      <img :class="bemm('image')" :src="source" :alt="svg.label" data-svg-output />
    </div>
    <AppButton :class="bemm('download')" variant="secondary" data-svg-download @click="download">
      Download SVG
    </AppButton>
  </figure>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBemm } from "bemm";
import AppButton from "../AppButton";
import { saveBlob } from "../../utils/export";
import type { SvgViewProps } from "./SvgView.model";

const props = defineProps<SvgViewProps>();
const bemm = useBemm("svg-view", { includeBaseClass: true });

const source = computed(() => `data:image/svg+xml,${encodeURIComponent(props.svg.markup)}`);
const size = computed(() => {
  const bytes = new TextEncoder().encode(props.svg.markup).length;
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`;
});

/** Saves the drawing as an `.svg` file. */
function download(): void {
  saveBlob(new Blob([props.svg.markup], { type: "image/svg+xml" }), props.svg.fileName);
}
</script>

<style lang="scss">
.svg-view {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-2xs);
  min-width: 0;

  &__caption {
    display: flex;
    justify-content: space-between;
    gap: var(--auno-space-xs);
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__size {
    font-variant-numeric: tabular-nums;
  }

  &__frame {
    overflow: hidden;
    border-radius: var(--auno-radius-s);
    // The drawing carries its own absolute colours, so it's shown on paper in both themes.
    background: white;
    line-height: 0;
  }

  &__image {
    width: 100%;
    height: auto;
  }

  &__download {
    align-self: flex-start;
  }
}
</style>

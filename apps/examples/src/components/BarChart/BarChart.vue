<template>
  <figure :class="bemm()">
    <figcaption :class="bemm('caption')">{{ chart.label }}</figcaption>
    <svg
      :class="bemm('plot')"
      :viewBox="`0 0 ${chart.values.length} 100`"
      preserveAspectRatio="none"
      role="img"
      :aria-label="`${chart.label}: ${chart.values.length} bars`"
    >
      <rect
        v-for="(value, index) in chart.values"
        :key="index"
        :class="bemm('bar')"
        :x="index + gap / 2"
        :y="100 - height(value)"
        :width="1 - gap"
        :height="height(value)"
      />
    </svg>
  </figure>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBemm } from "bemm";
import type { BarChartProps } from "./BarChart.model";

const props = defineProps<BarChartProps>();
const bemm = useBemm("bar-chart", { includeBaseClass: true });

const peak = computed(() => Math.max(...props.chart.values.map(Math.abs), 1e-12));
const gap = computed(() => (props.chart.values.length > 40 ? 0 : 0.2));

/**
 * Converts a value to a bar height in plot units (0–100).
 *
 * @param value - The value.
 * @returns The bar height.
 */
function height(value: number): number {
  return (Math.abs(value) / peak.value) * 100;
}
</script>

<style lang="scss">
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-2xs);

  &__caption {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__plot {
    width: 100%;
    height: 8rem;
    border-bottom: 1px solid var(--auno-separator);
  }

  &__bar {
    fill: var(--pv-accent);
  }
}
</style>

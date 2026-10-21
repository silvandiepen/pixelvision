<template>
  <header :class="bemm()">
    <p :class="bemm('eyebrow')">{{ eyebrow }}</p>
    <h2 :id="headingId" :class="bemm('title')">{{ title }}</h2>
    <p v-if="lede || $slots.default" :class="bemm('lede')">
      <slot>{{ lede }}</slot>
    </p>
  </header>
</template>

<script setup lang="ts">
import { useBemm } from "bemm";
import type { SectionHeadingProps } from "./SectionHeading.model";

withDefaults(defineProps<SectionHeadingProps>(), { lede: undefined });
const bemm = useBemm("section-heading", { includeBaseClass: true });
</script>

<style lang="scss">
// The eyebrow, title and lede every landing page section opens with.
.section-heading {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-s);
  max-width: var(--auno-measure);

  &__eyebrow {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
    font-weight: 600;
  }

  &__title {
    font-size: var(--auno-text-headline);
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  &__lede {
    color: var(--auno-secondary);
    font-size: var(--auno-text-lead);
    line-height: 1.45;
  }
}
</style>

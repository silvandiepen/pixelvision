<template>
  <svg :class="bemm()" viewBox="0 0 52 52" role="img" :aria-label="label" data-success-mark>
    <circle :class="bemm('circle')" cx="26" cy="26" r="24" />
    <path :class="bemm('check')" d="M15 27l7 7 15-16" />
  </svg>
</template>

<script setup lang="ts">
import { useBemm } from "bemm";
import type { SuccessMarkProps } from "./SuccessMark.model";

defineProps<SuccessMarkProps>();
const bemm = useBemm("success-mark", { includeBaseClass: true });
</script>

<style lang="scss">
.success-mark {
  display: block;
  width: 56px;
  height: 56px;

  &__circle {
    fill: var(--auno-affirm);
    transform-origin: center;
    animation: success-mark-pop var(--auno-slow) var(--auno-ease) both;
  }

  &__check {
    fill: none;
    stroke: var(--auno-on-ink);
    stroke-width: 4.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 36;
    stroke-dashoffset: 36;
    animation: success-mark-draw 400ms var(--auno-ease) 200ms forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    &__circle,
    &__check {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
}

@keyframes success-mark-pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes success-mark-draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>

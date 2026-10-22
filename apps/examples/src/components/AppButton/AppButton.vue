<template>
  <button :class="bemm('', ['', variant])" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useBemm } from "bemm";
import type { AppButtonProps } from "./AppButton.model";

withDefaults(defineProps<AppButtonProps>(), {
  variant: "secondary",
  type: "button",
  disabled: false,
});
const bemm = useBemm("app-button", { includeBaseClass: true });
</script>

<style lang="scss">
@use "../../styles/button";

.app-button {
  @include button.base;

  &--primary {
    @include button.primary;
  }

  &--secondary {
    @include button.secondary;
  }

  &--plain {
    padding: 0 var(--auno-space-xs);
    background: none;
    color: var(--auno-ink);

    &:hover {
      background: var(--auno-pressed);
    }
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
}
</style>

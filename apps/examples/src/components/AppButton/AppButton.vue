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
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--auno-space-xs);
  min-height: var(--auno-target-min);
  padding: 0 var(--auno-space-l);
  border: 0;
  border-radius: var(--auno-radius-action);
  font-size: var(--auno-text-small);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--auno-base) var(--auno-ease);

  &--primary {
    background: var(--auno-ink);
    color: var(--auno-on-ink);
  }

  &--secondary {
    background: var(--auno-surface);
    color: var(--auno-ink);

    &:hover {
      background: var(--auno-pressed);
    }
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

<template>
  <label :class="[bemm('', ['', variant]), attrs.class]">
    <slot />
    <!-- Other attributes (such as data-* hooks for tests) go on the input. -->
    <input
      v-bind="inputAttrs"
      :class="bemm('input')"
      type="file"
      :accept="accept"
      @change="emit('change', $event)"
    />
  </label>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { useBemm } from "bemm";
import type { FileButtonEmits, FileButtonProps } from "./FileButton.model";

defineOptions({ inheritAttrs: false });
withDefaults(defineProps<FileButtonProps>(), { accept: "image/*", variant: "secondary" });
const emit = defineEmits<FileButtonEmits>();
const bemm = useBemm("file-button", { includeBaseClass: true });
const attrs = useAttrs();
// `class` styles the button; everything else belongs to the input.
const inputAttrs = computed(() => {
  return Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== "class"));
});
</script>

<style lang="scss">
@use "../../styles/button";

// Looks like AppButton; a label, so clicking it opens the file picker.
.file-button {
  @include button.base;

  position: relative;

  &--primary {
    @include button.primary;
  }

  &--secondary {
    @include button.secondary;
  }

  &--raised {
    @include button.raised;
  }

  &:focus-within {
    outline: 2px solid var(--auno-ink);
    outline-offset: 3px;
  }

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
}
</style>

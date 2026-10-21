<template>
  <div :class="bemm()">
    <p :id="labelId" :class="bemm('label')">{{ label }}</p>
    <div :class="bemm('options')" role="radiogroup" :aria-labelledby="labelId">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="modelValue === option.value"
        :class="bemm('option', ['', modelValue === option.value ? 'selected' : ''])"
        :data-choice="`${name}-${option.value}`"
        @click="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from "vue";
import { useBemm } from "bemm";
import type { SegmentedChoiceEmits, SegmentedChoiceProps } from "./SegmentedChoice.model";

defineProps<SegmentedChoiceProps>();
const emit = defineEmits<SegmentedChoiceEmits>();
const bemm = useBemm("segmented-choice", { includeBaseClass: true });
const labelId = useId();
</script>

<style lang="scss">
.segmented-choice {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-xs);

  &__label {
    color: var(--auno-secondary);
    font-size: var(--auno-text-caption);
    font-weight: 600;
  }

  &__options {
    display: inline-flex;
    flex-wrap: wrap;
    align-self: flex-start;
    gap: var(--auno-space-2xs);
    padding: var(--auno-space-2xs);
    border-radius: var(--auno-radius-action);
    background: var(--auno-surface);
  }

  &__option {
    min-height: 36px;
    padding: 0 var(--auno-space-m);
    border: 0;
    border-radius: var(--auno-radius-action);
    background: none;
    color: var(--auno-ink);
    font-size: var(--auno-text-small);
    cursor: pointer;
    transition: background-color var(--auno-fast) var(--auno-ease);

    &:hover {
      background: var(--auno-pressed);
    }

    &--selected,
    &--selected:hover {
      background: var(--auno-ink);
      color: var(--auno-on-ink);
      font-weight: 600;
    }
  }
}
</style>

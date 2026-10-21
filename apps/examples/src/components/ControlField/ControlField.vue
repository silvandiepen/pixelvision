<template>
  <div :class="bemm('', ['', control.type])" :data-control="control.key">
    <template v-if="control.type === 'range'">
      <label :class="bemm('label')" :for="id">
        {{ control.label }}
        <output :class="bemm('value')" :for="id">{{ modelValue }}</output>
      </label>
      <input
        :id="id"
        :class="bemm('range')"
        type="range"
        :min="control.min"
        :max="control.max"
        :step="control.step"
        :value="modelValue"
        @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      />
    </template>

    <template v-else-if="control.type === 'select'">
      <label :class="bemm('label')" :for="id">{{ control.label }}</label>
      <select
        :id="id"
        :class="bemm('select')"
        :value="selectedIndex"
        @change="selectOption(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="(option, index) in control.options" :key="index" :value="index">
          {{ option.label }}
        </option>
      </select>
    </template>

    <label v-else-if="control.type === 'toggle'" :class="bemm('label', ['', 'inline'])">
      <input
        :class="bemm('checkbox')"
        type="checkbox"
        :checked="modelValue === true"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      {{ control.label }}
    </label>

    <fieldset v-else :class="bemm('grid')">
      <legend :class="bemm('label')">{{ control.label }}</legend>
      <div
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        :class="bemm('row')"
        :style="{ '--control-field-columns': row.length }"
      >
        <input
          v-for="(cell, columnIndex) in row"
          :key="columnIndex"
          :class="bemm('number')"
          type="number"
          step="any"
          :value="cell"
          :aria-label="`${control.label} row ${rowIndex + 1}, column ${columnIndex + 1}`"
          @change="setCell(rowIndex, columnIndex, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import { useBemm } from "bemm";
import type { Point } from "pixelvision";
import type { ControlFieldEmits, ControlFieldProps } from "./ControlField.model";

const props = defineProps<ControlFieldProps>();
const emit = defineEmits<ControlFieldEmits>();
const bemm = useBemm("control-field", { includeBaseClass: true });
const id = useId();

const selectedIndex = computed(() =>
  props.control.type === "select"
    ? props.control.options.findIndex((option) => option.value === props.modelValue)
    : -1,
);

/** Matrix values as rows; points as `[x, y]` rows. */
const rows = computed<number[][]>(() => {
  if (props.control.type === "points") {
    return (props.modelValue as Point[]).map((point) => [point.x, point.y]);
  }
  return props.modelValue as number[][];
});

/**
 * Emits the value of the chosen option.
 *
 * @param index - Index of the option, as the select reports it.
 */
function selectOption(index: string): void {
  if (props.control.type !== "select") return;
  emit("update:modelValue", props.control.options[Number(index)].value);
}

/**
 * Emits the grid with one cell changed. Invalid numbers are ignored.
 *
 * @param rowIndex - Row of the cell.
 * @param columnIndex - Column of the cell.
 * @param text - The typed value.
 */
function setCell(rowIndex: number, columnIndex: number, text: string): void {
  const value = Number(text);
  if (text.trim() === "" || !Number.isFinite(value)) return;
  const next = rows.value.map((row) => [...row]);
  next[rowIndex][columnIndex] = value;
  emit(
    "update:modelValue",
    props.control.type === "points" ? next.map(([x, y]) => ({ x, y })) : next,
  );
}
</script>

<style lang="scss">
.control-field {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-2xs);
  min-width: 0;

  &__label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--auno-space-xs);
    padding: 0;
    font-size: var(--auno-text-small);
    font-weight: 600;

    &--inline {
      justify-content: flex-start;
      cursor: pointer;
    }
  }

  &__value {
    color: var(--auno-secondary);
    font-family: var(--auno-font-mono);
    font-weight: 400;
  }

  &__range {
    width: 100%;
    accent-color: var(--auno-ink);
  }

  &__select {
    padding: var(--auno-space-2xs) var(--auno-space-xs);
    border: 0;
    border-radius: var(--auno-radius-s);
    background: var(--auno-raised);
  }

  &__checkbox {
    accent-color: var(--auno-ink);
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  &__row {
    display: grid;
    grid-template-columns: repeat(var(--control-field-columns), minmax(0, 5rem));
    gap: var(--auno-space-2xs);
  }

  &__number {
    width: 100%;
    padding: var(--auno-space-2xs);
    border: 0;
    border-radius: var(--auno-radius-s);
    background: var(--auno-raised);
    font-family: var(--auno-font-mono);
    font-size: var(--auno-text-small);
  }
}
</style>

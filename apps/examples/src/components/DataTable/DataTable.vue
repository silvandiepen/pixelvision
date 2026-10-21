<template>
  <figure :class="bemm()">
    <figcaption :class="bemm('caption')">{{ table.label }}</figcaption>
    <div :class="bemm('scroll')">
      <table :class="bemm('table')">
        <thead v-if="table.columns">
          <tr>
            <th v-for="column in table.columns" :key="column" :class="bemm('heading')">
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in table.rows" :key="rowIndex">
            <td
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              :class="bemm('cell', ['', typeof cell === 'number' ? 'number' : ''])"
            >
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { useBemm } from "bemm";
import type { DataTableProps } from "./DataTable.model";

defineProps<DataTableProps>();
const bemm = useBemm("data-table", { includeBaseClass: true });
</script>

<style lang="scss">
.data-table {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-2xs);
  min-width: 0;

  &__caption {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__scroll {
    overflow-x: auto;
  }

  &__table {
    border-collapse: collapse;
    font-size: var(--auno-text-small);
  }

  &__heading {
    padding: var(--auno-space-2xs) var(--auno-space-xs);
    border-bottom: 1px solid var(--auno-separator);
    color: var(--auno-secondary);
    font-weight: 600;
    text-align: left;
  }

  &__cell {
    padding: var(--auno-space-2xs) var(--auno-space-xs);
    border-bottom: 1px solid var(--auno-separator);

    &--number {
      font-family: var(--auno-font-mono);
      text-align: right;
    }
  }
}
</style>

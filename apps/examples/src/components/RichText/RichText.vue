<template>
  <span :class="bemm()">
    <template v-for="(part, index) in parts" :key="index">
      <code v-if="part.code" :class="bemm('code')">{{ part.text }}</code>
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBemm } from "bemm";
import { splitInlineCode } from "../../utils/text";
import type { RichTextProps } from "./RichText.model";

const props = defineProps<RichTextProps>();
const bemm = useBemm("rich-text", { includeBaseClass: true });
const parts = computed(() => splitInlineCode(props.text));
</script>

<style lang="scss">
.rich-text {
  &__code {
    padding: 0.1em 0.3em;
    border-radius: var(--auno-radius-s);
    background: var(--auno-surface);
  }
}
</style>

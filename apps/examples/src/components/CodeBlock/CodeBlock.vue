<template>
  <div :class="bemm()">
    <div :class="bemm('bar')">
      <span :class="bemm('file')">{{ fileName }}</span>
      <button type="button" :class="bemm('copy')" @click="copy">
        {{ copied ? "Copied" : "Copy" }}
      </button>
    </div>
    <pre :class="bemm('pre')"><code :class="bemm('code')">{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useBemm } from "bemm";
import type { CodeBlockProps } from "./CodeBlock.model";

const props = withDefaults(defineProps<CodeBlockProps>(), { fileName: "demo.ts" });
const bemm = useBemm("code-block", { includeBaseClass: true });
const copied = ref(false);

/** Copies the code to the clipboard and briefly confirms it. */
async function copy(): Promise<void> {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
</script>

<style lang="scss">
.code-block {
  overflow: hidden;
  border-radius: var(--auno-radius-control);
  background: var(--auno-surface);

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--auno-space-2xs) var(--auno-space-xs) var(--auno-space-2xs) var(--auno-space-m);
    border-bottom: 1px solid var(--auno-separator);
  }

  &__file {
    color: var(--auno-secondary);
    font-family: var(--auno-font-mono);
    font-size: var(--auno-text-small);
  }

  &__copy {
    min-height: 32px;
    padding: 0 var(--auno-space-s);
    border: 0;
    border-radius: var(--auno-radius-action);
    background: var(--auno-raised);
    font-weight: 600;
    font-size: var(--auno-text-small);
    cursor: pointer;
  }

  &__pre {
    overflow-x: auto;
    padding: var(--auno-space-m);
  }

  &__code {
    font-size: var(--auno-text-small);
    line-height: 1.5;
  }
}
</style>

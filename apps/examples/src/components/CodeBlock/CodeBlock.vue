<template>
  <div :class="bemm()">
    <div :class="bemm('bar')">
      <span :class="bemm('file')">{{ fileName }}</span>
      <button type="button" :class="bemm('copy')" @click="copy">
        {{ copied ? "Copied" : "Copy" }}
      </button>
    </div>
    <pre
      :class="bemm('pre')"
    ><code :class="bemm('code')" :data-language="highlightAs"><template v-if="lines"><template v-for="(line, row) in lines" :key="row"><span v-for="(token, column) in line" :key="column" :class="bemm('token', { italic: token.italic, bold: token.bold })" :style="{ color: token.color }">{{ token.content }}</span><template v-if="row < lines.length - 1">{{ "\n" }}</template></template></template><template v-else>{{ code }}</template></code></pre>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { useBemm } from "bemm";
import { languageOf, loadHighlighter } from "../../utils/highlight";
import type { CodeLanguage, CodeToken } from "../../utils/highlight.model";
import type { CodeBlockProps } from "./CodeBlock.model";

const props = withDefaults(defineProps<CodeBlockProps>(), {
  fileName: "demo.ts",
  language: undefined,
});
const bemm = useBemm("code-block", { includeBaseClass: true });
const copied = ref(false);
const highlightAs = computed(() => languageOf(props.language ?? props.fileName));
const lines = shallowRef<CodeToken[][] | null>(null);

/**
 * Shows the code as plain text straight away, then highlighted once the
 * highlighter has loaded.
 *
 * @param source - The code and the language to highlight it in.
 */
async function highlight([code, language]: [string, CodeLanguage | undefined]): Promise<void> {
  lines.value = null;
  if (!language) return;
  const highlighter = await loadHighlighter([language]);
  if (code === props.code && language === highlightAs.value) {
    lines.value = highlighter.tokens(code, language);
  }
}

watch(() => [props.code, highlightAs.value] as [string, CodeLanguage | undefined], highlight, {
  immediate: true,
});

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
  background: var(--pv-code-background);

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
    color: var(--pv-code-foreground);
    font-size: var(--auno-text-small);
    line-height: 1.5;
  }

  &__token {
    &--italic {
      font-style: italic;
    }

    &--bold {
      font-weight: 600;
    }
  }
}
</style>

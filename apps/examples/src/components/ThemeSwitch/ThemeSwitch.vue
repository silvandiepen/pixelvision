<template>
  <div :class="bemm()" role="radiogroup" aria-label="Appearance">
    <button
      v-for="option in OPTIONS"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="choice === option.value"
      :class="bemm('option', ['', choice === option.value ? 'selected' : ''])"
      @click="choose(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useBemm } from "bemm";
import type { ThemeChoice } from "./ThemeSwitch.model";

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "device", label: "Match device" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
const STORAGE_KEY = "pixelvision-theme";

const bemm = useBemm("theme-switch", { includeBaseClass: true });
const choice = ref<ThemeChoice>(read());

/**
 * Reads the stored choice; storage can be unavailable (private windows).
 *
 * @returns The stored choice, or `"device"`.
 */
function read(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "device";
  } catch {
    return "device";
  }
}

/**
 * Applies and remembers a choice.
 *
 * @param value - The choice.
 */
function choose(value: ThemeChoice): void {
  choice.value = value;
  if (value === "device") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", value);
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Not remembered in this browser; the choice still applies now.
  }
}

choose(choice.value);
</script>

<style lang="scss">
.theme-switch {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--auno-radius-s);
  background: var(--auno-surface);

  &__option {
    flex: 1;
    min-height: 32px;
    padding: 0 var(--auno-space-xs);
    border: 0;
    border-radius: 6px;
    background: none;
    font-size: var(--auno-text-caption);
    cursor: pointer;

    &:hover {
      background: var(--auno-pressed);
    }

    &--selected,
    &--selected:hover {
      background: var(--auno-ink);
      color: var(--auno-on-ink);
    }
  }
}
</style>

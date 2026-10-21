<template>
  <header :class="bemm()">
    <RouterLink :class="bemm('brand')" to="/" aria-label="pixelvision, overview">
      <!-- eslint-disable-next-line vue/no-v-html -- the bundled logo, not user input -->
      <span :class="bemm('logo')" aria-hidden="true" v-html="logo"></span>
      <span :class="bemm('name')">pixelvision</span>
    </RouterLink>
    <div :class="bemm('end')">
      <RouterLink :class="bemm('link', ['', 'section'])" to="/guide/getting-started"
        >Docs</RouterLink
      >
      <RouterLink :class="bemm('link', ['', 'section'])" to="/examples">Examples</RouterLink>
      <RouterLink :class="bemm('link', ['', 'section'])" to="/api">API</RouterLink>
      <a :class="bemm('link')" href="https://github.com/silvandiepen/pixelvision">GitHub</a>
      <button
        type="button"
        :class="bemm('menu')"
        :aria-expanded="menuOpen"
        aria-controls="app-sidebar"
        @click="emit('toggle-menu')"
      >
        {{ menuOpen ? "Close" : "Menu" }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useBemm } from "bemm";
import logo from "../../../../../assets/logo-current-color.svg?raw";
import type { AppHeaderEmits, AppHeaderProps } from "./AppHeader.model";

defineProps<AppHeaderProps>();
const emit = defineEmits<AppHeaderEmits>();
const bemm = useBemm("app-header", { includeBaseClass: true });
</script>

<style lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--auno-space-m);
  height: var(--auno-chrome-height);
  padding: 0 var(--auno-space-l);
  background: var(--auno-surface);

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--auno-space-xs);
    min-height: var(--auno-target-min);
    color: var(--auno-ink);
    text-decoration: none;
  }

  &__logo {
    display: flex;
    width: 32px;
  }

  &__name {
    font-size: var(--auno-text-lead);
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  &__end {
    display: flex;
    align-items: center;
    gap: var(--auno-space-xs);
  }

  &__link {
    display: inline-flex;
    align-items: center;
    min-height: var(--auno-target-min);
    padding: 0 var(--auno-space-s);
    border-radius: var(--auno-radius-s);
    color: var(--auno-ink);
    font-size: var(--auno-text-small);
    text-decoration: none;

    &:hover {
      background: var(--auno-pressed);
    }

    &--section {
      @media (max-width: 720px) {
        display: none;
      }
    }
  }

  &__menu {
    display: none;
    min-height: var(--auno-target-min);
    padding: 0 var(--auno-space-m);
    border: 0;
    border-radius: var(--auno-radius-action);
    background: var(--auno-ink);
    color: var(--auno-on-ink);
    font-size: var(--auno-text-small);
    font-weight: 600;
    cursor: pointer;

    @media (max-width: 720px) {
      display: inline-flex;
      align-items: center;
    }
  }
}
</style>

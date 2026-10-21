<template>
  <div :class="bemm()">
    <AppHeader :class="bemm('header')" :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />
    <div :class="bemm('body', ['', wide ? 'wide' : ''])">
      <aside id="app-sidebar" :class="bemm('sidebar', ['', menuOpen ? 'open' : ''])">
        <SideNav :sections="sections" @navigate="menuOpen = false" />
        <ThemeSwitch />
      </aside>
      <div :class="bemm('content')">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useBemm } from "bemm";
import AppHeader from "./components/AppHeader";
import SideNav from "./components/SideNav";
import ThemeSwitch from "./components/ThemeSwitch";
import { buildNavigation } from "./navigation";

const bemm = useBemm("app", { includeBaseClass: true });
const sections = buildNavigation();
const menuOpen = ref(false);
const route = useRoute();
// The landing page uses the full width; the sidebar is still in the menu on phones.
const wide = computed(() => route.meta.wide === true);
</script>

<style lang="scss">
.app {
  min-height: 100vh;

  &__header {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  &__body {
    display: grid;
    grid-template-columns: 17rem minmax(0, 1fr);

    @media (max-width: 720px) {
      grid-template-columns: minmax(0, 1fr);
    }

    &--wide {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__sidebar {
    position: sticky;
    top: var(--auno-chrome-height);
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-l);
    height: calc(100vh - var(--auno-chrome-height));
    overflow-y: auto;
    padding: var(--auno-space-l) var(--auno-space-s) var(--auno-space-xl);
    overscroll-behavior: contain;

    @media (max-width: 720px) {
      display: none;
      position: fixed;
      inset: var(--auno-chrome-height) 0 0;
      z-index: 2;
      height: auto;
      padding: var(--auno-space-l);
      background: var(--auno-page);

      &--open {
        display: flex;
      }
    }
  }

  &__body--wide &__sidebar:not(&__sidebar--open) {
    display: none;
  }

  &__content {
    min-width: 0;
  }
}
</style>

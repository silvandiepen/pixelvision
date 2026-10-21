<template>
  <nav :class="bemm()" aria-label="Documentation and examples">
    <section v-for="section in sections" :key="section.id" :class="bemm('section')">
      <h2 :id="`nav-${section.id}`" :class="bemm('title')">{{ section.title }}</h2>
      <ul :class="bemm('list')" :aria-labelledby="`nav-${section.id}`">
        <li v-for="item in section.items" :key="item.to" :class="bemm('item')">
          <RouterLink
            :to="item.to"
            :class="bemm('link', ['', item.code ? 'code' : ''])"
            :exact-active-class="CURRENT_CLASS"
            @click="emit('navigate')"
          >
            {{ item.title }}
          </RouterLink>
        </li>
      </ul>
    </section>
  </nav>
</template>

<script setup lang="ts">
import { useBemm } from "bemm";
import type { SideNavEmits, SideNavProps } from "./SideNav.model";

defineProps<SideNavProps>();
const emit = defineEmits<SideNavEmits>();
const bemm = useBemm("side-nav", { includeBaseClass: true });
// The router adds this to the link of the current page.
const CURRENT_CLASS = "side-nav__link--current";
</script>

<style lang="scss">
.side-nav {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-l);

  &__section {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
  }

  &__title {
    padding: 0 var(--auno-space-s);
    color: var(--auno-faint);
    font-size: var(--auno-text-caption);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
  }

  &__link {
    flex: 1;
    min-width: 0;
    padding: var(--auno-space-2xs) var(--auno-space-s);
    border-radius: var(--auno-radius-s);
    color: var(--auno-ink);
    font-size: var(--auno-text-small);
    line-height: 1.4;
    text-decoration: none;
    overflow-wrap: anywhere;
    transition: background-color var(--auno-fast) var(--auno-ease);

    &:hover {
      background: var(--auno-pressed);
    }

    &--code {
      font-family: var(--auno-font-mono);
      font-size: var(--auno-text-caption);
    }

    &--current,
    &--current:hover {
      background: var(--auno-ink);
      color: var(--auno-on-ink);
    }
  }
}
</style>

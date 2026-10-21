<template>
  <main :class="bemm()">
    <section :class="bemm('intro')">
      <h1 :class="bemm('title')">All examples</h1>
      <p :class="bemm('lead')">
        Every function has a page: what it does, how it works, a live demo on a sample image, your
        own photo or your camera, the exact code the demo runs, and the test that checks it in
        Chromium, Firefox and WebKit.
      </p>
      <div :class="bemm('start')">
        <RouterLink :class="bemm('start-link', ['', 'primary'])" to="/guide/getting-started">
          Get started
        </RouterLink>
        <RouterLink :class="bemm('start-link')" to="/guide/concepts">Concepts</RouterLink>
        <RouterLink :class="bemm('start-link')" to="/api">API reference</RouterLink>
      </div>
    </section>

    <section v-for="section in sections" :key="section.category" :class="bemm('section')">
      <h2 :class="bemm('heading')">{{ section.title }}</h2>
      <ul :class="bemm('grid')">
        <li v-for="example in section.examples" :key="example.slug" :class="bemm('item')">
          <RouterLink
            :class="bemm('card')"
            :to="`/${example.slug}`"
            :data-example-slug="example.slug"
            :data-functions="example.functions.join(',')"
          >
            <!-- eslint-disable vue/no-v-html -- icons drawn in this repository -->
            <svg
              :class="bemm('icon')"
              viewBox="0 0 24 24"
              aria-hidden="true"
              v-html="iconFor(example.slug)"
            ></svg>
            <!-- eslint-enable vue/no-v-html -->
            <span
              :class="bemm('card-title', ['', section.category === 'pipeline' ? 'pipeline' : ''])"
            >
              {{ example.title }}
            </span>
            <span :class="bemm('card-text')"><RichText :text="example.description" /></span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useBemm } from "bemm";
import RichText from "../../components/RichText";
import { iconFor } from "../../icons/icons";
import { EXAMPLES } from "../../examples/registry";
import { CATEGORY_TITLES } from "../../navigation";
import type { GallerySection } from "./GalleryView.model";

const bemm = useBemm("gallery-view", { includeBaseClass: true });

// Examples (pipelines) first: they're the quickest way to see what it can do.
const order = [CATEGORY_TITLES[CATEGORY_TITLES.length - 1], ...CATEGORY_TITLES.slice(0, -1)];
const sections: GallerySection[] = order
  .map(([category, title]) => ({
    category,
    title,
    examples: EXAMPLES.filter((example) => example.category === category),
  }))
  .filter((section) => section.examples.length > 0);
</script>

<style lang="scss">
.gallery-view {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-2xl);
  max-width: var(--auno-content-width);
  padding: var(--auno-space-2xl) var(--auno-space-xl) var(--auno-space-3xl);

  @media (max-width: 720px) {
    padding: var(--auno-space-xl) var(--auno-space-m) var(--auno-space-2xl);
  }

  &__intro {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-m);
    max-width: var(--auno-measure);
  }

  &__title {
    font-size: var(--auno-text-headline);
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  &__lead {
    color: var(--auno-secondary);
    font-size: var(--auno-text-lead);
    line-height: 1.45;
  }

  &__start {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-s);
  }

  &__start-link {
    display: inline-flex;
    align-items: center;
    min-height: var(--auno-target-min);
    padding: 0 var(--auno-space-l);
    border-radius: var(--auno-radius-action);
    background: var(--auno-surface);
    color: var(--auno-ink);
    font-size: var(--auno-text-small);
    font-weight: 600;
    text-decoration: none;

    &:hover {
      background: var(--auno-pressed);
    }

    &--primary,
    &--primary:hover {
      background: var(--auno-ink);
      color: var(--auno-on-ink);
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-m);
  }

  &__heading {
    font-size: var(--auno-text-title);
    letter-spacing: -0.01em;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: var(--auno-space-s);
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
  }

  &__card {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--auno-space-2xs);
    padding: var(--auno-space-m);
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
    color: var(--auno-ink);
    text-decoration: none;
    transition: background-color var(--auno-base) var(--auno-ease);

    &:hover {
      background: var(--auno-pressed);
    }
  }

  &__icon {
    width: 40px;
    height: 40px;
    margin-bottom: var(--auno-space-xs);
  }

  &__card-title {
    font-family: var(--auno-font-mono);
    font-size: var(--auno-text-small);
    font-weight: 600;

    &--pipeline {
      font-family: var(--auno-font);
      font-size: var(--auno-text-body);
    }
  }

  &__card-text {
    display: -webkit-box;
    overflow: hidden;
    color: var(--auno-secondary);
    font-size: var(--auno-text-caption);
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
}
</style>

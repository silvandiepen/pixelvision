<template>
  <main v-if="guide" :class="bemm()" :data-guide="guide.slug">
    <header :class="bemm('header')">
      <h1 :class="bemm('title')">{{ guide.title }}</h1>
      <p :class="bemm('lead')">{{ guide.description }}</p>
    </header>
    <!-- eslint-disable-next-line vue/no-v-html -- rendered from this repository's own Markdown -->
    <article v-if="html" :class="bemm('prose')" @click="followLink" v-html="html"></article>
    <nav :class="bemm('pager')" aria-label="More guides">
      <RouterLink v-if="previous" :class="bemm('pager-link')" :to="`/guide/${previous.slug}`">
        ← {{ previous.title }}
      </RouterLink>
      <RouterLink v-if="next" :class="bemm('pager-link', ['', 'next'])" :to="`/guide/${next.slug}`">
        {{ next.title }} →
      </RouterLink>
    </nav>
  </main>
  <main v-else :class="bemm()">
    <h1 :class="bemm('title')">Not found</h1>
    <p>There's no guide called "{{ slug }}". <RouterLink to="/">Go to the overview</RouterLink>.</p>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBemm } from "bemm";
import { fillFacts } from "../../content/facts";
import { GUIDES, findGuide } from "../../content/guides";
import { functionPages } from "../../navigation";
import { fenceLanguages, loadHighlighter } from "../../utils/highlight";
import { renderMarkdown } from "../../utils/markdown";
import type { Guide } from "../../content/guides.model";
import type { GuideViewProps } from "./GuideView.model";

const props = defineProps<GuideViewProps>();
const bemm = useBemm("guide-view", { includeBaseClass: true });
const router = useRouter();
const route = useRoute();
const pages = functionPages();

const guide = computed(() => findGuide(props.slug));
const html = ref("");

/**
 * Renders a guide: first as plain Markdown so it shows at once, then again
 * with highlighted code once the highlighter has loaded. A result that
 * arrives after the reader has moved to another guide is dropped.
 *
 * @param current - The guide to render.
 */
async function render(current: Guide | undefined): Promise<void> {
  html.value = "";
  if (!current) return;
  const markdown = fillFacts(current.markdown);
  const plain = await renderMarkdown(markdown, pages);
  if (guide.value !== current) return;
  html.value = plain;
  await scrollToHash();
  const languages = fenceLanguages(markdown);
  if (languages.length === 0) return;
  const highlighted = await renderMarkdown(markdown, pages, await loadHighlighter(languages));
  if (guide.value === current) html.value = highlighted;
}

/** Scrolls to the heading in the address once the guide's text is on the page. */
async function scrollToHash(): Promise<void> {
  if (!route.hash) return;
  await nextTick();
  document.getElementById(decodeURIComponent(route.hash.slice(1)))?.scrollIntoView();
}

watch(guide, (current) => void render(current), { immediate: true });

const index = computed(() => GUIDES.findIndex((candidate) => candidate.slug === props.slug));
const previous = computed(() => (index.value > 0 ? GUIDES[index.value - 1] : undefined));
const next = computed(() => GUIDES[index.value + 1]);

/**
 * Opens links to other pages of this site with the router instead of
 * reloading the page.
 *
 * @param event - A click inside the rendered Markdown.
 */
function followLink(event: MouseEvent): void {
  const link = (event.target as HTMLElement).closest("a");
  const href = link?.getAttribute("href");
  if (!href || !href.startsWith("/") || event.metaKey || event.ctrlKey) return;
  event.preventDefault();
  void router.push(href);
}

watchEffect(() => {
  document.title = guide.value ? `${guide.value.title} · pixelvision` : "pixelvision";
});
</script>

<style lang="scss">
@use "../../styles/prose";

.guide-view {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-xl);
  max-width: calc(var(--auno-measure) + 2 * var(--auno-space-xl));
  padding: var(--auno-space-2xl) var(--auno-space-xl) var(--auno-space-3xl);

  @media (max-width: 720px) {
    padding: var(--auno-space-xl) var(--auno-space-m) var(--auno-space-2xl);
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
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

  &__prose {
    @include prose.prose;
  }

  &__pager {
    display: flex;
    justify-content: space-between;
    gap: var(--auno-space-m);
  }

  &__pager-link {
    text-decoration: none;

    &--next {
      margin-left: auto;
    }
  }
}
</style>

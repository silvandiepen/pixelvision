<template>
  <main v-if="guide" :class="bemm()" :data-guide="guide.slug">
    <header :class="bemm('header')">
      <h1 :class="bemm('title')">{{ guide.title }}</h1>
      <p :class="bemm('lead')">{{ guide.description }}</p>
    </header>
    <!-- eslint-disable-next-line vue/no-v-html -- rendered from this repository's own Markdown -->
    <article :class="bemm('prose')" @click="followLink" v-html="html"></article>
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
import { computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useBemm } from "bemm";
import { fillFacts } from "../../content/facts";
import { GUIDES, findGuide } from "../../content/guides";
import { functionPages } from "../../navigation";
import { renderMarkdown } from "../../utils/markdown";
import type { GuideViewProps } from "./GuideView.model";

const props = defineProps<GuideViewProps>();
const bemm = useBemm("guide-view", { includeBaseClass: true });
const router = useRouter();
const pages = functionPages();

const guide = computed(() => findGuide(props.slug));
const html = computed(() =>
  guide.value ? renderMarkdown(fillFacts(guide.value.markdown), pages) : "",
);
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

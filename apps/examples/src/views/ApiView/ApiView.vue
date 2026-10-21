<template>
  <main :class="bemm()" data-api-reference>
    <header :class="bemm('header')">
      <h1 :class="bemm('title')">API reference</h1>
      <p :class="bemm('lead')">
        Every export of <code :class="bemm('code')">pixelvision</code> {{ reference.version }},
        generated from the package's type declarations when this site is built.
      </p>
    </header>

    <nav :class="bemm('index')" aria-label="On this page">
      <section v-for="group in groups" :key="group.id" :class="bemm('index-group')">
        <h2 :class="bemm('index-title')">{{ group.title }}</h2>
        <ul :class="bemm('index-list')">
          <li v-for="entry in group.entries" :key="entry.name" :class="bemm('index-item')">
            <a :class="bemm('index-link')" :href="`#${entry.name}`">{{ entry.name }}</a>
          </li>
        </ul>
      </section>
    </nav>

    <section v-for="group in groups" :key="group.id" :class="bemm('group')">
      <h2 :class="bemm('group-title')">{{ group.title }}</h2>
      <article
        v-for="entry in group.entries"
        :id="entry.name"
        :key="entry.name"
        :class="bemm('entry')"
        :data-api-entry="entry.name"
      >
        <h3 :class="bemm('name')">
          {{ entry.name }}
          <span :class="bemm('kind')">{{ entry.kind }}</span>
        </h3>
        <!-- eslint-disable-next-line vue/no-v-html -- the package's own TSDoc -->
        <div v-if="entry.summary" :class="bemm('summary')" v-html="summaryOf(entry.name)"></div>
        <pre
          :class="bemm('signature')"
        ><code :class="bemm('signature-code')">{{ entry.signatures.join("\n") }}</code></pre>

        <dl v-if="entry.params.length" :class="bemm('list')">
          <dt :class="bemm('list-title')">Parameters</dt>
          <dd v-for="param in entry.params" :key="param.name" :class="bemm('list-item')">
            <code :class="bemm('code')">{{ param.name }}</code>
            <RichText :text="param.text" />
          </dd>
        </dl>
        <dl v-if="entry.returns" :class="bemm('list')">
          <dt :class="bemm('list-title')">Returns</dt>
          <dd :class="bemm('list-item')"><RichText :text="entry.returns" /></dd>
        </dl>
        <dl v-if="entry.throws.length" :class="bemm('list')">
          <dt :class="bemm('list-title')">Throws</dt>
          <dd
            v-for="thrown in entry.throws"
            :key="thrown.name + thrown.text"
            :class="bemm('list-item')"
          >
            <code :class="bemm('code')">{{ thrown.name }}</code>
            <RichText :text="thrown.text" />
          </dd>
        </dl>
        <dl v-if="entry.members.length" :class="bemm('list')">
          <dt :class="bemm('list-title')">Properties</dt>
          <dd v-for="member in entry.members" :key="member.name" :class="bemm('list-item')">
            <code :class="bemm('code')"
              >{{ member.name }}{{ member.optional ? "?" : "" }}: {{ member.type }}</code
            >
            <RichText v-if="member.doc" :text="member.doc" />
          </dd>
        </dl>
        <template v-for="(example, index) in entry.examples" :key="index">
          <p :class="bemm('list-title')">Example</p>
          <pre
            :class="bemm('signature')"
          ><code :class="bemm('signature-code')">{{ example }}</code></pre>
        </template>
        <RouterLink
          v-if="pages.get(entry.name)"
          :class="bemm('live')"
          :to="`/${pages.get(entry.name)}`"
        >
          Live example →
        </RouterLink>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, shallowRef } from "vue";
import { useBemm } from "bemm";
import reference from "virtual:api-reference";
import RichText from "../../components/RichText";
import { EXAMPLES } from "../../examples/registry";
import { CATEGORY_TITLES, functionPages } from "../../navigation";
import { renderMarkdown } from "../../utils/markdown";
import type { ApiGroup } from "./ApiView.model";

const bemm = useBemm("api-view", { includeBaseClass: true });
const pages = functionPages();

// A function's own page decides its group; pipelines don't (their first function has its own page).
const categoryOf = new Map(
  EXAMPLES.filter((example) => example.category !== "pipeline").map((example) => [
    example.functions[0],
    example.category,
  ]),
);
const functions = reference.entries.filter((entry) => entry.kind === "function");
const groups: ApiGroup[] = [
  ...CATEGORY_TITLES.filter(([category]) => category !== "pipeline").map(([category, title]) => ({
    id: category,
    title,
    entries: functions.filter((entry) => categoryOf.get(entry.name) === category),
  })),
  {
    id: "other",
    title: "Other functions",
    entries: functions.filter((entry) => !categoryOf.has(entry.name)),
  },
  {
    id: "types",
    title: "Types",
    entries: reference.entries.filter((entry) => entry.kind !== "function"),
  },
].filter((group) => group.entries.length > 0);

const summaries = shallowRef(new Map<string, string>());

/**
 * Renders every entry's TSDoc summary from Markdown.
 *
 * @returns Entry name → HTML.
 */
async function renderSummaries(): Promise<Map<string, string>> {
  const rendered = await Promise.all(
    reference.entries
      .filter((entry) => entry.summary)
      .map(async (entry) => [entry.name, await renderMarkdown(entry.summary, pages)] as const),
  );
  return new Map(rendered);
}

/**
 * Finds an entry's rendered summary.
 *
 * @param name - The entry's name.
 * @returns Its HTML, empty until the summaries have rendered.
 */
function summaryOf(name: string): string {
  return summaries.value.get(name) ?? "";
}

onMounted(async () => {
  document.title = "API reference · pixelvision";
  summaries.value = await renderSummaries();
  await nextTick();
  // The page renders after navigation, so scroll to a #name in the URL now its text is in.
  if (window.location.hash)
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
});
</script>

<style lang="scss">
@use "../../styles/prose";

.api-view {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-2xl);
  max-width: 56rem;
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
  }

  &__lead {
    color: var(--auno-secondary);
    font-size: var(--auno-text-lead);
  }

  &__code {
    padding: 0.1em 0.3em;
    border-radius: 4px;
    background: var(--auno-surface);
    font-size: 0.88em;
  }

  &__index {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: var(--auno-space-l);
  }

  &__index-group {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
  }

  &__index-title {
    color: var(--auno-faint);
    font-size: var(--auno-text-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__index-list {
    padding: 0;
    list-style: none;
  }

  &__index-item {
    display: flex;
  }

  &__index-link {
    font-family: var(--auno-font-mono);
    font-size: var(--auno-text-caption);
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xl);
  }

  &__group-title {
    font-size: var(--auno-text-title);
  }

  &__entry {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-s);
    padding-top: var(--auno-space-l);
    border-top: 1px solid var(--auno-separator);
    scroll-margin-top: calc(var(--auno-chrome-height) + var(--auno-space-m));
  }

  &__name {
    display: flex;
    align-items: baseline;
    gap: var(--auno-space-xs);
    font-family: var(--auno-font-mono);
    font-size: var(--auno-text-lead);
    overflow-wrap: anywhere;
  }

  &__kind {
    color: var(--auno-faint);
    font-family: var(--auno-font);
    font-size: var(--auno-text-caption);
    font-weight: 400;
  }

  &__summary {
    @include prose.prose;
  }

  &__signature {
    overflow-x: auto;
    padding: var(--auno-space-m);
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
  }

  &__signature-code {
    font-size: var(--auno-text-caption);
    line-height: 1.55;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
  }

  &__list-title {
    font-size: var(--auno-text-small);
    font-weight: 600;
  }

  &__list-item {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-xs);
    font-size: var(--auno-text-small);
  }

  &__live {
    align-self: flex-start;
    font-size: var(--auno-text-small);
  }
}
</style>

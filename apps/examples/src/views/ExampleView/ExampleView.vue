<template>
  <main v-if="example" :class="bemm()" :data-example="example.slug">
    <nav :class="bemm('crumbs')" aria-label="Breadcrumb">
      <RouterLink :class="bemm('crumb')" to="/">Overview</RouterLink>
    </nav>

    <header :class="bemm('header')">
      <h1 :class="bemm('title', ['', example.category === 'pipeline' ? 'pipeline' : ''])">
        {{ example.title }}
      </h1>
      <p v-if="example.category === 'pipeline'" :class="bemm('functions')">
        {{ example.functions.join(" → ") }}
      </p>
      <RouterLink v-else :class="bemm('api-link')" :to="`/api#${example.functions[0]}`">
        API reference
      </RouterLink>
    </header>

    <section v-if="example.live" :class="bemm('section')" aria-labelledby="demo">
      <h2 id="demo" :class="bemm('heading')">Live demo</h2>
      <DocumentScanner
        v-if="example.live === 'document-scanner'"
        :key="`scanner-${example.slug}`"
        :example="example"
      />
      <HeadTurnCheck
        v-else-if="example.live === 'head-turn'"
        :key="`head-turn-${example.slug}`"
        :example="example"
      />
      <LiveEffects
        v-else-if="example.live === 'live-effects'"
        :key="`live-effects-${example.slug}`"
        :example="example"
      />
      <ExampleDemo v-else :key="example.slug" :example="example" />
    </section>

    <section :class="bemm('section')" aria-labelledby="what">
      <h2 id="what" :class="bemm('heading')">What it does</h2>
      <p :class="bemm('text')"><RichText :text="example.description" /></p>
    </section>

    <section :class="bemm('section')" aria-labelledby="how">
      <h2 id="how" :class="bemm('heading')">How it works</h2>
      <p
        v-for="(paragraph, paragraphIndex) in example.howItWorks"
        :key="paragraphIndex"
        :class="bemm('text')"
      >
        <RichText :text="paragraph" />
      </p>
      <dl v-if="example.controls.length" :class="bemm('parameters')">
        <div v-for="control in example.controls" :key="control.key" :class="bemm('parameter')">
          <dt :class="bemm('parameter-name')">{{ control.label }}</dt>
          <dd :class="bemm('parameter-text')"><RichText :text="control.description" /></dd>
        </div>
      </dl>
    </section>

    <template v-if="!example.live">
      <section :class="bemm('section')" aria-labelledby="demo">
        <h2 id="demo" :class="bemm('heading')">Live demo</h2>
        <DocumentScanner
          v-if="example.live === 'document-scanner'"
          :key="`scanner-${example.slug}`"
          :example="example"
        />
        <HeadTurnCheck
          v-else-if="example.live === 'head-turn'"
          :key="`head-turn-${example.slug}`"
          :example="example"
        />
        <ExampleDemo v-else :key="example.slug" :example="example" />
      </section>
    </template>

    <section :class="bemm('section')" aria-labelledby="code">
      <h2 id="code" :class="bemm('heading')">Code</h2>
      <p :class="bemm('text')">
        This is the exact function the demo above runs, imported from the published
        <code :class="bemm('inline-code')">pixelvision</code> build.
      </p>
      <CodeBlock :code="example.code" :file-name="`${example.slug}/demo.ts`" />
    </section>

    <section :class="bemm('section')" aria-labelledby="test">
      <h2 id="test" :class="bemm('heading')">How to test it</h2>
      <p :class="bemm('text')"><RichText :text="example.howToTest" /></p>
      <p :class="bemm('text')">With the default input and options, the tests check that:</p>
      <ul :class="bemm('checks')">
        <li
          v-for="expectation in example.expectations"
          :key="expectation.key + expectation.label"
          :class="bemm('check')"
          :data-expectation="JSON.stringify(expectation)"
        >
          <span :class="bemm('check-label')">{{ expectation.label }}</span>
          <code :class="bemm('inline-code')">{{ describeExpectation(expectation) }}</code>
        </li>
      </ul>
      <p :class="bemm('text')">
        The same checks run twice: in Node against the demo function (fast), and in Chromium,
        Firefox and WebKit against this page, which also verifies that the canvases hold exactly the
        computed pixels and that nothing logs an error.
      </p>
      <CodeBlock :code="commands" file-name="Terminal" />
    </section>

    <nav :class="bemm('pager')" aria-label="More examples">
      <RouterLink v-if="previous" :class="bemm('pager-link')" :to="`/${previous.slug}`">
        ← {{ previous.title }}
      </RouterLink>
      <RouterLink v-if="next" :class="bemm('pager-link', ['', 'next'])" :to="`/${next.slug}`">
        {{ next.title }} →
      </RouterLink>
    </nav>
  </main>

  <main v-else :class="bemm()">
    <h1 :class="bemm('title')">Not found</h1>
    <p :class="bemm('text')">
      There's no example called "{{ slug }}". <RouterLink to="/">See all examples</RouterLink>.
    </p>
  </main>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useBemm } from "bemm";
import CodeBlock from "../../components/CodeBlock";
import DocumentScanner from "../../components/DocumentScanner";
import ExampleDemo from "../../components/ExampleDemo";
import HeadTurnCheck from "../../components/HeadTurnCheck";
import LiveEffects from "../../components/LiveEffects";
import RichText from "../../components/RichText";
import { describeExpectation } from "../../examples/define";
import { EXAMPLES, findExample } from "../../examples/registry";
import type { ExampleViewProps } from "./ExampleView.model";

const props = defineProps<ExampleViewProps>();
const bemm = useBemm("example-view", { includeBaseClass: true });

const example = computed(() => findExample(props.slug));
const index = computed(() => EXAMPLES.findIndex((candidate) => candidate.slug === props.slug));
const previous = computed(() => (index.value > 0 ? EXAMPLES[index.value - 1] : undefined));
const next = computed(() => EXAMPLES[index.value + 1]);

const commands = computed(() =>
  [
    "# Node: every example's checks (fast)",
    "pnpm --filter @pixelvision/examples test",
    "",
    "# Browsers: build, serve and check every page",
    "pnpm --filter @pixelvision/examples exec playwright install",
    `pnpm --filter @pixelvision/examples test:e2e -g "${props.slug}"`,
  ].join("\n"),
);

watchEffect(() => {
  document.title = example.value
    ? `${example.value.title} · pixelvision examples`
    : "pixelvision examples";
});
</script>

<style lang="scss">
.example-view {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-xl);
  max-width: var(--auno-content-width);
  padding: var(--auno-space-xl) var(--auno-space-xl) var(--auno-space-3xl);

  @media (max-width: 720px) {
    padding: var(--auno-space-l) var(--auno-space-m) var(--auno-space-2xl);
  }

  &__crumbs {
    font-size: var(--auno-text-small);
  }

  &__crumb {
    text-decoration: none;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
  }

  &__title {
    font-family: var(--auno-font-mono);
    font-size: var(--auno-text-headline);
    line-height: 1.2;
    overflow-wrap: anywhere;

    &--pipeline {
      font-family: var(--auno-font);
    }
  }

  &__api-link {
    align-self: flex-start;
    font-size: var(--auno-text-small);
  }

  &__functions {
    color: var(--auno-secondary);
    font-family: var(--auno-font-mono);
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-m);
  }

  &__heading {
    font-size: var(--auno-text-title);
  }

  &__text {
    max-width: var(--auno-measure);
  }

  &__inline-code {
    padding: 0.1em 0.3em;
    border-radius: var(--auno-radius-s);
    background: var(--auno-surface);
  }

  &__parameters {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
    max-width: var(--auno-measure);
    margin: 0;
  }

  &__parameter {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: var(--auno-space-m);

    @media (max-width: 36rem) {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }

  &__parameter-name {
    font-weight: 600;
  }

  &__parameter-text {
    margin: 0;
    color: var(--auno-secondary);
  }

  &__checks {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
    max-width: var(--auno-measure);
    padding-left: var(--auno-space-l);
  }

  &__check {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-xs);
  }

  &__check-label {
    font-weight: 600;
  }

  &__pager {
    display: flex;
    justify-content: space-between;
    gap: var(--auno-space-m);
    padding-top: var(--auno-space-l);
  }

  &__pager-link {
    text-decoration: none;

    &--next {
      margin-left: auto;
    }
  }
}
</style>

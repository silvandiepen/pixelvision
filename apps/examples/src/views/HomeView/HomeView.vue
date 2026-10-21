<template>
  <main :class="bemm()">
    <section :class="bemm('hero')">
      <div :class="bemm('hero-text')">
        <!-- eslint-disable-next-line vue/no-v-html -- the bundled logo, not user input -->
        <span :class="bemm('logo')" aria-hidden="true" v-html="logo"></span>
        <h1 :class="bemm('title')">
          Computer vision for JavaScript, with nothing to install alongside.
        </h1>
        <p :class="bemm('lead')">
          Edges, features, tracking, faces and documents, on plain typed arrays. One
          {{ facts.gzipKb }} KB package that runs in the browser, in workers, in Node and in React
          Native.
        </p>
        <div :class="bemm('actions')">
          <RouterLink :class="bemm('action', ['', 'primary'])" to="/guide/getting-started"
            >Get started</RouterLink
          >
          <RouterLink :class="bemm('action')" to="/examples">See every example</RouterLink>
        </div>
        <pre
          :class="bemm('install')"
        ><code :class="bemm('install-code')">npm install pixelvision</code></pre>
      </div>
      <HeroDemo :class="bemm('demo')" />
    </section>

    <section :class="bemm('facts')" aria-label="In numbers">
      <div v-for="fact in numbers" :key="fact.label" :class="bemm('fact')">
        <span :class="bemm('fact-value')">{{ fact.value }}</span>
        <span :class="bemm('fact-label')">{{ fact.label }}</span>
      </div>
    </section>

    <section :class="bemm('section')" aria-labelledby="what">
      <h2 id="what" :class="bemm('heading')">What it does</h2>
      <div :class="bemm('features')">
        <article v-for="area in FEATURES" :key="area.title" :class="bemm('feature')">
          <h3 :class="bemm('feature-title')">{{ area.title }}</h3>
          <p :class="bemm('feature-text')">{{ area.text }}</p>
          <ul :class="bemm('feature-links')">
            <li v-for="slug in area.links" :key="slug" :class="bemm('feature-item')">
              <RouterLink :class="bemm('feature-link')" :to="`/${slug}`">{{
                titleOf(slug)
              }}</RouterLink>
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section :class="bemm('section')" aria-labelledby="why">
      <h2 id="why" :class="bemm('heading')">Why pixelvision</h2>
      <ul :class="bemm('reasons')">
        <li :class="bemm('reason')">
          <strong :class="bemm('reason-title')">No dependencies.</strong>
          All {{ facts.functionCount }} functions in {{ facts.gzipKb }} KB gzipped. The
          <code :class="bemm('code')">@techstark/opencv-js</code> package unpacks to 14.7 MB.
        </li>
        <li :class="bemm('reason')">
          <strong :class="bemm('reason-title')">Plain data.</strong>
          Images are plain objects over typed arrays. Nothing to construct, nothing to free.
        </li>
        <li :class="bemm('reason')">
          <strong :class="bemm('reason-title')">Typed.</strong>
          Written in TypeScript, every function documented with its options, errors and an example.
        </li>
        <li :class="bemm('reason')">
          <strong :class="bemm('reason-title')">Tested.</strong>
          {{ facts.jsfeatRows }} jsfeat functions checked for identical output, and every function's
          page here runs as a test in Chromium, Firefox and WebKit.
        </li>
        <li :class="bemm('reason')">
          <strong :class="bemm('reason-title')">Runs anywhere.</strong>
          No DOM, no Node APIs: browsers, Web Workers, Node and React Native.
        </li>
      </ul>
      <RouterLink :class="bemm('more')" to="/guide/why">Why pixelvision, in full →</RouterLink>
    </section>

    <section :class="bemm('section')" aria-labelledby="code">
      <h2 id="code" :class="bemm('heading')">What the code looks like</h2>
      <div :class="bemm('snippets')">
        <CodeBlock
          v-for="snippet in SNIPPETS"
          :key="snippet.file"
          :code="snippet.code"
          :file-name="snippet.file"
        />
      </div>
    </section>

    <section :class="bemm('section')" aria-labelledby="uses">
      <h2 id="uses" :class="bemm('heading')">What people build with it</h2>
      <div :class="bemm('uses')">
        <RouterLink
          v-for="use in USE_CASES"
          :key="use.title"
          :class="bemm('use')"
          :to="`/guide/use-cases#${use.anchor}`"
        >
          <span :class="bemm('use-title')">{{ use.title }}</span>
          <span :class="bemm('use-text')">{{ use.text }}</span>
        </RouterLink>
      </div>
    </section>

    <section :class="bemm('section')" aria-labelledby="compare">
      <h2 id="compare" :class="bemm('heading')">Compared with jsfeat and OpenCV.js</h2>
      <!-- eslint-disable-next-line vue/no-v-html -- rendered from this repository's own Markdown -->
      <div :class="bemm('compare')" v-html="comparison"></div>
    </section>

    <section :class="bemm('closing')">
      <h2 :class="bemm('closing-title')">Start with one function.</h2>
      <p :class="bemm('closing-text')">
        Install it, read the five-minute guide, or try any function live.
      </p>
      <div :class="bemm('actions')">
        <RouterLink :class="bemm('action', ['', 'primary'])" to="/guide/getting-started"
          >Get started</RouterLink
        >
        <RouterLink :class="bemm('action')" to="/examples">See every example</RouterLink>
        <RouterLink :class="bemm('action')" to="/api">API reference</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useBemm } from "bemm";
import logo from "../../../../../assets/logo-current-color.svg?raw";
import CodeBlock from "../../components/CodeBlock";
import HeroDemo from "../../components/HeroDemo";
import { SITE_FACTS, fillFacts } from "../../content/facts";
import { findGuide, markdownSection } from "../../content/guides";
import { findExample } from "../../examples/registry";
import { functionPages } from "../../navigation";
import { renderMarkdown } from "../../utils/markdown";
import type { FeatureArea, UseCaseTeaser } from "./HomeView.model";

const bemm = useBemm("home-view", { includeBaseClass: true });
const facts = SITE_FACTS;

const numbers = [
  { value: `${facts.gzipKb} KB`, label: "gzipped, all functions" },
  { value: `${facts.functionCount}`, label: "functions, each with a live page" },
  { value: "0", label: "dependencies" },
  { value: `${facts.jsfeatRows}`, label: "jsfeat functions checked for parity" },
];

const FEATURES: FeatureArea[] = [
  {
    title: "Image processing",
    text: "Gray, blur, resize, gradients, Canny edges, Hough lines, histograms, thresholds, morphology and warps.",
    links: ["edge-detection", "canny", "warp-perspective", "threshold"],
  },
  {
    title: "Features and tracking",
    text: "FAST, YAPE and ORB keypoints, descriptor matching, robust homographies and Lucas–Kanade optical flow.",
    links: ["track-points", "match-descriptors", "detect-fast", "estimate-homography"],
  },
  {
    title: "Faces and liveness",
    text: "Haar cascades for faces, eyes and upper bodies, head pose, and an active head-turn check.",
    links: ["head-turn", "detect-haar", "detect-head-pose"],
  },
  {
    title: "Document scanning",
    text: "Find a page or card in a camera frame, wait for it to be still, and straighten it to its true proportions.",
    links: ["scan-document", "find-document", "extract-document"],
  },
  {
    title: "Maths",
    text: "The linear algebra underneath: LU, Cholesky, SVD, eigenvalues, least squares and transforms.",
    links: ["svd-solve", "perspective-transform", "eigen-symmetric"],
  },
];

const USE_CASES: UseCaseTeaser[] = [
  {
    title: "ID and KYC capture",
    text: "A straight ID photo and a head-turn check, before upload.",
    anchor: "id-and-kyc-capture",
  },
  {
    title: "Document scanning",
    text: "Receipts, forms and pages, straightened on the device.",
    anchor: "document-scanning",
  },
  {
    title: "AR markers and tracking",
    text: "Find a known image in the camera and follow it.",
    anchor: "ar-markers-and-tracking",
  },
  {
    title: "Accessibility",
    text: "Head movement as input; clean pages for text recognition.",
    anchor: "accessibility",
  },
  {
    title: "Education",
    text: "Classic computer vision, one readable step at a time.",
    anchor: "education",
  },
];

const SNIPPETS = [
  {
    file: "edges.ts",
    code: `import { canny, gaussianBlur, grayscale } from "pixelvision";

const gray = grayscale(context.getImageData(0, 0, width, height));
const edges = canny(gaussianBlur(gray, { kernelSize: 5 }), { low: 40, high: 100 });`,
  },
  {
    file: "scan.ts",
    code: `import { extractDocument, findDocument } from "pixelvision";

const found = findDocument(frame);
if (found) {
  const card = extractDocument(frame, found.corners, { aspectRatio: 85.6 / 53.98 });
}`,
  },
  {
    file: "track.ts",
    code: `import { detectFast, grayscale, trackPoints } from "pixelvision";

const corners = detectFast(previousGray, { threshold: 25 });
const moved = trackPoints(previousGray, grayscale(frame), corners);
const kept = moved.filter((point) => point.tracked);`,
  },
];

const why = findGuide("why")?.markdown ?? "";
const comparison = renderMarkdown(
  fillFacts(markdownSection(why, "Compared").replace(/^## .*\n/, "")),
  functionPages(),
);

/**
 * Finds the title of an example page.
 *
 * @param slug - The example's slug.
 * @returns Its title.
 */
function titleOf(slug: string): string {
  return findExample(slug)?.title ?? slug;
}

onMounted(() => {
  document.title = "pixelvision: computer vision for JavaScript";
});
</script>

<style lang="scss">
@use "../../styles/prose";

.home-view {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-3xl);
  max-width: var(--auno-content-width);
  margin: 0 auto;
  padding: var(--auno-space-3xl) var(--auno-space-xl) var(--auno-space-4xl);

  @media (max-width: 720px) {
    gap: var(--auno-space-2xl);
    padding: var(--auno-space-xl) var(--auno-space-m) var(--auno-space-3xl);
  }

  &__hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: var(--auno-space-2xl);
    align-items: center;

    @media (max-width: 900px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__hero-text {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-l);
  }

  &__logo {
    display: flex;
    width: 72px;
  }

  &__title {
    font-size: var(--auno-text-display);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  &__lead {
    color: var(--auno-secondary);
    font-size: var(--auno-text-lead);
    line-height: 1.45;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-s);
  }

  &__action {
    display: inline-flex;
    align-items: center;
    min-height: var(--auno-target);
    padding: 0 var(--auno-space-xl);
    border-radius: var(--auno-radius-action);
    background: var(--auno-surface);
    color: var(--auno-ink);
    font-weight: 600;
    text-decoration: none;
    transition: background-color var(--auno-base) var(--auno-ease);

    &:hover {
      background: var(--auno-pressed);
    }

    &--primary,
    &--primary:hover {
      background: var(--auno-ink);
      color: var(--auno-on-ink);
    }
  }

  &__install {
    align-self: flex-start;
    padding: var(--auno-space-xs) var(--auno-space-m);
    border-radius: var(--auno-radius-s);
    background: var(--auno-surface);
  }

  &__install-code {
    font-size: var(--auno-text-small);
  }

  &__facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--auno-space-l);
  }

  &__fact {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
  }

  &__fact-value {
    font-size: var(--auno-text-headline);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  &__fact-label {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-l);
  }

  &__heading {
    font-size: var(--auno-text-headline);
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: var(--auno-space-s);
  }

  &__feature {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
    padding: var(--auno-space-l);
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
  }

  &__feature-title {
    font-size: var(--auno-text-title);
    letter-spacing: -0.01em;
  }

  &__feature-text {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__feature-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-2xs) var(--auno-space-s);
    padding: var(--auno-space-xs) 0 0;
    list-style: none;
  }

  &__feature-item {
    display: flex;
  }

  &__feature-link {
    font-size: var(--auno-text-small);
  }

  &__reasons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: var(--auno-space-l) var(--auno-space-xl);
    padding: 0;
    list-style: none;
  }

  &__reason {
    color: var(--auno-secondary);
  }

  &__reason-title {
    color: var(--auno-ink);
    font-weight: 600;
  }

  &__code {
    font-size: 0.88em;
  }

  &__more {
    align-self: flex-start;
  }

  &__snippets {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--auno-space-s);
  }

  &__uses {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: var(--auno-space-s);
  }

  &__use {
    display: flex;
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

  &__use-title {
    font-weight: 600;
  }

  &__use-text {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__compare {
    @include prose.prose;
  }

  &__closing {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-m);
    padding: var(--auno-space-2xl);
    border-radius: var(--auno-radius-sheet);
    background: var(--auno-surface);

    @media (max-width: 720px) {
      padding: var(--auno-space-l);
    }
  }

  &__closing-title {
    font-size: var(--auno-text-headline);
    letter-spacing: -0.02em;
  }

  &__closing-text {
    color: var(--auno-secondary);
    font-size: var(--auno-text-lead);
  }
}
</style>

<template>
  <main :class="bemm()">
    <section :class="bemm('band', ['', 'hero'])" aria-labelledby="home-title">
      <div :class="bemm('inner', ['', 'hero'])">
        <div :class="bemm('hero-text')">
          <!-- eslint-disable-next-line vue/no-v-html -- the bundled logo, not user input -->
          <span :class="bemm('logo')" aria-hidden="true" v-html="logo"></span>
          <h1 id="home-title" :class="bemm('title')">
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
      </div>
    </section>

    <section :class="bemm('band', ['', 'alt'])" aria-labelledby="numbers">
      <div :class="bemm('inner')">
        <SectionHeading
          eyebrow="In numbers"
          title="Small enough to ship with anything."
          heading-id="numbers"
          lede="Measured on the published package when this site was built."
        />
        <div :class="bemm('facts')">
          <div v-for="fact in numbers" :key="fact.label" :class="bemm('fact')">
            <span :class="bemm('fact-value')">{{ fact.value }}</span>
            <span :class="bemm('fact-label')">{{ fact.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <div :class="bemm('band')">
      <div :class="bemm('inner')">
        <ScanDocumentSection />
      </div>
    </div>

    <div :class="bemm('band', ['', 'alt'])">
      <div :class="bemm('inner')">
        <LivenessSection />
      </div>
    </div>

    <section :class="bemm('band')" aria-labelledby="what">
      <div :class="bemm('inner')">
        <SectionHeading
          eyebrow="What's in it"
          title="Five areas, one package."
          heading-id="what"
          lede="Every function has its own page, running live, with the code that drives it."
        />
        <div :class="bemm('features')">
          <article v-for="area in FEATURES" :key="area.title" :class="bemm('feature')">
            <!-- eslint-disable vue/no-v-html -- icons drawn in this repository -->
            <svg
              :class="bemm('feature-icon')"
              viewBox="0 0 24 24"
              aria-hidden="true"
              v-html="TOPIC_ICONS[area.icon]"
            ></svg>
            <!-- eslint-enable vue/no-v-html -->
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
      </div>
    </section>

    <section :class="bemm('band', ['', 'alt'])" aria-labelledby="why">
      <div :class="bemm('inner')">
        <SectionHeading
          eyebrow="Why pixelvision"
          title="Plain data, no dependencies, tested."
          heading-id="why"
        />
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
            Written in TypeScript, every function documented with its options, errors and an
            example.
          </li>
          <li :class="bemm('reason')">
            <strong :class="bemm('reason-title')">Tested.</strong>
            Checked against reference implementations with 100% test coverage, and every function's
            page here runs as a test in Chromium, Firefox and WebKit.
          </li>
          <li :class="bemm('reason')">
            <strong :class="bemm('reason-title')">Runs anywhere.</strong>
            No DOM, no Node APIs: browsers, Web Workers, Node and React Native.
          </li>
        </ul>
        <RouterLink :class="bemm('more')" to="/guide/why">Why pixelvision, in full →</RouterLink>
      </div>
    </section>

    <section :class="bemm('band')" aria-labelledby="code">
      <div :class="bemm('inner')">
        <SectionHeading
          eyebrow="The code"
          title="What the code looks like"
          heading-id="code"
          lede="Plain functions over typed arrays. Import the ones you use; the rest stays out of your bundle."
        />
        <div :class="bemm('snippets')">
          <CodeBlock
            v-for="snippet in SNIPPETS"
            :key="snippet.file"
            :code="snippet.code"
            :file-name="snippet.file"
          />
        </div>
      </div>
    </section>

    <section :class="bemm('band', ['', 'alt'])" aria-labelledby="uses">
      <div :class="bemm('inner')">
        <SectionHeading eyebrow="Use cases" title="What people build with it" heading-id="uses" />
        <div :class="bemm('uses')">
          <RouterLink
            v-for="use in USE_CASES"
            :key="use.title"
            :class="bemm('use')"
            :to="`/guide/use-cases#${use.anchor}`"
          >
            <!-- eslint-disable vue/no-v-html -- icons drawn in this repository -->
            <svg
              :class="bemm('use-icon')"
              viewBox="0 0 24 24"
              aria-hidden="true"
              v-html="TOPIC_ICONS[use.icon]"
            ></svg>
            <!-- eslint-enable vue/no-v-html -->
            <span :class="bemm('use-title')">{{ use.title }}</span>
            <span :class="bemm('use-text')">{{ use.text }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <section :class="bemm('band')" aria-labelledby="compare">
      <div :class="bemm('inner')">
        <SectionHeading
          eyebrow="How it compares"
          title="Compared with OpenCV.js"
          heading-id="compare"
          lede="OpenCV.js does far more. This is what you trade for the smaller, plainer package."
        />
        <!-- eslint-disable-next-line vue/no-v-html -- rendered from this repository's own Markdown -->
        <div :class="bemm('compare')" v-html="comparison"></div>
      </div>
    </section>

    <section :class="bemm('band', ['', 'alt'])" aria-labelledby="start">
      <div :class="bemm('inner')">
        <SectionHeading
          eyebrow="Get started"
          title="Start with one function."
          heading-id="start"
          lede="Install it, read the five-minute guide, or try any function live."
        />
        <div :class="bemm('actions')">
          <RouterLink :class="bemm('action', ['', 'primary'])" to="/guide/getting-started"
            >Get started</RouterLink
          >
          <RouterLink :class="bemm('action')" to="/examples">See every example</RouterLink>
          <RouterLink :class="bemm('action')" to="/api">API reference</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useBemm } from "bemm";
import logo from "../../../../../assets/logo-current-color.svg?raw";
import CodeBlock from "../../components/CodeBlock";
import HeroDemo from "../../components/HeroDemo";
import LivenessSection from "../../components/LivenessSection";
import ScanDocumentSection from "../../components/ScanDocumentSection";
import SectionHeading from "../../components/SectionHeading";
import { SITE_FACTS, fillFacts } from "../../content/facts";
import { findGuide, markdownSection } from "../../content/guides";
import { findExample } from "../../examples/registry";
import { TOPIC_ICONS } from "../../icons/icons";
import { functionPages } from "../../navigation";
import type { FeatureArea, UseCaseTeaser } from "./HomeView.model";

const bemm = useBemm("home-view", { includeBaseClass: true });
const facts = SITE_FACTS;

const numbers = [
  { value: `${facts.gzipKb} KB`, label: "gzipped, all functions" },
  { value: `${facts.functionCount}`, label: "functions, each with a live page" },
  { value: "0", label: "dependencies" },
  { value: "100%", label: "test coverage" },
];

const FEATURES: FeatureArea[] = [
  {
    title: "Image processing",
    icon: "image-processing",
    text: "Gray, blur, resize, gradients, Canny edges, Hough lines, histograms, thresholds, morphology and warps.",
    links: ["edge-detection", "canny", "warp-perspective", "threshold"],
  },
  {
    title: "Features and tracking",
    icon: "features-and-tracking",
    text: "FAST, YAPE and ORB keypoints, descriptor matching, robust homographies and Lucas–Kanade optical flow.",
    links: ["track-points", "match-descriptors", "detect-fast", "estimate-homography"],
  },
  {
    title: "Faces and liveness",
    icon: "faces-and-liveness",
    text: "Haar cascades for faces, eyes and upper bodies, head pose, and an active head-turn check.",
    links: ["head-turn", "detect-haar", "detect-head-pose"],
  },
  {
    title: "Document scanning",
    icon: "document-scanning",
    text: "Find a page or card in a camera frame, wait for it to be still, and straighten it to its true proportions.",
    links: ["scan-document", "find-document", "extract-document"],
  },
  {
    title: "Maths",
    icon: "maths",
    text: "The linear algebra underneath: LU, Cholesky, SVD, eigenvalues, least squares and transforms.",
    links: ["svd-solve", "perspective-transform", "eigen-symmetric"],
  },
];

const USE_CASES: UseCaseTeaser[] = [
  {
    title: "ID and KYC capture",
    icon: "id-and-kyc-capture",
    text: "A straight ID photo and a head-turn check, before upload.",
    anchor: "id-and-kyc-capture",
  },
  {
    title: "Document scanning",
    icon: "receipts",
    text: "Receipts, forms and pages, straightened on the device.",
    anchor: "document-scanning",
  },
  {
    title: "AR markers and tracking",
    icon: "ar-markers-and-tracking",
    text: "Find a known image in the camera and follow it.",
    anchor: "ar-markers-and-tracking",
  },
  {
    title: "Accessibility",
    icon: "accessibility",
    text: "Head movement as input; clean pages for text recognition.",
    anchor: "accessibility",
  },
  {
    title: "Education",
    icon: "education",
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

const comparison = ref("");

/**
 * Renders the comparison table from the "Why pixelvision" guide. The Markdown
 * renderer loads on its own, after the page has painted: the table is far
 * below the fold.
 *
 * @returns The table as HTML.
 */
async function renderComparison(): Promise<string> {
  const why = findGuide("why")?.markdown ?? "";
  const { renderMarkdown } = await import("../../utils/markdown");
  return renderMarkdown(
    fillFacts(markdownSection(why, "Compared").replace(/^## .*\n/, "")),
    functionPages(),
  );
}

/**
 * Finds the title of an example page.
 *
 * @param slug - The example's slug.
 * @returns Its title.
 */
function titleOf(slug: string): string {
  return findExample(slug)?.title ?? slug;
}

onMounted(async () => {
  document.title = "pixelvision: computer vision for JavaScript";
  comparison.value = await renderComparison();
});
</script>

<style lang="scss">
@use "../../styles/prose";

// The landing page is a stack of full-width bands that alternate between the
// page tone and the surface tone. Inside an alternate band, cards and
// controls swap back to the page tone ("a card on a field"), so they keep
// their edge without a border or a shadow.
.home-view {
  display: flex;
  flex-direction: column;

  &__band {
    padding-block: var(--auno-space-3xl);
    background: var(--auno-page);

    @media (max-width: 720px) {
      padding-block: var(--auno-space-2xl);
    }

    &--alt {
      background: var(--auno-surface);
    }

    &--hero {
      padding-block: var(--auno-space-4xl) var(--auno-space-3xl);

      @media (max-width: 720px) {
        padding-block: var(--auno-space-xl) var(--auno-space-2xl);
      }
    }
  }

  &__band--alt &__inner {
    --auno-surface: var(--auno-raised);
    --pv-code-background: var(--auno-raised);
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xl);
    width: 100%;
    max-width: var(--auno-content-width);
    margin-inline: auto;
    padding-inline: var(--auno-space-xl);

    @media (max-width: 720px) {
      padding-inline: var(--auno-space-m);
    }

    &--hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
      gap: var(--auno-space-2xl);
      align-items: center;

      @media (max-width: 900px) {
        grid-template-columns: minmax(0, 1fr);
      }
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
    max-width: 100%;
    overflow-x: auto;
    padding: var(--auno-space-xs) var(--auno-space-m);
    border-radius: var(--auno-radius-s);
    background: var(--auno-surface);
  }

  &__install-code {
    font-size: var(--auno-text-small);
  }

  &__facts {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--auno-space-l);

    @media (max-width: 900px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__fact {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
  }

  &__fact-value {
    font-size: var(--auno-text-display);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  &__fact-label {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
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

  &__feature-icon {
    width: 40px;
    height: 40px;
    margin-bottom: var(--auno-space-xs);
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

  &__use-icon {
    width: 32px;
    height: 32px;
    margin-bottom: var(--auno-space-2xs);
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
}
</style>

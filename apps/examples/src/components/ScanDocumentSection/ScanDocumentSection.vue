<template>
  <section
    :class="bemm()"
    aria-labelledby="scan-heading"
    data-home-scan
    :data-scan-state="capture ? 'success' : 'scanning'"
  >
    <div :class="bemm('intro')">
      <p :class="bemm('eyebrow')">Document scanning</p>
      <h2 id="scan-heading" :class="bemm('title')">Scan a document.</h2>
      <p :class="bemm('lead')">
        Point your camera at a page or card. It finds the edges, waits for you to hold still, and
        straightens it into a file you can keep.
      </p>
      <SegmentedChoice v-model="aspect" label="Proportions" name="aspect" :options="ASPECTS" />
    </div>

    <div :class="bemm('demo')">
      <Transition name="scan-section__swap" mode="out-in">
        <DocumentCapture v-if="!capture" key="capture" @capture="onCapture" />

        <div v-else key="result" :class="bemm('result')" data-scan-result>
          <div :class="bemm('banner')">
            <SuccessMark label="Scanned" />
            <div :class="bemm('banner-text')">
              <p :class="bemm('banner-title')">Scanned and straightened.</p>
              <p :class="bemm('banner-detail')" data-scan-size>
                {{ straightened.width }} × {{ straightened.height }} pixels
              </p>
            </div>
          </div>

          <div :class="bemm('pages')">
            <figure :class="bemm('page')">
              <div :class="bemm('paper')">
                <PixelCanvas
                  :image="straightened"
                  label="The straightened document"
                  data-scan-output
                />
              </div>
            </figure>
            <figure :class="bemm('source')">
              <div :class="bemm('source-frame')">
                <PixelCanvas :image="capture.photo" label="The photo it was found in" />
                <svg
                  :class="bemm('source-overlay')"
                  :viewBox="`0 0 ${capture.photo.width} ${capture.photo.height}`"
                  aria-hidden="true"
                >
                  <polygon
                    :class="bemm('source-quad')"
                    :points="capture.corners.map((p) => `${p.x},${p.y}`).join(' ')"
                  />
                </svg>
              </div>
              <figcaption :class="bemm('caption')">Found in your photo</figcaption>
            </figure>
          </div>

          <div :class="bemm('actions')">
            <AppButton
              variant="primary"
              :class="bemm('download')"
              data-download="png"
              @click="download('png')"
            >
              Download PNG
            </AppButton>
            <AppButton variant="secondary" data-download="pdf" @click="download('pdf')">
              PDF
            </AppButton>
            <AppButton variant="secondary" data-download="jpeg" @click="download('jpeg')">
              JPEG
            </AppButton>
            <AppButton variant="plain" data-scan-again @click="capture = null">
              Scan another
            </AppButton>
          </div>
          <p v-if="message" :class="bemm('message')" role="alert">{{ message }}</p>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watchEffect } from "vue";
import { useBemm } from "bemm";
import { extractDocument } from "pixelvision";
import type { Point } from "pixelvision";
import AppButton from "../AppButton";
import DocumentCapture from "../DocumentCapture";
import PixelCanvas from "../PixelCanvas";
import SegmentedChoice from "../SegmentedChoice";
import SuccessMark from "../SuccessMark";
import type { DocumentCapture as Capture } from "../../composables/useDocumentScan/useDocumentScan.model";
import { ASPECT_RATIOS } from "../../examples/scan-document/demo";
import type { DocumentAspect } from "../../examples/scan-document/demo.model";
import { documentPageSize } from "../../examples/scan-document/paper";
import { publishResult } from "../../results";
import { encodeImage, saveBlob } from "../../utils/export";
import { imagePdf } from "../../utils/pdf";
import type { DocumentFormat } from "./ScanDocumentSection.model";

const bemm = useBemm("scan-section", { includeBaseClass: true });

const ASPECTS: { value: DocumentAspect; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "id-card", label: "ID card" },
  { value: "a4", label: "A4" },
];

const aspect = ref<DocumentAspect>("auto");
const capture = shallowRef<Capture | null>(null);
const message = ref<string | null>(null);

const straightened = computed(() => {
  const found = capture.value as Capture;
  return extractDocument(found.photo, found.corners as [Point, Point, Point, Point], {
    aspectRatio: ASPECT_RATIOS[aspect.value],
  });
});

/**
 * Shows a capture as the result.
 *
 * @param next - The photo and the document's corners.
 */
function onCapture(next: Capture): void {
  message.value = null;
  capture.value = next;
}

/**
 * Saves the straightened document.
 *
 * @param format - PNG, JPEG, or a one-page PDF at the document's real size.
 */
async function download(format: DocumentFormat): Promise<void> {
  const image = straightened.value;
  try {
    if (format === "png") {
      saveBlob(await encodeImage(image, "image/png"), "document.png");
    } else if (format === "jpeg") {
      saveBlob(await encodeImage(image, "image/jpeg"), "document.jpg");
    } else {
      const jpeg = new Uint8Array(await (await encodeImage(image, "image/jpeg")).arrayBuffer());
      const page = documentPageSize(aspect.value, image.width, image.height);
      const pdf = imagePdf(jpeg, {
        width: image.width,
        height: image.height,
        pageWidth: page.width,
        pageHeight: page.height,
      });
      saveBlob(new Blob([pdf], { type: "application/pdf" }), "document.pdf");
    }
  } catch (caught) {
    message.value = `The file couldn't be made: ${caught instanceof Error ? caught.message : String(caught)}`;
  }
}

// For the end-to-end tests.
watchEffect(() => {
  publishResult("home-scan", {
    status: "ready",
    error: null,
    defaults: false,
    values: capture.value
      ? {
          captured: true,
          width: straightened.value.width,
          height: straightened.value.height,
          aspect: aspect.value,
        }
      : { captured: false },
  });
});
</script>

<style lang="scss">
.scan-section {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: var(--auno-space-2xl);
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--auno-space-l);
  }

  &__intro {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-l);
  }

  &__eyebrow {
    color: var(--pv-accent);
    font-size: var(--auno-text-small);
    font-weight: 600;
  }

  &__title {
    font-size: clamp(36px, 5vw, 56px);
    letter-spacing: -0.03em;
    line-height: 1.05;
  }

  &__lead {
    color: var(--auno-secondary);
    font-size: var(--auno-text-lead);
    line-height: 1.45;
  }

  &__demo {
    min-width: 0;
  }

  &__result {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-l);
  }

  &__banner {
    display: flex;
    align-items: center;
    gap: var(--auno-space-m);
  }

  &__banner-title {
    font-size: var(--auno-text-title);
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  &__banner-detail {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
    font-variant-numeric: tabular-nums;
  }

  &__pages {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: var(--auno-space-m);
    align-items: end;
  }

  &__page {
    display: grid;
    place-items: center;
  }

  &__paper {
    overflow: hidden;
    width: 100%;
    border-radius: var(--auno-radius-s);
    box-shadow: var(--auno-shadow-sheet);
    animation: scan-section-settle 500ms var(--auno-ease) both;
  }

  &__source {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
  }

  &__source-frame {
    position: relative;
    overflow: hidden;
    border-radius: var(--auno-radius-s);
    line-height: 0;
  }

  &__source-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__source-quad {
    fill: color-mix(in srgb, var(--pv-overlay), transparent 80%);
    stroke: var(--pv-overlay);
    stroke-width: 4;
    stroke-linejoin: round;
  }

  &__caption {
    color: var(--auno-secondary);
    font-size: var(--auno-text-caption);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--auno-space-s);
  }

  &__download {
    min-height: var(--auno-target);
    padding: 0 var(--auno-space-xl);
    font-size: var(--auno-text-body);

    @media (max-width: 560px) {
      flex-basis: 100%;
    }
  }

  &__message {
    color: var(--auno-refuse);
  }

  &__swap-enter-active,
  &__swap-leave-active {
    transition: opacity var(--auno-base) var(--auno-ease);
  }

  &__swap-enter-from,
  &__swap-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    &__paper {
      animation: none;
    }
  }
}

@keyframes scan-section-settle {
  from {
    transform: perspective(800px) rotateX(12deg) rotateZ(-3deg) scale(0.92);
    opacity: 0;
  }

  to {
    transform: none;
    opacity: 1;
  }
}
</style>

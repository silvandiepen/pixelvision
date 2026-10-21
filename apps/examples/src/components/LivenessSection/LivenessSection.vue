<template>
  <section
    :class="bemm()"
    aria-labelledby="liveness-heading"
    data-home-liveness
    :data-liveness-state="outcome"
  >
    <div :class="bemm('demo')">
      <Transition name="liveness-section__swap" mode="out-in">
        <FaceCapture
          v-if="outcome === 'checking'"
          :key="attempt"
          :backend="backend"
          :autostart="attempt > 0"
          @complete="onComplete"
          @fail="outcome = 'failed'"
        />

        <div
          v-else-if="outcome === 'success'"
          key="success"
          :class="bemm('result')"
          data-liveness-success
        >
          <div :class="bemm('portrait')">
            <PixelCanvas
              v-if="portrait"
              :class="bemm('photo')"
              :image="portrait"
              :mirrored="mirrored"
              label="The frontal photo taken during the check"
              fit="cover"
              data-liveness-photo
            />
            <SuccessMark :class="bemm('mark')" label="Passed" />
          </div>
          <p :class="bemm('result-title')">You're live.</p>
          <p :class="bemm('result-text')">
            {{
              scripted
                ? "The scripted run looked, turned both ways and looked back."
                : "You looked, turned both ways and looked back. This is the photo it kept."
            }}
          </p>
          <AppButton variant="primary" data-liveness-again @click="retry(false)">
            Run it again
          </AppButton>
        </div>

        <div v-else key="failed" :class="bemm('result')" data-liveness-failed>
          <div :class="bemm('timeout')" aria-hidden="true">
            <svg viewBox="0 0 52 52" :class="bemm('timeout-icon')">
              <circle cx="26" cy="26" r="22" />
              <path d="M26 14v13l8 5" />
            </svg>
          </div>
          <p :class="bemm('result-title')">Time's up.</p>
          <p :class="bemm('result-text')">
            All four steps need to happen within 30 seconds. Face the light, and turn further.
          </p>
          <AppButton variant="primary" data-liveness-retry @click="retry(true)"
            >Try again</AppButton
          >
        </div>
      </Transition>
    </div>

    <div :class="bemm('intro')">
      <SectionHeading
        eyebrow="Liveness"
        title="Check there's a person there."
        heading-id="liveness-heading"
        lede="Look at the camera, turn your head one way, then the other. A printed photo or a still screen can't do that."
      />
      <SegmentedChoice
        :model-value="backend"
        label="Face detector"
        name="backend"
        :options="BACKENDS"
        @update:model-value="backend = $event as FaceBackend"
      />
      <p :class="bemm('note')">
        {{
          backend === "haar"
            ? "Built in, nothing to download. Turn far: it needs a nearly full profile."
            : "YuNet, the optional @pixelvision/face-neural package. A 230 KB model, loaded now. Turns of about 20° count."
        }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watchEffect } from "vue";
import { useBemm } from "bemm";
import AppButton from "../AppButton";
import FaceCapture from "../FaceCapture";
import type { FaceCaptureResult } from "../FaceCapture/FaceCapture.model";
import PixelCanvas from "../PixelCanvas";
import SectionHeading from "../SectionHeading";
import SegmentedChoice from "../SegmentedChoice";
import SuccessMark from "../SuccessMark";
import type { FaceBackend } from "../../composables/useHeadTurn/useHeadTurn.model";
import { publishResult } from "../../results";
import { cropImage, portraitBox } from "../../utils/export";
import type { LivenessOutcome } from "./LivenessSection.model";

const bemm = useBemm("liveness-section", { includeBaseClass: true });

const BACKENDS: { value: FaceBackend; label: string }[] = [
  { value: "haar", label: "Built-in" },
  { value: "neural", label: "Neural (YuNet)" },
];

const backend = ref<FaceBackend>("haar");
const outcome = ref<LivenessOutcome>("checking");
const attempt = ref(0);
const result = shallowRef<FaceCaptureResult | null>(null);

const portrait = computed(() => {
  const photo = result.value?.photo;
  return photo ? cropImage(photo.frame, portraitBox(photo.face)) : null;
});
const mirrored = computed(() => result.value?.photo?.mirrored ?? false);
const scripted = computed(() => result.value?.source === "scripted");

/**
 * Shows the passed state.
 *
 * @param passed - The photo and where the poses came from.
 */
function onComplete(passed: FaceCaptureResult): void {
  result.value = passed;
  outcome.value = "success";
}

/**
 * Goes back to the check.
 *
 * @param startNow - Start the camera straight away.
 */
function retry(startNow: boolean): void {
  result.value = null;
  attempt.value = startNow ? attempt.value + 1 : 0;
  outcome.value = "checking";
}

// For the end-to-end tests.
watchEffect(() => {
  publishResult("home-liveness", {
    status: "ready",
    error: null,
    defaults: false,
    values: {
      outcome: outcome.value,
      source: result.value?.source ?? "",
      photo: portrait.value ? `${portrait.value.width}x${portrait.value.height}` : "",
    },
  });
});
</script>

<style lang="scss">
.liveness-section {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: var(--auno-space-2xl);
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--auno-space-l);
  }

  &__demo {
    min-width: 0;

    @media (max-width: 900px) {
      order: 2;
    }
  }

  &__intro {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-l);
  }

  &__note {
    max-width: 30rem;
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--auno-space-m);
    aspect-ratio: 4 / 3;
    padding: var(--auno-space-l);
    border-radius: var(--auno-radius-sheet);
    background: var(--auno-surface);
    text-align: center;

    @media (max-width: 560px) {
      aspect-ratio: auto;
      padding: var(--auno-space-xl) var(--auno-space-m);
    }
  }

  &__portrait {
    position: relative;
    width: 168px;
    height: 168px;
    margin-bottom: var(--auno-space-xs);
    animation: liveness-section-rise 450ms var(--auno-ease) both;
  }

  &__photo {
    border: 4px solid var(--auno-affirm);
    border-radius: 50%;
  }

  &__mark {
    position: absolute;
    right: -4px;
    bottom: -4px;
  }

  &__result-title {
    font-size: var(--auno-text-headline);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  &__result-text {
    max-width: 26rem;
    color: var(--auno-secondary);
  }

  &__timeout {
    display: grid;
    place-items: center;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: var(--auno-pressed);
  }

  &__timeout-icon {
    width: 56px;
    fill: none;
    stroke: var(--auno-ink);
    stroke-width: 3.5;
    stroke-linecap: round;
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
    &__portrait {
      animation: none;
    }
  }
}

@keyframes liveness-section-rise {
  from {
    transform: scale(0.85);
    opacity: 0;
  }

  to {
    transform: none;
    opacity: 1;
  }
}
</style>

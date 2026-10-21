<template>
  <div
    :class="bemm()"
    :data-capture-state="source === 'idle' ? 'idle' : 'running'"
    :data-challenge-step="state.step"
  >
    <div :class="bemm('stage', ['', source !== 'idle' ? 'live' : ''])">
      <div v-show="source === 'camera'" :class="bemm('mirror')">
        <video ref="video" :class="bemm('video')" playsinline muted></video>
      </div>
      <div v-if="source === 'scripted'" :class="bemm('still')">
        <PixelCanvas
          :image="SCRIPTED_PHOTO.frame"
          label="A drawn face, for the scripted run"
          fit="cover"
        />
      </div>

      <svg
        :class="bemm('guide')"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask :id="maskId">
            <rect width="400" height="300" fill="#fff" />
            <ellipse cx="200" cy="145" rx="78" ry="104" fill="#000" />
          </mask>
          <clipPath :id="clipId">
            <ellipse cx="200" cy="145" rx="78" ry="104" />
          </clipPath>
        </defs>
        <rect
          v-if="source !== 'idle'"
          :class="bemm('veil')"
          width="400"
          height="300"
          :mask="`url(#${maskId})`"
        />
        <g v-if="source === 'idle'" :class="bemm('silhouette')" :clip-path="`url(#${clipId})`">
          <ellipse cx="200" cy="128" rx="42" ry="52" />
          <path d="M122 249c8-44 40-66 78-66s70 22 78 66z" />
        </g>
        <ellipse
          :class="bemm('oval', ['', source === 'idle' ? 'idle' : ''])"
          cx="200"
          cy="145"
          rx="78"
          ry="104"
        />
        <path
          v-if="source !== 'idle'"
          :class="bemm('ring')"
          d="M200 41A78 104 0 1 1 200 249A78 104 0 1 1 200 41"
          pathLength="100"
          :stroke-dashoffset="100 - state.holdProgress * 100"
          data-hold-ring
          :data-hold-progress="state.holdProgress.toFixed(2)"
        />
      </svg>

      <div v-if="source !== 'idle'" :class="bemm('hud')">
        <div :class="bemm('prompt')">
          <p :class="bemm('instruction')" aria-live="polite" data-challenge-instruction>
            {{ state.instruction }}
          </p>
          <Transition name="face-capture__fade">
            <p v-if="hint" :class="bemm('hint-live')" data-challenge-hint>{{ hint }}</p>
          </Transition>
        </div>
        <ol :class="bemm('progress')" aria-label="Progress">
          <li
            v-for="(label, index) in STEP_LABELS"
            :key="label"
            :class="bemm('segment', ['', segmentState(index)])"
            :aria-current="segmentState(index) === 'current' ? 'step' : undefined"
            :style="{ '--fill': segmentFill(index) }"
          >
            <span :class="bemm('segment-label')">{{ label }}</span>
          </li>
        </ol>
      </div>
    </div>

    <div v-if="source === 'idle'" :class="bemm('idle')">
      <p :class="bemm('hint')">
        {{
          loading
            ? "Loading the face detector…"
            : "Find some light, then fit your face in the oval."
        }}
      </p>
      <div :class="bemm('actions')">
        <AppButton variant="primary" :disabled="!ready" data-challenge-start @click="startCamera">
          Start the check
        </AppButton>
        <AppButton variant="secondary" data-challenge-scripted @click="playScripted">
          Watch a demo run
        </AppButton>
      </div>
    </div>

    <div v-if="source === 'camera'" :class="bemm('actions')">
      <AppButton variant="secondary" @click="stop">Cancel</AppButton>
    </div>
    <p v-if="message" :class="bemm('message')" role="alert" data-capture-error>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useId, watch } from "vue";
import { useBemm } from "bemm";
import AppButton from "../AppButton";
import PixelCanvas from "../PixelCanvas";
import { useHeadTurn } from "../../composables/useHeadTurn";
import type { FrontalPhoto } from "../../composables/useHeadTurn/useHeadTurn.model";
import { loadHeadPoseCascades } from "../../examples/detect-head-pose/resources";
import { PORTRAIT_FACE, getSample } from "../../samples/samples";
import type { FaceCaptureEmits, FaceCaptureProps } from "./FaceCapture.model";

const props = withDefaults(defineProps<FaceCaptureProps>(), { autostart: false });
const emit = defineEmits<FaceCaptureEmits>();
const bemm = useBemm("face-capture", { includeBaseClass: true });
const maskId = useId();
const clipId = useId();

const STEP_LABELS = [
  "Face the camera",
  "Turn one way",
  "Turn the other way",
  "Face the camera again",
];
const SCRIPTED_PHOTO: FrontalPhoto = {
  frame: getSample("portrait").generate(),
  face: {
    x: PORTRAIT_FACE.x - PORTRAIT_FACE.width / 2,
    y: PORTRAIT_FACE.y - PORTRAIT_FACE.height / 2,
    width: PORTRAIT_FACE.width,
    height: PORTRAIT_FACE.height,
  },
  mirrored: false,
};

const check = useHeadTurn({ holdFrames: 3, loadCascades: loadHeadPoseCascades });
const { camera, source, state, ready, message, hint, stop } = check;
const { video } = camera;

const loading = computed(
  () =>
    (props.backend === "haar" && check.cascadesState.value === "loading") ||
    (props.backend === "neural" && check.neuralState.value === "loading"),
);

/**
 * Tells how far a step is.
 *
 * @param index - Step index, 0–3.
 * @returns `"done"`, `"current"` or `""`.
 */
function segmentState(index: number): string {
  if (index < state.value.progress) return "done";
  return index === state.value.progress && !check.finished.value ? "current" : "";
}

/**
 * How full a step's bar is: done steps full, the current one as far as its hold.
 *
 * @param index - Step index, 0–3.
 * @returns 0–1.
 */
function segmentFill(index: number): number {
  if (index < state.value.progress) return 1;
  return index === state.value.progress ? state.value.holdProgress : 0;
}

/** Starts the selfie camera and the check. */
function startCamera(): void {
  void check.start();
}

/** Plays the scripted run with the drawn face. */
function playScripted(): void {
  check.playScripted(SCRIPTED_PHOTO);
}

watch(
  () => props.backend,
  (choice) => void check.chooseBackend(choice),
  { immediate: true },
);
watch(
  () => state.value.step,
  (step) => {
    if (step === "done") {
      emit("complete", {
        photo: check.photo.value,
        source: source.value === "scripted" ? "scripted" : "camera",
      });
    } else if (step === "failed") {
      emit("fail");
    }
  },
);
onMounted(() => {
  if (!props.autostart) return;
  const stopWatching = watch(
    ready,
    (isReady) => {
      if (!isReady) return;
      startCamera();
      queueMicrotask(() => stopWatching());
    },
    { immediate: true },
  );
});
</script>

<style lang="scss">
.face-capture {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-m);

  &__stage {
    position: relative;
    overflow: hidden;
    aspect-ratio: 4 / 3;
    border-radius: var(--auno-radius-sheet);
    background: var(--auno-surface);

    &--live {
      background: #000;
    }
  }

  &__mirror {
    position: absolute;
    inset: 0;
    transform: scaleX(-1);
  }

  &__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__still {
    position: absolute;
    inset: 0;
  }

  &__guide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__veil {
    fill: #000;
    opacity: 0.55;
  }

  &__silhouette {
    fill: var(--auno-pressed);
  }

  &__oval {
    fill: none;
    stroke: rgb(255 255 255 / 0.45);
    stroke-width: 6;

    &--idle {
      stroke: var(--auno-faint);
      stroke-width: 3;
      stroke-dasharray: 8 7;
    }
  }

  &__ring {
    fill: none;
    stroke: var(--auno-affirm);
    stroke-width: 6;
    stroke-linecap: round;
    stroke-dasharray: 100 100;
    transition: stroke-dashoffset 400ms var(--auno-ease);
  }

  &__prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--auno-space-xs);
  }

  &__hint-live {
    padding: var(--auno-space-2xs) var(--auno-space-s);
    border-radius: var(--auno-radius-action);
    background: rgb(0 0 0 / 0.6);
    color: #fff;
    font-size: var(--auno-text-small);
  }

  &__fade-enter-active,
  &__fade-leave-active {
    transition: opacity var(--auno-slow) var(--auno-ease);
  }

  &__fade-enter-from,
  &__fade-leave-to {
    opacity: 0;
  }

  &__hud {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--auno-space-m);
    pointer-events: none;
  }

  &__instruction {
    padding: var(--auno-space-xs) var(--auno-space-m);
    border-radius: var(--auno-radius-action);
    background: rgb(0 0 0 / 0.6);
    color: #fff;
    font-size: var(--auno-text-lead);
    font-weight: 600;
    text-align: center;
    backdrop-filter: blur(8px);

    @media (max-width: 560px) {
      font-size: var(--auno-text-small);
    }
  }

  &__progress {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--auno-space-2xs);
    padding: 0;
    list-style: none;
  }

  &__segment {
    position: relative;
    overflow: hidden;
    height: 6px;
    border-radius: 3px;
    background: rgb(255 255 255 / 0.3);

    &::after {
      position: absolute;
      inset: 0;
      background: #fff;
      content: "";
      transform: scaleX(var(--fill, 0));
      transform-origin: left;
      transition: transform 400ms var(--auno-ease);
    }
  }

  &__segment-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  &__idle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--auno-space-s);
    text-align: center;
  }

  &__hint {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--auno-space-s);
  }

  &__message {
    color: var(--auno-refuse);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    &__segment::after,
    &__silhouette {
      fill: var(--auno-pressed);
    }

    &__oval {
      transition: none;
    }
  }
}
</style>

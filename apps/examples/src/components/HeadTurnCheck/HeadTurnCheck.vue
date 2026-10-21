<template>
  <div
    :class="bemm()"
    :data-slug="example.slug"
    :data-demo-status="status"
    :data-demo-defaults="source === 'idle' ? 'true' : 'false'"
    :data-challenge-step="challengeState.step"
  >
    <div :class="bemm('backend')">
      <p :id="backendLabelId" :class="bemm('backend-label')">Face detector</p>
      <div :class="bemm('choices')" role="radiogroup" :aria-labelledby="backendLabelId">
        <button
          v-for="option in BACKENDS"
          :key="option.value"
          type="button"
          role="radio"
          :aria-checked="backend === option.value"
          :class="bemm('choice', ['', backend === option.value ? 'selected' : ''])"
          :data-backend="option.value"
          @click="chooseBackend(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <p :class="bemm('backend-status')" data-backend-status>{{ backendStatus }}</p>
    </div>

    <div :class="bemm('stage')">
      <div v-show="camera.active.value" :class="bemm('frame')">
        <div :class="bemm('mirror')">
          <video ref="video" :class="bemm('video')" playsinline muted></video>
          <svg
            v-if="frameSize && face"
            :class="bemm('overlay')"
            :viewBox="`0 0 ${frameSize.width} ${frameSize.height}`"
            aria-hidden="true"
          >
            <rect
              :class="bemm('face')"
              :x="face.x"
              :y="face.y"
              :width="face.width"
              :height="face.height"
            />
          </svg>
        </div>
      </div>

      <div :class="bemm('panel')">
        <p :class="bemm('instruction')" aria-live="polite" data-challenge-instruction>
          {{ instruction }}
        </p>
        <p v-if="hint" :class="bemm('hint')" data-challenge-hint>{{ hint }}</p>
        <ol :class="bemm('steps')" aria-label="Progress">
          <li
            v-for="(label, index) in STEP_LABELS"
            :key="label"
            :class="bemm('step', ['', stepState(index)])"
            :aria-current="stepState(index) === 'current' ? 'step' : undefined"
            :style="
              stepState(index) === 'current' ? { '--hold': challengeState.holdProgress } : undefined
            "
          >
            <span :class="bemm('step-number')">{{ index + 1 }}</span>
            {{ label }}
            <span v-if="stepState(index) === 'done'" :class="bemm('step-done')">, done</span>
          </li>
        </ol>
        <div :class="bemm('actions')">
          <AppButton
            v-if="source !== 'camera' || finished"
            variant="primary"
            :disabled="!ready"
            data-challenge-start
            @click="startCamera"
          >
            {{ finished && source === "camera" ? "Try again" : "Start the check" }}
          </AppButton>
          <AppButton v-else variant="secondary" @click="stop">Stop</AppButton>
          <AppButton variant="plain" data-challenge-scripted @click="playScripted">
            Play a scripted run
          </AppButton>
        </div>
        <p v-if="message" :class="bemm('message')" role="alert" data-demo-error>{{ message }}</p>
        <p :class="bemm('debug')" data-challenge-pose>
          Pose this frame: <code :class="bemm('code')">{{ pose }}</code>
          <template v-if="yaw !== null"> · yaw {{ yaw.toFixed(0) }}°</template>
          <template v-if="detectionTime !== null"> · {{ detectionTime.toFixed(0) }} ms</template>
        </p>
      </div>
    </div>

    <details :class="bemm('details')">
      <summary :class="bemm('summary')">The scripted run, frame by frame</summary>
      <DataTable v-for="table in scripted.tables ?? []" :key="table.label" :table="table" />
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useId, watch } from "vue";
import { useBemm } from "bemm";
import AppButton from "../AppButton";
import DataTable from "../DataTable";
import { useHeadTurn } from "../../composables/useHeadTurn";
import type { FaceBackend } from "../../composables/useHeadTurn/useHeadTurn.model";
import { defaultValues } from "../../examples/define";
import type { HeadPoseResources } from "../../examples/detect-head-pose/demo.model";
import { publishResult } from "../../results";
import type { HeadTurnCheckProps } from "./HeadTurnCheck.model";

const props = defineProps<HeadTurnCheckProps>();
const bemm = useBemm("head-turn-check", { includeBaseClass: true });

const STEP_LABELS = [
  "Face the camera",
  "Turn one way",
  "Turn the other way",
  "Face the camera again",
];
const BACKENDS: { value: FaceBackend; label: string }[] = [
  { value: "haar", label: "Built-in (HAAR)" },
  { value: "neural", label: "Neural (YuNet, optional package)" },
];
const backendLabelId = useId();

const options = defaultValues(props.example.controls) as { holdFrames: number };
// The scripted run documented on the page, and checked by the tests.
const scripted = props.example.run(
  { width: 0, height: 0, data: new Uint8ClampedArray(0) },
  options,
);

const check = useHeadTurn({
  holdFrames: options.holdFrames,
  loadCascades: () =>
    (props.example.loadResources?.() ??
      Promise.reject(new Error("No cascades"))) as Promise<HeadPoseResources>,
  onUpdate: (next, from) =>
    publishResult(props.example.slug, {
      status: "ready",
      error: null,
      defaults: false,
      values: {
        step: next.step,
        progress: next.progress,
        firstSide: next.firstSide ?? "",
        source: from,
      },
    }),
});
const {
  camera,
  source,
  state: challengeState,
  backend,
  neuralState,
  ready,
  finished,
  pose,
  face,
  yaw,
  frameSize,
  detectionTime,
  message,
  hint,
  chooseBackend,
  stop,
} = check;
const { video } = camera;
const status = check.cascadesState;

const backendStatus = computed(() => {
  if (backend.value === "haar") {
    return "Built in, nothing to download. The profile cascade only fires on a nearly full profile, so turn far.";
  }
  if (neuralState.value === "loading") return "Loading the YuNet model and onnxruntime-web…";
  if (neuralState.value === "error") return "The neural detector couldn't load.";
  return "YuNet loaded. Turns of about 20° count, and it knows left from right.";
});
const instruction = computed(() => {
  if (source.value === "idle") return "Start the check, then follow the instructions here.";
  if (challengeState.value.step === "done") return "Done. You turned your head both ways.";
  if (challengeState.value.step === "failed")
    return "Time's up before all four steps were done. Try again.";
  return challengeState.value.instruction;
});

/**
 * Tells how far a step is.
 *
 * @param index - Step index, 0–3.
 * @returns `"done"`, `"current"` or `""`.
 */
function stepState(index: number): string {
  if (source.value === "idle") return "";
  if (index < challengeState.value.progress) return "done";
  return index === challengeState.value.progress && !finished.value ? "current" : "";
}

/** Starts the selfie camera and the check. */
function startCamera(): void {
  void check.start();
}

/** Plays the scripted sequence of poses through the same challenge and screen. */
function playScripted(): void {
  check.playScripted();
}

onMounted(() => {
  publishResult(props.example.slug, {
    status: "ready",
    error: null,
    defaults: true,
    values: scripted.values,
  });
  if (new URLSearchParams(window.location.search).get("demo") === "scripted") {
    const stopWatching = watch(
      status,
      (loaded) => {
        if (loaded !== "ready") return;
        playScripted();
        queueMicrotask(() => stopWatching());
      },
      { immediate: true },
    );
  }
});
</script>

<style lang="scss">
.head-turn-check {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-l);

  &__backend {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
  }

  &__backend-label {
    font-size: var(--auno-text-small);
    font-weight: 600;
  }

  &__choices {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-xs);
  }

  &__choice {
    min-height: var(--auno-target-min);
    padding: 0 var(--auno-space-m);
    border: 0;
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
    font-size: var(--auno-text-small);
    cursor: pointer;

    &:hover {
      background: var(--auno-pressed);
    }

    &--selected,
    &--selected:hover {
      background: var(--auno-ink);
      color: var(--auno-on-ink);
    }
  }

  &__backend-status {
    max-width: var(--auno-measure);
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__landmark {
    fill: var(--pv-overlay);
  }

  &__stage {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: var(--auno-space-l);
    align-items: start;
  }

  &__frame {
    overflow: hidden;
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
    line-height: 0;
  }

  &__mirror {
    position: relative;
    transform: scaleX(-1);
  }

  &__video {
    width: 100%;
    height: auto;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__face {
    fill: none;
    stroke: var(--pv-overlay);
    stroke-width: 3;
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-l);
  }

  &__instruction {
    font-size: var(--auno-text-title);
    font-weight: 600;
    line-height: 1.2;
  }

  &__hint {
    color: var(--auno-secondary);
  }

  &__steps {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
    padding: 0;
    list-style: none;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: var(--auno-space-s);
    min-height: var(--auno-target-min);
    padding: 0 var(--auno-space-m);
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
    font-size: var(--auno-text-small);

    &--current {
      background: linear-gradient(
        to right,
        var(--auno-pressed) calc(var(--hold, 0) * 100%),
        var(--auno-surface) calc(var(--hold, 0) * 100%)
      );
      font-weight: 600;
    }

    &--done {
      background: var(--auno-ink);
      color: var(--auno-on-ink);
    }
  }

  &__step-number {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  &__step-done {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-s);
  }

  &__message {
    color: var(--auno-refuse);
  }

  &__debug {
    color: var(--auno-secondary);
    font-size: var(--auno-text-caption);
  }

  &__code {
    font-size: var(--auno-text-caption);
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-s);
  }

  &__summary {
    cursor: pointer;
    font-size: var(--auno-text-small);
    font-weight: 600;
  }
}
</style>

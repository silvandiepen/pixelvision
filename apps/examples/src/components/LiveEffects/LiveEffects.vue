<template>
  <div
    :class="bemm()"
    :data-slug="example.slug"
    :data-demo-status="status"
    :data-demo-defaults="usingDefaults ? 'true' : 'false'"
  >
    <div :class="bemm('actions')">
      <AppButton
        v-if="!camera.active.value"
        variant="primary"
        data-effects-camera
        @click="startCamera"
      >
        Use the camera
      </AppButton>
      <template v-else>
        <AppButton variant="secondary" @click="stopCamera">Stop the camera</AppButton>
        <AppButton variant="secondary" @click="switchCamera">Switch camera</AppButton>
      </template>
      <FileButton data-effects-upload @change="upload">Upload a photo</FileButton>
      <div :class="bemm('preset')">
        <ControlField
          :control="presetControl"
          :model-value="preset"
          @update:model-value="usePreset($event as PresetId)"
        />
      </div>
    </div>

    <p v-if="message" :class="bemm('message')" role="alert" data-demo-error>{{ message }}</p>

    <div :class="bemm('workspace')">
      <div :class="bemm('stage')">
        <div :class="bemm('preview')">
          <video ref="video" :class="bemm('video')" playsinline muted></video>
          <PixelCanvas
            v-if="preview"
            :image="preview"
            :label="`${source === 'camera' ? 'Camera' : 'Photo'} with ${activeCount} effects`"
            :mirrored="source === 'camera' && facing === 'user'"
            data-demo-output
          />
        </div>
        <div :class="bemm('capture-row')">
          <AppButton variant="primary" data-effects-capture @click="takePhoto">
            Take a photo
          </AppButton>
          <span :class="bemm('timing')" aria-live="off">{{ timing }}</span>
        </div>

        <div v-if="photo" :class="bemm('photo')" data-effects-photo>
          <PixelCanvas :image="photo" :label="`Photo, ${photo.width} x ${photo.height}`" />
          <div :class="bemm('photo-actions')">
            <AppButton variant="primary" data-effects-download @click="download"
              >Download</AppButton
            >
            <AppButton variant="plain" @click="photo = null">Discard</AppButton>
          </div>
        </div>
      </div>

      <div :class="bemm('panel')">
        <h3 :class="bemm('panel-title')">Add an effect</h3>
        <ul :class="bemm('palette')" data-effects-palette>
          <li v-for="effect in EFFECTS" :key="effect.id">
            <!-- Not a <button>: browsers don't start a drag from one. -->
            <span
              :class="bemm('chip')"
              role="button"
              tabindex="0"
              draggable="true"
              :title="effect.description.replace(/`/g, '')"
              :data-add-effect="effect.id"
              @click="add(effect.id)"
              @keydown.enter.prevent="add(effect.id)"
              @keydown.space.prevent="add(effect.id)"
              @dragstart="startDrag($event, { kind: 'effect', id: effect.id })"
            >
              {{ effect.label }}
            </span>
          </li>
        </ul>

        <h3 :class="bemm('panel-title')">Your effects, top to bottom</h3>
        <ol
          :class="bemm('stack', ['', dragOver === layers.length ? 'drop-end' : ''])"
          aria-label="Effects, applied top to bottom"
          data-effects-stack
          @dragover.prevent="dragOver = layers.length"
          @dragleave="dragOver = null"
          @drop.prevent="drop(layers.length)"
        >
          <li
            v-for="(layer, index) in layers"
            :key="layer.key"
            :class="
              bemm('layer', ['', layer.enabled ? '' : 'off', dragOver === index ? 'drop' : ''])
            "
            draggable="true"
            :data-layer="layer.effect"
            @dragstart="startDrag($event, { kind: 'layer', index })"
            @dragover.prevent.stop="dragOver = index"
            @drop.prevent.stop="drop(index)"
          >
            <div :class="bemm('layer-head')">
              <span :class="bemm('grip')" aria-hidden="true">⋮⋮</span>
              <label :class="bemm('layer-name')">
                <input
                  v-model="layer.enabled"
                  type="checkbox"
                  :aria-label="`${effectOf(layer).label} on`"
                />
                {{ effectOf(layer).label }}
              </label>
              <span :class="bemm('layer-tools')">
                <button
                  type="button"
                  :class="bemm('tool')"
                  :disabled="index === 0"
                  :aria-label="`Move ${effectOf(layer).label} up`"
                  @click="move(index, index - 1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  :class="bemm('tool')"
                  :disabled="index === layers.length - 1"
                  :aria-label="`Move ${effectOf(layer).label} down`"
                  @click="move(index, index + 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  :class="bemm('tool')"
                  :aria-label="`Remove ${effectOf(layer).label}`"
                  data-effects-remove
                  @click="layers.splice(index, 1)"
                >
                  ×
                </button>
              </span>
            </div>
            <div v-if="effectOf(layer).controls.length && layer.enabled" :class="bemm('settings')">
              <ControlField
                v-for="control in effectOf(layer).controls"
                :key="control.key"
                :control="control"
                :model-value="layer.options[control.key]"
                @update:model-value="layer.options[control.key] = $event"
              />
            </div>
          </li>
          <li v-if="!layers.length" :class="bemm('empty')">
            Drag an effect here, or press one above.
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { useBemm } from "bemm";
import type { Matrix, RGBAImage } from "pixelvision";
import AppButton from "../AppButton";
import ControlField from "../ControlField";
import FileButton from "../FileButton";
import PixelCanvas from "../PixelCanvas";
import { useCamera } from "../../composables/useCamera";
import type { FacingMode } from "../../composables/useCamera/useCamera.model";
import { presetLayers } from "../../examples/live-effects/demo";
import type { PresetId } from "../../examples/live-effects/demo.model";
import {
  applyEffects,
  createLayer,
  EFFECTS,
  findEffect,
} from "../../examples/live-effects/effects";
import type { Effect, EffectId, EffectLayer } from "../../examples/live-effects/effects.model";
import type { SelectControl } from "../../examples/example.model";
import { publishResult } from "../../results";
import { loadSample } from "../../samples/samples";
import { encodeImage, saveBlob } from "../../utils/export";
import { readImageFile } from "../../utils/input";
import type { DragItem, LiveEffectsProps } from "./LiveEffects.model";

const props = defineProps<LiveEffectsProps>();
const bemm = useBemm("live-effects", { includeBaseClass: true });

/** Preview frames are read at most this size; photos at the camera's full size. */
const PREVIEW_BOX = { width: 640, height: 480 };
const FULL_BOX = { width: 4096, height: 4096 };

const camera = useCamera();
const { video } = camera;
const presetControl = props.example.controls.find((c) => c.key === "preset") as SelectControl;
const preset = ref<PresetId>(presetControl.default as PresetId);
const layers = ref<EffectLayer[]>(presetLayers(preset.value));
const facing = ref<FacingMode>("user");
const source = ref<"sample" | "upload" | "camera">("sample");
const still = shallowRef<RGBAImage | null>(null);
const preview = shallowRef<Matrix<"u8"> | null>(null);
const photo = shallowRef<Matrix<"u8"> | null>(null);
const message = ref<string | null>(null);
const status = ref<"running" | "ready" | "error">("running");
const timing = ref("");
const dragOver = ref<number | null>(null);
// Whether the stack is still the default preset, untouched.
const edited = ref(false);
let dragged: DragItem | null = null;
let loop = 0;

const activeCount = computed(() => layers.value.filter((layer) => layer.enabled).length);
const usingDefaults = computed(
  () => source.value === "sample" && preset.value === presetControl.default && !edited.value,
);

/**
 * The effect of a layer.
 *
 * @param layer - The layer.
 * @returns Its effect.
 */
const effectOf = (layer: EffectLayer): Effect => findEffect(layer.effect);

/**
 * Runs an image through the stack and times it.
 *
 * @param image - The frame or photo.
 * @returns The result.
 */
function process(image: RGBAImage): Matrix<"u8"> {
  const started = performance.now();
  const result = applyEffects(image, layers.value);
  timing.value = `${Math.round(performance.now() - started)} ms per frame, ${image.width} x ${image.height}`;
  return result;
}

/** Shows the still photo with the current stack, and publishes it for the tests. */
function renderStill(): void {
  if (!still.value) return;
  try {
    preview.value = process(still.value);
    message.value = null;
    status.value = "ready";
    publish();
  } catch (caught) {
    message.value = caught instanceof Error ? caught.message : String(caught);
    status.value = "error";
  }
}

/** Publishes the current result for the end-to-end tests. */
function publish(): void {
  publishResult(props.example.slug, {
    status: "ready",
    error: null,
    defaults: usingDefaults.value,
    values: usingDefaults.value
      ? props.example.run(still.value!, { preset: preset.value }).values
      : {
          effects: layers.value
            .filter((layer) => layer.enabled)
            .map((layer) => layer.effect)
            .join(","),
          source: source.value,
          photo: photo.value ? `${photo.value.width}x${photo.value.height}` : "",
        },
  });
}

/** Processes camera frames as fast as the stack allows, one at a time. */
function tick(): void {
  if (!camera.active.value) return;
  const frame = camera.frame(PREVIEW_BOX);
  if (frame) {
    try {
      preview.value = process(frame);
      message.value = null;
    } catch (caught) {
      message.value = caught instanceof Error ? caught.message : String(caught);
    }
  }
  loop = requestAnimationFrame(tick);
}

/** Starts the camera and the preview loop. */
async function startCamera(): Promise<void> {
  message.value = null;
  if (!(await camera.start(facing.value))) {
    message.value = camera.error.value;
    return;
  }
  source.value = "camera";
  cancelAnimationFrame(loop);
  loop = requestAnimationFrame(tick);
  publish();
}

/** Stops the camera and goes back to the last still photo. */
function stopCamera(): void {
  cancelAnimationFrame(loop);
  camera.stop();
  source.value = source.value === "camera" ? "upload" : source.value;
  renderStill();
}

/** Swaps between the selfie camera and the back camera. */
async function switchCamera(): Promise<void> {
  facing.value = facing.value === "user" ? "environment" : "user";
  await startCamera();
}

/**
 * Uses an uploaded photo instead of the camera.
 *
 * @param event - The file input's change event.
 */
async function upload(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const image = await readImageFile(file);
    cancelAnimationFrame(loop);
    camera.stop();
    still.value = image;
    source.value = "upload";
    renderStill();
  } catch {
    message.value = `"${file.name}" couldn't be read as an image.`;
  }
}

/** Takes the photo: the full-size frame (or still) through the same stack. */
function takePhoto(): void {
  const image = source.value === "camera" ? camera.frame(FULL_BOX) : still.value;
  if (!image) return;
  const result = applyEffects(image, layers.value);
  // The camera preview is mirrored like a mirror; the photo is as the camera saw it.
  photo.value = result;
  publish();
}

/** Saves the photo as a PNG. */
async function download(): Promise<void> {
  if (!photo.value) return;
  saveBlob(await encodeImage(photo.value, "image/png"), "pixelvision-effects.png");
}

/**
 * Replaces the stack with a preset.
 *
 * @param id - The preset.
 */
function usePreset(id: PresetId): void {
  preset.value = id;
  layers.value = presetLayers(id);
  edited.value = false;
}

/**
 * Adds an effect to the stack.
 *
 * @param id - The effect.
 * @param index - Where to put it (default: at the bottom).
 */
function add(id: EffectId, index = layers.value.length): void {
  layers.value.splice(index, 0, createLayer(id));
}

/**
 * Moves a layer.
 *
 * @param from - Its index.
 * @param to - Its new index.
 */
function move(from: number, to: number): void {
  if (to < 0 || to >= layers.value.length) return;
  const [layer] = layers.value.splice(from, 1);
  layers.value.splice(to, 0, layer);
}

/**
 * Remembers what is being dragged.
 *
 * @param event - The drag start.
 * @param item - The effect or layer.
 */
function startDrag(event: DragEvent, item: DragItem): void {
  dragged = item;
  event.dataTransfer?.setData("text/plain", item.kind === "effect" ? item.id : `${item.index}`);
  if (event.dataTransfer)
    event.dataTransfer.effectAllowed = item.kind === "effect" ? "copy" : "move";
}

/**
 * Drops an effect or a layer at a place in the stack.
 *
 * @param index - The layer it was dropped on, or the length of the stack for the end.
 */
function drop(index: number): void {
  dragOver.value = null;
  if (!dragged) return;
  if (dragged.kind === "effect") add(dragged.id as EffectId, index);
  else move(dragged.index, Math.min(index, layers.value.length - 1));
  dragged = null;
}

watch(
  layers,
  () => {
    edited.value = true;
    if (!camera.active.value) renderStill();
  },
  { deep: true },
);

onBeforeUnmount(() => cancelAnimationFrame(loop));
void loadSample(props.example.sample ?? "card-photo").then((image) => {
  // Unless an upload arrived first.
  if (still.value) return;
  still.value = image;
  if (!camera.active.value) renderStill();
});
</script>

<style lang="scss">
.live-effects {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-l);

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--auno-space-s);
  }

  &__preset {
    min-width: 10rem;
  }

  &__message {
    max-width: var(--auno-measure);
    color: var(--auno-refuse);
  }

  &__workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--auno-space-l);

    @media (min-width: 60rem) {
      grid-template-columns: minmax(0, 3fr) minmax(16rem, 2fr);
    }
  }

  &__stage {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-s);
  }

  &__preview {
    overflow: hidden;
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
    line-height: 0;
  }

  // Frames are read from the video; the processed picture is what shows.
  &__video {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &__capture-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--auno-space-m);
  }

  &__timing {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
    font-variant-numeric: tabular-nums;
  }

  &__photo {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-s);
    max-width: 24rem;
  }

  &__photo-actions {
    display: flex;
    gap: var(--auno-space-s);
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-s);
    padding: var(--auno-space-m);
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
    align-self: start;
  }

  &__panel-title {
    font-size: var(--auno-text-small);
    font-weight: 600;
  }

  &__stack {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
    min-height: var(--auno-target-min);
    margin: 0 0 var(--auno-space-s);
    padding: 0;
    list-style: none;
    border-radius: var(--auno-radius-s);

    &--drop-end {
      background: color-mix(in srgb, var(--pv-accent) 12%, transparent);
    }
  }

  &__layer {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
    padding: var(--auno-space-xs) var(--auno-space-s);
    border-radius: var(--auno-radius-s);
    background: var(--auno-raised);
    cursor: grab;

    &--off {
      opacity: 0.55;
    }

    &--drop {
      background: color-mix(in srgb, var(--pv-accent) 20%, var(--auno-raised));
    }
  }

  &__layer-head {
    display: flex;
    align-items: center;
    gap: var(--auno-space-xs);
  }

  &__grip {
    color: var(--auno-secondary);
    letter-spacing: -0.2em;
  }

  &__layer-name {
    display: flex;
    flex: 1;
    align-items: center;
    gap: var(--auno-space-xs);
    font-size: var(--auno-text-small);
    font-weight: 600;
  }

  &__layer-tools {
    display: flex;
    gap: 2px;
  }

  &__tool {
    min-width: 2rem;
    min-height: 2rem;
    border: 0;
    border-radius: var(--auno-radius-s);
    background: none;
    color: var(--auno-ink);
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--auno-pressed);
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }

  &__settings {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
    padding-left: var(--auno-space-m);
  }

  &__empty {
    padding: var(--auno-space-s);
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__palette {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-xs);
    margin: 0;
    padding: 0;
    margin-bottom: var(--auno-space-s);
    list-style: none;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0 var(--auno-space-s);
    border: 0;
    border-radius: var(--auno-radius-action);
    background: var(--auno-raised);
    color: var(--auno-ink);
    font-size: var(--auno-text-small);
    cursor: grab;
    user-select: none;

    &:hover {
      background: var(--auno-pressed);
    }

    &:focus-visible {
      outline: 2px solid var(--auno-ink);
      outline-offset: 2px;
    }
  }
}
</style>

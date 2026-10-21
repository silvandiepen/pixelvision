<template>
  <div :class="bemm()" :data-capture-state="scan.state.value">
    <div :class="bemm('stage', ['', active ? 'live' : ''])">
      <div v-show="active" :class="bemm('frame')">
        <video ref="video" :class="bemm('video')" playsinline muted></video>
        <svg
          v-if="frameSize"
          :class="bemm('overlay')"
          :viewBox="`0 0 ${frameSize.width} ${frameSize.height}`"
          aria-hidden="true"
        >
          <polygon
            v-if="liveCorners"
            :class="bemm('quad', ['', holding ? 'holding' : ''])"
            :points="liveCorners.map((p) => `${p.x},${p.y}`).join(' ')"
          />
        </svg>
        <div :class="bemm('status')">
          <p :class="bemm('status-text')" aria-live="polite" data-capture-status>
            {{ statusText }}
          </p>
          <div
            :class="bemm('meter')"
            role="progressbar"
            :aria-valuenow="scan.held.value"
            aria-valuemin="0"
            :aria-valuemax="scan.stableFrames"
            aria-label="Holding still"
          >
            <span
              :class="bemm('meter-fill')"
              :style="{ transform: `scaleX(${scan.held.value / scan.stableFrames})` }"
            ></span>
          </div>
        </div>
      </div>

      <div v-if="!active" :class="bemm('idle')">
        <svg :class="bemm('illustration')" viewBox="0 0 120 90" aria-hidden="true">
          <rect :class="bemm('illustration-frame')" x="4" y="4" width="112" height="82" rx="10" />
          <polygon :class="bemm('illustration-page')" points="34,20 88,14 94,72 30,76" />
        </svg>
        <p :class="bemm('hint')">
          Lay a page or card on a dark surface and point your camera at it.
        </p>
        <div :class="bemm('actions')">
          <AppButton variant="primary" data-capture-camera @click="startCamera">
            Start the camera
          </AppButton>
          <label :class="bemm('upload')">
            Upload a photo
            <input
              :class="bemm('file')"
              type="file"
              accept="image/*"
              data-capture-upload
              @change="upload"
            />
          </label>
        </div>
      </div>
    </div>

    <div v-if="active" :class="bemm('actions')">
      <AppButton variant="secondary" @click="scan.stop()">Cancel</AppButton>
    </div>
    <p v-if="message" :class="bemm('message')" role="alert" data-capture-error>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useBemm } from "bemm";
import { findDocument } from "pixelvision";
import AppButton from "../AppButton";
import { useDocumentScan } from "../../composables/useDocumentScan";
import { readImageFile } from "../../utils/input";
import type { DocumentCaptureEmits } from "./DocumentCapture.model";

const emit = defineEmits<DocumentCaptureEmits>();
const bemm = useBemm("document-capture", { includeBaseClass: true });
const scan = useDocumentScan({ onCapture: (capture) => emit("capture", capture) });
const { camera, liveCorners, frameSize } = scan;
const { video } = camera;
const message = ref<string | null>(null);

const active = computed(() => camera.active.value);
const holding = computed(() => scan.state.value === "holding");
const statusText = computed(() => {
  if (holding.value) return "Hold still…";
  if (scan.cut.value) return "Move back so the whole document is in view.";
  return "Looking for a document. Fit the whole page in view.";
});

/** Starts the back camera. */
async function startCamera(): Promise<void> {
  message.value = null;
  if (!(await scan.start())) message.value = camera.error.value;
}

/**
 * Looks for the document in an uploaded photo.
 *
 * @param event - The file input's change event.
 */
async function upload(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  message.value = null;
  try {
    const photo = await readImageFile(file);
    const found = findDocument(photo);
    if (!found) {
      message.value =
        "No document found in that photo. Fit the whole page in, against a background it stands out from.";
      return;
    }
    emit("capture", { photo, corners: found.corners.map((p) => ({ x: p.x, y: p.y })) });
  } catch {
    message.value = `"${file.name}" couldn't be read as an image.`;
  }
}
</script>

<style lang="scss">
.document-capture {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-m);

  &__stage {
    display: grid;
    place-items: center;
    overflow: hidden;
    aspect-ratio: 4 / 3;
    border-radius: var(--auno-radius-sheet);
    background: var(--auno-surface);

    &--live {
      background: #000;
    }
  }

  &__frame {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__quad {
    fill: color-mix(in srgb, var(--pv-overlay), transparent 82%);
    stroke: var(--pv-overlay);
    stroke-width: 4;
    stroke-linejoin: round;
    stroke-dasharray: 10 8;
    transition: fill var(--auno-base) var(--auno-ease);

    &--holding {
      fill: color-mix(in srgb, var(--pv-overlay), transparent 70%);
      stroke-dasharray: none;
    }
  }

  &__status {
    position: absolute;
    right: var(--auno-space-m);
    bottom: var(--auno-space-m);
    left: var(--auno-space-m);
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
    padding: var(--auno-space-s) var(--auno-space-m);
    border-radius: var(--auno-radius-control);
    background: rgb(0 0 0 / 0.6);
    color: #fff;
    backdrop-filter: blur(8px);
  }

  &__status-text {
    font-weight: 600;
  }

  &__meter {
    overflow: hidden;
    height: 6px;
    border-radius: 3px;
    background: rgb(255 255 255 / 0.25);
  }

  &__meter-fill {
    display: block;
    height: 100%;
    background: #fff;
    transform-origin: left;
    transition: transform var(--auno-fast) linear;
  }

  &__idle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--auno-space-l);
    padding: var(--auno-space-xl) var(--auno-space-m);
    text-align: center;
  }

  &__illustration {
    width: 160px;
  }

  &__illustration-frame {
    fill: none;
    stroke: var(--auno-faint);
    stroke-width: 2;
    stroke-dasharray: 6 5;
  }

  &__illustration-page {
    fill: var(--auno-page);
    stroke: var(--pv-overlay);
    stroke-width: 2.5;
    stroke-linejoin: round;
  }

  &__hint {
    max-width: 28rem;
    color: var(--auno-secondary);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--auno-space-s);
  }

  &__upload {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: var(--auno-target-min);
    padding: 0 var(--auno-space-l);
    border-radius: var(--auno-radius-action);
    background: var(--auno-page);
    font-size: var(--auno-text-small);
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: var(--auno-pressed);
    }

    &:focus-within {
      outline: 2px solid var(--auno-ink);
      outline-offset: 3px;
    }
  }

  &__file {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  &__message {
    color: var(--auno-refuse);
    text-align: center;
  }
}
</style>

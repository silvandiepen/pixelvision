<template>
  <div
    :class="bemm()"
    :data-slug="example.slug"
    :data-demo-status="status"
    :data-demo-defaults="usingDefaults ? 'true' : 'false'"
    :data-scanner-state="state"
  >
    <div :class="bemm('actions')">
      <AppButton
        v-if="!camera.active.value"
        variant="primary"
        data-scanner-camera
        @click="startCamera"
      >
        Use the camera
      </AppButton>
      <AppButton v-else variant="secondary" @click="stopCamera">Stop the camera</AppButton>
      <label :class="bemm('upload')">
        Upload a photo
        <input
          :class="bemm('file')"
          type="file"
          accept="image/*"
          data-scanner-upload
          @change="upload"
        />
      </label>
      <div :class="bemm('aspect')">
        <ControlField
          :control="aspectControl"
          :model-value="values.aspect"
          @update:model-value="values.aspect = $event as DocumentAspect"
        />
      </div>
    </div>

    <p v-if="message" :class="bemm('message')" role="alert" data-demo-error>{{ message }}</p>

    <div v-show="camera.active.value" :class="bemm('viewer')">
      <div :class="bemm('frame')">
        <video ref="video" :class="bemm('video')" playsinline muted></video>
        <svg
          v-if="frameSize"
          :class="bemm('overlay')"
          :viewBox="`0 0 ${frameSize.width} ${frameSize.height}`"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <polygon
            v-if="liveCorners"
            :class="bemm('quad', ['', state === 'holding' ? 'holding' : ''])"
            :points="liveCorners.map((p) => `${p.x},${p.y}`).join(' ')"
          />
        </svg>
      </div>
      <p :class="bemm('status')" aria-live="polite" data-scanner-status>{{ statusText }}</p>
    </div>

    <div v-if="photo && !camera.active.value" :class="bemm('results')">
      <ImageView
        :image="photo"
        :label="corners ? 'Found document (drag the corners to adjust)' : 'No document found'"
        :points="corners ?? undefined"
        data-demo-input
        @update:points="adjustCorners"
      />
      <ImageView
        v-if="straightened"
        :image="straightened"
        :label="`Straightened, ${straightened.width} x ${straightened.height}`"
        data-demo-output
      />
    </div>

    <div v-if="straightened && !camera.active.value" :class="bemm('actions')">
      <AppButton v-if="cameraUsed" variant="primary" @click="startCamera">Retake</AppButton>
      <AppButton variant="secondary" data-scanner-download @click="download">Download</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from "vue";
import { useBemm } from "bemm";
import { extractDocument, findDocument } from "pixelvision";
import type { Matrix, Point, RGBAImage } from "pixelvision";
import AppButton from "../AppButton";
import ControlField from "../ControlField";
import ImageView from "../ImageView";
import { useDocumentScan } from "../../composables/useDocumentScan";
import { defaultValues } from "../../examples/define";
import type { SelectControl } from "../../examples/example.model";
import { ASPECT_RATIOS } from "../../examples/scan-document/demo";
import type { DocumentAspect } from "../../examples/scan-document/demo.model";
import { publishResult } from "../../results";
import { getSample } from "../../samples/samples";
import { round } from "../../utils/format";
import { encodeImage, saveBlob } from "../../utils/export";
import { readImageFile } from "../../utils/input";
import type { DocumentScannerProps, ScannerState } from "./DocumentScanner.model";

const props = defineProps<DocumentScannerProps>();
const bemm = useBemm("document-scanner", { includeBaseClass: true });
const scan = useDocumentScan({
  onCapture: (capture) => {
    fromSample.value = false;
    usePhoto(capture.photo, capture.corners);
  },
});
const { camera, liveCorners, frameSize } = scan;
const { video } = camera;

const aspectControl = props.example.controls.find((c) => c.key === "aspect") as SelectControl;
const values = reactive(defaultValues(props.example.controls) as { aspect: DocumentAspect });

const status = ref<"running" | "ready" | "error">("running");
const message = ref<string | null>(null);
const photo = shallowRef<RGBAImage | null>(null);
const corners = ref<Point[] | null>(null);
const fromSample = ref(true);
const cameraUsed = ref(false);

const state = computed<ScannerState>(() =>
  scan.state.value === "idle" ? "photo" : scan.state.value,
);
const straightened = computed<Matrix<"u8"> | null>(() =>
  photo.value && corners.value
    ? extractDocument(photo.value, corners.value as [Point, Point, Point, Point], {
        aspectRatio: ASPECT_RATIOS[values.aspect],
      })
    : null,
);
const usingDefaults = computed(
  () => fromSample.value && values.aspect === aspectControl.default && state.value === "photo",
);
const statusText = computed(() => {
  if (state.value === "holding") {
    return `Hold still (${scan.held.value} of ${scan.stableFrames})`;
  }
  if (scan.cut.value) return "Move back so the whole document is in view.";
  return "Looking for a document. Fit the whole page in view, against a background it stands out from.";
});

/** Publishes the current result for the end-to-end tests. */
function publish(): void {
  const found = corners.value;
  publishResult(props.example.slug, {
    status: "ready",
    error: null,
    defaults: usingDefaults.value,
    values: fromSample.value
      ? props.example.run(photo.value as RGBAImage, values).values
      : {
          found: found !== null,
          corners: found ? found.map((c) => `${round(c.x, 1)},${round(c.y, 1)}`).join(" ") : "",
          width: straightened.value?.width ?? 0,
          height: straightened.value?.height ?? 0,
          captured: state.value === "captured",
        },
  });
  status.value = "ready";
}

/**
 * Shows a photo and the document found in it.
 *
 * @param image - The photo.
 * @param found - Corners already found (from the camera loop), or `undefined` to search.
 */
function usePhoto(image: RGBAImage, found?: readonly Point[]): void {
  photo.value = image;
  const corners4 = found ?? findDocument(image)?.corners ?? null;
  corners.value = corners4 ? corners4.map((p) => ({ x: p.x, y: p.y })) : null;
  message.value = corners.value
    ? null
    : "No document found. Fit the whole document in the photo, against a background it stands out from.";
  publish();
}

/**
 * Uses dragged corners.
 *
 * @param points - The new corners.
 */
function adjustCorners(points: Point[]): void {
  corners.value = points;
  fromSample.value = false;
  publish();
}

/** Starts the back camera and the detection loop. */
async function startCamera(): Promise<void> {
  message.value = null;
  if (!(await scan.start())) {
    message.value = camera.error.value;
    return;
  }
  fromSample.value = false;
  cameraUsed.value = true;
}

/** Stops the camera, keeping the last result. */
function stopCamera(): void {
  scan.stop();
}

/**
 * Scans an uploaded photo.
 *
 * @param event - The file input's change event.
 */
async function upload(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  stopCamera();
  try {
    const image = await readImageFile(file);
    fromSample.value = false;
    scan.state.value = "idle";
    usePhoto(image);
  } catch {
    message.value = `"${file.name}" couldn't be read as an image.`;
  }
}

/** Saves the straightened document as a PNG. */
async function download(): Promise<void> {
  if (!straightened.value) return;
  saveBlob(await encodeImage(straightened.value, "image/png"), "document.png");
}

usePhoto(getSample(props.example.sample ?? "desk").generate());
</script>

<style lang="scss">
.document-scanner {
  display: flex;
  flex-direction: column;
  gap: var(--auno-space-l);

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--auno-space-s);
  }

  &__upload {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: var(--auno-target-min);
    padding: 0 var(--auno-space-l);
    border-radius: var(--auno-radius-action);
    background: var(--auno-surface);
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

  &__aspect {
    min-width: 10rem;
  }

  &__message {
    max-width: var(--auno-measure);
    color: var(--auno-refuse);
  }

  &__viewer {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-s);
    max-width: 40rem;
  }

  &__frame {
    position: relative;
    overflow: hidden;
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
    line-height: 0;
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

  &__quad {
    fill: color-mix(in srgb, var(--pv-overlay), transparent 85%);
    stroke: var(--pv-overlay);
    stroke-width: 3;
    stroke-dasharray: 8 6;

    &--holding {
      stroke-dasharray: none;
    }
  }

  &__status {
    font-size: var(--auno-text-lead);
    font-weight: 600;
  }

  &__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: var(--auno-space-m);
  }
}
</style>

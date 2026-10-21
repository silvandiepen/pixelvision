<template>
  <div
    :class="bemm()"
    :data-demo-status="status"
    :data-demo-defaults="usingDefaults ? 'true' : 'false'"
    :data-slug="example.slug"
  >
    <div :class="bemm('panel')">
      <div v-if="example.input === 'image'" :class="bemm('sources')">
        <div :class="bemm('field')">
          <label :class="bemm('label')" :for="sampleSelectId">Input</label>
          <select
            :id="sampleSelectId"
            :class="bemm('select')"
            :value="source === 'sample' ? sampleId : source"
            data-input-select
            @change="chooseInput(($event.target as HTMLSelectElement).value)"
          >
            <optgroup label="Samples">
              <option v-for="sample in SAMPLES" :key="sample.id" :value="sample.id">
                {{ sample.label }}
              </option>
            </optgroup>
            <option v-if="source === 'upload'" value="upload">Uploaded image</option>
            <option v-if="webcamAllowed" value="webcam">Webcam</option>
          </select>
        </div>
        <label :class="bemm('upload')">
          Upload an image
          <input :class="bemm('file')" type="file" accept="image/*" @change="upload" />
        </label>
      </div>

      <ControlField
        v-for="control in example.controls"
        :key="control.key"
        :control="control"
        :model-value="values[control.key]"
        @update:model-value="values[control.key] = $event"
      />

      <button type="button" :class="bemm('reset')" @click="reset">Reset to defaults</button>
    </div>

    <div :class="bemm('results')">
      <p v-if="inputError" :class="bemm('message', ['', 'error'])" role="alert">
        {{ inputError }}
      </p>
      <p v-if="error" :class="bemm('message', ['', 'error'])" role="alert" data-demo-error>
        {{ error }}
      </p>

      <div :class="bemm('images')">
        <ImageView
          v-if="example.input === 'image' && input.width > 0"
          :image="input"
          :label="inputLabel"
          :points="pointsKey ? (values[pointsKey] as Point[]) : undefined"
          data-demo-input
          @update:points="pointsKey && (values[pointsKey] = $event)"
        />
        <ImageView
          v-for="(image, index) in output?.images ?? []"
          :key="`image-${index}`"
          :image="image.image"
          :label="image.label"
          :overlay="image.overlay"
          data-demo-output
        />
        <SvgView
          v-for="(svg, index) in output?.svgs ?? []"
          :key="`svg-${index}`"
          :svg="svg"
          data-demo-output
        />
      </div>

      <BarChart
        v-for="(chart, index) in output?.charts ?? []"
        :key="`chart-${index}`"
        :chart="chart"
      />

      <div v-if="output?.tables?.length" :class="bemm('tables')">
        <DataTable v-for="(table, index) in output.tables" :key="`table-${index}`" :table="table" />
      </div>

      <dl v-if="output" :class="bemm('values')" data-demo-values>
        <div v-for="(value, key) in output.values" :key="key" :class="bemm('value')">
          <dt :class="bemm('value-key')">{{ key }}</dt>
          <dd :class="bemm('value-data')" :data-value="key">{{ value }}</dd>
        </div>
      </dl>
      <p v-if="duration !== null" :class="bemm('timing')">Ran in {{ duration.toFixed(1) }} ms</p>
    </div>

    <video ref="video" :class="bemm('video')" playsinline muted></video>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  reactive,
  ref,
  shallowRef,
  useId,
  useTemplateRef,
  watch,
} from "vue";
import { useBemm } from "bemm";
import type { Point, RGBAImage } from "pixelvision";
import BarChart from "../BarChart";
import ControlField from "../ControlField";
import DataTable from "../DataTable";
import ImageView from "../ImageView";
import SvgView from "../SvgView";
import { defaultValues } from "../../examples/define";
import type { ControlValues, DemoOutput } from "../../examples/example.model";
import { publishResult } from "../../results";
import { SAMPLES, getSample } from "../../samples/samples";
import type { SampleId } from "../../samples/samples.model";
import { MAX_WEBCAM_SIZE, readImageFile, readPixels } from "../../utils/input";
import type { ExampleDemoProps, InputSource } from "./ExampleDemo.model";

const props = defineProps<ExampleDemoProps>();
const bemm = useBemm("example-demo", { includeBaseClass: true });
const sampleSelectId = useId();
const video = useTemplateRef<HTMLVideoElement>("video");

const EMPTY_IMAGE: RGBAImage = { width: 0, height: 0, data: new Uint8ClampedArray(0) };

const source = ref<InputSource>("sample");
const sampleId = ref<SampleId>(props.example.sample ?? "shapes");
const input = shallowRef<RGBAImage>(EMPTY_IMAGE);
const inputError = ref<string | null>(null);
const values = reactive<ControlValues>(defaultValues(props.example.controls));

const output = shallowRef<DemoOutput | null>(null);
const error = ref<string | null>(null);
const duration = ref<number | null>(null);
const status = ref<"loading" | "running" | "ready" | "error">(
  props.example.loadResources ? "loading" : "running",
);
const resources = shallowRef<unknown>(undefined);
const previous = shallowRef<RGBAImage | null>(null);

const webcamAllowed = computed(
  () => props.example.webcam !== false && Boolean(navigator.mediaDevices?.getUserMedia),
);
const pointsKey = computed(
  () => props.example.controls.find((control) => control.type === "points")?.key,
);
const inputLabel = computed(() => {
  if (source.value === "webcam") return "Input: webcam";
  if (source.value === "upload") return "Input: uploaded image";
  return `Input: ${getSample(sampleId.value).label}`;
});
const usingDefaults = computed(
  () =>
    source.value === "sample" &&
    sampleId.value === (props.example.sample ?? "shapes") &&
    JSON.stringify(values) === JSON.stringify(defaultValues(props.example.controls)),
);

let stream: MediaStream | null = null;
let frameRequest = 0;
const frameCanvas = document.createElement("canvas");

/** Loads the chosen sample as the input. */
function loadSample(): void {
  input.value =
    props.example.input === "image" ? getSample(sampleId.value).generate() : EMPTY_IMAGE;
}

/** Runs the demo on the current input and options, and publishes the result. */
function run(): void {
  if (props.example.input === "image" && input.value.width === 0) return;
  if (status.value === "loading") return;
  const started = performance.now();
  try {
    output.value = props.example.run(input.value, values, {
      previous: source.value === "webcam" ? previous.value : null,
      resources: resources.value,
    });
    error.value = null;
    status.value = "ready";
  } catch (caught) {
    output.value = null;
    error.value = caught instanceof Error ? `${caught.name}: ${caught.message}` : String(caught);
    status.value = "error";
  }
  duration.value = performance.now() - started;
  publishResult(props.example.slug, {
    status: status.value === "error" ? "error" : "ready",
    values: output.value?.values ?? {},
    error: error.value,
    defaults: usingDefaults.value,
  });
}

/** Stops the webcam, if it's on. */
function stopWebcam(): void {
  cancelAnimationFrame(frameRequest);
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
}

/** Reads a webcam frame into the input, then schedules the next one. */
function readFrame(): void {
  const element = video.value;
  if (element && element.videoWidth > 0) {
    previous.value = input.value.width > 0 && source.value === "webcam" ? input.value : null;
    input.value = readPixels(
      element,
      element.videoWidth,
      element.videoHeight,
      MAX_WEBCAM_SIZE,
      frameCanvas,
    );
  }
  frameRequest = requestAnimationFrame(readFrame);
}

/** Turns on the webcam and feeds its frames to the demo. */
async function startWebcam(): Promise<void> {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false,
    });
    if (!video.value) return;
    video.value.srcObject = stream;
    await video.value.play();
    source.value = "webcam";
    inputError.value = null;
    readFrame();
  } catch (caught) {
    stopWebcam();
    inputError.value = `The webcam isn't available: ${caught instanceof Error ? caught.message : String(caught)}`;
  }
}

/**
 * Switches the input to a sample or the webcam.
 *
 * @param choice - A sample id, `"upload"` or `"webcam"`.
 */
function chooseInput(choice: string): void {
  if (choice === "upload") return;
  stopWebcam();
  previous.value = null;
  if (choice === "webcam") {
    void startWebcam();
    return;
  }
  source.value = "sample";
  sampleId.value = choice as SampleId;
  inputError.value = null;
  loadSample();
}

/**
 * Uses an uploaded image file as the input.
 *
 * @param event - The file input's change event.
 */
async function upload(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  stopWebcam();
  try {
    input.value = await readImageFile(file);
    source.value = "upload";
    inputError.value = null;
  } catch {
    inputError.value = `"${file.name}" couldn't be read as an image.`;
  }
}

/** Restores the default sample and options. */
function reset(): void {
  stopWebcam();
  Object.assign(values, defaultValues(props.example.controls));
  source.value = "sample";
  sampleId.value = props.example.sample ?? "shapes";
  inputError.value = null;
  loadSample();
}

loadSample();
watch([input, values], run, { deep: true, immediate: true });
if (props.example.loadResources) {
  props.example
    .loadResources()
    .then((loaded) => {
      resources.value = loaded;
      status.value = "running";
      run();
    })
    .catch((caught: unknown) => {
      status.value = "error";
      error.value = `Couldn't load what this demo needs: ${caught instanceof Error ? caught.message : String(caught)}`;
    });
}
onBeforeUnmount(stopWebcam);
</script>

<style lang="scss">
.example-demo {
  display: grid;
  grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
  gap: var(--auno-space-l);
  align-items: start;

  @media (max-width: 48rem) {
    grid-template-columns: minmax(0, 1fr);
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-m);
    padding: var(--auno-space-m);
    border-radius: var(--auno-radius-control);
    background: var(--auno-surface);
  }

  &__sources {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-xs);
    padding-bottom: var(--auno-space-m);
    border-bottom: 1px solid var(--auno-separator);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-2xs);
  }

  &__label {
    font-size: var(--auno-text-small);
    font-weight: 600;
  }

  &__select {
    padding: var(--auno-space-2xs) var(--auno-space-xs);
    border: 0;
    border-radius: var(--auno-radius-s);
    background: var(--auno-raised);
  }

  &__upload {
    color: var(--pv-accent);
    font-size: var(--auno-text-small);
    cursor: pointer;

    &:focus-within {
      outline: 2px solid var(--pv-accent);
    }
  }

  &__file {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  &__reset {
    align-self: flex-start;
    min-height: var(--auno-target-min);
    padding: 0 var(--auno-space-m);
    border: 0;
    border-radius: var(--auno-radius-action);
    background: var(--auno-raised);
    font-weight: 600;
    font-size: var(--auno-text-small);
    cursor: pointer;
  }

  &__results {
    display: flex;
    flex-direction: column;
    gap: var(--auno-space-l);
    min-width: 0;
  }

  &__message {
    padding: var(--auno-space-xs) var(--auno-space-m);
    border-radius: var(--auno-radius-s);

    &--error {
      background: color-mix(in srgb, var(--auno-refuse), transparent 88%);
      color: var(--auno-refuse);
    }
  }

  &__images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--auno-space-m);
  }

  &__tables {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-l);
  }

  &__values {
    display: flex;
    flex-wrap: wrap;
    gap: var(--auno-space-xs);
    margin: 0;
  }

  &__value {
    display: flex;
    gap: var(--auno-space-xs);
    padding: var(--auno-space-2xs) var(--auno-space-xs);
    border-radius: var(--auno-radius-s);
    background: var(--auno-surface);
    font-variant-numeric: tabular-nums;
    font-size: var(--auno-text-small);
  }

  &__value-key {
    color: var(--auno-secondary);
  }

  &__value-data {
    margin: 0;
    font-family: var(--auno-font-mono);
  }

  &__timing {
    color: var(--auno-secondary);
    font-size: var(--auno-text-small);
  }

  &__video {
    display: none;
  }
}
</style>

import type { Matrix, Point, RGBAImage } from "pixelvision";
import type { SampleId } from "../samples/samples.model";

/** Dedicated live demos, for flows that don't fit one image in, one result out. */
export type LiveDemo = "document-scanner" | "head-turn" | "live-effects";

/** Sidebar groups. */
export type ExampleCategory =
  | "image"
  | "features"
  | "tracking"
  | "motion"
  | "detection"
  | "shape"
  | "math"
  | "core"
  | "pipeline";

/** A value a control can hold. */
export type ControlValue = number | string | boolean | number[][] | Point[];

/** Current value of every control, by key. */
export type ControlValues = Record<string, ControlValue>;

interface ControlBase {
  /** Option name passed to the demo. */
  key: string;
  /** Label next to the control. */
  label: string;
  /** What the parameter does; listed under "How it works". */
  description: string;
}

/** A slider. */
export interface RangeControl extends ControlBase {
  type: "range";
  min: number;
  max: number;
  step: number;
  default: number;
}

/** One choice of a {@link SelectControl}. */
export interface SelectOption {
  label: string;
  value: string | number;
}

/** A drop-down. */
export interface SelectControl extends ControlBase {
  type: "select";
  options: readonly SelectOption[];
  default: string | number;
}

/** A checkbox. */
export interface ToggleControl extends ControlBase {
  type: "toggle";
  default: boolean;
}

/** An editable grid of numbers; its shape is the shape of `default`. */
export interface MatrixControl extends ControlBase {
  type: "matrix";
  default: number[][];
}

/** Points placed by dragging handles on the input image. */
export interface PointsControl extends ControlBase {
  type: "points";
  default: Point[];
}

/** Any control in a demo's options panel. */
export type Control = RangeControl | SelectControl | ToggleControl | MatrixControl | PointsControl;

/** What a demo of an image function receives. */
export interface DemoInput<O, R = undefined> {
  /** RGBA pixels of the chosen sample, upload or webcam frame. */
  image: RGBAImage;
  /** The webcam frame before `image`; `null` for samples and uploads. */
  previous: RGBAImage | null;
  /** Current control values. */
  options: O;
  /** What the example's `resources` loaded (e.g. a cascade), or `undefined`. */
  resources: R;
}

/** What a demo without an image input receives. */
export interface OptionsInput<O> {
  /** Current control values. */
  options: O;
}

/** A line segment drawn over an image. */
export interface Segment {
  from: Point;
  to: Point;
}

/** Shapes drawn on top of an image (not part of its pixels). */
export interface Overlay {
  lines?: Segment[];
  points?: Point[];
  polygons?: Point[][];
}

/** An image output: a `u8` matrix with 1, 3 or 4 channels, or RGBA pixels. */
export interface DemoImage {
  label: string;
  image: Matrix<"u8"> | RGBAImage;
  overlay?: Overlay;
}

/** A table output. */
export interface DemoTable {
  label: string;
  columns?: string[];
  rows: (string | number)[][];
}

/** A bar chart output. */
export interface DemoChart {
  label: string;
  values: number[];
}

/** A key number of the result, shown on the page and checked by the tests. */
export type DemoValue = number | string | boolean;

/** A vector drawing output, shown as rendered and offered as a file. */
export interface DemoSvg {
  label: string;
  /** A standalone SVG document. */
  markup: string;
  /** Suggested name when it's downloaded. */
  fileName: string;
}

/** Everything a demo produces. */
export interface DemoOutput {
  images?: DemoImage[];
  /** Drawings shown next to the images. */
  svgs?: DemoSvg[];
  tables?: DemoTable[];
  charts?: DemoChart[];
  /** Key results, exposed to the tests as `window.__pixelvisionResults[slug]`. */
  values: Record<string, DemoValue>;
}

/** One check the tests run on a demo's `values` with the default input and options. */
export interface Expectation {
  /** Key in {@link DemoOutput.values}. */
  key: string;
  /** What is checked, in words. */
  label: string;
  /** Inclusive lower bound for numbers. */
  min?: number;
  /** Inclusive upper bound for numbers. */
  max?: number;
  /** Exact value. */
  equals?: DemoValue;
}

/** Text and metadata shared by every example. */
interface ExampleInfo {
  /** URL path segment. */
  slug: string;
  title: string;
  /** pixelvision exports this page demonstrates. */
  functions: string[];
  category: ExampleCategory;
  /** What it does: one or two sentences. */
  description: string;
  /** How it works: short paragraphs. */
  howItWorks: string[];
  /** What the automated test proves, in words. The checks themselves are `expectations`. */
  howToTest: string;
  /** Whether the demo takes an image, and from where. */
  input: "image" | "none";
  /** Sample shown first (image demos). */
  sample?: SampleId;
  /** Offer the webcam as an input (image demos; default true). */
  webcam?: boolean;
  controls: Control[];
  /**
   * A dedicated live component that replaces the generic demo. It runs the
   * same `demo` on the default sample, so the same checks apply.
   */
  live?: LiveDemo;
  /** Source of the demo function, shown on the page. */
  code: string;
  expectations: Expectation[];
}

/** An example as written: the demo is typed with its own options and resources. */
export interface ExampleSpec<O, R = undefined> extends ExampleInfo {
  /** Loads large data the demo needs (e.g. cascades) once, before the first run. */
  resources?: () => Promise<R>;
  demo: (input: DemoInput<O, R>) => DemoOutput;
}

/** Extra input to {@link Example.run}. */
export interface RunContext {
  /** The previous webcam frame, or `null`. */
  previous: RGBAImage | null;
  /** What {@link Example.loadResources} returned. */
  resources: unknown;
}

/** An example in the registry, ready to run with control values. */
export interface Example extends ExampleInfo {
  /** Loads the demo's resources; absent when it needs none. */
  loadResources?: () => Promise<unknown>;
  run: (image: RGBAImage, options: ControlValues, context?: RunContext) => DemoOutput;
}

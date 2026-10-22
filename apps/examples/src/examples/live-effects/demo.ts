import type { DemoInput, DemoOutput } from "../example.model";
import { applyEffects, createLayer } from "./effects";
import type { LiveEffectsDemoOptions, Preset, PresetId } from "./demo.model";

/** Ready-made stacks, top effect first. */
export const PRESETS: readonly Preset[] = [
  { id: "sketch", label: "Pencil sketch", effects: ["edges", "thicken", "invert"] },
  { id: "comic", label: "Comic", effects: ["smooth", "sharpen"] },
  { id: "scan", label: "Scanned page", effects: ["scan", "invert"] },
  { id: "relief", label: "Relief", effects: ["blur", "emboss"] },
  { id: "none", label: "No effects", effects: [] },
];

/**
 * Builds the stack of a preset, with default settings.
 *
 * @param id - The preset.
 * @returns Its layers.
 */
export const presetLayers = (id: PresetId) =>
  (PRESETS.find((preset) => preset.id === id)?.effects ?? []).map(createLayer);

/**
 * Runs the image through a preset's stack of effects. The live page does the
 * same to every camera frame, with the stack you build.
 *
 * @param input - The image and the preset.
 * @returns The result and how much of it is dark.
 */
export function demo({ image, options }: DemoInput<LiveEffectsDemoOptions>): DemoOutput {
  const result = applyEffects(image, presetLayers(options.preset));

  // Share of dark pixels in the first channel: the "ink" of a sketch.
  const { width, height, channels, data } = result;
  let dark = 0;
  for (let i = 0; i < width * height; i++) if (data[i * channels] < 128) dark++;

  return {
    images: [{ label: "With effects", image: result }],
    values: {
      sameSize: width === image.width && height === image.height,
      inkShare: Math.round((dark / (width * height)) * 1000) / 1000,
    },
  };
}

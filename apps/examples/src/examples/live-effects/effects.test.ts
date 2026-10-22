import type { RGBAImage } from "pixelvision";
import { beforeAll, describe, expect, it } from "vitest";
import { loadSample } from "../../samples/samples";
import { demo, PRESETS, presetLayers } from "./demo";
import { applyEffects, createLayer, EFFECTS } from "./effects";

let photo: RGBAImage;
beforeAll(async () => {
  photo = await loadSample("card-photo");
});

describe("live effects", () => {
  it.each(EFFECTS.map((effect) => [effect.id] as const))(
    "%s keeps the size and gives RGBA or gray",
    (id) => {
      const result = applyEffects(photo, [createLayer(id)]);
      expect(result.width).toBe(photo.width);
      expect(result.height).toBe(photo.height);
      expect([1, 4]).toContain(result.channels);
    },
  );

  it("keeps colour unless an effect needs gray", () => {
    expect(applyEffects(photo, [createLayer("blur")]).channels).toBe(4);
    expect(applyEffects(photo, [createLayer("edges")]).channels).toBe(1);
  });

  it("leaves the alpha channel alone when inverting", () => {
    const result = applyEffects(photo, [createLayer("invert")]);
    for (let i = 3; i < result.data.length; i += 4) expect(result.data[i]).toBe(255);
    expect(result.data[0]).toBe(255 - photo.data[0]);
  });

  it("skips layers that are switched off", () => {
    const off = { ...createLayer("invert"), enabled: false };
    expect(applyEffects(photo, [off]).data).toEqual(applyEffects(photo, []).data);
  });

  it("applies the stack in order", () => {
    const edgesThenThicken = applyEffects(photo, [createLayer("edges"), createLayer("thicken")]);
    const thickenThenEdges = applyEffects(photo, [createLayer("thicken"), createLayer("edges")]);
    expect(edgesThenThicken.data).not.toEqual(thickenThenEdges.data);
  });

  it("gives every layer its own key and the effect's default settings", () => {
    const a = createLayer("edges");
    const b = createLayer("edges");
    expect(a.key).not.toBe(b.key);
    expect(a.options).toEqual({ low: 40, high: 100 });
  });

  it.each(PRESETS.map((preset) => [preset.id] as const))("runs the %s preset", (id) => {
    expect(presetLayers(id).length).toBe(PRESETS.find((p) => p.id === id)?.effects.length);
    const { values } = demo({
      image: photo,
      previous: null,
      options: { preset: id },
      resources: undefined,
    });
    expect(values.sameSize).toBe(true);
  });
});

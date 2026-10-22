import { describe, expect, it } from "vitest";
import { defaultValues } from "../define";
import { SAMPLES, loadSample } from "../../samples/samples";
import { detectHaarExample } from "./index";

describe("the detectHaar page's defaults", () => {
  it("find a face in the face photos and the drawn face, and nowhere else", async () => {
    const resources = await detectHaarExample.loadResources!();
    const found: string[] = [];
    for (const sample of SAMPLES) {
      const { values } = detectHaarExample.run(
        await loadSample(sample.id),
        defaultValues(detectHaarExample.controls),
        { previous: null, resources },
      );
      if (values.count !== 0) found.push(`${sample.id}: ${values.count}`);
    }
    expect(found).toEqual(["face-photo: 1", "portrait: 1"]);
  });
});

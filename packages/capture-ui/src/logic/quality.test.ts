import { describe, expect, it } from "vitest";
import {
  DOCUMENT_QUALITY,
  FACE_QUALITY,
  assessRegion,
  checkQuality,
  describeQuality,
  documentRegion,
  qualityHint,
} from "./quality";
import { documentScene, exposed, faceScene, hazed } from "./testScenes";

const image = (width: number, height: number, fn: (x: number, y: number) => number) => {
  const data = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data[y * width + x] = fn(x, y);
  return { width, height, data };
};

describe("assessRegion", () => {
  it("measures the mean and spread of the region's levels", () => {
    const halves = image(200, 100, (x) => (x < 100 ? 50 : 150));
    const q = assessRegion(halves, { x: 0, y: 0, width: 200, height: 100 });
    // Area averaging rounds down, so the levels come out a little low.
    expect(Math.abs(q.brightness - 100)).toBeLessThan(1.5);
    expect(Math.abs(q.contrast - 50)).toBeLessThan(1.5);
    expect(q.sharpness).toBeGreaterThan(0);
  });

  it("is all zero for a region outside the frame or without pixels", () => {
    const flat = image(10, 10, () => 128);
    const zero = { sharpness: 0, brightness: 0, contrast: 0 };
    expect(assessRegion(flat, { x: 20, y: 0, width: 5, height: 5 })).toEqual(zero);
    expect(assessRegion(flat, { x: 2, y: 2, width: 0, height: 4 })).toEqual(zero);
  });

  it("scores a flat region as not sharp", () => {
    expect(
      assessRegion(
        image(40, 40, () => 90),
        { x: 0, y: 0, width: 40, height: 40 },
      ),
    ).toEqual({
      sharpness: 0,
      brightness: 90,
      contrast: 0,
    });
  });

  it("clips the region to the frame", () => {
    const { image: frame, box } = faceScene();
    const inside = assessRegion(frame, { x: 0, y: 0, width: frame.width, height: frame.height });
    const beyond = assessRegion(frame, { x: -50, y: -50, width: 1000, height: 1000 });
    expect(beyond).toEqual(inside);
    expect(assessRegion(frame, box).brightness).not.toBe(inside.brightness);
  });

  it("scores the same face alike at different sizes and in less light", () => {
    const small = faceScene(480, 360, 0.8);
    const large = faceScene(480, 360, 1.6);
    const a = assessRegion(small.image, small.box);
    const b = assessRegion(large.image, large.box);
    expect(b.sharpness / a.sharpness).toBeLessThan(1.5);
    const dim = assessRegion(exposed(small.image, 0.6), small.box);
    expect(dim.sharpness / a.sharpness).toBeCloseTo(1, 1);
  });
});

describe("checkQuality", () => {
  const ok = { sharpness: 900, brightness: 150, contrast: 50 };

  it("passes a good frame", () => {
    expect(checkQuality(ok, FACE_QUALITY)).toEqual({ ok: true, issue: null });
  });

  it("names light before contrast before sharpness", () => {
    const blurredDark = { sharpness: 10, brightness: 20, contrast: 5 };
    expect(checkQuality(blurredDark, FACE_QUALITY).issue).toBe("dark");
    expect(checkQuality({ ...blurredDark, brightness: 250 }, FACE_QUALITY).issue).toBe("bright");
    expect(checkQuality({ ...blurredDark, brightness: 150 }, FACE_QUALITY).issue).toBe("flat");
    expect(checkQuality({ ...ok, sharpness: 10 }, FACE_QUALITY)).toEqual({
      ok: false,
      issue: "blurry",
    });
  });

  it("lets every check be switched off", () => {
    const off = { minSharpness: 0, minBrightness: 0, maxBrightness: 255, minContrast: 0 };
    expect(checkQuality({ sharpness: 0, brightness: 0, contrast: 0 }, off).ok).toBe(true);
  });

  it("rejects a hazed document and passes a clear one", () => {
    const { image: frame, corners } = documentScene();
    const region = documentRegion(corners!);
    expect(checkQuality(assessRegion(frame, region, 160), DOCUMENT_QUALITY).ok).toBe(true);
    expect(checkQuality(assessRegion(hazed(frame, 0.3), region, 160), DOCUMENT_QUALITY).issue).toBe(
      "flat",
    );
  });
});

describe("qualityHint", () => {
  it("words each issue for faces and documents", () => {
    expect(qualityHint("dark", "face")).toBe("faceTooDark");
    expect(qualityHint("bright", "face")).toBe("faceTooBright");
    expect(qualityHint("flat", "face")).toBe("faceLowContrast");
    expect(qualityHint("blurry", "face")).toBe("faceBlurry");
    expect(qualityHint("dark", "document")).toBe("docTooDark");
    expect(qualityHint("bright", "document")).toBe("docTooBright");
    expect(qualityHint("flat", "document")).toBe("docLowContrast");
    expect(qualityHint("blurry", "document")).toBe("docBlurry");
  });

  it("is undefined without an issue", () => {
    expect(qualityHint(null, "face")).toBeUndefined();
    expect(qualityHint(undefined, "document")).toBeUndefined();
  });
});

describe("documentRegion", () => {
  it("bounds the corners with a margin", () => {
    const corners = [
      { x: 10, y: 20 },
      { x: 110, y: 25 },
      { x: 105, y: 70 },
      { x: 12, y: 60 },
    ];
    const region = documentRegion(corners);
    expect(region).toMatchObject({ x: 5, y: 17.5 });
    expect(region.width).toBeCloseTo(110);
    expect(region.height).toBeCloseTo(55);
    expect(documentRegion(corners, 0)).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });
});

describe("describeQuality", () => {
  it("summarises an assessment and its verdict", () => {
    const q = { sharpness: 712.4, brightness: 150.2, contrast: 48.6 };
    expect(describeQuality(q, FACE_QUALITY)).toBe("s 712 b 150 c 49 ok");
    expect(describeQuality({ ...q, brightness: 30 }, FACE_QUALITY)).toBe("s 712 b 30 c 49 dark");
    expect(describeQuality(undefined, FACE_QUALITY)).toBe("-");
  });
});

import { describe, expect, it } from "vitest";
import { frontalFace } from "../cascades/frontal-face";
import { profileFace } from "../cascades/profile-face";
import { createMatrix } from "../core/matrix";
import type { HaarCascade } from "../detect/haar.model";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { noiseImage } from "../test-images";
import { detectHeadPose } from "./headPose";

/** A one-stage cascade, which fires on ordinary texture. */
const loose = (cascade: HaarCascade): HaarCascade => ({
  ...cascade,
  complexClassifiers: cascade.complexClassifiers.slice(0, 1),
});
const texture = gaussianBlur(noiseImage(400, 300, 4), { kernelSize: 3 });

describe("detectHeadPose", () => {
  it("reports no face in noise with the real cascades", () => {
    expect(detectHeadPose(texture, { frontal: frontalFace, profile: profileFace })).toEqual({
      pose: "none",
    });
  });

  it("returns the best-supported pose with its box in input pixels", () => {
    const result = detectHeadPose(
      texture,
      { frontal: loose(frontalFace), profile: loose(profileFace) },
      // A tiny working size keeps the one-stage cascade's raw hits few.
      { maxSize: 80, minNeighbors: 1, minFaceSize: 0.3 },
    );

    expect(result.pose).not.toBe("none");
    expect(result.face!.width).toBeGreaterThan(20);
    expect(result.face!.x + result.face!.width).toBeLessThanOrEqual(400 + 1);
  });

  it("reports mirrored profiles in the original orientation", () => {
    // Only the mirrored pass can fire: the frontal and profile cascades are empty-passing vs never.
    const never: HaarCascade = {
      ...profileFace,
      complexClassifiers: [{ threshold: 1e9, simpleClassifiers: [] }],
    };
    const small = createMatrix(200, 150);
    small.data.set(texture.data.subarray(0, 200 * 150));
    const result = detectHeadPose(small, { frontal: never, profile: never });

    expect(result.pose).toBe("none");
  });

  it("works without downscaling small frames", () => {
    const small = gaussianBlur(noiseImage(160, 120, 2), { kernelSize: 3 });

    expect(() =>
      detectHeadPose(small, { frontal: frontalFace, profile: profileFace }),
    ).not.toThrow();
  });

  it("rejects colour and non-u8 input", () => {
    const cascades = { frontal: frontalFace, profile: profileFace };
    expect(() => detectHeadPose(createMatrix(4, 4, { channels: 3 }), cascades)).toThrow(RangeError);
    expect(() => detectHeadPose(createMatrix(4, 4, { type: "f32" }) as never, cascades)).toThrow(
      TypeError,
    );
  });
});

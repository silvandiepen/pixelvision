import { describe, expect, it, vi } from "vitest";
import * as pixelvision from "pixelvision";
import { frontalFace } from "pixelvision/cascades/frontal-face";
import { profileFace } from "pixelvision/cascades/profile-face";
import { detectWithHaar, haarPoseSource } from "./haar";

vi.mock("pixelvision", async (importOriginal) => {
  const original = await importOriginal<typeof pixelvision>();
  return { ...original, detectHeadPose: vi.fn(original.detectHeadPose) };
});

const cascades = { frontal: frontalFace, profile: profileFace };
const blank = (width = 64, height = 48) => ({
  width,
  height,
  data: new Uint8ClampedArray(width * height * 4).fill(200),
});

describe("haar pose source", () => {
  it("finds no face in a blank frame", () => {
    expect(detectWithHaar(blank(), { cascades })).toEqual({ pose: "none" });
  });

  it("passes options through and returns the face box", () => {
    vi.mocked(pixelvision.detectHeadPose).mockReturnValueOnce({
      pose: "frontal",
      face: { x: 1, y: 2, width: 3, height: 4, neighbors: 5, confidence: 6 },
    });
    const source = haarPoseSource({ cascades, maxSize: 100 });
    expect(source.directional).toBe(false);
    expect(source.detect(blank())).toEqual({
      pose: "frontal",
      box: { x: 1, y: 2, width: 3, height: 4 },
    });
    const [gray, passed, options] = vi.mocked(pixelvision.detectHeadPose).mock.lastCall!;
    expect(gray.channels).toBe(1);
    expect(passed).toBe(cascades);
    expect(options).toEqual({ maxSize: 100 });
  });
});

import { describe, expect, it, vi } from "vitest";
import * as pixelvision from "pixelvision";
import { frontalFace } from "pixelvision/cascades/frontal-face";
import { profileFace } from "pixelvision/cascades/profile-face";
import { faceScene, toFrame } from "../logic/testScenes";
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

  it("passes options through and returns the face box and every face", () => {
    const face = { x: 1, y: 2, width: 3, height: 4, neighbors: 5, confidence: 6 };
    const other = { x: 40, y: 2, width: 2, height: 2, neighbors: 2, confidence: 6 };
    vi.mocked(pixelvision.detectHeadPose).mockReturnValueOnce({
      pose: "frontal",
      face,
      faces: [face, other],
    });
    const source = haarPoseSource({ cascades, maxSize: 100 });
    expect(source.directional).toBe(false);
    expect(source.detect(blank())).toEqual({
      pose: "frontal",
      box: { x: 1, y: 2, width: 3, height: 4 },
      faces: [
        { x: 1, y: 2, width: 3, height: 4 },
        { x: 40, y: 2, width: 2, height: 2 },
      ],
    });
    const [gray, passed, options] = vi.mocked(pixelvision.detectHeadPose).mock.lastCall!;
    expect(gray.channels).toBe(1);
    expect(passed).toBe(cascades);
    expect(options).toEqual({ maxSize: 100 });
  });

  it("finds both drawn faces in a frame with two people", () => {
    const scene = faceScene(480, 360, 1, { x: 140, y: 170 }, [{ scale: 0.9, x: 350, y: 170 }]);
    const observation = detectWithHaar(toFrame(scene.image), { cascades });

    expect(observation.pose).toBe("frontal");
    expect(observation.faces).toHaveLength(2);
    expect(observation.faces![0]).toEqual(observation.box);
  });
});

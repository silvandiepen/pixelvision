import { describe, expect, it } from "vitest";
import { bbfFace } from "./bbf-face";
import { eye } from "./eye";
import { frontalFace } from "./frontal-face";
import { profileFace } from "./profile-face";
import { upperBody } from "./upper-body";

describe("bundled cascades", () => {
  it.each([
    ["frontalFace", frontalFace, [20, 20], 22],
    ["eye", eye, [20, 20], 24],
    ["profileFace", profileFace, [20, 20], 26],
    ["upperBody", upperBody, [22, 18], 30],
  ] as const)("%s has its window size and stages", (_, cascade, size, stages) => {
    expect(cascade.size).toEqual(size);
    expect(cascade.complexClassifiers).toHaveLength(stages);
    for (const stage of cascade.complexClassifiers) {
      for (const tree of stage.simpleClassifiers) {
        expect(tree.features.every((f) => f.length === 5)).toBe(true);
      }
    }
  });

  it("ships the BBF face cascade", () => {
    expect(bbfFace).toMatchObject({ width: 24, height: 24 });
    expect(bbfFace.stage_classifier).toHaveLength(16);
    for (const stage of bbfFace.stage_classifier) {
      expect(stage.alpha).toHaveLength(stage.count * 2);
    }
  });
});

import { describe, expect, it } from "vitest";
import { frontalFace } from "../cascades/frontal-face";
import { upperBody } from "../cascades/upper-body";
import type { HaarCascade, HaarTree } from "./haar.model";
import { loadOpenCvCascade } from "./opencvCascade";

/**
 * Writes a stump cascade in OpenCV's older `opencv-haar-classifier` layout.
 *
 * @param cascade - Cascade whose trees are single splits.
 * @returns The XML.
 */
const legacyXml = (cascade: HaarCascade): string => {
  const stages = cascade.complexClassifiers.map(
    (stage, s) => `<_><trees>${stage.simpleClassifiers
      .map(
        (tree) => `<_><_><feature><rects>${tree.features
          .map((r) => `<_>${r.join(" ")}</_>`)
          .join("")}</rects><tilted>${tree.tilted ?? 0}</tilted></feature>
          <threshold>${tree.threshold}</threshold><left_val>${tree.left_val}</left_val>
          <right_val>${tree.right_val}</right_val></_></_>`,
      )
      .join("")}</trees><stage_threshold>${stage.threshold}</stage_threshold>
      <parent>${s - 1}</parent><next>-1</next></_>`,
  );
  return `<?xml version="1.0"?><opencv_storage><cascade_x type_id="opencv-haar-classifier">
    <size>${cascade.size.join(" ")}</size><stages>${stages.join("")}</stages>
    </cascade_x></opencv_storage>`;
};

/**
 * Writes a stump cascade in OpenCV's current `opencv-cascade-classifier` layout.
 *
 * @param cascade - Cascade whose trees are single splits.
 * @returns The XML.
 */
const currentXml = (cascade: HaarCascade): string => {
  const trees = cascade.complexClassifiers.flatMap((stage) => stage.simpleClassifiers);
  const stages = cascade.complexClassifiers.map((stage) => {
    const weak = stage.simpleClassifiers.map(
      (tree) => `<_><internalNodes>0 -1 ${trees.indexOf(tree)} ${tree.threshold}</internalNodes>
        <leafValues>${tree.left_val} ${tree.right_val}</leafValues></_>`,
    );
    return `<_><maxWeakCount>${weak.length}</maxWeakCount>
      <stageThreshold>${stage.threshold}</stageThreshold>
      <weakClassifiers>${weak.join("")}</weakClassifiers></_>`;
  });
  const features = trees.map(
    (tree) =>
      `<_><rects>${tree.features.map((r) => `<_>\n ${r.join(" ")}</_>`).join("")}</rects>` +
      `<tilted>${tree.tilted ?? 0}</tilted></_>`,
  );
  return `<?xml version="1.0"?>
<opencv_storage>
<cascade type_id="opencv-cascade-classifier"><stageType>BOOST</stageType>
  <featureType>HAAR</featureType><height>${cascade.size[1]}</height><width>${cascade.size[0]}</width>
  <stageNum>${stages.length}</stageNum><stages>${stages.join("")}</stages>
  <features>${features.join("")}</features></cascade></opencv_storage>`;
};

/**
 * A cascade's trees with `tilted: 0` removed, as the loader leaves it out.
 *
 * @param cascade - The cascade.
 * @param tilted - The cascade-level flag the loader sets.
 * @returns The normalised cascade.
 */
const normalise = (cascade: HaarCascade, tilted: boolean): HaarCascade => ({
  size: cascade.size,
  tilted,
  opencvScoring: true,
  complexClassifiers: cascade.complexClassifiers.map((stage) => ({
    threshold: stage.threshold,
    simpleClassifiers: stage.simpleClassifiers.map((tree): HaarTree => {
      const out: HaarTree = {
        features: tree.features,
        threshold: tree.threshold,
        left_val: tree.left_val,
        right_val: tree.right_val,
      };
      if (tree.tilted === 1) out.tilted = 1;
      return out;
    }),
  })),
});

/** A cascade with one stage of one tree, in both layouts, for the error cases. */
const tiny = { size: [4, 4], complexClassifiers: [] } as unknown as HaarCascade;

describe("loadOpenCvCascade", () => {
  it.each([
    ["legacy", legacyXml],
    ["current", currentXml],
  ])("reads the %s layout of the frontal-face cascade exactly", (_, write) => {
    expect(loadOpenCvCascade(write(frontalFace))).toEqual(normalise(frontalFace, false));
  });

  it.each([
    ["legacy", legacyXml],
    ["current", currentXml],
  ])("reads tilted features in the %s layout", (_, write) => {
    const loaded = loadOpenCvCascade(write(upperBody));

    expect(loaded).toEqual(normalise(upperBody, true));
    expect(
      loaded.complexClassifiers.flatMap((s) => s.simpleClassifiers).some((t) => t.tilted),
    ).toBe(true);
  });

  it("reads trees with more than one split in the legacy layout", () => {
    const cascade = loadOpenCvCascade(`<opencv_storage><c type_id="opencv-haar-classifier">
      <size>24 24</size><stages><_><trees><_>
        <_><feature><rects><_>0 0 12 24 1.</_><_>12 0 12 24 -1.</_></rects><tilted>0</tilted></feature>
          <threshold>0.5</threshold><left_node>1</left_node><right_val>-1.</right_val></_>
        <_><feature><rects><_>12 0 12 12 1.</_><_>12 6 6 6 -4.</_></rects><tilted>1</tilted></feature>
          <threshold>0.8</threshold><left_val>-0.5</left_val><right_node>2</right_node></_>
        <_><feature><rects><_>0 0 24 24 1.</_></rects></feature>
          <threshold>0.1</threshold><left_val>0.25</left_val><right_val>1.</right_val></_>
      </_></trees><stage_threshold>0</stage_threshold></_></stages></c></opencv_storage>`);

    expect(cascade.tilted).toBe(true);
    expect(cascade.complexClassifiers[0].simpleClassifiers[0]).toEqual({
      features: [
        [0, 0, 12, 24, 1],
        [12, 0, 12, 24, -1],
      ],
      threshold: 0.5,
      left_val: 0,
      right_val: -1,
      left: {
        features: [
          [12, 0, 12, 12, 1],
          [12, 6, 6, 6, -4],
        ],
        threshold: 0.8,
        left_val: -0.5,
        right_val: 0,
        tilted: 1,
        right: { features: [[0, 0, 24, 24, 1]], threshold: 0.1, left_val: 0.25, right_val: 1 },
      },
    });
  });

  it("reads trees with more than one split in the current layout", () => {
    const cascade = loadOpenCvCascade(`<opencv_storage><cascade>
      <stageType>BOOST</stageType><featureType>HAAR</featureType><width>24</width><height>20</height>
      <stages><_><stageThreshold>-1.5</stageThreshold><weakClassifiers><_>
        <internalNodes>1 -1 0 0.5 0 -2 1 0.8</internalNodes>
        <leafValues>0.25 -1. 0.75</leafValues></_></weakClassifiers></_></stages>
      <features><_><rects><_>0 0 12 20 1.</_><_>12 0 12 20 -1.</_></rects></_>
        <_><rects><_>0 0 24 20 1.</_></rects><tilted>0</tilted></_></features>
      </cascade></opencv_storage>`);

    expect(cascade).toEqual({
      size: [24, 20],
      tilted: false,
      opencvScoring: true,
      complexClassifiers: [
        {
          threshold: -1.5,
          simpleClassifiers: [
            {
              features: [
                [0, 0, 12, 20, 1],
                [12, 0, 12, 20, -1],
              ],
              threshold: 0.5,
              left_val: 0,
              right_val: -1,
              left: {
                features: [[0, 0, 24, 20, 1]],
                threshold: 0.8,
                left_val: 0.25,
                right_val: 0.75,
              },
            },
          ],
        },
      ],
    });
  });

  it("rejects files that aren't HAAR cascades", () => {
    expect(() => loadOpenCvCascade("<svg></svg>")).toThrow(
      "expected an OpenCV <opencv_storage> file, got <svg>",
    );
    expect(() => loadOpenCvCascade("<opencv_storage/>")).toThrow("<opencv_storage> is empty");
    expect(() => loadOpenCvCascade("<opencv_storage><camera/></opencv_storage>")).toThrow(
      "<camera> is not an OpenCV cascade classifier",
    );
    const current = (body: string) => `<opencv_storage><cascade>${body}</cascade></opencv_storage>`;
    expect(() =>
      loadOpenCvCascade(current("<stageType>BOOST</stageType><featureType>LBP</featureType>")),
    ).toThrow("LBP cascades are not supported, only HAAR");
    expect(() => loadOpenCvCascade(current("<stageType>OTHER</stageType>"))).toThrow(
      "stage type OTHER is not supported",
    );
    expect(() =>
      loadOpenCvCascade(
        `<opencv_storage><cascade type_id="opencv-cascade-classifier"><featureType>HOG</featureType></cascade></opencv_storage>`,
      ),
    ).toThrow("HOG cascades are not supported");
    expect(() => loadOpenCvCascade("<opencv_storage><x/></opencv_storage>")).toThrow(
      "is not an OpenCV cascade classifier",
    );
    expect(() => loadOpenCvCascade("<opencv_storage><a>")).toThrow(SyntaxError);
  });

  it("rejects stage trees", () => {
    const xml = legacyXml({
      size: [4, 4],
      complexClassifiers: [{ threshold: 0, simpleClassifiers: [] }],
    }).replace("<next>-1</next>", "<next>3</next>");
    expect(() => loadOpenCvCascade(xml)).toThrow("stages form a tree");
    expect(() =>
      loadOpenCvCascade(xml.replace("<next>3</next>", "").replace("<parent>-1", "<parent>2")),
    ).toThrow("stages form a tree");
    expect(() =>
      loadOpenCvCascade(xml.replace("<next>3</next>", "").replace("<parent>-1</parent>", "")),
    ).not.toThrow();
  });

  it("rejects malformed cascades", () => {
    const legacy = (trees: string, size = "4 4") =>
      `<opencv_storage><c type_id="opencv-haar-classifier"><size>${size}</size><stages><_><trees>${trees}</trees><stage_threshold>0</stage_threshold></_></stages></c></opencv_storage>`;
    const node = (
      rects: string,
      rest = "<threshold>0</threshold><left_val>0</left_val><right_val>1</right_val>",
    ) => `<_><_><feature><rects>${rects}</rects></feature>${rest}</_></_>`;
    expect(() => loadOpenCvCascade(legacy("", "4"))).toThrow('<size> must be "width height"');
    expect(() => loadOpenCvCascade(legacy("<_></_>"))).toThrow("a tree has no splits");
    expect(() => loadOpenCvCascade(legacy(node("<_>0 0 1 1</_>")))).toThrow(
      'a rectangle must be "x y width height weight"',
    );
    expect(() => loadOpenCvCascade(legacy(node("<_>0 0 1 1 x</_>")))).toThrow(
      '<_> holds "x", not a number',
    );
    expect(() =>
      loadOpenCvCascade(legacy(node("<_>0 0 1 1 1</_>", "<threshold>0 1</threshold>"))),
    ).toThrow("<threshold> must hold one number");
    expect(() =>
      loadOpenCvCascade(
        legacy(
          node(
            "<_>0 0 1 1 1</_>",
            "<threshold>0</threshold><left_node>0</left_node><right_val>1</right_val>",
          ),
        ),
      ),
    ).toThrow("a tree split points at a missing node");
    expect(() => loadOpenCvCascade(legacy(node("<_>0 0 1 1 1</_>", "")))).toThrow(
      "has no <threshold>",
    );

    const current = (weak: string, features = "<_><rects><_>0 0 1 1 1</_></rects></_>") =>
      `<opencv_storage><cascade><stageType>BOOST</stageType><featureType>HAAR</featureType><width>4</width><height>4</height><stages><_><stageThreshold>0</stageThreshold><weakClassifiers><_>${weak}</_></weakClassifiers></_></stages><features>${features}</features></cascade></opencv_storage>`;
    expect(() =>
      loadOpenCvCascade(
        current("<internalNodes>0 -1 0</internalNodes><leafValues>0 1</leafValues>"),
      ),
    ).toThrow("<internalNodes> must hold 4 numbers per split");
    expect(() =>
      loadOpenCvCascade(current("<internalNodes></internalNodes><leafValues>0 1</leafValues>")),
    ).toThrow("<internalNodes> must hold 4 numbers per split");
    expect(() =>
      loadOpenCvCascade(
        current("<internalNodes>0 -2 0 0</internalNodes><leafValues>0 1</leafValues>"),
      ),
    ).toThrow("a leaf index is out of range");
    expect(() =>
      loadOpenCvCascade(
        current("<internalNodes>0 -1 3 0</internalNodes><leafValues>0 1</leafValues>"),
      ),
    ).toThrow("feature 3 does not exist");
    expect(() =>
      loadOpenCvCascade(
        current("<internalNodes>1 -1 0 0</internalNodes><leafValues>0 1</leafValues>"),
      ),
    ).toThrow("a tree split points at a missing node");
    expect(() => loadOpenCvCascade(legacyXml(tiny))).not.toThrow();
  });
});

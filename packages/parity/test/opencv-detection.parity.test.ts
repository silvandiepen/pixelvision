import {
  detectArucoMarkers,
  detectHaar,
  generateArucoMarker,
  loadOpenCvCascade,
  readQrCode,
} from "pixelvision";
import type { ArucoDictionaryName, Detection, HaarCascade, Matrix, Point } from "pixelvision";
import { eye } from "pixelvision/cascades/eye";
import { frontalFace } from "pixelvision/cascades/frontal-face";
import { profileFace } from "pixelvision/cascades/profile-face";
import { upperBody } from "pixelvision/cascades/upper-body";
import { beforeAll, describe, expect, it } from "vitest";
import { encodeQr, renderQr } from "../../pixelvision/src/test-qr";
import type { QrSegment } from "../../pixelvision/src/test-qr";

import {
  addNoise,
  blank,
  expectIdentical,
  cascadeToXml,
  drawFace,
  drawTexture,
  loadOpenCv,
  paintShape,
  seededRandom,
  squareCorners,
  toMat,
  withMats,
} from "../src";
import type { OpenCv } from "../src";

let cv: OpenCv;
beforeAll(async () => {
  ({ cv } = await loadOpenCv());
}, 60_000);

// ---------------------------------------------------------------------------
// Cascades
// ---------------------------------------------------------------------------

/** A box as `[x, y, width, height]`. */
type Box = [number, number, number, number];

let fileCount = 0;

/**
 * Runs OpenCV's `CascadeClassifier.detectMultiScale` with a cascade given
 * as XML text.
 *
 * @param xml - The cascade file.
 * @param image - Gray image.
 * @param scaleFactor - Scale step.
 * @param minNeighbors - OpenCV's grouping threshold (groups need more hits than this).
 * @returns OpenCV's boxes.
 */
const openCvDetect = (
  xml: string,
  image: Matrix<"u8">,
  scaleFactor: number,
  minNeighbors: number,
): Box[] => {
  const name = `cascade-${fileCount++}.xml`;
  cv.FS_createDataFile("/", name, xml, true, false, false);
  const classifier = new cv.CascadeClassifier();
  const rects = new cv.RectVector();
  const mat = toMat(cv, image);
  try {
    expect(classifier.load(name)).toBe(true);
    classifier.detectMultiScale(
      mat,
      rects,
      scaleFactor,
      minNeighbors,
      0,
      new cv.Size(0, 0),
      new cv.Size(0, 0),
    );
    return Array.from({ length: rects.size() }, (_, i) => {
      const r = rects.get(i);
      return [r.x, r.y, r.width, r.height] as Box;
    });
  } finally {
    mat.delete();
    rects.delete();
    classifier.delete();
    cv.FS_unlink(`/${name}`);
  }
};

/**
 * OpenCV's grouping test (`SimilarRects` with `GROUP_EPS` 0.2): every edge
 * of one box within 20% of the boxes' mean size of the other's.
 *
 * @param a - First box.
 * @param b - Second box.
 * @returns `true` when OpenCV would merge them.
 */
const similar = ([ax, ay, aw, ah]: Box, [bx, by, bw, bh]: Box): boolean => {
  const delta = (0.2 * (Math.min(aw, bw) + Math.min(ah, bh))) / 2;
  return (
    Math.abs(ax - bx) <= delta &&
    Math.abs(ay - by) <= delta &&
    Math.abs(ax + aw - bx - bw) <= delta &&
    Math.abs(ay + ah - by - bh) <= delta
  );
};

/**
 * Asserts that two sets of grouped detections pair up one to one, each
 * pair within OpenCV's grouping tolerance.
 *
 * @param ours - pixelvision's detections.
 * @param theirs - OpenCV's boxes.
 */
const expectSameObjects = (ours: readonly Detection[], theirs: readonly Box[]): void => {
  const boxes = ours.map((d) => [d.x, d.y, d.width, d.height] as Box);
  expect(
    boxes.length,
    `pixelvision ${JSON.stringify(boxes)}, OpenCV ${JSON.stringify(theirs)}`,
  ).toBe(theirs.length);
  for (const box of theirs) {
    expect(
      boxes.some((b) => similar(b, box)),
      `OpenCV's ${JSON.stringify(box)} has no match in ${JSON.stringify(boxes)}`,
    ).toBe(true);
  }
};

/**
 * Asserts that a box is centred on a drawn object, within 20% of its size.
 *
 * @param boxes - Detections as boxes.
 * @param x - Object centre x.
 * @param y - Object centre y.
 */
const expectFound = (boxes: readonly Box[], x: number, y: number): void => {
  expect(
    boxes.some(
      ([bx, by, bw, bh]) =>
        Math.abs(bx + bw / 2 - x) <= 0.2 * bw && Math.abs(by + bh / 2 - y) <= 0.2 * bh,
    ),
    `nothing at (${x}, ${y}) in ${JSON.stringify(boxes)}`,
  ).toBe(true);
};

/**
 * A 24 x 24 cascade that finds dark diamonds on a light background, built
 * from tilted (45°) features and a tree with two splits.
 *
 * Stage 1: a tilted feature, the diamond's ring minus three times its
 * middle, is positive for a dark middle. Stage 2: when the window's left
 * and right halves balance, the same tilted test decides; otherwise it
 * fails.
 */
const diamondCascade: HaarCascade = {
  size: [24, 24],
  tilted: true,
  complexClassifiers: [
    {
      threshold: 0.5,
      simpleClassifiers: [
        {
          features: [
            [12, 0, 12, 12, 1],
            [12, 6, 6, 6, -4],
          ],
          threshold: 0.5,
          left_val: -1,
          right_val: 1,
          tilted: 1,
        },
      ],
    },
    {
      threshold: 0.5,
      simpleClassifiers: [
        {
          features: [
            [0, 0, 12, 24, 1],
            [12, 0, 12, 24, -1],
          ],
          threshold: 0.4,
          left_val: 0,
          right_val: -1,
          left: {
            features: [
              [12, 0, 12, 12, 1],
              [12, 6, 6, 6, -4],
            ],
            threshold: 0.6,
            left_val: -1,
            right_val: 1,
            tilted: 1,
          },
        },
      ],
    },
  ],
};

/** Dark diamonds `[x, y, radius]` in the diamonds image. */
const DIAMONDS = [
  [70, 80, 20],
  [200, 150, 34],
  [262, 52, 15],
] as const;

/**
 * Light noisy background with dark diamonds (|dx| + |dy| <= r).
 *
 * @returns The image.
 */
const diamonds = (): Matrix<"u8"> => {
  const image = blank(320, 220, 205);
  for (const [cx, cy, r] of DIAMONDS) {
    paintShape(image, (x, y) => Math.abs(x - cx) + Math.abs(y - cy) <= r, 45);
  }
  addNoise(image, 6, 41);
  return image;
};

/** Centres and scales of the faces in the faces image. */
const FACES = [
  [90, 120, 0.7],
  [230, 110, 1],
] as const;

/**
 * Two drawn faces of different sizes on a noisy gray background.
 *
 * @returns The image.
 */
const faces = (): Matrix<"u8"> => {
  const image = blank(320, 240, 90);
  for (const [x, y, s] of FACES) drawFace(image, x, y, s);
  addNoise(image, 6, 3);
  return image;
};

describe("loadOpenCvCascade: the XML OpenCV reads gives the same cascade", () => {
  for (const [name, cascade] of [
    ["frontal face", frontalFace],
    ["eye", eye],
    ["profile face", profileFace],
    ["upper body (tilted)", upperBody],
    ["diamonds (tilted, two splits)", diamondCascade],
  ] as const) {
    for (const layout of ["current", "legacy"] as const) {
      it(`${name}, ${layout} layout`, () => {
        const xml = cascadeToXml(cascade, layout);
        // OpenCV accepts the file...
        const name = `check-${fileCount++}.xml`;
        cv.FS_createDataFile("/", name, xml, true, false, false);
        const classifier = new cv.CascadeClassifier();
        try {
          expect(classifier.load(name)).toBe(true);
          expect(classifier.empty()).toBe(false);
        } finally {
          classifier.delete();
          cv.FS_unlink(`/${name}`);
        }
        // ...and pixelvision reads back every number.
        const loaded = loadOpenCvCascade(xml);
        const plain = JSON.parse(
          JSON.stringify(cascade, (key, value) =>
            key === "tilted" && value === 0 ? undefined : value,
          ),
        ) as HaarCascade;
        expect(loaded.size).toEqual(cascade.size);
        expect(loaded.tilted).toBe(cascade.tilted === true);
        expect(loaded.opencvScoring).toBe(true);
        expect(loaded.complexClassifiers).toEqual(plain.complexClassifiers);
      });
    }
  }
});

describe("a loaded cascade scores a window as OpenCV does", () => {
  // On a 25 x 25 image both score exactly one window, at (0, 0) and scale 1.
  // Bisecting a one-split cascade's threshold until the window flips from
  // found to not found recovers the feature's normalised value in each.
  // OpenCV sums in single precision: the values agree within 1e-5.
  const features: [string, number, number[][]][] = [
    [
      "halves",
      0,
      [
        [0, 0, 12, 24, 1],
        [12, 0, 12, 24, -1],
      ],
    ],
    [
      "centre square",
      0,
      [
        [2, 3, 10, 8, -1],
        [4, 5, 4, 4, 5],
      ],
    ],
    [
      "three bars",
      0,
      [
        [0, 8, 24, 8, 1],
        [0, 0, 24, 24, -1],
        [6, 6, 12, 12, 2],
      ],
    ],
    [
      "tilted, on the left edge",
      1,
      [
        [12, 0, 12, 12, 1],
        [12, 6, 6, 6, -4],
      ],
    ],
    [
      "tilted, inside",
      1,
      [
        [10, 2, 6, 5, -1],
        [10, 4, 3, 2, 5],
      ],
    ],
  ];

  /**
   * The threshold at which the single window stops being found.
   *
   * @param found - Whether the window is found with a given threshold.
   * @returns The feature's value, to 1e-9.
   */
  const boundary = (found: (threshold: number) => boolean): number => {
    let lo = -20;
    let hi = 20;
    while (hi - lo > 1e-9) {
      const mid = (lo + hi) / 2;
      if (found(mid)) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  for (const seed of [9, 10]) {
    const image = blank(25, 25, 150);
    paintShape(image, (x, y) => Math.abs(x - 11) + Math.abs(y - 13) <= 7, 60);
    paintShape(image, (x, y) => x > 15 && y < 8, 220);
    addNoise(image, 12, seed);
    for (const [name, tilted, rects] of features) {
      it(`${name}, image #${seed}`, () => {
        const cascade = (threshold: number): HaarCascade => ({
          size: [24, 24],
          tilted: tilted === 1,
          complexClassifiers: [
            {
              threshold: 0,
              simpleClassifiers: [
                {
                  features: rects as unknown as [number, number, number, number, number][],
                  threshold,
                  left_val: -1,
                  right_val: 1,
                  tilted,
                },
              ],
            },
          ],
        });
        const theirs = boundary(
          (t) => openCvDetect(cascadeToXml(cascade(t), "current"), image, 1.1, 0).length > 0,
        );
        const ours = boundary(
          (t) =>
            detectHaar(image, loadOpenCvCascade(cascadeToXml(cascade(t), "current")), {
              minNeighbors: 0,
              edgeDensity: false,
            }).length > 0,
        );

        expect(Math.abs(theirs)).toBeGreaterThan(1e-3);
        expect(Math.abs(ours - theirs)).toBeLessThanOrEqual(1e-5 * Math.max(1, Math.abs(theirs)));
      });
    }
  }
});

describe("detectHaar with a loaded cascade matches CascadeClassifier.detectMultiScale", () => {
  // detectHaar scales the features and OpenCV the image, so their raw hits
  // differ; the grouped detections must pair up within OpenCV's own
  // grouping tolerance (GROUP_EPS 0.2). OpenCV keeps groups with more than
  // minNeighbors hits, pixelvision with at least minNeighbors.
  for (const layout of ["current", "legacy"] as const) {
    it(`finds the same drawn faces (frontal-face cascade, ${layout} layout)`, () => {
      const image = faces();
      const xml = cascadeToXml(frontalFace, layout);
      const theirs = openCvDetect(xml, image, 1.1, 3);
      const ours = detectHaar(image, loadOpenCvCascade(xml), {
        scaleFactor: 1.1,
        minNeighbors: 4,
        edgeDensity: false,
      });

      expectSameObjects(ours, theirs);
      for (const [x, y] of FACES) {
        expectFound(theirs, x, y);
        expectFound(
          ours.map((d) => [d.x, d.y, d.width, d.height]),
          x,
          y,
        );
      }
    });

    it(`finds the same diamonds (tilted features, two-split tree, ${layout} layout)`, () => {
      const image = diamonds();
      const xml = cascadeToXml(diamondCascade, layout);
      for (const scaleFactor of [1.1, 1.25]) {
        const theirs = openCvDetect(xml, image, scaleFactor, 2);
        const ours = detectHaar(image, loadOpenCvCascade(xml), {
          scaleFactor,
          minNeighbors: 3,
          edgeDensity: false,
        });

        expectSameObjects(ours, theirs);
        for (const [x, y] of DIAMONDS) expectFound(theirs, x, y);
      }
    });
  }

  it("finds nothing where OpenCV finds nothing", () => {
    const image = blank(200, 160, 128);
    addNoise(image, 20, 5);
    const xml = cascadeToXml(diamondCascade, "current");

    expect(openCvDetect(xml, image, 1.1, 2)).toEqual([]);
    expect(
      detectHaar(image, loadOpenCvCascade(xml), {
        scaleFactor: 1.1,
        minNeighbors: 3,
        edgeDensity: false,
      }),
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// ArUco markers
// ---------------------------------------------------------------------------

const DICTIONARIES: [ArucoDictionaryName, string, number, number][] = [
  ["4x4_50", "DICT_4X4_50", 4, 50],
  ["6x6_250", "DICT_6X6_250", 6, 250],
];

/**
 * Draws a marker with OpenCV's `generateImageMarker`.
 *
 * @param dictionary - OpenCV dictionary constant name.
 * @param id - Marker id.
 * @param size - Image size.
 * @param borderBits - Border width in cells.
 * @returns The marker's pixels.
 */
const openCvMarker = (
  dictionary: string,
  id: number,
  size: number,
  borderBits: number,
): Uint8Array => {
  const dict = cv.getPredefinedDictionary(cv[dictionary]);
  const image = new cv.Mat();
  try {
    dict.generateImageMarker(id, size, image, borderBits);
    return Uint8Array.from(image.data);
  } finally {
    image.delete();
    dict.delete();
  }
};

/** A marker placed in a scene. */
interface Placed {
  id: number;
  corners: Point[];
}

/**
 * Draws a scene: a light gradient (the paper), markers from OpenCV's
 * generator turned and tilted in perspective, then noise.
 *
 * @param dictionary - Dictionary row of {@link DICTIONARIES}.
 * @param seed - Scene seed.
 * @returns The image and where each marker went.
 */
const markerScene = (
  [, cvName, n, count]: (typeof DICTIONARIES)[number],
  seed: number,
): { image: Matrix<"u8">; placed: Placed[] } => {
  const random = seededRandom(seed);
  const image = blank(320, 240, 0);
  for (let y = 0; y < 240; y++) {
    for (let x = 0; x < 320; x++)
      image.data[y * 320 + x] = Math.round(160 + 50 * (x / 320) + 20 * (y / 240));
  }
  const placed: Placed[] = [];
  const ids = new Set<number>();
  for (const [cx, cy] of [
    [80, 60],
    [240, 60],
    [80, 180],
    [240, 180],
  ]) {
    if (random() < 0.15) continue;
    let id = Math.floor(random() * count);
    while (ids.has(id)) id = (id + 1) % count;
    ids.add(id);
    const size = 44 + random() * 30;
    const angle = random() * 360;
    const tilt = random() * 0.3;
    const x = cx + (random() - 0.5) * 16;
    const y = cy + (random() - 0.5) * 12;
    const pixels = openCvMarker(cvName, id, n + 2, 1);
    const corners = squareCorners(x, y, size, angle, tilt);
    drawTexture(image, corners, (u, v) =>
      pixels[Math.floor(v * (n + 2)) * (n + 2) + Math.floor(u * (n + 2))] ? 230 : 30,
    );
    placed.push({ id, corners });
  }
  addNoise(image, 3 + random() * 5, seed);
  return { image, placed };
};

/**
 * Runs OpenCV's `ArucoDetector` with its default parameters.
 *
 * @param image - Gray image.
 * @param dictionary - OpenCV dictionary constant name.
 * @returns Markers by id, corners as `[x, y]` pairs.
 */
const openCvMarkers = (
  image: Matrix<"u8">,
  dictionary: string,
): { id: number; corners: number[][] }[] => {
  const dict = cv.getPredefinedDictionary(cv[dictionary]);
  const parameters = new cv.aruco_DetectorParameters();
  const refine = new cv.aruco_RefineParameters(10, 3, true);
  const detector = new cv.aruco_ArucoDetector(dict, parameters, refine);
  const corners = new cv.MatVector();
  const rejected = new cv.MatVector();
  const ids = new cv.Mat();
  const mat = toMat(cv, image);
  return withMats([dict, parameters, refine, detector, corners, rejected, ids, mat], () => {
    detector.detectMarkers(mat, corners, ids, rejected);
    const found = Array.from({ length: ids.rows }, (_, i) => {
      const quad = corners.get(i);
      const values = Array.from(quad.data32F as Float32Array);
      quad.delete();
      return {
        id: ids.data32S[i] as number,
        corners: [0, 1, 2, 3].map((k) => values.slice(k * 2, k * 2 + 2)),
      };
    });
    return found.sort((a, b) => a.id - b.id);
  });
};

describe("ArUco dictionaries match OpenCV's", () => {
  for (const [name, cvName, n, count] of DICTIONARIES) {
    it(`${name}: every marker at all four rotations`, () => {
      const dict = cv.getPredefinedDictionary(cv[cvName]);
      try {
        expect(dict.markerSize).toBe(n);
        expect(dict.bytesList.rows).toBe(count);
        // OpenCV stores each marker's bytes for 0-3 quarter turns, one after another.
        const bytes = Uint8Array.from(dict.bytesList.data as Uint8Array);
        // generateArucoMarker draws the unrotated bits; read them back at every rotation.
        for (let id = 0; id < count; id++) {
          const marker = generateArucoMarker(id, { dictionary: name, size: n + 2 });
          const bit = (r: number, c: number) => (marker.data[(r + 1) * (n + 2) + c + 1] ? 1 : 0);
          const turns = [
            bit,
            (r: number, c: number) => bit(c, n - 1 - r),
            (r: number, c: number) => bit(n - 1 - r, n - 1 - c),
            (r: number, c: number) => bit(n - 1 - c, r),
          ];
          const byteCount = (n * n + 7) >> 3;
          turns.forEach((turn, rotation) => {
            const packed: number[] = [];
            let byte = 0;
            let bits = 0;
            for (let r = 0; r < n; r++) {
              for (let c = 0; c < n; c++) {
                byte = (byte << 1) | turn(r, c);
                if (++bits % 8 === 0) {
                  packed.push(byte);
                  byte = 0;
                }
              }
            }
            if (bits % 8) packed.push(byte);
            const start = (id * 4 + rotation) * byteCount;
            expect(packed).toEqual(Array.from(bytes.subarray(start, start + byteCount)));
          });
        }
      } finally {
        dict.delete();
      }
    });
  }
});

describe("generateArucoMarker matches Dictionary.generateImageMarker", () => {
  for (const [name, cvName, n, count] of DICTIONARIES) {
    for (const size of [n + 2, 50, 61, 100, 123]) {
      for (const borderBits of [1, 2]) {
        if (size < n + 2 * borderBits) continue;
        it(`${name}, ${size} px, border ${borderBits}`, () => {
          for (const id of [0, 1, 7, 23, count - 1]) {
            const ours = generateArucoMarker(id, { dictionary: name, size, borderBits });
            expect(ours.width).toBe(size);
            expectIdentical(ours.data, openCvMarker(cvName, id, size, borderBits), size * size);
          }
        });
      }
    }
  }
});

describe("detectArucoMarkers matches ArucoDetector.detectMarkers", () => {
  // Ids and corners must be identical. Corners aren't refined (OpenCV's
  // default CORNER_REFINE_NONE): they are pixels of the marker's outline
  // that the polygon simplification keeps, within 2.5 pixels of the drawn
  // corners, or (on an obtuse corner of a strongly tilted marker, where the
  // vertex can slide along the edge) within its tolerance, 3% of the
  // perimeter.
  for (const dictionary of DICTIONARIES) {
    for (let seed = 1; seed <= 12; seed++) {
      it(`${dictionary[0]}, scene #${seed}`, () => {
        const { image, placed } = markerScene(dictionary, seed * 7 + dictionary[2]);
        const theirs = openCvMarkers(image, dictionary[1]);
        const ours = detectArucoMarkers(image, { dictionary: dictionary[0] });

        expect(ours.map((m) => m.id)).toEqual(theirs.map((m) => m.id));
        expect(ours.map((m) => m.corners.map((c) => [c.x, c.y]))).toEqual(
          theirs.map((m) => m.corners),
        );
        // Ground truth: every drawn marker is found, at its drawn corners.
        expect(ours.map((m) => m.id)).toEqual(placed.map((p) => p.id).sort((a, b) => a - b));
        for (const marker of ours) {
          const truth = placed.find((p) => p.id === marker.id)!.corners;
          const perimeter = truth.reduce(
            (sum, p, k) => sum + Math.hypot(p.x - truth[(k + 1) % 4].x, p.y - truth[(k + 1) % 4].y),
            0,
          );
          marker.corners.forEach((corner, k) => {
            expect(
              Math.hypot(corner.x - truth[k].x, corner.y - truth[k].y),
              `marker ${marker.id} corner ${k}`,
            ).toBeLessThanOrEqual(Math.max(2.5, 0.03 * perimeter));
          });
        }
      });
    }
  }

  it("finds a marker on a card whose edge runs close to it, which OpenCV loses", () => {
    // A marker on a white card 1.3-1.45 times its size, turned 20°, on a
    // darker table. OpenCV.js 4.12 returns it neither as a marker nor as a
    // rejected candidate; with a larger card, or the card square to the
    // image, it finds it. pixelvision finds it in every case.
    const pixels = openCvMarker("DICT_4X4_50", 3, 6, 1);
    const texture = (u: number, v: number) =>
      pixels[Math.floor(v * 6) * 6 + Math.floor(u * 6)] ? 230 : 30;
    for (const [card, angle, theyFind] of [
      [1.3, 20, false],
      [1.45, 20, false],
      [1.45, 0, true],
      [1.6, 20, true],
    ] as const) {
      const image = blank(320, 240, 150);
      drawTexture(image, squareCorners(80, 60, 60 * card, angle), () => 235);
      const corners = squareCorners(80, 60, 60, angle);
      drawTexture(image, corners, texture);
      addNoise(image, 3, 1);

      expect(openCvMarkers(image, "DICT_4X4_50").length, `card ${card}, ${angle}°`).toBe(
        theyFind ? 1 : 0,
      );
      const ours = detectArucoMarkers(image);
      expect(ours.map((m) => m.id)).toEqual([3]);
      ours[0].corners.forEach((corner, k) => {
        expect(Math.hypot(corner.x - corners[k].x, corner.y - corners[k].y)).toBeLessThanOrEqual(
          2.5,
        );
      });
    }
  });

  it("finds no markers in noise, like OpenCV", () => {
    const image = blank(200, 160, 128);
    addNoise(image, 40, 3);
    expect(openCvMarkers(image, "DICT_4X4_50")).toEqual([]);
    expect(detectArucoMarkers(image)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// QR codes
// ---------------------------------------------------------------------------

/**
 * Runs OpenCV's `QRCodeDetector.detectAndDecode`.
 *
 * @param image - Gray image.
 * @returns The text ("" when not decoded) and corners as `[x, y]` pairs.
 */
const openCvQr = (image: Matrix<"u8">): { text: string; corners: number[][] } => {
  const detector = new cv.QRCodeDetector();
  const mat = toMat(cv, image);
  const points = new cv.Mat();
  const straight = new cv.Mat();
  return withMats([detector, mat, points, straight], () => {
    const text = detector.detectAndDecode(mat, points, straight) as string;
    const values = Array.from((points.data32F ?? []) as Float32Array);
    return { text, corners: [0, 1, 2, 3].map((k) => values.slice(k * 2, k * 2 + 2)) };
  });
};

/** One QR scene: what was encoded and how it was drawn. */
interface QrScene {
  name: string;
  text: string;
  segments: QrSegment[] | string;
  version: number;
  level: "L" | "M" | "Q" | "H";
  mask: number;
  angle: number;
  tilt: number;
  side: number;
  noise: number;
}

const QR_TEXTS: [string, QrSegment[] | string][] = [
  ["https://pixelvision.dev/qr", "https://pixelvision.dev/qr"],
  ["HELLO WORLD 2026", [{ mode: "alphanumeric", text: "HELLO WORLD 2026" }]],
  ["31415926535897", [{ mode: "numeric", text: "31415926535897" }]],
  [
    "ORDER 66: 0042 items",
    [
      { mode: "alphanumeric", text: "ORDER 66" },
      { mode: "byte", bytes: Array.from(new TextEncoder().encode(": ")) },
      { mode: "numeric", text: "0042" },
      { mode: "byte", bytes: Array.from(new TextEncoder().encode(" items")) },
    ],
  ],
  ["Grüße, 世界", "Grüße, 世界"],
];

/** Seeded scenes: every version and level, all masks, any rotation, perspective and noise. */
const QR_SCENES: QrScene[] = (() => {
  const random = seededRandom(2026);
  const scenes: QrScene[] = [];
  for (let k = 0; k < 48; k++) {
    const version = (k % 10) + 1;
    const level = (["L", "M", "Q", "H"] as const)[Math.floor(k / 10) % 4];
    const [text, segments] = QR_TEXTS[k % QR_TEXTS.length];
    // Version 1 holds 7 to 17 bytes: give it a short text.
    const short = version === 1 || (version === 2 && level === "H");
    scenes.push({
      name: `#${k} v${version}-${level}`,
      text: short ? `QR${k}` : text,
      segments: short ? `QR${k}` : segments,
      version,
      level,
      mask: Math.floor(random() * 8),
      angle: random() * 360,
      tilt: random() * 0.22,
      side: 210 + random() * 110,
      noise: random() * 8,
    });
  }
  return scenes;
})();

describe("readQrCode matches QRCodeDetector.detectAndDecode", () => {
  // OpenCV.js 4.12 has QRCodeDetector but no QRCodeEncoder: the codes come
  // from the test encoder, which OpenCV reads too. Texts must be identical.
  // OpenCV's top-left, top-right and bottom-left corners come from the
  // finder patterns and agree with pixelvision's within 3 pixels; its
  // bottom-right corner is extrapolated and can be up to 10 pixels off the
  // drawn corner. pixelvision fits all four to the whole symbol: every
  // corner is within 2.5 pixels of the drawn one.
  const misses: string[] = [];
  for (const scene of QR_SCENES) {
    it(scene.name, () => {
      const symbol = encodeQr(scene.segments, scene);
      const { image, symbol: drawn } = renderQr(symbol, {
        width: 400,
        height: 400,
        corners: squareCorners(200, 200, scene.side, scene.angle, scene.tilt),
        background: 110,
      });
      addNoise(image, scene.noise, scene.version * 100 + scene.mask);
      const ours = readQrCode(image);
      const theirs = openCvQr(image);

      expect(ours?.text).toBe(scene.text);
      expect(ours?.version).toBe(scene.version);
      expect(ours?.errorCorrectionLevel).toBe(scene.level);
      ours!.corners.forEach((corner, k) => {
        expect(
          Math.hypot(corner.x - drawn[k].x, corner.y - drawn[k].y),
          `corner ${k}`,
        ).toBeLessThanOrEqual(2.5);
      });
      if (theirs.text === "") {
        misses.push(scene.name);
        return;
      }
      expect(theirs.text).toBe(ours!.text);
      ours!.corners.forEach((corner, k) => {
        const [x, y] = theirs.corners[k];
        expect(Math.hypot(corner.x - x, corner.y - y), `corner ${k}`).toBeLessThanOrEqual(
          k === 2 ? 11 : 3,
        );
      });
    });
  }

  it("OpenCV reads all but three of the codes pixelvision reads", () => {
    // OpenCV.js 4.12 decodes nothing from these three (two tilted version 9
    // codes and a version 5 one); pixelvision reads all 48.
    expect(misses).toEqual(["#24 v5-Q", "#28 v9-Q", "#38 v9-H"]);
  });

  for (const [version, level, stain] of [
    [2, "H", 0.3],
    [3, "Q", 0.22],
    [4, "H", 0.28],
    [5, "Q", 0.2],
    [6, "H", 0.25],
    [7, "M", 0.14],
  ] as const) {
    it(`corrects a stained version ${version}-${level} code`, () => {
      // A gray stain over part of the data: Reed-Solomon must restore it.
      const text = "stain test 012";
      const symbol = encodeQr(text, { version, level, mask: version % 8 });
      const { image, symbol: drawn } = renderQr(symbol, {
        width: 400,
        height: 400,
        corners: squareCorners(200, 200, 280, 10 * version, 0.08),
      });
      const toImage = (u: number, v: number) => ({
        x: drawn[0].x + u * (drawn[1].x - drawn[0].x) + v * (drawn[3].x - drawn[0].x),
        y: drawn[0].y + u * (drawn[1].y - drawn[0].y) + v * (drawn[3].y - drawn[0].y),
      });
      const [a, b] = [0.42, 0.42 + stain];
      drawTexture(
        image,
        [toImage(a, 0.35), toImage(b, 0.35), toImage(b, 0.6), toImage(a, 0.6)],
        () => 60,
      );

      const theirs = openCvQr(image);
      const ours = readQrCode(image);
      expect(ours?.text).toBe(text);
      expect(theirs.text).toBe(text);
    });
  }

  it("reads a clean code that OpenCV doesn't find", () => {
    // A valid version 1-M code, drawn square on: OpenCV's detect() finds no
    // code in it (a long dark run in row 12 is the only unusual thing).
    const symbol = encodeQr("v1M short", { version: 1, level: "M", mask: 0 });
    const { image, symbol: drawn } = renderQr(symbol, {
      width: 400,
      height: 400,
      corners: squareCorners(200, 200, 300, 0),
    });
    expect(openCvQr(image).text).toBe("");
    const ours = readQrCode(image);
    expect(ours?.text).toBe("v1M short");
    ours!.corners.forEach((corner, k) => {
      expect(Math.hypot(corner.x - drawn[k].x, corner.y - drawn[k].y)).toBeLessThanOrEqual(1);
    });
  });

  it("finds no code in noise, like OpenCV", () => {
    const image = blank(300, 300, 128);
    addNoise(image, 40, 7);
    expect(openCvQr(image).text).toBe("");
    expect(readQrCode(image)).toBeNull();
  });
});

import type { HaarCascade, HaarStage, HaarTree } from "./haar.model";
import type { CascadeFeature, CascadeNode } from "./opencvCascade.model";
import { parseXml } from "./xml";
import type { XmlElement } from "./xml.model";

const NAME = "loadOpenCvCascade";

/**
 * Finds a required child element.
 *
 * @param element - Parent element.
 * @param name - Child tag name.
 * @returns The first child with that name.
 * @throws {SyntaxError} When there is none.
 */
const child = (element: XmlElement, name: string): XmlElement => {
  const found = optionalChild(element, name);
  if (!found) throw new SyntaxError(`${NAME}: <${element.name}> has no <${name}>`);
  return found;
};

/**
 * Finds an optional child element.
 *
 * @param element - Parent element.
 * @param name - Child tag name.
 * @returns The first child with that name, or `undefined`.
 */
const optionalChild = (element: XmlElement, name: string): XmlElement | undefined =>
  element.children.find((c) => c.name === name);

/**
 * Reads the whitespace-separated numbers of an element.
 *
 * @param element - Element whose text is a list of numbers.
 * @returns The numbers.
 * @throws {SyntaxError} When a value isn't a finite number.
 */
const numbers = (element: XmlElement): number[] =>
  element.text
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const value = Number(token);
      if (!Number.isFinite(value)) {
        throw new SyntaxError(`${NAME}: <${element.name}> holds "${token}", not a number`);
      }
      return value;
    });

/**
 * Reads a single number.
 *
 * @param element - Parent element.
 * @param name - Child tag name.
 * @returns The child's number.
 * @throws {SyntaxError} When the child is missing or doesn't hold exactly one number.
 */
const number = (element: XmlElement, name: string): number => {
  const values = numbers(child(element, name));
  if (values.length !== 1) throw new SyntaxError(`${NAME}: <${name}> must hold one number`);
  return values[0];
};

/**
 * Reads a Haar feature: its weighted rectangles and whether it is tilted.
 *
 * @param feature - A `<feature>` (old format) or a `<features>` item (new format).
 * @returns The feature.
 * @throws {SyntaxError} When a rectangle isn't `x y width height weight`.
 */
const readFeature = (feature: XmlElement): CascadeFeature => {
  const rects = child(feature, "rects").children.map((rect) => {
    const values = numbers(rect);
    if (values.length !== 5) {
      throw new SyntaxError(`${NAME}: a rectangle must be "x y width height weight"`);
    }
    return values as unknown as readonly [number, number, number, number, number];
  });
  const tilted = optionalChild(feature, "tilted");
  return { rects, tilted: tilted !== undefined && numbers(tilted)[0] !== 0 };
};

/**
 * Turns a split and its subtrees into a {@link HaarTree}.
 *
 * @param nodes - Every split of the tree.
 * @param index - The split to convert.
 * @returns The tree rooted at that split.
 */
const toTree = (nodes: readonly CascadeNode[], index: number): HaarTree => {
  const node = nodes[index];
  const tree: HaarTree = {
    features: node.feature.rects,
    threshold: node.threshold,
    left_val: typeof node.left === "number" ? node.left : 0,
    right_val: typeof node.right === "number" ? node.right : 0,
  };
  if (node.feature.tilted) tree.tilted = 1;
  if (typeof node.left !== "number") tree.left = toTree(nodes, node.left.node);
  if (typeof node.right !== "number") tree.right = toTree(nodes, node.right.node);
  return tree;
};

/**
 * Checks that every split points at an existing, later split, so the tree
 * can't loop.
 *
 * @param nodes - The splits of one tree.
 * @throws {SyntaxError} When a split points backwards or past the end.
 */
const checkTree = (nodes: readonly CascadeNode[]): void => {
  nodes.forEach((node, i) => {
    for (const branch of [node.left, node.right]) {
      if (typeof branch !== "number" && !(branch.node > i && branch.node < nodes.length)) {
        throw new SyntaxError(`${NAME}: a tree split points at a missing node`);
      }
    }
  });
};

/**
 * Reads the current format (`<cascade type_id="opencv-cascade-classifier">`,
 * written by `opencv_traincascade` and OpenCV 3 and later).
 *
 * @param cascade - The `<cascade>` element.
 * @returns The cascade.
 * @throws {SyntaxError} When the cascade isn't a boosted HAAR cascade or is malformed.
 */
const readCurrent = (cascade: XmlElement): HaarCascade => {
  const stageType = optionalChild(cascade, "stageType")?.text ?? "BOOST";
  if (stageType.toUpperCase() !== "BOOST") {
    throw new SyntaxError(`${NAME}: stage type ${stageType} is not supported, only BOOST`);
  }
  const featureType = child(cascade, "featureType").text;
  if (featureType.toUpperCase() !== "HAAR") {
    throw new SyntaxError(
      `${NAME}: ${featureType} cascades are not supported, only HAAR (detectHaar runs Haar features)`,
    );
  }
  const features = child(cascade, "features").children.map(readFeature);
  let tilted = false;
  const complexClassifiers: HaarStage[] = child(cascade, "stages").children.map((stage) => ({
    threshold: number(stage, "stageThreshold"),
    simpleClassifiers: child(stage, "weakClassifiers").children.map((weak) => {
      const values = numbers(child(weak, "internalNodes"));
      const leaves = numbers(child(weak, "leafValues"));
      if (values.length === 0 || values.length % 4 !== 0) {
        throw new SyntaxError(`${NAME}: <internalNodes> must hold 4 numbers per split`);
      }
      // A branch above 0 is another split; 0 or below is the leaf at -branch.
      const branch = (value: number) => {
        if (value > 0) return { node: value };
        if (-value >= leaves.length) throw new SyntaxError(`${NAME}: a leaf index is out of range`);
        return leaves[-value];
      };
      const nodes: CascadeNode[] = [];
      for (let i = 0; i < values.length; i += 4) {
        const feature = features[values[i + 2]];
        if (!feature) throw new SyntaxError(`${NAME}: feature ${values[i + 2]} does not exist`);
        tilted ||= feature.tilted;
        nodes.push({
          feature,
          threshold: values[i + 3],
          left: branch(values[i]),
          right: branch(values[i + 1]),
        });
      }
      checkTree(nodes);
      return toTree(nodes, 0);
    }),
  }));
  return {
    size: [number(cascade, "width"), number(cascade, "height")],
    tilted,
    opencvScoring: true,
    complexClassifiers,
  };
};

/**
 * Reads the format of OpenCV 1 and 2 (`type_id="opencv-haar-classifier"`,
 * written by `opencv_haartraining`).
 *
 * @param cascade - The cascade element.
 * @returns The cascade.
 * @throws {SyntaxError} When the cascade is a tree of stages or is malformed.
 */
const readLegacy = (cascade: XmlElement): HaarCascade => {
  const size = numbers(child(cascade, "size"));
  if (size.length !== 2) throw new SyntaxError(`${NAME}: <size> must be "width height"`);
  let tilted = false;
  const complexClassifiers: HaarStage[] = child(cascade, "stages").children.map((stage, s) => {
    const parent = optionalChild(stage, "parent");
    const next = optionalChild(stage, "next");
    if ((parent && numbers(parent)[0] !== s - 1) || (next && numbers(next)[0] !== -1)) {
      throw new SyntaxError(
        `${NAME}: cascades whose stages form a tree (such as *_alt_tree) are not supported`,
      );
    }
    return {
      threshold: number(stage, "stage_threshold"),
      simpleClassifiers: child(stage, "trees").children.map((tree) => {
        const nodes: CascadeNode[] = tree.children.map((node) => {
          const feature = readFeature(child(node, "feature"));
          tilted ||= feature.tilted;
          const branch = (side: "left" | "right") => {
            const split = optionalChild(node, `${side}_node`);
            return split ? { node: number(node, `${side}_node`) } : number(node, `${side}_val`);
          };
          return {
            feature,
            threshold: number(node, "threshold"),
            left: branch("left"),
            right: branch("right"),
          };
        });
        if (!nodes.length) throw new SyntaxError(`${NAME}: a tree has no splits`);
        checkTree(nodes);
        return toTree(nodes, 0);
      }),
    };
  });
  return { size: [size[0], size[1]], tilted, opencvScoring: true, complexClassifiers };
};

/**
 * Reads an OpenCV HAAR cascade (`haarcascade_*.xml`) for {@link detectHaar}.
 * Both of OpenCV's XML layouts are understood: the current one
 * (`opencv_traincascade`, OpenCV 3 and later) and the older
 * `opencv-haar-classifier` one, including tilted (45°) features and trees
 * with more than one split. The XML is read by a small built-in reader, so
 * nothing else is needed.
 *
 * The cascade is marked to be scored as OpenCV scores it (see
 * {@link HaarCascade.opencvScoring}). `detectHaar` scales the features
 * rather than the image, so its raw hits differ from OpenCV's
 * `detectMultiScale`; the merged detections agree within OpenCV's grouping
 * tolerance.
 *
 * @param xml - Contents of the XML file.
 * @returns The cascade, ready for {@link detectHaar}.
 * @throws {SyntaxError} When the text isn't well-formed XML, isn't an OpenCV
 *   `opencv_storage` cascade, or is a kind detectHaar can't run: LBP or HOG
 *   features, or stages that form a tree (`*_alt_tree.xml`).
 *
 * @example
 * const xml = await (await fetch("/haarcascade_frontalface_default.xml")).text();
 * const faces = detectHaar(equalizeHistogram(gray), loadOpenCvCascade(xml));
 */
export function loadOpenCvCascade(xml: string): HaarCascade {
  const root = parseXml(xml);
  if (root.name !== "opencv_storage") {
    throw new SyntaxError(`${NAME}: expected an OpenCV <opencv_storage> file, got <${root.name}>`);
  }
  const cascade = root.children[0];
  if (!cascade) throw new SyntaxError(`${NAME}: <opencv_storage> is empty`);
  const type = cascade.attributes.type_id;
  if (type === "opencv-cascade-classifier" || optionalChild(cascade, "stageType")) {
    return readCurrent(cascade);
  }
  if (type === "opencv-haar-classifier" || optionalChild(cascade, "size")) {
    return readLegacy(cascade);
  }
  throw new SyntaxError(`${NAME}: <${cascade.name}> is not an OpenCV cascade classifier`);
}

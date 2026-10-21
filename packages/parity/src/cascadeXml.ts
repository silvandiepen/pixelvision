import type { HaarCascade, HaarTree } from "pixelvision";

/**
 * Lists a tree's splits in the order OpenCV's current layout numbers them:
 * depth first, root at 0.
 *
 * @param tree - Root split.
 * @returns Every split of the tree.
 */
const splits = (tree: HaarTree): HaarTree[] => [
  tree,
  ...(tree.left ? splits(tree.left) : []),
  ...(tree.right ? splits(tree.right) : []),
];

/**
 * Writes a cascade as OpenCV's XML, so OpenCV's `CascadeClassifier` and
 * `loadOpenCvCascade` can read the same file.
 *
 * @param cascade - The cascade (trees may have several splits).
 * @param layout - `"current"` (`opencv-cascade-classifier`) or `"legacy"`
 *   (`opencv-haar-classifier`).
 * @returns The XML text.
 */
export const cascadeToXml = (cascade: HaarCascade, layout: "current" | "legacy"): string => {
  const rects = (tree: HaarTree) =>
    `<rects>${tree.features.map((r) => `<_>${r.join(" ")}</_>`).join("")}</rects><tilted>${tree.tilted ?? 0}</tilted>`;

  if (layout === "legacy") {
    const stages = cascade.complexClassifiers.map((stage, s) => {
      const trees = stage.simpleClassifiers.map((tree) => {
        const nodes = splits(tree);
        const branch = (node: HaarTree | undefined, value: number, side: string) =>
          node
            ? `<${side}_node>${nodes.indexOf(node)}</${side}_node>`
            : `<${side}_val>${value}</${side}_val>`;
        return `<_>${nodes
          .map(
            (n) =>
              `<_><feature>${rects(n)}</feature><threshold>${n.threshold}</threshold>` +
              `${branch(n.left, n.left_val, "left")}${branch(n.right, n.right_val, "right")}</_>`,
          )
          .join("")}</_>`;
      });
      return `<_><trees>${trees.join("")}</trees><stage_threshold>${stage.threshold}</stage_threshold><parent>${s - 1}</parent><next>-1</next></_>`;
    });
    return `<?xml version="1.0"?>
<opencv_storage>
<cascade_test type_id="opencv-haar-classifier"><size>${cascade.size.join(" ")}</size><stages>${stages.join("")}</stages></cascade_test>
</opencv_storage>
`;
  }

  const features: HaarTree[] = [];
  let maxWeak = 0;
  const stages = cascade.complexClassifiers.map((stage) => {
    maxWeak = Math.max(maxWeak, stage.simpleClassifiers.length);
    const weak = stage.simpleClassifiers.map((tree) => {
      const nodes = splits(tree);
      const leaves: number[] = [];
      const branch = (node: HaarTree | undefined, value: number) => {
        if (node) return nodes.indexOf(node);
        leaves.push(value);
        return -(leaves.length - 1);
      };
      const internal = nodes.map((n) => {
        features.push(n);
        return `${branch(n.left, n.left_val)} ${branch(n.right, n.right_val)} ${features.length - 1} ${n.threshold}`;
      });
      return `<_><internalNodes>${internal.join(" ")}</internalNodes><leafValues>${leaves.join(" ")}</leafValues></_>`;
    });
    return `<_><maxWeakCount>${weak.length}</maxWeakCount><stageThreshold>${stage.threshold}</stageThreshold><weakClassifiers>${weak.join("")}</weakClassifiers></_>`;
  });
  return `<?xml version="1.0"?>
<opencv_storage>
<cascade type_id="opencv-cascade-classifier"><stageType>BOOST</stageType><featureType>HAAR</featureType>
<height>${cascade.size[1]}</height><width>${cascade.size[0]}</width>
<stageParams><maxWeakCount>${maxWeak}</maxWeakCount></stageParams>
<featureParams><maxCatCount>0</maxCatCount></featureParams>
<stageNum>${stages.length}</stageNum><stages>${stages.join("")}</stages>
<features>${features.map((f) => `<_>${rects(f)}</_>`).join("")}</features></cascade>
</opencv_storage>
`;
};

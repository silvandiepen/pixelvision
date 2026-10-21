import { defineExample } from "../define";
import { demo } from "./demo";
import type { DocumentTrackerDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const documentTrackerExample = defineExample<DocumentTrackerDemoOptions>({
  slug: "document-tracker",
  title: "createDocumentTracker",
  functions: ["createDocumentTracker"],
  category: "detection",
  description:
    'Turns `findDocument` results from a camera into a calm outline and a "held still" signal, so a hand-held document can be captured.',
  howItWorks: [
    "Each corner is the median of the last 5 detections, so a few pixels of wobble don't make the outline jump. A detection with a corner further than 12% of the document's diagonal from the outline is set aside, and only becomes the outline once it repeats 3 times. Up to 4 frames without a detection keep the outline.",
    "Each detection that agrees with the outline to within 5% of the diagonal adds to `progress`; one that doesn't takes away twice as much. At 8 the status is `steady`: capture then. Progress fills and drains gradually, so it can drive a progress ring.",
    "This demo plays 30 frames of a hand-held card over the desk sample: every detection wobbles, frames 5 and 10 find nothing and frame 7 finds the wrong shape. The table compares the old rule of 8 detections in a row, each corner within 6 pixels of the last.",
  ],
  howToTest:
    "With 4 px of wobble, the tracker must be steady within 15 frames despite the missed and wrong frames, and its outline must be within 3 px of the card the sample drew. The old rule needs 8 clean frames in a row, so it captures later or never.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "wobble",
      label: "Wobble",
      description: "How far each detected corner wanders, in pixels.",
      min: 0,
      max: 10,
      step: 1,
      default: 4,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "steadyAt", label: "Steady within 15 frames", min: 1, max: 15 },
    { key: "outlineError", label: "Outline within 3 px of the card", max: 3 },
  ],
});

import type { Example } from "../../examples/example.model";

export interface LiveEffectsProps {
  example: Example;
}

/** What is being dragged: an effect from the palette, or a layer of the stack. */
export type DragItem = { kind: "effect"; id: string } | { kind: "layer"; index: number };

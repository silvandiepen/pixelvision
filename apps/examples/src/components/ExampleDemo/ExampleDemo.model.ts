import type { Example } from "../../examples/example.model";

export interface ExampleDemoProps {
  example: Example;
}

/** Where the input image comes from. */
export type InputSource = "sample" | "upload" | "webcam";

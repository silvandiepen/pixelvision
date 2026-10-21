import type { Example, ExampleCategory } from "../../examples/example.model";

/** One section of the overview. */
export interface GallerySection {
  category: ExampleCategory;
  title: string;
  examples: Example[];
}

import type { Point } from "pixelvision";

export interface ExtractDocumentDemoOptions {
  corners: Point[];
  aspect: "auto" | "id-card" | "a4";
}

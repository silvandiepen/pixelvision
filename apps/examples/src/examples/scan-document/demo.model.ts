/** Proportions to straighten to. */
export type DocumentAspect = "auto" | "id-card" | "a4";

export interface ScanDocumentDemoOptions {
  aspect: DocumentAspect;
}

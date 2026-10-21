import { findDocument } from "pixelvision";
import type { FindDocumentOptions } from "pixelvision";
import type { DocumentFinder } from "./source.model";

/**
 * The document finder on the main thread: pixelvision's `findDocument`.
 *
 * @param options - `findDocument` options.
 * @returns The finder.
 *
 * @example
 * scanner.finder = mainThreadDocumentFinder({ minArea: 0.2 });
 */
export function mainThreadDocumentFinder(options: FindDocumentOptions = {}): DocumentFinder {
  return { find: (frame) => findDocument(frame, options) };
}

/** One element of a parsed XML document. */
export interface XmlElement {
  /** Tag name, e.g. `"opencv_storage"`. */
  name: string;
  /** Attributes by name, with entities decoded. */
  attributes: Record<string, string>;
  /** Child elements, in document order. */
  children: XmlElement[];
  /** The element's own text (outside its children), entities decoded, trimmed. */
  text: string;
}

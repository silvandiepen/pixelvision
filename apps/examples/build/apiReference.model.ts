/** A documented parameter, return value or thrown error. */
export interface ApiTag {
  /** Parameter name or error type; empty for `@returns`. */
  name: string;
  text: string;
}

/** A documented property of an interface. */
export interface ApiMember {
  name: string;
  type: string;
  optional: boolean;
  doc: string;
}

/** One export of the package. */
export interface ApiEntry {
  name: string;
  kind: "function" | "interface" | "type" | "const";
  /** The TSDoc summary (Markdown). */
  summary: string;
  /** Declarations as written in the `.d.ts` (one per overload). */
  signatures: string[];
  params: ApiTag[];
  returns: string;
  throws: ApiTag[];
  examples: string[];
  /** Interface properties. */
  members: ApiMember[];
}

/** The generated reference. */
export interface ApiReference {
  /** Package version it was generated from. */
  version: string;
  /** Size of the package's ES module entry (`dist/index.js`), as published. */
  size: { bytes: number; gzipBytes: number };
  entries: ApiEntry[];
}

/** Numbers about the package, for the marketing pages. */
export interface PackageFacts {
  version: string;
  size: { bytes: number; gzipBytes: number };
  /** Number of exported functions. */
  functionCount: number;
}

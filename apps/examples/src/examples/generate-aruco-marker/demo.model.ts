import type { ArucoDictionaryName } from "pixelvision";

export interface GenerateArucoMarkerDemoOptions {
  id: number;
  dictionary: ArucoDictionaryName;
  size: number;
  borderBits: number;
}

import type { ApiEntry } from "../../../build/apiReference.model";

/** A group of entries on the reference page. */
export interface ApiGroup {
  id: string;
  title: string;
  entries: ApiEntry[];
}

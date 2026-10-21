import type { NavSection } from "../../navigation.model";

export interface SideNavProps {
  sections: NavSection[];
}

export interface SideNavEmits {
  (event: "navigate"): void;
}

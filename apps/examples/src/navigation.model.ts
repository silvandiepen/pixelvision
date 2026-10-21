/** A link in the sidebar. */
export interface NavItem {
  title: string;
  to: string;
  /** Set in the code face (function names). */
  code: boolean;
}

/** A group of links in the sidebar. */
export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

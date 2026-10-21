export interface AppHeaderProps {
  /** Whether the sidebar is open on small screens. */
  menuOpen: boolean;
}

export interface AppHeaderEmits {
  (event: "toggle-menu"): void;
}

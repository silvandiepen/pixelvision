export interface FileButtonProps {
  /** File types the picker offers (default `"image/*"`). */
  accept?: string;
  /**
   * Primary: ink fill, the one main action. Secondary: surface fill. Raised: for a button on
   * a surface-coloured panel.
   */
  variant?: "primary" | "secondary" | "raised";
}

export interface FileButtonEmits {
  /** A file was picked; the event is the file input's own `change`. */
  (event: "change", value: Event): void;
}

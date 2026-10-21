export interface AppButtonProps {
  /** Primary: ink fill, the one main action. Secondary: surface fill. Plain: text only. */
  variant?: "primary" | "secondary" | "plain";
  type?: "button" | "submit";
  disabled?: boolean;
}

export interface SectionHeadingProps {
  /** A short label above the title naming the topic. */
  eyebrow: string;
  /** The section's title, rendered as its `h2`. */
  title: string;
  /** Id of the `h2`, for the section's `aria-labelledby`. */
  headingId: string;
  /** One or two sentences under the title. The default slot replaces it. */
  lede?: string;
}

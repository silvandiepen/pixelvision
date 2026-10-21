/** Which sidebar section a guide sits in. */
export type GuideSection = "start" | "guides";

/** A documentation page written in Markdown. */
export interface Guide {
  slug: string;
  title: string;
  section: GuideSection;
  /** One sentence for cards and the page's lead. */
  description: string;
  /** The page body in Markdown. */
  markdown: string;
}

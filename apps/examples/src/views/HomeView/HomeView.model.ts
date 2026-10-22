import type { TopicIcon } from "../../icons/icons.model";

/** A feature area on the landing page. */
export interface FeatureArea {
  title: string;
  icon: TopicIcon;
  text: string;
  /** Example slugs to link, the first one as the showcase. */
  links: string[];
}

/** A use case teaser on the landing page. */
export interface UseCaseTeaser {
  title: string;
  icon: TopicIcon;
  text: string;
  /** Anchor on the use cases page. */
  anchor: string;
}

/** A feature area on the landing page. */
export interface FeatureArea {
  title: string;
  text: string;
  /** Example slugs to link, the first one as the showcase. */
  links: string[];
}

/** A use case teaser on the landing page. */
export interface UseCaseTeaser {
  title: string;
  text: string;
  /** Anchor on the use cases page. */
  anchor: string;
}

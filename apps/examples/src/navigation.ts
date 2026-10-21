import { GUIDES } from "./content/guides";
import type { ExampleCategory } from "./examples/example.model";
import { EXAMPLES } from "./examples/registry";
import type { NavSection } from "./navigation.model";

/** Sidebar titles of the example categories, in sidebar order. */
export const CATEGORY_TITLES: [ExampleCategory, string][] = [
  ["image", "Image processing"],
  ["features", "Features"],
  ["tracking", "Tracking"],
  ["motion", "Motion"],
  ["detection", "Detection"],
  ["shape", "Shapes"],
  ["math", "Maths"],
  ["core", "Matrices"],
  ["pipeline", "Examples"],
];

/**
 * Builds the sidebar: documentation first, then one section per example
 * category.
 *
 * @returns The sections, in order.
 */
export function buildNavigation(): NavSection[] {
  const guides = (section: "start" | "guides") =>
    GUIDES.filter((guide) => guide.section === section).map((guide) => ({
      title: guide.title,
      to: `/guide/${guide.slug}`,
      code: false,
    }));
  return [
    {
      id: "start",
      title: "Getting started",
      items: [
        { title: "Home", to: "/", code: false },
        ...guides("start"),
        { title: "All examples", to: "/examples", code: false },
      ],
    },
    {
      id: "guides",
      title: "Guides",
      items: [...guides("guides"), { title: "API reference", to: "/api", code: false }],
    },
    ...CATEGORY_TITLES.map(([category, title]) => ({
      id: category,
      title,
      items: EXAMPLES.filter((example) => example.category === category).map((example) => ({
        title: example.title,
        to: `/${example.slug}`,
        code: category !== "pipeline",
      })),
    })).filter((section) => section.items.length > 0),
  ];
}

/**
 * Maps every function with an example page to that page's slug.
 *
 * @returns Function name → slug.
 */
export function functionPages(): Map<string, string> {
  const pages = new Map<string, string>();
  // Function pages first; a pipeline page only for a function that has no page of its own.
  const ordered = [
    ...EXAMPLES.filter((example) => example.category !== "pipeline"),
    ...EXAMPLES.filter((example) => example.category === "pipeline"),
  ];
  for (const example of ordered) {
    const name = example.functions[0];
    if (!pages.has(name)) pages.set(name, example.slug);
  }
  return pages;
}

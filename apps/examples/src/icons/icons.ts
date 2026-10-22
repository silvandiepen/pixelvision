import type { IconMarkup, TopicIcon } from "./icons.model";

// Every icon follows the house iconography: outline at rest, one 1.5 stroke
// weight, round caps and joins, monochrome in the current ink. A quieter
// second tone is the same ink at lower opacity, never a hue. Coordinates are
// for a 24 x 24 viewBox with about 2 px clear around the edge.

/** Quiet second tone. */
const SOFT = 'opacity="0.4"';

/**
 * Wraps shapes in the shared stroke style.
 *
 * @param body - SVG elements.
 * @returns The icon markup.
 */
function icon(body: string): IconMarkup {
  return `<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}

/**
 * A filled dot.
 *
 * @param x - Centre x.
 * @param y - Centre y.
 * @param r - Radius (default 1.2).
 * @param extra - Extra attributes, e.g. {@link SOFT}.
 * @returns A circle element.
 */
function dot(x: number, y: number, r = 1.2, extra = ""): string {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none" ${extra}/>`;
}

/**
 * A straight arrow with an open head.
 *
 * @param x1 - Start x.
 * @param y1 - Start y.
 * @param x2 - Tip x.
 * @param y2 - Tip y.
 * @param extra - Extra attributes.
 * @returns A path element.
 */
function arrow(x1: number, y1: number, x2: number, y2: number, extra = ""): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 2.4;
  const a1 = angle + Math.PI * 0.8;
  const a2 = angle - Math.PI * 0.8;
  const p = (n: number) => Math.round(n * 100) / 100;
  return `<path d="M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}M${p(x2 + head * Math.cos(a1))} ${p(y2 + head * Math.sin(a1))}L${p(x2)} ${p(y2)}L${p(x2 + head * Math.cos(a2))} ${p(y2 + head * Math.sin(a2))}" ${extra}/>`;
}

/**
 * Square matrix brackets around the middle of the icon.
 *
 * @param left - Left edge x.
 * @param right - Right edge x.
 * @param top - Top y.
 * @param bottom - Bottom y.
 * @returns Two bracket paths.
 */
function brackets(left = 4, right = 20, top = 4, bottom = 20): string {
  return `<path d="M${left + 2.5} ${top}H${left}V${bottom}H${left + 2.5}"/><path d="M${right - 2.5} ${top}H${right}V${bottom}H${right - 2.5}"/>`;
}

/**
 * A grid of dots, e.g. matrix entries.
 *
 * @param xs - Column positions.
 * @param ys - Row positions.
 * @param style - Attributes for a dot at (column, row), or `null` to skip it.
 * @returns Circle elements.
 */
function dotGrid(
  xs: number[],
  ys: number[],
  style: (c: number, r: number) => string | null,
): string {
  return ys
    .flatMap((y, r) =>
      xs.map((x, c) => {
        const extra = style(c, r);
        return extra === null ? "" : dot(x, y, 1.1, extra);
      }),
    )
    .join("");
}

/**
 * Points evenly around a circle.
 *
 * @param count - Number of points.
 * @param radius - Circle radius.
 * @param r - Dot radius.
 * @returns Circle elements centred on (12, 12).
 */
function ring(count: number, radius: number, r: number): string {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return dot(
      Math.round((12 + radius * Math.cos(a)) * 100) / 100,
      Math.round((12 + radius * Math.sin(a)) * 100) / 100,
      r,
    );
  }).join("");
}

/**
 * Three overlapping discs standing for R, G and B, the target of the
 * "back to RGB" icons.
 *
 * @param x - Centre x of the group.
 * @param y - Centre y of the group.
 * @returns Three circle elements.
 */
function rgbTrio(x: number, y: number): string {
  return `<circle cx="${x - 1.6}" cy="${y - 1.2}" r="2.4"/><circle cx="${x + 1.6}" cy="${y - 1.2}" r="2.4"/><circle cx="${x}" cy="${y + 1.5}" r="2.4"/>`;
}

/** A tilted quadrilateral, the "document in a photo" shape. */
const TILTED = "M5 6.5L17.5 4.5L19 16.5L6.5 19.5Z";

/** Icons by example slug. */
export const ICONS: Readonly<Record<string, IconMarkup>> = {
  // Matrices
  "create-matrix": icon(
    `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.33 4V20M14.67 4V20M4 9.33H20M4 14.67H20" ${SOFT}/>`,
  ),
  "clone-matrix": icon(
    `<rect x="3" y="3" width="12" height="12" rx="2" ${SOFT}/><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M13 9V21M17 9V21M9 13H21M9 17H21" ${SOFT}/>`,
  ),
  "from-image-data": icon(
    `<rect x="2.5" y="6" width="8" height="10" rx="1.5"/><path d="M3.5 14.5L6 11.5L8 13.5L9.5 12"/>${arrow(11.5, 11, 14.5, 11)}<rect x="15.5" y="6" width="6" height="10" rx="1.5"/><path d="M18.5 6V16M15.5 9.33H21.5M15.5 12.67H21.5" ${SOFT}/>`,
  ),
  "to-image-data": icon(
    `<rect x="2.5" y="6" width="6" height="10" rx="1.5"/><path d="M5.5 6V16M2.5 9.33H8.5M2.5 12.67H8.5" ${SOFT}/>${arrow(9.5, 11, 12.5, 11)}<rect x="13.5" y="6" width="8" height="10" rx="1.5"/><path d="M14.5 14.5L17 11.5L19 13.5L20.5 12"/>`,
  ),

  // Image processing
  grayscale: icon(
    `<circle cx="6" cy="9" r="3.2"/><circle cx="9.5" cy="9" r="3.2"/><circle cx="7.75" cy="12" r="3.2"/>${arrow(12.5, 10.5, 15, 10.5)}<circle cx="18.5" cy="10.5" r="3.5"/><path d="M18.5 7V14A3.5 3.5 0 0 1 18.5 7Z" fill="currentColor" stroke="none" opacity="0.5"/>`,
  ),
  "gaussian-blur": icon(
    `${dot(12, 12, 2.2)}<circle cx="12" cy="12" r="5" opacity="0.6"/><circle cx="12" cy="12" r="7.5" opacity="0.35"/><circle cx="12" cy="12" r="10" opacity="0.15"/>`,
  ),
  "box-blur": icon(
    `<rect x="10.25" y="10.25" width="3.5" height="3.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="7.5" y="7.5" width="9" height="9" rx="1" opacity="0.6"/><rect x="5" y="5" width="14" height="14" rx="1.5" opacity="0.35"/><rect x="2.5" y="2.5" width="19" height="19" rx="2" opacity="0.15"/>`,
  ),
  "box-sum": icon(
    `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.33 4V20M14.67 4V20M4 9.33H20M4 14.67H20" ${SOFT}/><path d="M12 10.5V13.5M10.5 12H13.5" stroke-width="1.75"/>`,
  ),
  "pyr-down": icon(
    `<rect x="2.5" y="8" width="10" height="10" rx="1.5"/><path d="M7.5 8V18M2.5 13H12.5" ${SOFT}/><rect x="14.5" y="12" width="5" height="6" rx="1"/><rect x="20.5" y="15.5" width="1.5" height="2.5" rx="0.5" fill="currentColor" stroke="none"/>`,
  ),
  resample: icon(
    `<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 2.5" ${SOFT}/><rect x="3" y="13" width="8" height="8" rx="1.5"/>${arrow(12.5, 11.5, 18, 6)}`,
  ),
  "sobel-derivatives": icon(
    `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 5A2 2 0 0 1 5 3H12V21H5A2 2 0 0 1 3 19Z" fill="currentColor" stroke="none" opacity="0.2"/>${arrow(7, 8, 17, 8)}${arrow(7, 8, 7, 18)}`,
  ),
  "scharr-derivatives": icon(
    `<circle cx="12" cy="12" r="9"/>${arrow(7.5, 7.5, 16.5, 7.5)}${arrow(7.5, 7.5, 7.5, 16.5)}${arrow(7.5, 7.5, 15, 15)}`,
  ),
  "integral-image": icon(
    `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 6A2 2 0 0 1 6 4H14V12H4Z" fill="currentColor" stroke="none" opacity="0.3"/><path d="M14 4V12H4" ${SOFT}/>${dot(14, 12, 1.6)}`,
  ),
  "equalize-histogram": icon(
    `<path d="M3 20H21"/><path d="M5.5 20V10M10 20V10M14.5 20V10M19 20V10"/>${arrow(12, 5, 4, 5)}${arrow(12, 5, 20, 5)}`,
  ),
  canny: icon(
    `<path d="M3 19L8.5 6L13 13.5L16.5 9L21 19Z" fill="currentColor" stroke="none" opacity="0.15"/><path d="M3 19L8.5 6L13 13.5L16.5 9L21 19Z"/>`,
  ),
  "hough-lines": icon(
    `<path d="M3 19L21 5"/>${dot(6, 16.67)}${dot(9.5, 13.94)}${dot(13, 11.22)}${dot(16.5, 8.5)}${dot(6, 7, 1, SOFT)}${dot(16, 18, 1, SOFT)}${dot(19.5, 13, 1, SOFT)}`,
  ),
  // A segment with its two end points, among stray edge pixels.
  "hough-lines-p": icon(
    `<path d="M4.5 17.5L19.5 6.5"/>${dot(4.5, 17.5, 1.6)}${dot(19.5, 6.5, 1.6)}${dot(6, 7, 1, SOFT)}${dot(16, 18, 1, SOFT)}${dot(19.5, 13.5, 1, SOFT)}`,
  ),
  // A circle, its centre and a radius.
  "hough-circles": icon(
    `<circle cx="12" cy="12" r="8"/>${dot(12, 12, 1.4)}<path d="M12 12L17.66 6.34" ${SOFT}/>`,
  ),
  "warp-perspective": icon(
    `<path d="M2.5 8L9 5.5L10 18.5L3.5 16Z"/>${arrow(11.5, 12, 14.5, 12)}<rect x="15.5" y="6" width="6" height="12" rx="1"/>`,
  ),
  "warp-affine": icon(
    `<rect x="7" y="7" width="10" height="10" rx="1" ${SOFT}/><rect x="7" y="7" width="10" height="10" rx="1" transform="rotate(25 12 12)"/><path d="M19.5 7A9 9 0 0 1 20.5 12"/><path d="M18.4 9.7L20.5 12L21.9 9.3"/>`,
  ),
  threshold: icon(
    `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 6A2 2 0 0 1 6 4H12V20H6A2 2 0 0 1 4 18Z" fill="currentColor" stroke="none"/>`,
  ),
  "otsu-level": icon(
    `<path d="M3 20H21"/><path d="M3 20C4.5 20 5 9 7.5 9S10 20 12 20" ${SOFT}/><path d="M12 20C14 20 14.5 6 17 6S19.5 20 21 20"/><path d="M12 3V20" stroke-dasharray="2 2"/>`,
  ),
  dilate: icon(
    `<circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="8" stroke-dasharray="2.2 2"/>${arrow(12, 7, 12, 3.2)}${arrow(17, 12, 20.8, 12)}${arrow(12, 17, 12, 20.8)}${arrow(7, 12, 3.2, 12)}`,
  ),
  erode: icon(
    `<circle cx="12" cy="12" r="9" ${SOFT}/><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>${arrow(12, 3, 12, 7)}${arrow(21, 12, 17, 12)}${arrow(12, 21, 12, 17)}${arrow(3, 12, 7, 12)}`,
  ),
  morphology: icon(
    `<path d="M4 12A8 8 0 0 1 20 12" ${SOFT}/><rect x="6" y="9" width="12" height="9" rx="2"/>${dot(4, 6, 0.9, SOFT)}${dot(20, 5, 0.9, SOFT)}${dot(10.5, 13.5, 0.9, SOFT)}`,
  ),
  "median-blur": icon(
    `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10H20M4 14H20M10 4V20M14 4V20" ${SOFT}/>${dot(12, 12, 1.4)}`,
  ),
  laplacian: icon(`<path d="M3 12H21" ${SOFT}/><path d="M3 12H8L10 5L14 19L16 12H21"/>`),
  "adaptive-threshold": icon(
    `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M21 6V18A2 2 0 0 1 19 20H8Z" fill="currentColor" stroke="none" opacity="0.3"/><path d="M6.5 9H12M6.5 12H17.5M6.5 15H14"/>`,
  ),
  "rgb-to-hsv": icon(
    `<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12L19.4 16.3" ${SOFT}/><path d="M12 12L4.6 16.3" ${SOFT}/>${dot(12, 12, 1.4)}`,
  ),
  "in-range": icon(
    `<circle cx="12" cy="12" r="8.5" ${SOFT}/><path d="M12 12L19.4 7.8A8.5 8.5 0 0 1 19.4 16.2Z" fill="currentColor" stroke="none" opacity="0.4"/><path d="M12 12L19.4 7.8M12 12L19.4 16.2"/>`,
  ),
  flip: icon(
    `<path d="M12 3V21" stroke-dasharray="2 2"/><path d="M9.5 6L3 18H9.5Z" fill="currentColor" stroke="none" opacity="0.8"/><path d="M14.5 6L21 18H14.5Z"/>`,
  ),

  "rgb-to-hls": icon(
    `<path d="M12 3L19.5 12L12 21L4.5 12Z"/><path d="M4.5 12A7.5 2.2 0 0 0 19.5 12" ${SOFT}/><path d="M12 3V21" ${SOFT}/>`,
  ),
  "hls-to-rgb": icon(
    `<path d="M6 6.5L9.5 12L6 17.5L2.5 12Z"/>${arrow(10.5, 12, 13.2, 12)}${rgbTrio(18, 12)}`,
  ),
  "hsv-to-rgb": icon(
    `<circle cx="6" cy="12" r="3.8"/><path d="M6 8.2V12L9.3 13.9" ${SOFT}/>${arrow(10.5, 12, 13.2, 12)}${rgbTrio(18, 12)}`,
  ),
  "rgb-to-lab": icon(
    `<path d="M12 3V21"/><path d="M4 15.5L20 8.5" ${SOFT}/><path d="M4.5 8L19.5 16" ${SOFT}/>${dot(12, 12, 1.6)}`,
  ),
  "lab-to-rgb": icon(
    `<path d="M6 6.5V17.5"/><path d="M2.5 14L9.5 10" ${SOFT}/>${arrow(10.5, 12, 13.2, 12)}${rgbTrio(18, 12)}`,
  ),
  "rgb-to-ycrcb": icon(
    `<rect x="3" y="4" width="5" height="16" rx="1.5"/><path d="M3 14H8" ${SOFT}/><rect x="11" y="4" width="10" height="16" rx="1.5" ${SOFT}/><path d="M16 4V20M11 12H21" ${SOFT}/>${dot(18.5, 8.5, 1.4)}`,
  ),
  "ycrcb-to-rgb": icon(
    `<rect x="2.5" y="7" width="3" height="10" rx="1"/><rect x="6.5" y="9" width="3.5" height="6" rx="1" ${SOFT}/>${arrow(11, 12, 13.4, 12)}${rgbTrio(18, 12)}`,
  ),
  "filter-2d": icon(
    `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.33 4V20M14.67 4V20M4 9.33H20M4 14.67H20" ${SOFT}/><path d="M10.9 12H13.1M12 10.9V13.1"/><path d="M5.9 12H7.5M16.5 12H18.1M11.2 6.67H12.8M11.2 17.33H12.8" ${SOFT}/>`,
  ),
  "bilateral-filter": icon(
    `<path d="M3 17H11V7H21"/><path d="M3 14L5 15.5L7 13L9 15L11 13.5" ${SOFT}/><path d="M13 10L15 8.5L17 10.5L19 9L21 10.5" ${SOFT}/>`,
  ),
  clahe: icon(
    `<path d="M3 20H21"/><path d="M5.5 20V12M9 20V9M12.5 20V10.5M16 20V9M19.5 20V13"/><path d="M9 9V5M16 9V4" ${SOFT}/><path d="M3 9H21" stroke-dasharray="2 2" ${SOFT}/>`,
  ),
  "calc-hist": icon(
    `<path d="M3 20H21"/><path d="M5 20V11M11 20V5.5M17 20V13"/><path d="M7.5 20V8M13.5 20V14.5M19.5 20V9" ${SOFT}/>`,
  ),
  // Histogram bars mapped back onto an image, where one region lights up.
  "calc-back-project": icon(
    `<path d="M2.5 19H10"/><path d="M4.5 19V13M7.5 19V9" ${SOFT}/>${arrow(10.5, 11, 13.5, 11)}<rect x="14" y="5" width="7.5" height="14" rx="1.5"/><circle cx="17.75" cy="10" r="2" fill="currentColor" stroke="none"/>`,
  ),
  "flood-fill": icon(
    `<path d="M4 11.5L10.5 5L17.5 12L11 18.5Z"/><path d="M4 11.5H17.5" ${SOFT}/><path d="M10.5 5L8.5 3" ${SOFT}/><path d="M19.5 14C19.5 14 21.5 16.6 21.5 18A2 2 0 0 1 17.5 18C17.5 16.6 19.5 14 19.5 14Z" fill="currentColor" stroke="none"/>`,
  ),

  // Detection
  "detect-skin": icon(
    `<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V13M17 12.5a1.5 1.5 0 0 1 3 0V15a6.5 6.5 0 0 1-6.5 6.5H13a6 6 0 0 1-5.1-2.8L5.2 14.4a1.5 1.5 0 0 1 2.4-1.8L8 13"/>`,
  ),
  "detect-haar": icon(
    `<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2.5 2" ${SOFT}/><circle cx="12" cy="12" r="6.5"/><rect x="7.5" y="8.5" width="9" height="2.75" fill="currentColor" stroke="none" opacity="0.8"/><rect x="7.5" y="11.25" width="9" height="2.75"/>`,
  ),
  // BBF: a face found by comparing single pixels, shown as pairs of dots joined by a line.
  // An XML file (folded corner, tag brackets) becoming the dashed Haar window.
  "load-opencv-cascade": icon(
    `<path d="M4 3.5H11L14 6.5V12" ${SOFT}/><path d="M11 3.5V6.5H14" ${SOFT}/><path d="M4 3.5V16" ${SOFT}/><path d="M6.5 9.5L5 11L6.5 12.5M9.5 9.5L11 11L9.5 12.5"/><rect x="11" y="13" width="9.5" height="7.5" rx="1.5" stroke-dasharray="2 1.5"/><rect x="13.5" y="15.5" width="4.5" height="2.5" fill="currentColor" stroke="none" opacity="0.8"/>`,
  ),
  // Three finder squares of a QR code, data dots in the fourth corner.
  "read-qr-code": icon(
    `<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/>${dot(6.75, 6.75, 1.2)}${dot(17.25, 6.75, 1.2)}${dot(6.75, 17.25, 1.2)}${dot(15, 15, 1, SOFT)}${dot(19, 15, 1, SOFT)}${dot(17, 17.5, 1, SOFT)}${dot(15, 20, 1, SOFT)}${dot(19.5, 20, 1, SOFT)}`,
  ),
  // A marker turned in the frame, its top-left corner marked.
  "detect-aruco-markers": icon(
    `<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2.5 2" ${SOFT}/><path d="M8 5.5L18.5 8L16 18.5L5.5 16Z"/><path d="M10.2 9.2L12.6 9.8L12 12.2L9.6 11.6Z" fill="currentColor" stroke="none" opacity="0.8"/><path d="M13.4 12.4L15.2 12.9L14.7 14.7L12.9 14.2Z" fill="currentColor" stroke="none" opacity="0.8"/>${dot(8, 5.5, 1.4)}`,
  ),
  // A marker drawn on a grid of cells: black border, a few black cells inside.
  "generate-aruco-marker": icon(
    `<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M6.5 6.5H17.5V17.5H6.5Z" ${SOFT}/><rect x="6.5" y="6.5" width="2.75" height="2.75" fill="currentColor" stroke="none" opacity="0.8"/><rect x="12" y="9.25" width="2.75" height="2.75" fill="currentColor" stroke="none" opacity="0.8"/><rect x="9.25" y="12" width="2.75" height="2.75" fill="currentColor" stroke="none" opacity="0.8"/><rect x="14.75" y="14.75" width="2.75" height="2.75" fill="currentColor" stroke="none" opacity="0.8"/>`,
  ),
  "match-template": icon(
    `<rect x="3" y="3" width="18" height="18" rx="2" ${SOFT}/><rect x="5.5" y="5.5" width="5" height="5" rx="1" stroke-dasharray="1.5 1.5"/>${arrow(10.5, 10.5, 13, 13)}<rect x="13.5" y="13.5" width="5" height="5" rx="1"/>`,
  ),
  "detect-bbf": icon(
    `<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2.5 2" ${SOFT}/><circle cx="12" cy="12" r="6.5"/>${dot(9.5, 10.5, 1.1)}${dot(14.5, 10.5, 1.1)}<path d="M9.5 10.5L14.5 10.5" ${SOFT}/>${dot(12, 15, 1.1)}<path d="M12 10.5L12 15" ${SOFT}/>`,
  ),
  "group-rectangles": icon(
    `<rect x="3" y="4" width="13" height="13" rx="1.5" ${SOFT}/><rect x="8" y="7" width="13" height="13" rx="1.5" ${SOFT}/><rect x="5.5" y="5.5" width="13" height="13" rx="1.5"/>`,
  ),
  "detect-head-pose": icon(
    `<circle cx="11" cy="13" r="7.5"/>${dot(12.5, 11.5, 1)}${dot(16, 11.5, 1)}<path d="M18 13.5L20 15L18 15.5"/><path d="M5 4.5A8 8 0 0 1 17 4.5"/><path d="M14.6 3.4L17 4.5L15.9 6.8"/>`,
  ),
  "find-document": icon(
    `<path d="${TILTED}"/>${dot(5, 6.5, 1.6)}${dot(17.5, 4.5, 1.6)}${dot(19, 16.5, 1.6)}${dot(6.5, 19.5, 1.6)}`,
  ),
  "document-tracker": icon(
    `<path d="${TILTED}" transform="translate(-1.5 1.5)" ${SOFT}/><path d="${TILTED}"/>${dot(17.5, 4.5, 1.6)}<path d="M3 21.5H9" ${SOFT}/><path d="M3 21.5H6.5"/>`,
  ),
  "extract-document": icon(
    `<rect x="6" y="5" width="12" height="15" rx="1"/><path d="M8.5 9H15.5M8.5 12H15.5M8.5 15H13" ${SOFT}/><path d="M2.5 5H4M5 2.5V3.5M21.5 5H20M19 2.5V3.5M2.5 20H4M5 21.5V22.5M21.5 20H20M19 21.5V22.5"/>`,
  ),

  // Features
  "detect-fast": icon(
    `${ring(16, 8, 0.85)}<path d="M12 12H18.5V18.5H12Z" fill="currentColor" stroke="none" opacity="0.3"/>${dot(12, 12, 1.6)}`,
  ),
  "detect-yape06": icon(
    `<circle cx="8" cy="9" r="2.5" fill="currentColor" stroke="none"/><circle cx="8" cy="9" r="5" ${SOFT}/><circle cx="16.5" cy="15.5" r="2" fill="currentColor" stroke="none"/><circle cx="16.5" cy="15.5" r="4.5" ${SOFT}/>`,
  ),
  "detect-yape": icon(
    `<circle cx="12" cy="12" r="6.5" stroke-dasharray="1.6 2.2"/><path d="M12 8.5V15.5M8.5 12H15.5"/><path d="M4 4H7M4 4V7M20 4H17M20 4V7M4 20H7M4 20V17M20 20H17M20 20V17" ${SOFT}/>`,
  ),
  "keypoint-orientation": icon(
    `<circle cx="12" cy="12" r="8"/>${dot(12, 12, 1.8)}${arrow(12, 12, 17.5, 7.5)}`,
  ),
  "describe-orb": icon(
    `<circle cx="12" cy="12" r="9"/><path d="M7 9L14 15M10 6.5L16 10.5M8 15.5L15.5 7.5" ${SOFT}/>${dot(7, 9, 1)}${dot(14, 15, 1)}${dot(10, 6.5, 1)}${dot(16, 10.5, 1)}${dot(8, 15.5, 1)}${dot(15.5, 7.5, 1)}`,
  ),
  "hamming-distance": icon(
    `<rect x="3" y="5" width="3.5" height="3.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="7.75" y="5" width="3.5" height="3.5" rx="0.5"/><rect x="12.5" y="5" width="3.5" height="3.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="17.25" y="5" width="3.5" height="3.5" rx="0.5"/><rect x="3" y="15.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="7.75" y="15.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="12.5" y="15.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="17.25" y="15.5" width="3.5" height="3.5" rx="0.5"/><path d="M9.5 10V14" stroke-dasharray="1.5 1.5"/>`,
  ),
  "match-descriptors": icon(
    `${dot(4, 6)}${dot(5, 12)}${dot(3.5, 18)}${dot(20, 7.5)}${dot(19, 13.5)}${dot(20.5, 18.5)}<path d="M4 6L20 7.5M5 12L19 13.5M3.5 18L20.5 18.5" ${SOFT}/>`,
  ),

  // Tracking
  "build-pyramid": icon(
    `<rect x="3" y="16" width="18" height="4" rx="1"/><rect x="6" y="10.5" width="12" height="4" rx="1"/><rect x="9" y="5" width="6" height="4" rx="1"/>`,
  ),
  "track-points": icon(
    `${dot(4, 16, 1.2, SOFT)}${dot(9, 7, 1.2, SOFT)}${dot(13, 18, 1.2, SOFT)}${arrow(4, 16, 9, 13.5)}${arrow(9, 7, 14.5, 5.5)}${arrow(13, 18, 19, 16)}${dot(10, 13)}${dot(15.5, 5.25)}${dot(20, 15.7)}`,
  ),
  // A window moving onto the dense spot.
  "mean-shift": icon(
    `<rect x="3" y="10" width="10" height="10" rx="1.5" stroke-dasharray="2 2" ${SOFT}/>${arrow(8, 15, 12.5, 10.5)}<rect x="11" y="4" width="10" height="10" rx="1.5"/>${dot(16, 9, 1.5)}`,
  ),
  // A rotated box fitted around a tilted blob.
  "cam-shift": icon(
    `<ellipse cx="12" cy="12" rx="7.5" ry="3.5" transform="rotate(-35 12 12)" fill="currentColor" stroke="none" opacity="0.3"/><rect x="3.5" y="7.5" width="17" height="9" rx="1" transform="rotate(-35 12 12)"/>${dot(12, 12, 1.2)}`,
  ),

  // Motion
  "estimate-affine": icon(
    `<path d="M5 18L9 6L20 6L16 18Z"/>${dot(5, 18)}${dot(9, 6)}${dot(20, 6)}${dot(16, 18)}${dot(12.5, 12)}<path d="M18.5 12.5L21 15M21 12.5L18.5 15" ${SOFT}/>`,
  ),
  "estimate-homography": icon(
    `<path d="M4 7L18 4.5L20.5 19L6 17Z"/>${dot(4, 7)}${dot(18, 4.5)}${dot(20.5, 19)}${dot(6, 17)}${dot(12, 11.5)}<path d="M2 20L4.5 22.5M4.5 20L2 22.5" ${SOFT}/>`,
  ),
  // A marker seen at an angle, with the pose's axes rising from it.
  "solve-pnp": icon(
    `<path d="M3.5 16L10.5 19.5L20.5 15L13.5 11.5Z"/>${arrow(12, 15.5, 12, 4.5)}<path d="M12 15.5L18.5 12.5M12 15.5L6.5 12.5" ${SOFT}/>`,
  ),
  // A cube's corners projected to points on a flat image.
  "project-points": icon(
    `<path d="M4 9H13V18H4Z"/><path d="M8 5H17V14H8Z" ${SOFT}/><path d="M4 9L8 5M13 9L17 5M13 18L17 14M4 18L8 14" ${SOFT}/>${dot(4, 9)}${dot(13, 9)}${dot(13, 18)}${dot(4, 18)}`,
  ),
  // An axis and the turn about it.
  rodrigues: icon(
    `<path d="M12 2.5V21.5" ${SOFT}/><path d="M18.5 9.5A7.5 3.5 0 1 1 15 6.9"/><path d="M15.6 5.2L15 6.9L16.8 7.6"/>`,
  ),

  // Shapes
  "find-contours": icon(
    `<path d="M5 10C5 5.5 9 4 12 5.5S19 5 19.5 10S17 19.5 12 19S5 14.5 5 10Z"/>${dot(5, 10)}${dot(12, 5.5)}${dot(19.5, 10)}${dot(12, 19)}`,
  ),
  "contour-area": icon(
    `<path d="M4 18L7 5.5L16 4L20 13L13.5 20Z" fill="currentColor" stroke="none" opacity="0.3"/><path d="M4 18L7 5.5L16 4L20 13L13.5 20Z"/>`,
  ),
  "arc-length": icon(
    `<path d="M3.5 17L8 7.5L14 12L20.5 5"/>${dot(3.5, 17)}${dot(20.5, 5)}<path d="M4 21H20M4 19.5V22.5M20 19.5V22.5" ${SOFT}/>`,
  ),
  "approx-polygon": icon(
    `<path d="M4 17C5 13 5 10 7 7S11 5 13 6S17 6 19 9S20 14 18 17S10 19 4 17Z" ${SOFT}/><path d="M4 17L7 7L19 9L18 17Z"/>${dot(4, 17)}${dot(7, 7)}${dot(19, 9)}${dot(18, 17)}`,
  ),
  // A pixel staircase traced as one smooth curve, with its two handles.
  vectorize: icon(
    `<path d="M4 20V16H7V12H10V9H14V6H20" ${SOFT}/><path d="M4 20C5 9 9 4 20 4"/><path d="M4 20L4.8 12M20 4L13 4.4" ${SOFT}/>${dot(4, 20)}${dot(20, 4)}`,
  ),
  "is-convex": icon(
    `<path d="M4 18L6 6L12 11L18 5L20 18Z" ${SOFT}/><path d="M6 6L18 5" stroke-dasharray="2 2"/><path d="M4 18L6 6M18 5L20 18L4 18"/>`,
  ),

  "bounding-rect": icon(
    `<path d="M6 10L13 5L19 11L12 19Z" ${SOFT}/><rect x="5" y="4" width="15" height="16" rx="0.5"/>`,
  ),
  "convex-hull": icon(
    `<path d="M12 3.5L14 9.5L20.5 9.8L15.3 13.6L17.2 20L12 16.2L6.8 20L8.7 13.6L3.5 9.8L10 9.5Z" ${SOFT}/><path d="M12 3.5L20.5 9.8L17.2 20H6.8L3.5 9.8Z"/>`,
  ),
  "min-area-rect": icon(
    `<path d="M8 9L14 6.5L17 13L11 18Z" ${SOFT}/><path d="M6.5 8.5L15.5 4.5L19.5 14.5L10.5 18.5Z"/>`,
  ),
  moments: icon(
    `<path d="M4 18L11 5L20 18Z"/>${dot(11.7, 13.7, 1.4)}<path d="M11.7 9V18.5M7 13.7H16.5" ${SOFT}/>`,
  ),
  "hu-moments": icon(
    `<rect x="3.5" y="5" width="7" height="7" rx="0.5"/><path d="M17.5 3.5L22 8L17.5 12.5L13 8Z"/><path d="M5 17H19M5 20H15" ${SOFT}/>`,
  ),
  "distance-transform": icon(
    `<rect x="3" y="5" width="18" height="14" rx="1.5"/><rect x="6.5" y="8.5" width="11" height="7" rx="1" ${SOFT}/><path d="M10 12H14"/>`,
  ),
  "connected-components": icon(
    `<circle cx="7" cy="8" r="3" fill="currentColor" stroke="none" opacity="0.4"/><path d="M13 5H20V11H16V19H13Z" fill="currentColor" stroke="none" opacity="0.4"/><circle cx="7" cy="17" r="2.5" fill="currentColor" stroke="none" opacity="0.4"/><rect x="3.5" y="4.5" width="7" height="7" rx="0.5"/><rect x="12.5" y="4.5" width="8" height="15" rx="0.5"/><rect x="4" y="14" width="6" height="6" rx="0.5"/>`,
  ),

  // Maths
  "gaussian-kernel": icon(
    `<path d="M3 20H21"/><path d="M3 19C7 19 8.5 5 12 5S17 19 21 19" ${SOFT}/><path d="M6 20V17M9 20V10.5M12 20V5.5M15 20V10.5M18 20V17"/>`,
  ),
  "perspective-transform": icon(
    `<rect x="3" y="3" width="9" height="9" rx="0.5" ${SOFT}/><path d="M11 13L20 11.5L21 21L12.5 19Z"/><path d="M12 12L11 13M12 3L20 11.5M3 12L12.5 19" stroke-dasharray="1.5 1.8" ${SOFT}/>`,
  ),
  "affine-transform": icon(
    `<path d="M3 11L9 3L10 11Z" ${SOFT}/><path d="M11 21L21 16L14 13Z"/><path d="M3 11L11 21M9 3L21 16M10 11L14 13" stroke-dasharray="1.5 1.8" ${SOFT}/>`,
  ),
  "transform-point": icon(
    `${brackets(3, 11, 5, 13)}${dot(5.5, 7.5, 0.9)}${dot(8.5, 10.5, 0.9)}${dot(5, 19, 1.4, SOFT)}${arrow(7, 18.5, 17, 16)}${dot(19, 15.5, 1.6)}`,
  ),
  identity: icon(
    `${brackets()}${dotGrid([8, 12, 16], [8, 12, 16], (c, r) => (c === r ? "" : SOFT))}`,
  ),
  transpose: icon(
    `${brackets()}<path d="M7.5 7.5L16.5 16.5" stroke-dasharray="1.5 1.8" ${SOFT}/>${dot(16, 8, 1.4)}${dot(8, 16, 1.4, SOFT)}${arrow(12.5, 11.5, 15, 9)}${arrow(11.5, 12.5, 9, 15)}`,
  ),
  multiply: icon(
    `<rect x="2.5" y="7" width="6.5" height="10" rx="1"/><path d="M5.75 7V17M2.5 12H9" ${SOFT}/><rect x="15" y="8.5" width="6.5" height="7" rx="1"/><path d="M18.25 8.5V15.5M15 12H21.5" ${SOFT}/><path d="M10.75 10.25L13.25 12.75M13.25 10.25L10.75 12.75"/>`,
  ),
  invert3x3: icon(
    `${brackets(3, 16, 6, 20)}${dotGrid([7, 9.5, 12], [10, 13, 16], () => SOFT)}<path d="M17 5H19.5M21.5 3V7"/>`,
  ),
  determinant3x3: icon(
    `<path d="M5 4V20M19 4V20"/>${dotGrid([8.5, 12, 15.5], [8, 12, 16], () => "")}`,
  ),
  "matrix-from-rows": icon(
    `${brackets(9, 21)}${dotGrid([13, 17], [8, 12, 16], () => "")}${arrow(2.5, 8, 7, 8)}<path d="M2.5 12H6M2.5 16H6" ${SOFT}/>`,
  ),
  "matrix-to-rows": icon(
    `${brackets(3, 15)}${dotGrid([7, 11], [8, 12, 16], () => "")}${arrow(17, 8, 21.5, 8)}<path d="M18 12H21.5M18 16H21.5" ${SOFT}/>`,
  ),
  "lu-solve": icon(
    `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 6V18A2 2 0 0 0 6 20H18Z" fill="currentColor" stroke="none" opacity="0.3"/><path d="M4.5 4.5L19.5 19.5"/>`,
  ),
  "cholesky-solve": icon(
    `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 6V18A2 2 0 0 0 6 20H18Z" fill="currentColor" stroke="none" opacity="0.3"/><path d="M6 4H18A2 2 0 0 1 20 6V18Z" stroke-dasharray="1.5 1.8" ${SOFT}/>`,
  ),
  svd: icon(
    `<rect x="2.5" y="7" width="5.5" height="10" rx="1"/><rect x="9.25" y="9" width="5.5" height="6" rx="1"/>${dot(10.75, 10.5, 0.8)}${dot(13.25, 13.5, 0.8)}<rect x="16" y="9" width="5.5" height="6" rx="1"/>`,
  ),
  "svd-solve": icon(
    `<path d="M3 20H21M3 20V4" ${SOFT}/><path d="M4 18L20 6"/>${dot(6, 15)}${dot(9, 15)}${dot(11, 11.5)}${dot(14.5, 11)}${dot(16.5, 7.5)}${dot(19, 8)}`,
  ),
  "pseudo-inverse": icon(
    `<rect x="3" y="4" width="6" height="16" rx="1"/>${arrow(10.5, 12, 13.5, 12)}<rect x="15" y="9" width="7" height="6" rx="1" stroke-dasharray="1.6 1.6"/>`,
  ),
  "eigen-symmetric": icon(
    `<ellipse cx="12" cy="12" rx="9" ry="5" transform="rotate(-30 12 12)" ${SOFT}/>${arrow(12, 12, 19.4, 7.75)}${arrow(12, 12, 14.6, 16.5)}`,
  ),
  "min-max-loc": icon(
    `<path d="M3 14C5.5 14 6.5 5 9 5S12.5 19 15 19S18.5 11 21 11" ${SOFT}/>${dot(9, 5, 1.6)}<circle cx="15" cy="19" r="1.6"/>`,
  ),
  median: icon(
    `<path d="M3 20H21"/><path d="M5 20V16M8.5 20V13.5M15.5 20V8.5M19 20V5" ${SOFT}/><path d="M12 20V11" stroke-width="2.5"/>`,
  ),

  // Examples (pipelines)
  "scan-document": icon(
    `<path d="M3 8V4.5A1.5 1.5 0 0 1 4.5 3H8M16 3H19.5A1.5 1.5 0 0 1 21 4.5V8M21 16V19.5A1.5 1.5 0 0 1 19.5 21H16M8 21H4.5A1.5 1.5 0 0 1 3 19.5V16"/><rect x="7" y="8" width="10" height="8" rx="1"/><path d="M9 10.5H15" ${SOFT}/>`,
  ),
  "head-turn": icon(
    `<circle cx="12" cy="12" r="5.5"/>${dot(10.2, 11, 0.9)}${dot(13.8, 11, 0.9)}<path d="M10.5 14.2C11.5 14.8 12.5 14.8 13.5 14.2"/>${arrow(5, 12, 2, 12)}${arrow(19, 12, 22, 12)}`,
  ),

  "edge-detection": icon(
    `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 17L9 9L13 14L16 11L21 16.5" fill="none"/><path d="M3 17L9 9L13 14L16 11L21 16.5V18A2 2 0 0 1 19 20H5A2 2 0 0 1 3 18Z" fill="currentColor" stroke="none" opacity="0.15"/>`,
  ),
  "straighten-document": icon(
    `<path d="${TILTED}" ${SOFT}/><rect x="7" y="6" width="10" height="12" rx="1"/><path d="M9 9.5H15M9 12H15M9 14.5H13" ${SOFT}/>`,
  ),
  "shape-analysis": icon(
    `<path d="M5 9L15 5L19 15L9 19Z"/><rect x="4" y="4.5" width="16" height="15" rx="0.5" ${SOFT}/>${dot(12, 12, 1.4)}`,
  ),
  "count-objects": icon(
    `<circle cx="7" cy="7.5" r="3"/><circle cx="16.5" cy="8" r="3.5"/><circle cx="8.5" cy="16.5" r="3.5"/><circle cx="17" cy="17" r="2.5"/>${dot(7, 7.5, 0.9, SOFT)}${dot(16.5, 8, 0.9, SOFT)}${dot(8.5, 16.5, 0.9, SOFT)}${dot(17, 17, 0.9, SOFT)}`,
  ),
  "clean-up-scan": icon(
    `<path d="M5 3H15L19 7V21H5Z"/><path d="M15 3V7H19" ${SOFT}/><path d="M8 11H16M8 14H16M8 17H13"/><path d="M5 3H15L19 7V12L5 21Z" fill="currentColor" stroke="none" opacity="0.15"/>`,
  ),
  "color-picker": icon(
    `<path d="M14.5 4.5L19.5 9.5L10 19H5V14Z"/><path d="M12.5 6.5L17.5 11.5"/><path d="M5 14L10 19" ${SOFT}/>${dot(19.5, 19.5, 1.5)}`,
  ),
  sharpness: icon(
    `<circle cx="12" cy="12" r="8.5" ${SOFT}/><circle cx="12" cy="12" r="4"/><path d="M12 3.5V6M12 18V20.5M3.5 12H6M18 12H20.5"/>`,
  ),
  "find-lines": icon(
    `<rect x="3" y="4" width="18" height="16" rx="2" ${SOFT}/><path d="M1.5 17L22.5 8M6 1.5L16 22.5"/>`,
  ),
};

/** Icons for the landing page's feature areas and use cases. */
export const TOPIC_ICONS: Readonly<Record<TopicIcon, IconMarkup>> = {
  // Feature areas
  // A photo with its right half run through a filter.
  "image-processing": icon(
    `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4V20" ${SOFT}/><path d="M12 4H19A2 2 0 0 1 21 6V18A2 2 0 0 1 19 20H12Z" fill="currentColor" stroke="none" opacity="0.15"/><path d="M3 16.5L8 11L12 14.5L15.5 11.5L21 16"/>${dot(16.5, 7.5, 1.3)}`,
  ),
  // A point in a reticle, two others with the path they moved along.
  "features-and-tracking": icon(
    `<circle cx="14" cy="10" r="4.5"/><path d="M14 3.5V5.5M14 14.5V16.5M7.5 10H9.5M18.5 10H20.5"/>${dot(14, 10, 1.3)}${dot(4, 20, 1, SOFT)}${arrow(4, 20, 8, 17.5)}${dot(11, 21, 1, SOFT)}${arrow(11, 21, 15.5, 19.5)}`,
  ),
  // A face in the viewfinder, turning.
  "faces-and-liveness": icon(
    `<path d="M3 7.5V4.5A1.5 1.5 0 0 1 4.5 3H7.5M16.5 3H19.5A1.5 1.5 0 0 1 21 4.5V7.5M21 16.5V19.5A1.5 1.5 0 0 1 19.5 21H16.5M7.5 21H4.5A1.5 1.5 0 0 1 3 19.5V16.5" ${SOFT}/><ellipse cx="12" cy="11" rx="4" ry="5"/>${dot(10.4, 10.2, 0.85)}${dot(13.6, 10.2, 0.85)}<path d="M10.8 13.4C11.6 13.9 12.4 13.9 13.2 13.4"/><path d="M8 18.5C10.5 19.8 13.5 19.8 16 18.5"/><path d="M14.3 17.6L16 18.5L15.3 20.2"/>`,
  ),
  // A tilted page in the viewfinder, its corners found.
  "document-scanning": icon(
    `<path d="M3 7.5V4.5A1.5 1.5 0 0 1 4.5 3H7.5M16.5 3H19.5A1.5 1.5 0 0 1 21 4.5V7.5M21 16.5V19.5A1.5 1.5 0 0 1 19.5 21H16.5M7.5 21H4.5A1.5 1.5 0 0 1 3 19.5V16.5" ${SOFT}/><path d="M7 8L16 6.5L17 16L8 17.5Z"/>${dot(7, 8, 1.3)}${dot(16, 6.5, 1.3)}${dot(17, 16, 1.3)}${dot(8, 17.5, 1.3)}`,
  ),
  // A matrix with its diagonal picked out.
  maths: icon(
    `${brackets(3, 21, 4, 20)}${dotGrid([8, 12, 16], [8, 12, 16], (c, r) => (c === r ? "" : SOFT))}<path d="M8 8L16 16" ${SOFT}/>`,
  ),

  // Use cases
  // An ID card: portrait on the left, text lines on the right.
  "id-and-kyc-capture": icon(
    `<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="10.5" r="2"/><path d="M4.75 16.5C5.25 14.5 6.5 13.5 8 13.5S10.75 14.5 11.25 16.5"/><path d="M14 10H19M14 13H19M14 16H17" ${SOFT}/>`,
  ),
  // A receipt with a scan line across it.
  receipts: icon(
    `<path d="M6 3H18V21L16 19.5L14 21L12 19.5L10 21L8 19.5L6 21Z"/><path d="M9 7.5H15M9 10.5H15M9 16H13" ${SOFT}/><path d="M3 13.25H21"/>`,
  ),
  // A cube standing on a marker seen in perspective.
  "ar-markers-and-tracking": icon(
    `<path d="M2.5 17L12 13.5L21.5 17L12 21Z" ${SOFT}/><path d="M12 3L17 5.5V11L12 13.5L7 11V5.5Z"/><path d="M7 5.5L12 8L17 5.5M12 8V13.5"/>`,
  ),
  // The accessibility figure in a ring.
  accessibility: icon(
    `<circle cx="12" cy="12" r="9.25"/>${dot(12, 7, 1.5)}<path d="M7 9.75L12 10.75L17 9.75M12 10.75V14M12 14L9.5 18M12 14L14.5 18"/>`,
  ),
  // An open book.
  education: icon(
    `<path d="M12 6.5C10 5 6.5 4.5 3 5V18.5C6.5 18 10 18.5 12 20C14 18.5 17.5 18 21 18.5V5C17.5 4.5 14 5 12 6.5Z"/><path d="M12 6.5V20"/><path d="M5.5 8.5C7.25 8.4 8.75 8.6 9.75 9.1M5.5 11.5C7.25 11.4 8.75 11.6 9.75 12.1M14.25 9.1C15.25 8.6 16.75 8.4 18.5 8.5M14.25 12.1C15.25 11.6 16.75 11.4 18.5 11.5" ${SOFT}/>`,
  ),
};

/**
 * Looks up the icon of an example page.
 *
 * @param slug - The example's slug.
 * @returns Inner SVG markup for a 24 x 24 viewBox, or `undefined` when there's none.
 */
export function iconFor(slug: string): IconMarkup | undefined {
  return ICONS[slug];
}

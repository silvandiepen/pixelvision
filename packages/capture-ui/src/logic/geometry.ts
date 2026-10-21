import type {
  AlignmentOptions,
  Box,
  FaceGuidance,
  Guide,
  GuideOptions,
  Point,
  ViewTransform,
} from "./geometry.model";

/**
 * Computes how a camera frame maps onto a view it covers (`object-fit:
 * cover`): scaled up until both sides fill the view, centred, and flipped
 * horizontally when mirrored.
 *
 * @param frameWidth - Camera frame width in pixels.
 * @param frameHeight - Camera frame height in pixels.
 * @param viewWidth - View width in CSS pixels.
 * @param viewHeight - View height in CSS pixels.
 * @param mirrored - Whether the preview is mirrored (a selfie camera).
 * @returns The transform for {@link toView} and {@link boxToView}.
 *
 * @example
 * const t = coverTransform(640, 480, 390, 844, true);
 * const p = toView({ x: 320, y: 240 }, t);
 */
export function coverTransform(
  frameWidth: number,
  frameHeight: number,
  viewWidth: number,
  viewHeight: number,
  mirrored = false,
): ViewTransform {
  const scale =
    frameWidth > 0 && frameHeight > 0
      ? Math.max(viewWidth / frameWidth, viewHeight / frameHeight)
      : 1;
  return {
    scale,
    offsetX: (viewWidth - frameWidth * scale) / 2,
    offsetY: (viewHeight - frameHeight * scale) / 2,
    viewWidth,
    viewHeight,
    mirrored,
  };
}

/**
 * Maps a point from camera-frame pixels to view pixels.
 *
 * @param point - Point in frame pixels.
 * @param t - Transform from {@link coverTransform}.
 * @returns The point in view pixels.
 */
export function toView(point: Point, t: ViewTransform): Point {
  const x = point.x * t.scale + t.offsetX;
  return { x: t.mirrored ? t.viewWidth - x : x, y: point.y * t.scale + t.offsetY };
}

/**
 * Maps a point from view pixels back to camera-frame pixels.
 *
 * @param point - Point in view pixels.
 * @param t - Transform from {@link coverTransform}.
 * @returns The point in frame pixels.
 */
export function fromView(point: Point, t: ViewTransform): Point {
  const x = t.mirrored ? t.viewWidth - point.x : point.x;
  return { x: (x - t.offsetX) / t.scale, y: (point.y - t.offsetY) / t.scale };
}

/**
 * Maps a box from camera-frame pixels to view pixels. A mirrored box keeps
 * a positive width: its left edge comes from the frame box's right edge.
 *
 * @param box - Box in frame pixels.
 * @param t - Transform from {@link coverTransform}.
 * @returns The box in view pixels.
 */
export function boxToView(box: Box, t: ViewTransform): Box {
  const a = toView({ x: box.x, y: box.y }, t);
  const b = toView({ x: box.x + box.width, y: box.y + box.height }, t);
  return {
    x: Math.min(a.x, b.x),
    y: a.y,
    width: Math.abs(b.x - a.x),
    height: b.y - a.y,
  };
}

/**
 * Sizes and places the face guide in a view: as large as allowed while
 * keeping its aspect, centred horizontally, slightly above the middle.
 *
 * @param viewWidth - View width in CSS pixels.
 * @param viewHeight - View height in CSS pixels.
 * @param options - Shape, aspect, size limits and vertical position.
 * @returns The guide.
 *
 * @example
 * const guide = guideFor(390, 844, { shape: "oval", aspect: 0.75 });
 */
export function guideFor(viewWidth: number, viewHeight: number, options: GuideOptions = {}): Guide {
  const { shape = "oval", size = 0.62, maxWidth = 0.82, centreY = 0.44 } = options;
  const aspect = shape === "circle" ? 1 : (options.aspect ?? 0.78);
  const height = Math.max(0, Math.min(viewHeight * size, (viewWidth * maxWidth) / aspect));
  const ry = height / 2;
  const rx = ry * aspect;
  const corner = shape === "rect" ? Math.min(rx, ry) * 0.38 : Math.min(rx, ry);
  return { shape, cx: viewWidth / 2, cy: viewHeight * centreY, rx, ry, corner };
}

/**
 * Tells the person how to move so their face fits the guide: closer,
 * further, to the centre, or nothing (aligned). Checks centring first, as
 * a face half outside the guide also measures the wrong size.
 *
 * @param face - The face box in view pixels, or undefined when none was found.
 * @param guide - The guide from {@link guideFor}.
 * @param options - Size and offset tolerances.
 * @returns The guidance.
 *
 * @example
 * if (assessFace(faceBox, guide) === "too-far") show("Move closer");
 */
export function assessFace(
  face: Box | undefined,
  guide: Guide,
  options: AlignmentOptions = {},
): FaceGuidance {
  if (!face || guide.rx <= 0 || guide.ry <= 0) return "no-face";
  const { minFill = 0.45, maxFill = 1.05, maxOffset = 0.3 } = options;
  const dx = (face.x + face.width / 2 - guide.cx) / guide.rx;
  const dy = (face.y + face.height / 2 - guide.cy) / guide.ry;
  if (Math.hypot(dx, dy) > maxOffset) return "off-centre";
  const fill = face.width / (guide.rx * 2);
  if (fill < minFill) return "too-far";
  if (fill > maxFill) return "too-close";
  return "aligned";
}

/**
 * Builds an SVG path for the guide outline: an ellipse for `oval` and
 * `circle`, a rounded rectangle for `rect`. Starts at the top centre and
 * runs clockwise, so a dashed progress stroke fills from the top.
 *
 * @param guide - The guide.
 * @returns SVG path data.
 */
export function guidePath(guide: Guide): string {
  const { cx, cy, rx, ry, corner } = guide;
  const top = cy - ry;
  const bottom = cy + ry;
  const left = cx - rx;
  const right = cx + rx;
  if (guide.shape !== "rect") {
    return `M ${cx} ${top} A ${rx} ${ry} 0 0 1 ${cx} ${bottom} A ${rx} ${ry} 0 0 1 ${cx} ${top} Z`;
  }
  const r = corner;
  return [
    `M ${cx} ${top}`,
    `H ${right - r}`,
    `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
    `V ${bottom - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
    `H ${left + r}`,
    `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
    `V ${top + r}`,
    `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
    "Z",
  ].join(" ");
}

/**
 * Builds a rounded SVG path through a quadrilateral's corners: straight
 * edges with each corner softened by up to `radius` pixels.
 *
 * @param points - Four (or more) corners in drawing order.
 * @param radius - Corner rounding in pixels.
 * @returns SVG path data, or an empty string for fewer than three points.
 */
export function roundedPolygonPath(points: readonly Point[], radius: number): string {
  const n = points.length;
  if (n < 3) return "";
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i + n - 1) % n];
    const p = points[i];
    const next = points[(i + 1) % n];
    const inLen = Math.hypot(p.x - prev.x, p.y - prev.y);
    const outLen = Math.hypot(next.x - p.x, next.y - p.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const a =
      inLen === 0
        ? p
        : { x: p.x + ((prev.x - p.x) * r) / inLen, y: p.y + ((prev.y - p.y) * r) / inLen };
    const b =
      outLen === 0
        ? p
        : { x: p.x + ((next.x - p.x) * r) / outLen, y: p.y + ((next.y - p.y) * r) / outLen };
    parts.push(`${i === 0 ? "M" : "L"} ${round(a.x)} ${round(a.y)}`);
    parts.push(`Q ${round(p.x)} ${round(p.y)} ${round(b.x)} ${round(b.y)}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

/**
 * Rounds to two decimals, to keep SVG attributes short.
 *
 * @param value - Number.
 * @returns The rounded number.
 */
export const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Computes how an image maps onto a view it fits inside (`object-fit:
 * contain`): scaled down until both sides fit, centred.
 *
 * @param imageWidth - Image width in pixels.
 * @param imageHeight - Image height in pixels.
 * @param viewWidth - View width in CSS pixels.
 * @param viewHeight - View height in CSS pixels.
 * @returns The transform for {@link toView} and {@link fromView}.
 */
export function containTransform(
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
): ViewTransform {
  const scale =
    imageWidth > 0 && imageHeight > 0
      ? Math.min(viewWidth / imageWidth, viewHeight / imageHeight)
      : 1;
  return {
    scale,
    offsetX: (viewWidth - imageWidth * scale) / 2,
    offsetY: (viewHeight - imageHeight * scale) / 2,
    viewWidth,
    viewHeight,
    mirrored: false,
  };
}

/**
 * Grows a guide outwards by a margin: the path of the progress ring
 * around it.
 *
 * @param guide - The guide.
 * @param margin - Distance in pixels.
 * @returns The larger guide.
 */
export function inflateGuide(guide: Guide, margin: number): Guide {
  return {
    ...guide,
    rx: guide.rx + margin,
    ry: guide.ry + margin,
    corner: guide.corner + margin,
  };
}

/**
 * Builds an SVG path of four corner brackets around a box: the face
 * tracker's look.
 *
 * @param box - The box in view pixels.
 * @returns SVG path data.
 */
export function bracketsPath(box: Box): string {
  const { x, y, width: w, height: h } = box;
  const side = Math.min(w, h);
  const len = side * 0.24;
  const r = side * 0.1;
  const x1 = x + w;
  const y1 = y + h;
  const n = (v: number) => round(v);
  return [
    `M ${n(x)} ${n(y + len)} V ${n(y + r)} Q ${n(x)} ${n(y)} ${n(x + r)} ${n(y)} H ${n(x + len)}`,
    `M ${n(x1 - len)} ${n(y)} H ${n(x1 - r)} Q ${n(x1)} ${n(y)} ${n(x1)} ${n(y + r)} V ${n(y + len)}`,
    `M ${n(x1)} ${n(y1 - len)} V ${n(y1 - r)} Q ${n(x1)} ${n(y1)} ${n(x1 - r)} ${n(y1)} H ${n(x1 - len)}`,
    `M ${n(x + len)} ${n(y1)} H ${n(x + r)} Q ${n(x)} ${n(y1)} ${n(x)} ${n(y1 - r)} V ${n(y1 - len)}`,
  ].join(" ");
}

/**
 * Builds an SVG path of viewfinder corners inset in a view: what the
 * document scanner shows before it finds a document.
 *
 * @param width - View width.
 * @param height - View height.
 * @param inset - Margin in pixels.
 * @returns SVG path data.
 */
export function viewfinderPath(width: number, height: number, inset: number): string {
  return bracketsPath({
    x: inset,
    y: inset,
    width: Math.max(0, width - inset * 2),
    height: Math.max(0, height - inset * 2),
  });
}

/**
 * Builds an SVG data URL that masks everything except a hole: used as the
 * CSS `mask-image` of the darkened, blurred surround.
 *
 * @param width - View width.
 * @param height - View height.
 * @param holePath - SVG path of the hole.
 * @returns A `url("data:image/svg+xml,…")` value.
 */
export function holeMask(width: number, height: number, holePath: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(width)} ${round(height)}" preserveAspectRatio="none">` +
    `<path fill-rule="evenodd" fill="#000" d="M0 0H${round(width)}V${round(height)}H0Z ${holePath}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

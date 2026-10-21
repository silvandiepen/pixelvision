import type { Page } from "@playwright/test";

/** Corners of the light document in the generated scene (640 x 480). */
export const SCENE_CORNERS = [
  { x: 150, y: 90 },
  { x: 500, y: 120 },
  { x: 470, y: 400 },
  { x: 120, y: 360 },
];

/**
 * Draws the test scene for the document scanner: a light quadrilateral on
 * a dark, textured background, from a seeded generator so it's the same
 * every time. Self-contained, so it can run as a browser init script.
 *
 * @param canvas - A 640 x 480 canvas.
 * @param corners - The document's corners.
 */
export function drawScene(canvas: HTMLCanvasElement, corners: { x: number; y: number }[]): void {
  const context = canvas.getContext("2d");
  if (!context) return;
  let seed = 7;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  context.fillStyle = "#3a3026";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 1500; i++) {
    const shade = 40 + Math.floor(random() * 30);
    context.fillStyle = `rgb(${shade}, ${shade - 8}, ${shade - 16})`;
    context.fillRect(random() * canvas.width, random() * canvas.height, 2 + random() * 10, 2);
  }
  context.fillStyle = "#f2f0ea";
  context.beginPath();
  corners.forEach((corner, i) =>
    i ? context.lineTo(corner.x, corner.y) : context.moveTo(corner.x, corner.y),
  );
  context.closePath();
  context.fill();
}

/**
 * Renders the scene in the page and returns it as PNG bytes, for uploading.
 *
 * @param page - Any page of the site.
 * @returns The PNG.
 */
export async function scenePng(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(
    ([source, corners]) => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      // The drawing function, sent to the browser as source.
      new Function("canvas", "corners", `(${source})(canvas, corners)`)(canvas, corners);
      return canvas.toDataURL("image/png");
    },
    [drawScene.toString(), SCENE_CORNERS] as const,
  );
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

/**
 * Replaces the camera with a stream of the generated scene.
 *
 * @param page - The page, before it navigates.
 */
export async function fakeCameraWithScene(page: Page): Promise<void> {
  await page.addInitScript(
    ([source, corners]) => {
      const draw = new Function("canvas", "corners", `(${source})(canvas, corners)`);
      const getUserMedia = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        draw(canvas, corners);
        const stream = canvas.captureStream(15);
        // A canvas stream only sends frames when it's drawn on.
        setInterval(() => draw(canvas, corners), 60);
        return stream;
      };
      Object.defineProperty(navigator, "mediaDevices", {
        value: { getUserMedia },
        configurable: true,
      });
    },
    [drawScene.toString(), SCENE_CORNERS] as const,
  );
}

/**
 * Replaces the camera with a plain gray stream: no face, no document.
 *
 * @param page - The page, before it navigates.
 */
export async function blankCamera(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const getUserMedia = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const context = canvas.getContext("2d");
      const draw = () => {
        if (!context) return;
        context.fillStyle = "#808080";
        context.fillRect(0, 0, canvas.width, canvas.height);
      };
      draw();
      const stream = canvas.captureStream(15);
      setInterval(draw, 60);
      return stream;
    };
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      configurable: true,
    });
  });
}

/**
 * Makes the camera unavailable, as when the person refuses access.
 *
 * @param page - The page, before it navigates.
 */
export async function denyCamera(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const getUserMedia = () =>
      Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      configurable: true,
    });
  });
}

/**
 * Parses the scanner's published corners (`"x,y x,y x,y x,y"`).
 *
 * @param text - The published value.
 * @returns The corners.
 */
export function parseCorners(text: string): { x: number; y: number }[] {
  return text.split(" ").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return { x, y };
  });
}

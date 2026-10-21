// Loads the built package and records what the tests check: page-level events, Blob URLs,
// workers and Content Security Policy violations.
import * as captureUi from "@pixelvision/capture-ui";

/**
 * Loads the cascades on demand, so tests can hold their requests open.
 *
 * @returns The frontal and profile cascades.
 */
const loadCascades = async () => {
  const [{ frontalFace }, { profileFace }] = await Promise.all([
    import("pixelvision/cascades/frontal-face"),
    import("pixelvision/cascades/profile-face"),
  ]);
  return { frontal: frontalFace, profile: profileFace };
};

const record = {
  documentEvents: [],
  blobUrls: [],
  workers: [],
  violations: [],
};

for (const type of ["pv-ready", "pv-pose", "pv-detect", "pv-capture", "pv-complete", "pv-error"]) {
  document.addEventListener(type, () => record.documentEvents.push(type));
}
document.addEventListener("securitypolicyviolation", (event) =>
  record.violations.push(`${event.violatedDirective} ${event.blockedURI}`),
);

const createObjectURL = URL.createObjectURL.bind(URL);
const revokeObjectURL = URL.revokeObjectURL.bind(URL);
URL.createObjectURL = (blob) => {
  const url = createObjectURL(blob);
  record.blobUrls.push({ url, type: blob.type, revoked: false });
  return url;
};
URL.revokeObjectURL = (url) => {
  const entry = record.blobUrls.find((item) => item.url === url);
  if (entry) entry.revoked = true;
  revokeObjectURL(url);
};

const NativeWorker = window.Worker;
window.Worker = class extends NativeWorker {
  constructor(url, options) {
    super(url, options);
    const entry = { url: String(url), terminated: false };
    record.workers.push(entry);
    const terminate = this.terminate.bind(this);
    this.terminate = () => {
      entry.terminated = true;
      terminate();
    };
  }
};

/**
 * A camera stand-in: a gray canvas stream, redrawn so frames keep coming.
 *
 * @returns The stream.
 */
const grayStream = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const context = canvas.getContext("2d");
  const draw = () => {
    context.fillStyle = "#808080";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };
  draw();
  const stream = canvas.captureStream(15);
  const timer = setInterval(draw, 60);
  stream.getVideoTracks()[0].addEventListener("ended", () => clearInterval(timer));
  return stream;
};

/**
 * A camera stand-in in a nearly dark room: a dim face shape on a dim wall, with some texture.
 *
 * @returns The stream.
 */
const darkStream = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const context = canvas.getContext("2d");
  const draw = () => {
    context.fillStyle = "#121212";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#2a2a2a";
    context.beginPath();
    context.ellipse(320, 215, 80, 100, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#0a0a0a";
    for (const x of [290, 350]) context.fillRect(x - 12, 190, 24, 8);
    context.fillRect(300, 265, 40, 8);
  };
  draw();
  const stream = canvas.captureStream(15);
  const timer = setInterval(draw, 60);
  stream.getVideoTracks()[0].addEventListener("ended", () => clearInterval(timer));
  return stream;
};

/** Every stream handed out, so tests can check that tracks were stopped. */
const streams = [];
Object.defineProperty(navigator, "mediaDevices", {
  value: {
    getUserMedia: async () => {
      const stream = grayStream();
      streams.push(stream);
      return stream;
    },
  },
  configurable: true,
});

Object.assign(window, {
  captureUi,
  loadCascades,
  grayStream,
  darkStream,
  record,
  streams,
  pageReady: true,
});

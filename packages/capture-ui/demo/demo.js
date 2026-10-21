import { loadNeuralPoseSource } from "@pixelvision/capture-ui";

const face = document.querySelector("#face");
const scanner = document.querySelector("#document");
const log = document.querySelector("#log");
const result = document.querySelector("#result");
const params = new URLSearchParams(location.search);

const write = (line) => {
  log.textContent = `${new Date().toLocaleTimeString()}  ${line}\n${log.textContent}`.slice(
    0,
    4000,
  );
};

for (const element of [face, scanner]) {
  element.addEventListener("pv-ready", (e) =>
    write(`pv-ready ${e.detail.width}×${e.detail.height}`),
  );
  element.addEventListener("pv-error", (e) =>
    write(`pv-error ${e.detail.code}: ${e.detail.message}`),
  );
  // pv-capture doesn't bubble: listen on the element itself.
  element.addEventListener("pv-capture", (e) => {
    const { metadata, source, blob } = e.detail;
    const size = metadata ?? source;
    const challenge = metadata ? `, challengePassed ${metadata.challengePassed}` : "";
    write(
      `pv-capture ${size.width}×${size.height}, ${Math.round(blob.size / 1024)} kB${challenge}`,
    );
    const url = URL.createObjectURL(blob);
    result.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
    result.src = url;
    result.hidden = false;
  });
}
face.addEventListener("pv-step", (e) =>
  write(`pv-step ${e.detail.step} (${e.detail.stepsDone}/${e.detail.totalSteps})`),
);
face.addEventListener("pv-complete", (e) => write(`pv-complete in ${e.detail.durationMs} ms`));
let lastPose = "";
face.addEventListener("pv-pose", (e) => {
  const yaw = e.detail.yaw === undefined ? "" : ` / ${Math.round(e.detail.yaw)}°`;
  const line = `${e.detail.pose} / ${e.detail.guidance}${yaw}`;
  if (line !== lastPose) write(`pv-pose ${line}`);
  lastPose = line;
});
let lastFound = null;
scanner.addEventListener("pv-detect", (e) => {
  const found = Boolean(e.detail.corners);
  if (found !== lastFound) write(`pv-detect ${found ? "document found" : "no document"}`);
  lastFound = found;
});

// Precise detection: YuNet through @pixelvision/face-neural. onnxruntime-web and the model are only
// downloaded when it is switched on (or when the element offers it after a stalled step).
const ORT_VERSION = "1.29.0";
const ORT_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
const MODEL_URL = new URL(
  "../../face-neural/models/face_detection_yunet_2023mar.onnx",
  import.meta.url,
).href;
let preciseSource;
const loadPrecise = () => {
  preciseSource ??= (async () => {
    const ort = await import(`${ORT_BASE}ort.min.mjs`);
    ort.env.wasm.wasmPaths = ORT_BASE;
    return loadNeuralPoseSource({
      ort,
      model: MODEL_URL,
      sessionOptions: { executionProviders: ["wasm"] },
    });
  })().catch((error) => {
    preciseSource = undefined;
    throw error;
  });
  return preciseSource;
};
face.preciseSource = loadPrecise;

const precise = document.querySelector("#precise");
const preciseStatus = document.querySelector("#precise-status");
const preciseNote = preciseStatus.textContent;
precise.addEventListener("change", async () => {
  if (!precise.checked) {
    face.source = undefined;
    preciseStatus.textContent = preciseNote;
    write("detector haar");
    return;
  }
  preciseStatus.textContent = "Loading onnxruntime-web and the YuNet model…";
  try {
    face.source = await loadPrecise();
    preciseStatus.textContent = "On: turns are named and counted from 18°.";
    write("detector yunet");
  } catch (error) {
    precise.checked = false;
    preciseStatus.textContent = `Couldn't load precise detection: ${error.message}`;
  }
});
face.addEventListener("pv-detector", (e) => {
  precise.checked = e.detail.name === "yunet";
  write(`detector ${e.detail.name}`);
});

// Tabs
const tabs = document.querySelectorAll("[data-tab]");
const show = (name) => {
  tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.tab === name)));
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });
  (name === "face" ? scanner : face).stop();
};
tabs.forEach((tab) => tab.addEventListener("click", () => show(tab.dataset.tab)));

// Options
const bind = (id, apply) => {
  const input = document.querySelector(`#${id}`);
  input.addEventListener("input", () => apply(input));
  apply(input);
};
bind("shape", (i) => face.setAttribute("guide-shape", i.value));
bind("lang", (i) => [face, scanner].forEach((el) => el.setAttribute("lang", i.value)));
bind("accent", (i) =>
  [face, scanner].forEach((el) => el.style.setProperty("--pv-accent", i.value)),
);
bind("landmarks", (i) => face.toggleAttribute("show-landmarks", i.checked));
bind("debug", (i) => [face, scanner].forEach((el) => el.toggleAttribute("show-debug", i.checked)));
bind("steps", (i) => face.setAttribute("steps", i.checked ? "on" : "off"));
bind("synthetic", (i) => {
  scanner.stream = i.checked ? syntheticDocument() : undefined;
});

/**
 * A canvas stream showing a card on a dark desk, gently moving, for trying the scanner without a document.
 *
 * @returns The stream.
 */
function syntheticDocument() {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const c = canvas.getContext("2d");
  const start = performance.now();
  const draw = (now) => {
    const t = (now - start) / 1000;
    const settle = Math.max(0, 1 - t / 2.5);
    c.fillStyle = "#2b2f36";
    c.fillRect(0, 0, 1280, 720);
    c.save();
    c.translate(640 + settle * 80 * Math.sin(t * 3), 370);
    c.rotate(-0.12 + settle * 0.1);
    c.transform(1, 0.04, -0.06, 1, 0, 0);
    c.fillStyle = "#f4f1ea";
    c.beginPath();
    c.roundRect(-300, -190, 600, 380, 22);
    c.fill();
    c.fillStyle = "#3b5b8c";
    c.fillRect(-300, -190, 600, 70);
    c.fillStyle = "#c9c3b6";
    c.fillRect(-260, -90, 150, 190);
    c.fillStyle = "#4a4a4a";
    for (let i = 0; i < 6; i++) c.fillRect(-80, -80 + i * 34, 300 - (i % 3) * 60, 14);
    c.restore();
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  return canvas.captureStream(30);
}

if (params.get("tab") === "document") show("document");
if (params.has("synthetic")) {
  const box = document.querySelector("#synthetic");
  box.checked = true;
  box.dispatchEvent(new Event("input"));
}
if (params.has("debug")) {
  const box = document.querySelector("#debug");
  box.checked = true;
  box.dispatchEvent(new Event("input"));
}
if (params.has("precise")) {
  precise.checked = true;
  precise.dispatchEvent(new Event("change"));
}
if (params.has("autostart")) (params.get("tab") === "document" ? scanner : face).start();

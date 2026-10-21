import { onBeforeUnmount, ref, shallowRef } from "vue";
import { readPixels } from "../../utils/input";
import type { FacingMode, UseCamera } from "./useCamera.model";

/**
 * Explains a `getUserMedia` failure in plain words, with what to do next.
 *
 * @param error - What `getUserMedia` threw.
 * @returns The explanation.
 */
export function describeCameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera access is blocked. Allow it in the browser's site settings, or upload a photo instead.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found. Connect one, or upload a photo instead.";
  }
  if (name === "NotReadableError") {
    return "The camera is in use by another app. Close it and try again.";
  }
  const message = error instanceof Error ? error.message : String(error);
  return `The camera couldn't start (${message}).`;
}

/**
 * Runs a camera into a hidden `<video>` and reads frames from it on demand.
 * Stops the camera when the component unmounts.
 *
 * @returns The camera's state and controls.
 */
export function useCamera(): UseCamera {
  const active = ref(false);
  const error = ref<string | null>(null);
  const video = shallowRef<HTMLVideoElement | null>(null);
  const canvas = document.createElement("canvas");
  let stream: MediaStream | null = null;

  /** Stops the camera and releases it. */
  function stop(): void {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    if (video.value) video.value.srcObject = null;
    active.value = false;
  }

  /**
   * Asks for the camera and starts the video.
   *
   * @param facingMode - Back or selfie camera.
   * @returns Whether it started.
   */
  async function start(facingMode: FacingMode): Promise<boolean> {
    stop();
    error.value = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = window.isSecureContext
        ? "This browser can't use a camera. Upload a photo instead."
        : "The camera needs a secure connection (https or localhost). Upload a photo instead.";
      return false;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (!video.value) throw new Error("No video element");
      video.value.srcObject = stream;
      await video.value.play();
      active.value = true;
      return true;
    } catch (caught) {
      stop();
      error.value = describeCameraError(caught);
      return false;
    }
  }

  /**
   * Reads the current frame.
   *
   * @param box - Largest width and height to scale it to.
   * @returns RGBA pixels, or `null` before the first frame.
   */
  function frame(box: { width: number; height: number }) {
    const element = video.value;
    if (!active.value || !element || element.videoWidth === 0) return null;
    return readPixels(element, element.videoWidth, element.videoHeight, box, canvas);
  }

  onBeforeUnmount(stop);
  return { active, error, video, start, stop, frame };
}

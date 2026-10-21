/** A navigator with media devices, injectable for tests. */
interface MediaNavigator {
  mediaDevices?: { getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream> };
}

/**
 * Builds `getUserMedia` constraints for a capture: the front (`"user"`)
 * or back (`"environment"`) camera at a resolution good enough for a
 * sharp capture without overloading phones.
 *
 * @param facingMode - Which camera.
 * @param idealWidth - Preferred width (default 1920 for documents, 1280 for selfies).
 * @returns The constraints.
 */
export function cameraConstraints(
  facingMode: "user" | "environment",
  idealWidth = facingMode === "environment" ? 1920 : 1280,
): MediaStreamConstraints {
  return {
    audio: false,
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: idealWidth },
      height: { ideal: Math.round((idealWidth * 9) / 16) },
    },
  };
}

/**
 * Opens a camera.
 *
 * @param constraints - From {@link cameraConstraints}.
 * @param nav - The navigator (default the global one).
 * @returns The stream.
 * @throws What `getUserMedia` throws, or a `NotSupportedError`-named error when it is missing.
 */
export async function openCamera(
  constraints: MediaStreamConstraints,
  nav: MediaNavigator | undefined = globalThis.navigator as MediaNavigator | undefined,
): Promise<MediaStream> {
  const getUserMedia = nav?.mediaDevices?.getUserMedia;
  if (typeof getUserMedia !== "function") {
    const error = new Error("getUserMedia is not available");
    error.name = "NotSupportedError";
    throw error;
  }
  return getUserMedia.call(nav!.mediaDevices, constraints);
}

/**
 * Stops every track of a stream, turning the camera light off.
 *
 * @param stream - The stream, or undefined.
 */
export function stopStream(stream: Pick<MediaStream, "getTracks"> | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}

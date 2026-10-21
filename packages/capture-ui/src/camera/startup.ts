import type {
  StreamFailure,
  StreamLike,
  TrackLike,
  VideoLike,
  WaitForVideoOptions,
} from "./startup.model";

/** Milliseconds a stream gets to deliver its first metadata (default of `start-timeout`). */
export const DEFAULT_START_TIMEOUT_MS = 10_000;

/** A camera stream that could not start, or that stopped delivering. */
export class StreamError extends Error {
  /** What went wrong. */
  readonly reason: StreamFailure;

  /**
   * Creates the error.
   *
   * @param reason - What went wrong.
   */
  constructor(reason: StreamFailure) {
    super(`The camera stream failed: ${reason}`);
    this.name = "StreamError";
    this.reason = reason;
  }
}

/**
 * Finds the first live video track of a stream.
 *
 * @param stream - The stream (any object with `getVideoTracks`).
 * @returns The track, or undefined when the stream has no live video track.
 *
 * @example
 * if (!liveVideoTrack(stream)) throw new StreamError("no-video");
 */
export function liveVideoTrack(stream: StreamLike | undefined): TrackLike | undefined {
  const tracks = typeof stream?.getVideoTracks === "function" ? stream.getVideoTracks() : [];
  return tracks.find((track) => track.kind === "video" && track.readyState === "live");
}

/**
 * Waits until a video element knows the stream's size. Fails when the track ends, the element
 * reports a media error, no metadata arrives within `timeoutMs`, or `signal` aborts. Every
 * listener and the timer are removed whichever way it ends.
 *
 * @param video - The element the stream is attached to.
 * @param track - The stream's live video track.
 * @param options - The timeout and an abort signal.
 * @returns Resolves once `videoWidth` and `videoHeight` are known.
 * @throws {StreamError} With the reason it failed.
 */
export function waitForVideo(
  video: VideoLike,
  track: TrackLike,
  options: WaitForVideoOptions,
): Promise<void> {
  const { timeoutMs, signal } = options;
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new StreamError("aborted"));
      return;
    }
    if (track.readyState !== "live") {
      reject(new StreamError("ended"));
      return;
    }
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      resolve();
      return;
    }
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("resize", onMetadata);
      video.removeEventListener("error", onMediaError);
      track.removeEventListener("ended", onEnded);
      signal?.removeEventListener("abort", onAbort);
    };
    const fail = (reason: StreamFailure) => {
      cleanup();
      reject(new StreamError(reason));
    };
    function onMetadata() {
      if (!(video.videoWidth > 0 && video.videoHeight > 0)) return;
      cleanup();
      resolve();
    }
    function onMediaError() {
      fail("media-error");
    }
    function onEnded() {
      fail("ended");
    }
    function onAbort() {
      fail("aborted");
    }
    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("resize", onMetadata);
    video.addEventListener("error", onMediaError);
    track.addEventListener("ended", onEnded);
    signal?.addEventListener("abort", onAbort);
    const timer = setTimeout(() => fail("start-timeout"), timeoutMs);
  });
}

/**
 * Watches a running stream: calls `onFailure` once when the video track ends or the element
 * reports a media error.
 *
 * @param video - The element showing the stream.
 * @param track - The stream's video track.
 * @param onFailure - Called with `ended` or `media-error`, at most once.
 * @returns A function that stops watching; safe to call more than once.
 */
export function watchVideo(
  video: VideoLike,
  track: TrackLike,
  onFailure: (reason: "ended" | "media-error") => void,
): () => void {
  let watching = true;
  const unwatch = () => {
    if (!watching) return;
    watching = false;
    video.removeEventListener("error", onMediaError);
    track.removeEventListener("ended", onEnded);
  };
  function onMediaError() {
    unwatch();
    onFailure("media-error");
  }
  function onEnded() {
    unwatch();
    onFailure("ended");
  }
  video.addEventListener("error", onMediaError);
  track.addEventListener("ended", onEnded);
  return unwatch;
}

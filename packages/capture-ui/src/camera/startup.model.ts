/**
 * Why a camera stream could not start or stopped delivering:
 *
 * - `no-video`: the stream has no live video track (empty, audio-only or already ended).
 * - `ended`: the video track ended (unplugged, revoked, or stopped by other code).
 * - `media-error`: the video element reported an error for the stream.
 * - `start-timeout`: no video metadata arrived in time.
 * - `aborted`: the start was cancelled (stop, disconnect or a newer start).
 */
export type StreamFailure = "no-video" | "ended" | "media-error" | "start-timeout" | "aborted";

/** The parts of a `MediaStreamTrack` the startup checks use. */
export interface TrackLike extends EventTarget {
  readonly kind: string;
  readonly readyState: string;
}

/** The parts of a `MediaStream` the startup checks use. */
export interface StreamLike {
  getVideoTracks(): TrackLike[];
}

/** The parts of an `HTMLVideoElement` the startup checks use. */
export interface VideoLike extends EventTarget {
  readonly videoWidth: number;
  readonly videoHeight: number;
}

/** Options for {@link waitForVideo}. */
export interface WaitForVideoOptions {
  /** Milliseconds to wait for the first metadata before failing with `start-timeout`. */
  timeoutMs: number;
  /** Aborting it fails the wait with `aborted`. */
  signal?: AbortSignal;
}

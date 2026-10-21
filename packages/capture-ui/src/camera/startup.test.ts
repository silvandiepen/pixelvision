import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { liveVideoTrack, StreamError, waitForVideo, watchVideo } from "./startup";

/** An event target that counts its listeners, so tests can prove they are all removed. */
class Counted extends EventTarget {
  listeners = 0;

  override addEventListener(...args: Parameters<EventTarget["addEventListener"]>): void {
    this.listeners++;
    super.addEventListener(...args);
  }

  override removeEventListener(...args: Parameters<EventTarget["removeEventListener"]>): void {
    this.listeners--;
    super.removeEventListener(...args);
  }
}

class FakeTrack extends Counted {
  kind = "video";
  readyState = "live";

  end(): void {
    this.readyState = "ended";
    this.dispatchEvent(new Event("ended"));
  }
}

class FakeVideo extends Counted {
  videoWidth = 0;
  videoHeight = 0;

  load(width: number, height: number): void {
    this.videoWidth = width;
    this.videoHeight = height;
    this.dispatchEvent(new Event("loadedmetadata"));
  }
}

/**
 * Waits for a promise to settle and returns its rejection reason.
 *
 * @param promise - The promise.
 * @returns The `StreamError` reason, or "resolved".
 */
const outcome = (promise: Promise<void>) =>
  promise.then(
    () => "resolved",
    (error: unknown) => (error instanceof StreamError ? error.reason : String(error)),
  );

describe("liveVideoTrack", () => {
  it("finds the first live video track", () => {
    const ended = Object.assign(new FakeTrack(), { readyState: "ended" });
    const audio = Object.assign(new FakeTrack(), { kind: "audio" });
    const live = new FakeTrack();

    expect(liveVideoTrack({ getVideoTracks: () => [ended, audio, live] })).toBe(live);
  });

  it("finds nothing in an empty, ended or invalid stream", () => {
    const ended = Object.assign(new FakeTrack(), { readyState: "ended" });

    expect(liveVideoTrack({ getVideoTracks: () => [] })).toBeUndefined();
    expect(liveVideoTrack({ getVideoTracks: () => [ended] })).toBeUndefined();
    expect(liveVideoTrack({} as never)).toBeUndefined();
    expect(liveVideoTrack(undefined)).toBeUndefined();
  });
});

describe("waitForVideo", () => {
  let video: FakeVideo;
  let track: FakeTrack;

  beforeEach(() => {
    vi.useFakeTimers();
    video = new FakeVideo();
    track = new FakeTrack();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Asserts that no listener is left on the video, the track or the signal. */
  const expectNoListeners = () => {
    expect(video.listeners).toBe(0);
    expect(track.listeners).toBe(0);
  };

  it("resolves at once when the size is known", async () => {
    video.videoWidth = 640;
    video.videoHeight = 480;

    expect(await outcome(waitForVideo(video, track, { timeoutMs: 100 }))).toBe("resolved");
    expectNoListeners();
  });

  it("resolves when metadata arrives, ignoring an event without a size", async () => {
    const wait = outcome(waitForVideo(video, track, { timeoutMs: 1000 }));
    video.dispatchEvent(new Event("resize"));
    video.load(640, 480);

    expect(await wait).toBe("resolved");
    expectNoListeners();
  });

  it("fails when no metadata arrives in time", async () => {
    const wait = outcome(waitForVideo(video, track, { timeoutMs: 500 }));
    await vi.advanceTimersByTimeAsync(499);
    expect(video.listeners).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(1);

    expect(await wait).toBe("start-timeout");
    expectNoListeners();
  });

  it("fails when the track ends while waiting", async () => {
    const wait = outcome(waitForVideo(video, track, { timeoutMs: 1000 }));
    track.end();

    expect(await wait).toBe("ended");
    expectNoListeners();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("fails on a media error", async () => {
    const wait = outcome(waitForVideo(video, track, { timeoutMs: 1000 }));
    video.dispatchEvent(new Event("error"));

    expect(await wait).toBe("media-error");
    expectNoListeners();
  });

  it("fails when aborted, before or while waiting", async () => {
    const before = new AbortController();
    before.abort();
    expect(
      await outcome(waitForVideo(video, track, { timeoutMs: 1000, signal: before.signal })),
    ).toBe("aborted");

    const during = new AbortController();
    const removed = vi.spyOn(during.signal, "removeEventListener");
    const wait = outcome(waitForVideo(video, track, { timeoutMs: 1000, signal: during.signal }));
    during.abort();

    expect(await wait).toBe("aborted");
    expect(removed).toHaveBeenCalledWith("abort", expect.any(Function));
    expectNoListeners();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("fails at once for a track that already ended", async () => {
    track.readyState = "ended";

    expect(await outcome(waitForVideo(video, track, { timeoutMs: 1000 }))).toBe("ended");
    expectNoListeners();
  });
});

describe("watchVideo", () => {
  it("reports a track that ends, once, and stops watching", () => {
    const video = new FakeVideo();
    const track = new FakeTrack();
    const failures: string[] = [];

    watchVideo(video, track, (reason) => failures.push(reason));
    track.end();
    track.dispatchEvent(new Event("ended"));
    video.dispatchEvent(new Event("error"));

    expect(failures).toEqual(["ended"]);
    expect(video.listeners + track.listeners).toBe(0);
  });

  it("reports a media error", () => {
    const video = new FakeVideo();
    const track = new FakeTrack();
    const failures: string[] = [];

    watchVideo(video, track, (reason) => failures.push(reason));
    video.dispatchEvent(new Event("error"));

    expect(failures).toEqual(["media-error"]);
    expect(video.listeners + track.listeners).toBe(0);
  });

  it("stops watching when asked, repeatedly", () => {
    const video = new FakeVideo();
    const track = new FakeTrack();
    const failures: string[] = [];

    const unwatch = watchVideo(video, track, (reason) => failures.push(reason));
    unwatch();
    unwatch();
    track.end();

    expect(failures).toEqual([]);
    expect(video.listeners + track.listeners).toBe(0);
  });
});

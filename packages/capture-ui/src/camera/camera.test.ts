import { describe, expect, it, vi } from "vitest";
import { cameraConstraints, openCamera, stopStream } from "./camera";

describe("cameraConstraints", () => {
  it("asks for the right camera and resolution", () => {
    expect(cameraConstraints("user")).toEqual({
      audio: false,
      video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    const back = cameraConstraints("environment").video as MediaTrackConstraints;
    expect(back.width).toEqual({ ideal: 1920 });
    const custom = cameraConstraints("user", 640).video as MediaTrackConstraints;
    expect(custom.height).toEqual({ ideal: 360 });
  });
});

describe("openCamera", () => {
  it("calls getUserMedia on mediaDevices", async () => {
    const stream = {} as MediaStream;
    const mediaDevices = {
      getUserMedia: vi.fn(function (this: unknown) {
        expect(this).toBe(mediaDevices);
        return Promise.resolve(stream);
      }),
    };
    await expect(openCamera({ video: true }, { mediaDevices })).resolves.toBe(stream);
  });

  it("throws a named error without getUserMedia", async () => {
    await expect(openCamera({ video: true }, {})).rejects.toMatchObject({
      name: "NotSupportedError",
    });
    await expect(openCamera({ video: true }, undefined)).rejects.toMatchObject({
      name: "NotSupportedError",
    });
    await expect(openCamera({ video: true })).rejects.toMatchObject({ name: "NotSupportedError" });
  });
});

describe("stopStream", () => {
  it("stops every track", () => {
    const stop = vi.fn();
    stopStream({ getTracks: () => [{ stop }, { stop }] as unknown as MediaStreamTrack[] });
    expect(stop).toHaveBeenCalledTimes(2);
    expect(() => stopStream(undefined)).not.toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { cameraContext, classifyCameraError, isFramed, policyAllowsCamera } from "./errors";

const ctx = { secure: true, supported: true, inFrame: false, policyAllows: undefined };
const err = (name: string) => Object.assign(new Error(name), { name });

describe("classifyCameraError", () => {
  it("checks the page before the error", () => {
    expect(classifyCameraError(err("NotAllowedError"), { ...ctx, secure: false })).toBe("insecure");
    expect(classifyCameraError(err("NotAllowedError"), { ...ctx, policyAllows: false })).toBe(
      "blocked-frame",
    );
    expect(classifyCameraError(undefined, { ...ctx, supported: false })).toBe("unavailable");
  });

  it("maps browser errors", () => {
    expect(classifyCameraError(err("NotAllowedError"), ctx)).toBe("denied");
    expect(classifyCameraError(err("PermissionDeniedError"), ctx)).toBe("denied");
    expect(classifyCameraError(err("SecurityError"), ctx)).toBe("denied");
    expect(classifyCameraError(err("NotFoundError"), ctx)).toBe("unavailable");
    expect(classifyCameraError(err("DevicesNotFoundError"), ctx)).toBe("unavailable");
    expect(classifyCameraError(err("OverconstrainedError"), ctx)).toBe("unavailable");
    expect(classifyCameraError(err("NotReadableError"), ctx)).toBe("in-use");
    expect(classifyCameraError(err("TrackStartError"), ctx)).toBe("in-use");
    expect(classifyCameraError(err("AbortError"), ctx)).toBe("in-use");
    expect(classifyCameraError(err("Whatever"), ctx)).toBe("unknown");
    expect(classifyCameraError(null, ctx)).toBe("unknown");
  });

  it("reads a denial inside a frame with an unknown policy as the frame blocking it", () => {
    expect(classifyCameraError(err("NotAllowedError"), { ...ctx, inFrame: true })).toBe(
      "blocked-frame",
    );
    expect(
      classifyCameraError(err("NotAllowedError"), { ...ctx, inFrame: true, policyAllows: true }),
    ).toBe("denied");
  });
});

describe("policyAllowsCamera", () => {
  it("asks permissionsPolicy, then featurePolicy", () => {
    expect(policyAllowsCamera({ permissionsPolicy: { allowsFeature: () => false } })).toBe(false);
    expect(policyAllowsCamera({ featurePolicy: { allowsFeature: (f) => f === "camera" } })).toBe(
      true,
    );
  });

  it("is unknown without a policy or when it throws", () => {
    expect(policyAllowsCamera(undefined)).toBeUndefined();
    expect(policyAllowsCamera({})).toBeUndefined();
    expect(
      policyAllowsCamera({ permissionsPolicy: {} as { allowsFeature: (f: string) => boolean } }),
    ).toBeUndefined();
    expect(
      policyAllowsCamera({
        permissionsPolicy: {
          allowsFeature: () => {
            throw new Error("nope");
          },
        },
      }),
    ).toBeUndefined();
  });
});

describe("isFramed", () => {
  it("compares self and top", () => {
    const w = {} as { self: unknown; top: unknown };
    w.self = w;
    w.top = w;
    expect(isFramed(w)).toBe(false);
    expect(isFramed({ self: 1, top: 2 })).toBe(true);
    expect(isFramed(undefined)).toBe(false);
  });

  it("treats an inaccessible top as framed", () => {
    const w = {
      self: 1,
      get top(): unknown {
        throw new Error("cross-origin");
      },
    };
    expect(isFramed(w)).toBe(true);
  });
});

describe("cameraContext", () => {
  it("collects facts from a window", () => {
    const win = {
      isSecureContext: true,
      navigator: { mediaDevices: { getUserMedia: () => undefined } },
      document: { permissionsPolicy: { allowsFeature: () => true } },
    } as unknown as Window & typeof globalThis;
    Object.assign(win, { self: win, top: win });
    expect(cameraContext(win)).toEqual({
      secure: true,
      supported: true,
      inFrame: false,
      policyAllows: true,
    });
  });

  it("is safe without a window", () => {
    expect(cameraContext(undefined)).toEqual({
      secure: false,
      supported: false,
      inFrame: false,
      policyAllows: undefined,
    });
    expect(cameraContext().secure).toBe(false);
  });
});

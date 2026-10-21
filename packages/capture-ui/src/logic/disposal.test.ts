import { describe, expect, it, vi } from "vitest";
import { createBlobUrls, showBlobImage, zeroCanvas } from "./disposal";

/** A Blob URL API that records what it was asked. */
const recordingApi = () => {
  let next = 0;
  const revoked: string[] = [];
  return {
    revoked,
    createObjectURL: vi.fn(() => `blob:test/${++next}`),
    revokeObjectURL: vi.fn((url: string) => {
      revoked.push(url);
    }),
  };
};

/** An `<img>` stand-in. */
class FakeImage extends EventTarget {
  src = "";
  listeners = 0;

  override addEventListener(...args: Parameters<EventTarget["addEventListener"]>): void {
    this.listeners++;
    super.addEventListener(...args);
  }

  override removeEventListener(...args: Parameters<EventTarget["removeEventListener"]>): void {
    this.listeners--;
    super.removeEventListener(...args);
  }

  removeAttribute(name: string): void {
    if (name === "src") this.src = "";
  }
}

const blob = new Blob(["x"], { type: "image/jpeg" });

describe("zeroCanvas", () => {
  it("frees a canvas by setting its size to zero, and ignores none", () => {
    const canvas = { width: 640, height: 480 };
    zeroCanvas(canvas);
    zeroCanvas(undefined);
    expect(canvas).toEqual({ width: 0, height: 0 });
  });
});

describe("createBlobUrls", () => {
  it("revokes every URL it created, once", () => {
    const api = recordingApi();
    const urls = createBlobUrls(api);
    const a = urls.create(blob);
    const b = urls.create(blob);
    expect(urls.size).toBe(2);

    urls.revoke(a);
    urls.revoke(a);
    urls.revoke("blob:someone-else");
    urls.revokeAll();
    urls.revokeAll();

    expect(api.revoked).toEqual([a, b]);
    expect(urls.size).toBe(0);
  });

  it("uses the global URL by default", () => {
    const create = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:global");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockReturnValue(undefined);
    const urls = createBlobUrls();

    urls.create(blob);
    urls.revokeAll();

    expect(create).toHaveBeenCalledWith(blob);
    expect(revoke).toHaveBeenCalledWith("blob:global");
    create.mockRestore();
    revoke.mockRestore();
  });
});

describe("showBlobImage", () => {
  it("revokes the URL once the image has loaded, keeping the picture", async () => {
    const api = recordingApi();
    const urls = createBlobUrls(api);
    const image = new FakeImage();

    const shown = showBlobImage(image, blob, urls);
    expect(image.src).toBe("blob:test/1");
    expect(urls.size).toBe(1);
    image.dispatchEvent(new Event("load"));

    expect(await shown).toBe(true);
    expect(api.revoked).toEqual(["blob:test/1"]);
    expect(image.src).toBe("blob:test/1");
    expect(image.listeners).toBe(0);
  });

  it("revokes the URL and clears the image when it fails to decode", async () => {
    const api = recordingApi();
    const urls = createBlobUrls(api);
    const image = new FakeImage();

    const shown = showBlobImage(image, blob, urls);
    image.dispatchEvent(new Event("error"));

    expect(await shown).toBe(false);
    expect(image.src).toBe("");
    expect(urls.size).toBe(0);
    expect(image.listeners).toBe(0);
  });

  it("stops waiting and revokes when aborted, before or while loading", async () => {
    const api = recordingApi();
    const urls = createBlobUrls(api);
    const image = new FakeImage();
    const during = new AbortController();

    const shown = showBlobImage(image, blob, urls, during.signal);
    during.abort();
    const before = new AbortController();
    before.abort();

    expect(await shown).toBe(false);
    expect(await showBlobImage(image, blob, urls, before.signal)).toBe(false);
    expect(urls.size).toBe(0);
    expect(api.createObjectURL).toHaveBeenCalledTimes(1);
    expect(api.revoked).toEqual(["blob:test/1"]);
    expect(image.listeners).toBe(0);
  });
});

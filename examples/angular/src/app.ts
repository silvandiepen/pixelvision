import { ChangeDetectionStrategy, Component, signal, viewChild } from "@angular/core";
import type { ElementRef } from "@angular/core";
import { detect } from "./detect";
import { drawResult, formatCorners, readCameraFrame, readImageFile } from "./pixels";

/**
 * Upload a photo (or take one with the camera), find the document in it,
 * and draw the edges and the document's outline.
 */
@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  protected readonly status = signal("Choose a photo or use the camera.");
  protected readonly found = signal<boolean | undefined>(undefined);
  protected readonly corners = signal("");
  protected readonly readCameraFrame = readCameraFrame;

  /**
   * Reads a photo, finds the document in it and shows the result.
   *
   * @param read - Gets the photo's pixels.
   */
  protected async scan(read: () => Promise<ImageData>): Promise<void> {
    this.status.set("Looking for a document…");
    this.found.set(undefined);
    try {
      const result = detect(await read());
      drawResult(this.canvas().nativeElement, result);
      this.found.set(Boolean(result.corners));
      this.corners.set(result.corners ? formatCorners(result.corners) : "");
      this.status.set(result.corners ? "Found a document." : "No document found.");
    } catch (error) {
      this.status.set(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Scans the file the person picked.
   *
   * @param event - The file input's change event.
   */
  protected onUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) void this.scan(() => readImageFile(file));
  }
}

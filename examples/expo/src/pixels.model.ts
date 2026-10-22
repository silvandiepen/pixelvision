import type { ImageLike } from "pixelvision";

/** A photo ready for {@link detect}: a JPEG on disk to show, and its pixels. */
export interface Photo {
  /** A `file://` URI of the (scaled-down) JPEG, for `<Image>`. */
  uri: string;
  /** Its RGBA pixels, at the same size as the JPEG. */
  image: ImageLike & { data: Uint8Array };
}

/** An image to read: where it is and how big it is. */
export interface ImageSource {
  /** A local URI (`file://`, or `ph://` from the photo library). */
  uri: string;
  /** Its width in pixels. */
  width: number;
  /** Its height in pixels. */
  height: number;
}

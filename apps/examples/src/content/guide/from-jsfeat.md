If you have code written for jsfeat, this page shows which pixelvision function replaces each jsfeat call. pixelvision isn't a drop-in replacement: it has its own typed API with named options and returned results. Of the {{jsfeatRows}} jsfeat calls below, {{jsfeatIdentical}} give identical output; the rest are listed with how they behave, and the section after the table describes every difference in detail.

## What maps to what

| jsfeat                           | pixelvision                                   | Parity                                                               |
| -------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `matrix_t`, `data_t`, `cache`    | `createMatrix`, `cloneMatrix`, optional `out` | — (replaced)                                                         |
| —                                | `fromImageData`, `toImageData`                | new                                                                  |
| `math.get_gaussian_kernel`       | `gaussianKernel`                              | identical                                                            |
| `imgproc.grayscale`              | `grayscale`                                   | identical                                                            |
| `imgproc.resample`               | `resample`                                    | identical when shrinking 1 channel; fixed for colour, adds enlarging |
| `imgproc.box_blur_gray`          | `boxBlur`, `boxSum`                           | identical; fixed for large radii; any channels                       |
| `imgproc.gaussian_blur`          | `gaussianBlur`                                | identical; any channels                                              |
| `imgproc.pyrdown`                | `pyrDown`                                     | identical; any channels                                              |
| `imgproc.sobel_derivatives`      | `sobelDerivatives`                            | identical; fixed for 1-pixel-tall images                             |
| `imgproc.scharr_derivatives`     | `scharrDerivatives`                           | identical; fixed for 1-pixel-tall images                             |
| `imgproc.compute_integral_image` | `integralImage`                               | identical; no overflow                                               |
| `imgproc.equalize_histogram`     | `equalizeHistogram`                           | identical                                                            |
| `imgproc.canny`                  | `canny`                                       | identical except the bottom-row fix                                  |
| `imgproc.warp_perspective`       | `warpPerspective`                             | identical inside the image; fixed edges; any channels                |
| `imgproc.warp_affine`            | `warpAffine`                                  | identical inside the image; fixed edges; any channels                |
| `imgproc.skindetector`           | `detectSkin`                                  | identical                                                            |
| `imgproc.hough_transform`        | `houghLines`                                  | jsfeat's throws; tested on known lines                               |

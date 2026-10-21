This guide is still being written. Until then, this table maps the most common OpenCV.js calls to their pixelvision equivalents.

| OpenCV.js                                   | pixelvision                             |
| ------------------------------------------- | --------------------------------------- |
| `cv.matFromImageData`, `cv.imshow`          | `fromImageData`, `toImageData`          |
| `cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY)` | `grayscale`                             |
| `cv.GaussianBlur`, `cv.blur`                | `gaussianBlur`, `boxBlur`               |
| `cv.Sobel`, `cv.Scharr`                     | `sobelDerivatives`, `scharrDerivatives` |
| `cv.Canny`                                  | `canny`                                 |
| `cv.HoughLines`                             | `houghLines`                            |
| `cv.equalizeHist`                           | `equalizeHistogram`                     |
| `cv.integral`                               | `integralImage`                         |
| `cv.threshold` (with `THRESH_OTSU`)         | `threshold`, `otsuLevel`                |
| `cv.erode`, `cv.dilate`                     | `erode`, `dilate`                       |
| `cv.findContours`                           | `findContours`                          |
| `cv.approxPolyDP`, `cv.arcLength`           | `approxPolygon`, `arcLength`            |
| `cv.contourArea`, `cv.isContourConvex`      | `contourArea`, `isConvex`               |
| `cv.pyrDown`, `cv.resize`, `cv.flip`        | `pyrDown`, `resample`, `flip`           |
| `cv.getPerspectiveTransform`                | `perspectiveTransform`                  |
| `cv.getAffineTransform`                     | `affineTransform`                       |
| `cv.warpPerspective`, `cv.warpAffine`       | `warpPerspective`, `warpAffine`         |
| `cv.findHomography`                         | `estimateHomography`                    |
| `cv.estimateAffine2D`                       | `estimateAffine`                        |
| `cv.calcOpticalFlowPyrLK`                   | `trackPoints` (with `buildPyramid`)     |
| `cv.FastFeatureDetector`                    | `detectFast`                            |
| `cv.ORB` (describe), `cv.BFMatcher`         | `describeOrb`, `matchDescriptors`       |
| `cv.CascadeClassifier.detectMultiScale`     | `detectHaar`                            |
| `cv.groupRectangles`                        | `groupRectangles`                       |
| `cv.solve`, `cv.SVDecomp`, `cv.eigen`       | `luSolve`, `svd`, `eigenSymmetric`      |

## The main differences

- **No memory to free.** Matrices are plain objects over typed arrays, collected like any other JavaScript value. There is no `delete()`.
- **Results are returned.** Functions return their output; pass `out` to reuse a matrix instead of passing a destination.
- **Options are named**, for example `canny(gray, { low, high })`, instead of positional arguments.
- **Much smaller.** pixelvision has no WebAssembly binary to load, and covers far less than OpenCV: if you need something that isn't in the table, OpenCV.js is likely the better tool.

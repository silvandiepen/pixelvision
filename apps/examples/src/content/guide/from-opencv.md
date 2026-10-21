pixelvision covers the parts of OpenCV.js that web and React Native apps use most: colour conversion, filtering, thresholds, morphology, contours and shapes, geometry, features, tracking and face detection. Each function listed below is tested against OpenCV.js 4.12 on the same images, and gives the same result unless the table says otherwise.

## Size

| What you load                                        | Raw     | Gzipped |
| ---------------------------------------------------- | ------- | ------- |
| OpenCV.js 4.12 (`@techstark/opencv-js`)              | 10.9 MB | 3.5 MB  |
| pixelvision, everything                              | 167 KB  | 43 KB   |
| pixelvision, `findDocument` + `extractDocument` only | 18 KB   | 7.9 KB  |

pixelvision is plain JavaScript with no WebAssembly, so there is nothing to wait for before the first call, and bundlers drop the functions you don't import. Measured on the minified builds of pixelvision and OpenCV.js 4.12.0.

## Calls

| OpenCV.js                                                     | pixelvision                                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `cv.matFromImageData`, `cv.imshow`                            | `fromImageData`, `toImageData`                                                                        |
| `cv.cvtColor` to gray                                         | `grayscale`                                                                                           |
| `cv.cvtColor` to / from HSV, HLS, Lab, YCrCb                  | `rgbToHsv`, `rgbToHls`, `rgbToLab`, `rgbToYCrCb` and `hsvToRgb`, `hlsToRgb`, `labToRgb`, `yCrCbToRgb` |
| `cv.inRange`                                                  | `inRange`                                                                                             |
| `cv.GaussianBlur`, `cv.blur`, `cv.medianBlur`                 | `gaussianBlur`, `boxBlur`, `medianBlur`                                                               |
| `cv.bilateralFilter`, `cv.filter2D`                           | `bilateralFilter`, `filter2D`                                                                         |
| `cv.Sobel`, `cv.Scharr`, `cv.Laplacian`                       | `sobelDerivatives`, `scharrDerivatives`, `laplacian`                                                  |
| `cv.Canny`                                                    | `canny`                                                                                               |
| `cv.equalizeHist`, `cv.CLAHE`, `cv.calcHist`                  | `equalizeHistogram`, `clahe`, `calcHist`                                                              |
| `cv.integral`                                                 | `integralImage`                                                                                       |
| `cv.threshold` (binary, Otsu), `cv.adaptiveThreshold`         | `threshold`, `otsuLevel`, `adaptiveThreshold`                                                         |
| `cv.erode`, `cv.dilate`, `cv.morphologyEx`                    | `erode`, `dilate`, `morphology`                                                                       |
| `cv.distanceTransform`, `cv.floodFill`                        | `distanceTransform`, `floodFill`                                                                      |
| `cv.connectedComponentsWithStats`                             | `connectedComponents`                                                                                 |
| `cv.findContours`                                             | `findContours`                                                                                        |
| `cv.approxPolyDP`, `cv.arcLength`, `cv.contourArea`           | `approxPolygon`, `arcLength`, `contourArea`                                                           |
| `cv.isContourConvex`, `cv.convexHull`                         | `isConvex`, `convexHull`                                                                              |
| `cv.boundingRect`, `cv.minAreaRect`                           | `boundingRect`, `minAreaRect`                                                                         |
| `cv.moments`, `cv.HuMoments`                                  | `moments`, `huMoments`                                                                                |
| `cv.matchTemplate`, `cv.minMaxLoc`                            | `matchTemplate`, `minMaxLoc`                                                                          |
| `cv.pyrDown`, `cv.resize`, `cv.flip`                          | `pyrDown`, `resample`, `flip`                                                                         |
| `cv.getPerspectiveTransform`, `cv.getAffineTransform`         | `perspectiveTransform`, `affineTransform`                                                             |
| `cv.warpPerspective`, `cv.warpAffine`                         | `warpPerspective`, `warpAffine`                                                                       |
| `cv.findHomography`, `cv.estimateAffine2D`                    | `estimateHomography`, `estimateAffine`                                                                |
| `cv.HoughLines`                                               | `houghLines`                                                                                          |
| `cv.calcOpticalFlowPyrLK`                                     | `trackPoints` (with `buildPyramid`)                                                                   |
| `cv.FastFeatureDetector`                                      | `detectFast`                                                                                          |
| `cv.ORB` (describe), `cv.BFMatcher` (Hamming)                 | `describeOrb`, `matchDescriptors`                                                                     |
| `cv.CascadeClassifier.detectMultiScale`, `cv.groupRectangles` | `detectHaar`, `groupRectangles`                                                                       |
| `cv.solve`, `cv.SVDecomp`, `cv.eigen`                         | `luSolve`, `svd`, `eigenSymmetric`                                                                    |

Where results aren't identical:

- **`gaussianBlur`** rounds after each of its two passes, so it can be 1–2 levels lower than OpenCV, never higher.
- **`warpPerspective`, `warpAffine`** sample at exact positions; OpenCV rounds positions to 1/32 pixel, which moves values on hard edges by a few levels.
- **`adaptiveThreshold`** with the Gaussian method uses an exact mean, so under 1% of pixels can fall on the other side.
- **`matchTemplate`** sums in double precision. OpenCV correlates in single precision, so its squared-difference score for an exact match isn't 0; pixelvision's is.
- **`filter2D`** with kernels of 50 weights or more: OpenCV switches to a Fourier transform there, which can move results by one level.
- **Borders** repeat the edge pixel (`BORDER_REPLICATE`) wherever a function takes a neighbourhood.

## Working differently

- **No memory to free.** Matrices are plain objects over typed arrays, collected like any other value. There is no `delete()` and no `Mat` leak to chase.
- **Results are returned.** Pass `out` to reuse a matrix instead of passing a destination.
- **Options are named**, for example `canny(gray, { low, high })`, instead of positional arguments and flag constants.
- **Higher-level pieces are included**: `findDocument` and `extractDocument` for scanning, `createDocumentTracker` for a steady camera capture, `detectHeadPose` and `createHeadTurnChallenge` for a head-turn check.

## Not covered

DNN, machine learning, camera calibration and `solvePnP`, stitching, video I/O, `HoughLinesP`, `HoughCircles`, mean-shift tracking, QR codes and ArUco markers. If you need those, OpenCV.js is the better tool; you can use both in one app.

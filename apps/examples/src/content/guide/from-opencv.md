pixelvision covers the parts of OpenCV.js that web and React Native apps use most: colour conversion, filtering, thresholds, morphology, contours and shapes, geometry, camera pose, features, tracking, face detection, QR codes and ArUco markers. Each function listed below is tested against OpenCV.js 4.12 on the same images, and gives the same result unless the table says otherwise.

## Size

| What you load                                        | Raw     | Gzipped |
| ---------------------------------------------------- | ------- | ------- |
| OpenCV.js 4.12 (`@techstark/opencv-js`)              | 10.9 MB | 3.5 MB  |
| pixelvision, everything                              | 119 KB  | 50 KB   |
| pixelvision, `readQrCode` only                       | 30 KB   | 13 KB   |
| pixelvision, `findDocument` + `extractDocument` only | 19 KB   | 8.6 KB  |

pixelvision is plain JavaScript with no WebAssembly, so there is nothing to wait for before the first call, and bundlers drop the functions you don't import. Sizes are bundled and minified, as an app ships them: pixelvision with esbuild, OpenCV.js 4.12.0 as published (already minified).

## Calls

| OpenCV.js                                                                | pixelvision                                                                                           |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `cv.matFromImageData`, `cv.imshow`                                       | `fromImageData`, `toImageData`                                                                        |
| `cv.cvtColor` to gray                                                    | `grayscale`                                                                                           |
| `cv.cvtColor` to / from HSV, HLS, Lab, YCrCb                             | `rgbToHsv`, `rgbToHls`, `rgbToLab`, `rgbToYCrCb` and `hsvToRgb`, `hlsToRgb`, `labToRgb`, `yCrCbToRgb` |
| `cv.inRange`                                                             | `inRange`                                                                                             |
| `cv.GaussianBlur`, `cv.blur`, `cv.medianBlur`                            | `gaussianBlur`, `boxBlur`, `medianBlur`                                                               |
| `cv.bilateralFilter`, `cv.filter2D`                                      | `bilateralFilter`, `filter2D`                                                                         |
| `cv.Sobel`, `cv.Scharr`, `cv.Laplacian`                                  | `sobelDerivatives`, `scharrDerivatives`, `laplacian`                                                  |
| `cv.Canny`                                                               | `canny`                                                                                               |
| `cv.equalizeHist`, `cv.CLAHE`, `cv.calcHist`                             | `equalizeHistogram`, `clahe`, `calcHist`                                                              |
| `cv.calcBackProject`                                                     | `calcBackProject`                                                                                     |
| `cv.integral`                                                            | `integralImage`                                                                                       |
| `cv.threshold` (binary, Otsu), `cv.adaptiveThreshold`                    | `threshold`, `otsuLevel`, `adaptiveThreshold`                                                         |
| `cv.erode`, `cv.dilate`, `cv.morphologyEx`                               | `erode`, `dilate`, `morphology`                                                                       |
| `cv.distanceTransform`, `cv.floodFill`                                   | `distanceTransform`, `floodFill`                                                                      |
| `cv.connectedComponentsWithStats`                                        | `connectedComponents`                                                                                 |
| `cv.findContours`                                                        | `findContours`                                                                                        |
| `cv.approxPolyDP`, `cv.arcLength`, `cv.contourArea`                      | `approxPolygon`, `arcLength`, `contourArea`                                                           |
| `cv.isContourConvex`, `cv.convexHull`                                    | `isConvex`, `convexHull`                                                                              |
| `cv.boundingRect`, `cv.minAreaRect`                                      | `boundingRect`, `minAreaRect`                                                                         |
| `cv.moments`, `cv.HuMoments`                                             | `moments`, `huMoments`                                                                                |
| `cv.matchTemplate`, `cv.minMaxLoc`                                       | `matchTemplate`, `minMaxLoc`                                                                          |
| `cv.pyrDown`, `cv.resize`, `cv.flip`                                     | `pyrDown`, `resample`, `flip`                                                                         |
| `cv.getPerspectiveTransform`, `cv.getAffineTransform`                    | `perspectiveTransform`, `affineTransform`                                                             |
| `cv.warpPerspective`, `cv.warpAffine`                                    | `warpPerspective`, `warpAffine`                                                                       |
| `cv.findHomography`, `cv.estimateAffine2D`                               | `estimateHomography`, `estimateAffine`                                                                |
| `cv.HoughLines`, `cv.HoughLinesP`                                        | `houghLines`, `houghLinesP`                                                                           |
| `cv.HoughCircles` (`HOUGH_GRADIENT`)                                     | `houghCircles` (`param1` is `cannyThreshold`, `param2` is `accumulatorThreshold`)                     |
| `cv.calcOpticalFlowPyrLK`                                                | `trackPoints` (with `buildPyramid`)                                                                   |
| `cv.meanShift`, `cv.CamShift`                                            | `meanShift`, `camShift` (`TermCriteria` is `maxIterations`, `epsilon`)                                |
| `cv.solvePnP` (`SOLVEPNP_ITERATIVE`), `cv.projectPoints`, `cv.Rodrigues` | `solvePnP`, `projectPoints`, `rodrigues`                                                              |
| `cv.FastFeatureDetector`                                                 | `detectFast`                                                                                          |
| `cv.ORB` (describe), `cv.BFMatcher` (Hamming)                            | `describeOrb`, `matchDescriptors`                                                                     |
| `cv.CascadeClassifier.detectMultiScale`, `cv.groupRectangles`            | `detectHaar`, `groupRectangles`                                                                       |
| `cv.CascadeClassifier.load` (a `haarcascade_*.xml` file)                 | `loadOpenCvCascade` (pass the file's text)                                                            |
| `cv.QRCodeDetector.detectAndDecode`                                      | `readQrCode` (text and corners in one call)                                                           |
| `cv.aruco_ArucoDetector.detectMarkers`                                   | `detectArucoMarkers` (`DICT_4X4_50`, `DICT_6X6_250`)                                                  |
| `cv.getPredefinedDictionary(…).generateImageMarker`                      | `generateArucoMarker`                                                                                 |
| `cv.solve`, `cv.SVDecomp`, `cv.eigen`                                    | `luSolve`, `svd`, `eigenSymmetric`                                                                    |

Where results aren't identical:

- **`gaussianBlur`** rounds after each of its two passes, so it can be 1–2 levels lower than OpenCV, never higher.
- **`warpPerspective`, `warpAffine`** sample at exact positions; OpenCV rounds positions to 1/32 pixel, which moves values on hard edges by a few levels.
- **`adaptiveThreshold`** with the Gaussian method uses an exact mean, so under 1% of pixels can fall on the other side.
- **`matchTemplate`** sums in double precision. OpenCV correlates in single precision, so its squared-difference score for an exact match isn't 0; pixelvision's is.
- **`filter2D`** with kernels of 50 weights or more: OpenCV switches to a Fourier transform there, which can move results by one level.
- **`houghLinesP`** gives OpenCV's segments with the default `seed`. Another seed visits the edge pixels in another order, which can end or split a slanted segment differently.
- **`houghCircles`** finds the same candidate centres. Radii can differ by a pixel or so: OpenCV leaves out one distance bin per radius it scores and reports radii half a bin low, and pixelvision fixes both, which makes radii slightly more accurate. A circle at the edge of `accumulatorThreshold` can be kept by one and not the other.
- **`solvePnP`** refines until the steps reach double-precision rounding; OpenCV stops at single-precision steps. Poses agree within 1e-7, and pixelvision's reprojection error on exact data is far below a millionth of a pixel. Lens distortion is radial only: `k1` and `k2`.
- **`rodrigues`** and **`projectPoints`** agree within rounding, except that `rodrigues` keeps rotations under 1e-5 radians, which OpenCV returns as zero.
- **`camShift`** returns OpenCV's window exactly and its box to single precision, but the box's centre is the centroid. OpenCV reports the centre of its whole-pixel window, up to a pixel away, and further when the window touches the left or top edge.
- **`detectHaar`** with a cascade from `loadOpenCvCascade` scores a window at the cascade's own size exactly as OpenCV does. At larger sizes it scales the features where OpenCV scales the image, so raw hits differ; the merged detections agree within OpenCV's grouping tolerance.
- **`readQrCode`** returns the same text. OpenCV takes three corners from the finder patterns (within 3 pixels of pixelvision's) and extrapolates the fourth, up to 10 pixels off on tilted codes; pixelvision fits all four to the whole symbol, within 2.5 pixels. It also reads some codes OpenCV.js 4.12 misses, including a clean version 1 code it doesn't find at all. Versions 1 to 10 only, no Kanji.
- **`detectArucoMarkers`** gives OpenCV's ids and corners. It also finds a marker on a card whose edge runs close to it; OpenCV.js 4.12 loses some of those. No corner refinement, no inverted markers.
- **`approxPolygon`** gives `approxPolyDP`'s vertices for the same list of points. `findContours` traces each outline the other way round from the same first pixel, so on its outlines the vertices come in the opposite order, and where two points are equally far from a chord the other one can be kept.
- **Borders** repeat the edge pixel (`BORDER_REPLICATE`) wherever a function takes a neighbourhood.

## Working differently

- **No memory to free.** Matrices are plain objects over typed arrays, collected like any other value. There is no `delete()` and no `Mat` leak to chase.
- **Results are returned.** Pass `out` to reuse a matrix instead of passing a destination.
- **Options are named**, for example `canny(gray, { low, high })`, instead of positional arguments and flag constants.
- **Higher-level pieces are included**: `findDocument` and `extractDocument` for scanning, `createDocumentTracker` for a steady camera capture, `detectHeadPose` and `createHeadTurnChallenge` for a head-turn check.

## Not covered

DNN, machine learning, camera calibration, `solvePnP` methods other than the iterative one, lens distortion beyond `k1` and `k2`, stitching, video I/O, QR codes above version 10, ArUco dictionaries other than `DICT_4X4_50` and `DICT_6X6_250`, ChArUco boards, AprilTags, barcodes, and LBP or HOG cascades. If you need those, OpenCV.js is the better tool; you can use both in one app.

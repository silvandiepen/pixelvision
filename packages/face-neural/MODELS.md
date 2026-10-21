# Models

## YuNet face detector — `models/face_detection_yunet_2023mar.onnx`

- Source: https://huggingface.co/opencv/face_detection_yunet (OpenCV Zoo), file
  `face_detection_yunet_2023mar.onnx`, unmodified.
- Licence: MIT, Copyright (c) 2020 Shiqi Yu <shiqi.yu@gmail.com>.
- Paper: Wu, W., Peng, H. & Yu, S. "YuNet: A Tiny Millisecond-level Face Detector",
  Machine Intelligence Research, 2023.
- Input: 1x3x640x640 float32, BGR, 0–255. Outputs: `cls`, `obj`, `bbox`, `kps` at strides 8, 16,
  32 (decoded as OpenCV's `FaceDetectorYN`).

```
MIT License

Copyright (c) 2020 Shiqi Yu <shiqi.yu@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Not shipped, and never to be: InsightFace / InspireFace / SCRFD / RetinaFace weights (licensed for
non-commercial research only).

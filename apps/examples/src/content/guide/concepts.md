## The matrix

Every image and every numeric result is a plain object:

```ts
interface Matrix {
  type: "u8" | "i32" | "f32" | "f64";
  width: number; // columns
  height: number; // rows
  channels: number; // values per pixel
  data: Uint8Array | Int32Array | Float32Array | Float64Array;
}
```

There are no classes and nothing to free. Values are stored row by row, with the channels of one pixel next to each other. Channel `c` of the pixel in column `x`, row `y` is:

```ts
matrix.data[(y * matrix.width + x) * matrix.channels + c];
```

Create one with `createMatrix(width, height, { type, channels })`, copy one with `cloneMatrix`, or wrap an existing array with `createMatrix(width, height, { data })`.

## Pixel types

| Type  | Array          | Range              | Used for                                                  |
| ----- | -------------- | ------------------ | --------------------------------------------------------- |
| `u8`  | `Uint8Array`   | 0 to 255           | Images, masks, edge maps, binary descriptors              |
| `i32` | `Int32Array`   | about ±2.1 billion | Gradients (`sobelDerivatives`) and window sums (`boxSum`) |
| `f32` | `Float32Array` | float              | Gradients of float images                                 |
| `f64` | `Float64Array` | double             | Integral images and all linear algebra                    |

Functions say which types they accept. Passing the wrong one throws a `TypeError` rather than quietly producing nonsense.

## Channels

| Channels | Meaning                                          |
| -------- | ------------------------------------------------ |
| 1        | Gray, a mask, or a single-channel numeric matrix |
| 2        | Gradients: `[gx, gy]` per pixel                  |
| 3        | RGB (or BGR; `grayscale` takes an `order`)       |
| 4        | RGBA, as in a canvas `ImageData`                 |

Filters such as `gaussianBlur`, `boxBlur`, `pyrDown`, `resample` and the warps work on every channel separately, so they handle colour directly. Detectors and edge functions work on gray.

## Coordinates

- `x` grows to the right and `y` grows down. `(0, 0)` is the top-left pixel.
- Points are `{ x, y }` objects in pixels; pixel `(x, y)` is the integer position of its own value.
- Transforms are 3 x 3 matrices stored row by row as 9 numbers (a `Float64Array`), applied to `(x, y, 1)`. `transformPoint` applies one to a point.
- Warps (`warpPerspective`, `warpAffine`) map **output** pixels to **input** pixels. To move an image by a transform, pass its inverse; to straighten a quadrilateral, compute `perspectiveTransform(outputCorners, photoCorners)`.
- Lines from `houghLines` are in normal form: the points where `x · cos θ + y · sin θ = ρ`, with ρ measured from the top-left corner and θ in `[0, π)`.
- Angles are in radians.

## Rounding

8-bit and `i32` results are rounded down, so integer output is exact and repeatable on every platform. `grayscale`, `gaussianBlur` on 8-bit images and `resample` when shrinking 8-bit images use fixed-point weights, the standard fast path for 8-bit pixels. Float results are computed in double precision, and linear algebra iterates to double precision too.

## Errors

Functions throw instead of returning garbage: a `TypeError` when a matrix has the wrong element type, and a `RangeError` for a wrong size, channel count or option, or a degenerate input such as a singular matrix or three collinear corners. Every function's `@throws` is listed in the [API reference](/api).

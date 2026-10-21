# pixelvision · Web Worker

pixelvision in a Web Worker, so the page stays responsive while it works. The photo's pixels are transferred to the worker (not copied), and the edge map is transferred back.

Upload a photo of a document (or take one with the camera). The page runs `grayscale` and
`canny` for an edge map, finds the document with `findDocument`, and draws the edges with the
document's outline on a canvas. The corners are also published on the canvas as
`data-corners="x,y x,y x,y x,y"` (top-left, top-right, bottom-right, bottom-left).

## Files

- `src/main.ts`: wires the file input and the camera button to the scan.
- `src/detectInWorker.ts`: starts the worker and turns each request into a promise.
- `src/detect.worker.ts`: the worker: runs `detect` and posts the result back.
- `src/detect.ts`: the pixelvision part: edges and document corners.
- `src/pixels.ts`: reads pixels from a file or the camera, and draws the result.

## Run

From the repository root:

```sh
pnpm install
pnpm --filter pixelvision build
pnpm --filter @pixelvision/example-worker dev
```

`pnpm build` and `pnpm preview` serve the production build on port 4325. The browser tests live in
[`examples/e2e`](../e2e).

To use this outside the repository, replace `"pixelvision": "workspace:*"` in `package.json` with
a version from npm.

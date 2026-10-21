# pixelvision · Angular

pixelvision in an Angular app: one standalone component with signals, built with the Angular CLI's
application builder.

Upload a photo of a document (or take one with the camera). The page runs `grayscale` and
`canny` for an edge map, finds the document with `findDocument`, and draws the edges with the
document's outline on a canvas. The corners are also published on the canvas as
`data-corners="x,y x,y x,y x,y"` (top-left, top-right, bottom-right, bottom-left).

## Files

- `src/app.ts` and `src/app.html`: the page component and its template.
- `src/detect.ts`: the pixelvision part: edges and document corners.
- `src/pixels.ts`: reads pixels from a file or the camera, and draws the result.
- `angular.json`: the build (`@angular/build:application`) and dev server.

## Run

From the repository root:

```sh
pnpm install
pnpm --filter pixelvision build
pnpm --filter @pixelvision/example-angular dev
```

`pnpm build` writes the production build to `dist/browser`, and `pnpm preview` serves it on port 4326. `pnpm typecheck` runs the Angular compiler (`ngc`), which also checks the template. The
browser tests live in [`examples/e2e`](../e2e).

To use this outside the repository, replace `"pixelvision": "workspace:*"` in `package.json` with
a version from npm.

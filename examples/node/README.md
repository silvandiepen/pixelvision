# pixelvision · Node

pixelvision in Node, from both module systems: find a document in an image file, straighten it with
`extractDocument`, and write the result.

To stay free of image libraries, the example reads and writes binary PGM, the simplest gray image
format (`src/pgm.cts`). In a real project, decode with any library that gives you pixels, such as
[sharp](https://sharp.pixelplumbing.com) or [pngjs](https://github.com/pngjs/pngjs), and pass them
to pixelvision the same way.

## Files

- `src/scan.mts`: ES module; `import` loads pixelvision's ESM build.
- `src/scan.cts`: CommonJS; compiles to `require("pixelvision")`, which loads its CommonJS build.
- `src/cli.mts`: a command that scans one file.
- `src/pgm.cts`: reads and writes PGM files.
- `fixtures/scene.pgm`: a 320 x 240 photo of a light document on a dark background.

## Run

From the repository root:

```sh
pnpm install
pnpm --filter @pixelvision/example-node... build
pnpm --filter @pixelvision/example-node start   # writes out/document.pgm
pnpm --filter @pixelvision/example-node test
```

The tests run the compiled files in `dist`: `scan.mjs` through `import`, `scan.cjs` through
`require`, and the command in a separate Node process.

To use this outside the repository, replace `"pixelvision": "workspace:*"` in `package.json` with a
version from npm.

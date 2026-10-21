# Example browser tests

Playwright tests for the web examples (`vanilla`, `vue`, `react`, `svelte`, `worker` and
`angular`), in Chromium, Firefox and WebKit. Each example's production build is served with
`vite preview` on its own port (listed in `examples.ts`). The tests upload a generated photo of a
document, and feed the same photo to the camera, and check that every corner the example finds is
within 4 px.

From the repository root:

```sh
pnpm test:e2e
```

That builds pixelvision and the examples first. To run only these tests after a build:

```sh
pnpm --filter @pixelvision/examples-e2e test:e2e
```

The first time, install the browsers with
`pnpm --filter @pixelvision/examples-e2e exec playwright install chromium firefox webkit`.

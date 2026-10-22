# pixelvision · verify server

A Node server with the two endpoints a server-checked face challenge needs, built on
[`@pixelvision/verify`](../../packages/verify):

- `GET /challenge` issues a signed, one-time challenge (a random order of steps, valid for two
  minutes).
- `POST /verify` takes the evidence a browser posts and answers
  `{ passed, reasons, stepsDone, stepsTotal, framesChecked }`.

```sh
CHALLENGE_SECRET="$(openssl rand -hex 32)" pnpm --filter @pixelvision/example-verify-server start
```

On the page, point `<pv-face-capture>` at it and post the evidence back:

```html
<pv-face-capture challenge-url="/challenge"></pv-face-capture>
<script type="module">
  import { evidenceForm } from "@pixelvision/capture-ui";

  document.querySelector("pv-face-capture").addEventListener("pv-evidence", async (event) => {
    const response = await fetch("/verify", { method: "POST", body: evidenceForm(event.detail) });
    const result = await response.json();
    // Act on result.passed here, on your server: never on what the page says.
  });
</script>
```

In a real app, `/verify` also ties the result to the signed-in user and stores it, and the
used-code store is shared between servers (see `createMemoryCodeStore`).

## Test

```sh
pnpm --filter @pixelvision/example-verify-server test
```

The test starts the server, fetches a challenge, and posts the frames of the sample head-turn
clip (an AI-generated person, `packages/verify/fixtures/head-turn`) packed with capture-ui's
`evidenceForm`, as a browser would. It checks that they pass once, that posting them again is
refused (`code-used`), and that a challenge changed in the browser is refused (`bad-signature`).

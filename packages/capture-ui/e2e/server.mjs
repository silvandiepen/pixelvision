// Serves the packages folder for the end-to-end tests, so the pages load the built packages
// (dist) through an import map. Pages named `*.csp.html` are served with a strict Content
// Security Policy: no inline script except the page's import map (allowed by its hash), and
// workers only from this origin, without `blob:`.
import { createHash } from "node:crypto";
import { createReadStream, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const port = Number(process.env.PORT ?? 4327);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json",
  ".json": "application/json",
};

/**
 * Builds the strict policy for a page, allowing only its inline import map by hash.
 *
 * @param html - The page.
 * @returns The Content-Security-Policy header value.
 */
const strictPolicy = (html) => {
  const importMap = /<script type="importmap">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "";
  const hash = createHash("sha256").update(importMap).digest("base64");
  return [
    "default-src 'none'",
    `script-src 'self' 'sha256-${hash}'`,
    "worker-src 'self'",
    "img-src 'self' blob: data:",
    "media-src 'self' blob:",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
  ].join("; ");
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const path = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!path.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if (!statSync(path).isFile()) throw new Error("Not a file");
  } catch {
    response.writeHead(404).end("Not found");
    return;
  }
  const headers = {
    "Content-Type": types[extname(path)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  };
  if (path.endsWith(".csp.html")) {
    headers["Content-Security-Policy"] = strictPolicy(readFileSync(path, "utf8"));
  }
  response.writeHead(200, headers);
  createReadStream(path).pipe(response);
}).listen(port, () => {
  console.log(`capture-ui e2e: http://localhost:${port}/capture-ui/e2e/index.html`);
});

// Serves the packages folder so the demo can import the built packages through its import map.
// Usage: pnpm --filter @pixelvision/capture-ui build && pnpm --filter @pixelvision/capture-ui demo
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const port = Number(process.env.PORT ?? 4321);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".map": "application/json",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let path = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!path.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if (statSync(path).isDirectory()) path = join(path, "index.html");
    statSync(path);
  } catch {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": types[extname(path)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(path).pipe(response);
}).listen(port, () => {
  console.log(`capture-ui demo: http://localhost:${port}/capture-ui/demo/`);
});

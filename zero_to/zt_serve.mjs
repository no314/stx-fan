// Minimal static server for the harness and the screenshot script: serves the zero_to folder.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = dirname(fileURLToPath(import.meta.url));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".md": "text/markdown", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml" };

export function serve(port) {
  const server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = join(ROOT, path);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404); res.end("not found");
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

// Headless Chromium: playwright-core ships no browser, so point at an installed one.
import { existsSync } from "node:fs";
export const CHROME = process.env.CHROME || ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/usr/bin/chromium", "/usr/bin/google-chrome"].find(existsSync);
export const LAUNCH = { executablePath: CHROME, args: ["--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"] };

// Mainnet fixture recorded 2026-09-30 from api.hiro.so/v2/pox (ids and heights are real; the
// harness mutates current_burnchain_block_height to walk the boundary states).
export const POX = {
  reward_cycle_length: 2100,
  current_burnchain_block_height: 969285,
  current_cycle: { id: 144 },
  next_cycle: { id: 145, prepare_phase_start_block_height: 970450, reward_phase_start_block_height: 970550 },
};

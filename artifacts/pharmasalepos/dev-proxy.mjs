import http from "http";
import net from "net";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "19647");
const VITE_PORT = PORT + 1;
const BASE_PATH = process.env.BASE_PATH || "/pharmasalepos/";

let viteReady = false;

const LOADING_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Loading...</title>
<meta http-equiv="refresh" content="2">
</head><body><p>Starting Inbox Ticket...</p></body></html>`;

// Start Vite on internal port
const vite = spawn(
  join(__dirname, "node_modules/.bin/vite"),
  ["--config", "vite.config.ts", "--host", "0.0.0.0", "--port", String(VITE_PORT)],
  {
    stdio: "inherit",
    cwd: __dirname,
    env: { ...process.env, PORT: String(VITE_PORT), BASE_PATH },
  }
);

vite.on("error", (e) => console.error("Vite error:", e));
vite.on("exit", (code) => {
  clearInterval(readyPoller);
  process.exit(code ?? 0);
});

// Probe Vite readiness every 500ms
const readyPoller = setInterval(() => {
  const basePath = BASE_PATH.endsWith("/") ? BASE_PATH : BASE_PATH + "/";
  const req = http.request(
    {
      hostname: "127.0.0.1",
      port: VITE_PORT,
      path: basePath,
      method: "HEAD",
      timeout: 500,
    },
    (res) => {
      if (res.statusCode && res.statusCode < 500) {
        viteReady = true;
        clearInterval(readyPoller);
        console.log(`> Vite confirmed ready (HTTP ${res.statusCode})`);
      }
    }
  );
  req.on("error", () => {});
  req.end();
}, 500);

const basePath = BASE_PATH.endsWith("/") ? BASE_PATH : BASE_PATH + "/";
const HEALTH_PATHS = new Set(["/", "", basePath, basePath.slice(0, -1)]);

function forwardToVite(req, res) {
  const options = {
    hostname: "127.0.0.1",
    port: VITE_PORT,
    path: req.url || "/",
    method: req.method,
    headers: { ...req.headers, host: `localhost:${VITE_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(LOADING_HTML);
    }
  });

  req.pipe(proxyReq, { end: true });
}

function handleRequest(req, res) {
  const url = req.url || "/";
  if (!viteReady && HEALTH_PATHS.has(url)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(LOADING_HTML);
    return;
  }
  forwardToVite(req, res);
}

// WebSocket / HMR proxy
function handleUpgrade(req, socket, head) {
  const conn = net.connect(VITE_PORT, "127.0.0.1", () => {
    const header =
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n") +
      "\r\n\r\n";
    conn.write(header);
    if (head && head.length) conn.write(head);
  });
  conn.on("error", () => socket.destroy());
  socket.on("error", () => conn.destroy());
  conn.pipe(socket);
  socket.pipe(conn);
}

const server = http.createServer(handleRequest);
server.on("upgrade", handleUpgrade);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`> Dev proxy listening on http://0.0.0.0:${PORT}`);
  console.log(`> Starting Vite on port ${VITE_PORT}...`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`> Port ${PORT} already in use; exiting so the workflow manager can retry.`);
    vite.kill("SIGTERM");
    process.exit(1);
  } else {
    console.error(`> Server error:`, err.message);
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  clearInterval(readyPoller);
  vite.kill("SIGTERM");
  process.exit(0);
});
process.on("SIGINT", () => {
  clearInterval(readyPoller);
  vite.kill("SIGINT");
  process.exit(0);
});

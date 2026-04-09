import http from "http";
import net from "net";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "20407");
const NEXT_PORT = PORT + 1;

// Track whether Next.js is confirmed ready
let nextReady = false;

// Minimal HTML served during warmup for health-check
const LOADING_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Loading...</title>
<meta http-equiv="refresh" content="2">
</head><body><p>Starting...</p></body></html>`;

// Start Next.js on internal port
const next = spawn(
  "pnpm",
  [
    "--filter",
    "@workspace/inbox-template",
    "exec",
    "next",
    "dev",
    "--port",
    String(NEXT_PORT),
    "--hostname",
    "0.0.0.0",
  ],
  {
    stdio: "inherit",
    cwd: join(__dirname, "../.."),
    env: { ...process.env, PORT: String(NEXT_PORT) },
  }
);

next.on("error", (e) => console.error("Next.js error:", e));
next.on("exit", (code) => {
  clearInterval(readyPoller);
  process.exit(code ?? 0);
});

// Probe Next.js readiness every 500ms
const readyPoller = setInterval(() => {
  const req = http.request(
    {
      hostname: "127.0.0.1",
      port: NEXT_PORT,
      path: "/inbox-template/",
      method: "HEAD",
      timeout: 500,
    },
    (res) => {
      if (res.statusCode && res.statusCode < 500) {
        nextReady = true;
        clearInterval(readyPoller);
        console.log(`> Next.js confirmed ready (HTTP ${res.statusCode})`);
      }
    }
  );
  req.on("error", () => {});
  req.end();
}, 500);

// Health-check paths — return 200 HTML immediately before Next.js is ready
const HEALTH_PATHS = new Set(["/", "", "/inbox-template/", "/inbox-template"]);

function forwardToNext(req, res) {
  const options = {
    hostname: "127.0.0.1",
    port: NEXT_PORT,
    path: req.url || "/",
    method: req.method,
    headers: { ...req.headers, host: `localhost:${NEXT_PORT}` },
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

  // Health-check: return HTML 200 immediately before Next.js is ready
  if (!nextReady && HEALTH_PATHS.has(url)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(LOADING_HTML);
    return;
  }

  forwardToNext(req, res);
}

// WebSocket / HMR proxy
function handleUpgrade(req, socket, head) {
  const conn = net.connect(NEXT_PORT, "127.0.0.1", () => {
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

// Retry binding with explicit 0.0.0.0 for Replit proxy compatibility
function startListening(attempt = 0) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`> Dev proxy listening on http://0.0.0.0:${PORT}`);
    console.log(`> Starting Next.js on port ${NEXT_PORT}...`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < 5) {
      console.log(
        `> Port ${PORT} in use, retrying in 500ms... (attempt ${attempt + 1})`
      );
      setTimeout(() => {
        server.close();
        startListening(attempt + 1);
      }, 500);
    } else {
      console.error(`> Failed to bind to port ${PORT}:`, err.message);
      process.exit(1);
    }
  });
}

startListening();

process.on("SIGTERM", () => {
  clearInterval(readyPoller);
  next.kill("SIGTERM");
  process.exit(0);
});
process.on("SIGINT", () => {
  clearInterval(readyPoller);
  next.kill("SIGINT");
  process.exit(0);
});

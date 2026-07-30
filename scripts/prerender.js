/**
 * Prerender public marketing routes into static HTML snapshots.
 *
 * Runs after `vite build` (client/dist already exists). Serves that dist
 * folder with a tiny static server that mirrors the real Express server's
 * logic exactly (server/src/index.js: real file if it exists, else the SPA's
 * index.html) — deliberately not `serve-handler`, whose cleanUrls/rewrites
 * served a raw directory listing for /courses (client/public/courses/
 * already holds course-card images) and 404'd /about instead of falling
 * back to the SPA shell.
 *
 * Visits each public route with Puppeteer, waits for the SPA to render, and
 * writes the resulting HTML to dist/<route>/index.html. Express's static
 * middleware then serves that file directly for a matching path — no server
 * code changes needed, since express.static already resolves a directory's
 * index.html before falling through to the SPA catch-all.
 *
 * Bots and non-JS crawlers get real content immediately; real users still
 * get the exact same bundle, which fully re-renders over the static markup
 * once JS loads (main.jsx uses createRoot().render(), not hydrateRoot(), so
 * this is a full replace — no hydration-mismatch risk).
 */
const path = require('path');
const fs = require('fs');
const http = require('http');
const puppeteer = require('puppeteer');

const DIST = path.join(__dirname, '../client/dist');
const PORT = 4173;
const ROUTES = ['/', '/courses', '/about', '/igo-brands'];

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.txt': 'text/plain',
};

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filePath = path.join(DIST, urlPath);
    fs.stat(filePath, (err, stat) => {
      const servePath = !err && stat.isFile() ? filePath : path.join(DIST, 'index.html');
      res.setHeader('Content-Type', MIME[path.extname(servePath)] || 'application/octet-stream');
      fs.createReadStream(servePath).pipe(res);
    });
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('[prerender] client/dist/index.html not found — run the client build first.');
    process.exit(1);
  }

  const server = await startServer();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const snapshots = {};
  for (const route of ROUTES) {
    console.log(`[prerender] ${route}`);
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 500)); // let React Query / late content settle
    snapshots[route] = await page.content();
  }

  await browser.close();
  server.close();

  // Write only after every route succeeded — a mid-run failure must not
  // leave some routes prerendered and others silently stuck on an old build.
  for (const [route, html] of Object.entries(snapshots)) {
    const outDir = route === '/' ? DIST : path.join(DIST, route);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
  }

  console.log(`[prerender] Done — ${ROUTES.length} routes snapshotted.`);
}

main().catch((err) => {
  console.error('[prerender] Failed:', err);
  process.exit(1);
});

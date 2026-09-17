import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.json':'application/json', '.svg':'image/svg+xml', '.mp4':'video/mp4' };

http.createServer(async (req, res) => {
  const u = new URL(req.url || '/', 'http://127.0.0.1');
  let p = decodeURIComponent(u.pathname);

  // 開發用:讓頁面把產生的圖寫進 assets/(只允許安全檔名,只寫這個資料夾)
  if (req.method === 'POST' && p === '/__save') {
    const name = path.basename(u.searchParams.get('name') || '');
    if (!/^[A-Za-z0-9_.-]+\.(png|jpg|webp|json|txt)$/.test(name)) {
      res.writeHead(400); return res.end('bad name');
    }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    await mkdir(path.join(root, 'assets'), { recursive: true });
    await writeFile(path.join(root, 'assets', name), Buffer.concat(chunks));
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('saved ' + name + ' ' + Buffer.concat(chunks).length);
  }

  if (p === '/') p = '/index.html';
  try {
    const data = await readFile(path.join(root, p));
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(8899, '127.0.0.1', () => console.log('serving on http://127.0.0.1:8899'));

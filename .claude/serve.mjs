import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.json':'application/json', '.svg':'image/svg+xml', '.mp4':'video/mp4' };


// ── 本機模擬 Upstash Redis(只實作 api/ 用到的指令;資料存在記憶體,重啟即清空)──
function makeMockRedis() {
  const db = new Map();
  const get = (k, type) => { let v = db.get(k); if (!v) { v = type === 'z' ? new Map() : type === 'h' ? new Map() : null; if (v) db.set(k, v); } return v; };
  const zsorted = z => [...z.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1));
  const run = ([cmd, ...a]) => {
    switch (cmd.toUpperCase()) {
      case 'INCR': { const n = Number(db.get(a[0]) || 0) + 1; db.set(a[0], n); return n; }
      case 'EXPIRE': return db.has(a[0]) ? 1 : 0;
      case 'ZADD': { const z = get(a[0], 'z'); let i = 1; const added = !z.has(a[i + 1]); z.set(a[i + 1], Number(a[i])); return added ? 1 : 0; }
      case 'ZREM': { const z = db.get(a[0]); return z && z.delete(a[1]) ? 1 : 0; }
      case 'ZCARD': { const z = db.get(a[0]); return z ? z.size : 0; }
      case 'ZSCORE': { const z = db.get(a[0]); return z && z.has(a[1]) ? String(z.get(a[1])) : null; }
      case 'ZREVRANK': { const z = db.get(a[0]); if (!z || !z.has(a[1])) return null; return zsorted(z).findIndex(e => e[0] === a[1]); }
      case 'ZREVRANGE': { const z = db.get(a[0]); if (!z) return []; const s = Number(a[1]), e = Number(a[2]);
        const out = []; for (const [m, sc] of zsorted(z).slice(s, e + 1)) { out.push(m); if (a[3]) out.push(String(sc)); } return out; }
      case 'HSET': { const h = get(a[0], 'h'); let n = 0; for (let i = 1; i < a.length; i += 2) { if (!h.has(a[i])) n++; h.set(a[i], String(a[i + 1])); } return n; }
      case 'HGET': { const h = db.get(a[0]); return h && h.has(a[1]) ? h.get(a[1]) : null; }
      case 'HMGET': { const h = db.get(a[0]); return a.slice(1).map(f => (h && h.has(f) ? h.get(f) : null)); }
      case 'HDEL': { const h = db.get(a[0]); return h && h.delete(a[1]) ? 1 : 0; }
      case 'HINCRBY': { const h = get(a[0], 'h'); const n = Number(h.get(a[1]) || 0) + Number(a[2]); h.set(a[1], String(n)); return n; }
      case 'HGETALL': { const h = db.get(a[0]); return h ? [...h.entries()].flat() : []; }
      case 'DEL': { let n = 0; for (const k of a) if (db.delete(k)) n++; return n; }
      default: throw new Error('mock: unsupported ' + cmd);
    }
  };
  return { db, pipeline: async cmds => cmds.map(run) };
}
globalThis.__MOCK_REDIS__ = makeMockRedis();
const mockSaved = { redis: globalThis.__MOCK_REDIS__ };

const apiCache = new Map();
async function runApi(req, res, name) {
  if (!/^[a-z]+$/.test(name)) { res.writeHead(404); return res.end('not found'); }
  let mod = apiCache.get(name);
  if (!mod) {
    try { mod = (await import(path.join(root, 'api', name + '.js') + '?t=' + Date.now())).default; }
    catch (e) { res.writeHead(404); return res.end('not found'); }
    apiCache.set(name, mod);
  }
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const request = new Request('http://127.0.0.1:8899' + req.url, {
    method: req.method, headers: { ...req.headers, 'x-forwarded-for': req.socket.remoteAddress || 'local' },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  });
  const r = await mod.fetch(request);
  const out = Buffer.from(await r.arrayBuffer());
  res.writeHead(r.status, Object.fromEntries(r.headers.entries()));
  res.end(out);
}

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


  // 開發用:切換模擬資料庫(on=0 模擬「未設定 Redis」、reset=1 清空)
  if (req.method === 'POST' && p === '/__mock') {
    if (u.searchParams.get('on') === '0') globalThis.__MOCK_REDIS__ = undefined;
    if (u.searchParams.get('on') === '1') globalThis.__MOCK_REDIS__ = mockSaved.redis;
    if (u.searchParams.get('reset') === '1') { mockSaved.redis = makeMockRedis(); if (globalThis.__MOCK_REDIS__) globalThis.__MOCK_REDIS__ = mockSaved.redis; }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('mock ' + (globalThis.__MOCK_REDIS__ ? 'on' : 'off'));
  }
  if (p.startsWith('/api/')) {
    try { return await runApi(req, res, p.slice(5).replace(/\.js$/, '')); }
    catch (e) { console.error(e); res.writeHead(500); return res.end('api error'); }
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

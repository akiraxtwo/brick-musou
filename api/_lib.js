// 積木無雙 線上功能共用函式庫(排行榜 / 埋點 / 統計)
// 資料庫:Upstash Redis(Vercel Marketplace)。未設定環境變數時,所有 API 回 503 {enabled:false},前端顯示「尚未開放」。
// 本機測試:.claude/serve.mjs 會注入 globalThis.__MOCK_REDIS__(記憶體模擬)。

export const STAGES = ['sishui', 'hulao', 'luoyang'];
export const DIFFS = ['easy', 'normal', 'shura'];
export const HEROES = ['liubei', 'guanyu', 'zhangfei', 'lubu'];

function redisConf() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}
export function enabled() { return !!(globalThis.__MOCK_REDIS__ || redisConf()); }

// 一次送出多個指令;回傳每個指令的結果陣列
export async function redis(cmds) {
  if (globalThis.__MOCK_REDIS__) return globalThis.__MOCK_REDIS__.pipeline(cmds);
  const c = redisConf();
  if (!c) throw new Error('redis not configured');
  const r = await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error(`redis http ${r.status}`);
  const out = await r.json();
  return out.map(x => { if (x.error) throw new Error(x.error); return x.result; });
}

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });
}
export const disabled = () => json({ enabled: false }, 503);

export function clientIp(request) {
  const xf = request.headers.get('x-forwarded-for') || '';
  return (xf.split(',')[0] || request.headers.get('x-real-ip') || 'local').trim();
}

// 每 IP 每分鐘最多 n 次
export async function rateLimited(request, bucket, n) {
  const minute = Math.floor(Date.now() / 60000);
  const key = `rl:${bucket}:${clientIp(request)}:${minute}`;
  const [count] = await redis([['INCR', key], ['EXPIRE', key, '70']]);
  return Number(count) > n;
}

// 暱稱:1~12 字;只保留一般可見字元,去掉 HTML 特殊字元
const NICK_BAD = /[<>&"'`\\]/g;
export function cleanNick(s) {
  const t = Array.from(String(s || ''))
    .filter(ch => { const c = ch.codePointAt(0); return c >= 32 && c !== 127; })
    .join('').replace(NICK_BAD, '').trim();
  const cut = Array.from(t).slice(0, 12).join('');
  return cut.length ? cut : null;
}
export const cleanCid = s => (/^[a-z0-9]{8,24}$/.test(String(s || '')) ? String(s) : null);

// 排行榜鍵:stage:<關卡>:<難度> / surv / rush / daily:<日>
export function boardKey(board) {
  if (board === 'surv') return 'lb:surv';
  if (board === 'rush') return 'lb:rush';
  let m = /^daily:(\d{1,5})$/.exec(board || '');
  if (m) return `lb:daily:${m[1]}`;
  m = /^stage:([a-z]+):([a-z]+)$/.exec(board || '');
  if (m && STAGES.includes(m[1]) && DIFFS.includes(m[2])) return `lb:stage:${m[1]}:${m[2]}`;
  return null;
}

// 合理性檢查:純前端遊戲無法根本防作弊,只擋明顯不可能的數字
// 每秒擊破上限:bot 實測(不死、不停進攻)虎牢關張飛約 14、呂布約 20,60 秒挑戰呂布約 16;
// 原本劇情關上限 12,強的玩家打出來的真實成績會被擋,所以放寬到 25(60 秒挑戰 30)
export function plausible(r, key = '') {
  const t = Number(r.time), k = Number(r.kills), c = Number(r.combo), w = Number(r.wave || 0);
  const kps = key === 'lb:rush' ? 30 : 25;
  if (!Number.isFinite(t) || t < 15 || t > 3600) return 'time';
  if (!Number.isInteger(k) || k < 0 || k > t * kps + 200) return 'kills';
  if (!Number.isInteger(c) || c < 0 || c > k * 6 + 300) return 'combo';
  if (w && (!Number.isInteger(w) || w > t / 35 + 2)) return 'wave';
  if (!HEROES.includes(r.hero)) return 'hero';
  return null;
}

// 分數上限:依前端的計分公式,用登錄上來的擊破 / 連擊 / 時間 / 波數算出「最多能拿幾分」,
// 擋掉「數據合理、分數亂填」的直接 POST(只設上限:改名重送較低的分數仍合法)
const SCORE_MUL = { easy: 0.8, normal: 1, shura: 1.3 };   // 與前端 DIFFS.scoreMul 一致
const OPTIONAL_MAX = 4;                                     // 每關次要目標數上限(目前最多 3,每個 +25)
export function scoreCap(key, r) {
  const k = Number(r.kills), c = Number(r.combo), t = Number(r.time), w = Number(r.wave || 0);
  if (key === 'lb:surv') return w >= 1 ? w * 10000 + Math.min(k, 9999) : -1;           // 波數 × 10000 + 擊破
  if (key === 'lb:rush') return t <= 62 ? k : -1;                                        // 60 秒挑戰:分數 = 擊破數
  if (key.startsWith('lb:daily:')) return Math.ceil(k + c * 1.5 + 400) + 1;            // 擊破 + 連擊 × 1.5 + 勝利 400
  const m = /^lb:stage:[a-z]+:([a-z]+)$/.exec(key);                                    // 戰功 × 10
  if (m) return Math.ceil((k + c * 1.5 + 60 + OPTIONAL_MAX * 25 - t / 5) * (SCORE_MUL[m[1]] || 1) * 10) + 2;
  return -1;
}

import { enabled, disabled, json, redis } from './_lib.js';

// GET /api/stats?days=7&token=<STATS_TOKEN> → 近 N 天彙總 + 衍生指標(每關每難度的場次、勝率、平均通關秒數、中途離開數)
// 沒設定 STATS_TOKEN 環境變數時,正式站此端點關閉
export default {
  async fetch(request) {
    const need = process.env.STATS_TOKEN;
    const u = new URL(request.url);
    if (!need && !globalThis.__MOCK_REDIS__) return json({ error: 'stats disabled' }, 404);
    if (need && u.searchParams.get('token') !== need) return json({ error: 'forbidden' }, 403);
    if (!enabled()) return disabled();
    const days = Math.max(1, Math.min(90, Number(u.searchParams.get('days')) || 7));
    const keys = [];
    for (let i = 0; i < days; i++) keys.push(`ev:${new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)}`);
    const res = await redis(keys.map(k => ['HGETALL', k]));
    const total = {};
    for (const h of res) {
      if (!h) continue;
      const arr = Array.isArray(h) ? h : Object.entries(h).flat();
      for (let i = 0; i < arr.length; i += 2) total[arr[i]] = (total[arr[i]] || 0) + Number(arr[i + 1]);
    }
    const derived = {};
    for (const k of Object.keys(total)) {
      const m = /^end:(\w+):(\w+):(\w+):(win|lose)$/.exec(k);
      if (!m) continue;
      const base = `${m[1]}:${m[2]}:${m[3]}`;
      if (derived[base]) continue;
      const w = total[`end:${base}:win`] || 0, l = total[`end:${base}:lose`] || 0;
      derived[base] = {
        plays: w + l,
        winRate: w + l ? +(w / (w + l)).toFixed(3) : 0,
        avgWinSec: w ? Math.round((total[`time:${base}:win`] || 0) / w) : null,
        avgLoseSec: l ? Math.round((total[`time:${base}:lose`] || 0) / l) : null,
        quits: total[`quit:${base}`] || 0,
      };
    }
    return json({ days, derived, raw: total });
  },
};

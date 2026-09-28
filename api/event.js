import { enabled, json, redis, rateLimited, STAGES, DIFFS, HEROES } from './_lib.js';

// POST /api/event {events:[{n:'session'|'start'|'end'|'quit'|'share', ...}]}
// 只做每日彙總計數(ev:YYYY-MM-DD 雜湊),不儲存任何個別玩家資料
const MODES = ['story', 'survival', 'daily'];
const ok = (v, list) => (list.includes(v) ? v : 'x');

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'method' }, 405);
    if (!enabled()) return new Response(null, { status: 204 });
    try {
      if (await rateLimited(request, 'event', 60)) return json({ error: 'rate' }, 429);
      const body = await request.json().catch(() => null);
      const events = body && Array.isArray(body.events) ? body.events.slice(0, 40) : [];
      const day = new Date().toISOString().slice(0, 10), key = `ev:${day}`;
      const cmds = [];
      const inc = (f, by = 1) => cmds.push(['HINCRBY', key, f, String(Math.round(by))]);
      for (const e of events) {
        if (!e || typeof e !== 'object') continue;
        const mode = ok(e.mode, MODES), stage = ok(e.stage, STAGES), diff = ok(e.diff, DIFFS), hero = ok(e.hero, HEROES);
        if (e.n === 'session') {
          inc('session'); inc(`lang:${e.lang === 'en' ? 'en' : 'zh'}`); inc(`ref:${ok(e.ref, ['x', 'other', 'direct'])}`);
          inc(e.touch ? 'dev:touch' : 'dev:desktop'); if (e.pad) inc('dev:pad');
        } else if (e.n === 'start') {
          inc(`start:${mode}:${stage}:${diff}`); inc(`hero:${hero}`);
        } else if (e.n === 'end') {
          const res = e.win ? 'win' : 'lose', t = Math.max(0, Math.min(3600, Number(e.t) || 0));
          inc(`end:${mode}:${stage}:${diff}:${res}`);
          inc(`time:${mode}:${stage}:${diff}:${res}`, t);
          if (!e.win) inc(`dead:${mode}:${stage}:${diff}:${Math.min(20, Math.floor(t / 30))}`);   // 敗北時間,30 秒一格
          if (mode === 'story' && e.win) inc(`grade:${stage}:${diff}:${/^[SABC]$/.test(e.grade) ? e.grade : 'x'}`);
          if (mode === 'survival') inc(`wave:${Math.min(40, Number(e.wave) || 0)}`);
        } else if (e.n === 'quit') {
          inc(`quit:${mode}:${stage}:${diff}`);
        } else if (e.n === 'share') {
          inc(`share:${ok(e.ch, ['x', 'native', 'img', 'txt', 'dl'])}`);
        }
      }
      if (cmds.length) { cmds.push(['EXPIRE', key, String(120 * 86400)]); await redis(cmds); }
      return new Response(null, { status: 204 });
    } catch (e) {
      return json({ error: 'server' }, 500);
    }
  },
};

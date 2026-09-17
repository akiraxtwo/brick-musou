import { enabled, disabled, json, redis, rateLimited, boardKey, plausible, cleanNick, cleanCid } from './_lib.js';

// GET  /api/score?board=stage:hulao:normal&cid=xxx → 前 20 名 + 自己的名次
// POST /api/score {board, cid, nick, hero, score, kills, combo, time, rank, wave}
// 資料:lb:<board>(sorted set,member = 暱稱#cid)+ lbd:<board>(hash,每人成績細節)+ lbc:<board>(hash,cid → member)
export default {
  async fetch(request) {
    if (!enabled()) return disabled();
    try {
      if (request.method === 'GET') return await getBoard(request);
      if (request.method === 'POST') return await submit(request);
      return json({ error: 'method' }, 405);
    } catch (e) {
      return json({ error: 'server' }, 500);
    }
  },
};

const pick = d => ({ nick: d.nick, hero: d.hero, kills: d.kills, combo: d.combo, time: d.time, grade: d.grade, wave: d.wave });
const parse = s => { try { return JSON.parse(s || '{}'); } catch (e) { return {}; } };

async function getBoard(request) {
  const u = new URL(request.url);
  if (!u.searchParams.has('board')) return json({ enabled: true });   // 前端開機探測:不碰資料庫
  const key = boardKey(u.searchParams.get('board'));
  if (!key) return json({ error: 'board' }, 400);
  const cid = cleanCid(u.searchParams.get('cid'));
  const [top, total, myMember] = await redis([
    ['ZREVRANGE', key, '0', '19', 'WITHSCORES'],
    ['ZCARD', key],
    ['HGET', `lbc:${key}`, cid || '-'],
  ]);
  const members = [];
  for (let i = 0; i < top.length; i += 2) members.push({ m: top[i], score: Number(top[i + 1]) });
  const details = members.length ? (await redis([['HMGET', `lbd:${key}`, ...members.map(x => x.m)]]))[0] : [];
  const rows = members.map((x, i) => ({ rank: i + 1, score: x.score, me: !!myMember && x.m === myMember, ...pick(parse(details[i])) }));
  let mine = null;
  if (myMember) {
    const [rk, sc, det] = await redis([['ZREVRANK', key, myMember], ['ZSCORE', key, myMember], ['HGET', `lbd:${key}`, myMember]]);
    if (rk !== null) mine = { rank: Number(rk) + 1, score: Number(sc), ...pick(parse(det)) };
  }
  return json({ enabled: true, total: Number(total), rows, mine });
}

async function submit(request) {
  if (await rateLimited(request, 'score', 12)) return json({ error: 'rate' }, 429);
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'json' }, 400); }
  const key = boardKey(b.board), nick = cleanNick(b.nick), cid = cleanCid(b.cid);
  if (!key || !nick || !cid) return json({ error: 'fields' }, 400);
  const bad = plausible(b);
  if (bad) return json({ error: 'implausible', field: bad }, 422);
  const score = Math.round(Number(b.score));
  if (!Number.isFinite(score) || score < 0 || score > 1e9) return json({ error: 'score' }, 400);

  const member = `${nick}#${cid}`;
  const [oldMember] = await redis([['HGET', `lbc:${key}`, cid]]);
  let prevBest = -1;
  const cmds = [];
  if (oldMember) {
    const [sc] = await redis([['ZSCORE', key, oldMember]]);
    prevBest = sc === null ? -1 : Number(sc);
    if (oldMember !== member) cmds.push(['ZREM', key, oldMember], ['HDEL', `lbd:${key}`, oldMember]);   // 改名:搬到新暱稱
  }
  const improved = score > prevBest;
  const best = Math.max(score, prevBest);
  cmds.push(['ZADD', key, String(best), member], ['HSET', `lbc:${key}`, cid, member]);
  if (improved) {
    cmds.push(['HSET', `lbd:${key}`, member, JSON.stringify({
      nick, hero: b.hero, kills: b.kills, combo: b.combo, time: Math.round(b.time),
      grade: String(b.rank || '').slice(0, 1), wave: b.wave || 0, ts: Date.now(),
    })]);
  } else if (oldMember && oldMember !== member) {
    const [det] = await redis([['HGET', `lbd:${key}`, oldMember]]);
    const d = parse(det); d.nick = nick;
    cmds.push(['HSET', `lbd:${key}`, member, JSON.stringify(d)]);
  }
  if (key.startsWith('lb:daily:')) for (const k of [key, `lbd:${key}`, `lbc:${key}`]) cmds.push(['EXPIRE', k, String(60 * 86400)]);
  await redis(cmds);
  const [rk] = await redis([['ZREVRANK', key, member]]);
  return json({ enabled: true, ok: true, improved, rank: Number(rk) + 1 });
}

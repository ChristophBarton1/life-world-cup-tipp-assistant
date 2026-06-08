/**
 * WM 2026 Feed – Cloudflare Worker
 * --------------------------------
 * Runs on a Cron Trigger, pulls real World Cup fixtures + live/final scores
 * from football-data.org (free tier), and stores them in KV as JSON.
 * The static prediction page fetches this Worker's URL every 60s.
 *
 * Free tier note: football-data.org provides fixtures, status and SCORES,
 * but NOT betting odds. Odds (and therefore the Poisson predictions) stay
 * as configured in the page. This Worker adds the real results next to them.
 *
 * Bindings (see wrangler.toml):
 *   - WMKV                : KV namespace for the cached JSON
 *   - FOOTBALL_DATA_KEY   : secret, your football-data.org API token
 */

const COMP = "WC";            // FIFA World Cup competition code on football-data.org
const KV_KEY = "wmdata";

// football-data.org team name  ->  display name used by the page.
// Tune this once you see the real names the API returns (GET /matches).
const TEAM_ALIAS = {
  "Korea Republic": "South Korea",
  "South Korea": "South Korea",
  "United States": "USA",
  "USA": "USA",
  "Bosnia and Herzegovina": "Bosnia-Herz.",
  "Bosnia-Herzegovina": "Bosnia-Herz.",
  "Türkiye": "Turkey",
  "Turkey": "Turkey",
  "Côte d'Ivoire": "Ivory Coast",
  "Ivory Coast": "Ivory Coast",
  "Czech Republic": "Czechia",
  "Czechia": "Czechia",
  "Congo DR": "DR Congo",
  "DR Congo": "DR Congo",
  "Cape Verde Islands": "Cape Verde",
  "Cape Verde": "Cape Verde",
  "Saudi Arabia": "Saudi Arabia",
  "New Zealand": "New Zealand",
};
const norm = (n) => TEAM_ALIAS[n] || n;

const cors = (h = {}) => ({
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "cache-control": "no-store",
  ...h,
});

export default {
  // Cron Trigger
  async scheduled(event, env, ctx) {
    ctx.waitUntil(update(env));
  },

  // HTTP: serve cached JSON, plus an optional manual /refresh
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/refresh") {
      try {
        const n = await update(env);
        return new Response(JSON.stringify({ ok: true, games: n }), { headers: cors() });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: cors() });
      }
    }

    const cached = await env.WMKV.get(KV_KEY);
    return new Response(cached || JSON.stringify({ games: [], updated: null }), { headers: cors() });
  },
};

async function update(env) {
  const res = await fetch(`https://api.football-data.org/v4/competitions/${COMP}/matches`, {
    headers: { "X-Auth-Token": env.FOOTBALL_DATA_KEY },
  });
  if (!res.ok) throw new Error("football-data.org HTTP " + res.status);
  const data = await res.json();

  const games = (data.matches || []).map((m) => ({
    home: norm(m.homeTeam && (m.homeTeam.name || m.homeTeam.shortName) || ""),
    away: norm(m.awayTeam && (m.awayTeam.name || m.awayTeam.shortName) || ""),
    status: m.status,                          // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED
    scoreH: m.score && m.score.fullTime ? m.score.fullTime.home : null,
    scoreA: m.score && m.score.fullTime ? m.score.fullTime.away : null,
    utcDate: m.utcDate,
    // No odds from the free tier — the page keeps its configured odds.
  }));

  const payload = JSON.stringify({ games, updated: new Date().toISOString() });
  await env.WMKV.put(KV_KEY, payload);
  return games.length;
}

# WM 2026 Feed — Cloudflare Worker

A tiny serverless cron job that pulls **real World Cup fixtures + live/final scores**
from the **free** [football-data.org](https://www.football-data.org/) API and serves them
as JSON to the prediction page. No paid sports API, no own server.

```
Cron Trigger (every 10 min, free)
      │
      ├─ fetch fixtures + scores from football-data.org (free tier)
      └─ store JSON in KV
                 │
        Worker URL  ──fetch every 60s──►  wm-2026-tippassistent.html
```

> The free tier gives fixtures, status and **scores** — **not** betting odds.
> The page keeps its configured odds for the Poisson predictions and shows the
> real LIVE / FT result next to each prediction.

## One-time setup (~5 minutes)

1. **Get a free API key**
   - Sign up at <https://www.football-data.org/client/register>
   - Copy your API token.

2. **Install Wrangler & log in** (from this `wm-worker/` folder)
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **Create the KV namespace** and paste the id into `wrangler.toml`
   ```bash
   wrangler kv namespace create WMKV
   # -> copy the "id" it prints into wrangler.toml (kv_namespaces.id)
   ```

4. **Store the API key as a secret**
   ```bash
   wrangler secret put FOOTBALL_DATA_KEY
   # paste your football-data.org token when prompted
   ```

5. **Deploy**
   ```bash
   wrangler deploy
   ```
   Wrangler prints your URL, e.g. `https://wm-2026-feed.<your-subdomain>.workers.dev`

6. **Populate once** (don't wait for the first cron)
   - Open `https://wm-2026-feed.<your-subdomain>.workers.dev/refresh` in a browser.
   - Then `https://wm-2026-feed.<your-subdomain>.workers.dev/` should return JSON.

## Connect the page to the feed

Open `../wm-2026-tippassistent.html` and add this line in the `<head>`,
**before** the main `<script>`, with your Worker URL:

```html
<script>window.WM_FEED_URL = "https://wm-2026-feed.YOUR-SUBDOMAIN.workers.dev";</script>
```

That's it. The page auto-fetches every 60s, the status pill turns green
("Live feed connected"), and finished/in-play matches show their real score.

## Tuning team names

football-data.org may label a team differently than the page (e.g. *Korea Republic*
vs *South Korea*). If a score doesn't appear on a card, check the names the API
returns (`/` endpoint) and add an entry to `TEAM_ALIAS` in `src/worker.js`,
then `wrangler deploy` again.

## Cost

Cloudflare Workers + KV + Cron Triggers are covered by the **free plan** for this
volume (a few KB, a handful of requests per hour). football-data.org free tier
allows 10 calls/minute — the 10-minute cron uses one.

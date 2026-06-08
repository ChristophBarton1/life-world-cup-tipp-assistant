# 🏆 Live World Cup 2026 — Prediction Assistant

A free, multilingual World Cup 2026 prediction tool. It turns real bookmaker odds
into precise scoreline forecasts using the **Poisson model bookmakers use**, adds an
**independent Elo value model**, fractional-Kelly staking, a strategy comparison,
paper-trading with **Closing Line Value (CLV)** tracking, and a live-results feed.

> **18+ · For analysis and education. Predict responsibly.** Betting against bookmakers
> is hard and most lose — this tool is built to *measure* edge honestly (via CLV), not to
> promise profit.

## ✨ Features
- **Match predictions** — most likely scoreline per match (odds → Poisson), ideal for prediction pools like Kicktipp.
- **Live results** — connects to a data feed and shows real LIVE / FT scores next to each prediction.
- **Value engine** — independent Elo model (eloratings.net scale) blended toward the market; flags only positive-EV bets, with a 20% minimum-probability filter to skip unreliable long shots.
- **Strategy comparison** — enter a total stake, see it distributed dynamically across value bets at 3 risk levels (Safe / Balanced / Higher reward).
- **Paper-trading + CLV** — logs bets with fictional money, settles automatically on real results, and tracks **Closing Line Value** — the literature-proven marker of real edge (Miller & Davidow; Buchdahl).
- **10 languages** — English (default), Español, Français, Português, Deutsch, Nederlands, Türkçe, العربية (RTL), 日本語, 한국어.

## 🚀 Run it
Just open `index.html` in a browser — no build step. For the live data feed and
auto-CLV, deploy the Cloudflare Worker in `wm-worker/` and set your feed URL:

```html
<script>window.WM_FEED_URL = "https://your-worker.workers.dev";</script>
```

To host it as a live website, enable **GitHub Pages** on this repo (Settings → Pages → branch `main`).

## 📡 Live data feed (optional)
`wm-worker/` is a Cloudflare Worker (Cron Trigger + KV) that pulls real fixtures and
live/final scores from the **free** [football-data.org](https://www.football-data.org/) API.
See `wm-worker/README.md` for the 5-minute setup.

## 🧠 The model, honestly
- Predictions come from **real odds** via a bivariate Poisson fit.
- The value layer uses **Elo**, blended 30/70 toward the market (the market is an efficient prior).
- Staking uses **fractional Kelly** (Kelly 1956; Thorp).
- **CLV** is the success metric, not short-term profit — it detects skill in ~50 bets vs thousands.
- Realistic ROI on main markets is **low single digits at best**. Bigger structural edges (line shopping, arbitrage, bonuses) live outside the main markets.

## 📄 License
MIT — do what you want, no warranty. Not financial advice.

---
*Built with Claude.*

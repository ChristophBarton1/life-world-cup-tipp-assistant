# 🏆 Live World Cup 2026 — Prediction Assistant

A free, multilingual World Cup 2026 prediction tool that applies **probability theory and
quantitative sports-betting research** to real bookmaker odds. It produces precise
scoreline forecasts, an independent **Elo value model**, fractional-Kelly staking, a
dynamic strategy comparison, and — the methodological centrepiece — **Closing Line Value
(CLV) tracking**, the literature-proven way to measure betting edge.

📄 **[Read the full Methodology & Scientific Basis →](METHODOLOGY.md)**

> **18+ · Educational / analytical project. Not financial advice.** This tool is built to
> *measure* edge honestly, not to promise profit. Betting against efficient bookmaker
> markets is hard and most lose — the science here is about knowing whether an edge
> actually exists.

---

## 🔬 Why this is more than a betting app

This is a small **applied-statistics project** that implements, end-to-end, the standard
academic pipeline for quantitative betting:

| Stage | Method | Grounded in |
|---|---|---|
| Market → probabilities | De-vigging + bivariate **Poisson** goal model | Maher (1982); Dixon & Coles (1997) |
| Independent signal | **Elo** ratings → goal supremacy → W/D/L | World Football Elo |
| Combining the two | **Shrinkage** toward the market (efficient prior) | Miller & Davidow (2019) |
| Bet selection | Expected value + edge + long-shot safeguard | — |
| Staking | **Fractional Kelly** | Kelly (1956); Thorp; MacLean/Thorp/Ziemba |
| Validation | **Closing Line Value (CLV)** | Miller & Davidow; Buchdahl |

Every parameter (`BLEND_W`, `EDGE_MIN`, `MIN_PROB`, …) is justified in
[`METHODOLOGY.md`](METHODOLOGY.md), including the honest limitations: main markets are
~`R²=0.997` efficient and realistic ROI is low single digits at best.

---

## ✨ Features
- **Match predictions** — most likely scoreline per match (odds → Poisson), optimal for prediction pools like Kicktipp.
- **Live results** — connects to a data feed and shows real LIVE / FT scores next to each prediction.
- **Value engine** — independent Elo model blended toward the market; flags only positive-EV bets, with a 20% minimum-probability filter to skip unreliable long-shots.
- **Strategy comparison** — enter a total stake, see it distributed dynamically across value bets at 3 risk levels (Safe / Balanced / Higher reward).
- **Paper-trading + CLV** — logs bets with fictional money, settles automatically on real results, and tracks **Closing Line Value** — the proven marker of real edge.
- **10 languages** — English (default), Español, Français, Português, Deutsch, Nederlands, Türkçe, العربية (RTL), 日本語, 한국어.

## 🛠 Tech
- **Frontend:** a single self-contained `index.html` — vanilla JS, no framework, no build step. The full Poisson/Elo/Kelly/CLV maths runs client-side.
- **Backend (optional):** a **Cloudflare Worker** (`wm-worker/`) on a Cron Trigger pulls real fixtures and live/final scores from the **free** [football-data.org](https://www.football-data.org/) API into KV.
- **i18n:** custom lightweight dictionary system with full RTL support for Arabic.

## 🚀 Run it
Open `index.html` in a browser — that's it. To enable the live feed and auto-CLV, deploy
the worker (see [`wm-worker/README.md`](wm-worker/README.md)) and set:

```html
<script>window.WM_FEED_URL = "https://your-worker.workers.dev";</script>
```

**Host it live:** enable **GitHub Pages** (Settings → Pages → branch `main`, root) →
`https://christophbarton1.github.io/life-world-cup-tipp-assistant/`

## 📚 References
Kelly (1956) · Thorp · MacLean/Thorp/Ziemba · Maher (1982) · Dixon & Coles (1997) ·
Constantinou & Fenton (2013) · Miller & Davidow (2019) · Buchdahl — full list in
[`METHODOLOGY.md`](METHODOLOGY.md).

## 📄 License
MIT — no warranty. Not financial advice.

---
*Built with Claude.*

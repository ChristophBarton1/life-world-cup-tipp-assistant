# Methodology & Scientific Basis

This document describes the statistical methods behind the World Cup 2026 Prediction
Assistant and the academic literature each design decision is grounded in. The goal of
the project is not to promise profit, but to build a **rigorous, honest framework** that
*measures* whether a betting edge exists — and to apply established probability theory
correctly.

---

## 1. From odds to a probability distribution over scorelines

### 1.1 De-vigging the market
Bookmaker 1X2 odds contain an over-round (margin). For decimal odds `o_H, o_D, o_A`
the raw implied probabilities `1/o` sum to `S > 1`. We normalise to obtain the
fair (no-vig) probabilities:

```
p_i = (1 / o_i) / S ,   S = 1/o_H + 1/o_D + 1/o_A
```

### 1.2 Fitting a bivariate Poisson goal model
Football goals are well modelled as Poisson processes (Maher, 1982). We fit two
scoring rates `(λ_home, λ_away)` by grid-search so that an independent bivariate
Poisson reproduces the de-vigged 1X2 probabilities:

```
P(home i, away j) = Poisson(i; λ_home) · Poisson(j; λ_away)
```

The **most likely single scoreline** `argmax P(i,j)` is reported as the prediction.
This is the point estimate that maximises expected points in scoreline-prediction
pools such as Kicktipp, where the modal outcome — not an inflated favourite scoreline —
is optimal.

> **Planned upgrade:** replace the plain Poisson with the **Dixon–Coles (1997)** model,
> which adds (a) exponential time-weighting `φ(t) = exp(−ξ·t)` so recent matches
> dominate the fit, and (b) a low-score dependence correction. Dixon & Coles show this
> improves on Maher's independent-Poisson baseline.

---

## 2. An independent value model (Elo)

A model derived purely from the odds can never beat the market — it only mirrors it.
To detect mispricing we need an **independent signal**. We use **World Football Elo
ratings** (eloratings.net scale), which are *not* derived from betting markets.

Elo rating difference → goal supremacy → Poisson rates:

```
dr        = Elo_home − Elo_away + HFA·[host]
supremacy = dr / SUPREMACY_DIV
λ_home    = (BASE_TOTAL + supremacy) / 2
λ_away    = (BASE_TOTAL − supremacy) / 2
```

The same Poisson machinery (§1.2) then yields independent win/draw/loss probabilities.

**Data verification.** The scraped Elo values were cross-checked against an independent
aggregation of per-group average ratings; all 12 group averages matched to within a few
points, confirming data integrity before any modelling.

---

## 3. Shrinkage toward the market (the efficient prior)

The closing line of a sharp market-maker tracks true probabilities almost perfectly
(empirically `R² ≈ 0.997`; Buchdahl). Raw Elo, by contrast, is systematically
**over-confident** for one-off matches. We therefore **shrink** the Elo estimate toward
the de-vigged market:

```
p_final = w · p_Elo + (1 − w) · p_market ,   w = BLEND_W = 0.30
```

This implements the **two-model framework** prescribed by Miller & Davidow (2019):
a *Market-Maker Model* (the market price) and a *Valuation Model* (our Elo/Poisson
projection). The blend treats the market as a strong Bayesian prior and our model as a
gentle adjustment — which is what value betting actually is.

---

## 4. Value detection and a safeguard against long-shots

For each outcome we compute expected value and edge:

```
EV   = p_final · odds − 1
edge = p_final − p_market
```

A bet is flagged **only** if:

```
EV > 0   AND   edge ≥ EDGE_MIN (4 pts)   AND   p_final ≥ MIN_PROB (20%)
```

The `MIN_PROB` floor was added after a calibration finding: the raw model flagged a
9.00 long-shot (Jordan vs Austria) as "value" on a 4-point edge. On high odds a tiny
probability error is amplified into a fake edge. Requiring a realistic win probability
removes these unreliable long-shots — a small probability misestimate on a long-shot is
indistinguishable from model noise.

---

## 5. Staking: fractional Kelly

The **Kelly criterion** (Kelly, 1956) maximises the long-run exponential growth rate of
a bankroll and is asymptotically optimal; betting your whole stake maximises *expected*
capital but leads to ruin with probability one. For a bet with probability `p` and
decimal odds `o`:

```
f* = (p·o − 1) / (o − 1)
```

Full Kelly is too volatile in practice — a full-Kelly bankroll has an `X%` chance of
ever falling to `X%` of its starting value (MacLean, Thorp & Ziemba). We therefore use
**fractional Kelly**, which sacrifices at most ~25% of the growth rate to roughly halve
the variance, and is the disciplined standard recommended by Thorp. The strategy
comparison exposes three risk levels by re-weighting stakes (safe → likely winners,
higher risk → higher-odds upside) while never exceeding the entered bankroll.

---

## 6. Validation: Closing Line Value (CLV) — the core scientific metric

**The headline methodological choice of this project: success is measured by CLV, not by
short-term profit.** CLV compares the price you secured to the (no-vig) closing price:

```
CLV = your_odds / fair_closing_odds − 1
fair_closing_odds = closing_odds_of_outcome · (1/o_H + 1/o_D + 1/o_A)_close
```

Why CLV instead of profit? Because the standard deviation of CLV (~0.1) is roughly an
order of magnitude smaller than that of even-money win/loss outcomes (~1.0). A genuine
~1–2% edge therefore needs **many thousands of settled bets** to prove via profit, but
can be evidenced in **as few as ~50–65 bets** via CLV (Miller & Davidow; Buchdahl).
Sustained positive CLV — beating the closing line — is the proven marker that separates
long-term winners from losers. The paper-trading ledger logs each bet's price and the
closing price and reports average CLV and the count of CLV-positive bets.

> Caveat: absence of CLV does not always imply absence of skill, and CLV must be measured
> against **no-vig** closing odds for the expected-value link to hold.

---

## 7. Honest findings and limitations

A deep, adversarially-verified literature review informs the following honest position:

- **Main markets are highly efficient.** For sharp, high-liquidity World Cup markets
  (1X2, totals), realistic sustainable ROI is **low single digits at best** — the best
  *simple* academic system (pi-ratings; Constantinou & Fenton, 2013) returned **~3.05%
  ROI** over 1,887 bets across five EPL seasons, even net of a 5% margin assumption.
- **Our Elo model's edge is unproven until CLV says otherwise.** This tool is explicitly
  built to find that out cheaply (paper-trading, zero risk), not to assume it.
- **The edge does not scale.** Recreational books deliberately limit/ban exactly the
  value-hunting behaviour that signals an edge; market-makers (e.g. Pinnacle) and
  exchanges (Betfair) tolerate sharp action but charge commission and aren't available
  everywhere.
- **Bigger structural edges live outside the main markets** — line shopping, arbitrage,
  bonus/matched betting — and in less-liquid markets, but each has its own constraints.

These limitations are stated deliberately: an honest model that knows what it *cannot*
do is more scientifically credible than one that over-claims.

---

## 8. Parameters

| Parameter | Value | Meaning |
|---|---|---|
| `BLEND_W` | 0.30 | Weight on the Elo model vs the market prior (shrinkage) |
| `EDGE_MIN` | 0.04 | Minimum edge (4 pts) over the de-vigged market to flag value |
| `MIN_PROB` | 0.20 | Minimum model win probability — long-shot safeguard |
| `HFA` | 65 | Elo home-field advantage for host nations |
| `SUPREMACY_DIV` | 250 | Elo-difference → goal-supremacy scaling |
| `BASE_TOTAL` | 2.65 | Baseline expected total goals per match |
| Kelly fraction | ⅛ / ¼ / ½ | Risk tiers in the strategy comparison |

---

## References

1. **Kelly, J. L. (1956).** *A New Interpretation of Information Rate.* Bell System Technical Journal, 35(4), 917–926.
2. **Thorp, E. O.** *The Kelly Criterion in Blackjack, Sports Betting, and the Stock Market*; and *A Man for All Markets* (2017).
3. **MacLean, L. C., Thorp, E. O., & Ziemba, W. T.** *Good and Bad Properties of the Kelly Criterion.*
4. **Maher, M. J. (1982).** *Modelling Association Football Scores.* Statistica Neerlandica, 36(3), 109–118.
5. **Dixon, M. J., & Coles, S. G. (1997).** *Modelling Association Football Scores and Inefficiencies in the Football Betting Market.* Journal of the Royal Statistical Society: Series C (Applied Statistics), 46(2), 265–280.
6. **Constantinou, A. C., & Fenton, N. E. (2013).** *Determining the Level of Ability of Football Teams by Dynamic Ratings Based on the Relative Discrepancies in Scores.* Journal of Quantitative Analysis in Sports, 9(1), 37–50.
7. **Miller, E., & Davidow, M. (2019).** *The Logic of Sports Betting.*
8. **Buchdahl, J.** *Squares and Sharps, Suckers and Sharks*; *Fixed Odds Sports Betting*; *Monte Carlo or Bust.*

*This is an educational/analytical project, not financial advice. 18+. Bet responsibly.*

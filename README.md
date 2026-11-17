# Scaling Law Playground

An interactive playground for fitting Chinchilla-style scaling laws

$$\hat L(N,D) = E + A N^{-\alpha} + B D^{-\beta}$$

on synthetic training runs, then extrapolating far beyond them. It shows how fragile the fit is to small procedural choices.

**Live demo:** https://kevin23-design.github.io/ScalingLawPlayground/

Recreated and extended from the toy widget in Lilian Weng's post
[“Scaling Laws, Carefully”](https://lilianweng.github.io/posts/2026-06-24-scaling-laws/) (Lil’Log, 2026).

## Features

- The original three knobs: **fit region**, **loss precision** (rounding) and a **correlated milli-loss bias**, plus the extrapolation target.
- **Bootstrap 90% intervals** (200 resamples) on every fitted quantity and as bands on both charts.
- A second chart: the **implied compute-optimal model size relative to the truth**, `N_opt(fit) / N_opt(true)` vs compute, so you can see small exponent errors grow at frontier scale.
- **Click points** to include or exclude them from the fit.
- Adjustable **run-to-run noise** with reseeding (seed 0 = the original widget's pattern).
- Two ground truths: Besiroglu et al. (2024) and Hoffmann et al. (2022).
- One-click scenarios, **shareable URLs** (state lives in the hash), CSV export, a data table.
- English / 中文, light / dark theme, works on phones.

## How the fit works

For each candidate `(α, β, E)` on a coarse-to-fine grid, `A` and `B` are solved in closed form by (weighted) linear least squares, and the residual sum of squares is computed in O(1) from precomputed sums. A full fit takes about 1 ms, which makes the live bootstrap possible.

## Run locally

It is a static site with no build step and no dependencies:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Every push to `main` deploys to GitHub Pages through `.github/workflows/pages.yml`
(the repo's Pages source must be set to **GitHub Actions**).

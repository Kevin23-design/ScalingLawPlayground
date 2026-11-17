(() => {
  "use strict";

  // ---------------------------------------------------------------- i18n
  const I18N = {
    en: {
      brand: "Scaling Law Playground",
      title: "Scaling-law fitting playground",
      lede: `Fit <code>L̂(N,D) = E + A·N<sup>−α</sup> + B·D<sup>−β</sup></code> on synthetic "training runs", then extrapolate orders of magnitude further. Tiny procedural choices — which models you fit on, how you round the loss, a milli-loss bias — can move the predicted compute-optimal allocation a lot.`,
      gtLabel: "Ground truth",
      tryLabel: "Try a scenario:",
      plot1Title: "Loss along the compute-optimal frontier",
      hint1: "Hover a point for details · click a point to include/exclude it (switches to Custom region).",
      region: "Fit region",
      regSmall: "Small models only (≤1B)",
      regMedium: "Medium models only (0.7B–7B)",
      regLarge: "Large models only (≥3B)",
      regAll: "All measured models",
      regCustom: "Custom (click points)",
      regionHelp: "Changing the fitted scale range changes the apparent exponents.",
      prec: "Loss precision",
      precHelp: "Round observed losses before fitting.",
      bias: "Correlated bias",
      biasHelp: "A smooth loss-estimation bias (in milli-loss) across the (N, D) grid.",
      rn: "Run-to-run noise",
      reseed: "↻ Reseed",
      target: "Extrapolate to",
      targetHelp: "Evaluated at the true compute-optimal D for that N.",
      boot: "Bootstrap 90% interval (200 resamples)",
      reset: "Reset",
      share: "Copy share link",
      csv: "Export CSV",
      plot2Title: "Implied compute-optimal model size, relative to truth",
      plot2Sub: `From the fit, <code>N<sub>opt</sub>(C) = G·(C/6)<sup>β/(α+β)</sup></code> with <code>G = (αA / βB)<sup>1/(α+β)</sup></code>. A few-thousandths error in α or β becomes a large multiplicative error at frontier compute.`,
      tableTitle: "Data table (36 synthetic runs)",
      aboutTitle: "What is going on?",
      about: `<p>Each dot is a synthetic "training run": 9 model sizes from 100M to 70B parameters, each trained with 4 token budgets (D = 5N, 10N, 20N, 40N). Its loss is the ground truth plus a small run-to-run perturbation, an optional smooth bias, and rounding.</p>
        <p>The fitter minimizes squared error over <code>(E, A, B, α, β)</code>: for every candidate <code>(α, β, E)</code> on a coarse-to-fine grid, <code>A</code> and <code>B</code> are solved in closed form by linear least squares. The bootstrap resamples the fitted runs with replacement and refits 200 times.</p>
        <p>Three failure modes from the original post:</p>
        <ul>
          <li><b>Fit region</b> — fitting only small models (as in Kaplan et al.) gives different apparent exponents than fitting a wider range.</li>
          <li><b>Loss precision</b> — rounding losses to 2 decimals (or reporting exponents to 2 digits) visibly shifts the fit.</li>
          <li><b>Milli-loss bias</b> — a correlated error of only a few hundredths in loss can swing the predicted N<sub>opt</sub> by multiples at frontier compute.</li>
        </ul>`,
      credit: `Recreated and extended from the toy widget in Lilian Weng, <a href="https://lilianweng.github.io/posts/2026-06-24-scaling-laws/" target="_blank" rel="noopener">“Scaling Laws, Carefully”</a>, Lil’Log (2026). Ground-truth constants from Besiroglu et al. (2024) and Hoffmann et al. (2022).`,
      decimals: "decimals",
      seedOrig: "pattern: original",
      seedN: "seed",
      lgTruth: "ground truth",
      lgFit: "fitted law",
      lgUsed: "used in fit",
      lgHeld: "held out",
      lgTarget: "target",
      lgBand: "90% bootstrap",
      lgRegion: "fit range",
      axN: "model size N (parameters, log scale)",
      axLoss: "loss",
      axC: "training compute C = 6ND (FLOPs, log scale)",
      axNopt: "N_opt (fit) / N_opt (true)",
      kAlpha: "Fitted α", kBeta: "Fitted β", kE: "Fitted E", kA: "Fitted A", kB: "Fitted B",
      kNexp: "N_opt exponent", kDexp: "D_opt exponent",
      kPred: "Predicted loss", kErr: "Loss error", kNopt: "N_opt at target C",
      trueV: "true",
      ratio: "× true",
      failed: "Fit failed — try more precision, less noise, or more points.",
      fewPts: "Need at least 5 points in the fit.",
      copied: "Link copied to clipboard.",
      fitInfo: (n, ms) => `Fitted on ${n} runs in ${ms} ms.`,
      tN: "N", tD: "D", tRatio: "D/N", tObs: "observed", tTrue: "true", tFit: "fitted", tRes: "residual", tUsed: "in fit",
      yes: "yes", no: "—",
      sc: {
        base: ["Baseline", "All models, full precision."],
        small: ["Small models (Kaplan-like)", "Fit on ≤1B only and extrapolate 4+ orders of magnitude."],
        round2: ["Round to 2 decimals", "Coarse loss reporting."],
        round1: ["Round to 1 decimal", "Very coarse — watch the fit break down."],
        bias: ["+60 mL bias, medium", "Small systematic error on a narrow range."],
        noisy: ["Noisy runs ×3", "Larger seed-to-seed variance with bootstrap."],
      },
    },
    zh: {
      brand: "Scaling Law 演练场",
      title: "Scaling Law 拟合演练场",
      lede: `在合成的“训练实验”上拟合 <code>L̂(N,D) = E + A·N<sup>−α</sup> + B·D<sup>−β</sup></code>，再外推到大几个数量级的规模。看似微不足道的流程选择——拟合用哪些模型、损失保留几位小数、千分之几的系统偏差——都可能大幅改变预测的计算最优分配。`,
      gtLabel: "真实规律",
      tryLabel: "试试这些场景：",
      plot1Title: "沿计算最优前沿的损失",
      hint1: "悬停查看数据点详情 · 点击数据点可加入/移出拟合（自动切换到“自定义”区域）。",
      region: "拟合区域",
      regSmall: "仅小模型（≤1B）",
      regMedium: "仅中等模型（0.7B–7B）",
      regLarge: "仅大模型（≥3B）",
      regAll: "全部已测模型",
      regCustom: "自定义（点击数据点）",
      regionHelp: "改变拟合所用的规模范围，会改变表观指数。",
      prec: "损失精度",
      precHelp: "拟合前对观测损失做四舍五入。",
      bias: "相关偏差",
      biasHelp: "在 (N, D) 网格上施加平滑的损失估计偏差（单位：千分之一 loss）。",
      rn: "实验间噪声",
      reseed: "↻ 换种子",
      target: "外推至",
      targetHelp: "在该 N 对应的真实计算最优 D 处评估。",
      boot: "Bootstrap 90% 区间（200 次重采样）",
      reset: "重置",
      share: "复制分享链接",
      csv: "导出 CSV",
      plot2Title: "推断的计算最优模型规模（相对真实值）",
      plot2Sub: `由拟合结果得 <code>N<sub>opt</sub>(C) = G·(C/6)<sup>β/(α+β)</sup></code>，其中 <code>G = (αA / βB)<sup>1/(α+β)</sup></code>。α 或 β 千分之几的误差，在前沿算力下会变成数倍的乘性误差。`,
      tableTitle: "数据表（36 个合成实验）",
      aboutTitle: "这里发生了什么？",
      about: `<p>每个点是一次合成的“训练实验”：9 个模型规模（1 亿到 700 亿参数），每个规模用 4 种 token 预算训练（D = 5N、10N、20N、40N）。观测损失 = 真实规律 + 少量实验间扰动 + 可选的平滑偏差，再做四舍五入。</p>
        <p>拟合器对 <code>(E, A, B, α, β)</code> 最小化平方误差：在由粗到细的网格上枚举 <code>(α, β, E)</code>，对每组候选用线性最小二乘闭式求解 <code>A</code>、<code>B</code>。Bootstrap 对参与拟合的实验有放回重采样并重新拟合 200 次。</p>
        <p>原文展示的三种失效模式：</p>
        <ul>
          <li><b>拟合区域</b>——只用小模型拟合（如 Kaplan et al.），得到的表观指数与更宽范围拟合不同。</li>
          <li><b>损失精度</b>——损失只保留 2 位小数（或指数只报告 2 位）会明显改变拟合。</li>
          <li><b>千分级偏差</b>——仅百分之几 loss 的相关误差，就能让前沿算力下预测的 N<sub>opt</sub> 偏差数倍。</li>
        </ul>`,
      credit: `复刻并扩展自 Lilian Weng 的博客 <a href="https://lilianweng.github.io/posts/2026-06-24-scaling-laws/" target="_blank" rel="noopener">“Scaling Laws, Carefully”</a>（Lil’Log, 2026）中的交互小组件。真实参数取自 Besiroglu et al. (2024) 与 Hoffmann et al. (2022)。`,
      decimals: "位小数",
      seedOrig: "模式：原文",
      seedN: "种子",
      lgTruth: "真实规律",
      lgFit: "拟合结果",
      lgUsed: "参与拟合",
      lgHeld: "留出",
      lgTarget: "目标",
      lgBand: "90% bootstrap",
      lgRegion: "拟合范围",
      axN: "模型规模 N（参数量，对数坐标）",
      axLoss: "损失",
      axC: "训练算力 C = 6ND（FLOPs，对数坐标）",
      axNopt: "N_opt（拟合）/ N_opt（真实）",
      kAlpha: "拟合 α", kBeta: "拟合 β", kE: "拟合 E", kA: "拟合 A", kB: "拟合 B",
      kNexp: "N_opt 指数", kDexp: "D_opt 指数",
      kPred: "预测损失", kErr: "损失误差", kNopt: "目标算力下 N_opt",
      trueV: "真实",
      ratio: "× 真实值",
      failed: "拟合失败——试试提高精度、减小噪声或加入更多点。",
      fewPts: "拟合至少需要 5 个点。",
      copied: "链接已复制到剪贴板。",
      fitInfo: (n, ms) => `基于 ${n} 个实验拟合，耗时 ${ms} ms。`,
      tN: "N", tD: "D", tRatio: "D/N", tObs: "观测", tTrue: "真实", tFit: "拟合", tRes: "残差", tUsed: "参与拟合",
      yes: "是", no: "—",
      sc: {
        base: ["基线", "全部模型，完整精度。"],
        small: ["只用小模型（类 Kaplan）", "仅用 ≤1B 拟合并外推 4 个以上数量级。"],
        round2: ["保留 2 位小数", "粗粒度的损失记录。"],
        round1: ["保留 1 位小数", "非常粗——看拟合如何崩坏。"],
        bias: ["+60 mL 偏差，中等模型", "窄范围上的小系统误差。"],
        noisy: ["噪声 ×3", "更大的实验间方差，开启 bootstrap。"],
      },
    },
  };

  // ---------------------------------------------------------------- model
  const GT = {
    epoch: { name: "Besiroglu et al. 2024 (Epoch replication)", E: 1.8172, A: 482.01, B: 2085.43, alpha: 0.3478, beta: 0.3658 },
    chinchilla: { name: "Hoffmann et al. 2022 (Chinchilla, Method 3)", E: 1.69, A: 406.4, B: 410.7, alpha: 0.34, beta: 0.28 },
  };

  const MODEL_SIZES = [1e8, 3e8, 7e8, 1e9, 3e9, 7e9, 1e10, 3e10, 7e10];
  const RATIOS = [5, 10, 20, 40];
  const POINTS = [];
  MODEL_SIZES.forEach((N, ni) => RATIOS.forEach((r, ri) => {
    const D = r * N;
    POINTS.push({ idx: POINTS.length, ni, ri, N, D, ratio: r, lnN: Math.log(N), lnD: Math.log(D) });
  }));

  const log10 = x => Math.log10(x);
  const lossFn = (p, N, D) => p.E + p.A * Math.pow(N, -p.alpha) + p.B * Math.pow(D, -p.beta);
  const nExp = p => p.beta / (p.alpha + p.beta);
  const dExp = p => p.alpha / (p.alpha + p.beta);
  const G = p => Math.pow((p.alpha * p.A) / (p.beta * p.B), 1 / (p.alpha + p.beta));
  const nOpt = (p, C) => G(p) * Math.pow(C / 6, nExp(p));
  // D_opt for a given N on p's compute-optimal frontier
  const dOptForN = (p, N) => {
    const a = nExp(p), b = dExp(p), g = G(p);
    const K = Math.pow(N / g, 1 / a); // = C/6
    return Math.pow(K, b) / g;
  };

  // Original widget's deterministic run-to-run perturbation.
  const origRunNoise = p =>
    0.010 * Math.sin((p.ni + 1) * 1.91 + (p.ri + 1) * 2.67) + 0.004 * ((p.ni + p.ri) % 2 === 0 ? 1 : -1);

  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const gaussFrom = rng => () => {
    let u = 0; while (u === 0) u = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
  };
  const noiseCache = new Map();
  function runNoise(seed) {
    if (!noiseCache.has(seed)) {
      const g = gaussFrom(mulberry32(seed * 7919 + 17));
      noiseCache.set(seed, POINTS.map(p => (seed === 0 ? origRunNoise(p) : 0.008 * g())));
    }
    return noiseCache.get(seed);
  }

  const lnRange = (arr) => [Math.min(...arr), Math.max(...arr)];
  const [lnN0, lnN1] = lnRange(POINTS.map(p => p.lnN));
  const [lnD0, lnD1] = lnRange(POINTS.map(p => p.lnD));
  const biasProfile = POINTS.map(p => {
    const n = (p.lnN - lnN0) / (lnN1 - lnN0), d = (p.lnD - lnD0) / (lnD1 - lnD0);
    return 1.15 * (n - 0.5) - 0.95 * (d - 0.5) + 0.8 * (n - 0.5) * (d - 0.5) + 0.2 * Math.sin(8 * n + 5 * d);
  });

  const roundTo = (y, k) => { const f = 10 ** k; return Math.round(y * f) / f; };

  function regionMask(region, custom) {
    return POINTS.map(p => {
      switch (region) {
        case "small": return p.ni <= 3;
        case "medium": return p.ni >= 2 && p.ni <= 5;
        case "large": return p.ni >= 4;
        case "custom": return custom.has(p.idx);
        default: return true;
      }
    });
  }

  // ---------------------------------------------------------------- fitter
  // Minimize Σ w_i (E + A x_i + B z_i − y_i)², x = N^−α, z = D^−β.
  // For fixed (α, β, E) the optimal (A, B) is closed-form; residual SS too,
  // so the E loop is O(1) per candidate.
  function fitLaw(pts, ys, w) {
    const n = pts.length;
    let Sw = 0, Sy = 0, Syy = 0, minY = Infinity, maxY = -Infinity, used = 0;
    for (let i = 0; i < n; i++) {
      if (!w[i]) continue;
      used++;
      Sw += w[i]; Sy += w[i] * ys[i]; Syy += w[i] * ys[i] * ys[i];
      if (ys[i] < minY) minY = ys[i];
      if (ys[i] > maxY) maxY = ys[i];
    }
    if (used < 3) return null;
    const span = Math.max(maxY - minY, 0.1);
    const eMax = minY - 1e-6;
    const eMin0 = Math.max(0, minY - Math.max(1.2 * span, 6));

    const powStats = (lnArr, e) => {
      const v = new Float64Array(n);
      let S = 0, SS = 0, Sxy = 0;
      for (let i = 0; i < n; i++) {
        if (!w[i]) continue;
        const x = Math.exp(-e * lnArr[i]);
        v[i] = x; S += w[i] * x; SS += w[i] * x * x; Sxy += w[i] * x * ys[i];
      }
      return { v, S, SS, Sxy };
    };
    const lnN = pts.map(p => p.lnN), lnD = pts.map(p => p.lnD);
    const lin = (lo, hi, k, i) => lo + (hi - lo) * i / Math.max(1, k - 1);

    function search(r, st, best) {
      const xs = [], zs = [];
      for (let i = 0; i < st[0]; i++) { const a = lin(r.a0, r.a1, st[0], i); xs.push([a, powStats(lnN, a)]); }
      for (let j = 0; j < st[1]; j++) { const b = lin(r.b0, r.b1, st[1], j); zs.push([b, powStats(lnD, b)]); }
      for (const [alpha, X] of xs) {
        for (const [beta, Z] of zs) {
          let Sxz = 0;
          for (let i = 0; i < n; i++) if (w[i]) Sxz += w[i] * X.v[i] * Z.v[i];
          const det = X.SS * Z.SS - Sxz * Sxz;
          if (!(Math.abs(det) > 1e-40)) continue;
          for (let k = 0; k < st[2]; k++) {
            const E = lin(r.e0, r.e1, st[2], k);
            const Sxt = X.Sxy - E * X.S, Szt = Z.Sxy - E * Z.S;
            const A = (Sxt * Z.SS - Szt * Sxz) / det;
            const B = (X.SS * Szt - Sxz * Sxt) / det;
            if (!(A > 0 && B > 0)) continue;
            const Stt = Syy - 2 * E * Sy + E * E * Sw;
            const sse = Stt - A * Sxt - B * Szt;
            if (!best || sse < best.sse) best = { E, A, B, alpha, beta, sse };
          }
        }
      }
      return best;
    }

    let best = search({ a0: 0.15, a1: 0.6, b0: 0.15, b1: 0.6, e0: eMin0, e1: eMax }, [31, 31, 45], null);
    if (!best) return null;
    const refine = [[0.05, 0.5, [21, 21, 31]], [0.015, 0.16, [21, 21, 31]], [0.004, 0.04, [17, 17, 25]], [0.001, 0.01, [13, 13, 17]]];
    for (const [da, de, st] of refine) {
      best = search({
        a0: Math.max(0.01, best.alpha - da), a1: Math.min(1.2, best.alpha + da),
        b0: Math.max(0.01, best.beta - da), b1: Math.min(1.2, best.beta + da),
        e0: Math.max(0, best.E - de), e1: Math.min(eMax, best.E + de),
      }, st, best);
    }
    return best;
  }

  // ---------------------------------------------------------------- state
  const DEFAULTS = { gt: "epoch", region: "all", prec: 4, bias: 0, rn: 1, seed: 0, target: 15, boot: false, custom: null };
  let state = { ...DEFAULTS, custom: new Set(POINTS.map(p => p.idx)) };
  let lang = "en";
  try { const l = localStorage.getItem("slp-lang"); if (l === "en" || l === "zh") lang = l; } catch (e) {}
  const T = () => I18N[lang];

  const SCENARIOS = {
    base: { region: "all", prec: 4, bias: 0, rn: 1, seed: 0, boot: false },
    small: { region: "small", prec: 4, bias: 0, rn: 1, seed: 0, boot: false },
    round2: { region: "all", prec: 2, bias: 0, rn: 1, seed: 0, boot: false },
    round1: { region: "all", prec: 1, bias: 0, rn: 1, seed: 0, boot: false },
    bias: { region: "medium", prec: 4, bias: 60, rn: 1, seed: 0, boot: false },
    noisy: { region: "all", prec: 4, bias: 0, rn: 3, seed: 3, boot: true },
  };

  // URL hash <-> state
  function encodeState() {
    const mask = POINTS.reduce((m, p) => m + (state.custom.has(p.idx) ? 2 ** p.idx : 0), 0);
    const q = new URLSearchParams({
      gt: state.gt, r: state.region, p: state.prec, b: state.bias, rn: state.rn, s: state.seed, t: state.target, bs: state.boot ? 1 : 0,
    });
    if (state.region === "custom") q.set("m", mask.toString(36));
    return q.toString();
  }
  function decodeState() {
    const q = new URLSearchParams(location.hash.slice(1));
    if (![...q.keys()].length) return;
    const num = (k, lo, hi, d) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
    if (GT[q.get("gt")]) state.gt = q.get("gt");
    if (["small", "medium", "large", "all", "custom"].includes(q.get("r"))) state.region = q.get("r");
    state.prec = Math.round(num("p", 0, 4, state.prec));
    state.bias = num("b", -200, 200, state.bias);
    state.rn = num("rn", 0, 3, state.rn);
    state.seed = Math.round(num("s", 0, 1e6, state.seed));
    state.target = num("t", 11, 15, state.target);
    state.boot = q.get("bs") === "1";
    if (q.has("m")) {
      const m = parseInt(q.get("m"), 36);
      if (Number.isFinite(m)) state.custom = new Set(POINTS.filter(p => Math.floor(m / 2 ** p.idx) % 2 === 1).map(p => p.idx));
    }
  }

  // ---------------------------------------------------------------- DOM
  const $ = id => document.getElementById(id);
  const els = {
    gt: $("gt"), gtFormula: $("gt-formula"), region: $("region"), prec: $("prec"), bias: $("bias"), rn: $("rn"),
    target: $("target"), boot: $("boot"), precV: $("prec-v"), biasV: $("bias-v"), rnV: $("rn-v"), targetV: $("target-v"),
    seedLabel: $("seed-label"), plot1: $("plot1"), plot2: $("plot2"), tip: $("tip"), readout: $("readout"),
    status: $("status"), table: $("table"), legend1: $("legend1"), legend2: $("legend2"), scen: $("scenario-list"),
  };

  function applyI18n() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(el => { const v = T()[el.dataset.i18n]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-i18n-html]").forEach(el => { const v = T()[el.dataset.i18nHtml]; if (typeof v === "string") el.innerHTML = v; });
    $("lang-btn").textContent = lang === "zh" ? "EN" : "中文";
    els.scen.innerHTML = Object.keys(SCENARIOS).map(k =>
      `<button class="chip" type="button" data-sc="${k}" title="${T().sc[k][1]}">${T().sc[k][0]}</button>`).join("");
    els.legend1.innerHTML = [
      `<span><i class="sw dash" style="border-color:var(--truth)"></i>${T().lgTruth}</span>`,
      `<span><i class="sw" style="border-color:var(--fit)"></i>${T().lgFit}</span>`,
      `<span><i class="dot" style="background:var(--used)"></i>${T().lgUsed}</span>`,
      `<span><i class="dot" style="background:var(--held)"></i>${T().lgHeld}</span>`,
      `<span><i class="dot" style="background:var(--target)"></i>${T().lgTarget}</span>`,
      `<span class="bandlg"><i class="band"></i>${T().lgBand}</span>`,
    ].join("");
    els.legend2.innerHTML = [
      `<span><i class="sw dash" style="border-color:var(--truth)"></i>${T().lgTruth}</span>`,
      `<span><i class="sw" style="border-color:var(--fit)"></i>${T().lgFit}</span>`,
      `<span><i class="band" style="background:var(--region)"></i>${T().lgRegion}</span>`,
      `<span class="bandlg"><i class="band"></i>${T().lgBand}</span>`,
    ].join("");
  }

  function syncControls() {
    els.gt.value = state.gt; els.region.value = state.region; els.prec.value = state.prec; els.bias.value = state.bias;
    els.rn.value = state.rn; els.target.value = state.target; els.boot.checked = state.boot;
  }

  // ---------------------------------------------------------------- formatting
  const fmt = (x, d = 4) => (Number.isFinite(x) ? x.toFixed(d) : "—");
  const sup = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const pow10Str = e => "10" + String(e).split("").map(c => sup[c] || c).join("");
  const sci = (x, d = 2) => {
    if (!Number.isFinite(x) || x <= 0) return "—";
    const e = Math.floor(log10(x)); const m = x / 10 ** e;
    return `${m.toFixed(d - 1)}×${pow10Str(e)}`;
  };
  const human = N => N >= 1e13 ? sci(N) : N >= 1e12 ? `${+(N / 1e12).toPrecision(3)}T` : N >= 1e9 ? `${+(N / 1e9).toPrecision(3)}B` : `${+(N / 1e6).toPrecision(3)}M`;
  const quant = (arr, q) => {
    const a = arr.filter(Number.isFinite).sort((x, y) => x - y);
    if (!a.length) return NaN;
    const i = (a.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
    return a[lo] + (a[hi] - a[lo]) * (i - lo);
  };

  // ---------------------------------------------------------------- compute
  let last = null;

  function compute() {
    const truth = GT[state.gt];
    const noise = runNoise(state.seed);
    const mask = regionMask(state.region, state.custom);
    const obs = POINTS.map((p, i) => {
      const y = lossFn(truth, p.N, p.D) + state.rn * noise[i] + (state.bias / 1000) * biasProfile[i];
      return roundTo(y, state.prec);
    });
    const w = mask.map(m => (m ? 1 : 0));
    const nUsed = w.reduce((a, b) => a + b, 0);
    const t0 = performance.now();
    const fit = nUsed >= 5 ? fitLaw(POINTS, obs, w) : null;

    const targetN = 10 ** state.target;
    const targetD = dOptForN(truth, targetN);
    const targetC = 6 * targetN * targetD;

    let boot = null;
    if (fit && state.boot) {
      const rng = mulberry32(1234 + state.seed);
      const idx = w.map((v, i) => (v ? i : -1)).filter(i => i >= 0);
      boot = [];
      for (let b = 0; b < 200; b++) {
        const wb = new Array(POINTS.length).fill(0);
        for (let k = 0; k < idx.length; k++) wb[idx[Math.floor(rng() * idx.length)]]++;
        const f = fitLaw(POINTS, obs, wb);
        if (f) boot.push(f);
      }
    }
    const ms = Math.round(performance.now() - t0);
    last = { truth, obs, mask, fit, boot, nUsed, ms, targetN, targetD, targetC };
    return last;
  }

  // ---------------------------------------------------------------- render
  const W1 = 760, H1 = 400, M1 = { l: 62, r: 22, t: 18, b: 52 };
  const W2 = 760, H2 = 340, M2 = { l: 62, r: 22, t: 18, b: 52 };

  function pathFrom(pts) {
    let s = "";
    let pen = false;
    for (const [x, y] of pts) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) { pen = false; continue; }
      s += `${pen ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
      pen = true;
    }
    return s;
  }
  function bandFrom(xs, lo, hi) {
    const top = xs.map((x, i) => [x, hi[i]]), bot = xs.map((x, i) => [x, lo[i]]).reverse();
    const all = top.concat(bot).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
    return all.length ? "M" + all.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z" : "";
  }

  function renderPlot1(R) {
    const { truth, obs, mask, fit, boot, targetN, targetD } = R;
    const xMin = 8 - 0.15, xMax = Math.max(state.target, 11) + 0.2;
    const S = 200, samples = [];
    for (let i = 0; i <= S; i++) { const N = 10 ** (8 + (i / S) * (xMax - 0.2 - 8)); samples.push([N, dOptForN(truth, N)]); }
    const trueC = samples.map(([N, D]) => lossFn(truth, N, D));
    const fitC = fit ? samples.map(([N, D]) => lossFn(fit, N, D)) : [];
    let bLo = [], bHi = [];
    if (boot && boot.length) {
      samples.forEach(([N, D]) => {
        const v = boot.map(f => lossFn(f, N, D));
        bLo.push(quant(v, 0.05)); bHi.push(quant(v, 0.95));
      });
    }
    const predT = fit ? lossFn(fit, targetN, targetD) : NaN;
    const trueT = lossFn(truth, targetN, targetD);

    const ys = [...obs, ...trueC, ...fitC, trueT, predT].filter(Number.isFinite);
    let y0 = Math.min(...ys), y1 = Math.max(...ys);
    // keep band from blowing the scale up
    const pad = 0.07 * (y1 - y0 || 1); y0 -= pad; y1 += pad;

    const X = lx => M1.l + (lx - xMin) / (xMax - xMin) * (W1 - M1.l - M1.r);
    const Y = y => H1 - M1.b - (y - y0) / (y1 - y0) * (H1 - M1.t - M1.b);
    const clampY = y => Math.max(M1.t - 4, Math.min(H1 - M1.b + 4, y));

    const parts = [];
    parts.push(`<defs><clipPath id="c1"><rect x="${M1.l}" y="${M1.t}" width="${W1 - M1.l - M1.r}" height="${H1 - M1.t - M1.b}"/></clipPath></defs>`);
    // fit range shading
    const usedN = POINTS.filter((p, i) => mask[i]).map(p => log10(p.N));
    if (usedN.length) {
      const a = X(Math.min(...usedN) - 0.06), b = X(Math.max(...usedN) + 0.06);
      parts.push(`<rect x="${a}" y="${M1.t}" width="${b - a}" height="${H1 - M1.t - M1.b}" fill="var(--region)"/>`);
    }
    // grid & ticks
    const nT = 5;
    for (let i = 0; i <= nT; i++) {
      const v = y0 + (i / nT) * (y1 - y0), yy = Y(v);
      parts.push(`<line x1="${M1.l}" x2="${W1 - M1.r}" y1="${yy}" y2="${yy}" stroke="var(--grid)"/>`);
      parts.push(`<text x="${M1.l - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${v.toFixed(2)}</text>`);
    }
    for (let e = Math.ceil(xMin); e <= Math.floor(xMax); e++) {
      const xx = X(e);
      parts.push(`<line x1="${xx}" x2="${xx}" y1="${M1.t}" y2="${H1 - M1.b}" stroke="var(--grid)"/>`);
      parts.push(`<text x="${xx}" y="${H1 - M1.b + 18}" text-anchor="middle" font-size="11" fill="var(--muted)">${pow10Str(e)}</text>`);
    }
    parts.push(`<line x1="${M1.l}" x2="${W1 - M1.r}" y1="${H1 - M1.b}" y2="${H1 - M1.b}" stroke="var(--axis)"/>`);
    parts.push(`<text x="${(W1 + M1.l - M1.r) / 2}" y="${H1 - 12}" text-anchor="middle" font-size="12" fill="var(--text-2)">${T().axN}</text>`);
    parts.push(`<text x="16" y="${(H1 + M1.t - M1.b) / 2}" transform="rotate(-90 16 ${(H1 + M1.t - M1.b) / 2})" text-anchor="middle" font-size="12" fill="var(--text-2)">${T().axLoss}</text>`);

    const sx = samples.map(([N]) => X(log10(N)));
    parts.push(`<g clip-path="url(#c1)">`);
    if (bLo.length) parts.push(`<path d="${bandFrom(sx, bLo.map(Y), bHi.map(Y))}" fill="var(--fit-band)"/>`);
    parts.push(`<path d="${pathFrom(sx.map((x, i) => [x, Y(trueC[i])]))}" fill="none" stroke="var(--truth)" stroke-width="2" stroke-dasharray="6 5"/>`);
    if (fit) parts.push(`<path d="${pathFrom(sx.map((x, i) => [x, Y(fitC[i])]))}" fill="none" stroke="var(--fit)" stroke-width="2.25"/>`);
    parts.push(`</g>`);

    // target
    const tx = X(state.target);
    parts.push(`<line x1="${tx}" x2="${tx}" y1="${M1.t}" y2="${H1 - M1.b}" stroke="var(--target)" stroke-width="1.5" stroke-dasharray="3 4"/>`);
    if (Number.isFinite(predT)) {
      const yp = clampY(Y(predT)), yt = Y(trueT);
      if (Math.abs(yp - yt) > 3) parts.push(`<line x1="${tx}" x2="${tx}" y1="${yp}" y2="${yt}" stroke="var(--bad)" stroke-width="3" stroke-linecap="round" opacity=".55"/>`);
      parts.push(`<circle cx="${tx}" cy="${yp}" r="6" fill="var(--fit)" stroke="var(--surface)" stroke-width="2"><title>predicted ${predT.toFixed(4)}</title></circle>`);
    }
    parts.push(`<circle cx="${tx}" cy="${Y(trueT)}" r="6" fill="var(--target)" stroke="var(--surface)" stroke-width="2"><title>true ${trueT.toFixed(4)}</title></circle>`);

    // points (held-out first so used sit on top)
    const order = POINTS.map((p, i) => i).sort((a, b) => (mask[a] ? 1 : 0) - (mask[b] ? 1 : 0));
    for (const i of order) {
      const p = POINTS[i];
      const jitter = (p.ri - 1.5) * 0.035;
      const cx = X(log10(p.N) + jitter), cy = Y(obs[i]);
      parts.push(`<circle class="pt" data-i="${i}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${mask[i] ? 5 : 4.2}" fill="${mask[i] ? "var(--used)" : "var(--held)"}" fill-opacity="${mask[i] ? 1 : 0.55}" stroke="var(--surface)" stroke-width="1.5"/>`);
    }
    els.plot1.innerHTML = parts.join("");
    document.querySelectorAll(".bandlg").forEach(e => (e.style.display = bLo.length ? "" : "none"));
  }

  function renderPlot2(R) {
    const { truth, fit, boot, mask, targetC } = R;
    const usedC = POINTS.filter((p, i) => mask[i]).map(p => log10(6 * p.N * p.D));
    const c0 = Math.min(...POINTS.map(p => log10(6 * p.N * p.D))) - 0.3;
    const c1 = log10(targetC) + 0.3;
    const S = 160, cs = [];
    for (let i = 0; i <= S; i++) cs.push(c0 + (i / S) * (c1 - c0));
    // log10 of N_opt(fit) / N_opt(true)
    const rel = f => c => log10(nOpt(f, 10 ** c) / nOpt(truth, 10 ** c));
    const fitL = fit ? cs.map(rel(fit)) : [];
    let lo = [], hi = [];
    if (boot && boot.length) cs.forEach(c => {
      const v = boot.map(f => rel(f)(c));
      lo.push(quant(v, 0.05)); hi.push(quant(v, 0.95));
    });
    const all = [0, ...fitL, ...lo, ...hi].filter(Number.isFinite);
    let ext = Math.max(log10(1.5), ...all.map(Math.abs)) * 1.12;
    ext = Math.min(ext, 2);
    const y0 = -ext, y1 = ext;
    const X = c => M2.l + (c - c0) / (c1 - c0) * (W2 - M2.l - M2.r);
    const Y = v => H2 - M2.b - (v - y0) / (y1 - y0) * (H2 - M2.t - M2.b);
    const parts = [];
    parts.push(`<defs><clipPath id="c2"><rect x="${M2.l}" y="${M2.t}" width="${W2 - M2.l - M2.r}" height="${H2 - M2.t - M2.b}"/></clipPath></defs>`);
    if (usedC.length) {
      const a = X(Math.min(...usedC)), b = X(Math.max(...usedC));
      parts.push(`<rect x="${a}" y="${M2.t}" width="${Math.max(2, b - a)}" height="${H2 - M2.t - M2.b}" fill="var(--region)"/>`);
    }
    const cand = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 0.67, 0.8, 1, 1.25, 1.5, 2, 5, 10, 20, 50, 100];
    let ticks = cand.filter(r => Math.abs(log10(r)) <= ext);
    if (ticks.length > 9) ticks = ticks.filter(r => ![0.67, 0.8, 1.25, 1.5].includes(r));
    for (const r of ticks) {
      const yy = Y(log10(r));
      parts.push(`<line x1="${M2.l}" x2="${W2 - M2.r}" y1="${yy}" y2="${yy}" stroke="${r === 1 ? "var(--axis)" : "var(--grid)"}"/>`);
      parts.push(`<text x="${M2.l - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${r}×</text>`);
    }
    const xStep = c1 - c0 > 10 ? 2 : 1;
    for (let e = Math.ceil(c0); e <= Math.floor(c1); e += xStep) {
      parts.push(`<line x1="${X(e)}" x2="${X(e)}" y1="${M2.t}" y2="${H2 - M2.b}" stroke="var(--grid)"/>`);
      parts.push(`<text x="${X(e)}" y="${H2 - M2.b + 18}" text-anchor="middle" font-size="11" fill="var(--muted)">${pow10Str(e)}</text>`);
    }
    parts.push(`<line x1="${M2.l}" x2="${W2 - M2.r}" y1="${H2 - M2.b}" y2="${H2 - M2.b}" stroke="var(--axis)"/>`);
    parts.push(`<text x="${(W2 + M2.l - M2.r) / 2}" y="${H2 - 12}" text-anchor="middle" font-size="12" fill="var(--text-2)">${T().axC}</text>`);
    parts.push(`<text x="16" y="${(H2 + M2.t - M2.b) / 2}" transform="rotate(-90 16 ${(H2 + M2.t - M2.b) / 2})" text-anchor="middle" font-size="12" fill="var(--text-2)">${T().axNopt}</text>`);
    const xs = cs.map(X);
    parts.push(`<g clip-path="url(#c2)">`);
    if (lo.length) parts.push(`<path d="${bandFrom(xs, lo.map(Y), hi.map(Y))}" fill="var(--fit-band)"/>`);
    parts.push(`<path d="M${M2.l},${Y(0)}L${W2 - M2.r},${Y(0)}" fill="none" stroke="var(--truth)" stroke-width="2" stroke-dasharray="6 5"/>`);
    if (fit) parts.push(`<path d="${pathFrom(xs.map((x, i) => [x, Y(fitL[i])]))}" fill="none" stroke="var(--fit)" stroke-width="2.25"/>`);
    parts.push(`</g>`);
    const tx = X(log10(targetC));
    parts.push(`<line x1="${tx}" x2="${tx}" y1="${M2.t}" y2="${H2 - M2.b}" stroke="var(--target)" stroke-width="1.5" stroke-dasharray="3 4"/>`);
    parts.push(`<circle cx="${tx}" cy="${Y(0)}" r="6" fill="var(--target)" stroke="var(--surface)" stroke-width="2"/>`);
    if (fit) {
      const v = rel(fit)(log10(targetC));
      const yf = Math.max(M2.t, Math.min(H2 - M2.b, Y(v)));
      parts.push(`<circle cx="${tx}" cy="${yf}" r="6" fill="var(--fit)" stroke="var(--surface)" stroke-width="2"/>`);
      const lab = `${T().lgFit}: ${(10 ** v).toFixed(2)}× · ${human(nOpt(fit, targetC))} vs ${human(nOpt(truth, targetC))}`;
      const above = v >= 0;
      parts.push(`<text x="${tx - 10}" y="${yf + (above ? -12 : 20)}" text-anchor="end" font-size="12" font-weight="600" fill="var(--text)">${lab}</text>`);
    }
    els.plot2.innerHTML = parts.join("");
  }

  function renderReadout(R) {
    const { truth, fit, boot, targetN, targetD, targetC } = R;
    if (!fit) { els.readout.innerHTML = ""; return; }
    const ci = fn => {
      if (!boot || !boot.length) return "";
      const v = boot.map(fn);
      return `<div class="ci">90%: [${fmt(quant(v, 0.05), 4)}, ${fmt(quant(v, 0.95), 4)}]</div>`;
    };
    const ciSci = fn => {
      if (!boot || !boot.length) return "";
      const v = boot.map(fn);
      return `<div class="ci">90%: [${human(quant(v, 0.05))}, ${human(quant(v, 0.95))}]</div>`;
    };
    const pred = lossFn(fit, targetN, targetD), tr = lossFn(truth, targetN, targetD), err = pred - tr;
    const nf = nOpt(fit, targetC), nt = nOpt(truth, targetC), ratio = nf / nt;
    const stat = (k, v, t, extra = "", cls = "", vcls = "") =>
      `<div class="stat ${cls}"><div class="k">${k}</div><div class="v ${vcls}">${v}</div>${t ? `<div class="t">${t}</div>` : ""}${extra}</div>`;
    const tv = T().trueV;
    els.readout.innerHTML = [
      stat(T().kAlpha, fmt(fit.alpha), `${tv} ${fmt(truth.alpha)}`, ci(f => f.alpha)),
      stat(T().kBeta, fmt(fit.beta), `${tv} ${fmt(truth.beta)}`, ci(f => f.beta)),
      stat(T().kE, fmt(fit.E), `${tv} ${fmt(truth.E)}`, ci(f => f.E)),
      stat(T().kA, fit.A.toFixed(1), `${tv} ${truth.A}`),
      stat(T().kB, fit.B.toFixed(1), `${tv} ${truth.B}`),
      stat(T().kNexp, fmt(nExp(fit)), `${tv} ${fmt(nExp(truth))}`, ci(nExp)),
      stat(T().kDexp, fmt(dExp(fit)), `${tv} ${fmt(dExp(truth))}`, ci(dExp)),
      stat(T().kPred, fmt(pred), `${tv} ${fmt(tr)} @ N=${human(targetN)}`, ci(f => lossFn(f, targetN, targetD))),
      stat(T().kErr, `${err >= 0 ? "+" : ""}${fmt(err)}`, `${(100 * err / tr).toFixed(2)}%`, "", "hl", Math.abs(err) > 0.01 ? "bad" : "good"),
      stat(T().kNopt, human(nf), `${ratio.toFixed(2)}${T().ratio} · C=${sci(targetC)}`, ciSci(f => nOpt(f, targetC)), "hl", Math.abs(Math.log(ratio)) > Math.log(1.25) ? "bad" : "good"),
    ].join("");
  }

  function renderTable(R) {
    const { truth, obs, mask, fit } = R;
    const t = T();
    const head = `<thead><tr><th>#</th><th>${t.tN}</th><th>${t.tD}</th><th>${t.tRatio}</th><th>${t.tObs}</th><th>${t.tTrue}</th><th>${t.tFit}</th><th>${t.tRes}</th><th>${t.tUsed}</th></tr></thead>`;
    const rows = POINTS.map((p, i) => {
      const f = fit ? lossFn(fit, p.N, p.D) : NaN;
      return `<tr class="${mask[i] ? "" : "held"}"><td>${i + 1}</td><td>${human(p.N)}</td><td>${sci(p.D)}</td><td>${p.ratio}</td><td>${obs[i].toFixed(state.prec)}</td><td>${fmt(lossFn(truth, p.N, p.D))}</td><td>${fmt(f)}</td><td>${fmt(obs[i] - f)}</td><td>${mask[i] ? t.yes : t.no}</td></tr>`;
    }).join("");
    els.table.innerHTML = head + `<tbody>${rows}</tbody>`;
  }

  function renderLabels() {
    const t = T();
    els.precV.textContent = `${state.prec} ${t.decimals}`;
    els.biasV.textContent = `${state.bias >= 0 ? "+" : ""}${state.bias} mL`;
    els.rnV.textContent = `×${(+state.rn).toFixed(2)}`;
    els.targetV.textContent = `N = ${human(10 ** state.target)}`;
    els.seedLabel.textContent = state.seed === 0 ? t.seedOrig : `${t.seedN} ${state.seed}`;
    const g = GT[state.gt];
    els.gtFormula.textContent = `L̂ = ${g.E} + ${g.A}·N^−${g.alpha} + ${g.B}·D^−${g.beta}`;
    document.querySelectorAll(".chip").forEach(c => {
      const s = SCENARIOS[c.dataset.sc];
      c.classList.toggle("active", Object.keys(s).every(k => state[k] === s[k]) && state.target === 15);
    });
  }

  function render() {
    renderLabels();
    const R = compute();
    renderPlot1(R);
    renderPlot2(R);
    renderReadout(R);
    renderTable(R);
    const t = T();
    if (!R.fit) {
      els.status.className = "status err";
      els.status.textContent = R.nUsed < 5 ? t.fewPts : t.failed;
    } else {
      els.status.className = "status";
      els.status.textContent = t.fitInfo(R.nUsed, R.ms);
    }
    history.replaceState(null, "", "#" + encodeState());
  }

  let pending = false;
  const schedule = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; render(); }); };

  // ---------------------------------------------------------------- events
  els.gt.innerHTML = Object.entries(GT).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join("");
  els.gt.addEventListener("change", () => { state.gt = els.gt.value; schedule(); });
  els.region.addEventListener("change", () => {
    if (els.region.value === "custom" && state.region !== "custom") {
      const m = regionMask(state.region, state.custom);
      state.custom = new Set(POINTS.filter((p, i) => m[i]).map(p => p.idx));
    }
    state.region = els.region.value; schedule();
  });
  [["prec", "prec"], ["bias", "bias"], ["rn", "rn"], ["target", "target"]].forEach(([id, key]) =>
    els[id].addEventListener("input", () => { state[key] = Number(els[id].value); schedule(); }));
  els.boot.addEventListener("change", () => { state.boot = els.boot.checked; schedule(); });
  $("reseed").addEventListener("click", () => { state.seed = state.seed + 1 + Math.floor(Math.random() * 97); schedule(); });
  $("reset").addEventListener("click", () => {
    state = { ...DEFAULTS, gt: state.gt, custom: new Set(POINTS.map(p => p.idx)) };
    syncControls(); schedule();
  });
  $("share").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); els.status.textContent = T().copied; }
    catch (e) { prompt("URL", location.href); }
  });
  $("csv").addEventListener("click", () => {
    if (!last) return;
    const rows = [["N", "D", "D_over_N", "observed_loss", "true_loss", "fitted_loss", "used_in_fit"]];
    POINTS.forEach((p, i) => rows.push([p.N, p.D, p.ratio, last.obs[i], lossFn(last.truth, p.N, p.D).toFixed(6),
      last.fit ? lossFn(last.fit, p.N, p.D).toFixed(6) : "", last.mask[i] ? 1 : 0]));
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "scaling-law-runs.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  els.scen.addEventListener("click", e => {
    const b = e.target.closest("[data-sc]"); if (!b) return;
    Object.assign(state, SCENARIOS[b.dataset.sc], { target: 15 });
    syncControls(); schedule();
  });
  $("lang-btn").addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    try { localStorage.setItem("slp-lang", lang); } catch (e) {}
    applyI18n(); render();
  });
  $("theme-btn").addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("slp-theme", next); } catch (e) {}
  });
  try { const th = localStorage.getItem("slp-theme"); if (th) document.documentElement.dataset.theme = th; } catch (e) {}

  // point hover + click
  const wrap = $("plot1-wrap");
  els.plot1.addEventListener("mousemove", e => {
    const c = e.target.closest(".pt");
    if (!c || !last) { els.tip.hidden = true; return; }
    const i = +c.dataset.i, p = POINTS[i];
    const tr = lossFn(last.truth, p.N, p.D), f = last.fit ? lossFn(last.fit, p.N, p.D) : NaN;
    const t = T();
    els.tip.innerHTML = `<b>N = ${human(p.N)}</b>, D = ${sci(p.D)} (${p.ratio}N)<br>
      <span class="k">${t.tObs}</span> ${last.obs[i].toFixed(state.prec)} · <span class="k">${t.tTrue}</span> ${tr.toFixed(4)}<br>
      <span class="k">${t.tFit}</span> ${fmt(f)} · <span class="k">${t.tRes}</span> ${fmt(last.obs[i] - f)}`;
    els.tip.hidden = false;
    const r = wrap.getBoundingClientRect();
    let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
    const tw = els.tip.offsetWidth;
    if (x + tw > r.width) x = e.clientX - r.left - tw - 14;
    els.tip.style.left = x + "px"; els.tip.style.top = y + "px";
  });
  els.plot1.addEventListener("mouseleave", () => (els.tip.hidden = true));
  els.plot1.addEventListener("click", e => {
    const c = e.target.closest(".pt"); if (!c) return;
    const i = +c.dataset.i;
    if (state.region !== "custom") {
      const m = regionMask(state.region, state.custom);
      state.custom = new Set(POINTS.filter((p, k) => m[k]).map(p => p.idx));
      state.region = "custom";
    }
    state.custom.has(i) ? state.custom.delete(i) : state.custom.add(i);
    syncControls(); schedule();
  });

  // ---------------------------------------------------------------- boot
  decodeState();
  applyI18n();
  syncControls();
  render();
})();

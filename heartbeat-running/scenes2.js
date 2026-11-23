
// みのまわり図鑑 動画「走ると、どうして心臓がドキドキするの？」
// 色の約束：さんその多い血＝あか、さんその減った血＝むらさき、さんそ＝きいろの つぶ、
// アクセル（速くする神経）＝オレンジ、ブレーキ（おそくする神経）＝あお、脳＝ピンクとむらさき

// ---------- しんぞうの道具 ----------
const HB = {
  red: '#e0483a', redL: '#f7b9b1', redD: '#9c2f25', pur: '#8a6fd0', purL: '#cfc3f1', o2: '#f6c21c',
  acc: '#f08a3c', brk: '#3d8fd6', brain: '#f4b9c4', brainD: '#e08fa0', stem: '#8a6fd0',
  skin: '#f6d6bd', lung: '#f7a8b4', lungD: '#e58a9a', mus: '#d8574f', musL: '#ee8f86', musD: '#b23d36',
};
// 折れ線の上の、割合 u（0〜1）の点
function along(pts, u) {
  let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let s = clamp(u) * L;
  for (let i = 0; i < seg.length; i++) {
    if (s <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(s / seg[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; }
    s -= seg[i];
  }
  return pts[pts.length - 1];
}
const frac = x => x - Math.floor(x);
// 行の中の割合の時刻
const at = (k, f) => lerp(cue(k), cueE(k), f);
// 1拍の動き（ドッ・クン）。p は拍の数（つみかさね）
const pulseOf = p => { p = frac(p); return p < 0.14 ? Math.sin(p / 0.14 * Math.PI) : p < 0.34 ? 0.5 * Math.sin((p - 0.14) / 0.2 * Math.PI) : 0; };
// 速さが r0 → r1（拍/秒）に変わるときの、拍の数（つみかさね）
const rampBeats = (t, t0, t1, r0, r1) => t <= t0 ? r0 * t : t >= t1 ? r0 * t0 + (r0 + r1) / 2 * (t1 - t0) + r1 * (t - t1) : r0 * t + (r1 - r0) * (t - t0) * (t - t0) / (2 * (t1 - t0));
const HEART_L = 'M 0 -58 C -34 -112 -128 -92 -112 -14 C -100 44 -40 76 0 118 Z', HEART_R = 'M 0 -58 C 34 -112 128 -92 112 -14 C 100 44 40 76 0 118 Z';
// しんぞう（k：ちぢむ動き 0〜1。two：左右の色分け＝むかって左が からだからもどった血）
function heartG(k = 0, { two = false } = {}) {
  return `<g transform="scale(${1 + 0.1 * k})"><path d="${HEART_L}" fill="${two ? HB.pur : HB.red}"/><path d="${HEART_R}" fill="${HB.red}"/>` +
    (two ? `<path d="M 0 -50 L 0 106" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.85"/>` : '') +
    `<path d="M 0 -58 C -34 -112 -128 -92 -112 -14 C -100 44 -40 76 0 118 C 40 76 100 44 112 -14 C 128 -92 34 -112 0 -58 Z" fill="none" stroke="${HB.redD}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M 46 -74 C 74 -80 94 -58 94 -34" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.55"/></g>`;
}
// しんぞうのまわりの「ドキッ」の線
const beatRing = (k, r = 170) => k <= 0.02 ? '' : [-1, 1].map(sd => `<path d="M ${sd * r} -60 q ${sd * 26} 40 0 80 M ${sd * (r + 44)} -86 q ${sd * 36} 66 0 132" fill="none" stroke="${HB.red}" stroke-width="9" stroke-linecap="round" opacity="${k * 0.8}"/>`).join('');
// 血のつぶ（o2：さんそを持っているか 0〜1）
const drop = (x, y, r, rich = 1, o = 1) => `<g opacity="${o}"><circle cx="${x}" cy="${y}" r="${r}" fill="${rich > 0.5 ? HB.red : HB.pur}" stroke="#fff" stroke-width="3"/>${rich > 0.5 ? `<circle cx="${x + r * 0.2}" cy="${y - r * 0.2}" r="${r * 0.42}" fill="${HB.o2}"/>` : ''}</g>`;
// 筋肉（c：ちぢみ 0〜1）
function muscleG(c = 0) {
  const sx = 1 - 0.1 * c, sy = 1 + 0.2 * c;
  return `<path d="M -430 0 L -300 0 M 300 0 L 430 0" stroke="#f3ead8" stroke-width="34" stroke-linecap="round"/><path d="M -430 0 L -300 0 M 300 0 L 430 0" stroke="#d8cdb8" stroke-width="34" stroke-linecap="round" opacity="0.35"/>
    <g transform="scale(${sx} ${sy})"><path d="M -340 0 C -200 -120 200 -120 340 0 C 200 120 -200 120 -340 0 Z" fill="${HB.mus}" stroke="${HB.musD}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M -280 -14 C -140 -70 140 -70 280 -14 M -300 8 C -150 -22 150 -22 300 8 M -280 30 C -140 66 140 66 280 30" fill="none" stroke="${HB.musL}" stroke-width="8" stroke-linecap="round" opacity="0.9"/></g>`;
}
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="12" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="6" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="11" fill="${col}" stroke="#fff" stroke-width="4"/></g>`;
const warnIcon = () => `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
// カメレオンを 画面の内がわ（左）向きにして出す
const chamL = (t, x, y, o = {}) => `<g transform="translate(${2 * x} 0) scale(-1 1)">${kidShow('K', t, x, y, { enter: 'pop', ...o, bubble: false })}</g>`;
const brainG = () => `<path d="M -62 -40 C -72 -80 -30 -98 0 -88 C 30 -98 72 -80 62 -40 C 70 -14 40 -2 14 -6 L -14 -6 C -40 -2 -70 -14 -62 -40 Z" fill="${HB.brain}" stroke="${HB.brainD}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 0 -86 L 0 -10 M -42 -66 q 16 10 4 26 M 40 -68 q -16 12 -2 28 M -28 -28 q 12 -8 18 6 M 24 -32 q -10 -6 -16 8" fill="none" stroke="${HB.brainD}" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="-10" y="-10" width="20" height="30" rx="10" fill="${HB.stem}"/>`;

// 1. つかみ：公園でかけっこ。走ったあと、むねに手を当てると
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = skyRect('skh', 0) + sunDisc(1700, 170, 60, 0) + cloud(320 + t * 8, 230, 0.9) + cloud(1280 - t * 5, 310, 0.6, '#fff', 0.85);
    out += `<path d="M 0 760 Q 480 660 960 740 T 1920 700 L 1920 1080 L 0 1080 Z" fill="#93cf8c"/>`;
    out += tree(1660, 800, 1.1) + tree(1440, 780, 0.7, '#4c9a57') + tree(200, 800, 0.9, '#4c9a57');
    out += `<path d="M 0 880 Q 620 800 1240 890 T 1920 860 L 1920 1080 L 0 1080 Z" fill="#6fba68"/>`;
    // かけっこして とまる
    out += kidShow('B', t, 720, 955, { s: 0.76, start: 0.2, n: 0, enter: 'slideL' });
    out += kidShow('S', t, 1140, 955, { s: 0.68, start: 0.7, n: 1, enter: 'slideL', bubble: false, look: [-6, 0] });
    // むねの ドキドキ
    const tH = at(0, 0.62);
    if (t > tH) {
      const p = (t - tH) * 2.5, k = pulseOf(p), a = back(prog(t, tH, 0.4));
      out += g(heartG(k) + beatRing(k, 150), { x: 720, y: 838, s: 0.3 * a });
      const i = Math.floor(p), f = frac(p), sd = i % 2 ? 1 : -1;
      out += g(text(0, 0, 'ドキ', { size: 60, w: 900, fill: HB.red, extra: 'stroke="#fff" stroke-width="10" paint-order="stroke" stroke-linejoin="round"' }), { x: 720 + sd * 170, y: 790 - (i % 3) * 22 - f * 24, o: Math.min(1, f * 6) * (1 - f * f), s: 0.8 + f * 0.4, r: sd * 8 });
    }
    const tS = cue(2) + 0.4;
    if (t > tS) { const k = pulseOf((t - tS) * 2.3 + 0.4); out += g(heartG(k) + beatRing(k, 150), { x: 1140, y: 812, s: 0.26 * back(prog(t, tS, 0.4)) }); }
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 250);
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blue}">走る</tspan>と、どうして</text>`, { x: 960, y: 440, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">心臓が <tspan fill="${C.red}">ドキドキ</tspan>するの？</text>`, { x: 960, y: 620, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const k = pulseOf((t - t0) * 2.2);
      out += pop(heartG(k) + beatRing(k, 160), t, t0 + 1.8, 960, 810, { s: 0.55 });
    }
    return out;
  },
});

// 2. 予想（正解は3番）
const OPTS = [['①', 'うつ かいすう だけ'], ['②', '1かいに おくる ちの りょう だけ'], ['③', 'かいすうも りょうも、りょうほう']];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'はしると、しんぞうは なにを ふやす？', { size: 74, w: 900 }), t, 0.3, 900, 215);
    const cur = curLine();
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 52, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 400 + i * 168);
    });
    out += kidShow('B', t, 1700, 860, { s: 0.66, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1700, y: 330, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 心臓は血を送り出すポンプ。「ドックン」は とびらがしまる音
// 血のめぐる道（からだ → むかって左を上へ → はい → 右を下へ → からだ）
const RING_T = 190;
const RING = (() => { const P = [], cx = 520, xl = 420, xr = 620, yt = RING_T, yb = 765, r = 80;
  const arc = (ox, oy, a0, a1) => { for (let i = 0; i <= 8; i++) { const a = lerp(a0, a1, i / 8) * Math.PI / 180; P.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r]); } };
  P.push([cx, yb]); arc(xl + r, yb - r, 90, 180); arc(xl + r, yt + r, 180, 270); P.push([cx, yt]); arc(xr - r, yt + r, 270, 360); arc(xr - r, yb - r, 0, 90); P.push([cx, yb]);
  return P; })();
const RING_HALF = (() => { const i = RING.findIndex((p, k) => k > 3 && p[0] === 520 && p[1] === RING_T); return [RING.slice(0, i + 1), RING.slice(i)]; })();
function valve(open, x) {
  // 上下の かべから出た とびら。open 1：ひらく（右へたおれる）、0：しまる
  const a = lerp(0, 62, open), fl = `<rect x="-9" y="-4" width="18" height="62" rx="9" fill="${HB.redD}" stroke="#fff" stroke-width="3"/>`;
  return `<g transform="translate(${x} -56) rotate(${-a})">${fl}</g><g transform="translate(${x} 56) scale(1 -1) rotate(${-a})">${fl}</g>`;
}
SCENES.push({
  id: 'pump',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), c2 = cue(2);
    const p = t * 1.15, k = pulseOf(p);
    // 道
    const dpath = pts => 'M ' + pts.map(q => q.map(v => v.toFixed(1)).join(' ')).join(' L ');
    const ro = prog(t, c1 - 0.3, 0.5);
    out += `<g opacity="${ro}"><path d="${dpath(RING_HALF[0])}" fill="none" stroke="${HB.purL}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/><path d="${dpath(RING_HALF[1])}" fill="none" stroke="${HB.redL}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    if (ro > 0) {
      const flow = (Math.floor(p) + eo(clamp(frac(p) / 0.5))) / 9;
      for (let i = 0; i < 12; i++) { const u = frac(flow + i / 12), [x, y] = along(RING, u); out += drop(x, y, 17, u >= 0.5 ? 1 : 0, ro); }
    }
    // はい・からだ
    const lung = `<path d="M -14 -50 C -70 -70 -104 -10 -96 44 C -92 64 -30 60 -14 40 Z" fill="${HB.lung}" stroke="${HB.lungD}" stroke-width="6" stroke-linejoin="round"/>`;
    out += g(`<rect x="-150" y="-78" width="300" height="156" rx="40" fill="#fff" filter="url(#shadow)"/>` + lung + `<g transform="scale(-1 1)">${lung}</g><path d="M 0 -64 L 0 -20 M 0 -24 L -30 0 M 0 -24 L 30 0" fill="none" stroke="${HB.lungD}" stroke-width="10" stroke-linecap="round"/>`, { x: 520, y: 186, o: ro, s: 0.8 });
    out += g(text(0, 0, 'はい', { size: 44, w: 900, fill: '#b5586b' }), { x: 700, y: 150, o: ro });
    out += g(`<rect x="-170" y="-50" width="340" height="100" rx="50" fill="#fff" filter="url(#shadow)"/>` + text(0, 2, 'からだじゅう', { size: 46, w: 900 }), { x: 520, y: 772, o: ro });
    // しんぞう
    out += pop(heartG(k, { two: true }), t, 0.3, 520, 478, { s: 1.15 });
    // 血のなまえ
    out += g(text(0, -24, 'さんその', { size: 36, w: 900, fill: HB.pur }) + text(0, 24, 'へった ち', { size: 36, w: 900, fill: HB.pur }), { x: 200, y: 478, o: prog(t, at(1, 0.15), 0.4) });
    out += g(text(0, -24, 'さんその', { size: 36, w: 900, fill: HB.red }) + text(0, 24, 'おおい ち', { size: 36, w: 900, fill: HB.red }), { x: 842, y: 478, o: prog(t, at(1, 0.55), 0.4) });
    // みぎ：ポンプ → めぐり → ドックン
    const aO = win(t, cue(0) + 0.3, c1 - 0.2, 0.3);
    if (aO > 0) out += g(text(0, -60, 'しんぞうは', { size: 64, w: 900 }) + text(0, 40, 'ちを おくりだす ポンプ', { size: 72, w: 900, fill: HB.red }), { x: 1400, y: 470, o: aO, s: lerp(0.94, 1, eo(aO)) });
    const bO = win(t, c1 - 0.1, c2 - 0.2, 0.3);
    if (bO > 0) {
      const rows = [['からだから もどった ちを', 'はいへ おくる', HB.pur, 0.05], ['はいで', 'さんそを もらう', '#c79a00', 0.42], ['さんその おおい ちを', 'からだじゅうへ おくる', HB.red, 0.62]];
      let b = '';
      rows.forEach(([a1, a2, col, f], i) => {
        b += pop(`<rect x="-360" y="-74" width="720" height="148" rx="30" fill="#fff" filter="url(#shadow)"/><rect x="-360" y="-74" width="24" height="148" rx="12" fill="${col}"/><circle cx="-282" cy="0" r="34" fill="${col}"/>` + text(-282, 3, i + 1, { size: 44, w: 900, fill: '#fff' }) +
          text(-226, -28, a1, { size: 40, w: 900, anchor: 'start' }) + text(-226, 28, a2, { size: 40, w: 900, anchor: 'start', fill: col }), t, at(1, f), 1400, 290 + i * 180);
      });
      out += g(b, { o: bO });
    }
    const cO = prog(t, c2 - 0.1, 0.4);
    if (cO > 0) {
      // とびら（弁）：入口がしまる「ドッ」→ 出口がしまる「クン」
      const q = frac((t - c2) / 1.9), inOpen = q < 0.42 ? 1 : q < 0.47 ? 1 - (q - 0.42) / 0.05 : q > 0.95 ? (q - 0.95) / 0.05 : 0, outOpen = q > 0.52 && q < 0.86 ? 1 : q >= 0.86 && q < 0.91 ? 1 - (q - 0.86) / 0.05 : q > 0.47 && q <= 0.52 ? (q - 0.47) / 0.05 : 0;
      let c = card(760, 600) + text(0, -236, '「ドックン」の しょうたい', { size: 46, w: 900 });
      c += `<clipPath id="vc"><rect x="-330" y="-150" width="660" height="230" rx="30"/></clipPath><g clip-path="url(#vc)" transform="translate(0 -40)"><rect x="-340" y="-80" width="680" height="160" fill="${HB.redL}"/><rect x="-340" y="-58" width="680" height="116" fill="#fff6f3"/>`;
      // つぶ：入口がひらくと へやへ入り、出口がひらくと そとへ出る
      const k1 = eo(clamp(q / 0.42)), k2 = eo(clamp((q - 0.52) / 0.34)), XS = [-430, -230, 0, 230, 430];
      for (let gp = 0; gp < 4; gp++) for (let j = 0; j < 3; j++) {
        const kk = gp === 1 ? k1 : k2;
        c += drop(lerp(XS[gp], XS[gp + 1], kk) + [-42, 0, 42][j], [-24, 22, -6][j], 15, 1, 1);
      }
      c += valve(inOpen, -110) + valve(outOpen, 110) + `</g>`;
      c += text(-180, -150, 'いりぐちの とびら', { size: 28, w: 900, fill: HB.redD }) + text(180, -150, 'でぐちの とびら', { size: 28, w: 900, fill: HB.redD });
      const d1 = q >= 0.45 && q < 0.8 ? 1 - (q - 0.45) / 0.35 : 0, d2 = q >= 0.89 || q < 0.2 ? 1 - frac(q - 0.89) / 0.31 : 0;
      c += g(text(0, 0, 'ドッ', { size: 84, w: 900, fill: HB.red }), { x: -120, y: 130, o: 0.25 + 0.75 * clamp(d1 * 1.6), s: 1 + 0.2 * d1 });
      c += g(text(0, 0, 'クン', { size: 84, w: 900, fill: HB.red }), { x: 120, y: 130, o: 0.25 + 0.75 * clamp(d2 * 1.6), s: 1 + 0.2 * d2 });
      c += text(0, 232, 'とびら（べん）が パタンと しまる おと', { size: 36, w: 900 });
      out += g(c, { x: 1400, y: 490, o: cO, s: lerp(0.95, 1, eo(cO)) });
    }
    return out;
  },
});

// 4. 走る筋肉は、酸素を使って力を出す
const VES = [[360, 752], [560, 700], [800, 668], [960, 660], [1120, 668], [1360, 700], [1590, 760]];
SCENES.push({
  id: 'muscle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), c2 = cue(2);
    const fast = eio(prog(t, c2 + 0.2, 1.2));
    // はしる はやさ（つみかさね）
    const ph = rampBeats(t, c2 + 0.2, c2 + 1.4, 1.5, 2.6), c = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2);
    // 血管と 血のつぶ
    const vO = prog(t, cue(0) + 1.0, 0.5);
    const dp = 'M ' + VES.map(q => q.join(' ')).join(' L ');
    out += `<g opacity="${vO}"><path d="${dp}" fill="none" stroke="${HB.redL}" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/><path d="${dp}" fill="none" stroke="#fff6f3" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    const fl = rampBeats(t, c2 + 0.2, c2 + 1.4, 0.16, 0.3);
    if (vO > 0) for (let i = 0; i < 10; i++) {
      const u = frac(fl + i / 10), [x, y] = along(VES, u), give = clamp((u - 0.4) / 0.12);
      out += drop(x, y, 19, u < 0.46 ? 1 : 0, vO * Math.min(1, u * 10, (1 - u) * 10));
      // さんそが 筋肉へ わたる
      if (give > 0 && u < 0.78) { const g2 = clamp((u - 0.4) / 0.3), ox = x - 30 + (i % 3) * 30, oy = lerp(y - 10, 470, eo(g2)); out += `<circle cx="${ox}" cy="${oy}" r="12" fill="${HB.o2}" stroke="#fff" stroke-width="3" opacity="${vO * (1 - prog(g2, 0.8, 0.2))}"/>`; }
    }
    // 筋肉
    out += pop(muscleG(c), t, 0.3, 960, 430, { s: 1 });
    // 力の きらきら
    const sp = prog(t, cue(0) + 2.2, 0.4);
    if (sp > 0) for (let i = 0; i < 7; i++) {
      const f = frac(ph * 0.5 + i / 7), a = (i / 7) * Math.PI * 2 + 0.4, r = 150 + f * 150;
      out += g(`<path d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill="${C.yellow}"/>`, { x: 960 + Math.cos(a) * r * 1.9, y: 430 + Math.sin(a) * r * 0.75, o: sp * (1 - f), s: 0.7 + f * 0.8 });
    }
    out += pop(badge('あしの きんにく', { fill: HB.musD, size: 46 }), t, 0.5, 960, 240);
    out += g(text(0, 0, 'さんそを つかって ちからを だす', { size: 50, w: 900 }), { x: 960, y: 590, o: win(t, cue(0) + 1.6, c1 - 0.1, 0.3) });
    // なまえ
    const l1 = prog(t, c1 + 0.2, 0.4);
    out += g(`<circle cx="-150" cy="0" r="17" fill="${HB.o2}" stroke="#fff" stroke-width="3"/>` + text(-118, 2, 'さんそ', { size: 44, w: 900, anchor: 'start', fill: '#b98a00' }), { x: 640, y: 560, o: l1 });
    out += g(text(0, 0, 'さんそを はこぶのは「ち」', { size: 50, w: 900, fill: HB.red }), { x: 960, y: 800, o: l1 });
    // もっと！
    out += pop(`<path d="M -210 -70 L 210 -70 Q 250 -70 250 -30 L 250 30 Q 250 70 210 70 L -210 70 Q -250 70 -250 30 L -250 -30 Q -250 -70 -210 -70 Z" fill="${HB.o2}" stroke="#fff" stroke-width="8"/>` + text(0, 2, 'さんそ、もっと！', { size: 54, w: 900 }), t, at(2, 0.45), 1500, 300, { s: 1 + 0.04 * Math.sin(t * 9) });
    out += kidShow('S', t, 170, 800, { s: 0.56, start: 0.2, n: 0, bubble: false, pose: 'jump', eyes: 'smile', enter: 'pop' }).replace('<g opacity', `<g transform="translate(0 ${-Math.abs(Math.sin(ph * Math.PI)) * 26})" opacity`);
    return out;
  },
});

// 5. 心臓は「回数」と「1回の量」を両方ふやす → 血は4〜5倍
SCENES.push({
  id: 'twoways',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), c2 = cue(2);
    const cols = [{ x: 380, name: 'やすんで いる とき', col: C.blueUi, rate: 1.0, big: 0 }, { x: 1040, name: 'はしって いる とき', col: HB.red, rate: 2.2, big: 1 }];
    const grow = eio(prog(t, c1 + 0.3, 1.0));
    cols.forEach((cl, n) => {
      const p = t * cl.rate, k = pulseOf(p), amp = 1 + cl.big * grow * 0.9;
      let c = pop(badge(cl.name, { fill: cl.col, size: 44 }), t, 0.3 + n * 0.3, cl.x + 40, 200);
      c += pop(g(heartG(k * amp) + beatRing(k, 160), { s: 1.1 }), t, 0.5 + n * 0.3, cl.x - 60, 410);
      // うつ かいすう：すぎた時間ぶんの しるし
      const tk0 = cue(0) + 0.4, tO = prog(t, tk0, 0.4);
      if (tO > 0) {
        const W = 500, x0 = cl.x - 210, win2 = 4.2;
        c += g(text(0, 0, 'うつ かいすう', { size: 34, w: 900, fill: C.muted, anchor: 'start' }), { x: x0 + 6, y: 588, o: tO });
        c += `<g opacity="${tO}"><rect x="${x0}" y="614" width="${W}" height="68" rx="18" fill="#fff" filter="url(#shadow)"/>`;
        const b0 = Math.ceil((t - win2) * cl.rate);
        for (let b = Math.max(b0, Math.ceil(tk0 * cl.rate)); b <= Math.floor(p); b++) { const age = t - b / cl.rate, x = x0 + W - 26 - age / win2 * (W - 52); c += `<path d="M ${x} 666 L ${x} 630" stroke="${cl.col}" stroke-width="11" stroke-linecap="round" opacity="${1 - prog(age, win2 - 0.5, 0.5)}"/>`; }
        c += `</g>`;
      }
      // 1かいの りょう：コップに おちる 血
      const dO = prog(t, c1 + 0.2, 0.4);
      if (dO > 0) {
        const cx = cl.x + 200, r = lerp(17, cl.big ? 34 : 17, grow), f = frac(p), lv = 36 + (cl.big ? 96 * grow : 0);
        c += `<g opacity="${dO}"><path d="M ${cx - 60} 310 L ${cx - 50} 476 Q ${cx - 48} 494 ${cx - 28} 494 L ${cx + 28} 494 Q ${cx + 48} 494 ${cx + 50} 476 L ${cx + 60} 310" fill="#fff" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/>`;
        c += `<path d="M ${cx - 51} ${486 - lv} L ${cx - 49} 476 Q ${cx - 47} 487 ${cx - 28} 487 L ${cx + 28} 487 Q ${cx + 47} 487 ${cx + 49} 476 L ${cx + 51} ${486 - lv} Z" fill="${HB.red}" opacity="0.85"/>`;
        if (f < 0.5) { const q = f / 0.5; c += `<path d="M 0 ${-r * 1.5} C ${r * 0.9} ${-r * 0.2} ${r} ${r * 0.4} 0 ${r} C ${-r} ${r * 0.4} ${-r * 0.9} ${-r * 0.2} 0 ${-r * 1.5} Z" fill="${HB.red}" stroke="#fff" stroke-width="3" transform="translate(${lerp(cl.x + 70, cx, eo(q))} ${lerp(330, 400, q * q) - Math.sin(q * Math.PI) * 70})"/>`; }
        c += text(cx, 536, '1かいの りょう', { size: 32, w: 900, fill: C.muted }) + `</g>`;
      }
      out += c;
    });
    // おくりだす ち：4〜5ばい
    const bO = prog(t, c2 + 0.2, 0.4);
    if (bO > 0) {
      const gk = eo(prog(t, at(2, 0.35), 1.6)), U = 104;
      let b = text(170, 736, 'おくりだす ち', { size: 36, w: 900, anchor: 'start' });
      b += `<rect x="170" y="764" width="${U}" height="56" rx="14" fill="${C.blueUi}"/>` + text(170 + U + 20, 794, 'やすみ', { size: 32, w: 900, anchor: 'start', fill: C.blueUi });
      b += `<rect x="830" y="764" width="${U * lerp(1, 4.5, gk)}" height="56" rx="14" fill="${HB.red}"/>`;
      for (let i = 1; i <= 4; i++) if (lerp(1, 4.5, gk) > i + 0.05) b += `<line x1="${830 + U * i}" y1="768" x2="${830 + U * i}" y2="816" stroke="#fff" stroke-width="4"/>`;
      out += g(b, { o: bO });
      out += pop(text(0, 0, '4〜5ばい！', { size: 76, w: 900, fill: HB.red, extra: 'stroke="#fff" stroke-width="12" paint-order="stroke" stroke-linejoin="round"' }), t, at(2, 0.62), 1560, 792, { s: 1 + 0.03 * Math.sin(t * 8) });
    }
    // おねえちゃん（吹き出しは 頭の上に置く）
    out += kidShow('S', t, 1730, 700, { s: 0.6, start: cue(3) - 0.9, n: 0, bubble: false }) + talkBubble('S', 1600, 330, 1716, 700 - 452 * 0.6 - 10);
    return out;
  },
});

// 6. ふえた血は、走っている筋肉へ
SCENES.push({
  id: 'tomuscle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), c2 = cue(2);
    const k = eio(prog(t, cue(0) + 0.8, 1.6));
    const wUp = lerp(50, 20, k), wDn = lerp(50, 92, k);
    const UP = [[330, 480], [640, 480], [820, 400], [1000, 300], [1240, 290]], DN = [[330, 480], [640, 480], [820, 560], [1000, 650], [1240, 660]];
    const dp = pts => 'M ' + pts.map(q => q.join(' ')).join(' L ');
    const dO = 1 - 0.82 * prog(t, c2 - 0.3, 0.5);
    let dia = `<path d="${dp(UP)}" fill="none" stroke="${HB.redL}" stroke-width="${wUp + 16}" stroke-linecap="round" stroke-linejoin="round"/><path d="${dp(DN)}" fill="none" stroke="${HB.redL}" stroke-width="${wDn + 16}" stroke-linecap="round" stroke-linejoin="round"/>`;
    dia += `<path d="${dp(UP)}" fill="none" stroke="#fff6f3" stroke-width="${wUp}" stroke-linecap="round" stroke-linejoin="round"/><path d="${dp(DN)}" fill="none" stroke="#fff6f3" stroke-width="${wDn}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // 血のつぶ（ほとんどが 筋肉のほうへ）
    const N = 20, share = lerp(0.5, 0.85, k), p = t * 2.2;
    for (let i = 0; i < N; i++) {
      const u = frac(t * 0.3 + i / N), toM = rnd(i, 31) < share || k < 0.01 && i % 2, pts = toM ? DN : UP, [x, y] = along(pts, u);
      const off = (rnd(i, 32) - 0.5) * (u > 0.4 ? (toM ? wDn : wUp) - 30 : 14);
      dia += drop(x, y + Math.max(-40, Math.min(40, off)), 15, 1, Math.min(1, u * 10, (1 - u) * 10));
    }
    // しんぞう
    dia += pop(heartG(pulseOf(p)) + beatRing(pulseOf(p), 160), t, 0.2, 280, 480, { s: 1.0 });
    // いきさき
    const stomach = `<path d="M -40 -70 C -40 -20 -90 -10 -80 40 C -70 90 30 90 60 40 C 80 6 60 -30 30 -30 C 10 -30 10 -70 -10 -70 Z" fill="#f6c4a8" stroke="#d99a7c" stroke-width="7" stroke-linejoin="round"/>`;
    dia += pop(g(stomach, { s: 0.95 }), t, 0.4, 1390, 290) + g(text(0, 0, 'い・ちょう など', { size: 40, w: 900 }), { x: 1650, y: 270, o: prog(t, 0.6, 0.4) });
    out += g(dia, { o: dO });
    out += pop(g(muscleG(0.5 - 0.5 * Math.cos(t * 9)), { s: 0.42 }), t, 0.5, 1440, 660) + g(text(0, 0, 'はしって いる きんにく', { size: 40, w: 900, fill: HB.musD }), { x: 1470, y: 780, o: prog(t, 0.7, 0.4) });
    let lab = '';
    lab += pop(badge('ほとんどが きんにくへ', { fill: HB.red, size: 46 }), t, at(0, 0.5), 700, 770, { end: c2 - 0.2 });
    // ひろがる・せまくなる
    const l1 = win(t, at(1, 0.12), c2 - 0.2, 0.3);
    lab += pointer(1000, 500, 1010, 620, HB.red, l1 * (at(1, 0.12) < t ? 1 : 0)) + g(badge('けっかんが ひろがる', { fill: HB.red, size: 36 }), { x: 1000, y: 490, o: l1 });
    const l2 = win(t, at(1, 0.5), c2 - 0.2, 0.3);
    lab += pointer(900, 210, 950, 322, C.blueUi, l2) + g(badge('けっかんが せまく なる', { fill: C.blueUi, size: 36 }), { x: 900, y: 200, o: l2 });
    out += g(lab, { o: 1 - prog(t, c2 - 0.3, 0.3) });
    // さんそを たくさん 受け取る
    const cO = prog(t, c2 + 0.1, 0.4);
    if (cO > 0) {
      let c = card(860, 400) + text(0, -150, 'きんにくが うけとる さんそ', { size: 42, w: 900 });
      const rowD = (y, name, n, half, st) => {
        let r = text(-390, y, name, { size: 34, w: 900, anchor: 'start', fill: C.muted });
        for (let i = 0; i < 10; i++) {
          const on = prog(t, st + i * 0.12, 0.25) * (i < n ? 1 : i === n && half ? 0.5 : 0);
          r += `<circle cx="${-350 + i * 76}" cy="${y + 62}" r="27" fill="${mix('#f4ecd0', HB.o2, on)}" stroke="${on > 0.3 ? '#c79a00' : '#e0d5b3'}" stroke-width="5"/>`;
        }
        return r;
      };
      c += rowD(-84, 'やすんで いる とき', 3, false, c2 + 0.8) + rowD(54, 'はげしく うごく とき', 7, true, at(2, 0.5));
      out += g(c, { x: 700, y: 420, o: cO, s: lerp(0.95, 1, eo(cO)) });
    }
    return out;
  },
});

// 7. 心臓のアクセルとブレーキ。脳は走り出す前から準備
const pedalG = (press, col) => `<path d="M -110 112 L 130 112" stroke="${C.muted}" stroke-width="10" stroke-linecap="round"/>
  <g transform="translate(-60 104) rotate(${lerp(-54, -16, press)})"><rect x="-12" y="-16" width="190" height="32" rx="16" fill="${col}" stroke="#fff" stroke-width="5"/>${[0, 1, 2, 3].map(i => `<line x1="${30 + i * 38}" y1="-10" x2="${30 + i * 38}" y2="10" stroke="#fff" stroke-width="6" opacity="0.7"/>`).join('')}</g>
  <g opacity="${clamp(press * 1.4)}"><path d="M 60 ${-150 + press * 46} l 0 62 m -24 -26 l 24 26 l 24 -26" fill="none" stroke="${col}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const bezPts = (p0, p1, p2, p3, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [0, 1].map(j => v * v * v * p0[j] + 3 * v * v * u * p1[j] + 3 * v * u * u * p2[j] + u * u * u * p3[j]); });
const NV_A = bezPts([900, 322], [640, 330], [640, 560], [850, 580]), NV_B = bezPts([1020, 322], [1280, 330], [1280, 560], [1070, 580]);
SCENES.push({
  id: 'accel',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), cP = cue(2), c2 = cue(3), c3 = cue(4);
    const tA = c2 + 0.6, p = rampBeats(t, tA, tA + 2.2, 1.1, 2.4), k = pulseOf(p), sp = eio(prog(t, tA, 2.2));
    const bO = prog(t, c1 - 0.1, 0.5);
    // 神経（しんぞうの うしろ）
    if (bO > 0) {
      const dp = pts => 'M ' + pts.map(q => q.map(v => v.toFixed(1)).join(' ')).join(' L ');
      const on1 = prog(t, at(1, 0.2), 0.4), on2 = prog(t, at(1, 0.55), 0.4);
      out += `<path d="${dp(NV_A)}" fill="none" stroke="${HB.acc}" stroke-width="${lerp(9, 18, sp)}" stroke-linecap="round" stroke-linejoin="round" opacity="${on1}"/><path d="${dp(NV_B)}" fill="none" stroke="${HB.brk}" stroke-width="${lerp(18, 9, sp)}" stroke-linecap="round" stroke-linejoin="round" opacity="${on2}"/>`;
      for (let i = 0; i < 3; i++) {
        const u = frac(t * 0.9 + i / 3);
        if (sp > 0.15) { const [x, y] = along(NV_A, u); out += `<circle cx="${x}" cy="${y}" r="13" fill="#fff3df" stroke="${HB.acc}" stroke-width="6" opacity="${on1 * sp}"/>`; }
        if (sp < 0.85) { const [x, y] = along(NV_B, u); out += `<circle cx="${x}" cy="${y}" r="13" fill="#e6f1fb" stroke="${HB.brk}" stroke-width="6" opacity="${on2 * (1 - sp)}"/>`; }
      }
    }
    // しんぞう
    out += pop(heartG(k) + beatRing(k, 160), t, 0.2, 960, 590, { s: 1.0 });
    // A：「はやくなれ」と思って 速くしているのではない
    const aO = win(t, cue(0) + 0.3, c1 - 0.3, 0.3);
    if (aO > 0) {
      let a = `<rect x="-330" y="-80" width="660" height="160" rx="80" fill="#fff" filter="url(#shadow)"/><circle cx="-150" cy="116" r="22" fill="#fff" filter="url(#shadow)"/><circle cx="-110" cy="160" r="13" fill="#fff" filter="url(#shadow)"/>` + text(0, 2, '「はやく なれ！」', { size: 64, w: 900 });
      a += g(cross(0, 0, 0.9), { x: 390, y: -10, o: prog(t, at(0, 0.62), 0.25), s: lerp(1.4, 1, eo(prog(t, at(0, 0.62), 0.3))) });
      out += g(a, { x: 1150, y: 290, o: aO });
      out += g(text(0, 0, 'じぶんで はやく して いるのでは ない', { size: 50, w: 900 }), { x: 960, y: 800, o: win(t, at(0, 0.62), c1 - 0.3, 0.3) });
    }
    if (bO > 0) {
      // 脳
      const gl = prog(t, c3 + 0.2, 0.4);
      let b = '';
      if (gl > 0) for (let i = 0; i < 2; i++) { const f = frac(t * 0.8 + i / 2); b += `<circle cx="960" cy="230" r="${130 + f * 110}" fill="none" stroke="${HB.stem}" stroke-width="8" opacity="${gl * (1 - f) * 0.7}"/>`; }
      b += g(brainG(), { x: 960, y: 300, s: 1.7 }) + g(text(0, 0, 'のう', { size: 40, w: 900, fill: '#b5586b' }), { x: 960, y: 110 });
      // なまえと ペダル
      b += pop(badge('はやく する しんけい', { fill: HB.acc, size: 40 }), t, at(1, 0.2), 400, 330) + pop(badge('おそく する しんけい', { fill: HB.brk, size: 40 }), t, at(1, 0.55), 1520, 330);
      b += pop(pedalG(sp, HB.acc) + text(10, 168, 'アクセル', { size: 46, w: 900, fill: '#c46a22' }), t, cP + 0.3, 400, 540);
      b += pop(pedalG(1 - 0.88 * sp, HB.brk) + text(10, 168, 'ブレーキ', { size: 46, w: 900, fill: '#2a6fb0' }), t, cP + 1.0, 1520, 540);
      b += g(badge('ふまれる', { fill: HB.acc, size: 34 }), { x: 410, y: 790, o: prog(t, tA + 1.2, 0.4) }) + g(badge('ゆるむ', { fill: HB.brk, size: 34 }), { x: 1530, y: 790, o: prog(t, tA + 0.4, 0.4) });
      // はやさの めもり
      const gO = prog(t, c2 - 0.1, 0.4), gx = lerp(-200, 200, lerp(0.14, 0.9, sp));
      b += g(`<rect x="-230" y="-13" width="460" height="26" rx="13" fill="#eadfca"/><rect x="-230" y="-13" width="${gx + 230}" height="26" rx="13" fill="${mix(HB.brk, HB.acc, sp)}"/><circle cx="${gx}" cy="0" r="22" fill="#fff" stroke="${mix(HB.brk, HB.acc, sp)}" stroke-width="8"/>` +
        text(-250, 2, 'ゆっくり', { size: 32, w: 900, anchor: 'end', fill: HB.brk }) + text(250, 2, 'はやい', { size: 32, w: 900, anchor: 'start', fill: '#c46a22' }), { x: 960, y: 790, o: gO });
      b += pop(badge('はしりだす まえから じゅんび', { fill: HB.stem, size: 42 }), t, c3 + 0.5, 1430, 190);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. 止まると、最初の1分ほどで ぐっとゆっくりに。子どもは大人より速い
const GX0 = 300, GY0 = 760, XS = 800, XM = 960, XE = 1320;
const hrY = x => x < 470 ? 690 : x < 560 ? lerp(690, 380, eio((x - 470) / 90)) : x < XS ? lerp(380, 340, (x - 560) / (XS - 560)) : x < XM ? lerp(340, 570, 1 - Math.pow(1 - (x - XS) / (XM - XS), 2.2)) : lerp(570, 655, 1 - Math.pow(1 - (x - XM) / (XE - XM), 1.6));
SCENES.push({
  id: 'recover',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), c3 = cue(3);
    const gO = 1 - prog(t, c3 - 0.5, 0.4);
    // いま どこまで かいたか
    const xr = t < at(0, 0.3) ? lerp(GX0, XS, eo(prog(t, 0.4, at(0, 0.3) - 0.4))) : t < c1 ? lerp(XS, XM, eio(prog(t, at(0, 0.35), cueE(0) - at(0, 0.35)))) : lerp(XM, XE, eo(prog(t, c1 + 0.2, cueE(1) - c1)));
    const yr = hrY(xr), rate = lerp(1.0, 2.5, clamp((690 - yr) / 350));
    if (gO > 0) {
      let a = `<rect x="470" y="250" width="${XS - 470}" height="${GY0 - 250}" fill="#fde7cf"/>` + text((470 + XS) / 2, 284, 'はしる', { size: 38, w: 900, fill: '#c46a22' });
      a += `<path d="M ${GX0} 230 L ${GX0} ${GY0} L ${XE + 40} ${GY0}" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
      a += text(GX0 - 20, 196, 'しんぞうの はやさ', { size: 34, w: 900, anchor: 'start', fill: C.muted }) + text(XE + 56, GY0, 'じかん', { size: 34, w: 900, anchor: 'start', fill: C.muted });
      a += `<line x1="${XS}" y1="250" x2="${XS}" y2="${GY0}" stroke="${C.ink}" stroke-width="5" stroke-dasharray="12 10" opacity="${prog(t, at(0, 0.2), 0.3)}"/>` + g(badge('とまる', { fill: C.ink, size: 34 }), { x: XS, y: 226, o: prog(t, at(0, 0.2), 0.3) });
      let d = '';
      for (let x = GX0; x <= xr; x += 8) d += `${d ? 'L' : 'M'} ${x} ${hrY(x).toFixed(1)} `;
      d += `L ${xr.toFixed(1)} ${yr.toFixed(1)}`;
      a += `<path d="${d}" fill="none" stroke="${HB.red}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
      // さいしょの1ぷん
      const m1 = prog(t, at(0, 0.5), 0.4);
      a += `<g opacity="${m1}"><path d="M ${XS} 724 L ${XS} 740 L ${XM} 740 L ${XM} 724" fill="none" stroke="${HB.brk}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>` + g(text(0, 0, '1ぷんほど', { size: 32, w: 900, fill: HB.brk }), { x: (XS + XM) / 2, y: 704, o: m1 });
      a += pointer(1030, 392, 890, 470, HB.brk, prog(t, at(0, 0.72), 0.3)) + pop(badge('ぐっと ゆっくりに', { fill: HB.brk, size: 42 }), t, at(0, 0.72), 1090, 380);
      a += pop(badge('そのあとは すこしずつ', { fill: C.accent, size: 38 }), t, at(1, 0.3), 1130, 812);
      const hk = pulseOf(rampBeats(t, 0, 0.01, rate, rate));
      a += g(heartG(hk), { x: xr, y: yr, s: 0.3 });
      out += g(a, { o: gO });
    }
    // 子どもと大人
    const cO = prog(t, c3 - 0.2, 0.5);
    if (cO > 0) {
      let c = pop(badge('やすんで いる とき', { fill: C.blueUi, size: 42 }), t, c3, 800, 210);
      [['こども', 2.0, 520, 'はやい', HB.red, 0.8], ['おとな', 1.2, 1080, 'ゆっくりめ', C.blueUi, 1.05]].forEach(([name, r, x, lab, col, sc], i) => {
        const kk = pulseOf(t * r);
        c += pop(card(440, 480) + text(0, -180, name, { size: 52, w: 900 }) + g(heartG(kk) + beatRing(kk, 160), { y: -10, s: 0.8 * sc }) + g(badge(lab, { fill: col, size: 40 }), { y: 180 }), t, c3 + 0.3 + i * 0.4, x, 530);
      });
      c += pop(text(0, 0, '＞', { size: 90, w: 900, fill: C.ochre }), t, c3 + 1.2, 800, 530);
      out += g(c, { o: cO });
    }
    out += kidShow('B', t, 1700, 900, { s: 0.64, start: 0.3, n: 0 });
    return out;
  },
});

// 9. 答え と みてみよう
const miniHeart = () => g(heartG(0), { s: 0.4, y: -4 });
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, OPTS[2][1], { size: 56, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['かいすうが ふえる', C.blueUi], ['1かいの りょうも ふえる', C.accent], ['ちは 4〜5ばい', HB.red], ['はしる きんにくへ', HB.musD]], t, 960, 660, { size: 36, gap: 30, start: 2.6, step: 0.8 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 200);
      const items = [
        [miniHeart(), 'はしる まえ：おとなと 10びょう「ドックン」を かぞえる', C.ink],
        [miniHeart(), 'すこし はしった あと、もう いちど かぞえて くらべる', C.ink],
        [warnIcon(), 'ひろくて くるまの こない ばしょで。むりに はしらない', C.red],
        [warnIcon(), 'くるしい・むねが いたい ときは、すぐ とまって おとなに', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(g(ic, { s: 0.9 }) + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 230, 345 + i * 132);
      });
      b += chamL(t, 1740, 800, { s: 0.74, start: cue(1) + 0.8, n: 0 });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 10. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「しんぞう」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    // 左に立つ子は動画ごとに変わる（END_SWAP）。動きも kidShow が動画ごとに選ぶ
    const [kL, kR] = END_SWAP ? ['B', 'S'] : ['S', 'B'];
    out += kidShow(kL, t, 150, 1060, { s: 0.52, start: 0.8, n: 0, bubble: false });
    out += kidShow(kR, t, 310, 1060, { s: 0.52, start: 1.0, n: 1, bubble: false });
    out += kidShow('K', t, 1660, 1040, { s: 0.7, start: 1.2, n: 2, bubble: false });
    // 左の子の吹き出しは頭の上、右の子の吹き出しは右どなり（しっぽは顔をさす）
    const headTop = w => 1060 - KID_HEAD[w][0] * 0.52, face = w => 1060 - KID_HEAD[w][2] * 0.52;
    out += talkBubble(kL, 185, headTop(kL) - 140, 165, headTop(kL) - 12) + talkBubble(kR, 575, face(kR), 372, face(kR));
    out += `<rect width="1920" height="1080" fill="#000" opacity="${prog(t, D - 1.0, 1.0)}"/>`;
    return out;
  },
});
// ---------- 描く ----------
const svg = document.getElementById('stage');
const capEl = document.querySelector('#cap span');
function sceneDur(i) { return window.TL ? TL.scenes[i].dur : 10; }
function show(i, t) {
  const sc = SCENES[i];
  const D = sceneDur(i);
  NOW = { i, t };
  const edge = i === 0 ? 1 - prog(t, D - 0.3, 0.3) : i === SCENES.length - 1 ? prog(t, 0, 0.3) : Math.min(prog(t, 0, 0.3), 1 - prog(t, D - 0.3, 0.3));
  svg.innerHTML = DEFS + sc.draw(t) + (edge < 1 ? `<rect width="1920" height="1080" fill="${C.paper}" opacity="${1 - edge}"/>` : '');
  const L = SL().find(l => l.who === 'N' && l.text && t >= l.start - 0.15 && t < l.end + 0.35);
  capEl.textContent = L ? L.text : '';
  capEl.className = sc.night ? 'night' : '';
  capEl.style.opacity = L ? String(win(t, L.start - 0.15, L.end + 0.35, 0.15)) : '0';
}
window.sceneDur = sceneDur;
window.SCENES = SCENES;
window.show = show;
window.TOTAL = SCENES.reduce((a, s, i) => a + sceneDur(i), 0);

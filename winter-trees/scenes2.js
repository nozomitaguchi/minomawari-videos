// ---------- 冬の木の道具 ----------
const TR = {
  trunk: '#8a6a4a', trunkDk: '#6b4f36', gk: '#f4c531', gkDk: '#c8930f', gkGreen: '#7fbf4d',
  ev: '#2f7a46', evDk: '#1f5c33', evLt: '#57a868', flower: '#d8344a', kusu: '#3f8f4a', kusuNew: '#b5dd6a', pine: '#2e6b4a',
  sky: '#e3f0f7', ground: '#e6dcc0', groundDk: '#cdbf9b', soil: '#a9825c', soilDk: '#8a6746', water: '#4f9fe0', coldDk: '#4f86c0', nut: '#ff9a3a', mat: '#b98a5a',
};
// 指し線つきのラベル
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` + g(badge(str, { fill: col, size }), { x: tx, y: ty }), { o });
};
// イチョウの葉（柄のつけ根が原点、葉は上）
const GK_PATH = 'M -3 0 L -3 -30 C -44 -34 -66 -70 -52 -100 Q -30 -116 -6 -98 L 0 -84 L 6 -98 Q 30 -116 52 -100 C 66 -70 44 -34 3 -30 L 3 0 Z';
const ginkgoLeaf = (x, y, s = 1, r = 0, col = TR.gk, o = 1) => o <= 0.01 ? '' :
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${clamp(o)}"><path d="${GK_PATH}" fill="${col}"/><path d="M 0 -30 L -34 -92 M 0 -30 L -16 -98 M 0 -30 L 16 -98 M 0 -30 L 34 -92" fill="none" stroke="${mix(col, '#000000', 0.16)}" stroke-width="2.5" stroke-linecap="round"/></g>`;
// ツバキの葉（つけ根が原点、葉は上）
const camelliaLeaf = (x, y, s = 1, r = 0, col = TR.ev, o = 1, gloss = 1) => o <= 0.01 ? '' :
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${clamp(o)}"><path d="M 0 0 C 42 -26 42 -92 0 -124 C -42 -92 -42 -26 0 0 Z" fill="${col}"/><path d="M 0 -4 L 0 -112" stroke="${mix(col, '#ffffff', 0.3)}" stroke-width="4" stroke-linecap="round"/>` +
  (gloss > 0 ? `<path d="M -20 -40 C -26 -64 -18 -90 -6 -104" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${0.45 * gloss}"/>` : '') + `</g>`;
// イチョウの木（足もとが原点）。leaf: 黄色い葉の量 0〜1、buds: 冬芽
const GK_BR = [[0, -200, -150, -330, 14], [-150, -330, -200, -430, 9], [-150, -330, -90, -420, 8], [0, -250, 150, -360, 14], [150, -360, 210, -450, 9], [150, -360, 110, -450, 8],
  [0, -330, -90, -470, 10], [0, -360, 80, -490, 10], [0, -440, 0, -540, 9], [-90, -470, -120, -540, 6], [80, -490, 110, -560, 6]];
const GK_TIP = [[-200, -430], [-90, -420], [210, -450], [110, -450], [0, -540], [-120, -540], [110, -560]];
const GK_CAN = [[0, -300, 130], [-130, -360, 112], [130, -372, 112], [0, -430, 150], [-64, -506, 100], [72, -516, 100]];
function ginkgoTree(x, y, s, t, { leaf = 0, buds = 0 } = {}) {
  let b = `<path d="M -28 0 L -17 -260 L -8 -444 L 8 -444 L 17 -260 L 28 0 Z" fill="${TR.trunk}"/><path d="M 6 0 L 6 -430 L 8 -444 L 17 -260 L 28 0 Z" fill="${TR.trunkDk}" opacity="0.35"/>`;
  GK_BR.forEach(([x1, y1, x2, y2, w]) => { b += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${TR.trunk}" stroke-width="${w}" stroke-linecap="round"/>`; });
  if (buds > 0) GK_TIP.forEach(([tx, ty]) => { b += `<ellipse cx="${tx}" cy="${ty - 4}" rx="${7 * buds}" ry="${11 * buds}" fill="#c9965c" stroke="${TR.trunkDk}" stroke-width="2"/>`; });
  if (leaf > 0.01) {
    let c = '';
    GK_CAN.forEach(([cx, cy, r]) => { c += `<circle cx="${cx}" cy="${cy}" r="${r * lerp(0.8, 1, leaf)}" fill="${TR.gk}"/>`; });
    for (let i = 0; i < 22; i++) { const [cx, cy, r] = GK_CAN[i % 6], a = rnd(i, 41) * 6.28, d = rnd(i, 42) * r * 0.75; c += ginkgoLeaf(cx + Math.cos(a) * d, cy + Math.sin(a) * d + 20, 0.42, (rnd(i, 43) - 0.5) * 120 + Math.sin(t * 1.5 + i) * 4, i % 3 ? '#ffd957' : '#e6b01e'); }
    b += `<g opacity="${clamp(leaf * 1.4)}">${c}</g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">${b}</g>`;
}
// 落ち葉の山
function leafPile(x, y, s, n = 14, col = [TR.gk, '#ffd957', '#e6b01e'], kind = 'g', o = 1) {
  if (o <= 0.01) return '';
  let b = `<ellipse cx="0" cy="0" rx="210" ry="26" fill="${col[0]}" opacity="0.9"/>`;
  for (let i = 0; i < n; i++) { const px = (rnd(i, 51) - 0.5) * 380, py = (rnd(i, 52) - 0.5) * 30 + 6, r = rnd(i, 53) * 360; b += kind === 'g' ? ginkgoLeaf(px, py, 0.4, r, col[i % col.length]) : camelliaLeaf(px, py, 0.34, r, col[i % col.length], 1, 0); }
  return g(b, { x, y, s, o });
}
// まるい緑の木（ツバキ・クスノキ）。flowers: 赤い花、fresh: 新しい葉（明るい緑）の量
const EV_CAN = [[0, -200, 130], [-122, -244, 118], [122, -244, 118], [0, -310, 168], [-72, -388, 108], [82, -388, 108]];
const EV_FL = [[-110, -260], [60, -220], [130, -300], [-30, -360], [-150, -190], [40, -420], [-70, -160]];
function roundTree(x, y, s, t, { col = TR.ev, lt = TR.evLt, flowers = 0, fresh = 0, shine = 0 } = {}) {
  let b = `<rect x="-15" y="-170" width="30" height="170" fill="${TR.trunk}"/><rect x="2" y="-170" width="13" height="170" fill="${TR.trunkDk}" opacity="0.35"/>`;
  EV_CAN.forEach(([cx, cy, r]) => { b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`; });
  for (let i = 0; i < 26; i++) { const [cx, cy, r] = EV_CAN[i % 6], a = rnd(i, 61) * 6.28, d = rnd(i, 62) * r * 0.78; b += camelliaLeaf(cx + Math.cos(a) * d, cy + Math.sin(a) * d + 22, 0.36, (rnd(i, 63) - 0.5) * 140, i % 2 ? lt : mix(col, '#000000', 0.12), 1, shine); }
  if (fresh > 0) for (let i = 0; i < 16; i++) { const [cx, cy, r] = EV_CAN[(i + 3) % 6], a = rnd(i, 71) * 6.28, d = rnd(i, 72) * r * 0.8, k = clamp(fresh * 16 - i); if (k > 0) b += camelliaLeaf(cx + Math.cos(a) * d, cy + Math.sin(a) * d + 18, 0.34 * back(k), (rnd(i, 73) - 0.5) * 120, TR.kusuNew, 1, 0); }
  if (flowers > 0) EV_FL.forEach(([fx, fy], i) => {
    let f = ''; for (let k = 0; k < 5; k++) { const a = k * 1.2566 + i; f += `<circle cx="${Math.cos(a) * 15}" cy="${Math.sin(a) * 15}" r="17" fill="${k % 2 ? TR.flower : '#c22a40'}"/>`; }
    b += g(f + `<circle r="11" fill="${C.yellow}"/>`, { x: fx, y: fy, s: flowers * (1 + 0.04 * Math.sin(t * 2 + i)) });
  });
  return `<g transform="translate(${x} ${y}) scale(${s})">${b}</g>`;
}
// マツ
function pineTree(x, y, s, t) {
  let b = `<path d="M -10 0 C -34 -150 30 -250 4 -420" fill="none" stroke="${TR.trunk}" stroke-width="36" stroke-linecap="round"/><path d="M -6 -230 L -150 -300 M 12 -300 L 150 -380" fill="none" stroke="${TR.trunk}" stroke-width="16" stroke-linecap="round"/>`;
  [[-170, -320, 150, 56], [170, -400, 150, 56], [-20, -470, 190, 70], [40, -230, 120, 46]].forEach(([cx, cy, rx, ry], k) => {
    b += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${TR.pine}"/>`;
    for (let i = 0; i < 16; i++) { const px = cx + (i / 15 - 0.5) * rx * 1.8; b += `<line x1="${px}" y1="${cy - ry * 0.5}" x2="${px + (i % 2 ? 7 : -7)}" y2="${cy - ry * 1.18 - (i % 3) * 5}" stroke="${mix(TR.pine, '#7fbf7a', 0.45)}" stroke-width="4" stroke-linecap="round"/>`; }
  });
  return `<g transform="translate(${x} ${y}) scale(${s})">${b}</g>`;
}
// 冬の公園
function parkBg(gy = 760) {
  let o = `<rect width="1920" height="1080" fill="${TR.sky}"/>`;
  o += `<circle cx="1640" cy="170" r="70" fill="#fff8d8" opacity="0.9"/>` + cloud(300, 180, 0.9, '#fff', 0.8) + cloud(1180, 120, 0.6, '#fff', 0.7);
  o += `<path d="M 0 ${gy - 60} Q 480 ${gy - 150} 960 ${gy - 70} T 1920 ${gy - 90} L 1920 ${gy} L 0 ${gy} Z" fill="#cfe0d2"/>`;
  o += `<rect x="0" y="${gy - 6}" width="1920" height="${1080 - gy + 6}" fill="${TR.ground}"/><rect x="0" y="${gy - 6}" width="1920" height="10" fill="${TR.groundDk}"/>`;
  return o;
}
const groundBand = (y) => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${TR.ground}"/><rect x="0" y="${y}" width="1920" height="10" fill="${TR.groundDk}"/>`;
// しずく
const drop = (x, y, s = 1, o = 1, col = TR.water) => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -18 C 9 -4 13 2 13 8 A 13 13 0 0 1 -13 8 C -13 2 -9 -4 0 -18 Z" fill="${col}" opacity="${clamp(o)}"/>`;
// 栄養のつぶ
const nutBall = (x, y, r = 13, o = 1) => o <= 0.01 ? '' : `<g opacity="${clamp(o)}"><circle cx="${x}" cy="${y}" r="${r * 1.8}" fill="${TR.nut}" opacity="0.3" filter="url(#soft)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${TR.nut}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.32}" fill="#fff" opacity="0.7"/></g>`;
// 雪のしるし
const iceMark = (x, y, s, r = 0, o = 1, col = '#ffffff') => g(`<path d="M 0 -26 L 0 26 M -22 -13 L 22 13 M -22 13 L 22 -13" stroke="${col}" stroke-width="7" stroke-linecap="round"/>`, { x, y, s, o, r });
// きらっ
const sparkle = (x, y, s, o = 1, col = '#fff') => g(`<path d="M 0 -30 L 7 -7 L 30 0 L 7 7 L 0 30 L -7 7 L -30 0 L -7 -7 Z" fill="${col}"/>`, { x, y, s, o });
// ! の三角
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
// 落ちていく葉（k: 0〜1）。from → to、ゆれながら
function fallLeaf(kind, k, x0, y0, x1, y1, i, col, s = 0.42) {
  if (k <= 0) return '';
  const e = k < 1 ? k * k * 0.5 + k * 0.5 : 1, sway = Math.sin(k * 9 + i) * 34 * (1 - k);
  const x = lerp(x0, x1, e) + sway, y = lerp(y0, y1, e), r = (rnd(i, 81) - 0.5) * 80 + k * 300 * (i % 2 ? 1 : -1) * (k < 1 ? 1 : 1);
  return kind === 'g' ? ginkgoLeaf(x, y, s, r, col) : camelliaLeaf(x, y, s, r, col, 1, 0);
}

// 1. つかみ：イチョウは枝だけ、ツバキは緑のまま
SCENES.push({
  id: 'hook',
  draw(t) {
    const GY = 780;
    let out = parkBg(GY);
    const c0 = cue(0), c2 = cue(2), c3 = cue(3);
    out += leafPile(520, GY + 6, 1.0, 16);
    out += ginkgoTree(520, GY, 1.05, t, { leaf: 0 });
    // さいごの葉が ひらひら
    for (let i = 0; i < 3; i++) { const k = ((t * 0.16 + i * 0.37) % 1); out += fallLeaf('g', k, 420 + i * 110, 300 + i * 30, 380 + i * 130, GY, i, i % 2 ? '#ffd957' : TR.gk, 0.46); }
    out += roundTree(1340, GY, 1.05, t, { flowers: 1, shine: prog(t, c2 + 1.2, 0.6) });
    [[1250, 430], [1420, 380], [1330, 560]].forEach(([x, y], i) => { out += sparkle(x, y, 0.9 + 0.3 * Math.sin(t * 5 + i * 2), win(t, c2 + 1.4 + i * 0.3, c2 + 4.4, 0.3)); });
    out += pop(badge('イチョウ', { fill: TR.gkDk, size: 46 }), t, c0 + 2.0, 520, 110);
    out += pop(badge('えだだけ', { fill: C.muted, size: 38 }), t, c0 + 3.2, 190, 540, { end: c2 });
    out += pop(badge('ツバキ', { fill: TR.ev, size: 46 }), t, c2 + 1.0, 1340, 200);
    out += pop(badge('みどりの まま', { fill: TR.evDk, size: 36 }), t, c2 + 2.4, 1755, 430, { end: c3 });
    out += pop(badge('あかい はなも', { fill: TR.flower, size: 36 }), t, c2 + 5.0, 1755, 530, { end: c3 });
    out += kidShow('B', t, 990, 846, { s: 0.55, start: 0.3, n: 0, side: 'left' });
    out += g(text(0, 0, '？', { size: 160, w: 900, fill: C.ochre }), { x: 930, y: 330, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="108" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">ふゆ、<tspan fill="${TR.gkDk}">はっぱが ない き</tspan>と</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="108" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${TR.ev}">みどりの き</tspan>が あるのは なぜ？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(ginkgoLeaf(-130, 60, 1.3, -14) + camelliaLeaf(10, 64, 1.2, 12) + text(150, -6, '？', { size: 100, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'イチョウが はっぱを おとすのは、どうして？', { size: 62, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'はっぱが、さむくて こおって しまうから'], ['②', 'みずを すいにくいのに、はっぱから みずが でるから'], ['③', 'はっぱが おもくなって、えだが おれるから']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 41, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(ginkgoLeaf(-10, 70, 1.5, -10) + text(100, -60, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 340);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 葉っぱのしごと：栄養を作る工場／小さな穴から水が出ていく
const LF = { x: 600, y: 790, s: 4.6 };
const LFP = (lx, ly) => [LF.x + lx * LF.s, LF.y + ly * LF.s];
const HOLES = [[-34, -66], [-16, -86], [18, -72], [34, -92], [-42, -92]];
SCENES.push({
  id: 'leaf',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1);
    // お日さまと光
    const sO = prog(t, 0.3, 0.5) * (1 - 0.6 * prog(t, c1 - 0.3, 0.5));
    out += g(sunDisc(0, 0, 76, 0.1), { x: 210, y: 280, o: sO });
    for (let i = 0; i < 4; i++) out += `<line x1="${300 + i * 6}" y1="${300 + i * 34}" x2="${470 + i * 10}" y2="${360 + i * 50}" stroke="${C.yellow}" stroke-width="9" stroke-linecap="round" stroke-dasharray="26 22" stroke-dashoffset="${-t * 90}" opacity="${0.85 * sO}"/>`;
    // 葉っぱ
    out += `<line x1="${LF.x}" y1="${LF.y}" x2="${LF.x}" y2="900" stroke="${mix(TR.gkGreen, '#000000', 0.2)}" stroke-width="26" stroke-linecap="round"/>`;
    out += ginkgoLeaf(LF.x, LF.y, LF.s, 0, TR.gkGreen);
    // 栄養のつぶ：葉でできて、柄を通って木へ
    const nO = prog(t, c0 + 1.6, 0.5) * (1 - prog(t, c1 - 0.2, 0.4));
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.22 + i / 9) % 1, [sx, sy] = LFP((rnd(i, 3) - 0.5) * 80, -62 - rnd(i, 4) * 36);
      const k = clamp((ph - 0.35) / 0.65), [bx, by] = LFP(0, -28);
      const x = k < 0.6 ? lerp(sx, bx, eio(k / 0.6)) : bx, y = k < 0.6 ? lerp(sy, by, eio(k / 0.6)) : lerp(by, 900, (k - 0.6) / 0.4);
      out += g(nutBall(0, 0, 15), { x, y, s: Math.max(back(clamp(ph / 0.2)), 0.001), o: nO * Math.min(1, (1 - ph) * 5) });
    }
    out += pop(badge('えいようを つくる こうじょう', { fill: C.accent, size: 48 }), t, c0 + 1.2, 1330, 230, { end: c1 - 0.2 });
    const chO = win(t, c0 + 2.4, c1 - 0.2, 0.4);
    if (chO > 0) {
      let c = chipsRow([['ひかり', C.ochre], ['くうき', '#6a9fd8'], ['みず', TR.water]], t, 1330, 400, { start: c0 + 2.4, step: 0.5, size: 40, gap: 26 });
      c += pop(`<path d="M 0 -40 L 0 40 M -24 14 L 0 40 L 24 14" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, t, c0 + 4.0, 1330, 510);
      c += pop(g(nutBall(0, 0, 20), { x: -150 }) + badge('きの えいよう', { fill: TR.nut, size: 46 }), t, c0 + 4.4, 1350, 630);
      out += g(c, { o: chO });
    }
    // 水：根から上がってきて、小さな穴から空へ
    const wO = prog(t, c1 + 0.3, 0.5);
    if (wO > 0) {
      for (let i = 0; i < 5; i++) { const ph = (t * 0.45 + i / 5) % 1; out += drop(LF.x, lerp(900, LF.y - 130, ph), 1.0, wO * Math.min(1, (1 - ph) * 4) * Math.min(1, ph * 6)); }
      HOLES.forEach(([hx, hy], i) => {
        const [x, y] = LFP(hx, hy), hO = prog(t, c1 + 2.4 + i * 0.15, 0.3);
        out += `<ellipse cx="${x}" cy="${y}" rx="15" ry="9" fill="${mix(TR.gkGreen, '#000000', 0.42)}" opacity="${hO}"/>`;
        for (let j = 0; j < 2; j++) { const ph = (t * 0.4 + i * 0.23 + j * 0.5) % 1; out += drop(x + ph * 60 + Math.sin(t * 2 + i) * 6, y - 10 - ph * 190, 0.8 * (1 - ph * 0.4), hO * (1 - ph) * prog(t, c1 + 3.0, 0.4)); }
      });
      // 虫めがね：小さな穴から水が出ていく
      const mO = prog(t, c1 + 2.2, 0.5);
      if (mO > 0) {
        const MX = 1400, MY = 590, R = 200, [hx, hy] = LFP(34, -92);
        out += `<line x1="${hx}" y1="${hy}" x2="${MX - R + 14}" y2="${MY - 70}" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="14 10" opacity="${mO}"/>`;
        let m = `<rect x="${R * 0.62}" y="${R * 0.62}" width="46" height="170" rx="23" fill="${C.ochre}" transform="rotate(-45 ${R * 0.62} ${R * 0.62})"/><circle r="${R}" fill="${TR.gkGreen}"/><clipPath id="st"><circle r="${R - 8}"/></clipPath><g clip-path="url(#st)">`;
        m += `<path d="M 0 -96 C -78 -64 -78 64 0 96 C -30 42 -30 -42 0 -96 Z" fill="#4f9a3a"/><path d="M 0 -96 C 78 -64 78 64 0 96 C 30 42 30 -42 0 -96 Z" fill="#4f9a3a"/><path d="M 0 -90 C -24 -42 -24 42 0 90 C 24 42 24 -42 0 -90 Z" fill="#2c5a22"/>`;
        for (let j = 0; j < 3; j++) { const ph = (t * 0.45 + j / 3) % 1; m += drop(Math.sin(t * 2 + j * 2) * 8 + ph * 34, 30 - ph * 240, 1.7, (1 - ph) * Math.min(1, ph * 5)); }
        m += `</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="18"/>`;
        out += g(m, { x: MX, y: MY, o: mO, s: lerp(0.9, 1, eo(mO)) });
        out += pop(badge('ちいさな あな', { fill: TR.evDk, size: 44 }), t, c1 + 2.8, 1400, 335);
      }
      out += pop(badge('みずが そらへ でていく', { fill: TR.water, size: 48 }), t, c1 + 3.8, 1130, 190);
      out += pop(`<path d="M 0 40 L 0 -40 M -24 -14 L 0 -40 L 24 -14" fill="none" stroke="${TR.water}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` + text(60, 6, 'ねから みず', { size: 38, w: 900, fill: TR.water, anchor: 'start' }), t, c1 + 0.8, 700, 740);
    }
    return out;
  },
});

// 4. 冬：土がこおって水を吸えないのに、葉から水は出ていく
const ROOTS = [[[0, 0], [-70, 60], [-150, 110], [-230, 190]], [[0, 0], [0, 90], [-20, 170], [-30, 230]], [[0, 0], [80, 60], [170, 110], [250, 180]]];
SCENES.push({
  id: 'winter',
  draw(t) {
    const GY = 600, TX = 700;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const fz = eio(prog(t, c0 + 1.6, 2.2));                 // 土がこおる
    const fall = eio(prog(t, c2 + 1.2, 3.2));               // 葉を落とす
    let out = `<rect width="1920" height="1080" fill="${mix('#e9f3f8', '#dbe8f1', fz)}"/>` + topBadge();
    out += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${mix(TR.soil, '#c4d9e8', fz)}"/><rect x="0" y="${GY}" width="1920" height="12" fill="${mix(TR.soilDk, '#9fbdd2', fz)}"/>`;
    for (let i = 0; i < 12; i++) out += iceMark(120 + i * 152 + (i % 2) * 40, 640 + (i * 67) % 190, 0.7 + (i % 3) * 0.2, i * 20, fz * 0.9);
    // 根
    ROOTS.forEach((p, ri) => {
      out += `<path d="M ${p.map(([x, y]) => `${TX + x} ${GY + y}`).join(' L ')}" fill="none" stroke="${TR.trunkDk}" stroke-width="${18 - ri * 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
      const [ex, ey] = p[3];
      // 根が吸う水（こおる前だけ）
      for (let j = 0; j < 3; j++) {
        const ph = (t * 0.4 + j / 3 + ri * 0.2) % 1, seg = Math.min(2, Math.floor((1 - ph) * 3)), f = (1 - ph) * 3 - seg;
        const [ax, ay] = p[seg], [bx, by] = p[seg + 1];
        out += drop(TX + lerp(ax, bx, f), GY + lerp(ay, by, f), 0.8, (1 - fz) * 0.95);
      }
      out += g(cross(0, 0, 0.42, C.red), { x: TX + ex, y: GY + ey, o: prog(t, c0 + 4.0 + ri * 0.25, 0.3), s: lerp(1.5, 1, eo(prog(t, c0 + 4.0 + ri * 0.25, 0.3))) });
    });
    // 木
    const TS = 0.8;
    out += ginkgoTree(TX, GY + 6, TS, t, { leaf: 1 - fall, buds: prog(t, c2 + 4.0, 0.6) });
    for (let i = 0; i < 16; i++) {
      const [cx, cy, r] = GK_CAN[i % 6], k = prog(t, c2 + 1.2 + rnd(i, 7) * 1.8, 1.6);
      out += fallLeaf('g', k, TX + (cx + (rnd(i, 8) - 0.5) * r) * TS, GY + cy * TS, TX + (rnd(i, 9) - 0.5) * 520, GY + 2 + rnd(i, 10) * 10, i, i % 2 ? '#ffd957' : TR.gk, 0.4);
    }
    // 葉から出ていく水
    const wO = prog(t, c1 + 0.2, 0.5) * (1 - fall);
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.4 + i * 0.37) % 1, [cx, cy, r] = GK_CAN[i % 6];
      out += drop(TX + (cx + (rnd(i, 5) - 0.5) * r * 1.4) * TS + ph * 40, GY + (cy - r * 0.6) * TS - ph * 150, 0.9, wO * (1 - ph) * Math.min(1, ph * 5));
    }
    // ラベル
    out += pop(badge('つちが こおる', { fill: TR.coldDk, size: 46 }), t, c0 + 2.2, 1320, 690, { end: c2 + 0.2 });
    out += pop(badge('ねが みずを すえない', { fill: C.red, size: 46 }), t, c0 + 4.4, 1320, 790, { end: c2 + 0.2 });
    out += pop(badge('はっぱから みずが でていく', { fill: TR.water, size: 46 }), t, c1 + 0.8, 1330, 110, { end: c2 + 0.2 });
    // 木の中の水（へっていく）
    const gO = prog(t, c1 + 1.6, 0.5);
    if (gO > 0) {
      const lv = lerp(0.82, 0.28, eio(prog(t, c1 + 2.2, c2 + 1.6 - (c1 + 2.2))));
      const low = prog(lv, 0.42, -0.05);
      let m = card(320, 340) + text(0, -122, 'きの なかの みず', { size: 34, w: 900, fill: TR.water });
      m += `<rect x="-60" y="-80" width="120" height="220" rx="22" fill="#fff" stroke="${C.ink}" stroke-width="8"/><rect x="-50" y="${130 - 200 * lv}" width="100" height="${200 * lv}" rx="14" fill="${mix(TR.water, '#e8a04a', clamp(low))}"/>`;
      m += g(g(warnIcon, { s: 0.7 }), { x: 118, y: 100, o: prog(t, c2 - 0.6, 0.3) * (1 - prog(t, c2 + 4.6, 0.4)) });
      out += g(m, { x: 1330, y: 350, o: gO, s: lerp(0.94, 1, eo(gO)) });
    }
    out += pop(badge('はっぱを おとして ふゆを こす', { fill: C.accent, size: 46 }), t, c2 + 3.2, 1330, 110);
    out += kidShow('K', t, 1760, GY + 4, { s: 0.52, start: cue(3) - 0.9, n: 0, enter: 'slideR', act: 'nod', bubble: false });
    out += talkBubble('K', 1700, GY - 250, 1706, GY - 104, 40);
    return out;
  },
});

// 5. 落とす前に、栄養を枝や幹にもどす／黄色くなるわけ
SCENES.push({
  id: 'recycle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const yel = eio(prog(t, c2 + 0.8, 4.2));
    const store = prog(t, c1 + 1.6, 4.0);
    const BX = 1300, BY = 300, LS = 4.0;
    // 枝
    out += `<path d="M -40 250 L ${BX + 60} ${BY - 20}" fill="none" stroke="${TR.trunk}" stroke-width="84" stroke-linecap="round"/><path d="M -40 268 L ${BX + 60} ${BY - 2}" fill="none" stroke="${TR.trunkDk}" stroke-width="20" stroke-linecap="round" opacity="0.3"/>`;
    out += `<path d="M 40 248 L ${BX - 40} ${BY - 24}" fill="none" stroke="${TR.nut}" stroke-width="22" stroke-linecap="round" opacity="${0.75 * store}" stroke-dasharray="${1200 * store} 2000" stroke-dashoffset="${-1200 * (1 - store)}"/>`;
    out += `<ellipse cx="${BX + 50}" cy="${BY - 60}" rx="14" ry="22" fill="#c9965c" stroke="${TR.trunkDk}" stroke-width="3"/>`;
    // 葉（下向きにぶら下がる）。さいごに はらりと落ちる
    const dropK = prog(t, cueE(2) + 0.3, 1.2), LX = BX, LY = BY + 30;
    const col = mix(TR.gkGreen, TR.gk, yel);
    out += ginkgoLeaf(LX + Math.sin(dropK * 5) * 40 * dropK, LY + dropK * dropK * 620, LS, 180 + Math.sin(t * 1.3) * 3 + dropK * 50, col, 1 - prog(dropK, 0.75, 0.25));
    const LP = (lx, ly) => [LX - lx * LS, LY - ly * LS];
    // 栄養が葉から枝へ
    const nO = prog(t, c1 + 0.5, 0.4) * (1 - prog(t, c2 + 0.4, 0.6));
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.2 + i / 9) % 1, [sx, sy] = LP((rnd(i, 13) - 0.5) * 80, -64 - rnd(i, 14) * 34), [mx, my] = LP(0, -4);
      let x, y;
      if (ph < 0.5) { const k = eio(ph / 0.5); x = lerp(sx, mx, k); y = lerp(sy, my, k); } else { const k = (ph - 0.5) / 0.5; x = lerp(mx, 300, k); y = lerp(BY - 20, 254, k); }
      out += nutBall(x, y, 14, nO * Math.min(1, ph * 8) * Math.min(1, (1 - ph) * 5));
    }
    out += pop(badge('ただ すてるのでは ない', { fill: C.ochre, size: 50 }), t, c0 + 0.8, 490, 520, { end: c1 - 0.1 });
    out += pop(badge('えいようを えだや みきに もどす', { fill: TR.nut, size: 44 }), t, c1 + 1.2, 480, 520, { end: c2 - 0.1 });
    out += callout(420, 262, 300, 400, 'えだ', prog(t, c1 + 0.4, 0.4) * (1 - prog(t, c2 - 0.1, 0.3)), { col: TR.trunkDk, size: 40 });
    // 黄色くなるわけ
    const yO = prog(t, c2 + 0.2, 0.4);
    if (yO > 0) {
      let m = card(900, 330);
      m += `<circle cx="-330" cy="-30" r="70" fill="${TR.gk}"/><circle cx="-330" cy="-30" r="70" fill="${TR.gkGreen}" opacity="${1 - yel}"/>` + text(-330, 86, 'はっぱの いろ', { size: 32, w: 900, fill: C.muted });
      m += g(badge('みどりの いろが きえる', { fill: '#5e9a3e', size: 38 }), { x: 110, y: -70, o: prog(t, c2 + 1.2, 0.4) });
      m += g(badge('かくれていた きいろが みえる', { fill: TR.gkDk, size: 38 }), { x: 110, y: 40, o: prog(t, c2 + 4.6, 0.4) });
      out += g(m, { x: 500, y: 600, o: yO, s: lerp(0.95, 1, eo(yO)) });
    }
    return out;
  },
});

// 6. 緑のままの木：じょうぶな葉は材料が約2倍、でも長くはたらく
SCENES.push({
  id: 'evergreen',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), cB = cue(3), c3 = cue(4), c4 = cue(5), c5 = cue(6);
    const aO = 1 - prog(t, c2 - 0.5, 0.5);
    if (aO > 0) {
      let a = groundBand(800);
      a += roundTree(430, 806, 1.05, t, { flowers: 1, shine: 1 });
      a += pop(badge('ツバキ', { fill: TR.ev, size: 48 }), t, c0 + 0.5, 430, 210);
      a += g(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre }), { x: 800, y: 330, o: win(t, c0 + 0.8, c1, 0.3) });
      // 葉のアップ
      const lO = prog(t, c1 + 0.2, 0.5);
      if (lO > 0) {
        a += `<line x1="560" y1="520" x2="880" y2="540" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="14 10" opacity="${lO}"/>`;
        a += g(`<circle r="255" fill="#eef5ee" stroke="${C.blueUi}" stroke-width="16"/>` + camelliaLeaf(-26, 220, 3.5, 14, TR.ev, 1, 1), { x: 1130, y: 480, o: lO, s: lerp(0.9, 1, eo(lO)) });
        [[1070, 360], [1190, 490], [1060, 560]].forEach(([x, y], i) => { a += sparkle(x, y, 1.0 + 0.3 * Math.sin(t * 5 + i * 2), prog(t, c1 + 3.4 + i * 0.3, 0.3)); });
        a += pop(badge('かわの ように かたい', { fill: C.ochre, size: 40 }), t, c1 + 1.6, 1670, 380);
        a += pop(badge('つやつや', { fill: C.blueUi, size: 42 }), t, c1 + 3.4, 1670, 490);
        a += pop(badge('ふゆに そなえた じょうぶな はっぱ', { fill: TR.evDk, size: 44 }), t, c1 + 5.4, 1130, 130);
      }
      out += g(a, { o: aO });
    }
    // くらべる
    const bO = prog(t, c2 - 0.3, 0.5);
    if (bO > 0) {
      const XL = 600, XR = 1090;
      let b = card(1500, 700, { fill: '#fffdf6' });
      b = g(b, { x: 800, y: 465 });
      b += ginkgoLeaf(XL, 222, 0.9, -8) + text(XL, 270, 'おとす き', { size: 42, w: 900, fill: TR.gkDk });
      b += camelliaLeaf(XR, 226, 0.85, 8) + text(XR, 270, 'みどりの ままの き', { size: 42, w: 900, fill: TR.ev });
      b += `<line x1="80" y1="310" x2="1520" y2="310" stroke="${C.line}" stroke-width="4"/>`;
      // 材料
      const blk = (x, y, st) => pop(`<rect x="-42" y="-42" width="84" height="84" rx="16" fill="${TR.mat}"/><rect x="-42" y="-42" width="84" height="26" rx="13" fill="#d3a676"/>`, t, st, x, y);
      b += g(text(110, 400, 'ざいりょう', { size: 40, w: 900, anchor: 'start', fill: TR.trunkDk }), { o: prog(t, c2 + 0.6, 0.4) });
      b += blk(XL, 400, c2 + 1.6) + blk(XR - 52, 400, c2 + 3.0) + blk(XR + 52, 400, c2 + 4.0);
      b += pop(badge('やく 2ばい', { fill: TR.trunkDk, size: 42 }), t, cB + 1.8, 1392, 400);
      // はたらく長さ
      const rO = prog(t, c3 + 0.3, 0.4);
      if (rO > 0) {
        b += g(text(110, 550, 'はたらく ながさ', { size: 40, w: 900, anchor: 'start', fill: C.accent }), { o: rO });
        const wl = 170 * eo(prog(t, c3 + 0.6, 0.8)), wr = 420 * eo(prog(t, c3 + 1.2, 2.4));
        b += `<rect x="${XL - 85}" y="526" width="${wl}" height="48" rx="24" fill="${TR.gkGreen}"/>`;
        b += `<clipPath id="wr"><rect x="${XR - 210}" y="526" width="${wr}" height="48" rx="24"/></clipPath><g clip-path="url(#wr)"><rect x="${XR - 210}" y="526" width="420" height="48" fill="${TR.evLt}"/><rect x="${XR - 60}" y="526" width="90" height="48" fill="#cfe3d3"/></g>`;
        b += g(text(XR - 15, 604, 'ふゆは すこし おやすみ', { size: 30, w: 900, fill: TR.coldDk }), { o: prog(t, c3 + 2.2, 0.4) });
        b += g(text(XL, 604, 'はる〜あき', { size: 30, w: 900, fill: '#5e9a3e' }), { o: prog(t, c3 + 1.0, 0.4) });
      }
      // 作れる栄養
      const nO = prog(t, c4 + 0.8, 0.4);
      if (nO > 0) {
        b += g(text(110, 690, 'つくれる えいよう', { size: 40, w: 900, anchor: 'start', fill: TR.nut }), { o: nO });
        for (let i = 0; i < 3; i++) b += pop(nutBall(0, 0, 22), t, c4 + 1.2 + i * 0.15, XL - 56 + i * 56, 690);
        for (let i = 0; i < 6; i++) b += pop(nutBall(0, 0, 22), t, c4 + 1.8 + i * 0.15, XR - 130 + i * 52, 690);
        b += pop(badge('やく 2ばい', { fill: TR.nut, size: 42 }), t, c4 + 3.0, 1392, 690);
      }
      // もうけは ほとんど同じ
      b += pop(`<circle r="42" fill="${C.accent}"/>` + text(0, 0, '＝', { size: 54, w: 900, fill: '#fff' }), t, c5 + 0.5, (XL + XR) / 2 - 20, 222);
      b += pop(badge('もうけは ほとんど おなじ', { fill: C.accent, size: 44 }), t, c5 + 1.0, 800, 770, { end: c5 + 4.6 });
      b += pop(badge('おなじ もりに ならんで いきる', { fill: TR.evDk, size: 44 }), t, c5 + 4.8, 800, 770);
      out += g(b, { o: bO });
    }
    out += kidShow('S', t, 1770, 868, { s: 0.5, start: cue(7) - 0.9, n: 0, bubble: false });
    out += talkBubble('S', 1728, 540, 1750, 632, 36);
    return out;
  },
});

// 7. 緑のままの木も、葉っぱは入れかわる
SCENES.push({
  id: 'swap',
  draw(t) {
    const GY = 790;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + groundBand(GY) + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const KX = 520, PX = 1180;
    out += pop(badge('みどりの ままの きも、はっぱは いれかわる', { fill: C.accent, size: 46 }), t, c0 + 0.8, 1060, 110);
    const swO = win(t, c0 + 1.6, c1 + 2.2, 0.4);
    if (swO > 0) out += g(camelliaLeaf(-110, 70, 1.5, -16, '#3d7a45', 1, 0) + camelliaLeaf(120, 70, 1.5, 16, TR.kusuNew, 1, 0) + `<path d="M -60 -150 Q 0 -200 60 -150 M 36 -176 L 60 -150 L 28 -140" fill="none" stroke="${C.ochre}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M 60 110 Q 0 160 -60 110 M -36 136 L -60 110 L -28 100" fill="none" stroke="${C.ochre}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` + text(0, 230, 'ふるい はっぱ → あたらしい はっぱ', { size: 38, w: 900, fill: C.ochre }), { x: 1250, y: 450, o: swO });
    // クスノキ：春、新しい葉が出るころ、前の年の葉がいっせいに落ちる
    const fresh = prog(t, c1 + 2.0, 2.4), fallT = c1 + 5.2;
    const pile = prog(t, fallT + 1.6, 1.0);
    out += leafPile(KX, GY + 8, 1.0, 14, ['#3d7a45', '#5a8f4d', '#77603a'], 'c', pile);
    out += roundTree(KX, GY + 4, 1.0, t, { col: TR.kusu, lt: '#5aa860', fresh });
    for (let i = 0; i < 16; i++) {
      const [cx, cy, r] = EV_CAN[i % 6], k = prog(t, fallT + rnd(i, 17) * 0.5, 1.5);
      if (k < 1) out += fallLeaf('c', k, KX + cx + (rnd(i, 18) - 0.5) * r * 1.4, GY + cy, KX + (rnd(i, 19) - 0.5) * 420, GY + 6, i, i % 2 ? '#3d7a45' : '#5a8f4d', 0.36);
    }
    out += pop(badge('クスノキ', { fill: TR.kusu, size: 46 }), t, c1 + 0.3, KX, 240);
    out += pop(`<circle r="46" fill="#f3a9bd"/>` + text(0, 2, 'はる', { size: 36, w: 900, fill: '#fff' }), t, c1 + 1.0, KX - 240, 240);
    const cO = 1 - prog(t, c2 - 0.3, 0.4);
    out += callout(KX + 150, 420, 1010, 330, 'あたらしい はっぱ', prog(t, c1 + 2.6, 0.4) * cO, { col: '#7ea82f', size: 42 });
    out += callout(KX + 190, GY - 6, 1040, 660, 'まえの としの はっぱ', prog(t, fallT + 1.2, 0.4) * cO, { col: '#3d7a45', size: 42 });
    out += pop(badge('いっせいに おちる', { fill: C.ochre, size: 42 }), t, fallT + 2.2, 1040, 560, { end: c2 - 0.3 });
    // マツ：少しずつ落ちて、2〜10年
    const pO = prog(t, c2 - 0.1, 0.5);
    if (pO > 0) {
      let p = pineTree(PX, GY + 4, 1.0, t);
      for (let i = 0; i < 4; i++) {
        const ph = (t * 0.14 + i * 0.27) % 1, x = PX - 150 + i * 100 + Math.sin(ph * 8 + i) * 12, y = lerp(GY - 300, GY, ph);
        p += `<g transform="translate(${x} ${y}) rotate(${40 + ph * 200 + i * 30})" opacity="${Math.min(1, ph * 6) * Math.min(1, (1 - ph) * 6)}"><path d="M 0 0 L -5 -44 M 0 0 L 5 -44" stroke="#9a7438" stroke-width="4" stroke-linecap="round"/></g>`;
      }
      out += g(p, { o: pO });
      out += pop(badge('マツ', { fill: TR.pine, size: 46 }), t, c2 + 0.3, PX + 290, 250);
      out += pop(badge('すこしずつ おちる', { fill: C.ochre, size: 42 }), t, c2 + 2.0, 1660, 560);
      out += pop(badge('2〜10ねん', { fill: TR.pine, size: 50 }), t, c2 + 4.4, 1660, 680);
    }
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -590;
      let a = pop(card(1360, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.accent}"/>` + text(NX, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, 'みずを すいにくいのに、はっぱから みずが でるから', { size: 44, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['ふゆは みずを すいにくい', TR.coldDk], ['はっぱから みずが でる', TR.water], ['おとして ふゆを こす', C.accent]], t, 960, 600, { start: 2.6, step: 1.0, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const bud = `<line x1="-30" y1="24" x2="10" y2="-6" stroke="${TR.trunk}" stroke-width="12" stroke-linecap="round"/><ellipse cx="18" cy="-16" rx="11" ry="17" fill="#c9965c" stroke="${TR.trunkDk}" stroke-width="3" transform="rotate(40 18 -16)"/>`;
      const items = [
        [g(eyeIcon(0.3)), 'えだだけの きと みどりの きを、1ぽんずつ', C.ink, cue(1)],
        [bud, 'えだの さきに、はるに ひらく「め」は ある？', C.ink, cue(2)],
        [ginkgoLeaf(0, 26, 0.5, -10), 'きの したの おちばは、どっちが おおい？', C.ink, cue(2) + 4.2],
        [g(warnIcon, { s: 0.62 }), 'おちている みや はっぱは、くちに いれない', C.red, cue(3)],
        [camelliaLeaf(0, 30, 0.46, 10), 'はるに、みどりの きの したも もういちど', TR.evDk, cue(4)],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: 38, w: 900, anchor: 'start', fill: col }), t, st, 150, 310 + i * 112); });
      // 2本の木
      const mO = prog(t, cue(1) + 0.5, 0.5);
      if (mO > 0) {
        let m = `<rect x="1150" y="786" width="720" height="12" rx="6" fill="${TR.groundDk}"/>`;
        m += leafPile(1360, 790, 0.6, 12) + ginkgoTree(1360, 790, 0.78, t, { leaf: 0, buds: 1 }) + roundTree(1690, 790, 0.72, t, { flowers: 1 });
        b += g(m, { o: mO });
        b += callout(1360 + 210 * 0.78, 790 - 450 * 0.78, 1610, 290, 'め', prog(t, cue(2) + 1.6, 0.4), { col: '#a8733c', size: 44 });
      }
      b += kidShow('K', t, 1130, 800, { s: 0.42, start: cue(1) + 0.8, n: 1, enter: 'slideL', bubble: false });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 9. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「き」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    const [kL, kR] = END_SWAP ? ['B', 'S'] : ['S', 'B'];
    out += kidShow(kL, t, 150, 1060, { s: 0.52, start: 0.8, n: 0, bubble: false });
    out += kidShow(kR, t, 310, 1060, { s: 0.52, start: 1.0, n: 1, bubble: false });
    out += kidShow('K', t, 1660, 1040, { s: 0.7, start: 1.2, n: 2, bubble: false });
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

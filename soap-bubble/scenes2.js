// みのまわり図鑑「シャボン玉は、どうして 丸く なるの？」（もとの記事：everyday-trivia trivia/soap-bubble-round.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 色の約束（図鑑の絵とそろえる）：まく＝青みの線、せっけんのつぶ＝青いあたま＋オレンジのしっぽ、
//   ちぢむ力＝赤い矢印、空気がおし返す力＝緑の矢印、輪（モール）＝オレンジ
const SB = {
  film: '#6a98bd', filmDk: '#3f6f96', water: '#cde2e8', waterDk: '#a9cfe0', head: '#6a98bd', tail: '#e09d62',
  pull: '#c9634e', push: '#2e8a63', wand: '#e09d62', wandDk: '#b9743a', stick: '#b0835a',
  pink: '#e3aab2', violet: '#8f83bf', sky: '#bfe3f7', sky2: '#eef8fd', grass: '#a8d48f', grassDk: '#8cc274', air: '#9fc4dd',
};

// ---------- シャボン玉の道具 ----------
// まるいシャボン玉（rx, ry を書くと だ円）。うすい水色＋ふち＋にじ色のすじ＋光のつや
function bub(cx, cy, r, { o = 1, rx = null, ry = null, rot = 0, fo = 0.45 } = {}) {
  if (o <= 0.01 || r <= 0.5) return '';
  const a = rx ?? r, b = ry ?? r;
  return `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot}) scale(${(a / r).toFixed(3)} ${(b / r).toFixed(3)})" opacity="${o}">
    <circle r="${r}" fill="${SB.water}" fill-opacity="${fo}"/>
    <path d="M ${-r * 0.82} ${r * 0.25} A ${r * 0.86} ${r * 0.86} 0 0 0 ${r * 0.25} ${r * 0.82}" fill="none" stroke="${SB.pink}" stroke-width="${Math.max(3, r * 0.08)}" stroke-linecap="round" opacity="0.9"/>
    <path d="M ${-r * 0.7} ${r * 0.45} A ${r * 0.8} ${r * 0.8} 0 0 0 ${-r * 0.1} ${r * 0.78}" fill="none" stroke="${SB.violet}" stroke-width="${Math.max(2, r * 0.05)}" stroke-linecap="round" opacity="0.7"/>
    <circle r="${r}" fill="none" stroke="${SB.film}" stroke-width="${Math.max(4, r * 0.035)}"/>
    <path d="M ${-r * 0.55} ${-r * 0.35} A ${r * 0.65} ${r * 0.65} 0 0 1 ${-r * 0.1} ${-r * 0.62}" fill="none" stroke="#fff" stroke-width="${Math.max(4, r * 0.1)}" stroke-linecap="round"/></g>`;
}
// まん中からの長さ fn(角度) で決まる形（でこぼこ・星っぽい形 → まる）
function blobPath(cx, cy, fn, n = 96) {
  let d = '';
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = fn(a); d += `${i ? 'L' : 'M'} ${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} `; }
  return d + 'Z';
}
function blob(cx, cy, fn, { o = 1, sw = 6, fo = 0.45 } = {}) {
  if (o <= 0.01) return '';
  const r = fn(-2.2), hx = cx + Math.cos(-2.2) * r * 0.62, hy = cy + Math.sin(-2.2) * r * 0.62, hl = Math.max(14, r * 0.22);
  return `<g opacity="${o}"><path d="${blobPath(cx, cy, fn)}" fill="${SB.water}" fill-opacity="${fo}" stroke="${SB.film}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<path d="M ${(hx - hl).toFixed(1)} ${(hy + hl * 0.5).toFixed(1)} Q ${(hx - hl * 0.4).toFixed(1)} ${(hy - hl * 0.6).toFixed(1)} ${(hx + hl).toFixed(1)} ${(hy - hl * 0.7).toFixed(1)}" fill="none" stroke="#fff" stroke-width="${Math.max(5, r * 0.06)}" stroke-linecap="round"/></g>`;
}
// 星っぽい形（k=1）→ まる（k=0）。広さは変えない
const starFn = (R, k, rot = -Math.PI / 2) => a => R / Math.sqrt(1 + k * k * 0.045) * (1 + k * 0.3 * Math.cos(5 * (a - rot)));
// ほしの輪の頂点
const starPts = (x, y, r, n = 5, inner = 0.45) => Array.from({ length: n * 2 }, (_, i) => {
  const rr = i % 2 ? r * inner : r, a = Math.PI * i / n - Math.PI / 2;
  return `${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`;
}).join(' L ');
// 輪の形：'star' ほし / 'square' しかく / 'tri' さんかく / 'moon' みかづき / 'circle' まる
function ringPath(shape, x, y, r) {
  if (shape === 'star') return `M ${starPts(x, y, r)} Z`;
  if (shape === 'square') return `M ${x - r * 0.8} ${y - r * 0.8} h ${r * 1.6} v ${r * 1.6} h ${-r * 1.6} Z`;
  if (shape === 'tri') return `M ${x} ${y - r} L ${x + r * 0.87} ${y + r * 0.5} L ${x - r * 0.87} ${y + r * 0.5} Z`;
  if (shape === 'moon') return `M ${x + r * 0.35} ${y - r * 0.94} A ${r} ${r} 0 1 0 ${x + r * 0.35} ${y + r * 0.94} A ${r * 1.25} ${r * 1.25} 0 0 1 ${x + r * 0.35} ${y - r * 0.94} Z`;
  return `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`;
}
const ringBottom = (shape, r) => shape === 'star' ? r * 0.45 : shape === 'square' ? r * 0.8 : shape === 'tri' ? r * 0.5 : r;
// モールの輪と、持つところ。film：輪の中にはったまくの こさ 0〜1
function wand(shape, x, y, r, { film = 0, stick = 150, sw = 14 } = {}) {
  const by = y + ringBottom(shape, r), d = ringPath(shape, x, y, r);
  return `<line x1="${x}" y1="${by}" x2="${x}" y2="${by + stick}" stroke="${SB.stick}" stroke-width="${sw}" stroke-linecap="round"/>` +
    (film > 0 ? `<path d="${d}" fill="${SB.water}" fill-opacity="${0.75 * film}"/>` : '') +
    `<path d="${d}" fill="none" stroke="${SB.wand}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${SB.wandDk}" stroke-width="${sw * 0.28}" stroke-linejoin="round" stroke-dasharray="${sw * 0.5} ${sw * 0.9}" opacity="0.55"/>`;
}
// 矢印（k：0〜1 でのびる）
function arrow(x1, y1, x2, y2, col, w = 14, k = 1, o = 1) {
  if (k <= 0.02 || o <= 0.01) return '';
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = w * 2.4;
  const bx = ex - Math.cos(a) * hd, by = ey - Math.sin(a) * hd, nx = -Math.sin(a) * hd * 0.75, ny = Math.cos(a) * hd * 0.75;
  return `<g opacity="${o}"><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${ex.toFixed(1)} ${ey.toFixed(1)} L ${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)} L ${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)} Z" fill="${col}" stroke="${col}" stroke-width="${w * 0.3}" stroke-linejoin="round"/></g>`;
}
// 形のまわりの矢印。inward：外から まくへ（ちぢむ）／ そうでなければ 中から まくへ（おし返す）
function arrowsAround(cx, cy, fn, { n = 8, len = 60, col = SB.pull, inward = true, o = 1, w = 11, off = 0, pulse = 0 } = {}) {
  if (o <= 0.01) return '';
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + off, r = fn(a), c = Math.cos(a), s = Math.sin(a);
    const r1 = inward ? r + 26 + len - pulse : r - 34 - len + pulse, r2 = inward ? r + 26 - pulse : r - 34 + pulse;
    out += arrow(cx + c * r1, cy + s * r1, cx + c * r2, cy + s * r2, col, w, 1, o);
  }
  return out;
}
const olText = (x, y, str, { size = 44, fill = '#fff', ol = SB.filmDk, sw = 10, anchor = 'middle' } = {}) =>
  text(x, y, str, { size, w: 900, fill, anchor, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;
// はじける線
const burst = (x, y, r, col = SB.pull, o = 1, w = 9) => o <= 0.01 ? '' : `<g opacity="${o}" stroke="${col}" stroke-width="${w}" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map(dg => { const a = dg * Math.PI / 180; return `<line x1="${(x + r * 0.5 * Math.cos(a)).toFixed(1)}" y1="${(y + r * 0.5 * Math.sin(a)).toFixed(1)}" x2="${(x + r * Math.cos(a)).toFixed(1)}" y2="${(y + r * Math.sin(a)).toFixed(1)}"/>`; }).join('')}</g>`;
// 外の背景（空としばふ）
const outdoor = (id, t = 0) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SB.sky}"/><stop offset="1" stop-color="${SB.sky2}"/></linearGradient><rect width="1920" height="1080" fill="url(#${id})"/>` +
  cloud(1560 + Math.sin(t * 0.3) * 20, 200, 0.9, '#fff', 0.85) + cloud(250 + Math.sin(t * 0.25 + 1) * 20, 250, 0.6, '#fff', 0.8) +
  `<ellipse cx="960" cy="1200" rx="1500" ry="400" fill="${SB.grass}"/><ellipse cx="300" cy="1230" rx="900" ry="380" fill="${SB.grassDk}" opacity="0.5"/>`;
// 横から見た輪（だ円）から、右へのびる まく。len：のびた長さ、g：ふくらみぐあい 0〜1
function blownFilm(x, y, ry, len, gk, t) {
  const w = i => Math.sin(t * 4.3 + i * 1.9) * 16 * gk, tipY = y + Math.sin(t * 2.6) * 26 * gk;
  const d = `M ${x} ${y - ry} C ${x + len * 0.35} ${y - ry - 46 * gk + w(1)}, ${x + len * 0.92} ${y - ry * 1.3 * gk + w(2)}, ${x + len} ${tipY} C ${x + len * 0.92} ${y + ry * 1.3 * gk + w(3)}, ${x + len * 0.35} ${y + ry + 46 * gk + w(4)}, ${x} ${y + ry} Z`;
  return `<path d="${d}" fill="${SB.water}" fill-opacity="0.5" stroke="${SB.film}" stroke-width="6" stroke-linejoin="round"/>` +
    (len > 120 ? `<path d="M ${x + len * 0.3} ${y - ry * 0.75 + w(1) * 0.5} Q ${x + len * 0.5} ${y - ry * 1.0 * gk + w(2) * 0.5} ${x + len * 0.72} ${y - ry * 0.8 * gk + w(2) * 0.5}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="0.9"/>` : '');
}
// 横から見た輪（だ円）と持つところ
const sideRing = (x, y, rx, ry, hx, hy) => `<line x1="${hx}" y1="${hy}" x2="${x}" y2="${y + ry}" stroke="${SB.stick}" stroke-width="12" stroke-linecap="round"/>` +
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${SB.water}" fill-opacity="0.35" stroke="${SB.wand}" stroke-width="13"/>`;

// 1. つかみ：ふくと ぐにゃっと のびる。はなれると まんまる
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1;
    let out = outdoor('hkbg', t);
    // おねえちゃんが、輪を持ってふく
    const SX = 300, SY = 900, S = 0.9, RX = 470, RY = 590, RYR = 78;
    const td = c1 + d1 * 0.22;            // はなれる時刻
    const blowing = t > c0 + d0 * 0.1 && t < td;
    // 先にとんでいる小さなシャボン玉
    for (let i = 0; i < 7; i++) {
      const st = td + 1.0 + i * 0.55, k = t - st; if (k <= 0) continue;
      const x = 620 + rnd(i, 3) * 900 + Math.sin(t * 0.9 + i * 2) * 26, y = 640 - k * (26 + rnd(i, 4) * 22) - rnd(i, 5) * 200;
      out += bub(x, y, 26 + rnd(i, 6) * 30, { o: clamp(k * 2) * clamp((y - 120) / 120) });
    }
    if (t < td) {
      const gk = eo(prog(t, c0 + d0 * 0.12, d0 * 0.75)), len = 30 + 440 * gk;
      out += blownFilm(RX, RY, RYR, len, gk, t);
    } else {
      const tau = t - td, R = 135, e = 0.85 * Math.exp(-2.0 * tau) * Math.cos(7.5 * tau);
      const mv = eo(clamp(tau / 3.2)), cx = lerp(735, 1060, mv) + Math.sin(t * 0.8) * 14, cy = lerp(590, 370, mv) + Math.sin(t * 1.1) * 10;
      out += bub(cx, cy, R, { rx: R * (1 + e), ry: R / (1 + e) });
      out += burst(RX + 40, RY, 60 + tau * 120, '#fff', clamp(1 - tau * 3), 8);
    }
    out += kidShow('S', t, SX, SY, { s: S, start: -1, n: 0, pose: 'point', mouth: blowing ? 'o' : 'smile', eyes: t > td ? 'wide' : 'open', look: t > td ? [8, -6] : [6, 0], bubble: false });
    out += sideRing(RX, RY, 24, RYR, SX + 125.6 * S, SY - 281 * S + Math.sin(t * 2.2) * 3 * S);
    // ふく息
    if (blowing) for (let i = 0; i < 3; i++) { const f = ((t * 1.6 + i / 3) % 1); out += `<line x1="${372 + f * 60}" y1="${606 - 12 + i * 12}" x2="${372 + f * 60 + 22}" y2="${606 - 12 + i * 12}" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="${Math.sin(f * Math.PI) * 0.9}"/>`; }
    // ことば
    out += pop(olText(0, 0, 'ぐにゃ〜', { size: 70 }), t, c0 + d0 * 0.4, 780, 380, { end: td });
    out += pop(olText(0, 0, 'まんまる！', { size: 76, ol: SB.pull }), t, td + 0.9, 1060, 160, { end: cueE(3) + 0.7 });
    // おとうと
    out += kidShow('B', t, 1590, 900, { s: 0.62, start: cue(2) - 0.9, n: 1, look: [-7, -8] });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 240);
      out += g(`<text x="0" y="0" font-size="140" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${SB.filmDk}">シャボン玉</tspan>は、</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="132" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${SB.pull}">丸く</tspan> なるの？</text>`, { x: 960, y: 620, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      [[-330, 70], [-110, 96], [130, 80], [350, 60]].forEach(([dx, r], i) => { out += pop(bub(0, 0, r), t, t0 + 1.7 + i * 0.15, 960 + dx, 850 + Math.sin(t * 1.5 + i) * 8 - (r - 70) * 0.4); });
    }
    return out;
  },
});

// 2. 予想：ほしの輪でふくと、どんな玉が出る？
const GUESS_ICON = [
  // まるい玉
  () => bub(0, 0, 48),
  // ほしの形の玉
  () => `<path d="M ${starPts(0, 4, 58)} Z" fill="${SB.water}" fill-opacity="0.6" stroke="${SB.film}" stroke-width="5" stroke-linejoin="round"/><path d="M -22 -8 Q -14 -24 2 -30" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  // ほしと まるが まざった でこぼこの玉
  () => blob(0, 0, a => 46 * (1 + 0.16 * Math.cos(5 * (a + Math.PI / 2))), { sw: 5 }),
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(g(wand('star', 0, -14, 46, { film: 1, stick: 46, sw: 9 }), { x: -640 }) + text(60, 0, 'ほしの わで ふくと、どんな たまが でる？', { size: 56, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'まるい たま'], ['②', 'ほしの かたちの たま'], ['③', 'ほしと まるが まざった でこぼこの たま']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }) + g(GUESS_ICON[i](), { x: 510, y: 0, s: 0.92 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 360, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. まくのつくり：うすい石けん水のまく。両がわに石けんのつぶ。いつも ちぢもうとする
// せっけんのつぶ：あたま（水になじむ）が (x, y)、しっぽは ang（度）の向き
const mol = (x, y, ang, s = 1) => { const a = ang * Math.PI / 180, L = 44 * s; return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + L * Math.cos(a)).toFixed(1)}" y2="${(y + L * Math.sin(a)).toFixed(1)}" stroke="${SB.tail}" stroke-width="${8 * s}" stroke-linecap="round"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${13 * s}" fill="${SB.head}"/>`; };
function filmZoom(t, R) {
  // ルーペの中：上が外の空気、まん中がうすい水、下が中の空気
  let o = `<rect x="${-R}" y="${-R}" width="${2 * R}" height="${2 * R}" fill="#fffdf6"/><rect x="${-R}" y="-62" width="${2 * R}" height="124" fill="${SB.waterDk}"/><rect x="${-R}" y="62" width="${2 * R}" height="${R}" fill="#f1f8fb"/>`;
  for (let i = -7; i <= 7; i++) {
    const x = i * 42 + Math.sin(t * 1.3 + i) * 3;
    o += mol(x, -52, -90 + Math.sin(t * 2 + i * 1.7) * 7) + mol(x + 21, 52, 90 + Math.sin(t * 2.2 + i * 1.3) * 7);
  }
  return o;
}
SCENES.push({
  id: 'film',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    const mv = eio(prog(t, c1 - 0.7, 0.8));
    const BX = lerp(960, 520, mv), BY = lerp(480, 440, mv), pul = prog(t, c2, 0.4) * (0.5 + 0.5 * Math.sin((t - c2) * 3.4)), R = lerp(280, 215, mv) * (1 - 0.035 * pul);
    out += pop(bub(0, 0, R), t, 0.2, BX, BY);
    out += g(text(BX, BY + 10, 'くうき', { size: 60, w: 900, fill: '#8aa4b4' }), { o: prog(t, c0 + d0 * 0.22, 0.3) });
    // A：とてもうすい石けん水のまく
    const aO = 1 - prog(t, c1 - 0.8, 0.3);
    out += g(pop(badge('とても うすい せっけんすいの まく', { fill: SB.filmDk, size: 40 }), t, c0 + d0 * 0.5, 1515, 226) + pointer(1270, 258, 960 + 280 * Math.cos(-0.6) + 2, 480 + 280 * Math.sin(-0.6) + 2, SB.filmDk, prog(t, c0 + d0 * 0.5 + 0.2, 0.3)), { o: aO });
    // B：ルーペでまくに寄る
    const zk = prog(t, c1 - 0.2, 0.5) * (1 - prog(t, c2 - 0.6, 0.4));
    if (zk > 0) {
      const CX = 1290, CY = 470, ZR = 290, ex = BX + R * Math.cos(-0.25), ey = BY + R * Math.sin(-0.25);
      let z = `<circle cx="${ex}" cy="${ey}" r="26" fill="none" stroke="${C.blueUi}" stroke-width="7"/><line x1="${ex + 10}" y1="${ey - 24}" x2="${CX - 190}" y2="${CY - ZR + 70}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/><line x1="${ex + 10}" y1="${ey + 24}" x2="${CX - 190}" y2="${CY + ZR - 70}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/>`;
      z += `<clipPath id="fzc"><circle cx="0" cy="0" r="${ZR}"/></clipPath><g transform="translate(${CX} ${CY})"><g clip-path="url(#fzc)">${filmZoom(t, ZR)}</g><circle r="${ZR}" fill="none" stroke="${C.blueUi}" stroke-width="18"/><path d="M ${-ZR * 0.62} ${-ZR * 0.5} A ${ZR * 0.8} ${ZR * 0.8} 0 0 1 ${-ZR * 0.1} ${-ZR * 0.79}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.7"/></g>`;
      z += g(text(CX, CY - 186, 'そとの くうき', { size: 40, w: 900, fill: '#8a8778' }) + olText(CX, CY, 'うすい みず', { size: 44, ol: SB.filmDk }) + text(CX, CY + 190, 'なかの くうき', { size: 40, w: 900, fill: '#8aa4b4' }), { o: prog(t, c1 + 0.2, 0.3) });
      out += g(z, { o: zk });
      out += g(pop(badge('せっけんの つぶが、りょうがわに ずらり', { fill: SB.wandDk, size: 44 }), t, c1 + d1 * 0.4, CX - 60, 790), { o: zk });
    }
    // C：のびたゴムのように、いつも ちぢもうとする
    const cO = prog(t, c2 - 0.2, 0.5);
    if (cO > 0) {
      out += arrowsAround(BX, BY, () => R, { n: 8, len: 64, o: cO, pulse: pul * 22, off: Math.PI / 8 });
      out += pop(badge('いつも ちぢもうと する', { fill: SB.pull, size: 48, pad: 40 }), t, c2 + d2 * 0.55, 520, 786);
      // ゴム：のばすと、ちぢんで もどろうとする
      const st = 0.5 + 0.5 * Math.sin((t - c2) * 3.4), hw = lerp(150, 330, st), GX = 1330, GY = 430;
      let r = `<rect x="${GX - hw}" y="${GY - lerp(54, 30, st)}" width="${hw * 2}" height="${lerp(108, 60, st)}" rx="${lerp(54, 30, st)}" fill="none" stroke="#c98a4e" stroke-width="16"/>`;
      r += `<circle cx="${GX - hw + 6}" cy="${GY}" r="22" fill="${C.muted}"/><circle cx="${GX + hw - 6}" cy="${GY}" r="22" fill="${C.muted}"/>`;
      r += arrow(GX - hw + 60, GY - 110, GX - hw + 150, GY - 110, SB.pull, 11, 1, 0.4 + 0.6 * st) + arrow(GX + hw - 60, GY - 110, GX + hw - 150, GY - 110, SB.pull, 11, 1, 0.4 + 0.6 * st);
      out += g(r + text(GX, GY + 150, 'のびた ゴム', { size: 50, w: 900 }) + text(GX, GY + 216, 'ちぢんで もどろうと する', { size: 38, w: 700, fill: C.muted }), { o: prog(t, c2 + d2 * 0.2, 0.4) });
      out += g(text(925, 440, '＝', { size: 100, w: 900, fill: C.muted }), { o: prog(t, c2 + d2 * 0.3, 0.4) });
    }
    return out;
  },
});

// 4. 糸の実験：かたがわのまくをわると、糸がぴんとはる
SCENES.push({
  id: 'thread',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c4 = cue(4), d4 = cueE(4) - c4;
    let out = PAPER + topBadge();
    const CX = 960, CY = 450, R = 250, LX = CX - R * Math.cos(0.17), RX = CX + R * Math.cos(0.17), TY = CY + R * Math.sin(0.17);
    const tp = c1 + d1 * 0.6;                    // わる時刻
    const filmK = eo(prog(t, c0 + d0 * 0.55, 0.7));  // まくをはる
    const k = back(prog(t, tp + 0.12, 0.5));          // 糸がぴんとはる
    const sway = Math.sin(t * 1.7) * 10 * (1 - clamp(k));
    // 糸の形（ゆるい → ぴんと上へ引かれた弓なり）
    const P = (ax, ay, bx, by) => `${lerp(ax, bx, k).toFixed(1)} ${(lerp(ay, by, k) + (ay > TY ? sway : -sway * 0.3) * (1 - clamp(k))).toFixed(1)}`;
    const thr = `M ${LX.toFixed(1)} ${TY.toFixed(1)} C ${P(CX - 170, TY + 130, CX - 180, TY - 62)}, ${P(CX - 90, TY + 20, CX - 90, TY - 112)}, ${P(CX, TY + 104, CX, TY - 112)} C ${P(CX + 90, TY + 188, CX + 90, TY - 112)}, ${P(CX + 150, TY + 30, CX + 180, TY - 62)}, ${RX.toFixed(1)} ${TY.toFixed(1)}`;
    // 輪の持つところ
    out += `<line x1="${CX}" y1="${CY + R}" x2="${CX}" y2="${CY + R + 190}" stroke="${SB.stick}" stroke-width="18" stroke-linecap="round"/>`;
    // まく（まるい輪の中）
    out += `<clipPath id="thc"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath><g clip-path="url(#thc)">`;
    out += `<rect x="${CX - R}" y="${CY - R}" width="${2 * R}" height="${2 * R}" fill="${SB.water}" opacity="${0.8 * filmK}"/>`;
    out += `<path d="M ${CX - 190} ${CY - 60} Q ${CX - 150} ${CY - 170} ${CX - 30} ${CY - 200}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="${0.85 * filmK}"/>`;
    const popK = prog(t, tp, 0.12);
    if (popK > 0) out += `<path d="${thr} L ${CX + R + 20} ${CY + R + 20} L ${CX - R - 20} ${CY + R + 20} Z" fill="${C.paper}" opacity="${popK}"/>`;
    out += `</g>`;
    out += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${SB.wand}" stroke-width="18"/><circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${SB.wandDk}" stroke-width="5" stroke-dasharray="8 14" opacity="0.55"/>`;
    // 糸
    out += `<path d="${thr}" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/><path d="${thr}" fill="none" stroke="#d2553f" stroke-width="8" stroke-linecap="round"/>`;
    out += `<circle cx="${LX}" cy="${TY}" r="11" fill="#d2553f"/><circle cx="${RX}" cy="${TY}" r="11" fill="#d2553f"/>`;
    // 名前
    out += pop(badge('いと', { fill: '#d2553f', size: 46, pad: 40 }), t, c0 + d0 * 0.3, 1480, 620, { end: tp - 0.2 }) + pointer(1410, 620, CX + 150, TY + 50, '#d2553f', prog(t, c0 + d0 * 0.3 + 0.2, 0.3) * (1 - prog(t, tp - 0.5, 0.3)));
    out += pop(badge('せっけんすいの まく', { fill: SB.filmDk, size: 44 }), t, c0 + d0 * 0.6, 1520, 290, { end: tp - 0.2 }) + pointer(1290, 300, CX + 110, CY - 110, SB.filmDk, prog(t, c0 + d0 * 0.6 + 0.2, 0.3) * (1 - prog(t, tp - 0.5, 0.3)));
    // わる：ようじが下のまくをつつく
    const pk = eio(prog(t, c1 + d1 * 0.1, d1 * 0.5)), pr = 1 - prog(t, tp + 0.3, 0.4);
    if (pk > 0 && pr > 0) {
      const px = lerp(1420, CX + 40, pk), py = lerp(840, CY + 172, pk);
      out += g(`<line x1="${px}" y1="${py}" x2="${px + 210}" y2="${py + 150}" stroke="#c9a06a" stroke-width="12" stroke-linecap="round"/><path d="M ${px} ${py} l 26 8 l -12 14 Z" fill="#8a6a3a"/>`, { o: pr });
    }
    out += burst(CX + 30, CY + 165, 50 + prog(t, tp, 0.5) * 70, SB.pull, win(t, tp, tp + 0.7, 0.1));
    out += pop(olText(0, 0, 'ぱちん！', { size: 76, ol: SB.pull }), t, tp, 1400, 700, { end: c2 + 0.2, d: 0.3 });
    // のこったまくが、糸を引っぱる
    const ak = prog(t, tp + 0.5, 0.4);
    if (ak > 0) {
      const pl = 0.5 + 0.5 * Math.sin(t * 4);
      [-150, -75, 0, 75, 150].forEach(dx => { const yy = TY - 112 + (Math.abs(dx) > 100 ? 34 : Math.abs(dx) > 50 ? 8 : 0); out += arrow(CX + dx, yy - 24, CX + dx, yy - 100 - pl * 12, SB.pull, 11, 1, ak); });
      out += pop(olText(0, 0, 'ぴん！', { size: 76, ol: '#d2553f' }), t, tp + 0.5, 470, 300, { end: c4 - 0.3 });
      out += pop(badge('のこった まくが、いとを ひっぱる', { fill: SB.pull, size: 40 }), t, c2 + d2 * 0.35, 1530, 236, { end: c4 - 0.2 });
      out += pop(badge('まくは、ちぢもうと して ひっぱって いる', { fill: SB.pull, size: 46 }), t, c4 + d4 * 0.3, 960, 792);
    }
    // おねえちゃん
    out += kidShow('S', t, 240, 880, { s: 0.6, start: cue(3) - 0.9, n: 0, look: [8, -6] });
    return out;
  },
});

// 5. 輪からはなれると、空気をつつんだまま ちぢんで、まるい玉に
// でこぼこの長い形（k=1）→ まる（k=0）。広さ（中の空気の量）は変えない
const lumpFn = (R, k, ph = 0) => a => R / Math.sqrt(1 + k * k * 0.17) * (1 + k * (0.55 * Math.cos(2 * a) + 0.16 * Math.cos(3 * a + 0.6 + ph) + 0.08 * Math.cos(5 * a + 2 - ph)));
SCENES.push({
  id: 'shrink',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4;
    let out = PAPER + topBadge();
    const WX = 330, WY = 480, RYR = 112, td = c1 + d1 * 0.12;
    out += pop(badge('まくは いつも、いちばん ちいさく なりたい', { fill: SB.pull, size: 46 }), t, c0 + d0 * 0.3, 1000, 180, { end: c2 - 0.3 });
    const CX = 1010, CY = 490, R = 205;
    if (t < td) {
      // 輪にくっついて、ぐにゃっとのびている
      const gk = eo(prog(t, 0.3, c0 + d0 * 0.8)), len = 40 + 900 * gk;
      out += blownFilm(WX, WY, RYR, len, gk, t);
    } else {
      // はなれて口がとじる → ちぢむ → まる
      const k = 1 - 0.55 * eio(prog(t, c2 + d2 * 0.15, d2 * 0.9)) - 0.45 * eio(prog(t, c3 + d3 * 0.2, c4 + d4 * 0.25 - c3 - d3 * 0.2));
      const fn = lumpFn(R, k, Math.sin(t * 2.4) * 0.5 * k), bob = Math.sin(t * 1.2) * 8;
      out += blob(CX, CY + bob, fn);
      // 中の空気（つぶの数は変わらない）
      const airO = prog(t, c1 + d1 * 0.4, 0.4);
      for (let i = 0; i < 16; i++) {
        const a = rnd(i, 21) * Math.PI * 2 + Math.sin(t * 0.7 + i) * 0.25, rho = 0.4 + rnd(i, 22) * 0.4;
        out += `<circle cx="${(CX + Math.cos(a) * fn(a) * rho).toFixed(1)}" cy="${(CY + bob + Math.sin(a) * fn(a) * rho).toFixed(1)}" r="12" fill="${SB.air}" opacity="${0.85 * airO}"/>`;
      }
      out += g(text(CX, CY + bob + 6, 'くうき', { size: 54, w: 900, fill: SB.filmDk }), { o: airO });
      out += burst(WX + 60, WY, 50 + (t - td) * 140, SB.film, clamp(1 - (t - td) * 2.5), 8);
      out += pop(badge('くちが とじる', { fill: SB.filmDk, size: 42 }), t, td + 0.1, 540, 300, { end: c2 - 0.3 });
      out += pop(badge('なかの くうきの りょうは、もう かわらない', { fill: C.blueUi, size: 44 }), t, c1 + d1 * 0.5, 1000, 786, { end: c2 - 0.2 });
      // ちぢむ（赤い矢印）
      const pl = 0.5 + 0.5 * Math.sin(t * 4.2);
      const rO = prog(t, c2 + 0.1, 0.4) * (1 - prog(t, c4 + d4 * 0.3, 0.5));
      out += arrowsAround(CX, CY + bob, fn, { n: 8, len: 58, o: rO, pulse: pl * 16, off: 0.4 });
      out += pop(badge('まくが ちぢむ', { fill: SB.pull, size: 46, pad: 40 }), t, c2 + d2 * 0.3, 1560, 300, { end: c4 + d4 * 0.3 });
      // おし返す（緑の矢印）
      const gO = prog(t, c3 + d3 * 0.45, 0.4) * (1 - prog(t, c4 + d4 * 0.3, 0.5));
      out += arrowsAround(CX, CY + bob, fn, { n: 8, len: 46, col: SB.push, inward: false, o: gO, pulse: pl * 12, off: 0.4 + Math.PI / 8 });
      out += pop(badge('なかの くうきが おしかえす', { fill: SB.push, size: 44 }), t, c3 + d3 * 0.5, 1000, 786, { end: c4 + d4 * 0.3 });
      // まるい玉
      const fin = prog(t, c4 + d4 * 0.35, 0.4);
      if (fin > 0) {
        for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.3, sp = prog(t, c4 + d4 * 0.35, 0.9); if (sp < 1) out += `<circle cx="${CX + Math.cos(a) * (R + 40 + 120 * eo(sp))}" cy="${CY + Math.sin(a) * (R + 40 + 120 * eo(sp))}" r="${12 * (1 - sp)}" fill="${[C.yellow, SB.pink, SB.film][i % 3]}"/>`; }
        out += pop(badge('いちばん ちいさい かたち ＝ まるい たま', { fill: C.accent, size: 50, pad: 44 }), t, c4 + d4 * 0.4, 1000, 792);
      }
    }
    // 輪（横から見た形）
    out += g(sideRing(WX, WY, 30, RYR, WX - 20, WY + RYR + 190), { o: t < td ? 1 : lerp(1, 0.45, prog(t, td, 0.6)) });
    return out;
  },
});

// 6. 同じ量の空気をつつむなら、まるい玉がいちばん まくが少ない
// 同じ体積（4.18…）をつつむ表面積：円すい 16.09… ／ 立方体 15.59… ／ 球 12.56…（北海道大学 数学博物館）
const AREA = [16.09, 15.59, 12.56];
const airDots = (pts, t, seed) => pts.map(([x, y], i) => `<circle cx="${(x + Math.sin(t * 1.3 + i * 2 + seed) * 5).toFixed(1)}" cy="${(y + Math.cos(t * 1.1 + i * 1.7 + seed) * 5).toFixed(1)}" r="10" fill="${SB.air}" opacity="0.9"/>`).join('');
const DOTS9 = [[-36, -30], [0, -36], [36, -30], [-40, 4], [0, 0], [40, 4], [-34, 38], [0, 42], [34, 38]];
const SHAPE3 = [
  // とんがりぼうし（円すい）
  t => `<path d="M 0 -150 L 108 94 A 108 26 0 0 1 -108 94 Z" fill="${SB.water}" fill-opacity="0.5" stroke="${SB.film}" stroke-width="7" stroke-linejoin="round"/><path d="M -108 94 A 108 26 0 0 1 108 94" fill="none" stroke="${SB.film}" stroke-width="4" stroke-dasharray="10 9" opacity="0.7"/>` + airDots(DOTS9.map(([x, y]) => [x * (0.45 + (y + 40) / 160), y * 0.9 + 44]), t, 1),
  // さいころ（立方体）
  t => `<path d="M -92 -62 L -40 -108 L 112 -108 L 112 44 L 60 90 L -92 90 Z" fill="${SB.water}" fill-opacity="0.5" stroke="${SB.film}" stroke-width="7" stroke-linejoin="round"/><path d="M -92 -62 L 60 -62 L 60 90 M 60 -62 L 112 -108" fill="none" stroke="${SB.film}" stroke-width="6" stroke-linejoin="round"/>` + airDots(DOTS9.map(([x, y]) => [x * 1.25 - 16, y * 1.2 + 14]), t, 2),
  // まるい玉（球）
  t => bub(0, 0, 108) + airDots(DOTS9.map(([x, y]) => [x * 1.3, y * 1.25]), t, 3),
];
SCENES.push({
  id: 'area',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'おなじ りょうの くうきを つつむと…', { size: 58, w: 900 }), t, c0 + d0 * 0.15, 900, 158);
    const XS = [470, 900, 1330], NM = ['とんがりぼうし', 'さいころ', 'まるい たま'], BASE = 812, SC = 13.4;
    // 出る時刻：まず3つをうすく見せて、名前を読むときに1つずつはっきり
    const at = [c1 + d1 * 0.02, c1 + d1 * 0.36, c1 + d1 * 0.78];
    XS.forEach((x, i) => {
      out += pop(SHAPE3[i](t), t, c0 + d0 * 0.4 + i * 0.25, x, 384);
      out += pop(text(0, 0, NM[i], { size: 46, w: 900, fill: i === 2 ? SB.filmDk : C.ink }), t, at[i], x, 548);
      const hl = win(t, at[i], at[i] + 1.1, 0.2);
      if (hl > 0) out += g(`<circle r="150" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-dasharray="20 16"/>`, { x, y: 370, o: hl, r: t * 30 });
    });
    // まくの広さの棒
    const bk = prog(t, c2 - 0.2, 0.4);
    if (bk > 0) {
      out += g(text(210, 690, 'つつむ', { size: 40, w: 900, fill: C.muted }) + text(210, 742, 'まくの ひろさ', { size: 40, w: 900, fill: C.muted }), { o: bk });
      out += `<line x1="340" y1="${BASE}" x2="1460" y2="${BASE}" stroke="${C.line}" stroke-width="6" opacity="${bk}"/>`;
      XS.forEach((x, i) => {
        const h = AREA[i] * SC * eo(prog(t, c2 + 0.1 + i * 0.35, 0.8));
        out += `<rect x="${x - 80}" y="${BASE - h}" width="160" height="${h}" rx="14" fill="${i === 2 ? SB.pull : '#a9bccb'}" opacity="${bk}"/>`;
      });
      // 玉の高さの線
      const lk = eo(prog(t, c2 + d2 * 0.5, 0.7)), ly = BASE - AREA[2] * SC;
      out += `<line x1="${1410}" y1="${ly}" x2="${lerp(1410, 380, lk)}" y2="${ly}" stroke="${SB.pull}" stroke-width="5" stroke-dasharray="14 12" opacity="${prog(t, c2 + d2 * 0.5, 0.2)}"/>`;
      out += pop(badge('いちばん すくない！', { fill: SB.pull, size: 40 }), t, c2 + d2 * 0.6, 1660, 700);
    }
    return out;
  },
});

// 7. だから、ほしの輪でも まるい玉
// 輪から出て、はなれながら丸くなっていく玉。f：0（輪のところ）→ 1（とんでいった）
function leaving(shape, x0, y0, x1, y1, f, R, seed = 0) {
  if (f <= 0 || f >= 1) return '';
  const k = 1 - eo(clamp(f / 0.42)), x = lerp(x0, x1, eo(f)), y = lerp(y0, y1, f) + Math.sin(f * 9 + seed) * 12, r = R * lerp(0.55, 1, clamp(f / 0.3));
  const o = clamp(f * 8) * clamp((1 - f) * 5);
  if (shape === 'star' && k > 0.02) return blob(x, y, starFn(r, k), { o });
  if (k > 0.02) { const e = 0.35 * k * Math.cos(f * 30); return bub(x, y, r, { rx: r * (1 + e), ry: r / (1 + e), o }); }
  return bub(x, y, r, { o });
}
SCENES.push({
  id: 'star',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    // A：ほしの輪でふく → 出てくるのは まるい玉
    const aO = 1 - prog(t, c1 - 0.6, 0.4);
    if (aO > 0) {
      let a = wand('star', 430, 440, 200, { film: 0.9, stick: 250, sw: 18 });
      for (let i = 0; i < 4; i++) { const f = (t - 0.5 - i * 1.5) / 5.4; a += leaving('star', 430, 440, 1750, 330 + (i % 2) * 150, f, 130, i); }
      a += pop(badge('ほしの わ', { fill: SB.wandDk, size: 46, pad: 40 }), t, 0.4, 430, 190);
      a += pop(badge('でて くるのは、まるい たま', { fill: SB.filmDk, size: 50, pad: 44 }), t, c0 + d0 * 0.55, 1180, 790);
      out += g(a, { o: aO });
    }
    // B：しかく・さんかく・みかづき・ほし、どれでも まるい玉
    const bO = prog(t, c1 - 0.3, 0.5) * (1 - prog(t, c2 - 0.6, 0.4));
    if (bO > 0) {
      const W = [['square', 'しかく'], ['tri', 'さんかく'], ['moon', 'みかづき'], ['star', 'ほし']];
      let b = '';
      W.forEach(([sh, nm], i) => {
        const x = 330 + i * 420, st = c1 - 0.2 + i * 0.55;
        let w = wand(sh, 0, 0, 88, { film: 0.9, stick: 84, sw: 13 }) + text(0, 222, nm, { size: 40, w: 900 });
        b += pop(w, t, st, x, 572);
        for (let j = 0; j < 2; j++) { const f = ((t - st - 0.4 - j * 1.6) / 3.2) % 1; if (t > st + 0.4 + j * 1.6) b += leaving(sh, x, 572, x + 30 + (j ? -50 : 40), 345, f < 0 ? 0 : f, 70, i + j * 3); }
      });
      b += pop(badge('どの わでも、できたのは まるい たま だけ', { fill: SB.filmDk, size: 46 }), t, c1 + d1 * 0.62, 1000, 190);
      b += g(text(1000, 256, '（おおさかしりつ かがくかんの じっけん）', { size: 30, w: 700, fill: C.muted }), { o: prog(t, c1 + d1 * 0.7, 0.4) });
      out += g(b, { o: bO });
    }
    // C：輪の形になるのは、くっついている あいだだけ
    const cO = prog(t, c2 - 0.3, 0.5);
    if (cO > 0) {
      let c = wand('star', 520, 450, 210, { film: 1, stick: 240, sw: 18 });
      c += `<path d="M ${starPts(520, 450, 196)} Z" fill="none" stroke="${SB.film}" stroke-width="6" stroke-linejoin="round" stroke-dasharray="16 12" opacity="${0.5 + 0.5 * Math.sin(t * 4)}"/>`;
      c += pop(badge('わに くっついて いる あいだ', { fill: SB.wandDk, size: 42 }), t, c2 + d2 * 0.2, 520, 180) + pop(olText(0, 0, 'わの かたち', { size: 50, ol: SB.wandDk }), t, c2 + d2 * 0.3, 520, 456);
      c += arrow(790, 420, 990, 420, C.muted, 16, eo(prog(t, c2 + d2 * 0.5, 0.5)));
      c += pop(bub(0, 0, 150), t, c2 + d2 * 0.55, 1230, 420 + Math.sin(t * 1.4) * 8);
      c += pop(badge('はなれると', { fill: SB.filmDk, size: 42 }), t, c2 + d2 * 0.6, 1230, 180) + pop(olText(0, 0, 'まる', { size: 60 }), t, c2 + d2 * 0.7, 1230, 426);
      out += g(c, { o: cO });
      out += kidShow('B', t, 1730, 890, { s: 0.5, start: cue(3) - 0.9, n: 0, look: [-8, -4] });
    }
    return out;
  },
});

// 8. 2つくっつくと：あいだに かべ。同じ大きさなら平ら、ちがうと小さいほうがふくらむ
// 同じ大きさ R の2つ。まん中 (cx, cy)、中心のあいだ d（2R でふれる、R でくっついた形）
function twin(cx, cy, R, d) {
  if (d >= 2 * R - 0.5) return bub(cx - d / 2, cy, R) + bub(cx + d / 2, cy, R);
  const h = Math.sqrt(R * R - d * d / 4), big = 1;
  const pathL = `M ${cx} ${cy - h} A ${R} ${R} 0 ${big} 0 ${cx} ${cy + h}`, pathR = `M ${cx} ${cy - h} A ${R} ${R} 0 ${big} 1 ${cx} ${cy + h}`;
  let o = `<path d="${pathL} Z" fill="${SB.water}" fill-opacity="0.45"/><path d="${pathR} Z" fill="${SB.water}" fill-opacity="0.45"/>`;
  o += `<path d="${pathL}" fill="none" stroke="${SB.film}" stroke-width="7"/><path d="${pathR}" fill="none" stroke="${SB.film}" stroke-width="7"/><line x1="${cx}" y1="${cy - h}" x2="${cx}" y2="${cy + h}" stroke="${SB.film}" stroke-width="7" stroke-linecap="round"/>`;
  [-1, 1].forEach(sd => { const x = cx + sd * d / 2; o += `<path d="M ${x - R * 0.55} ${cy - R * 0.35} A ${R * 0.65} ${R * 0.65} 0 0 1 ${x - R * 0.1} ${cy - R * 0.62}" fill="none" stroke="#fff" stroke-width="${R * 0.09}" stroke-linecap="round"/><path d="M ${x - R * 0.72} ${cy + R * 0.4} A ${R * 0.84} ${R * 0.84} 0 0 0 ${x - R * 0.05} ${cy + R * 0.8}" fill="none" stroke="${SB.pink}" stroke-width="${R * 0.06}" stroke-linecap="round" opacity="0.8"/>`; });
  return o;
}
// 大きさのちがう2つ（左が大 R1、右が小 R2）。かべは、小さいほうから大きいほうへふくらむ。(cx, cy) は大きいほうの中心
function pairUneven(cx, cy, R1, R2) {
  const d = Math.sqrt(R1 * R1 + R2 * R2 - R1 * R2), jx = (d * d + R1 * R1 - R2 * R2) / (2 * d), jy = Math.sqrt(R1 * R1 - jx * jx), R3 = R1 * R2 / (R1 - R2);
  const X = cx + jx, yT = cy - jy, yB = cy + jy;
  const bigP = `M ${X} ${yT} A ${R1} ${R1} 0 1 0 ${X} ${yB}`, smallP = `M ${X} ${yT} A ${R2} ${R2} 0 ${jx > d ? 0 : 1} 1 ${X} ${yB}`, wall = `A ${R3} ${R3} 0 0 1 ${X} ${yT}`;
  let o = `<path d="${bigP} ${wall} Z" fill="${SB.water}" fill-opacity="0.45"/><path d="${smallP} ${wall} Z" fill="${SB.water}" fill-opacity="0.6"/>`;
  o += `<path d="${bigP}" fill="none" stroke="${SB.film}" stroke-width="7"/><path d="${smallP}" fill="none" stroke="${SB.film}" stroke-width="7"/><path d="M ${X} ${yB} ${wall}" fill="none" stroke="${SB.film}" stroke-width="7" stroke-linecap="round"/>`;
  o += `<path d="M ${cx - R1 * 0.55} ${cy - R1 * 0.35} A ${R1 * 0.65} ${R1 * 0.65} 0 0 1 ${cx - R1 * 0.1} ${cy - R1 * 0.62}" fill="none" stroke="#fff" stroke-width="${R1 * 0.09}" stroke-linecap="round"/>`;
  o += `<path d="M ${cx + d - R2 * 0.1} ${cy - R2 * 0.66} A ${R2 * 0.66} ${R2 * 0.66} 0 0 1 ${cx + d + R2 * 0.45} ${cy - R2 * 0.42}" fill="none" stroke="#fff" stroke-width="${R2 * 0.1}" stroke-linecap="round"/>`;
  return { svg: o, d, wallX: X + Math.sqrt(R3 * R3 - jy * jy) - R3 };
}
function hexFoam(t) {
  // 大きさのそろった あわ：六角形がならぶ
  const r = 78, w = Math.sqrt(3) * r;
  let o = '';
  for (let row = -1; row < 6; row++) for (let col = -1; col < 11; col++) {
    const x = 330 + col * w + (row % 2 ? w / 2 : 0), y = 200 + row * r * 1.5;
    const pts = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 3 * i + Math.PI / 6; return `${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' L ');
    o += `<path d="M ${pts} Z" fill="${SB.water}" fill-opacity="${0.4 + 0.2 * rnd(row * 13 + col, 7)}" stroke="${SB.film}" stroke-width="7" stroke-linejoin="round"/>`;
    o += `<path d="M ${x - r * 0.45} ${y - r * 0.2} Q ${x - r * 0.3} ${y - r * 0.5} ${x} ${y - r * 0.55}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.9"/>`;
  }
  return o;
}
SCENES.push({
  id: 'two',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    let out = PAPER + topBadge();
    const abO = 1 - prog(t, c3 - 0.7, 0.4);
    if (abO > 0) {
      // 同じ大きさの2つが近づいて、くっつく
      const R = 175, mvC = eio(prog(t, c2 - 0.7, 0.8));
      const ap = eio(prog(t, 0.4, c1 - 0.6)), jn = eo(prog(t, c1 - 0.15, 0.6));
      const d = t < c1 - 0.15 ? lerp(760, 2 * R, ap) : lerp(2 * R, R, jn) * (1 + 0.05 * Math.sin(prog(t, c1 - 0.15, 1.2) * Math.PI * 3) * (1 - prog(t, c1 - 0.15, 1.2)));
      const gx = lerp(960, 520, mvC), gs = lerp(1, 0.78, mvC), gy = 450;
      let a = `<g transform="translate(${gx} ${gy}) scale(${gs})">${twin(0, Math.sin(t * 1.3) * 6, R, d)}</g>`;
      a += g(text(960, 210, '？', { size: 130, w: 900, fill: C.ochre }), { o: prog(t, c0 + d0 * 0.5, 0.3) * (1 - prog(t, c1 - 0.5, 0.3)), s: 1 + Math.sin(t * 4) * 0.05 });
      // かべ
      const wk = prog(t, c1 + d1 * 0.12, 0.3);
      a += g(pop(badge('かべ', { fill: SB.filmDk, size: 48, pad: 40 }), t, c1 + d1 * 0.12, 0, 0), { x: lerp(960, 520, mvC), y: 190 });
      a += pointer(lerp(960, 520, mvC), 228, gx, gy - 60 * gs, SB.filmDk, wk);
      a += pop(badge('おなじ おおきさ → かべは まったいら', { fill: C.accent, size: 46 }), t, c1 + d1 * 0.55, 960, 782, { end: c2 - 0.3 });
      a += g(text(520, 650, 'おなじ おおきさ', { size: 40, w: 900 }) + text(520, 702, 'まったいら', { size: 42, w: 900, fill: C.accent }), { o: prog(t, c2, 0.4) });
      // 大きさがちがう2つ
      const uk = prog(t, c2 - 0.1, 0.5);
      if (uk > 0) {
        const P = pairUneven(0, 0, 200, 112), ox = 1250, oy = 450 + Math.sin(t * 1.3 + 1) * 6;
        a += pop(P.svg, t, c2 - 0.1, ox, oy);
        const pk = prog(t, c2 + d2 * 0.45, 0.4), pl = 0.5 + 0.5 * Math.sin(t * 4);
        a += arrow(ox + P.d + 40, oy, ox + P.wallX + 34 - pl * 10, oy, SB.push, 13, 1, pk);
        a += pop(badge('かべ', { fill: SB.filmDk, size: 44, pad: 36 }), t, c2 + d2 * 0.45, 1640, 250) + pointer(1590, 282, ox + P.wallX + 26, oy - 64, SB.filmDk, pk);
        a += g(text(1330, 702, 'ちがう おおきさ', { size: 40, w: 900 }), { o: prog(t, c2 + 0.2, 0.4) });
        a += pop(badge('ちいさい ほうが、おおきい ほうへ ふくらむ', { fill: SB.push, size: 44 }), t, c2 + d2 * 0.55, 1000, 786);
      }
      out += g(a, { o: abO });
    }
    // たくさんならぶと、ハチの巣のような六角形
    const hO = prog(t, c3 - 0.4, 0.5);
    if (hO > 0) {
      let h = `<clipPath id="hxc"><rect x="330" y="180" width="1260" height="560" rx="40"/></clipPath><g clip-path="url(#hxc)"><rect x="330" y="180" width="1260" height="560" fill="#f3f9fb"/>${hexFoam(t)}</g><rect x="330" y="180" width="1260" height="560" rx="40" fill="none" stroke="${SB.film}" stroke-width="10"/>`;
      // 1つをなぞる
      const r = 78, w = Math.sqrt(3) * r, hx = 330 + 4 * w, hy = 200 + 2 * r * 1.5;
      const pts = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 3 * i + Math.PI / 6; return `${(hx + r * Math.cos(a)).toFixed(1)} ${(hy + r * Math.sin(a)).toFixed(1)}`; }).join(' L ');
      h += `<path d="M ${pts} Z" fill="none" stroke="${C.ochre}" stroke-width="13" stroke-linejoin="round" opacity="${prog(t, c3 + d3 * 0.55, 0.3)}"/>`;
      h += pop(badge('ろっかっけい', { fill: C.ochre, size: 46, pad: 40 }), t, c3 + d3 * 0.6, hx + 330, hy - 30) + pointer(hx + 190, hy - 30, hx + r + 6, hy - 10, C.ochre, prog(t, c3 + d3 * 0.6 + 0.2, 0.3));
      h += pop(badge('おおきさの そろった あわ → ハチの す みたい', { fill: SB.filmDk, size: 46 }), t, c3 + d3 * 0.3, 960, 792);
      out += g(h, { o: hO });
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.blueUi}"/>` + text(-530, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'まるい たま', { size: 60, w: 900, anchor: 'start' }) + g(wand('star', 0, -8, 52, { film: 1, stick: 30, sw: 9 }), { x: 250, y: 0 }) + arrow(330, 0, 400, 0, C.muted, 10) + g(GUESS_ICON[0](), { x: 500, y: 0, s: 1.1 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['まくは ちぢみたい', SB.pull], ['くうきを つつむ いちばん ちいさい かたち', C.accent], ['だから まるい たま', SB.filmDk]], t, 960, 660, { start: 2.4, step: 1.1, size: 32, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const wandIc = g(wand('star', 0, -12, 40, { film: 1, stick: 34, sw: 8 }));
      const items = [
        [wandIc, 'まる・しかく・ほしの わで ためそう', C.ink],
        [warnIcon(0.82), 'くちに いれない。ストローは すわずに ふく', C.red],
        [warnIcon(0.82), 'かおに むけない。めは こすらず あらう', C.red],
        [warnIcon(0.82), 'あそぶのは、にわなど そとで', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // モールで作った3つの輪と、くっついた2つの玉
      let p = card(430, 330);
      [['circle', -134], ['square', 0], ['star', 134]].forEach(([sh, x], i) => { p += wand(sh, x, 50, 50, { film: 1, stick: 50, sw: 9 }) + bub(x + Math.sin(t * 1.2 + i) * 6, -60 - ((t * 14 + i * 20) % 44), 26, { o: 1 - ((t * 14 + i * 20) % 44) / 60 }); });
      b += pop(p, t, cue(1) + 0.3, 1610, 330);
      b += pop(g(twin(0, 0, 70, 70)) + text(0, 116, 'くっついたら かべも みる', { size: 34, w: 900, fill: SB.filmDk }), t, cue(1) + 1.2, 1300, 640);
      b += kidShow('K', t, 1690, 830, { s: 0.8, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「シャボンだま」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

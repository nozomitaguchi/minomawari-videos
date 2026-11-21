// みのまわり図鑑 動画「葉っぱは、どうして秋になると赤や黄色になるの？」（あきの はっぱ）
// 出どころ：everyday-trivia trivia/autumn-leaves-color.md

// ---------- 秋の葉っぱの道具 ----------
const AU = {
  sky: '#e4f0f6', ground: '#eadfbf', groundDk: '#cfc09a', hill: '#d6dcb4',
  trunk: '#8a6a4a', trunkDk: '#6b4f36',
  green: '#4fa64a', greenDk: '#2f7d3a', greenLt: '#86c96a', shade: '#3d8a45',
  yellow: '#f4c531', yellowDk: '#b8860b', yellowLt: '#ffd957',
  red: '#d9372c', redDk: '#a8231f', redLt: '#ee5f48',
  sun: '#f6b500', bug: '#7a9a3a',
};
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（tx, ty から右へ、または左へ のびる）
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46, sub = '' } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }) +
    (sub ? text(an === 'end' ? tx - 8 : tx + 8, ty + size * 1.42, sub, { size: size * 0.68, w: 700, fill: C.muted, anchor: an }) : ''), { o });
};
// 指し線つきのラベル（ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const sparkle = (x, y, s, o = 1, col = '#fff') => g(`<path d="M 0 -30 L 7 -7 L 30 0 L 7 7 L 0 30 L -7 7 L -30 0 L -7 -7 Z" fill="${col}"/>`, { x, y, s, o });
// はばに入るように、文字の大きさを決める
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
// 葉っぱの色。gA: 緑の色の量 1〜0、rA: 赤い色の量 0〜1（緑がなくなると黄色、赤がふえると赤）
const leafCol = (gA, rA = 0) => mix(mix(AU.yellow, AU.green, clamp(gA)), AU.red, clamp(rA));

// イチョウの葉（柄のつけ根が原点、葉は上）
const GK_PATH = 'M -3 0 L -3 -30 C -44 -34 -66 -70 -52 -100 Q -30 -116 -6 -98 L 0 -84 L 6 -98 Q 30 -116 52 -100 C 66 -70 44 -34 3 -30 L 3 0 Z';
const ginkgoLeaf = (x, y, s = 1, r = 0, col = AU.yellow, o = 1) => o <= 0.01 ? '' :
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${clamp(o)}"><path d="${GK_PATH}" fill="${col}"/><path d="M 0 -30 L -34 -92 M 0 -30 L -16 -98 M 0 -30 L 16 -98 M 0 -30 L 34 -92" fill="none" stroke="${mix(col, '#000000', 0.16)}" stroke-width="2.5" stroke-linecap="round"/></g>`;
// モミジの葉（柄のつけ根が原点、葉は上。7つに分かれた形）
const MP = (() => {
  const c = [0, -50], lob = [[-118, 40], [-76, 80], [-38, 102], [0, 116], [38, 102], [76, 80], [118, 40]];
  const P = (a, r) => { const q = a * Math.PI / 180; return [c[0] + Math.sin(q) * r, c[1] - Math.cos(q) * r]; };
  const f = p => p.map(v => v.toFixed(1)).join(' ');
  let d = `M ${f(P(-172, 14))}`, veins = '';
  lob.forEach(([a, r], i) => {
    const next = i < lob.length - 1 ? P((a + lob[i + 1][0]) / 2, Math.min(r, lob[i + 1][1]) * 0.56) : P(172, 14);
    d += ` Q ${f(P(a - 21, r * 0.66))} ${f(P(a, r))} Q ${f(P(a + 21, r * 0.66))} ${f(next)}`;
    veins += `M ${f(c)} L ${f(P(a, r * 0.78))} `;
  });
  return { d: d + ' Z', veins };
})();
const mapleLeaf = (x, y, s = 1, r = 0, col = AU.red, o = 1) => o <= 0.01 ? '' :
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${clamp(o)}"><path d="M -3 0 L -3 -48 L 3 -48 L 3 0 Z" fill="${mix(col, '#5a3a22', 0.5)}"/><path d="${MP.d}" fill="${col}" stroke="${col}" stroke-width="3" stroke-linejoin="round"/><path d="${MP.veins}" fill="none" stroke="${mix(col, '#000000', 0.18)}" stroke-width="2.5" stroke-linecap="round"/></g>`;

// イチョウの木（足もとが原点）。k: 0 みどり → 1 きいろ
const GK_BR = [[0, -200, -150, -330, 14], [-150, -330, -200, -430, 9], [-150, -330, -90, -420, 8], [0, -250, 150, -360, 14], [150, -360, 210, -450, 9], [150, -360, 110, -450, 8],
  [0, -330, -90, -470, 10], [0, -360, 80, -490, 10], [0, -440, 0, -540, 9]];
const GK_CAN = [[0, -300, 130], [-130, -360, 112], [130, -372, 112], [0, -430, 150], [-64, -506, 100], [72, -516, 100]];
function ginkgoTreeA(x, y, s, t, k = 1) {
  const col = mix(AU.green, AU.yellow, k), c1 = mix(AU.greenLt, AU.yellowLt, k), c2 = mix(AU.greenDk, '#e0a81a', k);
  let b = `<path d="M -28 0 L -17 -260 L -8 -444 L 8 -444 L 17 -260 L 28 0 Z" fill="${AU.trunk}"/><path d="M 6 0 L 6 -430 L 8 -444 L 17 -260 L 28 0 Z" fill="${AU.trunkDk}" opacity="0.35"/>`;
  GK_BR.forEach(([x1, y1, x2, y2, w]) => { b += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${AU.trunk}" stroke-width="${w}" stroke-linecap="round"/>`; });
  GK_CAN.forEach(([cx, cy, r]) => { b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`; });
  for (let i = 0; i < 24; i++) { const [cx, cy, r] = GK_CAN[i % 6], a = rnd(i, 41) * 6.28, d = rnd(i, 42) * r * 0.75; b += ginkgoLeaf(cx + Math.cos(a) * d, cy + Math.sin(a) * d + 20, 0.42, (rnd(i, 43) - 0.5) * 120 + Math.sin(t * 1.5 + i) * 4, i % 3 ? c1 : c2); }
  return `<g transform="translate(${x} ${y}) scale(${s})">${b}</g>`;
}
// モミジの木（足もとが原点）。k: 0 みどり → 1 あか
const MP_CAN = [[0, -250, 150], [-150, -290, 125], [150, -290, 125], [-80, -390, 130], [90, -395, 130], [0, -330, 170], [-205, -215, 88], [205, -215, 88]];
const MP_TRUNK = `<path d="M -24 0 L -15 -150 L -84 -262 L -64 -274 L 0 -186 L 64 -274 L 84 -262 L 15 -150 L 24 0 Z" fill="${AU.trunk}"/><path d="M 6 0 L 4 -186 L 64 -274 L 84 -262 L 15 -150 L 24 0 Z" fill="${AU.trunkDk}" opacity="0.35"/>`;
function mapleTreeA(x, y, s, t, k = 1) {
  const col = mix(AU.green, AU.red, k), c1 = mix(AU.greenLt, AU.redLt, k), c2 = mix(AU.greenDk, AU.redDk, k);
  let b = MP_TRUNK;
  MP_CAN.forEach(([cx, cy, r]) => { b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`; });
  for (let i = 0; i < 30; i++) { const [cx, cy, r] = MP_CAN[i % 8], a = rnd(i, 44) * 6.28, d = rnd(i, 45) * r * 0.75; b += mapleLeaf(cx + Math.cos(a) * d, cy + Math.sin(a) * d + 28, 0.34, (rnd(i, 46) - 0.5) * 130 + Math.sin(t * 1.5 + i) * 4, i % 3 ? c1 : c2); }
  return `<g transform="translate(${x} ${y}) scale(${s})">${b}</g>`;
}
// 大きなモミジの木。外側は赤、open > 0 で内側（葉が重なって日の当たらない所）の緑の葉が見える
const MB_OUT = [[0, -300, 175], [-170, -300, 130], [170, -300, 130], [-95, -410, 135], [95, -415, 135], [0, -460, 120], [-230, -225, 95], [230, -225, 95]];
const MB_IN = [[0, -262, 112], [-92, -236, 80], [92, -236, 80], [0, -322, 92]];
function mapleBig(x, y, s, t, { open = 0 } = {}) {
  let b = MP_TRUNK;
  MB_OUT.forEach(([cx, cy, r]) => { b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${AU.red}"/>`; });
  for (let i = 0; i < 40; i++) { const [cx, cy, r] = MB_OUT[i % 8], a = rnd(i, 47) * 6.28, d = (0.25 + rnd(i, 48) * 0.6) * r; b += mapleLeaf(cx + Math.cos(a) * d, cy + Math.sin(a) * d + 28, 0.36, (rnd(i, 49) - 0.5) * 130 + Math.sin(t * 1.5 + i) * 4, i % 3 ? AU.redLt : AU.redDk); }
  if (open > 0.01) {
    let c = '';
    MB_IN.forEach(([cx, cy, r]) => { c += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${AU.shade}"/>`; });
    c += `<path d="M 0 -150 L 0 -330 M 0 -200 L -74 -270 M 0 -220 L 74 -280" fill="none" stroke="${AU.trunk}" stroke-width="13" stroke-linecap="round"/>`;
    for (let i = 0; i < 18; i++) { const [cx, cy, r] = MB_IN[i % 4], a = rnd(i, 54) * 6.28, d = rnd(i, 55) * r * 0.72; c += mapleLeaf(cx + Math.cos(a) * d, cy + Math.sin(a) * d + 26, 0.33, (rnd(i, 56) - 0.5) * 130, i % 2 ? AU.green : AU.greenLt); }
    const k = eo(clamp(open));
    b += `<g transform="translate(0 -262) scale(${Math.max(k, 0.001)}) translate(0 262)" opacity="${clamp(open * 4)}">${c}</g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">${b}</g>`;
}
// 秋の公園
function parkBgA(gy = 780, { sun = true } = {}) {
  let o = `<rect width="1920" height="1080" fill="${AU.sky}"/>`;
  if (sun) o += `<circle cx="960" cy="150" r="64" fill="#fff6cf" opacity="0.95"/>`;
  o += cloud(250, 130, 0.7, '#fff', 0.8) + cloud(1760, 250, 0.55, '#fff', 0.7);
  o += `<path d="M 0 ${gy - 60} Q 480 ${gy - 150} 960 ${gy - 70} T 1920 ${gy - 90} L 1920 ${gy} L 0 ${gy} Z" fill="${AU.hill}"/>`;
  o += `<rect x="0" y="${gy - 6}" width="1920" height="${1080 - gy + 6}" fill="${AU.ground}"/><rect x="0" y="${gy - 6}" width="1920" height="10" fill="${AU.groundDk}"/>`;
  return o;
}
// ひらひら落ちる葉（k: 0〜1）
function fallLeafA(kind, k, x0, y0, x1, y1, i, col, s = 0.42, o = 1) {
  if (k <= 0 || o <= 0.01) return '';
  const sway = Math.sin(k * 9 + i) * 34 * (1 - k), x = lerp(x0, x1, k) + sway, y = lerp(y0, y1, k * k * 0.5 + k * 0.5);
  const r = (rnd(i, 81) - 0.5) * 80 + k * 300 * (i % 2 ? 1 : -1), op = o * Math.min(1, k * 8, (1 - k) * 8);
  return kind === 'g' ? ginkgoLeaf(x, y, s, r, col, op) : mapleLeaf(x, y, s, r, col, op);
}
// 葉っぱの中を大きくした丸。緑の色のつぶ・黄色の色のつぶ・赤い色のつぶ
const CELL_SLOTS = (() => {
  const out = [], d = 0.27;
  for (let j = -4; j <= 4; j++) for (let i = -5; i <= 5; i++) { const x = (i + (j % 2 ? 0.5 : 0)) * d, y = j * d * 0.87; if (Math.hypot(x, y) < 0.86) out.push([x, y]); }
  return out;
})();
const CELL_KIND = CELL_SLOTS.map((_, i) => (i % 4 === 1 ? 'y' : 'g'));
const CELL_G = CELL_SLOTS.map((_, i) => i).filter(i => CELL_KIND[i] === 'g').sort((a, b) => rnd(a, 5) - rnd(b, 5));   // 緑は、この順のうしろから消えていく
const CELL_Y = CELL_SLOTS.map((_, i) => i).filter(i => CELL_KIND[i] === 'y');
const CELL_NR = Math.round(CELL_G.length * 0.75);   // 赤いつぶの数
// 右がわにある、指し線を引きやすいつぶ
const cellPick = arr => arr.reduce((a, b) => (CELL_SLOTS[b][0] - Math.abs(CELL_SLOTS[b][1]) * 0.4 > CELL_SLOTS[a][0] - Math.abs(CELL_SLOTS[a][1]) * 0.4 ? b : a));
const CELL_GP = cellPick(CELL_G.slice(0, 8)), CELL_YP = cellPick(CELL_Y), CELL_RP = cellPick(CELL_G.slice(-8));
const cellPos = (i, cx, cy, R) => [cx + CELL_SLOTS[i][0] * R, cy + CELL_SLOTS[i][1] * R];
function cellView(cx, cy, R, t, { gA = 1, rA = 0, gIn = 1, yIn = 1, yPulse = 0, gPulse = 0 } = {}) {
  const bg = mix(mix('#fbf1c4', '#dcefc9', clamp(gA)), '#f8d5cb', clamp(rA) * 0.85);
  let o = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${bg}" stroke="${C.blueUi}" stroke-width="${Math.max(7, R * 0.05)}"/>`;
  const dr = R * 0.105, nG = CELL_G.length;
  const dot = (x, y, r, col) => (r <= 0.5 ? '' : `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.32}" r="${r * 0.28}" fill="#fff" opacity="0.55"/>`);
  CELL_SLOTS.forEach(([sx, sy], i) => {
    const x = cx + sx * R + Math.sin(t * 1.3 + i) * R * 0.012, y = cy + sy * R + Math.cos(t * 1.1 + i * 2) * R * 0.012;
    if (CELL_KIND[i] === 'y') {
      const k = back(clamp(yIn * CELL_Y.length - CELL_Y.indexOf(i)));
      o += dot(x, y, dr * Math.max(k, 0) * (1 + 0.2 * yPulse * (0.6 + 0.4 * Math.sin(t * 5 + i))), AU.yellow);
    } else {
      const rank = CELL_G.indexOf(i);
      const kg = clamp(gA * nG - rank) * back(clamp(gIn * nG - rank));
      const kr = back(clamp(rA * CELL_NR - (nG - 1 - rank)));
      o += dot(x, y, dr * Math.max(kg, 0) * (1 + 0.14 * gPulse * (0.6 + 0.4 * Math.sin(t * 5 + i))), AU.green);
      o += dot(x, y, dr * Math.max(kr, 0), AU.red);
    }
  });
  return o;
}
// 葉っぱから 大きな丸へ のびる点線
const lensLines = (x, y, cx, cy, R, o = 1) => `<g opacity="${o}"><circle cx="${x}" cy="${y}" r="34" fill="none" stroke="${C.blueUi}" stroke-width="7"/><line x1="${x + 24}" y1="${y - 24}" x2="${cx - R * 0.5}" y2="${cy - R * 0.86}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 10"/><line x1="${x + 24}" y1="${y + 24}" x2="${cx - R * 0.5}" y2="${cy + R * 0.86}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 10"/></g>`;
// お日さまと光の線
function sunRays(x, y, r, targets, t, o = 1, w = 9) {
  let s = '';
  targets.forEach(([tx, ty], i) => {
    const a = Math.atan2(ty - y, tx - x), x1 = x + Math.cos(a) * (r + 22), y1 = y + Math.sin(a) * (r + 22);
    s += `<line x1="${x1}" y1="${y1}" x2="${tx}" y2="${ty}" stroke="${AU.sun}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="26 18" stroke-dashoffset="${-t * 70 - i * 9}" opacity="0.9"/>`;
  });
  return g(s + sunDisc(x, y, r, 0, { glow: 0.8 }), { o });
}
// 糖のつぶ（白い六角）
const sugarHex = (x, y, s = 1, o = 1) => o <= 0.01 ? '' : g(`<path d="M 0 -20 L 17.3 -10 L 17.3 10 L 0 20 L -17.3 10 L -17.3 -10 Z" fill="#fff" stroke="${C.ochre}" stroke-width="5" stroke-linejoin="round"/>`, { x, y, s, o });
// 日がさ
const parasol = (x, y, s, col = AU.red) => g(`<path d="M 0 -4 L 0 96 Q 0 112 -14 112" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/><path d="M -96 0 A 96 82 0 0 1 96 0 Q 72 -18 48 0 Q 24 -18 0 0 Q -24 -18 -48 0 Q -72 -18 -96 0 Z" fill="${col}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`, { x, y, s });
// 小さな虫（アブラムシのような虫）。頭は右むき。dir = -1 で左むき
const bugIcon = (x, y, s, dir = 1, t = 0) => `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})"><path d="M -16 14 L -24 ${28 + Math.sin(t * 14) * 3} M 0 16 L 0 ${30 - Math.sin(t * 14) * 3} M 16 14 L 24 ${28 + Math.sin(t * 14) * 3}" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="30" ry="20" fill="${AU.bug}" stroke="${C.ink}" stroke-width="4"/><circle cx="30" cy="-4" r="12" fill="${AU.bug}" stroke="${C.ink}" stroke-width="4"/><circle cx="34" cy="-7" r="3.2" fill="${C.ink}"/><path d="M 36 -14 L 46 -28 M 30 -16 L 34 -32" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"/></g>`;
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;

// 1. つかみ：モミジは赤、イチョウは黄色。ふだんは どちらも緑なのに
SCENES.push({
  id: 'hook',
  draw(t) {
    const GY = 780, c0 = cue(0), c2 = cue(2), c3 = cue(3);
    let out = parkBgA(GY);
    const k = 1 - win(t, c2 + 0.2, c3 - 0.3, 0.35);   // ふだんは みどり
    // 地面の落ち葉
    for (let i = 0; i < 7; i++) out += mapleLeaf(200 + i * 78 + rnd(i, 3) * 30, GY + 30 + rnd(i, 4) * 40, 0.36, rnd(i, 6) * 360, i % 2 ? AU.red : AU.redLt, k);
    for (let i = 0; i < 7; i++) out += ginkgoLeaf(1250 + i * 80 + rnd(i, 7) * 30, GY + 30 + rnd(i, 8) * 40, 0.42, rnd(i, 9) * 360, i % 2 ? AU.yellow : AU.yellowLt, k);
    out += mapleTreeA(430, GY, 1.05, t, k) + ginkgoTreeA(1500, GY, 1.0, t, k);
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.16 + i * 0.37) % 1, q = (t * 0.15 + i * 0.31 + 0.2) % 1;
      out += fallLeafA('m', p, 300 + i * 120, 330 + i * 30, 250 + i * 150, GY + 10, i, i % 2 ? AU.redLt : AU.red, 0.4, k);
      out += fallLeafA('g', q, 1400 + i * 110, 300 + i * 30, 1360 + i * 130, GY + 10, i + 5, i % 2 ? AU.yellowLt : AU.yellow, 0.46, k);
    }
    out += pop(badge('モミジ', { fill: AU.red, size: 46 }), t, c0 + 1.6, 430, 160);
    out += pop(badge('イチョウ', { fill: AU.yellowDk, size: 46 }), t, c0 + 3.4, 1500, 100);
    out += pop(badge('ふだんは どちらも みどり', { fill: AU.greenDk, size: 44 }), t, c2 + 0.5, 960, 300, { end: c3 - 0.2 });
    out += kidShow('S', t, 880, 846, { s: 0.45, start: 0.3, n: 0, side: 'right', size: 42 });
    out += g(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre, extra: `stroke="${AU.sky}" stroke-width="16" paint-order="stroke"` }), { x: 1000, y: 380, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">はっぱは どうして あきに</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${AU.red}">あか</tspan>や <tspan fill="${AU.yellowDk}">きいろ</tspan>に なるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(mapleLeaf(-150, 80, 0.95, -12, AU.red) + ginkgoLeaf(20, 76, 1.3, 12, AU.yellow) + text(170, -10, '？', { size: 100, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'イチョウの はっぱの きいろは、どこから きた？', { size: 60, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'あきに、きが きいろい いろを あたらしく つくった'], ['②', 'はじめから はっぱの なかに あって、みどりに かくれて いた'], ['③', 'おひさまに やけて、きいろく なった']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 42)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(ginkgoLeaf(-10, 70, 1.5, -10, AU.yellow) + text(100, -60, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 340);
    out += kidShow('B', t, 1720, 850, { s: 0.55, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 葉っぱの中：緑の色と黄色の色。ふだんは緑が多い。緑は栄養を作る大事な色
SCENES.push({
  id: 'inside',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), CX = 1130, CY = 440, R = 265;
    let out = PAPER + topBadge();
    // お日さまの光（N2）
    const sO = prog(t, c2 + 0.6, 0.5);
    if (sO > 0) out += sunRays(585, 178, 50, [[400, 290], [410, 600]], t, sO);
    out += ginkgoLeaf(300, 470, 2.3, -8, AU.green) + mapleLeaf(330, 800, 1.9, 6, AU.green);
    out += lensLines(330, 320, CX, CY, R, prog(t, 0.4, 0.4));
    out += pop(badge('はっぱの なか', { fill: C.blueUi, size: 42 }), t, 0.6, CX, 120);
    out += g(cellView(CX, CY, R, t, { gIn: prog(t, c0 + 1.0, 1.6), yIn: prog(t, c0 + 3.0, 1.0), gPulse: win(t, c2 + 0.4, c2 + 4.0, 0.4) }), { o: prog(t, 0.5, 0.4) });
    const [gx, gy] = cellPos(CELL_GP, CX, CY, R), [yx, yy] = cellPos(CELL_YP, CX, CY, R);
    out += callout(gx, gy, 1470, 290, 'みどりの いろ', prog(t, c0 + 1.8, 0.4), { col: AU.greenDk, size: 44, sub: 'クロロフィル' });
    out += callout(yx, yy, 1470, 520, 'きいろの いろ', prog(t, c0 + 3.4, 0.4), { col: AU.yellowDk, size: 44, sub: 'カロテノイド' });
    // ふだんは緑が多い → 緑に見える
    const e1 = c2 - 0.2;
    out += pop(badge('みどりの ほうが おおい', { fill: AU.greenDk, size: 38 }), t, c1 + 1.2, 800, 790, { end: e1 });
    out += pop(badge('はっぱは みどりに みえる', { fill: AU.green, size: 38 }), t, c1 + 3.2, 1330, 790, { end: e1 });
    // 緑は、光で栄養を作る大事な色
    out += pop(badge('ひかりで きの えいようを つくる、だいじな いろ', { fill: AU.greenDk, size: 40 }), t, c2 + 1.8, 1060, 790);
    const nO = prog(t, c2 + 1.6, 0.5);
    if (nO > 0) {
      for (let i = 0; i < 3; i++) { const p = (t * 0.4 + i / 3) % 1, y = lerp(300, 462, p); out += `<circle cx="${300 + Math.sin(p * 6 + i) * 4}" cy="${y}" r="11" fill="${C.ochre}" stroke="#fff" stroke-width="3" opacity="${nO * Math.min(1, p * 6, (1 - p) * 6)}"/>`; }
      out += g(text(0, 0, 'えいよう', { size: 34, w: 900, fill: C.ochre, anchor: 'end' }), { x: 270, y: 440, o: nO });
    }
    return out;
  },
});

// 4. 黄色：緑がこわれてへると、かくれていた黄色が見えてくる
SCENES.push({
  id: 'yellow',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), CX = 1120, CY = 430, R = 250;
    let out = PAPER + topBadge();
    const p = eio(prog(t, c0 + 1.2, c1 + 0.6 - (c0 + 1.2))), gA = lerp(1, 0.06, p);
    out += pop(badge('あきに なると…', { fill: C.ink, size: 42 }), t, c0 + 0.2, 400, 190, { end: c1 });
    out += pop(badge('イチョウ', { fill: AU.yellowDk, size: 46 }), t, c1 + 0.2, 400, 190);
    out += ginkgoLeaf(400, 735, 3.9, -6, leafCol(gA));
    out += lensLines(430, 430, CX, CY, R);
    out += pop(badge('はっぱの なか', { fill: C.blueUi, size: 42 }), t, 0.3, CX, 120);
    const yP = win(t, c1 + 0.8, c2 - 0.3, 0.4);
    out += cellView(CX, CY, R, t, { gA, yPulse: yP });
    out += pop(badge('みどりが こわれて へる', { fill: AU.greenDk, size: 36 }), t, c0 + 2.4, 1640, 250, { end: c1 + 0.2 });
    const [yx, yy] = cellPos(CELL_YP, CX, CY, R);
    out += callout(yx, yy, 1425, 250, 'かくれて いた きいろ', prog(t, c1 + 1.6, 0.4), { col: AU.yellowDk, size: 38 });
    CELL_Y.slice(0, 5).forEach((i, n) => { const [sx, sy] = cellPos(i, CX, CY, R); out += sparkle(sx + 22, sy - 24, 0.5 + 0.25 * Math.sin(t * 6 + n * 2), yP, '#fff'); });
    out += pop(badge('きいろが みえて きた！', { fill: AU.yellowDk, size: 40 }), t, c1 + 3.0, 1650, 420, { end: c2 });
    // ぬった色ではなく、もともとあった色
    const r1 = '× あきに ぬった いろ', r2 = '○ もともと はっぱに あった いろ';
    out += pop(badge(r1, { fill: C.muted, size: 36 }), t, c2 + 1.0, 640, 792) + pop(badge(r2, { fill: AU.yellowDk, size: 36 }), t, c2 + 3.6, 1210, 792);
    out += kidShow('K', t, 1760, 840, { s: 0.5, start: c3 - 0.9, n: 0, bubble: false });
    out += talkBubble('K', 1590, 640, 1806, 744, 46);   // しっぽの先は カメレオンの頭
    return out;
  },
});

// 5. 赤：モミジは、緑がへるのといっしょに 赤い色を新しく作る。ちがいは「赤を作るかどうか」
SCENES.push({
  id: 'red',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), CX = 1120, CY = 430, R = 250;
    let out = PAPER + topBadge();
    const A = 1 - prog(t, c2 - 0.5, 0.4), B = prog(t, c2 - 0.15, 0.4);
    if (A > 0) {
      const p = eio(prog(t, c1 + 1.0, cueE(1) - 0.8 - (c1 + 1.0))), gA = lerp(1, 0.06, p);
      let a = pop(badge('モミジ', { fill: AU.red, size: 46 }), t, 0.3, 400, 170);
      a += mapleLeaf(400, 780, 3.1, -4, leafCol(gA, p));
      a += lensLines(400, 470, CX, CY, R) + pop(badge('はっぱの なか', { fill: C.blueUi, size: 42 }), t, 0.3, CX, 120);
      a += cellView(CX, CY, R, t, { gA, rA: p });
      a += g(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre }), { x: 700, y: 300, o: win(t, c0 + 0.6, c1 - 0.1, 0.3) });
      a += pop(badge('みどりが へる', { fill: AU.greenDk, size: 38 }), t, c1 + 1.6, 1640, 240);
      const [rx, ry] = cellPos(CELL_RP, CX, CY, R);
      a += callout(rx, ry, 1440, 420, 'あかい いろ', prog(t, c1 + 4.2, 0.4), { col: AU.red, size: 44, sub: 'アントシアニン' });
      a += pop(badge('あたらしく つくる！', { fill: AU.red, size: 44 }), t, c1 + 5.4, 1640, 610);
      out += g(a, { o: A });
    }
    if (B > 0) {
      let b = `<line x1="960" y1="170" x2="960" y2="720" stroke="${C.line}" stroke-width="5" stroke-dasharray="4 14" stroke-linecap="round"/>`;
      // イチョウ
      b += g(badge('イチョウ', { fill: AU.yellowDk, size: 44 }), { x: 480, y: 190 }) + ginkgoLeaf(300, 600, 2.4, -8, AU.yellow) + cellView(650, 440, 150, t, { gA: 0.06 });
      b += pop(badge('きいろ ＝ かくれて いた いろ', { fill: AU.yellowDk, size: 40 }), t, c2 + 0.5, 480, 700);
      // モミジ
      b += g(badge('モミジ', { fill: AU.red, size: 44 }), { x: 1440, y: 190 }) + mapleLeaf(1250, 610, 1.9, 6, AU.red) + cellView(1610, 440, 150, t, { gA: 0.06, rA: 1 });
      b += pop(badge('あか ＝ あきに あたらしく つくる いろ', { fill: AU.red, size: 40 }), t, c2 + 3.0, 1440, 700);
      // ちがい
      const rO = prog(t, c3 + 1.4, 0.4);
      b += `<circle cx="1610" cy="440" r="172" fill="none" stroke="${AU.red}" stroke-width="8" stroke-dasharray="22 14" opacity="${rO * (0.7 + 0.3 * Math.sin(t * 6))}"/>`;
      b += pop(badge('ちがいは「あかい いろを つくるか どうか」', { fill: C.ink, size: 44 }), t, c3 + 0.5, 960, 800);
      out += g(b, { o: B });
    }
    return out;
  },
});

// 6. 日の当たる外側だけ赤い：外側の光は内側の14倍あまり（ハウチワカエデ）。光で糖を作りつづけ、その糖で赤ができる（と考えられている）
SCENES.push({
  id: 'sun',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), c5 = cue(5), GY = 840, TX = 470, TS = 1.15;
    const tp = (lx, ly) => [TX + lx * TS, GY + ly * TS];
    let out = parkBgA(GY, { sun: false }) + topBadge();
    const open = prog(t, c0 + 2.6, 1.2);
    out += mapleBig(TX, GY, TS, t, { open });
    // 下から見上げる
    const eO = win(t, c0 + 0.8, c1 + 1.0, 0.4);
    if (eO > 0) { const [ax, ay] = tp(120, -70), [bx, by] = tp(70, -200); out += g(g(eyeIcon(0.36), { x: ax + 24, y: ay + 36 }) + arrow2(ax + 6, ay - 18, bx, by, C.ink, 9), { o: eO }); }
    // お日さま
    const rO = prog(t, c1 + 0.2, 0.5);
    out += sunRays(930, 170, 56, [tp(215, -445), tp(300, -330), tp(110, -560)], t, rO);
    const lblO = win(t, c1 + 1.0, c3 - 0.3, 0.3), lblO2 = win(t, c1 + 4.0, c3 - 0.3, 0.3);
    { const [ox, oy] = tp(250, -350), [ix, iy] = tp(36, -250);
      out += callout(ox, oy, 905, 380, 'そとがわ：あかい', lblO, { col: AU.red, size: 42 });
      out += callout(ix, iy, 905, 705, 'うちがわ：みどりの まま', lblO2, { col: AU.greenDk, size: 42 }); }
    out += kidShow('B', t, 1570, 846, { s: 0.5, start: c2 - 0.9, n: 0, side: 'left', end: c3 - 0.2 });
    // 木につける小さな名札
    const nO = prog(t, c3 - 0.1, 0.4);
    { const [ox, oy] = tp(0, -525), [ix, iy] = tp(0, -262); out += g(badge('そとがわ', { fill: AU.redDk, size: 30 }), { x: ox, y: oy, o: nO }) + g(badge('うちがわ', { fill: AU.greenDk, size: 30 }), { x: ix, y: iy, o: nO }); }
    // 右のカード
    const PX = 1470, cardO = prog(t, c3 - 0.2, 0.4);
    out += g(g(card(790, 610), { x: PX, y: 505 }), { o: cardO });
    // 光の量をくらべる
    const barO = cardO * (1 - prog(t, c4 - 0.4, 0.3));
    if (barO > 0) {
      const g1 = eo(prog(t, c3 + 2.6, 1.4)), g2 = eo(prog(t, c3 + 4.4, 0.6)), W = 640;
      let b = ctext(PX, 262, 'あたる ひの ひかりを くらべると', { size: 40, w: 900 });
      b += text(1130, 345, 'そとがわ', { size: 40, w: 900, fill: AU.redDk, anchor: 'start' }) + `<rect x="1130" y="378" width="${W}" height="56" rx="10" fill="${C.line}" opacity="0.5"/><rect x="1130" y="378" width="${Math.max(1, W * g1)}" height="56" rx="10" fill="${AU.sun}"/>`;
      b += text(1130, 495, 'うちがわ', { size: 40, w: 900, fill: AU.greenDk, anchor: 'start' }) + `<rect x="1130" y="528" width="${W}" height="56" rx="10" fill="${C.line}" opacity="0.5"/><rect x="1130" y="528" width="${Math.max(1, W / 14.2 * g2)}" height="56" rx="10" fill="${AU.sun}"/>`;
      b += pop(ctext(0, 0, '14ばい あまり', { size: 78, w: 900, fill: AU.red }), t, cueE(3) - 2.6, PX, 668);
      b += ctext(PX, 762, 'しらべた き：ハウチワカエデ', { size: 30, w: 700, fill: C.muted });
      out += g(b, { o: barO });
    }
    // 日の当たる葉っぱ：光で糖を作りつづける → 糖から赤い色
    const sgO = prog(t, c4 - 0.1, 0.4);
    if (sgO > 0) {
      const rk = eio(prog(t, c5 + 1.0, 3.6)), LX = 1500, LY = 700, LS = 2.1;
      let s = g(ctext(PX, 262, 'ひの あたる はっぱ', { size: 40, w: 900 }), { o: 1 - prog(t, c5 - 0.2, 0.3) }) + g(ctext(PX, 262, 'とうを つかって、あかい いろが できる', { size: 38, w: 900, fill: AU.redDk }), { o: prog(t, c5 + 0.1, 0.3) });
      s += sunRays(1180, 380, 40, [[LX - 90, LY - 250], [LX - 50, LY - 300]], t, 1, 7);
      s += mapleLeaf(LX, LY, LS, 0, leafCol(0.2 * (1 - rk), 0.68 + 0.32 * rk));
      const HP = [[-36, -100], [36, -100], [0, -66], [46, -62], [0, -132]];
      HP.forEach(([hx, hy], i) => {
        const st = c4 + 3.0 + i * 0.5, k = back(prog(t, st, 0.4)), tr = prog(t, c5 + 1.2 + i * 0.6, 0.5), x = LX + hx * LS, y = LY + hy * LS;
        s += sugarHex(x, y, Math.max(k, 0.001) * 1.15, (k > 0 ? 1 : 0) * (1 - tr));
        if (tr > 0) s += `<circle cx="${x}" cy="${y}" r="${20 * back(tr)}" fill="${AU.redDk}" stroke="#fff" stroke-width="4"/>`;
      });
      const [h0x, h0y] = [LX + 46 * LS, LY - 62 * LS];
      s += tag(h0x + 14, h0y - 8, 1745, 380, 'とう', win(t, c4 + 3.6, c5 + 1.0, 0.3), { col: C.ochre, size: 40 });
      s += tag(h0x + 14, h0y - 8, 1730, 380, 'あかい いろ', prog(t, c5 + 3.4, 0.4), { col: AU.redDk, size: 36 });
      s += g(ctext(PX, 766, 'と かんがえられて いる', { size: 32, w: 700, fill: C.muted }), { o: prog(t, c5 + 3.8, 0.4) });
      out += g(s, { o: sgO });
    }
    return out;
  },
});

// 7. どうして赤くするのかは、まだわかっていない（日がさの考え・虫に伝える考え）
SCENES.push({
  id: 'why',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'どうして わざわざ あかく するの？', { size: 56, w: 900 }), t, c0 + 0.2, 800, 162);
    const A = 1 - prog(t, c2 - 0.5, 0.4);
    if (A > 0) {
      let a = mapleLeaf(960, 640, 2.1, 0, AU.red) + g(text(0, 0, '？', { size: 190, w: 900, fill: C.ochre }), { x: 1260, y: 380, o: prog(t, c0 + 1.0, 0.3) });
      a += pop(badge('まだ わかって いない', { fill: C.redUi, size: 64, pad: 50 }), t, c1 + 0.9, 960, 740);
      out += g(a, { o: A });
    }
    const B = prog(t, c2 - 0.2, 0.4);
    if (B > 0) {
      let b = pop(badge('まだ わかって いない', { fill: C.redUi, size: 34 }), t, c2 - 0.1, 1570, 162);
      // かんがえ ①：日がさ
      const X1 = 500, Y = 480;
      let k1 = card(770, 480) + g(badge('かんがえ ①', { fill: C.blueUi, size: 38 }), { x: 0, y: -240 });
      k1 += mapleLeaf(90, 150, 1.05, 0, AU.red);
      const um = back(prog(t, c2 + 2.0, 0.5));
      // 強い光（日がさが開く前は葉っぱまで とどく）
      const uk = clamp(um);
      [[-232, -128, 62, 30, 4, -104], [-244, -100, 40, 84, -14, -70], [-226, -156, 104, -4, 48, -142]].forEach(([x1, y1, lx, ly, px, py], i) => {
        k1 += `<line x1="${x1}" y1="${y1}" x2="${lerp(lx, px, uk)}" y2="${lerp(ly, py, uk)}" stroke="${AU.sun}" stroke-width="13" stroke-linecap="round" stroke-dasharray="30 18" stroke-dashoffset="${-t * 80 - i * 11}"/>`;
      });
      k1 += sunDisc(-282, -142, 40, 0, { glow: 0.7 });
      if (um > 0) k1 += parasol(90, -62, Math.max(um, 0.001) * 1.25, AU.redLt);
      k1 += ctext(0, 196, 'ひがさの ように、つよい ひかりから まもる', { size: 34, w: 900 });
      b += pop(k1, t, c2 + 0.2, X1, Y);
      // かんがえ ②：虫に伝える
      const X2 = 1420;
      let k2 = card(770, 480) + g(badge('かんがえ ②', { fill: C.accent, size: 38 }), { x: 0, y: -240 });
      k2 += mapleLeaf(-210, 150, 1.05, 0, AU.red);
      // 立て札
      const sg = back(prog(t, c3 + 3.0, 0.45));
      if (sg > 0) k2 += g(`<rect x="-7" y="0" width="14" height="92" fill="${AU.trunk}"/><rect x="-190" y="-86" width="380" height="96" rx="14" fill="#fff" stroke="${AU.trunkDk}" stroke-width="6"/>` + ctext(0, -38, 'きても いい こと ないよ', { size: 30, w: 900, fill: AU.redDk }), { x: -60, y: -110, s: Math.max(sg, 0.001) });
      // 虫：右から来て、立て札を見て、右へ帰る
      const inK = eio(prog(t, c3 + 1.0, 2.0)), outK = eio(prog(t, c3 + 4.6, 1.8));
      const bx = lerp(lerp(320, 150, inK), 290, outK), dir = outK > 0.02 ? 1 : -1;
      k2 += bugIcon(bx, 90, 1.0, dir, (inK < 1 || (outK > 0 && outK < 1)) ? t : 0);
      k2 += g(ctext(0, 0, 'アブラムシの ような むし', { size: 26, w: 700, fill: C.muted }), { x: 205, y: 146, o: prog(t, c3 + 1.6, 0.4) });
      { const cp = 'むしに「きても いい こと ないよ」と つたえる'; k2 += ctext(0, 196, cp, { size: fit(cp, 710, 32, 900), w: 900 }); }
      b += pop(k2, t, c3 + 0.2, X2, Y);
      // いまも調べているところ
      b += pop(badge('いまも しらべて いる ところ', { fill: C.ink, size: 44 }), t, c4 + 1.0, 500, 782);
      b += kidShow('K', t, 950, 842, { s: 0.42, start: c4 + 0.3, n: 0, enter: 'pop', bubble: false });
      out += g(b, { o: B });
    }
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -590, ans = 'はじめから はっぱの なかに あって、みどりに かくれて いた';
      let a = pop(card(1360, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.accent}"/>` + text(NX, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, ans, { size: fit(ans, 1130, 44, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['みどりが へる', AU.greenDk], ['かくれて いた きいろが みえる', AU.yellowDk], ['モミジは あかを つくる', AU.red]], t, 960, 600, { start: 2.6, step: 1.2, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [g(eyeIcon(0.3)), 'あかい モミジの したから、そっと みあげる', C.ink, cue(1)],
        [qm, 'そとがわと うちがわ、どっちが あかい？', C.ink, cue(2)],
        [qm, 'よそうしてから、くらべて みよう', C.ink, cue(2) + 3.6],
        [mapleLeaf(-14, 24, 0.24, -10, AU.red) + ginkgoLeaf(18, 26, 0.36, 10, AU.yellow), 'モミジと イチョウを 1まいずつ ならべる', C.ink, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'ひろった はっぱは くちに いれない', C.red, cue(4)],
        [g(warnIcon, { s: 0.62 }), 'きに のぼらない・えだを おらない', C.red, cue(4) + 4.2],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: 38, w: 900, anchor: 'start', fill: col }), t, st, 150, 300 + i * 88); });
      // 木を下から見上げる
      const TX = 1520, TY = 560, TS = 0.6;
      b += pop(g(mapleBig(0, 0, TS, t, { open: 1 })), t, cue(1) + 0.4, TX, TY);
      b += tag(TX + 150, TY - 250, TX + 235, TY - 330, 'そとがわ', prog(t, cue(2) + 0.3, 0.3), { col: AU.redDk, size: 32 });
      b += tag(TX + 20, TY - 150, TX - 250, TY - 70, 'うちがわ', prog(t, cue(2) + 1.0, 0.3), { col: AU.greenDk, size: 32 });
      // 2まい ならべる
      b += pop(mapleLeaf(-110, 80, 0.95, -8, AU.red) + ginkgoLeaf(110, 80, 1.35, 8, AU.yellow), t, cue(3) + 0.4, 1520, 720);
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

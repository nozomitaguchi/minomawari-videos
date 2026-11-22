
// みのまわり図鑑 動画「さむい とき、ゆげや しろい いきが みえるのは なぜ？」（ゆげと しろい いき）
// 出どころ：everyday-trivia trivia/steam-white-breath.md（絵の見本：assets/figures-steam.js、メモ：ideas/notes/white-breath-steam.md）
// 色の約束：すいじょうき（見えない気体）＝みずいろの小さな輪、みずの つぶ＝あおい丸、白い湯気・息＝しろいもや（灰色のふち）、あたたかい＝オレンジ、つめたい＝あお。

// ---------- 道具 ----------
const WB = {
  vapor: '#6fb3dc', drop: '#2f7fd0', dropLt: '#7fb8ea', puffLn: '#9aa5a9', warm: '#f08a2e', warmDk: '#c96a14', warmLt: '#fde3c4', cold: '#4f8fd0', coldDk: '#2f6bb0', coldLt: '#d9e9f7',
  metal: '#b9c2c6', metalDk: '#8c979b', wall: '#fbf1de', counter: '#d9c7a8', counterDk: '#c4b08c', skyT: '#86b9e0', skyB: '#cfe4f2', snow: '#eef4f8', snowDk: '#b4cddd', light: '#f6c21a',
};
const rad = a => a * Math.PI / 180;
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（指す点が x, y。ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 42 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const skyG = (id, top, bot, { x = 0, y = 0, w = 1920, h = 1080 } = {}) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 16 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
// しろい もや（丸をかさねた雲。灰色のふち）
function puff(x, y, r = 40, o = 1) {
  if (o <= 0.01 || r <= 0.5) return '';
  const cs = [[0, 0, 1], [-0.8, 0.25, 0.7], [0.8, 0.2, 0.75], [-0.3, -0.45, 0.7], [0.4, -0.4, 0.65]];
  const circ = cs.map(([dx, dy, k]) => `<circle cx="${(x + dx * r).toFixed(1)}" cy="${(y + dy * r).toFixed(1)}" r="${(k * r).toFixed(1)}"/>`).join('');
  return `<g opacity="${o.toFixed(2)}"><g fill="none" stroke="${WB.puffLn}" stroke-width="${Math.max(3, r * 0.09).toFixed(1)}">${circ}</g><g fill="#fff">${circ}</g></g>`;
}
// すいじょうき（見えない気体）＝ 小さな輪
const ring = (x, y, r = 9, o = 1, col = WB.vapor) => o <= 0 ? '' : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="none" stroke="${col}" stroke-width="${Math.max(2.5, r * 0.32)}" opacity="${o.toFixed(2)}"/>`;
// みずの つぶ（液体）＝ あおい丸
const dot = (x, y, r = 9, o = 1, col = WB.drop) => o <= 0 ? '' : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${col}" opacity="${o.toFixed(2)}"/><circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${r * 0.3}" fill="#fff" opacity="${(0.7 * o).toFixed(2)}"/>`;
// やかん（口は右むき）。(x, y) は底のまん中。口の先は (x + 65s, y − 64s)
const kettle = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M -26 -56 Q -30 -92 0 -94 Q 30 -92 26 -56" fill="none" stroke="${C.ink}" stroke-width="${10 / s + 5}" stroke-linecap="round"/><path d="M -26 -56 Q -30 -92 0 -94 Q 30 -92 26 -56" fill="none" stroke="#5b4636" stroke-width="5" stroke-linecap="round"/>
  <path d="M 28 -34 L 62 -66 L 68 -62 L 40 -24 Z" fill="${WB.metal}" stroke="${C.ink}" stroke-width="${6 / s}" stroke-linejoin="round"/>
  <path d="M -40 0 Q -46 -40 -24 -54 H 24 Q 46 -40 40 0 Z" fill="${WB.metal}" stroke="${C.ink}" stroke-width="${6 / s}" stroke-linejoin="round"/>
  <path d="M -24 -54 Q 0 -64 24 -54 Z" fill="${WB.metalDk}" stroke="${C.ink}" stroke-width="${5 / s}" stroke-linejoin="round"/><circle cx="0" cy="-62" r="5" fill="#5b4636" stroke="${C.ink}" stroke-width="${4 / s}"/>
  <path d="M -30 -18 Q -34 -36 -22 -44" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.75"/></g>`;
// こんろ（火つき）。(x, y) は上の面のまん中
function stove(x, y, w, t) {
  let s = '';
  for (let i = 0; i < 5; i++) { const fx = x - w * 0.24 + i * w * 0.12, h = 20 + 9 * Math.sin(t * 9 + i * 1.7); s += `<path d="M ${fx - 9} ${y} Q ${fx - 12} ${y - h * 0.5} ${fx} ${y - h} Q ${fx + 12} ${y - h * 0.5} ${fx + 9} ${y} Z" fill="${WB.warm}"/><path d="M ${fx - 4} ${y} Q ${fx - 5} ${y - h * 0.3} ${fx} ${y - h * 0.55} Q ${fx + 5} ${y - h * 0.3} ${fx + 4} ${y} Z" fill="#ffd86a"/>`; }
  return s + `<rect x="${x - w / 2}" y="${y}" width="${w}" height="34" rx="8" fill="#8f9aa3" stroke="${C.ink}" stroke-width="6"/><rect x="${x - w * 0.36}" y="${y - 8}" width="${w * 0.72}" height="10" rx="3" fill="${C.ink}"/>`;
}
// やかんの湯気。口の先 (x, y) から dir（度。0=右、−90=上）へのぼる。gap: 口のすぐ上の透明なすきまの長さ、len: 白い所の長さ
function steam(x, y, t, { gap = 60, len = 320, dir = -62, n = 7, r0 = 16, r1 = 62, o = 1, rings = true, sp = 0.32, seed = 1 } = {}) {
  if (o <= 0) return '';
  const cx = Math.cos(rad(dir)), cy = Math.sin(rad(dir));
  let s = '';
  for (let i = 0; i < n; i++) {
    const f = ((t * sp + i / n) % 1 + 1) % 1, d = gap + f * len, wob = Math.sin(t * 1.6 + i * 2.1 + seed) * (10 + f * 26);
    s += puff(x + cx * d - cy * wob, y + cy * d + cx * wob - f * f * 30, lerp(r0, r1, f), Math.min(1, f * 7) * Math.pow(1 - f, 0.7));
  }
  if (rings && gap > 20) for (let i = 0; i < 5; i++) { const f = ((t * sp * 2.2 + i / 5) % 1 + 1) % 1, d = f * gap, wob = Math.sin(t * 3 + i * 1.9) * 6; s += ring(x + cx * d - cy * wob, y + cy * d + cx * wob, Math.max(5, r0 * 0.36), 0.95); }
  return `<g opacity="${o}">${s}</g>`;
}
// ルーペでのぞいた丸（柄は右下）
const lens = (x, y, r, inner, { fill = '#fff', id = 'ln' } = {}) => `<path d="M ${x + r * 0.72} ${y + r * 0.72} l ${r * 0.42} ${r * 0.42}" stroke="${C.ochre}" stroke-width="${r * 0.16}" stroke-linecap="round"/><clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r - 4}"/></clipPath><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/><g clip-path="url(#${id})">${inner}</g><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.blueUi}" stroke-width="${Math.max(8, r * 0.07)}"/>`;
// 丸の中に、輪（すいじょうき）と つぶ（みず）をちらす。k: つぶになった割合 0〜1（番号の小さいものから つぶになる）
function specks(x, y, r, n, t, { k = 0, seed = 1, rr = 12, o = 1, drift = 1 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = rnd(i, seed) * Math.PI * 2, d = Math.sqrt(rnd(i, seed + 1)) * (r - rr - 8);
    const px = x + Math.cos(a) * d + Math.sin(t * 1.3 + i * 1.7) * 7 * drift, py = y + Math.sin(a) * d + Math.cos(t * 1.1 + i * 2.3) * 7 * drift;
    const kk = clamp(k * n - i);
    s += kk < 1 ? ring(px, py, rr, o * (1 - kk)) : '';
    s += kk > 0 ? dot(px, py, rr * (0.6 + 0.4 * kk), o * kk) : '';
  }
  return s;
}
// 口から出る白い息（右ななめ上へ）。(x, y) は口。breath: 息をはいている強さ 0〜1
function breathPuffs(x, y, t, { o = 1, n = 6, len = 300, dir = -18, r0 = 14, r1 = 64, sp = 0.45 } = {}) {
  if (o <= 0) return '';
  const cx = Math.cos(rad(dir)), cy = Math.sin(rad(dir));
  let s = '';
  for (let i = 0; i < n; i++) { const f = ((t * sp + i / n) % 1 + 1) % 1, d = 16 + f * len, wob = Math.sin(t * 1.4 + i * 2.3) * f * 24; s += puff(x + cx * d - cy * wob, y + cy * d + cx * wob, lerp(r0, r1, f), Math.min(1, f * 8) * Math.pow(1 - f, 0.8)); }
  return `<g opacity="${o}">${s}</g>`;
}
// 冬の外（うすい空、白い地面、葉のない木）
function winterBg(id, gy = 800) {
  let s = skyG(id, WB.skyT, WB.skyB, { h: gy }) + `<circle cx="1640" cy="210" r="70" fill="#fff6d0" opacity="0.9"/><circle cx="1640" cy="210" r="120" fill="#fff6d0" opacity="0.25"/>`;
  s += `<path d="M 0 ${gy - 60} Q 300 ${gy - 150} 620 ${gy - 60} T 1240 ${gy - 70} T 1920 ${gy - 80} L 1920 ${gy} L 0 ${gy} Z" fill="${WB.snowDk}"/>`;
  s += `<rect x="0" y="${gy}" width="1920" height="${1080 - gy}" fill="${WB.snow}"/><rect x="0" y="${gy}" width="1920" height="10" fill="${WB.snowDk}"/>`;
  return s;
}
const bareTree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="#8a6f57" stroke-linecap="round"><path d="M 0 0 V -150" stroke-width="18"/><path d="M 0 -90 L -60 -160 M 0 -120 L 56 -190 M 0 -150 L -30 -230 M 0 -150 L 34 -236 M -60 -160 L -96 -180 M 56 -190 L 92 -200" stroke-width="10"/></g>`;
// 部屋（あたたかい色のかべと、台）
const roomBg = (gy = 800) => `<rect width="1920" height="1080" fill="${WB.wall}"/><rect x="0" y="${gy}" width="1920" height="${1080 - gy}" fill="${WB.counter}"/><rect x="0" y="${gy}" width="1920" height="14" fill="${WB.counterDk}"/>`;

// 1. つかみ：寒い朝の白い息。やかんの湯気も白い
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3);
    let out = winterBg('hsky', 810) + house(1560, 812, 2.0, '#e9dcc6', '#9a6a55') + `<path d="M 1396 664 L 1560 528 L 1724 664 L 1700 664 L 1560 548 L 1420 664 Z" fill="#fff"/>` + bareTree(1180, 812, 1.5) + bareTree(980, 800, 0.9);
    // おとうとが「はー」
    const BX = 520, BY = 836, BS = 0.6, mx = BX + 26, my = BY - 242 * BS;
    const tB = c0 + d0 * 0.38, bo = win(t, tB, c2 + 0.4, 0.5) + prog(t, c3 - 0.3, 0.5);
    out += breathPuffs(mx, my, t, { o: clamp(bo), len: 360, dir: -14, r1: 74 });
    out += kidShow('S', t, 250, 836, { s: 0.56, start: 0, n: 1, bubble: false, look: [8, -2], eyes: t > tB && t < tB + 2 ? 'wide' : 'open' });
    out += kidShow('B', t, BX, BY, { s: BS, start: 0, n: 0, mouth: t > tB ? 'o' : null });
    out += pop(big(0, 0, 'はー', 110, WB.coldDk), t, tB, 760, 480, { end: c1 - 0.1, d: 0.3 });
    // やかんの湯気
    const ko = win(t, c2 - 0.2, c3 + 0.2, 0.4);
    if (ko > 0) {
      let k = `<clipPath id="hkc"><rect x="-380" y="-290" width="760" height="580" rx="32"/></clipPath><rect x="-380" y="-290" width="760" height="580" rx="32" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#hkc)"><rect x="-380" y="-290" width="760" height="580" fill="${WB.wall}"/><rect x="-380" y="200" width="760" height="90" fill="${WB.counter}"/>`;
      k += stove(-80, 166, 380, t) + kettle(-80, 158, 3.3) + steam(-80 + 65 * 3.3, 158 - 64 * 3.3, t, { gap: 46, len: 250, dir: -64, r1: 60 }) + `</g>`;
      k += g(badge('やかんの ゆげ', { fill: C.ochre, size: 42 }), { x: -180, y: -290 });
      out += g(k, { x: 1400, y: 430, o: ko, s: lerp(0.92, 1, eo(ko)) });
    }
    // しろい ものの しょうたいは？
    out += pop(card(840, 300) + puff(-280, 10, 70, 1) + text(90, -56, 'この しろい もの、', { size: 56, w: 900 }) + text(40, 40, 'なんだろう', { size: 56, w: 900, fill: WB.coldDk }) + text(300, 30, '？', { size: 130, w: 900, fill: C.ochre }), t, c3 + 0.6, 1380, 400, { end: cueE(3) + 0.6 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="100" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">さむい とき、<tspan fill="${C.ochre}">ゆげ</tspan>や <tspan fill="${WB.coldDk}">しろい いき</tspan>が</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="118" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">みえるのは なぜ？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(puff(-150, 0, 56, 1) + puff(0, -14, 70, 1) + puff(150, 0, 56, 1), t, t0 + 1.8, 960, 810);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'しろい ものの しょうたいは？', { size: 80, w: 900 }), t, 0.3, 960, 220);
    const opts = [['①', 'けむり'], ['②', 'みずが きたいに なった「すいじょうき」'], ['③', 'とても ちいさな みずの つぶ']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 900, 400 + i * 168);
    });
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 白いものの正体：水蒸気は見えない。白いのは、冷えてできた小さな水のつぶ。つぶは光をちらす
SCENES.push({
  id: 'vapor',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    let out = roomBg(800);
    const KX = 300, KY = 770, KS = 3.6, sx = KX + 65 * KS, sy = KY - 64 * KS;
    out += stove(KX, KY + 6, 420, t) + kettle(KX, KY, KS) + steam(sx, sy, t, { gap: 64, len: 330, dir: -66, r1: 70 });
    out += topBadge();
    const AX = 1060, BX = 1600, LY = 400, R = 180;
    // すいじょうき（気体）
    const aO = prog(t, c0 + 0.8, 0.4);
    if (aO > 0) {
      let a = `<line x1="${sx + 16}" y1="${sy - 30}" x2="${AX - R}" y2="${LY + 40}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/><circle cx="${sx + 14}" cy="${sy - 30}" r="34" fill="none" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="12 8"/>`;
      let inn = `<rect x="${AX - R}" y="${LY - R}" width="${R * 2}" height="${R * 2}" fill="#f4fafd"/>` + specks(AX, LY, R, 16, t, { k: 0, seed: 3, rr: 15 });
      // 光は まっすぐ 通りぬける
      const lo = prog(t, c3 + 0.3, 0.4);
      if (lo > 0) for (let i = 0; i < 3; i++) { const y = LY - 70 + i * 70, f = ((t - c3) * 0.7 + i * 0.3) % 1; inn += `<line x1="${AX - R}" y1="${y}" x2="${AX + R}" y2="${y}" stroke="${WB.light}" stroke-width="10" opacity="${0.5 * lo}"/><circle cx="${AX - R + f * R * 2}" cy="${y}" r="11" fill="${WB.light}" opacity="${lo}"/>`; }
      a += lens(AX, LY, R, inn, { id: 'vla' });
      a += g(badge('すいじょうき', { fill: WB.vapor, size: 46, pad: 38 }), { x: AX, y: 640 });
      out += g(a, { o: aO });
      out += pop(badge('めに みえない', { fill: C.ink, size: 40 }), t, c1 + 0.5, AX, 720, { end: c3 - 0.1 });
      out += g(text(AX, 782, '（えでは、わで かいています）', { size: 28, w: 700, fill: C.muted }), { o: win(t, c1 + 0.9, c3 - 0.1, 0.3) });
      out += pop(badge('ひかりが とおりぬける', { fill: '#b98a00', size: 36 }), t, c3 + 0.6, AX, 720);
    }
    // 小さな 水のつぶ
    const bO = prog(t, c2 + 0.3, 0.4);
    if (bO > 0) {
      const px = sx + Math.cos(rad(-66)) * 250, py = sy + Math.sin(rad(-66)) * 250;
      let b = `<path d="M ${px + 40} ${py - 30} Q ${AX} ${LY - R - 150} ${BX - R * 0.6} ${LY - R * 0.8}" fill="none" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/><circle cx="${px}" cy="${py}" r="56" fill="none" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="12 8"/>`;
      let inn = `<rect x="${BX - R}" y="${LY - R}" width="${R * 2}" height="${R * 2}" fill="#f1f4f6"/>` + specks(BX, LY, R, 22, t, { k: 1, seed: 7, rr: 15 });
      // つぶが 光を あちこちへ ちらす
      const lo = prog(t, c3 + d3 * 0.35, 0.4);
      if (lo > 0) {
        for (let i = 0; i < 3; i++) { const y = LY - 70 + i * 70; inn += `<line x1="${BX - R}" y1="${y}" x2="${BX - 60 + i * 26}" y2="${y}" stroke="${WB.light}" stroke-width="10" opacity="${0.55 * lo}"/>`; }
        for (let i = 0; i < 9; i++) { const q = i / 9 * Math.PI * 2 + 0.3, f = ((t - c3) * 0.9 + rnd(i, 4)) % 1, ox = BX - 40 + (i % 3) * 30, oy = LY - 60 + (i % 3) * 62; inn += `<line x1="${ox + Math.cos(q) * (14 + f * 60)}" y1="${oy + Math.sin(q) * (14 + f * 60)}" x2="${ox + Math.cos(q) * (40 + f * 60)}" y2="${oy + Math.sin(q) * (40 + f * 60)}" stroke="${WB.light}" stroke-width="8" stroke-linecap="round" opacity="${lo * (1 - f)}"/>`; }
      }
      b += lens(BX, LY, R, inn, { id: 'vlb' });
      b += g(badge('ちいさな みずの つぶ', { fill: WB.drop, size: 46, pad: 38 }), { x: BX, y: 640 });
      out += g(b, { o: bO });
      out += g(arrow2(AX + R + 24, LY, BX - R - 24, LY, WB.cold, 14) + text((AX + BX) / 2, LY - 46, 'ひえる', { size: 40, w: 900, fill: WB.coldDk }), { o: prog(t, c2 + d2 * 0.3, 0.4) });
      out += pop(badge('しろく みえる', { fill: C.ink, size: 40 }), t, c2 + d2 * 0.6, BX, 720, { end: c3 - 0.1 });
      out += pop(badge('ひかりを あちこちへ ちらす', { fill: '#b98a00', size: 36 }), t, c3 + d3 * 0.4, BX, 720);
    }
    return out;
  },
});

// 4. やかんの口のすぐ上は透明：そこは まだ冷えていない水蒸気。少しはなれて冷えると 白くなる
SCENES.push({
  id: 'gap',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3);
    let out = roomBg(800);
    const KX = 300, KY = 800, KS = 4.4, sx = KX + 65 * KS, sy = KY - 64 * KS, DIR = -34, GAP = 190;
    const ux = Math.cos(rad(DIR)), uy = Math.sin(rad(DIR));
    out += stove(KX, KY + 6, 500, t) + kettle(KX, KY, KS) + steam(sx, sy, t, { gap: GAP, len: 470, dir: DIR, r0: 26, r1: 104, n: 8, sp: 0.26 });
    out += topBadge();
    // とうめいな すきま
    const go = prog(t, c0 + d0 * 0.55, 0.4), pk = 0.6 + 0.4 * Math.sin(t * 5);
    const gx = sx + ux * GAP * 0.5, gy = sy + uy * GAP * 0.5;
    out += g(`<ellipse cx="${gx}" cy="${gy}" rx="${GAP * 0.56}" ry="62" fill="none" stroke="${C.redUi}" stroke-width="8" stroke-dasharray="20 12" opacity="${pk}" transform="rotate(${DIR} ${gx} ${gy})"/>`, { o: go * (1 - prog(t, c2 + 0.2, 0.4)) });
    out += tag(gx - 20, gy - 56, 520, 230, 'とうめいな すきま', go, { col: C.redUi, size: 50 });
    out += tag(gx + 20, gy + 30, 960, 650, 'まだ ひえていない すいじょうき', prog(t, c1 + 0.4, 0.3), { col: '#3f8fc0', size: 44 });
    // 少しはなれて、冷えると
    const wx = sx + ux * (GAP + 250), wy = sy + uy * (GAP + 250);
    out += tag(wx + 50, wy + 46, 1490, 320, 'ひえて、みずの つぶに', prog(t, c2 + 0.5, 0.3), { col: WB.drop, size: 46 });
    out += pop(badge('しろく みえる', { fill: C.ink, size: 44 }), t, c2 + d2 * 0.55, 1490, 410);
    // 注意
    out += pop(badge('ゆげは あつい。ちかづかない', { fill: C.red, size: 40 }) + g(warnIcon(0.72), { x: -(tw('ゆげは あつい。ちかづかない', 40, 700, 0.04) / 2 + 84), y: -4 }), t, c0 + 1.0, 1320, 770);
    out += kidShow('S', t, 1740, 850, { s: 0.5, start: c3 - 0.9, n: 0, look: [-8, -6] });
    return out;
  },
});

// 5. 空気がもてる水蒸気の量は、温度で決まる。冷やされると、もちきれない分が 水のつぶになる。雲も同じ
SCENES.push({
  id: 'hold',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうして ひえると、つぶに なる？', { size: 64, w: 900 }), t, c0 + 0.3, 960, 190, { end: c1 - 0.2 });
    // 棒グラフ：1立方メートルの空気がもてる水蒸気（0・10・20・30度）
    const BASE = 690, V = [[0, 4.85], [10, 9.4], [20, 17.3], [30, 30.4]], PX = 13, BW = 170;
    const co = prog(t, c1 - 0.1, 0.4);
    if (co > 0) {
      let c = pop(text(0, 0, 'くうきが もてる すいじょうきの りょう', { size: 50, w: 900 }), t, c1 + 0.2, 580, 170);
      c += `<line x1="150" y1="${BASE}" x2="1010" y2="${BASE}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
      V.forEach(([deg, v], i) => {
        const x = 270 + i * 210, st = c1 + d1 * 0.45 + i * 0.5, k = eo(prog(t, st, 0.7)), h = v * PX * k, col = mix(WB.cold, WB.warm, i / 3), lt = mix(WB.coldLt, WB.warmLt, i / 3);
        if (k > 0) {
          c += `<rect x="${x - BW / 2}" y="${BASE - h}" width="${BW}" height="${h}" rx="12" fill="${lt}" stroke="${col}" stroke-width="8"/>`;
          const n = Math.round(v / 1.6);
          for (let j = 0; j < n; j++) { const rx = x - BW / 2 + 28 + (j % 4) * 38 + (Math.floor(j / 4) % 2) * 10, ry = BASE - 26 - Math.floor(j / 4) * 84 * (v * PX - 40) / Math.max(84, Math.ceil(n / 4) * 84 - 60) - (j % 4) * 6; if (ry > BASE - h + 16) c += ring(rx + Math.sin(t * 1.4 + j) * 4, ry + Math.cos(t * 1.2 + j * 1.7) * 4, 12, 1); }
          c += g(text(x, BASE - v * PX - 34, `${v}グラム`, { size: 34, w: 900, fill: mix(col, '#000', 0.25), ls: 0 }), { o: prog(t, st + 0.5, 0.3) });
        }
        c += g(text(x, BASE + 44, `${deg}ど`, { size: 44, w: 900, fill: mix(col, '#000', 0.2) }), { o: prog(t, c1 + 0.6 + i * 0.15, 0.3) });
      });
      c += pop(badge('つめたい', { fill: WB.cold, size: 38 }), t, c2 + d2 * 0.55, 270, BASE + 106) + pop(badge('あたたかい', { fill: WB.warm, size: 38 }), t, c2 + 0.3, 900, BASE + 106);
      c += pop(badge('すこししか もてない', { fill: WB.coldDk, size: 36 }), t, c2 + d2 * 0.6, 290, 470, { end: c3 - 0.1 }) + pop(badge('たくさん もてる', { fill: WB.warmDk, size: 36 }), t, c2 + 0.5, 610, 320, { end: c3 - 0.1 });
      out += g(c, { o: co * (1 - prog(t, c4 - 0.4, 0.4)) });
    }
    // 冷やされると：はこ（空気）が もてる量がへって、もちきれない分が つぶになる
    const ro = prog(t, c3 - 0.1, 0.4) * (1 - prog(t, c4 - 0.4, 0.4));
    if (ro > 0) {
      const X = 1500, Y0 = 240, W = 420, H = 440, cool = eio(prog(t, c3 + d3 * 0.22, 1.8)), cap = lerp(1, 0.34, cool), col = mix(WB.warm, WB.cold, cool), lt = mix(WB.warmLt, WB.coldLt, cool);
      let r = `<rect x="${X - W / 2}" y="${Y0}" width="${W}" height="${H}" rx="22" fill="${lt}" stroke="${col}" stroke-width="10"/>`;
      r += g(badge(cool < 0.5 ? 'あたたかい くうき' : 'つめたい くうき', { fill: col, size: 38 }), { x: X, y: Y0 });
      // もてる量の線（下から cap ぶんまで）
      const ly = Y0 + H - (H - 50) * cap;
      r += `<line x1="${X - W / 2 + 10}" y1="${ly}" x2="${X + W / 2 - 10}" y2="${ly}" stroke="${col}" stroke-width="6" stroke-dasharray="16 10"/>` + text(X - W / 2 - 44, ly + 2, 'ここまで もてる', { size: 32, w: 900, fill: mix(col, '#000', 0.25), anchor: 'end' }) + `<path d="M ${X - W / 2 - 34} ${ly} h 22 m -10 -9 l 10 9 l -10 9" fill="none" stroke="${mix(col, '#000', 0.25)}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      for (let j = 0; j < 20; j++) {
        const px = X - W / 2 + 56 + (j % 5) * 77 + (Math.floor(j / 5) % 2) * 16, py = Y0 + H - 44 - Math.floor(j / 5) * 92;
        const over = py < ly + 6, kk = over ? clamp((cool - 0.25) * 2.2 - (j % 5) * 0.1) : 0;
        r += kk < 1 ? ring(px + Math.sin(t * 1.4 + j) * 5, py + Math.cos(t * 1.2 + j * 1.7) * 5, 15, 1 - kk) : '';
        r += kk > 0 ? dot(px, py, 15 * (0.6 + 0.4 * kk), kk) : '';
      }
      out += g(r, { o: ro });
      out += pop(badge('ひやされると…', { fill: WB.cold, size: 40 }), t, c3 + 0.3, 1500, 745, { end: c3 + d3 * 0.5 });
      out += pop(badge('もちきれない ぶんが、みずの つぶに', { fill: WB.drop, size: 38 }), t, c3 + d3 * 0.52, 1500, 745, { end: c4 - 0.3 });
    }
    // 雲も同じ
    const so = prog(t, c4 - 0.2, 0.5);
    if (so > 0) {
      let f = `<clipPath id="hcl"><rect x="-700" y="-300" width="1400" height="600" rx="36"/></clipPath><rect x="-700" y="-300" width="1400" height="600" rx="36" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#hcl)">` + skyG('hcsky', '#6fb1e6', '#d6edfa', { x: -700, y: -300, w: 1400, h: 600 });
      f += `<path d="M -700 240 Q -400 190 -100 240 T 700 220 L 700 300 L -700 300 Z" fill="#8cc27a"/>`;
      f += g(cloud(0, 0, 1.9), { x: -330, y: -60 + Math.sin(t * 0.8) * 6 }) + cloud(-610, -210, 0.6, '#fff', 0.8) + `</g>`;
      // 雲の中（ルーペ）：水や氷のつぶ
      let inn = `<rect x="110" y="-250" width="460" height="460" fill="#eef3f6"/>` + specks(340, -20, 210, 16, t, { k: 1, seed: 11, rr: 16 });
      [[250, -120], [420, 60], [330, 110], [440, -110]].forEach(([x, y], i) => { inn += `<g transform="translate(${x + Math.sin(t + i) * 5} ${y + Math.cos(t * 1.2 + i) * 5}) rotate(${i * 20})" stroke="#9cc4dc" stroke-width="7" stroke-linecap="round">${[0, 60, 120].map(a => `<line x1="-20" y1="0" x2="20" y2="0" transform="rotate(${a})"/>`).join('')}</g>`; });
      f += `<line x1="-200" y1="-110" x2="140" y2="-80" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/>` + lens(340, -20, 210, inn, { id: 'hll' });
      f += g(badge('そらの くも', { fill: C.blueUi, size: 44, pad: 40 }), { x: -420, y: -300 }) + pop(badge('みずや こおりの つぶ', { fill: WB.drop, size: 42 }), t, c4 + d4 * 0.55, 340, 236);
      f += pop(badge('おなじ しくみ', { fill: C.ochre, size: 46, pad: 40 }), t, c4 + d4 * 0.3, -330, 150);
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${so}"/>` + topBadge() + g(f, { x: 960, y: 470, o: so, s: lerp(0.92, 1, eo(so)) });
      out += kidShow('K', t, 200, 850, { s: 0.6, start: c5 - 0.9, n: 0, bubble: false, mouth: lineOf('K') ? 'open' : 'smile' });
      out += talkBubble('K', 520, 800, 300, 772, 44);
    }
    return out;
  },
});

// 6. 白い息：あたたかくて水蒸気の多い息 ＋ 冷たい空気 → まざると もちきれなくなって、水のつぶ
SCENES.push({
  id: 'breath',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4;
    let out = winterBg('bsky', 810);
    const BX = 230, BY = 836, BS = 0.78, mx = BX + 30, my = BY - 242 * BS;
    out += breathPuffs(mx, my, t, { o: 1, len: 330, dir: -12, r1: 70, n: 6 });
    out += kidShow('B', t, BX, BY, { s: BS, start: 0, n: 0, bubble: false, mouth: 'o', enter: 'pop' });
    out += topBadge();
    out += pop(badge('しろい いきは？', { fill: C.ochre, size: 50, pad: 42 }), t, c0 + 0.3, 1100, 330, { end: c1 - 0.2 });
    // 息（あたたかい・水蒸気がいっぱい）＋ 冷たい空気 → まざると…
    const R = 165, Y = 420, X1 = 880, X2 = 1280, X3 = 1680;
    const pill = (str, col, size = 36) => { const w = tw(str, size, 900) + 44; return `<rect x="${-w / 2}" y="${-size * 0.78}" width="${w}" height="${size * 1.56}" rx="${size * 0.78}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(0, 2, str, { size, w: 900, fill: col }); };
    const o1 = prog(t, c1 + 0.2, 0.4), o2 = prog(t, c2 + 0.2, 0.4), o3 = prog(t, c2 + d2 * 0.5, 0.4), eo2 = 1 - prog(t, c4 - 0.4, 0.4);
    let q = '';
    if (o1 > 0) {
      q += g(`<line x1="${mx + 90}" y1="${my - 30}" x2="${X1 - R + 20}" y2="${Y + 40}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/>` +
        lens(X1, Y, R, `<rect x="${X1 - R}" y="${Y - R}" width="${R * 2}" height="${R * 2}" fill="${WB.warmLt}"/>` + specks(X1, Y, R, 22, t, { k: 0, seed: 21, rr: 13 }), { id: 'bl1' }) +
        g(badge('はく いき', { fill: WB.warm, size: 42 }), { x: X1, y: Y - R - 26 }), { o: o1 });
      q += pop(pill('あたたかい', WB.warmDk, 40), t, c1 + d1 * 0.3, X1, 640) + pop(pill('すいじょうきが いっぱい', WB.warmDk, 32), t, c1 + d1 * 0.55, X1, 708);
    }
    if (o2 > 0) {
      q += g(text((X1 + X2) / 2, Y + 2, '＋', { size: 60, w: 900, fill: C.ink }) + lens(X2, Y, R, `<rect x="${X2 - R}" y="${Y - R}" width="${R * 2}" height="${R * 2}" fill="${WB.coldLt}"/>` + specks(X2, Y, R, 5, t, { k: 0, seed: 25, rr: 13 }), { id: 'bl2' }) +
        g(badge('そとの くうき', { fill: WB.cold, size: 42 }), { x: X2, y: Y - R - 26 }), { o: o2 });
      q += pop(pill('つめたい', WB.coldDk, 40), t, c2 + 0.5, X2, 640) + pop(pill('すこししか もてない', WB.coldDk, 32), t, c2 + 0.9, X2, 708);
    }
    if (o3 > 0) {
      const k = eio(prog(t, c3 + 0.2, 1.6)) * 0.62, wh = prog(t, c3 + 0.9, 1.0);
      q += g(g(arrow2((X2 + X3) / 2 - 30, Y, (X2 + X3) / 2 + 34, Y, C.ink, 11), {}) + lens(X3, Y, R, `<rect x="${X3 - R}" y="${Y - R}" width="${R * 2}" height="${R * 2}" fill="${mix('#e6eef5', '#f6f8f9', wh)}"/>` + specks(X3, Y, R, 22, t, { k, seed: 21, rr: 13 }), { id: 'bl3' }) +
        g(badge('まざると…', { fill: C.ink, size: 42 }), { x: X3, y: Y - R - 26 }), { o: o3 });
      q += pop(pill('もちきれない！', C.redUi, 40), t, c2 + d2 * 0.7, X3, 640) + pop(pill('みずの つぶが できる', WB.drop, 32), t, c3 + 0.6, X3, 708);
      q += pop(badge('これが しろい いき', { fill: WB.drop, size: 46, pad: 40 }), t, c3 + d3 * 0.55, 1280, 792);
    }
    out += g(q, { o: eo2 });
    // 冬の寒い朝 と 夏の暑い昼：湯気の見えかた
    const wo = prog(t, c4 - 0.2, 0.5);
    if (wo > 0) {
      const cardK = (x, label, col, bg, amt, st, sun) => {
        let k = `<clipPath id="bk${x}"><rect x="-330" y="-270" width="660" height="540" rx="32"/></clipPath><rect x="-330" y="-270" width="660" height="540" rx="32" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#bk${x})"><rect x="-330" y="-270" width="660" height="540" fill="${bg}"/>`;
        k += `<rect x="60" y="-220" width="210" height="190" rx="10" fill="${sun ? '#8fcbf2' : '#cfe1ee'}" stroke="#fff" stroke-width="14"/>` + (sun ? sunDisc(165, -140, 36, 0, { glow: 0.6 }) : `<circle cx="120" cy="-170" r="7" fill="#fff"/><circle cx="200" cy="-110" r="7" fill="#fff"/><circle cx="150" cy="-70" r="6" fill="#fff"/><circle cx="230" cy="-180" r="6" fill="#fff"/>`);
        k += `<rect x="-330" y="190" width="660" height="80" fill="${WB.counter}"/>` + stove(-110, 160, 330, t) + kettle(-110, 152, 2.9) + steam(-110 + 65 * 2.9, 152 - 64 * 2.9, t, { gap: 40, len: 60 + 230 * amt, dir: -66, r0: 10 + 6 * amt, r1: 20 + 46 * amt, n: amt > 0.5 ? 7 : 3, o: 0.55 + 0.45 * amt, seed: x }) + `</g>`;
        k += g(badge(label, { fill: col, size: 42 }), { y: -270 });
        return pop(k, t, st, x, 470);
      };
      let w = cardK(560, 'ふゆの さむい あさ', WB.cold, '#f4f1ea', 1, c4 + 0.1, false) + cardK(1360, 'なつの あつい ひる', WB.warm, '#fbf1de', 0.25, c4 + d4 * 0.2, true);
      w += pop(badge('ゆげが たくさん みえる', { fill: WB.coldDk, size: 40 }), t, c4 + d4 * 0.55, 560, 790) + pop(badge('すこししか みえない', { fill: WB.warmDk, size: 40 }), t, c4 + d4 * 0.3, 1360, 790);
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${wo}"/>` + topBadge() + g(w, { o: wo });
    }
    return out;
  },
});

// 7. すぐ消えるわけ：かわいた空気とまざると、つぶが また水蒸気にもどる
SCENES.push({
  id: 'fade',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1;
    let out = winterBg('fsky', 810);
    const BX = 230, BY = 836, BS = 0.78, mx = BX + 30, my = BY - 242 * BS;
    // 白い息が流れて、うすくなって消える（くり返し）
    const cyc = 4.6, ph = ((t - 0.4) % cyc + cyc) % cyc, k = clamp(ph / 3.8), blow = ph < 1.1;
    const fo = Math.pow(1 - k, 1.3);
    for (let i = 0; i < 5; i++) { const d = 60 + k * 420 + i * 46, wob = Math.sin(t * 1.3 + i * 2) * 14; out += puff(mx + d, my - 20 - k * 70 - i * 10 + wob, 44 + i * 6 + k * 26, Math.min(1, ph * 4) * fo * (1 - i * 0.08)); }
    out += kidShow('B', t, BX, BY, { s: BS, start: 0, n: 0, bubble: false, mouth: blow ? 'o' : 'smile', enter: 'pop' });
    out += topBadge();
    out += pop(badge('すぐ きえる', { fill: C.ochre, size: 50, pad: 42 }), t, c0 + 0.5, 760, 250);
    // ルーペ：つぶ → 水蒸気（見えない）
    const lo = prog(t, c1 - 0.2, 0.4);
    if (lo > 0) {
      const X = 1420, Y = 440, R = 220, back2 = eio(prog(t, c1 + d1 * 0.35, 2.6));
      let inn = `<rect x="${X - R}" y="${Y - R}" width="${R * 2}" height="${R * 2}" fill="${mix('#f1f4f6', '#e9f3fa', back2)}"/>` + specks(X, Y, R, 24, t, { k: 1 - back2, seed: 31, rr: 16 });
      out += g(`<line x1="${mx + 420}" y1="${my - 80}" x2="${X - R + 30}" y2="${Y + 60}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/>` + lens(X, Y, R, inn, { id: 'fl1' }), { o: lo });
      out += pop(badge('かわいた くうきと まざる', { fill: C.blueUi, size: 42 }), t, c1 + 0.4, X, 150);
      out += pop(badge('みずの つぶ', { fill: WB.drop, size: 40 }), t, c1 + d1 * 0.3, 1100, 748) + g(arrow2(1236, 748, 1300, 748, C.ink, 12), { o: prog(t, c1 + d1 * 0.45, 0.3) }) + pop(badge('すいじょうき（みえない）', { fill: '#3f8fc0', size: 40 }), t, c1 + d1 * 0.5, 1590, 748);
    }
    return out;
  },
});

// 小さな大人（うしろ姿ではなく、正面のかんたんな人）
const grownup = (x, y, s = 1, col = '#5f8f7a') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-17" y="-70" width="14" height="70" rx="7" fill="#35657f"/><rect x="3" y="-70" width="14" height="70" rx="7" fill="#35657f"/><rect x="-26" y="-160" width="52" height="100" rx="18" fill="${col}"/><circle cx="0" cy="-192" r="30" fill="${CH.skin}"/><path d="M -30 -196 A 30 30 0 0 1 30 -196 Q 0 -214 -30 -196 Z" fill="${CH.hairB}"/></g>`;

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5);
    const aO = 1 - prog(t, c1 - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'とても ちいさな みずの つぶ', { size: 58, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['すいじょうきは みえない', WB.vapor], ['ひえて みずの つぶに', WB.drop], ['くもと おなじ', C.blueUi]], t, 900, 660, { start: 2.6, step: 1.3 });
      a += kidShow('K', t, 1730, 850, { s: 0.7, start: 1.6, n: 0, bubble: false });
      out += g(a, { o: aO });
    }
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, c1 - 0.2, 400, 190);
      const row = (ic, s1, s2, col, y, st, size = 44) => pop(ic + (s2 ? text(80, -30, s1, { size, w: 900, anchor: 'start', fill: col }) + text(80, 30, s2, { size, w: 900, anchor: 'start', fill: col }) : text(80, 2, s1, { size, w: 900, anchor: 'start', fill: col })), t, st, 990, y);
      const dotIc = col => `<circle r="14" fill="${col}"/>`;
      // その1：外と部屋で「はー」
      const p1 = 1 - prog(t, c3 - 0.6, 0.4);
      if (p1 > 0) {
        let q = '';
        [[280, 'そと', WB.cold, 0, c1 + 0.3], [710, 'へやの なか', WB.warm, 1, c1 + d1 * 0.5]].forEach(([x, label, col, room, st]) => {
          let f = `<clipPath id="lk${x}"><rect x="-200" y="-270" width="400" height="540" rx="28"/></clipPath><rect x="-200" y="-270" width="400" height="540" rx="28" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#lk${x})">`;
          f += room ? `<rect x="-200" y="-270" width="400" height="540" fill="${WB.wall}"/><rect x="-200" y="170" width="400" height="100" fill="${WB.counter}"/><rect x="-160" y="-190" width="120" height="140" rx="8" fill="#cfe1ee" stroke="#fff" stroke-width="12"/>`
            : skyG('lks' + x, WB.skyT, WB.skyB, { x: -200, y: -270, w: 400, h: 540 }) + `<rect x="-200" y="170" width="400" height="100" fill="${WB.snow}"/>` + bareTree(-130, 172, 0.8);
          f += `</g>`;
          q += pop(f + g(badge(label, { fill: col, size: 40 }), { y: -270 }), t, st, x, 556);
          q += kidShow(room ? 'S' : 'B', t, x - 40, 732, { s: 0.42, start: st + 0.2, n: room, enter: 'pop', bubble: false, mouth: 'o' });
          q += pop(text(0, 0, 'はー', { size: 56, w: 900, fill: mix(col, '#000', 0.2) }), t, st + 0.5, x + 100, room ? 582 : 626) + pop(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), t, c2 + 0.3 + room * 0.4, x + 110, 416);
        });
        q += row(dotIc(WB.cold), 'さむい あさ、', 'そとと へやの なかで「はー」', C.ink, 360, c1 + 0.1);
        q += row(g(eyeIcon(0.24), {}), 'どちらで しろく なるか、', 'よそうしてから くらべる', C.ink, 560, c2 + 0.1);
        b += g(q, { o: p1 });
      }
      // その2：大人がわかした やかんを、はなれて見る
      const p2 = prog(t, c3 - 0.3, 0.5);
      if (p2 > 0) {
        let q = `<clipPath id="lkk"><rect x="70" y="270" width="850" height="540" rx="28"/></clipPath><rect x="70" y="270" width="850" height="540" rx="28" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#lkk)"><rect x="70" y="270" width="850" height="540" fill="${WB.wall}"/><rect x="70" y="700" width="850" height="110" fill="${WB.counter}"/><rect x="70" y="700" width="850" height="10" fill="${WB.counterDk}"/>`;
        const KX = 350, KY = 610, KS = 2.5, sx = KX + 65 * KS, sy = KY - 64 * KS;
        q += `<rect x="200" y="650" width="330" height="60" fill="#e9eef1" stroke="${C.ink}" stroke-width="5"/>` + stove(KX, KY + 6, 280, t) + kettle(KX, KY, KS) + steam(sx, sy, t, { gap: 54, len: 200, dir: -64, r0: 12, r1: 46, n: 6 });
        q += grownup(140, 706, 1.25) + `</g>`;
        const pk = 0.6 + 0.4 * Math.sin(t * 5), gx = sx + Math.cos(rad(-64)) * 27, gy = sy + Math.sin(rad(-64)) * 27;
        q += `<circle cx="${gx}" cy="${gy}" r="44" fill="none" stroke="${C.redUi}" stroke-width="7" stroke-dasharray="16 10" opacity="${pk * prog(t, c3 + d3 * 0.6, 0.3)}"/>`;
        q += kidShow('S', t, 800, 716, { s: 0.42, start: c3, n: 0, enter: 'pop', bubble: false, pose: 'pointL', look: [-8, -5], eyes: 'wide' });
        q += g(`<line x1="570" y1="760" x2="730" y2="760" stroke="${C.accent}" stroke-width="8" stroke-linecap="round"/><path d="M 558 760 l 26 -16 v 32 Z M 742 760 l -26 -16 v 32 Z" fill="${C.accent}"/>`, { o: prog(t, c3 + d3 * 0.35, 0.3) }) + pop(badge('はなれて みる', { fill: C.accent, size: 36 }), t, c3 + d3 * 0.35, 650, 690);
        q += tag(gx + 20, gy - 30, 700, 330, 'とうめいな すきま？', prog(t, c3 + d3 * 0.62, 0.3), { size: 36, col: C.redUi });
        q += row(g(eyeIcon(0.24), {}), 'おとなが おゆを わかしたら、', 'はなれて、くちの すぐ うえを みる', C.ink, 350, c3 + 0.1, 40);
        q += row(warnIcon(0.62), 'ゆげの でぐちは とても あつい', 'てや かおを ちかづけない・さわらない', C.red, 530, c4 + 0.1, 40);
        q += row(warnIcon(0.62), 'おゆを わかすのも、', 'ふたを あけるのも、おとな', C.red, 710, c5 + 0.1, 40);
        b += g(q, { o: p2 });
      }
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ゆげ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

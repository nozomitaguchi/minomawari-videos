// ---------- はなみずの いろ の道具 ----------
const SKIN = '#f6d6bd', HAIR = '#3a2a22';
const MC = {
  clear: '#cdeaf6', yellow: '#ecd65c', green: '#a8c552', yellowDk: '#a88600', greenDk: '#5f8f2a', gran: '#3fa637',
  wall: '#f6c3bd', wallDk: '#e79a96', cav: '#fdf4ee', room: '#fbefd9', floor: '#e9cfa6', germ: '#9a7fc4', germDk: '#5d4a86',
};
// 鼻水の色： k = 0 とうめい → 1 きいろ → 2 みどりっぽい
const mucusCol = k => (k <= 1 ? mix(MC.clear, MC.yellow, clamp(k)) : mix(MC.yellow, MC.green, clamp(k - 1)));
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
// k 番目の行の、はじめから f（0〜1）のところの秒
const mid = (k, f = 0.5) => cue(k) + (cueE(k) - cue(k)) * f;
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
function flowRow(items, t, cx, y, { size = 36, gap = 60, start = 0, step = 0.8 } = {}) {
  const ws = items.map(([s]) => tw(s, size, 700, 0.04) + 68), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = cx - tot / 2, out = '';
  items.forEach(([s, col], i) => { const st = start + i * step; out += pop(badge(s, { fill: col, size }), t, st, x + ws[i] / 2, y); if (i) out += g(arrow2(x - gap + 10, y, x - 10, y, C.ochre, 9), { o: prog(t, st - 0.2, 0.3) }); x += ws[i] + gap; });
  return out;
}
const F1 = v => v.toFixed(1);
// ウイルス（とげのある小さなつぶ）
const VCOL = ['#7cbf5a', '#e0a33a', '#d7685a', '#6a9fd8', '#a07ad6', '#4fb3a6'];
function virus(x, y, r, { col = '#d7685a', rot = 0, o = 1, s = 1 } = {}) {
  if (o <= 0.01 || s <= 0.01) return '';
  const dk = mix(col, '#000000', 0.28);
  let sp = '';
  for (let k = 0; k < 10; k++) {
    const a = k * Math.PI / 5, c = Math.cos(a), sn = Math.sin(a);
    sp += `<line x1="${F1(c * r * 0.85)}" y1="${F1(sn * r * 0.85)}" x2="${F1(c * r * 1.32)}" y2="${F1(sn * r * 1.32)}" stroke="${dk}" stroke-width="${F1(r * 0.16)}" stroke-linecap="round"/><circle cx="${F1(c * r * 1.36)}" cy="${F1(sn * r * 1.36)}" r="${F1(r * 0.17)}" fill="${dk}"/>`;
  }
  let b = `<g transform="rotate(${F1(rot)})">${sp}</g><circle r="${r}" fill="${col}"/><circle cx="${-r * 0.32}" cy="${-r * 0.34}" r="${r * 0.24}" fill="#fff" opacity="0.35"/>`;
  if (r > 9) b += `<circle cx="${-r * 0.3}" cy="${-r * 0.05}" r="${r * 0.12}" fill="${C.ink}"/><circle cx="${r * 0.3}" cy="${-r * 0.05}" r="${r * 0.12}" fill="${C.ink}"/><path d="M ${-r * 0.25} ${r * 0.34} Q 0 ${r * 0.2} ${r * 0.25} ${r * 0.34}" fill="none" stroke="${C.ink}" stroke-width="${r * 0.09}" stroke-linecap="round"/>`;
  return g(b, { x, y, o, s });
}
// 白血球（体を守るなかま）。まわりの小さな緑のつぶが「こうそ」
function wbc2(x, y, r, t, { o = 1, i = 0, gran = 1, munch = 0, s = 1 } = {}) {
  if (o <= 0.01 || s <= 0.01) return '';
  const w = Math.sin(t * 3 + i * 1.7) * 0.05 + munch * Math.sin(t * 18) * 0.07;
  let b = `<ellipse rx="${F1(r * (1 + w))}" ry="${F1(r * (1 - w))}" fill="#f5effc" stroke="#b49ddc" stroke-width="${Math.max(2.5, r * 0.08)}"/>`;
  b += [[-0.34, 0.2], [0, 0.38], [0.34, 0.2]].map(([a, c]) => `<circle cx="${F1(r * a)}" cy="${F1(r * c)}" r="${F1(r * 0.23)}" fill="#a184d6"/>`).join('');
  if (gran > 0) for (let k = 0; k < 9; k++) { const a = k * Math.PI * 2 / 9 + i + t * 0.4; b += `<circle cx="${F1(Math.cos(a) * r * 0.76)}" cy="${F1(Math.sin(a) * r * 0.76)}" r="${F1(Math.max(2.4, r * 0.09))}" fill="${MC.gran}" opacity="${gran}"/>`; }
  b += `<ellipse cx="${F1(-r * 0.24)}" cy="${F1(-r * 0.3)}" rx="${F1(r * 0.09)}" ry="${F1(r * 0.13)}" fill="${C.ink}"/><ellipse cx="${F1(r * 0.24)}" cy="${F1(-r * 0.3)}" rx="${F1(r * 0.09)}" ry="${F1(r * 0.13)}" fill="${C.ink}"/>`;
  b += munch > 0.5 ? `<ellipse cx="0" cy="${F1(-r * 0.04)}" rx="${F1(r * 0.13)}" ry="${F1(r * (0.07 + 0.05 * Math.abs(Math.sin(t * 14))))}" fill="${C.ink}"/>`
    : `<path d="M ${F1(-r * 0.16)} ${F1(-r * 0.08)} Q 0 ${F1(r * 0.04)} ${F1(r * 0.16)} ${F1(-r * 0.08)}" fill="none" stroke="${C.ink}" stroke-width="${F1(Math.max(2.5, r * 0.07))}" stroke-linecap="round"/>`;
  return g(b, { x, y, o, s });
}
// 細菌（頭は左、しっぽは右）
const germ = (x, y, s = 1, rot = 0, o = 1) => g(`<g transform="rotate(${rot})"><path d="M 32 0 q 9 -12 18 0 t 18 0" fill="none" stroke="${MC.germDk}" stroke-width="4" stroke-linecap="round"/><rect x="-36" y="-16" width="72" height="32" rx="16" fill="${MC.germ}" stroke="${MC.germDk}" stroke-width="4"/><circle cx="-16" cy="-3" r="3.6" fill="${C.ink}"/><circle cx="2" cy="-3" r="3.6" fill="${C.ink}"/></g>`, { x, y, s, o });
// ティッシュ（まん中に鼻水）
const tissuePic = (col, s = 1) => g(`<path d="M -92 -70 Q -44 -94 0 -74 Q 46 -94 94 -68 Q 106 -8 90 66 Q 42 90 0 72 Q -46 92 -94 64 Q -106 0 -92 -70 Z" fill="#fff" stroke="#d3c8b1" stroke-width="5" stroke-linejoin="round"/>` +
  `<path d="M -66 -42 Q -44 -10 -62 34 M 62 -44 Q 42 -6 64 36" fill="none" stroke="#ebe3d0" stroke-width="5" stroke-linecap="round"/>` +
  `<path d="M -38 -6 Q -36 -38 0 -34 Q 38 -38 40 -2 Q 44 30 6 32 Q -34 36 -38 -6 Z" fill="${col}" stroke="${mix(col, '#000000', 0.25)}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="-12" cy="-16" rx="11" ry="6" fill="#fff" opacity="0.65"/>`, { s });
// かぜをひいた子の顔（鼻水つき）
function sickFace(t, { col = MC.clear, drip = 1 } = {}) {
  const L = 16 + 24 * clamp(drip) + Math.sin(t * 2.2) * 2.5, blink = (t % 3.4) > 3.25;
  let b = `<circle cx="-150" cy="14" r="24" fill="${SKIN}"/><circle cx="150" cy="14" r="24" fill="${SKIN}"/><circle r="150" fill="${SKIN}"/>`;
  b += `<path d="M -151 6 Q -170 -170 0 -172 Q 170 -170 151 6 Q 120 -92 0 -98 Q -120 -92 -151 6 Z" fill="${HAIR}"/>`;
  b += `<ellipse cx="-54" cy="-6" rx="12" ry="${blink ? 2 : 17}" fill="${CH.line}"/><ellipse cx="54" cy="-6" rx="12" ry="${blink ? 2 : 17}" fill="${CH.line}"/>`;
  b += `<path d="M -76 -40 Q -56 -48 -36 -38 M 36 -38 Q 56 -48 76 -40" fill="none" stroke="${CH.line}" stroke-width="6" stroke-linecap="round"/>`;
  b += `<circle cx="-90" cy="48" r="30" fill="${CH.cheek}" opacity="0.8"/><circle cx="90" cy="48" r="30" fill="${CH.cheek}" opacity="0.8"/>`;
  if (drip > 0) b += `<path d="M 3 46 L 3 ${F1(46 + L)} A 9 9 0 0 0 21 ${F1(46 + L)} L 21 46 Z" fill="${col}" stroke="${mix(col, '#000000', 0.28)}" stroke-width="3.5" stroke-linejoin="round" opacity="${clamp(drip * 4)}"/>`;
  b += `<ellipse cx="0" cy="38" rx="24" ry="16" fill="#f0a39a"/>`;
  b += `<path d="M -24 112 Q 0 100 24 112" fill="none" stroke="${CH.line}" stroke-width="7" stroke-linecap="round"/>`;
  return b;
}
const roomBg = () => `<rect width="1920" height="1080" fill="${MC.room}"/><rect y="806" width="1920" height="274" fill="${MC.floor}"/><rect y="798" width="1920" height="12" fill="#d9b98a"/>`;
// 鼻の中を大きくした絵（下が鼻の中のかべ、その上に鼻水）
const PN = { x: 640, y: 170, w: 1220, h: 630 }, WY = PN.y + PN.h - 110;
function nosePanel(t, { k = 0, lvl = 1, flow = 0, inner = '' } = {}) {
  const { x, y, w, h } = PN, col = mucusCol(k);
  let o = `<clipPath id="pnc"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36"/></clipPath>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="${MC.cav}" filter="url(#shadow)"/><g clip-path="url(#pnc)">`;
  if (lvl > 0) {
    const top = lerp(WY, y - 30, eo(clamp(lvl)));
    let d = `M ${x} ${WY + 10} L ${x} ${F1(top)}`;
    for (let i = 0; i <= 20; i++) d += ` L ${F1(x + w * i / 20)} ${F1(top + Math.sin(i * 0.9 + t * 1.6) * 10)}`;
    d += ` L ${x + w} ${WY + 10} Z`;
    o += `<path d="${d}" fill="${col}" opacity="0.92"/>`;
    for (let i = 0; i < 12; i++) {
      const yy = y + 50 + i * 43 + rnd(i, 33) * 16; if (yy < top + 24 || yy > WY - 16) continue;
      const xx = x + (((rnd(i, 31) * w - t * (16 + flow * 300) * (0.7 + rnd(i, 32) * 0.6)) % w) + w) % w;
      o += `<line x1="${F1(xx)}" y1="${F1(yy)}" x2="${F1(xx + 60 + flow * 50)}" y2="${F1(yy)}" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${0.4 + 0.3 * flow}"/>`;
    }
  }
  o += inner;
  o += `<rect x="${x}" y="${WY}" width="${w}" height="110" fill="${MC.wall}"/>`;
  for (let i = 0; i < 11; i++) o += `<rect x="${x + 5 + i * 111}" y="${WY + 8}" width="101" height="130" rx="22" fill="#f9d6d1" stroke="${MC.wallDk}" stroke-width="4"/><circle cx="${x + 55 + i * 111}" cy="${WY + 62}" r="15" fill="${MC.wallDk}" opacity="0.7"/>`;
  o += `</g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="none" stroke="#fff" stroke-width="10"/>`;
  return o;
}
const dayChip = (str, t, st = 0.3) => pop(badge(str, { fill: C.ochre, size: 40 }), t, st, PN.x + 34 + (tw(str, 40, 700, 0.04) + 68) / 2, PN.y + 58);
const wallChip = (t, st = 0.5) => pop(badge('はなの なかの かべ', { fill: '#c9716c', size: 30 }), t, st, PN.x + PN.w - 190, WY + 58);
// 左上のティッシュと色の名前
function tissueCol(t, k, labels) {
  let o = g(card(380, 290, { fill: '#fff' }), { x: 310, y: 310 }) + g(text(0, 0, 'ティッシュで みると', { size: 34, w: 900, fill: C.muted }), { x: 310, y: 200 }) + g(tissuePic(mucusCol(k), 0.95), { x: 310, y: 300 });
  labels.forEach(([s, col, st, en]) => { o += pop(badge(s, { fill: col, size: 40 }), t, st, 310, 412, { end: en }); });
  return o;
}

// 1. つかみ：はじめは透明、何日かすると黄色
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3), m1 = mid(1, 0.5);
    let out = roomBg();
    out += `<rect x="96" y="70" width="230" height="150" rx="14" fill="#cfe6f2" stroke="#fff" stroke-width="14"/><line x1="211" y1="70" x2="211" y2="220" stroke="#fff" stroke-width="10"/>` + cloud(150, 126, 0.22) + cloud(272, 186, 0.2);
    const yk = eio(prog(t, m1 + 0.2, 1.4));
    out += pop(g(sickFace(t, { col: mucusCol(yk), drip: prog(t, c0 + 0.5, 1.2) }), { s: 1.3 }), t, 0.2, 370, 520);
    out += pop(badge('はなみず', { fill: C.blueUi, size: 44 }), t, c0 + 1.3, 370, 778, { end: c1 + 0.2 });
    // ティッシュ：はじめ → 何日かすると
    out += pop(tissuePic(MC.clear, 1.25), t, c1 + 0.2, 800, 420) + pop(badge('はじめ', { fill: C.ochre, size: 38 }), t, c1 + 0.3, 800, 252) + pop(badge('とうめい', { fill: C.blueUi, size: 42 }), t, c1 + 0.9, 800, 588);
    out += g(arrow2(930, 420, 1010, 420, C.ochre, 16), { o: prog(t, m1 - 0.3, 0.3) });
    out += pop(tissuePic(MC.yellow, 1.25), t, m1, 1140, 420) + pop(badge('なんにちか すると', { fill: C.ochre, size: 38 }), t, m1 + 0.1, 1140, 252) + pop(badge('きいろ', { fill: MC.yellowDk, size: 42 }), t, m1 + 0.7, 1140, 588);
    out += kidShow('B', t, 1730, 850, { s: 0.72, start: 0.4, n: 0, side: 'left', size: 46, look: [-6, -2] });
    // どうして？
    const qO = win(t, c3 + 0.4, cueE(3) + 0.6, 0.3);
    out += `<circle cx="1140" cy="420" r="${126 + 4 * Math.sin(t * 6)}" fill="none" stroke="${C.red}" stroke-width="9" stroke-dasharray="18 14" opacity="${qO}"/>`;
    out += g(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre, extra: `stroke="${MC.room}" stroke-width="18" paint-order="stroke"` }), { x: 1400, y: 410, o: win(t, c3 + 0.8, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">かぜの はなみずは、</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${MC.yellowDk}">きいろく</tspan> なるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(tissuePic(MC.clear, 0.9), { x: -250 }) + arrow2(-140, 0, -70, 0, C.ochre, 14) + g(tissuePic(MC.yellow, 0.9), { x: 40 }) + text(250, -4, '？', { size: 120, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'はなみずは、どうして きいろく なると おもう？', { size: 58, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', ['はなの おくに、ほこりや よごれが たまるから']], ['②', ['かぜの ウイルスが、きいろい いろを して いるから']], ['③', ['からだを まもる はっけっきゅうが、', 'たくさん あつまって いるから']]];
    const cur = curLine(), osz = Math.min(...opts.flatMap(([, L]) => L.map(s => fit(s, 1040, 42))));
    opts.forEach(([n, L], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-80" width="1260" height="160" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 140) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        L.map((s, j) => text(-460, 2 + (j - (L.length - 1) / 2) * (osz + 14), s, { size: osz, w: 700, anchor: 'start' })).join(''), t, cue(i + 1) - 0.2, 820, 384 + i * 166);
    });
    out += pop(tissuePic(MC.yellow, 1.0) + text(124, -76, '？', { size: 120, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1650, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.52, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1540, y: 560, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. ひきはじめ：透明な鼻水が、ウイルスを洗い流す
const VP = [[1480, 392], [1230, 490], [1660, 520], [1040, 410], [900, 566], [1400, 612]];
SCENES.push({
  id: 'clear',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    let out = `<rect width="1920" height="1080" fill="${MC.room}"/>` + topBadge();
    const lvl = prog(t, c1, 1.8), fl = eio(prog(t, c2 + 0.3, 1.0));
    out += `<path d="M 330 440 L ${PN.x} ${PN.y + 30} M 330 446 L ${PN.x} ${PN.y + PN.h - 30}" stroke="#d8c3a2" stroke-width="5" stroke-dasharray="12 12" fill="none"/>`;
    let inn = '';
    VP.forEach(([vx, vy], i) => {
      const a = eo(prog(t, c0 + 0.2 + i * 0.25, 1.1));       // 入ってくる（左の入り口から）
      const w = eio(prog(t, c2 + 0.7 + i * 0.4, 2.4));       // 洗い流される（左へ）
      const x = lerp(PN.x - 90, vx, a) - w * (vx - PN.x + 110), y = vy + Math.sin(t * 2 + i) * 10 - Math.sin(w * Math.PI) * 24;
      inn += virus(x, y, 34, { col: VCOL[i % VCOL.length], rot: t * 40 + i * 30 - w * 500 });
    });
    out += nosePanel(t, { k: 0, lvl, flow: fl, inner: inn });
    out += dayChip('ひきはじめ', t) + wallChip(t);
    out += tag(VP[0][0] + 26, VP[0][1] - 26, 1650, 232, 'ウイルス', win(t, c0 + 1.6, c2 + 0.9, 0.3), { col: C.redUi, size: 40 });
    out += pop(badge('ウイルスを あらいながす', { fill: C.blueUi, size: 40 }), t, c2 + 1.2, 1330, 232);
    out += g(arrow2(PN.x + 260, 304, PN.x + 70, 304, C.blueUi, 18) + text(PN.x + 290, 306, 'そとへ', { size: 44, w: 900, fill: C.blueUi, anchor: 'start', extra: `stroke="#fff" stroke-width="10" paint-order="stroke"` }), { o: prog(t, c2 + 0.9, 0.4) });
    // 顔と鼻水
    out += pop(g(sickFace(t, { col: MC.clear, drip: prog(t, c1 + 0.3, 1.4) }), { s: 1.05 }), t, 0.2, 320, 400);
    out += pop(badge('とうめい', { fill: C.blueUi, size: 44 }), t, c1 + 1.2, 320, 640);
    out += g(text(0, 0, 'みずみたいに さらさら', { size: 38, w: 900, fill: C.blueUi }), { x: 320, y: 718, o: prog(t, c1 + 1.8, 0.4) });
    return out;
  },
});

// 4. 2〜3日め：白血球が集まって、白や黄色に
// 6×3 のます。VC のますにはウイルス、ほかのますには白血球。ウイルスは、左どなりのますの白血球が食べに行く
const CELL = Array.from({ length: 18 }, (_, i) => [PN.x + 118 + (i % 6) * 194 + rnd(i, 41) * 44, 326 + Math.floor(i / 6) * 120 + rnd(i, 42) * 30]);
const VC = [2, 9, 16, 5];
const GV = VC.map(c => CELL[c]);
const WB = CELL.map((p, c) => [p[0], p[1], VC.indexOf(c + 1)]).filter((_, c) => !VC.includes(c));
SCENES.push({
  id: 'gather',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${MC.room}"/>` + topBadge();
    const k = eio(prog(t, c3 + 0.3, 2.4));
    let inn = '';
    const eat = i => c2 + 0.5 + i * 0.7;
    GV.forEach(([vx, vy], i) => { inn += virus(vx, vy + Math.sin(t * 2 + i) * 8, 30, { col: VCOL[(i + 2) % VCOL.length], rot: t * 40 + i * 50, s: 1 - prog(t, eat(i) + 0.75, 0.35) }); });
    WB.forEach(([wx, wy, v], i) => {
      const st = i < 3 ? c0 + 1.2 + i * 0.45 : c1 + 0.2 + (i - 3) * 0.26, a = eo(prog(t, st, 0.9));
      if (a <= 0) return;
      let x = wx, y = lerp(WY + 40, wy, a) + Math.sin(t * 1.7 + i) * 6, mu = 0;
      if (v >= 0) { const m = eio(prog(t, eat(v), 0.9)) - eio(prog(t, eat(v) + 2.1, 0.9)); x = lerp(wx, GV[v][0], m); y = lerp(y, GV[v][1], m); mu = win(t, eat(v) + 0.7, eat(v) + 2.0, 0.2); }
      inn += wbc2(x, y, 44, t, { i, munch: mu, o: Math.min(1, a * 3) });
    });
    out += nosePanel(t, { k, inner: inn });
    out += dayChip('2〜3にちめ', t) + wallChip(t, 0.2);
    out += pop(badge('からだの まもりが たたかいはじめる', { fill: C.accent, size: 36 }), t, c0 + 0.8, 1380, 228, { end: c1 });
    out += pop(badge('はっけっきゅうが あつまる', { fill: '#7d5fc0', size: 38 }), t, c1 + 0.5, 1380, 228, { end: c2 });
    out += pop(badge('ウイルスや さいきんを たべて こわす', { fill: '#7d5fc0', size: 36 }), t, c2 + 0.5, 1380, 228, { end: c3 });
    out += pop(badge('はっけっきゅうが たくさん まざる', { fill: MC.yellowDk, size: 36 }), t, c3 + 0.5, 1380, 228);
    out += tissueCol(t, k, [['とうめい', C.blueUi, 0.3, c3 + 1.2], ['しろ・きいろ', MC.yellowDk, c3 + 1.5, 1e9]]);
    const KY = 848, ks = 0.5, ht = KY - KID_HEAD.S[0] * ks;
    out += kidShow('S', t, 300, KY, { s: ks, start: c2 - 0.4, n: 0, bubble: false, look: [7, -3] });
    out += talkBubble('S', 310, ht - 88, 300, ht - 6, 44);
    return out;
  },
});

// 5. 治りかけ：白血球の中の緑色の「こうそ」
const GR = Array.from({ length: 34 }, (_, i) => { const a = rnd(i, 51) * Math.PI * 2, d = 62 + rnd(i, 52) * 100; return [Math.cos(a) * d * 1.08, Math.sin(a) * d * 0.98]; }).filter(([x, y]) => !(y < -18 && y > -92 && Math.abs(x) < 86) && !(y > 4 && Math.hypot(x, y - 50) < 96));
SCENES.push({
  id: 'green',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${MC.room}"/>` + topBadge();
    const k = 1 + eio(prog(t, c0 + 0.4, 2.4));
    let inn = '';
    WB.forEach(([wx, wy], i) => { inn += wbc2(wx + Math.sin(t * 0.9 + i) * 10, wy + Math.sin(t * 1.7 + i) * 6, 44, t, { i }); });
    out += nosePanel(t, { k, inner: inn });
    out += dayChip('なおりかけ', t) + wallChip(t, 0.2);
    out += tissueCol(t, k, [['しろ・きいろ', MC.yellowDk, 0.2, c0 + 1.8], ['みどりっぽい', MC.greenDk, c0 + 2.1, 1e9]]);
    // 白血球を大きくして見る
    const LX = 1120, LY = 440, lk = prog(t, c1 - 0.1, 0.6);
    if (lk > 0) {
      const R = 222, gx = 66, gy = -124;                     // 細菌（白血球が飲みこんだもの）の場所
      const gIn = prog(t, c2 + 0.3, 0.6), conv = eio(prog(t, c2 + 1.5, 1.0)), gone = prog(t, c2 + 2.7, 0.6), back2 = eio(prog(t, c2 + 3.5, 0.9));
      let b = `<circle r="${R}" fill="#fff" stroke="${C.blueUi}" stroke-width="16"/><clipPath id="lnc"><circle r="${R - 8}"/></clipPath><g clip-path="url(#lnc)"><rect x="${-R}" y="${-R}" width="${R * 2}" height="${R * 2}" fill="${mucusCol(k)}" opacity="0.55"/>`;
      b += `<ellipse rx="${192 + Math.sin(t * 2.4) * 5}" ry="${186 - Math.sin(t * 2.4) * 5}" fill="#f5effc" stroke="#b49ddc" stroke-width="10"/>`;
      b += [[-72, 34], [0, 76], [72, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="46" fill="#a184d6"/>`).join('');
      b += `<ellipse cx="-44" cy="-56" rx="15" ry="22" fill="${C.ink}"/><ellipse cx="44" cy="-56" rx="15" ry="22" fill="${C.ink}"/><circle cx="-39" cy="-64" r="6" fill="#fff"/><circle cx="49" cy="-64" r="6" fill="#fff"/>`;
      b += `<path d="M -26 -22 Q 0 -4 26 -22" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>`;
      const near = GR.map(([x, y], i) => [Math.hypot(x - gx, y - gy), i]).sort((a, c) => a[0] - c[0]).slice(0, 9).map(a => a[1]);
      GR.forEach(([x, y], i) => {
        const j = near.indexOf(i), go = j >= 0 ? conv * (1 - back2) : 0, a = j * 0.7;
        const px = lerp(x, gx + Math.cos(a) * 58, go) + Math.sin(t * 2.3 + i) * 4, py = lerp(y, gy + Math.sin(a) * 38, go) + Math.cos(t * 2.0 + i * 1.3) * 4;
        b += `<circle cx="${F1(px)}" cy="${F1(py)}" r="${11 + (j >= 0 ? 3 * go : 0)}" fill="${MC.gran}" stroke="#2f7a2a" stroke-width="3"/>`;
      });
      if (gIn > 0) b += germ(gx, gy, 0.95 * Math.max(back(gIn), 0.001) * (1 - gone), -14 + Math.sin(t * 9) * 6 * (1 - conv), 1 - gone);
      if (gone > 0 && gone < 1) b += `<circle cx="${gx}" cy="${gy}" r="${30 + 60 * gone}" fill="none" stroke="${MC.gran}" stroke-width="8" opacity="${1 - gone}"/>`;
      b += `</g>`;
      out += g(b, { x: LX, y: LY, s: Math.max(back(lk), 0.001), o: Math.min(1, lk * 3) });
      out += pop(badge('はっけっきゅうを おおきく みると', { fill: C.blueUi, size: 32 }), t, c1 + 0.3, LX, 742);
      out += tag(LX + 150, LY - 60, 1630, 300, 'みどりいろの こうそ', win(t, c1 + 1.4, c2 + 0.2, 0.3), { col: MC.greenDk, size: 38 });
      out += tag(LX + gx + 40, LY + gy, 1630, 300, 'さいきん', win(t, c2 + 0.8, c2 + 2.9, 0.3), { col: MC.germDk, size: 40 });
      out += pop(g(card(440, 150), {}) + text(0, -30, 'こうそは、さいきんを', { size: 36, w: 900 }) + text(0, 26, 'やっつける つぶ', { size: 40, w: 900, fill: MC.greenDk }), t, c2 + 1.6, 1630, 470, { end: c3 });
      out += pop(g(card(440, 150), {}) + text(0, -30, 'この みどりいろで', { size: 36, w: 900 }) + text(0, 26, 'はなみずも みどりっぽく', { size: 36, w: 900, fill: MC.greenDk }), t, c3 + 0.3, 1630, 470);
    }
    const hi = win(t, c3 + 1.0, c3 + 3.4, 0.3);
    out += `<rect x="112" y="157" width="396" height="306" rx="34" fill="none" stroke="${MC.greenDk}" stroke-width="9" stroke-dasharray="20 14" stroke-dashoffset="${-t * 40}" opacity="${hi}"/>`;
    const KY = 848, ks = 0.6, ht = KY - KID_HEAD.B[0] * ks;
    out += kidShow('B', t, 300, KY, { s: ks, start: c1 + 0.6, n: 0, bubble: false, look: [7, -3] });
    out += talkBubble('B', 310, ht - 88, 300, ht - 6, 44);
    return out;
  },
});

// 6. 1940年代のはじめ：強い緑色から「緑」という名前に
SCENES.push({
  id: 'name',
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(badge('1940ねんだいの はじめ', { fill: C.ochre, size: 44 }), t, c0 + 0.3, 520, 220);
    // 試験管（こうそを取り出した）
    const lv = eo(prog(t, mid(0, 0.5), 1.6)), TX = 520, TY = 500, lh = 300 * lv;
    let tb = `<rect x="-200" y="216" width="400" height="26" rx="10" fill="#c9a77c"/><rect x="-150" y="-80" width="300" height="22" rx="8" fill="#c9a77c"/><rect x="-170" y="-80" width="22" height="300" fill="#b8946a"/><rect x="148" y="-80" width="22" height="300" fill="#b8946a"/>`;
    tb += `<clipPath id="tbc"><path d="M -56 -190 L 56 -190 L 56 150 A 56 56 0 0 1 -56 150 Z"/></clipPath>`;
    tb += `<path d="M -56 -190 L 56 -190 L 56 150 A 56 56 0 0 1 -56 150 Z" fill="#eef6f8"/>`;
    tb += `<g clip-path="url(#tbc)"><rect x="-60" y="${206 - lh}" width="120" height="${lh + 4}" fill="#3f9a3a"/><rect x="-60" y="${206 - lh}" width="120" height="14" fill="#62b858"/>`;
    for (let i = 0; i < 6; i++) { const f = (t * 0.35 + i / 6) % 1; if (lh > 60) tb += `<circle cx="${-30 + (i * 23) % 60}" cy="${200 - f * (lh - 20)}" r="${5 + (i % 3) * 2}" fill="#bfe6a8" opacity="${0.8 * (1 - f)}"/>`; }
    tb += `</g><path d="M -56 -190 L -56 150 A 56 56 0 0 0 56 150 L 56 -190" fill="none" stroke="#8fb3c6" stroke-width="10" stroke-linecap="round"/><ellipse cx="0" cy="-190" rx="62" ry="12" fill="none" stroke="#8fb3c6" stroke-width="9"/><path d="M -34 -150 L -34 120" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.8"/>`;
    out += pop(tb, t, 0.2, TX, TY);
    out += g(text(0, 0, 'アグナーさんが とりだした こうそ', { size: 40, w: 900 }), { x: TX, y: 790, o: prog(t, mid(0, 0.62), 0.4) });
    out += pop(badge('とても つよい みどりいろ', { fill: '#2f8a3e', size: 44 }), t, c1 + 0.3, 1300, 250);
    // 名前
    const nk = prog(t, mid(1, 0.42), 0.5);
    if (nk > 0) {
      let c = card(880, 330);
      c += text(-200, -70, 'ベルド', { size: 96, w: 900, fill: '#2f8a3e' }) + text(30, -70, '＝', { size: 80, w: 900, fill: C.ochre }) + text(240, -70, 'みどり', { size: 96, w: 900 });
      c += g(text(0, 70, 'ベルドペルオキシダーゼ', { size: 60, w: 900, fill: '#2f8a3e' }) + text(0, 126, 'と なづけた', { size: 34, w: 700, fill: C.muted }), { o: prog(t, mid(1, 0.42) + 1.2, 0.4) });
      out += g(c, { x: 1300, y: 490, o: nk, s: lerp(0.94, 1, eo(nk)) });
    }
    out += g(text(0, 0, 'いまは「ミエロペルオキシダーゼ」と よばれて いる', { size: 34, w: 700, fill: C.muted }), { x: 1300, y: 720, o: prog(t, cueE(1) - 0.6, 0.5) });
    return out;
  },
});

// 7. 色だけでは、細菌の病気かどうかはわからない
const GRID = Array.from({ length: 136 }, (_, i) => [i % 17, Math.floor(i / 17)]);
const FOUND = (() => { const s = new Set(); let i = 0; while (s.size < 22) { s.add(Math.floor(rnd(i, 61) * 136)); i++; } return [...s]; })();
const capsule = (s = 1) => g(`<g transform="rotate(-30)"><rect x="-80" y="-32" width="160" height="64" rx="32" fill="#fff" stroke="${C.ink}" stroke-width="7"/><path d="M 0 -32 L 48 -32 A 32 32 0 0 1 48 32 L 0 32 Z" fill="#e8776a" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/><path d="M -56 -14 L -24 -14" stroke="#d9d2c2" stroke-width="7" stroke-linecap="round"/></g>`, { s });
SCENES.push({
  id: 'bacteria',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A 黄色や緑だと、細菌の病気？ → 色だけではわからない
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      let a = pop(tissuePic(MC.yellow, 1.3), t, c0 + 0.2, 470, 400) + pop(tissuePic(MC.green, 1.3), t, c0 + 0.6, 760, 400);
      a += pop(badge('きいろ', { fill: MC.yellowDk, size: 40 }), t, c0 + 0.4, 470, 560) + pop(badge('みどり', { fill: MC.greenDk, size: 40 }), t, c0 + 0.8, 760, 560);
      a += g(arrow2(920, 400, 1050, 400, C.ochre, 18), { o: prog(t, mid(0, 0.4), 0.3) });
      a += pop(card(600, 360) + germ(-150, -30, 1.5, -10) + germ(40, -84, 1.2, 12) + germ(-30, 44, 1.3, 4) + text(200, -30, '？', { size: 170, w: 900, fill: C.ochre }) + text(0, 132, 'さいきんの びょうき？', { size: 44, w: 900 }), t, mid(0, 0.45), 1400, 400);
      a += g(cross(1400, 380, 1.5), { o: prog(t, c1 + 0.5, 0.25), s: 1 });
      a += pop(badge('いろだけでは わからない', { fill: C.redUi, size: 52, pad: 44 }), t, c1 + 0.9, 960, 720);
      out += g(a, { o: aO });
    }
    // B ドイツの研究：136件のうち22件
    const bO = win(t, c2 - 0.2, c3 - 0.2, 0.4);
    if (bO > 0) {
      const GX = 150, GY = 300, SP = 54, fS = mid(2, 0.56);
      let b = pop(badge('ドイツの けんきゅう（2009ねん）', { fill: C.ochre, size: 38 }), t, c2 + 0.1, 600, 210);
      GRID.forEach(([cx, cy], i) => {
        const st = c2 + 0.5 + (cx + cy) * 0.05, kk = prog(t, st, 0.3); if (kk <= 0) return;
        const j = FOUND.indexOf(i), f = j >= 0 ? prog(t, fS + j * 0.11, 0.3) : 0, x = GX + cx * SP, y = GY + cy * SP;
        b += `<circle cx="${x}" cy="${y}" r="${20 * Math.max(back(kk), 0.001) * (1 + 0.2 * Math.sin(f * Math.PI))}" fill="${f > 0.5 ? MC.germ : (i * 7 + cy) % 3 ? MC.yellow : MC.green}" stroke="${f > 0.5 ? MC.germDk : '#8f9a3a'}" stroke-width="${f > 0.5 ? 6 : 3}"/>`;
        if (f > 0.5) b += `<circle cx="${x - 6}" cy="${y - 2}" r="3" fill="${C.ink}"/><circle cx="${x + 6}" cy="${y - 2}" r="3" fill="${C.ink}"/>`;
      });
      b += g(text(0, 0, 'せきの でる おとなの、きいろや みどりの たん', { size: 36, w: 700, fill: C.muted }), { x: 582, y: 760, o: prog(t, c2 + 1.0, 0.4) });
      let r = card(680, 420);
      r += text(0, -140, 'しらべた たん', { size: 42, w: 900, fill: C.muted }) + text(0, -66, '136けん', { size: 84, w: 900 });
      r += g(`<line x1="-280" y1="-6" x2="280" y2="-6" stroke="${C.line}" stroke-width="5"/>` + `<circle cx="-250" cy="42" r="20" fill="${MC.germ}" stroke="${MC.germDk}" stroke-width="6"/>` + text(-216, 44, 'さいきんが みつかった', { size: 40, w: 900, fill: MC.germDk, anchor: 'start' }) + text(0, 132, '22けん', { size: 100, w: 900, fill: MC.germDk }), { o: prog(t, fS + 0.3, 0.4) });
      b += pop(r, t, c2 + 1.2, 1480, 490);
      out += g(b, { o: bO });
    }
    // C かぜの鼻水に、細菌をやっつける薬は効かない
    const cO = prog(t, c3 - 0.1, 0.4);
    if (cO > 0) {
      let c = pop(tissuePic(MC.yellow, 1.15), t, c3 + 0.2, 380, 400) + pop(tissuePic(MC.green, 1.15), t, mid(3, 0.22), 720, 400);
      c += pop(badge('きいろでも', { fill: MC.yellowDk, size: 40 }), t, mid(3, 0.2), 380, 550) + pop(badge('みどりでも', { fill: MC.greenDk, size: 40 }), t, mid(3, 0.32), 720, 550);
      const pS = mid(3, 0.48);
      c += pop(card(640, 330) + capsule(1.7) + text(0, 126, 'さいきんを やっつける くすり', { size: 36, w: 900 }), t, pS, 1360, 400);
      c += g(cross(1360, 370, 1.5), { o: prog(t, mid(3, 0.8), 0.25) });
      c += pop(badge('かぜの はなみずには きかない', { fill: C.redUi, size: 52, pad: 44 }), t, mid(3, 0.8) + 0.3, 960, 720);
      out += g(c, { o: cO });
    }
    return out;
  },
});

// 8. 色より、続いている日数
const calIcon = (s = 1) => g(`<rect x="-40" y="-34" width="80" height="72" rx="10" fill="#fff" stroke="${C.blueUi}" stroke-width="7"/><rect x="-40" y="-34" width="80" height="22" rx="8" fill="${C.blueUi}"/><circle cx="-18" cy="10" r="6" fill="${C.blueUi}"/><circle cx="2" cy="10" r="6" fill="${C.blueUi}"/><circle cx="22" cy="10" r="6" fill="${C.blueUi}"/>`, { s });
const stetho = (s = 1) => g(`<path d="M -26 -46 L -26 -6 A 26 26 0 0 0 26 -6 L 26 -46" fill="none" stroke="${C.blueUi}" stroke-width="9" stroke-linecap="round"/><path d="M 0 20 L 0 34 Q 0 62 28 62 Q 54 62 54 36" fill="none" stroke="${C.blueUi}" stroke-width="9" stroke-linecap="round"/><circle cx="54" cy="24" r="14" fill="#fff" stroke="${C.blueUi}" stroke-width="8"/><circle cx="-26" cy="-50" r="7" fill="${C.blueUi}"/><circle cx="26" cy="-50" r="7" fill="${C.blueUi}"/>`, { s });
SCENES.push({
  id: 'days',
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // 色 より 日数
    const dim = eo(prog(t, mid(0, 0.3), 0.5));
    out += g(pop(card(430, 150) + [MC.clear, MC.yellow, MC.green].map((c, i) => `<circle cx="${-120 + i * 62}" cy="0" r="24" fill="${c}" stroke="${mix(c, '#000000', 0.25)}" stroke-width="4"/>`).join('') + text(110, 2, 'いろ', { size: 54, w: 900 }), t, c0, 520, 250), { o: 1 - 0.55 * dim });
    out += pop(text(0, 0, 'より', { size: 48, w: 900, fill: C.muted }), t, mid(0, 0.25), 840, 252);
    const bk = prog(t, mid(0, 0.45), 0.5);
    out += pop(`<rect x="-345" y="-93" width="690" height="186" rx="40" fill="none" stroke="${C.ochre}" stroke-width="9" opacity="${bk}"/>` + card(650, 150) + g(calIcon(1.0), { x: -262 }) + text(-196, 2, 'つづいて いる にっすう', { size: 46, w: 900, anchor: 'start' }), t, mid(0, 0.4), 1300, 250);
    // 14日ぶんのカレンダー
    const X0 = 172, SP = 121, Y = 510;
    for (let d = 1; d <= 14; d++) {
      const st = mid(0, 0.6) + d * 0.12, kk = prog(t, st, 0.35); if (kk <= 0) continue;
      const hot = d >= 10 ? prog(t, c1 + 0.3 + (d - 10) * 0.12, 0.3) : 0, x = X0 + (d - 1) * SP;
      out += g(`<rect x="-52" y="-70" width="104" height="140" rx="18" fill="${mix('#ffffff', '#fbe3b0', hot)}" stroke="${mix('#d3c8b1', C.ochre, hot)}" stroke-width="${5 + 3 * hot}"/>` + ctext(0, -32, String(d), { size: 44, w: 900, fill: hot > 0.5 ? C.ochre : C.ink }) +
        `<path d="M 0 2 C 10 16 16 24 16 32 A 16 16 0 0 1 -16 32 C -16 24 -10 16 0 2 Z" fill="${MC.clear}" stroke="#7fb5cf" stroke-width="3.5"/>`, { x, y: Y, s: Math.max(back(kk), 0.001) });
    }
    out += g(text(X0 - 52, 0, 'はなみずが つづいた ひ（なんにちめ）', { size: 36, w: 900, fill: C.muted, anchor: 'start' }), { x: 0, y: 396, o: prog(t, mid(0, 0.6), 0.4) });
    // 10〜14日より長く
    const lk = prog(t, c1 + 0.9, 0.5);
    if (lk > 0) {
      const xa = X0 + 9 * SP - 52, xb = X0 + 13 * SP + 52;
      out += g(`<path d="M ${xa} 606 L ${xa} 630 L ${xb} 630 L ${xb} 606" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` + arrow2(xa + 240, 630, xa + 240, 668, C.ochre, 10), { o: lk });
      out += pop(badge('10〜14にちより ながく つづく', { fill: C.ochre, size: 42 }), t, c1 + 1.3, 1420, 716);
    }
    out += pop(card(660, 130) + g(stetho(0.85), { x: -276, y: -4 }) + text(-176, 2, 'おいしゃさんに そうだん', { size: 42, w: 900, fill: C.blueUi, anchor: 'start' }), t, mid(1, 0.6), 560, 716);
    return out;
  },
});

// 9. 正解 と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 350, NX = -560, L1 = 'からだを まもる はっけっきゅうが、', L2 = 'たくさん あつまって いるから', sz = Math.min(fit(L1, 1040, 46, 900), fit(L2, 1040, 46, 900));
      let a = pop(card(1300, 200) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, -32, L1, { size: sz, w: 900, anchor: 'start' }) + text(NX + 96, 34, L2, { size: sz, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -136, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += flowRow([['とうめい', C.blueUi], ['しろ・きいろ', MC.yellowDk], ['みどりっぽい', MC.greenDk]], t, 960, 600, { start: 2.4, step: 0.9, size: 40, gap: 70 });
      a += pop(wbc2(0, 0, 56, NOW.t, { i: 2 }), t, 3.2, 960, 716);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const smile = `<circle r="26" fill="#ffe08a" stroke="${C.ink}" stroke-width="5"/><circle cx="-9" cy="-6" r="3.5" fill="${C.ink}"/><circle cx="9" cy="-6" r="3.5" fill="${C.ink}"/><path d="M -11 7 Q 0 17 11 7" fill="none" stroke="${C.ink}" stroke-width="4.5" stroke-linecap="round"/>`;
      const items = [
        [g(tissuePic(MC.yellow, 0.3)), 'はなを かんだ ティッシュの いろを みくらべる', C.ink, cue(1)],
        [g(calIcon(0.62)), '1にちめ・3にちめ・なおりかけ', C.ink, cue(2)],
        [qm, 'なんにちめに いろが かわる？', C.ink, mid(2, 0.55)],
        [smile, 'だんだん げんきに なって いくかも みる', C.accent, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'ティッシュは すぐ すてて、てを あらう', C.red, cue(4)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 850, 42, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 310 + i * 100); });
      // 3まいのティッシュ
      const PX = 1500, PY = 500, hi = Math.floor(t * 0.9) % 3;
      let p = card(720, 440, { fill: MC.room });
      [['1にちめ', MC.clear], ['3にちめ', MC.yellow], ['なおりかけ', MC.green]].forEach(([s, col], i) => {
        p += g(tissuePic(col, 0.86) + ctext(0, 118, s, { size: 34, w: 900 }) + (i === hi ? `<rect x="-100" y="-96" width="200" height="250" rx="24" fill="none" stroke="${C.ochre}" stroke-width="7"/>` : ''), { x: -224 + i * 224, y: -30 });
        if (i) p += arrow2(-224 + i * 224 - 128, -30, -224 + i * 224 - 96, -30, C.ochre, 8);
      });
      b += pop(p, t, cue(1) + 0.4, PX, PY);
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
    out += g(text(0, 0, 'くわしくは サイトの「はなみずの いろが かわるのは なぜ」へ ／ 出典は 概要欄に', { size: 32, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 778, o: prog(t, 2.0, 0.5) });
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

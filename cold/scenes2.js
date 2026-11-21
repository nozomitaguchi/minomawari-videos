// ---------- かぜの道具 ----------
const SKIN = '#f6d6bd', SKIN2 = '#ecc0a2', HAIR = '#3a2a22';
const VCOL = ['#7cbf5a', '#e0a33a', '#d7685a', '#6a9fd8', '#a07ad6', '#4fb3a6'];
// ウイルス（とげのある小さなつぶ）
function virus(x, y, r, { col = VCOL[0], rot = 0, o = 1, face = true } = {}) {
  const dk = mix(col, '#000000', 0.28);
  let sp = '';
  for (let k = 0; k < 10; k++) {
    const a = k * Math.PI / 5, c = Math.cos(a), s = Math.sin(a);
    sp += `<line x1="${c * r * 0.85}" y1="${s * r * 0.85}" x2="${c * r * 1.32}" y2="${s * r * 1.32}" stroke="${dk}" stroke-width="${r * 0.16}" stroke-linecap="round"/><circle cx="${c * r * 1.36}" cy="${s * r * 1.36}" r="${r * 0.17}" fill="${dk}"/>`;
  }
  let b = `<g transform="rotate(${rot})">${sp}</g><circle r="${r}" fill="${col}"/><circle cx="${-r * 0.32}" cy="${-r * 0.34}" r="${r * 0.24}" fill="#fff" opacity="0.35"/>`;
  if (face && r > 9) b += `<circle cx="${-r * 0.3}" cy="${-r * 0.05}" r="${r * 0.12}" fill="${C.ink}"/><circle cx="${r * 0.3}" cy="${-r * 0.05}" r="${r * 0.12}" fill="${C.ink}"/><path d="M ${-r * 0.25} ${r * 0.3} Q 0 ${r * 0.48} ${r * 0.25} ${r * 0.3}" fill="none" stroke="${C.ink}" stroke-width="${r * 0.09}" stroke-linecap="round"/>`;
  return g(b, { x, y, o });
}
// 白血球（体を守るなかま）
function wbc(x, y, r, t, { o = 1, i = 0 } = {}) {
  const w = Math.sin(t * 3 + i) * 0.05;
  let b = `<ellipse rx="${r * (1 + w)}" ry="${r * (1 - w)}" fill="#f1eafc" stroke="#b49ddc" stroke-width="${r * 0.08}"/>`;
  b += `<circle cx="${-r * 0.36}" cy="${r * 0.18}" r="${r * 0.26}" fill="#a184d6"/><circle cx="0" cy="${r * 0.34}" r="${r * 0.26}" fill="#a184d6"/><circle cx="${r * 0.36}" cy="${r * 0.18}" r="${r * 0.26}" fill="#a184d6"/>`;
  b += `<ellipse cx="${-r * 0.24}" cy="${-r * 0.32}" rx="${r * 0.09}" ry="${r * 0.13}" fill="${C.ink}"/><ellipse cx="${r * 0.24}" cy="${-r * 0.32}" rx="${r * 0.09}" ry="${r * 0.13}" fill="${C.ink}"/>`;
  b += `<path d="M ${-r * 0.16} ${-r * 0.1} Q 0 ${r * 0.02} ${r * 0.16} ${-r * 0.1}" fill="none" stroke="${C.ink}" stroke-width="${r * 0.07}" stroke-linecap="round"/>`;
  return g(b, { x, y, o });
}
// 体温計（lv 0〜1 で赤い柱がのびる）。mark を書くと「めもり」の矢印が出る
function thermo(x, y, lv, { s = 1, mark = null, markO = 1, label = 'めもり', ticks = true } = {}) {
  let b = `<circle cx="0" cy="170" r="62" fill="#fff" stroke="${C.ink}" stroke-width="9"/><rect x="-36" y="-286" width="72" height="440" rx="36" fill="#fff" stroke="${C.ink}" stroke-width="9"/>`;
  b += `<circle cx="0" cy="170" r="53" fill="#fff"/><rect x="-27" y="-277" width="54" height="440" rx="27" fill="#fff"/>`;
  if (ticks) for (let k = 0; k < 9; k++) b += `<line x1="16" y1="${100 - k * 40}" x2="30" y2="${100 - k * 40}" stroke="#b9b2a2" stroke-width="5" stroke-linecap="round"/>`;
  const top = lerp(110, -250, clamp(lv));
  b += `<rect x="-18" y="${top}" width="36" height="${178 - top}" rx="18" fill="${C.red}"/><circle cx="0" cy="170" r="42" fill="${C.red}"/><circle cx="-14" cy="156" r="12" fill="#fff" opacity="0.45"/>`;
  if (mark !== null && markO > 0) {
    const my = lerp(110, -250, clamp(mark));
    b += g(`<path d="M -52 ${my} L -96 ${my - 26} L -96 ${my + 26} Z" fill="${C.ochre}"/>` + text(-112, my + 2, label, { size: 42, w: 900, fill: C.ochre, anchor: 'end' }), { o: markO });
  }
  return g(b, { x, y, s });
}
// 横から見た頭（右向き）。airway: 鼻とのどの道、brain: 脳、nerve: 鼻の神経
function headSide(x, y, s, t, { airway = 0, brain = 0, spot = 0, nerve = 0, flush = 0, eyes = 'open' } = {}) {
  let b = `<path d="M -250 520 Q -240 380 -90 360 L 60 360 Q 200 380 210 520 Z" fill="#e0715f"/>`;
  b += `<rect x="-70" y="120" width="120" height="260" rx="40" fill="${SKIN2}"/>`;
  b += `<path d="M 180 -36 Q 236 34 218 60 Q 206 76 176 70 Z" fill="${SKIN}"/>`;
  b += `<circle r="190" fill="${SKIN}"/>`;
  b += `<path d="M -188 40 Q -200 -150 -40 -190 Q 120 -214 186 -70 Q 120 -120 30 -120 Q -60 -110 -110 -40 Q -140 10 -150 70 Z" fill="${HAIR}"/>`;
  b += `<ellipse cx="-40" cy="30" rx="34" ry="44" fill="${SKIN2}"/>`;
  if (eyes === 'closed') b += `<path d="M 94 -28 Q 112 -16 130 -28" fill="none" stroke="${CH.line}" stroke-width="7" stroke-linecap="round"/>`;
  else b += `<ellipse cx="114" cy="-30" rx="12" ry="17" fill="${CH.line}"/><circle cx="118" cy="-36" r="5" fill="#fff"/>`;
  b += `<path d="M 130 110 Q 150 124 168 112" fill="none" stroke="${CH.line}" stroke-width="7" stroke-linecap="round"/>`;
  b += `<circle cx="120" cy="50" r="28" fill="${CH.cheek}" opacity="${0.45 + 0.5 * flush}"/>`;
  if (airway > 0) b += g(`<path d="M 204 60 L 120 34 Q 34 18 24 96 L 24 380" fill="none" stroke="#e98f9b" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/><path d="M 204 60 L 120 34 Q 34 18 24 96 L 24 380" fill="none" stroke="#f7c3c9" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`, { o: airway });
  if (brain > 0) {
    let br = `<ellipse cx="-10" cy="-70" rx="140" ry="92" fill="#f2b8c6" stroke="#d98aa0" stroke-width="7"/>`;
    br += `<path d="M -110 -90 Q -80 -130 -40 -100 Q -10 -140 30 -105 Q 70 -135 100 -90 M -120 -40 Q -80 -70 -40 -45 Q 0 -75 40 -45 Q 80 -70 112 -40" fill="none" stroke="#d98aa0" stroke-width="7" stroke-linecap="round"/>`;
    b += g(br, { o: brain });
  }
  if (spot > 0) b += g(`<circle cx="30" cy="-10" r="${34 + 6 * Math.sin(t * 5)}" fill="${C.yellow}" opacity="0.45" filter="url(#soft)"/><circle cx="30" cy="-10" r="16" fill="${C.ochre}"/>`, { o: spot });
  if (nerve > 0) b += g(`<path d="M 170 44 Q 120 10 90 -10 Q 60 -30 30 -60" fill="none" stroke="${C.yellow}" stroke-width="12" stroke-linecap="round" stroke-dasharray="20 12" stroke-dashoffset="${-t * 60}"/>`, { o: nerve });
  return g(b, { x, y, s });
}
// 指し線つきのラベル
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` + g(badge(str, { fill: col, size }), { x: tx, y: ty }), { o });
};
// 部屋（かべ・まど・ゆか）
function room() {
  let o = `<rect width="1920" height="1080" fill="#f6ecdc"/>`;
  o += `<rect x="150" y="150" width="380" height="300" rx="16" fill="#cfe8f6" stroke="#d8c3a2" stroke-width="18"/><line x1="340" y1="150" x2="340" y2="450" stroke="#d8c3a2" stroke-width="12"/><line x1="150" y1="300" x2="530" y2="300" stroke="#d8c3a2" stroke-width="12"/>`;
  o += cloud(270, 240, 0.35, '#fff') + cloud(450, 380, 0.25, '#fff');
  o += `<rect x="0" y="780" width="1920" height="300" fill="#e2c9a3"/><rect x="0" y="780" width="1920" height="10" fill="#cfb38a"/>`;
  return o;
}
// 毛布にくるまった子（足もと x, y、大きさ s）。kidShow の絵に毛布をかぶせる
function blanket(x, y, s, k = 1) {
  const S = s / 0.62;
  const p = `M ${-84 * S} ${-120 * S} Q 0 ${-134 * S} ${84 * S} ${-120 * S} Q ${132 * S} ${-60 * S} ${124 * S} 0 L ${-124 * S} 0 Q ${-132 * S} ${-60 * S} ${-84 * S} ${-120 * S} Z`;
  let b = `<path d="${p}" fill="#6a9fd8"/>`;
  b += `<path d="M ${-112 * S} ${-62 * S} Q 0 ${-74 * S} ${112 * S} ${-62 * S} M ${-122 * S} ${-24 * S} Q 0 ${-36 * S} ${122 * S} ${-24 * S}" fill="none" stroke="#fffaf0" stroke-width="${8 * S}" opacity="0.8"/>`;
  b += `<path d="M ${-84 * S} ${-120 * S} Q 0 ${-134 * S} ${84 * S} ${-120 * S}" fill="none" stroke="#4f86c0" stroke-width="${10 * S}" stroke-linecap="round"/>`;
  return g(b, { x, y, s: Math.max(k, 0.001) });
}
// ふるえの線
const shakeLines = (x, y, h, t, o = 1, col = '#5b8fd0', w = 30) => o <= 0 ? '' : g([-1, 1].map(sd =>
  `<path d="M ${sd * w} ${-h / 2} q ${sd * 14} ${h / 8} 0 ${h / 4} q ${-sd * 14} ${h / 8} 0 ${h / 4} q ${sd * 14} ${h / 8} 0 ${h / 4} q ${-sd * 14} ${h / 8} 0 ${h / 4}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" transform="translate(${sd * (8 + 4 * Math.sin(t * 30))} 0)"/>` +
  `<path d="M ${sd * (w + 32)} ${-h / 3} q ${sd * 12} ${h / 10} 0 ${h / 5} q ${-sd * 12} ${h / 10} 0 ${h / 5}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" opacity="0.7"/>`).join(''), { x, y, o });
// 湯気のような「あつい」線
const heatLines = (x, y, t, o = 1) => o <= 0 ? '' : g([-36, 0, 36].map((dx, i) =>
  `<path d="M ${dx} 0 q 12 -16 0 -32 q -12 -16 0 -32" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round" opacity="${0.5 + 0.5 * Math.sin(t * 5 + i)}"/>`).join(''), { x, y, o });
// 鼻の中を切って見た絵（上が鼻の中の空気、まん中が細胞、下に血の管）
function tissue(t, { cellY = 420, vein = 0, crack = 0, vx0 = 120, vx1 = 1560 } = {}) {
  const W = vx1 - vx0, n = 9, cw = W / n;
  let o = `<rect x="${vx0}" y="${cellY + 40}" width="${W}" height="${380}" rx="30" fill="#f6d3cc"/>`;
  // 血の管（vein 0〜1 でふくらむ）
  const vh = 60 + 70 * vein, vy = cellY + 210 - vein * 10;
  o += `<rect x="${vx0}" y="${vy - vh / 2}" width="${W}" height="${vh}" rx="${vh / 2}" fill="#d9504a"/><rect x="${vx0}" y="${vy - vh / 2 + 10}" width="${W}" height="${vh * 0.25}" rx="${vh * 0.12}" fill="#ef8a7f" opacity="0.6"/>`;
  for (let k = 0; k < n; k++) {
    const x = vx0 + k * cw, cr = crack * (k % 3 === 1 ? 1 : 0.6);
    const cx = x + cw / 2;
    o += `<rect x="${x + 6}" y="${cellY - 50}" width="${cw - 12}" height="100" rx="26" fill="#f7b9ad" stroke="#de8e82" stroke-width="5"/>`;
    o += `<circle cx="${cx}" cy="${cellY + 6}" r="17" fill="#c9746a"/>`;
    for (let j = 0; j < 5; j++) o += `<line x1="${x + 24 + j * (cw - 48) / 4}" y1="${cellY - 50}" x2="${x + 24 + j * (cw - 48) / 4 + 6 * Math.sin(t * 4 + j + k)}" y2="${cellY - 74}" stroke="#de8e82" stroke-width="5" stroke-linecap="round"/>`;
    if (cr > 0) o += `<path d="M ${cx - 20} ${cellY - 50} L ${cx} ${cellY - 14} L ${cx - 12} ${cellY + 14} L ${cx + 12} ${cellY + 50}" fill="none" stroke="#7a3a32" stroke-width="7" stroke-linejoin="round" opacity="${cr}"/>`;
  }
  return o;
}
// 体の形（前から）。vas: 手足の血の管の太さ（1 ふつう → 0.3 しぼる）、cold: 手足の冷たさ
function bodyFig(x, y, s, t, { vas = 1, cold = 0, warm = 0 } = {}) {
  const limb = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SKIN}" stroke-width="62" stroke-linecap="round"/>`;
  const hand = mix(SKIN, '#9cc4ec', cold);
  let b = limb(-80, -230, -170, -40) + limb(80, -230, 170, -40) + limb(-44, -30, -64, 200) + limb(44, -30, 64, 200);
  b += `<circle cx="-170" cy="-40" r="36" fill="${hand}"/><circle cx="170" cy="-40" r="36" fill="${hand}"/><ellipse cx="-70" cy="214" rx="44" ry="28" fill="${hand}"/><ellipse cx="70" cy="214" rx="44" ry="28" fill="${hand}"/>`;
  b += `<rect x="-100" y="-260" width="200" height="250" rx="70" fill="${SKIN}"/><circle cx="0" cy="-340" r="78" fill="${SKIN}"/>`;
  if (warm > 0) b += `<ellipse cx="0" cy="-140" rx="${80 + 6 * Math.sin(t * 6)}" ry="${100 + 6 * Math.sin(t * 6)}" fill="${C.red}" opacity="${0.35 * warm}" filter="url(#soft)"/>`;
  const w = 14 * vas + 3;
  const vs = [[-30, -180, -170, -40], [30, -180, 170, -40], [-20, -60, -66, 200], [20, -60, 66, 200]];
  vs.forEach(([x1, y1, x2, y2]) => { b += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#d9504a" stroke-width="${w}" stroke-linecap="round" opacity="0.85"/>`; });
  b += `<path d="M 0 -250 L 0 -60" stroke="#d9504a" stroke-width="18" stroke-linecap="round" opacity="0.85"/>`;
  return g(b, { x, y, s });
}
// ! の三角
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
// 人のかたち（おとな・こども）
const person = (h, col) => `<circle cx="0" cy="${-h + 30}" r="${h * 0.14}" fill="${col}"/><rect x="${-h * 0.16}" y="${-h + 30 + h * 0.18}" width="${h * 0.32}" height="${h * 0.8 - 30}" rx="${h * 0.12}" fill="${col}"/>`;

// 1. つかみ：あついのに、ぶるぶる
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = room();
    // 体温計のカード
    const cO = prog(t, cue(0) + 0.3, 0.5);
    if (cO > 0) {
      const lv = lerp(0.3, 0.78, eio(prog(t, cue(0) + 0.6, 2.4)));
      let c = card(380, 600) + text(0, -240, 'ねつ', { size: 52, w: 900, fill: C.red });
      c += thermo(0, 30, lv, { s: 0.82 });
      out += g(c, { x: 1530, y: 420, o: cO, s: lerp(0.94, 1, eo(cO)) });
    }
    // おとうと（毛布にくるまって、ふるえる）
    const shk = prog(t, cue(1) + 0.6, 0.3) * (1 - prog(t, cueE(3) + 0.3, 0.3));
    const jx = shk * Math.sin(t * 38) * 4;
    const BX = 1010, BY = 840, BS = 0.74;
    let bro = kidShow('B', t, BX, BY, { s: BS, start: 0, n: 1, enter: 'pop', bubble: false, mouth: 'flat', look: [-4, -2] });
    bro += blanket(BX, BY, BS, back(clamp(t / 0.6)));
    out += g(bro, { x: jx });
    out += heatLines(BX + 4, BY - 450, t, win(t, cue(0) + 0.8, cue(1) + 0.4, 0.3));
    out += pop(badge('あつい', { fill: C.red, size: 40 }), t, cue(0) + 1.4, BX + 220, BY - 470, { end: cue(1) + 0.4 });
    out += shakeLines(BX, BY - 110, 190, t, shk, '#5b8fd0', 165);
    out += pop(badge('さむい…', { fill: '#4f86c0', size: 40 }), t, cue(1) + 1.8, BX + 260, BY - 330, { end: cueE(3) + 0.4 });
    // おねえちゃん（吹き出し）
    out += kidShow('S', t, 720, BY, { s: 0.72, start: 0.3, n: 0, look: [6, -4], side: 'left' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1260, y: 260, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.accent}">かぜ</tspan>を ひくと、</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.red}">ねつ</tspan>が でるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = thermo(-90, 0, 0.75, { s: 0.38 }) + virus(70, -10, 44, { col: VCOL[0] }) + text(170, -10, '？', { size: 90, w: 900, fill: C.ochre });
      out += pop(ic, t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと思う？', { size: 84, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'からだが、じぶんで ねつを つくっている'], ['②', 'ウイルスが、ねつを だしている'], ['③', 'せきを たくさんして、からだが あたたまる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 48, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(thermo(-40, 0, 0.7, { s: 0.42 }) + text(70, -60, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1720, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. かぜのもと：ウイルス
const VSPOT = [[1080, 300], [1240, 420], [1160, 560], [1340, 260], [1400, 520], [1000, 460]];
SCENES.push({
  id: 'virus',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sh = eio(prog(t, cue(1) - 0.4, 0.8));
    const HX = lerp(700, 470, sh), HY = 470, HS = lerp(1, 0.86, sh);
    const aw = prog(t, cue(0) + 1.0, 0.6);
    out += headSide(HX, HY, HS, t, { airway: aw });
    // ウイルスが鼻とのどへ
    const targets = [[204, 60], [130, 36], [60, 30], [24, 140], [24, 230], [24, 300]];
    for (let i = 0; i < 6; i++) {
      const k = eio(prog(t, cue(0) + 1.6 + i * 0.35, 1.4));
      if (k <= 0) continue;
      const [tx, ty] = targets[i];
      const ex = HX + tx * HS, ey = HY + ty * HS;
      const sx = HX + 900 + i * 40, sy = HY - 260 + i * 90;
      out += virus(lerp(sx, ex, k), lerp(sy, ey, k) + Math.sin(t * 3 + i) * 6 * (1 - k), 16, { col: VCOL[i % 3], rot: t * 40 + i * 20 });
    }
    out += callout(HX + 150 * HS, HY + 34 * HS, HX + 360 * HS, HY - 150 * HS, 'はな', aw * (1 - sh), { col: '#c25a6a', size: 42 });
    out += callout(HX + 24 * HS, HY + 250 * HS, HX + 330 * HS, HY + 230 * HS, 'のど', aw * (1 - sh), { col: '#c25a6a', size: 42 });
    out += pop(badge('ウイルス', { fill: '#5e9a3e', size: 48 }), t, cue(0) + 2.6, 1420, 210, { end: cue(1) - 0.3 });
    // 目では見えない
    const mO = win(t, cue(1) - 0.1, cue(2) - 0.2, 0.4);
    if (mO > 0) {
      let m = `<circle r="230" fill="#fff" stroke="${C.blueUi}" stroke-width="20"/><rect x="150" y="150" width="46" height="170" rx="23" fill="${C.ochre}" transform="rotate(-45 150 150)"/>`;
      m += virus(0, 0, 90, { col: VCOL[0], rot: t * 20 });
      out += g(m, { x: 1280, y: 420, o: mO, s: lerp(0.9, 1, eo(mO)) });
      out += g(eyeIcon(0.42) + cross(0, 0, 0.6), { x: 1650, y: 210, o: prog(t, cue(1) + 1.2, 0.3) * mO });
      out += pop(badge('めでは みえない', { fill: C.blueUi, size: 44 }), t, cue(1) + 1.6, 1280, 760, { end: cue(2) - 0.2 });
    }
    // 200しゅるい いじょう
    const vO = prog(t, cue(2) - 0.1, 0.4);
    if (vO > 0) {
      for (let i = 0; i < 24; i++) {
        const k = prog(t, cue(2) + 0.1 + i * 0.07, 0.4);
        if (k <= 0) continue;
        const x = 1000 + (i % 6) * 140 + (Math.floor(i / 6) % 2) * 50, y = 290 + Math.floor(i / 6) * 120;
        out += g(virus(0, 0, 26 + (i * 7) % 14, { col: VCOL[i % 6], rot: i * 37 + t * 15, face: true }), { x, y: y + Math.sin(t * 2 + i) * 5, s: Math.max(back(k), 0.001) });
      }
      out += pop(badge('200しゅるい いじょう', { fill: C.ochre, size: 50, pad: 40 }), t, cue(2) + 1.2, 1350, 200);
      out += pop(badge('なんども かぜを ひく', { fill: C.redUi, size: 42 }), t, cue(2) + 3.4, 1350, 790);
    }
    return out;
  },
});

// 4. ウイルスは、鼻の細胞をほとんどこわさない
SCENES.push({
  id: 'cells',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#fdf3ec"/>` + topBadge();
    out += `<rect x="120" y="150" width="1440" height="200" rx="30" fill="#e6f2f8"/>`;
    out += g(text(0, 0, 'はなの なかの くうき', { size: 36, w: 700, fill: '#6a8ea3' }), { x: 340, y: 200, o: prog(t, 0.3, 0.4) });
    // A こわれる？（想像）
    const q = win(t, cue(0) + 0.4, cue(1) + 0.2, 0.4);
    out += tissue(t, { cellY: 420, crack: q * eo(prog(t, cue(0) + 1.4, 0.6)) });
    out += callout(1400, 420, 1720, 300, 'さいぼう', prog(t, 0.6, 0.4), { col: '#c25a6a', size: 40 });
    // くっついたウイルス
    for (let i = 0; i < 6; i++) {
      const k = eo(prog(t, 0.4 + i * 0.2, 0.8));
      const x = 220 + i * 230, y = lerp(200, 336, k);
      out += virus(x, y + Math.sin(t * 2.4 + i) * 3, 22, { col: VCOL[i % 3], rot: t * 30 + i * 40, o: Math.min(1, k * 3) });
    }
    out += pop(badge('こわしてる？', { fill: C.redUi, size: 44 }), t, cue(0) + 1.8, 840, 750, { end: cue(1) + 0.2 });
    // B ほとんどこわれていない
    out += pop(badge('いちばん おおい かぜの ウイルス', { fill: '#5e9a3e', size: 38 }), t, cue(1) + 0.6, 840, 110, { end: cue(2) + 0.3 });
    const okO = prog(t, cue(1) + 3.2, 0.4) * (1 - prog(t, cue(2) - 0.3, 0.3));
    if (okO > 0) {
      out += g(`<circle r="58" fill="${C.accent}"/><path d="M -26 2 L -6 22 L 28 -18" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`, { x: 1700, y: 600, o: okO, s: Math.max(back(prog(t, cue(1) + 3.2, 0.4)), 0.001) });
      out += g(badge('ほとんど こわれない', { fill: C.accent, size: 46 }), { x: 840, y: 750, o: okO });
    }
    // C 体の「こたえ」
    const cO = prog(t, cue(2) - 0.1, 0.4);
    if (cO > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.88 * cO}"/>`;
      let c = card(1100, 420);
      c += virus(-380, -40, 46, { col: VCOL[0], rot: t * 30 });
      c += `<path d="M -300 -40 L -200 -40 M -226 -62 L -200 -40 L -226 -18" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
      c += bodyFig(-60, 40, 0.38, t, { warm: 0.6 });
      c += text(-60, 150, 'からだ', { size: 40, w: 900 });
      c += `<path d="M 40 -40 L 140 -40 M 114 -62 L 140 -40 L 114 -18" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
      c += g(chipStack(t, cue(2) + 1.0), { x: 330, y: -40 });
      c += text(0, -160, 'からだの「こたえ」', { size: 56, w: 900, fill: C.accent });
      out += g(c, { x: 900, y: 460, o: cO, s: lerp(0.95, 1, eo(cO)) });
    }
    return out;
  },
});
function chipStack(t, t0) {
  return pop(badge('はなみず', { fill: '#6a9fd8', size: 40 }), t, t0, 0, -70) + pop(badge('ねつ', { fill: C.red, size: 40 }), t, t0 + 0.4, 0, 30) + pop(badge('くしゃみ', { fill: C.ochre, size: 40 }), t, t0 + 0.8, 0, 130);
}

// 5. 合図の物質 → 鼻づまり → 白血球が集まる
SCENES.push({
  id: 'signal',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#fdf3ec"/>` + topBadge();
    const sw = eio(prog(t, cue(1) + 0.8, 1.4));
    const cellY = 420 - 110 * sw;
    out += `<rect x="120" y="150" width="1440" height="${Math.max(10, cellY - 70 - 150)}" rx="30" fill="#e6f2f8"/>`;
    out += tissue(t, { cellY, vein: sw });
    for (let i = 0; i < 4; i++) out += virus(300 + i * 360, cellY - 84, 20, { col: VCOL[i % 3], rot: t * 30 + i * 50 });
    // 合図（ひろがる輪と星）
    const sg = prog(t, cue(0) + 1.0, 0.4);
    if (sg > 0) {
      for (let i = 0; i < 4; i++) {
        const cx = 300 + i * 360;
        for (let j = 0; j < 3; j++) {
          const ph = ((t * 0.8 + j / 3 + i * 0.13) % 1);
          out += `<circle cx="${cx}" cy="${cellY}" r="${30 + ph * 160}" fill="none" stroke="${C.yellow}" stroke-width="7" opacity="${sg * (1 - ph) * 0.9}"/>`;
        }
        for (let j = 0; j < 4; j++) {
          const ph = ((t * 0.6 + j / 4 + i * 0.21) % 1), a = j * 1.6 + i;
          const x = cx + Math.cos(a) * ph * 150, y = cellY + 60 + ph * 120 + Math.sin(a) * 20;
          out += `<path d="M ${x} ${y - 14} L ${x + 5} ${y - 5} L ${x + 14} ${y} L ${x + 5} ${y + 5} L ${x} ${y + 14} L ${x - 5} ${y + 5} L ${x - 14} ${y} L ${x - 5} ${y - 5} Z" fill="${C.yellow}" opacity="${sg * (1 - ph)}"/>`;
        }
      }
      out += pop(badge('たいへん！', { fill: C.ochre, size: 46 }), t, cue(0) + 1.6, 1720, 260, { end: cue(1) + 0.4 });
      out += pop(badge('あいずの ぶっしつ', { fill: C.ochre, size: 38 }), t, cue(0) + 3.0, 1720, 380, { end: cue(1) + 0.4 });
    }
    // 鼻がつまる
    out += callout(1400, cellY + 210 - sw * 10, 1720, 640, 'ちの くだ', prog(t, cue(1) + 0.3, 0.4) * (1 - prog(t, cue(2) - 0.3, 0.3)), { col: '#b43c36', size: 40 });
    out += pop(badge('ふくらむ', { fill: '#b43c36', size: 40 }), t, cue(1) + 1.8, 1720, 740, { end: cue(2) - 0.3 });
    out += pop(badge('はなが つまる', { fill: C.blueUi, size: 44 }), t, cue(1) + 2.6, 840, 110, { end: cue(2) + 0.2 });
    // 白血球が血の管を通って集まる
    const wO = prog(t, cue(2) - 0.2, 0.4);
    if (wO > 0) {
      const vy = cellY + 210 - sw * 10;
      for (let i = 0; i < 5; i++) {
        const st = cue(2) + 0.2 + i * 0.45, k = prog(t, st, 1.4), up = eio(prog(t, st + 1.4, 0.9));
        if (k <= 0) continue;
        const tx = 300 + i * 300;
        const x = lerp(60, tx, eio(k)), y = lerp(vy, cellY + 90, up);
        out += wbc(x, y + Math.sin(t * 3 + i) * 4, 36, t, { i, o: Math.min(1, k * 4) });
      }
      out += pop(badge('はっけっきゅう', { fill: '#8a6cc4', size: 44 }), t, cue(2) + 1.6, 840, 110);
    }
    out += kidShow('B', t, 1790, 870, { s: 0.5, start: cue(3) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 6. 鼻水は洗い流す、くしゃみは体が勝手に
SCENES.push({
  id: 'wash',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 640, HY = 430, HS = 0.95;
    const sn = prog(t, cue(1) - 0.2, 0.4);
    const sneezeT = cue(1) + 2.4, burst = prog(t, sneezeT, 0.25) * (1 - prog(t, sneezeT + 2.4, 0.5));
    const recoil = burst > 0 ? Math.sin(clamp((t - sneezeT) / 0.4) * Math.PI) * 14 : 0;
    out += g(headSide(HX, HY, HS, t, { airway: 1, nerve: win(t, cue(1) + 0.6, sneezeT + 0.6, 0.3), eyes: burst > 0.2 ? 'closed' : 'open' }), { r: -recoil * 0.3 });
    // さらさらの鼻水がウイルスを運び出す
    const NX = HX + 214 * HS, NY = HY + 66 * HS;
    const wO = win(t, cue(0) + 0.4, cue(1) - 0.2, 0.4);
    if (wO > 0) {
      for (let i = 0; i < 9; i++) {
        const ph = ((t * 0.45 + i / 9) % 1);
        const x = lerp(HX + 40 * HS, NX + 40, ph), y = ph < 0.75 ? lerp(HY + 30 * HS, NY, ph / 0.75) : NY + (ph - 0.75) * 4 * 260;
        out += `<ellipse cx="${x}" cy="${y}" rx="22" ry="28" fill="#bfe3f7" opacity="${0.85 * wO}"/>`;
        if (i % 3 === 0) out += virus(x, y, 12, { col: VCOL[i % 3], rot: t * 60, face: false, o: wO });
      }
      out += pop(badge('さらさらの はなみず', { fill: '#4f86c0', size: 44 }), t, cue(0) + 1.2, 1350, 330, { end: cue(1) - 0.2 });
      out += pop(badge('ウイルスを あらいながす', { fill: C.blueUi, size: 44 }), t, cue(0) + 3.0, 1350, 450, { end: cue(1) - 0.2 });
    }
    // くしゃみ
    if (sn > 0) {
      out += callout(HX + 110 * HS, HY + 0, 1250, 220, 'はなの しんけい', win(t, cue(1) + 0.8, sneezeT + 0.6, 0.3), { col: C.ochre, size: 40 });
      if (burst > 0) {
        const e = eo(clamp((t - sneezeT) / 0.8));
        for (let i = 0; i < 26; i++) {
          const a = (rnd(i, 3) - 0.5) * 1.0, d = 60 + e * (220 + rnd(i, 4) * 340);
          out += `<circle cx="${NX + Math.cos(a) * d}" cy="${NY + Math.sin(a) * d}" r="${5 + rnd(i, 5) * 9}" fill="#9fd0ee" opacity="${burst * (1 - e * 0.6)}"/>`;
        }
        out += g(text(0, 0, 'ハクション！', { size: 96, w: 900, fill: C.blueUi }), { x: 1350, y: 400, o: burst, s: lerp(1.3, 1, eo(clamp((t - sneezeT) / 0.3))) });
      }
      out += pop(badge('からだが かってに おこす', { fill: C.ochre, size: 44 }), t, sneezeT + 1.2, 1350, 580);
    }
    return out;
  },
});

// 7. 熱：脳の「目もり」が上がる
SCENES.push({
  id: 'fever',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 560, HY = 470, HS = 0.95;
    const br = prog(t, cue(1) - 0.2, 0.6);
    const mk = eio(prog(t, cue(2) + 2.6, 1.2));   // 目もりが上がる
    const body = eio(prog(t, cue(3) + 1.2, 3.2));  // 体温が上がる
    out += headSide(HX, HY, HS, t, { brain: br, spot: prog(t, cue(1) + 1.2, 0.4), flush: body });
    out += pop(badge('ねつは どうして？', { fill: C.red, size: 48 }), t, cue(0) + 0.3, 960, 200, { end: cue(1) - 0.2 });
    // 目もり（体温計の形で）
    const gO = prog(t, cue(1) + 1.6, 0.5);
    if (gO > 0) {
      const SX = HX + 30 * HS, SY = HY - 10 * HS;
      out += `<path d="M ${SX} ${SY} Q ${(SX + 1380) / 2} ${SY - 200} 1330 300" fill="none" stroke="${C.ochre}" stroke-width="6" stroke-dasharray="14 10" opacity="${gO}"/>`;
      let c = card(560, 680);
      c += thermo(60, 40, lerp(0.35, 0.72, body), { s: 1.0, mark: lerp(0.35, 0.78, mk), markO: 1, label: 'めもり' });
      c += g(text(60, 0, 'からだの おんど', { size: 34, w: 900, fill: C.red }), { x: 0, y: 300, o: prog(t, cue(3) + 0.6, 0.4) });
      out += g(c, { x: 1420, y: 470, o: gO, s: lerp(0.94, 1, eo(gO)) });
      out += pop(badge('たいおんを きめる「めもり」', { fill: C.ochre, size: 40 }), t, cue(1) + 2.4, 960, 200, { end: cue(2) + 0.2 });
    }
    // 合図の物質が脳へ
    const aO = win(t, cue(2) + 0.2, cue(3) + 0.4, 0.4);
    if (aO > 0) {
      for (let i = 0; i < 10; i++) {
        const ph = ((t * 0.5 + i / 10) % 1);
        const x = HX + (-20 + 30 * Math.sin(i * 2.3)) * HS, y = lerp(HY + 420 * HS, HY - 10 * HS, ph);
        out += `<path d="M ${x} ${y - 12} L ${x + 4} ${y - 4} L ${x + 12} ${y} L ${x + 4} ${y + 4} L ${x} ${y + 12} L ${x - 4} ${y + 4} L ${x - 12} ${y} L ${x - 4} ${y - 4} Z" fill="${C.yellow}" stroke="${C.ochre}" stroke-width="2" opacity="${aO * Math.min(1, (1 - ph) * 3)}"/>`;
      }
      out += pop(badge('あいずの ぶっしつ', { fill: C.ochre, size: 38 }), t, cue(2) + 0.6, 960, 200, { end: cue(3) + 0.4 });
    }
    out += pop(badge('めもりが あがる', { fill: C.red, size: 44 }), t, cue(2) + 3.4, 1420, 70, { end: cue(3) + 0.6 });
    out += pop(badge('じぶんで たいおんを あげる', { fill: C.red, size: 44 }), t, cue(3) + 1.6, 960, 200);
    out += heatLines(HX + 20, HY - 230 * HS, t, prog(t, cue(3) + 2.4, 0.5));
    return out;
  },
});

// 8. 上がりかけは寒い：血の管をしぼる・ふるえる
SCENES.push({
  id: 'shiver',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#f2f6fa"/>` + topBadge();
    const lv = lerp(0.35, 0.72, eio(prog(t, cue(2) + 0.8, 5.5)));
    // 左：目もりと体温（体温計）
    let c = card(460, 680) + thermo(60, 40, lv, { s: 1.0, mark: 0.78, label: 'めもり' });
    const gap = win(t, cue(0) + 1.4, cue(1) + 0.2, 0.3);
    if (gap > 0) {
      const y1 = 40 + lerp(110, -250, 0.78), y2 = 40 + lerp(110, -250, lv);
      c += g(`<path d="M 130 ${y1} L 150 ${y1} L 150 ${y2} L 130 ${y2}" fill="none" stroke="#4f86c0" stroke-width="7"/>`, { o: gap });
    }
    out += g(c, { x: 330, y: 470 });
    out += pop(badge('まだ ひくい', { fill: '#4f86c0', size: 36 }), t, cue(0) + 1.8, 705, 330, { end: cue(1) + 0.2 });
    // 右：体
    const vas = lerp(1, 0.25, eio(prog(t, cue(1) + 1.0, 1.0)));
    const cold = eio(prog(t, cue(1) + 1.4, 1.2));
    const shk = prog(t, cue(2) + 0.2, 0.3);
    const BX = 1060 + shk * Math.sin(t * 38) * 5, BY = 560;
    out += bodyFig(BX, BY, 1.0, t, { vas, cold, warm: prog(t, cue(2) + 1.0, 0.8) });
    // 熱がにげない（手から出る熱の波に ×）
    const hO = prog(t, cue(1) + 0.4, 0.4) * (1 - prog(t, cue(2) - 0.2, 0.3));
    if (hO > 0) {
      const blk = prog(t, cue(1) + 2.2, 0.3);
      [[-1, -40], [1, -40]].forEach(([sd, hy]) => {
        const hx = BX + sd * 170;
        out += g(`<path d="M ${sd * 50} -20 q ${sd * 16} -10 ${sd * 32} 0 t ${sd * 32} 0 M ${sd * 50} 20 q ${sd * 16} -10 ${sd * 32} 0 t ${sd * 32} 0" fill="none" stroke="${C.red}" stroke-width="7" stroke-linecap="round" opacity="${1 - blk * 0.6}"/>` + g(cross(sd * 82, 0, 0.42, C.blueUi), { o: blk }), { x: hx, y: BY + hy, o: hO });
      });
      out += pop(badge('ちの くだを しぼる', { fill: '#b43c36', size: 40 }), t, cue(1) + 1.0, 1600, 300);
      out += pop(badge('ねつを にがさない', { fill: C.blueUi, size: 40 }), t, cue(1) + 2.4, 1600, 400);
    }
    // ふるえて熱を作る
    out += shakeLines(BX, BY - 140, 300, t, shk * (1 - prog(t, cue(3) - 0.2, 0.3)), '#4f86c0', 130);
    out += pop(badge('ぶるぶる', { fill: '#4f86c0', size: 46 }), t, cue(2) + 0.4, 1600, 300, { end: cue(3) });
    out += pop(badge('ねつを つくる', { fill: C.red, size: 44 }), t, cue(2) + 1.6, 1600, 410, { end: cue(3) });
    // まとめ：手足が冷たい・寒い
    const sO = prog(t, cue(3) + 0.2, 0.4);
    if (sO > 0) {
      out += pop(badge('てあしが つめたい', { fill: '#4f86c0', size: 42 }), t, cue(3) + 0.4, 1560, 300);
      out += pop(badge('さむく かんじる', { fill: '#4f86c0', size: 42 }), t, cue(3) + 1.4, 1560, 410);
      [[-170, -40], [170, -40], [-70, 214], [70, 214]].forEach(([dx, dy], i) => {
        out += g(`<path d="M 0 -26 L 0 26 M -22 -13 L 22 13 M -22 13 L 22 -13" stroke="#7fb0e0" stroke-width="7" stroke-linecap="round"/>`, { x: BX + dx * 1.0 + (i % 2 ? 60 : -60), y: BY + dy - 50, o: prog(t, cue(3) + 0.8 + i * 0.15, 0.3), r: t * 20 });
      });
    }
    out += kidShow('S', t, 1790, 870, { s: 0.48, start: cue(4) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 9. おまけ：いつも熱が出るわけではない
SCENES.push({
  id: 'always',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(badge('かぜでも、ねつが でない ことも', { fill: C.accent, size: 46 }), t, cue(0) + 0.4, 960, 190);
    const zO = win(t, cue(0) + 0.6, cue(1) - 0.1, 0.4);
    if (zO > 0) {
      let z = card(760, 460);
      z += virus(-220, -20, 60, { col: VCOL[0], rot: t * 30 }) + text(-220, 120, 'かぜ', { size: 44, w: 900 });
      z += `<path d="M -110 -20 L -10 -20 M -36 -42 L -10 -20 L -36 2" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
      z += thermo(110, 10, 0.36, { s: 0.48 }) + text(240, -20, '？', { size: 110, w: 900, fill: C.ochre });
      out += g(z, { x: 960, y: 520, o: zO, s: lerp(0.94, 1, eo(zO)) });
    }
    const aO = prog(t, cue(1) - 0.2, 0.4);
    if (aO > 0) {
      let a = card(640, 460) + text(0, -170, 'おとな', { size: 50, w: 900 });
      a += g(person(260, '#8aa7b8'), { x: -110, y: 170 }) + thermo(120, 40, 0.38, { s: 0.42 });
      a += text(0, 200, 'たいてい ねつは でない', { size: 38, w: 900, fill: C.blueUi });
      out += g(a, { x: 560, y: 520, o: aO, s: lerp(0.94, 1, eo(aO)) });
    }
    const bO = prog(t, cue(1) + 2.6, 0.4);
    if (bO > 0) {
      let b = card(640, 460) + text(0, -170, 'ちいさい こ', { size: 50, w: 900 });
      b += g(person(170, '#e0a37a'), { x: -110, y: 130 }) + thermo(120, 40, 0.62, { s: 0.42 });
      b += `<path d="M -240 -40 a 34 34 0 1 0 34 44 a 26 26 0 1 1 -34 -44 Z" fill="${C.yellow}"/>` + text(-226, 50, 'よる', { size: 30, w: 900, fill: C.ochre });
      b += text(0, 200, 'よる、ねつが でる ことも', { size: 38, w: 900, fill: C.redUi });
      out += g(b, { x: 1300, y: 520, o: bO, s: lerp(0.94, 1, eo(bO)) });
    }
    // まだ調べている途中
    const cO = prog(t, cue(2) - 0.1, 0.4);
    if (cO > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.97 * cO}"/>`;
      let c = card(1000, 400);
      c += thermo(-330, 20, 0.7, { s: 0.48 }) + text(-200, 10, '＝', { size: 70, w: 900, fill: C.muted });
      c += wbc(-60, 10, 56, t) + virus(70, 10, 34, { col: VCOL[0], rot: t * 30 });
      c += text(220, 10, '？', { size: 130, w: 900, fill: C.ochre });
      c += text(30, -160, 'ねつは たたかいに やくだつ？', { size: 46, w: 900 });
      c += g(badge('まだ しらべている とちゅう', { fill: C.ochre, size: 40 }), { x: 100, y: 150, o: prog(t, cue(2) + 2.2, 0.4) });
      out += g(c, { x: 860, y: 500, o: cO, s: lerp(0.95, 1, eo(cO)) });
    }
    out += kidShow('K', t, 1700, 880, { s: 0.5, start: cue(2) + 0.6, n: 0, bubble: false });
    return out;
  },
});

// 10. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -560;
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'からだが、じぶんで ねつを つくっている', { size: 54, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['あいずで めもりが あがる', C.ochre], ['ふるえて ねつを つくる', C.red], ['あがりかけは さむい', '#4f86c0']], t, 960, 600, { start: 2.4, step: 0.9, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [g(thermo(0, 0, 0.6, { s: 0.2, ticks: false }), { x: -20 }) + g(blanketIcon(), { x: 30, y: 10 }), 'ねつの あがりかけ、さむがって いないか', C.ink, cue(1)],
        [g(thermo(0, 0, 0.5, { s: 0.2, ticks: false }), { x: -26 }) + `<circle cx="30" cy="-20" r="16" fill="#f6b500"/><path d="M 30 14 a 14 14 0 1 0 14 18 a 10 10 0 1 1 -14 -18 Z" fill="${C.ochre}"/>`, 'あさと よるの すうじを くらべる', C.ink, cue(2)],
        [warnIcon, 'いきが くるしそう・ひどく ねむそうなら おいしゃさんに', C.red, cue(3)],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(g(icn, { s: 0.9 }) + text(90, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, st, 200, 340 + i * 140); });
      // 記録のノート
      const mO = prog(t, cue(2) + 0.4, 0.5);
      if (mO > 0) {
        let m = `<rect x="-200" y="-180" width="400" height="330" rx="24" fill="#fff" stroke="${C.line}" stroke-width="6" filter="url(#shadow)"/>`;
        m += text(0, -130, 'ねつの きろく', { size: 38, w: 900, fill: C.ochre });
        m += `<line x1="-160" y1="-90" x2="160" y2="-90" stroke="${C.line}" stroke-width="4"/>`;
        m += text(-150, -30, 'あさ', { size: 40, w: 900, anchor: 'start' }) + text(150, -30, '？℃', { size: 40, w: 900, anchor: 'end', fill: C.red });
        m += text(-150, 60, 'よる', { size: 40, w: 900, anchor: 'start' }) + text(150, 60, '？℃', { size: 40, w: 900, anchor: 'end', fill: C.red });
        b += g(m, { x: 1580, y: 290, o: mO, s: lerp(0.9, 1, eo(mO)) });
      }
      // 毛布にくるまって ふるえる おとうと（熱の上がりかけ）
      const st = cue(1) + 0.4, shk = prog(t, st + 0.6, 0.3) * (1 - prog(t, cue(3), 0.4));
      let bro = kidShow('B', t, 1600, 770, { s: 0.55, start: st, n: 2, enter: 'pop', bubble: false, mouth: 'flat', look: [-4, -2] });
      bro += blanket(1600, 770, 0.55, back(clamp((t - st) / 0.6)));
      b += g(bro, { x: shk * Math.sin(t * 38) * 4 }) + shakeLines(1600, 770 - 100, 160, t, shk, '#5b8fd0', 125);
      b += kidShow('K', t, 1790, 860, { s: 0.5, start: cue(1) + 0.8, n: 1, bubble: false });
      out += g(b, { o: bO });
    }
    return out;
  },
});
function blanketIcon() {
  return `<path d="M -26 -24 Q 0 -30 26 -24 Q 40 0 36 26 L -36 26 Q -40 0 -26 -24 Z" fill="#6a9fd8"/><circle cx="0" cy="-34" r="14" fill="${SKIN}"/>`;
}

// 11. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「かぜ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

// ---------- ふとんの道具 ----------
const SKIN = '#f6d6bd', SKIN2 = '#ecc0a2', HAIR = '#3a2a22';
const FT = {
  kake: '#f6d98b', kakeDk: '#dcb24c', kakeIn: '#fff6dc', shiki: '#fdfaf2', shikiDk: '#d3c9b2',
  pj: '#8fb8de', pjDk: '#6f9cc8', cold: '#7db4e6', coldDk: '#4f86c0', warm: '#ff9a4a', warmDk: '#e0703a',
  tatami: '#dfdbab', tatamiDk: '#c6c08a', heri: '#5f7f5a',
};
// 体温計の形の温度計（lv 0〜1 で赤い柱がのびる）
function thermo(x, y, lv, { s = 1, col = C.red } = {}) {
  let b = `<circle cx="0" cy="170" r="62" fill="#fff" stroke="${C.ink}" stroke-width="9"/><rect x="-36" y="-286" width="72" height="440" rx="36" fill="#fff" stroke="${C.ink}" stroke-width="9"/>`;
  b += `<circle cx="0" cy="170" r="53" fill="#fff"/><rect x="-27" y="-277" width="54" height="440" rx="27" fill="#fff"/>`;
  for (let k = 0; k < 9; k++) b += `<line x1="16" y1="${100 - k * 40}" x2="30" y2="${100 - k * 40}" stroke="#b9b2a2" stroke-width="5" stroke-linecap="round"/>`;
  const top = lerp(110, -250, clamp(lv));
  b += `<rect x="-18" y="${top}" width="36" height="${178 - top}" rx="18" fill="${col}"/><circle cx="0" cy="170" r="42" fill="${col}"/><circle cx="-14" cy="156" r="12" fill="#fff" opacity="0.45"/>`;
  return g(b, { x, y, s });
}
// 指し線つきのラベル
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` + g(badge(str, { fill: col, size }), { x: tx, y: ty }), { o });
};
// たたみ（上から見た部屋）
function tatamiBg() {
  let o = `<pattern id="tt" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${FT.tatami}"/><line x1="0" y1="8" x2="16" y2="8" stroke="${FT.tatamiDk}" stroke-width="2" opacity="0.6"/></pattern>`;
  o += `<rect width="1920" height="1080" fill="url(#tt)"/>`;
  o += `<rect x="150" y="0" width="26" height="1080" fill="${FT.heri}"/><rect x="1744" y="0" width="26" height="1080" fill="${FT.heri}"/>`;
  return o;
}
// たたみの床（横から見た絵の下の帯）
const floorBand = (y, col = FT.tatami) => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${col}"/><rect x="0" y="${y}" width="1920" height="10" fill="${FT.tatamiDk}"/>`;
// 夜の部屋（かべ・まど・ゆか）
function bedroom(floorY = 800) {
  let o = `<rect width="1920" height="1080" fill="#efe6d6"/>`;
  o += `<rect x="150" y="150" width="360" height="280" rx="16" fill="#2a3a5e"/>`;
  [[210, 210, 4], [300, 190, 3], [260, 300, 3], [330, 370, 4], [470, 230, 3], [200, 380, 3]].forEach(([x, y, r]) => { o += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.8"/>`; });
  o += `<path d="M 440 260 a 46 46 0 1 0 32 78 a 36 36 0 1 1 -32 -78 Z" fill="${C.yellow}"/>`;
  o += `<rect x="150" y="150" width="360" height="280" rx="16" fill="none" stroke="#d8c3a2" stroke-width="18"/><line x1="330" y1="150" x2="330" y2="430" stroke="#d8c3a2" stroke-width="12"/><line x1="150" y1="290" x2="510" y2="290" stroke="#d8c3a2" stroke-width="12"/>`;
  o += floorBand(floorY);
  return o;
}
// 上から見たふとん：under（敷きぶとんとまくら）→ 子ども → over（掛けぶとん）の順に重ねる。x は中心、y は上のはし
function futonTopUnder(x, y, s = 1) {
  let b = `<rect x="-300" y="0" width="600" height="780" rx="36" fill="${FT.shiki}" stroke="${FT.shikiDk}" stroke-width="8"/>`;
  b += `<rect x="-170" y="36" width="340" height="170" rx="46" fill="#fff" stroke="#cfe0ea" stroke-width="8"/>`;
  return g(b, { x, y, s });
}
function futonTopOver(x, y, s = 1, { tint = 0, dy = 0 } = {}) {
  let b = `<rect x="-330" y="240" width="660" height="570" rx="44" fill="${FT.kake}" stroke="${FT.kakeDk}" stroke-width="8"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) b += `<circle cx="${-240 + c * 120 + (r % 2 ? 0 : 0)}" cy="${420 + r * 100}" r="13" fill="#fff" opacity="0.75"/>`;
  b += `<rect x="-330" y="240" width="660" height="96" rx="40" fill="${FT.kakeIn}" stroke="${FT.kakeDk}" stroke-width="8"/>`;
  if (tint) b += `<rect x="-334" y="236" width="668" height="578" rx="46" fill="${tint < 0 ? FT.cold : FT.warm}" opacity="${Math.min(1, Math.abs(tint)) * 0.42}"/>`;
  return g(b, { x, y: y + dy, s });
}
// 上から見たふとんで、子どもの足もと（kidShow にわたす y）と大きさ
const topKid = (who, y, s) => { const ks = (who === 'S' ? 0.92 : 1.15) * s; return [y + 122 * s + KID_HEAD[who][2] * ks, ks]; };
// 小さなふとんの絵
const futonIcon = (s = 1) => g(`<rect x="-120" y="20" width="240" height="30" rx="14" fill="${FT.shiki}" stroke="${FT.shikiDk}" stroke-width="5"/><rect x="-108" y="-2" width="62" height="24" rx="12" fill="#fff" stroke="#cfe0ea" stroke-width="5"/><path d="M -50 22 C -50 -30 -20 -44 10 -44 L 70 -40 C 100 -38 116 -10 118 22 Z" fill="${FT.kake}" stroke="${FT.kakeDk}" stroke-width="5"/>`, { s });

// ----- 横から切って見たふとん -----
// (x, y) は「頭のまん中の x」と「床の y」。敷きぶとんは x-150 から x+950 まで（s=1 のとき）。h は敷きぶとんの厚み
const sidePt = (x, y, s, h, lx, ly) => [x + lx * s, y - h * s + ly * s];
function sideShiki(x, y, s, h, { wet = 0, pillow = 1 } = {}) {
  let b = `<rect x="-150" y="0" width="1100" height="${h}" rx="${Math.min(h / 2, 30)}" fill="${mix(FT.shiki, '#c4def0', wet * 0.8)}" stroke="${FT.shikiDk}" stroke-width="6"/>`;
  if (pillow > 0) b += g(`<rect x="-118" y="-30" width="214" height="42" rx="21" fill="#fff" stroke="#cfe0ea" stroke-width="6"/>`, { o: pillow });
  return `<g transform="translate(${x} ${y - h * s}) scale(${s})">${b}</g>`;
}
const KAKE_OUT = 'M 60 0 C 60 -120 90 -170 170 -170 L 720 -160 C 800 -158 880 -100 890 0 Z';
const KAKE_IN = 'M 100 0 C 100 -90 120 -128 180 -128 L 716 -120 C 780 -118 840 -80 848 0 Z';
// 掛けぶとん。warmIn: 中のあたたかさ、warmOut: ふとんそのもののあたたかさ（0 つめたい → 1 あたたかい）。flat: たたんだ形
function sideKake(x, y, s, h, { warmIn = 0, warmOut = 0, dy = 0, o = 1, flat = false } = {}) {
  if (o <= 0) return '';
  const band = mix(mix(FT.kake, '#bcd9ee', 0.45), mix(FT.kake, FT.warm, 0.55), warmOut);
  let b;
  if (flat) b = `<rect x="70" y="-46" width="840" height="46" rx="23" fill="${band}" stroke="${FT.kakeDk}" stroke-width="6"/>`;
  else b = `<path d="${KAKE_OUT}" fill="${band}" stroke="${FT.kakeDk}" stroke-width="6" stroke-linejoin="round"/><path d="${KAKE_IN}" fill="${mix('#dcebf6', '#ffd2a6', warmIn)}"/>`;
  return `<g transform="translate(${x} ${y - h * s + dy}) scale(${s})" opacity="${o}">${b}</g>`;
}
// ねている子（横から。頭が左、顔は上むき）
function lyingKid(x, y, s, h, t, { eyes = 'closed', mouth = 'smile', cold = 0, o = 1, glow = 0 } = {}) {
  if (o <= 0) return '';
  let b = '';
  // 立った形（右むき）で描いて、-90度まわす
  b += `<rect x="-44" y="360" width="88" height="410" rx="40" fill="${FT.pjDk}"/>`;
  b += `<ellipse cx="34" cy="772" rx="46" ry="26" fill="${SKIN}"/>`;
  b += `<rect x="-14" y="40" width="40" height="50" fill="${SKIN2}"/>`;
  b += `<rect x="-50" y="70" width="100" height="340" rx="46" fill="${FT.pj}"/>`;
  if (glow > 0) b += `<ellipse cx="0" cy="300" rx="${54 + 5 * Math.sin(t * 5)}" ry="${190 + 8 * Math.sin(t * 5)}" fill="${C.red}" opacity="${0.24 * glow}" filter="url(#soft)"/>`;
  b += `<rect x="-14" y="110" width="36" height="220" rx="18" fill="${mix(FT.pj, FT.pjDk, 0.5)}"/><circle cx="4" cy="338" r="17" fill="${SKIN}"/>`;
  b += `<circle cx="10" cy="0" r="60" fill="${SKIN}"/><circle cx="70" cy="6" r="9" fill="${SKIN}"/>`;
  b += `<path d="M 50 -46 Q 14 -76 -28 -52 Q -62 -22 -50 34 Q -34 22 -24 -6 Q -6 -30 50 -46 Z" fill="${HAIR}"/>`;
  b += `<ellipse cx="-8" cy="10" rx="10" ry="14" fill="${SKIN2}"/>`;
  b += `<circle cx="32" cy="20" r="13" fill="${mix('#f2a99a', '#8fbbe6', cold)}" opacity="0.7"/>`;
  if (eyes === 'closed') b += `<path d="M 30 -14 Q 40 -5 50 -14" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>`;
  else b += `<ellipse cx="42" cy="-12" rx="6.5" ry="9" fill="#3a2a22"/><circle cx="44" cy="-15" r="2.6" fill="#fff"/>`;
  if (mouth === 'smile') b += `<path d="M 46 28 Q 56 36 64 25" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>`;
  else b += `<path d="M 50 30 L 62 28" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y - h * s - 50 * s}) scale(${s}) rotate(-90)" opacity="${o}">${b}</g>`;
}
// 熱のつぶ（オレンジの玉）
const heatBall = (x, y, r = 11, o = 1) => o <= 0.01 ? '' : `<g opacity="${clamp(o)}"><circle cx="${x}" cy="${y}" r="${r * 1.9}" fill="${FT.warm}" opacity="0.35" filter="url(#soft)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ff7e3a"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.32}" fill="#fff" opacity="0.7"/></g>`;
// 空気のつぶ（temp 0 つめたい → 1 あたたかい）
function airBall(x, y, r, t, { temp = 0, i = 0, o = 1, face = true } = {}) {
  if (o <= 0.01) return '';
  const col = mix('#c9e6f8', '#ffa56a', temp), dk = mix('#7fb4d8', '#de6e38', temp);
  let b = `<circle r="${r}" fill="${col}" stroke="${dk}" stroke-width="${Math.max(2.5, r * 0.1)}"/><circle cx="${-r * 0.34}" cy="${-r * 0.36}" r="${r * 0.2}" fill="#fff" opacity="0.8"/>`;
  if (face && r > 14) {
    const bl = ((t + i * 0.7) % 4.2) < 0.14;
    b += bl ? `<path d="M ${-r * 0.4} ${-r * 0.02} h ${r * 0.24} M ${r * 0.16} ${-r * 0.02} h ${r * 0.24}" stroke="${C.ink}" stroke-width="${r * 0.09}" stroke-linecap="round"/>`
      : `<circle cx="${-r * 0.28}" cy="${-r * 0.02}" r="${r * 0.1}" fill="${C.ink}"/><circle cx="${r * 0.28}" cy="${-r * 0.02}" r="${r * 0.1}" fill="${C.ink}"/>`;
    b += `<path d="M ${-r * 0.18} ${r * 0.3} Q 0 ${r * 0.46} ${r * 0.18} ${r * 0.3}" fill="none" stroke="${C.ink}" stroke-width="${r * 0.08}" stroke-linecap="round"/>`;
  }
  return g(b, { x, y, o });
}
// ゆらゆら上がる熱の線
const heatLines = (x, y, t, o = 1, col = C.red, n = 3, gap = 36) => o <= 0 ? '' : g(Array.from({ length: n }, (_, i) =>
  `<path d="M ${(i - (n - 1) / 2) * gap} 0 q 12 -16 0 -32 q -12 -16 0 -32" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" opacity="${0.5 + 0.5 * Math.sin(t * 5 + i)}"/>`).join(''), { x, y, o });
// ふるえの線
const shakeLines = (x, y, h, t, o = 1, col = FT.coldDk, w = 30) => o <= 0 ? '' : g([-1, 1].map(sd =>
  `<path d="M ${sd * w} ${-h / 2} q ${sd * 14} ${h / 8} 0 ${h / 4} q ${-sd * 14} ${h / 8} 0 ${h / 4} q ${sd * 14} ${h / 8} 0 ${h / 4} q ${-sd * 14} ${h / 8} 0 ${h / 4}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" transform="translate(${sd * (8 + 4 * Math.sin(t * 30))} 0)"/>`).join(''), { x, y, o });
// 雪のしるし（つめたい）
const coldMark = (x, y, s, t, o = 1) => g(`<path d="M 0 -26 L 0 26 M -22 -13 L 22 13 M -22 13 L 22 -13" stroke="${FT.cold}" stroke-width="7" stroke-linecap="round"/>`, { x, y, s, o, r: t * 20 });
// しずく
const drop = (x, y, s = 1, o = 1, col = '#6fb1e6') => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -18 C 9 -4 13 2 13 8 A 13 13 0 0 1 -13 8 C -13 2 -9 -4 0 -18 Z" fill="${col}" opacity="${clamp(o)}"/>`;
// 矢印（下むきが 0 度）
const arrowDown = (x, y, len, o = 1, col = C.ink, r = 0) => g(`<path d="M 0 0 L 0 ${len} M -18 ${len - 20} L 0 ${len} L 18 ${len - 20}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, { x, y, o, r });

// 1. つかみ：ひやっ → ぽかぽか
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = tatamiBg();
    const FX = 960, FY = 96, FS = 0.9;
    const c0 = cue(0), c2 = cue(2), c3 = cue(3);
    const pull = eo(prog(t, c0 + 1.3, 0.9));                       // 掛けぶとんをかぶる
    const cold = prog(t, c0 + 2.4, 0.4) * (1 - prog(t, c2 + 0.8, 2.0));
    const warm = eio(prog(t, c2 + 1.4, 3.0));
    const shk = cold * Math.sin(t * 38) * 4;
    out += futonTopUnder(FX, FY, FS);
    const [footY, ks] = topKid('B', FY, FS);
    out += g(kidShow('B', t, FX, footY, { s: ks, start: 0, n: 0, enter: 'pop', act: 'nod', bubble: false, mouth: cold > 0.5 ? 'o' : null, eyes: warm > 0.6 ? 'smile' : cold > 0.5 ? 'wide' : 'open' }), { x: shk });
    out += futonTopOver(FX + shk, FY, FS, { tint: warm - cold, dy: (1 - pull) * 900 });
    // つめたい
    out += shakeLines(FX, FY + 330, 200, t, cold, FT.coldDk, 340);
    out += pop(text(0, 0, 'ひやっ', { size: 112, w: 900, fill: FT.coldDk }), t, c0 + 2.5, 430, 330, { end: c2 + 0.8 });
    [[420, 520, 1.3], [1500, 300, 1.5], [1440, 560, 1.1], [520, 690, 1.0]].forEach(([x, y, s], i) => { out += coldMark(x, y, s, t + i, cold); });
    out += talkBubble('B', FX + 350, FY + 70, FX + 92, FY + 122 * FS);
    // あったかい
    out += pop(text(0, 0, 'ぽかぽか', { size: 96, w: 900, fill: FT.warmDk }), t, c2 + 3.0, 1516, 330, { end: c3 + 0.2 });
    [[430, 480], [1480, 560], [470, 700]].forEach(([x, y], i) => { out += heatLines(x, y, t + i, warm * (1 - prog(t, c3 + 0.2, 0.4)), FT.warmDk); });
    out += g(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre }), { x: 1480, y: 380, o: win(t, c3 + 0.4, cueE(3) + 0.6, 0.3) });
    out += g(text(0, 0, '？', { size: 110, w: 900, fill: C.ochre }), { x: 440, y: 420, o: win(t, c3 + 1.0, cueE(3) + 0.6, 0.3), r: -12 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.accent}">おふとん</tspan>は どうして</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">だんだん <tspan fill="${FT.warmDk}">あったかく</tspan> なるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(futonIcon(1.5), { x: -70 }) + text(190, -10, '？', { size: 90, w: 900, fill: C.ochre }) + heatLines(-40, -80, t, 1, FT.warmDk), t, t0 + 1.8, 960, 790);
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
    const opts = [['①', 'からだの ねつが、ふとんの なかに たまるから'], ['②', 'ふとんが、じぶんで ねつを だすから'], ['③', 'ふとんが、へやの あたたかさを すいこむから']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 46, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(futonIcon(1.0) + text(96, -86, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 360);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 入る前のふとんは、部屋と同じ温度
const stoveIcon = () => `<rect x="-70" y="-90" width="140" height="170" rx="18" fill="#8a8f96"/><rect x="-52" y="-70" width="104" height="96" rx="10" fill="#3a3f45"/>` +
  [-30, 0, 30].map(dx => `<path d="M ${dx} 14 q -16 -26 0 -50 q 6 16 12 20 q 8 12 -12 30 Z" fill="#ff7e3a"/>`).join('') +
  `<rect x="-52" y="40" width="104" height="14" rx="7" fill="#5c6168"/><rect x="-60" y="80" width="26" height="16" rx="4" fill="#5c6168"/><rect x="34" y="80" width="26" height="16" rx="4" fill="#5c6168"/>`;
SCENES.push({
  id: 'before',
  draw(t) {
    const FL = 690;
    let out = bedroom(FL) + topBadge();
    const X = 230, Y = 806, S = 1.0, H = 80;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    out += sideShiki(X, Y, S, H) + sideKake(X, Y, S, H, { flat: true, warmOut: 0 });
    // 自分では熱を出さない
    const sO = win(t, c0 + 0.5, c1 - 0.2, 0.35);
    if (sO > 0) {
      out += g(stoveIcon() + g(cross(0, 0, 1.25, C.red), { o: prog(t, c0 + 1.6, 0.25), s: lerp(1.4, 1, eo(prog(t, c0 + 1.6, 0.3))) }), { x: 700, y: 500, o: sO, s: 1.1 });
      out += pop(badge('じぶんでは ねつを ださない', { fill: C.redUi, size: 46 }), t, c0 + 1.2, 1260, 420, { end: c1 - 0.2 });
    }
    // 部屋と同じ温度
    const lv = lerp(0.5, 0.2, eo(prog(t, c1 + 0.6, 1.2)));
    const cards = [['へや', 1240, c1 + 0.2], ['ふとん', 1620, c1 + 1.6]];
    cards.forEach(([name, x, st]) => {
      const o = prog(t, st, 0.4);
      if (o <= 0) return;
      out += g(card(300, 540) + text(0, -220, name, { size: 50, w: 900, fill: FT.coldDk }) + thermo(0, 40, name === 'へや' ? lv : 0.2, { s: 0.7, col: FT.coldDk }), { x, y: 400, o, s: lerp(0.94, 1, eo(o)) });
    });
    out += pop(`<circle r="46" fill="${C.ochre}"/>` + text(0, 0, '＝', { size: 60, w: 900, fill: '#fff' }), t, c1 + 2.6, 1430, 400);
    out += pop(badge('おなじ おんど', { fill: C.ochre, size: 46 }), t, c1 + 3.0, 1430, 740, { end: c2 - 0.2 });
    // 寒い部屋では、ふとんもつめたい
    const cO = prog(t, c1 + 5.2, 0.4) * (1 - prog(t, c2 - 0.2, 0.3));
    [[300, 600, 1.2], [650, 560, 1.0], [960, 600, 1.3]].forEach(([x, y, s], i) => { out += coldMark(x, y, s, t + i, cO); });
    out += pop(badge('つめたい', { fill: FT.coldDk, size: 46 }), t, c1 + 5.8, 650, 470, { end: c2 - 0.2 });
    // あたたかさは どこから？
    const qO = prog(t, c2 - 0.1, 0.4);
    if (qO > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.94 * qO}"/>`;
      out += g(futonIcon(2.6), { x: 820, y: 470, o: qO });
      out += pop(text(0, 0, '？', { size: 240, w: 900, fill: C.ochre }), t, c2 + 0.5, 1240, 420);
      out += pop(badge('あたたかさは どこから？', { fill: C.ochre, size: 54, pad: 44 }), t, c2 + 0.9, 960, 720);
    }
    return out;
  },
});

// 4. 熱を出しているのは体
SCENES.push({
  id: 'heater',
  draw(t) {
    const FL = 790;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + floorBand(FL) + topBadge();
    const X = 250, Y = FL + 24, S = 1.2, H = 70;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    const wi = eio(prog(t, c2 + 0.6, 4.6)), wo = eio(prog(t, c3 + 1.4, 3.6)) * 0.85;
    out += sideShiki(X, Y, S, H) + sideKake(X, Y, S, H, { warmIn: wi, warmOut: wo });
    out += lyingKid(X, Y, S, H, t, { eyes: 'closed', glow: prog(t, c0 + 0.8, 0.6) });
    // 体から出る熱のつぶ
    const hO = prog(t, c0 + 1.2, 0.5);
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.5 + i * 0.37) % 1;
      const [px, py] = sidePt(X, Y, S, H, 170 + i * 68 + Math.sin(t * 2 + i) * 6, -100 - ph * 24);
      out += heatBall(px, py, 11, hO * Math.min(1, (1 - ph) * 2.5));
    }
    out += callout(...sidePt(X, Y, S, H, 240, -60), 620, 330, 'からだが ねつを だす', prog(t, c0 + 1.6, 0.4) * (1 - prog(t, c2 - 0.2, 0.3)), { col: C.red, size: 46 });
    out += kidShow('S', t, 1720, 868, { s: 0.5, start: c1 - 0.9, n: 0, side: 'left', size: 40 });
    // 少しずつ あたたまる
    const gO = prog(t, c2 + 0.3, 0.5);
    if (gO > 0) {
      out += g(card(300, 500) + text(0, -200, 'ふとんの なか', { size: 38, w: 900, fill: C.red }) + thermo(0, 44, lerp(0.2, 0.72, wi), { s: 0.64 }), { x: 1600, y: 310, o: gO, s: lerp(0.94, 1, eo(gO)) });
      out += pop(badge('すこしずつ あたたまる', { fill: FT.warmDk, size: 46 }), t, c2 + 1.4, 760, 240, { end: c3 - 0.2 });
    }
    // 体に近いところほど はやい
    const [nx, ny] = sidePt(X, Y, S, H, 470, -112), [fx, fy] = sidePt(X, Y, S, H, 640, -146);
    out += callout(nx, ny, 480, 330, 'からだの ちかく：はやい', prog(t, c3 + 0.8, 0.4), { col: FT.warmDk, size: 42 });
    out += callout(fx, fy, 1080, 250, 'そとがわ：ゆっくり', prog(t, c3 + 2.4, 0.4), { col: FT.coldDk, size: 42 });
    return out;
  },
});

// 5. ふとんは熱をにがしにくくする
SCENES.push({
  id: 'keep',
  draw(t) {
    const FL = 800;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + floorBand(FL) + topBadge();
    const Y = FL + 24, S = 1.2, H = 70, XB = 480;
    const c0 = cue(0), c1 = cue(1);
    const k = eo(prog(t, c1 + 0.5, 1.0));                 // 掛けぶとんがかかる
    const cozy = prog(t, c1 + 1.6, 0.8);
    const shk = prog(t, c0 + 2.0, 0.4) * (1 - prog(t, c1 + 1.2, 0.5));
    const X = XB + shk * Math.sin(t * 38) * 3;
    out += sideShiki(XB, Y, S, H);
    out += sideKake(XB, Y, S, H, { warmIn: eio(prog(t, c1 + 1.4, 2.6)), warmOut: 0.3 * prog(t, c1 + 2.4, 2.6), dy: -(1 - k) * 760, o: prog(t, c1 + 0.4, 0.2) });
    out += lyingKid(X, Y, S, H, t, { eyes: cozy > 0.5 ? 'closed' : 'open', mouth: cozy > 0.5 ? 'smile' : 'flat', cold: shk, glow: 0.8 });
    // 熱のつぶ：何もないと上へにげる／ふとんがあると中にとどまる
    const hO = prog(t, c0 + 0.5, 0.5), rise = lerp(430, 22, k);
    for (let i = 0; i < 12; i++) {
      const ph = (t * 0.32 + i * 0.37) % 1;
      const [px, py] = sidePt(XB, Y, S, H, 150 + i * 54 + Math.sin(t * 1.6 + i) * lerp(26, 5, k), -100 - ph * rise);
      out += heatBall(px, py, 10, hO * lerp(Math.min(1, (1 - ph) * 2), Math.min(1, (1 - ph) * 3), k));
    }
    // にげていく矢印
    const aO = win(t, c0 + 1.4, c1 + 0.6, 0.4);
    [700, 920, 1140].forEach((x, i) => { out += arrowDown(x, 330 + Math.sin(t * 3 + i) * 8, 110, aO, C.red, 180 + (i - 1) * 16); });
    out += pop(badge('ねつが にげる', { fill: C.red, size: 50 }), t, c0 + 1.8, 1500, 300, { end: c1 + 0.6 });
    out += shakeLines(X, Y - H * S - 62 * S, 130, t, shk, FT.coldDk, 100);
    out += pop(badge('さむい…', { fill: FT.coldDk, size: 42 }), t, c0 + 3.2, 330, 540, { end: c1 + 1.0 });
    out += pop(badge('ねつを にがしにくい', { fill: C.accent, size: 52, pad: 40 }), t, c1 + 1.8, 960, 300);
    out += pop(badge('ぽかぽか', { fill: FT.warmDk, size: 42 }), t, c1 + 3.0, 330, 540);
    return out;
  },
});

// 6. 動かない空気
const WX0 = 180, WX1 = 1440, WY0 = 250, WY1 = 700, WCOL = 6, WROW = 3;
function wataFibers(o, t) {
  if (o <= 0.01) return '';
  const cw = (WX1 - WX0) / WCOL, ch = (WY1 - WY0) / WROW;
  let b = '';
  for (let i = 0; i < 40; i++) {
    const x = WX0 + 30 + rnd(i, 1) * (WX1 - WX0 - 60), y = WY0 + 24 + rnd(i, 2) * (WY1 - WY0 - 48), a = rnd(i, 3) * 6.28, L = 50 + rnd(i, 4) * 70;
    b += `<path d="M ${x - Math.cos(a) * L} ${y - Math.sin(a) * L} Q ${x + Math.sin(a) * 30} ${y - Math.cos(a) * 30} ${x + Math.cos(a) * L} ${y + Math.sin(a) * L}" fill="none" stroke="#e3d6b8" stroke-width="3" stroke-linecap="round"/>`;
  }
  for (let k = 1; k < WCOL; k++) {
    let d = `M ${WX0 + k * cw} ${WY0}`;
    for (let j = 0; j < 6; j++) d += ` q ${(j % 2 ? -1 : 1) * (12 + 6 * rnd(k, j))} ${(WY1 - WY0) / 12} 0 ${(WY1 - WY0) / 6}`;
    b += `<path d="${d}" fill="none" stroke="#c4a875" stroke-width="7" stroke-linecap="round"/>`;
  }
  for (let j = 1; j < WROW; j++) {
    let d = `M ${WX0} ${WY0 + j * ch}`;
    for (let k = 0; k < 12; k++) d += ` q ${(WX1 - WX0) / 24} ${(k % 2 ? -1 : 1) * (10 + 6 * rnd(j, k))} ${(WX1 - WX0) / 12} 0`;
    b += `<path d="${d}" fill="none" stroke="#c4a875" stroke-width="7" stroke-linecap="round"/>`;
  }
  return g(b, { o });
}
SCENES.push({
  id: 'air',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    const cw = (WX1 - WX0) / WCOL, ch = (WY1 - WY0) / WROW;
    // そと（つめたい）／わた／体のほう（あったかい）
    out += `<rect x="${WX0}" y="160" width="${WX1 - WX0}" height="100" rx="24" fill="#cfe4f5"/><rect x="${WX0}" y="690" width="${WX1 - WX0}" height="100" rx="24" fill="#ffd9b0"/>`;
    out += `<rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" fill="#fffdf4" stroke="${FT.kakeDk}" stroke-width="8"/>`;
    out += text(WX0 + 30, 205, 'そと（つめたい）', { size: 34, w: 900, fill: FT.coldDk, anchor: 'start' });
    out += text(WX0 + 30, 748, 'からだの ほう（あったかい）', { size: 34, w: 900, fill: C.redUi, anchor: 'start' });
    out += g(text(0, 0, 'かけぶとんの なか', { size: 34, w: 900, fill: C.ochre }), { x: 1690, y: 300, o: prog(t, 0.4, 0.4) });
    out += g(futonIcon(0.9), { x: 1690, y: 390, o: prog(t, 0.4, 0.4) });
    // 糸
    const fib = 1 - 0.92 * prog(t, c2 - 0.2, 0.7) * (1 - prog(t, c3 + 1.8, 1.2));
    out += wataFibers(fib, t);
    // 空気のつぶ
    const mv = eio(prog(t, c2 + 0.5, 0.9)) * (1 - eio(prog(t, c3 + 2.2, 1.6)));
    const grad = eio(prog(t, c1 + 0.8, 1.6));
    const bO = prog(t, c0 + 0.9, 0.5);
    for (let i = 0; i < WCOL * WROW; i++) {
      const col = i % WCOL, row = Math.floor(i / WCOL);
      const sx = WX0 + (col + 0.5) * cw + Math.sin(t * 2.3 + i * 1.7) * 5 * (1 - mv), sy = WY0 + (row + 0.5) * ch + Math.cos(t * 2.9 + i) * 4 * (1 - mv);
      const left = col < 3, k9 = (left ? col : col - 3) * 3 + row;
      const a = k9 / 9 * Math.PI * 2 + t * 1.15, rr = k9 % 2 ? 1 : 0.62;
      const cx = left ? WX0 + cw * 1.5 : WX1 - cw * 1.5, cy = (WY0 + WY1) / 2;
      const mx = cx + (left ? 1 : -1) * Math.cos(a) * 250 * rr, my = cy + Math.sin(a) * 165 * rr;
      const tempStill = lerp(0.1, [0.06, 0.34, 0.92][row], grad);
      const temp = lerp(tempStill, 0.5 - 0.5 * Math.cos(a), mv);
      out += airBall(lerp(sx, mx, mv), lerp(sy, my, mv), 40, t, { temp, i, o: bO });
    }
    // 体のほうから来る熱
    const hO = prog(t, c1 + 0.4, 0.5);
    for (let i = 0; i < 7; i++) out += heatLines(WX0 + 110 + i * 180, 700, t + i * 0.4, hO * 0.9, C.red, 2, 30);
    // 動くと、熱が外へ にげる
    for (let i = 0; i < 8; i++) {
      const ph = (t * 0.6 + i * 0.29) % 1;
      const x = (i % 2 ? WX1 - cw * 1.5 + 200 : WX0 + cw * 1.5 - 200) + Math.sin(i * 2.1) * 50;
      out += heatBall(x + Math.sin(t * 2 + i) * 8, 250 - ph * 100, 11, mv * (1 - ph));
    }
    // ラベル
    const TB = (s, col, st, en) => pop(badge(s, { fill: col, size: 46 }), t, st, 1000, 100, { end: en });
    out += TB('わたの すきまの くうき', C.blueUi, c0 + 1.4, c1 - 0.1);
    out += TB('くうきは ねつを つたえにくい', C.blueUi, c1 + 1.0, c2 - 0.3);
    out += TB('もし いとが なかったら…', C.muted, c2 + 0.2, c2 + 2.4);
    out += TB('うごくと ねつを はこんでしまう', C.red, c2 + 2.6, c3 - 0.1);
    out += TB('ほそい いとが、ちいさな へやに わける', C.ochre, c3 + 2.0, c4 - 0.1);
    out += TB('ねつを まもる「うごかない くうき」', C.accent, c4 + 0.6, 1e9);
    out += kidShow('K', t, 1740, 880, { s: 0.52, start: cue(5) - 0.9, n: 0, enter: 'slideR', act: 'nod', bubble: false });
    out += talkBubble('K', 1690, 630, 1688, 772, 38);
    return out;
  },
});

// 7. 家のかべの断熱材と、ダウン
function tangle(cx, cy, r, n, col = '#e0c98e', w = 5) {
  let b = '';
  for (let i = 0; i < n; i++) {
    const a = rnd(i, 11) * 6.28, d = rnd(i, 12) * r * 0.8, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, b2 = rnd(i, 13) * 6.28, L = r * (0.5 + rnd(i, 14) * 0.6);
    b += `<path d="M ${x - Math.cos(b2) * L} ${y - Math.sin(b2) * L} Q ${x + Math.sin(b2) * L * 0.6} ${y - Math.cos(b2) * L * 0.6} ${x + Math.cos(b2) * L} ${y + Math.sin(b2) * L}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return b;
}
function downBall(t) {
  let b = '';
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * 6.28 + rnd(i, 21) * 0.2, L = 130 + rnd(i, 22) * 70, sw = Math.sin(t * 1.6 + i) * 0.06;
    const ex = Math.cos(a + sw) * L, ey = Math.sin(a + sw) * L, mx = Math.cos(a + 0.35) * L * 0.55, my = Math.sin(a + 0.35) * L * 0.55;
    b += `<path d="M 0 0 Q ${mx} ${my} ${ex} ${ey}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    for (let j = 1; j <= 3; j++) {
      const k = j / 4, px = lerp(mx * 0.6, ex, k), py = lerp(my * 0.6, ey, k);
      b += `<path d="M ${px} ${py} l ${Math.cos(a + 1.1) * 26} ${Math.sin(a + 1.1) * 26} M ${px} ${py} l ${Math.cos(a - 1.1) * 26} ${Math.sin(a - 1.1) * 26}" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`;
    }
  }
  return b + `<circle r="12" fill="#f3ede0"/>`;
}
function dandelion(t) {
  let b = `<path d="M 0 30 Q 14 180 -6 330" fill="none" stroke="#6fa85a" stroke-width="12" stroke-linecap="round"/>`;
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * 6.28 + rnd(i, 31) * 0.15, L = 120 + rnd(i, 32) * 40, sw = Math.sin(t * 1.4 + i) * 0.04;
    const ex = Math.cos(a + sw) * L, ey = Math.sin(a + sw) * L;
    b += `<line x1="${Math.cos(a) * 26}" y1="${Math.sin(a) * 26}" x2="${ex}" y2="${ey}" stroke="#fff" stroke-width="3.5"/>`;
    for (let j = -2; j <= 2; j++) b += `<line x1="${ex}" y1="${ey}" x2="${ex + Math.cos(a + j * 0.5) * 30}" y2="${ey + Math.sin(a + j * 0.5) * 30}" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
    b += `<ellipse cx="${Math.cos(a) * 24}" cy="${Math.sin(a) * 24}" rx="7" ry="4" fill="#9a7438" transform="rotate(${a * 57.3} ${Math.cos(a) * 24} ${Math.sin(a) * 24})"/>`;
  }
  return b + `<circle r="22" fill="#d9c48e"/>`;
}
SCENES.push({
  id: 'same',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const aO = 1 - prog(t, c2 - 0.5, 0.5);
    if (aO > 0) {
      // 家（かべの中に断熱材）
      let a = `<path d="M 200 430 L 520 220 L 840 430 Z" fill="#c0624c"/>`;
      a += `<rect x="260" y="420" width="520" height="370" fill="#bfa77e"/><rect x="274" y="420" width="492" height="356" fill="#f6dc86"/>` + `<clipPath id="wl"><rect x="274" y="420" width="492" height="356"/></clipPath><g clip-path="url(#wl)">${tangle(520, 600, 330, 70, '#e2bf55', 4)}</g>`;
      a += `<rect x="318" y="464" width="404" height="312" fill="#fff8ea"/><rect x="304" y="450" width="432" height="14" fill="#bfa77e"/><rect x="304" y="464" width="14" height="312" fill="#bfa77e"/><rect x="722" y="464" width="14" height="312" fill="#bfa77e"/>`;
      a += `<rect x="440" y="520" width="160" height="130" rx="8" fill="#cfe8f6" stroke="#bfa77e" stroke-width="10"/><line x1="520" y1="520" x2="520" y2="650" stroke="#bfa77e" stroke-width="8"/>`;
      a += `<rect x="200" y="786" width="640" height="14" rx="7" fill="#a8946c"/>`;
      out += g(a, { o: aO * prog(t, 0.2, 0.4) });
      out += callout(296, 600, 420, 150, 'かべの なかの だんねつざい', aO * prog(t, c0 + 1.0, 0.4), { col: C.ochre, size: 42 });
      // 虫めがね：からみ合った糸と、動きにくい空気
      const mO = aO * prog(t, c0 + 2.2, 0.5);
      if (mO > 0) {
        const MX = 1250, MY = 480, R = 250;
        out += `<line x1="770" y1="610" x2="${MX - R + 10}" y2="${MY + 40}" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="14 10" opacity="${mO}"/>`;
        let m = `<rect x="${R * 0.62}" y="${R * 0.62}" width="50" height="190" rx="25" fill="${C.ochre}" transform="rotate(-45 ${R * 0.62} ${R * 0.62})"/>`;
        m += `<circle r="${R}" fill="#fffdf4"/><clipPath id="mg"><circle r="${R - 8}"/></clipPath><g clip-path="url(#mg)">${tangle(0, 0, R, 46, '#d9b95a', 7)}`;
        [[-120, -90], [40, -130], [140, -20], [-30, 10], [-150, 80], [70, 120], [-40, 160]].forEach(([x, y], i) => { m += airBall(x + Math.sin(t * 2.2 + i * 1.3) * 4, y + Math.cos(t * 2.6 + i) * 4, 38, t, { temp: 0.15, i }); });
        m += `</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="20"/>`;
        out += g(m, { x: MX, y: MY, o: mO, s: lerp(0.9, 1, eo(mO)) });
        out += pop(badge('ほそい いとが からみあう', { fill: C.ochre, size: 42 }), t, c1 + 0.4, 1250, 150, { end: c2 - 0.5 });
        out += pop(badge('うごきにくい くうき', { fill: C.blueUi, size: 46 }), t, c1 + 2.4, 1240, 790, { end: c2 - 0.5 });
      }
      out += pop(g(futonIcon(1.0), { y: -110 }) + badge('ふとんと おなじ', { fill: C.accent, size: 38 }), t, c0 + 3.0, 1740, 420, { end: c2 - 0.5 });
    }
    // ダウンと、たんぽぽのわた毛
    const bO = prog(t, c2 - 0.2, 0.5);
    if (bO > 0) {
      const R = 232, Y0 = 450;
      let b = `<circle cx="540" cy="${Y0}" r="${R}" fill="#cfe0ee"/><circle cx="1380" cy="${Y0}" r="${R}" fill="#cfe6d2"/>`;
      b += g(downBall(t), { x: 540, y: Y0, s: 0.95 });
      b += `<clipPath id="dd"><circle cx="1380" cy="${Y0}" r="${R}"/></clipPath><g clip-path="url(#dd)">${g(dandelion(t), { x: 1380, y: Y0 - 30, s: 1.0 })}</g>`;
      b += g(badge('ダウン', { fill: C.blueUi, size: 46 }), { x: 540, y: Y0 + R + 44 });
      b += g(badge('たんぽぽの わたげ', { fill: C.accent, size: 46 }), { x: 1380, y: Y0 + R + 44 });
      out += g(b, { o: bO });
      out += pop(badge('うもうぶとんの なか', { fill: C.ochre, size: 40 }), t, c2 + 0.3, 540, 150);
      out += pop(text(0, 0, 'にてる！', { size: 70, w: 900, fill: C.ochre }), t, c2 + 3.2, 960, 400);
      out += pop(`<path d="M -90 0 L 90 0 M -60 -26 L -90 0 L -60 26 M 60 -26 L 90 0 L 60 26" fill="none" stroke="${C.ochre}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, t, c2 + 3.2, 960, 490);
      // 空気をたっぷりかかえる
      const st = c2 + 6.6;
      [[-110, -80], [90, -110], [120, 60], [-60, 110], [-150, 20], [20, 150], [10, -20]].forEach(([x, y], i) => {
        const k = prog(t, st + i * 0.18, 0.4);
        out += g(airBall(0, 0, 30, t, { temp: 0.15, i }), { x: 540 + x + Math.sin(t * 2 + i) * 3, y: Y0 + y + Math.cos(t * 2.4 + i) * 3, s: Math.max(back(k), 0.001), o: Math.min(1, k * 3) });
      });
      out += pop(badge('かるいのに、くうきを たっぷり', { fill: C.blueUi, size: 46 }), t, st + 0.6, 1200, 150);
    }
    return out;
  },
});

// 8. ぺちゃんこのふとんは寒い
SCENES.push({
  id: 'flat',
  draw(t) {
    const FL = 800;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + floorBand(FL) + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    const X0 = 480, Y = FL + 24, S = 1.2;
    const sq = eio(prog(t, c2 + 1.0, 2.6)) * (1 - eio(prog(t, c4 + 1.6, 2.4)));   // つぶれる（1 でぺちゃんこ）
    const H = lerp(120, 52, sq);
    const sink = eio(prog(t, c1 + 0.6, 3.0));                                      // 湿気が下へ
    const dry = eio(prog(t, c4 + 1.0, 2.6));                                       // 干す
    const wet = sink * (1 - dry);
    const shk = prog(t, c3 + 0.6, 0.4) * (1 - prog(t, c4 - 0.4, 0.3));
    const X = X0 + shk * Math.sin(t * 38) * 3;
    const kidO = 1 - prog(t, c4 - 0.4, 0.5);
    out += sideShiki(X0, Y, S, H, { wet, pillow: kidO });
    // 敷きぶとんの中の空気
    for (let i = 0; i < 26; i++) {
      const row = i % 2, keep = i % 3 === 0;
      const [px, py] = sidePt(X0, Y, S, H, -110 + i * 40.5, lerp(row ? H * 0.72 : H * 0.28, H * 0.5, sq));
      out += airBall(px, py, 20, t, { temp: 0.12, i, face: false, o: keep ? 1 : 1 - sq });
    }
    out += sideKake(X, Y, S, H, { warmIn: lerp(1, 0.15, shk), warmOut: lerp(0.7, 0.1, shk), o: kidO });
    out += lyingKid(X, Y, S, H, t, { eyes: shk > 0.5 ? 'open' : 'closed', mouth: shk > 0.5 ? 'flat' : 'smile', cold: shk, o: kidO });
    // あせや湿気：体から出て、下の敷きぶとんへ
    const dO = prog(t, c0 + 1.0, 0.5);
    for (let i = 0; i < 9; i++) {
      const lx = 170 + i * 68, k = eio(prog(t, c1 + 0.6 + i * 0.12, 2.2));
      const ly = lerp(-112 - Math.abs(Math.sin(t * 2 + i)) * 8, H * (0.3 + 0.4 * rnd(i, 5)), k) - dry * (220 + i * 14);
      const [px, py] = sidePt(X0, Y, S, H, lx, ly);
      out += drop(px, py, 1.2, dO * (1 - dry * 1.15));
    }
    out += pop(badge('あせや しめりけ', { fill: FT.coldDk, size: 48 }), t, c0 + 1.6, 960, 300, { end: c1 - 0.1 });
    out += pop(badge('したの しきぶとんへ', { fill: FT.coldDk, size: 48 }), t, c1 + 0.8, 960, 300, { end: c2 - 0.1 });
    [190, 1730].forEach((x, i) => { out += arrowDown(x, 560 + Math.sin(t * 3 + i) * 8, 110, win(t, c1 + 1.0, c2 - 0.1, 0.4), FT.coldDk); });
    out += pop(badge('しめって つぶれる', { fill: C.ochre, size: 48 }), t, c2 + 0.8, 760, 300, { end: c3 - 0.1 });
    out += pop(badge('くうきが へる', { fill: C.blueUi, size: 48 }), t, c2 + 3.4, 1260, 300, { end: c3 - 0.1 });
    out += pop(badge('ぺちゃんこ ＝ くうきが すくない', { fill: C.blueUi, size: 48 }), t, c3 + 0.4, 960, 250, { end: c4 - 0.3 });
    out += shakeLines(X, Y - H * S - 62 * S, 130, t, shk, FT.coldDk, 100);
    out += pop(badge('さむい…', { fill: FT.coldDk, size: 44 }), t, c3 + 2.2, 330, 560, { end: c4 - 0.3 });
    // 干すと、またふくらむ
    const sO = prog(t, c4 + 0.2, 0.6);
    if (sO > 0) {
      out += g(sunDisc(0, 0, 90, 0.15), { x: 1560, y: lerp(120, 300, eo(sO)), o: sO });
      for (let i = 0; i < 5; i++) out += heatLines(420 + i * 250, 560 - 20 * (i % 2), t + i * 0.5, sO * (1 - prog(t, c4 + 4.4, 0.6)), FT.warmDk, 2, 34);
      out += pop(badge('ほすと、また ふくらむ', { fill: FT.warmDk, size: 52, pad: 40 }), t, c4 + 1.6, 900, 300);
    }
    return out;
  },
});

// 9. 答え と みてみよう
function shikiLook(t, o) {
  // まん中がへこんだ敷きぶとんを、横から、目の高さで見る
  let b = `<rect x="-330" y="96" width="660" height="14" rx="7" fill="${FT.tatamiDk}"/>`;
  b += `<path d="M -280 96 L -280 0 Q -280 -24 -256 -24 Q -130 -26 0 4 Q 130 -26 256 -24 Q 280 -24 280 0 L 280 96 Z" fill="${FT.shiki}" stroke="${FT.shikiDk}" stroke-width="7" stroke-linejoin="round"/>`;
  const br = (x, y0, y1, col) => `<path d="M ${x - 16} ${y0} L ${x + 16} ${y0} M ${x} ${y0} L ${x} ${y1} M ${x - 16} ${y1} L ${x + 16} ${y1}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`;
  b += g(br(-236, -22, 94, C.accent) + text(-236, -62, 'はし', { size: 40, w: 900, fill: C.accent }), { o: prog(t, cue(2) + 2.6, 0.4) });
  b += g(br(0, 8, 94, C.redUi) + text(0, -40, 'まんなか', { size: 40, w: 900, fill: C.redUi }), { o: prog(t, cue(2) + 1.2, 0.4) });
  b += g(text(120, -84, '？', { size: 80, w: 900, fill: C.ochre }), { o: prog(t, cue(3) + 0.4, 0.3) });
  return g(b, { o });
}
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -580;
      let a = pop(card(1340, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'からだの ねつが、ふとんの なかに たまるから', { size: 50, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['ねつを だすのは からだ', C.red], ['うごかない くうきが まもる', C.blueUi], ['ぺちゃんこは さむい', FT.coldDk]], t, 960, 600, { start: 2.4, step: 0.9, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [g(eyeIcon(0.3)), 'しきぶとんを よこから、めの たかさで', C.ink, cue(1)],
        [`<path d="M -34 -22 L 34 -22 M 0 -22 L 0 22 M -34 22 L 34 22" fill="none" stroke="${C.redUi}" stroke-width="9" stroke-linecap="round"/>`, 'まんなかと はしの あつさを くらべる', C.ink, cue(2)],
        [airBall(0, 0, 32, t, { temp: 0.12 }), 'うすい ところは、くうきが すくない', C.blueUi, cue(3) + 3.4],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(g(icn, { s: 0.9 }) + text(70, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, st, 150, 350 + i * 140); });
      // 敷きぶとんと、横から見る目
      const mO = prog(t, cue(1) + 0.5, 0.5);
      if (mO > 0) {
        b += g(shikiLook(t, 1), { x: 1480, y: 470, o: mO, s: 1.2 * lerp(0.9, 1, eo(mO)) });
        const eO = prog(t, cue(1) + 2.0, 0.4);
        b += g(eyeIcon(0.4), { x: 1062, y: 528, o: eO });
        b += `<line x1="1120" y1="528" x2="1850" y2="528" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 10" opacity="${eO * 0.8}"/>`;
        b += pop(badge('よそうしてから みてね', { fill: C.ochre, size: 42 }), t, cue(3) + 0.6, 1340, 710);
      }
      b += kidShow('K', t, 1780, 800, { s: 0.5, start: cue(1) + 0.8, n: 1, enter: 'slideR', bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ふとん」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

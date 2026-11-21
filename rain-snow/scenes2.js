// みのまわり図鑑 動画「雨と雪は、空のどこで分かれるの？」（あめと ゆき）
// 出どころ：everyday-trivia trivia/rain-snow.md

// ---------- 道具 ----------
const RS = {
  sky: '#dfe9f1', cold: '#bcd9f2', coldMid: '#dcebf6', coldDk: '#3f7fc4', coldLayer: '#a3c9ee',
  warm: '#fde2bd', warm2: '#fbcf97', warmDk: '#d9822f', neutral: '#eef2f4',
  cloudTop: '#f3f5f7', cloudBot: '#8d99a6', cloudDk: '#6f7c8a',
  rain: '#3f8fe0', rainLt: '#cfe8fa', iceEdge: '#5a9ad6', ice: '#8fc7ea',
  ground: '#a9c596', groundDk: '#8aab78', snowG: '#f6fafc', snowDk: '#d5e3ee', dust: '#8a6a4a', heat: '#ff8a3a',
};
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46 } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
// もくもく雲（上の色 top → 底の色 bot）。底が y=74、てっぺんが y=-194（s=1 のとき）
const CLOUD_PARTS = [[-170, 0, 92], [-70, -72, 122], [64, -64, 112], [168, 4, 84], [-10, -20, 110]];
function puff(x, y, s, { top = RS.cloudTop, bot = RS.cloudBot, id = 'pf', o = 1, edge = null } = {}) {
  let p = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="-190" x2="0" y2="74"><stop offset="0" stop-color="${top}"/><stop offset="0.45" stop-color="${mix(top, bot, 0.25)}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`;
  const shape = CLOUD_PARTS.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('') + `<rect x="-238" y="-20" width="476" height="94" rx="47"/>`;
  if (edge) p += `<g fill="${edge}" stroke="${edge}" stroke-width="8">${shape}</g>`;
  p += `<g fill="url(#${id})">${shape}</g>`;
  return g(p, { x, y, s, o });
}
// 水のつぶ（まるい）
const drop = (x, y, r, o = 1, col = RS.rainLt) => o <= 0.01 ? '' : `<g opacity="${clamp(o)}"><circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="#7fb4dc" stroke-width="${Math.max(2, r * 0.12)}"/><circle cx="${x - r * 0.32}" cy="${y - r * 0.32}" r="${r * 0.28}" fill="#fff" opacity="0.85"/></g>`;
// 雨つぶ（しずくの形。とがった方が上）
const rdrop = (x, y, s = 1, o = 1, col = RS.rain) => o <= 0.01 ? '' :
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${clamp(o)}"><path d="M 0 -26 C 12 -8 18 2 18 12 A 18 18 0 0 1 -18 12 C -18 2 -12 -8 0 -26 Z" fill="${col}"/><ellipse cx="-6" cy="10" rx="4" ry="7" fill="#fff" opacity="0.7"/></g>`;
// 小さな氷のつぶ
const iceBit = (x, y, r, o = 1) => o <= 0.01 ? '' : `<g opacity="${clamp(o)}" transform="translate(${x} ${y})">${[0, 60, 120].map(a => `<line x1="${-r}" y1="0" x2="${r}" y2="0" stroke="${RS.ice}" stroke-width="${r * 0.28}" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}</g>`;
// 雪の結晶。r: 半径、grow: 0（六角の氷のつぶ）〜1（枝がのびきった結晶）
function flake(x, y, r, { rot = 0, o = 1, grow = 1, col = '#ffffff', edge = RS.iceEdge } = {}) {
  if (o <= 0.01 || r <= 0.5) return '';
  const L = r * (0.3 + 0.7 * grow), b1 = clamp((grow - 0.25) / 0.4), b2 = clamp((grow - 0.55) / 0.4);
  let arm = `M 0 0 L 0 ${-L}`;
  if (b1 > 0) { const p = L * 0.5, l = r * 0.3 * b1; arm += ` M 0 ${-p} L ${-l * 0.87} ${-p - l * 0.5} M 0 ${-p} L ${l * 0.87} ${-p - l * 0.5}`; }
  if (b2 > 0) { const p = L * 0.76, l = r * 0.2 * b2; arm += ` M 0 ${-p} L ${-l * 0.87} ${-p - l * 0.5} M 0 ${-p} L ${l * 0.87} ${-p - l * 0.5}`; }
  const hex = r * 0.2, hp = [0, 1, 2, 3, 4, 5].map(i => `${Math.sin(i * Math.PI / 3) * hex} ${-Math.cos(i * Math.PI / 3) * hex}`).join(' L ');
  const arms = [0, 60, 120, 180, 240, 300].map(a => `<path d="${arm}" transform="rotate(${a})"/>`).join('');
  const sw = Math.max(2.5, r * 0.13);
  return `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${clamp(o)}" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<g stroke="${edge}" stroke-width="${sw * 1.9}">${arms}<path d="M ${hp} Z" fill="${edge}"/></g>` +
    `<g stroke="${col}" stroke-width="${sw}">${arms}<path d="M ${hp} Z" fill="${col}"/></g></g>`;
}
// とけていく雪（k: 0 雪 → 1 雨つぶ）
function melting(x, y, r, k, { rot = 0, o = 1 } = {}) {
  if (k <= 0) return flake(x, y, r, { rot, o });
  if (k >= 1) return rdrop(x, y, r / 24, o);
  return drop(x, y, r * (0.45 + 0.25 * k), o * Math.min(1, k * 2.5), mix('#e8f4fd', RS.rain, k * 0.8)) + flake(x, y, r * (1 - 0.55 * k), { rot, o: o * (1 - k * 0.85) });
}
const thermo = (lv, col) => `<rect x="-18" y="-120" width="36" height="200" rx="18" fill="#fff" stroke="${C.ink}" stroke-width="6"/><circle cx="0" cy="96" r="32" fill="${col}" stroke="${C.ink}" stroke-width="6"/><rect x="-9" y="${80 - 180 * lv}" width="18" height="${180 * lv + 10}" rx="9" fill="${col}"/>`;
const tempCol = lv => mix(RS.coldDk, C.red, clamp(lv));
// 雨のすじ
const rainLines = (x0, x1, y0, y1, t, { n = 30, col = RS.rain, o = 1, seed = 1 } = {}) => {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd(i, seed)), p = (t * 1.3 + rnd(i, seed + 1)) % 1, y = lerp(y0, y1, p);
    s += `<line x1="${x}" y1="${y}" x2="${x - 7}" y2="${y + 38}" stroke="${col}" stroke-width="6" stroke-linecap="round" opacity="${o * 0.8 * Math.min(1, p * 8)}"/>`;
  }
  return s;
};
// ふる雪
const snowFall = (x0, x1, y0, y1, t, { n = 24, o = 1, seed = 1, r = 15, edge = RS.iceEdge } = {}) => {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const p = (t * (0.13 + rnd(i, seed + 3) * 0.05) + rnd(i, seed + 1)) % 1;
    const x = lerp(x0, x1, rnd(i, seed)) + Math.sin(t * 1.3 + i * 1.7) * 22, y = lerp(y0, y1, p);
    s += flake(x, y, r * (0.75 + rnd(i, seed + 2) * 0.5), { rot: t * 30 * (i % 2 ? 1 : -1) + i * 20, o: o * Math.min(1, p * 8, (1 - p) * 10), edge });
  }
  return s;
};
// 小さな家（屋根に雪をのせられる）
const houseS = (x, y, s, snow = 0) => house(x, y, s) + (snow > 0 ? g(`<path d="M -84 -74 L 0 -146 L 84 -74 L 66 -80 L 0 -128 L -66 -80 Z" fill="#fff"/>`, { x, y, s, o: snow }) : '');
// ゆきだるま（足もとが原点）
const snowman = (x, y, s = 1, o = 1) => g(`<circle cx="0" cy="-44" r="46" fill="#fff" stroke="${RS.snowDk}" stroke-width="5"/><circle cx="0" cy="-116" r="34" fill="#fff" stroke="${RS.snowDk}" stroke-width="5"/>` +
  `<circle cx="-11" cy="-122" r="5" fill="${C.ink}"/><circle cx="11" cy="-122" r="5" fill="${C.ink}"/><path d="M 0 -114 L 22 -108 L 0 -104 Z" fill="#f08a2e"/><path d="M -30 -92 Q 0 -80 30 -92" fill="none" stroke="${C.redUi}" stroke-width="10" stroke-linecap="round"/>`, { x, y, s, o });
// かさ
const umbrella = (x, y, s = 1, col = C.redUi) => g(`<line x1="0" y1="-10" x2="0" y2="96" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><path d="M -84 0 A 84 78 0 0 1 84 0 Q 63 -16 42 0 Q 21 -16 0 0 Q -21 -16 -42 0 Q -63 -16 -84 0 Z" fill="${col}"/><path d="M 0 96 Q 0 112 -14 110" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`, { x, y, s });

// 1. つかみ：同じような灰色の雲から、雨の日と雪の日
SCENES.push({
  id: 'hook',
  draw(t) {
    const GY = 790, c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${RS.sky}"/>`;
    // 左：雨の日（はじめは まん中。雪の日が出るときに左へ寄る）
    const sh = 480 * (1 - eio(prog(t, c1 - 0.7, 0.9)));
    out += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${RS.ground}"/><rect x="0" y="${GY}" width="1920" height="10" fill="${RS.groundDk}"/>`;
    out += `<g transform="translate(${sh} 0)">`;
    out += houseS(250, GY, 1.1) + tree(700, GY, 1.0, '#5a9a5f');
    [[420, 820, 70], [620, 836, 54]].forEach(([x, y, w], i) => {
      out += `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.2}" fill="#8fbfe6"/>`;
      const p = (t * 0.9 + i * 0.5) % 1; out += `<ellipse cx="${x}" cy="${y}" rx="${w * p * 0.8}" ry="${w * 0.2 * p * 0.8}" fill="none" stroke="#fff" stroke-width="4" opacity="${(1 - p) * prog(t, c0 + 1.0, 0.5)}"/>`;
    });
    out += rainLines(120, 840, 330, GY - 20, t, { n: 34, o: prog(t, c0 + 0.8, 0.6) });
    out += puff(480, 250, 1.15, { id: 'h1' });
    out += pop(badge('あめの ひ', { fill: RS.rain, size: 48 }), t, c0 + 1.6, 480, 90);
    out += `</g>`;
    // 右：雪の日（N1 で見えてくる）
    const rO = prog(t, c1 - 0.2, 0.6);
    let R = `<rect x="960" y="0" width="960" height="1080" fill="${mix(RS.sky, '#ffffff', 0.25)}"/>`;
    R += `<rect x="960" y="${GY}" width="960" height="${1080 - GY}" fill="${RS.snowG}"/><path d="M 960 ${GY + 4} Q 1200 ${GY - 26} 1440 ${GY + 2} T 1920 ${GY - 6} L 1920 ${GY + 30} L 960 ${GY + 30} Z" fill="${RS.snowG}"/><path d="M 960 ${GY + 4} Q 1200 ${GY - 26} 1440 ${GY + 2} T 1920 ${GY - 6}" fill="none" stroke="${RS.snowDk}" stroke-width="5"/>`;
    R += houseS(1680, GY, 1.1, 1) + snowman(1230, GY, 1.0);
    R += snowFall(1060, 1820, 330, GY - 10, t, { n: 26, o: prog(t, c1 + 0.8, 0.6), seed: 5 });
    R += puff(1440, 250, 1.15, { id: 'h2' });
    out += g(R, { o: rO });
    out += pop(badge('ゆきの ひ', { fill: RS.coldDk, size: 48 }), t, c1 + 1.6, 1440, 90);
    out += `<rect x="954" y="0" width="12" height="1080" fill="${C.paper}" opacity="${rO}"/>`;
    // 同じような灰色の雲
    const same = win(t, c1 + 2.4, cue(2) - 0.9, 0.3);
    [480, 1440].forEach(x => { out += `<ellipse cx="${x}" cy="225" rx="320" ry="200" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-dasharray="26 18" opacity="${same}"/>`; });
    out += g(badge('おなじような はいいろの くも', { fill: C.ochre, size: 42 }), { x: 960, y: 500, o: same });
    out += kidShow('B', t, 960, 846, { s: 0.55, start: cue(2) - 0.8, n: 0, side: 'right' });
    out += g(text(0, 0, '？', { size: 180, w: 900, fill: C.ochre, extra: `stroke="${C.paper}" stroke-width="16" paint-order="stroke"` }), { x: 960, y: 420, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${RS.rain}">あめ</tspan>と <tspan fill="${RS.coldDk}">ゆき</tspan>は</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どこで わかれるの？</text>`, { x: 960, y: 570, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(rdrop(-150, 0, 2.6) + flake(150, 0, 70, { rot: t * 20 }) + text(0, 0, '？', { size: 100, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 780);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'にほんの あめは、そらの うえでは どんな すがた？', { size: 58, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'こおりの つぶや、ゆき'], ['②', 'はじめから、みずの つぶ'], ['③', 'わたのような、ふわふわの かたまり']];
    const icn = [flake(-40, 0, 40) + iceBit(42, 10, 20), drop(-30, 6, 26, 1) + drop(30, -8, 18, 1), puff(0, 22, 0.24, { id: 'g3', top: '#ffffff', bot: '#e3e9ee', edge: '#c9d3dc' })];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 46, w: 700, anchor: 'start' }) + g(icn[i], { x: 500, y: 0 }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(puff(0, 60, 0.42, { id: 'gq' }) + text(120, -70, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1680, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 雲のつぶは小さすぎて、なかなか落ちてこない
SCENES.push({
  id: 'cloud',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#dcecf7"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const CX = 560, CY = 330, MX = 1380, MY = 440, R = 250;
    out += puff(CX + Math.sin(t * 0.5) * 6, CY, 1.3, { id: 'c1', top: '#ffffff', bot: '#b9c4cf' });
    // 虫めがね：雲の中は小さなつぶ
    const mO = prog(t, c0 + 1.0, 0.5);
    if (mO > 0) {
      out += `<line x1="${CX + 150}" y1="${CY - 40}" x2="${MX - R + 20}" y2="${MY - 60}" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="14 10" opacity="${mO}"/><circle cx="${CX + 150}" cy="${CY - 40}" r="16" fill="none" stroke="${C.blueUi}" stroke-width="6" opacity="${mO}"/>`;
      const wind = prog(t, c2 + 0.6, 0.8);
      let m = `<rect x="${R * 0.66}" y="${R * 0.66}" width="50" height="190" rx="25" fill="${C.ochre}" transform="rotate(-45 ${R * 0.66} ${R * 0.66})"/><circle r="${R}" fill="#eef4f8"/><clipPath id="lp"><circle r="${R - 8}"/></clipPath><g clip-path="url(#lp)">`;
      // 上にのぼる風
      if (wind > 0) for (let i = 0; i < 4; i++) { const x = -150 + i * 100; m += `<line x1="${x}" y1="230" x2="${x}" y2="-230" stroke="${RS.heat}" stroke-width="12" stroke-linecap="round" stroke-dasharray="40 46" stroke-dashoffset="${t * 110}" opacity="${0.38 * wind}"/>`; }
      for (let i = 0; i < 22; i++) {
        const bx = (rnd(i, 1) - 0.5) * 400, by0 = (rnd(i, 2) - 0.5) * 400;
        // ゆっくり落ちる（N9）。風があると、おし上げられて、上がったり下がったり（N10）
        const slow = ((by0 + 230 + Math.max(0, t - c1) * 14 * (1 - wind)) % 460) - 230;
        const y = slow + Math.sin(t * 1.4 + i * 1.3) * (5 + 22 * wind) - 26 * wind * Math.sin(t * 0.9 + i);
        const x = bx + Math.sin(t * 0.8 + i * 2.1) * 8;
        m += i % 4 === 3 ? iceBit(x, y, 13 + rnd(i, 4) * 6) : drop(x, y, 9 + rnd(i, 3) * 8);
      }
      m += `</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="18"/>`;
      out += g(m, { x: MX, y: MY, o: mO, s: lerp(0.9, 1, eo(mO)) });
      out += pop(badge('ちいさな みずや こおりの つぶ', { fill: C.blueUi, size: 44 }), t, c0 + 1.8, MX, 120);
    }
    // 落ちる速さ：1秒に1センチくらい
    const rO = win(t, c1 + 0.4, c2 - 0.1, 0.4);
    if (rO > 0) {
      const RX = 330, RY = 480, CM = 52;
      let r = `<rect x="${RX - 26}" y="${RY - 14}" width="52" height="${CM * 6 + 28}" rx="8" fill="#f4e2b0" stroke="${C.ochre}" stroke-width="5"/>`;
      for (let k = 0; k <= 6; k++) r += `<line x1="${RX - 26}" y1="${RY + k * CM}" x2="${RX + 6}" y2="${RY + k * CM}" stroke="${C.ink}" stroke-width="5"/>` + (k < 6 ? `<line x1="${RX - 26}" y1="${RY + k * CM + CM / 2}" x2="${RX - 8}" y2="${RY + k * CM + CM / 2}" stroke="${C.ink}" stroke-width="3"/>` : '');
      const tt = Math.max(0, t - (c1 + 0.8)), y = RY + (tt % 6) * CM, sec = Math.floor(tt % 6);
      r += `<path d="M ${RX + 40} ${RY} L ${RX + 62} ${RY} M ${RX + 40} ${RY + CM} L ${RX + 62} ${RY + CM} M ${RX + 51} ${RY} L ${RX + 51} ${RY + CM}" stroke="${C.red}" stroke-width="5" fill="none"/>` + text(RX + 74, RY + CM / 2 + 2, '1センチ', { size: 34, w: 900, fill: C.red, anchor: 'start' });
      r += drop(RX + 250, y, 15, Math.min(1, (6 - (tt % 6)) * 4, (tt % 6) * 4 + 0.2));
      r += `<line x1="${RX + 10}" y1="${y}" x2="${RX + 228}" y2="${y}" stroke="${C.blueUi}" stroke-width="3" stroke-dasharray="8 8" opacity="0.7"/>`;
      r += g(badge('1びょうに 1センチくらい', { fill: C.blueUi, size: 40 }), { x: 870, y: 600 });
      r += g(`<circle r="46" fill="#fff" stroke="${C.ink}" stroke-width="6"/><line x1="0" y1="0" x2="${Math.sin(tt * Math.PI * 2) * 30}" y2="${-Math.cos(tt * Math.PI * 2) * 30}" stroke="${C.red}" stroke-width="6" stroke-linecap="round"/><rect x="-8" y="-62" width="16" height="14" fill="${C.ink}"/>` + text(70, 2, `${sec + 1}びょう`, { size: 40, w: 900, anchor: 'start' }), { x: 760, y: 730 });
      out += g(r, { o: rO });
    }
    // 上にのぼる風
    const wO = prog(t, c2 + 0.4, 0.5);
    if (wO > 0) {
      [380, 500, 620].forEach((x, i) => { out += g(arrow2(x, 800, x, 520 - Math.sin(t * 3 + i) * 10, RS.heat, 16), { o: wO * 0.9 }); });
      out += pop(badge('うえに のぼる かぜ', { fill: RS.warmDk, size: 44 }), t, c2 + 1.0, 900, 640);
      out += pop(badge('なかなか おちて こない', { fill: C.ink, size: 42 }), t, c2 + 3.4, MX, 770);
    }
    out += kidShow('S', t, 170, 850, { s: 0.5, start: c2 + 2.0, n: 0, side: 'right' });
    return out;
  },
});

// 4. ぶつかって、くっついて、大きく重くなると落ちる
const GR_HOME = [[-260, -150], [-120, -210], [40, -190], [220, -160], [300, -20], [250, 150], [90, 210], [-90, 200], [-250, 130], [-320, -10], [-150, -40], [130, 30]];
SCENES.push({
  id: 'grow',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    // (a) ぶつかって、くっつく
    const aO = 1 - prog(t, c1 - 0.5, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 480, T0 = c0 + 1.2, STEP = 0.48;
      let a = `<ellipse cx="${CX}" cy="${CY}" rx="520" ry="330" fill="#e6f0f7"/>`, n = 0, bump = 0;
      GR_HOME.forEach(([hx, hy], i) => {
        const ta = T0 + i * STEP, k = prog(t, ta - 0.45, 0.45);
        if (k >= 1) { n++; bump = Math.max(bump, 1 - prog(t, ta, 0.3)); return; }
        const fx = hx + Math.sin(t * 1.1 + i * 2) * 10, fy = hy + Math.cos(t * 0.9 + i) * 10;
        a += drop(CX + lerp(fx, 0, eio(k)), CY + lerp(fy, 0, eio(k)), 20);
      });
      const BR = 26 + n * 9.5;
      a += drop(CX, CY, BR * (1 + 0.12 * bump), 1);
      a += pop(badge('ぶつかって くっつく', { fill: C.blueUi, size: 48 }), t, c0 + 0.8, 960, 190);
      a += pop(badge('だんだん おおきく、おもく', { fill: RS.rain, size: 46 }), t, c0 + 4.6, 960, 790);
      out += g(a, { o: aO });
    }
    // (b) 雲のつぶ → 雨つぶ：長さで100倍、かさで100万倍（絵は ほんとうの比）
    const bO = win(t, c1 - 0.1, c2 - 0.2, 0.4);
    if (bO > 0) {
      const DX = 1080, DY = 480, DR = 200, SX = 450;
      let b = pop(badge('くもの つぶ', { fill: C.blueUi, size: 44 }), t, c1 + 0.3, SX, 300);
      b += `<circle cx="${SX}" cy="${DY}" r="2" fill="${RS.rain}" opacity="${prog(t, c1 + 0.5, 0.3)}"/>`;
      b += `<circle cx="${SX}" cy="${DY}" r="${46 + Math.sin(t * 4) * 4}" fill="none" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10" opacity="${prog(t, c1 + 0.6, 0.4)}"/>`;
      b += g(text(0, 0, 'ちいさな てん', { size: 36, w: 700, fill: C.muted }), { x: SX, y: 570, o: prog(t, c1 + 0.8, 0.4) });
      b += pop(arrow2(-90, 0, 90, 0, C.muted, 12), t, c1 + 1.6, 700, DY);
      b += pop(drop(0, 0, DR, 1), t, c1 + 1.9, DX, DY, { d: 0.7 });
      b += pop(badge('あまつぶ', { fill: RS.rain, size: 44 }), t, c1 + 2.2, DX, 220);
      // 長さで100倍：雲のつぶを100こ ならべると、雨つぶのはば
      const nk = Math.floor(prog(t, c1 + 3.0, 2.0) * 100);
      for (let i = 0; i < nk; i++) b += `<circle cx="${DX - DR + 2 + i * 4}" cy="${DY}" r="2" fill="${C.red}"/>`;
      b += pop(badge('ながさで 100ばい', { fill: C.redUi, size: 46 }), t, c1 + 3.4, 1600, 400);
      b += pop(badge('かさで 100まんばい', { fill: C.red, size: 46 }), t, c1 + 6.0, 1600, 530);
      out += g(b, { o: bO });
    }
    // (c) やっと地面まで落ちてくる
    const cO = prog(t, c2 - 0.1, 0.5);
    if (cO > 0) {
      const GY = 800;
      let c = `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${RS.ground}"/><rect x="0" y="${GY}" width="1920" height="10" fill="${RS.groundDk}"/>`;
      c += houseS(380, GY, 1.0) + tree(1560, GY, 1.0, '#5a9a5f');
      for (let i = 0; i < 9; i++) {
        const p = ((t - c2) * 0.55 + rnd(i, 7)) % 1, x = 620 + rnd(i, 8) * 680, y = lerp(330, GY - 16, p * p * 0.5 + p * 0.5);
        if (t > c2 + 0.5) c += rdrop(x, y, 1.3, Math.min(1, p * 6, (1 - p) * 14));
        if (p > 0.92 && t > c2 + 0.5) c += `<ellipse cx="${x}" cy="${GY + 6}" rx="${(p - 0.92) * 500}" ry="${(p - 0.92) * 120}" fill="none" stroke="${RS.rain}" stroke-width="4" opacity="${(1 - p) * 10}"/>`;
      }
      c += puff(960, 250, 1.15, { id: 'gr' });
      c += pop(badge('やっと じめんへ', { fill: RS.rain, size: 48 }), t, c2 + 1.6, 1560, 330);
      out += g(c, { o: cO });
    }
    return out;
  },
});

// 5. 空の上は寒い。ちりを芯に氷のつぶができて、雪の結晶に育つ
const ICE_IN = [[-200, -40, 0], [-90, -110, 1], [40, -90, 0], [170, -40, 1], [-140, 20, 1], [-20, -20, 0], [100, 20, 0], [220, 30, 1], [-250, 30, 0], [20, -170, 1], [-70, 36, 0], [150, -120, 0]];
SCENES.push({
  id: 'ice',
  draw(t) {
    const GY = 810, c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<linearGradient id="isky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5caec"/><stop offset="0.6" stop-color="#dcebf4"/><stop offset="1" stop-color="#fdf3e0"/></linearGradient><rect width="1920" height="1080" fill="url(#isky)"/>`;
    out += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${RS.ground}"/><rect x="0" y="${GY}" width="1920" height="10" fill="${RS.groundDk}"/>`;
    out += houseS(660, GY, 0.8) + tree(820, GY, 0.8, '#5a9a5f') + houseS(1000, GY, 0.7);
    out += topBadge();
    const CX = 720, CY = 330;
    // 雨の正体：雲から雪が落ちて、とちゅうでとける（N17）
    const fO = prog(t, c3 + 2.4, 0.6);
    if (fO > 0) for (let i = 0; i < 7; i++) {
      const p = ((t - c3) * 0.2 + i / 7) % 1, x = 500 + rnd(i, 21) * 440 + Math.sin(t * 1.3 + i) * 14 * (1 - p), y = lerp(CY + 70, GY - 14, p);
      out += melting(x, y, 22, clamp((p - 0.5) / 0.22), { rot: t * 40 + i * 30, o: fO * Math.min(1, p * 8, (1 - p) * 12) });
    }
    out += puff(CX, CY, 1.35, { id: 'ic', top: '#f7f9fb', bot: '#a9b4c0' });
    // 高いところほど寒い
    out += g(arrow2(130, 780, 130, 190, C.ink, 10) + text(130, 150, 'たかい', { size: 40, w: 900 }), { o: prog(t, 0.4, 0.5) });
    const up = eio(prog(t, c0 + 0.8, 2.6)), ty = lerp(680, 290, up), lv = lerp(0.72, 0.14, up);
    out += g(thermo(lv, tempCol(lv)), { x: 270, y: ty, s: 0.8, o: prog(t, 0.5, 0.4) });
    out += pop(badge('あたたかい', { fill: C.redUi, size: 38 }), t, 0.8, 480, 740, { end: c0 + 1.6 });
    out += pop(badge('さむい', { fill: RS.coldDk, size: 44 }), t, c0 + 3.0, 270, 446);
    out += pop(badge('たかい ところほど さむい', { fill: C.ink, size: 46 }), t, c0 + 1.4, 1440, 500, { end: c1 - 0.2 });
    // 虫めがね：ちりを芯に氷のつぶ → 雪の結晶
    const MX = 1480, MY = 470, R = 240;
    const mO = win(t, c1 + 0.2, c3 - 0.1, 0.5);
    if (mO > 0) {
      out += `<line x1="${CX + 190}" y1="${CY - 30}" x2="${MX - R + 16}" y2="${MY - 50}" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="14 10" opacity="${mO}"/><circle cx="${CX + 190}" cy="${CY - 30}" r="16" fill="none" stroke="${C.blueUi}" stroke-width="6" opacity="${mO}"/>`;
      let m = `<rect x="${R * 0.66}" y="${R * 0.66}" width="50" height="190" rx="25" fill="${C.ochre}" transform="rotate(-45 ${R * 0.66} ${R * 0.66})"/><circle r="${R}" fill="#cfe2f3"/><clipPath id="ip"><circle r="${R - 8}"/></clipPath><g clip-path="url(#ip)">`;
      // まわりの水のつぶ（こおっていない）
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.4, d = 168 + rnd(i, 5) * 40; m += drop(Math.cos(a) * d + Math.sin(t + i) * 6, Math.sin(a) * d + Math.cos(t * 0.8 + i) * 6, 12, 0.9); }
      // 目に見えない水蒸気（うすい点）が集まってくる
      const vO = prog(t, c2 + 0.4, 0.6);
      if (vO > 0) for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2 + rnd(i, 6), p = (t * 0.32 + rnd(i, 7)) % 1, d = lerp(230, 40, p);
        m += `<circle cx="${Math.cos(a) * d}" cy="${Math.sin(a) * d}" r="6" fill="#fff" stroke="${RS.iceEdge}" stroke-width="2" opacity="${vO * Math.min(1, p * 6) * (1 - p) * 1.4}"/>`;
      }
      // 氷のつぶ → 結晶
      const iceK = prog(t, c1 + 3.2, 3.6), gk = eio(prog(t, c2 + 1.2, 4.6));
      if (iceK > 0) m += flake(0, 0, lerp(8, 56, eo(iceK)) + gk * 124, { grow: gk, rot: t * 6 });
      // ちり
      const dk = prog(t, c1 + 1.2, 0.4);
      m += g(`<path d="M -11 -4 L -3 -12 L 9 -8 L 12 3 L 3 11 L -8 9 Z" fill="${RS.dust}"/>`, { s: Math.max(back(dk), 0.001) * 1.2, o: dk });
      m += `</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="18"/>`;
      out += g(m, { x: MX, y: MY, o: mO, s: lerp(0.9, 1, eo(mO)) });
      out += callout(MX + 14, MY - 2, 1760, 300, 'ちり', win(t, c1 + 1.6, c2 + 1.0, 0.3) * mO, { col: RS.dust, size: 44 });
      out += g(pop(badge('マイナス5ど より さむい', { fill: RS.coldDk, size: 44 }), t, c1 + 0.6, MX, 160), { o: mO });
      const lab = t < c2 ? 'ちりを しんに、こおりの つぶ' : t < c2 + 4.6 ? 'すいじょうきを とりこんで そだつ' : 'ゆきの けっしょう';
      const lst = t < c2 ? c1 + 4.2 : t < c2 + 4.6 ? c2 + 0.6 : c2 + 4.6;
      out += g(pop(badge(lab, { fill: t < c2 + 4.6 ? C.blueUi : RS.coldDk, size: 42 }), t, lst, MX, 762), { o: mO });
    }
    // 日本でふる雨のほとんどは、空の上では氷のつぶや雪
    const jO = prog(t, c3 + 0.2, 0.5);
    if (jO > 0) {
      ICE_IN.forEach(([dx, dy, k], i) => {
        const st = c3 + 0.4 + i * 0.12, x = CX + dx * 1.2 + Math.sin(t * 1.2 + i) * 5, y = CY + dy * 1.2 - 20 + Math.cos(t + i) * 5;
        out += pop(k ? flake(0, 0, 30, { rot: t * 14 + i * 20 }) : iceBit(0, 0, 20), t, st, x, y, { d: 0.4 });
      });
      out += pop(card(800, 230) + text(0, -50, 'にほんで ふる あめの ほとんどは', { size: 40, w: 900 }) + text(0, 40, 'そらの うえでは こおりの つぶや ゆき', { size: 40, w: 900, fill: RS.coldDk }), t, c3 + 1.2, 1450, 330);
    }
    out += kidShow('K', t, 1500, 800, { s: 0.5, start: c3 + 3.0, n: 0, enter: 'slideR' });  // 右から入る（顔は左向き。うしろ向きに進まないように）
    return out;
  },
});

// 6. とけるかどうかは、落ちる道しだい（同じ雪を、ちがう道で追いかける）
const PATHC = { y0: 285, GY: 800, L: [130, 790], M: [820, 1100], R: [1130, 1790] };
SCENES.push({
  id: 'path',
  draw(t) {
    const { y0, GY, L, M, R } = PATHC, H = GY - y0;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), c5 = cue(5);
    let out = `<rect width="1920" height="1080" fill="${RS.sky}"/>`;
    const kL = prog(t, c1, 0.8), kR = prog(t, c4, 0.8), kM = prog(t, c5 - 0.2, 0.7);
    const ZL = 520, ZM = 650;
    // 空気の柱
    const gradL = `<linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(RS.neutral, RS.cold, kL)}"/><stop offset="${(ZL - y0) / H - 0.04}" stop-color="${mix(RS.neutral, RS.coldMid, kL)}"/><stop offset="${(ZL - y0) / H + 0.06}" stop-color="${mix(RS.neutral, RS.warm, kL)}"/><stop offset="1" stop-color="${mix(RS.neutral, RS.warm2, kL)}"/></linearGradient>`;
    const gradR = `<linearGradient id="pr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(RS.neutral, RS.cold, kR)}"/><stop offset="0.68" stop-color="${mix(RS.neutral, RS.coldMid, kR)}"/><stop offset="1" stop-color="${mix(RS.neutral, RS.coldMid, kR)}"/></linearGradient>`;
    const gradM = `<linearGradient id="pm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${RS.cold}"/><stop offset="${(ZM - y0) / H - 0.04}" stop-color="${RS.coldMid}"/><stop offset="${(ZM - y0) / H + 0.06}" stop-color="${RS.warm}"/><stop offset="1" stop-color="${RS.warm}"/></linearGradient>`;
    out += gradL + gradR + gradM;
    out += `<rect x="${L[0]}" y="${y0 - 60}" width="${L[1] - L[0]}" height="${H + 60}" fill="url(#pl)"/><rect x="${R[0]}" y="${y0 - 60}" width="${R[1] - R[0]}" height="${H + 60}" fill="url(#pr)"/>`;
    out += g(`<rect x="${M[0]}" y="${y0 - 60}" width="${M[1] - M[0]}" height="${H + 60}" fill="url(#pm)"/>`, { o: kM });
    // 地面の近くの冷たい空気の層（右）
    const YC = 590, layO = prog(t, c4 + 1.4, 0.6);
    out += g(`<rect x="${R[0]}" y="${YC}" width="${R[1] - R[0]}" height="${GY - YC}" fill="${RS.coldLayer}"/><line x1="${R[0]}" y1="${YC}" x2="${R[1]}" y2="${YC}" stroke="${RS.coldDk}" stroke-width="5" stroke-dasharray="18 14"/>`, { o: layO });
    // 0度の線
    const zL = prog(t, c2 + 0.3, 0.5);
    out += g(`<line x1="${L[0]}" y1="${ZL}" x2="${L[1]}" y2="${ZL}" stroke="${C.red}" stroke-width="5" stroke-dasharray="18 14"/>` + g(badge('0ど', { fill: C.red, size: 38, pad: 26 }), { x: L[1] - 70, y: ZL }), { o: zL });
    out += g(`<line x1="${M[0]}" y1="${ZM}" x2="${M[1]}" y2="${ZM}" stroke="${C.red}" stroke-width="5" stroke-dasharray="18 14"/>` + g(badge('0ど', { fill: C.red, size: 32, pad: 20 }), { x: M[1] - 52, y: ZM }), { o: prog(t, c5 + 0.6, 0.5) });
    // 寒い・あたたかい
    out += pop(badge('さむい', { fill: RS.coldDk, size: 38 }), t, c1 + 0.8, L[0] + 110, 345);
    out += pop(badge('あたたかい', { fill: RS.warmDk, size: 38 }), t, c1 + 2.2, L[0] + 140, 620);
    out += pop(badge('さむい', { fill: RS.coldDk, size: 38 }), t, c4 + 0.6, R[1] - 110, 345);
    out += g(thermo(0.16, tempCol(0.16)), { x: 65, y: 390, s: 0.45, o: prog(t, c1 + 0.8, 0.4) }) + g(thermo(0.66, tempCol(0.66)), { x: 65, y: 690, s: 0.45, o: prog(t, c1 + 2.2, 0.4) });
    out += g(thermo(0.16, tempCol(0.16)), { x: 1855, y: 390, s: 0.45, o: prog(t, c4 + 0.6, 0.4) }) + g(thermo(0.2, tempCol(0.2)), { x: 1855, y: 690, s: 0.45, o: layO });
    // 地面
    out += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${RS.ground}"/><rect x="0" y="${GY}" width="1920" height="10" fill="${RS.groundDk}"/>`;
    const snowG = prog(t, c4 + 2.6, 2.0);
    out += g(`<rect x="${R[0]}" y="${GY - 4}" width="${R[1] - R[0]}" height="${1080 - GY + 4}" fill="${RS.snowG}"/><path d="M ${R[0]} ${GY} Q ${R[0] + 170} ${GY - 22} ${R[0] + 330} ${GY - 2} T ${R[1]} ${GY - 4} L ${R[1]} ${GY + 20} L ${R[0]} ${GY + 20} Z" fill="${RS.snowG}"/><path d="M ${R[0]} ${GY} Q ${R[0] + 170} ${GY - 22} ${R[0] + 330} ${GY - 2} T ${R[1]} ${GY - 4}" fill="none" stroke="${RS.snowDk}" stroke-width="5"/>`, { o: snowG });
    out += g(`<rect x="${M[0]}" y="${GY}" width="${M[1] - M[0]}" height="${1080 - GY}" fill="#cfdad8"/>`, { o: kM });
    out += houseS(715, GY, 0.75) + houseS(1690, GY, 0.75, snowG);
    out += pop(snowman(0, 0, 0.8), t, c4 + 4.4, 1570, GY);
    const pud = prog(t, c3 + 0.6, 0.8);
    [[330, 818, 60], [520, 826, 44]].forEach(([x, y, w], i) => {
      out += `<ellipse cx="${x}" cy="${y}" rx="${w * pud}" ry="${w * 0.2 * pud}" fill="#8fbfe6"/>`;
      const p = (t * 0.9 + i * 0.5) % 1; out += `<ellipse cx="${x}" cy="${y}" rx="${w * p * 0.8}" ry="${w * 0.2 * p * 0.8}" fill="none" stroke="#fff" stroke-width="4" opacity="${(1 - p) * pud}"/>`;
    });
    // 落ちてくるつぶ
    const limL = lerp(430, GY, eo(prog(t, c2 + 0.2, 2.4))), limR = lerp(430, GY, eo(prog(t, c4 + 0.4, 2.4)));
    for (let i = 0; i < 9; i++) {
      // 左：0度の線をこえると、とけて雨
      const p = (t * 0.085 + i / 9) % 1, sway = Math.sin(t * 1.2 + i * 1.9) * 18;
      const xL = lerp(L[0] + 270, L[1] - 160, rnd(i, 31));
      const yL = p < 0.72 ? lerp(y0, 640, p / 0.72) : lerp(640, GY - 14, eio((p - 0.72) / 0.28));
      const mk = clamp((yL - ZL) / 100);
      out += melting(xL + sway * (1 - mk), yL, 24, mk, { rot: t * 36 + i * 25, o: Math.min(1, p * 10, (1 - p) * 30) * (1 - prog(yL, limL - 50, 50)) });
      // 右：とけないで雪のまま
      const p2 = (t * 0.075 + i / 9 + 0.05) % 1, xR = lerp(R[0] + 150, R[1] - 210, rnd(i, 33)), yR = lerp(y0, GY - 12, p2);
      out += flake(xR + Math.sin(t * 1.2 + i * 2.3) * 18, yR, 24, { rot: t * 36 + i * 25, o: Math.min(1, p2 * 10, (1 - p2) * 24) * (1 - prog(yR, limR - 50, 50)) });
    }
    if (kM > 0) for (let i = 0; i < 4; i++) {
      // まん中：とけきらないうちに着く（みぞれ）
      const p = (t * 0.08 + i / 4) % 1, x = lerp(M[0] + 60, M[1] - 110, rnd(i, 35)), y = lerp(y0, GY - 14, p);
      out += melting(x + Math.sin(t * 1.2 + i * 2.1) * 12, y, 24, clamp((y - ZM) / 110) * 0.55, { rot: t * 36 + i * 25, o: kM * Math.min(1, p * 10, (1 - p) * 24) });
    }
    out += g(text(1460, 634, 'つめたい くうきの そう', { size: 40, w: 900, fill: RS.coldDk, extra: `stroke="${RS.coldLayer}" stroke-width="12" stroke-linejoin="round" paint-order="stroke"` }), { o: layO });
    // 雲（上の帯）
    out += `<rect x="0" y="0" width="1920" height="${y0 - 80}" fill="${RS.cloudBot}"/>`;
    out += puff(330, 196, 1.25, { id: 'p1', top: '#cfd6dd', bot: RS.cloudBot }) + puff(1590, 196, 1.25, { id: 'p3', top: '#cfd6dd', bot: RS.cloudBot }) + puff(960, 190, 1.35, { id: 'p2', top: '#dde3e8', bot: RS.cloudBot });
    out += topBadge();
    // はてな（N18）
    const qO = win(t, c0 + 0.6, c1 + 0.2, 0.3);
    [(L[0] + L[1]) / 2, (R[0] + R[1]) / 2].forEach(x => { out += g(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre }), { x, y: 640, o: qO }); });
    out += g(badge('おなじ ゆき', { fill: RS.coldDk, size: 42 }), { x: 960, y: 420, o: win(t, c0 + 1.2, c1 + 0.2, 0.3) });
    // とけはじめる
    out += callout(L[0] + 400, ZL + 46, 830, 580, 'とけはじめる', win(t, c2 + 2.4, c4 - 0.2, 0.3), { col: C.red, size: 40 });
    // けっか
    out += pop(badge('あめ', { fill: RS.rain, size: 56, pad: 40 }), t, c3 + 1.4, L[0] + 105, 745);
    out += pop(badge('ゆき', { fill: RS.coldDk, size: 56, pad: 40 }), t, c4 + 5.4, R[0] + 105, 745);
    out += pop(badge('みぞれ', { fill: '#5f7f96', size: 50, pad: 30 }), t, c5 + 3.4, 960, 745);
    out += pop(umbrella(0, 0, 0.7), t, c3 + 1.8, 560, 722);
    return out;
  },
});

// 7. 地上の気温だけでは決まらない（空気がかわいていると、雪のままとどくことがある）
SCENES.push({
  id: 'dry',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    const PL = 500, PR = 1420, PY = 460, PW = 720, PH = 500;
    const aO = 1 - prog(t, c3 - 0.5, 0.5);
    if (aO > 0) {
      let a = '';
      // しめった空気／かわいた空気
      a += g(`<rect x="${-PW / 2}" y="${-PH / 2}" width="${PW}" height="${PH}" rx="36" fill="#dfecf6" filter="url(#shadow)"/>`, { x: PL, y: PY });
      a += g(`<rect x="${-PW / 2}" y="${-PH / 2}" width="${PW}" height="${PH}" rx="36" fill="#fbf1dc" filter="url(#shadow)"/>`, { x: PR, y: PY });
      for (let i = 0; i < 46; i++) a += `<circle cx="${PL - 320 + rnd(i, 41) * 640 + Math.sin(t + i) * 4}" cy="${290 + rnd(i, 42) * 390}" r="7" fill="#9ccbee" opacity="0.75"/>`;
      for (let i = 0; i < 5; i++) a += `<circle cx="${PR - 320 + rnd(i, 43) * 640 + Math.sin(t + i) * 4}" cy="${290 + rnd(i, 44) * 390}" r="7" fill="#9ccbee" opacity="0.75"/>`;
      a += pop(badge('しめった くうき', { fill: C.blueUi, size: 44 }), t, c0 + 2.2, PL, 236);
      a += pop(badge('かわいた くうき', { fill: C.ochre, size: 44 }), t, c0 + 2.8, PR, 236);
      // 同じ気温（0度より少しあたたかい）
      a += pop(badge('おなじ きおん', { fill: C.ink, size: 40 }), t, c0 + 0.5, 960, 150);
      let th = thermo(0.5, tempCol(0.62)) + `<line x1="-36" y1="14" x2="36" y2="14" stroke="${C.red}" stroke-width="5" stroke-dasharray="8 6"/>` + text(0, 164, '0ど', { size: 34, w: 900, fill: C.red });
      a += pop(th, t, c0 + 0.9, 960, 430);
      a += pop(text(0, -22, 'すこし', { size: 34, w: 900, fill: C.redUi }) + text(0, 22, 'あたたかい', { size: 34, w: 900, fill: C.redUi }), t, c0 + 1.5, 960, 680);
      const zoom = prog(t, c2 - 0.2, 0.6);
      // 落ちてくる雪：しめった空気ではとけて雨、かわいた空気では雪のまま
      const fall = prog(t, c1 + 0.2, 0.5);
      for (let i = 0; i < 5; i++) {
        const p = (Math.max(0, t - c1) * 0.11 + i / 5) % 1, y = lerp(300, 672, p), sw = Math.sin(t * 1.2 + i * 2) * 14;
        const o = fall * Math.min(1, p * 8, (1 - p) * 14);
        const mk = clamp((y - 420) / 110);
        a += melting(PL - 220 + rnd(i, 45) * 440 + sw * (1 - mk), y, 26, mk, { rot: t * 36 + i * 30, o });
        a += flake(PR - 220 + rnd(i, 46) * 440 + sw, y, 26, { rot: t * 36 + i * 30, o: o * (1 - zoom) });
      }
      a += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: PL, y: 520, o: win(t, c0 + 3.2, c1 + 0.2, 0.3) }) + g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: PR, y: 520, o: win(t, c0 + 3.2, c1 + 0.2, 0.3) });
      a += pop(badge('あめ', { fill: RS.rain, size: 50, pad: 40 }), t, c1 + 3.0, PL, 762);
      a += pop(badge('ゆきの まま', { fill: RS.coldDk, size: 50, pad: 40 }), t, c1 + 4.4, PR, 762, { end: c2 + 0.1 });
      // 大きく見る：雪から水が蒸発して、熱がうばわれる
      if (zoom > 0) {
        const FX = PR, FY = 476;
        let z = `<circle cx="${FX}" cy="${FY}" r="${150 + Math.sin(t * 3) * 8}" fill="${RS.coldDk}" opacity="${0.22 * prog(t, c2 + 3.0, 1.0)}" filter="url(#soft)"/>`;
        z += flake(FX, FY, 104, { rot: Math.sin(t * 0.8) * 6 });
        for (let i = 0; i < 8; i++) {
          const a2 = i / 8 * Math.PI * 2 + 0.3, p = (t * 0.45 + i * 0.37) % 1, d = lerp(110, 250, p);
          z += drop(FX + Math.cos(a2) * d, FY + Math.sin(a2) * d * 0.8, 9, Math.min(1, p * 5) * (1 - p) * prog(t, c2 + 0.8, 0.5), RS.rainLt);
          if (i % 2 === 0) z += g(`<path d="M -16 0 Q -8 -10 0 0 T 16 0" fill="none" stroke="${RS.heat}" stroke-width="6" stroke-linecap="round"/>`, { x: FX + Math.cos(a2 + 0.35) * (d + 16), y: FY + Math.sin(a2 + 0.35) * (d + 16) * 0.8, r: a2 * 57.3, o: Math.min(1, p * 5) * (1 - p) * prog(t, c2 + 2.6, 0.5) });
        }
        z += pop(badge('みずが じょうはつ', { fill: RS.rain, size: 38 }), t, c2 + 1.0, FX - 170, 330);
        z += pop(badge('ねつが うばわれる', { fill: RS.warmDk, size: 38 }), t, c2 + 2.8, FX + 110, 650);
        z += pop(badge('ゆきが とけにくい', { fill: RS.coldDk, size: 46, pad: 36 }), t, c2 + 4.6, FX, 762);
        a += g(z, { o: zoom });
      }
      out += g(a, { o: aO });
    }
    // プールから上がると、ひんやり
    const bO = prog(t, c3 - 0.2, 0.5);
    if (bO > 0) {
      let b = sunDisc(1700, 190, 70, 0.1);
      b += `<rect x="120" y="610" width="820" height="210" rx="22" fill="#e9e2d2"/><rect x="150" y="640" width="760" height="180" rx="12" fill="#6fc0ee"/>`;
      for (let k = 0; k < 3; k++) b += `<path d="M 170 ${680 + k * 44} ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `q 22 ${-10 + Math.sin(t * 2 + k + i) * 4} 45 0 t 45 0`).join(' ')}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
      b += `<path d="M 850 660 L 850 560 Q 850 530 880 530 M 900 660 L 900 560 Q 900 530 930 530 M 850 600 L 900 600 M 850 640 L 900 640" fill="none" stroke="#9aa5ad" stroke-width="10" stroke-linecap="round"/>`;
      b += pop(badge('プールから あがると…', { fill: C.blueUi, size: 46 }), t, c3 + 0.3, 560, 250);
      out += g(b, { o: bO });
      const KX = 1180, KY = 830, sh = Math.sin(t * 30) * 3 * prog(t, c3 + 2.2, 0.4);
      out += g(kidShow('B', t, KX + sh, KY, { s: 0.75, start: c3, n: 0, enter: 'pop', pose: 'shrug', eyes: 'wide', mouth: 'o', bubble: false }), { o: bO });
      let w = '';
      // 体についた水が蒸発していく
      [[-84, -180], [72, -228], [-48, -72], [90, -108], [-12, -300], [44, -24]].forEach(([dx, dy], i) => {
        const p = (t * 0.4 + i * 0.29) % 1;
        w += rdrop(KX + dx, KY + dy, 0.6, (1 - prog(t, c3 + 4.6, 1.0) * 0.5));
        w += `<circle cx="${KX + dx + Math.sin(t * 2 + i) * 8}" cy="${KY + dy - 30 - p * 150}" r="7" fill="#fff" stroke="${RS.iceEdge}" stroke-width="3" opacity="${(1 - p) * Math.min(1, p * 5) * prog(t, c3 + 1.4, 0.5)}"/>`;
      });
      w += pop(badge('ひんやり', { fill: RS.coldDk, size: 56, pad: 40 }), t, c3 + 2.2, 1500, 430);
      w += pop(flake(-190, 0, 44, { rot: t * 20 }) + badge('ゆきも おなじ', { fill: C.ink, size: 42 }), t, c3 + 4.2, 1580, 640);
      out += g(w, { o: bO });
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
      const CX = 960, CY = 330, NX = -330;
      let a = pop(card(860, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, 'こおりの つぶや、ゆき', { size: 50, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['そらの うえは さむい', RS.coldDk], ['こおりの つぶや ゆきが できる', C.blueUi], ['とちゅうで とけると あめ', RS.rain]], t, 960, 600, { start: 2.6, step: 1.2, size: 38, gap: 30 });
      a += pop(flake(-150, 0, 50, { rot: t * 14 }) + arrow2(-70, 0, 70, 0, C.muted, 12) + rdrop(150, 0, 2.2), t, 6.4, 960, 740);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const clock = `<circle r="26" fill="#fff" stroke="${C.ink}" stroke-width="6"/><path d="M 0 -14 L 0 0 L 12 8" fill="none" stroke="${C.red}" stroke-width="6" stroke-linecap="round"/>`;
      const items = [
        [g(eyeIcon(0.3)), 'あめ・ゆき・みぞれの ひに、まどの そとを', C.ink, cue(1)],
        [clock, 'どれが いちばん ゆっくり おちる？', C.ink, cue(2)],
        [text(0, 2, '？', { size: 52, w: 900, fill: C.ochre }), 'よそうしてから、くらべて みよう', C.ink, cue(2) + 4.4],
        [rdrop(0, 0, 1.1), 'じめんや まどに ついた あとの かたちも', C.ink, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'みる ときは、まどの なかから', C.red, cue(4)],
        [g(warnIcon, { s: 0.62 }), 'みを のりださない・こおった みちに でない', C.red, cue(4) + 3.0],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: 38, w: 900, anchor: 'start', fill: col }), t, st, 150, 300 + i * 96); });
      // 窓（部屋の中から見る）
      const mO = prog(t, cue(1) + 0.5, 0.5);
      if (mO > 0) {
        const WX = 1180, WY = 200, WW = 620, WH = 560;
        const ph = t < cue(2) ? 0 : t < cue(3) ? 1 : 2, sw = k => (ph === k ? prog(t, [cue(1), cue(2), cue(3)][k], 0.5) : 0);
        let m = `<rect x="${WX - 40}" y="${WY - 40}" width="${WW + 80}" height="${WH + 80}" rx="20" fill="#f1e6cf"/>`;
        m += `<clipPath id="wn"><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}"/></clipPath><g clip-path="url(#wn)"><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" fill="#d3dfe9"/>`;
        m += puff(WX + 300, WY + 110, 1.1, { id: 'wc' });
        m += `<rect x="${WX}" y="${WY + WH - 90}" width="${WW}" height="90" fill="${ph === 1 ? RS.snowG : '#b8c7b0'}"/>` + houseS(WX + 470, WY + WH - 80, 0.8, ph === 1 ? 1 : 0);
        m += rainLines(WX + 20, WX + WW - 20, WY + 170, WY + WH - 60, t, { n: 20, o: sw(0), seed: 51 });
        m += snowFall(WX + 30, WX + WW - 30, WY + 170, WY + WH - 50, t, { n: 16, o: sw(1), seed: 52, r: 16 });
        m += rainLines(WX + 20, WX + WW - 20, WY + 170, WY + WH - 60, t, { n: 10, o: sw(2), seed: 53 }) + snowFall(WX + 30, WX + WW - 30, WY + 170, WY + WH - 50, t, { n: 8, o: sw(2), seed: 54, r: 14 });
        m += `</g><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" fill="none" stroke="#b98a5a" stroke-width="22"/><line x1="${WX + WW / 2}" y1="${WY}" x2="${WX + WW / 2}" y2="${WY + WH}" stroke="#b98a5a" stroke-width="16"/>`;
        m += `<rect x="${WX - 60}" y="${WY + WH + 8}" width="${WW + 120}" height="28" rx="10" fill="#a87a4c"/>`;
        m += g(badge(['あめ', 'ゆき', 'みぞれ'][ph], { fill: [RS.rain, RS.coldDk, '#5f7f96'][ph], size: 44 }), { x: WX + WW / 2, y: WY + 6, o: sw(ph) });
        b += g(m, { o: mO });
      }
      b += kidShow('K', t, 1100, 830, { s: 0.42, start: cue(1) + 0.8, n: 1, enter: 'pop', bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「あめと ゆき」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

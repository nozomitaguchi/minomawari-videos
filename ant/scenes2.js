// みのまわり図鑑 動画「アリは、どうして同じ道にならんで歩けるの？」（アリ）
// 出どころ：everyday-trivia trivia/ant-trail-pheromone.md

// ---------- アリの道具 ----------
const AN = {
  ground: '#eadcbd', groundDk: '#d6c59f', pebble: '#cdbb95', grass: '#8fbf6a', grassDk: '#6fa551',
  body: '#3a2f2a', bodyLt: '#5d4c42', smell: '#8f5fc8', smellDk: '#6d3fb0', food: '#f2c46a', foodDk: '#c98f3a', choco: '#7a4a2a',
  nest: '#5a4636', nestDk: '#33271e', sky: '#e7f1f5',
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
// 指し線つきのラベル（ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const clockIcon = (r, k = 0) => `<circle r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="${r * 0.13}"/><line x1="0" y1="0" x2="0" y2="${-r * 0.5}" stroke="${C.ink}" stroke-width="${r * 0.12}" stroke-linecap="round"/>` +
  `<line x1="0" y1="0" x2="${Math.sin(k * Math.PI * 2) * r * 0.7}" y2="${-Math.cos(k * Math.PI * 2) * r * 0.7}" stroke="${C.red}" stroke-width="${r * 0.1}" stroke-linecap="round"/><circle r="${r * 0.09}" fill="${C.ink}"/>`;
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));

// ---- 折れ線の道具 ----
const _plc = new WeakMap();
function polyL(P) { let L = _plc.get(P); if (!L) { L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); _plc.set(P, L); } return L; }
const polyLen = P => { const L = polyL(P); return L[L.length - 1]; };
function polyAt(P, k) {
  const L = polyL(P), d = clamp(k) * L[L.length - 1]; let i = 1; while (i < P.length - 1 && L[i] < d) i++;
  const u = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)];
}
// 道の上の場所と、進む向き（度）。rev: 逆むきに歩く。off: 道の横へずらす
function along(P, k, rev = false, off = 0) {
  const [x, y] = polyAt(P, k), e = 8 / polyLen(P);
  const [x1, y1] = polyAt(P, Math.max(0, k - e)), [x2, y2] = polyAt(P, Math.min(1, k + e));
  const a = Math.atan2(y2 - y1, x2 - x1);
  return [x - Math.sin(a) * off, y + Math.cos(a) * off, a * 180 / Math.PI + (rev ? 180 : 0)];
}
const bez = (a, b, c, d, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [0, 1].map(k => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k]); });

// ---- 上から見たアリ（頭は右むき。ang で進む向きに回す） ----
function antTop(x, y, s, ang, t, { carry = false, ph = 0, walk = 1, o = 1 } = {}) {
  if (o <= 0.01) return '';
  const w = Math.sin(t * 16 + ph) * 13 * walk;
  let b = '';
  [[-8, -1], [4, 1], [16, -1]].forEach(([lx, sg], i) => {
    [-1, 1].forEach(sd => {
      const sw = w * sg * sd, ex = lx + (i - 1) * 12 + sw;
      b += `<path d="M ${lx} ${sd * 5} L ${(lx + ex) / 2 - 2} ${sd * 19} L ${ex} ${sd * 31}" fill="none" stroke="${AN.body}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
  });
  const aw = Math.sin(t * 11 + ph * 2) * 6;
  b += `<path d="M 33 -6 L 47 ${-17 + aw} L 60 ${-11 + aw}" fill="none" stroke="${AN.body}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M 33 6 L 47 ${17 - aw} L 60 ${11 - aw}" fill="none" stroke="${AN.body}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  b += `<ellipse cx="-32" cy="0" rx="21" ry="15" fill="${AN.body}"/><ellipse cx="-36" cy="-4" rx="9" ry="5" fill="${AN.bodyLt}" opacity="0.7"/>`;
  b += `<ellipse cx="2" cy="0" rx="15" ry="9.5" fill="${AN.body}"/><circle cx="27" cy="0" r="11.5" fill="${AN.body}"/>`;
  if (carry) b += `<path d="M 36 -10 L 50 -13 L 58 -2 L 52 11 L 38 9 Z" fill="${AN.food}" stroke="${AN.foodDk}" stroke-width="3.5" stroke-linejoin="round"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${s})" opacity="${clamp(o)}">${b}</g>`;
}
// 道 P の上を歩くアリ
function antOn(P, k, t, { rev = false, off = 0, s = 0.62, carry = false, ph = 0, o = 1, walk = 1 } = {}) {
  const [x, y, a] = along(P, k, rev, off);
  return antTop(x, y, s, a, t, { carry, ph, o, walk });
}
// ---- 横から見たアリ（足もとが y、頭は右むき。flip で左むき） ----
//   antDown: 触角を地面のほうへ下げる 0〜1、dab: おなかの先を地面につける 0〜1
function antSide(x, y, s, t, { flip = false, walk = 1, antDown = 0, dab = 0, carry = false } = {}) {
  const w = Math.sin(t * 13) * 9 * walk;
  let b = '';
  [[-10, 1], [6, -1], [22, 1]].forEach(([lx, sg], i) => {
    const sw = w * sg;
    b += `<path d="M ${lx} -44 L ${lx - 12 + (i - 1) * 8 + sw * 0.5} -64 L ${lx - 6 + (i - 1) * 16 + sw} 0" fill="none" stroke="${AN.body}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  const th = lerp(6, -25, dab);
  b += `<g transform="rotate(${th} -26 -40)"><ellipse cx="-62" cy="-38" rx="38" ry="25" fill="${AN.body}"/><ellipse cx="-70" cy="-48" rx="18" ry="8" fill="${AN.bodyLt}" opacity="0.7"/></g>`;
  b += `<circle cx="-24" cy="-42" r="8" fill="${AN.body}"/><ellipse cx="6" cy="-46" rx="27" ry="16" fill="${AN.body}"/>`;
  b += `<circle cx="46" cy="-52" r="20" fill="${AN.body}"/><circle cx="54" cy="-57" r="5" fill="#fff"/><circle cx="55.5" cy="-57" r="2.4" fill="${AN.body}"/>`;
  const aw = Math.sin(t * 12) * (4 + 6 * antDown);
  const tipx = 92 + 6 * antDown, tipy = lerp(-78, -16, antDown) + aw;
  b += `<path d="M 56 -68 L 76 -84 L ${tipx} ${tipy}" fill="none" stroke="${AN.body}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  b += `<path d="M 52 -70 L 68 -90 L ${tipx - 16} ${tipy - 8 - aw * 2}" fill="none" stroke="${AN.bodyLt}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (carry) b += `<path d="M 62 -52 L 80 -58 L 92 -44 L 84 -28 L 66 -32 Z" fill="${AN.food}" stroke="${AN.foodDk}" stroke-width="4" stroke-linejoin="round"/>`;
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${b}</g>`;
}
// においのしるし（むらさきの波）と、地面についたにおいのつぶ
const smellWave = (x, y, s = 1, o = 1) => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M -14 0 Q -7 -11 0 0 T 14 0" fill="none" stroke="${AN.smell}" stroke-width="5" stroke-linecap="round" opacity="${clamp(o)}"/>`;
const smellDrop = (x, y, r = 9, o = 1) => o <= 0.01 ? '' : `<ellipse cx="${x}" cy="${y}" rx="${r * 1.5}" ry="${r * 0.6}" fill="${AN.smell}" opacity="${clamp(o)}"/>`;
// においの道（P の k0〜k1。上から見た絵）。本当は目に見えない
function trailPath(P, k0, k1, o = 1, w = 12) {
  if (o <= 0.01 || k1 - k0 < 0.004) return '';
  const n = Math.max(2, Math.ceil((k1 - k0) * 70)), pts = [];
  for (let i = 0; i <= n; i++) pts.push(polyAt(P, lerp(k0, k1, i / n)).map(v => v.toFixed(1)).join(','));
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${AN.smell}" stroke-width="${w * 2.4}" stroke-linecap="round" stroke-linejoin="round" opacity="${0.17 * o}"/>` +
    `<polyline points="${pts.join(' ')}" fill="none" stroke="${AN.smell}" stroke-width="${w * 0.75}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 ${w * 1.9}" opacity="${0.9 * o}"/>`;
}
// 地面（上から見た絵）
function groundBg() {
  let o = `<rect width="1920" height="1080" fill="${AN.ground}"/>`;
  for (let i = 0; i < 26; i++) { const x = rnd(i, 11) * 1920, y = rnd(i, 12) * 1080, r = 6 + rnd(i, 13) * 12; o += `<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r}" fill="${i % 3 ? AN.pebble : AN.groundDk}" opacity="0.7"/>`; }
  for (let i = 0; i < 9; i++) { const x = rnd(i, 21) * 1920, y = i % 2 ? 40 + rnd(i, 22) * 120 : 900 + rnd(i, 22) * 150; o += `<path transform="translate(${x} ${y})" d="M -22 12 Q -20 -14 -30 -30 M -8 12 Q -4 -22 -6 -44 M 6 12 Q 8 -18 18 -38 M 20 12 Q 24 -8 36 -22" fill="none" stroke="${i % 2 ? AN.grass : AN.grassDk}" stroke-width="7" stroke-linecap="round"/>`; }
  return o;
}
// 巣の入り口（上から）と、エサ（クッキーのかけら）
const nestTop = (x, y, s = 1) => {
  let b = `<ellipse rx="96" ry="70" fill="${AN.groundDk}"/>`;
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = 62 + rnd(i, 31) * 26; b += `<circle cx="${Math.cos(a) * r * 1.3}" cy="${Math.sin(a) * r * 0.95}" r="${5 + rnd(i, 32) * 5}" fill="${i % 2 ? '#c4b08a' : '#bda77d'}"/>`; }
  return g(b + `<ellipse rx="42" ry="30" fill="${AN.nest}"/><ellipse cx="-5" cy="-5" rx="28" ry="18" fill="${AN.nestDk}"/>`, { x, y, s });
};
const foodTop = (x, y, s = 1) => s <= 0.03 ? '' : g(`<path d="M -54 -16 L -22 -52 L 30 -48 L 58 -8 L 42 40 L -8 54 L -50 28 Z" fill="${AN.food}" stroke="${AN.foodDk}" stroke-width="7" stroke-linejoin="round"/>` +
  [[-18, -18, 9], [20, -12, 8], [-4, 22, 9], [26, 22, 6], [-30, 12, 6]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${AN.choco}"/>`).join(''), { x, y, s });
const placeTag = (x, y, str, o = 1, col = C.ink) => g(badge(str, { fill: col, size: 34, pad: 26 }), { x, y, o });

// ---- 巣・エサ・道（つかみ〜さえぎる実験まで） ----
const NEST = [270, 600], FOOD = [1620, 330];
const PATH = bez(NEST, [640, 380], [1150, 640], FOOD, 70);
const K0 = 0.045, K1 = 0.962;   // 巣の入り口・エサのふち
// はじめのアリが エサをさがして歩く、くねくねの道
const SCOUT = [...bez(NEST, [420, 800], [640, 240], [880, 470], 34), ...bez([880, 470], [1090, 670], [1330, 170], [1596, 368], 34).slice(1)];
// 巣とエサを行き来するアリ。tau: 巣を出てからの秒、v: 1秒に進む割合
function shuttle(tau, v) {
  if (tau < 0) return null; const T = (K1 - K0) / v;
  if (tau < T) return { k: K0 + tau * v, back: false };
  if (tau < T + 0.7) return { k: K1, back: tau > T + 0.35 };
  const k = K1 - (tau - T - 0.7) * v; return k < K0 ? null : { k, back: true };
}
function shuttleAnt(tau, v, t, i, { s = 0.62, off = 13 } = {}) {
  const sh = shuttle(tau, v); if (!sh) return '';
  const o = Math.min(1, (sh.k - K0) * 40 + 0.05);
  return antOn(PATH, sh.k, t, { rev: sh.back, off: sh.back ? -off : off, carry: sh.back, ph: i * 1.7, s, o });
}
// ずっと行き来している行列（n ひき）
function parade(t, n, v, opt = {}) { const per = 2 * (K1 - K0) / v + 0.7; let o = ''; for (let i = 0; i < n; i++) o += shuttleAnt((t + i * per / n) % per, v, t, i, opt); return o; }
// 説明用の丸い のぞき窓（横から見た絵）
function inset(cx, cy, R, inner, o = 1, id = 'ins') {
  if (o <= 0.01) return '';
  const gy = cy + R * 0.42;
  return g(`<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath><g clip-path="url(#${id})"><rect x="${cx - R}" y="${cy - R}" width="${R * 2}" height="${R * 2}" fill="${AN.sky}"/><rect x="${cx - R}" y="${gy}" width="${R * 2}" height="${R}" fill="${AN.ground}"/><rect x="${cx - R}" y="${gy}" width="${R * 2}" height="7" fill="${AN.groundDk}"/>${inner(gy)}</g>` +
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="12"/>`, { o });
}

// 1. つかみ：アリが1本の線のようにならんで歩く。地面に線はないのに
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c2 = cue(2), c3 = cue(3);
    let out = groundBg() + nestTop(NEST[0], NEST[1]) + foodTop(FOOD[0], FOOD[1]);
    out += parade(t + 30, 12, 0.075);
    out += pop(placeTag(0, 0, 'す'), t, c0 + 1.4, NEST[0], NEST[1] + 112) + pop(placeTag(0, 0, 'エサ'), t, c0 + 2.2, FOOD[0], FOOD[1] - 100);
    out += pop(badge('じめんに せんは ないのに…', { fill: C.ink, size: 46 }), t, c2 + 0.4, 900, 190, { end: c3 - 0.2 });
    out += kidShow('B', t, 1780, 846, { s: 0.5, start: 0.3, n: 0, side: 'left', size: 42 });
    out += g(text(0, 0, '？', { size: 180, w: 900, fill: C.ochre, extra: `stroke="${AN.ground}" stroke-width="18" paint-order="stroke"` }), { x: 900, y: 240, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">アリは どうして</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${AN.smellDk}">おなじ みち</tspan>を あるけるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      let row = ''; for (let i = 0; i < 5; i++) row += antTop(-300 + i * 130, 0, 0.9, 0, t, { ph: i * 1.3, carry: i === 4 });
      out += pop(row + text(400, -6, '？', { size: 100, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'アリが おなじ みちを あるけるのは、どうして？', { size: 60, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'まえの アリを、めで みて、ついて いくから'], ['②', 'じめんに ついた、においを、たどって いるから'], ['③', 'せんとうの アリが、おとで、みちを しらせるから']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 42)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(antTop(-40, 30, 1.5, -24, t, { walk: 0.4 }) + text(110, -60, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1680, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. エサを見つけた働きアリが、巣へ帰る道で においをつける（道しるべフェロモン）
const INS = { x: 400, y: 330, R: 190 };
SCENES.push({
  id: 'find',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = groundBg() + nestTop(NEST[0], NEST[1]) + foodTop(FOOD[0], FOOD[1]) + topBadge();
    out += placeTag(NEST[0], NEST[1] + 112, 'す') + placeTag(FOOD[0], FOOD[1] - 100, 'エサ');
    // 帰り道：道に においがつく
    const tr0 = c1 + 0.7, tr1 = c3 + 2.8, kr = lerp(K1, 0.13, prog(t, tr0, tr1 - tr0));
    out += trailPath(PATH, kr, K1, 1, 12 + 3 * Math.sin(t * 5) * prog(t, c3 + 0.6, 0.4));
    // はじめのアリ：くねくね さがして、エサを見つける
    const ks = prog(t, c0 + 0.2, cueE(0) - c0);
    if (t < tr0) {
      const [sx, sy, sa] = along(SCOUT, Math.max(0.03, ks)), [, , ra] = along(PATH, K1, true);
      const turn = eo(prog(t, tr0 - 0.6, 0.5)), ang = sa + (((ra - sa + 540) % 360) - 180) * turn;
      out += antTop(sx, sy, 0.7, ang, t, { walk: ks < 1 ? 1 : 0.25, carry: t > cueE(0) + 0.5, o: prog(t, c0, 0.3) });
      out += tag(sx, sy - 34, sx, sy - 104, 'はたらきアリ', win(t, c0 + 0.4, cueE(0) - 0.3, 0.3), { size: 34 });
    } else out += antOn(PATH, kr, t, { rev: true, carry: true, s: 0.7, walk: kr > 0.131 ? 1 : 0.2 });
    out += pop(badge('エサ みつけた！', { fill: AN.foodDk, size: 42 }), t, cueE(0) + 0.1, 1560, 520, { end: c1 + 2.2 });
    out += pop(badge('すへ かえる みちで、においを つける', { fill: AN.smellDk, size: 42 }), t, c1 + 1.4, 1210, 150);
    // のぞき窓：おなかの先から においが出て、地面につく（アリは左＝巣のほうへ歩いている）
    const iO = prog(t, c2 + 0.2, 0.4);
    out += inset(INS.x, INS.y, INS.R, gy => {
      const ax = INS.x - 60, tipX = ax + 89 * 1.45;
      let s = '';
      for (let i = 0; i < 4; i++) { const p = (t * 0.55 + i / 4) % 1; s += smellDrop(tipX + 6 + p * 150, gy + 16, 9, 1); }
      s += antSide(ax, gy + 12, 1.45, t, { flip: true, dab: 0.86 + 0.14 * Math.sin(t * 7), carry: true });
      return s;
    }, iO);
    out += callout(INS.x + 69, INS.y + 80, 650, 410, 'おなかの さき', prog(t, c2 + 1.4, 0.4), { col: AN.smellDk, size: 40 });
    out += pop(badge('みちしるべフェロモン', { fill: AN.smell, size: 58, pad: 46 }), t, c3 + 1.4, 1170, 262);
    return out;
  },
});

// 4. 仲間が、のぼってくる においを触角でかぎとって、道をたどる → 行列に見える
SCENES.push({
  id: 'follow',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = groundBg() + nestTop(NEST[0], NEST[1]) + foodTop(FOOD[0], FOOD[1]) + topBadge();
    out += placeTag(NEST[0], NEST[1] + 112, 'す') + placeTag(FOOD[0], FOOD[1] - 100, 'エサ');
    out += trailPath(PATH, K0, K1, 1, 12);
    // のぼっていく におい
    const wO = win(t, c0 + 0.5, c1 + 1.6, 0.4);
    for (let i = 0; i < 9; i++) { const p = (t * 0.45 + i * 0.37) % 1, [x, y] = polyAt(PATH, 0.12 + i * 0.095); out += smellWave(x + Math.sin(p * 5 + i) * 6, y - 16 - p * 56, 1.1, wO * (1 - p) * Math.min(1, p * 5)); }
    // 仲間のアリ
    const V = 0.105;
    for (let i = 0; i < 6; i++) out += shuttleAnt(t - (c1 + 0.9 + i * 1.25), V, t, i);
    for (let i = 0; i < 7; i++) out += shuttleAnt(t - (c3 + 0.1 + i * 0.75), V, t, i + 6);
    out += pop(badge('においは くうきの なかへ のぼる', { fill: AN.smellDk, size: 42 }), t, c0 + 0.8, 1210, 150, { end: c1 });
    out += pop(badge('なかまが においを たどる', { fill: AN.smellDk, size: 42 }), t, c1 + 0.6, 1210, 150, { end: c3 });
    out += pop(badge('みんな おなじ みち → ぎょうれつ', { fill: C.ink, size: 44 }), t, c3 + 0.9, 1210, 150);
    // のぞき窓：地面からのぼる においを、触角でかぎとる（アリは右＝エサのほうへ歩いている）
    out += inset(INS.x, INS.y, INS.R, gy => {
      let s = '';
      for (let i = 0; i < 6; i++) { const dx = ((i * 80 - t * 46) % 480 + 480) % 480 - 240; s += smellDrop(INS.x + dx, gy + 16, 9, 1); for (let k = 0; k < 2; k++) { const p = (t * 0.6 + i * 0.3 + k * 0.5) % 1; s += smellWave(INS.x + dx, gy + 4 - p * 74, 0.9, (1 - p) * Math.min(1, p * 5)); } }
      const aO = prog(t, c1 + 0.5, 0.5);
      if (aO > 0) s += g(antSide(INS.x - 50 - (1 - eo(aO)) * 260, gy + 12, 1.35, t, { antDown: 1 }), { o: aO });
      return s;
    }, prog(t, c0 + 0.3, 0.4), 'ins2');
    out += callout(INS.x + 82, INS.y + 66, 650, 410, 'しょっかく', prog(t, c1 + 2.2, 0.4), { col: C.ink, size: 40 });
    out += kidShow('S', t, 1790, 846, { s: 0.42, start: c2 - 0.9, n: 0, side: 'left', size: 42 });
    return out;
  },
});

// 5. 行列を紙でさえぎると：迷う・引き返す・新しい回り道
const PAPER = (() => { const [x, y] = polyAt(PATH, 0.5); return { x, y, w: 230, h: 320, r: 14 }; })();
const PLOC = (lx, ly) => { const a = PAPER.r * Math.PI / 180; return [PAPER.x + lx * Math.cos(a) - ly * Math.sin(a), PAPER.y + lx * Math.sin(a) + ly * Math.cos(a)]; };
const cutPath = (k0, k1, n = 30) => Array.from({ length: n + 1 }, (_, i) => polyAt(PATH, lerp(k0, k1, i / n)));
const KSTOP = 0.405, KJOIN = 0.6;
// まよう：紙の手前で ぐるぐる
const P_LOST = (() => { const P = cutPath(K0, KSTOP), [ex, ey] = P[P.length - 1], cx = ex - 6, cy = ey - 46; for (let i = 1; i <= 90; i++) { const a = Math.PI / 2 + i / 90 * Math.PI * 10; P.push([cx + Math.cos(a) * 40, cy + Math.sin(a) * 40]); } return P; })();
// ひきかえす：くるっと回って、巣へもどる
const P_BACK = (() => {
  const P = cutPath(K0, KSTOP), [, , a0] = along(PATH, KSTOP), a = a0 * Math.PI / 180, [ex, ey] = P[P.length - 1], R = 30;
  const cx = ex - Math.sin(a) * R, cy = ey + Math.cos(a) * R;
  for (let i = 1; i <= 12; i++) { const b = a - Math.PI / 2 + i / 12 * Math.PI; P.push([cx + Math.cos(b) * R, cy + Math.sin(b) * R]); }
  for (let i = 1; i <= 30; i++) { const k = lerp(KSTOP, K0, i / 30), off = 2 * R * (1 - clamp(i / 12)); const [x, y] = along(PATH, k, false, off); P.push([x, y]); }
  return P;
})();
// まわりみち：紙の下がわを回って、むこうの道へ
const P_DETOUR = (() => { const A = polyAt(PATH, 0.385), B = polyAt(PATH, KJOIN + 0.02); return [...cutPath(K0, 0.385), ...bez(A, PLOC(-250, 250), PLOC(150, 420), B, 40).slice(1), ...cutPath(KJOIN + 0.02, K1).slice(1)]; })();
SCENES.push({
  id: 'test',
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = groundBg() + nestTop(NEST[0], NEST[1]) + foodTop(FOOD[0], FOOD[1]) + topBadge();
    out += placeTag(NEST[0], NEST[1] + 112, 'す') + placeTag(FOOD[0], FOOD[1] - 100, 'エサ');
    out += trailPath(PATH, K0, K1, 1, 13);
    const V = 125, D0 = polyLen(PATH) * KSTOP, drop = c0 + 1.8;
    const dist = ti => D0 - polyLen(PATH) * K0 + V * (t - ti);
    // 新しい回り道（アリが歩いた道すじ。においの しるしではない）
    const dC = dist(c1 + 2.6), LD = polyLen(P_DETOUR), kC = clamp(dC / LD);
    const kd0 = polyLen(cutPath(K0, 0.385)) / LD, kd1 = Math.min(kC, 1 - polyLen(cutPath(KJOIN + 0.02, K1)) / LD);
    if (kd1 - kd0 > 0.004) { const pts = []; for (let i = 0; i <= 40; i++) pts.push(polyAt(P_DETOUR, lerp(kd0, kd1, i / 40)).map(v => v.toFixed(1)).join(',')); out += `<polyline points="${pts.join(' ')}" fill="none" stroke="${C.accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="16 14" opacity="0.9"/>`; }
    // 紙のむこうにいたアリは、そのままエサへ
    for (let i = 0; i < 5; i++) { const k = 0.44 + i * 0.11 + t * 0.086; if (k < K1) out += antOn(PATH, k, t, { off: 13, ph: i * 2 }); }
    // 紙
    const pk = prog(t, drop, 0.5), py = (1 - eo(pk)) * -520;
    if (pk > 0) out += `<g transform="translate(${PAPER.x} ${PAPER.y + py}) rotate(${PAPER.r + (1 - eo(pk)) * 10})" opacity="${Math.min(1, pk * 4)}"><rect x="${-PAPER.w / 2}" y="${-PAPER.h / 2}" width="${PAPER.w}" height="${PAPER.h}" rx="6" fill="#fff" filter="url(#shadow)"/><rect x="${-PAPER.w / 2}" y="${-PAPER.h / 2}" width="${PAPER.w}" height="${PAPER.h}" rx="6" fill="none" stroke="${C.line}" stroke-width="4"/>${text(0, 0, 'かみ', { size: 54, w: 900, fill: C.muted })}</g>`;
    // 3びきのアリ
    const one = (P, ti, i, stopAt = 9) => { const d = dist(ti), k = d / polyLen(P); if (d < 4 || k >= stopAt) return ''; const [x, y, a] = along(P, clamp(k)); return antTop(x, y, 0.62, a, t, { ph: i * 2.1, o: Math.min(1, d / 30) }); };
    out += one(P_LOST, c1 + 0.5, 0) + one(P_BACK, c1 + 1.5, 1, 0.985) + one(P_DETOUR, c1 + 2.6, 2, (LD - 20) / LD);
    out += pop(badge('ぎょうれつを かみで さえぎると…', { fill: C.ink, size: 44 }), t, c0 + 0.6, 1100, 150);
    const [lx, ly] = polyAt(PATH, KSTOP);
    out += tag(lx - 6, ly - 94, 560, 250, 'まよう', prog(t, c1 + 1.2, 0.3), { col: C.redUi, size: 42 });
    { // ひきかえすアリを 指しつづける
      const kb = clamp(dist(c1 + 1.5) / polyLen(P_BACK), 0, 0.97), [bx, by] = polyAt(P_BACK, kb);
      out += tag(bx, by + 30, 420, 800, 'ひきかえす', prog(t, c1 + 2.6, 0.3), { col: C.ochre, size: 42 }); }
    { const [dx, dy] = polyAt(P_DETOUR, kd0 + 0.14); out += tag(dx + 10, dy + 14, 1250, 800, 'あたらしい まわりみち', prog(t, c1 + 4.4, 0.3), { col: C.accent, size: 42 }); }
    return out;
  },
});

// ---- まっすぐな道（におい が消える・重ねる・エサがなくなる） ----
const LY = 470, LX0 = 350, LX1 = 1570, LNEST = [240, LY], LFOOD = [1680, LY], TAU = 400 / 55;
// x の所の においの強さ。passes: そこを通った時刻を返す関数たち
function laneTrail(t, passes, scale = 1) {
  let o = '';
  for (let x = LX0 + 6; x <= LX1; x += 15) {
    let sum = 0; passes.forEach(f => { const age = t - f(x); if (age >= 0) sum += Math.max(0, 1 - age / TAU); });
    sum *= scale; if (sum <= 0.02) continue;
    const m = Math.min(sum, 2.6);
    o += `<circle cx="${x}" cy="${LY}" r="${12 + 7 * m}" fill="${AN.smell}" opacity="${0.12 * Math.min(1, sum)}"/><circle cx="${x}" cy="${LY}" r="${3.5 + 2.6 * m}" fill="${AN.smell}" opacity="${Math.min(1, 0.25 + sum * 0.8)}"/>`;
  }
  return o;
}
const laneBase = () => groundBg() + nestTop(LNEST[0], LNEST[1]) + placeTag(LNEST[0], LNEST[1] + 112, 'す');

// 6. においは2分ほどでうすくなる（ヒアリ）。進めるのは40cmほど。重ねるから行列がつづく
SCENES.push({
  id: 'fade',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), c5 = cue(5);
    let out = laneBase() + foodTop(LFOOD[0], LFOOD[1]) + placeTag(LFOOD[0], LFOOD[1] - 100, 'エサ') + topBadge();
    const V0 = 55, T0 = c0 + 0.2, V2 = 150, x0 = LX1 - V0 * (t - T0);
    const passes = [x => T0 + (LX1 - x) / V0];
    const car = []; for (let j = 0; j < 14; j++) { const Tj = c4 + 0.5 + 1.35 * j; car.push(Tj); passes.push(x => Tj + (LX1 - x) / V2); }
    out += laneTrail(t, passes);
    // はじめの1ぴき（巣のほうへ）
    if (x0 > LX0) out += antTop(x0, LY - 2, 0.7, 180, t, { carry: true, o: Math.min(1, (x0 - LX0) / 40, prog(t, T0 - 0.2, 0.3)) });
    // 2分ほどでうすくなる
    const kO = win(t, c1 + 0.6, c3 - 0.2, 0.35);
    out += g(g(clockIcon(56, (t - c1) * 0.9), { x: 720, y: 240 }) + text(810, 222, '2ふんほどで、わからないほど うすく なる', { size: 42, w: 900, anchor: 'start' }) + text(812, 282, 'ヒアリという アリで しらべた', { size: 30, w: 700, fill: C.muted, anchor: 'start' }), { o: kO });
    // 40センチほど
    const rO = win(t, c2 + 0.5, c3 - 0.2, 0.35);
    if (rO > 0 && x0 > LX0) {
      const a = x0 + 30, b = Math.min(x0 + 30 + 400, LX1 + 40), y = LY + 86;
      out += g(`<path d="M ${a} ${y - 22} L ${a} ${y} L ${b} ${y} L ${b} ${y - 22}" fill="none" stroke="${C.red}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` + g(badge('40センチ ほど', { fill: C.red, size: 44 }), { x: (a + b) / 2, y: y + 58 }), { o: rO });
    }
    // それなのに、どうして つづく？
    out += pop(badge('それなのに、どうして つづくの？', { fill: C.ink, size: 46 }), t, c3 + 0.3, 1060, 170, { end: c4 - 0.1 });
    out += g(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre, extra: `stroke="${AN.ground}" stroke-width="16" paint-order="stroke"` }), { x: 1060, y: 300, o: win(t, c3 + 0.8, c4 - 0.1, 0.3) });
    // エサを持って帰る仲間が、つぎつぎに重ねる
    car.forEach((Tj, j) => { const x = LX1 - V2 * (t - Tj); if (t > Tj && x > LX0) out += antTop(x, LY - 15, 0.62, 180, t, { carry: true, ph: j * 1.9, o: Math.min(1, (x - LX0) / 40, (LX1 - x) / 30 + 0.1) }); });
    out += pop(badge('つぎつぎに においを かさねる', { fill: AN.smellDk, size: 46 }), t, c4 + 1.2, 1060, 170, { end: c5 });
    // こくなると、もっと仲間が集まる（巣から出てくる）
    for (let i = 0; i < 12; i++) { const Si = c5 + 0.5 + 0.62 * i, x = LX0 + 165 * (t - Si); if (t > Si && x < LX1) out += antTop(x, LY + 17, 0.62, 0, t, { ph: i * 2.3, o: Math.min(1, (x - LX0) / 40 + 0.1, (LX1 - x) / 30) }); }
    out += chipsRow([['においが こくなる', AN.smellDk], ['なかまが もっと あつまる', C.ink]], t, 1060, 170, { start: c5 + 0.6, step: 2.2, size: 44, gap: 30 });
    return out;
  },
});

// 7. エサがへると、においをつけて帰るアリもへって、道は消える
SCENES.push({
  id: 'gone',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    let out = laneBase() + topBadge();
    const fs = 1 - eo(prog(t, c0 + 0.8, 3.4));
    out += foodTop(LFOOD[0], LFOOD[1], fs);
    const eO = prog(t, c0 + 4.4, 0.4);
    out += `<circle cx="${LFOOD[0]}" cy="${LFOOD[1]}" r="62" fill="none" stroke="${C.muted}" stroke-width="6" stroke-dasharray="14 12" opacity="${eO}"/>`;
    out += g(placeTag(0, 0, 'エサ'), { x: LFOOD[0], y: LFOOD[1] - 100, o: 1 - eO }) + g(placeTag(0, 0, 'エサ なし', 1, C.muted), { x: LFOOD[0] - 10, y: LFOOD[1] - 100, o: eO });
    // においの道：エサを持って帰るアリがいなくなると、うすくなって消える
    const st = 1 - prog(t, c0 + 5.0, c1 + 3.2 - (c0 + 5.0));
    if (st > 0.01) for (let x = LX0 + 6; x <= LX1; x += 15) { const m = 2.6 * st; out += `<circle cx="${x}" cy="${LY}" r="${12 + 7 * m}" fill="${AN.smell}" opacity="${0.12 * Math.min(1, m)}"/><circle cx="${x}" cy="${LY}" r="${3.5 + 2.6 * m}" fill="${AN.smell}" opacity="${Math.min(1, 0.1 + m * 0.5)}"/>`; }
    // エサを持って帰るアリ（エサがあるうちだけ）
    for (let j = -6; j <= 1; j++) { const Tj = c0 + 1.35 * j, x = LX1 - 150 * (t - Tj); if (t > Tj && x > LX0 && x < LX1) out += antTop(x, LY - 15, 0.62, 180, t, { carry: true, ph: j * 1.9, o: Math.min(1, (x - LX0) / 40, (LX1 - x) / 30 + 0.1) }); }
    // 巣から来たアリ：エサがないので、手ぶらで帰る（においはつけない）
    for (let i = -5; i <= 2; i++) {
      const Si = c0 + 0.9 * i, tau = t - Si, T = (LX1 - LX0) / 230; if (tau < 0) continue;
      const carryBack = Si + T < c0 + 3.6;   // エサがあるうちに着いたアリは、持って帰る
      if (tau < T) out += antTop(LX0 + 230 * tau, LY + 17, 0.62, 0, t, { ph: i * 2.3, o: Math.min(1, tau * 230 / 40 + 0.1) });
      else if (tau < T + 0.9) { const u = eo(prog(tau, T + 0.3, 0.5)); out += antTop(LX1, lerp(LY + 17, LY - 15, u), 0.62, lerp(0, -180, u), t, { ph: i * 2.3, walk: 0.3, carry: carryBack && tau > T + 0.5 }); }
      else { const x = LX1 - 230 * (tau - T - 0.9); if (x > LX0) out += antTop(x, LY - 15, 0.62, 180, t, { ph: i * 2.3, carry: carryBack, o: Math.min(1, (x - LX0) / 40) }); }
    }
    out += pop(badge('エサが へると、においを つける アリも へる', { fill: C.ink, size: 42 }), t, c0 + 1.0, 1060, 170, { end: c1 });
    out += pop(badge('ふるい みちは のこらない', { fill: AN.smellDk, size: 46 }), t, c1 + 0.8, 1060, 170);
    out += pop(badge('エサの ない ばしょへ、まちがえて いかない', { fill: C.accent, size: 40 }), t, c1 + 4.4, 1060, 270);
    out += kidShow('K', t, 1760, 840, { s: 0.5, start: c2 - 0.9, n: 0, bubble: false });
    out += talkBubble('K', 1590, 646, 1806, 744, 46);   // しっぽの先は カメレオンの頭
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
        text(NX + 96, 2, 'じめんに ついた、においを、たどって いるから', { size: 46, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['かえりみちで においを つける', AN.smellDk], ['なかまが たどる', C.blueUi], ['かさねて ぎょうれつに', C.ink]], t, 960, 600, { start: 2.4, step: 1.1, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [g(eyeIcon(0.3)), 'ぎょうれつを みつけたら、そっと みる', C.ink, cue(1)],
        [qm, 'すへ むかう アリと、すから でて いく アリ', C.ink, cue(2)],
        [qm, 'エサを もって いるのは、どっちむき？', C.ink, cue(2) + 3.8],
        [antTop(0, 0, 0.42, 180, 0, { carry: true, walk: 0 }), 'においを つけるのは、すへ かえる アリ', AN.smellDk, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'みなれない アリは、てで さわらない', C.red, cue(4)],
        [g(warnIcon, { s: 0.62 }), 'ぎょうれつを ふまない・すを こわさない', C.red, cue(4) + 3.6],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: 38, w: 900, anchor: 'start', fill: col }), t, st, 150, 300 + i * 88); });
      // 巣へ向かうアリと、出ていくアリ
      const PX = 1500, PY = 520, x0 = PX - 220, x1 = PX + 250;
      let p = card(720, 420, { fill: AN.ground }) + nestTop(-275, 0, 0.62) + foodTop(285, 0, 0.6);
      p += g(placeTag(0, 0, 'す'), { x: -275, y: 86 }) + g(placeTag(0, 0, 'エサ'), { x: 280, y: 86 });
      for (let x = -200; x <= 230; x += 16) p += `<circle cx="${x}" cy="0" r="5.5" fill="${AN.smell}" opacity="0.85"/>`;
      for (let i = 0; i < 3; i++) { const u = (t * 0.07 + i / 3) % 1; p += antTop(lerp(230, -200, u), -34, 0.56, 180, t, { carry: true, ph: i * 2, o: Math.min(1, u * 9, (1 - u) * 9) }); }
      for (let i = 0; i < 3; i++) { const u = (t * 0.07 + i / 3 + 0.17) % 1; p += antTop(lerp(-200, 230, u), 36, 0.56, 0, t, { ph: i * 2 + 1, o: Math.min(1, u * 9, (1 - u) * 9) }); }
      const l1 = prog(t, cue(2) + 0.4, 0.3), l2 = prog(t, cue(2) + 1.8, 0.3);
      p += g(arrow2(120, -92, -120, -92, AN.smellDk, 9) + ctext(0, -134, 'すへ むかう', { size: 34, w: 900, fill: AN.smellDk }), { o: l1 });
      p += g(arrow2(-120, 96, 120, 96, C.blueUi, 9) + ctext(0, 140, 'すから でて いく', { size: 34, w: 900, fill: C.blueUi }), { o: l2 });
      b += pop(p, t, cue(1) + 0.4, PX, PY);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「アリ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

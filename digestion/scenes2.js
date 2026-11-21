// みのまわり図鑑 動画「食べたものは、どうやって うんちになるの？」（うんち）
// 出どころ：everyday-trivia trivia/digestion-to-poop.md, trivia/poop-basics.md

// ---------- うんちの道具 ----------
const DG = {
  skin: '#f6d6bd', skinShade: '#ecc0a2', hair: '#4b3226', cheek: '#f2a99a',
  tube: '#f3aea2', tubeDk: '#c96a62', inside: '#fbe3dc', stom: '#f0a094',
  large: '#e09a84', largeDk: '#b3654f',
  food: '#f6d98a', foodDk: '#c98f3a', mush: '#d9a65a', poop: '#9a6a3c', poopDk: '#7a4f28', poopLt: '#b98850',
  water: '#58b4e6', waterDk: '#2f86c4', nut: '#ff9d2e', juice: '#e3d24a', germ: '#8a5cc0', blood: '#d8463c', signal: '#f6b500',
  room: '#f3ead6', floor: '#e6d6b4',
};
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
const bez = (a, b, c, d, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [0, 1].map(k => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k]); });
// P の f0〜f1 の部分を、点の列（polyline 用の文字）にする
function subPts(P, f0, f1) {
  const n = Math.max(2, Math.ceil(polyLen(P) * (f1 - f0) / 5)), pts = [];
  for (let i = 0; i <= n; i++) pts.push(polyAt(P, lerp(f0, f1, i / n)).map(v => v.toFixed(1)).join(','));
  return pts.join(' ');
}

// ---- 食べものの小さな絵 ----
const onigiri = (s = 1) => g(`<path d="M 0 -54 Q 14 -54 24 -36 L 56 22 Q 66 46 40 48 L -40 48 Q -66 46 -56 22 L -24 -36 Q -14 -54 0 -54 Z" fill="#fff" stroke="#d9cfba" stroke-width="5" stroke-linejoin="round"/><path d="M -26 10 L 26 10 L 26 48 L -26 48 Z" fill="#2f3a33"/>`, { s });
const riceBowl = (s = 1) => g(`<path d="M -58 -8 Q -44 -64 0 -64 Q 44 -64 58 -8 Z" fill="#fff" stroke="#d9cfba" stroke-width="4"/><path d="M -72 -10 L 72 -10 Q 66 44 30 52 L -30 52 Q -66 44 -72 -10 Z" fill="#e0715f"/><rect x="-28" y="50" width="56" height="11" rx="4" fill="#c25a4a"/><path d="M -72 -10 L 72 -10" stroke="#c25a4a" stroke-width="5" stroke-linecap="round"/>`, { s });
const poopIcon = (s = 1, face = true) => g(
  `<ellipse cx="0" cy="36" rx="64" ry="25" fill="${DG.poop}"/><ellipse cx="0" cy="8" rx="47" ry="23" fill="${DG.poop}"/><ellipse cx="0" cy="-18" rx="31" ry="19" fill="${DG.poop}"/><path d="M -16 -28 Q -6 -64 20 -58 Q 8 -48 16 -28 Z" fill="${DG.poop}"/>` +
  `<path d="M -40 30 Q -52 36 -44 44 M -28 2 Q -38 8 -32 14" fill="none" stroke="${DG.poopLt}" stroke-width="7" stroke-linecap="round"/>` +
  (face ? `<circle cx="-16" cy="6" r="6" fill="#3a2a22"/><circle cx="16" cy="6" r="6" fill="#3a2a22"/><path d="M -12 24 Q 0 36 12 24" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>` : ''), { s });
// トイレ（横から。便器は左むき）
const toiletIcon = (s = 1) => g(
  `<rect x="34" y="-176" width="74" height="126" rx="12" fill="#fff" stroke="${C.blueUi}" stroke-width="7"/><rect x="50" y="-190" width="42" height="16" rx="6" fill="${C.blueUi}"/>` +
  `<path d="M -92 -52 L 70 -52 Q 62 26 14 40 L 14 78 L -44 78 L -44 40 Q -98 22 -92 -52 Z" fill="#fff" stroke="${C.blueUi}" stroke-width="7" stroke-linejoin="round"/>` +
  `<rect x="-104" y="-68" width="182" height="20" rx="10" fill="#fff" stroke="${C.blueUi}" stroke-width="7"/><rect x="-56" y="76" width="82" height="14" rx="6" fill="${C.blueUi}"/>`, { s });
const sunIcon = (s = 1) => g(`<circle r="26" fill="${C.yellow}"/>` + [...Array(8)].map((_, i) => `<line x1="${Math.cos(i * 0.785) * 36}" y1="${Math.sin(i * 0.785) * 36}" x2="${Math.cos(i * 0.785) * 48}" y2="${Math.sin(i * 0.785) * 48}" stroke="${C.yellow}" stroke-width="8" stroke-linecap="round"/>`).join(''), { s });
const waterDrop = (x, y, s = 1, o = 1, col = DG.water) => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -22 C 10 -6 16 2 16 10 A 16 16 0 0 1 -16 10 C -16 2 -10 -6 0 -22 Z" fill="${col}" opacity="${clamp(o)}"/>`;

// ---- 体の絵（前から。口 → 食道 → 胃 → 小腸 → 大腸 → おしり） ----
//   わかりやすくした絵で、管の太さ・長さ・位置は 本物の比率ではない
const TR = (() => {
  const eso = bez([0, -262], [0, -220], [2, -160], [26, -116], 16);
  const sto = bez([26, -116], [112, -124], [124, -20], [22, -6], 20);
  const inn = bez([22, -6], [-10, 0], [-112, 20], [-74, 84], 16);
  const serp = []; { const x0 = -74, x1 = 74, y0 = 84, dy = 28, rows = 6, r = dy / 2;
    for (let i = 0; i < rows; i++) { const y = y0 + i * dy, l2r = i % 2 === 0, xs = l2r ? [x0, x1] : [x1, x0]; serp.push([xs[0], y], [xs[1], y]);
      if (i < rows - 1) for (let j = 1; j < 8; j++) { const a = -Math.PI / 2 + j / 8 * Math.PI; serp.push([xs[1] + (l2r ? 1 : -1) * Math.cos(a) * r, y + r + Math.sin(a) * r]); } } }
  const join = bez([-74, 224], [-100, 224], [-112, 252], [-140, 252], 8);
  const sm = [...inn, ...serp.slice(1), ...join.slice(1)];
  const arc = (cx, cy, r, a0, a1) => Array.from({ length: 9 }, (_, i) => { const a = lerp(a0, a1, i / 8); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const lg = [[-140, 252], [-140, 60], ...arc(-112, 60, 28, Math.PI, Math.PI * 1.5), [112, 32], ...arc(112, 60, 28, -Math.PI / 2, 0), [140, 232]];
  const sig = bez([140, 232], [140, 306], [40, 262], [0, 312], 14);
  const rec = [[0, 312], [0, 386]];
  const lgAll = [...lg, ...sig.slice(1)];
  const full = [...eso, ...sto.slice(1), ...sm.slice(1), ...lgAll.slice(1), ...rec.slice(1)];
  const T = polyLen(full), kE = polyLen(eso) / T, kS = kE + polyLen(sto) / T, kM = kS + polyLen(sm) / T, kR = kM + polyLen(lgAll) / T;
  return { eso, sto, sm, lg: lgAll, rec, full, kE, kS, kM, kR };
})();
const STOM_D = 'M 10 -128 C 40 -154 120 -150 132 -92 C 142 -42 104 -2 56 0 C 38 0 30 -10 16 8 L 0 -14 C 14 -28 30 -36 36 -58 C 40 -84 14 -100 10 -128 Z';
const markCol = k => k < TR.kE ? DG.food : k < TR.kS ? mix(DG.food, DG.mush, (k - TR.kE) / (TR.kS - TR.kE)) : k < TR.kM ? DG.mush : mix(DG.mush, DG.poop, clamp((k - TR.kM) / (TR.kR - TR.kM) * 1.3));
// reveal: 管を口から どこまで かくか（0〜1）。hi: 光らせる所 'mouth'|'eso'|'sto'|'sm'|'lg'|'rec'。mark: 食べものの場所（0〜1）。brain: 脳を見せる 0〜1
function bodyMap(t, { reveal = 1, hi = null, hiO = 1, mark = null, brain = 0, tract = 1, face = 'smile' } = {}) {
  let s = `<path d="M -62 -205 Q -200 -200 -214 -120 L -206 330 Q -200 402 -130 406 L 130 406 Q 200 402 206 330 L 214 -120 Q 200 -200 62 -205 Z" fill="${DG.skin}" stroke="${DG.skinShade}" stroke-width="7"/>`;
  s += `<rect x="-36" y="-222" width="72" height="40" fill="${DG.skin}"/>`;
  s += `<circle cx="-104" cy="-300" r="17" fill="${DG.skin}" stroke="${DG.skinShade}" stroke-width="5"/><circle cx="104" cy="-300" r="17" fill="${DG.skin}" stroke="${DG.skinShade}" stroke-width="5"/>`;
  s += `<circle cx="0" cy="-305" r="105" fill="${DG.skin}" stroke="${DG.skinShade}" stroke-width="7"/>`;
  s += `<path d="M -106 -310 A 106 106 0 0 1 106 -310 Q 96 -352 60 -356 Q 30 -340 0 -356 Q -30 -340 -60 -356 Q -96 -352 -106 -310 Z" fill="${DG.hair}"/>`;
  const blink = (t % 3.7) > 3.55;
  s += `<ellipse cx="-36" cy="-312" rx="8" ry="${blink ? 2 : 11}" fill="#3a2a22"/><ellipse cx="36" cy="-312" rx="8" ry="${blink ? 2 : 11}" fill="#3a2a22"/>`;
  s += `<circle cx="-62" cy="-282" r="13" fill="${DG.cheek}" opacity="0.6"/><circle cx="62" cy="-282" r="13" fill="${DG.cheek}" opacity="0.6"/>`;
  if (brain > 0) s += g(`<path d="M -58 -352 C -72 -392 -30 -412 -8 -396 C 10 -416 56 -404 58 -372 C 78 -356 62 -326 34 -330 C 14 -316 -16 -318 -28 -330 C -54 -324 -70 -338 -58 -352 Z" fill="#f7b3c0" stroke="#d9788c" stroke-width="5"/><path d="M -34 -366 Q -18 -382 -4 -366 M 6 -372 Q 24 -390 38 -368 M -22 -344 Q -6 -356 10 -344" fill="none" stroke="#d9788c" stroke-width="4" stroke-linecap="round"/>`, { o: brain });
  if (tract <= 0) return s + `<path d="M -16 -264 Q 0 -252 16 -264" fill="none" stroke="#3a2a22" stroke-width="6" stroke-linecap="round"/>`;
  const pulse = 0.55 + 0.3 * Math.sin(t * 6);
  const seg = (P, a, b, w, col, dk, key) => {
    const f = clamp((reveal - a) / (b - a)); if (f <= 0.001) return '';
    const pts = subPts(P, 0, f);
    return (hi === key ? `<polyline points="${pts}" fill="none" stroke="#ffd23a" stroke-width="${w + 26}" stroke-linecap="round" stroke-linejoin="round" opacity="${pulse * hiO}"/>` : '') +
      `<polyline points="${pts}" fill="none" stroke="${dk}" stroke-width="${w + 7}" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  let o = '';
  o += seg(TR.sm, TR.kS, TR.kM, 15, DG.tube, DG.tubeDk, 'sm');
  // 大腸 と 出口の手前（直腸）
  if (hi === 'rec') o += `<polyline points="${subPts(TR.rec, 0, 1)}" fill="none" stroke="#ffd23a" stroke-width="58" stroke-linecap="round" opacity="${pulse * hiO}"/>`;
  o += seg(TR.lg, TR.kM, TR.kR, 30, DG.large, DG.largeDk, 'lg') + seg(TR.rec, TR.kR, 1, 30, DG.large, DG.largeDk, 'x');
  // 胃
  const sO = clamp((reveal - TR.kE) / (TR.kS - TR.kE) * 2);
  if (sO > 0) o += g((hi === 'sto' ? `<path d="${STOM_D}" fill="none" stroke="#ffd23a" stroke-width="26" stroke-linejoin="round" opacity="${pulse * hiO}"/>` : '') + `<path d="${STOM_D}" fill="${DG.stom}" stroke="${DG.tubeDk}" stroke-width="6" stroke-linejoin="round"/>`, { o: sO });
  o += seg(TR.eso, 0, TR.kE, 13, DG.tube, DG.tubeDk, 'eso');
  // 口
  if (hi === 'mouth') o += `<circle cx="0" cy="-262" r="40" fill="#ffd23a" opacity="${pulse * hiO}"/>`;
  o += `<ellipse cx="0" cy="-262" rx="19" ry="13" fill="#8a3a32" stroke="${DG.tubeDk}" stroke-width="5"/>`;
  s += g(o, { o: tract });
  if (mark !== null && mark >= 0) { const [mx, my] = polyAt(TR.full, mark), c = markCol(mark); s += `<circle cx="${mx}" cy="${my}" r="19" fill="#fff" opacity="0.9"/><circle cx="${mx}" cy="${my}" r="13" fill="${c}" stroke="${mix(c, '#000000', 0.35)}" stroke-width="4"/>`; }
  return s;
}
// 体の絵を置く場所（説明の場面では、左に同じ大きさで置く）
const BM = { x: 300, y: 483, s: 0.86 };
const bmAt = (lx, ly, B = BM) => [B.x + lx * B.s, B.y + ly * B.s];
const mapAt = (t, opt, B = BM) => g(bodyMap(t, opt), { x: B.x, y: B.y, s: B.s });
// 右の説明の わく
const PN = { x: 1190, y: 470, w: 1240, h: 640 };
const panel = (fill = '#fff') => g(card(PN.w, PN.h, { fill }), { x: PN.x, y: PN.y });
const panelTitle = (str, t, st, en = 1e9, col = C.ink) => pop(badge(str, { fill: col, size: 42 }), t, st, PN.x, PN.y - PN.h / 2 + 62, { end: en });

// 1. つかみ：ごはんを食べる → やがて うんちになって出てくる → おなかの中で何が？
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${DG.room}"/><rect y="800" width="1920" height="280" fill="${DG.floor}"/>`;
    out += `<rect x="300" y="130" width="420" height="300" rx="16" fill="#cfe6f2" stroke="#fff" stroke-width="16"/><line x1="510" y1="130" x2="510" y2="430" stroke="#fff" stroke-width="12"/><line x1="300" y1="280" x2="720" y2="280" stroke="#fff" stroke-width="12"/>` + cloud(420, 232, 0.5) + cloud(630, 370, 0.4);
    // テーブルと ごはん
    out += `<rect x="110" y="590" width="800" height="38" rx="14" fill="#c9a77c"/><rect x="170" y="628" width="34" height="186" fill="#b8946a"/><rect x="816" y="628" width="34" height="186" fill="#b8946a"/>`;
    out += g(riceBowl(1.7), { x: 300, y: 488 }) + `<ellipse cx="640" cy="582" rx="200" ry="18" fill="#fff" stroke="#d9cfba" stroke-width="4"/>`;
    // おにぎりが 口へ（もぐもぐ、ごっくん）
    const KX = 1130, KY = 850, KS = 1.15, MX = KX, MY = KY - 258 * KS;
    const chew = win(t, c0 + 0.8, c0 + 3.6, 0.2);
    out += kidShow('B', t, KX, KY, { s: KS, start: -1, n: 0, side: 'right', size: 52, mouth: chew > 0.5 && Math.sin(t * 14) > 0 ? 'open' : null, eyes: chew > 0.5 ? 'smile' : null });
    for (let i = 0; i < 3; i++) {
      const st = c0 + 0.1 + i * 1.05, k = prog(t, st, 0.8), hx = 550 + i * 90;
      if (k <= 0) out += g(onigiri(1.3), { x: hx, y: 516 });
      else if (k < 1) out += g(onigiri(1.3 * (1 - 0.75 * Math.pow(k, 3))), { x: lerp(hx, MX, eio(k)), y: lerp(516, MY, eio(k)) - Math.sin(k * Math.PI) * 200, o: 1 - prog(k, 0.9, 0.1) });
    }
    out += g(text(0, 0, 'もぐもぐ', { size: 64, w: 900, fill: C.ochre }), { x: 1400 + Math.sin(t * 14) * 4, y: 330, o: win(t, c0 + 0.9, c0 + 2.6, 0.2), r: 8 });
    out += g(text(0, 0, 'ごっくん', { size: 64, w: 900, fill: C.redUi }), { x: 1400, y: 450, o: win(t, c0 + 2.7, cueE(0) + 0.15, 0.2), r: 8 });
    // やがて、トイレで うんちに
    out += pop(toiletIcon(1.9), t, c2 + 0.5, 1640, 648);
    out += pop(g(arrow2(-66, 0, 66, 0, C.ochre, 14)) + ctext(0, -52, 'やがて…', { size: 44, w: 900, fill: C.ochre }), t, c2 + 0.2, 1350, 640);
    out += pop(poopIcon(1.35), t, c2 + 2.0, 1520, 400);
    if (t > c2 + 2.2) for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + t * 0.8; out += `<circle cx="${1520 + Math.cos(a) * 130}" cy="${404 + Math.sin(a) * 104}" r="${6 + 3 * Math.sin(t * 5 + i)}" fill="${C.yellow}" opacity="${prog(t, c2 + 2.2, 0.3)}"/>`; }
    // おなかの中で、何が？
    const bO = win(t, c3 + 0.3, cueE(3) + 0.6, 0.3), by = KY - 150 * KS;
    out += `<circle cx="${KX}" cy="${by}" r="${86 + 6 * Math.sin(t * 6)}" fill="none" stroke="${C.red}" stroke-width="9" stroke-dasharray="18 14" opacity="${bO}"/>`;
    out += g(text(0, 0, '？', { size: 200, w: 900, fill: C.ochre, extra: `stroke="${DG.room}" stroke-width="18" paint-order="stroke"` }), { x: 1130, y: 250, o: win(t, c3 + 0.8, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">たべた ものは、どうやって</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${DG.poopDk}">うんち</tspan>に なるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(onigiri(1.2), { x: -330 }) + arrow2(-210, 0, -80, 0, C.ochre, 14) + text(20, -4, '？', { size: 110, w: 900, fill: C.ochre }) + arrow2(120, 0, 250, 0, C.ochre, 14) + g(poopIcon(1.15), { x: 360, y: -4 }), t, t0 + 1.8, 960, 780);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'たべた ものは、どうやって うんちに なる？', { size: 62, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', ['いの なかで、ぎゅっと かためられる']], ['②', ['ながい くだを とおる あいだに、えいようと みずを', 'とられて、のこりが うんちに なる']], ['③', ['たべた ものが、そのままの かたちで、', 'おしりまで はこばれる']]];
    const cur = curLine(), osz = Math.min(...opts.flatMap(([, L]) => L.map(s => fit(s, 1040, 42))));
    opts.forEach(([n, L], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-80" width="1260" height="160" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 140) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        L.map((s, j) => text(-460, 2 + (j - (L.length - 1) / 2) * (osz + 14), s, { size: osz, w: 700, anchor: 'start' })).join(''), t, cue(i + 1) - 0.2, 820, 384 + i * 166);
    });
    out += pop(g(bodyMap(t, { tract: 0 }), { s: 0.4 }) + text(0, 44, '？', { size: 130, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 610, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 口から おしりまで、1本の長い管
SCENES.push({
  id: 'tube',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), B = { x: 430, y: 483, s: 0.86 };
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const rv = prog(t, c0 + 0.4, cueE(0) - c0 - 0.4);
    const mk = t > c1 ? prog(t, c1 + 0.2, cueE(1) - c1 + 1.6) * 0.62 : null;
    out += mapAt(t, { reveal: rv, mark: mk }, B);
    const lab = [[0, -262, 250, 'くち', 0.0], [2, -186, 330, 'しょくどう', TR.kE * 0.6], [112, -70, 424, 'い', TR.kS * 0.8], [140, 130, 540, 'だいちょう', TR.kM + 0.12], [40, 168, 640, 'しょうちょう', TR.kS + 0.2], [0, 386, 770, 'おしり', 0.995]];
    lab.forEach(([lx, ly, by, str, k]) => { const [x, y] = bmAt(lx, ly, B); out += tag(x, y, 880, by, str, rv >= k ? prog(t, c0 + 0.4 + k * (cueE(0) - c0 - 0.4), 0.3) : 0, { col: str === 'だいちょう' ? DG.largeDk : str === 'おしり' || str === 'くち' ? C.ink : DG.tubeDk, size: 40 }); });
    // まっすぐに のばした 管
    out += pop(badge('くちから おしりまで、1ぽんの ながい くだ', { fill: C.ink, size: 42 }), t, c0 + 1.2, 1440, 250);
    const px0 = 1130, px1 = 1750, py = 440, pO = prog(t, c0 + 2.2, 0.5);
    if (pO > 0) {
      let p = `<line x1="${px0}" y1="${py}" x2="${px1}" y2="${py}" stroke="${DG.tubeDk}" stroke-width="50" stroke-linecap="round"/><line x1="${px0}" y1="${py}" x2="${px1}" y2="${py}" stroke="${DG.inside}" stroke-width="36" stroke-linecap="round"/>`;
      p += ctext(px0, py + 70, 'くち', { size: 38, w: 900 }) + ctext(px1, py + 70, 'おしり', { size: 38, w: 900 });
      if (mk !== null) { const mx = lerp(px0, px1, mk), c = markCol(mk); p += `<circle cx="${mx}" cy="${py}" r="15" fill="${c}" stroke="${mix(c, '#000000', 0.35)}" stroke-width="4"/>`; }
      out += g(p, { o: pO });
    }
    out += pop(g(onigiri(0.8), { x: -250 }) + arrow2(-170, 0, -90, 0, C.ochre, 10) + ctext(90, 2, 'すこしずつ すすむ', { size: 42, w: 900, fill: C.ochre }), t, c1 + 0.5, 1440, 640);
    return out;
  },
});

// ---- 口の中（かむ）。bits: 細かくなった割合、saliva: だ液 ----
function mouthPic(t, { bits = 0, saliva = 0, chew = 1 } = {}) {
  const gap = 26 + 92 * Math.abs(Math.sin(t * 4.4)) * chew, uy = -52, ly = uy + gap;
  let s = `<clipPath id="mclip"><rect x="-400" y="-215" width="800" height="430" rx="130"/></clipPath><g clip-path="url(#mclip)"><rect x="-400" y="-215" width="800" height="430" fill="#8a3a32"/>`;
  s += `<ellipse cx="0" cy="${ly + 190}" rx="330" ry="110" fill="#e77a80"/>`;
  // 細かくなった ごはん（下の歯の上）
  let food = '';
  const big = 1 - bits;
  if (big > 0.03) food += g(onigiri(1.5 * big), { x: 0, y: ly - 60 * big });
  for (let i = 0; i < 16; i++) {
    const k = clamp(bits * 16 - i * 0.7); if (k <= 0) continue;
    const x = -300 + i * 40 + (rnd(i, 3) - 0.5) * 26, y = ly - 14 - rnd(i, 4) * 26 * (0.4 + 0.6 * chew), r = (11 + rnd(i, 5) * 9) * (1 - 0.25 * saliva) * k;
    food += `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="${r * (0.35 + 0.6 * saliva)}" fill="${mix(DG.food, DG.mush, saliva * 0.6)}" stroke="${DG.foodDk}" stroke-width="3" transform="rotate(${rnd(i, 6) * 80} ${x} ${y})"/>`;
  }
  // 上の歯（動かない）と 下の歯（動く）
  const teeth = (y0, up) => { let o = `<rect x="-400" y="${up ? y0 - 190 : y0 + 78}" width="800" height="190" fill="#e58a90"/>`; for (let i = 0; i < 7; i++) o += `<rect x="${-322 + i * 92}" y="${up ? y0 - 96 : y0}" width="84" height="96" rx="20" fill="#fffdf5" stroke="#e4dccb" stroke-width="4"/>`; return o; };
  s += teeth(uy, true) + teeth(ly, false) + food;
  // だ液
  if (saliva > 0) for (let i = 0; i < 6; i++) { const p = (t * 0.9 + i * 0.37) % 1, x = -270 + i * 108; s += waterDrop(x, lerp(uy - 10, ly - 30, p), 1.0, saliva * Math.min(1, p * 6) * (1 - prog(p, 0.8, 0.2))); }
  return s + `</g><rect x="-400" y="-215" width="800" height="430" rx="130" fill="none" stroke="${DG.tubeDk}" stroke-width="12"/>`;
}
// ---- 大きな胃の絵 ----
const BIGST = 'M -160 -170 C -120 -262 190 -272 230 -90 C 262 40 170 190 10 190 C -90 190 -150 150 -190 190 L -240 150 C -200 100 -140 90 -100 40 C -70 -20 -150 -80 -160 -170 Z';
const germPic = (x, y, r, t, zap = 0) => {
  let b = ''; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + t * 0.6; b += `<line x1="${Math.cos(a) * r * 0.8}" y1="${Math.sin(a) * r * 0.8}" x2="${Math.cos(a) * r * 1.3}" y2="${Math.sin(a) * r * 1.3}" stroke="${DG.germ}" stroke-width="${r * 0.2}" stroke-linecap="round"/>`; }
  b += `<circle r="${r}" fill="${DG.germ}"/><circle cx="${-r * 0.35}" cy="${-r * 0.1}" r="${r * 0.16}" fill="#fff"/><circle cx="${r * 0.35}" cy="${-r * 0.1}" r="${r * 0.16}" fill="#fff"/><path d="M ${-r * 0.35} ${r * 0.45} Q 0 ${r * 0.2} ${r * 0.35} ${r * 0.45}" fill="none" stroke="#fff" stroke-width="${r * 0.12}" stroke-linecap="round"/>`;
  return g(b, { x: x + Math.sin(t * 3 + x) * 4, y: y + Math.cos(t * 2.6 + x) * 4, o: 1 - zap, s: 1 - 0.4 * zap }) + (zap > 0 && zap < 1 ? cross(x, y, r / 60 * 1.1 * Math.min(1, zap * 4), C.red) : '');
};
function stomachPic(t, { level = 0.25, mush = 0, wob = 0, bitsIn = 0, bolus = -1, germs = 0, zap = 0 } = {}) {
  const w = 0.03 * wob * Math.sin(t * 5.5);
  let s = `<rect x="-181" y="-330" width="72" height="190" fill="${DG.inside}" stroke="${DG.tubeDk}" stroke-width="11"/>`;
  let b = `<clipPath id="stclip"><path d="${BIGST}"/></clipPath><path d="${BIGST}" fill="${DG.inside}"/><g clip-path="url(#stclip)">`;
  const top = 190 - level * 400; let wave = `M -260 ${top}`;
  for (let x = -260; x <= 260; x += 26) wave += ` L ${x} ${top + Math.sin(x * 0.04 + t * (2 + 3 * wob)) * (5 + 9 * wob)}`;
  b += `<path d="${wave} L 260 220 L -260 220 Z" fill="${mix(DG.juice, DG.mush, mush)}" opacity="0.92"/>`;
  for (let i = 0; i < 14; i++) {
    const k = bitsIn * (1 - mush) * (0.7 + 0.3 * rnd(i, 9)); if (k <= 0.02) continue;
    const a = rnd(i, 7) * 6.283 + t * (0.5 + wob * 1.2) * (i % 2 ? 1 : -1), rr = 30 + rnd(i, 8) * 120;
    const x = 30 + Math.cos(a) * rr * 1.25, y = 90 + Math.sin(a) * rr * 0.5, r = (12 + rnd(i, 5) * 9) * k;
    b += `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="${r * 0.7}" fill="${mix(DG.food, DG.mush, 0.4)}" stroke="${DG.foodDk}" stroke-width="3"/>`;
  }
  if (germs > 0) [[-30, 100, 24], [110, 60, 28], [150, 128, 22]].forEach(([x, y, r], i) => { b += g(germPic(x, y, r, t + i, zap), { o: germs }); });
  b += `</g><path d="${BIGST}" fill="none" stroke="${DG.tubeDk}" stroke-width="13" stroke-linejoin="round"/>`;
  s += `<g transform="scale(${1 + w} ${1 - w})">${b}</g>`;
  s += `<rect x="-175" y="-240" width="60" height="96" fill="${DG.inside}"/>`;   // 食道と胃のつなぎ目
  if (bolus >= 0 && bolus < 1) { const y = lerp(-330, 40, eio(bolus)), x = lerp(-145, 0, eio(prog(bolus, 0.5, 0.5))); s += `<ellipse cx="${x}" cy="${y}" rx="26" ry="32" fill="${DG.food}" stroke="${DG.foodDk}" stroke-width="5"/>`; }
  return s;
}

// 4. 口 → 食道 → 胃
SCENES.push({
  id: 'stomach',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c5 = cue(5), c6 = cue(6);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const mk = t < c2 + 0.4 ? 0 : t < c3 ? lerp(0, TR.kE, prog(t, c2 + 0.4, 2.0)) + (TR.kS - TR.kE) * 0.3 * prog(t, c2 + 2.4, 0.6) : lerp(TR.kE + (TR.kS - TR.kE) * 0.3, TR.kS - 0.01, prog(t, c3, sceneDur(NOW.i) - c3));
    out += mapAt(t, { hi: t < c2 ? 'mouth' : t < c2 + 2.6 ? 'eso' : 'sto', mark: mk });
    out += panel();
    // 口の中
    const mO = 1 - prog(t, c2 - 0.4, 0.4);
    if (mO > 0) {
      const bits = prog(t, c0 + 1.4, cueE(0) - c0 - 1.0), sal = prog(t, c1 + 0.3, 1.2);
      let m = g(mouthPic(t, { bits, saliva: sal, chew: 1 - 0.6 * sal }), { x: PN.x, y: PN.y + 60, s: 0.98 });
      m += tag(PN.x - 250, PN.y - 42, PN.x - 470, PN.y - 150, 'は', prog(t, c0 + 0.8, 0.3) * (1 - prog(t, c1, 0.3)), { size: 42 });
      m += tag(PN.x + 262, PN.y + 30, PN.x + 440, PN.y - 150, 'だえき', prog(t, c1 + 1.0, 0.3), { col: DG.waterDk, size: 42 });
      out += g(m, { o: mO });
    }
    out += panelTitle('くち：はで かんで、こまかく', t, c0 + 0.3, c1) + panelTitle('だえきが、ごはんを とかしはじめる', t, c1 + 0.2, c2 - 0.3, DG.waterDk);
    // 胃
    const sO = prog(t, c2 - 0.1, 0.4), SX = 1010, SY = 560, SS = 0.85;
    if (sO > 0) {
      const bol = prog(t, c2 + 0.5, 2.2);
      let m = g(stomachPic(t, { level: 0.22 + 0.42 * prog(t, c3 + 0.4, 2.6), mush: prog(t, c3 + 1.6, cueE(3) - c3 - 0.8), wob: prog(t, c3 + 0.3, 0.5), bitsIn: prog(t, c2 + 2.5, 0.4), bolus: t > c2 + 0.5 && bol < 1 ? bol : -1, germs: prog(t, c6 + 0.3, 0.3), zap: prog(t, c6 + 2.0, 0.7) }), { x: SX, y: SY, s: SS });
      m += tag(SX - 181 * SS, SY - 270 * SS, SX - 330, SY - 250, 'しょくどう', prog(t, c2 + 0.5, 0.3), { col: DG.tubeDk, size: 40 });
      m += tag(SX + 170 * SS, SY - 150 * SS, SX + 330, SY - 250, 'い', prog(t, c2 + 2.4, 0.3), { col: DG.tubeDk, size: 44 });
      m += tag(SX + 90 * SS, SY + 20 * SS, SX + 400, SY - 110, 'いえき', prog(t, c3 + 1.0, 0.3) * (1 - prog(t, c5 - 0.3, 0.3)), { col: '#8f8212', size: 42 });
      // ぎゅっ、ぎゅっ（胃の動き）
      const wO = win(t, c3 + 2.2, c5 - 0.4, 0.3);
      for (let i = 0; i < 2; i++) { const sg = i ? 1 : -1, d = 8 * Math.sin(t * 5.5); m += g(arrow2(sg * 330, 60, sg * (262 + d), 60, C.redUi, 11), { x: SX + (i ? 0 : -50), y: SY + 30, o: wO }); }
      out += g(m, { o: sO });
    }
    out += panelTitle('しょくどうを とおって、いへ', t, c2 + 0.2, c3) + panelTitle('い：いえきと いの うごきで、どろどろに', t, c3 + 0.3, c6) + panelTitle('いえきは、ばいきんも やっつける', t, c6 + 0.3, 1e9, '#6f6410');
    // 3〜5時間
    out += g(g(clockIcon(74, (t - c5) * 0.5), { x: 1540, y: 420 }) + g(badge('3〜5じかん ほど', { fill: C.ochre, size: 44 }), { x: 1540, y: 550 }), { o: win(t, c5 + 0.2, c6 - 0.1, 0.3) });
    // ばい菌
    const zp = prog(t, c6 + 2.0, 0.7);
    out += pop(germPic(0, 0, 62, t, 0) + ctext(0, 118, 'ばいきん', { size: 40, w: 900, fill: DG.germ }), t, c6 + 0.5, 1540, 430);
    if (zp > 0) out += cross(1540, 430, 1.25 * Math.min(1, zp * 3), C.red);
    out += kidShow('S', t, 1752, 846, { s: 0.42, start: cue(4) - 0.9, n: 0, side: 'left', size: 42 });
    return out;
  },
});

// 5. 小腸：6メートルくらい、小さな突起がびっしり、栄養をとりこむ
SCENES.push({
  id: 'small',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += mapAt(t, { hi: 'sm', mark: lerp(TR.kS, lerp(TR.kS, TR.kM, 0.88), prog(t, 0.3, D - 0.6)) });
    out += panel();
    // のばすと 6メートルくらい
    const aO = 1 - prog(t, c1 - 0.5, 0.4);
    if (aO > 0) {
      const x0 = 680, x1 = 1640, y = 430, gk = eio(prog(t, c0 + 1.0, 3.4)), xe = lerp(x0, x1, gk);
      let a = ctext(PN.x, 318, 'まっすぐに のばすと…', { size: 42, w: 900, fill: DG.tubeDk });
      a += `<line x1="${x0}" y1="${y}" x2="${xe}" y2="${y}" stroke="${DG.tubeDk}" stroke-width="50" stroke-linecap="round"/><line x1="${x0}" y1="${y}" x2="${xe}" y2="${y}" stroke="${DG.tube}" stroke-width="36" stroke-linecap="round"/>`;
      a += `<line x1="${x0}" y1="${y + 90}" x2="${x1}" y2="${y + 90}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
      for (let i = 0; i <= 6; i++) { const x = x0 + i * 160, on = xe >= x - 2; a += `<line x1="${x}" y1="${y + 70}" x2="${x}" y2="${y + 110}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>` + (i ? ctext(x, y + 150, String(i), { size: 50, w: 900, fill: on ? C.ink : C.line }) : ''); }
      a += text(x1 + 34, y + 152, 'メートル', { size: 28, w: 900, anchor: 'start', fill: C.muted });
      a += pop(badge('6メートル くらい', { fill: DG.tubeDk, size: 54, pad: 44 }), t, c0 + 4.2, PN.x - 190, 690) + pop(badge('いちばん ながい', { fill: C.ochre, size: 46 }), t, c0 + 5.4, PN.x + 300, 690);
      out += g(a, { o: aO });
    }
    out += panelTitle('しょうちょう', t, c0 + 0.3, c1 - 0.4, DG.tubeDk);
    // 内がわの 小さな突起 と 栄養
    const bO = prog(t, c1 - 0.2, 0.4);
    if (bO > 0) {
      const X0 = PN.x - 580, X1 = PN.x + 580, Y0 = 290, Y1 = 760, WY = 668;
      let b = `<clipPath id="vclip"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="24"/></clipPath><g clip-path="url(#vclip)"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${DG.inside}"/>`;
      // どろどろ（左から右へ流れる）
      for (let i = 0; i < 9; i++) { const x = X0 + (((i * 150 + t * 34) % 1300) + 1300) % 1300 - 60, y = 352 + rnd(i, 2) * 46 + Math.sin(t * 1.4 + i) * 6; b += `<ellipse cx="${x}" cy="${y}" rx="${44 + rnd(i, 3) * 26}" ry="${24 + rnd(i, 4) * 10}" fill="${DG.mush}" opacity="0.9"/>`; }
      // かべ と 血管
      b += `<rect x="${X0}" y="${WY}" width="${X1 - X0}" height="${Y1 - WY}" fill="${DG.tube}"/><line x1="${X0}" y1="${WY + 50}" x2="${X1}" y2="${WY + 50}" stroke="${DG.blood}" stroke-width="16"/>`;
      const VX = i => X0 + 86 + i * 141, VH = 212, nO = prog(t, c2 + 0.3, 0.5);
      for (let i = 0; i < 8; i++) {
        const x = VX(i), sw = Math.sin(t * 1.3 + i * 0.9) * 2.5;
        b += `<g transform="rotate(${sw} ${x} ${WY})"><path d="M ${x - 46} ${WY + 6} L ${x - 46} ${WY - VH + 46} A 46 46 0 0 1 ${x + 46} ${WY - VH + 46} L ${x + 46} ${WY + 6} Z" fill="${DG.tube}" stroke="${DG.tubeDk}" stroke-width="7" stroke-linejoin="round"/>` +
          `<path d="M ${x - 14} ${WY + 50} L ${x - 14} ${WY - VH + 60} A 14 14 0 0 1 ${x + 14} ${WY - VH + 60} L ${x + 14} ${WY + 50}" fill="none" stroke="${DG.blood}" stroke-width="7" opacity="0.85"/></g>`;
      }
      // 栄養のつぶ：どろどろ → 突起 → 血管 → 体の中へ
      if (nO > 0) for (let i = 0; i < 12; i++) {
        const p = (t * 0.21 + i * 0.083 + rnd(i, 5) * 0.3) % 1, vi = i % 8, x = VX(vi) + (i % 2 ? 14 : -14);
        let nx, ny;
        if (p < 0.3) { const u = p / 0.3; nx = x - 70 + 70 * u; ny = lerp(390, WY - VH + 26, eio(u)); }
        else if (p < 0.72) { const u = (p - 0.3) / 0.42; nx = x; ny = lerp(WY - VH + 26, WY + 50, u); }
        else { const u = (p - 0.72) / 0.28; nx = x + u * 260; ny = WY + 50; }
        b += `<circle cx="${nx}" cy="${ny}" r="13" fill="${DG.nut}" stroke="#fff" stroke-width="4" opacity="${nO * Math.min(1, p * 8, (1 - p) * 8)}"/>`;
      }
      b += `</g><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="24" fill="none" stroke="${DG.tubeDk}" stroke-width="8"/>`;
      b += tag(VX(2), WY - VH + 10, VX(2) + 40, 330, 'ちいさな とっき', prog(t, c1 + 1.2, 0.3) * (1 - prog(t, c2 - 0.2, 0.3)), { col: DG.tubeDk, size: 40 });
      b += g(`<rect x="-150" y="-36" width="300" height="72" rx="36" fill="#fff" stroke="${DG.nut}" stroke-width="5"/><circle cx="-102" cy="0" r="15" fill="${DG.nut}"/>` + text(-70, 2, 'えいよう', { size: 40, w: 900, anchor: 'start', fill: '#b86a10' }), { x: X0 + 190, y: 340, o: nO });
      b += g(`<rect x="-176" y="-32" width="352" height="64" rx="32" fill="#fff" stroke="${DG.blood}" stroke-width="5"/>` + ctext(-22, 2, 'からだの なかへ', { size: 36, w: 900, fill: DG.blood }) + arrow2(120, 0, 156, 0, DG.blood, 7), { x: X1 - 210, y: WY + 50, o: prog(t, c2 + 1.6, 0.4) });
      out += g(b, { o: bO });
    }
    out += panelTitle('うちがわに、ちいさな とっきが びっしり', t, c1 + 0.1, c2 - 0.1, DG.tubeDk) + panelTitle('ここで、えいようを からだに とりこむ', t, c2 + 0.2, 1e9, '#b86a10');
    return out;
  },
});

// 6. 大腸：水をすいとる → だんだんかたまって うんちに
SCENES.push({
  id: 'large',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += mapAt(t, { hi: 'lg', mark: lerp(lerp(TR.kS, TR.kM, 0.97), TR.kR - 0.01, prog(t, 0.3, D - 0.8)) });
    out += panel();
    const X0 = 640, X1 = 1740, CY = 480, H = 100, n = 10, bw = (X1 - X0) / n;
    let top = `M ${X0} ${CY - H}`, bot = `M ${X0} ${CY + H}`;
    for (let i = 0; i < n; i++) { top += ` Q ${X0 + (i + 0.5) * bw} ${CY - H - 44} ${X0 + (i + 1) * bw} ${CY - H}`; bot += ` Q ${X0 + (i + 0.5) * bw} ${CY + H + 44} ${X0 + (i + 1) * bw} ${CY + H}`; }
    out += `<rect x="${X0}" y="${CY - H}" width="${X1 - X0}" height="${H * 2}" fill="${DG.inside}"/>`;
    let fillB = ''; for (let i = 0; i < n; i++) fillB += `<ellipse cx="${X0 + (i + 0.5) * bw}" cy="${CY}" rx="${bw / 2 + 2}" ry="${H + 21}" fill="${DG.inside}"/>`;
    out += fillB + `<path d="${top}" fill="none" stroke="${DG.largeDk}" stroke-width="16" stroke-linecap="round"/><path d="${bot}" fill="none" stroke="${DG.largeDk}" stroke-width="16" stroke-linecap="round"/>`;
    // 中身：水たっぷり → かたまる
    const d = prog(t, c1 + 0.4, cueE(2) - c1 - 0.6), bx = lerp(800, 1590, eio(prog(t, c0 + 0.3, cueE(2) - c0)));
    const wO = Math.pow(1 - d, 0.8);
    if (wO > 0.02) { let wv = `M ${bx - lerp(190, 70, d)} ${CY + 86}`; const hw = lerp(190, 70, d), ht = lerp(120, 30, d); for (let k = 0; k <= 20; k++) { const u = k / 20, x = bx - hw + u * hw * 2; wv += ` L ${x} ${CY + 86 - Math.pow(Math.sin(u * Math.PI), 0.45) * ht + Math.sin(u * 14 + t * 4) * 4}`; } out += `<path d="${wv} Z" fill="${DG.water}" opacity="${0.85 * wO}"/>`; }
    const lump = prog(d, 0.72, 0.28), col = mix(DG.mush, DG.poop, d);
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, sp = lerp(1, 0.42, d), x = bx + Math.cos(a) * 92 * sp + Math.sin(t * 2 + i) * 6 * (1 - d), y = CY + 34 + Math.sin(a) * 34 * sp + Math.cos(t * 2.4 + i) * 5 * (1 - d); out += `<ellipse cx="${x}" cy="${y}" rx="${lerp(34, 40, d)}" ry="${lerp(22, 30, d)}" fill="${col}" opacity="${1 - lump * 0.9}"/>`; }
    if (lump > 0) out += g(`<path d="M -96 6 C -100 -34 -44 -46 -10 -38 C 30 -52 96 -40 98 4 C 100 40 40 46 0 42 C -40 48 -94 42 -96 6 Z" fill="${DG.poop}"/><path d="M -62 -10 Q -40 -26 -14 -20" fill="none" stroke="${DG.poopLt}" stroke-width="8" stroke-linecap="round"/>`, { x: bx, y: CY + 34, o: lump });
    // 水が かべへ すいとられる
    const dO = win(t, c1 + 0.2, cueE(2) + 0.2, 0.4);
    if (dO > 0) for (let i = 0; i < 8; i++) { const p = (t * 0.55 + i / 8) % 1, up = i % 2 === 0, x = bx + (rnd(i, 3) - 0.5) * 220, y = up ? lerp(CY - 10, CY - H - 100, p) : lerp(CY + 80, CY + H + 84, p); out += waterDrop(x, y, 1.0, dO * Math.min(1, p * 6) * (1 - prog(p, 0.75, 0.25))); }
    out += g(arrow2(bx - 150, CY - H - 56, bx - 150, CY - H - 108, DG.waterDk, 9) + arrow2(bx + 150, CY + H + 56, bx + 150, CY + H + 108, DG.waterDk, 9), { o: dO });
    out += panelTitle('だいちょうへ。まだ みずが たっぷり', t, c0 + 0.3, c1 - 0.1, DG.largeDk) + panelTitle('だいちょうは、みずを すいとる', t, c1 + 0.2, c2 - 0.1, DG.waterDk) + panelTitle('だんだん かたまって、うんちに なる', t, c2 + 0.2, 1e9, DG.poopDk);
    out += tag(bx, CY + 6, bx - 30, CY - H - 78, 'うんち', prog(t, cueE(2) - 0.6, 0.3), { col: DG.poopDk, size: 44 });
    // まとめ
    { const items = [['みず たっぷり', DG.waterDk, c0 + 1.2], ['みずを すいとる', C.ink, c1 + 0.6], ['かたまって うんちに', DG.poopDk, c2 + 0.8]], sz = 34, gap = 64;
      const ws = items.map(([s]) => tw(s, sz, 700, 0.04) + 68), tot = ws.reduce((a, b) => a + b, 0) + gap * 2; let x = PN.x - tot / 2;
      items.forEach(([s, col, st], i) => { out += pop(badge(s, { fill: col, size: sz }), t, st, x + ws[i] / 2, 738); if (i) out += g(arrow2(x - gap + 12, 738, x - 12, 738, C.ochre, 9), { o: prog(t, st - 0.2, 0.3) }); x += ws[i] + gap; }); }
    return out;
  },
});

// 7. 出口の手前に ためる → 脳に知らせ → 「うんちがしたい」
const brainIcon = (s = 1) => g(`<g transform="translate(0 364)"><path d="M -58 -352 C -72 -392 -30 -412 -8 -396 C 10 -416 56 -404 58 -372 C 78 -356 62 -326 34 -330 C 14 -316 -16 -318 -28 -330 C -54 -324 -70 -338 -58 -352 Z" fill="#f7b3c0" stroke="#d9788c" stroke-width="5"/><path d="M -34 -366 Q -18 -382 -4 -366 M 6 -372 Q 24 -390 38 -368 M -22 -344 Q -6 -356 10 -344" fill="none" stroke="#d9788c" stroke-width="4" stroke-linecap="round"/></g>`, { s });
const SIGP = [[0, 356], [-70, 380], [-176, 340], [-190, 200], [-190, -110], [-150, -184], [-40, -214], [-84, -262], [-86, -330], [-40, -366]];
SCENES.push({
  id: 'out',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sg = prog(t, c1 + 0.3, 0.4);
    let mp = bodyMap(t, { hi: 'rec', hiO: 1, mark: lerp(TR.kR, 0.985, prog(t, 0.2, c0 + 1.5)), brain: sg });
    if (sg > 0) { mp += `<polyline points="${SIGP.map(p => p.join(',')).join(' ')}" fill="none" stroke="${DG.signal}" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round" opacity="${sg}"/>`; for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1, [x, y] = polyAt(SIGP, p); mp += `<circle cx="${x}" cy="${y}" r="15" fill="${DG.signal}" stroke="#fff" stroke-width="5" opacity="${sg * Math.min(1, p * 8, (1 - p) * 8)}"/>`; } }
    out += g(mp, { x: BM.x, y: BM.y, s: BM.s });
    out += panel();
    // 出口の手前（わくの中の絵）
    const RX = 1000, RY = 546;
    let r = `<path d="M -424 -200 C -150 -200 0 -190 0 -70 L 0 150" fill="none" stroke="${DG.largeDk}" stroke-width="170" stroke-linecap="butt"/><path d="M -426 -200 C -150 -200 0 -190 0 -70 L 0 156" fill="none" stroke="${DG.inside}" stroke-width="144" stroke-linecap="butt"/>`;
    const wallO = win(t, c1 + 0.2, c2 + 0.3, 0.3) * (0.5 + 0.4 * Math.sin(t * 7));
    if (wallO > 0) r += `<path d="M -79 -70 L -79 140 M 79 -70 L 79 140" fill="none" stroke="${DG.signal}" stroke-width="14" stroke-linecap="round" opacity="${wallO}"/>`;
    const LP = [...bez([-424, -200], [-150, -200], [0, -190], [0, -70], 24), [0, 150]];
    for (let i = 0; i < 4; i++) {
      const st = c0 + 0.3 + i * 0.9, k = eo(prog(t, st, 1.3)), kEnd = (polyLen(LP) - 44 - i * 54) / polyLen(LP); if (t < st) continue;
      const [x, y] = polyAt(LP, k * kEnd), rot = k * kEnd > 0.6 ? 0 : -20;
      r += `<ellipse cx="${x}" cy="${y}" rx="56" ry="29" fill="${DG.poop}" transform="rotate(${rot} ${x} ${y})"/><path d="M ${x - 30} ${y - 8} Q ${x - 12} ${y - 18} ${x + 6} ${y - 12}" fill="none" stroke="${DG.poopLt}" stroke-width="6" stroke-linecap="round"/>`;
    }
    r += `<ellipse cx="-62" cy="176" rx="64" ry="34" fill="#e58a90" stroke="${DG.tubeDk}" stroke-width="6"/><ellipse cx="62" cy="176" rx="64" ry="34" fill="#e58a90" stroke="${DG.tubeDk}" stroke-width="6"/>`;
    out += g(r, { x: RX, y: RY });
    out += tag(RX - 86, RY + 30, 742, RY - 30, 'ここに ためる', prog(t, c0 + 1.4, 0.3), { col: DG.poopDk, size: 40 });
    out += tag(RX - 100, RY + 190, 742, RY + 200, 'でぐち', prog(t, c0 + 2.6, 0.3), { col: DG.tubeDk, size: 40 });
    // 知らせが 脳へ
    if (sg > 0) {
      const SP = bez([RX + 90, RY + 40], [RX + 220, RY + 40], [1300, 600], [1400, 430], 30);
      out += `<polyline points="${SP.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${DG.signal}" stroke-width="8" stroke-dasharray="4 18" stroke-linecap="round" opacity="${sg}"/>`;
      for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1, [x, y] = polyAt(SP, p); out += `<circle cx="${x}" cy="${y}" r="17" fill="${DG.signal}" stroke="#fff" stroke-width="5" opacity="${sg * Math.min(1, p * 8, (1 - p) * 8)}"/>`; }
      out += g(text(0, 0, 'しらせ', { size: 40, w: 900, fill: '#a87a00' }), { x: 1190, y: 474, o: sg });
    }
    out += pop(brainIcon(2.3) + ctext(0, 138, 'のう', { size: 44, w: 900, fill: '#c25a72' }), t, c1 + 0.5, 1500, 404);
    out += pop(badge('うんちが したい！', { fill: C.redUi, size: 50, pad: 40 }), t, c2 + 1.2, 1470, 624);
    if (t > c2 + 1.2) for (let i = 0; i < 3; i++) out += `<line x1="${1500 + (i - 1) * 60}" y1="${300}" x2="${1500 + (i - 1) * 84}" y2="${272 - 5 * Math.sin(t * 8)}" stroke="${C.redUi}" stroke-width="8" stroke-linecap="round" opacity="${prog(t, c2 + 1.2, 0.3)}"/>`;
    out += panelTitle('でぐちの てまえに、うんちを ためる', t, c0 + 0.3, c1, DG.poopDk) + panelTitle('たまると、のうに しらせが とどく', t, c1 + 0.2, c2, '#a87a00') + panelTitle('「うんちが したい」と かんじる', t, c2 + 0.2, 1e9, C.redUi);
    out += kidShow('B', t, 1746, 846, { s: 0.42, start: c3 - 0.9, n: 0, bubble: false });
    out += talkBubble('B', 1500, 724, 1746 - 34, 846 - 282 * 0.42, 44);   // しっぽの先は おとうとの顔
    return out;
  },
});

// 8. 出てくるまで 1日半〜3日。今日のうんちは、きのうや おとといの ごはん。中身は8割くらいが水
SCENES.push({
  id: 'time',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A. 時間のものさし
    const aO = 1 - prog(t, c1 - 0.5, 0.4);
    if (aO > 0) {
      const x0 = 300, x1 = 1680, y = 500, dx = (x1 - x0) / 3, gk = eio(prog(t, c0 + 0.4, 3.0)), xe = lerp(x0, x1, gk);
      let a = pop(badge('たべてから、でて くるまで', { fill: C.ink, size: 46 }), t, 0.3, 960, 210);
      a += `<rect x="${x0 + dx * 1.5}" y="${y - 44}" width="${dx * 1.5}" height="88" rx="20" fill="${DG.poopLt}" opacity="${0.45 * prog(t, c0 + 2.6, 0.5)}"/>`;
      a += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.line}" stroke-width="12" stroke-linecap="round"/><line x1="${x0}" y1="${y}" x2="${xe}" y2="${y}" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/>`;
      ['たべる', '1にち', '2か', '3か'].forEach((s, i) => { const x = x0 + i * dx, on = xe >= x - 2; a += `<line x1="${x}" y1="${y - 30}" x2="${x}" y2="${y + 30}" stroke="${on ? C.ink : C.line}" stroke-width="10" stroke-linecap="round"/>` + ctext(x, y + 84, s, { size: 46, w: 900, fill: on ? C.ink : C.line }); });
      a += g(riceBowl(1.2), { x: x0, y: y - 130 });
      a += `<circle cx="${xe}" cy="${y}" r="20" fill="${markCol(gk * 0.99)}" stroke="${C.ink}" stroke-width="5"/>`;
      a += pop(poopIcon(1.1), t, c0 + 3.0, x0 + dx * 2.25, y - 126);
      a += pop(`<path d="M ${-dx * 0.75} -16 L ${-dx * 0.75} 6 L ${dx * 0.75} 6 L ${dx * 0.75} -16" fill="none" stroke="${DG.poopDk}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` + g(badge('1にちはん 〜 3か ほど', { fill: DG.poopDk, size: 56, pad: 44 }), { y: 82 }), t, c0 + 3.4, x0 + dx * 2.25, y + 150);
      out += g(a, { o: aO });
    }
    // B. おととい・きのう・きょう
    const bO = win(t, c1 - 0.2, c2 - 0.3, 0.3);
    if (bO > 0) {
      let b = pop(badge('きょうの うんちは…', { fill: C.ink, size: 46 }), t, c1 + 0.1, 960, 210);
      const cs = [['おととい', 440, C.blueUi], ['きのう', 960, C.accent], ['きょう', 1480, DG.poopDk]];
      cs.forEach(([s, x, col], i) => {
        b += pop(card(400, 380) + `<path d="M -200 -116 L -200 -162 Q -200 -190 -172 -190 L 172 -190 Q 200 -190 200 -162 L 200 -116 Z" fill="${col}"/>` + ctext(0, -150, s, { size: 46, w: 900, fill: '#fff' }) +
          (i < 2 ? g(riceBowl(1.35), { y: 34 }) + ctext(0, 150, 'ごはん', { size: 38, w: 900, fill: C.muted }) : g(poopIcon(1.35), { y: 16 }) + ctext(0, 150, 'うんち', { size: 38, w: 900, fill: DG.poopDk })), t, c1 + 0.3 + [1.6, 0.9, 0.2][i], x, 500);
      });
      const arO = prog(t, c1 + 2.6, 0.4);
      b += g(`<path d="M 440 706 L 440 760 L 1480 760 L 1480 720" fill="none" stroke="${C.ochre}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M 960 706 L 960 760" fill="none" stroke="${C.ochre}" stroke-width="10" stroke-linecap="round"/><path d="M 1480 700 L 1458 736 L 1502 736 Z" fill="${C.ochre}"/>`, { o: arO });
      out += g(b, { o: bO });
    }
    // C. うんちの中身：8割くらいが水
    const cO = prog(t, c2 - 0.3, 0.3);
    if (cO > 0) {
      let c = pop(badge('うんちの なかみは？', { fill: C.ink, size: 46 }), t, c2 - 0.3, 960, 210);
      c += pop(poopIcon(2.5), t, c2 - 0.3, 380, 540);
      const bx0 = 720, bw = 100, by = 540;
      for (let i = 0; i < 10; i++) {
        const st = c2 + 1.0 + i * 0.2, wat = i < 8;
        c += pop(`<rect x="-45" y="-70" width="90" height="140" rx="16" fill="${wat ? DG.water : DG.poop}"/>` + (wat ? waterDrop(0, 4, 1.5, 1, '#fff') : ''), t, st, bx0 + i * bw + 50, by, { d: 0.35 });
      }
      c += pop(`<path d="M 0 22 L 0 0 L ${bw * 8 - 20} 0 L ${bw * 8 - 20} 22" fill="none" stroke="${DG.waterDk}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" transform="translate(${-(bw * 8 - 20) / 2} 0)"/>` + g(badge('8わりくらいが みず', { fill: DG.waterDk, size: 56, pad: 44 }), { y: -70 }), t, c2 + 3.2, bx0 + bw * 4, by - 100);
      const note = 'のこりは、たべかす・おなかの さいきん・はがれた ちょうの かべ';
      c += pop(`<path d="M 0 -22 L 0 0 L ${bw * 2 - 20} 0 L ${bw * 2 - 20} -22" fill="none" stroke="${DG.poopDk}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" transform="translate(${-(bw * 2 - 20) / 2} 0)"/>`, t, c2 + 4.4, bx0 + bw * 9, by + 100);
      c += g(text(bx0 + bw * 10 - 10, by + 170, note, { size: 34, w: 900, fill: DG.poopDk, anchor: 'end' }), { o: prog(t, c2 + 4.6, 0.4) });
      out += g(c, { o: cO });
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 350, NX = -590;
      let a = pop(card(1360, 200) + `<circle cx="${NX}" cy="0" r="50" fill="${C.accent}"/>` + text(NX, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, -32, 'ながい くだを とおる あいだに、えいようと みずを', { size: 44, w: 900, anchor: 'start' }) + text(NX + 96, 34, 'とられて、のこりが うんちに なる', { size: 44, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -136, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['くちで こまかく', C.ink], ['いで どろどろ', DG.tubeDk], ['しょうちょうで えいよう', '#b86a10'], ['だいちょうで みず', DG.waterDk]], t, 960, 620, { start: 2.4, step: 0.9, size: 36, gap: 26 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre }), L4 = SL()[4], warnAt = L4 ? L4.start + (L4.end - L4.start) * 0.58 : 1e9;
      const items = [
        [g(clockIcon(26, 0.12)), 'あさごはんを たべおわった じかんを おぼえる', C.ink, cue(1)],
        [qm, 'なんぷんくらいで、トイレに いきたく なる？', C.ink, cue(2)],
        [g(arrow2(-22, 0, 22, 0, DG.tubeDk, 8)), 'いに たべものが はいると、ちょうが うごきだす', DG.tubeDk, cue(3)],
        [g(arrow2(-22, 0, 22, 0, DG.tubeDk, 8)), 'あさごはんの あとは、うんちが したく なりやすい', DG.tubeDk, cue(3) + 4.6],
        [g(eyeIcon(0.3)), 'ながす まえに、うんちの いろと かたちを みる', C.ink, cue(4)],
        [g(warnIcon, { s: 0.62 }), 'みるだけ。さわらない', C.red, warnAt],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 880, 38, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 300 + i * 88); });
      // 朝ごはん → 何分？ → トイレ
      const PX = 1510, PY = 520;
      let p = card(700, 440, { fill: DG.room });
      p += g(riceBowl(1.15), { x: -230, y: -20 }) + ctext(-230, 140, 'あさごはん', { size: 34, w: 900 });
      p += g(arrow2(-130, -20, -76, -20, C.ochre, 10) + arrow2(76, -20, 130, -20, C.ochre, 10), {});
      p += g(clockIcon(62, (t * 0.12) % 1), { x: 0, y: -20 }) + ctext(0, 140, 'なんぷん？', { size: 34, w: 900, fill: C.ochre });
      p += g(toiletIcon(0.95), { x: 225, y: 12 }) + ctext(225, 140, 'トイレ', { size: 34, w: 900 });
      p += g(sunIcon(0.9), { x: -290, y: -160 }) + text(-232, -158, 'あさ', { size: 36, w: 900, anchor: 'start', fill: C.ochre });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「うんち」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

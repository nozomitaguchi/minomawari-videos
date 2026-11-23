// ---------- れいぞうこ の道具 ----------
// 色の約束：つめたい＝青、ねつ＝赤いなみ線・赤いつぶ。れいばいの管は、つめたい液＝青 → ガス＝水色 → あついガス＝赤 → 液＝オレンジ
const FR = {
  body: '#f3f5f2', side: '#d9dfe0', top: '#e6eaea', line: '#8a959b', inside: '#dceef6', cold: '#3f86c6', coldL: '#cfe6f2', gas: '#8fc4e6',
  hot: '#e2553f', liq: '#f0a04b', metal: '#a7adb0', wall: '#f6ecdc', floor: '#e2c9a3', warm: '#f6b79b', skin: '#f3d9c2', comp: '#6f777c',
};
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
// k 番目の行の、はじめから f（0〜1）のところの秒
const mid = (k, f = 0.5) => cue(k) + (cueE(k) - cue(k)) * f;
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const F1 = v => v.toFixed(1);
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${F1(x1)}" y1="${F1(y1)}" x2="${F1(x2 - Math.cos(a) * h * 0.6)}" y2="${F1(y2 - Math.sin(a) * h * 0.6)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${F1(x2)} ${F1(y2)} L ${F1(x2 - Math.cos(a - 0.5) * h)} ${F1(y2 - Math.sin(a - 0.5) * h)} L ${F1(x2 - Math.cos(a + 0.5) * h)} ${F1(y2 - Math.sin(a + 0.5) * h)} Z" fill="${col}"/>`;
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
// 折れ線の道具
const plen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
function pat(P, d) {
  for (let i = 1; i < P.length; i++) {
    const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (d <= l || i === P.length - 1) { const k = clamp(l ? d / l : 0); return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; }
    d -= l;
  }
  return P[0];
}
const ppath = P => 'M ' + P.map(p => p.join(' ')).join(' L ');
// 雪のけっしょう
const flake = (x, y, r = 20, col = FR.cold, w = 5, o = 1) => `<g transform="translate(${x} ${y})" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none" opacity="${o}">${[0, 60, 120].map(d => `<path transform="rotate(${d})" d="M 0 ${-r} V ${r} M ${-r * 0.3} ${-r * 0.72} L 0 ${-r * 0.45} L ${r * 0.3} ${-r * 0.72} M ${-r * 0.3} ${r * 0.72} L 0 ${r * 0.45} L ${r * 0.3} ${r * 0.72}"/>`).join('')}</g>`;
// 熱のなみ線（上へのぼる）
function heatUp(x, y, t, { n = 3, gap = 34, h = 70, col = FR.hot, o = 1, w = 8, ph = 0, rise = 50 } = {}) {
  if (o <= 0.01) return '';
  let s = '';
  for (let k = 0; k < n; k++) {
    const f = (((t * 0.7 + k * 0.37 + ph) % 1) + 1) % 1, yy = y - f * rise, a = Math.sin(f * Math.PI);
    s += `<path d="M ${F1(x + (k - (n - 1) / 2) * gap)} ${F1(yy)} q -10 ${-h / 4} 0 ${-h / 2} t 0 ${-h / 2}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${F1(a * o)}"/>`;
  }
  return s;
}
// 熱のなみ線（右へ出ていく）
function heatRight(x, y, t, { n = 3, gap = 60, len = 90, col = FR.hot, o = 1, w = 8, ph = 0, run = 60 } = {}) {
  if (o <= 0.01) return '';
  let s = '';
  for (let k = 0; k < n; k++) {
    const f = (((t * 0.7 + k * 0.37 + ph) % 1) + 1) % 1, xx = x + f * run, a = Math.sin(f * Math.PI);
    s += `<path d="M ${F1(xx)} ${F1(y + (k - (n - 1) / 2) * gap)} q ${len / 4} -10 ${len / 2} 0 t ${len / 2} 0" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${F1(a * o)}"/>`;
  }
  return s;
}
const heatDot = (x, y, r = 13, o = 1) => o <= 0.01 ? '' : `<circle cx="${F1(x)}" cy="${F1(y)}" r="${r * 1.7}" fill="${FR.hot}" opacity="${0.25 * o}"/><circle cx="${F1(x)}" cy="${F1(y)}" r="${r}" fill="${FR.hot}" stroke="#a8321f" stroke-width="3" opacity="${o}"/>`;
// 温度計（lv 0〜1）
const thermoPic = (lv, col = FR.hot) => `<rect x="-22" y="-250" width="44" height="270" rx="22" fill="#fff" stroke="${C.ink}" stroke-width="7"/><circle cx="0" cy="40" r="40" fill="#fff" stroke="${C.ink}" stroke-width="7"/><rect x="-15" y="-243" width="30" height="270" rx="15" fill="#fff"/>` +
  [0, 1, 2, 3, 4, 5].map(k => `<line x1="8" y1="${-10 - k * 42}" x2="20" y2="${-10 - k * 42}" stroke="#b9b2a2" stroke-width="5" stroke-linecap="round"/>`).join('') +
  `<rect x="-9" y="${F1(lerp(10, -232, clamp(lv)))}" width="18" height="${F1(40 - lerp(10, -232, clamp(lv)))}" rx="9" fill="${col}"/><circle cx="0" cy="40" r="28" fill="${col}"/><circle cx="-9" cy="31" r="8" fill="#fff" opacity="0.45"/>`;
// 食べもの
const milk = (x, y, s = 1) => g(`<path d="M -22 -60 L 0 -84 L 22 -60 L 22 0 L -22 0 Z" fill="#fff" stroke="${FR.line}" stroke-width="4" stroke-linejoin="round"/><rect x="-22" y="-44" width="44" height="22" fill="#6fa8d8"/>`, { x, y, s });
const apple = (x, y, s = 1) => g(`<circle cx="0" cy="-22" r="22" fill="#e2553f"/><path d="M 0 -42 q 6 -12 14 -12" fill="none" stroke="#6b4a2f" stroke-width="5" stroke-linecap="round"/><circle cx="-8" cy="-30" r="6" fill="#fff" opacity="0.4"/>`, { x, y, s });
const cheese = (x, y, s = 1) => g(`<path d="M -34 0 L 34 0 L 34 -22 L -34 -40 Z" fill="#f2c94c" stroke="#c99a1e" stroke-width="4" stroke-linejoin="round"/><circle cx="10" cy="-14" r="5" fill="#c99a1e"/><circle cx="-14" cy="-20" r="4" fill="#c99a1e"/>`, { x, y, s });
const pot = (x, y, s = 1) => g(`<rect x="-34" y="-36" width="68" height="36" rx="8" fill="#8fb3c6" stroke="${FR.line}" stroke-width="4"/><rect x="-40" y="-44" width="80" height="12" rx="6" fill="#6f96aa"/><circle cx="0" cy="-48" r="6" fill="#6f96aa"/>`, { x, y, s });
// 冷蔵庫（ななめ前から。足もとのまん中が原点）。open: 上のドアの開きぐあい 0〜1、warm: 横の面のあたたかさ 0〜1
function fridge3D(t, { open = 0, warm = 0 } = {}) {
  const W = 300, H = 620, DX = 84, DY = -34, SP = -250, hw = W / 2;
  let o = `<ellipse cx="30" cy="4" rx="210" ry="20" fill="#000" opacity="0.08"/>`;
  o += `<path d="M ${hw} ${-H} L ${hw + DX} ${-H + DY} L ${hw + DX} ${DY} L ${hw} 0 Z" fill="${mix(FR.side, FR.warm, clamp(warm))}" stroke="${FR.line}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<path d="M ${-hw + 8} ${-H} L ${-hw + DX} ${-H + DY} L ${hw + DX} ${-H + DY} L ${hw} ${-H} Z" fill="${FR.top}" stroke="${FR.line}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<rect x="${-hw}" y="${-H}" width="${W}" height="${H}" rx="14" fill="${FR.body}" stroke="${FR.line}" stroke-width="6"/>`;
  o += `<line x1="${-hw}" y1="${SP}" x2="${hw}" y2="${SP}" stroke="${FR.line}" stroke-width="6"/><rect x="${hw - 42}" y="${SP + 34}" width="14" height="96" rx="7" fill="${FR.metal}"/>`;
  if (open > 0.02) {
    const ih = H + SP - 26;
    o += `<rect x="${-hw + 14}" y="${-H + 14}" width="${W - 28}" height="${ih}" rx="8" fill="${FR.inside}" stroke="${FR.line}" stroke-width="3"/>`;
    o += `<line x1="${-hw + 14}" y1="${-H + 140}" x2="${hw - 14}" y2="${-H + 140}" stroke="#a9c7d6" stroke-width="5"/><line x1="${-hw + 14}" y1="${-H + 262}" x2="${hw - 14}" y2="${-H + 262}" stroke="#a9c7d6" stroke-width="5"/>`;
    o += milk(-70, -H + 138, 1.05) + apple(40, -H + 138, 1.0) + cheese(-50, -H + 260, 1.0) + pot(64, -H + 260, 0.95) + apple(-40, -H + ih + 6, 0.9) + milk(60, -H + ih + 6, 0.9);
    o += flake(-96, -H + 60, 18, FR.cold, 4, 0.8) + flake(100, -H + 200, 16, FR.cold, 4, 0.8) + flake(0, -H + 318, 16, FR.cold, 4, 0.8);
    const th = clamp(open) * 2.0, fx = -hw + W * Math.cos(th), dy = 46 * Math.sin(th);
    o += `<path d="M ${-hw} ${-H + 4} L ${F1(fx)} ${F1(-H + 4 + dy)} L ${F1(fx)} ${F1(SP - 4 + dy)} L ${-hw} ${SP - 4} Z" fill="#e9eeee" stroke="${FR.line}" stroke-width="6" stroke-linejoin="round"/>`;
  } else o += `<rect x="${hw - 42}" y="${-H + 70}" width="14" height="130" rx="7" fill="${FR.metal}"/>`;
  return o;
}
// 横の面のまん中（fridge3D の中の座標）
const SIDE_C = [192, -330];
// 大人の手（右からのびて、(0,0) にさわる）
const adultHand = () => `<path d="M 330 70 L 70 14" stroke="#5f8fb5" stroke-width="64" stroke-linecap="round"/><path d="M 96 18 L 40 6" stroke="${FR.skin}" stroke-width="46" stroke-linecap="round"/><ellipse cx="18" cy="0" rx="34" ry="30" fill="${FR.skin}"/><path d="M 20 -28 q -22 -18 -34 -4" fill="none" stroke="${FR.skin}" stroke-width="16" stroke-linecap="round"/>`;
// 冷蔵庫を横から切った絵（左がドア、右がうしろ）。原点は左上、420×640（うしろの管は x 500 まで）
const P_COOL = [[298, 74], [298, 300]];
const P_TOCOMP = [[298, 300], [298, 340], [350, 340], [350, 548]];
const P_COND = [[378, 574], [460, 574], [460, 520], ...Array.from({ length: 14 }, (_, k) => [k % 2 ? 484 : 436, 500 - k * 30]), [460, 92]];
const P_CAP = [[460, 92], [460, 50], [298, 50], [298, 74]];
const SEGS = [[P_COOL, FR.cold, FR.gas], [P_TOCOMP, FR.gas, FR.gas], [P_COND, FR.hot, FR.liq], [P_CAP, FR.liq, FR.cold]].map(([P, a, b]) => ({ P, a, b, L: plen(P) }));
const LOOP_L = SEGS.reduce((a, s) => a + s.L, 0);
function loopAt(f) {
  let d = ((f % 1) + 1) % 1 * LOOP_L;
  for (const s of SEGS) { if (d <= s.L) { const [x, y] = pat(s.P, d); return [x, y, mix(s.a, s.b, d / s.L)]; } d -= s.L; }
  return [298, 74, FR.cold];
}
// hl: 目立たせる部品（0 冷却器 / 1 圧縮機 / 2 熱を出す管 / 3 細い管）、flow: れいばいのつぶ、nums: 番号
function cutaway(t, { hl = -1, flow = 0, nums = 0, pipeO = 1, food = 1 } = {}) {
  let o = `<rect x="0" y="0" width="420" height="640" rx="20" fill="${FR.body}" stroke="${FR.line}" stroke-width="6"/>`;
  o += `<rect x="28" y="28" width="300" height="476" rx="10" fill="${FR.inside}" stroke="#a9c7d6" stroke-width="3"/>`;
  o += `<rect x="-12" y="150" width="14" height="150" rx="7" fill="${FR.metal}"/>`;
  o += `<line x1="28" y1="200" x2="262" y2="200" stroke="#a9c7d6" stroke-width="6"/><line x1="28" y1="352" x2="262" y2="352" stroke="#a9c7d6" stroke-width="6"/>`;
  if (food) o += milk(80, 198, 1.2) + apple(170, 198, 1.1) + cheese(90, 350, 1.15) + pot(190, 350, 1.0) + apple(80, 500, 1.1) + milk(170, 500, 1.1) + flake(140, 110, 18, FR.cold, 4, 0.7) + flake(50, 270, 15, FR.cold, 4, 0.7) + flake(230, 440, 16, FR.cold, 4, 0.7);
  // 機械室
  o += `<rect x="262" y="520" width="140" height="102" rx="10" fill="#e1e5e4" stroke="${FR.line}" stroke-width="3"/>`;
  // 冷却器（フィンのついた管）
  o += `<rect x="274" y="60" width="48" height="254" rx="8" fill="#eef3f5" stroke="${FR.line}" stroke-width="3"/>` + Array.from({ length: 9 }, (_, k) => `<line x1="278" y1="${84 + k * 26}" x2="318" y2="${84 + k * 26}" stroke="${FR.metal}" stroke-width="4"/>`).join('');
  // 管
  o += `<linearGradient id="gCool" gradientUnits="userSpaceOnUse" x1="0" y1="74" x2="0" y2="300"><stop offset="0" stop-color="${FR.cold}"/><stop offset="1" stop-color="${FR.gas}"/></linearGradient>`;
  o += `<linearGradient id="gCond" gradientUnits="userSpaceOnUse" x1="0" y1="574" x2="0" y2="92"><stop offset="0" stop-color="${FR.hot}"/><stop offset="0.45" stop-color="${FR.hot}"/><stop offset="1" stop-color="${FR.liq}"/></linearGradient>`;
  o += `<linearGradient id="gCap" gradientUnits="userSpaceOnUse" x1="460" y1="0" x2="298" y2="0"><stop offset="0" stop-color="${FR.liq}"/><stop offset="1" stop-color="${FR.cold}"/></linearGradient>`;
  const pp = (P, col, w) => `<path d="${ppath(P)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += g(pp(P_COOL, 'url(#gCool)', 14) + pp(P_TOCOMP, FR.gas, 14) + pp(P_COND, 'url(#gCond)', 14) + pp(P_CAP, 'url(#gCap)', 7), { o: pipeO });
  // 圧縮機
  o += `<rect x="286" y="546" width="94" height="58" rx="26" fill="${FR.comp}" stroke="#4d5458" stroke-width="5"/><line x1="300" y1="566" x2="366" y2="566" stroke="#4d5458" stroke-width="4"/><rect x="278" y="602" width="110" height="10" rx="5" fill="#4d5458"/>`;
  // れいばいのつぶ
  if (flow > 0) for (let i = 0; i < 22; i++) { const [x, y, c] = loopAt(i / 22 + t * 0.07); o += `<circle cx="${F1(x)}" cy="${F1(y)}" r="7.5" fill="#fff" stroke="${mix(c, '#000000', 0.35)}" stroke-width="3.5" opacity="${flow}"/>`; }
  const HL = [[258, 44, 80, 284], [270, 532, 126, 88], [420, 80, 80, 508], [286, 34, 190, 32]];
  if (hl >= 0) { const [x, y, w, h] = HL[hl]; o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="none" stroke="${C.yellow}" stroke-width="${9 + 2 * Math.sin(t * 6)}"/>`; }
  if (nums > 0) [[236, 180], [226, 578], [540, 300], [378, 14]].forEach(([x, y], i) => { o += g(`<circle r="26" fill="${[FR.cold, FR.comp, FR.hot, FR.liq][i]}" stroke="#fff" stroke-width="4"/>` + text(0, 2, String(i + 1), { size: 34, w: 900, fill: '#fff' }), { x, y, o: nums }); });
  return o;
}
const roomBg = () => `<rect width="1920" height="1080" fill="${FR.wall}"/><rect y="806" width="1920" height="274" fill="${FR.floor}"/><rect y="798" width="1920" height="12" fill="#cfb38a"/>`;
const windowPic = (x, y) => `<rect x="${x}" y="${y}" width="230" height="150" rx="14" fill="#cfe6f2" stroke="#fff" stroke-width="14"/><line x1="${x + 115}" y1="${y}" x2="${x + 115}" y2="${y + 150}" stroke="#fff" stroke-width="10"/>` + cloud(x + 56, y + 58, 0.22) + cloud(x + 176, y + 116, 0.2);

// 1. つかみ：中はひんやり、横はほんのりあたたかい
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = roomBg() + windowPic(1500, 90);
    const FX = 600, FY = 836, op = eio(prog(t, c0 + 0.2, 0.9)) - eio(prog(t, c1 - 0.5, 0.7)), touch = mid(1, 0.42), wm = eo(prog(t, touch + 0.3, 1.2));
    out += g(fridge3D(t, { open: op, warm: wm * 0.8 }), { x: FX, y: FY });
    out += pop(badge('なかは ひんやり', { fill: FR.cold, size: 46 }), t, c0 + 1.0, 300, 130, { end: c1 + 0.3 }) + g(flake(120, 400, 30) + flake(230, 470, 22) + flake(150, 560, 26), { o: win(t, c0 + 1.2, c1 + 0.3, 0.3) });
    // 大人の手が横にさわる
    const hk = eo(prog(t, touch - 0.7, 0.7)), HX = FX + SIDE_C[0] + 8, HY = FY + SIDE_C[1];
    if (hk > 0) out += g(adultHand(), { x: HX + (1 - hk) * 420, y: HY + (1 - hk) * 60, o: Math.min(1, hk * 3) * (1 - prog(t, cueE(3) + 0.3, 0.3)) });
    out += heatUp(FX + SIDE_C[0], FY - 470, t, { n: 2, gap: 40, o: wm * 0.9 }) + heatUp(FX + SIDE_C[0], FY - 150, t, { n: 2, gap: 40, o: wm * 0.9, ph: 0.4 });
    out += pop(badge('よこは ほんのり あったかい', { fill: FR.hot, size: 44 }), t, touch + 0.6, 1210, 250);
    out += kidShow('S', t, 1700, 850, { s: 0.7, start: 0.4, n: 0, side: 'left', size: 46, look: [-7, -2] });
    // どうして？
    out += g(text(0, 0, '？', { size: 190, w: 900, fill: C.ochre, extra: `stroke="${FR.wall}" stroke-width="18" paint-order="stroke"` }), { x: 1300, y: 500, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 190);
      out += g(`<text x="0" y="0" font-size="104" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">れいぞうこは なかを <tspan fill="${FR.cold}">ひやす</tspan>のに、</text>`, { x: 960, y: 360, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="104" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして そとが <tspan fill="${FR.hot}">あったかい</tspan>の？</text>`, { x: 960, y: 530, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(flake(-250, 0, 44, FR.cold, 9), {}) + g(fridge3D(0, {}), { x: -30, y: 110, s: 0.36 }) + heatUp(200, 40, t, { n: 3, gap: 44, h: 90, w: 10 }), t, t0 + 1.8, 960, 760);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'れいぞうこの よこは、どうして あったかいと おもう？', { size: 54, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', ['なかの ライトが、あつく なって いるから']], ['②', ['なかの ねつを、そとへ はこびだして いるから']], ['③', ['れいぞうこが、こわれかけて いるから']]];
    const cur = curLine(), osz = Math.min(...opts.flatMap(([, L]) => L.map(s => fit(s, 1040, 46))));
    opts.forEach(([n, L], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-80" width="1260" height="160" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 140) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        L.map((s, j) => text(-460, 2 + (j - (L.length - 1) / 2) * (osz + 14), s, { size: osz, w: 700, anchor: 'start' })).join(''), t, cue(i + 1) - 0.2, 820, 384 + i * 166);
    });
    out += pop(g(fridge3D(0, { warm: 0.8 }), { y: 110, s: 0.36 }) + text(120, -90, '？', { size: 120, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1640, 330);
    out += kidShow('B', t, 1730, 850, { s: 0.62, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 580, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 冷たさを作るのではなく、中の熱を外へ運ぶ
const HSTART = [[80, 150], [170, 160], [90, 310], [190, 320], [80, 460], [170, 450], [130, 240], [140, 400]];
SCENES.push({
  id: 'carry',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const CX = 720, CY = 172;
    // つめたさを作る？ ×
    const xk = mid(0, 0.62);
    out += pop(card(470, 330) + flake(0, -40, 74, FR.cold, 12) + text(0, 104, 'つめたさを つくる？', { size: 44, w: 900 }), t, c0 + 0.2, 350, 380);
    out += g(cross(350, 350, 1.5), { o: prog(t, xk, 0.25), s: 1 });
    // 中の熱が、管にのって外へ
    let dots = '';
    const hk = prog(t, c1 + 0.2, 0.4);
    if (hk > 0) HSTART.forEach(([sx, sy], i) => {
      const P = [[sx, sy], [298, 100 + i * 24], [298, 300], ...P_TOCOMP.slice(1), ...P_COND.slice(0, 5 + i), [660, P_COND[4 + i][1]]], L = plen(P);
      const ph = (t - c1 - 0.3 - i * 0.55) / 5.4; if (ph < 0) { dots += heatDot(sx, sy, 13, hk); return; }
      const f = ph % 1, [x, y] = pat(P, f * L), o = Math.min(1, (1 - f) * 6);
      dots += heatDot(x, y, 13, o);
    });
    out += g(cutaway(t, { flow: prog(t, c2 + 0.2, 0.5), pipeO: 1 }) + dots, { x: CX, y: CY });
    out += tag(CX + 150, CY + 250, 350, 660, 'なかの ねつ', win(t, c1 + 0.4, 99, 0.3), { col: FR.hot, size: 44 });
    const ok = prog(t, mid(1, 0.45), 0.4);
    out += heatRight(CX + 520, CY + 300, t, { n: 4, gap: 90, len: 110, w: 10, o: ok });
    out += pop(badge('そとへ', { fill: FR.hot, size: 52, pad: 40 }), t, mid(1, 0.45) + 0.2, 1560, 330);
    out += g(arrow2(1400, 420, 1700, 420, FR.hot, 18), { o: ok });
    out += pop(badge('ねつを はこびだす きかい', { fill: C.accent, size: 42 }), t, mid(1, 0.75), 1560, 540, { end: c2 + 0.2 });
    out += tag(CX + 350, CY + 450, 1560, 640, 'れいばい（はこびやく）', win(t, c2 + 0.5, 99, 0.3), { col: FR.cold, size: 42 });
    out += g(text(0, 0, 'くだの なかを めぐる', { size: 38, w: 900, fill: C.muted }), { x: 1560, y: 730, o: prog(t, c2 + 1.4, 0.4) });
    return out;
  },
});

// 4. 液体から気体に変わるとき、まわりの熱をうばう
const waterDrop = (x, y, s = 1, col = FR.cold, o = 1) => o <= 0.01 ? '' : `<path transform="translate(${F1(x)} ${F1(y)}) scale(${s})" d="M 0 -22 C 10 -6 16 2 16 10 A 16 16 0 0 1 -16 10 C -16 2 -10 -6 0 -22 Z" fill="${col}" stroke="${mix(col, '#000000', 0.25)}" stroke-width="3" opacity="${o}"/>`;
SCENES.push({
  id: 'evap',
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // 管の中：液体（左）→ 気体（右）
    const TX0 = 140, TX1 = 1020, TY = 430, MX = 560;
    out += pop(badge('れいばいの くだの なか', { fill: C.blueUi, size: 40 }), t, 0.3, 580, 210);
    out += `<rect x="${TX0}" y="${TY - 70}" width="${TX1 - TX0}" height="140" rx="70" fill="#eef6fb" stroke="${FR.line}" stroke-width="8"/>`;
    out += `<clipPath id="tubec"><rect x="${TX0 + 6}" y="${TY - 64}" width="${TX1 - TX0 - 12}" height="128" rx="64"/></clipPath><g clip-path="url(#tubec)">`;
    out += `<rect x="${TX0}" y="${TY - 70}" width="${MX - TX0}" height="140" fill="${FR.cold}" opacity="0.85"/><path d="M ${MX} ${TY - 70} q 40 35 0 70 t 0 70 L ${MX - 60} ${TY + 70} L ${MX - 60} ${TY - 70} Z" fill="${FR.cold}" opacity="0.85"/>`;
    for (let i = 0; i < 16; i++) { const f = ((t * 0.22 + i / 16) % 1), x = MX + 30 + f * (TX1 - MX), y = TY + Math.sin(i * 2.4 + f * 5) * 40; out += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${10 + (i % 3) * 3}" fill="${FR.gas}" opacity="${F1(0.9 * Math.sin(f * Math.PI))}"/>`; }
    out += `</g>`;
    out += pop(text(0, 0, 'えきたい', { size: 48, w: 900, fill: '#fff' }), t, c0 + 0.4, 340, TY + 2);
    out += pop(text(0, 0, 'きたい', { size: 48, w: 900, fill: C.blueUi, extra: `stroke="#eef6fb" stroke-width="12" paint-order="stroke"` }), t, mid(0, 0.3), 830, TY + 2);
    out += g(arrow2(470, TY - 120, 650, TY - 120, C.blueUi, 14), { o: prog(t, mid(0, 0.25), 0.3) });
    // まわりの熱がうばわれる
    const hS = mid(0, 0.55);
    for (let i = 0; i < 10; i++) {
      const up = i % 2 === 0, sx = 420 + i * 44 + rnd(i, 71) * 20, sy = up ? TY - 230 - rnd(i, 72) * 40 : TY + 230 + rnd(i, 72) * 40;
      const ph = (t - hS - i * 0.28) / 2.6; if (ph < 0) continue;
      const f = ph % 1, x = lerp(sx, MX + 40 + (i % 5) * 12, eo(f)), y = lerp(sy, TY + (up ? -50 : 50), eo(f));
      out += heatDot(x, y, 13, Math.min(1, f * 5) * (1 - prog(f, 0.82, 0.18)));
    }
    out += pop(badge('まわりの ねつを うばう', { fill: FR.hot, size: 44 }), t, hS + 0.4, 580, 690);
    out += g(flake(250, 610, 24) + flake(900, 250, 24) + flake(930, 620, 20), { o: prog(t, hS + 1.2, 0.5) });
    // プールから上がると、ひんやり
    const pk = prog(t, c1 - 0.2, 0.5);
    if (pk > 0) {
      const PX = 1500, PY = 480;
      let p = card(700, 640, { fill: '#eaf6fb' });
      p += `<clipPath id="poolc"><rect x="-350" y="-320" width="700" height="640" rx="28"/></clipPath><g clip-path="url(#poolc)"><rect x="-350" y="170" width="700" height="150" fill="#58b4e6"/><path d="M -350 170 q 44 -22 88 0 t 88 0 t 88 0 t 88 0 t 88 0 t 88 0 t 88 0 t 88 0 L 350 190 L -350 190 Z" fill="#8fd0f0"/><rect x="-350" y="130" width="330" height="44" fill="#d9cdb8"/><rect x="-350" y="120" width="330" height="14" fill="#efe6d2"/></g>`;
      p += text(0, -264, 'プールから あがると…', { size: 44, w: 900 });
      out += g(p, { x: PX, y: PY, o: pk });
      const KX = PX - 190, KY = PY + 124;
      out += kidShow('B', t, KX, KY, { s: 0.62, start: c1 + 0.1, n: 0, bubble: false, look: [5, -3] });
      // 体についた水が、かわいていく
      const wS = c1 + 0.9;
      for (let i = 0; i < 7; i++) {
        const bx = KX + (i % 2 ? 1 : -1) * (74 + (i % 3) * 12), by = KY - 40 - (i % 4) * 44;
        const ph = (t - wS - i * 0.33) / 2.4; if (ph < 0) continue;
        const f = ph % 1;
        out += waterDrop(bx + Math.sin(f * 6 + i) * 6, by - f * 110, 0.8 * (1 - f * 0.6), '#58b4e6', (1 - f) * pk) + heatDot(bx + 14, by - 20 - f * 130, 8, Math.sin(f * Math.PI) * 0.9 * pk);
      }
      out += pop(badge('みずが かわく とき、ねつを うばう', { fill: C.blueUi, size: 34 }), t, mid(1, 0.45), PX, PY - 196);
      const ht = KY - KID_HEAD.B[0] * 0.62;
      out += talkBubble('B', KX + 280, ht + 56, KX + 52, ht + 70, 44);
    }
    return out;
  },
});

// 5. れいばいは、4つの部品をぐるぐるめぐる
const PARTS = [
  ['れいきゃくき', 'えきたいが きたいに なって、なかを ひやす', FR.cold],
  ['あっしゅくき', 'ぎゅっと おしちぢめて、あつく する', FR.comp],
  ['ねつを だす くだ（よこや うしろ）', 'ねつを へやへ だす', FR.hot],
  ['ほそい くだ', 'とおりぬけて、また れいきゃくきへ', '#c97a1e'],
];
SCENES.push({
  id: 'cycle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const cur = curLine(), hl = cur >= 1 && cur <= 4 ? cur - 1 : -1;
    out += g(cutaway(t, { hl, flow: 1, nums: prog(t, cue(0) + 0.6, 0.4), food: 1 }), { x: 130, y: 172 });
    out += heatRight(690, 300, t, { n: 3, gap: 110, len: 80, w: 9, o: prog(t, cue(3) + 0.4, 0.5), run: 40 });
    out += pop(text(0, 0, 'れいばいは、4つの ぶひんを ぐるぐる', { size: 50, w: 900 }), t, cue(0) + 0.2, 1330, 190);
    PARTS.forEach(([name, desc, col], i) => {
      const st = i === 0 ? cue(1) : cue(i + 1), on = hl === i, y = 300 + i * 142;
      out += pop((on ? `<rect x="-520" y="-70" width="1040" height="140" rx="30" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1020, 122) +
        `<circle cx="-448" cy="0" r="40" fill="${col}"/>` + text(-448, 3, String(i + 1), { size: 48, w: 900, fill: '#fff' }) +
        text(-388, -24, name, { size: 40, w: 900, anchor: 'start', fill: col }) + text(-388, 28, desc, { size: 36, w: 700, anchor: 'start' }), t, st - 0.2, 1330, y);
    });
    out += pop(badge('ぐるぐる くりかえす', { fill: C.ochre, size: 38 }), t, cue(4) + 0.8, 1330, 826);
    return out;
  },
});

// 6. だから横やうしろはあたたかい。50度以上になることも
SCENES.push({
  id: 'side',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = roomBg() + topBadge();
    const FX = 470, FY = 836, more = eo(prog(t, c3 + 0.3, 1.0));
    out += g(fridge3D(t, { warm: 0.55 + 0.45 * more, open: 0 }), { x: FX, y: FY, s: 0.98 });
    const sx = FX + SIDE_C[0] * 0.98;
    out += heatUp(sx, FY - 470, t, { n: 2, gap: 40, h: 70 + 30 * more, w: 8 + 3 * more }) + heatUp(sx, FY - 280, t, { n: 2, gap: 40, ph: 0.3, h: 70 + 30 * more, w: 8 + 3 * more }) + heatUp(sx, FY - 110, t, { n: 2, gap: 40, ph: 0.6, h: 70 + 30 * more, w: 8 + 3 * more });
    out += heatRight(sx + 70, FY - 330, t, { n: 3, gap: 150, len: 80, o: 0.5 + 0.5 * more, w: 8 + 3 * more });
    out += pop(badge('よこや うしろは あたたかい', { fill: FR.hot, size: 44 }), t, c0 + 0.4, 500, 150);
    // 温度計：まわり30度 → 横の面は50度以上になることも
    const a = prog(t, c1 + 0.2, 0.5), b = prog(t, mid(1, 0.4), 0.5), thO = 1 - prog(t, c3 - 0.3, 0.4);
    out += g(g(thermoPic(0.42 * eo(prog(t, c1 + 0.4, 0.8)), '#e9963a'), { s: 0.9 }) + text(0, 124, 'まわり', { size: 40, w: 900 }) + text(0, -278, '30ど', { size: 64, w: 900, fill: '#c97a1e' }), { x: 940, y: 520, o: a * thO });
    out += g(g(thermoPic(0.86 * eo(prog(t, mid(1, 0.4) + 0.2, 1.0)), FR.hot), { s: 0.9 }) + text(0, 124, 'よこの めん', { size: 40, w: 900 }) + text(0, -278, '50ど いじょう', { size: 64, w: 900, fill: FR.hot }), { x: 1290, y: 520, o: b * thO });
    out += g(arrow2(1030, 420, 1200, 420, C.ochre, 14), { o: b * thO });
    out += g(text(0, 0, 'に なる れいぞうこも ある（まわりが 30どの とき）', { size: 32, w: 700, fill: C.muted }), { x: 1120, y: 716, o: prog(t, mid(1, 0.4) + 0.8, 0.4) * thO });
    const KY = 848, ks = 0.58, ht = KY - KID_HEAD.S[0] * ks;
    out += kidShow('S', t, 1720, KY, { s: ks, start: c1 + 0.4, n: 0, bubble: false, look: [-7, -3] });
    out += talkBubble('S', 1660, ht - 88, 1716, ht - 6, 44);
    // 中をたくさん冷やすほど、外はあたたかい
    out += pop(badge('たべものを たくさん いれた とき', { fill: C.blueUi, size: 42 }), t, c3 + 0.3, 1130, 330) + pop(badge('ドアを よく あける とき', { fill: C.blueUi, size: 42 }), t, c3 + 1.1, 1130, 440);
    out += g(arrow2(1130, 500, 1130, 580, C.ochre, 14), { o: prog(t, mid(3, 0.5), 0.3) });
    out += pop(badge('たくさん ひやすほど、そとは あたたかく', { fill: FR.hot, size: 40 }), t, mid(3, 0.55), 1130, 650);
    return out;
  },
});

// 7. 外へ出す熱 ＝ 中から運んだ熱 ＋ モーターの分。ドアを開けっぱなしでも、すずしくならない
const bolt = (s = 1) => g(`<path d="M 8 -44 L -22 6 L -2 6 L -10 44 L 24 -10 L 2 -10 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`, { s });
const dotsRow = (n, t, st, r = 20, gap = 54) => Array.from({ length: n }, (_, i) => pop(heatDot(0, 0, r), t, st + i * 0.12, (i - (n - 1) / 2) * gap, 0)).join('');
SCENES.push({
  id: 'balance',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = roomBg() + topBadge();
    // A たし算
    const aO = 1 - prog(t, c2 - 0.6, 0.4);
    if (aO > 0) {
      let a = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
      a += pop(card(440, 330) + g(cutaway(0, { food: 0 }), { x: -60, y: -150, s: 0.2 }) + text(0, 30, 'なかから はこんだ ねつ', { size: 34, w: 900 }) + g(dotsRow(4, t, 0.5), { y: 104 }), t, 0.3, 330, 420);
      a += pop(text(0, 0, '＋', { size: 110, w: 900, fill: C.ochre }), t, c0 + 0.6, 610, 420);
      a += pop(card(440, 330) + g(bolt(1.3), { y: -86 }) + text(0, 30, 'モーターの でんきの ぶん', { size: 34, w: 900 }) + g(dotsRow(2, t, mid(0, 0.6)), { y: 104 }), t, c0 + 0.9, 890, 420);
      a += pop(text(0, 0, '＝', { size: 110, w: 900, fill: C.ochre }), t, c1 + 0.3, 1170, 420);
      a += pop(`<rect x="-270" y="-185" width="540" height="370" rx="36" fill="none" stroke="${FR.hot}" stroke-width="8"/>` + card(520, 350) + text(0, -96, 'そとへ だす ねつ', { size: 46, w: 900, fill: FR.hot }) + g(dotsRow(6, t, c1 + 0.9), { y: 10 }) + heatUp(0, 150, t, { n: 4, gap: 70, h: 60, w: 8 }), t, c1 + 0.6, 1540, 420);
      a += pop(badge('なかから はこんだ ねつより おおい', { fill: FR.hot, size: 44 }), t, mid(1, 0.5), 1200, 700);
      out += g(a, { o: aO });
    }
    // B ドアを開けっぱなしの部屋
    const bO = prog(t, c2 - 0.3, 0.5);
    if (bO > 0) {
      const FX = 520, FY = 836, up = eo(prog(t, c3 + 0.2, 2.0));
      let b = windowPic(1560, 90);
      b += g(fridge3D(t, { open: eio(prog(t, c2 - 0.1, 0.9)), warm: 0.9 }), { x: FX, y: FY, s: 0.98 });
      const sx = FX + SIDE_C[0] * 0.98;
      b += heatUp(sx, FY - 470, t, { n: 2, gap: 40, h: 96, w: 11 }) + heatUp(sx, FY - 280, t, { n: 2, gap: 40, ph: 0.3, h: 96, w: 11 }) + heatUp(sx, FY - 110, t, { n: 2, gap: 40, ph: 0.6, h: 96, w: 11 });
      b += heatRight(sx + 70, FY - 330, t, { n: 3, gap: 150, len: 100, w: 11 });
      // 中から出る冷たい空気（少し）
      for (let i = 0; i < 3; i++) { const f = ((t * 0.5 + i / 3) % 1); b += `<path d="M ${F1(FX - 60 - f * 70)} ${F1(FY - 330 + i * 40 + f * 60)} q -24 14 -48 0" fill="none" stroke="${FR.cold}" stroke-width="8" stroke-linecap="round" opacity="${F1(Math.sin(f * Math.PI) * 0.8)}"/>`; }
      b += pop(badge('ドアを あけっぱなし', { fill: C.blueUi, size: 42 }), t, c2 + 0.3, 420, 150);
      b += g(g(thermoPic(lerp(0.4, 0.66, up), mix('#e9963a', FR.hot, up)), { s: 0.95 }) + text(0, 130, 'へやの おんど', { size: 40, w: 900 }), { x: 1180, y: 520 });
      b += g(arrow2(1270, 470, 1270, 330, FR.hot, 16), { o: prog(t, c3 + 0.4, 0.4) });
      b += pop(card(560, 150) + flake(-216, 0, 30, FR.cold, 7) + text(-160, 2, 'すずしく ならない', { size: 46, w: 900, anchor: 'start' }), t, mid(2, 0.5), 1580, 420, { end: c3 + 0.2 });
      b += pop(card(600, 150, { fill: '#fdeee6' }) + text(0, 2, 'かえって あたたかく なる', { size: 44, w: 900, fill: FR.hot }), t, c3 + 0.5, 1570, 420);
      b += pop(badge('なかの ねつ ＋ モーターの ぶんが へやへ', { fill: FR.hot, size: 34 }), t, c3 + 1.4, 1400, 730);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. 熱がこもらないように、すきまをあけて置く
SCENES.push({
  id: 'gap',
  draw(t) {
    const c0 = cue(0);
    let out = roomBg() + topBadge();
    const L = 600, R = 920, T = 250, B = 836;
    // たなと食器だな
    out += `<rect x="270" y="340" width="270" height="${B - 340}" rx="10" fill="#d9b98a" stroke="#b8946a" stroke-width="6"/><rect x="300" y="380" width="210" height="190" rx="8" fill="#e9cfa6"/><rect x="300" y="600" width="210" height="190" rx="8" fill="#e9cfa6"/><circle cx="490" cy="475" r="9" fill="#b8946a"/><circle cx="490" cy="695" r="9" fill="#b8946a"/>`;
    out += `<rect x="980" y="420" width="290" height="${B - 420}" rx="10" fill="#d9b98a" stroke="#b8946a" stroke-width="6"/><rect x="1010" y="456" width="230" height="150" rx="8" fill="#e9cfa6"/><rect x="1010" y="636" width="230" height="160" rx="8" fill="#e9cfa6"/>`;
    out += `<rect x="500" y="150" width="520" height="40" rx="8" fill="#d9b98a" stroke="#b8946a" stroke-width="6"/>`;
    // 冷蔵庫（まえから）
    out += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" rx="16" fill="${FR.body}" stroke="${FR.line}" stroke-width="6"/><line x1="${L}" y1="${T + 360}" x2="${R}" y2="${T + 360}" stroke="${FR.line}" stroke-width="6"/><rect x="${R - 44}" y="${T + 70}" width="14" height="130" rx="7" fill="${FR.metal}"/><rect x="${R - 44}" y="${T + 394}" width="14" height="96" rx="7" fill="${FR.metal}"/>`;
    // すきまを上る熱
    const hk = prog(t, c0 + 0.4, 0.5);
    [0, 1, 2].forEach(i => { out += heatUp(570, 760 - i * 170, t, { n: 1, h: 90, w: 10, o: hk, ph: i * 0.3, rise: 90 }) + heatUp(950, 760 - i * 170, t, { n: 1, h: 90, w: 10, o: hk, ph: i * 0.3 + 0.15, rise: 90 }); });
    out += heatUp(760, 236, t, { n: 3, gap: 90, h: 44, w: 9, o: hk, rise: 20 });
    // すきまのしるし
    const gk = prog(t, mid(0, 0.55), 0.4);
    const dbl = (x1, x2, y) => arrow2((x1 + x2) / 2, y, x1 + 3, y, C.blueUi, 7) + arrow2((x1 + x2) / 2, y, x2 - 3, y, C.blueUi, 7);
    out += g(dbl(542, 598, 300) + dbl(922, 978, 380) + arrow2(760, 220, 760, 194, C.blueUi, 7) + arrow2(760, 220, 760, 247, C.blueUi, 7), { o: gk });
    out += tag(570, 300, 170, 250, 'すきま', gk, { col: C.blueUi, size: 46 }) + tag(950, 380, 1500, 340, 'すきま', gk, { col: C.blueUi, size: 46 }) + tag(785, 220, 1500, 180, 'うえにも すきま', gk, { col: C.blueUi, size: 42 });
    out += pop(badge('ねつが こもらない ように', { fill: FR.hot, size: 44 }), t, c0 + 1.0, 1590, 520);
    out += g(text(0, 0, 'ひつような すきまは、', { size: 32, w: 700, fill: C.muted }) + text(0, 44, 'れいぞうこに よって ちがう', { size: 32, w: 700, fill: C.muted }), { x: 1590, y: 630, o: prog(t, mid(0, 0.7), 0.4) });
    return out;
  },
});

// 9. 正解 と みてみよう
const handIcon = `<ellipse cx="0" cy="4" rx="20" ry="22" fill="${FR.skin}" stroke="${C.ink}" stroke-width="4"/><path d="M -12 -14 V -30 M -4 -17 V -34 M 4 -17 V -34 M 12 -14 V -30" stroke="${FR.skin}" stroke-width="9" stroke-linecap="round"/>`;
const doorIcon = `<rect x="-22" y="-30" width="44" height="60" rx="6" fill="${FR.body}" stroke="${FR.line}" stroke-width="5"/><line x1="-22" y1="6" x2="22" y2="6" stroke="${FR.line}" stroke-width="5"/><rect x="10" y="-20" width="5" height="16" rx="2.5" fill="${FR.metal}"/>`;
const gapIcon = `<rect x="-12" y="-28" width="24" height="56" rx="4" fill="${FR.body}" stroke="${FR.line}" stroke-width="5"/><path d="M -30 -20 V 28 M 30 -20 V 28" stroke="#b8946a" stroke-width="7" stroke-linecap="round"/>`;
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 350, NX = -530;
      let a = pop(card(1240, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.accent}"/>` + text(NX, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, 'なかの ねつを、そとへ はこびだして いるから', { size: fit('なかの ねつを、そとへ はこびだして いるから', 1000, 50, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += flowRow([['なかの ねつ', FR.hot], ['れいばいが はこぶ', FR.cold], ['よこや うしろから へやへ', '#c97a1e']], t, 960, 600, { start: 2.4, step: 0.9, size: 40, gap: 70 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [qm, 'よこと へやの かべ、どっちが あたたかい？', C.ink, cue(1)],
        [g(handIcon, { s: 0.9 }), 'おとなに そっと さわって もらって くらべる', C.ink, cue(2)],
        [g(gapIcon, { s: 0.9 }), 'うえや よこに、すきまは あるかな？', C.ink, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'うしろや したの きかいに、てを いれない', C.red, cue(4)],
        [g(doorIcon, { s: 0.9 }), 'ドアは あけたら、すぐ しめる', C.accent, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 880, 42, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 310 + i * 100); });
      // 冷蔵庫の横 と 部屋のかべ
      const PX = 1500, PY = 500;
      let p = card(700, 560, { fill: FR.wall }) + `<clipPath id="lkc"><rect x="-350" y="-280" width="700" height="560" rx="28"/></clipPath><g clip-path="url(#lkc)"><rect x="-350" y="200" width="700" height="80" fill="${FR.floor}"/>`;
      p += g(fridge3D(t, { warm: 0.8 }), { x: -120, y: 232, s: 0.66 }) + `</g>`;
      p += heatUp(-120 + SIDE_C[0] * 0.66, 232 - 300, t, { n: 2, gap: 30, h: 56, w: 7 });
      p += g(text(0, 0, '？', { size: 80, w: 900, fill: C.ochre }), { x: 96, y: -150 }) + g(text(0, 0, '？', { size: 80, w: 900, fill: C.ochre }), { x: 250, y: -40 });
      p += text(-60, -226, 'れいぞうこの よこ', { size: 36, w: 900, fill: FR.hot }) + text(236, -150, 'かべ', { size: 40, w: 900, fill: C.muted });
      p += `<line x1="170" y1="-110" x2="310" y2="-110" stroke="#d8c3a2" stroke-width="5" stroke-dasharray="10 10"/>`;
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
    out += g(text(0, 0, 'くわしくは サイトの「れいぞうこ」の ページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 778, o: prog(t, 2.0, 0.5) });
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

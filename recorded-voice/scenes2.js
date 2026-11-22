
// みのまわり図鑑 動画「ろくおんした じぶんの こえは どうして ちがって きこえるの？」（こえ）
// 出どころ：everyday-trivia trivia/voice-recorded.md（絵の見本：assets/figures-voice.js、メモ：ideas/notes/recorded-voice.md）
// 色の約束：くうきの みち＝あお、ほねの みち＝オレンジ、うずまき＝むらさき

// ---------- こえの道具 ----------
const VR = {
  air: '#3f8fd8', airDk: '#2a6fb5', airSoft: '#e3f0fa', bone: '#f08a2e', boneDk: '#c96a14', boneSoft: '#fde8d2',
  coch: '#8a6fd0', cochDk: '#6a4fb5', cochSoft: '#e9e2f8', skull: '#f3e2c4', skullDk: '#d6bd94', drum: '#e9a0a0', drumDk: '#b96a6a',
  wall: '#f7edda', floor: '#dcbc90', floorDk: '#c9a676',
};
const rad = a => a * Math.PI / 180;
// 指し線つきのラベル（指す点が x, y。ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 40 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 矢じり（先が x, y。a は進む向き・ラジアン）
const arrowHead = (x, y, a, col, h = 30) =>
  `<path d="M ${x + Math.cos(a) * h * 0.45} ${y + Math.sin(a) * h * 0.45} L ${x - Math.cos(a - 0.55) * h} ${y - Math.sin(a - 0.55) * h} L ${x - Math.cos(a + 0.55) * h} ${y - Math.sin(a + 0.55) * h} Z" fill="${col}"/>`;
// 道を k（0〜1）まで描く。描きおわったら、白い点線が進む向きへ流れる
function road(d, col, w, k = 1, { o = 1, flow = true, speed = 26 } = {}) {
  if (k <= 0 || o <= 0) return '';
  let s = `<path d="${d}" pathLength="100" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(100 * k).toFixed(2)} 300"/>`;
  if (flow && k >= 1) s += `<path d="${d}" pathLength="100" fill="none" stroke="#fff" stroke-width="${w * 0.36}" stroke-linecap="round" stroke-dasharray="2.2 7.8" stroke-dashoffset="${(-NOW.t * speed).toFixed(2)}" opacity="0.85"/>`;
  return `<g opacity="${o}">${s}</g>`;
}
// 折れ線にそった ギザギザ（ほねの ふるえ）
function zigPoly(pts, amp = 12, step = 26) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`, sgn = 1, carry = step;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    let p = carry;
    while (p < L - 4) { d += ` L ${(x1 + ux * p - uy * amp * sgn).toFixed(1)} ${(y1 + uy * p + ux * amp * sgn).toFixed(1)}`; sgn = -sgn; p += step; }
    carry = p - L;
  }
  const [xe, ye] = pts[pts.length - 1];
  return d + ` L ${xe} ${ye}`;
}
function zig(pts, k = 1, { amp = 12, step = 26, col = VR.bone, w = 10, o = 1, head = 28 } = {}) {
  if (k <= 0 || o <= 0) return '';
  const a2 = amp * (1 + 0.22 * Math.sin(NOW.t * 31)), [xa, ya] = pts[pts.length - 2], [xe, ye] = pts[pts.length - 1], ang = Math.atan2(ye - ya, xe - xa);
  const dd = zigPoly(pts.slice(0, -1).concat([[xe - Math.cos(ang) * head * 0.7, ye - Math.sin(ang) * head * 0.7]]), a2, step);
  return `<g opacity="${o}"><path d="${dd}" pathLength="100" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(100 * k).toFixed(2)} 300"/>` +
    (head && k >= 0.97 ? arrowHead(xe, ye, ang, col, head) : '') + `</g>`;
}
// 音の波（弧）。まん中 (x, y)、角度 a0〜a1（度。0=右、90=下）
function arcs(x, y, n, r0, gap, a0, a1, col = VR.air, sw = 8, o = 1, ph = 0) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const r = r0 + (i + ph) * gap, p = a => [x + r * Math.cos(rad(a)), y + r * Math.sin(rad(a))], [x1, y1] = p(a0), [x2, y2] = p(a1);
    s += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${(o * Math.min(1, (i + ph) * 1.5) * (1 - (i + ph) / (n + 0.2))).toFixed(2)}"/>`;
  }
  return s;
}
// なみ線（x0 から x1 まで。len=なみの長さ、amp=高さ）。ph で右へ進む
function wavy(x0, x1, y, len, amp, col, w = 9, ph = 0, o = 1) {
  if (o <= 0 || x1 - x0 < 4) return '';
  let d = '';
  for (let x = x0; x <= x1; x += 4) d += `${d ? 'L' : 'M'} ${x} ${(y + Math.sin((x / len - ph) * Math.PI * 2) * amp).toFixed(1)} `;
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
}
// うずまき（かぎゅう）。まん中 (0,0)、大きさ r
function spiralG(r, col = VR.coch, sw = 0.28) {
  const pts = [];
  for (let i = 0; i <= 48; i++) { const k = i / 48, a = -Math.PI * 0.15 - k * Math.PI * 2 * 2.2, rr = r * (1 - 0.88 * k); pts.push(`${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`); }
  return `<path d="M ${pts.join(' L ')}" fill="none" stroke="${col}" stroke-width="${r * sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// よこむきの あたま（右むき）。(x, y) が あたまの まん中、s=1 で 高さ およそ 96。
//   みみは (-10, 2)、うずまきは (6, 4)、くちは (40, 21)。flip で左むき。
const PH_FACE = 'M-34-4C-36-30-16-46 6-46C28-46 42-30 42-12L48 0L42 4C42 10 41 14 37 16C39 22 36 28 28 30L16 32L14 46H-16L-18 28C-28 20-33 10-34-4Z';
// （CH は characters.js で あとから 決まるので、使うときに 読む）
const phWho = who => ({
  S: { hair: CH.hairG, shirt: CH.dress }, B: { hair: CH.hairB, shirt: CH.shirtB },
  M: { hair: '#6b4630', shirt: '#d48aa0' }, F: { hair: '#8a5f3c', shirt: '#6f9fd0' },
}[who]);
function phead(x, y, s, { who = 'S', talk = 0, inner = false, glow = 0, glowCol = VR.coch, hand = 0, skull = 0, eyes = 'open', mouth = 'smile', flip = false, body = true, o = 1 } = {}) {
  if (o <= 0) return '';
  const P = phWho(who), T = NOW.t, ln = `stroke="${CH.line}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"`;
  const blink = [1.1, 4.3, 7.4, 10.9, 14.2, 17.7, 21.3, 25.2, 29.4, 33.3].some(b => T > b && T < b + 0.13);
  let q = '';
  if (body) q += `<path d="M-46 84 C-46 58 -30 47 -16 45 L14 45 C32 47 46 60 46 84 Z" fill="${P.shirt}" ${ln}/>`;
  if (who === 'S') q += `<path d="M-28-30C-58-36-70-4-58 26C-56 6-48-8-30-12Z" fill="${P.hair}" ${ln}/>`;
  if (who === 'M') q += `<path d="M-34-10C-44 14-36 34-18 38L-16 2Z" fill="${P.hair}" ${ln}/>`;
  q += `<path d="${PH_FACE}" fill="${CH.skin}" ${ln}/>`;
  q += `<path d="M-36-2C-40-34-14-50 8-50C30-50 46-34 42-16C34-30 18-36 2-34C-12-32-20-20-22-2Z" fill="${P.hair}" ${ln}/>`;
  if (who === 'S') q += `<ellipse cx="-29" cy="-27" rx="3.4" ry="5" fill="${CH.clip}" transform="rotate(-40 -29 -27)"/>`;
  if (who === 'B') q += `<path d="M2-50q4-8 12-6q-5 2-4 7Z" fill="${P.hair}" ${ln}/>`;
  q += `<circle cx="24" cy="6" r="5.5" fill="${CH.cheek}" opacity="0.6"/>`;
  const em = blink ? 'closed' : eyes;
  if (em === 'closed') q += `<path d="M23-11q3.5 2.5 7 0" fill="none" ${ln}/>`;
  else if (em === 'smile') q += `<path d="M23-10q3.5-4.5 7 0" fill="none" ${ln}/>`;
  else q += `<ellipse cx="27" cy="-12" rx="${em === 'wide' ? 3.3 : 2.6}" ry="${em === 'wide' ? 4.2 : 3.4}" fill="${CH.line}"/><circle cx="28" cy="-13.4" r="0.9" fill="#fff"/>`;
  if (talk > 0) q += `<ellipse cx="38.5" cy="21" rx="4.2" ry="${(1.6 + 2.6 * Math.abs(Math.sin(T * 11) * Math.sin(T * 4.7))).toFixed(2)}" fill="#8e3b33"/>`;
  else if (mouth === 'o') q += `<ellipse cx="38.5" cy="21" rx="3.2" ry="4.2" fill="#8e3b33"/>`;
  else if (mouth === 'flat') q += `<path d="M33 21h6" fill="none" ${ln}/>`;
  else q += `<path d="M32 19.5q4 3.5 7.5-0.5" fill="none" ${ln}/>`;
  if (skull > 0) q += `<path d="M-28-6C-28-28-12-40 6-40C24-40 36-28 36-12C36 6 26 20 8 22C-12 24-28 14-28-6Z" fill="${VR.skull}" fill-opacity="${0.55 * skull}" stroke="${VR.skullDk}" stroke-width="1.6" stroke-dasharray="3 3" opacity="${skull}"/>`;
  if (inner) q += (glow > 0 ? `<circle cx="6" cy="4" r="13" fill="${glowCol}" opacity="${0.55 * glow}" filter="url(#soft)"/>` : '') + `<circle cx="6" cy="4" r="8.6" fill="${VR.cochSoft}"/><g transform="translate(6 4)">${spiralG(7.6, VR.coch, 0.3)}</g>`;
  q += `<ellipse cx="-10" cy="2" rx="6" ry="9" fill="${CH.skin}" ${ln}/><path d="M-11-3q4 5 0 10" fill="none" ${ln}/>`;
  if (hand > 0) {
    const hy = (1 - eo(hand)) * 46;
    q += `<g transform="translate(0 ${hy})" opacity="${Math.min(1, hand * 3)}"><path d="M-12 12L-4 66" fill="none" stroke="${CH.line}" stroke-width="14.4" stroke-linecap="round"/><path d="M-12 12L-4 66" fill="none" stroke="${CH.skin}" stroke-width="11" stroke-linecap="round"/>` +
      `<path d="M-7 46L-4 66" fill="none" stroke="${P.shirt}" stroke-width="12.4" stroke-linecap="round"/>` +
      `<ellipse cx="-10" cy="2" rx="12.5" ry="15.5" fill="${CH.skin}" ${ln}/><path d="M-19-6q9-4 17 0M-20 2q10-4 19 0M-19 10q9-4 17 0" fill="none" ${ln}/></g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" opacity="${o}">${q}</g>`;
}
// あたまの上の点（画面の座標）
const hp = (x, y, s, ux, uy, flip = false) => [x + (flip ? -1 : 1) * ux * s, y + uy * s];
// くちから出て、ぐるっと みみに入る 青い道
function loopD(x, y, s, flip = false) {
  const p = (ux, uy) => hp(x, y, s, ux, uy, flip).map(v => v.toFixed(1)).join(' ');
  return `M ${p(47, 22)} C ${p(84, 26)} ${p(86, -74)} ${p(10, -70)} C ${p(-46, -68)} ${p(-56, -22)} ${p(-27, -4)}`;
}
function airLoop(x, y, s, k, { flip = false, o = 1, w = 11, col = VR.air } = {}) {
  if (k <= 0 || o <= 0) return '';
  const [ex, ey] = hp(x, y, s, -27, -4, flip), ang = flip ? Math.PI - Math.atan2(18, 29) : Math.atan2(18, 29);
  return road(loopD(x, y, s, flip), col, w, k, { o }) + (k >= 0.97 ? g(arrowHead(ex + Math.cos(ang) * 8, ey + Math.sin(ang) * 8, ang, col, w * 2.6), { o }) : '');
}
// あたまの中の オレンジの道（くち・のどから うずまきへ）
function boneIn(x, y, s, k, { flip = false, o = 1, w = 9 } = {}) {
  if (k <= 0 || o <= 0) return '';
  const a = hp(x, y, s, 31, 24, flip), b = hp(x, y, s, 12, 9.5, flip), c = hp(x, y, s, 3, 40, flip), d = hp(x, y, s, 5.4, 14, flip);
  return zig([a, b], k, { amp: s * 1.5, step: s * 3.4, w, o, head: w * 2.4 }) + zig([c, d], k, { amp: s * 1.5, step: s * 3.4, w, o, head: w * 2.4 });
}
// スマホ（150 × 280）。mode: 'rec' ろくおん中 / 'play' さいせい中 / 'wave' 青い波だけ
function phoneG(x, y, s, mode, { o = 1, r = 0, thin = true } = {}) {
  if (o <= 0) return '';
  const T = NOW.t;
  let q = `<rect x="-75" y="-140" width="150" height="280" rx="26" fill="${C.housing}"/><rect x="-63" y="-118" width="126" height="226" rx="10" fill="#fdfdf6"/><rect x="-16" y="119" width="32" height="7" rx="3.5" fill="#8a9096"/><circle cx="0" cy="-129" r="4" fill="#5a6066"/>`;
  if (mode === 'rec') {
    q += `<circle cx="0" cy="-62" r="24" fill="${C.red}" opacity="${0.6 + 0.4 * Math.abs(Math.sin(T * 3.2))}"/>` + text(0, -8, 'ろくおん', { size: 22, w: 900, fill: C.red, ls: 0 });
    for (let i = 0; i < 7; i++) { const h = 10 + 34 * Math.abs(Math.sin(T * 7 + i * 1.9) * Math.sin(T * 3.1 + i)); q += `<rect x="${-48 + i * 14.5}" y="${52 - h / 2}" width="9" height="${h}" rx="4.5" fill="${VR.air}"/>`; }
  } else {
    if (mode === 'play') q += `<circle cx="0" cy="-62" r="26" fill="${VR.air}"/><path d="M -8 -75 L 13 -62 L -8 -49 Z" fill="#fff"/>` + text(0, -8, 'さいせい', { size: 22, w: 900, fill: VR.airDk, ls: 0 });
    else q += text(0, -60, 'ろくおんの', { size: 20, w: 900, fill: VR.airDk, ls: 0 }) + text(0, -32, 'こえ', { size: 24, w: 900, fill: VR.airDk, ls: 0 });
    q += wavy(-50, 50, 52, 26, thin ? 13 : 22, VR.air, 6, T * 1.6);
  }
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${o}">${q}</g>`;
}
// 文字が はばに 入るように、大きさを決める
const fitSize = (str, size, maxW, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
// ふちつきの 大きな文字
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 14 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
// へやの かべと ゆか
const roomBg = () => `<rect width="1920" height="1080" fill="${VR.wall}"/><rect x="0" y="870" width="1920" height="210" fill="${VR.floor}"/><rect x="0" y="862" width="1920" height="16" fill="${VR.floorDk}"/>`;

// 1. つかみ：スマホで 声を ろくおんして、きいてみる
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, tP = c0 + d0 * 0.6, c1 = cue(1), c3 = cue(3);
    let out = roomBg();
    // まど と たな
    out += `<rect x="120" y="150" width="330" height="270" rx="14" fill="#cfe6f5" stroke="#b08455" stroke-width="16"/><line x1="285" y1="150" x2="285" y2="420" stroke="#b08455" stroke-width="10"/><line x1="120" y1="285" x2="450" y2="285" stroke="#b08455" stroke-width="10"/>` + cloud(240, 240, 0.45, '#fff', 0.9);
    out += `<rect x="1680" y="130" width="170" height="130" rx="10" fill="#fffaf0" stroke="#b08455" stroke-width="12"/><circle cx="1728" cy="182" r="18" fill="${C.yellow}"/><path d="M 1700 248 L 1760 196 L 1800 228 L 1822 212 L 1838 248 Z" fill="#7fb77e"/>`;
    out += `<rect x="1790" y="800" width="64" height="70" rx="8" fill="#c98a5a"/><circle cx="1822" cy="760" r="54" fill="#7fb77e"/><circle cx="1786" cy="790" r="30" fill="#6aa76a"/><circle cx="1858" cy="784" r="32" fill="#6aa76a"/>`;
    // スマホ（さいごは 右へ よける）
    const mv = eio(prog(t, c3 - 0.1, 0.7));
    const PX = lerp(1180, 1650, mv), PY = lerp(470, 590, mv), PS = lerp(1.75, 1.3, mv), play = t >= tP;
    const sw = Math.sin(t * 2) * 2;
    out += pop(phoneG(0, 0, PS, play ? 'play' : 'rec', { r: sw }), t, 0.3, PX, PY);
    // ろくおん：おとうとの「あー」が スマホへ
    const kx = 420, ky = 890, ks = 0.62, mouth = [kx + 40, ky - 242 * ks];
    const recO = win(t, c0 + 0.3, tP - 0.1, 0.25);
    if (recO > 0) {
      out += arcs(mouth[0], mouth[1] - 20, 5, 60, 110, -42, 2, VR.air, 10, recO, (t * 1.3) % 1);
      out += big(720, 560 + Math.sin(t * 5) * 6, 'あー', 110, VR.air, { o: recO });
    }
    // さいせい：スマホから 声が出る
    const plO = win(t, tP + 0.1, c3 - 0.1, 0.3);
    if (plO > 0) {
      out += arcs(PX - 110, PY, 4, 60, 80, 140, 220, VR.air, 10, plO, (t * 1.3) % 1) + arcs(PX + 110, PY, 4, 60, 80, -40, 40, VR.air, 10, plO, (t * 1.3) % 1);
      out += big(PX + 10, 150 + Math.sin(t * 5) * 5, 'あー', 84, VR.airDk, { o: plO, r: -4 });
    }
    // あれ？
    [[820, 300, 0, -10], [1560, 330, 0.25, 12]].forEach(([x, y, dl, r]) => { out += pop(big(0, 0, '？', 150, C.ochre, { r }), t, c1 + 0.2 + dl, x, y + Math.sin(t * 3 + dl * 9) * 8, { end: c3 - 0.1 }); });
    // 子どもたち
    const eyes = t > c1 ? 'wide' : 'open';
    out += kidShow('S', t, 200, ky, { s: ks, start: 0, n: 1, eyes, look: [8, -3], bubble: false });
    out += kidShow('B', t, kx, ky, { s: ks, start: 0, n: 0, eyes, look: [8, -3], mouth: t > c0 + 0.3 && t < tP ? 'open' : null });
    // いつもの こえ ≠ ろくおんの こえ ？
    out += pop(card(1040, 200) + text(-262, 4, 'いつもの こえ', { size: 50, w: 900 }) + text(-46, 2, '≠', { size: 92, w: 900, fill: C.red }) +
      text(192, 4, 'ろくおんの こえ', { size: 50, w: 900, fill: VR.airDk }) + text(450, 4, '？', { size: 88, w: 900, fill: C.ochre }), t, c3 + 0.6, 950, 420, { end: cueE(3) + 0.6 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${VR.airDk}">ろくおん</tspan>した じぶんの こえは</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${VR.boneDk}">ちがって</tspan> きこえるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(phoneG(-170, 0, 0.62, 'play') + arcs(-110, 0, 3, 40, 44, -35, 35, VR.air, 9, 1, 0.4) + text(120, 0, '？', { size: 130, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 810);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと おもう？', { size: 84, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'マイクが、こえを たかく かえて しまう'], ['②', 'スピーカーが ちいさくて、こえが ほそく なる'], ['③', 'いつもの こえには、ほねを とおる おとが まざる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: fitSize(s, 50, 990), w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 900, 390 + i * 168);
    });
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 耳の中の だんめん図（1100 × 620）。左が そと、右が あたまの 中
function earCut(t, { air = 0, drum = 0, bones = [0, 0, 0], pulse = 0, glow = 0, glowCol = VR.coch, airDim = 1, boneK = 0, boneO = 0, buzz = 0 } = {}) {
  const W = 1100, H = 620;
  let o = `<clipPath id="ecClip"><rect width="${W}" height="${H}" rx="36"/></clipPath><g clip-path="url(#ecClip)">`;
  o += `<rect width="${W}" height="${H}" fill="${VR.skull}"/>`;
  for (let i = 0; i < 34; i++) o += `<circle cx="${(250 + rnd(i, 41) * 830).toFixed(0)}" cy="${(20 + rnd(i, 42) * 580).toFixed(0)}" r="${(5 + rnd(i, 43) * 6).toFixed(1)}" fill="${VR.skullDk}" opacity="0.3"/>`;
  // ほねの ふるえ
  if (buzz > 0) for (let i = 0; i < 9; i++) {
    const top = i < 3, x = (top ? 290 + i * 190 : 270 + (i % 3) * 290) + rnd(i, 44) * 50, y = [40, 470, 566][Math.floor(i / 3)] + rnd(i, 45) * 20;
    o += wavy(x, x + 72, y, 24, 8 + 3 * Math.sin(t * 9 + i), VR.bone, 6, t * 3 + i * 0.37, buzz * 0.75);
  }
  o += `<rect width="172" height="${H}" fill="${VR.airSoft}"/><rect x="172" y="0" width="46" height="${H}" fill="${CH.skin}"/><line x1="218" y1="0" x2="218" y2="${H}" stroke="${CH.skinShade}" stroke-width="5"/>`;
  // そとの みみ
  o += `<path d="M 186 226 C 172 166 150 128 104 126 C 50 126 28 200 38 300 C 46 392 86 478 138 474 C 178 470 172 414 186 376 Z" fill="${CH.skin}" stroke="${CH.line}" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<path d="M 150 244 C 132 190 90 196 88 284 C 88 352 106 400 134 408" fill="none" stroke="${CH.skinShade}" stroke-width="8" stroke-linecap="round"/>`;
  // みみの あな
  o += `<path d="M 150 256 C 300 244 430 262 566 254 L 566 346 C 430 338 300 354 150 346 Z" fill="${VR.airSoft}"/>`;
  o += `<path d="M 160 256 C 300 244 430 262 566 254 M 160 346 C 300 354 430 338 566 346" fill="none" stroke="${CH.skinShade}" stroke-width="8" stroke-linecap="round"/>`;
  // なかの へや と うずまき
  o += `<path d="M 566 250 C 620 208 736 222 758 284 C 770 326 742 372 680 376 C 624 380 584 364 566 350 Z" fill="#fcf6ea" stroke="${VR.skullDk}" stroke-width="6"/>`;
  if (glow > 0) o += `<circle cx="890" cy="306" r="150" fill="${glowCol}" opacity="${(0.55 * glow).toFixed(2)}" filter="url(#glow)"/>`;
  o += `<path d="M 742 280 C 772 274 792 262 812 248 L 812 366 C 792 352 772 338 742 330 Z" fill="${VR.cochSoft}" stroke="${VR.coch}" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<circle cx="890" cy="306" r="100" fill="${VR.cochSoft}" stroke="${VR.coch}" stroke-width="10"/><g transform="translate(890 306)">${spiralG(74, VR.coch, 0.2)}</g>`;
  // こまく
  const dx = Math.sin(t * 38) * 6 * drum;
  o += `<ellipse cx="${(566 + dx).toFixed(1)}" cy="300" rx="10" ry="50" fill="${VR.drum}" stroke="${VR.drumDk}" stroke-width="4"/>`;
  if (drum > 0) o += [-1, 1].map(sd => `<path d="M ${566 + sd * 28} 266 q ${sd * 9} 34 0 68" fill="none" stroke="${VR.drumDk}" stroke-width="5" stroke-linecap="round" opacity="${(0.75 * drum * Math.abs(Math.sin(t * 9))).toFixed(2)}"/>`).join('');
  // 3つの ちいさな ほね
  [[586, 298, 632, 258], [632, 258, 676, 300], [676, 300, 726, 303]].forEach(([x1, y1, x2, y2], i) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, r = Math.sin(t * 34 + i * 1.4) * 8 * bones[i];
    o += `<g transform="rotate(${r.toFixed(2)} ${mx} ${my})"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9a8560" stroke-width="27" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fffdf2" stroke-width="18" stroke-linecap="round"/>` +
      (i === 2 ? `<ellipse cx="735" cy="303" rx="9" ry="24" fill="#fffdf2" stroke="#9a8560" stroke-width="5"/>` : '') + `</g>`;
  });
  // あおい ふるえ（くうきの みち）
  if (air > 0) for (let i = 0; i < 6; i++) {
    const f = (i + (t * 0.9) % 1) / 6, x = 16 + f * 532, h = lerp(64, 30, clamp((x - 120) / 70)), ed = Math.min(1, f * 5, (1 - f) * 8);
    o += `<path d="M ${x.toFixed(1)} ${300 - h} Q ${(x + h * 0.42).toFixed(1)} 300 ${x.toFixed(1)} ${300 + h}" fill="none" stroke="${VR.air}" stroke-width="9" stroke-linecap="round" opacity="${(air * airDim * ed).toFixed(2)}"/>`;
  }
  if (pulse > 0) {
    const R = [[578, 300], [632, 258], [676, 300], [736, 303], [806, 306]];
    for (let i = 0; i < 3; i++) {
      const f = ((t * 0.8 + i / 3) % 1) * (R.length - 1), j = Math.min(R.length - 2, Math.floor(f)), u = f - j;
      o += `<circle cx="${lerp(R[j][0], R[j + 1][0], u).toFixed(1)}" cy="${lerp(R[j][1], R[j + 1][1], u).toFixed(1)}" r="11" fill="${VR.air}" stroke="#fff" stroke-width="4" opacity="${(pulse * airDim).toFixed(2)}"/>`;
    }
  }
  // オレンジの ふるえ（ほねの みち）
  o += zig([[250, 112], [600, 96], [772, 132], [838, 236]], boneK, { amp: 16, step: 30, w: 12, o: boneO, head: 34 });
  o += `</g><rect width="${W}" height="${H}" rx="36" fill="none" stroke="${VR.skullDk}" stroke-width="8"/>`;
  return o;
}

// 3. おとが とどく みちは 2つ（くうきの みち・ほねの みち）
SCENES.push({
  id: 'paths',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const PX = 740, PY = 200, HX = 350, HY = 500, HS = 4.3, ear = hp(HX, HY, HS, -10, 2);
    const bn = prog(t, c(5) - 0.2, 0.5);  // ほねの みちの 番
    // みだし
    out += g(text(0, 0, 'おとが とどく みちは 2つ', { size: 60, w: 900 }), { x: 1290, y: 116, o: win(t, c(0) + 0.2, c(1) - 0.1, 0.3) });
    out += g(pop(badge('くうきの みち', { fill: VR.air, size: 48, pad: 42 }), t, c(1), 1070, 116), { o: lerp(1, 0.4, bn) });
    out += pop(badge('ほねの みち', { fill: VR.bone, size: 48, pad: 42 }), t, c(5), 1540, 116);
    // どこを 大きく 見ているか
    const pO = prog(t, 0.2, 0.4);
    out += g(`<line x1="${ear[0]}" y1="${ear[1] - 56}" x2="${PX}" y2="${PY + 34}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/><line x1="${ear[0]}" y1="${ear[1] + 56}" x2="${PX}" y2="${PY + 586}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/>`, { o: pO });
    // ほかの人の声・まわりの音（あたまの 左から）
    const oth = win(t, c(4) + 0.2, c(5) - 0.2, 0.3);
    out += arcs(40, ear[1], 4, 50, 56, -32, 32, VR.air, 9, oth, (t * 1.1) % 1);
    const glA = prog(t, c(3) + d(3) * 0.62, 0.5) * (1 - bn), glB = prog(t, c(6) + 0.3 + d(6) * 0.55, 0.5);
    out += phead(HX, HY, HS, { who: 'S', inner: true, glow: Math.max(glA, glB), glowCol: bn > 0.5 ? VR.bone : VR.coch, skull: bn });
    if (bn > 0) for (let i = 0; i < 3; i++) out += wavy(HX - 150 + i * 100, HX - 86 + i * 100, HY - 240 - (i === 1 ? 26 : 0), 22, 8 + 3 * Math.sin(t * 9 + i), VR.bone, 6, t * 3 + i * 0.4, bn * prog(t, c(6) + 0.2, 0.4));
    out += g(`<circle cx="${ear[0]}" cy="${ear[1]}" r="56" fill="none" stroke="${C.ink}" stroke-width="5" stroke-dasharray="12 9"/>`, { o: pO });
    out += pop(badge('ほかの ひとの こえ・まわりの おと', { fill: VR.airDk, size: 32 }), t, c(4) + 0.3, 372, 190, { end: c(5) - 0.1 });
    // 耳の中
    const dr = Math.max(win(t, c(2) + d(2) * 0.55, c(5), 0.3), 0), b0 = c(3) + 0.3;
    out += g(earCut(t, {
      air: prog(t, c(1) + 0.2, 0.5), drum: dr, bones: [0, 1, 2].map(i => win(t, b0 + i * 0.45, c(5), 0.3)), pulse: win(t, b0 + 0.3, c(5) + 0.4, 0.3),
      glow: Math.max(glA, glB), glowCol: bn > 0.5 ? VR.bone : VR.coch, airDim: lerp(1, 0.25, bn), buzz: bn,
      boneO: prog(t, c(6) + 0.2, 0.3), boneK: prog(t, c(6) + 0.3, d(6) * 0.55),
    }) + g(text(960, 64, 'あたまの ほね', { size: 36, w: 900, fill: '#a3844f' }), { o: 0.9 }), { x: PX, y: PY, o: pO });
    // なまえ
    const offA = 1 - bn;
    out += tag(PX + 330, PY + 322, PX + 250, PY + 440, 'みみの あな', prog(t, c(2) + 0.3, 0.3) * offA);
    out += tag(PX + 562, PY + 254, PX + 470, PY + 192, 'こまく', prog(t, c(2) + d(2) * 0.55, 0.3), { col: VR.drumDk });
    out += tag(PX + 654, PY + 322, PX + 580, PY + 540, '3つの ちいさな ほね', prog(t, b0 + 0.2, 0.3) * offA);
    out += tag(PX + 900, PY + 404, PX + 950, PY + 500, 'うずまき', prog(t, c(3) + d(3) * 0.55, 0.3), { col: VR.cochDk });
    out += pop(badge('こまくを とおらずに、ちょくせつ うずまきへ', { fill: VR.boneDk, size: 36 }), t, c(6) + d(6) * 0.5, PX + 440, PY + 556);
    return out;
  },
});

// 4. はなすと、2つの みちの こえが まざる
SCENES.push({
  id: 'mix',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 520, HY = 530, HS = 4.6;
    const speak = t > c(0) + 0.2 && t < cueE(1) + 0.3 ? 1 : 0;
    const kA = prog(t, c(0) + d(0) * 0.3, d(0) * 0.55), kB = prog(t, c(1) + d(1) * 0.3, d(1) * 0.4);
    const gl = Math.max(prog(t, c(0) + d(0) * 0.85, 0.4) * 0.6, prog(t, c(2) + 0.3, 0.5) * (0.8 + 0.2 * Math.sin(t * 5)));
    out += phead(HX, HY, HS, { who: 'S', talk: speak, inner: true, glow: gl, skull: prog(t, c(1), 0.5) });
    out += airLoop(HX, HY, HS, kA) + boneIn(HX, HY, HS, kB);
    out += big(HX + 76 * HS, HY + 52 * HS + Math.sin(t * 5) * 5, 'あー', 80, C.ink, { o: win(t, c(0) + 0.3, cueE(1) + 0.3, 0.3) });
    out += tag(...hp(HX, HY, HS, 6, 4), HX - 250, HY + 190, 'うずまき', prog(t, c(0) + d(0) * 0.8, 0.3), { col: VR.cochDk });
    // 右：2つの みち
    const X = 1420;
    out += pop(card(760, 150) + wavy(-340, -240, 0, 50, 16, VR.air, 10, t * 1.2) + text(-200, -24, 'くうきの みち', { size: 48, w: 900, fill: VR.airDk, anchor: 'start' }) +
      text(-200, 34, 'くちから でて、ぐるっと みみへ', { size: 32, w: 700, fill: C.muted, anchor: 'start' }), t, c(0) + d(0) * 0.3, X, 300);
    out += pop(text(0, 0, '＋', { size: 84, w: 900 }), t, c(1) + 0.3, X, 420);
    out += pop(card(760, 150) + g(`<path d="${zigPoly([[-340, 0], [-240, 0]], 15, 17)}" fill="none" stroke="${VR.bone}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`) + text(-200, -24, 'ほねの みち', { size: 48, w: 900, fill: VR.boneDk, anchor: 'start' }) +
      text(-200, 34, 'あたまの ほねや からだの なかを とおる', { size: 32, w: 700, fill: C.muted, anchor: 'start' }), t, c(1) + 0.6, X, 540);
    out += pop(text(0, 0, '＝', { size: 84, w: 900 }), t, c(2) + 0.2, X, 658);
    out += pop(`<rect x="-380" y="-66" width="760" height="132" rx="28" fill="${VR.cochSoft}" stroke="${VR.coch}" stroke-width="7" filter="url(#shadow)"/>` + text(0, 2, 'いつもの じぶんの こえ', { size: 58, w: 900, fill: VR.cochDk }), t, c(2) + 0.5, X, 770);
    return out;
  },
});

// 5. ろくおん：マイクが ひろうのは くうきの ふるえ だけ
SCENES.push({
  id: 'rec',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 430, HY = 540, HS = 4.6, PX = 1430, PY = 520, PS = 1.7;
    const fin = prog(t, c(2) - 0.1, 0.4);
    out += phead(HX, HY, HS, { who: 'S', talk: t < cueE(1) ? 1 : 0, inner: true, glow: 0.7, skull: 1 });
    out += boneIn(HX, HY, HS, prog(t, 0.3, 0.8));
    // あおい道：くち → マイク
    const m = hp(HX, HY, HS, 49, 22), kA = prog(t, c(0) + 0.4, 1.3);
    out += arcs(m[0], m[1], 5, 50, 120, -28, 22, VR.air, 9, prog(t, 0.4, 0.4) * 0.8, (t * 1.2) % 1);
    out += road(`M ${m[0] + 16} ${m[1]} C ${m[0] + 240} ${m[1] + 30} ${PX - 400} ${PY + 90} ${PX - 152} ${PY + 30}`, VR.air, 12, kA) + (kA >= 0.97 ? arrowHead(PX - 138, PY + 26, Math.atan2(-60, 248), VR.air, 32) : '');
    out += phoneG(PX, PY, PS, fin > 0.5 ? 'wave' : 'rec');
    out += tag(PX, PY + 122 * PS, PX + 220, PY + 250, 'マイク', prog(t, c(0) + d(0) * 0.35, 0.3));
    out += pop(badge('マイクが ひろうのは、くうきの ふるえ だけ', { fill: VR.airDk, size: 38 }), t, c(0) + d(0) * 0.5, 960, 190, { end: c(2) - 0.1 });
    // オレンジの道は、あたまの 中だけ
    const kO = prog(t, c(1) + 0.3, 1.0), xo = hp(HX, HY, HS, 50, 40);
    out += zig([[xo[0] + 20, xo[1] + 10], [xo[0] + 300, xo[1] + 26]], kO, { amp: 13, step: 24, w: 9, head: 0, o: 0.8 });
    out += pop(cross(0, 0, 0.5), t, c(1) + 1.3, xo[0] + 350, xo[1] + 28, { d: 0.3 });
    out += pop(badge('ほねの みちは、マイクに はいらない', { fill: VR.boneDk, size: 36 }), t, c(1) + d(1) * 0.45, 1010, 800);
    out += pop(badge('ろくおんの こえ ＝ くうきの みち だけ', { fill: VR.air, size: 50, pad: 46 }), t, c(2) + d(2) * 0.3, 960, 190);
    return out;
  },
});

// 6. ほねの みちは、たかい おとほど よわめる → ろくおんは ひくい ひびきが たりない
function voiceBars(t, t0, both, { miss = 0 } = {}) {
  // ひくい・たかい の棒。both: オレンジ（ほねの みち）も のせる。miss: たりない ぶんを 点線で
  let o = '';
  [['ひくい おと', -105, 150, 120], ['たかい おと', 105, 170, 26]].forEach(([nm, x, hb, ho], i) => {
    const k1 = eo(prog(t, t0 + 0.3 + i * 0.15, 0.6)), k2 = eo(prog(t, t0 + 0.9 + i * 0.15, 0.6));
    o += `<rect x="${x - 55}" y="${130 - hb * k1}" width="110" height="${hb * k1}" rx="10" fill="${VR.air}"/>`;
    if (both) o += `<rect x="${x - 55}" y="${130 - hb - ho * k2}" width="110" height="${ho * k2}" rx="10" fill="${VR.bone}" opacity="${k2 > 0 ? 1 : 0}"/>`;
    else if (miss > 0) o += `<rect x="${x - 52}" y="${133 - hb - ho}" width="104" height="${ho - 6}" rx="10" fill="none" stroke="${VR.bone}" stroke-width="5" stroke-dasharray="12 9" opacity="${miss}"/>`;
    o += text(x, 168, nm, { size: 32, w: 900 });
  });
  return o + `<line x1="-190" y1="131" x2="190" y2="131" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
}
SCENES.push({
  id: 'low',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A：ほねの みちを 通ると
    const aO = 1 - prog(t, c(1) - 0.5, 0.4);
    if (aO > 0) {
      let a = `<rect x="800" y="250" width="320" height="510" rx="36" fill="${VR.skull}" stroke="${VR.skullDk}" stroke-width="8"/>`;
      for (let i = 0; i < 16; i++) a += `<circle cx="${(830 + rnd(i, 51) * 260).toFixed(0)}" cy="${(280 + rnd(i, 52) * 450).toFixed(0)}" r="${(5 + rnd(i, 53) * 6).toFixed(1)}" fill="${VR.skullDk}" opacity="0.3"/>`;
      a += pop(badge('ほねの みち', { fill: VR.bone, size: 46, pad: 40 }), t, 0.3, 960, 196);
      const ph = t * 0.9, i0 = c(0) + 0.3, kIn = prog(t, i0, 0.9), kMid = prog(t, i0 + 0.8, 0.7), kOut = prog(t, i0 + 1.4, 0.9);
      [['ひくい おと', 400, 170, 46, 42, 'よく とどく', VR.boneDk], ['たかい おと', 620, 46, 46, 13, 'よわく なる', C.muted]].forEach(([nm, y, len, a1, a2, res, col]) => {
        a += g(text(80, y, nm, { size: 50, w: 900, anchor: 'start' }), { o: prog(t, i0 - 0.1, 0.3) });
        a += wavy(380, lerp(380, 800, kIn), y, len, a1, VR.bone, 11, ph * 170 / len);
        a += wavy(800, lerp(800, 1120, kMid), y, len, (a1 + a2) / 2, VR.bone, 11, ph * 170 / len, 0.35);
        a += wavy(1120, lerp(1120, 1500, kOut), y, len, a2, VR.bone, 11, ph * 170 / len);
        a += g(text(1540, y, res, { size: 48, w: 900, fill: col, anchor: 'start' }), { o: prog(t, i0 + 2.3, 0.4) });
      });
      out += g(a, { o: aO });
    }
    // B：じぶんで きく こえ と ろくおんの こえ
    const bO = prog(t, c(1) - 0.2, 0.4);
    if (bO > 0) {
      const bars = (t0, both, o) => g(voiceBars(t, t0, both, o), { y: 24, s: 1.12 });
      let b = pop(`<rect x="-330" y="-22" width="44" height="44" rx="10" fill="${VR.air}"/>` + text(-272, 2, 'くうきの みち', { size: 38, w: 900, fill: VR.airDk, anchor: 'start' }) +
        `<rect x="40" y="-22" width="44" height="44" rx="10" fill="${VR.bone}"/>` + text(98, 2, 'ほねの みち', { size: 38, w: 900, fill: VR.boneDk, anchor: 'start' }), t, c(1) + 0.2, 565, 176);
      b += pop(card(480, 500) + text(0, -200, 'じぶんで きく こえ', { size: 44, w: 900 }) + bars(c(1), true), t, c(1) - 0.1, 310, 500);
      b += pop(badge('ひくい おとが つよい', { fill: VR.boneDk, size: 36 }), t, c(1) + d(1) * 0.55, 310, 800);
      b += pop(card(480, 500) + text(0, -200, 'ろくおんの こえ', { size: 44, w: 900, fill: VR.airDk }) + bars(c(2), false, { miss: prog(t, c(2) + d(2) * 0.45, 0.4) }), t, c(2) - 0.1, 820, 500);
      b += tag(820 - 118, 500 - 66, 820 + 76, 500 - 140, 'たりない', prog(t, c(2) + d(2) * 0.5, 0.3), { col: VR.boneDk, size: 34 });
      b += pop(badge('たかく、ほそく きこえる', { fill: VR.airDk, size: 36 }), t, c(2) + d(2) * 0.7, 820, 800);
      // スマホで きいている おねえちゃん
      const s0 = c(2) + 0.5, KS = 0.8, KY = 890;
      b += pop(phoneG(0, 0, 0.95, 'play'), t, s0, 1240, 650) + arcs(1325, 650, 3, 40, 46, -35, 35, VR.air, 9, prog(t, s0 + 0.5, 0.3), (t * 1.2) % 1);
      b += kidShow('S', t, 1640, KY, { s: KS, start: s0 + 0.2, n: 0, eyes: lineOf('S') ? 'wide' : 'open', look: [-8, 0], bubble: false });
      b += talkBubble('S', 1470, 330, 1626, KY - KID_HEAD.S[0] * KS - 6, 40);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 7. ろくおんの こえは、まわりの ひとが きいている こえ
SCENES.push({
  id: 'others',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 360, HY = 530, HS = 4.2, m = hp(HX, HY, HS, 49, 22);
    const L = [['M', 1330, 350, 3.2], ['F', 1610, 570, 2.8]];
    out += arcs(m[0], m[1], 6, 50, 130, -30, 14, VR.air, 9, prog(t, 0.4, 0.4) * 0.6, (t * 1.1) % 1);
    out += phead(HX, HY, HS, { who: 'S', talk: t < cueE(0) + 0.3 ? 1 : 0, inner: true, glow: 0.8, skull: 0.8 });
    out += airLoop(HX, HY, HS, prog(t, 0.3, 0.8)) + boneIn(HX, HY, HS, prog(t, 0.5, 0.8));
    L.forEach(([who, x, y, s], i) => {
      const e = hp(x, y, s, -10, 2, true), kA = prog(t, c(0) + 0.5 + i * 0.4, 1.2), ex = e[0] - 16 * s, ey = e[1] - 3 * s;
      out += phead(x, y, s, { who, flip: true, inner: true, glow: kA >= 1 ? 0.7 : 0, eyes: 'smile' });
      const p1 = [m[0] + 250, m[1] - 70 + i * 90], p2 = [ex - 250, ey + 76];
      out += road(`M ${m[0] + 16} ${m[1]} C ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${ex} ${ey}`, VR.air, 11, kA) + (kA >= 0.97 ? arrowHead(ex + 6, ey, Math.atan2(ey - p2[1], ex - p2[0]), VR.air, 30) : '');
    });
    out += pop(badge('まわりの ひとには、くうきの みち だけ', { fill: VR.airDk, size: 38 }), t, c(0) + d(0) * 0.45, 1300, 116);
    // ろくおんの こえ ＝ みんなが きいている こえ
    out += pop(card(880, 164) + phoneG(-370, 0, 0.48, 'wave') + text(-290, -36, 'ろくおんの こえ', { size: 44, w: 900, fill: VR.airDk, anchor: 'start' }) + text(-290, 30, '＝ みんなが きいて いる こえ', { size: 40, w: 900, anchor: 'start' }), t, c(1) + d(1) * 0.2, 1010, 756);
    out += pop(badge('じぶんには 2つの みち', { fill: C.accent, size: 38 }), t, c(2) + 0.2, 400, 180);
    return out;
  },
});

// 8. みみを ふさぐと、ほねの みちが よく わかる
SCENES.push({
  id: 'cover',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 540, HY = 550, HS = 4.8;
    const hand = prog(t, c(0) + 0.4, 0.6), blk = prog(t, c(0) + 1.0, 0.4), boom = prog(t, c(2) + 0.2, 0.5), bT = lineOf('B') ? 1 : 0;
    const speak = (t > c(0) + 1.0 && t < cueE(1)) || (t > c(2) + 0.2 && t < cueE(2)) ? 1 : 0;
    const hop = bT ? Math.abs(Math.sin(t * 9)) * 10 : 0, Y = HY - hop;
    // ひびく（あたまの 中で 大きく）
    if (boom > 0) for (let i = 0; i < 3; i++) { const f = ((t * 0.9 + i / 3) % 1), [gx, gy] = hp(HX, Y, HS, 6, 4); out += `<circle cx="${gx}" cy="${gy}" r="${40 + f * 190}" fill="none" stroke="${VR.bone}" stroke-width="12" opacity="${(boom * 0.5 * (1 - f)).toFixed(2)}"/>`; }
    out += phead(HX, Y, HS, { who: 'B', talk: speak, inner: true, glow: Math.max(prog(t, c(1) + 0.3, 0.4), 0.3), glowCol: VR.bone, hand, skull: prog(t, c(1), 0.4), eyes: bT ? 'wide' : 'open', mouth: bT ? 'o' : 'smile' });
    out += airLoop(HX, Y, HS, prog(t, 0.2, 0.6), { o: lerp(1, 0.3, blk) });
    out += pop(cross(0, 0, 0.42), t, c(0) + 1.1, ...hp(HX, Y, HS, -31, -9), { d: 0.3 });
    out += boneIn(HX, Y, HS, prog(t, 0.4, 0.6), { w: lerp(9, 13, boom) });
    out += big(HX + 76 * HS, Y + 50 * HS + Math.sin(t * 5) * 5, 'あー', 80, C.ink, { o: speak ? 1 : 0 });
    out += tag(...hp(HX, Y, HS, -31, -9), 190, 400, 'みみを ふさぐ', win(t, c(0) + 1.4, c(2) - 0.2, 0.3), { col: VR.airDk, size: 36 });
    out += pop(badge('きこえるのは、おもに ほねの みち', { fill: VR.boneDk, size: 40 }), t, c(1) + d(1) * 0.3, 1340, 196);
    // ボワン
    out += pop(big(0, 0, 'ボワン', 104, VR.bone, { r: -8 + Math.sin(t * 14) * 2 }), t, c(2) + d(2) * 0.45, 190, 640);
    // くらべ
    const cO = prog(t, c(2) - 0.1, 0.4);
    if (cO > 0) {
      let q = card(740, 340);
      q += text(-330, -92, 'ふさがない', { size: 40, w: 900, anchor: 'start' }) + wavy(-70, 320, -92, 70, 16, VR.bone, 9, t * 1.4);
      q += `<line x1="-330" y1="-24" x2="330" y2="-24" stroke="${C.line}" stroke-width="4"/>`;
      q += text(-330, 60, 'ふさぐ', { size: 40, w: 900, anchor: 'start', fill: VR.boneDk }) + wavy(-70, 320, 60, 130, 16 + 30 * eo(prog(t, c(2) + 0.5, 0.8)), VR.bone, 13, t * 0.75);
      q += g(text(0, 140, 'おおきく、こもって ひびく', { size: 38, w: 900, fill: VR.boneDk }), { o: prog(t, c(2) + d(2) * 0.5, 0.4) });
      out += g(q, { x: 1420, y: 620, o: cO });
    }
    out += talkBubble('B', 1230, 330, ...hp(HX, Y, HS, 52, -22), 46);
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
      const ans = 'いつもの こえには、ほねを とおる おとが まざる';
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, ans, { size: fitSize(ans, 56, 1010, 900), w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['じぶんには 2つの みち', C.accent], ['ろくおんは くうきの みち だけ', VR.airDk], ['ひくい ひびきが たりない', VR.boneDk]], t, 960, 660, { size: 34, start: 2.6, step: 1.2 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const earIc = `<clipPath id="lkEar"><circle r="56"/></clipPath><circle r="56" fill="${VR.boneSoft}"/><g clip-path="url(#lkEar)">${phead(-5, 4, 1.08, { who: 'B', hand: 1, body: false, mouth: 'o' })}</g>`;
      const cmpIc = wavy(-52, 52, -20, 40, 9, VR.bone, 8, 0) + wavy(-52, 52, 22, 70, 20, VR.bone, 10, 0.2);
      const items = [
        [earIc, 'てのひらで りょうみみを そっと おおって「あー」', C.ink, 320],
        [cmpIc, 'おおわない ときと、こえを くらべる', C.ink, 426],
        [phoneG(0, 0, 0.36, 'rec'), 'かぞくと おなじ ことばを ろくおんして、ききくらべる', C.ink, 532],
        [warnIcon(0.8), 'みみの あなに、ゆびや ものを いれない', C.red, 652],
        [warnIcon(0.8), 'みみの そばで、おおきな こえを ださない', C.red, 752],
      ];
      items.forEach(([ic, s1, col, y], i) => { b += pop(ic + text(110, 2, s1, { size: 38, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 210, y); });
      // 絵：みみを おおって「あー」
      const sp = t > cue(1) + 0.6 && t < cueE(2) ? 1 : 0;
      b += pop(card(440, 360) + phead(-44, -34, 2.3, { who: 'B', hand: prog(t, cue(1) + 0.5, 0.5), talk: sp, inner: true, glow: 0.8, glowCol: VR.bone }) + big(132, 60, 'あー', 60, C.ink, { o: sp }), t, cue(1) + 0.3, 1570, 400);
      b += kidShow('K', t, 1640, 838, { s: 0.74, start: cue(3) + 0.3, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「こえ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

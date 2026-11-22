
// みのまわり図鑑 動画「おふろに はいると、どうして ゆびが しわしわに なるの？」（ゆびの しわしわ）
// 出どころ：everyday-trivia trivia/finger-wrinkles.md（絵の見本：assets/figures-finger-wrinkles.js、メモ：ideas/notes/finger-wrinkles.md）
// 水は青、神経は黄色、血管は赤（サイトの図と同じ）

// ---------- ゆびの道具 ----------
const FW = {
  skin: '#f6d6bd', skinDk: '#e2b497', skinLt: '#fbe7d6', flesh: '#f8c9b6', fleshDk: '#efb49e', wr: '#b47c5c',
  water: '#5aa9e6', waterDk: '#2f78b8', waterLt: '#bfe0f7', nerve: '#f2bd2c', nerveDk: '#b98a12', vessel: '#d9584a', vesselDk: '#a93b30',
  tile: '#e3f2f6', tileLn: '#cbe4ea', tub: '#ffffff', tubDk: '#cfd9de',
};
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
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
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 14 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
// しわの線（たての なみなみ）。seed が同じなら、同じ形
function wrLines(wr, seed = 1, col = FW.wr, sw = 6) {
  if (wr <= 0) return '';
  let o = '';
  [-52, -27, 0, 27, 52].forEach((x, i) => {
    const y0 = -112 + Math.abs(x) * 0.8 + rnd(i, seed) * 16, n = 5 + (i + seed) % 2, seg = (98 - y0) / n, a = (9 + rnd(i, seed + 1) * 7) * wr * ((i + seed) % 2 ? 1 : -1);
    let d = `M ${x} ${y0.toFixed(1)}`;
    for (let k = 0; k < n; k++) d += ` q ${(k % 2 ? -a : a).toFixed(1)} ${(seg / 2).toFixed(1)} 0 ${seg.toFixed(1)}`;
    o += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${clamp(wr * 1.2)}"/>`;
  });
  return o;
}
// 指のはら（指先が上）。(0,0) は はらの まん中。wr = 0（つるつる）〜1（しわしわ）
function fingerPad(wr = 0, { seed = 1 } = {}) {
  let o = `<path d="M -80 220 V -70 Q -80 -150 0 -150 Q 80 -150 80 -70 V 220 Z" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<path d="M -60 132 Q 0 148 60 132" fill="none" stroke="${FW.skinDk}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`;
  if (wr < 1) o += `<g opacity="${0.55 * (1 - wr)}">` + [0, 1, 2].map(i => `<path d="M ${-36 + i * 11} ${-34 + i * 16} Q 0 ${-96 + i * 20} ${36 - i * 11} ${-34 + i * 16}" fill="none" stroke="${FW.skinDk}" stroke-width="4" stroke-linecap="round"/>`).join('') + `</g>`;
  return o + wrLines(wr, seed);
}
// 手（手のひら。指が上）。wr で指先にしわ
function handPalm(s = 1, wr = 0) {
  const st = `stroke="${FW.skinDk}" stroke-width="5"`;
  let o = `<rect x="-66" y="70" width="132" height="190" rx="48" fill="${FW.skin}" ${st}/>`;
  const F = [[-92, -150], [-42, -184], [8, -176], [58, -140]];
  o += F.map(([x, y]) => `<rect x="${x}" y="${y}" width="44" height="${-y + 20}" rx="22" fill="${FW.skin}" ${st}/>`).join('');
  o += `<rect x="-168" y="-36" width="52" height="150" rx="26" fill="${FW.skin}" ${st} transform="rotate(-32 -142 80)"/>`;
  o += `<rect x="-104" y="-76" width="216" height="210" rx="64" fill="${FW.skin}" ${st}/>`;
  o += `<path d="M -60 -6 Q -10 30 60 -14 M -66 44 Q -6 74 56 36" fill="none" stroke="${FW.skinDk}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
  if (wr > 0) F.forEach(([x, y], i) => [11, 22, 33].forEach((dx, k) => {
    const a = (k % 2 ? 4 : -4) * wr;
    o += `<path d="M ${x + dx} ${y + 14 + (k === 1 ? -4 : 2)} q ${a} 8 0 16 q ${-a} 8 0 16 q ${a} 8 0 16" fill="none" stroke="${FW.wr}" stroke-width="3.5" stroke-linecap="round" opacity="${clamp(wr * 1.2)}"/>`;
  }));
  return `<g transform="scale(${s})">${o}</g>`;
}
const drop = (x, y, s = 1, col = FW.water, o = 1) => o <= 0 ? '' : `<path d="M ${x} ${y - 16 * s} C ${x - 12 * s} ${y} ${x - 12 * s} ${y + 12 * s} ${x} ${y + 13 * s} C ${x + 12 * s} ${y + 12 * s} ${x + 12 * s} ${y} ${x} ${y - 16 * s} Z" fill="${col}" opacity="${o}"/>`;
const zap = (x, y, s = 1, o = 1) => o <= 0 ? '' : `<path d="M ${x + 4 * s} ${y - 18 * s} l ${-12 * s} ${18 * s} h ${9 * s} l ${-5 * s} ${18 * s} l ${15 * s} ${-22 * s} h ${-9 * s} l ${6 * s} ${-14 * s} Z" fill="${FW.nerve}" stroke="${FW.nerveDk}" stroke-width="${2.5 * s}" stroke-linejoin="round" opacity="${o}"/>`;
const clockFace = (a, r = 88) => `<circle r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="10"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => `<line x1="0" y1="${-r + 14}" x2="0" y2="${k % 3 ? -r + 22 : -r + 30}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" transform="rotate(${k * 30})"/>`).join('') +
  `<line x1="0" y1="0" x2="0" y2="${-r * 0.42}" stroke="${C.ink}" stroke-width="11" stroke-linecap="round" transform="rotate(${50 + a / 12})"/><line x1="0" y1="0" x2="0" y2="${-r * 0.66}" stroke="${C.redUi}" stroke-width="8" stroke-linecap="round" transform="rotate(${a})"/><circle r="9" fill="${C.ink}"/>`;

// 指先の中（横から見た だんめん）。p = { water, sig, shrink, pull, less }（どれも 0〜1）
const SEC = { X0: 110, X1: 1190, S: 380, B: 800, TOP: 210, V: 650, N: 540, L: 180 };
const secY = (x, pull) => SEC.S + pull * 50 * (1 - Math.cos((x - SEC.X0) / SEC.L * Math.PI * 2)) / 2;
function tipSection(t, p) {
  const { X0, X1, S, B, TOP, V, N, L } = SEC, W = X1 - X0;
  const pull = p.pull || 0, water = p.water || 0, sig = p.sig || 0, shrink = p.shrink || 0;
  const surf = (dy = 0) => { let d = ''; for (let x = X0; x <= X1; x += 15) d += `${x === X0 ? 'M' : 'L'} ${x} ${(secY(x, pull) + dy).toFixed(1)} `; return d; };
  let o = `<clipPath id="secc"><rect x="${X0}" y="${TOP}" width="${W}" height="${B - TOP}" rx="40"/></clipPath><g clip-path="url(#secc)">`;
  // お湯
  o += `<rect x="${X0}" y="${TOP}" width="${W}" height="${S - TOP + 60}" fill="${FW.waterLt}"/>`;
  for (let i = 0; i < 9; i++) o += `<path d="M ${X0 + 40 + i * 120 + Math.sin(t * 1.3 + i) * 14} ${TOP + 50 + (i % 3) * 34} q 22 -12 44 0 t 44 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
  // 指の中
  o += `<path d="${surf()} L ${X1} ${B} L ${X0} ${B} Z" fill="${FW.flesh}"/>`;
  // 血管（赤い帯）
  const hv = lerp(46, 17, shrink);
  o += `<rect x="${X0 - 20}" y="${V - hv}" width="${W + 40}" height="${hv * 2}" rx="${hv}" fill="${FW.vessel}"/><rect x="${X0 - 20}" y="${V - hv * 0.55}" width="${W + 40}" height="${hv * 0.4}" rx="${hv * 0.2}" fill="#fff" opacity="0.25"/>`;
  for (let i = 0; i < 7; i++) { const f = ((t * 0.16 + i / 7) % 1); o += `<ellipse cx="${X0 + f * W}" cy="${V + Math.sin(i * 2.4) * hv * 0.35}" rx="${Math.min(13, hv * 0.5)}" ry="${Math.min(9, hv * 0.36)}" fill="${FW.vesselDk}" opacity="0.55"/>`; }
  // 神経（黄色い線）
  const nw = 9 + 5 * sig * (0.6 + 0.4 * Math.sin(t * 9));
  let nd = `M ${X0 - 10} ${N}`; for (let x = X0; x <= X1; x += 90) nd += ` q 22 ${(x / 90) % 2 ? 16 : -16} 45 0 t 45 0`;
  if (sig > 0) o += `<path d="${nd}" fill="none" stroke="#ffe27a" stroke-width="${nw + 14}" stroke-linecap="round" opacity="${0.45 * sig}"/>`;
  o += `<path d="${nd}" fill="none" stroke="${FW.nerve}" stroke-width="${nw}" stroke-linecap="round"/>`;
  // 汗の出口（山のてっぺんに開く）と、そこからしみこむ水
  for (let k = 1; k <= 5; k++) {
    const x = X0 + k * L, y0 = secY(x, pull), y1 = 470;
    o += `<path d="M ${x} ${N - 6} Q ${x + 30} ${N - 40} ${x + 14} ${y1 + 14}" fill="none" stroke="${FW.nerve}" stroke-width="7" stroke-linecap="round"/>`;
    o += `<path d="M ${x} ${y0 - 4} L ${x} ${y1 - 24}" stroke="#e39c82" stroke-width="20" stroke-linecap="round"/><circle cx="${x}" cy="${y1}" r="26" fill="#e39c82"/>`;
    o += `<path d="M ${x} ${y0 - 4} L ${x} ${y1 - 24}" stroke="${mix('#fde3d6', FW.water, clamp(water * 1.3 - k * 0.04))}" stroke-width="9" stroke-linecap="round"/><circle cx="${x}" cy="${y1}" r="15" fill="${mix('#fde3d6', FW.water, clamp(water * 1.6 - 0.5))}"/>`;
    if (water > 0 && water < 1) { const f = (t * 0.9 + k * 0.23) % 1; o += drop(x, lerp(y0 - 30, y1, f), 0.7, FW.waterDk, Math.min(1, f * 5, (1 - f) * 4)); }
    if (water > 0.5) o += `<circle cx="${x}" cy="${y1}" r="${40 + 6 * Math.sin(t * 3 + k)}" fill="${FW.water}" opacity="${0.22 * clamp((water - 0.5) * 2)}"/>`;
    if (sig > 0) { const f = (t * 0.8 + k * 0.31) % 1; o += zap(x + 10 + f * 26, lerp(y1 + 10, N, f), 1.1, sig * Math.min(1, f * 5, (1 - f) * 4)); }
  }
  if (sig > 0) for (let i = 0; i < 4; i++) { const f = (t * 0.35 + i / 4) % 1; o += zap(X0 + f * W, N - 34, 1.3, sig * Math.min(1, f * 8, (1 - f) * 8)); }
  // 皮ふ（外側のうすい層）
  o += `<path d="${surf()}" fill="none" stroke="${FW.skinLt}" stroke-width="44" stroke-linejoin="round" transform="translate(0 22)"/><path d="${surf()}" fill="none" stroke="${FW.skinDk}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;
  for (let k = 1; k <= 5; k++) { const x = X0 + k * L; o += `<ellipse cx="${x}" cy="${secY(x, pull) + 2}" rx="13" ry="7" fill="${mix('#c98a70', FW.waterDk, clamp(water * 2))}"/>`; }
  // 引っぱる矢印（谷のところが下へ）
  if (pull > 0.05) for (let k = 0; k < 6; k++) { const x = X0 + (k + 0.5) * L, y = secY(x, pull) + 56; o += g(arrow2(x, y, x, y + 34 + 26 * pull, '#fff', 9), { o: clamp(pull * 2) * 0.95 }); }
  // 血管がちぢむ矢印
  if (shrink > 0.02 && shrink < 1) [300, 650, 1000].forEach(x => { o += arrow2(x, V - 92, x, V - hv - 8, '#fff', 9) + arrow2(x, V + 92, x, V + hv + 8, '#fff', 9); });
  o += `</g><rect x="${X0}" y="${TOP}" width="${W}" height="${B - TOP}" rx="40" fill="none" stroke="${FW.skinDk}" stroke-width="8"/>`;
  return o;
}
// しわができる順番（右の一覧）。now = いまの番号（1〜4。0 ならまだ）
const STEPS = [['みずが しみこむ', FW.waterDk], ['しんけいが あいず', FW.nerveDk], ['けっかんが ちぢむ', FW.vesselDk], ['ひふが ひっぱられる', C.ochre]];
function stepList(t, now, tNow) {
  let o = '';
  STEPS.forEach(([s, col], i) => {
    const n = i + 1, on = n === now, done = n < now, k = on ? back(prog(t, tNow, 0.4)) : 1;
    o += g((on ? `<rect x="-282" y="-52" width="564" height="104" rx="30" fill="none" stroke="${col}" stroke-width="8"/>` : '') + `<rect x="-270" y="-40" width="540" height="80" rx="22" fill="#fff" filter="url(#shadow)"/>` +
      `<circle cx="-222" cy="0" r="30" fill="${col}"/>` + text(-222, 3, n, { size: 38, w: 900, fill: '#fff', ls: 0 }) + text(-176, 2, s, { size: 40, w: 900, anchor: 'start', fill: C.ink }), { x: 1560, y: 280 + i * 104, o: on || done ? 1 : 0.32, s: on ? lerp(0.9, 1, clamp(k)) : 0.94 });
  });
  return o;
}

// 1. つかみ：おふろで、指先がしわしわに
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${FW.tile}"/>`;
    for (let x = 0; x <= 1920; x += 160) out += `<line x1="${x}" y1="0" x2="${x}" y2="1080" stroke="${FW.tileLn}" stroke-width="5"/>`;
    for (let y = 100; y <= 1080; y += 160) out += `<line x1="0" y1="${y}" x2="1920" y2="${y}" stroke="${FW.tileLn}" stroke-width="5"/>`;
    // 湯気
    for (let i = 0; i < 4; i++) { const x = 190 + i * 270, f = (t * 0.22 + i * 0.27) % 1; out += `<path d="M ${x} ${560 - f * 260} q 34 -44 0 -88 q -34 -44 0 -88" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="${0.8 * Math.min(1, f * 4, (1 - f) * 3)}"/>`; }
    // 浴そう（うしろのふち → お湯）
    const WY = 650;
    out += `<ellipse cx="600" cy="${WY}" rx="560" ry="96" fill="${FW.tub}" stroke="${FW.tubDk}" stroke-width="8"/><ellipse cx="600" cy="${WY}" rx="520" ry="72" fill="${FW.waterLt}"/>`;
    out += `<path d="M 200 ${WY - 24} q 40 -14 80 0 t 80 0 M 700 ${WY - 34} q 40 -14 80 0 t 80 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
    // 子どもたちと、上げた手（お湯から上だけ見える）
    const wr = eio(prog(t, c0 + 1.0, Math.max(2, d0 - 1.4)));
    let kids = kidShow('B', t, 230, 772, { s: 0.62, start: 0.1, n: 1, enter: 'rise', look: [8, -2], bubble: false });
    kids += kidShow('S', t, 450, 818, { s: 0.62, start: 0.2, n: 0, enter: 'rise', look: [8, -4], bubble: false, eyes: wr > 0.5 && t < c3 ? 'wide' : null });
    kids += g(handPalm(0.32, wr), { x: 606, y: 588 + (1 - eo(prog(t, 0.5, 0.6))) * 130 });
    out += `<clipPath id="hbath"><rect x="0" y="0" width="1920" height="${WY - 6}"/></clipPath><g clip-path="url(#hbath)">${kids}</g>`;
    [[230, 108], [450, 104], [606, 36]].forEach(([x, r]) => { out += `<ellipse cx="${x}" cy="${WY - 6}" rx="${r}" ry="${r > 50 ? 15 : 9}" fill="none" stroke="#fff" stroke-width="6" opacity="0.9"/>`; });
    // 手を大きく見る（まるの中）
    const ZX = 900, ZY = 330, ZR = 215, zo = prog(t, 0.7, 0.5);
    out += g(`<line x1="626" y1="520" x2="${ZX - 176}" y2="${ZY + 124}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/><line x1="590" y1="512" x2="${ZX - 190}" y2="${ZY - 100}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/>` +
      `<circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="#fff" stroke="${C.blueUi}" stroke-width="12"/><clipPath id="hzc"><circle cx="${ZX}" cy="${ZY}" r="${ZR - 6}"/></clipPath><g clip-path="url(#hzc)">${g(handPalm(1.05, wr), { x: ZX + 12, y: ZY + 50 })}</g>`, { o: zo });
    // あひる
    out += `<g transform="translate(${1010 + Math.sin(t * 1.1) * 10} ${WY - 22 + Math.sin(t * 2.2) * 4})"><ellipse cx="0" cy="8" rx="44" ry="26" fill="${C.yellow}"/><circle cx="30" cy="-22" r="22" fill="${C.yellow}"/><path d="M 48 -22 l 22 5 l -22 8 Z" fill="#f08a3c"/><circle cx="34" cy="-27" r="4" fill="${C.ink}"/></g>`;
    // 浴そう（手前）
    out += `<path d="M 40 ${WY} A 560 96 0 0 0 1160 ${WY} L 1160 1080 L 40 1080 Z" fill="${FW.tub}" stroke="${FW.tubDk}" stroke-width="8"/><path d="M 80 ${WY} A 520 72 0 0 0 1120 ${WY}" fill="none" stroke="${FW.tubDk}" stroke-width="5" opacity="0.7"/>`;
    out += talkBubble('S', 330, 400, 440, 530, 44);
    // 指先のしわ（上げた手をさす）
    out += tag(925, 225, 1190, 130, 'しわしわ', win(t, c0 + d0 * 0.6, c1 + 0.3, 0.3), { col: FW.wr, size: 46 });
    // 時計
    const ck = win(t, c0 + 0.6, c1 - 0.1, 0.3);
    if (ck > 0) out += g(clockFace(prog(t, c0 + 1.0, Math.max(2, d0 - 1.4)) * 660, 96), { x: 1520, y: 360, o: ck }) + g(text(1520, 520, 'しばらく すると…', { size: 46, w: 900 }), { o: ck });
    // くらべる：入ったばかり と しばらくすると
    const co = prog(t, c1 - 0.1, 0.4);
    if (co > 0) {
      let c = card(640, 620);
      c += g(fingerPad(0), { x: -155, y: -20, s: 0.9 }) + g(fingerPad(1, { seed: 3 }), { x: 155, y: -20, s: 0.9 });
      c += text(-155, -256, 'はいった ばかり', { size: 36, w: 900, fill: C.muted }) + text(155, -256, 'しばらく すると', { size: 36, w: 900, fill: C.muted });
      c += text(-155, 248, 'つるつる', { size: 50, w: 900, fill: FW.waterDk }) + text(155, 248, 'しわしわ', { size: 50, w: 900, fill: FW.wr });
      c += g(arrow2(-46, -20, 46, -20, C.ink, 12), { o: 1 - prog(t, c3 + 0.3, 0.3) }) + pop(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre, extra: 'stroke="#fff" stroke-width="16" paint-order="stroke" stroke-linejoin="round"' }), t, c3 + 0.4, 0, -24);
      out += g(c, { x: 1530, y: 420 - (1 - eo(co)) * 30, o: co });
    }
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${FW.waterDk}">おふろ</tspan>に はいると、どうして</text>`, { x: 960, y: 370, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">ゆびが <tspan fill="${FW.wr}">しわしわ</tspan>に なるの？</text>`, { x: 960, y: 550, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(fingerPad(0), { x: -200, s: 0.62 }) + arrow2(-90, 0, 70, 0, C.ink, 12) + g(fingerPad(1, { seed: 3 }), { x: 200, s: 0.62 }), t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'どうしてだと おもう？', { size: 84, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'ゆびの なかの けっかんが、きゅっと ちぢむから'], ['②', 'ひふが みずを すって、ふくらむから'], ['③', 'おゆの ねつで、ひふが のびるから']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-640" y="-76" width="1280" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1260, 132) +
        `<circle cx="-560" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-560, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-494, 2, s, { size: 46, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 390 + i * 168);
    });
    out += kidShow('B', t, 1740, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1740, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 皮ふのいちばん外側の細胞は、水を吸うとふくらむ。昔の考え。でも、それだけではなかった
SCENES.push({
  id: 'swell',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2);
    // 外側の細胞（ひらたい れんが）
    const CX = 520, sw = eio(prog(t, c0 + d0 * 0.45, 2.2)), H = lerp(40, 60, sw), GAP = 10, ROWS = 4, top = 640 - ROWS * (H + GAP);
    let b = `<rect x="${CX - 380}" y="${top - 170}" width="760" height="150" rx="24" fill="${FW.waterLt}"/>` + text(CX - 340, top - 130, 'みず', { size: 40, w: 900, fill: FW.waterDk, anchor: 'start' });
    for (let i = 0; i < 6; i++) b += `<path d="M ${CX - 330 + i * 120 + Math.sin(t * 1.3 + i) * 10} ${top - 70 + (i % 2) * 22} q 20 -11 40 0 t 40 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`;
    for (let r = 0; r < ROWS; r++) for (let c = -1; c < 4; c++) {
      const x = CX - 380 + c * 200 + (r % 2) * 100, y = top + r * (H + GAP);
      b += `<rect x="${x + 5}" y="${y}" width="190" height="${H}" rx="${H * 0.4}" fill="${mix(FW.skinLt, '#cfe6f7', sw * 0.8)}" stroke="${mix(FW.skinDk, FW.water, sw * 0.6)}" stroke-width="5"/>`;
    }
    b += `<rect x="${CX - 380}" y="640" width="760" height="110" fill="${FW.flesh}"/>`;
    // しみこむ しずく
    const dk = win(t, c0 + d0 * 0.3, c0 + d0 * 0.45 + 2.4, 0.3);
    for (let i = 0; i < 7; i++) { const f = (t * 0.7 + i * 0.19) % 1; b += drop(CX - 300 + i * 100, lerp(top - 40, top + 150, f), 1, FW.waterDk, dk * Math.min(1, f * 5, (1 - f) * 4)); }
    out += `<clipPath id="swc"><rect x="${CX - 380}" y="190" width="760" height="560" rx="30"/></clipPath>` + g(`<g clip-path="url(#swc)">${b}</g><rect x="${CX - 380}" y="${top - 170}" width="760" height="${750 - top + 170}" rx="30" fill="none" stroke="${FW.skinDk}" stroke-width="8"/>`, { o: prog(t, 0.2, 0.4) });
    // あつさ
    const bx = CX + 420;
    out += g(`<path d="M ${bx - 14} ${top} h 28 M ${bx} ${top} V 640 M ${bx - 14} 640 h 28" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`, { o: prog(t, c0 + d0 * 0.3, 0.4) });
    out += pop(badge('ふくらむ', { fill: FW.waterDk, size: 50, pad: 40 }), t, c0 + d0 * 0.45 + 1.2, CX, 170, { end: c1 + d1 * 0.3 });
    out += tag(CX - 120, top + H * 0.5, 330, 798, 'いちばん そとがわの さいぼう', prog(t, c0 + 0.8, 0.4), { col: FW.wr, size: 38 });
    // 昔の考え
    const oo = prog(t, c1 + 0.2, 0.5);
    if (oo > 0) {
      let c = card(700, 560);
      c += g(badge('むかしの かんがえ', { fill: C.ochre, size: 44, pad: 40 }), { y: -280 });
      c += g(fingerPad(1, { seed: 3 }), { x: -150, y: -10, s: 0.8 });
      const pu = 8 * Math.sin(t * 4);
      c += arrow2(-240, -40, -290 - pu, -40, FW.waterDk, 10) + arrow2(-60, -40, -10 + pu, -40, FW.waterDk, 10) + arrow2(-150, -150, -150, -196 - pu, FW.waterDk, 10);
      c += g(text(140, -80, 'ひふが', { size: 46, w: 900 }) + text(140, -16, 'ふくらむ から', { size: 46, w: 900, fill: FW.waterDk }) + text(140, 52, 'しわに なる', { size: 46, w: 900 }), { o: prog(t, c1 + d1 * 0.45, 0.4) });
      c += text(0, 222, 'と かんがえられて いた', { size: 40, w: 900, fill: C.muted });
      out += g(c, { x: 1420, y: 500 - (1 - eo(oo)) * 30, o: oo });
      // それだけではなかった
      out += pop(g(`<rect x="-320" y="-70" width="640" height="140" rx="30" fill="#fff" stroke="${C.red}" stroke-width="10"/>` + text(0, 4, 'それだけじゃ ない！', { size: 62, w: 900, fill: C.red }), { r: -7 }), t, c2 + 0.5, 1420, 712);
    }
    return out;
  },
});

// 4. 手がかりは神経：神経がはたらかない指は、水につけてもしわにならない → 体が自分でつくっている
SCENES.push({
  id: 'nerve',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c4 = cue(4), d4 = cueE(4) - c4;
    // 手と神経（黄色い線）
    const HX = 330, HY = 520;
    let h = handPalm(1.05);
    const nk = prog(t, c0 + 0.3, 1.0), pulse = 0.75 + 0.25 * Math.sin(t * 6);
    const np = 'M 0 250 L 0 40 ' + [[-70, -150], [-20, -184], [30, -176], [80, -140]].map(([x, y]) => `M 0 40 Q ${x * 0.5} -30 ${x} ${y + 30}`).join(' ') + ' M 0 110 Q -70 100 -128 34';
    h += `<g transform="scale(1.05)" opacity="${nk}"><path d="${np}" fill="none" stroke="#ffe27a" stroke-width="17" stroke-linecap="round" opacity="${0.4 * pulse}"/><path d="${np}" fill="none" stroke="${FW.nerve}" stroke-width="7" stroke-linecap="round"/></g>`;
    out += pop(h, t, 0.2, HX, HY);
    out += tag(HX + 22, HY + 150, HX + 190, 800, 'しんけい', prog(t, c0 + 1.0, 0.3), { col: FW.nerveDk, size: 46 });
    out += pop(badge('てがかりは「しんけい」', { fill: FW.nerve, color: C.ink, size: 48, pad: 40 }), t, c0 + 0.5, 420, 190);
    // 水につける：神経がはたらく指 と はたらかない指
    const soak = c1 + d1 * 0.5, wr = eio(prog(t, soak, 2.4));
    [[990, true, 'しんけいが はたらく'], [1500, false, 'しんけいが はたらかない']].forEach(([x, ok, name], i) => {
      let c = card(450, 620);
      c += text(0, -262, name, { size: 34, w: 900, fill: ok ? FW.nerveDk : C.muted });
      // 指（下向き）と、その中の神経
      c += `<g transform="translate(0 -30) rotate(180) scale(0.72)">${fingerPad(ok ? wr : 0, { seed: 3 })}</g>`;
      const nl = `M 0 -200 Q 14 -150 0 -110 T 0 -40`;
      c += ok ? `<path d="${nl}" fill="none" stroke="#ffe27a" stroke-width="18" stroke-linecap="round" opacity="${0.45 * pulse}"/><path d="${nl}" fill="none" stroke="${FW.nerve}" stroke-width="8" stroke-linecap="round"/>` + zap(34, -150 + ((t * 60) % 90), 1.1, 0.9)
        : `<path d="${nl}" fill="none" stroke="#a9a9a2" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 14"/>` + `<g transform="translate(46 -130)"><circle r="26" fill="#fff" stroke="${C.red}" stroke-width="6"/><path d="M -11 -11 L 11 11 M 11 -11 L -11 11" stroke="${C.red}" stroke-width="7" stroke-linecap="round"/></g>`;
      // 水の入った入れもの
      c += `<rect x="-150" y="10" width="300" height="130" fill="${FW.water}" opacity="0.4"/><path d="M -150 10 q 25 -10 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" fill="none" stroke="${FW.waterDk}" stroke-width="5" opacity="0.6"/><path d="M -160 -30 V 124 Q -160 144 -140 144 H 140 Q 160 144 160 124 V -30" fill="none" stroke="#8fb3c6" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
      c += g(text(0, 216, ok ? 'しわしわ' : 'しわに ならない', { size: ok ? 54 : 46, w: 900, fill: ok ? FW.wr : FW.waterDk }), { o: prog(t, soak + 2.0 + i * 0.6, 0.4) });
      out += pop(c, t, c1 + 0.2 + i * d1 * 0.22, x, 500);
    });
    out += pop(badge('みずに つけても…', { fill: FW.waterDk, size: 40 }), t, soak - 0.6, 1245, 150, { end: c2 - 0.2 });
    // つまり、体が自分でつくっている
    const so = prog(t, c2 - 0.1, 0.5);
    if (so > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.97 * so}"/>` + topBadge();
      out += pop(badge('しわは、からだが じぶんで つくって いる', { fill: FW.wr, size: 54, pad: 46 }), t, c2 + 0.3, 1000, 250);
      out += kidShow('B', t, 300, 850, { s: 0.6, start: cue(3) - 0.9, n: 0, end: c4 + d4 * 0.2 });
      // 心臓や汗と同じ、考えなくても動く神経
      const io = prog(t, c4 + 0.2, 0.4);
      if (io > 0) {
        const beat = 1 + 0.1 * Math.max(0, Math.sin(t * 7));
        const items = [
          [`<path d="M 0 44 C -80 -10 -60 -70 -24 -70 C -8 -70 0 -56 0 -46 C 0 -56 8 -70 24 -70 C 60 -70 80 -10 0 44 Z" fill="${FW.vessel}" transform="scale(${beat})"/>`, 'しんぞう'],
          [drop(-30, -10, 2.2) + drop(26, 6, 2.6) + drop(-6, 40, 1.6), 'あせ'],
          [g(fingerPad(1, { seed: 3 }), { s: 0.4, y: -6 }), 'ゆびの しわ'],
        ];
        items.forEach(([ic, name], i) => {
          out += pop(`<circle r="112" fill="#fff" filter="url(#shadow)"/>` + ic + text(0, 160, name, { size: 46, w: 900 }), t, c4 + d4 * (0.12 + i * 0.16), 660 + i * 360, 520);
        });
        out += g(`<path d="M 560 712 v 18 h 920 v -18 M 1020 730 v 16" fill="none" stroke="${FW.nerveDk}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`, { o: prog(t, c4 + d4 * 0.55, 0.3) });
        out += pop(badge('かんがえなくても うごく しんけい', { fill: FW.nerve, color: C.ink, size: 46, pad: 44 }), t, c4 + d4 * 0.6, 1020, 792);
      }
    }
    return out;
  },
});

// 5. しわができる順番（考えられているしくみ）① 水がしみこむ ② 神経が合図を出す
SCENES.push({
  id: 'step1',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2);
    const water = prog(t, c1 + d1 * 0.3, Math.max(2.5, d1 * 0.65)), sig = prog(t, c2 + 0.3, 1.0);
    out += g(tipSection(t, { water, sig }), { o: prog(t, 0.2, 0.5) });
    out += pop(badge('ゆびさきの なか', { fill: FW.wr, size: 40 }), t, 0.4, 300, 210);
    out += pop(badge('こう かんがえられて いる', { fill: C.ochre, size: 44, pad: 40 }), t, c0 + 0.4, 1560, 170);
    out += stepList(t, t < c1 ? 0 : t < c2 ? 1 : 2, t < c2 ? c1 : c2);
    out += g(text(1110, 262, 'おゆ', { size: 44, w: 900, fill: FW.waterDk, anchor: 'end' }), { o: prog(t, 0.6, 0.4) });
    out += tag(SEC.X0 + 2 * SEC.L, SEC.S, 600, 290, 'あせの でぐち', win(t, c1 + d1 * 0.25, c2 - 0.2, 0.3), { col: FW.waterDk, size: 40 });
    out += tag(SEC.X0 + 4.5 * SEC.L, SEC.N, 930, 740, 'しんけい', win(t, c2 + 0.2, 1e9, 0.3), { col: FW.nerveDk, size: 40 });
    out += tag(SEC.X0 + 1.2 * SEC.L, SEC.V, 330, 750, 'けっかん', win(t, 1.0, c1 + 0.3, 0.3), { col: FW.vesselDk, size: 40 });
    return out;
  },
});

// 6. ③ 血管がちぢむ → 中身が少しへる ④ 皮ふが下へ引っぱられて、しわ
SCENES.push({
  id: 'step2',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    const shrink = eio(prog(t, c0 + d0 * 0.4, 2.0)), pull = eio(prog(t, c2 + d2 * 0.25, Math.max(2.2, d2 * 0.6)));
    out += tipSection(t, { water: 1, sig: 1 - 0.6 * prog(t, c1, 1.5), shrink, pull });
    out += pop(badge('ゆびさきの なか', { fill: FW.wr, size: 40 }), t, -1, 300, 210);
    out += pop(badge('こう かんがえられて いる', { fill: C.ochre, size: 44, pad: 40 }), t, -1, 1560, 170);
    out += stepList(t, t < c0 ? 2 : t < c2 ? 3 : 4, t < c2 ? c0 : c2);
    out += tag(SEC.X0 + 1.2 * SEC.L, SEC.V, 330, 750, 'けっかん', win(t, c0 + 0.2, c2 - 0.2, 0.3), { col: FW.vesselDk, size: 40 });
    out += pop(badge('きゅっ', { fill: FW.vesselDk, size: 54, pad: 40 }), t, c0 + d0 * 0.4 + 0.6, 650, 520, { end: c1 - 0.1 });
    out += pop(badge('なかみが すこし へる', { fill: '#fff', color: FW.vesselDk, size: 44, pad: 40 }), t, c1 + d1 * 0.4, 650, 520, { end: c2 - 0.1 });
    out += tag(SEC.X0 + 3.5 * SEC.L, SEC.S + 40, 760, 290, 'しわ', win(t, c2 + d2 * 0.25 + 1.6, 1e9, 0.3), { col: FW.wr, size: 50 });
    out += pop(badge('したへ ひっぱられる', { fill: C.ochre, size: 44, pad: 40 }), t, c2 + d2 * 0.25 + 0.4, 650, 520);
    out += kidShow('K', t, 1660, 890, { s: 0.62, start: cue(3) - 0.8, n: 0, bubble: false, mouth: lineOf('K') ? 'open' : 'smile' });
    out += talkBubble('K', 1580, 706, 1590, 772, 40);
    return out;
  },
});

// 7. しわの形は、毎回同じ。血管の場所がほとんど変わらないから
SCENES.push({
  id: 'same',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    out += pop(badge('しわの かたちは、まいかい おなじ', { fill: FW.wr, size: 50, pad: 44 }), t, c0 + 0.4, 1040, 150);
    const cards = [[400, '1かいめ', c0 + 0.8], [960, '1にち いじょう あと', c1 + d1 * 0.15]];
    cards.forEach(([x, name, st], i) => {
      let c = card(480, 560) + text(0, -226, name, { size: 40, w: 900, fill: C.muted });
      c += g(fingerPad(eio(prog(t, st + 0.5, 1.6)), { seed: 3 }), { y: -10, s: 0.92 });
      c += `<rect x="-150" y="-128" width="300" height="230" rx="20" fill="${FW.water}" opacity="${0.16 * win(t, st + 0.2, st + 2.6, 0.4)}"/>`;
      c += g(drop(-170, -190, 1.6) + drop(-140, -160, 1.1), { o: win(t, st + 0.2, st + 2.6, 0.4) });
      out += pop(c, t, st, x, 500);
    });
    // おなじ形
    const eq = c1 + d1 * 0.7;
    out += pop(`<circle r="58" fill="${C.ochre}"/>` + text(0, 2, '＝', { size: 70, w: 900, fill: '#fff' }), t, eq, 680, 500);
    out += pop(badge('おなじ かたち！', { fill: C.ochre, size: 46, pad: 40 }), t, eq + 0.4, 680, 792);
    // 血管の場所が、ほとんど変わらない
    const vo = prog(t, c2 + 0.1, 0.5);
    if (vo > 0) {
      let c = card(480, 560) + text(0, -226, 'ひふの した', { size: 40, w: 900, fill: FW.vesselDk });
      c += g(fingerPad(0.0, { seed: 3 }).replace(/<g opacity[^]*?<\/g>/, '') + wrLines(1, 3, FW.vessel, 11) + `<path d="M -27 98 Q -20 170 -10 220 M 27 98 Q 20 170 10 220 M 0 98 V 220 M -52 98 Q -44 160 -30 220 M 52 98 Q 44 160 30 220" fill="none" stroke="${FW.vessel}" stroke-width="9" stroke-linecap="round" opacity="0.85"/>`, { y: -10, s: 0.92 });
      out += g(c, { x: 1520, y: 500 - (1 - eo(vo)) * 30, o: vo });
      out += pop(badge('けっかんの ばしょが かわらない', { fill: FW.vesselDk, size: 38 }), t, c2 + d2 * 0.5, 1500, 792);
      out += g(arrow2(1210, 500, 1270, 500, C.ink, 12), { o: prog(t, c2 + 0.5, 0.3) });
    }
    return out;
  },
});

// 8. 何のため？ つかみやすくなるという考え。早くなった実験と、ちがいが出なかった実験。まだわかっていない
function marbleBowl(x, y, s = 1) {
  const cols = ['#e8574c', '#f6b500', '#36b24a', '#8a5cf0', '#2f86ff'];
  let o = `<path d="M -120 -40 Q -120 50 -60 50 H 60 Q 120 50 120 -40 Z" fill="${FW.waterLt}" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/>`;
  cols.forEach((c, i) => { o += `<circle cx="${-64 + i * 32}" cy="${22 - (i % 2) * 8}" r="16" fill="${c}"/><circle cx="${-69 + i * 32}" cy="${16 - (i % 2) * 8}" r="5" fill="#fff" opacity="0.7"/>`; });
  return `<g transform="translate(${x} ${y}) scale(${s})">${o}</g>`;
}
SCENES.push({
  id: 'why',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4);
    // 何のため？
    const q0 = 1 - prog(t, c1 - 0.3, 0.4);
    if (q0 > 0) out += g(pop(g(fingerPad(1, { seed: 3 }), { s: 1.0 }), t, c0 + 0.2, 760, 500) + pop(text(0, 0, '？', { size: 300, w: 900, fill: C.ochre }), t, c0 + 0.9, 1130, 470) + pop(badge('なんの ため？', { fill: C.ochre, size: 56, pad: 46 }), t, c0 + 1.2, 960, 840 - 30), { o: q0 });
    const po = prog(t, c1 - 0.1, 0.4);
    if (po > 0) {
      out += pop(badge('しわは なんの ため？', { fill: C.ochre, size: 46, pad: 40 }), t, c1, 1000, 150);
      // 考え：タイヤのみぞのように
      let a = card(560, 560) + g(badge('かんがえ', { fill: C.accent, size: 36 }), { y: -280 });
      a += `<g transform="translate(-130 -70)"><circle r="104" fill="#3a3f45"/><circle r="50" fill="#cfd4d9"/><circle r="18" fill="#8d959c"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => `<path d="M 0 -100 q 12 16 0 30" fill="none" stroke="#9aa3ab" stroke-width="8" stroke-linecap="round" transform="rotate(${k * 30 + t * 30})"/>`).join('')}</g>`;
      for (let i = 0; i < 6; i++) { const f = (t * 0.9 + i / 6) % 1; a += drop(-250 + i * 48, lerp(-230, -180, f), 0.8, FW.water, Math.min(1, f * 5, (1 - f) * 4)); }
      a += `<path d="M -250 40 q 30 -10 60 0 t 60 0 t 60 0 t 60 0" fill="none" stroke="${FW.water}" stroke-width="8" stroke-linecap="round"/>`;
      a += g(fingerPad(1, { seed: 3 }), { x: 150, y: -80, s: 0.6 });
      a += text(-130, 80, 'タイヤの みぞ', { size: 36, w: 900 }) + text(150, 80, 'ゆびの しわ', { size: 36, w: 900 });
      a += text(0, 166, 'ぬれた ものを', { size: 42, w: 900, fill: FW.waterDk }) + text(0, 222, 'つかみやすく する？', { size: 42, w: 900, fill: FW.waterDk });
      out += pop(a, t, c1 + 0.3, 340, 500);
      // 実験：早く移せた
      const barRow = (y, name, len, col, st) => text(-230, y, name, { size: 34, w: 900, anchor: 'start' }) + `<rect x="-60" y="${y - 20}" width="${len * eo(prog(t, st, 0.8))}" height="40" rx="20" fill="${col}"/>`;
      let b = card(560, 560) + g(badge('ある じっけん', { fill: C.blueUi, size: 36 }), { y: -280 });
      b += marbleBowl(-120, -130, 0.9) + arrow2(-10, -150, 60, -150, C.ink, 9) + `<path d="M 60 -170 Q 60 -80 110 -80 H 190 Q 240 -80 240 -170 Z" fill="#fff" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/>`;
      const mv = ((t - c2) * 0.6 % 1 + 1) % 1; b += `<circle cx="${lerp(-120, 150, eio(mv))}" cy="${-150 - Math.sin(mv * Math.PI) * 60}" r="15" fill="#e8574c"/>`;
      b += text(-240, -30, 'みずの なかの ビーだまを うつす', { size: 28, w: 900, fill: C.muted, anchor: 'start' });
      b += barRow(46, 'しわしわ', 170, FW.wr, c2 + d2 * 0.45) + barRow(106, 'つるつる', 240, '#b9b6ab', c2 + d2 * 0.55) + text(240, 6, 'かかった じかん', { size: 26, w: 900, fill: C.muted, anchor: 'end' });
      b += g(text(0, 200, 'しわしわの ほうが はやい', { size: 40, w: 900, fill: FW.wr }), { o: prog(t, c2 + d2 * 0.7, 0.4) });
      out += pop(b, t, c2 + 0.2, 960, 500);
      // べつの実験：ちがいが出なかった
      let d = card(560, 560) + g(badge('べつの じっけん', { fill: C.redUi, size: 36 }), { y: -280 });
      d += marbleBowl(-120, -130, 0.9) + arrow2(-10, -150, 60, -150, C.ink, 9) + `<path d="M 60 -170 Q 60 -80 110 -80 H 190 Q 240 -80 240 -170 Z" fill="#fff" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/>`;
      d += text(-240, -30, 'ぬれた ものを うつす', { size: 28, w: 900, fill: C.muted, anchor: 'start' });
      d += barRow(46, 'しわしわ', 210, FW.wr, c3 + d3 * 0.4) + barRow(106, 'つるつる', 210, '#b9b6ab', c3 + d3 * 0.5) + text(240, 6, 'かかった じかん', { size: 26, w: 900, fill: C.muted, anchor: 'end' });
      d += g(text(0, 200, 'ちがいが でなかった', { size: 40, w: 900, fill: C.redUi }), { o: prog(t, c3 + d3 * 0.7, 0.4) });
      out += pop(d, t, c3 + 0.2, 1580, 500);
      // まだわかっていない
      const uo = prog(t, c4 + 0.2, 0.5);
      if (uo > 0) out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.8 * uo}"/>` + topBadge() + pop(g(`<rect x="-520" y="-130" width="1040" height="260" rx="50" fill="#fff" stroke="${C.ochre}" stroke-width="12" filter="url(#shadow)"/>` + text(-320, 8, '？', { size: 190, w: 900, fill: C.ochre }) + text(90, -44, 'なんの ためかは', { size: 60, w: 900 }) + text(90, 46, 'まだ わかって いない', { size: 66, w: 900, fill: C.ochre }), {}), t, c4 + 0.5, 960, 480);
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2);
    const aO = 1 - prog(t, c2 - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1400, 170) + `<circle cx="-610" cy="0" r="50" fill="${C.blueUi}"/>` + text(-610, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-530, 2, 'ゆびの なかの けっかんが、きゅっと ちぢむから', { size: 50, w: 900, anchor: 'start' }), t, 0.4, 960, 330);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 350, y: 330, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['しんけいが あいず', FW.nerveDk], ['けっかんが ちぢむ', FW.vesselDk], ['ひふが ひっぱられる', C.ochre]], t, 960, 500, { start: 2.6, step: 1.1, size: 38 });
      // ② も本当。でも、それだけではしわにならない
      a += pop(card(1400, 200) + `<circle cx="-610" cy="-36" r="42" fill="${C.accent}"/>` + text(-610, -33, '②', { size: 48, w: 900, fill: '#fff' }) + text(-540, -36, 'ひふが みずを すって ふくらむのも、ほんとう', { size: 44, w: 900, anchor: 'start' }) +
        g(text(-540, 44, 'でも、それだけでは しわに ならない', { size: 46, w: 900, anchor: 'start', fill: C.red }), { o: prog(t, c1 + d1 * 0.5, 0.4) }), t, c1 + 0.2, 960, 690);
      out += g(a, { o: aO });
    }
    const bO = prog(t, c2 - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, c2 - 0.2, 400, 190);
      const bathIc = `<path d="M -56 -6 H 56 V 16 Q 56 40 30 40 H -30 Q -56 40 -56 16 Z" fill="#fff" stroke="#8fb3c6" stroke-width="6" stroke-linejoin="round"/><rect x="-48" y="-2" width="96" height="12" fill="${FW.waterLt}"/><path d="M -24 -24 q 8 -10 0 -20 M 4 -24 q 8 -10 0 -20 M 30 -24 q 8 -10 0 -20" fill="none" stroke="#9cc4dc" stroke-width="5" stroke-linecap="round"/>`;
      const items = [
        [bathIc, 'おふろで、ゆびさきと ての こうを くらべる', 'どっちが さきに しわしわに なるかな', C.ink, 360],
        [warnIcon(0.9), 'おふろは、おとなと いっしょに', 'あつい おゆに ながく はいりすぎない。のぼせる まえに でる', C.red, 560],
      ];
      items.forEach(([ic, s1, s2, col, y], i) => {
        b += pop(ic + text(110, -30, s1, { size: 42, w: 900, anchor: 'start', fill: col }) + text(110, 32, s2, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 2), 190, y);
      });
      // 指先（はら）と 手のこう
      let p = card(470, 300);
      p += g(fingerPad(eio(prog(t, c2 + 2.0, 5)), { seed: 3 }), { x: -110, y: -10, s: 0.5 }) + text(-110, 120, 'ゆびさき', { size: 34, w: 900 });
      p += `<g transform="translate(110 -4) scale(0.36)"><rect x="-66" y="70" width="132" height="190" rx="48" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7"/>${[[-92, -150], [-42, -184], [8, -176], [58, -140]].map(([x, y]) => `<rect x="${x}" y="${y}" width="44" height="${-y + 20}" rx="22" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7"/><rect x="${x + 9}" y="${y + 8}" width="26" height="30" rx="11" fill="#fbeee6" stroke="${FW.skinDk}" stroke-width="4"/>`).join('')}<rect x="116" y="-36" width="52" height="150" rx="26" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7" transform="rotate(32 142 80)"/><rect x="-104" y="-76" width="216" height="210" rx="64" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7"/></g>` + text(110, 120, 'ての こう', { size: 34, w: 900 });
      p += text(0, -112, 'どっちが さき？', { size: 36, w: 900, fill: C.ochre });
      b += pop(p, t, c2 + 0.6, 1610, 300);
      b += kidShow('K', t, 1720, 800, { s: 0.72, start: c2 + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ゆび」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

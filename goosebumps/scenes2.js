// みのまわり図鑑 動画「さむいと、どうして とりはだが たつの？」（とりはだ）
// 出どころ：everyday-trivia trivia/goosebumps-cold.md（絵の見本：assets/figures-goosebumps.js、メモ：ideas/notes/goosebumps.md）
// 色の約束：けの ねもとの きんにく＝あか、しんけいの あいず＝きいろ、け＝こげちゃ、くうき＝みずいろの つぶ、ねつ＝オレンジの矢印。

// ---------- とりはだの道具 ----------
const GB = {
  skin: '#f6d6bd', skinD: '#e6b592', derm: '#fbe7d8', hair: '#5b4636', muscle: '#d9523f', muscleDk: '#a93a2b',
  nerve: '#f2c230', nerveDk: '#b98a08', air: '#7cc6ee', airDk: '#3d8fc4', heat: '#f08a2e', heatDk: '#c96a14',
  fur: '#b0835a', furL: '#f0e2c0', furD: '#8a6446', cold: '#cfe6f5', coldDk: '#6a98bd', wall: '#f3ead8', floor: '#d9c7a8',
  cat: '#e3a25c', catD: '#c07f3c', skyT: '#c3dcee', skyB: '#eef6fb',
};
const rad = a => a * Math.PI / 180;
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// ねつの矢印（オレンジ。白いふちつき）
const heatArrow = (x1, y1, x2, y2, o = 1, w = 12) => o <= 0 ? '' : `<g opacity="${o}">${arrow2(x1, y1, x2, y2, '#fff', w + 8)}${arrow2(x1, y1, x2, y2, GB.heat, w)}</g>`;
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
// 大きな文字（ふちつき）
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 16 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
// ゆきの つぶ
const flake = (x, y, r = 12, col = GB.coldDk, o = 1) => `<g transform="translate(${x} ${y})" opacity="${o}" stroke="${col}" stroke-width="${Math.max(2.5, r * 0.28)}" stroke-linecap="round">${[0, 60, 120].map(a => `<line x1="${-r}" y1="0" x2="${r}" y2="0" transform="rotate(${a})"/>`).join('')}</g>`;
// ふる ゆき（きまった乱数。ゆっくり落ちる）
function snowfall(t, x, y, w, h, n = 16, seed = 1, col = '#fff') {
  let s = '';
  for (let i = 0; i < n; i++) { const f = ((t * (0.05 + rnd(i, seed) * 0.05) + rnd(i, seed + 1)) % 1 + 1) % 1; s += `<circle cx="${(x + rnd(i, seed + 2) * w + Math.sin(t * 1.3 + i) * 10).toFixed(1)}" cy="${(y + f * h).toFixed(1)}" r="${4 + rnd(i, seed + 3) * 4}" fill="${col}" opacity="0.9"/>`; }
  return s;
}
// つめたい かぜ（みずいろの うずまき線）
const windLine = (x, y, s = 1, o = 1) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}" fill="none" stroke="${GB.coldDk}" stroke-width="8" stroke-linecap="round"><path d="M 0 0 h 90 q 28 0 28 -22 t -22 -22"/><path d="M 10 34 h 130 q 28 0 28 22 t -22 22"/><path d="M 30 68 h 60"/></g>`;

// うで（よこ向きの 丸い ぼう）と ぶつぶつ。k: ぶつぶつの 出ぐあい 0〜1（左から順に出る）
function armBand(x, y, w, h, k, { seed = 1, hair = true, rows = 2, o = 1 } = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${GB.skin}" stroke="${C.ink}" stroke-width="6"/>`;
  const n = Math.floor((w - h) / (h * 0.36));
  for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
    const bx = x + h * 0.5 + (i + (j % 2) * 0.5) * (w - h) / n + 6, by = y + h * (j + 1) / (rows + 1) + h * 0.04, kk = clamp(k * (n + 3) - i - j * 0.5);
    if (kk <= 0) continue;
    const r = h * 0.075 * back(kk);
    s += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${r.toFixed(1)}" fill="${GB.skinD}"/>` + (hair ? `<line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${(bx + r * 0.5).toFixed(1)}" y2="${(by - r * 2.6).toFixed(1)}" stroke="${GB.hair}" stroke-width="${Math.max(2, h * 0.02)}" stroke-linecap="round"/>` : '');
  }
  return g(s, { o });
}
// まるの中に見える、はだの 大うつし（ぶつぶつが ならぶ）。k: 出ぐあい
function skinZoom(r, k, id, { hair = true } = {}) {
  let s = `<clipPath id="${id}"><circle r="${r}"/></clipPath><circle r="${r}" fill="${GB.skin}"/><g clip-path="url(#${id})">`;
  s += `<ellipse cx="${-r * 0.3}" cy="${-r * 0.5}" rx="${r * 0.9}" ry="${r * 0.5}" fill="#fff" opacity="0.25"/>`;
  let i = 0;
  for (let yy = -r + 40; yy < r; yy += 78) for (let xx = -r + 30 + ((Math.round(yy / 78) % 2) ? 44 : 0); xx < r; xx += 88, i++) {
    const kk = clamp(k * 30 - rnd(i, 4) * 22);
    if (kk <= 0) continue;
    const br = 13 * back(kk);
    s += `<ellipse cx="${xx}" cy="${yy + 5}" rx="${br * 1.5}" ry="${br * 1.1}" fill="${GB.skinD}" opacity="0.55"/><circle cx="${xx}" cy="${yy}" r="${br}" fill="${mix(GB.skin, GB.skinD, 0.75)}"/><circle cx="${xx - br * 0.3}" cy="${yy - br * 0.3}" r="${br * 0.35}" fill="#fff" opacity="0.5"/>` +
      (hair ? `<line x1="${xx}" y1="${yy}" x2="${xx + 9}" y2="${yy - 34 * kk}" stroke="${GB.hair}" stroke-width="4" stroke-linecap="round"/>` : '');
  }
  return s + `</g><circle r="${r}" fill="none" stroke="${C.blueUi}" stroke-width="16"/><path d="M ${-r * 0.56} ${-r * 0.44} A ${r * 0.72} ${r * 0.72} 0 0 1 ${-r * 0.1} ${-r * 0.7}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.8"/>`;
}
// 3次ベジエの上の点
const bez = (p0, p1, p2, p3, u) => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
// ひふを よこから きった え。(x, y) は ひふの表面の左はし、s は大きさ。k: きんにくの ちぢみぐあい 0（ゆるむ・けは ねている）〜 1（ちぢむ・けが たつ）
//   nerve: しんけい（きいろ）の見えぐあい。pulses: しんけいを走る あいずの位置（0〜1）の配列。mglow: きんにくを 光らせる。
//   かえす値：{ svg, E（けの出口）, R（ねもと）, T（けの先）, M（きんにくの まん中）, A, N, NV（しんけいの と中） }（画面の座標）
function skinCut(x, y, s, k, id, { W = 760, D = 340, nerve = 0, pulses = [], mglow = 0 } = {}) {
  const ex = 320, bump = 32 * k, a = rad(lerp(36, 80, k)), Lf = 236, Lh = 214;
  const E = [ex, -bump], R = [E[0] - Lf * Math.cos(a), E[1] + Lf * Math.sin(a)], T = [E[0] + Lh * Math.cos(a), E[1] - Lh * Math.sin(a)];
  const A = [lerp(E[0], R[0], 0.62), lerp(E[1], R[1], 0.62)], N = [ex + 196, 52 + 6 * k], M = [(A[0] + N[0]) / 2, (A[1] + N[1]) / 2 + 12 * (1 - k)];
  const surf = `M 0 0 H ${ex - 120} Q ${ex - 64} 0 ${ex - 36} ${-bump * 0.6} Q ${ex} ${-bump * 1.4} ${ex + 36} ${-bump * 0.6} Q ${ex + 64} 0 ${ex + 120} 0 H ${ex + 160} Q ${ex + 196} ${12 * k} ${ex + 232} 0 H ${W}`;
  const body = `${surf} V ${D} H 0 Z`;
  let o = `<clipPath id="${id}"><path d="${body}"/></clipPath>`;
  o += `<path d="${body}" fill="${GB.skin}"/><g clip-path="url(#${id})"><path d="${body}" fill="${GB.derm}" transform="translate(0 44)"/>`;
  // うすい もよう（ひふの中）
  for (let i = 0; i < 16; i++) o += `<ellipse cx="${(rnd(i, 31) * W).toFixed(0)}" cy="${(90 + rnd(i, 32) * (D - 110)).toFixed(0)}" rx="${10 + rnd(i, 33) * 14}" ry="${6 + rnd(i, 34) * 6}" fill="${GB.skin}" opacity="0.5"/>`;
  // しんけい（きいろ）
  const n0 = [ex + 330, D + 10], n1 = [ex + 330, D - 130], n2 = [M[0] + 150, M[1] + 170], n3 = [M[0] + 16, M[1] + 22];
  if (nerve > 0) {
    o += `<g opacity="${nerve}"><path d="M ${n0} C ${n1} ${n2} ${n3}" fill="none" stroke="${GB.nerveDk}" stroke-width="15" stroke-linecap="round"/><path d="M ${n0} C ${n1} ${n2} ${n3}" fill="none" stroke="${GB.nerve}" stroke-width="9" stroke-linecap="round"/><circle cx="${n3[0]}" cy="${n3[1]}" r="12" fill="${GB.nerve}" stroke="${GB.nerveDk}" stroke-width="4"/>`;
    pulses.forEach(u => { if (u > 0 && u < 1) { const [px, py] = bez(n0, n1, n2, n3, u); o += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="26" fill="#fff6c8" opacity="0.9" filter="url(#soft)"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="12" fill="#fff"/>`; } });
    o += `</g>`;
  }
  // けの ふくろ（毛包）と ねもと
  o += `<line x1="${R[0]}" y1="${R[1]}" x2="${E[0]}" y2="${E[1]}" stroke="${GB.skinD}" stroke-width="40" stroke-linecap="round"/><circle cx="${R[0]}" cy="${R[1]}" r="30" fill="${GB.skinD}"/>`;
  // きんにく（あか）
  const mw = lerp(20, 34, k), md = `M ${A[0]} ${A[1]} Q ${M[0]} ${M[1]} ${N[0]} ${N[1]}`;
  if (mglow > 0) o += `<path d="${md}" fill="none" stroke="#fff3a8" stroke-width="${mw + 34}" stroke-linecap="round" opacity="${0.8 * mglow}" filter="url(#soft)"/>`;
  o += `<path d="${md}" fill="none" stroke="${GB.muscleDk}" stroke-width="${mw + 8}" stroke-linecap="round"/><path d="${md}" fill="none" stroke="${GB.muscle}" stroke-width="${mw}" stroke-linecap="round"/><path d="${md}" fill="none" stroke="#f08a78" stroke-width="${mw * 0.25}" stroke-linecap="round" stroke-dasharray="14 12"/>`;
  o += `</g>`;
  // け（こげちゃ）
  o += `<line x1="${R[0]}" y1="${R[1]}" x2="${T[0]}" y2="${T[1]}" stroke="${GB.hair}" stroke-width="11" stroke-linecap="round"/>`;
  // ふち
  o += `<path d="${surf}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M 0 0 V ${D} H ${W} V 0" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round" opacity="0.35"/>`;
  const P = p => [x + p[0] * s, y + p[1] * s];
  return { svg: `<g transform="translate(${x} ${y}) scale(${s})">${o}</g>`, E: P(E), R: P(R), T: P(T), M: P(M), A: P(A), N: P(N), NV: P(bez(n0, n1, n2, n3, 0.3)) };
}
// けがわ（または 人の はだ）を よこから見た え。(x, y) は はだの表面の左はし。k: けの たちぐあい 0〜1。heat: ねつの矢印の見えぐあい
//   human: 人の はだ（けが 少なくて みじかい）。くうきの つぶは たまらずに ながれていく
function furPanel(x, y, w, k, t, { heat = 0, human = false, air = 1, skinH = 70 } = {}) {
  const n = human ? 4 : 15, L = human ? 78 : 250, a = rad(lerp(human ? 26 : 17, 85, k)), H = L * Math.sin(a);
  let o = '';
  // くうきの つぶ（みずいろ）
  if (air > 0) {
    const nd = human ? 7 : 80;
    for (let i = 0; i < nd; i++) {
      const hh = 12 + rnd(i, 22) * 228;
      if (human) { const f = ((t * (0.16 + rnd(i, 24) * 0.1) + rnd(i, 21)) % 1 + 1) % 1; o += `<circle cx="${(x + f * w).toFixed(1)}" cy="${(y - 20 - rnd(i, 22) * 150 + Math.sin(t * 2 + i) * 8).toFixed(1)}" r="9" fill="${GB.air}" opacity="${(0.75 * air * Math.min(1, f * 6, (1 - f) * 6)).toFixed(2)}"/>`; continue; }
      const vis = clamp((H * 0.96 - hh) / 16);
      if (vis <= 0) continue;
      o += `<circle cx="${(x + 16 + rnd(i, 21) * (w - 32) + Math.sin(t * 1.6 + i) * 3).toFixed(1)}" cy="${(y - hh + Math.cos(t * 1.3 + i * 2) * 3).toFixed(1)}" r="9" fill="${GB.air}" stroke="${GB.airDk}" stroke-width="2" opacity="${(0.9 * vis * air).toFixed(2)}"/>`;
    }
  }
  // はだ
  o += `<rect x="${x}" y="${y}" width="${w}" height="${skinH}" fill="${GB.skin}"/><line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${C.ink}" stroke-width="5"/>`;
  // け
  for (let i = 0; i < n; i++) {
    const bx = x + (human ? w * (0.16 + i * 0.22) : 18 + i * (w - 60) / (n - 1)), tx = bx + L * Math.cos(a), ty = y - H;
    if (human && k > 0) o += `<path d="M ${bx - 24} ${y} Q ${bx} ${y - 22 * k} ${bx + 24} ${y} Z" fill="${GB.skin}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><rect x="${bx - 22}" y="${y - 1}" width="44" height="6" fill="${GB.skin}"/>`;
    o += `<path d="M ${bx} ${y + (human ? 0 : 6)} Q ${lerp(bx, tx, 0.5) - L * 0.06 * (1 - k)} ${lerp(y, ty, 0.5) - L * 0.1 * (1 - k)} ${tx} ${ty}" fill="none" stroke="${human ? GB.hair : GB.fur}" stroke-width="${human ? 6 : 9}" stroke-linecap="round"/>`;
  }
  // ねつ（オレンジの矢印）。けがわで けが たつと みじかくなる
  if (heat > 0) {
    const len = human ? 285 : lerp(285, 110, k), wob = 10 * Math.sin(t * 4);
    [0.2, 0.5, 0.8].forEach((f, i) => { o += heatArrow(x + w * f + 14, y + 34, x + w * f + 14, y + 34 - len - wob * (i % 2 ? 1 : -1) * 0.6, heat, 13); });
  }
  return o;
}
// スズメ（左向き）。(x, y) は 足もと（とまっている所）。k: ふくらみぐあい 0 ふつう 〜 1 まんまる
function sparrow(x, y, s, k = 0, t = 0, { air = 0 } = {}) {
  const rx = lerp(50, 66, k), ry = lerp(36, 58, k), cy = -ry - 10, hx = -lerp(42, 34, k), hy = cy - lerp(28, 36, k);
  let o = `<path d="M ${rx - 12} ${cy - 2} l 62 16 l -56 16 Z" fill="${GB.furD}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  o += `<path d="M -12 -14 v 16 M 12 -14 v 16" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  o += `<ellipse cx="0" cy="${cy}" rx="${rx}" ry="${ry}" fill="${GB.fur}" stroke="${C.ink}" stroke-width="5"/>`;
  o += `<ellipse cx="${-rx * 0.16}" cy="${cy + ry * 0.36}" rx="${rx * 0.72}" ry="${ry * 0.56}" fill="${GB.furL}"/>`;
  o += `<path d="M ${rx * 0.06} ${cy - ry * 0.34} Q ${rx * 0.78} ${cy - ry * 0.5} ${rx * 0.84} ${cy + ry * 0.26} Q ${rx * 0.3} ${cy + ry * 0.44} ${rx * 0.06} ${cy - ry * 0.34} Z" fill="${GB.furD}"/>`;
  if (k > 0.05) for (let i = 0; i < 9; i++) { const q = rad(200 + i * 40), px = Math.cos(q) * rx, py = cy + Math.sin(q) * ry; o += `<path d="M ${px.toFixed(1)} ${py.toFixed(1)} q ${(Math.cos(q) * 10).toFixed(1)} ${(Math.sin(q) * 10).toFixed(1)} ${(Math.cos(q + 1) * 12).toFixed(1)} ${(Math.sin(q + 1) * 12).toFixed(1)}" fill="none" stroke="${GB.furD}" stroke-width="4" stroke-linecap="round" opacity="${k}"/>`; }
  if (air > 0) for (let i = 0; i < 7; i++) { const q = rad(20 + i * 51), rr = 0.5 + 0.2 * rnd(i, 5); o += `<circle cx="${(Math.cos(q) * rx * rr + Math.sin(t * 2 + i) * 2).toFixed(1)}" cy="${(cy + Math.sin(q) * ry * rr).toFixed(1)}" r="6" fill="${GB.air}" stroke="${GB.airDk}" stroke-width="1.5" opacity="${air}"/>`; }
  o += `<circle cx="${hx}" cy="${hy}" r="30" fill="#8a5a3a" stroke="${C.ink}" stroke-width="5"/><path d="M ${hx - 24} ${hy + 4} Q ${hx - 6} ${hy + 30} ${hx + 20} ${hy + 14} Q ${hx} ${hy - 6} ${hx - 24} ${hy + 4} Z" fill="#fbf3e2"/><circle cx="${hx - 2}" cy="${hy + 10}" r="6" fill="${C.ink}"/>`;
  o += `<circle cx="${hx - 12}" cy="${hy - 6}" r="5" fill="${C.ink}"/><circle cx="${hx - 13.5}" cy="${hy - 7.5}" r="1.8" fill="#fff"/><path d="M ${hx - 28} ${hy - 4} l -16 7 l 16 7 Z" fill="${C.ink}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${o}</g>`;
}
// ねこ（左向き）。(x, y) は 足もと。k: けを さかだてる ぐあい 0〜1（せなかが まるく、大きく見える）
function cat(x, y, s, k = 0, { col = GB.cat, ghost = false } = {}) {
  const L = (a, b) => lerp(a, b, k), leg = L(34, 50);
  const body = `M ${L(-90, -100)} 0 Q ${L(-98, -122)} ${L(-80, -120)} ${L(-30, -20)} ${L(-86, -152)} Q ${L(30, 40)} ${L(-90, -176)} ${L(80, 92)} ${L(-86, -140)} Q ${L(122, 146)} ${L(-82, -104)} ${L(120, 132)} 0 Z`;
  const hx = L(-86, -104), hy = L(-92, -112);
  if (ghost) return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="12 10"><g transform="translate(0 ${-leg})"><path d="${body}"/></g></g>`;
  let o = `<g transform="translate(0 ${-leg})">`;
  o += `<path d="M ${L(112, 124)} ${L(-40, -60)} Q ${L(176, 170)} ${L(-44, -110)} ${L(184, 176)} ${L(-104, -206)}" fill="none" stroke="${C.ink}" stroke-width="${L(22, 46)}" stroke-linecap="round"/><path d="M ${L(112, 124)} ${L(-40, -60)} Q ${L(176, 170)} ${L(-44, -110)} ${L(184, 176)} ${L(-104, -206)}" fill="none" stroke="${col}" stroke-width="${L(13, 36)}" stroke-linecap="round"/>`;
  [-70, -36, 70, 104].forEach(lx => { o += `<rect x="${lx - 9}" y="-8" width="18" height="${leg + 8}" rx="9" fill="${col}" stroke="${C.ink}" stroke-width="5"/>`; });
  if (k > 0.05) for (let i = 0; i < 13; i++) { const u = i / 12, px = lerp(-100, 132, u), py = -150 * Math.sin(Math.PI * (0.12 + u * 0.76)) - 6, q = rad(lerp(-150, -30, u)); o += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${(px + Math.cos(q) * 34).toFixed(1)}" y2="${(py + Math.sin(q) * 34).toFixed(1)}" stroke="${C.ink}" stroke-width="11" stroke-linecap="round" opacity="${k}"/><line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${(px + Math.cos(q) * 34).toFixed(1)}" y2="${(py + Math.sin(q) * 34).toFixed(1)}" stroke="${col}" stroke-width="5" stroke-linecap="round" opacity="${k}"/>`; }
  o += `<path d="${body}" fill="${col}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`;
  [-40, 10, 60].forEach(sx2 => { o += `<path d="M ${L(sx2, sx2 * 1.1)} ${L(-84, -150)} q 6 ${L(22, 30)} -2 ${L(40, 56)}" fill="none" stroke="${GB.catD}" stroke-width="8" stroke-linecap="round"/>`; });
  o += `<path d="M ${hx - 40} ${hy - 20} l 4 -44 l 30 24 Z M ${hx + 6} ${hy - 40} l 22 -34 l 14 40 Z" fill="${col}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><circle cx="${hx}" cy="${hy}" r="44" fill="${col}" stroke="${C.ink}" stroke-width="5"/>`;
  o += k > 0.5 ? `<circle cx="${hx - 20}" cy="${hy - 6}" r="9" fill="#fff" stroke="${C.ink}" stroke-width="3"/><circle cx="${hx - 22}" cy="${hy - 6}" r="4" fill="${C.ink}"/><circle cx="${hx + 8}" cy="${hy - 8}" r="9" fill="#fff" stroke="${C.ink}" stroke-width="3"/><circle cx="${hx + 6}" cy="${hy - 8}" r="4" fill="${C.ink}"/><path d="M ${hx - 18} ${hy + 16} l 8 8 l 8 -8" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle cx="${hx - 20}" cy="${hy - 6}" r="5" fill="${C.ink}"/><circle cx="${hx + 8}" cy="${hy - 8}" r="5" fill="${C.ink}"/><path d="M ${hx - 16} ${hy + 12} q 5 8 10 0 q 5 8 10 0" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
  o += `<path d="M ${hx - 30} ${hy + 8} l -30 -4 M ${hx - 30} ${hy + 16} l -30 8" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/><circle cx="${hx - 8}" cy="${hy + 6}" r="4" fill="#d36a5a"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${o}</g></g>`;
}
// はねを とった とり（まるい からだに、ぶつぶつ）
function bareBird(s = 1) {
  let o = `<path d="M 84 -30 l 60 -22 l -6 34 Z" fill="${GB.skin}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M -20 60 v 46 m 0 0 l -16 10 m 16 -10 l 14 12 M 30 60 v 46 m 0 0 l -16 10 m 16 -10 l 14 12" fill="none" stroke="#d9a04a" stroke-width="7" stroke-linecap="round"/>`;
  o += `<ellipse cx="6" cy="0" rx="100" ry="74" fill="${GB.skin}" stroke="${C.ink}" stroke-width="5"/><path d="M -10 -6 Q 50 -30 70 20 Q 30 40 -10 -6 Z" fill="${mix(GB.skin, GB.skinD, 0.45)}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  o += `<path d="M -74 -40 Q -92 -84 -86 -112" fill="none" stroke="${C.ink}" stroke-width="42" stroke-linecap="round"/><path d="M -74 -36 Q -92 -84 -86 -112" fill="none" stroke="${GB.skin}" stroke-width="32" stroke-linecap="round"/>`;
  o += `<circle cx="-88" cy="-124" r="32" fill="${GB.skin}" stroke="${C.ink}" stroke-width="5"/><path d="M -116 -124 l -28 8 l 26 12 Z" fill="#e7a93a" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><circle cx="-96" cy="-130" r="5" fill="${C.ink}"/><path d="M -98 -154 q 6 -18 14 0 q 6 -16 14 2" fill="#e8412c" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  for (let i = 0; i < 26; i++) { const q = rnd(i, 61) * 6.283, rr = Math.sqrt(rnd(i, 62)) * 0.82; o += `<circle cx="${(6 + Math.cos(q) * 100 * rr).toFixed(1)}" cy="${(Math.sin(q) * 74 * rr).toFixed(1)}" r="4.5" fill="${GB.skinD}"/>`; }
  return `<g transform="scale(${s})">${o}</g>`;
}
// おばけ
const ghostIc = (s = 1, t = 0) => `<g transform="translate(0 ${Math.sin(t * 2.4) * 8}) scale(${s})"><path d="M -60 70 V -10 A 60 60 0 0 1 60 -10 V 70 l -20 -18 l -20 18 l -20 -18 l -20 18 l -20 -18 Z" fill="#fff" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/><ellipse cx="-22" cy="-10" rx="9" ry="13" fill="${C.ink}"/><ellipse cx="22" cy="-10" rx="9" ry="13" fill="${C.ink}"/><ellipse cx="0" cy="26" rx="12" ry="16" fill="${C.ink}"/></g>`;
// おんぷ
const noteIc = (x, y, s = 1, col = C.blueUi, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><ellipse cx="-12" cy="30" rx="18" ry="13" fill="${col}" transform="rotate(-20 -12 30)"/><rect x="2" y="-44" width="8" height="76" fill="${col}"/><path d="M 2 -44 Q 40 -36 36 0 Q 30 -18 2 -20 Z" fill="${col}"/></g>`;
// へやの かべ・ゆか・まど（冬の朝。まどの外は ゆき）
function winterRoom(t, { wx = 1400, wy = 110, ww = 400, wh = 360 } = {}) {
  let o = `<rect width="1920" height="1080" fill="${GB.wall}"/><rect x="0" y="846" width="1920" height="234" fill="${GB.floor}"/><rect x="0" y="838" width="1920" height="14" fill="#c4b08c"/>`;
  o += `<clipPath id="wrw"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}"/></clipPath>` + skyG('wrs', '#b9d0e2', '#e9f2f8', { x: wx, y: wy, w: ww, h: wh });
  o += `<g clip-path="url(#wrw)"><path d="M ${wx} ${wy + wh - 60} q ${ww * 0.3} -50 ${ww * 0.55} -10 t ${ww * 0.5} -20 V ${wy + wh} H ${wx} Z" fill="#fff"/>${snowfall(t, wx, wy - 20, ww, wh + 40, 18, 7)}</g>`;
  o += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="none" stroke="#fff" stroke-width="22"/><rect x="${wx - 11}" y="${wy - 11}" width="${ww + 22}" height="${wh + 22}" fill="none" stroke="${C.ink}" stroke-width="5"/><line x1="${wx + ww / 2}" y1="${wy}" x2="${wx + ww / 2}" y2="${wy + wh}" stroke="#fff" stroke-width="14"/><line x1="${wx}" y1="${wy + wh / 2}" x2="${wx + ww}" y2="${wy + wh / 2}" stroke="#fff" stroke-width="14"/><rect x="${wx - 30}" y="${wy + wh + 8}" width="${ww + 60}" height="20" rx="8" fill="#fff" stroke="${C.ink}" stroke-width="5"/>`;
  return o;
}
// パジャマの うわぎ（しましま）
const pajama = (s = 1) => `<g transform="scale(${s})"><path d="M -70 -50 L -30 -70 Q 0 -54 30 -70 L 70 -50 L 110 6 L 78 28 L 60 4 L 60 80 L -60 80 L -60 4 L -78 28 L -110 6 Z" fill="#8fb8e0" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${[-36, -12, 12, 36].map(x => `<line x1="${x}" y1="-46" x2="${x}" y2="74" stroke="#fff" stroke-width="7" opacity="0.8"/>`).join('')}<circle cx="0" cy="-16" r="5" fill="#fff"/><circle cx="0" cy="20" r="5" fill="#fff"/><circle cx="0" cy="54" r="5" fill="#fff"/></g>`;

// 1. つかみ：冬の朝、パジャマをぬぐと、ぶるっ。うでが ぶつぶつ
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4);
    const tOff = c0 + d0 * 0.3, tSh = c0 + d0 * 0.7;
    let out = winterRoom(t);
    out += `<ellipse cx="1140" cy="900" rx="420" ry="52" fill="#c9b48e"/>`;
    // パジャマが とんでいく
    const pf = eo(prog(t, tOff, 0.8));
    if (pf > 0) out += g(pajama(1.0), { x: lerp(1010, 770, pf), y: lerp(640, 800, pf) - Math.sin(pf * Math.PI) * 230, r: lerp(0, -200, pf) + 190 * (pf >= 1 ? 1 : pf), o: prog(t, tOff, 0.15) });
    // つめたい くうき
    const wo = win(t, tSh - 0.3, c1 + 0.6, 0.3);
    out += windLine(740 + Math.sin(t * 3) * 14, 300, 1.1, wo) + windLine(1180 + Math.sin(t * 3 + 1) * 14, 160, 0.8, wo);
    // 子どもたち（ぶるっ と ふるえる）
    const sh = win(t, tSh, tSh + 1.5, 0.15), jit = Math.sin(t * 46) * 7 * sh;
    const eyes = sh > 0.3 ? 'closed' : (t > c1 && t < c3) ? 'wide' : 'open';
    out += g(kidShow('S', t, 1010, 846, { s: 0.56, start: 0, n: 0, eyes, mouth: sh > 0.3 ? 'o' : null, look: t > c1 ? [-9, 4] : [0, 0], pose: sh > 0.3 ? 'shrug' : null }), { x: jit });
    out += g(kidShow('B', t, 1270, 846, { s: 0.56, start: 0, n: 1, eyes, mouth: sh > 0.3 ? 'o' : null, look: t > c1 ? [-9, 2] : [0, 0], bubble: false, pose: sh > 0.3 ? 'shrug' : null }), { x: -jit });
    out += pop(big(0, 0, 'ぶるっ', 130, GB.coldDk, { r: -6 }), t, tSh, 1150, 210, { end: c1 - 0.1, d: 0.3 });
    out += topBadge();
    // うでの 大うつし（ぶつぶつが 出てくる）
    const zo = win(t, c1 + 0.2, c3 - 0.1, 0.3);
    if (zo > 0) {
      out += g(`<line x1="690" y1="520" x2="962" y2="716" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="6 14" stroke-linecap="round"/><circle cx="968" cy="720" r="26" fill="none" stroke="${C.blueUi}" stroke-width="7"/>`, { o: zo });
      out += pop(`<g filter="url(#shadow)"><circle r="258" fill="#fff"/></g>` + skinZoom(250, prog(t, c1 + 0.7, 2.2), 'hz1') + g(badge('うで', { fill: C.blueUi, size: 46, pad: 40 }), { x: -150, y: -260 }), t, c1 + 0.2, 450, 440, { end: c3 - 0.1 });
      out += pop(big(0, 0, 'ぶつぶつ', 96, C.redUi, { r: -5 }), t, c1 + d1 * 0.55, 330, 770, { end: c3 - 0.1, d: 0.35 });
    }
    // これが とりはだ。はねを とった とりの はだに にている
    const no = win(t, c3 + 0.2, c4 - 0.1, 0.3);
    if (no > 0) {
      let c = card(860, 560) + text(0, -196, 'とりはだ', { size: 100, w: 900, fill: C.redUi });
      c += g(skinZoom(120, 1, 'hz2', { hair: false }), { x: -270, y: 10 }) + g(badge('うで', { fill: C.blueUi, size: 38 }), { x: -270, y: 190 });
      const bo = prog(t, c3 + d3 * 0.3, 0.4);
      c += g(text(0, 0, 'にている', { size: 40, w: 900, fill: C.muted }) + `<path d="M -70 46 h 140 M -70 46 l 20 -14 m -20 14 l 20 14 M 70 46 l -20 -14 m 20 14 l -20 14" fill="none" stroke="${C.muted}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`, { x: -52, y: -10, o: prog(t, c3 + d3 * 0.55, 0.3) });
      c += g(bareBird(1.0), { x: 222, y: 30, o: bo, s: lerp(0.85, 1, eo(bo)) }) + g(badge('はねを とった とりの はだ', { fill: C.ochre, size: 32, pad: 24 }), { x: 190, y: 190, o: bo });
      out += g(c, { x: 480, y: 440, o: no, s: lerp(0.94, 1, eo(prog(t, c3 + 0.2, 0.4))) });
    }
    // さむいと とりはだ ？
    out += pop(card(960, 230) + g(flake(0, 0, 40, GB.coldDk), { x: -400, y: 0, r: t * 20 }) + text(-212, 4, 'さむいと', { size: 62, w: 900, fill: C.blueUi }) + g(arrow2(-60, 2, 12, 2, C.muted, 12), {}) +
      text(160, 4, 'とりはだ', { size: 62, w: 900, fill: C.redUi }) + text(380, 4, '？', { size: 110, w: 900, fill: C.ochre }), t, c4 + 0.4, 480, 420, { end: cueE(4) + 0.6 });
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="118" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">さむい</tspan>と、どうして</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="118" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.redUi}">とりはだ</tspan>が たつの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(armBand(-330, -60, 660, 120, prog(t, t0 + 2.0, 1.4)), t, t0 + 1.8, 960, 790);
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
    const opts = [['①', 'さむさで、ひふが ちぢんで しわに なる'], ['②', 'ひふの したに、あせの つぶが たまる'], ['③', 'けの ねもとで、ちいさな きんにくが ちぢむ']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 900, 390 + i * 168);
    });
    out += kidShow('S', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. ぶつぶつの正体：ルーペで見ると まんなかに け → ひふを よこから きった え（けの ねもとの ちいさな きんにく）
SCENES.push({
  id: 'close',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), c5 = cue(5), d5 = cueE(5) - c5, c6 = cue(6), d6 = cueE(6) - c6;
    // A：うでと ルーペ
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      let a = armBand(110, 620, 760, 150, 1);
      const zk = eo(prog(t, c0 + 0.5, 0.7));
      // ルーペの中：ぶつぶつを よこから見ると、まんなかから けが 1本
      const LX = 900, LY = 420, LR = 300;
      let lens = `<clipPath id="clz"><circle r="${LR - 8}"/></clipPath><circle r="${LR}" fill="#fffdf5"/><g clip-path="url(#clz)">`;
      lens += `<path d="M -320 120 H -150 Q -90 120 -56 70 Q 0 10 56 70 Q 90 120 150 120 H 320 V 320 H -320 Z" fill="${GB.skin}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>`;
      lens += `<path d="M -250 120 q 30 -20 60 0 M 196 120 q 30 -20 60 0" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
      const hk = eo(prog(t, c0 + d0 * 0.55, 0.6));
      lens += `<line x1="0" y1="52" x2="${22 * hk}" y2="${52 - 250 * hk}" stroke="${GB.hair}" stroke-width="13" stroke-linecap="round" opacity="${hk > 0 ? 1 : 0}"/>`;
      lens += `</g><circle r="${LR}" fill="none" stroke="${C.blueUi}" stroke-width="22"/><path d="M ${-LR * 0.6} ${-LR * 0.5} A ${LR * 0.78} ${LR * 0.78} 0 0 1 ${-LR * 0.16} ${-LR * 0.76}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.9"/>`;
      a += g(`<line x1="520" y1="640" x2="690" y2="560" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="6 14" stroke-linecap="round"/><circle cx="508" cy="668" r="34" fill="none" stroke="${C.blueUi}" stroke-width="7"/>`, { o: zk });
      a += `<rect x="${LX + 190}" y="${LY + 196}" width="50" height="210" rx="25" fill="${C.ochre}" transform="rotate(-42 ${LX + 215} ${LY + 216})" opacity="${zk}"/>`;
      a += g(lens, { x: LX, y: LY, s: Math.max(back(zk), 0.001), o: zk });
      a += tag(LX + 12, LY - 110, 1330, 190, 'ほそい け', prog(t, c0 + d0 * 0.62, 0.3), { col: GB.hair, size: 48 });
      a += tag(LX - 60, LY + 86, 330, 330, 'ぶつぶつ', prog(t, c0 + d0 * 0.3, 0.3), { col: C.redUi, size: 48 });
      a += pop(badge('うで', { fill: C.blueUi, size: 42 }), t, 0.4, 220, 580);
      // カメレオンは ルーペの ほう（左）を 向く
      a += `<g transform="translate(3240 0) scale(-1 1)">${kidShow('K', t, 1620, 830, { s: 0.95, start: 0.3, n: 0, bubble: false, mouth: lineOf('K') ? 'open' : 'smile' })}</g>`;
      a += talkBubble('K', 1600, 500, 1530, 668, 50);
      out += g(a, { o: aO });
    }
    // B：ひふを よこから きった え
    const bO = prog(t, c2 - 0.2, 0.5);
    if (bO > 0) {
      const tC = c5 + d5 * 0.3, k = eio(prog(t, tC, 1.8));
      const mg = Math.max(win(t, c3 + d3 * 0.5, c5 - 0.2, 0.3) * (0.6 + 0.4 * Math.sin(t * 6)), win(t, tC, tC + 2.2, 0.3));
      const sc = skinCut(150, 440, 1.2, k, 'cl1', { mglow: mg });
      let b = `<rect x="150" y="${440 - 290}" width="${760 * 1.2}" height="290" fill="${GB.cold}" opacity="0.35"/>` + sc.svg;
      b += pop(badge('ひふを よこから きって、なかを みた え', { fill: C.blueUi, size: 42 }), t, c2 + 0.4, 1450, 200, { end: c3 - 0.2 });
      b += text(230, 404, 'そと', { size: 36, w: 900, fill: GB.coldDk }) + text(250, 800, 'ひふの なか', { size: 36, w: 900, fill: '#b98a6a' });
      // け と きんにく
      const hx = lerp(sc.E[0], sc.T[0], 0.7), hy = lerp(sc.E[1], sc.T[1], 0.7);
      b += tag(hx, hy, 1250, 200, 'け', win(t, c3 + 0.3, 1e9, 0.3), { col: GB.hair, size: 50 });
      b += tag(sc.R[0], sc.R[1], 300, 700, 'ねもと', win(t, c3 + d3 * 0.45, c5 - 0.2, 0.3), { col: GB.hair, size: 40 });
      b += tag(sc.M[0] + 10, sc.M[1] + 8, 1300, 720, 'ちいさな きんにく', win(t, c3 + d3 * 0.6, c4 + 0.3, 0.3), { col: GB.muscleDk, size: 46 });
      b += tag(sc.M[0] + 10, sc.M[1] + 8, 1300, 720, 'りつもうきん', prog(t, c4 + 0.3, 0.3), { col: GB.muscleDk, size: 54 });
      b += pop(badge('けは ななめに はえている', { fill: GB.hair, size: 40 }), t, c3 + 0.8, 1500, 330, { end: c5 - 0.2 });
      b += pop(badge('ねもとに ちいさな きんにく', { fill: GB.muscle, size: 40 }), t, c3 + d3 * 0.6, 1500, 430, { end: c5 - 0.2 });
      // ちぢむ → けが おきあがる
      const ao = win(t, tC - 0.2, tC + 2.4, 0.3);
      if (ao > 0) {
        const q = Math.atan2(sc.N[1] - sc.A[1], sc.N[0] - sc.A[0]), nx = Math.sin(q) * 44, ny = -Math.cos(q) * 44, pu = 8 * Math.sin(t * 9);
        b += g(arrow2(sc.A[0] - nx + Math.cos(q) * (10 + pu), sc.A[1] - ny + Math.sin(q) * (10 + pu), sc.M[0] - nx - Math.cos(q) * 16, sc.M[1] - ny - Math.sin(q) * 16, GB.muscleDk, 10) +
          arrow2(sc.N[0] - nx - Math.cos(q) * (10 + pu), sc.N[1] - ny - Math.sin(q) * (10 + pu), sc.M[0] - nx + Math.cos(q) * 16, sc.M[1] - ny + Math.sin(q) * 16, GB.muscleDk, 10), { o: ao });
      }
      b += big(sc.M[0] + 170, sc.M[1] + 130, 'きゅっ', 80, GB.muscleDk, { o: win(t, tC + 0.1, c6 - 0.2, 0.25), r: -8, s: 1 + 0.06 * Math.sin(t * 7) });
      b += pop(badge('きんにくが ちぢむ', { fill: GB.muscle, size: 42 }), t, tC + 0.2, 1500, 330, { end: c6 - 0.2 });
      b += pop(badge('けが おきあがる', { fill: GB.hair, size: 42 }), t, tC + 1.5, 1500, 430, { end: c6 - 0.2 });
      // まわりが もりあがる ＝ ぶつぶつ
      const ro = win(t, c6 + 0.4, 1e9, 0.3);
      if (ro > 0) b += `<ellipse cx="${sc.E[0]}" cy="${sc.E[1] + 26}" rx="${150 + 6 * Math.sin(t * 5)}" ry="${78 + 4 * Math.sin(t * 5)}" fill="none" stroke="${C.redUi}" stroke-width="8" stroke-dasharray="18 12" opacity="${ro}"/>`;
      b += pop(badge('けの まわりが もりあがる', { fill: C.redUi, size: 42 }), t, c6 + 0.5, 1500, 330);
      b += pop(card(520, 250) + g(armBand(-200, -20, 400, 90, 1), { y: 30 }) + text(0, -70, 'これが ぶつぶつ！', { size: 50, w: 900, fill: C.redUi }), t, c6 + d6 * 0.6, 1500, 510);
      out += g(b, { o: bO });
    }
    out += topBadge();
    return out;
  },
});

// 4. じぶんでは うごかせない：さむさを かんじると、しんけいが あいずを おくって、きんにくが かってに ちぢむ
SCENES.push({
  id: 'nerve',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    const tS = c1 + d1 * 0.35, tC = c1 + d1 * 0.62, k = eio(prog(t, tC, 1.4));
    const nv = prog(t, c1 - 0.2, 0.5), pulses = t > tS ? [0, 1, 2].map(i => ((t - tS) * 0.55 + i / 3) % 1) : [];
    const cold = prog(t, c1 + 0.2, 0.6);
    const sc = skinCut(110, 470, 1.0, k, 'nv1', { nerve: nv, pulses, mglow: win(t, tC, 1e9, 0.3) * (0.5 + 0.5 * Math.sin(t * 6)) });
    out += `<rect x="110" y="170" width="760" height="300" fill="${GB.cold}" opacity="${0.2 + 0.5 * cold}"/>`;
    if (cold > 0) out += g(snowfall(t, 120, 170, 740, 290, 12, 13, '#fff') + flake(250, 290, 26, GB.coldDk) + flake(560, 250, 20, GB.coldDk) + flake(800, 250, 16, GB.coldDk), { o: cold });
    out += sc.svg + topBadge();
    out += pop(badge('さむい！', { fill: GB.coldDk, size: 46, pad: 38 }), t, c1 + 0.3, 250, 210);
    out += tag(sc.M[0] + 6, sc.M[1] + 6, 250, 760, 'りつもうきん', win(t, 0.3, 1e9, 0.3), { col: GB.muscleDk, size: 40 });
    out += tag(sc.NV[0], sc.NV[1], 1040, 740, 'こうかんしんけい', prog(t, c1 + d1 * 0.3, 0.3), { col: GB.nerveDk, size: 40 });
    // じぶんで うごかせる きんにく と くらべる
    const p0 = 1 - prog(t, c1 - 0.5, 0.4);
    if (p0 > 0) {
      let p = pop(card(840, 300) + text(-150, -62, 'てや あしの きんにく', { size: 46, w: 900 }) + text(-150, 24, 'じぶんで うごかせる', { size: 46, w: 900, fill: C.accent }) +
        `<circle cx="-150" cy="96" r="30" fill="none" stroke="${C.accent}" stroke-width="12"/>`, t, c0 + 0.3, 1420, 300);
      p += kidShow('S', t, 1730, 440, { s: 0.38, start: c0 + 0.3, n: 0, enter: 'pop', bubble: false, pose: (Math.floor(t * 1.6) % 2) ? 'cheer' : 'stand', eyes: 'smile' });
      p += pop(card(840, 250) + text(0, -48, 'この きんにくは', { size: 46, w: 900, fill: GB.muscleDk }) + text(-40, 38, 'じぶんでは うごかせない', { size: 46, w: 900 }) + g(cross(0, 0, 0.42, C.red), { x: 300, y: 38 }), t, c0 + d0 * 0.55, 1420, 640);
      out += g(p, { o: p0 });
    }
    // さむい → あいず → かってに ちぢむ
    const p1 = win(t, c1 - 0.1, c2 - 0.2, 0.3);
    if (p1 > 0) {
      let p = '';
      [['さむさを かんじる', GB.coldDk, c1 + 0.4], ['しんけいが あいずを おくる', GB.nerveDk, tS], ['きんにくが かってに ちぢむ', GB.muscle, tC + 0.2]].forEach(([s2, col, st], i) => {
        p += pop(badge(s2, { fill: col, size: 44, pad: 38 }), t, st, 1420, 250 + i * 170);
        if (i) p += g(arrow2(1420, 250 + i * 170 - 116, 1420, 250 + i * 170 - 56, C.muted, 12), { o: prog(t, st - 0.2, 0.3) });
      });
      p += big(sc.M[0] + 240, sc.M[1] - 200, 'きゅっ', 72, GB.muscleDk, { o: win(t, tC, c2 - 0.2, 0.25), r: -8, s: 1 + 0.06 * Math.sin(t * 7) });
      out += g(p, { o: p1 });
    }
    // たてることも、とめることも できない
    const p2 = prog(t, c2 - 0.1, 0.4);
    if (p2 > 0) {
      let p = '';
      [['じぶんで たてる', c2 + d2 * 0.25], ['じぶんで とめる', c2 + d2 * 0.55]].forEach(([s2, st], i) => {
        p += pop(card(700, 150) + text(-60, 2, s2, { size: 52, w: 900 }) + g(cross(0, 0, 0.4, C.red), { x: 270, y: 0 }), t, st, 1330, 280 + i * 190);
      });
      p += pop(badge('からだが かってに うごかす', { fill: GB.muscle, size: 44, pad: 38 }), t, c2 + d2 * 0.8, 1330, 660);
      p += kidShow('B', t, 1780, 850, { s: 0.5, start: c2 + 0.2, n: 1, bubble: false, pose: 'shrug', eyes: 'wide', mouth: 'o', look: [-8, -2] });
      out += g(p, { o: p2 });
    }
    return out;
  },
});

// 5. けを たてると どんな いいこと？：けがわの どうぶつは くうきの そうが あつくなる／とりも はねを ふくらませる／からだを 大きく見せる
SCENES.push({
  id: 'fur',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5), d5 = cueE(5) - c5;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // はじめの問い
    out += pop(card(1000, 330) + text(-80, -62, 'けを たてると', { size: 68, w: 900, fill: GB.hair }) + text(-80, 44, 'どんな いいこと', { size: 68, w: 900 }) + text(370, -6, '？', { size: 170, w: 900, fill: C.ochre }), t, c0 + 0.3, 960, 420, { end: c1 - 0.4 });
    // A：けがわを よこから見た え（左：けが ねている／右：けが たつ）
    const aO = win(t, c1 - 0.3, c4 - 0.3, 0.4);
    if (aO > 0) {
      const tU = c1 + d1 * 0.32, k = eio(prog(t, tU, 1.6)), heat = prog(t, c2 + d2 * 0.4, 0.5);
      let a = '';
      [[90, 0, 'けが ねている'], [770, k, 'けが たつ']].forEach(([px, kk, label], i) => {
        a += `<rect x="${px}" y="250" width="620" height="520" rx="28" fill="#fff" filter="url(#shadow)"/><clipPath id="fp${i}"><rect x="${px}" y="250" width="620" height="520" rx="28"/></clipPath>`;
        a += `<g clip-path="url(#fp${i})"><rect x="${px}" y="250" width="620" height="450" fill="${GB.cold}" opacity="0.4"/>${furPanel(px, 700, 620, kk, t, { heat })}</g>`;
        a += g(badge(i && k < 0.5 ? 'けが ねている' : label, { fill: i && k >= 0.5 ? GB.furD : C.muted, size: 40 }), { x: px + 310, y: 250 });
      });
      a += pop(badge('けがわの ある どうぶつ', { fill: GB.furD, size: 42, pad: 36 }), t, c1 + 0.2, 400, 170);
      a += g(cat(0, 0, 0.5, 0), { x: 760, y: 200, o: prog(t, c1 + 0.4, 0.3) });
      a += pop(badge('くうきの そうが あつい', { fill: GB.airDk, size: 38 }), t, tU + 1.6, 1080, 370, { end: c2 + d2 * 0.4 });
      a += pop(badge('くうきの そうが うすい', { fill: GB.airDk, size: 38 }), t, tU + 2.4, 400, 560, { end: c2 + d2 * 0.4 });
      a += pop(badge('ねつが にげる', { fill: GB.heatDk, size: 38 }), t, c2 + d2 * 0.5, 400, 330);
      a += pop(badge('ねつが にげにくい', { fill: GB.heatDk, size: 38 }), t, c2 + d2 * 0.7, 1080, 330);
      a += g(`<rect x="-150" y="-70" width="300" height="140" rx="24" fill="#fff" filter="url(#shadow)"/><circle cx="-100" cy="-30" r="13" fill="${GB.air}" stroke="${GB.airDk}" stroke-width="3"/>` + text(-70, -28, 'くうき', { size: 38, w: 900, fill: GB.airDk, anchor: 'start' }) + g(heatArrow(-124, 30, -76, 30, 1, 9), {}) + text(-58, 32, 'ねつ', { size: 38, w: 900, fill: GB.heatDk, anchor: 'start' }), { x: 1660, y: 210, o: prog(t, c1 + 0.8, 0.4) });
      a += kidShow('B', t, 1680, 850, { s: 0.52, start: c3 - 0.8, n: 0, bubble: false, mouth: lineOf('B') ? 'open' : 'smile', look: [-8, -4] });
      a += talkBubble('B', 1650, 490, 1680, 850 - 372 * 0.52, 44);
      out += g(a, { o: aO });
    }
    // B：スズメ（ふつう → さむい日は まんまる）
    const bO = win(t, c4 - 0.3, c5 - 0.3, 0.4);
    if (bO > 0) {
      const tF = c4 + d4 * 0.3, k = eio(prog(t, tF, 1.4));
      let b = skyG('fsky', GB.skyT, GB.skyB, { h: 1080 }) + snowfall(t, 0, -40, 1920, 900, 26, 3);
      b += `<path d="M -20 640 Q 960 700 1940 640" fill="none" stroke="#5a4636" stroke-width="12" stroke-linecap="round"/>`;
      b += sparrow(560, 668, 2.0, 0, t) + sparrow(1280, 668, 2.0, k, t, { air: clamp(k * 2 - 1) });
      b += g(badge('ふつう', { fill: C.muted, size: 44 }), { x: 560, y: 780 }) + g(badge('さむい ひ', { fill: GB.coldDk, size: 44 }), { x: 1280, y: 780 });
      b += big(930, 420, 'ふわっ', 84, GB.furD, { o: win(t, tF + 0.2, tF + 2.6, 0.25), r: 8 });
      b += pop(badge('はねを ふくらませる', { fill: GB.furD, size: 42 }), t, tF + 0.4, 1280, 220);
      b += tag(1310, 560, 1650, 440, 'くうきを ためる', prog(t, c4 + d4 * 0.68, 0.3), { col: GB.airDk, size: 42 });
      b += pop(badge('とりも おなじ', { fill: C.blueUi, size: 44, pad: 38 }), t, c4 + 0.2, 520, 220);
      out += g(b, { o: bO });
    }
    // C：ねこ（けを たてると、からだが 大きく見える）
    const cO = prog(t, c5 - 0.3, 0.4);
    if (cO > 0) {
      const tP = c5 + d5 * 0.2, k = eio(prog(t, tP, 0.9));
      let c = `<rect width="1920" height="1080" fill="${C.paper}"/><rect x="0" y="790" width="1920" height="290" fill="${C.ochreSoft}"/>`;
      c += cat(1260, 790, 2.1, k);
      c += g(cat(1260, 790, 2.1, 0, { ghost: true }), { o: prog(t, tP + 0.6, 0.4) });
      c += big(1740, 650, 'ぶわっ', 80, GB.catD, { o: win(t, tP, tP + 2.4, 0.25), r: 8 });
      c += pop(badge('けを たてる', { fill: GB.catD, size: 44, pad: 38 }), t, c5 + 0.3, 440, 260);
      c += pop(badge('からだが おおきく みえる', { fill: C.blueUi, size: 44, pad: 38 }), t, c5 + d5 * 0.32, 440, 380);
      c += pop(badge('てきを おどろかせる…のかも しれない', { fill: C.ochre, size: 40, pad: 34 }), t, c5 + d5 * 0.6, 440, 500);
      c += tag(1260 + 2.1 * 30, 790 - 2.1 * 122, 440, 650, 'もとの おおきさ', prog(t, tP + 1.0, 0.3), { col: C.muted, size: 38 });
      out += g(c, { o: cO });
    }
    out += topBadge();
    return out;
  },
});

// 6. 人は けが 少ない：くうきの そうは ほとんど できない。それでも とりはだは たつ。きんにくを ふるわせて ねつを つくる
SCENES.push({
  id: 'human',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const tU = c0 + d0 * 0.42, k = eio(prog(t, tU, 1.2)), heat = prog(t, c0 + d0 * 0.7, 0.5);
      let a = '';
      [[90, 'ひと', true], [770, 'けがわの どうぶつ', false]].forEach(([px, label, human], i) => {
        a += `<rect x="${px}" y="250" width="620" height="520" rx="28" fill="#fff" filter="url(#shadow)"/><clipPath id="hp${i}"><rect x="${px}" y="250" width="620" height="520" rx="28"/></clipPath>`;
        a += `<g clip-path="url(#hp${i})"><rect x="${px}" y="250" width="620" height="450" fill="${GB.cold}" opacity="0.4"/>${furPanel(px, 700, 620, human ? k : 1, t, { heat, human })}</g>`;
        a += g(badge(label, { fill: human ? C.redUi : GB.furD, size: 40 }), { x: px + 310, y: 250 });
      });
      a += pop(badge('けが すくない', { fill: GB.hair, size: 42 }), t, c0 + 0.9, 400, 170);
      a += pop(badge('くうきの そうが ほとんど できない', { fill: GB.airDk, size: 36 }), t, c0 + d0 * 0.72, 400, 330, { end: c1 + 0.2 });
      a += pop(badge('あまり あたたかく ならない', { fill: GB.heatDk, size: 40 }), t, c1 + 0.4, 400, 330);
      a += pop(card(430, 330) + text(0, -104, 'それでも', { size: 46, w: 900 }) + g(armBand(-170, -50, 340, 84, prog(t, c1 + d1 * 0.6, 1.0)), {}) + text(0, 100, 'とりはだは たつ', { size: 46, w: 900, fill: C.redUi }), t, c1 + d1 * 0.55, 1640, 500);
      out += g(a, { o: aO });
    }
    // ふるえて ねつを つくる
    const bO = prog(t, c2 - 0.3, 0.5);
    if (bO > 0) {
      let b = skyG('hsk', GB.skyT, GB.skyB, { h: 800 }) + `<rect x="0" y="790" width="1920" height="290" fill="#fff"/><ellipse cx="960" cy="800" rx="1100" ry="46" fill="#fff"/>` + snowfall(t, 0, -40, 1920, 860, 26, 9);
      const jit = Math.sin(t * 44) * 6;
      b += g(kidShow('S', t, 700, 846, { s: 0.7, start: c2 - 0.3, n: 0, enter: 'pop', bubble: false, pose: 'shrug', eyes: 'closed', mouth: 'flat' }), { x: jit });
      b += g(kidShow('B', t, 1140, 846, { s: 0.7, start: c2 - 0.3, n: 1, enter: 'pop', bubble: false, pose: 'shrug', eyes: 'closed', mouth: 'flat' }), { x: -jit });
      // ふるえの線 と ねつ
      const so = prog(t, c2 + 0.4, 0.3);
      [[540, 590], [860, 590], [1000, 640], [1280, 640]].forEach(([x, y], i) => { const dir = i % 2 ? 1 : -1; b += `<path d="M ${x} ${y} q ${14 * dir} 20 0 40 q ${-14 * dir} 20 0 40 q ${14 * dir} 20 0 40" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" opacity="${so * (0.5 + 0.5 * Math.sin(t * 20 + i))}"/>`; });
      b += big(920, 230, 'ぶるぶる', 110, GB.coldDk, { o: so, r: -4, s: 1 + 0.03 * Math.sin(t * 30) });
      const ho = prog(t, c2 + d2 * 0.55, 0.4), hw = 8 * Math.sin(t * 5);
      b += heatArrow(700, 505, 700, 405 - hw, ho, 14) + heatArrow(1140, 562, 1140, 462 + hw, ho, 14);
      b += g(`<circle cx="700" cy="690" r="90" fill="${GB.heat}" opacity="${0.3 + 0.1 * Math.sin(t * 6)}" filter="url(#glow)"/><circle cx="1140" cy="720" r="80" fill="${GB.heat}" opacity="${0.3 + 0.1 * Math.sin(t * 6 + 1)}" filter="url(#glow)"/>`, { o: ho });
      b += pop(badge('きんにくを ふるわせる', { fill: GB.muscle, size: 44, pad: 38 }), t, c2 + d2 * 0.35, 1560, 330);
      b += pop(badge('ねつを つくる', { fill: GB.heatDk, size: 44, pad: 38 }), t, c2 + d2 * 0.6, 1560, 450);
      out += g(b, { o: bO });
    }
    out += topBadge();
    return out;
  },
});

// 7. こわいとき・すてきな おんがくでも
SCENES.push({
  id: 'feel',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    const t1 = c0 + d0 * 0.12, t2 = c0 + d0 * 0.36, t3 = c0 + d0 * 0.74;
    // こわい とき
    let a = `<rect x="-380" y="-300" width="760" height="600" rx="28" fill="${C.night2}" filter="url(#shadow)"/>` + [[-300, -230], [-60, -250], [250, -200], [320, -60], [-330, 20], [180, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" opacity="0.7"/>`).join('');
    a += g(ghostIc(1.3, t), { x: -170, y: -90 });
    a += g(badge('こわい とき', { fill: '#6c5aa8', size: 44, pad: 38 }), { x: 0, y: -300 });
    out += pop(a, t, t1, 500, 500);
    if (t > t1 + 0.2) out += kidShow('B', t, 660, 770, { s: 0.5, start: t1 + 0.2, n: 0, enter: 'pop', bubble: false, pose: 'shrug', eyes: 'wide', mouth: 'o', look: [-9, -5] });
    // すてきな おんがく
    let b = `<rect x="-380" y="-300" width="760" height="600" rx="28" fill="#fff5d6" filter="url(#shadow)"/>`;
    [[-250, -120, 1.3, C.blueUi, -10], [-140, -200, 1.0, C.redUi, 12], [-260, 40, 0.9, C.accent, 8], [-100, -40, 1.1, C.ochre, -14]].forEach(([x, y, s2, col, r], i) => { b += noteIc(x + Math.sin(t * 2 + i) * 10, y + Math.cos(t * 1.7 + i) * 12, s2, col, r); });
    b += g(badge('すてきな おんがく', { fill: C.ochre, size: 44, pad: 38 }), { x: 0, y: -300 });
    out += pop(b, t, t2, 1420, 500);
    if (t > t2 + 0.2) out += kidShow('S', t, 1600, 770, { s: 0.5, start: t2 + 0.2, n: 1, enter: 'pop', bubble: false, pose: 'stand', eyes: 'smile', mouth: 'open' });
    // どちらも とりはだ
    out += pop(g(armBand(-150, -36, 300, 72, prog(t, t1 + 1.0, 0.8)), {}), t, t1 + 0.8, 340, 730);
    out += pop(g(armBand(-150, -36, 300, 72, prog(t, t2 + 1.0, 0.8)), {}), t, t2 + 0.8, 1260, 730);
    out += pop(big(0, 0, 'ぞくっ', 72, '#6c5aa8', { r: -8 }), t, t1 + 1.0, 300, 620, { d: 0.3 }) + pop(big(0, 0, 'ぞくっ', 72, C.ochre, { r: -8 }), t, t2 + 1.0, 1200, 620, { d: 0.3 });
    out += pop(badge('とりはだが たつ ことが ある', { fill: C.redUi, size: 46, pad: 40 }), t, t3, 960, 110);
    out += topBadge();
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5), d5 = cueE(5) - c5, c6 = cue(6);
    const aO = 1 - prog(t, c1 - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'けの ねもとで、ちいさな きんにくが ちぢむ', { size: 46, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['けの ねもと', GB.hair], ['ちいさな きんにく', GB.muscle], ['ちぢんで けを たてる', C.redUi]], t, 900, 660, { start: 2.6, step: 1.3 });
      // カメレオンは 答えの ほう（左）を 向く
      a += `<g transform="translate(3460 0) scale(-1 1)">${kidShow('K', t, 1730, 850, { s: 0.7, start: 1.6, n: 0, bubble: false })}</g>`;
      out += g(a, { o: aO });
    }
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, c1 - 0.2, 400, 190);
      const row = (ic, s1, s2, col, y, st, size = 44) => pop(ic + (s2 ? text(80, -30, s1, { size, w: 900, anchor: 'start', fill: col }) + text(80, 30, s2, { size, w: 900, anchor: 'start', fill: col }) : text(80, 2, s1, { size, w: 900, anchor: 'start', fill: col })), t, st, 1000, y);
      const dot = col => `<circle r="14" fill="${col}"/>`;
      // その1：うでの ぶつぶつを ちかくで みる。うでと ふともも
      const p1 = 1 - prog(t, c5 - 0.6, 0.4);
      if (p1 > 0) {
        let q = `<rect x="80" y="270" width="850" height="550" rx="28" fill="#fff" filter="url(#shadow)"/>`;
        const qa = 1 - prog(t, c3 - 0.3, 0.3), qb = prog(t, c3 - 0.1, 0.4);
        if (qa > 0) {
          let z = armBand(130, 610, 620, 130, 1);
          z += `<line x1="430" y1="640" x2="560" y2="560" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="6 14" stroke-linecap="round"/><circle cx="418" cy="664" r="30" fill="none" stroke="${C.blueUi}" stroke-width="7"/>`;
          const hk = eo(prog(t, c2 + 0.2, 0.6));
          z += `<g transform="translate(640 440)"><clipPath id="lkz"><circle r="150"/></clipPath><circle r="156" fill="#fffdf5"/><g clip-path="url(#lkz)"><path d="M -170 70 H -80 Q -44 70 -28 44 Q 0 12 28 44 Q 44 70 80 70 H 170 V 170 H -170 Z" fill="${GB.skin}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><line x1="0" y1="34" x2="10" y2="${34 - 130 * Math.max(hk, 0.25)}" stroke="${GB.hair}" stroke-width="8" stroke-linecap="round"/></g><circle r="156" fill="none" stroke="${C.blueUi}" stroke-width="14"/></g>`;
          z += pop(text(0, 0, '？', { size: 110, w: 900, fill: C.ochre }), t, c2 + 0.3, 800, 330, { end: c3 - 0.3 });
          z += g(badge('うで', { fill: C.blueUi, size: 38 }), { x: 220, y: 580 });
          q += g(z, { o: qa });
        }
        if (qb > 0) {
          let z = armBand(150, 360, 520, 110, prog(t, c3 + 0.5, 1.2), { seed: 2 }) + g(badge('うで', { fill: C.blueUi, size: 40 }), { x: 760, y: 414 });
          z += armBand(150, 580, 520, 170, prog(t, c3 + d3 * 0.3 + 0.3, 1.2), { seed: 3, rows: 3 }) + g(badge('ふともも', { fill: C.accent, size: 40 }), { x: 780, y: 664 });
          z += pop(text(0, 0, 'どっち？', { size: 64, w: 900, fill: C.ochre }), t, c3 + d3 * 0.5, 505, 520);
          q += g(z, { o: qb });
        }
        q += row(dot(C.blueUi), 'さむい ひの きがえの とき', null, C.ink, 290, c1 + 0.1);
        q += row(g(eyeIcon(0.24), {}), 'うでの ぶつぶつを ちかくで みる', null, C.ink, 380, c1 + d1 * 0.5);
        q += row(dot(C.accent), 'まんなかに ほそい けが あるかな？', null, C.accent, 470, c2 + 0.1);
        q += row(dot(C.accent), 'うでと ふともも、どっちに でやすい？', null, C.accent, 560, c3 + 0.1);
        q += row(warnIcon(0.6), 'わざと つめたい みずを かけない', null, C.red, 665, c4 + 0.1, 42);
        q += row(warnIcon(0.6), 'さむい ところに ながく いない', null, C.red, 755, c4 + d4 * 0.5, 42);
        b += g(q, { o: p1 });
      }
      // その2：冬の朝の スズメ（とおくから）
      const p2 = prog(t, c5 - 0.3, 0.5);
      if (p2 > 0) {
        let q = `<clipPath id="lkc"><rect x="80" y="270" width="850" height="550" rx="28"/></clipPath><rect x="80" y="270" width="850" height="550" rx="28" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#lkc)">` + skyG('lksky', GB.skyT, GB.skyB, { x: 80, y: 270, w: 850, h: 550 }) + snowfall(t, 80, 250, 850, 560, 16, 11);
        q += `<rect x="80" y="770" width="850" height="60" fill="#fff"/><rect x="820" y="300" width="26" height="480" fill="#8b8f96" stroke="${C.ink}" stroke-width="5"/><path d="M 60 400 Q 450 460 833 380" fill="none" stroke="${C.ink}" stroke-width="7"/>`;
        [[280, 422, 0.2], [460, 425, 0.5], [640, 411, 0.8]].forEach(([x, y, ph]) => { q += sparrow(x, y, 0.8, eio(prog(t, c5 + d5 * 0.4 + ph * 0.6, 0.9)), t); });
        q += `<line x1="250" y1="640" x2="420" y2="460" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="6 12" stroke-linecap="round" opacity="${prog(t, c5 + 0.8, 0.4)}"/>`;
        q += `</g>` + kidShow('S', t, 210, 776, { s: 0.3, start: c5 - 0.1, n: 0, enter: 'pop', bubble: false, pose: 'point', look: [8, -8], eyes: 'wide' });
        q += tag(650, 370, 600, 580, 'まんまる？', prog(t, c5 + d5 * 0.55, 0.3), { size: 40, col: GB.furD });
        q += row(g(eyeIcon(0.24), {}), 'ふゆの あさ、スズメは', 'まるく ふくらんで いるかな？', C.ink, 380, c5 + 0.1, 44);
        q += row(warnIcon(0.62), 'とりには ちかづかない', 'とおくから みるだけ', C.red, 620, c6 + 0.1, 44);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「とりはだ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

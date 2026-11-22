
// みのまわり図鑑「みかんの白いすじは、何のためにあるの？」（もとの記事：everyday-trivia trivia/mikan-white-threads.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 色の約束：かわ＝だいだい、しろい ふわふわ（アルベド）＝クリーム、すじ＝しろ（ふちどり）、みず＝あおい つぶ、えいよう＝みどりの つぶ、あまみ＝きいろの つぶ
const MK = {
  peel: '#f08c28', peelD: '#cf6c16', albedo: '#fbf1dc', albedoD: '#e9d7b0', seg: '#f9b955', segD: '#dc9230', sac: '#fcd68c', sacD: '#d99a3c',
  thread: '#fffdf8', threadL: '#bfa672', water: '#3f8fd6', food: '#2f9a5f', sugar: '#f4c21f', sugarD: '#b98a00',
  leaf: '#3b9a55', leafD: '#2b7a42', leafL: '#8fc46a', wood: '#8a6a4a', woodD: '#6f5238', soil: '#c9a77e', cell: '#fbe3b8', cellL: '#b89a6a',
};
const f1 = n => (+n).toFixed(1);

// ---------- 小道具 ----------
function arrow(x1, y1, x2, y2, col, w = 14, k = 1, o = 1) {
  if (k <= 0.02 || o <= 0.01) return '';
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = w * 2.4;
  const bx = ex - Math.cos(a) * hd, by = ey - Math.sin(a) * hd, nx = -Math.sin(a) * hd * 0.75, ny = Math.cos(a) * hd * 0.75;
  return `<g opacity="${o}"><line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(bx)}" y2="${f1(by)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${f1(ex)} ${f1(ey)} L ${f1(bx + nx)} ${f1(by + ny)} L ${f1(bx - nx)} ${f1(by - ny)} Z" fill="${col}" stroke="${col}" stroke-width="${w * 0.3}" stroke-linejoin="round"/></g>`;
}
const olText = (x, y, str, { size = 44, fill = '#fff', ol = MK.peelD, sw = 10, anchor = 'middle' } = {}) =>
  text(x, y, str, { size, w: 900, fill, anchor, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${f1(x2)}" cy="${f1(y2)}" r="9" fill="${col}"/></g>`;
// しろい すじ（ふちどり つきの せん）。k：0〜1 でのびる
const thread = (d, w = 8, o = 1, k = 1) => {
  if (o <= 0.01 || k <= 0.005) return '';
  const da = k < 1 ? ` pathLength="1" stroke-dasharray="${f1(k * 1000) / 1000} 2"` : '';
  return `<g opacity="${o}" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="${MK.threadL}" stroke-width="${f1(w + 5)}"${da}/><path d="${d}" stroke="${MK.thread}" stroke-width="${f1(w)}"${da}/></g>`;
};
// つぶ（みず・えいよう・あまみ）
const dot = (x, y, col, r = 10) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"/><circle cx="${f1(x - r * 0.3)}" cy="${f1(y - r * 0.3)}" r="${f1(r * 0.3)}" fill="#fff" opacity="0.7"/>`;
// 折れ線の道
const qb = (p0, p1, p2, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const k = i / n, a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k; return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]; });
function polyAt(pts, d) {
  for (let i = 1; i < pts.length; i++) {
    const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= L) { const k = L ? d / L : 0; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; }
    d -= L;
  }
  return pts[pts.length - 1];
}
const polyLen = pts => pts.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
// 道の上を流れるつぶ。t0 から流れはじめる。v：はやさ（px/秒）、gap：つぶの間（px）、cols：色（じゅんばんに）
function flow(pts, t, t0, cols, { v = 200, gap = 90, r = 10, off = 0, o = 1 } = {}) {
  const head = (t - t0) * v; if (head <= 0 || o <= 0.01) return '';
  const tot = polyLen(pts), n = Math.max(1, Math.round(tot / gap)), per = n * gap;
  let out = '';
  for (let i = 0; i < n; i++) {
    let s = head - i * gap - off; if (s < 0) continue; s = s % per; if (s > tot) continue;
    const [x, y] = polyAt(pts, s), e = Math.min(1, s / 30, (tot - s) / 30);
    out += `<g opacity="${f1(Math.max(0, e) * o)}">${dot(x, y, cols[i % cols.length], r)}</g>`;
  }
  return out;
}

// ---------- みかんの道具 ----------
// まるごとの みかん。green：1 でみどり
function mikanWhole(cx, cy, r, { green = 0, heta = true } = {}) {
  // みどり → きいろ → だいだい（とちゅうで ちゃいろく にごらない ように）
  const two = (a, m, b) => green > 0.5 ? mix(m, b, (green - 0.5) * 2) : mix(a, m, green * 2);
  const col = two(MK.peel, '#ecd04e', MK.leafL), dk = two(MK.peelD, '#b99a2e', '#5d9a48');
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${f1(r)}" ry="${f1(r * 0.88)}" fill="${col}" stroke="${dk}" stroke-width="${f1(Math.max(3, r * 0.035))}"/>`;
  [[-0.4, -0.2], [0.3, -0.35], [0.45, 0.2], [-0.2, 0.4], [0.05, 0.05], [-0.55, 0.25], [0.1, 0.5], [0.62, -0.1]].forEach(([a, b]) => { s += `<circle cx="${f1(cx + a * r)}" cy="${f1(cy + b * r)}" r="${f1(r * 0.03 + 0.8)}" fill="${dk}" opacity="0.55"/>`; });
  s += `<path d="M ${f1(cx - r * 0.62)} ${f1(cy - r * 0.2)} Q ${f1(cx - r * 0.52)} ${f1(cy - r * 0.6)} ${f1(cx - r * 0.16)} ${f1(cy - r * 0.68)}" fill="none" stroke="#fff" stroke-width="${f1(r * 0.07)}" stroke-linecap="round" opacity="0.5"/>`;
  if (heta) s += `<path d="M ${f1(cx - r * 0.14)} ${f1(cy - r * 0.84)} Q ${cx} ${f1(cy - r * 0.99)} ${f1(cx + r * 0.14)} ${f1(cy - r * 0.84)} Q ${cx} ${f1(cy - r * 0.78)} ${f1(cx - r * 0.14)} ${f1(cy - r * 0.84)} Z" fill="${MK.leafD}"/>`;
  return s;
}
// むいた みかん（よこから）。すじが あみの めの ように ついて いる
function mikanPeeled(cx, cy, rx, ry, { bare = false, tk = 1, w = 0 } = {}) {
  const tw_ = w || Math.max(3, rx * 0.036);
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${MK.seg}"/>`;
  [-0.78, -0.42, 0, 0.42, 0.78].forEach(k => { s += `<path d="M ${cx} ${f1(cy - ry)} Q ${f1(cx + k * rx * 1.28)} ${cy} ${cx} ${f1(cy + ry)}" fill="none" stroke="${MK.segD}" stroke-width="${f1(Math.max(2, rx * 0.02))}"/>`; });
  if (!bare) {
    [-0.95, -0.6, -0.21, 0.21, 0.6, 0.95].forEach(k => { s += thread(`M ${cx} ${f1(cy - ry + rx * 0.03)} Q ${f1(cx + k * rx * 1.25)} ${cy} ${cx} ${f1(cy + ry - rx * 0.03)}`, tw_, tk); });
    [[-0.6, -0.21, -0.35], [-0.21, 0.21, 0.1], [0.21, 0.6, -0.15], [-0.6, -0.21, 0.4], [0.21, 0.6, 0.45], [-0.95, -0.6, 0.05], [0.6, 0.95, -0.05], [-0.21, 0.21, -0.5]].forEach(([a, b, q]) => {
      const y = cy + q * ry, sh = 1.25 * (1 - q * q) / 2, xa = cx + a * rx * sh, xb = cx + b * rx * sh;
      s += thread(`M ${f1(xa)} ${f1(y)} Q ${f1((xa + xb) / 2)} ${f1(y + ry * 0.11)} ${f1(xb)} ${f1(y - ry * 0.05)}`, tw_ * 0.6, tk);
    });
  }
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${f1(rx)}" ry="${f1(ry)}" fill="none" stroke="${MK.segD}" stroke-width="${f1(Math.max(3, rx * 0.025))}"/>`;
  return s;
}
// よこに きった みかん（だんめん）。al：しろい ふわふわの あつさ、hi：めだたせる ふさ、green：みどりの ころ、dots：ふさの せなかの すじの きりくち
function section(cx, cy, r, { al = 0.08, n = 10, hi = -1, sacs = true, green = 0, dots = false } = {}) {
  const rin = r * (0.9 - al), r0 = r * 0.1;
  const P = (rr, a) => `${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`;
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${mix(MK.peel, MK.leafL, green)}"/><circle cx="${cx}" cy="${cy}" r="${f1(r * 0.9)}" fill="${MK.albedo}"/>`;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.03, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - 0.03;
    s += `<path d="M ${P(r0, a0)} L ${P(rin, a0)} A ${f1(rin)} ${f1(rin)} 0 0 1 ${P(rin, a1)} L ${P(r0, a1)} Z" fill="${hi === i ? '#ffd985' : mix(MK.seg, '#e9d98a', green * 0.6)}" stroke="${hi === i ? C.red : MK.thread}" stroke-width="${f1(hi === i ? Math.max(4, r * 0.022) : Math.max(2, r * 0.012))}" stroke-linejoin="round"/>`;
    if (sacs) for (let j = 0; j < 3; j++) {
      const am = a0 + (a1 - a0) * (0.25 + 0.25 * j);
      for (const rr of [0.42, 0.66]) {
        const x = cx + rin * rr * Math.cos(am), y = cy + rin * rr * Math.sin(am);
        s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rin * 0.1)}" ry="${f1(rin * 0.034 + 0.6)}" transform="rotate(${f1(am * 180 / Math.PI)} ${f1(x)} ${f1(y)})" fill="${MK.sac}" opacity="0.9"/>`;
      }
    }
    if (dots) { const am = (a0 + a1) / 2; s += `<circle cx="${f1(cx + (rin + r * 0.012) * Math.cos(am))}" cy="${f1(cy + (rin + r * 0.012) * Math.sin(am))}" r="${f1(r * 0.03 + 1)}" fill="${MK.thread}" stroke="${MK.threadL}" stroke-width="${f1(Math.max(2, r * 0.012))}"/>`; }
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${f1(r0)}" fill="${MK.albedo}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${mix(MK.peelD, '#5d9a48', green)}" stroke-width="${f1(Math.max(3, r * 0.02))}"/>`;
  return s;
}
// ふさ 1つ（よこから みた みかづきがた）。せなかが みぎ。(x, y) は はらがわの まんなか
function segSide(x, y, h, { bare = false, tk = 1 } = {}) {
  const w = h * 0.6, d = `M ${x} ${f1(y - h / 2)} Q ${f1(x + w * 1.9)} ${y} ${x} ${f1(y + h / 2)} Q ${f1(x + w * 0.3)} ${y} ${x} ${f1(y - h / 2)} Z`;
  let s = `<path d="${d}" fill="${MK.seg}"/>`;
  if (!bare) {
    s += thread(`M ${x + 2} ${f1(y - h / 2 + h * 0.02)} Q ${f1(x + w * 1.75)} ${y} ${x + 2} ${f1(y + h / 2 - h * 0.02)}`, Math.max(3, h * 0.022), tk);
    [-0.25, 0.05, 0.3].forEach(q => { const k = 1 - 4 * q * q; s += thread(`M ${f1(x + w * 0.2 * k + h * 0.03)} ${f1(y + q * h)} Q ${f1(x + w * 0.5 * k)} ${f1(y + q * h - h * 0.045)} ${f1(x + w * 0.82 * k)} ${f1(y + q * h + h * 0.015)}`, Math.max(2, h * 0.012), tk); });
  }
  return s + `<path d="${d}" fill="none" stroke="${MK.segD}" stroke-width="${f1(Math.max(3, h * 0.016))}" stroke-linejoin="round"/>`;
}
// かわの かけら（うちがわの しろい ふわふわが みえる）
function peelPiece(x, y, w, h) {
  const d = `M ${x} ${f1(y + h * 0.15)} Q ${f1(x + w / 2)} ${f1(y - h * 0.15)} ${x + w} ${f1(y + h * 0.15)} L ${f1(x + w * 0.92)} ${y + h} Q ${f1(x + w / 2)} ${f1(y + h * 0.82)} ${f1(x + w * 0.08)} ${y + h} Z`;
  return `<path d="${d}" fill="${MK.albedo}"/>` +
    [[0.25, 0.4], [0.5, 0.3], [0.7, 0.5], [0.35, 0.7], [0.6, 0.75], [0.8, 0.3], [0.15, 0.6], [0.48, 0.55]].map(([a, b]) => `<circle cx="${f1(x + a * w)}" cy="${f1(y + b * h)}" r="${f1(w * 0.02 + 1)}" fill="${MK.albedoD}"/>`).join('') +
    `<path d="${d}" fill="none" stroke="${MK.albedoD}" stroke-width="${f1(Math.max(3, w * 0.012))}" stroke-linejoin="round"/>` +
    `<path d="M ${x} ${f1(y + h * 0.15)} Q ${f1(x + w / 2)} ${f1(y - h * 0.15)} ${x + w} ${f1(y + h * 0.15)}" fill="none" stroke="${MK.peel}" stroke-width="${f1(Math.max(6, w * 0.045))}" stroke-linecap="round"/>`;
}
const leafShape = (x, y, a = 0, s = 1, col = MK.leaf) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M 0 0 Q 42 -30 90 0 Q 42 30 0 0 Z" fill="${col}"/><path d="M 6 0 L 80 0" stroke="${MK.leafD}" stroke-width="3" stroke-linecap="round"/></g>`;
// つぶつぶ 1つ（え つき）。(x, y) は えの ねもと、うえむき。sugar：あまみの つぶの かず（0〜14）
const SUGAR_P = [[0, 0.1], [-0.5, 0.2], [0.5, 0.22], [0, 0.35], [-0.6, 0.45], [0.6, 0.45], [-0.2, 0.55], [0.3, 0.6], [-0.5, 0.7], [0.5, 0.72], [0, 0.8], [-0.3, 0.9], [0.3, 0.92], [0, 0.62]];
function sacShape(x, y, h, { sugar = 0, fill = MK.sac, sw = 0 } = {}) {
  const st = h * 0.35, bw = h * 0.22, hw = Math.max(3, h * 0.022), lw = sw || Math.max(3, h * 0.014);
  const body = `M ${f1(x - hw)} ${f1(y - st)} C ${f1(x - bw)} ${f1(y - st - h * 0.15)} ${f1(x - bw)} ${f1(y - h)} ${x} ${f1(y - h)} C ${f1(x + bw)} ${f1(y - h)} ${f1(x + bw)} ${f1(y - st - h * 0.15)} ${f1(x + hw)} ${f1(y - st)} Z`;
  let s = `<rect x="${f1(x - hw)}" y="${f1(y - st - 2)}" width="${f1(hw * 2)}" height="${f1(st + 2)}" fill="${fill}"/><path d="M ${f1(x - hw)} ${y} L ${f1(x - hw)} ${f1(y - st)} M ${f1(x + hw)} ${y} L ${f1(x + hw)} ${f1(y - st)}" stroke="${MK.sacD}" stroke-width="${f1(lw)}" stroke-linecap="round"/>`;
  s += `<path d="${body}" fill="${fill}" stroke="${MK.sacD}" stroke-width="${f1(lw)}" stroke-linejoin="round"/>`;
  s += `<rect x="${f1(x - hw + lw / 2)}" y="${f1(y - st - h * 0.03)}" width="${f1(hw * 2 - lw)}" height="${f1(h * 0.06)}" fill="${fill}"/>`;
  s += `<path d="M ${f1(x - bw * 0.42)} ${f1(y - h * 0.62)} Q ${f1(x - bw * 0.46)} ${f1(y - h * 0.84)} ${f1(x - bw * 0.14)} ${f1(y - h * 0.92)}" fill="none" stroke="#fff" stroke-width="${f1(h * 0.022)}" stroke-linecap="round" opacity="0.75"/>`;
  const top = y - h, bot = y - st;
  for (let i = 0; i < Math.min(14, Math.floor(sugar)); i++) {
    const [a, b] = SUGAR_P[i], wf = Math.sin(Math.PI * clamp(0.14 + b * 0.78));
    s += dot(x + a * bw * 1.05 * wf, top + (0.06 + b * 0.86) * (bot - top), MK.sugar, Math.max(4, h * 0.03));
  }
  return s;
}

// 1. つかみ：こたつで みかんを むくと、しろい すじ
function kotatsuRoom() {
  let s = `<rect width="1920" height="1080" fill="#f7ead4"/>`;
  // まど（ふゆの そと）
  s += `<rect x="110" y="110" width="400" height="330" rx="14" fill="#cfe6f3" stroke="#b48a5c" stroke-width="16"/><line x1="310" y1="110" x2="310" y2="440" stroke="#b48a5c" stroke-width="10"/><line x1="110" y1="275" x2="510" y2="275" stroke="#b48a5c" stroke-width="10"/>`;
  for (let i = 0; i < 9; i++) s += `<circle cx="${f1(140 + rnd(i, 61) * 340)}" cy="${f1(140 + rnd(i, 62) * 270)}" r="${f1(5 + rnd(i, 63) * 4)}" fill="#fff" opacity="0.9"/>`;
  // たたみ
  s += `<rect x="0" y="730" width="1920" height="350" fill="#d7cf9c"/><line x1="0" y1="730" x2="1920" y2="730" stroke="#b9b07a" stroke-width="6"/>`;
  // こたつ（てんいた と ふとん）
  s += `<path d="M 520 700 L 1720 700 L 1880 1080 L 360 1080 Z" fill="#d56d57"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) s += `<circle cx="${f1(520 + c * 150 + (r % 2 ? 75 : 0) - r * 30 + c * r * 6)}" cy="${770 + r * 80}" r="16" fill="#f3c7a8" opacity="0.75"/>`;
  s += `<path d="M 600 590 L 1640 590 L 1740 700 L 500 700 Z" fill="#c59058" stroke="#9c6b3a" stroke-width="6" stroke-linejoin="round"/><path d="M 500 700 L 1740 700 L 1740 724 L 500 724 Z" fill="#9c6b3a"/>`;
  return s;
}
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1;
    let out = kotatsuRoom();
    out += mikanWhole(800, 630, 46) + mikanWhole(895, 650, 40);
    // むく
    const MX = 1220, MY = 385, R = 190, RY = R * 0.88;
    const pk = eio(prog(t, c0 + d0 * 0.4, 1.1));
    const zk = eo(prog(t, c1 + 0.2, 0.8));
    let m = '';
    if (pk > 0) [-78, -40, 0, 40, 78].forEach(a => {
      const L = 165 * pk;
      m += `<g transform="translate(0 ${f1(RY * 0.82)}) rotate(${a})"><path d="M 0 0 Q -62 ${f1(L * 0.45)} 0 ${f1(L)} Q 62 ${f1(L * 0.45)} 0 0 Z" fill="${MK.albedo}" stroke="${MK.peel}" stroke-width="12" stroke-linejoin="round" opacity="${f1(pk)}"/></g>`;
    });
    m += g(mikanPeeled(0, 0, R * 0.93, RY * 0.93, { w: lerp(7, 9, zk) + Math.sin(t * 4) * zk }), { o: pk });
    m += g(mikanWhole(0, 0, R), { o: 1 - pk });
    out += pop(m, t, c0 + 0.1, MX, MY, { s: lerp(1, 1.12, zk) });
    // しろい すじ
    const lk = prog(t, c1 + d1 * 0.25, 0.4) * (1 - prog(t, cueE(3) + 0.4, 0.3));
    out += pointer(1530, 250, 1340, 312, MK.peelD, lk) + pop(olText(0, 0, 'しろい すじ', { size: 68, sw: 16 }), t, c1 + d1 * 0.25, 1620, 215, { end: cueE(3) + 0.7 });
    out += pop(text(0, 0, '？', { size: 190, w: 900, fill: C.ochre }), t, cue(3) + 0.4, 1640, 420, { end: cueE(3) + 0.7 });
    out += kidShow('S', t, 330, 900, { s: 0.62, start: cue(2) - 0.9, n: 0, look: [8, -4] });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="136" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${MK.peelD}">みかん</tspan>の 白いすじは、</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="136" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">何のために あるの？</text>`, { x: 960, y: 610, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(mikanWhole(0, 0, 84), t, t0 + 1.7, 700, 840) + pop(mikanPeeled(0, 0, 84, 74), t, t0 + 1.9, 960, 840) + pop(g(segSide(-50, 0, 160), { r: -20 }), t, t0 + 2.1, 1220, 840);
    }
    return out;
  },
});

// 2. 予想：しろい すじの しょうたいは？
const GUESS_ICON = [
  // みずと えいようの とおりみち
  () => thread('M -64 26 Q -20 -40 64 -26', 22) + dot(-36, -2, MK.water, 9) + dot(4, -22, MK.food, 9) + dot(42, -27, MK.water, 9),
  // かわの かけら
  () => peelPiece(-56, -40, 112, 80),
  // ふさを まもる いと
  () => g(segSide(-36, 0, 110), { r: -12 }),
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.55;
    out += pop(text(40, 0, 'しろい すじの しょうたいは？', { size: 64, w: 900 }) + g(mikanPeeled(0, 0, 50, 44), { x: -470 }), t, 0.3, 760, 215);
    out += pop(badge('よそうして みよう', { fill: C.ochre, size: 38 }), t, q0, 1530, 215);
    const opts = [['①', 'みずと えいようの とおりみち'], ['②', 'むく ときに ちぎれた、かわの かけら'], ['③', 'ふさを まもる いと']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }) + g(`<rect x="-78" y="-56" width="156" height="112" rx="18" fill="#f3e6cf"/>` + GUESS_ICON[i](), { x: 496, y: 0, s: 0.92 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
    });
    out += kidShow('B', t, 1730, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 360, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. みかんの つくり：かわ・しろい ふわふわ・ふさ（ふくろ と つぶつぶ）
SCENES.push({
  id: 'parts',
  draw(t) {
    let out = PAPER + topBadge();
    const c = [0, 1, 2, 3].map(k => cue(k)), d = c.map((x, k) => cueE(k) - x);
    const CX = 600, CY = 480, R = 320;
    out += pop(section(0, 0, R, { al: 0.08, hi: t > c[3] + 0.2 ? 0 : -1 }), t, 0.2, CX, CY);
    out += g(text(CX, 128, 'よこに きった ところ', { size: 36, w: 700, fill: C.muted }), { o: prog(t, 0.6, 0.4) });
    // めだたせる わ
    const ringHL = (r1, r2, a, b) => { const o = win(t, a, b, 0.3) * (0.55 + 0.45 * Math.sin(t * 6)); return o <= 0.01 ? '' : `<g opacity="${f1(o * 10) / 10}" fill="none" stroke="${C.red}" stroke-width="7"><circle cx="${CX}" cy="${CY}" r="${f1(R * r1)}"/><circle cx="${CX}" cy="${CY}" r="${f1(R * r2)}"/></g>`; };
    const a0 = c[0] + d[0] * 0.55;
    out += ringHL(1.012, 0.9, a0, c[1]) + ringHL(0.9, 0.82, c[1] + 0.2, c[2]) + ringHL(0.82, 0.1, c[2] + 0.2, c[3]);
    // なまえ
    const lab = (st, y, chipFill, chipStroke, str, px, py) => {
      const o = prog(t, st, 0.3);
      return pointer(1108, y, px, py, C.muted, o) + pop(`<circle cx="0" cy="0" r="30" fill="${chipFill}" stroke="${chipStroke}" stroke-width="6"/>` + text(54, 2, str, { size: 58, w: 900, anchor: 'start' }), t, st, 1160, y);
    };
    out += lab(a0, 210, MK.peel, MK.peelD, 'かわ', CX + R * 0.95 * Math.cos(-0.75), CY + R * 0.95 * Math.sin(-0.75));
    out += lab(c[1] + 0.3, 330, MK.albedo, MK.albedoD, 'しろい ふわふわ', CX + R * 0.86 * Math.cos(-0.33), CY + R * 0.86 * Math.sin(-0.33));
    out += lab(c[2] + 0.3, 450, MK.seg, MK.segD, 'ふさ', CX + R * 0.6 * Math.cos(0.02), CY + R * 0.6 * Math.sin(0.02));
    // ふさの なかみ：ふくろ と つぶつぶ
    const ck = prog(t, c[3] + 0.2, 0.4);
    if (ck > 0) {
      let cd = card(760, 300);
      cd += g(segSide(-40, 0, 220, { bare: true }), { x: -250, y: -20, r: -8 });
      cd += text(-250, 118, 'ふくろ', { size: 40, w: 900 });
      const sk = prog(t, c[3] + d[3] * 0.45, 0.4);
      cd += arrow(-130, -20, -40, -20, C.muted, 10, eo(sk));
      cd += g([[20, 150], [90, 190], [160, 200], [230, 185], [300, 150]].map(([x, h]) => sacShape(x, 80, h)).join('') + text(160, 118, 'つぶつぶ', { size: 40, w: 900 }), { o: sk });
      out += g(cd, { x: 1450, y: 680, o: ck, s: lerp(0.94, 1, eo(ck)) });
    }
    return out;
  },
});

// 4. すじは「いかんそく」：はや つちから きた みずと えいようの とおりみち
const GY = 760;  // じめんの たかさ
const TREE = (() => {
  const branch = qb([360, 470], [620, 400], [900, 330], 12), stem = qb([900, 330], [1010, 315], [1040, 384], 8);
  return {
    water: [[360, GY + 40], [360, 470], ...branch.slice(1), ...stem.slice(1), [1040, 480]],
    food: [[236, 262], [320, 330], [360, 410], [360, 470], ...branch.slice(1), ...stem.slice(1), [1040, 480]],
    branchD: 'M 360 470 Q 620 400 900 330', stemD: 'M 900 330 Q 1010 315 1040 384',
  };
})();
function treeView() {
  let s = `<rect width="1920" height="1080" fill="#e6f3f7"/>`;
  s += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${MK.soil}"/><rect x="0" y="${GY - 8}" width="1920" height="18" rx="9" fill="${MK.leafL}"/>`;
  s += `<path d="M 360 ${GY} Q 330 ${GY + 32} 262 ${GY + 42} M 360 ${GY} Q 396 ${GY + 34} 470 ${GY + 44} M 360 ${GY} L 360 ${GY + 46}" fill="none" stroke="${MK.woodD}" stroke-width="14" stroke-linecap="round"/>`;
  s += `<path d="M 360 ${GY + 6} L 360 300" stroke="${MK.wood}" stroke-width="52" stroke-linecap="round"/>`;
  s += `<path d="${TREE.branchD}" fill="none" stroke="${MK.wood}" stroke-width="24" stroke-linecap="round"/><path d="${TREE.stemD}" fill="none" stroke="${MK.wood}" stroke-width="10" stroke-linecap="round"/>`;
  [[300, 240, 150], [440, 215, 140], [200, 320, 115], [520, 300, 100], [370, 160, 120]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${MK.leaf}"/>`; });
  [[260, 200, 60], [430, 170, 50], [500, 280, 40], [190, 300, 44]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${MK.leafL}" opacity="0.5"/>`; });
  [[330, 300], [470, 250], [230, 370]].forEach(([x, y]) => { s += mikanWhole(x, y, 24, { heta: false }); });
  s += leafShape(560, 414, -55) + leafShape(690, 380, 35) + leafShape(800, 352, -60) + leafShape(880, 334, -28, 0.9);
  return s;
}
const flowerShape = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-26" rx="15" ry="26" fill="#fff" stroke="#d9d2c0" stroke-width="3" transform="rotate(${a})"/>`).join('')}<circle r="12" fill="${MK.sugar}"/></g>`;
// たてに きった みかん（へたが うえ）。まんなか (FX, FY)
const FX = 760, FY = 500;
const DORSAL = sd => [...qb([FX, FY - 236], [FX + sd * 262, FY - 204], [FX + sd * 286, FY], 12), ...qb([FX + sd * 286, FY], [FX + sd * 262, FY + 204], [FX, FY + 236], 12).slice(1)];
const dorsalD = sd => `M ${FX} ${FY - 236} Q ${FX + sd * 262} ${FY - 204} ${FX + sd * 286} ${FY} Q ${FX + sd * 262} ${FY + 204} ${FX} ${FY + 236}`;
function cutaway() {
  let s = `<path d="M ${FX} 30 L ${FX} 214" stroke="${MK.wood}" stroke-width="26" stroke-linecap="round"/>` + leafShape(FX + 8, 120, -32, 1.4) + leafShape(FX - 8, 160, 205, 1.2);
  s += `<ellipse cx="${FX}" cy="${FY}" rx="330" ry="286" fill="${MK.peel}"/><ellipse cx="${FX}" cy="${FY}" rx="304" ry="260" fill="${MK.albedo}"/>`;
  [-1, 1].forEach(sd => {
    s += `<path d="${dorsalD(sd)} Z" fill="${MK.seg}"/>`;
    [[-150, 120, 46], [-90, 150, 62], [-30, 160, 70], [30, 160, 70], [90, 150, 62], [150, 120, 46]].forEach(([y, x, rx]) => { s += `<ellipse cx="${FX + sd * x}" cy="${FY + y}" rx="${rx}" ry="17" fill="${MK.sac}" opacity="0.9" transform="rotate(${f1(sd * y * 0.16)} ${FX + sd * x} ${FY + y})"/>`; });
  });
  s += `<path d="M ${FX - 20} ${FY - 240} Q ${FX - 27} ${FY} ${FX - 20} ${FY + 240} L ${FX + 20} ${FY + 240} Q ${FX + 27} ${FY} ${FX + 20} ${FY - 240} Z" fill="${MK.albedo}"/>`;
  s += `<ellipse cx="${FX}" cy="${FY}" rx="330" ry="286" fill="none" stroke="${MK.peelD}" stroke-width="9"/><ellipse cx="${FX}" cy="${FY - 284}" rx="46" ry="16" fill="${MK.leafD}"/>`;
  return s;
}
SCENES.push({
  id: 'pipe',
  draw(t) {
    const c = [0, 1, 2, 3, 4, 5, 6].map(k => cue(k)), d = c.map((x, k) => cueE(k) - x);
    const kB = prog(t, c[3] - 0.5, 0.5);
    let out = '';
    // A：木と えだと み
    if (kB < 1) {
      let a = treeView();
      const gk = eio(prog(t, c[0] + d[0] * 0.3, d[0] * 0.6)), green = 1 - eio(prog(t, c[0] + d[0] * 0.62, d[0] * 0.35));
      const r = lerp(22, 150, gk) * (1 + 0.03 * Math.sin(t * 3) * prog(t, c[1], 0.5));
      a += g(mikanWhole(1040, 384 + 0.86 * r, r, { green }), { o: prog(t, c[0] + d[0] * 0.28, 0.3) });
      a += g(flowerShape(1040, 400, 1.5), { o: prog(t, c[0] + 0.1, 0.3) * (1 - prog(t, c[0] + d[0] * 0.3, 0.5)) });
      a += pop(badge('はなが さいてから 5〜6かげつ', { fill: MK.peelD, size: 42 }), t, c[0] + 0.3, 1440, 190, { end: c[1] + 0.2 });
      const mo = win(t, c[0] + 0.5, c[1] + 0.2, 0.3);
      if (mo > 0) { let m = ''; for (let i = 0; i < 6; i++) m += `<circle cx="${(i - 2.5) * 82}" cy="0" r="30" fill="${i < gk * 6 - 0.05 ? MK.peel : '#d9d6c9'}"/>` + text((i - 2.5) * 82, 2, i + 1, { size: 34, w: 900, fill: '#fff' }); a += g(m + text(262, 2, 'かげつ', { size: 36, w: 900, anchor: 'start', fill: C.muted }), { x: 1400, y: 290, o: mo }); }
      // みずと えいようが ながれる
      a += flow(TREE.water, t, c[1] + 0.2, [MK.water], { v: 230, gap: 120, r: 14 }) + flow(TREE.food, t, c[1] + 0.5, [MK.food], { v: 230, gap: 120, r: 14, off: 60 });
      a += pop(dot(-70, 0, MK.water, 16) + text(-40, 2, 'みず', { size: 52, w: 900, anchor: 'start', fill: MK.water }), t, c[1] + d[1] * 0.5, 560, 640);
      a += pop(dot(-70, 0, MK.food, 16) + text(-40, 2, 'えいよう', { size: 52, w: 900, anchor: 'start', fill: MK.food }), t, c[1] + d[1] * 0.7, 800, 200);
      const lb = (st, x, y, str, px, py, ol) => pointer(x, y + 34, px, py, ol, prog(t, st, 0.3)) + pop(olText(0, 0, str, { size: 52, ol, sw: 12 }), t, st, x, y);
      a += lb(c[2] + d[2] * 0.02, 110, 90, 'は', 190, 190, MK.leafD);
      a += pop(olText(0, 0, 'つち', { size: 52, ol: MK.woodD, sw: 12 }), t, c[2] + d[2] * 0.12, 700, GY + 44);
      a += pointer(700, 520, 660, 404, MK.woodD, prog(t, c[2] + d[2] * 0.45, 0.3)) + pop(olText(0, 0, 'えだ', { size: 52, ol: MK.woodD, sw: 12 }), t, c[2] + d[2] * 0.45, 700, 550);
      a += pointer(1220, 300, 1052, 380, MK.leafD, prog(t, c[2] + d[2] * 0.62, 0.3)) + pop(olText(0, 0, 'へた', { size: 56, ol: MK.leafD, sw: 12 }), t, c[2] + d[2] * 0.62, 1290, 280);
      out += a;
    }
    // B：みの なか（たてに きった ところ）
    if (kB > 0) {
      let b = PAPER + topBadge() + cutaway();
      const tk = eo(prog(t, c[3] + d[3] * 0.25, 1.4));
      b += thread(`M ${FX} 214 L ${FX} ${f1(lerp(214, FY, tk))}`, 18, prog(t, c[3], 0.3));
      const ak = eo(prog(t, c[4] + 0.2, 1.6));
      [-1, 1].forEach(sd => { b += thread(dorsalD(sd), 13, 1, ak); });
      b += flow([[FX, 40], [FX, FY]], t, c[3] - 0.3, [MK.water, MK.food], { v: 170, gap: 76, r: 11 });
      [-1, 1].forEach(sd => { b += flow(DORSAL(sd), t, c[4] + 1.2, [MK.food, MK.water], { v: 190, gap: 110, r: 11, off: sd > 0 ? 55 : 0 }); });
      b += pointer(590, 172, FX - 44, 214, MK.leafD, prog(t, c[3] + 0.2, 0.3)) + pop(olText(0, 0, 'へた', { size: 56, ol: MK.leafD, sw: 12 }), t, c[3] + 0.2, 530, 160);
      const mk = c[3] + d[3] * 0.4;
      b += pointer(352, 450, FX - 14, 400, C.muted, prog(t, mk, 0.3)) + pop(text(0, -32, 'まんなかへ', { size: 50, w: 900 }) + text(0, 32, 'のびる くだ', { size: 50, w: 900 }), t, mk, 200, 450);
      // たてに きった ところ
      const vO = win(t, c[3] - 0.3, c[4] - 0.1, 0.3);
      if (vO > 0) b += g(mikanWhole(0, 0, 120) + `<line x1="0" y1="-150" x2="0" y2="150" stroke="${C.red}" stroke-width="8" stroke-dasharray="20 14" stroke-linecap="round"/>` + text(0, 200, 'たてに きった ところ', { size: 42, w: 900, fill: C.muted }), { x: 1480, y: 420, o: vO });
      b += pop(text(0, 0, 'くだの たば ＝ しろい すじ', { size: 50, w: 900 }), t, c[4] + 0.3, 1470, 170);
      b += pop(badge('いかんそく', { fill: MK.peelD, size: 64, pad: 46 }), t, c[4] + d[4] * 0.55, 1470, 268);
      // ひとの からだで いえば けっかん
      const vk = prog(t, c[6] + 0.2, 0.4);
      if (vk > 0) {
        let v = card(600, 270);
        v += `<g transform="translate(-232 6)"><path d="M 0 30 C -60 -10 -44 -62 0 -34 C 44 -62 60 -10 0 30 Z" fill="${C.red}"/><path d="M 34 -6 Q 70 -30 96 -8 M 30 12 Q 66 40 100 30 M 60 -22 Q 74 -48 96 -50" fill="none" stroke="${C.red}" stroke-width="9" stroke-linecap="round"/><path d="M -30 20 Q -40 56 -20 76" fill="none" stroke="${C.blueUi}" stroke-width="9" stroke-linecap="round"/></g>`;
        v += text(80, -78, 'ひとの からだで いえば', { size: 36, w: 700, fill: C.muted }) + text(80, -8, 'けっかん', { size: 72, w: 900, fill: C.red }) + text(80, 70, 'の ような やくめ', { size: 38, w: 900 });
        b += g(v, { x: 1470, y: 480, o: vk, s: lerp(0.94, 1, eo(vk)) });
      }
      b += kidShow('K', t, 1700, 880, { s: 0.7, start: c[5] - 0.9, n: 0 });
      out += g(b, { o: kB });
    }
    return out;
  },
});

// 5. ふさ ひとつに ふとい すじが 3ぼん。かわの うちがわの ふわふわとは べつの もの
SCENES.push({
  id: 'three',
  draw(t) {
    let out = PAPER + topBadge();
    const c = [0, 1, 2, 3].map(k => cue(k)), d = c.map((x, k) => cueE(k) - x);
    // A：ふさを きって みると、すじが 3ぼん
    const aO = 1 - prog(t, c[2] - 0.5, 0.4);
    if (aO > 0) {
      let a = pop(section(0, 0, 170, { hi: 0, sacs: false }), t, 0.2, 290, 400);
      a += arrow(360, 300, 660, 300, C.muted, 12, eo(prog(t, 0.6, 0.6)));
      const AX = 1040, AY = 810, RW = 560, HA = 24 * Math.PI / 180, sx = RW * Math.sin(HA), sy = RW * Math.cos(HA);
      const wd = `M 0 0 L ${f1(-sx)} ${f1(-sy)} A ${RW} ${RW} 0 0 1 ${f1(sx)} ${f1(-sy)} Z`;
      const sacs = [[-13, 430, 62], [-4, 455, 66], [6, 445, 64], [15, 420, 58], [-9, 300, 56], [2, 320, 60], [11, 295, 52], [-3, 185, 44], [5, 165, 38]].map(([ang, rr, rx]) => `<ellipse cx="0" cy="${-rr}" rx="15" ry="${rx}" fill="${MK.sac}" opacity="0.9" transform="rotate(${ang})"/>`).join('');
      const wk = prog(t, 0.5, 0.5);
      [-50, 50].forEach(rot => { a += g(`<path d="${wd}" fill="${MK.seg}" stroke="${MK.thread}" stroke-width="8" stroke-linejoin="round"/>`, { x: AX, y: AY, r: rot, o: 0.3 * wk }); });
      a += g(`<path d="${wd}" fill="${MK.seg}" stroke="${MK.thread}" stroke-width="8" stroke-linejoin="round"/>${sacs}<path d="${wd}" fill="none" stroke="${MK.segD}" stroke-width="6" stroke-linejoin="round"/>`, { x: AX, y: AY, o: wk, s: lerp(0.9, 1, eo(wk)) });
      // すじの きりくち 3つ
      const B3 = [[AX, AY - RW - 2, 28], [AX - 347 * Math.sin(HA) - 10, AY - 347 * Math.cos(HA), 23], [AX + 347 * Math.sin(HA) + 10, AY - 347 * Math.cos(HA), 23]];
      const NP = [[90, -30], [-78, -44], [78, -44]];
      B3.forEach(([x, y, r], i) => {
        const st = c[0] + d[0] * 0.4 + i * 0.5, pulse = 1 + 0.25 * Math.sin(Math.PI * prog(t, st, 0.5));
        a += pop(`<circle r="${r}" fill="${MK.thread}" stroke="${MK.threadL}" stroke-width="7"/>`, t, st - 0.2, x, y, { s: pulse });
        a += pop(`<circle r="34" fill="${C.ochre}"/>` + text(0, 3, i + 1, { size: 46, w: 900, fill: '#fff' }), t, st, x + NP[i][0], y + NP[i][1], { end: c[1] + 0.1 });
      });
      const l1 = c[1] + 0.2, l2 = c[1] + d[1] * 0.42;
      a += pointer(1380, 200, B3[0][0] + 30, B3[0][1] - 4, C.muted, prog(t, l1, 0.3)) + pop(text(0, 0, 'せなかに 1ぽん', { size: 54, w: 900, anchor: 'start' }), t, l1, 1400, 198);
      a += pointer(1480, 430, B3[2][0] + 26, B3[2][1], C.muted, prog(t, l2, 0.3)) + pop(text(0, 0, 'わきに 1ぽん', { size: 50, w: 900, anchor: 'start' }), t, l2, 1500, 428);
      a += pointer(520, 660, B3[1][0] - 26, B3[1][1] + 4, C.muted, prog(t, l2 + 0.4, 0.3)) + pop(text(0, 0, 'わきに 1ぽん', { size: 50, w: 900, anchor: 'end' }), t, l2 + 0.4, 500, 662);
      a += pop(badge('ふとい すじが 3ぼん', { fill: MK.peelD, size: 46 }), t, c[0] + d[0] * 0.4, 1580, 740);
      out += g(a, { o: aO });
    }
    // B：かわの うちがわの ふわふわと、しろい すじは べつの もの
    const bO = win(t, c[2] - 0.2, c[3] - 0.3, 0.4);
    if (bO > 0) {
      let b = '';
      const cardA = card(660, 480) + peelPiece(-210, -190, 420, 250) + text(0, 120, 'かわの うちがわの', { size: 44, w: 900 }) + text(0, 180, 'しろい ふわふわ', { size: 50, w: 900, fill: MK.peelD });
      const cardB = card(660, 480) + g(segSide(-110, -70, 300), { r: -6 }) + text(0, 120, 'ふさの', { size: 44, w: 900 }) + text(0, 180, 'しろい すじ', { size: 50, w: 900, fill: MK.peelD });
      b += pop(cardA, t, c[2] + 0.1, 460, 450) + pop(cardB, t, c[2] + d[2] * 0.42, 1460, 450);
      b += pop(text(0, 0, '≠', { size: 190, w: 900, fill: C.red }), t, c[2] + d[2] * 0.68, 960, 400);
      b += pop(badge('べつの もの', { fill: C.red, size: 50 }), t, c[2] + d[2] * 0.72, 960, 560);
      out += g(b, { o: bO });
    }
    // C：じゅくすと ふわふわが くずれて、すじの あみめが のこる
    const cO = prog(t, c[3] - 0.1, 0.4);
    if (cO > 0) {
      let cc = '';
      const R = 230, LX = 480, RX = 1440, Y = 480;
      cc += pop(section(0, 0, R, { al: 0.24, green: 1, sacs: false }), t, c[3] + 0.1, LX, Y);
      cc += pop(text(0, 0, 'みどりの ころ', { size: 50, w: 900, fill: MK.leafD }), t, c[3] + 0.2, LX, 180);
      cc += pop(badge('ふわふわが あつい', { fill: MK.leafD, size: 40 }), t, c[3] + 0.6, LX, 770);
      const rk = c[3] + d[3] * 0.4;
      cc += arrow(790, Y, 1120, Y, C.muted, 18, eo(prog(t, rk - 0.4, 0.6)));
      cc += pop(text(0, 0, 'じゅくす', { size: 40, w: 900, fill: C.muted }), t, rk - 0.3, 955, Y - 56);
      const rin = R * 0.86;
      let ripe = section(0, 0, R, { al: 0.04, sacs: false });
      // のこった すじの あみめ
      ripe += `<circle r="${f1(rin + 3)}" fill="none" stroke="${MK.threadL}" stroke-width="13" stroke-dasharray="46 14 20 10 60 18 30 12"/><circle r="${f1(rin + 3)}" fill="none" stroke="${MK.thread}" stroke-width="8" stroke-dasharray="46 14 20 10 60 18 30 12"/>`;
      for (let i = 0; i < 10; i++) { const am = (i + 0.5) / 10 * Math.PI * 2 - Math.PI / 2; ripe += `<circle cx="${f1((rin + 3) * Math.cos(am))}" cy="${f1((rin + 3) * Math.sin(am))}" r="10" fill="${MK.thread}" stroke="${MK.threadL}" stroke-width="4"/>`; }
      cc += pop(ripe, t, rk, RX, Y);
      cc += pop(text(0, 0, 'じゅくした ころ', { size: 50, w: 900, fill: MK.peelD }), t, rk + 0.1, RX, 180);
      cc += pop(badge('すじの あみめが のこる', { fill: MK.peelD, size: 40 }), t, c[3] + d[3] * 0.7, RX, 770);
      out += g(cc, { o: cO });
    }
    return out;
  },
});

// 6. つぶつぶには くだが つながって いない。さいぼうから さいぼうへ てわたし
const SACS = [[180, 350], [370, 420], [580, 470], [790, 415], [985, 345]];
const WALL_Y = 716;
SCENES.push({
  id: 'sac',
  draw(t) {
    let out = PAPER + topBadge();
    const c = [0, 1, 2, 3, 4, 5].map(k => cue(k)), d = c.map((x, k) => cueE(k) - x);
    // ふくろの かべ と、そこを とおる すじ
    out += `<rect x="50" y="${WALL_Y}" width="1170" height="86" rx="22" fill="${MK.segD}" opacity="0.75"/>`;
    out += thread(`M 60 ${WALL_Y + 50} L 1210 ${WALL_Y + 50}`, 16);
    out += flow([[60, WALL_Y + 50], [1210, WALL_Y + 50]], t, 0.2, [MK.food, MK.water], { v: 150, gap: 98, r: 10 });
    // つぶつぶ
    const fill5 = Math.floor(prog(t, c[5] + 1.6, d[5]) * 9);
    SACS.forEach(([x, h], i) => {
      let s = sacShape(0, 0, h);
      if (i === 2 && fill5 > 0) for (let k = 0; k < fill5; k++) { const [a, b] = SUGAR_P[k], wf = Math.sin(Math.PI * clamp(0.14 + b * 0.78)); s += dot(a * h * 0.22 * 1.05 * wf, -h + (0.06 + b * 0.86) * (h * 0.65), MK.food, 11); }
      out += pop(s, t, 0.15 + i * 0.1, x, WALL_Y);
    });
    out += pointer(110, 660, 110, WALL_Y + 44, C.muted, prog(t, 0.9, 0.3)) + pop(text(0, 0, 'すじ', { size: 48, w: 900 }), t, 0.9, 100, 630);
    // ？
    out += pop(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), t, c[0] + d[0] * 0.5, 690, 640, { end: c[1] - 0.1 });
    // なまえ
    const n1 = c[1] + 0.2, n2 = c[1] + d[1] * 0.3, n3 = c[1] + d[1] * 0.62;
    out += pop(text(0, 0, 'つぶつぶ', { size: 50, w: 900, fill: MK.sacD }), t, n1, 590, 210, { end: c[5] - 0.3 });
    out += pop(`<circle r="36" fill="${C.ochre}"/>` + text(0, 3, 'え', { size: 46, w: 900, fill: '#fff' }), t, n2, 700, 640) + pointer(668, 640, 596, 640, C.ochre, prog(t, n2, 0.3));
    out += pointer(1150, 650, 1150, WALL_Y + 12, C.muted, prog(t, n3, 0.3)) + pop(text(0, -26, 'ふくろの', { size: 42, w: 900 }) + text(0, 26, 'かべ', { size: 42, w: 900 }), t, n3, 1160, 590);
    // むしめがね：えの なかを おおきく みると
    const mO = prog(t, c[2] - 0.2, 0.4);
    if (mO > 0) {
      const MXc = 1500, MYc = 370, MR = 205;
      out += `<circle cx="580" cy="640" r="${f1(40 + 4 * Math.sin(t * 5))}" fill="none" stroke="${C.blueUi}" stroke-width="7" opacity="${mO}"/>`;
      const yc = r => -180 + r * 72;
      let m = `<rect x="-230" y="-230" width="460" height="460" fill="#fdf3dc"/><rect x="-88" y="-230" width="176" height="460" fill="${MK.cell}"/><path d="M -88 -230 L -88 230 M 88 -230 L 88 230" stroke="${MK.sacD}" stroke-width="9"/>`;
      for (let r = 0; r < 6; r++) [-42, 42].forEach((x, ci) => { m += `<rect x="${x - 38}" y="${yc(r) - 32}" width="76" height="64" rx="15" fill="#fef6e2" stroke="${MK.cellL}" stroke-width="4"/><circle cx="${x + (ci ? 12 : -12)}" cy="${yc(r) + (r % 2 ? 8 : -8)}" r="7" fill="${MK.cellL}" opacity="0.55"/>`; });
      // くだは ない（さがしても みつからない）
      const gk = win(t, c[2] + d[2] * 0.3, c[4] - 0.2, 0.3);
      if (gk > 0) m += `<g opacity="${f1(gk * 100) / 100}"><rect x="-17" y="-230" width="34" height="460" fill="#fff" fill-opacity="0.55" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="16 12"/></g>` + g(cross(0, 0, 0.75), { o: prog(t, c[2] + d[2] * 0.62, 0.25) * gk, s: lerp(1.4, 1, eo(prog(t, c[2] + d[2] * 0.62, 0.3))) });
      // となりと つながる ちいさな あな
      const hk = prog(t, c[4] + d[4] * 0.3, 0.4);
      if (hk > 0) {
        const hp = 0.75 + 0.25 * Math.sin(t * 6);
        for (let r = 0; r < 5; r++) [-42, 42].forEach(x => { m += `<circle cx="${x}" cy="${yc(r) + 36}" r="${f1(11 * hk)}" fill="#fff" stroke="${C.red}" stroke-width="5" opacity="${f1(hp * 100) / 100}"/>`; });
        for (let r = 0; r < 6; r++) m += `<circle cx="0" cy="${yc(r)}" r="${f1(9 * hk)}" fill="#fff" stroke="${C.red}" stroke-width="4" opacity="${f1(hp * 100) / 100}"/>`;
      }
      // てわたし：えいようの つぶが さいぼうから さいぼうへ
      for (let k = 0; k < 6; k++) {
        const s0 = (t - c[5]) * 0.95 - k * 1.17; if (s0 < 0) continue;
        const u = s0 % 7, i = Math.floor(u), fr = u - i;
        m += dot(k % 2 ? 42 : -42, yc(5 - i) - 72 * eio(clamp((fr - 0.45) / 0.55)), MK.food, 15);
      }
      out += g(`<clipPath id="mgc"><circle r="${MR}"/></clipPath><rect x="120" y="150" width="52" height="170" rx="26" fill="${C.ochre}" transform="rotate(-42 146 150)"/><g clip-path="url(#mgc)">${m}</g><circle r="${MR}" fill="none" stroke="${C.blueUi}" stroke-width="18"/>`, { x: MXc, y: MYc, o: mO, s: lerp(0.9, 1, eo(mO)) });
      out += pop(text(0, 0, 'えの なか', { size: 44, w: 900, fill: C.blueUi }), t, c[2], 1260, 150, { end: c[2] + d[2] * 0.6 });
      out += pop(badge('くだが ない！', { fill: C.red, size: 48 }), t, c[2] + d[2] * 0.62, 1500, 100, { end: c[4] + 0.1 });
      out += pop(badge('かべに ちいさな あな', { fill: C.red, size: 44 }), t, c[4] + d[4] * 0.3, 1500, 100, { end: c[5] - 0.1 });
      out += pop(badge('さいぼうから さいぼうへ てわたし', { fill: MK.food, size: 38 }), t, c[5] + d[5] * 0.25, 1550, 700);
      out += pop(text(0, 0, '（と かんがえられて いる）', { size: 36, w: 700, fill: C.muted }), t, c[5] + d[5] * 0.6, 1550, 772);
    }
    // えを のぼる えいよう
    out += flow([[580, WALL_Y + 50], [580, WALL_Y - 470 * 0.35], [580, WALL_Y - 470 * 0.45]], t, c[5] + 0.3, [MK.food], { v: 70, gap: 48, r: 7 });
    // おとうと
    const fy = 900 - KID_HEAD.B[2] * 0.5;
    out += kidShow('B', t, 1790, 900, { s: 0.5, start: c[3] - 0.9, n: 0, bubble: false, end: c[4] + 0.6 });
    out += talkBubble('B', 1470, 705, 1790 - 46, fy);
    return out;
  },
});

// 7. つぶつぶは まず おおきく なって、それから あまく なる。すじや ふくろの せいぶん
SCENES.push({
  id: 'sweet',
  draw(t) {
    let out = PAPER + topBadge();
    const c = [0, 1, 2, 3].map(k => cue(k)), d = c.map((x, k) => cueE(k) - x);
    const aO = 1 - prog(t, c[2] - 0.6, 0.3);
    if (aO > 0) {
      let a = '';
      const BY = 770, ST = [[250, 170], [540, 310], [900, 480]];
      a += `<rect x="120" y="${BY}" width="960" height="26" rx="13" fill="${MK.segD}" opacity="0.7"/>`;
      const sug = Math.floor(Math.pow(prog(t, c[1] + d[1] * 0.45, d[1] * 0.6), 0.6) * 14.99);
      ST.forEach(([x, h], i) => {
        const st = c[0] + 0.2 + i * (d[0] * 0.38);
        a += pop(sacShape(0, 0, h, { sugar: i === 2 ? sug : 0 }), t, st, x, BY);
        if (i < 2) a += arrow(x + 90 + i * 30, 600, ST[i + 1][0] - 110 - i * 40, 600, C.muted, 14, eo(prog(t, st + 0.5, 0.5)));
      });
      a += pop(badge('まず おおきく なる', { fill: C.accent, size: 46 }), t, c[0] + d[0] * 0.35, 520, 200);
      // あまみの メーター
      const mk = prog(t, c[1] - 0.1, 0.4);
      if (mk > 0) {
        const lv = Math.pow(prog(t, c[1] + d[1] * 0.45, d[1] * 0.6), 0.6);
        let m = card(480, 520);
        m += dot(-100, -196, MK.sugar, 20) + text(-64, -194, 'あまみ', { size: 54, w: 900, anchor: 'start', fill: MK.sugarD });
        m += `<rect x="-60" y="-130" width="120" height="330" rx="26" fill="#efe6d2"/><rect x="-60" y="${f1(200 - 330 * lv)}" width="120" height="${f1(330 * lv)}" rx="26" fill="${MK.sugar}"/><rect x="-60" y="-130" width="120" height="330" rx="26" fill="none" stroke="${MK.sugarD}" stroke-width="6"/>`;
        a += g(m, { x: 1500, y: 500, o: mk, s: lerp(0.94, 1, eo(mk)) });
        a += pop(badge('それから きゅうに あまく', { fill: MK.sugarD, size: 44 }), t, c[1] + d[1] * 0.5, 1500, 170);
        if (lv > 0.9) for (let i = 0; i < 6; i++) { const x = 760 + rnd(i, 71) * 280, y = 300 + rnd(i, 72) * 260, s = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.9); a += `<path d="M ${f1(x)} ${f1(y - 20)} L ${f1(x + 6)} ${f1(y - 6)} L ${f1(x + 20)} ${f1(y)} L ${f1(x + 6)} ${f1(y + 6)} L ${f1(x)} ${f1(y + 20)} L ${f1(x - 6)} ${f1(y + 6)} L ${f1(x - 20)} ${f1(y)} L ${f1(x - 6)} ${f1(y - 6)} Z" fill="${MK.sugar}" opacity="${f1(s * 100) / 100}"/>`; }
      }
      out += g(a, { o: aO });
    }
    // B：すじや ふくろの せいぶん。とるか どうかは このみ
    const bO = prog(t, c[2] - 0.35, 0.3);
    if (bO > 0) {
      let b = '';
      b += pop(g(segSide(-120, 0, 420), { r: -6 }), t, c[2] - 0.3, 470, 480);
      const p1 = c[2] + d[2] * 0.08, p2 = c[2] + d[2] * 0.22;
      b += pointer(250, 250, 430, 330, C.muted, prog(t, p1, 0.3)) + pop(text(0, 0, 'すじ', { size: 54, w: 900 }), t, p1, 220, 210);
      b += pointer(250, 740, 400, 640, C.muted, prog(t, p2, 0.3)) + pop(text(0, 0, 'ふくろ', { size: 54, w: 900 }), t, p2, 220, 780);
      b += pop(text(0, -34, 'つぶつぶに あまり ない', { size: 50, w: 900 }) + text(0, 38, 'せいぶんも ある', { size: 56, w: 900, fill: MK.peelD }), t, c[2] + d[2] * 0.3, 1300, 230);
      const q = c[3] + 0.1;
      b += pop(card(360, 300) + g(segSide(-60, -30, 180), { r: -6 }) + text(0, 108, 'すじを とらない', { size: 36, w: 900 }), t, q, 1090, 560);
      b += pop(card(360, 300) + g(segSide(-60, -30, 180, { bare: true }), { r: -6 }) + text(0, 108, 'すじを とる', { size: 36, w: 900 }), t, q + 0.3, 1510, 560);
      b += pop(badge('どちらでも、このみで', { fill: C.accent, size: 44 }), t, c[3] + d[3] * 0.55, 1300, 775);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.blueUi}"/>` + text(-530, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'みずと えいようの とおりみち', { size: 56, w: 900, anchor: 'start' }) + g(`<rect x="-78" y="-56" width="156" height="112" rx="18" fill="#f3e6cf"/>` + GUESS_ICON[0](), { x: 520, y: 0, s: 1.0 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['すじは くだの たば', MK.peelD], ['へたから みの なかへ', MK.leafD], ['つぶつぶには くだが ない', MK.food]], t, 960, 660, { start: 2.4, step: 0.9, size: 36, gap: 28 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const d1 = cueE(1) - cue(1);
      const segIc = g(segSide(-22, 0, 86), { r: -8 });
      const twoIc = g(segSide(-40, 0, 80), { r: -8 }) + g(segSide(-2, 0, 80), { r: -8 });
      const peelIc = peelPiece(-48, -30, 96, 64);
      const rows = [
        [segIc, 'ふさの せなかに、しろい すじは ある？', C.ink, cue(1)],
        [twoIc, 'ふさと ふさの さかいめにも ある？', C.ink, cue(1) + d1 * 0.45],
        [peelIc, 'かわの うちがわと、ふさの すじを くらべる', C.ink, cue(2)],
        [warnIcon(0.82), 'むく まえに てを あらう。たべるのは おとなに きいてから', C.red, cue(3)],
      ];
      rows.forEach(([ic, s, col, st], i) => {
        b += pop(ic + text(100, 2, s, { size: i === 3 ? 38 : 42, w: 900, anchor: 'start', fill: col }), t, st, 200, 330 + i * 128);
      });
      b += pop(card(400, 330) + mikanPeeled(0, -10, 130, 114) + g(lensIcon(), { x: 60 + Math.sin(t * 1.2) * 14, y: -30 + Math.cos(t * 1.2) * 8, s: 0.5 }), t, cue(1) + 0.3, 1640, 320);
      b += kidShow('K', t, 1700, 800, { s: 0.75, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「みかんの しろい すじは、なんの ために あるの？」へ', { size: 32, w: 700, fill: '#d9e6dc' }), { x: 1000, y: 790, o: prog(t, 2.0, 0.5) });
    out += g(text(0, 0, '出典は 概要欄に', { size: 32, w: 700, fill: '#d9e6dc' }), { x: 1000, y: 842, o: prog(t, 2.0, 0.5) });
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

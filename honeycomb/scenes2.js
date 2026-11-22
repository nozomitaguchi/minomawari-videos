
// みのまわり図鑑 動画「はちの すは、どうして ろっかくけいなの？」（ハチのす）
// 出どころ：everyday-trivia trivia/bee-honeycomb-hexagon.md（絵の見本：assets/figures-bee.js）

// ---------- ハチの巣の道具 ----------
const HC = {
  wax: '#f2c14e', waxLt: '#f9dc8c', waxDk: '#c98a1b', hollow: '#a8651a', hollowDk: '#8a4f12',
  honey: '#f3a41f', honeyLt: '#ffd36b', honeyDk: '#c97a0a', pollen: '#f08a1e', pollen2: '#ffc93c', cap: '#f6e2a4', capDk: '#dcbf73',
  larva: '#fff6e2', larvaDk: '#e6d3ad', bee: '#f6c22e', beeDk: '#3a2a22', fuzz: '#d98f26', wing: '#eaf5fb', wingLn: '#9bb7c6',
  gap: '#ef6a5b', gapDk: '#c94435', ok: '#3d9a5c', paperNest: '#b9b0a2', paperDk: '#8d8376',
};
const SQ3 = Math.sqrt(3);
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
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
const titleAt = (str, t, st, en = 1e9, col = C.ink, x = 960, y = 170, size = 46) => pop(badge(str, { fill: col, size }), t, st, x, y, { end: en });
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const okMark = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="40" fill="${HC.ok}"/><path d="M -18 0 l 13 15 l 25 -29" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const ngMark = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="40" fill="${HC.gapDk}"/><path d="M -16 -16 L 16 16 M 16 -16 L -16 16" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>`;
// 正 n 角形の頂点（rot は最初の頂点の向き。度）
const polyPts = (cx, cy, R, n, rot = -90) => Array.from({ length: n }, (_, i) => { const a = (rot + 360 * i / n) * Math.PI / 180; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
const polyD = pts => 'M ' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ') + ' Z';
const hexD = (cx, cy, R) => polyD(polyPts(cx, cy, R, 6, -90));
// 丸（k=0）から 正 n 角形（k=1）へ変わる形。丸は 多角形の中にぴったり入る大きさ
function morphD(cx, cy, R, n, k, rot = -90) {
  const ap = R * Math.cos(Math.PI / n), seg = 2 * Math.PI / n, pts = [];
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * 2 * Math.PI, m = ((a % seg) + seg) % seg, rp = ap / Math.cos(m - seg / 2), r = lerp(ap, rp, k), th = a + rot * Math.PI / 180;
    pts.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]);
  }
  return polyD(pts);
}
// 部屋ひとつ。kind: 'empty' | 'honey' | 'pollen' | 'larva' | 'egg' | 'cap'
function cell(cx, cy, R, kind = 'empty', i = 0) {
  const r = R * 0.87;
  let s = `<path d="${hexD(cx, cy, R * 1.02)}" fill="${HC.wax}"/>`;
  if (kind === 'cap') return s + `<path d="${hexD(cx, cy, r)}" fill="${HC.cap}" stroke="${HC.capDk}" stroke-width="${R * 0.04}"/>` + [[-0.3, -0.2], [0.25, -0.3], [0.05, 0.2], [-0.3, 0.35], [0.38, 0.22]].map(([a, b]) => `<circle cx="${cx + a * R}" cy="${cy + b * R}" r="${R * 0.05}" fill="${HC.capDk}" opacity="0.6"/>`).join('');
  s += `<path d="${hexD(cx, cy, r)}" fill="${HC.hollow}"/><path d="${hexD(cx, cy + R * 0.08, r * 0.8)}" fill="${HC.hollowDk}" opacity="0.55"/>`;
  if (kind === 'honey') s += `<path d="${hexD(cx, cy, r)}" fill="${HC.honey}"/><path d="${hexD(cx, cy + R * 0.06, r * 0.78)}" fill="${HC.honeyDk}" opacity="0.25"/><path d="M ${cx - R * 0.42} ${cy - R * 0.3} Q ${cx - R * 0.2} ${cy - R * 0.55} ${cx + R * 0.1} ${cy - R * 0.52}" fill="none" stroke="#fff6d8" stroke-width="${R * 0.09}" stroke-linecap="round" opacity="0.85"/>`;
  else if (kind === 'pollen') s += [[-0.3, -0.25, 0.3], [0.28, -0.3, 0.27], [0, 0.05, 0.32], [-0.36, 0.3, 0.26], [0.34, 0.28, 0.28], [0, -0.52, 0.2], [0, 0.55, 0.2]].map(([a, b, q], j) => `<circle cx="${cx + a * R}" cy="${cy + b * R}" r="${R * q}" fill="${j % 2 ? HC.pollen2 : HC.pollen}"/>`).join('');
  else if (kind === 'larva') s += `<path d="M ${cx + R * 0.34} ${cy - R * 0.3} A ${R * 0.44} ${R * 0.44} 0 1 0 ${cx + R * 0.36} ${cy + R * 0.26}" fill="none" stroke="${HC.larva}" stroke-width="${R * 0.34}" stroke-linecap="round"/>` +
    [-150, -110, -70, 150, 110, 70, 180].map(a => { const q = a * Math.PI / 180; return `<line x1="${cx + Math.cos(q) * R * 0.3}" y1="${cy + Math.sin(q) * R * 0.3}" x2="${cx + Math.cos(q) * R * 0.58}" y2="${cy + Math.sin(q) * R * 0.58}" stroke="${HC.larvaDk}" stroke-width="${R * 0.03}"/>`; }).join('') +
    `<circle cx="${cx + R * 0.36}" cy="${cy - R * 0.3}" r="${R * 0.05}" fill="${HC.beeDk}"/>`;
  else if (kind === 'egg') s += `<ellipse cx="${cx}" cy="${cy + R * 0.1}" rx="${R * 0.09}" ry="${R * 0.3}" fill="${HC.larva}" transform="rotate(18 ${cx} ${cy})"/>`;
  return s;
}
// 部屋をならべる。左上の部屋のまん中が (x0, y0)。kindFn(c, r) で中身を決める
function comb(x0, y0, R, cols, rows, kindFn = () => 'empty') {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += cell(x0 + (c + (r % 2) / 2) * SQ3 * R, y0 + r * 1.5 * R, R, kindFn(c, r), c * 31 + r);
  return s;
}
const cellAt = (x0, y0, R, c, r) => [x0 + (c + (r % 2) / 2) * SQ3 * R, y0 + r * 1.5 * R];
// ミツバチ（横から。頭が右。むねの まん中が 0,0）。flakes: おなかの下の ろうの かけら 0〜1、chew: 口を もぐもぐ 0〜1
function bee(t, { fly = 0, flakes = 0, chew = 0, walk = 1 } = {}) {
  const wa = fly ? Math.sin(t * 55) * 22 : Math.sin(t * 3) * 3, lg = Math.sin(t * 12) * 6 * walk;
  let s = `<path d="M -14 22 L ${-24 + lg} 52 M 6 26 L ${6 - lg} 54 M 24 22 L ${36 + lg} 50" stroke="${HC.beeDk}" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  // おなか（しま）
  const ax = -66, ay = 6, rx = 54, ry = 36, yy = u => ry * Math.sqrt(Math.max(0, 1 - (u / rx) * (u / rx)));
  s += `<ellipse cx="${ax}" cy="${ay}" rx="${rx}" ry="${ry}" fill="${HC.bee}"/>`;
  [[-44, -28], [-14, 2], [18, 34]].forEach(([u1, u2]) => { s += `<path d="M ${ax + u1} ${ay - yy(u1)} L ${ax + u2} ${ay - yy(u2)} L ${ax + u2} ${ay + yy(u2)} L ${ax + u1} ${ay + yy(u1)} Z" fill="${HC.beeDk}"/>`; });
  if (flakes > 0) [-92, -74, -56, -38].forEach((x, i) => { const k = clamp(flakes * 4 - i); s += `<rect x="${x}" y="${38 - (i === 0 || i === 3 ? 4 : 0)}" width="13" height="${9 * k}" rx="3" fill="#fffdf4" stroke="${HC.capDk}" stroke-width="1.5" opacity="${k}"/>`; });
  // はね
  s += `<ellipse cx="-30" cy="-44" rx="50" ry="18" transform="rotate(${-22 + wa} 4 -22)" fill="${HC.wing}" fill-opacity="0.85" stroke="${HC.wingLn}" stroke-width="3"/><ellipse cx="-22" cy="-36" rx="36" ry="13" transform="rotate(${-8 + wa * 0.6} 4 -22)" fill="${HC.wing}" fill-opacity="0.8" stroke="${HC.wingLn}" stroke-width="3"/>`;
  // むね・あたま
  s += `<circle cx="0" cy="0" r="30" fill="${HC.fuzz}"/><circle cx="-8" cy="-8" r="12" fill="#e9a640" opacity="0.7"/>`;
  s += `<path d="M 50 -18 Q 62 -44 80 -46 M 42 -20 Q 46 -46 62 -54" fill="none" stroke="${HC.beeDk}" stroke-width="4.5" stroke-linecap="round"/>`;
  s += `<circle cx="42" cy="2" r="24" fill="${HC.beeDk}"/><ellipse cx="50" cy="-4" rx="9" ry="11" fill="#fff"/><circle cx="53" cy="-3" r="5" fill="#1a1410"/><circle cx="55" cy="-6" r="2" fill="#fff"/>`;
  s += `<path d="M 58 16 l ${8 + chew * 3 * Math.sin(t * 16)} ${8 + chew * 4 * Math.abs(Math.sin(t * 16))}" stroke="${HC.beeDk}" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}
// x, y に ハチを置く。dir: 1 右向き / -1 左向き、rot: かたむき（度。進む向き）
const beeAt = (x, y, s, t, dir = 1, rot = 0, o = {}) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s * dir} ${s})">${bee(t, o)}</g>`;
const honeyDrop = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M 0 -44 C 22 -12 34 6 34 24 A 34 34 0 0 1 -34 24 C -34 6 -22 -12 0 -44 Z" fill="${HC.honey}" stroke="${HC.honeyDk}" stroke-width="5"/><path d="M -16 14 Q -16 34 2 40" fill="none" stroke="#fff3c9" stroke-width="7" stroke-linecap="round"/></g>`;
const waxFlake = (x, y, s = 1, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M -24 -10 Q 0 -20 24 -10 Q 30 4 20 14 Q 0 20 -20 14 Q -30 4 -24 -10 Z" fill="#fffdf4" stroke="${HC.capDk}" stroke-width="4"/><path d="M -12 -4 Q 0 -10 12 -4" fill="none" stroke="${HC.capDk}" stroke-width="3" stroke-linecap="round" opacity="0.6"/></g>`;
const numDot = (x, y, n, col = C.blueUi, r = 30) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="#fff" stroke-width="5"/>` + text(x, y + 2, n, { size: r * 1.25, w: 900, fill: '#fff', ls: 0 });
const HOOK_KIND = (c, r) => { const v = rnd(c * 7 + r * 13, 5); return v < 0.26 ? 'honey' : v < 0.36 ? 'cap' : 'empty'; };

// 1. つかみ：びっしり並んだ部屋。どれも六角形
SCENES.push({
  id: 'hook',
  draw(t) {
    const R = 96, X0 = -40, Y0 = 30;
    let out = `<rect width="1920" height="1080" fill="${HC.waxDk}"/>` + comb(X0, Y0, R, 13, 9, HOOK_KIND);
    // 歩くミツバチ（頭が進む向き）
    out += beeAt(-160 + t * 86, 770 + Math.sin(t * 3) * 6, 1.25, t, 1, 0);
    out += beeAt(2080 - t * 70, 118 + Math.sin(t * 2.6 + 1) * 6, 1.1, t + 2, -1, 0);
    out += beeAt(1500 + t * 30, 610 + t * 9, 0.95, t + 4, 1, 16);
    // ひとつの部屋をなぞって、角を数える
    const [hx, hy] = cellAt(X0, Y0, R, 6, 3);
    const hk = prog(t, cue(1) + 0.2, 0.5);
    if (hk > 0) {
      out += `<path d="${hexD(hx, hy, R * 0.98)}" fill="none" stroke="#fff" stroke-width="16" stroke-linejoin="round" opacity="${hk}"/>`;
      polyPts(hx, hy, R * 1.0, 6).forEach(([x, y], i) => { out += pop(numDot(0, 0, i + 1, C.redUi, 32), t, cue(1) + 0.9 + i * 0.36, x, y); });
      out += pop(badge('ろっかくけい', { fill: C.redUi, size: 50, pad: 44 }), t, cue(1) + 3.0, hx, hy - R - 96);
    }
    // 丸でも四角でもなく
    const qk = prog(t, cue(3) + 0.2, 0.5);
    if (qk > 0) {
      let c = card(600, 280);
      c += `<circle cx="-200" cy="-10" r="74" fill="${HC.waxLt}" stroke="${HC.waxDk}" stroke-width="10"/><rect x="-74" y="-84" width="148" height="148" rx="6" fill="${HC.waxLt}" stroke="${HC.waxDk}" stroke-width="10"/>`;
      c += g(cross(-200, -10, 0.7), { o: prog(t, cue(3) + 1.0, 0.25) }) + g(cross(0, -10, 0.7), { o: prog(t, cue(3) + 1.8, 0.25) });
      c += text(210, -6, '？', { size: 170, w: 900, fill: C.ochre });
      c += text(-200, 104, 'まる', { size: 36, w: 900, fill: C.muted }) + text(0, 104, 'しかく', { size: 36, w: 900, fill: C.muted });
      out += g(c, { x: 1570, y: 250, o: qk, s: lerp(0.9, 1, eo(qk)) });
    }
    out += kidShow('S', t, 230, 905, { s: 0.56, start: cue(1) + 0.4, n: 0 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 270);
      const l2 = 'どうして ろっかくけいなの？';
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${HC.waxDk}">はちの す</tspan>は</text>`, { x: 960, y: 450, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="${fit(l2, 1640, 124, 900)}" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.redUi}">ろっかくけい</tspan>なの？</text>`, { x: 960, y: 632, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(comb(-150, 0, 58, 4, 1, (c) => ['honey', 'empty', 'cap', 'honey'][c]), t, t0 + 1.8, 960, 830);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const q = 'はちの すは、どうして ろっかくけいなの？';
    out += pop(text(0, 0, q, { size: fit(q, 1300, 62, 900), w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'はちの からだが、ろっかくけいだから'], ['②', 'すきまなく ならんで、かべが すくなくて すむから'], ['③', 'じょおうばちが、ろっかくけいに きめたから']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 50)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(cell(0, 0, 92, 'honey') + text(140, -60, '？', { size: 110, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1630, 340);
    out += kidShow('B', t, 1720, 850, { s: 0.58, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 部屋は何に使う？ 赤ちゃんを育てる部屋／はちみつ・花粉をためる部屋
const ROOM_KIND = (c, r) => c <= 3 ? ((c + r * 2) % 5 === 0 ? 'egg' : 'larva') : c <= 5 ? (c === 5 && r % 2 === 0 ? 'honey' : 'cap') : (r >= 4 || (r === 3 && c >= 8)) ? 'pollen' : 'honey';
SCENES.push({
  id: 'rooms',
  draw(t) {
    const R = 118, X0 = -60, Y0 = 40;
    let out = `<rect width="1920" height="1080" fill="${HC.waxDk}"/>` + comb(X0, Y0, R, 11, 7, ROOM_KIND);
    out += beeAt(360 + t * 22, 640 + Math.sin(t * 3) * 5, 1.2, t, 1, 0);
    const P = (c, r) => cellAt(X0, Y0, R, c, r);
    const hi = (c, r, o, col) => o <= 0 ? '' : `<path d="${hexD(...P(c, r), R * 0.98)}" fill="none" stroke="${col}" stroke-width="12" stroke-linejoin="round" opacity="${o}"/>`;
    const a0 = prog(t, cue(0) + 0.5, 0.4), b0 = prog(t, cue(1) + 0.3, 0.4), b1 = prog(t, cue(1) + 2.0, 0.4), c1 = prog(t, cue(1) + 3.8, 0.4);
    out += hi(2, 2, a0, '#fff') + hi(7, 2, b0, '#fff') + hi(8, 4, b1, '#fff') + hi(4, 3, c1, '#fff');
    out += tag(P(2, 2)[0] + 20, P(2, 2)[1] - R * 0.8, 590, 200, 'あかちゃんを そだてる へや', a0, { col: C.redUi, size: 46 });
    out += tag(P(7, 2)[0] + 10, P(7, 2)[1] - R * 0.8, 1500, 200, 'はちみつ', b0, { col: HC.honeyDk, size: 50 });
    out += tag(P(8, 4)[0] + 30, P(8, 4)[1] - R * 0.8, 1700, 560, 'かふん', b1, { col: '#c9601a', size: 50 });
    out += tag(P(4, 3)[0], P(4, 3)[1] + R * 0.5, 960, 800, 'ろうの ふた', c1, { col: C.muted, size: 44 });
    return out;
  },
});

// 4. 壁の材料「ろう」：働きバチのおなかから → 口でかむ → 壁。ろうは はちみつから
const WAXC = [[1440, 330], [1613, 330], [1353, 480], [1526, 480], [1700, 480], [1440, 630]];
SCENES.push({
  id: 'wax',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.5, 0.4);
    if (aO > 0) {
      const BX = 640, BY = 470, BS = 3.3;
      let a = '';
      // 作りかけの巣（右）
      WAXC.forEach(([x, y]) => { a += cell(x, y, 100, 'empty'); });
      const nk = prog(t, cue(1) + 4.6, 2.2), NX = 1613, NY = 630;
      a += `<path d="${hexD(NX, NY, 96)}" fill="${HC.hollow}" opacity="${nk * 0.9}"/><path d="${hexD(NX, NY, 96)}" fill="none" stroke="${HC.wax}" stroke-width="18" stroke-linejoin="round" stroke-dasharray="${580 * nk} 600"/>`;
      a += g(badge('かべに する', { fill: HC.waxDk, size: 44 }), { x: 1526, y: 800, o: prog(t, cue(1) + 5.0, 0.4) });
      // 働きバチ
      const fl = prog(t, cue(0) + 2.6, 1.6), ch = win(t, cue(1) + 2.0, cue(1) + 4.2, 0.3);
      a += beeAt(BX, BY + Math.sin(t * 2) * 5, BS, t, 1, 0, { flakes: fl, chew: ch, walk: 0.15 });
      a += pop(badge('はたらきばち', { fill: C.ink, size: 44 }), t, 0.4, 700, 170);
      a += tag(BX - 64 * BS, BY + 46 * BS, 430, 780, 'ろう（しろい かけら）', Math.min(prog(t, cue(0) + 3.4, 0.4), 1 - prog(t, cue(1) + 0.2, 0.3)), { col: HC.waxDk, size: 46 });
      a += g(badge('おなかの したから でる', { fill: HC.waxDk, size: 40 }), { x: 430, y: 700, o: win(t, cue(0) + 4.6, cue(1) + 0.2, 0.3) });
      // かけらが おなか → 口 → 壁 へ
      const m1 = eio(prog(t, cue(1) + 0.3, 1.8)), m2 = eio(prog(t, cue(1) + 4.2, 1.2));
      if (t > cue(1) + 0.2 && m2 < 1) {
        const p0 = [BX - 64 * BS, BY + 44 * BS], p1 = [BX + 20, BY + 300], p2 = [BX + 66 * BS, BY + 24 * BS], p3 = [NX - 80, NY - 20];
        let fx, fy;
        if (m2 <= 0) { const k = m1; fx = (1 - k) * (1 - k) * p0[0] + 2 * k * (1 - k) * p1[0] + k * k * p2[0]; fy = (1 - k) * (1 - k) * p0[1] + 2 * k * (1 - k) * p1[1] + k * k * p2[1]; }
        else { fx = lerp(p2[0], p3[0], m2); fy = lerp(p2[1], p3[1], m2) - Math.sin(m2 * Math.PI) * 60; }
        a += waxFlake(fx, fy + (ch > 0 ? Math.sin(t * 16) * 4 : 0), 1.5, m1 * 200);
      }
      a += g(badge('くちで かんで やわらかく', { fill: C.blueUi, size: 42 }), { x: 1020, y: 692, o: win(t, cue(1) + 2.0, cue(2) - 0.6, 0.3) });
      out += g(a, { o: aO });
    }
    // ろうは はちみつから
    const bO = prog(t, cue(2) - 0.2, 0.5);
    if (bO > 0) {
      let b = card(1400, 600);
      b += pop(honeyDrop(-460, -80, 1.5) + honeyDrop(-340, -30, 1.1) + honeyDrop(-540, -10, 1.0), t, cue(2) + 0.3, 0, 0);
      b += text(-440, 110, 'はちみつ', { size: 56, w: 900, fill: HC.honeyDk });
      const ak = prog(t, cue(2) + 1.4, 0.6);
      b += g(arrow2(-200, -40, 150, -40, C.ink, 16) + text(-30, -110, 'からだの なかで', { size: 40, w: 900, fill: C.muted }), { o: ak });
      b += g(beeAt(-30, 60, 0.9, t, 1, 0, { walk: 0.2 }), { o: ak });
      b += pop(waxFlake(380, -70, 2.4, -8) + waxFlake(480, -10, 1.7, 12) + waxFlake(330, 10, 1.5, 20), t, cue(2) + 2.4, 0, 0);
      b += g(text(410, 110, 'ろう', { size: 56, w: 900, fill: HC.waxDk }), { o: prog(t, cue(2) + 2.6, 0.4) });
      b += pop(badge('ろうが すくないほど、はちみつを つかわない', { fill: C.accent, size: 44 }), t, cue(3) + 1.0, 0, 228);
      out += g(b, { x: 960, y: 450, o: bO, s: lerp(0.95, 1, eo(bO)) });
    }
    return out;
  },
});

// すき間なく並ぶ形のパネル（n = 3, 4, 6）。まん中が 0,0
function tilePanel(n, id) {
  const W = 460, H = 330;
  let s = `<clipPath id="${id}"><rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="24"/></clipPath><rect x="${-W / 2 - 10}" y="${-H / 2 - 10}" width="${W + 20}" height="${H + 20}" rx="30" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#${id})">`;
  const cols = [HC.wax, HC.waxLt, HC.honeyLt];
  if (n === 4) { const a = 96; for (let r = -2; r <= 2; r++) for (let c = -3; c <= 3; c++) s += `<rect x="${c * a - a / 2}" y="${r * a - a / 2}" width="${a}" height="${a}" fill="${cols[(c + r + 8) % 2]}" stroke="${HC.waxDk}" stroke-width="5"/>`; }
  else if (n === 3) { const a = 124, h = a * SQ3 / 2; for (let r = -2; r <= 2; r++) for (let c = -6; c <= 6; c++) { const up = (c + r + 20) % 2 === 0, x = c * a / 2, y = r * h; s += `<path d="${up ? `M ${x} ${y - h / 2} L ${x + a / 2} ${y + h / 2} L ${x - a / 2} ${y + h / 2} Z` : `M ${x} ${y + h / 2} L ${x + a / 2} ${y - h / 2} L ${x - a / 2} ${y - h / 2} Z`}" fill="${cols[up ? 0 : 1]}" stroke="${HC.waxDk}" stroke-width="5" stroke-linejoin="round"/>`; } }
  else { const R = 62; for (let r = -2; r <= 2; r++) for (let c = -3; c <= 3; c++) s += `<path d="${hexD((c + (Math.abs(r) % 2) / 2) * SQ3 * R, r * 1.5 * R, R)}" fill="${cols[(c + r * 2 + 12) % 3]}" stroke="${HC.waxDk}" stroke-width="5" stroke-linejoin="round"/>`; }
  return s + '</g>';
}
// 五角形を3つ、ひとつの点に集めると すき間（赤）が できる。集まる点が 0,0
function pentaGap(a, gapO = 1) {
  const u = d => [Math.cos(d * Math.PI / 180), Math.sin(d * Math.PI / 180)];
  let s = `<path d="M 0 0 L ${u(-108)[0] * a} ${u(-108)[1] * a} L ${u(-72)[0] * a} ${u(-72)[1] * a} Z" fill="${HC.gap}" opacity="${gapO}"/>`;
  [-72, 36, 144].forEach((th, i) => {
    let p = [0, 0], pts = [[0, 0]];
    for (let k = 0; k < 4; k++) { const d = u(th + 72 * k); p = [p[0] + d[0] * a, p[1] + d[1] * a]; pts.push(p); }
    s += `<path d="${polyD(pts)}" fill="${[HC.wax, HC.waxLt, HC.honeyLt][i]}" stroke="${HC.waxDk}" stroke-width="6" stroke-linejoin="round"/>`;
  });
  return s;
}

// 5. 丸はすき間ができる。すき間なく並ぶのは 三角・四角・六角 の3つだけ。五角形はすき間
SCENES.push({
  id: 'tile',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A 丸い部屋を並べる
    const aO = 1 - prog(t, cue(1) - 0.6, 0.4);
    if (aO > 0) {
      const R = 92, X0 = 500, Y0 = 290, C7 = [], gk = prog(t, cue(0) + 4.2, 0.5);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) C7.push([X0 + (c + (r % 2) / 2) * 2 * R, Y0 + r * SQ3 * R, r, c]);
      let a = '';
      // すき間（となりあう3つの丸のあいだ）
      if (gk > 0) for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
        const A = [X0 + (c + (r % 2) / 2) * 2 * R, Y0 + r * SQ3 * R], Bn = [A[0] + 2 * R, A[1]], Dn = [A[0] - R, A[1] + SQ3 * R], En = [A[0] + R, A[1] + SQ3 * R];
        const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], tri = (p, q, w) => `<path d="${polyD([mid(p, q), mid(q, w), mid(p, w)])}" fill="${HC.gap}" opacity="${gk * (0.75 + 0.25 * Math.sin(t * 6))}"/>`;
        if (c < 5) a += tri(A, Bn, En);
        if (r % 2 ? c < 5 : c > 0) a += tri(A, Dn, En);
      }
      C7.forEach(([x, y, r, c], i) => { a += pop(`<circle r="${R - 3}" fill="${HC.wax}" stroke="${HC.waxDk}" stroke-width="7"/><circle r="${R * 0.62}" fill="${HC.hollow}" opacity="0.85"/>`, t, cue(0) + 0.3 + i * 0.13, x, y, { d: 0.4 }); });
      a += tag(X0 + 3 * R, Y0 + SQ3 * R / 3, 1620, 200, 'すきま', gk, { col: HC.gapDk, size: 56 });
      a += g(text(0, 0, 'まるい へやを ならべると…', { size: 48, w: 900, fill: C.muted }), { x: 960, y: 800, o: prog(t, cue(0) + 0.6, 0.4) });
      out += g(a, { o: aO });
    }
    // B すき間なく並ぶ形は3つだけ
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      const up = eio(prog(t, cue(2) - 0.5, 0.7)), names = ['さんかく', 'しかく', 'ろっかく'], st = [cue(1) + 2.6, cue(1) + 4.2, cue(1) + 5.6];
      let b = '';
      [3, 4, 6].forEach((n, i) => {
        const x = lerp(340 + i * 620, 400 + i * 560, up), y = lerp(440, 300, up), s = lerp(1, 0.62, up);
        b += pop(g(tilePanel(n, 'tp' + n) + okMark(190, -130, 1.1) + text(0, 226, names[i], { size: 54, w: 900, fill: HC.waxDk }), { s }), t, st[i] - 1.6 + i * 0.1, x, y);
      });
      b += g(pop(badge('すきまなく ならぶ かたちは 3つだけ', { fill: C.accent, size: 46 }), t, cue(1) + 6.6, 960, 790), { o: 1 - up });
      // 五角形は すき間
      const pk = prog(t, cue(2) - 0.1, 0.5);
      if (pk > 0) {
        let p = `<rect x="-250" y="-160" width="500" height="320" rx="30" fill="#fff" filter="url(#shadow)"/>` + g(pentaGap(92, prog(t, cue(2) + 0.9, 0.4)), { y: 10 });
        p += ngMark(200, -110, 1.1) + text(-150, 110, 'ごかく', { size: 50, w: 900, fill: HC.gapDk });
        b += g(p, { x: 960, y: 700, o: pk, s: lerp(0.9, 1, eo(pk)) });
        b += tag(960, 646, 640, 640, 'すきま', prog(t, cue(2) + 1.2, 0.4), { col: HC.gapDk, size: 50 });
      }
      out += g(b, { o: bO });
    }
    out += kidShow('K', t, 1650, 846, { s: 0.56, start: cue(2) + 1.4, n: 0 });
    return out;
  },
});

// 6. 広さをそろえて、壁（まわり）の長さくらべ：三角 約4.56／四角 4／六角 約3.72
SCENES.push({
  id: 'wall',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const U = 190, SH = [[3, U * 1.5197, 4.56, 'やく 4.56'], [4, U, 4, '4'], [6, U * 0.6204, 3.72, 'やく 3.72']];
    const shapeD = (n, a, cx, cy, s = 1) => n === 3 ? polyD(polyPts(cx, cy + a * s * SQ3 / 12, a * s / SQ3, 3, -90)) : n === 4 ? polyD(polyPts(cx, cy, a * s / Math.SQRT2, 4, -45)) : hexD(cx, cy, a * s);
    const hO = 1 - prog(t, cue(3) - 0.4, 0.4);
    // 上：同じ広さの3つの部屋
    if (hO > 0) {
      let a = '';
      SH.forEach(([n, sd], i) => {
        const x = 560 + i * 400, lit = t > cue(1) + [0.2, 2.6, 4.2][i];
        a += pop(`<path d="${shapeD(n, sd, 0, 0)}" fill="${HC.honeyLt}" stroke="${lit ? [C.blueUi, C.accent, C.redUi][i] : HC.waxDk}" stroke-width="${lit ? 14 : 9}" stroke-linejoin="round"/>`, t, cue(0) + 0.3 + i * 0.35, x, 300);
      });
      a += pop(badge('ひろさは おなじ', { fill: C.ochre, size: 44 }), t, cue(0) + 1.8, 960, 500);
      out += g(a, { o: hO });
    }
    // 下：壁の長さ（まわりの長さ）
    const bO = prog(t, cue(1) - 0.3, 0.4);
    if (bO > 0) {
      let b = text(330, 575, 'かべの ながさ', { size: 40, w: 900, fill: C.muted, anchor: 'start' });
      const best = prog(t, cue(2) + 0.2, 0.5);
      SH.forEach(([n, sd, per, lab], i) => {
        const y = 640 + i * 82, k = eo(prog(t, cue(1) + [0.2, 2.6, 4.2][i], 1.3)), L = per * 190, col = [C.blueUi, C.accent, C.redUi][i];
        b += `<path d="${shapeD(n, sd, 370, y, 0.3)}" fill="${HC.honeyLt}" stroke="${col}" stroke-width="6" stroke-linejoin="round"/>`;
        b += `<rect x="440" y="${y - 22}" width="${L * k}" height="44" rx="12" fill="${col}" opacity="${i < 2 ? 1 - best * 0.45 : 1}"/>`;
        b += g(text(440 + L + 24, y + 2, lab, { size: 48, w: 900, fill: col, anchor: 'start' }), { o: prog(t, cue(1) + [0.2, 2.6, 4.2][i] + 1.0, 0.3) });
      });
      if (best > 0) {
        const L = 3.72 * 190, y = 640 + 2 * 82;
        b += `<rect x="432" y="${y - 30}" width="${L + 16}" height="60" rx="18" fill="none" stroke="${C.red}" stroke-width="7" opacity="${best}"/>`;
        b += pop(badge('いちばん みじかい！', { fill: C.red, size: 42 }), t, cue(2) + 0.6, 1664, y);
        b += pop(waxFlake(-150, 0, 1.3, -8) + honeyDrop(150, -6, 0.9) + text(0, 4, '・', { size: 50, w: 900, fill: C.muted }), t, cue(2) + 1.8, 1560, 486) + g(text(1560, 566, 'ろうも はちみつも すくなくて すむ', { size: 34, w: 900, fill: C.accent }), { o: prog(t, cue(2) + 2.0, 0.4) });
      }
      out += g(b, { o: bO });
    }
    // むかしから言われていて、証明は1999年
    const tO = prog(t, cue(3) - 0.1, 0.5);
    if (tO > 0) {
      let c = `<line x1="-640" y1="0" x2="640" y2="0" stroke="${C.ochre}" stroke-width="10" stroke-linecap="round"/>` + arrow2(600, 0, 690, 0, C.ochre, 10);
      c += pop(`<circle r="26" fill="${C.ochre}"/>` + text(0, -84, '2000ねん いじょう まえ', { size: 50, w: 900, fill: C.ochre }) + text(0, 76, '「ろっかくが いちばん」と いわれて いた', { size: 36, w: 900, fill: C.ink }), t, cue(3) + 0.3, -330, 0);
      c += pop(`<circle r="26" fill="${C.redUi}"/>` + text(0, -84, '1999ねん', { size: 56, w: 900, fill: C.redUi }) + text(0, 76, 'すうがくで しょうめい', { size: 40, w: 900, fill: C.ink }), t, cue(3) + 3.4, 440, 0);
      c += pop(`<path d="${hexD(0, 0, 54)}" fill="${HC.honeyLt}" stroke="${HC.waxDk}" stroke-width="8" stroke-linejoin="round"/>`, t, cue(3) + 0.8, 60, -150);
      out += g(c, { x: 960, y: 320, o: tO });
    }
    return out;
  },
});

// 7. ハチはどうやって六角形にしている？ 作りたては丸 → 六角形。2つの考え。まだ研究中。となりが5つなら五角形
const MC7 = [[-1, -1], [0, -1], [1, -1], [-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0], [-1, 1], [0, 1], [1, 1]];
SCENES.push({
  id: 'how',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A どうやって？
    const aO = win(t, cue(0) - 0.2, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      let a = beeAt(620, 470 + Math.sin(t * 2) * 8, 2.6, t, 1, 0, { walk: 0.2 }) + pop(cell(0, 0, 150, 'empty'), t, cue(0) + 0.8, 1280, 450);
      a += pop(text(0, 0, '？', { size: 220, w: 900, fill: C.ochre }), t, cue(0) + 1.6, 960, 330);
      a += g(text(0, 0, 'どうやって ろっかくに する？', { size: 56, w: 900, fill: C.ink }), { x: 960, y: 780, o: prog(t, cue(0) + 0.6, 0.4) });
      out += g(a, { o: aO });
    }
    // B 作りたては丸 → 少し古い部屋は六角形
    const bO = win(t, cue(1) - 0.2, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      const R = 104, k = eio(prog(t, cue(1) + 3.6, 2.6));
      let b = '';
      MC7.forEach(([u, v]) => { const x = 960 + u * SQ3 * R, y = 440 + v * 1.5 * R; b += `<path d="${morphD(x, y, R, 6, k)}" fill="${HC.wax}" stroke="${HC.waxDk}" stroke-width="6"/><path d="${morphD(x, y, R * 0.8, 6, k)}" fill="${HC.hollow}"/>`; });
      b += g(badge('つくりたて：まる', { fill: C.blueUi, size: 50, pad: 40 }), { x: 960, y: 790, o: 1 - prog(t, cue(1) + 3.8, 0.5) });
      b += g(badge('すこし ふるい：ろっかく', { fill: C.redUi, size: 50, pad: 40 }), { x: 960, y: 790, o: prog(t, cue(1) + 4.8, 0.5) });
      b += pop(badge('2013ねんの けんきゅう', { fill: C.ochre, size: 40 }), t, cue(1) + 0.3, 960, 150);
      out += g(b, { o: bO });
    }
    // C 2つの考え。まだ研究中
    const cO = win(t, cue(2) - 0.2, cue(4) - 0.3, 0.4);
    if (cO > 0) {
      let c = '';
      // 考え1：あたためられて、ひっぱられる
      let c1 = card(760, 520) + text(0, -200, 'かんがえ 1', { size: 40, w: 900, fill: C.redUi });
      const hk = 0.5 + 0.5 * Math.sin(t * 3), mk = 0.5 + 0.5 * Math.sin(t * 1.3 - 1.5);
      [[-78, -45], [78, -45], [0, 90]].forEach(([x, y]) => { c1 += `<path d="${morphD(x, y - 10, 90, 6, mk, -30)}" fill="${HC.wax}" stroke="${HC.waxDk}" stroke-width="6"/><path d="${morphD(x, y - 10, 70, 6, mk, -30)}" fill="${HC.hollow}"/>`; });
      c1 += `<circle cx="0" cy="-10" r="${50 + hk * 16}" fill="#ff7a3c" opacity="${0.28 + 0.2 * hk}" filter="url(#soft)"/>`;
      [90, 210, 330].forEach(d => { const q = d * Math.PI / 180; c1 += arrow2(Math.cos(q) * 62, -10 + Math.sin(q) * 62, Math.cos(q) * 22, -10 + Math.sin(q) * 22, C.red, 8); });
      c1 += text(0, 196, 'ろうが あたためられて', { size: 40, w: 900 }) + text(0, 240, 'ひっぱられる', { size: 40, w: 900 });
      c += pop(c1, t, cue(2) + 0.4, 500, 440);
      // 考え2：部屋の並べ方で決まる
      let c2 = card(760, 520) + text(0, -200, 'かんがえ 2', { size: 40, w: 900, fill: C.blueUi });
      const row = (y, off, n, st) => { let s = ''; for (let i = 0; i < n; i++) s += pop(`<circle r="54" fill="${HC.wax}" stroke="${HC.waxDk}" stroke-width="6"/><circle r="38" fill="${HC.hollow}"/>`, t, st + i * 0.2, (i - (n - 1) / 2) * 112 + off, y, { d: 0.35 }); return s; };
      c2 += row(-104, 0, 4, cue(2) + 5.4) + row(-7, 0, 3, cue(2) + 6.2) + row(90, 0, 2, cue(2) + 6.9);
      c2 += text(0, 196, 'へやの ならべかたで', { size: 40, w: 900 }) + text(0, 240, 'きまる', { size: 40, w: 900 });
      c += pop(c2, t, cue(2) + 5.0, 1420, 440);
      c += pop(badge('まだ けんきゅうちゅう', { fill: C.ochre, size: 56, pad: 46 }) + text(0, -150, '？', { size: 150, w: 900, fill: C.ochre }), t, cue(3) + 0.3, 960, 790);
      out += g(c, { o: cO });
    }
    // D となりが6つ → 六角形、5つ → 五角形
    const dO = prog(t, cue(4) - 0.1, 0.5);
    if (dO > 0) {
      const R = 78, LX = 470, RX = 1450, CY = 420;
      let d = `<path d="${hexD(LX, CY, R)}" fill="${HC.honey}" stroke="${HC.waxDk}" stroke-width="7" stroke-linejoin="round"/>`;
      for (let k2 = 0; k2 < 6; k2++) { const q = (-60 + 60 * k2) * Math.PI / 180, x = LX + Math.cos(q) * SQ3 * R, y = CY + Math.sin(q) * SQ3 * R; d += `<path d="${hexD(x, y, R)}" fill="${HC.waxLt}" stroke="${HC.waxDk}" stroke-width="7" stroke-linejoin="round"/>` + pop(numDot(0, 0, k2 + 1, C.blueUi, 28), t, cue(4) + 0.6 + k2 * 0.22, x, y); }
      d += g(badge('となりが 6つ → ろっかく', { fill: C.blueUi, size: 42 }), { x: LX, y: 770, o: prog(t, cue(4) + 2.0, 0.4) });
      const pr = R * 0.92;
      d += `<path d="${polyD(polyPts(RX, CY, pr, 5, -90))}" fill="${HC.pollen2}" stroke="${HC.waxDk}" stroke-width="7" stroke-linejoin="round"/>`;
      for (let k2 = 0; k2 < 5; k2++) { const q = (-54 + 72 * k2) * Math.PI / 180, dd = pr * Math.cos(Math.PI / 5) + R * 0.84, x = RX + Math.cos(q) * dd, y = CY + Math.sin(q) * dd; d += `<circle cx="${x}" cy="${y}" r="${R * 0.84}" fill="${HC.waxLt}" stroke="${HC.waxDk}" stroke-width="7"/>` + pop(numDot(0, 0, k2 + 1, C.redUi, 28), t, cue(4) + 2.8 + k2 * 0.22, x, y); }
      d += g(badge('となりが 5つ → ごかく', { fill: C.redUi, size: 42 }), { x: RX, y: 770, o: prog(t, cue(4) + 4.0, 0.4) });
      out += g(d, { o: dO });
    }
    const by = 842, bs = 0.5;
    out += kidShow('B', t, 960, by, { s: bs, start: cue(4) + 1.0, n: 0, bubble: false });
    out += talkBubble('B', 960, 520, 960, by - (KID_HEAD.B[0] + 16) * bs, 42);
    return out;
  },
});

// アシナガバチの巣（下から。紙のような巣に 六角形の穴）
function waspNest(x, y, s = 1) {
  let n = `<path d="M 0 -150 L 0 -96" stroke="${HC.paperDk}" stroke-width="12" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="150" ry="112" fill="${HC.paperNest}" stroke="${HC.paperDk}" stroke-width="6"/>`;
  [[-1, -1], [0, -1], [1, -1], [-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0], [-1, 1], [0, 1], [1, 1]].forEach(([u, v]) => { n += `<path d="${hexD(u * SQ3 * 30, v * 45, 28)}" fill="#6a5f52" stroke="#e4ddd2" stroke-width="5" stroke-linejoin="round"/>`; });
  return `<g transform="translate(${x} ${y}) scale(${s})">${n}</g>`;
}

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -560, as = 'すきまなく ならんで、かべが すくなくて すむから';
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.accent}"/>` + text(NX, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, as, { size: fit(as, 1060, 50, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['すきまなく ならぶ', C.blueUi], ['かべが いちばん みじかい', C.redUi], ['ろうが すくなくて すむ', HC.waxDk]], t, 960, 580, { start: 2.4, step: 1.1, size: 40, gap: 30 });
      a += pop(comb(-200, 0, 56, 5, 1, c => ['honey', 'empty', 'honey', 'cap', 'honey'][c]), t, 1.8, 960, 740);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [g(eyeIcon(0.3)), 'ずかんや しゃしんで、はちの すを くらべる', C.ink, cue(1)],
        [g(eyeIcon(0.3)), 'となりの へやは いくつ？ かぞえる', C.ink, cue(2)],
        [g(eyeIcon(0.3)), 'はしっこに、ろっかくで ない へやは ある？', C.ink, cue(3)],
        [warnIcon(0.5), 'ほんものの すには、ぜったい ちかづかない', C.red, cue(4)],
        [warnIcon(0.5), 'つつかない。いしを なげない', C.red, cue(4) + 4.0],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 940, 44, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 320 + i * 104); });
      // 絵：図鑑（ミツバチの巣と アシナガバチの巣）→ となりを数える → 近づかない
      const PX = 1560, PYc = 490;
      let p = card(580, 620, { fill: '#fff' });
      const ph1 = 1 - prog(t, cue(2) - 0.3, 0.4);
      if (ph1 > 0) {
        let q = `<rect x="-260" y="-280" width="520" height="560" rx="16" fill="#f3ecdc" stroke="${C.line}" stroke-width="5"/><line x1="-260" y1="0" x2="260" y2="0" stroke="${C.line}" stroke-width="5"/>`;
        q += comb(-170, -212, 44, 5, 2, (c, r) => (c + r) % 3 === 0 ? 'honey' : 'empty') + text(0, -54, 'みつばちの す', { size: 36, w: 900, fill: HC.waxDk });
        q += waspNest(0, 122, 0.8) + text(0, 250, 'あしながばちの す', { size: 36, w: 900, fill: HC.paperDk });
        q += g(badge('ずかん', { fill: C.blueUi, size: 34 }), { x: -190, y: -300 });
        p += g(q, { o: ph1 });
      }
      const ph2 = win(t, cue(2) - 0.1, cue(4) - 0.3, 0.4);
      if (ph2 > 0) {
        const R = 70;
        let q = `<path d="${hexD(0, -20, R)}" fill="${HC.honey}" stroke="${HC.waxDk}" stroke-width="7" stroke-linejoin="round"/>`;
        for (let k = 0; k < 6; k++) { const a = (-60 + 60 * k) * Math.PI / 180, x = Math.cos(a) * SQ3 * R, y = -20 + Math.sin(a) * SQ3 * R; q += `<path d="${hexD(x, y, R)}" fill="${HC.waxLt}" stroke="${HC.waxDk}" stroke-width="7" stroke-linejoin="round"/>` + pop(numDot(0, 0, k + 1, C.blueUi, 26), t, cue(2) + 1.4 + k * 0.5, x, y); }
        q += text(0, 256, 'となりは いくつ？', { size: 40, w: 900, fill: C.blueUi });
        p += g(q, { o: ph2 });
      }
      const ph3 = prog(t, cue(4) - 0.1, 0.4);
      if (ph3 > 0) {
        let q = waspNest(0, -10, 1.15) + beeAt(-176, -150 + Math.sin(t * 3) * 10, 0.6, t, 1, 10, { fly: 1 }) + beeAt(180, 60 + Math.cos(t * 3) * 10, 0.6, t + 1, -1, -8, { fly: 1 });
        q += `<circle r="230" cy="-10" fill="none" stroke="${C.red}" stroke-width="24"/><line x1="-162" y1="-172" x2="162" y2="152" stroke="${C.red}" stroke-width="24" stroke-linecap="round"/>`;
        q += text(0, 270, 'ちかづかない', { size: 44, w: 900, fill: C.red });
        p += g(q, { o: ph3 });
      }
      b += pop(p, t, cue(1) + 0.4, PX, PYc);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「はち」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

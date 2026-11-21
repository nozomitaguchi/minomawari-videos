// みのまわり図鑑 動画「エスカレーターの階段は、消えたあとどこへ行く？」（エスカレーター）
// 出どころ：everyday-trivia trivia/escalator-basics.md・escalator-comb-cleat.md

// ---------- 道具 ----------
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
const STEP = '#a3a8ad', STEP_D = '#7d8288', YL = '#f2c230', WALL = '#f3e8d6', FLOOR = '#d9c7a8', METAL = '#8d9196';

// ---------- エスカレーター（横から） ----------
// 段の前のはしがたどる輪：乗り口の床下 → 乗り口 → 坂 → 降り口 → 上の折り返し → 裏がわ → 下の折り返し
const EP = { A: [200, 620], B: [560, 620], C: [1235, 230], D: [1560, 230], R: 65, OFF: 130, LO: 380, HI: 1400 };
const ESEG = (() => {
  const { A, B, C, D, R, OFF } = EP;
  const L = (p, q) => ({ k: 'L', p, q, len: Math.hypot(q[0] - p[0], q[1] - p[1]) });
  const Arc = (c, a0, a1) => ({ k: 'A', c, a0, a1, len: Math.abs(a1 - a0) * R });
  return [L(A, B), L(B, C), L(C, D), Arc([D[0], D[1] + R], -Math.PI / 2, Math.PI / 2),
    L([D[0], D[1] + OFF], [C[0], C[1] + OFF]), L([C[0], C[1] + OFF], [B[0], B[1] + OFF]), L([B[0], B[1] + OFF], [A[0], A[1] + OFF]), Arc([A[0], A[1] + R], Math.PI / 2, Math.PI * 1.5)];
})();
const ELEN = ESEG.reduce((a, s) => a + s.len, 0);
const NSTEP = 42, SS = ELEN / NSTEP;
function escPos(d) {
  d = ((d % ELEN) + ELEN) % ELEN;
  for (let i = 0; i < ESEG.length; i++) {
    const s = ESEG[i];
    if (d <= s.len || i === ESEG.length - 1) {
      const u = clamp(d / s.len);
      if (s.k === 'L') return { x: lerp(s.p[0], s.q[0], u), y: lerp(s.p[1], s.q[1], u), a: Math.atan2(s.q[1] - s.p[1], s.q[0] - s.p[0]), seg: i };
      const th = lerp(s.a0, s.a1, u);
      return { x: s.c[0] + Math.cos(th) * EP.R, y: s.c[1] + Math.sin(th) * EP.R, a: th + Math.PI / 2, seg: i };
    }
    d -= s.len;
  }
}
// 輪のパス（SVG）
const escLoopD = (() => {
  const { A, B, C, D, R, OFF } = EP;
  return `M ${A[0]} ${A[1]} L ${B[0]} ${B[1]} L ${C[0]} ${C[1]} L ${D[0]} ${D[1]} A ${R} ${R} 0 0 1 ${D[0]} ${D[1] + OFF} L ${C[0]} ${C[1] + OFF} L ${B[0]} ${B[1] + OFF} L ${A[0]} ${A[1] + OFF} A ${R} ${R} 0 0 1 ${A[0]} ${A[1]} Z`;
})();
// 段をひとつ描く（d は段の前のはしの位置）。hl: 色をかえる
function escStep(d, { hl = null, o = 1 } = {}) {
  const f = escPos(d), r = escPos(d - SS + 4);
  const T = 26;
  if (f.seg <= 2 && r.seg <= 2) {
    // 上の段（階段の形）
    const col = hl || STEP;
    return `<g opacity="${o}"><path d="M ${r.x} ${f.y} L ${f.x} ${f.y} L ${f.x} ${f.y + T} L ${r.x} ${r.y + T} L ${r.x} ${r.y} Z" fill="${col}" stroke="${mix(col, '#000000', 0.25)}" stroke-width="2"/>` +
      `<line x1="${r.x + 3}" y1="${f.y + 2}" x2="${f.x - 3}" y2="${f.y + 2}" stroke="${YL}" stroke-width="5"/></g>`;
  }
  // 折り返しと裏がわ（ひっくり返った板）
  const m = escPos(d - SS / 2), col = hl || STEP_D;
  return `<g opacity="${o}" transform="translate(${m.x} ${m.y}) rotate(${m.a * 180 / Math.PI})"><rect x="${-SS / 2 + 2}" y="0" width="${SS - 4}" height="${T}" rx="4" fill="${col}" stroke="${mix(col, '#000000', 0.25)}" stroke-width="2"/><line x1="${-SS / 2 + 6}" y1="${T - 3}" x2="${SS / 2 - 6}" y2="${T - 3}" stroke="${YL}" stroke-width="4" opacity="0.8"/></g>`;
}
function gear(cx, cy, r, ang, col = '#6d7277') {
  let s = `<g transform="translate(${cx} ${cy}) rotate(${ang * 180 / Math.PI})">`;
  for (let i = 0; i < 12; i++) s += `<rect x="${-8}" y="${-r - 10}" width="16" height="20" rx="3" fill="${col}" transform="rotate(${i * 30})"/>`;
  s += `<circle r="${r}" fill="${col}"/><circle r="${r * 0.45}" fill="${mix(col, '#ffffff', 0.35)}"/><circle r="${r * 0.15}" fill="${col}"/></g>`;
  return s;
}
// エスカレーター全体。xray: 0（ふつう）〜1（中が見える）。base: 段の位置のずれ（px）
function escalator(t, { xray = 0, base = null, speed = 40, hlIdx = -1, hlCol = '#ff9a2e', dim = 1, chain = 0, glass = 1, people = '' } = {}) {
  const off = base !== null ? base : t * speed;
  const { A, B, C, D, R, OFF, LO, HI } = EP;
  let s = '';
  // 背景：上の階と下の階
  s += `<rect width="1920" height="1080" fill="${WALL}"/>`;
  s += `<rect x="0" y="620" width="1920" height="460" fill="${mix(WALL, FLOOR, 0.5)}"/>`;
  // 下の階のかべの柱とお店のまど
  s += `<rect x="1680" y="330" width="240" height="290" fill="#efe1c9"/><rect x="1720" y="380" width="160" height="120" rx="10" fill="#cfe3ee"/>`;
  // 中（機械）— xray のときだけ見える
  if (xray > 0) {
    s += g(`<path d="M 120 640 L 380 640 L 380 625 L 560 625 L 1235 235 L 1400 235 L 1400 300 L 1660 300 L 1660 440 L 1270 440 L 600 830 L 120 830 Z" fill="#5f6a74" opacity="0.2"/>`, { o: xray });
    if (chain > 0) s += g(`<path d="${escLoopD}" fill="none" stroke="#c98a3a" stroke-width="9" stroke-dasharray="16 10" stroke-dashoffset="${-off}" transform="translate(0 14)"/>`, { o: chain * xray });
    s += g(gear(D[0], D[1] + R, 50, off / R) + gear(A[0], A[1] + R, 50, off / R), { o: xray });
    let st = '';
    for (let i = 0; i < NSTEP; i++) { const d = i * SS + off, p = escPos(d); if (p.seg >= 3) st += escStep(d, { hl: i === hlIdx ? hlCol : null, o: i === hlIdx ? 1 : dim }); }
    s += g(st, { o: xray });
  }
  // 上の段（見えるところ）
  let up = '';
  for (let i = 0; i < NSTEP; i++) { const d = i * SS + off, p = escPos(d); if (p.seg <= 2) up += escStep(d, { hl: i === hlIdx ? hlCol : null, o: i === hlIdx ? 1 : dim }); }
  s += `<clipPath id="escUp"><rect x="${LO}" y="0" width="${HI - LO}" height="1080"/></clipPath><g clip-path="url(#escUp)">${up}</g>`;
  // 横の板（トラス）。ふつうのときは裏がわをかくす
  const side = `<path d="M ${LO} 652 L ${B[0]} 652 L ${C[0]} 262 L 1660 262 L 1660 440 L 1270 440 L 600 830 L ${LO} 830 Z" fill="#c9ced3"/><path d="M ${LO} 652 L ${B[0]} 652 L ${C[0]} 262 L 1660 262" fill="none" stroke="#aab0b6" stroke-width="6"/>`;
  s += g(side, { o: 1 - xray * 0.9 });
  // 床（下の階の床は乗り口の手前まで、上の階の床は降り口の先から）
  s += `<rect x="0" y="612" width="${LO + 8}" height="${xray > 0 ? 24 : 470}" fill="${FLOOR}" opacity="${1 - xray * 0.0}"/>`;
  if (xray < 1) s += g(`<rect x="0" y="636" width="${LO + 8}" height="444" fill="${FLOOR}"/>`, { o: 1 - xray });
  s += `<rect x="${HI - 8}" y="222" width="${1928 - HI}" height="26" fill="${FLOOR}"/>`;
  if (xray < 1) s += g(`<rect x="${HI - 8}" y="248" width="${1660 - HI + 8}" height="60" fill="${mix(FLOOR, '#000000', 0.1)}"/><rect x="1660" y="248" width="260" height="82" fill="${mix(FLOOR, '#000000', 0.1)}"/>`, { o: 1 - xray });
  else s += `<rect x="1660" y="248" width="260" height="82" fill="${mix(FLOOR, '#000000', 0.1)}"/>`;
  // くし（床のはし）
  const comb = (x, y, dir) => `<path d="M ${x} ${y} L ${x + dir * 22} ${y + 6} L ${x} ${y + 12}" fill="${METAL}"/>`;
  s += comb(LO + 8, 612, 1) + comb(HI - 8, 222, -1);
  // 手すりとガラス
  if (glass > 0) {
    const hr = `M ${LO - 60} 470 L ${B[0]} 470 L ${C[0]} 80 L ${HI + 60} 80`;
    s += g(`<path d="M ${LO - 40} 600 L ${LO - 40} 480 L ${B[0]} 480 L ${C[0]} 90 L ${HI + 40} 90 L ${HI + 40} 210 L ${C[0]} 210 L ${B[0]} 600 Z" fill="#cfe7f3" opacity="0.35"/>` +
      `<path d="${hr}" fill="none" stroke="#2c2f33" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`, { o: glass });
  }
  s += people;
  return s;
}

// 1. つかみ：降り口で段が消える
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = escalator(t, { speed: 40 });
    // 消えるところに目じるし
    const k = win(t, cue(1) + 0.8, cueE(3) + 0.5, 0.4);
    out += g(`<circle r="90" fill="none" stroke="${C.red}" stroke-width="9" stroke-dasharray="18 12"/>`, { x: EP.HI - 20, y: 222, o: k, s: lerp(0.9, 1, 0.5 + 0.5 * Math.sin(t * 4)) });
    out += pop(badge('きえた？', { fill: C.red, size: 44 }), t, cue(1) + 1.4, EP.HI + 130, 120, { end: cueE(3) + 0.5 });
    // 出てくるところ
    out += g(`<circle r="80" fill="none" stroke="${C.blueUi}" stroke-width="8" stroke-dasharray="16 12"/>`, { x: EP.LO + 30, y: 616, o: win(t, cue(0) + 1.2, cue(1), 0.4) });
    out += pop(badge('でてくる', { fill: C.blueUi, size: 40 }), t, cue(0) + 1.6, EP.LO + 30, 480, { end: cue(1) });
    out += kidShow('S', t, 130, 612, { s: 0.5, start: 0.3, n: 0, look: [6, -9], side: 'right' });
    out += kidShow('B', t, 270, 612, { s: 0.5, start: 0.6, n: 1, look: [6, -9], bubble: false });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1700, y: 160, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">エスカレーター</tspan>の かいだんは</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.redUi}">きえた</tspan> あと どこへ？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      let ic = `<rect x="-300" y="-90" width="600" height="180" rx="24" fill="${WALL}"/>`;
      for (let i = 0; i < 6; i++) { const x = -210 + i * 70, y = 60 - i * 40; ic += `<rect x="${x}" y="${y}" width="70" height="${30 + i * 0}" fill="${STEP}"/><line x1="${x}" y1="${y + 2}" x2="${x + 70}" y2="${y + 2}" stroke="${YL}" stroke-width="5"/>`; }
      ic += `<path d="M -260 66 L -210 66 L 200 -170" fill="none" stroke="#2c2f33" stroke-width="0"/>` + text(240, -40, '？', { size: 90, w: 900, fill: C.ochre });
      out += pop(ic, t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'きえた かいだんは どこへ いく？', { size: 74, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'ゆかの したで たたまれて しまわれる'], ['②', 'ゆかの したで とけて あたらしく なる'], ['③', 'ゆかの したを とおって のりくちへ もどる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-620" y="-76" width="1240" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1220, 132) +
        `<circle cx="-520" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-520, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-450, 2, s, { size: 48, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    let ic = `<circle r="130" fill="${WALL}"/>`;
    for (let i = 0; i < 5; i++) { const x = -110 + i * 46, y = 50 - i * 27; ic += `<rect x="${x}" y="${y}" width="46" height="22" fill="${STEP}"/><line x1="${x}" y1="${y + 2}" x2="${x + 46}" y2="${y + 2}" stroke="${YL}" stroke-width="4"/>`; }
    ic += `<rect x="70" y="-86" width="60" height="14" fill="${FLOOR}"/>` + text(80, -120, '？', { size: 90, w: 900, fill: C.ochre });
    out += pop(ic, t, cue(0) + 0.6, 1720, 330);
    out += kidShow('B', t, 1720, 840, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 段はチェーンでつながった大きな輪
SCENES.push({
  id: 'loop',
  draw(t) {
    const xr = eio(prog(t, cue(0) - 0.3, 1.2));
    let out = escalator(t, { xray: xr, speed: 40, chain: prog(t, cue(0) + 1.0, 0.6) });
    out += topBadge();
    out += callout(900, 630, 760, 960 - 160, 'チェーン', prog(t, cue(0) + 1.6, 0.3) * (1 - prog(t, cue(2) - 0.3, 0.3)), { col: '#a8702c', size: 44 });
    // 輪をなぞる光
    const lk = prog(t, cue(1) + 0.2, 2.4);
    if (lk > 0) out += `<path d="${escLoopD}" fill="none" stroke="${C.ochre}" stroke-width="16" stroke-linejoin="round" opacity="${0.55 * (1 - prog(t, cue(2) + 1.0, 0.5))}" pathLength="1" stroke-dasharray="${lk} 1" transform="translate(0 14)"/>`;
    out += pop(badge('おおきな わっか', { fill: C.ochre, size: 46 }), t, cue(1) + 1.6, 900, 900 - 360, { end: cue(2) + 0.6 });
    // モーターと歯車
    const mk = prog(t, cue(2) + 0.6, 0.5);
    if (mk > 0) {
      let m = `<rect x="1690" y="250" width="150" height="100" rx="14" fill="#5a7a96"/>` + text(1765, 302, 'M', { size: 54, w: 900, fill: '#fff' });
      m += `<line x1="1690" y1="290" x2="${EP.D[0]}" y2="${EP.D[1] + EP.R - 50}" stroke="#555" stroke-width="7" stroke-dasharray="10 6" stroke-dashoffset="${-t * 40}"/><line x1="1690" y1="330" x2="${EP.D[0]}" y2="${EP.D[1] + EP.R + 50}" stroke="#555" stroke-width="7" stroke-dasharray="10 6" stroke-dashoffset="${t * 40}"/>`;
      out += g(m, { o: mk });
      out += callout(1765, 350, 1600, 520, 'モーター', prog(t, cue(2) + 1.0, 0.3) * (1 - prog(t, cue(3) - 0.6, 0.3)), { col: '#3f6380', size: 42 });
      out += callout(EP.D[0] - 30, EP.D[1] + EP.R + 20, 1180, 560, 'はぐるま', prog(t, cue(2) + 2.0, 0.3) * (1 - prog(t, cue(3) - 0.6, 0.3)), { col: '#555b60', size: 42 });
    }
    out += kidShow('B', t, 1800, 850, { s: 0.5, start: cue(3) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 4. 上で向きを変え、裏がわを通って下へ
SCENES.push({
  id: 'return',
  draw(t) {
    // ある段（オレンジ）が、降り口のくしの下 → 上の折り返し → 裏がわ → 下の折り返し → 乗り口 と進む
    const t0 = cue(0) + 0.4, t1 = cueE(2) + 0.6;
    const dStart = ESEG[0].len + ESEG[1].len + (EP.HI - EP.C[0]) - 10, dEnd = ELEN + (EP.LO - EP.A[0]) + SS;
    const v = (dEnd - dStart) / (t1 - t0);
    const base = dStart + v * (t - t0);  // 0番目の段の前のはし
    let out = escalator(t, { xray: 1, base, hlIdx: 0, dim: 0.55, chain: 0.6 });
    out += topBadge();
    const p = escPos(base - SS / 2);
    out += `<circle cx="${p.x}" cy="${p.y}" r="66" fill="none" stroke="${C.ochre}" stroke-width="6" opacity="0.8"/>`;
    // ラベル
    out += callout(EP.D[0] + EP.R, EP.D[1] + EP.R, 1500, 560, 'くるっと むきを かえる', prog(t, cue(0) + 1.4, 0.3) * (1 - prog(t, cue(1) + 0.4, 0.3)), { col: C.ochre, size: 40 });
    out += pop(badge('うらがわの レールを とおって した へ', { fill: '#5a6670', size: 40 }), t, cue(1) + 0.8, 1100, 760, { end: cue(2) + 0.6 });
    const ak = prog(t, cue(1) + 0.4, 0.5);
    if (ak > 0) out += g(arrow2(1200, 470, 800, 700, '#5a6670', 12), { o: ak * (1 - prog(t, cue(2) + 0.6, 0.3)) });
    out += callout(EP.A[0] - EP.R, EP.A[1] + EP.R, 330, 340, 'また でて くる', prog(t, cue(2) + 1.2, 0.3), { col: C.blueUi, size: 42 });
    return out;
  },
});

// 5. くし（コム）とみぞ（クリート）：上から見たところ
SCENES.push({
  id: 'comb',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${WALL}"/>`;
    const X0 = 660, X1 = 1260, CY = 330, SH = 170, sp = 50;
    const grooves = 24, gw = (X1 - X0) / grooves;
    // 段（下から上へ動く）
    let st = `<clipPath id="cbclip"><rect x="${X0}" y="${CY}" width="${X1 - X0}" height="${850 - CY}"/></clipPath><g clip-path="url(#cbclip)">`;
    const off = (t * sp) % SH;
    for (let i = -1; i < 4; i++) {
      const y = CY + i * SH - off + 10;
      st += `<rect x="${X0}" y="${y}" width="${X1 - X0}" height="${SH - 8}" fill="${STEP}"/>`;
      for (let k = 1; k < grooves; k++) st += `<rect x="${X0 + k * gw - 4}" y="${y + 14}" width="8" height="${SH - 36}" fill="${STEP_D}"/>`;
      st += `<rect x="${X0}" y="${y}" width="${X1 - X0}" height="12" fill="${YL}"/><rect x="${X0}" y="${y}" width="14" height="${SH - 8}" fill="${YL}"/><rect x="${X1 - 14}" y="${y}" width="14" height="${SH - 8}" fill="${YL}"/>`;
    }
    st += `</g>`;
    out += st;
    // 横のかべ
    out += `<rect x="${X0 - 70}" y="120" width="70" height="730" fill="#c9ced3"/><rect x="${X1}" y="120" width="70" height="730" fill="#c9ced3"/>`;
    // くしの板（上）
    let cb = `<rect x="${X0 - 70}" y="120" width="${X1 - X0 + 140}" height="${CY - 120}" fill="${METAL}"/>`;
    for (let k = 1; k < grooves; k++) cb += `<path d="M ${X0 + k * gw - 4} ${CY - 2} L ${X0 + k * gw + 4} ${CY - 2} L ${X0 + k * gw + 3} ${CY + 46} Q ${X0 + k * gw} ${CY + 54} ${X0 + k * gw - 3} ${CY + 46} Z" fill="${mix(METAL, '#000000', 0.15)}"/>`;
    cb += `<rect x="${X0 - 70}" y="120" width="${X1 - X0 + 140}" height="14" fill="${mix(METAL, '#ffffff', 0.25)}"/>`;
    out += cb + `<rect x="${X0 - 70}" y="60" width="${X1 - X0 + 140}" height="60" fill="${FLOOR}"/>`;
    out += g(arrow2(0, 120, 0, -40, C.blueUi, 12), { x: X0 - 160, y: 600, o: 0.85 }) + g(text(0, 0, 'すすむ むき', { size: 32, w: 900, fill: C.blueUi }), { x: X0 - 160, y: 760 });
    out += callout(X0 + gw * 6, CY + 30, 300, 260, 'くし', prog(t, cue(0) + 2.2, 0.3), { col: '#4f565c', size: 50 });
    // 虫めがね：くしの歯がみぞに入る
    const mk = prog(t, cue(1) + 0.4, 0.6);
    if (mk > 0) {
      let m = `<clipPath id="mgc"><circle r="200"/></clipPath><circle r="206" fill="#fff"/><g clip-path="url(#mgc)"><rect x="-220" y="-220" width="440" height="440" fill="${STEP}"/>`;
      for (let k = -2; k <= 2; k++) m += `<rect x="${k * 90 - 18}" y="-220" width="36" height="440" fill="${STEP_D}"/>`;
      m += `<rect x="-220" y="-220" width="440" height="150" fill="${METAL}"/>`;
      for (let k = -2; k <= 2; k++) m += `<path d="M ${k * 90 - 16} -72 L ${k * 90 + 16} -72 L ${k * 90 + 12} 70 Q ${k * 90} 92 ${k * 90 - 12} 70 Z" fill="${mix(METAL, '#000000', 0.18)}"/>`;
      m += `</g><circle r="200" fill="none" stroke="${C.blueUi}" stroke-width="12"/>`;
      m += text(0, 250, 'くしの はが みぞの なかへ', { size: 36, w: 900, fill: C.blueUi });
      out += g(m, { x: 1610, y: 470, s: Math.max(0.001, eo(mk)), o: (1 - prog(t, cue(3) - 0.3, 0.3)) });
      out += g(`<line x1="${X0 + gw * 18}" y1="${CY + 20}" x2="1410" y2="${470}" stroke="${C.blueUi}" stroke-width="4" stroke-dasharray="10 8"/>`, { o: mk * (1 - prog(t, cue(3) - 0.3, 0.3)) });
    }
    // くつ：段にのって上へ → くしの上に乗りあげて止まる
    const sk = prog(t, cue(2) - 0.4, 0.4);
    if (sk > 0) {
      const t2 = cue(2) + 0.2, ride = Math.max(0, t - t2) * sp;
      const yRide = 700 - ride, stopY = CY - 90;
      const y = Math.max(yRide, stopY);
      const shoe = `<path d="M -50 60 L -50 -40 Q -50 -80 0 -80 Q 50 -80 50 -40 L 50 60 Q 0 80 -50 60 Z" fill="#e2574c" stroke="${C.ink}" stroke-width="5"/><path d="M -30 -50 L 30 -50 M -30 -30 L 30 -30 M -30 -10 L 30 -10" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
      out += g(shoe, { x: 960, y, o: sk * (1 - prog(t, cue(3) + 0.6, 0.4)) });
      out += pop(badge('だんは くしの した へ', { fill: '#5a6670', size: 40 }), t, cue(2) + 1.0, 960, 790, { end: cue(3) + 0.6 });
      out += pop(badge('くつは くしの うえ へ', { fill: '#c0473d', size: 40 }), t, cue(2) + 3.0, 960, 160 - 0, { end: cue(3) + 0.6 });
    }
    // くしの先のなだらかな坂（横から）
    const rk = prog(t, cue(3) + 0.2, 0.5);
    if (rk > 0) {
      let r = card(560, 440) + text(0, -170, 'よこから みると', { size: 40, w: 900 });
      r += `<rect x="-250" y="40" width="500" height="34" fill="${STEP}"/>` + [0, 1, 2, 3, 4].map(i => `<line x1="${-250 + i * 110}" y1="40" x2="${-250 + i * 110}" y2="74" stroke="${STEP_D}" stroke-width="3"/>`).join('');
      r += `<path d="M -40 40 L 60 6 L 250 6 L 250 -40 L 40 -40 L -40 30 Z" fill="${METAL}"/>`;
      r += g(arrow2(-130, 10, -50, 10, C.blueUi, 10), {});
      r += text(-20, 130, 'くしの さきは なだらかな さか', { size: 34, w: 900, fill: C.blueUi });
      r += `<path d="M -40 40 L 60 6" stroke="${C.ochre}" stroke-width="8" stroke-linecap="round"/>`;
      out += g(r, { x: 1610, y: 470, o: rk, s: lerp(0.9, 1, eo(rk)) });
    }
    return out + topBadge();
  },
});

// 6. 前の車輪と後ろの車輪、2本のレール
const WF = x => x <= 760 ? 690 : x < 1060 ? 690 - Math.tan(Math.PI / 6) * (x - 760) * (x - 760) / 600 : 690 - Math.tan(Math.PI / 6) * 150 - Math.tan(Math.PI / 6) * (x - 1060);
const WDW = 70, WDY = 60;
const WR = x => WF(x + WDW) + WDY;
SCENES.push({
  id: 'wheel',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const polyF = [], polyR = [];
    for (let x = -40; x <= 1960; x += 20) { polyF.push(`${x},${WF(x)}`); polyR.push(`${x},${WR(x)}`); }
    const railO = prog(t, cue(1) + 0.4, 0.6);
    out += g(`<polyline points="${polyR.join(' ')}" fill="none" stroke="${C.blueUi}" stroke-width="10"/>`, { o: 0.25 + 0.75 * railO });
    out += g(`<polyline points="${polyF.join(' ')}" fill="none" stroke="${C.redUi}" stroke-width="10"/>`, { o: 0.25 + 0.75 * railO });
    // 段（右へ進む＝上へのぼる）
    const SP = 130, v = 28, D = 130, TOP = 76;
    let ris = '', trd = '', whl = '';
    const n = 18, x0 = -200;
    for (let i = 0; i < n; i++) {
      const x = x0 + ((i * SP + t * v) % (n * SP));
      if (x < -160 || x > 2080) continue;
      const y = WF(x), top = y - TOP;
      ris += `<rect x="${x - D - 12 + 14}" y="${top}" width="12" height="80" fill="${STEP_D}"/>`;
      trd += `<line x1="${x - 6}" y1="${top + 16}" x2="${x}" y2="${y - 16}" stroke="${STEP_D}" stroke-width="12" stroke-linecap="round"/><line x1="${x - D + 30}" y1="${top + 16}" x2="${x - WDW}" y2="${y + WDY - 16}" stroke="${STEP_D}" stroke-width="12" stroke-linecap="round"/>` +
        `<rect x="${x - D + 14}" y="${top}" width="${D}" height="22" rx="4" fill="${STEP}" stroke="${STEP_D}" stroke-width="3"/>` +
        `<line x1="${x - D + 16}" y1="${top + 2}" x2="${x + 12}" y2="${top + 2}" stroke="${YL}" stroke-width="6"/>`;
      whl += `<circle cx="${x}" cy="${y - 16}" r="15" fill="${C.redUi}" stroke="#fff" stroke-width="4"/><circle cx="${x - WDW}" cy="${y + WDY - 16}" r="15" fill="${C.blueUi}" stroke="#fff" stroke-width="4"/>`;
    }
    out += ris + trd + whl;
    // ラベル
    out += pop(badge('まえの くるま', { fill: C.redUi, size: 38 }), t, cue(1) + 1.0, 260, 440, { end: cue(2) });
    out += pop(badge('うしろの くるま', { fill: C.blueUi, size: 38 }), t, cue(1) + 1.8, 620, 440, { end: cue(2) });
    out += pop(badge('べつべつの レール', { fill: C.ink, size: 40 }), t, cue(1) + 2.8, 1300, 760, { end: cue(2) + 0.2 });
    // 高さの差（たいらな所と坂の所）
    const hk = prog(t, cue(2) + 0.4, 0.4);
    if (hk > 0) {
      const mark = (x, lab, dx = 0, dy = 46) => { const a = WF(x), b = WR(x); return `<line x1="${x}" y1="${a}" x2="${x}" y2="${b}" stroke="${C.ochre}" stroke-width="6"/><line x1="${x - 18}" y1="${a}" x2="${x + 18}" y2="${a}" stroke="${C.ochre}" stroke-width="6"/><line x1="${x - 18}" y1="${b}" x2="${x + 18}" y2="${b}" stroke="${C.ochre}" stroke-width="6"/>` + text(x + dx, b + dy, lab, { size: 34, w: 900, fill: C.ochre, anchor: dx ? 'start' : 'middle' }); };
      out += g(mark(300, 'さが おおきい') + mark(1500, 'さが ちいさい', 30, 70), { o: hk * (1 - prog(t, cue(3) + 0.6, 0.3)) });
      out += pop(badge('だんは いつも すいへい', { fill: C.accent, size: 42 }), t, cue(2) + 1.6, 1500, 840 - 40, { end: cue(3) + 0.6 });
    }
    out += pop(badge('たいら', { fill: C.blueUi, size: 46 }), t, cue(3) + 2.4, 360, 470);
    out += pop(badge('かいだん', { fill: C.redUi, size: 46 }), t, cue(3) + 0.8, 1180, 330);
    out += kidShow('S', t, 1740, 850, { s: 0.5, start: cue(4) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 7. おまけ：速さとかたむき
SCENES.push({
  id: 'speed',
  draw(t) {
    let out = escalator(t, { speed: 40 }) + topBadge();
    const ck = prog(t, cue(0) + 1.0, 0.5);
    if (ck > 0) {
      const a = (t * 1.2) % (Math.PI * 2);
      let c = card(520, 220) + `<circle cx="-170" cy="0" r="66" fill="#fff" stroke="${C.ink}" stroke-width="7"/><line x1="-170" y1="0" x2="${-170 + Math.sin(a) * 50}" y2="${-Math.cos(a) * 50}" stroke="${C.red}" stroke-width="6" stroke-linecap="round"/><circle cx="-170" cy="0" r="7" fill="${C.ink}"/>`;
      c += text(70, -40, '1ぷんで', { size: 44, w: 900 }) + text(70, 34, '30メートル', { size: 56, w: 900, fill: C.redUi });
      out += g(c, { x: 1480, y: 720, o: ck, s: lerp(0.9, 1, eo(ck)) });
    }
    const ak = prog(t, cue(1) + 0.3, 0.8);
    if (ak > 0) {
      const R = 170, a1 = -Math.PI / 6 * eo(ak);
      const [bx, by] = EP.B;
      out += `<line x1="${bx}" y1="${by}" x2="${bx + 260}" y2="${by}" stroke="${C.ochre}" stroke-width="6" stroke-dasharray="12 8"/>`;
      out += `<path d="M ${bx + R} ${by} A ${R} ${R} 0 0 0 ${bx + R * Math.cos(a1)} ${by + R * Math.sin(a1)}" fill="none" stroke="${C.ochre}" stroke-width="10"/>`;
      out += pop(badge('30ど', { fill: C.ochre, size: 48 }), t, cue(1) + 1.0, bx + 290, by - 50);
    }
    out += pop(badge('おまけ', { fill: C.ochre, size: 46 }), t, 0.3, 1700, 160);
    return out;
  },
});

// 8. 正解 と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -600;
      let a = pop(card(1380, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'ゆかの したを とおって のりくちへ もどる', { size: 54, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['だんは つながった わっか', C.blueUi], ['うらがわを とおって もどる', C.accent], ['また のりくちから でてくる', C.ochre]], t, 960, 600, { start: 2.4, step: 0.9, size: 36, gap: 28 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const ic = inner => `<rect x="-62" y="-46" width="124" height="92" rx="16" fill="${WALL}"/>` + inner;
      const stepsIc = [0, 1, 2, 3].map(i => `<rect x="${-56 + i * 28}" y="${i < 2 ? 20 : 20 - (i - 1) * 16}" width="28" height="10" fill="${STEP}"/>`).join('');
      const items = [
        [ic(stepsIc + g(eyeIcon(1), { x: 28, y: -22, s: 0.2 })), 'のる まえに よこから みる', C.ink, cue(1)],
        [ic(stepsIc + text(30, -22, '?', { size: 40, w: 900, fill: C.ochre })), 'たいらな だんは なんまい？', C.ink, cue(2)],
        [ic(`<circle cx="-24" cy="-10" r="14" fill="#9aa"/><rect x="-36" y="6" width="24" height="34" rx="8" fill="#9aa"/><circle cx="20" cy="-10" r="14" fill="#9aa"/><rect x="8" y="6" width="24" height="34" rx="8" fill="#9aa"/>`), 'ひとの じゃまに ならない ばしょで', C.ink, cue(3)],
        [ic(`<rect x="-50" y="-26" width="100" height="56" fill="${STEP}"/><rect x="-50" y="-26" width="100" height="10" fill="${YL}"/><rect x="-50" y="-26" width="10" height="56" fill="${YL}"/><rect x="40" y="-26" width="10" height="56" fill="${YL}"/>`), 'きいろい せんの うちがわに', C.ink, cue(4)],
        [warnIcon, 'くしに てを ふれない・おとしものは かかりの ひと', C.red, cue(5)],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(g(icn, { s: 0.8 }) + text(100, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, st, 200, 320 + i * 110); });
      // 横から見た乗り口：平らな段をかぞえる
      const mO = prog(t, cue(1) + 0.4, 0.5);
      if (mO > 0) {
        let m = `<rect x="-280" y="-230" width="560" height="460" rx="36" fill="${WALL}"/>`;
        const xs = [-150, -80, -10, 60, 130, 200], ys = [60, 60, 50, 20, -20, -60];
        m += `<rect x="-280" y="60" width="140" height="170" fill="${FLOOR}"/>`;
        xs.forEach((x, i) => { if (i < 5) m += `<path d="M ${x} ${ys[i + 1] < ys[i] ? ys[i + 1] : ys[i]} L ${x + 70} ${ys[i + 1] < ys[i] ? ys[i + 1] : ys[i]} L ${x + 70} ${ys[i] + 26} L ${x} ${ys[i] + 26} Z" fill="${STEP}"/><line x1="${x + 2}" y1="${(ys[i + 1] < ys[i] ? ys[i + 1] : ys[i]) + 2}" x2="${x + 68}" y2="${(ys[i + 1] < ys[i] ? ys[i + 1] : ys[i]) + 2}" stroke="${YL}" stroke-width="5"/>`; });
        const nk = prog(t, cue(2) + 0.8, 0.4);
        m += g(text(-115, 10, '1', { size: 44, w: 900, fill: C.ochre }) + text(-45, 10, '2', { size: 44, w: 900, fill: C.ochre }) + text(25, 10, '?', { size: 44, w: 900, fill: C.ochre }), { o: nk });
        m += `<path d="M -230 -40 L -150 -40 L 230 -200" fill="none" stroke="#2c2f33" stroke-width="12" stroke-linecap="round"/>`;
        b += g(m, { x: 1530, y: 450, o: mO, s: lerp(0.9, 1, eo(mO)) });
      }
      b += kidShow('K', t, 1800, 850, { s: 0.5, start: cue(1) + 0.8, n: 1, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「エスカレーター」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

// ---------- ひこうきの道具 ----------
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const AC = { line: '#9db2c2', blue: '#2f6fb5', wing: '#c9d6e0', eng: '#7f8c96', win: '#5d87a8', air: '#6fb2e0', airD: '#2f7fb8', lift: '#2e9e5b', weight: '#d2452c', thrust: '#e58a1f', drag: '#7a6fd0', road: '#8a8f94' };
// 旅客機（横から。機首は左＝進む向き）。(x,y) は胴体のまん中。gear 0〜1 で車輪、r は機首の上げ（度）
function plane(x, y, s = 1, { gear = 1, r = 0 } = {}) {
  // 機首を右に描いてから、左右をうら返す
  let b = '';
  if (gear > 0.01) b += `<g transform="translate(0 ${(1 - gear) * -44})" opacity="${clamp(gear * 2)}"><rect x="146" y="30" width="8" height="44" fill="#6b7780"/><circle cx="150" cy="77" r="12" fill="#2b2f33"/><circle cx="150" cy="77" r="5" fill="#9aa5ad"/><rect x="-34" y="30" width="10" height="44" fill="#6b7780"/><circle cx="-43" cy="76" r="13" fill="#2b2f33"/><circle cx="-15" cy="76" r="13" fill="#2b2f33"/><circle cx="-43" cy="76" r="5" fill="#9aa5ad"/><circle cx="-15" cy="76" r="5" fill="#9aa5ad"/></g>`;
  b += `<path d="M -262 -8 L -306 -128 L -252 -128 L -176 -36 Z" fill="${AC.blue}"/>`;
  b += `<path d="M -236 -6 L -304 -24 L -274 4 L -200 6 Z" fill="${AC.wing}" stroke="${AC.line}" stroke-width="3" stroke-linejoin="round"/>`;
  b += `<path d="M -262 -8 L -190 -36 L 170 -36 Q 240 -34 264 2 Q 240 34 170 36 L -170 36 Q -236 28 -262 -8 Z" fill="#fff" stroke="${AC.line}" stroke-width="5" stroke-linejoin="round"/>`;
  b += `<path d="M -226 12 L 256 12 Q 232 34 170 36 L -170 36 Q -210 32 -226 12 Z" fill="#dfe8ee"/>`;
  for (let wx = -150; wx <= 160; wx += 24) b += `<rect x="${wx}" y="-20" width="12" height="14" rx="4" fill="${AC.win}"/>`;
  b += `<path d="M 200 -25 L 232 -19 L 244 -7 L 204 -9 Z" fill="#3d5a73"/><rect x="176" y="-24" width="15" height="42" rx="5" fill="none" stroke="${AC.line}" stroke-width="3"/>`;
  b += `<path d="M -30 8 L 90 8 L -50 86 L -104 86 Z" fill="${AC.wing}" stroke="${AC.line}" stroke-width="4" stroke-linejoin="round"/>`;
  b += `<rect x="-6" y="34" width="84" height="36" rx="18" fill="${AC.eng}"/><ellipse cx="76" cy="52" rx="7" ry="18" fill="#3d4a55"/>`;
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r}) scale(${-s} ${s})">${b}</g>`;
}
function arrow(x1, y1, x2, y2, col, w = 12, o = 1) {
  if (o <= 0.01 || Math.hypot(x2 - x1, y2 - y1) < 4) return '';
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/></g>`;
}
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;
// つばさの切り口（前のはしは左。c は長さ、tilt は後ろ下がりの度）
const airfoil = (cx, cy, c, tilt = 0, fill = '#e3eaf0') => `<g transform="translate(${cx} ${cy}) rotate(${tilt})"><path d="M ${-c / 2} 0 C ${-c / 2} ${-0.21 * c} ${-0.1 * c} ${-0.2 * c} ${c / 2} 0 C ${0.1 * c} ${0.06 * c} ${-0.45 * c} ${0.1 * c} ${-c / 2} 0 Z" fill="${fill}" stroke="#8fa3b3" stroke-width="6" stroke-linejoin="round"/></g>`;
// 流れのすじ：h は遠くでの高さ（つばさのまん中から。上が −）。x での y
const WG = { cx: 960, cy: 470, c: 660, tilt: 8 };
function flowY(h, x, W = WG) {
  const u = (x - W.cx) / (W.c / 2), k = W.c / 660;
  const near = Math.exp(-Math.abs(h) / (170 * k));
  const bump = Math.exp(-Math.pow((u - 0.1) / 1.0, 2));
  const sw = eio(clamp((u + 1.3) / 3.0));
  const up = Math.exp(-Math.pow((u + 1.25) / 0.5, 2));
  return W.cy + h + ((h < 0 ? -130 : 40) * bump * near - up * near * 26 + sw * (150 * near + 20)) * k;
}
const FLOW_H = [-300, -215, -140, -75, 50, 115, 190, 270];
function flowLines(t, W = WG, { x0 = 60, x1 = 1860, rev = 1e9, o = 0.7, w = 6, dots = true, hs = FLOW_H } = {}) {
  let out = '';
  const k = W.c / 660, xe = Math.min(x1, rev);
  hs.forEach((h0, j) => {
    const h = h0 * k; let d = '';
    for (let x = x0; x <= xe; x += 20) d += `${x === x0 ? 'M' : 'L'} ${x} ${flowY(h, x, W).toFixed(1)} `;
    if (d) out += `<path d="${d}" fill="none" stroke="${AC.air}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
    if (dots) {
      const sp = (h < 0 ? 1.35 : 1) * 320 * k, span = x1 - x0;
      for (let n = 0; n < 4; n++) { const x = x0 + ((t * sp + n * span / 4 + j * 97) % span); if (x < xe) out += `<circle cx="${x.toFixed(1)}" cy="${flowY(h, x, W).toFixed(1)}" r="${w * 1.25}" fill="${AC.airD}" opacity="${Math.min(1, o + 0.2)}"/>`; }
    }
  });
  return out;
}
const paperPlane = (x, y, s = 1, r = 0) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r}) scale(${s})"><path d="M -130 12 L 110 -46 L 78 2 Z" fill="#fff" stroke="#9db2c2" stroke-width="5" stroke-linejoin="round"/><path d="M -130 12 L 78 2 L 104 40 Z" fill="#dfe8ee" stroke="#9db2c2" stroke-width="5" stroke-linejoin="round"/></g>`;
const runway = (y, h, X = 0) => {
  let o = `<rect x="0" y="${y}" width="1920" height="${h}" fill="${AC.road}"/><rect x="0" y="${y}" width="1920" height="6" fill="#aab0b5"/>`;
  for (let i = 0; i < 11; i++) { const x = ((i * 220 + X) % 2420 + 2420) % 2420 - 250; o += `<rect x="${x.toFixed(1)}" y="${y + h * 0.5 - 6}" width="120" height="12" rx="3" fill="#f4f4ee"/>`; }
  return o;
};
const terminal = (x, y, s = 1) => `<g transform="translate(${x.toFixed(1)} ${y}) scale(${s})"><rect x="0" y="-110" width="460" height="110" fill="#dfe6ea"/><rect x="0" y="-122" width="460" height="14" fill="#b9c4cc"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${22 + i * 48}" y="-86" width="32" height="50" rx="4" fill="#9cc7e0"/>`).join('')}<rect x="520" y="-230" width="34" height="230" fill="#cfd8de"/><path d="M 496 -230 L 578 -230 L 590 -280 L 484 -280 Z" fill="#9cc7e0" stroke="#8fa3b3" stroke-width="5" stroke-linejoin="round"/><rect x="490" y="-294" width="94" height="16" rx="5" fill="#b9c4cc"/></g>`;

// 1. つかみ：空港。重い飛行機が、走って、ふわっと浮く
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c3 = cue(3);
    let out = skyRect('skh', 0, { h: 800 });
    out += cloud(520 + t * 6, 170, 0.9) + cloud(1380 + t * 4, 260, 0.6, '#fff', 0.85);
    out += `<path d="M 0 700 Q 480 660 960 690 T 1920 680 L 1920 760 L 0 760 Z" fill="#9fcf8e"/>`;
    out += terminal(1180, 712, 1.0);
    out += runway(744, 106);
    // 飛行機：ゆっくり動いてから、走って、浮く（機首は左＝進む向き）
    const S = 1.0, GY = 800 - 89 * S;
    const p = prog(t, c1 - 0.2, d1 * 0.8), q = clamp((p - 0.55) / 0.45), after = Math.max(0, t - (c1 - 0.2 + d1 * 0.8));
    const px = 1560 - 110 * eo(prog(t, 0.3, c1 - 0.5)) - 1050 * p * p - 16 * after;
    const py = GY - 430 * Math.pow(q, 1.6) - 6 * after;
    const pr = 13 * eio(clamp(q * 2.5));
    if (p > 0.05 && q < 0.6) for (let i = 0; i < 4; i++) out += `<line x1="${px + 300 + i * 46}" y1="${py - 30 + i * 22}" x2="${px + 300 + i * 46 + 120 * p}" y2="${py - 30 + i * 22}" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${0.75 * p * (1 - q / 0.6)}"/>`;
    out += `<ellipse cx="${px}" cy="806" rx="${230 * (1 - q * 0.5)}" ry="${12 * (1 - q * 0.5)}" fill="#3d4247" opacity="${0.3 * (1 - q * 0.8)}"/>`;
    out += plane(px, py, S, { gear: 1 - prog(q, 0.55, 0.35), r: pr });
    out += pop(badge('とても おもい', { fill: AC.weight, size: 46 }), t, c0 + (cueE(0) - c0) * 0.55, 1450, 520, { end: c1 - 0.1 });
    out += arrow(1450, 566, 1450, 640, AC.weight, 14, win(t, c0 + (cueE(0) - c0) * 0.55 + 0.3, c1 - 0.1, 0.25));
    // 見ているデッキ
    out += `<rect x="0" y="850" width="1920" height="230" fill="#d9dde0"/><rect x="0" y="850" width="1920" height="8" fill="#b9c4cc"/>`;
    for (let i = 0; i < 9; i++) out += `<rect x="${20 + i * 82}" y="770" width="10" height="84" fill="#6b7780"/>`;
    out += `<rect x="0" y="766" width="700" height="10" rx="5" fill="#6b7780"/><rect x="0" y="812" width="690" height="8" rx="4" fill="#6b7780"/>`;
    const up = q > 0.05;
    out += kidShow('B', t, 250, 850, { s: 0.52, start: 0, n: 0, look: up ? [2, -9] : [8, -3], eyes: up ? 'wide' : 'open' });
    out += kidShow('S', t, 440, 850, { s: 0.52, start: 0, n: 1, bubble: false, look: up ? [-2, -9] : [8, -3], eyes: up ? 'wide' : 'open' });
    out += pop(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre }), t, c3 + 0.3, 1000, 440);
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${AC.blue}">飛行機</tspan>は、あんなに <tspan fill="${AC.weight}">重い</tspan>のに</text>`, { x: 960, y: 400, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして 空を 飛べるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(plane(0, 0, 0.8, { gear: 0, r: 10 }), t, t0 + 1.8, 960 - (t - t0) * 14, 820 - (t - t0) * 5);
    }
    return out;
  },
});

// 2. 予想
const GUESS_ICON = [
  // エンジンが下へ風
  `<rect x="-44" y="-40" width="88" height="38" rx="19" fill="${AC.eng}"/><ellipse cx="-42" cy="-21" rx="7" ry="19" fill="#3d4a55"/><path d="M -24 8 L -24 34 M 0 8 L 0 40 M 24 8 L 24 34" stroke="${AC.air}" stroke-width="8" stroke-linecap="round"/><path d="M -34 28 L -24 42 L -14 28 M -10 34 L 0 48 L 10 34 M 14 28 L 24 42 L 34 28" fill="none" stroke="${AC.air}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  // つばさが空気を下へ曲げる
  `<g transform="rotate(8)"><path d="M -52 0 C -52 -22 -10 -21 52 0 C 10 6 -47 10 -52 0 Z" fill="#e3eaf0" stroke="#8fa3b3" stroke-width="5" stroke-linejoin="round"/></g><path d="M -58 -34 C -10 -52 30 -34 56 2" fill="none" stroke="${AC.air}" stroke-width="8" stroke-linecap="round"/><path d="M 40 -4 L 58 6 L 60 -14" fill="none" stroke="${AC.air}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M -58 30 C -10 30 26 34 52 46" fill="none" stroke="${AC.air}" stroke-width="8" stroke-linecap="round"/>`,
  // 軽いガス（ふうせん）
  `<ellipse cx="0" cy="-14" rx="32" ry="38" fill="#f08a8a"/><path d="M -6 24 L 6 24 L 0 16 Z" fill="#d86a6a"/><path d="M 0 24 q 10 12 0 24 t 0 14" fill="none" stroke="${C.muted}" stroke-width="4"/><ellipse cx="-11" cy="-28" rx="7" ry="11" fill="#fff" opacity="0.6"/>`,
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(plane(-640, -6, 0.3, { gear: 0 }) + text(60, 0, 'そらへ もちあげて いるのは、なに？', { size: 60, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'エンジンが したへ かぜを ふきだす'], ['②', 'つばさが くうきを したへ まげる'], ['③', 'なかに かるい ガスが はいって いる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }) + g(GUESS_ICON[i], { x: 510, y: 0, s: 0.92 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 360, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 旅客機は、どのくらい重い？
SCENES.push({
  id: 'heavy',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1);
    let out = PAPER + topBadge();
    out += pop(plane(0, 0, 1.9), t, 0.3, 960, 300);
    out += g(text(960, 110, 'りょかくき（ボーイング 787-9）', { size: 40, w: 900, fill: C.muted }), { o: prog(t, c0 + 0.5, 0.4) });
    // 重さ
    const wk = prog(t, c0 + d0 * 0.42, 0.4);
    if (wk > 0) {
      const n = Math.round(255 * eo(prog(t, c0 + d0 * 0.5, 1.3)));
      let c = card(700, 300) + text(0, -92, 'いちばん おもい とき', { size: 42, w: 900, fill: C.muted });
      c += `<text x="0" y="36" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="${AC.weight}"><tspan font-size="60" fill="${C.ink}">やく </tspan>${n}<tspan font-size="70" fill="${C.ink}"> トン</tspan></text>`;
      out += g(c, { x: 520, y: 650, o: wk, s: lerp(0.94, 1, eo(wk)) });
    }
    // 乗れる人
    const pk = prog(t, c1 - 0.1, 0.4);
    if (pk > 0) {
      const m = Math.round(290 * eo(prog(t, c1 + 0.2, 1.6)));
      let c = card(760, 300);
      for (let i = 0; i < m; i++) c += `<circle cx="${-333 + (i % 29) * 23.8}" cy="${-112 + Math.floor(i / 29) * 15.5}" r="6" fill="${[C.blueUi, C.accent, C.redUi, C.ochre][i % 4]}"/>`;
      c += `<text x="0" y="90" font-size="92" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="${C.blueUi}">${m}<tspan font-size="56" fill="${C.ink}"> にん のれる</tspan></text>`;
      out += g(c, { x: 1360, y: 650, o: pk, s: lerp(0.94, 1, eo(pk)) });
    }
    return out;
  },
});

// 4. 4つの力（持ち上げているのは、つばさ）
SCENES.push({
  id: 'forces',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4);
    let out = skyRect('skf', 0);
    // 飛行機は左へ進む → 雲は右へ流れる
    [[300, 220, 0.9, 60], [1100, 160, 0.6, 40], [1700, 620, 0.8, 70], [700, 700, 0.55, 50]].forEach(([x, y, s, v]) => { out += cloud((x + t * v) % 2300 - 190, y, s, '#fff', 0.8); });
    const PX = 960, PY = 450 + Math.sin(t * 1.4) * 5, S = 1.6;
    // エンジンが後ろへ押し出す空気
    const ek = prog(t, c3 - 0.1, 0.5);
    if (ek > 0) for (let i = 0; i < 5; i++) { const f = (t * 1.6 + i / 5) % 1; out += `<line x1="${PX - 20 + f * 300}" y1="${PY + 62 + (i % 3) * 16}" x2="${PX + 50 + f * 300}" y2="${PY + 62 + (i % 3) * 16}" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="${ek * (1 - f) * 0.9}"/>`; }
    out += plane(PX, PY, S, { gear: 0 });
    const lab = (x, y, s, col, o, anchor = 'middle') => g(`<text x="0" y="0" font-size="46" font-weight="900" text-anchor="${anchor}" dominant-baseline="middle" letter-spacing="0.04em" fill="${col}" stroke="#fff" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${s}</text>`, { x, y, o });
    // 重さ と 持ち上げる力
    const k1 = eo(prog(t, c1 + 0.2, 0.6)), k1b = eo(prog(t, c1 + d1 * 0.5, 0.6));
    out += arrow(PX, PY + 60, PX, PY + 60 + 190 * k1, AC.weight, 20, k1) + lab(PX + 40, 660, 'おもさ', AC.weight, k1, 'start');
    out += arrow(PX, PY - 70, PX, PY - 70 - 200 * k1b, AC.lift, 20, k1b) + lab(PX + 40, 210, 'もちあげる ちから', AC.lift, k1b, 'start');
    // 前へ進める力 と 空気のていこう
    const k2 = eo(prog(t, c2 + 0.2, 0.6)), k2b = eo(prog(t, c2 + d2 * 0.45, 0.6));
    out += arrow(PX - 440, PY, PX - 440 - 210 * k2, PY, AC.thrust, 20, k2) + lab(400, 372, 'まえへ すすめる ちから', AC.thrust, k2);
    out += arrow(PX + 500, PY, PX + 500 + 210 * k2b, PY, AC.drag, 20, k2b) + lab(1570, 372, 'くうきの ていこう', AC.drag, k2b);
    // エンジンは前へ、つばさは上へ
    const e1 = prog(t, c3 + 0.2, 0.4), e2 = prog(t, c3 + d3 * 0.5, 0.4);
    out += g(`<circle cx="${PX - 58}" cy="${PY + 83}" r="${78 + Math.sin(t * 5) * 4}" fill="none" stroke="${AC.thrust}" stroke-width="9" stroke-dasharray="20 12"/>`, { o: e1 });
    out += pop(badge('エンジン：まえへ すすめる', { fill: AC.thrust, size: 42 }), t, c3 + 0.2, 560, 770) + pointer(700, 734, 850, 584, AC.thrust, prog(t, c3 + 0.5, 0.3));
    out += g(`<path d="M ${PX + 50} ${PY + 12} L ${PX - 150} ${PY + 12} L ${PX + 78} ${PY + 140} L ${PX + 170} ${PY + 140} Z" fill="none" stroke="${AC.lift}" stroke-width="9" stroke-dasharray="20 12" stroke-linejoin="round"/>`, { o: e2 });
    out += pop(badge('つばさ：もちあげる', { fill: AC.lift, size: 42 }), t, c3 + d3 * 0.5, 1330, 770) + pointer(1210, 734, 1090, 600, AC.lift, prog(t, c3 + d3 * 0.5 + 0.3, 0.3));
    out += kidShow('S', t, 1780, 850, { s: 0.42, start: c4 - 0.9, n: 0, size: 40 });
    return out;
  },
});

// 5. 浮くには、空気と速さがいる（カメラは飛行機といっしょに動く）
const MINI = { cx: 0, cy: 10, c: 300, tilt: 8 };
SCENES.push({
  id: 'speed',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3;
    const t1 = c2 + 0.4, tL = c3 + d3 * 0.62;
    const f = prog(t, t1, tL - t1);                      // 速さ（0〜1）
    const dt = Math.max(0, t - t1), T = tL - t1, VM = 2600;
    const X = t < tL ? VM * dt * dt / (2 * T) : VM * T / 2 + VM * (t - tL);   // 進んだ道のり
    const lq = eo(prog(t, tL, 2.0));                     // 浮き上がり
    let out = skyRect('sks', 0, { h: 800 });
    [[300, 200, 0.8], [1100, 260, 0.6], [1900, 180, 0.9]].forEach(([x, y, s]) => { out += cloud(((x + X * 0.08) % 2500 + 2500) % 2500 - 250, y, s, '#fff', 0.85); });
    out += `<rect x="0" y="690" width="1920" height="80" fill="#9fcf8e"/>`;
    [0, 1].forEach(i => { out += terminal(((300 + i * 1500 + X * 0.3) % 3000 + 3000) % 3000 - 700, 722, 0.8); });
    out += runway(744, 106, X) + `<rect x="0" y="850" width="1920" height="230" fill="#7d8287"/>`;
    const S = 1.3, PX = 1000, PY = 800 - 89 * S - 190 * lq, pr = 9 * eio(prog(t, tL - 0.5, 1.5));
    // 流れる空気（飛行機は左へ進む → 空気は右へ）
    if (f > 0.02) for (let i = 0; i < 12; i++) {
      const y = 380 + (i * 53) % 380, len = 60 + 240 * f, x = ((i * 337 + X * 1.15) % 2300 + 2300) % 2300 - 300;
      out += `<line x1="${x.toFixed(1)}" y1="${y}" x2="${(x + len).toFixed(1)}" y2="${y}" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="${0.55 * Math.min(1, f * 3)}"/>`;
    }
    out += `<ellipse cx="${PX}" cy="806" rx="${300 * (1 - lq * 0.4)}" ry="${14 * (1 - lq * 0.4)}" fill="#3d4247" opacity="${0.32 * (1 - lq * 0.6)}"/>`;
    out += plane(PX, PY, S, { gear: 1, r: pr });
    // 重さ と 持ち上げる力
    const lab = (x, y, s, col, o, anchor = 'middle') => g(`<text x="0" y="0" font-size="44" font-weight="900" text-anchor="${anchor}" dominant-baseline="middle" letter-spacing="0.04em" fill="${col}" stroke="#fff" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${s}</text>`, { x, y, o });
    const wO = prog(t, c0 + 0.3, 0.4), WL = 150, LL = 175 * f * f;
    out += arrow(PX + 130, PY - 40, PX + 130, PY - 40 + WL, AC.weight, 20, wO) + lab(PX + 170, PY + 40, 'おもさ', AC.weight, wO, 'start');
    out += arrow(PX - 30, PY - 70, PX - 30, PY - 70 - LL, AC.lift, 20, 1) + lab(PX - 30, PY - 110 - LL, 'もちあげる ちから', AC.lift, prog(f, 0.25, 0.2) * (1 - prog(t, tL - 0.3, 0.3)));
    out += pop(badge('とまって いると… もちあげる ちからは ない', { fill: C.blueUi, size: 42 }), t, c0 + 0.5, 860, 200, { end: c2 - 0.1 });
    // 小さな図：つばさのまわりを空気が流れる
    const mO = win(t, c1 + 0.2, c2 + 0.1, 0.4);
    if (mO > 0) {
      let m = card(620, 330) + `<clipPath id="mclip"><rect x="-290" y="-150" width="580" height="215" rx="16"/></clipPath><g clip-path="url(#mclip)"><rect x="-290" y="-150" width="580" height="215" fill="#eef6fb"/>${flowLines(t, MINI, { x0: -300, x1: 300, w: 4, hs: [-215, -140, -75, 50, 115] })}${airfoil(0, 10, 300, 8)}</g>`;
      m += text(0, 112, 'くうきが ながれると ちからが うまれる', { size: 30, w: 900, fill: C.blueUi });
      out += g(m, { x: 400, y: 450, o: mO, s: lerp(0.94, 1, eo(mO)) });
    }
    // 速さ
    const sO = prog(t, c2 + 0.2, 0.4);
    if (sO > 0) out += g(card(520, 170) + `<text x="0" y="6" font-size="96" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="${C.blueUi}"><tspan font-size="46" fill="${C.ink}">じそく </tspan>${Math.round(270 * f)}<tspan font-size="50" fill="${C.ink}"> キロ</tspan></text>`, { x: 360, y: 200, o: sO });
    out += pop(badge('もちあげる ちから ＞ おもさ', { fill: AC.lift, size: 46, pad: 40 }), t, tL - 0.1, 1400, 150);
    out += pop(text(0, 0, 'ういた！', { size: 80, w: 900, fill: AC.lift, extra: 'stroke="#fff" stroke-width="14" stroke-linejoin="round" paint-order="stroke"' }), t, tL + 0.5, 1590, 290);
    return out;
  },
});

// 6. つばさは、空気を下へ曲げている（答えの場面）
SCENES.push({
  id: 'turn',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="#eef6fb"/>` + topBadge();
    const rev = lerp(60, 1900, eo(prog(t, 0.3, 2.2)));
    out += flowLines(t, WG, { rev });
    // 圧力（上は弱い、下は強い）
    const pO = win(t, c2 + 0.2, c4 - 0.2, 0.4);
    if (pO > 0) {
      out += g(`<ellipse cx="930" cy="330" rx="330" ry="80" fill="#bfe0f5" opacity="0.55" filter="url(#soft)"/><ellipse cx="950" cy="590" rx="330" ry="76" fill="#ffc9a3" opacity="0.7" filter="url(#soft)"/>`, { o: pO });
    }
    out += pop(airfoil(0, 0, WG.c, WG.tilt), t, 0.2, WG.cx, WG.cy);
    out += g(text(WG.cx - 30, WG.cy - 26, 'つばさ（よこから みた きりくち）', { size: 34, w: 900, fill: '#6f8392' }), { o: win(t, 0.6, c1 - 0.1, 0.3) });
    out += pop(badge('まえから きた くうき', { fill: AC.airD, size: 42 }), t, c0 + 0.2, 330, 245, { end: c2 - 0.1 }) + arrow(210, 305, 380, 305, AC.airD, 12, win(t, c0 + 0.5, c2 - 0.1, 0.3));
    out += pop(badge('したむきに まがる', { fill: AC.airD, size: 42 }), t, c0 + d0 * 0.55, 1560, 330, { end: c2 - 0.1 });
    out += arrow(1380, 500, 1560, 610, AC.airD, 18, win(t, c0 + d0 * 0.55 + 0.3, c2 - 0.1, 0.3));
    // 押すと、押し返される
    const a1 = win(t, c1 + 0.2, c2 - 0.1, 0.3), a2 = win(t, c1 + d1 * 0.5, c2 - 0.1, 0.3);
    out += arrow(1250, 560, 1250, 740, AC.airD, 24, a1) + g(badge('くうきを したへ おす', { fill: AC.airD, size: 40 }), { x: 1250, y: 800, o: a1 });
    out += arrow(880, 400, 880, 210, AC.lift, 24, a2) + g(badge('つばさは うえへ おしかえされる', { fill: AC.lift, size: 40 }), { x: 880, y: 150, o: a2 });
    if (pO > 0) {
      let p = '';
      for (let i = 0; i < 5; i++) { const x = 730 + i * 100; p += arrow(x, 300 + i * 6, x, 330 + i * 6, '#5a9fd0', 8, 1); p += arrow(x + 20, 640 + i * 10, x + 20, 560 + i * 10, '#e8742c', 13, prog(t, c2 + d2 * 0.55, 0.4)); }
      p += g(badge('うえ：おす ちからが よわい', { fill: '#4d93c6', size: 40 }), { x: 900, y: 215 });
      p += g(badge('した：おす ちからが つよい', { fill: '#e8742c', size: 40 }), { x: 940, y: 730, o: prog(t, c2 + d2 * 0.55, 0.4) });
      out += g(p, { o: pO });
    }
    // 下から上へ、押し上げられる
    const l3 = win(t, c3 + 0.2, c4 - 0.2, 0.3);
    out += arrow(1420, 560, 1420, 300, AC.lift, 34, l3) + g(badge('うえへ おしあげられる', { fill: AC.lift, size: 44 }), { x: 1560, y: 250, o: l3 });
    // 同じことを、別の側から見た説明
    const s4 = prog(t, c4 + 0.1, 0.4);
    if (s4 > 0) {
      out += arrow(880, 400, 880, 220, AC.lift, 28, s4);
      out += pop(badge('くうきを したへ まげる はんどう', { fill: AC.airD, size: 38 }), t, c4 + 0.2, 500, 790);
      out += pop(text(0, 0, '＝', { size: 70, w: 900, fill: C.ink }), t, c4 + 0.9, 960, 790);
      out += pop(badge('うえと したの おす ちからの ちがい', { fill: '#e8742c', size: 38 }), t, c4 + 1.3, 1440, 790);
      out += pop(badge('どちらも ただしい', { fill: AC.lift, size: 46, pad: 40 }), t, c4 + 2.2, 960, 140);
    }
    return out;
  },
});

// 7. よくあるまちがい（煙の実験）と、紙飛行機
const MW = { cx: 900, cy: 470, c: 660, tilt: 8 };
// 煙のしるし：tau 秒後の x（つばさの上は速く、下は少しおそい）
function puffX(h, tau) {
  const near = Math.exp(-Math.abs(h) / 170), kk = h < 0 ? 0.75 * near : -0.18 * near;
  let x = 430;
  for (let s = 0; s < tau; s += 0.04) x += 330 * (1 + kk * Math.exp(-Math.pow((x - MW.cx) / 340, 2))) * Math.min(0.04, tau - s);
  return x;
}
SCENES.push({
  id: 'myth',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), c4 = cue(4), d4 = cueE(4) - c4;
    let out = PAPER;
    // A：よく聞く説明（まちがい）
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      let a = topBadge() + pop(badge('よく きく せつめい', { fill: '#8c8c86', size: 46 }), t, 0.3, 960, 170);
      let c = card(1240, 470) + airfoil(0, 20, 760, 0);
      // 上と下に分かれた空気が、後ろで同時に出会う（という、まちがった絵）
      const lp = ((t - c0 - 0.6) % 3.2) / 2.2, k = clamp(lp);
      if (t > c0 + 0.6) {
        const tx = lerp(-380, 380, k);
        const top = 20 - 118 * Math.sin(Math.PI * k) * (1 - 0.25 * k), bot = 20 + 62 * Math.sin(Math.PI * k);
        c += `<path d="M -380 20 C -380 -150 -60 -150 380 20" fill="none" stroke="${AC.air}" stroke-width="7" stroke-dasharray="14 12"/><path d="M -380 20 C -300 110 60 90 380 20" fill="none" stroke="#e8a45a" stroke-width="7" stroke-dasharray="14 12"/>`;
        c += `<circle cx="${tx}" cy="${top - 14}" r="20" fill="${AC.airD}"/><circle cx="${tx}" cy="${bot + 14}" r="20" fill="#e8742c"/>`;
        if (k >= 1) c += text(416, 24, 'どうじ？', { size: 44, w: 900, fill: C.muted, anchor: 'start' });
      }
      c += text(-520, 20, 'わかれる', { size: 40, w: 900, fill: C.muted });
      c += text(0, 186, '「うえと したの くうきが、うしろで どうじに であう」', { size: 40, w: 900 });
      a += g(c, { x: 960, y: 500, o: prog(t, 0.5, 0.4) });
      const xk = prog(t, c1 + 0.2, 0.3);
      a += g(cross(960, 480, 3.2), { o: xk * 0.9, s: 1 }) + pop(badge('これは まちがい', { fill: C.red, size: 60, pad: 50 }), t, c1 + 0.4, 960, 800);
      out += g(a, { o: aO });
    }
    // B：煙を流した実験
    const bO = win(t, c2 - 0.3, c4 - 0.3, 0.4);
    if (bO > 0) {
      let b = `<rect width="1920" height="1080" fill="#eef6fb"/>` + topBadge();
      b += flowLines(t, MW, { o: 0.3, dots: false, x0: 100, x1: 1800 });
      b += airfoil(MW.cx, MW.cy, MW.c, MW.tilt);
      const TE = MW.cx + MW.c / 2;
      b += `<line x1="${TE}" y1="250" x2="${TE}" y2="760" stroke="${C.muted}" stroke-width="5" stroke-dasharray="14 12"/>` + text(TE, 800, 'うしろの はし', { size: 36, w: 900, fill: C.muted });
      // 煙のしるし（たてにならんだ点）。3.4秒ごとに流す
      const P0 = c2 + 0.5, per = 2.9;
      for (let n = 0; n < 4; n++) {
        const tau = t - (P0 + n * per);
        if (tau <= 0 || tau > 5.2) continue;
        const pts = FLOW_H.slice(1, 7).map(h => { const x = puffX(h, tau); return [x, flowY(h, x, MW), h]; });
        [pts.filter(p => p[2] < 0 && p[0] < 1640), pts.filter(p => p[2] > 0 && p[0] < 1640)].forEach((grp, gi) => {
          if (grp.length > 1) b += `<path d="M ${grp.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')}" fill="none" stroke="${gi ? '#e8742c' : AC.airD}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`;
          grp.forEach(p => { b += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="17" fill="${gi ? '#e8742c' : AC.airD}"/>`; });
        });
      }
      b += pop(badge('けむりを ながした じっけん（ケンブリッジだいがく）', { fill: C.muted, size: 36 }), t, c2 + 0.2, 1160, 110);
      b += pop(badge('うえの くうきが、ずっと さきに つく', { fill: AC.airD, size: 44 }), t, c2 + d2 * 0.55, 1400, 195);
      b += text(400, 300, 'うえを とおる くうき', { size: 38, w: 900, fill: AC.airD, anchor: 'end' }) + text(400, 690, 'したを とおる くうき', { size: 38, w: 900, fill: '#e8742c', anchor: 'end' });
      b += kidShow('B', t, 1760, 850, { s: 0.5, start: c3 - 0.9, n: 0, bubble: false, look: [-8, -4] });
      b += talkBubble('B', 1700, 590, 1760, 655, 40);
      out += g(b, { o: bO });
    }
    // C：紙飛行機の平らなつばさ
    const cO = prog(t, c4 - 0.2, 0.4);
    if (cO > 0) {
      const k = prog(t, c4, d4 + 1.2);
      let c = skyRect('skm', 0) + cloud(420, 620, 0.8, '#fff', 0.8) + cloud(1500, 240, 0.7, '#fff', 0.8);
      // 紙飛行機は左へ進む（機首は左）
      c += paperPlane(lerp(1750, 560, k), lerp(260, 470, k) + Math.sin(t * 2.2) * 10, 1.5, -9 + Math.sin(t * 2.2 + 1) * 3);
      let m = card(760, 330) + text(0, -112, 'かみひこうきの つばさを よこから みると', { size: 34, w: 900, fill: C.muted });
      m += `<rect x="-250" y="-22" width="500" height="14" rx="5" fill="#fff" stroke="#8fa3b3" stroke-width="5"/>`;
      m += text(0, -58, 'うえ：たいら', { size: 36, w: 900, fill: AC.airD }) + text(0, 30, 'した：たいら', { size: 36, w: 900, fill: '#e8742c' });
      m += text(0, 108, 'うえと したが おなじ かたち', { size: 40, w: 900 });
      c += g(m, { x: 1380, y: 620, o: prog(t, c4 + d4 * 0.2, 0.4) });
      c += pop(badge('それでも ちゃんと とぶ', { fill: AC.lift, size: 50, pad: 44 }), t, c4 + d4 * 0.65, 560, 760);
      out += g(c, { o: cO });
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
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'つばさが くうきを したへ まげる', { size: 54, w: 900, anchor: 'start' }) + g(GUESS_ICON[1], { x: 540, y: 0, s: 0.9 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['はしって くうきを ながす', C.blueUi], ['つばさが くうきを したへ まげる', AC.airD], ['その はんどうで うえへ', AC.lift]], t, 960, 660, { start: 2.4, step: 1.1, size: 34, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const items = [
        [paperPlane(0, 0, 0.42, -6), 'かみひこうきの つばさを よこから みる', C.ink],
        [plane(0, -4, 0.2, { r: 8 }), 'しゃりんが どこで じめんから はなれる？', C.ink],
        [warnIcon(0.82), 'かみひこうきは ひとの かおに むけて とばさない', C.red],
        [warnIcon(0.82), 'くうこうでは きめられた ばしょから みる', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // 展望デッキから見る
      const ck = prog(t, cue(1) + 0.3, 0.5);
      if (ck > 0) {
        const k = ((t - cue(1)) % 6) / 6, q = clamp((k - 0.45) / 0.55);
        let p = g(card(480, 300), { x: 1620, y: 250 });
        p += `<clipPath id="lkc"><rect x="1400" y="120" width="440" height="260" rx="18"/></clipPath><g clip-path="url(#lkc)">${skyRect('lks', 0, { x: 1400, y: 120, w: 440, h: 260 })}<rect x="1400" y="330" width="440" height="50" fill="${AC.road}"/>${plane(1800 - 330 * k, 322 - 89 * 0.3 - 130 * Math.pow(q, 1.5), 0.3, { r: 12 * eio(clamp(q * 2.5)) })}</g>`;
        b += g(p, { o: ck });
      }
      b += kidShow('K', t, 1700, 800, { s: 0.72, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ひこうき」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

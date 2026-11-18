// ---------- 月の道具 ----------
const MN = { lit: '#fff4c9', litHi: '#fffbe6', dark: '#3a4256', sea: '#e6d9a8', space: '#141b2e', space2: '#1f2a44', earthSea: '#3a86d0', earthLand: '#5bb05a' };
// 地球から見た月の形。e = 太陽とのはなれ（0 新月 → π 満月 → 2π 新月）。前半は右が光る
function moonPhase(cx, cy, r, e, { glow = 1, dark = MN.dark, seas = true } = {}) {
  e = ((e % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const wax = e <= Math.PI, k = Math.cos(e), rx = Math.abs(r * k);
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dark}"/>`;
  const f = (1 - k) / 2; // 光っている割合
  if (glow > 0 && f > 0.05) s += `<circle cx="${cx}" cy="${cy}" r="${r * 1.35}" fill="${MN.lit}" opacity="${0.22 * f * glow}" filter="url(#glow)"/>`;
  // 右半分 + 欠けぎわ（前半）。後半は左右反転
  const sweep = k > 0 ? 0 : 1;
  let d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${Math.max(rx, 0.01)} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
  const lit = `<path d="${d}" fill="${MN.lit}"/>`;
  s += wax ? lit : `<g transform="translate(${2 * cx} 0) scale(-1 1)">${lit}</g>`;
  if (seas) {
    const id = 'mc' + Math.round(cx) + '_' + Math.round(cy) + '_' + Math.round(r);
    s += `<clipPath id="${id}">${wax ? `<path d="${d}"/>` : `<path d="${d}" transform="translate(${2 * cx} 0) scale(-1 1)"/>`}</clipPath><g clip-path="url(#${id})">` +
      [[-0.3, -0.3, 0.28], [0.25, -0.1, 0.2], [-0.05, 0.3, 0.22], [0.35, 0.35, 0.12]].map(([a, b, c]) => `<circle cx="${cx + a * r}" cy="${cy + b * r}" r="${c * r}" fill="${MN.sea}"/>`).join('') + `</g>`;
  }
  return s;
}
// 宇宙から見た月（左から太陽の光、左半分が明るい）
const moonSpace = (x, y, r, litDir = Math.PI) => {
  const a = litDir * 180 / Math.PI;
  return `<g transform="translate(${x} ${y}) rotate(${a})"><circle r="${r}" fill="${MN.dark}"/><path d="M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} Z" fill="${MN.lit}"/></g>`;
};
const earth = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${MN.earthSea}"/><path d="M ${-r * 0.5} ${-r * 0.6} q ${r * 0.4} ${-r * 0.2} ${r * 0.6} ${r * 0.2} q ${r * 0.1} ${r * 0.4} ${-r * 0.3} ${r * 0.5} q ${-r * 0.4} ${-r * 0.1} ${-r * 0.3} ${-r * 0.7} Z M ${r * 0.2} ${r * 0.2} q ${r * 0.4} 0 ${r * 0.5} ${r * 0.4} q ${-r * 0.2} ${r * 0.3} ${-r * 0.5} ${r * 0.1} Z" fill="${MN.earthLand}"/><path d="M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${r * 0.0001} ${r} 0 0 0 0 ${-r} Z" fill="#000" opacity="0.0"/><path d="M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} Z" fill="#06101f" opacity="0.45"/></g>`;
const sunL = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r * 1.8}" fill="#ffd36b" opacity="0.35" filter="url(#glow)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ffcf4a"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#lampshine)" opacity="0.5"/>`;
const spaceBG = () => `<rect width="1920" height="1080" fill="${MN.space}"/>` + stars(13, 90).replace(/cy="([\d.]+)"/g, (m, v) => `cy="${(+v) * 1.9}"`);
const nightBG = (top = '#16213b', bot = '#33456e') => `<linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect width="1920" height="1080" fill="url(#nsky)"/>` + stars(3, 70);
const town = (col = '#0f1626') => `<path d="M 0 860 L 0 760 L 120 760 L 120 700 L 220 700 L 220 780 L 340 780 L 340 720 L 400 680 L 460 720 L 460 790 L 620 790 L 620 740 L 760 740 L 760 800 L 1000 800 L 1000 730 L 1080 690 L 1160 730 L 1160 790 L 1320 790 L 1320 710 L 1440 710 L 1440 780 L 1600 780 L 1600 730 L 1700 690 L 1800 730 L 1800 770 L 1920 770 L 1920 860 Z" fill="${col}"/><rect y="858" width="1920" height="222" fill="${col}"/>`;
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46, bg = '#fff' } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="${bg}" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
const okMark = (x, y, s = 1, col = C.accent) => `<circle cx="${x}" cy="${y}" r="${54 * s}" fill="none" stroke="${col}" stroke-width="${16 * s}"/>`;
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 太陽・地球・月の図。th = 月のいる角度（π = 太陽のほう＝左）
const EC = { x: 820, y: 480, R: 290 };
function orbitView(t, th, { showOrbit = 1, rays = 1, label = 0, eye = 0 } = {}) {
  let s = spaceBG();
  s += sunL(-60, EC.y, 200);
  if (rays) for (let i = 0; i < 7; i++) { const y = 150 + i * 110, off = ((t * 220 + i * 70) % 260); s += `<line x1="${150 + off}" y1="${y}" x2="${230 + off}" y2="${y}" stroke="#ffe7a0" stroke-width="5" stroke-linecap="round" opacity="${0.5 * rays}"/>`; }
  if (showOrbit) s += `<circle cx="${EC.x}" cy="${EC.y}" r="${EC.R}" fill="none" stroke="#5a6a90" stroke-width="4" stroke-dasharray="10 14" opacity="${showOrbit}"/>`;
  s += earth(EC.x, EC.y, 80);
  const mx = EC.x + Math.cos(th) * EC.R, my = EC.y + Math.sin(th) * EC.R;
  if (eye > 0) s += g(`<line x1="${EC.x}" y1="${EC.y}" x2="${mx}" y2="${my}" stroke="#9fb6e6" stroke-width="5" stroke-dasharray="8 10"/>`, { o: eye });
  s += moonSpace(mx, my, 46);
  return s;
}
const elong = th => th - Math.PI; // 太陽（左）からのはなれ
// 右がわの「地球から見ると」まど
const viewBox = (e, o = 1, x = 1530, y = 480) => g(`<circle r="210" fill="#0d1322" stroke="#6b7ba3" stroke-width="6"/>` + moonPhase(0, 0, 150, e) + text(0, -250, 'ちきゅうから みると', { size: 40, w: 900, fill: '#e6ecfa' }), { x, y, o });

// 1. つかみ：三日月 → 満月
SCENES.push({
  id: 'hook', night: true,
  draw(t) {
    let out = nightBG() + town();
    const e = t < cue(1) - 0.3 ? 0.9 : lerp(0.9, Math.PI, eio(prog(t, cue(1) - 0.3, 1.2)));
    const roll = t > cue(2) ? (t - cue(2)) * 0.9 : 0;
    const ee = e + roll;
    out += pop(moonPhase(0, 0, 170, ee), t, cue(0) - 0.2, 960, 380);
    out += g(text(0, 0, 'みかづき', { size: 56, w: 900, fill: '#fff3c4' }), { x: 960, y: 640, o: win(t, cue(0), cue(1) - 0.3, 0.3) });
    out += g(text(0, 0, 'まんげつ', { size: 56, w: 900, fill: '#fff3c4' }), { x: 960, y: 640, o: win(t, cue(1) + 0.4, cue(2) + 0.2, 0.3) });
    const sT = talking('S');
    out += pop(`<g transform="scale(0.56)">${sister(NOW.t, { pose: sT ? 'point' : 'stand', eyes: 'wide', mouth: sT ? 'open' : 'smile', talk: sT, look: [6, -9] })}</g>`, t, cue(2) + 0.6, 300, 850);
    out += sayBubble('S', 460, 520, { tail: 'left' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.yellow }), { x: 1260, y: 260, o: win(t, cue(4), cueE(4) + 0.6, 0.3) });
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.ochre}">月</tspan>は、</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.blueUi}">形</tspan>が かわる？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      let row = '';
      [0.7, 1.6, Math.PI, 4.7, 5.6].forEach((e2, i) => { row += moonPhase(-360 + i * 180, 0, 60, e2, { glow: 0, dark: '#cfd3dc' }); });
      out += pop(row, t, t0 + 1.8, 960, 830);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'つきの かたちが かわるのは どうして？', { size: 68, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'ちきゅうの かげが、つきに かかる'], ['②', 'てらされた めんの みえかたが かわる'], ['③', 'つきが けずれて、また おおきく なる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(`<circle r="120" fill="${MN.space}"/>` + moonPhase(0, 0, 80, 1.3 + Math.sin(t) * 0.5, { glow: 0 }) + text(110, -110, '？', { size: 90, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 330);
    out += pop(`<g transform="scale(0.5)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', look: [-5, -7] })}</g>`, t, 0.0, 1690, 850, { d: 0.4 });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1520, y: 720, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 月は光らない、太陽の光をはね返す
SCENES.push({
  id: 'light', night: true,
  draw(t) {
    let out = spaceBG();
    const sunO = prog(t, cue(1) - 0.2, 0.5);
    out += g(sunL(-40, 480, 220), { o: sunO });
    const litK = prog(t, cue(1) + 0.4, 1.0);
    // 月（大きく）
    out += `<circle cx="1180" cy="480" r="230" fill="${MN.dark}"/>`;
    out += g(`<path d="M 1180 250 A 230 230 0 0 0 1180 710 Z" fill="${MN.lit}"/>`, { o: litK });
    out += g(text(0, 0, 'じぶんでは ひからない', { size: 50, w: 900, fill: '#e6ecfa' }), { x: 1180, y: 820, o: win(t, cue(0) + 0.4, cue(1), 0.3) });
    // 光の線とはね返り
    if (sunO > 0) for (let i = 0; i < 5; i++) {
      const y = 330 + i * 75, p = ((t * 0.7 + i * 0.2) % 1);
      const x1 = 200, x2 = 1180 - Math.sqrt(230 * 230 - (y - 480) * (y - 480));
      const px = lerp(x1, x2, Math.min(1, p * 1.6));
      out += `<line x1="${x1}" y1="${y}" x2="${px}" y2="${y}" stroke="#ffe7a0" stroke-width="6" stroke-linecap="round" opacity="${0.7 * sunO}"/>`;
      if (p > 0.62) { const q = (p - 0.62) / 0.38; out += `<line x1="${x2}" y1="${y}" x2="${x2 - 200 * q}" y2="${y + (y - 480) * q * 0.8}" stroke="#fff6cc" stroke-width="5" stroke-linecap="round" opacity="${(1 - q) * sunO}"/>`; }
    }
    out += g(badge('はねかえして ひかる', { fill: C.ochre, size: 46 }), { x: 560, y: 270, o: prog(t, cue(1) + 1.4, 0.3) });
    out += g(badge('たいようの ほうの はんぶんが あかるい', { fill: '#3d5a8a', size: 44 }), { x: 1180, y: 160, o: prog(t, cue(2) + 1.0, 0.3) });
    out += g(text(0, 0, 'たいよう', { size: 50, w: 900, fill: '#ffe7a0' }), { x: 140, y: 760, o: sunO });
    return out;
  },
});

// 4. 地球のまわりを回る
SCENES.push({
  id: 'orbit', night: true,
  draw(t) {
    const th = Math.PI * 0.75 + t * 0.32;
    let out = orbitView(t, th, { showOrbit: prog(t, cue(0) + 0.4, 0.6) });
    out += callout(EC.x - 40, EC.y + 70, 520, 760, 'ちきゅう', prog(t, cue(0) + 0.6, 0.3), { col: '#9fc6ff', size: 44, bg: MN.space2 });
    out += g(arrow2(EC.x + 200, EC.y - 230, EC.x + 260, EC.y - 160, '#9fb6e6', 8), { o: prog(t, cue(0) + 1.0, 0.3) });
    out += g(`<rect x="-200" y="-80" width="400" height="160" rx="24" fill="${MN.space2}" stroke="#6b7ba3" stroke-width="4"/>` + text(0, -24, '1しゅう', { size: 40, w: 900, fill: '#cfd8ef' }) + text(0, 32, '27にちと すこし', { size: 50, w: 900, fill: C.yellow }), { x: 1530, y: 300, o: prog(t, cue(1) + 0.4, 0.3) });
    out += g(badge('ならびかたが かわる', { fill: '#3d5a8a', size: 44 }), { x: 1530, y: 560, o: prog(t, cue(2) + 1.0, 0.3) });
    return out;
  },
});

// 5. 新月・半月・満月
SCENES.push({
  id: 'phases', night: true,
  draw(t) {
    // 0〜cue(1) 新月、cue(1)〜cue(2) 半月、cue(2)〜 満月（動きながら移る）
    const seg = (a, b, s0, d = 1.6) => lerp(a, b, eio(prog(t, s0, d)));
    let th = Math.PI;
    th = seg(th, Math.PI * 1.5, cue(1) - 0.4);
    th = t > cue(2) - 0.4 ? seg(Math.PI * 1.5, Math.PI * 2, cue(2) - 0.4) : th;
    let out = orbitView(t, th, { eye: 1 });
    out += viewBox(elong(th), prog(t, cue(0) + 1.4, 0.4));
    const nm = [['しんげつ', cue(0) + 3.0, cue(1) - 0.4], ['はんげつ', cue(1) + 1.6, cue(2) - 0.4], ['まんげつ', cue(2) + 1.8, 1e9]];
    nm.forEach(([s, a, b]) => { out += g(badge(s, { fill: C.ochre, size: 50 }), { x: 1530, y: 760, o: win(t, a, b, 0.3) }); });
    out += g(text(0, 0, 'みえない', { size: 44, w: 900, fill: '#cfd8ef' }), { x: 1530, y: 480, o: win(t, cue(0) + 3.2, cue(1) - 0.4, 0.3) });
    out += g(badge('たいようと おなじ ほう', { fill: '#3d5a8a', size: 38 }), { x: 520, y: 200, o: win(t, cue(0) + 0.6, cue(1) - 0.4, 0.3) });
    out += g(badge('たいようと ちょっかく', { fill: '#3d5a8a', size: 38 }), { x: 520, y: 200, o: win(t, cue(1) + 0.4, cue(2) - 0.4, 0.3) });
    out += g(badge('たいようと はんたい', { fill: '#3d5a8a', size: 38 }), { x: 520, y: 200, o: prog(t, cue(2) + 0.4, 0.3) });
    const bT = talking('B');
    if (t > cue(3) - 1.0) {
      out += pop(`<g transform="scale(0.44)">${brother(NOW.t, { pose: bT ? 'cheer' : 'stand', eyes: 'smile', mouth: 'open', hop: bT ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, cue(3) - 0.8, 1810, 860);
      out += sayBubble('B', 1720, 600, { tail: 'right' });
    }
    return out;
  },
});

// 6. 29.5日（地球も進む）
SCENES.push({
  id: 'cycle', night: true,
  draw(t) {
    let out = spaceBG() + sunL(960, 980, 150);
    const mv = eio(prog(t, cue(1) + 1.0, 3.0));
    // 地球の通り道（太陽のまわり）
    out += `<path d="M 260 640 Q 960 120 1660 640" fill="none" stroke="#5a6a90" stroke-width="4" stroke-dasharray="10 14"/>`;
    const P = k => { const x = lerp(560, 1360, k), y = 980 - Math.sqrt(Math.max(0, 760 * 760 - (x - 960) * (x - 960))) * 0.86; return [x, y]; };
    const [ex, ey] = P(lerp(0.15, 0.85, mv));
    const sunDir = Math.atan2(980 - ey, 960 - ex);
    out += earth(ex, ey, 50);
    out += `<circle cx="${ex}" cy="${ey}" r="150" fill="none" stroke="#5a6a90" stroke-width="3" stroke-dasharray="6 10"/>`;
    // 月：はじめは新月の位置。1周（27日）でもとの向きにもどるが、太陽の方向がずれている
    const [ex0, ey0] = P(0.15), sd0 = Math.atan2(980 - ey0, 960 - ex0);
    const mAng = sd0 + mv * Math.PI * 2 + (t > cue(1) + 4.2 ? eio(prog(t, cue(1) + 4.2, 1.2)) * (sunDir - sd0) : 0);
    out += g(`<g transform="translate(${ex + Math.cos(mAng) * 150} ${ey + Math.sin(mAng) * 150}) rotate(${sunDir * 180 / Math.PI})"><circle r="26" fill="${MN.dark}"/><path d="M 0 -26 A 26 26 0 0 1 0 26 Z" fill="${MN.lit}"/></g>`, {});
    if (mv > 0.98) out += `<line x1="${ex}" y1="${ey}" x2="960" y2="980" stroke="#ffe7a0" stroke-width="4" stroke-dasharray="8 10" opacity="0.6"/>`;
    out += g(`<rect x="-260" y="-90" width="520" height="180" rx="24" fill="${MN.space2}" stroke="#6b7ba3" stroke-width="4"/>` + text(0, -30, 'しんげつ → しんげつ', { size: 40, w: 900, fill: '#cfd8ef' }) + text(0, 34, 'やく 29.5にち', { size: 60, w: 900, fill: C.yellow }), { x: 960, y: 170, o: prog(t, cue(0) + 0.6, 0.3) });
    out += g(badge('1しゅう 27にちと すこし', { fill: '#3d5a8a', size: 38 }), { x: 380, y: 160, o: prog(t, cue(1) + 0.6, 0.3) });
    out += g(badge('ちきゅうも すすむ', { fill: '#3d8a5a', size: 40 }), { x: 1540, y: 160, o: prog(t, cue(1) + 1.6, 0.3) });
    out += g(badge('もう すこし まわる', { fill: C.ochre, size: 40 }), { x: ex - 340, y: ey + 200, o: prog(t, cue(1) + 4.4, 0.3) });
    return out;
  },
});

// 7. 影じゃない（月食とのちがい）
SCENES.push({
  id: 'shadow', night: true,
  draw(t) {
    let out = nightBG('#111a2e', '#25324f');
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      let a = moonPhase(960, 470, 200, 1.4);
      a += `<circle cx="${960 - 330}" cy="470" r="360" fill="#0b0f1a" opacity="0.0"/>`;
      a += g(text(0, 0, 'ちきゅうの かげ？', { size: 54, w: 900, fill: '#e6ecfa' }), { x: 960, y: 170, o: prog(t, cue(0) + 0.4, 0.3) });
      a += g(cross(960, 470, 2.2), { o: prog(t, cue(0) + 2.0, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.4);
    if (bO > 0) {
      // 月食
      const sh = lerp(-520, -270, eio(prog(t, cue(1) + 0.6, 2.0)));
      let b = `<clipPath id="ecl"><circle cx="560" cy="440" r="170"/></clipPath><circle cx="560" cy="440" r="170" fill="${MN.lit}"/><g clip-path="url(#ecl)"><circle cx="${560 + sh}" cy="440" r="330" fill="#7a3a2a" opacity="0.92"/></g>`;
      b += text(560, 690, 'げっしょく', { size: 54, w: 900, fill: '#ffd6c4' });
      b += g(text(560, 760, 'かげの ふちは いつも まるい', { size: 38, w: 900, fill: '#cfd8ef' }), { o: prog(t, cue(2) + 1.0, 0.3) });
      // 満ち欠け
      const e = t > cue(2) ? lerp(1.0, Math.PI / 2, eio(prog(t, cue(2) + 0.6, 3.6))) : 1.0;
      b += moonPhase(1360, 440, 170, e, { glow: 0.6 });
      b += text(1360, 690, 'みちかけ', { size: 54, w: 900, fill: '#fff3c4' });
      b += g(text(1360, 760, 'はんげつは まっすぐ', { size: 38, w: 900, fill: '#cfd8ef' }), { o: prog(t, cue(2) + 4.2, 0.3) });
      b += g(`<line x1="1360" y1="250" x2="1360" y2="630" stroke="${C.ochre}" stroke-width="6" stroke-dasharray="14 10"/>`, { o: prog(t, cue(2) + 4.4, 0.3) });
      b += g(badge('べつの しくみ', { fill: C.redUi, size: 44 }), { x: 960, y: 150, o: prog(t, cue(1) + 2.6, 0.3) });
      out += g(b, { o: bO });
    }
    const kO = prog(t, cue(3) - 0.6, 0.4);
    if (kO > 0) {
      out += g(chameleon(NOW.t, { holdLens: true, mouth: lineOf('K') ? 'open' : 'smile' }), { x: 960, y: 860, s: 0.55, o: kO });
      out += sayBubble('K', 1040, 640, { tail: 'left' });
    }
    return out;
  },
});

// 8. 光る側は太陽のほう（夕方の西）
SCENES.push({
  id: 'side', night: true,
  draw(t) {
    let out = `<linearGradient id="dusk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b2540"/><stop offset="0.6" stop-color="#3a3f6a"/><stop offset="1" stop-color="#c8704a"/></linearGradient><rect width="1920" height="1080" fill="url(#dusk)"/>`;
    out += `<radialGradient id="sunset" cx="1" cy="0.85" r="0.6"><stop offset="0" stop-color="#ffb060" stop-opacity="0.9"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient><rect width="1920" height="1080" fill="url(#sunset)"/>`;
    out += town('#141a2a');
    out += g(text(0, 0, 'にし', { size: 50, w: 900, fill: '#ffe2c4' }), { x: 1760, y: 640 });
    out += g(text(0, 0, 'ひがし', { size: 50, w: 900, fill: '#cfd8ef' }), { x: 160, y: 640 });
    // 地平線の下の太陽（矢印で）
    out += g(arrow2(1450, 520, 1720, 760, '#ffd36b', 8) + text(1880, 450, 'たいよう（しずんだ）', { size: 36, w: 900, fill: '#ffe7a0', anchor: 'end' }), { o: prog(t, cue(0) + 1.2, 0.4) });
    // 三日月：光る側が右下（太陽のほう）
    out += `<g transform="translate(1320 440) rotate(35)">${moonPhase(0, 0, 120, 1.1)}</g>`;
    out += g(badge('ひかる がわ → たいようの ほう', { fill: C.ochre, size: 42 }), { x: 760, y: 200, o: prog(t, cue(0) + 2.0, 0.3) });
    out += g(badge('ゆうがたは にしがわが ひかる', { fill: '#3d5a8a', size: 42 }), { x: 760, y: 300, o: prog(t, cue(1) + 1.6, 0.3) });
    return out;
  },
});

// 9. 昼の月
SCENES.push({
  id: 'day',
  draw(t) {
    let out = `<linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f9be0"/><stop offset="1" stop-color="#cde8fa"/></linearGradient><rect width="1920" height="1080" fill="url(#dsky)"/>`;
    out += cloud(500, 260, 0.8) + cloud(1400, 180, 0.6);
    out += `<path d="M 0 840 Q 480 790 960 830 T 1920 820 L 1920 1080 L 0 1080 Z" fill="#7cc06a"/>`;
    out += house(1200, 860, 0.8) + tree(1500, 860, 0.9) + tree(300, 860, 0.8);
    const up = eio(prog(t, cue(0) + 0.4, 3.0));
    // 半月（右が光る）、うすく白い
    out += g(`<circle r="110" fill="#9cc6ec" opacity="0.4"/><path d="M 0 -110 A 110 110 0 0 1 0 110 Z" fill="#f6f8fb" opacity="0.9"/>`, { x: lerp(260, 600, up), y: lerp(780, 420, up) });
    out += g(text(0, 0, 'ひがし', { size: 50, w: 900, fill: '#2f5a7a' }), { x: 160, y: 950 });
    out += g(text(0, 0, 'にし', { size: 50, w: 900, fill: '#2f5a7a' }), { x: 1760, y: 950 });
    out += g(badge('ひるごろ ひがしから のぼる', { fill: '#2f5a7a', size: 42 }), { x: 960, y: 140, o: prog(t, cue(0) + 1.0, 0.3) });
    out += g(badge('ごごの あおぞらにも みえる', { fill: C.accent, size: 42 }), { x: 960, y: 240, o: prog(t, cue(0) + 3.0, 0.3) });
    // 昼と夜の時間
    const bO = prog(t, cue(1) + 0.4, 0.4);
    out += g(`<rect x="-300" y="-110" width="600" height="220" rx="30" fill="#ffffffdd"/>` + sunDisc(-170, -10, 40, 0, { glow: 0.3 }) + text(-170, 70, 'ひる', { size: 40, w: 900 }) +
      `<path d="M 170 -50 A 50 50 0 1 0 170 30 A 38 38 0 1 1 170 -50 Z" fill="${C.ochre}" transform="translate(20 0)"/>` + text(170, 70, 'よる', { size: 40, w: 900 }) + text(0, -10, '≒', { size: 90, w: 900, fill: C.redUi }), { x: 1400, y: 470, o: bO });
    return out;
  },
});

// 10. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1300, 170) + `<circle cx="-560" cy="0" r="50" fill="${C.accent}"/>` + text(-560, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-480, 2, 'てらされた めんの みえかたが かわる', { size: 54, w: 900, anchor: 'start' }), t, 0.4, 960, 300);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="70" fill="none" stroke="${C.red}" stroke-width="12"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 400, y: 300, o: ring, s: Math.max(back(ring), 0.001) });
      let row = `<rect x="-560" y="-90" width="1120" height="180" rx="40" fill="${MN.space}"/>`;
      [0.5, 1.2, Math.PI / 2, 2.4, Math.PI, 3.9, 4.7, 5.6].forEach((e2, i) => { row += moonPhase(-470 + i * 134, 0, 52, e2, { glow: 0 }); });
      a += pop(row, t, 2.4, 960, 580);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 170);
      const warn = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
      const items = [
        [`<circle r="56" fill="${MN.space}"/>` + moonPhase(0, 0, 40, 1.2, { glow: 0 }), 'ひかって いる がわは どっち？ よそうしてから', C.ink, cue(1)],
        [`<circle r="56" fill="${MN.space}"/>` + moonPhase(0, 0, 40, Math.PI / 2, { glow: 0 }) + `<line x1="0" y1="-46" x2="0" y2="46" stroke="${C.ochre}" stroke-width="4" stroke-dasharray="6 5"/>`, 'はんげつの かけぎわは まっすぐ？', C.ink, cue(2)],
        [warn, 'たいようは ぜったいに みない', C.red, cue(3)],
      ];
      items.forEach(([ic, s, col, st], i) => { b += pop(ic + text(110, 2, s, { size: 46, w: 900, anchor: 'start', fill: col }), t, st, 230, 340 + i * 150); });
      b += pop(chameleon(NOW.t, { holdLens: true }), t, cue(1) + 0.8, 1660, 820, { s: 0.75 });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 11. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「つき」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    out += pop(`<g transform="scale(0.52)">${sister(NOW.t, { pose: 'wave', eyes: 'smile', mouth: 'open', talk: talking('S') })}</g>`, t, 0.8, 150, 1060, { d: 0.45 });
    out += pop(`<g transform="scale(0.52)">${brother(NOW.t + 1, { pose: 'cheer', eyes: 'smile', mouth: 'open', hop: talking('B') ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, 1.0, 310, 1060, { d: 0.45 });
    out += pop(chameleon(NOW.t, { holdLens: true }), t, 1.2, 1660, 1040, { s: 0.7 });
    out += sayBubble('S', 150, 610, { size: 44 }) + sayBubble('B', 250, 730, { size: 44 });
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

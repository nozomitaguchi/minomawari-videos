// ---------- うみの道具 ----------
const SEA = { top: '#49a8dc', deep: '#1f6fa8', floor: '#d2b888', rock: '#9b9388', rockD: '#6f695f', grass: '#7fc27a', river: '#3f9fe0' };
// 塩のつぶ（白いひしがた。ほんとうは水にとけて目に見えない）
const saltDot = (x, y, r = 8, o = 1) => `<rect x="${(x - r).toFixed(1)}" y="${(y - r).toFixed(1)}" width="${r * 2}" height="${r * 2}" rx="${r * 0.25}" transform="rotate(45 ${x.toFixed(1)} ${y.toFixed(1)})" fill="#fff" stroke="#56788f" stroke-width="${Math.max(1.6, r * 0.3)}" opacity="${o}"/>`;
// 折れ線の上の点（f = 0〜1、長さで進む）と、折れ線の長さ
const plen = P => P.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - P[i][0], p[1] - P[i][1]), 0);
function along(P, f) {
  let d = clamp(f) * plen(P);
  for (let i = 1; i < P.length; i++) {
    const s = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (d <= s || i === P.length - 1) { const k = s ? clamp(d / s) : 0; return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; }
    d -= s;
  }
  return P[0];
}
const yOn = (P, x) => { for (let i = 1; i < P.length; i++) if (x <= P[i][0]) return lerp(P[i - 1][1], P[i][1], clamp((x - P[i - 1][0]) / (P[i][0] - P[i - 1][0]))); return P[P.length - 1][1]; };
const pstr = P => P.map(p => p.join(' ')).join(' L ');
// 矢印
const arrow = (x1, y1, x2, y2, col, w = 14, o = 1) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.4, bx = x2 - Math.cos(a) * h, by = y2 - Math.sin(a) * h;
  return `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${x2} ${y2} L ${bx - Math.sin(a) * h * 0.7} ${by + Math.cos(a) * h * 0.7} L ${bx + Math.sin(a) * h * 0.7} ${by - Math.cos(a) * h * 0.7} Z" fill="${col}" stroke="${col}" stroke-width="4" stroke-linejoin="round"/></g>`;
};
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 }) + `</g>`;
// コップ（中心 0,0、高さ 200）。[水, ふち] を返す
const gxl = y => -70 + (y + 100) / 200 * 14;
function glass(lvl, col = '#7cc4ea') {
  const top = -100 + 192 * (1 - lvl);
  const w = lvl > 0.005 ? `<path d="M ${gxl(top)} ${top} L ${-gxl(top)} ${top} L ${-gxl(92)} 92 Q 56 100 46 100 L -46 100 Q -56 100 ${gxl(92)} 92 Z" fill="${col}"/>` : '';
  const rim = `<path d="M -70 -100 L -56 92 Q -56 100 -46 100 L 46 100 Q 56 100 56 92 L 70 -100" fill="#eaf4fa" fill-opacity="0.22" stroke="#7fa7bd" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M -52 -78 L -45 50" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`;
  return [w, rim];
}
// 山 → 川 → 海 の断面
const GP = [[0, 420], [150, 330], [330, 200], [470, 300], [620, 410], [800, 500], [985, 562]];   // 地面
const FP = [[985, 562], [1110, 700], [1320, 780], [1920, 792]];                                  // 海の底
const RV = [[420, 264], [470, 300], [620, 410], [800, 500], [985, 562]];                         // 川
const seaPos = i => { const x = 1090 + rnd(i, 21) * 790; return [x, lerp(598, yOn(FP, x) - 24, rnd(i, 22))]; };
function land(t, { cloudX = 400, cloudY = 130, cloudO = 0, rain = 0, sun = 1, seaDots = 0, riverDots = 0, flash = 0, seaCol = SEA.top } = {}) {
  let o = `<linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3f3"/><stop offset="0.6" stop-color="#e3f3fc"/></linearGradient><rect width="1920" height="1080" fill="url(#lsky)"/>`;
  if (sun > 0) o += g(sunDisc(1790, 110, 60, 0), { o: sun });
  // 海
  o += `<linearGradient id="lsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${seaCol}"/><stop offset="0.5" stop-color="${SEA.deep}"/></linearGradient>`;
  const wave = Array.from({ length: 20 }, (_, i) => `${(985 + i * 935 / 19).toFixed(0)} ${(562 + Math.sin(t * 2 + i * 0.9) * 4).toFixed(1)}`).join(' L ');
  o += `<path d="M ${wave} L 1920 1080 L 985 1080 Z" fill="url(#lsea)"/>`;
  // 木と家
  o += tree(705, 452, 0.34) + tree(872, 528, 0.28, '#4d9a52') + house(930, 546, 0.3);
  // 陸と海の底
  o += `<path d="M 0 1080 L ${pstr(GP.concat(FP.slice(1)))} L 1920 1080 Z" fill="${SEA.floor}"/>`;
  o += `<path d="M 0 1080 L 0 420 L 150 330 L 330 200 L 470 300 L 600 395 L 800 1080 Z" fill="${SEA.rock}"/>`;
  o += `<path d="M 540 351 L 620 410 L 800 500 L 985 562 L 1010 590 L 940 614 L 800 566 L 620 476 L 548 424 Z" fill="${SEA.grass}"/>`;
  o += `<path d="M 330 200 L 296 340 L 372 452 M 150 330 L 196 480 M 330 200 L 404 350 M 40 470 L 96 600" stroke="${SEA.rockD}" stroke-width="7" fill="none" opacity="0.45" stroke-linecap="round" stroke-linejoin="round"/>`;
  // 川
  o += `<path d="M ${pstr(RV)}" fill="none" stroke="${SEA.river}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${pstr(RV)}" fill="none" stroke="#d3eefc" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 44" stroke-dashoffset="${(-t * 110).toFixed(1)}" opacity="0.9"/>`;
  // 雲と雨
  if (cloudO > 0) {
    if (rain > 0) for (let i = 0; i < 28; i++) {
      const x = cloudX - 125 + rnd(i, 31) * 250, gy = x > 985 ? 562 : yOn(GP, x), y = lerp(cloudY + 30, gy, (t * 1.25 + rnd(i, 32)) % 1);
      o += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - 5).toFixed(1)}" y2="${(y + 22).toFixed(1)}" stroke="#3f8fd0" stroke-width="5" stroke-linecap="round" opacity="${0.85 * rain * cloudO}"/>`;
    }
    o += cloud(cloudX, cloudY, 1.1, mix('#ffffff', '#b4c2cf', rain * 0.8), cloudO);
  }
  // 塩のつぶ（川を流れる）
  if (riverDots > 0) for (let i = 0; i < 7; i++) { const [x, y] = along(RV, (t * 0.13 + i / 7) % 1); o += saltDot(x, y - 3, 7, riverDots); }
  // 塩のつぶ（海にたまる）
  for (let i = 0; i < Math.ceil(seaDots); i++) {
    const [x, y] = seaPos(i), k = clamp(seaDots - i);
    o += saltDot(x, y + Math.sin(t * 1.4 + i) * 4, 8 * (1 + 0.45 * flash * Math.abs(Math.sin(t * 6 + i * 0.4))), k);
  }
  return o;
}
// 指し線つきのラベル
const tagAt = (t, st, x, y, str, col, px, py, { end = 1e9, size = 42 } = {}) =>
  pop(`<line x1="0" y1="0" x2="${px - x}" y2="${py - y}" stroke="${col}" stroke-width="6" stroke-linecap="round"/><circle cx="${px - x}" cy="${py - y}" r="11" fill="${col}"/>` + badge(str, { fill: col, size }), t, st, x, y, { end });

// 1. つかみ：海はしょっぱいのに、川も雨もしょっぱくない
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = land(t, { cloudX: 300, cloudY: 120, cloudO: prog(t, cue(2) - 0.7, 0.6), rain: prog(t, cue(2) - 0.1, 0.5) });
    const hide = cue(4) - 0.2;
    out += tagAt(t, cue(0) + 1.6, 1440, 410, 'うみの みず：しょっぱい', C.blueUi, 1440, 620, { end: hide });
    out += tagAt(t, cue(1) + 1.6, 1000, 290, 'かわの みず：しょっぱくない', C.accent, 716, 462, { end: hide });
    out += tagAt(t, cue(2) + 0.6, 760, 150, 'あめ：しょっぱくない', '#5b7f99', 420, 200, { end: hide });
    out += topBadge();
    out += kidShow('S', t, 130, 1000, { s: 0.5, start: 0.4, n: 0, look: [8, -4] });
    // 川のコップ と 海のコップ
    const cO = win(t, cue(4), cueE(4) + 0.5, 0.4);
    if (cO > 0) {
      let c = card(900, 380);
      const [w1, r1] = glass(0.78, '#a9dcf5'), [w2, r2] = glass(0.78, '#58aee0');
      c += g(w1 + r1, { x: -250, y: -30, s: 1.0 }) + g(w2 + r2, { x: 250, y: -30, s: 1.0 });
      c += text(-250, 130, 'かわの みず', { size: 42, w: 900 }) + text(250, 130, 'うみの みず', { size: 42, w: 900 });
      c += text(-250, -158, 'しょっぱくない', { size: 34, w: 900, fill: C.accent }) + text(250, -158, 'しょっぱい', { size: 34, w: 900, fill: C.blueUi });
      c += text(0, -30, '？', { size: 110, w: 900, fill: C.ochre });
      out += g(c, { x: 1180, y: 330 - (1 - eo(prog(t, cue(4), 0.5))) * 40, o: cO });
    }
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 280);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blue}">海の 水</tspan>は、</text>`, { x: 960, y: 470, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.redUi}">しょっぱい</tspan>の？</text>`, { x: 960, y: 650, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const [w2, r2] = glass(0.78, '#58aee0');
      let ic = w2; for (let i = 0; i < 7; i++) ic += saltDot(-36 + rnd(i, 3) * 72, -30 + rnd(i, 4) * 100, 7);
      out += pop(g(ic + r2, { s: 0.62 }), t, t0 + 1.8, 960, 850);
    }
    return out;
  },
});

// 2. 予想（正解は2番）
const OPTS = [['①', 'うみの いきものが、しおを だしている'], ['②', 'やまの いわの しおを、かわが はこぶ'], ['③', 'うみの そこに、しおの かたまりが ある']];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'うみは どうして しょっぱい？', { size: 80, w: 900 }), t, 0.3, 900, 210);
    const cur = curLine();
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 390 + i * 168);
    });
    out += kidShow('B', t, 1730, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1640, y: 230, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 海の水には塩がとけている（1キログラムに およそ35グラム）
SCENES.push({
  id: 'salt',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const e0 = cue(1) + 2.4, evR = prog(t, e0, 3.4), ev = eio(evR), lvl = lerp(0.8, 0, ev);
    const GX = 610, GY = 500, GS = 2.3, top = -100 + 192 * (1 - lvl);
    const [w, rim] = glass(lvl, mix('#58aee0', '#8fcdee', ev));
    let gl = w;
    for (let i = 0; i < 24; i++) {
      const fx = -42 + rnd(i, 41) * 84, fy = -48 + rnd(i, 42) * 128 + Math.sin(t * 1.6 + i) * 3;
      const row = i < 10 ? 0 : i < 18 ? 1 : 2, n = [10, 8, 6][row], idx = i - [0, 10, 18][row];
      const px = (idx - (n - 1) / 2) * 9, py = 91 - row * 8, k = ev * ev;
      gl += saltDot(lerp(fx, px, k), lerp(Math.max(fy, top + 12), py, k), 5.2, prog(t, cue(0) + 0.5 + i * 0.05, 0.3));
    }
    // ゆげ（水が空へ出ていく）
    const stO = Math.sin(Math.PI * evR);
    if (stO > 0.01) for (let k = 0; k < 4; k++) {
      const x = -45 + k * 30, ph = t * 3 + k, y0 = -108 - ((t * 30 + k * 13) % 40);
      gl += `<path d="M ${x} ${y0} q ${8 * Math.sin(ph)} -10 0 -20 q ${-8 * Math.sin(ph)} -10 0 -20" fill="none" stroke="#9cc7de" stroke-width="5" stroke-linecap="round" opacity="${stO * 0.9}"/>`;
    }
    out += g(gl + rim, { x: GX, y: GY, s: GS, o: prog(t, 0.2, 0.4) });
    out += g(text(0, 0, 'うみの みず', { size: 54, w: 900 }), { x: 262, y: 300, o: prog(t, 0.4, 0.4) });
    out += g(card(600, 190) + text(0, -34, 'しおの つぶは、ほんとうは', { size: 40, w: 900, fill: C.muted }) + text(0, 34, 'めに みえないよ', { size: 40, w: 900, fill: C.muted }), { x: 1330, y: 480, o: win(t, cue(0) + 1.4, e0 + 2.6, 0.4) });
    out += pop(badge('しおが とけている', { fill: C.blueUi, size: 44 }), t, cue(0) + 1.0, GX, 792, { end: e0 + 2.6 });
    out += pop(badge('1キログラム', { fill: C.ochre, size: 40 }), t, cue(1) + 0.4, 262, 500, { end: e0 + 3.0 });
    out += g(badge('かわかすと…', { fill: '#7f95a6', size: 40 }), { x: 262, y: 400, o: win(t, e0 - 0.3, e0 + 3.0, 0.3) });
    // のこった塩
    const rs = e0 + 3.3;
    out += g(`<path d="M 700 700 Q 900 660 1010 470" fill="none" stroke="${C.ochre}" stroke-width="7" stroke-linecap="round" stroke-dasharray="4 16"/>`, { o: prog(t, rs, 0.4) });
    out += g(text(0, 0, 'のこった しおなど', { size: 48, w: 900 }), { x: 1330, y: 300, o: prog(t, rs, 0.4) });
    out += pop(badge('へいきんで およそ 35グラム', { fill: C.ochre, size: 48, pad: 40 }), t, rs + 0.3, 1330, 392);
    out += pop(badge('しおが のこった', { fill: C.blueUi, size: 44 }), t, rs + 0.1, GX, 792);
    // 台所の食塩
    const shaker = `<rect x="-52" y="-46" width="104" height="132" rx="24" fill="#fff" stroke="#7fa7bd" stroke-width="8"/><path d="M -44 20 L 44 20 L 44 62 Q 44 78 28 78 L -28 78 Q -44 78 -44 62 Z" fill="#eef0ea"/><path d="M -52 -40 Q -52 -92 0 -92 Q 52 -92 52 -40 Z" fill="#8fa0ad"/><circle cx="-20" cy="-66" r="5" fill="#fff"/><circle cx="0" cy="-74" r="5" fill="#fff"/><circle cx="20" cy="-66" r="5" fill="#fff"/>` + text(0, -8, 'しお', { size: 34, w: 900, fill: C.blueUi });
    out += pop(shaker, t, cue(2) + 0.2, 1100, 620, { s: 1.15 });
    out += g(text(0, 0, 'いちばん おおいのは', { size: 42, w: 900, anchor: 'start' }), { x: 1200, y: 580, o: prog(t, cue(2) + 0.6, 0.4) });
    out += g(text(0, 0, 'だいどころの しおの もと', { size: 50, w: 900, anchor: 'start', fill: C.blueUi }), { x: 1200, y: 656, o: prog(t, cue(2) + 1.6, 0.4) });
    return out;
  },
});

// 4. 塩のふるさと：雨が山の岩をほんの少しずつとかす
const RK = [[0, 560], [230, 380], [470, 250], [700, 330], [900, 500], [1130, 640], [1330, 850]];
const RKR = RK.slice(2);
SCENES.push({
  id: 'rock',
  draw(t) {
    let out = `<linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9cfe6"/><stop offset="0.7" stop-color="#e6f2f9"/></linearGradient><rect width="1920" height="1080" fill="url(#rsky)"/>`;
    const rn = prog(t, cue(1) - 0.3, 0.6);
    out += `<path d="M 1180 1080 L 1330 850 L 1920 820 L 1920 1080 Z" fill="${SEA.grass}"/>`;
    out += `<path d="M 0 1080 L ${pstr(RK)} L 1420 1080 Z" fill="${SEA.rock}"/>`;
    out += `<path d="M 470 250 L 420 520 L 560 780 M 700 330 L 730 600 L 900 830 M 230 380 L 290 650 M 900 500 L 1020 800" stroke="${SEA.rockD}" stroke-width="9" fill="none" opacity="0.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    // とけたあとのくぼみ
    const dk = prog(t, cue(2) + 0.8, 4.0);
    [0.12, 0.3, 0.47, 0.66, 0.84].forEach((f, i) => { const [x, y] = along(RKR, f), k = clamp(dk * 5 - i * 0.6); if (k > 0) out += `<ellipse cx="${x - 6}" cy="${y + 12}" rx="${26 * k}" ry="${11 * k}" fill="${SEA.rockD}" opacity="0.8" transform="rotate(34 ${x} ${y})"/>`; });
    // 岩をつたう水
    const wk = prog(t, cue(2) + 0.3, 1.8), WL = plen(RKR);
    if (wk > 0) out += `<path d="M ${pstr(RKR)}" fill="none" stroke="${SEA.river}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(WL * eo(wk)).toFixed(0)} ${WL.toFixed(0)}" opacity="0.9"/>`;
    // とけ出したつぶ（水といっしょに下へ）
    const d0 = cue(2) + 1.2;
    if (t > d0) for (let i = 0; i < 8; i++) {
      const age = t - d0 - i * 0.45; if (age < 0) continue;
      const f0 = [0.12, 0.3, 0.47, 0.66, 0.84, 0.2, 0.4, 0.58][i], f = f0 + ((age * 0.16) % (1.02 - f0));
      const [x, y] = along(RKR, f);
      out += saltDot(x, y - 4, 9, clamp(age * 3) * clamp((1.0 - f) * 12));
    }
    // 雲と雨
    for (let i = 0; i < 34; i++) {
      const x = 330 + rnd(i, 51) * 560, gy = yOn(RK, x), y = lerp(170, gy, (t * 1.2 + rnd(i, 52)) % 1);
      out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - 6).toFixed(1)}" y2="${(y + 26).toFixed(1)}" stroke="#3f8fd0" stroke-width="6" stroke-linecap="round" opacity="${0.85 * rn}"/>`;
    }
    out += cloud(600, 130, 1.5, mix('#ffffff', '#aebdca', rn * 0.85), 1) + cloud(380, 150, 1.0, mix('#ffffff', '#b9c6d2', rn * 0.85), 1);
    out += topBadge();
    // 問い
    out += g(text(0, 0, 'しおは どこから', { size: 68, w: 900 }) + text(0, 96, 'きたのかな？', { size: 68, w: 900 }), { x: 1440, y: 300, o: win(t, 0.4, cue(1) - 0.4, 0.35) });
    // 雨のしずくを大きくして見る
    const lO = win(t, cue(1) - 0.1, cue(3) - 0.3, 0.4);
    if (lO > 0) {
      const LX = 1480, LY = 360, R = 190;
      let l = `<line x1="${760 - LX}" y1="${330 - LY}" x2="${-R * 0.93}" y2="${-R * 0.3}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="6 12" stroke-linecap="round"/><circle cx="${760 - LX}" cy="${330 - LY}" r="26" fill="none" stroke="${C.blueUi}" stroke-width="6"/>`;
      l += `<circle r="${R}" fill="#f1f8fc" stroke="${C.blueUi}" stroke-width="14"/>`;
      l += `<path d="M 0 -130 C 40 -60 96 -10 96 50 A 96 96 0 0 1 -96 50 C -96 -10 -40 -60 0 -130 Z" fill="#62b4e6"/><path d="M -50 30 A 56 56 0 0 0 -14 104" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.8"/>`;
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2 + 0.4, k = eio(prog(t, cue(1) + 0.8 + i * 0.35, 1.2));
        const x0 = Math.cos(a) * 160, y0 = Math.sin(a) * 150, x1 = -50 + rnd(i, 61) * 100, y1 = -10 + rnd(i, 62) * 110;
        l += `<circle cx="${lerp(x0, x1, k) + Math.sin(t * 2 + i) * 3}" cy="${lerp(y0, y1, k) + Math.cos(t * 2.3 + i) * 3}" r="12" fill="#8d7fb8" stroke="#fff" stroke-width="3" opacity="${prog(t, cue(1) + 0.5 + i * 0.35, 0.3)}"/>`;
      }
      l += text(0, -R - 52, 'あめの しずく', { size: 46, w: 900 });
      out += g(l, { x: LX, y: LY, o: lO });
      out += pop(badge('くうきの ガスが すこし とけている', { fill: '#6f629c', size: 36 }), t, cue(1) + 1.6, 1470, 610, { end: cue(3) - 0.3 });
    }
    out += pop(badge('いわが ほんの すこしずつ とける', { fill: C.ink, size: 42 }), t, cue(2) + 1.6, 520, 790);
    out += kidShow('K', t, 1690, 880, { s: 0.7, start: cue(3) - 0.9, n: 0, bubble: false });
    out += talkBubble('K', 1420, 610, 1632, 764);
    return out;
  },
});

// 5. 川が海へ運ぶ。海の底の熱い水からも加わる
SCENES.push({
  id: 'river',
  draw(t) {
    const sd = lerp(0, 16, prog(t, cue(0) + 2.2, cueE(1) - cue(0) - 2.2));
    let out = land(t, { cloudX: 320, cloudY: 110, cloudO: 1, rain: 1, riverDots: prog(t, 0.3, 0.6), seaDots: sd });
    out += topBadge();
    out += tagAt(t, cue(0) + 1.0, 1010, 300, 'かわが うみへ はこぶ', C.accent, 720, 458, { end: cue(1) - 0.2 });
    out += g(text(0, 0, 'せかいじゅうの かわが はこぶ しお', { size: 46, w: 900 }), { x: 1180, y: 250, o: win(t, cue(1) + 0.3, cue(2) - 0.4, 0.4) });
    out += pop(badge('1ねんに およそ 40おくトン', { fill: C.ochre, size: 52, pad: 42 }), t, cue(1) + 2.8, 1180, 350, { end: cue(2) - 0.4 });
    out += g(text(0, 0, '（みつもり）', { size: 36, w: 700, fill: C.muted }), { x: 1180, y: 432, o: win(t, cue(1) + 3.4, cue(2) - 0.4, 0.4) });
    // 海の底：熱い水がふき出すところ
    const v0 = cue(2) - 0.4, vO = prog(t, v0, 0.6);
    if (vO > 0) {
      let u = `<linearGradient id="usea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a7fb5"/><stop offset="0.7" stop-color="#0f3f66"/></linearGradient><rect width="1920" height="1080" fill="url(#usea)"/>`;
      // ふき出す熱い水
      for (let i = 0; i < 16; i++) {
        const f = (t * 0.22 + i / 16) % 1, x = 960 + Math.sin(i * 2.3 + f * 4) * (16 + f * 110), y = lerp(500, 120, f);
        u += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(24 + f * 80).toFixed(1)}" fill="#ffd9a6" opacity="${((1 - f) * 0.5).toFixed(2)}"/>`;
      }
      // 海の底の岩と、下のマグマ
      u += `<path d="M 0 664 L 700 652 L 880 640 L 922 516 L 998 516 L 1040 640 L 1220 652 L 1920 664 L 1920 1080 L 0 1080 Z" fill="#5d5146"/>`;
      u += `<ellipse cx="960" cy="900" rx="560" ry="100" fill="#ff6a1e" opacity="0.95" filter="url(#glow)"/><ellipse cx="960" cy="930" rx="420" ry="70" fill="#ffb04a" opacity="0.9" filter="url(#soft)"/>`;
      u += `<path d="M 960 840 L 960 520" stroke="#ffb36b" stroke-width="30" stroke-linecap="round" opacity="0.85"/>`;
      // しみこむ海の水
      [-1, 1].forEach(sd2 => {
        const d = `M ${960 + sd2 * 470} 600 C ${960 + sd2 * 470} 760 ${960 + sd2 * 300} 800 ${960 + sd2 * 60} 800`;
        u += `<path d="${d}" fill="none" stroke="#9fd6f5" stroke-width="9" stroke-linecap="round" stroke-dasharray="20 22" stroke-dashoffset="${(-t * 60).toFixed(1)}"/>`;
        u += `<path d="M ${960 + sd2 * 44} 800 l ${sd2 * 34} -22 l 0 44 Z" fill="#9fd6f5"/>`;
      });
      // つぶ（まわりの岩からとけこんだもの）
      for (let i = 0; i < 10; i++) {
        const f = (t * 0.17 + i / 10) % 1;
        u += saltDot(960 + (rnd(i, 71) - 0.5) * f * 520, lerp(500, 170, f), 9, clamp((1 - f) * 4) * clamp(f * 8));
      }
      u += g(text(0, 0, 'うみの そこ', { size: 42, w: 900, fill: '#e8f1f6' }), { x: 250, y: 608, o: prog(t, v0 + 0.6, 0.4) });
      u += g(text(0, 0, 'しみこんだ うみの みず', { size: 36, w: 900, fill: '#cfeafa' }), { x: 300, y: 742, o: prog(t, v0 + 1.2, 0.4) });
      u += g(text(0, 0, 'マグマの ねつ', { size: 40, w: 900, fill: '#fff0d6' }), { x: 1600, y: 760, o: prog(t, v0 + 1.6, 0.4) });
      u += pop(badge('あつい みずが ふきだす', { fill: '#c8602c', size: 46 }), t, v0 + 1.0, 1440, 330);
      u += pop(badge('ここからも くわわる', { fill: C.blueUi, size: 46 }), t, cue(2) + 3.2, 470, 330);
      u += topBadge(true);
      out += g(u, { o: vO });
    }
    return out;
  },
});

// 6. どうして川はしょっぱくない？ 雨の新しい水がいつもたされる
SCENES.push({
  id: 'fresh',
  draw(t) {
    const rn = lerp(0.35, 1, prog(t, cue(1) - 0.3, 0.6));
    let out = g(land(t, { cloudX: 500, cloudY: 150, cloudO: 1, rain: rn, riverDots: 0, sun: 0 }), { x: 0, y: -70, s: 1.35 });
    // 川のつぶは少しだけ
    for (let i = 0; i < 3; i++) { const [x, y] = along(RV, (t * 0.16 + i / 3) % 1); out += saltDot(x * 1.35, (y - 3) * 1.35 - 70, 9); }
    out += topBadge();
    out += g(card(760, 190) + text(0, -36, 'かわは どうして', { size: 54, w: 900 }) + text(0, 40, 'しょっぱくないの？', { size: 54, w: 900 }), { x: 1400, y: 240, o: win(t, 0.4, cue(1) - 0.3, 0.4) });
    out += pop(badge('あめの あたらしい みずが', { fill: C.blueUi, size: 46 }), t, cue(1) + 0.4, 1400, 200);
    out += pop(badge('いつも たされる', { fill: C.blueUi, size: 46 }), t, cue(1) + 1.5, 1400, 296);
    out += tagAt(t, cue(1) + 2.8, 560, 720, 'かわの しおは ほんの すこし', C.accent, 890, 520, { size: 38 });
    return out;
  },
});

// 7. 海は塩を集める。水だけが空へ、塩はのこる
SCENES.push({
  id: 'evap',
  draw(t) {
    const c4 = cue(4);
    const sd = lerp(16, 44, eio(prog(t, 0.3, cue(1) - 0.3)));
    const cx = lerp(1400, 400, eio(prog(t, c4 + 1.3, 2.2)));
    let out = land(t, { cloudX: cx, cloudY: 130, cloudO: prog(t, c4 + 0.1, 0.9), rain: prog(t, c4 + 3.5, 0.5), riverDots: 1, seaDots: sd, flash: win(t, cue(2), cueE(2) + 0.3, 0.3) });
    // ほかの川からも
    const oO = win(t, 0.5, cue(1) - 0.2, 0.4);
    if (oO > 0) {
      for (let i = 0; i < 4; i++) { const f = (t * 0.3 + i / 4) % 1; out += saltDot(lerp(1915, 1700, f), 592 + Math.sin(i * 2) * 6 + f * 30, 8, oO * (1 - f)); }
      out += g(arrow(1900, 520, 1790, 560, C.accent, 10) + text(1880, 478, 'ほかの かわからも', { size: 34, w: 900, anchor: 'end', fill: C.accent }), { o: oO });
    }
    out += pop(badge('すべての かわから しおが あつまる', { fill: C.accent, size: 42 }), t, cue(0) + 0.6, 1300, 320, { end: cue(1) - 0.2 });
    // 蒸発：水だけが空へ
    const eO = win(t, cue(1) + 0.2, c4 + 1.6, 0.5);
    if (eO > 0) {
      [1200, 1420, 1640].forEach((x, i) => {
        const k = eo(prog(t, cue(1) + 0.5 + i * 0.3, 1.4)), y1 = lerp(540, 330, k);
        let d = `M ${x} 540`; for (let y = 540; y > y1; y -= 10) d += ` L ${(x + Math.sin((540 - y) / 34 + t * 2.4) * 16).toFixed(1)} ${y}`;
        const xe = x + Math.sin((540 - y1) / 34 + t * 2.4) * 16;
        out += `<g opacity="${eO}"><path d="${d}" fill="none" stroke="#6fb9ea" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${xe} ${y1 - 30} L ${xe - 24} ${y1 + 4} L ${xe + 24} ${y1 + 4} Z" fill="#6fb9ea"/></g>`;
        for (let j = 0; j < 3; j++) { const f = (t * 0.45 + j / 3 + i * 0.2) % 1; out += `<circle cx="${x + 44 + Math.sin(f * 7 + i) * 10}" cy="${lerp(548, 340, f)}" r="7" fill="#8fcff5" opacity="${eO * Math.sin(Math.PI * f) * prog(t, cue(1) + 1.0, 0.5)}"/>`; }
      });
      out += pop(badge('みずだけ そらへ（じょうはつ）', { fill: C.blueUi, size: 44 }), t, cue(1) + 1.8, 1400, 250, { end: c4 + 0.8 });
    }
    out += pop(badge('しおは うみに のこる', { fill: C.ochre, size: 44 }), t, cue(2) + 0.2, 1500, 796);
    // めぐる水
    out += pop(badge('くもに なって', { fill: '#7f95a6', size: 38 }), t, c4 + 1.0, 1130, 250, { end: c4 + 3.4 });
    out += pop(badge('あめに なって、また かわへ', { fill: C.blueUi, size: 40 }), t, c4 + 3.6, 1000, 300);
    out += topBadge();
    out += kidShow('B', t, 250, 960, { s: 0.56, start: cue(3) - 0.9, n: 0, look: [8, -4] });
    return out;
  },
});

// 8. できたばかりの海 → 今の海。入る塩と つもる塩が だいたい同じ
const BAL_FLOOR = 770, BAL_TOP = 330;
const balPos = i => [540 + rnd(i, 81) * 1320, lerp(BAL_TOP + 44, BAL_FLOOR - 30, rnd(i, 82))];
SCENES.push({
  id: 'balance',
  draw(t) {
    const age = eio(prog(t, cue(1) + 0.3, cueE(1) - cue(1) - 0.6));
    let out = `<linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d6f2"/><stop offset="0.3" stop-color="#e6f4fc"/></linearGradient><rect width="1920" height="1080" fill="url(#bsky)"/>`;
    out += `<linearGradient id="bsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix('#8fd0f0', SEA.top, age)}"/><stop offset="0.6" stop-color="${mix('#5fb2de', SEA.deep, age)}"/></linearGradient>`;
    const wave = Array.from({ length: 30 }, (_, i) => `${(250 + i * 1670 / 29).toFixed(0)} ${(BAL_TOP + Math.sin(t * 2 + i * 0.9) * 4).toFixed(1)}`).join(' L ');
    out += `<path d="M ${wave} L 1920 1080 L 250 1080 Z" fill="url(#bsea)"/>`;
    // 左の陸・川・海の底
    out += `<path d="M 0 1080 L 0 196 L 120 236 L 262 ${BAL_TOP} L 340 560 L 500 ${BAL_FLOOR} L 1920 ${BAL_FLOOR} L 1920 1080 Z" fill="${SEA.floor}"/>`;
    out += `<path d="M 0 196 L 120 236 L 262 ${BAL_TOP} L 300 450 L 0 520 Z" fill="${SEA.grass}"/>`;
    out += `<path d="M 0 200 L 120 240 L 262 ${BAL_TOP + 4}" fill="none" stroke="${SEA.river}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="M 0 200 L 120 240 L 262 ${BAL_TOP + 4}" fill="none" stroke="#d3eefc" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 44" stroke-dashoffset="${(-t * 110).toFixed(1)}"/>`;
    // 川から入ってくるつぶ
    for (let i = 0; i < 5; i++) {
      const f = (t * 0.22 + i / 5) % 1, P = [[0, 196], [120, 236], [262, BAL_TOP], [420, 430], [640, 470]];
      const [x, y] = along(P, f); out += saltDot(x, y, 8, clamp((1 - f) * 5));
    }
    // 海のつぶ
    const n = lerp(9, 66, age);
    for (let i = 0; i < Math.ceil(n); i++) { const [x, y] = balPos(i); out += saltDot(x, y + Math.sin(t * 1.4 + i) * 4, 8, clamp(n - i)); }
    // 海の底につもる
    const c3 = cue(3), sk = prog(t, c3 + 2.4, 3.0);
    if (sk > 0) {
      out += `<rect x="560" y="${BAL_FLOOR - 16 * sk}" width="1360" height="${16 * sk + 2}" fill="#f4f1e6" opacity="0.95"/>`;
      for (let i = 0; i < 6; i++) { const f = (t * 0.25 + i / 6) % 1; out += saltDot(1150 + i * 78 + Math.sin(f * 6 + i) * 8, lerp(600, BAL_FLOOR - 12, f), 8, clamp(f * 5) * clamp((1 - f) * 6)); }
    }
    // ラベル
    const e1 = cue(2) - 0.3;
    out += pop(badge('できたばかりの うみ', { fill: C.blueUi, size: 48 }), t, 0.5, 960, 130, { end: cue(1) - 0.2 });
    out += pop(text(0, 0, 'すこし しょっぱい くらい', { size: 46, w: 900 }), t, cue(0) + 2.6, 960, 232, { end: cue(1) - 0.2 });
    const tk = eo(prog(t, cue(1) + 0.2, cueE(1) - cue(1) - 0.6)), tO = win(t, cue(1), e1, 0.3);
    if (tO > 0) {
      out += g(text(960, 96, 'ながい ながい じかん', { size: 46, w: 900 }) + arrow(620, 170, lerp(660, 1300, tk), 170, C.ochre, 14), { o: tO });
      out += pop(badge('しょっぱい うみに', { fill: C.blueUi, size: 46 }), t, cueE(1) - 1.6, 960, 252, { end: e1 });
    }
    const qO = win(t, cue(2) + 0.2, cue(4) - 0.3, 0.4);
    out += g(card(1100, 150) + text(0, 2, 'これからも どんどん しょっぱく なる？', { size: 50, w: 900 }), { x: 1090, y: 150, o: qO });
    // 入る塩 と つもる塩
    out += g(arrow(300, 372, 470, 440, '#fff', 16) + arrow(300, 372, 470, 440, C.accent, 10), { o: prog(t, c3 + 0.3, 0.4) });
    out += pop(badge('かわから はいる しお', { fill: C.accent, size: 42 }), t, c3 + 0.5, 760, 450);
    out += g(arrow(1380, 590, 1380, 740, '#fff', 16) + arrow(1380, 590, 1380, 740, C.ochre, 10), { o: prog(t, c3 + 2.4, 0.4) });
    out += pop(badge('うみの そこに つもる しお', { fill: C.ochre, size: 42 }), t, c3 + 2.6, 1380, 540);
    out += pop(badge('だいたい おなじ', { fill: C.redUi, size: 54, pad: 44 }), t, c3 + 4.4, 800, 640);
    // これ以上しょっぱくならない（と考えられている）
    out += pop(badge('もう これいじょう しょっぱく ならない', { fill: C.ink, size: 48, pad: 40 }), t, cue(4) + 0.6, 1090, 130);
    out += g(text(0, 0, 'と かんがえられて いる', { size: 42, w: 900 }), { x: 1090, y: 228, o: prog(t, cue(4) + 2.4, 0.4) });
    out += topBadge();
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
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, OPTS[1][1], { size: 54, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['あめが いわを とかす', '#6f629c'], ['かわが うみへ はこぶ', C.accent], ['みずだけ そらへ、しおは のこる', C.blueUi]], t, 960, 660, { start: 2.8, step: 1.6, size: 34, gap: 26 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const dish = full => `<ellipse cx="0" cy="8" rx="58" ry="22" fill="#fff" stroke="#7fa7bd" stroke-width="6"/>` + (full ? `<ellipse cx="0" cy="6" rx="42" ry="13" fill="#7cc4ea"/>` : [[-22, 4], [-6, 10], [10, 2], [24, 8], [0, 0]].map(([x, y]) => saltDot(x, y, 6)).join(''));
      const mapIc = `<rect x="-50" y="-36" width="100" height="72" rx="8" fill="#e9f3dc" stroke="#7a9a6a" stroke-width="5"/><path d="M 10 -36 L 50 -36 L 50 36 L 26 36 Q 4 0 10 -36 Z" fill="#7cc4ea"/><path d="M -36 -18 Q -16 -4 -4 4 T 22 12" fill="none" stroke="${SEA.river}" stroke-width="7" stroke-linecap="round"/><path d="M -42 -10 l 10 -16 l 10 16 Z" fill="${SEA.rock}"/>`;
      const items = [
        [dish(true), 'おとなと、しおみずを こざらに いれて まどべに おく', C.ink],
        [dish(false), 'みずが なくなったら、なにが のこるかな？', C.ink],
        [mapIc, 'ちずで、やまから うみまで かわを ゆびで たどる', C.ink],
        [warnIcon(0.8), 'しおみずは くちに いれない。ちいさい こに とどかない ところへ', C.red],
        [warnIcon(0.8), 'うみで あそぶ ときも、うみの みずは のまない', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 190, 322 + i * 116);
      });
      // まどべの小皿：水がへって、白いつぶがのこる
      const dk = eio(prog(t, cue(1) + 1.5, cue(3) - cue(1) - 1.5));
      let w = card(420, 250) + `<rect x="-170" y="-100" width="340" height="130" rx="10" fill="#cfe9f8" stroke="#b08a5a" stroke-width="10"/><line x1="0" y1="-100" x2="0" y2="30" stroke="#b08a5a" stroke-width="8"/>` + sunDisc(-90, -40, 26, 0, { glow: 0.5 });
      w += `<rect x="-190" y="30" width="380" height="16" rx="6" fill="#b08a5a"/>`;
      w += `<ellipse cx="70" cy="66" rx="92" ry="26" fill="#fff" stroke="#7fa7bd" stroke-width="6"/>` + (dk < 0.98 ? `<ellipse cx="70" cy="64" rx="${70 * (1 - dk * 0.9)}" ry="${16 * (1 - dk * 0.9)}" fill="#7cc4ea"/>` : '');
      [[36, 60], [58, 70], [82, 58], [104, 68], [70, 62], [48, 66], [92, 72]].forEach(([x, y], i) => { w += saltDot(x, y, 6, clamp(dk * 3 - i * 0.25)); });
      b += pop(w, t, cue(1) + 0.4, 1640, 500);
      b += kidShow('K', t, 1650, 280, { s: 0.6, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「うみの みずは どうして しょっぱいの？」のページへ ／ 出典は 概要欄に', { size: 29, w: 700, fill: '#d9e6dc' }), { x: 1070, y: 800, o: prog(t, 2.0, 0.5) });
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

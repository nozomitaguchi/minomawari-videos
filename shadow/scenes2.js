// ---------- かげの道具 ----------
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const SHC = '#4f565b', LY = '#f0b92a', SAND = '#ecdcb4', SAND2 = '#dfcc9c', SKIN = '#f6d6bd', WALL = '#fff4cf';
// sil：絵をかげの色にぬりつぶす／silb：ふちをぼかしたかげ／oline：まわりの線（りんかく）だけ
const SIL_M = `<feColorMatrix type="matrix" values="0 0 0 0 0.31  0 0 0 0 0.34  0 0 0 0 0.357  0 0 0 1 0"/>`;
const SDEFS = `<defs>
  <filter id="sil" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">${SIL_M}</filter>
  <filter id="silb" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">${SIL_M}<feGaussianBlur stdDeviation="7"/></filter>
  <filter id="oline" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d"/><feFlood flood-color="${C.red}" result="f"/><feComposite in="f" in2="d" operator="in" result="c"/><feComposite in="c" in2="SourceAlpha" operator="out"/></filter>
</defs>`;
const kidSil = (who, pose = 'stand') => who === 'S' ? sister(NOW.t, { pose }) : brother(NOW.t + 1, { pose });
// 地面にねたかげ。inner は足もとが (0,0) の絵。(gx, gy) はかげの先（背の高さ1あたり、右へ・手前へ）
function lieShadow(inner, x, y, gx, gy, o = 0.5, s = 1) {
  const L = Math.hypot(gx, gy) || 1e-6, ux = gx / L, uy = gy / L;
  return o <= 0.001 ? '' : `<g transform="matrix(${(-uy * s).toFixed(4)} ${(ux * 0.45 * s).toFixed(4)} ${(-gx * s).toFixed(4)} ${(-gy * 0.45 * s).toFixed(4)} ${x} ${y})" opacity="${o}" filter="url(#sil)">${inner}</g>`;
}
const lyingShadow = (who, x, y, s, gx, gy, { pose = 'stand', o = 0.5 } = {}) => lieShadow(kidSil(who, pose), x, y, gx, gy, o, s);
// まっすぐ進む光の線（k: 0〜1 でのびる）。線の上を光のつぶが進む
function ray(x1, y1, x2, y2, k, { w = 8, col = LY, o = 1, dots = true, seed = 0 } = {}) {
  if (k <= 0 || o <= 0) return '';
  const xe = lerp(x1, x2, k), ye = lerp(y1, y2, k);
  let out = `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${xe.toFixed(1)}" y2="${ye.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
  if (dots) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    for (let j = 0; j < 3; j++) { const f = (NOW.t * 300 / len + j / 3 + seed * 0.37) % 1; if (f < k) out += `<circle cx="${lerp(x1, x2, f).toFixed(1)}" cy="${lerp(y1, y2, f).toFixed(1)}" r="${w * 0.85}" fill="#fffbe0" opacity="${o}"/>`; }
  }
  return out;
}
const bulb = (x, y, r = 46) => `<circle cx="${x}" cy="${y}" r="${r * 2.3}" fill="#ffe27a" opacity="0.45" filter="url(#glow)"/><rect x="${x - r * 0.42}" y="${y + r * 0.78}" width="${r * 0.84}" height="${r * 0.66}" rx="6" fill="#8d8f93"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ffe680" stroke="#d9a520" stroke-width="5"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.26}" fill="#fff" opacity="0.85"/>`;
// かいちゅうでんとう（光る口が (x,y)。r=0 で右向き）
const torch = (x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><rect x="-150" y="-22" width="104" height="44" rx="10" fill="#5b6770"/><rect x="-128" y="-31" width="34" height="14" rx="5" fill="${C.red}"/><path d="M -52 -22 L -8 -42 L -8 42 L -52 22 Z" fill="#7f8c96"/><rect x="-10" y="-42" width="12" height="84" rx="4" fill="#ffe680"/></g>`;
const starPts = r => Array.from({ length: 10 }, (_, i) => { const a = (-90 + i * 36) * Math.PI / 180, rr = i % 2 ? r * 0.46 : r; return [rr * Math.cos(a), rr * Math.sin(a)]; });
// ななめから見た面（かべ・紙）の上の点。u: 面の横、v: 面のたて
const OB = (cx, cy, u, v) => [cx + u * 0.6, cy + v + u * 0.22];
const obPath = (cx, cy, pts) => 'M ' + pts.map(([u, v]) => OB(cx, cy, u, v).map(n => n.toFixed(1)).join(' ')).join(' L ') + ' Z';
const sq4 = (w, h) => [[-w, -h], [w, -h], [w, h], [-w, h]];
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;
function arrow(x1, y1, x2, y2, col, w = 12, o = 1) {
  if (o <= 0.01) return '';
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/></g>`;
}
// 太陽に ×（太陽そのものは見ない）
const noSun = (s = 1) => `<g transform="scale(${s})"><circle r="30" fill="#ffd23a"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${Math.cos(a * Math.PI / 180) * 38}" y1="${Math.sin(a * Math.PI / 180) * 38}" x2="${Math.cos(a * Math.PI / 180) * 50}" y2="${Math.sin(a * Math.PI / 180) * 50}" stroke="#ffd23a" stroke-width="7" stroke-linecap="round"/>`).join('')}<circle r="58" fill="none" stroke="${C.red}" stroke-width="9"/><line x1="-41" y1="-41" x2="41" y2="41" stroke="${C.red}" stroke-width="9" stroke-linecap="round"/></g>`;
// 手（指先が上。手首は下）
const handShape = (fill, arm = 0) => `<g fill="${fill}"><rect x="-66" y="-6" width="132" height="124" rx="40"/><rect x="-66" y="-104" width="29" height="130" rx="14.5"/><rect x="-31" y="-132" width="30" height="150" rx="15"/><rect x="5" y="-124" width="30" height="150" rx="15"/><rect x="40" y="-92" width="27" height="120" rx="13.5"/><rect x="48" y="14" width="74" height="30" rx="15" transform="rotate(-38 60 30)"/>${arm ? `<rect x="-40" y="96" width="80" height="${arm}" rx="30"/>` : ''}</g>`;

// 1. つかみ：晴れた日の公園。手をふると、かげも手をふる
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = SDEFS + skyRect('skh', 0, { h: 660 });
    out += sunDisc(230, 200, 72, 0);
    out += cloud(880 + t * 8, 180, 0.9) + cloud(1560 - t * 5, 300, 0.6, '#fff', 0.85);
    out += `<path d="M 0 590 Q 480 520 960 575 T 1920 560 L 1920 700 L 0 700 Z" fill="#8ccf86"/>`;
    out += `<rect x="0" y="630" width="1920" height="450" fill="${SAND}"/>`;
    // かげ（太陽は左上。かげは右へのびる）
    const gk = lerp(0.12, 1, eo(prog(t, c0 + 0.5, 1.8))), GX = 1.7 * gk, GY = 0.2 * gk, so = prog(t, 0.7, 0.5);
    [[1150, 645, 0.9, '#3f8f4a'], [1740, 650, 1.0, '#4f9f58']].forEach(([x, y, s, col]) => { out += lieShadow(tree(0, 0, s, col), x, y, GX, GY, 0.4 * so) + tree(x, y, s, col); });
    const wave = t >= c1 - 0.15;
    out += lyingShadow('S', 480, 770, 0.72, GX, GY, { pose: wave ? 'wave' : 'stand', o: 0.52 * so });
    out += lyingShadow('B', 1380, 790, 0.72, GX, GY, { o: 0.52 * so });
    out += kidShow('S', t, 480, 770, { s: 0.72, start: 0, n: 0, enter: 'pop', act: 'wave', pose: wave ? 'wave' : null, look: [7, 5] });
    out += kidShow('B', t, 1380, 790, { s: 0.72, start: 0, n: 1, enter: 'pop', bubble: false, look: [6, 6], eyes: t > c1 ? 'wide' : 'open' });
    // 「かげ」のしるし
    const lk = win(t, c0 + (cueE(0) - c0) * 0.55, c1 - 0.1, 0.3);
    out += g(badge('かげ', { fill: SHC, size: 48 }), { x: 900, y: 660, o: lk }) + pointer(900, 702, 860, 776, SHC, lk);
    out += pop(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre }), t, c3 + 0.3, 960, 610);
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 240);
      out += g(`<text x="0" y="0" font-size="140" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${SHC}">かげ</tspan>は、どうして</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="118" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">自分と <tspan fill="${C.redUi}">同じ 形</tspan>に なるの？</text>`, { x: 960, y: 610, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ik = prog(t, t0 + 2.0, 0.4);
      out += lyingShadow('S', 780, 900, 0.42, 2.0, 0, { pose: 'wave', o: 0.5 * ik });
      out += kidShow('S', t, 780, 900, { s: 0.42, start: t0 + 1.7, n: 2, enter: 'pop', pose: 'wave', bubble: false });
    }
    return out;
  },
});

// 2. 予想
const GUESS_ICON = [
  // 光をさえぎる
  `<circle cx="-50" cy="0" r="16" fill="#ffd23a" stroke="#d9a520" stroke-width="4"/><path d="M -28 -10 L 14 -22 M -28 0 L 14 0 M -28 10 L 14 22" stroke="${LY}" stroke-width="7" stroke-linecap="round"/><rect x="18" y="-34" width="26" height="68" rx="5" fill="#a9794c"/><path d="M 44 -30 L 64 -36 L 64 36 L 44 30 Z" fill="${SHC}" opacity="0.55"/>`,
  // かがみ
  `<rect x="-38" y="-46" width="76" height="92" rx="14" fill="#cfe7f2" stroke="#8a6a4a" stroke-width="8"/><path d="M -18 -24 L 4 -24 M -18 -6 L -4 -6" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,
  // まねをして動くかげ
  `<circle cx="0" cy="-26" r="15" fill="${SHC}"/><rect x="-14" y="-12" width="28" height="42" rx="12" fill="${SHC}"/><path d="M -12 -2 L -34 -22 M 12 -2 L 34 -22" stroke="${SHC}" stroke-width="10" stroke-linecap="round"/><path d="M -52 -34 q 6 -8 12 0 M 42 -36 q 6 -8 12 0" fill="none" stroke="${C.ochre}" stroke-width="5" stroke-linecap="round"/>`,
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(text(0, 0, 'かげは どうして おなじ かたち？', { size: 64, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'からだが ひかりを さえぎって いる'], ['②', 'じめんが かがみみたいに うつして いる'], ['③', 'かげが からだの まねを して いる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }) + g(GUESS_ICON[i], { x: 510, y: 0, s: 0.92 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
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

// 3. 光はまっすぐ進む
SCENES.push({
  id: 'straight', night: true,
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + topBadge(true);
    const mv = eio(prog(t, c1 - 0.7, 0.8));
    // でんきゅうから、あらゆる向きへ
    const BX = lerp(960, 470, mv), BY = 500, R = lerp(250, 230, mv);
    for (let i = 0; i < 12; i++) {
      const a = i * 30 * Math.PI / 180, k = eo(prog(t, c0 + 0.3 + i * 0.04, 1.0));
      out += ray(BX + Math.cos(a) * 74, BY + Math.sin(a) * 74, BX + Math.cos(a) * (74 + R), BY + Math.sin(a) * (74 + R), k, { w: 10, seed: i });
    }
    out += pop(bulb(0, 0, 50), t, 0.3, BX, BY);
    out += pop(text(0, 0, 'ひかりは まっすぐ すすむ', { size: 58, w: 900, fill: '#fff3c4' }), t, c0 + 1.2, 1000, 110);
    // 太陽の光も、まっすぐ
    const sk = prog(t, c1 - 0.2, 0.5);
    if (sk > 0) {
      out += g(`<rect x="840" y="800" width="1080" height="280" fill="#3d5a48"/><rect x="840" y="800" width="1080" height="10" fill="#5a7d63"/>`, { o: sk });
      const SX = 1640, SY = 290;
      for (let i = 0; i < 7; i++) {
        const gx = 960 + i * 118, k = eo(prog(t, c1 + 0.3 + i * 0.07, 1.3));
        const a = Math.atan2(800 - SY, gx - SX);
        out += ray(SX + Math.cos(a) * 104, SY + Math.sin(a) * 104, gx, 800, k, { w: 9, seed: i + 3, o: sk });
      }
      out += g(sunDisc(SX, SY, 78, 0), { o: sk });
      out += g(text(0, 0, 'たいようの ひかりも まっすぐ', { size: 46, w: 900, fill: '#fff3c4' }), { x: 1380, y: 866, o: prog(t, c1 + 1.4, 0.4) });
    }
    return out;
  },
});

// 4. さえぎると、とどかない（かげは、光が少ない場所。太陽の反対がわ）
SCENES.push({
  id: 'block',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = PAPER + SDEFS + topBadge();
    const aO = 1 - prog(t, c3 - 0.5, 0.4);
    if (aO > 0) {
      const S = [250, 430];
      let a = '';
      // とどかない場所
      const sh = prog(t, c1 - 0.1, 0.6);
      a += `<path d="M 820 350 L 1560 246 L 1560 614 L 820 510 Z" fill="${SHC}" opacity="${0.2 * sh}"/>`;
      // かべ
      a += `<rect x="1560" y="120" width="44" height="620" rx="6" fill="${WALL}" stroke="#cdbf9a" stroke-width="6"/>`;
      a += `<rect x="1563" y="246" width="38" height="368" fill="${SHC}" opacity="${0.68 * sh}"/>`;
      a += text(1582, 84, 'かべ', { size: 40, w: 900, fill: C.muted });
      // 通りぬける光・止まる光
      [150, 210, 650, 710].forEach((wy, i) => { a += ray(S[0], S[1], 1560, wy, eo(prog(t, c0 + 0.3 + i * 0.1, 1.5)), { seed: i }); });
      [380, 430, 480].forEach((by, i) => {
        const k = eo(prog(t, c0 + 0.5 + i * 0.1, 0.8));
        a += ray(S[0], S[1], 820, by, k, { seed: i + 5, col: '#f28a3c' });
        const hit = prog(t, c0 + 1.3 + i * 0.1, 0.3);
        if (hit > 0) a += `<circle cx="820" cy="${by}" r="${10 + 8 * Math.abs(Math.sin(t * 5 + i))}" fill="#fff" stroke="#f28a3c" stroke-width="5" opacity="${hit}"/>`;
      });
      a += bulb(S[0], S[1], 48);
      a += text(250, 560, 'ひかり', { size: 40, w: 900, fill: C.ochre });
      // 光を通さないもの
      a += pop(`<rect x="-60" y="-80" width="120" height="160" rx="8" fill="#b98a5a" stroke="#8a6a4a" stroke-width="6"/><path d="M -60 -30 L 60 -30 M -60 30 L 60 30" stroke="#8a6a4a" stroke-width="4" opacity="0.5"/>`, t, 0.3, 880, 430);
      a += g(text(880, 215, 'ひかりを とおさない もの', { size: 38, w: 900, fill: '#8a6a4a' }), { o: prog(t, c0 + 0.4, 0.4) });
      a += g(text(1250, 432, 'ひかりが とどかない', { size: 42, w: 900, fill: '#fff' }), { o: prog(t, c1 + 0.2, 0.4) });
      a += pop(badge('かげ', { fill: SHC, size: 54, pad: 40 }), t, c1 + (cueE(1) - c1) * 0.55, 1760, 430);
      a += pointer(1672, 430, 1612, 430, SHC, prog(t, c1 + (cueE(1) - c1) * 0.55 + 0.3, 0.3));
      // 黒いものがあるのではない
      const d2 = cueE(2) - c2;
      a += pop(badge('× くろい ものが ある', { fill: '#8c8c86', size: 40 }), t, c2 + 0.1, 560, 790);
      a += pop(badge('○ ひかりが すくない ばしょ', { fill: C.accent, size: 40 }), t, c2 + d2 * 0.55, 1200, 790);
      out += g(a, { o: aO });
    }
    // 太陽・体・かげの順にならぶ（かげは太陽の反対がわ）
    const bO = prog(t, c3 - 0.3, 0.5);
    if (bO > 0) {
      const FX = 960, FY = 740, s = 0.7, H = 370 * s, GX = 2.4, SUN = [300, 206];
      let b = skyRect('skb', 0, { h: 640 }) + `<path d="M 0 600 Q 480 540 960 590 T 1920 575 L 1920 700 L 0 700 Z" fill="#8ccf86"/><rect x="0" y="640" width="1920" height="440" fill="${SAND}"/>`;
      b += sunDisc(SUN[0], SUN[1], 70, 0);
      const sk = prog(t, c3 + 0.5, 0.5);
      b += lyingShadow('B', FX, FY, s, GX, 0, { o: 0.55 * sk });
      const rk = eo(prog(t, c3 + 0.9, 1.2));
      if (rk > 0) b += `<line x1="${SUN[0] + 80}" y1="${SUN[1] + 80 * (FY - H - SUN[1]) / (FX - SUN[0])}" x2="${lerp(SUN[0] + 80, FX + GX * H, rk)}" y2="${lerp(SUN[1] + 80 * (FY - H - SUN[1]) / (FX - SUN[0]), FY, rk)}" stroke="${LY}" stroke-width="7" stroke-dasharray="20 14" stroke-linecap="round"/>`;
      b += kidShow('B', t, FX, FY, { s, start: c3 - 0.2, n: 0, enter: 'pop', bubble: false, look: [6, 5] });
      b += pop(badge('たいよう', { fill: C.ochre, size: 42 }), t, c3 + 0.4, 300, 340);
      b += pop(badge('かげ', { fill: SHC, size: 46 }), t, c3 + 1.6, 1300, 808);
      b += pop(badge('かげは たいようの はんたいがわ', { fill: C.accent, size: 48, pad: 40 }), t, c3 + 2.2, 1100, 180);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 5. ふちをなぞる（答えの場面）：星の形の紙
const OL = { S: [190, 470], P: [720, 470], K: 2.0, r: 105 };
SCENES.push({
  id: 'outline',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), c5 = cue(5);
    let out = PAPER + SDEFS + topBadge();
    const aO = 1 - prog(t, c5 - 0.5, 0.4);
    if (aO > 0) {
      const [sx, sy] = OL.S, [px, py] = OL.P, K = OL.K, qx = sx + (px - sx) * K, qy = sy + (py - sy) * K;
      const sp = starPts(OL.r), sq = starPts(OL.r * K);
      const starIn = c0 + (cueE(0) - c0) * 0.5, st = prog(t, starIn + 0.2, 0.4);
      let a = '';
      a += `<path d="${obPath(qx, qy, sq4(290, 290))}" fill="${WALL}" stroke="#cdbf9a" stroke-width="6" stroke-linejoin="round"/>`;
      a += text(1370, 150, 'かべ', { size: 40, w: 900, fill: C.muted });
      // かべのかげ（星と、ぼうのかげ）
      a += `<g opacity="${0.62 * st}"><path d="${obPath(qx, qy, sq)}" fill="${SHC}"/><line x1="${qx}" y1="${qy + OL.r * K * 0.46 + 2}" x2="${qx}" y2="${qy + 288}" stroke="${SHC}" stroke-width="20"/></g>`;
      // ふちをかすめて、かべまでとどく光
      for (let i = 0; i < 5; i++) {
        const Q = OB(qx, qy, sq[i * 2][0], sq[i * 2][1]), k = eo(prog(t, c1 + 0.2 + i * 0.14, 1.0));
        a += ray(sx, sy, Q[0], Q[1], k, { w: 7, seed: i });
        if (k >= 1) a += `<circle cx="${Q[0]}" cy="${Q[1]}" r="11" fill="#fff" stroke="${LY}" stroke-width="5"/>`;
      }
      // 内がわに来て、さえぎられる光
      const IN = [[0, 0], [-30, -34], [34, 30]].map(([u, v]) => OB(px, py, u, v));
      IN.forEach(([x, y], i) => {
        const far = [sx + (x - sx) * K, sy + (y - sy) * K], o2 = prog(t, c2 + 1.0 + i * 0.1, 0.3);
        a += `<line x1="${x}" y1="${y}" x2="${far[0]}" y2="${far[1]}" stroke="#9aa0a5" stroke-width="5" stroke-dasharray="10 12" opacity="${0.75 * o2}"/>`;
      });
      a += pop(badge('とどかない', { fill: SHC, size: 40 }), t, c2 + 1.4, 1640, 290) + pointer(1560, 318, 1300, 440, SHC, prog(t, c2 + 1.7, 0.3));
      // 星の形の紙（ぼうつき）
      a += pop(`<line x1="0" y1="46" x2="0" y2="322" stroke="#9a7438" stroke-width="10" stroke-linecap="round"/><ellipse cx="0" cy="326" rx="62" ry="14" fill="#9a7438"/><path d="${obPath(0, 0, sp)}" fill="#f28a3c" stroke="#c9652a" stroke-width="5" stroke-linejoin="round"/>`, t, starIn, px, py);
      IN.forEach(([x, y], i) => {
        const k = eo(prog(t, c2 + 0.2 + i * 0.12, 0.7));
        a += ray(sx, sy, x, y, k, { w: 7, seed: i + 7, col: '#ffd76a' });
        if (k >= 1) a += `<circle cx="${x}" cy="${y}" r="${9 + 5 * Math.abs(Math.sin(t * 5 + i))}" fill="#fff" stroke="${C.red}" stroke-width="5"/>`;
      });
      a += bulb(sx, sy, 46);
      a += text(sx, sy + 130, 'ひかり', { size: 40, w: 900, fill: C.ochre });
      a += g(text(px, py - 150, 'ほしの かたちの かみ', { size: 38, w: 900, fill: '#c9652a' }), { o: win(t, starIn + 0.4, c1 + 0.2, 0.3) });
      // ふちをなぞる線
      const tr = prog(t, c3 + (cueE(3) - c3) * 0.35, 0.5);
      if (tr > 0) {
        a += `<path d="${obPath(px, py, sp)}" fill="none" stroke="${C.red}" stroke-width="9" stroke-dasharray="26 16" stroke-dashoffset="${(-t * 70).toFixed(1)}" stroke-linejoin="round" opacity="${tr}"/>`;
        a += `<path d="${obPath(qx, qy, sq)}" fill="none" stroke="${C.red}" stroke-width="11" stroke-dasharray="26 16" stroke-dashoffset="${(-t * 70).toFixed(1)}" stroke-linejoin="round" opacity="${tr}"/>`;
      }
      a += pop(badge('ふちを かすめた ひかりは とどく', { fill: C.ochre, size: 38 }), t, c1 + 1.3, 620, 190, { end: c3 - 0.1 });
      a += pop(badge('うちがわは さえぎられる', { fill: C.redUi, size: 36 }), t, c2 + 0.9, 400, 730, { end: c5 });
      a += pop(badge('かげの ふちは、ものの ふちを なぞった せん', { fill: C.accent, size: 36 }), t, c3 + (cueE(3) - c3) * 0.35, 620, 190);
      // おとうと
      a += kidShow('B', t, 1740, 845, { s: 0.6, start: c4 - 0.9, n: 0, bubble: false, look: [-8, -4] });
      a += talkBubble('B', 1690, 500, 1740, 612, 40);
      out += g(a, { o: aO });
    }
    // 顔も服の色もうつらない。うつるのは、まわりの線だけ
    const bO = prog(t, c5 - 0.3, 0.5);
    if (bO > 0) {
      const d5 = cueE(5) - c5, ol = prog(t, c5 + d5 * 0.6, 0.4);
      const KX = 500, WX = 1380, FY = 800, s = 0.9;
      let b = g(card(560, 640, { fill: WALL }), { x: WX, y: 480 });
      b += `<g transform="translate(${WX} ${FY}) scale(${s})" filter="url(#sil)" opacity="0.8">${sister(NOW.t, { pose: 'wave' })}</g>`;
      b += kidShow('S', t, KX, FY, { s, start: c5 - 0.2, n: 1, enter: 'pop', pose: 'wave', bubble: false });
      if (ol > 0) [KX, WX].forEach(x => { b += `<g transform="translate(${x} ${FY}) scale(${s})" filter="url(#oline)" opacity="${ol}">${sister(NOW.t, { pose: 'wave' })}</g>`; });
      b += arrow(790, 560, 1050, 560, C.ochre, 14, prog(t, c5 + 0.6, 0.4));
      b += text(WX, 215, 'かげ', { size: 48, w: 900, fill: SHC });
      b += pop(badge('かおも ふくの いろも うつらない', { fill: C.blueUi, size: 40 }), t, c5 + 0.5, 520, 250);
      b += pop(badge('うつるのは まわりの せん だけ', { fill: C.red, size: 36 }), t, c5 + d5 * 0.6, WX, 110);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 6. のびたり、ちぢんだり（朝・お昼・夕方）
const sunAt = tau => [960 - 800 * Math.cos(Math.PI * tau), 380 - 250 * Math.sin(Math.PI * tau)];
SCENES.push({
  id: 'length',
  draw(t) {
    const c0 = cue(0), e0 = cueE(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    // tau：0 朝 → 0.5 お昼 → 1 夕方
    let tau = 0.3 - 0.24 * Math.sin(Math.PI * prog(t, c0, e0 - c0));
    tau = lerp(tau, 0, eio(prog(t, e0, c1 - e0 + 0.3)));
    tau = lerp(tau, 0.5, eio(prog(t, c2 - 0.2, 2.4)));
    tau = lerp(tau, 1, eio(prog(t, c3 - 0.2, 2.2)));
    const FX = 960, FY = 770, s = 0.44, H = 452 * s, HY = FY - H;
    const [sx, sy] = sunAt(tau), gy = 0.8 * Math.sin(Math.PI * tau);
    const tipY = FY + H * 0.45 * gy, lam = (tipY - HY) / (HY - sy), tipX = FX + lam * (FX - sx), gx = (tipX - FX) / H;
    const low = Math.pow(Math.abs(Math.cos(Math.PI * tau)), 2.5);
    let out = SDEFS + skyRect('skl', 0.22 * low, { h: 660 });
    out += cloud(700 + t * 5, 360, 0.6, mix('#ffffff', '#ffe3d0', low * 0.7), 0.9) + cloud(1260 - t * 4, 440, 0.5, mix('#ffffff', '#ffe3d0', low * 0.7), 0.85);
    out += sunDisc(sx, sy, 62, 0.5 * low);
    out += `<path d="M 0 610 Q 480 550 960 600 T 1920 585 L 1920 700 L 0 700 Z" fill="${mix('#8ccf86', '#86b77c', low)}"/><rect x="0" y="640" width="1920" height="440" fill="${mix(SAND, '#e6cfa0', low)}"/>`;
    const so = prog(t, 0.7, 0.5);
    out += lyingShadow('S', FX, FY, s, gx, gy, { o: 0.55 * so });
    // 太陽から、頭の上を通って、かげの先まで まっすぐ
    const a = Math.atan2(HY - sy, FX - sx);
    out += `<line x1="${sx + Math.cos(a) * 76}" y1="${sy + Math.sin(a) * 76}" x2="${tipX}" y2="${tipY}" stroke="${LY}" stroke-width="6" stroke-dasharray="18 14" stroke-linecap="round" opacity="${0.95 * so}"/>`;
    out += kidShow('S', t, FX, FY, { s, start: 0, n: 0, enter: 'pop', bubble: false });
    // 時こく
    const lab = tau < 0.25 ? ['あさ', '#d98a3a'] : tau < 0.75 ? ['おひる', C.blueUi] : ['ゆうがた', '#c8602c'];
    out += g(badge(lab[0], { fill: lab[1], size: 56, pad: 44 }), { x: 250, y: 190, o: prog(t, c1 - 0.2, 0.4) });
    const mx = (FX + tipX) / 2;
    out += g(badge('かげは ながい', { fill: SHC, size: 42 }), { x: mx, y: 680, o: win(t, c1 + 0.8, c2 - 0.1, 0.3) });
    out += g(badge('たいようが ひくい', { fill: '#d98a3a', size: 40 }), { x: sx + 250, y: sy + 120, o: win(t, c1 + 0.3, c2 - 0.1, 0.3) });
    out += g(badge('かげは みじかい', { fill: SHC, size: 42 }), { x: 1260, y: 800, o: win(t, c2 + 2.3, c3 - 0.1, 0.3) });
    out += g(badge('たいようが たかい', { fill: C.blueUi, size: 40 }), { x: 1290, y: 130, o: win(t, c2 + 2.0, c3 - 0.1, 0.3) });
    out += g(badge('また ながい', { fill: SHC, size: 42 }), { x: mx, y: 680, o: prog(t, c3 + 2.0, 0.3) });
    return out;
  },
});

// 7. 光に近いと大きい／お皿は上からと横から
const P3 = (o, l, d, v) => [o[0] + l + 0.5 * d, o[1] - v - 0.3 * d];
const discPath = (o, R, l0 = 0, v0 = 0) => 'M ' + Array.from({ length: 48 }, (_, i) => { const a = i / 48 * Math.PI * 2; return P3(o, l0 + R * Math.cos(a), R * Math.sin(a), v0).map(n => n.toFixed(1)).join(' '); }).join(' L ') + ' Z';
const plate = (o, R, l0, v0) => `<path d="${discPath(o, R, l0, v0)}" fill="#fff" stroke="#8fb3c6" stroke-width="7" stroke-linejoin="round"/><path d="${discPath(o, R * 0.62, l0, v0)}" fill="#eef6fa" stroke="#bcd3df" stroke-width="5"/>`;
SCENES.push({
  id: 'shape',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c3 = cue(3);
    let out = PAPER + SDEFS;
    // A：光に近づけると、かげは大きい
    const aO = 1 - prog(t, c1 - 0.6, 0.4);
    if (aO > 0) {
      const S = [230, 470], Q = [1290, 470], r0 = 75;
      const K = lerp(1.7, 3.1, eio(prog(t, c0 + d0 * 0.42, d0 * 0.34)));
      const px = S[0] + (Q[0] - S[0]) / K, py = S[1];
      const sp = starPts(r0), sq = starPts(r0 * K);
      let a = topBadge();
      a += `<path d="${obPath(Q[0], Q[1], sq4(270, 270))}" fill="${WALL}" stroke="#cdbf9a" stroke-width="6" stroke-linejoin="round"/>`;
      a += text(1410, 180, 'かべ', { size: 40, w: 900, fill: C.muted });
      const st = prog(t, 0.8, 0.4);
      a += `<path d="${obPath(Q[0], Q[1], sq)}" fill="${SHC}" opacity="${0.62 * st}"/>`;
      [0, 4, 6].forEach((i, j) => { const T = OB(Q[0], Q[1], sq[i][0], sq[i][1]); a += ray(S[0], S[1], T[0], T[1], eo(prog(t, 0.9 + j * 0.1, 0.8)), { w: 6, seed: j }); });
      a += pop(`<line x1="0" y1="34" x2="0" y2="210" stroke="#9a7438" stroke-width="10" stroke-linecap="round"/><circle cx="0" cy="216" r="16" fill="#9a7438"/><path d="${obPath(0, 0, sp)}" fill="#f28a3c" stroke="#c9652a" stroke-width="5" stroke-linejoin="round"/>`, t, 0.4, px, py);
      a += torch(S[0], S[1], 0);
      a += text(210, 560, 'かいちゅうでんとう', { size: 34, w: 900, fill: C.muted });
      a += pop(text(0, 0, 'ものを ひかりに ちかづけると…', { size: 50, w: 900 }), t, c0 + d0 * 0.28, 700, 150);
      a += arrow(px + 150, 760, px - 10, 760, C.ochre, 12, win(t, c0 + d0 * 0.4, c0 + d0 * 0.78, 0.25));
      a += pop(badge('かげが おおきく なる', { fill: SHC, size: 46 }), t, c0 + d0 * 0.7, 700, 240);
      a += g(g(warnIcon(0.5), { x: 0, y: -4 }) + text(44, 2, 'ひかりは ひとの めに むけない', { size: 34, w: 900, anchor: 'start', fill: C.red }), { x: 150, y: 810, o: prog(t, c0 + 0.6, 0.4) });
      out += g(a, { o: aO });
    }
    // B：お皿を、真上から・真横から
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      let b = '';
      // 真上から
      const o1 = [580, 660], R = 100, T1 = P3(o1, 0, 0, 380), r1 = 380 / 200;
      b += `<path d="M ${[[-250, -250], [250, -250], [250, 250], [-250, 250]].map(([l, d]) => P3(o1, l, d, 0).join(' ')).join(' L ')} Z" fill="${SAND}" stroke="${SAND2}" stroke-width="6" stroke-linejoin="round"/>`;
      const s1 = prog(t, c1 + d1 * 0.3, 0.5);
      b += `<path d="${discPath(o1, R * r1)}" fill="${SHC}" opacity="${0.6 * s1}"/>`;
      [-1, 1].forEach((sd, j) => { const E = P3(o1, sd * R * r1, 0, 0); b += ray(T1[0], T1[1], E[0], E[1], eo(prog(t, c1 + d1 * 0.16 + j * 0.1, 0.8)), { w: 6, seed: j }); });
      b += pop(plate([0, 0], R, 0, 0), t, c1 - 0.1, o1[0], o1[1] - 180);
      b += torch(T1[0], T1[1], 90);
      b += text(690, 230, 'まうえから', { size: 48, w: 900, anchor: 'start' });
      b += pop(badge('まるい かげ', { fill: SHC, size: 44 }), t, c1 + d1 * 0.34, 580, 790);
      // 真横から
      const pk = prog(t, c1 + d1 * 0.5, 0.5);
      if (pk > 0) {
        const o2 = [1370, 450], T2 = P3(o2, -330, 0, 0), r2 = 590 / 330;
        let p = `<path d="M ${[[-230, -200], [230, -200], [230, 200], [-230, 200]].map(([d, v]) => P3(o2, 260, d, v).join(' ')).join(' L ')} Z" fill="${WALL}" stroke="#cdbf9a" stroke-width="6" stroke-linejoin="round"/>`;
        p += text(1630, 150, 'かべ', { size: 40, w: 900, fill: C.muted });
        const s2 = prog(t, c1 + d1 * 0.72, 0.5), B1 = P3(o2, 260, -R * r2, 0), B2 = P3(o2, 260, R * r2, 0);
        p += `<line x1="${B1[0]}" y1="${B1[1]}" x2="${B2[0]}" y2="${B2[1]}" stroke="${SHC}" stroke-width="16" stroke-linecap="round" opacity="${0.72 * s2}"/>`;
        [B1, B2].forEach((E, j) => { p += ray(T2[0], T2[1], E[0], E[1], eo(prog(t, c1 + d1 * 0.6 + j * 0.1, 0.8)), { w: 6, seed: j + 4 }); });
        p += plate(o2, R, 0, 0);
        p += torch(T2[0], T2[1], 0);
        p += text(980, 360, 'まよこから', { size: 48, w: 900 });
        p += pop(badge('ほそい ぼうの かげ', { fill: SHC, size: 44 }), t, c1 + d1 * 0.76, 1630, 790);
        b += g(p, { o: pk });
      }
      b += kidShow('K', t, 1010, 845, { s: 0.6, start: c2 - 0.9, n: 0 });
      b += pop(badge('ひかりの くる むきから みた かたちが、かげに なる', { fill: C.accent, size: 36, pad: 40 }), t, c3 + 0.3, 1130, 90);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. ふちがぼやけるわけ（太陽は、大きさのある光）
SCENES.push({
  id: 'blur',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3;
    let out = PAPER + SDEFS;
    // A：地面のかげを、上からよく見る
    const aO = 1 - prog(t, c1 - 0.5, 0.4);
    if (aO > 0) {
      let a = `<rect width="1920" height="1080" fill="${SAND}"/>`;
      for (let i = 0; i < 70; i++) a += `<circle cx="${(rnd(i, 21) * 1920).toFixed(0)}" cy="${(rnd(i, 22) * 1080).toFixed(0)}" r="${(3 + rnd(i, 23) * 4).toFixed(1)}" fill="${SAND2}"/>`;
      a += `<g transform="matrix(0 1.15 -1.6 0 230 520)" opacity="0.55" filter="url(#silb)">${sister(NOW.t, { pose: 'stand' })}</g>`;
      a += pop(badge('じめんの かげ', { fill: SHC, size: 44 }), t, 0.4, 560, 250);
      const lk = c0 + d0 * 0.45, EX = 962, EY = 520;
      a += pop(`<circle r="46" fill="none" stroke="${C.blueUi}" stroke-width="8" stroke-dasharray="14 10"/>`, t, lk, EX, EY);
      const lo = prog(t, lk + 0.3, 0.4);
      if (lo > 0) {
        const LX = 1430, LYc = 440, LR = 215;
        let m = `<line x1="${EX + 44}" y1="${EY - 14}" x2="${LX - LR}" y2="${LYc}" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="14 10"/>`;
        m += `<rect x="${LX + 120}" y="${LYc + 150}" width="40" height="190" rx="20" fill="${C.ochre}" transform="rotate(-40 ${LX + 140} ${LYc + 160})"/>`;
        m += `<clipPath id="lensc"><circle cx="${LX}" cy="${LYc}" r="${LR}"/></clipPath><linearGradient id="edg" gradientUnits="userSpaceOnUse" x1="${LX - 110}" y1="0" x2="${LX + 130}" y2="0"><stop offset="0" stop-color="${SHC}" stop-opacity="0.58"/><stop offset="1" stop-color="${SHC}" stop-opacity="0"/></linearGradient>`;
        m += `<g clip-path="url(#lensc)"><rect x="${LX - LR}" y="${LYc - LR}" width="${LR * 2}" height="${LR * 2}" fill="${SAND}"/><rect x="${LX - LR}" y="${LYc - LR}" width="${LR * 2}" height="${LR * 2}" fill="url(#edg)"/></g>`;
        m += `<circle cx="${LX}" cy="${LYc}" r="${LR}" fill="none" stroke="${C.blueUi}" stroke-width="18"/>`;
        m += text(LX - 130, LYc - 6, 'かげ', { size: 44, w: 900, fill: '#fff' }) + text(LX + 130, LYc - 6, 'ひなた', { size: 40, w: 900, fill: C.ochre });
        a += g(m, { o: lo });
        a += pop(badge('ふちが ぼんやり', { fill: C.blueUi, size: 46 }), t, lk + 0.9, LX, 740);
      }
      out += g(a, { o: aO });
    }
    // B：点の光と、大きさのある光
    const bO = win(t, c1 - 0.3, c3 - 0.3, 0.4);
    if (bO > 0) {
      const q = eio(prog(t, c1 + d1 * 0.42, 1.1));
      const SXc = 700, SYc = 170, Rr = lerp(12, 110, q), GYc = 710;
      const lo = lerp(580, 470, q), li = lerp(580, 690, q), ri = lerp(1300, 1190, q), ro = lerp(1300, 1410, q);
      let b = topBadge();
      b += `<rect x="200" y="${GYc}" width="1520" height="56" rx="8" fill="${SAND}" stroke="${SAND2}" stroke-width="5"/>`;
      b += `<linearGradient id="pen" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1920" y2="0">${[[lo, 0], [li, 0.66], [ri, 0.66], [ro, 0]].map(([x, o]) => `<stop offset="${(x / 1920).toFixed(4)}" stop-color="${SHC}" stop-opacity="${o}"/>`).join('')}</linearGradient>`;
      b += `<rect x="200" y="${GYc}" width="1520" height="56" rx="8" fill="url(#pen)"/>`;
      b += `<path d="M 640 448 L 1000 448 L ${ri} ${GYc} L ${li} ${GYc} Z" fill="${SHC}" opacity="0.13"/>`;
      // ふちをかすめる光（太陽の左はしから・右はしから）
      const rk = eo(prog(t, c1 + 0.3, 1.0));
      [[SXc - Rr, 1000, ro], [SXc + Rr, 1000, ri], [SXc + Rr, 640, lo], [SXc - Rr, 640, li]].forEach(([x0, ex, gx], i) => {
        b += ray(x0, SYc, gx, GYc, rk, { w: 6, seed: i, col: i % 3 === 0 ? LY : '#f28a3c', dots: false });
      });
      b += `<rect x="640" y="432" width="360" height="18" rx="5" fill="#8a6a4a"/>` + text(820, 398, 'もの', { size: 40, w: 900, fill: '#8a6a4a' });
      b += `<circle cx="${SXc}" cy="${SYc}" r="${Rr * 1.9}" fill="#ffe27a" opacity="0.4" filter="url(#glow)"/><circle cx="${SXc}" cy="${SYc}" r="${Rr}" fill="#ffd23a" stroke="#d9a520" stroke-width="5"/>`;
      b += g(badge('てんの ひかりなら、ふちは くっきり', { fill: C.blueUi, size: 38 }), { x: 1380, y: 200, o: win(t, c1 + 0.5, c1 + d1 * 0.42 + 0.2, 0.3) });
      b += g(badge('たいようは おおきさの ある ひかり', { fill: C.ochre, size: 38 }), { x: 1380, y: 200, o: prog(t, c1 + d1 * 0.42 + 0.9, 0.3) });
      // こいかげ・うすいかげ
      const zk = prog(t, c2 + 0.3, 0.4);
      if (zk > 0) {
        let z = `<rect x="${lo}" y="${GYc - 6}" width="${li - lo}" height="68" rx="8" fill="none" stroke="${C.red}" stroke-width="6" stroke-dasharray="14 10"/><rect x="${ri}" y="${GYc - 6}" width="${ro - ri}" height="68" rx="8" fill="none" stroke="${C.red}" stroke-width="6" stroke-dasharray="14 10"/>`;
        z += text((li + ri) / 2, 600, 'こい かげ', { size: 44, w: 900, fill: SHC }) + text(lo - 16, 668, 'うすい かげ', { size: 40, w: 900, fill: C.red, anchor: 'end' }) + text(ro + 16, 668, 'うすい かげ', { size: 40, w: 900, fill: C.red, anchor: 'start' });
        b += g(z, { o: zk });
        b += pop(badge('ひかりが いちぶだけ とどく', { fill: C.red, size: 38 }), t, c2 + 1.0, 1560, 520);
        b += pointer(1480, 556, 1310, 696, C.red, prog(t, c2 + 1.3, 0.3));
      }
      out += g(b, { o: bO });
    }
    // C：手を地面からはなすほど、ぼんやり
    const cO = prog(t, c3 - 0.2, 0.4);
    if (cO > 0) {
      const hk = eio(prog(t, c3 + d3 * 0.2, d3 * 0.55));
      const HX = 760, HYc = lerp(585, 250, hk), SXs = HX + lerp(50, 230, hk), SYs = 700, std = lerp(1.5, 22, hk);
      let c = `<rect width="1920" height="540" fill="#e9f3f8"/><rect y="520" width="1920" height="560" fill="${SAND}"/><rect y="520" width="1920" height="8" fill="${SAND2}"/>`;
      for (let i = 0; i < 4; i++) c += `<line x1="${300 + i * 150 + 40}" y1="60" x2="${300 + i * 150 + 340}" y2="490" stroke="${LY}" stroke-width="6" stroke-dasharray="18 14" stroke-linecap="round" opacity="0.8"/>`;
      c += text(240, 170, 'たいようの ひかり', { size: 40, w: 900, fill: C.ochre });
      c += `<filter id="hb" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${std.toFixed(1)}"/></filter>`;
      c += `<g transform="translate(${SXs} ${SYs}) scale(1 0.5) rotate(90)" opacity="${lerp(0.62, 0.42, hk)}" filter="url(#hb)">${handShape(SHC, 1400)}</g>`;
      c += `<g transform="translate(${HX} ${HYc}) scale(1 0.5) rotate(90)"><g stroke="#d9a98c" stroke-width="14" stroke-linejoin="round">${handShape('#d9a98c', 1400)}</g>${handShape(SKIN, 1400)}</g>`;
      c += arrow(HX + 240, 520, HX + 240, 300, C.ochre, 12, win(t, c3 + d3 * 0.2, c3 + d3 * 0.75, 0.25));
      c += g(badge('じめんに ちかい → くっきり', { fill: C.blueUi, size: 42 }), { x: 1400, y: 250, o: 1 - prog(t, c3 + d3 * 0.45, 0.3) });
      c += pop(badge('はなすと → ぼんやり', { fill: C.redUi, size: 46 }), t, c3 + d3 * 0.55, 1400, 250);
      out += g(c, { o: cO });
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + SDEFS + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.blueUi}"/>` + text(-530, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'からだが ひかりを さえぎって いる', { size: 54, w: 900, anchor: 'start' }) + g(GUESS_ICON[0], { x: 540, y: 0, s: 0.9 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['ひかりは まっすぐ すすむ', C.ochre], ['とどかない ばしょが かげ', SHC], ['ふちを なぞるから おなじ かたち', C.accent]], t, 960, 660, { start: 2.4, step: 1.1, size: 32, gap: 40 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const barIc = `<rect x="-56" y="-26" width="112" height="20" rx="10" fill="${SHC}" opacity="0.7"/><rect x="-56" y="8" width="44" height="20" rx="10" fill="${SHC}" opacity="0.7"/>`;
      const handIc = `<g transform="scale(0.34) translate(0 10)">${handShape(SKIN)}</g>`;
      const items = [
        [barIc, 'あさと おひるの かげの ながさと むきを くらべる', C.ink],
        [handIc, 'てを すこしずつ あげて、かげの ふちを みる', C.ink],
        [noSun(0.82), 'たいようは ぜったいに みない', C.red],
        [warnIcon(0.82), 'どうろでは くるまに きをつけて、おとなと いっしょに', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // 朝とお昼のかげ
      const ck = prog(t, cue(1) + 0.3, 0.5);
      if (ck > 0) {
        let p = g(card(470, 300), { x: 1640, y: 250 });
        p += `<rect x="1425" y="290" width="430" height="90" rx="14" fill="${SAND}"/>`;
        p += text(1520, 150, 'あさ', { size: 38, w: 900, fill: '#d98a3a' }) + text(1760, 150, 'おひる', { size: 38, w: 900, fill: C.blueUi });
        p += lyingShadow('S', 1455, 325, 0.26, 1.5, 0, { o: 0.55 }) + lyingShadow('S', 1765, 320, 0.26, 0.1, 0.9, { o: 0.55 });
        p += `<g transform="translate(1455 325) scale(0.26)">${kidSil('S')}</g><g transform="translate(1765 320) scale(0.26)">${kidSil('S')}</g>`;
        b += g(p, { o: ck });
      }
      b += kidShow('K', t, 1700, 800, { s: 0.72, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「かげ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

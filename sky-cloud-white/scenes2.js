// みのまわり図鑑 動画「白い雲と黒っぽい雨雲、何がちがうの？」（くも）
// 出どころ：everyday-trivia trivia/sky-cloud-white.md・sky-words.md

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
// もくもく雲（上の色 top → 底の色 bot）。足もと（底）が y=70、てっぺんが y=-190
const CLOUD_PARTS = [[-170, 0, 92], [-70, -72, 122], [64, -64, 112], [168, 4, 84], [-10, -20, 110]];
function puff(x, y, s, { top = '#ffffff', bot = '#ffffff', id = 'pf', o = 1, edge = null } = {}) {
  let p = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="-190" x2="0" y2="74"><stop offset="0" stop-color="${top}"/><stop offset="0.45" stop-color="${mix(top, bot, 0.25)}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`;
  let shape = CLOUD_PARTS.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('') + `<rect x="-238" y="-20" width="476" height="94" rx="47"/>`;
  if (edge) p += `<g fill="${edge}" stroke="${edge}" stroke-width="8">${shape}</g>`;
  p += `<g fill="url(#${id})">${shape}</g>`;
  return g(p, { x, y, s, o });
}
// 雨のすじ
const rainLines = (x0, x1, y0, y1, t, { n = 30, col = '#9fb3c4', o = 1, seed = 1 } = {}) => {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd(i, seed)), p = (t * 1.4 + rnd(i, seed + 1)) % 1, y = lerp(y0, y1, p);
    s += `<line x1="${x}" y1="${y}" x2="${x - 8}" y2="${y + 40}" stroke="${col}" stroke-width="5" stroke-linecap="round" opacity="${o * 0.8}"/>`;
  }
  return s;
};
// 水のつぶ
const drop = (x, y, r, o = 1, col = '#cfe8fa') => o <= 0 ? '' : `<g opacity="${clamp(o)}"><circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="#7fb4dc" stroke-width="${Math.max(2, r * 0.12)}"/><circle cx="${x - r * 0.32}" cy="${y - r * 0.32}" r="${r * 0.28}" fill="#fff" opacity="0.85"/></g>`;
const iceBit = (x, y, r, o = 1) => o <= 0 ? '' : `<g opacity="${o}" transform="translate(${x} ${y})">${[0, 60, 120].map(a => `<line x1="${-r}" y1="0" x2="${r}" y2="0" stroke="#8fc7ea" stroke-width="${r * 0.28}" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}</g>`;
// 地面と子ども
const field = (k = 0) => `<path d="M 0 800 Q 480 740 960 790 T 1920 770 L 1920 1080 L 0 1080 Z" fill="${mix('#93cf8c', '#5d7a63', k)}"/><path d="M 0 900 Q 620 840 1240 910 T 1920 880 L 1920 1080 L 0 1080 Z" fill="${mix('#6fba68', '#4c6b52', k)}"/>`;
// 色の光の矢印（7色ではなく、そらの見本の6色）
const COLS = [LIGHT.red, LIGHT.orange, LIGHT.yellow, LIGHT.green, LIGHT.blue, LIGHT.violet];
// 白い光の束（虹色のしま）
function whiteBeam(x1, y1, x2, y2, k = 1, w = 8) {
  if (k <= 0) return '';
  const X = lerp(x1, x2, k), Y = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  let s = `<line x1="${x1}" y1="${y1}" x2="${X}" y2="${Y}" stroke="#fffbe8" stroke-width="${w * 7}" stroke-linecap="round" opacity="0.55"/>`;
  COLS.forEach((c, i) => { const o = (i - 2.5) * w; s += `<line x1="${x1 + nx * o}" y1="${y1 + ny * o}" x2="${X + nx * o}" y2="${Y + ny * o}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="0.9"/>`; });
  return s;
}
// 散らばる光の矢印（中心から外へ）。cols: 色の配列、len: 長さ
function scatterRays(cx, cy, t, cols, { r0 = 30, len = 200, n = 12, k = 1, w = 8, seed = 1, spin = 0 } = {}) {
  if (k <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd(i, seed) * 0.3 + spin, col = cols[i % cols.length];
    const p = ((t * 0.7 + rnd(i, seed + 2)) % 1);
    const L = len * eo(k);
    s += g(arrow2(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * (r0 + L), cy + Math.sin(a) * (r0 + L), col, w), { o: 0.5 + 0.5 * Math.sin(p * Math.PI) });
  }
  return s;
}
const hair = (x0, x1, y, th) => `<rect x="${x0}" y="${y - th / 2}" width="${x1 - x0}" height="${th}" rx="${th / 2}" fill="#6b4a33"/><rect x="${x0}" y="${y - th / 2 + th * 0.14}" width="${x1 - x0}" height="${th * 0.16}" rx="${th * 0.08}" fill="#8a6447" opacity="0.8"/>`;
const thermo = (lv, col) => `<rect x="-18" y="-120" width="36" height="200" rx="18" fill="#fff" stroke="${C.ink}" stroke-width="6"/><circle cx="0" cy="96" r="32" fill="${col}" stroke="${C.ink}" stroke-width="6"/><rect x="-9" y="${80 - 180 * lv}" width="18" height="${180 * lv + 10}" rx="9" fill="${col}"/>`;

// 1. つかみ：白い雲と、黒っぽい雨雲
SCENES.push({
  id: 'hook',
  draw(t) {
    const k = eio(prog(t, cue(1) - 0.2, 2.0));
    let out = skyRect('skh', 0);
    out += `<linearGradient id="dk" x1="0" x2="1"><stop offset="0" stop-color="#5b6b7a" stop-opacity="0"/><stop offset="0.45" stop-color="#5b6b7a" stop-opacity="0.75"/><stop offset="1" stop-color="#3e4a56" stop-opacity="0.95"/></linearGradient><rect width="1920" height="1080" fill="url(#dk)" opacity="${k}"/>`;
    out += sunDisc(260, 190, 64, 0, { glow: 0.7 });
    out += puff(560 + t * 8, 300, 0.85, { id: 'h1' }) + puff(1000 + t * 5, 200, 0.55, { id: 'h2' });
    // 雨雲（右から）
    const rx = lerp(2300, 1480, k);
    out += rainLines(rx - 300, rx + 300, 420, 800, t, { n: 34, o: prog(t, cue(1) + 1.4, 0.6), col: '#c3d0dc' });
    out += puff(rx, 330, 1.45, { top: '#7c8794', bot: '#3d4651', id: 'h3' });
    out += field(k * 0.6);
    out += kidShow('S', t, 300, 840, { s: 0.56, start: 0.2, n: 0, look: [5, -9], side: 'right' });
    out += kidShow('B', t, 470, 840, { s: 0.56, start: 0.5, n: 1, look: [6, -9], bubble: false });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1040, y: 520, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">しろい</tspan> くもと <tspan fill="#5d6874">くろっぽい</tspan> くも</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">なにが ちがうの？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(`<rect x="-330" y="-90" width="300" height="180" rx="22" fill="${SKY.dayMid}"/><rect x="30" y="-90" width="300" height="180" rx="22" fill="#6d7884"/>` + puff(-180, 20, 0.45, { id: 'ti1' }) + puff(180, 20, 0.45, { top: '#7c8794', bot: '#3d4651', id: 'ti2' }), t, t0 + 1.8, 960, 810);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'あまぐもが くろっぽいのは なぜ？', { size: 74, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'ひかりが したまで ぬけられない'], ['②', 'くもの なかに くろい すなが ある'], ['③', 'あめの みずが くろい いろ']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(puff(0, 0, 0.5, { top: '#7c8794', bot: '#3d4651', id: 'gq' }) + text(0, -20, '？', { size: 120, w: 900, fill: '#fff' }), t, cue(0) + 0.6, 1690, 330);
    out += kidShow('B', t, 1690, 840, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1500, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 雲は小さな水のつぶ
SCENES.push({
  id: 'drop',
  draw(t) {
    let out = skyRect('skd', 0) + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.4, 0.4);
    if (aO > 0) {
      let a = puff(480, 470, 1.25, { id: 'd1', edge: '#c9dcea' });
      const lk = prog(t, cue(0) + 0.6, 0.5);
      a += g(`<circle r="70" fill="none" stroke="${C.blueUi}" stroke-width="10"/>`, { x: 560, y: 420, o: lk });
      const mk = eo(prog(t, cue(0) + 1.2, 0.7));
      if (mk > 0) {
        a += `<line x1="610" y1="370" x2="${lerp(610, 1180, mk)}" y2="${lerp(370, 160, mk)}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/><line x1="610" y1="470" x2="${lerp(610, 1180, mk)}" y2="${lerp(470, 720, mk)}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/>`;
        let m = `<circle r="290" fill="#eef7fd" stroke="${C.blueUi}" stroke-width="12"/><clipPath id="mg"><circle r="284"/></clipPath><g clip-path="url(#mg)">`;
        for (let i = 0; i < 46; i++) {
          const x = (rnd(i, 3) - 0.5) * 540 + Math.sin(t * 0.8 + i) * 6, y = (rnd(i, 4) - 0.5) * 540 + Math.cos(t * 0.7 + i) * 6;
          m += i % 9 === 0 ? iceBit(x, y, 16) : drop(x, y, 13 + rnd(i, 5) * 6);
        }
        m += `</g>`;
        a += g(m, { x: 1360, y: 440, s: Math.max(0.001, mk) });
        a += g(badge('みずや こおりの つぶ', { fill: C.blueUi, size: 42 }), { x: 1360, y: 790, o: prog(t, cue(0) + 2.4, 0.3) });
      }
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.4);
    if (bO > 0) {
      let b = `<rect x="160" y="190" width="1600" height="600" rx="40" fill="${C.paper}" opacity="0.94"/>`;
      const th = 300, y = 470;
      b += hair(260, 1420, y, th);
      b += text(840, y, 'かみのけ（とても おおきく した もの）', { size: 40, w: 900, fill: '#fff' });
      // 5つに分ける目もり
      for (let i = 0; i <= 5; i++) b += `<line x1="1470" y1="${y - th / 2 + i * th / 5}" x2="1510" y2="${y - th / 2 + i * th / 5}" stroke="${C.ink}" stroke-width="5"/>`;
      b += `<line x1="1490" y1="${y - th / 2}" x2="1490" y2="${y + th / 2}" stroke="${C.ink}" stroke-width="5"/>`;
      const dk = prog(t, cue(1) + 1.2, 0.5);
      b += g(drop(0, 0, th / 10), { x: 1580, y: y - th / 2 + th / 10, o: dk, s: Math.max(0.001, back(dk)) });
      b += g(`<line x1="1520" y1="${y - th / 2}" x2="1640" y2="${y - th / 2}" stroke="${C.blueUi}" stroke-width="3" stroke-dasharray="6 6"/><line x1="1520" y1="${y - th / 2 + th / 5}" x2="1640" y2="${y - th / 2 + th / 5}" stroke="${C.blueUi}" stroke-width="3" stroke-dasharray="6 6"/>`, { o: dk });
      b += g(badge('くもの つぶ ＝ かみのけの ふとさの 5ぶんの1くらい', { fill: C.blueUi, size: 40 }), { x: 960, y: 720, o: prog(t, cue(1) + 2.2, 0.3) });
      b += g(text(0, 0, '↑ くもの つぶ', { size: 36, w: 900, fill: C.blueUi }), { x: 1560, y: y + th / 2 + 44, o: prog(t, cue(1) + 1.6, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 4. 雲のでき方
SCENES.push({
  id: 'form',
  draw(t) {
    let out = skyRect('skf', 0) + topBadge() + sunDisc(1700, 180, 56, 0, { glow: 0.6 }) + field(0);
    // 空気のかたまりがのぼる
    const up = eio(prog(t, cue(0) + 0.3, 3.2));
    const py = lerp(720, 330, up), pr = lerp(90, 170, up);
    const cool = up;
    let p = `<circle r="${pr}" fill="${mix('#ffd9b0', '#d6ecfa', cool)}" opacity="0.55" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 10"/>`;
    // 見えない水（点線の小さな丸）と ちり
    const st = prog(t, cue(1) + 0.8, 1.6);
    for (let i = 0; i < 14; i++) {
      const a = rnd(i, 7) * Math.PI * 2, rr = Math.sqrt(rnd(i, 8)) * pr * 0.8;
      const vx = Math.cos(a) * rr, vy = Math.sin(a) * rr;
      const j = Math.floor(i / 2), da = rnd(j, 9) * Math.PI * 2, dr = Math.sqrt(rnd(j, 10)) * pr * 0.7;
      const dx = Math.cos(da) * dr, dy = Math.sin(da) * dr;
      const x = lerp(vx, dx + (i % 2 ? 10 : -10), st), y = lerp(vy, dy, st);
      if (i % 2 === 0) p += `<circle cx="${dx}" cy="${dy}" r="6" fill="#8a6a4a" opacity="${prog(t, cue(1) + 0.2, 0.4)}"/>`;
      p += st < 1 ? `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#7fb4dc" stroke-width="3" stroke-dasharray="4 4" opacity="${prog(t, cue(1), 0.4) * (1 - st)}"/>` : '';
    }
    for (let j = 0; j < 7; j++) { const da = rnd(j, 9) * Math.PI * 2, dr = Math.sqrt(rnd(j, 10)) * pr * 0.7; p += drop(Math.cos(da) * dr, Math.sin(da) * dr, 16, st); }
    out += g(p, { x: 760, y: py, o: 1 - prog(t, cue(2) - 0.2, 0.5) });
    out += g(arrow2(0, 120, 0, -120, C.redUi, 12), { x: 460, y: 520, o: win(t, cue(0) + 0.3, cue(1), 0.3) });
    out += pop(badge('のぼる', { fill: C.redUi, size: 42 }), t, cue(0) + 0.6, 460, 360, { end: cue(1) });
    out += pop(badge('ふくらむ', { fill: C.blueUi, size: 42 }), t, cue(0) + 1.6, 1100, 380, { end: cue(1) });
    out += pop(thermo(lerp(0.75, 0.25, cool), lerp(0, 1, cool) > 0.5 ? C.blueUi : C.redUi) + text(0, 170, 'ひえる', { size: 40, w: 900, fill: C.blueUi }), t, cue(0) + 0.8, 1340, 520, { end: cue(2) - 0.2 });
    out += callout(760 + 40, 330 - 50, 1180, 200, 'みえない みず', prog(t, cue(1) + 0.2, 0.3) * (1 - prog(t, cue(1) + 2.6, 0.3)), { col: '#5b8fb0', size: 40 });
    out += callout(760 + 20, 330 + 60, 1000, 690, 'ちり', prog(t, cue(1) + 1.0, 0.3) * (1 - prog(t, cue(2) - 0.4, 0.3)), { col: '#8a6a4a', size: 40 });
    // 雲になって、下からの風で うかぶ
    const cO = prog(t, cue(2) - 0.4, 0.6);
    if (cO > 0) {
      out += puff(760, 330 + Math.sin(t * 1.5) * 8, 1.2, { id: 'f1', o: cO });
      for (let i = 0; i < 3; i++) { const p2 = (t * 0.6 + i / 3) % 1; out += g(arrow2(0, 140, 0, 0, '#5b8fb0', 12), { x: 560 + i * 200, y: lerp(800, 520, p2), o: cO * Math.sin(p2 * Math.PI) }); }
      out += g(badge('したからの かぜ', { fill: '#5b8fb0', size: 44 }), { x: 1340, y: 640, o: prog(t, cue(2) + 0.8, 0.3) });
    }
    return out;
  },
});

// 5. 空気のつぶと、雲のつぶ
SCENES.push({
  id: 'compare', night: true,
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + stars(5, 40) + topBadge(true);
    const panel = (x, title, col) => `<rect x="${x - 420}" y="170" width="840" height="620" rx="36" fill="${C.night2}"/>` + text(x, 240, title, { size: 50, w: 900, fill: col });
    const lO = prog(t, 0.3, 0.4);
    if (lO > 0) {
      let l = panel(500, 'くうきの つぶ（とても ちいさい）', '#cfe0ff');
      l += whiteBeam(110, 500, 470, 500, prog(t, cue(0) + 0.6, 0.8), 5);
      l += `<circle cx="500" cy="500" r="6" fill="#fff"/>`;
      l += scatterRays(500, 500, t, [LIGHT.blue, LIGHT.blue, LIGHT.violet, LIGHT.blue, LIGHT.green, LIGHT.blue], { r0: 20, len: 170, n: 10, k: prog(t, cue(0) + 1.4, 0.6), w: 7, seed: 2 });
      l += g(badge('あおを おおく ちらす', { fill: LIGHT.blue, size: 40 }), { x: 500, y: 730, o: prog(t, cue(0) + 2.2, 0.3) });
      out += g(l, { o: lO });
    }
    const rO = prog(t, cue(1) - 0.2, 0.4);
    if (rO > 0) {
      let r = panel(1420, 'くもの つぶ（ずっと おおきい）', '#e6f2fb');
      const gr = back(prog(t, cue(1) + 0.3, 0.6));
      r += g(drop(0, 0, 80), { x: 1420, y: 490, s: Math.max(0.001, gr) });
      r += whiteBeam(1030, 490, 1330, 490, prog(t, cue(2) + 0.2, 0.7), 6);
      r += scatterRays(1420, 490, t, COLS, { r0: 92, len: 150, n: 12, k: prog(t, cue(2) + 0.9, 0.6), w: 8, seed: 4 });
      r += g(badge('どの いろも おなじくらい ちらす', { fill: '#7a8a9c', size: 38 }), { x: 1420, y: 730, o: prog(t, cue(2) + 1.8, 0.3) });
      out += g(r, { o: rO });
    }
    return out;
  },
});

// 6. だから雲は白い
SCENES.push({
  id: 'white',
  draw(t) {
    let out = skyRect('skw', 0) + topBadge();
    const aO = 1 - prog(t, cue(3) - 0.4, 0.4);
    if (aO > 0) {
      let a = sunDisc(260, 240, 80, 0);
      a += g(badge('しろい ひかり', { fill: 'rgba(255,255,255,0.85)', color: C.ink, size: 40 }), { x: 260, y: 400, o: prog(t, cue(0) + 0.4, 0.3) });
      a += whiteBeam(340, 290, 760, 470, prog(t, cue(0) + 0.6, 0.9), 8);
      const sc = prog(t, cue(1) + 0.4, 0.8);
      a += scatterRays(980, 470, t, COLS, { r0: 210, len: 140, n: 18, k: sc, w: 8, seed: 6 });
      a += `<circle cx="980" cy="470" r="${300 + 20 * Math.sin(t * 2)}" fill="#fff" opacity="${0.45 * sc}" filter="url(#glow)"/>`;
      a += puff(980, 480, 1.25, { id: 'w1' });
      a += g(badge('いろが かたよらない → しろ', { fill: C.blueUi, size: 42 }), { x: 1460, y: 220, o: prog(t, cue(1) + 1.8, 0.3) });
      a += kidShow('B', t, 1620, 860, { s: 0.55, start: cue(2) - 0.8, n: 0 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(3) - 0.3, 0.4);
    if (bO > 0) {
      let b = `<rect x="260" y="170" width="1400" height="620" rx="40" fill="${C.paper}"/>`;
      b += pop(badge('1908ねん', { fill: C.ochre, size: 56 }), t, cue(3), 960, 290);
      b += pop(text(0, 0, 'ドイツの ミーさんが けいさん', { size: 64, w: 900 }), t, cue(3) + 0.9, 960, 430);
      b += pop(drop(-140, 0, 60) + scatterRays(-140, 0, t, COLS, { r0: 70, len: 70, n: 12, k: 1, w: 6, seed: 9 }) + `<rect x="60" y="-80" width="220" height="160" rx="10" fill="#fff" stroke="${C.line}" stroke-width="4"/>` + [0, 1, 2, 3].map(i => `<line x1="90" y1="${-46 + i * 32}" x2="${250 - (i % 2) * 50}" y2="${-46 + i * 32}" stroke="${C.muted}" stroke-width="6" stroke-linecap="round"/>`).join(''), t, cue(3) + 1.8, 960, 620);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 7. 雲の底が灰色なわけ
SCENES.push({
  id: 'bottom',
  draw(t) {
    let out = skyRect('skb', 0) + topBadge();
    const gk = eio(prog(t, cue(2) + 1.4, 1.4));
    const CX = 800, CY = 600, S = 1.7;
    // 上からの日の光
    const sk = prog(t, cue(1) - 0.2, 0.6);
    for (let i = 0; i < 4; i++) { const x = CX - 300 + i * 200; out += g(whiteBeam(x - 70, 130, x, 300, sk, 4), {}); }
    out += puff(CX, CY, S, { top: '#ffffff', bot: mix('#ffffff', '#8a95a1', gk), id: 'b1' });
    // 散らされた光は上や横へ
    const rk = prog(t, cue(1) + 0.8, 0.6);
    if (rk > 0) {
      [[-60, -290, -220, -420], [120, -290, 280, -420], [-360, -110, -560, -160], [370, -100, 540, -150], [-330, 30, -530, 20], [340, 40, 520, 30]].forEach(([x1, y1, x2, y2], i) => {
        const o = 0.6 + 0.4 * Math.sin(t * 3 + i);
        out += g(arrow2(CX + x1, CY + y1, CX + lerp(x1, x2, eo(rk)), CY + lerp(y1, y2, eo(rk)), '#fff6c8', 12), { o });
      });
      out += g(arrow2(0, 0, 0, 90, '#fff6c8', 6), { x: CX, y: CY + 160, o: 0.35 * rk });
    }
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1460, y: 330, o: win(t, cue(0) + 0.4, cue(1), 0.3) });
    out += pop(badge('うえや よこへ いく ひかりが おおい', { fill: C.blueUi, size: 40 }), t, cue(1) + 1.6, 1460, 180);
    out += callout(CX + 100, CY - 250, 1360, 330, 'うえ・よこ：あかるい', prog(t, cue(2) + 0.8, 0.3), { col: C.ochre, size: 44 });
    out += callout(CX + 140, CY + 100, 1360, 640, 'そこ：はいいろ', prog(t, cue(2) + 2.2, 0.3), { col: '#5d6874', size: 44 });
    out += field(0);
    return out;
  },
});

// 8. 雨雲は光をさえぎる
const ZIG = [
  [[620, 60], [640, 200], [560, 290], [700, 380], [600, 300], [480, 230], [380, 130]],
  [[960, 60], [980, 210], [1080, 300], [940, 400], [1040, 470], [1200, 400], [1320, 300], [1500, 220]],
  [[1300, 60], [1280, 220], [1180, 330], [1300, 430], [1340, 360], [1460, 260], [1420, 140], [1500, 40]],
];
function zigAt(P, k) {
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const d = clamp(k) * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < d) i++;
  const f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  return { i, x: lerp(P[i - 1][0], P[i][0], f), y: lerp(P[i - 1][1], P[i][1], f) };
}
SCENES.push({
  id: 'rain', night: true,
  draw(t) {
    let out = `<linearGradient id="rsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55606c"/><stop offset="1" stop-color="#2f363e"/></linearGradient><rect width="1920" height="1080" fill="url(#rsk)"/>`;
    out += field(0.85);
    out += rainLines(200, 1720, 560, 880, t, { n: 50, col: '#aebccb', o: 0.9 });
    // ぶあつい雨雲（横長）
    let c = '';
    [[300, 300, 210], [560, 220, 240], [860, 240, 260], [1160, 210, 250], [1460, 260, 230], [1680, 320, 190], [960, 380, 300]].forEach(([x, y, r]) => { c += `<circle cx="${x}" cy="${y}" r="${r}"/>`; });
    out += `<linearGradient id="rcl" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="600"><stop offset="0" stop-color="#9aa4ae"/><stop offset="1" stop-color="#2c333b"/></linearGradient><g fill="url(#rcl)">${c}<rect x="140" y="300" width="1640" height="260" rx="120"/></g>`;
    // 中の大きなつぶ
    const dO = prog(t, cue(0) + 0.6, 0.6);
    for (let i = 0; i < 40; i++) {
      const x = lerp(260, 1660, rnd(i, 21)), y = lerp(120, 520, rnd(i, 22));
      out += drop(x, y + Math.sin(t + i) * 4, 18 + rnd(i, 23) * 10, dO * 0.85, '#b9cfe0');
    }
    out += g(badge('おおきな みずの つぶが いっぱい', { fill: 'rgba(30,36,44,0.8)', size: 40 }), { x: 960, y: 640, o: win(t, cue(0) + 1.2, cue(1) + 0.2, 0.3) });
    // 光がジグザグに向きを変える
    const zk = prog(t, cue(1) - 0.2, 4.5);
    ZIG.forEach((P, j) => {
      const k = clamp((zk - j * 0.12) / 0.8);
      if (k <= 0) return;
      const h = zigAt(P, k);
      let d = `M ${P[0][0]} ${P[0][1]}`; for (let i = 1; i < h.i; i++) d += ` L ${P[i][0]} ${P[i][1]}`; d += ` L ${h.x} ${h.y}`;
      out += `<path d="${d}" fill="none" stroke="#fff2a8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
      out += `<circle cx="${h.x}" cy="${h.y}" r="18" fill="#fff6c8" filter="url(#soft)"/><circle cx="${h.x}" cy="${h.y}" r="10" fill="#fffbe8"/>`;
    });
    // 下へ通れない
    const xO = prog(t, cue(2) + 1.2, 0.4);
    if (xO > 0) {
      out += g(arrow2(0, -80, 0, 80, '#fff2a8', 12) + `<path d="M -50 -50 L 50 50 M 50 -50 L -50 50" stroke="${C.red}" stroke-width="16" stroke-linecap="round"/>`, { x: 960, y: 700, o: xO });
      out += g(badge('したまで ぬけられない', { fill: C.redUi, size: 42 }), { x: 960, y: 810, o: prog(t, cue(2) + 2.0, 0.3) });
    }
    out += topBadge(true) + kidShow('S', t, 1640, 840, { s: 0.5, start: cue(3) - 0.8, n: 0, side: 'left' });
    return out;
  },
});

// 9. おまけ：sky は もともと「雲」
SCENES.push({
  id: 'words',
  draw(t) {
    let out = skyRect('sko', 0) + topBadge();
    out += pop(badge('おまけ', { fill: C.ochre, size: 46 }), t, 0.3, 960, 170);
    out += pop(card(560, 360) + text(0, -30, 'sky', { size: 150, w: 900, fill: C.blueUi, ls: 0.02 }) + text(0, 110, 'スカイ ＝ そら', { size: 48, w: 900, fill: C.ink }), t, cue(0) + 0.6, 560, 500);
    const ak = prog(t, cue(1) + 0.4, 0.5);
    out += g(arrow2(0, 0, 220, 0, C.ink, 14) + text(110, -50, 'もとは', { size: 44, w: 900, fill: C.ink }), { x: 900, y: 500, o: ak });
    out += pop(card(520, 360) + `<rect x="-230" y="-150" width="460" height="220" rx="20" fill="${SKY.dayMid}"/>` + puff(0, 10, 0.55, { id: 'wd' }) + text(0, 130, '「くも」', { size: 56, w: 900, fill: C.ink }), t, cue(1) + 1.0, 1440, 500);
    return out;
  },
});

// 10. 正解 と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -560;
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'ひかりが したまで ぬけられない', { size: 60, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['つぶは どの いろも ちらす', C.blueUi], ['だから くもは しろい', C.accent], ['ぶあつい あまぐもは くらい', '#5d6874']], t, 960, 600, { start: 2.4, step: 0.9, size: 36, gap: 28 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [`<rect x="-62" y="-46" width="124" height="92" rx="16" fill="${SKY.dayMid}"/>` + puff(0, 14, 0.22, { id: 'l1' }), 'もくもくした くもを 1つ えらぶ', C.ink, cue(1)],
        [`<rect x="-62" y="-46" width="124" height="92" rx="16" fill="${SKY.dayMid}"/>` + puff(0, 14, 0.22, { id: 'l2', bot: '#8a95a1' }), 'うえや よこと、そこの いろを くらべる', C.ink, cue(2)],
        [`<rect x="-62" y="-46" width="124" height="92" rx="16" fill="${SKY.dayMid}"/>` + puff(0, 14, 0.22, { id: 'l3', top: '#7c8794', bot: '#3d4651' }), 'あつい くもの そこも くらべる', C.ink, cue(3)],
        [warnIcon, 'たいようは ぜったいに ちょくせつ みない', C.red, cue(4)],
      ];
      items.forEach(([ic, s, col, st], i) => { b += pop(g(ic, { s: 0.8 }) + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, st, 230, 330 + i * 135); });
      const mO = prog(t, cue(2) + 0.4, 0.5);
      if (mO > 0) {
        let m = `<rect x="-240" y="-260" width="480" height="480" rx="36" fill="${SKY.dayMid}"/>` + puff(0, 20, 0.78, { id: 'l4', bot: '#8a95a1' });
        m += text(0, -200, 'しろい', { size: 40, w: 900, fill: C.blueUi }) + text(0, 150, 'はいいろ', { size: 40, w: 900, fill: '#5d6874' });
        b += g(m, { x: 1500, y: 470, o: mO, s: lerp(0.9, 1, eo(mO)) });
      }
      b += kidShow('K', t, 1790, 845, { s: 0.5, start: cue(1) + 0.8, n: 1, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「そらの いろ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

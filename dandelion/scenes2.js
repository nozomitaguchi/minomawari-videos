
// みのまわり図鑑 動画「たんぽぽの わたげは、どうして とおくまで とべるの？」（たんぽぽ）
// 出どころ：everyday-trivia trivia/dandelion-seed-flight.md（絵の見本：assets/figures-dandelion.js）

// ---------- たんぽぽの道具 ----------
const DC = {
  hair: '#8a929b', hairLt: '#c4cad1', seed: '#9a6b3f', seedDk: '#6f4a28', beak: '#a3916f', hub: '#c9b58f',
  stem: '#6aa457', stemDk: '#4a7a3e', leaf: '#5fae5f', leafDk: '#3f8f4a',
  air: '#4f95d6', airDk: '#2f6fb0', airLt: '#bcd9f2', ring: '#2f7de1', ringLt: '#9cc4f5',
  grass: '#8ccf7f', grass2: '#6fba68', plate: '#8b9299', plateDk: '#5f666d', rain: '#5b9bd5', wet: '#d9655c',
};
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

// わたげの一つぶ（横から）。毛のつけねが (x, y)。毛は上へ扇の形に広がり、下に細い軸と たねが ぶら下がる。
//   L: 毛の長さ ／ open: 1 ひらく 〜 0 とじる（毛が上へ集まる）／ rot: かたむき（度）／ stalk: 軸の長さ（L の何倍か）／ hub: つけねの ふくらみ 0〜1
function wata(x, y, L, { open = 1, n = 25, rot = 0, stalk = 0.8, o = 1, col = DC.hair, seed = true, hub = 0, sw = null } = {}) {
  if (o <= 0.01) return '';
  const spread = 10 + 70 * open, w = sw || Math.max(1.6, L * 0.016);
  let d = '', d2 = '';
  for (let i = 0; i < n; i++) {
    const a = (-spread + 2 * spread * i / (n - 1)) * Math.PI / 180, len = L * (0.86 + 0.14 * Math.cos(i * 1.7));
    d += `M 0 0 L ${(Math.sin(a) * len).toFixed(1)} ${(-Math.cos(a) * len).toFixed(1)} `;
    if (i < n - 1) { const b = (-spread + 2 * spread * (i + 0.5) / (n - 1)) * Math.PI / 180, l2 = L * (0.7 + 0.1 * Math.sin(i * 2.3)); d2 += `M 0 0 L ${(Math.sin(b) * l2).toFixed(1)} ${(-Math.cos(b) * l2).toFixed(1)} `; }
  }
  let s = `<path d="${d2}" stroke="${col}" stroke-width="${w * 0.8}" stroke-linecap="round" fill="none" opacity="0.45"/><path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  if (seed) {
    const sy = L * stalk, rx = L * 0.075, ry = L * 0.19;
    s += `<line x1="0" y1="0" x2="0" y2="${sy}" stroke="${DC.beak}" stroke-width="${Math.max(2, L * 0.022)}" stroke-linecap="round"/>`;
    s += `<ellipse cx="0" cy="${sy + ry}" rx="${rx}" ry="${ry}" fill="${DC.seed}"/><path d="M ${-rx * 0.35} ${sy + ry * 0.4} L ${-rx * 0.35} ${sy + ry * 1.6}" stroke="${DC.seedDk}" stroke-width="${Math.max(1.2, L * 0.012)}" stroke-linecap="round" opacity="0.7"/>`;
  }
  const hr = L * (0.035 + 0.06 * hub);
  s += `<circle r="${hr}" fill="${hub > 0 ? mix(DC.hub, DC.wet, hub) : DC.hub}"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${clamp(o)}">${s}</g>`;
}
// 丸い わたげの玉。miss: もう飛んでいった たねの番号。open: 0 だと 毛が とじる
const puffPos = (i, n, x, y, r) => { const deg = 360 * i / n, a = deg * Math.PI / 180; return [x + Math.sin(a) * r * 0.6, y - Math.cos(a) * r * 0.6, deg]; };
function puff(x, y, r, { miss = [], open = 1, n = 24, col = '#fff' } = {}) {
  let s = '';
  const hn = r > 200 ? 15 : r > 120 ? 11 : 9, bw = Math.max(1.2, r * 0.008);
  for (let i = 0; i < n; i++) { if (miss.includes(i)) continue; const [px, py] = puffPos(i, n, x, y, r); s += `<circle cx="${px}" cy="${py}" r="${r * (0.2 + 0.22 * open)}" fill="#fff" opacity="0.13"/>`; }
  for (let i = 0; i < 12; i++) {  // 奥の たね
    if (miss.includes(i * 2) || miss.includes(i * 2 + 1)) continue;
    const a = (30 * i + 15) * Math.PI / 180, px = x + Math.sin(a) * r * 0.3, py = y - Math.cos(a) * r * 0.3;
    s += wata(px, py, r * 0.36, { open, rot: 30 * i + 15, n: 7, seed: false, col, o: 0.6 });
  }
  for (let i = 0; i < n; i++) {  // あいだの たね（少し内がわ）
    if (miss.includes(i) || miss.includes((i + 1) % n)) continue;
    const deg = 360 * (i + 0.5) / n, a = deg * Math.PI / 180, px = x + Math.sin(a) * r * 0.5, py = y - Math.cos(a) * r * 0.5;
    s += wata(px, py, r * 0.4, { open, rot: deg, n: hn - 2, seed: false, col, o: 0.75 });
  }
  for (let i = 0; i < n; i++) {
    if (miss.includes(i)) continue;
    const [px, py, deg] = puffPos(i, n, x, y, r);
    s += `<line x1="${x}" y1="${y}" x2="${px}" y2="${py}" stroke="#e9dcc0" stroke-width="${bw}" opacity="0.75"/>`;
    s += wata(px, py, r * 0.42, { open, rot: deg, n: hn, seed: false, col });
  }
  for (let i = 0; i < 10; i++) { const a = i * 36 * Math.PI / 180; s += `<ellipse cx="${x + Math.sin(a) * r * 0.1}" cy="${y - Math.cos(a) * r * 0.1}" rx="${r * 0.035}" ry="${r * 0.08}" fill="${DC.seed}" transform="rotate(${i * 36} ${x + Math.sin(a) * r * 0.1} ${y - Math.cos(a) * r * 0.1})"/>`; }
  return s + `<circle cx="${x}" cy="${y}" r="${r * 0.07}" fill="${DC.hub}"/>`;
}
const stem = (x, y, bx, by, w = 12) => `<path d="M ${bx} ${by} Q ${bx - 16} ${(y + by) / 2} ${x} ${y}" fill="none" stroke="${DC.stem}" stroke-width="${w}" stroke-linecap="round"/>`;
// ねもとの ぎざぎざの葉
function leaves(x, y, s = 1) {
  const leaf = (rot, len) => { let d = 'M 0 0 '; const N = 5; for (let i = 1; i <= N; i++) { const u = i / N * len; d += `L ${u - len / N * 0.55} ${-(10 + 16 * Math.sin(i / N * Math.PI))} L ${u - len / N * 0.2} ${-(3 + 5 * Math.sin(i / N * Math.PI))} `; } d += `L ${len} 0 `; for (let i = N; i >= 1; i--) { const u = i / N * len; d += `L ${u - len / N * 0.2} ${3 + 5 * Math.sin(i / N * Math.PI)} L ${u - len / N * 0.55} ${10 + 16 * Math.sin(i / N * Math.PI)} `; } return `<path d="${d}Z" fill="${DC.leaf}" stroke="${DC.leafDk}" stroke-width="3" stroke-linejoin="round" transform="rotate(${rot})"/>`; };
  return `<g transform="translate(${x} ${y}) scale(${s})">${leaf(-158, 120)}${leaf(-22, 125)}${leaf(-128, 90)}${leaf(-52, 95)}</g>`;
}
// 上から見た わたげ（約100本の毛）。k: かく本数の わりあい
function topView(cx, cy, r, { n = 100, k = 1, col = DC.hair, sw = 2.2 } = {}) {
  let d = ''; const m = Math.round(n * clamp(k));
  for (let i = 0; i < m; i++) { const a = 2 * Math.PI * i / n - Math.PI / 2, l = r * (0.93 + 0.07 * Math.cos(i * 2.9)); d += `M ${(cx + Math.cos(a) * r * 0.05).toFixed(1)} ${(cy + Math.sin(a) * r * 0.05).toFixed(1)} L ${(cx + Math.cos(a) * l).toFixed(1)} ${(cy + Math.sin(a) * l).toFixed(1)} `; }
  return `<path d="${d}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" fill="none"/><circle cx="${cx}" cy="${cy}" r="${r * 0.055}" fill="${DC.seed}"/>`;
}
// 下から上へ流れる空気（点線が上へ動く）
function airUp(t, x, y0, y1, o = 1, { col = DC.air, w = 7, sp = 240, head = true } = {}) {
  if (o <= 0.01) return '';
  return g(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1 + (head ? 14 : 0)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="30 24" stroke-dashoffset="${-t * sp}"/>` +
    (head ? `<path d="M ${x} ${y1 - 12} L ${x - 17} ${y1 + 20} L ${x + 17} ${y1 + 20} Z" fill="${col}"/>` : ''), { o });
}
// 空気のうず。dir = 1 で時計まわり、-1 で反時計まわり
function swirl(cx, cy, r, dir, t, { col = DC.ring, o = 1, w = 8, sp = 2.4 } = {}) {
  if (o <= 0.01) return '';
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="0.12"/>`;
  for (let k = 0; k < 2; k++) {
    const a0 = dir * t * sp + k * Math.PI, a1 = a0 + dir * 2.1;
    const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r, x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    s += `<path d="M ${x0} ${y0} A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x1} ${y1}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    const tx = -Math.sin(a1) * dir, ty = Math.cos(a1) * dir, h = w * 2.3;
    s += `<path d="M ${x1 + tx * h} ${y1 + ty * h} L ${x1 - ty * h * 0.8} ${y1 + tx * h * 0.8} L ${x1 + ty * h * 0.8} ${y1 - tx * h * 0.8} Z" fill="${col}"/>`;
  }
  return g(s, { o });
}
// 空気のわっか（うずの輪）を横から。左右に見えるのが輪の切り口で、外がわが上へ、まん中が下へ回る
function vring(t, cx, cy, R, r, o = 1) {
  if (o <= 0.01) return '';
  return g(`<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.2}" fill="none" stroke="${DC.ringLt}" stroke-width="${r * 0.9}" opacity="0.4"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.2}" fill="none" stroke="${DC.ring}" stroke-width="4" stroke-dasharray="14 12" opacity="0.8"/>` +
    swirl(cx - R, cy, r, 1, t) + swirl(cx + R, cy, r, -1, t), { o });
}
const sunIcon = (x, y, r = 50, t = 0) => `<g transform="translate(${x} ${y})">` + Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4 + t * 0.3; return `<line x1="${Math.cos(a) * r * 1.35}" y1="${Math.sin(a) * r * 1.35}" x2="${Math.cos(a) * r * 1.75}" y2="${Math.sin(a) * r * 1.75}" stroke="#f0b63a" stroke-width="${r * 0.18}" stroke-linecap="round"/>`; }).join('') + `<circle r="${r}" fill="#ffd95a"/><circle r="${r}" fill="url(#lampshine)" opacity="0.6"/></g>`;
const rainDrops = (x, y, t, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">` + [[0, 0], [46, 26], [92, -6], [22, 66], [72, 74], [120, 44]].map(([a, b], i) => { const f = ((t * 0.9 + i * 0.17) % 1) * 34; return `<line x1="${a - f * 0.3}" y1="${b + f}" x2="${a - 9 - f * 0.3}" y2="${b + 26 + f}" stroke="${DC.rain}" stroke-width="8" stroke-linecap="round" opacity="${1 - f / 50}"/>`; }).join('') + '</g>';
// 横にふく風のすじ
const windLine = (t, x, y, len = 150, o = 1, col = '#fff', i = 0) => { const f = ((t * 0.5 + i * 0.37) % 1); return `<line x1="${x + f * 260}" y1="${y}" x2="${x + f * 260 + len}" y2="${y}" stroke="${col}" stroke-width="8" stroke-linecap="round" opacity="${o * Math.sin(f * Math.PI) * 0.85}"/>`; };
const meadow = (id, gy = 760) => skyRect(id, 0) + `<path d="M 0 ${gy} Q 480 ${gy - 50} 960 ${gy - 6} T 1920 ${gy - 20} L 1920 1080 L 0 1080 Z" fill="${DC.grass}"/><path d="M 0 ${gy + 130} Q 620 ${gy + 70} 1240 ${gy + 140} T 1920 ${gy + 110} L 1920 1080 L 0 1080 Z" fill="${DC.grass2}"/>`;

// 1. つかみ：ふうっと吹くと わたげが飛ぶ → 上から見ると すきまだらけ
const HP = { x: 700, y: 540, r: 165 }, FLY = [2, 3, 4, 5, 6, 7, 8, 9];
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = meadow('dh', 800) + cloud(300 + t * 8, 210, 0.9) + cloud(930 + t * 3, 150, 0.7) + cloud(1760 - t * 4, 300, 0.55, '#fff', 0.85);
    const tb = cue(0) + 0.5, st = j => tb + 0.3 + j * 0.42;
    out += stem(HP.x, HP.y, 690, 910, 13) + leaves(690, 912, 1.25);
    out += puff(HP.x, HP.y, HP.r, { miss: FLY.filter((_, j) => t > st(j)) });
    // ふうっ
    const bw = win(t, tb - 0.2, tb + 2.6, 0.25);
    if (bw > 0) {
      for (let i = 0; i < 3; i++) { const f = ((t - tb) * 1.3 + i * 0.33) % 1; out += `<line x1="${270 + f * 220}" y1="${700 - f * 90 + i * 16}" x2="${330 + f * 220}" y2="${676 - f * 90 + i * 16}" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="${bw * Math.sin(clamp(f) * Math.PI)}"/>`; }
      out += g(text(0, 0, 'ふうっ', { size: 54, w: 900, fill: '#fff' }), { x: 380, y: 760, o: bw });
    }
    // 飛んでいく わたげ（たねを下にして、右へ）
    FLY.forEach((i, j) => {
      const age = t - st(j); if (age <= 0) return;
      const [px, py, deg] = puffPos(i, 24, HP.x, HP.y, HP.r);
      const vx = 150 + rnd(j, 41) * 80, x = px + vx * age + 50 * (1 - Math.exp(-age * 2)), y = py - (60 + rnd(j, 42) * 60) * (1 - Math.exp(-age * 0.8)) + age * 12 + Math.sin(age * 1.6 + j) * 14;
      if (x < 2060) out += wata(x, y, HP.r * 0.42, { rot: deg * Math.exp(-age * 2.4) + Math.sin(age * 1.6 + j) * 7, n: 11, col: '#fff', stalk: 1.25 });
    });
    // 上から見ると
    const pk = prog(t, cue(1) - 0.1, 0.5);
    if (pk > 0) {
      const p = `<circle r="300" fill="#fffdf6" filter="url(#shadow)"/><circle r="262" fill="${DC.airLt}" opacity="0.4"/>` + topView(0, 0, 256, { k: prog(t, cue(1) + 0.3, 1.8), sw: 2.4 });
      out += g(p, { x: 1400, y: 450, s: Math.max(back(pk), 0.001), o: pk });
      out += pop(badge('うえから みると', { fill: C.blueUi, size: 42 }), t, cue(1) + 0.2, 1400, 126);
      out += pop(badge('すきまだらけ', { fill: C.ochre, size: 50, pad: 44 }), t, cue(1) + 3.2, 1400, 778);
    }
    out += pop(text(0, 0, '？', { size: 230, w: 900, fill: C.ochre, extra: 'stroke="#fff" stroke-width="16" paint-order="stroke" stroke-linejoin="round"' }), t, cue(3) + 0.6, 1000, 300);
    out += kidShow('B', t, 170, 900, { s: 0.5, start: 0.2, n: 0 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 270);
      const l1 = 'たんぽぽの わたげは', l2 = 'どうして とおくまで とべるの？';
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.ochre}">たんぽぽ</tspan>の わたげは</text>`, { x: 960, y: 450, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="${fit(l2, 1640, 116, 900)}" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.blueUi}">とおくまで</tspan> とべるの？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = wata(-190, 0, 120, { rot: -8, sw: 3 }) + wata(10, -50, 100, { rot: 6, sw: 3 }) + wata(200, 10, 110, { rot: -4, sw: 3 });
      out += pop(ic, t, t0 + 1.8, 960, 830);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const q = 'すきまだらけなのに、とおくまで とべるのは どうして？';
    out += pop(text(0, 0, q, { size: fit(q, 1340, 58, 900), w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'けが、はねのように はばたくから'], ['②', 'けから、したに かぜを ふきだすから'], ['③', 'わたげの うえに、くうきの わっかが できるから']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 50)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(wata(0, 0, 120, { rot: Math.sin(t * 1.4) * 6 }) + text(130, -70, '？', { size: 110, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1640, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 610, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. わたげのつくり：上に細い毛、細い軸の下に たね
SCENES.push({
  id: 'parts',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const fk = prog(t, cue(2) - 0.2, 0.6);
    const sway = Math.sin(t * 1.3) * (2 + 3 * fk), dy = -40 * fk + 130 * prog(t, cue(2) + 0.4, 5.5) + Math.sin(t * 1.1) * 6 * fk;
    out += pop(wata(0, 0, 265, { n: 31, rot: sway }), t, 0.2, 960, 420 + dy, { d: 0.7 });
    const hl = win(t, cue(0) + 0.9, cue(1) - 0.1, 0.3);
    if (hl > 0) out += `<path d="M 700 372 A 265 265 0 0 1 1220 372" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-dasharray="6 18" stroke-linecap="round" opacity="${hl}"/>`;
    const tg = 1 - fk;
    out += tag(1150, 300, 1500, 250, 'ほそい け（わたげ）', Math.min(prog(t, cue(0) + 1.0, 0.4), tg), { col: C.blueUi, size: 44 });
    out += tag(962, 530, 1400, 520, 'ほそい じく', Math.min(prog(t, cue(1) + 0.4, 0.4), tg), { col: C.accent, size: 44 });
    out += tag(972, 690, 1400, 690, 'たね', Math.min(prog(t, cue(1) + 2.6, 0.4), tg), { col: DC.seedDk, size: 48 });
    out += tag(950, 620, 520, 620, 'ぶらさがる', Math.min(prog(t, cue(1) + 3.6, 0.4), tg), { col: C.muted, size: 40 });
    if (fk > 0) {
      out += pop(badge('たねを ゆっくり おとす', { fill: C.accent, size: 50, pad: 44 }), t, cue(2) + 0.3, 1440, 300);
      out += g(arrow2(0, -70, 0, 70, C.accent, 14) + text(0, 130, 'ふわ…', { size: 50, w: 900, fill: C.accent }), { x: 1440, y: 500 + Math.sin(t * 1.6) * 10, o: prog(t, cue(2) + 1.0, 0.4) });
      out += g(text(0, 0, 'ふわ…', { size: 44, w: 900, fill: C.muted }), { x: 500, y: 500 - Math.sin(t * 1.6) * 10, o: prog(t, cue(2) + 1.8, 0.4) });
    }
    return out;
  },
});

// 4. ゆっくり落ちるほど、風に長くおされて遠くへ／風のない部屋では 1秒に約39センチ
SCENES.push({
  id: 'slow',
  draw(t) {
    const GY = 740, S0 = [250, 250];
    let out = meadow('ds', GY) + cloud(1500 + t * 6, 260, 0.6, '#fff', 0.8);
    for (let i = 0; i < 6; i++) out += windLine(t, 120 + (i % 3) * 560, 150 + (i % 2) * 70 + Math.floor(i / 3) * 26, 170, 1, '#fff', i);
    out += pop(badge('かぜ', { fill: C.blueUi, size: 44 }) + arrow2(110, 0, 250, 0, C.blueUi, 12), t, 0.3, 1560, 130);
    out += `<circle cx="${S0[0]}" cy="${S0[1]}" r="12" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="6 6"/>`;
    const t1 = cue(0) + 0.8, a1 = clamp((t - t1) / 1.3), a2 = clamp((t - t1) / 6.0);
    if (t > t1 - 0.6) {
      // はやく落ちるもの（小石）と、ゆっくり落ちる わたげ
      const bx = S0[0] + 215 * a1, by = S0[1] + (GY - 16 - S0[1]) * a1 * a1;
      const sx = S0[0] + 1330 * a2, sy = S0[1] + (GY - 112 - S0[1]) * a2;
      out += `<path d="M ${S0[0]} ${S0[1]} Q ${S0[0] + 100} ${S0[1] + 10} ${bx} ${by}" fill="none" stroke="#7b6a58" stroke-width="6" stroke-dasharray="14 12" opacity="0.8"/>`;
      out += `<line x1="${S0[0]}" y1="${S0[1]}" x2="${sx}" y2="${sy}" stroke="#fff" stroke-width="6" stroke-dasharray="14 12" opacity="0.9"/>`;
      const o0 = prog(t, t1 - 0.6, 0.3);
      out += g(`<circle r="20" fill="#8b8177"/><circle cx="-6" cy="-6" r="6" fill="#b3aaa0"/>`, { x: bx, y: by, o: o0 });
      out += wata(sx, sy, 78, { rot: a2 < 1 ? 10 + Math.sin(t * 2) * 6 : 4, col: '#fff', stalk: 1.0, o: o0 });
      out += pop(badge('はやく おちる → ちかく', { fill: '#7b6a58', size: 40 }), t, t1 + 1.6, 480, 798);
      out += pop(badge('ゆっくり おちる → とおく', { fill: C.accent, size: 40 }), t, t1 + 6.2, 1440, 798);
    }
    // 風のない部屋で：1秒に約39センチ
    const ck = prog(t, cue(1) - 0.2, 0.5);
    if (ck > 0) {
      let c = card(1120, 600);
      const top = -150, per = 2.4, ph = ((t - cue(1)) % per + per) % per, k = clamp(ph / 1.0), fo = 1 - clamp((ph - 2.0) / 0.3);
      c += `<rect x="-470" y="${top - 24}" width="70" height="${438}" rx="10" fill="${C.ochreSoft}" stroke="${C.ochre}" stroke-width="4"/>`;
      for (let i = 0; i <= 8; i++) c += `<line x1="-470" y1="${top + i * 50}" x2="${-470 + (i % 2 ? 22 : 38)}" y2="${top + i * 50}" stroke="${C.ochre}" stroke-width="4"/>`;
      c += `<line x1="-480" y1="${top}" x2="-170" y2="${top}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/><line x1="-480" y1="${top + 390}" x2="-170" y2="${top + 390}" stroke="${C.red}" stroke-width="5" stroke-dasharray="10 10"/>`;
      c += wata(-300, top + 390 * k - 80, 62, { stalk: 0.9, o: fo, n: 15 });
      c += arrow2(-190, top, -190, top + 390, C.accent, 10);
      // ストップウォッチ
      const sw = `<circle r="54" fill="#fff" stroke="${C.ink}" stroke-width="7"/><rect x="-9" y="-74" width="18" height="18" rx="4" fill="${C.ink}"/><path d="M 0 0 L 0 -54 A 54 54 0 ${k > 0.5 ? 1 : 0} 1 ${Math.sin(k * 2 * Math.PI) * 54} ${-Math.cos(k * 2 * Math.PI) * 54} Z" fill="${C.yellow}" opacity="${k > 0.005 ? 0.9 : 0}"/><line x1="0" y1="0" x2="${Math.sin(k * 2 * Math.PI) * 42}" y2="${-Math.cos(k * 2 * Math.PI) * 42}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
      c += g(sw, { x: 450, y: -196 });
      c += text(150, -200, 'かぜの ない へやで', { size: 40, w: 900, fill: C.muted });
      c += text(200, -60, '1びょうに', { size: 70, w: 900 });
      c += text(200, 50, 'やく 39センチ', { size: 76, w: 900, fill: C.accent });
      c += g(badge('まっすぐ おちる', { fill: C.blueUi, size: 40 }), { x: 200, y: 190, o: prog(t, cue(1) + 2.4, 0.4) });
      out += g(c, { x: 960, y: 440, o: ck, s: lerp(0.94, 1, eo(ck)) });
    }
    return out;
  },
});

// 5. 毛は約100本、丸の中の9割以上がすきま。空気は通りぬける
SCENES.push({
  id: 'gaps',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const CX = 540, CY = 460, R = 285;
    out += g(text(0, 0, 'うえから みた わたげ', { size: 40, w: 900, fill: C.muted }), { x: CX, y: 136, o: prog(t, 0.3, 0.4) });
    const gk = prog(t, cue(1) + 0.2, 0.6);
    out += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="${mix('#f3ead8', DC.airLt, gk)}" opacity="${0.55 + 0.25 * gk}"/>`;
    if (gk > 0) out += `<circle cx="${CX}" cy="${CY}" r="${R + 6}" fill="none" stroke="${C.ochre}" stroke-width="7" stroke-dasharray="18 14" opacity="${gk}" transform="rotate(${t * 4} ${CX} ${CY})"/>`;
    const hk = prog(t, cue(0) + 0.2, 2.6);
    out += topView(CX, CY, R, { k: hk, sw: 2.6 });
    const cO = win(t, cue(0) + 0.2, cue(1) - 0.1, 0.3);
    out += g(text(0, 0, hk < 1 ? `${Math.round(hk * 100)}ぽん` : 'やく 100ぽん', { size: 64, w: 900, fill: C.blueUi }), { x: CX, y: 800, o: cO });
    out += pop(badge('9わり いじょうが すきま', { fill: C.ochre, size: 48, pad: 40 }), t, cue(1) + 1.4, CX, 800);
    // 右：横から見ると、空気が毛のあいだを通りぬける → 風を通さないパラシュート
    const RX = 1400, aO = win(t, cue(2) - 0.2, cue(3) - 0.1, 0.4), pO = prog(t, cue(3) + 0.1, 0.5);
    if (aO > 0) {
      let a = '';
      [-205, -125, -45, 45, 125, 205].forEach((dx, i) => { a += airUp(t + i * 0.13, RX + dx, 790, 190, 1, { col: DC.air }); });
      a += wata(RX, 470, 235, { n: 27, stalk: 0.62 });
      a += g(badge('くうきが とおりぬける', { fill: DC.airDk, size: 44 }), { x: RX, y: 130 });
      out += g(a, { o: aO });
    }
    if (pO > 0) {
      // パラシュート（風を通さない）。空気は ふちを まわっていく
      const py = 300;
      let p = `<path d="M -230 0 Q -230 -190 0 -190 Q 230 -190 230 0 Q 172 -34 115 0 Q 57 -34 0 0 Q -57 -34 -115 0 Q -172 -34 -230 0 Z" fill="#f4b76a" stroke="#c9862f" stroke-width="6" stroke-linejoin="round"/>`;
      p += `<path d="M -115 0 Q -100 -120 0 -190 M 115 0 Q 100 -120 0 -190" fill="none" stroke="#c9862f" stroke-width="5"/>`;
      p += `<path d="M -230 0 L -16 196 M -115 0 L -8 196 M 0 0 L 0 196 M 115 0 L 8 196 M 230 0 L 16 196" stroke="${C.muted}" stroke-width="3.5"/>`;
      p += `<rect x="-30" y="190" width="60" height="50" rx="10" fill="${DC.seed}"/>`;
      [-1, 1].forEach(sd => { p += `<path d="M ${sd * 110} 150 Q ${sd * 120} 60 ${sd * 290} 40 Q ${sd * 330} 30 ${sd * 330} -70" fill="none" stroke="${DC.air}" stroke-width="7" stroke-linecap="round" stroke-dasharray="30 24" stroke-dashoffset="${-t * 200}"/><path d="M ${sd * 330} -104 L ${sd * 330 - 17} -70 L ${sd * 330 + 17} -70 Z" fill="${DC.air}"/>`; });
      out += g(g(p, { x: RX, y: py }) + g(badge('かぜを とおさない パラシュート', { fill: '#c9862f', size: 40 }), { x: RX, y: 130 }), { o: pO });
      out += pop(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), t, cue(3) + 2.2, 1040, 330);
    }
    out += kidShow('K', t, 1580, 846, { s: 0.56, start: cue(3) + 1.0, n: 0 });
    return out;
  },
});

// わたげ＋空気の流れ＋空気のわっか（6・7 の場面で使う）
function ringSeed(t, x, y, L, { airO = 1, ringO = 1, stalk = 0.55, rot = 0, yTop = 110, yBot = 850 } = {}) {
  let s = '';
  const ry = y - L * 1.47, R = L * 0.73, r = L * 0.26;
  [-1.78, -1.36, 1.36, 1.78].forEach((k, i) => { s += airUp(t + i * 0.21, x + k * L, yBot, yTop, airO); });
  [-0.8, -0.3, 0.3, 0.8].forEach((k, i) => { s += airUp(t + i * 0.17 + 0.4, x + k * L, yBot, y - L * (ringO > 0.5 ? 0.6 : 1.45), airO * 0.8, { col: DC.airLt, head: ringO <= 0.5 }); });
  s += wata(x, y, L, { n: 29, stalk, rot });
  s += vring(t, x, ry, R, r, ringO);
  return s;
}

// 6. わたげの上に、はなれて浮かぶ空気のわっか
SCENES.push({
  id: 'ring',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#eef6fb"/>` + topBadge();
    const X = 960, Y = 600, L = 240;
    const airO = prog(t, cue(1) - 0.1, 0.6), ringO = eo(prog(t, cue(2) + 0.5, 1.2));
    out += ringSeed(t, X, Y, L, { airO, ringO, rot: Math.sin(t * 1.2) * 1.5 });
    // しらべる（ルーペ）
    const lk = win(t, cue(0) + 0.4, cue(1) - 0.2, 0.4);
    out += g(lensIcon(), { x: 1290 + Math.sin(t * 0.9) * 50, y: 430 + Math.cos(t * 0.7) * 40, s: 0.95, o: lk });
    out += titleAt('2018ねん イギリスの だいがくの チーム', t, cue(0) + 0.3, cue(1) - 0.2, C.ochre, 960, 180, 44);
    // 空気は下から上へ／わたげは落ちる
    const l1 = win(t, cue(1) + 0.6, cue(3) - 0.2, 0.4);
    out += g(badge('くうきは したから うえへ', { fill: DC.airDk, size: 42 }), { x: 400, y: 640, o: l1 });
    out += g(arrow2(0, -60, 0, 50, C.muted, 12) + text(0, 96, 'おちる', { size: 40, w: 900, fill: C.muted }), { x: 1160, y: 700, o: win(t, cue(1) + 1.6, cue(2) + 0.2, 0.4) });
    // わっか
    const RY = Y - L * 1.47, RR = L * 0.73;
    out += tag(X + RR + 40, RY - 44, 1640, 150, 'くうきの わっか', prog(t, cue(2) + 1.8, 0.4), { col: DC.ring, size: 48 });
    out += g(text(0, 0, '（うずの わ）', { size: 40, w: 900, fill: DC.ring }), { x: 1640, y: 218, o: prog(t, cue(2) + 2.2, 0.4) });
    out += g(text(0, 0, 'けむりの わっか みたい', { size: 40, w: 900, fill: DC.airDk }), { x: 1640, y: 282, o: win(t, cue(2) + 3.4, cue(3) - 0.2, 0.4) });
    // くっつかない・流されない
    const gy0 = RY + L * 0.3, gy1 = Y - L * 0.99;
    const g1 = prog(t, cue(3) + 0.8, 0.4);
    if (g1 > 0) out += g(`<line x1="${X - 60}" y1="${gy0}" x2="${X + 60}" y2="${gy0}" stroke="${C.red}" stroke-width="5"/><line x1="${X - 60}" y1="${gy1}" x2="${X + 60}" y2="${gy1}" stroke="${C.red}" stroke-width="5"/><line x1="${X}" y1="${gy0}" x2="${X}" y2="${gy1}" stroke="${C.red}" stroke-width="5"/>`, { o: g1 });
    out += tag(X - 62, (gy0 + gy1) / 2, 430, 400, 'くっつかない', g1, { col: C.red, size: 46 });
    out += tag(X - RR - L * 0.3, RY - 30, 430, 190, 'ながされない', prog(t, cue(3) + 2.6, 0.4), { col: C.red, size: 46 });
    out += pop(badge('おなじ きょりで うかびつづける', { fill: DC.ring, size: 44 }), t, cue(3) + 4.4, 1540, 430);
    return out;
  },
});

// すきまのない板：うずがちぎれて、つぎつぎ流れていく
function shedPlate(t, x, y, w, t0, o = 1) {
  if (o <= 0.01) return '';
  let s = '';
  [-1.0, 1.0].forEach((k, i) => { s += airUp(t + i * 0.2, x + k * (w / 2 + 70), 850, 120, 1); });
  const per = 1.1, n = Math.floor((t - t0) / per);
  for (let i = Math.max(0, n - 6); i <= n; i++) {
    const age = t - t0 - i * per; if (age < 0) continue;
    const sd = i % 2 ? 1 : -1, vy = 118, yy = y - 60 - age * vy, xx = x + sd * (w * 0.28) + Math.sin(age * 2.2 + i) * 26;
    if (yy < 110) continue;
    s += swirl(xx, yy, 44 + Math.min(age, 1) * 8, -sd, t, { o: Math.min(1, age * 3, (yy - 110) / 140), col: '#7f95a6', w: 7 });
  }
  s += `<rect x="${x - w / 2}" y="${y - 14}" width="${w}" height="28" rx="14" fill="${DC.plate}" stroke="${DC.plateDk}" stroke-width="5"/>`;
  return g(s, { o });
}

// 7. すきまのない丸い板とくらべる
SCENES.push({
  id: 'disk',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#eef6fb"/>` + topBadge();
    const B = eio(prog(t, cue(2) - 0.5, 0.8));   // 0: わたげを大きく → 1: 板とならべる
    const X = lerp(560, 1530, B), Y = lerp(556, 590, B), L = lerp(215, 185, B);
    out += ringSeed(t, X, Y, L, { stalk: 0.55, yTop: lerp(110, 215, B) });
    // ささえる
    const sO = win(t, cue(0) + 0.8, cue(2) - 0.6, 0.4);
    if (sO > 0) {
      [-0.55, 0.55].forEach(k => { const b = Math.sin(t * 3) * 8; out += g(arrow2(X + k * L, Y + 150 + b, X + k * L, Y + 40 + b, C.accent, 22), { o: sO }); });
      out += g(badge('くうきに ぐっと ささえられる', { fill: C.accent, size: 42 }), { x: X, y: 800, o: sO });
    }
    // 同じ広さあたりの空気の抵抗：1 と 4倍以上
    const cO = win(t, cue(1) - 0.2, cue(2) - 0.6, 0.4);
    if (cO > 0) {
      let c = card(840, 600);
      c += text(0, -236, 'おなじ ひろさ あたりの', { size: 40, w: 900, fill: C.muted }) + text(0, -182, 'くうきの ていこう', { size: 50, w: 900 });
      const b1 = eo(prog(t, cue(1) + 1.0, 0.6)), b2 = eo(prog(t, cue(1) + 2.0, 1.2)), U = 62, base = 170;
      c += `<line x1="-340" y1="${base}" x2="340" y2="${base}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
      c += `<rect x="-250" y="${base - U * b1}" width="130" height="${U * b1}" fill="${DC.plate}"/>` + g(text(-185, base - U - 44, '1', { size: 64, w: 900, fill: DC.plateDk }), { o: b1 });
      c += `<rect x="120" y="${base - U * 4 * b2}" width="130" height="${U * 4 * b2}" fill="${DC.ring}"/>`;
      c += `<path d="M 120 ${base - U * 4 * b2} L 152 ${base - U * 4 * b2 - 26} L 185 ${base - U * 4 * b2} L 217 ${base - U * 4 * b2 - 26} L 250 ${base - U * 4 * b2} Z" fill="${DC.ring}" opacity="${b2}"/>`;
      c += g(text(-40, base - U * 4 + 20, '4ばい', { size: 60, w: 900, fill: DC.ring, anchor: 'end' }) + text(-40, base - U * 4 + 84, 'いじょう', { size: 44, w: 900, fill: DC.ring, anchor: 'end' }), { x: 150, o: prog(t, cue(1) + 3.0, 0.4) });
      c += text(-185, base + 44, 'すきまの ない', { size: 34, w: 900, fill: DC.plateDk }) + text(-185, base + 86, 'まるい いた', { size: 34, w: 900, fill: DC.plateDk });
      c += text(185, base + 60, 'わたげ', { size: 40, w: 900, fill: DC.ring });
      out += g(c, { x: 1370, y: 450, o: cO, s: lerp(0.95, 1, eo(cO)) });
    }
    // 板：うずがちぎれて流れる
    if (B > 0) {
      out += shedPlate(t, 400, 610, 300, cue(2) - 0.4, B);
      out += g(text(0, 0, 'すきまの ない いた', { size: 38, w: 900, fill: DC.plateDk }), { x: 400, y: 690, o: B });
      out += pop(badge('うずが ちぎれて ながれる', { fill: '#7f95a6', size: 40 }), t, cue(2) + 1.8, 400, 808);
      out += pop(badge('うずが とどまる', { fill: DC.ring, size: 40 }), t, cue(3) + 0.3, 1530, 808);
      out += pop(badge('ちょうど いい すきま', { fill: C.ochre, size: 44 }), t, cue(3) + 2.6, 1530, 140);
    }
    // おねえちゃん（まん中）
    const sy = 850, ss = 0.45;
    out += kidShow('S', t, 960, sy, { s: ss, start: cue(2) + 0.6, n: 0, bubble: false });
    out += talkBubble('S', 960, 480, 960, sy - (KID_HEAD.S[0] + 16) * ss, 40);
    return out;
  },
});

// 8. じっさいは近くに落ちる／あたたかく乾いた風の強い日は遠くへ／しめった日は閉じる
const NEAR = [[330, 0], [395, 5], [450, 2], [505, 6], [560, 1], [610, 4], [655, 7], [700, 3]];
SCENES.push({
  id: 'far',
  draw(t) {
    const GY = 700, PX = 230, PY = 486, PR = 108;
    let out = meadow('df', GY);
    const warm = prog(t, cue(1) - 0.2, 0.8);
    const ck0 = prog(t, cue(2) - 0.2, 0.5);
    out += g(sunIcon(1750, 118, 50, t), { o: warm * (1 - ck0) });
    if (warm > 0) for (let i = 0; i < 6; i++) out += windLine(t * 1.4, 300 + (i % 3) * 520, 300 + (i % 2) * 90 + Math.floor(i / 3) * 40, 190, warm, '#fff', i);
    out += stem(PX, PY, PX - 4, GY + 14, 10) + leaves(PX - 4, GY + 16, 0.9);
    const st = j => cue(0) + 0.4 + j * 0.42, missing = [];
    NEAR.forEach(([lx, pi], j) => { if (t > st(j)) missing.push(pi + 2); });
    const farT = cue(1) + 0.9; if (t > farT) missing.push(1);
    out += puff(PX, PY, PR, { miss: missing });
    // 近くに落ちる たね
    NEAR.forEach(([lx, pi], j) => {
      const age = t - st(j); if (age <= 0) return;
      const [px, py, deg] = puffPos(pi + 2, 24, PX, PY, PR), k = clamp(age / 2.4), ly = GY + 6 + (j % 3) * 9;
      const x = lerp(px, lx, k), y = lerp(py, ly - 60, k) + Math.sin(k * Math.PI) * -24;
      out += wata(x, y, PR * 0.42, { rot: k < 1 ? deg * Math.exp(-age * 3) + Math.sin(age * 3 + j) * 6 : 3 + (j % 2 ? -6 : 5), n: 11, col: '#fff', stalk: 1.2 });
    });
    const bk = prog(t, cue(0) + 3.6, 0.5);
    if (bk > 0) out += g(`<path d="M ${PX} 756 L 730 756 M ${PX} 740 L ${PX} 772 M 730 740 L 730 772" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>` + ctext((PX + 730) / 2, 802, 'ほとんどは 2メートル いない', { size: 40, w: 900 }), { o: bk * (1 - ck0) });
    // 遠くへ飛ぶ たね
    if (t > farT) {
      const age = t - farT, k = clamp(age / 6.0), [px, py] = puffPos(1, 24, PX, PY, PR);
      const x = lerp(px, 2040, eio(k) * 0.4 + k * 0.6), y = py - 150 * Math.sin(k * Math.PI * 0.62) + Math.sin(age * 2) * 10, fo = 1 - prog(t, cue(2) - 0.3, 0.4);
      out += `<path d="M ${px} ${py} Q ${(px + x) / 2} ${py - 150 * Math.sin(k * Math.PI * 0.31) * 1.15} ${x} ${y}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="14 12" opacity="${0.85 * fo}"/>`;
      out += wata(x, y, PR * 0.5, { rot: 10 + Math.sin(age * 2) * 6, n: 11, col: '#fff', stalk: 1.2 });
    }
    const e2 = cue(2) - 0.3;
    out += pop(badge('あたたかく かわいた、かぜの つよい ひ', { fill: '#d08a1e', size: 40 }), t, cue(1) + 0.5, 1090, 130, { end: e2 });
    out += pop(badge('もっと とおくへ', { fill: C.accent, size: 50, pad: 44 }), t, cue(1) + 3.4, 1440, 500, { end: e2 });
    out += g(text(0, 0, '1キロより とおく という みつもりも', { size: 38, w: 900, fill: C.ink }), { x: 1440, y: 590, o: win(t, cue(1) + 4.6, e2, 0.3) });
    // しめった日は閉じる
    const ck = prog(t, cue(2) - 0.2, 0.5);
    if (ck > 0) {
      let c = card(1600, 660);
      c += `<line x1="0" y1="-270" x2="0" y2="270" stroke="${C.line}" stroke-width="5" stroke-dasharray="12 12"/>`;
      const cl = eio(prog(t, cue(2) + 1.8, 2.4)), fly = prog(t, cue(3) + 0.3, 99) > 0 ? t - cue(3) - 0.3 : 0;
      // かわいた日
      c += sunIcon(-640, -220, 46, t);
      const fx = -400 + Math.min(fly, 4) * 30 + Math.sin(fly * 2) * 8, fy = 30 - Math.min(fly, 4) * 10;
      if (fly > 0) for (let i = 0; i < 4; i++) c += windLine(t * 1.5, -720 + (i % 2) * 200, -60 + i * 70, 150, 1, DC.air, i);
      c += wata(fx, fy, 175, { n: 25, stalk: 0.6, rot: fly > 0 ? 8 + Math.sin(fly * 2) * 5 : Math.sin(t * 1.2) * 2 });
      c += text(-400, 286, 'かわいた ひ：ひらく', { size: 44, w: 900, fill: '#b9770f' });
      c += g(badge('かぜに のって とぶ', { fill: C.accent, size: 40 }), { x: -300, y: -272, o: prog(t, cue(3) + 0.8, 0.4) });
      // しめった日
      c += rainDrops(50, -290, t, 1.0) + rainDrops(640, -290, t + 0.4, 1.0);
      c += wata(400, 40, 175, { n: 25, stalk: 0.6, open: lerp(1, 0.05, cl), hub: cl });
      if (cl > 0.05) c += `<circle cx="400" cy="40" r="34" fill="none" stroke="${C.red}" stroke-width="6" opacity="${cl}"/>`;
      c += tag(424, 60, 566, 160, 'みずを すって ふくらむ', prog(t, cue(2) + 2.8, 0.4), { col: C.red, size: 34 });
      c += text(400, 286, 'しめった ひ：とじる', { size: 44, w: 900, fill: DC.airDk });
      c += g(badge('たいてい かぜが よわい', { fill: '#7f95a6', size: 38 }), { x: 400, y: -272, o: prog(t, cue(3) + 2.4, 0.4) });
      out += g(c, { x: 960, y: 450, o: ck, s: lerp(0.95, 1, eo(ck)) });
    }
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
      const CX = 960, CY = 330, NX = -560, as = 'わたげの うえに、くうきの わっかが できるから';
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, as, { size: fit(as, 1060, 50, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['すきまを くうきが とおる', DC.airDk], ['うえに くうきの わっか', DC.ring], ['ゆっくり おちて とおくへ', C.accent]], t, 960, 590, { start: 2.2, step: 1.0, size: 38, gap: 30 });
      a += pop(ringSeed(t, 0, 0, 58, { airO: 0 }), t, 1.6, 960, 780);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [g(eyeIcon(0.3)), 'はれの ひと あめの ひの わたげを くらべる', C.ink, cue(1)],
        [g(eyeIcon(0.3)), 'けは ひろがってる？ すぼまってる？', C.ink, cue(2)],
        [g(eyeIcon(0.3)), 'ふいたら、たねが したの まま おちるか みる', C.ink, cue(3)],
        [warnIcon(0.5), 'わたげや たねを くちに いれない', C.red, cue(4)],
        [warnIcon(0.5), 'ひとの かおに むけて ふかない', C.red, cue(4) + 2.2],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 960, 44, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 320 + i * 104); });
      // 絵：晴れの日（ひらく）と 雨の日（とじる） → ふいたら たねが下のまま ゆっくり
      const PX = 1560, PYc = 490;
      let p = card(560, 600, { fill: '#fff' });
      const ph1 = 1 - prog(t, cue(3) - 0.3, 0.4);
      if (ph1 > 0) {
        let q = sunIcon(-200, -230, 30, t) + stem(-20, -160, -24, -20, 7) + puff(-20, -160, 88) + text(170, -150, 'はれ', { size: 40, w: 900, fill: '#b9770f' });
        q += `<line x1="-240" y1="6" x2="240" y2="6" stroke="${C.line}" stroke-width="4" stroke-dasharray="10 10"/>`;
        q += rainDrops(-240, 40, t, 0.6) + stem(-20, 130, -24, 270, 7) + puff(-20, 130, 88, { open: 0.05, col: DC.hairLt }) + text(170, 140, 'あめ', { size: 40, w: 900, fill: DC.airDk });
        p += g(`<clipPath id="lkc"><rect x="-270" y="-290" width="540" height="580" rx="20"/></clipPath><g clip-path="url(#lkc)"><rect x="-270" y="-290" width="540" height="296" fill="#dff0fb"/><rect x="-270" y="6" width="540" height="284" fill="#e4e8ee"/>${q}</g>`, { o: ph1 });
      }
      const ph2 = prog(t, cue(3) - 0.1, 0.4);
      if (ph2 > 0) {
        const per = 3.2, f = (((t - cue(3)) % per) + per) % per / per;
        let q = `<rect x="-270" y="-290" width="540" height="580" rx="20" fill="#8cc4ee"/>`;
        q += wata(-60 + Math.sin(f * 6.28) * 30, -200 + f * 330, 110, { stalk: 0.9, rot: Math.sin(f * 6.28 * 2) * 6, col: '#fff', o: Math.min(1, f * 6, (1 - f) * 6) });
        q += arrow2(150, -120, 150, 60, '#fff', 12) + text(150, 110, 'ゆっくり', { size: 38, w: 900, fill: '#fff' });
        q += text(0, 240, 'たねが した', { size: 42, w: 900, fill: C.ink });
        p += g(q, { o: ph2 });
      }
      b += pop(p, t, cue(1) + 0.4, PX, PYc);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「たんぽぽ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

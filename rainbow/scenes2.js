
// みのまわり図鑑 動画「にじは、どうして あめの あとに でるの？」（にじ）
// 出どころ：everyday-trivia trivia/rainbow-after-rain.md（絵の見本：assets/figures-rainbow.js、メモ：ideas/notes/rainbow.md）

// ---------- にじの道具 ----------
const RBC = ['#f0483e', '#ff9a2e', '#ffd93a', '#3cc35a', '#2f86ff', '#8a5cf0'];  // そとがわ（あか）→ うちがわ（むらさき）
const RB = { cloud: '#9aa3ad', cloudDk: '#858e98', drop: '#bfe3f7', dropLn: '#7fbfe6', streak: '#6fa9dc', grass: '#7fc474', grassDk: '#5fae5f', ray: '#fff6c2' };
const rad = a => a * Math.PI / 180;
const STROKE = `stroke="${C.ink}" stroke-width="12" paint-order="stroke" stroke-linejoin="round"`;
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
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const okMark = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="40" fill="#3d9a5c"/><circle r="20" fill="none" stroke="#fff" stroke-width="9"/></g>`;
const ngMark = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="40" fill="#c94435"/><path d="M -16 -16 L 16 16 M 16 -16 L -16 16" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>`;
const skyG = (id, top, bot, { x = 0, y = 0, w = 1920, h = 1080 } = {}) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
// にじの弧。まん中 (cx, cy)、いちばん外の半径 R、色1本の太さ w。角度は度（0=右、90=上、180=左）。k は左から右へ出てくる割合
function bow(cx, cy, R, w, { o = 1, a0 = 180, a1 = 0, k = 1 } = {}) {
  if (k <= 0 || o <= 0) return '';
  const ae = lerp(a0, a1, k); let s = '';
  RBC.forEach((c, i) => {
    const r = R - w * (i + 0.5), x1 = cx + r * Math.cos(rad(a0)), y1 = cy - r * Math.sin(rad(a0)), x2 = cx + r * Math.cos(rad(ae)), y2 = cy - r * Math.sin(rad(ae));
    s += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${a0 - ae > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${c}" stroke-width="${w + 1}"/>`;
  });
  return `<g opacity="${o}">${s}</g>`;
}
// にじ（まるい輪）
const ring = (cx, cy, R, w, o = 1) => o <= 0 ? '' : `<g opacity="${o}">` + RBC.map((c, i) => `<circle cx="${cx}" cy="${cy}" r="${R - w * (i + 0.5)}" fill="none" stroke="${c}" stroke-width="${w + 1}"/>`).join('') + `</g>`;
// ふっている雨
function rainFx(x0, x1, y0, y1, t, { n = 40, u = 1, o = 1, seed = 1, col = RB.streak } = {}) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd(i, seed)), f = (t * (0.9 + rnd(i, seed + 2) * 0.5) + rnd(i, seed + 1)) % 1, y = lerp(y0, y1, f), len = 34 * u;
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - len * 0.2).toFixed(1)}" y2="${(y + len).toFixed(1)}" stroke="${col}" stroke-width="${(5 * u).toFixed(1)}" stroke-linecap="round" opacity="${(0.8 * Math.min(1, f * 6, (1 - f) * 6)).toFixed(2)}"/>`;
  }
  return `<g opacity="${o}">${s}</g>`;
}
// まるい雨つぶ
const drop = (cx, cy, r, o = 1) => o <= 0 ? '' : `<g opacity="${o}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${RB.drop}" fill-opacity="0.32" stroke="${RB.dropLn}" stroke-width="${Math.max(3, r * 0.045)}"/>` +
  `<path d="M ${cx - r * 0.62} ${cy - r * 0.42} A ${r * 0.75} ${r * 0.75} 0 0 1 ${cx - r * 0.2} ${cy - r * 0.72}" fill="none" stroke="#fff" stroke-width="${Math.max(3, r * 0.05)}" stroke-linecap="round" opacity="0.85"/></g>`;
// 線を k の割合だけ引く
const seg = (p, q, k, col, w, o = 1) => k <= 0 || o <= 0 ? '' : `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${lerp(p[0], q[0], k).toFixed(1)}" y2="${lerp(p[1], q[1], k).toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
// 白い光のすじ
const beam = (p, q, k, w = 14, o = 1) => seg(p, q, k, '#fffbea', w * 2.6, 0.2 * o) + seg(p, q, k, '#fffbea', w, o);
// 小さな人のしるし（足もとが x, y）
const person = (x, y, s = 1, col = '#e0715f') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-13" y="-26" width="10" height="26" rx="5" fill="#35657f"/><rect x="3" y="-26" width="10" height="26" rx="5" fill="#35657f"/><rect x="-17" y="-72" width="34" height="52" rx="12" fill="${col}"/><circle cx="0" cy="-94" r="24" fill="${CH.skin}"/><path d="M -24 -96 A 24 24 0 0 1 24 -96 Q 0 -110 -24 -96 Z" fill="${CH.hairB}"/></g>`;
// 天気の小さな絵（まん中が 0,0）。kind: 'rain' 雨のあいだ / 'clear' すっかり晴れ / 'after' 雨雲が通りすぎた すぐあと
function wx(kind, w, h, t, id, { bowK = 1, who = true } = {}) {
  const u = h / 400, L = -w / 2, T = -h / 2, uu = Math.max(u, 0.4), gy = h * 0.3;
  const [top, bot] = { rain: ['#76828f', '#bcc4cc'], clear: ['#3f93dc', '#d6edfa'], after: ['#5797d6', '#d2e8f7'] }[kind];
  let a = `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect x="${L}" y="${T}" width="${w}" height="${h}" fill="url(#${id}g)"/>`;
  if (kind === 'rain') {
    a += rainFx(L, -L, T + h * 0.2, gy, t, { n: Math.round(30 * w / 560), u: uu, seed: 5 });
    a += cloud(L + w * 0.27, T + h * 0.2, 1.5 * u, RB.cloudDk, 1) + cloud(L + w * 0.7, T + h * 0.17, 1.7 * u, RB.cloud, 1);
  } else if (kind === 'clear') {
    a += sunDisc(L + w * 0.24, T + h * 0.27, 40 * u, 0, { glow: 0.7 }) + cloud(L + w * 0.76, T + h * 0.24, 0.6 * u, '#fff', 0.9);
  } else {
    a += rainFx(w * 0.02, -L, T + h * 0.2, gy, t, { n: Math.round(16 * w / 560), u: uu, seed: 8 });
    a += bow(w * 0.2, gy + h * 0.06, h * 0.5, 9 * u, { k: bowK, o: 0.95 });
    a += sunDisc(L + w * 0.17, T + h * 0.24, 38 * u, 0, { glow: 0.7 }) + cloud(L + w * 0.78, T + h * 0.17, 1.5 * u, RB.cloud, 1);
  }
  a += `<path d="M ${L} ${gy + h * 0.04} Q 0 ${gy - h * 0.06} ${-L} ${gy + h * 0.04} L ${-L} ${-T} L ${L} ${-T} Z" fill="${kind === 'rain' ? '#6f9a74' : RB.grass}"/>`;
  if (who) a += person(L + w * 0.3, gy + h * 0.1, 0.62 * u);
  return `<clipPath id="${id}c"><rect x="${L}" y="${T}" width="${w}" height="${h}" rx="${24 * uu}"/></clipPath><g clip-path="url(#${id}c)">${a}</g><rect x="${L}" y="${T}" width="${w}" height="${h}" rx="${24 * uu}" fill="none" stroke="#fff" stroke-width="${8 * uu}"/>`;
}
// 雨つぶの中の光の道。i: 入る角度、r: 中での角度（度）。E 入口、B うしろ、X 出口、d 出ていく向き
const DR = { cx: 960, cy: 370, R: 230 };
function dropPath(r = 40.2, i = 59.4) {
  const { cx, cy, R } = DR, P = a => [cx + R * Math.cos(rad(a)), cy - R * Math.sin(rad(a))];
  const aE = 180 - i, aB = aE - (180 - 2 * r), aX = aB - (180 - 2 * r), D = 180 + 2 * i - 4 * r;
  return { E: P(aE), B: P(aB), X: P(aX), d: [Math.cos(rad(D)), Math.sin(rad(D))] };
}

// 1. つかみ：夕立がやんで、うしろからお日さま。前の空に にじ
SCENES.push({
  id: 'hook',
  draw(t) {
    const k = eio(prog(t, cue(0) - 0.2, 3.4));          // 雨がやんで、明るくなる
    let out = skyG('skh', mix('#76828f', '#4c97dc', k), mix('#bcc4cc', '#d6edfa', k));
    out += g(sunDisc(250, 240, 84, 0), { o: eo(prog(t, cue(0) + 1.4, 2.2)) });
    out += rainFx(lerp(-40, 900, k), 1960, 230, 800, t, { n: 70, seed: 3, o: lerp(1, 0.7, k) });
    out += bow(1340, 900, 560, 22, { k: eo(prog(t, cue(1) - 0.3, 1.8)), o: 0.92 });
    const cx = lerp(0, 760, k);
    out += cloud(260 + cx * 1.4, 230, 1.9, RB.cloudDk, 1) + cloud(760 + cx, 190, 2.1, RB.cloud, 1) + cloud(1240 + cx * 0.6, 220, 2.0, RB.cloudDk, 1) + cloud(1700 + cx * 0.3, 180, 2.2, RB.cloud, 1);
    out += `<path d="M 0 770 Q 420 650 860 750 T 1920 700 L 1920 1080 L 0 1080 Z" fill="${mix('#7d9d83', '#93cf8c', k)}"/>`;
    out += house(1180, 790, 0.9) + house(1420, 770, 0.7, '#f4ead8', '#5d7fa8') + tree(1640, 790, 0.9, mix('#3d7a52', '#3f8f4a', k));
    out += `<path d="M 0 880 Q 620 780 1240 900 T 1920 870 L 1920 1080 L 0 1080 Z" fill="${mix('#5f8a66', '#5fae5f', k)}"/>`;
    // 子どもたち（前の空を見上げる）
    const eyes = t > cue(1) + 0.6 ? 'wide' : 'open';
    out += kidShow('S', t, 230, 862, { s: 0.5, start: 0, n: 0, eyes, look: [6, -8] });
    out += kidShow('B', t, 400, 862, { s: 0.5, start: 0, n: 1, eyes, look: [6, -8], bubble: false });
    // 雨のあいだ・すっかり晴れた空 には出ない
    const c3 = cue(3), d3 = cueE(3) - c3;
    [['rain', 'あめの あいだ', c3 + 0.4, 640], ['clear', 'すっかり はれ', c3 + d3 * 0.42, 1090]].forEach(([kind, label, st, x], i) => {
      const inner = card(420, 330) + g(wx(kind, 372, 220, t, 'hk' + i), { y: -34 }) + text(0, 122, label, { size: 40, w: 900 }) + g(cross(0, -34, 0.9), { o: prog(t, st + 0.8, 0.25) });
      out += pop(inner, t, st, x, 300, { end: cueE(3) + 0.5 });
    });
    out += pop(text(0, 0, '？', { size: 220, w: 900, fill: '#fff', extra: STROKE }), t, cue(4) + 0.5, 1340, 610, { end: cueE(4) + 0.7 });
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      const l1 = 'にじは、どうして', W1 = tw(l1, 128, 900, 0.04), wn = tw('にじ', 128, 900, 0.04);
      out += `<linearGradient id="rbt" gradientUnits="userSpaceOnUse" x1="${-W1 / 2}" y1="0" x2="${-W1 / 2 + wn}" y2="0"><stop offset="0" stop-color="${RBC[0]}"/><stop offset="0.3" stop-color="${RBC[1]}"/><stop offset="0.55" stop-color="${RBC[3]}"/><stop offset="0.8" stop-color="${RBC[4]}"/><stop offset="1" stop-color="${RBC[5]}"/></linearGradient>`;
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="url(#rbt)">にじ</tspan>は、どうして</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">あめの あと</tspan>に でるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(wx('after', 440, 250, t, 'ttl', { who: false }), t, t0 + 1.8, 960, 850);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'にじが みつかりやすいのは、いつ？', { size: 72, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'あめが いちばん つよく', 'ふっているとき', 'rain'], ['②', 'あまぐもが とおりすぎて、', 'すぐに おひさまが でたとき', 'after'], ['③', 'あめが やんで なんじかんも たった、', 'よく はれたとき', 'clear']];
    const cur = curLine();
    opts.forEach(([n, a, b, kind], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-86" width="1200" height="172" rx="34" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 152) +
        `<circle cx="-510" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-510, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-440, -30, a, { size: 46, w: 700, anchor: 'start' }) + text(-440, 32, b, { size: 46, w: 700, anchor: 'start' }) +
        g(wx(kind, 170, 112, t, 'gs' + i, { who: false }), { x: 480 }), t, cue(i + 1) - 0.2, 900, 400 + i * 178);
    });
    out += kidShow('B', t, 1720, 850, { s: 0.58, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 420, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. にじが出る場所：いつも お日さまの反対がわ
SCENES.push({
  id: 'where',
  draw(t) {
    let out = skyG('skw', '#4f93d6', '#d4ecfa') + topBadge();
    const GY = 830, BX = 1400, R = 400;
    const k1 = prog(t, cue(1) - 0.2, 0.6);
    // どこにでも出る？
    [[330, 560, 150], [900, 440, 170], [1500, 540, 160]].forEach(([x, y, r], i) => {
      const st = cue(0) + 0.5 + i * 0.9, o = win(t, st, cue(1) - 0.1, 0.3);
      if (o <= 0) return;
      out += bow(x, y, r, 8, { o: o * 0.5 }) + g(text(0, 0, '？', { size: 110, w: 900, fill: '#fff', extra: STROKE }), { x, y: y - 46, o, s: Math.max(back(prog(t, st, 0.4)), 0.001) });
    });
    // 右：雨雲と雨、にじ
    out += rainFx(990, 1860, 250, GY - 40, t, { n: 46, seed: 4, o: k1 });
    out += bow(BX, GY, R, 16, { k: eo(prog(t, cue(1) + 0.9, 1.4)), o: 0.95 });
    out += g(cloud(1300, 220, 1.5, RB.cloudDk, 1) + cloud(1640, 195, 1.8, RB.cloud, 1), { o: k1 });
    // 左：お日さま
    out += pop(sunDisc(0, 0, 72, 0), t, cue(1) - 0.1, 210, 280);
    out += g(text(210, 400, 'おひさま', { size: 40, w: 900, fill: '#fff', extra: STROKE }), { o: prog(t, cue(1) + 0.3, 0.4) });
    out += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${RB.grass}"/><rect x="0" y="${GY}" width="1920" height="14" fill="${RB.grassDk}"/>`;
    // はんたいがわ
    out += pop(badge('いつも おひさまの はんたいがわ', { fill: C.blueUi, size: 46 }), t, cue(1) + 0.4, 735, 170, { end: cue(3) - 0.3 });
    const a1 = win(t, cue(1) + 0.8, cue(2) - 0.1, 0.3);
    out += g(arrow2(690, 610, 330, 360, C.ink, 9) + arrow2(840, 610, 1070, 520, C.ink, 9), { o: a1 });
    // 背中にお日さま、前に雨つぶ
    const L = eo(prog(t, cue(2) + 0.2, 1.4)), lo = prog(t, cue(2), 0.3);
    [[300, 300, 1300, 450], [300, 330, 1240, 520], [290, 270, 1340, 375]].forEach(([x1, y1, x2, y2], i) => { out += seg([x1, y1], [x2, y2], L, RB.ray, 12 - i * 2, 0.9 * lo); });
    out += tag(712, 745, 440, 620, 'せなかに おひさま', prog(t, cue(2) + 0.8, 0.3));
    out += tag(1400, 560, 1400, 665, 'まえに あめつぶ', prog(t, cue(2) + (cueE(2) - cue(2)) * 0.5, 0.3), { col: C.blueUi });
    out += kidShow('B', t, 760, GY + 6, { s: 0.44, start: 0.2, n: 0, look: [7, -5] });
    return out;
  },
});

// 4. 雨つぶの中：入るときに曲がる → うしろではね返る → 出るときにまた曲がる
SCENES.push({
  id: 'drop', night: true,
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + stars(9, 40) + topBadge(true);
    const { cx, cy, R } = DR, P = dropPath();
    // しずくの形ではなく、まん丸
    const aO = 1 - prog(t, cue(1) - 1.3, 0.4);
    if (aO > 0) {
      const tear = `<path d="M 0 -170 C 40 -80 110 -20 110 50 A 110 110 0 0 1 -110 50 C -110 -20 -40 -80 0 -170 Z" fill="${RB.drop}" fill-opacity="0.32" stroke="${RB.dropLn}" stroke-width="8"/>`;
      let a = pop(tear + g(cross(0, 10, 1.0), { o: prog(t, cue(0) + 1.9, 0.25) }), t, cue(0) + 0.3, 560, 420);
      a += g(text(560, 660, 'しずくの かたち', { size: 48, w: 900, fill: '#f4efe2' }), { o: prog(t, cue(0) + 0.6, 0.4) });
      a += g(text(1340, 660, 'ほとんど まんまる', { size: 48, w: 900, fill: '#f4efe2' }) + okMark(1500, 300, 1.1), { o: prog(t, cue(0) + 3.0, 0.4) });
      out += g(a, { o: aO });
    }
    const mv = eio(prog(t, cue(1) - 1.1, 0.9));          // まん丸の雨つぶが、大きくなって まん中へ
    out += drop(lerp(1340, cx, mv), lerp(430, cy, mv), lerp(130, R, mv), prog(t, cue(0) + 2.6, 0.3));
    // 光の道
    out += g(sunDisc(110, P.E[1], 46, 0), { o: prog(t, cue(1) - 0.5, 0.4) });
    out += beam([170, P.E[1]], P.E, eo(prog(t, cue(1) - 0.2, 0.9)));
    out += g(`<line x1="${P.E[0]}" y1="${P.E[1]}" x2="${P.E[0] + 250}" y2="${P.E[1]}" stroke="#f4efe2" stroke-width="5" stroke-dasharray="14 12" opacity="0.7"/>`, { o: win(t, cue(1) + 1.0, cue(2) + 0.2, 0.3) });
    out += beam(P.E, P.B, eo(prog(t, cue(1) + 1.2, 1.0)));
    out += beam(P.B, P.X, eo(prog(t, cue(2) + 0.7, 0.9)));
    const end = [P.X[0] + P.d[0] * 330, P.X[1] + P.d[1] * 330], k3 = eo(prog(t, cue(3) + 0.6, 0.9));
    out += beam(P.X, end, k3);
    if (k3 >= 1) out += `<path d="M ${end[0] + P.d[0] * 26} ${end[1] + P.d[1] * 26} L ${end[0] - P.d[1] * 22} ${end[1] + P.d[0] * 22} L ${end[0] + P.d[1] * 22} ${end[1] - P.d[0] * 22} Z" fill="#fffbea"/>`;
    // うしろで ぴかっ
    const fl = win(t, cue(2) + 0.6, cue(2) + 1.6, 0.25);
    if (fl > 0) out += `<circle cx="${P.B[0]}" cy="${P.B[1]}" r="${40 + 30 * fl}" fill="#fffbea" opacity="${0.5 * fl}" filter="url(#soft)"/>`;
    out += tag(P.E[0], P.E[1], 430, 300, '① はいるとき まがる', prog(t, cue(1) + 1.6, 0.3), { col: C.ochre });
    out += tag(P.B[0], P.B[1], 1560, 290, '② うしろで はねかえる', prog(t, cue(2) + 1.0, 0.3), { col: C.blueUi });
    out += tag(P.X[0], P.X[1], 1440, 650, '③ でるとき また まがる', prog(t, cue(3) + 0.9, 0.3), { col: C.redUi });
    return out;
  },
});

// 5. 色に分かれるわけ：色ごとに曲がる角度がちがう
SCENES.push({
  id: 'colors', night: true,
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + stars(9, 40) + topBadge(true);
    const { cx, cy, R } = DR, W = dropPath();
    out += sunDisc(110, W.E[1], 46, 0) + drop(cx, cy, R) + beam([170, W.E[1]], W.E, 1);
    // 白い光の中に いろいろな色
    const mk = prog(t, cue(0) + 0.8, 0.5);
    if (mk > 0) for (let i = 0; i < 14; i++) {
      const f = (t * 0.3 + i / 14) % 1, x = lerp(190, W.E[0] - 12, f);
      out += `<circle cx="${x.toFixed(1)}" cy="${W.E[1]}" r="8" fill="${RBC[i % 6]}" opacity="${mk}"/>`;
    }
    RBC.forEach((c, j) => { out += pop(ballG(0, 0, c, 22), t, cue(0) + 1.6 + j * 0.18, 215 + j * 90, 290); });
    out += pop(badge('いろいろな いろが まざっている', { fill: 'rgba(255,250,240,0.16)', color: '#f4efe2', size: 34 }), t, cue(0) + 2.8, 440, 400);
    // 前の場面の白い道（うすく）
    const wO = 0.5 * (1 - prog(t, cue(1) + 0.1, 0.5)), wEnd = [W.X[0] + W.d[0] * 330, W.X[1] + W.d[1] * 330];
    out += seg(W.E, W.B, 1, '#fffbea', 8, wO) + seg(W.B, W.X, 1, '#fffbea', 8, wO) + seg(W.X, wEnd, 1, '#fffbea', 8, wO);
    // 色ごとに少しずつちがう道
    const kA = eo(prog(t, cue(1) + 0.3, 1.0)), kB = eo(prog(t, cue(1) + 1.3, 1.0)), kC = eo(prog(t, cue(1) + 2.3, 1.2));
    const dim = 1 - 0.7 * win(t, cue(2) + 0.2, cue(3) - 0.1, 0.4);
    const ends = [];
    RBC.forEach((c, j) => {
      const p = dropPath(lerp(42.0, 38.4, j / 5)), e = [p.X[0] + p.d[0] * 330, p.X[1] + p.d[1] * 330], o = j === 0 || j === 5 ? 1 : dim;
      ends.push([p, e]);
      out += seg(W.E, p.B, kA, c, 8, o) + seg(p.B, p.X, kB, c, 8, o) + seg(p.X, e, kC, c, 9, o);
    });
    // 青やむらさきは、赤より少しだけ大きく曲がる
    const at = (j, len) => [ends[j][0].X[0] + ends[j][0].d[0] * len, ends[j][0].X[1] + ends[j][0].d[1] * len];
    const lo = win(t, cue(2) + 0.3, 1e9, 0.3);
    out += tag(...at(0, 235), 1150, 790, 'あか', lo, { col: '#d43a30', size: 44 });
    out += tag(...at(5, 230), 520, 650, 'むらさき', lo, { col: '#6f45d6', size: 44 });
    const cO = prog(t, cue(2) + 0.2, 0.4);
    if (cO > 0) {
      let c = card(680, 330) + text(0, -118, 'まがりかたの ちがい', { size: 40, w: 900 });
      c += `<rect x="-120" y="-70" width="240" height="200" rx="16" fill="${RB.drop}" opacity="0.6"/><line x1="-120" y1="-70" x2="-120" y2="130" stroke="${RB.dropLn}" stroke-width="8" stroke-linecap="round"/>`;
      c += `<line x1="-310" y1="-20" x2="-120" y2="-20" stroke="${C.ochre}" stroke-width="12" stroke-linecap="round"/><line x1="-120" y1="-20" x2="110" y2="-20" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/>`;
      const kk = eo(prog(t, cue(2) + 0.8, 0.9));
      c += seg([-120, -20], [110, 30], kk, RBC[0], 10) + seg([-120, -20], [110, 96], kk, RBC[5], 10);
      c += g(text(134, 30, 'あか', { size: 36, w: 900, fill: '#d43a30', anchor: 'start' }) + text(134, 98, 'むらさき', { size: 36, w: 900, fill: '#6f45d6', anchor: 'start' }), { o: prog(t, cue(2) + 1.5, 0.3) });
      out += g(c, { x: 1550, y: 310, o: cO });
    }
    out += kidShow('K', t, 1700, 846, { s: 0.56, start: cue(3) - 0.6, n: 0 });
    return out;
  },
});

// 6. ひとつの雨つぶから、ひとつの色：赤は高い雨つぶ、むらさきは低い雨つぶから
SCENES.push({
  id: 'which',
  draw(t) {
    let out = skyG('skq', '#3d78b8', '#a9d3ee') + topBadge();
    const GY = 830, EYE = [318, 702], DX = 1300, ang = j => lerp(27, 17, j / 5);
    const Y = j => EYE[1] - (DX - EYE[0]) * Math.tan(rad(ang(j)));   // j 番目の色を目に送る雨つぶの高さ
    const c1 = cue(1), d1 = cueE(1) - c1, tL = c1 + d1 * 0.45, c2 = cue(2);
    out += rainFx(880, 1900, 110, 780, t, { n: 34, seed: 6, o: 0.3 });
    // にじ（外がわが赤、内がわがむらさき）
    out += bow(DX, 900, 900 - Y(0) + 20, (Y(5) - Y(0) + 40) / 6, { k: eo(prog(t, c2 + 0.2, 1.6)), o: 0.62 });
    out += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${RB.grass}"/><rect x="0" y="${GY}" width="1920" height="14" fill="${RB.grassDk}"/>`;
    // お日さまの光（左から）
    const sun = (y, st) => { const k = eo(prog(t, st, 0.9)); return k <= 0 ? '' : seg([0, y], [DX - 60, y], k, RB.ray, 10, 0.85) + (k >= 1 ? `<path d="M ${DX - 52} ${y} L ${DX - 86} ${y - 17} L ${DX - 86} ${y + 17} Z" fill="${RB.ray}"/>` : ''); };
    out += sun(Y(0), 0.2) + sun(Y(5), tL - 1.2);
    out += g(text(250, Y(0) - 44, 'おひさまの ひかり', { size: 36, w: 900, fill: '#fff', extra: `stroke="#2f5f95" stroke-width="10" paint-order="stroke" stroke-linejoin="round"` }), { o: prog(t, 0.9, 0.4) });
    // 雨つぶから出る色のおうぎ。target の色だけが目にとどく
    const fan = (y, target, st) => {
      const k = eo(prog(t, st, 1.2)), dimK = prog(t, st + 2.2, 0.5), gone = 1 - prog(t, c2 - 0.1, 0.5);
      let s = '';
      RBC.forEach((c, j) => {
        const a = rad(ang(j)), hit = j === target;
        const len = hit ? (DX - EYE[0]) / Math.cos(a) : Math.min((DX - 150) / Math.cos(a), (GY - y) / Math.sin(a));
        s += seg([DX, y], [DX - Math.cos(a) * len, y + Math.sin(a) * len], k, c, hit ? 11 : 7, hit ? 1 : lerp(0.95, 0.4, dimK) * gone);
      });
      return s;
    };
    out += fan(Y(0), 0, cue(0) + 0.6) + fan(Y(5), 5, tL);
    // あいだの雨つぶ（2 で出る）：それぞれ ひとつの色
    [1, 2, 3, 4].forEach((j, i) => {
      const st = c2 + 0.3 + i * 0.2, a = rad(ang(j)), len = (DX - EYE[0]) / Math.cos(a);
      out += seg([DX, Y(j)], [DX - Math.cos(a) * len, Y(j) + Math.sin(a) * len], eo(prog(t, st, 0.8)), RBC[j], 8) + drop(DX, Y(j), 17, prog(t, st - 0.2, 0.3));
    });
    const rr = lerp(46, 19, eio(prog(t, c2 - 0.2, 0.5)));
    out += drop(DX, Y(0), rr, prog(t, 0.2, 0.3)) + drop(DX, Y(5), rr, prog(t, tL - 1.4, 0.3));
    out += kidShow('S', t, 300, GY + 4, { s: 0.36, start: 0.1, n: 0, bubble: false, look: [8, -7] });
    // 目にとどいた しるし
    const sp = Math.max(win(t, cue(0) + 1.5, cue(0) + 2.6, 0.3), win(t, tL + 1.1, tL + 2.2, 0.3));
    if (sp > 0) out += `<circle cx="${EYE[0]}" cy="${EYE[1]}" r="${26 + 16 * sp}" fill="none" stroke="#fff" stroke-width="6" opacity="${sp}"/>`;
    out += pop(badge('めに とどくのは ひとつの いろだけ', { fill: C.ink, size: 40 }), t, cue(0) + 2.2, 1040, 700, { end: c1 - 0.2 });
    const before = t < c2;
    out += tag(DX + 34, Y(0), 1640, Y(0), before ? 'たかい：あか' : 'そとがわは あか', prog(t, c1 + 0.4, 0.3) * (1 - win(t, c2 - 0.3, c2 + 0.3, 0.3)), { col: '#d43a30' });
    out += tag(DX + 34, Y(5), 1640, Y(5), before ? 'ひくい：むらさき' : 'うちがわは むらさき', prog(t, tL + 0.6, 0.3) * (1 - win(t, c2 - 0.3, c2 + 0.3, 0.3)), { col: '#6f45d6' });
    return out;
  },
});

// 7. ほんとうは丸い輪：下は地面にかくれる。お日さまが低いほど大きく、夏のお昼は見えない
SCENES.push({
  id: 'circle',
  draw(t) {
    const HY = 600, R = 380, CX = 960;
    const gk = eo(prog(t, cue(0) + 2.6, 1.2));       // 地面が出てきて、下をかくす
    // お日さまの高さ（度）：ふつう → 低い → 高すぎる（夏のお昼）
    const h = lerp(lerp(14, 3, eio(prog(t, cue(1) - 0.2, 1.6))), 50, eio(prog(t, cue(2) - 0.2, 2.6)));
    const cyR = lerp(470, HY + R * h / 42, gk);
    let out = skyG('skc', '#4c97dc', '#d6edfa') + topBadge();
    out += cloud(1560, 150, 0.7, '#fff', 0.8);
    out += ring(CX, cyR, R, 16, prog(t, 0.3, 0.6));
    out += `<rect x="0" y="${HY}" width="1920" height="${1080 - HY}" fill="${RB.grass}" opacity="${0.9 * gk}"/><rect x="0" y="${HY}" width="1920" height="12" fill="${RB.grassDk}" opacity="${gk}"/>`;
    out += `<clipPath id="cdn"><rect x="0" y="${HY + 12}" width="1920" height="${1080 - HY}"/></clipPath>`;
    out += g(`<g clip-path="url(#cdn)"><circle cx="${CX}" cy="${cyR}" r="${R}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="16 14"/><circle cx="${CX}" cy="${cyR}" r="${R - 96}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="16 14"/></g>`, { o: gk * 0.9 });
    out += g(tree(230, HY + 14, 0.7) + house(1700, HY + 14, 0.75) + tree(1820, HY + 14, 0.55), { o: gk });
    out += pop(badge('ほんとうは まるい わ', { fill: C.accent, size: 42 }), t, cue(0) + 0.6, 1610, 290, { end: cue(1) - 0.3 });
    out += tag(CX + Math.sqrt(Math.max(0, R * R - Math.pow(740 - cyR, 2))) - 8, 740, 1650, 760, 'じめんの した', win(t, cue(0) + 4.0, cue(1) - 0.3, 0.3));
    // お日さまの高さ
    const dk = prog(t, cue(1) - 0.6, 0.5);
    if (dk > 0) {
      const hd = Math.min(78, h * 1.56), ax = 70, ay = 105, ar = 185, sx = ax - ar * Math.cos(rad(hd)), sy = ay - ar * Math.sin(rad(hd));
      let d = card(430, 350) + text(0, -132, 'おひさまの たかさ', { size: 36, w: 900 });
      d += `<path d="M ${ax - ar} ${ay} A ${ar} ${ar} 0 0 1 ${ax} ${ay - ar}" fill="none" stroke="${C.muted}" stroke-width="4" stroke-dasharray="8 10"/>`;
      d += `<line x1="${ax}" y1="${ay - 46}" x2="${sx}" y2="${sy}" stroke="${C.ochre}" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
      d += `<line x1="-185" y1="${ay}" x2="185" y2="${ay}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
      d += person(ax, ay, 0.62) + `<circle cx="${sx}" cy="${sy}" r="24" fill="${C.yellow}" stroke="#e39a00" stroke-width="4"/>`;
      out += g(d, { x: 300, y: 320, o: dk });
    }
    out += pop(badge('おひさまが ひくい', { fill: C.ochre, size: 42 }), t, cue(1) + 0.8, 1620, 250, { end: cue(2) - 0.3 });
    out += pop(badge('にじは おおきい', { fill: C.accent, size: 42 }), t, cue(1) + 1.8, 1620, 340, { end: cue(2) - 0.3 });
    out += pop(badge('おひさまが たかすぎる', { fill: C.ochre, size: 40 }), t, cue(2) + 0.6, 1620, 250);
    out += pop(badge('にじは じめんの した', { fill: C.redUi, size: 40 }), t, cue(2) + 3.0, 1620, 340);
    out += pop(ngMark(-150, 0, 1.0) + text(-90, 2, 'みえない', { size: 56, w: 900, fill: '#fff', anchor: 'start', extra: STROKE }), t, cue(2) + 3.6, 960, 400);
    return out;
  },
});

// 8. だから雨のあと：3つがそろうとき
SCENES.push({
  id: 'after',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), d1 = cueE(1) - c1, sw = cue(2) - 0.9, aO = 1 - prog(t, sw, 0.4);
    // 3つ そろうと にじ
    if (aO > 0) {
      let a = g(text(960, 200, '3つ そろうと、にじが できる', { size: 62, w: 900 }), { o: prog(t, cue(0) + 0.2, 0.4) });
      const icons = [
        sunDisc(-110, -70, 46, 0, { glow: 0.5 }) + person(90, 70, 1.25) + arrow2(-60, -42, 44, 4, C.ochre, 9),
        person(-150, 60, 1.25) + [[40, -100], [110, -40], [30, 10], [150, -110], [170, 30], [90, 50]].map(([x, y]) => drop(x, y, 20)).join(''),
        sunDisc(-130, -60, 40, 0, { glow: 0.5 }) + [[70, -30, 0], [140, 40, 1], [160, -90, 2]].map(([x, y]) => `<line x1="-84" y1="-50" x2="${x - 30}" y2="${y - 8}" stroke="${C.yellow}" stroke-width="8" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="38" fill="#fff6c2" opacity="0.8" filter="url(#soft)"/>` + drop(x, y, 24)).join(''),
      ];
      const labels = ['おひさまが うしろ', 'まえに あめつぶ', 'あめつぶに ひかりが あたる'], cols = [C.ochre, C.blueUi, '#d4612a'];
      [0, 0.34, 0.63].forEach((f, i) => {
        const st = c1 + d1 * f, ck = prog(t, st, 0.35);
        a += pop(card(540, 420) + g(text(0, 10, '？', { size: 150, w: 900, fill: C.line }), { o: 1 - ck }) +
          g(g(icons[i], { y: -30, s: 1.15 }) + text(0, 156, labels[i], { size: 38, w: 900 }), { o: ck, s: lerp(0.9, 1, eo(ck)) }) +
          `<circle cx="-210" cy="-150" r="40" fill="${cols[i]}"/>` + text(-210, -147, i + 1, { size: 48, w: 900, fill: '#fff' }), t, cue(0) + 1.0 + i * 0.5, 360 + i * 600, 540);
      });
      out += g(a, { o: aO });
    }
    // 3つの場面でくらべる
    const bO = prog(t, sw + 0.3, 0.4);
    if (bO > 0) {
      let b = chipsRow([['① おひさまが うしろ', C.ochre], ['② まえに あめつぶ', C.blueUi], ['③ ひかりが あたる', '#d4612a']], t, 1020, 170, { size: 36, gap: 28, start: sw + 0.3, step: 0.15 });
      const P = [
        ['rain', 'あめの あいだ', 'おひさまが くもの なか', cue(2) - 0.2, false],
        ['clear', 'すっかり やんだ あと', 'あめつぶが ない', cue(3) - 0.2, false],
        ['after', 'とおりすぎた すぐあと', '3つ そろった！', cue(4) - 0.2, true],
      ];
      P.forEach(([kind, ttl, why, st, ok], i) => {
        const x = 360 + i * 600, mt = ok ? cue(4) + 3.4 : st + 2.0, mk = prog(t, mt, 0.3);
        let p = (ok && mk > 0 ? `<rect x="-286" y="-196" width="572" height="392" rx="34" fill="none" stroke="${C.ochre}" stroke-width="10" opacity="${mk}"/>` : '') +
          wx(kind, 540, 360, t, 'af' + i, { bowK: eo(prog(t, cue(4) + 1.4, 1.6)) });
        p += g(ok ? okMark(220, -130, 1.1) : ngMark(220, -130, 1.1), { o: mk });
        p += g(badge(ttl, { fill: ok ? C.accent : C.ink, size: 38 }), { y: 236 });
        p += g(text(0, 312, why, { size: 38, w: 900, fill: ok ? C.accent : C.redUi }), { o: prog(t, mt - 0.4, 0.3) });
        b += pop(p, t, st, x, 480);
      });
      out += g(b, { o: bO });
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
      let a = pop(card(1240, 190) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, -36, 'あまぐもが とおりすぎて、', { size: 52, w: 900, anchor: 'start' }) + text(-440, 36, 'すぐに おひさまが でたとき', { size: 52, w: 900, anchor: 'start' }) +
        g(wx('after', 210, 140, t, 'ans', { who: false }), { x: 480 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="66" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -150, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['おひさまが うしろ', C.ochre], ['まえに あめつぶ', C.blueUi], ['ひかりが あたる', '#d4612a']], t, 960, 680, { start: 2.6, step: 0.9 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const sunIc = `<circle r="34" fill="${C.yellow}"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${Math.cos(rad(a)) * 44}" y1="${Math.sin(rad(a)) * 44}" x2="${Math.cos(rad(a)) * 58}" y2="${Math.sin(rad(a)) * 58}" stroke="${C.yellow}" stroke-width="8" stroke-linecap="round"/>`).join('');
      const sprayIc = `<rect x="-52" y="-12" width="60" height="24" rx="8" fill="${C.accent}"/><path d="M 8 -8 L 26 -14 L 26 14 L 8 8 Z" fill="${C.ink}"/>` + [[44, -22], [50, 0], [44, 22], [66, -34], [72, -10], [72, 12], [66, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${RB.streak}"/>`).join('');
      const items = [
        [sunIc, 'よく はれた ひに、おとなと いっしょに', 'おひさまを せなかに して たつ', C.ink, 330],
        [sprayIc, 'ホースや きりふきで まえに みずしぶき', '→ あたまの かげの まわりに にじ', C.ink, 480],
        [warnIcon(0.9), 'おひさまは ぜったいに ちょくせつ みない', null, C.red, 620],
        [warnIcon(0.9), 'みずは ひとや でんきの ものに むけない', null, C.red, 730],
      ];
      items.forEach(([ic, s1, s2, col, y], i) => {
        b += pop(ic + (s2 ? text(110, -28, s1, { size: 40, w: 900, anchor: 'start', fill: col }) + text(110, 30, s2, { size: 40, w: 900, anchor: 'start', fill: col }) : text(110, 2, s1, { size: 40, w: 900, anchor: 'start', fill: col })), t, cue(i + 1), 210, y);
      });
      // 絵：お日さまを背中に、前に水しぶき。頭のかげのまわりに にじ
      const GY = 806, KX = 1290, KS = 0.56, HD = [1700, GY - 4], NZ = [KX + 96, GY - 166], sk = prog(t, cue(2) + 0.6, 0.6);
      let p = `<rect x="1130" y="${GY - 6}" width="760" height="14" rx="7" fill="${RB.grassDk}"/>`;
      p += g(sunIc, { x: 1200, y: 280, s: 1.5 });
      p += seg([1262, 330], [1262 + 200, 330 + 128], eo(prog(t, cue(1) + 0.8, 0.8)), C.yellow, 9, 0.9) + seg([1240, 362], [1240 + 150, 362 + 96], eo(prog(t, cue(1) + 0.9, 0.8)), C.yellow, 7, 0.9);
      // かげ（お日さまの反対がわへのびる）
      p += `<path d="M ${KX - 30} ${GY - 2} L ${HD[0] - 30} ${GY - 14} A 24 14 0 1 1 ${HD[0] - 28} ${GY + 6} L ${KX + 30} ${GY + 4} Z" fill="#3d311f" opacity="0.26"/>`;
      if (sk > 0) {
        for (let i = 0; i < 110; i++) {
          const f = (t * 0.45 + rnd(i, 21)) % 1, a = rad(-34 + rnd(i, 22) * 50), d = 30 + f * 470;
          p += `<circle cx="${(NZ[0] + Math.cos(a) * d).toFixed(1)}" cy="${(NZ[1] + Math.sin(a) * d * 0.8 + f * f * 170).toFixed(1)}" r="${(4 + rnd(i, 23) * 4).toFixed(1)}" fill="${RB.streak}" opacity="${(0.5 * sk * Math.min(1, f * 8, (1 - f) * 3)).toFixed(2)}"/>`;
        }
        p += ring(HD[0], HD[1], 190, 9, 0.95 * eo(prog(t, cue(2) + (cueE(2) - cue(2)) * 0.55, 0.8)));
        p += `<rect x="1130" y="${GY + 8}" width="760" height="240" fill="${C.paper}"/>`;
      }
      b += g(p, { o: prog(t, cue(1) + 0.2, 0.4) });
      b += g(`<path d="M ${KX - 120} ${GY - 4} Q ${KX - 70} ${GY - 210} ${NZ[0] - 26} ${NZ[1] + 4}" fill="none" stroke="${C.accent}" stroke-width="10" stroke-linecap="round"/><rect x="${NZ[0] - 34}" y="${NZ[1] - 9}" width="38" height="18" rx="5" fill="${C.ink}" transform="rotate(-12 ${NZ[0]} ${NZ[1]})"/>`, { o: sk });
      b += kidShow('S', t, KX, GY, { s: KS, start: cue(1) + 0.3, n: 0, bubble: false, pose: 'point', look: [8, 0] });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「にじ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

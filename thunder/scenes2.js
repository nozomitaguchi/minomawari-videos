
// みのまわり図鑑 動画「かみなりは、どうして ひかってから おとが するの？」（かみなり）
// 出どころ：everyday-trivia trivia/thunder-light-sound.md（絵の見本：assets/figures-thunder.js、メモ：ideas/notes/thunder.md）

// ---------- かみなりの道具 ----------
const TH = {
  sky0: '#2c3648', sky1: '#5d6b7c', cloud: '#7d8794', cloudDk: '#5f6975', cloudLt: '#a3acb7', bolt: '#ffd84a', boltDk: '#e0a400', hot: '#ff7a3a',
  sound: '#a394f5', soundDk: '#6654c8', ice: '#eef9ff', graupel: '#c9d4de', plus: '#e2574c', minus: '#3f7fd0', grass: '#4f7a58', grassDk: '#3f6648', wall: '#f3e6cf', wood: '#8a6240', streak: '#9fc0de',
};
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
// ふっている雨
function rainFx(x0, x1, y0, y1, t, { n = 40, u = 1, o = 1, seed = 1, col = TH.streak } = {}) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd(i, seed)), f = (t * (1.1 + rnd(i, seed + 2) * 0.6) + rnd(i, seed + 1)) % 1, y = lerp(y0, y1, f), len = 34 * u;
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - len * 0.25).toFixed(1)}" y2="${(y + len).toFixed(1)}" stroke="${col}" stroke-width="${(4 * u).toFixed(1)}" stroke-linecap="round" opacity="${(0.6 * Math.min(1, f * 6, (1 - f) * 6)).toFixed(2)}"/>`;
  }
  return `<g opacity="${o}">${s}</g>`;
}
// 背の高い かみなり雲（かなとこ雲）。(x, y) は雲の底のまん中。s=1 で 高さ およそ 570、はば およそ 760
function tcloud(x, y, s = 1, c1 = TH.cloud, c2 = TH.cloudDk, c3 = TH.cloudLt) {
  const b = [[-200, -40, 90], [-90, -60, 110], [40, -55, 115], [170, -45, 95], [-150, -150, 100], [0, -180, 130], [140, -160, 100], [-90, -290, 115], [80, -300, 120], [-50, -400, 125], [60, -410, 125]];
  let o = `<rect x="-330" y="-570" width="660" height="120" rx="60" fill="${c3}"/><ellipse cx="-270" cy="-505" rx="130" ry="56" fill="${c3}"/><ellipse cx="270" cy="-505" rx="130" ry="56" fill="${c3}"/><ellipse cx="0" cy="-470" rx="230" ry="70" fill="${c3}"/>`;
  o += b.map(([dx, dy, r]) => `<circle cx="${dx}" cy="${dy}" r="${r}" fill="${c1}"/>`).join('');
  o += `<rect x="-280" y="-70" width="560" height="80" rx="40" fill="${c2}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${o}</g>`;
}
// いなずま。(x, y) から下へ h。w は太さ
function bolt(x, y, h, o = 1, w = null, col = TH.bolt) {
  if (o <= 0) return '';
  const k = h / 80, u = 10 * (w ?? k * 0.8);
  const d = `M ${x} ${y} l ${-1.0 * u} ${30 * k} h ${1.2 * u} l ${-1.2 * u} ${30 * k} h ${1.2 * u} l ${-1.4 * u} ${20 * k} l ${2.6 * u} ${-28 * k} h ${-1.2 * u} l ${1.2 * u} ${-26 * k} h ${-1.2 * u} l ${0.8 * u} ${-26 * k} Z`;
  return `<path d="${d}" fill="${col}" stroke="${TH.boltDk}" stroke-width="${Math.max(3, 0.22 * u)}" stroke-linejoin="round" opacity="${o}"/>`;
}
// 光ったときの かがやき
const flashGlow = (x, y, r, o) => o <= 0 ? '' : `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff7c8" opacity="${0.55 * o}" filter="url(#glow)"/>`;
// 音の波（弧）。まん中 (x, y)、角度 a0〜a1（度。0=右、90=下）
function arcs(x, y, n, r0, gap, a0, a1, col = TH.sound, sw = 8, o = 1, ph = 0) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const r = r0 + (i + ph) * gap, p = a => [x + r * Math.cos(rad(a)), y + r * Math.sin(rad(a))], [x1, y1] = p(a0), [x2, y2] = p(a1);
    s += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${(o * (1 - (i + ph) / (n + 0.6))).toFixed(2)}"/>`;
  }
  return s;
}
// ＋ と − のしるし
const sign = (x, y, plus, r = 22, o = 1) => o <= 0 ? '' : `<g opacity="${o}"><circle cx="${x}" cy="${y}" r="${r}" fill="${plus ? TH.plus : TH.minus}"/><path d="M ${x - r * 0.5} ${y} h ${r} ${plus ? `M ${x} ${y - r * 0.5} v ${r}` : ''}" stroke="#fff" stroke-width="${r * 0.28}" stroke-linecap="round"/></g>`;
// 耳・車・小さな人
const earIcon = (s = 1) => `<g transform="scale(${s})"><path d="M -30 44 C -74 -10 -52 -92 10 -92 C 72 -92 82 -20 50 10 C 30 30 40 62 10 82 C -12 94 -30 82 -30 60" fill="${CH.skin}" stroke="${C.ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M -10 -8 C -20 -50 32 -60 36 -24 C 38 -6 16 0 12 22" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/></g>`;
const carIcon = (s = 1, col = '#4f8fd0') => `<g transform="scale(${s})"><path d="M -150 20 L -150 -20 Q -150 -40 -120 -44 L -80 -50 L -50 -100 Q -44 -110 -30 -110 L 60 -110 Q 76 -110 84 -98 L 112 -50 L 140 -42 Q 160 -38 160 -16 L 160 20 Z" fill="${col}"/><path d="M -42 -52 L -22 -92 L 14 -92 L 14 -52 Z M 30 -52 L 30 -92 L 62 -92 L 86 -52 Z" fill="#dff0fa"/><circle cx="-84" cy="22" r="34" fill="${C.ink}"/><circle cx="-84" cy="22" r="14" fill="#cfd4d9"/><circle cx="92" cy="22" r="34" fill="${C.ink}"/><circle cx="92" cy="22" r="14" fill="#cfd4d9"/></g>`;
const person = (x, y, s = 1, col = '#e0715f') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-13" y="-26" width="10" height="26" rx="5" fill="#35657f"/><rect x="3" y="-26" width="10" height="26" rx="5" fill="#35657f"/><rect x="-17" y="-72" width="34" height="52" rx="12" fill="${col}"/><circle cx="0" cy="-94" r="24" fill="${CH.skin}"/><path d="M -24 -96 A 24 24 0 0 1 24 -96 Q 0 -110 -24 -96 Z" fill="${CH.hairB}"/></g>`;
// 小さな しるし：いなずま と 音の波
const boltIc = (s = 1) => `<g transform="scale(${s})">${bolt(4, -60, 120, 1, 2.6)}</g>`;
const waveIc = (s = 1, col = TH.soundDk) => `<g transform="scale(${s})">${[0, 1, 2].map(i => `<path d="M ${-34 + i * 30} ${-22 - i * 12} Q ${-12 + i * 30} 0 ${-34 + i * 30} ${22 + i * 12}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round"/>`).join('')}</g>`;
// 暗い空の背景（地面つき）
const stormBg = (id, gy = 820) => skyG(id, TH.sky0, TH.sky1) + `<rect x="0" y="${gy}" width="1920" height="${1080 - gy}" fill="${TH.grass}"/><rect x="0" y="${gy}" width="1920" height="12" fill="${TH.grassDk}"/>`;
// 大きな文字（ふちつき）
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = C.ink, sw = 14 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });

// 1. つかみ：家の窓から。ピカッ …… ゴロゴロ
SCENES.push({
  id: 'hook',
  draw(t) {
    const tF = cue(0) + (cueE(0) - cue(0)) * 0.45, tG = cue(1) + (cueE(1) - cue(1)) * 0.5;
    const fl = t < tF ? 0 : Math.max(0, 1 - (t - tF) / 1.1) * (0.75 + 0.25 * Math.sin((t - tF) * 40));
    const sh = t < tG ? 0 : clamp(1 - (t - tG) / 1.8), dx = Math.sin(t * 46) * 5 * sh, dy = Math.cos(t * 39) * 3 * sh;
    let out = `<rect width="1920" height="1080" fill="${TH.wall}"/><rect x="0" y="900" width="1920" height="180" fill="#c79b6b"/><rect x="0" y="892" width="1920" height="16" fill="#b08455"/>`;
    // 窓の外
    const WX = 520, WY = 120, WW = 1040, WH = 600;
    let w = skyG('hsky', TH.sky0, TH.sky1, { x: WX, y: WY, w: WW, h: WH });
    w += `<path d="M ${WX} 640 Q 800 560 1100 630 T ${WX + WW} 600 L ${WX + WW} ${WY + WH} L ${WX} ${WY + WH} Z" fill="#3f4f52"/>`;
    w += house(760, 650, 0.8, '#59626e', '#454d58') + house(1380, 632, 0.65, '#59626e', '#454d58') + tree(1200, 640, 0.8, '#3c4a48');
    w += `<rect x="772" y="701" width="20" height="18" fill="#ffe9a0" transform="translate(0 -102)"/>`;
    w += rainFx(WX, WX + WW, WY, WY + WH - 40, t, { n: 60, seed: 2 });
    w += bolt(1240, 250, 380, clamp(1 - (t - tF - 0.75) / 0.3) * (t >= tF ? 1 : 0));
    w += cloud(700, 250, 2.0, TH.cloudDk, 1) + cloud(1020, 215, 2.4, TH.cloud, 1) + cloud(1380, 245, 2.1, TH.cloudDk, 1);
    w += `<rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" fill="#fffbe0" opacity="${0.78 * fl}"/>`;
    out += `<clipPath id="hwin"><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}"/></clipPath><g transform="translate(${dx} ${dy})"><g clip-path="url(#hwin)">${w}</g>`;
    out += `<rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" fill="none" stroke="${TH.wood}" stroke-width="26"/><line x1="${WX + WW / 2}" y1="${WY}" x2="${WX + WW / 2}" y2="${WY + WH}" stroke="${TH.wood}" stroke-width="14"/><line x1="${WX}" y1="${WY + WH / 2}" x2="${WX + WW}" y2="${WY + WH / 2}" stroke="${TH.wood}" stroke-width="14"/>`;
    out += `<rect x="${WX - 30}" y="${WY + WH + 10}" width="${WW + 60}" height="26" rx="8" fill="${TH.wood}"/></g>`;
    // カーテン
    [[WX - 86, 1], [WX + WW - 30, -1]].forEach(([x]) => { out += `<path d="M ${x} 96 L ${x + 116} 96 L ${x + 116} 760 Q ${x + 58} 790 ${x} 760 Z" fill="#d98f6f"/>` + [28, 58, 88].map(d => `<line x1="${x + d}" y1="110" x2="${x + d}" y2="760" stroke="#c57a5b" stroke-width="6"/>`).join(''); });
    out += `<rect x="${WX - 130}" y="84" width="${WW + 260}" height="18" rx="9" fill="${TH.wood}"/>`;
    out += `<rect width="1920" height="1080" fill="#fffbe0" opacity="${0.16 * fl}"/>`;
    // ピカッ
    out += pop(big(0, 0, 'ピカッ', 120, TH.bolt), t, tF, 880, 420, { end: tF + 1.7, d: 0.3 });
    // …（まつ）
    [0, 1, 2].forEach(i => { const st = tF + 1.3 + i * 0.75; if (st < tG - 0.2) out += `<circle cx="${980 + i * 60}" cy="330" r="16" fill="#fff" opacity="${0.9 * win(t, st, tG + 0.1, 0.2)}"/>`; });
    // ゴロゴロ
    if (t >= tG - 0.1) {
      const o = win(t, tG, tG + 2.4, 0.25);
      out += arcs(1240, 300, 4, 90, 70, 100, 200, TH.sound, 10, o, ((t - tG) * 1.4) % 1);
      out += big(1040 + dx * 2, 430 + dy * 2, 'ゴロゴロゴロ', 124, TH.sound, { o, r: Math.sin(t * 30) * 2 * sh, s: Math.max(back(prog(t, tG, 0.35)), 0.001) });
    }
    // 子どもたち
    const eyes = (t > tF && t < tF + 1.6) || (t > tG && t < tG + 1.8) ? 'wide' : 'open';
    out += kidShow('S', t, 130, 890, { s: 0.5, start: 0, n: 1, eyes, look: [7, -6], bubble: false });
    out += kidShow('B', t, 300, 890, { s: 0.5, start: 0, n: 0, eyes, look: [7, -6] });
    // ピカッ → … → ゴロゴロ ？
    const c3 = cue(3);
    out += pop(card(980, 210) + g(boltIc(1.1), { x: -400, y: 0 }) + text(-250, 4, 'ピカッ', { size: 62, w: 900, fill: '#c98f00' }) + text(-70, 0, '…', { size: 70, w: 900, fill: C.muted }) +
      g(waveIc(1.0), { x: 60, y: 0 }) + text(250, 4, 'ゴロゴロ', { size: 62, w: 900, fill: TH.soundDk }) + text(430, 4, '？', { size: 100, w: 900, fill: C.ochre }), t, c3 + 0.5, 1040, 600, { end: cueE(3) + 0.6 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">かみなりは、どうして</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#d49a00">ひかって</tspan>から <tspan fill="${TH.soundDk}">おと</tspan>が するの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(boltIc(1.3), { x: -150 }) + text(0, 0, '…', { size: 80, w: 900, fill: C.muted }) + g(waveIc(1.3), { x: 150 }), t, t0 + 1.8, 960, 820);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと おもう？', { size: 84, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'おとの ほうが、とどくのが おそい'], ['②', 'おとは、あとから なっている'], ['③', 'おとは、くもの うえで はねかえってくる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 900, 390 + i * 168);
    });
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. かみなりの正体は電気：雲の中で、あられと氷のつぶがぶつかって、電気が分かれる
SCENES.push({
  id: 'elec', night: true,
  draw(t) {
    let out = stormBg('esky') + topBadge(true);
    const CX = 620, CY = 660, S = 0.9, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2);
    out += rainFx(200, 1060, 660, 800, t, { n: 26, seed: 7, o: 0.8 });
    // 正体は電気：いなずま
    const tF = cue(0) + 0.9, fo = t < tF ? 0 : clamp(1 - (t - tF - 0.7) / 0.4);
    out += flashGlow(CX, 740, 200, fo) + bolt(CX + 10, 650, 168, fo);
    out += tcloud(CX, CY, S);
    out += pop(g(boltIc(1.0), { x: -340 }) + badge('しょうたいは でんき', { fill: TH.bolt, color: C.ink, size: 58, pad: 50 }), t, cue(0) + 1.2, 1420, 300, { end: c1 - 0.2 });
    // 雲の中のつぶ（あられ と 氷のつぶ）
    const pk = prog(t, c1 - 0.2, 0.6);
    if (pk > 0) {
      for (let i = 0; i < 14; i++) {
        const gr = i % 2 === 0, f = (t * (gr ? 0.12 : 0.16) + rnd(i, 31)) % 1, x = CX + (rnd(i, 32) - 0.5) * 300 + Math.sin(t * 1.3 + i) * 12, y = gr ? lerp(260, 600, f) : lerp(600, 260, f);
        out += gr ? `<circle cx="${x}" cy="${y}" r="15" fill="${TH.graupel}" stroke="#96a3b0" stroke-width="3" opacity="${pk * Math.min(1, f * 6, (1 - f) * 6)}"/>`
          : `<path d="M ${x} ${y - 11} L ${x + 9.5} ${y - 5.5} L ${x + 9.5} ${y + 5.5} L ${x} ${y + 11} L ${x - 9.5} ${y + 5.5} L ${x - 9.5} ${y - 5.5} Z" fill="${TH.ice}" opacity="${pk * Math.min(1, f * 6, (1 - f) * 6)}"/>`;
      }
    }
    // 電気が分かれる：上にプラス、まん中から下にマイナス
    const P = [[-210, -488], [-90, -500], [40, -490], [170, -498], [-20, -420], [100, -410]], M = [[-170, -70], [-60, -50], [60, -64], [170, -52], [-110, -150], [10, -140], [120, -150]];
    P.forEach(([x, y], i) => { out += sign(CX + x * S, CY + y * S, true, 22, prog(t, c1 + d1 * 0.5 + i * 0.3, 0.3)); });
    M.forEach(([x, y], i) => { out += sign(CX + x * S, CY + y * S, false, 22, prog(t, c1 + d1 * 0.5 + 0.15 + i * 0.3, 0.3)); });
    // 大きく見た図：ぶつかって、電気が分かれる
    const zO = win(t, c1 + 0.2, c2 - 0.2, 0.4);
    if (zO > 0) {
      const ZX = 1420, ZY = 430, ZR = 250, cyc = 3.4, ph = ((t - c1 - 0.6) % cyc + cyc) % cyc, hit = 1.2;
      let z = `<line x1="${CX + 60}" y1="${CY - 330}" x2="${ZX - ZR + 30}" y2="${ZY - 120}" stroke="#fff" stroke-width="4" stroke-dasharray="10 10" opacity="0.6"/><line x1="${CX + 60}" y1="${CY - 250}" x2="${ZX - ZR + 30}" y2="${ZY + 120}" stroke="#fff" stroke-width="4" stroke-dasharray="10 10" opacity="0.6"/>`;
      z += `<circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="#8f99a6" stroke="#fff" stroke-width="10"/>`;
      // あられ（大きい・おりていく）と 氷のつぶ（小さい・のぼっていく）
      const a = ph < hit ? eo(ph / hit) : 1, b = ph < hit ? 0 : eo(clamp((ph - hit) / 1.6));
      const gx = ZX + 40 - b * 10, gy = lerp(ZY - 120, ZY - 10, a) + b * 120, ix = ZX - 50 - b * 20, iy = lerp(ZY + 130, ZY + 50, a) - b * 190;
      z += `<circle cx="${gx}" cy="${gy}" r="62" fill="${TH.graupel}" stroke="#8c99a6" stroke-width="6"/>` + [[-20, -18], [16, -26], [24, 12], [-14, 22], [0, 0]].map(([u, v]) => `<circle cx="${gx + u}" cy="${gy + v}" r="9" fill="#aeb9c4"/>`).join('');
      z += `<path d="M ${ix} ${iy - 34} L ${ix + 29} ${iy - 17} L ${ix + 29} ${iy + 17} L ${ix} ${iy + 34} L ${ix - 29} ${iy + 17} L ${ix - 29} ${iy - 17} Z" fill="${TH.ice}" stroke="#9cc4dc" stroke-width="5"/>`;
      const sp = ph >= hit && ph < hit + 0.5 ? 1 - (ph - hit) / 0.5 : 0;
      if (sp > 0) for (let k = 0; k < 8; k++) { const q = k / 8 * Math.PI * 2, r1 = 24 + (1 - sp) * 30, r2 = r1 + 26; z += `<line x1="${ZX - 6 + Math.cos(q) * r1}" y1="${ZY + 22 + Math.sin(q) * r1}" x2="${ZX - 6 + Math.cos(q) * r2}" y2="${ZY + 22 + Math.sin(q) * r2}" stroke="${TH.bolt}" stroke-width="8" stroke-linecap="round" opacity="${sp}"/>`; }
      z += sign(gx + 44, gy - 44, false, 24, b > 0 ? 1 : 0) + sign(ix + 30, iy - 30, true, 22, b > 0 ? 1 : 0);
      z = `<clipPath id="ezc"><circle cx="${ZX}" cy="${ZY}" r="${ZR - 5}"/></clipPath>` + z.replace(`<circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="#8f99a6" stroke="#fff" stroke-width="10"/>`, `<circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="#8f99a6" stroke="#fff" stroke-width="10"/><g clip-path="url(#ezc)">`) + `</g>`;
      z += text(ZX + 150, ZY - 290, 'あられ', { size: 42, w: 900, fill: '#fff' }) + `<line x1="${ZX + 130}" y1="${ZY - 262}" x2="${ZX + 76}" y2="${ZY - 170}" stroke="#fff" stroke-width="4"/>`;
      z += text(ZX - 290, ZY + 262, 'こおりの つぶ', { size: 42, w: 900, fill: '#fff' }) + `<line x1="${ZX - 250}" y1="${ZY + 234}" x2="${ZX - 130}" y2="${ZY + 150}" stroke="#fff" stroke-width="4"/>`;
      out += g(z, { o: zO });
      out += pop(badge('ぶつかって、でんきが わかれる', { fill: 'rgba(255,250,240,0.92)', color: C.ink, size: 38 }), t, c1 + d1 * 0.45, 1440, 770, { end: c2 - 0.2 });
    }
    // セーターのパチパチと同じなかま
    const sO = prog(t, c2 + 0.1, 0.4);
    if (sO > 0) {
      let c = card(540, 300);
      c += `<path d="M -150 -70 L -90 -100 Q -60 -70 -30 -100 L 30 -70 L 70 30 L 30 46 L 6 -10 L 6 100 L -126 100 L -126 -10 L -150 46 L -190 30 Z" fill="#e0715f" stroke="#b9543f" stroke-width="6" stroke-linejoin="round"/><path d="M -126 76 L 6 76" stroke="#b9543f" stroke-width="8"/>`;
      [[80, -90, 0], [130, -30, 1], [60, 20, 2], [150, 50, 3], [-10, -120, 4]].forEach(([x, y, i]) => { const k = 0.5 + 0.5 * Math.sin(t * 14 + i * 2.1); c += `<path d="M ${x} ${y - 20} L ${x + 6} ${y - 6} L ${x + 20} ${y} L ${x + 6} ${y + 6} L ${x} ${y + 20} L ${x - 6} ${y + 6} L ${x - 20} ${y} L ${x - 6} ${y - 6} Z" fill="${TH.bolt}" stroke="${TH.boltDk}" stroke-width="3" opacity="${0.35 + 0.65 * k}" transform="rotate(${i * 20} ${x} ${y})"/>`; });
      c += text(150, 108, 'パチパチ', { size: 44, w: 900, fill: '#c98f00' });
      out += g(c, { x: 1430, y: 270, o: sO, s: lerp(0.92, 1, eo(sO)) });
      out += pop(badge('おなじ「でんき」の なかま', { fill: TH.bolt, color: C.ink, size: 40 }), t, c2 + 2.2, 1430, 490, { end: cue(3) - 0.2 });
    }
    out += kidShow('S', t, 1180, 850, { s: 0.5, start: c2 + 1.0, n: 0 });
    return out;
  },
});

// 4. 音の生まれかた：電気が流れる → 空気が熱くなってふくらむ → まわりがふるえる。光と音は ほとんど同じとき
SCENES.push({
  id: 'sound', night: true,
  draw(t) {
    let out = stormBg('ssky', 800) + topBadge(true);
    const BX = 790, BY = 262, BH = 530, c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    const tF = cue(0) + (cueE(0) - cue(0)) * 0.6, lit = t < tF ? 0 : 1, fl = t < tF ? 0 : Math.max(0, 1 - (t - tF) / 1.2);
    // 熱くなった空気（ふくらむ）
    const hot = prog(t, c1 + 0.3, 0.8), ex = eo(prog(t, c2 + 0.3, 1.2)), hw = lerp(46, 150, ex), pulse = 1 + 0.06 * Math.sin(t * 9);
    if (hot > 0) out += `<rect x="${BX - hw * pulse}" y="${BY - 10}" width="${hw * 2 * pulse}" height="${BH + 20}" rx="${hw}" fill="${TH.hot}" opacity="${hot * lerp(0.75, 0.4, ex)}" filter="url(#soft)"/>`;
    // まわりの空気のふるえ（左右に広がる波）
    const wv = prog(t, c2 + 1.2, 0.6);
    if (wv > 0) for (let i = 0; i < 5; i++) {
      const ph = ((t - c2 - 1.2) * 0.45 + i / 5) % 1, d = 170 + ph * 760, o = wv * (1 - ph) * 0.95, bend = 60;
      out += `<path d="M ${BX + d} ${BY + 20} Q ${BX + d + bend} ${BY + BH / 2} ${BX + d} ${BY + BH - 10}" fill="none" stroke="${TH.sound}" stroke-width="10" stroke-linecap="round" opacity="${o}"/>`;
      if (BX - d > -40) out += `<path d="M ${BX - d} ${BY + 20} Q ${BX - d - bend} ${BY + BH / 2} ${BX - d} ${BY + BH - 10}" fill="none" stroke="${TH.sound}" stroke-width="10" stroke-linecap="round" opacity="${o}"/>`;
    }
    out += flashGlow(BX, BY + BH / 2, 320, fl) + bolt(BX + 10, BY, BH, lit * lerp(0.9, 1, fl));
    // 雲（マイナスがたまっている）
    out += cloud(610, 244, 1.7, TH.cloudDk, 1) + cloud(850, 200, 2.5, TH.cloud, 1) + cloud(1110, 236, 2.0, TH.cloudDk, 1);
    [[590, 254], [710, 262], [840, 258], [970, 264], [1100, 252]].forEach(([x, y], i) => { out += sign(x, y, false, 20, win(t, 0.4 + i * 0.12, tF + 0.2, 0.3)); });
    [[620, 770], [790, 776], [960, 770]].forEach(([x, y], i) => { out += sign(x, y, true, 20, win(t, 0.9 + i * 0.12, tF + 0.2, 0.3)); });
    out += pop(big(0, 0, 'ピカッ', 110, TH.bolt), t, tF, 1150, 430, { end: c1 - 0.1, d: 0.3 });
    // 1万度くらい
    const th = `<rect x="-14" y="-70" width="28" height="110" rx="14" fill="#fff" stroke="${C.ink}" stroke-width="6"/><circle cx="0" cy="52" r="26" fill="${TH.plus}" stroke="${C.ink}" stroke-width="6"/><rect x="-6" y="-56" width="12" height="100" rx="6" fill="${TH.plus}"/>`;
    out += pop(g(th, { x: -250 }) + badge('1まんど くらい', { fill: TH.hot, color: '#fff', size: 56, pad: 44 }), t, c1 + (cueE(1) - c1) * 0.5, 1360, 400, { end: c2 - 0.2 });
    out += tag(BX + 60, 520, 1200, 560, 'あつく なった くうき', win(t, c1 + 1.0, c2 - 0.2, 0.3), { col: '#d4532a' });
    // ふくらむ → ふるわせる
    const ao = win(t, c2 + 0.4, c2 + 2.4, 0.3);
    out += g(arrow2(BX + 40, 480, BX + 190, 480, '#fff', 12) + arrow2(BX - 40, 480, BX - 190, 480, '#fff', 12), { o: ao });
    out += pop(badge('くうきが きゅうに ふくらむ', { fill: TH.hot, color: '#fff', size: 42 }), t, c2 + 0.5, 1420, 330, { end: c4 - 0.3 });
    out += pop(badge('まわりの くうきが ふるえる', { fill: TH.soundDk, color: '#fff', size: 42 }), t, c2 + (cueE(2) - c2) * 0.55, 1420, 430, { end: c4 - 0.3 });
    // このふるえが、ゴロゴロの音
    if (t >= c3) {
      const o = win(t, c3 + 0.3, c4 - 0.3, 0.3);
      out += big(1420, 610, 'ゴロゴロ', 120, TH.sound, { o, r: Math.sin(t * 24) * 1.5, s: Math.max(back(prog(t, c3 + 0.3, 0.35)), 0.001) });
      out += pop(badge('ふるえ ＝ おと', { fill: 'rgba(255,250,240,0.92)', color: C.ink, size: 40 }), t, c3 + 1.0, 1420, 740, { end: c4 - 0.3 });
    }
    // 光と音は、ほとんど同じときに生まれる
    const so = prog(t, c4 + 0.2, 0.4);
    if (so > 0) {
      let c = card(700, 420);
      c += g(boltIc(1.0), { x: -230, y: -100 }) + text(-150, -96, 'ひかり', { size: 60, w: 900, anchor: 'start', fill: '#c98f00' });
      c += g(waveIc(1.0), { x: -230, y: 40 }) + text(-150, 44, 'おと', { size: 60, w: 900, anchor: 'start', fill: TH.soundDk });
      c += `<path d="M 80 -130 Q 130 -130 130 -80 L 130 -50 Q 130 -28 160 -28 Q 130 -28 130 -6 L 130 24 Q 130 74 80 74" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`;
      c += text(250, -28, 'どうじ', { size: 58, w: 900, fill: C.redUi });
      c += text(0, 152, 'ほとんど おなじ ときに うまれる', { size: 40, w: 900 });
      out += g(c, { x: 1440, y: 470, o: so, s: lerp(0.92, 1, eo(so)) });
    }
    return out;
  },
});

// 5. 光は速く、音はおそい（きょうそう）。花火も同じ
SCENES.push({
  id: 'race',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const X0 = 480, X1 = 1500, Y1 = 400, Y2 = 620, c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), c6 = cue(6);
    out += pop(text(0, 0, 'ひかりと おとの きょうそう', { size: 62, w: 900 }), t, 0.3, 960, 190);
    // レーン
    [[Y1, 'ひかり', '#c98f00'], [Y2, 'おと', TH.soundDk]].forEach(([y, name, col], i) => {
      out += pop(`<rect x="-730" y="-75" width="1460" height="150" rx="34" fill="#fff" filter="url(#shadow)"/>` + text(-700, 2, name, { size: 46, w: 900, fill: col, anchor: 'start' }) +
        `<line x1="${X0 - 960}" y1="-62" x2="${X0 - 960}" y2="62" stroke="${C.line}" stroke-width="8"/>` +
        [0, 1, 2, 3, 4, 5].map(k => `<rect x="${X1 - 960 + (k % 2) * 16}" y="${-60 + k * 20}" width="16" height="20" fill="${C.ink}"/><rect x="${X1 - 960 + ((k + 1) % 2) * 16}" y="${-60 + k * 20}" width="16" height="20" fill="#fff" stroke="${C.ink}" stroke-width="1"/>`).join(''), t, 0.5 + i * 0.25, 960, y);
    });
    out += g(text(X0, 510, 'スタート', { size: 30, w: 900, fill: C.muted }) + text(X1 + 16, 510, 'ゴール', { size: 30, w: 900, fill: C.muted }), { o: prog(t, 1.0, 0.4) });
    // かみなり（スタートは同じ）と、目・耳（ゴール）
    out += pop(boltIc(2.0), t, 0.9, 130, 510);
    out += pop(eyeIcon(0.42), t, 1.1, 1790, Y1) + pop(earIcon(0.62), t, 1.2, 1790, Y2);
    out += pop(badge('どうじに スタート', { fill: C.redUi, size: 36 }), t, cue(0) + 1.4, X0 + 60, 290, { end: c1 + 1.0 });
    // 走る
    const tS = c1 + 0.5, pL = eo(prog(t, tS, 0.3)), pS = prog(t, tS, cueE(4) - 0.6 - tS);
    const lx = lerp(X0, X1 + 40, pL), sx = lerp(X0, X1 + 40, pS);
    if (pL > 0) out += `<line x1="${X0}" y1="${Y1}" x2="${lx}" y2="${Y1}" stroke="${TH.bolt}" stroke-width="16" stroke-linecap="round" opacity="0.55"/>`;
    out += g(ballG(lx, Y1, TH.bolt, 26), { o: prog(t, 1.3, 0.3) });
    if (pS > 0) out += `<line x1="${X0}" y1="${Y2}" x2="${sx}" y2="${Y2}" stroke="${TH.sound}" stroke-width="12" stroke-linecap="round" opacity="0.4"/>`;
    out += g(g(waveIc(0.9), { x: sx, y: Y2 + Math.sin(t * 8) * 4 }), { o: prog(t, 1.4, 0.3) });
    // 目にとどく・耳にとどく
    const eyeO = pL >= 1 ? win(t, tS + 0.3, tS + 1.6, 0.25) : 0;
    if (eyeO > 0) out += `<circle cx="1790" cy="${Y1}" r="${70 + 20 * eyeO}" fill="none" stroke="${TH.bolt}" stroke-width="10" opacity="${eyeO}"/>`;
    const earT = cueE(4) - 0.6, earO = win(t, earT, earT + 1.6, 0.25);
    if (earO > 0) out += `<circle cx="1790" cy="${Y2}" r="${70 + 20 * earO}" fill="none" stroke="${TH.sound}" stroke-width="10" opacity="${earO}"/>`;
    out += pop(badge('1びょうで やく 30まんキロメートル', { fill: '#c98f00', size: 40 }), t, c1 + 1.3, 960, 282);
    out += pop(badge('1びょうで やく 340メートル', { fill: TH.soundDk, size: 40 }), t, c2 + 0.6, 1010, 746);
    out += pop(badge('ひかりは おとの やく 100まんばい はやい', { fill: C.redUi, size: 36 }), t, c3 + 0.5, 1010, 510, { end: c4 + 0.2 });
    out += tag(1740, Y1 - 40, 1560, 300, 'さきに めに とどく', win(t, c4 + 1.6, c6 - 0.4, 0.3), { col: '#c98f00', size: 36 });
    out += tag(1740, Y2 + 44, 1560, 760, 'おくれて みみに とどく', win(t, earT + 0.2, c6 - 0.4, 0.3), { col: TH.soundDk, size: 36 });
    // カメレオン
    out += kidShow('K', t, 170, 850, { s: 0.56, start: cue(5) - 0.8, n: 0, bubble: false, mouth: lineOf('K') ? 'open' : 'smile', end: c6 - 0.1 });
    out += talkBubble('K', 470, 790, 262, 770, 42);
    // 花火も同じ
    const fo = prog(t, c6 - 0.1, 0.4);
    if (fo > 0) {
      const d6 = cueE(6) - c6, tB = c6 + d6 * 0.3, tD = c6 + d6 * 0.72, bk = eo(prog(t, tB, 0.7)), bo = t < tB ? 0 : clamp(1 - (t - tB - 2.6) / 1.4);
      let f = `<rect x="-560" y="-290" width="1120" height="580" rx="36" fill="#1c2742" filter="url(#shadow)"/>` + g(stars(4, 26).replace(/cx="([\d.]+)" cy="([\d.]+)"/g, (m, a, b) => `cx="${(+a) * 0.56 - 540}" cy="${(+b) * 0.6 - 270}"`), {});
      f += `<rect x="-560" y="210" width="1120" height="80" fill="#26334f"/><rect x="-560" y="250" width="1120" height="40" rx="0" fill="#1a2238"/>`;
      // 花火
      for (let k = 0; k < 16; k++) { const q = k / 16 * Math.PI * 2, r1 = 30 * bk, r2 = 170 * bk, col = [TH.bolt, '#ff7a6a', '#7fd7ff', '#b6f08a'][k % 4]; f += `<line x1="${-200 + Math.cos(q) * r1}" y1="${-70 + Math.sin(q) * r1}" x2="${-200 + Math.cos(q) * r2}" y2="${-70 + Math.sin(q) * r2}" stroke="${col}" stroke-width="10" stroke-linecap="round" opacity="${bo}"/><circle cx="${-200 + Math.cos(q) * r2}" cy="${-70 + Math.sin(q) * r2}" r="9" fill="${col}" opacity="${bo}"/>`; }
      f += person(360, 232, 1.2);
      f += big(40, -180, 'パッ', 76, TH.bolt, { o: win(t, tB, tD - 0.2, 0.2), stroke: '#1c2742' });
      const dO = win(t, tD, cueE(6) + 0.6, 0.25);
      f += arcs(-200, -70, 3, 260, 60, -30, 40, TH.sound, 9, dO, ((t - tD) * 1.2) % 1) + big(250, -40, 'ドーン', 96, TH.sound, { o: dO, r: Math.sin(t * 26) * 1.5, stroke: '#1c2742', s: Math.max(back(prog(t, tD, 0.3)), 0.001) });
      f += g(badge('はなびも おなじ', { fill: C.ochre, size: 44, pad: 40 }), { y: -290 });
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.96 * fo}"/>` + topBadge() + g(f, { x: 960, y: 480, o: fo, s: lerp(0.9, 1, eo(fo)) });
    }
    return out;
  },
});

// 6. 秒数をかぞえると、きょりがわかる：3秒で およそ1km。近いとバリッ、遠いとゴロゴロ
SCENES.push({
  id: 'count', night: true,
  draw(t) {
    const GY = 760, HX = 250, KM = 470, c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = stormBg('csky', GY) + topBadge(true);
    const xk = k => HX + 40 + KM * k;
    // きょりの目もり
    [1, 2, 3].forEach(k => { out += `<line x1="${xk(k)}" y1="${GY}" x2="${xk(k)}" y2="${GY + 22}" stroke="#fff" stroke-width="6"/>` + text(xk(k), GY + 46, k + 'キロメートル', { size: 30, w: 900, fill: '#fff' }); });
    // かみなり 3回：[光る時刻, 何キロ先, 音がとどくまでの秒（絵の中）, かぞえる数]
    const ev = [[c0 + 1.0, 1, 3.0, 3, 1.0, 1.0], [c2 - 0.5, 1, 1.75, 3, 0.55, 0.5], [c3 + 0.2, 3, 2.6, 9, 0.27, 0.2]];
    let cur = null;
    ev.forEach(e => { if (t >= e[0]) cur = e; });
    out += cloud(560, 220, 2.0, TH.cloudDk, 1) + cloud(800, 190, 2.3, TH.cloud, 1) + cloud(1080, 226, 2.0, TH.cloudDk, 1) + cloud(1380, 196, 2.2, TH.cloud, 1) + cloud(1680, 226, 2.2, TH.cloudDk, 1);
    let count = '';
    if (cur) {
      const [tF, km, T, n, step, delay] = cur, tau = t - tF, bx = xk(km), fl = Math.max(0, 1 - tau / 0.9);
      out += flashGlow(bx, 520, 260, fl) + bolt(bx + 8, 256, GY - 262, clamp(1 - (tau - 0.5) / 0.4));
      out += `<rect width="1920" height="1080" fill="#fffbe0" opacity="${0.14 * fl}"/>`;
      // 音の波：家へ向かって進む
      const p = clamp(tau / T), fx = lerp(bx - 30, HX + 110, p), go = tau < T + 0.1 ? 1 : clamp(1 - (tau - T) / 0.4);
      out += arcs(fx + 260, 540, 3, 250, 50, 150, 210, TH.sound, 10, go * Math.min(1, tau * 4));
      // かぞえる
      const shown = tau < delay ? 0 : Math.min(n, Math.floor((tau - delay) / step) + 1);
      if (shown >= 1 && tau < T + 2.6 && t < c4 - 0.2) count = String(shown);
      // とどいた
      if (tau >= T) out += big(HX + 340, 450, km === 1 ? 'ゴロゴロ' : 'ゴロ…ゴロ…', 76, TH.sound, { o: win(t, tF + T, Math.min(tF + T + 2.0, c4 - 0.1), 0.25), r: Math.sin(t * 24) * 1.5 });
    }
    // 家
    out += house(HX, GY + 2, 1.9, '#e9dcc6', '#b0563f');
    out += `<rect x="${HX + 49}" y="${GY - 120}" width="42" height="38" fill="#ffe9a0"/>`;
    if (count) out += g(`<circle r="84" fill="#fff" stroke="${C.ochre}" stroke-width="10"/>` + text(0, 6, count, { size: 110, w: 900, fill: C.ink }) + text(0, 122, 'びょう', { size: 40, w: 900, fill: '#fff' }), { x: HX, y: 330 });
    // 3秒で およそ1km
    const r1 = win(t, c1 + 0.3, c4 - 0.3, 0.3);
    out += g(`<line x1="${HX + 110}" y1="680" x2="${xk(1) - 10}" y2="680" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M ${HX + 100} 680 l 26 -16 v 32 Z M ${xk(1)} 680 l -26 -16 v 32 Z" fill="#fff"/>`, { o: r1 });
    out += pop(badge('3びょうで やく 1キロメートル', { fill: TH.soundDk, size: 40 }), t, c1 + 0.6, 730, 610, { end: c4 - 0.3 });
    out += pop(badge('9びょうなら やく 3キロメートル', { fill: C.ochre, size: 40 }), t, c3 + 2.2, 1400, 610, { end: c4 - 0.3 });
    // 近いとバリッ、遠いとゴロゴロ
    const d4 = cueE(4) - c4;
    const wave = (kind) => { let d = 'M -170 0'; for (let i = 1; i <= 34; i++) { const x = -170 + i * 10, y = kind === 'near' ? (i > 4 && i < 22 ? (i % 2 ? -1 : 1) * (62 - Math.abs(i - 9) * 4.2) : 0) : Math.sin(i * 0.55) * 26 * Math.sin(i / 34 * Math.PI); d += ` L ${x} ${y.toFixed(1)}`; } return `<path d="${d}" fill="none" stroke="${kind === 'near' ? TH.plus : TH.soundDk}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>`; };
    [['near', 'ちかい', 'バリッ', xk(1) - 60, c4 + 0.3, TH.plus], ['far', 'とおい', 'ゴロゴロ', xk(3) - 180, c4 + d4 * 0.5, TH.soundDk]].forEach(([kind, a, b, x, st, col]) => {
      out += pop(card(460, 330) + text(-190, -112, a, { size: 44, w: 900, anchor: 'start' }) + text(190, -112, b, { size: 52, w: 900, anchor: 'end', fill: col }) + g(wave(kind), { y: 20 }) +
        text(0, 124, kind === 'near' ? 'するどい おと' : 'ひくく ながい おと', { size: 38, w: 900, fill: C.muted }), t, st, x, 470);
    });
    return out;
  },
});

// 7. 音が聞こえたら、もう近い：建物や車の中へ。高い木の下はだめ
SCENES.push({
  id: 'safe',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), c2 = cue(2), c3 = cue(3);
    // ゴロゴロが聞こえたら、もう近い
    out += pop(earIcon(0.7), t, cue(0) + 0.2, 430, 240);
    out += g(arcs(600, 240, 3, 60, 40, 140, 220, TH.soundDk, 9, prog(t, cue(0) + 0.5, 0.3), (t * 1.2) % 1), {});
    out += pop(text(0, 0, 'ゴロゴロ', { size: 72, w: 900, fill: TH.soundDk }), t, cue(0) + 0.6, 800, 244);
    out += g(arrow2(980, 240, 1070, 240, C.ink, 12), { o: prog(t, cue(0) + 2.0, 0.3) });
    out += pop(g(boltIc(0.9), { x: -300 }) + badge('もう ちかい！', { fill: C.redUi, size: 60, pad: 46 }), t, cue(0) + 2.4, 1470, 240);
    // 建物・車・高い木
    const items = [
      [g(house(0, 70, 1.9, '#f4ead8', '#c0624c'), {}), 'たてものの なか', true, c1 + 0.2, 400],
      [g(carIcon(0.95), { y: 20 }), 'くるまの なか', true, c1 + (cueE(1) - c1) * 0.45, 960],
      [g(tree(-30, 90, 1.5) + bolt(70, -170, 150, 1) + person(74, 92, 0.9), {}), 'たかい きの した', false, c3 + 0.3, 1520],
    ];
    items.forEach(([ic, label, ok, st, x], i) => {
      const hi = i === 0 && t > c2 ? win(t, c2 + 0.2, c3 - 0.1, 0.3) : 0;
      out += pop((hi > 0 ? `<rect x="-252" y="-212" width="504" height="424" rx="38" fill="none" stroke="${C.ochre}" stroke-width="10" opacity="${hi}"/>` : '') + card(480, 400) + g(ic, { y: -40 }) +
        text(0, 140, label, { size: 44, w: 900, fill: ok ? C.ink : C.redUi }) + g(ok ? okMark(190, -150, 1.1) : ngMark(190, -150, 1.1), { o: prog(t, st + 0.6, 0.3) }), t, st, x, 570);
    });
    out += pop(badge('いえの なかは、きほんてきに あんぜん', { fill: C.accent, size: 38 }), t, c2 + 0.3, 680, 812, { end: c3 + 0.4 });
    out += pop(badge('きの したで あまやどり しない', { fill: C.redUi, size: 38 }), t, c3 + (cueE(3) - c3) * 0.5, 1380, 812);
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.blueUi}"/>` + text(-530, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-432, 2, 'おとの ほうが、とどくのが おそい', { size: 56, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['どうじに うまれる', C.redUi], ['ひかりは とても はやい', '#c98f00'], ['おとは おくれて とどく', TH.soundDk]], t, 960, 660, { start: 2.6, step: 1.2 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const numIc = `<rect x="-58" y="-40" width="116" height="80" rx="18" fill="#fff" stroke="${C.ochre}" stroke-width="7"/>` + text(0, 4, '1･2･3', { size: 36, w: 900, fill: C.ochre, ls: 0 });
      const downIc = `<circle r="46" fill="${TH.soundDk}"/>` + text(-4, 2, '3→2', { size: 34, w: 900, fill: '#fff', ls: 0 });
      const items = [
        [g(house(0, 46, 0.85, '#f4ead8', '#c0624c'), {}), 'いえの なかで、まどや かべから すこし はなれる', null, C.ink, 330],
        [numIc, 'ピカッから ゴロゴロまでの びょうすうを かぞえる', null, C.ink, 450],
        [downIc, 'みじかく なったら、かみなりが ちかづいている', null, C.ink, 570],
        [warnIcon(0.9), 'そとに いるときは、かぞえる より さきに', 'たてものや くるまの なかへ', C.red, 710],
      ];
      items.forEach(([ic, s1, s2, col, y], i) => {
        b += pop(ic + (s2 ? text(110, -28, s1, { size: 40, w: 900, anchor: 'start', fill: col }) + text(110, 30, s2, { size: 40, w: 900, anchor: 'start', fill: col }) : text(110, 2, s1, { size: 40, w: 900, anchor: 'start', fill: col })), t, cue(i + 1), 210, y);
      });
      // かぞえる絵：ピカッ … 1・2・3 … ゴロゴロ
      const c2 = cue(2), n = Math.floor(((t - c2) % 4.2 + 4.2) % 4.2 / 0.8);
      let p = card(470, 300) + g(boltIc(0.9), { x: -170, y: -50 }) + g(waveIc(0.9), { x: 170, y: -50 });
      [1, 2, 3].forEach(k => { p += `<circle cx="${-64 + (k - 1) * 64}" cy="-50" r="26" fill="${n >= k ? C.ochre : C.line}"/>` + text(-64 + (k - 1) * 64, -47, k, { size: 34, w: 900, fill: '#fff' }); });
      p += text(0, 80, n >= 4 ? 'ゴロゴロ！' : n >= 1 ? ['いち', 'に', 'さん'][Math.min(n, 3) - 1] : 'ピカッ', { size: 52, w: 900, fill: n >= 4 ? TH.soundDk : n >= 1 ? C.ochre : '#c98f00' });
      b += pop(p, t, c2 + 0.3, 1600, 420);
      b += kidShow('K', t, 1640, 850, { s: 0.8, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「かみなり」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

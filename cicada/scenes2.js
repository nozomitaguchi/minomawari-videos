// みのまわり図鑑「セミは、どうして 夏に なくの？」（もとの記事：everyday-trivia trivia/cicada-summer-song.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 色は図鑑の絵（assets/figures-cicada.js）とそろえる
const CC = {
  body: '#3d3a30', belly: '#6b5f45', wing: '#e6f0f3', vein: '#5f6b66', eye: '#c9b98a', brownw: '#a07a52',
  bark: '#9a7652', bark2: '#7d5d3f', soil: '#b08c62', soil2: '#8f6d48', soil3: '#cfae82', root: '#e0c897', rootDk: '#bfa06a',
  leaf: '#5e9b6e', leaf2: '#4f8a5f', air: '#dceef4', muscle: '#d07a68', muscleDk: '#a04a3a', mem: '#f6e7a8', memLine: '#d9a92e',
  sap: '#4f8fc8', sound: '#e8862f', larva: '#a8794a', larvaDk: '#6e4c2c', shell: '#c9a066',
};

// ---------- セミの道具 ----------
// 横から見たセミ（左向き。flip で右向き）。(x, y) は体のまん中
function cicadaSide(x, y, s = 1, { flip = false, r = 0, wing = 'clear' } = {}) {
  const wf = wing === 'brown' ? `fill="${CC.brownw}" fill-opacity="0.92"` : `fill="${CC.wing}" fill-opacity="0.88"`;
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})">
    <path d="M-14 8l-6 12M-6 9l-2 13M2 9l6 12" fill="none" stroke="${CC.body}" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="14" cy="2" rx="22" ry="9" fill="${CC.body}"/>
    <path d="M2 -5v14M10 -6v16M18 -6v16M26 -4v12" stroke="${CC.belly}" stroke-width="1.2"/>
    <ellipse cx="-12" cy="-1" rx="12" ry="11" fill="${CC.body}"/>
    <ellipse cx="-27" cy="1" rx="7" ry="8" fill="${CC.body}"/>
    <circle cx="-29" cy="-4" r="3.6" fill="${CC.eye}" stroke="#2a281f" stroke-width="1"/>
    <path d="M-26 8l10 7" stroke="${CC.body}" stroke-width="2" stroke-linecap="round"/>
    <path d="M-14 -10C10 -24 50 -20 62 -6C46 2 14 2 -12 -3Z" ${wf} stroke="${CC.vein}" stroke-width="1.1"/>
    <path d="M-8 -8C14 -14 38 -14 56 -7M6 -12l4 8M24 -15l2 10M40 -14l0 9" fill="none" stroke="${CC.vein}" stroke-width="0.8"/>
  </g>`;
}
// 木にとまったセミを上から見たところ（頭が上）。col：体の色、wk：はねののびぐあい 0〜1
function cicadaTop(x, y, s = 1, { wing = 'clear', col = CC.body, wk = 1, o = 1 } = {}) {
  const wf = wing === 'brown' ? `fill="${CC.brownw}" fill-opacity="0.92"` : `fill="${CC.wing}" fill-opacity="0.88"`;
  const W = wk <= 0.02 ? '' : `<g transform="translate(0 -8) scale(${lerp(0.6, 1, wk)} ${lerp(0.25, 1, wk)}) translate(0 8)">
      <path d="M-2 -10C-16 0 -18 30 -9 46C-4 38 -2 18 -1 -6Z" ${wf} stroke="${CC.vein}" stroke-width="1"/>
      <path d="M2 -10C16 0 18 30 9 46C4 38 2 18 1 -6Z" ${wf} stroke="${CC.vein}" stroke-width="1"/></g>`;
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}">
    <path d="M-8 -12l-12 -6M8 -12l12 -6M-8 -4l-13 4M8 -4l13 4" stroke="${col}" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="0" cy="8" rx="9" ry="20" fill="${col}"/>${W}
    <ellipse cx="0" cy="-14" rx="11" ry="9" fill="${col}"/>
    <ellipse cx="0" cy="-25" rx="12" ry="5" fill="${col}"/>
    <circle cx="-12" cy="-25" r="4" fill="${CC.eye}" stroke="#2a281f" stroke-width="1"/><circle cx="12" cy="-25" r="4" fill="${CC.eye}" stroke="#2a281f" stroke-width="1"/>
  </g>`;
}
// 下から見たセミ（頭が上）。ear：耳（こまく）の光りぐあい 0〜1
function cicadaUnder(x, y, s = 1, ear = 0) {
  const e = (cx) => `<ellipse cx="${cx}" cy="-8" rx="${4 + ear * 1.2}" ry="${5 + ear * 1.2}" fill="${mix('#f3e7c4', '#ffd23a', ear)}" stroke="${CC.memLine}" stroke-width="1.2"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-2 -60C-18 -40 -20 20 -9 56C-4 40 -2 0 -1 -40Z" fill="${CC.wing}" fill-opacity="0.88" stroke="${CC.vein}" stroke-width="1"/>
    <path d="M2 -60C18 -40 20 20 9 56C4 40 2 0 1 -40Z" fill="${CC.wing}" fill-opacity="0.88" stroke="${CC.vein}" stroke-width="1"/>
    <ellipse cx="0" cy="-48" rx="13" ry="6" fill="${CC.body}"/><circle cx="-13" cy="-48" r="4" fill="${CC.eye}"/><circle cx="13" cy="-48" r="4" fill="${CC.eye}"/>
    <ellipse cx="0" cy="-30" rx="12" ry="14" fill="${CC.body}"/>
    <path d="M0 -40v18" stroke="${CC.belly}" stroke-width="2"/>
    <path d="M-10 -32l-14 -8M10 -32l14 -8M-10 -24l-15 4M10 -24l15 4M-9 -18l-12 12M9 -18l12 12" stroke="${CC.body}" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="0" cy="12" rx="11" ry="30" fill="${CC.body}"/>
    <path d="M-9 2h18M-10 12h20M-9 22h18M-7 32h14" stroke="${CC.belly}" stroke-width="1.1"/>
    ${ear > 0.02 ? `<circle cx="0" cy="-8" r="${14 + ear * 4}" fill="#ffd23a" opacity="${0.45 * ear}"/>` : ''}${e(-5)}${e(5)}
  </g>`;
}
// 幼虫（左向き。flip で右向き）。(x, y) は体のまん中
function larva(x, y, s = 1, { flip = false, r = 0, c = CC.larva, o = 1, walk = 0 } = {}) {
  const w = Math.sin(walk) * 2.5;
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})" opacity="${o}">
    <path d="M-10 8l${-8 + w} 8M-2 9l${-3 - w} 10M6 9l${5 + w} 9" fill="none" stroke="${CC.larvaDk}" stroke-width="2" stroke-linecap="round"/>
    <path d="M-8 9l-12 2l-4 -4" fill="none" stroke="${CC.larvaDk}" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="10" cy="2" rx="16" ry="9" fill="${c}"/>
    <path d="M4 -6v15M11 -7v17M18 -5v14" stroke="${mix(c, '#3d2b1a', 0.4)}" stroke-width="1"/>
    <ellipse cx="-8" cy="0" rx="11" ry="9" fill="${c}"/>
    <ellipse cx="-20" cy="2" rx="6" ry="7" fill="${c}"/>
    <circle cx="-21" cy="-1" r="2.2" fill="#3d2b1a"/>
  </g>`;
}
// おんぷ
const note = (x, y, s = 1, c = CC.sound, o = 1) => o <= 0.01 ? '' : `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="5" ry="4" transform="rotate(-20)" fill="${c}"/><path d="M4 -1v-16l7 4" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></g>`;
// 音の波（(x, y) から dir の向きへ広がる）
function soundWaves(x, y, t, { dir = 1, n = 3, r0 = 30, step = 40, col = CC.sound, w = 8, o = 1, speed = 1.4, a = 0.7 } = {}) {
  if (o <= 0.01) return '';
  let out = '';
  for (let i = 0; i < n; i++) {
    const f = (((t * speed + i / n) % 1) + 1) % 1, r = r0 + f * step * n;
    const x1 = x + dir * r * Math.cos(a), y1 = y - r * Math.sin(a), y2 = y + r * Math.sin(a);
    out += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${dir > 0 ? 1 : 0} ${x1.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${(o * Math.sin(f * Math.PI)).toFixed(3)}"/>`;
  }
  return out;
}
// ふわふわのぼるおんぷ
function notesUp(x, y, t, { n = 4, spread = 200, rise = 220, s = 3, o = 1, col = CC.sound } = {}) {
  if (o <= 0.01) return '';
  let out = '';
  for (let i = 0; i < n; i++) {
    const f = (t * 0.45 + i / n) % 1, sd = i % 2 ? 1 : -1;
    out += note(x + sd * (spread * 0.5 + f * spread * 0.5 + rnd(i, 41) * 40), y - f * rise + Math.sin(t * 3 + i) * 8, s * (0.8 + rnd(i, 42) * 0.4), col, o * Math.sin(f * Math.PI));
  }
  return out;
}
// 木のみき（まん中 x、上 y0 〜 下 y1）
function trunk(x, y0, y1, w, col = CC.bark, col2 = CC.bark2) {
  let o = `<rect x="${x - w / 2}" y="${y0}" width="${w}" height="${y1 - y0}" fill="${col}"/>`;
  const n = Math.max(3, Math.round((y1 - y0) / 90));
  for (let i = 0; i < n; i++) {
    const lx = x - w / 2 + w * (0.18 + rnd(i, 51) * 0.64), ly = y0 + (y1 - y0) * (i + 0.2 + rnd(i, 52) * 0.4) / n, len = Math.min(40 + rnd(i, 53) * 60, y1 - ly - 14);
    if (len < 12) continue;
    o += `<path d="M ${lx} ${ly} v ${len}" stroke="${col2}" stroke-width="${Math.max(4, w * 0.04)}" stroke-linecap="round"/>`;
  }
  return o;
}
// 白いふちの字
const olText = (x, y, str, { size = 44, fill = '#fff', ol = '#3d3a30', sw = 10, anchor = 'middle' } = {}) =>
  text(x, y, str, { size, w: 900, fill, anchor, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });
// 指し線
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;

// 1. つかみ：夏の公園のセミの声 → 冬は聞こえない
const HOOK_TREE = { x: 1270, gy: 850, ty: 330 };
function hookTree(bare) {
  const { x, gy, ty } = HOOK_TREE;
  let o = '';
  // えだ（冬に見える）
  o += `<path d="M ${x} ${ty + 30} L ${x - 190} ${ty - 150} M ${x} ${ty + 30} L ${x + 200} ${ty - 130} M ${x} ${ty + 30} L ${x + 10} ${ty - 260} M ${x - 110} ${ty - 76} L ${x - 250} ${ty - 110} M ${x + 120} ${ty - 66} L ${x + 150} ${ty - 230} M ${x + 6} ${ty - 120} L ${x - 110} ${ty - 250}" fill="none" stroke="${CC.bark}" stroke-width="34" stroke-linecap="round"/>`;
  o += trunk(x, ty, gy, 190);
  if (bare < 0.99) o += `<g opacity="${1 - bare}">` + [[0, -170, 240], [-200, -70, 165], [200, -70, 165], [-100, -290, 150], [110, -280, 150]].map(([dx, dy, r], i) => `<circle cx="${x + dx}" cy="${ty + dy}" r="${r}" fill="${i % 2 ? CC.leaf2 : CC.leaf}"/>`).join('') + `</g>`;
  return o;
}
const FLAKES = Array.from({ length: 30 }, (_, i) => [rnd(i, 61) * 1920, rnd(i, 62) * 1080, 0.6 + rnd(i, 63) * 0.8]);
SCENES.push({
  id: 'hook',
  draw(t) {
    const c1 = cue(1), c3 = cue(3);
    const wk = eio(prog(t, c1 - 0.2, 1.3)) * (1 - eio(prog(t, c3 - 0.3, 1.0)));   // 冬のぐあい
    const sing = 1 - clamp(wk * 3);
    let out = skyRect('skh', 0) + `<rect width="1920" height="1080" fill="#e6ecf2" opacity="${0.85 * wk}"/>`;
    out += g(sunDisc(330, 170, 72, 0), { o: 1 - 0.7 * wk });
    out += cloud(((700 + t * 16) % 2300) - 180, 210, 0.8, '#fff', 0.9) + cloud(((1700 + t * 12) % 2300) - 180, 150, 0.6, '#fff', 0.85);
    out += `<path d="M 0 790 Q 420 700 860 770 T 1920 740 L 1920 1080 L 0 1080 Z" fill="${mix('#93cf8c', '#eef2f5', wk)}"/>`;
    out += hookTree(wk);
    out += `<path d="M 0 880 Q 620 810 1240 890 T 1920 860 L 1920 1080 L 0 1080 Z" fill="${mix('#5fae5f', '#dfe6ec', wk)}"/>`;
    // 木にとまって鳴くセミ
    const { x: TX } = HOOK_TREE, CY = 610;
    out += g(cicadaTop(0, 0, 3.4), { x: TX, y: CY + Math.sin(t * 30) * 1.2 * sing, o: sing });
    out += soundWaves(TX + 110, CY, t, { dir: 1, n: 3, r0: 30, step: 60, o: sing, w: 10 }) + soundWaves(TX - 110, CY, t, { dir: -1, n: 3, r0: 30, step: 60, o: sing, w: 10 });
    out += notesUp(TX, CY - 60, t, { n: 4, spread: 330, rise: 200, s: 3.2, o: sing });
    out += g(olText(0, 0, 'ミーン ミン', { size: 66, fill: CC.sound, ol: '#fffaf0', sw: 14 }), { x: 800, y: 430 + Math.sin(t * 5) * 6, s: 1 + Math.sin(t * 9) * 0.03, o: sing * prog(t, 0.6, 0.4) });
    // 冬：しーん
    if (wk > 0) {
      FLAKES.forEach(([x0, y0, s], i) => {
        const y = (y0 + t * 80 * s) % 1080, x = x0 + Math.sin(t * 1.2 + i) * 24;
        out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${5 * s}" fill="#fff" opacity="${0.9 * wk}"/>`;
      });
      out += g(text(0, 0, 'しーん…', { size: 72, w: 900, fill: '#8090a0' }), { x: 850, y: 380, o: wk * prog(t, c1 + 1.2, 0.5) });
    }
    // 子どもたち（木を見上げる）
    const eyes = wk > 0.5 ? 'wide' : 'open';
    out += kidShow('S', t, 250, 880, { s: 0.5, start: 0, n: 0, eyes, look: [7, -6] });
    out += kidShow('B', t, 440, 880, { s: 0.5, start: 0, n: 1, eyes, look: [7, -6], bubble: false });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 250);
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#8a5a2c">セミ</tspan>は、</text>`, { x: 960, y: 430, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="#e0662c">夏</tspan>に なくの？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = cicadaSide(0, 0, 3.4, { flip: true }) + soundWaves(120, -6, t, { dir: 1, n: 3, r0: 20, step: 34, w: 8 }) + note(-150, -70, 3.4) + note(-230, -20, 2.6);
      out += pop(ic, t, t0 + 1.8, 960, 850);
    }
    return out;
  },
});

// 2. 予想：夏になる前、どこにいた？
const GUESS_ICON = [
  // 南の国（太陽とヤシの木の島）
  `<circle cx="-38" cy="-30" r="20" fill="${C.yellow}"/><ellipse cx="6" cy="40" rx="58" ry="13" fill="#ecd9a6"/><path d="M 10 38 Q 2 4 16 -22" fill="none" stroke="#8a6a4a" stroke-width="9" stroke-linecap="round"/><path d="M 16 -22 q -30 -14 -46 6 M 16 -22 q 30 -18 48 2 M 16 -22 q -8 -30 -34 -30 M 16 -22 q 14 -28 40 -24" fill="none" stroke="#3f9a55" stroke-width="9" stroke-linecap="round"/>`,
  // 木のあな
  `<rect x="-40" y="-54" width="80" height="108" rx="8" fill="${CC.bark}"/><path d="M -20 -40 v 22 M 22 14 v 26" stroke="${CC.bark2}" stroke-width="5" stroke-linecap="round"/><ellipse cx="0" cy="2" rx="24" ry="30" fill="#3a2a1c"/>${text(44, -40, 'z', { size: 30, w: 900, fill: C.muted })}${text(62, -62, 'z', { size: 22, w: 900, fill: C.muted })}`,
  // 土の中
  `<rect x="-56" y="-30" width="112" height="84" rx="10" fill="${CC.soil}"/><rect x="-56" y="-42" width="112" height="20" rx="8" fill="#6fba68"/><circle cx="-34" cy="30" r="4" fill="${CC.soil2}"/><circle cx="36" cy="-4" r="4" fill="${CC.soil2}"/><circle cx="30" cy="36" r="3" fill="${CC.soil2}"/>${text(0, 14, '？', { size: 44, w: 900, fill: '#fffaf0' })}`,
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(cicadaSide(-560, -4, 2.4, { flip: true }) + note(-440, -40, 2.4) + text(40, 0, 'なつの まえ、どこに いた？', { size: 66, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'みなみの くにへ とんで いって いた'], ['②', 'きの あなの なかで ねむって いた'], ['③', 'つちの なかで くらして いた']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 48, w: 700, anchor: 'start' }) + g(GUESS_ICON[i], { x: 500, y: 0, s: 0.95 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 330, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 鳴いているのはオスだけ
SCENES.push({
  id: 'male',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = `<rect width="1920" height="1080" fill="#eaf5ee"/>` + topBadge();
    // 葉っぱとえだ
    [[140, 250, -20], [330, 170, 15], [1560, 200, -30], [1790, 300, 10], [960, 120, 0], [1180, 180, 25], [700, 200, -15]].forEach(([x, y, r], i) => {
      out += `<g transform="translate(${x} ${y + Math.sin(t * 1.4 + i) * 5}) rotate(${r + Math.sin(t * 1.1 + i) * 4})"><path d="M -70 0 Q 0 -44 70 0 Q 0 44 -70 0 Z" fill="${i % 2 ? '#bfe0c2' : '#cfe8cf'}"/></g>`;
    });
    out += `<path d="M -40 668 Q 700 630 1960 690" fill="none" stroke="${CC.bark}" stroke-width="64" stroke-linecap="round"/><path d="M -40 650 Q 700 612 1960 672" fill="none" stroke="#b08a62" stroke-width="10" stroke-linecap="round" opacity="0.7"/>`;
    const MX = 590, MY = 508, FX = 1330, FY = 516, S = 5.4;
    const singT = c0 + d0 * 0.42, sing = prog(t, singT, 0.4);
    // オス（右向き＝メスのほうを向く）
    out += pop(cicadaSide(0, 0, S, { flip: true }), t, 0.2, MX, MY + Math.sin(t * 28) * 1.2 * sing);
    // メス（左向き）
    const hear = prog(t, c1 + d1 * 0.3, 0.4) * (1 - prog(t, c2 - 0.2, 0.3));
    out += pop(cicadaSide(0, 0, S), t, 0.4, FX, FY - Math.abs(Math.sin(t * 5)) * 6 * hear);
    // はじめは、どっちが鳴いているかわからない
    const qO = win(t, 0.6, singT, 0.25);
    out += g(text(0, 0, '？', { size: 110, w: 900, fill: C.ochre }), { x: MX, y: 300, o: qO }) + g(text(0, 0, '？', { size: 110, w: 900, fill: C.ochre }), { x: FX, y: 300, o: qO });
    out += pop(badge('オス', { fill: C.accent, size: 54, pad: 46 }), t, singT, MX, 300);
    out += pop(badge('メス', { fill: C.ochre, size: 54, pad: 46 }), t, singT + 0.4, FX, 300);
    // オスの声
    const toF = prog(t, c1 - 0.2, 0.5);
    out += soundWaves(MX + 200, MY - 6, t, { dir: 1, n: 4, r0: 30, step: lerp(34, 68, toF), o: sing, w: 10 });
    out += notesUp(MX - 40, MY - 150, t, { n: 3, spread: 260, rise: 150, s: 3, o: sing * (1 - toF * 0.5) });
    out += pop(badge('なく', { fill: C.accent, size: 44 }), t, singT + 0.6, MX + 150, 770);
    out += pop(badge('ここに いるよ！', { fill: '#e0782c', size: 48 }), t, c1 + d1 * 0.3, 960, 400, { end: c2 - 0.1 });
    // メスは鳴かない
    out += pop(badge('なかない', { fill: '#7f8a94', size: 44 }), t, c2 + 0.2, FX, 770);
    // 音を出すしくみはオスにしかない
    const mk = c2 + d2 * 0.42;
    const ring = prog(t, mk, 0.4);
    if (ring > 0) {
      const bx = MX - 14 * S, by = MY + 12, pr = 74 + Math.sin(t * 6) * 5;
      out += g(`<circle r="${pr}" fill="${C.yellow}" opacity="0.28"/><circle r="${pr}" fill="none" stroke="${C.yellow}" stroke-width="10"/>`, { x: bx, y: by, o: ring });
      out += pointer(bx - 30, 770 - 44, bx - 6, by + 78, '#9a7a1a', ring);
      const fx = FX + 14 * S, fk = prog(t, mk + 0.7, 0.4);
      out += g(`<circle r="74" fill="none" stroke="#8a949c" stroke-width="8" stroke-dasharray="16 14"/>` + cross(0, 0, 0.42, '#8a949c'), { x: fx, y: FY + 12, o: fk });
    }
    out += pop(badge('おとを だす しかけ', { fill: '#9a7a1a', size: 38 }), t, mk + 0.2, MX - 190, 770);
    return out;
  },
});

// 4. 音は、おなかの太鼓
// おなかの中（切り口）。pull：筋肉が膜を引くぐあい 0〜1。まん中が (0, 0)
function bellyCut(pull) {
  const L = -400, b = lerp(-64, 58, pull), mx = L + b / 2;
  let o = `<path d="M ${L} -190 L 210 -190 A 190 190 0 0 1 210 190 L ${L} 190 Z" fill="${CC.air}"/>`;
  // 筋肉（膜のまん中から、おなかの下がわへ）
  const ax = -130, ay = 172, mw = lerp(44, 66, pull);
  o += `<line x1="${mx + 8}" y1="0" x2="${ax}" y2="${ay}" stroke="${CC.muscleDk}" stroke-width="${mw + 8}" stroke-linecap="round"/><line x1="${mx + 8}" y1="0" x2="${ax}" y2="${ay}" stroke="${CC.muscle}" stroke-width="${mw}" stroke-linecap="round"/>`;
  for (let i = 1; i < 5; i++) { const f = i / 5, px = lerp(mx + 8, ax, f), py = lerp(0, ay, f); o += `<line x1="${px - 10}" y1="${py - mw * 0.36}" x2="${px + 14}" y2="${py + mw * 0.36}" stroke="${CC.muscleDk}" stroke-width="4" opacity="0.55" stroke-linecap="round"/>`; }
  o += `<path d="M ${L} -190 L 210 -190 A 190 190 0 0 1 210 190 L ${L} 190" fill="none" stroke="${CC.body}" stroke-width="30" stroke-linejoin="round" stroke-linecap="round"/>`;
  o += `<path d="M ${L} -190 L ${L} -128 M ${L} 128 L ${L} 190" stroke="${CC.body}" stroke-width="30" stroke-linecap="round"/>`;
  // 膜（引かれると内がわへへこむ）
  o += `<path d="M ${L} -128 Q ${L + b} 0 ${L} 128 Z" fill="${CC.mem}"/><path d="M ${L} -128 Q ${L + b} 0 ${L} 128" fill="none" stroke="${CC.memLine}" stroke-width="16" stroke-linecap="round"/>`;
  [-70, 0, 70].forEach(y => { const k = 1 - (y / 128) * (y / 128); o += `<line x1="${L + b * 0.5 * k - 16}" y1="${y}" x2="${L + b * 0.5 * k + 16}" y2="${y}" stroke="#a87f1c" stroke-width="7" stroke-linecap="round"/>`; });
  return o;
}
// たいこ。hit：バチが当たるぐあい 0〜1。まん中が (0, 0)
function taiko(hit) {
  let o = `<rect x="-120" y="-40" width="240" height="150" rx="18" fill="#c9483a"/><ellipse cx="0" cy="110" rx="120" ry="26" fill="#a83a2e"/><rect x="-120" y="-40" width="240" height="150" fill="#c9483a"/>`;
  o += `<ellipse cx="0" cy="-40" rx="120" ry="${32 - hit * 5}" fill="#f6ecc8" stroke="#8a6a3a" stroke-width="7"/>`;
  [-90, -45, 0, 45, 90].forEach(x => { o += `<circle cx="${x}" cy="${-4 + Math.sqrt(1 - (x / 120) * (x / 120)) * 26}" r="7" fill="#3a2a1c"/>`; });
  const a = lerp(-34, 0, hit);
  o += `<g transform="translate(26 -52) rotate(${a})"><line x1="0" y1="0" x2="150" y2="-130" stroke="#b0835a" stroke-width="18" stroke-linecap="round"/><circle cx="4" cy="-4" r="15" fill="#8a5a2c"/></g>`;
  if (hit > 0.6) o += `<path d="M -50 -84 l -14 -22 M 0 -92 l 0 -26 M -90 -66 l -24 -12" stroke="${CC.sound}" stroke-width="7" stroke-linecap="round" opacity="${(hit - 0.6) / 0.4}"/>`;
  return o;
}
SCENES.push({
  id: 'drum',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, cb = cue(1), c1 = cue(2), d1 = cueE(2) - c1, c2 = cue(3), c3 = cue(4), d3 = cueE(4) - c3;
    let out = PAPER + topBadge();
    // A：のどではなく、おなか
    const aO = 1 - prog(t, c1 - 0.6, 0.4);
    if (aO > 0) {
      const CX = 856, CY = 470, S = 8.4;
      let a = pop(cicadaSide(0, 0, S), t, 0.2, CX, CY);
      const nk = c0 + d0 * 0.4;
      a += g(cross(0, 0, 0.6, '#8a949c'), { x: CX - 26 * S, y: CY + 20, o: prog(t, nk, 0.25), s: lerp(1.5, 1, eo(prog(t, nk, 0.3))) });
      a += pop(badge('のどでは ない', { fill: '#7f8a94', size: 42 }), t, nk + 0.2, CX - 26 * S - 110, 720);
      const bk = cb + 0.2, ring = prog(t, bk, 0.4);
      const bx = CX + 14 * S, by = CY + 16, pr = 118 + Math.sin(t * 6) * 6;
      a += g(`<circle r="${pr}" fill="${C.yellow}" opacity="0.25"/><circle r="${pr}" fill="none" stroke="${C.yellow}" stroke-width="14"/>`, { x: bx, y: by, o: ring, s: Math.max(back(ring), 0.001) });
      a += pop(badge('おなかで おとを だす', { fill: C.accent, size: 46 }), t, bk + 0.3, bx + 110, 720);
      out += g(a, { o: aO });
    }
    // B：おなかの中。筋肉が膜を引くと、カチッ
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      const BX = lerp(960, 780, eio(prog(t, c3 - 0.6, 0.7))), BY = 470, P = 1.0, s0 = c1 + d1 * 0.3;
      const ph = t > s0 ? ((t - s0) % P) / P : -1;
      const pull = ph < 0 ? 0 : ph < 0.14 ? eo(ph / 0.14) : ph < 0.45 ? 1 : ph < 0.65 ? 1 - eio((ph - 0.45) / 0.2) : 0;
      const click = ph < 0.1 ? 0 : clamp(1 - (ph - 0.1) / 0.45);
      const res = prog(t, c2 + 0.2, 0.6), loud = prog(t, c3 + d3 * 0.3, 0.6);
      let b = g(bellyCut(pull), { x: BX, y: BY });
      // おなかの中でひびく音
      if (ph >= 0.1) for (let i = 0; i < 4; i++) {
        const f = (ph - 0.1) / 0.9 + i * 0.16; if (f > 1) continue;
        const x = BX - 300 + f * 720, h = 80 + 60 * Math.sin(f * Math.PI);
        b += `<path d="M ${x} ${BY - h} Q ${x + 46} ${BY} ${x} ${BY + h}" fill="none" stroke="${CC.sound}" stroke-width="${lerp(6, 11, res)}" stroke-linecap="round" opacity="${(lerp(0.3, 0.9, res) * Math.sin(f * Math.PI) * (1 - i * 0.2)).toFixed(3)}"/>`;
      }
      // カチッ
      b += g(`<path d="M 40 -60 L 86 -92 M 52 0 L 108 0 M 40 60 L 86 92" stroke="${CC.sound}" stroke-width="9" stroke-linecap="round" transform="scale(-1 1)"/>` + olText(-190, -4, 'カチッ', { size: 66, fill: CC.sound, ol: '#fffaf0', sw: 14 }), { x: BX - 420, y: BY, o: click, s: lerp(0.9, 1.08, click) });
      // 名前
      b += pop(badge('まく', { fill: '#b8862a', size: 42 }), t, c1 + 0.5, BX - 530, 250) + pointer(BX - 500, 290, BX - 414, BY - 110, '#b8862a', prog(t, c1 + 0.7, 0.3));
      b += g(olText(0, 0, 'きんにく', { size: 44, fill: CC.muscleDk, ol: '#fffaf0', sw: 12 }), { x: BX - 160, y: 500, o: prog(t, c1 + d1 * 0.15, 0.3) });
      b += pop(olText(0, -28, 'なかは からっぽ', { size: 54, fill: C.blueUi, ol: '#fffaf0', sw: 14 }) + olText(0, 40, '（くうき）', { size: 40, fill: C.blueUi, ol: '#fffaf0', sw: 12 }), t, c2 + 0.3, BX + 100, 410);
      // 大きくなって外へ
      b += soundWaves(BX + 440, BY, t, { dir: 1, n: 3, r0: 20, step: lerp(22, 40, loud), o: res * 0.9, w: lerp(8, 13, loud) });
      // たいこ
      const tk = c3 + 0.1, hit = ph < 0 ? 0 : ph < 0.1 ? eo(ph / 0.1) : ph < 0.3 ? 1 - (ph - 0.1) / 0.2 : 0;
      b += pop(taiko(hit), t, tk, 1530, 340, { s: 1.25 });
      b += g(text(1530, 392, 'どう＝おなか', { size: 36, w: 900, fill: '#fff' }), { o: prog(t, tk + 1.0, 0.3) });
      b += g(text(1310, 208, 'かわ＝まく', { size: 36, w: 900, fill: '#8a6a1c' }) + `<line x1="1340" y1="234" x2="1392" y2="276" stroke="#8a6a1c" stroke-width="5" stroke-linecap="round"/>`, { o: prog(t, tk + 0.7, 0.3) });
      b += g(text(1790, 236, 'バチ＝', { size: 36, w: 900, fill: CC.muscleDk }) + text(1790, 282, 'きんにく', { size: 36, w: 900, fill: CC.muscleDk }), { o: prog(t, tk + 0.4, 0.3) });
      out += g(b, { o: bO });
      // カメレオン
      out += kidShow('K', t, 1560, 850, { s: 0.75, start: cue(5) - 0.9, n: 0, bubble: false });
      out += talkBubble('K', 1610, 610, 1636, 722, 46);
    }
    return out;
  },
});

// 5. メスは、おなかの耳で聞いている
SCENES.push({
  id: 'ears',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1;
    let out = `<rect width="1920" height="1080" fill="#eaf5ee"/>` + topBadge();
    // A：オスの声が、メスにとどく
    const aO = 1 - prog(t, c1 - 0.5, 0.4);
    if (aO > 0) {
      let a = `<path d="M -40 650 Q 700 612 1960 672" fill="none" stroke="${CC.bark}" stroke-width="60" stroke-linecap="round"/>`;
      a += cicadaSide(470, 498 + Math.sin(t * 28) * 1.2, 5, { flip: true }) + cicadaSide(1420, 506, 5);
      a += soundWaves(660, 492, t, { dir: 1, n: 5, r0: 30, step: 74, w: 10 });
      a += g(badge('オス', { fill: C.accent, size: 46 }), { x: 470, y: 320 }) + g(badge('メス', { fill: C.ochre, size: 46 }), { x: 1420, y: 320 });
      const hk = prog(t, c0 + d0 * 0.45, 0.4), pr = 60 + Math.sin(t * 7) * 6;
      a += g(`<circle r="${pr}" fill="#ffd23a" opacity="0.35"/><circle r="${pr}" fill="none" stroke="#f0b400" stroke-width="9"/>`, { x: 1420 + 2 * 5, y: 506 + 44, o: hk });
      a += pop(badge('きいて いる', { fill: '#b8862a', size: 46 }), t, c0 + d0 * 0.45 + 0.2, 1420, 770);
      out += g(a, { o: aO });
    }
    // B：下から見ると、おなかのつけねに耳
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      const ear = 0.55 + 0.45 * Math.sin(t * 5), S = 4.6, Y = 490, X1 = 620, X2 = 1300;
      let b = pop(badge('したから みた ところ', { fill: C.blueUi, size: 40 }), t, c1, 960, 170);
      b += pop(cicadaUnder(0, 0, S, ear), t, c1 + 0.1, X1, Y) + pop(cicadaUnder(0, 0, S, ear), t, c1 + 0.3, X2, Y);
      b += g(badge('オス', { fill: C.accent, size: 44 }), { x: X1 - 230, y: 300, o: prog(t, c1 + 0.5, 0.3) }) + g(badge('メス', { fill: C.ochre, size: 44 }), { x: X2 + 230, y: 300, o: prog(t, c1 + 0.7, 0.3) });
      const lk = prog(t, c1 + d1 * 0.2, 0.4), ey = Y - 8 * S;
      b += pointer(880, ey, X1 + 46, ey, '#b8862a', lk) + pointer(1040, ey, X2 - 46, ey, '#b8862a', lk);
      b += pop(olText(0, -4, 'みみ', { size: 64, fill: '#b8862a', ol: '#fffaf0', sw: 14 }) + olText(0, 56, '（こまく）', { size: 34, fill: '#b8862a', ol: '#fffaf0', sw: 10 }), t, c1 + d1 * 0.2, 960, ey);
      b += pop(badge('オスにも メスにも ある', { fill: C.accent, size: 44 }), t, c1 + d1 * 0.6, 960, 790);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 6. 土の中で何年も
const SOIL_ROOT = 'M 380 290 C 420 430 640 470 900 500 S 1480 590 1760 800';
const SEASONS = [['はる', '#f7dbe6', '#e58aa8'], ['なつ', '#bfe3f5', '#f0a020'], ['あき', '#f6dcae', '#c8602c'], ['ふゆ', '#e3e9f0', '#7f95a6']];
SCENES.push({
  id: 'soil',
  draw(t) {
    const c0 = cue(0), cp = cue(1), c1 = cue(2), c2 = cue(3), d2 = cueE(3) - c2, c3 = cue(4), d3 = cueE(4) - c3, c4 = cue(5);
    const pk = eio(prog(t, cp - 0.2, 1.6)), pan = lerp(520, 0, pk);   // はじめは地上、そのあと土の中へ
    // 季節がめぐる（土の中で何年も）
    const yr = t > c3 ? (t - c3) / 0.75 : -1, si = yr < 0 ? 1 : Math.floor(yr + 1) % 4, sf = yr < 0 ? 0 : eio(clamp(((yr % 1) - 0.7) / 0.3));
    const skyC = yr < 0 ? SEASONS[1][1] : mix(SEASONS[si][1], SEASONS[(si + 1) % 4][1], sf);
    let w = `<rect x="0" y="-700" width="1920" height="1010" fill="${skyC}"/>`;
    // 木
    w += [[0, -470, 250], [-210, -380, 170], [210, -380, 170]].map(([dx, dy, r], i) => `<circle cx="${380 + dx}" cy="${dy}" r="${r}" fill="${i ? CC.leaf2 : CC.leaf}"/>`).join('');
    w += trunk(380, -520, 300, 170);
    const sing = 1 - pk;
    w += g(cicadaTop(0, 0, 2.8), { x: 380, y: -90, o: clamp(sing * 2) }) + soundWaves(470, -90, t, { dir: 1, n: 3, r0: 26, step: 50, o: sing, w: 9 }) + soundWaves(290, -90, t, { dir: -1, n: 3, r0: 26, step: 50, o: sing, w: 9 });
    w += notesUp(380, -150, t, { n: 4, spread: 300, rise: 180, s: 3, o: sing });
    // 土
    w += `<rect x="0" y="300" width="1920" height="800" fill="${CC.soil}"/>`;
    for (let i = 0; i < 46; i++) w += `<circle cx="${rnd(i, 71) * 1920}" cy="${330 + rnd(i, 72) * 720}" r="${5 + rnd(i, 73) * 6}" fill="${CC.soil2}" opacity="0.6"/>`;
    w += `<rect x="0" y="282" width="1920" height="30" rx="12" fill="#6fba68"/>`;
    for (let i = 0; i < 24; i++) { const x = 30 + i * 82 + rnd(i, 74) * 30; if (Math.abs(x - 380) > 110) w += `<path d="M ${x} 290 l -8 -22 M ${x} 290 l 6 -26 M ${x} 290 l 16 -18" stroke="#6fba68" stroke-width="6" stroke-linecap="round"/>`; }
    // 根
    w += `<path d="M 380 290 C 330 420 240 520 110 610" fill="none" stroke="${CC.root}" stroke-width="34" stroke-linecap="round"/><path d="M 380 290 C 400 480 470 660 580 830" fill="none" stroke="${CC.root}" stroke-width="28" stroke-linecap="round"/>`;
    w += `<path d="${SOIL_ROOT}" fill="none" stroke="${CC.rootDk}" stroke-width="56" stroke-linecap="round"/><path d="${SOIL_ROOT}" fill="none" stroke="${CC.root}" stroke-width="46" stroke-linecap="round"/>`;
    const sapO = prog(t, c2 + d2 * 0.45, 0.5);
    if (sapO > 0) w += `<path d="${SOIL_ROOT}" fill="none" stroke="${CC.sap}" stroke-width="9" stroke-linecap="round" stroke-dasharray="24 26" stroke-dashoffset="${t * 70}" opacity="${sapO}"/>`;
    // 幼虫のへやと幼虫
    const lk = prog(t, c1 - 0.1, 0.5);
    if (lk > 0) {
      let l = `<ellipse cx="1010" cy="655" rx="205" ry="112" fill="${CC.soil3}"/>`;
      // はりのような口（根にさす）
      const nk = eo(prog(t, c2 + 0.2, 0.6)), nx0 = 890, ny0 = 690, nx1 = 872, ny1 = 512;
      if (nk > 0) {
        l += `<line x1="${nx0}" y1="${ny0}" x2="${lerp(nx0, nx1, nk)}" y2="${lerp(ny0, ny1, nk)}" stroke="${CC.larvaDk}" stroke-width="9" stroke-linecap="round"/>`;
        if (sapO > 0) for (let i = 0; i < 3; i++) { const f = (t * 0.9 + i / 3) % 1; l += `<circle cx="${lerp(nx1, nx0, f)}" cy="${lerp(ny1, ny0, f)}" r="7" fill="${CC.sap}" opacity="${sapO * Math.sin(f * Math.PI)}"/>`; }
      }
      l += larva(1020, 660 + Math.sin(t * 2) * 2, 6.2);
      w += g(l, { o: lk });
      w += pop(badge('ようちゅう', { fill: CC.larvaDk, size: 42 }), t, c1 + 0.3, 1340, 672);
    }
    w += g(olText(0, 0, 'きの ね', { size: 46, fill: '#6e4c2c', ol: '#fffaf0', sw: 12 }), { x: 690, y: 386, o: prog(t, c2 + d2 * 0.25, 0.3) });
    w += g(olText(0, 0, 'はりの ような くち', { size: 40, fill: CC.larvaDk, ol: '#fffaf0', sw: 12 }), { x: 600, y: 640, o: prog(t, c2 + 0.5, 0.3) }) + pointer(770, 630, 872, 600, CC.larvaDk, prog(t, c2 + 0.6, 0.3));
    w += g(olText(0, 0, 'ねが すった みず', { size: 40, fill: '#2f6fa8', ol: '#fffaf0', sw: 12 }), { x: 1590, y: 556, o: sapO });
    let out = g(w, { y: pan });
    out += topBadge();
    out += pop(card(620, 150) + text(0, 2, 'どうして なつ？', { size: 64, w: 900, fill: '#e0662c' }), t, c0 + 0.3, 1160, 400, { end: cp });
    // 何年も
    if (yr >= 0) {
      const [nm, , col] = SEASONS[(si + (sf > 0.5 ? 1 : 0)) % 4];
      out += pop(`<circle r="62" fill="#fffaf0" stroke="${col}" stroke-width="10"/>` + text(0, 3, nm, { size: 40, w: 900, fill: col }), t, c3, 700, 160);
      out += pop(`<path d="M -46 -30 A 60 60 0 1 1 -56 16" fill="none" stroke="${C.muted}" stroke-width="8" stroke-linecap="round" transform="rotate(${(t - c3) * 200})"/>`, t, c3, 700, 160, { s: 1.5 });
    }
    out += pop(card(900, 200) + text(0, -46, 'つちの なかに いる ながさ', { size: 38, w: 900, fill: C.muted }) + text(0, 30, '2ねん 〜 じゅうすうねん', { size: 66, w: 900, fill: CC.larvaDk }), t, c3 + d3 * 0.45, 1330, 160);
    out += pop(badge('「7ねん」と きまって いない', { fill: C.redUi, size: 40 }), t, c4 + 0.4, 1330, 400);
    return out;
  },
});

// 7. 夏の夜に出てきて、おとなは1か月ほど
SCENES.push({
  id: 'emerge', night: true,
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c4 = cue(4);
    const dk = eio(prog(t, c4 + 0.2, 1.8));   // 朝になるぐあい
    const GY = 790, TX = 1290;
    let out = `<linearGradient id="emsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix('#141d36', '#3f93dc', dk)}"/><stop offset="1" stop-color="${mix('#3a4a74', '#d6edfa', dk)}"/></linearGradient><rect width="1920" height="1080" fill="url(#emsky)"/>`;
    out += g(stars(31, 60), { o: 1 - dk });
    out += g(`<circle cx="1700" cy="150" r="130" fill="#fff6c8" opacity="0.16" filter="url(#glow)"/><circle cx="1700" cy="150" r="56" fill="#fff3c0"/><circle cx="1680" cy="134" r="11" fill="#ead99a"/><circle cx="1718" cy="170" r="8" fill="#ead99a"/>`, { o: 1 - dk });
    if (dk > 0) out += g(sunDisc(1700, lerp(420, 170, dk), 64, 0), { o: dk });
    // 木と地面
    const dim = 1 - dk, leaf = mix(CC.leaf, '#16263a', 0.55 * dim), bark = mix(CC.bark, '#1a1e2c', 0.4 * dim), bark2 = mix(CC.bark2, '#1a1e2c', 0.4 * dim);
    out += trunk(TX, -20, GY + 10, 190, bark, bark2);
    out += [[0, -90, 230], [-200, -50, 160], [200, -50, 160]].map(([dx, dy, r]) => `<circle cx="${TX + dx}" cy="${dy}" r="${r}" fill="${leaf}"/>`).join('');
    out += `<rect x="0" y="${GY}" width="1920" height="300" fill="${mix(CC.soil, '#1a1e2c', 0.45 * dim)}"/><rect x="0" y="${GY - 10}" width="1920" height="26" rx="10" fill="${mix('#6fba68', '#16263a', 0.5 * dim)}"/>`;
    const HX = 620;
    out += `<ellipse cx="${HX}" cy="${GY + 6}" rx="46" ry="15" fill="#2a1e14"/>`;
    // 幼虫：あなから出る → 木まで歩く → のぼる
    const S = 3.2, PY = 470;   // PY：からをぬぐ高さ
    const tA = c0 + d0 * 0.25, tB = tA + 0.9, tC = c0 + d0 * 0.68, tD = cueE(0) + 0.5;
    const shellC = mix(CC.larva, CC.shell, prog(t, c1, 0.6));
    const eT = c1 + d1 * 0.2;
    if (t < tB) {
      const k = eo(prog(t, tA, 0.9));
      out += `<clipPath id="emhole"><rect x="0" y="0" width="1920" height="${GY + 4}"/></clipPath><g clip-path="url(#emhole)">${larva(HX + 20 * k, lerp(GY + 60, GY - 30, k), S, { flip: true, r: lerp(-70, 0, k), walk: t * 14 })}</g>`;
    } else if (t < tC) {
      const k = eio(prog(t, tB, tC - tB)), x = lerp(HX + 20, TX - 150, k);
      out += larva(x, GY - 30 - Math.abs(Math.sin(t * 9)) * 4, S, { flip: true, walk: t * 14 });
    } else {
      const k = eio(prog(t, tC, tD - tC));
      // おとなが出てくる（頭が上。からの背中から上へぬけ出る）。からより先に描いて、からの後ろから出てくるように見せる
      const ek = eio(prog(t, eT, 2.2));
      if (t > eT) {
        const col = mix('#e3ecc9', CC.body, eio(prog(t, eT + 2.4, Math.max(1, c4 - eT - 2.4))));
        const ay = lerp(PY - 6, 285, ek), sing = dk;
        out += cicadaTop(TX, ay + Math.sin(t * 30) * 1.2 * sing, S, { col, wk: eio(prog(t, eT + 1.2, 1.8)), o: prog(t, eT, 0.3) });
        out += soundWaves(TX + 105, ay, t, { dir: 1, n: 3, r0: 28, step: 56, o: sing, w: 10 }) + soundWaves(TX - 105, ay, t, { dir: -1, n: 3, r0: 28, step: 56, o: sing, w: 10 });
        out += notesUp(TX, ay - 40, t, { n: 4, spread: 320, rise: 170, s: 3, o: sing });
      }
      // 木のみきへうつって、頭を上にしてのぼる（右向きの絵を -90 度まわすと頭が上）
      const x = lerp(TX - 150, TX, clamp(k * 4)), y = lerp(GY - 30, PY, clamp((k - 0.12) / 0.88)), r = lerp(0, -90, clamp(k * 5));
      out += larva(x + Math.sin(t * 9) * 2 * (k < 1 ? 1 : 0), y, S, { flip: true, r, c: shellC, walk: k < 1 ? t * 14 : 0 });
      // からの背中のわれめ
      if (t > c1) out += `<line x1="${TX - 9 * S}" y1="${PY - 17 * S}" x2="${TX - 9 * S}" y2="${PY + 1 * S}" stroke="#4a3320" stroke-width="5" stroke-linecap="round" opacity="${prog(t, c1 + 0.1, 0.3)}"/>`;
    }
    out += pop(badge('あなから でる', { fill: 'rgba(255,250,240,0.92)', color: C.ink, size: 38 }), t, tA + 0.3, HX - 60, 690, { end: tC });
    out += pop(badge('きに のぼる', { fill: 'rgba(255,250,240,0.92)', color: C.ink, size: 40 }), t, tC + 0.5, 1610, 640, { end: c1 + 0.2 });
    out += pop(badge('からを ぬぐ', { fill: 'rgba(255,250,240,0.92)', color: C.ink, size: 40 }), t, c1 + 0.3, 1610, 470, { end: c4 + 0.3 });
    out += pop(badge('おとなの セミ', { fill: C.accent, size: 42 }), t, eT + 2.0, 1620, 300, { end: c4 + 0.2 });
    out += pop(badge('ぬけがら', { fill: '#8a6a3a', size: 38 }), t, c4 + 0.6, 1590, 480);
    // 土の中の長さと、地上の長さ
    const bk = c2 + 0.2;
    if (t > bk) {
      const grow = eo(prog(t, bk + 0.4, 1.2)), g2 = eo(prog(t, bk + 1.7, 0.5));
      let c = card(1000, 300);
      c += text(-140, -92, 'つちの なか（ようちゅう）', { size: 36, w: 900, fill: CC.larvaDk });
      c += `<rect x="-450" y="-52" width="${620 * grow}" height="80" rx="14" fill="${CC.soil}"/>`;
      for (let i = 0; i < 6; i++) if (grow > (i + 0.6) / 6) c += larva(-394 + i * 100, -10, 1.6, { c: '#e0bd8a' });
      c += g(text(-180, 84, '2ねん 〜 じゅうすうねん', { size: 44, w: 900, fill: CC.larvaDk }), { o: prog(t, bk + 1.0, 0.4) });
      c += g(`<rect x="178" y="-52" width="${84 * g2}" height="80" rx="14" fill="${C.yellow}"/>` + cicadaTop(220, -14, 1.15) + text(330, -92, 'ちじょう', { size: 36, w: 900, fill: '#a86a10' }) + text(340, 66, 'すうしゅうかん〜', { size: 32, w: 900, fill: '#a86a10' }) + text(340, 108, '1かげつ ほど', { size: 40, w: 900, fill: '#a86a10' }), { o: prog(t, bk + 1.7, 0.3) });
      out += g(c, { x: 570, y: 322, o: prog(t, bk, 0.4), s: lerp(0.94, 1, eo(prog(t, bk, 0.4))) });
    }
    out += topBadge(dk < 0.5);
    out += kidShow('B', t, 300, 850, { s: 0.5, start: cue(3) - 0.9, n: 0, look: [5, -6] });
    return out;
  },
});

// 8. 鳴きはじめは、種類でちがう（東京の記録）。春に鳴くセミもいる
const SPECIES = [['ニイニイゼミ', 3, '#7d70b8', 'clear'], ['ヒグラシ', 11, '#4f86b0', 'clear'], ['ミンミンゼミ', 16, '#2e8a63', 'clear'], ['アブラゼミ', 19, '#9a6a3a', 'brown'], ['ツクツクボウシ', 28, '#d4762a', 'clear']];
const pineTree = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-7" y="0" width="14" height="70" fill="${CC.bark}"/><path d="M0 -70l-36 36h16l-28 28h20l-26 26h108l-26 -26h20l-28 -28h16Z" fill="#3f7a57"/></g>`;
SCENES.push({
  id: 'season',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    const up = eio(prog(t, c2 - 0.5, 0.8));
    out += pop(text(0, 0, 'なきはじめは、しゅるいで ちがう', { size: 60, w: 900 }), t, 0.3, 1000, 150, { end: c1 + 0.2 });
    out += pop(badge('とうきょうの きろく', { fill: C.blueUi, size: 40 }) + text(330, 2, '7がつ', { size: 60, w: 900, anchor: 'start' }), t, c1 + 0.3, 880, 150, { end: c2 - 0.4 });
    // 7月の線
    const X = d => -700 + (d - 1) * (1400 / 30);
    let tl = '';
    const ax = eo(prog(t, c1 - 0.1, 0.8));
    if (ax > 0) {
      tl += `<line x1="-700" y1="0" x2="${lerp(-700, 700, ax)}" y2="0" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>`;
      [1, 10, 20, 31].forEach(d => { if (ax > (d - 1) / 30 - 0.01) tl += `<line x1="${X(d)}" y1="-18" x2="${X(d)}" y2="18" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`; });
      tl += g(text(X(1) - 40, 56, '7/1', { size: 32, w: 900, fill: C.muted }) + text(X(31) + 40, 56, '7/31', { size: 32, w: 900, fill: C.muted }), { o: ax });
    }
    const hl = [c1 + d1 * 0.3, -1, -1, -1, c1 + d1 * 0.62];   // ナレーションで名前が出るとき
    SPECIES.forEach(([nm, d, col, wing], i) => {
      const sd = i % 2 ? 1 : -1, x = X(d), st = c0 + d0 * 0.25 + i * 0.45;
      const on = hl[i] > 0 ? win(t, hl[i], hl[i] + 2.2, 0.3) : 0;
      const cy = sd < 0 ? -120 : 85;
      let m = cicadaTop(0, cy, 1.7, { wing });
      if (on > 0) m += `<circle cx="0" cy="${cy + 20}" r="${84 + Math.sin(t * 7) * 4}" fill="none" stroke="${col}" stroke-width="9" opacity="${on}"/>`;
      m += g(badge(nm, { fill: col, size: 32, pad: 26 }), { y: sd < 0 ? -218 : 224 });
      tl += pop(m, t, st, x, 0);
      const dk2 = prog(t, c1 + 0.3 + i * 0.25, 0.3);
      tl += g(`<circle cx="${x}" cy="0" r="17" fill="#fffaf0" stroke="${col}" stroke-width="9"/>` + text(x + sd * -4, sd * -40, `7/${d}`, { size: 34, w: 900, fill: col }), { o: dk2 });
    });
    out += g(tl, { x: 960, y: lerp(520, 322, up), s: lerp(1, 0.8, up) });
    // 春に鳴くセミ（ハルゼミ）
    const sp = c2 + 0.1;
    if (t > sp - 0.1) {
      let c = card(1280, 250, { fill: '#eef5e2' });
      c += pineTree(-520, -30, 1.25) + pineTree(-400, -10, 1.0) + pineTree(-290, -34, 1.3);
      c += cicadaTop(-290, 24, 0.9) + soundWaves(-262, 22, t, { dir: 1, n: 2, r0: 12, step: 20, w: 6 });
      c += text(-170, -46, 'ハルゼミ', { size: 62, w: 900, anchor: 'start', fill: '#2f6a47' });
      c += text(-170, 48, 'まつの はやしで なく', { size: 42, w: 900, anchor: 'start' });
      c += g(badge('はる 4がつ〜6がつ', { fill: '#d96a90', size: 44 }), { x: 370, y: -46 });
      out += pop(c, t, sp, 960, 694);
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-432, 2, 'つちの なかで くらして いた', { size: 60, w: 900, anchor: 'start' }) + g(GUESS_ICON[2].replace('？', ''), { x: 510, y: 0, s: 1.05 }) + larva(514, 14, 1.5), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['つちの なかで なんねんも', '#8a6a3a'], ['なつに でて きて おとなに', C.accent], ['ちじょうは 1かげつ ほど', '#c8602c']], t, 960, 660, { start: 2.4, step: 1.1, size: 36, gap: 28 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const sunIc = `<circle cx="-22" cy="-6" r="26" fill="${C.yellow}"/><circle cx="26" cy="12" r="26" fill="#f08a3c"/>` + note(-4, -44, 2.2);
      const shellIc = larva(0, 0, 2.3, { c: CC.shell });
      const items = [
        [sunIc, 'あさと ゆうがた、こえを ききくらべる', C.ink],
        [shellIc, 'ぬけがらと、でて きた あなを さがす', C.ink],
        [warnIcon(0.82), 'あつい ひは おとなと。ぼうしと みずも', C.red],
        [warnIcon(0.82), 'きには のぼらない。みえる たかさだけ', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // ぬけがらと、土のあな
      let p = card(420, 330) + `<clipPath id="lkc"><rect x="-210" y="-165" width="420" height="330" rx="28"/></clipPath><g clip-path="url(#lkc)"><rect x="-210" y="-165" width="420" height="330" fill="#dff0f7"/>${trunk(-70, -170, 110, 120)}<rect x="-210" y="104" width="420" height="70" fill="${CC.soil}"/><rect x="-210" y="96" width="420" height="16" fill="#6fba68"/></g>`;
      p += larva(-70, -40, 2.4, { r: 90, c: CC.shell }) + `<ellipse cx="60" cy="126" rx="26" ry="9" fill="#3a2a1c"/>`;
      p += text(96, -50, 'ぬけがら', { size: 32, w: 900, fill: '#8a6a3a' }) + `<line x1="28" y1="-48" x2="-30" y2="-44" stroke="#8a6a3a" stroke-width="5" stroke-linecap="round"/>`;
      p += text(140, 70, 'あな', { size: 32, w: 900, fill: '#5a4028' }) + `<line x1="124" y1="88" x2="84" y2="118" stroke="#5a4028" stroke-width="5" stroke-linecap="round"/>`;
      b += pop(p, t, cue(2) + 0.3, 1600, 330);
      b += kidShow('K', t, 1690, 820, { s: 0.8, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「セミ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

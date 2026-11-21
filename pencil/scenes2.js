// みのまわり図鑑 動画「えんぴつは、どうして けしゴムで きえるの？」（えんぴつ）
// 出どころ：everyday-trivia trivia/pencil-basics.md, vinyl-eraser.md, crayon-resist-eraser.md

// ---------- えんぴつの道具 ----------
const PC = {
  paper: '#f7efd9', fiber: '#e3d6b6', fiberDk: '#cdbd96', gra: '#3d3d42', graLt: '#77777f', pencil: '#5d5d64',
  wood: '#ecc590', woodDk: '#c99b5e', paint: '#3f8f6a', paintLt: '#5aa884', paintDk: '#2f6f52',
  erSh: '#d9d9df', sleeve: '#2f7de1', sleeveDk: '#1f5fb8', crumb: '#c4c0b6', crumbDk: '#98948a',
  red: '#e2543e', redDk: '#b83a28', redLt: '#f09a8a', desk: '#ead9b6', deskDk: '#d9c59a',
  bread: '#efc37e', breadDk: '#b9803a', rubber: '#9a6a44', rubberDk: '#6f4a2c', old: '#f3e6c4',
};
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
const titleAt = (str, t, st, en = 1e9, col = C.ink, x = 960, y = 170, size = 46) => pop(badge(str, { fill: col, size }), t, st, x, y, { end: en });

// えんぴつ（先が右。先の点が 0,0。L: 長さ、cut: 中の芯を見せる 0〜1）
function pencilPic(L = 600, { cut = 0, col = PC.paint, lt = PC.paintLt, dk = PC.paintDk, lead = PC.gra } = {}) {
  let s = `<rect x="${-L}" y="-35" width="${L - 108}" height="70" fill="${col}"/><rect x="${-L}" y="-35" width="${L - 108}" height="22" fill="${lt}"/><rect x="${-L}" y="13" width="${L - 108}" height="22" fill="${dk}"/>`;
  s += `<rect x="${-L - 8}" y="-35" width="18" height="70" rx="5" fill="${dk}"/>`;
  s += `<path d="M -110 -35 L -34 -11 L -34 11 L -110 35 Z" fill="${PC.wood}"/><path d="M -110 -35 L -34 -11 L -34 -4 L -110 -13 Z" fill="#f5d9ae"/><path d="M -34 -11 L 0 0 L -34 11 Z" fill="${lead}"/>`;
  if (cut > 0) s += g(`<rect x="${-L + 150}" y="-35" width="${L - 258}" height="70" fill="${PC.wood}"/><rect x="${-L + 150}" y="-35" width="${L - 258}" height="6" fill="${PC.woodDk}"/><rect x="${-L + 150}" y="29" width="${L - 258}" height="6" fill="${PC.woodDk}"/>` +
    `<path d="M ${-L + 150} -11 L -34 -11 L -34 11 L ${-L + 150} 11 Z" fill="${lead}"/>`, { o: cut });
  return s;
}
// 消しゴム（まん中が 0,0。右がわに 紙のケース）
function eraserPic(w = 220, h = 110, { dirty = 0 } = {}) {
  let s = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h * 0.14}" fill="#fff" stroke="${PC.erSh}" stroke-width="4"/>`;
  if (dirty > 0) s += `<path d="M ${-w / 2 + 2} ${-h * 0.2} Q ${-w / 2 + w * 0.16} 0 ${-w / 2 + 2} ${h * 0.34} Z" fill="${PC.gra}" opacity="${0.75 * dirty}"/><rect x="${-w / 2 + 2}" y="${-h / 2 + h * 0.3}" width="${w * 0.07}" height="${h * 0.56}" rx="${w * 0.03}" fill="${PC.gra}" opacity="${0.75 * dirty}"/>`;
  s += `<path d="M ${-w * 0.14} ${-h / 2 - 3} L ${w / 2 + 3} ${-h / 2 - 3} L ${w / 2 + 3} ${h / 2 + 3} L ${-w * 0.14} ${h / 2 + 3} Z" fill="${PC.sleeve}"/><rect x="${-w * 0.14}" y="${-h * 0.12}" width="${w * 0.64 + 3}" height="${h * 0.24}" fill="#fff"/>` +
    `<rect x="${-w * 0.14}" y="${h / 2 - h * 0.12}" width="${w * 0.64 + 3}" height="${h * 0.12 + 3}" fill="${PC.sleeveDk}"/>`;
  return s;
}
// 消しかす（くるっと まるまった 消しゴムのくず）。dots: 中の黒いつぶの数
function crumbPic(x, y, s = 1, rot = 0, dots = 3, o = 1, col = PC.crumb) {
  if (o <= 0.01) return '';
  let b = `<path d="M -52 0 C -54 -20 -20 -22 0 -16 C 24 -24 54 -16 52 2 C 54 18 22 20 0 15 C -22 22 -50 18 -52 0 Z" fill="${col}" stroke="${PC.crumbDk}" stroke-width="4"/><path d="M -34 -4 Q -10 8 14 -4 Q 30 -10 38 2" fill="none" stroke="${PC.crumbDk}" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>`;
  for (let i = 0; i < dots; i++) b += `<ellipse cx="${-30 + i * (60 / Math.max(1, dots - 1 || 1)) + (dots === 1 ? 30 : 0)}" cy="${(i % 2 ? 6 : -5)}" rx="8" ry="5.5" fill="${PC.gra}"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity="${clamp(o)}">${b}</g>`;
}
// 黒鉛のつぶ
const gp = (x, y, r = 9, a = 0, o = 1, col = PC.gra) => o <= 0.01 ? '' : `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.66}" fill="${col}" transform="rotate(${a} ${x} ${y})" opacity="${clamp(o)}"/>`;
// 紙を横から大きく見た絵（せんいが からまっている）
const _fm = {};
function fiberMat(x0, x1, y, depth = 170, seed = 1) {
  const key = [x0, x1, y, depth, seed].join(','); if (_fm[key]) return _fm[key];
  const id = 'fm' + seed + '_' + x0;
  let s = `<clipPath id="${id}"><rect x="${x0}" y="${y - 16}" width="${x1 - x0}" height="${depth + 16}" rx="12"/></clipPath><g clip-path="url(#${id})"><rect x="${x0}" y="${y + 8}" width="${x1 - x0}" height="${depth}" fill="${PC.paper}"/>`;
  const n = Math.round((x1 - x0) / 8);
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd(i, seed) * (x1 - x0), yy = y + 6 + Math.pow(rnd(i, seed + 1), 0.8) * (depth - 16), len = 50 + rnd(i, seed + 2) * 70, a = (rnd(i, seed + 3) - 0.5) * 0.9;
    const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2, b = (rnd(i, seed + 4) - 0.5) * 26;
    s += `<path d="M ${(x - dx).toFixed(1)} ${(yy - dy).toFixed(1)} Q ${x.toFixed(1)} ${(yy + b).toFixed(1)} ${(x + dx).toFixed(1)} ${(yy + dy).toFixed(1)}" fill="none" stroke="${i % 3 ? PC.fiber : PC.fiberDk}" stroke-width="${(6 + rnd(i, seed + 5) * 3).toFixed(1)}" stroke-linecap="round"/>`;
  }
  return _fm[key] = s + '</g>';
}
const PY = 640;   // 紙の表面の高さ（大きくした絵）
// ノート（わくの中に 線）
function notebook(x, y, w, h, { lines = 5, fill = '#fff' } = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${fill}" filter="url(#shadow)"/>`;
  for (let i = 1; i <= lines; i++) s += `<line x1="${x + 30}" y1="${y + i * h / (lines + 1)}" x2="${x + w - 30}" y2="${y + i * h / (lines + 1)}" stroke="#cfe0ee" stroke-width="4"/>`;
  return s + `<line x1="${x + 90}" y1="${y + 14}" x2="${x + 90}" y2="${y + h - 14}" stroke="#f2c4c0" stroke-width="4"/>`;
}
const deskBg = () => `<rect width="1920" height="1080" fill="${PC.desk}"/>` + [0, 1, 2, 3].map(i => `<path d="M 0 ${150 + i * 260} Q 960 ${120 + i * 260 + (i % 2 ? 40 : -30)} 1920 ${160 + i * 260}" fill="none" stroke="${PC.deskDk}" stroke-width="5" opacity="0.5"/>`).join('');

// 1. つかみ：えんぴつの字を 消しゴムで ごしごし → きえた
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c2 = cue(2), c3 = cue(3);
    let out = deskBg() + notebook(220, 170, 1100, 620);
    const LX = [440, 660, 880, 1100], LYc = 440, S = [c0 + 0.9, c0 + 2.0, c2 + 0.3, c2 + 1.4];
    'えんぴつ'.split('').forEach((ch, i) => { out += g(text(0, 0, ch, { size: 210, w: 900, fill: PC.pencil, ls: 0 }), { x: LX[i], y: LYc, o: 1 - prog(t, S[i] + 0.1, 0.7) }); });
    // 消しかす
    LX.forEach((x, i) => { for (let k = 0; k < 3; k++) out += crumbPic(x - 60 + k * 62 + rnd(i, k) * 20, 596 + rnd(i, k + 5) * 34, 0.62, rnd(i, k + 9) * 80 - 40, 2, prog(t, S[i] + 0.3 + k * 0.16, 0.2)); });
    out += g(pencilPic(560), { x: 900, y: 716, r: -3 });
    // 消しゴム
    let ex = LX[0]; for (let i = 1; i < 4; i++) ex += (LX[i] - LX[i - 1]) * eio(prog(t, S[i] - 0.4, 0.4));
    const rub = S.some(s => t > s && t < s + 0.9) ? 1 : 0, inK = eo(prog(t, c0 + 0.2, 0.6)), outK = eio(prog(t, S[3] + 1.0, 0.6));
    const ebx = lerp(lerp(1500, ex, inK), 1190, outK) + rub * Math.sin(t * 16) * 56, eby = lerp(lerp(120, LYc, inK), 668, outK) + rub * Math.cos(t * 16) * 16;
    out += g(g(eraserPic(250, 124), { r: -24 }), { x: ebx, y: eby, o: prog(t, c0 + 0.2, 0.3) });
    out += g(text(0, 0, 'ごしごし', { size: 60, w: 900, fill: C.ochre }), { x: 760 + Math.sin(t * 16) * 5, y: 244, o: win(t, c0 + 1.0, c0 + 3.0, 0.2) + win(t, c2 + 0.4, c2 + 2.2, 0.2), r: -5 });
    out += kidShow('S', t, 1620, 850, { s: 0.66, start: 0.3, n: 0, side: 'left', size: 50 });
    out += g(text(0, 0, '？', { size: 200, w: 900, fill: C.ochre, extra: `stroke="#fff" stroke-width="18" paint-order="stroke"` }), { x: 770, y: 430, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">えんぴつは、どうして</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${PC.sleeve}">けしゴム</tspan>で きえるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(pencilPic(420), { x: 60, y: 0, r: -8 }) + g(eraserPic(210, 104), { x: 290, y: 4, r: 12 }), t, t0 + 1.8, 860, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'えんぴつの じが、けしゴムで きえるのは どうして？', { size: 56, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'けしゴムが、くろい いろを、しろく ぬりつぶすから'], ['②', 'けしゴムが、かみを、うすく けずりとるから'], ['③', 'くろい つぶが、かみから、けしゴムに、くっつくから']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 42)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(g(eraserPic(230, 114), { r: -16 }) + text(96, -110, '？', { size: 110, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1670, 360);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 書けるしくみ：芯（黒鉛＋ねん土）→ 紙にこすれて くだける → つぶが せんいに くっつく
SCENES.push({
  id: 'write',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A. えんぴつの中
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const TX = 1560, TY = 410, SC = 1.5;
      let a = g(pencilPic(820, { cut: prog(t, c0 + 0.6, 0.6) }), { x: TX, y: TY, s: SC });
      a += tag(TX - 420 * SC, TY, 1060, 250, 'しん', prog(t, c0 + 1.2, 0.3), { col: PC.gra, size: 50 });
      a += chipsRow([['こくえん（くろい こな）', PC.gra], ['＋ ねんど', PC.woodDk], ['→ やいて かためる', C.redUi]], t, 960, 620, { start: c0 + 2.6, step: 1.5, size: 42, gap: 26 });
      a += tag(TX - 560 * SC, TY - 26 * SC, 560, 250, 'まわりの き', prog(t, c1 + 0.4, 0.3), { col: PC.woodDk, size: 46 });
      a += chipsRow([['しんを まもる', PC.woodDk], ['てを くろく しない', PC.woodDk]], t, 960, 730, { start: c1 + 1.6, step: 1.6, size: 42, gap: 26 });
      out += g(a, { o: aO });
    }
    // B. 大きくして見る：芯がくだけて、つぶが せんいに くっつく
    const bO = prog(t, c2 - 0.2, 0.4);
    if (bO > 0) {
      const X0 = 80, X1 = 1560, PS = 2.6, tx = lerp(560, 1120, prog(t, c2 + 0.5, cueE(3) - c2 - 0.5));
      let b = fiberMat(X0, X1, PY, 170, 1);
      // 紙についた つぶ
      for (let i = 0; i < 26; i++) { const x = 570 + i * 22 + (rnd(i, 2) - 0.5) * 10; if (x < tx - 8) b += gp(x, PY + 2 + rnd(i, 3) * 18, 11 + rnd(i, 4) * 5, rnd(i, 5) * 180, clamp((tx - x) / 20)); }
      // くだけて とぶ つぶ
      if (t > c2 + 0.5 && t < cueE(3)) for (let i = 0; i < 5; i++) { const p = (t * 1.7 + i / 5) % 1; b += gp(tx - 10 - p * 80, PY - 6 - Math.sin(p * Math.PI) * 46, 9, p * 300, 1 - p); }
      b += g(pencilPic(900), { x: tx, y: PY - 2 + Math.sin(t * 22) * 1.5, s: PS, r: 125 });
      // ふつうの大きさの絵（左上）
      const k = prog(t, c2 + 0.5, cueE(3) - c2 - 0.5);
      b += notebook(110, 250, 410, 230, { lines: 3 }) + `<line x1="230" y1="382" x2="${230 + 190 * k}" y2="382" stroke="${PC.pencil}" stroke-width="9" stroke-linecap="round"/>` + g(pencilPic(190), { x: 232 + 190 * k, y: 380, r: 125, s: 0.9 });
      b += g(lensIcon(), { x: 222 + 190 * k, y: 394, s: 0.42 });
      b += g(text(0, 0, 'おおきく すると…', { size: 34, w: 900, fill: C.blueUi }), { x: 315, y: 524 });
      b += tag(300, PY + 96, 300, PY - 40, 'かみの せんい', prog(t, c2 + 1.6, 0.3), { col: PC.woodDk, size: 38 });
      b += tag(660, PY + 8, 760, 500, 'こくえんの つぶ', clamp((tx - 1010) / 40), { col: PC.gra, size: 40 });
      out += g(b, { o: bO });
      out += titleAt('しんが、すこしずつ くだける', t, c2 + 0.3, c3, PC.gra, 430, 180, 40) + titleAt('つぶが、かみの せんいに くっつく', t, c3 + 0.2, 1e9, PC.gra, 430, 180, 38);
    }
    out += kidShow('B', t, 1740, 850, { s: 0.48, start: c4 - 0.9, n: 0, side: 'left', size: 42 });
    return out;
  },
});

// 4. 消えるしくみ：消しゴムのほうに くっつきやすい → 表面にくっつく → 消しかすに つつまれる → とりのぞかれる → 新しい面
const ERP = { n: 24, x0: 520, dx: 40, w: 460, h: 330, cr: [1400, 1270, 1140, 1010, 880, 750] };
// 横から見た 大きな消しゴム（下の面が y）。dirty: 下の面の黒さ
function eraserBig(x, y, o = 1) {
  if (o <= 0.01) return '';
  const { w, h } = ERP;
  return g(`<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="34" fill="#fff" stroke="${PC.erSh}" stroke-width="6"/><path d="M ${-w / 2 - 4} ${-h - 4} L ${w / 2 + 4} ${-h - 4} L ${w / 2 + 4} ${-h * 0.42} L ${-w / 2 - 4} ${-h * 0.42} Z" fill="${PC.sleeve}"/><rect x="${-w / 2 - 4}" y="${-h * 0.8}" width="${w + 8}" height="${h * 0.16}" fill="#fff"/><rect x="${-w / 2 - 4}" y="${-h * 0.5}" width="${w + 8}" height="${h * 0.08}" fill="${PC.sleeveDk}"/>`, { x, y, o });
}
SCENES.push({
  id: 'erase',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), c5 = cue(5);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge() + fiberMat(80, 1840, PY, 170, 2);
    // 消しゴムの動き：おりてくる → 右へ こする → 左へ もどりながら 消しかす → 上へ はなれる
    const sw1 = eio(prog(t, c2 + 0.4, cueE(2) + 0.5 - c2 - 0.4)), sw2 = eio(prog(t, c3 + 0.3, cueE(3) + 0.9 - c3 - 0.3));
    const rubbing = (t > c2 + 0.4 && sw1 < 1) || (t > c3 + 0.3 && sw2 < 1) ? 1 : 0;
    const sx = lerp(lerp(260, 1500, sw1), 500, sw2), sxMax = t > c3 ? 1500 : sx, ex = sx + rubbing * Math.sin(t * 11) * 34;
    const lift = eio(prog(t, c4 + 0.3, 1.0)), ey = lerp(-80, PY - 6, eo(prog(t, c0 + 0.4, 1.0))) - lift * 760;
    // 黒鉛のつぶ
    let parts = '';
    for (let i = 0; i < ERP.n; i++) {
      const x0 = ERP.x0 + i * ERP.dx, y0 = PY + 4 + rnd(i, 3) * 18, rel = ((i * 137) % 380) - 190, j = i % 6, cx = ERP.cr[j];
      const u1 = clamp((sxMax - (x0 - 150)) / 70);            // 紙 → 消しゴムの下の面
      const u2 = t > c3 + 0.3 ? clamp((cx + 70 - (sx + ERP.w / 2)) / 60) : 0;   // 消しゴム → 消しかす
      if (u2 >= 1) continue;   // 消しかすの中（消しかすの絵にかいてある）
      const px = lerp(lerp(x0, ex + rel, eo(u1)), cx + ((i * 53) % 60) - 30, u2), py = lerp(lerp(y0, ey - 12, eo(u1)), PY - 10, u2);
      parts += gp(px, py, 11 + rnd(i, 4) * 4, rnd(i, 5) * 180);
    }
    // 消しかす
    const sweepOff = eio(prog(t, c4 + 2.6, 1.6));
    let crumbs = '';
    ERP.cr.forEach((cx, j) => { const u = t > c3 + 0.3 ? clamp((cx + 70 - (sx + ERP.w / 2)) / 60) : 0; if (u > 0) crumbs += crumbPic(cx + sweepOff * (1900 - cx + 200) * (1 + j * 0.08), PY - 10 - Math.sin(sweepOff * Math.PI) * 60, 1.15 * back(u), rnd(j, 7) * 40 - 20 + sweepOff * 300, u >= 1 ? 5 : 0, 1 - prog(sweepOff, 0.75, 0.25)); });
    out += crumbs + eraserBig(ex, ey, 1 - prog(lift, 0.7, 0.3)) + g(parts, { o: 1 - prog(lift, 0.7, 0.3) * (t > c4 ? 1 : 0) });
    // ことば
    out += titleAt('けしゴムで こすると…？', t, c0 + 0.3, c1, C.ink) + g(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre }), { x: 1000, y: 400, o: win(t, c0 + 1.2, c1 - 0.1, 0.3) });
    out += tag(700, PY + 12, 860, 500, 'こくえんの つぶ', win(t, c0 + 1.6, c1 + 0.3, 0.3), { col: PC.gra, size: 40 });
    // くっつきやすさ くらべ
    const kO = win(t, c1 + 0.3, c2 - 0.1, 0.35);
    if (kO > 0) {
      let k = card(900, 400) + ctext(0, -140, 'どっちに くっつきやすい？', { size: 40, w: 900, fill: C.muted });
      k += `<rect x="-380" y="-70" width="250" height="150" rx="24" fill="${PC.paper}" stroke="${PC.fiberDk}" stroke-width="6"/>` + ctext(-255, 6, 'かみ', { size: 54, w: 900, fill: PC.woodDk });
      k += `<rect x="130" y="-70" width="250" height="150" rx="24" fill="#fff" stroke="${PC.sleeve}" stroke-width="8"/>` + ctext(255, 6, 'けしゴム', { size: 50, w: 900, fill: PC.sleeveDk });
      const pk = eio(prog(t, c1 + 2.4, 1.2)), px = lerp(0, 96, pk);
      k += arrow2(-36, 5, -100, 5, PC.fiberDk, 7) + arrow2(40, 5, 112, 5, PC.sleeve, 18) + gp(px, 5, 22, 20);
      k += pop(badge('けしゴムの ほうに くっつきやすい', { fill: PC.sleeveDk, size: 40 }), t, c1 + 3.4, 0, 150);
      out += g(k, { x: 1280, y: 370, o: kO });
    }
    out += titleAt('つぶが、けしゴムの ひょうめんに くっつく', t, c2 + 0.3, c3, PC.sleeveDk) + titleAt('けしかすに つつみこまれる', t, c3 + 0.2, c4, PC.crumbDk);
    out += tag(ERP.cr[1], PY - 30, ERP.cr[1] + 60, 470, 'けしかす', win(t, c3 + 2.6, c4 + 2.4, 0.3), { col: PC.crumbDk, size: 44 });
    out += titleAt('かみからも、けしゴムからも、とりのぞかれる', t, c4 + 0.3, c5 - 0.1, C.accent);
    // 黒くなった面 → 消しかすになって はがれる → まだ黒くない面
    const fO = prog(t, c5 + 0.2, 0.4);
    if (fO > 0) {
      const X = [400, 960, 1520], Y = 400, pk = prog(t, c5 + 2.2, 1.6);
      let f = '';
      f += pop(g(eraserPic(300, 150, { dirty: 1 }), { r: 18 }) + ctext(0, 170, 'くろく なった めん', { size: 40, w: 900, fill: PC.gra }), t, c5 + 0.3, X[0], Y);
      f += pop(g(eraserPic(300, 150, { dirty: 1 - pk }), { r: 18 }) + ctext(0, 170, 'けしかすに なって はがれる', { size: 40, w: 900, fill: PC.crumbDk }), t, c5 + 1.6, X[1], Y);
      for (let i = 0; i < 3; i++) { const u = clamp(pk * 1.4 - i * 0.2); if (u > 0) f += crumbPic(X[1] - 176 - u * 44 - i * 16, Y - 30 + i * 22 + u * (30 + i * 10), 0.72, i * 50 + u * 120, 3, Math.min(1, u * 4)); }
      f += pop(g(eraserPic(300, 150), { r: 18 }) + ctext(0, 170, 'まだ くろく ない めん', { size: 40, w: 900, fill: PC.sleeveDk }), t, c5 + 4.4, X[2], Y);
      f += g(arrow2(X[0] + 200, Y, X[1] - 230, Y, C.ochre, 12), { o: prog(t, c5 + 1.4, 0.3) }) + g(arrow2(X[1] + 200, Y, X[2] - 220, Y, C.ochre, 12), { o: prog(t, c5 + 4.2, 0.3) });
      out += g(f, { o: fO });
    }
    out += titleAt('けしかすが でると、あたらしい めんが でて くる', t, c5 + 0.2, 1e9, C.ink);
    return out;
  },
});

// 5. 色えんぴつ（ろう入り）は消えにくい：ろうが紙の中まで入る・消しゴムになじみにくい
SCENES.push({
  id: 'color',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = '';
    // A. ノートで 消しくらべ
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const x0 = 620, x1 = 1420, y1 = 390, y2 = 620;
      let a = deskBg() + topBadge() + notebook(240, 190, 1440, 600, { lines: 0 });
      const d1 = prog(t, c0 + 0.4, 1.0), d2 = prog(t, c0 + 1.5, 1.0);
      const e1 = eio(prog(t, c0 + 2.8, c1 - c0 - 2.6)), e2 = eio(prog(t, c1 + 0.8, 3.0));
      // えんぴつの線：消しゴムが通ったところは 消える
      if (d1 > 0) a += `<line x1="${lerp(x0, x1, e1)}" y1="${y1}" x2="${lerp(x0, x1, d1)}" y2="${y1}" stroke="${PC.pencil}" stroke-width="16" stroke-linecap="round" opacity="${e1 >= 0.999 ? 0 : 1}"/>`;
      // 色えんぴつの線：消しゴムが通っても のこる
      if (d2 > 0) a += `<line x1="${x0}" y1="${y2}" x2="${lerp(x0, x1, d2)}" y2="${y2}" stroke="${PC.red}" stroke-width="16" stroke-linecap="round"/>` + `<line x1="${x0}" y1="${y2}" x2="${lerp(x0, x1, e2)}" y2="${y2}" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="${e2 > 0.001 ? 0.22 : 0}"/>`;
      a += g(g(pencilPic(190), { r: 28, s: 0.9 }), { x: 560, y: y1, o: prog(t, c0 + 0.2, 0.3) }) + text(310, y1 + 56, 'えんぴつ', { size: 44, w: 900, anchor: 'start', fill: PC.pencil });
      a += g(g(pencilPic(190, { col: PC.red, lt: PC.redLt, dk: PC.redDk, lead: PC.redDk }), { r: 28, s: 0.9 }), { x: 560, y: y2, o: prog(t, c0 + 1.3, 0.3) }) + g(text(310, y2 + 56, 'いろえんぴつ', { size: 40, w: 900, anchor: 'start', fill: PC.redDk }), { o: prog(t, c0 + 1.3, 0.3) });
      // 消しゴム
      const on1 = t > c0 + 2.8 && e1 < 1, on2 = t > c1 + 0.8 && e2 < 1;
      const exx = on2 || e2 >= 1 ? lerp(x0, x1, e2) : lerp(x0, x1, e1), eyy = lerp(y1, y2, eio(prog(t, c1 + 0.2, 0.5))), away = eio(prog(t, c1 + 4.0, 0.5));
      a += g(g(eraserPic(210, 104), { r: -22 }), { x: lerp(exx + ((on1 || on2) ? Math.sin(t * 16) * 30 : 0), 1040, away), y: lerp(eyy - 30, 724, away), o: prog(t, c0 + 2.5, 0.3) });
      a += pop(badge('きえた', { fill: C.accent, size: 44 }), t, c1 - 0.1, 1560, y1) + pop(badge('きえにくい', { fill: PC.redDk, size: 44 }), t, c1 + 4.0, 1540, y2);
      a += titleAt('ろうの はいった いろえんぴつは…', t, c1 + 0.2, 1e9, PC.redDk, 960, 250, 42);
      out += g(a, { o: aO });
    } else out += `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // B. 大きくして見る
    const bO = prog(t, c2 - 0.2, 0.4);
    if (bO > 0) {
      let b = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge() + fiberMat(80, 1840, PY, 170, 3);
      const sink = eio(prog(t, c2 + 0.8, 2.6));
      for (let i = 0; i < 24; i++) {
        const x = 480 + i * 42 + (rnd(i, 2) - 0.5) * 16, dy = lerp(-2, 34 + rnd(i, 3) * 84, sink * (0.55 + 0.45 * rnd(i, 6)));
        b += `<ellipse cx="${x}" cy="${PY + 6 + dy}" rx="${lerp(15, 22, sink)}" ry="${lerp(11, 9, sink)}" fill="${PC.red}" opacity="0.92"/><ellipse cx="${x - 4}" cy="${PY + 3 + dy}" rx="6" ry="3.5" fill="${PC.redLt}" opacity="0.9"/>`;
      }
      b += g(arrow2(0, 0, 0, 96, PC.redDk, 12), { x: 340, y: PY + 20, o: win(t, c2 + 0.8, c3 - 0.2, 0.3) }) + g(arrow2(0, 0, 0, 96, PC.redDk, 12), { x: 1560, y: PY + 20, o: win(t, c2 + 0.8, c3 - 0.2, 0.3) });
      // 消しゴムが こすっても、くっつかない
      const sw = prog(t, c3 + 0.6, cueE(3) - c3 + 0.6), ex = lerp(330, 1560, sw) + Math.sin(t * 11) * 30, ey = lerp(-80, PY - 6, eo(prog(t, c3 + 0.1, 0.6)));
      if (t > c3 + 0.1) b += eraserBig(ex, ey);
      b += g(`<rect x="-250" y="-40" width="500" height="80" rx="40" fill="#fff" stroke="${PC.red}" stroke-width="5"/><ellipse cx="-200" cy="0" rx="20" ry="14" fill="${PC.red}"/>` + text(-166, 2, 'ろう と いろの こな', { size: 36, w: 900, anchor: 'start', fill: PC.redDk }), { x: 1500, y: 280, o: win(t, c2 + 0.4, c3 - 0.1, 0.4) });
      b += pop(cross(-150, 0, 0.42, C.red) + text(-104, 2, 'くっつかない', { size: 46, w: 900, anchor: 'start', fill: C.red }), t, c3 + 2.2, ex, ey - 76);
      out += g(b, { o: bO });
      out += titleAt('ろうが とけて、かみの なかまで はいる', t, c2 + 0.3, c3, PC.redDk) + titleAt('ろうは、けしゴムに なじみにくい', t, c3 + 0.2, 1e9, PC.redDk);
    }
    return out;
  },
});

// 6. 昔はパンで消した → 1770年、プリーストリーが本に書いた → 天然のゴム
const breadPic = (s = 1) => g(`<path d="M -120 20 C -130 -50 -70 -90 0 -90 C 70 -90 130 -50 120 20 C 116 62 60 76 0 76 C -60 76 -116 62 -120 20 Z" fill="${PC.bread}" stroke="${PC.breadDk}" stroke-width="8"/><path d="M -70 -44 Q -50 -64 -26 -50 M 4 -58 Q 28 -74 50 -54 M 66 -26 Q 86 -30 94 -8" fill="none" stroke="${PC.breadDk}" stroke-width="7" stroke-linecap="round"/>` + [[-50, 10], [0, 30], [46, 6], [-10, -14]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="#fbe2b0"/>`).join(''), { s });
const rubberCube = (s = 1) => g(`<rect x="-60" y="-60" width="120" height="120" rx="14" fill="${PC.rubber}" stroke="${PC.rubberDk}" stroke-width="7"/><path d="M -40 -38 Q -20 -48 4 -40" fill="none" stroke="#c49a74" stroke-width="8" stroke-linecap="round"/>`, { s });
const bookPic = (s = 1) => g(`<path d="M -220 -130 L 220 -130 L 220 140 L -220 140 Z" fill="#7a4a2a"/><path d="M -206 -140 Q -100 -160 0 -130 L 0 126 Q -100 100 -206 120 Z" fill="${PC.old}" stroke="#c9b68a" stroke-width="4"/><path d="M 206 -140 Q 100 -160 0 -130 L 0 126 Q 100 100 206 120 Z" fill="${PC.old}" stroke="#c9b68a" stroke-width="4"/>` +
  [0, 1, 2, 3, 4].map(i => `<line x1="-176" y1="${-100 + i * 36}" x2="-30" y2="${-92 + i * 36}" stroke="#b9a67c" stroke-width="6" stroke-linecap="round"/><line x1="30" y1="${-92 + i * 36}" x2="176" y2="${-100 + i * 36}" stroke="#b9a67c" stroke-width="6" stroke-linecap="round"/>`).join('') +
  `<line x1="30" y1="96" x2="176" y2="88" stroke="${C.redUi}" stroke-width="7" stroke-linecap="round"/>`, { s });
SCENES.push({
  id: 'bread',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = deskBg() + topBadge();
    // A. パンで消す
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const x0 = 420, x1 = 1220, y = 520, e = eio(prog(t, c0 + 2.6, cueE(0) - c0 - 2.2));
      let a = `<rect x="260" y="230" width="1160" height="520" rx="10" fill="${PC.old}" filter="url(#shadow)"/>`;
      a += `<line x1="${lerp(x0, x1, e)}" y1="${y}" x2="${x1}" y2="${y}" stroke="${PC.pencil}" stroke-width="16" stroke-linecap="round" opacity="${e >= 0.999 ? 0 : 1}"/>`;
      for (let i = 0; i < 8; i++) a += `<circle cx="${x0 + 40 + i * 100}" cy="${y + 50 + rnd(i, 2) * 26}" r="${7 + rnd(i, 3) * 5}" fill="${PC.bread}" stroke="${PC.breadDk}" stroke-width="3" opacity="${clamp((lerp(x0, x1, e) - (x0 + 40 + i * 100)) / 30)}"/>`;
      a += pop(g(breadPic(1.0), { x: Math.sin(t * 15) * 26 * (e > 0 && e < 1 ? 1 : 0), r: -8 }), t, c0 + 1.6, lerp(x0, x1, e), y - 60);
      a += titleAt('けしゴムが なかった ころは、パンで けした', t, c0 + 0.8, 1e9, PC.breadDk, 840, 300, 42);
      out += g(a, { o: aO });
    }
    // B. 1770年、本に書いた → 天然のゴム
    const bO = prog(t, c2 - 0.2, 0.4);
    if (bO > 0) {
      let b = pop(badge('1770ねん', { fill: C.ink, size: 64, pad: 50 }), t, c2 + 0.2, 420, 230);
      b += pop(text(0, 0, 'イギリスの かがくしゃ プリーストリー', { size: 44, w: 900 }), t, c2 + 1.4, 1120, 230);
      b += pop(bookPic(1.25), t, c2 + 2.4, 440, 520);
      const q = ['「えんぴつの あとを けすのに、', '　とても むいた ものを みた」'];
      b += pop(card(900, 260) + q.map((s, i) => text(-400, -40 + i * 76, s, { size: 46, w: 900, anchor: 'start' })).join('') + text(400, 100, 'と、ほんに かいた', { size: 34, w: 700, anchor: 'end', fill: C.muted }), t, c2 + 4.2, 1220, 470);
      b += g(`<line x1="610" y1="630" x2="780" y2="560" stroke="${C.redUi}" stroke-width="6" stroke-linecap="round" stroke-dasharray="4 14"/>`, { o: prog(t, c2 + 4.6, 0.4) });
      // 天然のゴム
      const rk = prog(t, c3 + 1.4, 2.4), lx0 = 880, lx1 = 1300, ly = 760;
      b += g(`<line x1="${lerp(lx0, lx1, eio(rk))}" y1="${ly}" x2="${lx1}" y2="${ly}" stroke="${PC.pencil}" stroke-width="14" stroke-linecap="round" opacity="${rk >= 0.999 ? 0 : 1}"/>`, { o: prog(t, c3 + 0.2, 0.3) });
      b += pop(g(rubberCube(1.0), { x: Math.sin(t * 15) * 18 * (rk > 0 && rk < 1 ? 1 : 0), r: -10 }), t, c3 + 0.3, lerp(lx0, lx1, eio(rk)), ly - 56);
      b += pop(badge('てんねんの ゴム', { fill: PC.rubberDk, size: 50, pad: 40 }), t, c3 + 0.6, 1550, 750);
      out += g(b, { o: bO });
    }
    out += kidShow('K', t, 1690, 846, { s: 0.7, start: c1 - 0.9, n: 0, bubble: false, end: c2 - 0.3 });
    out += talkBubble('K', 1500, 600, 1754, 712, 46);   // しっぽの先は カメレオンの頭
    return out;
  },
});

// 7. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -590;
      let a = pop(card(1360, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, 'くろい つぶが、かみから、けしゴムに、くっつくから', { size: 44, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['しんが くだけて かみに つく', PC.gra], ['けしゴムに くっつく', PC.sleeveDk], ['けしかすに つつまれる', PC.crumbDk]], t, 960, 600, { start: 2.4, step: 1.1, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [g(eyeIcon(0.3)), 'じを けしたら、けしかすを みる', C.ink, cue(1)],
        [crumbPic(0, 0, 0.5, -10, 2), 'しろい けしゴムなのに、けしかすは はいいろ', C.ink, cue(2)],
        [gp(0, 0, 16, 20), 'くろい つぶを、つつみこんで とったから', PC.gra, cue(3)],
        [g(eyeIcon(0.3)), 'けす まえの じと、けした あとの かみを くらべる', C.ink, cue(4)],
        [qm, 'えんぴつと いろえんぴつ、けしくらべも おもしろい', PC.redDk, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 900, 38, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 310 + i * 96); });
      // ノートと 消しかす、ルーペで見ると 中に黒いつぶ
      const PX = 1500, PYc = 520;
      let p = card(700, 480, { fill: PC.desk }) + `<rect x="-300" y="-190" width="600" height="300" rx="14" fill="#fff"/>`;
      p += text(-250, -60, 'あ', { size: 130, w: 900, fill: PC.pencil, anchor: 'start', ls: 0 }) + g(text(-90, -60, 'い', { size: 130, w: 900, fill: PC.pencil, anchor: 'start', ls: 0 }), { o: 0.12 });
      p += g(eraserPic(170, 84), { x: 196, y: -120, r: -20 });
      [[-30, 40], [40, 60], [100, 30], [-90, 64]].forEach(([x, y], i) => { p += crumbPic(x, y, 0.5, i * 47 - 30, 2); });
      const lO = prog(t, cue(2) + 0.6, 0.4);
      p += g(`<line x1="40" y1="60" x2="150" y2="130" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="4 12" stroke-linecap="round"/><circle cx="210" cy="150" r="96" fill="#eef6f8" stroke="${C.blueUi}" stroke-width="12"/>` + crumbPic(210, 150, 1.5, -12, 5), { o: lO });
      p += g(ctext(-130, 190, 'けしかすは はいいろ', { size: 36, w: 900, fill: PC.crumbDk }), { o: lO });
      b += pop(p, t, cue(1) + 0.4, PX, PYc);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「えんぴつ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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


// みのまわり図鑑 動画「こおりは、どうして とけるの？」（こおり）
// 出どころ：everyday-trivia trivia/ice-melt.md（絵の見本：assets/figures-ice.js、メモ：ideas/notes/ice-melt.md）

// ---------- こおりの道具 ----------
const IC = {
  ice: '#d3edf9', iceDk: '#8cc3de', iceLt: '#f3fbff', line: '#5b9fc0', water: '#5aa9e6', waterDk: '#2f78b8', waterLt: '#a9d4f5',
  heat: '#f08a3c', heatDk: '#d9641c', heatLt: '#ffd0a0', board: '#33383e', boardDk: '#22262b', boardTop: '#484e56',
  wall: '#f6ecd9', wood: '#c79b6b', woodDk: '#a67c4f', skin: '#f6d6bd', skinDk: '#e2b497',
};
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
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
// 氷（ななめ上から見た四角）。(x, y) は前の面の下のまん中、w は はば。m = 0（とけていない）〜1（ぜんぶ水）
function iceCube(x, y, w, m = 0, { puddle = true, o = 1 } = {}) {
  m = clamp(m);
  const ww = w * (1 - 0.45 * m), h = w * (1 - 0.82 * m), d = ww * 0.32, x0 = x - ww / 2, top = y - h, r = Math.min(w * 0.08, h * 0.3);
  const st = `stroke="${IC.line}" stroke-width="${Math.max(3, w * 0.03)}" stroke-linejoin="round"`;
  let s = '';
  if (puddle && m > 0.02) {
    const rx = w * (0.5 + 0.8 * m), ry = w * (0.1 + 0.13 * m), cy = y - w * 0.07;
    s += `<ellipse cx="${x + w * 0.1}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${IC.water}" opacity="0.8"/><ellipse cx="${x + w * 0.1 - rx * 0.35}" cy="${cy - ry * 0.3}" rx="${rx * 0.3}" ry="${ry * 0.22}" fill="#fff" opacity="0.5"/>`;
  }
  const co = clamp((1 - m) / 0.1);
  if (co > 0) s += `<g opacity="${co}"><path d="M ${x0} ${top} l ${d} ${-d} h ${ww} l ${-d} ${d} Z" fill="${IC.iceLt}" ${st}/><path d="M ${x0 + ww} ${top} l ${d} ${-d} v ${h} l ${-d} ${d} Z" fill="${IC.iceDk}" ${st}/>` +
    `<rect x="${x0}" y="${top}" width="${ww}" height="${h}" rx="${r}" fill="${IC.ice}" ${st}/><path d="M ${x0 + ww * 0.17} ${top + h * 0.2} v ${h * 0.38}" stroke="#fff" stroke-width="${ww * 0.07}" stroke-linecap="round"/></g>`;
  return o >= 1 ? s : g(s, { o });
}
// 水のつぶ（まるい顔）
const mol = (x, y, r = 30, { col = IC.water, o = 1, face = true } = {}) => o <= 0 ? '' :
  `<g opacity="${o}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${col}" stroke="${IC.waterDk}" stroke-width="${(r * 0.14).toFixed(1)}"/><circle cx="${(x - r * 0.36).toFixed(1)}" cy="${(y - r * 0.46).toFixed(1)}" r="${(r * 0.2).toFixed(1)}" fill="#fff" opacity="0.75"/>` +
  (face ? `<circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.02).toFixed(1)}" r="${(r * 0.11).toFixed(1)}" fill="${C.ink}"/><circle cx="${(x + r * 0.3).toFixed(1)}" cy="${(y - r * 0.02).toFixed(1)}" r="${(r * 0.11).toFixed(1)}" fill="${C.ink}"/><path d="M ${(x - r * 0.22).toFixed(1)} ${(y + r * 0.3).toFixed(1)} Q ${x.toFixed(1)} ${(y + r * 0.52).toFixed(1)} ${(x + r * 0.22).toFixed(1)} ${(y + r * 0.3).toFixed(1)}" fill="none" stroke="${C.ink}" stroke-width="${(r * 0.09).toFixed(1)}" stroke-linecap="round"/>` : '') + `</g>`;
// つないだ手（つぶとつぶのあいだ）
const bond = (x1, y1, x2, y2, o = 1, w = 12, col = IC.waterDk) => o <= 0 ? '' :
  `<g opacity="${o}"><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><circle cx="${((x1 + x2) / 2).toFixed(1)}" cy="${((y1 + y2) / 2).toFixed(1)}" r="${w * 0.85}" fill="#fff" stroke="${col}" stroke-width="${w * 0.3}"/></g>`;
// 熱のつぶ（オレンジ）
const heatDot = (x, y, r = 13, o = 1) => o <= 0 ? '' : `<g opacity="${o}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r * 1.9}" fill="${IC.heatLt}" opacity="0.5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${IC.heat}"/><circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${r * 0.3}" fill="#fff" opacity="0.7"/></g>`;
// 温度計。(x, y) は玉のまん中。lv = 0〜1（赤い柱の高さ）
function thermo(x, y, lv, { h = 240, s = 1 } = {}) {
  const col = '#e2574c', hh = h * clamp(lv);
  let o = `<rect x="-17" y="${-h - 34}" width="34" height="${h + 44}" rx="17" fill="#fff" stroke="${C.ink}" stroke-width="6"/><rect x="-7" y="${-hh - 12}" width="14" height="${hh + 20}" rx="7" fill="${col}"/><circle cx="0" cy="22" r="32" fill="${col}" stroke="${C.ink}" stroke-width="6"/>`;
  for (let k = 0; k <= 4; k++) o += `<line x1="17" y1="${-12 - h * k / 4}" x2="${k % 2 ? 30 : 38}" y2="${-12 - h * k / 4}" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
  return g(o, { x, y, s });
}
// 板（ななめ上から）。(x, y) は前の上のふちのまん中。kind = 'alu' | 'foam'。どちらも黒い板（実験と同じ）
function slab(x, y, w, kind, { th = 80, d = 60 } = {}) {
  const x0 = x - w / 2, sk = d * 0.8, alu = kind === 'alu';
  let s = `<path d="M ${x0} ${y} l ${sk} ${-d} h ${w} l ${-sk} ${d} Z" fill="${IC.boardTop}"/><path d="M ${x0 + w} ${y} l ${sk} ${-d} v ${th} l ${-sk} ${d} Z" fill="${IC.boardDk}"/><rect x="${x0}" y="${y}" width="${w}" height="${th}" fill="${IC.board}"/>`;
  if (alu) s += `<path d="M ${x0 + w * 0.1} ${y - d * 0.2} l ${sk * 0.6} ${-d * 0.6} h ${w * 0.16} l ${-sk * 0.6} ${d * 0.6} Z" fill="#fff" opacity="0.2"/><rect x="${x0}" y="${y}" width="${w}" height="${Math.max(4, th * 0.07)}" fill="#c9d2da" opacity="0.85"/>`;
  else for (let i = 0; i < 34; i++) { const u = rnd(i, 61), v = rnd(i, 62); s += i % 2 ? `<circle cx="${x0 + 10 + u * (w - 20)}" cy="${y + 8 + v * (th - 16)}" r="${th > 50 ? 4 : 2.5}" fill="#646b74"/>` : `<circle cx="${x0 + sk * v + 14 + u * (w - 28)}" cy="${y - d * v}" r="${th > 50 ? 3.5 : 2.5}" fill="#6d747d"/>`; }
  return `<g transform="translate(${x} ${y})"><g transform="translate(${-x} ${-y})">${s}</g></g>`;
}
// 手（上から見たところ。指が上）。まん中は手のひら
function handTop(s = 1) {
  const st = `stroke="${IC.skinDk}" stroke-width="5"`;
  let o = `<rect x="-66" y="70" width="132" height="190" rx="48" fill="${IC.skin}" ${st}/>`;
  o += [[-92, -150], [-42, -184], [8, -176], [58, -140]].map(([x, y]) => `<rect x="${x}" y="${y}" width="44" height="${-y + 20}" rx="22" fill="${IC.skin}" ${st}/>`).join('');
  o += `<rect x="-168" y="-36" width="52" height="150" rx="26" fill="${IC.skin}" ${st} transform="rotate(-32 -142 80)"/>`;
  o += `<rect x="-104" y="-76" width="216" height="210" rx="64" fill="${IC.skin}" ${st}/>`;
  o += `<path d="M -60 -6 Q -10 30 60 -14 M -66 44 Q -6 74 56 36" fill="none" stroke="${IC.skinDk}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
  return `<g transform="scale(${s})">${o}</g>`;
}
// つぶの ならび（こうし）。c 列・r 行。ひとつのつぶが、まわりの4つとつながる
const latP = (c, r, x0, y0, sp) => [x0 + c * sp, y0 + r * sp + (c % 2) * sp * 0.2];
// 大きな文字（ふちつき）
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 14 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });

// 1. つかみ：冷凍庫から出した氷が、お皿の上で水になる
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${IC.wall}"/><rect x="0" y="860" width="1920" height="220" fill="#d9b98c"/><rect x="0" y="852" width="1920" height="14" fill="#c4a274"/>`;
    // 冷蔵庫（上が冷凍庫）
    const FX = 1560, FY = 150, FW = 280, FH = 710;
    out += `<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" rx="26" fill="#eef3f6" stroke="#b9c6ce" stroke-width="6"/><line x1="${FX}" y1="${FY + 250}" x2="${FX + FW}" y2="${FY + 250}" stroke="#b9c6ce" stroke-width="6"/>`;
    out += `<rect x="${FX + 24}" y="${FY + 120}" width="14" height="90" rx="7" fill="#9fb0ba"/><rect x="${FX + 24}" y="${FY + 290}" width="14" height="150" rx="7" fill="#9fb0ba"/>`;
    out += text(FX + FW / 2 + 12, FY + 70, 'れいとうこ', { size: 36, w: 900, fill: '#6f8794' });
    out += `<g transform="translate(${FX + FW / 2 + 12} ${FY + 160})">${[0, 60, 120].map(a => `<line x1="-34" y1="0" x2="34" y2="0" stroke="#9cc4dc" stroke-width="8" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}</g>`;
    // テーブルとお皿
    out += `<rect x="620" y="700" width="800" height="36" rx="12" fill="${IC.wood}"/><rect x="690" y="736" width="30" height="124" fill="${IC.woodDk}"/><rect x="1320" y="736" width="30" height="124" fill="${IC.woodDk}"/>`;
    const PX = 1020, PY = 690;
    out += `<ellipse cx="${PX}" cy="${PY}" rx="250" ry="34" fill="#fff" stroke="#cfd6da" stroke-width="5"/><ellipse cx="${PX}" cy="${PY - 4}" rx="176" ry="21" fill="#f1f5f7"/>`;
    // 氷：冷凍庫から、お皿へ。それから だんだん とける
    const mv = eio(prog(t, c0 + 0.5, 1.3)), m = eio(prog(t, c1 + 0.3, Math.max(2, cueE(1) - c1 - 0.8)));
    const ix = lerp(FX + 150, PX - 14, mv), iy = lerp(FY + 222, PY, mv) - Math.sin(mv * Math.PI) * 170;
    out += g(iceCube(ix, iy, 170, m, { puddle: mv >= 1 }), { o: prog(t, 0.2, 0.3) });
    out += tag(PX - 70, PY - 150, PX - 300, 470, 'こおり', win(t, c0 + 2.0, c1 + 0.6, 0.3), { col: IC.waterDk, size: 46 });
    out += tag(PX + 110, PY - 14, PX + 330, 560, 'みず', win(t, cueE(1) - 0.5, c3 + 0.2, 0.3), { col: IC.waterDk, size: 46 });
    // 時計（時間がたつ）
    const ck = win(t, c1 - 0.1, cueE(1) + 0.3, 0.3);
    if (ck > 0) {
      const a = prog(t, c1 + 0.3, Math.max(2, cueE(1) - c1 - 0.8)) * 660;
      out += g(`<circle r="88" fill="#fff" stroke="${C.ink}" stroke-width="10"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => `<line x1="0" y1="-74" x2="0" y2="${k % 3 ? -66 : -58}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" transform="rotate(${k * 30})"/>`).join('') +
        `<line x1="0" y1="0" x2="0" y2="-36" stroke="${C.ink}" stroke-width="11" stroke-linecap="round" transform="rotate(${50 + a / 12})"/><line x1="0" y1="0" x2="0" y2="-58" stroke="${C.redUi}" stroke-width="8" stroke-linecap="round" transform="rotate(${a})"/><circle r="9" fill="${C.ink}"/>`, { x: PX, y: 300, o: ck });
    }
    // 子どもたち
    const eyes = m > 0.3 && t < c3 ? 'wide' : 'open';
    out += kidShow('B', t, 170, 890, { s: 0.5, start: 0, n: 1, eyes, look: [7, -3], bubble: false });
    out += kidShow('S', t, 360, 890, { s: 0.5, start: 0, n: 0, eyes, look: [7, -3] });
    // こおり → みず ？
    out += pop(card(800, 230) + iceCube(-270, 66, 120) + arrow2(-150, 4, -40, 4, C.ink, 12) + `<g transform="translate(60 4)"><ellipse cx="0" cy="34" rx="92" ry="26" fill="${IC.water}" opacity="0.85"/><ellipse cx="-30" cy="26" rx="28" ry="7" fill="#fff" opacity="0.5"/></g>` +
      text(270, 6, '？', { size: 130, w: 900, fill: C.ochre }), t, c3 + 0.4, PX, 330, { end: cueE(3) + 0.6 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 220);
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${IC.waterDk}">こおり</tspan>は、どうして</text>`, { x: 960, y: 400, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${IC.heatDk}">とける</tspan>の？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(iceCube(-250, 60, 120) + arrow2(-120, 10, -10, 10, C.ink, 12) + iceCube(130, 60, 120, 0.55) + arrow2(290, 10, 400, 10, C.ink, 12) + iceCube(530, 60, 120, 1), t, t0 + 1.8, 860, 800);
    }
    return out;
  },
});

// 2. 予想：アルミの板と、あわの板。早くとけるのは どっち？
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1);
    out += pop(text(0, 0, 'よそうして みよう', { size: 64, w: 900 }), t, 0.3, 960, 140, { end: c1 - 0.1 });
    out += pop(text(0, 0, 'はやく とけるのは、どっち？', { size: 64, w: 900 }), t, c1, 960, 140);
    [['alu', 660, 'アルミの いた'], ['foam', 1260, 'あわの いた']].forEach(([k, x, name], i) => {
      out += pop(slab(0, 0, 330, k, { th: 34, d: 44 }) + text(16, 68, name, { size: 36, w: 900 }), t, c0 + d0 * (0.2 + i * 0.22), x, 300);
      out += pop(iceCube(0, 0, 84), t, c0 + d0 * 0.78 + i * 0.2, x + 18, 300 - 16);
    });
    const opts = [['①', 'あわの いたの うえ'], ['②', 'どちらも おなじ'], ['③', 'アルミの いたの うえ']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 2;
      out += pop((on ? `<rect x="-560" y="-68" width="1120" height="136" rx="30" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1100, 116) +
        `<circle cx="-470" cy="0" r="42" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-470, 3, n, { size: 48, w: 900, fill: '#fff' }) +
        text(-400, 2, s, { size: 52, w: 700, anchor: 'start' }), t, cue(i + 2) - 0.2, 900, 480 + i * 138);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(4) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 300, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 氷の中：水のつぶが きちんと並んで、手をつないでいる。ひとつが4つとつながって、すきまが多い
SCENES.push({
  id: 'order',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2;
    const ZX = 1210, ZY = 480, ZR = 345, SP = 132, X0 = ZX - 2 * SP, Y0 = ZY - 2 * SP - 13;
    // 氷と、のぞきこむ まる
    out += pop(iceCube(0, 0, 250), t, 0.3, 350, 700);
    out += g(text(360, 772, 'こおり', { size: 56, w: 900, fill: IC.waterDk }), { o: prog(t, 0.6, 0.4) });
    const zo = prog(t, 0.6, 0.5);
    let z = `<line x1="420" y1="470" x2="${ZX - 200}" y2="${ZY - ZR + 62}" stroke="${IC.iceDk}" stroke-width="5" stroke-dasharray="14 12"/><line x1="420" y1="640" x2="${ZX - 200}" y2="${ZY + ZR - 62}" stroke="${IC.iceDk}" stroke-width="5" stroke-dasharray="14 12"/>`;
    z += `<rect x="388" y="536" width="64" height="64" rx="10" fill="none" stroke="${C.ochre}" stroke-width="7"/>`;
    z += `<circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="${IC.iceLt}" stroke="${IC.iceDk}" stroke-width="14"/><clipPath id="ozc"><circle cx="${ZX}" cy="${ZY}" r="${ZR - 7}"/></clipPath><g clip-path="url(#ozc)">`;
    // 手（となりどうし）
    const hi = prog(t, c2 + 0.3, 0.4), sq = 1 + 0.25 * Math.max(0, Math.sin((t - c1 - 0.6) * 5)) * win(t, c1 + 0.6, c1 + 3.2, 0.3);
    let k = 0;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const [x, y] = latP(c, r, X0, Y0, SP);
      [[c + 1, r], [c, r + 1]].forEach(([c2_, r2_]) => {
        if (c2_ > 4 || r2_ > 4) return;
        const [x2, y2] = latP(c2_, r2_, X0, Y0, SP), bo = prog(t, c1 + 0.3 + k * 0.045, 0.3); k++;
        const mine = (c === 2 && r === 2) || (c2_ === 2 && r2_ === 2);
        z += bond(x, y, x2, y2, bo, 12 * (bo >= 1 ? sq : 1), mine && hi > 0 ? mix(IC.waterDk, IC.heatDk, hi) : IC.waterDk);
      });
    }
    // つぶ
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const [x, y] = latP(c, r, X0, Y0, SP), pk = back(prog(t, c0 + 0.2 + (r * 5 + c) * 0.075, 0.4));
      if (pk > 0) z += `<g transform="translate(${x} ${y}) scale(${Math.max(pk, 0.001)})">${mol(0, 0, 34)}</g>`;
    }
    // ひとつのつぶと、まわりの4つ
    if (hi > 0) {
      const [mx, my] = latP(2, 2, X0, Y0, SP);
      z += `<circle cx="${mx}" cy="${my}" r="46" fill="none" stroke="${IC.heatDk}" stroke-width="9" opacity="${hi}"/>`;
      [[2, 1], [3, 2], [2, 3], [1, 2]].forEach(([c, r], i) => {
        const [x, y] = latP(c, r, X0, Y0, SP);
        z += pop(`<circle r="25" fill="${IC.heatDk}"/>` + text(0, 2, i + 1, { size: 34, w: 900, fill: '#fff', ls: 0 }), t, c2 + d2 * 0.2 + i * 0.35, x + 34, y - 34);
      });
      // すきま
      const gk = prog(t, c2 + d2 * 0.62, 0.4);
      [[0, 0], [1, 0], [0, 1], [1, 1], [3, 3], [2, 3], [3, 0]].forEach(([c, r], i) => {
        const [x, y] = latP(c, r, X0, Y0, SP), [x2, y2] = latP(c + 1, r + 1, X0, Y0, SP);
        z += `<circle cx="${(x + x2) / 2}" cy="${(y + y2) / 2 + (c % 2 ? -13 : 13) * 0}" r="${28 + 3 * Math.sin(t * 4 + i)}" fill="none" stroke="${C.ochre}" stroke-width="6" stroke-dasharray="10 9" opacity="${gk * 0.95}"/>`;
      });
    }
    z += `</g>`;
    out += g(z, { o: zo });
    out += tag(X0 + 3 * SP + 6, Y0 + 0.2 * SP - 30, 1690, 150, 'みずの つぶ', win(t, c0 + 1.6, c2 - 0.2, 0.3), { col: IC.waterDk });
    // ことば
    out += pop(badge('きちんと ならんで いる', { fill: IC.waterDk, size: 42 }), t, c0 + 1.0, 380, 200, { end: c1 - 0.1 });
    out += pop(badge('ぎゅっと てを つなぐ', { fill: IC.waterDk, size: 44 }), t, c1 + 0.5, 380, 200, { end: c2 - 0.1 });
    out += pop(badge('まわりの 4つと つながる', { fill: IC.heatDk, size: 40 }), t, c2 + d2 * 0.15, 380, 180);
    out += pop(badge('すきまが おおい かたち', { fill: C.ochre, size: 40 }), t, c2 + d2 * 0.62, 380, 270);
    return out;
  },
});

// 4. 熱は、あたたかいものから氷へうつる：手・空気・お皿
SCENES.push({
  id: 'heat',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    // 手の上の氷
    const HX = 430, HY = 560;
    out += pop(handTop(1.0), t, 0.2, HX, HY);
    out += pop(iceCube(0, 0, 150), t, c0 + 0.5, HX - 6, HY + 60);
    out += pop(big(0, 0, 'ひやっ', 96, IC.waterDk, { r: -8 }), t, c0 + 1.5, HX + 230, HY - 250, { end: c2 - 0.2 });
    // 手の熱が、氷へ
    if (t > c1) {
      for (let i = 0; i < 9; i++) {
        const f = ((t - c1) * 0.55 + i / 9) % 1, a = (i / 9) * Math.PI * 2 + 0.4, r = lerp(150, 30, f), x = HX + 4 + Math.cos(a) * r * 0.9, y = HY + 10 + Math.sin(a) * r * 0.8;
        out += heatDot(x, y, 12, Math.min(1, f * 5, (1 - f) * 4) * prog(t, c1, 0.3));
      }
    }
    out += tag(HX + 120, HY + 96, HX + 150, 800, 'ての ねつ', win(t, c1 + 0.4, 1e9, 0.3), { col: IC.heatDk, size: 40 });
    out += pop(badge('ての ねつが、こおりに うばわれる', { fill: IC.heatDk, size: 36 }), t, c1 + (cueE(1) - c1) * 0.45, 500, 200, { end: c2 - 0.1 });
    // 熱は、あたたかいものから氷へ
    out += pop(badge('ねつは、あたたかい ものから こおりへ', { fill: IC.heatDk, size: 44, pad: 40 }), t, c2 + 0.3, 1010, 170);
    // 空気とお皿からも
    const PX = 1040, PY = 650, po = prog(t, c3 - 0.2, 0.5);
    if (po > 0) {
      let p = `<ellipse cx="${PX}" cy="${PY + 16}" rx="290" ry="42" fill="#fff" stroke="#cfd6da" stroke-width="5"/><ellipse cx="${PX}" cy="${PY + 10}" rx="200" ry="25" fill="#f1f5f7"/>`;
      p += iceCube(PX - 10, PY + 14, 170, 0.25 * prog(t, c3 + 0.5, 6));
      const d3 = cueE(3) - c3, ao = prog(t, c3 + d3 * 0.3, 0.4), bo = prog(t, c3 + d3 * 0.5, 0.4), pu = 10 * Math.sin(t * 5);
      // 空気から
      p += g(arrow2(PX - 300 - pu, PY - 290 - pu * 0.6, PX - 130, PY - 170, IC.heat, 14) + arrow2(PX + 10, PY - 390 - pu, PX + 10, PY - 250, IC.heat, 14) + arrow2(PX + 330 + pu, PY - 290 - pu * 0.6, PX + 150, PY - 170, IC.heat, 14), { o: ao });
      p += g(text(PX + 40, PY - 370, 'くうきの ねつ', { size: 42, w: 900, fill: IC.heatDk, anchor: 'start' }), { o: ao });
      // お皿から
      p += g(arrow2(PX - 250 - pu, PY + 30, PX - 120, PY + 14, IC.heat, 14) + arrow2(PX + 270 + pu, PY + 30, PX + 130, PY + 14, IC.heat, 14), { o: bo });
      p += g(text(PX + 10, PY + 110, 'おさらの ねつ', { size: 42, w: 900, fill: IC.heatDk }), { o: bo });
      out += g(p, { o: po });
    }
    // カメレオン
    out += kidShow('K', t, 1700, 840, { s: 0.7, start: cue(4) - 0.9, n: 0, bubble: false, mouth: lineOf('K') ? 'open' : 'smile' });
    out += talkBubble('K', 1600, 560, 1660, 690, 42);
    return out;
  },
});

// 5. 入った熱は、つぶの手をはなすのに使われる → ばらばらに動ける → 水
const ML = { C: 8, R: 4, SP: 140, X0: 470, Y0: 268 };
SCENES.push({
  id: 'melt',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    const tEnd = cueE(1) - 0.8, step = (tEnd - (c0 + 1.0)) / 3.4;
    const P = [];
    for (let r = 0; r < ML.R; r++) for (let c = 0; c < ML.C; c++) {
      const i = r * ML.C + c, e = Math.min(c, ML.C - 1 - c), [hx, hy] = latP(c, r, ML.X0, ML.Y0, ML.SP);
      const rel = c0 + 1.0 + e * step + rnd(i, 41) * step * 0.7, k = eo(clamp((t - rel) / 1.4));
      const x = lerp(hx, 960 + (hx - 960) * 0.93, k) + k * ((rnd(i, 42) - 0.5) * 70 + Math.sin(t * 1.3 + i) * 26 + Math.sin(t * 0.7 + i * 2.1) * 18);
      const y = lerp(hy, 490 + (hy - 490) * 0.9, k) + k * ((rnd(i, 43) - 0.5) * 50 + Math.cos(t * 1.1 + i * 1.7) * 22);
      P.push({ c, r, hx, hy, rel, k, x, y, left: c < ML.C / 2 });
    }
    const melted = P.filter(p => t > p.rel).length / P.length, wk = eo(prog(t, c2 - 0.3, 1.0));
    out += `<rect x="330" y="216" width="1260" height="548" rx="44" fill="${mix(IC.iceLt, '#cfe6fb', Math.max(melted * 0.6, wk))}" stroke="${mix(IC.iceDk, IC.water, melted)}" stroke-width="12"/>`;
    // 手
    P.forEach(p => {
      [[p.c + 1, p.r], [p.c, p.r + 1]].forEach(([c, r]) => {
        if (c >= ML.C || r >= ML.R) return;
        const q = P[r * ML.C + c], o = 1 - clamp((t - Math.min(p.rel, q.rel)) / 0.3);
        out += bond(p.x, p.y, q.x, q.y, o, 12);
      });
    });
    // 熱のつぶ：外から入ってきて、手をはなす
    P.forEach((p, i) => {
      const a = (t - (p.rel - 1.5)) / 1.5;
      if (a > 0 && a < 1) { const sx = p.left ? 200 : 1720, sy = p.hy + (rnd(i, 44) - 0.5) * 120; out += heatDot(lerp(sx, p.hx, eio(a)), lerp(sy, p.hy - 20, eio(a)) + Math.sin(a * Math.PI * 3) * 14, 14, Math.min(1, a * 6)); }
      const f = (t - p.rel) / 0.45;
      if (f > 0 && f < 1) out += `<circle cx="${p.hx}" cy="${p.hy}" r="${40 + 40 * f}" fill="none" stroke="${IC.heat}" stroke-width="7" opacity="${1 - f}"/>`;
    });
    P.forEach(p => { out += mol(p.x, p.y, 34); });
    // 左右から入る熱（矢印）
    const ao = win(t, c0 + 0.2, c2 - 0.2, 0.4) + prog(t, c3 + 0.3, 0.4), pu = 12 * Math.sin(t * 5);
    out += g(arrow2(130 + pu, 400, 300 + pu, 400, IC.heat, 16) + arrow2(130 + pu, 600, 300 + pu, 600, IC.heat, 16) + arrow2(1790 - pu, 400, 1620 - pu, 400, IC.heat, 16) + arrow2(1790 - pu, 600, 1620 - pu, 600, IC.heat, 16), { o: clamp(ao) });
    out += g(text(210, 500, 'ねつ', { size: 48, w: 900, fill: IC.heatDk }) + text(1710, 500, 'ねつ', { size: 48, w: 900, fill: IC.heatDk }), { o: clamp(ao) });
    // ことば
    out += pop(badge('こおり', { fill: IC.waterDk, size: 48, pad: 40 }), t, 0.3, 470, 216, { end: c2 - 0.2 });
    out += pop(badge('みず', { fill: IC.water, size: 56, pad: 48 }), t, c2 + 0.1, 470, 216);
    out += pop(badge('ねつが、つぶの てを はなす', { fill: IC.heatDk, size: 42 }), t, c0 + (cueE(0) - c0) * 0.4, 1080, 150, { end: c1 - 0.1 });
    out += pop(badge('ばらばらに うごける', { fill: IC.waterDk, size: 42 }), t, c1 + (cueE(1) - c1) * 0.4, 1080, 150, { end: c3 - 0.1 });
    out += pop(badge('とかして いたのは、まわりから はいる ねつ', { fill: IC.heatDk, size: 42, pad: 40 }), t, c3 + (cueE(3) - c3) * 0.3, 1080, 150);
    return out;
  },
});

// 6. とけているあいだは 0度のまま。ぜんぶとけてから、また上がる
SCENES.push({
  id: 'zero',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2;
    const t0 = c0 + 0.5, tm = c2 + d2 * 0.5, mp = prog(t, t0, tm - t0), up = eo(prog(t, tm, cueE(2) + 0.9 - tm));
    // コップの水と氷
    const CX = 340, TOP = 330, BOT = 770, WL = 440;
    let cup = `<clipPath id="zcup"><path d="M ${CX - 200} ${TOP} L ${CX + 200} ${TOP} L ${CX + 170} ${BOT - 20} Q ${CX + 168} ${BOT} ${CX + 148} ${BOT} L ${CX - 148} ${BOT} Q ${CX - 168} ${BOT} ${CX - 170} ${BOT - 20} Z"/></clipPath>`;
    cup += `<g clip-path="url(#zcup)"><rect x="${CX - 210}" y="${WL}" width="420" height="${BOT - WL + 10}" fill="${IC.waterLt}"/><rect x="${CX - 210}" y="${WL}" width="420" height="14" fill="${IC.water}" opacity="0.5"/>`;
    [[-95, 0, 118], [40, 6, 104], [-20, 96, 92]].forEach(([dx, dy, w], i) => {
      const s = 1 - mp * (0.9 + i * 0.05); if (s <= 0.03) return;
      const ww = w * Math.max(s, 0), x = CX + dx + Math.sin(t * 1.2 + i * 2) * 6 + (w - ww) / 2, y = WL - ww * 0.12 + dy * (1 - mp) + Math.sin(t * 1.7 + i) * 3;
      cup += `<rect x="${x}" y="${y}" width="${ww}" height="${ww}" rx="${ww * 0.14}" fill="${IC.iceLt}" stroke="${IC.line}" stroke-width="5" opacity="0.95" transform="rotate(${-8 + i * 9} ${x + ww / 2} ${y + ww / 2})"/>`;
    });
    cup += `</g><path d="M ${CX - 200} ${TOP} L ${CX + 200} ${TOP} L ${CX + 170} ${BOT - 20} Q ${CX + 168} ${BOT} ${CX + 148} ${BOT} L ${CX - 148} ${BOT} Q ${CX - 168} ${BOT} ${CX - 170} ${BOT - 20} Z" fill="none" stroke="#8fb3c6" stroke-width="10" stroke-linejoin="round"/><path d="M ${CX - 166} ${TOP + 40} L ${CX - 146} ${BOT - 70}" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.9"/>`;
    out += g(cup, { o: prog(t, 0.15, 0.4) });
    // 入ってくる熱
    for (let i = 0; i < 8; i++) {
      const f = ((t - c0) * 0.3 + i / 8) % 1, left = i % 2 === 0, y = 500 + (i >> 1) * 62;
      out += heatDot(left ? lerp(40, CX - 120, f) : lerp(CX + 300, CX + 130, f), y + Math.sin(f * 9 + i) * 8, 12, Math.min(1, f * 5, (1 - f) * 5) * prog(t, c0 + 0.3, 0.4));
    }
    // 温度計（0度で止まる → ぜんぶとけたら上がる）
    const TX = 700, TY = 700, LV0 = 0.3;
    out += pop(thermo(0, 0, LV0 + 0.5 * up, { h: 300 }), t, 0.4, TX, TY);
    out += g(`<line x1="${TX + 44}" y1="${TY - 12 - 300 * LV0}" x2="${TX + 96}" y2="${TY - 12 - 300 * LV0}" stroke="${C.ink}" stroke-width="5"/>` + text(TX + 106, TY - 10 - 300 * LV0, '0ど', { size: 50, w: 900, anchor: 'start' }), { o: prog(t, 0.8, 0.4) });
    out += g(arrow2(TX - 60, TY - 120, TX - 60, TY - 250, '#e2574c', 14), { o: up > 0.05 ? 1 : 0 });
    // グラフ
    const GX = 1400, GY = 400, OX = -290, OY = 160, Z = 30, XM = 130, XE = 310, YE = -150;
    let gr = card(780, 470) + `<path d="M ${OX} ${-180} L ${OX} ${OY} L ${340} ${OY}" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    gr += text(OX + 20, -204, 'おんど', { size: 32, w: 900, fill: C.muted, anchor: 'start' }) + text(340, OY + 38, 'じかん', { size: 32, w: 900, fill: C.muted, anchor: 'end' });
    gr += `<line x1="${OX}" y1="${Z}" x2="330" y2="${Z}" stroke="${C.line}" stroke-width="5" stroke-dasharray="12 10"/>` + text(OX - 16, Z + 2, '0ど', { size: 36, w: 900, anchor: 'end' });
    const px = mp < 1 ? lerp(OX, XM, mp) : lerp(XM, XE, up), py = mp < 1 ? Z : lerp(Z, YE, up);
    gr += `<path d="M ${OX} ${Z} L ${Math.min(px, XM)} ${Z}${mp >= 1 ? ` L ${px} ${py}` : ''}" fill="none" stroke="#e2574c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${px}" cy="${py}" r="16" fill="#e2574c" stroke="#fff" stroke-width="5"/>`;
    // とけているあいだ
    const fo = prog(t, c0 + d0 * 0.35, 0.4);
    gr += g(`<path d="M ${OX + 6} ${Z + 26} v 14 H ${XM - 6} v -14" fill="none" stroke="${IC.waterDk}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` + text((OX + XM) / 2, Z + 78, 'とけて いる あいだ', { size: 34, w: 900, fill: IC.waterDk }), { o: fo });
    gr += pop(badge('0どの まま', { fill: IC.waterDk, size: 46, pad: 36 }), t, c0 + d0 * 0.6, (OX + XM) / 2, Z - 70);
    const mo = prog(t, tm - 0.1, 0.3);
    gr += g(`<line x1="${XM}" y1="${OY}" x2="${XM}" y2="${-150}" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="10 9"/>` + text(XM - 10, -178, 'ぜんぶ とけた', { size: 34, w: 900, fill: C.ochre }), { o: mo });
    gr += pop(badge('また あがる', { fill: '#e2574c', size: 36 }), t, tm + 0.8, 250, 96);
    out += pop(gr, t, c0 + 0.2, GX, GY, { d: 0.45 });
    // 入った熱は、手をはなすのに使われている
    const io = prog(t, c1 + 0.1, 0.4);
    if (io > 0) {
      const ph = ((t - c1 - 0.4) % 2.6 + 2.6) % 2.6, hit = 1.0, ap = ph < hit ? 0 : eo(clamp((ph - hit) / 0.7)), ha = clamp(ph / hit);
      let c = card(780, 150);
      c += bond(-300 - ap * 26, 0, -190 + ap * 26, 0, 1 - clamp((ph - hit) / 0.25), 10) + mol(-300 - ap * 26, 0, 30) + mol(-190 + ap * 26, 0, 30);
      c += heatDot(lerp(-400, -245, eio(ha)), lerp(-60, -6, eio(ha)), 11, ph < hit ? Math.min(1, ha * 5) : 0);
      if (ph >= hit && ph < hit + 0.4) c += `<circle cx="-245" cy="0" r="${22 + 40 * (ph - hit) / 0.4}" fill="none" stroke="${IC.heat}" stroke-width="6" opacity="${1 - (ph - hit) / 0.4}"/>`;
      c += text(-110, -30, 'はいった ねつは、', { size: 36, w: 900, anchor: 'start', fill: IC.heatDk }) + text(-110, 26, 'てを はなすのに つかわれる', { size: 36, w: 900, anchor: 'start' });
      out += g(c, { x: GX, y: 738 - (1 - eo(io)) * 20, o: io });
    }
    return out;
  },
});

// 7. くらべる：アルミの板と あわの板。1分ほどで、アルミの上は半分以上とける
SCENES.push({
  id: 'compare',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), c5 = cue(5), d5 = cueE(5) - c5, c6 = cue(6), d6 = cueE(6) - c6;
    let out = `<rect width="1920" height="1080" fill="${IC.wall}"/><rect x="0" y="790" width="1920" height="290" fill="#e7d6b8"/><rect x="0" y="560" width="1920" height="180" fill="${IC.wood}"/><rect x="0" y="560" width="1920" height="10" fill="#d6ad80"/><rect x="0" y="736" width="1920" height="58" fill="${IC.woodDk}"/>` + topBadge();
    const AX = 480, FX = 1440, BY = 600, W = 520, TH = 90, D = 64;
    const tS = c2 + d2 * 0.22, TT = Math.min(3.4, d2 * 0.5), tp = eio(prog(t, tS, TT)), late = prog(t, c5, cueE(6) - c5);
    const mA = 0.62 * tp + 0.25 * late, mF = 0.05 * tp + 0.07 * late;
    [['alu', AX, 'アルミの いた', mA], ['foam', FX, 'あわの いた', mF]].forEach(([k, x, name, m], i) => {
      out += pop(slab(0, 0, W, k, { th: TH, d: D }), t, 0.3 + i * 0.3, x, BY);
      out += g(text(x, 766, name, { size: 44, w: 900, fill: '#fff6e4' }), { o: prog(t, c1 + 0.2 + i * (cueE(1) - c1) * 0.22, 0.3) });
      // 氷：上から置く
      const dk = eo(prog(t, c2 + 0.2 + i * 0.15, 0.5));
      if (dk > 0) out += g(iceCube(x + 26, BY - 26 - (1 - dk) * 160, 150, m), { o: Math.min(1, dk * 3) });
    });
    // どちらも、部屋と同じ温度
    const so = win(t, c1 + (cueE(1) - c1) * 0.5, c2 - 0.1, 0.3);
    if (so > 0) {
      out += g(thermo(AX - 150, BY - 80, 0.5, { h: 200, s: 0.85 }) + thermo(FX - 150, BY - 80, 0.5, { h: 200, s: 0.85 }), { o: so });
      out += g(`<line x1="${AX - 100}" y1="${BY - 175}" x2="${FX - 190}" y2="${BY - 175}" stroke="${C.redUi}" stroke-width="5" stroke-dasharray="14 12"/>`, { o: so });
      out += pop(badge('どちらも へやと おなじ おんど', { fill: C.redUi, size: 44, pad: 40 }), t, c1 + (cueE(1) - c1) * 0.55, 960, 250, { end: c2 - 0.1 });
    }
    // ストップウォッチ：やく1分
    const wo = win(t, c2 + 0.3, c5 - 0.3, 0.3);
    if (wo > 0) {
      const a = prog(t, tS, TT) * 360;
      out += g(`<rect x="-14" y="-124" width="28" height="30" rx="6" fill="${C.ink}"/><circle r="96" fill="#fff" stroke="${C.ink}" stroke-width="12"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => `<line x1="0" y1="-80" x2="0" y2="${k % 3 ? -72 : -62}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" transform="rotate(${k * 30})"/>`).join('') +
        `<path d="M 0 0 L 0 -70 A 70 70 0 ${a > 180 ? 1 : 0} 1 ${70 * Math.sin(a * Math.PI / 180)} ${-70 * Math.cos(a * Math.PI / 180)} Z" fill="${C.ochre}" opacity="0.35"/><line x1="0" y1="0" x2="0" y2="-66" stroke="${C.redUi}" stroke-width="9" stroke-linecap="round" transform="rotate(${a})"/><circle r="10" fill="${C.ink}"/>`, { x: 960, y: 280, o: wo });
      out += pop(badge('やく 1ぷん', { fill: C.ochre, size: 44, pad: 36 }), t, tS + TT * 0.9, 960, 440, { end: c5 - 0.3 });
    }
    out += tag(AX + 60, BY - 70, AX + 20, 330, 'はんぶん いじょう とけた', win(t, tS + TT + 0.2, c5 - 0.3, 0.3), { col: IC.waterDk, size: 40 });
    out += tag(FX + 30, BY - 150, FX + 20, 330, 'ほとんど こおった まま', win(t, c3 + 0.4, c5 - 0.3, 0.3), { col: IC.waterDk, size: 40 });
    // おとうと
    out += kidShow('B', t, 960, 900, { s: 0.5, start: c3 + 0.3, n: 0, bubble: false, end: c5 + 0.1 });
    out += talkBubble('B', 968, 600, 962, 706, 36);
    // 熱の通り道：アルミは、下や横から どんどん流れこむ
    const ha = prog(t, c5 + 0.3, 0.5);
    if (ha > 0) {
      const tx = AX + 26, ty = BY + 8;
      for (let i = 0; i < 18; i++) {
        const f = ((t - c5) * 0.75 + rnd(i, 51)) % 1, side = i % 3, sx = side === 0 ? AX - W / 2 + 14 : side === 1 ? AX + W / 2 - 14 : AX - W / 2 + 40 + rnd(i, 52) * (W - 80), sy = side === 2 ? BY + TH - 12 : BY + 20 + rnd(i, 53) * (TH - 36);
        out += heatDot(lerp(sx, tx + (rnd(i, 54) - 0.5) * 90, eio(f)), lerp(sy, ty + 6, eio(f)), 10, Math.min(1, f * 6, (1 - f) * 5) * ha);
      }
      const pu = 8 * Math.sin(t * 5);
      out += g(arrow2(AX - W / 2 - 110 - pu, BY + 50, AX - W / 2 - 14, BY + 50, IC.heat, 14) + arrow2(AX + W / 2 + 150 + pu, BY + 30, AX + W / 2 + 50, BY + 30, IC.heat, 14), { o: ha });
      out += pop(badge('ねつを とても よく つたえる', { fill: IC.heatDk, size: 42 }), t, c5 + d5 * 0.25, AX + 30, 250);
      out += pop(badge('したや よこから ねつが ながれこむ', { fill: '#fff', color: IC.heatDk, size: 34 }), t, c5 + d5 * 0.55, AX + 30, 340);
    }
    // あわの板は、熱が通るのに長い時間がかかる
    const hf = prog(t, c6 + 0.3, 0.5);
    if (hf > 0) {
      for (let i = 0; i < 6; i++) {
        const f = ((t - c6) * 0.06 + rnd(i, 55) * 0.25) % 1, sx = FX - W / 2 + 50 + i * (W - 100) / 5, sy = BY + TH - 14;
        out += heatDot(sx + Math.sin(t * 2 + i) * 3, lerp(sy, BY + 12, f), 10, hf);
      }
      out += pop(badge('ねつを とても つたえにくい', { fill: C.blueUi, size: 42 }), t, c6 + d6 * 0.2, FX + 30, 250);
      out += pop(badge('ねつが とおるのに ながい じかん', { fill: '#fff', color: C.blueUi, size: 34 }), t, c6 + d6 * 0.6, FX + 30, 340);
    }
    return out;
  },
});

// 8. さわると、アルミは冷たく感じる：同じ温度なのに、手の熱を早くうばう
SCENES.push({
  id: 'feel',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    const AX = 480, FX = 1440, BY = 500, BW = 560, BH = 420;
    [['alu', AX, 'アルミの いた'], ['foam', FX, 'あわの いた']].forEach(([k, x, name], i) => {
      const alu = k === 'alu';
      let b = `<rect x="${-BW / 2}" y="${-BH / 2}" width="${BW}" height="${BH}" rx="26" fill="${IC.board}" filter="url(#shadow)"/>`;
      if (alu) b += `<path d="M ${-BW / 2 + 40} ${-BH / 2} h 90 l -120 ${BH} h -10 Z" fill="#fff" opacity="0.12"/><rect x="${-BW / 2}" y="${-BH / 2}" width="${BW}" height="${BH}" rx="26" fill="none" stroke="#c9d2da" stroke-width="6"/>`;
      else for (let j = 0; j < 46; j++) b += `<circle cx="${-BW / 2 + 20 + rnd(j, 71) * (BW - 40)}" cy="${-BH / 2 + 20 + rnd(j, 72) * (BH - 40)}" r="4" fill="#646b74"/>`;
      b += text(0, -BH / 2 - 44, name, { size: 48, w: 900 });
      out += pop(b, t, 0.2 + i * 0.2, x, BY);
      // 手の熱が板へ（アルミは早く・たくさん、あわはゆっくり・少し）
      const hs = c0 + d0 * 0.3;
      if (t > hs) {
        let dots = '';
        const n = alu ? 16 : 5, sp = alu ? 0.8 : 0.14, R = alu ? 300 : 120;
        for (let j = 0; j < n; j++) {
          const f = ((t - hs) * sp + j / n) % 1, a = (j / n) * Math.PI * 2 + (alu ? 0.3 : 1.1), r = lerp(90, R, f);
          dots += heatDot(x + Math.cos(a) * r, BY + 30 + Math.sin(a) * r * 0.72, 11, Math.min(1, f * 5, (1 - f) * 4) * prog(t, hs, 0.4));
        }
        out += `<clipPath id="fc${i}"><rect x="${x - BW / 2}" y="${BY - BH / 2}" width="${BW}" height="${BH}" rx="26"/></clipPath><g clip-path="url(#fc${i})">${dots}</g>`;
      }
      out += pop(handTop(0.82), t, c0 + d0 * 0.15 + i * 0.2, x, BY + 40);
      // 氷：冷たく感じる板ほど、早くとける
      const io = prog(t, c2 + 0.4 + i * 0.15, 0.4);
      if (io > 0) out += g(iceCube(x + 120, BY - 84, 96, (alu ? 0.72 : 0.06) * eio(prog(t, c2 + 0.9, Math.max(1.5, d2 - 1.2)))), { o: io });
    });
    out += pop(big(0, 0, 'ひやっ', 84, IC.waterDk, { r: -8 }), t, c0 + d0 * 0.5, AX + 170, BY - 150, { end: c2 - 0.1 });
    out += pop(big(0, 0, 'ふつう', 64, C.muted, { r: 6 }), t, c0 + d0 * 0.7, FX + 180, BY - 150, { end: c2 - 0.1 });
    // 同じ温度なのに
    const so = win(t, c1 + 0.1, c2 - 0.1, 0.3);
    out += g(thermo(900, 560, 0.5, { h: 170, s: 0.8 }) + thermo(1020, 560, 0.5, { h: 170, s: 0.8 }) + `<line x1="870" y1="${560 - (12 + 85) * 0.8}" x2="1050" y2="${560 - (12 + 85) * 0.8}" stroke="${C.redUi}" stroke-width="5" stroke-dasharray="12 10"/>`, { o: so });
    out += pop(badge('おなじ おんど', { fill: C.redUi, size: 40 }), t, c1 + 0.3, 960, 330, { end: c2 - 0.1 });
    out += pop(badge('ての ねつを はやく うばう', { fill: IC.heatDk, size: 38 }), t, c1 + d1 * 0.45, AX, 790);
    out += pop(badge('ゆっくり しか うばわない', { fill: C.blueUi, size: 38 }), t, c1 + d1 * 0.75, FX, 790);
    // まとめ
    out += pop(card(380, 300) + text(0, -86, 'つめたく', { size: 46, w: 900, fill: IC.waterDk }) + text(0, -28, 'かんじる いた ほど', { size: 38, w: 900 }) + text(0, 40, 'こおりを', { size: 38, w: 900 }) + text(0, 98, 'はやく とかす', { size: 46, w: 900, fill: IC.heatDk }), t, c2 + d2 * 0.3, 960, 500);
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
        text(-432, 2, 'アルミの いたの うえ', { size: 62, w: 900, anchor: 'start' }) + slab(330, 6, 230, 'alu', { th: 24, d: 30 }) + iceCube(342, -6, 70, 0.6), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['まわりから ねつが はいる', IC.heatDk], ['つぶが てを はなす', IC.waterDk], ['アルミは ねつを よく つたえる', C.accent]], t, 960, 660, { start: 2.4, step: 1.1, size: 34, gap: 28 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const trayIc = `<rect x="-62" y="-28" width="56" height="40" rx="8" fill="#c9d2da" stroke="#8d99a3" stroke-width="5"/><rect x="6" y="-28" width="56" height="40" rx="8" fill="#fff" stroke="#b9b3a3" stroke-width="5"/><rect x="-46" y="-40" width="24" height="24" rx="5" fill="${IC.ice}" stroke="${IC.line}" stroke-width="4"/><rect x="22" y="-40" width="24" height="24" rx="5" fill="${IC.ice}" stroke="${IC.line}" stroke-width="4"/>`;
      const handIc = `<g transform="translate(0 6)">${handTop(0.26)}</g>`;
      const items = [
        [trayIc, 'アルミの トレーと、はっぽうスチロールの トレーに', 'おなじ おおきさの こおりを のせる', C.ink, 340],
        [handIc, 'さきに りょうほう さわって、どちらの こおりが', 'はやく とけるか、よそうしてから みる', C.ink, 500],
        [warnIcon(0.9), 'こおりは、おとなに だして もらう', 'くちに いれて あそばない', C.red, 660],
      ];
      items.forEach(([ic, s1, s2, col, y], i) => {
        b += pop(ic + text(110, -28, s1, { size: 40, w: 900, anchor: 'start', fill: col }) + text(110, 30, s2, { size: 40, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 190, y);
      });
      // 2つのトレー
      const c1 = cue(1);
      let p = card(470, 280);
      p += `<rect x="-200" y="20" width="170" height="54" rx="12" fill="#c9d2da" stroke="#8d99a3" stroke-width="6"/><rect x="-190" y="28" width="150" height="14" rx="7" fill="#fff" opacity="0.5"/>` + iceCube(-118, 30, 70, 0.55 * eio(prog(t, c1 + 2.0, 8)));
      p += `<rect x="30" y="20" width="170" height="54" rx="12" fill="#fff" stroke="#b9b3a3" stroke-width="6"/>` + iceCube(112, 30, 70, 0.05 * prog(t, c1 + 2.0, 8));
      p += text(-115, 108, 'アルミ', { size: 32, w: 900 }) + text(115, 108, 'はっぽうスチロール', { size: 26, w: 900 }) + text(0, -100, 'どっちが はやい？', { size: 36, w: 900, fill: C.ochre });
      b += pop(p, t, c1 + 0.6, 1610, 330);
      b += kidShow('K', t, 1690, 810, { s: 0.8, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「こおり」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

// ---------- つめと かみの道具 ----------
const SKIN = '#f6d6bd', SKIN2 = '#ecc0a2', SKIN3 = '#e2ad8c', HAIRC = '#4b3226';
const BED = '#f0a7a3', NAILW = '#fbf6ec', MATRIX = '#e58f7c';
let CLIPN = 0;
// 指を横から切って見た絵（右向き、指先が右）。flow: つめが押し出される動き
function fingerSide(x, y, s, t, { flow = 0, bedGlow = 0, matrixGlow = 0, sensor = 0, cutLine = 0, tipLen = 70 } = {}) {
  const id = 'fs' + (CLIPN++);
  const tipX = 140 + tipLen;
  let b = `<path d="M -760 -92 L 40 -92 Q 160 -92 160 10 Q 160 112 40 112 L -760 112 Z" fill="${SKIN}"/>`;
  b += `<path d="M -760 112 L 40 112 Q 120 112 150 50" fill="none" stroke="${SKIN2}" stroke-width="10" stroke-linecap="round"/>`;
  // 爪床（つめの下のやわらかいところ）
  b += `<rect x="-260" y="-92" width="390" height="34" rx="12" fill="${BED}"/>`;
  for (let k = 0; k < 6; k++) b += `<line x1="${-240 + k * 62}" y1="-62" x2="${-200 + k * 62}" y2="-62" stroke="#d65b5b" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
  if (bedGlow > 0) b += `<rect x="-266" y="-98" width="402" height="46" rx="16" fill="none" stroke="${C.red}" stroke-width="7" opacity="${bedGlow * (0.6 + 0.4 * Math.sin(t * 5))}"/>`;
  if (sensor > 0) for (let k = 0; k < 5; k++) b += `<circle cx="${-210 + k * 80}" cy="-74" r="${9 + 3 * Math.sin(t * 6 + k)}" fill="${C.yellow}" stroke="${C.ochre}" stroke-width="3" opacity="${sensor}"/>`;
  // 根元（つめを作るところ）
  b += `<path d="M -380 -96 Q -390 -60 -350 -54 L -260 -58 L -260 -96 Z" fill="${MATRIX}"/>`;
  if (matrixGlow > 0) b += `<ellipse cx="-320" cy="-76" rx="${84 + 6 * Math.sin(t * 5)}" ry="${44 + 4 * Math.sin(t * 5)}" fill="none" stroke="${C.ochre}" stroke-width="7" opacity="${matrixGlow}"/>`;
  // つめの板
  const plate = `M -370 -112 L ${tipX - 20} -112 Q ${tipX} -112 ${tipX} -98 Q ${tipX} -88 ${tipX - 20} -88 L -370 -88 Z`;
  b += `<clipPath id="${id}"><path d="${plate}"/></clipPath>`;
  b += `<g clip-path="url(#${id})"><rect x="-380" y="-120" width="${tipX + 400}" height="40" fill="${NAILW}" opacity="0.62"/><rect x="130" y="-120" width="${tipX}" height="40" fill="${NAILW}"/>`;
  if (flow > 0) for (let k = -2; k < 18; k++) {
    const xx = -380 + ((k * 40 + t * 28) % 760);
    b += `<line x1="${xx}" y1="-114" x2="${xx}" y2="-86" stroke="#d9c9ae" stroke-width="4" opacity="${0.8 * flow}"/>`;
  }
  b += `</g><path d="${plate}" fill="none" stroke="#cdb998" stroke-width="4"/>`;
  // 根元の皮ふ（つめの根元をおおう）
  b += `<path d="M -460 -92 L -460 -100 Q -380 -150 -262 -112 L -262 -92 Z" fill="${SKIN}"/><path d="M -460 -100 Q -380 -150 -262 -112" fill="none" stroke="${SKIN2}" stroke-width="6"/>`;
  if (cutLine > 0) b += g(`<line x1="${tipX - 34}" y1="-150" x2="${tipX - 34}" y2="-60" stroke="${C.red}" stroke-width="7" stroke-dasharray="12 9"/>`, { o: cutLine });
  return g(b, { x, y, s });
}
// 上から見た指とつめ（指先が上）
function fingerTop(x, y, s, t, { hl = null, lunula = 1, tip = 1, base = 330 } = {}) {
  let b = `<path d="M -110 ${base} L -110 -120 Q -110 -230 0 -230 Q 110 -230 110 -120 L 110 ${base} Z" fill="${SKIN}"/>`;
  b += `<path d="M -78 -150 Q -78 -205 0 -205 Q 78 -205 78 -150 L 78 40 Q 78 60 58 60 L -58 60 Q -78 60 -78 40 Z" fill="${BED}"/>`;
  b += `<path d="M -70 -150 L -70 30 M 70 -150 L 70 30" stroke="#e48d8b" stroke-width="5" opacity="0.6"/>`;
  // 白い先
  if (tip > 0) b += `<path d="M -80 -170 Q -80 -258 0 -258 Q 80 -258 80 -170 Q 40 -190 0 -190 Q -40 -190 -80 -170 Z" fill="${NAILW}" stroke="#e3d6bd" stroke-width="4"/>`;
  // 白い三日月
  if (lunula > 0) b += `<path d="M -50 60 Q -50 8 0 8 Q 50 8 50 60 Z" fill="#fbe4dc" opacity="${0.9 * lunula}"/>`;
  b += `<path d="M -78 -150 Q -78 -205 0 -205 Q 78 -205 78 -150 L 78 40 Q 78 60 58 60 L -58 60 Q -78 60 -78 40 Z" fill="#fff" opacity="0.18" stroke="#e8b9b0" stroke-width="5"/>`;
  b += `<path d="M -84 64 Q 0 40 84 64 L 84 90 L -84 90 Z" fill="${SKIN}"/><path d="M -84 64 Q 0 40 84 64" fill="none" stroke="${SKIN2}" stroke-width="6"/>`;
  if (base > 270) b += `<path d="M -60 200 Q 0 214 60 200 M -60 250 Q 0 262 60 250" fill="none" stroke="${SKIN2}" stroke-width="6" stroke-linecap="round"/>`;
  else if (base > 150) b += `<path d="M -60 140 Q 0 154 60 140" fill="none" stroke="${SKIN2}" stroke-width="6" stroke-linecap="round"/>`;
  if (hl === 'pink') b += `<path d="M -84 -150 L 84 -150 L 84 66 L -84 66 Z" fill="none" stroke="${C.red}" stroke-width="8" stroke-dasharray="16 10" opacity="${0.7 + 0.3 * Math.sin(t * 5)}"/>`;
  if (hl === 'tip') b += `<ellipse cx="0" cy="-212" rx="104" ry="64" fill="none" stroke="${C.blueUi}" stroke-width="8" stroke-dasharray="16 10" opacity="${0.7 + 0.3 * Math.sin(t * 5)}"/>`;
  if (hl === 'lunula') b += `<ellipse cx="0" cy="40" rx="76" ry="46" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-dasharray="16 10" opacity="${0.7 + 0.3 * Math.sin(t * 5)}"/>`;
  return g(b, { x, y, s });
}
// 頭の皮ふを切って見た絵。grow: 髪ののび、cells: 根元の細胞がふえるようす
function scalp(x, y, s, t, { len = 260, cells = 0, deadLabel = 0, flow = 1 } = {}) {
  const id = 'sc' + (CLIPN++);
  let b = `<rect x="-330" y="0" width="660" height="340" rx="24" fill="#f7dccb"/><rect x="-330" y="0" width="660" height="40" fill="#efc2a6"/>`;
  b += `<path d="M -40 0 L -40 230 Q -40 250 -20 260 M 40 0 L 40 230 Q 40 250 20 260" fill="none" stroke="#e2a98e" stroke-width="10"/>`;
  b += `<ellipse cx="0" cy="262" rx="64" ry="54" fill="#e8a08a"/><ellipse cx="0" cy="290" rx="26" ry="22" fill="#cf6f66"/>`;
  // 髪（根元から上へ）
  const top = -len;
  b += `<clipPath id="${id}"><rect x="-14" y="${top}" width="28" height="${len + 250}" rx="14"/></clipPath>`;
  b += `<g clip-path="url(#${id})"><rect x="-14" y="${top}" width="28" height="${len + 250}" fill="${HAIRC}"/>`;
  if (flow > 0) for (let k = 0; k < 20; k++) { const yy = 250 - ((k * 40 + t * 22) % 800); b += `<line x1="-14" y1="${yy}" x2="14" y2="${yy - 6}" stroke="#6b4a36" stroke-width="5"/>`; }
  b += `</g>`;
  if (cells > 0) for (let k = 0; k < 7; k++) {
    const a = k * 0.9 + t * 0.6, ph = (t * 0.9 + k / 7) % 1;
    b += `<circle cx="${Math.cos(a) * 34}" cy="${250 + Math.sin(a) * 18 - ph * 20}" r="${8 + 4 * Math.sin(ph * Math.PI)}" fill="#fff3ea" stroke="#c96a60" stroke-width="3" opacity="${cells}"/>`;
  }
  return g(b, { x, y, s });
}
// 細胞（k: 0 生きている → 1 ケラチンでいっぱい・生きていない）
function cellK(x, y, k, t, i = 0) {
  const rx = lerp(42, 56, k), ry = lerp(40, 18, k);
  let b = `<ellipse rx="${rx}" ry="${ry}" fill="${mix('#f7c1b5', '#f1e2b8', k)}" stroke="${mix('#de8e82', '#cdb98a', k)}" stroke-width="5"/>`;
  if (k > 0.15) for (let j = -2; j <= 2; j++) b += `<line x1="${-rx * 0.7}" y1="${j * ry * 0.3}" x2="${rx * 0.7}" y2="${j * ry * 0.3}" stroke="#c9a65a" stroke-width="4" opacity="${clamp((k - 0.15) * 1.6)}"/>`;
  if (k < 0.85) {
    const o = 1 - clamp(k / 0.85);
    b += `<circle cx="${rx * 0.36}" cy="${ry * 0.1}" r="${11 * o + 2}" fill="#c9746a" opacity="${o}"/>`;
    const ey = -ry * 0.25;
    b += `<g opacity="${o}"><circle cx="-14" cy="${ey}" r="4.5" fill="${C.ink}"/><circle cx="2" cy="${ey}" r="4.5" fill="${C.ink}"/><path d="M -12 ${ey + 12} Q -6 ${ey + 17} 0 ${ey + 12}" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/></g>`;
  }
  return g(b, { x, y: y + Math.sin(t * 3 + i) * 2 * (1 - k) });
}
// 爪切り・はさみ
const clipper = (o = 0) => `<rect x="-120" y="6" width="240" height="24" rx="12" fill="#9aa4ad"/><g transform="rotate(${-o * 6} -120 4)"><rect x="-120" y="-20" width="240" height="24" rx="12" fill="#c3cad0"/></g><path d="M 112 -18 Q 132 4 112 28" fill="none" stroke="#6f7a83" stroke-width="8" stroke-linecap="round"/><g transform="rotate(${o * 10} 60 -24)"><path d="M 60 -24 L -150 -84 Q -168 -88 -164 -70 L -150 -62 L 60 -12 Z" fill="#d9dfe4" stroke="#9aa4ad" stroke-width="4"/></g><circle cx="60" cy="-18" r="12" fill="#6f7a83"/>`;
const scissors = (o = 0) => {
  const a = 14 * o;
  return `<g transform="rotate(${-a})"><path d="M 0 0 L 150 -10 L 150 4 Z" fill="#b8c0c7"/><circle cx="-56" cy="-20" r="30" fill="none" stroke="${C.redUi}" stroke-width="12"/></g>` +
    `<g transform="rotate(${a})"><path d="M 0 0 L 150 10 L 150 -4 Z" fill="#9aa4ad"/><circle cx="-56" cy="20" r="30" fill="none" stroke="${C.redUi}" stroke-width="12"/></g><circle r="8" fill="#6f7a83"/>`;
};
// 髪のたば（hook用）。cut: 切った量、fall: 落ちる
function hairLock(x, y, t, cutK = 0) {
  let b = '';
  for (let i = 0; i < 7; i++) {
    const dx = -60 + i * 20, w = Math.sin(t * 1.5 + i) * 6;
    b += `<path d="M ${dx} -260 Q ${dx + 14 + w} -60 ${dx - 6} 120" fill="none" stroke="${HAIRC}" stroke-width="16" stroke-linecap="round"/>`;
  }
  if (cutK > 0) {
    const fy = eio(clamp(cutK)) * 150, o = 1 - clamp((cutK - 0.3) / 0.4);
    let f = '';
    for (let i = 0; i < 7; i++) { const dx = -60 + i * 20; f += `<path d="M ${dx - 2} 120 Q ${dx - 4} 170 ${dx - 6} 210" fill="none" stroke="${HAIRC}" stroke-width="16" stroke-linecap="round"/>`; }
    b += g(f, { y: fy, o, r: cutK * 10 });
  } else {
    for (let i = 0; i < 7; i++) { const dx = -60 + i * 20; b += `<path d="M ${dx - 6} 120 Q ${dx - 6} 170 ${dx - 6} 210" fill="none" stroke="${HAIRC}" stroke-width="16" stroke-linecap="round"/>`; }
  }
  return g(b, { x, y });
}
// 手の甲（look用）
function handBack(x, y, s, t) {
  let b = `<rect x="-190" y="40" width="380" height="330" rx="90" fill="${SKIN}"/>`;
  const F = [[-150, -40, -14, 0.82], [-62, -150, -4, 1], [30, -170, 2, 1.04], [118, -130, 8, 0.96], [-250, 120, -40, 0.9]];
  F.forEach(([fx, fy, r, sc], i) => {
    b += `<g transform="translate(${fx + 20} ${fy + 160}) rotate(${r}) scale(${sc})"><rect x="-40" y="-170" width="80" height="230" rx="40" fill="${SKIN}"/>` +
      `<rect x="-26" y="-150" width="52" height="74" rx="22" fill="${BED}"/><path d="M -26 -146 Q 0 -168 26 -146" fill="${NAILW}" stroke="#e3d6bd" stroke-width="3"/>` +
      `<path d="M -${14 + (i === 4 ? 6 : 0)} -76 Q 0 ${-100 - (i === 4 ? 6 : 0)} ${14 + (i === 4 ? 6 : 0)} -76 Z" fill="#fbe4dc"/></g>`;
  });
  return g(b, { x, y, s });
}
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 42 } = {}) => {
  if (o <= 0) return '';
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` + g(badge(str, { fill: col, size }), { x: tx, y: ty }), { o });
};
const arrowR = (x1, y, x2, col = C.ink, w = 10) => `<path d="M ${x1} ${y} L ${x2} ${y} M ${x2 - 26} ${y - 22} L ${x2} ${y} L ${x2 - 26} ${y + 22}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// 1. つかみ：つめを ぱちん、髪を ちょきちょき
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#f4f0e6"/>`;
    // A つめ
    const aO = prog(t, 0.3, 0.5);
    const cutT = cue(0) + 1.4, ck = prog(t, cutT, 0.25);
    let a = card(520, 640) + fingerTop(0, 40, 0.85, t, { tip: 1 - ck, base: 250 });
    if (ck > 0) a += g(`<path d="M -80 -170 Q -80 -258 0 -258 Q 80 -258 80 -170 Q 40 -190 0 -190 Q -40 -190 -80 -170 Z" fill="${NAILW}" stroke="#e3d6bd" stroke-width="4"/>`, { s: 0.85, x: 0, y: 40 + eio(prog(t, cutT, 1.0)) * 120, o: 1 - prog(t, cutT + 0.7, 0.4), r: ck * 20 });
    a += g(clipper(1 - ck), { x: 20, y: -230, s: 0.7, o: win(t, cue(0) + 0.6, cutT + 0.8, 0.3) });
    a += g(text(0, 0, 'ぱちん！', { size: 58, w: 900, fill: C.ochre }), { x: 150, y: -110, o: win(t, cutT, cutT + 1.4, 0.2) });
    out += g(a, { x: 470, y: 440, o: aO, s: lerp(0.94, 1, eo(aO)) });
    // B 髪
    const bO = prog(t, cue(0) + 1.8, 0.5);
    if (bO > 0) {
      const cT = cue(0) + 2.8, hk = prog(t, cT, 1.6);
      let b = card(520, 640) + hairLock(0, 40, t, hk);
      const sn = Math.abs(Math.sin(clamp((t - (cT - 0.8)) / 1.2) * Math.PI * 3));
      b += g(scissors(sn), { x: -150, y: 160, o: win(t, cT - 0.8, cT + 1.0, 0.3) });
      b += g(text(0, 0, 'ちょきちょき', { size: 50, w: 900, fill: C.ochre }), { x: 60, y: -270, o: win(t, cT - 0.6, cT + 1.6, 0.2) });
      out += g(b, { x: 1080, y: 440, o: bO, s: lerp(0.94, 1, eo(bO)) });
    }
    out += pop(badge('いたくない', { fill: C.accent, size: 48 }), t, cue(1) + 0.4, 1440, 190, { end: cueE(3) + 0.4 });
    out += kidShow('B', t, 1650, 840, { s: 0.55, start: 0.6, n: 0, side: 'left' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1700, y: 200, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#c46b62">つめ</tspan>や <tspan fill="#7a5638">かみ</tspan>は、</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして きっても <tspan fill="${C.accent}">いたくない</tspan>？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = g(clipper(0), { x: -150, s: 0.6 }) + g(scissors(0.5), { x: 60, s: 0.7 }) + text(220, -10, '？', { size: 90, w: 900, fill: C.ochre });
      out += pop(ic, t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと思う？', { size: 84, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'つめや かみは、とても かたいから'], ['②', 'からだが、いたみを がまんしているから'], ['③', 'みえている ところは、もう いきていないから']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 48, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(g(clipper(0), { s: 0.6 }) + text(110, -40, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1700, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 根元で作られて、押し出される
SCENES.push({
  id: 'root',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sh = eio(prog(t, cue(2) - 0.4, 0.9));
    const FX = lerp(1080, 760, sh), FY = lerp(470, 330, sh), FS = lerp(1.15, 0.75, sh);
    out += fingerSide(FX, FY, FS, t, { flow: prog(t, cue(1) + 0.4, 0.5), matrixGlow: win(t, cue(0) + 1.2, cue(2) - 0.3, 0.4) });
    out += pop(badge('ゆびを よこから みると', { fill: C.muted, size: 36 }), t, 0.3, 960, 92, { end: cue(1) + 1.2 });
    out += callout(FX - 320 * FS, FY - 76 * FS, FX - 520 * FS, FY + 150 * FS, 'つめの ねもと', win(t, cue(0) + 1.4, cue(2) - 0.3, 0.3), { col: '#c25a4a', size: 42 });
    out += callout(FX - 100 * FS, FY - 100 * FS, FX - 40 * FS, FY - 250 * FS, 'つめ', prog(t, cue(0) + 0.6, 0.3) * (1 - prog(t, cue(1), 0.3)), { col: C.ochre, size: 40 });
    // 新しい細胞が押し出す
    const fO = win(t, cue(1) + 0.2, cue(2) - 0.3, 0.4);
    if (fO > 0) {
      for (let i = 0; i < 6; i++) {
        const ph = (t * 0.25 + i / 6) % 1;
        const x = FX + lerp(-330, -60, ph) * FS, y = FY - 100 * FS;
        out += g(`<circle r="${14 * FS}" fill="#f7c1b5" stroke="#de8e82" stroke-width="3"/>`, { x, y: y + 2, o: fO * Math.min(1, (1 - ph) * 4) });
      }
      out += g(arrowR(FX - 160 * FS, FY - 180 * FS, FX + 120 * FS, C.ochre, 12), { o: fO });
      out += pop(badge('おしだす', { fill: C.ochre, size: 44 }), t, cue(1) + 1.6, FX + 260 * FS, FY - 180 * FS, { end: cue(2) - 0.3 });
    }
    // 髪も同じ
    const hO = prog(t, cue(2) - 0.1, 0.5);
    if (hO > 0) {
      const len = lerp(170, 280, eio(prog(t, cue(2) + 0.6, 4.5)));
      out += g(card(760, 600), { x: 1400, y: 500, o: hO });
      out += g(scalp(1400, 470, 0.8, t, { len, cells: 1 }), { o: hO });
      out += g(badge('かみも おなじ', { fill: '#7a5638', size: 44 }), { x: 1400, y: 150, o: hO });
      out += callout(1400, 470 + 262 * 0.8, 1640, 720, 'ねもと', prog(t, cue(2) + 1.6, 0.3), { col: '#c25a4a', size: 40 });
    }
    return out;
  },
});

// 4. ケラチンでいっぱいになって、生きるのをやめる
SCENES.push({
  id: 'keratin',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#fbf4ea"/>` + topBadge();
    // ベルトのように細胞が右へ進みながら変わる
    const bO = prog(t, 0.2, 0.5) * (1 - prog(t, cue(2) - 0.3, 0.4) * 0.7);
    const run = prog(t, cue(0) + 0.6, 0.5);
    const N = 9, X0 = 260, X1 = 1660;
    let belt = `<rect x="${X0 - 80}" y="420" width="${X1 - X0 + 160}" height="120" rx="60" fill="#efe3cf"/>`;
    for (let i = 0; i < N; i++) {
      const ph = ((i / N) + t * 0.035 * run) % 1;
      const x = lerp(X0, X1, ph), k = clamp((ph - 0.25) / 0.55) * prog(t, cue(0) + 1.0, 1.5);
      belt += g(cellK(x, 480, cue(1) - 0.4 > t ? Math.min(k, 0.7) : k, t, i), { o: Math.min(1, ph * 12, (1 - ph) * 12) });
    }
    belt += g(badge('いきている', { fill: '#d9776b', size: 40 }), { x: X0 + 40, y: 340 });
    belt += g(badge('ケラチンで いっぱい', { fill: '#b8923e', size: 40 }), { x: 960, y: 340, o: prog(t, cue(0) + 2.2, 0.4) });
    belt += g(badge('もう いきていない', { fill: C.muted, size: 40 }), { x: X1 - 60, y: 340, o: prog(t, cue(1) + 0.4, 0.4) });
    belt += g(arrowR(X0 + 120, 640, X1 - 120, '#c9b48e', 12), {});
    belt += g(text(960, 700, 'おしだされる', { size: 40, w: 900, fill: '#a8916a' }), {});
    out += g(belt, { o: bO });
    out += pop(badge('ケラチン ＝ かたい たんぱくしつ', { fill: '#b8923e', size: 42 }), t, cue(0) + 3.6, 960, 180, { end: cue(2) - 0.3 });
    // だから、見えているところは生きていない
    const cO = prog(t, cue(2) - 0.1, 0.5);
    if (cO > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.9 * cO}"/>`;
      let c = card(620, 520) + fingerTop(0, 70, 0.62, t, { base: 180 }) + g(`<ellipse cx="0" cy="${70 - 212 * 0.62}" rx="80" ry="54" fill="none" stroke="${C.muted}" stroke-width="7" stroke-dasharray="14 9"/>`, {});
      c += text(0, -210, 'つめ', { size: 48, w: 900, fill: '#c46b62' });
      let d = card(620, 520) + `<rect x="-300" y="80" width="600" height="150" rx="0" fill="#f7dccb"/><rect x="-300" y="80" width="600" height="26" fill="#efc2a6"/>`;
      for (let i = 0; i < 5; i++) d += `<path d="M ${-120 + i * 60} 90 Q ${-110 + i * 60 + Math.sin(t + i) * 8} -40 ${-130 + i * 60} -150" fill="none" stroke="${HAIRC}" stroke-width="16" stroke-linecap="round"/>`;
      d += `<rect x="-200" y="-160" width="400" height="240" fill="none" stroke="${C.muted}" stroke-width="7" stroke-dasharray="14 9" rx="20"/>` + text(0, -210, 'かみ', { size: 48, w: 900, fill: '#7a5638' });
      out += g(c, { x: 620, y: 470, o: cO, s: lerp(0.95, 1, eo(cO)) });
      out += g(d, { x: 1300, y: 470, o: cO, s: lerp(0.95, 1, eo(cO)) });
      out += pop(badge('みえている ところは もう いきていない', { fill: C.muted, size: 46 }), t, cue(2) + 1.4, 960, 160);
    }
    return out;
  },
});

// 5. すき通る・ピンク・白い先・白い三日月
SCENES.push({
  id: 'clear',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const hl = t > cue(3) - 0.2 ? 'lunula' : t > cue(2) - 0.2 ? 'tip' : t > cue(1) - 0.2 ? 'pink' : null;
    out += fingerTop(640, 560, 1.15, t, { hl, base: 200 });
    // A 核がない → すき通る
    const aO = win(t, cue(0) + 0.4, cue(1) - 0.2, 0.4);
    if (aO > 0) {
      let a = card(640, 360);
      a += cellK(-180, -40, 0, t) + text(-180, 60, 'かく が ある', { size: 34, w: 900, fill: '#c9746a' });
      a += arrowR(-90, -40, 60, C.ink, 8);
      a += cellK(170, -40, 1, t) + text(170, 60, 'かく が ない', { size: 34, w: 900, fill: C.muted });
      a += g(badge('すきとおる', { fill: C.blueUi, size: 42 }), { x: 0, y: 130, o: prog(t, cue(0) + 3.4, 0.4) });
      out += g(a, { x: 1340, y: 420, o: aO, s: lerp(0.95, 1, eo(aO)) });
    }
    // B ピンク
    const bO = win(t, cue(1) - 0.1, cue(2) - 0.2, 0.4);
    if (bO > 0) {
      let b = card(640, 300) + `<rect x="-240" y="-60" width="480" height="70" rx="20" fill="${BED}"/>`;
      for (let k = 0; k < 6; k++) b += `<line x1="${-210 + k * 80}" y1="-24" x2="${-160 + k * 80}" y2="-24" stroke="#d65b5b" stroke-width="7" stroke-linecap="round"/>`;
      b += `<rect x="-250" y="-100" width="500" height="40" rx="14" fill="${NAILW}" opacity="0.55" stroke="#cdb998" stroke-width="4"/>`;
      b += text(-250, -124, 'すきとおった つめ', { size: 30, w: 900, fill: '#a8916a', anchor: 'start' });
      b += text(0, 80, 'したの ちの いろが みえる', { size: 40, w: 900, fill: C.red });
      out += g(b, { x: 1340, y: 420, o: bO, s: lerp(0.95, 1, eo(bO)) });
      out += pop(badge('ピンク', { fill: '#d46f6c', size: 44 }), t, cue(1) + 0.6, 640, 140);
    }
    // C 白い先
    const cO = win(t, cue(2) - 0.1, cue(3) - 0.2, 0.4);
    if (cO > 0) {
      let c = card(640, 300);
      c += `<path d="M -260 30 L 120 30 Q 200 30 200 90 L -260 90 Z" fill="${SKIN}"/><rect x="-260" y="0" width="300" height="30" fill="${BED}"/>`;
      c += `<rect x="-260" y="-30" width="300" height="30" fill="${NAILW}" opacity="0.55"/><rect x="40" y="-30" width="210" height="30" rx="12" fill="${NAILW}" stroke="#e3d6bd" stroke-width="4"/>`;
      for (let k = 0; k < 4; k++) { const ph = (t * 0.8 + k / 4) % 1; c += `<path d="M ${-220 + k * 70} ${20 - ph * 34} q 8 12 0 18 q -8 -6 0 -18 Z" fill="#6aaee0" opacity="${1 - ph}"/>`; }
      c += cross(150, -50, 0.35, C.blueUi) + text(150, -100, 'みず', { size: 30, w: 900, fill: C.blueUi });
      c += text(0, 130, 'みずが とどかない → しろい', { size: 38, w: 900, fill: C.blueUi });
      out += g(c, { x: 1340, y: 420, o: cO, s: lerp(0.95, 1, eo(cO)) });
      out += pop(badge('しろい さき', { fill: C.blueUi, size: 44 }), t, cue(2) + 0.6, 640, 140);
    }
    // D 白い三日月
    const dO = prog(t, cue(3) - 0.1, 0.4);
    if (dO > 0) {
      out += pop(badge('しろい みかづき', { fill: C.ochre, size: 44 }), t, cue(3) + 0.6, 640, 140);
      out += g(badge('つめを つくる ところの さき', { fill: C.ochre, size: 40 }), { x: 1300, y: 380, o: prog(t, cue(3) + 1.4, 0.4) });
      out += g(`<line x1="${640 + 70 * 1.15}" y1="${560 + 40 * 1.15}" x2="1080" y2="410" stroke="${C.ochre}" stroke-width="5"/>`, { o: prog(t, cue(3) + 1.4, 0.4) });
    }
    out += kidShow('K', t, 1720, 850, { s: 0.5, start: cue(4) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 6. ピンクの下は生きている・白い先を残して切る・つめの役目
SCENES.push({
  id: 'sensor',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sh = eio(prog(t, cue(2) - 0.4, 0.8));
    const FX = lerp(1080, 820, sh), FY = lerp(500, 380, sh), FS = lerp(1.15, 0.72, sh);
    out += fingerSide(FX, FY, FS, t, { bedGlow: win(t, cue(0) + 0.4, cue(1) + 0.4, 0.4), sensor: win(t, cue(0) + 2.4, cue(1) + 0.4, 0.4), cutLine: win(t, cue(1) + 0.6, cue(2) - 0.2, 0.3) });
    out += callout(FX - 60 * FS, FY - 60 * FS, FX - 200 * FS, FY + 230 * FS, 'いきている', win(t, cue(0) + 0.8, cue(1) + 0.4, 0.3), { col: C.red, size: 42 });
    out += pop(badge('ちの くだ ・ センサー', { fill: C.red, size: 40 }), t, cue(0) + 2.6, FX + 300 * FS, FY - 280 * FS, { end: cue(1) + 0.4 });
    // 白い先をのこして切る
    const kO = win(t, cue(1) + 0.4, cue(2) - 0.2, 0.3);
    if (kO > 0) {
      out += g(g(clipper(Math.abs(Math.sin(t * 3))), { s: 0.7 }), { x: FX + 260 * FS, y: FY - 250 * FS, o: kO });
      out += pop(badge('しろい さきを のこす', { fill: C.blueUi, size: 42 }), t, cue(1) + 1.2, FX - 200 * FS, FY - 300 * FS, { end: cue(2) - 0.2 });
      out += callout(FX + 145 * FS, FY - 60 * FS, FX + 300 * FS, FY + 220 * FS, 'このしたは ゆびさき', prog(t, cue(1) + 2.4, 0.3) * kO, { col: C.redUi, size: 38 });
    }
    // つめの役目
    const jO = prog(t, cue(2) - 0.1, 0.5);
    if (jO > 0) {
      let j = card(560, 380);
      j += `<rect x="-250" y="-100" width="270" height="70" rx="35" fill="${SKIN}"/><rect x="-90" y="-112" width="90" height="18" rx="9" fill="${NAILW}" stroke="#cdb998" stroke-width="3"/>`;
      j += `<rect x="-250" y="40" width="250" height="70" rx="35" fill="${SKIN2}"/>`;
      j += `<circle cx="20" cy="5" r="26" fill="${C.ochre}"/><circle cx="12" cy="-4" r="8" fill="#fff" opacity="0.5"/>`;
      j += text(0, 140, 'ちいさな ものを つまむ', { size: 36, w: 900 });
      out += g(j, { x: 1400, y: 640, o: jO, s: lerp(0.95, 1, eo(jO)) });
      out += pop(badge('ゆびさきを まもる', { fill: C.accent, size: 42 }), t, cue(2) + 0.8, 820, 640);
    }
    return out;
  },
});

// 7. 髪：根元で作られて、外は生きていない
SCENES.push({
  id: 'hair',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#f6f1ea"/>` + topBadge();
    const len = lerp(300, 400, eio(prog(t, 0.4, 10)));
    out += scalp(820, 520, 1.0, t, { len, cells: prog(t, cue(0) + 0.8, 0.4) });
    out += g(text(0, 0, 'あたまの ひふ', { size: 36, w: 900, fill: '#b9806a' }), { x: 1000, y: 560, o: prog(t, 0.6, 0.4) });
    out += callout(820, 520 + 262, 1180, 760, 'かみの もとの さいぼう', prog(t, cue(0) + 1.2, 0.3), { col: '#c25a4a', size: 40 });
    // 外に出ている髪は生きていない
    const dO = prog(t, cue(1) + 0.4, 0.4);
    out += g(`<rect x="${820 - 40}" y="${520 - len}" width="80" height="${len - 8}" rx="30" fill="none" stroke="${C.muted}" stroke-width="7" stroke-dasharray="14 9"/>`, { o: dO });
    out += callout(820 + 40, 520 - len * 0.6, 1180, 520 - len * 0.6, 'もう いきていない', dO, { col: C.muted, size: 40 });
    // はさみ
    const sO = prog(t, cue(2) - 0.1, 0.4);
    if (sO > 0) {
      const sn = Math.abs(Math.sin(clamp((t - cue(2)) / 1.4) * Math.PI * 3));
      out += g(scissors(sn), { x: 680, y: 520 - len * 0.75, o: sO });
      out += pop(badge('きっても いたくない', { fill: C.accent, size: 46 }), t, cue(2) + 1.0, 1350, 150);
    }
    return out;
  },
});

// 8. のびる速さと、35年はかったお医者さん
SCENES.push({
  id: 'speed',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      let a = card(1200, 460) + text(0, -170, '1にちに のびる ながさ（おとな）', { size: 44, w: 900 });
      const k1 = eo(prog(t, cue(0) + 0.6, 0.8)), k2 = eo(prog(t, cue(0) + 2.6, 1.0));
      a += g(fingerTop(0, 0, 0.18, t), { x: -470, y: -40 }) + `<rect x="-380" y="-60" width="${180 * k1}" height="44" rx="22" fill="#e08f86"/>` + text(-380 + 180 * k1 + 20, -38, 'つめ やく 0.1ミリ', { size: 40, w: 900, anchor: 'start', fill: '#c46b62' });
      a += `<path d="M -490 60 Q -470 100 -480 140 M -470 60 Q -450 100 -460 140 M -450 60 Q -430 100 -440 140" fill="none" stroke="${HAIRC}" stroke-width="10" stroke-linecap="round"/>` + `<rect x="-380" y="80" width="${540 * k2}" height="44" rx="22" fill="#8a6446"/>` + g(text(-380 + 540 * k2 + 20, 102, 'かみ やく 0.3ミリ', { size: 40, w: 900, anchor: 'start', fill: '#7a5638' }), { o: k2 });
      out += g(a, { x: 960, y: 470, o: aO * prog(t, cue(0) - 0.1, 0.4) });
    }
    // ビーンさん
    const bO = prog(t, cue(1) - 0.1, 0.5);
    if (bO > 0) {
      out += pop(badge('アメリカの おいしゃさん ビーンさん', { fill: C.blueUi, size: 42 }), t, cue(1) + 0.2, 960, 160);
      // 親指のつめと印
      const mk = (t * 0.12) % 1;
      let th = fingerTop(0, 0, 0.75, t);
      th += `<line x1="-55" y1="${lerp(30, -110, mk) * 0.75}" x2="55" y2="${lerp(30, -110, mk) * 0.75}" stroke="${C.blueUi}" stroke-width="8" stroke-linecap="round"/>`;
      out += g(th, { x: 640, y: 560, o: bO });
      out += g(text(0, 0, 'しるし', { size: 36, w: 900, fill: C.blueUi }), { x: 780, y: 560 + lerp(30, -110, mk) * 0.75, o: bO });
      // 年をかぞえる
      const yrs = Math.min(35, Math.floor(clamp((t - cue(1) - 1.2) / 3.4) * 35));
      let c = card(520, 300) + text(0, -70, 'はかりつづけた', { size: 40, w: 900, fill: C.muted }) + text(0, 30, `${yrs}ねん`, { size: 110, w: 900, fill: C.blueUi });
      out += g(c, { x: 1150, y: 400, o: bO * (1 - prog(t, cue(3) - 0.2, 0.4)) });
      // 年をとると、おそくなる
      const sO = prog(t, cue(3) - 0.1, 0.4);
      if (sO > 0) {
        const k1 = eo(prog(t, cue(3) + 0.4, 0.8)), k2 = eo(prog(t, cue(3) + 1.6, 0.8));
        let s = card(640, 360) + text(0, -120, '1にちに のびる ながさ', { size: 38, w: 900 });
        s += text(-270, -30, '32さい', { size: 36, w: 900, anchor: 'start' }) + `<rect x="-130" y="-52" width="${370 * k1}" height="44" rx="22" fill="#e08f86"/>`;
        s += text(-270, 60, '67さい', { size: 36, w: 900, anchor: 'start' }) + `<rect x="-130" y="38" width="${286 * k2}" height="44" rx="22" fill="#e9b3ac"/>`;
        s += g(badge('すこし おそく なる', { fill: C.redUi, size: 36 }), { x: 0, y: 140, o: prog(t, cue(3) + 2.6, 0.4) });
        out += g(s, { x: 1150, y: 470, o: sO, s: lerp(0.95, 1, eo(sO)) });
      }
    }
    out += kidShow('S', t, 1760, 860, { s: 0.48, start: cue(2) - 0.9, n: 0, side: 'left', end: cue(3) + 0.6 });
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
      const CX = 960, CY = 330, NX = -600;
      let a = pop(card(1380, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'みえている ところは、もう いきていない', { size: 54, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['ねもとで うまれる', '#c25a4a'], ['おされて でてくる', C.ochre], ['ケラチンで いっぱい', '#b8923e']], t, 960, 600, { start: 2.4, step: 0.9, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const moon = `<rect x="-26" y="-36" width="52" height="72" rx="20" fill="${BED}"/><path d="M -18 36 Q 0 6 18 36 Z" fill="#fbe4dc"/>`;
      const items = [
        [moon, '10ぽんの ゆびの しろい みかづきを くらべる', C.ink, cue(1)],
        [moon + text(40, -30, '?', { size: 44, w: 900, fill: C.ochre }), 'どの ゆびが いちばん おおきい？ よそうしてから', C.ink, cue(2)],
        [warnIcon, 'しろい さきを のこす・つめきりは おうちの ひとと', C.red, cue(3)],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(g(icn, { s: 0.9 }) + text(90, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, st, 200, 340 + i * 140); });
      const hO = prog(t, cue(1) + 0.4, 0.5);
      if (hO > 0) b += g(handBack(0, 0, 0.9, t), { x: 1560, y: 330, o: hO, s: lerp(0.9, 1, eo(hO)) });
      b += kidShow('K', t, 1740, 790, { s: 0.5, start: cue(1) + 0.8, n: 1, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「つめと かみ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
  CLIPN = 0;
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

// みのまわり図鑑 動画「かに さされると、どうして かゆく なるの？」（か）
// 出どころ：everyday-trivia trivia/mosquito-bite-itch.md（絵の見本：assets/figures-mosquito.js）

// ---------- 蚊の道具 ----------
const MC = {
  body: '#4a4a4a', bodyLt: '#6b6b6b', stripe: '#f4f4f4', wing: '#e8f2f6', wingLn: '#7a8a90',
  skin: '#f6d6bd', skinSh: '#ecc0a2', epi: '#f3c9b5', der: '#eeb0a2', derLt: '#f4c4b8', derDk: '#e39a8b',
  blood: '#c8323c', bloodLt: '#e86a6a', vessel: '#f6c6c6', vline: '#b0484a',
  saliva: '#4f95d6', salivaDk: '#2f6fb0', hist: '#8f83bf', histDk: '#6c5fa3', mast: '#fbf3e4',
  bump: '#f2928a', bumpDk: '#d9655c', bump2: '#b5553f', bump2Dk: '#8c3b28', water: '#bfe6f5', waterDk: '#6fb6d6',
  ice: '#cde6f2', iceDk: '#7fb2cc', leaf: '#6fb36a', leafDk: '#4c9048', sheath: '#8a6a4a', sheathLt: '#b89468',
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
const sparkle = (x, y, r, o = 1, col = C.yellow) => o <= 0.01 ? '' : `<path d="M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="${col}" opacity="${clamp(o)}"/>`;
const drop = (x, y, s = 1, col = MC.saliva, dk = MC.salivaDk, o = 1) => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -16 C 8 -4 13 2 13 9 A 13 13 0 0 1 -13 9 C -13 2 -8 -4 0 -16 Z" fill="${col}" stroke="${dk}" stroke-width="3" opacity="${clamp(o)}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const itchMark = (x, y, s = 1, o = 1) => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M -30 -8 l 10 -16 l 10 16 l 10 -16 l 10 16 l 10 -16 M -24 26 l 10 -16 l 10 16 l 10 -16 l 10 16" fill="none" stroke="${C.red}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${clamp(o)}"/>`;

// 蚊（横から。頭が 左。むねの まん中が 0,0、足の先は y=112）
//   belly: 0〜1 おなかが 血で 赤くふくらむ ／ fly: とんでいる（はねを ふるわせ、足を うしろへ）／ prob: 口を 下へ のばす（0〜1）
function mosq(t, { belly = 0, fly = 0, prob = 1 } = {}) {
  const wa = fly ? Math.sin(t * 60) * 26 : Math.sin(t * 3) * 2;
  const lg = fly ? `M -14 14 L -8 52 L 26 74 M 0 16 L 16 54 L 52 70 M 14 14 L 46 44 L 84 54` : `M -14 14 L -50 62 L -60 112 M 0 16 L 8 70 L 0 112 M 14 14 L 62 60 L 86 112`;
  let s = `<path d="${lg}" fill="none" stroke="${MC.body}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<ellipse cx="78" cy="16" rx="60" ry="${lerp(15, 27, belly)}" transform="rotate(10 78 16)" fill="${mix(MC.body, MC.blood, belly)}"/>`;
  if (belly < 0.6) s += `<path d="M 50 0 l -3 26 M 72 3 l -3 28 M 94 8 l -3 26 M 114 14 l -2 20" stroke="${MC.stripe}" stroke-width="5" stroke-linecap="round" opacity="${1 - belly / 0.6}"/>`;
  s += `<ellipse cx="44" cy="-34" rx="64" ry="15" transform="rotate(${-18 + wa} 2 -16)" fill="${MC.wing}" fill-opacity="0.85" stroke="${MC.wingLn}" stroke-width="3"/>`;
  s += `<ellipse cx="0" cy="0" rx="31" ry="25" fill="${MC.body}"/><path d="M -10 -12 l 16 0" stroke="${MC.stripe}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M -46 -18 l -30 -26 M -40 -22 l -16 -36" stroke="${MC.body}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<circle cx="-40" cy="-6" r="18" fill="${MC.body}"/><circle cx="-46" cy="-9" r="7" fill="#fff"/><circle cx="-48" cy="-9" r="4" fill="${C.ink}"/>`;
  const px = lerp(-128, -64, prob), py = lerp(30, 112, prob);
  s += `<line x1="-52" y1="4" x2="${px}" y2="${py}" stroke="${MC.body}" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}
const mosqAt = (x, footY, s, t, o = {}) => `<g transform="translate(${x} ${footY - 112 * s}) scale(${s})">${mosq(t, o)}</g>`;
// うで（横から。上の線が y）。ふくらみは 上の線の上に のる
const armSide = (x0, x1, y, h = 170) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" rx="${h / 2}" fill="${MC.skin}"/><path d="M ${x0 + h / 2} ${y + h - 16} L ${x1 - h / 2} ${y + h - 16}" stroke="${MC.skinSh}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`;
// ふくらみ（k: 0〜1 大きさ。hard: 次の日の かたい 赤茶色）
function bumpSide(x, y, r, k = 1, hard = false) {
  if (k <= 0.01) return '';
  const h = r * (hard ? 0.34 : 0.62) * k, w = r * (0.5 + 0.5 * k), c = hard ? MC.bump2 : MC.bump, d = hard ? MC.bump2Dk : MC.bumpDk;
  return `<ellipse cx="${x}" cy="${y + 14}" rx="${w * 1.5}" ry="${22 * k}" fill="${c}" opacity="${hard ? 0.45 : 0.4}"/>` +
    `<path d="M ${x - w} ${y + 2} C ${x - w * 0.7} ${y - h * 1.2} ${x + w * 0.7} ${y - h * 1.2} ${x + w} ${y + 2} Z" fill="${c}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/>` +
    (hard ? `<ellipse cx="${x}" cy="${y - h * 0.42}" rx="${w * 0.4}" ry="${h * 0.26}" fill="${d}" opacity="0.8"/>` : `<circle cx="${x}" cy="${y - h * 0.62}" r="${5 * k}" fill="${MC.bumpDk}"/><path d="M ${x - w * 0.5} ${y - h * 0.5} Q ${x - w * 0.3} ${y - h * 0.82} ${x - w * 0.05} ${y - h * 0.84}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`);
}
// 赤血球
const rbc = (x, y, r = 14, o = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#d9453f" stroke="#8f1f22" stroke-width="3" opacity="${o}"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="#ec7c70" opacity="${o}"/>`;
// 見張り役の細胞（肥満細胞）。burst: つぶを 出す（0〜1）、eyes: 'open' | 'wide'
const GRAN = [[-58, -38], [40, -62], [70, 10], [-24, 62], [-76, 24], [14, 0], [52, 58], [-14, -74], [-44, 6], [26, 34]];
function mastCell(t, r = 140, { burst = 0, eyes = 'open' } = {}) {
  const wob = 1 + Math.sin(t * 3) * 0.015 + (burst > 0 && burst < 1 ? Math.sin(burst * Math.PI) * 0.06 : 0);
  let s = `<g transform="scale(${wob})"><circle r="${r}" fill="${MC.mast}" stroke="${MC.hist}" stroke-width="9" ${burst > 0.05 ? 'stroke-dasharray="34 16"' : ''}/>`;
  GRAN.forEach(([x, y], i) => { const k = burst > 0 ? clamp(burst * 1.6 - i * 0.05) : 0; if (k < 1) s += `<circle cx="${x * r / 140}" cy="${y * r / 140 + 26}" r="${15 * r / 140}" fill="${MC.hist}" opacity="${1 - k}"/>`; });
  const ey = -r * 0.34, er = eyes === 'wide' ? 17 : 12;
  s += `<ellipse cx="${-r * 0.26}" cy="${ey}" rx="${er * 0.85}" ry="${er * 1.1}" fill="${C.ink}"/><ellipse cx="${r * 0.26}" cy="${ey}" rx="${er * 0.85}" ry="${er * 1.1}" fill="${C.ink}"/><circle cx="${-r * 0.26 + 4}" cy="${ey - 5}" r="${er * 0.3}" fill="#fff"/><circle cx="${r * 0.26 + 4}" cy="${ey - 5}" r="${er * 0.3}" fill="#fff"/>`;
  s += eyes === 'wide' ? `<ellipse cx="0" cy="${ey + 40}" rx="12" ry="15" fill="#8e3b33"/>` : `<path d="M -14 ${ey + 34} Q 0 ${ey + 46} 14 ${ey + 34}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  return s + '</g>';
}
// 皮ふの中の 背景（つぶつぶ）
const _derm = (() => { let s = ''; for (let i = 0; i < 60; i++) s += `<ellipse cx="${(rnd(i, 31) * 1920).toFixed(0)}" cy="${(rnd(i, 32) * 1080).toFixed(0)}" rx="${(16 + rnd(i, 33) * 26).toFixed(0)}" ry="${(8 + rnd(i, 34) * 10).toFixed(0)}" fill="${MC.derDk}" opacity="0.22" transform="rotate(${(rnd(i, 35) * 60 - 30).toFixed(0)} ${(rnd(i, 31) * 1920).toFixed(0)} ${(rnd(i, 32) * 1080).toFixed(0)})"/>`; return s; })();
// 蚊の頭を 大きく（口の つけねが 0,0。頭は その上）
const bigHead = t => `<path d="M -40 -150 L -120 -300 M 20 -160 L 10 -330" stroke="${MC.body}" stroke-width="12" stroke-linecap="round"/><ellipse cx="230" cy="-250" rx="270" ry="150" transform="rotate(-24 230 -250)" fill="${MC.bodyLt}"/>` +
  `<circle cx="0" cy="-100" r="104" fill="${MC.body}"/><ellipse cx="-34" cy="-112" rx="42" ry="52" fill="#fff"/><ellipse cx="-42" cy="-108" rx="22" ry="30" fill="${C.ink}"/><circle cx="-34" cy="-122" r="9" fill="#fff"/>`;

// 1. つかみ：うでに 蚊が とまる → 飛んでいったあと、ぷくっと ふくらんで かゆい
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="#e9f3dc"/><circle cx="300" cy="170" r="250" fill="#dcecc9"/><circle cx="1650" cy="330" r="330" fill="#dcecc9"/>`;
    const AY = 560, LX = 660;
    out += armSide(-120, 1210, AY) + `<ellipse cx="1260" cy="${AY + 84}" rx="120" ry="92" fill="${MC.skin}"/><path d="M 1200 ${AY + 16} Q 1290 ${AY - 40} 1330 ${AY + 20}" fill="none" stroke="${MC.skin}" stroke-width="44" stroke-linecap="round"/>`;
    // ふくらみ
    const bk = eo(prog(t, c1 + 3.4, 1.0));
    out += bumpSide(LX - 74, AY, 78, bk);
    // 蚊：右上から 来て とまり、左上へ 飛んでいく（どちらも 左向きに 進む）
    const inK = eo(prog(t, 0.3, 1.3)), outK = eio(prog(t, c1 + 0.2, 1.7));
    if (outK < 1) {
      const fly = inK < 1 || outK > 0 ? 1 : 0;
      const x = lerp(lerp(1560, LX, inK), -260, outK), y = lerp(lerp(90, AY, inK), 60, outK) + (fly ? Math.sin(t * 9) * 12 : 0);
      out += mosqAt(x, y, 1.25, t, { fly, prob: fly ? 0.15 : 1, belly: eo(prog(t, c0 + 1.2, 2.0)) });
    }
    out += g(text(0, 0, 'ぷくっ', { size: 76, w: 900, fill: MC.bumpDk }), { x: LX - 70, y: AY - 150, r: -5, o: win(t, c1 + 3.4, c3 - 0.2, 0.25), s: lerp(0.7, 1, eo(prog(t, c1 + 3.4, 0.4))) });
    const iO = prog(t, c1 + 5.2, 0.3);
    out += itchMark(LX - 250, AY - 70, 1.1, iO * (0.6 + 0.4 * Math.sin(t * 12))) + itchMark(LX + 110, AY - 60, 1.1, iO * (0.6 + 0.4 * Math.cos(t * 12)));
    out += kidShow('S', t, 1640, 850, { s: 0.62, start: c1 + 4.6, n: 0, side: 'left', size: 50 });
    out += g(text(0, 0, 'かは、もう いないのに…', { size: 62, w: 900, fill: C.ochre }), { x: 620, y: 250, o: win(t, c3 + 0.3, cueE(3) + 0.6, 0.3) });
    out += g(text(0, 0, '？', { size: 190, w: 900, fill: C.ochre, extra: `stroke="#fff" stroke-width="18" paint-order="stroke"` }), { x: 1130, y: 300, o: win(t, c3 + 2.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${MC.body}">か</tspan>に さされると、</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${MC.bumpDk}">かゆく</tspan> なるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(armSide(-330, 330, 0, 100) + bumpSide(130, 0, 60, 1) + mosqAt(-120, 0, 0.8, 1.2, { belly: 0.2 }), t, t0 + 1.8, 960, 800);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'かに さされると、かゆく なるのは どうして？', { size: 58, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'かの つばに、じぶんの からだが きづくから'], ['②', 'はりで さした きずが、いたむから'], ['③', 'かが どくを いれて、ひふを とかすから']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 46)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(armSide(-130, 130, 0, 70) + bumpSide(0, 0, 54, 1) + text(110, -96, '？', { size: 110, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1650, 370);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 血をすうのは メスだけ（卵を産むとき）。オスや 卵を産まないメスは 草の汁
SCENES.push({
  id: 'female',
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += titleAt('ちを すうのは、メスだけ', t, c0 + 0.2, 1e9, MC.blood, 960, 170, 50);
    // メス
    let a = card(800, 540) + armSide(-340, 340, 40, 90) + mosqAt(-40, 40, 1.15, t, { belly: eo(prog(t, c0 + 1.6, 2.0)) });
    a += g(badge('メス', { fill: MC.blood, size: 46 }), { x: -280, y: -200 });
    const eO = prog(t, c0 + 3.4, 0.5);
    a += g([[-30, 0], [0, -10], [30, 0], [-15, 14], [15, 14]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="20" fill="#fff" stroke="${MC.body}" stroke-width="4" transform="rotate(${x} ${x} ${y})"/>`).join('') + text(0, 62, 'たまご', { size: 34, w: 900, fill: MC.body }), { x: 250, y: -150, o: eO, s: lerp(0.7, 1, eo(eO)) });
    a += g(text(0, 0, 'たまごを うむ ときだけ、ちを すう', { size: 40, w: 900, fill: MC.blood }), { y: 210, o: prog(t, c0 + 3.8, 0.4) });
    out += pop(a, t, c0 + 0.5, 500, 500);
    // オス・卵を産まないメス
    let b = card(800, 540);
    b += `<path d="M -340 130 Q -100 60 300 110" fill="none" stroke="${MC.leafDk}" stroke-width="16" stroke-linecap="round"/><path d="M -60 84 Q 20 -40 180 -20 Q 120 90 -60 84 Z" fill="${MC.leaf}"/><path d="M -60 84 Q 60 30 180 -20" fill="none" stroke="${MC.leafDk}" stroke-width="5"/><path d="M -200 106 Q -260 20 -180 -30 Q -130 40 -200 106 Z" fill="${MC.leaf}"/>`;
    b += mosqAt(110, 28, 1.0, t + 2, {});
    b += g(badge('オス', { fill: C.blueUi, size: 46 }), { x: -280, y: -200 });
    b += g(text(0, 0, 'くさの しるなどを すう', { size: 40, w: 900, fill: MC.leafDk }), { y: 190, o: prog(t, c1 + 1.2, 0.4) });
    b += g(text(0, 0, 'たまごを うまない メスも', { size: 34, w: 900, fill: C.muted }), { y: 238, o: prog(t, c1 + 2.4, 0.4) });
    out += pop(b, t, c1 - 0.1, 1420, 500);
    return out;
  },
});

// 4. 1本に見える口は、さやと 6本の針。皮ふに入るのは 針のたばだけ
SCENES.push({
  id: 'mouth',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const SY = 730, HX = 800, PL = 400;
    out += `<rect x="0" y="${SY}" width="1920" height="${1080 - SY}" fill="${MC.der}"/><rect x="0" y="${SY}" width="1920" height="46" fill="${MC.epi}"/><line x1="0" y1="${SY}" x2="1920" y2="${SY}" stroke="${MC.skinSh}" stroke-width="5"/>`;
    out += g(text(0, 0, 'ひふ', { size: 44, w: 900, fill: '#a8584a' }), { x: 200, y: SY + 84, o: prog(t, 0.4, 0.4) });
    const open = eio(prog(t, c1 + 0.6, 1.0)) * (1 - eio(prog(t, c3 - 0.2, 0.7)));
    const down = eio(prog(t, c3 + 1.0, 1.8)), HY = lerp(250, 470, down), P0 = HY;
    // さや（下くちびる）
    const sx = HX - 190 * open, endY = Math.min(SY, P0 + PL), d = endY - P0, bow = d < PL ? 0.62 * Math.sqrt(PL * PL - d * d) : 0;
    const sh = `M ${sx} ${P0} Q ${sx - bow * 2} ${(P0 + endY) / 2} ${sx - (bow > 0 ? 6 : 0)} ${endY}`;
    // 6本の針
    let nd = '';
    const NC = ['#3d3d3d', '#7a5a3a', '#3d3d3d', '#b0484a', '#7a5a3a', '#3d3d3d'];
    for (let i = 0; i < 6; i++) {
      const ex = HX + (i - 2.5) * 72 * open + 90 * open, ey = P0 + PL + (down > 0 ? 0 : -Math.abs(i - 2.5) * 10 * open);
      nd += `<line x1="${HX + (i - 2.5) * 3}" y1="${P0}" x2="${ex + (i - 2.5) * 2 * (1 - open)}" y2="${ey}" stroke="${NC[i]}" stroke-width="${lerp(5, 9, open)}" stroke-linecap="round"/>`;
      const nk = prog(t, c1 + 1.8 + i * 0.32, 0.3) * (1 - prog(t, c3 - 0.4, 0.3));
      if (nk > 0) nd += g(`<circle r="26" fill="${C.ochre}"/>` + text(0, 3, String(i + 1), { size: 36, w: 900, fill: '#fff' }), { x: ex, y: ey + 42, o: nk, s: Math.max(back(nk), 0.001) });
    }
    out += nd;
    out += `<path d="${sh}" fill="none" stroke="${MC.sheath}" stroke-width="${lerp(26, 30, open)}" stroke-linecap="round"/><path d="${sh}" fill="none" stroke="${MC.sheathLt}" stroke-width="8" stroke-linecap="round" opacity="${0.5 + 0.5 * open}"/>`;
    out += g(bigHead(t), { x: HX, y: HY });
    // ラベル
    out += tag(HX + 14, 470, 1260, 400, '1ぽんの はりに みえる', win(t, c0 + 0.8, c1 + 0.3, 0.3), { size: 46 });
    out += tag(sx - 14, P0 + 200, 330, 470, 'さや', prog(t, c1 + 1.2, 0.3) * (1 - prog(t, c3 - 0.4, 0.3)), { col: MC.sheath, size: 52 });
    out += g(text(0, 0, '6ぽんの はり', { size: 60, w: 900, fill: C.ochre }), { x: 1250, y: 320, o: win(t, c1 + 3.6, c3 - 0.3, 0.3) });
    out += tag(HX - bow * 0.95, (P0 + endY) / 2, 300, 520, 'さやは、そとに のこる', prog(t, c3 + 3.4, 0.4), { col: MC.sheath, size: 44 });
    out += tag(HX + 6, SY + 60, 1300, 640, 'はいるのは、はりの たばだけ', prog(t, c3 + 2.2, 0.4), { col: C.redUi, size: 44 });
    out += kidShow('B', t, 1680, SY, { s: 0.5, start: cue(2) - 0.9, n: 0, side: 'left', size: 46, end: c3 + 0.4 });
    return out;
  },
});

// 5. 皮ふの中で、針の先が 曲がって 血管をさがす。だ液を出す。管は2本
const VES = [[820, 1090], [820, 760], [900, 640], [1160, 640]];
const vesP = u => { const [a, b, c, d] = VES, m = 1 - u; return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]]; };
SCENES.push({
  id: 'probe',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    const SY = 300, E = [623, SY];
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/><rect x="0" y="${SY}" width="1920" height="${1080 - SY}" fill="${MC.der}"/>` + _derm.replace(/cy="(\d+)"/g, (m, v) => `cy="${Math.max(+v, SY + 90)}"`) + `<rect x="0" y="${SY}" width="1920" height="56" fill="${MC.epi}"/><line x1="0" y1="${SY}" x2="1920" y2="${SY}" stroke="${MC.skinSh}" stroke-width="5"/>` + topBadge();
    // 血管
    const vd = `M ${VES[0]} C ${VES[1]} ${VES[2]} ${VES[3]} L 1980 640`;
    out += `<path d="${vd}" fill="none" stroke="${MC.vline}" stroke-width="104" stroke-linecap="round"/><path d="${vd}" fill="none" stroke="${MC.vessel}" stroke-width="92" stroke-linecap="round"/>`;
    for (let i = 0; i < 12; i++) { const u = ((t * 0.07 + i / 12) % 1) * 2, p = u < 1 ? vesP(u) : [lerp(1160, 1980, u - 1), 640]; out += rbc(p[0] + Math.sin(i * 2.3) * 14, p[1] + Math.cos(i * 1.7) * 16, 15); }
    out += tag(1250, 640, 1330, 800, 'けっかん', prog(t, c0 + 0.6, 0.4) * (1 - prog(t, c3 - 0.3, 0.3)), { col: MC.vline, size: 44 });
    out += g(text(0, 0, 'ひふの なか', { size: 44, w: 900, fill: '#a8584a' }), { x: 210, y: SY + 130, o: prog(t, 0.4, 0.4) });
    // さがす：左（ない）→ まん中（ない）→ 右（あった）
    const TG = [[500, 540], [690, 620], [872, 716]], seg = [[c0 + 0.5, c0 + 2.2], [c0 + 2.5, c0 + 4.2], [c0 + 4.5, 1e9]];
    let ti = 0, p = 0;
    seg.forEach(([a, b], i) => { if (t >= a) { ti = i; p = i < 2 ? Math.min(eo(prog(t, a, 0.8)), 1 - eio(prog(t, b - 0.6, 0.6))) : eo(prog(t, a, 1.0)); } });
    const T = [lerp(E[0], TG[ti][0], p), lerp(E[1], TG[ti][1], p)], K = [E[0], lerp(E[1], TG[ti][1], p * 0.75)];
    const nd = `M ${E[0]} ${E[1] - 6} Q ${K[0]} ${K[1]} ${T[0]} ${T[1]}`;
    // だ液（さがした所に のこる）
    const sPulse = 1 + 0.25 * Math.sin(t * 6) * win(t, c1, c2, 0.4);
    TG.forEach(([x, y], i) => { const k = prog(t, seg[i][0] + 0.7, 0.5); for (let j = 0; j < (i === 2 ? 6 : 3); j++) { const a = j * 2.1 + i, r = (26 + j * 13) * k; out += drop(x + Math.cos(a) * r - (i === 2 ? 40 : 0), y + Math.sin(a) * r * 0.8 - (i === 2 ? 30 : 0), 0.8 * sPulse, MC.saliva, MC.salivaDk, k * 0.95); } });
    out += `<path d="${nd}" fill="none" stroke="${MC.body}" stroke-width="12" stroke-linecap="round"/>`;
    // すう：針の中を 血が のぼる
    const suck = prog(t, c2 + 0.4, 0.6);
    if (suck > 0) out += `<path d="${nd}" fill="none" stroke="${MC.bloodLt}" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 14" stroke-dashoffset="${t * 60}" opacity="${suck}"/>`;
    out += mosqAt(700, SY, 1.1, t, { belly: eo(prog(t, c2 + 0.6, 6)) * 0.9 });
    [0, 1].forEach(i => { out += g(text(0, 0, 'ない…', { size: 44, w: 900, fill: C.muted }), { x: TG[i][0] - 10, y: TG[i][1] + 76, o: win(t, seg[i][0] + 0.8, seg[i][1] + 0.3, 0.2) }); });
    out += g(text(0, 0, 'あった！', { size: 54, w: 900, fill: MC.blood, extra: `stroke="#fff" stroke-width="10" paint-order="stroke"` }), { x: 1110, y: 540, o: win(t, c0 + 5.5, c1 - 0.2, 0.25) });
    out += titleAt('じっけんで みられた ようす', t, c0 + 0.3, c1 - 0.2, C.muted, 1330, 170, 40);
    out += g(text(0, 0, 'はりの さきが まがって、けっかんを さがす', { size: 46, w: 900 }), { x: 1340, y: 250, o: win(t, c0 + 1.2, c1 - 0.2, 0.3) });
    out += tag(TG[2][0] - 70, TG[2][1] - 56, 420, 800, 'だえき（つば）', win(t, c1 + 0.8, c3 - 0.3, 0.3), { col: MC.salivaDk, size: 48 });
    out += pop(card(860, 110) + drop(-374, 4, 1.4) + text(-330, 2, 'ちを かたまりにくく する ものが、はいっている', { size: 33, w: 900, anchor: 'start', fill: MC.salivaDk }), t, c2 + 0.5, 1420, 180, { end: c3 - 0.2 });
    // 管は 2本
    const iO = prog(t, c3 + 0.2, 0.5);
    if (iO > 0) {
      let c = card(640, 620) + text(0, -250, 'はりの なかの、2ほんの くだ', { size: 40, w: 900 });
      c += `<rect x="-150" y="-190" width="120" height="380" rx="26" fill="#e3f0fb" stroke="${MC.salivaDk}" stroke-width="7"/><rect x="30" y="-190" width="120" height="380" rx="26" fill="#fbe1e1" stroke="${MC.vline}" stroke-width="7"/>`;
      for (let i = 0; i < 4; i++) { const f = ((t * 0.5 + i / 4) % 1); c += drop(-90, -160 + f * 320, 1.3, MC.saliva, MC.salivaDk, Math.sin(f * Math.PI)); c += rbc(90, 160 - f * 320, 20, Math.sin(f * Math.PI)); }
      c += arrow2(-210, -90, -210, 60, MC.salivaDk, 12) + arrow2(210, 60, 210, -90, MC.vline, 12);
      c += text(-90, 236, 'だえき', { size: 42, w: 900, fill: MC.salivaDk }) + text(90, 236, 'ち', { size: 42, w: 900, fill: MC.blood });
      out += g(`<line x1="${(E[0] + T[0]) / 2 + 30}" y1="${(E[1] + T[1]) / 2 + 40}" x2="1140" y2="520" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>`, { o: iO });
      out += g(c, { x: 1470, y: 500, o: iO, s: lerp(0.9, 1, eo(iO)) });
    }
    return out;
  },
});

// 6. 見張り役の細胞が だ液に気づく → ヒスタミン → 血管が広がり、水分がしみ出す → ぷくっ
SCENES.push({
  id: 'alarm',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="${MC.derLt}"/>` + _derm;
    const MX = 1000, MY = 400, VY = 750, MR = 160;
    // 血管（広がる）
    const wide = eio(prog(t, c3 + 0.8, 1.6)), vw = lerp(70, 124, wide);
    const vd = `M 560 1120 Q 560 ${VY} 780 ${VY} L 1980 ${VY}`;
    out += `<path d="${vd}" fill="none" stroke="${MC.vline}" stroke-width="${vw + 12}" stroke-linecap="round"/><path d="${vd}" fill="none" stroke="${MC.vessel}" stroke-width="${vw}" stroke-linecap="round"/>`;
    for (let i = 0; i < 9; i++) { const f = ((t * 0.05 + i / 9) % 1); out += rbc(lerp(800, 1980, f), VY + Math.sin(i * 2.1) * vw * 0.22, 14); }
    out += g(text(0, 0, 'けっかん', { size: 38, w: 900, fill: MC.vline }), { x: 1760, y: VY - vw / 2 - 40, o: prog(t, c1, 0.4) * (1 - prog(t, c3 + 0.4, 0.3)) });
    // 針の先と だ液
    out += `<path d="M 250 -20 Q 270 160 400 250" fill="none" stroke="${MC.body}" stroke-width="16" stroke-linecap="round"/>`;
    out += topBadge();
    const reach = eo(prog(t, c2 - 0.6, 1.6));
    for (let i = 0; i < 7; i++) { const a = i * 0.9, sx = 410 + Math.cos(a) * 60 + (i % 3) * 36, sy = 270 + Math.sin(a) * 46 + (i % 2) * 40; const tx = MX - 215 + (i % 3) * 30, ty = MY - 80 + i * 26; out += drop(lerp(sx, tx, reach * (0.55 + 0.45 * rnd(i, 41))), lerp(sy, ty, reach * (0.55 + 0.45 * rnd(i, 42))) + Math.sin(t * 2 + i) * 6, 1.25, MC.saliva, MC.salivaDk, prog(t, 0.3 + i * 0.1, 0.3)); }
    out += tag(430, 300, 520, 170, 'かの だえき', prog(t, c0 + 0.6, 0.4) * (1 - prog(t, c3 - 0.3, 0.3)), { col: MC.salivaDk, size: 44 });
    out += g(text(0, 0, '？', { size: 200, w: 900, fill: C.ochre, extra: `stroke="#fff" stroke-width="18" paint-order="stroke"` }), { x: 1000, y: 430, o: win(t, c0 + 0.8, c1 - 0.2, 0.3) });
    // 見張り役の細胞
    const burstT = c2 + 3.2, burst = prog(t, burstT, 1.4), notice = t > c2 + 1.0;
    out += pop(mastCell(t, MR, { burst, eyes: notice ? 'wide' : 'open' }), t, c1 + 0.2, MX, MY);
    out += tag(MX + 116, MY - 106, 1440, 190, 'みはりやくの さいぼう', prog(t, c1 + 1.0, 0.4) * (1 - prog(t, c4 - 0.4, 0.3)), { col: MC.histDk, size: 44 });
    out += pop(text(0, 0, '！', { size: 130, w: 900, fill: C.red, extra: `stroke="#fff" stroke-width="14" paint-order="stroke"` }), t, c2 + 1.0, MX - 150, MY - 210, { end: burstT + 1.0 });
    // ヒスタミンの つぶ
    if (burst > 0) {
      const sink = eo(prog(t, c3 + 0.2, 1.6));
      for (let i = 0; i < 22; i++) {
        const a = i / 22 * Math.PI * 2 + 0.3, r = 172 + (80 + rnd(i, 51) * 150) * eo(clamp(burst * 1.2 - rnd(i, 52) * 0.2));
        let x = MX + Math.cos(a) * r, y = MY + Math.sin(a) * r * 0.8;
        const tx = 820 + i * 46, ty = VY - vw / 2 - 16 - rnd(i, 53) * 40;
        if (i % 2 === 0) { x = lerp(x, tx, sink); y = lerp(y, ty, sink); }
        out += `<circle cx="${x + Math.sin(t * 3 + i) * 5}" cy="${y + Math.cos(t * 2.6 + i) * 5}" r="13" fill="${MC.hist}" stroke="${MC.histDk}" stroke-width="3" opacity="${clamp(burst * 3)}"/>`;
      }
      out += pop(badge('ヒスタミン', { fill: MC.histDk, size: 50 }), t, burstT + 0.6, 1440, 330, { end: c4 - 0.3 });
    }
    // 水分が しみ出す
    const seep = prog(t, c3 + 2.0, 0.5);
    if (seep > 0) for (let i = 0; i < 14; i++) { const f = ((t * 0.35 + i / 14) % 1), x = 840 + i * 74 + Math.sin(i * 5) * 20; out += drop(x, VY - vw / 2 - 10 - f * 150, 1.0 + 0.3 * (i % 2), MC.water, MC.waterDk, seep * Math.sin(f * Math.PI)); }
    out += pop(badge('けっかんが ひろがる', { fill: MC.vline, size: 40 }), t, c3 + 1.2, 1620, VY + 2, { end: c4 - 0.3 });
    out += pop(badge('すいぶんが しみだす', { fill: MC.waterDk, size: 40 }), t, c3 + 2.6, 1360, 622, { end: c4 - 0.3 });
    // ぷくっ
    const pO = prog(t, c4 + 0.3, 0.5);
    if (pO > 0) {
      const bk = eo(prog(t, c4 + 0.9, 1.4));
      let c = card(620, 480) + armSide(-270, 270, -10, 110) + bumpSide(0, -10, 86, bk);
      c += g(text(0, 0, 'ぷくっ', { size: 60, w: 900, fill: MC.bumpDk }), { x: -170, y: -150, r: -6, o: prog(t, c4 + 1.2, 0.3) });
      c += itchMark(170, -100, 0.9, prog(t, c4 + 2.4, 0.3) * (0.6 + 0.4 * Math.sin(t * 12)));
      c += text(0, 146, 'ふくらんで、かゆく なる', { size: 40, w: 900, fill: MC.bumpDk }) + g(text(0, 198, '（と かんがえられている）', { size: 32, w: 900, fill: C.muted }), { o: prog(t, c4 + 3.0, 0.4) });
      out += g(c, { x: 1530, y: 350, o: pO, s: lerp(0.9, 1, eo(pO)) });
    }
    out += kidShow('S', t, 240, 850, { s: 0.55, start: cue(5) - 0.9, n: 0, side: 'right', size: 44 });
    return out;
  },
});

// 7. すぐのかゆみ と 次の日のかゆみ
SCENES.push({
  id: 'two',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += titleAt('かゆみは、2つ', t, c0 + 0.2, 1e9, C.ink, 960, 170, 52);
    const clock = `<circle r="40" fill="#fff" stroke="${C.ink}" stroke-width="7"/><path d="M 0 0 L 0 -26 M 0 0 L 18 0" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
    const cal = `<rect x="-40" y="-36" width="80" height="76" rx="12" fill="#fff" stroke="${C.ink}" stroke-width="7"/><rect x="-40" y="-36" width="80" height="24" rx="10" fill="${C.redUi}"/>` + text(0, 16, '+1', { size: 34, w: 900 });
    let a = card(800, 500) + g(clock, { x: -300, y: -170 }) + text(-240, -186, 'すぐ', { size: 52, w: 900, anchor: 'start', fill: MC.bumpDk }) + text(-240, -132, '2〜3ぷんご', { size: 38, w: 900, anchor: 'start', fill: C.muted });
    a += armSide(-330, 330, 40, 100) + bumpSide(0, 40, 92, eo(prog(t, c1 + 0.8, 1.2)));
    a += g(text(0, 0, 'あかくて、ぷっくり', { size: 46, w: 900, fill: MC.bumpDk }), { y: 198, o: prog(t, c1 + 2.0, 0.4) });
    out += pop(a, t, c1 - 0.1, 500, 480);
    let b = card(800, 500) + g(cal, { x: -300, y: -170 }) + text(-240, -186, 'つぎの ひ', { size: 52, w: 900, anchor: 'start', fill: MC.bump2Dk }) + text(-240, -132, '1〜2にちご', { size: 38, w: 900, anchor: 'start', fill: C.muted });
    b += armSide(-330, 330, 40, 100) + bumpSide(0, 40, 104, eo(prog(t, c2 + 1.0, 1.2)), true);
    b += g(text(0, 0, 'かたくて、あかちゃいろ', { size: 46, w: 900, fill: MC.bump2Dk }), { y: 198, o: prog(t, c2 + 2.4, 0.4) });
    out += pop(b, t, c2 - 0.1, 1420, 480);
    out += pop(badge('どちらが でるかは、ひとに よって ちがう', { fill: C.accent, size: 42 }), t, c3 + 0.4, 960, 800);
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
      const CX = 960, CY = 330, NX = -560, as = 'かの つばに、じぶんの からだが きづくから';
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, as, { size: fit(as, 1060, 50, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['かが つば（だえき）を いれる', MC.salivaDk], ['みはりやくが きづく', MC.histDk], ['ぷくっと ふくらんで かゆい', MC.bumpDk]], t, 960, 600, { start: 2.4, step: 1.1, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const okIcon = `<circle r="24" fill="${C.accent}"/><path d="M -11 0 l 8 9 l 15 -17" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      const items = [
        [g(eyeIcon(0.3)), 'すぐの ふくらみと、つぎの ひの ふくらみを くらべる', C.ink, cue(1)],
        [warnIcon(0.5), 'かくと、きずから ばいきんが はいる ことが ある', C.red, cue(2)],
        [okIcon, 'かかないで、せっけんと みずで あらって、ひやす', C.accent, cue(3)],
        [warnIcon(0.5), 'おおきい ときや、あつい ときは、おとなに みせる', C.red, cue(4)],
        [g(eyeIcon(0.3)), 'かは つかまえない。くちは、えや しゃしんで みる', C.ink, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 990, 44, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 320 + i * 100); });
      // 絵：すぐと 次の日 → かかない → 冷やす
      const PX = 1560, PYc = 500;
      let p = card(560, 560, { fill: '#fff' });
      const ph1 = 1 - prog(t, cue(2) - 0.3, 0.4);
      if (ph1 > 0) p += g(armSide(-250, 250, -110, 80) + bumpSide(0, -110, 70, 1) + text(0, -6, 'すぐ', { size: 36, w: 900, fill: MC.bumpDk }) + armSide(-250, 250, 110, 80) + bumpSide(0, 110, 80, 1, true) + text(0, 222, 'つぎの ひ', { size: 36, w: 900, fill: MC.bump2Dk }), { o: ph1 });
      const ph2 = prog(t, cue(2) - 0.1, 0.4);
      if (ph2 > 0) {
        let q = armSide(-250, 250, 20, 100) + bumpSide(0, 20, 84, 1);
        const sc = win(t, cue(2), cue(3) - 0.2, 0.3), ice = prog(t, cue(3) + 0.4, 0.5);
        if (sc > 0) q += g(`<path d="M -60 -150 Q -20 -70 -10 -40 M -20 -160 Q 10 -80 20 -40 M 20 -150 Q 40 -80 50 -40" fill="none" stroke="${MC.skinSh}" stroke-width="20" stroke-linecap="round"/>` + cross(10, -60, 0.8), { x: Math.sin(t * 14) * 10, o: sc }) + g(text(0, 0, 'かかない', { size: 44, w: 900, fill: C.red }), { y: 190, o: sc });
        if (ice > 0) q += g(`<path d="M -90 -10 Q -100 -110 0 -116 Q 100 -110 90 -10 Q 0 14 -90 -10 Z" fill="${MC.ice}" stroke="${MC.iceDk}" stroke-width="6"/><rect x="-22" y="-146" width="44" height="34" rx="8" fill="${MC.iceDk}"/><path d="M -40 -66 l 20 0 M 14 -80 l 22 0 M -10 -40 l 24 0" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`, { y: -6 + (1 - eo(ice)) * -60, o: ice }) + g(text(0, 0, 'ひやす', { size: 44, w: 900, fill: MC.iceDk }), { y: 190, o: ice });
        p += g(q, { o: ph2 });
      }
      b += pop(p, t, cue(1) + 0.4, PX, PYc);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「か」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

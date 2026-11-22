// みのまわり図鑑 動画「こどもの はは、どうして ぬけて はえかわるの？」（こどもの は）
// 出どころ：everyday-trivia trivia/baby-teeth.md（絵の見本：assets/figures-teeth.js の bt-step-*）

// ---------- 歯の道具 ----------
const TC = {
  baby: '#fffdf6', adult: '#cfe6f0', adultDk: '#4f8ea6', root: '#f1e2c2', aroot: '#bcd6e0',
  gum: '#f0a3ae', gumDk: '#d97f8d', gumIn: '#c96f7e', bone: '#f3e6b8', boneDk: '#dccb8f', hole: '#fbf5dc',
  cell: '#9a8ed0', cellDk: '#6c5fa3', skin: '#f6d6bd', skinSh: '#ecc0a2', mouth: '#8e3b33', tongue: '#ee8f86', tongueDk: '#d9736b',
  line: '#3a2a22', hair: '#4b3226', shark: '#8fa8bd', sharkDk: '#6b8499', croc: '#7fb36a', crocDk: '#5c9048',
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

// 横から見た歯。くび（歯ぐきの きわ）が 0,0。上に あたま（高さ h）、下に 根っこ（長さ rl。もとの長さ R0 より短いと、先が とけた形になる）
function toothSide(w, h, rl, { fill = TC.baby, root = TC.root, sw = 5, R0 = null } = {}) {
  const full = R0 || Math.max(rl, 1), hw = y => lerp(w * 0.43, w * 0.16, clamp(y / full)), r = Math.min(w * 0.3, h * 0.42);
  const st = `stroke="${TC.line}" stroke-width="${sw}" stroke-linejoin="round"`;
  let s = '';
  if (rl > 3) {
    const b = hw(rl), bot = rl >= full * 0.97 ? `Q 0 ${rl + w * 0.1} ${b} ${rl}` : `Q ${-b * 0.5} ${rl - b * 0.4} 0 ${rl + 2} Q ${b * 0.5} ${rl - b * 0.4} ${b} ${rl}`;
    s += `<path d="M ${-hw(0)} -6 L ${-b} ${rl} ${bot} L ${hw(0)} -6 Z" fill="${root}" ${st}/>`;
  }
  s += `<path d="M ${-w / 2} 4 L ${-w / 2} ${-h + r} Q ${-w / 2} ${-h} ${-w / 2 + r} ${-h} L ${w / 2 - r} ${-h} Q ${w / 2} ${-h} ${w / 2} ${-h + r} L ${w / 2} 4 Q 0 ${12 + w * 0.03} ${-w / 2} 4 Z" fill="${fill}" ${st}/>`;
  s += `<path d="M ${-w / 2 + w * 0.17} ${-h + r * 0.9} L ${-w / 2 + w * 0.17} ${-h * 0.36}" fill="none" stroke="#fff" stroke-width="${sw * 1.8}" stroke-linecap="round" opacity="0.95"/>`;
  return s;
}
// 根っこを とかす 小さな細胞（上を向いて ぱくぱく）
function cellPic(x, y, r, t, ph = 0, o = 1) {
  if (o <= 0.01) return '';
  const m = 0.3 + 0.24 * Math.sin(t * 9 + ph), a0 = -Math.PI / 2 + m, a1 = -Math.PI / 2 - m;
  return `<g transform="translate(${x} ${y})" opacity="${clamp(o)}"><path d="M 0 0 L ${Math.cos(a0) * r} ${Math.sin(a0) * r} A ${r} ${r} 0 1 1 ${Math.cos(a1) * r} ${Math.sin(a1) * r} Z" fill="${TC.cell}" stroke="${TC.cellDk}" stroke-width="${r * 0.14}" stroke-linejoin="round"/>` +
    `<circle cx="${-r * 0.46}" cy="${r * 0.02}" r="${r * 0.12}" fill="#fff"/><circle cx="${r * 0.46}" cy="${r * 0.02}" r="${r * 0.12}" fill="#fff"/></g>`;
}
// あごを たてに切って 横から見た絵。子どもの歯の くび（歯ぐきの上）が 0,0。
//   rl: 子どもの歯の根っこの長さ（もとは BR0）／ ay: おとなの歯の あたまの てっぺんの高さ ／ arl: おとなの歯の根っこ
//   baby: 子どもの歯を描く（0〜1）／ brot: ぐらぐらの角度 ／ cells: 細胞の こさ（0〜1）／ adultO: おとなの歯の こさ ／ gap: ぬけたあとの あな
const BR0 = 190, BW = 170, BH = 150, AW = 230, AH = 150;
const _bone = (() => { let s = ''; for (let i = 0; i < 46; i++) { const x = -400 + rnd(i, 21) * 800, y = 110 + rnd(i, 22) * 330; if (Math.abs(x) < 170) continue; s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(8 + rnd(i, 23) * 10).toFixed(0)}" ry="${(5 + rnd(i, 24) * 6).toFixed(0)}" fill="${TC.boneDk}" opacity="0.45"/>`; } return s; })();
function jawSec(t, { rl = BR0, ay = 250, arl = 0, baby = 1, brot = 0, cells = 0, adultO = 1, gap = 0, glow = 0 } = {}) {
  let s = `<rect x="-430" y="56" width="860" height="414" rx="40" fill="${TC.bone}" stroke="${TC.boneDk}" stroke-width="5"/>` + _bone;
  // 歯の入っている すきま（ほねの中）
  const hb = Math.max(10 + rl + 26, adultO > 0.01 ? ay + AH + arl + 26 : 0);
  s += `<path d="M -112 40 L -112 ${hb - 60} Q -112 ${hb} ${-60} ${hb} L 60 ${hb} Q 112 ${hb} 112 ${hb - 60} L 112 40 Z" fill="${TC.hole}"/>`;
  if (adultO > 0.01) s += g(`<ellipse cx="0" cy="${ay + AH * 0.5}" rx="${AW * 0.62}" ry="${AH * 0.7}" fill="${TC.hole}"/>`, { o: adultO });
  // 歯ぐき
  s += `<rect x="-430" y="0" width="860" height="92" rx="40" fill="${TC.gum}" stroke="${TC.gumDk}" stroke-width="5"/>`;
  if (gap > 0) s += g(`<path d="M -84 -3 Q -76 58 0 64 Q 76 58 84 -3 Z" fill="${TC.gumIn}"/>`, { o: gap });
  // おとなの歯
  if (adultO > 0.01) {
    let a = '';
    if (glow > 0) a += `<ellipse cx="0" cy="${ay + AH * 0.5}" rx="${AW * 0.8}" ry="${AH * 0.85}" fill="#fff6c4" opacity="${0.8 * glow}" filter="url(#soft)"/>`;
    a += g(toothSide(AW, AH, arl, { fill: TC.adult, root: TC.aroot }), { y: ay + AH });
    s += g(a, { o: adultO });
  }
  // 子どもの歯
  if (baby > 0.01) s += `<g transform="rotate(${brot} 0 6)" opacity="${clamp(baby)}">${toothSide(BW, BH, rl, { R0: BR0 })}</g>`;
  if (cells > 0.01 && rl > 6) [[-34, 0, 0], [0, 12, 2.1], [34, 0, 4.2]].forEach(([dx, dy, ph]) => { s += cellPic(dx * lerp(0.6, 1, rl / BR0) * 1.2, rl + 26 + dy, 17, t, ph, cells); });
  return s;
}
// 口を あけたところ（正面）。まん中が 0,0。wob: 下の前歯1本の ぐらぐら角度、out: その歯が ぬけた（0〜1）
const MOUTH_D = 'M -236 -64 Q 0 -138 236 -64 Q 262 124 0 176 Q -262 124 -236 -64 Z';
const LOWX = [-150, -92, -31, 31, 92, 150], LOWW = [54, 56, 58, 58, 56, 54];
function mouthPic({ wob = 0, out = 0, id = 'mp', face = true } = {}) {
  let s = '';
  if (face) s += `<rect x="-380" y="-290" width="760" height="560" rx="150" fill="${TC.skin}"/><path d="M -22 -214 Q 0 -196 22 -214" fill="none" stroke="${TC.skinSh}" stroke-width="10" stroke-linecap="round"/>` +
    `<circle cx="-292" cy="-70" r="46" fill="${CH.cheek}" opacity="0.6"/><circle cx="292" cy="-70" r="46" fill="${CH.cheek}" opacity="0.6"/>`;
  s += `<clipPath id="${id}"><path d="${MOUTH_D}"/></clipPath><path d="${MOUTH_D}" fill="${TC.mouth}"/><g clip-path="url(#${id})">`;
  s += `<ellipse cx="0" cy="110" rx="150" ry="74" fill="${TC.tongue}"/><path d="M 0 60 L 0 130" stroke="${TC.tongueDk}" stroke-width="6" stroke-linecap="round"/>`;
  // 上の歯
  for (let i = 0; i < 6; i++) { const x = -165 + i * 66, yT = -64 - 37 * (1 - Math.pow(x / 236, 2)); s += `<rect x="${x - 31}" y="${yT - 20}" width="62" height="${i === 2 || i === 3 ? 96 : 86}" rx="14" fill="${TC.baby}" stroke="${TC.line}" stroke-width="4"/>`; }
  // 下の歯ぐきと 下の歯
  const yB = x => 132 - 28 * Math.pow(x / 150, 2);
  s += `<path d="M -230 60 Q -160 132 0 152 Q 160 132 230 60 L 250 200 L -250 200 Z" fill="${TC.gum}"/>`;
  LOWX.forEach((x, i) => {
    const w = LOWW[i], yb = yB(x), tooth = `<rect x="${-w / 2}" y="-64" width="${w}" height="74" rx="13" fill="${TC.baby}" stroke="${TC.line}" stroke-width="4"/>`;
    if (i === 2) { if (out < 1) s += `<g transform="translate(${x} ${yb}) rotate(${wob} 0 6)" opacity="${1 - out}">${tooth}</g>`; if (out > 0) s += `<ellipse cx="${x}" cy="${yb + 4}" rx="${w * 0.36}" ry="9" fill="${TC.gumIn}" opacity="${out}"/>`; }
    else s += `<g transform="translate(${x} ${yb})">${tooth}</g>`;
  });
  s += `</g><path d="${MOUTH_D}" fill="none" stroke="#b9584e" stroke-width="12" stroke-linejoin="round"/>`;
  return s;
}
// ぬけた 子どもの歯（根っこが ほとんどない）。あたまの まん中あたりが 0,0
const lostTooth = (s = 1, rl = 12) => `<g transform="scale(${s}) translate(0 ${BH * 0.45})">${toothSide(BW, BH, rl, { R0: BR0 })}</g>`;
// 小さな歯のしるし（凡例・かぞえる用）
const miniTooth = (x, y, w = 30, fill = TC.baby, { dash = false, o = 1 } = {}) => `<rect x="${x - w / 2}" y="${y - w * 0.6}" width="${w}" height="${w * 1.2}" rx="${w * 0.3}" fill="${dash ? 'none' : fill}" stroke="${dash ? TC.adultDk : TC.line}" stroke-width="${dash ? 3 : 3.5}" ${dash ? 'stroke-dasharray="6 5"' : ''} opacity="${o}"/>`;
const legend = (x, y, o = 1) => g(card(560, 84) + miniTooth(-236, 0, 30) + text(-208, 2, 'こどもの は', { size: 32, w: 900, anchor: 'start' }) + miniTooth(40, 0, 30, TC.adult) + text(68, 2, 'おとなの は', { size: 32, w: 900, anchor: 'start', fill: TC.adultDk }), { x, y, o });

// 下の歯ならびを 上から見た絵（U の字。下が 前歯、上が 奥）。まん中が 0,0
//   lostK: まん中の前歯2本が ぬけた（0〜1）, newK: そこに おとなの歯（0〜1）, wob: その2本の ぐらぐら
//   spotK: 奥の あいている場所の しるし, molK: 6歳ごろの 新しい奥歯（0〜1）, hop: 子どもの歯が ぴょこんと はねる量
const AR = 210;
const ARCH_T = (() => {
  const one = [[9, 60, 44, 0], [28, 60, 46, 0], [47, 58, 54, 0], [70, 76, 66, 1]], out = [];
  [-1, 1].forEach(sd => {
    one.forEach(([a, w, d, m], k) => { const r = a * Math.PI / 180; out.push({ x: sd * AR * Math.sin(r), y: AR * Math.cos(r), rot: -sd * a, w, d, m, front: k === 0 }); });
    out.push({ x: sd * AR, y: -18, rot: 90, w: 82, d: 70, m: 1 });
  });
  return out;
})();
const ARCH_M = [-1, 1].map(sd => ({ x: sd * AR, y: -121, rot: 90, w: 98, d: 82, m: 1 }));
function archTooth(T, fill = TC.baby, { o = 1, s = 1, dash = false, wob = 0 } = {}) {
  if (o <= 0.01) return '';
  const b = dash ? `<rect x="${-T.w / 2}" y="${-T.d / 2}" width="${T.w}" height="${T.d}" rx="${T.d * 0.3}" fill="rgba(255,255,255,0.25)" stroke="#fff" stroke-width="5" stroke-dasharray="12 9"/>`
    : `<rect x="${-T.w / 2}" y="${-T.d / 2}" width="${T.w}" height="${T.d}" rx="${T.d * 0.3}" fill="${fill}" stroke="${TC.line}" stroke-width="4"/>` +
      (T.m ? `<path d="M ${-T.w * 0.26} 0 L ${T.w * 0.26} 0 M 0 ${-T.d * 0.22} L 0 ${T.d * 0.22}" stroke="${mix(fill, TC.line, 0.28)}" stroke-width="4" stroke-linecap="round"/>` : '');
  return `<g transform="translate(${T.x} ${T.y}) rotate(${T.rot + wob}) scale(${s})" opacity="${clamp(o)}">${b}</g>`;
}
function archPic({ lostK = 0, newK = 0, wob = 0, spotK = 0, molK = 0, hop = 0 } = {}) {
  let s = `<rect x="-330" y="-290" width="660" height="600" rx="210" fill="#a5483d"/>`;
  s += `<path d="M ${-AR} -230 L ${-AR} 0 A ${AR} ${AR} 0 0 0 ${AR} 0 L ${AR} -230" fill="none" stroke="${TC.gum}" stroke-width="124" stroke-linecap="round"/>`;
  s += `<path d="M -118 -290 L -118 -20 Q -118 96 0 96 Q 118 96 118 -20 L 118 -290 Z" fill="${TC.tongue}"/><path d="M 0 -250 L 0 30" stroke="${TC.tongueDk}" stroke-width="7" stroke-linecap="round"/>`;
  ARCH_T.forEach((T, i) => {
    if (T.front) { s += archTooth(T, TC.baby, { o: 1 - lostK, wob: wob * (T.x < 0 ? 1 : -1) }); s += archTooth({ ...T, w: T.w + 8, d: T.d + 6 }, TC.adult, { o: newK, s: Math.max(back(newK), 0.001) }); }
    else s += archTooth(T, TC.baby, { s: 1 + hop * Math.max(0, Math.sin(hop * Math.PI * 2 - i * 0.5)) * 0.12 });
  });
  ARCH_M.forEach(T => { s += archTooth(T, TC.adult, { o: spotK * (1 - molK), dash: true }); s += archTooth(T, TC.adult, { o: molK, s: Math.max(back(molK), 0.001) }); });
  return s;
}
// 顔（歯を見せて にっこり）。r: 顔の大きさ、n: 見える歯の数、w: 歯1本の幅
function facePic(r, n, w, fill = TC.baby, hair = TC.hair) {
  const mw = n * w / 2 + 14, mh = w * 1.5 + 16, my = r * 0.36;
  let s = `<circle r="${r}" fill="${TC.skin}"/><path d="M ${-r} ${-r * 0.1} Q ${-r * 1.04} ${-r * 1.06} 0 ${-r * 1.06} Q ${r * 1.04} ${-r * 1.06} ${r} ${-r * 0.1} Q ${r * 0.7} ${-r * 0.62} 0 ${-r * 0.62} Q ${-r * 0.7} ${-r * 0.62} ${-r} ${-r * 0.1} Z" fill="${hair}"/>`;
  s += `<ellipse cx="${-r * 0.38}" cy="${-r * 0.16}" rx="${r * 0.075}" ry="${r * 0.1}" fill="${TC.line}"/><ellipse cx="${r * 0.38}" cy="${-r * 0.16}" rx="${r * 0.075}" ry="${r * 0.1}" fill="${TC.line}"/>`;
  s += `<circle cx="${-r * 0.6}" cy="${r * 0.2}" r="${r * 0.13}" fill="${CH.cheek}" opacity="0.7"/><circle cx="${r * 0.6}" cy="${r * 0.2}" r="${r * 0.13}" fill="${CH.cheek}" opacity="0.7"/>`;
  s += `<path d="M ${-mw} ${my - mh * 0.3} Q 0 ${my - mh * 0.5} ${mw} ${my - mh * 0.3} Q ${mw} ${my + mh * 0.7} 0 ${my + mh * 0.7} Q ${-mw} ${my + mh * 0.7} ${-mw} ${my - mh * 0.3} Z" fill="${TC.mouth}"/>`;
  for (let i = 0; i < n; i++) s += `<rect x="${-n * w / 2 + i * w}" y="${my - mh * 0.36}" width="${w}" height="${w * 1.25}" rx="${w * 0.28}" fill="${fill}" stroke="${TC.line}" stroke-width="3"/>`;
  return s;
}
// サメ と ワニ（どちらも 頭が 左）
const sharkPic = () => `<path d="M -210 10 Q -90 -86 110 -34 L 214 -96 L 176 0 L 214 78 L 110 30 Q -60 84 -210 10 Z" fill="${TC.shark}"/><path d="M -40 -58 L 22 -138 L 62 -44 Z" fill="${TC.sharkDk}"/><path d="M -20 44 L 30 100 L 54 36 Z" fill="${TC.sharkDk}"/>` +
  `<path d="M -206 14 Q -90 70 60 34 Q -60 96 -206 14 Z" fill="#e9f1f5"/><circle cx="-128" cy="-12" r="9" fill="${TC.line}"/><path d="M -196 22 L -92 40" stroke="${TC.line}" stroke-width="5" stroke-linecap="round"/>` +
  [0, 1, 2, 3, 4].map(i => `<path d="M ${-186 + i * 20} ${24 + i * 3.4} l 9 15 l 9 -12 Z" fill="#fff" stroke="${TC.line}" stroke-width="2.5" stroke-linejoin="round"/>`).join('') +
  `<path d="M -66 -8 l 0 30 M -44 -6 l 0 30 M -22 -4 l 0 30" stroke="${TC.sharkDk}" stroke-width="5" stroke-linecap="round"/>`;
const crocPic = () => `<path d="M 60 -8 Q 150 -30 232 -4 Q 150 28 60 26 Z" fill="${TC.crocDk}"/><rect x="-60" y="-34" width="170" height="66" rx="33" fill="${TC.croc}"/>` +
  `<path d="M -40 26 l -10 34 l 34 0 l -4 -30 Z M 60 26 l -8 34 l 34 0 l -4 -32 Z" fill="${TC.crocDk}"/>` +
  `<path d="M -226 -10 L -70 -30 Q -44 -34 -40 0 L -226 4 Z" fill="${TC.croc}"/><path d="M -224 12 L -40 6 Q -44 34 -70 30 Z" fill="${TC.croc}"/><circle cx="-76" cy="-34" r="20" fill="${TC.croc}"/><circle cx="-78" cy="-36" r="9" fill="#fff"/><circle cx="-80" cy="-36" r="5" fill="${TC.line}"/>` +
  [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M ${-214 + i * 24} ${4 - i * 0.2} l 8 14 l 8 -14 Z" fill="#fff" stroke="${TC.line}" stroke-width="2.5" stroke-linejoin="round"/>`).join('') +
  [0, 1, 2, 3].map(i => `<path d="M ${-10 + i * 30} -34 l 12 -14 l 12 14 Z" fill="${TC.crocDk}"/>`).join('');
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;

// 断面の絵を置く場所（under・melt・wobble で同じ場所に置く）
const JX = 760, JY = 384, JS = 0.85;
const jp = (x, y) => [JX + x * JS, JY + y * JS];

// 1. つかみ：ぐらぐらの歯が ぽろっと ぬけた → 根っこが ほとんどない
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="#fdebd3"/><circle cx="330" cy="150" r="230" fill="#fbdfc0"/><circle cx="1700" cy="820" r="300" fill="#fbdfc0"/>`;
    const tPop = c0 + 2.0, MX = 600, MY = 440, MS = 1.0;
    const outK = prog(t, tPop, 0.15), wob = (1 - outK) * Math.sin(t * 9) * (6 + 8 * prog(t, c0, 1.6));
    const zoom = eio(prog(t, c2 - 0.3, 0.8)), LNX = 1010, LNY = 430, ZY = 372;
    out += g(mouthPic({ wob, out: outK, id: 'mph' }), { x: lerp(MX, 400, zoom), y: lerp(MY, 470, zoom), s: lerp(MS, 0.76, zoom), o: 1 - 0.3 * zoom });
    out += g(text(0, 0, 'ぐらぐら', { size: 58, w: 900, fill: C.ochre }), { x: 600 + Math.sin(t * 9) * 5, y: 110, r: -4, o: win(t, 0.5, tPop, 0.25) });
    // ぬけた歯：口から とびだして、右に おちる
    const fk = prog(t, tPop, 0.9);
    if (fk > 0) {
      const x0 = MX + LOWX[2] * MS, y0 = MY + 80, x1 = 1130, y1 = 520;
      const fx = lerp(lerp(x0, x1, eo(fk)), LNX, zoom), fy = lerp(lerp(y0, y1, fk) - Math.sin(fk * Math.PI) * 330, ZY, zoom);
      const sc = lerp(lerp(0.36, 0.6, fk), 1.75, zoom), rot = lerp(-360, 14, eo(fk)) * (1 - zoom);
      const lens = prog(t, c2 - 0.1, 0.5);
      out += g(`<circle r="262" fill="#fffaf0" stroke="${C.blueUi}" stroke-width="16"/><rect x="170" y="196" width="40" height="150" rx="20" fill="${C.ochre}" transform="rotate(-42 190 196)"/>`, { x: LNX, y: LNY, o: lens, s: lerp(0.8, 1, eo(lens)) });
      // 根っこが あるはずの ところ（点線）
      const gh = prog(t, c3 + 0.2, 0.5);
      if (gh > 0) out += g(`<path d="M ${-BW * 0.43} 0 L ${-BW * 0.16} ${BR0} Q 0 ${BR0 + 17} ${BW * 0.16} ${BR0} L ${BW * 0.43} 0" fill="none" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="12 10" stroke-linecap="round"/>` +
        text(0, BR0 * 0.5, '？', { size: 76, w: 900, fill: C.ochre }), { x: LNX, y: ZY + BH * 0.45 * 1.75 + 10, s: 0.8, o: gh * (0.75 + 0.25 * Math.sin(t * 5)) });
      out += g(lostTooth(1), { x: fx, y: fy, s: sc, r: rot });
      if (fk < 1) for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; out += sparkle(x0 + Math.cos(a) * 150 * fk, y0 - 30 + Math.sin(a) * 110 * fk, 20 * (1 - fk), 1 - fk); }
      out += tag(LNX + 112, ZY + BH * 0.45 * 1.75 + 14, 1590, 520, 'ねっこが ほとんど ない', win(t, c2 + 1.6, cueE(4) + 0.6, 0.3), { col: C.redUi, size: 44 });
      out += g(text(0, 0, 'ねっこは どこへ？', { size: 64, w: 900, fill: C.ochre }), { x: 1590, y: 350, o: win(t, c3 + 0.5, cueE(4) + 0.6, 0.3) });
    }
    out += g(text(0, 0, 'ぽろっ', { size: 64, w: 900, fill: C.redUi }), { x: 760, y: 150, r: 6, o: win(t, tPop, tPop + 1.8, 0.2) });
    out += kidShow('S', t, 1640, 850, { s: 0.62, start: 0.3, n: 0, side: 'left', size: 50, end: c2 - 0.5 });
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.redUi}">こどもの は</tspan>は、どうして</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">ぬけて <tspan fill="${TC.adultDk}">はえかわる</tspan>の？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(lostTooth(0.8), { x: -150, r: -12 }) + arrow2(-40, 0, 60, 0, C.ochre, 12) + g(toothSide(AW, AH, 150, { fill: TC.adult, root: TC.aroot, R0: 230 }), { x: 190, y: 20, s: 0.62 }), t, t0 + 1.8, 960, 770);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'ねっこが ほとんど ないのは、どうして？', { size: 62, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'したの おとなの はが うえへ くると、ねっこが とけるから'], ['②', 'こどもの はには、はじめから ねっこが ないから'], ['③', 'はを みがくと、ねっこが すりへるから']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 44)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(g(lostTooth(0.72), { r: -10 }) + text(110, -86, '？', { size: 110, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1650, 350);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 歯ぐきの中：子どもの歯にも根っこがある。その下で、おとなの歯が育っている
SCENES.push({
  id: 'under',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // 口 → たてに切る線 → 右上へ小さく
    const mv = eio(prog(t, c0 + 2.6, 0.9));
    const cutK = prog(t, c0 + 0.9, 0.7);
    let m = mouthPic({ id: 'mpu' });
    m += g(`<line x1="${LOWX[2]}" y1="-250" x2="${LOWX[2]}" y2="${-250 + 500 * eo(cutK)}" stroke="${C.red}" stroke-width="10" stroke-dasharray="26 18" stroke-linecap="round"/>`, { o: cutK });
    out += g(m, { x: lerp(960, 1610, mv), y: lerp(470, 300, mv), s: lerp(0.95, 0.36, mv), o: prog(t, 0.2, 0.4) });
    out += g(text(0, 0, 'ここを たてに きって、よこから みる', { size: 50, w: 900, fill: C.redUi }), { x: 960, y: 800, o: win(t, c0 + 1.0, c0 + 2.8, 0.3) });
    // 断面
    const sO = prog(t, c0 + 2.9, 0.6);
    if (sO > 0) {
      const aO = prog(t, c2 - 0.1, 0.8), glow = win(t, c2, c2 + 3.2, 0.6);
      out += g(jawSec(t, { rl: BR0, ay: 250, adultO: aO, glow }), { x: JX, y: JY + (1 - eo(sO)) * 40, s: JS, o: sO });
      const [bx, by] = jp(-40, -90), [gx, gy] = jp(-330, 44), [kx, ky] = jp(-330, 300), [rx, ry] = jp(26, 120), [ax, ay] = jp(70, 320);
      out += tag(bx, by, 240, 290, 'こどもの は', prog(t, c0 + 3.5, 0.3));
      out += tag(gx, gy, 200, 440, 'はぐき', prog(t, c0 + 3.9, 0.3), { col: TC.gumDk });
      out += tag(kx, ky, 220, 660, 'あごの ほね', prog(t, c0 + 4.3, 0.3), { col: C.ochre });
      out += tag(rx, ry, 1290, 420, 'ねっこ', prog(t, c1 + 0.6, 0.3), { col: C.redUi, size: 48 });
      out += tag(ax, ay, 1310, 700, 'おとなの は', prog(t, c2 + 1.0, 0.3), { col: TC.adultDk, size: 48 });
      if (t > c1 + 0.4 && t < c2) { const k = 0.5 + 0.5 * Math.sin((t - c1) * 6), [px, py] = jp(0, 100); out += `<ellipse cx="${px}" cy="${py}" rx="${92}" ry="${118}" fill="none" stroke="${C.redUi}" stroke-width="6" stroke-dasharray="14 10" opacity="${0.4 + 0.5 * k}"/>`; }
    }
    out += titleAt('うまれた ころから、つくりはじめている', t, c3 + 0.4, 1e9, TC.adultDk, 840, 170, 44);
    out += kidShow('B', t, 1650, 850, { s: 0.5, start: cue(4) - 0.9, n: 0, side: 'left', size: 44 });
    return out;
  },
});

// 4. おとなの歯が上へ → 根っこが とけて 短くなる。とかすのは 小さな細胞
SCENES.push({
  id: 'melt',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const k = eio(prog(t, c0 + 1.2, 6.2)), rl = lerp(BR0, 72, k), ay = rl + 60;
    const cO = prog(t, c1 - 0.2, 0.5);
    out += g(jawSec(t, { rl, ay, arl: 50 * k, cells: cO }), { x: JX, y: JY, s: JS });
    // 上へ の矢印
    const up = win(t, c0 + 0.8, c1 - 0.2, 0.4);
    if (up > 0) { const [ux, uy] = jp(-268, ay + 130), bob = Math.sin(t * 5) * 8; out += g(arrow2(ux, uy + 70 + bob, ux, uy - 50 + bob, TC.adultDk, 14) + text(ux, uy - 92 + bob, 'うえへ', { size: 42, w: 900, fill: TC.adultDk }), { o: up }); }
    // とけて ちる 小さなつぶ
    const [tx, ty] = jp(0, rl + 12);
    if (k > 0.02 && k < 0.99) for (let i = 0; i < 12; i++) { const f = ((t * 0.55 + i / 12) % 1), a = i * 2.4; out += `<circle cx="${tx + Math.cos(a) * (20 + f * 70)}" cy="${ty + 8 + Math.abs(Math.sin(a)) * f * 50}" r="${6 * (1 - f)}" fill="${TC.root}" stroke="${C.ochre}" stroke-width="2" opacity="${1 - f}"/>`; }
    out += tag(tx + 14, ty - 20, 1350, 470, 'ねっこが みじかく なる', win(t, c0 + 3.4, c1 - 0.3, 0.3), { col: C.redUi, size: 46 });
    out += tag(...jp(-40, -90), 240, 290, 'こどもの は', 1);
    out += tag(...jp(-80, ay + 90), 230, 680, 'おとなの は', 1, { col: TC.adultDk });
    // 大きくして見る：細胞
    const lk = prog(t, c1, 0.6);
    if (lk > 0) {
      const LX = 1440, LY = 440, LR = 232;
      out += g(`<line x1="${tx + 40}" y1="${ty + 10}" x2="${LX - LR + 20}" y2="${LY + 40}" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/><circle cx="${tx}" cy="${ty + 14}" r="62" fill="none" stroke="${C.blueUi}" stroke-width="6"/>`, { o: lk });
      let L = `<clipPath id="lensc"><circle r="${LR - 8}"/></clipPath><circle r="${LR}" fill="${TC.hole}" stroke="${C.blueUi}" stroke-width="16"/><g clip-path="url(#lensc)">`;
      const nib = Math.sin(t * 2.2) * 6;
      L += `<path d="M -150 -260 L -112 ${-30 + nib} Q -84 ${-66 + nib} -56 ${-26 + nib} Q -28 ${-64 - nib} 0 ${-22 - nib} Q 28 ${-64 - nib} 56 ${-26 + nib} Q 84 ${-66 + nib} 112 ${-30 + nib} L 150 -260 Z" fill="${TC.root}" stroke="${TC.line}" stroke-width="7" stroke-linejoin="round"/>`;
      [[-84, 30, 0], [0, 42, 2.1], [84, 30, 4.2]].forEach(([x, y, ph]) => { L += cellPic(x, y + Math.sin(t * 9 + ph) * 5, 46, t, ph); });
      for (let i = 0; i < 9; i++) { const f = ((t * 0.7 + i / 9) % 1); L += `<circle cx="${-120 + i * 30 + Math.sin(i * 3) * 8}" cy="${-10 + f * 150}" r="${7 * (1 - f)}" fill="${TC.root}" stroke="${C.ochre}" stroke-width="2" opacity="${(1 - f) * 0.9}"/>`; }
      L += `</g><rect x="150" y="176" width="40" height="150" rx="20" fill="${C.ochre}" transform="rotate(-42 170 176)"/>`;
      out += g(L, { x: LX, y: LY, o: lk, s: lerp(0.85, 1, eo(lk)) });
      out += pop(badge('とかす さいぼう', { fill: TC.cellDk, size: 46 }), t, c1 + 0.9, LX - 20, 740);
      out += g(text(0, 0, 'はの かたい ところを とかす', { size: 38, w: 900, fill: TC.cellDk }), { x: LX - 20, y: 812, o: prog(t, c1 + 2.0, 0.4) });
      out += tag(LX - 150, LY - 120, LX - 60, 170, 'ねっこの さき', prog(t, c1 + 1.2, 0.3) * (1 - prog(t, c2 - 0.3, 0.3)), { col: C.redUi, size: 40 });
    }
    // 病気ではない
    out += pop(card(800, 120) + `<circle cx="-330" cy="0" r="36" fill="none" stroke="${C.accent}" stroke-width="10"/>` + text(-270, 2, 'びょうきでは ない。ふつうの できごと', { size: 40, w: 900, anchor: 'start', fill: C.accent }), t, c2 + 0.5, 880, 168);
    return out;
  },
});

// 5. 根っこが なくなる → ぐらぐら → ぬけて、おとなの歯が出てくる
SCENES.push({
  id: 'wobble',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const tPop = c2 + 1.3;
    const k = eio(prog(t, 0.2, 3.6)), rl = lerp(72, 6, k);
    const wAmp = 3 * prog(t, c0 + 4.0, 1.0) + 8 * prog(t, c1 - 0.2, 0.6) + 5 * prog(t, c2, 1.0);
    const push = prog(t, c1 + 0.2, 0.5) * (1 - prog(t, c2 - 0.3, 0.4));
    const ph = (t - c1) * 6.5, brot = Math.sin(ph) * wAmp;
    const outK = prog(t, tPop, 0.12);
    const rise = eo(prog(t, tPop + 0.5, 2.6));
    const ay = lerp(rl + 60, -AH + 12, rise), arl = lerp(50, 60, k) + 160 * rise;
    out += g(jawSec(t, { rl, ay, arl, baby: 1 - outK, brot, gap: outK * (1 - prog(t, tPop + 1.2, 0.8)) }), { x: JX, y: JY, s: JS });
    // 舌で さわる
    if (push > 0) {
      const [qx, qy] = jp(-BW / 2 - 14 + Math.sin(ph) * 16, -78);
      out += g(`<path d="M -420 -46 L -60 -46 Q 0 -44 0 0 Q 0 44 -60 46 L -420 46 Z" fill="${TC.tongue}" stroke="${TC.tongueDk}" stroke-width="5"/><path d="M -400 0 L -90 0" stroke="${TC.tongueDk}" stroke-width="5" stroke-linecap="round"/>`, { x: lerp(qx - 300, qx, eo(push)), y: qy, o: Math.min(1, push * 2) });
      out += g(text(0, 0, 'した', { size: 40, w: 900, fill: TC.tongueDk }), { x: 330, y: qy - 86, o: push });
    }
    // ぐらぐら
    const gO = win(t, c1 + 0.3, tPop, 0.3);
    if (gO > 0) {
      const [wx, wy] = jp(0, -80);
      out += g(`<path d="M ${wx + 96} ${wy - 50} q 26 46 0 92 M ${wx + 128} ${wy - 66} q 34 62 0 124" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-linecap="round"/>`, { o: gO * (0.5 + 0.5 * Math.abs(Math.sin(ph))) });
      out += g(text(0, 0, 'ぐらぐら', { size: 76, w: 900, fill: C.ochre }), { x: 1140 + Math.sin(ph) * 8, y: 300, r: Math.sin(ph) * 4, o: gO });
    }
    out += tag(...jp(-BW / 2 - 4, 30), 430, 200, 'はぐきだけで とまっている', win(t, c0 + 3.6, c1 + 0.2, 0.3), { col: TC.gumDk, size: 42 });
    out += tag(...jp(30, rl + 4), 1300, 470, 'ねっこが ほとんど ない', win(t, c0 + 2.6, c1 - 0.2, 0.3), { col: C.redUi, size: 42 });
    // ぬけた歯：とんで、右に おちる
    const fk = prog(t, tPop, 1.0);
    if (fk > 0) {
      const [x0, y0] = jp(0, -70), x1 = 1230, y1 = 690;
      const fx = lerp(x0, x1, eo(fk)), fy = lerp(y0, y1, fk * fk) - Math.sin(fk * Math.PI) * 240;
      out += g(lostTooth(1, 6), { x: fx, y: fy, s: JS * lerp(1, 0.8, fk), r: lerp(0, 380, eo(fk)) });
      out += g(text(0, 0, 'ぬけた は', { size: 40, w: 900, fill: C.muted }), { x: 1230, y: 800, o: prog(t, tPop + 1.1, 0.3) });
      out += g(text(0, 0, 'ぽろっ', { size: 70, w: 900, fill: C.redUi }), { x: 1060, y: 250, r: 6, o: win(t, tPop, tPop + 1.6, 0.2) });
    }
    if (rise > 0.9) { const [sx, sy] = jp(0, -70); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t; out += sparkle(sx + Math.cos(a) * 190, sy + Math.sin(a) * 130, 16 + 8 * Math.sin(t * 6 + i), 0.9 * prog(t, tPop + 2.9, 0.4)); } }
    out += tag(...jp(-60, -80), 250, 300, 'おとなの は', prog(t, tPop + 2.6, 0.4), { col: TC.adultDk, size: 48 });
    out += kidShow('K', t, 1650, 846, { s: 0.7, start: c3 - 0.9, n: 0 });
    return out;
  },
});

// 6. どうして 2組？ 小さい顔には小さな歯。サメやワニは何度でも、ヒトは1回だけ
SCENES.push({
  id: 'why',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, c4 - 0.5, 0.4);
    if (aO > 0) {
      let a = '';
      // 問い
      const qO = win(t, c0, c1 - 0.2, 0.4);
      a += g(text(0, -200, 'どうして、はじめから', { size: 64, w: 900 }) + text(0, -110, 'おとなの はじゃ ないの？', { size: 64, w: 900 }) +
        g(toothSide(BW, BH, 150, { R0: 150 }), { x: -190, y: 150, s: 0.8 }) + g(toothSide(AW, AH, 200, { fill: TC.adult, root: TC.aroot, R0: 200 }), { x: 170, y: 150, s: 0.95 }) + text(0, 110, '？', { size: 120, w: 900, fill: C.ochre }), { x: 960, y: 470, o: qO });
      // 小さい顔・大きい顔
      const LXc = 540, RXc = 1330;
      a += pop(facePic(138, 6, 17), t, c1 + 0.1, LXc, 410);
      a += g(text(0, 0, 'ちいさい かおに、ちいさな は', { size: 42, w: 900 }), { x: LXc, y: 596, o: prog(t, c1 + 0.9, 0.4) });
      a += g(arrow2(-90, 0, 90, 0, C.ochre, 14) + text(0, -50, 'おおきく なると', { size: 36, w: 900, fill: C.ochre }), { x: 930, y: 400, o: prog(t, c2 + 0.1, 0.4) });
      a += pop(facePic(196, 8, 26, TC.adult), t, c2 + 0.5, RXc, 364);
      a += g(text(0, 0, 'おおきくて、かずの おおい は', { size: 42, w: 900, fill: TC.adultDk }), { x: RXc, y: 596, o: prog(t, c2 + 1.5, 0.4) });
      // かぞえる
      for (let i = 0; i < 20; i++) { const k = prog(t, c3 + 0.2 + i * 0.05, 0.2); if (k > 0) a += g(miniTooth(0, 0, 28), { x: LXc - 9 * 17 + (i % 10) * 34, y: 660 + Math.floor(i / 10) * 44, s: Math.max(back(k), 0.001) }); }
      a += pop(badge('20ぽん', { fill: C.redUi, size: 46 }), t, c3 + 1.3, LXc, 790);
      for (let i = 0; i < 32; i++) { const k = prog(t, c3 + 2.2 + i * 0.04, 0.2), col = i % 16, row = Math.floor(i / 16); if (k > 0) a += g(miniTooth(0, 0, 28, TC.adult, { dash: col >= 14 }), { x: RXc - 15 * 17 + col * 34, y: 660 + row * 44, s: Math.max(back(k), 0.001) }); }
      a += pop(badge('28〜32ほん', { fill: TC.adultDk, size: 46 }), t, c3 + 3.6, RXc, 790);
      out += g(a, { o: aO });
    }
    const bO = prog(t, c4 - 0.2, 0.5);
    if (bO > 0) {
      let b = '';
      b += pop(card(820, 560) + g(sharkPic(), { x: -170, y: -130, s: 0.95 }) + text(190, -130, 'サメ', { size: 54, w: 900, fill: TC.sharkDk }) +
        g(crocPic(), { x: -160, y: 60, s: 0.95 }) + text(190, 60, 'ワニ', { size: 54, w: 900, fill: TC.crocDk }), t, c4, 520, 470);
      b += pop(badge('なんどでも はえかわる', { fill: C.blueUi, size: 46 }), t, c4 + 1.2, 520, 690);
      b += pop(card(760, 560) + g(facePic(120, 6, 15), { x: -210, y: -70 }) + arrow2(-70, -70, 50, -70, C.ochre, 14) + g(facePic(150, 8, 20, TC.adult), { x: 210, y: -80 }) + text(0, 130, 'ヒト', { size: 54, w: 900 }), t, c4 + 2.6, 1380, 470);
      b += pop(badge('はえかわりは 1かいだけ', { fill: C.redUi, size: 46 }), t, c4 + 3.4, 1380, 690);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 7. ぬける順番と、何も追い出さない 新しい奥歯
SCENES.push({
  id: 'molar',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const AX = 700, AY = 500;
    const wobK = win(t, c0 + 1.2, c0 + 3.6, 0.3), lostK = prog(t, c0 + 3.4, 0.4), newK = prog(t, c0 + 4.4, 0.6);
    const spotK = prog(t, c1 + 0.4, 0.4), molK = prog(t, c1 + 3.4, 0.7);
    const hopT = t - (c2 + 0.5), hop = hopT > 0 && hopT < 2 ? hopT / 2 : 0;
    out += g(archPic({ lostK, newK, wob: Math.sin(t * 10) * 10 * wobK, spotK, molK, hop }), { x: AX, y: AY, o: prog(t, 0.2, 0.4) });
    out += g(text(0, 0, 'したの はを、うえから みた ところ', { size: 40, w: 900, fill: C.muted }), { x: 760, y: 170, o: prog(t, 0.4, 0.4) });
    out += g(text(0, 0, 'おく', { size: 40, w: 900, fill: C.muted }) + arrow2(0, -30, 0, -90, C.muted, 8), { x: 310, y: 330, o: prog(t, 0.6, 0.4) });
    out += g(text(0, 0, 'まえ', { size: 40, w: 900, fill: C.muted }) + arrow2(0, 34, 0, 94, C.muted, 8), { x: 310, y: 640, o: prog(t, 0.6, 0.4) });
    // 最初にぬける：下のまん中の前歯
    const fO = win(t, c0 + 0.4, c1 + 0.2, 0.3);
    out += g(`<ellipse cx="${AX}" cy="${AY + 207}" rx="82" ry="46" fill="none" stroke="${C.red}" stroke-width="8"/>`, { o: fO * (0.6 + 0.4 * Math.sin(t * 6)) });
    out += tag(AX + 80, AY + 214, 1400, 640, 'さいしょに ぬける（ふつう）', fO, { col: C.redUi, size: 44 });
    out += pop(badge('6〜7さいごろ', { fill: C.redUi, size: 46 }), t, c0 + 2.2, 1400, 740, { end: c1 + 0.2 });
    // 奥の さらに 奥に、新しい奥歯
    const [m0, m1] = ARCH_M;
    if (spotK > 0 && molK < 1) [m0, m1].forEach(M => { out += `<circle cx="${AX + M.x}" cy="${AY + M.y}" r="${74 + 8 * Math.sin(t * 6)}" fill="none" stroke="${C.yellow}" stroke-width="8" opacity="${spotK * (1 - molK)}"/>`; });
    out += tag(AX + m1.x + 46, AY + m1.y - 10, 1420, 330, 'あたらしい おくば', prog(t, c1 + 3.8, 0.3), { col: TC.adultDk, size: 48 });
    out += g(text(0, 0, '6さいごろ（6さいきゅうし）', { size: 38, w: 900, fill: TC.adultDk }), { x: 1420, y: 410, o: prog(t, c1 + 4.4, 0.4) });
    out += tag(AX + m1.x + 50, AY + m1.y + 6, 1400, 330, 'あいている ばしょ', win(t, c1 + 0.8, c1 + 3.3, 0.3), { col: C.ochre, size: 44 });
    if (molK > 0 && molK < 1) [m0, m1].forEach(M => { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; out += sparkle(AX + M.x + Math.cos(a) * 100 * molK, AY + M.y + Math.sin(a) * 100 * molK, 18 * (1 - molK), 1 - molK); } });
    // どの歯も追い出さない
    out += pop(card(760, 200) + `<path d="M -320 -36 l 22 24 l 40 -48" fill="none" stroke="${C.accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` + text(-236, -40, 'どの はも おしださない', { size: 44, w: 900, anchor: 'start', fill: C.accent }) +
      text(-236, 40, 'あいている ばしょに はえるだけ', { size: 36, w: 900, anchor: 'start', fill: C.muted }), t, c2 + 0.4, 1440, 600);
    out += legend(1500, 200, prog(t, c0 + 4.6, 0.4));
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
      const CX = 960, CY = 330, NX = -620, as = 'したの おとなの はが うえへ くると、ねっこが とけるから';
      let a = pop(card(1420, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, as, { size: fit(as, 1180, 46, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['おとなの はが うえへ', TC.adultDk], ['ねっこが とけて みじかく', TC.cellDk], ['ぐらぐらして ぬける', C.redUi]], t, 960, 600, { start: 2.4, step: 1.1, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [g(eyeIcon(0.3)), 'かがみで くちを あけて、おくの さらに おくを みる', C.ink, cue(1)],
        [miniTooth(0, 0, 40, TC.adult), 'あたらしい おおきな おくばが、でているかも', TC.adultDk, cue(2)],
        [warnIcon(0.5), 'みるだけ。ゆびを くちの おくまで いれない', C.red, cue(3)],
        [warnIcon(0.5), 'ぐらぐらの はは、むりに ひっぱらない', C.red, cue(4)],
        [miniTooth(0, 0, 40), 'なかなか ぬけない ときは、はいしゃさんに そうだん', C.ink, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 990, 44, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 320 + i * 100); });
      // 鏡の中：口の奥の、新しい奥歯
      const PX = 1540, PYc = 500;
      let p = `<rect x="-290" y="-290" width="580" height="580" rx="60" fill="#c8e3ee" stroke="${C.ochre}" stroke-width="18"/><path d="M -230 -200 L -150 -250 M -236 -140 L -110 -220" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.8"/>`;
      p += g(archPic({ lostK: 1, newK: 1, spotK: 1, molK: 1 }), { y: 14, s: 0.78 });
      const rO = prog(t, cue(2) - 0.2, 0.4);
      ARCH_M.forEach(M => { p += `<circle cx="${M.x * 0.78}" cy="${14 + M.y * 0.78}" r="${62 + 7 * Math.sin(t * 6)}" fill="none" stroke="${C.yellow}" stroke-width="9" opacity="${rO}"/>`; });
      // 指は入れない
      const fO = win(t, cue(3) + 0.2, cue(4) - 0.2, 0.3);
      if (fO > 0) p += g(`<rect x="-34" y="-150" width="68" height="300" rx="34" fill="${TC.skin}" stroke="${TC.skinSh}" stroke-width="6" transform="rotate(38)"/>`, { x: 190, y: 190, o: fO }) + g(cross(0, 0, 0.9), { x: 150, y: 140, o: fO });
      b += pop(p, t, cue(1) + 0.4, PX, PYc);
      b += g(text(0, 0, 'かがみ', { size: 36, w: 900, fill: C.ochre }), { x: PX, y: PYc + 322, o: prog(t, cue(1) + 0.9, 0.4) });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「は」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

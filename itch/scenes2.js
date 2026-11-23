// みのまわり図鑑 動画「かゆいところを かくと、どうして もっと かゆくなるの？」（かゆみ）
// 出どころ：everyday-trivia trivia/itch-scratch.md（絵の見本：assets/figures-itch.js、メモ：ideas/notes/itch.md）
// 色の約束：かゆみの合図＝オレンジの波線、痛みの合図＝赤の矢印、かゆみのもと＝黄色のつぶ、セロトニン（脳の痛みどめ）＝むらさきのつぶ、冷たい＝青

// ---------- かゆみの道具 ----------
const IT = {
  skin: '#f6d6bd', skinSh: '#ecc0a2', skinLn: '#d9a888', body: '#fdeee2', bodyLn: '#e0b497',
  epi: '#f6d3c0', epiLn: '#e6ae98', der: '#f7cbc0', derDk: '#e39a8b', brick: '#fbe3d0', brickLn: '#d9a888',
  itch: '#f08a24', itchDk: '#c4640a', itchLt: '#ffd9ae', pain: '#e8412c', painDk: '#b52a1a',
  hist: '#f6c21c', histDk: '#a87f00', sero: '#9a6cf0', seroDk: '#5e3bb8', next: '#f06a9a', nextDk: '#c23a70',
  nerve: '#f6b877', cold: '#4f9ee0', coldDk: '#2f6fb0', coldLt: '#d9ecfa', towel: '#eef6fb',
  brain: '#f7b9c4', brainDk: '#d77f93', bone: '#f4ecd6', boneDk: '#cbb98c', cord: '#ffe9a8', cordDk: '#d9b85a',
  bump: '#f2928a', bumpDk: '#d9655c', mast: '#fff6e2', mastLn: '#c79a4e', saliva: '#4f95d6', salivaDk: '#2f6fb0',
  bug: '#6f9a3e', bugDk: '#48702a',
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
// ラベルだけ（白い ふち つき）
const lab = (x, y, str, o = 1, { col = C.ink, size = 42 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<rect x="${x - w / 2}" y="${y - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(x, y + 2, str, { size, w: 900, fill: col }), { o });
};
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
const sparkle = (x, y, r, o = 1, col = C.yellow) => o <= 0.01 ? '' : `<path d="M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="${col}" opacity="${clamp(o)}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const dot = (x, y, r, col, dk, o = 1) => o <= 0.01 ? '' : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${col}" stroke="${dk}" stroke-width="${Math.max(2, r * 0.22)}" opacity="${clamp(o)}"/><circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${r * 0.28}" fill="#fff" opacity="${0.75 * clamp(o)}"/>`;
// かゆみの ギザギザ（オレンジ）。k: つよさ（1 ふつう、2 とても）
const zig = (x, y, s, r, col, o = 1) => `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(1)}) scale(${s})" d="M -30 0 l 10 -14 l 10 14 l 10 -14 l 10 14 l 10 -14 l 10 14" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="${clamp(o)}"/>`;
function itchy(x, y, t, k = 1, o = 1, R = 78) {
  if (o <= 0.01 || k <= 0.01) return '';
  const n = k > 1.3 ? 7 : 4;
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.14 + 0.72 * i / (n - 1)), rr = (R + (i % 2) * R * 0.34) * (0.82 + 0.2 * k) + Math.sin(t * 9 + i * 2) * 6;
    s += zig(x + Math.cos(a) * rr * 1.25, y + Math.sin(a) * rr, 0.5 + 0.22 * k, a * 180 / Math.PI + 90 + Math.sin(t * 11 + i) * 8, IT.itch, o);
  }
  return s;
}
// うで（横から。上の線が y）
const armSide = (x0, x1, y, h = 170) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" rx="${h / 2}" fill="${IT.skin}"/><path d="M ${x0 + h / 2} ${y + h - 16} L ${x1 - h / 2} ${y + h - 16}" stroke="${IT.skinSh}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`;
// ふくらみ（k: 大きさ 0〜1、red: 0〜1 かいて 赤くなった）
function bump(x, y, r, k = 1, red = 0) {
  if (k <= 0.01) return '';
  const h = r * 0.62 * k * (1 + red * 0.25), w = r * (0.5 + 0.5 * k) * (1 + red * 0.2), c = mix(IT.bump, '#e8584a', red), d = mix(IT.bumpDk, '#b02a20', red);
  let s = `<ellipse cx="${x}" cy="${y + 14}" rx="${w * 1.5}" ry="${22 * k}" fill="${c}" opacity="${0.4 + red * 0.2}"/>` +
    `<path d="M ${x - w} ${y + 2} C ${x - w * 0.7} ${y - h * 1.2} ${x + w * 0.7} ${y - h * 1.2} ${x + w} ${y + 2} Z" fill="${c}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/>` +
    `<circle cx="${x}" cy="${y - h * 0.62}" r="${5 * k}" fill="${d}"/>`;
  if (red > 0.05) s += `<path d="M ${x - w * 0.9} ${y - h * 0.2} l ${w * 0.3} ${-h * 0.42} M ${x - w * 0.35} ${y - h * 0.16} l ${w * 0.34} ${-h * 0.5} M ${x + w * 0.2} ${y - h * 0.14} l ${w * 0.3} ${-h * 0.42}" stroke="${mix(d, '#7a1410', 0.3)}" stroke-width="4" stroke-linecap="round" opacity="${0.8 * red}"/>`;
  else s += `<path d="M ${x - w * 0.5} ${y - h * 0.5} Q ${x - w * 0.3} ${y - h * 0.82} ${x - w * 0.05} ${y - h * 0.84}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`;
  return s;
}
// 上から のびてくる 手（ゆびさきが 0,0 あたり。つめが 下）
const HAND = (() => {
  const st = `stroke="${IT.skinLn}" stroke-width="5"`;
  let s = `<rect x="-58" y="-900" width="116" height="760" rx="50" fill="${IT.skin}" ${st}/>`;
  s += `<ellipse cx="-96" cy="-128" rx="27" ry="54" transform="rotate(24 -96 -128)" fill="${IT.skin}" ${st}/>`;
  s += `<rect x="-84" y="-204" width="168" height="128" rx="48" fill="${IT.skin}" ${st}/>`;
  [[-57, 10, -5], [-19, 0, -2], [19, 3, 2], [57, 16, 5]].forEach(([x, dy, r]) => {
    s += `<g transform="translate(${x} ${-dy}) rotate(${r})"><rect x="-17" y="-104" width="34" height="104" rx="17" fill="${IT.skin}" ${st}/><rect x="-10" y="-23" width="20" height="18" rx="8" fill="#fff8f2" stroke="${IT.skinLn}" stroke-width="3"/></g>`;
  });
  s += `<rect x="-74" y="-150" width="148" height="66" rx="24" fill="${IT.skin}"/>`;
  return s;
})();
const hand = (x, y, { s = 1, r = 0, o = 1 } = {}) => g(HAND, { x, y, s, r, o });
const HAND_S = HAND.replace('y="-900" width="116" height="760"', 'y="-300" width="116" height="160"');
// 蚊（横から。頭が 左。fly: とんでいる）
function mosq(t, fly = 0) {
  const wa = fly ? Math.sin(t * 60) * 26 : Math.sin(t * 3) * 2, cb = '#4a4a4a';
  const lg = fly ? `M -14 14 L -8 52 L 26 74 M 0 16 L 16 54 L 52 70 M 14 14 L 46 44 L 84 54` : `M -14 14 L -50 62 L -60 112 M 0 16 L 8 70 L 0 112 M 14 14 L 62 60 L 86 112`;
  let s = `<path d="${lg}" fill="none" stroke="${cb}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<ellipse cx="78" cy="16" rx="60" ry="24" transform="rotate(10 78 16)" fill="#b0343c"/>`;
  s += `<ellipse cx="44" cy="-34" rx="64" ry="15" transform="rotate(${-18 + wa} 2 -16)" fill="#e8f2f6" fill-opacity="0.85" stroke="#7a8a90" stroke-width="3"/>`;
  s += `<ellipse cx="0" cy="0" rx="31" ry="25" fill="${cb}"/><path d="M -10 -12 l 16 0" stroke="#f4f4f4" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M -46 -18 l -30 -26 M -40 -22 l -16 -36" stroke="${cb}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<circle cx="-40" cy="-6" r="18" fill="${cb}"/><circle cx="-46" cy="-9" r="7" fill="#fff"/><circle cx="-48" cy="-9" r="4" fill="${C.ink}"/>`;
  s += `<line x1="-52" y1="4" x2="${fly ? -118 : -64}" y2="${fly ? 36 : 112}" stroke="${cb}" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}
// 小さな虫（横から。頭が 左。足もとが 0,0）
function bug(t, walk = 1) {
  const lg = i => Math.sin(t * 16 + i * 2.1) * 9 * walk;
  let s = '';
  [-22, 0, 22].forEach((x, i) => { s += `<path d="M ${x} -18 L ${x + lg(i)} 0" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`; });
  s += `<ellipse cx="6" cy="-34" rx="42" ry="26" fill="${IT.bug}" stroke="${IT.bugDk}" stroke-width="4"/><path d="M 6 -60 L 6 -9" stroke="${IT.bugDk}" stroke-width="3"/><circle cx="-12" cy="-40" r="6" fill="${IT.bugDk}"/><circle cx="26" cy="-34" r="7" fill="${IT.bugDk}"/>`;
  s += `<circle cx="-42" cy="-30" r="18" fill="${IT.bugDk}"/><circle cx="-48" cy="-34" r="6" fill="#fff"/><circle cx="-50" cy="-34" r="3" fill="${C.ink}"/>`;
  s += `<path d="M -52 -44 q -14 -16 -26 -10 M -46 -47 q -4 -20 -18 -22" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
  return s;
}
// 氷を タオルで まいたもの（まん中が 0,0）
const icePack = () => `<path d="M -120 20 Q -136 -70 -40 -84 Q 60 -100 118 -40 Q 150 30 80 62 Q -30 96 -120 20 Z" fill="${IT.towel}" stroke="${IT.coldDk}" stroke-width="6" stroke-linejoin="round"/>` +
  `<path d="M -92 -30 Q -20 -64 70 -44 M -100 8 Q -10 -30 104 -6 M -70 40 Q 10 14 96 30" fill="none" stroke="${IT.cold}" stroke-width="6" stroke-linecap="round" opacity="0.55"/>` +
  `<g transform="translate(-6 -98) rotate(-10)"><rect x="-34" y="-30" width="54" height="50" rx="9" fill="${IT.coldLt}" stroke="${IT.coldDk}" stroke-width="5"/><path d="M -24 -18 l 14 0" stroke="#fff" stroke-width="6" stroke-linecap="round"/></g>` +
  `<g transform="translate(46 -86) rotate(14)"><rect x="-22" y="-22" width="44" height="42" rx="8" fill="${IT.coldLt}" stroke="${IT.coldDk}" stroke-width="5"/><path d="M -12 -10 l 10 0" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>` +
  `<path d="M -80 -74 Q -30 -60 20 -78 Q 60 -70 100 -52" fill="none" stroke="${IT.coldDk}" stroke-width="6" stroke-linecap="round"/>`;
const coolMarks = (x, y, t, o = 1) => o <= 0.01 ? '' : [[-150, -70], [150, -90], [-120, 60], [170, 30], [0, -170]].map(([dx, dy], i) => sparkle(x + dx, y + dy + Math.sin(t * 3 + i) * 6, 20 + (i % 2) * 8, o * (0.6 + 0.4 * Math.sin(t * 4 + i * 1.7)), IT.cold)).join('');
// 文字の ふきだし風（ギザギザの ふち）
function burst(x, y, str, t, st, { col = IT.itchDk, size = 60, end = 1e9, shake = 0 } = {}) {
  const k = back(prog(t, st, 0.4)), o = Math.min(prog(t, st, 0.15), 1 - prog(t, end - 0.3, 0.3));
  if (o <= 0.001) return '';
  const w = tw(str, size, 900) / 2 + 56, h = size * 1.05, n = 18; let d = '';
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 1 : 1.16; d += (i ? ' L ' : 'M ') + (Math.cos(a) * w * r).toFixed(1) + ' ' + (Math.sin(a) * h * r).toFixed(1); }
  return g(`<path d="${d} Z" fill="#fff" stroke="${col}" stroke-width="7" stroke-linejoin="round"/>` + ctext(0, 3, str, { size, w: 900, fill: col }), { x: x + Math.sin(t * 30) * shake, y, s: Math.max(k, 0.001), o });
}

// ---------- からだの 図（うで → せきずい → 脳） ----------
const BX = 1180, BRX = 1200;           // せぼねの x、脳の まん中の x
const BITE = [600, 514];               // さされた ところ（うでの 上）
const NP = [[600, 522], [760, 548], [1000, 566], [1100, 598], [BX, 640], [BX, 470], [BX, 330]];  // 神経の 道（さされた所 → せきずい → 脳）
const JUNC = [BX, 640];                // 神経が せきずいに 入る ところ
const _seg = P => P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1]));
const NPL = _seg(NP), NPT = NPL.reduce((a, b) => a + b, 0), UJ = (NPL[0] + NPL[1] + NPL[2] + NPL[3]) / NPT;
function polyAt(P, SL_, s) {
  s = Math.max(0, Math.min(SL_.reduce((a, b) => a + b, 0) - 0.01, s));
  for (let i = 0; i < SL_.length; i++) { if (s <= SL_[i]) { const k = s / SL_[i], a = P[i], b = P[i + 1]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[1] - a[1], b[0] - a[0])]; } s -= SL_[i]; }
  return [...P[P.length - 1], 0];
}
// かゆみの合図（オレンジの波）。u: 0〜1 道の どこか
function wave(u, { len = 150, amp = 13, col = IT.itch, w = 9, o = 1, cyc = 2.5 } = {}) {
  if (o <= 0.01 || u <= 0 || u >= 1) return '';
  const c = u * NPT, n = 26; let d = '';
  for (let i = 0; i <= n; i++) {
    const s = c - len / 2 + len * i / n; if (s < 0 || s > NPT) continue;
    const [x, y, a] = polyAt(NP, NPL, s), off = Math.sin(i / n * Math.PI * 2 * cyc) * amp * Math.sin(Math.PI * i / n);
    d += (d ? ' L ' : 'M ') + (x - Math.sin(a) * off).toFixed(1) + ' ' + (y + Math.cos(a) * off).toFixed(1);
  }
  return d ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${clamp(o)}"/>` : '';
}
// 痛みの合図（赤い矢印）
function painArrow(u, o = 1) {
  if (o <= 0.01 || u <= 0.02 || u >= 1) return '';
  const c = u * NPT, [x1, y1] = polyAt(NP, NPL, c - 34), [x2, y2] = polyAt(NP, NPL, c + 34);
  return g(arrow2(x1, y1, x2, y2, IT.pain, 12), { o });
}
// 脳（まん中が 0,0）
const BRAIN = (() => {
  const B = [[-84, -30, 52], [-36, -62, 54], [28, -64, 56], [84, -34, 52], [104, 14, 44], [-104, 14, 44], [-56, 34, 52], [0, 40, 56], [58, 34, 52], [0, -10, 70]];
  let s = B.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 5}" fill="${IT.brainDk}"/>`).join('') + B.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${IT.brain}"/>`).join('');
  s += `<path d="M -96 -8 q 30 -24 54 0 t 54 0 M -30 -74 q -14 34 12 52 M 40 -80 q 22 30 -4 58 M -70 52 q 24 -24 52 -4 M 30 60 q 16 -30 52 -22 M 60 -16 q 26 -10 46 8" fill="none" stroke="${IT.brainDk}" stroke-width="6" stroke-linecap="round"/>`;
  return s;
})();
// からだ。face: 'calm' | 'itchy' | 'relief' | 'itchy2'、glow: 脳の 光（0〜1.4）
function bodyFig(t, { face = 'calm', glow = 0, glowCol = IT.itch } = {}) {
  const shapes = [
    `<rect x="1010" y="500" width="340" height="760" rx="112"`,
    `<rect x="1316" y="536" width="96" height="460" rx="48" transform="rotate(-7 1364 560)"`,
    `<rect x="440" y="512" width="640" height="100" rx="50"`,
    `<circle cx="446" cy="562" r="60"`,
    `<rect x="1136" y="430" width="88" height="110"`,
    `<circle cx="${BX - 10}" cy="300" r="172"`, `<circle cx="1000" cy="356" r="24"`,
  ];
  let s = shapes.map(p => `${p} fill="${IT.bodyLn}" stroke="${IT.bodyLn}" stroke-width="12"/>`).join('') + shapes.map(p => `${p} fill="${IT.body}"/>`).join('');
  // せぼねと せきずい
  for (let y = 512; y < 860; y += 46) s += `<rect x="${BX - 46}" y="${y}" width="92" height="36" rx="13" fill="${IT.bone}" stroke="${IT.boneDk}" stroke-width="4"/>`;
  s += `<line x1="${BX}" y1="400" x2="${BX}" y2="900" stroke="${IT.cordDk}" stroke-width="26" stroke-linecap="round"/><line x1="${BX}" y1="400" x2="${BX}" y2="900" stroke="${IT.cord}" stroke-width="18" stroke-linecap="round"/>`;
  // 神経（さされた所から せきずいへ）
  s += `<path d="M ${NP.slice(0, 5).map(p => p.join(' ')).join(' L ')}" fill="none" stroke="${IT.nerve}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  // 脳
  if (glow > 0.01) s += `<circle cx="${BRX}" cy="250" r="${150 + 20 * Math.sin(t * 6)}" fill="${glowCol}" opacity="${clamp(0.5 * glow)}" filter="url(#glow)"/>`;
  s += g(BRAIN, { x: BRX, y: 256, s: 0.98 + (glow > 0.8 ? Math.sin(t * 12) * 0.012 * glow : 0) });
  // かお（横顔。うでの ほうを 見ている）
  const ex = 1050, ey = 334, mx = 1040, my = 410, ln = `stroke="${CH.line}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  s += `<circle cx="1066" cy="388" r="17" fill="${CH.cheek}" opacity="0.6"/>`;
  if (face === 'calm') s += `<ellipse cx="${ex}" cy="${ey}" rx="9" ry="12" fill="${CH.line}"/><circle cx="${ex - 3}" cy="${ey - 5}" r="3.5" fill="#fff"/><path d="M ${mx - 16} ${my - 2} Q ${mx - 2} ${my + 10} ${mx + 12} ${my}" ${ln}/>`;
  else if (face === 'relief') s += `<path d="M ${ex - 14} ${ey + 4} Q ${ex} ${ey - 13} ${ex + 14} ${ey + 4}" ${ln}/><path d="M ${mx - 18} ${my - 6} Q ${mx - 2} ${my + 18} ${mx + 14} ${my - 6} Z" fill="#8e3b33"/>`;
  else {
    const b = face === 'itchy2' ? 1.3 : 1, j = Math.sin(t * 22) * (face === 'itchy2' ? 2.5 : 1.2);
    s += `<path d="M ${ex - 13 * b} ${ey - 10 * b} L ${ex + 11 * b} ${ey} L ${ex - 13 * b} ${ey + 10 * b}" ${ln}/>`;
    s += `<path d="M ${mx - 22 * b} ${my + j} l ${8 * b} ${-8} l ${8 * b} 8 l ${8 * b} ${-8} l ${8 * b} 8 l ${8 * b} ${-8}" ${ln}/>`;
    if (face === 'itchy2') s += `<path d="M 1100 300 q -12 18 0 26 q 12 -8 0 -26 Z" fill="${IT.cold}" opacity="0.8"/>`;
  }
  // さされた ところ
  s += bump(BITE[0], BITE[1], 40, 1, face === 'itchy2' ? 0.8 : 0);
  return s;
}
// 図の ラベル（脳・せきずい）
const bodyTags = (t, st1 = 0, st2 = 0) => tag(1312, 236, 1590, 190, 'のう', prog(t, st1, 0.3), { col: IT.brainDk, size: 46 }) +
  tag(1204, 742, 1590, 742, 'せきずい', prog(t, st2, 0.3), { col: IT.histDk, size: 46 }) + g(ctext(1590, 806, 'せぼねの なか', { size: 34, w: 700, fill: C.muted }), { o: prog(t, st2 + 0.3, 0.3) });
// かゆみの合図の 流れ（start から dt おきに、T 秒かけて stop まで進む。open: せきずいの 門が 開いているか を返す関数）
function itchStream(t, start, { dt = 0.85, T = 2.6, until = 1e9, gateAt = 1e9, reopen = 1e9, strong = 0 } = {}) {
  let s = '';
  for (let k = 0; k < 60; k++) {
    const t0 = start + k * dt; if (t0 > t || t0 > until) break;
    let u = (t - t0) / T; if (u >= 1) continue;
    // 門（せきずいの 入口）に 着く 時刻
    const tj = t0 + UJ * T, blocked = tj > gateAt && tj < reopen;
    let o = 1;
    if (blocked) { if (u > UJ - 0.02) continue; o = clamp((UJ - 0.02 - u) / 0.12); }
    const big = strong && tj >= reopen ? 1 : 0;
    s += wave(u, big ? { len: 190, amp: 22, w: 14, o } : { o });
  }
  return s;
}

// 1. つかみ：蚊に さされて かゆい → かくと すっ → 少したつと もっと かゆい
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const CX = 1270, CY = 470, W = 1100, H = 620, AY = CY + 60, PXb = CX;
    const tS = cue(1), tM = cue(2) + 2.6;   // かきはじめ／もっと かゆくなる とき
    let c = `<clipPath id="hkc"><rect x="${CX - W / 2}" y="${CY - H / 2}" width="${W}" height="${H}" rx="40"/></clipPath>`;
    c += `<rect x="${CX - W / 2}" y="${CY - H / 2}" width="${W}" height="${H}" rx="40" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#hkc)"><rect x="${CX - W / 2}" y="${CY - H / 2}" width="${W}" height="${H}" fill="#eef5f1"/>`;
    c += armSide(CX - W, CX + W, AY, 300);
    const red = prog(t, tM, 0.8), bk = eo(prog(t, 0.9, 1.4));
    c += bump(PXb, AY, 120, bk, red);
    // 蚊は 右上へ とんでいく（頭を 進む向きに）
    const mf = prog(t, 0.5, 2.2);
    if (mf < 1) c += `<g transform="translate(${lerp(PXb + 30, CX + W / 2 + 200, eio(mf))} ${lerp(AY - 110, CY - H / 2 - 120, eio(mf))}) scale(-1.1 1.1) rotate(${18 * eio(mf)})">${mosq(t, mf > 0.08 ? 1 : 0)}</g>`;
    // かゆみの ギザギザ
    const scr = win(t, tS, cueE(1) + 0.3, 0.4);
    const ik = t < tM ? 1 : 1.9, io = t < tM ? prog(t, cue(0) + 1.4, 0.4) * (1 - prog(t, tS + 0.2, 0.8)) : prog(t, tM, 0.5);
    c += itchy(PXb, AY - 40, t, ik, io, 120);
    // かく 手
    const hin = eo(prog(t, tS - 0.7, 0.7)) * (1 - eio(prog(t, cueE(1) + 0.3, 0.7)));
    if (hin > 0.001) c += hand(PXb + 10 + Math.sin(t * 13) * 46 * scr, lerp(CY - H / 2 - 260, AY - 44, hin) + Math.abs(Math.cos(t * 13)) * 8 * scr, { s: 1.15, r: Math.sin(t * 13) * 5 * scr });
    // すっ
    const su = win(t, tS + 1.2, cueE(1) + 0.6, 0.3);
    if (su > 0) c += g(sparkle(-150, -10, 34, 1, IT.cold) + sparkle(160, 20, 26, 1, IT.cold) + ctext(0, 0, 'すっ', { size: 110, w: 900, fill: IT.coldDk }), { x: CX + 330, y: CY - 150, o: su, s: lerp(0.8, 1, eo(prog(t, tS + 1.2, 0.4))) });
    // 少し たつと（時計）
    const ck = win(t, cue(2) + 0.6, tM + 0.2, 0.3);
    if (ck > 0) { const a = prog(t, cue(2) + 0.8, 1.8) * 300 - 90; c += g(`<circle r="70" fill="#fff" stroke="${C.ink}" stroke-width="9"/><line x1="0" y1="0" x2="0" y2="-34" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/><line x1="0" y1="0" x2="${Math.cos(a * Math.PI / 180) * 50}" y2="${Math.sin(a * Math.PI / 180) * 50}" stroke="${C.red}" stroke-width="7" stroke-linecap="round"/><circle r="8" fill="${C.ink}"/>` + ctext(0, 118, 'すこし たつと…', { size: 44, w: 900 }), { x: CX - 360, y: CY - 170, o: ck }); }
    c += '</g>';
    c += burst(CX + 210, CY - 180, 'もっと かゆい！', t, tM + 0.3, { size: 58, shake: 2 });
    // ①②③
    const steps = [['① かゆい', IT.itchDk, cue(0) + 1.4], ['② かくと すっ', IT.coldDk, tS + 1.0], ['③ もっと かゆい', IT.pain, tM + 0.2]];
    steps.forEach(([s, col, st], i) => { c += pop(badge(s, { fill: col, size: 38 }), t, st, CX - 370 + i * 370, CY + H / 2 - 62); });
    out += c;
    // おねえちゃん
    const SX = 330, SY = 846, SS = 0.8, after = t > tM;
    out += kidShow('S', t, SX, SY, { s: SS, start: 0.2, n: 0, bubble: false, eyes: after ? 'wide' : (scr > 0.5 ? 'smile' : null), mouth: after && !talking('S') ? 'o' : null });
    out += talkBubble('S', 340, 330, SX + 6, SY - (KID_HEAD.S[0] + 10) * SS);
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 250);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">かゆい ところを かくと、</text>`, { x: 960, y: 430, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${IT.itch}">もっと かゆく</tspan> なるの？</text>`, { x: 960, y: 610, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(armSide(-190, 190, 0, 90) + bump(0, 0, 60, 1, 0.7) + itchy(0, -14, t, 1.9, 1, 62), t, t0 + 1.8, 960, 800);
    }
    return out;
  },
});

// 2. 予想（正解は 3番）
const OPTS = [['①', 'つめに ばいきんが いるから'], ['②', 'かくと ひふが あつく なるから'], ['③', 'のうの いたみどめが、かゆみも つよく するから']];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'かくと、どうして もっと かゆく なるの？', { size: 62, w: 900 }), t, 0.3, 820, 200);
    const cur = curLine(), osz = Math.min(...OPTS.map(([, s]) => fit(s, 1040, 48)));
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(armSide(-130, 130, 0, 70) + bump(0, 0, 54, 1, 0.6) + itchy(0, -12, t, 1.9, 1, 56) + text(150, -120, '？', { size: 110, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1640, 330);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. かゆみは「ひっかきたく なる」いやな感じ。虫などを はらいのけて 体を守るため（と考えられている）
SCENES.push({
  id: 'define',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#eef5f1"/>` + topBadge();
    const AY = 560, BXp = 760, tB = cue(1);
    out += armSide(-300, 2220, AY, 330);
    out += pop(badge('かゆみって なに？', { fill: IT.itchDk, size: 50, pad: 40 }), t, 0.3, 960, 190, { end: tB - 0.3 });
    // A：かゆい → 手が のびる
    const aO = 1 - prog(t, tB - 0.6, 0.5);
    if (aO > 0) {
      let a = bump(BXp, AY, 110, 1, 0) + itchy(BXp, AY - 36, t, 1.3, prog(t, 0.5, 0.4), 112);
      const hk = eo(prog(t, cue(0) + 0.9, 0.9));
      a += hand(BXp - 150 + Math.sin(t * 20) * 5, lerp(-200, AY - 150 + Math.sin(t * 3.4) * 34, hk), { s: 1.05, r: -14 });
      a += pop(lab(0, 0, 'ひっかきたく なる', 1, { col: IT.itchDk, size: 60 }), t, cue(0) + 1.5, 1380, 330);
      a += pop(lab(0, 0, 'いやな かんじ', 1, { col: C.ink, size: 56 }), t, cue(0) + 3.2, 1380, 450);
      out += g(a, { o: aO });
    }
    // B：虫が 歩く（頭は 進む向き＝左）→ 手で はらいのける
    const bO = prog(t, tB - 0.2, 0.4);
    if (bO > 0) {
      const tH = tB + 2.7, hitX = 1150;          // 手が 当たる とき
      const wk = clamp((t - tB + 0.2) / (tH - tB + 0.2)), bx = lerp(1990, hitX, wk);
      let b = '';
      if (t < tH) b += g(bug(t, 1), { x: bx, y: AY }) + itchy(bx, AY - 60, t, 0.9, prog(t, tB + 0.6, 0.4), 70);
      else {
        const f = prog(t, tH, 1.1);   // はねとばされる
        if (f < 1) b += g(bug(t, 0), { x: hitX + 1000 * eo(f), y: AY - 30 - Math.sin(f * Math.PI * 0.75) * 420, r: f * 620, o: 1 - prog(t, tH + 0.9, 0.2) });
        b += sparkle(hitX + 30, AY - 50, 60 * Math.sin(prog(t, tH, 0.4) * Math.PI), 1, C.yellow);
      }
      // 手：左から 右へ さっと はらう
      const sw = prog(t, tH - 0.45, 0.8), hx = lerp(430, 1560, eio(sw));
      const hy = lerp(-240, AY - 30, eo(prog(t, tH - 1.3, 0.8))) - eo(prog(t, tH + 0.6, 0.8)) * 700;
      b += hand(hx, hy, { s: 1.05, r: lerp(-34, 30, eio(sw)) });
      const sk = prog(t, tH + 1.0, 0.5);
      if (sk > 0) {
        const shield = `<path d="M 0 -70 L 58 -46 L 58 6 Q 58 56 0 80 Q -58 56 -58 6 L -58 -46 Z" fill="${C.accent}" stroke="#fff" stroke-width="8" stroke-linejoin="round"/><path d="M -24 4 l 18 20 l 32 -40" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
        b += pop(shield, t, tH + 1.0, 560, 320, { s: 1.3 });
        b += pop(lab(0, 0, 'からだを まもる ため', 1, { col: C.accent, size: 66 }), t, tH + 1.2, 1080, 300);
        b += g(ctext(1080, 408, '…と かんがえられて いる', { size: 44, w: 700, fill: C.muted }), { o: prog(t, tH + 2.0, 0.4) });
      }
      out += g(b, { o: bO });
    }
    return out;
  },
});

// ---------- 皮ふの 中の 道具 ----------
const mkPath = P => { const L = _seg(P); return { P, L, T: L.reduce((a, b) => a + b, 0) }; };
const qb = (a, c, b, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, m = 1 - u; return [m * m * a[0] + 2 * m * u * c[0] + u * u * b[0], m * m * a[1] + 2 * m * u * c[1] + u * u * b[1]]; });
// どの道でも 使える 波（u: 0〜1）
function waveP(path, u, { len = 150, amp = 13, col = IT.itch, w = 9, o = 1, cyc = 2.5 } = {}) {
  if (o <= 0.01 || u <= 0 || u >= 1) return '';
  const c = u * path.T, n = 26; let d = '';
  for (let i = 0; i <= n; i++) {
    const s = c - len / 2 + len * i / n; if (s < 0 || s > path.T) continue;
    const [x, y, a] = polyAt(path.P, path.L, s), off = Math.sin(i / n * Math.PI * 2 * cyc) * amp * Math.sin(Math.PI * i / n);
    d += (d ? ' L ' : 'M ') + (x - Math.sin(a) * off).toFixed(1) + ' ' + (y + Math.cos(a) * off).toFixed(1);
  }
  return d ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${clamp(o)}"/>` : '';
}
const SKY_Y = 170, EPI_Y = 396;
const SKIN_BG = (() => {
  let s = `<rect width="1920" height="1080" fill="${IT.der}"/>`;
  for (let i = 0; i < 50; i++) { const x = (rnd(i, 31) * 1920).toFixed(0), y = (EPI_Y + 30 + rnd(i, 32) * 660).toFixed(0); s += `<ellipse cx="${x}" cy="${y}" rx="${(16 + rnd(i, 33) * 26).toFixed(0)}" ry="${(8 + rnd(i, 34) * 10).toFixed(0)}" fill="${IT.derDk}" opacity="0.2" transform="rotate(${(rnd(i, 35) * 60 - 30).toFixed(0)} ${x} ${y})"/>`; }
  s += `<path d="M 0 ${SKY_Y} L 1920 ${SKY_Y} L 1920 ${EPI_Y} Q 1680 ${EPI_Y + 26} 1440 ${EPI_Y} T 960 ${EPI_Y} T 480 ${EPI_Y} T 0 ${EPI_Y} Z" fill="${IT.epi}"/>`;
  [[SKY_Y + 6, 30, 150], [SKY_Y + 42, 40, 130], [SKY_Y + 90, 50, 112], [SKY_Y + 148, 60, 100]].forEach(([y, h, w], r) => {
    for (let x = -(r % 2) * w / 2 - 10; x < 1930; x += w + 8) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.4}" fill="#fbe2d2" stroke="${IT.epiLn}" stroke-width="3" opacity="0.85"/>`;
  });
  s += `<rect x="0" y="0" width="1920" height="${SKY_Y}" fill="${C.paper}"/><line x1="0" y1="${SKY_Y}" x2="1920" y2="${SKY_Y}" stroke="${IT.skinLn}" stroke-width="8"/>`;
  return s;
})();
// 見張り役の細胞（肥満細胞）。burst: つぶを 出した（0〜1）、eyes: 'open' | 'wide'
const GRAN = [[-70, 22], [-36, 54], [4, 72], [44, 58], [76, 24], [-42, 14], [0, 30], [40, 16], [-88, -12], [88, -12]];
function mastCell(t, r = 125, { burst = 0, eyes = 'open' } = {}) {
  const k = r / 140, wob = 1 + Math.sin(t * 3) * 0.015 + (burst > 0 && burst < 1 ? Math.sin(burst * Math.PI) * 0.08 : 0);
  let s = `<g transform="scale(${wob})"><circle r="${r}" fill="${IT.mast}" stroke="${IT.mastLn}" stroke-width="9"/>`;
  GRAN.forEach(([x, y], i) => { const b = burst > 0 ? clamp(burst * 1.8 - i * 0.05) : 0; s += dot(x * k, y * k + 10, 14 * k, IT.hist, IT.histDk, 1 - b); });
  const ey = -r * 0.36, er = eyes === 'wide' ? 16 : 12, ex = r * 0.27;
  s += `<ellipse cx="${-ex}" cy="${ey}" rx="${er * 0.85}" ry="${er * 1.1}" fill="${C.ink}"/><ellipse cx="${ex}" cy="${ey}" rx="${er * 0.85}" ry="${er * 1.1}" fill="${C.ink}"/><circle cx="${-ex + 4}" cy="${ey - 5}" r="${er * 0.3}" fill="#fff"/><circle cx="${ex + 4}" cy="${ey - 5}" r="${er * 0.3}" fill="#fff"/>`;
  s += eyes === 'wide' ? `<ellipse cx="0" cy="${ey + 34}" rx="10" ry="13" fill="#8e3b33"/>` : `<path d="M -13 ${ey + 28} Q 0 ${ey + 40} 13 ${ey + 28}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  return s + '</g>';
}
// 皮ふの 神経（先が 3本に 分かれて、浅いところまで のびる）
const NJ = [1330, 590], NTIP = [[1090, 292], [1300, 244], [1500, 276]], NCTL = [[1140, 490], [1292, 420], [1476, 460]];
const NTRUNK = qb(NJ, [1400, 820], [1620, 1110], 16);
const NBR = NTIP.map((tp, i) => mkPath([...qb(tp, NCTL[i], NJ, 14), ...NTRUNK.slice(1)]));
const poly = P => 'M ' + P.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
const skinNerve = (o = 1, w = 12) => g(NTIP.map((tp, i) => `<path d="${poly(qb(tp, NCTL[i], NJ, 14))}" fill="none" stroke="${IT.itch}" stroke-width="${w * 0.7}" stroke-linecap="round"/><circle cx="${tp[0]}" cy="${tp[1]}" r="${w}" fill="${IT.itch}"/>`).join('') +
  `<path d="${poly(NTRUNK)}" fill="none" stroke="${IT.itch}" stroke-width="${w * 1.3}" stroke-linecap="round"/>`, { o });

// 4. 皮ふの中：見張り役の細胞が「かゆみのもと」を出し、浅いところまで のびた 細い神経が 受け取る
SCENES.push({
  id: 'mast',
  draw(t) {
    let out = SKIN_BG + topBadge();
    const MX = 560, MY = 600, MR = 142;
    const tN = cue(1) + 1.3, tb = cue(1) + 4.0, tr = cue(2) + 3.8;   // 気づく／つぶを 出す／神経が 受け取る
    // さされた あと と、蚊の だ液
    out += `<circle cx="430" cy="${SKY_Y}" r="9" fill="${IT.bumpDk}"/>`;
    const so = win(t, cue(1) - 0.4, tN + 0.9, 0.4);
    if (so > 0) {
      const sk = eio(prog(t, cue(1) - 0.2, 1.4));
      [[-26, 250], [18, 290], [-6, 340], [34, 226]].forEach(([dx, y0], i) => {
        const x = lerp(430 + dx, MX - 70 + i * 22, sk), y = lerp(y0, MY - MR - 22 + (i % 2) * 16, sk);
        out += `<path transform="translate(${x} ${y}) scale(1.5)" d="M 0 -16 C 8 -4 13 2 13 9 A 13 13 0 0 1 -13 9 C -13 2 -8 -4 0 -16 Z" fill="${IT.saliva}" stroke="${IT.salivaDk}" stroke-width="3" opacity="${so}"/>`;
      });
      out += tag(404, 262, 210, 300, 'かの だえき', so * prog(t, cue(1), 0.3), { col: IT.salivaDk, size: 40 });
    }
    // 神経（はじめは うすく）
    const nk = prog(t, cue(2) - 0.2, 0.5);
    out += skinNerve(lerp(0.4, 1, nk), lerp(9, 12, nk));
    // 見張り役の 細胞
    const burstK = prog(t, tb, 0.8);
    out += pop(mastCell(t, MR, { burst: burstK, eyes: t > tN ? 'wide' : 'open' }), t, cue(0) + 1.6, MX, MY);
    out += pop(text(0, 0, '！', { size: 110, w: 900, fill: C.red }), t, tN, MX + 150, MY - 150, { end: tb + 0.3 });
    // かゆみの もと（黄色の つぶ）
    if (t > tb) {
      for (let i = 0; i < 27; i++) {
        const a0 = rnd(i, 3) * Math.PI * 2, r1 = 150 + rnd(i, 4) * 60, k1 = eo(prog(t, tb + rnd(i, 5) * 0.25, 0.8));
        let x = MX + Math.cos(a0) * r1 * k1, y = MY + Math.sin(a0) * r1 * k1;
        if (i < 9) {
          const tp = NTIP[i % 3], k2 = eio(prog(t, tb + 1.0 + rnd(i, 6) * 0.5, Math.max(0.6, tr - tb - 1.6)));
          const tx = tp[0] + (rnd(i, 7) - 0.5) * 64, ty = tp[1] + (rnd(i, 8) - 0.5) * 50 - 6;
          x = lerp(x, tx, k2) + Math.sin(t * 3 + i) * 3; y = lerp(y, ty, k2) - Math.sin(k2 * Math.PI) * 50;
        } else {
          const k2 = prog(t, tb + 0.8, 9); x += Math.cos(a0 + 0.6) * 120 * k2 + Math.sin(t * 1.7 + i) * 5; y += Math.sin(a0 + 0.6) * 90 * k2 + Math.cos(t * 1.3 + i) * 5;
          y = Math.max(EPI_Y - 30, y);
        }
        out += dot(x, y, 15, IT.hist, IT.histDk, prog(t, tb, 0.2));
      }
    }
    out += pop(lab(0, 0, 'みはりやくの さいぼう', 1, { col: IT.mastLn, size: 42 }), t, cue(0) + 2.2, MX, MY + 204);
    out += pop(lab(0, 0, 'かゆみの もと', 1, { col: IT.histDk, size: 46 }), t, tb + 0.7, 250, 480);
    // 神経が 受け取る → かゆみの 合図
    out += pop(lab(0, 0, 'あさい ところまで のびて いる', 1, { col: IT.itchDk, size: 38 }), t, cue(2) + 0.5, 1300, 112);
    out += g(tag(1392, 760, 1670, 640, 'ほそい しんけい', 1, { col: IT.itchDk, size: 44 }), { o: prog(t, cue(2) + 1.6, 0.3) });
    if (t > tr) {
      NTIP.forEach((tp, i) => { out += sparkle(tp[0], tp[1], 46 + Math.sin(t * 8 + i * 2) * 14, 0.9, '#fff3b0'); });
      for (let k = 0; k < 40; k++) { const t0 = tr + 0.2 + k * 0.5; if (t0 > t) break; out += waveP(NBR[k % 3], (t - t0) / 1.9, { len: 130, amp: 12, w: 9 }); }
      out += pop(lab(0, 0, 'かゆみの あいず', 1, { col: IT.itch, size: 42 }), t, tr + 0.9, 1690, 790);
    }
    // はじめ：うでを ルーペで のぞいて、皮ふの 中へ
    const io = 1 - prog(t, 1.5, 0.5);
    if (io > 0) {
      const z = 1 + 5 * eio(prog(t, 0.9, 1.1));
      out += `<rect width="1920" height="1080" fill="#eef5f1" opacity="${io}"/>` + g(`<g transform="translate(-960 -560)">${armSide(-300, 2220, 560, 330) + bump(960, 560, 110, 1, 0)}</g>` +
        g(`<circle r="170" fill="#e7f3f6" fill-opacity="0.25" stroke="${C.blueUi}" stroke-width="20"/><rect x="110" y="130" width="40" height="190" rx="20" fill="${C.ochre}" transform="rotate(-42 130 130)"/>`, { x: lerp(500, 0, eo(prog(t, 0.2, 0.7))), y: lerp(-300, 60, eo(prog(t, 0.2, 0.7))) }), { x: 960, y: 560, s: z, o: io });
      out += g(lab(960, 250, 'ひふの なかを のぞくと…', 1, { col: C.blueUi, size: 54 }), { o: io * prog(t, 0.3, 0.3) });
    }
    return out;
  },
});

// 5. 合図は せきずいを 通って 脳へ。脳に とどいて はじめて「かゆい」
const biteDots = (t, o = 1) => [[-22, 30], [8, 40], [26, 26], [-4, 22]].map(([dx, dy], i) => dot(BITE[0] + dx + Math.sin(t * 3 + i * 2) * 3, BITE[1] + dy + Math.cos(t * 2.6 + i) * 3, 8, IT.hist, IT.histDk, o)).join('');
SCENES.push({
  id: 'path',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const tA = cue(0) + 0.3, tB = cue(0) + 2.6, tC = cue(1) + 0.5;
    const U = tt => tt < tA ? -1 : tt < tB ? lerp(0, UJ, (tt - tA) / (tB - tA)) : lerp(UJ, 1, (tt - tB) / (tC - tB));
    out += bodyFig(t, { face: t > tC ? 'itchy' : 'calm', glow: prog(t, tC, 0.5) });
    out += biteDots(t) + itchy(BITE[0], BITE[1] - 14, t, 1, 1, 46);
    for (let k = 0; k < 30; k++) { const u = U(t - k * 0.8); if (u < 0) break; out += wave(u); }
    out += bodyTags(t, cue(0) + 3.6, cue(0) + 1.5);
    out += g(tag(820, 552, 640, 720, 'しんけい', 1, { col: IT.itchDk, size: 42 }), { o: prog(t, cue(0) + 0.5, 0.3) });
    out += g(lab(330, 400, 'かゆみの あいず', 1, { col: IT.itch, size: 44 }) + wave(0.12, { o: 0 }), { o: prog(t, cue(0) + 0.2, 0.3) });
    out += burst(1620, 420, 'かゆい！', t, tC + 0.2, { size: 64, shake: 1.5 });
    return out;
  },
});

// 6. かくと ちょっぴり 痛い → 痛みの合図が せきずいで かゆみの合図を しずめる → すっと する
const gateX = (o = 1) => o <= 0.01 ? '' : g(`<path d="M -22 -22 L 22 22 M 22 -22 L -22 22" stroke="#fff" stroke-width="20" stroke-linecap="round"/><path d="M -22 -22 L 22 22 M 22 -22 L -22 22" stroke="${C.ink}" stroke-width="11" stroke-linecap="round"/>`, { x: 1128, y: 612, o });
function scratchHand(t, k, lift = 0) {  // k: かいている つよさ 0〜1、lift: 0 そばに ある 〜 1 画面の 上へ
  return hand(BITE[0] + 6 + Math.sin(t * 13) * 30 * k, lerp(BITE[1] - 26, -260, lift) + Math.abs(Math.cos(t * 13)) * 6 * k, { s: 0.86, r: Math.sin(t * 13) * 4 * k });
}
SCENES.push({
  id: 'scratch',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const tScr = cue(1), tPain = cue(1) + 1.0, tGate = cue(2) + 2.2, tSu = cue(3) + 1.0;
    const calm = prog(t, tGate + 0.5, 1.0);
    out += bodyFig(t, { face: t > tSu ? 'relief' : 'itchy', glow: lerp(1, 0.3, calm), glowCol: mix(IT.itch, IT.pain, calm) });
    out += biteDots(t) + itchy(BITE[0], BITE[1] - 14, t, 1, 1 - prog(t, tScr - 1.0, 0.5), 46);
    out += itchStream(t, -3, { gateAt: tGate });
    for (let k = 0; k < 40; k++) { const t0 = tPain + k * 0.75; if (t0 > t) break; out += painArrow((t - t0) / 2.4); }
    out += gateX(prog(t, tGate, 0.3));
    out += bodyTags(t, -1, -1);
    // かく 手
    const hin = eo(prog(t, cue(0) + 0.8, 1.0));
    out += scratchHand(t, prog(t, tScr, 0.4), 1 - hin);
    if (t > tPain - 0.2) out += sparkle(BITE[0] - 60, BITE[1] - 6, 26 + Math.sin(t * 16) * 10, 0.9, IT.pain) + sparkle(BITE[0] + 70, BITE[1] + 2, 20 + Math.cos(t * 14) * 8, 0.9, IT.pain);
    out += g(tag(548, 500, 270, 400, 'ちょっぴり いたい', 1, { col: IT.pain, size: 44 }), { o: prog(t, tPain, 0.3) });
    out += g(tag(1118, 626, 720, 792, 'かゆみの あいずが しずまる', 1, { col: IT.itchDk, size: 40 }), { o: prog(t, tGate + 0.4, 0.3) });
    out += g(lab(860, 700, 'いたみの あいず', 1, { col: IT.pain, size: 40 }), { o: win(t, tPain + 0.8, tGate + 0.2, 0.3) });
    out += burst(1620, 420, 'かゆい！', t, -1, { size: 64, end: tGate + 1.0 });
    if (t > tSu) out += g(sparkle(-130, -20, 30, 1, IT.cold) + sparkle(130, 24, 24, 1, IT.cold) + lab(0, 0, 'すっ', 1, { col: IT.coldDk, size: 84 }), { x: 1620, y: 420, o: prog(t, tSu, 0.3), s: lerp(0.8, 1, eo(prog(t, tSu, 0.4))) });
    // おとうと
    const KX = 190, KY = 850, KS = 0.6;
    out += kidShow('B', t, KX, KY, { s: KS, start: cue(3) + 0.3, n: 0, bubble: false });
    out += talkBubble('B', 470, 676, KX + 54, KY - KID_HEAD.B[2] * KS, 44);
    return out;
  },
});

// 7. 脳が 痛みを おさえようと セロトニンを 出す → かゆみの 神経まで 元気に → かゆみが 強くなる（ネズミの研究）
const mouse = () => `<path d="M -72 22 q -64 12 -76 -34" fill="none" stroke="#e7a6a6" stroke-width="7" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="80" ry="52" fill="#cfcac3"/>` +
  `<circle cx="58" cy="-54" r="25" fill="#cfcac3"/><circle cx="58" cy="-54" r="14" fill="#f2b8b8"/><circle cx="76" cy="-12" r="42" fill="#cfcac3"/>` +
  `<circle cx="90" cy="-20" r="6.5" fill="${C.ink}"/><circle cx="117" cy="-4" r="7" fill="#e58a8a"/><path d="M 104 4 l 32 -8 M 104 9 l 32 5" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>` +
  `<ellipse cx="-30" cy="50" rx="26" ry="10" fill="#b5afa6"/><ellipse cx="42" cy="50" rx="22" ry="9" fill="#b5afa6"/>`;
SCENES.push({
  id: 'serotonin',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const tBr = cue(0) + 1.0, tSe = cue(0) + 4.4, tDown = cue(1) + 0.3, tZoom = cue(2) - 0.3, tStick = cue(2) + 1.8, tOpen = cue(3) + 0.2, tMouse = cue(4) - 0.2, tHuman = cue(5);
    const more = prog(t, tOpen + 0.9, 0.6), se = prog(t, tSe, 0.5);
    const gcol = more > 0 ? mix(IT.sero, IT.itch, more) : mix(IT.pain, IT.sero, se);
    const gl = more > 0 ? lerp(0.6, 1.35, more) : lerp(0.3, 0.6, se) + 0.5 * Math.sin(prog(t, tBr, 0.8) * Math.PI);
    out += bodyFig(t, { face: more > 0.5 ? 'itchy2' : 'relief', glow: gl, glowCol: gcol });
    out += biteDots(t) + itchy(BITE[0], BITE[1] - 14, t, 1.5, more, 40);
    out += itchStream(t, -3, { gateAt: -100, reopen: tOpen, strong: 1 });
    const po = 1 - 0.7 * prog(t, tSe, 1.5);
    for (let k = 0; k < 40; k++) { const t0 = -2 + k * 0.75; if (t0 > t || t0 > cue(0) + 3.2) break; out += painArrow((t - t0) / 2.4, po); }
    out += gateX(1 - prog(t, tOpen - 0.2, 0.3));
    // かゆみの 神経細胞（せきずいの 入口）
    const ek = prog(t, tStick, 0.6);
    out += g(`<circle r="${lerp(15, 24, ek)}" fill="${IT.itch}" stroke="${IT.itchDk}" stroke-width="4"/>`, { x: JUNC[0], y: JUNC[1], o: prog(t, tZoom, 0.3) });
    // セロトニン（むらさきの つぶ）：脳で 生まれて、せきずいを おりていく
    if (t > tSe) {
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + t * 0.5, k = back(prog(t, tSe + i * 0.06, 0.5)); out += dot(BRX + Math.cos(a) * 150 * k, 256 + Math.sin(a) * 118 * k, 13, IT.sero, IT.seroDk, prog(t, tSe + i * 0.06, 0.2)); }
      for (let k = 0; k < 120; k++) {
        const t0 = tDown + k * 0.24; if (t0 > t) break;
        const f = (t - t0) / 3.4; if (f >= 1) continue;
        out += dot(BX + Math.sin(k * 2.3) * 7, lerp(390, 880, f), 10, IT.sero, IT.seroDk, Math.min(prog(f, 0, 0.08), 1 - prog(f, 0.88, 0.12)));
      }
    }
    out += bodyTags(t, -1, -1);
    out += g(tag(1066, 204, 800, 178, 'セロトニン', 1, { col: IT.seroDk, size: 46 }) + ctext(800, 246, 'のうの いたみどめ', { size: 36, w: 900, fill: IT.seroDk }), { o: prog(t, tSe + 0.3, 0.3) });
    // かく 手（はじめは まだ かいている）
    const hout = eio(prog(t, cue(0) + 3.4, 0.9));
    if (hout < 1) out += scratchHand(t, 1 - prog(t, cue(0) + 3.0, 0.4), hout);
    // 大きく 見ると：かゆみの 神経に セロトニンが くっついて、元気に なる
    const zo = prog(t, tZoom, 0.4);
    if (zo > 0) {
      const ZX = 700, ZY = 742, ZR = 108;
      let z = `<line x1="${JUNC[0] - 22}" y1="${JUNC[1] + 10}" x2="${ZX + ZR * 0.9}" y2="${ZY - ZR * 0.42}" stroke="${IT.itchDk}" stroke-width="5" stroke-dasharray="4 12" stroke-linecap="round"/>`;
      z += `<clipPath id="zc"><circle cx="${ZX}" cy="${ZY}" r="${ZR}"/></clipPath><circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="#fff6d6"/><g clip-path="url(#zc)">`;
      const cr = lerp(44, 58, back(ek)), hopY = ek >= 1 ? -Math.abs(Math.sin(t * 7)) * 8 : 0;
      z += `<path d="M ${ZX - 130} ${ZY + 30} L ${ZX} ${ZY} L ${ZX + 130} ${ZY - 50}" fill="none" stroke="${IT.nerve}" stroke-width="16" stroke-linecap="round"/>`;
      z += g(`<circle r="${cr}" fill="${IT.itch}" stroke="${IT.itchDk}" stroke-width="6"/>` + (ek > 0.5
        ? `<circle cx="-17" cy="-8" r="8" fill="${C.ink}"/><circle cx="17" cy="-8" r="8" fill="${C.ink}"/><path d="M -14 14 Q 0 30 14 14 Z" fill="#8e3b33"/>`
        : `<path d="M -26 -6 q 9 8 18 0 M 8 -6 q 9 8 18 0 M -8 18 l 16 0" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`), { x: ZX, y: ZY + hopY });
      for (let i = 0; i < 5; i++) {
        const a = -2.4 + i * 0.62, k = eo(prog(t, tStick - 1.2 + i * 0.12, 0.9));
        if (k > 0) z += dot(lerp(ZX + 40 + i * 12, ZX + Math.cos(a) * (cr + 8), k), lerp(ZY - 170, ZY + hopY + Math.sin(a) * (cr + 8), k), 12, IT.sero, IT.seroDk, 1);
      }
      z += `</g><circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="none" stroke="${IT.itchDk}" stroke-width="8"/>`;
      if (ek >= 1) z += sparkle(ZX - ZR - 6, ZY - 70, 22 + Math.sin(t * 7) * 6, 1) + sparkle(ZX + ZR + 4, ZY + 60, 18 + Math.cos(t * 6) * 6, 1) + sparkle(ZX + 60, ZY - ZR - 8, 16 + Math.sin(t * 8 + 1) * 5, 1);
      z += lab(350, 700, 'かゆみの しんけい', 1, { col: IT.itchDk, size: 40 });
      z += pop(lab(0, 0, 'げんきに なる！', 1, { col: IT.seroDk, size: 44 }), t, tStick + 0.5, 350, 790);
      out += g(z, { o: zo });
    }
    out += burst(1610, 440, 'もっと かゆい！', t, tOpen + 1.1, { size: 46, shake: 2.5, col: IT.itchDk });
    if (t < cue(0) + 3) out += g(sparkle(1490, 400, 30, 1, IT.cold) + sparkle(1750, 444, 24, 1, IT.cold) + lab(1620, 420, 'すっ', 1, { col: IT.coldDk, size: 84 }), { o: 1 - prog(t, cue(0) + 2.0, 0.5) });
    // ネズミの 研究
    const mo = prog(t, tMouse, 0.4);
    if (mo > 0) {
      let m = card(540, 200) + g(mouse(), { x: -160, y: -14, s: 0.78 });
      m += text(-46, -56, 'ネズミの', { size: 40, w: 900, anchor: 'start' }) + text(-46, -4, 'けんきゅうで', { size: 40, w: 900, anchor: 'start' }) + text(-46, 48, 'わかった こと', { size: 40, w: 900, anchor: 'start' });
      const ho = prog(t, tHuman, 0.4);
      m += g(g(card(540, 124, { fill: C.accentSoft }), { y: 172 }) + ctext(0, 150, 'ひとでも おなじと', { size: 36, w: 900, fill: C.accent }) + ctext(0, 196, 'かんがえられて いる', { size: 36, w: 900, fill: C.accent }), { o: ho, y: (1 - eo(ho)) * -20 });
      out += g(m, { x: 330, y: 222 - (1 - eo(mo)) * 30, o: mo });
    }
    return out;
  },
});

// 8. かいた 傷から また「かゆみのもと」→「かゆい・かく・もっと かゆい」の 輪
const WY = 300, BW = 150, BH = 46;
const WALL_BG = (() => {
  let s = `<rect width="1920" height="1080" fill="${IT.der}"/><rect x="0" y="${WY}" width="1920" height="520" fill="${IT.epi}"/>`;
  for (let r = 0; r < 3; r++) for (let x = -(r % 2) * 110 - 30; x < 1940; x += 222) {
    const y = WY + 172 + r * 112;
    s += `<rect x="${x}" y="${y}" width="212" height="102" rx="40" fill="#fbe2d2" stroke="${IT.epiLn}" stroke-width="4"/><ellipse cx="${x + 106}" cy="${y + 52}" rx="30" ry="22" fill="${IT.epiLn}" opacity="0.55"/>`;
  }
  s += `<rect x="0" y="0" width="1920" height="${WY}" fill="${C.paper}"/>`;
  return s;
})();
const LOOPN = [['かゆい', IT.itchDk, -90, 34], ['かく', C.blueUi, 30, 24], ['もっと かゆい', IT.pain, 150, 24]];
const LX = 960, LY = 470, LR = 280;
const arcArrow = (a0, a1, col, o = 1) => {
  if (o <= 0.01) return '';
  const p = a => [LX + Math.cos(a * Math.PI / 180) * LR, LY + Math.sin(a * Math.PI / 180) * LR], [x0, y0] = p(a0), [x1, y1] = p(a1), [xh, yh] = p(a1 + 9);
  const ta = (a1 + 9 + 90) * Math.PI / 180, nx = Math.cos(a1 * Math.PI / 180), ny = Math.sin(a1 * Math.PI / 180);
  return g(`<path d="M ${x0} ${y0} A ${LR} ${LR} 0 0 1 ${x1} ${y1}" fill="none" stroke="${col}" stroke-width="20" stroke-linecap="round"/>` +
    `<path d="M ${xh + Math.cos(ta) * 14} ${yh + Math.sin(ta) * 14} L ${x1 + nx * 34} ${y1 + ny * 34} L ${x1 - nx * 34} ${y1 - ny * 34} Z" fill="${col}" stroke="${col}" stroke-width="8" stroke-linejoin="round"/>`, { o });
};
SCENES.push({
  id: 'loop',
  draw(t) {
    let out = '';
    const tB = cue(1) - 0.5, aO = 1 - prog(t, tB, 0.5);
    if (aO > 0) {
      const tA = cue(0) + 2.2, tP = cue(0) + 5.6, dmg = prog(t, tA + 0.3, 1.8);
      let a = WALL_BG;
      // きずついた 細胞（赤っぽく）
      const hurt = prog(t, tA + 1.6, 0.8);
      [[880, WY + 172], [1102, WY + 172]].forEach(([x, y]) => { a += `<rect x="${x - 110 + 80}" y="${y}" width="212" height="102" rx="40" fill="${IT.next}" opacity="${0.45 * hurt}"/>`; });
      // れんがの かべ（バリア）
      for (let r = 0; r < 3; r++) for (let i = -1; i < 14; i++) {
        const x = i * (BW + 6) + (r % 2) * 78 - 20, y = WY + 6 + r * (BH + 6), cx = x + BW / 2, id = r * 20 + i;
        const inZ = cx > 770 && cx < 1220 && r < 2, k = inZ ? dmg : 0;
        const dx = k * (r === 0 ? 60 + rnd(id, 1) * 130 : (rnd(id, 2) - 0.5) * 30), dy = k * (r === 0 ? -(30 + rnd(id, 3) * 110) : 6), rot = k * (r === 0 ? (rnd(id, 4) - 0.3) * 150 : (rnd(id, 5) - 0.5) * 22);
        a += `<g transform="translate(${cx + dx} ${y + BH / 2 + dy}) rotate(${rot})" opacity="${r === 0 && inZ ? 1 - 0.75 * prog(t, tA + 1.6, 1.4) : 1}"><rect x="${-BW / 2}" y="${-BH / 2}" width="${BW}" height="${BH}" rx="12" fill="${IT.brick}" stroke="${IT.brickLn}" stroke-width="4"/></g>`;
      }
      if (dmg > 0.3) a += `<path d="M 900 ${WY + 60} l 30 44 l -26 30 l 34 40 M 1090 ${WY + 56} l -24 50 l 30 34 l -20 30" fill="none" stroke="${IT.painDk}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${prog(dmg, 0.3, 0.5)}"/>`;
      a += `<line x1="0" y1="${WY}" x2="1920" y2="${WY}" stroke="${IT.skinLn}" stroke-width="6" stroke-dasharray="${dmg > 0.1 ? '760 460 2000' : '4000'}"/>`;
      // かゆみを 強める つぶ（ピンク）
      if (t > tP) for (let i = 0; i < 16; i++) {
        const k = prog(t, tP + i * 0.16, 2.6), x0 = 900 + (i % 4) * 66, an = -Math.PI / 2 + (rnd(i, 11) - 0.5) * 2.2, d = eo(k) * (150 + rnd(i, 12) * 190);
        a += dot(x0 + Math.cos(an) * d + Math.sin(t * 2 + i) * 4, WY + 190 + Math.sin(an) * d * 0.9 + Math.cos(t * 2.4 + i) * 4, 15, IT.next, IT.nextDk, prog(k, 0, 0.1));
      }
      a += g(tag(360, WY + 60, 330, 190, 'ひふの バリア', 1, { col: IT.itchDk, size: 46 }), { o: prog(t, 0.5, 0.3) });
      a += g(tag(1000, WY + 30, 1500, 190, 'きず', 1, { col: IT.painDk, size: 54 }), { o: prog(t, tA + 2.2, 0.3) });
      a += pop(lab(0, 0, 'また かゆみの もと', 1, { col: IT.nextDk, size: 50 }), t, tP + 0.8, 1500, 620);
      a += itchy(990, WY - 30, t, 1.8, prog(t, tP + 1.6, 0.5), 110);
      // かく 手（左右に 3回）
      const hin = eo(prog(t, tA - 0.7, 0.7)) * (1 - eio(prog(t, tA + 2.3, 0.7))), sw = Math.sin(clamp((t - tA) / 2.3) * Math.PI * 3 - Math.PI / 2);
      if (hin > 0.001) a += hand(990 + sw * 250, lerp(-260, WY - 14, hin), { s: 1.05, r: sw * 6 });
      out += g(a, { o: 1 }) + topBadge();
    }
    const bO = prog(t, tB, 0.5);
    if (bO > 0) {
      const h = [cue(1), cue(1) + 1.0, cue(1) + 1.9], tR = cue(1) + 3.3;
      let b = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
      const lap = Math.max(0, (t - tR) / 2.4), act = t < tR ? (t >= h[2] ? 2 : t >= h[1] ? 1 : t >= h[0] ? 0 : -1) : Math.floor(lap * 3) % 3;
      b += arcArrow(-56, 6, C.ochre, prog(t, h[1] - 0.3, 0.3)) + arcArrow(48, 124, C.ochre, prog(t, h[2] - 0.3, 0.3)) + arcArrow(172, 232, C.ochre, prog(t, tR - 0.2, 0.3));
      // まん中：かくたびに 赤く、かゆく
      const lv = clamp(0.25 + lap * 0.3 + (t >= h[2] ? 0.3 : 0));
      b += g(armSide(-150, 150, 0, 86) + bump(0, 0, 62, 1, lv) + itchy(0, -14, t, 1 + lv, prog(t, h[0], 0.3), 58), { x: LX, y: LY - 20, s: 0.9 });
      if (t > tR) { const a = (-90 + lap * 360) * Math.PI / 180; b += `<circle cx="${LX + Math.cos(a) * LR}" cy="${LY + Math.sin(a) * LR}" r="20" fill="${IT.itch}" stroke="#fff" stroke-width="6"/>`; }
      LOOPN.forEach(([s, col, ang], i) => {
        const x = LX + Math.cos(ang * Math.PI / 180) * LR, y = LY + Math.sin(ang * Math.PI / 180) * LR, on = act === i, w = tw(s, 58, 900) + 72;
        b += pop(`<rect x="${-w / 2}" y="-52" width="${w}" height="104" rx="52" fill="${on ? col : '#fff'}" stroke="${col}" stroke-width="7" filter="url(#shadow)"/>` + ctext(0, 3, s, { size: 58, w: 900, fill: on ? '#fff' : col }), t, h[i], x, y, { s: on ? 1.08 : 1 });
      });
      b += pop(dot(-170, 0, 13, IT.sero, IT.seroDk) + lab(20, 0, 'のうの いたみどめ', 1, { col: IT.seroDk, size: 36 }), t, tR + 0.5, 760, 808);
      b += pop(dot(-128, 0, 13, IT.next, IT.nextDk) + lab(20, 0, 'ひふの きず', 1, { col: IT.nextDk, size: 36 }), t, tR + 1.0, 1190, 808);
      b += kidShow('K', t, 1650, 850, { s: 0.78, start: cue(1) + 2.6, n: 0, bubble: false });
      b += talkBubble('K', 1500, 600, 1712, 722, 46);   // しっぽは カメレオンの 頭へ
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 9. 正解 と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -570, as = OPTS[2][1];
      let a = pop(card(1320, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, as, { size: fit(as, 1080, 50, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['かくと ちょっぴり いたい', IT.pain], ['のうが いたみどめを だす', IT.seroDk], ['かゆみまで つよく なる', IT.itchDk]], t, 960, 600, { start: 2.4, step: 1.0, size: 40, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const okIcon = `<circle r="24" fill="${C.accent}"/><path d="M -11 0 l 8 9 l 15 -17" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      const coolIcon = `<circle r="26" fill="${IT.coldLt}" stroke="${IT.coldDk}" stroke-width="4"/>` + sparkle(0, 0, 18, 1, IT.coldDk);
      const items = [
        [coolIcon, 'かく まえに、ひやして みよう', IT.coldDk, cue(1)],
        [okIcon, 'こおりは、おとなに タオルで まいて もらう', C.accent, cue(2)],
        [g(eyeIcon(0.3)), 'かいた ときと、あとの かゆさを くらべる', C.ink, cue(3)],
        [warnIcon(0.5), 'つめで かきむしらない。こおりは タオルで', C.red, cue(4)],
        [warnIcon(0.5), 'つづく・あかく はれる ときは、おいしゃさんへ', C.red, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 1040, 46, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 124, 316 + i * 108); });
      // 絵
      const PX = 1560, PYc = 500;
      let p = card(560, 580, { fill: '#fff' });
      const ph = (s, e) => win(t, s, e, 0.3);
      // ① 冷やす
      const p1 = ph(cue(1) - 0.2, cue(3) - 0.1);
      if (p1 > 0) {
        const ice = eo(prog(t, cue(2) + 0.5, 0.7));
        let q = armSide(-250, 250, 60, 110) + bump(0, 60, 86, 1, 0) + itchy(0, 30, t, lerp(1.3, 0.7, ice), 1 - 0.75 * ice, 92);
        if (ice > 0) q += g(icePack(), { y: lerp(-320, -6, ice), s: 1.1, o: prog(t, cue(2) + 0.5, 0.2) }) + coolMarks(0, -20, t, prog(t, cue(2) + 1.2, 0.4));
        q += g(ctext(0, 232, 'ひんやり', { size: 50, w: 900, fill: IT.coldDk }), { o: prog(t, cue(2) + 1.4, 0.4) });
        p += g(q, { o: p1 });
      }
      // ② くらべる
      const p2 = ph(cue(3) - 0.1, cue(4) - 0.1);
      if (p2 > 0) {
        let q = armSide(-250, 30, -160, 70) + bump(-110, -160, 54, 1, 0.8) + g(HAND_S, { x: -104 + Math.sin(t * 12) * 14, y: -186, s: 0.32 }) + ctext(-110, -52, 'かいた とき', { size: 38, w: 900, fill: IT.pain });
        q += armSide(-250, 30, 80, 70) + bump(-110, 80, 54, 1, 0) + g(icePack(), { x: -110, y: 56, s: 0.6 }) + ctext(-110, 188, 'ひやした とき', { size: 38, w: 900, fill: IT.coldDk });
        q += pop(text(0, 0, '？', { size: 120, w: 900, fill: C.ochre }), t, cue(3) + 1.6, 150, -130) + pop(text(0, 0, '？', { size: 120, w: 900, fill: C.ochre }), t, cue(3) + 2.2, 150, 110);
        q += g(ctext(0, 252, 'あとの かゆさは？', { size: 40, w: 900 }), { o: prog(t, cue(3) + 2.6, 0.4) });
        p += g(q, { o: p2 });
      }
      // ③ かきむしらない／氷は タオルで
      const p3 = ph(cue(4) - 0.1, cue(5) - 0.1);
      if (p3 > 0) {
        let q = armSide(-250, 250, -80, 80) + bump(0, -80, 64, 1, 0.9) + g(HAND_S, { x: Math.sin(t * 14) * 20, y: -112, s: 0.5 }) + cross(170, -190, 0.55);
        q += ctext(0, 44, 'かきむしらない', { size: 42, w: 900, fill: C.red });
        const k2 = prog(t, cue(4) + 3.0, 0.4);
        q += g(g(icePack(), { x: -90, y: 190, s: 0.62 }) + g(okIcon, { x: 40, y: 150, s: 1.3 }) + text(20, 216, 'タオルで まく', { size: 38, w: 900, fill: C.accent, anchor: 'start' }), { o: k2 });
        p += g(q, { o: p3 });
      }
      // ④ 続くとき・赤く はれたときは お医者さんへ
      const p4 = prog(t, cue(5) - 0.1, 0.3);
      if (p4 > 0) {
        let q = armSide(-250, 250, -120, 80) + bump(0, -120, 84, 1, 1) + itchy(0, -150, t, 1.6, 1, 84);
        q += g(arrow2(0, -6, 0, 56, C.ink, 12), {});
        q += g(`<rect x="-78" y="-40" width="156" height="110" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="6"/><path d="M -96 -36 L 0 -104 L 96 -36 Z" fill="${C.accent}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/><path d="M 0 -14 L 0 44 M -29 15 L 29 15" stroke="${C.accent}" stroke-width="18"/>`, { x: 0, y: 160, s: 0.9 });
        q += ctext(0, 262, 'おとなに いおう', { size: 40, w: 900 });
        p += g(q, { o: p4 });
      }
      b += pop(p, t, cue(1) + 0.3, PX, PYc);
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
    out += g(text(0, 0, 'くわしくは サイトの「どうして かゆく なるの？」へ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 1000, y: 800, o: prog(t, 2.0, 0.5) });
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

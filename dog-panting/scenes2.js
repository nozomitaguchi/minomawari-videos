// ---------- いぬ の道具 ----------
// 色の約束：いぬ＝ちゃいろ、ぬれた ところ・みず＝みずいろ、すう いき＝あおい やじるし、だす いき＝オレンジの やじるし、ち＝あか、ねつ＝オレンジの つぶ
const DG = {
  dog: '#dba66c', dogD: '#a8743f', muzzle: '#eccba3', line: '#6b4a2f', tongue: '#ee8f9c', tongueD: '#c25a6a', mouth: '#7a3b3b', nose: '#3a2a22', pad: '#5b4a3c',
  water: '#4faee8', wet: '#9cd0ee', waterD: '#2a7fc4', inAir: '#2f7fd0', outAir: '#f08a2c', blood: '#d9483b', heat: '#f08a2c', hot: '#e2553f',
  grass: '#9fcf8e', grassD: '#7dbb72', skin: '#f3d9c2', collar: '#e2553f', road: '#8f979d',
};
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
// k 番目の行の、はじめから f（0〜1）のところの秒
const mid = (k, f = 0.5) => cue(k) + (cueE(k) - cue(k)) * f;
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const F1 = v => v.toFixed(1), F2 = v => v.toFixed(2);
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${F1(x1)}" y1="${F1(y1)}" x2="${F1(x2 - Math.cos(a) * h * 0.6)}" y2="${F1(y2 - Math.sin(a) * h * 0.6)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${F1(x2)} ${F1(y2)} L ${F1(x2 - Math.cos(a - 0.5) * h)} ${F1(y2 - Math.sin(a - 0.5) * h)} L ${F1(x2 - Math.cos(a + 0.5) * h)} ${F1(y2 - Math.sin(a + 0.5) * h)} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${F1(x)}" y1="${F1(y)}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${F1(x)}" cy="${F1(y)}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
function flowRow(items, t, cx, y, { size = 36, gap = 60, start = 0, step = 0.8 } = {}) {
  const ws = items.map(([s]) => tw(s, size, 700, 0.04) + 68), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = cx - tot / 2, out = '';
  items.forEach(([s, col], i) => { const st = start + i * step; out += pop(badge(s, { fill: col, size }), t, st, x + ws[i] / 2, y); if (i) out += g(arrow2(x - gap + 10, y, x - 10, y, C.ochre, 9), { o: prog(t, st - 0.2, 0.3) }); x += ws[i] + gap; });
  return out;
}
const frac = v => ((v % 1) + 1) % 1;
// 水のつぶ・しずく
const dotW = (x, y, r = 8, o = 1, col = DG.water) => o <= 0.01 ? '' : `<circle cx="${F1(x)}" cy="${F1(y)}" r="${r}" fill="${col}" opacity="${F2(clamp(o))}"/><circle cx="${F1(x - r * 0.3)}" cy="${F1(y - r * 0.3)}" r="${F1(r * 0.3)}" fill="#fff" opacity="${F2(clamp(o) * 0.7)}"/>`;
const dropW = (x, y, r = 10, o = 1, col = DG.water) => o <= 0.01 ? '' : `<path d="M ${F1(x)} ${F1(y - r * 1.6)} C ${F1(x + r * 1.2)} ${F1(y - r * 0.1)} ${F1(x + r)} ${F1(y + r)} ${F1(x)} ${F1(y + r)} C ${F1(x - r)} ${F1(y + r)} ${F1(x - r * 1.2)} ${F1(y - r * 0.1)} ${F1(x)} ${F1(y - r * 1.6)} Z" fill="${col}" opacity="${F2(clamp(o))}"/>`;
// ゆらゆら のぼる 水のけむり（かわいていく水）。heat>0 で、ねつの つぶ（オレンジ）を いっしょに はこぶ
function vapor(x, y, t, { n = 3, gap = 34, h = 80, o = 1, w = 7, ph = 0, rise = 70, heat = 0, col = DG.wet, dx = 0 } = {}) {
  if (o <= 0.01) return '';
  let s = '';
  for (let k = 0; k < n; k++) {
    const f = frac(t * 0.6 + k * 0.37 + ph), xx = x + (k - (n - 1) / 2) * gap + f * dx, yy = y - f * rise, a = Math.sin(f * Math.PI);
    s += `<path d="M ${F1(xx)} ${F1(yy)} q -11 ${-h / 4} 0 ${-h / 2} t 0 ${-h / 2}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${F2(a * o)}"/>`;
    if (heat > 0.01) s += `<circle cx="${F1(xx + 4)}" cy="${F1(yy - h * 0.55)}" r="${w * 1.5}" fill="${DG.heat}" stroke="#b85f14" stroke-width="3" opacity="${F2(a * o * heat)}"/>`;
  }
  return s;
}
const heatDot = (x, y, r = 12, o = 1) => o <= 0.01 ? '' : `<circle cx="${F1(x)}" cy="${F1(y)}" r="${r}" fill="${DG.heat}" stroke="#b85f14" stroke-width="3" opacity="${F2(clamp(o))}"/>`;
// いぬ（よこから、右むき。足もとの まん中が原点。からだの長さ 420、高さ 270 くらい）
//   pant: ハアハアの つよさ 0〜1（口があいて 舌が出る。1びょうに 5かいの 速さで うごく）
//   walk: 足の うごき 0〜1（run で 大きく）、red: 舌の 赤さ 0〜1、hl: むねを 目立たせる 0〜1
function dogPic(t, { pant = 0, walk = 0, run = 0, red = 0, hl = 0, wag = 1, eye = 'open' } = {}) {
  const ph = t * Math.PI * 10, br = pant * Math.sin(ph), col = DG.dog, dk = DG.dogD, ln = DG.line, sp = run ? 13 : 7, am = (run ? 34 : 20) * walk;
  const leg = (x, back, off) => { const a = Math.sin(t * sp + off) * am; return `<g transform="rotate(${F1(a)} ${x} -104)"><rect x="${x - 16}" y="-118" width="32" height="112" rx="15" fill="${back ? dk : col}" stroke="${ln}" stroke-width="5"/><ellipse cx="${x + 7}" cy="-8" rx="23" ry="12" fill="${back ? dk : col}" stroke="${ln}" stroke-width="5"/></g>`; };
  let o = `<ellipse cx="10" cy="4" rx="170" ry="14" fill="#000" opacity="0.08"/>`;
  o += `<g transform="translate(0 ${F1(-Math.abs(Math.sin(t * sp)) * (run ? 14 : 4) * walk)})">`;
  o += `<path d="M -112 -132 Q -168 -150 -160 -222" fill="none" stroke="${ln}" stroke-width="30" stroke-linecap="round" transform="rotate(${F1(Math.sin(t * 9) * 9 * wag)} -112 -132)"/><path d="M -112 -132 Q -168 -150 -160 -222" fill="none" stroke="${dk}" stroke-width="21" stroke-linecap="round" transform="rotate(${F1(Math.sin(t * 9) * 9 * wag)} -112 -132)"/>`;
  o += leg(-92, true, Math.PI) + leg(84, true, 0);
  o += `<ellipse cx="0" cy="-116" rx="124" ry="${F1(60 + 3.5 * br)}" fill="${col}" stroke="${ln}" stroke-width="5"/><ellipse cx="14" cy="-84" rx="78" ry="${F1(24 + 2 * br)}" fill="${DG.muzzle}" opacity="0.7"/>`;
  if (hl > 0.01) o += `<ellipse cx="44" cy="-112" rx="${F1(66 + 5 * br)}" ry="${F1(52 + 5 * br)}" fill="none" stroke="${C.yellow}" stroke-width="9" opacity="${F2(hl)}"/>`;
  o += leg(-62, false, 0) + leg(56, false, Math.PI);
  // くび・あたま
  o += `<path d="M 62 -160 Q 92 -206 112 -244 L 176 -196 Q 150 -140 104 -92 Z" fill="${col}" stroke="${ln}" stroke-width="5" stroke-linejoin="round"/><path d="M 86 -178 L 150 -150" stroke="${DG.collar}" stroke-width="17" stroke-linecap="round"/><circle cx="124" cy="-150" r="9" fill="${C.yellow}" stroke="#b98a00" stroke-width="3"/>`;
  let h = '';
  const ja = pant * (18 + 3 * Math.sin(ph)), wv = 6 * Math.sin(ph) * pant, jr = ja * Math.PI / 180;
  if (pant > 0.05) {
    // 下あご・口の中・舌
    h += `<g transform="rotate(${F1(ja)} 30 12)"><path d="M 26 8 L 88 4 Q 102 10 92 20 L 30 28 Z" fill="${col}" stroke="${ln}" stroke-width="5" stroke-linejoin="round"/></g>`;
    h += `<path d="M 30 10 L 104 4 L ${F1(30 + 66 * Math.cos(jr) - 2 * Math.sin(jr))} ${F1(12 + 66 * Math.sin(jr) + 2 * Math.cos(jr))} Z" fill="${DG.mouth}"/>`;
    const tc = mix(DG.tongue, DG.blood, clamp(red) * 0.75), ty = 46 * clamp(pant * 1.3) + wv;
    h += `<path d="M 44 12 Q 80 4 94 16 Q 110 ${F1(14 + ty)} 94 ${F1(26 + ty)} Q 76 ${F1(30 + ty)} 74 ${F1(10 + ty * 0.55)} Q 68 22 44 24 Z" fill="${tc}" stroke="${DG.tongueD}" stroke-width="4" stroke-linejoin="round"/><path d="M 86 18 Q 92 ${F1(14 + ty * 0.6)} 88 ${F1(18 + ty * 0.8)}" fill="none" stroke="${DG.tongueD}" stroke-width="3" stroke-linecap="round"/>`;
  }
  // あたま と はなづら（ひとつづきの形）
  h += `<path d="M -52 -20 Q -50 -62 -2 -60 Q 38 -58 60 -38 L 102 -34 Q 124 -30 120 -10 Q 116 6 94 8 L 32 14 Q 40 42 12 54 Q -34 64 -50 30 Q -58 6 -52 -20 Z" fill="${col}" stroke="${ln}" stroke-width="5" stroke-linejoin="round"/>`;
  h += `<path d="M 60 -14 Q 96 -22 114 -10 Q 112 4 94 5 L 44 10 Q 46 -8 60 -14 Z" fill="${DG.muzzle}"/>`;
  if (pant <= 0.05) h += `<path d="M 34 14 Q 62 22 92 9" fill="none" stroke="${ln}" stroke-width="5" stroke-linecap="round"/>`;
  h += `<ellipse cx="112" cy="-24" rx="15" ry="12" fill="${DG.nose}"/><circle cx="108" cy="-28" r="3.5" fill="#fff" opacity="0.6"/>`;
  h += eye === 'closed' ? `<path d="M 12 -24 q 9 7 18 0" fill="none" stroke="${DG.nose}" stroke-width="5" stroke-linecap="round"/>` : `<circle cx="22" cy="-24" r="9" fill="${DG.nose}"/><circle cx="25" cy="-27" r="3" fill="#fff"/>`;
  h += `<path d="M -30 -52 Q -72 -54 -68 12 Q -58 42 -34 22 Q -12 -10 -30 -52 Z" fill="${dk}" stroke="${ln}" stroke-width="5" stroke-linejoin="round"/>`;
  o += `<g transform="translate(134 ${F1(-216 + 2 * br)})">${h}</g></g>`;
  return o;
}
// 口の先（dogPic の中の座標）。息の「ハッ」を出す所
const DOG_MOUTH = [240, -196];
// 犬の頭を よこから切った絵（右むき。左上が原点、830×560 くらい）
//   wet: ぬれた所（水色）を目立たせる 0〜1、flow: 息の流れ 0〜1（青＝すう、オレンジ＝だす）、gland: 鼻のおくの水 0〜1、red: 舌の赤さ 0〜1、vap: かわいていく水 0〜1
const HC = 2.6;
const P_IN = [[322, 62], [296, 76], [250, 78], [200, 76], [160, 84], [128, 104], [112, 134]].map(([x, y]) => [x * HC, y * HC]);
const P_OUT = [[112, 140], [140, 118], [180, 108], [220, 106], [250, 112], [290, 126], [326, 140]].map(([x, y]) => [x * HC, y * HC]);
const plen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
function pat(P, d) {
  for (let i = 1; i < P.length; i++) {
    const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (d <= l || i === P.length - 1) { const k = clamp(l ? d / l : 0); return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; }
    d -= l;
  }
  return P[0];
}
const smooth = P => { let d = `M ${F1(P[0][0])} ${F1(P[0][1])}`; for (let i = 1; i < P.length - 1; i++) d += ` Q ${F1(P[i][0])} ${F1(P[i][1])} ${F1((P[i][0] + P[i + 1][0]) / 2)} ${F1((P[i][1] + P[i + 1][1]) / 2)}`; return d + ` L ${F1(P[P.length - 1][0])} ${F1(P[P.length - 1][1])}`; };
function headCut(t, { wet = 0, flow = 0, gland = 0, red = 0, vap = 0, heat = 0, arr = 1 } = {}) {
  const ln = DG.line, K = HC;
  let o = `<g transform="scale(${K})">`;
  // あたま（外がわ）
  o += `<path d="M40 150Q30 60 110 46Q170 36 230 52L292 70Q302 82 292 92L240 104L238 116L280 132Q284 146 270 150L180 160Q120 176 40 150Z" fill="${DG.dog}" stroke="${ln}" stroke-width="2.2" stroke-linejoin="round"/>`;
  // 鼻のおく（ひだ）と、まわりの すきま
  o += `<path d="M150 64Q200 58 284 76Q290 84 284 88L156 92Z" fill="#f6ecd9" stroke="${ln}" stroke-width="1.2"/><path d="M118 58Q134 46 156 56Q150 70 128 72Z" fill="${mix('#f6ecd9', DG.wet, 0.4 + 0.6 * wet)}" stroke="${ln}" stroke-width="1.2"/>`;
  o += [0, 1, 2, 3].map(i => `<path d="M${168 + i * 26} 68q8 6 0 11q-8 6 0 12" fill="none" stroke="${mix('#c8b79a', DG.water, 0.35 + 0.65 * wet)}" stroke-width="${F1(3 + 1.2 * wet)}" stroke-linecap="round"/>`).join('');
  // のど・口の中・舌
  o += `<path d="M150 92Q118 100 104 150L130 152Q136 122 152 118Z" fill="#f0dcc0" stroke="${ln}" stroke-width="1.2"/>`;
  o += `<path d="M150 103L238 107L236 117L150 119Z" fill="${DG.mouth}"/>`;
  const tc = mix(DG.tongue, DG.blood, clamp(red) * 0.7);
  o += `<path d="M154 112Q200 108 236 112Q262 120 262 140Q258 158 244 156Q236 140 214 128Q180 124 154 124Z" fill="${tc}" stroke="${ln}" stroke-width="1.6" stroke-linejoin="round"/>`;
  if (wet > 0.01) o += `<path d="M160 111Q200 107 236 111Q258 118 259 136" fill="none" stroke="${DG.water}" stroke-width="3.4" stroke-linecap="round" opacity="${F2(wet)}"/>`;
  // 舌の中の 血のすじ
  if (red > 0.01) o += `<path d="M160 118Q200 114 234 118Q252 124 254 142M200 116Q224 122 240 134" fill="none" stroke="${DG.blood}" stroke-width="${F1(1.2 + 2.6 * red)}" stroke-linecap="round" opacity="${F2(0.5 + 0.5 * red)}"/>`;
  // 鼻・目・耳
  o += `<ellipse cx="293" cy="77" rx="7" ry="8" fill="${DG.nose}"/><circle cx="100" cy="74" r="7.5" fill="${DG.nose}"/><circle cx="102" cy="71.5" r="2.4" fill="#fff"/>`;
  o += `<path d="M62 50Q30 56 34 112Q44 132 60 118Q72 84 62 50Z" fill="${DG.dogD}" stroke="${ln}" stroke-width="2.2" stroke-linejoin="round"/>`;
  o += `</g>`;
  // 鼻のおくから出る水（鼻の穴から 少し おく）
  if (gland > 0.01) {
    const gx = 262 * K, gy = 74 * K;
    o += `<circle cx="${gx}" cy="${gy}" r="${F1(20 + 3 * Math.sin(t * 6))}" fill="none" stroke="${C.yellow}" stroke-width="7" opacity="${F2(gland)}"/>`;
    for (let i = 0; i < 3; i++) { const f = frac(t * 0.8 + i / 3); o += dropW(gx - f * 46, gy + 6 + f * 26, 9 * (0.5 + 0.5 * Math.sin(f * Math.PI)), gland); }
  }
  // 息の流れ
  if (flow > 0.01) {
    const LI = plen(P_IN), LO = plen(P_OUT);
    o += `<path d="${smooth(P_IN)}" fill="none" stroke="${DG.inAir}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="${F2(0.22 * flow)}"/><path d="${smooth(P_OUT)}" fill="none" stroke="${DG.outAir}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="${F2(0.22 * flow)}"/>`;
    for (let i = 0; i < 7; i++) {
      const f = frac(t * 1.1 + i / 7), [x, y] = pat(P_IN, f * LI), [x2, y2] = pat(P_OUT, f * LO), a = Math.sin(f * Math.PI);
      o += `<circle cx="${F1(x)}" cy="${F1(y)}" r="10" fill="${DG.inAir}" opacity="${F2(flow * clamp(a * 3))}"/><circle cx="${F1(x2)}" cy="${F1(y2)}" r="10" fill="${DG.outAir}" opacity="${F2(flow * clamp(a * 3))}"/>`;
    }
    o += g(arrow2(P_IN[0][0] + 150, P_IN[0][1] - 40, P_IN[0][0] + 26, P_IN[0][1] - 4, DG.inAir, 16) + arrow2(P_OUT[6][0] + 10, P_OUT[6][1] + 6, P_OUT[6][0] + 140, P_OUT[6][1] + 56, DG.outAir, 16), { o: flow * arr });
  }
  // かわいていく水（ゆらゆら）と、いっしょに出ていく ねつ
  if (vap > 0.01) o += vapor(214 * K, 62 * K, t, { n: 3, gap: 60, h: 60, rise: 50, o: vap, heat }) + vapor(262 * K, 150 * K, t, { n: 2, gap: 40, h: 56, rise: 40, o: vap, heat, ph: 0.3, dx: 30 });
  return o;
}
// 肉球（足のうら。まん中が原点、半径 150 くらい）。sweat: 汗のつぶ 0〜1
function pawPic(t, sweat = 0) {
  let o = `<path d="M -120 20 Q -150 -60 -96 -110 Q -40 -160 0 -150 Q 40 -160 96 -110 Q 150 -60 120 20 Q 110 130 0 140 Q -110 130 -120 20 Z" fill="${DG.dog}" stroke="${DG.line}" stroke-width="7" stroke-linejoin="round"/>`;
  const pads = [[0, 50, 62, 50, 0], [-84, -34, 26, 34, -24], [-32, -84, 26, 36, -8], [32, -84, 26, 36, 8], [84, -34, 26, 34, 24]];
  pads.forEach(([x, y, rx, ry, r]) => { o += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${DG.pad}" transform="rotate(${r} ${x} ${y})"/><ellipse cx="${x - rx * 0.25}" cy="${y - ry * 0.3}" rx="${rx * 0.3}" ry="${ry * 0.22}" fill="#fff" opacity="0.18"/>`; });
  if (sweat > 0.01) [[-20, 40], [24, 62], [4, 24], [-84, -40], [-30, -92], [34, -80], [86, -30]].forEach(([x, y], i) => { const k = 0.7 + 0.3 * Math.sin(t * 3 + i * 1.7); o += dropW(x, y + 4, 9 * k, sweat); });
  return o;
}
// 外の けしき
const parkBg = (id = 'pk', k = 0) => skyRect(id, k) + `<path d="M 0 800 Q 480 740 960 790 T 1920 770 L 1920 1080 L 0 1080 Z" fill="${mix(DG.grass, '#6f7f6a', k * 0.5)}"/><path d="M 0 880 Q 620 820 1240 890 T 1920 870 L 1920 1080 L 0 1080 Z" fill="${mix(DG.grassD, '#5f705e', k * 0.5)}"/>`;
// 息の「ハッ」（口の先から右へ ぽんぽん出る）。5かい/びょう
function puffs(x, y, t, o = 1, s = 1) {
  let out = '';
  for (let i = 0; i < 3; i++) { const f = frac(t * 5 / 3 + i / 3); out += `<circle cx="${F1(x + f * 110 * s)}" cy="${F1(y + f * 26 * s)}" r="${F1((8 + 16 * f) * s)}" fill="#fff" stroke="${DG.outAir}" stroke-width="${F1(4 * s)}" opacity="${F2(o * (1 - f) * 0.9)}"/>`; }
  return out;
}

// 1. つかみ：走ってきた犬が、舌を出してハアハア
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = parkBg('pkh') + sunDisc(1690, 170, 74, 0) + cloud(420, 210, 0.8) + cloud(1180, 150, 0.6) + tree(210, 800, 1.5) + tree(1500, 790, 1.0);
    const DX = 640, DY = 852, DS = 1.5, rk = eo(prog(t, 0.2, 3.0)), going = 1 - prog(t, 2.8, 0.5), pant = lerp(0.35, 1, prog(t, 3.0, 1.0));
    const x = lerp(-420, DX, rk);
    out += g(dogPic(t, { pant, walk: going, run: 1 }), { x, y: DY, s: DS });
    const MX = x + DOG_MOUTH[0] * DS, MY = DY + DOG_MOUTH[1] * DS;
    out += tag(x + (134 + 90) * DS, DY + (-216 + 56) * DS, 1300, 400, 'したを だらーん', win(t, mid(0, 0.62), c1 - 0.2, 0.3), { size: 46, col: DG.tongueD });
    const hO = prog(t, c1, 0.4) * (1 - prog(t, cueE(3) + 0.4, 0.3));
    out += puffs(MX + 10, MY + 20, t, hO, 1.5);
    out += g(text(0, 0, 'ハア', { size: 64, w: 900, fill: DG.outAir, extra: `stroke="#fff" stroke-width="12" paint-order="stroke"` }), { x: 1170, y: 690 + Math.sin(t * 10) * 6, o: hO, r: -6 }) + g(text(0, 0, 'ハア', { size: 52, w: 900, fill: DG.outAir, extra: `stroke="#fff" stroke-width="12" paint-order="stroke"` }), { x: 1310, y: 760 + Math.cos(t * 10) * 6, o: hO * prog(t, c1 + 0.5, 0.3), r: 5 });
    out += kidShow('S', t, 1710, 872, { s: 0.62, start: c1 + 0.6, n: 0, side: 'left', size: 46, look: [-8, 0] });
    out += g(text(0, 0, '？', { size: 190, w: 900, fill: C.ochre, extra: `stroke="#fff" stroke-width="18" paint-order="stroke"` }), { x: 1280, y: 380, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 180);
      out += g(`<text x="0" y="0" font-size="100" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">いぬは、どうして <tspan fill="${DG.tongueD}">した</tspan>を だして</text>`, { x: 960, y: 340, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${DG.outAir}">ハアハア</tspan> するの？</text>`, { x: 960, y: 510, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(dogPic(t, { pant: 1 }), { x: -60, y: 130, s: 0.82 }) + puffs(-60 + DOG_MOUTH[0] * 0.82 + 6, 130 + DOG_MOUTH[1] * 0.82 + 12, t, 1, 0.82), t, t0 + 1.8, 960, 700);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'いぬが あせを かけるのは、どこだと おもう？', { size: 58, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', ['からだじゅう']], ['②', ['あしの うらの、にくきゅう']], ['③', ['したの うえ']]];
    const cur = curLine(), osz = Math.min(...opts.flatMap(([, L]) => L.map(s => fit(s, 1040, 52))));
    opts.forEach(([n, L], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-80" width="1260" height="160" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 140) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        L.map((s, j) => text(-460, 2 + (j - (L.length - 1) / 2) * (osz + 14), s, { size: osz, w: 700, anchor: 'start' })).join(''), t, cue(i + 1) - 0.2, 820, 384 + i * 166);
    });
    out += pop(g(dogPic(t, { pant: 1 }), { x: -30, y: 80, s: 0.5 }) + dropW(-130, -120, 22) + text(130, -110, '？', { size: 120, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1660, 380);
    out += kidShow('B', t, 1740, 850, { s: 0.6, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1540, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 人は体じゅうに汗、犬はほぼ肉球だけ
SCENES.push({
  id: 'sweat',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    // ひと
    const HX = 330, HY = 852, HS = 0.8;
    out += g(sunDisc(110, 250, 44, 0, { glow: 0.6 }), { o: prog(t, 0.2, 0.5) });
    out += kidShow('S', t, HX, HY, { s: HS, start: 0.1, n: 0, bubble: false, pose: 'stand', mouth: 'o', look: [6, 0] });
    const sw = prog(t, c0 + 0.9, 0.6);
    if (sw > 0) [[-128, -400, 0], [126, -372, 0.4], [-92, -236, 0.2], [92, -222, 0.7], [-8, -176, 0.5], [-30, -78, 0.1], [30, -64, 0.8], [-136, -300, 0.6], [134, -292, 0.3]].forEach(([x, y, p]) => { const f = frac(t * 0.45 + p); out += dropW(HX + x * HS, HY + y * HS + f * 34, 11, sw * Math.sin(f * Math.PI)); });
    out += pop(badge('ひとは からだじゅうに あせ', { fill: DG.waterD, size: 44 }), t, c0 + 1.0, 360, 424);
    // いぬ
    const DX = 770, DY = 852, DS = 1.15;
    out += g(dogPic(t, { pant: 0.7 }), { x: DX, y: DY, s: DS, o: prog(t, 0.3, 0.5) });
    // 肉球のアップ
    const zO = prog(t, c1 + 0.2, 0.4);
    if (zO > 0) {
      const ZX = 1380, ZY = 345, ZR = 158, px = DX + 64 * DS, py = DY - 8;
      let z = `<line x1="${px - ZX}" y1="${py - ZY}" x2="${-ZR * 0.66}" y2="${ZR * 0.76}" stroke="${DG.line}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/><circle cx="${px - ZX}" cy="${py - ZY}" r="26" fill="none" stroke="${C.ochre}" stroke-width="7"/>`;
      z += `<circle r="${ZR}" fill="#fff" filter="url(#shadow)"/><clipPath id="pzc"><circle r="${ZR}"/></clipPath><g clip-path="url(#pzc)">${g(pawPic(t, prog(t, mid(1, 0.55), 0.6)), { s: 0.94, y: 6 })}</g><circle r="${ZR}" fill="none" stroke="${C.ochre}" stroke-width="10"/>`;
      out += g(z, { x: ZX, y: ZY, o: zO, s: lerp(0.9, 1, eo(zO)) });
      out += pop(badge('いぬは ほぼ にくきゅうだけ', { fill: DG.pad, size: 44 }), t, mid(1, 0.5), 1380, 136);
    }
    out += kidShow('B', t, 1796, 872, { s: 0.5, start: c1 + 1.0, n: 1, side: 'left', size: 42, look: [-8, -6] });
    out += g(text(0, 0, 'にくきゅうの あせは わずか', { size: 42, w: 900 }) + g(text(0, 62, 'からだを ひやす やくめは ちいさい', { size: 42, w: 900, fill: C.redUi }), { o: prog(t, mid(3, 0.45), 0.4) }), { x: 720, y: 236, o: prog(t, c3 + 0.3, 0.4) });
    return out;
  },
});

// 4. 水はかわくとき、まわりの熱を持っていく
SCENES.push({
  id: 'evap',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), HX = 60, HY = 190, X = x => HX + x * HC, Y = y => HY + y * HC;
    const wet = prog(t, c0 + 0.6, 0.8), vp = prog(t, c3 + 0.3, 0.6);
    out += g(headCut(t, { wet, vap: vp, heat: vp }), { x: HX, y: HY });
    out += tag(X(214), Y(72), 640, 222, 'はなの おく', wet * prog(t, mid(0, 0.45), 0.3) * (1 - vp), { size: 42, col: DG.waterD });
    out += tag(X(200), Y(116), 430, 756, 'くちの なか・した', wet * prog(t, mid(0, 0.6), 0.3), { size: 42, col: DG.waterD });
    out += pop(badge('ぬれて いる ところ', { fill: DG.waterD, size: 46, pad: 38 }), t, mid(0, 0.75), 1380, 200, { end: c1 - 0.2 });
    // ぬれたものが かわくとき
    const aO = win(t, c1 - 0.1, c2 - 0.2, 0.35), CX = 1400, CY = 480;
    if (aO > 0) {
      let c = card(780, 540);
      c += `<rect x="-300" y="60" width="600" height="150" rx="24" fill="#f6c9a0" stroke="#d9a070" stroke-width="5"/>` + text(0, 168, 'あたたかい もの', { size: 34, w: 900, fill: '#a8642a' });
      c += `<path d="M -300 60 q 50 -34 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 L 300 84 L -300 84 Z" fill="${DG.water}" opacity="0.85"/>`;
      for (let i = 0; i < 6; i++) c += heatDot(-240 + i * 96, 118 + Math.sin(t * 3 + i) * 5, 12, 1 - prog(t, c1 + 1.2 + i * 0.5, 0.6) * 0.75);
      c += vapor(0, 30, t, { n: 5, gap: 110, h: 90, rise: 110, o: prog(t, c1 + 0.8, 0.6), heat: 1, w: 9 });
      c += text(0, -220, 'みずが かわく とき', { size: 44, w: 900, fill: DG.waterD }) + g(text(0, -162, 'まわりの ねつを もって いく', { size: 44, w: 900, fill: '#c9661a' }), { o: prog(t, mid(1, 0.5), 0.4) });
      out += g(c, { x: CX, y: CY, o: aO, s: lerp(0.95, 1, eo(prog(t, c1 - 0.1, 0.4))) });
    }
    // プールから上がると ひんやり
    const bO = win(t, c2 - 0.1, c3 - 0.2, 0.35);
    if (bO > 0) {
      let c = card(780, 540) + `<clipPath id="plc"><rect x="-390" y="-270" width="780" height="540" rx="28"/></clipPath><g clip-path="url(#plc)"><rect x="-390" y="-270" width="780" height="540" fill="#eaf6fb"/>`;
      c += `<rect x="-390" y="150" width="780" height="120" fill="#e9dcc3"/><rect x="-390" y="96" width="330" height="174" fill="${DG.water}"/><path d="M -390 96 q 28 -18 55 0 t 55 0 t 55 0 t 55 0 t 55 0 t 55 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" transform="translate(${F1(Math.sin(t * 2) * 8)} 0)"/>`;
      c += `<path d="M -110 60 V 190 M -70 60 V 190 M -110 100 H -70 M -110 140 H -70" stroke="#9aa3a8" stroke-width="9" stroke-linecap="round" fill="none"/></g>`;
      c += text(0, -216, 'プールから あがると…', { size: 42, w: 900 });
      out += g(c, { x: CX, y: CY, o: bO });
      out += g(kidShow('B', t, CX + 150, CY + 196, { s: 0.6, start: c2, n: 1, bubble: false, pose: 'shrug', mouth: 'o', eyes: 'wide' }), { o: bO });
      [[-44, -210, 0], [40, -190, 0.5], [-56, -120, 0.3], [56, -100, 0.8]].forEach(([x, y, p]) => { const f = frac(t * 0.6 + p); out += dropW(CX + 150 + x, CY + 196 + y + f * 40, 10, bO * Math.sin(f * Math.PI)); });
      out += vapor(CX + 150, CY - 60, t, { n: 2, gap: 150, h: 70, rise: 60, o: bO * prog(t, c2 + 0.8, 0.5), heat: 1 });
      out += pop(badge('ひんやり！', { fill: DG.waterD, size: 50, pad: 40 }), t, mid(2, 0.5), CX - 180, CY - 60, { end: c3 - 0.2 });
    }
    // 犬は 口と鼻の中の水を かわかして
    const dO = prog(t, c3 + 0.2, 0.4);
    if (dO > 0) {
      out += g(text(0, 0, 'くちと はなの なかの', { size: 50, w: 900 }) + text(0, 70, 'みずを かわかして…', { size: 50, w: 900, fill: DG.waterD }), { x: 1400, y: 330, o: dO });
      out += g(text(0, 0, 'ねつを そとへ すてる', { size: 56, w: 900, fill: '#c9661a' }), { x: 1400, y: 520, o: prog(t, mid(3, 0.55), 0.4) });
      for (let i = 0; i < 5; i++) { const f = frac(t * 0.5 + i / 5); out += heatDot(lerp(980, 1700, f), 640 + Math.sin(f * 9 + i) * 30 - f * 60, 13, prog(t, mid(3, 0.55), 0.4) * Math.sin(f * Math.PI)); }
    }
    return out;
  },
});

// 5. 鼻から吸って口から出す・鼻のおくの水・舌に血が5倍あまり
SCENES.push({
  id: 'nose',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c2 = cue(2), c3 = cue(3), c4 = cue(4), HX = 60, HY = 210, X = x => HX + x * HC, Y = y => HY + y * HC;
    const flow = prog(t, c0 + 0.4, 0.6) * lerp(1, 0.4, prog(t, c2 - 0.3, 0.5)), gl = prog(t, c2 + 0.2, 0.5) * (1 - prog(t, c3 - 0.3, 0.4)), red = prog(t, c3 + 0.6, 1.6), vp = prog(t, c4 + 0.2, 0.6);
    out += g(headCut(t, { wet: 1, flow, gland: gl, red, arr: 1 - prog(t, c3 - 0.3, 0.4) }), { x: HX, y: HY });
    if (vp > 0) out += vapor(X(262), Y(150), t, { n: 3, gap: 44, h: 60, rise: 50, o: vp, heat: 1, dx: 30 });
    const lO = 1 - prog(t, c2 - 0.3, 0.4);
    out += pop(badge('はなから すう', { fill: DG.inAir, size: 48, pad: 38 }), t, mid(0, 0.45), 1330, 300, { end: c2 - 0.3 });
    out += pop(badge('くちから だす', { fill: DG.outAir, size: 48, pad: 38 }), t, mid(0, 0.65), 1330, 660, { end: c2 - 0.3 });
    out += g(text(0, 0, '（あつくて ハアハアして いる とき）', { size: 32, w: 700, fill: C.muted }), { x: 560, y: 790, o: lO * prog(t, mid(0, 0.3), 0.4) });
    out += kidShow('S', t, 1710, 872, { s: 0.6, start: mid(0, 0.6), n: 0, side: 'left', size: 46, look: [-8, -4] });
    // 鼻のおくの水
    out += tag(X(262), Y(74) - 24, 640, 190, 'はなの おくから みずが でる', gl, { size: 42, col: DG.waterD });
    // 舌に血が5倍あまり
    const bO = prog(t, c3 + 0.2, 0.4);
    if (bO > 0) {
      let c = card(700, 320) + text(0, -112, 'したに ながれる ち', { size: 40, w: 900 });
      const k1 = eo(prog(t, c3 + 0.8, 0.5)), k2 = eo(prog(t, mid(3, 0.45), 1.2));
      c += text(-316, -36, 'すずしい とき', { size: 32, w: 900, anchor: 'start', fill: DG.waterD }) + `<rect x="-60" y="-56" width="${F1(66 * k1)}" height="40" rx="12" fill="${DG.blood}" opacity="0.55"/>`;
      c += text(-316, 34, 'あつい とき', { size: 32, w: 900, anchor: 'start', fill: DG.hot }) + `<rect x="-60" y="14" width="${F1(363 * k2)}" height="40" rx="12" fill="${DG.blood}"/>`;
      c += g(text(0, 112, '5ばい あまり', { size: 54, w: 900, fill: DG.blood }), { o: prog(t, mid(3, 0.7), 0.3), s: lerp(1.2, 1, eo(prog(t, mid(3, 0.7), 0.4))) });
      out += g(c, { x: 1380, y: 420, o: bO, s: lerp(0.95, 1, eo(bO)) });
    }
    out += tag(X(250), Y(142), 520, 770, 'したに ちが たくさん', prog(t, mid(3, 0.3), 0.3) * (1 - prog(t, c4 - 0.2, 0.3)), { size: 42, col: DG.blood });
    out += tag(X(250), Y(142), 560, 770, 'したも ねつを すてる おてつだい', prog(t, c4 + 0.3, 0.3), { size: 42, col: '#c9661a' });
    return out;
  },
});

// 6. 1秒に5回くらいの、ちょうどいいリズム
function swingPic(t, t0) {
  // ブランコ（上の まん中が ささえ。720×600 のカードの中）。後ろ（左）へ来たときに 手で 押す
  const T = 1.6, u = Math.max(0, t - t0), A = lerp(9, 36, eo(clamp(u / 5.5))), th = -A * Math.cos(2 * Math.PI * u / T), cyc = frac(u / T);
  let o = `<path d="M -222 196 L -150 -206 L 150 -206 L 222 196" fill="none" stroke="${C.blueUi}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`;
  // 押す手（まわりはじめの ちょうどいい とき）
  const pk = u > 0 ? Math.max(0, 1 - Math.abs(cyc - 0.06) / 0.1) : 0, hx = -300 * Math.sin(A * Math.PI / 180) - 74 + pk * 30, hy = -206 + 300 * Math.cos(A * Math.PI / 180) - 40;
  o += g(`<path d="M -130 20 L -30 6" stroke="#5f8fb5" stroke-width="44" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="28" ry="32" fill="${DG.skin}" stroke="${DG.line}" stroke-width="4"/>`, { x: hx, y: hy, o: 0.35 + 0.65 * pk });
  if (pk > 0.2) o += `<path d="M ${F1(hx + 44)} ${F1(hy - 36)} l 22 -14 M ${F1(hx + 50)} ${F1(hy)} l 28 0 M ${F1(hx + 44)} ${F1(hy + 36)} l 22 14" stroke="${C.ochre}" stroke-width="7" stroke-linecap="round"/>`;
  let s = `<line x1="-34" y1="0" x2="-34" y2="300" stroke="#8a8f94" stroke-width="7"/><line x1="34" y1="0" x2="34" y2="300" stroke="#8a8f94" stroke-width="7"/><rect x="-62" y="296" width="124" height="18" rx="9" fill="${C.ochre}"/>`;
  // のっている子（右むき）
  s += `<path d="M -10 290 L 56 296 L 70 352" fill="none" stroke="#35657f" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="78" cy="358" rx="20" ry="11" fill="#6b4a3a"/>`;
  s += `<rect x="-36" y="196" width="62" height="104" rx="26" fill="#f6b500"/><path d="M 0 226 L 30 250" stroke="#f6b500" stroke-width="20" stroke-linecap="round"/><circle cx="34" cy="252" r="12" fill="${DG.skin}"/>`;
  s += `<circle cx="-2" cy="158" r="44" fill="${DG.skin}"/><path d="M -46 160 Q -52 108 -2 110 Q 40 110 44 144 Q 16 126 -12 138 Q -30 150 -46 160 Z" fill="#4b3226"/><circle cx="22" cy="158" r="5" fill="#3a2a22"/><path d="M 14 176 q 10 7 20 -1" fill="none" stroke="#3a2a22" stroke-width="4" stroke-linecap="round"/><circle cx="6" cy="174" r="7" fill="#f2a99a" opacity="0.7"/>`;
  o += `<g transform="translate(0 -206) rotate(${F1(-th)})">${s}</g>`;
  return o;
}
SCENES.push({
  id: 'rate',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), DX = 430, DY = 852, DS = 1.35;
    const hl = prog(t, c1 + 0.2, 0.4) * (1 - prog(t, c2 - 0.3, 0.3)) + prog(t, c3 + 0.3, 0.4) * 0.0;
    out += g(dogPic(t, { pant: 1, hl }), { x: DX, y: DY, s: DS });
    const MX = DX + DOG_MOUTH[0] * DS, MY = DY + DOG_MOUTH[1] * DS;
    out += puffs(MX + 8, MY + 18, t, 1 - prog(t, c3, 0.3), 1.3);
    // 1秒のものさし
    const rO = prog(t, c0 + 0.3, 0.4) * (1 - prog(t, c2 - 0.4, 0.4));
    if (rO > 0) {
      const X0 = 1010, W = 700, Y0 = 400, f = frac(t), n = Math.floor(f * 5);
      let r = `<rect x="${X0}" y="${Y0 - 14}" width="${W}" height="28" rx="14" fill="#e7dfcc"/><rect x="${X0}" y="${Y0 - 14}" width="${F1(W * f)}" height="28" rx="14" fill="${DG.outAir}" opacity="0.8"/>`;
      for (let i = 0; i < 5; i++) {
        const on = i <= n, x = X0 + W * (i + 0.5) / 5, k = i === n ? 1 + 0.25 * Math.sin(frac(f * 5) * Math.PI) : 1;
        r += g(`<circle r="46" fill="${on ? DG.outAir : '#fff'}" stroke="${DG.outAir}" stroke-width="6"/>` + text(0, 2, 'ハッ', { size: 34, w: 900, fill: on ? '#fff' : DG.outAir }), { x, y: Y0 - 96, s: k });
      }
      r += `<path d="M ${X0} ${Y0 + 34} v 22 h ${W} v -22" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` + text(X0 + W / 2, Y0 + 100, '1びょう', { size: 50, w: 900 });
      out += g(r, { o: rO });
      out += pop(badge('ハアハアは 1びょうに 5かいくらい', { fill: DG.outAir, size: 46, pad: 38 }), t, mid(0, 0.4), 1360, 170, { end: c2 - 0.4 });
    }
    out += tag(DX + 44 * DS, DY - 112 * DS, 1320, 640, 'むねが いちばん ゆれやすい リズム', prog(t, c1 + 0.5, 0.3) * (1 - prog(t, c2 - 0.4, 0.3)), { size: 42, col: '#a8791a' });
    // ブランコ
    const sO = win(t, c2 - 0.2, c3 - 0.2, 0.35);
    if (sO > 0) {
      let c = card(760, 640) + g(swingPic(t, c2 + 0.4), { y: 30 });
      c += text(0, -272, 'ちょうどの タイミングで おすと…', { size: 38, w: 900 });
      c += g(text(0, 286, 'ちいさな ちからで おおきく ゆれる', { size: 38, w: 900, fill: '#a8791a' }), { o: prog(t, mid(2, 0.6), 0.4) });
      out += g(c, { x: 1390, y: 470, o: sO, s: lerp(0.95, 1, eo(prog(t, c2 - 0.2, 0.4))) });
    }
    // 少ない力で、たくさんの空気
    const aO = prog(t, c3 + 0.2, 0.4);
    if (aO > 0) {
      const f = frac(t * 5), inn = f < 0.5 ? 1 : 0.25, outt = f >= 0.5 ? 1 : 0.25;
      out += g(arrow2(MX + 330, MY - 130, MX + 60, MY - 64, DG.inAir, 22), { o: aO * inn }) + g(arrow2(MX + 40, MY + 40, MX + 320, MY + 130, DG.outAir, 22), { o: aO * outt });
      out += g(text(0, 0, 'すくない ちからで', { size: 54, w: 900, fill: '#a8791a' }) + text(0, 78, 'たくさんの くうきを うごかせる', { size: 54, w: 900 }), { x: 1340, y: 250, o: prog(t, mid(3, 0.3), 0.4) });
    }
    return out;
  },
});

// 7. むし暑い日は冷えにくい・散歩と車の注意
const HDOTS = Array.from({ length: 70 }, (_, i) => [-390 + rnd(i, 31) * 780, -250 + rnd(i, 32) * 480]);
function carDog(wa = 0) {
  const wheel = x => `<g transform="translate(${x} -36)"><circle r="36" fill="#3a3f44"/><circle r="17" fill="#cfd5d8"/></g>`;
  return `<path d="M -186 -34 L -186 -78 Q -182 -98 -156 -102 L -112 -108 L -74 -162 Q -66 -172 -50 -172 L 58 -172 Q 76 -172 88 -160 L 130 -110 L 172 -98 Q 190 -92 190 -72 L 190 -34 Z" fill="#6f9fc9" stroke="#3f6f99" stroke-width="6" stroke-linejoin="round"/>` +
    `<path d="M -92 -110 L -62 -152 Q -58 -158 -50 -158 L -8 -158 L -8 -110 Z" fill="#dff1fa"/><path d="M 6 -158 L 54 -158 Q 66 -158 74 -150 L 108 -110 L 6 -110 Z" fill="#dff1fa"/>` +
    `<circle cx="-44" cy="-124" r="19" fill="${DG.dog}" stroke="${DG.line}" stroke-width="3"/><path d="M -34 -128 L -14 -124 L -32 -114 Z" fill="${DG.muzzle}" stroke="${DG.line}" stroke-width="3" stroke-linejoin="round"/><circle cx="-15" cy="-124" r="4" fill="${DG.nose}"/><circle cx="-40" cy="-129" r="3" fill="${DG.nose}"/><path d="M -56 -138 Q -66 -128 -58 -112" fill="none" stroke="${DG.dogD}" stroke-width="9" stroke-linecap="round"/><path d="M -30 -114 q 2 12 -6 12" fill="none" stroke="${DG.tongue}" stroke-width="6" stroke-linecap="round"/>` +
    `<rect x="170" y="-84" width="20" height="16" rx="6" fill="#ffe27a"/><rect x="-186" y="-84" width="12" height="16" rx="4" fill="#8e1f14"/><line x1="-2" y1="-104" x2="-2" y2="-40" stroke="#3f6f99" stroke-width="4"/>` + wheel(-108) + wheel(112);
}
// さんぽの人（右むき、かんたん）。手は (58,-150) の あたり
const ownerPic = (t, walk = 1) => { const a = Math.sin(t * 7) * 16 * walk;
  return `<g transform="rotate(${F1(a)} 0 -150)"><rect x="-14" y="-150" width="28" height="150" rx="13" fill="#5b6f8f"/><ellipse cx="8" cy="-4" rx="22" ry="11" fill="#6b4a3a"/></g><g transform="rotate(${F1(-a)} 0 -150)"><rect x="-14" y="-150" width="28" height="150" rx="13" fill="#6f84a6"/><ellipse cx="8" cy="-4" rx="22" ry="11" fill="#6b4a3a"/></g>` +
    `<rect x="-44" y="-300" width="88" height="170" rx="36" fill="#5f9e86"/><path d="M 10 -270 L 56 -160" stroke="#5f9e86" stroke-width="26" stroke-linecap="round"/><circle cx="58" cy="-152" r="15" fill="${DG.skin}"/>` +
    `<circle cx="4" cy="-346" r="44" fill="${DG.skin}"/><path d="M -40 -344 Q -46 -396 4 -394 Q 46 -394 48 -360 Q 22 -378 -8 -366 Q -26 -356 -40 -344 Z" fill="#3a2a22"/><circle cx="26" cy="-346" r="5" fill="#3a2a22"/><path d="M 18 -328 q 10 6 18 -1" fill="none" stroke="#3a2a22" stroke-width="4" stroke-linecap="round"/>`; };
SCENES.push({
  id: 'humid',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    // からっとした日 と むしむしの日
    const pO = 1 - prog(t, c2 - 0.5, 0.4);
    if (pO > 0) {
      const panel = (cx, humid, o) => {
        let p = `<clipPath id="hp${humid}"><rect x="-410" y="-290" width="820" height="580" rx="28"/></clipPath>` + card(820, 580) + `<g clip-path="url(#hp${humid})"><rect x="-410" y="-290" width="820" height="580" fill="${humid ? '#dfe8ec' : '#e3f2fb'}"/><rect x="-410" y="190" width="820" height="100" fill="${humid ? '#a9c6a0' : DG.grass}"/>`;
        p += sunDisc(300, -200, 40, 0, { glow: 0.6 });
        if (humid) HDOTS.forEach(([x, y], i) => { p += `<circle cx="${F1(x + Math.sin(t * 0.8 + i) * 8)}" cy="${F1(y + Math.cos(t * 0.7 + i * 1.3) * 8)}" r="7" fill="${DG.water}" opacity="0.5"/>`; });
        p += g(dogPic(t, { pant: 1, red: humid ? 0.8 : 0 }), { x: -150, y: 232, s: 0.95 });
        const mx = -150 + DOG_MOUTH[0] * 0.95, my = 232 + DOG_MOUTH[1] * 0.95;
        p += humid ? vapor(mx + 60, my - 10, t, { n: 1, h: 60, rise: 40, o: 0.7, heat: 1, dx: 30 }) : vapor(mx + 90, my - 6, t, { n: 4, gap: 46, h: 76, rise: 90, o: 1, heat: 1, dx: 40 });
        p += `</g>` + g(badge(humid ? 'むしむしの ひ' : 'からっと した ひ', { fill: humid ? '#6f8794' : DG.waterD, size: 44, pad: 36 }), { x: -190, y: -236 });
        return g(p, { x: cx, y: 470, o });
      };
      out += panel(490, 0, pO * prog(t, 0.2, 0.5));
      out += panel(1430, 1, pO * prog(t, c0 + 0.3, 0.5));
      out += pop(badge('みずが よく かわく', { fill: DG.waterD, size: 40 }), t, mid(0, 0.3), 620, 310, { end: c2 - 0.5 });
      out += pop(badge('みずが かわきにくい', { fill: '#6f8794', size: 40 }), t, mid(0, 0.6), 1580, 310, { end: c2 - 0.5 });
      out += pop(badge('ハアハアしても ひえにくい', { fill: DG.hot, size: 42 }), t, c1 + 0.3, 1500, 400, { end: c2 - 0.5 });
    }
    // 散歩は すずしい朝や夕方に ／ 車の中に残さない
    const wO = prog(t, c2 - 0.2, 0.4);
    if (wO > 0) {
      let p = `<clipPath id="hw"><rect x="-410" y="-270" width="820" height="540" rx="28"/></clipPath>` + card(820, 540) + `<g clip-path="url(#hw)">` + skyRect('hws', 0.72, { x: -410, y: -270, w: 820, h: 540 }) + sunDisc(320, -50, 54, 0.9, { glow: 0.8 });
      p += `<rect x="-410" y="150" width="820" height="120" fill="#7f9a78"/>`;
      p += g(ownerPic(t, 1), { x: -230, y: 222, s: 0.8 }) + g(dogPic(t, { pant: 0, walk: 1 }), { x: 70, y: 226, s: 0.72 });
      p += `<path d="M ${-230 + 58 * 0.8} ${222 - 150 * 0.8} Q -40 150 ${70 + 118 * 0.72} ${226 - 160 * 0.72}" fill="none" stroke="#c0392b" stroke-width="5"/></g>`;
      p += g(badge('さんぽは すずしい あさや ゆうがたに', { fill: '#c8602c', size: 38 }), { y: -206 });
      out += g(p, { x: 490, y: 480, o: wO, s: lerp(0.95, 1, eo(wO)) });
    }
    const cO = prog(t, c3 - 0.2, 0.4);
    if (cO > 0) {
      let p = `<clipPath id="hc"><rect x="-410" y="-270" width="820" height="540" rx="28"/></clipPath>` + card(820, 540) + `<g clip-path="url(#hc)"><rect x="-410" y="-270" width="820" height="540" fill="#fbeedd"/>` + sunDisc(-280, -150, 60, 0.3, { glow: 1 });
      p += `<rect x="-410" y="150" width="820" height="120" fill="${DG.road}"/>` + g(carDog(), { x: 20, y: 190, s: 1.5 });
      p += vapor(20, -110, t, { n: 4, gap: 110, h: 70, rise: 50, o: 0.9, col: DG.hot, w: 9 }) + `</g>`;
      p += g(cross(0, 0, 1.5), { x: 200, y: -60, o: prog(t, mid(3, 0.5), 0.25), s: lerp(1.3, 1, eo(prog(t, mid(3, 0.5), 0.3))) });
      p += g(badge('くるまの なかに のこさない', { fill: C.red, size: 40 }), { y: -206 });
      out += g(p, { x: 1430, y: 480, o: cO, s: lerp(0.95, 1, eo(cO)) });
    }
    return out;
  },
});

// 8. 正解 と みてみよう
const handIcon = `<ellipse cx="0" cy="4" rx="20" ry="22" fill="${DG.skin}" stroke="${C.ink}" stroke-width="4"/><path d="M -12 -14 V -30 M -4 -17 V -34 M 4 -17 V -34 M 12 -14 V -30" stroke="${DG.skin}" stroke-width="9" stroke-linecap="round"/>`;
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -530, ans = 'あしの うらの、にくきゅう';
      let a = pop(card(1240, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.accent}"/>` + text(NX, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, ans, { size: fit(ans, 1000, 58, 900), w: 900, anchor: 'start' }) + g(pawPic(t, 1), { x: 480, y: 0, s: 0.42 }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += flowRow([['あせは ほぼ にくきゅうだけ', DG.pad], ['くちと はなの みずを かわかす', DG.waterD], ['ねつを すてて ひやす', '#c9661a']], t, 960, 560, { start: 2.6, step: 0.9, size: 36, gap: 64 });
      a += pop(g(dogPic(t, { pant: 1 }), { s: 0.6 }) + puffs(DOG_MOUTH[0] * 0.6 + 6, DOG_MOUTH[1] * 0.6 + 10, t, 1, 0.6), t, cue(1), 900, 810);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(2) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(2) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [g(eyeIcon(0.24), {}), 'さんぽの いぬを、はなれた ところから みる', C.ink, cue(2)],
        [qm, 'あるきはじめと はしった あと、どう ちがう？', C.ink, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'しらない いぬには ちかづかない', C.red, cue(4)],
        [g(handIcon, { s: 1.0 }), 'さわる ときは、かいぬしの ひとに きいてから', C.red, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 1010, 44, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 130, 320 + i * 112); });
      // 絵
      const PX = 1580, PY = 500;
      let p = card(580, 560, { fill: '#fff' }) + `<clipPath id="lkc"><rect x="-290" y="-280" width="580" height="560" rx="28"/></clipPath><g clip-path="url(#lkc)">`;
      const o1 = 1 - prog(t, cue(4) - 0.3, 0.4), o2 = prog(t, cue(4) - 0.1, 0.4);
      if (o1 > 0) {
        let q = `<rect x="-290" y="-280" width="580" height="560" fill="#eaf6fb"/><rect x="-290" y="-36" width="580" height="44" fill="${DG.grass}"/><rect x="-290" y="236" width="580" height="44" fill="${DG.grass}"/><rect x="-290" y="8" width="580" height="8" fill="#fff"/>`;
        q += g(dogPic(t, { pant: 0, walk: 1 }), { x: -40, y: -30, s: 0.62 }) + text(-150, -238, 'あるきはじめ', { size: 36, w: 900, fill: C.blueUi });
        const rO = prog(t, cue(2) + 1.6, 0.4);
        q += g(g(dogPic(t, { pant: 1 }), { x: -40, y: 242, s: 0.62 }) + puffs(-40 + DOG_MOUTH[0] * 0.62 + 6, 242 + DOG_MOUTH[1] * 0.62 + 10, t, 1, 0.62) + text(-160, 44, 'はしった あと', { size: 36, w: 900, fill: '#c9661a' }), { o: rO });
        p += g(q, { o: o1 });
      }
      if (o2 > 0) {
        let q = `<rect x="-290" y="-280" width="580" height="560" fill="#eaf6fb"/><rect x="-290" y="190" width="580" height="90" fill="${DG.grass}"/>`;
        q += g(ownerPic(t, 0), { x: -170, y: 232, s: 0.74 }) + g(dogPic(t, { pant: 0.5 }), { x: 80, y: 236, s: 0.72 });
        q += `<path d="M ${-170 + 58 * 0.74} ${232 - 150 * 0.74} Q 0 150 ${80 + 118 * 0.72} ${236 - 160 * 0.72}" fill="none" stroke="#c0392b" stroke-width="5"/>`;
        q += g(g(handIcon, { s: 1.8 }) + text(70, -8, '？', { size: 80, w: 900, fill: C.ochre }), { x: 40, y: -96, o: prog(t, cue(5) + 0.2, 0.4) });
        q += g(text(0, -230, 'かいぬしさんに きいてから', { size: 34, w: 900, fill: C.red }), { o: prog(t, cue(5) + 0.4, 0.4) });
        p += g(q, { o: o2 });
      }
      p += `</g>`;
      b += pop(p, t, cue(2) + 0.3, PX, PY);
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
    out += g(text(0, 0, 'くわしくは サイトの「いぬ」の ページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 778, o: prog(t, 2.0, 0.5) });
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

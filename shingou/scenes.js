// みのまわり図鑑 動画「緑なのに、どうして『青信号』？」
// show(sceneIndex, t) で、その場面の t 秒目の絵を描く（毎フレーム描き直す、決まった絵になる）。

// ---------- 色 ----------
const C = {
  paper: '#fffaf0', paperSoft: '#f8f1e3', ink: '#1e1d19', muted: '#69685f', line: '#e4dccb',
  accent: '#4f6f5f', accentSoft: '#dfe9dc', blueUi: '#35657f', blueSoft: '#dce8ef',
  redUi: '#a85a4d', ochre: '#9a7438', ochreSoft: '#eee2c5',
  night: '#1b2536', night2: '#25324a',
  red: '#e8412c', yellow: '#f6b500', sig: '#00b39b', green: '#36b24a', blue: '#2f7de1',
  white: '#fffbea', housing: '#2b2f33', off: '#454b51',
};

// ---------- 時間の道具 ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (t, s, d) => clamp((t - s) / d);
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = x => { const c1 = 1.9, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const win = (t, s, e, f = 0.35) => Math.min(prog(t, s, f), 1 - prog(t, e - f, f));
const mix = (c1, c2, k) => {
  const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const a = h(c1), b = h(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join('');
};

// ---------- 絵の道具 ----------
const g = (inner, { x = 0, y = 0, s = 1, o = 1, r = 0 } = {}) =>
  o <= 0.001 ? '' : `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${clamp(o)}">${inner}</g>`;
// pop: 出てくるときに少し大きくはねる
const pop = (inner, t, start, x, y, { d = 0.55, end = 1e9, s = 1 } = {}) => {
  const k = back(prog(t, start, d));
  const o = Math.min(prog(t, start, 0.2), 1 - prog(t, end - 0.3, 0.3));
  return g(inner, { x, y, s: s * Math.max(k, 0.001), o });
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, str, { size = 48, w = 700, fill = C.ink, anchor = 'middle', ls = 0.04, extra = '' } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}em" dominant-baseline="middle" ${extra}>${esc(str)}</text>`;

// 文字の幅を実際にはかる（中央ぞろえのため）
function tw(str, size, w = 700, ls = 0.04) {
  const m = document.getElementById('measure');
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('font-size', size); el.setAttribute('font-weight', w); el.setAttribute('letter-spacing', ls + 'em');
  el.textContent = str; m.appendChild(el);
  const v = el.getComputedTextLength(); m.removeChild(el);
  return v;
}
// 字間は最後の文字のあとにもつくので、その半分だけ右へずらすと見た目の中央になる
const ctext = (x, y, str, o = {}) => { const size = o.size || 48, ls = o.ls ?? 0.04; return text(x + size * ls / 2, y, str, { ...o, anchor: 'middle' }); };

const DEFS = `<defs>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#3d311f" flood-opacity="0.14"/></filter>
  <linearGradient id="greenblue" x1="0" x2="1"><stop offset="0" stop-color="${C.green}"/><stop offset="0.55" stop-color="${C.sig}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient>
  <radialGradient id="lampshine" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.75"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>`;

// 光るランプ
const lamp = (cx, cy, r, color, on = 1, { glow = true } = {}) => {
  const fill = on > 0 ? mix(C.off, color, on) : C.off;
  return (glow && on > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r * 1.25}" fill="${color}" opacity="${0.55 * on}" filter="url(#glow)"/>` : '') +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lampshine)" opacity="${0.35 + 0.65 * on}"/>`;
};

// 日本の横型信号（左から 青・黄・赤）。on = {g, y, r} それぞれ 0〜1
const signalH = (x, y, on, { s = 1, gColor = C.sig } = {}) => {
  const w = 420, h = 136, r = 48;
  const xs = [x + 70, x + 210, x + 350];
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${C.housing}"/>`;
  out += `<rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="20" fill="none" stroke="#3a3f44" stroke-width="3"/>`;
  out += lamp(xs[0], y + h / 2, r, gColor, on.g || 0);
  out += lamp(xs[1], y + h / 2, r, C.yellow, on.y || 0);
  out += lamp(xs[2], y + h / 2, r, C.red, on.r || 0);
  // ひさし
  xs.forEach(cx => { const cy = y + h / 2; out += `<path d="M ${cx - 52.6} ${cy - 19} A 56 56 0 0 1 ${cx + 52.6} ${cy - 19}" fill="none" stroke="#15181b" stroke-width="9" stroke-linecap="round"/>`; });
  return s === 1 ? out : `<g transform="translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})">${out}</g>`;
};

// 縦型の3色信号（歴史の絵用）
const signalV = (cx, cy, on, { r = 34, gColor = C.green } = {}) => {
  const w = r * 2 + 36, h = r * 6 + 70;
  let out = `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="18" fill="${C.housing}"/>`;
  out += lamp(cx, cy - r * 2 - 14, r, C.red, on.r || 0);
  out += lamp(cx, cy, r, C.yellow, on.y || 0);
  out += lamp(cx, cy + r * 2 + 14, r, gColor, on.g || 0);
  return out;
};

// 案内役のルーペ（オリジナル）
const mascot = (t, { blinkAt = [1.7, 4.9, 8.3, 12.1, 15.6, 19.4, 23.2] } = {}) => {
  const blink = blinkAt.some(b => t > b && t < b + 0.14);
  const bob = Math.sin(t * 2.4) * 6;
  const eyeH = blink ? 2 : 13;
  return `<g transform="translate(0 ${bob})">
    <rect x="44" y="58" width="26" height="110" rx="13" fill="${C.ochre}" transform="rotate(-38 57 58)"/>
    <circle cx="0" cy="0" r="86" fill="#e7f3f6" stroke="${C.blueUi}" stroke-width="16"/>
    <path d="M -46 -38 A 60 60 0 0 1 -6 -62" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
    <ellipse cx="-26" cy="-4" rx="9" ry="${eyeH}" fill="${C.ink}"/>
    <ellipse cx="26" cy="-4" rx="9" ry="${eyeH}" fill="${C.ink}"/>
    <path d="M -18 26 Q 0 42 18 26" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="-50" cy="20" r="11" fill="#f1b8a8" opacity="0.8"/>
    <circle cx="50" cy="20" r="11" fill="#f1b8a8" opacity="0.8"/>
  </g>`;
};

const bubble = (w, h, str, { size = 44, tail = 'left', fill = '#fff', color = C.ink } = {}) => {
  const tl = tail === 'left' ? `M ${-w / 2 + 40} ${h / 2 - 4} L ${-w / 2 + 6} ${h / 2 + 40} L ${-w / 2 + 92} ${h / 2 - 4} Z`
    : `M ${w / 2 - 40} ${h / 2 - 4} L ${w / 2 - 6} ${h / 2 + 40} L ${w / 2 - 92} ${h / 2 - 4} Z`;
  return `<g filter="url(#shadow)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="${fill}"/><path d="${tl}" fill="${fill}"/></g>` +
    text(0, 2, str, { size, fill: color });
};

const badge = (str, { fill = C.ink, color = '#fff', size = 40, pad = 34 } = {}) => {
  const w = tw(str, size, 700, 0.04) + pad * 2;
  return `<rect x="${-w / 2}" y="${-size * 0.85}" width="${w}" height="${size * 1.7}" rx="${size * 0.85}" fill="${fill}"/>` + ctext(0, 2, str, { size, fill: color });
};

const card = (w, h, { fill = '#fff' } = {}) =>
  `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="28" fill="${fill}" filter="url(#shadow)"/>`;

const stars = (seed = 7, n = 70) => {
  let s = seed, out = '';
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) out += `<circle cx="${rnd() * 1920}" cy="${rnd() * 560}" r="${1.5 + rnd() * 2.5}" fill="#fff" opacity="${0.25 + rnd() * 0.5}"/>`;
  return out;
};

// 色の玉と名前（色見本）
const chip = (color, label, sub, { r = 64, on = 1, labelColor = C.ink, subColor = C.muted } = {}) =>
  lamp(0, 0, r, color, on) +
  text(0, r + 58, label, { size: 50, w: 900, fill: labelColor }) +
  (sub ? text(0, r + 116, sub, { size: 34, w: 500, fill: subColor }) : '');

// 汽車（オリジナルの単純な形）
const train = () => `
  <rect x="-260" y="-120" width="300" height="130" rx="34" fill="#11161f"/>
  <rect x="40" y="-200" width="170" height="210" rx="18" fill="#11161f"/>
  <rect x="70" y="-176" width="110" height="74" rx="10" fill="#f2c96b" opacity="0.85"/>
  <rect x="-200" y="-200" width="56" height="86" rx="10" fill="#11161f"/>
  <rect x="-216" y="-212" width="88" height="22" rx="8" fill="#11161f"/>
  <circle cx="-280" cy="-58" r="26" fill="#fff6c8"/>
  <circle cx="-280" cy="-58" r="60" fill="#fff6c8" opacity="0.35" filter="url(#glow)"/>
  ${[-190, -80, 30, 150].map(cx => `<circle cx="${cx}" cy="34" r="46" fill="#0b0f15" stroke="#3b4658" stroke-width="8"/>`).join('')}
  <rect x="-290" y="8" width="520" height="14" fill="#0b0f15"/>`;

const smoke = t => [0, 1, 2, 3].map(i => {
  const k = ((t * 0.45 + i * 0.25) % 1);
  return `<circle cx="${-172 + k * 160}" cy="${-230 - k * 170}" r="${24 + k * 50}" fill="#c9d2e0" opacity="${0.32 * (1 - k)}"/>`;
}).join('');

// 鉄道の信号柱（ランプ1つ）
const railLamp = (color, on) => `
  <rect x="-12" y="0" width="24" height="430" fill="#0f141c"/>
  <rect x="-70" y="-150" width="140" height="170" rx="22" fill="#0f141c"/>
  <path d="M -54 -150 L -54 -178 L 54 -178 L 54 -150 Z" fill="#0f141c"/>
  ${lamp(0, -66, 46, color, on)}`;

// 背景の街
const city = (t, lightStart, lightEnd, seed = 3) => {
  let s = seed, out = '';
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const bs = [];
  let x = -20;
  while (x < 1940) { const w = 120 + rnd() * 120, h = 220 + rnd() * 300; bs.push([x, w, h]); x += w + 10; }
  let wi = 0;
  bs.forEach(([bx, w, h]) => {
    out += `<rect x="${bx}" y="${880 - h}" width="${w}" height="${h + 20}" fill="#151d2b"/>`;
    for (let yy = 880 - h + 30; yy < 840; yy += 54) for (let xx = bx + 20; xx < bx + w - 30; xx += 44) {
      const at = lerp(lightStart, lightEnd, (wi * 0.618) % 1); wi++;
      const k = prog(t, at, 0.3);
      if (k > 0) out += `<rect x="${xx}" y="${yy}" width="22" height="28" rx="3" fill="#fff4d6" opacity="${0.92 * k}"/>`;
    }
  });
  return out;
};
const gasLamp = (x, on) => `<rect x="${x - 6}" y="660" width="12" height="220" fill="#0e131d"/>
  <circle cx="${x}" cy="652" r="${22}" fill="#fff4d6" opacity="${on}"/>
  <circle cx="${x}" cy="652" r="60" fill="#fff4d6" opacity="${0.45 * on}" filter="url(#glow)"/>`;

const topBadge = (night = false) => {
  const str = 'みのまわり図鑑 ｜ しんごう', size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
  return `<g transform="translate(70 70)"><rect x="0" y="-34" width="${w}" height="68" rx="34" fill="${night ? 'rgba(255,250,240,0.14)' : C.accentSoft}"/>
   ${ctext(w / 2, 2, str, { size, w: 700, fill: night ? '#f4efe2' : C.accent, ls })}</g>`;
};

// ---------- セリフ（timeline.js の新しい時刻で判定） ----------
let NOW = { i: 0, t: 0 };
function lineOf(who, hold = 0) {
  const sc = window.TL && TL.scenes[NOW.i]; if (!sc) return null;
  return sc.lines.find(l => l.who === who && NOW.t >= l.start - 0.1 && NOW.t < l.end + hold) || null;
}
const talking = who => { const L = lineOf(who); return L && NOW.t < L.end ? 1 : 0; };
function sayBubble(who, x, y, { tail = 'left', size = 46, fill = '#fff', color = C.ink } = {}) {
  const L = lineOf(who, 0.7); if (!L) return '';
  const textMap = { 'S_00.wav': 'みどりっぽい…？', 'S_01.wav': 'なんで？', 'S_02.wav': 'そうだったんだ！', 'S_03.wav': 'またね！', 'B_00.wav': 'あ、かわった！', 'B_01.wav': 'またねー！', 'K_00.wav': 'よーく みてね' };
  const str = textMap[L.file] || '';
  const k = back(clamp((NOW.t - L.start + 0.1) / 0.35));
  const o = Math.min(clamp((NOW.t - L.start + 0.1) / 0.15), clamp((L.end + 0.7 - NOW.t) / 0.25));
  const w = tw(str, size, 700, 0.04) + 70;
  return g(bubble(w, size * 2.3, str, { size, tail, fill, color }), { x, y, s: Math.max(k, 0.001), o });
}
const lensIcon = () => `<rect x="44" y="58" width="26" height="110" rx="13" fill="${C.ochre}" transform="rotate(-38 57 58)"/>
  <circle cx="0" cy="0" r="86" fill="#e7f3f6" fill-opacity="0.85" stroke="${C.blueUi}" stroke-width="16"/>
  <path d="M -46 -38 A 60 60 0 0 1 -6 -62" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>`;

// ---------- 場面 ----------
// 各場面: dur, night(字幕の色), caps: [開始, 終了, 文], draw(t) → SVG
const SCENES = [];

// 0. オープニング（サウンドロゴに合わせる：み・の・ま・わ・り → 図鑑）
const NOTE = [0.5, 0.65, 0.8, 0.95, 1.1], ZUKAN = 1.35;
const icons = {
  signal: `<rect x="-58" y="-22" width="116" height="44" rx="12" fill="${C.housing}"/>${lamp(-34, 0, 13, C.sig, 1, { glow: false })}${lamp(0, 0, 13, C.off, 0, { glow: false })}${lamp(34, 0, 13, C.off, 0, { glow: false })}`,
  pencil: `<g transform="rotate(-35)"><rect x="-60" y="-14" width="96" height="28" fill="${C.yellow}"/><rect x="-74" y="-14" width="16" height="28" rx="4" fill="#e79aa0"/><path d="M 36 -14 L 66 0 L 36 14 Z" fill="#f1d7b0"/><path d="M 56 -5 L 66 0 L 56 5 Z" fill="${C.ink}"/></g>`,
  ant: `<circle cx="-34" cy="0" r="14" fill="${C.ink}"/><circle cx="-6" cy="2" r="11" fill="${C.ink}"/><ellipse cx="28" cy="4" rx="22" ry="16" fill="${C.ink}"/><path d="M -40 -12 L -52 -32 M -30 -12 L -24 -34 M -6 10 L -18 28 M -6 10 L 6 28 M 20 16 L 14 32 M 30 16 L 38 32" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`,
  bottle: `<rect x="-14" y="-62" width="28" height="16" rx="4" fill="${C.redUi}"/><path d="M -12 -46 L 12 -46 L 30 -14 L 30 52 Q 30 62 20 62 L -20 62 Q -30 62 -30 52 L -30 -14 Z" fill="#cfe7ef"/><rect x="-30" y="0" width="60" height="26" fill="${C.blueUi}" opacity="0.7"/>`,
  cup: `<path d="M -40 -40 L 40 -40 L 30 44 L -30 44 Z" fill="#f4c9a0"/><path d="M 38 -18 Q 66 -14 58 14 Q 52 30 34 26" fill="none" stroke="#f4c9a0" stroke-width="10"/><rect x="-40" y="-40" width="80" height="12" fill="#e3ab78"/>`,
  moon: `<path d="M 20 -48 A 50 50 0 1 0 20 48 A 38 38 0 1 1 20 -48 Z" fill="${C.yellow}"/>`,
};
SCENES.push({
  id: 'opening', dur: 4.5,
  caps: [],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // 背景にうすい丸が広がる
    const bg = eo(prog(t, 0.0, 1.2));
    out += `<circle cx="960" cy="540" r="${1150 * bg}" fill="${C.accentSoft}"/>`;
    out += `<circle cx="960" cy="540" r="${1150 * eo(prog(t, 0.25, 1.1))}" fill="${C.paper}"/>`;
    // まわりのもの
    const ring = [['signal', 470, 260], ['pencil', 1450, 250], ['ant', 400, 800], ['bottle', 1500, 800], ['cup', 760, 860], ['moon', 1190, 190]];
    ring.forEach(([k, x, y], i) => {
      const st = ZUKAN + 0.05 + i * 0.07;
      out += pop(g(icons[k], { r: Math.sin(t * 2 + i) * 6 }), t, st, x, y + Math.sin(t * 2.2 + i) * 8, { s: 1.15 });
    });
    // み・の・ま・わ・り
    const chars = ['み', 'の', 'ま', 'わ', 'り'], cols = [C.accent, C.blueUi, C.redUi, C.ochre, C.accent];
    const x0 = 960 - 525 + 75;
    chars.forEach((ch, i) => {
      out += pop(text(0, 0, ch, { size: 150, w: 900, fill: cols[i], ls: 0 }), t, NOTE[i], x0 + i * 150, 520 - (1 - eo(prog(t, NOTE[i], 0.3))) * 60, { d: 0.45 });
    });
    // 図鑑：上から落ちてきて着地
    const zk = prog(t, ZUKAN, 0.5);
    if (zk > 0) {
      const sq = zk < 1 ? 1 + 0.18 * Math.sin(Math.PI * zk) * (zk > 0.5 ? 1 : 0) : 1;
      out += g(text(0, 0, '図鑑', { size: 168, w: 900, fill: C.ink, ls: 0 }), { x: x0 + 5 * 150 + 95, y: lerp(260, 520, eo(zk)), s: sq, o: prog(t, ZUKAN, 0.1) });
      // きらきら
      const sp = prog(t, ZUKAN + 0.35, 0.7);
      if (sp > 0 && sp < 1) for (let k = 0; k < 10; k++) {
        const a = k / 10 * Math.PI * 2, r = 150 + 140 * eo(sp);
        out += `<circle cx="${x0 + 845 + Math.cos(a) * r}" cy="${520 + Math.sin(a) * r * 0.7}" r="${9 * (1 - sp)}" fill="${[C.yellow, C.sig, C.red][k % 3]}"/>`;
      }
    }
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 46, w: 700, fill: C.muted }), { x: 960, y: 690, o: prog(t, 1.9, 0.5) });
    // ルーペ：文字が出るのにあわせてのぞきこみ、最後は右上へ
    const ci = clamp(Math.floor((t - 0.45) / 0.15), 0, 5);
    const follow = t < 0.45 ? -200 : t < 1.4 ? x0 + Math.min(ci, 4) * 150 + 30 * prog(t, 0.45 + ci * 0.15, 0.15) : x0 + 4 * 150;
    const fin = eio(prog(t, 1.5, 0.7));
    const mx = lerp(follow, 1630, fin), my = lerp(330, 470, fin);
    const wink = t > 2.6 && t < 2.85;
    const ms = lensIcon();
    out += g(ms, { x: mx, y: my, s: lerp(0.7, 0.85, fin), r: lerp(-12, 0, fin), o: prog(t, 0.2, 0.2) });
    return out;
  },
});

// 1. つかみ：この光、ほんとうに「青」？
SCENES.push({
  id: 'hook', dur: 16,
  caps: [[0.6, 3.0, '赤信号。止まって待とう。'], [3.3, 5.6, 'あ、変わった！ 青信号だ。'], [5.9, 8.4, '……でも、よーく見て。'], [8.6, 12.3, 'この光、ほんとうに「青」？ 緑に近くない？']],
  draw(t) {
    const gOn = prog(t, 3.0, 0.12), rOn = 1 - prog(t, 2.9, 0.12);
    const k = eio(prog(t, 5.6, 1.8));
    const cx = lerp(960, 764, k), cy = lerp(540, 245, k), s = lerp(1, 2.0, k), ty = lerp(540, 330, k);
    const scene = `
      <rect width="1920" height="1080" fill="#eef3ee"/>
      <rect x="0" y="560" width="1920" height="520" fill="#d9d4c7"/>
      ${[[120, 300, 260], [420, 220, 340], [1260, 260, 300], [1560, 340, 230]].map(([x, w, h]) => `<rect x="${x}" y="${560 - h}" width="${w}" height="${h}" rx="10" fill="#dfe6df"/>`).join('')}
      <rect x="0" y="650" width="1920" height="300" fill="#8e9295"/>
      ${Array.from({ length: 11 }, (_, i) => `<rect x="${330 + i * 116}" y="676" width="64" height="248" fill="#f3f1ea"/>`).join('')}
      <rect x="0" y="640" width="1920" height="14" fill="#c9c3b5"/>
      <rect x="1290" y="150" width="30" height="510" fill="#8a9196"/>
      <rect x="1250" y="230" width="70" height="22" fill="#8a9196"/>
      ${signalH(666, 150, { g: gOn, r: rOn }, { s: 1.4 })}`;
    let out = `<g transform="translate(960 ${ty}) scale(${s}) translate(${-cx} ${-cy})">${scene}</g>`;
    // 色見本
    const cardO = win(t, 8.4, 12.6, 0.4);
    if (cardO > 0) {
      out += g(card(1240, 330) +
        g(chip(C.green, 'みどり', null, { r: 66 }), { x: -400, y: -50 }) +
        g(chip(C.sig, 'しんごうの ひかり', null, { r: 66 }), { x: 0, y: -50 }) +
        g(chip(C.blue, 'あお', null, { r: 66 }), { x: 400, y: -50 }),
        { x: 960, y: 690 - (1 - eo(prog(t, 8.4, 0.5))) * 40, o: cardO });
    }
    const kidsO = Math.min(prog(t, 0.2, 0.4), 1 - prog(t, 5.6, 0.6)) + (t > 9.6 && t < 12.4 ? Math.min(prog(t, 9.6, 0.4), 1 - prog(t, 12.0, 0.4)) : 0);
    if (kidsO > 0.001) {
      const bTalk = talking('B'), sTalk = talking('S');
      out += g(`<g transform="translate(1620 1062) scale(0.56)">${sister(NOW.t, { pose: sTalk ? 'think' : 'stand', eyes: t > 3 ? 'wide' : 'open', mouth: 'smile', talk: sTalk, look: [-6, -6] })}</g>` +
        `<g transform="translate(1790 1062) scale(0.56)">${brother(NOW.t + 1, { pose: t > 3.0 ? 'point' : 'stand', eyes: t > 3 ? 'wide' : 'open', mouth: t > 3 ? 'open' : 'smile', talk: bTalk, look: [-6, -6], hop: bTalk ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, { o: kidsO });
      out += g(sayBubble('B', 1690, 760, { tail: 'right' }) + sayBubble('S', 1335, 905, { tail: 'right' }), { o: Math.min(1, kidsO) });
    }
    // 題名
    const tk = prog(t, 12.4, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, 12.7, 960, 280);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.green}">緑</tspan>なのに、</text>`, { x: 960, y: 470, o: prog(t, 13.0, 0.4), s: lerp(0.94, 1, eo(prog(t, 13.0, 0.6))) });
      out += g(`<text x="0" y="0" font-size="132" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして「<tspan fill="${C.blue}">青</tspan>信号」？</text>`, { x: 960, y: 650, o: prog(t, 13.5, 0.4), s: lerp(0.94, 1, eo(prog(t, 13.5, 0.6))) });
      out += pop(signalH(0, 0, { g: 1 }, {}), t, 14.2, 960 - 147, 820, { s: 0.7 });
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess', dur: 10,
  caps: [[0.4, 4.8, 'どうしてだと思う？ 親子で予想してみよう。'], [5.0, 9.6, '答えにたどりつくには、ちょっと昔にさかのぼります。']],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと思う？', { size: 84, w: 900 }), t, 0.3, 960, 210);
    const opts = [['①', 'だれかが まちがえた'], ['②', 'むかしは 緑も「あお」と よんだ'], ['③', 'ほんとうは 青い 光']];
    const reading = lineOf('O');
    opts.forEach(([n, s], i) => {
      const on = reading && reading.file === `G_0${i + 1}.wav`;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.redUi, C.accent, C.blueUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 54, w: 700, anchor: 'start' }), t, 1.0 + i * 0.6, 900, 390 + i * 168);
    });
    // カウントダウン
    out += pop(`<g transform="scale(0.72)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', talk: talking('S'), look: [-5, -7] })}</g>`, t, 0.0, 1680, 900, { d: 0.4 });
    out += sayBubble('S', 1520, 470, { tail: 'right', size: 52 });
    [3, 2, 1].forEach((n, i) => {
      const st = 5.2 + i * 1.0;
      const o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1500, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 鉄道の色（1841年）
SCENES.push({
  id: 'rail1841', dur: 26, night: true,
  caps: [[0.5, 5.0, '信号の色は、道路より先に、鉄道で使われていました。'], [5.2, 10.2, '1841年、イギリスの鉄道の人たちが、夜の合図の色を決めます。'],
    [10.4, 18.8, '白は「進め」。赤は「止まれ」。そして緑は「注意」。'], [19.0, 25.6, 'そう。はじめは白が「進め」で、緑は「注意」だったんです。']],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + stars() + topBadge(true);
    out += `<rect x="0" y="560" width="1920" height="520" fill="#141c29"/>`;
    // 線路
    out += `<rect x="0" y="548" width="1920" height="10" fill="#4a566a"/><rect x="0" y="576" width="1920" height="10" fill="#4a566a"/>`;
    for (let x = -40; x < 1960; x += 70) out += `<rect x="${x}" y="540" width="26" height="56" rx="4" fill="#2c3646"/>`;
    // 汽車：左から入ってきて止まる
    const tx = lerp(-400, 470, eo(prog(t, 0, 5.5)));
    out += `<g transform="translate(${tx} 512) scale(-0.9 0.9)">${smoke(t) + train()}</g>`;  // 前（ライト）を進む向きに
    // 鉄道の信号
    const col = t < 13 ? C.white : t < 15.5 ? C.red : t < 19 ? C.green : C.white;
    const on = t < 10.4 ? 0.15 : 1;
    out += g(railLamp(col, on), { x: 1500, y: 200 });
    out += pop(badge('1841年 イギリス', { fill: '#f4efe2', color: C.night, size: 42 }), t, 5.3, 960, 200);
    // 色見本
    const items = [[C.white, 'しろ', 'すすめ（安全）', 10.5], [C.red, 'あか', 'とまれ（危険）', 13.0], [C.green, 'みどり', 'ちゅうい', 15.5]];
    items.forEach(([c, l, sub, st], i) => {
      out += pop(chip(c, l, sub, { r: 50, labelColor: '#f4efe2', subColor: '#c9d2e0' }), t, st, 560 + i * 400, 700, { s: 0.92 });
    });
    // 強調の輪
    const ring = prog(t, 19.2, 0.5);
    if (ring > 0) out += `<circle cx="560" cy="700" r="${lerp(120, 78, eo(ring))}" fill="none" stroke="${C.yellow}" stroke-width="8" opacity="${ring}"/>`;
    return out;
  },
});

// 4. 白の困りごと
SCENES.push({
  id: 'white', dur: 30, night: true,
  caps: [[0.5, 6.0, 'でも、白には困ったところがありました。'], [6.2, 13.6, '赤いガラスが割れると、中のランプの白い光がそのまま見えて、\n「進め」に見えてしまうのです。'],
    [14.4, 20.8, 'それに町には、\nガス灯や電灯の白い明かりが、どんどん増えていきました。'], [21.0, 25.6, '白い合図は、まわりの明かりにまぎれてしまいます。'], [25.8, 29.6, 'そこで、「進め」は緑に変わりました。']],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + stars(11) + topBadge(true);
    // A: 割れる赤いガラス
    const aO = 1 - prog(t, 13.6, 0.8);
    if (aO > 0) {
      let a = '';
      const crack = prog(t, 6.6, 0.5), fall = prog(t, 8.2, 1.4);
      a += `<rect x="-200" y="-230" width="400" height="460" rx="40" fill="#0f141c"/>`;
      a += `<rect x="-14" y="230" width="28" height="300" fill="#0f141c"/>`;
      // 中の白いランプ（割れると見える）
      a += lamp(0, 0, 120, C.white, fall > 0 ? eo(fall) : 0.02);
      // 赤いガラス（かけらに分かれて落ちる）
      const shards = [[-1, -1, -30], [1, -1, 24], [-1, 1, 40], [1, 1, -36]];
      if (fall < 1) {
        shards.forEach(([sx, sy, rot], i) => {
          const f = eio(clamp(fall * 1.2 - i * 0.05));
          const path = `M 0 0 L ${sx * 125} 0 A 125 125 0 0 ${sx * sy > 0 ? 1 : 0} 0 ${sy * 125} Z`;
          a += `<g transform="translate(${sx * f * 80} ${f * 420}) rotate(${rot * f})" opacity="${1 - f}">
            <path d="${path}" fill="${C.red}"/><path d="${path}" fill="url(#lampshine)"/></g>`;
        });
        if (fall === 0) a += `<circle r="140" fill="${C.red}" opacity="0.45" filter="url(#glow)"/>`;
        if (crack > 0 && fall === 0) a += `<path d="M -10 -110 L 8 -40 L -26 6 L 14 46 L -4 112 M 8 -40 L 70 -64 M -26 6 L -96 30 M 14 46 L 84 70" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="${crack}"/>`;
      }
      out += g(a, { x: 760, y: 430, o: aO });
      out += pop(bubble(330, 120, 'すすめ？', { size: 54 }), t, 10.0, 1250, 330, { end: 13.9 });
    }
    // B: 白い明かりの町
    const bO = prog(t, 13.8, 0.8);
    if (bO > 0) {
      let b = city(t, 14.6, 20.5) + [180, 640, 1300, 1760].map((x, i) => gasLamp(x, prog(t, 15 + i * 1.1, 0.4))).join('');
      const toGreen = prog(t, 26.0, 0.25);
      b += g(railLamp(mix(C.white, C.green, toGreen), 1), { x: 960, y: 420 });
      const q = win(t, 21.2, 25.9, 0.3);
      if (q > 0) b += g(text(0, 0, '？', { size: 120, w: 900, fill: C.yellow }), { x: 1080, y: 280, o: q, s: 1 + 0.06 * Math.sin(t * 6) });
      b += pop(bubble(300, 110, 'すすめ！', { size: 52, fill: C.green, color: '#fff' }), t, 26.4, 1180, 250);
      b += pop(badge('1890年代 イギリス', { fill: '#f4efe2', color: C.night, size: 38 }), t, 26.2, 620, 230);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 5. 黄色
SCENES.push({
  id: 'yellow', dur: 26,
  caps: [[0.5, 6.0, '空いた「注意」には、新しい色が必要です。'], [6.2, 12.8, '選ばれたのは黄色。\n白い明かりよりずっと濃くて、赤とまちがえるほど暗くない色。'],
    [13.0, 19.6, '色の地図の上で、赤と緑は、いちばん遠くはなれた2つの色。'], [19.8, 25.6, '黄色は、そのちょうど間にあります。']],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const m = eio(prog(t, 13.2, 1.6));
    const r = lerp(92, 60, m), y = lerp(400, 470, m);
    const xs = [lerp(560, 1560, m), 960, lerp(1360, 360, m)];
    const lab = 1 - prog(t, 12.8, 0.4);
    // 線（色の地図）
    if (m > 0) {
      out += `<rect x="360" y="${y - 10}" width="${1200 * m}" height="20" rx="10" fill="${C.line}"/>`;
      const ao = prog(t, 14.6, 0.5);
      out += g(`<path d="M 380 0 L 1540 0" stroke="${C.muted}" stroke-width="5"/><path d="M 380 0 l 26 -16 M 380 0 l 26 16 M 1540 0 l -26 -16 M 1540 0 l -26 16" stroke="${C.muted}" stroke-width="5" stroke-linecap="round"/>` +
        text(960, -50, 'いちばん はなれた 2つの色', { size: 50, w: 900, fill: C.ink }), { x: 0, y: 290, o: ao });
      const mo = prog(t, 20.0, 0.5);
      out += g(`<path d="M 0 80 L 0 112 M -14 94 L 0 80 L 14 94" stroke="${C.ochre}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + text(0, 160, 'ちょうど まんなか', { size: 50, w: 900, fill: C.ochre }), { x: 960, y, o: mo });
    }
    // 緑・黄・赤の玉
    out += g(lamp(0, 0, r, C.green, 1) + g(text(0, r + 60, 'すすめ', { size: 46, w: 900 }), { o: lab }), { x: xs[0], y });
    out += g(lamp(0, 0, r, C.red, 1) + g(text(0, r + 60, 'とまれ', { size: 46, w: 900 }), { o: lab }), { x: xs[2], y });
    const yk = prog(t, 6.4, 0.5);
    out += g(`<circle r="${r}" fill="none" stroke="${C.muted}" stroke-width="6" stroke-dasharray="18 16"/>` + text(0, 4, '？', { size: 90, w: 900, fill: C.muted }), { x: 960, y, o: 1 - yk });
    out += g(lamp(0, 0, r, C.yellow, 1), { x: 960, y, s: Math.max(back(yk), 0.001), o: yk });
    out += g(text(0, r + 60, 'ちゅうい', { size: 46, w: 900 }), { x: 960, y, o: lab });
    out += pop(badge('1899年 アメリカの鉄道', { fill: C.ochre, size: 38 }), t, 6.8, 960, 190, { end: 12.9 });
    // 黄色のわけ（白と赤のあいだ）
    const why = win(t, 8.6, 12.9, 0.4);
    if (why > 0) {
      out += g(card(900, 190) + lamp(-290, -20, 38, C.white, 1, { glow: false }) + `<circle cx="-290" cy="-20" r="38" fill="none" stroke="#d6cdb8" stroke-width="3"/>` + text(-290, 52, '白より こい', { size: 34, w: 700, fill: C.muted }) +
        lamp(0, -20, 46, C.yellow, 1, { glow: false }) + text(0, 52, 'きいろ', { size: 34, w: 900, fill: C.ochre }) + lamp(290, -20, 38, C.red, 1, { glow: false }) + text(290, 52, '赤より あかるい', { size: 34, w: 700, fill: C.muted }), { x: 960, y: 730, o: why });
    }
    return out;
  },
});

// 6. 道路へ
SCENES.push({
  id: 'road', dur: 26,
  caps: [[0.5, 6.8, 'この色の使い方が、やがて道路にやってきます。'], [7.0, 12.8, '1868年、ロンドンに最初の道路の信号。\n夜はガスの明かりの、赤と緑で合図しました。'],
    [13.0, 18.8, '1920年、アメリカのデトロイトで、\n赤・黄・緑の3色の信号が使われはじめます。'], [19.0, 25.6, 'そして1930年。東京・日比谷に、\n日本で初めての電気の信号機がつきました。']],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const ax = eo(prog(t, 0.6, 1.4));
    out += `<rect x="260" y="634" width="${1400 * ax}" height="12" rx="6" fill="${C.line}"/>`;
    const stops = [[420, '1868年', 'ロンドン', 7.0], [960, '1920年', 'デトロイト', 13.0], [1500, '1930年', '東京・日比谷', 19.0]];
    stops.forEach(([x, yr, place, st], i) => {
      const k = prog(t, st, 0.4);
      out += g(`<circle r="22" fill="${[C.redUi, C.ochre, C.accent][i]}"/>`, { x, y: 640, s: Math.max(back(k), 0.001), o: k });
      out += g(text(0, 0, yr, { size: 54, w: 900 }) + text(0, 58, place, { size: 38, w: 700, fill: C.muted }), { x, y: 712, o: k });
      const active = i === 0 ? t < 13 : i === 1 ? t >= 13 && t < 19 : t >= 19;
      out += g(`<rect x="-220" y="-230" width="440" height="430" rx="30" fill="${active ? '#fff' : C.paperSoft}" filter="url(#shadow)"/>`, { x, y: 350, o: k, s: lerp(0.9, 1, eo(k)) });
    });
    // 1868 ロンドン：腕木とガスの明かり
    const k1 = prog(t, 7.2, 0.5);
    if (k1 > 0) {
      const night = (Math.floor(t * 0.9) % 2) === 0;
      out += g(`<rect x="-12" y="-170" width="24" height="270" fill="#5b4a3a"/>
        <rect x="12" y="-150" width="150" height="26" rx="6" fill="${C.redUi}" transform="rotate(${t < 10 ? 0 : 0} 12 -137)"/>
        <rect x="-44" y="-120" width="88" height="110" rx="14" fill="${C.housing}"/>
        ${lamp(0, -65, 30, night ? C.red : C.green, 1)}
        <path d="M -16 -175 Q 0 -215 16 -175 Q 4 -190 0 -205 Q -4 -190 -16 -175 Z" fill="${C.yellow}" opacity="0.9"/>` +
        text(0, 150, 'ガスの 明かり', { size: 32, w: 700, fill: C.muted }), { x: 420, y: 350, o: k1 });
    }
    const k2 = prog(t, 13.2, 0.5);
    if (k2 > 0) {
      const ph = Math.floor((t - 13.2) / 1.1) % 3;
      out += g(signalV(0, -30, { g: ph === 0 ? 1 : 0, y: ph === 1 ? 1 : 0, r: ph === 2 ? 1 : 0 }, { r: 40 }) + text(0, 150, '赤・黄・緑の 3色', { size: 32, w: 700, fill: C.muted }), { x: 960, y: 350, o: k2 });
    }
    const k3 = prog(t, 19.2, 0.5);
    if (k3 > 0) {
      out += g(signalV(0, -30, { g: 1 }, { r: 40 }) + text(0, 150, '日本初の 電気信号機', { size: 32, w: 700, fill: C.muted }), { x: 1500, y: 350, o: k3 });
    }
    return out;
  },
});

// 7. 「あお」
SCENES.push({
  id: 'ao', dur: 38,
  caps: [[0.5, 6.8, 'このとき新聞は、信号の色を「青・黄・赤」と伝えました。'], [7.0, 11.8, 'じっさいの光は、赤・黄・緑だったのに。'],
    [12.0, 17.8, '決まりの上でも、はじめは「緑信号」と書かれていました。'], [18.0, 25.6, 'でも日本語の「あお」は、\nもともと緑までふくむ、広い色の名前。'],
    [25.8, 30.8, '青菜、青虫、青りんご。どれも緑ですよね。'], [31.0, 37.6, '呼び名が広まり、1947年には決まりの上でも「青信号」に。']],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A 新聞 vs じっさい
    const aO = 1 - prog(t, 11.8, 0.5);
    if (aO > 0) {
      let a = '';
      const n = eo(prog(t, 0.4, 0.6));
      let lines = '';
      for (let i = 0; i < 9; i++) lines += `<rect x="${200 - i * 50}" y="-230" width="18" height="${i === 4 ? 0 : 400 - (i % 3) * 60}" rx="9" fill="#cdbf9f"/>`;
      a += g(`<rect x="-280" y="-300" width="560" height="600" rx="16" fill="#efe3c6" filter="url(#shadow)"/>` + lines +
        `<rect x="-62" y="-250" width="124" height="430" rx="18" fill="#fff8e6" stroke="${C.ochre}" stroke-width="6"/>` +
        `<text x="0" y="-35" font-size="64" font-weight="900" fill="${C.ink}" text-anchor="middle" style="writing-mode: vertical-rl" letter-spacing="0.1em">青・黄・赤</text>` +
        text(0, 350, '当時の 新聞', { size: 40, w: 900, fill: C.ochre }), { x: 560, y: 450, o: n, s: lerp(0.92, 1, n) });
      const k = prog(t, 7.0, 0.5);
      a += g(signalH(-210, -68, { g: 1, y: 1, r: 1 }) + text(0, 150, 'じっさいの 光', { size: 40, w: 900, fill: C.accent }) +
        text(-140, -130, '緑', { size: 46, w: 900, fill: C.sig }) + text(0, -130, '黄', { size: 46, w: 900, fill: C.ochre }) + text(140, -130, '赤', { size: 46, w: 900, fill: C.red }),
        { x: 1340, y: 450, o: k, s: lerp(0.9, 1, eo(k)) });
      a += pop(`<g transform="scale(0.68)">${sister(NOW.t, { pose: 'cheer', eyes: 'smile', mouth: 'open', talk: talking('S'), hop: talking('S') ? Math.abs(Math.sin(NOW.t * 8)) * 16 : 0 })}</g>`, t, 4.6, 1640, 960, { d: 0.45 });
      a += sayBubble('S', 1440, 560, { tail: 'right', size: 50 });
      out += g(a, { o: aO });
    }
    // B 緑信号
    const bO = win(t, 12.0, 18.0, 0.5);
    if (bO > 0) {
      out += g(card(760, 520) + text(0, -170, 'はじめの 決まり', { size: 46, w: 900, fill: C.muted }) +
        [0, 1, 2].map(i => `<rect x="-280" y="${-90 + i * 56}" width="${560 - i * 90}" height="18" rx="9" fill="${C.line}"/>`).join('') +
        g(`<rect x="-200" y="-70" width="400" height="140" rx="20" fill="none" stroke="${C.green}" stroke-width="10"/>` + text(0, 4, '緑信号', { size: 84, w: 900, fill: C.green }),
          { y: 150, s: Math.max(back(prog(t, 13.0, 0.5)), 0.001), r: -6, o: prog(t, 13.0, 0.2) }), { x: 960, y: 470, o: bO });
    }
    // C 「あお」は広い
    const cO = win(t, 17.9, 31.0, 0.5);
    if (cO > 0) {
      let c = '';
      c += pop(text(0, 0, '「あお」', { size: 130, w: 900, fill: C.sig }), t, 18.2, 960, 260);
      const arc = prog(t, 20.5, 1.0);
      c += g(`<rect x="-520" y="-34" width="1040" height="68" rx="34" fill="url(#greenblue)"/>` + text(-470, 92, 'みどり', { size: 38, w: 700, fill: C.muted }) + text(470, 92, 'あお', { size: 38, w: 700, fill: C.muted }) +
        `<rect x="-540" y="-58" width="1080" height="116" rx="58" fill="none" stroke="${C.ink}" stroke-width="6" stroke-dasharray="20 14"/>` + text(0, -100, 'ぜんぶ「あお」と よんでいた', { size: 40, w: 900 }),
        { x: 960, y: 520, o: arc, s: lerp(0.95, 1, eo(arc)) });
      const things = [
        ['青菜', `<path d="M 0 60 C -80 20 -90 -60 -20 -90 C 0 -40 0 0 0 60 Z" fill="#4c9a3a"/><path d="M 0 60 C 80 20 90 -60 20 -90 C 0 -40 0 0 0 60 Z" fill="#62b04a"/><path d="M 0 60 L 0 -40" stroke="#d9efc6" stroke-width="8"/>`],
        ['青虫', [0, 1, 2, 3, 4].map(i => `<circle cx="${-80 + i * 40}" cy="${10 + (i % 2) * -10}" r="${i === 4 ? 36 : 30}" fill="${i === 4 ? '#79c04f' : '#66b043'}"/>`).join('') + `<circle cx="92" cy="-6" r="6" fill="${C.ink}"/>`],
        ['青りんご', `<circle cx="-26" cy="10" r="64" fill="#9ccc3c"/><circle cx="26" cy="10" r="64" fill="#9ccc3c"/><path d="M 0 -50 Q 6 -80 0 -100" stroke="#6b4a2a" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M 4 -80 Q 40 -110 66 -80 Q 36 -66 4 -80 Z" fill="#4c9a3a"/>`],
      ];
      const aside = prog(t, 25.6, 0.6);
      things.forEach(([name, art], i) => {
        const st = 26.0 + i * 0.7;
        c += pop(g(art, { y: -40 }) + text(0, 100, name, { size: 50, w: 900 }), t, st, 560 + i * 400, 800);
      });
      out += g(`<g transform="translate(0 ${-110 * eio(aside)})">${c}</g>`, { o: cO });
    }
    // D 1947年 青信号
    const dO = prog(t, 30.8, 0.5);
    if (dO > 0) {
      out += g(card(760, 520) + text(0, -170, '決まりの 上でも', { size: 46, w: 900, fill: C.muted }) +
        [0, 1, 2].map(i => `<rect x="-280" y="${-90 + i * 56}" width="${560 - i * 90}" height="18" rx="9" fill="${C.line}"/>`).join('') +
        g(`<rect x="-200" y="-70" width="400" height="140" rx="20" fill="none" stroke="${C.blue}" stroke-width="10"/>` + text(0, 4, '青信号', { size: 84, w: 900, fill: C.blue }),
          { y: 150, s: Math.max(back(prog(t, 32.4, 0.5)), 0.001), r: -6, o: prog(t, 32.4, 0.2) }), { x: 960, y: 470, o: dO });
      out += pop(badge('1947年', { fill: C.blueUi, size: 44 }), t, 33.2, 1400, 250);
    }
    return out;
  },
});

// 8. 色のほうが動いた
SCENES.push({
  id: 'moved', dur: 26,
  caps: [[0.5, 5.8, 'おもしろいのは、ここからです。'], [6.0, 12.8, '名前に合わせて、こんどは光の色のほうが動きました。'],
    [13.0, 19.8, '1973年からの信号は、国際的な「緑」の範囲の中で、\nできるだけ青に近い色に。'], [20.0, 25.6, 'まちの青信号をよく見ると、\n青っぽいものから、黄色っぽい緑まであります。']],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const up = eio(prog(t, 19.8, 0.9));
    const by = lerp(470, 330, up);
    const barK = eo(prog(t, 0.6, 1.2));
    out += `<rect x="360" y="${by - 45}" width="${1200 * barK}" height="90" rx="45" fill="url(#greenblue)"/>`;
    out += g(text(400, by + 100, 'みどり', { size: 40, w: 700, fill: C.muted }) + text(1520, by + 100, 'あお', { size: 40, w: 700, fill: C.muted }), { o: barK * (1 - up) });
    // 国際的な「緑」の範囲
    const rk = prog(t, 13.4, 0.6);
    if (rk > 0) {
      out += g(`<rect x="350" y="${by - 66}" width="${820 * eo(rk)}" height="132" rx="30" fill="none" stroke="${C.ink}" stroke-width="6" stroke-dasharray="20 14"/>` +
        text(760, by + 112, '国際的な「緑」の 範囲', { size: 42, w: 900 }), { o: rk });
    }
    // 信号の光の玉（右へ動く）
    const mv = eio(prog(t, 14.6, 2.6));
    const lx = lerp(560, 1110, mv);
    const lc = mix(C.green, '#00a9a8', mv);
    const lo = prog(t, 6.2, 0.4);
    if (lo > 0) {
      out += g(`<path d="M 0 ${-70} L 0 ${-26}" stroke="${C.ink}" stroke-width="6"/>` + lamp(0, -140, 66, lc, 1) +
        text(0, -250, 'しんごうの ひかり', { size: 38, w: 900 }), { x: lx, y: by - 50, o: lo * (1 - up) });
      out += g(`<path d="M 0 0 L 70 0 M 52 -18 L 70 0 L 52 18" stroke="${C.ochre}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        { x: lx + 90, y: by - 190, o: win(t, 7.0, 16.8, 0.3) * (1 + 0 * Math.sin(t * 8)) });
    }
    out += pop(badge('1973年から', { fill: C.blueUi, size: 42 }), t, 13.2, 1560, 200, { end: 20.0 });
    // まちの青信号いろいろ
    if (t > 20.0) {
      const cols = ['#00a2b0', '#00ad97', '#1db474', '#5dbb3c'];
      cols.forEach((c, i) => {
        out += pop(signalH(0, 0, { g: 1 }, { gColor: c }), t, 20.4 + i * 0.5, 230 + i * 380, 540, { s: 0.78 });
      });
      out += g(text(0, 0, '青っぽい', { size: 40, w: 900, fill: C.blueUi }), { x: 400, y: 720, o: prog(t, 22.6, 0.4) });
      out += g(text(0, 0, '黄色っぽい 緑', { size: 40, w: 900, fill: '#5a8a2a' }), { x: 1530, y: 720, o: prog(t, 22.9, 0.4) });
      out += g(`<path d="M 560 720 L 1340 720" stroke="${C.muted}" stroke-width="5" stroke-dasharray="14 12"/>`, { o: prog(t, 22.8, 0.4) });
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look', dur: 24,
  caps: [[0.5, 7.6, '正解は②。緑までふくむ「あお」が、名前になったんだね。'],
    [8.2, 13.0, '次に信号を見たら、\n青信号が緑と青のどちらに近いか、言い合ってみよう。'], [13.2, 18.2, 'いくつかの交差点でくらべると、色のちがいが見つかるかも。'], [18.4, 23.6, '歩道で立ち止まって、見るだけにしようね。']],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, 7.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-450, 2, 'むかしは 緑も「あお」と よんだ', { size: 60, w: 900, anchor: 'start' }), t, 0.4, 960, 460);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="70" fill="none" stroke="${C.red}" stroke-width="12"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 460, o: ring, s: Math.max(back(ring), 0.001) });
      const pills = [['新聞が「青」と書いた', C.blueUi], ['「あお」は緑までふくむ', C.accent], ['→「青信号」に', C.ochre]];
      pills.forEach(([str, col], i) => { a += pop(badge(str, { fill: col, size: 38 }), t, 2.6 + i * 0.8, [480, 1030, 1510][i], 680); });
      out += g(a, { o: aO });
    }
    const bO = prog(t, 7.9, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, 8.1, 520, 190);
      const items = ['青信号は、緑と青の どっちに近い？', 'いくつかの 交差点で くらべてみよう', '黄色は、赤と緑の あいだの色に 見える？'];
      items.forEach((s, i) => {
        const st = 8.6 + i * 1.6;
        b += pop(`<circle cx="0" cy="0" r="30" fill="${C.ochreSoft}"/>` + text(0, 2, i + 1, { size: 36, w: 900, fill: C.ochre }) + text(56, 2, s, { size: 50, w: 700, anchor: 'start' }), t, st, 200, 350 + i * 130);
      });
      b += g(text(200, 760, '※ 歩道で 立ち止まって、見るだけ', { size: 36, w: 700, fill: C.muted, anchor: 'start' }), { o: prog(t, 18.4, 0.5) });
      b += pop(signalH(0, 0, { g: 1 }), t, 9.0, 1300, 270, { s: 0.9 });
      b += pop(chameleon(NOW.t, { holdLens: true, talk: talking('K'), eyeL: talking('K') ? -20 : null, eyeR: talking('K') ? -20 : null }), t, 9.6, 1560, 840, { s: 0.95 });
      b += sayBubble('K', 1560, 520, { tail: 'right', size: 50 });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 10. おわり
SCENES.push({
  id: 'end', dur: 8,
  caps: [],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「しんごう」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    out += pop(`<g transform="scale(0.52)">${sister(NOW.t, { pose: 'wave', eyes: 'smile', mouth: 'open', talk: talking('S') })}</g>`, t, 0.8, 150, 1060, { d: 0.45 });
    out += pop(`<g transform="scale(0.52)">${brother(NOW.t + 1, { pose: 'cheer', eyes: 'smile', mouth: 'open', talk: talking('B'), hop: talking('B') ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, 1.0, 310, 1060, { d: 0.45 });
    out += pop(chameleon(NOW.t, { holdLens: true }), t, 1.2, 1660, 1040, { s: 0.7 });
    out += sayBubble('S', 150, 610, { size: 44 }) + sayBubble('B', 250, 730, { size: 44 });
    out += `<rect width="1920" height="1080" fill="#000" opacity="${prog(t, 7.0, 1.0)}"/>`;
    return out;
  },
});

// ---------- 描く ----------
const svg = document.getElementById('stage');
const capEl = document.querySelector('#cap span');
function warp(anchors, t) {
  for (let k = 1; k < anchors.length; k++) {
    const [n0, o0] = anchors[k - 1], [n1, o1] = anchors[k];
    if (t <= n1) return o0 + (o1 - o0) * clamp((t - n0) / (n1 - n0));
  }
  return anchors[anchors.length - 1][1];
}
function sceneDur(i) { return window.TL ? TL.scenes[i].dur : SCENES[i].dur; }
function show(i, tNew) {
  const sc = SCENES[i], tl = window.TL && TL.scenes[i];
  const D = sceneDur(i);
  NOW = { i, t: tNew };
  const t = tl ? warp(tl.anchors, tNew) : tNew;
  const edge = i === 0 ? 1 - prog(tNew, D - 0.3, 0.3) : i === SCENES.length - 1 ? prog(tNew, 0, 0.3) : Math.min(prog(tNew, 0, 0.3), 1 - prog(tNew, D - 0.3, 0.3));
  svg.innerHTML = DEFS + sc.draw(t) + (edge < 1 ? `<rect width="1920" height="1080" fill="${C.paper}" opacity="${1 - edge}"/>` : '');
  let cap = null;
  if (tl) {
    const L = tl.lines.find(l => l.who === 'N' && l.text && tNew >= l.start - 0.15 && tNew < l.end + 0.35);
    if (L) cap = [L.start - 0.15, L.end + 0.35, L.text];
  } else cap = sc.caps.find(([s0, e]) => t >= s0 && t < e);
  capEl.textContent = cap ? cap[2] : '';
  capEl.className = sc.night ? 'night' : '';
  capEl.style.opacity = cap ? String(win(tNew, cap[0], cap[1], 0.15)) : '0';
}
window.sceneDur = sceneDur;
window.SCENES = SCENES;
window.show = show;
window.TOTAL = SCENES.reduce((a, s, i) => a + sceneDur(i), 0);

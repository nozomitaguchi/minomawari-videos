// みのまわり図鑑 動画「鏡は、本当に左右を反対にする？」
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


const topBadge = (night = false) => {
  const str = 'みのまわり図鑑 ｜ かがみ', size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
  return `<g transform="translate(70 70)"><rect x="0" y="-34" width="${w}" height="68" rx="34" fill="${night ? 'rgba(255,250,240,0.14)' : 'rgba(255,250,240,0.82)'}"/>
   ${ctext(w / 2, 2, str, { size, w: 700, fill: night ? '#f4efe2' : C.accent, ls })}</g>`;
};

// ---------- 空の道具 ----------
const SKY = {
  dayTop: '#3f93dc', dayMid: '#86c2ef', dayBot: '#d6edfa',
  sunTop: '#36477e', sunMid: '#e9805a', sunBot: '#ffc46b',
};
const skyCols = k => [mix(SKY.dayTop, SKY.sunTop, k), mix(SKY.dayMid, SKY.sunMid, k), mix(SKY.dayBot, SKY.sunBot, k)];
function skyRect(id, k, { x = 0, y = 0, w = 1920, h = 1080, rx = 0 } = {}) {
  const [a, b, c] = skyCols(k);
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.62" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${id})"/>`;
}
// 太陽（k=0 昼の白っぽい黄色 → k=1 夕日のオレンジ）
const sunCol = k => mix('#fff3b8', '#ff7a32', k);
const sunDisc = (x, y, r, k = 0, { glow = 1 } = {}) =>
  `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${sunCol(k)}" opacity="${0.35 * glow}" filter="url(#glow)"/>` +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${sunCol(k)}"/>` +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#lampshine)" opacity="0.6"/>`;
const cloud = (x, y, s, col = '#fff', o = 0.95) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="120" ry="44" fill="${col}"/><circle cx="-46" cy="-24" r="46" fill="${col}"/><circle cx="20" cy="-40" r="58" fill="${col}"/><circle cx="72" cy="-14" r="38" fill="${col}"/></g>`;
const house = (x, y, s, wall = '#f4ead8', roof = '#c0624c') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-60" y="-80" width="120" height="80" fill="${wall}"/><path d="M -78 -76 L 0 -140 L 78 -76 Z" fill="${roof}"/><rect x="-16" y="-44" width="32" height="44" fill="${mix(roof, '#000', 0.25)}"/><rect x="26" y="-64" width="22" height="20" fill="#bfe0f2"/></g>`;
const tree = (x, y, s, col = '#3f8f4a') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="-60" width="18" height="60" fill="#7a5a3a"/><circle cx="0" cy="-92" r="52" fill="${col}"/><circle cx="-32" cy="-70" r="34" fill="${col}"/><circle cx="32" cy="-70" r="34" fill="${col}"/></g>`;
// 光のつぶ（色の玉）
const LIGHT = { red: '#ff4b3a', orange: '#ff9a2e', yellow: '#ffd23a', green: '#3cc35a', blue: '#2f86ff', violet: '#8a5cf0' };
const ballG = (x, y, col, r = 13) => `<circle cx="${x}" cy="${y}" r="${r * 2}" fill="${col}" opacity="0.35" filter="url(#soft)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.35}" fill="#fff" opacity="0.7"/>`;
// きまった乱数
const rnd = (i, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
// ばつ印
const cross = (x, y, s = 1, col = C.red) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M -60 -60 L 60 60 M 60 -60 L -60 60" stroke="${col}" stroke-width="22" stroke-linecap="round"/></g>`;
// 小さな目のアイコン
const eyeIcon = (s = 1) => `<g transform="scale(${s})"><path d="M -120 0 Q 0 -96 120 0 Q 0 96 -120 0 Z" fill="#fff" stroke="${C.ink}" stroke-width="10"/><circle r="46" fill="#6b4a2f"/><circle r="22" fill="${C.ink}"/><circle cx="-14" cy="-14" r="10" fill="#fff"/></g>`;
const lensIcon = () => `<rect x="44" y="58" width="26" height="110" rx="13" fill="${C.ochre}" transform="rotate(-38 57 58)"/>
  <circle cx="0" cy="0" r="86" fill="#e7f3f6" fill-opacity="0.85" stroke="${C.blueUi}" stroke-width="16"/>
  <path d="M -46 -38 A 60 60 0 0 1 -6 -62" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>`;

// ---------- セリフ（timeline.js の時刻） ----------
let NOW = { i: 0, t: 0 };
const SL = () => (window.TL ? TL.scenes[NOW.i].lines : []);
const cue = k => (SL()[k] ? SL()[k].start : 1e9);
const cueE = k => (SL()[k] ? SL()[k].end : 1e9);
function lineOf(who, hold = 0) { return SL().find(l => l.who === who && NOW.t >= l.start - 0.1 && NOW.t < l.end + hold) || null; }
const talking = who => { const L = lineOf(who); return L && NOW.t < L.end ? 1 : 0; };
// いま読んでいる行の番号（なければ -1）
const curLine = () => SL().findIndex(l => NOW.t >= l.start - 0.1 && NOW.t < l.end + 0.15);
function sayBubble(who, x, y, { tail = 'left', size = 46, fill = '#fff', color = C.ink } = {}) {
  const L = lineOf(who); if (!L) return '';
  const k = back(clamp((NOW.t - L.start + 0.1) / 0.35));
  const o = Math.min(clamp((NOW.t - L.start + 0.1) / 0.15), clamp((L.end - NOW.t) / 0.25));
  const w = tw(L.text, size, 700, 0.04) + 70;
  return g(bubble(w, size * 2.3, L.text, { size, tail, fill, color }), { x, y, s: Math.max(k, 0.001), o });
}
// 横に並べたチップ（幅をはかって間をそろえる）
function chipsRow(items, t, cx, y, { size = 38, gap = 36, start = 0, step = 0.6 } = {}) {
  const ws = items.map(([s]) => tw(s, size, 700, 0.04) + 68);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = cx - total / 2, out = '';
  items.forEach(([s, col], i) => { out += pop(badge(s, { fill: col, size }), t, start + i * step, x + ws[i] / 2, y); x += ws[i] + gap; });
  return out;
}

// ---------- 場面 ----------
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
// ---------- 鏡の道具 ----------
const MR = { glass: '#d9ecf3', glass2: '#bcdbe8', frame: '#b8946a', frameDark: '#8a6a44', ray: '#f6b500', rhand: '#e0533a', lhand: '#3a7fd0' };
// 鏡（前から見たもの）
const mirrorFront = (x, y, w, h, id = 'mg') => `<rect x="${x - w / 2 - 22}" y="${y - h / 2 - 22}" width="${w + 44}" height="${h + 44}" rx="26" fill="${MR.frame}"/>` +
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef7fb"/><stop offset="0.5" stop-color="${MR.glass}"/><stop offset="1" stop-color="${MR.glass2}"/></linearGradient>` +
  `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="12" fill="url(#${id})"/>` +
  `<path d="M ${x - w / 2 + 40} ${y - h / 2 + 30} L ${x - w / 2 + 120} ${y - h / 2 + 30} L ${x - w / 2 + 40} ${y - h / 2 + 140} Z" fill="#fff" opacity="0.5"/>`;
// うしろ姿のおねえちゃん（右手＝画面の右）
function backKid(t, { raise = 0, s = 1 } = {}) {
  const arm = (x, ang) => `<g transform="translate(${x} -248) rotate(${ang})"><rect x="-13" y="-6" width="26" height="92" rx="13" fill="${CH.skin}"/><rect x="-15" y="-10" width="30" height="34" rx="14" fill="${CH.collar}"/><circle cx="0" cy="88" r="15" fill="${CH.skin}"/></g>`;
  const ar = lerp(-18, -150, raise);
  return `<g transform="scale(${s})">
    <rect x="-34" y="-112" width="24" height="96" rx="11" fill="${CH.skin}"/><rect x="10" y="-112" width="24" height="96" rx="11" fill="${CH.skin}"/>
    <rect x="-38" y="-26" width="32" height="20" rx="8" fill="${CH.shoe}"/><rect x="6" y="-26" width="32" height="20" rx="8" fill="${CH.shoe}"/>
    ${arm(-44, 18)}${arm(44, ar)}
    <path d="M -50 -262 Q 0 -275 50 -262 L 78 -100 Q 0 -86 -78 -100 Z" fill="${CH.dress}"/>
    <circle cx="0" cy="-330" r="78" fill="${CH.hairG}"/>
    <path d="M 40 -380 Q 110 -390 120 -320 Q 128 -250 100 -200 Q 104 -270 70 -330 Z" fill="${CH.hairG}"/>
    <circle cx="44" cy="-380" r="12" fill="${CH.clip}"/>
  </g>`;
}
// 上から見た人。facing: -1 = 上を向く、1 = 下を向く。右手（赤）は rx の側
const topPerson = (x, y, facing, rightX = 1, { s = 1, o = 1, label = '' } = {}) => {
  let p = `<ellipse cx="0" cy="0" rx="80" ry="40" fill="${CH.dress}"/>`;
  p += `<circle cx="${rightX * 90}" cy="0" r="24" fill="${MR.rhand}"/><circle cx="${-rightX * 90}" cy="0" r="24" fill="${MR.lhand}"/>`;
  p += `<circle cx="0" cy="0" r="46" fill="${CH.hairG}"/><path d="M -14 ${facing * 40} L 0 ${facing * 64} L 14 ${facing * 40} Z" fill="${CH.skin}"/>`;
  return g(p + (label ? text(0, facing > 0 ? -90 : 96, label, { size: 36, w: 900, fill: C.muted }) : ''), { x, y, s, o });
};
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46 } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
const okMark = (x, y, s = 1, col = C.accent) => `<circle cx="${x}" cy="${y}" r="${54 * s}" fill="none" stroke="${col}" stroke-width="${16 * s}"/>`;
const flipText = (x, y, str, o = {}) => `<g transform="translate(${2 * x} 0) scale(-1 1)">${ctext(x, y, str, o)}</g>`;
const ambulanceFront = (flip = true) => {
  let s = `<rect x="-260" y="-200" width="520" height="360" rx="40" fill="#fff" stroke="#c9c9c9" stroke-width="6"/>`;
  s += `<rect x="-220" y="-170" width="440" height="130" rx="20" fill="#9cc6e0"/>`;
  s += `<rect x="-260" y="-10" width="520" height="16" fill="${C.red}"/>`;
  s += flip ? flipText(0, 70, '救急', { size: 80, w: 900, fill: C.red, ls: 0.1 }) : ctext(0, 70, '救急', { size: 80, w: 900, fill: C.red, ls: 0.1 });
  s += `<circle cx="-190" cy="120" r="24" fill="#ffd76a"/><circle cx="190" cy="120" r="24" fill="#ffd76a"/><rect x="-60" y="-240" width="120" height="40" rx="12" fill="${C.red}"/>`;
  return s;
};

// 1. つかみ：鏡の前で右手を上げる
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/><rect y="820" width="1920" height="260" fill="#efe3cc"/>`;
    out += mirrorFront(960, 440, 620, 720, 'mh');
    const raise = eio(prog(t, cue(1) + 0.4, 0.8));
    // 鏡の中（前向き）：画面の右の手が上がる
    out += `<clipPath id="mclip"><rect x="650" y="80" width="620" height="720" rx="12"/></clipPath><g clip-path="url(#mclip)"><g transform="translate(980 790) scale(0.95)">${sister(NOW.t, { pose: raise > 0.5 ? 'point' : 'stand', eyes: 'open', mouth: 'smile', look: [0, 0] })}</g></g>`;
    // 手前のうしろ姿
    out += `<g transform="translate(960 1130)">${backKid(t, { raise, s: 1.25 })}</g>`;
    out += callout(1100, 600, 1420, 300, 'みぎて', prog(t, cue(1) + 0.8, 0.3) * (1 - prog(t, cueE(3) + 0.4, 0.3)), { col: MR.rhand, size: 48 });
    out += callout(1040, 440, 1320, 160, 'かがみの なかでは ひだりて？', prog(t, cue(1) + 2.4, 0.3) * (1 - prog(t, cueE(3) + 0.4, 0.3)), { col: MR.lhand, size: 36 });
    const sT = talking('S');
    out += pop(`<g transform="scale(0.5)">${brother(NOW.t, { pose: sT ? 'point' : 'stand', eyes: 'wide', mouth: 'open' })}</g>`, t, cue(2) - 0.6, 260, 820, { end: cueE(3) + 0.6 });
    out += sayBubble('S', 380, 520, { tail: 'left' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1560, y: 520, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">かがみ</tspan>は、ほんとうに</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.redUi}">左右</tspan>が はんたい？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(mirrorFront(0, 0, 120, 150, 'mt') + text(0, 4, '？', { size: 70, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 820);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'かがみが ほんとうに はんたいに しているのは？', { size: 62, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'みぎ と ひだり'], ['②', 'うえ と した'], ['③', 'まえ と うしろ']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 56, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(mirrorFront(0, 0, 160, 200, 'mq') + text(0, 4, '？', { size: 90, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 330);
    out += pop(`<g transform="scale(0.5)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', look: [-5, -7] })}</g>`, t, 0.0, 1690, 850, { d: 0.4 });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1520, y: 720, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 紙はばらばら、鏡はそろえてはね返す
SCENES.push({
  id: 'reflect',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      let a = sunDisc(360, 260, 60, 0, { glow: 0.6 }) + text(360, 360, 'でんき', { size: 40, w: 900, fill: C.muted });
      a += `<circle cx="960" cy="560" r="90" fill="#f4c9a0"/><circle cx="930" cy="540" r="8" fill="${C.ink}"/><circle cx="990" cy="540" r="8" fill="${C.ink}"/><path d="M 940 590 Q 960 604 980 590" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
      const p1 = prog(t, cue(0) + 0.6, 1.0), p2 = prog(t, cue(0) + 1.6, 1.0);
      a += `<line x1="400" y1="290" x2="${lerp(400, 880, p1)}" y2="${lerp(290, 520, p1)}" stroke="${MR.ray}" stroke-width="8" stroke-linecap="round"/>`;
      if (p2 > 0) a += `<line x1="1040" y1="560" x2="${lerp(1040, 1520, p2)}" y2="${lerp(560, 560, p2)}" stroke="${MR.ray}" stroke-width="8" stroke-linecap="round"/>` + `<g transform="translate(1580 560) scale(0.35)">` + `<path d="M -120 0 Q 0 -96 120 0 Q 0 96 -120 0 Z" fill="#fff" stroke="${C.ink}" stroke-width="10"/><circle r="46" fill="#6b4a2f"/><circle r="22" fill="${C.ink}"/></g>`;
      a += g(badge('ひかりが はねかえって めに はいる', { fill: C.ochre, size: 44 }), { x: 960, y: 820 - 40, o: prog(t, cue(0) + 2.4, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.4);
    if (bO > 0) {
      const ray = (x0, y0, x1, y1, k) => `<line x1="${x0}" y1="${y0}" x2="${lerp(x0, x1, k)}" y2="${lerp(y0, y1, k)}" stroke="${MR.ray}" stroke-width="6" stroke-linecap="round"/>`;
      // 紙（でこぼこ）
      let b = `<path d="M 160 640 ${[...Array(20)].map((_, i) => `L ${180 + i * 30} ${640 + (i % 2 ? 10 : -6)}`).join(' ')} L 760 640 L 760 680 L 160 680 Z" fill="#fff" stroke="${C.line}" stroke-width="4"/>`;
      b += text(460, 740, 'しろい かみ', { size: 46, w: 900 });
      const k1 = prog(t, cue(1) + 0.4, 0.8), k2 = prog(t, cue(1) + 1.2, 1.0);
      for (let i = 0; i < 4; i++) b += ray(280 + i * 70, 300, 340 + i * 70, 636, k1);
      if (k2 > 0) [[-0.9], [-0.4], [0.2], [0.7], [1.2], [-1.3], [0.9], [-0.1]].forEach(([a], i) => { const sx = 340 + (i % 4) * 70; b += ray(sx, 634, sx + Math.sin(a) * 300, 634 - Math.cos(a) * 260, k2); });
      b += g(badge('ばらばら', { fill: C.muted, size: 44 }), { x: 460, y: 240, o: prog(t, cue(1) + 2.0, 0.3) });
      // 鏡（平ら）
      const cO = prog(t, cue(2) - 0.2, 0.4);
      if (cO > 0) {
        let c = `<rect x="1160" y="636" width="600" height="40" rx="6" fill="${MR.glass2}" stroke="${MR.frameDark}" stroke-width="4"/>` + text(1460, 740, 'かがみ', { size: 46, w: 900 });
        const k3 = prog(t, cue(2) + 0.4, 0.8), k4 = prog(t, cue(2) + 1.2, 1.0);
        for (let i = 0; i < 4; i++) { c += ray(1220 + i * 70, 300, 1340 + i * 70, 634, k3); if (k4 > 0) c += ray(1340 + i * 70, 634, 1460 + i * 70, 300, k4); }
        c += g(badge('そろえて はねかえす', { fill: C.blueUi, size: 44 }), { x: 1460, y: 240, o: prog(t, cue(2) + 2.0, 0.3) });
        c += g(badge('かおの かたちが くずれない', { fill: C.accent, size: 42 }), { x: 1460, y: 840 - 20, o: prog(t, cue(3) + 0.4, 0.3) * (1 - prog(t, cue(4) - 0.3, 0.3)) });
        // 角度
        const aO2 = prog(t, cue(4) + 0.2, 0.4);
        c += g(`<line x1="1460" y1="400" x2="1460" y2="634" stroke="${C.ink}" stroke-width="4" stroke-dasharray="10 8"/><path d="M 1430 580 A 56 56 0 0 1 1460 578" fill="none" stroke="${C.redUi}" stroke-width="6"/><path d="M 1460 578 A 56 56 0 0 1 1490 580" fill="none" stroke="${C.redUi}" stroke-width="6"/>` + badge('おなじ かくど', { fill: C.redUi, size: 42 }).replace(/^/, '<g transform="translate(1460 820)">') + '</g>', { o: aO2 });
        b += g(c, { o: cO });
      }
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 4. 鏡の奥に見える・全身は身長の半分
SCENES.push({
  id: 'behind',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const MX = 960, FL = 800;
    out += `<rect x="${MX - 14}" y="160" width="28" height="${FL - 160}" fill="${MR.glass2}" stroke="${MR.frameDark}" stroke-width="4"/>`;
    out += `<rect x="0" y="${FL}" width="1920" height="12" fill="${C.line}"/>`;
    // 自分（横から：おねえちゃんを横向きっぽく）
    out += `<g transform="translate(560 ${FL}) scale(0.95)">${sister(NOW.t, { pose: 'stand', eyes: 'open', mouth: 'smile', look: [8, 0] })}</g>`;
    const iO = prog(t, cue(0) + 0.6, 0.6);
    out += g(`<g transform="translate(${2 * MX - 560} ${FL}) scale(-0.95 0.95)">${sister(NOW.t, { pose: 'stand', eyes: 'open', mouth: 'smile', look: [8, 0] })}</g>`, { o: iO * 0.45 });
    out += g(text(2 * MX - 560, 200, 'かがみの おく', { size: 44, w: 900, fill: C.blueUi }), { o: iO });
    const dO = prog(t, cue(1) + 0.4, 0.4);
    out += g(arrow2(MX - 20, 860 - 20, 600, 860 - 20, C.ochre, 6) + arrow2(600, 840, MX - 20, 840, C.ochre, 6) + arrow2(MX + 20, 840, 2 * MX - 600, 840, C.ochre, 6) + arrow2(2 * MX - 600, 840, MX + 20, 840, C.ochre, 6), { o: dO * (1 - prog(t, cue(2) - 0.3, 0.3)) });
    out += g(badge('おなじ きょり', { fill: C.ochre, size: 42 }), { x: MX, y: 150, o: dO * (1 - prog(t, cue(2) - 0.3, 0.3)) });
    // 身長の半分
    const hO = prog(t, cue(2) + 0.4, 0.5);
    if (hO > 0) {
      const top = FL - 0.95 * 467, eye = FL - 0.95 * 330;
      out += g(`<line x1="660" y1="${eye}" x2="${MX}" y2="${(eye + top) / 2}" stroke="${MR.ray}" stroke-width="5"/><line x1="660" y1="${eye}" x2="${MX}" y2="${(eye + FL) / 2}" stroke="${MR.ray}" stroke-width="5"/>` +
        `<rect x="${MX - 18}" y="${(eye + top) / 2}" width="36" height="${(FL - top) / 2}" fill="${C.redUi}" opacity="0.8"/>` +
        `<line x1="380" y1="${top}" x2="380" y2="${FL}" stroke="${C.ink}" stroke-width="5"/>` + text(330, (top + FL) / 2, 'しんちょう', { size: 36, w: 900, anchor: 'end' }), { o: hO });
      out += g(badge('はんぶんの たかさで いい', { fill: C.redUi, size: 44 }), { x: 1460, y: 300, o: prog(t, cue(2) + 1.6, 0.3) });
    }
    return out;
  },
});

// 5. 右手を上げると、鏡でも右側。反対なのは前と後ろ
SCENES.push({
  id: 'check',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(3) - 0.3, 0.4);
    if (aO > 0) {
      const raise = eio(prog(t, cue(0) + 0.6, 0.8));
      let a = `<rect y="820" width="1920" height="260" fill="#efe3cc"/>` + mirrorFront(960, 440, 620, 720, 'mc');
      a += `<clipPath id="mclip2"><rect x="650" y="80" width="620" height="720" rx="12"/></clipPath><g clip-path="url(#mclip2)"><g transform="translate(980 790) scale(0.95)">${sister(NOW.t, { pose: raise > 0.5 ? 'point' : 'stand', eyes: 'open', mouth: 'smile' })}</g></g>`;
      a += `<g transform="translate(960 1130)">${backKid(t, { raise, s: 1.25 })}</g>`;
      // 同じ側
      a += g(`<rect x="1290" y="80" width="560" height="720" rx="20" fill="${MR.rhand}" opacity="0.08"/>` + badge('みぎがわ', { fill: MR.rhand, size: 48 }).replace(/^/, '<g transform="translate(1570 200)">') + '</g>', { o: prog(t, cue(1) + 0.6, 0.3) });
      a += g(arrow2(1500, 700, 1180, 300, MR.rhand, 8), { o: prog(t, cue(1) + 1.2, 0.3) });
      a += g(arrow2(400, 500, 400, 260, C.accent, 10) + text(400, 220, 'うえ は うえ', { size: 40, w: 900, fill: C.accent }) + arrow2(400, 580, 400, 760, C.accent, 10) + text(400, 800, 'した は した', { size: 40, w: 900, fill: C.accent }), { o: prog(t, cue(2) + 0.4, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(3) - 0.3, 0.4);
    if (bO > 0) {
      // 上から見た図
      let b = `<rect x="200" y="470" width="1520" height="16" rx="8" fill="${MR.glass2}" stroke="${MR.frameDark}" stroke-width="4"/>` + text(1720, 430, 'かがみ', { size: 40, w: 900, anchor: 'end' });
      b += text(360, 300, 'うえから みると', { size: 46, w: 900, fill: C.muted });
      b += topPerson(960, 700, -1, 1, { label: 'じぶん' });
      b += topPerson(960, 256, 1, 1, { label: 'かがみの なか', o: 0.85 });
      const pk = prog(t, cue(3) + 0.4, 0.4);
      b += g(arrow2(960, 640, 960, 520, C.ink, 10) + arrow2(960, 316, 960, 436, C.ink, 10), { o: pk });
      b += g(text(1060, 580, 'ゆびさす', { size: 40, w: 900, anchor: 'start' }) + text(1060, 380, 'こちらを さす', { size: 40, w: 900, anchor: 'start' }), { o: pk });
      b += g(text(1150, 700, 'みぎて', { size: 36, w: 900, fill: MR.rhand, anchor: 'start' }) + text(1150, 256, 'みぎがわ', { size: 36, w: 900, fill: MR.rhand, anchor: 'start' }), { o: prog(t, cue(3) + 1.2, 0.3) });
      b += g(`<g transform="translate(560 478)">${arrow2(0, 160, 0, 40, C.redUi, 12)}${arrow2(0, -160, 0, -40, C.redUi, 12)}</g>` + badge('まえと うしろが はんたい', { fill: C.redUi, size: 48 }).replace(/^/, '<g transform="translate(480 840)">') + '</g>', { o: prog(t, cue(4) + 0.8, 0.3) });
      out += g(b, { o: bO });
      const kO = prog(t, cue(5) - 0.6, 0.4);
      if (kO > 0) {
        out += g(chameleon(NOW.t, { holdLens: true, mouth: lineOf('K') ? 'open' : 'smile' }), { x: 1560, y: 840, s: 0.55, o: kO });
        out += sayBubble('K', 1640, 640, { tail: 'left' });
      }
    }
    return out;
  },
});

// 6. 鏡の中の人の立場になるから
SCENES.push({
  id: 'why',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(3) - 0.3, 0.4);
    if (aO > 0) {
      let a = `<rect x="200" y="470" width="1520" height="16" rx="8" fill="${MR.glass2}" stroke="${MR.frameDark}" stroke-width="4"/>`;
      a += topPerson(960, 256, 1, 1, { label: 'かがみの なか', o: 0.85 });
      // まわりこむ自分のゆうれい
      const k = eio(prog(t, cue(1) + 0.4, 3.0));
      const ang = Math.PI * k;
      const gx = 960 + Math.sin(ang) * 0 + (k > 0 && k < 1 ? Math.sin(ang) * 380 : 0), gy = lerp(700, 256, k);
      const rot = 180 * k;
      a += g(`<g transform="rotate(${rot})">${topPerson(0, 0, -1, 1, {})}</g>`, { x: gx, y: gy, o: t > cue(1) + 0.2 ? 0.55 * (1 - prog(t, cue(2) - 0.4, 0.4)) : 0 });
      a += topPerson(960, 700, -1, 1, { label: 'じぶん' });
      a += g(`<path d="M 1060 700 Q 1400 480 1060 256" fill="none" stroke="${C.ochre}" stroke-width="6" stroke-dasharray="14 10"/>`, { o: win(t, cue(1) + 0.2, cue(2), 0.3) });
      a += g(badge('かがみの なかの ひとの たちばで かんがえる', { fill: C.ochre, size: 40 }), { x: 960, y: 150, o: prog(t, cue(1) + 0.6, 0.3) * (1 - prog(t, cue(2) - 0.3, 0.3)) });
      a += g(text(0, 0, 'むきを かえると、みぎと ひだりが いれかわる', { size: 38, w: 900, fill: MR.lhand }), { x: 640, y: 590, o: win(t, cue(1) + 3.6, cue(2), 0.3) });
      a += g(badge('じぶんの むきの まま みれば みぎは みぎ', { fill: C.accent, size: 42 }), { x: 960, y: 150, o: prog(t, cue(2) + 0.4, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(3) - 0.3, 0.4);
    if (bO > 0) {
      let b = pop(badge('とうきょう だいがく たかの ようたろう さん', { fill: C.blueUi, size: 42 }), t, cue(3), 960, 180);
      for (let i = 0; i < 10; i++) {
        const k = prog(t, cue(3) + 1.0 + i * 0.12, 0.3);
        const hl = i < 3;
        b += g(`<circle cx="0" cy="-110" r="36" fill="${hl ? C.ochre : '#b9c3cc'}"/><path d="M -46 0 Q -46 -70 0 -70 Q 46 -70 46 0 Z" fill="${hl ? C.ochre : '#b9c3cc'}"/>`, { x: 330 + i * 140, y: 560, o: k, s: lerp(0.6, 1, back(k)) });
      }
      b += g(`<path d="M 260 600 L 260 630 L 680 630 L 680 600" fill="none" stroke="${C.ochre}" stroke-width="6"/>` + text(470, 690, '2〜4わり', { size: 56, w: 900, fill: C.ochre }), { o: prog(t, cue(3) + 2.6, 0.3) });
      b += g(text(0, 0, 'はんたいだと かんじない', { size: 46, w: 900, fill: C.ochre }), { x: 1200, y: 690, o: prog(t, cue(3) + 3.2, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 7. 鏡文字と救急車
SCENES.push({
  id: 'letters',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.3, 0.4);
    if (aO > 0) {
      let a = `<rect x="260" y="320" width="560" height="320" rx="16" fill="#fff" stroke="${C.line}" stroke-width="6"/>` + ctext(540, 480, 'みのまわり', { size: 90, w: 900 });
      a += mirrorFront(1360, 480, 600, 380, 'ml') + flipText(1360, 480, 'みのまわり', { size: 90, w: 900, fill: '#3a5a6a' });
      a += g(arrow2(860, 480, 1020, 480, C.muted, 8), {});
      a += g(badge('もじは みんな はんたいだと かんじる', { fill: C.redUi, size: 44 }), { x: 960, y: 760, o: prog(t, cue(0) + 1.6, 0.3) });
      a += g(badge('「かがみもじ」', { fill: C.blueUi, size: 52 }), { x: 960, y: 200, o: prog(t, cue(1) + 0.6, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      let b = pop(ambulanceFront(true), t, cue(2), 560, 500);
      b += g(text(560, 780, 'きゅうきゅうしゃの まえ', { size: 42, w: 900 }), { o: prog(t, cue(2) + 0.4, 0.3) });
      // ルームミラー
      const rO = prog(t, cue(3) + 0.2, 0.5);
      b += g(`<rect x="-300" y="-120" width="600" height="240" rx="110" fill="#3a3f44"/><rect x="-270" y="-95" width="540" height="190" rx="90" fill="${MR.glass}"/>` +
        `<clipPath id="rm"><rect x="-270" y="-95" width="540" height="190" rx="90"/></clipPath><g clip-path="url(#rm)"><g transform="translate(0 -20) scale(-0.42 0.42)">${ambulanceFront(true)}</g></g><rect x="-20" y="-170" width="40" height="60" fill="#3a3f44"/>`, { x: 1380, y: 420, o: rO });
      b += g(text(1380, 620, 'まえの くるまの ルームミラー', { size: 40, w: 900 }), { o: rO });
      b += g(okMark(1700, 300, 0.8), { o: prog(t, cue(3) + 2.0, 0.3) });
      b += g(badge('ふつうの「救急」に よめる', { fill: C.accent, size: 44 }), { x: 1380, y: 740, o: prog(t, cue(3) + 1.6, 0.3) });
      const bT = talking('B');
      b += pop(`<g transform="scale(0.44)">${brother(NOW.t, { pose: bT ? 'cheer' : 'stand', eyes: 'smile', mouth: 'open', hop: bT ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, cue(4) - 0.8, 1800, 860);
      b += sayBubble('B', 1700, 620, { tail: 'right' });
      out += g(b, { o: bO });
    }
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
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-450, 2, 'まえ と うしろ', { size: 60, w: 900, anchor: 'start' }), t, 0.4, 960, 300);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="70" fill="none" stroke="${C.red}" stroke-width="12"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 300, o: ring, s: Math.max(back(ring), 0.001) });
      a += pop(`<rect x="-500" y="-8" width="1000" height="16" rx="8" fill="${MR.glass2}"/>` + topPerson(0, 150, -1, 1, { s: 0.7 }) + topPerson(0, -150, 1, 1, { s: 0.7, o: 0.85 }) + arrow2(260, 110, 260, 30, C.redUi, 10) + arrow2(260, -110, 260, -30, C.redUi, 10), t, 2.2, 960, 620);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 170);
      const warn = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
      const paper = `<rect x="-56" y="-40" width="112" height="80" rx="8" fill="#fff" stroke="${C.line}" stroke-width="4"/>` + ctext(0, 2, 'なまえ', { size: 26, w: 900 });
      const flipP = `<rect x="-56" y="-40" width="112" height="80" rx="8" fill="${MR.glass}" stroke="${MR.frameDark}" stroke-width="4"/>` + flipText(0, 2, 'なまえ', { size: 26, w: 900 });
      const items = [
        [paper, 'なまえを かいた かみを かがみに むける', C.ink, cue(1)],
        [flipP, 'よこに まわす？ うえしたに ひっくりかえす？', C.ink, cue(2)],
        [warn, 'きゅうきゅうしゃは しゃしんや とまっている ときに', C.red, cue(3)],
      ];
      items.forEach(([ic, s, col, st], i) => { b += pop(ic + text(110, 2, s, { size: 44, w: 900, anchor: 'start', fill: col }), t, st, 230, 340 + i * 150); });
      b += pop(chameleon(NOW.t, { holdLens: true }), t, cue(1) + 0.8, 1660, 820, { s: 0.75 });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「かがみ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    out += pop(`<g transform="scale(0.52)">${sister(NOW.t, { pose: 'wave', eyes: 'smile', mouth: 'open', talk: talking('S') })}</g>`, t, 0.8, 150, 1060, { d: 0.45 });
    out += pop(`<g transform="scale(0.52)">${brother(NOW.t + 1, { pose: 'cheer', eyes: 'smile', mouth: 'open', hop: talking('B') ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, 1.0, 310, 1060, { d: 0.45 });
    out += pop(chameleon(NOW.t, { holdLens: true }), t, 1.2, 1660, 1040, { s: 0.7 });
    // 吹き出しは、しっぽの先をそれぞれの子の頭（顔）にとどかせる
    const endBubble = (who, x, y, tipX, tipY, size = 44) => {
      const L = lineOf(who); if (!L) return '';
      const k = back(clamp((NOW.t - L.start + 0.1) / 0.35));
      const o = Math.min(clamp((NOW.t - L.start + 0.1) / 0.15), clamp((L.end - NOW.t) / 0.25));
      const w = tw(L.text, size, 700, 0.04) + 70, h = size * 2.3;
      const dx = tipX - x, dy = tipY - y;
      let base;
      if (Math.abs(dy) - h / 2 > Math.abs(dx) - w / 2) {  // 下（上）へ出す
        const bx = Math.max(-w / 2 + 40, Math.min(w / 2 - 40, dx)), by = Math.sign(dy) * (h / 2 - 4);
        base = `${bx - 22} ${by} L ${bx + 22} ${by}`;
      } else {  // 横へ出す
        const bx = Math.sign(dx) * (w / 2 - 4), by = Math.max(-h / 2 + 30, Math.min(h / 2 - 30, dy));
        base = `${bx} ${by - 18} L ${bx} ${by + 18}`;
      }
      const body = `<g filter="url(#shadow)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff"/><path d="M ${base} L ${dx} ${dy} Z" fill="#fff"/></g>` + text(0, 2, L.text, { size, fill: C.ink });
      return g(body, { x, y, s: Math.max(k, 0.001), o });
    };
    out += endBubble('S', 185, 680, 165, 800) + endBubble('B', 575, 905, 372, 905);
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

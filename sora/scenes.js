// みのまわり図鑑 動画「昼は青いのに、どうして夕やけは赤い？」
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
  const str = 'みのまわり図鑑 ｜ そら', size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
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

// 1. つかみ：昼の青い空が、夕方に赤くなる
SCENES.push({
  id: 'hook',
  draw(t) {
    const k = eio(prog(t, cue(1) + 0.5, 3.4));
    let out = skyRect('skh', k);
    const sx = lerp(1360, 1790, k), sy = lerp(230, 700, eio(k));
    out += sunDisc(sx, sy, 78, k);
    const cc = mix('#ffffff', '#ffc9b3', k);
    out += cloud(260 + t * 10, 250, 1, cc) + cloud(900 + t * 7, 170, 0.75, cc) + cloud(1700 - t * 5, 330, 0.6, cc, 0.85);
    out += `<path d="M 0 770 Q 420 650 860 750 T 1920 700 L 1920 1080 L 0 1080 Z" fill="${mix('#93cf8c', '#7a6d8f', k)}"/>`;
    out += house(1180, 790, 0.9, mix('#f4ead8', '#d9b9a8', k), mix('#c0624c', '#8a4a4a', k)) + house(1420, 770, 0.7, mix('#f4ead8', '#d9b9a8', k), mix('#5d7fa8', '#4a4a6a', k));
    out += tree(1640, 790, 0.9, mix('#3f8f4a', '#3d3f5a', k));
    out += `<path d="M 0 880 Q 620 780 1240 900 T 1920 870 L 1920 1080 L 0 1080 Z" fill="${mix('#5fae5f', '#4a4766', k)}"/>`;
    // 子どもたち（空を見上げる）
    const sT = talking('S');
    out += `<g transform="translate(230 960) scale(0.56)">${sister(NOW.t, { pose: sT ? 'point' : 'stand', eyes: t > cue(1) + 2 ? 'wide' : 'open', mouth: sT ? 'open' : 'smile', talk: sT, look: [5, -9] })}</g>`;
    out += `<g transform="translate(400 960) scale(0.56)">${brother(NOW.t + 1, { pose: 'stand', eyes: t > cue(1) + 2 ? 'wide' : 'open', mouth: 'smile', look: [3, -9] })}</g>`;
    out += sayBubble('S', 560, 590, { tail: 'left' });
    // 昼と夕方のくらべ
    const cO = win(t, cue(3), cueE(3) + 0.5, 0.4);
    if (cO > 0) {
      let c = card(860, 330);
      c += skyRect('skc0', 0, { x: -400, y: -140, w: 360, h: 210, rx: 20 }) + sunDisc(-140, -80, 26, 0, { glow: 0.5 });
      c += skyRect('skc1', 1, { x: 40, y: -140, w: 360, h: 210, rx: 20 }) + sunDisc(320, 50, 26, 1, { glow: 0.5 });
      c += text(-220, 120, 'おひる', { size: 44, w: 900 }) + text(220, 120, 'ゆうがた', { size: 44, w: 900 });
      c += text(0, -34, '？', { size: 90, w: 900, fill: C.ochre });
      out += g(c, { x: 960, y: 330 - (1 - eo(prog(t, cue(3), 0.5))) * 40, o: cO });
    }
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 280);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">昼は <tspan fill="${C.blue}">青い</tspan>のに、</text>`, { x: 960, y: 470, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして 夕やけは <tspan fill="#ec6a2c">赤い</tspan>？</text>`, { x: 960, y: 650, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = skyRect('skt0', 0, { x: -190, y: -60, w: 180, h: 120, rx: 18 }) + sunDisc(-60, -20, 18, 0, { glow: 0.4 }) +
        skyRect('skt1', 1, { x: 10, y: -60, w: 180, h: 120, rx: 18 }) + sunDisc(140, 40, 18, 1, { glow: 0.4 });
      out += pop(ic, t, t0 + 1.8, 960, 850);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと思う？', { size: 84, w: 900 }), t, 0.3, 960, 210);
    const opts = [['①', '海の 青が、空に うつっている'], ['②', '空気が、光を 飛びちらせている'], ['③', '空の 上に、青い まくが ある']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 54, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 900, 390 + i * 168);
    });
    out += pop(`<g transform="scale(0.72)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', look: [-5, -7] })}</g>`, t, 0.0, 1680, 900, { d: 0.4 });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1500, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 空気は透明、でも厚い
SCENES.push({
  id: 'air',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // A コップ
    const b = eio(prog(t, cue(1) - 0.2, 1.0));
    const cupO = 1 - prog(t, cue(1) + 0.6, 0.5);
    if (cupO > 0) {
      const cup = `<path d="M -150 -190 L 150 -190 L 118 190 Q 116 210 96 210 L -96 210 Q -116 210 -118 190 Z" fill="#eaf4fa" fill-opacity="0.35" stroke="#8fb3c6" stroke-width="10" stroke-linejoin="round"/>
        <path d="M -112 -150 L -86 170" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.9"/>
        <ellipse cx="0" cy="-190" rx="150" ry="22" fill="none" stroke="#8fb3c6" stroke-width="8"/>`;
      out += g(pop(cup, t, 0.3, 0, 0) + g(text(0, -290, 'コップの なかの くうき', { size: 54, w: 900 }), { o: prog(t, 0.6, 0.4) }) +
        pop(badge('いろは ない', { fill: C.blueUi, size: 42 }), t, cue(0) + 1.4, 0, 300), { x: lerp(960, 420, b), y: 470, s: lerp(1, 0.6, b), o: cupO });
    }
    // B あつく重なった空気
    const bO = prog(t, cue(1) - 0.1, 0.5);
    if (bO > 0) {
      let a = `<rect x="0" y="0" width="1920" height="150" fill="#1c2742"/>` + stars(11, 30).replace(/cy="(\d+(\.\d+)?)"/g, (m, v) => `cy="${(+v) * 0.26}"`);
      a += text(1560, 76, 'うちゅう', { size: 40, w: 900, fill: '#e8eefc' });
      const N = 14;
      for (let i = 0; i < N; i++) {
        const k = prog(t, cue(1) + 0.3 + i * 0.22, 0.35);
        if (k <= 0) continue;
        const y = 900 - (i + 1) * (750 / N);
        a += `<rect x="0" y="${y + (1 - eo(k)) * 30}" width="1920" height="${900 - y}" fill="#5aa7ea" opacity="${0.075 * k}"/>`;
      }
      a += `<rect x="0" y="900" width="1920" height="180" fill="#9fcf8e"/>`;
      a += house(760, 905, 0.6) + tree(560, 905, 0.6) + tree(1500, 905, 0.5);
      a += cloud(1300, 640, 0.6, '#fff', 0.9) + `<g transform="translate(${400 + t * 30} 420) scale(0.9)"><path d="M -60 0 L 60 0 L 76 -6 L 60 8 L -50 8 Z M -10 0 L 20 -40 L 34 -40 L 20 0 Z M -10 6 L 18 36 L 30 36 L 22 6 Z" fill="#fff"/></g>`;
      const ak = prog(t, cue(1) + 2.6, 0.6);
      a += g(`<path d="M 0 -360 L 0 360 M -22 -332 L 0 -360 L 22 -332 M -22 332 L 0 360 L 22 332" stroke="${C.ink}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
        text(-40, 0, 'とても あつい', { size: 50, w: 900, anchor: 'end' }), { x: 1760, y: 530, o: ak });
      // C 太陽の光が通ってくる
      const ck = prog(t, cue(2) - 0.1, 0.4);
      if (ck > 0) {
        a += sunDisc(260, 70, 48, 0);
        const L = eo(prog(t, cue(2) + 0.2, 1.6));
        [[300, 110, 930, 880], [330, 95, 1060, 880], [280, 120, 800, 880]].forEach(([x1, y1, x2, y2], i) => {
          const xe = lerp(x1, x2, L), ye = lerp(y1, y2, L);
          a += `<line x1="${x1}" y1="${y1}" x2="${xe}" y2="${ye}" stroke="#fff7cf" stroke-width="${14 - i * 3}" stroke-linecap="round" opacity="${0.9 * ck}"/>`;
        });
        a += g(text(0, 0, 'たいようの ひかり', { size: 42, w: 900, fill: '#fff3c4', anchor: 'start' }), { x: 340, y: 76, o: prog(t, cue(2) + 0.8, 0.4) });
      }
      out += g(a, { o: bO });
    }
    return out;
  },
});

// 4. 太陽の光は色のまぜもの（プリズム）
SCENES.push({
  id: 'prism', night: true,
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + stars(5, 60) + topBadge(true);
    const P = [[900, 360], [1040, 610], [760, 610]];
    const pk = prog(t, cue(1) + 0.2, 0.5);
    out += sunDisc(200, 500, 70, 0);
    const bk = eo(prog(t, cue(0) + 0.3, 1.2));
    const xEnd = pk > 0 ? 830 : 1920;
    const bx = lerp(270, xEnd, bk);
    const by = x => 500 + (x - 270) * (530 - 500) / (830 - 270);
    out += `<line x1="270" y1="500" x2="${bx}" y2="${by(bx)}" stroke="#fffbea" stroke-width="40" opacity="0.25" filter="url(#soft)"/><line x1="270" y1="500" x2="${bx}" y2="${by(bx)}" stroke="#fffbea" stroke-width="22" stroke-linecap="round"/>`;
    // まざっている色のつぶ
    const mk = win(t, cue(0) + 3.0, cue(1) + 0.4, 0.4);
    if (mk > 0) {
      const cols = Object.values(LIGHT);
      for (let i = 0; i < 18; i++) {
        const f = ((t * 0.35 + i / 18) % 1), x = lerp(300, xEnd - 20, f);
        out += `<circle cx="${x}" cy="${by(x) + Math.sin(i * 2.1) * 6}" r="7" fill="${cols[i % 6]}" opacity="${mk}"/>`;
      }
    }
    out += g(text(0, 0, 'しろっぽい ひかり', { size: 46, w: 900, fill: '#fff' }), { x: 600, y: 400, o: win(t, cue(0) + 0.8, cue(0) + 3.0, 0.3) });
    out += g(text(0, 0, 'いろんな いろが まざってる', { size: 46, w: 900, fill: '#fff3c4' }), { x: 620, y: 400, o: win(t, cue(0) + 3.2, cue(1) + 0.3, 0.3) });
    if (pk > 0) {
      out += g(`<path d="M ${P.map(p => p.join(' ')).join(' L ')} Z" fill="#dcecff" fill-opacity="0.38" stroke="#e3f0ff" stroke-width="8" stroke-linejoin="round"/>`, { o: pk });
      out += g(text(900, 680, 'プリズム', { size: 48, w: 900, fill: '#fff' }), { o: prog(t, cue(1) + 1.0, 0.4) });
      const fk = eo(prog(t, cue(1) + 1.4, 1.3));
      const ex = 985, ey = 520, sx = lerp(ex, 1700, fk);
      const cols = [LIGHT.red, LIGHT.orange, LIGHT.yellow, LIGHT.green, '#2fb6e8', LIGHT.blue, LIGHT.violet];
      cols.forEach((c, i) => {
        const y0 = lerp(ey, 300 + i * 66, fk), y1 = lerp(ey, 366 + i * 66, fk);
        out += `<path d="M ${ex} ${ey - 6 + i * 2} L ${sx} ${y0} L ${sx} ${y1} L ${ex} ${ey - 4 + i * 2} Z" fill="${c}" opacity="0.92"/>`;
      });
      out += g(text(0, 0, 'にじの いろに わかれた', { size: 46, w: 900, fill: '#fff' }), { x: 1400, y: 240, o: prog(t, cue(1) + 2.8, 0.4) });
    }
    out += pop(badge('1666年 イギリス', { fill: C.ochre, size: 40 }), t, cue(2) + 0.2, 960, 170);
    out += g(text(0, 0, 'ニュートンが たしかめた', { size: 46, w: 900, fill: '#fff' }), { x: 960, y: 800, o: prog(t, cue(2) + 1.4, 0.4) });
    return out;
  },
});

// 5. 散乱：小さなつぶにぶつかって飛びちる
const AIR = Array.from({ length: 96 }, (_, i) => [140 + (i % 16) * 106 + rnd(i, 1) * 60, 250 + Math.floor(i / 16) * 100 + rnd(i, 2) * 60]);
const PDEF = { red: 0.12, orange: 0.2, yellow: 0.3, green: 0.45, blue: 0.85, violet: 0.9 };
function lightBalls(t, t0, { only = null, rate = 0.12 } = {}) {
  let out = '';
  const names = Object.keys(LIGHT);
  const n = Math.floor((t - t0) / rate);
  for (let i = Math.max(0, n - 60); i <= n; i++) {
    const ts = t0 + i * rate, age = t - ts; if (age < 0) continue;
    const name = only ? only[i % only.length] : names[i % 6], col = LIGHT[name];
    const y0 = 270 + rnd(i, 3) * 520, v = 560;
    const hit = rnd(i, 4) < PDEF[name], xd = 260 + rnd(i, 5) * 1300;
    let x = -40 + v * age, y = y0, dx = 1, dy = 0, ring = '';
    if (hit && x > xd) {
      const a = (0.35 + rnd(i, 6) * 1.3) * Math.PI * (rnd(i, 7) < 0.5 ? 1 : -1);
      const s = x - xd; dx = Math.cos(a); dy = Math.sin(a); x = xd + dx * s; y = y0 + dy * s;
      const rk = clamp(s / v / 0.35);
      if (rk < 1) ring = `<circle cx="${xd}" cy="${y0}" r="${18 + 54 * rk}" fill="none" stroke="${col}" stroke-width="6" opacity="${1 - rk}"/>`;
    }
    if (x < -60 || x > 1980 || y < -60 || y > 1140) { out += ring; continue; }
    out += ring + `<line x1="${x - dx * 70}" y1="${y - dy * 70}" x2="${x}" y2="${y}" stroke="${col}" stroke-width="10" stroke-linecap="round" opacity="0.45"/>` + ballG(x, y, col, 16);
  }
  return out;
}
SCENES.push({
  id: 'scatter',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#eef6fb"/>` + topBadge();
    out += AIR.map(([x, y], i) => `<circle cx="${x}" cy="${y + Math.sin(t * 1.5 + i) * 4}" r="10" fill="#a9bccb"/>`).join('');
    out += pop(badge('くうきの つぶ（とても ちいさい）', { fill: '#7f95a6', size: 34 }), t, 0.2, 1500, 180);
    out += lightBalls(t, cue(0) + 0.2);
    out += pop(badge('さんらん', { fill: C.blueUi, size: 52, pad: 44 }), t, cue(1), 960, 170);
    // くらべ
    const pk = prog(t, cue(2) + 0.2, 0.5);
    if (pk > 0) {
      const bl = eo(prog(t, cue(2) + 0.6, 1.0)), rl = eo(prog(t, cue(2) + 1.2, 0.8));
      let c = card(760, 250);
      c += ballG(-300, -50, LIGHT.blue, 22) + `<rect x="-250" y="-70" width="${380 * bl}" height="40" rx="20" fill="${LIGHT.blue}"/>` + text(-250 + 380 * bl + 20, -50, 'とびちりやすい', { size: 34, w: 900, anchor: 'start', fill: C.blueUi });
      c += ballG(-300, 50, LIGHT.red, 22) + `<rect x="-250" y="30" width="${70 * rl}" height="40" rx="20" fill="${LIGHT.red}"/>` + text(-250 + 70 * rl + 20, 50, 'とびちりにくい', { size: 34, w: 900, anchor: 'start', fill: C.redUi });
      out += g(c, { x: 960, y: 650, o: pk, s: lerp(0.95, 1, eo(pk)) });
    }
    const bO = prog(t, cue(2) + 1.0, 0.4);
    if (bO > 0) {
      const bT = lineOf('B');
      out += g(`<g transform="translate(1800 960) scale(0.52)">${brother(NOW.t, { pose: bT ? 'cheer' : 'stand', eyes: 'smile', mouth: 'open', hop: bT ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, { o: bO });
      out += sayBubble('B', 1600, 590, { tail: 'right' });
    }
    return out;
  },
});

// 6. どこからでも青い光がとどく
const DOTS = Array.from({ length: 30 }, (_, i) => [120 + rnd(i, 8) * 1680, 150 + rnd(i, 9) * 470]);
SCENES.push({
  id: 'every',
  draw(t) {
    let out = skyRect('ske', 0);
    out += sunDisc(1640, 190, 70, 0);
    out += `<path d="M 0 860 Q 640 780 1280 870 T 1920 850 L 1920 1080 L 0 1080 Z" fill="#6fba68"/>`;
    const turn = eio(prog(t, cue(1) + 0.2, 0.6));
    const EX = 960, EY = 672;
    // 空のあちこちで散った青い光
    DOTS.forEach(([x, y], i) => {
      const k = prog(t, cue(0) + 0.3 + i * 0.1, 0.4);
      if (k <= 0) return;
      const lk = prog(t, cue(0) + 0.8 + i * 0.1, 0.8);
      out += `<line x1="${x}" y1="${y}" x2="${lerp(x, EX, lk)}" y2="${lerp(y, EY, lk)}" stroke="#ffffff" stroke-width="4" stroke-dasharray="14 12" stroke-dashoffset="${-t * 60}" opacity="${0.55 * k}"/>`;
      out += g(ballG(0, 0, LIGHT.blue, 10), { x, y, s: Math.max(back(k), 0.001) });
    });
    out += `<g transform="translate(960 880) scale(0.6)">${sister(NOW.t, { pose: 'stand', eyes: 'open', mouth: 'smile', look: [lerp(6, -6, turn), -9] })}</g>`;
    out += pop(badge('おひさまの ない ほうも あおい', { fill: C.blueUi, size: 42 }), t, cue(1) + 0.8, 520, 200, { end: cue(2) + 0.2 });
    // 海の色ではない
    const sk = win(t, cue(2) - 0.1, 99, 0.4);
    if (sk > 0) {
      let c = card(620, 360);
      c += `<rect x="-260" y="-140" width="520" height="120" rx="16" fill="#86c2ef"/><rect x="-260" y="-20" width="520" height="110" rx="16" fill="#2f78b8"/>`;
      c += [0, 1, 2].map(j => `<path d="M ${-240 + j * 170} 30 q 40 -26 80 0 t 80 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`).join('');
      c += text(0, 136, 'うみの いろが うつってる？', { size: 38, w: 900 });
      c += g(cross(0, -20, 1.2), { o: prog(t, cue(2) + 1.0, 0.25), s: lerp(1.4, 1, eo(prog(t, cue(2) + 1.0, 0.3))) });
      out += g(c, { x: 1420, y: 480, o: sk });
    }
    return out;
  },
});

// 7. むらさきじゃないわけ
SCENES.push({
  id: 'purple',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const up = eio(prog(t, cue(1) - 0.3, 0.8));
    // A むらさきは青より飛びちりやすい
    const aO = prog(t, cue(0), 0.4);
    if (aO > 0) {
      const vk = eo(prog(t, cue(0) + 0.5, 0.8)), bk = eo(prog(t, cue(0) + 0.9, 0.8));
      let a = ballG(-230, -70, LIGHT.violet, 26) + `<rect x="-180" y="-92" width="${480 * vk}" height="44" rx="22" fill="${LIGHT.violet}"/>` + text(-180, -150, 'むらさき', { size: 40, w: 900, anchor: 'start', fill: '#6a43c8' });
      a += ballG(-230, 70, LIGHT.blue, 26) + `<rect x="-180" y="48" width="${380 * bk}" height="44" rx="22" fill="${LIGHT.blue}"/>` + text(-180, 10, 'あお', { size: 40, w: 900, anchor: 'start', fill: C.blueUi });
      a += g(text(420, 0, '？', { size: 160, w: 900, fill: C.ochre }), { o: prog(t, cue(0) + 2.4, 0.4) });
      out += g(a, { x: lerp(860, 560, up), y: lerp(470, 240, up), s: lerp(1, 0.55, up), o: aO });
    }
    // B ふたつのわけ
    const c1 = prog(t, cue(1) + 0.2, 0.5);
    if (c1 > 0) {
      let c = card(700, 380);
      const hs = [0.62, 0.86, 1.0, 0.98, 0.95, 0.88, 0.8];
      const cols = [LIGHT.violet, LIGHT.blue, '#2fb6e8', LIGHT.green, LIGHT.yellow, LIGHT.orange, LIGHT.red];
      cols.forEach((col, i) => {
        const h = 190 * hs[i] * eo(prog(t, cue(1) + 0.5 + i * 0.06, 0.6));
        c += `<rect x="${-230 + i * 66}" y="${60 - h}" width="50" height="${h}" rx="10" fill="${col}"/>`;
      });
      c += sunDisc(250, -110, 34, 0, { glow: 0.5 });
      c += g(`<path d="M -230 -150 L -150 -150" stroke="${C.ink}" stroke-width="0"/>`, {});
      c += text(0, 120, 'おひさまの ひかりに', { size: 40, w: 900 }) + text(0, 166, 'むらさきは すくない', { size: 40, w: 900, fill: '#6a43c8' });
      out += g(c, { x: 560, y: 560, o: c1, s: lerp(0.95, 1, eo(c1)) });
    }
    const c2 = prog(t, cue(1) + 3.0, 0.5);
    if (c2 > 0) {
      let c = card(700, 380);
      c += g(eyeIcon(0.9), { y: -40 });
      c += [[LIGHT.red, 1], [LIGHT.green, 1], [LIGHT.blue, 1], [LIGHT.violet, 0.25]].map(([col, o], i) => `<circle cx="${-150 + i * 100}" cy="${50}" r="22" fill="${col}" opacity="${o}"/>`).join('');
      c += text(0, 120, 'ひとの めは', { size: 40, w: 900 }) + text(0, 166, 'むらさきを かんじにくい', { size: 40, w: 900, fill: '#6a43c8' });
      out += g(c, { x: 1360, y: 560, o: c2, s: lerp(0.95, 1, eo(c2)) });
    }
    const rk = prog(t, cue(1) + 6.2, 0.5);
    if (rk > 0) out += g(lamp(-150, 0, 44, '#8fd0f5', 1) + text(-80, 2, 'だから そらは みずいろ', { size: 50, w: 900, anchor: 'start', fill: C.blueUi }), { x: 1180, y: 240, o: rk });
    return out;
  },
});

// 8. 夕やけ：長い道のりで青がなくなる
const EARTH = { cx: 760, cy: 2700, R: 1950, H: 210 };
function exitDist(ox, oy, ux, uy) {
  // 観察者から方向 u に進んで、空気の層の外へ出るまでの距離
  const px = ox - EARTH.cx, py = oy - EARTH.cy, RR = EARTH.R + EARTH.H;
  const b = px * ux + py * uy, c = px * px + py * py - RR * RR;
  return -b + Math.sqrt(b * b - c);
}
SCENES.push({
  id: 'sunset',
  draw(t) {
    const skyK = eio(prog(t, cue(4) - 0.3, 2.0));
    let out = skyRect('sks', skyK);
    const O = [EARTH.cx, EARTH.cy - EARTH.R];
    out += `<circle cx="${EARTH.cx}" cy="${EARTH.cy}" r="${EARTH.R + EARTH.H}" fill="#ffffff" fill-opacity="0.22" stroke="#ffffff" stroke-opacity="0.7" stroke-width="4" stroke-dasharray="16 12"/>`;
    out += `<circle cx="${EARTH.cx}" cy="${EARTH.cy}" r="${EARTH.R}" fill="${mix('#69b36a', '#4f5f5a', skyK)}"/>`;
    out += g(text(0, 0, 'くうきの そう', { size: 40, w: 900, fill: '#fff' }), { x: 230, y: 760, o: prog(t, 0.3, 0.5) });
    // 太陽の向き（度）：昼 90 → 夕方 5
    const mv = eio(prog(t, cue(1) + 0.4, 3.2));
    const ang = lerp(90, 5, mv) * Math.PI / 180;
    const ux = Math.cos(ang), uy = -Math.sin(ang);
    const se = exitDist(O[0], O[1] - 30, ux, uy);
    const B0 = [O[0] + ux * se, O[1] - 30 + uy * se];
    const sd = se + 80, S = [O[0] + ux * sd, O[1] - 30 + uy * sd];
    out += sunDisc(S[0], S[1], 46, mv * 0.6);
    // 光の道（色は道の終わりほどオレンジに）
    const red = eo(prog(t, cue(3) - 0.2, 1.4));
    const endCol = mix('#fffbe6', '#ff7a32', red);
    out += `<linearGradient id="beam" gradientUnits="userSpaceOnUse" x1="${S[0]}" y1="${S[1]}" x2="${O[0]}" y2="${O[1] - 30}"><stop offset="0" stop-color="#fffbe6"/><stop offset="0.5" stop-color="${mix('#fffbe6', '#ffc06a', red)}"/><stop offset="1" stop-color="${endCol}"/></linearGradient>`;
    out += `<line x1="${S[0]}" y1="${S[1]}" x2="${O[0]}" y2="${O[1] - 30}" stroke="url(#beam)" stroke-width="20" stroke-linecap="round" opacity="0.95"/>`;
    // 道の長さのラベル
    const mid = [(B0[0] + O[0]) / 2, (B0[1] + O[1] - 30) / 2];
    out += g(badge('みじかい', { fill: C.blueUi, size: 36 }), { x: mid[0] + 150, y: mid[1], o: win(t, cue(0) + 0.6, cue(1) + 0.4, 0.3) });
    out += g(badge('ながい みちのり', { fill: C.ochre, size: 40 }), { x: mid[0], y: mid[1] - 90, o: win(t, cue(1) + 3.4, cue(3) + 0.2, 0.3) });
    // 散って出ていく青い光
    const peel = (t0, t1, n) => {
      let o = '';
      for (let i = 0; i < n; i++) {
        const ts = t0 + (t1 - t0) * i / n, age = t - ts;
        if (age < 0 || age > 1.6) continue;
        const f = rnd(i, 11) * 0.92;
        const px = lerp(B0[0], O[0], f), py = lerp(B0[1], O[1] - 30, f);
        const a = rnd(i, 12) * Math.PI * 2, d = age * 240;
        o += ballG(px + Math.cos(a) * d, py + Math.sin(a) * d, LIGHT.blue, 11).replace(/<circle/, `<circle opacity="${1 - age / 1.6}"`);
      }
      return o;
    };
    out += peel(cue(0) + 0.2, cue(1) + 0.4, 14);
    out += peel(cue(2) - 0.2, cue(3) + 0.4, 90);
    out += g(badge('あおは とちゅうで とびちる', { fill: C.blueUi, size: 38 }), { x: mid[0], y: mid[1] - 200, o: win(t, cue(2) + 0.4, cue(3) + 0.2, 0.3) });
    out += g(badge('あか・オレンジが のこる', { fill: '#d4612a', size: 40 }), { x: O[0] + 340, y: O[1] - 190, o: prog(t, cue(3) + 0.8, 0.4) });
    // 観察者（おねえちゃん）
    out += `<g transform="translate(${O[0]} ${O[1] + 6}) scale(0.24)">${sister(NOW.t, { pose: 'stand', eyes: 'open', mouth: 'smile', look: [6, -6] })}</g>`;
    out += g(badge(mv < 0.5 ? 'おひる' : 'ゆうがた', { fill: mv < 0.5 ? C.blueUi : '#c8602c', size: 36 }), { x: O[0] - 190, y: O[1] - 70, o: prog(t, 0.4, 0.4) });
    return out;
  },
});

// 9. おまけ：火星
SCENES.push({
  id: 'mars',
  draw(t) {
    const dk = eio(prog(t, cue(1) + 2.0, 2.4));
    const top = mix('#c58a55', '#5b4a52', dk), bot = mix('#ecc794', '#b88b6a', dk);
    let out = `<linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect width="1920" height="1080" fill="url(#msky)"/>`;
    const sx = lerp(1300, 1160, dk), sy = lerp(260, 700, dk);
    const halo = prog(t, cue(1) + 2.6, 1.6);
    out += `<radialGradient id="mhalo"><stop offset="0" stop-color="#cfe4ff" stop-opacity="0.95"/><stop offset="0.45" stop-color="#6fa6f0" stop-opacity="0.7"/><stop offset="1" stop-color="#6fa6f0" stop-opacity="0"/></radialGradient>`;
    out += `<circle cx="${sx}" cy="${sy}" r="${260}" fill="url(#mhalo)" opacity="${halo}"/>`;
    out += `<circle cx="${sx}" cy="${sy}" r="34" fill="#fffdf2"/>`;
    out += `<path d="M 0 790 Q 300 730 640 780 T 1300 760 T 1920 790 L 1920 1080 L 0 1080 Z" fill="${mix('#b8603a', '#6e3a2a', dk * 0.6)}"/>`;
    out += `<path d="M 0 880 Q 500 830 1000 890 T 1920 870 L 1920 1080 L 0 1080 Z" fill="${mix('#a0482a', '#5e2e22', dk * 0.6)}"/>`;
    [[300, 900, 1], [820, 930, 0.7], [1500, 910, 1.2]].forEach(([x, y, s]) => { out += `<ellipse cx="${x}" cy="${y}" rx="${46 * s}" ry="${24 * s}" fill="#7b3420"/>`; });
    out += pop(`<circle cx="-150" cy="0" r="40" fill="#c8552f"/><circle cx="-162" cy="-10" r="10" fill="#a8401f"/><circle cx="-136" cy="14" r="7" fill="#a8401f"/>` + g(badge('かせい', { fill: '#9a3f22', size: 44 }), { x: 30 }), t, 0.3, 960, 170);
    out += pop(badge('ひるは きいろっぽい ちゃいろ', { fill: 'rgba(60,40,30,0.75)', size: 40 }), t, cue(1) + 0.2, 520, 330, { end: cue(1) + 3.0 });
    out += pop(badge('ゆうひの まわりが あおい', { fill: '#2e5f9e', size: 42 }), t, cue(1) + 3.6, 1160, 380);
    const kO = prog(t, cue(1) + 0.6, 0.4);
    if (kO > 0) {
      out += g(chameleon(NOW.t, { holdLens: true, mouth: lineOf('K') ? 'open' : 'smile', eyeL: -14, eyeR: -14 }), { x: 230, y: 800, s: 0.7, o: kO });
      out += sayBubble('K', 330, 560, { tail: 'left' });
    }
    return out;
  },
});

// 10. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-432, 2, '空気が、光を 飛びちらせている', { size: 60, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['あおい ひかりが とびちる', C.blueUi], ['そら いっぱいに ひろがる', C.accent], ['ゆうがたは あかが のこる', '#c8602c']], t, 960, 660, { start: 2.6, step: 0.9 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const items = [
        [skyRect('lk0', 0, { x: -70, y: -46, w: 140, h: 92, rx: 14 }), 'たいように せなかを むけて、そらを みあげる', C.ink],
        [skyRect('lk1', 1, { x: -70, y: -46, w: 140, h: 92, rx: 14 }), 'ゆうがた、そらの したの ほうの いろを くらべる', C.ink],
        [`<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 }), 'たいようは ぜったいに ちょくせつ みない', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(110, 2, s, { size: 48, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 230, 360 + i * 150);
      });
      b += pop(chameleon(NOW.t, { holdLens: true }), t, cue(1) + 0.8, 1640, 850, { s: 0.9 });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 11. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「そらの いろ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

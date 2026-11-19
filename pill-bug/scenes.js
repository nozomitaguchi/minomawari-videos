// みのまわり図鑑 動画「ダンゴムシは、どうして丸くなる？」
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
  const str = 'みのまわり図鑑 ｜ ダンゴムシ', size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
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
// ---------- ダンゴムシの道具 ----------
const PB = { shell: '#5d6470', hi: '#8a929e', dark: '#3c424b', belly: '#e2cfb4', leg: '#474c55', dot: '#e9d6a2' };
const GROUND = { soil: '#c9a77c', soil2: '#b8946a', leaf: '#c98a3e', leaf2: '#a8692c', stone: '#a9a49a' };
// 横から見たダンゴムシ。x,y = 地面の中心、L = 体の長さ、k: 0 のびている → 1 まるい（頭は右）
function pillSide(x, y, L, k, { t = 0, walk = 0, legsK = null, antK = null, glowBack = 0, glowBelly = 0, plateHL = -1, flip = false, cousin = false } = {}) {
  const kk = clamp(k), lk = legsK == null ? kk : legsK, ak = antK == null ? kk : antK;
  const th = lerp(0.85, 2 * Math.PI * 0.985, eio(kk));
  const r = L / th, h = Math.min(L * 0.2, r * 0.999), ri = r - h;
  const a0 = -Math.PI / 2 - th / 2, a1 = -Math.PI / 2 + th / 2;
  // 一番下の点を地面に合わせる
  let maxy = -1e9;
  for (let i = 0; i <= 40; i++) { const a = a0 + (a1 - a0) * i / 40; maxy = Math.max(maxy, Math.sin(a) * r, Math.sin(a) * ri); }
  const cx = x, cy = y - maxy;
  const P = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  const col = cousin ? '#9a8a78' : PB.shell, colHi = cousin ? '#b9ab9a' : PB.hi, colDk = cousin ? '#6e6152' : PB.dark;
  let s = '';
  // 脚（7本、頭に近い側）
  if (lk < 1) {
    for (let i = 0; i < 7; i++) {
      const a = a1 - th * (0.1 + i * 0.075);
      const [px, py] = P(a, ri + 2);
      const sw = Math.sin(t * 13 + i * 1.3) * walk * 10;
      const len = (y - py + 4) * (1 - lk);
      s += `<line x1="${px}" y1="${py}" x2="${px + sw}" y2="${py + len}" stroke="${PB.leg}" stroke-width="${L * 0.012}" stroke-linecap="round"/>`;
    }
  }
  // おなか（うちがわ）
  if (kk < 0.97) {
    const n = 30; let d = '';
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; const [px, py] = P(a, ri + L * 0.012); d += (i ? ' L ' : 'M ') + px + ' ' + py; }
    s += `<path d="${d}" fill="none" stroke="${PB.belly}" stroke-width="${L * 0.03}" stroke-linecap="round"/>`;
    if (glowBelly > 0) s += `<path d="${d}" fill="none" stroke="#ffb3a0" stroke-width="${L * 0.05}" stroke-linecap="round" opacity="${glowBelly * (0.55 + 0.25 * Math.sin(t * 6))}"/>`;
  }
  // 背中の板
  const NP = 12;
  for (let i = 0; i < NP; i++) {
    const b0 = a0 + th * (i / NP) - 0.002, b1 = a0 + th * ((i + 1) / NP) + 0.002;
    const [o0x, o0y] = P(b0, r), [o1x, o1y] = P(b1, r), [i1x, i1y] = P(b1, ri), [i0x, i0y] = P(b0, ri);
    const head = i === NP - 1, tail = i === 0;
    const fill = head ? colDk : (plateHL === i ? '#e8b04a' : col);
    s += `<path d="M ${o0x} ${o0y} A ${r} ${r} 0 0 1 ${o1x} ${o1y} L ${i1x} ${i1y} A ${ri} ${ri} 0 0 0 ${i0x} ${i0y} Z" fill="${fill}" stroke="${colDk}" stroke-width="${L * 0.006}" stroke-linejoin="round"/>`;
    // つや
    const [h0x, h0y] = P(b0 + 0.01, r - h * 0.22), [h1x, h1y] = P(b1 - 0.01, r - h * 0.22);
    if (!head) s += `<path d="M ${h0x} ${h0y} A ${r - h * 0.22} ${r - h * 0.22} 0 0 1 ${h1x} ${h1y}" fill="none" stroke="${colHi}" stroke-width="${L * 0.01}" stroke-linecap="round" opacity="0.7"/>`;
  }
  if (glowBack > 0) {
    const [ox0, oy0] = P(a0, r), [ox1, oy1] = P(a1, r);
    s += `<path d="M ${ox0} ${oy0} A ${r} ${r} 0 ${th > Math.PI ? 1 : 0} 1 ${ox1} ${oy1}" fill="none" stroke="#ffd76a" stroke-width="${L * 0.025}" stroke-linecap="round" opacity="${glowBack * (0.6 + 0.3 * Math.sin(t * 6))}"/>`;
  }
  // 頭：目と触角
  const ah = a1 - th / NP / 2;
  const [ex, ey] = P(ah, ri + h * 0.55);
  s += `<circle cx="${ex}" cy="${ey}" r="${L * 0.012}" fill="#15171a"/>`;
  if (ak < 1) {
    const [bx, by] = P(a1, ri + h * 0.35);
    const dir = a1 + Math.PI / 2; // 進む向き
    const len = L * 0.26 * (1 - ak);
    const mx = bx + Math.cos(dir - 0.3) * len * 0.55, my = by + Math.sin(dir - 0.3) * len * 0.55;
    const tx = mx + Math.cos(dir + 0.6) * len * 0.5, ty = my + Math.sin(dir + 0.6) * len * 0.5 + Math.sin(t * 5) * 3;
    s += `<path d="M ${bx} ${by} L ${mx} ${my} L ${tx} ${ty}" fill="none" stroke="${PB.leg}" stroke-width="${L * 0.011}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return flip ? `<g transform="translate(${2 * x} 0) scale(-1 1)">${s}</g>` : s;
}
// 上から見たダンゴムシ（頭は右）。脚は14本
function pillTop(x, y, L, { t = 0, walk = 0, legHL = 0, cousin = false, dots = false, rot = 0 } = {}) {
  const W = L * 0.55, col = cousin ? '#9a8a78' : PB.shell, colDk = cousin ? '#6e6152' : PB.dark, colHi = cousin ? '#b9ab9a' : PB.hi;
  let s = '';
  for (let i = 0; i < 7; i++) {
    const px = -L * 0.28 + i * L * 0.085;
    const sw = Math.sin(t * 13 + i * 1.1) * walk * 8;
    [-1, 1].forEach((sd, j) => {
      const on = legHL > i * 2 + j;
      s += `<line x1="${px}" y1="${sd * W * 0.4}" x2="${px + sw * sd + L * 0.02}" y2="${sd * (W * 0.5 + L * 0.07)}" stroke="${on ? '#e8a23a' : PB.leg}" stroke-width="${L * (on ? 0.022 : 0.016)}" stroke-linecap="round"/>`;
    });
  }
  s += `<path d="M ${L * 0.38} ${-L * 0.1} Q ${L * 0.55} ${-L * 0.2} ${L * 0.6 + Math.sin(t * 5) * 4} ${-L * 0.3} M ${L * 0.38} ${L * 0.1} Q ${L * 0.55} ${L * 0.2} ${L * 0.6 - Math.sin(t * 5) * 4} ${L * 0.3}" fill="none" stroke="${PB.leg}" stroke-width="${L * 0.016}" stroke-linecap="round"/>`;
  s += `<ellipse cx="0" cy="0" rx="${L / 2}" ry="${W / 2}" fill="${col}" stroke="${colDk}" stroke-width="${L * 0.008}"/>`;
  for (let i = 1; i < 12; i++) {
    const px = -L / 2 + i * L / 12, yy = W / 2 * Math.sqrt(Math.max(0, 1 - Math.pow(px / (L / 2), 2)));
    s += `<path d="M ${px} ${-yy} Q ${px + L * 0.03} 0 ${px} ${yy}" fill="none" stroke="${colDk}" stroke-width="${L * 0.006}"/>`;
  }
  s += `<ellipse cx="${L * 0.05}" cy="${-W * 0.18}" rx="${L * 0.34}" ry="${W * 0.08}" fill="${colHi}" opacity="0.45"/>`;
  s += `<path d="M ${L * 0.5 - L * 0.085} ${-W * 0.42} Q ${L * 0.54} 0 ${L * 0.5 - L * 0.085} ${W * 0.42}" fill="${colDk}"/>`;
  if (dots) for (let i = 0; i < 10; i++) s += `<circle cx="${-L * 0.36 + i * L * 0.075}" cy="${(i % 2 ? 1 : -1) * W * 0.22}" r="${L * 0.012}" fill="${PB.dot}"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${s}</g>`;
}
// 地面・落ち葉・石
const leaf = (x, y, s, r, col = GROUND.leaf) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M -60 0 Q 0 -34 60 0 Q 0 34 -60 0 Z" fill="${col}"/><path d="M -60 0 L 60 0" stroke="${mix(col, '#000', 0.25)}" stroke-width="4"/></g>`;
const groundBG = (gy = 760) => `<rect width="1920" height="1080" fill="#eaf3e1"/><rect y="${gy}" width="1920" height="${1080 - gy}" fill="${GROUND.soil}"/>` +
  `<path d="M 0 ${gy} Q 480 ${gy - 18} 960 ${gy} T 1920 ${gy}" fill="${GROUND.soil}"/>` +
  leaf(220, gy + 40, 1.1, 12) + leaf(1650, gy + 60, 1.2, -18, GROUND.leaf2) + leaf(1280, gy + 120, 0.9, 30) + leaf(520, gy + 150, 1, -8, GROUND.leaf2) +
  `<ellipse cx="1660" cy="${gy - 10}" rx="200" ry="90" fill="${GROUND.stone}"/><ellipse cx="1620" cy="${gy - 40}" rx="120" ry="30" fill="#bdb8ae"/>`;
// ゆび
const finger = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M -26 -260 L -26 -40 Q -26 0 0 0 Q 26 0 26 -40 L 26 -260 Z" fill="${CH.skin}" stroke="${CH.skinShade}" stroke-width="5"/><path d="M -16 -40 Q 0 -30 16 -40 L 14 -16 Q 0 -8 -14 -16 Z" fill="#fbe8da"/></g>`;
// 敵・なかま
const frog = () => `<ellipse cx="0" cy="-50" rx="90" ry="60" fill="#6cbf5a"/><circle cx="-44" cy="-104" r="30" fill="#6cbf5a"/><circle cx="44" cy="-104" r="30" fill="#6cbf5a"/><circle cx="-44" cy="-106" r="14" fill="#fff"/><circle cx="44" cy="-106" r="14" fill="#fff"/><circle cx="-42" cy="-104" r="7" fill="${C.ink}"/><circle cx="46" cy="-104" r="7" fill="${C.ink}"/><path d="M -40 -50 Q 0 -26 40 -50" fill="none" stroke="#2f6a26" stroke-width="6" stroke-linecap="round"/><ellipse cx="-70" cy="-6" rx="34" ry="14" fill="#5aa94a"/><ellipse cx="70" cy="-6" rx="34" ry="14" fill="#5aa94a"/>`;
const mantis = () => `<g stroke="#5fae4a" stroke-linecap="round" fill="none"><path d="M -70 0 L -40 -60 M -10 0 L -20 -60 M 60 0 L 40 -60" stroke-width="8"/><path d="M -90 -70 L 40 -70" stroke-width="26"/><path d="M 40 -70 L 70 -150" stroke-width="18"/><path d="M 66 -130 L 110 -110 L 96 -70" stroke-width="12"/></g><path d="M 50 -150 L 100 -170 L 76 -132 Z" fill="#7cc95f"/><circle cx="84" cy="-158" r="7" fill="${C.ink}"/>`;
const spider = () => { let s = ''; for (let i = 0; i < 4; i++) { const a = -0.5 + i * 0.35; s += `<path d="M 0 -60 Q ${-60 - i * 10} ${-110 + i * 30} ${-110 - i * 6} ${-10 + i * 6}" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/><path d="M 0 -60 Q ${60 + i * 10} ${-110 + i * 30} ${110 + i * 6} ${-10 + i * 6}" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`; } return s + `<ellipse cx="0" cy="-70" rx="46" ry="40" fill="#3a3530"/><circle cx="0" cy="-118" r="24" fill="#3a3530"/><circle cx="-9" cy="-122" r="5" fill="#fff"/><circle cx="9" cy="-122" r="5" fill="#fff"/>`; };
const antIcon = (s = 1, col = C.ink) => `<g transform="scale(${s})"><circle cx="-34" cy="0" r="14" fill="${col}"/><circle cx="-6" cy="2" r="11" fill="${col}"/><ellipse cx="28" cy="4" rx="22" ry="16" fill="${col}"/><path d="M -40 -12 L -52 -32 M -30 -12 L -24 -34 M -6 10 L -18 28 M -6 10 L 6 28 M 20 16 L 14 32 M 30 16 L 38 32" stroke="${col}" stroke-width="5" stroke-linecap="round"/></g>`;
// 右向きのアリ（antIcon は頭が左。進む向きに頭を向けるために使う）
const antIconR = (s = 1, col = C.ink) => `<g transform="scale(-1,1)">${antIcon(s, col)}</g>`;
const shrimp = () => `<path d="M -90 -20 Q -40 -110 50 -80 Q 100 -60 90 -10 L 60 -20 Q 40 -50 0 -50 Q -40 -40 -60 0 Z" fill="#f08a6a"/><path d="M -90 -20 L -120 -50 L -120 10 Z" fill="#f08a6a"/><circle cx="66" cy="-66" r="6" fill="${C.ink}"/><path d="M 80 -70 Q 140 -110 170 -60 M 80 -64 Q 150 -80 160 -30" fill="none" stroke="#e0705a" stroke-width="4"/>${[0, 1, 2, 3].map(i => `<line x1="${-30 + i * 22}" y1="-40" x2="${-36 + i * 22}" y2="-8" stroke="#e0705a" stroke-width="5" stroke-linecap="round"/>`).join('')}`;
const crab = () => `<ellipse cx="0" cy="-50" rx="80" ry="50" fill="#e0613f"/><path d="M -70 -70 Q -120 -120 -100 -150 M 70 -70 Q 120 -120 100 -150" fill="none" stroke="#e0613f" stroke-width="14" stroke-linecap="round"/><path d="M -116 -150 Q -100 -190 -78 -156 Z M 116 -150 Q 100 -190 78 -156 Z" fill="#e0613f"/>${[-1, 1].map(sd => [0, 1, 2].map(i => `<path d="M ${sd * 60} ${-40 + i * 10} L ${sd * (110 + i * 6)} ${-10 + i * 16}" stroke="#d0532f" stroke-width="9" stroke-linecap="round"/>`).join('')).join('')}<circle cx="-24" cy="-96" r="9" fill="${C.ink}"/><circle cx="24" cy="-96" r="9" fill="${C.ink}"/>`;
const insectTop = () => `<g stroke="${C.ink}" stroke-width="6" stroke-linecap="round">${[-1, 1].map(sd => [-30, 0, 30].map(px => `<line x1="${px}" y1="0" x2="${px + 10}" y2="${sd * 70}"/>`).join('')).join('')}<path d="M 90 -10 Q 130 -50 150 -60 M 90 10 Q 130 50 150 60" fill="none"/></g><ellipse cx="-50" cy="0" rx="60" ry="30" fill="#7a5a3a"/><ellipse cx="20" cy="0" rx="30" ry="22" fill="#6a4a2a"/><circle cx="76" cy="0" r="20" fill="#5a3a1a"/>`;
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46 } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
const okMark = (x, y, s = 1, col = C.accent) => `<circle cx="${x}" cy="${y}" r="${54 * s}" fill="none" stroke="${col}" stroke-width="${16 * s}"/>`;
const drop = (x, y, s = 1, o = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -30 Q 22 0 18 12 Q 12 26 0 26 Q -12 26 -18 12 Q -22 0 0 -30 Z" fill="#5fb0e8" opacity="${o}"/>`;
const ripple = (x, y, t, t0) => { let s = ''; for (let k = 0; k < 3; k++) { const p = prog(t, t0 + k * 0.25, 0.9); if (p > 0 && p < 1) s += `<ellipse cx="${x}" cy="${y}" rx="${40 + 160 * p}" ry="${12 + 40 * p}" fill="none" stroke="${C.ochre}" stroke-width="6" opacity="${1 - p}"/>`; } return s; };

// 1. つかみ：さわると丸くなる
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = groundBG(760);
    const roll = eio(prog(t, cue(1) + 1.6, 0.6));
    const walkX = lerp(560, 960, clamp((t - 0.4) / Math.max(1, cue(1) + 1.4 - 0.4)));
    out += pillSide(walkX, 762, 520, roll, { t, walk: roll > 0 ? 0 : 1 });
    // ゆび
    const fd = prog(t, cue(1) + 0.4, 1.0), fu = prog(t, cue(1) + 1.9, 0.8);
    const fy = lerp(-40, 650, eio(fd)) - lerp(0, 700, eio(fu));
    if (fd > 0 && fu < 1) out += finger(walkX + 120, fy, 1.1);
    out += g(text(0, 0, 'くるん', { size: 64, w: 900, fill: C.ochre }), { x: walkX + 260, y: 560, o: win(t, cue(1) + 1.8, cue(1) + 3.6, 0.2) });
    // おねえちゃん
    const sT = talking('S');
    out += `<g transform="translate(250 820) scale(0.56)">${sister(NOW.t, { pose: sT ? 'point' : 'stand', eyes: t > cue(1) + 2 ? 'wide' : 'open', mouth: sT ? 'open' : 'smile', talk: sT, look: [7, 4] })}</g>`;
    out += sayBubble('S', 400, 470, { tail: 'left' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 960, y: 420, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${PB.dark}">ダンゴムシ</tspan>は、</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.ochre}">丸く</tspan>なる？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const rk = (Math.sin(t * 1.6) + 1) / 2;
      out += pop(pillSide(0, 0, 220, rk, { t }), t, t0 + 1.8, 960, 830);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'まるく なるのは なんのため？', { size: 76, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'ころがって、はやく にげるため'], ['②', 'おなかを かくして、からだを まもるため'], ['③', 'ねむるため']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 52, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(pillSide(0, 0, 500, 1, { t }) + text(130, -170, '？', { size: 90, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1660, 380);
    out += pop(`<g transform="scale(0.5)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', look: [-5, -7] })}</g>`, t, 0.0, 1690, 850, { d: 0.4 });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1520, y: 720, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 虫じゃない、エビやカニの仲間。脚は14本
SCENES.push({
  id: 'body',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.4, 0.4);
    if (aO > 0) {
      let a = pop(pillTop(0, 0, 420, { t }), t, 0.3, 960, 300);
      a += pop(badge('ダンゴ「ムシ」', { fill: PB.dark, size: 46 }), t, 0.8, 960, 120);
      a += pop(insectTop() + cross(20, 0, 0.9), t, cue(0) + 2.2, 420, 330);
      a += g(text(0, 0, 'こんちゅうでは ない', { size: 44, w: 900, fill: C.redUi }), { x: 420, y: 460, o: prog(t, cue(0) + 2.8, 0.3) });
      a += pop(shrimp(), t, cue(1) + 0.6, 760, 720, { s: 1.4 });
      a += pop(crab(), t, cue(1) + 1.0, 1180, 720, { s: 1.3 });
      a += pop(badge('エビや カニの なかま', { fill: '#d0532f', size: 46 }), t, cue(1) + 1.8, 1550, 560);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      const n = Math.floor(clamp((t - cue(2) - 0.4) / 0.2, 0, 14));
      let b = pillTop(760, 430, 640, { t, legHL: n });
      b += g(`<circle r="80" fill="${C.ochre}"/>` + text(0, 4, n, { size: 80, w: 900, fill: '#fff' }), { x: 1340, y: 380, o: prog(t, cue(2) + 0.3, 0.3) });
      b += g(text(0, 0, 'ほん', { size: 50, w: 900, fill: C.ochre, anchor: 'start' }), { x: 1430, y: 390, o: prog(t, cue(2) + 0.3, 0.3) });
      b += pop(insectTop(), t, cue(2) + 3.6, 1360, 640, { s: 0.8 });
      b += g(text(0, 0, 'こんちゅうは 6ぽん', { size: 42, w: 900, fill: C.muted, anchor: 'start' }), { x: 1500, y: 640, o: prog(t, cue(2) + 3.9, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 4. かたい背中、やわらかいおなか
SCENES.push({
  id: 'shell',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const gb = win(t, cue(0) + 0.6, cue(1) - 0.2, 0.3);
    const hl = t > cue(1) + 0.6 && t < cue(2) - 0.2 ? Math.floor((t - cue(1) - 0.6) / 0.25) % 12 : -1;
    const bel = prog(t, cue(2) + 0.4, 0.4);
    out += pop(pillSide(0, 0, 1100, 0, { t, walk: 0.3, glowBack: gb, plateHL: hl, glowBelly: bel }), t, 0.2, 960, 720);
    out += callout(1100, 440, 1240, 170, 'かたい から', prog(t, cue(0) + 1.0, 0.4), { col: PB.dark, size: 50 });
    out += callout(800, 470, 1240, 300, 'ゆみのように まがった いた', prog(t, cue(1) + 0.8, 0.4), { col: C.ochre, size: 42 });
    out += callout(960, 520, 1360, 820, 'やわらかい おなか', bel, { col: C.redUi, size: 50 });
    return out;
  },
});

// 5. 敵が近づくと丸くなる
SCENES.push({
  id: 'enemy',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      const E = [[frog(), 'カエル', 360], [mantis(), 'カマキリ', 760], [spider(), 'クモ', 1160], [antIcon(2.2), 'アリ', 1560]];
      const st = [0.6, 2.2, 3.6, 4.6];
      let a = '';
      E.forEach(([ic, nm, x], i) => {
        a += pop(ic, t, cue(0) + st[i], x, nm === 'アリ' ? 510 : 540) + g(text(0, 0, nm, { size: 50, w: 900 }), { x, y: 640, o: prog(t, cue(0) + st[i] + 0.2, 0.3) });
      });
      a += pop(badge('ダンゴムシを たべる てき', { fill: C.redUi, size: 48 }), t, cue(0) + 0.2, 960, 220);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.4);
    if (bO > 0) {
      let b = `<rect y="780" width="1920" height="300" fill="${GROUND.soil}"/>`;
      const roll = eio(prog(t, cue(1) + 1.6, 0.6));
      b += pillSide(1000, 782, 520, roll, { t, walk: roll > 0 ? 0 : 0.8, glowBelly: win(t, cue(1) + 0.6, cue(1) + 1.8, 0.2) });
      const ax = lerp(200, 560, eo(prog(t, cue(1), 2.0)));
      b += g(antIconR(2.4), { x: ax, y: 740 });  // 右へ進むので右向き
      b += g(badge('おなかを かくす', { fill: C.redUi, size: 44 }), { x: 1000, y: 380, o: win(t, cue(1) + 2.2, cue(1) + 5.0, 0.3) });
      b += g(badge('かたい からで まもる', { fill: PB.dark, size: 44 }), { x: 1000, y: 380, o: prog(t, cue(1) + 5.0, 0.3) });
      const bT = talking('B');
      b += pop(`<g transform="scale(0.46)">${brother(NOW.t, { pose: bT ? 'cheer' : 'stand', eyes: 'wide', mouth: 'open', hop: bT ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, cue(1) + 3.0, 1600, 780);
      b += sayBubble('B', 1500, 500, { tail: 'right' });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 6. きっかけ：さわる・ゆれ・触角・笛の音
SCENES.push({
  id: 'trigger',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      let a = `<rect y="700" width="1920" height="380" fill="${GROUND.soil}"/>`;
      // さわる
      const r1 = eio(prog(t, cue(0) + 1.4, 0.5));
      a += pillSide(560, 702, 380, r1, { t, walk: r1 > 0 ? 0 : 0.7 });
      const fd = prog(t, cue(0) + 0.4, 0.9), fu = prog(t, cue(0) + 1.6, 0.6);
      if (fd > 0 && fu < 1) a += finger(650, lerp(-40, 610, eio(fd)) - lerp(0, 650, eio(fu)), 0.9);
      a += g(badge('さわる', { fill: C.ochre, size: 46 }), { x: 560, y: 320, o: prog(t, cue(0) + 0.6, 0.3) });
      // ゆれ
      const r2 = eio(prog(t, cue(0) + 3.4, 0.5));
      const sh = Math.sin(t * 40) * 6 * win(t, cue(0) + 2.8, cue(0) + 3.6, 0.1);
      a += g(pillSide(1360, 702, 380, r2, { t, walk: r2 > 0 ? 0 : 0.7 }), { x: sh });
      a += ripple(1360, 710, t, cue(0) + 2.8);
      a += g(badge('ゆれ', { fill: C.ochre, size: 46 }), { x: 1360, y: 320, o: prog(t, cue(0) + 2.8, 0.3) });
      out += g(a, { o: aO });
    }
    // 触角
    const bO = win(t, cue(1) - 0.3, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      let b = pillSide(760, 760, 800, 0, { t, walk: 0.2 });
      b += `<circle cx="1200" cy="720" r="110" fill="none" stroke="${C.ochre}" stroke-width="8" opacity="${0.5 + 0.3 * Math.sin(t * 5)}"/>`;
      b += callout(1220, 690, 1400, 420, 'しょっかく', prog(t, cue(1) + 0.4, 0.4), { col: C.ochre, size: 48 });
      b += chipsRow([['かたち', C.blueUi], ['かたさ', C.accent], ['におい', C.redUi]], t, 1400, 260, { size: 40, start: cue(1) + 1.6, step: 0.6 });
      out += g(b, { o: bO });
    }
    // 電子ホイッスル
    const cO = prog(t, cue(2) - 0.3, 0.4);
    if (cO > 0) {
      let c = `<rect y="740" width="1920" height="340" fill="${GROUND.soil}"/>`;
      const blow = cue(2) + 3.2, stop = t > blow + 0.3;
      for (let i = 0; i < 5; i++) {
        const x0 = 380 + i * 280, run = stop ? blow + 0.3 : t;
        const x = x0 + Math.sin(run * 0.6 + i) * 40;
        c += pillSide(x, 742, 200, 0, { t: stop ? blow : t, walk: stop ? 0 : 0.8 });
      }
      let wh = `<rect x="-90" y="-40" width="180" height="80" rx="20" fill="#5b6f8a"/><rect x="60" y="-20" width="60" height="40" rx="8" fill="#3e4e64"/><circle cx="-30" cy="0" r="14" fill="#cfe0f2"/>`;
      for (let k = 0; k < 3; k++) { const p = ((t - blow) * 1.2 + k / 3) % 1; if (t > blow) wh += `<path d="M ${150 + p * 120} ${-50 - p * 30} Q ${180 + p * 140} 0 ${150 + p * 120} ${50 + p * 30}" fill="none" stroke="${C.ochre}" stroke-width="7" opacity="${1 - p}"/>`; }
      c += pop(wh, t, cue(2) + 1.8, 300, 420);
      c += pop(badge('でんし ホイッスル', { fill: '#5b6f8a', size: 40 }), t, cue(2) + 2.2, 330, 300);
      c += pop(badge('5ひきとも とまった', { fill: C.accent, size: 50 }), t, blow + 1.2, 1150, 420);
      c += pop(badge('とうきょうの こどもたちの けんきゅう', { fill: C.ochre, size: 38 }), t, cue(2) + 0.4, 1100, 170);
      out += g(c, { o: cO });
    }
    return out;
  },
});

// 7. すき間なく丸まる
SCENES.push({
  id: 'ball',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const bend = eio(prog(t, cue(0) + 1.0, 3.0)) * 0.72;
    const ak = eio(prog(t, cue(1) + 0.6, 1.4));
    const lk = Math.max(bend, eio(prog(t, cue(2) + 0.4, 1.4)));
    const fin = eio(prog(t, cue(3) + 0.2, 1.0));
    const k = lerp(bend, 1, fin);
    out += pillSide(960, 800, 1300, k, { t, legsK: lk, antK: Math.max(ak, fin), glowBack: win(t, cue(0) + 0.6, cue(1) - 0.2, 0.3), glowBelly: win(t, cue(0) + 0.6, cue(1) - 0.2, 0.3) });
    out += g(badge('せなかの いた', { fill: PB.dark, size: 42 }) , { x: 960, y: 150, o: win(t, cue(0) + 0.8, cue(1) - 0.2, 0.3) });
    out += g(badge('おなかの きんにく', { fill: C.redUi, size: 42 }), { x: 1500, y: 560, o: win(t, cue(0) + 1.4, cue(1) - 0.2, 0.3) });
    out += g(badge('ぎゅっ', { fill: C.ochre, size: 50 }), { x: 1560, y: 300, o: win(t, cue(0) + 3.0, cue(1) - 0.2, 0.3) });
    out += g(badge('しょっかくは あたまの くぼみへ', { fill: C.ochre, size: 42 }), { x: 1460, y: 220, o: win(t, cue(1) + 0.4, cue(2) - 0.2, 0.3) });
    out += g(badge('あしは おなかの みぞへ', { fill: C.blueUi, size: 42 }), { x: 1460, y: 220, o: win(t, cue(2) + 0.2, cue(3) - 0.2, 0.3) });
    out += pop(badge('すきまの ない まんまるの たま', { fill: C.accent, size: 46 }), t, cue(3) + 1.2, 960, 160);
    const kO = prog(t, cue(4) - 0.6, 0.4);
    if (kO > 0) {
      out += g(chameleon(NOW.t, { holdLens: true, mouth: lineOf('K') ? 'open' : 'smile' }), { x: 300, y: 820, s: 0.62, o: kO });
      out += sayBubble('K', 380, 600, { tail: 'left' });
    }
    return out;
  },
});

// 8. 本当に守れる？ アリとの実験
SCENES.push({
  id: 'protect',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(3) - 0.3, 0.4);
    if (aO > 0) {
      let a = '';
      a += pop(text(0, 0, 'ほんとうに まもれる？', { size: 64, w: 900 }), t, 0.3, 960, 150);
      const arena = (x, cous) => {
        let s = `<circle cx="${x}" cy="520" r="250" fill="#e3cfa9" stroke="#b8946a" stroke-width="10"/>`;
        const rolled = !cous && t > cue(2) - 0.6;
        s += rolled ? pillSide(x, 560, 230, 1, { t }) : pillTop(x, 520, 220, { t, cousin: cous, walk: cous ? 0.5 : 0.3 });
        const nA = cous ? 6 : 2, bite = t > cue(2) + 0.2;
        for (let i = 0; i < nA; i++) {
          const ang = i / nA * Math.PI * 2 + t * 0.3 * (bite ? 0 : 1) + (cous ? 0 : 1.2);
          const rr = bite && cous ? 120 : 190;
          // 回っているあいだは進む向き（円の接線）に頭を向け、止まったら真ん中を向く
          s += g(antIcon(0.9), { x: x + Math.cos(ang) * rr, y: 520 + Math.sin(ang) * rr * 0.8, r: ang * 57 + (bite ? 0 : -90) });
          if (bite && cous) s += g(text(0, 0, 'がぶっ', { size: 30, w: 900, fill: C.redUi }), { x: x + Math.cos(ang) * 210, y: 520 + Math.sin(ang) * 180, o: 0.5 + 0.5 * Math.sin(t * 8 + i) });
        }
        return s;
      };
      a += pop(arena(600, false), t, cue(1) + 0.6, 0, 0, { s: 1 });
      a += pop(arena(1320, true), t, cue(1) + 1.4, 0, 0, { s: 1 });
      a += g(text(600, 820, 'ダンゴムシ', { size: 44, w: 900 }), { o: prog(t, cue(1) + 1.0, 0.3) });
      a += g(text(1320, 820, 'まるく なれない なかま', { size: 44, w: 900, fill: '#7a6a58' }), { o: prog(t, cue(1) + 1.8, 0.3) });
      a += pop(badge('アメリカの けんきゅう', { fill: C.blueUi, size: 40 }), t, cue(1) + 0.3, 960, 250, { end: cue(2) + 0.6 });
      a += pop(badge('たくさん おそわれた', { fill: C.redUi, size: 44 }), t, cue(2) + 1.0, 1320, 240);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(3) - 0.3, 0.4);
    if (bO > 0) {
      let b = `<rect y="760" width="1920" height="320" fill="${GROUND.soil}"/>`;
      b += pillSide(960, 762, 900, 1, { t });
      const R0 = 900 / (2 * Math.PI * 0.985), BC = 762 - R0;
      b += `<path d="M ${960 - R0 * 0.6} ${BC - R0 * 0.6} A ${R0 * 0.85} ${R0 * 0.85} 0 0 1 ${960 + R0 * 0.1} ${BC - R0 * 0.85}" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.6"/>`;
      // つるっとすべるアリ
      const p = ((t - cue(3)) * 0.45) % 1;
      const ang = -Math.PI * 0.55 + p * Math.PI * 0.55;
      b += g(antIconR(1.3), { x: 960 + Math.cos(ang) * (R0 + 26), y: BC + Math.sin(ang) * (R0 + 26), r: ang * 57 + 90 });  // 右へすべるので右向き
      b += pop(badge('つるつる', { fill: C.blueUi, size: 50 }), t, cue(3) + 0.6, 960, 200);
      b += pop(badge('かみつく ところが ない', { fill: C.redUi, size: 42 }), t, cue(3) + 2.4, 1500, 420);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 9. 水も守る
SCENES.push({
  id: 'water',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      let a = pop(badge('かわいた くうき', { fill: C.ochre, size: 44 }), t, 0.3, 960, 160);
      const drops = (x, y, n, t0) => {
        let s = '';
        for (let i = 0; i < n; i++) {
          const p = ((t - t0) * 0.45 + i / n) % 1;
          if (t < t0) continue;
          const ang = -Math.PI / 2 + (i - (n - 1) / 2) * 0.55;
          s += drop(x + Math.cos(ang) * (150 + p * 160), y + Math.sin(ang) * (110 + p * 160), 1.2, 1 - p);
        }
        return s;
      };
      a += pop(pillSide(0, 0, 440, 0, { t, walk: 0.3 }), t, 0.6, 560, 720);
      a += drops(560, 600, 3, cue(0) + 1.2);
      a += pop(pillSide(0, 0, 440, 1, { t }), t, cue(0) + 2.6, 1360, 720);
      a += drops(1360, 640, 2, cue(0) + 3.0);
      a += g(text(560, 790, 'のびている', { size: 44, w: 900 }), { o: prog(t, 0.8, 0.3) });
      a += g(text(1360, 790, 'まるい', { size: 44, w: 900 }), { o: prog(t, cue(0) + 2.8, 0.3) });
      a += pop(badge('にげる みずが 3ぶんの1ほど へる', { fill: '#3d84b8', size: 44 }), t, cue(0) + 4.4, 1360, 330);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.4);
    if (bO > 0) {
      let b = '';
      // しめった石の下 ○、日なた ✕
      b += `<rect x="200" y="300" width="680" height="460" rx="30" fill="#8a7a62"/><ellipse cx="540" cy="360" rx="300" ry="90" fill="${GROUND.stone}"/>`;
      b += pillSide(540, 700, 300, 0, { t, walk: 0.4 }) + drop(400, 540, 0.9) + drop(700, 560, 0.8);
      b += okMark(540, 230, 0.9) + text(540, 805, 'しめった ところ', { size: 44, w: 900 });
      b += `<rect x="1040" y="300" width="680" height="460" rx="30" fill="#f2dfa8"/>` + sunDisc(1600, 380, 50, 0.2);
      b += pillSide(1380, 700, 300, 0, { t }) + cross(1380, 230, 0.7) + text(1380, 805, 'かわいた ところ', { size: 44, w: 900 });
      b += pop(badge('かわくと いきが できない', { fill: C.redUi, size: 40 }), t, cue(1) + 2.0, 1380, 520);
      out += g(b, { o: bO });
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
      let a = pop(card(1300, 170) + `<circle cx="-560" cy="0" r="50" fill="${C.accent}"/>` + text(-560, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-462, 2, 'おなかを かくして、からだを まもるため', { size: 54, w: 900, anchor: 'start' }), t, 0.4, 960, 300);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 400, y: 300, o: ring, s: Math.max(back(ring), 0.001) });
      a += pop(pillSide(0, 0, 420, (Math.sin(t * 1.5) + 1) / 2, { t }), t, 2.4, 960, 640);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 170);
      const warn = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
      const items = [
        [g(pillSide(0, 48, 300, 1, { t: 0 })), 'しょっかくや あしは みえている？', C.ink, cue(1)],
        [g(pillSide(0, 48, 300, 1, { t: 0 })) + `<circle r="62" fill="none" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="8 8"/>`, 'まるい からだに すきまは ある？', C.ink, cue(1) + 3.4],
        [g(pillSide(-8, 26, 150, 0.1, { t, walk: 1 })), 'しばらく まつと、のびて あるきだす', C.ink, cue(2)],
        [warn, 'さわらない・ゆらさない。みるだけ', C.red, cue(3)],
      ];
      items.forEach(([ic, s, col, st], i) => {
        b += pop(ic + text(110, 2, s, { size: 46, w: 900, anchor: 'start', fill: col }), t, st, 230, 320 + i * 130);
      });
      b += pop(chameleon(NOW.t, { holdLens: true }), t, cue(1) + 0.8, 1660, 820, { s: 0.75 });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ダンゴムシ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    out += pop(`<g transform="scale(0.52)">${sister(NOW.t, { pose: 'wave', eyes: 'smile', mouth: 'open', talk: talking('S') })}</g>`, t, 0.8, 150, 1060, { d: 0.45 });
    out += pop(`<g transform="scale(0.52)">${brother(NOW.t + 1, { pose: 'cheer', eyes: 'smile', mouth: 'open', hop: talking('B') ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, 1.0, 310, 1060, { d: 0.45 });
    out += pop(chameleon(NOW.t, { holdLens: true }), t, 1.2, 1660, 1040, { s: 0.7 });
    out += sayBubble('S', 150, 610, { size: 44 }) + sayBubble('B', 250, 730, { size: 44 });
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

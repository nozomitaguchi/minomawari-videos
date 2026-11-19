// みのまわり図鑑 動画「エレベーターは、どうやって上がる？」
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
  const str = 'みのまわり図鑑 ｜ エレベーター', size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
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
// ---------- エレベーターの道具 ----------
const EL = {
  wall: '#f3e9d6', wallLine: '#e0d3b8', shaft: '#e2dccf', shaftDark: '#cfc6b4', room: '#d8cbb0',
  cage: '#f7f3ea', cageLine: '#7b8794', steel: '#9aa5b1', steelDark: '#6d7883', rope: '#4a4f55',
  weight: '#5d6670', motor: '#4f6f5f', rail: '#8a7a64',
};
// たて断面の建物。cy = かごの上のはしの y（300 が最上階、620 が1階）
const SH = { x0: 730, x1: 1110, top: 250, bot: 830, sx: 960, sy: 160, sr: 90, K: 920, cageW: 230, cageH: 180, cwW: 64, cwH: 170 };
const cageX = () => SH.sx - SH.sr, cwX = () => SH.sx + SH.sr;
const floorY = f => 620 - (f - 1) * (320 / 3); // f=1..4 のときの かごの上のはし
// 人のかたち（かごの中の人）
const person = (x, y, s = 1, col = '#7d8fa3') => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-92" r="18" fill="${col}"/><path d="M -22 -68 Q 0 -76 22 -68 L 26 -20 L 14 -20 L 12 0 L -12 0 L -14 -20 L -26 -20 Z" fill="${col}"/></g>`;
// 滑車（綱車）
const sheave = (x, y, r, ang = 0) => {
  let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="${EL.steel}" stroke="${EL.steelDark}" stroke-width="8"/>` +
    `<circle cx="${x}" cy="${y}" r="${r - 18}" fill="none" stroke="${EL.steelDark}" stroke-width="4" opacity="0.6"/>`;
  for (let k = 0; k < 4; k++) {
    const a = ang + k * Math.PI / 4;
    s += `<line x1="${x - Math.cos(a) * (r - 20)}" y1="${y - Math.sin(a) * (r - 20)}" x2="${x + Math.cos(a) * (r - 20)}" y2="${y + Math.sin(a) * (r - 20)}" stroke="${EL.steelDark}" stroke-width="7" stroke-linecap="round"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="16" fill="${EL.steelDark}"/>`;
};
// ロープ（n 本を少しずつずらして描く）
const ropeLine = (x1, y1, x2, y2, n = 1, col = EL.rope, w = 7) => {
  let s = '';
  for (let k = 0; k < n; k++) { const d = (k - (n - 1) / 2) * 11; s += `<line x1="${x1 + d}" y1="${y1}" x2="${x2 + d}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; }
  return s;
};
// かご（x は中央、y は上のはし）
const cageBox = (x, y, w, h, { kids = 0, people = 0, t = 0, door = 0 } = {}) => {
  let s = `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="10" fill="${EL.cage}" stroke="${EL.cageLine}" stroke-width="7"/>`;
  s += `<rect x="${x - w / 2 + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" rx="6" fill="#fdfaf3"/>`;
  s += `<rect x="${x - 26}" y="${y - 14}" width="52" height="16" rx="5" fill="${EL.steelDark}"/>`;
  for (let k = 0; k < people; k++) s += person(x - w / 2 + 36 + k * ((w - 72) / Math.max(1, people - 1)), y + h - 10, 0.92 * h / 180, ['#7d8fa3', '#a3867d', '#8aa37d', '#9a86b0', '#b09a6a'][k % 5]);
  if (kids) {
    s += `<g transform="translate(${x - w * 0.18} ${y + h - 8}) scale(${h / 180 * 0.33})">${sister(t, { pose: 'stand', eyes: 'open', mouth: 'smile', look: [0, -6] })}</g>`;
    s += `<g transform="translate(${x + w * 0.2} ${y + h - 8}) scale(${h / 180 * 0.33})">${brother(t + 1, { pose: 'stand', eyes: 'open', mouth: 'smile', look: [0, -6] })}</g>`;
  }
  return s;
};
// 建物のたて断面と、エレベーターのしくみ一式
function shaftView(cy, { spin = 0, ropes = 1, cw = true, motor = true, label = {}, t = 0, kids = 0, people = 0, cwO = 1, hl = null } = {}) {
  const { x0, x1, top, bot, sx, sy, sr, K } = SH;
  let s = `<rect x="600" y="${top}" width="720" height="${bot - top}" fill="${EL.wall}"/>`;
  for (let f = 0; f <= 3; f++) { const y = top + 50 + f * (320 / 3) + 180 - 50; }
  for (let f = 1; f <= 4; f++) {
    const fy = floorY(f) + SH.cageH; // その階の床
    s += `<rect x="600" y="${fy}" width="720" height="12" fill="${EL.wallLine}"/>`;
    s += text(650, fy - 40, f, { size: 40, w: 900, fill: '#b6a888' });
  }
  s += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${bot - top}" fill="${EL.shaft}"/>`;
  s += `<rect x="${x0}" y="${top}" width="10" height="${bot - top}" fill="${EL.shaftDark}"/><rect x="${x1 - 10}" y="${top}" width="10" height="${bot - top}" fill="${EL.shaftDark}"/>`;
  s += `<rect x="600" y="${bot}" width="720" height="16" fill="${EL.wallLine}"/>`;
  // きかいしつ
  s += `<rect x="660" y="56" width="600" height="${top - 56}" rx="12" fill="${EL.room}"/>`;
  s += `<path d="M 640 60 L 960 20 L 1280 60" fill="none" stroke="#b9a88a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (motor) {
    s += `<rect x="${sx + 20}" y="${sy - 44}" width="${hl === 'motor' ? 190 : 170}" height="88" rx="16" fill="${EL.motor}"/>`;
    s += `<rect x="${sx + 196}" y="${sy - 30}" width="24" height="60" rx="6" fill="${mix(EL.motor, '#000', 0.25)}"/>`;
  }
  const cwY = K - cy;
  // ロープ
  s += `<path d="M ${sx - sr} ${sy} A ${sr} ${sr} 0 0 1 ${sx + sr} ${sy}" fill="none" stroke="${EL.rope}" stroke-width="${7 + (ropes - 1) * 6}" stroke-linecap="round"/>`;
  s += sheave(sx, sy, sr, spin);
  s += ropeLine(cageX(), sy, cageX(), cy - 14, ropes);
  if (cw) s += g(ropeLine(cwX(), sy, cwX(), cwY, ropes) + `<rect x="${cwX() - SH.cwW / 2}" y="${cwY}" width="${SH.cwW}" height="${SH.cwH}" rx="8" fill="${EL.weight}"/>` +
    [1, 2, 3, 4].map(k => `<line x1="${cwX() - SH.cwW / 2 + 8}" y1="${cwY + k * SH.cwH / 5}" x2="${cwX() + SH.cwW / 2 - 8}" y2="${cwY + k * SH.cwH / 5}" stroke="#48505a" stroke-width="4"/>`).join(''), { o: cwO });
  s += cageBox(cageX(), cy, SH.cageW, SH.cageH, { kids, people, t });
  return s;
}
// 引き出し線つきのラベル
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46, anchor = null } = {}) => {
  if (o <= 0) return '';
  const an = anchor || (tx < x ? 'end' : 'start');
  return g(`<line x1="${x}" y1="${y}" x2="${tx + (an === 'end' ? 14 : -14)}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - tw(str, size, 900) - 30 : tx - 14}" y="${ty - size * 0.8}" width="${tw(str, size, 900) + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
const arrow = (x1, y1, x2, y2, col = C.ink, w = 10) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
};
const okMark = (x, y, s = 1, col = C.accent) => `<circle cx="${x}" cy="${y}" r="${54 * s}" fill="none" stroke="${col}" stroke-width="${16 * s}"/>`;
const weightLabel = (str = 'おもい！') => badge(str, { fill: C.redUi, size: 40 });

// 1. つかみ：ボタンをおすと、へやが上がる
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // かごが1階から4階へ
    const up = eio(prog(t, cue(0) + 1.2, 4.2));
    const cy = lerp(floorY(1), floorY(4), up);
    const people = t > cue(2) ? Math.min(5, Math.floor((t - cue(2)) / 0.35) + 1) : 0;
    let sv = shaftView(cy, { cw: false, motor: false, t: NOW.t, kids: people ? 0 : 1, people });
    // きかいしつは かくしておく（？）
    sv += `<rect x="660" y="56" width="600" height="194" rx="12" fill="${EL.room}"/>`;
    const qO = prog(t, cue(3), 0.4);
    sv += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 960, y: 158, o: qO, s: lerp(1.3, 1, eo(qO)) });
    sv += g(ropeLine(cageX(), 250, cageX(), cy - 14, 1, EL.rope), { o: qO });
    out += g(sv, { o: 1 });
    // ボタン
    const press = t > cue(0) + 0.6 && t < cue(0) + 1.3;
    out += g(`<rect x="-70" y="-120" width="140" height="240" rx="24" fill="${EL.steel}"/><circle cx="0" cy="-40" r="40" fill="${press || t > cue(0) + 0.6 ? '#ffd76a' : '#e9edf0'}" stroke="${EL.steelDark}" stroke-width="6"/>` +
      `<path d="M -18 -30 L 0 -56 L 18 -30 Z" fill="${C.ink}"/><circle cx="0" cy="50" r="40" fill="#e9edf0" stroke="${EL.steelDark}" stroke-width="6"/><path d="M -18 40 L 0 66 L 18 40 Z" fill="${C.ink}"/>`,
      { x: 1520, y: 470, s: press ? 0.96 : 1, o: prog(t, 0.2, 0.4) * (1 - prog(t, cue(1) - 0.3, 0.4)) });
    // 上がる矢印
    out += g(arrow(470, 640, 470, 330, C.accent, 14), { o: win(t, cue(0) + 1.2, cue(0) + 5.6, 0.3) });
    out += g(text(0, 0, 'すーっ', { size: 54, w: 900, fill: C.accent }), { x: 470, y: 270, o: win(t, cue(0) + 1.6, cue(0) + 5.6, 0.3) });
    // 吹き出し（おねえちゃん、かごの外）
    const sT = talking('S');
    out += pop(`<g transform="scale(0.56)">${sister(NOW.t, { pose: sT ? 'point' : 'stand', eyes: 'wide', mouth: sT ? 'open' : 'smile', talk: sT, look: [-6, -8] })}</g>`, t, cue(0) + 5.0, 1560, 845, { end: cue(2) - 0.2 });
    out += sayBubble('S', 1500, 470, { tail: 'right' });
    // 重いへや
    out += pop(weightLabel('おもい へや'), t, cue(2) + 1.0, 1470, 500);
    out += g(arrow(1300, 500, 1060, 420, C.redUi, 9), { o: prog(t, cue(2) + 1.2, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">エレベーター</tspan>は、</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうやって <tspan fill="${C.redUi}">上がる</tspan>？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const bob = Math.sin(t * 2) * 10;
      out += pop(cageBox(0, -90 + bob, 150, 120) + ropeLine(0, -260, 0, -104 + bob) + arrow(130, 30, 130, -110, C.accent, 10), t, t0 + 1.8, 960, 820);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'ロープの はんたいがわには なにが ある？', { size: 70, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'おおきな ばね'], ['②', 'へやと おなじくらい おもい おもり'], ['③', 'なにも ついていない']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 54, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    // 右の小さな図：滑車・かご・？
    let fig = sheave(0, 0, 50, t * 0.6) + `<path d="M -50 0 A 50 50 0 0 1 50 0" fill="none" stroke="${EL.rope}" stroke-width="7"/>` +
      ropeLine(-50, 0, -50, 150) + cageBox(-50, 164, 110, 90) + ropeLine(50, 0, 50, 120) +
      `<circle cx="50" cy="170" r="46" fill="#fff" stroke="${C.ochre}" stroke-width="6" stroke-dasharray="12 9"/>` + text(50, 174, '？', { size: 60, w: 900, fill: C.ochre });
    out += pop(fig, t, cue(0) + 0.6, 1690, 250, { s: 1.15 });
    out += pop(`<g transform="scale(0.5)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', look: [-5, -7] })}</g>`, t, 0.0, 1690, 850, { d: 0.4 });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1520, y: 720, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. かごとロープ、上のモーター
SCENES.push({
  id: 'cage',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const cy = floorY(2) + Math.sin(t * 0.8) * 4;
    const mO = prog(t, cue(2) - 0.2, 0.5);
    let sv = shaftView(cy, { cw: false, motor: mO > 0, t: NOW.t, kids: 1 });
    // おもりはまだ見せない：右のロープも かくす
    out += sv;
    // 最初は きかいしつを かくしておき、モーターの行で見せる
    out += g(`<rect x="660" y="56" width="600" height="194" rx="12" fill="${EL.room}"/>` + ropeLine(cageX(), 250, cageX(), cy - 14), { o: 1 - mO });
    // ロープの行：ロープを上から下へなぞる光
    const rk = prog(t, cue(1) + 0.3, 1.2);
    if (rk > 0 && rk < 1) out += `<circle cx="${cageX()}" cy="${lerp(250, cy - 20, rk)}" r="16" fill="${C.yellow}" opacity="0.9"/>`;
    out += callout(cageX() - SH.cageW / 2, cy + 90, 470, cy + 90, 'かご', prog(t, cue(0) + 0.8, 0.4), { col: C.blueUi, size: 54 });
    out += callout(cageX() - 4, 420, 470, 380, 'ロープ', prog(t, cue(1) + 0.6, 0.4), { col: C.ink, size: 50 });
    out += callout(SH.sx + 120, SH.sy, 1460, 170, 'モーター', prog(t, cue(2) + 0.8, 0.4), { col: C.accent, size: 50 });
    out += callout(1250, 200, 1460, 320, 'たてものの うえ', prog(t, cue(2) + 1.6, 0.4), { col: C.ochre, size: 40 });
    return out;
  },
});

// 4. 車（滑車）とロープ：巻きとらず、こすれる力で送る
SCENES.push({
  id: 'sheave',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const X = 960, Y = 360, R = 190;
    const run = prog(t, cue(0) + 0.8, 0.6);
    const sp = t > cue(0) + 0.8 ? (t - cue(0) - 0.8) * 1.2 * run : 0;
    const bO = 1 - prog(t, cue(1) - 0.3, 0.4) * (1 - prog(t, cue(2) - 0.4, 0.5));
    // 大きな滑車
    let a = `<rect x="${X}" y="${Y - 16}" width="${R + 80}" height="32" fill="${EL.steelDark}"/><rect x="${X + R + 60}" y="${Y - 80}" width="300" height="160" rx="24" fill="${EL.motor}"/>` + text(X + R + 210, Y + 2, 'モーター', { size: 44, w: 900, fill: '#fff' });
    a += `<path d="M ${X - R} ${Y} A ${R} ${R} 0 0 1 ${X + R} ${Y}" fill="none" stroke="${EL.rope}" stroke-width="18"/>`;
    a += sheave(X, Y, R, sp);
    // ロープ（動く印つき）
    const ropeMove = t > cue(2) + 0.4 ? (t - cue(2) - 0.4) * 60 : 0;
    a += `<line x1="${X - R}" y1="${Y}" x2="${X - R}" y2="820" stroke="${EL.rope}" stroke-width="18"/><line x1="${X + R}" y1="${Y}" x2="${X + R}" y2="820" stroke="${EL.rope}" stroke-width="18"/>`;
    a += `<line x1="${X - R}" y1="${Y}" x2="${X - R}" y2="820" stroke="#c8ccd0" stroke-width="6" stroke-dasharray="14 40" stroke-dashoffset="${ropeMove}"/>`;
    a += `<line x1="${X + R}" y1="${Y}" x2="${X + R}" y2="820" stroke="#c8ccd0" stroke-width="6" stroke-dasharray="14 40" stroke-dashoffset="${-ropeMove}"/>`;
    out += g(a, { o: bO });
    out += callout(X - 80, Y - 80, 470, 220, 'かっしゃ（くるま）', prog(t, cue(0) + 1.4, 0.4) * bO, { col: C.blueUi, size: 46 });
    // 巻きとる ✕ / かけるだけ ○
    const cO = win(t, cue(1) - 0.2, cue(2) - 0.3, 0.4);
    if (cO > 0) {
      let c = card(640, 560) + text(0, -230, 'まきとる', { size: 50, w: 900 });
      c += `<rect x="-150" y="-140" width="300" height="200" rx="30" fill="${EL.steel}"/>`;
      for (let k = 0; k < 9; k++) c += `<line x1="${-140 + k * 35}" y1="-140" x2="${-140 + k * 35 + 20}" y2="60" stroke="${EL.rope}" stroke-width="12"/>`;
      c += `<line x1="140" y1="0" x2="140" y2="200" stroke="${EL.rope}" stroke-width="12"/>`;
      c += g(cross(0, -40, 0.9), { o: prog(t, cue(1) + 0.9, 0.3) });
      out += g(c, { x: 560, y: 470, o: cO });
      let d = card(640, 560) + text(0, -230, 'かけて あるだけ', { size: 50, w: 900 });
      d += `<path d="M -110 -40 A 110 110 0 0 1 110 -40" fill="none" stroke="${EL.rope}" stroke-width="14"/>` + sheave(0, -40, 110, t) + ropeLine(-110, -40, -110, 220, 1, EL.rope, 14) + ropeLine(110, -40, 110, 220, 1, EL.rope, 14);
      d += g(okMark(0, -40, 1.5), { o: prog(t, cue(1) + 2.2, 0.3) });
      out += g(d, { x: 1360, y: 470, o: cO });
    }
    // こすれる力
    const fO = prog(t, cue(2) + 0.6, 0.4);
    if (fO > 0) {
      for (let k = 0; k < 5; k++) {
        const ang = Math.PI + 0.35 + k * 0.6;
        const px = X + Math.cos(ang) * (R + 4), py = Y + Math.sin(ang) * (R + 4);
        out += g(`<path d="M -12 -12 L 12 12 M 12 -12 L -12 12" stroke="${C.yellow}" stroke-width="7" stroke-linecap="round"/>`, { x: px, y: py, o: fO * (0.6 + 0.4 * Math.sin(t * 9 + k)), s: 1 + 0.15 * Math.sin(t * 9 + k) });
      }
      out += pop(badge('こすれる ちから', { fill: C.ochre, size: 46 }), t, cue(2) + 0.6, 960, 100);
      out += g(arrow(X - R - 70, 600, X - R - 70, 720, C.accent, 12) + arrow(X + R + 70, 720, X + R + 70, 600, C.accent, 12), { o: prog(t, cue(2) + 1.6, 0.4) });
      out += g(text(0, 0, 'ロープが おくられる', { size: 46, w: 900, fill: C.accent }), { x: 470, y: 520, o: prog(t, cue(2) + 2.0, 0.4) });
    }
    return out;
  },
});

// 5. おもり：かごが上がると、おもりは下がる。シーソーと同じ
SCENES.push({
  id: 'weight',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sO = 1 - prog(t, cue(2) - 0.3, 0.5);
    const mv = eio(prog(t, cue(1) + 0.2, 3.0));
    const cy = lerp(floorY(1), floorY(4), mv);
    if (sO > 0) {
      let s = shaftView(cy, { cw: true, t: NOW.t, kids: 1, spin: -mv * 6, cwO: prog(t, cue(0) + 0.6, 0.5) });
      s += callout(cwX() + SH.cwW / 2, SH.K - cy + 80, 1440, SH.K - cy + 80, 'おもり', prog(t, cue(0) + 1.2, 0.4), { col: C.redUi, size: 56 });
      s += g(arrow(cwX() + 110, 560, cwX() + 110, 720, C.redUi, 12), { o: win(t, cue(1) + 0.4, cue(1) + 3.6, 0.3) });
      s += g(arrow(cageX() - SH.cageW / 2 - 60, 640, cageX() - SH.cageW / 2 - 60, 400, C.accent, 12), { o: win(t, cue(1) + 0.4, cue(1) + 3.6, 0.3) });
      s += g(text(0, 0, 'かごが あがる', { size: 44, w: 900, fill: C.accent, anchor: 'end' }), { x: 530, y: 520, o: win(t, cue(1) + 0.6, cue(2), 0.3) });
      s += g(text(0, 0, 'おもりが さがる', { size: 44, w: 900, fill: C.redUi, anchor: 'start' }), { x: 1220, y: 760, o: win(t, cue(1) + 0.6, cue(2), 0.3) });
      s += g(badge('つりあう', { fill: C.ochre, size: 40 }), { x: 1500, y: 250, o: win(t, cue(0) + 2.6, cue(1), 0.3) });
      out += g(s, { o: sO });
    }
    // シーソー
    const qO = prog(t, cue(2) - 0.2, 0.5);
    if (qO > 0) {
      const tilt = Math.sin(t * 1.4) * 12;
      let q = `<path d="M -70 0 L 0 -120 L 70 0 Z" fill="${C.ochre}"/>`;
      q += `<g transform="translate(0 -120) rotate(${tilt})"><rect x="-560" y="-16" width="1120" height="32" rx="16" fill="#c99a5a"/>` +
        `<g transform="translate(-430 -16)">${cageBox(0, -150, 180, 140, { kids: 1, t: NOW.t })}</g>` +
        `<g transform="translate(430 -16)"><rect x="-70" y="-150" width="140" height="150" rx="10" fill="${EL.weight}"/>${text(0, -75, 'おもり', { size: 38, w: 900, fill: '#fff' })}</g></g>`;
      out += g(q, { x: 880, y: 720, o: qO });
      out += pop(badge('シーソーと おなじ', { fill: C.accent, size: 50 }), t, cue(2) + 0.3, 880, 200);
      out += pop(badge('すこしの ちからで うごく', { fill: C.blueUi, size: 42 }), t, cue(2) + 2.6, 880, 310);
      const bT = talking('B');
      out += pop(`<g transform="scale(0.46)">${brother(NOW.t, { pose: bT ? 'cheer' : 'stand', eyes: 'smile', mouth: 'open', hop: bT ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, cue(2) + 1.0, 1700, 840);
      out += sayBubble('B', 1610, 470, { tail: 'right' });
    }
    return out;
  },
});

// 6. ロープが切れたら？ 3本以上・非常止め
SCENES.push({
  id: 'ropes',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // 左：心配（切れたロープ）
    const aO = win(t, 0.2, cue(1) - 0.2, 0.4);
    if (aO > 0) {
      let a = `<rect x="-200" y="-330" width="400" height="660" rx="20" fill="${EL.shaft}"/>`;
      a += ropeLine(0, -330, 0, -170) + ropeLine(0, -120, 0, -40);
      a += `<path d="M -12 -170 L 12 -150 L -8 -136 M 10 -120 L -12 -108" stroke="${EL.rope}" stroke-width="6" fill="none"/>`;
      const sh = Math.sin(t * 30) * 4 * prog(t, cue(0) + 1.4, 0.2);
      a += g(cageBox(0, -40, 240, 190), { x: sh });
      a += g(text(0, 0, '？', { size: 120, w: 900, fill: C.redUi }), { x: 0, y: 260, o: prog(t, cue(0) + 1.2, 0.3) });
      out += g(a, { x: 960, y: 480, o: aO });
      out += pop(`<g transform="scale(0.5)">${sister(NOW.t, { pose: 'think', eyes: 'wide', mouth: 'o', look: [6, -6] })}</g>`, t, cue(0) + 0.6, 560, 840, { end: cue(1) - 0.2 });
    }
    // 3本のロープ、1本切れても大丈夫
    const bO = win(t, cue(1) - 0.2, cue(2) - 0.2, 0.4);
    if (bO > 0) {
      let b = `<rect x="-220" y="-330" width="440" height="660" rx="20" fill="${EL.shaft}"/>`;
      const cut = t > cue(1) + 3.0;
      [-40, 0, 40].forEach((dx, k) => {
        const kk = prog(t, cue(1) + 0.4 + k * 0.4, 0.4);
        if (k === 2 && cut) { b += `<line x1="${dx}" y1="-330" x2="${dx}" y2="-170" stroke="${EL.rope}" stroke-width="10" opacity="${kk}"/><line x1="${dx}" y1="-120" x2="${dx}" y2="-40" stroke="${EL.rope}" stroke-width="10" opacity="${kk}"/>`; }
        else b += `<line x1="${dx}" y1="-330" x2="${dx}" y2="${lerp(-330, -40, kk)}" stroke="${EL.rope}" stroke-width="10"/>`;
      });
      if (cut) b += g(`<circle r="40" fill="${C.yellow}" opacity="0.6"/>`, { x: 40, y: -145, o: 1 - prog(t, cue(1) + 3.0, 0.5) });
      b += cageBox(0, -40, 260, 200, { kids: 1, t: NOW.t });
      b += pop(badge('3ぼん いじょう', { fill: C.blueUi, size: 46 }), t, cue(1) + 1.8, 420, -200);
      b += g(okMark(260, 40, 1.2) + text(260 + 130, 40, '1ぽん きれても だいじょうぶ', { size: 44, w: 900, fill: C.accent, anchor: 'start' }), { o: prog(t, cue(1) + 3.4, 0.4) });
      out += g(b, { x: 700, y: 480, o: bO });
    }
    // 非常止め：レールをはさんで止める
    const cO = prog(t, cue(2) - 0.2, 0.4);
    if (cO > 0) {
      let c = `<rect x="-260" y="-330" width="520" height="660" rx="20" fill="${EL.shaft}"/>`;
      c += `<rect x="-200" y="-330" width="22" height="660" fill="${EL.rail}"/><rect x="178" y="-330" width="22" height="660" fill="${EL.rail}"/>`;
      const grab = prog(t, cue(2) + 2.4, 0.3);
      const fall = (1 - Math.pow(1 - clamp((t - cue(2) - 1.2) / 1.2), 2)) * 60;
      const y = -100 + fall;
      c += cageBox(0, y, 300, 210);
      [[-1, -189], [1, 189]].forEach(([sd, rx]) => {
        const jaw = lerp(28, 10, grab);
        c += `<rect x="${rx - 10 - jaw - 18}" y="${y + 160}" width="18" height="56" rx="5" fill="${C.redUi}"/><rect x="${rx + 10 + jaw}" y="${y + 160}" width="18" height="56" rx="5" fill="${C.redUi}"/>`;
      });
      c += g(text(0, 0, 'ぎゅっ', { size: 48, w: 900, fill: C.redUi }), { x: 0, y: y + 280, o: prog(t, cue(2) + 2.4, 0.3) });
      c += callout(189, y + 188, 360, y + 240, 'ひじょうどめ', prog(t, cue(2) + 1.0, 0.4), { col: C.redUi, size: 46 });
      out += g(c, { x: 1150, y: 470, o: cO });
      out += pop(badge('もしもの ときに とめる', { fill: C.redUi, size: 40 }), t, cue(2) + 3.0, 560, 470);
    }
    return out;
  },
});

// 7. オーチスのしかけと、1854年の実演
const otisMan = (t, { arm = 0 } = {}) => `<g>
  <rect x="-26" y="-120" width="22" height="120" rx="9" fill="#3d3a44"/><rect x="4" y="-120" width="22" height="120" rx="9" fill="#3d3a44"/>
  <path d="M -40 -230 Q 0 -246 40 -230 L 44 -110 L -44 -110 Z" fill="#2f3a52"/>
  <rect x="-10" y="-232" width="20" height="40" fill="#fff"/><path d="M -6 -232 L 6 -232 L 4 -200 L -4 -200 Z" fill="${C.redUi}"/>
  <g transform="translate(40 -222) rotate(${-30 - arm * 110})"><rect x="-10" y="0" width="20" height="96" rx="10" fill="#2f3a52"/><circle cx="0" cy="98" r="13" fill="${CH.skin}"/></g>
  <g transform="translate(-40 -222) rotate(20)"><rect x="-10" y="0" width="20" height="96" rx="10" fill="#2f3a52"/><circle cx="0" cy="98" r="13" fill="${CH.skin}"/></g>
  <circle cx="0" cy="-282" r="44" fill="${CH.skin}"/>
  <path d="M -44 -276 Q -48 -240 -20 -236 Q 0 -232 20 -236 Q 48 -240 44 -276 Q 30 -250 0 -250 Q -30 -250 -44 -276 Z" fill="#7a5a44"/>
  <circle cx="-15" cy="-290" r="5" fill="${CH.line}"/><circle cx="15" cy="-290" r="5" fill="${CH.line}"/>
  <rect x="-40" y="-342" width="80" height="20" rx="4" fill="#222"/><rect x="-28" y="-412" width="56" height="74" rx="6" fill="#222"/></g>`;
const crowd = (t, cheer = 0) => {
  let s = '';
  for (let i = 0; i < 9; i++) {
    const x = -720 + i * 180 + (i % 2) * 30, hop = cheer * Math.abs(Math.sin(t * 8 + i)) * 18;
    const col = ['#8b7d9a', '#7d9a8b', '#9a8b7d', '#7d8b9a'][i % 4];
    s += `<g transform="translate(${x} ${-hop})"><circle cx="0" cy="-120" r="30" fill="${col}"/><path d="M -46 0 Q -46 -86 0 -86 Q 46 -86 46 0 Z" fill="${col}"/>` +
      (cheer > 0 ? `<line x1="-30" y1="-70" x2="-58" y2="-140" stroke="${col}" stroke-width="16" stroke-linecap="round"/><line x1="30" y1="-70" x2="58" y2="-140" stroke="${col}" stroke-width="16" stroke-linecap="round"/>` : '') + `</g>`;
  }
  return s;
};
// のこぎりの歯のような棒（ラチェット）
const ratchet = (x, y0, y1, side) => {
  let s = `<rect x="${x - 14}" y="${y0}" width="28" height="${y1 - y0}" fill="${EL.rail}"/>`;
  for (let y = y0 + 10; y < y1 - 20; y += 34) s += `<path d="M ${x + side * 14} ${y} L ${x + side * 40} ${y + 30} L ${x + side * 14} ${y + 30} Z" fill="${EL.rail}"/>`;
  return s;
};
// 台とばね。open=0 閉じている → 1 開いて歯にかみこむ
const platformSpring = (cx, y, open, w = 420, frameH = 0) => {
  const reach = lerp(w / 2 - 40, w / 2 + 34, open), lift = lerp(-70, -10, open);
  const fy = y - frameH; // ばねのつけね
  let s = '';
  if (frameH > 0) s += `<rect x="${cx - w / 2 + 20}" y="${fy}" width="16" height="${frameH}" fill="#9a7448"/><rect x="${cx + w / 2 - 36}" y="${fy}" width="16" height="${frameH}" fill="#9a7448"/><rect x="${cx - w / 2 + 20}" y="${fy - 6}" width="${w - 40}" height="18" rx="5" fill="#9a7448"/>`;
  s += `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="34" rx="8" fill="#b88a55"/>`;
  s += `<path d="M ${cx - reach} ${fy + lift + 10} Q ${cx} ${fy + lift - 90 * (1 - open) - 20} ${cx + reach} ${fy + lift + 10}" fill="none" stroke="#555" stroke-width="12" stroke-linecap="round"/>`;
  s += `<line x1="${cx - w / 2 + 30}" y1="${fy}" x2="${cx - reach}" y2="${fy + lift + 10}" stroke="#888" stroke-width="6"/><line x1="${cx + w / 2 - 30}" y1="${fy}" x2="${cx + reach}" y2="${fy + lift + 10}" stroke="#888" stroke-width="6"/>`;
  return { svg: s, top: fy + lift - 90 * (1 - open) * 0.5 - 30 };
};
SCENES.push({
  id: 'otis',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A 人物
    const aO = win(t, 0.2, cue(1) - 0.2, 0.4);
    if (aO > 0) {
      out += g(pop(otisMan(t), t, 0.4, 0, 0), { x: 960, y: 760, o: aO });
      out += g(pop(badge('アメリカ', { fill: C.blueUi, size: 42 }), t, cue(0) + 2.4, 0, 0), { x: 560, y: 380, o: aO });
      out += g(pop(badge('エリシャ・オーチス', { fill: C.ochre, size: 52 }), t, cue(0) + 3.4, 0, 0), { x: 1400, y: 380, o: aO });
      out += g(text(0, 0, 'ロープが きれても おちない しかけ', { size: 50, w: 900 }), { x: 960, y: 200, o: aO * prog(t, cue(0) + 0.8, 0.4) });
    }
    // B しかけの図
    const bO = win(t, cue(1) - 0.2, cue(2) - 0.2, 0.4);
    if (bO > 0) {
      const cut = cue(1) + 1.6, open = prog(t, cut + 0.5, 0.35);
      let b = ratchet(-260, -320, 320, 1) + ratchet(260, -320, 320, -1);
      const drop = (1 - Math.pow(1 - clamp((t - cut) / 0.5), 2)) * 40;
      const P = platformSpring(0, 120 + drop, open, 440, 160);
      b += P.svg;
      b += t < cut ? ropeLine(0, -320, 0, P.top) : ropeLine(0, -320, 0, -180) + `<line x1="0" y1="${P.top - 60}" x2="0" y2="${P.top}" stroke="${EL.rope}" stroke-width="7" opacity="${1 - prog(t, cut, 0.6)}"/>`;
      b += g(`<circle r="46" fill="${C.yellow}" opacity="0.7"/>` + text(0, 0, 'チョキン', { size: 34, w: 900 }), { x: 90, y: -150, o: win(t, cut, cut + 1.0, 0.15) });
      b += callout(-80, P.top + 20, -460, -160, 'ばね', prog(t, cue(1) + 0.6, 0.4), { col: C.ink, size: 46 });
      b += callout(-260 + 30, -200, -460, -280, 'ぎざぎざの ぼう', prog(t, cue(1) + 0.9, 0.4), { col: EL.rail, size: 40 });
      b += g(text(0, 0, 'パッ！', { size: 64, w: 900, fill: C.redUi }), { x: 0, y: 260, o: win(t, cut + 0.5, cut + 2.4, 0.2) });
      b += g(badge('とまる', { fill: C.accent, size: 50 }), { x: 0, y: 260, o: prog(t, cut + 2.6, 0.4) });
      out += g(b, { x: 1000, y: 470, o: bO });
    }
    // C 1854年 みんなの前で
    const cO = win(t, cue(2) - 0.2, cue(5) - 0.3, 0.4);
    if (cO > 0) {
      const up = eio(prog(t, cue(2) + 1.0, 2.4));
      const cut = cue(2) + 4.6, open = prog(t, cut + 0.3, 0.25);
      const drop = (1 - Math.pow(1 - clamp((t - cut) / 0.35), 2)) * 26;
      const y = lerp(730, 600, up) + drop;
      let c = `<rect x="0" y="0" width="1920" height="1080" fill="#f2ead9"/>`;
      c += `<path d="M 300 160 L 960 70 L 1620 160" fill="none" stroke="#cbbd9e" stroke-width="16" stroke-linecap="round"/>`;
      c += ratchet(740, 120, 760, 1) + ratchet(1180, 120, 760, -1);
      c += `<rect x="700" y="110" width="520" height="24" rx="6" fill="${EL.rail}"/>`;
      const P = platformSpring(960, y, open, 380, 330);
      c += `<g transform="translate(960 ${y}) scale(0.62)">${otisMan(t, { arm: prog(t, cue(2) + 3.6, 0.4) * (1 - prog(t, cut + 1.6, 0.5)) * 0.4 })}</g>`;
      c += P.svg;
      c += t < cut ? ropeLine(960, 134, 960, P.top) : ropeLine(960, 134, 960, 170);
      c += g(`<circle r="40" fill="${C.yellow}" opacity="0.7"/>` + text(0, 0, 'チョキン', { size: 30, w: 900 }), { x: 1040, y: 160, o: win(t, cut, cut + 1.0, 0.15) });
      const cheer = prog(t, cue(3) + 0.2, 0.3);
      c += `<g transform="translate(960 ${850 + 10})">${crowd(t, cheer)}</g>`;
      c += `<rect x="0" y="820" width="1920" height="260" fill="#d9caa9"/>`;
      c += pop(badge('1854年', { fill: C.ochre, size: 50 }), t, cue(2) + 0.3, 400, 300);
      c += pop(text(0, 0, 'みんなの まえで', { size: 46, w: 900 }), t, cue(2) + 1.2, 400, 400);
      c += pop(badge('とまった！', { fill: C.accent, size: 54 }), t, cue(3) + 0.3, 400, 520);
      out += g(c, { o: cO });
      const kO = prog(t, cue(4) - 0.6, 0.4);
      if (kO > 0) {
        out += g(chameleon(NOW.t, { holdLens: true, mouth: lineOf('K') ? 'open' : 'smile', eyeL: -14, eyeR: -14 }), { x: 1600, y: 600, s: 0.62, o: kO * cO });
        out += sayBubble('K', 1680, 400, { tail: 'left' });
      }
    }
    // D 安心して乗れる
    const dO = prog(t, cue(5) - 0.3, 0.5);
    if (dO > 0) {
      let d = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
      const bob = Math.sin(t * 1.5) * 6;
      d += ropeLine(960, 60, 960, 196 + bob, 3) + cageBox(960, 210 + bob, 520, 420, { kids: 1, t: NOW.t });
      d += pop(badge('あんしんして のれる', { fill: C.accent, size: 54 }), t, cue(5) + 0.8, 960, 760);
      d += pop(okMark(0, 0, 1.4), t, cue(5) + 1.4, 1420, 420);
      out += g(d, { o: dO });
      out += topBadge();
    }
    return out;
  },
});

// 8. ドア：2まいがいっしょに動く。閉まらないと動かない
const doorFront = (cx, cy, open, { w = 520, h = 600, see = 0, t = 0, id = 'dc' } = {}) => {
  const half = w / 2, sl = open * (half - 10);
  let s = `<rect x="${cx - half - 50}" y="${cy - h / 2 - 70}" width="${w + 100}" height="${h + 90}" rx="14" fill="#d9d2c3"/>`;
  s += `<rect x="${cx - half}" y="${cy - h / 2}" width="${w}" height="${h}" fill="#fdfaf3"/>`;
  // 中（かごの中の人）
  s += `<g transform="translate(${cx - 50} ${cy + h / 2 - 6}) scale(0.5)">${sister(t, { pose: 'wave', eyes: 'smile', mouth: 'open' })}</g>`;
  s += `<g transform="translate(${cx + 90} ${cy + h / 2 - 6}) scale(0.5)">${brother(t + 1, { pose: 'cheer', eyes: 'smile', mouth: 'open' })}</g>`;
  s += `<clipPath id="${id}"><rect x="${cx - half}" y="${cy - h / 2}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">`;
  // かごのドア（奥）
  const car = (x, ww) => `<rect x="${x}" y="${cy - h / 2}" width="${ww}" height="${h}" fill="#a9c6b4" stroke="#7fa08c" stroke-width="4"/>`;
  s += car(cx - half - sl * 0.98, half) + car(cx + sl * 0.98, half);
  // 乗り場のドア（手前）
  const land = (x, ww) => `<rect x="${x}" y="${cy - h / 2 + 4}" width="${ww}" height="${h - 4}" fill="#cfd6dc" stroke="#9aa5b1" stroke-width="5" opacity="${1 - 0.5 * see}"/>`;
  s += land(cx - half - sl - 8, half + 8) + land(cx + sl, half + 8) + '</g>';
  s += `<rect x="${cx - half - 50}" y="${cy - h / 2 - 70}" width="${w + 100}" height="70" rx="14" fill="#d9d2c3"/>`;
  s += `<rect x="${cx - half - 50}" y="${cy - h / 2 - 8}" width="50" height="${h + 8}" fill="#d9d2c3"/><rect x="${cx + half}" y="${cy - h / 2 - 8}" width="50" height="${h + 8}" fill="#d9d2c3"/>`;
  s += `<rect x="${cx - half - 60}" y="${cy + h / 2}" width="${w + 120}" height="20" rx="4" fill="#9aa5b1"/>`;
  return s;
};
SCENES.push({
  id: 'door',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A/B 2まいのドア
    const aO = 1 - prog(t, cue(2) - 0.3, 0.4);
    if (aO > 0) {
      const op = eio(prog(t, cue(1) + 3.0, 1.4)) * (1 - eio(prog(t, cue(1) + 5.8, 1.4)));
      const see = win(t, cue(1) + 0.2, cue(1) + 3.0, 0.4);
      let a = doorFront(960, 470, op, { t: NOW.t, see, id: 'dA' });
      a += callout(760, 300, 400, 250, 'のりばの ドア', win(t, cue(1) + 0.3, cue(1) + 3.0, 0.3), { col: C.blueUi, size: 42 });
      a += callout(820, 640, 400, 700, 'かごの ドア', win(t, cue(1) + 1.0, cue(1) + 3.0, 0.3), { col: C.accent, size: 42 });
      a += g(arrow(1390, 470, 1560, 470, C.ochre, 12) + arrow(530, 470, 360, 470, C.ochre, 12), { o: win(t, cue(1) + 3.0, cue(1) + 4.6, 0.2) });
      a += pop(badge('いっしょに うごく', { fill: C.ochre, size: 44 }), t, cue(1) + 3.2, 1500, 300);
      a += pop(badge('ひみつ', { fill: C.redUi, size: 50 }), t, cue(0) + 0.4, 960, 120, { end: cue(1) + 0.2 });
      out += g(a, { o: aO });
    }
    // C しまっていないと うごかない
    const cO = win(t, cue(2) - 0.2, cue(3) - 0.2, 0.4);
    if (cO > 0) {
      let c = doorFront(560, 500, 0.35, { w: 400, h: 480, t: NOW.t, id: 'dC1' });
      c += g(cross(0, 0, 0.9), { x: 880, y: 330, o: prog(t, cue(2) + 1.4, 0.3) });
      c += text(560, 800, 'あいている', { size: 46, w: 900, fill: C.redUi });
      c += doorFront(1360, 500, 0, { w: 400, h: 480, t: NOW.t, id: 'dC2' });
      const up = eio(prog(t, cue(2) + 2.8, 1.0));
      c += g(arrow(1360, 170, 1360, 70, C.accent, 14), { o: up });
      c += g(okMark(0, 0, 0.9), { x: 1680, y: 330, o: prog(t, cue(2) + 2.4, 0.3) });
      c += text(1360, 800, 'しまっている', { size: 46, w: 900, fill: C.accent });
      out += g(c, { o: cO });
    }
    // D その階に止まったときだけ開く
    const dO = prog(t, cue(3) - 0.2, 0.4);
    if (dO > 0) {
      let d = '';
      const L = 600, Rt = 1320;
      const here = eio(prog(t, cue(3) + 0.6, 1.4));
      const cy = lerp(130, 340, here);
      d += `<rect x="${L}" y="80" width="${Rt - L}" height="700" fill="${EL.wall}"/><rect x="${L + 180}" y="80" width="360" height="700" fill="${EL.shaft}"/>`;
      d += `<rect x="${L}" y="${340 + 220}" width="${Rt - L}" height="14" fill="${EL.wallLine}"/>`;
      d += ropeLine(L + 360, 80, L + 360, cy - 14) + cageBox(L + 360, cy, 260, 220);
      const op = prog(t, cue(3) + 2.4, 0.6);
      // 乗り場のドア（横から見たところ：ドアの板が開く）
      d += `<rect x="${L + 540}" y="${340 + 6}" width="18" height="${214 - op * 200}" fill="#9aa5b1"/>`;
      d += `<g transform="translate(${L + 640} 560)">${person(0, 0, 1.2, '#7d8fa3')}</g>`;
      d += g(`<rect x="-34" y="-20" width="68" height="54" rx="8" fill="${C.redUi}"/><path d="M -20 -20 L -20 -40 A 20 20 0 0 1 20 -40 L 20 -20" fill="none" stroke="${C.redUi}" stroke-width="10"/>`, { x: L + 620, y: 300, o: 1 - prog(t, cue(3) + 2.2, 0.3) });
      d += g(okMark(0, 0, 0.9), { x: L + 640, y: 300, o: prog(t, cue(3) + 2.4, 0.3) });
      d += pop(badge('とまった ときだけ あく', { fill: C.accent, size: 46 }), t, cue(3) + 2.6, 1600, 470);
      out += g(d, { o: dO });
    }
    return out;
  },
});

// 9. 何人乗り・何キロ（ひとり65キロ）
SCENES.push({
  id: 'capacity',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // ひょうじ
    let s = `<rect x="-330" y="-190" width="660" height="380" rx="24" fill="#2f3a44"/><rect x="-306" y="-166" width="612" height="332" rx="16" fill="#f4f1e8"/>`;
    s += text(0, -96, 'じょうよう', { size: 46, w: 900, fill: C.muted });
    s += text(0, 0, '11にんのり', { size: 86, w: 900, fill: C.ink });
    s += text(0, 100, '750kg', { size: 86, w: 900, fill: C.redUi });
    out += pop(s, t, cue(0) + 0.3, 520, 430);
    out += g(`<rect x="-270" y="-52" width="540" height="104" rx="24" fill="none" stroke="${C.ochre}" stroke-width="8"/>`, { x: 520, y: 430, o: prog(t, cue(0) + 1.6, 0.3) });
    out += g(`<rect x="-180" y="-50" width="360" height="100" rx="24" fill="none" stroke="${C.ochre}" stroke-width="8"/>`, { x: 520, y: 530, o: prog(t, cue(0) + 2.6, 0.3) });
    // 人と65kg
    for (let i = 0; i < 11; i++) {
      const k = prog(t, cue(1) + 0.3 + i * 0.18, 0.3);
      if (k <= 0) continue;
      const x = 1080 + (i % 6) * 125 + (i >= 6 ? 62 : 0), y = i < 6 ? 400 : 640;
      out += g(person(0, 0, 1.25, ['#7d8fa3', '#a3867d', '#8aa37d', '#9a86b0', '#b09a6a'][i % 5]), { x, y, o: k, s: lerp(0.6, 1, back(k)) });
    }
    out += pop(badge('ひとり 65キロ', { fill: C.ochre, size: 54 }), t, cue(1) + 2.6, 1430, 180);
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
        text(-432, 2, 'へやと おなじくらい おもい おもり', { size: 58, w: 900, anchor: 'start' }), t, 0.4, 960, 300);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 300, o: ring, s: Math.max(back(ring), 0.001) });
      // 小さなしくみの図
      const mv = (Math.sin(t * 1.2) + 1) / 2;
      let f = sheave(0, 0, 60, -t * 1.2) + `<path d="M -60 0 A 60 60 0 0 1 60 0" fill="none" stroke="${EL.rope}" stroke-width="7"/>`;
      const cy = lerp(240, 120, mv);
      f += ropeLine(-60, 0, -60, cy - 14) + cageBox(-60, cy, 130, 100) + ropeLine(60, 0, 60, 360 - cy) + `<rect x="36" y="${360 - cy}" width="48" height="110" rx="6" fill="${EL.weight}"/>`;
      a += pop(f, t, 2.4, 960, 470);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 170);
      const sign = `<rect x="-70" y="-50" width="140" height="100" rx="12" fill="#2f3a44"/><rect x="-60" y="-40" width="120" height="80" rx="8" fill="#f4f1e8"/>` + text(0, -14, '11にん', { size: 26, w: 900 }) + text(0, 20, '750kg', { size: 26, w: 900, fill: C.redUi });
      const calc = `<circle r="50" fill="${C.ochreSoft}"/>` + text(0, 4, '÷', { size: 70, w: 900, fill: C.ochre });
      const warn = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
      const items = [
        [sign, '「なんにんのり なんキロ」の ひょうじを さがす', C.ink, cue(1)],
        [calc, 'キロ ÷ にんずう ＝ 65に ちかい？', C.ink, cue(2)],
        [warn, 'うごいている ドアには ちかづかない', C.red, cue(3)],
        [warn, 'あしもとの すきまは みるだけ', C.red, cue(3) + 2.6],
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「エレベーター」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

// みのまわり図鑑 動画「かさぶたは、どうしてできる？」
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
  const str = 'みのまわり図鑑 ｜ かさぶた', size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
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
// ---------- かさぶたの道具 ----------
const SK = { epi: '#f3cdb3', epiLine: '#e2b394', derm: '#f8d9cc', dermDot: '#f1c3b3', vessel: '#e9a39a', vesselWall: '#c9473f', plasma: '#f6c6b8',
  red: '#d8382f', redHi: '#f07a6c', plt: '#f2c14e', wbc: '#f6f2ea', wbcN: '#9a7bb8', fibrin: '#f4e9c8', crust: '#7a4a2e', crustHi: '#9a6442', newSkin: '#f6b3a8', germ: '#7fbf5a' };
const SURF = 260, EPI = 360, VT = 600, VB = 720; // 皮ふの表面、表皮の下、血管の上と下
const NX0 = 800, NX1 = 1120, NB0 = 900, NB1 = 1020; // 傷（上の幅と、血管の穴）
// 赤血球・血小板・白血球
const rbc = (x, y, s = 1, col = SK.red) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="20" ry="13" fill="${col}"/><ellipse rx="10" ry="5" fill="${mix(col, '#ffffff', 0.25)}"/></g>`;
const plt = (x, y, s = 1, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><ellipse rx="10" ry="6" fill="${SK.plt}" stroke="#d29a2a" stroke-width="2"/></g>`;
const wbc = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="26" fill="${SK.wbc}" stroke="#cfc6b6" stroke-width="3"/><path d="M -12 -4 Q -6 -14 4 -8 Q 14 -2 8 8 Q 0 14 -8 8 Q -16 4 -12 -4 Z" fill="${SK.wbcN}"/></g>`;
const germ = (x, y, s = 1, t = 0) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 3) * 10})"><ellipse rx="22" ry="14" fill="${SK.germ}"/><circle cx="-8" cy="-2" r="3" fill="${C.ink}"/><circle cx="6" cy="-2" r="3" fill="${C.ink}"/>${[0, 1, 2, 3, 4, 5].map(k => { const a = k / 6 * Math.PI * 2; return `<line x1="${Math.cos(a) * 20}" y1="${Math.sin(a) * 12}" x2="${Math.cos(a) * 30}" y2="${Math.sin(a) * 20}" stroke="${SK.germ}" stroke-width="4" stroke-linecap="round"/>`; }).join('')}</g>`;
// 皮ふのたて断面。o = { wound, constrict, bleed, plug, fibrin, clot, brown, heal, vesselNew, flow }
function skin(t, o = {}) {
  const { wound = 1, constrict = 0, bleed = 0, plug = 0, fibrin = 0, clot = 0, brown = 0, heal = 0, flow = 1, newVessel = 0, hair = 0, crustLift = 0 } = o;
  let s = `<rect width="1920" height="1080" fill="#fbeee4"/>`;
  s += `<rect y="${SURF}" width="1920" height="${1080 - SURF}" fill="${SK.derm}"/>`;
  for (let i = 0; i < 60; i++) s += `<circle cx="${rnd(i, 1) * 1920}" cy="${EPI + 40 + rnd(i, 2) * 420}" r="${4 + rnd(i, 3) * 6}" fill="${SK.dermDot}"/>`;
  s += `<rect y="${SURF}" width="1920" height="${EPI - SURF}" fill="${SK.epi}"/>`;
  for (let x = 0; x < 1920; x += 60) s += `<line x1="${x}" y1="${SURF}" x2="${x}" y2="${EPI}" stroke="${SK.epiLine}" stroke-width="3"/>`;
  s += `<line x1="0" y1="${EPI}" x2="1920" y2="${EPI}" stroke="${SK.epiLine}" stroke-width="4"/>`;
  // 毛の根元
  if (hair > 0) {
    [[1300, 1], [560, 0.9]].forEach(([hx, k]) => {
      s += g(`<path d="M ${hx - 22} ${SURF} L ${hx - 22} 520 Q ${hx} 560 ${hx + 22} 520 L ${hx + 22} ${SURF} Z" fill="${SK.epi}" stroke="${SK.epiLine}" stroke-width="4"/><line x1="${hx}" y1="530" x2="${hx + 20}" y2="${SURF - 120}" stroke="#4a3426" stroke-width="7" stroke-linecap="round"/>`, { o: hair });
    });
  }
  // 血管（ちぢむ）
  const nar = constrict * 34;
  s += `<rect x="0" y="${VT + nar}" width="1920" height="${VB - VT - nar * 2}" fill="${SK.plasma}"/>`;
  s += `<path d="M 0 ${VT + nar} L ${NB0} ${VT + nar} M ${NB1} ${VT + nar} L 1920 ${VT + nar} M 0 ${VB - nar} L 1920 ${VB - nar}" stroke="${SK.vesselWall}" stroke-width="10" fill="none"/>`;
  // 流れる赤血球
  for (let i = 0; i < 26; i++) {
    const sp = lerp(220, 90, constrict) * flow;
    const x = ((rnd(i, 4) * 2100 + t * sp) % 2100) - 90, y = VT + nar + 20 + rnd(i, 5) * (VB - VT - nar * 2 - 40);
    s += rbc(x, y, 1.25);
  }
  // 新しい血管
  if (newVessel > 0) s += `<path d="M ${NB0 - 120} ${VT} Q ${NB0 - 40} ${lerp(VT, 460, newVessel)} ${NB0 + 30} ${lerp(VT, 440, newVessel)} M ${NB1 + 120} ${VT} Q ${NB1 + 40} ${lerp(VT, 470, newVessel)} ${NB1 - 20} ${lerp(VT, 450, newVessel)}" fill="none" stroke="${SK.vesselWall}" stroke-width="12" stroke-linecap="round" opacity="0.8"/>`;
  // 傷（V字のくぼみ）
  if (wound > 0) {
    const notch = `M ${NX0} ${SURF - 2} L ${NB0} ${VT + nar + 2} L ${NB1} ${VT + nar + 2} L ${NX1} ${SURF - 2} Z`;
    s += `<path d="${notch}" fill="#fbeee4"/>`;
    // かたまり（赤 → 茶色、上から乾く）
    if (clot > 0) {
      const col = mix('#c8302a', SK.crust, brown);
      const top = lerp(VT, SURF - 30, clot);
      const wTop = lerp(NB1 - NB0, NX1 - NX0, (VT - top) / (VT - SURF));
      s += g(`<path d="M ${960 - wTop / 2 - (top < SURF ? 30 : 0)} ${top} Q 960 ${top - 18} ${960 + wTop / 2 + (top < SURF ? 30 : 0)} ${top} L ${NB1} ${VT + 2} L ${NB0} ${VT + 2} Z" fill="${col}"/>` +
        (brown > 0.3 ? `<path d="M ${880} ${SURF - 20} Q 960 ${SURF - 44} 1040 ${SURF - 20}" fill="none" stroke="${SK.crustHi}" stroke-width="8" stroke-linecap="round" opacity="${brown}"/>` : ''), { y: -crustLift * 160, o: 1 - prog(crustLift, 0.5, 0.5) });
    }
    // 血が出る
    if (bleed > 0) for (let i = 0; i < 14; i++) {
      const p = ((t * 0.5 + i / 14) % 1);
      const x = lerp(lerp(NB0 + 10, NB1 - 10, rnd(i, 6)), lerp(NX0 + 20, NX1 - 20, rnd(i, 7)), p), y = lerp(VT, SURF - 60, p);
      s += g(rbc(x, y, 1.15), { o: bleed * (1 - p * 0.5) });
    }
    // 血小板のせん
    if (plug > 0) {
      const n = Math.floor(plug * 40);
      for (let i = 0; i < n; i++) s += plt(lerp(NB0 + 6, NB1 - 6, rnd(i, 8)), VT + nar - 4 - rnd(i, 9) * 34 * plug, 1.1, rnd(i, 10) * 180);
    }
    // フィブリンのあみ
    if (fibrin > 0) {
      const n = Math.floor(fibrin * 26);
      for (let i = 0; i < n; i++) {
        const y1 = lerp(VT - 10, SURF + 10, rnd(i, 11)), y2 = lerp(VT - 10, SURF + 10, rnd(i, 12));
        const w1 = lerp(NB1 - NB0, NX1 - NX0, (VT - y1) / (VT - SURF)), w2 = lerp(NB1 - NB0, NX1 - NX0, (VT - y2) / (VT - SURF));
        s += `<line x1="${960 - w1 / 2 + 6}" y1="${y1}" x2="${960 + w2 / 2 - 6}" y2="${y2}" stroke="${SK.fibrin}" stroke-width="5" stroke-linecap="round" opacity="0.95"/>`;
      }
    }
  }
  // 新しい皮ふ（ふちから、毛の根元から）
  if (heal > 0) {
    const reach = heal * 120;
    s += `<path d="M ${NX0 - 10} ${EPI} Q ${NX0 + reach * 0.5} ${EPI + 8} ${NX0 + reach} ${EPI - 4}" fill="none" stroke="${SK.newSkin}" stroke-width="26" stroke-linecap="round"/>`;
    s += `<path d="M ${NX1 + 10} ${EPI} Q ${NX1 - reach * 0.5} ${EPI + 8} ${NX1 - reach} ${EPI - 4}" fill="none" stroke="${SK.newSkin}" stroke-width="26" stroke-linecap="round"/>`;
  }
  return s;
}
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46 } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
const okMark = (x, y, s = 1, col = C.accent) => `<circle cx="${x}" cy="${y}" r="${54 * s}" fill="none" stroke="${col}" stroke-width="${16 * s}"/>`;
const stepBadge = (n, str, on) => g(`<circle r="34" fill="${on ? C.redUi : '#d9cfc2'}"/>` + text(0, 3, n, { size: 40, w: 900, fill: '#fff' }) + text(50, 2, str, { size: 36, w: 900, anchor: 'start', fill: on ? C.ink : '#b3a999' }), {});
const steps3 = (cur, t, x = 90, y = 140) => {
  const L = [['1', 'けっかんが ちぢむ'], ['2', 'けっしょうばんの せん'], ['3', 'フィブリンの あみ']];
  return L.map(([n, s], i) => g(stepBadge(n, s, cur === i), { x: x + i * 560, y })).join('');
};
// ひざ（すりむいた所）
const knee = (k, { scrape = 1, crust = 0, pink = 0 } = {}) => {
  let s = `<path d="M -420 260 Q -440 -40 -300 -170 Q -120 -300 120 -260 Q 380 -200 430 40 Q 450 200 420 260 Z" fill="${CH.skin}" stroke="${CH.skinShade}" stroke-width="8"/>`;
  s += `<ellipse cx="0" cy="-40" rx="170" ry="110" fill="${CH.skinShade}" opacity="0.25"/>`;
  if (scrape > 0) {
    for (let i = 0; i < 9; i++) s += `<path d="M ${-120 + i * 26} ${-110 + rnd(i, 1) * 30} L ${-90 + i * 26} ${30 + rnd(i, 2) * 30}" stroke="#d84a3a" stroke-width="${10 + rnd(i, 3) * 8}" stroke-linecap="round" opacity="${scrape * (1 - crust)}"/>`;
    s += `<ellipse cx="0" cy="-40" rx="140" ry="85" fill="#e96b5b" opacity="${0.35 * scrape * (1 - crust)}"/>`;
  }
  if (crust > 0) {
    s += `<path d="M -130 -60 Q -120 -120 -20 -125 Q 110 -120 135 -50 Q 140 20 60 40 Q -40 55 -110 20 Q -150 -10 -130 -60 Z" fill="${SK.crust}" opacity="${crust}"/>`;
    s += `<path d="M -80 -90 Q 0 -110 70 -85" fill="none" stroke="${SK.crustHi}" stroke-width="12" stroke-linecap="round" opacity="${crust}"/>`;
  }
  if (pink > 0) s += `<path d="M -130 -60 Q -120 -120 -20 -125 Q 110 -120 135 -50 Q 140 20 60 40 Q -40 55 -110 20 Q -150 -10 -130 -60 Z" fill="#f4aaa0" opacity="${pink * 0.8}"/>`;
  return s;
};

// 1. つかみ：ひざのすりむき → かさぶた
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    const cr = eio(prog(t, cue(1) + 0.4, 2.0));
    out += pop(knee(0, { scrape: 1, crust: cr }), t, 0.3, 1100, 560, { s: 1 });
    out += g(text(0, 0, 'いたっ', { size: 70, w: 900, fill: C.redUi }), { x: 1500, y: 300, o: win(t, cue(0) + 0.4, cue(1) - 0.2, 0.3) });
    // カレンダー（何日か）
    const days = Math.min(5, Math.floor(clamp((t - cue(1) - 0.2) / 0.4, 0, 5)));
    if (t > cue(1)) out += g(`<rect x="-90" y="-90" width="180" height="180" rx="18" fill="#fff" stroke="${C.line}" stroke-width="6"/><rect x="-90" y="-90" width="180" height="48" rx="18" fill="${C.redUi}"/>` + text(0, 24, days + 1, { size: 80, w: 900 }) + text(0, 104, 'にちめ', { size: 34, w: 900, fill: C.muted }), { x: 1640, y: 260, o: prog(t, cue(1), 0.3) * (1 - prog(t, cue(3) - 0.3, 0.3)) });
    out += callout(1100, 520, 1500, 760, 'かさぶた', prog(t, cue(1) + 2.4, 0.4), { col: SK.crust, size: 56 });
    const sT = talking('S');
    out += pop(`<g transform="scale(0.56)">${sister(NOW.t, { pose: sT ? 'point' : 'stand', eyes: 'wide', mouth: sT ? 'open' : 'smile', talk: sT, look: [7, 0] })}</g>`, t, cue(1) + 3.0, 300, 840);
    out += sayBubble('S', 400, 480, { tail: 'left' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1100, y: 240, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${SK.crust}">かさぶた</tspan>は、</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.redUi}">できる</tspan>？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(knee(0, { crust: 1 }), t, t0 + 1.8, 960, 860, { s: 0.32 });
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'かさぶたは なにで できている？', { size: 76, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'ひふが、かたく なったもの'], ['②', 'ちが かたまって、かわいたもの'], ['③', 'ばいきんが、あつまったもの']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 54, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(knee(0, { crust: 1 }) + text(330, -260, '？', { size: 200, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 360, { s: 0.42 });
    out += pop(`<g transform="scale(0.5)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', look: [-5, -7] })}</g>`, t, 0.0, 1690, 850, { d: 0.4 });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1520, y: 720, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 血管が傷つく → 3つの段階 → ちぢむ
SCENES.push({
  id: 'vessel',
  draw(t) {
    const cut = prog(t, cue(0) + 0.8, 0.5);
    const con = eio(prog(t, cue(2) + 0.6, 1.4));
    let out = skin(t, { wound: cut, bleed: cut * (1 - con * 0.7), constrict: con });
    out += callout(300, 300, 300, 470, 'ひふ', prog(t, cue(0) + 0.2, 0.3), { col: SK.epiLine, size: 46 });
    out += callout(400, 660, 400, 810, 'けっかん', prog(t, cue(0) + 0.4, 0.3), { col: SK.vesselWall, size: 46 });
    out += g(text(0, 0, 'ちが でる', { size: 50, w: 900, fill: C.redUi, anchor: 'start' }), { x: 1120, y: 230, o: win(t, cue(0) + 1.6, cue(1), 0.3) });
    out += g(`<rect x="0" y="0" width="1920" height="230" fill="${C.paper}" opacity="0.92"/>` + steps3(-1, t) + text(960, 60, 'ちを とめる 3つの だんかい', { size: 46, w: 900 }), { o: win(t, cue(1) + 0.2, cue(2) + 0.2, 0.3) });
    out += g(`<rect x="0" y="0" width="1920" height="230" fill="${C.paper}" opacity="0.92"/>` + steps3(0, t), { o: prog(t, cue(2), 0.3) });
    out += g(arrow2(1400, VT - 80, 1400, VT + 10) + arrow2(1400, VB + 80, 1400, VB - 10), { o: win(t, cue(2) + 0.6, cue(2) + 3.6, 0.3) });
    out += g(badge('ちぢむ', { fill: SK.vesselWall, size: 44 }), { x: 1600, y: 500, o: prog(t, cue(2) + 1.0, 0.3) });
    out += g(badge('ながれが ゆっくり', { fill: C.blueUi, size: 40 }), { x: 1600, y: 810, o: prog(t, cue(2) + 2.4, 0.3) });
    return out;
  },
});
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}

// 4. 血小板がせんをする
SCENES.push({
  id: 'platelet',
  draw(t) {
    const pl = eio(prog(t, cue(2) + 0.4, 2.4));
    let out = skin(t, { constrict: 1, bleed: 0.3 * (1 - pl), plug: Math.max(0.15 * prog(t, cue(0) + 1.0, 1), pl) });
    out += `<rect x="0" y="0" width="1920" height="230" fill="${C.paper}" opacity="0.92"/>` + steps3(1, t);
    // 流れてくる血小板
    for (let i = 0; i < 10; i++) {
      const p = ((t * 0.25 + i / 10) % 1), x = lerp(-40, NB0 + 40, p), y = VT + 50 + rnd(i, 14) * 40;
      if (t > cue(0) + 0.4) out += plt(x, y, 1.3, t * 60 + i * 30);
    }
    out += callout(700, VT + 70, 560, 790, 'けっしょうばん', prog(t, cue(0) + 1.0, 0.3), { col: '#c08a1a', size: 46 });
    // 大きさ
    const zO = win(t, cue(1) - 0.2, cue(2) - 0.1, 0.3);
    if (zO > 0) {
      let z = card(760, 420) + `<line x1="-300" y1="40" x2="300" y2="40" stroke="${C.ink}" stroke-width="6"/><line x1="-300" y1="20" x2="-300" y2="60" stroke="${C.ink}" stroke-width="6"/><line x1="300" y1="20" x2="300" y2="60" stroke="${C.ink}" stroke-width="6"/>` +
        text(0, 100, '1ミリ', { size: 44, w: 900 }) + text(0, -130, '1ミリの 500ぶんの1くらい', { size: 44, w: 900, fill: '#c08a1a' }) + `<circle cx="-298" cy="40" r="3" fill="#c08a1a"/>` +
        g(plt(0, 0, 4), { x: -200, y: -50 }) + arrow2(-160, -40, -296, 30, '#c08a1a', 5);
      out += g(z, { x: 1460, y: 560, o: zO, s: lerp(0.9, 1, eo(zO)) });
    }
    out += g(badge('くっつきあって ふさぐ', { fill: '#c08a1a', size: 44 }), { x: 1460, y: 450, o: prog(t, cue(2) + 1.4, 0.3) });
    const bT = talking('B');
    out += pop(`<g transform="scale(0.46)">${brother(NOW.t, { pose: bT ? 'cheer' : 'stand', eyes: 'smile', mouth: 'open', hop: bT ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, cue(3) - 0.8, 1700, 830);
    out += sayBubble('B', 1600, 560, { tail: 'right' });
    return out;
  },
});

// 5. フィブリンのあみ
SCENES.push({
  id: 'fibrin',
  draw(t) {
    const fb = eio(prog(t, cue(0) + 1.2, 3.0));
    const cl = eio(prog(t, cue(1) + 0.6, 2.0));
    let out = skin(t, { constrict: 1, plug: 1, fibrin: fb, clot: cl * 0.0 });
    // あみにかかる赤血球
    if (t > cue(1)) for (let i = 0; i < 12; i++) {
      const k = prog(t, cue(1) + 0.3 + i * 0.2, 0.4);
      const y = lerp(VT - 20, SURF + 20, rnd(i, 15)), w = lerp(NB1 - NB0, NX1 - NX0, (VT - y) / (VT - SURF)) - 40;
      out += g(rbc(960 + (rnd(i, 16) - 0.5) * w, y, 1.0), { o: k });
    }
    out += `<rect x="0" y="0" width="1920" height="230" fill="${C.paper}" opacity="0.92"/>` + steps3(2, t);
    out += callout(1040, 420, 1340, 330, 'フィブリンの いと', prog(t, cue(0) + 2.0, 0.3), { col: '#b8a050', size: 46 });
    out += g(badge('しっかり しばる', { fill: '#b8a050', size: 44 }), { x: 1500, y: 470, o: prog(t, cue(0) + 4.0, 0.3) });
    out += callout(940, 470, 560, 330, 'あかい ちの つぶ', prog(t, cue(1) + 1.2, 0.3), { col: SK.red, size: 46 });
    return out;
  },
});

// 6. 乾いてかさぶたに
SCENES.push({
  id: 'dry',
  draw(t) {
    const cl = eio(prog(t, cue(0) + 0.2, 1.4)), br = eio(prog(t, cue(0) + 1.6, 2.6));
    let out = skin(t, { constrict: lerp(1, 0.4, br), clot: cl, brown: br });
    out += g(badge('かわいて かたく なる', { fill: SK.crust, size: 46 }), { x: 1460, y: 200, o: prog(t, cue(0) + 1.6, 0.3) });
    out += callout(1040, SURF - 20, 1300, 330, 'かさぶた', prog(t, cue(0) + 3.4, 0.3), { col: SK.crust, size: 56 });
    // ふた
    const fO = prog(t, cue(1) + 0.4, 0.4);
    out += g(`<path d="M 780 ${SURF - 60} Q 960 ${SURF - 140} 1140 ${SURF - 60}" fill="none" stroke="${C.accent}" stroke-width="10" stroke-dasharray="20 14" stroke-linecap="round"/>`, { o: fO });
    out += g(badge('きずの ふた', { fill: C.accent, size: 52 }), { x: 560, y: 200, o: fO });
    return out;
  },
});

// 7. どうして茶色？（鉄がさびるように）
SCENES.push({
  id: 'color',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      let a = pop(`<path d="M 0 -120 Q 90 0 80 40 Q 70 110 0 110 Q -70 110 -80 40 Q -90 0 0 -120 Z" fill="#d8302a"/>` + text(0, 190, 'ち', { size: 56, w: 900 }), t, cue(0) + 0.4, 600, 450);
      a += pop(knee(0, { crust: 1 }), t, cue(0) + 1.4, 1300, 470, { s: 0.6 });
      a += g(text(1300, 640, 'かさぶた', { size: 56, w: 900 }), { o: prog(t, cue(0) + 1.6, 0.3) });
      a += g(text(0, 0, '？', { size: 120, w: 900, fill: C.ochre }), { x: 950, y: 440, o: prog(t, cue(0) + 2.4, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = win(t, cue(1) - 0.3, cue(3) - 0.3, 0.4);
    if (bO > 0) {
      let b = '';
      // 赤血球の中の 色のもと と 鉄
      b += pop(rbc(0, 0, 9), t, cue(1) - 0.1, 560, 470);
      b += g(`<circle r="62" fill="#8a8f96" stroke="#5a5f66" stroke-width="8"/>` + text(0, 4, 'てつ', { size: 46, w: 900, fill: '#fff' }), { x: 560, y: 470, o: prog(t, cue(1) + 1.0, 0.3), s: lerp(1.4, 1, eo(prog(t, cue(1) + 1.0, 0.4))) });
      b += g(text(560, 660, 'あかい いろの もと', { size: 46, w: 900, fill: C.redUi }), { o: prog(t, cue(1) + 0.4, 0.3) });
      // 空気 → 茶色
      const air = prog(t, cue(2) + 0.6, 0.5), ch = eio(prog(t, cue(2) + 2.0, 3.0));
      b += g(text(0, 0, 'くうき', { size: 48, w: 900, fill: C.blueUi }) + [0, 1, 2].map(k => `<path d="M ${-120 + k * 80} ${60 + Math.sin(t * 3 + k) * 8} q 20 -16 40 0 t 40 0" fill="none" stroke="${C.blueUi}" stroke-width="6" stroke-linecap="round"/>`).join(''), { x: 960, y: 330, o: air });
      b += g(arrow2(800, 470, 1100, 470, C.ink, 12), { o: air });
      b += g(`<rect x="-180" y="-120" width="360" height="240" rx="30" fill="${mix('#d8302a', '#7a4a2e', ch)}"/>` + text(0, 190, ch < 0.5 ? 'あか' : 'ちゃいろ', { size: 50, w: 900 }), { x: 1400, y: 470, o: prog(t, cue(2) + 1.2, 0.4) });
      b += g(badge('てつが さびる ときと おなじ', { fill: '#8a5a3a', size: 44 }), { x: 1400, y: 250, o: prog(t, cue(2) + 3.2, 0.3) });
      out += g(b, { o: bO });
    }
    const cO = prog(t, cue(3) - 0.3, 0.4);
    if (cO > 0) {
      const ch = eio(prog(t, cue(3) + 0.6, 2.4));
      let c = '';
      // 服のしみ
      c += `<path d="M -170 -200 L -60 -240 Q 0 -200 60 -240 L 170 -200 L 230 -100 L 150 -60 L 140 200 L -140 200 L -150 -60 L -230 -100 Z" fill="#dfe9f1" stroke="#b9c8d4" stroke-width="6"/>`;
      c += `<path d="M -10 -20 Q 40 -50 60 0 Q 70 40 20 50 Q -30 60 -40 20 Q -50 -10 -10 -20 Z" fill="${mix('#d8302a', '#7a4a2e', ch)}"/>`;
      out += pop(c, t, cue(3) + 0.1, 500, 480);
      out += g(text(500, 760, 'ふくの ちの しみ', { size: 46, w: 900 }), { o: prog(t, cue(3) + 0.4, 0.3) });
      // さびた鉄のさく
      let r = '';
      for (let i = 0; i < 5; i++) r += `<rect x="${-200 + i * 90}" y="-200" width="26" height="380" rx="6" fill="#8a8f96"/>`;
      r += `<rect x="-230" y="-150" width="460" height="24" fill="#8a8f96"/><rect x="-230" y="110" width="460" height="24" fill="#8a8f96"/>`;
      for (let i = 0; i < 18; i++) r += `<circle cx="${-200 + rnd(i, 21) * 420}" cy="${-190 + rnd(i, 22) * 360}" r="${10 + rnd(i, 23) * 16}" fill="#9a5a32" opacity="0.85"/>`;
      out += pop(r, t, cue(3) + 1.0, 1420, 480);
      out += g(text(1420, 760, 'さびた てつ', { size: 46, w: 900 }), { o: prog(t, cue(3) + 1.2, 0.3) });
      const kO = prog(t, cue(4) - 0.6, 0.4);
      if (kO > 0) {
        out += g(chameleon(NOW.t, { holdLens: true, mouth: lineOf('K') ? 'open' : 'smile' }), { x: 900, y: 780, s: 0.55, o: kO });
        out += sayBubble('K', 960, 560, { tail: 'left' });
      }
    }
    return out;
  },
});

// 8. かさぶたの下
SCENES.push({
  id: 'under',
  draw(t) {
    const wb = prog(t, cue(1) - 0.2, 0.4), nv = eio(prog(t, cue(2) + 0.2, 2.0)), hl = eio(prog(t, cue(3) + 0.6, 4.0));
    let out = skin(t, { constrict: 0.3, clot: 1, brown: 1, newVessel: nv, heal: hl, hair: prog(t, cue(3) + 0.2, 0.5) });
    // 白血球とばい菌
    if (wb > 0) {
      for (let i = 0; i < 4; i++) {
        const gone = prog(t, cue(1) + 1.6 + i * 0.5, 0.4);
        const gx = 1130 + (i % 2) * 110 + Math.sin(t * 2 + i) * 10, gy = 430 + Math.floor(i / 2) * 80;
        if (gone < 1) out += g(germ(gx, gy, 1.2, t + i), { o: (1 - gone) * wb });
        const wy = lerp(VT + 40, gy + 10, eo(prog(t, cue(1) + 0.4 + i * 0.5, 1.2)));
        out += g(wbc(gx - 30, wy, 1.4), { o: wb * (1 - prog(t, cue(2) - 0.3, 0.5)) });
      }
      out += callout(1090, 520, 1300, 820, 'はっけっきゅう', wb * (1 - prog(t, cue(2) - 0.3, 0.5)), { col: SK.wbcN, size: 46 });
      out += callout(1290, 420, 1500, 300, 'ばいきん', wb * (1 - prog(t, cue(1) + 3.0, 0.5)), { col: '#5a9a3a', size: 46 });
    }
    out += callout(NB0 - 60, 520, 480, 820, 'あたらしい けっかん', prog(t, cue(2) + 1.0, 0.3) * (1 - prog(t, cue(3) - 0.3, 0.4)), { col: SK.vesselWall, size: 46 });
    out += callout(NX0 + 60, EPI, 480, 820, 'きずの ふちから', prog(t, cue(3) + 1.6, 0.3), { col: '#d06a5a', size: 46 });
    out += callout(1300, 500, 1500, 820, 'けの ねもとから', prog(t, cue(3) + 3.0, 0.3), { col: '#d06a5a', size: 46 });
    out += g(badge('かさぶたの した', { fill: SK.crust, size: 46 }), { x: 960, y: 120, o: prog(t, 0.4, 0.3) });
    // 毛の根元から広がる新しい皮ふ
    if (hl > 0) out += `<path d="M 1278 ${SURF + 10} L 1278 ${lerp(SURF + 10, 500, hl)} M 1322 ${SURF + 10} L 1322 ${lerp(SURF + 10, 500, hl)}" stroke="${SK.newSkin}" stroke-width="14" stroke-linecap="round" opacity="0.9"/>`;
    return out;
  },
});

// 9. 自然に取れる・はがさない
SCENES.push({
  id: 'off',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.3, 0.4);
    if (aO > 0) {
      const lift = eio(prog(t, cue(0) + 1.0, 2.0));
      let a = skin(t, { constrict: 0, clot: 1, brown: 1, heal: 1, wound: 1 - lift * 0.0, crustLift: lift });
      // 下の皮ふができあがり
      a += g(`<path d="M ${NX0} ${SURF} L ${NX1} ${SURF} L ${NX1 - 40} ${EPI + 20} L ${NX0 + 40} ${EPI + 20} Z" fill="${SK.newSkin}"/><path d="M ${NX0 + 40} ${EPI + 20} L ${NB0} ${VT} L ${NB1} ${VT} L ${NX1 - 40} ${EPI + 20} Z" fill="${SK.derm}"/>`, { o: prog(t, cue(0) + 0.6, 0.6) });
      a += g(badge('しぜんに とれる', { fill: C.accent, size: 50 }), { x: 1460, y: 160, o: prog(t, cue(0) + 2.4, 0.3) });
      a += g(`<rect x="-200" y="-80" width="400" height="160" rx="24" fill="#fff" stroke="${C.line}" stroke-width="6"/>` + text(0, 2, '1〜2しゅうかん', { size: 56, w: 900, fill: C.redUi }), { x: 460, y: 160, o: prog(t, cue(1) + 0.4, 0.3) });
      a += g(text(0, 0, 'すりきず', { size: 40, w: 900, fill: C.muted }), { x: 460, y: 280, o: prog(t, cue(1) + 0.4, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      let b = pop(knee(0, { crust: 1 }), t, cue(2) - 0.2, 760, 520, { s: 0.75 });
      const pick = Math.sin(t * 6) * 10;
      b += g(`<path d="M -30 -200 L -30 -40 Q -30 0 0 0 Q 30 0 30 -40 L 30 -200 Z" fill="${CH.skin}" stroke="${CH.skinShade}" stroke-width="5"/>`, { x: 840 + pick, y: 470, r: -30 });
      b += g(cross(0, 0, 1.6), { x: 760, y: 470, o: prog(t, cue(2) + 1.6, 0.3) });
      b += pop(badge('はがさない', { fill: C.red, size: 60, pad: 46 }), t, cue(2) + 2.0, 1440, 380);
      b += g(text(0, 0, 'したの しゅうりが こわれちゃう', { size: 44, w: 900, fill: C.redUi }), { x: 1440, y: 520, o: prog(t, cue(2) + 2.8, 0.3) });
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
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-450, 2, 'ちが かたまって、かわいたもの', { size: 58, w: 900, anchor: 'start' }), t, 0.4, 960, 300);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="70" fill="none" stroke="${C.red}" stroke-width="12"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 300, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['ちが でる', C.redUi], ['かたまる', '#c08a1a'], ['かわく', SK.crust]], t, 960, 560, { size: 46, start: 2.4, step: 0.8 });
      a += g(arrow2(700, 650, 760, 650, C.muted, 6) + arrow2(1150, 650, 1210, 650, C.muted, 6), { o: 0 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 170);
      const warn = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
      const sw = (c1, c2) => `<rect x="-60" y="-34" width="54" height="68" rx="10" fill="${c1}"/><rect x="6" y="-34" width="54" height="68" rx="10" fill="${c2}"/>`;
      const items = [
        [sw('#a8402e', '#5e3522'), 'できたばかり と なんにちか あとの いろ', C.ink, cue(1)],
        [sw('#f4aaa0', CH.skin), 'とれた あとは まわりより ピンク？', C.ink, cue(2)],
        [warn, 'わざと きずを つくらない・はがさない', C.red, cue(3)],
      ];
      items.forEach(([ic, s, col, st], i) => {
        b += pop(ic + text(110, 2, s, { size: 46, w: 900, anchor: 'start', fill: col }), t, st, 230, 340 + i * 150);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「かさぶた」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

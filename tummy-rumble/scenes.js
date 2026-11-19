// みのまわり図鑑 動画「おなかは、どうしてグーと鳴る？」
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
  const str = 'みのまわり図鑑 ｜ おなかの おと', size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
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
// 吹き出しは、管（くだ）にかぶらないように、おとうとの右がわに出して、しっぽを顔にとどかせる
const tipBubble = (who, x, y, tipX, tipY, size = 44) => {
  const L = lineOf(who); if (!L) return '';
  const k = back(clamp((NOW.t - L.start + 0.1) / 0.35));
  const o = Math.min(clamp((NOW.t - L.start + 0.1) / 0.15), clamp((L.end - NOW.t) / 0.25));
  const w = tw(L.text, size, 700, 0.04) + 70, h = size * 2.3;
  const dx = tipX - x, dy = tipY - y;
  const bx = Math.sign(dx) * (w / 2 - 4), by = Math.max(-h / 2 + 30, Math.min(h / 2 - 30, dy));
  const base = `${bx} ${by - 18} L ${bx} ${by + 18}`;
  const body = `<g filter="url(#shadow)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff"/><path d="M ${base} L ${dx} ${dy} Z" fill="#fff"/></g>` + text(0, 2, L.text, { size, fill: C.ink });
  return g(body, { x, y, s: Math.max(k, 0.001), o });
};

// ---------- おなかの道具 ----------
const GT = { wall: '#e9928a', wallDark: '#c96a62', inside: '#fbe3dc', liquid: '#f2c46a', gas: '#ffffff', food: '#c9925a', blood: '#d8463c' };
// 子どもの胴（前から）。inner=1 で胃と腸が見える
function torso(t, { inner = 1, glowStomach = 0, glowGut = 0, wiggle = 0 } = {}) {
  let s = `<path d="M -220 -360 Q -260 -340 -270 -250 L -260 260 Q -250 330 -150 340 L 150 340 Q 250 330 260 260 L 270 -250 Q 260 -340 220 -360 Z" fill="${CH.skin}" stroke="${CH.skinShade}" stroke-width="8"/>`;
  s += `<circle cx="0" cy="120" r="9" fill="${CH.skinShade}"/>`;
  if (inner > 0) {
    let o = '';
    // 胃（左上＝絵では右上）
    o += `<path d="M 40 -300 Q 60 -240 120 -230 Q 200 -220 200 -150 Q 195 -60 90 -50 Q 0 -45 -40 -110 Q -60 -150 -20 -170 Q 20 -190 20 -250 Q 15 -290 40 -300 Z" fill="${GT.wall}" stroke="${GT.wallDark}" stroke-width="7"/>`;
    if (glowStomach > 0) o += `<path d="M 40 -300 Q 60 -240 120 -230 Q 200 -220 200 -150 Q 195 -60 90 -50 Q 0 -45 -40 -110 Q -60 -150 -20 -170 Q 20 -190 20 -250 Q 15 -290 40 -300 Z" fill="none" stroke="#ffd76a" stroke-width="14" opacity="${glowStomach * (0.6 + 0.3 * Math.sin(t * 6))}"/>`;
    // 腸（くねくね）
    let d = 'M -40 -80';
    for (let i = 0; i < 6; i++) { const y = -30 + i * 45, sd = i % 2 ? -1 : 1; d += ` Q ${sd * 180} ${y} ${-sd * 0 + sd * 10} ${y + 22} Q ${-sd * 170} ${y + 40} ${-sd * 20} ${y + 45}`; }
    const wv = Math.sin(t * 3) * wiggle * 4;
    o += `<path d="${d}" fill="none" stroke="${GT.wallDark}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${wv})"/><path d="${d}" fill="none" stroke="${GT.wall}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${wv})"/>`;
    if (glowGut > 0) o += `<path d="${d}" fill="none" stroke="#ffd76a" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" opacity="${glowGut * (0.35 + 0.2 * Math.sin(t * 6))}" transform="translate(0 ${wv})"/>`;
    s += g(o, { o: inner });
  }
  return s;
};
// 横にのびた腸の一部。wx = しぼる位置（x）、sq = しぼる強さ
function gutTube(x0, x1, y, h, t, { wx = -1e9, sq = 0, liquid = 0.4, gas = 6, food = 0, push = 0, seed = 1 } = {}) {
  const N = 80, R = x => h / 2 * (1 - sq * Math.exp(-Math.pow((x - wx) / 70, 2)));
  let top = '', bot = '';
  for (let i = 0; i <= N; i++) { const x = lerp(x0, x1, i / N), r = R(x); top += (i ? ' L ' : 'M ') + x + ' ' + (y - r); bot = ` L ${x} ${y + r}` + bot; }
  const id = 'gt' + seed;
  let s = `<clipPath id="${id}"><path d="${top}${bot.replace(/^ L/, ' L')} Z"/></clipPath>`;
  s += `<path d="${top}${bot} Z" fill="${GT.inside}"/>`;
  s += `<g clip-path="url(#${id})">`;
  if (liquid > 0) s += `<rect x="${x0}" y="${y + h / 2 - h * liquid}" width="${x1 - x0}" height="${h * liquid}" fill="${GT.liquid}" opacity="0.85"/>`;
  for (let i = 0; i < food; i++) { const fx = lerp(x0 + 30, x1 - 30, rnd(i, seed + 3)), fy = y + (rnd(i, seed + 4) - 0.3) * h * 0.6; s += `<rect x="${fx - 18}" y="${fy - 14}" width="36" height="28" rx="8" fill="${GT.food}" transform="rotate(${rnd(i, seed + 5) * 90} ${fx} ${fy})"/>`; }
  for (let i = 0; i < gas; i++) {
    let gx = lerp(x0 + 40, x1 - 40, rnd(i, seed + 6));
    if (push > 0 && gx < wx + 40) gx = Math.min(x1 + 60, gx + push * (wx + 40 - gx) * 1.0 + push * 60);
    const gy = y - h * 0.18 + (rnd(i, seed + 7) - 0.5) * h * 0.3, r = 14 + rnd(i, seed + 8) * 16;
    s += `<circle cx="${gx}" cy="${gy}" r="${r}" fill="${GT.gas}" stroke="#e8c9c0" stroke-width="3"/>`;
  }
  s += `</g>`;
  s += `<path d="${top}" fill="none" stroke="${GT.wallDark}" stroke-width="16" stroke-linecap="round"/><path d="${bot.replace(/^ L/, 'M')}" fill="none" stroke="${GT.wallDark}" stroke-width="16" stroke-linecap="round"/>`;
  return s;
}
const soundWaves = (x, y, t, big = 1, col = C.ochre) => { let s = ''; for (let k = 0; k < 3; k++) { const p = ((t * 1.3 + k / 3) % 1); s += `<path d="M ${x + p * 120 * big} ${y - (40 + p * 50) * big} Q ${x + (30 + p * 140) * big} ${y} ${x + p * 120 * big} ${y + (40 + p * 50) * big}" fill="none" stroke="${col}" stroke-width="${8 * big}" stroke-linecap="round" opacity="${1 - p}"/>`; } return s; };
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
const clock = (h, m, s = 1) => `<g transform="scale(${s})"><circle r="80" fill="#fff" stroke="${C.ink}" stroke-width="8"/>${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<line x1="${Math.sin(a) * 64}" y1="${-Math.cos(a) * 64}" x2="${Math.sin(a) * 72}" y2="${-Math.cos(a) * 72}" stroke="${C.ink}" stroke-width="5"/>`; }).join('')}<line x1="0" y1="0" x2="${Math.sin((h + m / 60) / 12 * Math.PI * 2) * 40}" y2="${-Math.cos((h + m / 60) / 12 * Math.PI * 2) * 40}" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/><line x1="0" y1="0" x2="${Math.sin(m / 60 * Math.PI * 2) * 58}" y2="${-Math.cos(m / 60 * Math.PI * 2) * 58}" stroke="${C.redUi}" stroke-width="6" stroke-linecap="round"/><circle r="8" fill="${C.ink}"/></g>`;
const guu = (x, y, t, t0, size = 90) => { const k = prog(t, t0, 0.4); return k > 0 ? g(text(0, 0, 'グー', { size, w: 900, fill: C.redUi }), { x, y: y + Math.sin(t * 20) * 3 * (1 - prog(t, t0 + 0.6, 1)), o: 1 - prog(t, t0 + 2.2, 0.5), s: lerp(0.6, 1, back(k)) }) : ''; };

// 1. つかみ：しずかなときにグー
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // へや（つくえで本を読む）
    out += `<rect x="0" y="760" width="1920" height="320" fill="#efe3cc"/><rect x="380" y="560" width="760" height="40" rx="10" fill="#c9a77c"/><rect x="420" y="600" width="30" height="200" fill="#b8946a"/><rect x="1070" y="600" width="30" height="200" fill="#b8946a"/>`;
    out += `<path d="M 600 548 L 760 530 L 760 556 L 600 560 Z M 760 530 L 920 548 L 920 560 L 760 556 Z" fill="#fff" stroke="${C.line}" stroke-width="3"/>`;
    const sT = talking('S');
    out += `<g transform="translate(1340 820) scale(0.62)">${sister(NOW.t, { pose: sT ? 'point' : 'stand', eyes: t > cue(0) + 0.6 ? 'wide' : 'open', mouth: sT ? 'open' : (t > cue(0) + 0.6 ? 'o' : 'smile'), talk: sT, look: [-6, 4] })}</g>`;
    out += `<g transform="translate(1560 820) scale(0.56)">${brother(NOW.t + 1, { pose: 'stand', eyes: t > cue(0) + 0.6 ? 'wide' : 'open', mouth: 'o', look: [-8, 4] })}</g>`;
    out += guu(1640, 480, t, cue(0) + 0.6, 100) + guu(1660, 520, t, cue(1) + 1.2, 80);
    out += g(soundWaves(1600, 650, t, 0.8), { o: win(t, cue(0) + 0.6, cue(0) + 2.8, 0.2) + win(t, cue(1) + 1.2, cue(1) + 3.4, 0.2) });
    out += g(text(0, 0, 'しーん', { size: 50, w: 900, fill: C.muted }), { x: 760, y: 360, o: win(t, 0.2, cue(0) + 0.5, 0.3) });
    out += sayBubble('S', 1180, 420, { tail: 'right' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 960, y: 300, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${GT.wallDark}">おなか</tspan>は、</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.redUi}">グー</tspan>と なる？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(torso(t, { inner: 1, glowGut: 1 }), t, t0 + 1.8, 960, 860, { s: 0.3 });
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'おなかの グーは なんの おと？', { size: 76, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'おなかの かわが、ふるえている'], ['②', 'いや ちょうが、ガスと えきたいを おしながす'], ['③', 'おなかの なかの むしが、ないている']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: i === 1 ? 42 : 48, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(torso(t, { inner: 0 }) + text(0, -20, '？', { size: 200, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 340, { s: 0.42 });
    out += pop(`<g transform="scale(0.5)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', look: [-5, -7] })}</g>`, t, 0.0, 1690, 850, { d: 0.4 });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1520, y: 720, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 胃と腸、しぼるように縮む
SCENES.push({
  id: 'tube',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.3, 0.4);
    if (aO > 0) {
      let a = g(torso(t, { inner: prog(t, cue(0) + 0.2, 0.6), glowStomach: win(t, cue(0) + 1.2, cue(1), 0.3), glowGut: win(t, cue(0) + 2.6, cue(1), 0.3) }), { x: 760, y: 470, s: 1.0 });
      a += callout(760 + 120, 470 - 160, 1250, 220, 'い', prog(t, cue(0) + 1.2, 0.3), { col: GT.wallDark, size: 54 });
      a += callout(760 + 120, 470 + 120, 1250, 560, 'ちょう', prog(t, cue(0) + 2.6, 0.3), { col: GT.wallDark, size: 54 });
      a += g(badge('かべは きんにく', { fill: GT.wallDark, size: 46 }), { x: 1460, y: 760, o: prog(t, cue(1) + 0.6, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = win(t, cue(2) - 0.3, cue(3) - 0.2, 0.4);
    if (bO > 0) {
      const wx = lerp(260, 1700, ((t - cue(2)) * 0.28) % 1);
      let b = gutTube(160, 1760, 480, 220, t, { wx, sq: 0.75, liquid: 0.3, gas: 0, seed: 2 });
      b += g(arrow2(wx + 120, 300, wx + 300, 300, C.accent, 12), {});
      b += g(badge('ねもとから じゅんに しぼる', { fill: C.accent, size: 46 }), { x: 960, y: 170, o: prog(t, cue(2) + 0.6, 0.3) });
      out += g(b, { o: bO });
    }
    const cO = prog(t, cue(3) - 0.3, 0.4);
    if (cO > 0) {
      const sq = eio(prog(t, cue(3) + 0.6, 2.6));
      let c = `<path d="M 0 -80 L 700 -60 Q 720 0 700 60 L 0 80 Z" fill="#e8eef4" stroke="#9aa5b1" stroke-width="6" transform="scale(1 ${1 - 0.0 * sq})"/>`;
      c += `<rect x="700" y="-40" width="60" height="80" rx="10" fill="#4a7fb0"/>`;
      c += `<path d="M 760 -16 Q ${800 + sq * 260} -20 ${820 + sq * 300} 0 Q ${800 + sq * 260} 20 760 16 Z" fill="#fff" stroke="#c9d6e0" stroke-width="4"/>`;
      c += `<g transform="translate(${lerp(40, 560, sq)} 0)"><rect x="-40" y="-110" width="80" height="220" rx="36" fill="${CH.skin}" stroke="${CH.skinShade}" stroke-width="6"/></g>`;
      c += `<rect x="0" y="-80" width="${lerp(40, 560, sq)}" height="160" fill="#c9d6e0" opacity="0.6"/>`;
      out += g(c, { x: 400, y: 480, o: cO });
      out += g(badge('はみがきこの チューブ と おなじ', { fill: C.blueUi, size: 46 }), { x: 960, y: 220, o: prog(t, cue(3) + 0.4, 0.3) });
    }
    return out;
  },
});

// 4. ガスと液体を押し流すとゴロゴロ
SCENES.push({
  id: 'sound',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(3) - 0.3, 0.4);
    if (aO > 0) {
      const run = t > cue(1) ? ((t - cue(1)) * 0.3) % 1.2 : -1;
      const wx = run < 0 ? -1e9 : lerp(100, 1900, run / 1.2);
      let a = gutTube(160, 1760, 480, 260, t, { wx, sq: 0.8, liquid: 0.35, gas: 9, push: run < 0 ? 0 : 1, seed: 4 });
      a += callout(560, 560, 420, 220, 'えきたい', prog(t, cue(0) + 0.8, 0.3), { col: '#c08a1a', size: 46 });
      a += callout(900, 420, 1100, 220, 'ガス', prog(t, cue(0) + 1.6, 0.3), { col: '#9a7b70', size: 46 });
      if (run >= 0) {
        const px = Math.min(1700, Math.max(wx + 140, t > cue(2) - 0.8 ? 520 : 0));  // おとうとにかぶらない
        a += g(text(0, 0, 'ゴロゴロ', { size: 70, w: 900, fill: C.redUi }), { x: px, y: 770 + Math.sin(t * 18) * 4, o: prog(t, cue(1) + 0.8, 0.3) });
        a += soundWaves(px + 60, 480, t, 0.8);
      }
      const bT = talking('B');
      a += pop(`<g transform="scale(0.44)">${brother(NOW.t, { pose: bT ? 'cheer' : 'stand', eyes: 'smile', mouth: 'open', hop: bT ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, cue(2) - 0.8, 220, 840);
      a += tipBubble('B', 480, 745, 272, 722);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(3) - 0.3, 0.4);
    if (bO > 0) {
      // 昔の人：おなかの中の虫（想像）
      let b = g(torso(t, { inner: 0 }), { x: 760, y: 500, s: 0.9 });
      const bug = `<ellipse rx="70" ry="44" fill="#9ac46a"/><circle cx="60" cy="-10" r="34" fill="#9ac46a"/><circle cx="70" cy="-20" r="8" fill="${C.ink}"/><path d="M 84 -40 q 20 -30 40 -20 M 72 -42 q 10 -36 30 -34" stroke="#6a9a3a" stroke-width="5" fill="none"/><path d="M 80 6 q 14 10 24 0" stroke="${C.ink}" stroke-width="5" fill="none"/>`;
      b += pop(bug, t, cue(3) + 0.6, 760, 520);
      b += g(text(0, 0, '♪', { size: 80, w: 900, fill: C.ochre }), { x: 900, y: 400 - ((t * 40) % 60), o: prog(t, cue(3) + 1.0, 0.3) });
      b += g(`<rect x="-300" y="-70" width="600" height="140" rx="30" fill="#fff" stroke="${C.ochre}" stroke-width="6"/>` + text(0, 2, '「はらの むしが なく」', { size: 52, w: 900, fill: C.ochre }), { x: 1400, y: 360, o: prog(t, cue(3) + 2.4, 0.3) });
      b += g(badge('むかしの ひとの かんがえ', { fill: C.muted, size: 40 }), { x: 1400, y: 200, o: prog(t, cue(3) + 0.4, 0.3) });
      b += g(text(0, 0, 'ほんとうは いや ちょうの おと', { size: 42, w: 900, fill: GT.wallDark }), { x: 1400, y: 520, o: prog(t, cue(3) + 4.0, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 5. からっぽは大きく、食べたあとはくぐもる
SCENES.push({
  id: 'empty',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const wx1 = lerp(80, 980, ((t * 0.3) % 1));
    let a = gutTube(140, 900, 400, 220, t, { wx: wx1, sq: 0.7, liquid: 0.22, gas: 5, seed: 6 });
    a += text(520, 200, 'からっぽ', { size: 56, w: 900 });
    a += g(soundWaves(920, 400, t, 1.2, C.redUi), { o: prog(t, cue(0) + 0.8, 0.3) });
    a += g(text(0, 0, 'ひびいて おおきい', { size: 44, w: 900, fill: C.redUi }), { x: 520, y: 620, o: prog(t, cue(0) + 2.4, 0.3) });
    out += pop(a, t, 0.3, 0, 0, { s: 1 });
    const bO = prog(t, cue(1) - 0.2, 0.4);
    if (bO > 0) {
      const wx2 = lerp(1020, 1920, ((t * 0.3 + 0.4) % 1));
      let b = gutTube(1080, 1820, 400, 220, t, { wx: wx2, sq: 0.5, liquid: 0.4, gas: 2, food: 9, seed: 7 });
      b += text(1450, 200, 'たべた あと', { size: 56, w: 900 });
      b += g(soundWaves(1830, 400, t, 0.45, C.muted), {});
      b += g(text(0, 0, 'くぐもって きづきにくい', { size: 44, w: 900, fill: C.muted }), { x: 1450, y: 620, o: prog(t, cue(1) + 2.4, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 6. 空腹のときの動き（3つの時期、1時間半〜2時間ごと）
SCENES.push({
  id: 'cycle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.3, 0.4);
    if (aO > 0) {
      let a = g(torso(t, { inner: 1, glowStomach: prog(t, cue(1) + 0.6, 0.5), glowGut: prog(t, cue(1) + 0.6, 0.5), wiggle: prog(t, cue(1) + 0.6, 0.5) }), { x: 960, y: 500, s: 0.95 });
      a += g(text(0, 0, '？', { size: 120, w: 900, fill: C.ochre }), { x: 1300, y: 260, o: win(t, cue(0) + 0.6, cue(1), 0.3) });
      a += g(badge('からっぽ → とくべつな うごき', { fill: C.accent, size: 46 }), { x: 960, y: 140, o: prog(t, cue(1) + 0.8, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = win(t, cue(2) - 0.3, cue(4) - 0.3, 0.4);
    if (bO > 0) {
      const ph = [['しずか', '#cfd8dc', cue(2) + 0.2, 0], ['ときどき', '#f2c46a', cue(2) + 2.0, 0.35], ['つよく しぼる', C.redUi, cue(2) + 3.8, 0.85]];
      let b = '';
      ph.forEach(([nm, col, st, sq], i) => {
        const k = prog(t, st, 0.4);
        if (k <= 0) return;
        const x = 380 + i * 580;
        const wx = sq > 0 ? lerp(x - 260, x + 260, ((t * 0.5 + i * 0.3) % 1)) : -1e9;
        const sqq = i === 1 ? sq * (Math.sin(t * 3) > 0.3 ? 1 : 0.2) : sq;
        b += g(gutTube(x - 230, x + 230, 470, 160, t, { wx, sq: sqq, liquid: 0.25, gas: 3, seed: 10 + i }) + badge(nm, { fill: col === '#cfd8dc' ? '#8a979e' : col, size: 44 }).replace(/^/, `<g transform="translate(${x} 280)">`) + '</g>' + text(x, 640, ['いちばん ながい', 'なかくらい', '5〜8ふんほど'][i], { size: 36, w: 900, fill: C.muted }), { o: k });
        if (i < 2) b += g(arrow2(x + 250, 470, x + 320, 470, C.muted, 8), { o: k });
      });
      out += g(b, { o: bO });
    }
    const cO = win(t, cue(3) - 0.3, cue(4) - 0.3, 0.4);
    if (cO > 0) {
      // 時間の帯
      let c = `<rect x="160" y="760" width="1600" height="16" rx="8" fill="${C.line}"/>`;
      for (let k = 0; k < 3; k++) {
        const x = 300 + k * 600;
        c += `<rect x="${x - 40}" y="740" width="80" height="56" rx="12" fill="${C.redUi}"/>` + text(x, 768, 'グー', { size: 28, w: 900, fill: '#fff' });
        if (k < 2) c += g(text(x + 300, 686, '1じかんはん〜2じかん', { size: 34, w: 900, fill: C.ochre }) + `<path d="M ${x + 50} 740 Q ${x + 300} 716 ${x + 550} 740" fill="none" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="10 8"/>`, {});
      }
      out += g(g(c, { y: 50 }), { o: cO });
    }
    const dO = prog(t, cue(4) - 0.3, 0.4);
    if (dO > 0) {
      const wx = lerp(100, 1900, ((t - cue(4)) * 0.35) % 1);
      let d = gutTube(160, 1760, 480, 260, t, { wx, sq: 0.9, liquid: 0.3, gas: 9, push: 1, seed: 20 });
      d += guu(Math.min(1600, wx + 160), 250, t, cue(4) + 0.4, 110) + guu(Math.min(1600, wx + 160), 250, t, cue(4) + 3.0, 110);
      d += g(badge('いっきに おしながす', { fill: C.redUi, size: 46 }), { x: 960, y: 760, o: prog(t, cue(4) + 1.0, 0.3) });
      out += g(d, { o: dO });
    }
    return out;
  },
});

// 7. そうじ係
SCENES.push({
  id: 'clean',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const run = ((t - 0.4) * 0.22) % 1;
    const wx = lerp(80, 1950, run);
    let a = gutTube(160, 1760, 470, 260, t, { wx, sq: 0.9, liquid: 0.2, gas: 0, seed: 30 });
    // かす（押し流される）
    for (let i = 0; i < 12; i++) {
      let x = lerp(220, 1500, rnd(i, 31)); if (x < wx + 50) x = Math.min(1720, x + (wx + 50 - x));
      const y = 470 + (rnd(i, 32) - 0.5) * 120;
      a += `<circle cx="${x}" cy="${y}" r="${12 + rnd(i, 33) * 10}" fill="#a8835a"/>`;
    }
    out += a;
    out += callout(700, 500, 760, 760, 'しょうかしきれなかった かす', prog(t, cue(0) + 1.2, 0.3), { col: '#8a6a4a', size: 42 });
    out += g(text(0, 0, 'だいちょうの ほうへ →', { size: 44, w: 900, fill: C.muted, anchor: 'end' }), { x: 1760, y: 250, o: prog(t, cue(0) + 2.0, 0.3) });
    out += pop(badge('「そうじがかり」', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) + 0.6, 760, 200);
    const kO = prog(t, cue(2) - 0.6, 0.4);
    if (kO > 0) {
      out += g(chameleon(NOW.t, { holdLens: true, mouth: lineOf('K') ? 'open' : 'smile' }), { x: 1535, y: 870, s: 0.55, o: kO });
      out += tipBubble('K', 1745, 705, 1625, 790);
    }
    return out;
  },
});

// 8. 合図のホルモン
SCENES.push({
  id: 'hormone',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4) * (1 - prog(t, cue(2) - 0.3, 0.4));
    const eat = eio(prog(t, cue(2) + 0.6, 1.2));
    if (aO > 0) {
      let a = g(torso(t, { inner: 1, glowStomach: 1 - eat, wiggle: 1 - eat }), { x: 620, y: 500, s: 0.95 });
      // 血管と合図のつぶ
      a += `<path d="M 1000 160 Q 1100 500 1000 840" fill="none" stroke="${GT.blood}" stroke-width="40" stroke-linecap="round" opacity="0.85"/>`;
      const n = Math.round(lerp(10, 2, eat));
      for (let i = 0; i < n; i++) {
        const p = ((t * 0.25 + i / 10) % 1), y = lerp(840, 160, p), x = 1000 + Math.sin(p * Math.PI) * 75;
        a += `<circle cx="${x}" cy="${y}" r="14" fill="#ffe08a" stroke="#c08a1a" stroke-width="4"/>`;
        if (p > 0.3 && p < 0.7) a += `<line x1="${x}" y1="${y}" x2="${720}" y2="${360}" stroke="#ffe08a" stroke-width="3" stroke-dasharray="6 8" opacity="${0.6 * (1 - eat)}"/>`;
      }
      a += callout(1080, 500, 1300, 300, 'ホルモン（あいず）', prog(t, cue(0) + 1.2, 0.3) * (1 - eat), { col: '#c08a1a', size: 46 });
      a += g(text(0, 0, 'ちに のって はこばれる', { size: 40, w: 900, fill: GT.blood, anchor: 'start' }), { x: 1260, y: 420, o: prog(t, cue(0) + 2.4, 0.3) * (1 - eat) });
      // 食べる
      if (eat > 0) {
        a += g(`<path d="M -120 0 Q 0 110 120 0 Z" fill="#c0624c" stroke="#8a4a3a" stroke-width="5"/><ellipse cx="0" cy="-10" rx="100" ry="40" fill="#f6f1e4"/>` + [0, 1, 2].map(k => `<circle cx="${-40 + k * 40}" cy="-26" r="22" fill="#fffdf6" stroke="#e8e0cc" stroke-width="3"/>`).join(''), { x: 1460, y: 360, o: eat, s: 1.7 });
        a += g(badge('たべると あいずが さがる', { fill: C.accent, size: 44 }), { x: 1460, y: 560, o: prog(t, cue(2) + 1.6, 0.3) });
        a += g(badge('うごきが とまる', { fill: C.blueUi, size: 44 }), { x: 1460, y: 680, o: prog(t, cue(2) + 2.6, 0.3) });
      }
      out += g(a, { o: aO });
    }
    const bO = win(t, cue(1) - 0.3, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      let b = pop(badge('1977ねん', { fill: C.ochre, size: 56 }), t, cue(1), 960, 260);
      b += pop(text(0, 0, 'ぐんま だいがく', { size: 60, w: 900 }), t, cue(1) + 0.8, 960, 400);
      b += pop(text(0, 0, 'いとう ぜん さんたち', { size: 60, w: 900, fill: C.blueUi }), t, cue(1) + 1.6, 960, 500);
      const dog = `<ellipse cx="0" cy="-60" rx="90" ry="50" fill="#d9b28a"/><circle cx="90" cy="-110" r="44" fill="#d9b28a"/><ellipse cx="80" cy="-150" rx="16" ry="30" fill="#b8916a" transform="rotate(-20 80 -150)"/><circle cx="104" cy="-116" r="6" fill="${C.ink}"/><circle cx="132" cy="-104" r="8" fill="${C.ink}"/>${[-60, -20, 30, 70].map(x => `<rect x="${x - 10}" y="-30" width="20" height="40" rx="8" fill="#c8a07a"/>`).join('')}<path d="M -90 -70 q -40 -30 -30 -60" stroke="#d9b28a" stroke-width="14" fill="none" stroke-linecap="round"/>`;
      b += pop(dog, t, cue(1) + 2.6, 960, 760);
      b += g(text(0, 0, 'いぬで たしかめた', { size: 44, w: 900, fill: C.muted }), { x: 1300, y: 720, o: prog(t, cue(1) + 3.0, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1360, 170) + `<circle cx="-590" cy="0" r="50" fill="${C.accent}"/>` + text(-590, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-492, 2, 'いや ちょうが、ガスと えきたいを おしながす', { size: 50, w: 900, anchor: 'start' }), t, 0.4, 960, 300);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 370, y: 300, o: ring, s: Math.max(back(ring), 0.001) });
      const wx = lerp(400, 1600, ((t * 0.35) % 1));
      a += pop(gutTube(460, 1460, 580, 160, t, { wx, sq: 0.8, liquid: 0.3, gas: 5, push: 1, seed: 40 }), t, 2.4, 0, 0);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 170);
      const warn = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
      const items = [
        [clock(10, 10, 0.6), 'おおきな グーが なったら とけいを みる', C.ink, cue(1)],
        [clock(11, 50, 0.6), 'つぎの グーまで 1じかんはん〜2じかん？', C.ink, cue(2)],
        [warn, 'ごはんを ぬいて ためさない', C.red, cue(3)],
      ];
      items.forEach(([ic, s, col, st], i) => { b += pop(ic + text(110, 2, s, { size: 46, w: 900, anchor: 'start', fill: col }), t, st, 230, 340 + i * 150); });
      b += pop(chameleon(NOW.t, { holdLens: true }), t, cue(1) + 0.8, 1660, 820, { s: 0.75 });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「おなかの おと」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

// みのまわり図鑑 動画「うんちは、どうして茶色いの？」
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


// この動画の題（左上のバッジと、キャラクターの出かたを決める乱数のもとになる）
const TOPIC = 'うんちの いろ';
const topBadge = (night = false) => {
  const str = 'みのまわり図鑑 ｜ ' + TOPIC, size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
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
// ---------- キャラクターの出かた（動画ごとに変わる） ----------
// VSEED は TOPIC から決まる。同じ動画なら何度書き出しても同じ、動画がちがえば出かた・動きが変わる。
const VSEED = (() => { let h = 7; for (const c of TOPIC) h = (h * 31 + c.charCodeAt(0)) % 100003; return h; })();
const vpick = (arr, key) => arr[Math.floor(rnd(VSEED * 0.013 + key * 1.7, 3.1) * arr.length) % arr.length];
// 出てくるときの動き
const KID_ENTER = ['pop', 'slideL', 'slideR', 'rise', 'drop', 'hop', 'spin', 'stretch'];
// 吹き出しが出ているあいだ（話しているあいだ）の動き
const KID_ACT = ['bounce', 'jump', 'wave', 'sway', 'nod', 'cheer', 'look', 'shrug', 'point', 'pointL', 'spin', 'tiptoe'];
// 頭のてっぺん（足もとからの高さ。scale 1 のとき）と頭の半径
const KID_HEAD = { S: [452, 92, 360], B: [370, 88, 282], K: [250, 70, 190] };
function kidBody(who, t, o) {
  if (who === 'S') return sister(t, o);
  if (who === 'B') return brother(t + 1, o);
  return `<g transform="scale(0.9)">${chameleon(t, { holdLens: true, mouth: o.mouth === 'open' ? 'open' : 'smile' })}</g>`;
}
// 話すキャラクターの絵＋動き＋吹き出し。
//   who: 'S' おねえちゃん / 'B' おとうと / 'K' カメレオン。x, y は足もと、s は大きさ。
//   start: 出てくる秒（場面の中の t）。n: その場面で何人目か（動きの選び分けに使う）。
//   enter / act を書かなければ、動画ごとにちがう動きが自動で選ばれる。bubble: false で吹き出しなし。
//   side: 吹き出しを出す向き 'right' | 'left'（書かなければ画面の右半分なら左に出す）。
function kidShow(who, t, x, y, { s = 0.5, start = 0, n = 0, enter = null, act = null, pose = null, eyes = null, mouth = null, look = [0, 0], bubble = true, side = null, end = 1e9, size = 46 } = {}) {
  const key = NOW.i * 7 + n * 3 + (who === 'S' ? 0 : who === 'B' ? 1 : 2);
  const en = enter || vpick(KID_ENTER, key), ac = act || vpick(KID_ACT, key + 50);
  const D = 0.6, e = clamp((t - start) / D), fade = clamp((end - t) / 0.3);
  if (e <= 0 || fade <= 0) return '';
  const T = NOW.t, tk = talking(who), L = lineOf(who);
  const since = L ? T - L.start : 0;
  // 出てくる動き
  let dx = 0, dy = 0, sc = 1, rot = 0, sx = 1, o = Math.min(1, e * 3) * fade;
  if (en === 'pop') sc = back(e);
  else if (en === 'slideL' || en === 'slideR') { const from = en === 'slideL' ? -x - 300 : 2220 - x; dx = from * (1 - eo(e)); dy = -Math.abs(Math.sin(e * Math.PI * 3)) * 18 * (1 - e); sx = (en === 'slideL' ? 1 : -1) * (e < 1 ? 1 : 1); }
  else if (en === 'rise') { dy = (1 - eo(e)) * 420; }
  else if (en === 'drop') { const b = e < 0.7 ? Math.pow(e / 0.7, 2) : 1 - Math.sin((e - 0.7) / 0.3 * Math.PI) * 0.12; dy = -(1 - b) * 600; }
  else if (en === 'hop') { dx = -220 * (1 - e) * (x > 960 ? -1 : 1); dy = -Math.abs(Math.sin(e * Math.PI * 2)) * 90 * (1 - e * 0.5); }
  else if (en === 'spin') { sc = eo(e); rot = (1 - eo(e)) * -300; }
  else if (en === 'stretch') { const k = Math.sin(e * Math.PI) * 0.25; sc = eo(e); sx = 1 + k; dy = 0; o *= 1; }
  // 話しているあいだの動き
  let pose2 = pose || 'stand', eyes2 = eyes || 'open', mouth2 = mouth || 'smile', look2 = look, hop = 0;
  if (tk) {
    mouth2 = mouth || 'open';
    if (ac === 'bounce') hop = Math.abs(Math.sin(T * 9)) * 14;
    else if (ac === 'jump') { pose2 = pose || 'jump'; hop = Math.abs(Math.sin(T * 6)) * 46; eyes2 = eyes || 'smile'; }
    else if (ac === 'wave') pose2 = pose || 'wave';
    else if (ac === 'sway') rot += Math.sin(T * 3.2) * 7;
    else if (ac === 'nod') { rot += Math.sin(T * 8) * 3; hop = Math.max(0, Math.sin(T * 8)) * 6; }
    else if (ac === 'cheer') { pose2 = pose || 'cheer'; eyes2 = eyes || 'smile'; hop = Math.abs(Math.sin(T * 7)) * 18; }
    else if (ac === 'look') { pose2 = pose || 'point'; look2 = [Math.sin(T * 2.5) * 8, -4]; eyes2 = eyes || 'wide'; }
    else if (ac === 'shrug') { pose2 = pose || 'shrug'; hop = Math.max(0, Math.sin(T * 5)) * 10; }
    else if (ac === 'point') pose2 = pose || 'point';
    else if (ac === 'pointL') pose2 = pose || 'pointL';
    else if (ac === 'spin') sx *= Math.cos(clamp(since / 0.6) * Math.PI * 2);
    else if (ac === 'tiptoe') { hop = 10 + Math.sin(T * 10) * 4; rot += Math.sin(T * 5) * 3; }
  }
  if (who === 'K') sx *= x > 960 ? 1 : -1;  // カメレオンは画面の内がわを向く
  const body = `<g transform="translate(${x + dx} ${y + dy}) rotate(${rot}) scale(${s * sc * sx} ${s * sc})">${kidBody(who, T, { pose: pose2, eyes: eyes2, mouth: mouth2, look: look2, hop })}</g>`;
  let out = `<g opacity="${o}">${body}</g>`;
  if (bubble && L) {
    const [top, r] = KID_HEAD[who], sd = side || (x > 1300 ? 'left' : 'right'), dir = sd === 'right' ? 1 : -1;
    const tipX = x + dx + dir * r * s * 0.55, tipY = y + dy - (top + 12) * s - hop * s;
    const w = tw(L.text, size, 700, 0.04) + 70, h = size * 2.3;
    out += talkBubble(who, tipX + dir * (w / 2 - 30), tipY - h / 2 - 46, tipX, tipY, size);
  }
  return out;
}
// しっぽの先を (tipX, tipY) に向けた吹き出し（話している行のあいだだけ出る）
function talkBubble(who, x, y, tipX, tipY, size = 44) {
  const L = lineOf(who); if (!L) return '';
  const k = back(clamp((NOW.t - L.start + 0.1) / 0.35));
  const o = Math.min(clamp((NOW.t - L.start + 0.1) / 0.15), clamp((L.end - NOW.t) / 0.25));
  const w = tw(L.text, size, 700, 0.04) + 70, h = size * 2.3;
  const dx = tipX - x, dy = tipY - y;
  let base;
  if (Math.abs(dy) - h / 2 > Math.abs(dx) - w / 2) {
    const bx = Math.max(-w / 2 + 40, Math.min(w / 2 - 40, dx)), by = Math.sign(dy) * (h / 2 - 4);
    base = `${bx - 22} ${by} L ${bx + 22} ${by}`;
  } else {
    const bx = Math.sign(dx) * (w / 2 - 4), by = Math.max(-h / 2 + 30, Math.min(h / 2 - 30, dy));
    base = `${bx} ${by - 18} L ${bx} ${by + 18}`;
  }
  const body = `<g filter="url(#shadow)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff"/><path d="M ${base} L ${dx} ${dy} Z" fill="#fff"/></g>` + text(0, 2, L.text, { size, fill: C.ink });
  return g(body, { x, y, s: Math.max(k, 0.001), o });
}
// おわりの場面で、どちらの子が左に立つか（動画ごとに変わる）
const END_SWAP = rnd(VSEED * 0.013, 9.7) < 0.5;

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
// みのまわり図鑑 動画「うんちは、どうして茶色いの？」（うんちの いろ）
// 出どころ：everyday-trivia trivia/poop-color.md（ほかに poop-bacteria.md, poop-basics.md）

// ---------- うんちの色の道具 ----------
const PC = {
  skin: '#f6d6bd', skinShade: '#ecc0a2', hair: '#4b3226', cheek: '#f2a99a',
  tube: '#f3aea2', tubeDk: '#c96a62', inside: '#fbe3dc', stom: '#f0a094',
  large: '#e09a84', largeDk: '#b3654f',
  poop: '#9a6a3c', poopDk: '#7a4f28', poopLt: '#b98850',
  pale: '#ece6d6', paleDk: '#a89c80', paleLt: '#fffdf5',
  cell: '#e0564a', cellDk: '#b3352c', cellOld: '#b9958e', cellOldDk: '#8a6d68', heme: '#d42a1e',
  bili: '#f6c21c', biliDk: '#a97c00',
  bile: '#c3cc3e', bileDk: '#7e8a14',
  uro: '#efe3c2', uroDk: '#8a7a4e',
  liver: '#b65a42', liverDk: '#8a3c2a',
  pee: '#f4d53a', peeDk: '#a98a00',
  bug: ['#4bb7a6', '#6aa8e0', '#e58ab8'], bugInk: '#2f8576',
  meco: '#2f5a3a', mecoLt: '#5a8a62',
  mush: '#e3d3b0', room: '#f3ead6', floor: '#e6d6b4',
};
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
// k 番目の行の、はじめから f（0〜1）のところの秒
const mid = (k, f = 0.5) => cue(k) + (cueE(k) - cue(k)) * f;

// ---- 折れ線の道具 ----
const _plc = new WeakMap();
function polyL(P) { let L = _plc.get(P); if (!L) { L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); _plc.set(P, L); } return L; }
const polyLen = P => { const L = polyL(P); return L[L.length - 1]; };
function polyAt(P, k) {
  const L = polyL(P), d = clamp(k) * L[L.length - 1]; let i = 1; while (i < P.length - 1 && L[i] < d) i++;
  const u = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)];
}
const bez = (a, b, c, d, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [0, 1].map(k => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k]); });
function subPts(P, f0, f1) {
  const n = Math.max(2, Math.ceil(polyLen(P) * (f1 - f0) / 5)), pts = [];
  for (let i = 0; i <= n; i++) pts.push(polyAt(P, lerp(f0, f1, i / n)).map(v => v.toFixed(1)).join(','));
  return pts.join(' ');
}
const ptsOf = P => P.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');

// ---- 小さな絵 ----
// 色のつぶ
const dot = (x, y, r, col, o = 1) => o <= 0.01 ? '' : `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="${mix(col, '#000000', 0.3)}" stroke-width="${Math.max(2, r * 0.22)}" opacity="${clamp(o)}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.28}" fill="#fff" opacity="${0.6 * clamp(o)}"/>`;
const carrot = (s = 1) => g(`<g transform="rotate(35)"><path d="M -6 -50 Q -30 -86 -14 -104 Q -2 -82 0 -50 Z" fill="#4c9a4a"/><path d="M 6 -50 Q 30 -86 14 -104 Q 2 -82 0 -50 Z" fill="#5fb05a"/><path d="M 0 -48 Q -4 -92 0 -112 Q 6 -90 2 -48 Z" fill="#3f8f4a"/>` +
  `<path d="M -24 -44 Q 0 -60 24 -44 Q 20 20 4 70 Q 0 78 -4 70 Q -20 20 -24 -44 Z" fill="#f08a2c" stroke="#d06f18" stroke-width="4" stroke-linejoin="round"/><path d="M -14 -18 L 2 -16 M 0 8 L 14 10 M -10 30 L 2 32" stroke="#d06f18" stroke-width="4" stroke-linecap="round"/></g>`, { s });
const spinach = (s = 1) => {
  const leaf = (r, col) => `<g transform="rotate(${r} 0 54)"><path d="M 0 54 L 0 -10" stroke="#8fc46a" stroke-width="9" stroke-linecap="round"/><path d="M 0 -84 C 36 -70 42 -20 0 4 C -42 -20 -36 -70 0 -84 Z" fill="${col}"/><path d="M 0 -68 L 0 -6" stroke="#8fc46a" stroke-width="4" stroke-linecap="round"/></g>`;
  return g(leaf(-30, '#2f8a3e') + leaf(30, '#2f8a3e') + leaf(0, '#3a9c48') + `<ellipse cx="0" cy="58" rx="12" ry="9" fill="#e79aa0"/>`, { s });
};
const tomato = (s = 1) => g(`<circle cx="0" cy="6" r="46" fill="#e2483a"/><circle cx="-16" cy="-10" r="10" fill="#fff" opacity="0.35"/><path d="M 0 -36 L -22 -44 L -8 -32 L -20 -20 L 0 -30 L 20 -20 L 8 -32 L 22 -44 Z" fill="#3f8f4a"/>`, { s });
const riceBowl = (s = 1) => g(`<path d="M -58 -8 Q -44 -64 0 -64 Q 44 -64 58 -8 Z" fill="#fff" stroke="#d9cfba" stroke-width="4"/><path d="M -72 -10 L 72 -10 Q 66 44 30 52 L -30 52 Q -66 44 -72 -10 Z" fill="#6fa3c4"/><rect x="-28" y="50" width="56" height="11" rx="4" fill="#4f86a8"/><path d="M -72 -10 L 72 -10" stroke="#4f86a8" stroke-width="5" stroke-linecap="round"/>`, { s });
// うんち（col: 色、line: ふちどり）
function poopPic(s = 1, { col = PC.poop, lt = PC.poopLt, face = true, line = null } = {}) {
  const sh = c => `<ellipse cx="0" cy="36" rx="64" ry="25" ${c}/><ellipse cx="0" cy="8" rx="47" ry="23" ${c}/><ellipse cx="0" cy="-18" rx="31" ry="19" ${c}/><path d="M -16 -28 Q -6 -64 20 -58 Q 8 -48 16 -28 Z" ${c}/>`;
  return g((line ? sh(`fill="${line}" stroke="${line}" stroke-width="9" stroke-linejoin="round"`) : '') + sh(`fill="${col}"`) +
    `<path d="M -40 30 Q -52 36 -44 44 M -28 2 Q -38 8 -32 14" fill="none" stroke="${lt}" stroke-width="7" stroke-linecap="round"/>` +
    (face ? `<circle cx="-16" cy="6" r="6" fill="#3a2a22"/><circle cx="16" cy="6" r="6" fill="#3a2a22"/><path d="M -12 24 Q 0 36 12 24" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>` : ''), { s });
}
const waterDrop = (x, y, s = 1, o = 1, col = '#58b4e6') => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -22 C 10 -6 16 2 16 10 A 16 16 0 0 1 -16 10 C -16 2 -10 -6 0 -22 Z" fill="${col}" opacity="${clamp(o)}"/>`;
// 赤いつぶ（赤血球）
const redCell = (x, y, s = 1, r = 0, col = PC.cell, dk = PC.cellDk) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><ellipse rx="100" ry="84" fill="${col}" stroke="${dk}" stroke-width="9"/><ellipse rx="50" ry="38" fill="${dk}" opacity="0.32"/><path d="M -72 -34 Q -50 -62 -14 -66" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.45"/></g>`;
// 肝臓
const LIVER_D = 'M -200 -30 C -205 -105 -90 -128 30 -120 C 150 -112 214 -72 204 -28 C 196 14 120 26 50 56 C -30 92 -150 104 -186 46 C -196 28 -199 0 -200 -30 Z';
const liverPic = (s = 1, hi = 0, t = 0) => g((hi > 0 ? `<path d="${LIVER_D}" fill="none" stroke="#ffd23a" stroke-width="52" stroke-linejoin="round" opacity="${hi * (0.55 + 0.3 * Math.sin(t * 6))}"/>` : '') +
  `<path d="${LIVER_D}" fill="${PC.liver}" stroke="${PC.liverDk}" stroke-width="9" stroke-linejoin="round"/><path d="M -150 -50 C -120 -92 -40 -100 20 -94" fill="none" stroke="#d98a70" stroke-width="12" stroke-linecap="round" opacity="0.7"/>`, { s });
// 腸の細菌（なかよしの顔）
const bug = (x, y, s, t, col, i = 0) => {
  const r = Math.sin(t * 2.2 + i * 1.7) * 14 + (rnd(i, 2) - 0.5) * 50, dk = mix(col, '#000000', 0.25);
  let b = '';
  for (let k = 0; k < 4; k++) { const xx = -36 + k * 24; b += `<path d="M ${xx} -24 q ${4 * Math.sin(t * 6 + k + i)} -10 0 -20 M ${xx} 24 q ${4 * Math.sin(t * 6 + k + i + 2)} 10 0 20" fill="none" stroke="${dk}" stroke-width="5" stroke-linecap="round"/>`; }
  b += `<rect x="-58" y="-28" width="116" height="56" rx="28" fill="${col}" stroke="${dk}" stroke-width="5"/><circle cx="-16" cy="-4" r="7" fill="#fff"/><circle cx="16" cy="-4" r="7" fill="#fff"/><circle cx="-15" cy="-3" r="3.5" fill="#2a2a2a"/><circle cx="17" cy="-3" r="3.5" fill="#2a2a2a"/><path d="M -10 11 Q 0 19 10 11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
  return g(b, { x: x + Math.sin(t * 1.7 + i) * 8, y: y + Math.cos(t * 2.1 + i * 2) * 8, s, r });
};
// 赤ちゃん
const babyPic = (s = 1, t = 0) => g(
  `<ellipse cx="-38" cy="116" rx="28" ry="19" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="4"/><ellipse cx="38" cy="116" rx="28" ry="19" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="4"/>` +
  `<ellipse cx="0" cy="50" rx="64" ry="68" fill="#fff" stroke="#e4dccb" stroke-width="5"/>` +
  `<path d="M -56 74 Q 0 92 56 74 Q 54 122 0 126 Q -54 122 -56 74 Z" fill="#dff0f6" stroke="#b9d9e6" stroke-width="4" stroke-linejoin="round"/>` +
  `<ellipse cx="-70" cy="26" rx="26" ry="16" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="4" transform="rotate(${-24 + Math.sin(t * 3) * 10} -52 30)"/><ellipse cx="70" cy="26" rx="26" ry="16" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="4" transform="rotate(${24 - Math.sin(t * 3 + 1) * 10} 52 30)"/>` +
  `<circle cx="0" cy="-60" r="74" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="5"/><path d="M -8 -132 Q 2 -158 22 -148 Q 8 -142 10 -128" fill="none" stroke="${PC.hair}" stroke-width="8" stroke-linecap="round"/>` +
  `<path d="M -38 -64 Q -26 -76 -14 -64 M 14 -64 Q 26 -76 38 -64" fill="none" stroke="#3a2a22" stroke-width="5.5" stroke-linecap="round"/><circle cx="-46" cy="-40" r="13" fill="${PC.cheek}" opacity="0.65"/><circle cx="46" cy="-40" r="13" fill="${PC.cheek}" opacity="0.65"/><path d="M -10 -38 Q 0 -28 10 -38" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>`, { s });
// 母子健康手帳
const handbook = (s = 1) => g(`<rect x="-92" y="-118" width="184" height="236" rx="16" fill="#f7b9c6" stroke="#d98a9c" stroke-width="6"/><rect x="-92" y="-118" width="26" height="236" rx="10" fill="#e59aac"/><rect x="-52" y="-96" width="130" height="78" rx="10" fill="#fff"/>` +
  ctext(13, -70, 'ぼし けんこう', { size: 18, w: 900 }) + ctext(13, -42, 'てちょう', { size: 20, w: 900 }) +
  `<circle cx="0" cy="30" r="24" fill="#fff"/><path d="M -34 92 Q -34 58 0 58 Q 34 58 34 92 Z" fill="#fff"/><circle cx="34" cy="62" r="14" fill="#fde8ec" stroke="#fff" stroke-width="4"/>`, { s });
// ちょうしんき（お医者さん）
const stetho = (s = 1) => g(`<path d="M -26 -46 L -26 -6 A 26 26 0 0 0 26 -6 L 26 -46" fill="none" stroke="${C.blueUi}" stroke-width="9" stroke-linecap="round"/><path d="M 0 20 L 0 34 Q 0 62 28 62 Q 54 62 54 36" fill="none" stroke="${C.blueUi}" stroke-width="9" stroke-linecap="round"/><circle cx="54" cy="24" r="14" fill="#fff" stroke="${C.blueUi}" stroke-width="8"/><circle cx="-26" cy="-50" r="7" fill="${C.blueUi}"/><circle cx="26" cy="-50" r="7" fill="${C.blueUi}"/>`, { s });
// 便色カードの色見本（絵の色はイメージ。本物のカードの色とはちがう）
const SW = ['#f6f2e8', '#f3ecd2', '#f0e4ae', '#ecd368', '#e3bd40', '#c9a13a', '#8c8a40'];
const swatch = (w, h, i) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.2}" fill="${SW[i]}" stroke="#bdb39a" stroke-width="4"/>`;

// ---- 体の絵（前から。口 → 食道 → 胃 → 小腸 → 大腸 → おしり、と 肝臓） ----
//   わかりやすくした絵で、管の太さ・長さ・位置は 本物の比率ではない
const TR = (() => {
  const eso = bez([0, -262], [0, -220], [2, -160], [26, -116], 16);
  const sto = bez([26, -116], [112, -124], [124, -20], [22, -6], 20);
  const inn = bez([22, -6], [-10, 0], [-112, 20], [-74, 84], 16);
  const serp = []; { const x0 = -74, x1 = 74, y0 = 84, dy = 28, rows = 6, r = dy / 2;
    for (let i = 0; i < rows; i++) { const y = y0 + i * dy, l2r = i % 2 === 0, xs = l2r ? [x0, x1] : [x1, x0]; serp.push([xs[0], y], [xs[1], y]);
      if (i < rows - 1) for (let j = 1; j < 8; j++) { const a = -Math.PI / 2 + j / 8 * Math.PI; serp.push([xs[1] + (l2r ? 1 : -1) * Math.cos(a) * r, y + r + Math.sin(a) * r]); } } }
  const join = bez([-74, 224], [-100, 224], [-112, 252], [-140, 252], 8);
  const sm = [...inn, ...serp.slice(1), ...join.slice(1)];
  const arc = (cx, cy, r, a0, a1) => Array.from({ length: 9 }, (_, i) => { const a = lerp(a0, a1, i / 8); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const lg = [[-140, 252], [-140, 60], ...arc(-112, 60, 28, Math.PI, Math.PI * 1.5), [112, 32], ...arc(112, 60, 28, -Math.PI / 2, 0), [140, 232]];
  const sig = bez([140, 232], [140, 306], [40, 262], [0, 312], 14);
  const rec = [[0, 312], [0, 386]];
  return { eso, sto, sm, lg: [...lg, ...sig.slice(1)], rec };
})();
const STOM_D = 'M 10 -128 C 40 -154 120 -150 132 -92 C 142 -42 104 -2 56 0 C 38 0 30 -10 16 8 L 0 -14 C 14 -28 30 -36 36 -58 C 40 -84 14 -100 10 -128 Z';
// 肝臓 → 管 → 小腸 の道すじ（体の絵の中の印が進む）
const MAPP = [[-74, -98], [-54, -62], [-42, -28], [-24, 0], ...TR.sm.slice(6)];
// tract: 管を見せる 0〜1。hi: 光らせる所 'sm'|'lg'。liver: 肝臓を見せる 0〜1、liverHi: 肝臓を光らせる
function bodyMap(t, { tract = 1, hi = null, liver = 0, liverHi = 0, marks = [] } = {}) {
  let s = `<path d="M -62 -205 Q -200 -200 -214 -120 L -206 330 Q -200 402 -130 406 L 130 406 Q 200 402 206 330 L 214 -120 Q 200 -200 62 -205 Z" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="7"/>`;
  s += `<rect x="-36" y="-222" width="72" height="40" fill="${PC.skin}"/>`;
  s += `<circle cx="-104" cy="-300" r="17" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="5"/><circle cx="104" cy="-300" r="17" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="5"/>`;
  s += `<circle cx="0" cy="-305" r="105" fill="${PC.skin}" stroke="${PC.skinShade}" stroke-width="7"/>`;
  s += `<path d="M -106 -310 A 106 106 0 0 1 106 -310 Q 96 -352 60 -356 Q 30 -340 0 -356 Q -30 -340 -60 -356 Q -96 -352 -106 -310 Z" fill="${PC.hair}"/>`;
  const blink = (t % 3.7) > 3.55;
  s += `<ellipse cx="-36" cy="-312" rx="8" ry="${blink ? 2 : 11}" fill="#3a2a22"/><ellipse cx="36" cy="-312" rx="8" ry="${blink ? 2 : 11}" fill="#3a2a22"/>`;
  s += `<circle cx="-62" cy="-282" r="13" fill="${PC.cheek}" opacity="0.6"/><circle cx="62" cy="-282" r="13" fill="${PC.cheek}" opacity="0.6"/>`;
  if (tract <= 0) return s + `<path d="M -16 -264 Q 0 -252 16 -264" fill="none" stroke="#3a2a22" stroke-width="6" stroke-linecap="round"/>`;
  const pulse = 0.55 + 0.3 * Math.sin(t * 6);
  const seg = (P, w, col, dk, key) => { const pts = ptsOf(P);
    return (hi === key ? `<polyline points="${pts}" fill="none" stroke="#ffd23a" stroke-width="${w + 26}" stroke-linecap="round" stroke-linejoin="round" opacity="${pulse}"/>` : '') +
      `<polyline points="${pts}" fill="none" stroke="${dk}" stroke-width="${w + 7}" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; };
  let o = seg(TR.sm, 15, PC.tube, PC.tubeDk, 'sm') + seg(TR.lg, 30, PC.large, PC.largeDk, 'lg') + seg(TR.rec, 30, PC.large, PC.largeDk, 'x');
  o += `<path d="${STOM_D}" fill="${PC.stom}" stroke="${PC.tubeDk}" stroke-width="6" stroke-linejoin="round"/>` + seg(TR.eso, 13, PC.tube, PC.tubeDk, 'eso');
  o += `<ellipse cx="0" cy="-262" rx="19" ry="13" fill="#8a3a32" stroke="${PC.tubeDk}" stroke-width="5"/>`;
  if (liver > 0) o += g(`<polyline points="-54,-62 -42,-28 -24,0" fill="none" stroke="${PC.bileDk}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><polyline points="-54,-62 -42,-28 -24,0" fill="none" stroke="${PC.bile}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` + g(liverPic(0.42, liverHi, t), { x: -74, y: -98 }), { o: liver });
  s += g(o, { o: tract });
  marks.forEach(([x, y, c]) => { s += `<circle cx="${x}" cy="${y}" r="19" fill="#fff" opacity="0.9"/>` + dot(x, y, 13, c); });
  return s;
}
// 体の絵を置く場所（説明の場面では、左に置く）と、右の説明の わく
const BM = { x: 300, y: 483, s: 0.86 };
const PN = { x: 1190, y: 470, w: 1240, h: 640 };
const panel = (fill = '#fff') => g(card(PN.w, PN.h, { fill }), { x: PN.x, y: PN.y });
const titleAt = (str, t, st, en = 1e9, col = C.ink, x = PN.x, y = PN.y - PN.h / 2 + 62, size = 42) => pop(badge(str, { fill: col, size }), t, st, x, y, { end: en });
// 矢印でつないだチップの列
function flowRow(items, t, cx, y, { size = 36, gap = 60, start = 0, step = 0.8 } = {}) {
  const ws = items.map(([s]) => tw(s, size, 700, 0.04) + 68), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = cx - tot / 2, out = '';
  items.forEach(([s, col], i) => { const st = start + i * step; out += pop(badge(s, { fill: col, size }), t, st, x + ws[i] / 2, y); if (i) out += g(arrow2(x - gap + 10, y, x - 10, y, C.ochre, 9), { o: prog(t, st - 0.2, 0.3) }); x += ws[i] + gap; });
  return out;
}

// 1. つかみ：にんじんはオレンジ、ほうれんそうは緑。でも、うんちは だいたい茶色
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3), h0 = mid(0, 0.5);
    let out = `<rect width="1920" height="1080" fill="${PC.room}"/><rect y="800" width="1920" height="280" fill="${PC.floor}"/>`;
    out += `<rect x="80" y="84" width="250" height="170" rx="14" fill="#cfe6f2" stroke="#fff" stroke-width="14"/><line x1="205" y1="84" x2="205" y2="254" stroke="#fff" stroke-width="10"/><line x1="80" y1="169" x2="330" y2="169" stroke="#fff" stroke-width="10"/>` + cloud(140, 140, 0.26) + cloud(272, 222, 0.22);
    // テーブルと 食べもの
    out += `<rect x="90" y="610" width="840" height="38" rx="14" fill="#c9a77c"/><rect x="150" y="648" width="34" height="166" fill="#b8946a"/><rect x="836" y="648" width="34" height="166" fill="#b8946a"/>`;
    out += `<ellipse cx="510" cy="602" rx="390" ry="20" fill="#fff" stroke="#d9cfba" stroke-width="4"/>`;
    const lE = cueE(1) + 0.2;
    out += pop(carrot(1.55), t, c0 + 0.1, 330, 500) + pop(badge('オレンジ', { fill: '#d06f18', size: 44 }), t, c0 + 0.6, 330, 318, { end: lE });
    out += pop(spinach(1.5), t, h0, 690, 492) + pop(badge('みどり', { fill: '#2f8a3e', size: 44 }), t, h0 + 0.5, 690, 318, { end: lE });
    out += pop(tomato(1.1), t, c1 + 0.2, 500, 548) + pop(riceBowl(1.0), t, c1 + 0.5, 850, 548) + pop(tomato(0.8), t, c1 + 0.35, 180, 560);
    // どれを食べても、うんちは だいたい茶色
    const pS = mid(1, 0.5), PX = 1290, PY = 600;
    out += g(arrow2(970, 560, 1110, 590, C.ochre, 16), { o: prog(t, pS - 0.5, 0.3) });
    out += pop(poopPic(2.2), t, pS, PX, PY);
    out += pop(badge('だいたい ちゃいろ', { fill: PC.poopDk, size: 46 }), t, pS + 0.7, PX, 806);
    out += kidShow('S', t, 1700, 850, { s: 0.8, start: -1, n: 0, side: 'left', size: 50 });
    // どうして？
    const qO = win(t, c3 + 0.4, cueE(3) + 0.6, 0.3);
    out += `<circle cx="${PX}" cy="${PY}" r="${164 + 5 * Math.sin(t * 6)}" fill="none" stroke="${C.red}" stroke-width="9" stroke-dasharray="18 14" opacity="${qO}"/>`;
    out += g(text(0, 0, '？', { size: 190, w: 900, fill: C.ochre, extra: `stroke="${PC.room}" stroke-width="18" paint-order="stroke"` }), { x: PX, y: 300, o: win(t, c3 + 0.8, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">うんちは、どうして</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${PC.poopDk}">ちゃいろ</tspan>なの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(carrot(1.0), { x: -400, y: -4 }) + g(spinach(0.95), { x: -270, y: -6 }) + arrow2(-180, 0, -70, 0, C.ochre, 14) + text(20, -4, '？', { size: 110, w: 900, fill: C.ochre }) + arrow2(110, 0, 220, 0, C.ochre, 14) + g(poopPic(1.15), { x: 340, y: -4 }), t, t0 + 1.8, 960, 780);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'うんちは、どうして ちゃいろいと おもう？', { size: 62, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', ['ちゃいろい たべものを、たくさん たべて いるから']], ['②', ['いろいろな いろの たべものが、', 'おなかの なかで まざるから']], ['③', ['ふるく なった ちから できた いろの もとを、', 'おなかの さいきんが、ちゃいろに かえるから']]];
    const cur = curLine(), osz = Math.min(...opts.flatMap(([, L]) => L.map(s => fit(s, 1040, 42))));
    opts.forEach(([n, L], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-80" width="1260" height="160" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 140) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        L.map((s, j) => text(-460, 2 + (j - (L.length - 1) / 2) * (osz + 14), s, { size: osz, w: 700, anchor: 'start' })).join(''), t, cue(i + 1) - 0.2, 820, 384 + i * 166);
    });
    out += pop(poopPic(1.5) + text(110, -70, '？', { size: 120, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1660, 340);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1550, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 茶色のもとは、食べものの色ではない。体の中でつくられる色
SCENES.push({
  id: 'food',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), xT = mid(0, 0.62);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // 左：どちらを食べても茶色
    const q = 'たべものの いろ？', qw = tw(q, 44, 700, 0.04) + 68;
    out += pop(badge(q, { fill: C.ink, size: 44 }), t, 0.3, 500, 210);
    const xk = prog(t, xT, 0.35);
    if (xk > 0) out += g(cross(0, 0, 0.62, C.red), { x: 500 + qw / 2 + 70, y: 210, s: Math.max(back(xk), 0.001), o: xk });
    [[carrot(1.25), 370, 'にんじん'], [spinach(1.2), 628, 'ほうれんそう']].forEach(([ic, y, nm], i) => {
      const st = 0.5 + i * 0.5;
      out += pop(ic, t, st, 240, y) + g(ctext(240, y + 106, nm, { size: 34, w: 900, fill: C.muted }), { o: prog(t, st + 0.2, 0.3) });
      out += g(arrow2(360, y, 560, y, C.ochre, 13), { o: prog(t, st + 0.5, 0.3) });
      out += pop(poopPic(1.3), t, st + 0.9, 700, y);
    });
    out += pop(badge('どちらも ちゃいろ', { fill: PC.poopDk, size: 40 }), t, 2.6, 700, 790);
    // 右：体の中でつくられる色
    const BX = 1420, BY = 545, BS = 0.6, gl = prog(t, c1 + 0.2, 0.6);
    out += pop(bodyMap(t, { tract: 0 }), t, 0.4, BX, BY, { s: BS });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: BX, y: BY + 70, o: win(t, 1.0, c1 + 0.2, 0.3) });
    if (gl > 0) {
      const gy = BY + 70;
      out += `<circle cx="${BX}" cy="${gy}" r="${96 + 8 * Math.sin(t * 5)}" fill="${PC.bili}" opacity="${0.5 * gl}" filter="url(#glow)"/>`;
      [PC.heme, PC.bili, PC.poop].forEach((c, i) => { const a = t * 1.6 + i * 2.094; out += dot(BX + Math.cos(a) * 46, gy + Math.sin(a) * 34, 19, c, gl); });
    }
    out += pop(badge('からだの なかで つくられる いろ', { fill: C.accent, size: 42 }), t, c1 + 0.4, BX, 200);
    return out;
  },
});

// 4. 血の中の赤いつぶ → 古くなるとこわされる → 赤い色のもとが 黄色っぽいものに
SCENES.push({
  id: 'blood',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A. 血管の中を流れる 赤いつぶ
    const aO = 1 - prog(t, c1 - 0.5, 0.4);
    if (aO > 0) {
      let a = `<rect x="0" y="330" width="1920" height="380" fill="#fbdcd6"/><rect x="0" y="316" width="1920" height="26" fill="${PC.cellDk}"/><rect x="0" y="698" width="1920" height="26" fill="${PC.cellDk}"/>`;
      for (let i = 0; i < 13; i++) { const x = ((i * 171 + t * 150) % 2223) - 150, y = 520 + (rnd(i, 2) - 0.5) * 230 + Math.sin(t * 2 + i) * 8; a += redCell(x, y, 0.52 + rnd(i, 4) * 0.14, rnd(i, 5) * 40 - 20 + Math.sin(t * 1.5 + i) * 10); }
      a += pop(badge('ちの なかの あかい つぶ', { fill: PC.cellDk, size: 48 }), t, c0 + 0.3, 960, 210);
      a += g(ctext(960, 782, 'せっけっきゅう', { size: 34, w: 900, fill: PC.cellDk }), { o: prog(t, c0 + 1.2, 0.4) });
      out += g(a, { o: aO });
    }
    // B. 大きくした 赤いつぶ
    const bO = prog(t, c1 - 0.3, 0.4);
    if (bO > 0) {
      const CX = 520, CY = 530, R = 200, TX = 1180, TY = 520;
      const old = prog(t, c2 + 0.2, 1.2), bS = mid(2, 0.55), brk = prog(t, bS, 0.9);
      const col = mix(PC.cell, PC.cellOld, old), dk = mix(PC.cellDk, PC.cellOldDk, old);
      let b = '';
      if (brk <= 0) { const wob = old > 0 ? 1 + 0.015 * Math.sin(t * 9) * old : 1; b += `<g transform="translate(${CX} ${CY}) scale(${wob} ${2 - wob})"><circle r="${R}" fill="${col}" stroke="${dk}" stroke-width="12"/><circle r="${R * 0.52}" fill="${dk}" opacity="0.22"/><path d="M -140 -90 Q -100 -150 -30 -164" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.4"/></g>`; }
      else for (let k = 0; k < 6; k++) {   // こわれた かけら（うすく残す）
        const a0 = k * Math.PI / 3, a1 = a0 + Math.PI / 3, am = (a0 + a1) / 2, d = eo(brk) * 64;
        b += `<path transform="translate(${CX + Math.cos(am) * d} ${CY + Math.sin(am) * d}) rotate(${brk * 14 * (k % 2 ? 1 : -1)})" d="M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z" fill="${col}" stroke="${dk}" stroke-width="10" stroke-linejoin="round" opacity="${lerp(1, 0.3, brk)}"/>`;
      }
      // 赤い色のもと（つぶの中の点） → 右へ出て 黄色っぽく
      const ND = 16, hA = i => i * 2.4 + rnd(i, 1) * 0.6, hR = i => (0.25 + 0.6 * Math.sqrt((i + 0.5) / ND)) * R; let allY = 1;
      const tagI = [...Array(ND).keys()].sort((p, q) => (Math.cos(hA(q)) - Math.sin(hA(q))) * hR(q) - (Math.cos(hA(p)) - Math.sin(hA(p))) * hR(p))[0];
      const tgO = prog(t, c1 + 1.0, 0.3) * (1 - prog(t, bS - 0.2, 0.3));
      b += tag(CX + Math.cos(hA(tagI)) * hR(tagI), CY + Math.sin(hA(tagI)) * hR(tagI), 900, 350, 'あかい いろの もと', tgO, { col: PC.heme, size: 42 }) + g(ctext(900, 412, 'ヘモグロビン', { size: 30, w: 900, fill: C.muted }), { o: tgO });
      for (let i = 0; i < ND; i++) {
        const a = hA(i), rr = hR(i) * (1 + 0.25 * eo(brk));
        const x0 = CX + Math.cos(a) * rr + Math.sin(t * 1.6 + i) * 5, y0 = CY + Math.sin(a) * rr + Math.cos(t * 1.9 + i * 2) * 5;
        const b2 = i * 2.4 + 1, q = 34 + 86 * Math.sqrt((i + 0.5) / ND);
        const x1 = TX + Math.cos(b2) * q * 1.15 + Math.sin(t * 1.4 + i) * 4, y1 = TY + Math.sin(b2) * q + Math.cos(t * 1.7 + i) * 4;
        const m = eio(prog(t, c3 + 0.3 + i * 0.1, 1.5)), yk = prog(t, c3 + 1.0 + i * 0.1, 0.9); allY = Math.min(allY, yk);
        b += dot(lerp(x0, x1, m), lerp(y0, y1, m) - Math.sin(m * Math.PI) * 60, 21, mix(PC.heme, PC.bili, yk));
      }
      b += g(arrow2(790, TY, 960, TY, C.ochre, 16), { o: prog(t, c3 + 0.2, 0.3) });
      b += pop(badge('きいろい もと', { fill: PC.biliDk, size: 48 }), t, c3 + 2.2, TX, 300);
      b += g(ctext(TX, 372, 'ビリルビン', { size: 30, w: 900, fill: C.muted }), { o: prog(t, c3 + 2.5, 0.3) });
      if (allY > 0) for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + t * 0.8; b += `<circle cx="${TX + Math.cos(a) * 190}" cy="${TY + Math.sin(a) * 150}" r="${6 + 3 * Math.sin(t * 5 + i)}" fill="${C.yellow}" opacity="${allY}"/>`; }
      out += g(b, { o: bO });
      out += titleAt('あかい つぶの なかに、あかい いろの もと', t, c1 + 0.1, c2 - 0.1, PC.cellDk, 960, 200, 44) + titleAt('ふるく なると、こわされる', t, c2 + 0.2, c3 - 0.1, PC.cellOldDk, 960, 200, 44) + titleAt('あかい いろの もとが、きいろっぽい ものに', t, c3 + 0.2, 1e9, PC.biliDk, 960, 200, 44);
    }
    out += kidShow('B', t, 1766, 846, { s: 0.42, start: cue(4) - 0.9, n: 0, side: 'left', size: 42 });
    return out;
  },
});

// 5. 黄色いもとは、肝臓がつくる胆汁にまざって、小腸へ
SCENES.push({
  id: 'bile',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // 左：体の絵（肝臓 → 管 → 小腸）
    const mk = polyAt(MAPP, 0.4 * prog(t, c2 + 0.4, D - c2 - 1.0));
    out += g(bodyMap(t, { liver: 1, liverHi: t < c2 ? 1 : 0, hi: t >= c2 + 1.0 ? 'sm' : null, marks: [[mk[0], mk[1], t < mid(0, 0.5) ? PC.bili : mix(PC.bili, PC.bile, 0.5)]] }), { x: BM.x, y: BM.y, s: BM.s });
    out += panel();
    const LX = 900, LY = 395, TY = 700, TX0 = 640, TX1 = 1740, DX = 900;
    const flow = prog(t, c2 + 0.2, 1.0), pool = prog(t, mid(0, 0.42), 0.7);
    // 小腸（横の管）と、肝臓からの管
    let p = `<line x1="${TX0}" y1="${TY}" x2="${TX1}" y2="${TY}" stroke="${PC.tubeDk}" stroke-width="112"/><line x1="${TX0}" y1="${TY}" x2="${TX1}" y2="${TY}" stroke="${PC.inside}" stroke-width="88"/>`;
    for (let i = 0; i < 6; i++) { const x = TX0 + ((i * 190 + t * 30) % 1100), w = Math.min(1, (x - TX0) / 60, (TX1 - x) / 60); p += `<ellipse cx="${x}" cy="${TY + 14 + Math.sin(t * 1.4 + i) * 5}" rx="${40 + rnd(i, 3) * 20}" ry="${18 + rnd(i, 4) * 8}" fill="${PC.mush}" opacity="${0.9 * clamp(w)}"/>`; }
    p += `<line x1="${DX}" y1="${LY + 40}" x2="${DX}" y2="${TY - 40}" stroke="${PC.bileDk}" stroke-width="40"/><line x1="${DX}" y1="${LY + 40}" x2="${DX}" y2="${TY - 30}" stroke="${PC.inside}" stroke-width="24"/>`;
    if (flow > 0) {
      p += `<line x1="${DX}" y1="${LY + 40}" x2="${DX}" y2="${lerp(LY + 40, TY - 10, flow)}" stroke="${PC.bile}" stroke-width="24"/>`;
      const sp = prog(t, c2 + 1.2, 3.0);
      if (sp > 0) p += `<rect x="${DX - 40}" y="${TY - 34}" width="${40 + lerp(0, TX1 - DX - 20, sp)}" height="68" rx="34" fill="${PC.bile}" opacity="0.55"/>`;
    }
    out += p + g(liverPic(1.0), { x: LX, y: LY });
    // 胆汁のたまり（肝臓の中）と 黄色いもと
    const PX = LX + 26, PY = LY + 4;
    if (pool > 0) out += `<ellipse cx="${PX}" cy="${PY}" rx="${128 * pool}" ry="${48 * pool}" fill="${PC.bile}" stroke="${PC.bileDk}" stroke-width="5" opacity="${pool}"/>`;
    const FP = [[PX, PY], [DX, LY + 60], [DX, TY - 10], [DX + 60, TY], [TX1 - 40, TY]];
    for (let i = 0; i < 7; i++) {
      const k = eio(prog(t, c0 + 0.4 + i * 0.28, 1.5)), a = i * 0.9 + t * 0.7;
      const hx = PX + Math.cos(a) * 84, hy = PY + Math.sin(a) * 24;
      let x = lerp(604, hx, k), y = lerp(300 + i * 16, hy, k) - Math.sin(k * Math.PI) * 30, o = prog(t, c0 + 0.4 + i * 0.28, 0.2);
      const f = prog(t, c2 + 0.4 + i * 0.38, 3.4);
      if (f > 0) { const [fx, fy] = polyAt(FP, f); x = lerp(hx, fx, clamp(f * 12)); y = lerp(hy, fy, clamp(f * 12)) + (f > 0.4 ? Math.sin(t * 3 + i) * 10 : 0); }
      out += dot(x, y, 17, PC.bili, o);
    }
    if (flow > 0) for (let j = 0; j < 7; j++) { const q = (t * 0.22 + j / 7) % 1, [x, y] = polyAt(FP, q); out += waterDrop(x + (j % 2 ? 12 : -12), y + 8, 0.9, flow * Math.min(1, q * 10, (1 - q) * 6) * 0.9, PC.bileDk); }
    out += tag(LX - 130, LY + 44, 716, 560, 'かんぞう', prog(t, c0 + 0.4, 0.3), { col: PC.liverDk, size: 42 });
    out += tag(PX + 70, PY + 26, 1136, 592, 'たんじゅう', prog(t, mid(0, 0.5), 0.3), { col: PC.bileDk, size: 42 });
    out += tag(1500, TY - 20, 1560, 592, 'しょうちょう', prog(t, c2 + 1.4, 0.3), { col: PC.tubeDk, size: 42 });
    // 胆汁は、あぶらを とりこむのを助ける液
    const s1 = 'あぶらを からだに', s2 = 'とりこむのを たすける えき', isz = fit(s2, 430, 36, 900);
    let ic = card(480, 250, { fill: '#fbf7e3' }) + waterDrop(-186, -66, 2.0, 1, PC.bile) + text(-146, -62, 'たんじゅう', { size: 42, w: 900, anchor: 'start', fill: PC.bileDk });
    [[150, -74, 20], [186, -50, 13], [128, -44, 11]].forEach(([x, y, r]) => { ic += `<circle cx="${x}" cy="${y}" r="${r}" fill="#f5b942" stroke="#d6952a" stroke-width="3"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.3}" fill="#fff" opacity="0.7"/>`; });
    ic += ctext(0, 20, s1, { size: isz, w: 900 }) + ctext(0, 74, s2, { size: isz, w: 900 });
    out += pop(ic, t, c1 + 0.3, 1500, 410);
    out += titleAt('きいろい もとは、たんじゅうに まざる', t, c0 + 0.3, c2 - 0.1, PC.bileDk) + titleAt('たんじゅうと いっしょに、しょうちょうへ', t, c2 + 0.2, 1e9, PC.tubeDk);
    return out;
  },
});

// 6. 腸の細菌が、黄色いもとを変える → 一部は おしっこの黄色、残りは うんちの茶色
SCENES.push({
  id: 'bacteria',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const X0 = -40, X1 = 1400, CY = 590, H = 112, n = 10, bw = (X1 - X0) / n, VY = 300, UX = 950;
    // 血管（上）
    const vO = prog(t, c2 - 0.2, 0.5);
    if (vO > 0) {
      const VP = `M ${UX} ${CY - H - 20} L ${UX} ${VY} L 1530 ${VY}`;
      out += g(`<path d="${VP}" fill="none" stroke="${PC.cellDk}" stroke-width="50" stroke-linejoin="round" stroke-linecap="round"/><path d="${VP}" fill="none" stroke="#f6b3ab" stroke-width="34" stroke-linejoin="round" stroke-linecap="round"/>` + arrow2(1540, VY, 1580, VY, PC.cellDk, 12), { o: vO });
    }
    // 腸の中
    let top = `M ${X0} ${CY - H}`, bot = `M ${X0} ${CY + H}`, fillB = '';
    for (let i = 0; i < n; i++) { top += ` Q ${X0 + (i + 0.5) * bw} ${CY - H - 40} ${X0 + (i + 1) * bw} ${CY - H}`; bot += ` Q ${X0 + (i + 0.5) * bw} ${CY + H + 40} ${X0 + (i + 1) * bw} ${CY + H}`; fillB += `<ellipse cx="${X0 + (i + 0.5) * bw}" cy="${CY}" rx="${bw / 2 + 2}" ry="${H + 19}" fill="${PC.inside}"/>`; }
    out += `<rect x="${X0}" y="${CY - H}" width="${X1 - X0}" height="${H * 2}" fill="${PC.inside}"/>` + fillB + `<path d="${top}" fill="none" stroke="${PC.largeDk}" stroke-width="16" stroke-linecap="round"/><path d="${bot}" fill="none" stroke="${PC.largeDk}" stroke-width="16" stroke-linecap="round"/>`;
    out += `<linearGradient id="fadeR" x1="0" x2="1"><stop offset="0" stop-color="${C.paper}" stop-opacity="0"/><stop offset="0.8" stop-color="${C.paper}"/></linearGradient><rect x="1330" y="${CY - H - 60}" width="110" height="${H * 2 + 120}" fill="url(#fadeR)"/>`;
    // 細菌
    for (let i = 0; i < 11; i++) {
      const x = 520 + (i % 4) * 100 + rnd(i, 7) * 40, y = CY - 62 + Math.floor(i / 4) * 62 + (rnd(i, 8) - 0.5) * 16;
      out += pop(bug(0, 0, 0.62 + rnd(i, 9) * 0.14, t, PC.bug[i % 3], i), t, c0 + 0.5 + i * 0.13, x, y);
    }
    // 色のつぶの流れ：黄色いもと → べつのもの →（残り）茶色
    const sO = prog(t, c1 - 0.2, 0.5), NS = 16;
    if (sO > 0) for (let i = 0; i < NS; i++) {
      const p = (t * 0.085 + i / NS) % 1, x = lerp(-30, 1290, p), y = CY + (rnd(i, 3) - 0.5) * 130 + Math.sin(t * 2 + i) * 8;
      let col = mix(PC.bili, PC.uro, clamp((x - 540) / 300)), o = sO * (1 - clamp((x - 1220) / 60));
      if (x > 990 && t > c4) col = mix(PC.uro, PC.poop, clamp((x - 990) / 190) * prog(t, c4, 0.6));
      if (i % 2 === 0 && x > UX - 20) o *= 1 - prog(t, c2 - 0.2, 0.4);
      out += dot(x, y, 16, col, o);
    }
    // 一部は血にもどって、おしっこの黄色のもとに
    if (vO > 0) {
      const UP = [[UX, CY - 30], [UX, VY], [1530, VY]];
      for (let j = 0; j < 6; j++) { const q = (t * 0.13 + j / 6) % 1, [x, y] = polyAt(UP, q); out += dot(x, y, 15, mix(PC.uro, PC.pee, clamp((q - 0.35) / 0.4)), vO * Math.min(1, q * 10, (1 - q) * 10)); }
      out += pop(waterDrop(0, 0, 4.2, 1, PC.pee) + `<path d="M -26 30 Q -30 56 -6 62" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="0.6"/>`, t, c2 + 1.6, 1660, 284);
      out += pop(badge('おしっこの きいろ', { fill: PC.peeDk, size: 36 }), t, c2 + 2.0, 1650, 410);
      out += tag(UX, 404, 1160, 388, 'ちに もどる', prog(t, c2 + 0.5, 0.3), { col: PC.cellDk, size: 38 });
    }
    // 残りは、もっと茶色いものに変わって、うんちを茶色く
    const lS = c4 + 0.4, LXp = 1240, lk = prog(t, lS + 0.8, 2.6);
    out += pop(`<path d="M -96 6 C -100 -34 -44 -46 -10 -38 C 30 -52 96 -40 98 4 C 100 40 40 46 0 42 C -40 48 -94 42 -96 6 Z" fill="${mix('#d9cdb6', PC.poop, lk)}" stroke="${mix('#a89c80', PC.poopDk, lk)}" stroke-width="5"/><path d="M -62 -10 Q -40 -26 -14 -20" fill="none" stroke="${mix('#f3ecdc', PC.poopLt, lk)}" stroke-width="8" stroke-linecap="round"/>`, t, lS, LXp, CY + 10, { s: 1.15 });
    out += pop(badge('うんちの ちゃいろ', { fill: PC.poopDk, size: 38 }), t, lS + 2.2, 1150, 788);
    out += tag(250, CY - 20, 250, 384, 'きいろい もと', prog(t, c1 + 0.5, 0.3), { col: PC.biliDk, size: 38 });
    out += tag(880, CY - 44, 660, 384, 'べつの もの', prog(t, mid(1, 0.6), 0.3), { col: PC.uroDk, size: 38 });
    out += pop(badge('めに みえないほど ちいさい', { fill: PC.bugInk, size: 34 }), t, c0 + 1.8, 1120, 384, { end: c1 });
    out += titleAt('ちょうの なかに すむ、ちいさな さいきん', t, c0 + 0.3, c1 - 0.1, PC.bugInk, 800, 196) + titleAt('さいきんが、きいろい もとを べつの ものに', t, c1 + 0.2, c2 - 0.1, PC.bugInk, 800, 196) +
      titleAt('いちぶは ちに もどって、おしっこの きいろに', t, c2 + 0.2, c4 - 0.1, PC.peeDk, 800, 196) + titleAt('のこりは、もっと ちゃいろい ものに', t, c4 + 0.2, 1e9, PC.poopDk, 800, 196);
    out += kidShow('S', t, 1760, 846, { s: 0.42, start: cue(3) - 0.9, n: 0, side: 'left', size: 42 });
    return out;
  },
});

// 胆汁が とどく／とどかない の絵（わくの中）
function bileCase(t, ok, { xAt = 1e9, poopAt = 0 } = {}) {
  let s = `<line x1="-300" y1="80" x2="40" y2="80" stroke="${PC.tubeDk}" stroke-width="84" stroke-linecap="round"/><line x1="-300" y1="80" x2="40" y2="80" stroke="${PC.inside}" stroke-width="62" stroke-linecap="round"/>`;
  s += `<line x1="-296" y1="86" x2="-196" y2="86" stroke="${PC.mush}" stroke-width="40" stroke-linecap="round"/><line x1="-150" y1="86" x2="34" y2="86" stroke="${ok ? PC.poop : PC.pale}" stroke-width="40" stroke-linecap="round"/>`;
  s += `<line x1="-170" y1="-50" x2="-170" y2="50" stroke="${PC.bileDk}" stroke-width="30"/><line x1="-170" y1="-50" x2="-170" y2="${ok ? 62 : -8}" stroke="${ok ? PC.bile : PC.inside}" stroke-width="16"/>` + (ok ? '' : `<line x1="-170" y1="-8" x2="-170" y2="56" stroke="${PC.inside}" stroke-width="16"/>`);
  s += g(liverPic(0.56), { x: -196, y: -92 });
  if (ok) for (let j = 0; j < 3; j++) { const q = (t * 0.5 + j / 3) % 1; s += waterDrop(-170, lerp(-40, 70, q), 0.7, Math.min(1, q * 8, (1 - q) * 8), PC.bileDk); }
  else { const k = prog(t, xAt, 0.35); if (k > 0) s += g(cross(0, 0, 0.36, C.red), { x: -170, y: 4, s: Math.max(back(k), 0.001), o: k }); }
  s += arrow2(96, 80, 150, 80, C.ochre, 11);
  s += pop(ok ? poopPic(1.25) : poopPic(1.25, { col: PC.pale, lt: PC.paleLt, line: PC.paleDk }), t, poopAt, 250, 64);
  s += g(ctext(250, 168, ok ? 'ちゃいろ' : 'しろっぽい', { size: 38, w: 900, fill: ok ? PC.poopDk : PC.paleDk }), { o: prog(t, poopAt + 0.3, 0.3) });
  s += ctext(-10, -96, 'かんぞう', { size: 30, w: 900, fill: PC.liverDk }) + ctext(-80, 150, 'ちょう', { size: 30, w: 900, fill: PC.tubeDk });
  return s;
}

// 7. 胆汁がとどかないと 白っぽい → 色は病気を見つける手がかり → 便色カード
SCENES.push({
  id: 'pale',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A. とどく／とどかない
    const aO = 1 - prog(t, c2 - 0.6, 0.4);
    if (aO > 0) {
      let a = pop(card(800, 500, { fill: '#fff' }) + g(badge('たんじゅうが とどく', { fill: PC.bileDk, size: 40 }), { y: -196 }) + bileCase(t, true, { poopAt: 0.7 }), t, 0.3, 500, 456);
      a += pop(card(800, 500, { fill: '#fff' }) + g(badge('たんじゅうが とどかない', { fill: C.redUi, size: 40 }), { y: -196 }) + bileCase(t, false, { xAt: c0 + 1.3, poopAt: mid(0, 0.62) }), t, c0 + 0.3, 1420, 456);
      const bs = 'うんちの いろは、びょうきを みつける てがかり';
      a += pop(g(stetho(0.62), { x: -tw(bs, 40, 700, 0.04) / 2 - 86, y: -2 }) + badge(bs, { fill: C.blueUi, size: 40 }), t, c1 + 0.5, 990, 778);
      out += g(a, { o: aO });
    }
    // B. 便色カード
    const bO = prog(t, c2 - 0.3, 0.4);
    if (bO > 0) {
      const KX = 1150, KY = 470, hS = mid(3, 0.52);
      let k = card(1240, 460) + ctext(0, -172, 'べんしょくカード', { size: 52, w: 900 }) + ctext(0, -112, 'あかちゃんの うんちの いろを くらべる いろの みほん', { size: 30, w: 900, fill: C.muted });
      let b = pop(k, t, c2 - 0.2, KX, KY);
      for (let i = 0; i < 7; i++) {   // 色見本は先に出し、「1番から7番」で番号が順にはねる
        const nk = prog(t, c3 + 0.2 + i * 0.28, 0.5), nb = Math.sin(nk * Math.PI);
        b += pop(swatch(124, 170, i) + g(ctext(0, 0, String(i + 1), { size: 46, w: 900, fill: nk > 0 && nk < 1 ? C.redUi : C.ink }), { y: 122 - nb * 14, s: 1 + nb * 0.35 }), t, c2 + 1.0 + i * 0.3, KX - 480 + i * 160, KY + 18, { d: 0.4 });
      }
      b += g(ctext(KX, KY + 205, 'えの いろは イメージです。ほんものの カードで みてね', { size: 26, w: 700, fill: C.muted }), { o: prog(t, c2 + 3.2, 0.4) });
      b += pop(babyPic(0.9, t), t, c2 + 0.2, 270, 320);
      b += pop(handbook(0.92), t, hS, 270, 628) + pop(badge('2012ねんから', { fill: C.ochre, size: 32 }), t, hS + 0.5, 270, 484);
      // うすい色（1〜3番）に近いとき
      const wk = prog(t, c4 + 0.5, 0.4);
      if (wk > 0) b += `<rect x="${KX - 480 - 80}" y="${KY + 18 - 104}" width="${320 + 160}" height="${262}" rx="30" fill="none" stroke="${C.red}" stroke-width="9" opacity="${wk * (0.75 + 0.25 * Math.sin(t * 6))}"/>`;
      const ws = 'うすい いろに ちかい ときは、すぐ せんもんの おいしゃさんへ', wsz = fit(ws, 1100, 38, 700);
      b += pop(g(g(warnIcon, { s: 0.62 }), { x: -tw(ws, wsz, 700, 0.04) / 2 - 84, y: -2 }) + badge(ws, { fill: C.red, size: wsz }), t, c4 + 1.4, 1010, 786);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. 生まれて最初のうんちは、濃い緑色。ふつう 12〜24時間のうちに出る
SCENES.push({
  id: 'baby',
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += titleAt('うまれて さいしょの うんち', t, 0.3, c1 - 0.1, C.ink, 1040, 200, 46) + titleAt('うまれてから ふつう 12〜24じかんの うちに でる', t, c1 + 0.2, 1e9, PC.meco, 1040, 200, 42);
    out += pop(babyPic(1.6, t), t, 0.3, 380, 520);
    // 茶色ではなく、濃い緑色
    const bS = mid(0, 0.42), gS = mid(0, 0.72), xk = prog(t, bS + 0.9, 0.35);
    out += pop(poopPic(1.35), t, bS, 900, 410) + g(ctext(900, 520, 'ちゃいろ', { size: 38, w: 900, fill: C.muted }), { o: prog(t, bS + 0.3, 0.3) });
    if (xk > 0) out += g(cross(0, 0, 0.95, C.red), { x: 900, y: 410, s: Math.max(back(xk), 0.001), o: xk * 0.9 });
    out += g(ctext(1150, 410, 'では なく', { size: 38, w: 900, fill: C.muted }), { o: prog(t, bS + 1.1, 0.3) });
    out += pop(`<path d="M -112 26 C -124 -22 -64 -52 -14 -44 C 30 -70 118 -44 116 12 C 122 54 52 62 0 58 C -50 66 -106 60 -112 26 Z" fill="${PC.meco}" stroke="#1f4028" stroke-width="6"/><path d="M -72 -8 Q -44 -30 -8 -24" fill="none" stroke="${PC.mecoLt}" stroke-width="10" stroke-linecap="round"/>`, t, gS, 1440, 410, { s: 1.15 });
    out += pop(badge('こい みどりいろ', { fill: PC.meco, size: 44 }), t, gS + 0.5, 1440, 540);
    out += g(ctext(1440, 606, 'たいべん', { size: 30, w: 900, fill: C.muted }), { o: prog(t, gS + 0.8, 0.3) });
    if (t > gS + 0.3) for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + t * 0.8; out += `<circle cx="${1440 + Math.cos(a) * 180}" cy="${404 + Math.sin(a) * 104}" r="${6 + 3 * Math.sin(t * 5 + i)}" fill="${C.yellow}" opacity="${prog(t, gS + 0.3, 0.3)}"/>`; }
    // 時間のものさし
    const tO = prog(t, c1 - 0.1, 0.4);
    if (tO > 0) {
      const x0 = 780, x1 = 1700, xm = (x0 + x1) / 2, y = 716, gk = eio(prog(t, c1 + 0.5, 3.2)), xe = lerp(x0, x1, gk);
      let a = `<rect x="${xm}" y="${y - 36}" width="${x1 - xm}" height="72" rx="18" fill="${PC.mecoLt}" opacity="${0.4 * prog(t, c1 + 1.8, 0.5)}"/>`;
      a += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.line}" stroke-width="12" stroke-linecap="round"/><line x1="${x0}" y1="${y}" x2="${xe}" y2="${y}" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/>`;
      [['うまれる', x0], ['12じかん', xm], ['24じかん', x1]].forEach(([s, x]) => { const on = xe >= x - 2; a += `<line x1="${x}" y1="${y - 28}" x2="${x}" y2="${y + 28}" stroke="${on ? C.ink : C.line}" stroke-width="10" stroke-linecap="round"/>` + ctext(x, y + 72, s, { size: 40, w: 900, fill: on ? C.ink : C.line }); });
      a += `<circle cx="${xe}" cy="${y}" r="18" fill="${PC.meco}" stroke="${C.ink}" stroke-width="5"/>`;
      out += g(a, { o: tO });
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
      const CX = 960, CY = 350, NX = -590, L1 = 'ふるく なった ちから できた いろの もとを、', L2 = 'おなかの さいきんが、ちゃいろに かえるから', sz = Math.min(fit(L1, 1130, 44, 900), fit(L2, 1130, 44, 900));
      let a = pop(card(1360, 200) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, -32, L1, { size: sz, w: 900, anchor: 'start' }) + text(NX + 96, 34, L2, { size: sz, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -136, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += flowRow([['あかい つぶ', PC.cellDk], ['きいろい もと', PC.biliDk], ['さいきんが かえる', PC.bugInk], ['ちゃいろ', PC.poopDk]], t, 960, 620, { start: 2.4, step: 0.9, size: 38, gap: 64 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const home = `<path d="M -26 0 L 0 -24 L 26 0 L 26 24 L -26 24 Z" fill="${C.accent}"/><rect x="-7" y="6" width="14" height="18" fill="#fff"/>`;
      const items = [
        [g(handbook(0.24)), 'てちょうの べんしょくカードを みる', C.ink, cue(1)],
        [g(eyeIcon(0.3)), '1ばんから 7ばんまで、いろは どう かわる？', C.ink, cue(2)],
        [qm, 'いつもの うんちは、なんばんに ちかい？', C.ink, cue(3)],
        [home, 'てちょうは、おうちの ひとと いっしょに', C.accent, cue(4)],
        [g(warnIcon, { s: 0.62 }), 'うんちは みるだけ。さわらない', C.red, mid(4, 0.55)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 850, 42, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 310 + i * 100); });
      // 手帳の 便色カードのページ
      const PX = 1500, PY = 520, hi = Math.floor(t * 1.1) % 7;
      let p = card(720, 470, { fill: PC.room }) + g(handbook(0.5), { x: -280, y: -150 }) + text(-200, -150, 'べんしょくカード', { size: 40, w: 900, anchor: 'start' });
      for (let i = 0; i < 7; i++) p += g(swatch(72, 104, i) + ctext(0, 82, String(i + 1), { size: 34, w: 900 }) + (i === hi ? `<rect x="-44" y="-60" width="88" height="166" rx="18" fill="none" stroke="${C.ochre}" stroke-width="7"/>` : ''), { x: -270 + i * 90, y: -16 });
      p += g(poopPic(0.95), { x: -230, y: 160 }) + text(-140, 162, 'なんばんに ちかい？', { size: 40, w: 900, anchor: 'start', fill: C.ochre });
      b += pop(p, t, cue(1) + 0.4, PX, PY);
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
    out += g(text(0, 0, 'くわしくは サイトの「うんちは どうして ちゃいろなの？」へ ／ 出典は 概要欄に', { size: 32, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 778, o: prog(t, 2.0, 0.5) });
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

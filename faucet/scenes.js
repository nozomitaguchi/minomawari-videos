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


// この動画の題（左上のバッジと、キャラクターの出かたを決める乱数のもとになる）
const TOPIC = 'じゃぐち';
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

// みのまわり図鑑 動画「じゃぐちを ひねると、どうして いつでも みずが でるの？」（じゃぐち）
// 出どころ：everyday-trivia trivia/faucet-water-pressure.md（絵の見本：assets/figures-faucet.js、メモ：ideas/notes/faucet.md）
// 水はいつも青、水をおす力はいつもオレンジの矢印。

// ---------- じゃぐちの道具 ----------
const FC = {
  water: '#5db4ee', waterDk: '#2478c4', waterLt: '#c4e4f8', metal: '#cdd5da', metalDk: '#8a959e', air: '#f5f8f9', rubber: '#3b3a36', brass: '#c9a24a', handle: '#4f8fd0',
  push: '#f08a2e', pushDk: '#c96a14', soil: '#c9ad88', soilDk: '#b3956f', road: '#7b8188', grass: '#8cc27a', grassDk: '#6aa35c', tile: '#e6f1f3', tileLn: '#d3e3e8', wallCut: '#dccfb6',
  skyT: '#bfe1f6', skyB: '#eef8fd', concrete: '#dfe4e8', bld: '#f1e7d6', bldDk: '#d9cab0', glass: '#bfe0f2',
};
const rad = a => a * Math.PI / 180;
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// おす力の矢印（オレンジ。白いふちつき）。k: ぎゅっ と前に出る量
function pushArrow(x1, y1, x2, y2, o = 1, w = 14, k = 0) {
  if (o <= 0) return '';
  const a = Math.atan2(y2 - y1, x2 - x1), dx = Math.cos(a) * k, dy = Math.sin(a) * k;
  return `<g opacity="${o}" transform="translate(${dx} ${dy})">${arrow2(x1, y1, x2, y2, '#fff', w + 8)}${arrow2(x1, y1, x2, y2, FC.push, w)}</g>`;
}
// 指し線つきのラベル（指す点が x, y。ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 42 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const skyG = (id, top, bot, { x = 0, y = 0, w = 1920, h = 1080 } = {}) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
// 大きな文字（ふちつき）
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 16 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
// 折れ線の上の点（k: 0〜1）
function polyAt(P, k) {
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const d = clamp(k) * L[L.length - 1]; let i = 1; while (i < P.length - 1 && L[i] < d) i++;
  const u = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)];
}
// 管の中を流れる白いつぶ（折れ線 P にそって。流れていることを見せる）
function flowDots(P, t, { n = 8, r = 6, sp = 0.25, o = 1, col = '#fff' } = {}) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) { const f = ((t * sp + i / n) % 1 + 1) % 1, [x, y] = polyAt(P, f); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${col}" opacity="${(0.85 * Math.min(1, f * 8, (1 - f) * 8)).toFixed(2)}"/>`; }
  return `<g opacity="${o}">${s}</g>`;
}
// 管（折れ線）。w: 外の太さ。fill 0〜1: 始点から水が入っている割合
function pipeLine(P, w, { fill = 1, col = FC.water, empty = FC.air, o = 1 } = {}) {
  if (o <= 0) return '';
  const d = 'M ' + P.map(p => p.join(' ')).join(' L ');
  let s = `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${empty}" stroke-width="${w - 10}" stroke-linejoin="round"/>`;
  if (fill > 0) {
    const len = P.reduce((a, p, i) => a + (i ? Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) : 0), 0);
    s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w - 10}" stroke-linejoin="round" stroke-dasharray="${(len * clamp(fill)).toFixed(1)} ${len + 10}"/>`;
  }
  return `<g opacity="${o}">${s}</g>`;
}
// 蛇口を横から見た絵。(x, y) は図の原点、s は大きさ。open: 0 しまっている 〜 1 開いている。cut: 中を見せる。turn: ハンドルの回り（ラジアン）。pipe: かべがわの管の長さ
//   図の中の場所（s をかける前）：入口の管 y=112〜134、下のへや x=60〜140・y=100〜150、あな x=88〜112・y=88〜100、上のへや y=44〜90、水の出口 x=190〜208・y=110
function faucet(x, y, s, { open = 0, cut = true, turn = 0, pipe = 40 } = {}) {
  const lift = 22 * open, ky = 80 - lift, top = -8 - lift, sw = 6 / s;
  const outer = `<rect x="${-pipe}" y="100" width="${pipe + 64}" height="46"/><rect x="48" y="30" width="104" height="132" rx="12"/><rect x="78" y="8" width="44" height="30" rx="5"/><path d="M 146 42 H 196 Q 220 42 220 66 V 110 H 178 V 84 H 146 Z"/>`;
  let o = `<g fill="${FC.metal}" stroke="${C.ink}" stroke-width="${sw * 2}" stroke-linejoin="round">${outer}</g><g fill="${FC.metal}">${outer}</g>`;
  if (cut) {
    const k1 = clamp(open * 4), k2 = clamp(open * 4 - 1);
    o += `<g fill="${FC.air}"><rect x="${-pipe}" y="112" width="${pipe + 62}" height="22"/><rect x="60" y="100" width="80" height="50" rx="4"/><rect x="88" y="88" width="24" height="14"/><rect x="60" y="44" width="80" height="46" rx="4"/><path d="M 138 54 H 194 Q 208 54 208 68 V 110 H 190 V 72 H 138 Z"/></g>`;
    o += `<g fill="${FC.water}"><rect x="${-pipe}" y="112" width="${pipe + 62}" height="22"/><rect x="60" y="100" width="80" height="50" rx="4"/><rect x="88" y="90" width="24" height="12"/>`;
    if (k1 > 0) o += `<rect x="60" y="${90 - 46 * k1}" width="80" height="${46 * k1}" rx="4"/>`;
    if (k2 > 0) o += `<path d="M 138 54 H 194 Q 208 54 208 68 V 110 H 190 V 72 H 138 Z" opacity="${k2}"/>`;
    o += `</g>`;
    // 弁座（コマがのる所）
    o += `<rect x="60" y="90" width="28" height="10" fill="${FC.metalDk}"/><rect x="112" y="90" width="28" height="10" fill="${FC.metalDk}"/>`;
    // じく（スピンドル）と コマ（金具＋ゴム）
    o += `<rect x="94" y="${top}" width="12" height="${ky - 6 - top}" fill="${FC.metalDk}" stroke="${C.ink}" stroke-width="${sw * 0.6}"/>`;
    o += `<rect x="89" y="${ky - 7}" width="22" height="8" fill="${FC.brass}" stroke="${C.ink}" stroke-width="${sw * 0.5}"/><rect x="79" y="${ky}" width="42" height="10" rx="3" fill="${FC.rubber}"/>`;
  } else {
    o += `<rect x="94" y="${top}" width="12" height="${10 - top}" fill="${FC.metalDk}" stroke="${C.ink}" stroke-width="${sw * 0.6}"/>`;
    o += `<rect x="58" y="40" width="9" height="112" rx="4.5" fill="#fff" opacity="0.55"/><rect x="152" y="50" width="40" height="7" rx="3.5" fill="#fff" opacity="0.5"/>`;
  }
  // ハンドル（横から見ているので、回ると はばが変わって見える）
  const hw = 40 * (0.42 + 0.58 * Math.abs(Math.cos(turn)));
  o += `<rect x="${100 - hw}" y="${top - 18}" width="${hw * 2}" height="18" rx="9" fill="${FC.handle}" stroke="${C.ink}" stroke-width="${sw}"/><circle cx="100" cy="${top - 9}" r="4.5" fill="#fff"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${o}</g>`;
}
// 出口から落ちる水。(x, y) は出口のまん中、w は太さ、len は長さ
function stream(x, y, w, len, t, { o = 1, splash = true } = {}) {
  if (len <= 2 || o <= 0 || w <= 0.5) return '';
  let s = `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${len}" rx="${w * 0.25}" fill="${FC.water}"/>`;
  for (let i = 0; i < 3; i++) { const f = (t * 1.7 + i / 3) % 1, yy = y + f * len * 0.8; s += `<line x1="${x - w * 0.2 + i * w * 0.2}" y1="${yy}" x2="${x - w * 0.2 + i * w * 0.2}" y2="${yy + len * 0.16}" stroke="#fff" stroke-width="${Math.max(2, w * 0.1)}" stroke-linecap="round" opacity="0.6"/>`; }
  if (splash) for (let i = 0; i < 6; i++) { const f = (t * 2.2 + i / 6) % 1, dir = i % 2 ? 1 : -1, dx = dir * (w * 0.5 + f * w * (0.9 + (i % 3) * 0.4)), dy = -Math.sin(f * Math.PI) * w * 1.1; s += `<circle cx="${x + dx}" cy="${y + len + dy}" r="${Math.max(3, w * 0.13)}" fill="${FC.water}" opacity="${1 - f}"/>`; }
  return g(s, { o });
}
// しずく
const drop = (x, y, s = 1, col = FC.water) => `<path d="M ${x} ${y - 22 * s} Q ${x + 17 * s} ${y + 2 * s} ${x + 13 * s} ${y + 10 * s} A ${14 * s} ${14 * s} 0 1 1 ${x - 13 * s} ${y + 10 * s} Q ${x - 17 * s} ${y + 2 * s} ${x} ${y - 22 * s} Z" fill="${col}"/>`;
// ポンプ（オレンジの箱＋まわる羽根）
function pumpIc(x, y, s, t, on = 1) {
  const a = t * 260 * on;
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-46" y="-40" width="92" height="80" rx="14" fill="${FC.push}" stroke="${C.ink}" stroke-width="6"/><circle r="27" fill="#fff" stroke="${C.ink}" stroke-width="5"/>` +
    `<g transform="rotate(${a})">${[0, 120, 240].map(q => `<path d="M 0 0 Q 14 -8 22 0 Q 14 8 0 0 Z" fill="${FC.pushDk}" transform="rotate(${q})"/>`).join('')}</g><circle r="5" fill="${C.ink}"/></g>`;
}
const carIcon = (s = 1, col = '#e0715f') => `<g transform="scale(${s})"><path d="M -150 20 L -150 -20 Q -150 -40 -120 -44 L -80 -50 L -50 -100 Q -44 -110 -30 -110 L 60 -110 Q 76 -110 84 -98 L 112 -50 L 140 -42 Q 160 -38 160 -16 L 160 20 Z" fill="${col}"/><path d="M -42 -52 L -22 -92 L 14 -92 L 14 -52 Z M 30 -52 L 30 -92 L 62 -92 L 86 -52 Z" fill="#dff0fa"/><circle cx="-84" cy="22" r="34" fill="${C.ink}"/><circle cx="-84" cy="22" r="14" fill="#cfd4d9"/><circle cx="92" cy="22" r="34" fill="${C.ink}"/><circle cx="92" cy="22" r="14" fill="#cfd4d9"/></g>`;
// 地面の中（土）と、土の中の小石
function soilBg(gy, seed = 3) {
  let s = `<rect x="0" y="${gy}" width="1920" height="${1080 - gy}" fill="${FC.soil}"/>`;
  for (let i = 0; i < 46; i++) s += `<ellipse cx="${(rnd(i, seed) * 1920).toFixed(0)}" cy="${(gy + 24 + rnd(i, seed + 1) * (1060 - gy)).toFixed(0)}" rx="${8 + rnd(i, seed + 2) * 12}" ry="${5 + rnd(i, seed + 3) * 6}" fill="${FC.soilDk}" opacity="0.55"/>`;
  return s;
}
// 小さな蛇口のしるし（外から見た形）
const tapIc = (s = 1, open = 0, t = 0) => `<g transform="scale(${s})">${faucet(-100, -70, 1, { open, cut: false, pipe: 20 })}${open > 0 ? stream(99, 40, 14, 60 * open, t, { splash: false }) : ''}</g>`;

// 1. つかみ：洗面台。ひねると、すぐジャーッ
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3);
    const tO = c0 + d0 * 0.42, tC = c1 + 1.7, tO2 = c2 + d2 * 0.5;
    const open = Math.max(eo(prog(t, tO, 0.45)) * (1 - eo(prog(t, tC, 0.4))), eo(prog(t, tO2, 0.4)));
    const turn = (prog(t, tO, 0.45) - prog(t, tC, 0.4) + prog(t, tO2, 0.4)) * Math.PI * 1.5;
    // かべ（タイル）と ゆか
    let out = `<rect width="1920" height="1080" fill="${FC.tile}"/>`;
    for (let x = 460; x < 1920; x += 160) out += `<line x1="${x}" y1="0" x2="${x}" y2="850" stroke="${FC.tileLn}" stroke-width="4"/>`;
    for (let y = 60; y < 850; y += 160) out += `<line x1="300" y1="${y}" x2="1920" y2="${y}" stroke="${FC.tileLn}" stroke-width="4"/>`;
    out += `<rect x="0" y="850" width="1920" height="230" fill="#d9c7a8"/><rect x="0" y="842" width="1920" height="14" fill="#c4b08c"/>`;
    // 蛇口がついている かべ（横から）
    out += `<rect x="0" y="0" width="300" height="846" fill="${FC.wallCut}"/><rect x="288" y="0" width="12" height="846" fill="#c8b998"/>`;
    // 洗面台（中が見える）
    const pool = clamp(open + (t > tO ? 0.35 : 0));
    out += `<rect x="640" y="786" width="110" height="62" fill="#fff" stroke="${C.ink}" stroke-width="6"/><rect x="296" y="636" width="50" height="30" fill="#fff" stroke="${C.ink}" stroke-width="6"/>`;
    out += `<path d="M 372 742 Q 400 770 480 770 H 880 Q 960 770 986 742 Z" fill="${FC.water}" opacity="${0.85 * pool}"/>`;
    out += `<path d="M 330 650 Q 340 782 480 782 H 880 Q 1010 782 1020 650" fill="none" stroke="${C.ink}" stroke-width="36" stroke-linecap="round"/><path d="M 330 650 Q 340 782 480 782 H 880 Q 1010 782 1020 650" fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round"/>`;
    // 水
    const FX = 380, FY = 300, FS = 2.0, mx = FX + 199 * FS, my = FY + 110 * FS;
    out += stream(mx, my, 30 * Math.min(1, open * 1.5), (742 - my) * Math.min(1, open * 3), t, { o: Math.min(1, open * 4) });
    out += faucet(FX, FY, FS, { open, cut: false, turn, pipe: 40 });
    // ジャーッ
    out += pop(big(0, 0, 'ジャーッ', 124, FC.waterDk), t, tO + 0.1, 1080, 330, { end: c1 + 0.9, d: 0.3 });
    // 朝でも夜でも
    const dn = [[1150, 'あさ', c2 + 0.2], [1420, 'よる', c2 + d2 * 0.28]];
    dn.forEach(([x, label, st], i) => {
      const ic = i === 0 ? `<circle r="96" fill="#8fcbf2" stroke="#fff" stroke-width="10"/>${sunDisc(0, -4, 44, 0)}`
        : `<circle r="96" fill="${C.night2}" stroke="#fff" stroke-width="10"/><circle cx="-6" cy="-6" r="46" fill="#ffe9a0"/><circle cx="16" cy="-20" r="40" fill="${C.night2}"/><circle cx="50" cy="34" r="5" fill="#fff"/><circle cx="-52" cy="44" r="4" fill="#fff"/><circle cx="34" cy="-56" r="4" fill="#fff"/>`;
      out += pop(`<g filter="url(#shadow)">${ic}</g>` + g(badge(label, { fill: i ? C.night2 : '#e39a1c', size: 40 }), { y: 132 }), t, st, x, 230, { end: c3 - 0.1 });
    });
    out += pop(badge('いつでも すぐ でる', { fill: FC.waterDk, size: 44, pad: 40 }), t, tO2 + 0.5, 1285, 470, { end: c3 - 0.1 });
    // 子どもたち
    const eyes = (t > tO && t < tO + 1.8) ? 'wide' : 'open';
    out += kidShow('S', t, 1400, 846, { s: 0.5, start: 0, n: 0, eyes, look: [-8, -3] });
    out += kidShow('B', t, 1620, 846, { s: 0.5, start: 0, n: 1, eyes, look: [-8, -3], bubble: false });
    // ひねると すぐ でる ？
    out += pop(card(960, 210) + g(tapIc(0.62, 1, t), { x: -392, y: 10 }) + text(-178, 4, 'ひねると', { size: 60, w: 900 }) + g(arrow2(-28, 2, 44, 2, C.muted, 12), {}) +
      text(206, 4, 'すぐ でる', { size: 60, w: 900, fill: FC.waterDk }) + text(416, 4, '？', { size: 104, w: 900, fill: C.ochre }), t, c3 + 0.5, 1280, 290, { end: cueE(3) + 0.6 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="118" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">じゃぐち</tspan>を ひねると、どうして</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="118" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">いつでも <tspan fill="${FC.waterDk}">みず</tspan>が でるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(tapIc(1.0, 1, t), { x: 0, y: 0 }), t, t0 + 1.8, 960, 800);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと おもう？', { size: 84, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'じゃぐちの なかに、みずが ためてある'], ['②', 'ひねると、じゃぐちが みずを すいこむ'], ['③', 'くだの なかの みずが、いつも おされている']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 48, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 900, 390 + i * 168);
    });
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 蛇口の中：コマが通り道をふさぐ → ハンドルを回すと コマが上がって、通り道が開く
SCENES.push({
  id: 'koma',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4);
    const X = 470, Y = 300, S = 3.0, P = (u, v) => [X + u * S, Y + v * S];
    const tO = c3 + d3 * 0.3, op = prog(t, tO, 1.6), open = eio(op);
    // かべ（切った所）と、かべの中を通ってくる管
    out += `<rect x="200" y="130" width="150" height="730" fill="${FC.wallCut}"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<line x1="200" y1="${190 + i * 74}" x2="350" y2="${150 + i * 74}" stroke="#cbbd9f" stroke-width="5"/>`).join('');
    out += text(275, 480, 'かべ', { size: 40, w: 900, fill: '#9a8a68' });
    // 受け皿（洗面台のはし）
    out += `<path d="M 940 800 Q 950 846 1020 846 H 1130 Q 1200 846 1210 800" fill="none" stroke="${C.ink}" stroke-width="22" stroke-linecap="round"/><path d="M 940 800 Q 950 846 1020 846 H 1130 Q 1200 846 1210 800" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>`;
    const [mx, my] = P(199, 110);
    out += stream(mx, my, 44 * Math.min(1, clamp(open * 4 - 2) * 2), (828 - my) * clamp(open * 4 - 2), t, {});
    out += faucet(X, Y, S, { open, cut: true, turn: op * Math.PI * 2, pipe: 160 });
    out += topBadge();
    // 流れ（開いているとき）
    const FL = [[-150, 123], [92, 123], [100, 100], [124, 82], [146, 64], [194, 63], [199, 78], [199, 108]].map(([u, v]) => P(u, v));
    out += flowDots(FL, t, { n: 9, r: 8, sp: 0.45, o: clamp(open * 4 - 2.4) });
    // 説明
    out += pop(badge('よこから きって、なかを みた え', { fill: C.blueUi, size: 44 }), t, c0 + 0.4, 1490, 220, { end: c1 - 0.2 });
    const ky = 80 - 22 * open, [kx, kyy] = P(121, ky + 5);
    out += tag(kx, kyy, 1330, 220, 'コマ', prog(t, c1 + 0.5, 0.3), { col: C.redUi, size: 50 });
    out += pop(badge('ゴムの ついた ちいさな ぶひん', { fill: C.ink, size: 44 }), t, c1 + (cueE(1) - c1) * 0.45, 1500, 330, { end: c2 - 0.2 });
    // しまっているとき
    const hl = win(t, c2 + 0.3, c3 - 0.1, 0.3);
    if (hl > 0) { const [ax, ay] = P(74, 74), k = 0.6 + 0.4 * Math.sin(t * 6); out += `<rect x="${ax}" y="${ay}" width="${52 * S}" height="${32 * S}" rx="16" fill="none" stroke="${C.redUi}" stroke-width="8" stroke-dasharray="18 12" opacity="${hl * k}"/>`; }
    out += pop(badge('しまっている とき', { fill: C.ink, size: 44 }), t, c2 + 0.3, 1500, 330, { end: c3 - 0.2 });
    out += pop(badge('コマが とおりみちを ふさぐ', { fill: C.redUi, size: 44 }), t, c2 + (cueE(2) - c2) * 0.4, 1500, 430, { end: c3 - 0.2 });
    out += tag(P(30, 123)[0], P(30, 123)[1], 620, 880 - 60, 'みずは ここで まっている', win(t, c2 + (cueE(2) - c2) * 0.6, c3 - 0.2, 0.3), { col: FC.waterDk, size: 36 });
    // ハンドルを回す
    const [hx, hy] = P(100, -17 - 22 * open), ao = win(t, c3 + 0.2, tO + 2.2, 0.3);
    if (ao > 0) out += g(`<path d="M ${hx - 120} ${hy - 26} Q ${hx} ${hy - 96} ${hx + 120} ${hy - 26}" fill="none" stroke="${FC.handle}" stroke-width="12" stroke-linecap="round"/><path d="M ${hx + 132} ${hy - 12} l -36 -8 l 22 -28 Z" fill="${FC.handle}"/>`, { o: ao });
    out += pop(badge('ハンドルを まわす', { fill: FC.handle, size: 44 }), t, c3 + 0.3, 1500, 330);
    out += pop(badge('コマが あがる', { fill: C.redUi, size: 44 }), t, tO + 0.5, 1500, 430);
    out += pop(badge('とおりみちが ひらく', { fill: FC.waterDk, size: 44 }), t, tO + 1.4, 1500, 530);
    const ua = win(t, tO + 0.2, tO + 2.4, 0.3);
    if (ua > 0) { const [ux, uy] = P(69, 88 - 22 * open); out += g(arrow2(ux, uy + 4, ux, uy - 78, '#fff', 18) + arrow2(ux, uy + 4, ux, uy - 78, C.redUi, 10), { o: ua }); }
    out += kidShow('B', t, 1720, 850, { s: 0.5, start: c4 - 0.7, n: 0, bubble: false, mouth: lineOf('B') ? 'open' : 'smile' });
    out += talkBubble('B', 1400, 700, 1668, 850 - 282 * 0.5, 46);
    return out;
  },
});

// 4. 管の中の水は、いつもおされている：蛇口 → 家の管 → 道路の下の太い管
SCENES.push({
  id: 'pipes',
  draw(t) {
    const GY = 560, MY = 770, c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5);
    let out = skyG('psky', FC.skyT, FC.skyB, { h: GY }) + cloud(330, 190, 0.9) + cloud(900, 130, 0.7) + soilBg(GY, 3);
    out += `<rect x="0" y="${GY}" width="1150" height="26" fill="${FC.road}"/><rect x="1150" y="${GY}" width="770" height="16" fill="${FC.grass}"/>`;
    out += g(carIcon(0.62, '#e0715f'), { x: 250, y: GY - 35 }) + tree(1850, GY + 4, 1.1);
    // 管（土の中を見せる）
    const rv = eo(prog(t, c1 - 0.3, 0.8));
    const HP = [[1296, 448], [1232, 448], [1232, 690], [1000, 690], [1000, MY - 10]], FP = [[0, MY], [1000, MY], [1000, 690], [1232, 690], [1232, 448], [1296, 448]];
    const tOp = c4 + d4 * 0.3, hop = eo(prog(t, tOp, 0.4));
    let pp = pipeLine(HP, 24);
    pp += `<rect x="-10" y="${MY - 34}" width="1940" height="68" fill="${FC.water}" stroke="${C.ink}" stroke-width="6"/>` + [180, 520, 860, 1320, 1660].map(x => `<rect x="${x}" y="${MY - 41}" width="16" height="82" rx="5" fill="${FC.metalDk}" stroke="${C.ink}" stroke-width="4"/>`).join('');
    pp += `<rect x="993" y="${MY - 44}" width="14" height="16" fill="${FC.water}"/>`;
    // 水がつながっている（光が、太い管から蛇口の手前まで走る）
    const gf = prog(t, c2 + 0.2, 2.8);
    if (gf > 0 && gf < 1) { const [gx, gy] = polyAt(FP, gf); pp += `<circle cx="${gx}" cy="${gy}" r="34" fill="#fff" opacity="0.85" filter="url(#soft)"/>`; }
    pp += flowDots(FP, t, { n: 12, r: 6, sp: 0.16, o: hop });
    out += g(pp, { o: rv });
    // 家（中が見える）
    out += `<path d="M 1196 322 L 1490 168 L 1784 322 Z" fill="#c0624c" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>`;
    out += `<rect x="1250" y="316" width="480" height="${GY - 316}" fill="#fbf3e2" stroke="${C.ink}" stroke-width="6"/><rect x="1253" y="319" width="20" height="${GY - 322}" fill="${FC.wallCut}"/>`;
    out += `<rect x="1580" y="366" width="104" height="84" fill="${FC.glass}" stroke="${C.ink}" stroke-width="5"/><line x1="1632" y1="366" x2="1632" y2="450" stroke="${C.ink}" stroke-width="4"/>`;
    out += g(pipeLine([[1296, 448], [1240, 448]], 24), { o: rv });
    out += `<rect x="1380" y="530" width="24" height="30" fill="#fff" stroke="${C.ink}" stroke-width="4"/><path d="M 1300 492 Q 1304 530 1344 530 H 1440 Q 1480 530 1484 492" fill="none" stroke="${C.ink}" stroke-width="16" stroke-linecap="round"/><path d="M 1300 492 Q 1304 530 1344 530 H 1440 Q 1480 530 1484 492" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
    const FX = 1294, FY = 380, FS = 0.55, mx = FX + 199 * FS, my = FY + 110 * FS;
    out += stream(mx, my, 10 * hop, (520 - my) * Math.min(1, hop * 2), t, { splash: false }) + faucet(FX, FY, FS, { open: hop, cut: false, pipe: 40, turn: hop * 4 });
    out += kidShow('B', t, 1640, 556, { s: 0.3, start: 0.2, n: 0, enter: 'pop', bubble: false, pose: hop > 0.5 ? 'cheer' : 'stand', eyes: hop > 0.5 ? 'smile' : 'open', look: [-7, -2] });
    out += topBadge();
    // はじめの問い：開けただけで、どうしてすぐ出る？
    const o1 = eo(prog(t, c0 + 1.4, 0.4));
    out += pop(card(780, 320) + g(faucet(-300, -100, 1.25, { open: o1, cut: false, pipe: 26, turn: o1 * 4 }) + stream(-300 + 199 * 1.25, -100 + 137.5, 20 * o1, 100 * o1, t, { splash: false }), {}) +
      text(130, -84, 'あけた だけで', { size: 48, w: 900 }) + text(130, -10, 'すぐ でる', { size: 62, w: 900, fill: FC.waterDk }) + text(318, 82, '？', { size: 120, w: 900, fill: C.ochre }), t, c0 + 0.3, 590, 284, { end: c1 - 0.3 });
    // 名前
    const tl = win(t, c1 + 0.3, c5 - 0.3, 0.3);
    out += tag(1330, 420, 1050, 290, 'じゃぐち', tl, { size: 40 });
    out += tag(1232, 630, 1500, 650, 'いえの くだ', win(t, c1 + 1.2, c5 - 0.3, 0.3), { size: 40, col: FC.waterDk });
    out += tag(520, MY - 34, 520, 664, 'みちの したの ふとい くだ', win(t, c1 + (cueE(1) - c1) * 0.45, c5 - 0.3, 0.3), { size: 40, col: FC.waterDk });
    out += pop(badge('みずが ずっと つながっている', { fill: FC.waterDk, size: 44 }), t, c2 + 0.5, 540, 250, { end: c4 - 0.1 });
    // いつも おされている（オレンジの矢印）
    const po = win(t, c3 + 0.2, c5 - 0.3, 0.3), kk = 12 * Math.max(0, Math.sin(t * 5));
    [110, 400, 690].forEach(x => { out += pushArrow(x, MY, x + 170, MY, po, 14, kk); });
    out += pushArrow(1040, 656, 1190, 656, po, 11, kk * 0.7) + pushArrow(1192, 620, 1192, 480, po, 11, kk * 0.7);
    out += big(1110, 410, 'ぎゅっ', 66, FC.pushDk, { o: win(t, c3 + 0.6, tOp, 0.25), r: -8, s: 1 + 0.07 * Math.sin(t * 5) });
    out += pop(badge('いつも ぎゅっと おされている', { fill: FC.push, size: 44 }), t, c3 + 0.5, 540, 346, { end: c5 - 0.3 });
    out += pop(badge('あけた とたんに、でる！', { fill: C.redUi, size: 44 }), t, tOp + 0.3, 540, 250, { end: c5 - 0.3 });
    // 国の決まり：おす力が弱くなりすぎないように
    const go = prog(t, c5 + 0.1, 0.4);
    if (go > 0) {
      const na = -50 + Math.sin(t * 1.7) * 9;
      let c = card(1000, 300);
      c += `<path d="M -450 40 A 120 120 0 0 1 -210 40" fill="none" stroke="#3d9a5c" stroke-width="30"/><path d="M -450 40 A 120 120 0 0 1 -415 -44.9" fill="none" stroke="${C.red}" stroke-width="30"/>`;
      c += `<g transform="translate(-330 40) rotate(${na})"><path d="M -8 0 L 0 -112 L 8 0 Z" fill="${C.ink}"/></g><circle cx="-330" cy="40" r="16" fill="${C.ink}"/>` + text(-330, 96, 'おす ちから', { size: 32, w: 900, fill: FC.pushDk });
      c += g(badge('くにの きまり', { fill: C.ochre, size: 46, pad: 40 }), { x: 150, y: -82 }) + text(150, 10, 'おす ちからが', { size: 46, w: 900 }) + text(150, 78, 'よわく なりすぎない ように', { size: 46, w: 900 });
      out += g(c, { x: 610, y: 284, o: go, s: lerp(0.92, 1, eo(go)) });
    }
    return out;
  },
});

// 町の家（枝の管つき）と、屋根の上の「水が出た」しるし
function townHouses(t, GY, MY, tapsAt) {
  let s = '';
  [1250, 1500, 1750].forEach((x, i) => {
    s += pipeLine([[x - 50, MY], [x - 50, GY - 30]], 22) + house(x, GY, 1.4, ['#f4ead8', '#f6e3dc', '#e8efe2'][i], ['#c0624c', '#8b6fa8', '#4f8f6a'][i]);
    s += pop(`<circle r="62" fill="#fff" filter="url(#shadow)"/>` + tapIc(0.45, 1, t), t, tapsAt + i * 0.35, x, GY - 276);
  });
  return s;
}
// 道路の下の太い管（左はしから右はしまで）と、枝のつなぎ目
const townMain = (MY, x0 = -20) => pipeLine([[x0, MY], [1940, MY]], 46) + [1200, 1450, 1700].map(x => `<rect x="${x - 6}" y="${MY - 26}" width="12" height="10" fill="${FC.water}"/>`).join('');

// 5. だれがおしている？ 高台の配水池（高い所から低い所へ流れようとする力）
SCENES.push({
  id: 'hill',
  draw(t) {
    const GY = 540, MY = 620, c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = skyG('hsky2', FC.skyT, FC.skyB, { h: GY }) + cloud(1300, 150, 0.9) + cloud(1700, 230, 0.6) + soilBg(GY, 5) + `<rect x="0" y="${GY}" width="1920" height="14" fill="${FC.grass}"/>`;
    const rv = eo(prog(t, c1 - 0.3, 0.8));
    out += townHouses(t, GY, MY, c3 + 1.2);
    out += townMain(MY);
    // 高台と配水池
    let h = `<rect x="-20" y="${MY - 30}" width="384" height="60" fill="${FC.soil}"/>`;
    h += `<path d="M -20 ${GY + 8} L -20 380 Q 110 290 230 290 L 600 290 Q 730 300 880 ${GY + 8} Z" fill="${FC.grass}" stroke="${FC.grassDk}" stroke-width="6"/>`;
    h += pipeLine([[390, 270], [390, MY], [1940, MY]], 46) + [1200, 1450, 1700].map(x => `<rect x="${x - 6}" y="${MY - 26}" width="12" height="10" fill="${FC.water}"/>`).join('');
    h += `<rect x="250" y="176" width="280" height="114" rx="8" fill="${FC.concrete}" stroke="${C.ink}" stroke-width="6"/><rect x="264" y="208" width="252" height="74" fill="${FC.water}"/>`;
    h += `<path d="M 264 208 ${[0, 1, 2, 3, 4, 5].map(i => `q 10.5 ${(i % 2 ? 6 : -6) * Math.sin(t * 2 + i)} 21 0 t 21 0`).join(' ')} V 216 H 264 Z" fill="${FC.waterLt}" opacity="0.8"/>`;
    h += `<rect x="372" y="262" width="36" height="24" fill="${FC.water}"/><rect x="236" y="158" width="308" height="26" rx="8" fill="#aeb8c0" stroke="${C.ink}" stroke-width="6"/>`;
    h += text(200, 440, 'たかだい', { size: 52, w: 900, fill: '#fff' });
    out += g(h, { o: rv });
    out += flowDots([[390, 300], [390, MY], [1920, MY]], t, { n: 14, r: 7, sp: 0.14, o: prog(t, c2 + 0.5, 0.5) });
    out += topBadge();
    // だれが おしている？
    out += pop(card(640, 300) + text(-70, -52, 'だれが', { size: 64, w: 900 }) + text(-70, 38, 'おしている', { size: 64, w: 900, fill: FC.pushDk }) + text(220, -4, '？', { size: 150, w: 900, fill: C.ochre }), t, c0 + 0.3, 460, 300, { end: c1 - 0.4 });
    const kk = 12 * Math.max(0, Math.sin(t * 5)), p0 = win(t, 0.4, c1 - 0.3, 0.3), p3 = prog(t, c3 + 0.3, 0.4);
    [140, 480, 820].forEach(x => { out += pushArrow(x, MY, x + 170, MY, p0, 14, kk); });
    [500, 800].forEach(x => { out += pushArrow(x, MY, x + 170, MY, p3, 14, kk); });
    out += pushArrow(462, 330, 462, 510, p3, 14, kk);
    // 配水池
    out += tag(528, 232, 800, 160, 'はいすいち', prog(t, c1 + 0.9, 0.3), { size: 46, col: FC.waterDk });
    out += pop(badge('みずを ためて おく ところ', { fill: FC.waterDk, size: 38 }), t, c1 + (cueE(1) - c1) * 0.6, 830, 250, { end: c2 - 0.2 });
    // 高い所 → 低い所
    const ho = prog(t, c2 + 0.3, 0.4);
    out += g(`<line x1="534" y1="208" x2="1000" y2="208" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 10"/><line x1="940" y1="232" x2="940" y2="${GY - 26}" stroke="${C.blueUi}" stroke-width="8"/><path d="M 940 214 l -18 30 h 36 Z M 940 ${GY - 6} l -18 -30 h 36 Z" fill="${C.blueUi}"/>`, { o: ho });
    out += pop(badge('たかい', { fill: C.blueUi, size: 40 }), t, c2 + 0.5, 1050, 262) + pop(badge('ひくい', { fill: C.blueUi, size: 40 }), t, c2 + 1.3, 1050, 494);
    out += pop(badge('たかい ところから ひくい ところへ', { fill: FC.waterDk, size: 40 }), t, c2 + (cueE(2) - c2) * 0.45, 640, 716);
    out += pop(badge('その ちからが、くだの みずを おす', { fill: FC.push, size: 40 }), t, c3 + 0.6, 640, 802);
    // おねえちゃん
    out += kidShow('S', t, 1790, 850, { s: 0.42, start: c4 - 0.8, n: 0, bubble: false, mouth: lineOf('S') ? 'open' : 'smile' });
    out += talkBubble('S', 1400, 764, 1730, 850 - 360 * 0.42, 44);
    return out;
  },
});

// 6. 高台がない所はポンプ。東京では、使う量に合わせて 24時間体制で調節
SCENES.push({
  id: 'pump',
  draw(t) {
    const GY = 540, MY = 620, c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2);
    let out = skyG('psky2', FC.skyT, FC.skyB, { h: GY }) + cloud(1000, 150, 0.9) + cloud(1640, 110, 0.6) + soilBg(GY, 8) + `<rect x="0" y="${GY}" width="1920" height="14" fill="${FC.grass}"/>`;
    const tP = c0 + d0 * 0.5, on = prog(t, tP, 0.6);
    out += townHouses(t, GY, MY, tP + 1.4);
    // ポンプ所（中が見える）
    out += pipeLine([[480, 470], [480, MY], [1940, MY]], 46) + [1200, 1450, 1700].map(x => `<rect x="${x - 6}" y="${MY - 26}" width="12" height="10" fill="${FC.water}"/>`).join('');
    out += `<rect x="170" y="300" width="460" height="${GY - 300}" fill="#e3e9ed" stroke="${C.ink}" stroke-width="6"/><rect x="150" y="278" width="500" height="30" rx="8" fill="#9aa7b1" stroke="${C.ink}" stroke-width="6"/>`;
    out += `<rect x="196" y="334" width="408" height="${GY - 334}" fill="#f7fafb" stroke="${C.ink}" stroke-width="5"/>`;
    out += pipeLine([[340, 478], [450, 478]], 26);
    out += `<rect x="216" y="372" width="150" height="150" rx="6" fill="${FC.concrete}" stroke="${C.ink}" stroke-width="5"/><rect x="228" y="404" width="126" height="110" fill="${FC.water}"/>`;
    out += pipeLine([[480, 500], [480, 552]], 46) + pumpIc(480, 464, 1.15, t, on);
    out += flowDots([[480, 520], [480, MY], [1920, MY]], t, { n: 14, r: 7, sp: 0.2, o: on });
    out += topBadge();
    out += pop(badge('たかい ところが ない ばしょ', { fill: C.ink, size: 42 }), t, c0 + 0.4, 1130, 180);
    out += tag(520, 430, 830, 340, 'ポンプ', prog(t, tP - 0.2, 0.3), { size: 50, col: FC.pushDk });
    const kk = 16 * Math.max(0, Math.sin(t * 8));
    [560, 850].forEach(x => { out += pushArrow(x, MY, x + 180, MY, on, 14, kk); });
    out += big(840, 700, 'ぐーん', 64, FC.pushDk, { o: on, s: 1 + 0.06 * Math.sin(t * 8) });
    out += pop(badge('ポンプで みずを おして おくる', { fill: FC.push, size: 42 }), t, tP + 0.9, 800, 792);
    // 東京：使う量に合わせて、送る量とおす力を 24時間体制で調節
    const bo = prog(t, c1 - 0.3, 0.5);
    if (bo > 0) {
      const hr = (6 + (t - c1) * 2.0) % 24, H = [36, 28, 44, 128, 168, 124, 108, 100, 122, 160, 178, 92];
      const fi = hr / 2, i0 = Math.floor(fi) % 12, v = lerp(H[i0], H[(i0 + 1) % 12], fi - Math.floor(fi)) / 180;
      const day = hr >= 6 && hr < 18, label = hr >= 5 && hr < 10 ? 'あさ' : hr >= 10 && hr < 17 ? 'ひる' : hr >= 17 && hr < 20 ? 'ゆうがた' : 'よる';
      let c = card(1580, 680);
      c += g(badge('とうきょうでは', { fill: C.blueUi, size: 44, pad: 40 }), { x: -560, y: -270 }) + pop(text(0, 0, 'つかう りょうに あわせて ちょうせつ', { size: 52, w: 900 }), t, c1 + 0.6, 150, -268);
      // 時計
      c += `<circle cx="-560" cy="40" r="128" fill="${day ? '#fff8dc' : '#dfe6f5'}" stroke="${C.ink}" stroke-width="8"/>` + Array.from({ length: 12 }, (_, k) => `<line x1="-560" y1="${40 - 112}" x2="-560" y2="${40 - 96}" stroke="${C.ink}" stroke-width="5" transform="rotate(${k * 30} -560 40)"/>`).join('');
      c += `<line x1="-560" y1="40" x2="-560" y2="-34" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" transform="rotate(${hr * 30} -560 40)"/><circle cx="-560" cy="40" r="10" fill="${C.ink}"/>`;
      c += g(day ? sunDisc(0, 0, 26, 0, { glow: 0.5 }) : `<circle r="26" fill="#ffe9a0"/><circle cx="12" cy="-8" r="22" fill="#fff"/>`, { x: -660, y: -128 }) + text(-560, 214, label, { size: 44, w: 900, fill: day ? '#c98f00' : C.night2 });
      // 使う量のグラフ（時間ごとに変わる、というイメージ）
      c += text(-110, -140, 'みずを つかう りょう', { size: 38, w: 900, fill: FC.waterDk }) + `<line x1="-390" y1="200" x2="170" y2="200" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
      H.forEach((hh, k) => { const x = -372 + k * 45, cur = k === i0; c += `<rect x="${x}" y="${198 - hh * 1.5}" width="34" height="${hh * 1.5}" rx="6" fill="${cur ? FC.waterDk : FC.waterLt}"/>` + (cur ? `<path d="M ${x + 17} ${198 - hh * 1.5 - 12} l -13 -22 h 26 Z" fill="${C.redUi}"/>` : ''); });
      // 調節のつまみ
      [['おくる りょう', FC.waterDk, -30], ['おす ちから', FC.push, 120]].forEach(([s2, col, y]) => {
        c += text(290, y - 44, s2, { size: 38, w: 900, fill: col === FC.push ? FC.pushDk : col, anchor: 'start' }) + `<rect x="290" y="${y - 9}" width="400" height="18" rx="9" fill="${C.line}"/><rect x="290" y="${y - 9}" width="${30 + 340 * v}" height="18" rx="9" fill="${col}"/><circle cx="${320 + 340 * v}" cy="${y}" r="26" fill="#fff" stroke="${col}" stroke-width="9"/>`;
      });
      c += pop(badge('24じかん たいせいで みまもって、ちょうせつ', { fill: C.accent, size: 44, pad: 40 }), t, c2 + (cueE(2) - c2) * 0.4, 0, 286);
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.97 * bo}"/>` + topBadge() + g(c, { x: 960, y: 480, o: bo, s: lerp(0.92, 1, eo(bo)) });
    }
    return out;
  },
});

// 建物（横から）。lit[i]: i+1 階に水がとどいているか（0〜1）
function bldg(bx, n, lit, { w = 300, GY = 760, FH = 62, numSide = 'right' } = {}) {
  const top = GY - n * FH;
  let s = `<rect x="${bx}" y="${top}" width="${w}" height="${n * FH}" fill="${FC.bld}" stroke="${C.ink}" stroke-width="6"/><rect x="${bx - 10}" y="${top - 12}" width="${w + 20}" height="16" rx="5" fill="${FC.bldDk}" stroke="${C.ink}" stroke-width="5"/>`;
  for (let i = 0; i < n; i++) {
    const fy = GY - i * FH - FH / 2, k = clamp(lit[i] || 0);
    if (i) s += `<line x1="${bx}" y1="${GY - i * FH}" x2="${bx + w}" y2="${GY - i * FH}" stroke="${FC.bldDk}" stroke-width="4"/>`;
    s += `<rect x="${bx + 112}" y="${fy - 16}" width="44" height="32" rx="4" fill="${FC.glass}"/><rect x="${bx + 176}" y="${fy - 16}" width="44" height="32" rx="4" fill="${FC.glass}"/>`;
    s += `<circle cx="${bx + w - 40}" cy="${fy}" r="20" fill="${mix('#d3d8dc', '#ffffff', k)}" stroke="${mix('#aab2b8', FC.waterDk, k)}" stroke-width="4"/>` + (k > 0 ? g(drop(0, 2, 0.62, FC.waterDk), { x: bx + w - 40, y: fy, o: k, s: Math.max(back(k), 0.001) }) : '');
    s += text(numSide === 'right' ? bx + w + 34 : bx - 34, fy + 2, String(i + 1), { size: 32, w: 900, fill: C.muted, ls: 0 });
  }
  return s;
}

// 7. 高い建物へ：東京では 3階くらいまでは管の力だけ。その上は、ポンプで足すか、屋上のタンクから流す
SCENES.push({
  id: 'tall',
  draw(t) {
    const GY = 760, MY = 806, FH = 62, c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    let out = skyG('tsky', FC.skyT, FC.skyB, { h: GY }) + cloud(560, 190, 0.8) + cloud(1180, 150, 0.6) + soilBg(GY, 11) + `<rect x="0" y="${GY}" width="1920" height="12" fill="${FC.grass}"/>`;
    const fy = i => GY - i * FH - FH / 2;
    // A：3階まで（管の力だけ）
    const tA = c1 + d1 * 0.3, fA = prog(t, tA, 1.8);
    // B：ポンプで力を足す
    const tB = c2 + d2 * 0.35, fB = prog(t, tB, 2.2);
    // C：受水槽 → ポンプ → 屋上のタンク → 流れ下る
    const tC = c3 + 0.3, DC = Math.max(3.2, Math.min(5.2, d3 - 0.6)), fC = prog(t, tC, DC);
    const kTank = clamp(fC / 0.16), kUp = clamp((fC - 0.16) / 0.3), kRoof = clamp((fC - 0.46) / 0.16), kDown = clamp((fC - 0.62) / 0.38);
    const AX = 200, BX = 780, CX = 1360;
    // 管
    out += pipeLine([[AX + 34, MY], [AX + 34, fy(2)]], 22, { fill: fA });
    const bO = prog(t, c2 + 0.1, 0.4), cO = prog(t, c3 - 0.2, 0.4);
    out += pipeLine([[730, MY], [730, 716], [BX + 34, 716], [BX + 34, fy(6)]], 22, { fill: fB, o: bO });
    out += pipeLine([[1790, MY], [1790, 750]], 22, { fill: prog(t, tC - 0.2, 0.3), o: cO });
    out += pipeLine([[1700, 716], [1700, 288], [1568, 288]], 22, { fill: kUp, o: cO });
    out += pipeLine([[1452, 300], [CX + 34, 300], [CX + 34, fy(0)]], 22, { fill: kDown, o: cO });
    out += pipeLine([[-20, MY], [1940, MY]], 38) + [AX + 34, 730, 1790].map(x => `<rect x="${x - 6}" y="${MY - 22}" width="12" height="10" fill="${FC.water}"/>`).join('');
    // 建物
    const litA = [0, 1, 2].map(i => clamp(fA * 3.4 - i - 0.4)), litB = [0, 1, 2, 3, 4, 5, 6].map(i => clamp(fB * 7.6 - i - 0.5)), litC = [0, 1, 2, 3, 4, 5, 6].map(i => clamp(kDown * 8 - (6 - i) - 0.5));
    let b = bldg(AX, 3, litA) + bldg(BX, 7, litB) + bldg(CX, 7, litC, { numSide: 'left' });
    // 管は建物の中を通る（建物の上に、もう一度 管だけ描く）
    b += pipeLine([[AX + 34, GY - 4], [AX + 34, fy(2)]], 22, { fill: clamp((fA * (MY - fy(2)) - (MY - GY + 4)) / (GY - 4 - fy(2))) });
    b += pipeLine([[BX + 34, 716], [BX + 34, fy(6)]], 22, { fill: clamp((fB * (150 + 716 - fy(6)) - 150) / (716 - fy(6))), o: bO });
    b += pipeLine([[CX + 34, 330], [CX + 34, fy(0)]], 22, { fill: clamp((kDown * (58 + 30 + fy(0) - 330 + 0) - 88) / (fy(0) - 330)), o: cO });
    out += b;
    // B のポンプ
    out += pop(pumpIc(0, 0, 0.8, t, 1) + text(0, -56, 'ポンプ', { size: 30, w: 900, fill: FC.pushDk }), t, c2 + 0.3, 730, 716);
    // C の受水槽・ポンプ・屋上のタンク
    let cc = `<rect x="1736" y="678" width="108" height="82" rx="6" fill="${FC.concrete}" stroke="${C.ink}" stroke-width="5"/><rect x="1746" y="${752 - 58 * kTank}" width="88" height="${58 * kTank}" fill="${FC.water}"/>`;
    cc += pumpIc(1700, 724, 0.62, t, fC > 0.1 ? 1 : 0);
    cc += `<path d="M 1462 316 V 326 M 1558 316 V 326" stroke="${C.ink}" stroke-width="8"/><rect x="1450" y="250" width="120" height="68" rx="6" fill="${FC.concrete}" stroke="${C.ink}" stroke-width="6"/><rect x="1460" y="${310 - 46 * kRoof}" width="100" height="${46 * kRoof}" fill="${FC.water}"/>`;
    out += g(cc, { o: cO });
    out += topBadge();
    // おす力
    const kk = 10 * Math.max(0, Math.sin(t * 6));
    out += pushArrow(AX + 78, 740, AX + 78, 600, win(t, tA, c2 + 0.5, 0.3), 12, kk);
    out += pushArrow(BX + 78, 740, BX + 78, 400, win(t, tB, c3 + 0.5, 0.3), 12, kk);
    out += g(arrow2(CX + 78, 380, CX + 78, 700, FC.waterDk, 12), { o: win(t, tC + DC * 0.62, 1e9, 0.3) });
    // 3階の線
    const lo = prog(t, c1 + 0.2, 0.4);
    out += g(`<line x1="70" y1="${GY - 3 * FH}" x2="1880" y2="${GY - 3 * FH}" stroke="${C.redUi}" stroke-width="6" stroke-dasharray="20 14"/>`, { o: lo * 0.9 }) + pop(badge('3がい', { fill: C.redUi, size: 38 }), t, c1 + 0.3, 640, GY - 3 * FH);
    // ことば
    out += pop(badge('うえの かいには どうやって？', { fill: C.ochre, size: 46, pad: 40 }), t, c0 + 0.4, 420, 250, { end: c1 - 0.2 });
    out += pop(big(0, 0, '？', 120, C.ochre), t, c0 + 0.8, BX + 150, 240, { end: c2 - 0.1 }) + pop(big(0, 0, '？', 120, C.ochre), t, c0 + 1.1, CX + 150, 240, { end: c3 - 0.3 });
    out += pop(badge('とうきょうでは', { fill: C.blueUi, size: 42, pad: 38 }), t, c1 + 0.1, 1730, 70);
    out += pop(badge('くだの ちからだけ', { fill: FC.waterDk, size: 40 }), t, tA + 0.6, AX + 150, 500) + pop(text(0, 0, '3がい くらいまで', { size: 46, w: 900, fill: C.redUi }), t, tA + 1.4, AX + 150, 424);
    out += pop(badge('ポンプで ちからを たす', { fill: FC.push, size: 40 }), t, tB + 0.3, BX + 150, 262);
    out += pop(badge('おくじょうの タンクから ながす', { fill: FC.waterDk, size: 40 }), t, tC + DC * 0.5, CX + 130, 196);
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5);
    const aO = 1 - prog(t, c1 - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'くだの なかの みずが、いつも おされている', { size: 46, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['たかい ところに ためた みず', FC.waterDk], ['ポンプ', FC.pushDk], ['いつも おしている', C.redUi]], t, 900, 660, { start: 2.6, step: 1.3 });
      a += kidShow('K', t, 1730, 850, { s: 0.7, start: 1.6, n: 0, bubble: false });
      out += g(a, { o: aO });
    }
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, c1 - 0.2, 400, 190);
      const row = (ic, s1, s2, col, y, st, size = 46) => pop(ic + (s2 ? text(80, -30, s1, { size, w: 900, anchor: 'start', fill: col }) + text(80, 30, s2, { size, w: 900, anchor: 'start', fill: col }) : text(80, 2, s1, { size, w: 900, anchor: 'start', fill: col })), t, st, 980, y);
      const dot = col => `<circle r="14" fill="${col}"/>`;
      // その1：蛇口を少し回したとき と もう少し回したとき
      const p1 = 1 - prog(t, c4 - 0.6, 0.4);
      if (p1 > 0) {
        let q = '';
        [[270, 'すこし まわす', 10, 0.35, c1 + 0.3], [710, 'もう すこし まわす', 34, 0.9, c1 + d1 * 0.55]].forEach(([x, label, w, op, st], i) => {
          let f = card(420, 540) + stream(-170 + 199 * 1.45, -200 + 110 * 1.45, w, 210, t, {}) + faucet(-170, -200, 1.45, { open: op, cut: false, pipe: 22, turn: op * 1.3 });
          // 音の大きさ（波の数と大きさ）
          for (let k = 0; k < (i ? 3 : 1); k++) { const r = 24 + k * 18, cx = -170 + 199 * 1.45 + (i ? 26 : 18), cy = 100; f += `<path d="M ${cx + r * 0.6} ${cy - r * 0.8} A ${r} ${r} 0 0 1 ${cx + r * 0.6} ${cy + r * 0.8}" fill="none" stroke="${C.ochre}" stroke-width="${i ? 9 : 6}" stroke-linecap="round" opacity="${0.55 + 0.45 * Math.sin(t * 6 - k)}"/>`; }
          f += g(badge(label, { fill: i ? FC.waterDk : C.blueUi, size: 38 }), { y: 222 });
          q += pop(f, t, st, x, 540);
        });
        q += row(g(`<circle cx="-12" cy="-20" r="15" fill="${C.blueUi}"/><rect x="-28" y="-2" width="32" height="40" rx="12" fill="${C.blueUi}"/><circle cx="24" cy="2" r="11" fill="${C.ochre}"/><rect x="13" y="16" width="22" height="24" rx="9" fill="${C.ochre}"/>`, { y: -8 }), 'おとなと いっしょに', null, C.ink, 310, c1 + 0.1);
        q += row(g(eyeIcon(0.24), {}), 'みずの ふとさと おとを くらべる', null, C.ink, 420, c2 + 0.1);
        q += row(dot(C.accent), 'みたら、すぐ しめる', null, C.accent, 530, c2 + d2 * 0.6);
        q += row(warnIcon(0.62), 'おゆの じゃぐちは あつい。さわらない', null, C.red, 660, c3 + 0.1, 42);
        q += row(warnIcon(0.62), 'じゃぐちを ぶんかい しない', null, C.red, 770, c3 + d3 * 0.55, 42);
        b += g(q, { o: p1 });
      }
      // その2：高い建物の屋上の、箱の形のタンク
      const p2 = prog(t, c4 - 0.3, 0.5);
      if (p2 > 0) {
        let q = `<clipPath id="lkc"><rect x="80" y="270" width="850" height="550" rx="28"/></clipPath><rect x="80" y="270" width="850" height="550" rx="28" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#lkc)">` + skyG('lksky', FC.skyT, FC.skyB, { x: 80, y: 270, w: 850, h: 550 }) + cloud(280, 380, 0.6);
        q += `<rect x="80" y="760" width="850" height="60" fill="${FC.grass}"/>`;
        q += house(250, 762, 1.5, '#f4ead8', '#c0624c');
        const BX = 600, BW = 250, n = 6, FH2 = 60, top = 760 - n * FH2;
        q += `<rect x="${BX}" y="${top}" width="${BW}" height="${n * FH2}" fill="${FC.bld}" stroke="${C.ink}" stroke-width="6"/><rect x="${BX - 10}" y="${top - 12}" width="${BW + 20}" height="16" rx="5" fill="${FC.bldDk}" stroke="${C.ink}" stroke-width="5"/>`;
        for (let i = 0; i < n; i++) q += [40, 104, 168].map(dx => `<rect x="${BX + dx}" y="${760 - i * FH2 - 46}" width="42" height="30" rx="4" fill="${FC.glass}"/>`).join('');
        q += `<path d="M ${BX + 82} ${top - 26} V ${top - 12} M ${BX + 168} ${top - 26} V ${top - 12}" stroke="${C.ink}" stroke-width="8"/><rect x="${BX + 66}" y="${top - 92}" width="118" height="68" rx="6" fill="${FC.concrete}" stroke="${C.ink}" stroke-width="6"/>`;
        const pk = 0.5 + 0.5 * Math.sin(t * 5);
        q += `<circle cx="${BX + 125}" cy="${top - 58}" r="${84 + pk * 8}" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-dasharray="18 12" opacity="${prog(t, c4 + d4 * 0.45, 0.3)}"/>`;
        q += `<line x1="440" y1="672" x2="${BX + 60}" y2="${top - 30}" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="6 12" stroke-linecap="round" opacity="${prog(t, c4 + 0.8, 0.4)}"/>`;
        q += `</g>` + kidShow('S', t, 410, 762, { s: 0.3, start: c4 - 0.1, n: 0, enter: 'pop', bubble: false, pose: 'point', look: [8, -8], eyes: 'wide' });
        q += tag(BX + 66, top - 58, 330, 322, 'はこの かたちの タンク', prog(t, c4 + d4 * 0.5, 0.3), { size: 36, col: C.ochre });
        q += row(g(eyeIcon(0.24), {}), 'たかい たてものの おくじょうに', 'はこの かたちの タンクが あるかな？', C.ink, 370, c4 + 0.1, 42);
        q += row(dot(C.accent), 'ひくい いえの やねと くらべる', null, C.accent, 530, c4 + d4 * 0.7, 42);
        q += row(warnIcon(0.62), 'おくじょうや タンクには ちかづかない', 'したから みるだけ', C.red, 690, c5 + 0.1, 42);
        b += g(q, { o: p2 });
      }
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「じゃぐち」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

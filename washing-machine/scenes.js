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
const TOPIC = 'せんたくき';
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
// ---------- せんたくき の道具 ----------
// 色の約束：みず＝青、そとへ おす ちから＝赤い矢印、まわる＝オレンジの矢印。洗濯槽＝白（穴は こい灰色）、外の入れもの＝青みの灰色
const WM = {
  body: '#f2f5f4', bodyS: '#dde4e6', line: '#87949b', inside: '#e3e9ec', outer: '#c3d2db', outerD: '#8198a8', outerIn: '#dbe6ec',
  basket: '#fdfdfb', basketL: '#98a5ad', hole: '#56646c', water: '#4faee8', waterL: '#c4e4f6', waterD: '#2a7fc4', blade: '#f0a04b',
  wall: '#f4ebdb', floor: '#e4d0ae', spin: '#e07a2f', force: '#e2553f', hose: '#a3acb1', metal: '#7b858b', skin: '#f3d9c2', wood: '#c99a62', woodD: '#9a6f3f',
};
const CLO = ['#f2c14e', '#e98a9a', '#7fc6a4', '#8fa8e0', '#f0a36b', '#b79be0'];
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
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
function flowRow(items, t, cx, y, { size = 36, gap = 60, start = 0, step = 0.8 } = {}) {
  const ws = items.map(([s]) => tw(s, size, 700, 0.04) + 68), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = cx - tot / 2, out = '';
  items.forEach(([s, col], i) => { const st = start + i * step; out += pop(badge(s, { fill: col, size }), t, st, x + ws[i] / 2, y); if (i) out += g(arrow2(x - gap + 10, y, x - 10, y, C.ochre, 9), { o: prog(t, st - 0.2, 0.3) }); x += ws[i] + gap; });
  return out;
}
// s0 から s1 まで回る（はじめと終わりは r 秒かけて ゆっくり）。「回った秒数」を返すので、速さ（ラジアン/秒）をかけて角度にする
const spun = (t, s0, s1 = 1e9, r = 0.8) => { const up = x => (x <= 0 ? 0 : x < r ? x * x / (2 * r) : x - r / 2); return up(t - s0) - up(t - s1); };
const SPIN_W = 3.4;   // しぼるときの回る速さ（絵の中。穴が ちらつかない速さにしてある）
// 水のつぶ
const dotW = (x, y, r = 8, o = 1, col = WM.water) => o <= 0.01 ? '' : `<circle cx="${F1(x)}" cy="${F1(y)}" r="${r}" fill="${col}" opacity="${F2(clamp(o))}"/><circle cx="${F1(x - r * 0.3)}" cy="${F1(y - r * 0.3)}" r="${F1(r * 0.3)}" fill="#fff" opacity="${F2(clamp(o) * 0.7)}"/>`;
const dropW = (x, y, r = 10, o = 1, col = WM.water) => o <= 0.01 ? '' : `<path d="M ${F1(x)} ${F1(y - r * 1.6)} C ${F1(x + r * 1.2)} ${F1(y - r * 0.1)} ${F1(x + r)} ${F1(y + r)} ${F1(x)} ${F1(y + r)} C ${F1(x - r)} ${F1(y + r)} ${F1(x - r * 1.2)} ${F1(y - r * 0.1)} ${F1(x)} ${F1(y - r * 1.6)} Z" fill="${col}" opacity="${F2(clamp(o))}"/>`;
// まわる矢印（中心 0,0、半径 r、a0→a1 度。時計まわりが正）
function arcArrow(r, a0, a1, col = WM.spin, w = 12) {
  const p = d => [r * Math.cos(d * Math.PI / 180), r * Math.sin(d * Math.PI / 180)], [x0, y0] = p(a0), [x1, y1] = p(a1);
  const sw = a1 > a0 ? 1 : 0, big = Math.abs(a1 - a0) > 180 ? 1 : 0, ta = (a1 + (sw ? 90 : -90)) * Math.PI / 180, h = w * 2.4;
  return `<path d="M ${F1(x0)} ${F1(y0)} A ${r} ${r} 0 ${big} ${sw} ${F1(x1)} ${F1(y1)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${F1(x1 + Math.cos(ta) * h * 0.7)} ${F1(y1 + Math.sin(ta) * h * 0.7)} L ${F1(x1 - Math.cos(ta - 1.57) * h * 0.6 - Math.cos(ta) * h * 0.4)} ${F1(y1 - Math.sin(ta - 1.57) * h * 0.6 - Math.sin(ta) * h * 0.4)} L ${F1(x1 + Math.cos(ta - 1.57) * h * 0.6 - Math.cos(ta) * h * 0.4)} ${F1(y1 + Math.sin(ta - 1.57) * h * 0.6 - Math.sin(ta) * h * 0.4)} Z" fill="${col}"/>`;
}
// 洗濯槽の まわりを まわる矢印（だ円の 手前がわ。右から左へ回って、左はしで 奥へ）
function ellArrow(rx, ry, col = WM.spin, w = 12) {
  return `<path d="M ${-rx} 0 A ${rx} ${ry} 0 0 0 ${rx} 0" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${-rx} ${-w * 2.6} L ${-rx - w * 1.8} ${w * 0.5} L ${-rx + w * 1.8} ${w * 0.5} Z" fill="${col}"/>`;
}
// 服・タオル
const shirt = (col, s = 1) => `<g transform="scale(${s})"><path d="M -40 -52 L -18 -64 Q 0 -48 18 -64 L 40 -52 L 76 -22 L 54 8 L 38 -6 L 38 64 L -38 64 L -38 -6 L -54 8 L -76 -22 Z" fill="${col}" stroke="${mix(col, '#000000', 0.28)}" stroke-width="5" stroke-linejoin="round"/></g>`;
const towel = (col, s = 1) => `<g transform="scale(${s})"><rect x="-44" y="-70" width="88" height="140" rx="8" fill="${col}" stroke="${mix(col, '#000000', 0.28)}" stroke-width="5"/><rect x="-44" y="34" width="88" height="12" fill="#fff" opacity="0.7"/><rect x="-44" y="-52" width="88" height="12" fill="#fff" opacity="0.7"/></g>`;
const lump = (x, y, rx, ry, col, rot = 0) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)})"><ellipse rx="${F1(rx)}" ry="${F1(ry)}" fill="${col}" stroke="${mix(col, '#000000', 0.25)}" stroke-width="4"/><path d="M ${F1(-rx * 0.5)} ${F1(-ry * 0.15)} Q 0 ${F1(ry * 0.45)} ${F1(rx * 0.55)} ${F1(-ry * 0.25)}" fill="none" stroke="${mix(col, '#000000', 0.22)}" stroke-width="4" stroke-linecap="round"/></g>`;
// ぽたぽた落ちるしずく（x, y の下へ）
function drips(x, y, t, { n = 3, gap = 30, len = 110, o = 1, r = 9, ph = 0 } = {}) {
  let s = '';
  for (let k = 0; k < n; k++) { const f = (((t * 0.9 + k * 0.37 + ph) % 1) + 1) % 1; s += dropW(x + (k - (n - 1) / 2) * gap, y + f * f * len, r, o * (1 - f * 0.6)); }
  return s;
}
const sparkle = (x, y, r = 16, col = C.yellow) => `<path d="M ${x} ${y - r} L ${x + r * 0.28} ${y - r * 0.28} L ${x + r} ${y} L ${x + r * 0.28} ${y + r * 0.28} L ${x} ${y + r} L ${x - r * 0.28} ${y + r * 0.28} L ${x - r} ${y} L ${x - r * 0.28} ${y - r * 0.28} Z" fill="${col}"/>`;
// 洗濯機を たてに切った絵（足もとの まん中が原点。高さ 660＋上のパネル）
//   xray: 0 外から見たすがた → 1 中が見える。water: 水の高さ 0〜1。blade / spin: 羽根・洗濯槽の回った角度（ラジアン）
//   lift: 服が水にうく 0〜1、press: 服がかべに押しつけられる 0〜1、fly: 穴から飛び出す水 0〜1、drain: ホースを流れる水 0〜1
//   hlB / hlO: 洗濯槽・外の入れものを目立たせる。lid: ふたの開きぐあい 0〜1
const WG = { hw: 260, BH: 660, OX: 212, OT: -566, OB: -92, IX: 166, IT: -548, IB: -138 };
function washer(t, { xray = 1, water = 0, blade = 0, spin = 0, lift = 0, press = 0, fly = 0, drain = 0, hlB = 0, hlO = 0, lid = 0, clothes = 1, holes = 1, id = 'w0' } = {}) {
  const { hw, BH, OX, OT, OB, IX, IT, IB } = WG;
  let o = `<ellipse cx="0" cy="6" rx="${hw + 30}" ry="18" fill="#000" opacity="0.08"/>`;
  // ホース（うしろ）
  const hoseP = `M ${OX - 70} ${OB - 4} L ${OX - 70} -44 L ${hw + 62} -44 L ${hw + 62} -4`;
  if (xray > 0.02) {
    o += `<rect x="${-hw}" y="${-BH}" width="${hw * 2}" height="${BH}" rx="26" fill="${WM.inside}"/>`;
    o += `<rect x="${hw + 30}" y="-8" width="64" height="12" rx="4" fill="${WM.metal}"/>`;
    o += `<path d="${hoseP}" fill="none" stroke="${WM.hose}" stroke-width="24" stroke-linejoin="round"/><path d="${hoseP}" fill="none" stroke="#cdd4d7" stroke-width="12" stroke-linejoin="round"/>`;
    if (drain > 0.01) o += `<path d="${hoseP}" fill="none" stroke="${WM.water}" stroke-width="11" stroke-linejoin="round" stroke-dasharray="26 14" stroke-dashoffset="${F1(-t * 150)}" opacity="${F2(drain)}"/>`;
    // モーター
    o += `<rect x="-14" y="${IB}" width="28" height="${OB - IB + 16}" fill="${WM.metal}"/><rect x="-58" y="${OB + 10}" width="116" height="56" rx="14" fill="${WM.metal}" stroke="#5b656b" stroke-width="5"/><line x1="-38" y1="${OB + 30}" x2="38" y2="${OB + 30}" stroke="#5b656b" stroke-width="4"/>`;
    // 外の入れもの
    const outerP = `M ${-OX} ${OT} L ${-OX} ${OB - 56} Q ${-OX} ${OB} ${-OX + 56} ${OB} L ${OX - 56} ${OB} Q ${OX} ${OB} ${OX} ${OB - 56} L ${OX} ${OT}`;
    o += `<path d="${outerP} Z" fill="${WM.outerIn}"/>`;
    o += `<clipPath id="${id}c"><path d="${outerP} Z"/></clipPath>`;
    if (water > 0.01) { const wy = lerp(OB, IT + 110, clamp(water)); o += `<g clip-path="url(#${id}c)"><path d="M ${-OX} ${F1(wy)} q 53 ${F1(Math.sin(t * 3) * 7)} 106 0 t 106 0 t 106 0 t 106 0 L ${OX} ${OB + 4} L ${-OX} ${OB + 4} Z" fill="${WM.water}" opacity="0.6"/></g>`; }
    if (fly > 0.01) o += `<g clip-path="url(#${id}c)"><rect x="${-OX}" y="${OB - 20 * fly}" width="${OX * 2}" height="30" fill="${WM.water}" opacity="${F2(0.75 * fly)}"/></g>`;
    o += `<path d="${outerP}" fill="none" stroke="${hlO > 0.01 ? mix(WM.outerD, '#2f7de1', clamp(hlO)) : WM.outerD}" stroke-width="${F1(12 + hlO * (5 + 2 * Math.sin(t * 6)))}" stroke-linecap="round"/>`;
    // 洗濯槽
    o += `<rect x="${-IX}" y="${IT}" width="${IX * 2}" height="${IB - IT}" rx="20" fill="${WM.basket}" fill-opacity="0.72" stroke="${WM.basketL}" stroke-width="7"/>`;
    if (holes > 0.01) for (let r = 0; r < 7; r++) for (let k = 0; k < 12; k++) {
      const a = spin + (k + (r % 2) * 0.5) * Math.PI / 6, c = Math.cos(a); if (c <= 0.08) continue;
      o += `<ellipse cx="${F1(-IX * 0.97 * Math.sin(a))}" cy="${IT + 58 + r * 50}" rx="${F1(7.5 * c)}" ry="7.5" fill="${WM.hole}" opacity="${F2(holes * (0.35 + 0.65 * c))}"/>`;
    }
    o += `<rect x="${-IX - 8}" y="${IT - 12}" width="${IX * 2 + 16}" height="26" rx="13" fill="#e9eef0" stroke="${WM.basketL}" stroke-width="6"/>`;
    if (hlB > 0.01) o += `<rect x="${-IX - 12}" y="${IT - 18}" width="${IX * 2 + 24}" height="${IB - IT + 30}" rx="26" fill="none" stroke="${C.yellow}" stroke-width="${F1(9 + 2 * Math.sin(t * 6))}" opacity="${F2(hlB)}"/>`;
    // 服
    if (clothes > 0.01) {
      const P = [[-92, IB - 44, 62, 34], [20, IB - 40, 70, 32], [98, IB - 58, 50, 30], [-30, IB - 92, 64, 30], [66, IB - 104, 52, 28]];
      let cl = '';
      P.forEach(([x, y, rx, ry], i) => {
        const fx = x * 1.05 + Math.sin(t * 1.7 + i * 2.1) * 26 * lift, fy = lerp(y, IT + 190 + i * 46 + Math.sin(t * 2.3 + i) * 14, lift);
        const sd = i % 2 ? 1 : -1, wx = sd * (IX - 38), wy = IT + 110 + (i >> 1) * 120 + (i % 2) * 60, p = eio(clamp(press));
        cl += lump(lerp(fx, wx, p), lerp(fy, wy, p), lerp(rx, 28, p), lerp(ry, 70, p), CLO[i], Math.sin(t * 1.3 + i) * 8 * lift * (1 - p));
      });
      o += g(cl, { o: clothes });
    }
    // 羽根（底）
    o += `<ellipse cx="0" cy="${IB - 8}" rx="124" ry="15" fill="${WM.blade}" stroke="#b9702a" stroke-width="5"/>`;
    for (let k = 0; k < 4; k++) { const a = blade + k * Math.PI / 2, c = Math.cos(a); o += `<ellipse cx="${F1(-98 * Math.sin(a))}" cy="${IB - 20}" rx="${F1(7 + 13 * Math.abs(c))}" ry="11" fill="${c > 0 ? '#f6bd7c' : '#d98a3c'}" stroke="#b9702a" stroke-width="4"/>`; }
    // 穴から飛び出して、外の入れものの かべを つたう水
    if (fly > 0.01) for (let i = 0; i < 26; i++) {
      const f = (((t * 1.5 + i * 0.137) % 1) + 1) % 1, sd = i % 2 ? 1 : -1, y0 = lerp(IT + 60, IB - 50, rnd(i, 1));
      o += dotW(sd * (IX + 6 + f * (OX - IX - 20)), y0 + f * f * 16, 6, fly * (1 - f * 0.25));
      if (i < 12) { const f2 = (((t * 0.8 + i * 0.21) % 1) + 1) % 1; o += dotW(sd * (OX - 13), lerp(OT + 90, OB - 34, f2), 6, fly * 0.9); }
    }
    // ふた（切った絵では、上にのっている板）
    o += `<rect x="${-OX - 20}" y="${-BH + 40}" width="${OX * 2 + 40}" height="20" rx="10" fill="#cfd8dc" stroke="${WM.line}" stroke-width="5"/>`;
  }
  // 外がわ
  if (xray < 0.98) {
    let e = `<rect x="${-hw}" y="${-BH}" width="${hw * 2}" height="${BH}" rx="26" fill="${WM.body}"/>`;
    e += `<rect x="${-hw + 26}" y="${-BH + 120}" width="${hw * 2 - 52}" height="${BH - 250}" rx="18" fill="none" stroke="${WM.bodyS}" stroke-width="6"/>`;
    e += `<line x1="${-hw}" y1="-96" x2="${hw}" y2="-96" stroke="${WM.bodyS}" stroke-width="6"/><rect x="${-hw + 40}" y="-64" width="120" height="14" rx="7" fill="${WM.bodyS}"/>`;
    e += g(`<rect x="${-hw + 20}" y="${-BH + 26}" width="${hw * 2 - 40}" height="50" rx="16" fill="#dfe7ea" stroke="${WM.line}" stroke-width="6"/><rect x="${-hw + 80}" y="${-BH + 42}" width="${hw * 2 - 160}" height="18" rx="9" fill="#bcd6e4"/>`, { o: 1 - clamp(lid * 2) });
    if (lid > 0.02) e += `<rect x="${-hw + 24}" y="${-BH + 26}" width="${hw * 2 - 48}" height="50" rx="16" fill="#55636b"/>`;
    o += g(e, { o: 1 - xray });
  }
  if (xray < 0.98 && lid > 0.02) o += g(`<rect x="${-hw + 50}" y="${F1(-BH - 54 - 200 * clamp(lid))}" width="${hw * 2 - 100}" height="${F1(200 * clamp(lid) + 20)}" rx="18" fill="#dfe7ea" stroke="${WM.line}" stroke-width="7"/>`, { o: 1 - xray });
  // わく・上のパネル・足
  o += `<rect x="${-hw}" y="${-BH}" width="${hw * 2}" height="${BH}" rx="26" fill="none" stroke="${WM.line}" stroke-width="8"/>`;
  o += `<path d="M ${-hw + 20} ${-BH} L ${-hw + 44} ${-BH - 54} L ${hw - 44} ${-BH - 54} L ${hw - 20} ${-BH} Z" fill="#e6ecee" stroke="${WM.line}" stroke-width="8" stroke-linejoin="round"/>`;
  o += `<circle cx="${hw - 96}" cy="${-BH - 27}" r="13" fill="${WM.spin}"/><circle cx="${hw - 140}" cy="${-BH - 27}" r="9" fill="#9fb4bf"/><circle cx="${hw - 172}" cy="${-BH - 27}" r="9" fill="#9fb4bf"/><rect x="${-hw + 70}" y="${-BH - 38}" width="110" height="22" rx="8" fill="#b8ccd6"/>`;
  o += `<rect x="${-hw + 30}" y="-4" width="60" height="16" rx="6" fill="${WM.metal}"/><rect x="${hw - 90}" y="-4" width="60" height="16" rx="6" fill="${WM.metal}"/>`;
  return o;
}
// 洗濯槽を 上から見た絵（まん中が原点。外の入れものの半径 330、洗濯槽 270）
//   a: 回った角度（ラジアン。時計まわり）、press: 服と水がかべへ 0〜1、out: 穴から飛び出す水 0〜1、arrows: 外へ押す力の矢印 0〜1、rim: ふちを目立たせる 0〜1
const TG = { RO: 330, RI: 270 };
function tubTop(t, { a = 0, press = 0, clothes = 1, water = 1, out = 0, arrows = 0, rim = 0, outer = 1 } = {}) {
  const { RO, RI } = TG, deg = a * 180 / Math.PI, per = 2 * Math.PI * RI / 24;
  let o = outer > 0.01 ? g(`<circle r="${RO}" fill="${WM.outerIn}" stroke="${WM.outerD}" stroke-width="14"/>`, { o: outer }) : '';
  let r = `<circle r="${RI}" fill="${WM.basket}"/>`;
  r += `<circle r="96" fill="#f6bd7c" stroke="#b9702a" stroke-width="5"/>` + [0, 120, 240].map(d => `<rect x="-11" y="-88" width="22" height="80" rx="11" fill="${WM.blade}" stroke="#b9702a" stroke-width="4" transform="rotate(${d})"/>`).join('') + `<circle r="20" fill="#d98a3c"/>`;
  const p = eio(clamp(press));
  if (water > 0.01) for (let j = 0; j < 16; j++) {
    const th = j * 2.39 + 0.4, rr = lerp(60 + rnd(j, 5) * 150, 248, p);
    r += dotW(rr * Math.cos(th), rr * Math.sin(th), 9, water);
  }
  if (clothes > 0.01) for (let i = 0; i < 6; i++) {
    const th = i * Math.PI / 3 + 0.3 + rnd(i, 6) * 0.3, rr = lerp(70 + rnd(i, 7) * 90, 218, p);
    r += g(lump(0, 0, lerp(50, 84, p), lerp(42, 26, p), CLO[i]), { x: rr * Math.cos(th), y: rr * Math.sin(th), r: th * 180 / Math.PI + 90, o: clothes });
  }
  r += `<circle r="${RI}" fill="none" stroke="${WM.basketL}" stroke-width="18" stroke-dasharray="${F1(per * 0.7)} ${F1(per * 0.3)}"/>`;
  if (rim > 0.01) r += `<circle r="${RI}" fill="none" stroke="${WM.spin}" stroke-width="20" stroke-dasharray="${F1(per * 0.7)} ${F1(per * 0.3)}" opacity="${F2(rim)}"/>`;
  o += `<g transform="rotate(${F1(deg)})">${r}</g>`;
  // 穴から外へ飛び出す水（穴は 15度ごと。すきまの まん中は 12.75度のところ）
  if (out > 0.01) for (let j = 0; j < 24; j++) for (let m = 0; m < 2; m++) {
    const f = (((t * 1.3 + j * 0.29 + m * 0.5) % 1) + 1) % 1, th = a - f * 0.25 + (j * 15 + 12.75) * Math.PI / 180, rr = RI + 4 + f * (RO - RI - 20);
    o += dotW(rr * Math.cos(th), rr * Math.sin(th), 7, out * (1 - f * 0.3));
  }
  if (arrows > 0.01) { let ar = ''; for (let k = 0; k < 6; k++) { const th = (k * 60 + 30) * Math.PI / 180; ar += arrow2(118 * Math.cos(th), 118 * Math.sin(th), 205 * Math.cos(th), 205 * Math.sin(th), WM.force, 13); } o += g(ar, { o: arrows }); }
  return o;
}
const houseP = (x, y, s, wall = '#f4ead8', roof = '#c0624c') =>
  `<g transform="translate(${F1(x)} ${y}) scale(${s})"><rect x="-60" y="-80" width="120" height="80" fill="${wall}"/><path d="M -78 -76 L 0 -140 L 78 -76 Z" fill="${roof}"/><rect x="-16" y="-44" width="32" height="44" fill="${mix(roof, '#000000', 0.25)}"/><rect x="26" y="-64" width="22" height="20" fill="#bfe0f2"/></g>`;
const roomBg = () => `<rect width="1920" height="1080" fill="${WM.wall}"/><rect y="836" width="1920" height="244" fill="${WM.floor}"/><rect y="828" width="1920" height="12" fill="#cdb48c"/>`;
// 自動車（右向き。タイヤの下が y=0）。wa: タイヤの回った角度（ラジアン）
function carPic(wa = 0) {
  const wheel = x => `<g transform="translate(${x} -36)"><circle r="36" fill="#3a3f44"/><circle r="17" fill="#cfd5d8"/><g transform="rotate(${F1(wa * 180 / Math.PI)})">${[0, 72, 144, 216, 288].map(d => `<rect x="-3" y="-17" width="6" height="14" fill="#8b949a" transform="rotate(${d})"/>`).join('')}</g></g>`;
  return `<path d="M -186 -34 L -186 -78 Q -182 -98 -156 -102 L -112 -108 L -74 -162 Q -66 -172 -50 -172 L 58 -172 Q 76 -172 88 -160 L 130 -110 L 172 -98 Q 190 -92 190 -72 L 190 -34 Z" fill="#e2553f" stroke="#a8321f" stroke-width="6" stroke-linejoin="round"/>` +
    `<path d="M -92 -110 L -62 -152 Q -58 -158 -50 -158 L -8 -158 L -8 -110 Z" fill="#cfe9f7"/><path d="M 6 -158 L 54 -158 Q 66 -158 74 -150 L 108 -110 L 6 -110 Z" fill="#cfe9f7"/>` +
    `<circle cx="44" cy="-128" r="15" fill="${WM.skin}"/><path d="M 28 -132 Q 40 -152 58 -138 L 58 -128 Q 44 -140 30 -126 Z" fill="#4b3226"/><circle cx="52" cy="-128" r="2.6" fill="#3a2a22"/>` +
    `<rect x="170" y="-84" width="20" height="16" rx="6" fill="#ffe27a"/><rect x="-186" y="-84" width="12" height="16" rx="4" fill="#8e1f14"/><line x1="-2" y1="-104" x2="-2" y2="-40" stroke="#a8321f" stroke-width="4"/>` + wheel(-108) + wheel(112);
}

// 1. つかみ：グルグル回ると、びしょびしょの服が しぼれている
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = roomBg();
    out += `<rect x="1600" y="90" width="240" height="160" rx="14" fill="#cfe6f2" stroke="#fff" stroke-width="14"/><line x1="1720" y1="90" x2="1720" y2="250" stroke="#fff" stroke-width="10"/>` + cloud(1656, 150, 0.22) + cloud(1782, 210, 0.2);
    const MX = 400, MY = 836, MS = 0.86;
    const s0 = c0 + 0.2, s1 = c1 - 0.9, sp = spun(t, s0, s1), going = clamp((t - s0) / 0.8) * (1 - clamp((t - s1) / 0.8));
    const lidK = eo(prog(t, c1 + 0.2, 0.7));
    out += g(washer(t, { xray: 0, lid: lidK, id: 'wh' }), { x: MX + Math.sin(t * 38) * 3 * going, y: MY, s: MS });
    // グルグルの線
    if (going > 0.01) {
      let v = '';
      [[-290, -560, 1], [290, -440, -1], [-296, -250, 1], [292, -180, -1]].forEach(([x, y, d], i) => { const w = Math.sin(t * 12 + i * 1.7) * 6; v += `<path d="M ${x} ${y + w} q ${d * -22} 26 0 52" fill="none" stroke="${WM.spin}" stroke-width="9" stroke-linecap="round"/>`; });
      out += g(v, { x: MX, y: MY, s: MS, o: going });
    }
    // 上から のぞいた ようす
    const CX = 1100, CY = 330, cO = win(t, c0 + 0.5, c1 - 0.1, 0.35);
    if (cO > 0) {
      let c = `<line x1="${MX + 70 - CX}" y1="${246 - CY}" x2="-170" y2="-60" stroke="${WM.line}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>`;
      c += `<circle r="212" fill="#fff" stroke="${WM.line}" stroke-width="8" filter="url(#shadow)"/>` + g(tubTop(t, { a: SPIN_W * sp, press: prog(t, s0 + 0.5, 1.6) }), { s: 0.58 });
      c += g(arcArrow(246, -150, -100) + arcArrow(246, 30, 80), { o: going });
      out += g(c, { x: CX, y: CY, o: cO, s: lerp(0.9, 1, eo(prog(t, c0 + 0.5, 0.4))) });
      out += pop(badge('すごい はやさで グルグル', { fill: WM.spin, size: 44 }), t, c0 + 1.3, CX, 640, { end: c1 - 0.2 });
    }
    // 取り出した服
    out += pop(shirt(CLO[3], 1.15) + sparkle(-96, -70, 18) + sparkle(100, -40, 14), t, c1 + 0.9, MX, 150, { end: cueE(3) + 0.5 });
    // まわす前 と まわしたあと
    const kO = win(t, c1 + 0.4, cueE(3) + 0.7, 0.35);
    if (kO > 0) {
      let c = card(840, 340);
      c += text(-210, -128, 'まわす まえ', { size: 34, w: 900, fill: C.muted }) + g(shirt(CLO[3], 1.2), { x: -210, y: -22 }) + drips(-210, 76, t, { n: 4, gap: 30, len: 46, r: 8 }) + text(-210, 132, 'びしょびしょ', { size: 40, w: 900, fill: WM.waterD });
      const rk = prog(t, mid(1, 0.5), 0.4);
      c += g(arrow2(-64, -22, 64, -22, C.ochre, 13), { o: rk });
      c += g(text(210, -128, 'まわした あと', { size: 34, w: 900, fill: C.muted }) + g(shirt(CLO[3], 1.2), { x: 210, y: -22 }) + sparkle(120, -90, 18) + sparkle(306, -50, 14) + sparkle(300, 46, 12) +
        text(210, 132, 'もう しぼれてる！', { size: 40, w: 900, fill: C.accent }), { o: rk });
      out += g(c, { x: 1100, y: 300, o: kO, s: lerp(0.95, 1, eo(prog(t, c1 + 0.4, 0.4))) });
    }
    out += kidShow('B', t, 1740, 870, { s: 0.62, start: c1 + 0.8, n: 0, side: 'left', size: 46, look: [-7, -2] });
    // どうして？
    out += g(text(0, 0, '？', { size: 180, w: 900, fill: C.ochre, extra: `stroke="${WM.wall}" stroke-width="18" paint-order="stroke"` }), { x: 1100, y: 660, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 190);
      out += g(`<text x="0" y="0" font-size="108" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">せんたくきは <tspan fill="${WM.spin}">まわす</tspan>だけで、</text>`, { x: 960, y: 360, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="108" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${WM.waterD}">みず</tspan>を しぼれるの？</text>`, { x: 960, y: 530, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(tubTop(t, { a: SPIN_W * spun(t, t0 + 1.8), press: 1 }), { s: 0.3 }) + g(arcArrow(120, -150, -70) + arcArrow(120, 30, 110), {}) + dropW(-190, 10, 22) + dropW(-240, -40, 14) + dropW(190, -10, 22) + dropW(244, 40, 14), t, t0 + 1.8, 960, 730);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'まわって いる あいだ、みずは どこへ いくと おもう？', { size: 54, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', ['かべの ちいさな あなから、そとへ とびだす']], ['②', ['まんなかに、ぎゅっと あつまる']], ['③', ['ふくに すいこまれて、きえて しまう']]];
    const cur = curLine(), osz = Math.min(...opts.flatMap(([, L]) => L.map(s => fit(s, 1040, 46))));
    opts.forEach(([n, L], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-80" width="1260" height="160" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 140) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        L.map((s, j) => text(-460, 2 + (j - (L.length - 1) / 2) * (osz + 14), s, { size: osz, w: 700, anchor: 'start' })).join(''), t, cue(i + 1) - 0.2, 820, 384 + i * 166);
    });
    out += pop(g(tubTop(t, { a: SPIN_W * spun(t, cue(0) + 0.6), press: 1 }), { s: 0.36 }) + text(150, -110, '？', { size: 120, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1640, 350);
    out += kidShow('S', t, 1730, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1540, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 中は、入れものが2つ重なっている
SCENES.push({
  id: 'two',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const MX = 600, MY = 838, MS = 0.9, X = x => MX + x * MS, Y = y => MY + y * MS;
    const xr = eio(prog(t, cue(0) + 0.3, 1.0)), hb = win(t, cue(1) - 0.1, cue(2) - 0.2, 0.3), ho = prog(t, cue(2) - 0.1, 0.3);
    out += g(washer(t, { xray: xr, hlB: hb, hlO: ho, id: 'w2' }), { x: MX, y: MY, s: MS });
    out += pop(badge('いれものが 2つ', { fill: C.accent, size: 50, pad: 40 }), t, mid(0, 0.4), 1380, 190);
    // 洗濯槽：かべに小さな穴がたくさん
    out += tag(X(WG.IX), Y(-400), 1380, 300, 'せんたくそう（ふくを いれる）', hb * prog(t, cue(1) + 0.2, 0.3), { size: 40, col: '#a8791a' });
    const zO = win(t, mid(1, 0.45), cue(2) - 0.2, 0.35);
    if (zO > 0) {
      const ZX = 1380, ZY = 566, ZR = 170;
      let z = `<line x1="${X(WG.IX) - ZX}" y1="${Y(-250) - ZY}" x2="${-ZR}" y2="0" stroke="${WM.line}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/><circle cx="${X(WG.IX) - ZX}" cy="${Y(-250) - ZY}" r="22" fill="none" stroke="${C.ochre}" stroke-width="7"/>`;
      z += `<clipPath id="zc"><circle r="${ZR}"/></clipPath><circle r="${ZR}" fill="${WM.basket}" filter="url(#shadow)"/><g clip-path="url(#zc)">`;
      for (let r = -3; r <= 3; r++) for (let k = -3; k <= 3; k++) z += `<circle cx="${k * 62 + (r % 2 ? 31 : 0)}" cy="${r * 56}" r="14" fill="${WM.hole}"/><circle cx="${k * 62 + (r % 2 ? 31 : 0) - 3}" cy="${r * 56 - 3}" r="14" fill="none" stroke="#fff" stroke-width="3" opacity="0.5"/>`;
      z += `</g><circle r="${ZR}" fill="none" stroke="${C.ochre}" stroke-width="10"/>`;
      out += g(z, { x: ZX, y: ZY, o: zO, s: lerp(0.9, 1, eo(prog(t, mid(1, 0.45), 0.4))) });
      out += pop(badge('ちいさな あなが たくさん', { fill: C.ochre, size: 40 }), t, mid(1, 0.45) + 0.4, 1380, 786, { end: cue(2) - 0.2 });
    }
    // 外の入れもの
    out += tag(X(WG.OX), Y(-250), 1380, 400, 'そとの いれもの', ho * prog(t, cue(2) + 0.3, 0.3), { size: 46, col: '#2f6fb8' });
    out += g(text(0, 0, 'せんたくそうを', { size: 48, w: 900 }) + text(0, 68, 'すっぽり かこんで いる', { size: 48, w: 900 }), { x: 1380, y: 540, o: prog(t, mid(2, 0.5), 0.4) });
    return out;
  },
});

// 4. 洗うときは羽根だけ、しぼるときは洗濯槽ごと
function drumPic(t, a) {
  // ドラム式（前から見たところ）。a: ドラムの回った角度
  let o = `<rect x="-150" y="-200" width="300" height="400" rx="26" fill="${WM.body}" stroke="${WM.line}" stroke-width="8"/><rect x="-120" y="-178" width="110" height="20" rx="8" fill="#b8ccd6"/><circle cx="96" cy="-168" r="12" fill="${WM.spin}"/>`;
  o += `<circle cx="0" cy="24" r="122" fill="#cfd8dc" stroke="${WM.line}" stroke-width="8"/><circle cx="0" cy="24" r="98" fill="#eef4f6" stroke="${WM.basketL}" stroke-width="6"/>`;
  let r = '';
  for (let i = 0; i < 5; i++) { const th = i * 1.2566 + 0.3; r += g(lump(0, 0, 40, 17, CLO[i]), { x: 72 * Math.cos(th), y: 72 * Math.sin(th), r: th * 180 / Math.PI + 90 }); }
  r += [0, 120, 240].map(d => `<rect x="-5" y="-96" width="10" height="22" rx="5" fill="${WM.basketL}" transform="rotate(${d})"/>`).join('');
  o += `<g transform="translate(0 24) rotate(${F1(a * 180 / Math.PI)})">${r}</g>`;
  o += `<circle cx="0" cy="24" r="98" fill="#bfe0f2" opacity="0.18"/><path d="M -70 -30 A 86 86 0 0 1 -20 -58" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="0.8"/>`;
  return o;
}
SCENES.push({
  id: 'mode',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const MX = 560, MY = 838, MS = 0.88, X = x => MX + x * MS, Y = y => MY + y * MS;
    const c1 = cue(1), c2 = cue(2);
    const wash = 1 - eio(prog(t, c1 - 0.5, 1.0)), bw = 5 * spun(t, 0.3, c1 - 0.5), sp = SPIN_W * spun(t, c1 + 0.4);
    const dr = win(t, c1 - 0.5, c1 + 1.0, 0.3);
    out += g(washer(t, { water: 0.86 * wash, lift: wash, blade: bw + sp, spin: sp, press: prog(t, c1 + 0.7, 1.6), drain: dr, id: 'w3' }), { x: MX, y: MY, s: MS });
    // あらう とき
    const wO = 1 - prog(t, c1 - 0.5, 0.4);
    if (wO > 0) {
      out += pop(badge('あらう とき', { fill: WM.waterD, size: 50, pad: 40 }), t, 0.3, MX, 150, { end: c1 - 0.2 });
      out += g(`<g transform="translate(${MX} ${Y(-330)}) scale(1 0.42)">${arcArrow(96, 200, 330, WM.waterD, 11)}${arcArrow(96, 20, 150, WM.waterD, 11)}</g>`, { o: wO * prog(t, cue(0) + 0.8, 0.4) });
      out += tag(X(100), Y(-150), 1150, 690, 'そこの はね', wO * prog(t, cue(0) + 0.5, 0.3), { size: 44, col: '#b9702a' });
      out += g(text(0, 0, 'まわるのは はねだけ', { size: 56, w: 900, fill: '#b9702a' }) + g(text(0, 84, 'みずを かきまぜて あらう', { size: 42, w: 700, fill: C.muted }), { o: prog(t, mid(0, 0.6), 0.4) }), { x: 1400, y: 330, o: wO * prog(t, cue(0) + 1.0, 0.4) });
    }
    // しぼる とき
    const sO = win(t, c1 - 0.1, c2 - 0.2, 0.35), sAll = prog(t, c1 - 0.1, 0.35);
    out += pop(badge('しぼる とき', { fill: WM.spin, size: 50, pad: 40 }), t, c1 - 0.1, MX, 150);
    if (sAll > 0) out += g(ellArrow((WG.IX + 30) * MS, 40), { x: MX, y: Y(-330), o: sAll * prog(t, c1 + 0.5, 0.4) });
    if (sO > 0) out += g(text(0, 0, 'せんたくそうが まるごと まわる', { size: fit('せんたくそうが まるごと まわる', 780, 52, 900), w: 900, fill: WM.spin }) + g(text(0, 84, 'おなじ むきに、はやく', { size: 42, w: 700, fill: C.muted }), { o: prog(t, mid(1, 0.55), 0.4) }), { x: 1400, y: 330, o: sO * prog(t, c1 + 0.6, 0.4) });
    // ドラム式
    const dO = prog(t, c2 - 0.1, 0.4);
    if (dO > 0) {
      let c = card(700, 540) + g(drumPic(t, SPIN_W * spun(t, c2 + 0.5)), { x: -170, y: -10, s: 0.9 }) + g(arcArrow(150, -140, -60) + arcArrow(150, 40, 120), { x: -170, y: 12, o: prog(t, c2 + 0.6, 0.4) });
      c += text(150, -90, 'ドラムしきも', { size: 44, w: 900 }) + text(150, -20, 'しぼる ときは', { size: 40, w: 900, fill: WM.spin }) + text(150, 40, 'ドラムを', { size: 40, w: 900, fill: WM.spin }) + text(150, 100, 'はやく まわす', { size: 40, w: 900, fill: WM.spin });
      out += g(c, { x: 1400, y: 500, o: dO, s: lerp(0.95, 1, eo(dO)) });
    }
    return out;
  },
});

// 5. 回ると、外へ押す力がはたらく（えんしんりょく）
// おぼんの上の玉／コーヒーカップ／洗濯槽を、同じ場所で順番に見せる
function trayPic(t, a, k0) {
  let r = `<circle r="270" fill="#ecdcbc" stroke="${WM.woodD}" stroke-width="16"/><circle r="236" fill="none" stroke="#dcc79d" stroke-width="5"/>` + [0, 60, 120].map(d => `<line x1="-236" y1="0" x2="236" y2="0" stroke="#dcc79d" stroke-width="5" transform="rotate(${d})"/>`).join('');
  for (let i = 0; i < 6; i++) {
    const th = i * 1.047 + 0.5, rr = lerp(46 + (i % 3) * 16, 228, eo(prog(t, k0 + i * 0.12, 1.8)));
    r += `<circle cx="${F1(rr * Math.cos(th))}" cy="${F1(rr * Math.sin(th))}" r="24" fill="${CLO[i]}" stroke="${mix(CLO[i], '#000000', 0.25)}" stroke-width="4"/><circle cx="${F1(rr * Math.cos(th) - 8)}" cy="${F1(rr * Math.sin(th) - 8)}" r="7" fill="#fff" opacity="0.7"/>`;
  }
  return `<g transform="rotate(${F1(a * 180 / Math.PI)})">${r}</g>`;
}
function cupRide(t, a, k) {
  // 台が a だけ回る。k: 体が外がわへ押される 0〜1
  let r = `<circle r="270" fill="#fbe6ec" stroke="#e3a2b3" stroke-width="14"/>` + [0, 45, 90, 135].map(d => `<line x1="-250" y1="0" x2="250" y2="0" stroke="#f3cdd7" stroke-width="6" transform="rotate(${d})"/>`).join('') + `<circle r="52" fill="#f6b500" stroke="#c98f00" stroke-width="6"/>`;
  const cup = (deg, col, riders) => {
    let c = `<circle r="100" fill="#fff" stroke="#d9c9a8" stroke-width="5"/><rect x="-16" y="-128" width="32" height="44" rx="14" fill="none" stroke="${col}" stroke-width="12"/><circle r="84" fill="${col}"/><circle r="66" fill="${mix(col, '#ffffff', 0.6)}"/>`;
    if (riders) {
      const dx = -6 + k * 30, up = -(a * 180 / Math.PI + deg);   // 顔は いつも まっすぐ（回る分を 打ち消す）
      const face = (who, x, y) => { const hair = who === 'S' ? CH.hairG : CH.hairB;
        return `<g transform="translate(${F1(x)} ${y}) rotate(${F1(up)})">` + (who === 'S' ? `<circle cx="25" cy="-19" r="12" fill="${hair}"/><circle cx="17" cy="-23" r="5" fill="${CH.clip}"/>` : `<path d="M -2 -24 q 4 -14 13 -9" fill="none" stroke="${hair}" stroke-width="6" stroke-linecap="round"/>`) +
          `<circle r="27" fill="${hair}"/><circle cx="0" cy="4" r="23" fill="${CH.skin}"/><path d="M -23 2 Q -21 -22 0 -22 Q 21 -22 23 2 Q 10 -11 0 -9 Q -10 -11 -23 2 Z" fill="${hair}"/>` +
          `<circle cx="-8" cy="7" r="3.2" fill="${CH.line}"/><circle cx="8" cy="7" r="3.2" fill="${CH.line}"/><path d="M -6 15 Q 0 ${F1(20 + k * 3)} 6 15" fill="none" stroke="${CH.line}" stroke-width="2.6" stroke-linecap="round"/><circle cx="-15" cy="12" r="4" fill="${CH.cheek}" opacity="0.7"/><circle cx="15" cy="12" r="4" fill="${CH.cheek}" opacity="0.7"/></g>`; };
      c += face('S', dx, -33) + face('B', dx, 33);
      c += g(arrow2(96, 0, 186, 0, WM.force, 14), { o: k });
    }
    return `<g transform="rotate(${deg}) translate(150 0)">${c}</g>`;
  };
  r += cup(120, '#8fc6e8', false) + cup(240, '#a8d69a', false) + cup(0, '#f29bb0', true);
  return `<g transform="rotate(${F1(a * 180 / Math.PI)})">${r}</g>`;
}
SCENES.push({
  id: 'force',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const CX = 720, CY = 500, RX = 1440, c0 = cue(0), c1 = cue(1), c2 = cue(2), c4 = cue(4);
    // A おぼんの上の玉
    const aO = 1 - prog(t, c2 - 0.5, 0.35);
    if (aO > 0) {
      out += g(trayPic(t, 2.6 * spun(t, c0 + 0.3), c0 + 1.0), { x: CX, y: CY, o: aO });
      let ar = ''; for (let k = 0; k < 6; k++) { const th = (k * 60 + 30) * Math.PI / 180; ar += arrow2(96 * Math.cos(th), 96 * Math.sin(th), 190 * Math.cos(th), 190 * Math.sin(th), WM.force, 13); }
      out += g(ar, { x: CX, y: CY, o: aO * prog(t, mid(0, 0.5), 0.4) });
      out += g(arcArrow(306, -150, -100) + arcArrow(306, 30, 80), { x: CX, y: CY, o: aO * prog(t, c0 + 0.5, 0.4) });
      out += g(text(0, 0, 'まわると…', { size: 50, w: 900, fill: WM.spin }), { x: RX, y: 300, o: aO * prog(t, c0 + 0.4, 0.4) });
      out += g(arrow2(-300, 0, -222, 0, WM.force, 13) + text(40, 2, 'そとへ おす ちから', { size: 50, w: 900, fill: WM.force }), { x: RX, y: 400, o: aO * prog(t, mid(0, 0.5), 0.4) });
      out += pop(badge('えんしんりょく', { fill: WM.force, size: 64, pad: 50 }), t, c1, RX, 560, { end: c2 - 0.3 });
    }
    // B コーヒーカップ
    const bO = win(t, c2 - 0.3, c4 - 0.4, 0.35);
    if (bO > 0) {
      out += g(cupRide(t, 1.5 * spun(t, c2 + 0.1), eo(prog(t, c2 + 1.0, 1.4))), { x: CX, y: CY, o: bO });
      out += g(arcArrow(306, -150, -100) + arcArrow(306, 30, 80), { x: CX, y: CY, o: bO * prog(t, c2 + 0.4, 0.4) });
      out += pop(badge('コーヒーカップ', { fill: C.ochre, size: 48, pad: 40 }), t, c2, RX, 200, { end: c4 - 0.4 });
      out += g(text(0, 0, 'からだが そとがわへ おされる', { size: fit('からだが そとがわへ おされる', 760, 46, 900), w: 900, fill: WM.force }), { x: RX, y: 310, o: bO * prog(t, mid(2, 0.4), 0.4) });
    }
    // C 洗濯槽の中でも
    const cO = prog(t, c4 - 0.3, 0.4);
    if (cO > 0) {
      const pr = prog(t, c4 + 0.8, 2.2);
      out += g(tubTop(t, { a: SPIN_W * spun(t, c4 - 0.1), press: pr, arrows: prog(t, c4 + 0.6, 0.4) }), { x: CX, y: CY, s: 0.86, o: cO });
      out += g(arcArrow(306, -150, -100) + arcArrow(306, 30, 80), { x: CX, y: CY, o: cO * prog(t, c4 + 0.2, 0.4) });
      out += pop(badge('せんたくそうの なかでも', { fill: C.blueUi, size: 46, pad: 38 }), t, c4, RX, 200);
      out += g(text(0, 0, 'ふくも みずも、かべへ ぎゅっ', { size: fit('ふくも みずも、かべへ ぎゅっ', 760, 48, 900), w: 900, fill: WM.force }), { x: RX, y: 310, o: prog(t, mid(4, 0.45), 0.4) });
    }
    out += kidShow('S', t, 1580, 872, { s: 0.6, start: c2 + 0.4, n: 0, side: 'left', size: 46, look: [-8, -2] });
    return out;
  },
});

// 6. 水だけが、小さな穴を通りぬける
// かべを大きく見た絵（960×600、まん中が原点。左が洗濯槽の中、右が外）
function wallZoom(t, { flow = 0, bump = 0, labC = 0, labW = 0, hl = 0 } = {}) {
  const WX = 60, OW = 400, YS = [-220, -110, 0, 110, 220], GH = 20;
  let o = `<rect x="-480" y="-300" width="960" height="600" rx="30" fill="#fff" filter="url(#shadow)"/><clipPath id="wz"><rect x="-480" y="-300" width="960" height="600" rx="30"/></clipPath><g clip-path="url(#wz)">`;
  o += `<rect x="-480" y="-300" width="${480 + WX}" height="600" fill="#fbf7ec"/><rect x="${WX}" y="-300" width="${OW - WX}" height="600" fill="${WM.outerIn}"/><rect x="${OW}" y="-300" width="80" height="600" fill="${WM.outer}"/><line x1="${OW}" y1="-300" x2="${OW}" y2="300" stroke="${WM.outerD}" stroke-width="14"/>`;
  // 服（かべに押しつけられている）
  const bx = Math.sin(t * 10) * 5 * bump, R = WX - 24;
  o += `<path d="M ${-330 + bx} -190 Q ${-430 + bx} 0 ${-330 + bx} 210 Q -180 276 ${R} 240 L ${R} -216 Q -180 -236 ${-330 + bx} -190 Z" fill="${CLO[0]}" stroke="${mix(CLO[0], '#000000', 0.25)}" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<path d="M -300 -110 Q -200 -60 -90 -120 M -310 60 Q -210 130 -100 70" fill="none" stroke="${mix(CLO[0], '#000000', 0.2)}" stroke-width="7" stroke-linecap="round"/>`;
  for (let j = 0; j < 12; j++) o += dotW(-310 + rnd(j, 21) * 300, -170 + rnd(j, 22) * 370, 10, 0.9 * (1 - flow * 0.75));
  // 外へ押す力
  o += arrow2(-300, -8, -130, -8, WM.force, 16) + text(-215, -52, 'そとへ おす ちから', { size: 32, w: 900, fill: WM.force, extra: `stroke="${CLO[0]}" stroke-width="8" paint-order="stroke"` });
  // 穴を通りぬける水
  if (flow > 0.01) YS.forEach((y, h) => { for (let m = 0; m < 4; m++) {
    const u = ((((t * 0.5 + h * 0.23 + m * 0.25) % 1) + 1) % 1) * 1.5;
    if (u < 1) o += dotW(lerp(WX - 100, OW - 18, u), y + (u > 0.3 ? Math.pow(u - 0.3, 2) * 36 : 0), 11, flow * clamp(u * 6));
    else o += dotW(OW - 18, y + 18 + (u - 1) * 330, 11, flow * clamp((1.5 - u) * 4));
  } });
  // かべ（穴は すきま）
  let y0 = -300;
  [...YS, 400].forEach(y => { o += `<rect x="${WX - 22}" y="${y0}" width="44" height="${y - GH - y0}" rx="8" fill="${WM.basketL}"/><rect x="${WX - 22}" y="${y0}" width="14" height="${y - GH - y0}" rx="6" fill="#b6c1c7"/>`; y0 = y + GH; });
  o += text(-440, -262, 'せんたくそうの なか', { size: 30, w: 900, fill: C.muted, anchor: 'start' }) + text(230, -262, 'そと', { size: 30, w: 900, fill: C.muted });
  if (labC > 0.01) o += g(text(-200, 150, 'ふく', { size: 76, w: 900, fill: '#fff', extra: `stroke="#9a6a0c" stroke-width="12" paint-order="stroke"` }), { o: labC });
  if (labW > 0.01) o += g(text(230, 258, 'みず', { size: 60, w: 900, fill: WM.waterD, extra: `stroke="${WM.outerIn}" stroke-width="12" paint-order="stroke"` }), { o: labW });
  o += `</g><rect x="-480" y="-300" width="960" height="600" rx="30" fill="none" stroke="${WM.line}" stroke-width="8"/>`;
  if (hl > 0.01) o += g(`<circle cx="${WX}" cy="-110" r="${F1(34 + 3 * Math.sin(t * 6))}" fill="none" stroke="${C.yellow}" stroke-width="9"/>`, { o: hl }) + tag(WX + 30, -128, 236, -165, 'ちいさな あな', hl, { size: 36, col: '#a8791a' });
  return o;
}
SCENES.push({
  id: 'holes',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c4 = cue(4), RX = 1500;
    const zO = 1 - prog(t, c4 - 0.5, 0.4);
    if (zO > 0) {
      out += g(text(0, 0, 'かべを おおきく みると…', { size: 40, w: 900, fill: C.muted }), { x: 640, y: 150, o: zO * prog(t, 0.2, 0.4) });
      out += g(wallZoom(t, { flow: prog(t, c0 + 0.5, 0.8), bump: win(t, c1, cueE(1) + 0.3, 0.3), labW: prog(t, mid(0, 0.4), 0.4), labC: prog(t, c1 + 0.2, 0.4), hl: win(t, 0.2, c1 - 0.2, 0.3) }), { x: 640, y: 490, o: zO });
      out += pop(badge('みずは とおりぬける', { fill: WM.waterD, size: 44 }), t, mid(0, 0.35), RX, 200, { end: c4 - 0.4 });
      out += pop(badge('ふくは おおきくて とおれない', { fill: C.redUi, size: 40 }), t, c1 + 0.4, RX, 300, { end: c4 - 0.4 });
      out += g(text(0, 0, 'まわす だけで', { size: 50, w: 900 }) + text(0, 62, 'ふくと みずが わかれる！', { size: 50, w: 900, fill: C.accent }), { x: RX, y: 388, o: zO * prog(t, mid(2, 0.3), 0.4) });
    }
    out += kidShow('B', t, 1290, 872, { s: 0.56, start: c2 + 0.6, n: 0, side: 'right', size: 46, end: c4 - 0.2, look: [-6, -3] });
    // 外の入れもので受けて、ホースから流す
    const mO = prog(t, c4 - 0.3, 0.5);
    if (mO > 0) {
      const MX = 640, MY = 838, MS = 0.9, X = x => MX + x * MS, Y = y => MY + y * MS;
      out += g(washer(t, { spin: SPIN_W * spun(t, c4 - 0.2), blade: SPIN_W * spun(t, c4 - 0.2), press: 1, fly: prog(t, c4, 0.5), drain: prog(t, c4 + 0.6, 0.5), id: 'w6' }), { x: MX, y: MY, s: MS, o: mO });
      out += g(ellArrow((WG.IX + 30) * MS, 40), { x: MX, y: Y(-330), o: mO });
      out += drips(X(WG.hw + 62), Y(0) - 8, t, { n: 1, len: 14, r: 6, o: mO * prog(t, c4 + 1.0, 0.4) });
      out += tag(X(WG.OX), Y(-300), 1420, 360, 'そとの いれもので うける', mO * prog(t, mid(4, 0.3), 0.3), { size: 44, col: '#2f6fb8' });
      out += tag(X(WG.hw + 40), Y(-44), 1420, 620, 'ホースから ながす', mO * prog(t, mid(4, 0.7), 0.3), { size: 44, col: WM.waterD });
    }
    return out;
  },
});

// 7. ふちは、街を走る自動車なみの速さ
SCENES.push({
  id: 'speed',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), k = eio(prog(t, c1 - 0.3, 1.0)), S = lerp(0.72, 0.44, k), TX = lerp(960, 560, k), GY = 806, TY = lerp(440, GY - TG.RO * 0.44 - 6, k);
    const a = SPIN_W * spun(t, 0.2), V = SPIN_W * TG.RO * 0.44, sc = V * spun(t, c1 + 0.4), tO = prog(t, c1 - 0.2, 0.5);
    // 町と道
    if (tO > 0) {
      let town = '';
      const hs = [[0, 'h', 0.9, '#f4ead8', '#c0624c'], [330, 't', 0.8], [560, 'h', 0.75, '#e9eef4', '#5d7fa8'], [900, 't', 0.7], [1150, 'h', 0.95, '#f6e3c8', '#7a9a5a'], [1500, 't', 0.85], [1750, 'h', 0.8, '#f4ead8', '#b0704a'], [2080, 't', 0.75]];
      hs.forEach(([x, kind, s, c1c, c2c]) => { const xx = ((((x - sc * 0.4) % 2400) + 2400) % 2400) - 240; town += kind === 'h' ? houseP(xx, 700, s, c1c, c2c) : tree(xx, 700, s); });
      town += `<rect x="0" y="696" width="1920" height="130" fill="#8f979d"/><rect x="0" y="696" width="1920" height="8" fill="#c9ced1"/>`;
      for (let i = 0; i < 12; i++) { const xx = ((((i * 200 - sc) % 2400) + 2400) % 2400) - 240; town += `<rect x="${F1(xx)}" y="756" width="110" height="10" rx="5" fill="#e9edf0"/>`; }
      out += g(town, { o: tO });
    }
    // 洗濯槽（上から見たところ → 道をころがる）
    out += g(tubTop(t, { a, press: 1, rim: 1 }), { x: TX, y: TY, s: S });
    out += tag(960 + 0.72 * 270 * 0.87, 440 - 0.72 * 270 * 0.5, 1500, 250, 'ふちは とても はやい', win(t, c0 + 0.3, c1 - 0.4, 0.3), { size: 46, col: WM.spin });
    out += g(arcArrow(300, -160, -110) + arcArrow(300, 20, 70), { x: 960, y: 440, s: 0.9, o: win(t, c0 + 0.2, c1 - 0.4, 0.3) });
    if (tO > 0) {
      const going = clamp(spun(t, c1 + 0.4) * 3);
      out += g(carPic(sc / 36), { x: 1270, y: GY + Math.sin(t * 17) * 1.5 * going, o: prog(t, c1 + 0.1, 0.5) });
      // 速さの線
      let ln = '';
      for (let i = 0; i < 6; i++) { const f = (((t * 1.6 + i * 0.31) % 1) + 1) % 1; ln += `<line x1="${F1(1040 - f * 150)}" y1="${670 + (i % 3) * 46}" x2="${F1(980 - f * 150)}" y2="${670 + (i % 3) * 46}" stroke="${C.muted}" stroke-width="7" stroke-linecap="round" opacity="${F2(Math.sin(f * Math.PI) * 0.6)}"/><line x1="${F1(380 - f * 150)}" y1="${590 + (i % 3) * 70}" x2="${F1(320 - f * 150)}" y2="${590 + (i % 3) * 70}" stroke="${C.muted}" stroke-width="7" stroke-linecap="round" opacity="${F2(Math.sin(f * Math.PI) * 0.6)}"/>`; }
      out += g(ln, { o: going });
      // 同じ長さの矢印
      const eq = prog(t, mid(1, 0.45), 0.4);
      out += g(arrow2(450, 470, 670, 470, WM.spin, 14) + arrow2(1160, 590, 1380, 590, WM.spin, 14), { o: eq });
      out += pop(badge('まちを はしる じどうしゃと おなじくらい', { fill: WM.spin, size: fit('まちを はしる じどうしゃと おなじくらい', 1100, 48), pad: 40 }), t, mid(1, 0.45), 1060, 190);
      out += g(text(0, 0, '（ある せんたくきでの けいさん）', { size: 34, w: 700, fill: C.muted }), { x: 1060, y: 276, o: prog(t, mid(1, 0.7), 0.4) });
    }
    return out;
  },
});

// 8. 昔はローラーでしぼっていた・乾くまでの時間
// ローラーしぼり機（まん中が原点。布は左から右へ）。a: ローラーの回った角度（ラジアン）
function wringer(t, a, wet = 1) {
  let o = `<path d="M -250 262 L 250 262 L 214 340 L -214 340 Z" fill="#c3d2db" stroke="${WM.outerD}" stroke-width="7" stroke-linejoin="round"/><path d="M -236 270 L 236 270 L 228 288 L -228 288 Z" fill="${WM.water}" opacity="0.6"/>`;
  o += `<rect x="-196" y="-214" width="30" height="480" rx="8" fill="${WM.wood}" stroke="${WM.woodD}" stroke-width="5"/><rect x="166" y="-214" width="30" height="480" rx="8" fill="${WM.wood}" stroke="${WM.woodD}" stroke-width="5"/><rect x="-214" y="-244" width="428" height="40" rx="12" fill="${WM.wood}" stroke="${WM.woodD}" stroke-width="5"/>`;
  // 布：左は ぶあつくて ぬれている、右は うすい
  const col = CLO[3], dk = mix(col, '#000000', 0.25), sh = ((a * 60) % 70 + 70) % 70;
  o += `<path d="M -430 -46 Q -330 -66 -230 -40 Q -120 -18 -34 -8 L -34 8 Q -120 26 -230 44 Q -330 60 -430 40 Z" fill="${col}" stroke="${dk}" stroke-width="5" stroke-linejoin="round"/>`;
  o += `<path d="M 34 -7 L 330 -7 Q 420 -4 440 60 L 424 66 Q 404 10 330 8 L 34 8 Z" fill="${mix(col, '#ffffff', 0.25)}" stroke="${dk}" stroke-width="5" stroke-linejoin="round"/>`;
  for (let i = 0; i < 5; i++) { const x = -420 + ((i * 70 + sh) % 350); o += dotW(x, -4 + (i % 2 ? 14 : -12) * (1 - (x + 420) / 420), 9, wet * clamp((-60 - x) / 80)); }
  for (let i = 0; i < 4; i++) { const x = 50 + ((i * 70 + sh) % 280); o += `<line x1="${F1(x)}" y1="-3" x2="${F1(x + 16)}" y2="-3" stroke="${dk}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`; }
  // しぼられた水
  o += drips(0, 130, t, { n: 3, gap: 26, len: 120, r: 9, o: wet });
  // ローラー（上は反時計まわり、下は時計まわり → 布は右へ）
  const roller = (y, ang) => `<g transform="translate(0 ${y})"><circle r="60" fill="#f3ead6" stroke="${WM.woodD}" stroke-width="7"/><g transform="rotate(${F1(ang * 180 / Math.PI)})"><line x1="-40" y1="0" x2="40" y2="0" stroke="#d9c7a2" stroke-width="7" stroke-linecap="round"/><line x1="0" y1="-40" x2="0" y2="40" stroke="#d9c7a2" stroke-width="7" stroke-linecap="round"/></g><circle r="11" fill="${WM.woodD}"/></g>`;
  o += roller(68, a) + roller(-68, -a);
  // ハンドル
  o += `<g transform="translate(0 -68) rotate(${F1(-a * 180 / Math.PI)})"><line x1="0" y1="0" x2="0" y2="-118" stroke="${WM.metal}" stroke-width="13" stroke-linecap="round"/><circle cx="0" cy="-118" r="20" fill="${WM.force}" stroke="#a8321f" stroke-width="5"/></g>`;
  return o;
}
const handIcon = `<ellipse cx="0" cy="4" rx="20" ry="22" fill="${WM.skin}" stroke="${C.ink}" stroke-width="4"/><path d="M -12 -14 V -30 M -4 -17 V -34 M 4 -17 V -34 M 12 -14 V -30" stroke="${WM.skin}" stroke-width="9" stroke-linecap="round"/>`;
const rollerIcon = `<circle cx="0" cy="-17" r="17" fill="#f3ead6" stroke="${WM.woodD}" stroke-width="5"/><circle cx="0" cy="17" r="17" fill="#f3ead6" stroke="${WM.woodD}" stroke-width="5"/><rect x="-34" y="-4" width="68" height="8" rx="4" fill="${CLO[3]}"/>`;
const spinIcon = `<circle r="26" fill="${WM.basket}" stroke="${WM.basketL}" stroke-width="7" stroke-dasharray="9 5"/>` + arcArrow(38, -150, -40, WM.spin, 7);
SCENES.push({
  id: 'old',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), k = eio(prog(t, c1 - 0.4, 0.9));
    out += g(wringer(t, 2.2 * spun(t, c0 + 0.6)), { x: lerp(860, 250, k), y: lerp(450, 470, k), s: lerp(0.92, 0.5, k) });
    out += pop(badge('むかしは ローラーに はさんで しぼった', { fill: WM.woodD, size: 46, pad: 40 }), t, c0 + 0.4, 960, 160, { end: c1 - 0.4 });
    const wa = 2.2 * spun(t, c0 + 0.6);
    out += tag(860 - 118 * Math.sin(wa) * 0.92, 450 + (-68 - 118 * Math.cos(wa)) * 0.92, 1420, 300, 'ハンドルを まわす', win(t, mid(0, 0.5), c1 - 0.5, 0.3), { size: 42, col: WM.force });
    out += tag(892, 450 + 190 * 0.92, 1440, 640, 'みずが しぼられる', win(t, mid(0, 0.7), c1 - 0.5, 0.3), { size: 42, col: WM.waterD });
    // くらべ
    const hO = prog(t, c1, 0.4);
    if (hO > 0) {
      let c = pop(badge('1965ねんの じっけん', { fill: C.ochre, size: 46, pad: 38 }), t, c1, 1140, 170) + g(sunDisc(1520, 170, 34, 0, { glow: 0.6 }), { o: prog(t, c1 + 0.3, 0.4) });
      c += g(text(1180, 256, 'なつの はれた ひに、かわくまでの じかん', { size: 38, w: 900, fill: C.muted }), { o: prog(t, c1 + 0.5, 0.4) });
      const rows = [[handIcon, 'てで しぼる', 5, '#8fa3b0', mid(1, 0.52)], [rollerIcon, 'ローラー', 2, WM.wood, mid(1, 0.8)], [spinIcon, 'まわして しぼる', 1, WM.spin, c2 + 0.3]];
      rows.forEach(([ic, s, h, col, st], i) => {
        const y = 390 + i * 140, o = prog(t, st, 0.3), bk = eo(prog(t, st + 0.2, 0.5 + h * 0.2)), X0 = 1000, U = 126;
        if (o <= 0) return;
        let r = g(ic, { x: 566, y }) + text(620, y + 2, s, { size: 44, w: 900, anchor: 'start' });
        r += `<rect x="${X0}" y="${y - 30}" width="${F1(U * h * bk)}" height="60" rx="16" fill="${col}"/>`;
        for (let j = 1; j < h; j++) if (U * h * bk > U * j + 4) r += `<line x1="${X0 + U * j}" y1="${y - 30}" x2="${X0 + U * j}" y2="${y + 30}" stroke="#fff" stroke-width="4" opacity="0.7"/>`;
        r += g(text(X0 + U * h + 22, y + 2, h + 'じかん', { size: 50, w: 900, anchor: 'start', fill: i === 2 ? WM.spin : C.ink }), { o: prog(t, st + 0.3 + h * 0.2, 0.3) });
        c += g(r, { o });
      });
      c += pop(badge('いちばん はやい！', { fill: C.accent, size: 40 }), t, mid(2, 0.6), 1610, 670);
      out += g(c, { o: hO });
    }
    return out;
  },
});

// 9. 正解 と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 350, NX = -530, ans = 'かべの ちいさな あなから、そとへ とびだす';
      let a = pop(card(1240, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, ans, { size: fit(ans, 1000, 50, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += flowRow([['はやく まわす', WM.spin], ['そとへ おされる', WM.force], ['みずだけ あなから でる', WM.waterD]], t, 960, 600, { start: 2.4, step: 0.9, size: 42, gap: 70 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [g(lensIcon(), { s: 0.26 }), 'とまったら、おとなと かべの あなを さがす', C.ink, cue(1)],
        [qm, 'あなの ない せんたくそうも あるよ', C.ink, cue(2)],
        [g(towel(CLO[2], 0.36), {}), 'タオルは どっちが ポタポタ たれる？', C.ink, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'まわって いる ときは ふたを あけない・てを いれない', C.red, cue(4)],
        [g(warnIcon, { s: 0.62 }), 'せんたくきの なかには ぜったいに はいらない', C.red, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 1090, 42, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 130, 310 + i * 100); });
      // 絵
      const PX = 1620, PY = 500;
      let p = card(500, 540, { fill: '#fff' }) + `<clipPath id="lkc"><rect x="-250" y="-270" width="500" height="540" rx="28"/></clipPath><g clip-path="url(#lkc)">`;
      const o1 = 1 - prog(t, cue(3) - 0.3, 0.4), o2 = win(t, cue(3) - 0.1, cue(4) - 0.2, 0.4), o3 = prog(t, cue(4) - 0.1, 0.4);
      if (o1 > 0) {
        let q = `<rect x="-290" y="-270" width="580" height="540" fill="${WM.basket}"/>`;
        for (let r = -4; r <= 4; r++) for (let k = -5; k <= 5; k++) q += `<circle cx="${k * 62 + (r % 2 ? 31 : 0)}" cy="${r * 62}" r="11" fill="${WM.hole}" opacity="0.85"/>`;
        q += g(lensIcon(), { x: -30 + Math.sin(t * 0.9) * 60, y: -40 + Math.cos(t * 0.7) * 30, s: 1.25 });
        p += g(q, { o: o1 });
      }
      if (o2 > 0) {
        let q = `<rect x="-290" y="-270" width="580" height="540" fill="#eaf4fa"/><line x1="-290" y1="-150" x2="290" y2="-150" stroke="${C.muted}" stroke-width="6"/>`;
        [[-120, 'せんたくきで'], [120, 'てで']].forEach(([x, s], i) => {
          q += g(towel(CLO[i ? 1 : 2], 1.5), { x, y: -40 }) + `<rect x="${x - 40}" y="-164" width="14" height="34" rx="5" fill="${WM.wood}"/><rect x="${x + 26}" y="-164" width="14" height="34" rx="5" fill="${WM.wood}"/>`;
          q += text(x, 110, s, { size: 32, w: 900 }) + text(x, 152, 'しぼった', { size: 32, w: 900 });
        });
        q += text(0, -40, '？', { size: 110, w: 900, fill: C.ochre }) + dropW(0, 216, 20) + text(0, 216, '', {});
        p += g(q, { o: o2 });
      }
      if (o3 > 0) {
        let q = `<rect x="-290" y="-270" width="580" height="540" fill="${WM.wall}"/><rect x="-290" y="196" width="580" height="74" fill="${WM.floor}"/>`;
        q += g(washer(t, { xray: 0, id: 'wl' }), { x: -60 + Math.sin(t * 38) * 2, y: 214, s: 0.54 });
        q += g(arcArrow(120, -150, -70) + arcArrow(120, 30, 110), { x: -60, y: 26, s: 0.86 });
        q += g(handIcon, { x: 168, y: -170, s: 2.0 }) + cross(168, -170, 0.8);
        p += g(q, { o: o3 });
      }
      p += `</g>`;
      b += pop(p, t, cue(1) + 0.3, PX, PY);
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
    out += g(text(0, 0, 'くわしくは サイトの「せんたくき」の ページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 778, o: prog(t, 2.0, 0.5) });
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

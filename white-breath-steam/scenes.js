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
const TOPIC = 'ゆげと しろい いき';
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

// みのまわり図鑑 動画「さむい とき、ゆげや しろい いきが みえるのは なぜ？」（ゆげと しろい いき）
// 出どころ：everyday-trivia trivia/steam-white-breath.md（絵の見本：assets/figures-steam.js、メモ：ideas/notes/white-breath-steam.md）
// 色の約束：すいじょうき（見えない気体）＝みずいろの小さな輪、みずの つぶ＝あおい丸、白い湯気・息＝しろいもや（灰色のふち）、あたたかい＝オレンジ、つめたい＝あお。

// ---------- 道具 ----------
const WB = {
  vapor: '#6fb3dc', drop: '#2f7fd0', dropLt: '#7fb8ea', puffLn: '#9aa5a9', warm: '#f08a2e', warmDk: '#c96a14', warmLt: '#fde3c4', cold: '#4f8fd0', coldDk: '#2f6bb0', coldLt: '#d9e9f7',
  metal: '#b9c2c6', metalDk: '#8c979b', wall: '#fbf1de', counter: '#d9c7a8', counterDk: '#c4b08c', skyT: '#86b9e0', skyB: '#cfe4f2', snow: '#eef4f8', snowDk: '#b4cddd', light: '#f6c21a',
};
const rad = a => a * Math.PI / 180;
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
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
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 16 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
// しろい もや（丸をかさねた雲。灰色のふち）
function puff(x, y, r = 40, o = 1) {
  if (o <= 0.01 || r <= 0.5) return '';
  const cs = [[0, 0, 1], [-0.8, 0.25, 0.7], [0.8, 0.2, 0.75], [-0.3, -0.45, 0.7], [0.4, -0.4, 0.65]];
  const circ = cs.map(([dx, dy, k]) => `<circle cx="${(x + dx * r).toFixed(1)}" cy="${(y + dy * r).toFixed(1)}" r="${(k * r).toFixed(1)}"/>`).join('');
  return `<g opacity="${o.toFixed(2)}"><g fill="none" stroke="${WB.puffLn}" stroke-width="${Math.max(3, r * 0.09).toFixed(1)}">${circ}</g><g fill="#fff">${circ}</g></g>`;
}
// すいじょうき（見えない気体）＝ 小さな輪
const ring = (x, y, r = 9, o = 1, col = WB.vapor) => o <= 0 ? '' : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="none" stroke="${col}" stroke-width="${Math.max(2.5, r * 0.32)}" opacity="${o.toFixed(2)}"/>`;
// みずの つぶ（液体）＝ あおい丸
const dot = (x, y, r = 9, o = 1, col = WB.drop) => o <= 0 ? '' : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${col}" opacity="${o.toFixed(2)}"/><circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${r * 0.3}" fill="#fff" opacity="${(0.7 * o).toFixed(2)}"/>`;
// やかん（口は右むき）。(x, y) は底のまん中。口の先は (x + 65s, y − 64s)
const kettle = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M -26 -56 Q -30 -92 0 -94 Q 30 -92 26 -56" fill="none" stroke="${C.ink}" stroke-width="${10 / s + 5}" stroke-linecap="round"/><path d="M -26 -56 Q -30 -92 0 -94 Q 30 -92 26 -56" fill="none" stroke="#5b4636" stroke-width="5" stroke-linecap="round"/>
  <path d="M 28 -34 L 62 -66 L 68 -62 L 40 -24 Z" fill="${WB.metal}" stroke="${C.ink}" stroke-width="${6 / s}" stroke-linejoin="round"/>
  <path d="M -40 0 Q -46 -40 -24 -54 H 24 Q 46 -40 40 0 Z" fill="${WB.metal}" stroke="${C.ink}" stroke-width="${6 / s}" stroke-linejoin="round"/>
  <path d="M -24 -54 Q 0 -64 24 -54 Z" fill="${WB.metalDk}" stroke="${C.ink}" stroke-width="${5 / s}" stroke-linejoin="round"/><circle cx="0" cy="-62" r="5" fill="#5b4636" stroke="${C.ink}" stroke-width="${4 / s}"/>
  <path d="M -30 -18 Q -34 -36 -22 -44" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.75"/></g>`;
// こんろ（火つき）。(x, y) は上の面のまん中
function stove(x, y, w, t) {
  let s = '';
  for (let i = 0; i < 5; i++) { const fx = x - w * 0.24 + i * w * 0.12, h = 20 + 9 * Math.sin(t * 9 + i * 1.7); s += `<path d="M ${fx - 9} ${y} Q ${fx - 12} ${y - h * 0.5} ${fx} ${y - h} Q ${fx + 12} ${y - h * 0.5} ${fx + 9} ${y} Z" fill="${WB.warm}"/><path d="M ${fx - 4} ${y} Q ${fx - 5} ${y - h * 0.3} ${fx} ${y - h * 0.55} Q ${fx + 5} ${y - h * 0.3} ${fx + 4} ${y} Z" fill="#ffd86a"/>`; }
  return s + `<rect x="${x - w / 2}" y="${y}" width="${w}" height="34" rx="8" fill="#8f9aa3" stroke="${C.ink}" stroke-width="6"/><rect x="${x - w * 0.36}" y="${y - 8}" width="${w * 0.72}" height="10" rx="3" fill="${C.ink}"/>`;
}
// やかんの湯気。口の先 (x, y) から dir（度。0=右、−90=上）へのぼる。gap: 口のすぐ上の透明なすきまの長さ、len: 白い所の長さ
function steam(x, y, t, { gap = 60, len = 320, dir = -62, n = 7, r0 = 16, r1 = 62, o = 1, rings = true, sp = 0.32, seed = 1 } = {}) {
  if (o <= 0) return '';
  const cx = Math.cos(rad(dir)), cy = Math.sin(rad(dir));
  let s = '';
  for (let i = 0; i < n; i++) {
    const f = ((t * sp + i / n) % 1 + 1) % 1, d = gap + f * len, wob = Math.sin(t * 1.6 + i * 2.1 + seed) * (10 + f * 26);
    s += puff(x + cx * d - cy * wob, y + cy * d + cx * wob - f * f * 30, lerp(r0, r1, f), Math.min(1, f * 7) * Math.pow(1 - f, 0.7));
  }
  if (rings && gap > 20) for (let i = 0; i < 5; i++) { const f = ((t * sp * 2.2 + i / 5) % 1 + 1) % 1, d = f * gap, wob = Math.sin(t * 3 + i * 1.9) * 6; s += ring(x + cx * d - cy * wob, y + cy * d + cx * wob, Math.max(5, r0 * 0.36), 0.95); }
  return `<g opacity="${o}">${s}</g>`;
}
// ルーペでのぞいた丸（柄は右下）
const lens = (x, y, r, inner, { fill = '#fff', id = 'ln' } = {}) => `<path d="M ${x + r * 0.72} ${y + r * 0.72} l ${r * 0.42} ${r * 0.42}" stroke="${C.ochre}" stroke-width="${r * 0.16}" stroke-linecap="round"/><clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r - 4}"/></clipPath><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/><g clip-path="url(#${id})">${inner}</g><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.blueUi}" stroke-width="${Math.max(8, r * 0.07)}"/>`;
// 丸の中に、輪（すいじょうき）と つぶ（みず）をちらす。k: つぶになった割合 0〜1（番号の小さいものから つぶになる）
function specks(x, y, r, n, t, { k = 0, seed = 1, rr = 12, o = 1, drift = 1 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = rnd(i, seed) * Math.PI * 2, d = Math.sqrt(rnd(i, seed + 1)) * (r - rr - 8);
    const px = x + Math.cos(a) * d + Math.sin(t * 1.3 + i * 1.7) * 7 * drift, py = y + Math.sin(a) * d + Math.cos(t * 1.1 + i * 2.3) * 7 * drift;
    const kk = clamp(k * n - i);
    s += kk < 1 ? ring(px, py, rr, o * (1 - kk)) : '';
    s += kk > 0 ? dot(px, py, rr * (0.6 + 0.4 * kk), o * kk) : '';
  }
  return s;
}
// 口から出る白い息（右ななめ上へ）。(x, y) は口。breath: 息をはいている強さ 0〜1
function breathPuffs(x, y, t, { o = 1, n = 6, len = 300, dir = -18, r0 = 14, r1 = 64, sp = 0.45 } = {}) {
  if (o <= 0) return '';
  const cx = Math.cos(rad(dir)), cy = Math.sin(rad(dir));
  let s = '';
  for (let i = 0; i < n; i++) { const f = ((t * sp + i / n) % 1 + 1) % 1, d = 16 + f * len, wob = Math.sin(t * 1.4 + i * 2.3) * f * 24; s += puff(x + cx * d - cy * wob, y + cy * d + cx * wob, lerp(r0, r1, f), Math.min(1, f * 8) * Math.pow(1 - f, 0.8)); }
  return `<g opacity="${o}">${s}</g>`;
}
// 冬の外（うすい空、白い地面、葉のない木）
function winterBg(id, gy = 800) {
  let s = skyG(id, WB.skyT, WB.skyB, { h: gy }) + `<circle cx="1640" cy="210" r="70" fill="#fff6d0" opacity="0.9"/><circle cx="1640" cy="210" r="120" fill="#fff6d0" opacity="0.25"/>`;
  s += `<path d="M 0 ${gy - 60} Q 300 ${gy - 150} 620 ${gy - 60} T 1240 ${gy - 70} T 1920 ${gy - 80} L 1920 ${gy} L 0 ${gy} Z" fill="${WB.snowDk}"/>`;
  s += `<rect x="0" y="${gy}" width="1920" height="${1080 - gy}" fill="${WB.snow}"/><rect x="0" y="${gy}" width="1920" height="10" fill="${WB.snowDk}"/>`;
  return s;
}
const bareTree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="#8a6f57" stroke-linecap="round"><path d="M 0 0 V -150" stroke-width="18"/><path d="M 0 -90 L -60 -160 M 0 -120 L 56 -190 M 0 -150 L -30 -230 M 0 -150 L 34 -236 M -60 -160 L -96 -180 M 56 -190 L 92 -200" stroke-width="10"/></g>`;
// 部屋（あたたかい色のかべと、台）
const roomBg = (gy = 800) => `<rect width="1920" height="1080" fill="${WB.wall}"/><rect x="0" y="${gy}" width="1920" height="${1080 - gy}" fill="${WB.counter}"/><rect x="0" y="${gy}" width="1920" height="14" fill="${WB.counterDk}"/>`;

// 1. つかみ：寒い朝の白い息。やかんの湯気も白い
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3);
    let out = winterBg('hsky', 810) + house(1560, 812, 2.0, '#e9dcc6', '#9a6a55') + `<path d="M 1396 664 L 1560 528 L 1724 664 L 1700 664 L 1560 548 L 1420 664 Z" fill="#fff"/>` + bareTree(1180, 812, 1.5) + bareTree(980, 800, 0.9);
    // おとうとが「はー」
    const BX = 520, BY = 836, BS = 0.6, mx = BX + 26, my = BY - 242 * BS;
    const tB = c0 + d0 * 0.38, bo = win(t, tB, c2 + 0.4, 0.5) + prog(t, c3 - 0.3, 0.5);
    out += breathPuffs(mx, my, t, { o: clamp(bo), len: 360, dir: -14, r1: 74 });
    out += kidShow('S', t, 250, 836, { s: 0.56, start: 0, n: 1, bubble: false, look: [8, -2], eyes: t > tB && t < tB + 2 ? 'wide' : 'open' });
    out += kidShow('B', t, BX, BY, { s: BS, start: 0, n: 0, mouth: t > tB ? 'o' : null });
    out += pop(big(0, 0, 'はー', 110, WB.coldDk), t, tB, 760, 480, { end: c1 - 0.1, d: 0.3 });
    // やかんの湯気
    const ko = win(t, c2 - 0.2, c3 + 0.2, 0.4);
    if (ko > 0) {
      let k = `<clipPath id="hkc"><rect x="-380" y="-290" width="760" height="580" rx="32"/></clipPath><rect x="-380" y="-290" width="760" height="580" rx="32" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#hkc)"><rect x="-380" y="-290" width="760" height="580" fill="${WB.wall}"/><rect x="-380" y="200" width="760" height="90" fill="${WB.counter}"/>`;
      k += stove(-80, 166, 380, t) + kettle(-80, 158, 3.3) + steam(-80 + 65 * 3.3, 158 - 64 * 3.3, t, { gap: 46, len: 250, dir: -64, r1: 60 }) + `</g>`;
      k += g(badge('やかんの ゆげ', { fill: C.ochre, size: 42 }), { x: -180, y: -290 });
      out += g(k, { x: 1400, y: 430, o: ko, s: lerp(0.92, 1, eo(ko)) });
    }
    // しろい ものの しょうたいは？
    out += pop(card(840, 300) + puff(-280, 10, 70, 1) + text(90, -56, 'この しろい もの、', { size: 56, w: 900 }) + text(40, 40, 'なんだろう', { size: 56, w: 900, fill: WB.coldDk }) + text(300, 30, '？', { size: 130, w: 900, fill: C.ochre }), t, c3 + 0.6, 1380, 400, { end: cueE(3) + 0.6 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="100" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">さむい とき、<tspan fill="${C.ochre}">ゆげ</tspan>や <tspan fill="${WB.coldDk}">しろい いき</tspan>が</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="118" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">みえるのは なぜ？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(puff(-150, 0, 56, 1) + puff(0, -14, 70, 1) + puff(150, 0, 56, 1), t, t0 + 1.8, 960, 810);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'しろい ものの しょうたいは？', { size: 80, w: 900 }), t, 0.3, 960, 220);
    const opts = [['①', 'けむり'], ['②', 'みずが きたいに なった「すいじょうき」'], ['③', 'とても ちいさな みずの つぶ']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 900, 400 + i * 168);
    });
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 白いものの正体：水蒸気は見えない。白いのは、冷えてできた小さな水のつぶ。つぶは光をちらす
SCENES.push({
  id: 'vapor',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    let out = roomBg(800);
    const KX = 300, KY = 770, KS = 3.6, sx = KX + 65 * KS, sy = KY - 64 * KS;
    out += stove(KX, KY + 6, 420, t) + kettle(KX, KY, KS) + steam(sx, sy, t, { gap: 64, len: 330, dir: -66, r1: 70 });
    out += topBadge();
    const AX = 1060, BX = 1600, LY = 400, R = 180;
    // すいじょうき（気体）
    const aO = prog(t, c0 + 0.8, 0.4);
    if (aO > 0) {
      let a = `<line x1="${sx + 16}" y1="${sy - 30}" x2="${AX - R}" y2="${LY + 40}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/><circle cx="${sx + 14}" cy="${sy - 30}" r="34" fill="none" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="12 8"/>`;
      let inn = `<rect x="${AX - R}" y="${LY - R}" width="${R * 2}" height="${R * 2}" fill="#f4fafd"/>` + specks(AX, LY, R, 16, t, { k: 0, seed: 3, rr: 15 });
      // 光は まっすぐ 通りぬける
      const lo = prog(t, c3 + 0.3, 0.4);
      if (lo > 0) for (let i = 0; i < 3; i++) { const y = LY - 70 + i * 70, f = ((t - c3) * 0.7 + i * 0.3) % 1; inn += `<line x1="${AX - R}" y1="${y}" x2="${AX + R}" y2="${y}" stroke="${WB.light}" stroke-width="10" opacity="${0.5 * lo}"/><circle cx="${AX - R + f * R * 2}" cy="${y}" r="11" fill="${WB.light}" opacity="${lo}"/>`; }
      a += lens(AX, LY, R, inn, { id: 'vla' });
      a += g(badge('すいじょうき', { fill: WB.vapor, size: 46, pad: 38 }), { x: AX, y: 640 });
      out += g(a, { o: aO });
      out += pop(badge('めに みえない', { fill: C.ink, size: 40 }), t, c1 + 0.5, AX, 720, { end: c3 - 0.1 });
      out += g(text(AX, 782, '（えでは、わで かいています）', { size: 28, w: 700, fill: C.muted }), { o: win(t, c1 + 0.9, c3 - 0.1, 0.3) });
      out += pop(badge('ひかりが とおりぬける', { fill: '#b98a00', size: 36 }), t, c3 + 0.6, AX, 720);
    }
    // 小さな 水のつぶ
    const bO = prog(t, c2 + 0.3, 0.4);
    if (bO > 0) {
      const px = sx + Math.cos(rad(-66)) * 250, py = sy + Math.sin(rad(-66)) * 250;
      let b = `<path d="M ${px + 40} ${py - 30} Q ${AX} ${LY - R - 150} ${BX - R * 0.6} ${LY - R * 0.8}" fill="none" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/><circle cx="${px}" cy="${py}" r="56" fill="none" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="12 8"/>`;
      let inn = `<rect x="${BX - R}" y="${LY - R}" width="${R * 2}" height="${R * 2}" fill="#f1f4f6"/>` + specks(BX, LY, R, 22, t, { k: 1, seed: 7, rr: 15 });
      // つぶが 光を あちこちへ ちらす
      const lo = prog(t, c3 + d3 * 0.35, 0.4);
      if (lo > 0) {
        for (let i = 0; i < 3; i++) { const y = LY - 70 + i * 70; inn += `<line x1="${BX - R}" y1="${y}" x2="${BX - 60 + i * 26}" y2="${y}" stroke="${WB.light}" stroke-width="10" opacity="${0.55 * lo}"/>`; }
        for (let i = 0; i < 9; i++) { const q = i / 9 * Math.PI * 2 + 0.3, f = ((t - c3) * 0.9 + rnd(i, 4)) % 1, ox = BX - 40 + (i % 3) * 30, oy = LY - 60 + (i % 3) * 62; inn += `<line x1="${ox + Math.cos(q) * (14 + f * 60)}" y1="${oy + Math.sin(q) * (14 + f * 60)}" x2="${ox + Math.cos(q) * (40 + f * 60)}" y2="${oy + Math.sin(q) * (40 + f * 60)}" stroke="${WB.light}" stroke-width="8" stroke-linecap="round" opacity="${lo * (1 - f)}"/>`; }
      }
      b += lens(BX, LY, R, inn, { id: 'vlb' });
      b += g(badge('ちいさな みずの つぶ', { fill: WB.drop, size: 46, pad: 38 }), { x: BX, y: 640 });
      out += g(b, { o: bO });
      out += g(arrow2(AX + R + 24, LY, BX - R - 24, LY, WB.cold, 14) + text((AX + BX) / 2, LY - 46, 'ひえる', { size: 40, w: 900, fill: WB.coldDk }), { o: prog(t, c2 + d2 * 0.3, 0.4) });
      out += pop(badge('しろく みえる', { fill: C.ink, size: 40 }), t, c2 + d2 * 0.6, BX, 720, { end: c3 - 0.1 });
      out += pop(badge('ひかりを あちこちへ ちらす', { fill: '#b98a00', size: 36 }), t, c3 + d3 * 0.4, BX, 720);
    }
    return out;
  },
});

// 4. やかんの口のすぐ上は透明：そこは まだ冷えていない水蒸気。少しはなれて冷えると 白くなる
SCENES.push({
  id: 'gap',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3);
    let out = roomBg(800);
    const KX = 300, KY = 800, KS = 4.4, sx = KX + 65 * KS, sy = KY - 64 * KS, DIR = -34, GAP = 190;
    const ux = Math.cos(rad(DIR)), uy = Math.sin(rad(DIR));
    out += stove(KX, KY + 6, 500, t) + kettle(KX, KY, KS) + steam(sx, sy, t, { gap: GAP, len: 470, dir: DIR, r0: 26, r1: 104, n: 8, sp: 0.26 });
    out += topBadge();
    // とうめいな すきま
    const go = prog(t, c0 + d0 * 0.55, 0.4), pk = 0.6 + 0.4 * Math.sin(t * 5);
    const gx = sx + ux * GAP * 0.5, gy = sy + uy * GAP * 0.5;
    out += g(`<ellipse cx="${gx}" cy="${gy}" rx="${GAP * 0.56}" ry="62" fill="none" stroke="${C.redUi}" stroke-width="8" stroke-dasharray="20 12" opacity="${pk}" transform="rotate(${DIR} ${gx} ${gy})"/>`, { o: go * (1 - prog(t, c2 + 0.2, 0.4)) });
    out += tag(gx - 20, gy - 56, 520, 230, 'とうめいな すきま', go, { col: C.redUi, size: 50 });
    out += tag(gx + 20, gy + 30, 960, 650, 'まだ ひえていない すいじょうき', prog(t, c1 + 0.4, 0.3), { col: '#3f8fc0', size: 44 });
    // 少しはなれて、冷えると
    const wx = sx + ux * (GAP + 250), wy = sy + uy * (GAP + 250);
    out += tag(wx + 50, wy + 46, 1490, 320, 'ひえて、みずの つぶに', prog(t, c2 + 0.5, 0.3), { col: WB.drop, size: 46 });
    out += pop(badge('しろく みえる', { fill: C.ink, size: 44 }), t, c2 + d2 * 0.55, 1490, 410);
    // 注意
    out += pop(badge('ゆげは あつい。ちかづかない', { fill: C.red, size: 40 }) + g(warnIcon(0.72), { x: -(tw('ゆげは あつい。ちかづかない', 40, 700, 0.04) / 2 + 84), y: -4 }), t, c0 + 1.0, 1320, 770);
    out += kidShow('S', t, 1740, 850, { s: 0.5, start: c3 - 0.9, n: 0, look: [-8, -6] });
    return out;
  },
});

// 5. 空気がもてる水蒸気の量は、温度で決まる。冷やされると、もちきれない分が 水のつぶになる。雲も同じ
SCENES.push({
  id: 'hold',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうして ひえると、つぶに なる？', { size: 64, w: 900 }), t, c0 + 0.3, 960, 190, { end: c1 - 0.2 });
    // 棒グラフ：1立方メートルの空気がもてる水蒸気（0・10・20・30度）
    const BASE = 690, V = [[0, 4.85], [10, 9.4], [20, 17.3], [30, 30.4]], PX = 13, BW = 170;
    const co = prog(t, c1 - 0.1, 0.4);
    if (co > 0) {
      let c = pop(text(0, 0, 'くうきが もてる すいじょうきの りょう', { size: 50, w: 900 }), t, c1 + 0.2, 580, 170);
      c += `<line x1="150" y1="${BASE}" x2="1010" y2="${BASE}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
      V.forEach(([deg, v], i) => {
        const x = 270 + i * 210, st = c1 + d1 * 0.45 + i * 0.5, k = eo(prog(t, st, 0.7)), h = v * PX * k, col = mix(WB.cold, WB.warm, i / 3), lt = mix(WB.coldLt, WB.warmLt, i / 3);
        if (k > 0) {
          c += `<rect x="${x - BW / 2}" y="${BASE - h}" width="${BW}" height="${h}" rx="12" fill="${lt}" stroke="${col}" stroke-width="8"/>`;
          const n = Math.round(v / 1.6);
          for (let j = 0; j < n; j++) { const rx = x - BW / 2 + 28 + (j % 4) * 38 + (Math.floor(j / 4) % 2) * 10, ry = BASE - 26 - Math.floor(j / 4) * 84 * (v * PX - 40) / Math.max(84, Math.ceil(n / 4) * 84 - 60) - (j % 4) * 6; if (ry > BASE - h + 16) c += ring(rx + Math.sin(t * 1.4 + j) * 4, ry + Math.cos(t * 1.2 + j * 1.7) * 4, 12, 1); }
          c += g(text(x, BASE - v * PX - 34, `${v}グラム`, { size: 34, w: 900, fill: mix(col, '#000', 0.25), ls: 0 }), { o: prog(t, st + 0.5, 0.3) });
        }
        c += g(text(x, BASE + 44, `${deg}ど`, { size: 44, w: 900, fill: mix(col, '#000', 0.2) }), { o: prog(t, c1 + 0.6 + i * 0.15, 0.3) });
      });
      c += pop(badge('つめたい', { fill: WB.cold, size: 38 }), t, c2 + d2 * 0.55, 270, BASE + 106) + pop(badge('あたたかい', { fill: WB.warm, size: 38 }), t, c2 + 0.3, 900, BASE + 106);
      c += pop(badge('すこししか もてない', { fill: WB.coldDk, size: 36 }), t, c2 + d2 * 0.6, 290, 470, { end: c3 - 0.1 }) + pop(badge('たくさん もてる', { fill: WB.warmDk, size: 36 }), t, c2 + 0.5, 610, 320, { end: c3 - 0.1 });
      out += g(c, { o: co * (1 - prog(t, c4 - 0.4, 0.4)) });
    }
    // 冷やされると：はこ（空気）が もてる量がへって、もちきれない分が つぶになる
    const ro = prog(t, c3 - 0.1, 0.4) * (1 - prog(t, c4 - 0.4, 0.4));
    if (ro > 0) {
      const X = 1500, Y0 = 240, W = 420, H = 440, cool = eio(prog(t, c3 + d3 * 0.22, 1.8)), cap = lerp(1, 0.34, cool), col = mix(WB.warm, WB.cold, cool), lt = mix(WB.warmLt, WB.coldLt, cool);
      let r = `<rect x="${X - W / 2}" y="${Y0}" width="${W}" height="${H}" rx="22" fill="${lt}" stroke="${col}" stroke-width="10"/>`;
      r += g(badge(cool < 0.5 ? 'あたたかい くうき' : 'つめたい くうき', { fill: col, size: 38 }), { x: X, y: Y0 });
      // もてる量の線（下から cap ぶんまで）
      const ly = Y0 + H - (H - 50) * cap;
      r += `<line x1="${X - W / 2 + 10}" y1="${ly}" x2="${X + W / 2 - 10}" y2="${ly}" stroke="${col}" stroke-width="6" stroke-dasharray="16 10"/>` + text(X - W / 2 - 44, ly + 2, 'ここまで もてる', { size: 32, w: 900, fill: mix(col, '#000', 0.25), anchor: 'end' }) + `<path d="M ${X - W / 2 - 34} ${ly} h 22 m -10 -9 l 10 9 l -10 9" fill="none" stroke="${mix(col, '#000', 0.25)}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      for (let j = 0; j < 20; j++) {
        const px = X - W / 2 + 56 + (j % 5) * 77 + (Math.floor(j / 5) % 2) * 16, py = Y0 + H - 44 - Math.floor(j / 5) * 92;
        const over = py < ly + 6, kk = over ? clamp((cool - 0.25) * 2.2 - (j % 5) * 0.1) : 0;
        r += kk < 1 ? ring(px + Math.sin(t * 1.4 + j) * 5, py + Math.cos(t * 1.2 + j * 1.7) * 5, 15, 1 - kk) : '';
        r += kk > 0 ? dot(px, py, 15 * (0.6 + 0.4 * kk), kk) : '';
      }
      out += g(r, { o: ro });
      out += pop(badge('ひやされると…', { fill: WB.cold, size: 40 }), t, c3 + 0.3, 1500, 745, { end: c3 + d3 * 0.5 });
      out += pop(badge('もちきれない ぶんが、みずの つぶに', { fill: WB.drop, size: 38 }), t, c3 + d3 * 0.52, 1500, 745, { end: c4 - 0.3 });
    }
    // 雲も同じ
    const so = prog(t, c4 - 0.2, 0.5);
    if (so > 0) {
      let f = `<clipPath id="hcl"><rect x="-700" y="-300" width="1400" height="600" rx="36"/></clipPath><rect x="-700" y="-300" width="1400" height="600" rx="36" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#hcl)">` + skyG('hcsky', '#6fb1e6', '#d6edfa', { x: -700, y: -300, w: 1400, h: 600 });
      f += `<path d="M -700 240 Q -400 190 -100 240 T 700 220 L 700 300 L -700 300 Z" fill="#8cc27a"/>`;
      f += g(cloud(0, 0, 1.9), { x: -330, y: -60 + Math.sin(t * 0.8) * 6 }) + cloud(-610, -210, 0.6, '#fff', 0.8) + `</g>`;
      // 雲の中（ルーペ）：水や氷のつぶ
      let inn = `<rect x="110" y="-250" width="460" height="460" fill="#eef3f6"/>` + specks(340, -20, 210, 16, t, { k: 1, seed: 11, rr: 16 });
      [[250, -120], [420, 60], [330, 110], [440, -110]].forEach(([x, y], i) => { inn += `<g transform="translate(${x + Math.sin(t + i) * 5} ${y + Math.cos(t * 1.2 + i) * 5}) rotate(${i * 20})" stroke="#9cc4dc" stroke-width="7" stroke-linecap="round">${[0, 60, 120].map(a => `<line x1="-20" y1="0" x2="20" y2="0" transform="rotate(${a})"/>`).join('')}</g>`; });
      f += `<line x1="-200" y1="-110" x2="140" y2="-80" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/>` + lens(340, -20, 210, inn, { id: 'hll' });
      f += g(badge('そらの くも', { fill: C.blueUi, size: 44, pad: 40 }), { x: -420, y: -300 }) + pop(badge('みずや こおりの つぶ', { fill: WB.drop, size: 42 }), t, c4 + d4 * 0.55, 340, 236);
      f += pop(badge('おなじ しくみ', { fill: C.ochre, size: 46, pad: 40 }), t, c4 + d4 * 0.3, -330, 150);
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${so}"/>` + topBadge() + g(f, { x: 960, y: 470, o: so, s: lerp(0.92, 1, eo(so)) });
      out += kidShow('K', t, 200, 850, { s: 0.6, start: c5 - 0.9, n: 0, bubble: false, mouth: lineOf('K') ? 'open' : 'smile' });
      out += talkBubble('K', 520, 800, 300, 772, 44);
    }
    return out;
  },
});

// 6. 白い息：あたたかくて水蒸気の多い息 ＋ 冷たい空気 → まざると もちきれなくなって、水のつぶ
SCENES.push({
  id: 'breath',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4;
    let out = winterBg('bsky', 810);
    const BX = 230, BY = 836, BS = 0.78, mx = BX + 30, my = BY - 242 * BS;
    out += breathPuffs(mx, my, t, { o: 1, len: 330, dir: -12, r1: 70, n: 6 });
    out += kidShow('B', t, BX, BY, { s: BS, start: 0, n: 0, bubble: false, mouth: 'o', enter: 'pop' });
    out += topBadge();
    out += pop(badge('しろい いきは？', { fill: C.ochre, size: 50, pad: 42 }), t, c0 + 0.3, 1100, 330, { end: c1 - 0.2 });
    // 息（あたたかい・水蒸気がいっぱい）＋ 冷たい空気 → まざると…
    const R = 165, Y = 420, X1 = 880, X2 = 1280, X3 = 1680;
    const pill = (str, col, size = 36) => { const w = tw(str, size, 900) + 44; return `<rect x="${-w / 2}" y="${-size * 0.78}" width="${w}" height="${size * 1.56}" rx="${size * 0.78}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(0, 2, str, { size, w: 900, fill: col }); };
    const o1 = prog(t, c1 + 0.2, 0.4), o2 = prog(t, c2 + 0.2, 0.4), o3 = prog(t, c2 + d2 * 0.5, 0.4), eo2 = 1 - prog(t, c4 - 0.4, 0.4);
    let q = '';
    if (o1 > 0) {
      q += g(`<line x1="${mx + 90}" y1="${my - 30}" x2="${X1 - R + 20}" y2="${Y + 40}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/>` +
        lens(X1, Y, R, `<rect x="${X1 - R}" y="${Y - R}" width="${R * 2}" height="${R * 2}" fill="${WB.warmLt}"/>` + specks(X1, Y, R, 22, t, { k: 0, seed: 21, rr: 13 }), { id: 'bl1' }) +
        g(badge('はく いき', { fill: WB.warm, size: 42 }), { x: X1, y: Y - R - 26 }), { o: o1 });
      q += pop(pill('あたたかい', WB.warmDk, 40), t, c1 + d1 * 0.3, X1, 640) + pop(pill('すいじょうきが いっぱい', WB.warmDk, 32), t, c1 + d1 * 0.55, X1, 708);
    }
    if (o2 > 0) {
      q += g(text((X1 + X2) / 2, Y + 2, '＋', { size: 60, w: 900, fill: C.ink }) + lens(X2, Y, R, `<rect x="${X2 - R}" y="${Y - R}" width="${R * 2}" height="${R * 2}" fill="${WB.coldLt}"/>` + specks(X2, Y, R, 5, t, { k: 0, seed: 25, rr: 13 }), { id: 'bl2' }) +
        g(badge('そとの くうき', { fill: WB.cold, size: 42 }), { x: X2, y: Y - R - 26 }), { o: o2 });
      q += pop(pill('つめたい', WB.coldDk, 40), t, c2 + 0.5, X2, 640) + pop(pill('すこししか もてない', WB.coldDk, 32), t, c2 + 0.9, X2, 708);
    }
    if (o3 > 0) {
      const k = eio(prog(t, c3 + 0.2, 1.6)) * 0.62, wh = prog(t, c3 + 0.9, 1.0);
      q += g(g(arrow2((X2 + X3) / 2 - 30, Y, (X2 + X3) / 2 + 34, Y, C.ink, 11), {}) + lens(X3, Y, R, `<rect x="${X3 - R}" y="${Y - R}" width="${R * 2}" height="${R * 2}" fill="${mix('#e6eef5', '#f6f8f9', wh)}"/>` + specks(X3, Y, R, 22, t, { k, seed: 21, rr: 13 }), { id: 'bl3' }) +
        g(badge('まざると…', { fill: C.ink, size: 42 }), { x: X3, y: Y - R - 26 }), { o: o3 });
      q += pop(pill('もちきれない！', C.redUi, 40), t, c2 + d2 * 0.7, X3, 640) + pop(pill('みずの つぶが できる', WB.drop, 32), t, c3 + 0.6, X3, 708);
      q += pop(badge('これが しろい いき', { fill: WB.drop, size: 46, pad: 40 }), t, c3 + d3 * 0.55, 1280, 792);
    }
    out += g(q, { o: eo2 });
    // 冬の寒い朝 と 夏の暑い昼：湯気の見えかた
    const wo = prog(t, c4 - 0.2, 0.5);
    if (wo > 0) {
      const cardK = (x, label, col, bg, amt, st, sun) => {
        let k = `<clipPath id="bk${x}"><rect x="-330" y="-270" width="660" height="540" rx="32"/></clipPath><rect x="-330" y="-270" width="660" height="540" rx="32" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#bk${x})"><rect x="-330" y="-270" width="660" height="540" fill="${bg}"/>`;
        k += `<rect x="60" y="-220" width="210" height="190" rx="10" fill="${sun ? '#8fcbf2' : '#cfe1ee'}" stroke="#fff" stroke-width="14"/>` + (sun ? sunDisc(165, -140, 36, 0, { glow: 0.6 }) : `<circle cx="120" cy="-170" r="7" fill="#fff"/><circle cx="200" cy="-110" r="7" fill="#fff"/><circle cx="150" cy="-70" r="6" fill="#fff"/><circle cx="230" cy="-180" r="6" fill="#fff"/>`);
        k += `<rect x="-330" y="190" width="660" height="80" fill="${WB.counter}"/>` + stove(-110, 160, 330, t) + kettle(-110, 152, 2.9) + steam(-110 + 65 * 2.9, 152 - 64 * 2.9, t, { gap: 40, len: 60 + 230 * amt, dir: -66, r0: 10 + 6 * amt, r1: 20 + 46 * amt, n: amt > 0.5 ? 7 : 3, o: 0.55 + 0.45 * amt, seed: x }) + `</g>`;
        k += g(badge(label, { fill: col, size: 42 }), { y: -270 });
        return pop(k, t, st, x, 470);
      };
      let w = cardK(560, 'ふゆの さむい あさ', WB.cold, '#f4f1ea', 1, c4 + 0.1, false) + cardK(1360, 'なつの あつい ひる', WB.warm, '#fbf1de', 0.25, c4 + d4 * 0.2, true);
      w += pop(badge('ゆげが たくさん みえる', { fill: WB.coldDk, size: 40 }), t, c4 + d4 * 0.55, 560, 790) + pop(badge('すこししか みえない', { fill: WB.warmDk, size: 40 }), t, c4 + d4 * 0.3, 1360, 790);
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${wo}"/>` + topBadge() + g(w, { o: wo });
    }
    return out;
  },
});

// 7. すぐ消えるわけ：かわいた空気とまざると、つぶが また水蒸気にもどる
SCENES.push({
  id: 'fade',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1;
    let out = winterBg('fsky', 810);
    const BX = 230, BY = 836, BS = 0.78, mx = BX + 30, my = BY - 242 * BS;
    // 白い息が流れて、うすくなって消える（くり返し）
    const cyc = 4.6, ph = ((t - 0.4) % cyc + cyc) % cyc, k = clamp(ph / 3.8), blow = ph < 1.1;
    const fo = Math.pow(1 - k, 1.3);
    for (let i = 0; i < 5; i++) { const d = 60 + k * 420 + i * 46, wob = Math.sin(t * 1.3 + i * 2) * 14; out += puff(mx + d, my - 20 - k * 70 - i * 10 + wob, 44 + i * 6 + k * 26, Math.min(1, ph * 4) * fo * (1 - i * 0.08)); }
    out += kidShow('B', t, BX, BY, { s: BS, start: 0, n: 0, bubble: false, mouth: blow ? 'o' : 'smile', enter: 'pop' });
    out += topBadge();
    out += pop(badge('すぐ きえる', { fill: C.ochre, size: 50, pad: 42 }), t, c0 + 0.5, 760, 250);
    // ルーペ：つぶ → 水蒸気（見えない）
    const lo = prog(t, c1 - 0.2, 0.4);
    if (lo > 0) {
      const X = 1420, Y = 440, R = 220, back2 = eio(prog(t, c1 + d1 * 0.35, 2.6));
      let inn = `<rect x="${X - R}" y="${Y - R}" width="${R * 2}" height="${R * 2}" fill="${mix('#f1f4f6', '#e9f3fa', back2)}"/>` + specks(X, Y, R, 24, t, { k: 1 - back2, seed: 31, rr: 16 });
      out += g(`<line x1="${mx + 420}" y1="${my - 80}" x2="${X - R + 30}" y2="${Y + 60}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="12 10"/>` + lens(X, Y, R, inn, { id: 'fl1' }), { o: lo });
      out += pop(badge('かわいた くうきと まざる', { fill: C.blueUi, size: 42 }), t, c1 + 0.4, X, 150);
      out += pop(badge('みずの つぶ', { fill: WB.drop, size: 40 }), t, c1 + d1 * 0.3, 1100, 748) + g(arrow2(1236, 748, 1300, 748, C.ink, 12), { o: prog(t, c1 + d1 * 0.45, 0.3) }) + pop(badge('すいじょうき（みえない）', { fill: '#3f8fc0', size: 40 }), t, c1 + d1 * 0.5, 1590, 748);
    }
    return out;
  },
});

// 小さな大人（うしろ姿ではなく、正面のかんたんな人）
const grownup = (x, y, s = 1, col = '#5f8f7a') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-17" y="-70" width="14" height="70" rx="7" fill="#35657f"/><rect x="3" y="-70" width="14" height="70" rx="7" fill="#35657f"/><rect x="-26" y="-160" width="52" height="100" rx="18" fill="${col}"/><circle cx="0" cy="-192" r="30" fill="${CH.skin}"/><path d="M -30 -196 A 30 30 0 0 1 30 -196 Q 0 -214 -30 -196 Z" fill="${CH.hairB}"/></g>`;

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5);
    const aO = 1 - prog(t, c1 - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'とても ちいさな みずの つぶ', { size: 58, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['すいじょうきは みえない', WB.vapor], ['ひえて みずの つぶに', WB.drop], ['くもと おなじ', C.blueUi]], t, 900, 660, { start: 2.6, step: 1.3 });
      a += kidShow('K', t, 1730, 850, { s: 0.7, start: 1.6, n: 0, bubble: false });
      out += g(a, { o: aO });
    }
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, c1 - 0.2, 400, 190);
      const row = (ic, s1, s2, col, y, st, size = 44) => pop(ic + (s2 ? text(80, -30, s1, { size, w: 900, anchor: 'start', fill: col }) + text(80, 30, s2, { size, w: 900, anchor: 'start', fill: col }) : text(80, 2, s1, { size, w: 900, anchor: 'start', fill: col })), t, st, 990, y);
      const dotIc = col => `<circle r="14" fill="${col}"/>`;
      // その1：外と部屋で「はー」
      const p1 = 1 - prog(t, c3 - 0.6, 0.4);
      if (p1 > 0) {
        let q = '';
        [[280, 'そと', WB.cold, 0, c1 + 0.3], [710, 'へやの なか', WB.warm, 1, c1 + d1 * 0.5]].forEach(([x, label, col, room, st]) => {
          let f = `<clipPath id="lk${x}"><rect x="-200" y="-270" width="400" height="540" rx="28"/></clipPath><rect x="-200" y="-270" width="400" height="540" rx="28" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#lk${x})">`;
          f += room ? `<rect x="-200" y="-270" width="400" height="540" fill="${WB.wall}"/><rect x="-200" y="170" width="400" height="100" fill="${WB.counter}"/><rect x="-160" y="-190" width="120" height="140" rx="8" fill="#cfe1ee" stroke="#fff" stroke-width="12"/>`
            : skyG('lks' + x, WB.skyT, WB.skyB, { x: -200, y: -270, w: 400, h: 540 }) + `<rect x="-200" y="170" width="400" height="100" fill="${WB.snow}"/>` + bareTree(-130, 172, 0.8);
          f += `</g>`;
          q += pop(f + g(badge(label, { fill: col, size: 40 }), { y: -270 }), t, st, x, 556);
          q += kidShow(room ? 'S' : 'B', t, x - 40, 732, { s: 0.42, start: st + 0.2, n: room, enter: 'pop', bubble: false, mouth: 'o' });
          q += pop(text(0, 0, 'はー', { size: 56, w: 900, fill: mix(col, '#000', 0.2) }), t, st + 0.5, x + 100, room ? 582 : 626) + pop(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), t, c2 + 0.3 + room * 0.4, x + 110, 416);
        });
        q += row(dotIc(WB.cold), 'さむい あさ、', 'そとと へやの なかで「はー」', C.ink, 360, c1 + 0.1);
        q += row(g(eyeIcon(0.24), {}), 'どちらで しろく なるか、', 'よそうしてから くらべる', C.ink, 560, c2 + 0.1);
        b += g(q, { o: p1 });
      }
      // その2：大人がわかした やかんを、はなれて見る
      const p2 = prog(t, c3 - 0.3, 0.5);
      if (p2 > 0) {
        let q = `<clipPath id="lkk"><rect x="70" y="270" width="850" height="540" rx="28"/></clipPath><rect x="70" y="270" width="850" height="540" rx="28" fill="#fff" filter="url(#shadow)"/><g clip-path="url(#lkk)"><rect x="70" y="270" width="850" height="540" fill="${WB.wall}"/><rect x="70" y="700" width="850" height="110" fill="${WB.counter}"/><rect x="70" y="700" width="850" height="10" fill="${WB.counterDk}"/>`;
        const KX = 350, KY = 610, KS = 2.5, sx = KX + 65 * KS, sy = KY - 64 * KS;
        q += `<rect x="200" y="650" width="330" height="60" fill="#e9eef1" stroke="${C.ink}" stroke-width="5"/>` + stove(KX, KY + 6, 280, t) + kettle(KX, KY, KS) + steam(sx, sy, t, { gap: 54, len: 200, dir: -64, r0: 12, r1: 46, n: 6 });
        q += grownup(140, 706, 1.25) + `</g>`;
        const pk = 0.6 + 0.4 * Math.sin(t * 5), gx = sx + Math.cos(rad(-64)) * 27, gy = sy + Math.sin(rad(-64)) * 27;
        q += `<circle cx="${gx}" cy="${gy}" r="44" fill="none" stroke="${C.redUi}" stroke-width="7" stroke-dasharray="16 10" opacity="${pk * prog(t, c3 + d3 * 0.6, 0.3)}"/>`;
        q += kidShow('S', t, 800, 716, { s: 0.42, start: c3, n: 0, enter: 'pop', bubble: false, pose: 'pointL', look: [-8, -5], eyes: 'wide' });
        q += g(`<line x1="570" y1="760" x2="730" y2="760" stroke="${C.accent}" stroke-width="8" stroke-linecap="round"/><path d="M 558 760 l 26 -16 v 32 Z M 742 760 l -26 -16 v 32 Z" fill="${C.accent}"/>`, { o: prog(t, c3 + d3 * 0.35, 0.3) }) + pop(badge('はなれて みる', { fill: C.accent, size: 36 }), t, c3 + d3 * 0.35, 650, 690);
        q += tag(gx + 20, gy - 30, 700, 330, 'とうめいな すきま？', prog(t, c3 + d3 * 0.62, 0.3), { size: 36, col: C.redUi });
        q += row(g(eyeIcon(0.24), {}), 'おとなが おゆを わかしたら、', 'はなれて、くちの すぐ うえを みる', C.ink, 350, c3 + 0.1, 40);
        q += row(warnIcon(0.62), 'ゆげの でぐちは とても あつい', 'てや かおを ちかづけない・さわらない', C.red, 530, c4 + 0.1, 40);
        q += row(warnIcon(0.62), 'おゆを わかすのも、', 'ふたを あけるのも、おとな', C.red, 710, c5 + 0.1, 40);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ゆげ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

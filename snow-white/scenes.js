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
const TOPIC = 'ゆき';
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
// みのまわり図鑑「雪は、どうして 白いの？」（もとの記事：everyday-trivia trivia/snow-white.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 色の約束：こおり＝うすい水色（すきとおる）、くうき（すきま）＝こん色の地、ひかり＝きいろの線、ゆき＝しろ
const SN = {
  sky: '#9ccbec', sky2: '#e3f2fb', shade: '#dbe8f2', shade2: '#bcd3e4', ice: '#cfe6f5', iceLine: '#6fa3c8', iceDk: '#3f6f96',
  navy: '#22364d', navy2: '#30506f', ray: '#f2b21c', rayDk: '#b97f10', glove: '#2b2b30', gloveLt: '#474750', cuff: '#c9634e', warm: '#e8744a',
};
const LCOL = [LIGHT.red, LIGHT.orange, LIGHT.yellow, LIGHT.green, LIGHT.blue, LIGHT.violet];

// ---------- ゆきの道具 ----------
// すきとおった氷のつぶ（少しいびつな六角形）
const GK = [1, 0.82, 0.95, 0.78, 1, 0.86];
function grain(x, y, r, rot = 0, { fo = 0.55, fill = SN.ice, sw = 4, line = SN.iceLine } = {}) {
  const p = GK.map((k, i) => { const a = rot + i * Math.PI / 3; return `${(x + Math.cos(a) * r * k).toFixed(1)},${(y + Math.sin(a) * r * k).toFixed(1)}`; }).join(' ');
  return `<polygon points="${p}" fill="${fill}" fill-opacity="${fo}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<path d="M ${(x - r * 0.45).toFixed(1)} ${(y - r * 0.15).toFixed(1)} l ${(r * 0.3).toFixed(1)} ${(-r * 0.3).toFixed(1)}" stroke="#fff" stroke-width="${Math.max(3, r * 0.08)}" stroke-linecap="round" opacity="0.9"/>`;
}
// 雪のけっしょうのマーク
const flake = (x, y, r, col = SN.iceDk, w = 8) => `<g transform="translate(${x} ${y})" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none">${[0, 60, 120].map(a => `<g transform="rotate(${a})"><line x1="${-r}" y1="0" x2="${r}" y2="0"/><path d="M ${r * 0.55} ${-r * 0.28} L ${r * 0.72} 0 L ${r * 0.55} ${r * 0.28} M ${-r * 0.55} ${-r * 0.28} L ${-r * 0.72} 0 L ${-r * 0.55} ${r * 0.28}"/></g>`).join('')}</g>`;
// 矢印（k：0〜1 でのびる）
function arrow(x1, y1, x2, y2, col, w = 14, k = 1, o = 1) {
  if (k <= 0.02 || o <= 0.01) return '';
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = w * 2.4;
  const bx = ex - Math.cos(a) * hd, by = ey - Math.sin(a) * hd, nx = -Math.sin(a) * hd * 0.75, ny = Math.cos(a) * hd * 0.75;
  return `<g opacity="${o}"><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${ex.toFixed(1)} ${ey.toFixed(1)} L ${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)} L ${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)} Z" fill="${col}" stroke="${col}" stroke-width="${w * 0.3}" stroke-linejoin="round"/></g>`;
}
const olText = (x, y, str, { size = 44, fill = '#fff', ol = SN.iceDk, sw = 10, anchor = 'middle' } = {}) =>
  text(x, y, str, { size, w: 900, fill, anchor, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;
// 折れ線の光。f：0〜1 で先へ進む。まがり角を通るとき小さく光る
function ray(pts, f, { col = SN.ray, w = 10, o = 1, head = true } = {}) {
  if (f <= 0 || o <= 0.01) return '';
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let rem = Math.min(1, f) * tot, d = `M ${pts[0][0]} ${pts[0][1]}`, hx = pts[0][0], hy = pts[0][1], acc = 0, fl = '';
  for (let i = 1; i < pts.length; i++) {
    if (rem > 0) { const k = Math.min(1, rem / L[i - 1]); hx = lerp(pts[i - 1][0], pts[i][0], k); hy = lerp(pts[i - 1][1], pts[i][1], k); d += ` L ${hx.toFixed(1)} ${hy.toFixed(1)}`; rem -= L[i - 1]; }
    acc += L[i - 1];
    if (i < pts.length - 1) { const fi = acc / tot, a = (f - fi) / 0.05; if (a > 0 && a < 1) fl += `<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="${16 + 30 * a}" fill="none" stroke="#fff" stroke-width="7" opacity="${1 - a}"/>`; }
  }
  return `<g opacity="${o}"><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>${fl}` +
    (head && f < 1 ? `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${w * 2.4}" fill="${col}" opacity="0.4" filter="url(#soft)"/><circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${w * 1.1}" fill="#fff"/>` : '') + `</g>`;
}
// 冬の外の背景（空と雪の野原）
const winterBg = (id, top = SN.sky, bot = SN.sky2) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.7" stop-color="${bot}"/></linearGradient><rect width="1920" height="1080" fill="url(#${id})"/>`;
const snowfall = (t, n = 46, o = 1) => { let s = ''; for (let i = 0; i < n; i++) { const sp = 60 + rnd(i, 31) * 70, x = (rnd(i, 32) * 1920 + Math.sin(t * 0.9 + i) * 30), y = ((rnd(i, 33) * 1080 + t * sp) % 1080); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${4 + rnd(i, 34) * 6}" fill="#fff" opacity="${(0.55 + rnd(i, 35) * 0.4) * o}"/>`; } return s; };
const snowTree = (x, y, s) => tree(x, y, s, '#4f8f6a') + `<g transform="translate(${x} ${y}) scale(${s})"><path d="M -44 -112 Q -30 -150 0 -146 Q 34 -150 46 -110 Q 20 -124 0 -116 Q -22 -126 -44 -112 Z" fill="#fff"/><ellipse cx="-34" cy="-82" rx="22" ry="9" fill="#fff"/><ellipse cx="34" cy="-80" rx="22" ry="9" fill="#fff"/></g>`;
const snowHouse = (x, y, s) => house(x, y, s, '#f4ead8', '#b9654e') + `<g transform="translate(${x} ${y}) scale(${s})"><path d="M -84 -74 L 0 -146 L 84 -74 Q 60 -84 44 -96 L 0 -130 L -44 -96 Q -62 -84 -84 -74 Z" fill="#fff" stroke="${SN.shade2}" stroke-width="3" stroke-linejoin="round"/></g>`;
const snowman = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="4" rx="96" ry="14" fill="${SN.shade2}" opacity="0.7"/><circle cx="0" cy="-70" r="78" fill="#fff" stroke="${SN.shade2}" stroke-width="5"/><circle cx="0" cy="-186" r="56" fill="#fff" stroke="${SN.shade2}" stroke-width="5"/>
  <circle cx="-20" cy="-198" r="7" fill="${C.ink}"/><circle cx="20" cy="-198" r="7" fill="${C.ink}"/><path d="M 0 -186 L 44 -176 L 0 -170 Z" fill="${SN.warm}"/><path d="M -22 -160 Q 0 -146 22 -160" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
  <path d="M -44 -232 L -34 -284 L 34 -284 L 44 -232 Z" fill="${C.blueUi}"/><rect x="-56" y="-240" width="112" height="14" rx="7" fill="${C.blueUi}"/><circle cx="0" cy="-92" r="7" fill="${C.ink}"/><circle cx="0" cy="-58" r="7" fill="${C.ink}"/></g>`;
// 雪の山（白いこんもり）
const mound = (x, y, w, h) => `<path d="M ${x - w / 2} ${y} Q ${x - w * 0.42} ${y - h * 0.9} ${x - w * 0.12} ${y - h} Q ${x + w * 0.2} ${y - h * 1.08} ${x + w * 0.36} ${y - h * 0.5} Q ${x + w * 0.47} ${y - h * 0.2} ${x + w / 2} ${y} Z" fill="#fff" stroke="${SN.shade2}" stroke-width="5" stroke-linejoin="round"/>` +
  `<path d="M ${x - w * 0.1} ${y - h * 0.14} Q ${x + w * 0.2} ${y - h * 0.3} ${x + w * 0.36} ${y - h * 0.12}" fill="none" stroke="${SN.shade}" stroke-width="12" stroke-linecap="round"/>`;
// 黒い手ぶくろ（ミトン）。(0,0) は手のひらのまん中
const mitten = () => {
  let k = '';
  for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) k += `<path d="M ${-125 + c * 50} ${-250 + r * 52} l 12 14 l 12 -14" fill="none" stroke="${SN.gloveLt}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<ellipse cx="-190" cy="-30" rx="58" ry="104" fill="${SN.glove}" transform="rotate(-24 -190 -30)"/>` +
    `<path d="M -160 -180 Q -160 -330 0 -330 Q 160 -330 160 -180 L 160 110 L -160 110 Z" fill="${SN.glove}"/><clipPath id="mtc"><path d="M -160 -180 Q -160 -330 0 -330 Q 160 -330 160 -180 L 160 110 L -160 110 Z"/></clipPath><g clip-path="url(#mtc)">${k}</g>` +
    `<rect x="-172" y="100" width="344" height="120" rx="26" fill="${SN.cuff}"/>${[-120, -60, 0, 60, 120].map(x => `<line x1="${x}" y1="116" x2="${x}" y2="204" stroke="#a84a38" stroke-width="8" stroke-linecap="round"/>`).join('')}`;
};

// 1. つかみ：水も氷もすきとおっているのに、つもった雪はまっしろ
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = winterBg('hkbg');
    out += `<ellipse cx="500" cy="760" rx="900" ry="200" fill="${SN.shade}"/><ellipse cx="1500" cy="740" rx="800" ry="170" fill="#eef5fa"/>`;
    out += snowTree(180, 640, 1.5) + snowTree(380, 610, 1.1) + snowHouse(1560, 640, 1.8) + snowTree(1810, 660, 1.3);
    out += `<ellipse cx="960" cy="1150" rx="1700" ry="520" fill="#fff"/>`;
    out += snowman(1150, 800, 1.0);
    out += snowfall(t, 46);
    // 水 → こおり（どちらも すきとおっている）
    const cardO = 1 - prog(t, c2 - 0.5, 0.4);
    if (cardO > 0) {
      let cd = card(900, 440);
      // うしろのしまもよう（すきとおって見える）
      cd += `<clipPath id="hkc"><rect x="-400" y="-170" width="800" height="270" rx="20"/></clipPath><g clip-path="url(#hkc)">${Array.from({ length: 20 }, (_, i) => `<rect x="${-400 + i * 40}" y="-170" width="40" height="270" fill="${i % 2 ? '#f6d9a8' : '#fbeed6'}"/>`).join('')}</g>`;
      // コップの水
      cd += `<path d="M -300 -120 L -140 -120 L -160 70 L -280 70 Z" fill="rgba(150,200,235,0.28)" stroke="${SN.iceLine}" stroke-width="7" stroke-linejoin="round"/><path d="M -294 -70 L -146 -70 L -160 70 L -280 70 Z" fill="rgba(120,185,230,0.35)"/><path d="M -294 -70 L -146 -70" stroke="#fff" stroke-width="5"/><path d="M -270 -100 L -262 30" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.8"/>`;
      // こおり
      const ik = prog(t, c0 + d0 * 0.5, 0.4);
      cd += arrow(-90, -20, 60, -20, C.muted, 14, eo(ik));
      cd += g(`<rect x="-90" y="-90" width="180" height="180" rx="22" fill="rgba(190,225,245,0.35)" stroke="${SN.iceLine}" stroke-width="7"/><path d="M -60 -50 L -20 -70 M -64 -14 L -40 -26" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M 30 60 L 62 30" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`, { x: 220, y: -20, o: ik, s: Math.max(back(ik), 0.001) });
      cd += text(-220, 150, 'みず', { size: 50, w: 900, fill: SN.iceDk }) + g(text(220, 150, 'こおり', { size: 50, w: 900, fill: SN.iceDk }), { o: ik });
      out += g(pop(cd, t, c0 + 0.1, 0, 0), { x: 620, y: 390, o: cardO });
      out += g(pop(badge('どちらも すきとおって いる', { fill: SN.iceDk, size: 46 }), t, c1 + d1 * 0.3, 620, 680), { o: cardO });
    }
    // まっしろ
    const wk = prog(t, c2 + d2 * 0.3, 0.4);
    if (wk > 0) {
      out += pop(olText(0, 0, 'まっしろ', { size: 110, sw: 18 }), t, c2 + d2 * 0.3, 660, 330, { end: cueE(4) + 0.7 });
      for (let i = 0; i < 9; i++) { const x = 300 + rnd(i, 41) * 1300, y = 720 + rnd(i, 42) * 110, tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7); out += `<path d="M ${x} ${y - 18} L ${x + 6} ${y - 6} L ${x + 18} ${y} L ${x + 6} ${y + 6} L ${x} ${y + 18} L ${x - 6} ${y + 6} L ${x - 18} ${y} L ${x - 6} ${y - 6} Z" fill="${SN.iceLine}" opacity="${wk * tw * 0.8}"/>`; }
    }
    out += kidShow('B', t, 300, 900, { s: 0.62, start: cue(3) - 0.9, n: 0, look: [8, -2] });
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 240);
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${SN.iceDk}">雪</tspan>は、どうして</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#fff" stroke="${SN.iceDk}" stroke-width="16" stroke-linejoin="round" paint-order="stroke">白い</tspan>の？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      [[-300, 0.9], [-100, 1.2], [110, 1.0], [300, 0.8]].forEach(([dx, s], i) => { out += pop(g(flake(0, 0, 54 * s, SN.iceLine, 9), { r: t * 20 * (i % 2 ? 1 : -1) }), t, t0 + 1.7 + i * 0.15, 960 + dx, 850); });
    }
    return out;
  },
});

// 2. 予想：雪が白く見えるのは、どうして？
const GUESS_ICON = [
  // つぶのすきまで、光がはねかえる
  () => `<rect x="-62" y="-52" width="124" height="104" rx="18" fill="${SN.navy}"/>` + grain(-28, -8, 24, 0.3, { sw: 3 }) + grain(26, 14, 24, 1, { sw: 3 }) + `<path d="M -50 -44 L -2 6 L -14 34 L 30 -18 L 52 -46" fill="none" stroke="${SN.ray}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  // 白い色（えのぐ）
  () => `<rect x="-52" y="-10" width="80" height="62" rx="10" fill="#cfd9e2" stroke="#8fa3b4" stroke-width="5"/><ellipse cx="-12" cy="-10" rx="40" ry="12" fill="#fff" stroke="#8fa3b4" stroke-width="5"/><rect x="18" y="-58" width="16" height="70" rx="6" fill="${C.ochre}" transform="rotate(28 26 -20)"/><path d="M -8 -12 Q 4 -30 22 -14" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>`,
  // くも
  () => `<g transform="translate(0 16) scale(0.48)"><ellipse cx="0" cy="0" rx="126" ry="50" fill="#8fa3b4"/><circle cx="-46" cy="-24" r="52" fill="#8fa3b4"/><circle cx="20" cy="-40" r="64" fill="#8fa3b4"/><circle cx="72" cy="-14" r="44" fill="#8fa3b4"/></g>` + cloud(0, 16, 0.44, '#fff', 1),
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(g(flake(0, 0, 44, SN.iceDk, 9), { x: -600 }) + text(40, 0, 'ゆきが しろく みえるのは、どうして？', { size: 60, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'つぶの すきまで、ひかりが はねかえる'], ['②', 'ゆきに、しろい いろが まざって いる'], ['③', 'くもの いろが うつって いる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }) + g(GUESS_ICON[i](), { x: 510, y: 0, s: 0.92 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
    });
    out += kidShow('B', t, 1730, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 360, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. ひとつぶは すきとおった氷。つもると、つぶのあいだは空気
// つぶがならんだ雪の中（こん色＝すきまの空気）。まん中 (0,0)、半径 R の丸の中
const PACK = (() => { const a = []; for (let r = -3; r <= 3; r++) for (let c = -3; c <= 3; c++) a.push([c * 128 + (r % 2 ? 64 : 0) + (rnd(r * 9 + c, 51) - 0.5) * 30, r * 112 + (rnd(r * 9 + c, 52) - 0.5) * 30, 40 + rnd(r * 9 + c, 53) * 14, rnd(r * 9 + c, 54) * 3]); return a; })();
const packView = (R, t = 0) => `<rect x="${-R}" y="${-R}" width="${2 * R}" height="${2 * R}" fill="${SN.navy}"/>` + PACK.map(([x, y, r, ro], i) => grain(x, y + Math.sin(t * 1.2 + i) * 2, r, ro)).join('');
SCENES.push({
  id: 'grain',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4;
    let out = PAPER + topBadge();
    // A：黒い手ぶくろの雪を、虫めがねで
    const aO = 1 - prog(t, c3 - 0.7, 0.4);
    if (aO > 0) {
      const MX = 380, MY = 520;
      let a = pop(g(mitten(), { s: 1.05 }), t, 0.2, MX, MY);
      const FL = [[-70, -200], [40, -240], [90, -120], [-30, -80], [-100, 0], [60, 20], [10, -160]];
      FL.forEach(([x, y], i) => { const k = prog(t, 0.6 + i * 0.25, 0.5); if (k > 0) a += grain(MX + x, MY + y - (1 - eo(k)) * 160, 16, i, { fo: 0.95, fill: '#fff', sw: 2, line: '#cfe0ee' }); });
      a += pop(badge('くろい てぶくろ', { fill: SN.glove, size: 42 }), t, c0 + d0 * 0.2, MX, 190);
      // 虫めがねが ひとつぶへ
      const lk = eio(prog(t, c0 + d0 * 0.45, 0.9)), gx = MX + 90, gy = MY - 120;
      a += g(lensIcon(), { x: lerp(760, gx, lk), y: lerp(760, gy, lk), s: 0.62, o: prog(t, c0 + d0 * 0.4, 0.3) });
      // 大きくして見ると
      const zk = prog(t, c0 + d0 * 0.85, 0.5);
      if (zk > 0) {
        const CX = 930, CY = 460, R = 255;
        let z = `<line x1="${gx + 40}" y1="${gy - 40}" x2="${CX - 150}" y2="${CY - R + 50}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/><line x1="${gx + 40}" y1="${gy + 44}" x2="${CX - 150}" y2="${CY + R - 50}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/>`;
        let knit = '';
        for (let r = -4; r <= 4; r++) for (let c = -4; c <= 4; c++) knit += `<path d="M ${c * 76 - 26} ${r * 70 - 14} l 26 30 l 26 -30" fill="none" stroke="${SN.gloveLt}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;
        z += `<clipPath id="gzc"><circle cx="0" cy="0" r="${R}"/></clipPath><g transform="translate(${CX} ${CY})"><g clip-path="url(#gzc)"><rect x="${-R}" y="${-R}" width="${2 * R}" height="${2 * R}" fill="${SN.glove}"/>${knit}${g(grain(0, 0, 170, 0.2 + Math.sin(t * 0.8) * 0.05, { fo: 0.3, sw: 8, line: '#a9d2ee' }) + `<path d="M -90 -40 L -30 -100 M -70 30 L -40 0" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.85"/>`, { y: Math.sin(t * 1.3) * 5 })}</g>` +
          `<circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="18"/><path d="M ${-R * 0.62} ${-R * 0.5} A ${R * 0.8} ${R * 0.8} 0 0 1 ${-R * 0.1} ${-R * 0.79}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.6"/></g>`;
        a += g(z, { o: zk });
        a += pop(badge('ひとつぶは、すきとおった こおり', { fill: SN.iceDk, size: 46 }), t, c1 + d1 * 0.3, 930, 790);
        a += pop(badge('うしろが すけて みえる', { fill: SN.glove, size: 38 }), t, c1 + d1 * 0.6, 1390, 190);
      }
      out += g(a, { o: aO });
      out += kidShow('K', t, 1700, 870, { s: 0.7, start: cue(2) - 0.9, n: 0, end: c3 - 0.5 });
    }
    // B：つもった雪。つぶとつぶのあいだは、すきま（空気）
    const bO = prog(t, c3 - 0.4, 0.5);
    if (bO > 0) {
      let b = `<clipPath id="mdc"><rect x="150" y="200" width="700" height="530" rx="36"/></clipPath><g clip-path="url(#mdc)"><rect x="150" y="200" width="700" height="530" fill="${SN.sky}"/><rect x="150" y="610" width="700" height="130" fill="#fff"/></g>` + mound(500, 630, 520, 290);
      b += g(text(500, 268, 'つもった ゆき', { size: 48, w: 900, fill: SN.navy }), { o: prog(t, c3, 0.3) });
      const CX = 1230, CY = 460, R = 262, ex = 560, ey = 500;
      b += `<circle cx="${ex}" cy="${ey}" r="30" fill="none" stroke="${C.blueUi}" stroke-width="8"/><line x1="${ex + 14}" y1="${ey - 28}" x2="${CX - 180}" y2="${CY - R + 66}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/><line x1="${ex + 14}" y1="${ey + 28}" x2="${CX - 180}" y2="${CY + R - 66}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/>`;
      b += `<clipPath id="pkc"><circle cx="0" cy="0" r="${R}"/></clipPath><g transform="translate(${CX} ${CY})"><g clip-path="url(#pkc)">${packView(R, t)}</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="18"/></g>`;
      b += pop(badge('つぶ（こおり）', { fill: SN.iceDk, size: 40 }), t, c3 + d3 * 0.25, 1690, 210) + pointer(1620, 246, CX + PACK[31][0] + 20, CY + PACK[31][1] - 10, SN.iceDk, prog(t, c3 + d3 * 0.25 + 0.2, 0.3));
      b += pop(badge('すきま ＝ くうき', { fill: SN.navy, size: 44 }), t, c3 + d3 * 0.55, 1700, 640) + pointer(1600, 604, CX + 64, CY + 56, '#fff', prog(t, c3 + d3 * 0.55 + 0.2, 0.3));
      b += pop(badge('ふったばかりの ゆきは、90〜95％が くうき', { fill: C.blueUi, size: 46 }), t, c4 + d4 * 0.35, 1000, 796);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 4. 光は、氷と空気のさかいめに当たるたびに向きを変えて、外へもどってくる
const RAYS = [
  [[430, 170], [560, 372], [500, 470], [640, 560], [600, 668], [760, 610], [820, 470], [770, 380], [900, 172]],
  [[720, 170], [990, 382], [1070, 500], [960, 610], [1100, 700], [1230, 596], [1180, 462], [1290, 372], [1400, 172]],
  [[1010, 170], [1350, 402], [1440, 520], [1390, 648], [1520, 566], [1560, 420], [1650, 172]],
];
// まがり角のそばに氷のつぶを置く。のこりはあいた所にしきつめる
const BGRAINS = (() => {
  const a = [];
  RAYS.forEach((R, k) => { for (let i = 1; i < R.length - 1; i++) { const dx = R[i + 1][0] - R[i - 1][0], dy = R[i + 1][1] - R[i - 1][1], n = Math.hypot(dx, dy), sd = (i % 2 ? 1 : -1); a.push([R[i][0] - dy / n * 50 * sd, R[i][1] + dx / n * 50 * sd, 46, rnd(k * 10 + i, 61) * 3]); } });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) { const x = 250 + c * 120 + (r % 2 ? 60 : 0), y = 388 + r * 98; if (a.every(([ax, ay]) => Math.hypot(ax - x, ay - y) > 98)) a.push([x, y, 40 + rnd(r * 20 + c, 62) * 8, rnd(r * 20 + c, 63) * 3]); }
  return a.filter(([x, y]) => x > 200 && x < 1720 && y > 366 && y < 790);
})();
function snowSection(t, { glow = 0 } = {}) {
  let o = `<clipPath id="bnc"><rect x="160" y="150" width="1600" height="672" rx="36"/></clipPath><g clip-path="url(#bnc)"><rect x="160" y="150" width="1600" height="180" fill="${SN.sky}"/><rect x="160" y="326" width="1600" height="500" fill="${SN.navy}"/>`;
  if (glow > 0) o += `<ellipse cx="960" cy="326" rx="760" ry="${110 * glow}" fill="#fff" opacity="${0.75 * glow}" filter="url(#glow)"/>`;
  BGRAINS.forEach(([x, y, r, ro]) => { o += grain(x, y, r, ro); });
  o += `<path d="M 160 330 ${Array.from({ length: 20 }, (_, i) => `q 20 ${i % 2 ? 10 : -12} 40 0 t 40 0`).join(' ')}" fill="none" stroke="#fff" stroke-width="10" opacity="0.9"/>`;
  return o + `</g>`;
}
SCENES.push({
  id: 'bounce',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    const gl = prog(t, c3, 0.8) * (0.8 + 0.2 * Math.sin(t * 3));
    let out = PAPER + snowSection(t, { glow: gl });
    out += sunDisc(250, 232, 46, 0, { glow: 0.8 });
    out += g(olText(210, 776, 'ゆきの なか', { size: 38, ol: SN.navy, anchor: 'start' }), { o: prog(t, 0.4, 0.4) });
    // 1本目：ゆっくり進む
    const f1 = prog(t, c0 + 0.3, cueE(1) - c0 - 0.6);
    out += ray(RAYS[0], f1);
    // 2・3本目
    out += ray(RAYS[1], prog(t, c2 + 0.1, d2 * 0.8)) + ray(RAYS[2], prog(t, c2 + 0.9, d2 * 0.75));
    out += pop(badge('こおり', { fill: SN.iceDk, size: 38 }), t, c1 + d1 * 0.15, 330, 560) + pointer(388, 560, BGRAINS[1][0] - 30, BGRAINS[1][1], SN.iceDk, prog(t, c1 + d1 * 0.15 + 0.2, 0.3));
    out += pop(badge('さかいめで、むきが かわる', { fill: SN.rayDk, size: 44 }), t, c1 + d1 * 0.4, 1240, 770, { end: c2 - 0.2 });
    out += pop(badge('あちこちへ ちらばって、そとへ もどる', { fill: SN.rayDk, size: 44 }), t, c2 + d2 * 0.45, 1180, 770, { end: c3 - 0.2 });
    // 外へ出た光
    [RAYS[0], RAYS[1], RAYS[2]].forEach((R, i) => { const e = R[R.length - 1], st = [cueE(1) - 0.3, c2 + 0.1 + d2 * 0.8, c2 + 0.9 + d2 * 0.75][i], k = prog(t, st, 0.4); if (k > 0) out += `<circle cx="${e[0]}" cy="${e[1] + 20}" r="${26 + 6 * Math.sin(t * 5 + i)}" fill="#fff" opacity="${0.9 * k}" filter="url(#soft)"/>`; });
    out += pop(olText(0, 0, 'あかるい！', { size: 76, ol: SN.rayDk }), t, c3 + d3 * 0.3, 1130, 232);
    out += topBadge();
    return out;
  },
});

// 5. 氷のかたまりは、すきまがないので、光が通りぬける
// うしろに置いた絵（赤い手ぶくろ）
const redMitt = (s = 1) => `<g transform="scale(${s})"><ellipse cx="-56" cy="-6" rx="20" ry="36" fill="#d2553f" transform="rotate(-24 -56 -6)"/><path d="M -48 -50 Q -48 -100 0 -100 Q 48 -100 48 -50 L 48 40 L -48 40 Z" fill="#d2553f"/><rect x="-52" y="36" width="104" height="36" rx="10" fill="#f6c530"/></g>`;
SCENES.push({
  id: 'block',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    const mv = eio(prog(t, c2 - 0.7, 0.8)), LX = lerp(960, 540, mv);
    // 左：氷のかたまり
    let a = `<rect x="-370" y="-300" width="740" height="600" rx="36" fill="${SN.sky}"/><rect x="-370" y="200" width="740" height="100" fill="#f4f9fc"/><rect x="-370" y="280" width="740" height="20" rx="10" fill="#f4f9fc"/>`;
    a += g(redMitt(1.5), { x: 0, y: 60 });
    a += `<path d="M -150 -90 L -90 -150 L 190 -150 L 190 150 L 130 210 L -150 210 Z" fill="rgba(215,238,250,0.42)" stroke="${SN.iceLine}" stroke-width="8" stroke-linejoin="round"/><path d="M -150 -90 L 130 -90 L 130 210 M 130 -90 L 190 -150" fill="none" stroke="${SN.iceLine}" stroke-width="7" stroke-linejoin="round" opacity="0.8"/><path d="M -120 -40 L -80 -70 M -124 10 L -100 -8" stroke="#fff" stroke-width="11" stroke-linecap="round"/>`;
    a += text(0, -246, 'こおりの かたまり', { size: 48, w: 900, fill: SN.navy });
    a += pop(badge('すきまが ない', { fill: SN.iceDk, size: 44 }), t, c0 + d0 * 0.45, 0, 250, { end: c1 + d1 * 0.4 });
    // 光がまっすぐ通りぬける
    const rk = prog(t, c1 + 0.2, 1.4), lp = ((t - c1) * 0.5) % 1;
    if (t > c1) {
      a += ray([[-300, -170], [300, 190]], rk, { w: 12, head: rk < 1 });
      if (rk >= 1) a += `<circle cx="${lerp(-300, 300, lp)}" cy="${lerp(-170, 190, lp)}" r="13" fill="#fff"/>`;
      a += pop(badge('とおりぬける → すきとおる', { fill: SN.rayDk, size: 42 }), t, c1 + d1 * 0.45, 0, 250);
    }
    out += g(a, { x: LX, y: 480 });
    // 右：雪
    const bk = prog(t, c2 - 0.2, 0.5);
    if (bk > 0) {
      let b = `<rect x="-370" y="-300" width="740" height="600" rx="36" fill="${SN.sky}"/><rect x="-370" y="200" width="740" height="100" fill="#f4f9fc"/><rect x="-370" y="280" width="740" height="20" rx="10" fill="#f4f9fc"/>`;
      b += g(redMitt(1.5), { x: 0, y: 60 });
      b += mound(0, 214, 480, 330);
      b += text(0, -246, 'ゆき', { size: 48, w: 900, fill: SN.navy });
      const R1 = [[-300, -170], [-60, -10], [-10, 60], [-90, 20], [-40, -40], [60, -250]], R2 = [[-250, -200], [40, -30], [90, 50], [20, 80], [100, -20], [250, -210]];
      const f = ((t - c2) * 0.32) % 1.25;
      b += ray(R1, clamp(f * 1.1), { w: 10 }) + ray(R2, clamp(f * 1.1 - 0.12), { w: 10 });
      b += pop(badge('さかいめが いっぱい', { fill: SN.iceDk, size: 44 }), t, c2 + d2 * 0.25, 0, 250, { end: c2 + d2 * 0.6 }) + pop(badge('ちらばって もどる → しろい', { fill: SN.rayDk, size: 42 }), t, c2 + d2 * 0.65, 0, 250);
      out += g(b, { x: 1380, y: 480, o: bk });
      out += pop(text(0, 0, 'おなじ みずから できて いても…', { size: 52, w: 900 }), t, c2 + 0.1, 1040, 130);
    }
    return out;
  },
});

// 6. どの色も同じだけもどるから、白
const whiteCard = (w, h, title, inner) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="30" fill="${SN.navy2}" filter="url(#shadow)"/>` + inner + text(0, h / 2 - 54, title, { size: 46, w: 900, fill: '#fff' });
SCENES.push({
  id: 'colors',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    let out = PAPER;
    const aO = 1 - prog(t, c3 - 0.7, 0.4);
    if (aO > 0) {
      // こん色の画面：上が外、下が雪
      let a = `<clipPath id="clc"><rect x="160" y="150" width="1600" height="672" rx="36"/></clipPath><g clip-path="url(#clc)"><rect x="160" y="150" width="1600" height="680" fill="${SN.navy}"/><rect x="160" y="560" width="1600" height="280" fill="#f6fafc"/>`;
      for (let i = 0; i < 26; i++) a += grain(190 + i * 62 + (i % 2) * 10, 606 + (i % 3) * 66 + rnd(i, 71) * 20, 26, rnd(i, 72) * 3, { fo: 0.5, sw: 3 });
      a += `<path d="M 160 560 ${Array.from({ length: 20 }, (_, i) => `q 20 ${i % 2 ? 9 : -11} 40 0 t 40 0`).join(' ')}" fill="none" stroke="#fff" stroke-width="12"/></g>`;
      a += olText(1700, 780, 'ゆき', { size: 44, ol: SN.navy, anchor: 'end' });
      // 太陽の光：白い玉 → 6色に分かれる
      const sp = eo(prog(t, c0 + d0 * 0.4, 0.9));
      const XS = LCOL.map((_, i) => 560 + i * 160);
      const TOPY = 290, drop = c1 + 0.3, back2 = c1 + d1 * 0.55, merge = c2 + d2 * 0.35;
      a += g(sunDisc(0, 0, 44, 0, { glow: 0.9 }), { x: 300, y: 250, o: prog(t, 0.3, 0.4) });
      const wO = prog(t, 0.6, 0.4) * (1 - sp);
      if (wO > 0) a += g(`<circle r="46" fill="#fff" opacity="0.5" filter="url(#soft)"/><circle r="30" fill="#fff"/>`, { x: lerp(300, 960, eo(prog(t, 0.6, c0 + d0 * 0.4 - 0.6))), y: lerp(250, TOPY, eo(prog(t, 0.6, c0 + d0 * 0.4 - 0.6))), o: wO });
      const mk = eio(prog(t, merge, 0.9));
      LCOL.forEach((col, i) => {
        if (sp <= 0) return;
        let x = lerp(960, XS[i], sp), y = TOPY;
        const st = drop + i * 0.12, dn = prog(t, st, 1.0), up = prog(t, back2 + i * 0.12, 1.1);
        if (dn > 0 && up <= 0) { y = lerp(TOPY, 690, eio(dn)); x += Math.sin(dn * Math.PI * 3) * 26 * (dn > 0.55 ? 1 : 0); }
        else if (up > 0) { y = lerp(690, TOPY, eio(up)); x += Math.sin(up * Math.PI * 3) * 26 * (up < 0.45 ? 1 : 0); }
        x = lerp(x, 960, mk); y = lerp(y, TOPY + 30, mk);
        a += g(ballG(0, 0, col, 24), { x, y, o: 1 - prog(t, merge + 0.6, 0.3) });
      });
      if (mk > 0.6) a += g(`<circle r="${120 + 10 * Math.sin(t * 4)}" fill="#fff" opacity="0.55" filter="url(#glow)"/><circle r="62" fill="#fff"/>`, { x: 960, y: TOPY + 30, o: prog(t, merge + 0.6, 0.3), s: Math.max(back(prog(t, merge + 0.6, 0.4)), 0.001) });
      a += pop(badge('たいようの ひかり ＝ いろいろな いろ', { fill: C.ochre, size: 42 }), t, c0 + d0 * 0.55, 960, 420, { end: c1 + 0.2 });
      a += pop(badge('どの いろも、おなじように ちらす', { fill: SN.iceDk, size: 44 }), t, c1 + d1 * 0.3, 960, 780, { end: c2 - 0.2 });
      a += pop(badge('ぜんぶ もどる', { fill: SN.iceDk, size: 44 }), t, c2 + 0.1, 960, 450, { end: merge + 0.5 });
      a += pop(badge('いろが かたよらない → しろ', { fill: C.ochre, size: 48, pad: 40 }), t, merge + 0.9, 960, 480);
      out += g(a, { o: aO }) + topBadge();
    }
    // 同じしくみ：しお・さとう・くも
    const bO = prog(t, c3 - 0.4, 0.5);
    if (bO > 0) {
      let b = topBadge() + pop(text(0, 0, 'おなじ しくみ', { size: 60, w: 900 }), t, c3 - 0.2, 960, 190);
      const salt = `<path d="M -60 -150 L 60 -150 L 76 -10 L -76 -10 Z" fill="rgba(215,238,250,0.35)" stroke="#cfe0ee" stroke-width="6" stroke-linejoin="round"/><rect x="-66" y="-186" width="132" height="42" rx="12" fill="#c9634e"/><path d="M -68 -70 L 68 -70 L 76 -10 L -76 -10 Z" fill="#fff"/><path d="M -150 40 Q -100 -20 -40 0 Q 20 -30 80 6 Q 130 10 150 40 Z" fill="#fff"/>`;
      const sugar = `<rect x="-120" y="-60" width="110" height="100" rx="12" fill="#fff"/><rect x="10" y="-60" width="110" height="100" rx="12" fill="#fff"/><rect x="-56" y="-166" width="110" height="100" rx="12" fill="#fff"/>` + [[-65, -10], [65, -10], [-1, -116]].map(([x, y]) => `<path d="M ${x - 30} ${y - 20} h 60 M ${x - 30} ${y + 4} h 60" stroke="${SN.shade}" stroke-width="6" stroke-linecap="round"/>`).join('');
      const cl = cloud(0, -40, 1.0, '#fff', 1);
      [[salt, 'しお'], [sugar, 'さとう'], [cl, 'くも']].forEach(([ic, nm], i) => { b += pop(whiteCard(440, 440, nm, g(ic, { y: 20 })), t, c3 + d3 * 0.1 + i * d3 * 0.22, 420 + i * 540, 500); });
      b += pop(badge('すきとおった つぶが あつまると、しろく みえる', { fill: SN.iceDk, size: 44 }), t, c3 + d3 * 0.8, 960, 796);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 7. 雪は、当たった光の色をそのまま返す。夕やけの雪山は赤い
SCENES.push({
  id: 'sunset',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1;
    const k = eio(prog(t, c1 - 0.8, 3.2));
    const snowC = mix('#ffffff', '#ff9a78', k * 0.8), shadeC = mix('#c9dcea', '#b0506e', k * 0.75), farC = mix('#e3eef6', '#e0788a', k * 0.7);
    let out = skyRect('ssk', k);
    const sy = lerp(250, 560, k);
    out += sunDisc(1560, sy, 70, k);
    // とおくの山と、大きな雪山
    out += `<path d="M -40 760 L 260 470 L 420 600 L 560 500 L 820 760 Z" fill="${farC}"/><path d="M 1240 780 L 1560 520 L 1700 640 L 1820 560 L 2000 780 Z" fill="${farC}"/>`;
    out += `<path d="M 300 820 L 760 300 L 880 400 L 1000 250 L 1560 820 Z" fill="${snowC}"/><path d="M 1000 250 L 1560 820 L 1060 820 L 1120 600 L 980 470 Z" fill="${shadeC}" opacity="0.9"/><path d="M 760 300 L 880 400 L 820 520 L 700 430 Z" fill="${shadeC}" opacity="0.55"/>`;
    out += `<ellipse cx="960" cy="1130" rx="1700" ry="400" fill="${snowC}"/><ellipse cx="400" cy="1160" rx="900" ry="380" fill="${shadeC}" opacity="0.35"/>`;
    // 光：当たった色のまま返る
    const lc = mix('#fff6c8', '#ff7a32', k), ak = prog(t, c0 + d0 * 0.5, 0.6), pl = 0.5 + 0.5 * Math.sin(t * 3);
    out += arrow(1500, sy + 20, 1130, 470, lc, 16, eo(ak), 0.95) + arrow(1090, 500, 760, 700 + pl * 6, lc, 16, eo(prog(t, c0 + d0 * 0.5 + 0.5, 0.6)), 0.95);
    out += pop(badge('ゆきは、じぶんの いろを もたない', { fill: SN.iceDk, size: 44 }), t, c0 + d0 * 0.15, 760, 190, { end: c1 - 0.4 });
    out += pop(badge('あたった ひかりの いろを、そのまま かえす', { fill: C.ochre, size: 44 }), t, c0 + d0 * 0.6, 1000, 786);
    out += pop(olText(0, 0, 'ひるは しろ', { size: 60 }), t, c0 + 0.5, 520, 330, { end: c1 - 0.4 });
    out += pop(olText(0, 0, 'ゆうやけは あか', { size: 60, ol: '#b0443a' }), t, c1 + d1 * 0.45, 520, 330);
    out += kidShow('S', t, 240, 900, { s: 0.62, start: cue(2) - 0.9, n: 0, look: [8, -6] });
    out += topBadge();
    return out;
  },
});

// 8. 深い雪のあなは青い。氷は赤い光をほんの少しずつ吸う
const HOLE = ['#f6efc2', '#f3ecae', '#d6e8a2', '#8fd6c0', '#3f9be6', '#1f6fd0', '#123a6e', '#0a2038'];
// 色ごとの「吸われやすさ」（赤がいちばん、青・むらさきはほとんど吸われない）
const ABS = [3.2, 2.1, 1.3, 0.6, 0.08, 0.04];
SCENES.push({
  id: 'blue',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    let out = '';
    const abO = 1 - prog(t, c3 - 0.7, 0.4);
    if (abO > 0) {
      const mv = eio(prog(t, c1 - 0.8, 0.9)), HX = lerp(960, 520, mv), TOP = 300, BOT = 830, HW = 70;
      let a = winterBg('blbg') + `<rect x="0" y="${TOP}" width="1920" height="800" fill="#fff"/><path d="M 0 ${TOP} ${Array.from({ length: 24 }, (_, i) => `q 20 ${i % 2 ? 8 : -10} 40 0 t 40 0`).join(' ')}" fill="none" stroke="${SN.shade2}" stroke-width="6"/>`;
      for (let i = 0; i < 30; i++) a += `<circle cx="${rnd(i, 81) * 1920}" cy="${TOP + 40 + rnd(i, 82) * 500}" r="${5 + rnd(i, 83) * 6}" fill="${SN.shade}"/>`;
      // あな（口は黄色っぽく、深くなるほど 黄緑 → 青緑 → 青 → 暗い）
      const dk = eo(prog(t, c0 + 0.3, d0 * 0.7));
      a += `<linearGradient id="hlg" x1="0" y1="0" x2="0" y2="1">${HOLE.map((c, i) => `<stop offset="${i / (HOLE.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
      a += `<clipPath id="hlc"><rect x="${HX - HW}" y="${TOP - 4}" width="${HW * 2}" height="${(BOT - TOP + 60) * dk}"/></clipPath><g clip-path="url(#hlc)"><path d="M ${HX - HW} ${TOP - 4} L ${HX + HW} ${TOP - 4} L ${HX + HW - 8} ${BOT + 40} L ${HX - HW + 8} ${BOT + 40} Z" fill="url(#hlg)" stroke="${SN.shade2}" stroke-width="5"/></g>`;
      a += `<ellipse cx="${HX}" cy="${TOP - 2}" rx="${HW + 6}" ry="13" fill="none" stroke="${SN.shade2}" stroke-width="6"/>`;
      // のぞく目
      a += g(eyeIcon(0.42), { x: HX, y: 200 + Math.sin(t * 2) * 5 }) + `<line x1="${HX}" y1="246" x2="${HX}" y2="${TOP - 20}" stroke="${C.muted}" stroke-width="5" stroke-dasharray="10 10"/>`;
      // 色の名前
      [['きいろっぽい', 340, '#8a7a2c'], ['きみどり', 450, '#5f8a2c'], ['あおみどり', 540, '#2a8a78'], ['あざやかな あお', 650, '#1f6fd0'], ['くらい', 780, '#123a6e']].forEach(([nm, y, col], i) => {
        const st = c0 + d0 * 0.2 + i * d0 * 0.15, o = prog(t, st, 0.3);
        a += g(text(HX - HW - 130, y, nm, { size: 40, w: 900, fill: col, anchor: 'end' }) + `<line x1="${HX - HW - 114}" y1="${y}" x2="${HX - HW - 14}" y2="${y}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`, { o });
      });
      a += pop(badge('ふかい ゆきの あな', { fill: SN.navy, size: 46 }), t, c0 + 0.2, lerp(1420, 520, mv), 190);
      // 右：氷の中を進む光。赤からへっていく
      const pO = prog(t, c1 - 0.2, 0.5);
      if (pO > 0) {
        const PX = 1060, PW = 720, PT = TOP - 70, PB = 750;
        let p = `<rect x="${PX}" y="${PT}" width="${PW}" height="${PB - PT}" rx="30" fill="${SN.navy}" filter="url(#shadow)"/>`;
        p += text(PX + PW / 2, PT + 52, 'ゆきの なかを すすむ ひかり', { size: 40, w: 900, fill: '#fff' });
        p += text(PX + 40, PT + 130, 'あさい', { size: 34, w: 900, fill: '#cfe0ee', anchor: 'start' }) + text(PX + 40, PB - 46, 'ふかい', { size: 34, w: 900, fill: '#cfe0ee', anchor: 'start' });
        p += arrow(PX + 92, PT + 170, PX + 92, PB - 90, '#8fa9c2', 9, 1, 0.9);
        LCOL.forEach((col, i) => {
          const x = PX + 200 + i * 86;
          p += `<line x1="${x}" y1="${PT + 110}" x2="${x}" y2="${PB - 40}" stroke="#30506f" stroke-width="4" stroke-dasharray="6 12"/>`;
          for (let j = 0; j < 4; j++) { const f = ((t * 0.17 + j / 4 + i * 0.07) % 1), y = lerp(PT + 110, PB - 40, f), o = Math.exp(-ABS[i] * f) * clamp(f * 8) * clamp((1 - f) * 8); p += g(ballG(0, 0, col, 20), { x, y, o }); }
        });
        p += pop(badge('あかは すこしずつ すいこまれる', { fill: '#b0443a', size: 38 }), t, c1 + d1 * 0.4, PX + PW / 2, 800, { end: c2 - 0.2 });
        p += pop(badge('ながく すすむほど、あおが のこる', { fill: '#1f6fd0', size: 40 }), t, c2 + d2 * 0.35, PX + PW / 2, 800);
        a += g(p, { o: pO });
      }
      out += g(a, { o: abO });
    }
    // 氷河のわれ目・氷山も青い
    const cO = prog(t, c3 - 0.4, 0.5);
    if (cO > 0) {
      let c = winterBg('glbg', '#8fc0e6', '#dceefa') + `<rect x="0" y="640" width="1920" height="440" fill="#3f86c0"/><path d="M 0 640 ${Array.from({ length: 24 }, (_, i) => `q 20 ${i % 2 ? 8 : -8} 40 0 t 40 0`).join(' ')}" fill="none" stroke="#bfe0f5" stroke-width="6"/>`;
      // 氷河（左）：白いかべに青いわれ目
      c += `<path d="M -20 660 L -20 300 L 200 250 L 420 290 L 620 250 L 820 310 L 860 660 Z" fill="#fff" stroke="${SN.shade2}" stroke-width="5"/>`;
      [[230, 264, 60, 380], [520, 276, 46, 330], [700, 290, 34, 260]].forEach(([x, y, w, h]) => { c += `<path d="M ${x - w} ${y} L ${x + w} ${y + 4} L ${x + 6} ${y + h} Z" fill="url(#crv)"/>`; });
      c = `<linearGradient id="crv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6f5"/><stop offset="0.45" stop-color="#3f9be6"/><stop offset="1" stop-color="#12508e"/></linearGradient>` + c;
      // 氷山（右）
      const by = Math.sin(t * 1.1) * 6;
      c += `<g transform="translate(0 ${by})"><path d="M 1120 650 L 1220 420 L 1340 480 L 1440 330 L 1600 520 L 1700 650 Z" fill="#fff" stroke="${SN.shade2}" stroke-width="5" stroke-linejoin="round"/><path d="M 1440 330 L 1600 520 L 1700 650 L 1500 650 L 1480 500 Z" fill="#8fd0f0"/><path d="M 1220 420 L 1340 480 L 1300 650 L 1200 650 Z" fill="#bfe6f5"/><path d="M 1100 650 L 1720 650 L 1640 800 L 1420 860 L 1200 790 Z" fill="#2f8fe0" opacity="0.7"/></g>`;
      c += pop(badge('ひょうがの われめ', { fill: '#1f6fd0', size: 44 }), t, c3 + d3 * 0.2, 440, 190) + pop(badge('ひょうざん', { fill: '#1f6fd0', size: 44 }), t, c3 + d3 * 0.5, 1420, 250);
      c += pop(badge('あつい こおりの なかを、ひかりが ながく とおる', { fill: SN.navy, size: 42 }), t, c3 + d3 * 0.65, 960, 790);
      out += g(c, { o: cO });
    }
    out += topBadge();
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.blueUi}"/>` + text(-530, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'つぶの すきまで、ひかりが はねかえる', { size: 48, w: 900, anchor: 'start' }) + g(GUESS_ICON[0](), { x: 540, y: 0, s: 1.0 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['ひとつぶは すきとおった こおり', SN.iceDk], ['すきまで ひかりが むきを かえる', SN.rayDk], ['どの いろも もどる → しろ', C.accent]], t, 960, 660, { start: 2.6, step: 1.4, size: 32, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const mitIc = g(mitten(), { s: 0.2, y: 12 }) + grain(8, -22, 9, 0, { fo: 1, fill: '#fff', sw: 2, line: '#cfe0ee' });
      const sunIc = `<circle r="30" fill="#ff8a4a"/><path d="M -48 30 L -10 -10 L 10 10 L 30 -16 L 52 30 Z" fill="#ffd3c0"/>`;
      const items = [
        [mitIc, 'くろい てぶくろで うけて、むしめがねで みる', C.ink],
        [sunIc, 'ゆうひの あたる ゆきは、なにいろ？', C.ink],
        [warnIcon(0.82), 'おとなと いっしょに。くるまの こない ばしょで', C.red],
        [warnIcon(0.82), 'ゆきは たべない。たいようは みない', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // 手ぶくろと雪のつぶ、虫めがね
      let p = card(400, 340) + g(mitten(), { s: 0.62, y: 30 });
      [[-40, -90], [30, -110], [50, -30], [-20, -20]].forEach(([x, y], i) => { p += grain(x, y, 11, i, { fo: 1, fill: '#fff', sw: 2, line: '#cfe0ee' }); });
      p += g(lensIcon(), { x: 60 + Math.sin(t * 1.2) * 14, y: -40 + Math.cos(t * 1.2) * 8, s: 0.5 });
      b += pop(p, t, cue(1) + 0.3, 1640, 350);
      b += kidShow('K', t, 1700, 830, { s: 0.8, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ゆきは どうして しろいの？」のページへ ／ 出典は 概要欄に', { size: 32, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

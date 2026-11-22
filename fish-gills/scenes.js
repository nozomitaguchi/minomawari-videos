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
const TOPIC = 'さかな';
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
// みのまわり図鑑「魚は、どうして 水の中で 息が できるの？」（もとの記事：everyday-trivia trivia/fish-gills.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 色の約束（図鑑の絵とそろえる）：みず＝みずいろ と あおい やじるし、さんそ＝きいろの まる、ち＝あか、きんぎょ＝オレンジ、マグロ＝こん色
const FC = {
  water: '#cfeaf5', water2: '#a9d8ee', deep: '#5fa8d0', wave: '#3f86c8', waveDk: '#2f6fa8', o2: '#f6c530', o2l: '#a8862a',
  blood: '#d2553f', bloodDk: '#8f3a2c', bloodBg: '#f8d9d2', gold: '#f29a4c', goldD: '#cf6f2c', line: '#8a4a1c',
  tuna: '#3f5f80', belly: '#e3e9ed', bone: '#f0e2b0', air: '#f4f8fb', sand: '#e9d6a8',
};

// ---------- さかなの道具 ----------
// きんぎょ（右向き。dir -1 で左向き）。(x, y) は体のまん中。m：口のひらきぐあい 0〜1、c：えらぶたのひらきぐあい 0〜1
//   peel：えらぶたをめくって、赤いくしのような えら を見せる 0〜1
function goldfish(x, y, s = 1, { dir = 1, m = 0, c = 0, wag = 0, peel = 0, ghost = false } = {}) {
  const body = 'M62 0Q56 -28 10 -32Q-36 -32 -58 0Q-36 32 10 32Q56 28 62 0Z', tail = 'M-54 0L-90 -28Q-80 0 -90 28Z';
  if (ghost) return `<g transform="translate(${x} ${y}) scale(${dir * s} ${s})" fill="rgba(255,255,255,0.5)" stroke="${FC.goldD}" stroke-width="2" stroke-dasharray="7 6"><path d="${tail}"/><path d="${body}"/></g>`;
  const mouth = m > 0.08 ? `<path d="M64 ${-7 * m}L${64 - 15 * m} 0L64 ${7 * m}Z" fill="#5b3a2a"/>` : `<path d="M62 1L54 2" stroke="#5b3a2a" stroke-width="2" stroke-linecap="round"/>`;
  const gap = c > 0.03 ? `<path d="M28 -24Q${20 - 9 * c} 0 28 24Q21 0 28 -24Z" fill="${FC.blood}"/>` : '';
  let comb = '';
  if (peel > 0.02) {
    comb = `<g opacity="${clamp(peel * 1.5)}"><path d="M31 -28Q-12 0 31 28Q25 0 31 -28Z" fill="#7a2a20"/>`;
    [27, 19].forEach(bx => {
      comb += `<path d="M${bx + 2} -21Q${bx - 8} 0 ${bx + 2} 21" fill="none" stroke="${FC.bone}" stroke-width="2.2" stroke-linecap="round"/>`;
      for (let i = 0; i < 9; i++) { const yy = -17 + i * 4.25, xx = bx + 2 - 5 * (1 - (yy / 21) * (yy / 21)); comb += `<path d="M${xx.toFixed(1)} ${yy}l-5.4 ${(yy * 0.03).toFixed(2)}" stroke="${FC.blood}" stroke-width="2" stroke-linecap="round"/>`; }
    });
    comb += `</g>`;
  }
  const cx = 28 + 2 * c + 6 * peel;
  const cover = `<path d="M${cx} -26Q${16 + 5 * c + 22 * peel} 0 ${cx + 1} 26" fill="none" stroke="${FC.goldD}" stroke-width="3" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y}) scale(${dir * s} ${s})">
    <g transform="rotate(${wag} -54 0)"><path d="${tail}" fill="${FC.goldD}" stroke="${FC.line}" stroke-width="1"/></g>
    <path d="M-12 -31Q-2 -50 22 -30Z" fill="${FC.goldD}"/><path d="M0 30Q8 44 18 30Z" fill="${FC.goldD}"/>
    <path d="${body}" fill="${FC.gold}" stroke="${FC.line}" stroke-width="1"/>
    <path d="M-30 14Q0 26 36 16" fill="none" stroke="#fbd3a6" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
    ${comb}${gap}${cover}
    <path d="M8 6Q-2 12 4 20" fill="none" stroke="${FC.goldD}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="44" cy="-9" r="6.5" fill="#fff"/><circle cx="45.5" cy="-9" r="3.2" fill="#2a2a2a"/>
    ${mouth}</g>`;
}
// マグロ（右向き）。口を少しあけている
const tunaFish = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-64 0L-92 -30Q-84 0 -92 30Z" fill="${FC.tuna}"/>
  <path d="M-20 -26L-6 -46L6 -26Z" fill="${FC.tuna}"/><path d="M-26 22L-14 38L-4 22Z" fill="${FC.tuna}"/>
  ${[-50, -42, -34].map(px => `<path d="M${px} -12l4 -6l3 6Z M${px} 12l4 6l3 -6Z" fill="${FC.o2}"/>`).join('')}
  <path d="M70 0Q60 -26 10 -28Q-40 -26 -66 0Q-40 26 10 28Q60 26 70 0Z" fill="${FC.belly}"/>
  <path d="M70 0Q60 -26 10 -28Q-40 -26 -66 0Q-20 -6 70 0Z" fill="${FC.tuna}"/>
  <path d="M70 0Q60 -26 10 -28Q-40 -26 -66 0Q-40 26 10 28Q60 26 70 0Z" fill="none" stroke="#2c4560" stroke-width="1"/>
  <path d="M34 -22Q24 0 34 22" fill="none" stroke="#2c4560" stroke-width="2.5"/>
  <path d="M72 -4L58 0L72 5Z" fill="#33322e"/>
  <circle cx="52" cy="-8" r="5" fill="#fff"/><circle cx="53" cy="-8" r="2.6" fill="#2a2a2a"/></g>`;
// さんそ（きいろの まる）
const o2dot = (x, y, r = 14, o = 1) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${FC.o2}" stroke="${FC.o2l}" stroke-width="${Math.max(1.5, r * 0.16)}" opacity="${o}"/>`;
// あかい ちの つぶ
const rbc = (x, y, r = 24, o = 1) => `<g opacity="${o}"><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r}" ry="${r * 0.62}" fill="${FC.blood}"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r * 0.45}" ry="${r * 0.25}" fill="#a84a38"/></g>`;
// 矢印（k：0〜1 でのびる）
function arrow(x1, y1, x2, y2, col, w = 14, k = 1, o = 1) {
  if (k <= 0.02 || o <= 0.01) return '';
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = w * 2.4;
  const bx = ex - Math.cos(a) * hd, by = ey - Math.sin(a) * hd, nx = -Math.sin(a) * hd * 0.75, ny = Math.cos(a) * hd * 0.75;
  return `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${ex} ${ey} L ${bx + nx} ${by + ny} L ${bx - nx} ${by - ny} Z" fill="${col}" stroke="${col}" stroke-width="${w * 0.3}" stroke-linejoin="round"/></g>`;
}
// 白いふちの字
const olText = (x, y, str, { size = 44, fill = '#fff', ol = '#1e4a6a', sw = 10, anchor = 'middle' } = {}) =>
  text(x, y, str, { size, w: 900, fill, anchor, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;
// 口のぱくぱく：口がひらく（m）→ とじて、えらぶたがひらく（c）のかわりばんこ
function paku(t, T = 1.6) { const a = Math.sin(2 * Math.PI * t / T); return { m: Math.max(0, a), c: Math.max(0, -a) }; }
// 水の流れのつぶ（短い線。(x1,y1) → (x2,y2) へ進む）
function streaks(x1, y1, x2, y2, t, { n = 4, o = 1, w = 9, len = 44, col = FC.wave, speed = 0.9, spread = 0, seed = 0 } = {}) {
  if (o <= 0.01) return '';
  let out = '';
  const a = Math.atan2(y2 - y1, x2 - x1), dx = Math.cos(a), dy = Math.sin(a);
  for (let i = 0; i < n; i++) {
    const f = (((t * speed + i / n + seed * 0.37) % 1) + 1) % 1, off = (rnd(i, 80 + seed) - 0.5) * spread;
    const x = lerp(x1, x2, f) - dy * off, y = lerp(y1, y2, f) + dx * off;
    out += `<line x1="${(x - dx * len).toFixed(1)}" y1="${(y - dy * len).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${(o * Math.sin(f * Math.PI)).toFixed(3)}"/>`;
  }
  return out;
}
// ぱくぱくする きんぎょ と、口から入って えらぶたのすきまから出る水（右向き）
function flowFish(x, y, s, t, { T = 1.6, inLen = 420, outLen = 500, o = 1, wave = true } = {}) {
  const { m, c } = paku(t, T), mx = x + 64 * s, gx = x + 20 * s;
  let out = '';
  if (wave) out += streaks(mx + inLen, y, mx + 6, y, t, { n: 4, o: o * clamp(m * 1.6), spread: 22 * s * 0.4, len: 9 * s });
  out += goldfish(x, y, s, { m, c, wag: Math.sin(t * 4) * 8 });
  if (wave) {
    out += streaks(gx, y - 6 * s, gx - outLen, y - 36 * s, t, { n: 3, o: o * clamp(c * 1.6), len: 9 * s, seed: 1 });
    out += streaks(gx, y + 6 * s, gx - outLen, y + 36 * s, t, { n: 3, o: o * clamp(c * 1.6), len: 9 * s, seed: 2 });
  }
  return out;
}
// 水の背景
const waterBg = (id, top = FC.water, bot = FC.water2) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect width="1920" height="1080" fill="url(#${id})"/>`;
const weed = (x, y, h, t, col = '#5aa86a', seed = 0) => { const sw = Math.sin(t * 1.3 + seed) * 16; return `<path d="M ${x} ${y} Q ${x - 24 + sw * 0.4} ${y - h * 0.5} ${x + sw} ${y - h}" fill="none" stroke="${col}" stroke-width="16" stroke-linecap="round"/>`; };

// 1. つかみ：金魚はずっと水の中。口をぱくぱく
const TANK = { x: 720, y: 190, w: 1080, h: 610 };
function tank(t) {
  const { x, y, w, h } = TANK;
  let o = `<rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 32}" rx="28" fill="#e6f2f6" stroke="#9fb8c4" stroke-width="8"/>`;
  o += `<clipPath id="tkc"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath><g clip-path="url(#tkc)">`;
  o += `<rect x="${x}" y="${y + 46}" width="${w}" height="${h}" fill="${FC.water}"/><rect x="${x}" y="${y + h * 0.55}" width="${w}" height="${h}" fill="${FC.water2}" opacity="0.5"/>`;
  o += `<path d="M ${x} ${y + 46} ${Array.from({ length: 14 }, (_, i) => `q 20 ${i % 2 ? 8 : -8} 40 0 t 40 0`).join(' ')}" fill="none" stroke="#fff" stroke-width="6" opacity="0.8" transform="translate(${Math.sin(t * 1.2) * 10} 0)"/>`;
  o += weed(x + 110, y + h - 30, 250, t, '#5aa86a', 1) + weed(x + 160, y + h - 30, 170, t, '#6fba78', 2) + weed(x + w - 120, y + h - 30, 290, t, '#5aa86a', 3) + weed(x + w - 70, y + h - 30, 180, t, '#6fba78', 4);
  o += `<rect x="${x}" y="${y + h - 56}" width="${w}" height="60" fill="${FC.sand}"/>`;
  for (let i = 0; i < 16; i++) o += `<ellipse cx="${x + 40 + i * 66 + rnd(i, 91) * 30}" cy="${y + h - 44 + rnd(i, 92) * 22}" rx="${12 + rnd(i, 93) * 10}" ry="9" fill="${['#cdb88a', '#b9a47a', '#d9c79c'][i % 3]}"/>`;
  return o + `</g>`;
}
SCENES.push({
  id: 'hook',
  draw(t) {
    const c1 = cue(1), d1 = cueE(1) - c1;
    let out = `<rect width="1920" height="1080" fill="#f6efe0"/><rect x="0" y="830" width="1920" height="250" fill="#c9a77a"/><rect x="0" y="830" width="1920" height="16" fill="#b08a5c"/>`;
    out += `<rect x="640" y="816" width="1240" height="40" rx="12" fill="#8a6a4a"/>`;
    out += tank(t);
    // 金魚（子どもたちのほうを向いて、口をぱくぱく）
    const FX = 1270, FY = 500 + Math.sin(t * 1.3) * 10, S = 4.2, { m, c } = paku(t, 1.5);
    out += goldfish(FX, FY, S, { dir: -1, m, c, wag: Math.sin(t * 3.4) * 9 });
    // 口のぱくぱく
    const pk = prog(t, c1 + d1 * 0.3, 0.4);
    if (pk > 0) {
      const mx = FX - 64 * S, pr = 70 + m * 12;
      out += g(`<circle r="${pr}" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="18 14" opacity="0.9"/>`, { x: mx, y: FY, o: pk, r: t * 40 });
      out += g(olText(0, 0, 'ぱく', { size: 62, fill: '#fff', ol: FC.waveDk, sw: 12 }), { x: mx - 60, y: FY - 130, o: pk * (0.5 + 0.5 * m), s: 1 + m * 0.08 });
      out += g(olText(0, 0, 'ぱく', { size: 62, fill: '#fff', ol: FC.waveDk, sw: 12 }), { x: mx + 70, y: FY - 190, o: pk * (0.5 + 0.5 * c), s: 1 + c * 0.08 });
    }
    // 子どもたち（水そうを見る）
    const eyes = t > c1 ? 'wide' : 'open';
    out += kidShow('S', t, 230, 890, { s: 0.5, start: 0, n: 0, eyes, look: [8, -3] });
    out += kidShow('B', t, 430, 890, { s: 0.5, start: 0, n: 1, eyes, look: [8, -2], bubble: false });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 240);
      out += g(`<text x="0" y="0" font-size="140" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${FC.goldD}">魚</tspan>は、どうして</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${FC.wave}">水の中</tspan>で 息が できるの？</text>`, { x: 960, y: 620, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(flowFish(0, 0, 2.6, t, { wave: false }), t, t0 + 1.8, 960, 850);
    }
    return out;
  },
});

// 2. 予想：口のぱくぱくは、何をしている？
const GUESS_ICON = [
  // えさ（おなかがすいた）
  `<path d="M -46 -6 Q 0 -30 46 -6 L 36 34 Q 0 46 -36 34 Z" fill="#e9d6a8" stroke="#b9a47a" stroke-width="5" stroke-linejoin="round"/><circle cx="-16" cy="2" r="7" fill="#b0703a"/><circle cx="6" cy="-6" r="7" fill="#c9843e"/><circle cx="20" cy="8" r="7" fill="#b0703a"/><circle cx="-2" cy="14" r="6" fill="#c9843e"/>`,
  // 水の流れ
  `<path d="M -52 -16 q 18 -16 36 0 t 36 0" fill="none" stroke="${FC.wave}" stroke-width="10" stroke-linecap="round"/><path d="M -52 16 q 18 -16 36 0 t 36 0" fill="none" stroke="${FC.wave}" stroke-width="10" stroke-linecap="round"/><path d="M 30 -34 L 56 0 L 30 34" fill="none" stroke="${FC.wave}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  // あわ
  `<circle cx="-22" cy="20" r="22" fill="#eaf6fb" stroke="${FC.wave}" stroke-width="6"/><circle cx="20" cy="-6" r="16" fill="#eaf6fb" stroke="${FC.wave}" stroke-width="6"/><circle cx="-6" cy="-34" r="10" fill="#eaf6fb" stroke="${FC.wave}" stroke-width="5"/>`,
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    const { m, c } = paku(t, 1.4);
    out += pop(goldfish(-600, 0, 1.5, { m, c }) + text(70, 0, 'くちの ぱくぱく、なにを して いる？', { size: 60, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'おなかが すいた あいず'], ['②', 'えらに みずを とおして いきを する'], ['③', 'あわを つくって いる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }) + g(GUESS_ICON[i], { x: 510, y: 0, s: 0.92 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
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

// 3. 水の中のさんそは、空気よりずっと少ない
function gasBox(w, h, fill, n, t, seed, { stroke = '#8fb3c6', r = 13 } = {}) {
  // まん中 (0,0) の箱に、さんそのつぶを n こ
  let o = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="22" fill="${fill}" stroke="${stroke}" stroke-width="8"/>`;
  const cols = Math.ceil(Math.sqrt(n * w / h)), rows = Math.ceil(n / cols);
  for (let i = 0; i < n; i++) {
    const cx = n === 1 ? 0 : -w / 2 + w * ((i % cols) + 0.5) / cols, cy = n === 1 ? 0 : -h / 2 + h * (Math.floor(i / cols) + 0.5) / rows;
    o += o2dot(cx + Math.sin(t * 1.7 + i * 2.1 + seed) * 9, cy + Math.cos(t * 1.4 + i * 1.3 + seed) * 9, r);
  }
  return o;
}
SCENES.push({
  id: 'oxygen',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3);
    let out = PAPER + topBadge();
    // A：水の中にも、さんそがとけている
    const aO = 1 - prog(t, c1 - 0.5, 0.4);
    if (aO > 0) {
      let a = `<rect x="-640" y="-230" width="1280" height="460" rx="30" fill="${FC.water}" stroke="#8fb3c6" stroke-width="8"/>`;
      a += `<path d="M -640 -150 ${Array.from({ length: 16 }, (_, i) => `q 20 ${i % 2 ? 8 : -8} 40 0 t 40 0`).join(' ')}" fill="none" stroke="#fff" stroke-width="6" opacity="0.8"/>`;
      const P = [[-460, 40], [-180, -40], [90, 110], [330, -10], [520, 90]];
      P.forEach(([x, y], i) => { a += g(o2dot(0, 0, 24), { x: x + Math.sin(t * 1.1 + i) * 18, y: y + Math.cos(t * 0.9 + i * 2) * 14, s: Math.max(back(prog(t, c0 + d0 * 0.35 + i * 0.18, 0.4)), 0.001) }); });
      a += goldfish(-300, 120 + Math.sin(t * 1.3) * 8, 1.7, { ...paku(t, 1.5), wag: Math.sin(t * 3.4) * 9 });
      out += g(pop(a, t, 0.2, 0, 0) + g(text(0, -300, 'みず', { size: 60, w: 900, fill: FC.waveDk }), { o: prog(t, 0.5, 0.3) }) +
        pop(badge('さんそ', { fill: '#b8862a', size: 46 }), t, c0 + d0 * 0.45, 500, -140) + pointer(440, -100, 348, -34, '#b8862a', prog(t, c0 + d0 * 0.45 + 0.3, 0.3)), { x: 960, y: 500, o: aO });
      out += g(pop(badge('みずの なかにも、さんそが とけて いる', { fill: FC.waveDk, size: 42 }), t, c0 + d0 * 0.6, 960, 800), { o: aO });
    }
    // B：同じ大きさの箱でくらべる（空気 40 こ、水 1 こ）
    const bO = prog(t, c1 - 0.3, 0.5) * (1 - prog(t, c2 - 0.5, 0.4));
    if (bO > 0) {
      let b = pop(gasBox(400, 400, FC.air, 40, t, 1), t, c1 - 0.2, 540, 450) + pop(gasBox(400, 400, FC.water, 1, t, 2), t, c1, 1380, 450);
      b += g(text(540, 200, 'くうき', { size: 58, w: 900 }) + text(1380, 200, 'みず', { size: 58, w: 900, fill: FC.waveDk }), { o: prog(t, c1, 0.3) });
      b += g(text(960, 420, 'おなじ', { size: 40, w: 900, fill: C.muted }) + text(960, 474, 'おおきさ', { size: 40, w: 900, fill: C.muted }), { o: prog(t, c1 + 0.3, 0.3) });
      b += pop(badge('さんそ 40こ', { fill: '#b8862a', size: 44 }), t, c1 + d1 * 0.4, 540, 710) + pop(badge('さんそ 1こ', { fill: '#b8862a', size: 44 }), t, c1 + d1 * 0.6, 1380, 710);
      b += g(text(960, 800, '30℃の みずの ばあい（くうきの 40ぶんの1 ほど）', { size: 34, w: 700, fill: C.muted }), { o: prog(t, c1 + d1 * 0.7, 0.4) });
      out += g(b, { o: bO });
    }
    // C：同じだけのさんそを取るには、およそ30倍の水
    const cO = prog(t, c2 - 0.3, 0.5) * (1 - prog(t, c3 - 0.5, 0.4));
    if (cO > 0) {
      let c = pop(text(0, 0, 'おなじ だけの さんそを とるには…', { size: 56, w: 900 }), t, c2 - 0.2, 1000, 190);
      c += pop(`<rect x="-100" y="-100" width="200" height="200" rx="20" fill="${FC.air}" stroke="#8fb3c6" stroke-width="8"/>`, t, c2, 300, 470) + g(text(300, 630, 'くうき 1ぱい', { size: 44, w: 900 }), { o: prog(t, c2 + 0.3, 0.3) });
      c += g(text(520, 470, '＝', { size: 90, w: 900, fill: C.muted }), { o: prog(t, c2 + d2 * 0.3, 0.3) });
      for (let i = 0; i < 30; i++) {
        const x = 688 + (i % 10) * 112, y = 358 + Math.floor(i / 10) * 112;
        c += pop(`<rect x="-46" y="-46" width="92" height="92" rx="12" fill="${FC.water}" stroke="${FC.wave}" stroke-width="6"/>`, t, c2 + d2 * 0.35 + i * 0.07, x, y, { d: 0.3 });
      }
      c += pop(badge('みず およそ 30ぱい', { fill: FC.waveDk, size: 48 }), t, c2 + d2 * 0.35 + 2.3, 1192, 700);
      out += g(c, { o: cO });
    }
    // D：だから、たくさんの水をえらに通しつづける
    const dO = prog(t, c3 - 0.3, 0.5);
    if (dO > 0) {
      let d = `<rect x="140" y="170" width="1640" height="640" rx="36" fill="${FC.water}"/>`;
      d += streaks(1740, 330, 200, 330, t, { n: 5, o: 0.5, len: 60, speed: 0.5, col: '#8fc7e0', spread: 60, seed: 5 }) + streaks(1740, 660, 200, 660, t, { n: 5, o: 0.5, len: 60, speed: 0.5, col: '#8fc7e0', spread: 60, seed: 6 });
      d += flowFish(900, 530, 5, t, { inLen: 470, outLen: 560 });
      d += pop(badge('たくさんの みずを、えらに とおしつづける', { fill: FC.waveDk, size: 44 }), t, c3 + 0.6, 960, 226);
      out += g(d, { o: dO });
    }
    return out;
  },
});

// 4. 口から入って、えらぶたから出る一方通行
SCENES.push({
  id: 'oneway',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = PAPER;
    // A：人は、同じ口や鼻から、すって、はく
    const aO = 1 - prog(t, c1 - 0.5, 0.4);
    if (aO > 0) {
      let a = pop(badge('ひと', { fill: C.accent, size: 50, pad: 44 }), t, 0.3, 660, 200);
      const ph = Math.sin((t - c0) * 2.4), inn = clamp(ph * 2), outt = clamp(-ph * 2), on = prog(t, c0 + d0 * 0.3, 0.4);
      a += arrow(1190, 560, 800, 560, FC.wave, 22, 1, on * (0.25 + 0.75 * inn)) + g(text(1000, 500, 'すう', { size: 56, w: 900, fill: FC.waveDk }), { o: on * (0.3 + 0.7 * inn) });
      a += arrow(800, 650, 1190, 650, '#e08a3c', 22, 1, on * (0.25 + 0.75 * outt)) + g(text(1000, 716, 'はく', { size: 56, w: 900, fill: '#c8602c' }), { o: on * (0.3 + 0.7 * outt) });
      a += pop(badge('おなじ くちや はなから', { fill: C.blueUi, size: 46 }), t, c0 + d0 * 0.45, 1230, 330);
      out += g(a, { o: aO });
      out += kidShow('S', t, 640, 850, { s: 0.86, start: 0.1, n: 0, bubble: false, look: [8, 0], end: c1 - 0.3 });
    }
    // B：魚の水は、口から入って、えらぶたのすきまから出る
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      const slow = prog(t, c3 - 0.5, 0.5), T = lerp(1.6, 2.6, slow);
      const FX = 1100, FY = 470, S = 4.8, { m, c } = paku(t, T);
      let b = waterBg('owbg') + streaks(1880, 250, 60, 250, t, { n: 5, o: 0.45, len: 60, speed: 0.4, col: '#8fc7e0', spread: 50, seed: 7 }) + streaks(1880, 690, 60, 690, t, { n: 5, o: 0.45, len: 60, speed: 0.4, col: '#8fc7e0', spread: 50, seed: 8 });
      b += flowFish(FX, FY, S, t, { T, inLen: 430, outLen: 520 });
      b += pop(olText(0, 0, 'くちから はいって、えらぶたの すきまから でる', { size: 50 }), t, c1 + d1 * 0.25, 960, 140);
      b += pop(badge('くち', { fill: FC.waveDk, size: 44 }), t, c1 + d1 * 0.3, 1560, 330) + pointer(1530, 366, FX + 64 * S + 4, FY - 14, FC.waveDk, prog(t, c1 + d1 * 0.3 + 0.2, 0.3));
      b += pop(badge('えらぶた', { fill: '#b85a2a', size: 44 }), t, c1 + d1 * 0.6, 1380, 250) + pointer(1340, 286, FX + 30 * S, FY - 80, '#b85a2a', prog(t, c1 + d1 * 0.6 + 0.2, 0.3));
      b += pop(badge('いっぽうつうこう', { fill: C.blueUi, size: 54, pad: 44 }), t, c2 + 0.2, 440, 270);
      // かわりばんこ
      const s1 = prog(t, c3, 0.4), s2 = prog(t, c3 + 0.9, 0.4);
      b += g(badge('① くちが ひらく → みずが はいる', { fill: FC.waveDk, size: 36 }), { x: 1340, y: 730, o: s1 * (0.4 + 0.6 * clamp(m * 2)), s: 1 + 0.04 * clamp(m * 2) });
      b += g(badge('② くちが とじる → えらぶたが ひらく', { fill: '#b85a2a', size: 36 }), { x: 1340, y: 806, o: s2 * (0.4 + 0.6 * clamp(c * 2)), s: 1 + 0.04 * clamp(c * 2) });
      b += topBadge();
      out += g(b, { o: bO });
      out += kidShow('B', t, 200, 850, { s: 0.5, start: cue(5) - 0.9, n: 1, bubble: false, look: [8, -6] });
      out += talkBubble('B', 560, 690, 252, 712, 46);
    } else out += topBadge();
    return out;
  },
});

// 5. えらの3段ズーム：赤いくし → 小さなひだ → うすいかべ
// ひだ（さいはくばん）がぎっしりならんだところ。まん中 (0,0)、半径 R の丸の中
function lamellaeView(t, R, stick = 0, bg = FC.water) {
  let o = `<rect x="${-R}" y="${-R}" width="${2 * R}" height="${2 * R}" fill="${bg}"/>`;
  o += `<rect x="${-R}" y="-28" width="${2 * R}" height="56" fill="#ee9f8a"/><rect x="${-R}" y="-8" width="${2 * R}" height="16" fill="#e2826e"/>`;
  for (let i = -8; i <= 8; i++) {
    const x = i * 34 + Math.sin(t * 1.4 + i) * 2;
    [-1, 1].forEach(sd => {
      const lean = stick * (i % 2 ? 1 : -1) * 13;
      o += `<g transform="translate(${x} ${sd * 26}) rotate(${sd * lean})"><rect x="-10" y="${sd > 0 ? 0 : -176}" width="20" height="176" rx="10" fill="${FC.blood}"/><rect x="-3" y="${sd > 0 ? 10 : -166}" width="6" height="150" rx="3" fill="#e88a78"/></g>`;
    });
  }
  return o;
}
// うすいかべ：上を水が右へ、下を血が左へ。さんそがかべを通って血に入る
function wallView(t, R, cross = 1) {
  let o = `<rect x="${-R}" y="${-R}" width="${2 * R}" height="${R - 30}" fill="${FC.water}"/>`;
  o += streaks(-R, -190, R, -190, t, { n: 4, o: 0.7, len: 46, speed: 0.5, col: '#8fc7e0', spread: 40, seed: 11 }) + streaks(-R, -90, R, -90, t, { n: 4, o: 0.7, len: 46, speed: 0.5, col: '#8fc7e0', spread: 40, seed: 12 });
  o += `<rect x="${-R}" y="-16" width="${2 * R}" height="${R}" fill="${FC.bloodBg}"/><rect x="${-R}" y="150" width="${2 * R}" height="${R}" fill="#ee9f8a"/>`;
  o += `<rect x="${-R}" y="-30" width="${2 * R}" height="16" fill="#f0d2a8" stroke="#c9a06a" stroke-width="3"/>`;
  // 血のつぶ（左へ）
  for (let i = 0; i < 6; i++) { const f = (((t * 0.16 + i / 6) % 1) + 1) % 1; o += rbc(lerp(R + 40, -R - 40, f), 44 + (i % 2) * 58, 30); }
  // さんそ（水の中を右へ → かべを通る → 血といっしょに左へ）
  for (let i = 0; i < 9; i++) {
    const f = (((t * 0.14 + i / 9) % 1) + 1) % 1, xc = -170 + rnd(i, 95) * 380, y0 = -200 + rnd(i, 96) * 130, y1 = 40 + rnd(i, 97) * 70;
    let x, y;
    if (f < 0.4) { x = lerp(-R - 30, xc, f / 0.4); y = y0; }
    else if (f < 0.56) { const k = eio((f - 0.4) / 0.16); x = xc; y = lerp(y0, y1, k); }
    else { x = lerp(xc, -R - 30, (f - 0.56) / 0.44); y = y1; }
    if (cross < 1 && f >= 0.4) continue;
    o += o2dot(x, y, 16);
  }
  return o;
}
SCENES.push({
  id: 'gill',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c4 = cue(4), d4 = cueE(4) - c4, c5 = cue(5);
    let out = waterBg('glbg') + topBadge();
    const mv = eio(prog(t, c1 - 0.6, 0.8));
    const FX = lerp(960, 430, mv), FY = lerp(470, 470, mv), S = lerp(6.6, 3.6, mv);
    const peel = eo(prog(t, c0 + d0 * 0.25, 0.9));
    out += goldfish(FX, FY, S, { peel, wag: Math.sin(t * 3) * 6 });
    const gx = FX + 16 * S, gy = FY;
    out += pop(badge('えらぶたを めくると…', { fill: '#b85a2a', size: 44 }), t, c0 + 0.3, 960, 150, { end: c1 - 0.5 });
    out += g(pop(badge('えら', { fill: '#a83a2c', size: 54, pad: 44 }), t, c0 + d0 * 0.45, 0, 0) + g(olText(lerp(340, 0, mv), lerp(4, 84, mv), 'あかい くし みたい', { size: 40, ol: '#7a2a20' }), { o: 1 - clamp(Math.sin(mv * Math.PI) * 3) }), { x: lerp(1230, 430, mv), y: lerp(772, 720, mv), o: prog(t, c0 + d0 * 0.45, 0.3) });
    out += pointer(lerp(1200, 430, mv), lerp(728, 690, mv), gx, gy + lerp(24, 26, mv) * S, '#a83a2c', prog(t, c0 + d0 * 0.45 + 0.2, 0.3));
    // ルーペで1本に寄る
    const zk = prog(t, c1 - 0.2, 0.5);
    if (zk > 0) {
      const CX = 1100, CY = 450, R = 290;
      const wall = prog(t, c4 - 0.4, 0.6);
      let z = `<line x1="${gx}" y1="${gy - 20}" x2="${CX - 150}" y2="${CY - R + 40}" stroke="#fff" stroke-width="6" stroke-dasharray="14 12"/><line x1="${gx}" y1="${gy + 20}" x2="${CX - 150}" y2="${CY + R - 40}" stroke="#fff" stroke-width="6" stroke-dasharray="14 12"/>`;
      z += `<clipPath id="glc"><circle cx="0" cy="0" r="${R}"/></clipPath><g transform="translate(${CX} ${CY})"><g clip-path="url(#glc)">`;
      if (wall < 1) z += lamellaeView(t, R);
      if (wall > 0) z += `<g opacity="${wall}">${wallView(t, R, prog(t, c4 + d4 * 0.5, 0.3) >= 1 || t > c5 ? 1 : 1)}</g>`;
      z += `</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="18"/><path d="M ${-R * 0.62} ${-R * 0.5} A ${R * 0.8} ${R * 0.8} 0 0 1 ${-R * 0.1} ${-R * 0.79}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.7"/></g>`;
      // ひだの名前
      z += g(olText(CX + 6, CY - 232, 'ひだ', { size: 54, ol: '#7a2a20' }), { o: prog(t, c1 + d1 * 0.4, 0.3) * (1 - wall) });
      z += g(olText(CX - 150, CY - 232, 'みず →', { size: 44, ol: FC.waveDk }) + olText(CX + 150, CY + 112, '← ち', { size: 44, ol: FC.bloodDk }), { o: wall });
      z += g(olText(CX + 40, CY - 62, 'うすい かべ', { size: 40, fill: '#fff', ol: '#8a6a3a' }), { o: prog(t, c4 + d4 * 0.35, 0.3) });
      out += g(z, { o: zk, s: 1 });
      out += pop(badge('ちいさな ひだが ぎっしり', { fill: '#a83a2c', size: 44 }), t, c1 + d1 * 0.45, CX, 800, { end: c2 + 0.2 });
      out += pop(badge('みずに ふれる ところが ひろい', { fill: FC.waveDk, size: 44 }), t, c2 + 0.5, CX, 800, { end: c4 - 0.2 });
      out += pop(badge('うすい かべの うらを、ちが ながれる', { fill: '#a83a2c', size: 42 }), t, c4 + d4 * 0.45, CX, 800, { end: c5 + 0.2 });
      out += pop(badge('さんそが、ちの なかへ', { fill: '#b8862a', size: 46 }), t, c5 + 0.6, CX, 800);
    }
    // カメレオン
    out += kidShow('K', t, 1750, 850, { s: 0.72, start: cue(3) - 0.9, n: 0, bubble: false });
    out += talkBubble('K', 1650, 590, 1700, 706, 46);
    return out;
  },
});

// 6. 血と水は反対向き。マグロは泳ぎつづける
function o2band(x, y, w, h, counts, kind, t, seed) {
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${kind === 'w' ? FC.water : FC.bloodBg}" stroke="${kind === 'w' ? '#8fc7e0' : '#e0a898'}" stroke-width="5"/>`;
  const sw = w / counts.length;
  counts.forEach((k, i) => { for (let j = 0; j < k; j++) o += o2dot(x + sw * i + 46 + (j % 3) * 36 + Math.sin(t * 2 + i + j + seed) * 2, y + h / 2 + (Math.floor(j / 3) - (k > 3 ? 0.5 : 0)) * 34, 13); });
  return o;
}
SCENES.push({
  id: 'counter',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), c4 = cue(4);
    let out = PAPER + topBadge();
    // A：反対向きと、同じ向き
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const X = 420, W = 1180, sw = W / 5;
      let a = pop(badge('はんたいむき（さかなの えら）', { fill: C.accent, size: 42 }), t, 0.3, 1010, 170);
      let top = o2band(X, 220, W, 86, [6, 5, 4, 3, 2], 'w', t, 1) + o2band(X, 336, W, 86, [5, 4, 3, 2, 1], 'b', t, 2);
      top += text(X - 30, 263, 'みず', { size: 44, w: 900, anchor: 'end', fill: FC.waveDk }) + text(X - 30, 379, 'ち', { size: 44, w: 900, anchor: 'end', fill: FC.blood });
      top += arrow(X + 40, 204, X + 300, 204, FC.wave, 10, eo(prog(t, c0 + 0.6, 0.6))) + arrow(X + W - 40, 440, X + W - 300, 440, FC.blood, 10, eo(prog(t, c0 + d0 * 0.5, 0.6)));
      for (let i = 0; i < 5; i++) { const f = (t * 0.9 + i * 0.2) % 1; top += g(o2dot(0, 0, 9), { x: X + sw * i + sw / 2 + 60, y: lerp(300, 344, f), o: prog(t, c0 + d0 * 0.6, 0.4) * Math.sin(f * Math.PI) }) + `<path d="M ${X + sw * i + sw / 2 + 30} 311 v 14 m -9 -8 l 9 10 l 9 -10" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="${prog(t, c0 + d0 * 0.6, 0.4)}"/>`; }
      a += g(top, { o: prog(t, 0.5, 0.4) });
      a += pop(text(0, 0, 'どこでも みずの ほうが おおい → ずっと うつる', { size: 38, w: 900, fill: C.accent }), t, c0 + d0 * 0.75, 1010, 480);
      // 同じ向き（くらべる）
      const bk = prog(t, c1 + 0.2, 0.4);
      if (bk > 0) {
        let bt = o2band(X, 590, W, 72, [6, 4, 3, 3, 3], 'w', t, 3) + o2band(X, 680, W, 72, [0, 2, 3, 3, 3], 'b', t, 4);
        bt += text(X - 30, 626, 'みず', { size: 40, w: 900, anchor: 'end', fill: FC.waveDk }) + text(X - 30, 716, 'ち', { size: 40, w: 900, anchor: 'end', fill: FC.blood });
        bt += arrow(X + 40, 576, X + 300, 576, FC.wave, 9, 1) + arrow(X + 40, 768, X + 300, 768, FC.blood, 9, 1);
        for (let i = 0; i < 2; i++) bt += `<path d="M ${X + sw * i + sw / 2 + 30} 656 v 12 m -8 -7 l 8 9 l 8 -9" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
        a += g(bt + g(badge('おなじ むき（くらべる）', { fill: '#7f8a94', size: 38 }), { x: 1010, y: 540 }), { o: bk });
        a += pop(text(0, 0, 'とちゅうで おなじに なって とまる', { size: 36, w: 900, fill: '#7f8a94' }), t, c1 + d1 * 0.5, 1230, 800);
      }
      out += g(a, { o: aO });
    }
    // B：4分の3を取りこむ。人の肺の2倍
    const bO = prog(t, c2 - 0.3, 0.5) * (1 - prog(t, c4 - 0.6, 0.4));
    if (bO > 0) {
      let b = pop(text(0, 0, 'みずの さんその、およそ 4ぶんの 3を とりこむ', { size: 54, w: 900 }), t, c2, 1000, 190);
      const mvk = eio(prog(t, c2 + d2 * 0.4, 1.0));
      b += `<rect x="330" y="270" width="560" height="170" rx="24" fill="${FC.water}" stroke="#8fc7e0" stroke-width="6"/><rect x="1030" y="270" width="560" height="170" rx="24" fill="${FC.bloodBg}" stroke="#e0a898" stroke-width="6"/>`;
      b += text(610, 478, 'みず', { size: 40, w: 900, fill: FC.waveDk }) + text(1310, 478, 'ち', { size: 40, w: 900, fill: FC.blood });
      for (let i = 0; i < 4; i++) { const x0 = 430 + i * 120, x1 = i < 3 ? 1190 + i * 120 : x0; b += o2dot(lerp(x0, x1, mvk), 355 - Math.sin(mvk * Math.PI) * (i < 3 ? 60 : 0), 34); }
      b += arrow(905, 355, 1015, 355, C.ink, 12, 1, prog(t, c2 + d2 * 0.3, 0.3));
      // 人の肺の2倍
      const hk = prog(t, c3 - 0.1, 0.4);
      if (hk > 0) {
        let h = text(560, 600, 'さかなの えら', { size: 44, w: 900, anchor: 'end' }) + `<rect x="600" y="566" width="${780 * eo(prog(t, c3 + 0.2, 0.8))}" height="68" rx="18" fill="${FC.blood}"/>`;
        h += text(560, 720, 'ひとの はい', { size: 44, w: 900, anchor: 'end' }) + `<rect x="600" y="686" width="${390 * eo(prog(t, c3 + 0.6, 0.6))}" height="68" rx="18" fill="#9aa7b4"/>`;
        h += pop(badge('2ばい', { fill: '#a83a2c', size: 54, pad: 40 }), t, c3 + 1.3, 1560, 600);
        h += g(text(1000, 800, '（さんそを とりこむ わりあい）', { size: 32, w: 700, fill: C.muted }), { o: prog(t, c3 + 0.9, 0.3) });
        b += g(h, { o: hk });
      }
      out += g(b, { o: bO });
    }
    // C：マグロは、口を少しあけたまま泳ぎつづける
    const cO = prog(t, c4 - 0.4, 0.6);
    if (cO > 0) {
      let s = waterBg('ctbg', '#8fc7e6', '#3f86c0');
      for (let j = 0; j < 6; j++) s += streaks(2000, 190 + j * 120, -100, 190 + j * 120, t, { n: 4, o: 0.5, len: 110, speed: 0.55 + (j % 3) * 0.12, col: '#d6eefa', spread: 50, seed: 20 + j, w: 8 });
      const TX = 930 + Math.sin(t * 1.3) * 16, TY = 480 + Math.sin(t * 2.1) * 8, S = 5.4;
      s += streaks(TX + 72 * S + 420, TY, TX + 72 * S + 10, TY, t, { n: 4, o: 0.95, len: 60, speed: 1.3, col: '#fff', spread: 26, seed: 31, w: 10 });
      s += `<g transform="translate(${TX} ${TY}) rotate(${Math.sin(t * 6) * 1.2})">${tunaFish(0, 0, S)}</g>`;
      s += streaks(TX + 30 * S, TY + 12 * S, TX - 420, TY + 44 * S, t, { n: 3, o: 0.95, len: 60, speed: 1.3, col: '#fff', seed: 32, w: 10 }) + streaks(TX + 30 * S, TY - 12 * S, TX - 420, TY - 40 * S, t, { n: 3, o: 0.95, len: 60, speed: 1.3, col: '#fff', seed: 33, w: 10 });
      s += pop(badge('マグロ', { fill: FC.tuna, size: 54, pad: 44 }), t, c4 + 0.2, 420, 190);
      s += pop(badge('くちを すこし あけた まま、およぎつづける', { fill: 'rgba(255,250,240,0.94)', color: C.ink, size: 42 }), t, c4 + 1.2, 960, 772);
      s += pop(badge('くち', { fill: '#2c4560', size: 40 }), t, c4 + 1.8, 1560, 300) + pointer(1530, 334, 930 + 70 * S, 470, '#2c4560', prog(t, c4 + 2.0, 0.3));
      s += topBadge();
      out += g(s, { o: cO });
    }
    return out;
  },
});

// 7. 水から出ると、えらがしぼむ
function lamPanel(id, stick, t, title, sub, subCol, bg = FC.water) {
  const R = 170;
  return `<clipPath id="${id}"><circle r="${R}"/></clipPath><g clip-path="url(#${id})"><g transform="scale(0.62)">${lamellaeView(t, R / 0.62, stick, bg)}</g></g>` +
    `<circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="14"/>` + text(0, -214, title, { size: 44, w: 900 }) + g(badge(sub, { fill: subCol, size: 40 }), { y: 232 });
}
SCENES.push({
  id: 'air',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    const dx = lerp(430, 0, eio(prog(t, c2 - 0.8, 0.8)));
    // 空気（上）と水（下）
    const X0 = 90, X1 = 900, WY = 480;
    let a = `<clipPath id="arc"><rect x="${X0}" y="170" width="${X1 - X0}" height="660" rx="30"/></clipPath><g clip-path="url(#arc)"><rect x="${X0}" y="170" width="${X1 - X0}" height="660" fill="${FC.air}"/><rect x="${X0}" y="${WY}" width="${X1 - X0}" height="400" fill="${FC.water}"/>`;
    a += `<path d="M ${X0} ${WY} ${Array.from({ length: 11 }, (_, i) => `q 20 ${i % 2 ? 8 : -8} 40 0 t 40 0`).join(' ')}" fill="none" stroke="#fff" stroke-width="6" opacity="0.9"/>`;
    // 空気のさんそ（たくさん）と、水のさんそ（すこし）
    const hl = prog(t, c1 + 0.1, 0.4);
    for (let i = 0; i < 40; i++) { const x = X0 + 50 + (i % 10) * 78 + Math.sin(t * 1.3 + i) * 8, y = 212 + Math.floor(i / 10) * 62 + Math.cos(t * 1.1 + i * 2) * 7; a += o2dot(x, y, 12 + hl * 2 * (0.5 + 0.5 * Math.sin(t * 5 + i)), 0.55 + 0.45 * hl); }
    [[230, 590], [520, 760], [770, 640]].forEach(([x, y], i) => { a += o2dot(x + Math.sin(t + i) * 10, y + Math.cos(t * 0.8 + i) * 8, 13); });
    a += `</g><rect x="${X0}" y="170" width="${X1 - X0}" height="660" rx="30" fill="none" stroke="#8fb3c6" stroke-width="8"/>`;
    a += g(text(X0 + 26, 446, 'くうき', { size: 40, w: 900, anchor: 'start', fill: C.muted }) + olText(X0 + 26, 792, 'みず', { size: 40, anchor: 'start', ol: FC.waveDk }), { o: prog(t, 0.4, 0.3) });
    // 水の中の金魚（ぱくぱく）
    a += flowFish(520, 660, 2.3, t, { inLen: 190, outLen: 230 });
    // 水から出たら？（点線の金魚）
    const gk = prog(t, c0 + d0 * 0.3, 0.5);
    a += g(arrow(520, 590, 520, 470, '#7f8a94', 12, eo(gk)) + g(goldfish(0, 0, 2.3, { ghost: true }), { x: 520, y: 372 }), { o: gk });
    a += g(text(0, 0, '？', { size: 110, w: 900, fill: C.ochre }), { x: 760, y: 350, o: gk * (1 - prog(t, c1 + d1 * 0.55, 0.3)), s: 1 + Math.sin(t * 4) * 0.05 });
    a += pop(badge('さんそが たくさん', { fill: '#b8862a', size: 40 }), t, c1 + 0.3, 300, 250);
    const xk = prog(t, c1 + d1 * 0.55, 0.3);
    a += g(cross(0, 0, 0.75), { x: 520, y: 372, o: xk, s: lerp(1.4, 1, eo(xk)) }) + pop(badge('いきが できない', { fill: C.redUi, size: 44 }), t, c1 + d1 * 0.55 + 0.2, 720, 300);
    out += g(a, { x: dx });
    // えらのひだ：水の中ではひろがる、空気の中ではくっつく
    const pk = prog(t, c2 - 0.2, 0.5);
    if (pk > 0) {
      const stick = eio(prog(t, c2 + d2 * 0.35, 1.4));
      let p = g(lamPanel('lp0', 0, t, 'みずの なか', 'ひだが ひろがる', FC.waveDk), { x: 1190, y: 480 });
      p += g(lamPanel('lp1', stick, t, 'みずから でると', stick > 0.5 ? 'しぼんで くっつく' : 'どう なる？', stick > 0.5 ? C.redUi : '#7f8a94', mix(FC.water, FC.air, stick)), { x: 1630, y: 480 });
      p += pop(badge('えらの ひだ', { fill: '#a83a2c', size: 44 }), t, c2, 1410, 190);
      out += g(p, { o: pk });
    }
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'えらに みずを とおして いきを する', { size: 52, w: 900, anchor: 'start' }) + g(GUESS_ICON[1], { x: 540, y: 0, s: 0.9 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['みずの さんそは すこし', FC.waveDk], ['くち → えらぶたへ いっぽうつうこう', C.accent], ['えらの ひだで さんそを とる', '#a83a2c']], t, 960, 660, { start: 2.4, step: 1.1, size: 32, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const fishIc = goldfish(0, 0, 0.72, { ...paku(t, 1.6) });
      const tunaIc = tunaFish(0, 0, 0.6);
      const items = [
        [fishIc, 'くちが とじた とき、えらぶたが ひらく？', C.ink],
        [tunaIc, 'マグロは くちを あけた まま およぐ？', C.ink],
        [warnIcon(0.82), 'さかなは みずから ださない', C.red],
        [warnIcon(0.82), 'てを いれない、ガラスを たたかない。みるだけ', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // 水そうの金魚（横から見る）
      let p = card(420, 330) + `<clipPath id="lkc"><rect x="-190" y="-145" width="380" height="290" rx="20"/></clipPath><g clip-path="url(#lkc)"><rect x="-190" y="-145" width="380" height="290" fill="${FC.water}"/><rect x="-190" y="110" width="380" height="40" fill="${FC.sand}"/>${weed(-140, 116, 120, t, '#5aa86a', 1)}${weed(150, 116, 90, t, '#6fba78', 2)}${flowFish(20, -10, 1.7, t, { inLen: 120, outLen: 150, T: 2.2 })}</g>`;
      b += pop(p, t, cue(1) + 0.3, 1600, 330);
      b += kidShow('K', t, 1690, 820, { s: 0.8, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「さかな」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

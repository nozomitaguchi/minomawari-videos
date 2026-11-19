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
const TOPIC = 'でんせん';
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
// みのまわり図鑑 動画「電線に止まった鳥は、どうしてしびれない？」（でんせん）
// 出どころ：everyday-trivia trivia/utility-pole-transformer.md（鳥が感電しないわけ・がいし）・utility-pole-wire-order.md（線のならび・ボルト）

// ---------- 道具 ----------
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46 } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const okMark = (s = 1, col = C.red) => `<circle r="${60 * s}" fill="none" stroke="${col}" stroke-width="${12 * s}"/>`;
const ELEC = '#ffd23a';
const POLE = '#b9b8b0', POLE_D = '#8f8e86', WIRE = '#2f3336';

// 電線（たるんだ線）。u（0〜1）の位置の高さ
const wireY = (x1, y1, x2, y2, sag, x) => { const u = clamp((x - x1) / (x2 - x1)); return lerp(y1, y2, u) + 4 * sag * u * (1 - u); };
const wirePath = (x1, y1, x2, y2, sag, { col = WIRE, w = 5 } = {}) =>
  `<path d="M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + 2 * sag} ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
// 電線の上を流れる電気のつぶ（左から右へ）
function elecDots(x1, y1, x2, y2, sag, t, { n = 10, o = 1, r = 9, speed = 0.18, seed = 0, stopX = null } = {}) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const u = ((t * speed + i / n + seed) % 1);
    const x = lerp(x1, x2, u);
    if (stopX !== null && x > stopX) continue;
    const y = wireY(x1, y1, x2, y2, sag, x);
    const f = Math.sin(u * Math.PI);
    s += `<circle cx="${x}" cy="${y}" r="${r * 2}" fill="${ELEC}" opacity="${0.3 * o * f}" filter="url(#soft)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${ELEC}" opacity="${o * (0.4 + 0.6 * f)}"/>`;
  }
  return s;
}
// 鳥。x, y は足もと（電線の上）。dir = 1 で右向き、-1 で左向き。wing: 0 たたむ → 1 上に広げる。fly: 飛んでいる（はばたき）
const BIRD = { shoulder: [-6, -74] };
function birdWingTip(wing) {
  const phi = (172 + 86 * wing) * Math.PI / 180, L = lerp(92, 170, wing);
  return [BIRD.shoulder[0] + Math.cos(phi) * L, BIRD.shoulder[1] + Math.sin(phi) * L];
}
function bird(x, y, s, t, { dir = 1, col = '#8a6a4f', belly = '#f1e4cf', wing = 0, fly = false, blink = 0, look = 0 } = {}) {
  const wcol = mix(col, '#000000', 0.18);
  let phi = 172 + 86 * wing, L = lerp(92, 170, wing), W = lerp(24, 34, wing);
  if (fly) { phi = 230 + Math.sin(t * 16 + blink) * 55; L = 120; W = 28; }
  const bl = ((t + blink) % 3.1) < 0.12;
  let b = '';
  // しっぽ
  b += `<path d="M -36 -66 L -104 -40 L -96 -22 L -34 -44 Z" fill="${wcol}"/>`;
  // 足
  if (!fly) b += `<g stroke="#d08a3a" stroke-width="6" stroke-linecap="round"><line x1="-12" y1="-24" x2="-14" y2="0"/><line x1="12" y1="-24" x2="14" y2="0"/><line x1="-24" y1="2" x2="-2" y2="2"/><line x1="2" y1="2" x2="26" y2="2"/></g>`;
  // からだ
  b += `<ellipse cx="0" cy="-60" rx="56" ry="42" fill="${col}"/><ellipse cx="10" cy="-46" rx="38" ry="24" fill="${belly}"/>`;
  // 頭
  b += `<circle cx="40" cy="-104" r="32" fill="${col}"/><circle cx="48" cy="-96" r="17" fill="${belly}" opacity="0.9"/>`;
  b += `<path d="M 68 -112 L 94 -103 L 68 -94 Z" fill="#e8a33a"/>`;
  b += bl ? `<line x1="44" y1="-112" x2="58" y2="-112" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>` : `<circle cx="${51 + look}" cy="-112" r="6.5" fill="${C.ink}"/><circle cx="${53 + look}" cy="-114" r="2.2" fill="#fff"/>`;
  // つばさ（肩から）
  b += `<g transform="translate(${BIRD.shoulder[0]} ${BIRD.shoulder[1]}) rotate(${phi})"><ellipse cx="${L / 2}" cy="0" rx="${L / 2}" ry="${W}" fill="${wcol}"/>` +
    (wing > 0.3 || fly ? [0.55, 0.75, 0.92].map(k => `<line x1="${L * k - 14}" y1="${-W * 0.5}" x2="${L * k}" y2="${W * 0.55}" stroke="${mix(wcol, '#000000', 0.2)}" stroke-width="4" stroke-linecap="round"/>`).join('') : '') + `</g>`;
  return `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})">${b}</g>`;
}
// 電柱（正面から）。x は柱の中心、top は柱のてっぺん、bot は根もと
function pole(x, top, bot, { w = 34, arm = true, trans = false, lv = true, comm = true } = {}) {
  let s = `<path d="M ${x - w / 2} ${top} L ${x + w / 2} ${top} L ${x + w * 0.62} ${bot} L ${x - w * 0.62} ${bot} Z" fill="${POLE}"/><path d="M ${x + w * 0.18} ${top} L ${x + w / 2} ${top} L ${x + w * 0.62} ${bot} L ${x + w * 0.24} ${bot} Z" fill="${POLE_D}" opacity="0.5"/>`;
  return s;
}
// 電柱の各段の高さ（街の絵）
const LV = { earth: 160, hv: [214, 232, 250], lv: [330, 362, 394], comm: 500 };
// 街の電柱と電線。xs: 柱の x の配列
function street(xs, { glowHV = 0, glowLV = 0, top = 140, bot = 980, transAt = -1 } = {}) {
  let back = '', front = '';
  xs.forEach((x, i) => {
    back += pole(x, top, bot);
    // 腕金（ななめから見た形）
    front += `<path d="M ${x - 110} ${LV.hv[0] + 22} L ${x + 110} ${LV.hv[2] + 22}" stroke="#6b6e70" stroke-width="12" stroke-linecap="round"/>`;
    [-90, 0, 90].forEach((dx, k) => { front += insul(x + dx, LV.hv[k] + 18, 0.5); });
    LV.lv.forEach(y => { front += `<rect x="${x + 16}" y="${y - 6}" width="22" height="16" rx="4" fill="#6b6e70"/>` + insul(x + 40, y + 6, 0.32); });
    if (i === transAt) front += transformer(x - 64, 300, 0.9);
  });
  let wires = '';
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1];
    wires += wirePath(a, LV.earth, b, LV.earth, 18, { w: 3 });
    [-90, 0, 90].forEach((dx, k) => { wires += wirePath(a + dx, LV.hv[k] + 4, b + dx, LV.hv[k] + 4, 34, { w: 5 }); if (glowHV > 0) wires += g(wirePath(a + dx, LV.hv[k] + 4, b + dx, LV.hv[k] + 4, 34, { col: ELEC, w: 14 }), { o: glowHV * 0.6 }); });
    LV.lv.forEach(y => { wires += wirePath(a + 40, y - 4, b + 40, y - 4, 40, { w: 6 }); if (glowLV > 0) wires += g(wirePath(a + 40, y - 4, b + 40, y - 4, 40, { col: ELEC, w: 14 }), { o: glowLV * 0.6 }); });
    wires += wirePath(a + 20, LV.comm, b + 20, LV.comm, 46, { w: 12, col: '#1d1f21' });
  }
  return back + wires + front;
}
// がいし（白い、ひだつき）。x, y は電線がのる頭、s は大きさ
const insul = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-10" y="20" width="20" height="44" fill="#7b7e80"/>
  <path d="M -30 34 Q 0 20 30 34 L 26 46 Q 0 38 -26 46 Z" fill="#e9e6dc"/>
  <path d="M -26 16 Q 0 4 26 16 L 22 28 Q 0 20 -22 28 Z" fill="#f4f1e8"/>
  <rect x="-16" y="-8" width="32" height="28" rx="10" fill="#fbf8ef"/><path d="M -16 -2 L 16 -2" stroke="#d8d3c4" stroke-width="3"/></g>`;
const transformer = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-40" y="0" width="80" height="120" rx="12" fill="#9aa0a4"/><rect x="-40" y="0" width="80" height="18" rx="8" fill="#80868a"/><rect x="-28" y="30" width="56" height="6" fill="#80868a" opacity="0.6"/><rect x="-28" y="50" width="56" height="6" fill="#80868a" opacity="0.6"/></g>`;
const ground = (y = 860, col = '#cfe3b6') => `<path d="M 0 ${y} L 1920 ${y} L 1920 1080 L 0 1080 Z" fill="${col}"/><path d="M 0 ${y} L 1920 ${y}" stroke="${mix(col, '#000', 0.12)}" stroke-width="4"/>`;
const houses = y => house(1460, y, 0.9) + house(1640, y, 0.75, '#eadfcb', '#5f7f9a') + tree(1790, y, 0.8);
// 小さな火花
function spark(x, y, s, t, o = 1) {
  if (o <= 0) return '';
  let p = `<circle r="46" fill="${ELEC}" opacity="0.55" filter="url(#glow)"/>`;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 3, L = 40 + 16 * Math.sin(t * 20 + i); p += `<line x1="${Math.cos(a) * 14}" y1="${Math.sin(a) * 14}" x2="${Math.cos(a) * L}" y2="${Math.sin(a) * L}" stroke="${i % 2 ? '#fff6c8' : ELEC}" stroke-width="7" stroke-linecap="round"/>`; }
  return g(p, { x, y, s, o });
}
// ジグザグの電気の通り道（点の列を、k の割合までかく）
function zigPath(P, k, { col = ELEC, w = 10 } = {}) {
  if (k <= 0) return '';
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const d = clamp(k) * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < d) i++;
  const f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  const hx = lerp(P[i - 1][0], P[i][0], f), hy = lerp(P[i - 1][1], P[i][1], f);
  let p = `M ${P[0][0]} ${P[0][1]}`; for (let j = 1; j < i; j++) p += ` L ${P[j][0]} ${P[j][1]}`; p += ` L ${hx} ${hy}`;
  return `<path d="${p}" fill="none" stroke="${col}" stroke-width="${w * 2.4}" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/><path d="${p}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// 水そう（中の水の高さ lv 0〜1）
const tank = (x, y, w, h, lv) => `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="10" fill="#f6fbff" stroke="#6a8aa0" stroke-width="6"/><rect x="${x - w / 2 + 6}" y="${y - 6 - (h - 12) * lv}" width="${w - 12}" height="${(h - 12) * lv}" rx="6" fill="#7cc0ec"/>`;

// 1. つかみ：電線にならぶ鳥
const HOOK_BIRDS = [[760, 0.0, '#8a6a4f'], [900, 0.25, '#6f6a62'], [1040, 0.5, '#8a6a4f'], [1180, 0.75, '#7d5f48']];
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = skyRect('skh', 0) + cloud(1500, 150, 0.9) + cloud(500, 120, 0.7);
    out += houses(860) + ground(860);
    const xs = [220, 1700];
    out += street(xs, { glowLV: win(t, cue(2) + 0.2, cueE(3) + 0.4, 0.4) * (0.6 + 0.4 * Math.sin(t * 6)), transAt: 0 });
    out += elecDots(260, LV.lv[1] - 4, 1740, LV.lv[1] - 4, 40, t, { n: 12, o: win(t, cue(2) + 0.4, cueE(3) + 0.4, 0.4) });
    // 鳥が右から飛んできて、まん中の線に止まる（頭は進む向き＝左）
    const W = [260, 1740, 40, LV.lv[1] - 4];
    HOOK_BIRDS.forEach(([bx, d, col], i) => {
      const st = cue(1) - 0.6 + d * 1.6, k = prog(t, st, 1.5);
      if (k <= 0) return;
      const yW = wireY(W[0], W[3], W[1], W[3], W[2], bx) - 3;
      const e = eo(k), x = lerp(2050, bx, e), y = lerp(yW - 260, yW, e) - Math.sin(e * Math.PI) * 60;
      out += bird(x, y, 0.5, t, { dir: -1, col, fly: k < 1, blink: i * 0.7 });
    });
    out += kidShow('S', t, 400, 850, { s: 0.52, start: 0.3, n: 0, look: [5, -9], side: 'right' });
    out += kidShow('B', t, 560, 850, { s: 0.52, start: 0.6, n: 1, look: [6, -9], bubble: false });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1180, y: 560, o: win(t, cue(4), cueE(4) + 0.6, 0.3) });
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">でんせん</tspan>の とりは</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.redUi}">しびれない</tspan>？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(`<rect x="-360" y="-90" width="720" height="180" rx="24" fill="${SKY.dayMid}"/>` + wirePath(-340, 40, 340, 40, 14, { w: 6 }) + elecDots(-340, 40, 340, 40, 14, t, { n: 8, r: 6 }) +
        bird(-150, 50, 0.5, t, { dir: 1 }) + bird(0, 54, 0.5, t, { dir: -1, col: '#6f6a62', blink: 1 }) + bird(150, 50, 0.5, t, { dir: 1, col: '#7d5f48', blink: 2 }), t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'でんせんの とりが しびれないのは なぜ？', { size: 70, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'とりの あしが でんきを とおさない'], ['②', 'でんせんの でんきが とても よわい'], ['③', '1ぽんの でんせんだけに とまっている']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(`<circle r="130" fill="${SKY.dayMid}"/>` + wirePath(-128, 30, 128, 30, 8, { w: 6 }) + bird(0, 34, 0.75, t, { dir: 1 }) + text(70, -120, '？', { size: 90, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 330);
    out += kidShow('B', t, 1690, 840, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1500, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 電線の電気：高いところの3本は 6600ボルト
SCENES.push({
  id: 'wire',
  draw(t) {
    let out = skyRect('skw', 0) + topBadge();
    // 大きな電柱のてっぺん（左）から、右へのびる3本
    const PX = 420, S = 2.2;
    const hvY = [300, 360, 420], armY = [340, 400, 460];
    out += `<rect x="${PX - 40}" y="180" width="80" height="900" fill="${POLE}"/><rect x="${PX + 10}" y="180" width="30" height="900" fill="${POLE_D}" opacity="0.5"/>`;
    out += `<path d="M ${PX - 160} ${armY[0]} L ${PX + 160} ${armY[2]}" stroke="#6b6e70" stroke-width="22" stroke-linecap="round"/>`;
    const glow = prog(t, cue(0) + 1.0, 0.6) * (0.65 + 0.35 * Math.sin(t * 5));
    [-130, 0, 130].forEach((dx, k) => {
      const x0 = PX + dx, y0 = hvY[k];
      out += wirePath(x0, y0, 2000, y0 + 40 - k * 10, 30, { w: 9 });
      if (glow > 0) out += g(wirePath(x0, y0, 2000, y0 + 40 - k * 10, 30, { col: ELEC, w: 22 }), { o: glow * 0.55 });
      out += elecDots(x0, y0, 2000, y0 + 40 - k * 10, 30, t, { n: 9, r: 9, o: prog(t, cue(1), 0.5), seed: k * 0.13 });
      out += insul(x0, y0 + 2, 1.0);
    });
    out += pop(badge('よこに 3ぼん', { fill: C.ink, size: 42 }), t, cue(0) + 1.4, 1240, 220, { end: cue(1) + 0.4 });
    // 6600ボルト
    out += pop(card(560, 200) + text(0, -30, '6600ボルト', { size: 84, w: 900, fill: C.redUi, ls: 0.02 }) + text(0, 56, 'とても つよい でんき', { size: 40, w: 900, fill: C.ink }), t, cue(1) + 1.0, 1240, 640, { end: cue(2) - 0.2 });
    // くらべる：おうちの電気
    const cO = prog(t, cue(2) - 0.2, 0.4);
    if (cO > 0) {
      let c = `<rect x="840" y="430" width="960" height="400" rx="34" fill="${C.paper}" filter="url(#shadow)"/>`;
      const base = 760, H = 250, sc = H / 6600;
      const bar = (x, v, col, lab) => `<rect x="${x - 50}" y="${base - v * sc}" width="100" height="${Math.max(4, v * sc)}" rx="8" fill="${col}"/>` + text(x, base + 32, lab, { size: 32, w: 900, fill: C.ink });
      const gk = eo(prog(t, cue(2) + 0.4, 0.8));
      c += `<line x1="880" y1="${base}" x2="1760" y2="${base}" stroke="${C.line}" stroke-width="5"/>`;
      c += bar(1020, 100 * gk + 1, C.blueUi, '100') + bar(1180, 200 * gk + 1, C.blueUi, '200') + bar(1560, 6600 * gk, C.redUi, '6600');
      c += text(1100, 720, 'おうちの でんき', { size: 36, w: 900, fill: C.blueUi });
      c += text(1560, 480, 'でんせん', { size: 36, w: 900, fill: C.redUi });
      c += g(text(0, 0, 'ずっと つよい！', { size: 48, w: 900, fill: C.redUi }), { x: 1180, y: 560, o: prog(t, cue(2) + 2.0, 0.3) });
      out += g(c, { o: cO });
    }
    return out;
  },
});

// 4. 電気は水のように、高いほうから低いほうへ
SCENES.push({
  id: 'water',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // ボルト＝電気を押し出す強さ
    const aO = 1 - prog(t, cue(1) - 0.4, 0.4);
    if (aO > 0) {
      let a = pop(card(1200, 300) + text(0, -60, 'ボルト（でんあつ）', { size: 72, w: 900, fill: C.redUi }) + text(0, 50, '＝ でんきを おしだす つよさ', { size: 60, w: 900 }), t, cue(0) + 0.4, 960, 400);
      const pk = prog(t, cue(0) + 1.6, 0.5);
      if (pk > 0) {
        a += g(wirePath(-300, 0, 300, 0, 0, { w: 10 }) + elecDots(-300, 0, 300, 0, 0, t * 2, { n: 8 }) + arrow2(-380, 0, -200, 0, C.redUi, 16) + text(-390, -70, 'ぐいっ', { size: 40, w: 900, fill: C.redUi }), { x: 960, y: 700, o: pk });
      }
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.4);
    if (bO > 0) {
      let b = '';
      // 左：水
      b += `<rect x="140" y="180" width="780" height="640" rx="36" fill="#eef6fc"/>` + text(530, 240, 'みず', { size: 54, w: 900, fill: C.blueUi });
      b += tank(330, 520, 200, 220, 0.85) + tank(730, 760, 200, 160, 0.35);
      b += `<path d="M 430 490 L 520 490 Q 560 490 560 530 L 560 640 Q 560 680 600 680 L 630 680" fill="none" stroke="#6a8aa0" stroke-width="40" stroke-linejoin="round"/><path d="M 430 490 L 520 490 Q 560 490 560 530 L 560 640 Q 560 680 600 680 L 630 680" fill="none" stroke="#7cc0ec" stroke-width="26" stroke-linejoin="round"/>`;
      for (let i = 0; i < 6; i++) { const u = (t * 0.5 + i / 6) % 1, P = [[430, 490], [560, 490], [560, 680], [630, 680]]; b += zigDot(P, u, '#ffffff'); }
      b += text(330, 570, 'たかい', { size: 40, w: 900, fill: C.blueUi }) + text(730, 805, 'ひくい', { size: 40, w: 900, fill: C.blueUi });
      // 右：電気
      const eO = prog(t, cue(2) - 0.3, 0.4);
      if (eO > 0) {
        let e = `<rect x="1000" y="180" width="780" height="640" rx="36" fill="#fff6d8"/>` + text(1390, 240, 'でんき', { size: 54, w: 900, fill: C.ochre });
        e += `<rect x="1110" y="300" width="160" height="300" rx="16" fill="${C.redUi}"/>` + text(1190, 450, 'たかい', { size: 40, w: 900, fill: '#fff' });
        e += `<rect x="1510" y="520" width="160" height="80" rx="16" fill="${C.blueUi}"/>` + text(1590, 560, 'ひくい', { size: 40, w: 900, fill: '#fff' });
        e += text(1390, 680, 'でんあつ', { size: 40, w: 900, fill: C.ink });
        e += wirePath(1270, 420, 1510, 560, 30, { w: 10 });
        e += elecDots(1270, 420, 1510, 560, 30, t, { n: 6, o: prog(t, cue(2) + 0.6, 0.4), speed: 0.4 });
        e += g(arrow2(1320, 340, 1500, 450, C.ochre, 12), { o: prog(t, cue(2) + 1.0, 0.4) });
        b += g(e, { o: eO });
      }
      out += g(b, { o: bO });
    }
    return out;
  },
});
// 折れ線の上の点（u 0〜1）
function zigDot(P, u, col) {
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const d = u * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < d) i++;
  const f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  return `<circle cx="${lerp(P[i - 1][0], P[i][0], f)}" cy="${lerp(P[i - 1][1], P[i][1], f)}" r="7" fill="${col}" opacity="${Math.sin(u * Math.PI)}"/>`;
}

// 5. 鳥は1本の電線だけにふれている
SCENES.push({
  id: 'one',
  draw(t) {
    let out = skyRect('sko', 0) + topBadge();
    const Y = 560, X1 = -40, X2 = 1960, SAG = 20, BX = 760;
    out += wirePath(X1, Y, X2, Y, SAG, { w: 12 });
    out += elecDots(X1, Y, X2, Y, SAG, t, { n: 14, r: 11, o: prog(t, cue(0) + 0.2, 0.5) });
    const by = wireY(X1, Y, X2, Y, SAG, BX) - 5;
    out += bird(BX, by, 2.0, t, { dir: 1 });
    // 1本だけ
    out += callout(BX - 14, by + 4, 330, 760, '1ぽんだけ', prog(t, cue(0) + 2.4, 0.3) * (1 - prog(t, cue(1) - 0.3, 0.3)), { col: C.blueUi, size: 46 });
    // 高い低いがない：足の下の高さの目じるしが同じ
    const hk = prog(t, cue(1) + 0.4, 0.5);
    if (hk > 0) {
      const BASE = by + 260, TOP = by + 120;
      const lev = (fx, x, lab) => `<path d="M ${fx} ${by + 6} L ${x} ${TOP - 6}" stroke="${C.redUi}" stroke-width="4" stroke-dasharray="8 6" fill="none"/>` +
        `<rect x="${x - 36}" y="${TOP}" width="72" height="${(BASE - TOP) * eo(hk)}" rx="10" fill="${C.redUi}" opacity="0.92"/>` + text(x, BASE + 30, lab, { size: 30, w: 900, fill: C.ink });
      out += g(`<line x1="${BX - 260}" y1="${BASE}" x2="${BX + 260}" y2="${BASE}" stroke="${C.ink}" stroke-width="4"/>` + lev(BX - 14, BX - 150, 'うしろの あし') + lev(BX + 14, BX + 150, 'まえの あし'), { o: hk });
      out += g(`<line x1="${BX - 230}" y1="${TOP}" x2="${BX + 230}" y2="${TOP}" stroke="${C.ink}" stroke-width="5" stroke-dasharray="14 10"/>` + text(BX + 250, TOP, 'おなじ', { size: 36, w: 900, fill: C.ink, anchor: 'start' }), { o: prog(t, cue(1) + 1.2, 0.4) });
      out += pop(card(560, 220) + text(0, -40, 'でんあつは どこも おなじ', { size: 44, w: 900 }) + text(0, 40, 'たかい ひくいが ない', { size: 44, w: 900, fill: C.redUi }), t, cue(1) + 1.2, 1440, 300, { end: cue(3) + 0.6 });
    }
    // 電気は体を通らない
    const ok = prog(t, cue(3) + 0.3, 0.5);
    if (ok > 0) {
      out += g(okMark(2.6, C.red), { x: BX + 20, y: by - 130, o: ok, s: Math.max(0.001, back(ok)) });
      out += pop(badge('からだを でんきが とおらない', { fill: C.blueUi, size: 44 }), t, cue(3) + 0.9, 1440, 300);
    }
    out += kidShow('K', t, 1660, 830, { s: 0.8, start: cue(2) - 0.8, n: 0, side: 'left', end: cue(3) + 0.6 });
    return out;
  },
});

// 6. 2本の電線や、電線と金具に同時にふれると、感電する
SCENES.push({
  id: 'two',
  draw(t) {
    let out = skyRect('skt', 0) + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.4, 0.4);
    const BX = 700, BS = 1.7, LOW = 720;
    const wk = eio(prog(t, cue(0) + 1.2, 2.4));
    const tip = birdWingTip(1);
    const UP = LOW + tip[1] * BS;  // 広げた羽の先の高さに上の電線
    if (aO > 0) {
      let a = wirePath(-40, UP, 1960, UP, 0, { w: 12 }) + wirePath(-40, LOW, 1960, LOW, 0, { w: 12 });
      a += bird(BX, LOW - 4, BS, t, { dir: 1, col: '#4b4a52', belly: '#8d8b94', wing: wk });
      a += pop(badge('おおきな とり', { fill: C.ink, size: 40 }), t, cue(0) + 0.6, 1240, 620, { end: cue(1) });
      const tx = BX + tip[0] * BS, ty = UP;
      // 電気が体を通る
      const zk = prog(t, cue(1) + 0.2, 1.4);
      a += zigPath([[tx - 60, ty], [tx, ty], [BX - 20, LOW - 150], [BX + 10, LOW - 90], [BX - 4, LOW - 4], [BX + 80, LOW]], zk, { w: 12 });
      a += spark(tx, ty, 1, t, prog(t, cue(1), 0.2) * (0.7 + 0.3 * Math.sin(t * 30)));
      a += spark(BX, LOW, 0.8, t, prog(t, cue(1) + 1.4, 0.2) * (0.7 + 0.3 * Math.sin(t * 27)));
      a += pop(g(warnIcon, { s: 1.2 }) + text(90, 6, 'かんでん！', { size: 64, w: 900, fill: C.red, anchor: 'start' }), t, cue(1) + 1.2, 1300, 470);
      a += g(text(0, 0, '2ほんに さわると…', { size: 48, w: 900, fill: C.ink }), { x: 1360, y: 280, o: win(t, cue(0) + 2.6, cue(2), 0.3) });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      // 電線と、電柱の金具
      const PX = 1060;
      let b = `<rect x="${PX - 40}" y="150" width="80" height="930" fill="${POLE}"/><rect x="${PX + 10}" y="150" width="30" height="930" fill="${POLE_D}" opacity="0.5"/>`;
      b += `<rect x="${PX - 520}" y="330" width="1040" height="34" rx="8" fill="#6b6e70"/>`;
      b += callout(PX - 400, 347, 420, 220, 'でんちゅうの かなぐ', prog(t, cue(2) + 0.6, 0.3), { col: '#5a5d60', size: 40 });
      const WY = 520;
      b += insul(PX + 380, 366, 1.2).replace('<g ', '<g ');
      b += wirePath(PX + 380, 366, -60, 760, 60, { w: 12 });
      const bx = 700, wy = wireY(PX + 380, 366, -60, 760, 60, bx);
      // 鳥は電線の上で、羽を上げて金具にふれる
      const wing2 = eio(prog(t, cue(2) + 0.4, 1.2));
      const tp = birdWingTip(1), s2 = (wy - 4 - 364) / -tp[1];
      b += bird(bx, wy - 4, s2, t, { dir: -1, col: '#4b4a52', belly: '#8d8b94', wing: wing2 });
      const zk = prog(t, cue(2) + 1.8, 1.0);
      const tx = bx - tp[0] * s2;
      b += zigPath([[tx, 364], [bx + 30, wy - 120], [bx - 10, wy - 60], [bx, wy - 6]], zk, { w: 11 });
      b += spark(tx, 360, 0.9, t, prog(t, cue(2) + 1.8, 0.2) * (0.7 + 0.3 * Math.sin(t * 30)));
      b += pop(g(warnIcon, { s: 1.0 }) + text(80, 6, 'これも かんでん', { size: 52, w: 900, fill: C.red, anchor: 'start' }), t, cue(2) + 2.4, 1200, 470);
      out += g(b, { o: bO });
    }
    out += kidShow('B', t, 1790, 850, { s: 0.52, start: cue(3) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 7. がいし：電気を通さずに電線をささえる
SCENES.push({
  id: 'gaishi',
  draw(t) {
    let out = skyRect('skg', 0) + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.4, 0.4);
    const PX = 520, IY = 420;
    if (aO > 0) {
      let a = `<rect x="${PX - 46}" y="200" width="92" height="880" fill="${POLE}"/><rect x="${PX + 10}" y="200" width="36" height="880" fill="${POLE_D}" opacity="0.5"/>`;
      a += `<rect x="${PX - 60}" y="${IY + 150}" width="560" height="40" rx="10" fill="#6b6e70"/>`;
      a += wirePath(PX + 320, IY + 6, 2000, IY + 60, 40, { w: 12 });
      const dk = prog(t, cue(1) + 0.4, 0.5);
      a += elecDots(PX + 320, IY + 6, 2000, IY + 60, 40, t, { n: 10, r: 11, o: dk, speed: 0.15 });
      a += insul(PX + 320, IY + 6, 2.4);
      a += callout(PX + 290, IY + 70, 1060, 260, 'がいし', prog(t, cue(0) + 2.4, 0.3), { col: C.blueUi, size: 54 });
      // 電気はここで止まる
      const sk = prog(t, cue(1) + 1.4, 0.4);
      a += g(arrow2(0, -40, 0, 200, ELEC, 12) + `<path d="M -50 30 L 50 130 M 50 30 L -50 130" stroke="${C.red}" stroke-width="16" stroke-linecap="round"/>`, { x: PX + 440, y: IY + 60, o: sk });
      a += pop(badge('でんきを とおさない', { fill: C.blueUi, size: 46 }), t, cue(1) + 1.0, 1300, 680);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      let b = `<rect x="260" y="170" width="1400" height="660" rx="40" fill="${C.paper}"/>`;
      b += text(960, 240, 'がいしが ないと…', { size: 56, w: 900 });
      const QX = 700;
      b += `<rect x="${QX - 34}" y="300" width="68" height="500" fill="${POLE}"/>`;
      b += `<rect x="${QX - 40}" y="380" width="460" height="30" rx="8" fill="#6b6e70"/>`;
      b += wirePath(QX + 360, 378, 1600, 420, 20, { w: 10 });
      const zk = prog(t, cue(2) + 0.6, 1.6);
      b += zigPath([[1580, 418], [QX + 360, 380], [QX, 395], [QX, 800]], zk, { w: 11 });
      b += pop(g(warnIcon, { s: 1.0 }) + text(80, 6, 'はしらへ ながれる', { size: 48, w: 900, fill: C.red, anchor: 'start' }), t, cue(2) + 1.8, 1060, 620);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. おまけ：線は上から電圧の高い順
SCENES.push({
  id: 'order',
  draw(t) {
    let out = skyRect('skr', 0) + topBadge() + houses(860) + ground(860);
    out += street([360, 1500], { transAt: 0, glowHV: win(t, cue(0) + 1.0, cue(1), 0.4) * (0.6 + 0.4 * Math.sin(t * 5)) });
    const labels = [
      [LV.hv[1], 'つよい でんき（6600ボルト）', C.redUi, cue(0) + 1.0],
      [LV.lv[1], 'おうちの でんき（100・200ボルト）', C.blueUi, cue(0) + 2.0],
      [LV.comm, 'でんわ・インターネット', '#4a4f55', cue(1) + 0.2],
    ];
    labels.forEach(([y, s, col, st]) => { out += pop(badge(s, { fill: col, size: 36 }), t, st, 800, y + 50); });
    out += pop(badge('うえほど つよい', { fill: C.ochre, size: 40 }), t, cue(0) + 3.0, 1000, 96);
    // 人や車から遠い
    const fk = prog(t, cue(1) + 2.6, 0.5);
    if (fk > 0) {
      out += g(arrow2(0, 0, 0, -480, C.redUi, 14) + arrow2(0, -480, 0, 0, C.redUi, 14), { x: 1260, y: 730, o: fk });
      out += g(badge('ひとや くるまから とおい', { fill: C.redUi, size: 38 }), { x: 1570, y: 620, o: fk });
    }
    out += pop(`<rect x="-120" y="-70" width="240" height="70" rx="22" fill="#e07a5f"/><rect x="-70" y="-120" width="130" height="60" rx="18" fill="#e07a5f"/><rect x="-55" y="-108" width="45" height="38" rx="6" fill="#cfe8f5"/><rect x="0" y="-108" width="45" height="38" rx="6" fill="#cfe8f5"/><circle cx="-70" cy="0" r="26" fill="#333"/><circle cx="70" cy="0" r="26" fill="#333"/>`, t, cue(1) + 2.2, 1260, 836);
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
      const CX = 960, CY = 330, NX = -560;
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, '1ぽんの でんせんだけに とまっている', { size: 56, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['1ぽんの うえは たかい ひくいが ない', C.blueUi], ['からだを でんきが とおらない', C.accent]], t, 960, 600, { start: 2.4, step: 0.9, size: 36, gap: 28 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const ic = (inner) => `<rect x="-62" y="-46" width="124" height="92" rx="16" fill="${SKY.dayMid}"/>` + inner;
      const items = [
        [ic(wirePath(-60, 10, 60, 10, 4, { w: 4 }) + bird(0, 12, 0.3, t, { dir: 1 })), 'でんせんの とりを みつける', C.ink, cue(1)],
        [ic(wirePath(-60, -14, 60, -14, 3, { w: 4 }) + wirePath(-60, 22, 60, 22, 3, { w: 4 }) + bird(0, 24, 0.26, t, { dir: -1, col: '#6f6a62' })), '1ぽんだけに とまっているか', C.ink, cue(2)],
        [ic(`<rect x="-6" y="-46" width="12" height="92" fill="${POLE}"/>` + [-30, -6, 18, 36].map((y, i) => `<line x1="-62" y1="${y}" x2="62" y2="${y + 4}" stroke="${WIRE}" stroke-width="${i === 3 ? 6 : 3}"/>`).join('')), 'せんが なんだん あるか かぞえる', C.ink, cue(3)],
        [warnIcon, 'でんせんや でんちゅうに さわらない', C.red, cue(4)],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(g(icn, { s: 0.8 }) + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, st, 230, 330 + i * 135); });
      const mO = prog(t, cue(1) + 0.4, 0.5);
      if (mO > 0) {
        let m = `<rect x="-260" y="-280" width="520" height="520" rx="36" fill="${SKY.dayMid}"/>` + `<rect x="-200" y="-260" width="26" height="500" fill="${POLE}"/>`;
        [-180, -120, -60, 40].forEach((y, i) => { m += wirePath(-188, y, 260, y + 20, 18, { w: i === 3 ? 10 : 5 }); });
        m += bird(20, wireY(-188, -60, 260, -40, 18, 20) - 2, 0.5, t, { dir: 1 }) + bird(150, wireY(-188, -60, 260, -40, 18, 150) - 2, 0.5, t, { dir: -1, col: '#6f6a62', blink: 1 });
        b += g(m, { x: 1480, y: 500, o: mO, s: lerp(0.9, 1, eo(mO)) });
      }
      b += kidShow('K', t, 1790, 850, { s: 0.5, start: cue(1) + 0.8, n: 1, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「でんちゅうと でんせん」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

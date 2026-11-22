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
const TOPIC = 'セミ';
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
// みのまわり図鑑「セミは、どうして 夏に なくの？」（もとの記事：everyday-trivia trivia/cicada-summer-song.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 色は図鑑の絵（assets/figures-cicada.js）とそろえる
const CC = {
  body: '#3d3a30', belly: '#6b5f45', wing: '#e6f0f3', vein: '#5f6b66', eye: '#c9b98a', brownw: '#a07a52',
  bark: '#9a7652', bark2: '#7d5d3f', soil: '#b08c62', soil2: '#8f6d48', soil3: '#cfae82', root: '#e0c897', rootDk: '#bfa06a',
  leaf: '#5e9b6e', leaf2: '#4f8a5f', air: '#dceef4', muscle: '#d07a68', muscleDk: '#a04a3a', mem: '#f6e7a8', memLine: '#d9a92e',
  sap: '#4f8fc8', sound: '#e8862f', larva: '#a8794a', larvaDk: '#6e4c2c', shell: '#c9a066',
};

// ---------- セミの道具 ----------
// 横から見たセミ（左向き。flip で右向き）。(x, y) は体のまん中
function cicadaSide(x, y, s = 1, { flip = false, r = 0, wing = 'clear' } = {}) {
  const wf = wing === 'brown' ? `fill="${CC.brownw}" fill-opacity="0.92"` : `fill="${CC.wing}" fill-opacity="0.88"`;
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})">
    <path d="M-14 8l-6 12M-6 9l-2 13M2 9l6 12" fill="none" stroke="${CC.body}" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="14" cy="2" rx="22" ry="9" fill="${CC.body}"/>
    <path d="M2 -5v14M10 -6v16M18 -6v16M26 -4v12" stroke="${CC.belly}" stroke-width="1.2"/>
    <ellipse cx="-12" cy="-1" rx="12" ry="11" fill="${CC.body}"/>
    <ellipse cx="-27" cy="1" rx="7" ry="8" fill="${CC.body}"/>
    <circle cx="-29" cy="-4" r="3.6" fill="${CC.eye}" stroke="#2a281f" stroke-width="1"/>
    <path d="M-26 8l10 7" stroke="${CC.body}" stroke-width="2" stroke-linecap="round"/>
    <path d="M-14 -10C10 -24 50 -20 62 -6C46 2 14 2 -12 -3Z" ${wf} stroke="${CC.vein}" stroke-width="1.1"/>
    <path d="M-8 -8C14 -14 38 -14 56 -7M6 -12l4 8M24 -15l2 10M40 -14l0 9" fill="none" stroke="${CC.vein}" stroke-width="0.8"/>
  </g>`;
}
// 木にとまったセミを上から見たところ（頭が上）。col：体の色、wk：はねののびぐあい 0〜1
function cicadaTop(x, y, s = 1, { wing = 'clear', col = CC.body, wk = 1, o = 1 } = {}) {
  const wf = wing === 'brown' ? `fill="${CC.brownw}" fill-opacity="0.92"` : `fill="${CC.wing}" fill-opacity="0.88"`;
  const W = wk <= 0.02 ? '' : `<g transform="translate(0 -8) scale(${lerp(0.6, 1, wk)} ${lerp(0.25, 1, wk)}) translate(0 8)">
      <path d="M-2 -10C-16 0 -18 30 -9 46C-4 38 -2 18 -1 -6Z" ${wf} stroke="${CC.vein}" stroke-width="1"/>
      <path d="M2 -10C16 0 18 30 9 46C4 38 2 18 1 -6Z" ${wf} stroke="${CC.vein}" stroke-width="1"/></g>`;
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}">
    <path d="M-8 -12l-12 -6M8 -12l12 -6M-8 -4l-13 4M8 -4l13 4" stroke="${col}" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="0" cy="8" rx="9" ry="20" fill="${col}"/>${W}
    <ellipse cx="0" cy="-14" rx="11" ry="9" fill="${col}"/>
    <ellipse cx="0" cy="-25" rx="12" ry="5" fill="${col}"/>
    <circle cx="-12" cy="-25" r="4" fill="${CC.eye}" stroke="#2a281f" stroke-width="1"/><circle cx="12" cy="-25" r="4" fill="${CC.eye}" stroke="#2a281f" stroke-width="1"/>
  </g>`;
}
// 下から見たセミ（頭が上）。ear：耳（こまく）の光りぐあい 0〜1
function cicadaUnder(x, y, s = 1, ear = 0) {
  const e = (cx) => `<ellipse cx="${cx}" cy="-8" rx="${4 + ear * 1.2}" ry="${5 + ear * 1.2}" fill="${mix('#f3e7c4', '#ffd23a', ear)}" stroke="${CC.memLine}" stroke-width="1.2"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-2 -60C-18 -40 -20 20 -9 56C-4 40 -2 0 -1 -40Z" fill="${CC.wing}" fill-opacity="0.88" stroke="${CC.vein}" stroke-width="1"/>
    <path d="M2 -60C18 -40 20 20 9 56C4 40 2 0 1 -40Z" fill="${CC.wing}" fill-opacity="0.88" stroke="${CC.vein}" stroke-width="1"/>
    <ellipse cx="0" cy="-48" rx="13" ry="6" fill="${CC.body}"/><circle cx="-13" cy="-48" r="4" fill="${CC.eye}"/><circle cx="13" cy="-48" r="4" fill="${CC.eye}"/>
    <ellipse cx="0" cy="-30" rx="12" ry="14" fill="${CC.body}"/>
    <path d="M0 -40v18" stroke="${CC.belly}" stroke-width="2"/>
    <path d="M-10 -32l-14 -8M10 -32l14 -8M-10 -24l-15 4M10 -24l15 4M-9 -18l-12 12M9 -18l12 12" stroke="${CC.body}" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="0" cy="12" rx="11" ry="30" fill="${CC.body}"/>
    <path d="M-9 2h18M-10 12h20M-9 22h18M-7 32h14" stroke="${CC.belly}" stroke-width="1.1"/>
    ${ear > 0.02 ? `<circle cx="0" cy="-8" r="${14 + ear * 4}" fill="#ffd23a" opacity="${0.45 * ear}"/>` : ''}${e(-5)}${e(5)}
  </g>`;
}
// 幼虫（左向き。flip で右向き）。(x, y) は体のまん中
function larva(x, y, s = 1, { flip = false, r = 0, c = CC.larva, o = 1, walk = 0 } = {}) {
  const w = Math.sin(walk) * 2.5;
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})" opacity="${o}">
    <path d="M-10 8l${-8 + w} 8M-2 9l${-3 - w} 10M6 9l${5 + w} 9" fill="none" stroke="${CC.larvaDk}" stroke-width="2" stroke-linecap="round"/>
    <path d="M-8 9l-12 2l-4 -4" fill="none" stroke="${CC.larvaDk}" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="10" cy="2" rx="16" ry="9" fill="${c}"/>
    <path d="M4 -6v15M11 -7v17M18 -5v14" stroke="${mix(c, '#3d2b1a', 0.4)}" stroke-width="1"/>
    <ellipse cx="-8" cy="0" rx="11" ry="9" fill="${c}"/>
    <ellipse cx="-20" cy="2" rx="6" ry="7" fill="${c}"/>
    <circle cx="-21" cy="-1" r="2.2" fill="#3d2b1a"/>
  </g>`;
}
// おんぷ
const note = (x, y, s = 1, c = CC.sound, o = 1) => o <= 0.01 ? '' : `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="5" ry="4" transform="rotate(-20)" fill="${c}"/><path d="M4 -1v-16l7 4" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></g>`;
// 音の波（(x, y) から dir の向きへ広がる）
function soundWaves(x, y, t, { dir = 1, n = 3, r0 = 30, step = 40, col = CC.sound, w = 8, o = 1, speed = 1.4, a = 0.7 } = {}) {
  if (o <= 0.01) return '';
  let out = '';
  for (let i = 0; i < n; i++) {
    const f = (((t * speed + i / n) % 1) + 1) % 1, r = r0 + f * step * n;
    const x1 = x + dir * r * Math.cos(a), y1 = y - r * Math.sin(a), y2 = y + r * Math.sin(a);
    out += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${dir > 0 ? 1 : 0} ${x1.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${(o * Math.sin(f * Math.PI)).toFixed(3)}"/>`;
  }
  return out;
}
// ふわふわのぼるおんぷ
function notesUp(x, y, t, { n = 4, spread = 200, rise = 220, s = 3, o = 1, col = CC.sound } = {}) {
  if (o <= 0.01) return '';
  let out = '';
  for (let i = 0; i < n; i++) {
    const f = (t * 0.45 + i / n) % 1, sd = i % 2 ? 1 : -1;
    out += note(x + sd * (spread * 0.5 + f * spread * 0.5 + rnd(i, 41) * 40), y - f * rise + Math.sin(t * 3 + i) * 8, s * (0.8 + rnd(i, 42) * 0.4), col, o * Math.sin(f * Math.PI));
  }
  return out;
}
// 木のみき（まん中 x、上 y0 〜 下 y1）
function trunk(x, y0, y1, w, col = CC.bark, col2 = CC.bark2) {
  let o = `<rect x="${x - w / 2}" y="${y0}" width="${w}" height="${y1 - y0}" fill="${col}"/>`;
  const n = Math.max(3, Math.round((y1 - y0) / 90));
  for (let i = 0; i < n; i++) {
    const lx = x - w / 2 + w * (0.18 + rnd(i, 51) * 0.64), ly = y0 + (y1 - y0) * (i + 0.2 + rnd(i, 52) * 0.4) / n, len = Math.min(40 + rnd(i, 53) * 60, y1 - ly - 14);
    if (len < 12) continue;
    o += `<path d="M ${lx} ${ly} v ${len}" stroke="${col2}" stroke-width="${Math.max(4, w * 0.04)}" stroke-linecap="round"/>`;
  }
  return o;
}
// 白いふちの字
const olText = (x, y, str, { size = 44, fill = '#fff', ol = '#3d3a30', sw = 10, anchor = 'middle' } = {}) =>
  text(x, y, str, { size, w: 900, fill, anchor, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });
// 指し線
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;

// 1. つかみ：夏の公園のセミの声 → 冬は聞こえない
const HOOK_TREE = { x: 1270, gy: 850, ty: 330 };
function hookTree(bare) {
  const { x, gy, ty } = HOOK_TREE;
  let o = '';
  // えだ（冬に見える）
  o += `<path d="M ${x} ${ty + 30} L ${x - 190} ${ty - 150} M ${x} ${ty + 30} L ${x + 200} ${ty - 130} M ${x} ${ty + 30} L ${x + 10} ${ty - 260} M ${x - 110} ${ty - 76} L ${x - 250} ${ty - 110} M ${x + 120} ${ty - 66} L ${x + 150} ${ty - 230} M ${x + 6} ${ty - 120} L ${x - 110} ${ty - 250}" fill="none" stroke="${CC.bark}" stroke-width="34" stroke-linecap="round"/>`;
  o += trunk(x, ty, gy, 190);
  if (bare < 0.99) o += `<g opacity="${1 - bare}">` + [[0, -170, 240], [-200, -70, 165], [200, -70, 165], [-100, -290, 150], [110, -280, 150]].map(([dx, dy, r], i) => `<circle cx="${x + dx}" cy="${ty + dy}" r="${r}" fill="${i % 2 ? CC.leaf2 : CC.leaf}"/>`).join('') + `</g>`;
  return o;
}
const FLAKES = Array.from({ length: 30 }, (_, i) => [rnd(i, 61) * 1920, rnd(i, 62) * 1080, 0.6 + rnd(i, 63) * 0.8]);
SCENES.push({
  id: 'hook',
  draw(t) {
    const c1 = cue(1), c3 = cue(3);
    const wk = eio(prog(t, c1 - 0.2, 1.3)) * (1 - eio(prog(t, c3 - 0.3, 1.0)));   // 冬のぐあい
    const sing = 1 - clamp(wk * 3);
    let out = skyRect('skh', 0) + `<rect width="1920" height="1080" fill="#e6ecf2" opacity="${0.85 * wk}"/>`;
    out += g(sunDisc(330, 170, 72, 0), { o: 1 - 0.7 * wk });
    out += cloud(((700 + t * 16) % 2300) - 180, 210, 0.8, '#fff', 0.9) + cloud(((1700 + t * 12) % 2300) - 180, 150, 0.6, '#fff', 0.85);
    out += `<path d="M 0 790 Q 420 700 860 770 T 1920 740 L 1920 1080 L 0 1080 Z" fill="${mix('#93cf8c', '#eef2f5', wk)}"/>`;
    out += hookTree(wk);
    out += `<path d="M 0 880 Q 620 810 1240 890 T 1920 860 L 1920 1080 L 0 1080 Z" fill="${mix('#5fae5f', '#dfe6ec', wk)}"/>`;
    // 木にとまって鳴くセミ
    const { x: TX } = HOOK_TREE, CY = 610;
    out += g(cicadaTop(0, 0, 3.4), { x: TX, y: CY + Math.sin(t * 30) * 1.2 * sing, o: sing });
    out += soundWaves(TX + 110, CY, t, { dir: 1, n: 3, r0: 30, step: 60, o: sing, w: 10 }) + soundWaves(TX - 110, CY, t, { dir: -1, n: 3, r0: 30, step: 60, o: sing, w: 10 });
    out += notesUp(TX, CY - 60, t, { n: 4, spread: 330, rise: 200, s: 3.2, o: sing });
    out += g(olText(0, 0, 'ミーン ミン', { size: 66, fill: CC.sound, ol: '#fffaf0', sw: 14 }), { x: 800, y: 430 + Math.sin(t * 5) * 6, s: 1 + Math.sin(t * 9) * 0.03, o: sing * prog(t, 0.6, 0.4) });
    // 冬：しーん
    if (wk > 0) {
      FLAKES.forEach(([x0, y0, s], i) => {
        const y = (y0 + t * 80 * s) % 1080, x = x0 + Math.sin(t * 1.2 + i) * 24;
        out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${5 * s}" fill="#fff" opacity="${0.9 * wk}"/>`;
      });
      out += g(text(0, 0, 'しーん…', { size: 72, w: 900, fill: '#8090a0' }), { x: 850, y: 380, o: wk * prog(t, c1 + 1.2, 0.5) });
    }
    // 子どもたち（木を見上げる）
    const eyes = wk > 0.5 ? 'wide' : 'open';
    out += kidShow('S', t, 250, 880, { s: 0.5, start: 0, n: 0, eyes, look: [7, -6] });
    out += kidShow('B', t, 440, 880, { s: 0.5, start: 0, n: 1, eyes, look: [7, -6], bubble: false });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 250);
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#8a5a2c">セミ</tspan>は、</text>`, { x: 960, y: 430, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="#e0662c">夏</tspan>に なくの？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = cicadaSide(0, 0, 3.4, { flip: true }) + soundWaves(120, -6, t, { dir: 1, n: 3, r0: 20, step: 34, w: 8 }) + note(-150, -70, 3.4) + note(-230, -20, 2.6);
      out += pop(ic, t, t0 + 1.8, 960, 850);
    }
    return out;
  },
});

// 2. 予想：夏になる前、どこにいた？
const GUESS_ICON = [
  // 南の国（太陽とヤシの木の島）
  `<circle cx="-38" cy="-30" r="20" fill="${C.yellow}"/><ellipse cx="6" cy="40" rx="58" ry="13" fill="#ecd9a6"/><path d="M 10 38 Q 2 4 16 -22" fill="none" stroke="#8a6a4a" stroke-width="9" stroke-linecap="round"/><path d="M 16 -22 q -30 -14 -46 6 M 16 -22 q 30 -18 48 2 M 16 -22 q -8 -30 -34 -30 M 16 -22 q 14 -28 40 -24" fill="none" stroke="#3f9a55" stroke-width="9" stroke-linecap="round"/>`,
  // 木のあな
  `<rect x="-40" y="-54" width="80" height="108" rx="8" fill="${CC.bark}"/><path d="M -20 -40 v 22 M 22 14 v 26" stroke="${CC.bark2}" stroke-width="5" stroke-linecap="round"/><ellipse cx="0" cy="2" rx="24" ry="30" fill="#3a2a1c"/>${text(44, -40, 'z', { size: 30, w: 900, fill: C.muted })}${text(62, -62, 'z', { size: 22, w: 900, fill: C.muted })}`,
  // 土の中
  `<rect x="-56" y="-30" width="112" height="84" rx="10" fill="${CC.soil}"/><rect x="-56" y="-42" width="112" height="20" rx="8" fill="#6fba68"/><circle cx="-34" cy="30" r="4" fill="${CC.soil2}"/><circle cx="36" cy="-4" r="4" fill="${CC.soil2}"/><circle cx="30" cy="36" r="3" fill="${CC.soil2}"/>${text(0, 14, '？', { size: 44, w: 900, fill: '#fffaf0' })}`,
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(cicadaSide(-560, -4, 2.4, { flip: true }) + note(-440, -40, 2.4) + text(40, 0, 'なつの まえ、どこに いた？', { size: 66, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'みなみの くにへ とんで いって いた'], ['②', 'きの あなの なかで ねむって いた'], ['③', 'つちの なかで くらして いた']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 48, w: 700, anchor: 'start' }) + g(GUESS_ICON[i], { x: 500, y: 0, s: 0.95 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 330, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 鳴いているのはオスだけ
SCENES.push({
  id: 'male',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = `<rect width="1920" height="1080" fill="#eaf5ee"/>` + topBadge();
    // 葉っぱとえだ
    [[140, 250, -20], [330, 170, 15], [1560, 200, -30], [1790, 300, 10], [960, 120, 0], [1180, 180, 25], [700, 200, -15]].forEach(([x, y, r], i) => {
      out += `<g transform="translate(${x} ${y + Math.sin(t * 1.4 + i) * 5}) rotate(${r + Math.sin(t * 1.1 + i) * 4})"><path d="M -70 0 Q 0 -44 70 0 Q 0 44 -70 0 Z" fill="${i % 2 ? '#bfe0c2' : '#cfe8cf'}"/></g>`;
    });
    out += `<path d="M -40 668 Q 700 630 1960 690" fill="none" stroke="${CC.bark}" stroke-width="64" stroke-linecap="round"/><path d="M -40 650 Q 700 612 1960 672" fill="none" stroke="#b08a62" stroke-width="10" stroke-linecap="round" opacity="0.7"/>`;
    const MX = 590, MY = 508, FX = 1330, FY = 516, S = 5.4;
    const singT = c0 + d0 * 0.42, sing = prog(t, singT, 0.4);
    // オス（右向き＝メスのほうを向く）
    out += pop(cicadaSide(0, 0, S, { flip: true }), t, 0.2, MX, MY + Math.sin(t * 28) * 1.2 * sing);
    // メス（左向き）
    const hear = prog(t, c1 + d1 * 0.3, 0.4) * (1 - prog(t, c2 - 0.2, 0.3));
    out += pop(cicadaSide(0, 0, S), t, 0.4, FX, FY - Math.abs(Math.sin(t * 5)) * 6 * hear);
    // はじめは、どっちが鳴いているかわからない
    const qO = win(t, 0.6, singT, 0.25);
    out += g(text(0, 0, '？', { size: 110, w: 900, fill: C.ochre }), { x: MX, y: 300, o: qO }) + g(text(0, 0, '？', { size: 110, w: 900, fill: C.ochre }), { x: FX, y: 300, o: qO });
    out += pop(badge('オス', { fill: C.accent, size: 54, pad: 46 }), t, singT, MX, 300);
    out += pop(badge('メス', { fill: C.ochre, size: 54, pad: 46 }), t, singT + 0.4, FX, 300);
    // オスの声
    const toF = prog(t, c1 - 0.2, 0.5);
    out += soundWaves(MX + 200, MY - 6, t, { dir: 1, n: 4, r0: 30, step: lerp(34, 68, toF), o: sing, w: 10 });
    out += notesUp(MX - 40, MY - 150, t, { n: 3, spread: 260, rise: 150, s: 3, o: sing * (1 - toF * 0.5) });
    out += pop(badge('なく', { fill: C.accent, size: 44 }), t, singT + 0.6, MX + 150, 770);
    out += pop(badge('ここに いるよ！', { fill: '#e0782c', size: 48 }), t, c1 + d1 * 0.3, 960, 400, { end: c2 - 0.1 });
    // メスは鳴かない
    out += pop(badge('なかない', { fill: '#7f8a94', size: 44 }), t, c2 + 0.2, FX, 770);
    // 音を出すしくみはオスにしかない
    const mk = c2 + d2 * 0.42;
    const ring = prog(t, mk, 0.4);
    if (ring > 0) {
      const bx = MX - 14 * S, by = MY + 12, pr = 74 + Math.sin(t * 6) * 5;
      out += g(`<circle r="${pr}" fill="${C.yellow}" opacity="0.28"/><circle r="${pr}" fill="none" stroke="${C.yellow}" stroke-width="10"/>`, { x: bx, y: by, o: ring });
      out += pointer(bx - 30, 770 - 44, bx - 6, by + 78, '#9a7a1a', ring);
      const fx = FX + 14 * S, fk = prog(t, mk + 0.7, 0.4);
      out += g(`<circle r="74" fill="none" stroke="#8a949c" stroke-width="8" stroke-dasharray="16 14"/>` + cross(0, 0, 0.42, '#8a949c'), { x: fx, y: FY + 12, o: fk });
    }
    out += pop(badge('おとを だす しかけ', { fill: '#9a7a1a', size: 38 }), t, mk + 0.2, MX - 190, 770);
    return out;
  },
});

// 4. 音は、おなかの太鼓
// おなかの中（切り口）。pull：筋肉が膜を引くぐあい 0〜1。まん中が (0, 0)
function bellyCut(pull) {
  const L = -400, b = lerp(-64, 58, pull), mx = L + b / 2;
  let o = `<path d="M ${L} -190 L 210 -190 A 190 190 0 0 1 210 190 L ${L} 190 Z" fill="${CC.air}"/>`;
  // 筋肉（膜のまん中から、おなかの下がわへ）
  const ax = -130, ay = 172, mw = lerp(44, 66, pull);
  o += `<line x1="${mx + 8}" y1="0" x2="${ax}" y2="${ay}" stroke="${CC.muscleDk}" stroke-width="${mw + 8}" stroke-linecap="round"/><line x1="${mx + 8}" y1="0" x2="${ax}" y2="${ay}" stroke="${CC.muscle}" stroke-width="${mw}" stroke-linecap="round"/>`;
  for (let i = 1; i < 5; i++) { const f = i / 5, px = lerp(mx + 8, ax, f), py = lerp(0, ay, f); o += `<line x1="${px - 10}" y1="${py - mw * 0.36}" x2="${px + 14}" y2="${py + mw * 0.36}" stroke="${CC.muscleDk}" stroke-width="4" opacity="0.55" stroke-linecap="round"/>`; }
  o += `<path d="M ${L} -190 L 210 -190 A 190 190 0 0 1 210 190 L ${L} 190" fill="none" stroke="${CC.body}" stroke-width="30" stroke-linejoin="round" stroke-linecap="round"/>`;
  o += `<path d="M ${L} -190 L ${L} -128 M ${L} 128 L ${L} 190" stroke="${CC.body}" stroke-width="30" stroke-linecap="round"/>`;
  // 膜（引かれると内がわへへこむ）
  o += `<path d="M ${L} -128 Q ${L + b} 0 ${L} 128 Z" fill="${CC.mem}"/><path d="M ${L} -128 Q ${L + b} 0 ${L} 128" fill="none" stroke="${CC.memLine}" stroke-width="16" stroke-linecap="round"/>`;
  [-70, 0, 70].forEach(y => { const k = 1 - (y / 128) * (y / 128); o += `<line x1="${L + b * 0.5 * k - 16}" y1="${y}" x2="${L + b * 0.5 * k + 16}" y2="${y}" stroke="#a87f1c" stroke-width="7" stroke-linecap="round"/>`; });
  return o;
}
// たいこ。hit：バチが当たるぐあい 0〜1。まん中が (0, 0)
function taiko(hit) {
  let o = `<rect x="-120" y="-40" width="240" height="150" rx="18" fill="#c9483a"/><ellipse cx="0" cy="110" rx="120" ry="26" fill="#a83a2e"/><rect x="-120" y="-40" width="240" height="150" fill="#c9483a"/>`;
  o += `<ellipse cx="0" cy="-40" rx="120" ry="${32 - hit * 5}" fill="#f6ecc8" stroke="#8a6a3a" stroke-width="7"/>`;
  [-90, -45, 0, 45, 90].forEach(x => { o += `<circle cx="${x}" cy="${-4 + Math.sqrt(1 - (x / 120) * (x / 120)) * 26}" r="7" fill="#3a2a1c"/>`; });
  const a = lerp(-34, 0, hit);
  o += `<g transform="translate(26 -52) rotate(${a})"><line x1="0" y1="0" x2="150" y2="-130" stroke="#b0835a" stroke-width="18" stroke-linecap="round"/><circle cx="4" cy="-4" r="15" fill="#8a5a2c"/></g>`;
  if (hit > 0.6) o += `<path d="M -50 -84 l -14 -22 M 0 -92 l 0 -26 M -90 -66 l -24 -12" stroke="${CC.sound}" stroke-width="7" stroke-linecap="round" opacity="${(hit - 0.6) / 0.4}"/>`;
  return o;
}
SCENES.push({
  id: 'drum',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, cb = cue(1), c1 = cue(2), d1 = cueE(2) - c1, c2 = cue(3), c3 = cue(4), d3 = cueE(4) - c3;
    let out = PAPER + topBadge();
    // A：のどではなく、おなか
    const aO = 1 - prog(t, c1 - 0.6, 0.4);
    if (aO > 0) {
      const CX = 856, CY = 470, S = 8.4;
      let a = pop(cicadaSide(0, 0, S), t, 0.2, CX, CY);
      const nk = c0 + d0 * 0.4;
      a += g(cross(0, 0, 0.6, '#8a949c'), { x: CX - 26 * S, y: CY + 20, o: prog(t, nk, 0.25), s: lerp(1.5, 1, eo(prog(t, nk, 0.3))) });
      a += pop(badge('のどでは ない', { fill: '#7f8a94', size: 42 }), t, nk + 0.2, CX - 26 * S - 110, 720);
      const bk = cb + 0.2, ring = prog(t, bk, 0.4);
      const bx = CX + 14 * S, by = CY + 16, pr = 118 + Math.sin(t * 6) * 6;
      a += g(`<circle r="${pr}" fill="${C.yellow}" opacity="0.25"/><circle r="${pr}" fill="none" stroke="${C.yellow}" stroke-width="14"/>`, { x: bx, y: by, o: ring, s: Math.max(back(ring), 0.001) });
      a += pop(badge('おなかで おとを だす', { fill: C.accent, size: 46 }), t, bk + 0.3, bx + 110, 720);
      out += g(a, { o: aO });
    }
    // B：おなかの中。筋肉が膜を引くと、カチッ
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      const BX = lerp(960, 780, eio(prog(t, c3 - 0.6, 0.7))), BY = 470, P = 1.0, s0 = c1 + d1 * 0.3;
      const ph = t > s0 ? ((t - s0) % P) / P : -1;
      const pull = ph < 0 ? 0 : ph < 0.14 ? eo(ph / 0.14) : ph < 0.45 ? 1 : ph < 0.65 ? 1 - eio((ph - 0.45) / 0.2) : 0;
      const click = ph < 0.1 ? 0 : clamp(1 - (ph - 0.1) / 0.45);
      const res = prog(t, c2 + 0.2, 0.6), loud = prog(t, c3 + d3 * 0.3, 0.6);
      let b = g(bellyCut(pull), { x: BX, y: BY });
      // おなかの中でひびく音
      if (ph >= 0.1) for (let i = 0; i < 4; i++) {
        const f = (ph - 0.1) / 0.9 + i * 0.16; if (f > 1) continue;
        const x = BX - 300 + f * 720, h = 80 + 60 * Math.sin(f * Math.PI);
        b += `<path d="M ${x} ${BY - h} Q ${x + 46} ${BY} ${x} ${BY + h}" fill="none" stroke="${CC.sound}" stroke-width="${lerp(6, 11, res)}" stroke-linecap="round" opacity="${(lerp(0.3, 0.9, res) * Math.sin(f * Math.PI) * (1 - i * 0.2)).toFixed(3)}"/>`;
      }
      // カチッ
      b += g(`<path d="M 40 -60 L 86 -92 M 52 0 L 108 0 M 40 60 L 86 92" stroke="${CC.sound}" stroke-width="9" stroke-linecap="round" transform="scale(-1 1)"/>` + olText(-190, -4, 'カチッ', { size: 66, fill: CC.sound, ol: '#fffaf0', sw: 14 }), { x: BX - 420, y: BY, o: click, s: lerp(0.9, 1.08, click) });
      // 名前
      b += pop(badge('まく', { fill: '#b8862a', size: 42 }), t, c1 + 0.5, BX - 530, 250) + pointer(BX - 500, 290, BX - 414, BY - 110, '#b8862a', prog(t, c1 + 0.7, 0.3));
      b += g(olText(0, 0, 'きんにく', { size: 44, fill: CC.muscleDk, ol: '#fffaf0', sw: 12 }), { x: BX - 160, y: 500, o: prog(t, c1 + d1 * 0.15, 0.3) });
      b += pop(olText(0, -28, 'なかは からっぽ', { size: 54, fill: C.blueUi, ol: '#fffaf0', sw: 14 }) + olText(0, 40, '（くうき）', { size: 40, fill: C.blueUi, ol: '#fffaf0', sw: 12 }), t, c2 + 0.3, BX + 100, 410);
      // 大きくなって外へ
      b += soundWaves(BX + 440, BY, t, { dir: 1, n: 3, r0: 20, step: lerp(22, 40, loud), o: res * 0.9, w: lerp(8, 13, loud) });
      // たいこ
      const tk = c3 + 0.1, hit = ph < 0 ? 0 : ph < 0.1 ? eo(ph / 0.1) : ph < 0.3 ? 1 - (ph - 0.1) / 0.2 : 0;
      b += pop(taiko(hit), t, tk, 1530, 340, { s: 1.25 });
      b += g(text(1530, 392, 'どう＝おなか', { size: 36, w: 900, fill: '#fff' }), { o: prog(t, tk + 1.0, 0.3) });
      b += g(text(1310, 208, 'かわ＝まく', { size: 36, w: 900, fill: '#8a6a1c' }) + `<line x1="1340" y1="234" x2="1392" y2="276" stroke="#8a6a1c" stroke-width="5" stroke-linecap="round"/>`, { o: prog(t, tk + 0.7, 0.3) });
      b += g(text(1790, 236, 'バチ＝', { size: 36, w: 900, fill: CC.muscleDk }) + text(1790, 282, 'きんにく', { size: 36, w: 900, fill: CC.muscleDk }), { o: prog(t, tk + 0.4, 0.3) });
      out += g(b, { o: bO });
      // カメレオン
      out += kidShow('K', t, 1560, 850, { s: 0.75, start: cue(5) - 0.9, n: 0, bubble: false });
      out += talkBubble('K', 1610, 610, 1636, 722, 46);
    }
    return out;
  },
});

// 5. メスは、おなかの耳で聞いている
SCENES.push({
  id: 'ears',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1;
    let out = `<rect width="1920" height="1080" fill="#eaf5ee"/>` + topBadge();
    // A：オスの声が、メスにとどく
    const aO = 1 - prog(t, c1 - 0.5, 0.4);
    if (aO > 0) {
      let a = `<path d="M -40 650 Q 700 612 1960 672" fill="none" stroke="${CC.bark}" stroke-width="60" stroke-linecap="round"/>`;
      a += cicadaSide(470, 498 + Math.sin(t * 28) * 1.2, 5, { flip: true }) + cicadaSide(1420, 506, 5);
      a += soundWaves(660, 492, t, { dir: 1, n: 5, r0: 30, step: 74, w: 10 });
      a += g(badge('オス', { fill: C.accent, size: 46 }), { x: 470, y: 320 }) + g(badge('メス', { fill: C.ochre, size: 46 }), { x: 1420, y: 320 });
      const hk = prog(t, c0 + d0 * 0.45, 0.4), pr = 60 + Math.sin(t * 7) * 6;
      a += g(`<circle r="${pr}" fill="#ffd23a" opacity="0.35"/><circle r="${pr}" fill="none" stroke="#f0b400" stroke-width="9"/>`, { x: 1420 + 2 * 5, y: 506 + 44, o: hk });
      a += pop(badge('きいて いる', { fill: '#b8862a', size: 46 }), t, c0 + d0 * 0.45 + 0.2, 1420, 770);
      out += g(a, { o: aO });
    }
    // B：下から見ると、おなかのつけねに耳
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      const ear = 0.55 + 0.45 * Math.sin(t * 5), S = 4.6, Y = 490, X1 = 620, X2 = 1300;
      let b = pop(badge('したから みた ところ', { fill: C.blueUi, size: 40 }), t, c1, 960, 170);
      b += pop(cicadaUnder(0, 0, S, ear), t, c1 + 0.1, X1, Y) + pop(cicadaUnder(0, 0, S, ear), t, c1 + 0.3, X2, Y);
      b += g(badge('オス', { fill: C.accent, size: 44 }), { x: X1 - 230, y: 300, o: prog(t, c1 + 0.5, 0.3) }) + g(badge('メス', { fill: C.ochre, size: 44 }), { x: X2 + 230, y: 300, o: prog(t, c1 + 0.7, 0.3) });
      const lk = prog(t, c1 + d1 * 0.2, 0.4), ey = Y - 8 * S;
      b += pointer(880, ey, X1 + 46, ey, '#b8862a', lk) + pointer(1040, ey, X2 - 46, ey, '#b8862a', lk);
      b += pop(olText(0, -4, 'みみ', { size: 64, fill: '#b8862a', ol: '#fffaf0', sw: 14 }) + olText(0, 56, '（こまく）', { size: 34, fill: '#b8862a', ol: '#fffaf0', sw: 10 }), t, c1 + d1 * 0.2, 960, ey);
      b += pop(badge('オスにも メスにも ある', { fill: C.accent, size: 44 }), t, c1 + d1 * 0.6, 960, 790);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 6. 土の中で何年も
const SOIL_ROOT = 'M 380 290 C 420 430 640 470 900 500 S 1480 590 1760 800';
const SEASONS = [['はる', '#f7dbe6', '#e58aa8'], ['なつ', '#bfe3f5', '#f0a020'], ['あき', '#f6dcae', '#c8602c'], ['ふゆ', '#e3e9f0', '#7f95a6']];
SCENES.push({
  id: 'soil',
  draw(t) {
    const c0 = cue(0), cp = cue(1), c1 = cue(2), c2 = cue(3), d2 = cueE(3) - c2, c3 = cue(4), d3 = cueE(4) - c3, c4 = cue(5);
    const pk = eio(prog(t, cp - 0.2, 1.6)), pan = lerp(520, 0, pk);   // はじめは地上、そのあと土の中へ
    // 季節がめぐる（土の中で何年も）
    const yr = t > c3 ? (t - c3) / 0.75 : -1, si = yr < 0 ? 1 : Math.floor(yr + 1) % 4, sf = yr < 0 ? 0 : eio(clamp(((yr % 1) - 0.7) / 0.3));
    const skyC = yr < 0 ? SEASONS[1][1] : mix(SEASONS[si][1], SEASONS[(si + 1) % 4][1], sf);
    let w = `<rect x="0" y="-700" width="1920" height="1010" fill="${skyC}"/>`;
    // 木
    w += [[0, -470, 250], [-210, -380, 170], [210, -380, 170]].map(([dx, dy, r], i) => `<circle cx="${380 + dx}" cy="${dy}" r="${r}" fill="${i ? CC.leaf2 : CC.leaf}"/>`).join('');
    w += trunk(380, -520, 300, 170);
    const sing = 1 - pk;
    w += g(cicadaTop(0, 0, 2.8), { x: 380, y: -90, o: clamp(sing * 2) }) + soundWaves(470, -90, t, { dir: 1, n: 3, r0: 26, step: 50, o: sing, w: 9 }) + soundWaves(290, -90, t, { dir: -1, n: 3, r0: 26, step: 50, o: sing, w: 9 });
    w += notesUp(380, -150, t, { n: 4, spread: 300, rise: 180, s: 3, o: sing });
    // 土
    w += `<rect x="0" y="300" width="1920" height="800" fill="${CC.soil}"/>`;
    for (let i = 0; i < 46; i++) w += `<circle cx="${rnd(i, 71) * 1920}" cy="${330 + rnd(i, 72) * 720}" r="${5 + rnd(i, 73) * 6}" fill="${CC.soil2}" opacity="0.6"/>`;
    w += `<rect x="0" y="282" width="1920" height="30" rx="12" fill="#6fba68"/>`;
    for (let i = 0; i < 24; i++) { const x = 30 + i * 82 + rnd(i, 74) * 30; if (Math.abs(x - 380) > 110) w += `<path d="M ${x} 290 l -8 -22 M ${x} 290 l 6 -26 M ${x} 290 l 16 -18" stroke="#6fba68" stroke-width="6" stroke-linecap="round"/>`; }
    // 根
    w += `<path d="M 380 290 C 330 420 240 520 110 610" fill="none" stroke="${CC.root}" stroke-width="34" stroke-linecap="round"/><path d="M 380 290 C 400 480 470 660 580 830" fill="none" stroke="${CC.root}" stroke-width="28" stroke-linecap="round"/>`;
    w += `<path d="${SOIL_ROOT}" fill="none" stroke="${CC.rootDk}" stroke-width="56" stroke-linecap="round"/><path d="${SOIL_ROOT}" fill="none" stroke="${CC.root}" stroke-width="46" stroke-linecap="round"/>`;
    const sapO = prog(t, c2 + d2 * 0.45, 0.5);
    if (sapO > 0) w += `<path d="${SOIL_ROOT}" fill="none" stroke="${CC.sap}" stroke-width="9" stroke-linecap="round" stroke-dasharray="24 26" stroke-dashoffset="${t * 70}" opacity="${sapO}"/>`;
    // 幼虫のへやと幼虫
    const lk = prog(t, c1 - 0.1, 0.5);
    if (lk > 0) {
      let l = `<ellipse cx="1010" cy="655" rx="205" ry="112" fill="${CC.soil3}"/>`;
      // はりのような口（根にさす）
      const nk = eo(prog(t, c2 + 0.2, 0.6)), nx0 = 890, ny0 = 690, nx1 = 872, ny1 = 512;
      if (nk > 0) {
        l += `<line x1="${nx0}" y1="${ny0}" x2="${lerp(nx0, nx1, nk)}" y2="${lerp(ny0, ny1, nk)}" stroke="${CC.larvaDk}" stroke-width="9" stroke-linecap="round"/>`;
        if (sapO > 0) for (let i = 0; i < 3; i++) { const f = (t * 0.9 + i / 3) % 1; l += `<circle cx="${lerp(nx1, nx0, f)}" cy="${lerp(ny1, ny0, f)}" r="7" fill="${CC.sap}" opacity="${sapO * Math.sin(f * Math.PI)}"/>`; }
      }
      l += larva(1020, 660 + Math.sin(t * 2) * 2, 6.2);
      w += g(l, { o: lk });
      w += pop(badge('ようちゅう', { fill: CC.larvaDk, size: 42 }), t, c1 + 0.3, 1340, 672);
    }
    w += g(olText(0, 0, 'きの ね', { size: 46, fill: '#6e4c2c', ol: '#fffaf0', sw: 12 }), { x: 690, y: 386, o: prog(t, c2 + d2 * 0.25, 0.3) });
    w += g(olText(0, 0, 'はりの ような くち', { size: 40, fill: CC.larvaDk, ol: '#fffaf0', sw: 12 }), { x: 600, y: 640, o: prog(t, c2 + 0.5, 0.3) }) + pointer(770, 630, 872, 600, CC.larvaDk, prog(t, c2 + 0.6, 0.3));
    w += g(olText(0, 0, 'ねが すった みず', { size: 40, fill: '#2f6fa8', ol: '#fffaf0', sw: 12 }), { x: 1590, y: 556, o: sapO });
    let out = g(w, { y: pan });
    out += topBadge();
    out += pop(card(620, 150) + text(0, 2, 'どうして なつ？', { size: 64, w: 900, fill: '#e0662c' }), t, c0 + 0.3, 1160, 400, { end: cp });
    // 何年も
    if (yr >= 0) {
      const [nm, , col] = SEASONS[(si + (sf > 0.5 ? 1 : 0)) % 4];
      out += pop(`<circle r="62" fill="#fffaf0" stroke="${col}" stroke-width="10"/>` + text(0, 3, nm, { size: 40, w: 900, fill: col }), t, c3, 700, 160);
      out += pop(`<path d="M -46 -30 A 60 60 0 1 1 -56 16" fill="none" stroke="${C.muted}" stroke-width="8" stroke-linecap="round" transform="rotate(${(t - c3) * 200})"/>`, t, c3, 700, 160, { s: 1.5 });
    }
    out += pop(card(900, 200) + text(0, -46, 'つちの なかに いる ながさ', { size: 38, w: 900, fill: C.muted }) + text(0, 30, '2ねん 〜 じゅうすうねん', { size: 66, w: 900, fill: CC.larvaDk }), t, c3 + d3 * 0.45, 1330, 160);
    out += pop(badge('「7ねん」と きまって いない', { fill: C.redUi, size: 40 }), t, c4 + 0.4, 1330, 400);
    return out;
  },
});

// 7. 夏の夜に出てきて、おとなは1か月ほど
SCENES.push({
  id: 'emerge', night: true,
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c4 = cue(4);
    const dk = eio(prog(t, c4 + 0.2, 1.8));   // 朝になるぐあい
    const GY = 790, TX = 1290;
    let out = `<linearGradient id="emsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix('#141d36', '#3f93dc', dk)}"/><stop offset="1" stop-color="${mix('#3a4a74', '#d6edfa', dk)}"/></linearGradient><rect width="1920" height="1080" fill="url(#emsky)"/>`;
    out += g(stars(31, 60), { o: 1 - dk });
    out += g(`<circle cx="1700" cy="150" r="130" fill="#fff6c8" opacity="0.16" filter="url(#glow)"/><circle cx="1700" cy="150" r="56" fill="#fff3c0"/><circle cx="1680" cy="134" r="11" fill="#ead99a"/><circle cx="1718" cy="170" r="8" fill="#ead99a"/>`, { o: 1 - dk });
    if (dk > 0) out += g(sunDisc(1700, lerp(420, 170, dk), 64, 0), { o: dk });
    // 木と地面
    const dim = 1 - dk, leaf = mix(CC.leaf, '#16263a', 0.55 * dim), bark = mix(CC.bark, '#1a1e2c', 0.4 * dim), bark2 = mix(CC.bark2, '#1a1e2c', 0.4 * dim);
    out += trunk(TX, -20, GY + 10, 190, bark, bark2);
    out += [[0, -90, 230], [-200, -50, 160], [200, -50, 160]].map(([dx, dy, r]) => `<circle cx="${TX + dx}" cy="${dy}" r="${r}" fill="${leaf}"/>`).join('');
    out += `<rect x="0" y="${GY}" width="1920" height="300" fill="${mix(CC.soil, '#1a1e2c', 0.45 * dim)}"/><rect x="0" y="${GY - 10}" width="1920" height="26" rx="10" fill="${mix('#6fba68', '#16263a', 0.5 * dim)}"/>`;
    const HX = 620;
    out += `<ellipse cx="${HX}" cy="${GY + 6}" rx="46" ry="15" fill="#2a1e14"/>`;
    // 幼虫：あなから出る → 木まで歩く → のぼる
    const S = 3.2, PY = 470;   // PY：からをぬぐ高さ
    const tA = c0 + d0 * 0.25, tB = tA + 0.9, tC = c0 + d0 * 0.68, tD = cueE(0) + 0.5;
    const shellC = mix(CC.larva, CC.shell, prog(t, c1, 0.6));
    const eT = c1 + d1 * 0.2;
    if (t < tB) {
      const k = eo(prog(t, tA, 0.9));
      out += `<clipPath id="emhole"><rect x="0" y="0" width="1920" height="${GY + 4}"/></clipPath><g clip-path="url(#emhole)">${larva(HX + 20 * k, lerp(GY + 60, GY - 30, k), S, { flip: true, r: lerp(-70, 0, k), walk: t * 14 })}</g>`;
    } else if (t < tC) {
      const k = eio(prog(t, tB, tC - tB)), x = lerp(HX + 20, TX - 150, k);
      out += larva(x, GY - 30 - Math.abs(Math.sin(t * 9)) * 4, S, { flip: true, walk: t * 14 });
    } else {
      const k = eio(prog(t, tC, tD - tC));
      // おとなが出てくる（頭が上。からの背中から上へぬけ出る）。からより先に描いて、からの後ろから出てくるように見せる
      const ek = eio(prog(t, eT, 2.2));
      if (t > eT) {
        const col = mix('#e3ecc9', CC.body, eio(prog(t, eT + 2.4, Math.max(1, c4 - eT - 2.4))));
        const ay = lerp(PY - 6, 285, ek), sing = dk;
        out += cicadaTop(TX, ay + Math.sin(t * 30) * 1.2 * sing, S, { col, wk: eio(prog(t, eT + 1.2, 1.8)), o: prog(t, eT, 0.3) });
        out += soundWaves(TX + 105, ay, t, { dir: 1, n: 3, r0: 28, step: 56, o: sing, w: 10 }) + soundWaves(TX - 105, ay, t, { dir: -1, n: 3, r0: 28, step: 56, o: sing, w: 10 });
        out += notesUp(TX, ay - 40, t, { n: 4, spread: 320, rise: 170, s: 3, o: sing });
      }
      // 木のみきへうつって、頭を上にしてのぼる（右向きの絵を -90 度まわすと頭が上）
      const x = lerp(TX - 150, TX, clamp(k * 4)), y = lerp(GY - 30, PY, clamp((k - 0.12) / 0.88)), r = lerp(0, -90, clamp(k * 5));
      out += larva(x + Math.sin(t * 9) * 2 * (k < 1 ? 1 : 0), y, S, { flip: true, r, c: shellC, walk: k < 1 ? t * 14 : 0 });
      // からの背中のわれめ
      if (t > c1) out += `<line x1="${TX - 9 * S}" y1="${PY - 17 * S}" x2="${TX - 9 * S}" y2="${PY + 1 * S}" stroke="#4a3320" stroke-width="5" stroke-linecap="round" opacity="${prog(t, c1 + 0.1, 0.3)}"/>`;
    }
    out += pop(badge('あなから でる', { fill: 'rgba(255,250,240,0.92)', color: C.ink, size: 38 }), t, tA + 0.3, HX - 60, 690, { end: tC });
    out += pop(badge('きに のぼる', { fill: 'rgba(255,250,240,0.92)', color: C.ink, size: 40 }), t, tC + 0.5, 1610, 640, { end: c1 + 0.2 });
    out += pop(badge('からを ぬぐ', { fill: 'rgba(255,250,240,0.92)', color: C.ink, size: 40 }), t, c1 + 0.3, 1610, 470, { end: c4 + 0.3 });
    out += pop(badge('おとなの セミ', { fill: C.accent, size: 42 }), t, eT + 2.0, 1620, 300, { end: c4 + 0.2 });
    out += pop(badge('ぬけがら', { fill: '#8a6a3a', size: 38 }), t, c4 + 0.6, 1590, 480);
    // 土の中の長さと、地上の長さ
    const bk = c2 + 0.2;
    if (t > bk) {
      const grow = eo(prog(t, bk + 0.4, 1.2)), g2 = eo(prog(t, bk + 1.7, 0.5));
      let c = card(1000, 300);
      c += text(-140, -92, 'つちの なか（ようちゅう）', { size: 36, w: 900, fill: CC.larvaDk });
      c += `<rect x="-450" y="-52" width="${620 * grow}" height="80" rx="14" fill="${CC.soil}"/>`;
      for (let i = 0; i < 6; i++) if (grow > (i + 0.6) / 6) c += larva(-394 + i * 100, -10, 1.6, { c: '#e0bd8a' });
      c += g(text(-180, 84, '2ねん 〜 じゅうすうねん', { size: 44, w: 900, fill: CC.larvaDk }), { o: prog(t, bk + 1.0, 0.4) });
      c += g(`<rect x="178" y="-52" width="${84 * g2}" height="80" rx="14" fill="${C.yellow}"/>` + cicadaTop(220, -14, 1.15) + text(330, -92, 'ちじょう', { size: 36, w: 900, fill: '#a86a10' }) + text(340, 66, 'すうしゅうかん〜', { size: 32, w: 900, fill: '#a86a10' }) + text(340, 108, '1かげつ ほど', { size: 40, w: 900, fill: '#a86a10' }), { o: prog(t, bk + 1.7, 0.3) });
      out += g(c, { x: 570, y: 322, o: prog(t, bk, 0.4), s: lerp(0.94, 1, eo(prog(t, bk, 0.4))) });
    }
    out += topBadge(dk < 0.5);
    out += kidShow('B', t, 300, 850, { s: 0.5, start: cue(3) - 0.9, n: 0, look: [5, -6] });
    return out;
  },
});

// 8. 鳴きはじめは、種類でちがう（東京の記録）。春に鳴くセミもいる
const SPECIES = [['ニイニイゼミ', 3, '#7d70b8', 'clear'], ['ヒグラシ', 11, '#4f86b0', 'clear'], ['ミンミンゼミ', 16, '#2e8a63', 'clear'], ['アブラゼミ', 19, '#9a6a3a', 'brown'], ['ツクツクボウシ', 28, '#d4762a', 'clear']];
const pineTree = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-7" y="0" width="14" height="70" fill="${CC.bark}"/><path d="M0 -70l-36 36h16l-28 28h20l-26 26h108l-26 -26h20l-28 -28h16Z" fill="#3f7a57"/></g>`;
SCENES.push({
  id: 'season',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    const up = eio(prog(t, c2 - 0.5, 0.8));
    out += pop(text(0, 0, 'なきはじめは、しゅるいで ちがう', { size: 60, w: 900 }), t, 0.3, 1000, 150, { end: c1 + 0.2 });
    out += pop(badge('とうきょうの きろく', { fill: C.blueUi, size: 40 }) + text(330, 2, '7がつ', { size: 60, w: 900, anchor: 'start' }), t, c1 + 0.3, 880, 150, { end: c2 - 0.4 });
    // 7月の線
    const X = d => -700 + (d - 1) * (1400 / 30);
    let tl = '';
    const ax = eo(prog(t, c1 - 0.1, 0.8));
    if (ax > 0) {
      tl += `<line x1="-700" y1="0" x2="${lerp(-700, 700, ax)}" y2="0" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>`;
      [1, 10, 20, 31].forEach(d => { if (ax > (d - 1) / 30 - 0.01) tl += `<line x1="${X(d)}" y1="-18" x2="${X(d)}" y2="18" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`; });
      tl += g(text(X(1) - 40, 56, '7/1', { size: 32, w: 900, fill: C.muted }) + text(X(31) + 40, 56, '7/31', { size: 32, w: 900, fill: C.muted }), { o: ax });
    }
    const hl = [c1 + d1 * 0.3, -1, -1, -1, c1 + d1 * 0.62];   // ナレーションで名前が出るとき
    SPECIES.forEach(([nm, d, col, wing], i) => {
      const sd = i % 2 ? 1 : -1, x = X(d), st = c0 + d0 * 0.25 + i * 0.45;
      const on = hl[i] > 0 ? win(t, hl[i], hl[i] + 2.2, 0.3) : 0;
      const cy = sd < 0 ? -120 : 85;
      let m = cicadaTop(0, cy, 1.7, { wing });
      if (on > 0) m += `<circle cx="0" cy="${cy + 20}" r="${84 + Math.sin(t * 7) * 4}" fill="none" stroke="${col}" stroke-width="9" opacity="${on}"/>`;
      m += g(badge(nm, { fill: col, size: 32, pad: 26 }), { y: sd < 0 ? -218 : 224 });
      tl += pop(m, t, st, x, 0);
      const dk2 = prog(t, c1 + 0.3 + i * 0.25, 0.3);
      tl += g(`<circle cx="${x}" cy="0" r="17" fill="#fffaf0" stroke="${col}" stroke-width="9"/>` + text(x + sd * -4, sd * -40, `7/${d}`, { size: 34, w: 900, fill: col }), { o: dk2 });
    });
    out += g(tl, { x: 960, y: lerp(520, 322, up), s: lerp(1, 0.8, up) });
    // 春に鳴くセミ（ハルゼミ）
    const sp = c2 + 0.1;
    if (t > sp - 0.1) {
      let c = card(1280, 250, { fill: '#eef5e2' });
      c += pineTree(-520, -30, 1.25) + pineTree(-400, -10, 1.0) + pineTree(-290, -34, 1.3);
      c += cicadaTop(-290, 24, 0.9) + soundWaves(-262, 22, t, { dir: 1, n: 2, r0: 12, step: 20, w: 6 });
      c += text(-170, -46, 'ハルゼミ', { size: 62, w: 900, anchor: 'start', fill: '#2f6a47' });
      c += text(-170, 48, 'まつの はやしで なく', { size: 42, w: 900, anchor: 'start' });
      c += g(badge('はる 4がつ〜6がつ', { fill: '#d96a90', size: 44 }), { x: 370, y: -46 });
      out += pop(c, t, sp, 960, 694);
    }
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
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-432, 2, 'つちの なかで くらして いた', { size: 60, w: 900, anchor: 'start' }) + g(GUESS_ICON[2].replace('？', ''), { x: 510, y: 0, s: 1.05 }) + larva(514, 14, 1.5), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['つちの なかで なんねんも', '#8a6a3a'], ['なつに でて きて おとなに', C.accent], ['ちじょうは 1かげつ ほど', '#c8602c']], t, 960, 660, { start: 2.4, step: 1.1, size: 36, gap: 28 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const sunIc = `<circle cx="-22" cy="-6" r="26" fill="${C.yellow}"/><circle cx="26" cy="12" r="26" fill="#f08a3c"/>` + note(-4, -44, 2.2);
      const shellIc = larva(0, 0, 2.3, { c: CC.shell });
      const items = [
        [sunIc, 'あさと ゆうがた、こえを ききくらべる', C.ink],
        [shellIc, 'ぬけがらと、でて きた あなを さがす', C.ink],
        [warnIcon(0.82), 'あつい ひは おとなと。ぼうしと みずも', C.red],
        [warnIcon(0.82), 'きには のぼらない。みえる たかさだけ', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // ぬけがらと、土のあな
      let p = card(420, 330) + `<clipPath id="lkc"><rect x="-210" y="-165" width="420" height="330" rx="28"/></clipPath><g clip-path="url(#lkc)"><rect x="-210" y="-165" width="420" height="330" fill="#dff0f7"/>${trunk(-70, -170, 110, 120)}<rect x="-210" y="104" width="420" height="70" fill="${CC.soil}"/><rect x="-210" y="96" width="420" height="16" fill="#6fba68"/></g>`;
      p += larva(-70, -40, 2.4, { r: 90, c: CC.shell }) + `<ellipse cx="60" cy="126" rx="26" ry="9" fill="#3a2a1c"/>`;
      p += text(96, -50, 'ぬけがら', { size: 32, w: 900, fill: '#8a6a3a' }) + `<line x1="28" y1="-48" x2="-30" y2="-44" stroke="#8a6a3a" stroke-width="5" stroke-linecap="round"/>`;
      p += text(140, 70, 'あな', { size: 32, w: 900, fill: '#5a4028' }) + `<line x1="124" y1="88" x2="84" y2="118" stroke="#5a4028" stroke-width="5" stroke-linecap="round"/>`;
      b += pop(p, t, cue(2) + 0.3, 1600, 330);
      b += kidShow('K', t, 1690, 820, { s: 0.8, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「セミ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

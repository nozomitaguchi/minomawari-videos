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
const TOPIC = 'れいぞうこ';
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
// ---------- れいぞうこ の道具 ----------
// 色の約束：つめたい＝青、ねつ＝赤いなみ線・赤いつぶ。れいばいの管は、つめたい液＝青 → ガス＝水色 → あついガス＝赤 → 液＝オレンジ
const FR = {
  body: '#f3f5f2', side: '#d9dfe0', top: '#e6eaea', line: '#8a959b', inside: '#dceef6', cold: '#3f86c6', coldL: '#cfe6f2', gas: '#8fc4e6',
  hot: '#e2553f', liq: '#f0a04b', metal: '#a7adb0', wall: '#f6ecdc', floor: '#e2c9a3', warm: '#f6b79b', skin: '#f3d9c2', comp: '#6f777c',
};
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
// k 番目の行の、はじめから f（0〜1）のところの秒
const mid = (k, f = 0.5) => cue(k) + (cueE(k) - cue(k)) * f;
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const F1 = v => v.toFixed(1);
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
// 折れ線の道具
const plen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
function pat(P, d) {
  for (let i = 1; i < P.length; i++) {
    const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (d <= l || i === P.length - 1) { const k = clamp(l ? d / l : 0); return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; }
    d -= l;
  }
  return P[0];
}
const ppath = P => 'M ' + P.map(p => p.join(' ')).join(' L ');
// 雪のけっしょう
const flake = (x, y, r = 20, col = FR.cold, w = 5, o = 1) => `<g transform="translate(${x} ${y})" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none" opacity="${o}">${[0, 60, 120].map(d => `<path transform="rotate(${d})" d="M 0 ${-r} V ${r} M ${-r * 0.3} ${-r * 0.72} L 0 ${-r * 0.45} L ${r * 0.3} ${-r * 0.72} M ${-r * 0.3} ${r * 0.72} L 0 ${r * 0.45} L ${r * 0.3} ${r * 0.72}"/>`).join('')}</g>`;
// 熱のなみ線（上へのぼる）
function heatUp(x, y, t, { n = 3, gap = 34, h = 70, col = FR.hot, o = 1, w = 8, ph = 0, rise = 50 } = {}) {
  if (o <= 0.01) return '';
  let s = '';
  for (let k = 0; k < n; k++) {
    const f = (((t * 0.7 + k * 0.37 + ph) % 1) + 1) % 1, yy = y - f * rise, a = Math.sin(f * Math.PI);
    s += `<path d="M ${F1(x + (k - (n - 1) / 2) * gap)} ${F1(yy)} q -10 ${-h / 4} 0 ${-h / 2} t 0 ${-h / 2}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${F1(a * o)}"/>`;
  }
  return s;
}
// 熱のなみ線（右へ出ていく）
function heatRight(x, y, t, { n = 3, gap = 60, len = 90, col = FR.hot, o = 1, w = 8, ph = 0, run = 60 } = {}) {
  if (o <= 0.01) return '';
  let s = '';
  for (let k = 0; k < n; k++) {
    const f = (((t * 0.7 + k * 0.37 + ph) % 1) + 1) % 1, xx = x + f * run, a = Math.sin(f * Math.PI);
    s += `<path d="M ${F1(xx)} ${F1(y + (k - (n - 1) / 2) * gap)} q ${len / 4} -10 ${len / 2} 0 t ${len / 2} 0" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${F1(a * o)}"/>`;
  }
  return s;
}
const heatDot = (x, y, r = 13, o = 1) => o <= 0.01 ? '' : `<circle cx="${F1(x)}" cy="${F1(y)}" r="${r * 1.7}" fill="${FR.hot}" opacity="${0.25 * o}"/><circle cx="${F1(x)}" cy="${F1(y)}" r="${r}" fill="${FR.hot}" stroke="#a8321f" stroke-width="3" opacity="${o}"/>`;
// 温度計（lv 0〜1）
const thermoPic = (lv, col = FR.hot) => `<rect x="-22" y="-250" width="44" height="270" rx="22" fill="#fff" stroke="${C.ink}" stroke-width="7"/><circle cx="0" cy="40" r="40" fill="#fff" stroke="${C.ink}" stroke-width="7"/><rect x="-15" y="-243" width="30" height="270" rx="15" fill="#fff"/>` +
  [0, 1, 2, 3, 4, 5].map(k => `<line x1="8" y1="${-10 - k * 42}" x2="20" y2="${-10 - k * 42}" stroke="#b9b2a2" stroke-width="5" stroke-linecap="round"/>`).join('') +
  `<rect x="-9" y="${F1(lerp(10, -232, clamp(lv)))}" width="18" height="${F1(40 - lerp(10, -232, clamp(lv)))}" rx="9" fill="${col}"/><circle cx="0" cy="40" r="28" fill="${col}"/><circle cx="-9" cy="31" r="8" fill="#fff" opacity="0.45"/>`;
// 食べもの
const milk = (x, y, s = 1) => g(`<path d="M -22 -60 L 0 -84 L 22 -60 L 22 0 L -22 0 Z" fill="#fff" stroke="${FR.line}" stroke-width="4" stroke-linejoin="round"/><rect x="-22" y="-44" width="44" height="22" fill="#6fa8d8"/>`, { x, y, s });
const apple = (x, y, s = 1) => g(`<circle cx="0" cy="-22" r="22" fill="#e2553f"/><path d="M 0 -42 q 6 -12 14 -12" fill="none" stroke="#6b4a2f" stroke-width="5" stroke-linecap="round"/><circle cx="-8" cy="-30" r="6" fill="#fff" opacity="0.4"/>`, { x, y, s });
const cheese = (x, y, s = 1) => g(`<path d="M -34 0 L 34 0 L 34 -22 L -34 -40 Z" fill="#f2c94c" stroke="#c99a1e" stroke-width="4" stroke-linejoin="round"/><circle cx="10" cy="-14" r="5" fill="#c99a1e"/><circle cx="-14" cy="-20" r="4" fill="#c99a1e"/>`, { x, y, s });
const pot = (x, y, s = 1) => g(`<rect x="-34" y="-36" width="68" height="36" rx="8" fill="#8fb3c6" stroke="${FR.line}" stroke-width="4"/><rect x="-40" y="-44" width="80" height="12" rx="6" fill="#6f96aa"/><circle cx="0" cy="-48" r="6" fill="#6f96aa"/>`, { x, y, s });
// 冷蔵庫（ななめ前から。足もとのまん中が原点）。open: 上のドアの開きぐあい 0〜1、warm: 横の面のあたたかさ 0〜1
function fridge3D(t, { open = 0, warm = 0 } = {}) {
  const W = 300, H = 620, DX = 84, DY = -34, SP = -250, hw = W / 2;
  let o = `<ellipse cx="30" cy="4" rx="210" ry="20" fill="#000" opacity="0.08"/>`;
  o += `<path d="M ${hw} ${-H} L ${hw + DX} ${-H + DY} L ${hw + DX} ${DY} L ${hw} 0 Z" fill="${mix(FR.side, FR.warm, clamp(warm))}" stroke="${FR.line}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<path d="M ${-hw + 8} ${-H} L ${-hw + DX} ${-H + DY} L ${hw + DX} ${-H + DY} L ${hw} ${-H} Z" fill="${FR.top}" stroke="${FR.line}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<rect x="${-hw}" y="${-H}" width="${W}" height="${H}" rx="14" fill="${FR.body}" stroke="${FR.line}" stroke-width="6"/>`;
  o += `<line x1="${-hw}" y1="${SP}" x2="${hw}" y2="${SP}" stroke="${FR.line}" stroke-width="6"/><rect x="${hw - 42}" y="${SP + 34}" width="14" height="96" rx="7" fill="${FR.metal}"/>`;
  if (open > 0.02) {
    const ih = H + SP - 26;
    o += `<rect x="${-hw + 14}" y="${-H + 14}" width="${W - 28}" height="${ih}" rx="8" fill="${FR.inside}" stroke="${FR.line}" stroke-width="3"/>`;
    o += `<line x1="${-hw + 14}" y1="${-H + 140}" x2="${hw - 14}" y2="${-H + 140}" stroke="#a9c7d6" stroke-width="5"/><line x1="${-hw + 14}" y1="${-H + 262}" x2="${hw - 14}" y2="${-H + 262}" stroke="#a9c7d6" stroke-width="5"/>`;
    o += milk(-70, -H + 138, 1.05) + apple(40, -H + 138, 1.0) + cheese(-50, -H + 260, 1.0) + pot(64, -H + 260, 0.95) + apple(-40, -H + ih + 6, 0.9) + milk(60, -H + ih + 6, 0.9);
    o += flake(-96, -H + 60, 18, FR.cold, 4, 0.8) + flake(100, -H + 200, 16, FR.cold, 4, 0.8) + flake(0, -H + 318, 16, FR.cold, 4, 0.8);
    const th = clamp(open) * 2.0, fx = -hw + W * Math.cos(th), dy = 46 * Math.sin(th);
    o += `<path d="M ${-hw} ${-H + 4} L ${F1(fx)} ${F1(-H + 4 + dy)} L ${F1(fx)} ${F1(SP - 4 + dy)} L ${-hw} ${SP - 4} Z" fill="#e9eeee" stroke="${FR.line}" stroke-width="6" stroke-linejoin="round"/>`;
  } else o += `<rect x="${hw - 42}" y="${-H + 70}" width="14" height="130" rx="7" fill="${FR.metal}"/>`;
  return o;
}
// 横の面のまん中（fridge3D の中の座標）
const SIDE_C = [192, -330];
// 大人の手（右からのびて、(0,0) にさわる）
const adultHand = () => `<path d="M 330 70 L 70 14" stroke="#5f8fb5" stroke-width="64" stroke-linecap="round"/><path d="M 96 18 L 40 6" stroke="${FR.skin}" stroke-width="46" stroke-linecap="round"/><ellipse cx="18" cy="0" rx="34" ry="30" fill="${FR.skin}"/><path d="M 20 -28 q -22 -18 -34 -4" fill="none" stroke="${FR.skin}" stroke-width="16" stroke-linecap="round"/>`;
// 冷蔵庫を横から切った絵（左がドア、右がうしろ）。原点は左上、420×640（うしろの管は x 500 まで）
const P_COOL = [[298, 74], [298, 300]];
const P_TOCOMP = [[298, 300], [298, 340], [350, 340], [350, 548]];
const P_COND = [[378, 574], [460, 574], [460, 520], ...Array.from({ length: 14 }, (_, k) => [k % 2 ? 484 : 436, 500 - k * 30]), [460, 92]];
const P_CAP = [[460, 92], [460, 50], [298, 50], [298, 74]];
const SEGS = [[P_COOL, FR.cold, FR.gas], [P_TOCOMP, FR.gas, FR.gas], [P_COND, FR.hot, FR.liq], [P_CAP, FR.liq, FR.cold]].map(([P, a, b]) => ({ P, a, b, L: plen(P) }));
const LOOP_L = SEGS.reduce((a, s) => a + s.L, 0);
function loopAt(f) {
  let d = ((f % 1) + 1) % 1 * LOOP_L;
  for (const s of SEGS) { if (d <= s.L) { const [x, y] = pat(s.P, d); return [x, y, mix(s.a, s.b, d / s.L)]; } d -= s.L; }
  return [298, 74, FR.cold];
}
// hl: 目立たせる部品（0 冷却器 / 1 圧縮機 / 2 熱を出す管 / 3 細い管）、flow: れいばいのつぶ、nums: 番号
function cutaway(t, { hl = -1, flow = 0, nums = 0, pipeO = 1, food = 1 } = {}) {
  let o = `<rect x="0" y="0" width="420" height="640" rx="20" fill="${FR.body}" stroke="${FR.line}" stroke-width="6"/>`;
  o += `<rect x="28" y="28" width="300" height="476" rx="10" fill="${FR.inside}" stroke="#a9c7d6" stroke-width="3"/>`;
  o += `<rect x="-12" y="150" width="14" height="150" rx="7" fill="${FR.metal}"/>`;
  o += `<line x1="28" y1="200" x2="262" y2="200" stroke="#a9c7d6" stroke-width="6"/><line x1="28" y1="352" x2="262" y2="352" stroke="#a9c7d6" stroke-width="6"/>`;
  if (food) o += milk(80, 198, 1.2) + apple(170, 198, 1.1) + cheese(90, 350, 1.15) + pot(190, 350, 1.0) + apple(80, 500, 1.1) + milk(170, 500, 1.1) + flake(140, 110, 18, FR.cold, 4, 0.7) + flake(50, 270, 15, FR.cold, 4, 0.7) + flake(230, 440, 16, FR.cold, 4, 0.7);
  // 機械室
  o += `<rect x="262" y="520" width="140" height="102" rx="10" fill="#e1e5e4" stroke="${FR.line}" stroke-width="3"/>`;
  // 冷却器（フィンのついた管）
  o += `<rect x="274" y="60" width="48" height="254" rx="8" fill="#eef3f5" stroke="${FR.line}" stroke-width="3"/>` + Array.from({ length: 9 }, (_, k) => `<line x1="278" y1="${84 + k * 26}" x2="318" y2="${84 + k * 26}" stroke="${FR.metal}" stroke-width="4"/>`).join('');
  // 管
  o += `<linearGradient id="gCool" gradientUnits="userSpaceOnUse" x1="0" y1="74" x2="0" y2="300"><stop offset="0" stop-color="${FR.cold}"/><stop offset="1" stop-color="${FR.gas}"/></linearGradient>`;
  o += `<linearGradient id="gCond" gradientUnits="userSpaceOnUse" x1="0" y1="574" x2="0" y2="92"><stop offset="0" stop-color="${FR.hot}"/><stop offset="0.45" stop-color="${FR.hot}"/><stop offset="1" stop-color="${FR.liq}"/></linearGradient>`;
  o += `<linearGradient id="gCap" gradientUnits="userSpaceOnUse" x1="460" y1="0" x2="298" y2="0"><stop offset="0" stop-color="${FR.liq}"/><stop offset="1" stop-color="${FR.cold}"/></linearGradient>`;
  const pp = (P, col, w) => `<path d="${ppath(P)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += g(pp(P_COOL, 'url(#gCool)', 14) + pp(P_TOCOMP, FR.gas, 14) + pp(P_COND, 'url(#gCond)', 14) + pp(P_CAP, 'url(#gCap)', 7), { o: pipeO });
  // 圧縮機
  o += `<rect x="286" y="546" width="94" height="58" rx="26" fill="${FR.comp}" stroke="#4d5458" stroke-width="5"/><line x1="300" y1="566" x2="366" y2="566" stroke="#4d5458" stroke-width="4"/><rect x="278" y="602" width="110" height="10" rx="5" fill="#4d5458"/>`;
  // れいばいのつぶ
  if (flow > 0) for (let i = 0; i < 22; i++) { const [x, y, c] = loopAt(i / 22 + t * 0.07); o += `<circle cx="${F1(x)}" cy="${F1(y)}" r="7.5" fill="#fff" stroke="${mix(c, '#000000', 0.35)}" stroke-width="3.5" opacity="${flow}"/>`; }
  const HL = [[258, 44, 80, 284], [270, 532, 126, 88], [420, 80, 80, 508], [286, 34, 190, 32]];
  if (hl >= 0) { const [x, y, w, h] = HL[hl]; o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="none" stroke="${C.yellow}" stroke-width="${9 + 2 * Math.sin(t * 6)}"/>`; }
  if (nums > 0) [[236, 180], [226, 578], [540, 300], [378, 14]].forEach(([x, y], i) => { o += g(`<circle r="26" fill="${[FR.cold, FR.comp, FR.hot, FR.liq][i]}" stroke="#fff" stroke-width="4"/>` + text(0, 2, String(i + 1), { size: 34, w: 900, fill: '#fff' }), { x, y, o: nums }); });
  return o;
}
const roomBg = () => `<rect width="1920" height="1080" fill="${FR.wall}"/><rect y="806" width="1920" height="274" fill="${FR.floor}"/><rect y="798" width="1920" height="12" fill="#cfb38a"/>`;
const windowPic = (x, y) => `<rect x="${x}" y="${y}" width="230" height="150" rx="14" fill="#cfe6f2" stroke="#fff" stroke-width="14"/><line x1="${x + 115}" y1="${y}" x2="${x + 115}" y2="${y + 150}" stroke="#fff" stroke-width="10"/>` + cloud(x + 56, y + 58, 0.22) + cloud(x + 176, y + 116, 0.2);

// 1. つかみ：中はひんやり、横はほんのりあたたかい
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = roomBg() + windowPic(1500, 90);
    const FX = 600, FY = 836, op = eio(prog(t, c0 + 0.2, 0.9)) - eio(prog(t, c1 - 0.5, 0.7)), touch = mid(1, 0.42), wm = eo(prog(t, touch + 0.3, 1.2));
    out += g(fridge3D(t, { open: op, warm: wm * 0.8 }), { x: FX, y: FY });
    out += pop(badge('なかは ひんやり', { fill: FR.cold, size: 46 }), t, c0 + 1.0, 300, 130, { end: c1 + 0.3 }) + g(flake(120, 400, 30) + flake(230, 470, 22) + flake(150, 560, 26), { o: win(t, c0 + 1.2, c1 + 0.3, 0.3) });
    // 大人の手が横にさわる
    const hk = eo(prog(t, touch - 0.7, 0.7)), HX = FX + SIDE_C[0] + 8, HY = FY + SIDE_C[1];
    if (hk > 0) out += g(adultHand(), { x: HX + (1 - hk) * 420, y: HY + (1 - hk) * 60, o: Math.min(1, hk * 3) * (1 - prog(t, cueE(3) + 0.3, 0.3)) });
    out += heatUp(FX + SIDE_C[0], FY - 470, t, { n: 2, gap: 40, o: wm * 0.9 }) + heatUp(FX + SIDE_C[0], FY - 150, t, { n: 2, gap: 40, o: wm * 0.9, ph: 0.4 });
    out += pop(badge('よこは ほんのり あったかい', { fill: FR.hot, size: 44 }), t, touch + 0.6, 1210, 250);
    out += kidShow('S', t, 1700, 850, { s: 0.7, start: 0.4, n: 0, side: 'left', size: 46, look: [-7, -2] });
    // どうして？
    out += g(text(0, 0, '？', { size: 190, w: 900, fill: C.ochre, extra: `stroke="${FR.wall}" stroke-width="18" paint-order="stroke"` }), { x: 1300, y: 500, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 190);
      out += g(`<text x="0" y="0" font-size="104" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">れいぞうこは なかを <tspan fill="${FR.cold}">ひやす</tspan>のに、</text>`, { x: 960, y: 360, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="104" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして そとが <tspan fill="${FR.hot}">あったかい</tspan>の？</text>`, { x: 960, y: 530, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(flake(-250, 0, 44, FR.cold, 9), {}) + g(fridge3D(0, {}), { x: -30, y: 110, s: 0.36 }) + heatUp(200, 40, t, { n: 3, gap: 44, h: 90, w: 10 }), t, t0 + 1.8, 960, 760);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'れいぞうこの よこは、どうして あったかいと おもう？', { size: 54, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', ['なかの ライトが、あつく なって いるから']], ['②', ['なかの ねつを、そとへ はこびだして いるから']], ['③', ['れいぞうこが、こわれかけて いるから']]];
    const cur = curLine(), osz = Math.min(...opts.flatMap(([, L]) => L.map(s => fit(s, 1040, 46))));
    opts.forEach(([n, L], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-80" width="1260" height="160" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 140) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        L.map((s, j) => text(-460, 2 + (j - (L.length - 1) / 2) * (osz + 14), s, { size: osz, w: 700, anchor: 'start' })).join(''), t, cue(i + 1) - 0.2, 820, 384 + i * 166);
    });
    out += pop(g(fridge3D(0, { warm: 0.8 }), { y: 110, s: 0.36 }) + text(120, -90, '？', { size: 120, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1640, 330);
    out += kidShow('B', t, 1730, 850, { s: 0.62, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 580, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 冷たさを作るのではなく、中の熱を外へ運ぶ
const HSTART = [[80, 150], [170, 160], [90, 310], [190, 320], [80, 460], [170, 450], [130, 240], [140, 400]];
SCENES.push({
  id: 'carry',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const CX = 720, CY = 172;
    // つめたさを作る？ ×
    const xk = mid(0, 0.62);
    out += pop(card(470, 330) + flake(0, -40, 74, FR.cold, 12) + text(0, 104, 'つめたさを つくる？', { size: 44, w: 900 }), t, c0 + 0.2, 350, 380);
    out += g(cross(350, 350, 1.5), { o: prog(t, xk, 0.25), s: 1 });
    // 中の熱が、管にのって外へ
    let dots = '';
    const hk = prog(t, c1 + 0.2, 0.4);
    if (hk > 0) HSTART.forEach(([sx, sy], i) => {
      const P = [[sx, sy], [298, 100 + i * 24], [298, 300], ...P_TOCOMP.slice(1), ...P_COND.slice(0, 5 + i), [660, P_COND[4 + i][1]]], L = plen(P);
      const ph = (t - c1 - 0.3 - i * 0.55) / 5.4; if (ph < 0) { dots += heatDot(sx, sy, 13, hk); return; }
      const f = ph % 1, [x, y] = pat(P, f * L), o = Math.min(1, (1 - f) * 6);
      dots += heatDot(x, y, 13, o);
    });
    out += g(cutaway(t, { flow: prog(t, c2 + 0.2, 0.5), pipeO: 1 }) + dots, { x: CX, y: CY });
    out += tag(CX + 150, CY + 250, 350, 660, 'なかの ねつ', win(t, c1 + 0.4, 99, 0.3), { col: FR.hot, size: 44 });
    const ok = prog(t, mid(1, 0.45), 0.4);
    out += heatRight(CX + 520, CY + 300, t, { n: 4, gap: 90, len: 110, w: 10, o: ok });
    out += pop(badge('そとへ', { fill: FR.hot, size: 52, pad: 40 }), t, mid(1, 0.45) + 0.2, 1560, 330);
    out += g(arrow2(1400, 420, 1700, 420, FR.hot, 18), { o: ok });
    out += pop(badge('ねつを はこびだす きかい', { fill: C.accent, size: 42 }), t, mid(1, 0.75), 1560, 540, { end: c2 + 0.2 });
    out += tag(CX + 350, CY + 450, 1560, 640, 'れいばい（はこびやく）', win(t, c2 + 0.5, 99, 0.3), { col: FR.cold, size: 42 });
    out += g(text(0, 0, 'くだの なかを めぐる', { size: 38, w: 900, fill: C.muted }), { x: 1560, y: 730, o: prog(t, c2 + 1.4, 0.4) });
    return out;
  },
});

// 4. 液体から気体に変わるとき、まわりの熱をうばう
const waterDrop = (x, y, s = 1, col = FR.cold, o = 1) => o <= 0.01 ? '' : `<path transform="translate(${F1(x)} ${F1(y)}) scale(${s})" d="M 0 -22 C 10 -6 16 2 16 10 A 16 16 0 0 1 -16 10 C -16 2 -10 -6 0 -22 Z" fill="${col}" stroke="${mix(col, '#000000', 0.25)}" stroke-width="3" opacity="${o}"/>`;
SCENES.push({
  id: 'evap',
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // 管の中：液体（左）→ 気体（右）
    const TX0 = 140, TX1 = 1020, TY = 430, MX = 560;
    out += pop(badge('れいばいの くだの なか', { fill: C.blueUi, size: 40 }), t, 0.3, 580, 210);
    out += `<rect x="${TX0}" y="${TY - 70}" width="${TX1 - TX0}" height="140" rx="70" fill="#eef6fb" stroke="${FR.line}" stroke-width="8"/>`;
    out += `<clipPath id="tubec"><rect x="${TX0 + 6}" y="${TY - 64}" width="${TX1 - TX0 - 12}" height="128" rx="64"/></clipPath><g clip-path="url(#tubec)">`;
    out += `<rect x="${TX0}" y="${TY - 70}" width="${MX - TX0}" height="140" fill="${FR.cold}" opacity="0.85"/><path d="M ${MX} ${TY - 70} q 40 35 0 70 t 0 70 L ${MX - 60} ${TY + 70} L ${MX - 60} ${TY - 70} Z" fill="${FR.cold}" opacity="0.85"/>`;
    for (let i = 0; i < 16; i++) { const f = ((t * 0.22 + i / 16) % 1), x = MX + 30 + f * (TX1 - MX), y = TY + Math.sin(i * 2.4 + f * 5) * 40; out += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${10 + (i % 3) * 3}" fill="${FR.gas}" opacity="${F1(0.9 * Math.sin(f * Math.PI))}"/>`; }
    out += `</g>`;
    out += pop(text(0, 0, 'えきたい', { size: 48, w: 900, fill: '#fff' }), t, c0 + 0.4, 340, TY + 2);
    out += pop(text(0, 0, 'きたい', { size: 48, w: 900, fill: C.blueUi, extra: `stroke="#eef6fb" stroke-width="12" paint-order="stroke"` }), t, mid(0, 0.3), 830, TY + 2);
    out += g(arrow2(470, TY - 120, 650, TY - 120, C.blueUi, 14), { o: prog(t, mid(0, 0.25), 0.3) });
    // まわりの熱がうばわれる
    const hS = mid(0, 0.55);
    for (let i = 0; i < 10; i++) {
      const up = i % 2 === 0, sx = 420 + i * 44 + rnd(i, 71) * 20, sy = up ? TY - 230 - rnd(i, 72) * 40 : TY + 230 + rnd(i, 72) * 40;
      const ph = (t - hS - i * 0.28) / 2.6; if (ph < 0) continue;
      const f = ph % 1, x = lerp(sx, MX + 40 + (i % 5) * 12, eo(f)), y = lerp(sy, TY + (up ? -50 : 50), eo(f));
      out += heatDot(x, y, 13, Math.min(1, f * 5) * (1 - prog(f, 0.82, 0.18)));
    }
    out += pop(badge('まわりの ねつを うばう', { fill: FR.hot, size: 44 }), t, hS + 0.4, 580, 690);
    out += g(flake(250, 610, 24) + flake(900, 250, 24) + flake(930, 620, 20), { o: prog(t, hS + 1.2, 0.5) });
    // プールから上がると、ひんやり
    const pk = prog(t, c1 - 0.2, 0.5);
    if (pk > 0) {
      const PX = 1500, PY = 480;
      let p = card(700, 640, { fill: '#eaf6fb' });
      p += `<clipPath id="poolc"><rect x="-350" y="-320" width="700" height="640" rx="28"/></clipPath><g clip-path="url(#poolc)"><rect x="-350" y="170" width="700" height="150" fill="#58b4e6"/><path d="M -350 170 q 44 -22 88 0 t 88 0 t 88 0 t 88 0 t 88 0 t 88 0 t 88 0 t 88 0 L 350 190 L -350 190 Z" fill="#8fd0f0"/><rect x="-350" y="130" width="330" height="44" fill="#d9cdb8"/><rect x="-350" y="120" width="330" height="14" fill="#efe6d2"/></g>`;
      p += text(0, -264, 'プールから あがると…', { size: 44, w: 900 });
      out += g(p, { x: PX, y: PY, o: pk });
      const KX = PX - 190, KY = PY + 124;
      out += kidShow('B', t, KX, KY, { s: 0.62, start: c1 + 0.1, n: 0, bubble: false, look: [5, -3] });
      // 体についた水が、かわいていく
      const wS = c1 + 0.9;
      for (let i = 0; i < 7; i++) {
        const bx = KX + (i % 2 ? 1 : -1) * (74 + (i % 3) * 12), by = KY - 40 - (i % 4) * 44;
        const ph = (t - wS - i * 0.33) / 2.4; if (ph < 0) continue;
        const f = ph % 1;
        out += waterDrop(bx + Math.sin(f * 6 + i) * 6, by - f * 110, 0.8 * (1 - f * 0.6), '#58b4e6', (1 - f) * pk) + heatDot(bx + 14, by - 20 - f * 130, 8, Math.sin(f * Math.PI) * 0.9 * pk);
      }
      out += pop(badge('みずが かわく とき、ねつを うばう', { fill: C.blueUi, size: 34 }), t, mid(1, 0.45), PX, PY - 196);
      const ht = KY - KID_HEAD.B[0] * 0.62;
      out += talkBubble('B', KX + 280, ht + 56, KX + 52, ht + 70, 44);
    }
    return out;
  },
});

// 5. れいばいは、4つの部品をぐるぐるめぐる
const PARTS = [
  ['れいきゃくき', 'えきたいが きたいに なって、なかを ひやす', FR.cold],
  ['あっしゅくき', 'ぎゅっと おしちぢめて、あつく する', FR.comp],
  ['ねつを だす くだ（よこや うしろ）', 'ねつを へやへ だす', FR.hot],
  ['ほそい くだ', 'とおりぬけて、また れいきゃくきへ', '#c97a1e'],
];
SCENES.push({
  id: 'cycle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const cur = curLine(), hl = cur >= 1 && cur <= 4 ? cur - 1 : -1;
    out += g(cutaway(t, { hl, flow: 1, nums: prog(t, cue(0) + 0.6, 0.4), food: 1 }), { x: 130, y: 172 });
    out += heatRight(690, 300, t, { n: 3, gap: 110, len: 80, w: 9, o: prog(t, cue(3) + 0.4, 0.5), run: 40 });
    out += pop(text(0, 0, 'れいばいは、4つの ぶひんを ぐるぐる', { size: 50, w: 900 }), t, cue(0) + 0.2, 1330, 190);
    PARTS.forEach(([name, desc, col], i) => {
      const st = i === 0 ? cue(1) : cue(i + 1), on = hl === i, y = 300 + i * 142;
      out += pop((on ? `<rect x="-520" y="-70" width="1040" height="140" rx="30" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1020, 122) +
        `<circle cx="-448" cy="0" r="40" fill="${col}"/>` + text(-448, 3, String(i + 1), { size: 48, w: 900, fill: '#fff' }) +
        text(-388, -24, name, { size: 40, w: 900, anchor: 'start', fill: col }) + text(-388, 28, desc, { size: 36, w: 700, anchor: 'start' }), t, st - 0.2, 1330, y);
    });
    out += pop(badge('ぐるぐる くりかえす', { fill: C.ochre, size: 38 }), t, cue(4) + 0.8, 1330, 826);
    return out;
  },
});

// 6. だから横やうしろはあたたかい。50度以上になることも
SCENES.push({
  id: 'side',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = roomBg() + topBadge();
    const FX = 470, FY = 836, more = eo(prog(t, c3 + 0.3, 1.0));
    out += g(fridge3D(t, { warm: 0.55 + 0.45 * more, open: 0 }), { x: FX, y: FY, s: 0.98 });
    const sx = FX + SIDE_C[0] * 0.98;
    out += heatUp(sx, FY - 470, t, { n: 2, gap: 40, h: 70 + 30 * more, w: 8 + 3 * more }) + heatUp(sx, FY - 280, t, { n: 2, gap: 40, ph: 0.3, h: 70 + 30 * more, w: 8 + 3 * more }) + heatUp(sx, FY - 110, t, { n: 2, gap: 40, ph: 0.6, h: 70 + 30 * more, w: 8 + 3 * more });
    out += heatRight(sx + 70, FY - 330, t, { n: 3, gap: 150, len: 80, o: 0.5 + 0.5 * more, w: 8 + 3 * more });
    out += pop(badge('よこや うしろは あたたかい', { fill: FR.hot, size: 44 }), t, c0 + 0.4, 500, 150);
    // 温度計：まわり30度 → 横の面は50度以上になることも
    const a = prog(t, c1 + 0.2, 0.5), b = prog(t, mid(1, 0.4), 0.5), thO = 1 - prog(t, c3 - 0.3, 0.4);
    out += g(g(thermoPic(0.42 * eo(prog(t, c1 + 0.4, 0.8)), '#e9963a'), { s: 0.9 }) + text(0, 124, 'まわり', { size: 40, w: 900 }) + text(0, -278, '30ど', { size: 64, w: 900, fill: '#c97a1e' }), { x: 940, y: 520, o: a * thO });
    out += g(g(thermoPic(0.86 * eo(prog(t, mid(1, 0.4) + 0.2, 1.0)), FR.hot), { s: 0.9 }) + text(0, 124, 'よこの めん', { size: 40, w: 900 }) + text(0, -278, '50ど いじょう', { size: 64, w: 900, fill: FR.hot }), { x: 1290, y: 520, o: b * thO });
    out += g(arrow2(1030, 420, 1200, 420, C.ochre, 14), { o: b * thO });
    out += g(text(0, 0, 'に なる れいぞうこも ある（まわりが 30どの とき）', { size: 32, w: 700, fill: C.muted }), { x: 1120, y: 716, o: prog(t, mid(1, 0.4) + 0.8, 0.4) * thO });
    const KY = 848, ks = 0.58, ht = KY - KID_HEAD.S[0] * ks;
    out += kidShow('S', t, 1720, KY, { s: ks, start: c1 + 0.4, n: 0, bubble: false, look: [-7, -3] });
    out += talkBubble('S', 1660, ht - 88, 1716, ht - 6, 44);
    // 中をたくさん冷やすほど、外はあたたかい
    out += pop(badge('たべものを たくさん いれた とき', { fill: C.blueUi, size: 42 }), t, c3 + 0.3, 1130, 330) + pop(badge('ドアを よく あける とき', { fill: C.blueUi, size: 42 }), t, c3 + 1.1, 1130, 440);
    out += g(arrow2(1130, 500, 1130, 580, C.ochre, 14), { o: prog(t, mid(3, 0.5), 0.3) });
    out += pop(badge('たくさん ひやすほど、そとは あたたかく', { fill: FR.hot, size: 40 }), t, mid(3, 0.55), 1130, 650);
    return out;
  },
});

// 7. 外へ出す熱 ＝ 中から運んだ熱 ＋ モーターの分。ドアを開けっぱなしでも、すずしくならない
const bolt = (s = 1) => g(`<path d="M 8 -44 L -22 6 L -2 6 L -10 44 L 24 -10 L 2 -10 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`, { s });
const dotsRow = (n, t, st, r = 20, gap = 54) => Array.from({ length: n }, (_, i) => pop(heatDot(0, 0, r), t, st + i * 0.12, (i - (n - 1) / 2) * gap, 0)).join('');
SCENES.push({
  id: 'balance',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = roomBg() + topBadge();
    // A たし算
    const aO = 1 - prog(t, c2 - 0.6, 0.4);
    if (aO > 0) {
      let a = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
      a += pop(card(440, 330) + g(cutaway(0, { food: 0 }), { x: -60, y: -150, s: 0.2 }) + text(0, 30, 'なかから はこんだ ねつ', { size: 34, w: 900 }) + g(dotsRow(4, t, 0.5), { y: 104 }), t, 0.3, 330, 420);
      a += pop(text(0, 0, '＋', { size: 110, w: 900, fill: C.ochre }), t, c0 + 0.6, 610, 420);
      a += pop(card(440, 330) + g(bolt(1.3), { y: -86 }) + text(0, 30, 'モーターの でんきの ぶん', { size: 34, w: 900 }) + g(dotsRow(2, t, mid(0, 0.6)), { y: 104 }), t, c0 + 0.9, 890, 420);
      a += pop(text(0, 0, '＝', { size: 110, w: 900, fill: C.ochre }), t, c1 + 0.3, 1170, 420);
      a += pop(`<rect x="-270" y="-185" width="540" height="370" rx="36" fill="none" stroke="${FR.hot}" stroke-width="8"/>` + card(520, 350) + text(0, -96, 'そとへ だす ねつ', { size: 46, w: 900, fill: FR.hot }) + g(dotsRow(6, t, c1 + 0.9), { y: 10 }) + heatUp(0, 150, t, { n: 4, gap: 70, h: 60, w: 8 }), t, c1 + 0.6, 1540, 420);
      a += pop(badge('なかから はこんだ ねつより おおい', { fill: FR.hot, size: 44 }), t, mid(1, 0.5), 1200, 700);
      out += g(a, { o: aO });
    }
    // B ドアを開けっぱなしの部屋
    const bO = prog(t, c2 - 0.3, 0.5);
    if (bO > 0) {
      const FX = 520, FY = 836, up = eo(prog(t, c3 + 0.2, 2.0));
      let b = windowPic(1560, 90);
      b += g(fridge3D(t, { open: eio(prog(t, c2 - 0.1, 0.9)), warm: 0.9 }), { x: FX, y: FY, s: 0.98 });
      const sx = FX + SIDE_C[0] * 0.98;
      b += heatUp(sx, FY - 470, t, { n: 2, gap: 40, h: 96, w: 11 }) + heatUp(sx, FY - 280, t, { n: 2, gap: 40, ph: 0.3, h: 96, w: 11 }) + heatUp(sx, FY - 110, t, { n: 2, gap: 40, ph: 0.6, h: 96, w: 11 });
      b += heatRight(sx + 70, FY - 330, t, { n: 3, gap: 150, len: 100, w: 11 });
      // 中から出る冷たい空気（少し）
      for (let i = 0; i < 3; i++) { const f = ((t * 0.5 + i / 3) % 1); b += `<path d="M ${F1(FX - 60 - f * 70)} ${F1(FY - 330 + i * 40 + f * 60)} q -24 14 -48 0" fill="none" stroke="${FR.cold}" stroke-width="8" stroke-linecap="round" opacity="${F1(Math.sin(f * Math.PI) * 0.8)}"/>`; }
      b += pop(badge('ドアを あけっぱなし', { fill: C.blueUi, size: 42 }), t, c2 + 0.3, 420, 150);
      b += g(g(thermoPic(lerp(0.4, 0.66, up), mix('#e9963a', FR.hot, up)), { s: 0.95 }) + text(0, 130, 'へやの おんど', { size: 40, w: 900 }), { x: 1180, y: 520 });
      b += g(arrow2(1270, 470, 1270, 330, FR.hot, 16), { o: prog(t, c3 + 0.4, 0.4) });
      b += pop(card(560, 150) + flake(-216, 0, 30, FR.cold, 7) + text(-160, 2, 'すずしく ならない', { size: 46, w: 900, anchor: 'start' }), t, mid(2, 0.5), 1580, 420, { end: c3 + 0.2 });
      b += pop(card(600, 150, { fill: '#fdeee6' }) + text(0, 2, 'かえって あたたかく なる', { size: 44, w: 900, fill: FR.hot }), t, c3 + 0.5, 1570, 420);
      b += pop(badge('なかの ねつ ＋ モーターの ぶんが へやへ', { fill: FR.hot, size: 34 }), t, c3 + 1.4, 1400, 730);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. 熱がこもらないように、すきまをあけて置く
SCENES.push({
  id: 'gap',
  draw(t) {
    const c0 = cue(0);
    let out = roomBg() + topBadge();
    const L = 600, R = 920, T = 250, B = 836;
    // たなと食器だな
    out += `<rect x="270" y="340" width="270" height="${B - 340}" rx="10" fill="#d9b98a" stroke="#b8946a" stroke-width="6"/><rect x="300" y="380" width="210" height="190" rx="8" fill="#e9cfa6"/><rect x="300" y="600" width="210" height="190" rx="8" fill="#e9cfa6"/><circle cx="490" cy="475" r="9" fill="#b8946a"/><circle cx="490" cy="695" r="9" fill="#b8946a"/>`;
    out += `<rect x="980" y="420" width="290" height="${B - 420}" rx="10" fill="#d9b98a" stroke="#b8946a" stroke-width="6"/><rect x="1010" y="456" width="230" height="150" rx="8" fill="#e9cfa6"/><rect x="1010" y="636" width="230" height="160" rx="8" fill="#e9cfa6"/>`;
    out += `<rect x="500" y="150" width="520" height="40" rx="8" fill="#d9b98a" stroke="#b8946a" stroke-width="6"/>`;
    // 冷蔵庫（まえから）
    out += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" rx="16" fill="${FR.body}" stroke="${FR.line}" stroke-width="6"/><line x1="${L}" y1="${T + 360}" x2="${R}" y2="${T + 360}" stroke="${FR.line}" stroke-width="6"/><rect x="${R - 44}" y="${T + 70}" width="14" height="130" rx="7" fill="${FR.metal}"/><rect x="${R - 44}" y="${T + 394}" width="14" height="96" rx="7" fill="${FR.metal}"/>`;
    // すきまを上る熱
    const hk = prog(t, c0 + 0.4, 0.5);
    [0, 1, 2].forEach(i => { out += heatUp(570, 760 - i * 170, t, { n: 1, h: 90, w: 10, o: hk, ph: i * 0.3, rise: 90 }) + heatUp(950, 760 - i * 170, t, { n: 1, h: 90, w: 10, o: hk, ph: i * 0.3 + 0.15, rise: 90 }); });
    out += heatUp(760, 236, t, { n: 3, gap: 90, h: 44, w: 9, o: hk, rise: 20 });
    // すきまのしるし
    const gk = prog(t, mid(0, 0.55), 0.4);
    const dbl = (x1, x2, y) => arrow2((x1 + x2) / 2, y, x1 + 3, y, C.blueUi, 7) + arrow2((x1 + x2) / 2, y, x2 - 3, y, C.blueUi, 7);
    out += g(dbl(542, 598, 300) + dbl(922, 978, 380) + arrow2(760, 220, 760, 194, C.blueUi, 7) + arrow2(760, 220, 760, 247, C.blueUi, 7), { o: gk });
    out += tag(570, 300, 170, 250, 'すきま', gk, { col: C.blueUi, size: 46 }) + tag(950, 380, 1500, 340, 'すきま', gk, { col: C.blueUi, size: 46 }) + tag(785, 220, 1500, 180, 'うえにも すきま', gk, { col: C.blueUi, size: 42 });
    out += pop(badge('ねつが こもらない ように', { fill: FR.hot, size: 44 }), t, c0 + 1.0, 1590, 520);
    out += g(text(0, 0, 'ひつような すきまは、', { size: 32, w: 700, fill: C.muted }) + text(0, 44, 'れいぞうこに よって ちがう', { size: 32, w: 700, fill: C.muted }), { x: 1590, y: 630, o: prog(t, mid(0, 0.7), 0.4) });
    return out;
  },
});

// 9. 正解 と みてみよう
const handIcon = `<ellipse cx="0" cy="4" rx="20" ry="22" fill="${FR.skin}" stroke="${C.ink}" stroke-width="4"/><path d="M -12 -14 V -30 M -4 -17 V -34 M 4 -17 V -34 M 12 -14 V -30" stroke="${FR.skin}" stroke-width="9" stroke-linecap="round"/>`;
const doorIcon = `<rect x="-22" y="-30" width="44" height="60" rx="6" fill="${FR.body}" stroke="${FR.line}" stroke-width="5"/><line x1="-22" y1="6" x2="22" y2="6" stroke="${FR.line}" stroke-width="5"/><rect x="10" y="-20" width="5" height="16" rx="2.5" fill="${FR.metal}"/>`;
const gapIcon = `<rect x="-12" y="-28" width="24" height="56" rx="4" fill="${FR.body}" stroke="${FR.line}" stroke-width="5"/><path d="M -30 -20 V 28 M 30 -20 V 28" stroke="#b8946a" stroke-width="7" stroke-linecap="round"/>`;
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 350, NX = -530;
      let a = pop(card(1240, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.accent}"/>` + text(NX, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, 'なかの ねつを、そとへ はこびだして いるから', { size: fit('なかの ねつを、そとへ はこびだして いるから', 1000, 50, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += flowRow([['なかの ねつ', FR.hot], ['れいばいが はこぶ', FR.cold], ['よこや うしろから へやへ', '#c97a1e']], t, 960, 600, { start: 2.4, step: 0.9, size: 40, gap: 70 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [qm, 'よこと へやの かべ、どっちが あたたかい？', C.ink, cue(1)],
        [g(handIcon, { s: 0.9 }), 'おとなに そっと さわって もらって くらべる', C.ink, cue(2)],
        [g(gapIcon, { s: 0.9 }), 'うえや よこに、すきまは あるかな？', C.ink, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'うしろや したの きかいに、てを いれない', C.red, cue(4)],
        [g(doorIcon, { s: 0.9 }), 'ドアは あけたら、すぐ しめる', C.accent, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 880, 42, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 310 + i * 100); });
      // 冷蔵庫の横 と 部屋のかべ
      const PX = 1500, PY = 500;
      let p = card(700, 560, { fill: FR.wall }) + `<clipPath id="lkc"><rect x="-350" y="-280" width="700" height="560" rx="28"/></clipPath><g clip-path="url(#lkc)"><rect x="-350" y="200" width="700" height="80" fill="${FR.floor}"/>`;
      p += g(fridge3D(t, { warm: 0.8 }), { x: -120, y: 232, s: 0.66 }) + `</g>`;
      p += heatUp(-120 + SIDE_C[0] * 0.66, 232 - 300, t, { n: 2, gap: 30, h: 56, w: 7 });
      p += g(text(0, 0, '？', { size: 80, w: 900, fill: C.ochre }), { x: 96, y: -150 }) + g(text(0, 0, '？', { size: 80, w: 900, fill: C.ochre }), { x: 250, y: -40 });
      p += text(-60, -226, 'れいぞうこの よこ', { size: 36, w: 900, fill: FR.hot }) + text(236, -150, 'かべ', { size: 40, w: 900, fill: C.muted });
      p += `<line x1="170" y1="-110" x2="310" y2="-110" stroke="#d8c3a2" stroke-width="5" stroke-dasharray="10 10"/>`;
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
    out += g(text(0, 0, 'くわしくは サイトの「れいぞうこ」の ページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 778, o: prog(t, 2.0, 0.5) });
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

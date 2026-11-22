// みのまわり図鑑 動画「あめの あと、じめんの みずは どこへ いくの？」
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
const TOPIC = 'あめの ゆくえ';
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

// みのまわり図鑑 動画「あめの あと、じめんの みずは どこへ いくの？」（あめの ゆくえ）
// 出どころ：everyday-trivia trivia/rain-ground-water.md（絵の見本：assets/figures-rain-ground.js、メモ：ideas/notes/rain-ground-water.md）

// ---------- あめの ゆくえの道具 ----------
const RG = {
  soil: '#dcc19a', soilDk: '#b98f62', soilWet: '#b9976c', grain: '#a97c50', grain2: '#c49766', sand: '#f3e4b8', sandG: '#dcb968', sandG2: '#e9cf8c',
  water: '#4a9ee0', waterLt: '#9fd0f2', waterDk: '#2c78b8', vapor: '#7fc0ea', asph: '#565b61', asphLt: '#7b828a', walk: '#cfc8bc', walkDk: '#aaa294',
  grass: '#6fb463', grassDk: '#4f9450', pipe: '#8d99a3', pipeDk: '#6c7780', cloud: '#9aa5b0', yard: '#dcbd8c', yardWet: '#b79566',
};
const rad = a => a * Math.PI / 180;
// 指し線つきのラベル（指す点が x, y。ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 40 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
// 白い ふだ（絵の上でも 読める ラベル）
const pill = (str, { col = C.ink, size = 44 } = {}) => {
  const w = tw(str, size, 900) + 56;
  return `<rect x="${-w / 2}" y="${-size * 0.82}" width="${w}" height="${size * 1.64}" rx="${size * 0.82}" fill="#fff" stroke="${col}" stroke-width="5"/>` + ctext(0, 2, str, { size, w: 900, fill: col });
};
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 矢じり（先が x, y。a は進む向き・ラジアン）
const arrowHead = (x, y, a, col, h = 30) =>
  `<path d="M ${x + Math.cos(a) * h * 0.45} ${y + Math.sin(a) * h * 0.45} L ${x - Math.cos(a - 0.55) * h} ${y - Math.sin(a - 0.55) * h} L ${x - Math.cos(a + 0.55) * h} ${y - Math.sin(a + 0.55) * h} Z" fill="${col}"/>`;
// 道を k（0〜1）まで描く。描きおわったら、白い点線が進む向きへ流れる
function road(d, col, w, k = 1, { o = 1, flow = true, speed = 26 } = {}) {
  if (k <= 0 || o <= 0) return '';
  let s = `<path d="${d}" pathLength="100" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(100 * k).toFixed(2)} 300"/>`;
  if (flow && k >= 1) s += `<path d="${d}" pathLength="100" fill="none" stroke="#fff" stroke-width="${w * 0.36}" stroke-linecap="round" stroke-dasharray="2.2 7.8" stroke-dashoffset="${(-NOW.t * speed).toFixed(2)}" opacity="0.85"/>`;
  return `<g opacity="${o}">${s}</g>`;
}
// まっすぐな矢印（k で のびる）
function arrowL(x1, y1, x2, y2, col, w, k = 1, o = 1) {
  if (k <= 0 || o <= 0) return '';
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1) * eo(k), xe = x1 + Math.cos(a) * L, ye = y1 + Math.sin(a) * L, h = w * 2.4;
  return `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${xe - Math.cos(a) * h * 0.5}" y2="${ye - Math.sin(a) * h * 0.5}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>${arrowHead(xe, ye, a, col, h)}</g>`;
}
const fitSize = (str, size, maxW, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 14 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
const skyG = (id, top, bot, { x = 0, y = 0, w = 1920, h = 1080 } = {}) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
// ふっている雨
function rainFx(x0, x1, y0, y1, t, { n = 40, u = 1, o = 1, seed = 1, col = '#6aaee6' } = {}) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd(i, seed)), f = (t * (1.1 + rnd(i, seed + 2) * 0.6) + rnd(i, seed + 1)) % 1, y = lerp(y0, y1, f), len = 34 * u;
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - len * 0.2).toFixed(1)}" y2="${(y + len).toFixed(1)}" stroke="${col}" stroke-width="${(5 * u).toFixed(1)}" stroke-linecap="round" opacity="${(0.75 * Math.min(1, f * 6, (1 - f) * 6)).toFixed(2)}"/>`;
  }
  return `<g opacity="${o}">${s}</g>`;
}
// しずく
const dropG = (x, y, r = 10, col = RG.water, o = 1) => o <= 0 ? '' : `<path d="M ${x} ${y - r * 1.9} C ${x + r * 0.5} ${y - r} ${x + r} ${y - r * 0.4} ${x + r} ${y + r * 0.2} A ${r} ${r} 0 0 1 ${x - r} ${y + r * 0.2} C ${x - r} ${y - r * 0.4} ${x - r * 0.5} ${y - r} ${x} ${y - r * 1.9} Z" fill="${col}" opacity="${o}"/>`;
// 水たまり
const puddleG = (x, y, rx, ry = null, o = 1) => rx <= 3 ? '' : `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry ?? rx * 0.17}" fill="${RG.waterLt}" stroke="${RG.water}" stroke-width="5" opacity="${o}"/><ellipse cx="${x - rx * 0.3}" cy="${y - (ry ?? rx * 0.17) * 0.25}" rx="${rx * 0.3}" ry="${(ry ?? rx * 0.17) * 0.25}" fill="#fff" opacity="${0.6 * o}"/>`;
// 空へ のぼる 水蒸気（ゆらゆらの 点線と、上むきの 矢じり）
function vaporG(x, y, h, t, o = 1, col = RG.vapor, w = 9) {
  if (o <= 0 || h < 20) return '';
  let d = '';
  for (let yy = 0; yy <= h - 22; yy += 6) d += `${d ? 'L' : 'M'} ${(x + Math.sin(yy / 26 + t * 2.4 + x * 0.01) * 12 * Math.min(1, yy / 40)).toFixed(1)} ${(y - yy).toFixed(1)} `;
  const xt = x + Math.sin((h - 22) / 26 + t * 2.4 + x * 0.01) * 12;
  return `<g opacity="${o}"><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="3 20" stroke-dashoffset="${(-t * 50).toFixed(1)}"/>${arrowHead(xt, y - h, -Math.PI / 2, col, w * 2.6)}</g>`;
}
// つぶ（ハチの巣ならび）。箱 (x, y, w, h) の中に、半径 r のつぶ
function grainPts(x, y, w, h, r, gap = 1.2) {
  const st = r * 2 * gap, pts = [];
  let row = 0;
  for (let cy = y + r + 2; cy <= y + h + r; cy += st * 0.88, row++)
    for (let cx = x + r + 2 + (row % 2 ? st / 2 : 0) - st; cx <= x + w + r; cx += st) pts.push([cx, cy, row]);
  return pts;
}
function grainsG(x, y, w, h, r, { c1 = RG.grain, c2 = RG.grain2, gap = 1.2, seed = 1, o = 1 } = {}) {
  return grainPts(x, y, w, h, r, gap).map(([cx, cy], i) => `<circle cx="${(cx + (rnd(i, seed) - 0.5) * r * 0.12).toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * (0.9 + rnd(i, seed + 1) * 0.1)).toFixed(1)}" fill="${rnd(i, seed + 2) < 0.5 ? c1 : c2}" opacity="${o}"/>`).join('');
}
// 土や砂の箱。front（0〜1）まで、上から 水が しみている
function soilBox(id, x, y, w, h, r, front, { c1 = RG.grain, c2 = RG.grain2, dry = '#f6ead6', gap = 1.2, rx = 26, seed = 1 } = {}) {
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath><g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${dry}"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${(h * clamp(front)).toFixed(1)}" fill="${RG.water}"/>` + grainsG(x, y, w, h, r, { c1, c2, gap, seed }) + `</g>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${C.ink}" stroke-width="7"/>`;
}
// 太陽（まわりに 光の すじ）
function sunG(x, y, r, t, o = 1) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.25; s += `<line x1="${x + Math.cos(a) * r * 1.3}" y1="${y + Math.sin(a) * r * 1.3}" x2="${x + Math.cos(a) * r * 1.7}" y2="${y + Math.sin(a) * r * 1.7}" stroke="#ffd45a" stroke-width="${r * 0.14}" stroke-linecap="round"/>`; }
  return `<g opacity="${o}">${s}${sunDisc(x, y, r, 0.12, { glow: 0.6 })}</g>`;
}
// くさ
const grassG = (x0, x1, yf, n = 14, seed = 3) => { let s = ''; for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + rnd(i, seed) * 0.6) / n), y = yf(x); s += `<path d="M ${x - 9} ${y + 2} L ${x - 5} ${y - 20} L ${x} ${y + 2} L ${x + 5} ${y - 26} L ${x + 10} ${y + 2} Z" fill="${RG.grass}"/>`; } return s; };

// 1. つかみ：校庭の水たまりが、雨のあと なくなっている
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c3 = cue(3);
    const rainK = 1 - prog(t, c1 - 0.3, 1.2), clr = eio(prog(t, c1 - 0.2, 2.4));
    let out = skyG('hsky', mix('#8a9cae', '#7fc4ee', clr), mix('#c6d0d9', '#dcf1fb', clr));
    out += sunG(1640, 170, 74, t, clr);
    const cc = mix('#8d98a4', '#ffffff', clr);
    out += cloud(360 - t * 8, 190, 1.9, cc, lerp(1, 0.9, clr)) + cloud(960 - t * 12, 150, 2.3, cc, lerp(1, 0.55, clr)) + cloud(1500 - t * 16, 210, 1.8, cc, lerp(1, 0.15, clr));
    // 校舎
    const wall = mix('#d9cdb9', '#f6ecd8', clr);
    out += `<rect x="1060" y="330" width="640" height="290" fill="${wall}"/><rect x="1040" y="310" width="680" height="30" rx="6" fill="${mix('#8b6f62', '#b0685a', clr)}"/><rect x="1330" y="250" width="100" height="70" fill="${wall}"/><circle cx="1380" cy="286" r="24" fill="#fff" stroke="${C.ink}" stroke-width="5"/><path d="M 1380 286 L 1380 272 M 1380 286 L 1390 290" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
    for (let r = 0; r < 2; r++) for (let k = 0; k < 6; k++) if (!(r === 1 && k === 3)) out += `<rect x="${1096 + k * 100}" y="${370 + r * 112}" width="68" height="74" rx="6" fill="${mix('#aebccb', '#bfe0f2', clr)}"/>`;
    out += `<rect x="1392" y="482" width="76" height="138" rx="6" fill="${mix('#7a685c', '#9a7b62', clr)}"/>`;
    out += tree(250, 660, 2.0, mix('#4d7a5a', '#4a9a54', clr)) + tree(520, 650, 1.5, mix('#557f60', '#57a85f', clr)) + tree(1820, 660, 1.6, mix('#4d7a5a', '#4a9a54', clr));
    // 校庭
    const dry = eio(prog(t, c1 + 0.5, d1 + 1.5));
    out += `<path d="M 0 640 Q 960 600 1920 640 L 1920 1080 L 0 1080 Z" fill="${mix(RG.yardWet, RG.yard, dry)}"/>`;
    out += `<ellipse cx="960" cy="720" rx="760" ry="56" fill="none" stroke="#fff" stroke-width="8" opacity="0.55"/>`;
    // 水たまり
    const grow = eo(prog(t, c0 + 0.2, 3.6)), shr = eio(prog(t, c1 + 0.6, d1 - 0.4)), rx = 340 * grow * (1 - shr), PX = 1010, PY = 790;
    out += `<ellipse cx="${PX}" cy="${PY}" rx="${390 * grow}" ry="${72 * grow}" fill="${RG.yardWet}" opacity="${(1 - dry) * 0.9}"/>`;
    out += puddleG(PX, PY, rx, rx * 0.17);
    if (rainK > 0 && rx > 40) for (let i = 0; i < 5; i++) { const f = (t * 0.9 + i / 5) % 1, ex = PX + (rnd(i + Math.floor(t * 0.9 + i / 5), 7) - 0.5) * rx * 1.2, ey = PY + (rnd(i, 8) - 0.5) * rx * 0.14; out += `<ellipse cx="${ex}" cy="${ey}" rx="${10 + f * 40}" ry="${3 + f * 9}" fill="none" stroke="#fff" stroke-width="4" opacity="${(1 - f) * 0.8 * rainK}"/>`; }
    out += rainFx(-40, 1960, -60, 900, t, { n: 110, seed: 2, o: rainK, u: 1.2 });
    // 子どもたち
    const k0 = c1 + d1 * 0.5;
    out += kidShow('B', t, 170, 900, { s: 0.6, start: k0 + 0.3, n: 1, look: [8, 4], bubble: false, enter: 'slideL' });  // 左はしから（水たまりを 横ぎらない）
    out += kidShow('S', t, 360, 900, { s: 0.6, start: k0, n: 0, look: [8, 4], eyes: lineOf('S') ? 'wide' : 'open' });
    // みずは どこへ？
    const q0 = c3 + 0.5, qe = cueE(3) + 0.6;
    [[-150, -40, -2.2], [0, -90, -Math.PI / 2], [150, -40, -0.95]].forEach(([dx, dy, a], i) => { out += pop(g(arrowL(0, 0, Math.cos(a) * 120, Math.sin(a) * 120, RG.waterDk, 16, 1)) + big(Math.cos(a) * 190, Math.sin(a) * 190, '？', 110, C.ochre), t, q0 + i * 0.3, PX + dx, PY + dy - 40, { end: qe }); });
    out += pop(pill('みずは どこへ？', { col: RG.waterDk, size: 60 }), t, q0 + 1.0, PX, PY + 6, { end: qe });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="118" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${RG.waterDk}">あめ</tspan>の あと、じめんの <tspan fill="${RG.waterDk}">みず</tspan>は</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.ochre}">どこへ</tspan> いくの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(puddleG(0, 20, 150, 26) + dropG(-250, 0, 26) + dropG(250, 0, 26), t, t0 + 1.8, 960, 810);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const q = 'みずが いちばん はやく しみこむのは？';
    out += pop(text(0, 0, q, { size: 72, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'つぶの こまかい、つちの じめん'], ['②', 'つぶの おおきい、すなばの すな'], ['③', 'くろい、アスファルトの みち']];
    // 見本（右はしの 小さな絵）
    const sw = i => `<clipPath id="gsw${i}"><rect x="390" y="-46" width="150" height="92" rx="16"/></clipPath><g clip-path="url(#gsw${i})">` +
      (i === 0 ? `<rect x="390" y="-46" width="150" height="92" fill="#f6ead6"/>` + grainsG(390, -46, 150, 92, 7, { seed: 5 })
        : i === 1 ? `<rect x="390" y="-46" width="150" height="92" fill="#fbf3dc"/>` + grainsG(390, -46, 150, 92, 17, { c1: RG.sandG, c2: RG.sandG2, seed: 6 })
          : `<rect x="390" y="-46" width="150" height="92" fill="${RG.asph}"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(k => `<circle cx="${400 + rnd(k, 9) * 130}" cy="${-36 + rnd(k, 10) * 72}" r="4" fill="${RG.asphLt}"/>`).join('')) +
      `</g><rect x="390" y="-46" width="150" height="92" rx="16" fill="none" stroke="${C.ink}" stroke-width="5"/>`;
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: fitSize(s, 50, 790), w: 700, anchor: 'start' }) + sw(i), t, cue(i + 1) - 0.2, 900, 390 + i * 168);
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

// 3. いきさきは 3つ：しみこむ・ながれる・そらへ もどる
const surf3 = x => x < 640 ? 560 : x > 1260 ? 660 : 560 + 100 * eio((x - 640) / 620);
function landPath(f, x0 = 0, x1 = 1920, step = 20) { let d = `M ${x0} ${f(x0)}`; for (let x = x0 + step; x <= x1; x += step) d += ` L ${x} ${f(x).toFixed(1)}`; return d; }
SCENES.push({
  id: 'three',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = skyG('tsky', '#9fd3f2', '#e3f4fc');
    const rainO = 1 - prog(t, c(1) + 0.6, 1.5), sunO = prog(t, c(3) - 0.4, 0.8);
    out += sunG(1660, 180, 70, t, sunO);
    out += rainFx(150, 620, 250, 548, t, { n: 34, seed: 4, o: rainO });
    out += cloud(380, 230, 2.2, mix('#9aa5b0', '#ffffff', 1 - rainO * 0.9), 1) + topBadge();
    // 地面（左が高く、右が低い）と、土のつぶ
    const land = landPath(surf3) + ' L 1920 1080 L 0 1080 Z';
    out += `<clipPath id="tland"><path d="${land}"/></clipPath><path d="${land}" fill="${RG.soil}"/><g clip-path="url(#tland)">${grainsG(0, 590, 1920, 500, 22, { o: 0.55, seed: 11 })}</g>`;
    out += `<path d="${landPath(surf3)}" fill="none" stroke="${RG.grassDk}" stroke-width="14" stroke-linecap="round"/>` + grassG(20, 620, surf3, 9, 3);
    out += pop(text(0, 0, 'あめの いきさきは 3つ', { size: 70, w: 900, extra: 'stroke="#fff" stroke-width="14" paint-order="stroke" stroke-linejoin="round"' }), t, c(0) + 0.3, 1040, 130);
    // 1 しみこむ
    const k1 = prog(t, c(1), 0.8);
    [[250, 0.15, 150], [400, 0, 210], [550, 0.3, 150]].forEach(([x, dl, len]) => { out += arrowL(x, 580, x, 580 + len, RG.waterDk, 18, prog(t, c(1) + dl, 0.8)); });
    out += pop(pill('しみこむ', { col: RG.waterDk, size: 50 }), t, c(1) + 0.3, 400, 462);
    // 2 ながれる
    const k2 = prog(t, c(2) + 0.2, 1.4), pk = eo(prog(t, c(2) + 1.2, 2.0));
    out += puddleG(1560, 664, 230 * pk, 34 * pk);
    out += road('M 700 538 C 900 540 1060 640 1290 640', RG.water, 18, k2) + (k2 >= 0.97 ? arrowHead(1300, 640, 0.02, RG.water, 44) : '');
    out += pop(pill('ながれる', { col: RG.water, size: 50 }), t, c(2) + 0.5, 1020, 480);
    // 3 そらへ もどる
    const k3 = eo(prog(t, c(3) + 0.3, 1.6));
    [1450, 1560, 1670].forEach((x, i) => { out += vaporG(x, 640, 250 * k3 + (i === 1 ? 40 * k3 : 0), t, prog(t, c(3) + 0.2 + i * 0.15, 0.4)); });
    out += pop(pill('そらへ もどる', { col: '#3d8fc4', size: 50 }), t, c(3) + 0.6, 1330, 330);
    return out;
  },
});

// 4. しみこむ：土は つぶの あつまり。つぶが 大きいと はやい
SCENES.push({
  id: 'soak',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A：土を 大きく して みると
    const aO = 1 - prog(t, c(2) - 0.5, 0.4);
    if (aO > 0) {
      const X = 470, Y = 260, W = 1040, H = 530, R = 60, st = R * 2 * 1.2;
      let a = pop(badge('しみこむ', { fill: RG.waterDk, size: 48, pad: 40 }), t, 0.3, 700, 150);
      a += g(text(0, 0, 'つちは ちいさな つぶの あつまり', { size: 52, w: 900, anchor: 'start' }), { x: 860, y: 152, o: prog(t, c(0) + d(0) * 0.45, 0.4) });
      // 小さな地面と ルーペ
      a += `<clipPath id="sk0"><circle cx="230" cy="520" r="130"/></clipPath><g clip-path="url(#sk0)"><rect x="100" y="390" width="260" height="130" fill="#bfe3f7"/><rect x="100" y="510" width="260" height="140" fill="${RG.soil}"/>${grainsG(100, 520, 260, 130, 9, { seed: 21 })}<rect x="100" y="504" width="260" height="12" fill="${RG.grassDk}"/></g><circle cx="230" cy="520" r="130" fill="none" stroke="${C.ink}" stroke-width="7"/>`;
      a += g(lensIcon(), { x: 290, y: 580, s: 0.62 });
      a += `<line x1="330" y1="530" x2="${X}" y2="${Y + 20}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/><line x1="330" y1="620" x2="${X}" y2="${Y + H - 20}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/>`;
      const front = prog(t, c(1) + d(1) * 0.4, 3.6);
      a += soilBox('skA', X, Y, W, H, R, front, { seed: 22 });
      // ふってくる しずく
      const dO = prog(t, c(1) + 0.2, 0.4);
      for (let i = 0; i < 7; i++) { const f = (t * 1.3 + rnd(i, 23)) % 1; a += dropG(X + 80 + i * 150, Y - 130 + f * 110, 13, RG.water, dO * Math.min(1, f * 5, (1 - f) * 5)); }
      // なまえ：つぶ と すきま
      const gx = X + R + 2 + 5 * st, gy = Y + R + 2;
      a += tag(gx, gy, 1690, 330, 'つぶ', prog(t, c(0) + d(0) * 0.6, 0.3), { col: RG.soilDk, size: 46 });
      a += tag(gx + st / 2, gy + st * 0.88 / 3 + 4, 1700, 520, 'すきま', prog(t, c(1) + 0.3, 0.3), { col: RG.waterDk, size: 46 });
      out += g(a, { o: aO });
    }
    // B：砂 と こまかい土 を くらべる
    const bO = prog(t, c(2) - 0.2, 0.4);
    if (bO > 0) {
      const Y = 300, W = 480, H = 430, t0 = c(2) + 1.0;
      const fS = prog(t, t0, 2.8), fT = prog(t, t0, 34);
      let b = '';
      [[280, 'すな', 'つぶが おおきい', '#a8801e'], [900, 'こまかい つち', 'つぶが ちいさい', RG.soilDk]].forEach(([x, nm, sub, col], i) => {
        b += g(text(x + W / 2, 158, nm, { size: 60, w: 900, fill: col }) + text(x + W / 2, 218, sub, { size: 38, w: 900, fill: C.muted }), { o: prog(t, c(2) + i * 0.3, 0.4) });
        // そそぐ 水
        const pour = win(t, t0 - 0.3, i === 0 ? t0 + 2.4 : 1e9, 0.3);
        if (i === 1) { const pool = clamp((t - t0) / 3) * 26; b += `<rect x="${x + 8}" y="${Y - pool}" width="${W - 16}" height="${pool + 6}" rx="8" fill="${RG.water}" opacity="${prog(t, t0, 0.5)}"/>`; }
        b += i === 0 ? soilBox('skS', x, Y, W, H, 34, fS, { c1: RG.sandG, c2: RG.sandG2, dry: '#fbf3dc', seed: 31 }) : soilBox('skT', x, Y, W, H, 13, fT, { seed: 32 });
        // じょうろの しずく（上から）
        for (let k = 0; k < 5; k++) { const f = (t * 1.6 + k / 5 + i * 0.37) % 1; b += dropG(x + 70 + k * 85, 262 + f * 30 - (i === 1 ? clamp((t - t0) / 3) * 26 : 0), 10, RG.water, pour * Math.min(1, f * 4, (1 - f) * 4)); }
      });
      // 砂の下から 出てくる 水
      const outO = prog(t, t0 + 2.8, 0.4);
      for (let k = 0; k < 4; k++) { const f = (t * 1.2 + k / 4) % 1; b += dropG(280 + 90 + k * 100, Y + H + 20 + f * 50, 10, RG.water, outO * (1 - f)); }
      b += pop(badge('はやい', { fill: RG.waterDk, size: 50, pad: 44 }), t, t0 + 2.9, 280 + W / 2, 808 - 4, { s: 1 });
      b += pop(badge('ゆっくり', { fill: RG.soilDk, size: 50, pad: 44 }), t, c(3) + d(3) * 0.5, 900 + W / 2, 808 - 4, { s: 1 });
      b += kidShow('K', t, 1700, 850, { s: 0.8, start: c(3) + 0.8, n: 0, bubble: false });
      b += talkBubble('K', 1640, 480, 1612, 698, 46);  // しっぽは カメレオンの 頭へ
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 5. ながれる：のみきれない水は、低いところへ集まって 水たまりに
const surf5 = x => 520 + 96 * Math.exp(-Math.pow((x - 1040) / 330, 2));
SCENES.push({
  id: 'puddle',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = skyG('psky', '#8a9cae', '#c9d3db');
    out += cloud(300 - t * 6, 150, 2.4, '#7f8b98', 1) + cloud(980 - t * 9, 110, 2.8, '#8d98a4', 1) + cloud(1640 - t * 7, 160, 2.3, '#7f8b98', 1);
    const land = landPath(surf5) + ' L 1920 1080 L 0 1080 Z';
    // 土（上のほうは 水で いっぱい）
    const sat = eo(prog(t, 0.2, c(0) + d(0) * 0.6));
    out += `<clipPath id="pland"><path d="${land}"/></clipPath><path d="${land}" fill="${RG.soil}"/><g clip-path="url(#pland)"><path d="${landPath(x => surf5(x) + 150 * sat)} L 1920 0 L 0 0 Z" fill="${RG.water}" opacity="0.85"/>${grainsG(0, 500, 1920, 600, 20, { seed: 41 })}</g>`;
    // 水たまり（低いところに たまる水）
    const lv = eo(prog(t, c(1) + d(1) * 0.2, d(1) * 0.65)), yw = lerp(618, 554, lv);
    if (lv > 0) { let pd = '', first = true; for (let x = 600; x <= 1480; x += 10) { const ys = surf5(x); if (ys > yw) { pd += `${first ? 'M' : 'L'} ${x} ${yw} `; first = false; } } for (let x = 1480; x >= 600; x -= 10) { const ys = surf5(x); if (ys > yw) pd += `L ${x} ${ys.toFixed(1)} `; } if (pd) out += `<path d="${pd} Z" fill="${RG.waterLt}" stroke="${RG.water}" stroke-width="5" stroke-linejoin="round"/>`; }
    out += `<path d="${landPath(surf5)}" fill="none" stroke="${RG.soilDk}" stroke-width="12" stroke-linecap="round"/>`;
    // 地面の上を おおう水
    const film = prog(t, c(0) + d(0) * 0.35, 1.2);
    out += `<path d="${landPath(x => surf5(x) - 9)}" fill="none" stroke="${RG.water}" stroke-width="12" stroke-linecap="round" opacity="${film * 0.9}"/>`;
    out += rainFx(-40, 1960, 40, 520, t, { n: 130, seed: 5, u: 1.25 }) + topBadge();
    // ながれる しずく（左右から 低いところへ）
    const fl = prog(t, c(1) + 0.1, 0.5);
    if (fl > 0) for (let i = 0; i < 12; i++) {
      const sd = i % 2 ? 1 : -1, f = (t * 0.35 + i / 12) % 1, x = 1040 + sd * lerp(820, 120, eio(f));
      out += dropG(x, surf5(x) - 18, 13, RG.waterDk, fl * Math.min(1, f * 6, (1 - f) * 5));
    }
    [[-1, 330, 700], [1, 1750, 1380]].forEach(([sd, x1, x2]) => { const k = prog(t, c(1) + 0.3, 1.0); out += arrowL(x1, surf5(x1) - 70, x2, surf5(x2) - 70, RG.waterDk, 16, k); });
    // ことば
    out += tag(330, surf5(330) - 9, 380, 330, 'のみきれない みず', win(t, c(0) + d(0) * 0.5, c(1) + 0.2, 0.3), { col: RG.waterDk, size: 46 });
    out += pop(pill('ひくい ところへ', { col: RG.waterDk, size: 46 }), t, c(1) + 0.6, 1040, 330);
    out += tag(1040, yw + 22, 1500, 330, 'みずたまり', prog(t, c(1) + d(1) * 0.7, 0.3), { col: RG.waterDk, size: 50 });
    return out;
  },
});

// 6. まちの雨：アスファルトには しみこまない → みぞ → パイプ → 川
const roadY = x => 622 - 62 * (1 - Math.pow((x - 900) / 500, 2));  // 道路の面：まん中 560、はし 622（見やすいように 大げさに）
SCENES.push({
  id: 'street',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = skyG('ssky', '#9fb0c0', '#d5dde4');
    out += cloud(520 - t * 6, 150, 2.2, '#8d98a4', 1) + cloud(1300 - t * 8, 120, 2.6, '#99a4b0', 1);
    // まちなみ
    const SW = 572;  // 歩道の高さ
    out += `<rect x="40" y="250" width="220" height="${SW - 250}" fill="#c9bfae"/>` + [0, 1, 2, 3].map(r => [0, 1].map(k => `<rect x="${68 + k * 96}" y="${278 + r * 70}" width="66" height="44" rx="4" fill="#dfeaf2"/>`).join('')).join('');
    out += house(340, SW, 1.25, '#f1e4cd', '#b56a56');
    out += `<rect x="1424" y="300" width="180" height="${SW - 300}" fill="#b9c2c9"/>` + [0, 1, 2, 3].map(r => [0, 1].map(k => `<rect x="${1448 + k * 76}" y="${324 + r * 60}" width="54" height="38" rx="4" fill="#e3eef5"/>`).join('')).join('');
    // 土・川
    const RX = 1640, RW = 770;
    out += `<rect x="0" y="${SW + 20}" width="1920" height="${1080 - SW}" fill="${RG.soil}"/>${grainsG(0, 660, 1920, 440, 20, { o: 0.45, seed: 51 })}`;
    out += `<rect x="${RX}" y="${SW}" width="${1920 - RX}" height="${1080 - SW}" fill="#cfe3ef"/><rect x="${RX}" y="${RW}" width="${1920 - RX}" height="90" fill="${RG.water}"/><path d="M ${RX} ${RW + 2} q 35 -12 70 0 t 70 0 t 70 0 t 70 0 t 70 0" fill="none" stroke="#fff" stroke-width="5" opacity="0.7" transform="translate(${((t * 30) % 70) - 70} 0)"/><rect x="${RX}" y="${RW + 90}" width="${1920 - RX}" height="300" fill="${RG.soilDk}"/><rect x="${RX - 14}" y="${SW}" width="14" height="${RW + 100 - SW}" fill="${RG.walkDk}"/>`;
    // パイプ
    const PY = 738, pk = prog(t, c(2) + 0.2, 2.0);
    const pipes = [`M 440 630 L 440 ${PY} L ${RX - 4} ${PY}`, `M 1360 630 L 1360 ${PY}`];
    pipes.forEach(p => { out += `<path d="${p}" fill="none" stroke="${RG.pipeDk}" stroke-width="52" stroke-linejoin="round"/><path d="${p}" fill="none" stroke="#dfe6eb" stroke-width="38" stroke-linejoin="round"/>`; });
    out += road(pipes[1], RG.water, 28, prog(t, c(2) + 0.2, 0.8), { speed: 40 }) + road(pipes[0], RG.water, 28, pk, { speed: 22 });
    if (pk >= 1) for (let i = 0; i < 3; i++) { const f = (t * 1.4 + i / 3) % 1; out += dropG(RX + 12 + f * 14, PY + 6 + f * 26, 9, RG.water, 1 - f * 0.6); }
    // 歩道・道路
    out += `<rect x="0" y="${SW}" width="400" height="72" fill="${RG.walk}"/><rect x="0" y="${SW}" width="400" height="12" fill="${RG.walkDk}"/><rect x="1400" y="${SW}" width="${RX - 1400}" height="72" fill="${RG.walk}"/><rect x="1400" y="${SW}" width="${RX - 1400}" height="12" fill="${RG.walkDk}"/>`;
    out += `<path d="${landPath(roadY, 400, 1400)} L 1400 684 L 400 684 Z" fill="${RG.asph}"/><path d="${landPath(roadY, 400, 1400)}" fill="none" stroke="${RG.asphLt}" stroke-width="8"/>`;
    out += `<rect x="880" y="${roadY(900) - 4}" width="40" height="9" rx="4" fill="#f1f1e8"/>`;
    // みぞ（ふたつき）
    [400, 1320].forEach(x => { out += `<rect x="${x}" y="614" width="80" height="18" rx="3" fill="#33373b"/>` + [0, 1, 2, 3].map(k => `<rect x="${x + 9 + k * 18}" y="616" width="8" height="14" rx="2" fill="#aab2b9"/>`).join(''); });
    out += rainFx(-40, 1960, 20, 600, t, { n: 110, seed: 6, u: 1.15 }) + topBadge();
    // はねる しずく（しみこまない）
    const n0 = prog(t, c(0) + 0.3, 0.4);
    for (let i = 0; i < 9; i++) { const f = (t * 1.6 + rnd(i, 61)) % 1, x = 520 + i * 96, y = roadY(x), h = 34 * Math.sin(f * Math.PI); out += `<path d="M ${x - 30 * f} ${y - h} L ${x - 30 * f - 7} ${y - h - 10} M ${x + 30 * f} ${y - h} L ${x + 30 * f + 7} ${y - h - 10}" stroke="${RG.water}" stroke-width="7" stroke-linecap="round" opacity="${n0 * (1 - f)}"/>`; }
    out += pop(pill('しみこまない', { col: C.redUi, size: 46 }), t, c(0) + d(0) * 0.5, 900, 640, { end: c(2) - 0.2 });
    out += tag(690, roadY(690) + 30, 640, 400, 'アスファルト', win(t, c(0) + 0.3, c(1) - 0.1, 0.3), { size: 46 });
    // まん中が 少し 高い → はしの みぞへ
    const k1 = prog(t, c(1) + 0.4, 0.5), TOP = roadY(900);
    out += g(`<path d="M 900 ${TOP - 110} L 900 ${TOP - 34}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>` + arrowHead(900, TOP - 24, Math.PI / 2, C.ink, 24), { o: k1 }) + pop(pill('まんなかが すこし たかい', { col: C.ink, size: 46 }), t, c(1) + 0.4, 900, TOP - 152);
    const k2 = prog(t, c(1) + d(1) * 0.45, 1.2);
    [[-1, 830, 500], [1, 970, 1300]].forEach(([sd, x1, x2]) => {
      let p = `M ${x1} ${roadY(x1) - 18}`; for (let x = x1; sd > 0 ? x <= x2 : x >= x2; x += sd * 20) p += ` L ${x} ${(roadY(x) - 18).toFixed(1)}`;
      out += road(p, RG.water, 16, k2) + (k2 >= 0.97 ? arrowHead(x2 + sd * 10, roadY(x2) - 13, sd > 0 ? 0.22 : Math.PI - 0.22, RG.water, 38) : '');
    });
    out += tag(440, 624, 300, 440, 'みぞ', prog(t, c(1) + d(1) * 0.6, 0.3), { col: RG.waterDk, size: 50 });
    out += tag(1000, PY + 20, 1000, 826, 'じめんの したの パイプ', prog(t, c(2) + 0.6, 0.3), { col: RG.pipeDk, size: 42 });
    out += tag(RX + 150, RW + 40, RX + 130, 470, 'かわ', prog(t, c(2) + d(2) * 0.55, 0.3), { col: RG.waterDk, size: 50 });
    return out;
  },
});

// 7. そらへ もどる：水たまりや地面から 蒸発する
SCENES.push({
  id: 'sky',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    const day = eio(prog(t, c(2) + 0.5, d(2) - 0.6));  // あさ → ゆうがた
    let out = skyG('ysky', mix('#7fc4ee', '#7f9ed6', day * day), mix('#dcf1fb', '#ffd7a6', day * day));
    const sx = lerp(400, 1560, day), sy = 300 - 150 * Math.sin(Math.PI * day);
    out += sunG(sx, sy, 72, t, 1) + cloud(1760 + t * 3, 120, 1.0, '#fff', 0.9) + topBadge();
    out += tree(1790, 665, 1.7, '#4a9a54') + tree(1600, 655, 1.2, '#57a85f');
    out += `<path d="M 0 640 Q 960 606 1920 640 L 1920 1080 L 0 1080 Z" fill="${RG.yard}"/>`;
    const PX = 860, PY = 770, rx = lerp(340, 110, day);
    out += `<ellipse cx="${PX}" cy="${PY}" rx="${410}" ry="${76}" fill="${RG.yardWet}" opacity="${0.85 * (1 - day)}"/>`;
    out += puddleG(PX, PY, rx, rx * 0.17);
    // のぼる 水蒸気
    const k0 = eo(prog(t, c(0) + 0.2, 1.6));
    for (let i = 0; i < 5; i++) out += vaporG(PX + (i - 2) * rx * 0.42, PY - 14, (300 + (i % 2) * 50) * k0, t, prog(t, c(0) + 0.1 + i * 0.12, 0.4) * 0.95, '#ffffff', 9);
    out += pop(pill('そらへ もどる', { col: '#3d8fc4', size: 52 }), t, c(0) + 0.6, PX, 330, { end: c(2) - 0.2 });
    // 大きく して みると：水面から 水の つぶが 出ていく
    const zO = win(t, c(1) + 0.2, c(2) - 0.2, 0.35);
    if (zO > 0) {
      const ZX = 1470, ZY = 450, ZR = 235, WY = ZY + 40;
      let z = `<line x1="${PX + rx * 0.8}" y1="${PY - 30}" x2="${ZX - ZR * 0.8}" y2="${ZY + ZR * 0.6}" stroke="${C.ink}" stroke-width="4" stroke-dasharray="10 10" opacity="0.6"/>`;
      z += `<clipPath id="yz"><circle cx="${ZX}" cy="${ZY}" r="${ZR}"/></clipPath><g clip-path="url(#yz)"><rect x="${ZX - ZR}" y="${ZY - ZR}" width="${ZR * 2}" height="${ZR * 2}" fill="#eef8fe"/><path d="M ${ZX - ZR} ${WY} q 40 -10 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 L ${ZX + ZR} ${ZY + ZR} L ${ZX - ZR} ${ZY + ZR} Z" fill="${RG.waterLt}"/>`;
      for (let i = 0; i < 16; i++) z += `<circle cx="${ZX - 200 + (i % 8) * 56 + Math.sin(t * 5 + i) * 6}" cy="${WY + 46 + Math.floor(i / 8) * 62 + Math.cos(t * 4.3 + i * 2) * 6}" r="13" fill="${RG.water}"/>`;
      for (let i = 0; i < 6; i++) { const f = (t * 0.33 + i / 6) % 1, x = ZX - 170 + i * 68 + Math.sin(f * 7 + i) * 16; z += `<circle cx="${x}" cy="${WY - 6 - f * 240}" r="${13 - f * 3}" fill="${RG.water}" opacity="${(1 - f) * 0.9}"/>`; }
      z += `</g><circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="none" stroke="${C.ink}" stroke-width="8"/>`;
      z += tag(ZX - 150, WY, ZX - 330, ZY + 150, 'すいめん', prog(t, c(1) + 0.6, 0.3), { col: RG.waterDk, size: 40 });
      z += tag(ZX + 40, ZY - 110, ZX + 150, ZY - 290, 'すいじょうき', prog(t, c(1) + d(1) * 0.55, 0.3), { col: '#3d8fc4', size: 44 });
      z += pop(pill('じょうはつ', { col: RG.waterDk, size: 52 }), t, c(1) + d(1) * 0.35, ZX - 250, ZY - 250);
      out += g(z, { o: zO });
    }
    // あさ → ひる → ゆうがた
    const lO = prog(t, c(2) + 0.2, 0.4);
    out += g(pill(day < 0.3 ? 'あさ' : day < 0.72 ? 'ひる' : 'ゆうがた', { col: '#b8791a', size: 44 }), { x: sx, y: sy + 150, o: lO });
    out += pop(pill('だんだん ちいさく なる', { col: RG.waterDk, size: 46 }), t, c(2) + d(2) * 0.3, PX + 60, 600, { end: cue(3) - 0.1 });
    out += kidShow('B', t, 250, 900, { s: 0.62, start: c(2) + 1.0, n: 0, look: [8, 2] });
    return out;
  },
});

// 8. 地下水：じめんの下を ゆっくり → わき水・川 → 海 → 雲 → また雨
const surfU = x => x < 420 ? 340 : x < 1420 ? 340 + 300 * eio((x - 420) / 1000) : 640;
SCENES.push({
  id: 'under',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = skyG('usky', '#9fd3f2', '#e6f5fc') + topBadge();
    const cyc = prog(t, c(4) - 0.1, 0.4);
    out += sunG(1740, 150, 60, t, 1);
    // 陸・海
    const land = landPath(surfU, 0, 1420) + ' L 1920 830 L 1920 1080 L 0 1080 Z';
    let band = landPath(x => surfU(x) + 150, 0, 1920); for (let x = 1920; x >= 0; x -= 20) band += ` L ${x} ${(surfU(x) + 250).toFixed(1)}`; band += ' Z';
    const gw = prog(t, c(0) + 0.3, 1.5);
    out += `<path d="${land}" fill="${RG.soil}"/><clipPath id="uland"><path d="${land}"/></clipPath><g clip-path="url(#uland)"><path d="${band}" fill="${RG.water}" opacity="${0.8 * gw}"/>${grainsG(0, 330, 1920, 760, 19, { o: 0.6, seed: 71 })}</g>`;
    out += `<path d="M 1420 646 L 1920 646 L 1920 830 Z" fill="${RG.water}"/><path d="M 1420 646 q 35 -10 70 0 t 70 0 t 70 0 t 70 0 t 70 0 t 70 0 t 70 0 t 70 0" fill="none" stroke="#fff" stroke-width="5" opacity="0.7" transform="translate(${((t * 26) % 70) - 70} 0)"/>`;
    out += `<path d="${landPath(surfU, 0, 1420)}" fill="none" stroke="${RG.grassDk}" stroke-width="14" stroke-linecap="round"/>` + grassG(20, 780, surfU, 12, 5) + tree(130, 345, 1.1) + tree(300, 345, 0.85) + house(560, 352, 0.9);
    // 川（わき水から 海へ）
    const SPX = 820, riv = landPath(x => surfU(x) - 4, SPX, 1430);
    out += `<path d="M ${SPX} ${surfU(SPX) + 150} Q ${SPX - 10} ${surfU(SPX) + 60} ${SPX} ${surfU(SPX)}" fill="none" stroke="${RG.water}" stroke-width="20" stroke-linecap="round" opacity="${0.8 * gw}"/>`;
    out += `<path d="${riv}" fill="none" stroke="${RG.water}" stroke-width="18" stroke-linecap="round"/><path d="${riv}" pathLength="100" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 8" stroke-dashoffset="${(-t * 34).toFixed(1)}" opacity="0.85"/>`;
    // しみこむ 矢印
    [150, 330, 500].forEach((x, i) => { out += arrowL(x, surfU(x) + 24, x, surfU(x) + 150, RG.waterDk, 14, prog(t, c(0) + 0.2 + i * 0.2, 0.8), 1 - prog(t, c(1) - 0.2, 0.4)); });
    // 地下水の つぶ（ゆっくり 進む）
    for (let i = 0; i < 11; i++) { const x = (i * 165 + t * 16) % 1815, o = Math.min(1, x / 60, (1815 - x) / 80); out += `<circle cx="${x}" cy="${surfU(x) + 200 + (i % 2 ? 16 : -16)}" r="12" fill="#fff" stroke="${RG.waterDk}" stroke-width="5" opacity="${gw * o}"/>`; }
    out += tag(620, surfU(620) + 205, 330, 730, 'ちかすい', prog(t, c(0) + d(0) * 0.5, 0.3), { col: RG.waterDk, size: 50 });
    out += pop(badge('はやくても 1にちに 10〜100メートルくらい', { fill: RG.waterDk, size: 44, pad: 40 }), t, c(1) + d(1) * 0.3, 1010, 150, { end: c(4) - 0.2 });
    // 速さくらべ
    const cmp = pop(card(540, 240) + text(-230, -56, 'かわ', { size: 44, w: 900, fill: RG.waterDk, anchor: 'start' }) + `<line x1="-20" y1="-56" x2="230" y2="-56" stroke="${C.line}" stroke-width="10" stroke-linecap="round"/><circle cx="${-20 + ((t * 0.9) % 1) * 250}" cy="-56" r="16" fill="${RG.water}"/>` +
      text(-230, 52, 'ちかすい', { size: 44, w: 900, fill: RG.soilDk, anchor: 'start' }) + `<line x1="-20" y1="52" x2="230" y2="52" stroke="${C.line}" stroke-width="10" stroke-linecap="round"/><circle cx="${-20 + ((t * 0.04) % 1) * 250}" cy="52" r="16" fill="${RG.waterDk}"/>` +
      text(105, -6, 'はやい', { size: 30, w: 900, fill: C.muted }) + text(105, 102, 'ずっと ゆっくり', { size: 30, w: 900, fill: C.muted }), t, c(2) - 0.1, 1560, 372, { end: c(4) - 0.2 });
    out += cmp;
    out += tag(SPX, surfU(SPX) - 4, 640, 262, 'わきみず', win(t, c(3) + 0.3, 1e9, 0.3), { col: RG.waterDk, size: 46 });
    out += tag(1200, surfU(1200) - 4, 1350, 548, 'かわ', win(t, c(3) + d(3) * 0.35, 1e9, 0.3), { col: RG.waterDk, size: 46 });
    out += g(text(1690, 720, 'うみ', { size: 60, w: 900, fill: '#fff' }), { o: prog(t, c(3) + d(3) * 0.6, 0.4) });
    // 海から 蒸発 → 雲 → また雨
    if (cyc > 0) {
      const v = eo(prog(t, c(4) + 0.2, 1.4)), mv = eio(prog(t, c(4) + d(4) * 0.4, d(4) * 0.35)), cx = lerp(1640, 1010, mv), rn = prog(t, c(4) + d(4) * 0.72, 0.5);
      [1560, 1680, 1800].forEach((x, i) => { out += vaporG(x, 636, 300 * v, t, cyc * (1 - mv * 0.6), '#ffffff', 9); });
      out += rainFx(cx - 170, cx + 190, 250, surfU(cx) - 20, t, { n: 26, seed: 8, o: rn });
      out += pop(cloud(0, 0, 2.0, mix('#ffffff', '#aab4be', rn), 1), t, c(4) + d(4) * 0.22, cx, 215);
      out += pop(pill('また あめに', { col: RG.waterDk, size: 46 }), t, c(4) + d(4) * 0.78, 1010, 72);
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
      const ans = 'つぶの おおきい、すなばの すな';
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, ans, { size: fitSize(ans, 58, 1000, 900), w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['すきまが おおきい', '#a8801e'], ['みずが はやく とおる', RG.waterDk], ['いきさきは 3つ：しみこむ・ながれる・そらへ', C.accent]], t, 960, 660, { size: 34, start: 2.6, step: 1.3 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const pdIc = puddleG(0, 6, 54, 15);
      const qIc = `<circle r="46" fill="${C.ochreSoft}"/>` + text(0, 4, '？', { size: 60, w: 900, fill: C.ochre });
      const items = [
        [pdIc, 'あめの つぎの ひ、すなば・グラウンド・みちを みる', C.ink, 300],
        [qIc, 'どこに みずたまりが のこるか、よそうして たしかめる', C.ink, 396],
        [g(house(0, 38, 0.56, '#f4ead8', '#c0624c')), 'あめの ひは、ほどうや いえの なかから みる', C.ink, 492],
        [warnIcon(0.8), 'みぞの ふたの あなに、てや ぼうを いれない', C.red, 596],
        [warnIcon(0.8), 'ふえた かわや ようすいろに、ちかづかない', C.red, 686],
        [warnIcon(0.8), 'みずたまりの みずを、くちに いれない', C.red, 776],
      ];
      items.forEach(([ic, s1, col, y], i) => { b += pop(ic + text(110, 2, s1, { size: 37, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 210, y); });
      // 絵：3つの 地面
      let p = card(400, 400);
      [['すなば', RG.sandG, '#fbf3dc', 17, RG.sandG2], ['つち', RG.grain, '#f6ead6', 7, RG.grain2], ['みち', RG.asph, RG.asph, 0, RG.asph]].forEach(([nm, c1, bg, r, c2], i) => {
        const y = -150 + i * 122;
        p += `<clipPath id="lk${i}"><rect x="-170" y="${y}" width="210" height="96" rx="14"/></clipPath><g clip-path="url(#lk${i})"><rect x="-170" y="${y}" width="210" height="96" fill="${bg}"/>${r ? grainsG(-170, y, 210, 96, r, { c1, c2, seed: 80 + i }) : ''}</g><rect x="-170" y="${y}" width="210" height="96" rx="14" fill="none" stroke="${C.ink}" stroke-width="5"/>`;
        p += text(60, y + 28, nm, { size: 34, w: 900, anchor: 'start' }) + text(96, y + 72, '？', { size: 44, w: 900, fill: C.ochre });
      });
      b += pop(p, t, cue(1) + 0.4, 1660, 400);
      b += kidShow('K', t, 1660, 842, { s: 0.7, start: cue(3) + 0.3, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「あめと ゆき」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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

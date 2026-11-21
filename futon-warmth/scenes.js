// みのまわり図鑑 動画「おふとんは、どうして入ったときは冷たいのに、だんだんあったかくなるの？」
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
const TOPIC = 'ふとん';
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
// ---------- ふとんの道具 ----------
const SKIN = '#f6d6bd', SKIN2 = '#ecc0a2', HAIR = '#3a2a22';
const FT = {
  kake: '#f6d98b', kakeDk: '#dcb24c', kakeIn: '#fff6dc', shiki: '#fdfaf2', shikiDk: '#d3c9b2',
  pj: '#8fb8de', pjDk: '#6f9cc8', cold: '#7db4e6', coldDk: '#4f86c0', warm: '#ff9a4a', warmDk: '#e0703a',
  tatami: '#dfdbab', tatamiDk: '#c6c08a', heri: '#5f7f5a',
};
// 体温計の形の温度計（lv 0〜1 で赤い柱がのびる）
function thermo(x, y, lv, { s = 1, col = C.red } = {}) {
  let b = `<circle cx="0" cy="170" r="62" fill="#fff" stroke="${C.ink}" stroke-width="9"/><rect x="-36" y="-286" width="72" height="440" rx="36" fill="#fff" stroke="${C.ink}" stroke-width="9"/>`;
  b += `<circle cx="0" cy="170" r="53" fill="#fff"/><rect x="-27" y="-277" width="54" height="440" rx="27" fill="#fff"/>`;
  for (let k = 0; k < 9; k++) b += `<line x1="16" y1="${100 - k * 40}" x2="30" y2="${100 - k * 40}" stroke="#b9b2a2" stroke-width="5" stroke-linecap="round"/>`;
  const top = lerp(110, -250, clamp(lv));
  b += `<rect x="-18" y="${top}" width="36" height="${178 - top}" rx="18" fill="${col}"/><circle cx="0" cy="170" r="42" fill="${col}"/><circle cx="-14" cy="156" r="12" fill="#fff" opacity="0.45"/>`;
  return g(b, { x, y, s });
}
// 指し線つきのラベル
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` + g(badge(str, { fill: col, size }), { x: tx, y: ty }), { o });
};
// たたみ（上から見た部屋）
function tatamiBg() {
  let o = `<pattern id="tt" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${FT.tatami}"/><line x1="0" y1="8" x2="16" y2="8" stroke="${FT.tatamiDk}" stroke-width="2" opacity="0.6"/></pattern>`;
  o += `<rect width="1920" height="1080" fill="url(#tt)"/>`;
  o += `<rect x="150" y="0" width="26" height="1080" fill="${FT.heri}"/><rect x="1744" y="0" width="26" height="1080" fill="${FT.heri}"/>`;
  return o;
}
// たたみの床（横から見た絵の下の帯）
const floorBand = (y, col = FT.tatami) => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${col}"/><rect x="0" y="${y}" width="1920" height="10" fill="${FT.tatamiDk}"/>`;
// 夜の部屋（かべ・まど・ゆか）
function bedroom(floorY = 800) {
  let o = `<rect width="1920" height="1080" fill="#efe6d6"/>`;
  o += `<rect x="150" y="150" width="360" height="280" rx="16" fill="#2a3a5e"/>`;
  [[210, 210, 4], [300, 190, 3], [260, 300, 3], [330, 370, 4], [470, 230, 3], [200, 380, 3]].forEach(([x, y, r]) => { o += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.8"/>`; });
  o += `<path d="M 440 260 a 46 46 0 1 0 32 78 a 36 36 0 1 1 -32 -78 Z" fill="${C.yellow}"/>`;
  o += `<rect x="150" y="150" width="360" height="280" rx="16" fill="none" stroke="#d8c3a2" stroke-width="18"/><line x1="330" y1="150" x2="330" y2="430" stroke="#d8c3a2" stroke-width="12"/><line x1="150" y1="290" x2="510" y2="290" stroke="#d8c3a2" stroke-width="12"/>`;
  o += floorBand(floorY);
  return o;
}
// 上から見たふとん：under（敷きぶとんとまくら）→ 子ども → over（掛けぶとん）の順に重ねる。x は中心、y は上のはし
function futonTopUnder(x, y, s = 1) {
  let b = `<rect x="-300" y="0" width="600" height="780" rx="36" fill="${FT.shiki}" stroke="${FT.shikiDk}" stroke-width="8"/>`;
  b += `<rect x="-170" y="36" width="340" height="170" rx="46" fill="#fff" stroke="#cfe0ea" stroke-width="8"/>`;
  return g(b, { x, y, s });
}
function futonTopOver(x, y, s = 1, { tint = 0, dy = 0 } = {}) {
  let b = `<rect x="-330" y="240" width="660" height="570" rx="44" fill="${FT.kake}" stroke="${FT.kakeDk}" stroke-width="8"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) b += `<circle cx="${-240 + c * 120 + (r % 2 ? 0 : 0)}" cy="${420 + r * 100}" r="13" fill="#fff" opacity="0.75"/>`;
  b += `<rect x="-330" y="240" width="660" height="96" rx="40" fill="${FT.kakeIn}" stroke="${FT.kakeDk}" stroke-width="8"/>`;
  if (tint) b += `<rect x="-334" y="236" width="668" height="578" rx="46" fill="${tint < 0 ? FT.cold : FT.warm}" opacity="${Math.min(1, Math.abs(tint)) * 0.42}"/>`;
  return g(b, { x, y: y + dy, s });
}
// 上から見たふとんで、子どもの足もと（kidShow にわたす y）と大きさ
const topKid = (who, y, s) => { const ks = (who === 'S' ? 0.92 : 1.15) * s; return [y + 122 * s + KID_HEAD[who][2] * ks, ks]; };
// 小さなふとんの絵
const futonIcon = (s = 1) => g(`<rect x="-120" y="20" width="240" height="30" rx="14" fill="${FT.shiki}" stroke="${FT.shikiDk}" stroke-width="5"/><rect x="-108" y="-2" width="62" height="24" rx="12" fill="#fff" stroke="#cfe0ea" stroke-width="5"/><path d="M -50 22 C -50 -30 -20 -44 10 -44 L 70 -40 C 100 -38 116 -10 118 22 Z" fill="${FT.kake}" stroke="${FT.kakeDk}" stroke-width="5"/>`, { s });

// ----- 横から切って見たふとん -----
// (x, y) は「頭のまん中の x」と「床の y」。敷きぶとんは x-150 から x+950 まで（s=1 のとき）。h は敷きぶとんの厚み
const sidePt = (x, y, s, h, lx, ly) => [x + lx * s, y - h * s + ly * s];
function sideShiki(x, y, s, h, { wet = 0, pillow = 1 } = {}) {
  let b = `<rect x="-150" y="0" width="1100" height="${h}" rx="${Math.min(h / 2, 30)}" fill="${mix(FT.shiki, '#c4def0', wet * 0.8)}" stroke="${FT.shikiDk}" stroke-width="6"/>`;
  if (pillow > 0) b += g(`<rect x="-118" y="-30" width="214" height="42" rx="21" fill="#fff" stroke="#cfe0ea" stroke-width="6"/>`, { o: pillow });
  return `<g transform="translate(${x} ${y - h * s}) scale(${s})">${b}</g>`;
}
const KAKE_OUT = 'M 60 0 C 60 -120 90 -170 170 -170 L 720 -160 C 800 -158 880 -100 890 0 Z';
const KAKE_IN = 'M 100 0 C 100 -90 120 -128 180 -128 L 716 -120 C 780 -118 840 -80 848 0 Z';
// 掛けぶとん。warmIn: 中のあたたかさ、warmOut: ふとんそのもののあたたかさ（0 つめたい → 1 あたたかい）。flat: たたんだ形
function sideKake(x, y, s, h, { warmIn = 0, warmOut = 0, dy = 0, o = 1, flat = false } = {}) {
  if (o <= 0) return '';
  const band = mix(mix(FT.kake, '#bcd9ee', 0.45), mix(FT.kake, FT.warm, 0.55), warmOut);
  let b;
  if (flat) b = `<rect x="70" y="-46" width="840" height="46" rx="23" fill="${band}" stroke="${FT.kakeDk}" stroke-width="6"/>`;
  else b = `<path d="${KAKE_OUT}" fill="${band}" stroke="${FT.kakeDk}" stroke-width="6" stroke-linejoin="round"/><path d="${KAKE_IN}" fill="${mix('#dcebf6', '#ffd2a6', warmIn)}"/>`;
  return `<g transform="translate(${x} ${y - h * s + dy}) scale(${s})" opacity="${o}">${b}</g>`;
}
// ねている子（横から。頭が左、顔は上むき）
function lyingKid(x, y, s, h, t, { eyes = 'closed', mouth = 'smile', cold = 0, o = 1, glow = 0 } = {}) {
  if (o <= 0) return '';
  let b = '';
  // 立った形（右むき）で描いて、-90度まわす
  b += `<rect x="-44" y="360" width="88" height="410" rx="40" fill="${FT.pjDk}"/>`;
  b += `<ellipse cx="34" cy="772" rx="46" ry="26" fill="${SKIN}"/>`;
  b += `<rect x="-14" y="40" width="40" height="50" fill="${SKIN2}"/>`;
  b += `<rect x="-50" y="70" width="100" height="340" rx="46" fill="${FT.pj}"/>`;
  if (glow > 0) b += `<ellipse cx="0" cy="300" rx="${54 + 5 * Math.sin(t * 5)}" ry="${190 + 8 * Math.sin(t * 5)}" fill="${C.red}" opacity="${0.24 * glow}" filter="url(#soft)"/>`;
  b += `<rect x="-14" y="110" width="36" height="220" rx="18" fill="${mix(FT.pj, FT.pjDk, 0.5)}"/><circle cx="4" cy="338" r="17" fill="${SKIN}"/>`;
  b += `<circle cx="10" cy="0" r="60" fill="${SKIN}"/><circle cx="70" cy="6" r="9" fill="${SKIN}"/>`;
  b += `<path d="M 50 -46 Q 14 -76 -28 -52 Q -62 -22 -50 34 Q -34 22 -24 -6 Q -6 -30 50 -46 Z" fill="${HAIR}"/>`;
  b += `<ellipse cx="-8" cy="10" rx="10" ry="14" fill="${SKIN2}"/>`;
  b += `<circle cx="32" cy="20" r="13" fill="${mix('#f2a99a', '#8fbbe6', cold)}" opacity="0.7"/>`;
  if (eyes === 'closed') b += `<path d="M 30 -14 Q 40 -5 50 -14" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>`;
  else b += `<ellipse cx="42" cy="-12" rx="6.5" ry="9" fill="#3a2a22"/><circle cx="44" cy="-15" r="2.6" fill="#fff"/>`;
  if (mouth === 'smile') b += `<path d="M 46 28 Q 56 36 64 25" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>`;
  else b += `<path d="M 50 30 L 62 28" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y - h * s - 50 * s}) scale(${s}) rotate(-90)" opacity="${o}">${b}</g>`;
}
// 熱のつぶ（オレンジの玉）
const heatBall = (x, y, r = 11, o = 1) => o <= 0.01 ? '' : `<g opacity="${clamp(o)}"><circle cx="${x}" cy="${y}" r="${r * 1.9}" fill="${FT.warm}" opacity="0.35" filter="url(#soft)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ff7e3a"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.32}" fill="#fff" opacity="0.7"/></g>`;
// 空気のつぶ（temp 0 つめたい → 1 あたたかい）
function airBall(x, y, r, t, { temp = 0, i = 0, o = 1, face = true } = {}) {
  if (o <= 0.01) return '';
  const col = mix('#c9e6f8', '#ffa56a', temp), dk = mix('#7fb4d8', '#de6e38', temp);
  let b = `<circle r="${r}" fill="${col}" stroke="${dk}" stroke-width="${Math.max(2.5, r * 0.1)}"/><circle cx="${-r * 0.34}" cy="${-r * 0.36}" r="${r * 0.2}" fill="#fff" opacity="0.8"/>`;
  if (face && r > 14) {
    const bl = ((t + i * 0.7) % 4.2) < 0.14;
    b += bl ? `<path d="M ${-r * 0.4} ${-r * 0.02} h ${r * 0.24} M ${r * 0.16} ${-r * 0.02} h ${r * 0.24}" stroke="${C.ink}" stroke-width="${r * 0.09}" stroke-linecap="round"/>`
      : `<circle cx="${-r * 0.28}" cy="${-r * 0.02}" r="${r * 0.1}" fill="${C.ink}"/><circle cx="${r * 0.28}" cy="${-r * 0.02}" r="${r * 0.1}" fill="${C.ink}"/>`;
    b += `<path d="M ${-r * 0.18} ${r * 0.3} Q 0 ${r * 0.46} ${r * 0.18} ${r * 0.3}" fill="none" stroke="${C.ink}" stroke-width="${r * 0.08}" stroke-linecap="round"/>`;
  }
  return g(b, { x, y, o });
}
// ゆらゆら上がる熱の線
const heatLines = (x, y, t, o = 1, col = C.red, n = 3, gap = 36) => o <= 0 ? '' : g(Array.from({ length: n }, (_, i) =>
  `<path d="M ${(i - (n - 1) / 2) * gap} 0 q 12 -16 0 -32 q -12 -16 0 -32" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" opacity="${0.5 + 0.5 * Math.sin(t * 5 + i)}"/>`).join(''), { x, y, o });
// ふるえの線
const shakeLines = (x, y, h, t, o = 1, col = FT.coldDk, w = 30) => o <= 0 ? '' : g([-1, 1].map(sd =>
  `<path d="M ${sd * w} ${-h / 2} q ${sd * 14} ${h / 8} 0 ${h / 4} q ${-sd * 14} ${h / 8} 0 ${h / 4} q ${sd * 14} ${h / 8} 0 ${h / 4} q ${-sd * 14} ${h / 8} 0 ${h / 4}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" transform="translate(${sd * (8 + 4 * Math.sin(t * 30))} 0)"/>`).join(''), { x, y, o });
// 雪のしるし（つめたい）
const coldMark = (x, y, s, t, o = 1) => g(`<path d="M 0 -26 L 0 26 M -22 -13 L 22 13 M -22 13 L 22 -13" stroke="${FT.cold}" stroke-width="7" stroke-linecap="round"/>`, { x, y, s, o, r: t * 20 });
// しずく
const drop = (x, y, s = 1, o = 1, col = '#6fb1e6') => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -18 C 9 -4 13 2 13 8 A 13 13 0 0 1 -13 8 C -13 2 -9 -4 0 -18 Z" fill="${col}" opacity="${clamp(o)}"/>`;
// 矢印（下むきが 0 度）
const arrowDown = (x, y, len, o = 1, col = C.ink, r = 0) => g(`<path d="M 0 0 L 0 ${len} M -18 ${len - 20} L 0 ${len} L 18 ${len - 20}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, { x, y, o, r });

// 1. つかみ：ひやっ → ぽかぽか
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = tatamiBg();
    const FX = 960, FY = 96, FS = 0.9;
    const c0 = cue(0), c2 = cue(2), c3 = cue(3);
    const pull = eo(prog(t, c0 + 1.3, 0.9));                       // 掛けぶとんをかぶる
    const cold = prog(t, c0 + 2.4, 0.4) * (1 - prog(t, c2 + 0.8, 2.0));
    const warm = eio(prog(t, c2 + 1.4, 3.0));
    const shk = cold * Math.sin(t * 38) * 4;
    out += futonTopUnder(FX, FY, FS);
    const [footY, ks] = topKid('B', FY, FS);
    out += g(kidShow('B', t, FX, footY, { s: ks, start: 0, n: 0, enter: 'pop', act: 'nod', bubble: false, mouth: cold > 0.5 ? 'o' : null, eyes: warm > 0.6 ? 'smile' : cold > 0.5 ? 'wide' : 'open' }), { x: shk });
    out += futonTopOver(FX + shk, FY, FS, { tint: warm - cold, dy: (1 - pull) * 900 });
    // つめたい
    out += shakeLines(FX, FY + 330, 200, t, cold, FT.coldDk, 340);
    out += pop(text(0, 0, 'ひやっ', { size: 112, w: 900, fill: FT.coldDk }), t, c0 + 2.5, 430, 330, { end: c2 + 0.8 });
    [[420, 520, 1.3], [1500, 300, 1.5], [1440, 560, 1.1], [520, 690, 1.0]].forEach(([x, y, s], i) => { out += coldMark(x, y, s, t + i, cold); });
    out += talkBubble('B', FX + 350, FY + 70, FX + 92, FY + 122 * FS);
    // あったかい
    out += pop(text(0, 0, 'ぽかぽか', { size: 96, w: 900, fill: FT.warmDk }), t, c2 + 3.0, 1516, 330, { end: c3 + 0.2 });
    [[430, 480], [1480, 560], [470, 700]].forEach(([x, y], i) => { out += heatLines(x, y, t + i, warm * (1 - prog(t, c3 + 0.2, 0.4)), FT.warmDk); });
    out += g(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre }), { x: 1480, y: 380, o: win(t, c3 + 0.4, cueE(3) + 0.6, 0.3) });
    out += g(text(0, 0, '？', { size: 110, w: 900, fill: C.ochre }), { x: 440, y: 420, o: win(t, c3 + 1.0, cueE(3) + 0.6, 0.3), r: -12 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.accent}">おふとん</tspan>は どうして</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">だんだん <tspan fill="${FT.warmDk}">あったかく</tspan> なるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(futonIcon(1.5), { x: -70 }) + text(190, -10, '？', { size: 90, w: 900, fill: C.ochre }) + heatLines(-40, -80, t, 1, FT.warmDk), t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと思う？', { size: 84, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'からだの ねつが、ふとんの なかに たまるから'], ['②', 'ふとんが、じぶんで ねつを だすから'], ['③', 'ふとんが、へやの あたたかさを すいこむから']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 46, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(futonIcon(1.0) + text(96, -86, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 360);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 入る前のふとんは、部屋と同じ温度
const stoveIcon = () => `<rect x="-70" y="-90" width="140" height="170" rx="18" fill="#8a8f96"/><rect x="-52" y="-70" width="104" height="96" rx="10" fill="#3a3f45"/>` +
  [-30, 0, 30].map(dx => `<path d="M ${dx} 14 q -16 -26 0 -50 q 6 16 12 20 q 8 12 -12 30 Z" fill="#ff7e3a"/>`).join('') +
  `<rect x="-52" y="40" width="104" height="14" rx="7" fill="#5c6168"/><rect x="-60" y="80" width="26" height="16" rx="4" fill="#5c6168"/><rect x="34" y="80" width="26" height="16" rx="4" fill="#5c6168"/>`;
SCENES.push({
  id: 'before',
  draw(t) {
    const FL = 690;
    let out = bedroom(FL) + topBadge();
    const X = 230, Y = 806, S = 1.0, H = 80;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    out += sideShiki(X, Y, S, H) + sideKake(X, Y, S, H, { flat: true, warmOut: 0 });
    // 自分では熱を出さない
    const sO = win(t, c0 + 0.5, c1 - 0.2, 0.35);
    if (sO > 0) {
      out += g(stoveIcon() + g(cross(0, 0, 1.25, C.red), { o: prog(t, c0 + 1.6, 0.25), s: lerp(1.4, 1, eo(prog(t, c0 + 1.6, 0.3))) }), { x: 700, y: 500, o: sO, s: 1.1 });
      out += pop(badge('じぶんでは ねつを ださない', { fill: C.redUi, size: 46 }), t, c0 + 1.2, 1260, 420, { end: c1 - 0.2 });
    }
    // 部屋と同じ温度
    const lv = lerp(0.5, 0.2, eo(prog(t, c1 + 0.6, 1.2)));
    const cards = [['へや', 1240, c1 + 0.2], ['ふとん', 1620, c1 + 1.6]];
    cards.forEach(([name, x, st]) => {
      const o = prog(t, st, 0.4);
      if (o <= 0) return;
      out += g(card(300, 540) + text(0, -220, name, { size: 50, w: 900, fill: FT.coldDk }) + thermo(0, 40, name === 'へや' ? lv : 0.2, { s: 0.7, col: FT.coldDk }), { x, y: 400, o, s: lerp(0.94, 1, eo(o)) });
    });
    out += pop(`<circle r="46" fill="${C.ochre}"/>` + text(0, 0, '＝', { size: 60, w: 900, fill: '#fff' }), t, c1 + 2.6, 1430, 400);
    out += pop(badge('おなじ おんど', { fill: C.ochre, size: 46 }), t, c1 + 3.0, 1430, 740, { end: c2 - 0.2 });
    // 寒い部屋では、ふとんもつめたい
    const cO = prog(t, c1 + 5.2, 0.4) * (1 - prog(t, c2 - 0.2, 0.3));
    [[300, 600, 1.2], [650, 560, 1.0], [960, 600, 1.3]].forEach(([x, y, s], i) => { out += coldMark(x, y, s, t + i, cO); });
    out += pop(badge('つめたい', { fill: FT.coldDk, size: 46 }), t, c1 + 5.8, 650, 470, { end: c2 - 0.2 });
    // あたたかさは どこから？
    const qO = prog(t, c2 - 0.1, 0.4);
    if (qO > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.94 * qO}"/>`;
      out += g(futonIcon(2.6), { x: 820, y: 470, o: qO });
      out += pop(text(0, 0, '？', { size: 240, w: 900, fill: C.ochre }), t, c2 + 0.5, 1240, 420);
      out += pop(badge('あたたかさは どこから？', { fill: C.ochre, size: 54, pad: 44 }), t, c2 + 0.9, 960, 720);
    }
    return out;
  },
});

// 4. 熱を出しているのは体
SCENES.push({
  id: 'heater',
  draw(t) {
    const FL = 790;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + floorBand(FL) + topBadge();
    const X = 250, Y = FL + 24, S = 1.2, H = 70;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    const wi = eio(prog(t, c2 + 0.6, 4.6)), wo = eio(prog(t, c3 + 1.4, 3.6)) * 0.85;
    out += sideShiki(X, Y, S, H) + sideKake(X, Y, S, H, { warmIn: wi, warmOut: wo });
    out += lyingKid(X, Y, S, H, t, { eyes: 'closed', glow: prog(t, c0 + 0.8, 0.6) });
    // 体から出る熱のつぶ
    const hO = prog(t, c0 + 1.2, 0.5);
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.5 + i * 0.37) % 1;
      const [px, py] = sidePt(X, Y, S, H, 170 + i * 68 + Math.sin(t * 2 + i) * 6, -100 - ph * 24);
      out += heatBall(px, py, 11, hO * Math.min(1, (1 - ph) * 2.5));
    }
    out += callout(...sidePt(X, Y, S, H, 240, -60), 620, 330, 'からだが ねつを だす', prog(t, c0 + 1.6, 0.4) * (1 - prog(t, c2 - 0.2, 0.3)), { col: C.red, size: 46 });
    out += kidShow('S', t, 1720, 868, { s: 0.5, start: c1 - 0.9, n: 0, side: 'left', size: 40 });
    // 少しずつ あたたまる
    const gO = prog(t, c2 + 0.3, 0.5);
    if (gO > 0) {
      out += g(card(300, 500) + text(0, -200, 'ふとんの なか', { size: 38, w: 900, fill: C.red }) + thermo(0, 44, lerp(0.2, 0.72, wi), { s: 0.64 }), { x: 1600, y: 310, o: gO, s: lerp(0.94, 1, eo(gO)) });
      out += pop(badge('すこしずつ あたたまる', { fill: FT.warmDk, size: 46 }), t, c2 + 1.4, 760, 240, { end: c3 - 0.2 });
    }
    // 体に近いところほど はやい
    const [nx, ny] = sidePt(X, Y, S, H, 470, -112), [fx, fy] = sidePt(X, Y, S, H, 640, -146);
    out += callout(nx, ny, 480, 330, 'からだの ちかく：はやい', prog(t, c3 + 0.8, 0.4), { col: FT.warmDk, size: 42 });
    out += callout(fx, fy, 1080, 250, 'そとがわ：ゆっくり', prog(t, c3 + 2.4, 0.4), { col: FT.coldDk, size: 42 });
    return out;
  },
});

// 5. ふとんは熱をにがしにくくする
SCENES.push({
  id: 'keep',
  draw(t) {
    const FL = 800;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + floorBand(FL) + topBadge();
    const Y = FL + 24, S = 1.2, H = 70, XB = 480;
    const c0 = cue(0), c1 = cue(1);
    const k = eo(prog(t, c1 + 0.5, 1.0));                 // 掛けぶとんがかかる
    const cozy = prog(t, c1 + 1.6, 0.8);
    const shk = prog(t, c0 + 2.0, 0.4) * (1 - prog(t, c1 + 1.2, 0.5));
    const X = XB + shk * Math.sin(t * 38) * 3;
    out += sideShiki(XB, Y, S, H);
    out += sideKake(XB, Y, S, H, { warmIn: eio(prog(t, c1 + 1.4, 2.6)), warmOut: 0.3 * prog(t, c1 + 2.4, 2.6), dy: -(1 - k) * 760, o: prog(t, c1 + 0.4, 0.2) });
    out += lyingKid(X, Y, S, H, t, { eyes: cozy > 0.5 ? 'closed' : 'open', mouth: cozy > 0.5 ? 'smile' : 'flat', cold: shk, glow: 0.8 });
    // 熱のつぶ：何もないと上へにげる／ふとんがあると中にとどまる
    const hO = prog(t, c0 + 0.5, 0.5), rise = lerp(430, 22, k);
    for (let i = 0; i < 12; i++) {
      const ph = (t * 0.32 + i * 0.37) % 1;
      const [px, py] = sidePt(XB, Y, S, H, 150 + i * 54 + Math.sin(t * 1.6 + i) * lerp(26, 5, k), -100 - ph * rise);
      out += heatBall(px, py, 10, hO * lerp(Math.min(1, (1 - ph) * 2), Math.min(1, (1 - ph) * 3), k));
    }
    // にげていく矢印
    const aO = win(t, c0 + 1.4, c1 + 0.6, 0.4);
    [700, 920, 1140].forEach((x, i) => { out += arrowDown(x, 330 + Math.sin(t * 3 + i) * 8, 110, aO, C.red, 180 + (i - 1) * 16); });
    out += pop(badge('ねつが にげる', { fill: C.red, size: 50 }), t, c0 + 1.8, 1500, 300, { end: c1 + 0.6 });
    out += shakeLines(X, Y - H * S - 62 * S, 130, t, shk, FT.coldDk, 100);
    out += pop(badge('さむい…', { fill: FT.coldDk, size: 42 }), t, c0 + 3.2, 330, 540, { end: c1 + 1.0 });
    out += pop(badge('ねつを にがしにくい', { fill: C.accent, size: 52, pad: 40 }), t, c1 + 1.8, 960, 300);
    out += pop(badge('ぽかぽか', { fill: FT.warmDk, size: 42 }), t, c1 + 3.0, 330, 540);
    return out;
  },
});

// 6. 動かない空気
const WX0 = 180, WX1 = 1440, WY0 = 250, WY1 = 700, WCOL = 6, WROW = 3;
function wataFibers(o, t) {
  if (o <= 0.01) return '';
  const cw = (WX1 - WX0) / WCOL, ch = (WY1 - WY0) / WROW;
  let b = '';
  for (let i = 0; i < 40; i++) {
    const x = WX0 + 30 + rnd(i, 1) * (WX1 - WX0 - 60), y = WY0 + 24 + rnd(i, 2) * (WY1 - WY0 - 48), a = rnd(i, 3) * 6.28, L = 50 + rnd(i, 4) * 70;
    b += `<path d="M ${x - Math.cos(a) * L} ${y - Math.sin(a) * L} Q ${x + Math.sin(a) * 30} ${y - Math.cos(a) * 30} ${x + Math.cos(a) * L} ${y + Math.sin(a) * L}" fill="none" stroke="#e3d6b8" stroke-width="3" stroke-linecap="round"/>`;
  }
  for (let k = 1; k < WCOL; k++) {
    let d = `M ${WX0 + k * cw} ${WY0}`;
    for (let j = 0; j < 6; j++) d += ` q ${(j % 2 ? -1 : 1) * (12 + 6 * rnd(k, j))} ${(WY1 - WY0) / 12} 0 ${(WY1 - WY0) / 6}`;
    b += `<path d="${d}" fill="none" stroke="#c4a875" stroke-width="7" stroke-linecap="round"/>`;
  }
  for (let j = 1; j < WROW; j++) {
    let d = `M ${WX0} ${WY0 + j * ch}`;
    for (let k = 0; k < 12; k++) d += ` q ${(WX1 - WX0) / 24} ${(k % 2 ? -1 : 1) * (10 + 6 * rnd(j, k))} ${(WX1 - WX0) / 12} 0`;
    b += `<path d="${d}" fill="none" stroke="#c4a875" stroke-width="7" stroke-linecap="round"/>`;
  }
  return g(b, { o });
}
SCENES.push({
  id: 'air',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    const cw = (WX1 - WX0) / WCOL, ch = (WY1 - WY0) / WROW;
    // そと（つめたい）／わた／体のほう（あったかい）
    out += `<rect x="${WX0}" y="160" width="${WX1 - WX0}" height="100" rx="24" fill="#cfe4f5"/><rect x="${WX0}" y="690" width="${WX1 - WX0}" height="100" rx="24" fill="#ffd9b0"/>`;
    out += `<rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" fill="#fffdf4" stroke="${FT.kakeDk}" stroke-width="8"/>`;
    out += text(WX0 + 30, 205, 'そと（つめたい）', { size: 34, w: 900, fill: FT.coldDk, anchor: 'start' });
    out += text(WX0 + 30, 748, 'からだの ほう（あったかい）', { size: 34, w: 900, fill: C.redUi, anchor: 'start' });
    out += g(text(0, 0, 'かけぶとんの なか', { size: 34, w: 900, fill: C.ochre }), { x: 1690, y: 300, o: prog(t, 0.4, 0.4) });
    out += g(futonIcon(0.9), { x: 1690, y: 390, o: prog(t, 0.4, 0.4) });
    // 糸
    const fib = 1 - 0.92 * prog(t, c2 - 0.2, 0.7) * (1 - prog(t, c3 + 1.8, 1.2));
    out += wataFibers(fib, t);
    // 空気のつぶ
    const mv = eio(prog(t, c2 + 0.5, 0.9)) * (1 - eio(prog(t, c3 + 2.2, 1.6)));
    const grad = eio(prog(t, c1 + 0.8, 1.6));
    const bO = prog(t, c0 + 0.9, 0.5);
    for (let i = 0; i < WCOL * WROW; i++) {
      const col = i % WCOL, row = Math.floor(i / WCOL);
      const sx = WX0 + (col + 0.5) * cw + Math.sin(t * 2.3 + i * 1.7) * 5 * (1 - mv), sy = WY0 + (row + 0.5) * ch + Math.cos(t * 2.9 + i) * 4 * (1 - mv);
      const left = col < 3, k9 = (left ? col : col - 3) * 3 + row;
      const a = k9 / 9 * Math.PI * 2 + t * 1.15, rr = k9 % 2 ? 1 : 0.62;
      const cx = left ? WX0 + cw * 1.5 : WX1 - cw * 1.5, cy = (WY0 + WY1) / 2;
      const mx = cx + (left ? 1 : -1) * Math.cos(a) * 250 * rr, my = cy + Math.sin(a) * 165 * rr;
      const tempStill = lerp(0.1, [0.06, 0.34, 0.92][row], grad);
      const temp = lerp(tempStill, 0.5 - 0.5 * Math.cos(a), mv);
      out += airBall(lerp(sx, mx, mv), lerp(sy, my, mv), 40, t, { temp, i, o: bO });
    }
    // 体のほうから来る熱
    const hO = prog(t, c1 + 0.4, 0.5);
    for (let i = 0; i < 7; i++) out += heatLines(WX0 + 110 + i * 180, 700, t + i * 0.4, hO * 0.9, C.red, 2, 30);
    // 動くと、熱が外へ にげる
    for (let i = 0; i < 8; i++) {
      const ph = (t * 0.6 + i * 0.29) % 1;
      const x = (i % 2 ? WX1 - cw * 1.5 + 200 : WX0 + cw * 1.5 - 200) + Math.sin(i * 2.1) * 50;
      out += heatBall(x + Math.sin(t * 2 + i) * 8, 250 - ph * 100, 11, mv * (1 - ph));
    }
    // ラベル
    const TB = (s, col, st, en) => pop(badge(s, { fill: col, size: 46 }), t, st, 1000, 100, { end: en });
    out += TB('わたの すきまの くうき', C.blueUi, c0 + 1.4, c1 - 0.1);
    out += TB('くうきは ねつを つたえにくい', C.blueUi, c1 + 1.0, c2 - 0.3);
    out += TB('もし いとが なかったら…', C.muted, c2 + 0.2, c2 + 2.4);
    out += TB('うごくと ねつを はこんでしまう', C.red, c2 + 2.6, c3 - 0.1);
    out += TB('ほそい いとが、ちいさな へやに わける', C.ochre, c3 + 2.0, c4 - 0.1);
    out += TB('ねつを まもる「うごかない くうき」', C.accent, c4 + 0.6, 1e9);
    out += kidShow('K', t, 1740, 880, { s: 0.52, start: cue(5) - 0.9, n: 0, enter: 'slideR', act: 'nod', bubble: false });
    out += talkBubble('K', 1690, 630, 1688, 772, 38);
    return out;
  },
});

// 7. 家のかべの断熱材と、ダウン
function tangle(cx, cy, r, n, col = '#e0c98e', w = 5) {
  let b = '';
  for (let i = 0; i < n; i++) {
    const a = rnd(i, 11) * 6.28, d = rnd(i, 12) * r * 0.8, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, b2 = rnd(i, 13) * 6.28, L = r * (0.5 + rnd(i, 14) * 0.6);
    b += `<path d="M ${x - Math.cos(b2) * L} ${y - Math.sin(b2) * L} Q ${x + Math.sin(b2) * L * 0.6} ${y - Math.cos(b2) * L * 0.6} ${x + Math.cos(b2) * L} ${y + Math.sin(b2) * L}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return b;
}
function downBall(t) {
  let b = '';
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * 6.28 + rnd(i, 21) * 0.2, L = 130 + rnd(i, 22) * 70, sw = Math.sin(t * 1.6 + i) * 0.06;
    const ex = Math.cos(a + sw) * L, ey = Math.sin(a + sw) * L, mx = Math.cos(a + 0.35) * L * 0.55, my = Math.sin(a + 0.35) * L * 0.55;
    b += `<path d="M 0 0 Q ${mx} ${my} ${ex} ${ey}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    for (let j = 1; j <= 3; j++) {
      const k = j / 4, px = lerp(mx * 0.6, ex, k), py = lerp(my * 0.6, ey, k);
      b += `<path d="M ${px} ${py} l ${Math.cos(a + 1.1) * 26} ${Math.sin(a + 1.1) * 26} M ${px} ${py} l ${Math.cos(a - 1.1) * 26} ${Math.sin(a - 1.1) * 26}" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`;
    }
  }
  return b + `<circle r="12" fill="#f3ede0"/>`;
}
function dandelion(t) {
  let b = `<path d="M 0 30 Q 14 180 -6 330" fill="none" stroke="#6fa85a" stroke-width="12" stroke-linecap="round"/>`;
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * 6.28 + rnd(i, 31) * 0.15, L = 120 + rnd(i, 32) * 40, sw = Math.sin(t * 1.4 + i) * 0.04;
    const ex = Math.cos(a + sw) * L, ey = Math.sin(a + sw) * L;
    b += `<line x1="${Math.cos(a) * 26}" y1="${Math.sin(a) * 26}" x2="${ex}" y2="${ey}" stroke="#fff" stroke-width="3.5"/>`;
    for (let j = -2; j <= 2; j++) b += `<line x1="${ex}" y1="${ey}" x2="${ex + Math.cos(a + j * 0.5) * 30}" y2="${ey + Math.sin(a + j * 0.5) * 30}" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
    b += `<ellipse cx="${Math.cos(a) * 24}" cy="${Math.sin(a) * 24}" rx="7" ry="4" fill="#9a7438" transform="rotate(${a * 57.3} ${Math.cos(a) * 24} ${Math.sin(a) * 24})"/>`;
  }
  return b + `<circle r="22" fill="#d9c48e"/>`;
}
SCENES.push({
  id: 'same',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const aO = 1 - prog(t, c2 - 0.5, 0.5);
    if (aO > 0) {
      // 家（かべの中に断熱材）
      let a = `<path d="M 200 430 L 520 220 L 840 430 Z" fill="#c0624c"/>`;
      a += `<rect x="260" y="420" width="520" height="370" fill="#bfa77e"/><rect x="274" y="420" width="492" height="356" fill="#f6dc86"/>` + `<clipPath id="wl"><rect x="274" y="420" width="492" height="356"/></clipPath><g clip-path="url(#wl)">${tangle(520, 600, 330, 70, '#e2bf55', 4)}</g>`;
      a += `<rect x="318" y="464" width="404" height="312" fill="#fff8ea"/><rect x="304" y="450" width="432" height="14" fill="#bfa77e"/><rect x="304" y="464" width="14" height="312" fill="#bfa77e"/><rect x="722" y="464" width="14" height="312" fill="#bfa77e"/>`;
      a += `<rect x="440" y="520" width="160" height="130" rx="8" fill="#cfe8f6" stroke="#bfa77e" stroke-width="10"/><line x1="520" y1="520" x2="520" y2="650" stroke="#bfa77e" stroke-width="8"/>`;
      a += `<rect x="200" y="786" width="640" height="14" rx="7" fill="#a8946c"/>`;
      out += g(a, { o: aO * prog(t, 0.2, 0.4) });
      out += callout(296, 600, 420, 150, 'かべの なかの だんねつざい', aO * prog(t, c0 + 1.0, 0.4), { col: C.ochre, size: 42 });
      // 虫めがね：からみ合った糸と、動きにくい空気
      const mO = aO * prog(t, c0 + 2.2, 0.5);
      if (mO > 0) {
        const MX = 1250, MY = 480, R = 250;
        out += `<line x1="770" y1="610" x2="${MX - R + 10}" y2="${MY + 40}" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="14 10" opacity="${mO}"/>`;
        let m = `<rect x="${R * 0.62}" y="${R * 0.62}" width="50" height="190" rx="25" fill="${C.ochre}" transform="rotate(-45 ${R * 0.62} ${R * 0.62})"/>`;
        m += `<circle r="${R}" fill="#fffdf4"/><clipPath id="mg"><circle r="${R - 8}"/></clipPath><g clip-path="url(#mg)">${tangle(0, 0, R, 46, '#d9b95a', 7)}`;
        [[-120, -90], [40, -130], [140, -20], [-30, 10], [-150, 80], [70, 120], [-40, 160]].forEach(([x, y], i) => { m += airBall(x + Math.sin(t * 2.2 + i * 1.3) * 4, y + Math.cos(t * 2.6 + i) * 4, 38, t, { temp: 0.15, i }); });
        m += `</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="20"/>`;
        out += g(m, { x: MX, y: MY, o: mO, s: lerp(0.9, 1, eo(mO)) });
        out += pop(badge('ほそい いとが からみあう', { fill: C.ochre, size: 42 }), t, c1 + 0.4, 1250, 150, { end: c2 - 0.5 });
        out += pop(badge('うごきにくい くうき', { fill: C.blueUi, size: 46 }), t, c1 + 2.4, 1240, 790, { end: c2 - 0.5 });
      }
      out += pop(g(futonIcon(1.0), { y: -110 }) + badge('ふとんと おなじ', { fill: C.accent, size: 38 }), t, c0 + 3.0, 1740, 420, { end: c2 - 0.5 });
    }
    // ダウンと、たんぽぽのわた毛
    const bO = prog(t, c2 - 0.2, 0.5);
    if (bO > 0) {
      const R = 232, Y0 = 450;
      let b = `<circle cx="540" cy="${Y0}" r="${R}" fill="#cfe0ee"/><circle cx="1380" cy="${Y0}" r="${R}" fill="#cfe6d2"/>`;
      b += g(downBall(t), { x: 540, y: Y0, s: 0.95 });
      b += `<clipPath id="dd"><circle cx="1380" cy="${Y0}" r="${R}"/></clipPath><g clip-path="url(#dd)">${g(dandelion(t), { x: 1380, y: Y0 - 30, s: 1.0 })}</g>`;
      b += g(badge('ダウン', { fill: C.blueUi, size: 46 }), { x: 540, y: Y0 + R + 44 });
      b += g(badge('たんぽぽの わたげ', { fill: C.accent, size: 46 }), { x: 1380, y: Y0 + R + 44 });
      out += g(b, { o: bO });
      out += pop(badge('うもうぶとんの なか', { fill: C.ochre, size: 40 }), t, c2 + 0.3, 540, 150);
      out += pop(text(0, 0, 'にてる！', { size: 70, w: 900, fill: C.ochre }), t, c2 + 3.2, 960, 400);
      out += pop(`<path d="M -90 0 L 90 0 M -60 -26 L -90 0 L -60 26 M 60 -26 L 90 0 L 60 26" fill="none" stroke="${C.ochre}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, t, c2 + 3.2, 960, 490);
      // 空気をたっぷりかかえる
      const st = c2 + 6.6;
      [[-110, -80], [90, -110], [120, 60], [-60, 110], [-150, 20], [20, 150], [10, -20]].forEach(([x, y], i) => {
        const k = prog(t, st + i * 0.18, 0.4);
        out += g(airBall(0, 0, 30, t, { temp: 0.15, i }), { x: 540 + x + Math.sin(t * 2 + i) * 3, y: Y0 + y + Math.cos(t * 2.4 + i) * 3, s: Math.max(back(k), 0.001), o: Math.min(1, k * 3) });
      });
      out += pop(badge('かるいのに、くうきを たっぷり', { fill: C.blueUi, size: 46 }), t, st + 0.6, 1200, 150);
    }
    return out;
  },
});

// 8. ぺちゃんこのふとんは寒い
SCENES.push({
  id: 'flat',
  draw(t) {
    const FL = 800;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + floorBand(FL) + topBadge();
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    const X0 = 480, Y = FL + 24, S = 1.2;
    const sq = eio(prog(t, c2 + 1.0, 2.6)) * (1 - eio(prog(t, c4 + 1.6, 2.4)));   // つぶれる（1 でぺちゃんこ）
    const H = lerp(120, 52, sq);
    const sink = eio(prog(t, c1 + 0.6, 3.0));                                      // 湿気が下へ
    const dry = eio(prog(t, c4 + 1.0, 2.6));                                       // 干す
    const wet = sink * (1 - dry);
    const shk = prog(t, c3 + 0.6, 0.4) * (1 - prog(t, c4 - 0.4, 0.3));
    const X = X0 + shk * Math.sin(t * 38) * 3;
    const kidO = 1 - prog(t, c4 - 0.4, 0.5);
    out += sideShiki(X0, Y, S, H, { wet, pillow: kidO });
    // 敷きぶとんの中の空気
    for (let i = 0; i < 26; i++) {
      const row = i % 2, keep = i % 3 === 0;
      const [px, py] = sidePt(X0, Y, S, H, -110 + i * 40.5, lerp(row ? H * 0.72 : H * 0.28, H * 0.5, sq));
      out += airBall(px, py, 20, t, { temp: 0.12, i, face: false, o: keep ? 1 : 1 - sq });
    }
    out += sideKake(X, Y, S, H, { warmIn: lerp(1, 0.15, shk), warmOut: lerp(0.7, 0.1, shk), o: kidO });
    out += lyingKid(X, Y, S, H, t, { eyes: shk > 0.5 ? 'open' : 'closed', mouth: shk > 0.5 ? 'flat' : 'smile', cold: shk, o: kidO });
    // あせや湿気：体から出て、下の敷きぶとんへ
    const dO = prog(t, c0 + 1.0, 0.5);
    for (let i = 0; i < 9; i++) {
      const lx = 170 + i * 68, k = eio(prog(t, c1 + 0.6 + i * 0.12, 2.2));
      const ly = lerp(-112 - Math.abs(Math.sin(t * 2 + i)) * 8, H * (0.3 + 0.4 * rnd(i, 5)), k) - dry * (220 + i * 14);
      const [px, py] = sidePt(X0, Y, S, H, lx, ly);
      out += drop(px, py, 1.2, dO * (1 - dry * 1.15));
    }
    out += pop(badge('あせや しめりけ', { fill: FT.coldDk, size: 48 }), t, c0 + 1.6, 960, 300, { end: c1 - 0.1 });
    out += pop(badge('したの しきぶとんへ', { fill: FT.coldDk, size: 48 }), t, c1 + 0.8, 960, 300, { end: c2 - 0.1 });
    [190, 1730].forEach((x, i) => { out += arrowDown(x, 560 + Math.sin(t * 3 + i) * 8, 110, win(t, c1 + 1.0, c2 - 0.1, 0.4), FT.coldDk); });
    out += pop(badge('しめって つぶれる', { fill: C.ochre, size: 48 }), t, c2 + 0.8, 760, 300, { end: c3 - 0.1 });
    out += pop(badge('くうきが へる', { fill: C.blueUi, size: 48 }), t, c2 + 3.4, 1260, 300, { end: c3 - 0.1 });
    out += pop(badge('ぺちゃんこ ＝ くうきが すくない', { fill: C.blueUi, size: 48 }), t, c3 + 0.4, 960, 250, { end: c4 - 0.3 });
    out += shakeLines(X, Y - H * S - 62 * S, 130, t, shk, FT.coldDk, 100);
    out += pop(badge('さむい…', { fill: FT.coldDk, size: 44 }), t, c3 + 2.2, 330, 560, { end: c4 - 0.3 });
    // 干すと、またふくらむ
    const sO = prog(t, c4 + 0.2, 0.6);
    if (sO > 0) {
      out += g(sunDisc(0, 0, 90, 0.15), { x: 1560, y: lerp(120, 300, eo(sO)), o: sO });
      for (let i = 0; i < 5; i++) out += heatLines(420 + i * 250, 560 - 20 * (i % 2), t + i * 0.5, sO * (1 - prog(t, c4 + 4.4, 0.6)), FT.warmDk, 2, 34);
      out += pop(badge('ほすと、また ふくらむ', { fill: FT.warmDk, size: 52, pad: 40 }), t, c4 + 1.6, 900, 300);
    }
    return out;
  },
});

// 9. 答え と みてみよう
function shikiLook(t, o) {
  // まん中がへこんだ敷きぶとんを、横から、目の高さで見る
  let b = `<rect x="-330" y="96" width="660" height="14" rx="7" fill="${FT.tatamiDk}"/>`;
  b += `<path d="M -280 96 L -280 0 Q -280 -24 -256 -24 Q -130 -26 0 4 Q 130 -26 256 -24 Q 280 -24 280 0 L 280 96 Z" fill="${FT.shiki}" stroke="${FT.shikiDk}" stroke-width="7" stroke-linejoin="round"/>`;
  const br = (x, y0, y1, col) => `<path d="M ${x - 16} ${y0} L ${x + 16} ${y0} M ${x} ${y0} L ${x} ${y1} M ${x - 16} ${y1} L ${x + 16} ${y1}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`;
  b += g(br(-236, -22, 94, C.accent) + text(-236, -62, 'はし', { size: 40, w: 900, fill: C.accent }), { o: prog(t, cue(2) + 2.6, 0.4) });
  b += g(br(0, 8, 94, C.redUi) + text(0, -40, 'まんなか', { size: 40, w: 900, fill: C.redUi }), { o: prog(t, cue(2) + 1.2, 0.4) });
  b += g(text(120, -84, '？', { size: 80, w: 900, fill: C.ochre }), { o: prog(t, cue(3) + 0.4, 0.3) });
  return g(b, { o });
}
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -580;
      let a = pop(card(1340, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'からだの ねつが、ふとんの なかに たまるから', { size: 50, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['ねつを だすのは からだ', C.red], ['うごかない くうきが まもる', C.blueUi], ['ぺちゃんこは さむい', FT.coldDk]], t, 960, 600, { start: 2.4, step: 0.9, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [g(eyeIcon(0.3)), 'しきぶとんを よこから、めの たかさで', C.ink, cue(1)],
        [`<path d="M -34 -22 L 34 -22 M 0 -22 L 0 22 M -34 22 L 34 22" fill="none" stroke="${C.redUi}" stroke-width="9" stroke-linecap="round"/>`, 'まんなかと はしの あつさを くらべる', C.ink, cue(2)],
        [airBall(0, 0, 32, t, { temp: 0.12 }), 'うすい ところは、くうきが すくない', C.blueUi, cue(3) + 3.4],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(g(icn, { s: 0.9 }) + text(70, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, st, 150, 350 + i * 140); });
      // 敷きぶとんと、横から見る目
      const mO = prog(t, cue(1) + 0.5, 0.5);
      if (mO > 0) {
        b += g(shikiLook(t, 1), { x: 1480, y: 470, o: mO, s: 1.2 * lerp(0.9, 1, eo(mO)) });
        const eO = prog(t, cue(1) + 2.0, 0.4);
        b += g(eyeIcon(0.4), { x: 1062, y: 528, o: eO });
        b += `<line x1="1120" y1="528" x2="1850" y2="528" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 10" opacity="${eO * 0.8}"/>`;
        b += pop(badge('よそうしてから みてね', { fill: C.ochre, size: 42 }), t, cue(3) + 0.6, 1340, 710);
      }
      b += kidShow('K', t, 1780, 800, { s: 0.5, start: cue(1) + 0.8, n: 1, enter: 'slideR', bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ふとん」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
